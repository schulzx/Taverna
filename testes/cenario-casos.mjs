/* cenario-casos.mjs (Fase T, T4-B · o cenário como arquivo, 1.ª a 5.ª fatias, 28/10/2026)

   A fotografia dos catálogos que passaram a ler do cenário — os preços
   (economia.js, e o mercado que os consome), as ocupações (classes.js
   PROFISSOES, e profissoes.js/prontos.js que as consomem) e, na 2.ª fatia,
   os gêneros e os ofícios do léxico (lexico.js GENEROS_FUTURISTAS,
   PROFISSOES_DO_SISTEMA, as marcas do gênero próprio e o gênero padrão do
   pedido; classes.js racasDoGenero e a ficha da cidade, que os leem) e, na
   3.ª, o bestiário (bestiario.js CRIATURAS_FANTASIA, ARQUETIPOS e o corte
   por gênero; completarInimigo, a criatura na frase da emboscada, a ficha
   da masmorra, as masmorras semeadas, os bichos e os chefes do mundo) e, na
   4.ª, a gente e o panteão (nomes.js: os bancos de nome por gênero, os povos,
   os ofícios e os traços do elenco, o sexo de um nome, os nomes à mão;
   divindades.js: as sílabas do nome divino, os domínios e os cultos; e a
   gente dos locais de mundo-base.js, que os lê) e, na 5.ª, os lugares
   (toponimia.js: as tavernas e os locais por gênero, e os locais das cidades
   de mundo-base.js), as raças da criação (classes.js RACAS/ORIGENS, lexico.js
   GRUPOS_DE_RACA, e quem as lê: tracos.js, a ficha de criação, o companheiro,
   os prontos, o léxico que as renomeia) e as palavras do céu (a escala, o
   DIVINDADE_PROMPT, os títulos, o sinal do temperamento). Não é suíte: é a
   lista de perguntas que o `gerar-cenario-dourado.mjs` faz ao código de ANTES
   (lido do git) e que a `teste-cenario.mjs` refaz ao código de AGORA. As duas
   respostas têm de ser iguais byte a byte.

   `raiz` é a pasta `src/` a fotografar (o código de antes mora numa cópia
   tirada com `git archive`). O que sai é só JSON: a regex vira o seu texto. */
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";

const imp = (raiz, f) => import(pathToFileURL(path.join(raiz, f)).href);
/* o pedido do léxico tem ~17 mil caracteres: guarda-se inteiro em três
   mundos, e nos outros a impressão digital dele mais as linhas que o gênero
   e os ofícios escrevem (é ali que a diferença se lê) */
const digital = (txt) => ({ tam: txt.length, sha: createHash("sha256").update(txt).digest("hex").slice(0, 16), linhas: txt.split("\n").filter((l) => /Gênero:|<UM de:/.test(l)) });
const rxEmTexto = (o) => JSON.parse(JSON.stringify(o, (k, v) => (v instanceof RegExp ? String(v) : v)));

/* as perguntas, fixas: mudar uma é mudar o dourado (refaça-o com o gerador) */
export const FRASES_DE_PRECO = [
  "quanto custa uma cerveja?", "quanto custa a refeição quente?", "qual o preço do vinho?",
  "quanto custa um pão e uma maçã?", "e o banquete, quanto sai?", "quanto cobra para consertar a ferradura?",
  "quanto quer por me guiar até o vau?", "quanto custa um mensageiro?", "qual o preço da travessia de barco?",
  "quanto você quer pra falar?", "quanto é o pedágio?", "quanto custam as uvas e os figos?", "bom dia, senhor",
];
export const FATORES = [undefined, null, "x", -1, 0, 0.3, 0.5, 0.7, 1, 1.25, 1.5, 2, 3, "1.3"];
export const ITENS_SOLTOS = [null, undefined, "corda", {}, { raridade: "comum" }, { raridade: "incomum" }, { raridade: "raro" }, { raridade: "epico" }, { raridade: "lendario" }, { raridade: "unico" }, { raridade: "nada" }, { nome: "x" }];
export const CIDADES = [
  { nome: "Vau Fundo", porte: "aldeia" }, { nome: "Pedra Alta", porte: "vila" },
  { nome: "Porto Sal", porte: "cidade" }, { nome: "Coroa", porte: "capital" }, { nome: "Torre", porte: "metropole" },
];
export const SEMENTES = 500;
/* 2.ª fatia: os gêneros. Os seis da criação (constantes.js GENEROS), o livre,
   e o lixo; as descrições cobrem cada marca do gênero próprio, com acento e
   caixa trocados, e as que não marcam nada. */
