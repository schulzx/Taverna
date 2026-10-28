/* cenario-casos.mjs (Fase T, T4-B · o cenário como arquivo, 1.ª e 2.ª fatias, 28/10/2026)

   A fotografia dos catálogos que passaram a ler do cenário — os preços
   (economia.js, e o mercado que os consome), as ocupações (classes.js
   PROFISSOES, e profissoes.js/prontos.js que as consomem) e, na 2.ª fatia,
   os gêneros e os ofícios do léxico (lexico.js GENEROS_FUTURISTAS,
   PROFISSOES_DO_SISTEMA, as marcas do gênero próprio e o gênero padrão do
   pedido; classes.js racasDoGenero e a ficha da cidade, que os leem). Não é suíte: é a
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
  return casos;
}
