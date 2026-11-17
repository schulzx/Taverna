/* AS PEÇAS · O MOLDE POR FATO (17/11/2026, Fase A da prova) — src/pecas/moldes.js

   A proposta da pessoa (mente/lancamento/as-pecas.md §3.3): cada facto que
   fecha uma etapa ganha um molde — as soluções plausíveis, com a falha que
   aponta para outra. A prova:
   §1 todo molde é bom: as ações existem, os preços existem, toda seta
      aponta para dentro do molde, nenhum ciclo de falhas sem saída, a que
      não fecha cai numa que fecha, ≥ 3 famílias que fecham;
   §2 a carta de escolha não tem dado; o combinador não tem molde próprio;
   §3 o número sai do catálogo (a CD do desafio, a do encontro pela
      ameaça, a luta) — nenhum número à mão;
   §4 os 12 predicados das etapas (e o encontrou do clímax) têm molde. */
import {
  MOLDE_DO_FATO, MOLDE_IGUAL, ACOES_SEM_CATALOGO, FAMILIA_DA_ACAO, VANTAGEM_DA_SETA, MINIMO_DE_FAMILIAS,
  moldeDe, numeroDaSolucao, problemasDoMolde,
} from "../src/pecas/moldes.js";
import { DESAFIOS, desafioPorId, SITUACAO_DA_CD } from "../src/desafios.js";
import { PRECO_DA_FALHA, CAMINHOS_DA_CARTA } from "../src/quadro-da-quest.js";
import { ESCOLHAS_DO_CONFRONTO, ESCOLHAS_DO_ENCONTRO } from "../src/encontro-na-estrada.js";
import { O_CONFRONTO_DA_QUEST } from "../src/o-confronto-da-quest.js";
import { CONDICOES } from "../src/condicoes-da-quest.js";

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);

sec("§1 todo molde é bom");
for (const k of Object.keys(MOLDE_DO_FATO)) {
  const p = problemasDoMolde(k);
  t(`o molde de «${k}» não tem problema`, p.length === 0, p.join(" · "));
}
t("os aliases apontam para moldes que existem", Object.entries(MOLDE_IGUAL).every(([a, b]) => !!MOLDE_DO_FATO[b] && moldeDe(a) === MOLDE_DO_FATO[b]));
t("predicado sem molde dá null", moldeDe("morto") === null && moldeDe("") === null);
t("toda ação de todo molde tem família", Object.values(MOLDE_DO_FATO).every((m) => m.solucoes.every((s) => !!FAMILIA_DA_ACAO[s.acao])));
t("toda família nomeada é de uma ação que existe (catálogo ou da peça)", Object.keys(FAMILIA_DA_ACAO).every((a) => !!ACOES_SEM_CATALOGO[a] || DESAFIOS.some((d) => d.id === a)));
t("todo preço dos moldes é um preço do quadro", Object.values(MOLDE_DO_FATO).every((m) => m.solucoes.every((s) => [s.sucesso, s.falha].every((l) => !l || !l.preco || !!PRECO_DA_FALHA[l.preco]))));
/* o detector de becos acusa: um molde torto feito à mão */
const torto = { alvo: "pessoa", solucoes: [{ id: "a", acao: "convencer", pede: "presente", sucesso: { fato: true }, falha: { para: "b" } }, { id: "b", acao: "intimidar", pede: "presente", sucesso: { fato: true }, falha: { para: "a" } }] };
{
  const p = problemasDoMolde("torto", torto);
  t("o detector acusa o ciclo de falhas sem saída", p.some((x) => x.includes("ciclo")), p.join(" · "));
  t("e as famílias a menos", p.some((x) => x.includes("famílias")));
  const beco = { alvo: "pessoa", solucoes: [{ id: "a", acao: "convencer", pede: "presente", sucesso: { fato: true }, falha: {} }] };
  t("e a falha que não aponta para nada (o beco)", problemasDoMolde("beco", beco).some((x) => x.includes("beco")));
  const fora = { alvo: "pessoa", solucoes: [{ id: "a", acao: "convencer", pede: "presente", sucesso: { fato: true }, falha: { para: "zz" } }] };
  t("e a seta para fora do molde", problemasDoMolde("fora", fora).some((x) => x.includes("não é do molde")));
  t("um predicado sem molde é um problema", problemasDoMolde("nao_existe").length === 1);
  t("a tabela é congelada", Object.isFrozen(MOLDE_DO_FATO) && Object.isFrozen(MOLDE_DO_FATO.conversou.solucoes));
}