export const GENEROS_DE_PROVA = [
  "Fantasia medieval", "Ficção científica", "Cyberpunk", "Horror cósmico", "Pós-apocalíptico", "Steampunk",
  "Universo próprio", "", null, undefined, "cyberpunk", "Ficcao cientifica", 7,
];
export const DESCRICOES = [
  "", "Reinos antigos, magia e dragões.", "Um mundo como Solo Leveling, com portais.", "Anime de escola com poderes.",
  "Inspirado no mangá de piratas.", "Um manhwa de torres.", "Isekai: acordei noutro mundo.", "CYBERPUNK nas favelas de neon.",
  "Ficção Científica dura, sem magia.", "sci-fi de colônia", "scifi barato", "Um futuro sombrio.", "Futurista e limpo.",
  "Naves mercantes entre luas.", "A nave-mãe caiu.", "Ópera espacial.", "Guerra galáctica.", "Planetas mortos.",
  "Rio de Janeiro moderno.", "Uma cidade contemporânea.", "O metrô de São Paulo.", "Arranha-céus e fumaça.",
  "Todo mundo tem celular.", "A internet caiu.", "Pós-apocalíptico com ratos.", "Zumbis no interior.",
  "Inspirada em Tolkien.", "Baseado em Duna.", "No universo de Star Wars.", "No estilo de Ghibli.",
  "Navegantes do mar do norte.", "Uma metrópole de vapor.", "Galés e piratas.", "Planície de lobos.",
];
/* 3.ª fatia: o bestiário. Os nomes compostos e os que não existem, no
   inimigo que o Narrador abre e na frase do jogador. */
export const INIMIGOS_SOLTOS = ["Lobo Atroz Velho", "o goblin arqueiro", "Capanga do Barão", "Aberração do Sétimo Selo", "", "TROLL DAS PONTES", "Dragão"];
export const NIVEIS = [1, 4, 9, 16];
export const SEMENTES_DE_MASMORRA = 40;
/* 4.ª fatia: a gente e o panteão. Quantos nomes se tiram por gênero, e quantas
   divindades, panteões e eventos semeados; o léxico que manda nos nomes (o
   banco do mundo gerado ganha do banco do gênero, e tem de continuar a ganhar) */
export const NOMES_POR_GENERO = { cidades: 30, pessoas: 12, diversas: 12, elenco: 8 };
export const DIVINDADES_SEMEADAS = 60;
export const LEXICO_DE_NOMES = { nomes: { masc: ["Kau", "Ruan", "Tiê", "Moacir", "Sepé", "Ubiratã"], fem: ["Iracema", "Jaci", "Potira", "Moema", "Iara", "Araci"], sobrenome: ["do Rio", "da Mata", "Pedra-Alta", "Sem-Nome"] }, povos: ["ribeirinho", "serrano"], oficios: ["remeiro", "erveira", "pajé", "caçador de onça"] };
/* 5.ª fatia: os lugares, as raças da criação e os títulos do céu — quantos
   nomes de lugar por gênero, os atributos com que a ficha de prova nasce, e
   quantos eventos por deus de temperamento marcado (o sinal da tempestade
   era um caso escrito no código, e passou a dado do domínio) */
export const LUGARES_POR_GENERO = { tavernas: 30, locais: 6 };
export const ATRIBUTOS_DE_PROVA = { forca: 3, destreza: 2, vigor: 1, intelecto: 0, presenca: 2, percepcao: 1 };
export const SINAIS_POR_DEUS = 24;
export const CIDADES_DA_FICHA = [
  { nome: "Vau Fundo", porte: "aldeia", regiao: "Charneca" }, { nome: "Porto Sal", porte: "cidade", regiao: "Costa Rasa" },
  { nome: "Coroa", porte: "capital", regiao: "Planalto" }, { nome: "Forte Cinza", porte: "fortaleza", regiao: "Fronteira" },
];

