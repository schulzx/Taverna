/* O FIO É UM SÓ (Fase MM, o laço da história, 11/10) — a 5.ª sessão de prova

   "O rasto de Edric" ficou em 0 de 2 etapas depois de dez respostas a falar
   com o Edric na Ponte Lenta, enquanto a espinha fechava "Encontrar Edric"
   no mesmo turno (mente/mm11-sessao-5.md, defeito 4 e "10e"). A missão da
   abertura era [falar com Osric Pé-Leve n'A Candeia Faiscante, falar com
   Edric n'A Ponte Lenta, em Rio Profundo]; o taverneiro nunca disse o nome,
   e o conferente só olhava a etapa atual. Pior: o marco da espinha e a
   etapa da missão perguntavam o MESMO fato com moradas diferentes ("A Ponte
   Lenta" × "A Ponte Lenta, em Rio Profundo", com o herói "nos arredores de
   Casa da Fonte"), e respondiam coisas diferentes.

   O que esta suíte prova (missoes.js, abertura.js):
     1. a sessão reconstruída: a espinha fecha "Encontrar Edric"; a missão,
        que lia 0/2, passa a 2/2 pelo fato que a espinha já gravou — o passo
        da pista fica `pulada`, o do Edric `feito`;
     2. o caminho salta-se sem espinha (mesma cidade, mesmo turno): achar o
        alvo sem a pista fecha as duas; derrotar/achar/levar NUNCA se saltam;
     3. o fato da espinha só vale para as missões da história e só com o
        mesmo alvo — o homónimo de outro lugar não fecha nada;
     4. o alvo da abertura no lugar dele é presença (`aindaSoUmNome`);
     5. lixo, imutabilidade e determinismo.

   FALHA em HEAD (v9.395): a missão fica em 0/2 nos casos 1 e 2, e o Edric
   na Ponte Lenta continua "só um nome". */

const M = await import("../src/missoes.js");
const SG = await import("../src/saga.js");
const A = await import("../src/abertura.js");

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const tenta = (f, d) => { try { return f(); } catch { return d; } };
const J = (v) => JSON.stringify(v);
const feitas = (m) => (m && m.etapas ? m.etapas.filter((e) => e.feito).length : -1);

/* ---------------- a 5.ª sessão, como o save a guardava ---------------- */
const ESPINHA = SG.garantirEspinha({
  estrutura: "jornada", semente: "s5",
  atos: [{ ato: 0, marcos: [
    { id: "espinha|0|0", feitio: "procurar", titulo: "Encontrar Edric", quem: "Edric", onde: "A Ponte Lenta", cidade: "Rio Profundo", condicao: { tipo: "falar_com", alvo: "Edric" } },
    { id: "espinha|0|1", feitio: "descobrir", titulo: "O que A Biblioteca do Peregrino esconde", onde: "A Biblioteca do Peregrino", cidade: "Casa da Fonte", ehLugar: true, condicao: { tipo: "revelar", alvo: "A Biblioteca do Peregrino" } },
  ] }],
});
const PRINCIPAL = M.criarMissao({
  id: "mis_principal", titulo: "O rasto de Edric", tipo: "principal", status: "ativa", dia: 1,
  etapas: [
    { tipo: "falar_com", alvo: "Osric Pé-Leve", onde: "A Candeia Faiscante" },
    { tipo: "falar_com", alvo: "Edric", quantos: 1, onde: "A Ponte Lenta, em Rio Profundo" },
  ],
});
/* o turno da ponte: o herói "na Ponte Lenta (arredores de Casa da Fonte)",
   o Edric no registo, e o Cronista a ver Hakon e o nome do herói */
const PONTE = {
  cidadeAtual: "Casa da Fonte",
  lugarAtual: { nome: "Ponte Lenta", cidade: "Casa da Fonte" },
  falouCom: ["Gaspar Torquato", "Hakon Guarda-Portão"],
  npcs: { Edric: { nome: "Edric", local: "Ponte Lenta", conhecidoEm: 1 }, "Hakon Guarda-Portão": { nome: "Hakon Guarda-Portão", conhecidoEm: 0 } },
  dia: 1,
};
const verEtapa = (c, m) => M.etapaDef(c.tipo).ver(c, m);