sec("§2 a carta de escolha e o combinador");
t("escolheu não tem dado (é a carta)", MOLDE_DO_FATO.escolheu.carta === true && MOLDE_DO_FATO.escolheu.solucoes.every((s) => s.semDado && s.acao === "escolher"));
t("e a régua das três famílias não se aplica a ela", problemasDoMolde("escolheu").length === 0);
t("pelo_menos é combinador: sem soluções próprias", MOLDE_DO_FATO.pelo_menos.combinador === true && MOLDE_DO_FATO.pelo_menos.solucoes.length === 0);
t("todo molde com dado tem ≥ MINIMO_DE_FAMILIAS famílias que fecham", Object.entries(MOLDE_DO_FATO).filter(([, m]) => !m.carta && !m.combinador)
  .every(([, m]) => new Set(m.solucoes.filter((s) => s.fecha !== false).map((s) => FAMILIA_DA_ACAO[s.acao])).size >= MINIMO_DE_FAMILIAS));
t("fugir não fecha, e cai na luta quando falha", ["derrotou", "encontrou"].every((k) => { const f = MOLDE_DO_FATO[k].solucoes.find((s) => s.acao === "fugir"); return f && f.fecha === false && f.falha.para === "lutar"; }));
t("a luta perdida contra a besta escreve o encontro (com preço), não a derrota", MOLDE_DO_FATO.encontrou.solucoes.find((s) => s.id === "lutar").falha.escreve === true
  && MOLDE_DO_FATO.derrotou.solucoes.find((s) => s.id === "lutar").falha.continua === true);

sec("§3 o número sai do catálogo");
for (const id of ["convencer", "buscar", "investigar", "rastrear", "furtar_se"]) {
  const n = numeroDaSolucao({ acao: id });
  t(`a CD de «${id}» é a do desafio`, n && n.dc === (desafioPorId(id).dcPadrao || desafioPorId(id).dcBase) && n.pericia === desafioPorId(id).pericia, J(n));
}
t("a luta não tem CD: é do tabuleiro", J(numeroDaSolucao({ acao: "lutar" })) === J({ luta: true, dc: null, pericia: "", de: "luta" }));
const amea = O_CONFRONTO_DA_QUEST.ameacaSemFicha;
t("capturar tem a CD do confronto, pela ameaça (sem ficha: a do meio)", numeroDaSolucao({ acao: "capturar" }).dc === ESCOLHAS_DO_CONFRONTO.escolhas.capturar.cd[amea]
  && numeroDaSolucao({ acao: "capturar" }, { ameaca: "elite" }).dc === ESCOLHAS_DO_CONFRONTO.escolhas.capturar.cd.elite);
t("fugir tem a CD do «voltar atrás» do encontro", numeroDaSolucao({ acao: "fugir" }).dc === ESCOLHAS_DO_ENCONTRO.escolhas.fugir.cd[amea]);
t("pagar é convencer com a bolsa: a CD dele e o custo do caminho «pagar» do quadro", numeroDaSolucao({ acao: "pagar" }).dc === desafioPorId("convencer").dcPadrao
  && J(ACOES_SEM_CATALOGO.pagar.custa) === J(CAMINHOS_DA_CARTA.pessoa.find((c) => c.id === "pagar").custa));
t("a carta não tem número", numeroDaSolucao({ acao: "escolher", semDado: true }) === null);
t("lixo não lança", numeroDaSolucao(null) === null && numeroDaSolucao({ acao: "voar" }) === null);
t("a vantagem da seta é o degrau da situação (SITUACAO_DA_CD)", VANTAGEM_DA_SETA.emboscada === SITUACAO_DA_CD.find((s) => s.id === "escuro").delta && VANTAGEM_DA_SETA.descoberto === -VANTAGEM_DA_SETA.emboscada);

sec("§4 os predicados das etapas têm molde");
const DOZE = ["escolheu", "conversou", "esteve", "acompanha", "derrotou", "descobriu", "esta_em", "afeicao", "consultou", "conheceu", "pelo_menos", "tem"];
t("os doze da pessoa têm molde", DOZE.every((k) => !!moldeDe(k)), DOZE.filter((k) => !moldeDe(k)).join(","));
t("e o encontrou do clímax (O_CLIMAX_DA_QUEST.presenca) também", !!moldeDe("encontrou"));
t("todo molde de predicado é de um predicado que a condição conhece", Object.keys(MOLDE_DO_FATO).filter((k) => k !== "pelo_menos").every((k) => !!CONDICOES[k]));

console.log(`\n${bons} ok, ${maus} falha(s)`);
process.exit(maus ? 1 : 0);
