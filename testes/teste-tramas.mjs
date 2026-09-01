/* AS TRAMAS — a quest do Mestre, e o conserto dos três lobos.

   O pedido tem cinco afirmações verificáveis: a quest carrega uma
   INTENÇÃO · a intenção vem do arco e da fase do vilão, não de sorteio ·
   o que acontece no meio é executado pelo SISTEMA · a quest não é
   opcional · o mural continua opcional.

   E há uma sexta, que não está no pedido e é a mais importante: a missão
   TEM de poder ser cumprida. Foi ela que quebrou na partida real — a
   etapa `derrotar` só conferia, e nada fazia o bicho aparecer. */

const S = "../src/";
const T = await import(S + "tramas.js");
const M = await import(S + "missoes.js");
const { FASES } = await import(S + "vilao.js");
const { readFileSync } = await import("node:fs");

let ok = 0; const falhas = [];
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; return; }
  falhas.push(nome);
  console.log("  ✗ " + nome + (extra ? ` — ${extra}` : ""));
};

const material = (o = {}) => ({
  cidade: { nome: "Vau Baixo" },
  pessoa: { nome: "Marta", papel: "feirante" },
  local: { nome: "A Sétima Passada" },
  criatura: { nome: "lacraia de esgoto", nivel: 2 },
  ermo: { nome: "a boca de mina abandonada" },
  sumido: "Kleber", objeto: "pacote lacrado",
  ...o,
});
const sit = (o = {}) => ({ momento: 0.3, nivel: 8, ...o });
const semente = (n) => { let x = n; return () => (x = (x * 1103515245 + 12345) % 2147483648) / 2147483648; };

/* ---------------- A INTENÇÃO VEM DA HISTÓRIA, NÃO DE SORTEIO ----------------
   É o coração do pedido. Cada fase do vilão tem a sua, e ela é a MESMA
   toda vez — se a fase manda, o sorteio não decide. */
{
  for (const [fase, esperada] of [["mao", "mostrar_a_mao"], ["rosto", "apresentar_o_rosto"], ["guerra", "declarar_a_guerra"]]) {
    const vistos = new Set();
    for (let i = 0; i < 40; i++) {
      vistos.add(T.escolherIntencao(sit({ temVilao: true, faseVilao: fase, momento: 0.4 }), { rnd: semente(i * 31 + 7) }).id);
    }
    t(`a fase "${fase}" puxa ${esperada}`, vistos.has(esperada), [...vistos].join(","));
  }
  /* e a intenção da fase pesa MAIS que as outras: em quarenta sorteios ela
     tem de sair na maioria, senão a fase não manda, só opina */
  let saiu = 0;
  for (let i = 0; i < 40; i++) {
    if (T.escolherIntencao(sit({ temVilao: true, faseVilao: "rosto", momento: 0.4 }), { rnd: semente(i * 97 + 3) }).id === "apresentar_o_rosto") saiu++;
  }
  t("e ela sai na maioria dos sorteios", saiu >= 24, `${saiu}/40`);
}

/* sem vilão, as intenções dele não podem aparecer nunca */
{
  const vistos = new Set();
  for (let i = 0; i < 60; i++) vistos.add(T.escolherIntencao(sit({ temVilao: false }), { rnd: semente(i * 13 + 5) }).id);
  const doVilao = ["plantar_a_marca", "mostrar_a_mao", "apresentar_o_rosto", "declarar_a_guerra"];
  t("sem vilão, nenhuma intenção de vilão sai", !doVilao.some((x) => vistos.has(x)), [...vistos].join(","));
  t("mas sempre sai alguma", vistos.size > 0);
}

/* A REDE: mesmo no pior caso — sem vilão, sem grupo, sem vizinha, no fim
   do arco — tem de sair uma intenção. Um Mestre sem intenção é o estado
   de antes com mais código. */
{
  const magra = T.escolherIntencao({ momento: 0.6, temVilao: false, temGrupo: true, temCidadeVizinha: false, temPromessaAberta: false }, { rnd: semente(1) });
  t("no pior caso a rede segura", !!magra && !!magra.id, String(magra && magra.id));
}