sec("1. a sessão reconstruída: a espinha e a missão dizem a mesma coisa");
{
  const ce = SG.conferirEspinha(ESPINHA, PONTE, verEtapa);
  t("a espinha fecha \"Encontrar Edric\" no turno da ponte (como na sessão)", ce.cumpridos.length === 1 && ce.cumpridos[0].quem === "Edric");
  const antes = M.conferir([PRINCIPAL], PONTE);
  t("sem a espinha no mundo, a missão continua 0/2 (o defeito, medido)", feitas(antes.missoes[0]) === 0, `feitas ${feitas(antes.missoes[0])}`);
  const r = M.conferir([PRINCIPAL], { ...PONTE, espinha: ce.espinha });
  const m = r.missoes[0];
  t("com o fato da espinha, a missão fecha: 2 de 2", feitas(m) === 2 && m.status === "concluida", `feitas ${feitas(m)} · ${m && m.status}`);
  t("o passo do Osric fica `pulada` (o caminho que não precisou de ser andado)", !!(m.etapas[0].pulada && m.etapas[0].feito));
  t("o passo do Edric fica feito, e não pulado", m.etapas[1].feito && !m.etapas[1].pulada);
  t("um avanço só, e é o do Edric (a linha do ✓ diz o que se cumpriu)", r.avancos.length === 1 && r.avancos[0].indice === 1 && r.avancos[0].etapa.alvo === "Edric");
  t("e a missão concluída vai para `concluidas` (a recompensa paga pelo caminho de sempre)", r.concluidas.length === 1);
  /* o turno SEGUINTE: o Cronista já não diz nada, o herói ainda na ponte —
     o fato da espinha basta, porque não depende do turno */
  const depois = M.conferir([PRINCIPAL], { ...PONTE, falouCom: [], espinha: ce.espinha });
  t("no turno seguinte (sem conversa vista), o fato continua a valer", feitas(depois.missoes[0]) === 2);
  const longe = M.conferir([PRINCIPAL], { cidadeAtual: "Casa da Fonte", lugarAtual: { nome: "A Candeia Faiscante", cidade: "Casa da Fonte" }, npcs: {}, espinha: ce.espinha });
  t("e mesmo de volta à Candeia: o fato não se desfaz por o herói sair", feitas(longe.missoes[0]) === 2);
}

sec("2. o caminho salta-se, e só o caminho");
{
  /* mesma cidade, mesmo turno: a pista no Sino, o alvo no mercado */
  const mis = M.criarMissao({ id: "mis_principal", titulo: "O rasto de Noé", tipo: "principal", status: "ativa", etapas: [
    { tipo: "falar_com", alvo: "Inocência Bordão", onde: "O Sino Quieto" },
    { tipo: "falar_com", alvo: "Noé Laminado", onde: "O Mercado Velho" },
  ] });
  const mundo = { cidadeAtual: "Alto do Sal", lugarAtual: { nome: "O Mercado Velho", cidade: "Alto do Sal" }, npcs: { "Noé Laminado": { nome: "Noé Laminado", local: "O Mercado Velho", conhecidoEm: 2 } } };
  const r = M.conferir([mis], mundo);
  t("achar o alvo sem a pista fecha as duas (era 0 de 2)", feitas(r.missoes[0]) === 2, `feitas ${feitas(r.missoes[0])}`);
  /* derrotar no meio NÃO se salta */
  const dura = M.criarMissao({ id: "q1", titulo: "A caçada", tipo: "principal", status: "ativa", etapas: [
    { tipo: "derrotar", alvo: "Lobo Cinzento", quantos: 1 },
    { tipo: "falar_com", alvo: "Noé Laminado", onde: "O Mercado Velho" },
  ] });
  t("uma etapa de derrotar à frente não é caminho: fica 0 de 2", feitas(M.conferir([dura], mundo).missoes[0]) === 0);
  const dois = M.criarMissao({ id: "q2", titulo: "Duas", tipo: "favor", status: "ativa", etapas: [
    { tipo: "falar_com", alvo: "Inocência Bordão", onde: "O Sino Quieto" },
    { tipo: "achar", alvo: "Anel de Prata" },
    { tipo: "falar_com", alvo: "Noé Laminado", onde: "O Mercado Velho" },
  ] });
  t("o salto pára antes de uma etapa que não é caminho (achar)", feitas(M.conferir([dois], mundo).missoes[0]) === 0);
  /* o que fecha à frente também tem de ser caminho: derrotar não diz onde */
  const ponte = M.criarMissao({ id: "q5", titulo: "A ponte", tipo: "principal", status: "ativa", etapas: [
    { tipo: "ir_a", alvo: "Ponte do Sul" }, { tipo: "derrotar", alvo: "Mercenário", quantos: 1 },
  ] });
  t("derrotar à frente não pula a chegada (a sequência de teste-missoes §3)", feitas(M.conferir([ponte], { ...mundo, derrotados: ["Mercenário 1"] }).missoes[0]) === 0);
  t("a tabela do caminho é a que o conferente lê", J(M.ETAPAS_DE_CAMINHO) === J(["falar_com", "ir_a", "revelar"]));
  /* a etapa atual cumprida continua a fechar sozinha, como sempre */
  const so = M.conferir([mis], { ...mundo, lugarAtual: { nome: "O Sino Quieto", cidade: "Alto do Sal" }, npcs: { "Inocência Bordão": { nome: "Inocência Bordão", local: "O Sino Quieto", conhecidoEm: 1 } } });
  t("a etapa atual fecha só ela, sem pular nada (regressão zero)", feitas(so.missoes[0]) === 1 && !so.missoes[0].etapas[0].pulada);
}