export async function fotografarOsCatalogos(raiz) {
  const E = await imp(raiz, "economia.js");
  const M = await imp(raiz, "mercado.js");
  const C = await imp(raiz, "classes.js");
  const P = await imp(raiz, "profissoes.js");
  const R = await imp(raiz, "prontos.js");
  const LX = await imp(raiz, "lexico.js");
  const CD = await imp(raiz, "cidade-por-dentro.js");
  const B = await imp(raiz, "bestiario.js");
  const EM = await imp(raiz, "emboscada.js");
  const MA = await imp(raiz, "masmorras.js");
  const MB = await imp(raiz, "mundo-base.js");
  const G = await imp(raiz, "geografia.js");
  const NM = await imp(raiz, "nomes.js");
  const DV = await imp(raiz, "divindades.js");
  const SM = await imp(raiz, "semente.js");
  const TP = await imp(raiz, "toponimia.js");
  const TR = await imp(raiz, "tracos.js");
  const AT = await imp(raiz, "atributos.js");
  const CP = await imp(raiz, "companheiros.js");
  const casos = [];
  const caso = (id, saida) => casos.push({ id, saida: rxEmTexto(saida === undefined ? null : saida) });

  /* ---- os preços ---- */
  caso("economia.prompt", E.ECONOMIA_PROMPT);
  caso("economia.regras", { venda: E.PRECO_VENDA, compra: E.FAIXA_COMPRA, rua: E.PRECOS_DA_RUA, fator: E.FATOR_DO_PRECO, grafia: E.GRAFIA_DA_RUA });
  caso("economia.comuns", E.PRECOS_COMUNS);
  caso("economia.valorDeItem", ITENS_SOLTOS.map((it) => E.valorDeItem(it)));
  for (const p of [...E.PRECOS_COMUNS.map((x) => x.id), "nada"]) caso("economia.precoComum." + p, FATORES.map((f) => E.precoComum(p, f)));
  for (const f of [0.7, 1, 1.5]) for (const fr of FRASES_DE_PRECO) caso(`mercado.pauta.${f}.${fr}`, M.precoComumParaPauta(fr, { fator: f, moeda: f === 1 ? "coroas" : "" }));
  for (const f of [0.5, 1, 1.4, 2]) caso("mercado.rua." + f, M.precosDaRua(f, { moeda: "marcos" }));
  for (let i = 0; i < SEMENTES; i++) {
    const cidade = CIDADES[i % CIDADES.length];
    const m = M.gerarMercador({ cidade, semente: "dourado-do-cenario|" + i, nivel: 1 + (i % 12), dia: 1 + (i % 40) });
    caso("mercado.banca." + i, {
      tipo: m.tipo,
      estoque: m.estoque.map((it) => [it.nome, it.raridade || null, it.preco, M.precoQueOferecem(it, cidade, { dia: 1 + (i % 40) })]),
    });
  }

  /* ---- as ocupações ---- */
  caso("classes.profissoes", C.PROFISSOES);
  caso("profissoes.prompt", P.PROFISSOES_PROMPT);
  const oficios = ["utilitario", "alquimia", "armas", "tudo", ""];
  const attrs = ["intelecto", "percepcao", "forca", "carisma", ""];
  const nomes = [...C.PROFISSOES.map((p) => p.nome), "ferreiro", "MERCADOR", "Inexistente", "", null];
  for (const n of nomes) {
    const pers = n === null ? null : { profissao: n };
    caso("profissoes.de." + String(n), {
      bancada: oficios.map((o) => P.bonusDeBancada(pers, o)),
      colher: P.componentesExtras(pers), navegar: P.bonusDeNavegacao(pers), despojos: P.despojosExtras(pers),
      teste: attrs.map((a) => P.bonusDeTeste(pers, a)),
      cura: [P.curaExtraDoHeroi(pers), P.curaExtraDoGrupo(pers)],
      venda: [0, 1, 7, 100, -3, "x"].map((b) => P.precoDeVenda(pers, b)),
      compra: [0, 1, 7, 100, -3, "x"].map((b) => P.precoDeCompraPara(pers, b)),
      espolio: [0, 1, 7, 100].map((b) => P.moedasDeEspolio(pers, b)),
      resumo: P.resumoProfissaoPrompt(pers),
      valida: R.profissaoValida(n),
    });
  }

  /* ---- 2.ª fatia: os gêneros e os ofícios do léxico ---- */
  caso("lexico.tabelas", { profissoes: LX.PROFISSOES_DO_SISTEMA, futuristas: LX.GENEROS_FUTURISTAS, racas: LX.RACAS_DO_SISTEMA });
  for (const g of GENEROS_DE_PROVA) {
    caso("lexico.genero." + String(g), {
      racasDoMundo: LX.racasDoMundo(g),
      racasDoGenero: C.racasDoGenero(g).map((r) => r.nome),
      proprio: [LX.generoProprio({ genero: g }), LX.generoProprio({ genero: g, descricao: "Reinos e dragões." })],
    });
  }
  for (const d of DESCRICOES) caso("lexico.proprio." + d, ["Fantasia medieval", "Universo próprio", "Cyberpunk", ""].map((g) => LX.generoProprio({ genero: g, descricao: d })));
  caso("lexico.proprio.lixo", [null, undefined, "x", 3, {}, [], { descricao: 7 }, { genero: ["Cyberpunk"] }].map((m) => LX.generoProprio(m)));
  for (const g of GENEROS_DE_PROVA) for (const d of ["", "Um mundo como Solo Leveling."]) caso(`lexico.pedido.${String(g)}.${d}`, digital(LX.pedidoDoLexico({ genero: g, descricao: d })));
  caso("lexico.pedido.lixo", [null, undefined, {}].map((m) => digital(LX.pedidoDoLexico(m))));
  caso("lexico.pedido.inteiro", [{ genero: "Fantasia medieval" }, { genero: "Cyberpunk", descricao: "neon" }, null].map((m) => LX.pedidoDoLexico(m)));
  /* os ofícios renomeados: o banco completo (com caixa trocada), um a menos,
     um intruso, e o rótulo da ficha com e sem gênero próprio */
  const doze = LX.PROFISSOES_DO_SISTEMA.map((p, i) => ({ profissao: i % 3 === 1 ? p.toUpperCase() : p, chamado: "ofício " + i }));
  const bancos = { completo: doze, menosUm: doze.slice(1), intruso: [...doze.slice(1), { profissao: "Astronauta", chamado: "x" }], repetido: [...doze, { profissao: doze[0].profissao, chamado: "outro" }], vazio: [], lixo: null };
  for (const [nome, profissoes] of Object.entries(bancos)) {
    const lex = { profissoes };
    caso("lexico.oficios." + nome, {
      garantidos: LX.garantirLexico(lex).profissoes,
      chamado: [...LX.PROFISSOES_DO_SISTEMA, "Astronauta", "", null].map((n) => LX.chamadoDaProfissao(lex, n)),
      ficha: LX.PROFISSOES_DO_SISTEMA.map((n) => [LX.profissaoNaFicha(lex, n, true), LX.profissaoNaFicha(lex, n, false)]),
    });
  }
  /* a ficha da cidade lê o corte do futuro (a língua dos povos só fala no mundo de fantasia) */
  for (const g of ["Fantasia medieval", "Cyberpunk", "Pós-apocalíptico", "Steampunk", ""]) {
    for (const cid of CIDADES_DA_FICHA) for (const sem of ["dourado-genero|1", "dourado-genero|2", "dourado-genero|3"]) {
      caso(`cidade.ficha.${g}.${cid.nome}.${sem}`, CD.fichaDaCidade(cid, { semente: sem, genero: g }));
    }
  }

  /* ---- 3.ª fatia: o bestiário ---- */
  caso("bestiario.tabelas", { fantasia: B.CRIATURAS_FANTASIA, arquetipos: B.ARQUETIPOS });
  for (const g of GENEROS_DE_PROVA) caso("bestiario.genero." + String(g), B.criaturasDoGenero(g).map((c) => c.nome));
  const todas = [...B.CRIATURAS_FANTASIA, ...B.ARQUETIPOS].map((c) => c.nome);
  for (const n of [...todas, ...INIMIGOS_SOLTOS]) {
    caso("bestiario.completar." + n, NIVEIS.map((nv) => [B.completarInimigo({ nome: n }, nv), B.completarInimigo({ nome: n, vidaMax: 999, ameaca: "elite" }, nv)]));
  }
  caso("emboscada.naFrase", [...todas.map((n) => `vem aí um ${n.toLowerCase()} pela estrada`), ...todas.map((n) => `dois ${n}s e um capanga`), ...INIMIGOS_SOLTOS].map((f) => { const c = EM.criaturaNaFrase(f); return c ? c.nome : null; }));
  for (let i = 0; i < todas.length; i += 6) {
    const lote = todas.slice(i, i + 6);
    caso("masmorra.bichos." + i, [MA.bichosDaFicha(lote.map((nome) => ({ nome }))), MA.bichosDaFicha(lote.map((nome, k) => ({ nome, nivel: k * 3 })))]);
  }
  for (let i = 0; i < SEMENTES_DE_MASMORRA; i++) {
    const g = ["Fantasia medieval", "Cyberpunk", "Horror cósmico", "Steampunk"][i % 4];
    const mm = MA.gerarMasmorra(g, 1 + (i % 14), "", { sorte: G.rngDe("dourado-bestiario|" + i) });
    caso("masmorra.gerada." + i, (mm.salas || []).map((sa) => sa.inimigos || []));
  }
  const regioes = ["Charneca", "Costa Rasa", "Planalto", "Fronteira", "Mata Velha"].map((nome) => ({ nome }));
  for (const g of ["Fantasia medieval", "Cyberpunk", "Pós-apocalíptico", "Steampunk"]) {
    caso("mundo.bichos." + g, regioes.map((r) => MB.criaturasDaRegiao("dourado-bestiario", r, g)));
    caso("mundo.chefes." + g, MB.chefesDoMundo("dourado-bestiario", { regioes, cidades: [{ nome: "Coroa" }, { nome: "Vau" }] }, g));
  }

  /* ---- 4.ª fatia: a gente (nomes.js) ---- */
  caso("nomes.generos", NM.generosDisponiveis());
  caso("nomes.tracos", NM.TRACOS_PESSOA);
  const primeiros = new Set();
  const N = NOMES_POR_GENERO;
  const vezes = (n, f) => Array.from({ length: n }, (_, i) => f(i));
  for (const g of GENEROS_DE_PROVA) {
    const rnd = G.rngDe("dourado-nomes|" + String(g));
    const pessoas = ["masc", "fem", "", null].map((sx) => vezes(N.pessoas, () => NM.nomePessoa(g, sx, rnd)));
    pessoas.flat().forEach((n) => primeiros.add(n.split(" ")[0]));
    caso("nomes.genero." + String(g), {
      cidades: vezes(N.cidades, () => NM.nomeCidade(g, rnd)),
      pessoas,
      diversas: vezes(N.diversas, () => NM.pessoaDiversa(g, rnd)),
      comLexico: vezes(4, () => [NM.nomePessoa(g, "fem", rnd, LEXICO_DE_NOMES), NM.pessoaDiversa(g, rnd, LEXICO_DE_NOMES)]),
      elenco: SM.comSorte(G.rngDe("dourado-elenco|" + String(g)), () => NM.elencoDiverso(g, N.elenco)),
    });
  }
  const sexos = [...primeiros].sort();
  caso("nomes.sexo", [...sexos, "Wren", "Sable", "Golem", "WREN", "aldric punho-de-pedra", "", null, 7].map((n) => [n, NM.sexoDoNome(n)]));
  for (const g of ["Fantasia medieval", "Horror cósmico", "Steampunk", "Universo próprio", ""]) {
    for (const dia of [0, 1, 7]) caso(`nomes.aMao.${g}.${dia}`, [NM.nomesAMao({ semente: "dourado-nomes", dia, cidade: "Vau Fundo", genero: g }), NM.nomesAMao({ semente: "dourado-nomes", dia, cidade: "Coroa", genero: g, usados: sexos.slice(0, 40) })]);
  }
  caso("nomes.aMao.lexico", NM.nomesAMao({ semente: "dourado-nomes", dia: 3, cidade: "Vau", genero: "Cyberpunk", lex: LEXICO_DE_NOMES }));
  caso("nomes.aMao.lixo", [null, undefined, {}, "x", 3].map((o) => NM.nomesAMao(o)));
  /* quem lê os bancos no mundo: a gente de cada local */
  for (const g of ["Fantasia medieval", "Cyberpunk", "Horror cósmico", "Pós-apocalíptico"]) {
    for (const cid of CIDADES_DA_FICHA.slice(0, 3)) {
      const locais = MB.locaisDaCidade("dourado-gente", cid, g);
      caso(`mundo.gente.${g}.${cid.nome}`, (locais || []).map((l) => MB.genteDoLocal("dourado-gente", l, g)));
    }
  }

  /* ---- 4.ª fatia: o panteão (divindades.js) ---- */
  caso("divindades.geradas", vezes(DIVINDADES_SEMEADAS, (i) => DV.gerarDivindade({ lugar: i % 2 ? "Coroa" : "" }, i, { sorte: G.rngDe("dourado-deuses|" + i), gdFixo: i % 5 === 0 ? 2 : null })));
  caso("divindades.panteoes", vezes(20, (i) => DV.gerarPanteaoInicial({ lugar: "Vau" }, 10 + i, G.rngDe("dourado-panteao|" + i))));
  caso("divindades.eventos", vezes(40, (i) => {
    const pan = DV.gerarPanteaoInicial(null, i, G.rngDe("dourado-evento-pan|" + i));
    return [DV.gerarEventoDivino({ lugar: i % 3 ? "Coroa" : "" }, i, pan, G.rngDe("dourado-evento|" + i)), DV.gerarEventoDivino({}, i, pan.slice(0, 1), G.rngDe("dourado-evento1|" + i))];
  }));

  /* ---- 5.ª fatia: os lugares (toponimia.js, e os locais de mundo-base.js que a leem) ---- */
  caso("topo.generos", TP.generosDaToponimia());
  caso("topo.tipos", TP.tiposComNome());
  for (const g of GENEROS_DE_PROVA) {
    const rnd = G.rngDe("dourado-topo|" + String(g));
    caso("topo.genero." + String(g), {
      tavernas: vezes(LUGARES_POR_GENERO.tavernas, () => TP.nomeDeTaverna(g, rnd)),
      locais: [...TP.tiposComNome(), "nada", ""].map((tp) => vezes(LUGARES_POR_GENERO.locais, () => TP.nomeDeLocal(tp, g, rnd))),
      tamanho: [...TP.tiposComNome(), "nada"].map((tp) => TP.tamanhoDoBanco(tp, g)),
    });
  }
  caso("topo.nomeTaverna", vezes(12, (i) => NM.nomeTaverna(GENEROS_DE_PROVA[i % GENEROS_DE_PROVA.length], G.rngDe("dourado-taverna|" + i))));
  for (const g of ["Fantasia medieval", "Ficção científica", "Horror cósmico", "Steampunk"]) {
    for (const cid of CIDADES_DA_FICHA) caso(`mundo.locais.${g}.${cid.nome}`, (MB.locaisDaCidade("dourado-lugares", cid, g) || []).map((l) => [l.tipo, l.nome]));
  }

  /* ---- 5.ª fatia: as raças da criação (classes.js, lexico.js, e quem as lê) ---- */
  caso("racas.tabelas", { racas: C.RACAS, origens: C.ORIGENS, grupos: LX.GRUPOS_DE_RACA, sistema: LX.RACAS_DO_SISTEMA });
  const nomesDeRaca = [...C.RACAS, ...C.ORIGENS].map((r) => r.nome);
  const attrs6 = Object.keys(ATRIBUTOS_DE_PROVA);
  for (const n of [...nomesDeRaca, "anao", "MEIO-ORC", "Elfa", "humana", "Goblin", "", null]) {
    const pers = { raca: n, atributos: ATRIBUTOS_DE_PROVA, habilidades: [] };
    const o = TR.origemDe(pers);
    caso("racas.de." + String(n), {
      porNome: C.racaPorNome(n), origem: o ? o.nome : null, traco: TR.textoDoTraco(pers),
      vantagem: attrs6.map((a) => TR.vantagemDeTraco(pers, a)), mental: TR.vantagemMentalDeTraco(pers),
      imune: ["amedrontado", "enfeiticado", "cego"].map((c) => TR.imuneDeTraco(pers, c)),
      resiste: ["fogo", "veneno", "fisico"].map((e) => TR.resisteDeTraco(pers, e)),
      reduz: ["fogo", "veneno", "fisico"].map((e) => TR.reducaoDeTraco(pers, e)),
      iniciativa: TR.iniciativaDeTraco(pers), escuro: TR.veNoEscuroDeTraco(pers), dificil: TR.ignoraDificilPorTraco(pers), oficio: TR.oficioDeTraco(pers),
      dom: TR.domDe(pers), comDom: TR.comDom(pers).habilidades,
      gasta: [TR.refazerDeTracoDisponivel(pers), TR.sorteDisponivel(pers), TR.pedraDisponivel(pers), TR.firmeDisponivel(pers, 3)],
      golpe: [1, 4, 9].map((d) => TR.amortecerDano(pers, d, "fogo")),
      resumo: TR.resumoTracosPrompt(pers), base: AT.baseDeCriacao(pers), companheiro: CP.racaDeCompanheiro({ raca: n }),
    });
  }
  caso("racas.companheiros", vezes(24, (i) => CP.racaDeCompanheiro({ nome: "Comp " + i, id: "c" + i })));
  caso("racas.prontos", SM.comSorte(G.rngDe("dourado-prontos"), () => R.PRONTOS.map((p) => R.montarPronto(p.id))));
  /* o léxico que renomeia as raças: tudo, só a fantasia, uma a menos, uma intrusa, vazio, lixo */
  const bancoDeRacas = LX.RACAS_DO_SISTEMA.map((r, i) => ({ raca: i % 4 === 1 ? r.toUpperCase() : r, chamado: "Povo " + i }));
  const lexDeRacas = { todas: bancoDeRacas, soFantasia: bancoDeRacas.slice(0, LX.GRUPOS_DE_RACA.fantasia.length), semUma: bancoDeRacas.slice(1), intrusa: [...bancoDeRacas, { raca: "Goblin", chamado: "x" }], vazio: [], lixo: null };
  for (const [nome, racas] of Object.entries(lexDeRacas)) {
    const lex = { racas };
    caso("lexico.racas." + nome, {
      garantidas: LX.garantirLexico(lex).racas,
      chamado: [...nomesDeRaca, "Goblin", ""].map((n) => LX.chamadoDaRaca(lex, n)),
      ficha: nomesDeRaca.map((n) => [LX.racaNaFicha(lex, n, true), LX.racaNaFicha(lex, n, false)]),
    });
  }

  /* ---- 5.ª fatia: os títulos do céu e o sinal do temperamento (divindades.js) ---- */
  caso("divindades.graus", DV.GRAUS);
  caso("divindades.prompt", DV.DIVINDADE_PROMPT);
  caso("divindades.titulos", [-1, 0, 1, 2, 3, 4, 5, null, undefined, "2"].map((g) => DV.tituloDe(g)));
  caso("divindades.patamar", [0, 999, 1000, 5000, 10000, 99999, 100000, 1e6, 5e6].map((f) => [DV.proximoPatamar({ ehJogador: true, despertar: true, fieis: f }), DV.resumoAscensao({ despertar: true, fieis: f, pf: 3, panteao: [] }, 20), DV.tituloDoHeroi({ despertar: true, fieis: f }, "Conhecido", "Veterano")]));
  const marcados = ["das Tempestades", "da Guerra e das Correntes", "de lugar nenhum"].flatMap((dominio, k) => ["colérica", "fria"].map((temperamento) => ({ nome: "Teste" + k + temperamento, dominio, icone: "*", temperamento, culto: "a Ordem de X" })));
  caso("divindades.sinais", marcados.map((d, k) => vezes(SINAIS_POR_DEUS, (i) => DV.gerarEventoDivino({ lugar: i % 2 ? "Coroa" : "" }, i, [d], G.rngDe("dourado-sinal|" + k + "|" + i)))));
  return casos;
}