/* uma intenção `uma` não volta depois de feita */
{
  const feita = T.escolherIntencao(sit({ temVilao: true, faseVilao: "rosto", momento: 0.4, intencoesFeitas: ["apresentar_o_rosto"] }), { rnd: semente(9) });
  t("a intenção de uma vez só não se repete", feita.id !== "apresentar_o_rosto", feita.id);
}

/* ---------------- A INTENÇÃO ESCOLHE O VEÍCULO ----------------
   E não o contrário. É toda a diferença entre isto e o mural. */
{
  const tr = T.montarTrama({ situacao: sit({ temVilao: true, faseVilao: "rosto", momento: 0.4 }), material: material(), rnd: semente(11) });
  t("a trama nasce", !!tr, "null");
  t("e ela declara a intenção", !!(tr && tr.intencao), tr && tr.intencao);
  t("e o veículo serve a intenção",
    !!(tr && T.veiculoPorId(tr.veiculo).serve.includes(tr.intencao)),
    tr && `${tr.veiculo} serve ${T.veiculoPorId(tr.veiculo).serve.join("/")} · intenção ${tr.intencao}`);
  t("e ela traz título e etapas", !!(tr && tr.titulo && tr.etapas.length));
  t("e uma virada", !!(tr && tr.virada && tr.virada.tipo));
}

/* sem material, não se promete: uma escolta sem cidade vizinha seria uma
   escolta para lugar nenhum, que é o defeito que se está consertando */
{
  const semNada = T.montarTrama({ situacao: sit(), material: {}, rnd: semente(3) });
  t("sem material nenhum, não nasce trama", semNada === null, semNada && semNada.titulo);
  const soPessoa = T.montarTrama({ situacao: sit(), material: { pessoa: { nome: "Marta" } }, rnd: semente(3) });
  t("com pessoa só, também não", soPessoa === null, soPessoa && soPessoa.titulo);
}

