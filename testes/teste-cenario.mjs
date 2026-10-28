/* teste-cenario.mjs (Fase T, T4-B · o cenário como arquivo, 1.ª fatia, 28/10/2026)

   "Um cenário novo entra sem editar módulo" (mente/plano-motor.md, Fase 4).
   A 1.ª fatia tirou de dentro do motor os preços (economia.js) e as
   ocupações (classes.js PROFISSOES) e pô-los num arquivo de dados
   (`cenario-padrao.js`), que `cenario.js` valida, congela e entrega aos
   catálogos. Esta suíte prova:

   1. o dourado — o código de ANTES (f0a9fae, lido por `git archive` em
      `gerar-cenario-dourado.mjs`) e o de agora dão a mesma resposta, byte a
      byte, às 578 perguntas de `cenario-casos.mjs` (500 bancas semeadas, os
      preços comuns por fator, a pauta do preço perguntado, as doze
      ocupações em todas as funções que as leem);
   2. e a prova morde: um número mexido no cenário muda os casos que o leem;
   3. outro mundo, mínimo, muda o resultado sem tocar em módulo;
   4. o cenário inválido é recusado, com o caminho do campo na mensagem;
   5. imutabilidade e determinismo;
   6. o esquema lê de volta o que o motor consome. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fotografarOsCatalogos } from "./cenario-casos.mjs";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(AQUI, "..", "src");
const S = "../src/";
const CN = await import(S + "cenario.js");
const { DADOS_DO_CENARIO_PADRAO } = await import(S + "cenario-padrao.js");
const E = await import(S + "economia.js");
const C = await import(S + "classes.js");
const P = await import(S + "profissoes.js");
const M = await import(S + "mercado.js");
const R = await import(S + "prontos.js");
const L = await import(S + "loot.js");

let ok = 0, mal = 0;
const t = (nome, cond, extra) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const copia = (o) => JSON.parse(JSON.stringify(o));
const recusa = (dados) => { try { CN.carregarCenario(dados); return null; } catch (e) { return String(e.message); } };
const DOURADO = JSON.parse(fs.readFileSync(path.join(AQUI, "cenario-dourado.json"), "utf8"));
const diferentes = (casos) => casos.filter((c, i) => JSON.stringify(c) !== JSON.stringify(DOURADO.casos[i])).map((c) => c.id);

sec("1. o dourado — o código de antes e o cenário de agora, byte a byte");
{
  const agora = await fotografarOsCatalogos(SRC);
  t(`os casos são os do dourado (${agora.length})`, agora.length === DOURADO.casos.length && agora.every((c, i) => c.id === DOURADO.casos[i].id));
  t("o dourado tem as 500 bancas semeadas", DOURADO.casos.filter((c) => c.id.startsWith("mercado.banca.")).length === 500);
  const dif = diferentes(agora);
  t("nenhum caso diferente", dif.length === 0, dif.slice(0, 5).join(", "));
  t("o mundo em uso é o padrão", CN.cenarioAtivo() === CN.CENARIO_PADRAO && CN.CENARIO_PADRAO.id === "taverna");
}

sec("2. e a prova morde — um número mexido no cenário aparece nos casos");
{
  const d = copia(DADOS_DO_CENARIO_PADRAO);
  d.precos.comuns.find((x) => x.id === "caneca").base = 2;
  CN.usarCenario(d);
  const dif = diferentes(await fotografarOsCatalogos(SRC));
  t("a caneca a ◉ 2 muda o preço comum dela", dif.includes("economia.precoComum.caneca"), dif.slice(0, 4).join(", "));
  t("…e a pauta da cerveja, e a linha da rua", dif.includes("mercado.pauta.1.quanto custa uma cerveja?") && dif.includes("mercado.rua.1"));
  t("…e nada que não a lê (as bancas, as ocupações)", !dif.some((id) => id.startsWith("mercado.banca.") || id.startsWith("profissoes.")));

  const d2 = copia(DADOS_DO_CENARIO_PADRAO);
  d2.precos.raridade.incomum = 61;
  d2.ocupacoes.find((x) => x.nome === "Ferreiro").efeito.venda = 0.3;
  CN.usarCenario(d2);
  const dif2 = diferentes(await fotografarOsCatalogos(SRC));
  t("o incomum a ◉ 61 muda bancas semeadas", dif2.filter((id) => id.startsWith("mercado.banca.")).length > 50, String(dif2.length));
  t("o Ferreiro a +30% muda o Ferreiro (e só ele entre os ofícios)", dif2.includes("profissoes.de.Ferreiro") && dif2.includes("profissoes.de.ferreiro") && !dif2.includes("profissoes.de.Mercador"));

  CN.usarCenario(CN.CENARIO_PADRAO);
  t("de volta ao padrão, o dourado fecha outra vez", diferentes(await fotografarOsCatalogos(SRC)).length === 0);
}

/* ---------------- um mundo que não é a Taverna ---------------- */
const ORBITA = {
  formato: 1,
  id: "orbita",
  nome: "Estação Órbita Sete",
  precos: {
    escala: ["ESCALA DA ESTAÇÃO: ◉ 30 é uma semana de ração · ◉ 900 é um traje de vácuo novo."],
    raridade: { comum: 40, incomum: 150, raro: 600, epico: 2400, lendario: 9000 },
    semRaridade: 25,
    miudeza: 2,
    comuns: [
      { id: "racao", nome: "ração prensada", curto: "ração", base: 3, faixa: [2, 4], rua: true, rx: "\\b(racao|racoes|barras? de proteina)\\b" },
      { id: "dose", nome: "dose de destilado de algas", base: 6, faixa: null, rx: "\\b(doses?|destilados?)\\b" },
    ],
  },
  ocupacoes: [
    { nome: "Mecânico", desc: "Mantém o casco inteiro.", beneficio: "Mãos de oficina: a bancada de utilitários fica 4 mais fácil.", efeito: { bancada: { utilitario: 4 } } },
    { nome: "Piloto", desc: "Leva a nave entre os destroços.", beneficio: "Olho de rota: +6 na navegação.", efeito: { navegar: 6, compra: 0.1 } },
  ],
};

