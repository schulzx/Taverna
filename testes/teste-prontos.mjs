/* O ROSTER DOS OITO (v9.214) — os prontos das duas mesas

   Um pronto é dado puro montado só com peças que existem — e esta suíte
   confere peça por peça: classe, subclasse, raça, antecedente, profissão,
   arma, armadura, traços, propósito, sementes. O montador tem de produzir
   a MESMA ficha que a tela de criação produziria: aceita pelo combate,
   equipada sem penalidade, com orçamento idêntico entre os oito. */

const RAIZ = "../src/";
const P = await import(RAIZ + "prontos.js");
const CL = await import(RAIZ + "classes.js");
const AN = await import(RAIZ + "antecedentes.js");
const IT = await import(RAIZ + "itens.js");
const CB = await import(RAIZ + "combate.js");
const IN = await import(RAIZ + "indole.js");
const PR = await import(RAIZ + "promessas.js");
const K = await import(RAIZ + "constantes.js");
const { readFileSync } = await import("node:fs");

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

sec("1. os oito, com anatomia completa");
{
  t("são 8 prontos", P.PRONTOS.length === 8, String(P.PRONTOS.length));
  t("ids únicos", new Set(P.PRONTOS.map((x) => x.id)).size === 8);
  t("papéis únicos (um por papel)", new Set(P.PRONTOS.map((x) => x.papel)).size === 8);
  t("todo pronto tem nome, linha de venda e conceito", P.PRONTOS.every((x) => x.nome && x.linha && x.conceito));
  t("prontoPorId acha e erra", P.prontoPorId("muralha") && !P.prontoPorId("ninguem"));
}

sec("2. só peças que existem — a catraca de referências");
{
  t("toda classe é real", P.PRONTOS.every((x) => CL.classePorNome(x.classe)));
  t("toda subclasse pertence à própria classe", P.PRONTOS.every((x) => (CL.classePorNome(x.classe).subclasses || []).some((s) => s.nome === x.subclasse)));
  t("toda raça é real", P.PRONTOS.every((x) => CL.racaPorNome(x.raca)));
  t("todo antecedente é real", P.PRONTOS.every((x) => AN.antecedentePorId(x.antecedente)));
  t("toda profissão é real", P.PRONTOS.every((x) => P.profissaoValida(x.profissao)));
  t("toda arma está no catálogo", P.PRONTOS.every((x) => IT.ARMAS.some((a) => a.nome === x.arma)));
  t("toda armadura está no catálogo", P.PRONTOS.every((x) => IT.ARMADURAS.some((a) => a.nome === x.armadura)));
  t("todo traço de índole é real", P.PRONTOS.every((x) => x.indole.tracos.every((tr) => IN.TRACOS.some((y) => y.id === tr))));
  t("todo propósito é real", P.PRONTOS.every((x) => IN.propositoPorId(x.indole.proposito)));
  t("toda semente pessoal é forma real do Livro (2 por pronto)", P.PRONTOS.every((x) => x.sementes.length === 2 && x.sementes.every((f) => PR.formaPorId(f))));
}

sec("3. o orçamento idêntico");
{
  t("os 6 pontos da criação, exatos, nos oito", P.PRONTOS.every((x) => Object.values(x.atributos).reduce((s, v) => s + v, 0) === K.PONTOS_TOTAIS));
  t("nenhum atributo passa do teto da criação", P.PRONTOS.every((x) => Object.values(x.atributos).every((v) => v >= 0 && v <= K.ATRIBUTO_MAX_CRIACAO)));
  const fichas = P.PRONTOS.map((x) => P.montarPronto(x.id));
  t("mesmo nível para os oito", fichas.every((f) => f.nivel === P.NIVEL_DO_PRONTO));
  t("mesmo bolso para os oito (o bônus do antecedente NÃO entra)", fichas.every((f) => f.moedas === P.MOEDAS_DO_PRONTO));
}

sec("4. o montador produz ficha de verdade");
{
  const fichas = P.PRONTOS.map((x) => P.montarPronto(x.id));
  t("os oito montam", fichas.every(Boolean));
  t("vida e mana positivas, batendo com classe+vigor/intelecto", fichas.every((f) => f.vida > 0 && f.vida === f.vidaMax && f.mana === f.manaMax));
  t("o combate aceita: defesa calcula nos oito", fichas.every((f) => CB.defesaDe(f) >= 10));
  t("arma e armadura nascem EQUIPADAS", fichas.every((f) => f.equipados.arma && f.equipados.armadura));
  t("nenhuma peça equipada tem penalidade (proficiência conferida)", fichas.every((f) => {
    return Object.values(f.equipados).every((it) => IT.avaliarEquipar(f, it, {}).penalidades.length === 0);
  }));
  t("habilidades iniciais da classe vêm juntas", fichas.every((f) => Array.isArray(f.habilidades) && f.habilidades.length > 0));
  t("perícias iniciais vêm treinadas", fichas.every((f) => f.pericias && Object.keys(f.pericias).length > 0));
  t("a marca do roster viaja na ficha", fichas.every((f, i) => f.pronto === P.PRONTOS[i].id));
  t("o montador é determinístico", JSON.stringify(P.montarPronto("sombra")) === JSON.stringify(P.montarPronto("sombra")));
  t("dá para batizar sem perder o pronto", P.montarPronto("punho", { nome: "Bram Duropé" }).nome === "Bram Duropé");
  t("id inválido devolve null", P.montarPronto("nao_existe") === null);
}

sec("5. o espelho da defesa nunca envelhece calado");
{
  /* DEFESA_DA_ARMADURA espelha a tabela interna de loot.js; se lá mudar,
     aqui quebra — o espelho é conferido contra a FONTE, linha a linha */
  const loot = readFileSync("../src/loot.js", "utf8");
  const noLoot = (nome) => {
    const m = loot.match(new RegExp(`\\{ nome: "${nome}", defesa: (\\d+) \\}`));
    return m ? Number(m[1]) : null;
  };
  t("toda armadura do roster está na tabela de loot", Object.keys(P.DEFESA_DA_ARMADURA).every((n) => noLoot(n) !== null));
  t("o espelho bate com a fonte, número a número", Object.entries(P.DEFESA_DA_ARMADURA).every(([n, d]) => noLoot(n) === d));
  t("toda armadura usada pelos prontos tem defesa no espelho", P.PRONTOS.every((x) => P.DEFESA_DA_ARMADURA[x.armadura] >= 1));
}

console.log(`\n${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