/* ---------------- TODA VIRADA TEM QUEM A EXECUTE ----------------
   O defeito que este arquivo existe para não repetir: um tipo declarado
   aqui e sem leitor no App é uma virada que não acontece — exatamente o
   que a etapa `derrotar` era. Então confere-se nos DOIS lados. */
{
  const app = readFileSync("../src/App.jsx", "utf8");
  for (const tv of T.TIPOS_DE_VIRADA) {
    t(`o App sabe executar "${tv.id}"`, app.includes(`"${tv.id}"`), "o tipo existe em tramas.js e ninguém o lê");
  }
  /* e todo veículo usa um tipo que existe */
  for (const v of T.VEICULOS) {
    t(`o veículo ${v.id} usa uma virada conhecida`, !!T.tipoDeViradaPorId(v.virada && v.virada.tipo), v.virada && v.virada.tipo);
  }
  /* a caçada abre combate DE VERDADE — é o conserto dos três lobos, e se
     esta linha sumir o defeito volta inteiro */
  t("a caçada abre combate no App", /talvezCacar/.test(app) && /abrirCombate\(inimigos/.test(app));
  /* e o endereço vale para os DOIS nomes do lugar: o herói está na Praça
     de Escambo, dentro de Baixo do Eco, e uma caçada endereçada à cidade
     tem de valer em qualquer canto dela. */
  t("e ela só dispara no lugar marcado", /ondeEstou\(\)\.some\(\(x\) => mesmoLugar\(x, e\.onde\)\)/.test(app));
  t("e o lugar tem os dois nomes", /const ondeEstou = \(\) => \[/.test(app));
  t("e não abre a mesma luta duas vezes", /cacadasFeitasRef/.test(app));
}

/* ---------------- TODO VEÍCULO ENTREGA UMA ETAPA CUMPRÍVEL ----------------
   A trava que faltava. Uma etapa `derrotar` sem `onde` não tem como ser
   entregue pelo sistema; uma `ir_a` para um lugar sem `lugar: true` nunca
   confere. É onde a partida real quebrou. */
{
  for (const v of T.VEICULOS) {
    const tr = T.montarTrama({
      situacao: sit({ temVilao: true, faseVilao: "rosto", momento: 0.4, tramasFeitas: T.VEICULOS.filter((x) => x.id !== v.id).map((x) => x.id) }),
      material: material(), rnd: semente(5),
    });
    if (!tr) continue;
    for (const e of tr.etapas) {
      if (e.tipo === "derrotar") t(`${tr.veiculo}: a caçada tem endereço`, !!e.onde, JSON.stringify(e));
      if (e.tipo === "ir_a") t(`${tr.veiculo}: o destino existe`, !!e.alvo, JSON.stringify(e));
    }
  }
}

/* ---------------- A VIRADA ACONTECE UMA VEZ ---------------- */
{
  const tr = T.montarTrama({ situacao: sit({ temVilao: true, faseVilao: "mao", momento: 0.4 }), material: material(), rnd: semente(21) });
  t("antes da etapa, a virada não é devida", T.viradaDevida(tr, { etapasFeitas: 0 }) === null);
  t("depois da etapa, é", !!T.viradaDevida(tr, { etapasFeitas: 1 }));
  const feita = { ...tr, virada: { ...tr.virada, feita: true } };
  t("e uma vez feita, nunca mais", T.viradaDevida(feita, { etapasFeitas: 3 }) === null);
  t("virada de tipo inventado não é devida",
    T.viradaDevida({ virada: { tipo: "inventado", apos: 0 } }, { etapasFeitas: 1 }) === null);
  t("missão sem virada não explode", T.viradaDevida({}, { etapasFeitas: 2 }) === null);
}

/* ---------------- A MISSÃO GUARDA O QUE PRECISA ----------------
   A trama viaja DENTRO da missão. Foi a separação entre "a missão" e "o
   que faz a missão acontecer" que deixou os lobos sem aparecer. */
{
  const tr = T.montarTrama({ situacao: sit({ temVilao: true, faseVilao: "rosto", momento: 0.4 }), material: material(), rnd: semente(31) });
  const m = M.criarMissao({
    titulo: tr.titulo, tipo: "trama", status: "ativa", descricao: tr.descricao, dador: tr.dador,
    etapas: tr.etapas, nivel: tr.nivel, dia: 3, intencao: tr.intencao, veiculo: tr.veiculo, virada: tr.virada,
  });
  t("a missão nasce", !!m);
  t("e guarda a intenção", m.intencao === tr.intencao, m.intencao);
  t("e guarda a virada", !!(m.virada && m.virada.tipo === tr.virada.tipo), JSON.stringify(m.virada));
  t("e guarda o nível", m.nivel === tr.nivel);
  t("e nasce ATIVA — a quest do Mestre não se recusa", m.status === "ativa", m.status);
  t("e o tipo é forçado", M.ehForcada("trama") === true);
  /* enquanto o mural continua opcional */
  t("o mural continua opcional", M.ehForcada("contrato") === false && M.ehForcada("favor") === false);
  /* e o `onde` da etapa sobrevive à catraca */
  const comOnde = M.garantirMissoes([{ titulo: "x", etapas: [{ tipo: "derrotar", alvo: "lobo", quantos: 3, onde: "a mina" }] }])[0];
  t("o endereço da caçada sobrevive à catraca", comOnde.etapas[0].onde === "a mina", JSON.stringify(comOnde.etapas[0]));
  const comLugar = M.garantirMissoes([{ titulo: "x", etapas: [{ tipo: "ir_a", alvo: "a torre caída", lugar: true }] }])[0];
  t("e o 'é um lugar' também", comLugar.etapas[0].lugar === true);
}

/* ---------------- A ETAPA PODE SER CUMPRIDA ----------------
   O `ir_a` para um LUGAR era inconferível: só se olhava `cidadeAtual`, e
   o herói chegava à cabana com o diário dizendo "chegar à cabana". */
{
  const et = M.ETAPAS.ir_a;
  t("chegar a uma cidade confere", et.ver({ alvo: "Vau Baixo" }, { cidadeAtual: "Vau Baixo" }) === true);
  t("chegar a um lugar confere", et.ver({ alvo: "a torre caída", lugar: true }, { lugarAtual: { nome: "a torre caída" } }) === true);
  t("e não confunde os dois", et.ver({ alvo: "a torre caída", lugar: true }, { cidadeAtual: "a torre caída" }) === false);
  t("o texto do derrotar diz onde", M.textoDaEtapa({ tipo: "derrotar", alvo: "lobo", quantos: 3, onde: "a mina" }).includes("a mina"));
}

/* ---------------- OS ENVELOPES ----------------
   Nunca um pedido para o Narrador FAZER acontecer: o que ele recebe é o
   que JÁ aconteceu, para narrar. */
{
  const tr = T.montarTrama({ situacao: sit({ temVilao: true, faseVilao: "rosto", momento: 0.4 }), material: material(), rnd: semente(41) });
  const e = T.envelopeDaTrama(tr);
  t("o envelope da trama existe", e.includes("MISSÃO DO SISTEMA"));
  t("e traz a intenção", e.includes(T.intencaoDaTramaPorId(tr.intencao).aoMestre.slice(0, 30)));
  t("e proíbe o Mestre de concluí-la", /não a conclua/i.test(e));
  t("e proíbe antecipar a virada", /não antecipe/i.test(e));

  const emb = T.envelopeDoQueVira({ tipo: "emboscada", onde: "na estrada" }, { vilao: "Praga Mansa" });
  t("a emboscada diz que o sistema JÁ abriu a luta", /SISTEMA já abriu a luta/i.test(emb), emb.slice(0, 90));
  t("e proíbe decidir o desfecho", /NÃO decida o desfecho/i.test(emb));
  const cac = T.envelopeDoQueVira({ tipo: "cacada" }, { alvo: "lacraia de esgoto" });
  t("a caçada nomeia a presa", cac.includes("lacraia de esgoto"));
  t("e diz que ela está AQUI", /está aqui/i.test(cac));
  const enc = T.envelopeDoQueVira({ tipo: "encontro", papel: "quem estava esperando" }, { quem: "Praga Mansa" });
  t("o encontro NÃO abre combate", /NÃO abra combate/i.test(enc));
  t("tipo inventado devolve vazio", T.envelopeDoQueVira({ tipo: "nao_existe" }) === "");
}

/* ---------------- A CATRACA ---------------- */
{
  const s0 = T.garantirSituacao(null);
  t("situação nula não explode", typeof s0.momento === "number" && s0.ordemDaFase === -1);
  t("fase inventada some", T.garantirSituacao({ faseVilao: "nao_existe" }).faseVilao === "");
  t("fase real fica com a ordem certa",
    T.garantirSituacao({ faseVilao: "guerra" }).ordemDaFase === FASES.find((f) => f.id === "guerra").ordem);
  t("momento fora da faixa é aparado", T.garantirSituacao({ momento: 9 }).momento === 1 && T.garantirSituacao({ momento: -3 }).momento === 0);
  t("montar com situação nula não explode", T.montarTrama({ situacao: null, material: material(), rnd: semente(2) }) !== undefined);
}

/* toda intenção e todo veículo completos, senão quebram no caso que
   ninguém testou */
for (const i of T.INTENCOES) {
  t(`intenção ${i.id} completa`, !!(i.id && i.quer && i.aoMestre && i.peso > 0 && typeof i.quando === "function"));
  t(`intenção ${i.id} fala ao Mestre em português de cena`, i.aoMestre.length > 60);
}
for (const v of T.VEICULOS) {
  t(`veículo ${v.id} completo`, !!(v.id && v.serve.length && v.precisa.length && typeof v.montar === "function" && v.virada));
  t(`veículo ${v.id} serve intenções que existem`, v.serve.every((x) => !!T.intencaoDaTramaPorId(x)), v.serve.join(","));
}
/* e toda intenção tem ao menos um veículo — uma intenção sem corpo é uma
   decisão do Mestre que nunca vira missão */
for (const i of T.INTENCOES) {
  t(`a intenção ${i.id} tem veículo`, T.VEICULOS.some((v) => v.serve.includes(i.id)), "nenhum veículo a serve");
}

/* ---------------- O QUE SOBE AO NARRADOR ---------------- */
t("o prompt existe", T.TRAMAS_PROMPT.includes("MISSÕES DO SISTEMA"));
t("e diz que a quest não é sorteada", /NÃO são sorteadas/i.test(T.TRAMAS_PROMPT));
t("e proíbe as pegadas eternas", /pegadas e sombras/i.test(T.TRAMAS_PROMPT));
t("e separa mural de quest", /MURAL continua sendo o mundo/i.test(T.TRAMAS_PROMPT));
t("e cabe no orçamento", T.TRAMAS_PROMPT.length < 900, String(T.TRAMAS_PROMPT.length));

console.log(`\n${ok} passaram` + (falhas.length ? ` · ${falhas.length} FALHARAM` : " · sem falhas"));
process.exit(falhas.length ? 1 : 0);