sec("3. outro mundo — a Estação Órbita Sete, sem tocar em módulo");
{
  const o = CN.usarCenario(ORBITA);
  t("o mundo em uso é o novo", CN.cenarioAtivo() === o && o.nome === "Estação Órbita Sete");
  t("o Narrador lê a escala da estação, com a abertura e o fim do motor", E.ECONOMIA_PROMPT.includes("ESCALA DA ESTAÇÃO") && !E.ECONOMIA_PROMPT.includes("cavaleiro") && E.ECONOMIA_PROMPT.startsWith("ECONOMIA DO MUNDO") && E.ECONOMIA_PROMPT.endsWith("o número que entra/sai do bolso é o do sistema."));
  t("os preços comuns são os dela", E.PRECOS_COMUNS.map((x) => x.id).join() === "racao,dose" && E.PRECOS_DA_RUA.join() === "racao");
  t("a ração custa ◉ 3, e no porto rico ◉ 5", E.precoComum("racao") === 3 && E.precoComum("racao", 1.5) === 5 && E.precoComum("caneca") === null);
  const pr = M.precoComumParaPauta("quanto custa uma ração?", { fator: 1 });
  t("a pauta do preço perguntado fala da ração", JSON.stringify(pr).includes("ração prensada ◉ 3"), JSON.stringify(pr));
  t("e a cerveja já não é coisa deste mundo", !JSON.stringify(M.precoComumParaPauta("quanto custa uma cerveja?", { fator: 1 })).includes("◉"));
  t("o valor pela raridade é o dela", E.valorDeItem({ raridade: "raro" }) === 600 && E.valorDeItem("chave") === 2 && E.valorDeItem({}) === 25);
  t("as ocupações da criação são as dela", C.PROFISSOES.map((x) => x.nome).join() === "Mecânico,Piloto");
  t("o Mecânico vale na bancada, o Ferreiro já não existe", P.bonusDeBancada({ profissao: "mecanico" }, "utilitario") === 4 && P.bonusDeBancada({ profissao: "Ferreiro" }, "utilitario") === 0);
  t("o Piloto navega e compra melhor", P.bonusDeNavegacao({ profissao: "Piloto" }) === 6 && P.precoDeCompraPara({ profissao: "Piloto" }, 100) === 90);
  t("o montador de prontos conhece o mundo novo", R.profissaoValida("Piloto") && !R.profissaoValida("Mercador"));

  /* determinismo: a mesma semente e o mesmo mundo, duas vezes */
  const banca = (s) => M.gerarMercador({ cidade: { nome: "Doca", porte: "cidade" }, semente: s, nivel: 4 });
  const a = banca("orbita|1"), b = banca("orbita|1");
  t("mesma semente, mesmo mundo: a mesma banca", JSON.stringify(a) === JSON.stringify(b));
  CN.usarCenario(CN.CENARIO_PADRAO);
  const p = banca("orbita|1");
  t("a mesma semente noutro mundo: as mesmas coisas, outros preços", a.estoque.map((x) => x.nome).join() === p.estoque.map((x) => x.nome).join() && a.estoque.map((x) => x.preco).join() !== p.estoque.map((x) => x.preco).join());
  t("e de volta ao padrão, tudo como era", C.PROFISSOES.length === 12 && E.precoComum("caneca") === 1 && E.valorDeItem({ raridade: "raro" }) === 220);
}

