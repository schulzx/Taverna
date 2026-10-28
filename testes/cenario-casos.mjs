/* cenario-casos.mjs (Fase T, T4-B · o cenário como arquivo, 1.ª fatia, 28/10/2026)

   A fotografia dos catálogos que passaram a ler do cenário — os preços
   (economia.js, e o mercado que os consome) e as ocupações (classes.js
   PROFISSOES, e profissoes.js/prontos.js que as consomem). Não é suíte: é a
   lista de perguntas que o `gerar-cenario-dourado.mjs` faz ao código de ANTES
   (lido do git) e que a `teste-cenario.mjs` refaz ao código de AGORA. As duas
   respostas têm de ser iguais byte a byte.

   `raiz` é a pasta `src/` a fotografar (o código de antes mora numa cópia
   tirada com `git archive`). O que sai é só JSON: a regex vira o seu texto. */
import path from "node:path";
import { pathToFileURL } from "node:url";

const imp = (raiz, f) => import(pathToFileURL(path.join(raiz, f)).href);
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

export async function fotografarOsCatalogos(raiz) {
  const E = await imp(raiz, "economia.js");
  const M = await imp(raiz, "mercado.js");
  const C = await imp(raiz, "classes.js");
  const P = await imp(raiz, "profissoes.js");
  const R = await imp(raiz, "prontos.js");
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
  return casos;
}
