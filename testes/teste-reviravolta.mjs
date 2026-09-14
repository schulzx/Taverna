/* AS REVIRAVOLTAS (v9.203) — a verdade escondida na criação

   A primeira, ponta a ponta: a máscara do aliado. Esta suíte guarda as
   quatro leis que o documento pôs sobre ela: eleição determinística;
   sementes plantadas no Livro; a revelação NÃO cai antes de três
   sementes maduras; e o Narrador descobre junto — a verdade nunca vaza
   antes do turno da revelação. */

const RAIZ = "../src/";
const R = await import(RAIZ + "reviravoltas.js");
const P = await import(RAIZ + "promessas.js");
/* `readdirSync` entrou em v9.230 (R4): a prova-âncora de `fecharAto`
   (seção 10d) varre a pasta `src/` inteira atrás de um chamador, e varrer
   por lista escrita à mão é a mesma doença de "export morto mente" — o
   arquivo novo entraria sem ser olhado. */
const { readFileSync, readdirSync } = await import("node:fs");
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
  /* v9.229 (R3) — A ÂNCORA MUDOU, E O MOTIVO FICA ESCRITO. A asserção
     antiga era `/podeRevelar\(rev\.forma/`: ela guardava que o App
     perguntava a catraca do Livro com a FORMA ELEITA na mão, e era assim
     que a pergunta existia — uma virada, uma pergunta. R3 pôs duas
     viradas no mesmo mundo, e a pergunta passou a ser "de quem é a vez?",
     que só tem UMA resposta; exigir a pergunta antiga de volta seria
     exigir de volta o turno em que as duas podem estourar juntas. No
     lugar dela, as duas asserções que guardam o mesmo ganho: o ciclo de
     uma virada continua genérico por forma, e a revelação sai de uma
     pergunta só. */
  t("o ciclo de uma virada é genérico por forma (semeia e rega por rev.forma)",
    /mexerNaReviravolta/.test(APP) && /sementesDaReviravolta\(rev\.forma/.test(APP) && /diasEntreRegasDe\(rev\.forma\)/.test(APP));
  t("e a revelação sai de UMA pergunta, não de uma por virada",
    /quemPodeRevelar\(/.test(APP) && !/podeRevelar\(rev\.forma/.test(APP));
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

/* ============================================================
   9. R3 (v9.229) — A MAIOR ENFIM ACONTECE

   Até aqui havia uma virada por campanha na prática: `elegerReviravoltas`
   devolvia `{ menor, maior }` e só a menor era vivida. As três maiores
   ganharam detector em R2 e continuaram inertes — acervo escrito que não
   pode acontecer, que é o bug de sempre com roupa de enredo.

   Ligar a segunda virada é escrever uma REGRA DE CONVIVÊNCIA, e é ela
   que esta seção prova. Oito leis, e cada uma tem o seu bloco:

     ① as duas não estouram na mesma cena   (9d, exaustivo)
     ② a maior semeia antes de abrir        (9e)
     ③ a menor vem primeiro — e a espera é finita (9f)
     ④ não atropela episódio aberto         (9g)
     ⑤ nunca o mesmo alvo                   (9h, e a tranca simétrica em 9h2/9h3)
     ⑥ determinismo por semente             (9i)
     ⑦ o Narrador não vê antes da revelação (9k)
     ⑧ regressão zero da menor              (9, 9b, e a varredura de 9g)

   E ELAS SÃO A CATRACA DO EXPORT MORTO. `maiorPodeNascer` e
   `menorPodeNascer` passam no `teste-ligacao` por falso positivo — o
   varredor conta a menção dos dois nomes num comentário de
   `quemPodeRevelar`. Os leitores de verdade são este arquivo e o App; sem
   eles a regra nasceria sem prova e ninguém avisaria.
   ============================================================ */
const EP = await import(RAIZ + "episodios.js");

const MENORES = R.FORMAS.filter((f) => f.porte === "menor").map((f) => f.id);
const MAIORES = R.FORMAS.filter((f) => f.porte === "maior").map((f) => f.id);
/* as duas cobaias das leis: as duas de colheita PESADA (três sementes,
   três maduras para colher), que é o caso mais exigente das duas pontas */
const MENOR = "aliado_agente";
const MAIOR = "contratante_servia";

/* planta as sementes de uma forma no Livro, com dona "reviravolta" e
   alvo — exatamente como o App as planta — e rega até madurarem. As
   sementes das reviravoltas são todas LEVES: uma rega basta para cada. */
const semearNo = (L, forma, alvo, { maduras = true, quantas = Infinity, dia = 1 } = {}) => {
  let i = 0;
  for (const spec of R.sementesDaReviravolta(forma, { alvo })) {
    const r = P.semear(L, spec);
    L = r.livro;
    if (maduras && i < quantas) L = P.regar(L, r.semente.id, { dia }).livro;
    i++;
  }
  return L;
};
/* um Livro montado a partir de vários plantios: é assim que as sementes
   das duas viradas convivem no MESMO Livro, que é o caso real */
const livroDe = (...plantios) => plantios.reduce((L, p) => semearNo(L, p.forma, p.alvo, p), P.garantirLivro(null));

sec("9. R3 — a tabela do ritmo (LEI 8: regressão zero da menor)");
{
  const T = R.RITMO_DAS_VIRADAS;
  t("RITMO_DAS_VIRADAS é tabela, com as três linhas do ritmo",
    !!T && !!T.diasEntreRegas && typeof T.folgaEntreViradas === "number" && typeof T.diasDeEsperaPelaMenor === "number");
  t("a tabela tem um ritmo para cada porte, e só para eles",
    R.PORTES.every((p) => typeof T.diasEntreRegas[p] === "number") && Object.keys(T.diasEntreRegas).length === R.PORTES.length);
  /* REGRESSÃO ZERO, literal: o três da menor é o mesmo três de v9.228 —
     só mudou de casa. Mexer nele muda o ritmo de toda campanha viva. */
  t("o ritmo da menor continua 3 (o mesmo número de v9.228)", T.diasEntreRegas.menor === 3);
  t("DIAS_ENTRE_REGAS continua 3 e LÊ a tabela (não é uma segunda cópia do três)",
    R.DIAS_ENTRE_REGAS === 3 && R.DIAS_ENTRE_REGAS === T.diasEntreRegas.menor);
  t("a maior rega no dobro do tempo da menor", T.diasEntreRegas.maior === 6 && T.diasEntreRegas.maior === 2 * T.diasEntreRegas.menor);

  /* O PORQUÊ DO SEIS, lido de volta das DUAS tabelas e nunca copiado: o
     amadurecimento inteiro da maior tem de passar do episódio mais longo
     do catálogo. Se não passasse, a lei ④ ("adia a maior enquanto houver
     episódio aberto") seria um cancelamento disfarçado — o defeito de R2
     com outra roupa. Se alguém encurtar o ritmo da maior, ou criar um
     episódio de seis marcos, esta asserção acusa. */
  const marcosDoMaisLongo = Math.max(...EP.EPISODIOS.map((e) => e.marcos.length));
  const episodioMaisLongo = marcosDoMaisLongo * EP.DIAS_ENTRE_MARCOS;
  const sementesDaMaior = Math.max(...MAIORES.map((id) => R.formaPorId(id).sementes.length));
  const amadurecimentoDaMaior = sementesDaMaior * T.diasEntreRegas.maior;
  t(`o amadurecimento da maior (${amadurecimentoDaMaior}d) passa do episódio mais longo (${episodioMaisLongo}d) — adiar não é cancelar`,
    amadurecimentoDaMaior > episodioMaisLongo, `${sementesDaMaior} sementes × ${T.diasEntreRegas.maior}d vs ${marcosDoMaisLongo} marcos × ${EP.DIAS_ENTRE_MARCOS}d`);

  t("a folga entre viradas é um marco de episódio (o mundo vive uma batida inteira)",
    T.folgaEntreViradas === 3 && T.folgaEntreViradas === EP.DIAS_ENTRE_MARCOS);
  t("a espera pela menor é o amadurecimento INTEIRO dela (3 sementes × 3 dias)",
    T.diasDeEsperaPelaMenor === 9 && T.diasDeEsperaPelaMenor === R.formaPorId(MENOR).sementes.length * T.diasEntreRegas.menor);
}

sec("9b. diasEntreRegasDe: o ritmo pela forma, sem o chamador saber o porte");
{
  const erradas = MENORES.filter((id) => R.diasEntreRegasDe(id) !== R.DIAS_ENTRE_REGAS);
  t("TODA menor rega no ritmo de sempre (regressão zero, forma a forma)", erradas.length === 0, erradas.join(", "));
  const errMaior = MAIORES.filter((id) => R.diasEntreRegasDe(id) !== R.RITMO_DAS_VIRADAS.diasEntreRegas.maior);
  t("TODA maior rega no ritmo do arco", errMaior.length === 0, errMaior.join(", "));
  /* forma nova entra classificada: se uma forma ganhar um porte que a
     tabela não prevê, o ritmo dela cai fora da faixa e quebra aqui */
  t("nenhuma forma rega fora da faixa da tabela",
    R.FORMAS.every((f) => { const d = R.diasEntreRegasDe(f.id); return d >= R.DIAS_ENTRE_REGAS && d <= R.RITMO_DAS_VIRADAS.diasEntreRegas.maior; }));
  /* o lixo cai no ritmo CONSERVADOR: regar mais cedo não revela mais
     cedo — quem decide isso é a catraca do Livro */
  for (const [rotulo, x] of [["null", null], ["undefined", undefined], ["forma que não existe", "forma_que_nao_existe"], ["número", 7], ["objeto", {}], ["string vazia", ""]])
    t(`${rotulo}: cai no ritmo da menor (o conservador)`, R.diasEntreRegasDe(x) === R.DIAS_ENTRE_REGAS);
}

sec("9c. garantirReviravolta ganhou reveladaEm (e o save antigo não é punido)");
{
  t("reveladaEm sai saneado de string", R.garantirReviravolta({ forma: MENOR, reveladaEm: "12" }).reveladaEm === 12);
  t("negativo vira 0", R.garantirReviravolta({ forma: MENOR, reveladaEm: -5 }).reveladaEm === 0);
  t("lixo vira 0", R.garantirReviravolta({ forma: MENOR, reveladaEm: "ontem" }).reveladaEm === 0 && R.garantirReviravolta({ forma: MENOR, reveladaEm: null }).reveladaEm === 0);
  /* SAVE ANTIGO: não tem o campo e cai em 0. O comportamento que isso
     compra se prova em 9f — folga vencida em qualquer dia útil. */
  t("save de antes do campo: reveladaEm 0", R.garantirReviravolta({ forma: MENOR, alvo: "Ume", revelada: true }).reveladaEm === 0);
  t("e os campos antigos continuam inteiros ao lado dele", (() => {
    const g = R.garantirReviravolta({ forma: MENOR, alvo: "Ume", semeada: 1, regadaEm: "5", eleitaEm: 2, revelada: 1, reveladaEm: 8 });
    return g.forma === MENOR && g.alvo === "Ume" && g.semeada === true && g.regadaEm === 5 && g.eleitaEm === 2 && g.revelada === true && g.reveladaEm === 8;
  })());
}

sec("9d. LEI 1 — as duas não estouram na mesma cena (exaustivo sobre o estado)");
{
  const A = "Ume", B = "Halvard";
  /* Cada eixo é um ESTADO REAL DO SAVE, e não um exemplo: a virada não
     eleita, a eleita com sementes verdes, a eleita madura, e a já caída
     — nas três grafias de `reveladaEm` que existem em disco (save antigo
     sem campo, caída hoje, caída há muito). O produto dos eixos é a
     prova: não há entrada em que a resposta caiba para as duas. */
  const eixoMenor = [
    { rotulo: "não eleita", rev: () => null, planta: null },
    { rotulo: "eleita, sementes verdes", rev: () => ({ forma: MENOR, alvo: A }), planta: { maduras: false } },
    { rotulo: "eleita, meio madura", rev: () => ({ forma: MENOR, alvo: A }), planta: { quantas: 2 } },
    { rotulo: "eleita, madura", rev: () => ({ forma: MENOR, alvo: A }), planta: {} },
    { rotulo: "revelada (save antigo, sem reveladaEm)", rev: () => ({ forma: MENOR, alvo: A, revelada: true }), planta: {} },
    { rotulo: "revelada hoje", rev: (dia) => ({ forma: MENOR, alvo: A, revelada: true, reveladaEm: dia }), planta: {} },
    { rotulo: "revelada há muito", rev: () => ({ forma: MENOR, alvo: A, revelada: true, reveladaEm: 1 }), planta: {} },
  ];
  const eixoMaior = (alvo) => [
    { rotulo: "não eleita", rev: () => null, planta: null },
    { rotulo: "eleita, sementes verdes", rev: () => ({ forma: MAIOR, alvo }), planta: { maduras: false } },
    { rotulo: "eleita, madura", rev: () => ({ forma: MAIOR, alvo }), planta: {} },
    { rotulo: "revelada", rev: () => ({ forma: MAIOR, alvo, revelada: true, reveladaEm: 1 }), planta: {} },
  ];

  let casos = 0, ambasAptas = 0;
  const foraDoAlfabeto = [], semMotivo = [], mentiuMenor = [], mentiuMaior = [], preferiuAMaior = [], instaveis = [];
  for (const [rotuloAlvo, alvoMaior] of [["alvos diferentes", B], ["MESMO alvo da menor", A]]) {
    for (const em of eixoMenor) {
      for (const ma of eixoMaior(alvoMaior)) {
        for (const episodioAberto of [false, true]) {
          for (const dia of [0, 1, 3, 9, 20]) {
            const plantios = [];
            if (em.planta) plantios.push({ forma: MENOR, alvo: A, ...em.planta });
            if (ma.planta) plantios.push({ forma: MAIOR, alvo: alvoMaior, ...ma.planta });
            const livro = livroDe(...plantios);
            const menor = em.rev(dia), maior = ma.rev(dia);
            const caso = `${rotuloAlvo} · menor ${em.rotulo} · maior ${ma.rotulo} · ep=${episodioAberto} · dia=${dia}`;
            casos++;

            const v = R.quemPodeRevelar({ menor, maior, livro, episodioAberto, dia });
            const v2 = R.quemPodeRevelar({ menor, maior, livro, episodioAberto, dia });
            if (JSON.stringify(v) !== JSON.stringify(v2)) instaveis.push(caso);
            if (!["menor", "maior", ""].includes(v.quem)) foraDoAlfabeto.push(caso + " → " + JSON.stringify(v.quem));
            if (typeof v.motivo !== "string" || !v.motivo) semMotivo.push(caso);

            /* A APTIDÃO DE CADA UMA, medida por fora e pela catraca do
               Livro — é o que torna a prova não-circular */
            const menorApta = !!menor && !menor.revelada && R.podeRevelar(MENOR, livro, { alvo: A });
            const maiorApta = !!maior && !maior.revelada && R.podeRevelar(MAIOR, livro, { alvo: alvoMaior });
            if (v.quem === "menor" && !menorApta) mentiuMenor.push(caso);
            if (v.quem === "maior" && !maiorApta) mentiuMaior.push(caso);
            if (menorApta && maiorApta) {
              ambasAptas++;
              /* AS DUAS CABERIAM, E SÓ UMA SAI. É a lei ① em forma de
                 conta: a resposta é um NOME, nunca um par, e quando as
                 duas estão maduras a vez é sempre da menor. */
              if (v.quem !== "menor") preferiuAMaior.push(caso + " → " + v.quem);
            }
          }
        }
      }
    }
  }
  console.log(`      ${casos} combinações de estado · ${ambasAptas} em que as DUAS caberiam`);
  t(`a resposta é sempre UM nome de ${casos} combinações ("menor", "maior" ou "")`, foraDoAlfabeto.length === 0, foraDoAlfabeto.slice(0, 3).join(" · "));
  t("toda resposta vem com motivo escrito (o bastidor da suíte)", semMotivo.length === 0, semMotivo.slice(0, 3).join(" · "));
  t("a mesma entrada dá sempre a mesma resposta", instaveis.length === 0, instaveis.slice(0, 3).join(" · "));
  t("quando diz 'menor', a menor pode mesmo revelar agora", mentiuMenor.length === 0, mentiuMenor.slice(0, 3).join(" · "));
  t("quando diz 'maior', a maior pode mesmo revelar agora", mentiuMaior.length === 0, mentiuMaior.slice(0, 3).join(" · "));
  /* a prova não pode ser vazia: se nunca houvesse caso em que as duas
     cabem, o exaustivo acima não estaria provando nada */
  t("existem combinações em que as duas caberiam (a prova não é vazia)", ambasAptas > 0, String(ambasAptas));
  t("e em TODAS elas sai a menor — as duas nunca estouram na mesma cena", preferiuAMaior.length === 0, preferiuAMaior.slice(0, 3).join(" · "));
}

sec("9e. LEI 2 — a maior semeia antes de abrir (e a catraca dela é por alvo)");
{
  /* o cenário base de toda esta seção: a menor já caiu há muito (ramos ②
     e ③ vencidos), sem episódio aberto, folga vencida — de modo que a
     ÚNICA coisa que pode fechar a maior é a catraca do Livro */
  const menorCaida = { forma: MENOR, alvo: "Ume", revelada: true, reveladaEm: 1 };
  const maior = { forma: MAIOR, alvo: "Halvard" };
  const pergunta = (livro) => R.quemPodeRevelar({ menor: menorCaida, maior, livro, episodioAberto: false, dia: 30 });

  t("Livro vazio: a maior não abre", pergunta(P.garantirLivro(null)).quem === "");
  t("Livro null: a maior não abre (e não estoura)", pergunta(null).quem === "");
  t("sementes semeadas e nunca regadas: a maior não abre", pergunta(livroDe({ forma: MAIOR, alvo: "Halvard", maduras: false })).quem === "");
  t("duas das três maduras: ainda não (a colheita da maior é pesada)", pergunta(livroDe({ forma: MAIOR, alvo: "Halvard", quantas: 2 })).quem === "");
  const cheio = livroDe({ forma: MAIOR, alvo: "Halvard" });
  t("três maduras: A MAIOR ENFIM ACONTECE", pergunta(cheio).quem === "maior", pergunta(cheio).motivo);
  t("e a recusa por imaturidade nomeia as sementes no motivo", /semente/i.test(pergunta(P.garantirLivro(null)).motivo), pergunta(P.garantirLivro(null)).motivo);

  /* A SEPARAÇÃO POR ALVO. `podeColher` filtra `dona` + `alvo`, e a dona é
     "reviravolta" nas DUAS viradas — é só o alvo que as separa no Livro.
     Um Livro com as três maduras da MENOR não paga um grão da catraca da
     maior; se pagasse, a maior colheria o que a menor plantou e a
     catraca estaria pagando com dinheiro alheio. */
  const soDaMenor = livroDe({ forma: MENOR, alvo: "Ume" });
  t("as três maduras da menor NÃO abrem a maior (a catraca é dona+alvo)", pergunta(soDaMenor).quem === "");
  t("e essas mesmas três continuam bastando para a própria menor", R.podeRevelar(MENOR, soDaMenor, { alvo: "Ume" }));
  t("a catraca da maior, no mesmo Livro, continua fechada", !R.podeRevelar(MAIOR, soDaMenor, { alvo: "Halvard" }));
  /* nem uma mistura generosa abre: seis maduras, todas de outros alvos */
  const alheias = livroDe({ forma: MENOR, alvo: "Ume" }, { forma: MAIOR, alvo: "Brida" });
  t("seis maduras de outros alvos não abrem a maior", pergunta(alheias).quem === "", JSON.stringify(pergunta(alheias)));
  t("e bastam as três do alvo CERTO, no meio das alheias",
    pergunta(livroDe({ forma: MENOR, alvo: "Ume" }, { forma: MAIOR, alvo: "Brida" }, { forma: MAIOR, alvo: "Halvard" })).quem === "maior");

  /* a catraca vale para TODA maior da prateleira, não só para a cobaia */
  const frouxas = MAIORES.filter((id) => R.quemPodeRevelar({ menor: menorCaida, maior: { forma: id, alvo: "Halvard" }, livro: P.garantirLivro(null), dia: 30 }).quem !== "");
  t("nenhuma das três maiores abre com o Livro vazio", frouxas.length === 0, frouxas.join(", "));
  const travadas = MAIORES.filter((id) => R.quemPodeRevelar({ menor: menorCaida, maior: { forma: id, alvo: "Halvard" }, livro: livroDe({ forma: id, alvo: "Halvard" }), dia: 30 }).quem !== "maior");
  t("e as TRÊS abrem com as próprias sementes maduras (nenhuma é inerte)", travadas.length === 0, travadas.join(", "));
}

sec("9f. LEI 3 — a menor vem primeiro, e a espera por ela é finita");
{
  const maior = { forma: MAIOR, alvo: "Halvard" };
  const soDaMaior = livroDe({ forma: MAIOR, alvo: "Halvard" });
  const tudoMaduro = livroDe({ forma: MENOR, alvo: "Ume" }, { forma: MAIOR, alvo: "Halvard" });

  const emCurso = R.quemPodeRevelar({ menor: { forma: MENOR, alvo: "Ume" }, maior, livro: soDaMaior, dia: 30 });
  t("menor eleita e ainda não revelada: a maior não cai por cima dela", emCurso.quem === "", JSON.stringify(emCurso));
  t("e o motivo diz que a menor está em curso", /menor/i.test(emCurso.motivo), emCurso.motivo);
  t("sem menor eleita, a maior madura cai sozinha", R.quemPodeRevelar({ menor: null, maior, livro: soDaMaior, dia: 30 }).quem === "maior");
  t("as duas maduras: a menor passa na frente", R.quemPodeRevelar({ menor: { forma: MENOR, alvo: "Ume" }, maior, livro: tudoMaduro, dia: 30 }).quem === "menor");
  t("caída a menor, a vez passa para a maior", R.quemPodeRevelar({ menor: { forma: MENOR, alvo: "Ume", revelada: true, reveladaEm: 1 }, maior, livro: tudoMaduro, dia: 30 }).quem === "maior");

  /* A FOLGA entre uma virada e a seguinte: o mundo vive uma batida
     inteira do `oDiaSeguinte` da primeira antes de a segunda cair */
  const FOLGA = R.RITMO_DAS_VIRADAS.folgaEntreViradas;
  const caiuNoDia10 = { forma: MENOR, alvo: "Ume", revelada: true, reveladaEm: 10 };
  const colados = [], espacados = [];
  for (let d = 10; d <= 10 + FOLGA + 2; d++)
    (R.quemPodeRevelar({ menor: caiuNoDia10, maior, livro: soDaMaior, dia: d }).quem === "maior" ? espacados : colados).push(d);
  t(`duas viradas coladas não são duas viradas: ${FOLGA} dias de digestão`, colados.length === FOLGA && espacados[0] === 10 + FOLGA, `fechada em ${colados.join(",")} · aberta em ${espacados.join(",")}`);
  /* SAVE ANTIGO (reveladaEm 0): a folga já está vencida em qualquer dia
     útil — ninguém é punido por ter revelado antes de o campo existir */
  t("menor caída num save sem reveladaEm: a folga já está vencida", R.quemPodeRevelar({ menor: { forma: MENOR, alvo: "Ume", revelada: true }, maior, livro: soDaMaior, dia: FOLGA }).quem === "maior");

  /* O ESCAPE DO NASCIMENTO. Sem esta linha, "a menor vem primeiro"
     viraria "a maior nunca acontece" em toda campanha cujo detector da
     menor não acha ninguém (o herói que anda sem grupo, a bolsa sem item
     de origem vaga) — repetindo, um andar acima, exatamente o bug que R3
     veio desfazer. */
  const ESP = R.RITMO_DAS_VIRADAS.diasDeEsperaPelaMenor;
  const cedo = [], tarde = [];
  for (let d = 0; d <= ESP + 5; d++) (R.maiorPodeNascer(null, "Halvard", { dia: d }) ? tarde : cedo).push(d);
  t(`antes de ${ESP} dias a maior não nasce sem a menor (o campo é dela)`, cedo.length === ESP && cedo[cedo.length - 1] === ESP - 1, cedo.join(","));
  t(`a partir de ${ESP} dias ela nasce sozinha (a espera é finita)`, tarde.length === 6 && tarde[0] === ESP, tarde.join(","));
  t("sem opções, o dia é 0 e a maior ainda espera", R.maiorPodeNascer(null, "Halvard") === false);
  t("undefined no lugar da menor é o mesmo que menor nenhuma", R.maiorPodeNascer(undefined, "Halvard", { dia: ESP }) === true);
  /* com a menor JÁ NASCIDA o relógio da espera não se aplica: o que
     decide o nascimento da maior passa a ser o alvo, e mais nada */
  t("com a menor nascida, a maior nasce no dia 1 se o alvo for outro", R.maiorPodeNascer({ forma: MENOR, alvo: "Ume" }, "Halvard", { dia: 1 }) === true);
}

sec("9g. LEI 4 — episódio aberto adia a maior, e NÃO segura a menor");
{
  const maior = { forma: MAIOR, alvo: "Halvard" };
  const menorCaida = { forma: MENOR, alvo: "Ume", revelada: true, reveladaEm: 1 };
  const cheio = livroDe({ forma: MAIOR, alvo: "Halvard" });
  const comEp = R.quemPodeRevelar({ menor: menorCaida, maior, livro: cheio, episodioAberto: true, dia: 30 });
  t("com episódio aberto, a maior madura espera ele fechar", comEp.quem === "", JSON.stringify(comEp));
  t("e o motivo nomeia o episódio", /epis/i.test(comEp.motivo), comEp.motivo);
  t("fechado o episódio, ela cai no mesmo dia", R.quemPodeRevelar({ menor: menorCaida, maior, livro: cheio, episodioAberto: false, dia: 30 }).quem === "maior");
  /* qualquer verdade sobre `episodioAberto` adia — o App entrega o que
     tiver, e um objeto de episódio no lugar de um booleano é adiamento */
  t("um episódio de verdade (objeto) também adia", R.quemPodeRevelar({ menor: menorCaida, maior, livro: cheio, episodioAberto: { id: "x", aberto: true }, dia: 30 }).quem === "");

  /* REGRESSÃO ZERO, E É O PONTO DESTA ASSERÇÃO. A menor NUNCA teve o
     episódio como condição, e R3 não pode ter-lhe acrescentado uma: numa
     campanha viva, com episódio aberto, a menor madura tem de cair no dia
     N exatamente como caía na v9.228. Se esta asserção cair, o R3 tirou
     dias de jogo de quem já estava jogando — e ninguém veria, porque a
     virada simplesmente demoraria mais. */
  const menorMadura = livroDe({ forma: MENOR, alvo: "Ume" });
  t("a menor madura cai COM episódio aberto (regressão zero em campanha viva)",
    R.quemPodeRevelar({ menor: { forma: MENOR, alvo: "Ume" }, maior, livro: menorMadura, episodioAberto: true, dia: 1 }).quem === "menor");
  t("e cai também sem maior nenhuma eleita (a campanha de quem já jogava)",
    R.quemPodeRevelar({ menor: { forma: MENOR, alvo: "Ume" }, maior: null, livro: menorMadura, episodioAberto: true, dia: 1 }).quem === "menor");

  /* a varredura da regressão: para TODA menor da prateleira, em todo dia
     e com o episódio dos dois jeitos, a menor madura cai. Nenhuma das
     trancas novas (folga, episódio, alvo) pode tê-la alcançado. */
  const seguradas = [];
  for (const id of MENORES) {
    const L = livroDe({ forma: id, alvo: "Ume" });
    for (const dia of [0, 1, 3, 9, 30]) {
      for (const ep of [true, false]) {
        for (const outra of [null, maior, { forma: MAIOR, alvo: "Ume" }]) {
          const v = R.quemPodeRevelar({ menor: { forma: id, alvo: "Ume" }, maior: outra, livro: L, episodioAberto: ep, dia });
          if (v.quem !== "menor") seguradas.push(`${id}@dia${dia}·ep=${ep} → ${v.quem || v.motivo}`);
        }
      }
    }
  }
  t("nenhuma menor madura é segurada por episódio, folga, dia ou maior eleita", seguradas.length === 0, seguradas.slice(0, 3).join(" · "));
}

sec("9h. LEI 5 — nunca o mesmo alvo (e a comparação perdoa acento e caixa)");
{
  const DIA = 30;
  t("maiorPodeNascer recusa o alvo da menor", R.maiorPodeNascer({ forma: MENOR, alvo: "Ume" }, "Ume", { dia: DIA }) === false);
  t("e aceita outro alvo", R.maiorPodeNascer({ forma: MENOR, alvo: "Ume" }, "Brida", { dia: DIA }) === true);
  /* "José" e "Jose" são o mesmo homem para o jogador. A contaminação no
     Livro é por igualdade exata, mas a confusão na MESA é por quem: duas
     máscaras no mesmo rosto não é reviravolta, é o jogador achando que
     entendeu errado. Recusamos pelo critério mais largo. */
  for (const [a, b] of [["José", "jose"], ["JOSÉ", "josé"], ["José", "  JOSE  "], ["Ümë", "ume"], ["Vão Frio", "vao frio"]])
    t(`"${a}" e "${b}" são o mesmo alvo`, R.maiorPodeNascer({ forma: MENOR, alvo: a }, b, { dia: DIA }) === false);
  t('"Josefa" não é "José" (o perdão não engole gente diferente)', R.maiorPodeNascer({ forma: MENOR, alvo: "José" }, "Josefa", { dia: DIA }) === true);
  /* sem alvo não nasce nada: uma virada sem dono planta semente sem dono
     no Livro, que é pior que virada nenhuma */
  for (const [rotulo, x] of [["null", null], ["undefined", undefined], ["vazio", ""], ["só espaços", "   "], ["quebra de linha", "\n\t "]])
    t(`maior sem alvo (${rotulo}) não nasce, nem depois da espera`, R.maiorPodeNascer(null, x, { dia: 99 }) === false);
  /* "SEM ALVO" É O QUE `alvoDaForma` PODE DEVOLVER, e nada mais: ela
     devolve string não-vazia ou `null`, e é a única coisa que o App passa
     aqui (App.jsx, `alvoDaReviravolta`). Um número 0 vira o alvo "0" e
     nasce — fica registrado que isso É o comportamento, e que ele não é
     alcançável pela fachada; se um dia alguém passar outra coisa por
     aqui, esta linha é o aviso de que a tranca é só contra vazio. */
  t("0 vira o alvo '0' e nasce (inalcançável pela fachada, mas é o que a tranca faz)", R.maiorPodeNascer(null, 0, { dia: 99 }) === true);
  t("e a fachada só entrega string não-vazia ou null", (() => {
    const a = R.alvoDaForma(MAIOR, MUNDOS_DE_PROVA[MAIOR].mundo);
    return (typeof a === "string" && !!a.trim()) && R.alvoDaForma(MAIOR, null) === null;
  })());

  /* A SEGUNDA TRANCA, dentro de `quemPodeRevelar`. O caso que a primeira
     não alcança é a menor nascer DEPOIS da maior e cair no mesmo alvo —
     aí as sementes das duas estão misturadas no Livro (dona
     "reviravolta" nas duas) e a maior colheria o que a menor plantou. */
  const misturado = livroDe({ forma: MENOR, alvo: "José" }, { forma: MAIOR, alvo: "José" });
  const v = R.quemPodeRevelar({ menor: { forma: MENOR, alvo: "José", revelada: true, reveladaEm: 1 }, maior: { forma: MAIOR, alvo: "jose" }, livro: misturado, dia: DIA });
  t("a segunda tranca morde com acento e caixa diferentes", v.quem === "", JSON.stringify(v));
  t("e o motivo fala do alvo dividido", /alvo/i.test(v.motivo), v.motivo);
  t("alvos de gente diferente passam pela segunda tranca",
    R.quemPodeRevelar({ menor: { forma: MENOR, alvo: "José", revelada: true, reveladaEm: 1 }, maior: { forma: MAIOR, alvo: "Josefa" }, livro: livroDe({ forma: MAIOR, alvo: "Josefa" }), dia: DIA }).quem === "maior");
  /* alvo vazio nunca é "o mesmo" que coisa nenhuma — senão duas viradas
     sem alvo pareceriam colidir, e o ramo ③ trancaria por engano */
  t("duas viradas sem alvo não colidem",
    R.quemPodeRevelar({ menor: { forma: MENOR, alvo: "", revelada: true, reveladaEm: 1 }, maior: { forma: MAIOR, alvo: "" }, livro: livroDe({ forma: MAIOR, alvo: "" }), dia: DIA }).quem === "maior");
  /* e a tranca NÃO alcança a menor: ela já passou pelo ramo ① */
  t("a menor madura cai mesmo dividindo o alvo com a maior",
    R.quemPodeRevelar({ menor: { forma: MENOR, alvo: "José" }, maior: { forma: MAIOR, alvo: "José" }, livro: misturado, dia: DIA }).quem === "menor");
}

sec("9h2. LEI 5, o outro lado — menorPodeNascer (a tranca simétrica)");
{
  /* O BURACO QUE FALTAVA. `maiorPodeNascer` guardava um lado só: a maior
     nasce sobre alguém no dia 9, o detector da MENOR acha a mesma pessoa
     no dia 12, e as duas plantam sob `dona: "reviravolta"` + o mesmo
     `alvo`. Aí a menor colhe as três sementes que a maior plantou — a
     catraca "pesado" paga com dinheiro alheio — e a tranca ③ de
     `quemPodeRevelar` tranca a maior para sempre. O cenário inteiro está
     montado em 9h3; aqui prova-se a tranca, decisão por decisão. */

  /* REGRESSÃO ZERO, e é a linha que mais pesa: sem maior eleita — o caso
     comum, e o único que existia até v9.228 — a menor nasce sem perguntar
     nada a ninguém. Se esta varredura cair, R3 tirou viradas de quem já
     estava jogando, e ninguém veria: a menor simplesmente nunca nasceria. */
  const SEM_MAIOR = [["null", null], ["undefined", undefined], ["{}", {}], ["string crua", "uma maior"],
    ["número", 7], ["forma que sumiu da prateleira", { forma: "sumiu", alvo: "José" }]];
  const barrados = SEM_MAIOR.filter(([, m]) => R.menorPodeNascer(m, "José") !== true);
  t("sem maior eleita (nem lixo no lugar dela), a menor nasce sempre", barrados.length === 0, barrados.map(([r]) => r).join(","));
  t("e nasce para qualquer alvo que o detector devolva",
    ["Ume", "Halvard", "Brida", "Vão Frio", "José"].every((a) => R.menorPodeNascer(null, a) === true));

  /* sem alvo não nasce nada — a mesma primeira tranca da irmã: uma virada
     sem dono planta semente sem dono no Livro, que é pior que virada
     nenhuma. É o que o App já fazia por conta própria antes de v9.229. */
  for (const [rotulo, x] of [["null", null], ["undefined", undefined], ["vazio", ""], ["só espaços", "   "], ["quebra de linha", "\n\t "]])
    t(`menor sem alvo (${rotulo}) não nasce, nem sem maior nenhuma`, R.menorPodeNascer(null, x) === false);

  /* O MESMO ALVO DA MAIOR, pelo mesmo `mesmoAlvo` da irmã: a contaminação
     no Livro é por igualdade exata, mas a confusão na mesa é por QUEM.
     Duas máscaras no mesmo rosto não é reviravolta. */
  const maiorDePe = { forma: MAIOR, alvo: "José" };
  t("menorPodeNascer recusa o alvo da maior", R.menorPodeNascer(maiorDePe, "José") === false);
  t("e aceita outra pessoa", R.menorPodeNascer(maiorDePe, "Brida") === true);
  for (const [a, b] of [["José", "jose"], ["JOSÉ", "josé"], ["José", "  JOSE  "], ["Ümë", "ume"], ["Vão Frio", "vao frio"]])
    t(`"${a}" e "${b}" são o mesmo alvo, também deste lado`, R.menorPodeNascer({ forma: MAIOR, alvo: a }, b) === false);
  t('"Josefa" não é "José" (o perdão não engole gente diferente)', R.menorPodeNascer({ forma: MAIOR, alvo: "José" }, "Josefa") === true);
  /* alvo vazio nunca é "o mesmo" que coisa nenhuma: uma maior sem alvo não
     reserva o mundo inteiro */
  t("maior sem alvo não tranca alvo nenhum", R.menorPodeNascer({ forma: MAIOR, alvo: "" }, "José") === true);

  /* VALE COM A MAIOR JÁ REVELADA, e isso é REGRA, não rigor de sobra. Ao
     revelar, o App paga só as sementes MADURAS (App.jsx, `revelarAVirada`:
     filtra `estado === "madura"`); as imaturas ficam no Livro com aquele
     alvo, e o passo de rega da menor (`dona` + `alvo` + imatura) regaria as
     sobras da maior como se fossem dela. Abaixo, o mecanismo inteiro. */
  const ALVO_CAIDO = "Halvard";
  let parcial = semearNo(P.garantirLivro(null), MAIOR, ALVO_CAIDO, { maduras: true, quantas: 2, dia: 9 });
  const antesDeRevelar = parcial.sementes.filter((s) => s.dona === "reviravolta" && s.alvo === ALVO_CAIDO).length;
  for (const s of P.sementesMaduras(parcial, { dona: "reviravolta", alvo: ALVO_CAIDO })) parcial = P.pagar(parcial, s.id, { dia: 10 }).livro;
  const sobras = parcial.sementes.filter((s) => s.dona === "reviravolta" && s.alvo === ALVO_CAIDO && (s.estado === "semeada" || s.estado === "regada"));
  t("a maior revelada deixa sementes imaturas no Livro, com o alvo dela",
    antesDeRevelar === 3 && sobras.length === 1, `${antesDeRevelar} plantadas · ${sobras.length} sobrando`);
  t("e é exatamente o que a rega da menor pegaria (dona + alvo + imatura)",
    sobras.every((s) => s.dona === "reviravolta" && s.alvo === ALVO_CAIDO));
  t("por isso `revelada: true` NÃO libera o alvo — ele é dela antes e depois da máscara cair",
    R.menorPodeNascer({ forma: MAIOR, alvo: ALVO_CAIDO, revelada: true, reveladaEm: 10 }, ALVO_CAIDO) === false);
  t("e a maior revelada continua não trancando outra pessoa",
    R.menorPodeNascer({ forma: MAIOR, alvo: ALVO_CAIDO, revelada: true, reveladaEm: 10 }, "Ume") === true);

  /* A ASSIMETRIA É DE PROPÓSITO, E ESTÁ NA ASSINATURA: a irmã tem `dia` (o
     escape `diasDeEsperaPelaMenor`), esta NÃO tem. A menor não fica refém
     de prazo nenhum porque o detector dela roda de novo no turno seguinte e
     o alvo vem do mundo, não do contrato. Esta varredura existe para que o
     dia em que alguém acrescentar um prazo aqui a asserção acuse — e não
     para repetir a implementação: ela mede que a resposta com DOIS
     argumentos é a mesma com qualquer terceiro. */
  const TERCEIROS = [undefined, null, {}, { dia: 0 }, { dia: 9 }, { dia: 99 }, { dia: -50 },
    { dia: "ontem" }, { diasDeEsperaPelaMenor: 0 }, "hoje", 0, 99];
  const casos = [[null, "José"], [maiorDePe, "José"], [maiorDePe, "Brida"], [maiorDePe, ""], [null, null],
    [{ forma: MAIOR, alvo: "José", revelada: true }, "José"]];
  const mudaram = [];
  for (const [m, a] of casos) {
    const base = R.menorPodeNascer(m, a);
    for (const op of TERCEIROS) if (R.menorPodeNascer(m, a, op) !== base) mudaram.push(`${JSON.stringify(m)}/${a} com ${JSON.stringify(op)}`);
  }
  t("nenhum terceiro argumento muda a resposta (ela ignora opções — não há prazo aqui)", mudaram.length === 0, mudaram.slice(0, 3).join(" · "));
  t("a assinatura declara os dois argumentos, e só eles (a irmã declara três)",
    R.menorPodeNascer.length === 2 && R.maiorPodeNascer.length === 3, `menor:${R.menorPodeNascer.length} · maior:${R.maiorPodeNascer.length}`);
  /* e o que a menor perde é o direito de ser a segunda máscara no mesmo
     rosto: no turno seguinte, com outro alvo do mundo, ela nasce */
  t("recusada num alvo, ela nasce no outro que o mundo der (não fica refém)",
    R.menorPodeNascer(maiorDePe, "José") === false && R.menorPodeNascer(maiorDePe, "Ume") === true);

  /* AS DUAS TRANCAS SÃO A MESMA LEI, lida das duas pontas: nenhum par de
     alvos pode ser aceito pelos dois lados quando é a mesma pessoa, e
     nenhum pode ser recusado pelos dois quando são pessoas diferentes. */
  const PARES = [["José", "José"], ["José", "jose"], ["José", "Josefa"], ["Ume", "Halvard"], ["Vão Frio", "vao frio"]];
  const assimetricos = PARES.filter(([a, b]) =>
    R.menorPodeNascer({ forma: MAIOR, alvo: a }, b) !== R.maiorPodeNascer({ forma: MENOR, alvo: a }, b, { dia: 99 }));
  t("as duas trancas dão a mesma resposta sobre o mesmo par de alvos", assimetricos.length === 0, assimetricos.map((p) => p.join("/")).join(" · "));
}

sec("9h3. R3 — o cenário que originou o conserto, de ponta a ponta");
{
  /* O LIVRO MONTADO COMO O APP O MONTA: a maior nasce e semeia sobre um
     alvo; dias depois o detector da menor acha a MESMA pessoa. É o caminho
     inverso do que `maiorPodeNascer` já guardava, e era o único que
     restava aberto até v9.229. */
  const ALVO = "José";                                    /* a mesma pessoa, dos dois detectores */
  const ESP = R.RITMO_DAS_VIRADAS.diasDeEsperaPelaMenor;
  const DIA_DA_MAIOR = ESP;        /* dia 9: a espera venceu, o detector da menor nunca achou ninguém */
  const DIA_DA_MENOR = ESP + 3;    /* dia 12: o mundo enfim dá um alvo à menor — e é o mesmo */

  /* TURNO 1 (dia 9), passo 2 do App: a maior nasce sozinha e planta */
  t("dia 9: sem menor nascida e vencida a espera, a maior nasce", R.maiorPodeNascer(null, ALVO, { dia: DIA_DA_MAIOR }) === true);
  const maior = R.garantirReviravolta({ forma: MAIOR, alvo: ALVO, eleitaEm: DIA_DA_MAIOR });
  const livro = semearNo(P.garantirLivro(null), MAIOR, ALVO, { maduras: true, dia: DIA_DA_MAIOR });
  const dela = P.sementesMaduras(livro, { dona: "reviravolta", alvo: ALVO }).length;
  t("e planta as três sementes DELA no Livro, sob dona 'reviravolta' e o alvo", dela === 3, String(dela));

  /* O MUNDO SEM A TRANCA (v9.228), montado para que a asserção guarde o
     PORQUÊ e não só o sintoma. Nada aqui chama `menorPodeNascer`: é o que
     acontecia quando ela não existia. */
  const intrusa = R.garantirReviravolta({ forma: MENOR, alvo: ALVO, eleitaEm: DIA_DA_MENOR });
  t("sem a tranca, a menor colheria de graça as três sementes da MAIOR (o filtro do Livro é dona + alvo)",
    R.podeRevelar(MENOR, livro, { alvo: ALVO }) === true && !intrusa.semeada);
  const roubo = R.quemPodeRevelar({ menor: intrusa, maior, livro, episodioAberto: false, dia: DIA_DA_MENOR });
  t("e levaria o turno sem ter plantado nada — a catraca paga com dinheiro alheio", roubo.quem === "menor", JSON.stringify(roubo));
  /* e a conta chega: o App paga as maduras daquele alvo, que eram da maior */
  let depois = livro;
  for (const s of P.sementesMaduras(depois, { dona: "reviravolta", alvo: ALVO })) depois = P.pagar(depois, s.id, { dia: DIA_DA_MENOR }).livro;
  t("a revelação da intrusa paga as sementes da maior, e o Livro dela fica vazio",
    P.sementesMaduras(depois, { dona: "reviravolta", alvo: ALVO }).length === 0 && R.podeRevelar(MAIOR, depois, { alvo: ALVO }) === false);
  const caida = { ...intrusa, revelada: true, reveladaEm: DIA_DA_MENOR };
  const paraSempre = [];
  for (const d of [DIA_DA_MENOR, DIA_DA_MENOR + 3, 60, 200, 9999]) {
    const v = R.quemPodeRevelar({ menor: caida, maior, livro: depois, episodioAberto: false, dia: d });
    if (v.quem === "maior") paraSempre.push(d);
  }
  t("e a tranca ③ trancaria a maior PARA SEMPRE — acervo escrito que não pode mais acontecer (o bug de R2 outra vez)",
    paraSempre.length === 0, "caiu nos dias: " + paraSempre.join(","));

  /* E AGORA O MUNDO COM A TRANCA (v9.229): o mesmo turno 2, pela porta
     que o App usa. */
  t("dia 12: a menor NÃO nasce no alvo da maior", R.menorPodeNascer(maior, ALVO) === false);
  t("nem com a grafia de perto — é a mesma pessoa na mesa", R.menorPodeNascer(maior, "  jose ") === false);
  t("a maior mantém as próprias sementes (ninguém colheu nada)",
    P.sementesMaduras(livro, { dona: "reviravolta", alvo: ALVO }).length === 3 && R.podeRevelar(MAIOR, livro, { alvo: ALVO }) === true);
  const livre = R.quemPodeRevelar({ menor: null, maior, livro, episodioAberto: false, dia: DIA_DA_MENOR });
  t("e ela NÃO fica trancada: madura e sem menor por cima, a vez é dela", livre.quem === "maior", JSON.stringify(livre));
  /* a menor não ficou sem história: no turno em que o mundo lhe der outra
     pessoa, ela nasce — e aí as duas convivem, cada uma no seu alvo */
  const outra = R.garantirReviravolta({ forma: MENOR, alvo: "Ume", eleitaEm: DIA_DA_MENOR + 1 });
  t("no turno seguinte, com outro alvo, a menor nasce", R.menorPodeNascer(maior, "Ume") === true && outra.alvo === "Ume");
  const doisAlvos = semearNo(livro, MENOR, "Ume", { maduras: true, dia: DIA_DA_MENOR + 1 });
  t("e as duas convivem no mesmo Livro sem misturar sementes",
    P.sementesMaduras(doisAlvos, { dona: "reviravolta", alvo: ALVO }).length === 3
    && P.sementesMaduras(doisAlvos, { dona: "reviravolta", alvo: "Ume" }).length === 3);
  t("a menor madura cai primeiro, e a maior cai depois, com o acervo intacto",
    R.quemPodeRevelar({ menor: outra, maior, livro: doisAlvos, dia: DIA_DA_MENOR + 1 }).quem === "menor"
    && R.quemPodeRevelar({ menor: { ...outra, revelada: true, reveladaEm: DIA_DA_MENOR + 1 }, maior, livro: doisAlvos, dia: DIA_DA_MENOR + 9 }).quem === "maior");
}

sec("9i. LEI 6 — determinismo por semente, e as três maiores alcançáveis");
{
  const sementes = [];
  for (let i = 0; i < 300; i++) sementes.push("mundo-" + i + "|fantasia");
  const instaveis = sementes.filter((s) => JSON.stringify(R.elegerReviravoltas(s)) !== JSON.stringify(R.elegerReviravoltas(s)));
  t("a mesma semente dá sempre a mesma dupla (300 mundos)", instaveis.length === 0, instaveis.slice(0, 3).join(","));
  const vistasMenor = new Set(sementes.map((s) => R.elegerReviravoltas(s).menor));
  const vistasMaior = new Set(sementes.map((s) => R.elegerReviravoltas(s).maior));
  /* ACERVO ELEITO QUE NUNCA SAI é a mesma família de bug de R2: forma
     escrita que não pode acontecer. Cada maior tem de sair eleita em
     ALGUMA semente, senão ela é enfeite — e esta é a etapa em que as três
     passam a acontecer. */
  const nuncaMaior = MAIORES.filter((id) => !vistasMaior.has(id));
  t("as TRÊS maiores são alcançáveis (nenhuma é enfeite)", nuncaMaior.length === 0, "nunca eleitas: " + nuncaMaior.join(", "));
  const nuncaMenor = MENORES.filter((id) => !vistasMenor.has(id));
  t("as QUATRO menores também", nuncaMenor.length === 0, "nunca eleitas: " + nuncaMenor.join(", "));
  /* o `>>> 8` sem sinal: com `>> 8` o índice saía negativo, e negativo % n
     acessa fora do array — o defeito só apareceu quando passou a haver
     mais de uma maior, que é exatamente agora */
  const duplasRuins = sementes.filter((s) => {
    const e = R.elegerReviravoltas(s);
    return !e.menor || !e.maior || e.menor === e.maior
      || R.formaPorId(e.menor).porte !== "menor" || R.formaPorId(e.maior).porte !== "maior";
  });
  t("toda eleição devolve uma menor e uma maior válidas, e nunca a mesma forma", duplasRuins.length === 0, duplasRuins.slice(0, 3).join(","));
  t("a semente do lixo também elege (e sempre a mesma dupla)",
    JSON.stringify(R.elegerReviravoltas(null)) === JSON.stringify(R.elegerReviravoltas("aventura")) && !!R.elegerReviravoltas(undefined).maior);
}

sec("9j. quemPodeRevelar e maiorPodeNascer no nada e no lixo");
{
  const madura = livroDe({ forma: MAIOR, alvo: "Halvard" });
  const LIXOS = [
    ["null", null],
    ["undefined", undefined],
    ["{}", {}],
    ["string crua", "de quem é a vez?"],
    ["número", 7],
    /* `= {}` no destructuring NÃO cobre `null` explícito, que é
       exatamente o que um ref não inicializado entrega ao App */
    ["campos null explícitos", { menor: null, maior: null, livro: null, episodioAberto: null, dia: null }],
    ["formas que sumiram da prateleira", { menor: { forma: "sumiu" }, maior: { forma: "sumiu_tambem" }, livro: madura, dia: 30 }],
    ["dia negativo", { menor: null, maior: { forma: MAIOR, alvo: "Halvard" }, livro: madura, dia: -50 }],
    ["dia que não é número", { menor: null, maior: { forma: MAIOR, alvo: "Halvard" }, livro: madura, dia: "ontem" }],
    ["livro que não é livro", { menor: null, maior: { forma: MAIOR, alvo: "Halvard" }, livro: "um livro", dia: 30 }],
  ];
  for (const [rotulo, x] of LIXOS) {
    let v;
    try { v = R.quemPodeRevelar(x); } catch (e) { v = { quem: "ESTOUROU: " + e.message, motivo: "" }; }
    t(`${rotulo}: devolve um nome e um motivo, sem estourar`, ["menor", "maior", ""].includes(v.quem) && typeof v.motivo === "string" && !!v.motivo, JSON.stringify(v));
  }
  t("forma que não existe mais no save não elege ninguém", R.quemPodeRevelar({ menor: { forma: "sumiu" }, maior: { forma: "sumiu" }, livro: madura, dia: 99 }).quem === "");
  /* dia negativo e dia-lixo caem em 0, e no dia 0 a folga ainda não
     passou: o lixo nunca abre uma virada mais cedo */
  t("dia negativo não abre a maior mais cedo", R.quemPodeRevelar({ menor: null, maior: { forma: MAIOR, alvo: "Halvard" }, livro: madura, dia: -50 }).quem === "");
  for (const [rotulo, op] of [["null", null], ["undefined", undefined], ["string", "hoje"], ["dia que não é número", { dia: "ontem" }], ["dia negativo", { dia: -9 }]])
    t(`maiorPodeNascer com opções ${rotulo}: cai no dia 0, e a espera vale`, R.maiorPodeNascer(null, "Halvard", op) === false);
  /* menor que `garantirReviravolta` não reconhece é o mesmo que menor
     nenhuma — e aí volta a valer a espera, que é o lado conservador */
  t("menor-lixo é o mesmo que menor nenhuma", R.maiorPodeNascer("uma menor", "Halvard", { dia: 99 }) === true && R.maiorPodeNascer({ forma: "sumiu", alvo: "Halvard" }, "Halvard", { dia: 0 }) === false);
}

sec("9k. LEI 7 — o Narrador descobre junto: nada de bloco novo no prompt");
{
  /* O TETO É SAGRADO, e quem o guarda são duas catracas que já existem.
     Esta seção não remede o prompt — mede que as catracas continuam no
     lugar, porque uma etapa que apagasse uma delas passaria sem ninguém
     ver. Os números medidos ficam no relato desta versão. */
  const TP = readFileSync("./teste-prompt.mjs", "utf8");
  t("a catraca do teto de prompt continua de pé (teste-prompt.mjs: PIOR CENA REAL < 82000)",
    /PIOR CENA REAL/.test(TP) && /pior\.length < 82000/.test(TP));
  t("e a da soma de todas as portas também (< 92000)", /tetoComLex\.length < 92000/.test(TP));
  const TG = readFileSync("./teste-geografo.mjs", "utf8");
  t("a catraca do teto da PAUTA continua de pé (teste-geografo.mjs: TETO_DA_PAUTA)",
    /TETO_DA_PAUTA/.test(TG) && /<= TETO_DA_PAUTA/.test(TG));

  /* A PROVA POR TEXTO SOBRE O APP, e o que ela vale. Os dois leitores da
     verdade eleita são `revelacaoDe` (a frase da inversão) e
     `oDiaSeguinte` (as consequências). Se os dois só são CHAMADOS dentro
     do handler da virada, e lá dentro só depois da catraca que abre a
     revelação, então nenhum caminho do App põe a verdade no prompt antes
     do turno em que ela cai.

     ISSO NÃO PROVA O TETO, e não se finge que prova: um bloco estático
     novo poderia entrar no prompt por outro caminho, sem tocar nestes
     dois nomes — quem guarda isso é `teste-prompt.mjs`, acima. O que esta
     asserção guarda é o VAZAMENTO DA VERDADE, que é a lei desta linha. */
  const semImports = APP.replace(/^import .*$/gm, "");
  const chamadas = (s) => (s.match(/\b(?:revelacaoDe|oDiaSeguinte)\s*\(/g) || []).length;
  const revelar = (semImports.match(/const revelarAVirada = [\s\S]*?\n {2}\};/) || [""])[0];
  t("a revelação é um bloco só no App (revelarAVirada)", !!revelar);
  t("revelacaoDe e oDiaSeguinte são chamados SÓ dentro dela",
    !!revelar && chamadas(revelar) > 0 && chamadas(semImports) === chamadas(revelar),
    `App inteiro: ${chamadas(semImports)} · revelarAVirada: ${chamadas(revelar)}`);
  /* e o bloco da revelação só roda no ramo de quem tem a vez: cada
     chamada de `revelarAVirada` está atrás de um `vez.quem === ...` */
  const handler = (semImports.match(/const mexerNaReviravolta = [\s\S]*?calou\("mexerNaReviravolta"/) || [""])[0];
  const antesDeCada = [];
  handler.replace(/revelarAVirada\s*\(/g, (m, i) => { antesDeCada.push(handler.slice(Math.max(0, i - 160), i)); return m; });
  t("e ela só é chamada no ramo de quem tem a vez",
    !!handler && antesDeCada.length >= 2 && antesDeCada.every((antes) => /vez\.quem === "(?:menor|maior)"/.test(antes)),
    `${antesDeCada.length} chamadas no handler`);
  t("a verdade eleita entra no prompt num lugar só, pela nota do turno", (APP.match(/\[A VIRADA/g) || []).length === 1, String((APP.match(/\[A VIRADA/g) || []).length));
  /* o `motivo` da arbitragem é BASTIDOR — a suíte o lê, a tela nunca. Se
     ele aparecer na nota do turno ou num texto de tela, o sistema passou
     a falar de si mesmo. */
  t("o motivo da arbitragem não vaza para a tela nem para a nota", !/vez\.motivo/.test(APP));
}

sec("9l. ligado ao jogo (R3)");
{
  /* A CATRACA DO EXPORT MORTO, do lado desta suíte. `teste-ligacao` conta
     MENÇÕES, e por isso perdoa `maiorPodeNascer` por falso positivo — o
     nome aparece num comentário dentro de `quemPodeRevelar`. Quem exige
     leitor de verdade é esta lista: se o App deixar de ligar um destes,
     cai aqui, com o nome.

     A LISTA CRESCEU PARA CINCO em v9.229 (era quatro): `menorPodeNascer`
     entrou, e pelo mesmo motivo que a irmã — o comentário de
     `quemPodeRevelar` cita os DOIS nomes, então o varredor perdoa os dois.
     A contagem mudou de "os quatro órgãos" para "os cinco" por isso. */
  const R3 = ["quemPodeRevelar", "maiorPodeNascer", "menorPodeNascer", "diasEntreRegasDe", "RITMO_DAS_VIRADAS"];
  const naoExportados = R3.filter((n) => typeof R[n] === "undefined");
  t("os cinco órgãos de R3 existem no módulo", naoExportados.length === 0, "não exportados: " + naoExportados.join(", "));

  /* AS QUATRO QUE O APP CHAMA. Os dois guardas de nascimento são os que
     mais precisam desta linha: passam no `teste-ligacao` por FALSO
     POSITIVO — o varredor conta a menção deles num comentário dentro de
     `quemPodeRevelar` —, e sem leitor de verdade nasceriam sem prova e
     ninguém avisaria. `menorPodeNascer` entrou aqui em v9.229, no mesmo
     molde da irmã: a âncora exige `if (nome(`, que é chamada e não
     menção. */
  const APELOS = {
    quemPodeRevelar: /quemPodeRevelar\(\{/,
    maiorPodeNascer: /if \(maiorPodeNascer\(/,
    menorPodeNascer: /if \(menorPodeNascer\(/,
    diasEntreRegasDe: /diasEntreRegasDe\(rev\.forma\)/,
  };
  const naoChamados = Object.keys(APELOS).filter((n) => !APELOS[n].test(APP));
  t("o App CHAMA as quatro (leitor de verdade, não menção em comentário)", naoChamados.length === 0, "não chamados: " + naoChamados.join(", "));
  /* a quarta é TABELA, e tabela não se chama: `RITMO_DAS_VIRADAS` é lida
     por dentro do módulo (DIAS_ENTRE_REGAS, diasEntreRegasDe,
     quemPodeRevelar, maiorPodeNascer) e por esta suíte. Quem a lê de fora
     é o teste, e é assim que "se é número, é tabela" se prova. */
  t("RITMO_DAS_VIRADAS é lida de fora do módulo (é o que faz dela tabela, e não constante solta)",
    R.RITMO_DAS_VIRADAS.diasEntreRegas.menor === R.DIAS_ENTRE_REGAS && R.RITMO_DAS_VIRADAS.folgaEntreViradas > 0);

  t("há ref para a maior, e ela entra no save e volta dele",
    /reviravoltaMaiorRef/.test(APP) && /reviravoltaMaior: reviravoltaMaiorRef\.current/.test(APP) && /garantirReviravolta\(sv\.reviravoltaMaior\)/.test(APP));
  t("a maior nasce com o alvo do detector, e só com a licença do módulo",
    /alvoDaReviravolta\(maior\)/.test(APP) && /maiorPodeNascer\(reviravoltaRef\.current, alvoMaior/.test(APP));
  /* e o simétrico: cada guarda tem de receber A OUTRA virada. Trocar os
     refs aqui passaria em qualquer teste de comportamento (as duas
     assinaturas aceitam qualquer reviravolta) e desligaria as duas trancas
     em silêncio — por isso a âncora nomeia o ref, dos dois lados. */
  t("a menor também só nasce com a licença do módulo, e a licença olha a MAIOR",
    /alvoDaReviravolta\(menor\)/.test(APP) && /menorPodeNascer\(reviravoltaMaiorRef\.current,/.test(APP));
  t("a virada revelada anota o DIA (é a partida da folga até a seguinte)", /reveladaEm: diaRef\.current/.test(APP));
  t("o episódio aberto chega à arbitragem pelo App", /episodioAberto:/.test(APP));
  /* o que JÁ estava ligado continua ligado: a menor não pode ter perdido
     fiação nesta etapa (regressão zero, do lado do App) */
  t("a fiação da menor continua de pé", /elegerReviravoltas\(sementeMundo\(\)\)/.test(APP) && /reviravolta: reviravoltaRef\.current/.test(APP) && /sementesDaReviravolta\(rev\.forma/.test(APP));
}

/* ============================================================
   10. R4 (v9.230) — A SUÍTE DA FASE: A FASE VISTA DE FORA

   R1, R2 e R3 provaram cada peça: os sinais, os detectores, a
   convivência. Esta etapa nasceu CREDORA — as quatro provas que a pauta
   pedia para R4 (eleição determinística por semente, cada forma com seu
   detector, a ordem menor→maior, e o Narrador só sabendo no turno da
   revelação) já estavam feitas nas seções 2 e 9i, 8 e 8b-8g, 9d/9f/9g, e
   9k. Nenhuma delas foi reescrita. O trabalho de R4 foi achar o que
   NENHUMA delas cobria — sabotando a suíte de propósito para ver o que
   ela deixava passar. Cinco buracos apareceram; os cinco estão fechados
   abaixo, na ordem do estrago que cada um deixava passar.

   O PIOR DELES, e a razão de esta seção existir: apagar a ÚNICA chamada
   de `mexerNaReviravolta()` no turno deixava `npm test` inteiro verde —
   181/181 suítes e 7/7 varredores. A Fase R inteira podia sair do jogo
   em silêncio, e a casa toda diria que estava tudo bem. Todas as
   âncoras de "ligado ao jogo" das seções 7 e 9l mediam a DEFINIÇÃO do
   órgão (`/mexerNaReviravolta/` casa com `const mexerNaReviravolta = () =>`),
   nunca o sítio que o chama; e `mexerNaReviravolta` é const local do App,
   não export, então o `teste-ligacao` não o enxerga.

   É o bug que esta casa mais repete, com a roupa mais cara que ele já
   vestiu: escrito, provado, e nunca acontecendo.
   ============================================================ */

sec("10. R4 — A CHAMADA, NÃO A DEFINIÇÃO: o órgão roda mesmo no turno");
{
  /* espaço em branco normalizado antes de casar, como as âncoras da 9l:
     uma quebra de linha inocente não pode derrubar a suíte, e sem isto
     qualquer reformatação viraria vermelho que não é achado */
  const APP_N = APP.replace(/\s+/g, " ");

  /* ① O SÍTIO DE CHAMADA. A definição é `const mexerNaReviravolta = () =>`
     e NÃO casa com `mexerNaReviravolta();`; o resgate
     (`calou("mexerNaReviravolta", e)`) também não. É essa a diferença que
     esta linha mede, e é a diferença entre um órgão ligado e um órgão
     escrito. */
  t("a definição existe (sem ela, as âncoras abaixo mediriam o nada)", /const mexerNaReviravolta = \(\) =>/.test(APP_N));
  const chamadas = (APP_N.match(/(?:^|[^.\w])mexerNaReviravolta\(\)\s*;/g) || []).length;
  t("o App CHAMA mexerNaReviravolta no turno (não basta defini-la)", chamadas >= 1, `${chamadas} sítios de chamada`);
  /* UMA SÓ, e é regra e não capricho: o órgão faz UM GESTO POR TURNO
     (semear, ou regar, ou revelar — é o que dizem os `return` dele).
     Chamado duas vezes no mesmo turno, o turno compra dois gestos e a
     virada anda no dobro do ritmo que `RITMO_DAS_VIRADAS` promete, sem
     que nenhuma asserção de ritmo acusasse. */
  t("e o chama UMA vez por turno (dois gestos no mesmo turno dobrariam o ritmo da tabela)", chamadas === 1, String(chamadas));

  /* ② A ORDEM, e ela é regra herdada: o órgão lê quem tem propósito de
     trair, então precisa dos propósitos já disparados; e vem ANTES das
     bocas, porque a nota da revelação tem de estar escrita quando o
     prompt é montado. Medido por índice e não por regex de vizinhança —
     a distância entre as três linhas pode crescer sem que a ordem mude,
     e entre elas cabe qualquer órgão novo. O que não cabe é a virada
     sair da janela. */
  const iProp = APP_N.indexOf("propositosDoTurnoRef.current = dispararPropositos(");
  const iVira = APP_N.search(/(?:^|[^.\w])mexerNaReviravolta\(\)\s*;/);
  const iFala = APP_N.indexOf("falasDoTurnoRef.current = await colherAsFalas(");
  t("as três âncoras do turno existem no texto", iProp > 0 && iVira > 0 && iFala > 0, `propositos=${iProp} · virada=${iVira} · falas=${iFala}`);
  t("a virada roda DEPOIS dos propósitos e ANTES das bocas",
    iProp > 0 && iVira > iProp && iFala > iVira, `propositos=${iProp} · virada=${iVira} · falas=${iFala}`);

  /* ③ A GUARDA VIVA. `if (maiorPodeNascer(...))` mordia a guarda apagada
     e a guarda negada (`if (false && ...)`), mas NÃO mordia a guarda
     morta pelo outro lado do `&&`: com `if (maiorPodeNascer(...) && false)`
     a maior nunca mais nascia e a suíte inteira passava verde. A âncora
     exigia que a licença fosse CHAMADA; faltava exigir que ela DECIDA.

     A régua é: a condição do `if` é a licença do módulo, e nada mais. Os
     parênteses fecham por CONTAGEM, e não por regex — medir com regex
     pega o prefixo e perdoa o resto, e "o resto" é exatamente onde mora
     o `&& false`. Com a contagem o que volta é a condição inteira, do
     começo ao fim, e ela aguenta argumento com parêntese dentro (hoje
     não tem; no dia em que tiver, a âncora não vira falso vermelho).

     Se um dia a fiação precisar legitimamente de uma conjunção ali, esta
     asserção muda — com o motivo escrito ao lado, como manda a casa:
     cada `&&` a mais é um caminho a mais em que a virada não acontece, e
     ele precisa de prova própria. O que ela não pode é ceder em silêncio. */
  const condicoesDoIf = (texto, guarda) => {
    const achadas = [];
    const marca = "if (" + guarda + "(";
    for (let i = texto.indexOf(marca); i >= 0; i = texto.indexOf(marca, i + 1)) {
      const abre = i + 3;                       /* o "(" do próprio if */
      let prof = 0, fim = -1;
      for (let j = abre; j < texto.length; j++) {
        if (texto[j] === "(") prof++;
        else if (texto[j] === ")") { prof--; if (prof === 0) { fim = j; break; } }
      }
      if (fim > 0) achadas.push(texto.slice(abre + 1, fim).trim());
    }
    return achadas;
  };
  /* a condição é SÓ a chamada quando o parêntese que fecha a chamada é o
     último caractere dela — nada de `&& false`, `&& 0`, `|| outraCoisa` */
  const soAChamada = (cond, guarda) => {
    if (!cond.startsWith(guarda + "(")) return false;
    let prof = 0;
    for (let j = guarda.length; j < cond.length; j++) {
      if (cond[j] === "(") prof++;
      else if (cond[j] === ")") { prof--; if (prof === 0) return j === cond.length - 1; }
    }
    return false;
  };
  for (const guarda of ["maiorPodeNascer", "menorPodeNascer"]) {
    const conds = condicoesDoIf(APP_N, guarda);
    t(`${guarda}: a licença existe como if (leitor de verdade, não menção)`, conds.length >= 1, String(conds.length));
    const adulteradas = conds.filter((c) => !soAChamada(c, guarda));
    t(`${guarda}: a licença DECIDE o nascimento — a condição é ela, e nada mais (o "&& false" morre aqui)`,
      conds.length >= 1 && adulteradas.length === 0, adulteradas.join(" · "));
  }
}

/* ---------------- O MUNDO INTEIRO ----------------
   Um snapshot só que serve às SETE formas de uma vez, para que qualquer
   dupla eleita ache alvo nele. Não é um mundo novo inventado para a
   prova: é a união dos sete mundos de `MUNDOS_DE_PROVA`, e a primeira
   asserção da seção 10b confere que cada detector acha nele EXATAMENTE
   o alvo que a tabela promete. Assim a tabela continua sendo a régua —
   se um detector mudar, os dois lugares se movem juntos ou a suíte
   acusa. */
const MUNDO_INTEIRO = {
  semente: "a campanha inteira|fantasia",
  vilao: { nome: "Sarna" },
  grupo: [{ nome: "Ume", indole: { proposito: "trair" } }],
  inventario: ["Caderno de anotações cifradas"],
  npcs: elenco(
    [{ nome: "Ume" }, { nome: "Brida" },
      { nome: "Fina", consultas: R.LIMIARES_DA_VIRADA.consultasDoInformante },
      { nome: "Halvard", papel: "ferreiro da aldeia" }],
    [["Ume", "Brida", "familia"]]),
  personagem: { antecedente: "ferreiro" },
  missoes: [{ id: "q1", dador: "Halvard", criadaEm: 2 }],
  cidades: [{ nome: "Vado", populacao: R.LIMIARES_DA_VIRADA.populacaoDaCidadeProspera, relacao: "neutra", descoberta: true }],
  cidadeAtual: "",
};

/* ---------------- A RÉPLICA DO CICLO DO APP ----------------
   ATENÇÃO, QUEM MEXER EM `cuidarDasSementes` OU EM `mexerNaReviravolta`:
   isto é uma RÉPLICA, e ela tem de ser revista junto. Os dois vivem
   dentro do `App.jsx` e fecham sobre `promessasRef`, `diaRef` e
   `notaRef` — não há como importá-los daqui, e a lei "conta se prova,
   tela se olha" cobra isso do App. O que se pode fazer é reproduzir o
   corpo deles passo a passo, com o MÓDULO e o LIVRO de verdade no meio,
   e deixar escrito de onde cada passo veio.

   A fidelidade é linha a linha, e é conferível:
     · passos 1 e 2 (os nascimentos) — na mesma ordem do App, e a ordem
       importa: o passo 1 escreve o ref que o passo 2 lê no mesmo turno;
     · passo 3 (`cuidar`) — réplica de `cuidarDasSementes`: a mesma guarda
       de entrada (`!rev || rev.revelada`), a mesma semeadura única
       (`!rev.semeada` → planta e grava `regadaEm`), a MESMA condição de
       rega (`dia - (rev.regadaEm || 0) >= diasEntreRegasDe(rev.forma)`,
       copiada caractere a caractere) e o mesmo `find` por
       dona+alvo+imatura, que é o que separa as duas viradas no Livro;
     · passo 4 (a arbitragem) — uma pergunta só, `quemPodeRevelar`;
     · passo 5 — e só então a maior cuida das dela;
     · `revelar` — réplica de `revelarAVirada`: paga só as sementes
       MADURAS daquele alvo e grava `reveladaEm`;
     · o `continue` do laço é o `return` do App: um gesto por turno.

   O que fica de fora é o que não é ciclo — a nota do turno, a Fúria, o
   registro do gesto. Esses são tela e estado de mundo, e têm prova em
   9k. O `ato` entra como 0 porque ele não muda gesto nenhum do ciclo; o
   que o `ato` muda é o vínculo com `fecharAto`, e esse é o assunto da
   seção 10d.

   A ÂNCORA QUE AVISA quando a réplica envelhecer é a da seção 9l
   (`diasEntreRegasDe(rev.forma)`), que nomeia a condição no texto do
   App, mais a seção 10 acima, que exige o sítio de chamada. */
const rodarACampanha = (semente, { dias, episodioAteODia = -1, mundo = MUNDO_INTEIRO } = {}) => {
  const { menor: idMenor, maior: idMaior } = R.elegerReviravoltas(semente);
  let livro = P.garantirLivro(null);
  let menor = null, maior = null;
  const linha = [];

  const cuidar = (rev, dia) => {
    if (!rev || rev.revelada) return null;
    if (!rev.semeada) {
      for (const spec of R.sementesDaReviravolta(rev.forma, { alvo: rev.alvo, ato: 0, dia })) livro = P.semear(livro, spec).livro;
      return { ...rev, semeada: true, regadaEm: dia };
    }
    if (dia - (rev.regadaEm || 0) >= R.diasEntreRegasDe(rev.forma)) {
      const imatura = livro.sementes.find((x) => x.dona === "reviravolta" && x.alvo === rev.alvo && (x.estado === "semeada" || x.estado === "regada"));
      if (imatura) { livro = P.regar(livro, imatura.id, { dia, cena: "a virada" }).livro; return { ...rev, regadaEm: dia }; }
    }
    return null;
  };
  const revelar = (rev, dia) => {
    for (const x of livro.sementes.filter((s) => s.dona === "reviravolta" && s.alvo === rev.alvo && s.estado === "madura")) {
      livro = P.pagar(livro, x.id, { dia, colheita: R.revelacaoDe(rev.forma) }).livro;
    }
    return { ...rev, revelada: true, reveladaEm: dia };
  };

  for (let dia = 0; dia <= dias; dia++) {
    const episodioAberto = dia <= episodioAteODia;
    if (idMenor && !menor) {
      const alvo = R.alvoDaForma(idMenor, mundo);
      if (R.menorPodeNascer(maior, alvo)) { menor = R.garantirReviravolta({ forma: idMenor, alvo, eleitaEm: dia }); linha.push({ dia, o: "nasce a menor" }); }
    }
    if (idMaior && !maior) {
      const alvoM = R.alvoDaForma(idMaior, mundo);
      if (R.maiorPodeNascer(menor, alvoM, { dia })) { maior = R.garantirReviravolta({ forma: idMaior, alvo: alvoM, eleitaEm: dia }); linha.push({ dia, o: "nasce a maior" }); }
    }
    const pm = cuidar(menor, dia);
    if (pm) { linha.push({ dia, o: menor.semeada ? "a menor rega" : "a menor semeia" }); menor = pm; continue; }
    const vez = R.quemPodeRevelar({ menor, maior, livro, episodioAberto, dia });
    if (vez.quem === "menor" && menor) { menor = revelar(menor, dia); linha.push({ dia, o: "CAI A MENOR" }); continue; }
    if (vez.quem === "maior" && maior) { maior = revelar(maior, dia); linha.push({ dia, o: "CAI A MAIOR" }); continue; }
    const pM = cuidar(maior, dia);
    if (pM) { linha.push({ dia, o: maior.semeada ? "a maior rega" : "a maior semeia" }); maior = pM; }
  }
  return { idMenor, idMaior, menor, maior, livro, linha };
};

const diaDe = (linha, o) => { const x = linha.filter((e) => e.o === o); return x.length ? x[x.length - 1].dia : -1; };
const quantasVezes = (linha, o) => linha.filter((e) => e.o === o).length;

/* os números desta prova, numa tabela que ela lê de volta — nenhum deles
   é escolha de gosto, e o horizonte não pode ser "um número grande" */
const CAMPANHAS_DE_PROVA = {
  /* quantas sementes de mundo: o bastante para as três maiores e as
     quatro menores saírem eleitas em combinações diferentes (a seção 10b
     confere que saem mesmo) */
  quantas: 40,
  /* o horizonte de cada campanha, em amadurecimentos INTEIROS da maior:
     seis deles. É folga sobre o pior caso e não um teto adivinhado — se
     uma campanha não fechar dentro disso, alguma coisa travou, e travar
     é exatamente o defeito que a fase inteira veio desfazer. */
  amadurecimentosDeFolga: 6,
};

sec("10b. R4 — o ciclo com dias que passam, contra o Livro de verdade");
{
  /* A FASE VISTA DE FORA, que a pauta pediu e nunca foi provada. Até
     aqui os helpers `semearNo` e `livroDe` plantam e regam NUM DIA SÓ:
     eles provam a catraca do Livro, não o relógio. A condição de rega do
     App — `dia - (rev.regadaEm || 0) >= diasEntreRegasDe(rev.forma)` —
     nunca tinha rodado em teste nenhum, e é dela que sai o ritmo inteiro
     que R3 escreveu na tabela. Aqui ela roda quarenta campanhas, dia a
     dia, com o `promessas.js` de verdade no meio. */
  const T = R.RITMO_DAS_VIRADAS;
  const sementesDe = (id) => R.formaPorId(id).sementes.length;
  const amadurecimentoMaximoDaMaior = Math.max(...MAIORES.map((id) => sementesDe(id) * T.diasEntreRegas.maior));
  const HORIZONTE = CAMPANHAS_DE_PROVA.amadurecimentosDeFolga * amadurecimentoMaximoDaMaior;

  /* O MUNDO SERVE ÀS SETE, e serve o alvo que a TABELA promete — sem
     esta linha a varredura abaixo poderia passar por vacuidade.
     Forma sem linha na tabela NÃO pode estourar aqui: quem a acusa é o
     dente da seção 8, e uma suíte que morre de exceção esconde todos os
     outros dentes justamente no dia em que eles têm algo a dizer. */
  const divergentes = R.FORMAS.filter((f) => R.alvoDaForma(f.id, MUNDO_INTEIRO) !== (MUNDOS_DE_PROVA[f.id] || {}).alvo).map((f) => f.id);
  t("o mundo inteiro entrega às sete formas o alvo de MUNDOS_DE_PROVA", divergentes.length === 0, divergentes.join(", "));

  const sementes = [];
  for (let i = 0; i < CAMPANHAS_DE_PROVA.quantas; i++) sementes.push("campanha-" + i + "|fantasia");
  const corridas = sementes.map((s) => ({ s, r: rodarACampanha(s, { dias: HORIZONTE }) }));

  /* a prova não pode ser de uma dupla só: as três maiores e as quatro
     menores têm de aparecer em alguma campanha deste lote */
  const duplas = new Set(corridas.map(({ r }) => r.idMenor + "→" + r.idMaior));
  const menoresVistas = new Set(corridas.map(({ r }) => r.idMenor));
  const maioresVistas = new Set(corridas.map(({ r }) => r.idMaior));
  console.log(`      ${corridas.length} campanhas de ${HORIZONTE} dias · ${duplas.size} duplas distintas`);
  t("as quatro menores e as três maiores vivem o ciclo inteiro neste lote",
    menoresVistas.size === MENORES.length && maioresVistas.size === MAIORES.length,
    `${menoresVistas.size} menores · ${maioresVistas.size} maiores`);

  const naoCairam = [], foraDeOrdem = [], semFolga = [], cairamDuasVezes = [], noMesmoDia = [], alvoDividido = [];
  const cedoDemaisMenor = [], cedoDemaisMaior = [], regaForaDoRitmo = [], livroSujo = [], semeouDuasVezes = [];
  for (const { s, r } of corridas) {
    const marca = `${s} (${r.idMenor}→${r.idMaior})`;
    if (!r.menor || !r.menor.revelada || !r.maior || !r.maior.revelada) { naoCairam.push(marca); continue; }
    if (!(r.menor.reveladaEm < r.maior.reveladaEm)) foraDeOrdem.push(marca + ` menor@${r.menor.reveladaEm} maior@${r.maior.reveladaEm}`);
    if (r.maior.reveladaEm - r.menor.reveladaEm < T.folgaEntreViradas) semFolga.push(marca);
    if (quantasVezes(r.linha, "CAI A MENOR") !== 1 || quantasVezes(r.linha, "CAI A MAIOR") !== 1) cairamDuasVezes.push(marca);
    if (r.menor.reveladaEm === r.maior.reveladaEm) noMesmoDia.push(marca);
    if (r.menor.alvo === r.maior.alvo) alvoDividido.push(marca + " → " + r.menor.alvo);
    /* uma semeadura por virada: é o `semeada: true` do App, e é ele que
       torna a murcha de `fecharAto` irreversível (seção 10d) */
    if (quantasVezes(r.linha, "a menor semeia") !== 1 || quantasVezes(r.linha, "a maior semeia") !== 1) semeouDuasVezes.push(marca);

    /* O RITMO, LIDO DA TABELA E NUNCA CRAVADO. A menor tem prioridade e
       por isso o passo 3 dela nunca é bloqueado: ela semeia no dia 0 e
       rega em p, 2p, ... n·p — exato. E cai no dia seguinte à última
       rega, porque no dia da rega o gesto do turno já foi gasto. */
    const nM = sementesDe(r.idMenor), pM = T.diasEntreRegas.menor;
    const ultimaRega = diaDe(r.linha, "a menor rega");
    if (quantasVezes(r.linha, "a menor rega") !== nM) regaForaDoRitmo.push(marca + ` ${quantasVezes(r.linha, "a menor rega")} regas, esperava ${nM}`);
    else if (ultimaRega !== nM * pM) regaForaDoRitmo.push(marca + ` última rega da menor no dia ${ultimaRega}, esperava ${nM * pM}`);
    if (r.menor.reveladaEm !== nM * pM + 1) cedoDemaisMenor.push(marca + ` caiu no dia ${r.menor.reveladaEm}, esperava ${nM * pM + 1}`);

    /* Para a MAIOR o piso é `>=` e não `===`, e o motivo é de mecanismo:
       o passo 5 dela só roda nos dias em que a menor não gastou o turno,
       então uma rega pode ser empurrada um dia adiante. O que a tabela
       garante é o PISO — nunca menos que o amadurecimento inteiro dela
       contado da semeadura. Um `===` aqui estaria medindo o intercalar,
       que não é lei nenhuma. */
    const nMa = sementesDe(r.idMaior), pMa = T.diasEntreRegas.maior;
    const semeouEm = diaDe(r.linha, "a maior semeia");
    if (quantasVezes(r.linha, "a maior rega") !== nMa) cedoDemaisMaior.push(marca + ` ${quantasVezes(r.linha, "a maior rega")} regas da maior, esperava ${nMa}`);
    else if (r.maior.reveladaEm - semeouEm < nMa * pMa) cedoDemaisMaior.push(marca + ` ${r.maior.reveladaEm - semeouEm}d desde a semeadura, mínimo ${nMa * pMa}`);

    /* O LIVRO DE VERDADE FECHOU A CONTA: cada virada plantou as sementes
       DELA e colheu as DELA, e nenhuma sobra imatura ficou para trás. É
       o que separa "a revelação aconteceu" de "a revelação pagou". */
    const pagasMenor = r.livro.sementes.filter((x) => x.dona === "reviravolta" && x.alvo === r.menor.alvo && x.estado === "paga").length;
    const pagasMaior = r.livro.sementes.filter((x) => x.dona === "reviravolta" && x.alvo === r.maior.alvo && x.estado === "paga").length;
    const sobrando = r.livro.sementes.filter((x) => x.dona === "reviravolta" && x.estado !== "paga").length;
    if (pagasMenor !== nM || pagasMaior !== nMa || sobrando !== 0) livroSujo.push(marca + ` menor ${pagasMenor}/${nM} · maior ${pagasMaior}/${nMa} · sobrando ${sobrando}`);
  }
  t("toda campanha vive as DUAS viradas dentro do horizonte", naoCairam.length === 0, naoCairam.slice(0, 3).join(" · "));
  t("cada virada semeia UMA vez só (é o `semeada: true` do App)", semeouDuasVezes.length === 0, semeouDuasVezes.slice(0, 3).join(" · "));
  t("a menor cai antes da maior, em toda campanha", foraDeOrdem.length === 0, foraDeOrdem.slice(0, 3).join(" · "));
  t(`e nunca a menos de ${T.folgaEntreViradas} dias dela (a folga da tabela)`, semFolga.length === 0, semFolga.slice(0, 3).join(" · "));
  t("nenhuma das duas cai duas vezes", cairamDuasVezes.length === 0, cairamDuasVezes.slice(0, 3).join(" · "));
  t("e nunca as duas no mesmo dia", noMesmoDia.length === 0, noMesmoDia.slice(0, 3).join(" · "));
  t("as duas nunca dividem alvo num ciclo inteiro", alvoDividido.length === 0, alvoDividido.slice(0, 3).join(" · "));
  t("a menor rega uma vez por semente, no ritmo exato da tabela (semeia no 0, rega em p, 2p, … n·p)", regaForaDoRitmo.length === 0, regaForaDoRitmo.slice(0, 3).join(" · "));
  t("e cai no dia seguinte à última rega — nem um dia antes", cedoDemaisMenor.length === 0, cedoDemaisMenor.slice(0, 3).join(" · "));
  t("a maior rega uma vez por semente e nunca cai antes do amadurecimento inteiro dela", cedoDemaisMaior.length === 0, cedoDemaisMaior.slice(0, 3).join(" · "));
  t("o Livro real fecha a conta das duas: tudo plantado, tudo pago, nada imaturo sobrando", livroSujo.length === 0, livroSujo.slice(0, 3).join(" · "));

  /* DETERMINISMO DO CICLO INTEIRO, e não só da eleição: a mesma semente
     vive a mesma campanha, dia a dia. É o único árbitro de um sistema sem
     servidor, e aqui ele se mede sobre a linha do tempo toda. */
  const instaveis = sementes.filter((s) => JSON.stringify(rodarACampanha(s, { dias: HORIZONTE }).linha) !== JSON.stringify(rodarACampanha(s, { dias: HORIZONTE }).linha));
  t("a mesma semente vive a mesma campanha, dia a dia", instaveis.length === 0, instaveis.slice(0, 3).join(", "));

  /* ADIAR NÃO É CANCELAR, agora com dias de verdade passando. A seção 9g
     provou a lei sobre um estado montado à mão; aqui o episódio fica
     aberto além do amadurecimento inteiro da maior, e ela ainda assim
     cai depois — e a menor cai no MESMO dia que cairia sem episódio
     nenhum, que é a regressão zero em campanha viva. */
  const EP_ATE = amadurecimentoMaximoDaMaior + T.folgaEntreViradas;
  const menorAtrasada = [], maiorCancelada = [], maiorAtropelou = [];
  for (const { s, r } of corridas) {
    const c = rodarACampanha(s, { dias: HORIZONTE + EP_ATE, episodioAteODia: EP_ATE });
    if (!c.menor || !c.menor.revelada || c.menor.reveladaEm !== r.menor.reveladaEm) menorAtrasada.push(s);
    if (!c.maior || !c.maior.revelada) maiorCancelada.push(s);
    else if (c.maior.reveladaEm <= EP_ATE) maiorAtropelou.push(s + ` caiu no dia ${c.maior.reveladaEm}, com episódio aberto até ${EP_ATE}`);
  }
  t(`com episódio aberto até o dia ${EP_ATE}, a menor cai no mesmo dia de sempre (regressão zero)`, menorAtrasada.length === 0, menorAtrasada.slice(0, 3).join(", "));
  t("e a maior ainda cai — o episódio adia, nunca cancela", maiorCancelada.length === 0, maiorCancelada.slice(0, 3).join(", "));
  t("mas nunca durante ele", maiorAtropelou.length === 0, maiorAtropelou.slice(0, 3).join(" · "));
}

sec("10c. R4 — elegerReviravoltas COMPOSTA com alvoDaForma (as duas pontas se juntam)");
{
  /* As duas metades eram provadas SEPARADAS: a 9i prova que toda semente
     elege uma dupla válida, e a 8 prova que todo detector acha alguém no
     mundo dele. Faltava a junta — `MUNDOS_DE_PROVA` nunca entrava num
     ciclo e `elegerReviravoltas` nunca recebia um mundo, e entre uma
     coisa e outra cabe o bug de sempre: a semente elege uma forma que o
     acervo de prova não conhece, ou conhece e não acha ninguém. Aqui não
     se reescreve nenhuma das duas pontas — prova-se a junta. */
  const sementes = [];
  for (let i = 0; i < 300; i++) sementes.push("mundo-" + i + "|fantasia");

  /* ① a dupla eleita, no mundo que serve às sete: as duas acham alguém, e
     alvos DIFERENTES — senão a tranca do alvo dividido barraria uma das
     duas antes de o arco começar */
  const semAlvo = [], mesmoAlvo = [];
  const eleitas = new Set();
  for (const s of sementes) {
    const { menor, maior } = R.elegerReviravoltas(s);
    eleitas.add(menor); eleitas.add(maior);
    const aMenor = R.alvoDaForma(menor, MUNDO_INTEIRO), aMaior = R.alvoDaForma(maior, MUNDO_INTEIRO);
    if (!aMenor || !aMaior) semAlvo.push(`${s}: ${menor}=${JSON.stringify(aMenor)} · ${maior}=${JSON.stringify(aMaior)}`);
    else if (aMenor === aMaior) mesmoAlvo.push(`${s}: ${menor} e ${maior} → ${aMenor}`);
  }
  t("toda dupla eleita acha alvo num mundo que a serve (300 sementes)", semAlvo.length === 0, semAlvo.slice(0, 3).join(" · "));
  t("e os dois alvos são gente (ou lugar) diferente — as duas cabem no mesmo mundo", mesmoAlvo.length === 0, mesmoAlvo.slice(0, 3).join(" · "));
  /* a prova não pode ser vazia: se a eleição travasse numa dupla só, a
     varredura acima estaria provando duas formas e dizendo "sete" */
  t("as SETE formas saem eleitas nessas sementes (a composição cobre a prateleira inteira)", eleitas.size === R.FORMAS.length, [...eleitas].join(", "));

  /* ② e no mundo MÍNIMO de cada uma, o da tabela: é onde a linha de
     `MUNDOS_DE_PROVA` encontra a eleição pela primeira vez */
  const semMundo = [...eleitas].filter((id) => !MUNDOS_DE_PROVA[id]);
  t("toda forma que 300 sementes elegem tem linha em MUNDOS_DE_PROVA", semMundo.length === 0, "sem mundo: " + semMundo.join(", "));
  const divergiu = [...eleitas].filter((id) => MUNDOS_DE_PROVA[id] && R.alvoDaForma(id, MUNDOS_DE_PROVA[id].mundo) !== MUNDOS_DE_PROVA[id].alvo);
  t("e nele acha o alvo que a tabela promete (eleição → detector, a junta fechada)", divergiu.length === 0, "não acharam: " + divergiu.join(", "));

  /* ③ A JUNTA INTEIRA, até o Livro: o alvo que o detector devolve é o que
     planta, rega e abre a catraca da própria forma. É a cadeia
     eleição → alvo → sementes → revelação, para cada forma alcançável —
     e é o que garante que nenhuma eleita seja acervo mudo. */
  const mudas = [];
  for (const id of eleitas) {
    const alvo = R.alvoDaForma(id, MUNDO_INTEIRO);
    if (typeof alvo !== "string" || !alvo.trim()) { mudas.push(id + ":sem alvo"); continue; }
    let L = P.garantirLivro(null);
    for (const spec of R.sementesDaReviravolta(id, { alvo, ato: 1, dia: 1 })) { const r = P.semear(L, spec); L = P.regar(r.livro, r.semente.id, { dia: 1 }).livro; }
    if (!R.podeRevelar(id, L, { alvo })) mudas.push(id + ":catraca fechada");
  }
  t("toda forma eleita planta no alvo do próprio detector e abre a própria catraca", mudas.length === 0, mudas.join(" · "));
}

/* ============================================================
   10d. R4 — `fecharAto`: UM BILHETE PARA O FUTURO

   ISTO É UM BILHETE, e não uma regra sobre hoje. `fecharAto`
   (promessas.js) murcha toda semente não paga de um ato, e HOJE não tem
   chamador nenhum em `src/` — por isso é inofensivo. No dia em que
   ganhar um, ele encosta na reviravolta assim, e o vínculo inteiro está
   escrito aqui porque quem chegar com a asserção vermelha na mão precisa
   dele:

     · o App semeia as sementes da virada UMA VEZ SÓ — `cuidarDasSementes`
       grava `semeada: true` e nunca mais entra naquele ramo;
     · as sementes nascem com `ato` = etapa da história (`historiaRef`);
     · `fecharAto` põe as não pagas daquele ato em `estado: "murcha"`;
     · o passo de rega procura imatura em `semeada|regada` — murcha não
       está na lista, então NUNCA MAIS há o que regar;
     · logo a menor nunca mais amadurece, e nunca revela;
     · e o ramo ② de `quemPodeRevelar` ("a menor vem primeiro") NÃO TEM
       ESCAPE TEMPORAL — só o nascimento da maior tem
       (`diasDeEsperaPelaMenor`). A maior ficaria trancada SEM PRAZO:
       acervo escrito que não pode mais acontecer, que é exatamente o
       defeito que a Fase R veio desfazer, com roupa nova.

   Quando esta seção ficar vermelha, ela NÃO é o erro: é o aviso de que a
   decisão chegou. As duas saídas, e a escolha é de quem mexer:
     · DAR ESCAPE AO RAMO ② — a maior passa a poder cair quando a menor
       está parada há tantos dias (o molde já existe em
       `diasDeEsperaPelaMenor`); ou
     · FAZER A REVIRAVOLTA RESSEMEAR o que murchou — `cuidarDasSementes`
       deixa de olhar só `semeada` e passa a olhar se ainda há semente
       viva daquele alvo no Livro.
   Resolvida a escolha, esta asserção muda de forma — com o motivo
   escrito, como manda a casa. O que ela não pode é ser apagada em
   silêncio.
   ============================================================ */
sec("10d. R4 — o bilhete do `fecharAto`: a prova que trava o vínculo");
{
  /* A VARREDURA É DA PASTA INTEIRA, e não de uma lista escrita à mão: com
     lista, o arquivo novo entraria sem ser olhado — a mesma doença de
     "export morto mente". Fora de `src/` ele é inofensivo: quem murcha
     semente de campanha é o jogo, não a API; `teste-promessas.mjs` chama,
     e é teste, não produção. Conta-se o NOME e não a chamada, porque uma
     referência solta (`const f = fecharAto;`) liga a função do mesmo
     jeito. */
  const arqs = readdirSync("../src").filter((f) => /\.(jsx?|mjs)$/.test(f));
  const chamadores = [];
  for (const f of arqs) {
    const n = (semComentarios(readFileSync("../src/" + f, "utf8")).replace(/^\s*\/\/.*$/gm, "").match(/\bfecharAto\b/g) || []).length;
    /* em promessas.js a própria declaração conta uma vez, e só ela */
    const esperado = f === "promessas.js" ? 1 : 0;
    if (n > esperado) chamadores.push(`${f} (${n})`);
  }
  t("a varredura olhou a pasta src inteira (lista curta mentiria)", arqs.length > 100, String(arqs.length));
  t("fecharAto segue sem chamador em src/ — o dia em que ganhar um, decida o item da pauta antes",
    chamadores.length === 0, "ganhou chamador em: " + chamadores.join(", "));
  t("e ele continua existindo (o bilhete é sobre uma função viva, não sobre um fantasma)", typeof P.fecharAto === "function");

  /* E O MECANISMO, MONTADO DE VERDADE — para que o bilhete não seja um
     grep com uma história pendurada. Isto é o que acontece, passo a
     passo, no dia em que alguém ligar `fecharAto` sem resolver o item: */
  let L = P.garantirLivro(null);
  for (const spec of R.sementesDaReviravolta(MENOR, { alvo: "Ume", ato: 1, dia: 1 })) L = P.semear(L, spec).livro;
  const fecho = P.fecharAto(L, 1, { dia: 5 });
  t("virar o ato murcha as sementes não pagas da menor", fecho.murchou.length === R.formaPorId(MENOR).sementes.length, String(fecho.murchou.length));
  t("e a rega do App não acha mais nada para regar (murcha não é `semeada` nem `regada`)",
    !fecho.livro.sementes.some((s) => s.dona === "reviravolta" && s.alvo === "Ume" && (s.estado === "semeada" || s.estado === "regada")));
  t("logo a menor nunca mais amadurece — e o App semeia uma vez só (`semeada: true`)",
    R.podeRevelar(MENOR, fecho.livro, { alvo: "Ume" }) === false);
  /* e a maior, madura e dona do alvo dela, fica trancada sem prazo */
  let comMaior = fecho.livro;
  for (const spec of R.sementesDaReviravolta(MAIOR, { alvo: "Halvard", ato: 1, dia: 6 })) { const r = P.semear(comMaior, spec); comMaior = P.regar(r.livro, r.semente.id, { dia: 6 }).livro; }
  t("a maior está madura e é dona do alvo dela", R.podeRevelar(MAIOR, comMaior, { alvo: "Halvard" }) === true);
  const abriu = [30, 60, 200, 9999].filter((dia) => R.quemPodeRevelar({
    menor: { forma: MENOR, alvo: "Ume" }, maior: { forma: MAIOR, alvo: "Halvard" }, livro: comMaior, episodioAberto: false, dia,
  }).quem === "maior");
  t("e mesmo assim a maior fica trancada para sempre pelo ramo ② (é a conta do bilhete)", abriu.length === 0, "abriu nos dias: " + abriu.join(","));
}

sec("10e. R4 — todo porte é um porte da tabela");
{
  /* A catraca "4 menores e 3 maiores" (seção 1b) conta os dois portes
     conhecidos e NÃO vê um terceiro: uma forma com `porte: "medio"`
     deixa os dois contadores intactos, `diasEntreRegasDe` a trata como
     menor pelo caminho conservador, e `elegerReviravoltas` — que filtra
     por "menor" e por "maior" — nunca a elege. Acervo escrito que não
     pode acontecer, que é o bug da fase inteira. Uma linha fecha. */
  const fora = R.FORMAS.filter((f) => !R.PORTES.includes(f.porte)).map((f) => `${f.id}=${JSON.stringify(f.porte)}`);
  t("toda forma tem um porte que PORTES conhece", fora.length === 0, "porte estranho: " + fora.join(", "));
  /* e o avesso: nenhum porte da tabela fica sem forma nenhuma, senão a
     eleição sortearia de uma lista vazia */
  const vazios = R.PORTES.filter((p) => !R.FORMAS.some((f) => f.porte === p));
  t("e todo porte da tabela tem pelo menos uma forma", vazios.length === 0, "porte sem forma: " + vazios.join(", "));
}

console.log(`\n${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