sec("4. o cenário inválido é recusado, e diz onde");
{
  const caso = (nome, mexer, espera) => {
    const d = copia(ORBITA);
    const x = mexer(d);
    const msg = recusa(x === undefined ? d : x);
    t(nome, msg !== null && msg.includes(espera), msg ? msg.split("\n").slice(0, 3).join(" | ") : "aceitou");
  };
  caso("null", () => null, "devia ser um objeto");
  caso("uma lista", () => [], "devia ser um objeto");
  caso("vazio: cada secção que falta", () => ({}), "precos: falta");
  caso("falta a raridade lendária", (d) => { delete d.precos.raridade.lendario; }, "precos.raridade.lendario: falta");
  caso("falta a base de um preço comum", (d) => { delete d.precos.comuns[1].base; }, "precos.comuns[1].base: falta");
  caso("preço negativo", (d) => { d.precos.miudeza = -1; }, "precos.miudeza: devia ser número ≥ 0");
  caso("faixa ao contrário", (d) => { d.precos.comuns[0].faixa = [4, 2]; }, "precos.comuns[0].faixa");
  caso("campo com erro de grafia", (d) => { d.precos.comuns[0].porPalavras = true; }, "precos.comuns[0].porPalavras: campo desconhecido");
  caso("secção que o motor ainda não lê", (d) => { d.deuses = []; }, "deuses: campo desconhecido");
  caso("regex literal (código, não dado)", (d) => { d.precos.comuns[0].rx = /racao/; }, "regex literal");
  caso("regex que não compila", (d) => { d.precos.comuns[0].rx = "(racao"; }, "precos.comuns[0].rx: devia ser texto de uma regex válida");
  caso("uma função no meio do mundo", (d) => { d.precos.semRaridade = () => 5; }, "não é dado de JSON");
  caso("número que não é número", (d) => { d.precos.raridade.raro = NaN; }, "precos.raridade.raro: número inválido");
  caso("id repetido", (d) => { d.precos.comuns[1].id = "racao"; }, '"racao" repetido');
  caso("ocupação repetida (sem olhar a caixa)", (d) => { d.ocupacoes[1].nome = "MECÂNICO"; }, "repetido");
  caso("efeito fora do vocabulário", (d) => { d.ocupacoes[0].efeito.desconto = 0.2; }, "ocupacoes[0].efeito.desconto: campo desconhecido");
  caso("fração que não é fração", (d) => { d.ocupacoes[1].efeito.compra = 1.5; }, "ocupacoes[1].efeito.compra: devia ser fração");
  caso("mundo sem ocupação", (d) => { d.ocupacoes = []; }, "ao menos 1 ocupação");
  caso("formato de outro motor", (d) => { d.formato = 2; }, "lê o formato 1");
  const v = CN.validarCenario({ formato: 1, id: "x" });
  t("a validação devolve todos os erros de uma vez", !v.ok && v.erros.length >= 3 && v.erros.some((e) => e.startsWith("nome")) && v.erros.some((e) => e.startsWith("precos")) && v.erros.some((e) => e.startsWith("ocupacoes")));
  t("o padrão e o mundo de teste passam", CN.validarCenario(DADOS_DO_CENARIO_PADRAO).ok && CN.validarCenario(ORBITA).ok);

  const antes = CN.cenarioAtivo();
  let caiu = false;
  try { CN.usarCenario({ ...copia(ORBITA), ocupacoes: [] }); } catch { caiu = true; }
  t("trocar por um mundo inválido não troca nada", caiu && CN.cenarioAtivo() === antes && C.PROFISSOES.length === 12);
}

