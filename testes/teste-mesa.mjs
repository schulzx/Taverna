/* A MESA POSTA (v9.201) — o juízo da ação

   O balcão que dá ao Mestre a mesa posta: se há teste, qual, quão duro, e
   o que cada resultado significa. A alma do órgão é a lei da falha — ela
   nunca é "nada acontece" —, e é ela que esta suíte guarda com mais
   cuidado, situação por situação. */

const RAIZ = "../src/";
const M = await import(RAIZ + "mesa-posta.js");
const T = await import(RAIZ + "testes.js");
const { readFileSync } = await import("node:fs");
const semComentarios = (s) => s.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
const APP = semComentarios(readFileSync("../src/App.jsx", "utf8"));
const PAUTA = readFileSync("../src/pauta.js", "utf8");

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

sec("1. as cinco trilhas e as oito recusas");
{
  t("cinco trilhas", M.TRILHAS.length === 5);
  t("as trilhas certas", ["impossivel", "automatico", "trivial", "teste", "oraculo"].every((id) => M.trilhaPorId(id)));
  t("só a trilha teste chega ao dado (as outras entregam sem rolar)",
    M.trilhaPorId("teste").entrega.includes("teste") && !/rola/.test(M.trilhaPorId("automatico").entrega));
  t("oito recusas de rolagem", M.RECUSAS.length === 8);
  t("toda recusa diz por quê", M.RECUSAS.every((r) => r.diz && r.diz.length > 10));
  t("recusaPorId acha", M.recusaPorId("sem_custo") && !M.recusaPorId("porque_sim"));
}

sec("2. as seis moedas da falha");
{
  t("são seis moedas", M.MOEDAS_DA_FALHA.length === 6);
  t("as seis certas", ["tempo", "ruido", "recurso", "posicao", "condicao", "info"].every((id) => M.moedaPorId(id)));
  t("toda moeda explica o que cobra", M.MOEDAS_DA_FALHA.every((m) => m.diz && m.nome));
}

sec("3. as 40 situações, completas e não-genéricas");
{
  t("são 40 situações", M.SITUACOES.length === 40, String(M.SITUACOES.length));
  const cont = {};
  for (const s of M.SITUACOES) cont[s.grupo] = (cont[s.grupo] || 0) + 1;
  t("oito grupos de cinco", M.GRUPOS.every((g) => cont[g] === 5), JSON.stringify(cont));
  t("ids únicos", new Set(M.SITUACOES.map((s) => s.id)).size === 40);
  t("situacoesDoGrupo devolve os cinco de um grupo", M.situacoesDoGrupo("corpo").length === 5);
  t("situacaoPorId acha e erra", M.situacaoPorId("escalar_muralha") && !M.situacaoPorId("voar"));
  t("toda situação tem atributo do jogo", M.SITUACOES.every((s) => T.TIPOS_TESTE.some((tt) => tt.atributo === s.atributo)));
  t("toda situação tem nome, o que move a régua e chaves", M.SITUACOES.every((s) => s.nome && s.sobe && s.chaves.length));
  /* A ALMA: toda falha cobra uma das seis moedas — nunca 'nada acontece' */
  const semMoeda = M.SITUACOES.filter((s) => !M.moedaPorId(s.moeda));
  t(`toda falha cobra uma moeda válida${semMoeda.length ? " — SEM: " + semMoeda.map((x) => x.id).join(",") : ""}`, semMoeda.length === 0);
  t("toda falha tem texto concreto (a cena anda)", M.SITUACOES.every((s) => s.falha && s.falha.length > 12));
  /* as seis moedas são todas exercidas — o catálogo não deixa nenhuma órfã */
  const usadas = new Set(M.SITUACOES.map((s) => s.moeda));
  t("as seis moedas aparecem no catálogo", ["tempo", "ruido", "recurso", "posicao", "condicao", "info"].every((m) => usadas.has(m)));
}

sec("4. casar ação com situação: conservador, e certo quando casa");
{
  t("'escalo a muralha' casa com escalar", (M.situacaoQueCasa("escalo a muralha do castelo") || {}).id === "escalar_muralha");
  t("'tento arrombar a porta' casa", (M.situacaoQueCasa("tento arrombar a porta") || {}).id === "arrombar_porta");
  /* o matcher é conservador: casa por chave forte, não por conjugação.
     "minto" (conjugado) de propósito NÃO casa — errar para menos é barato,
     a dica é advisória e o Mestre narra sem ela. Com a chave presente, casa. */
  t("'tento mentir ao guarda' casa com mentir", (M.situacaoQueCasa("tento mentir ao guarda que desconfia") || {}).id === "mentir_desconfia");
  t("'minto' conjugado não casa (conservador, e tudo bem)", M.situacaoQueCasa("minto para o guarda") === null);
  t("uma fala vazia não casa nada", M.situacaoQueCasa("") === null && M.situacaoQueCasa("ok") === null);
  t("uma ação sem chave forte não casa (conservador)", M.situacaoQueCasa("fico olhando o horizonte pensando na vida") === null);
}

sec("5. as apostas antes da rolagem");
{
  const a = M.apostas("fechadura_pressao");
  t("dá as duas versões", a && a.sePassa && a.seFalha);
  t("a de falha NOMEIA a moeda", /recurso/.test(a.seFalha));
  t("a de falha proíbe o 'nada acontece'", /anda para frente|nunca/.test(a.seFalha));
  t("apostas de id inexistente é null", M.apostas("nao_existe") === null);
  t("custoDeFalha devolve a moeda da situação", M.custoDeFalha("notar_emboscada") === "posicao");
  /* aceita o objeto ou o id */
  t("apostas aceita o objeto direto", !!M.apostas(M.situacaoPorId("mentir_desconfia")));
}

sec("6. a aposta chega pela PAUTA, não pelo prompt (o teto de custo)");
{
  /* a doutrina NÃO mora no prompt fixo: ele vivia a 64 caracteres do teto
     de 82 mil, e bloat permanente o estourava. A aposta é dinâmica —
     entra na pauta só quando a ação casa. É o que o documento pediu:
     "as duas versões da cena chegam à PAUTA antes do dado". */
  t("existe a seção A APOSTA na pauta", /id: "mesa"/.test(PAUTA));
  t("o App importa a Mesa Posta", /import \{ situacaoQueCasa, apostas \}/.test(APP));
  t("a pautaDoTurno recebe a ação do turno", /pautaDoTurno\(conteudo\)/.test(APP));
  t("a ação casa e vira aposta na pauta", /situacaoQueCasa\(acaoDoTurno\)/.test(APP) && /porNaPauta\(p, "mesa"/.test(APP));
  t("resumoDaMesa conta o catálogo", M.resumoDaMesa().situacoes === 40 && M.resumoDaMesa().moedas === 6);
}

console.log(`\n${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