sec("3. o fato da espinha tem dono");
{
  const ce = SG.conferirEspinha(ESPINHA, PONTE, verEtapa);
  const mural = M.criarMissao({ id: "q3", titulo: "Recado a Edric", tipo: "favor", status: "ativa", etapas: [{ tipo: "falar_com", alvo: "Edric", onde: "A Ponte Lenta" }] });
  const semNinguem = { cidadeAtual: "Casa da Fonte", lugarAtual: { nome: "A Candeia Faiscante", cidade: "Casa da Fonte" }, npcs: {}, espinha: ce.espinha };
  t("o cartaz do mural não fecha pelo fato da espinha (só a história o lê)", feitas(M.conferir([mural], semNinguem).missoes[0]) === 0);
  const homonimo = M.criarMissao({ id: "mis_principal", titulo: "Outro Edric", tipo: "principal", status: "ativa", etapas: [{ tipo: "falar_com", alvo: "Edric de Osso", onde: "O Armazém Velho" }] });
  t("o homónimo noutro lugar não fecha (\"Edric de Osso\" no Armazém)", feitas(M.conferir([homonimo], semNinguem).missoes[0]) === 0);
  const mesmo = M.criarMissao({ id: "mis_principal", titulo: "Edric", tipo: "trama", status: "ativa", etapas: [{ tipo: "falar_com", alvo: "Edric", onde: "A Ponte Lenta, em Rio Profundo" }] });
  t("a trama com o mesmo alvo e o mesmo lugar fecha", feitas(M.conferir([mesmo], semNinguem).missoes[0]) === 1);
  const lugar = M.criarMissao({ id: "q4", titulo: "A Biblioteca", tipo: "principal", status: "ativa", etapas: [{ tipo: "revelar", alvo: "A Biblioteca do Peregrino" }] });
  t("o marco por fazer não fecha nada (a Biblioteca segue aberta)", feitas(M.conferir([lugar], semNinguem).missoes[0]) === 0);
}

sec("4. o alvo no lugar dele é presença");
{
  const ab = A.garantirAbertura({ principalId: "mis_principal", cidade: "Casa da Fonte", titulo: "O rasto de Edric",
    pista: { nome: "Osric Pé-Leve", papel: "taverneiro", local: "A Candeia Faiscante" },
    alvo: { feitio: "procurar", quem: "Edric", onde: "A Ponte Lenta", alvo: "", objeto: "Edric" } });
  const ctx = (lugar) => ({ lugar, missoes: [PRINCIPAL] });
  t("na praça, o Edric ainda é só um nome (como sempre)", A.aindaSoUmNome(ab, "Edric", ctx({ nome: "A Praça" })) === true);
  t("na Ponte Lenta, o Edric está à frente do herói: deixa de ser só um nome", A.aindaSoUmNome(ab, "Edric", ctx({ nome: "Ponte Lenta" })) === false);
  t("a pista na Ponte Lenta continua só um nome (o Osric não está lá)", A.aindaSoUmNome(ab, "Osric Pé-Leve", ctx({ nome: "Ponte Lenta" })) === true);
  t("e na Candeia a pista é presença (regressão zero)", A.aindaSoUmNome(ab, "Osric Pé-Leve", ctx({ nome: "A Candeia Faiscante" })) === false);
}

sec("5. lixo, imutabilidade, determinismo");
{
  const copia = J(PRINCIPAL);
  const ce = SG.conferirEspinha(ESPINHA, PONTE, verEtapa);
  M.conferir([PRINCIPAL], { ...PONTE, espinha: ce.espinha });
  t("a missão recebida não é mutada", J(PRINCIPAL) === copia);
  t("o mesmo mundo dá o mesmo resultado", J(M.conferir([PRINCIPAL], { ...PONTE, espinha: ce.espinha })) === J(M.conferir([PRINCIPAL], { ...PONTE, espinha: ce.espinha })));
  for (const lixo of [null, {}, { atos: null }, { atos: [{ marcos: [null, { feito: true }] }] }, "x", 3]) {
    t(`espinha lixo (${J(lixo)}) não estoura e não fecha nada`, tenta(() => feitas(M.conferir([PRINCIPAL], { cidadeAtual: "X", espinha: lixo }).missoes[0]), -1) === 0);
  }
  t("mundo null não estoura", tenta(() => M.conferir([PRINCIPAL], null).missoes.length, -1) === 1);
}

console.log(`\no fio é um só: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