sec("5. imutabilidade e determinismo");
{
  const P0 = CN.CENARIO_PADRAO;
  t("o cenário carregado é congelado a fundo", Object.isFrozen(P0) && Object.isFrozen(P0.precos) && Object.isFrozen(P0.precos.comuns[0]) && Object.isFrozen(P0.precos.comuns[0].faixa) && Object.isFrozen(P0.ocupacoes[0].efeito.bancada));
  const bruto = copia(ORBITA);
  const o = CN.carregarCenario(bruto);
  t("o dado do autor não é tocado nem congelado", !Object.isFrozen(bruto) && JSON.stringify(bruto) === JSON.stringify(ORBITA) && o !== bruto);
  t("carregar o carregado devolve o mesmo", CN.carregarCenario(o) === o && CN.carregarCenario(P0) === P0);
  t("as tabelas dos catálogos saem congeladas", Object.isFrozen(E.PRECOS_COMUNS) && Object.isFrozen(E.PRECOS_COMUNS[0]) && Object.isFrozen(E.PRECOS_DA_RUA) && Object.isFrozen(C.PROFISSOES));
  let mutou = false;
  try { C.PROFISSOES.push({ nome: "Intruso" }); mutou = true; } catch { /* congelado */ }
  t("e ninguém lhes acrescenta um ofício por fora", !mutou && C.PROFISSOES.length === 12);
  const j = CN.carregarCenario(JSON.parse(JSON.stringify(DADOS_DO_CENARIO_PADRAO)));
  CN.usarCenario(j);
  t("o mundo de hoje, como JSON de verdade (texto → parse → carregar), fecha o dourado", diferentes(await fotografarOsCatalogos(SRC)).length === 0);
  CN.usarCenario(P0);
  t("duas fotografias seguidas, a mesma", JSON.stringify(await fotografarOsCatalogos(SRC)) === JSON.stringify(await fotografarOsCatalogos(SRC)));
}

sec("6. o esquema lê de volta o que o motor consome");
{
  const EQ = CN.ESQUEMA_DO_CENARIO;
  t("as raridades do esquema são as do loot", Object.keys(EQ.raridade).sort().join() === [...L.RARIDADES].sort().join());
  const fonteProf = fs.readFileSync(path.join(SRC, "profissoes.js"), "utf8");
  const lidos = new Set([...fonteProf.matchAll(/efeitoDe\(pers\)\.(\w+)/g)].map((m) => m[1]));
  t("o vocabulário do efeito é o que profissoes.js lê, nem mais nem menos", [...lidos].sort().join() === Object.keys(EQ.efeito).sort().join(), [...lidos].sort().join());
  t("toda ocupação do padrão usa só o vocabulário", CN.CENARIO_PADRAO.ocupacoes.every((o) => Object.keys(o.efeito).every((k) => k in EQ.efeito)));
  t("as faixas do padrão estão escritas na escala que o Narrador lê", CN.CENARIO_PADRAO.precos.comuns.filter((c) => c.faixa && c.faixa[0] !== c.faixa[1]).every((c) => E.ECONOMIA_PROMPT.includes(`◉ ${c.faixa[0]}–${c.faixa[1]}`)));

  /* um catálogo que estoura a meio da troca não deixa meio mundo de cada lado */
  CN.aoTrocarDeCenario((c) => { if (c.id === "explode") throw new Error("catálogo de teste"); });
  let caiu = false;
  try { CN.usarCenario({ ...copia(ORBITA), id: "explode" }); } catch { caiu = true; }
  t("se um catálogo estoura, todos voltam ao mundo de antes", caiu && CN.cenarioAtivo() === CN.CENARIO_PADRAO && C.PROFISSOES.length === 12 && E.precoComum("caneca") === 1);
}

console.log(`\ncenário (T4-B): ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
