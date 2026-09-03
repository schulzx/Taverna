/* A MESA FARTA DA HISTÓRIA (v9.167)

   "Aqui precisamos ser muito generosos, sem economizar nas tabelas e
   nos dados." As despensas dos conselheiros de história eram de
   qualidade e magras: 4 estruturas de arco, 11 intenções, 6 arquétipos
   de vilão, 6 heranças, 6 movimentos do mundo, 4 trancas, 4 viradas.
   Com mesas desse tamanho, a terceira campanha repetia a segunda.

   O QUE ESTA SUÍTE PROTEGE: não só a CONTAGEM (que envelhece bem),
   mas as leis que a generosidade podia quebrar sem querer —
   determinismo, campos completos, cada regra nova com leitor, cada
   `quando`/`nasceDe` lendo o motor de verdade. */

const S = "../src/";
const { readFileSync } = await import("node:fs");
const H = await import(S + "historia.js");
const T = await import(S + "tramas.js");
const V = await import(S + "vilao.js");
const O = await import(S + "oraculo.js");
const M = await import(S + "masmorras.js");
const APP = readFileSync(S + "App.jsx", "utf8");

let bons = 0, maus = 0;
const t = (n, c) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n); } };
const sec = (s) => console.log("\n" + s);

sec("1. OITO ESTRUTURAS DE ARCO, TODAS INTEIRAS");
{
  t(`há oito estruturas (${H.ESTRUTURAS.length})`, H.ESTRUTURAS.length >= 8);
  t("nenhum id repetido", new Set(H.ESTRUTURAS.map((e) => e.id)).size === H.ESTRUTURAS.length);
  t("toda estrutura tem quatro ou mais momentos", H.ESTRUTURAS.every((e) => e.etapas.length >= 4));
  t("todo momento tem nome e instrução de verdade", H.ESTRUTURAS.every((e) => e.etapas.every((x) => x.nome && x.instrucao.length > 80)));
  /* o fim manda PARAR em todas — recomeçar é do jogador, e sempre foi.
     A exceção honesta é o Reinado, cujo fim declarado É continuar como
     gestão viva: parar ali seria mentir sobre o que a estrutura promete. */
  t("todo desfecho manda parar (ou declara a gestão viva)", H.ESTRUTURAS.every((e) => /pare aí|vive-se|governe em paz/.test(e.etapas[e.etapas.length - 1].instrucao)));
}

sec("2. VINTE E DUAS INTENÇÕES QUE LEEM O MOTOR");
{
  t(`há intenções de sobra (${T.INTENCOES.length})`, T.INTENCOES.length >= 22);
  t("nenhum id repetido", new Set(T.INTENCOES.map((i) => i.id)).size === T.INTENCOES.length);
  t("toda intenção tem querer e ordem ao Mestre", T.INTENCOES.every((i) => i.quer && i.aoMestre && i.aoMestre.length > 60));
  t("e nenhum querer se repete", new Set(T.INTENCOES.map((i) => i.quer)).size === T.INTENCOES.length);
  /* os `quando` novos leem o motor: com o material, abrem; sem, não */
  const sit = (x) => ({ momento: 0.5, nivel: 3, ...x });
  const abre = (id, s) => { const i = T.intencaoDaTramaPorId(id); return !!i.quando(T.garantirSituacao(sit(s))); };
  t("provar_o_companheiro pede grupo", abre("provar_o_companheiro", { temGrupo: true }) && !abre("provar_o_companheiro", {}));
  t("armar_o_covil pede covil no mundo", abre("armar_o_covil", { temMasmorra: true }) && !abre("armar_o_covil", {}));
  t("dividir_a_mesa pede facção", abre("dividir_a_mesa", { temFaccao: true }) && !abre("dividir_a_mesa", {}));
  t("mostrar_o_tamanho pede tamanho", abre("mostrar_o_tamanho", { nivel: 9 }) && !abre("mostrar_o_tamanho", { nivel: 3 }));
  t(`há veículos de sobra (${T.VEICULOS.length})`, T.VEICULOS.length >= 13);
  /* (que toda intenção tem veículo e toda etapa é cumprível, quem prova
     é teste-tramas — a suíte dona daquela lei) */
}

sec("3. DOZE RETRATOS DE VILÃO, CADA UM NASCIDO DE COMO SE JOGOU");
{
  t(`há doze arquétipos (${V.ARQUETIPOS.length})`, V.ARQUETIPOS.length >= 12);
  t("nenhum id repetido", new Set(V.ARQUETIPOS.map((a) => a.id)).size === V.ARQUETIPOS.length);
  t("todo arquétipo tem crença, método, projeto e três assinaturas",
    V.ARQUETIPOS.every((a) => a.crenca && a.metodo && a.quer && Array.isArray(a.assinaturas) && a.assinaturas.length === 3));
  t("e nenhuma crença se repete", new Set(V.ARQUETIPOS.map((a) => a.crenca)).size === V.ARQUETIPOS.length);
  /* os nasceDe novos leem contadores que EXISTEM (bumpCont no App) */
  for (const campo of ["quaseMorte", "forjados", "presentes", "perigosEstrada", "combatesVencidos"]) {
    t(`o contador ${campo} existe no App`, APP.includes(`bumpCont("${campo}"`));
  }
  const sorte1 = () => 0.01;
  t("o Credor nasce da bolsa cheia", V.escolherArquetipo({}, { moedas: 500 }, sorte1).id === "credor");
  t("o Penitente nasce da quase-morte", V.escolherArquetipo({ quaseMorte: 1 }, {}, sorte1).id === "penitente");
  t("o Fomentador nasce da guerra", V.escolherArquetipo({}, { guerras: 1 }, sorte1).id === "fomentador");
  t("sem retrato nenhum, o Arquiteto segura a rede", V.escolherArquetipo({}, {}, sorte1).id === "arquiteto");
  /* e o App passa o retrato rico — sem estes campos, três arquétipos
     nunca nasceriam (nasceDe falso para sempre é arquétipo morto) */
  t("o App entrega tratados, guerras e moedas ao nascimento", /tratados: \(\(mapaRef\.current \|\| \{\}\)\.faccoes/.test(APP) && /moedas: \(personagemRef\.current \|\| \{\}\)\.moedas/.test(APP));
}

sec("4. DOZE HERANÇAS — DOZE JEITOS DE O MAL VOLTAR");
{
  t(`há doze heranças (${V.HERANCAS.length})`, V.HERANCAS.length >= 12);
  t("nenhum id repetido", new Set(V.HERANCAS.map((h) => h.id)).size === V.HERANCAS.length);
  t("toda herança tem quem, elo, método, projeto e porquê",
    V.HERANCAS.every((h) => h.quem && typeof h.liga === "function" && h.metodo && h.quer && h.porque));
  t("o elo cita o vilão caído pelo nome", V.HERANCAS.every((h) => h.liga("Sarna").includes("Sarna")));
  t("quem herda a crença não escreve outra", V.HERANCAS.every((h) => (h.herdaCrenca ? h.crenca === null : typeof h.crenca === "function")));
  t("e nenhum porquê se repete", new Set(V.HERANCAS.map((h) => h.porque)).size === V.HERANCAS.length);
}

sec("5. ONZE VOZES DO MUNDO, TODAS PUXANDO FIO QUE EXISTE");
{
  t(`há movimentos de sobra (${O.MOVIMENTOS_DO_MUNDO.length})`, O.MOVIMENTOS_DO_MUNDO.length >= 11);
  t("nenhum id repetido", new Set(O.MOVIMENTOS_DO_MUNDO.map((m) => m.id)).size === O.MOVIMENTOS_DO_MUNDO.length);
  t("todo movimento tem quando, fio e fala", O.MOVIMENTOS_DO_MUNDO.every((m) => typeof m.quando === "function" && typeof m.fio === "function" && m.diz));
  /* o fio novo abre com o material e cala sem ele — a trava do oráculo */
  const ctx = { desdeUltima: 99, emCidade: true, minhaGuilda: "Casa do Carvalho" };
  const sempre = () => 0.01;
  let achouGuilda = false;
  for (let i = 0; i < 200; i++) {
    const mv = O.iniciativaDoMundo(ctx, { sorte: Math.random });
    if (mv && mv.id === "guilda") { achouGuilda = mv.fio === "Casa do Carvalho"; break; }
  }
  t("a casa do jogador vira fio do mundo", achouGuilda);
  const soBoato = O.iniciativaDoMundo({ desdeUltima: 99, emCidade: true }, { sorte: sempre });
  t("sem os materiais novos, só as vozes de sempre", !soBoato || ["relogio", "nemesis", "prazo", "faccao", "gente", "boato"].includes(soBoato.id));
  /* e o App alimenta os cinco fios novos */
  for (const campo of ["minhaGuilda", "chefeDaRegiao", "masmorraProxima", "faccaoAliada", "cidadeSua"]) {
    t(`o App entrega ${campo}`, APP.includes(`${campo}:`));
  }
}

sec("6. O CHEFE TEM MAIS JEITOS DE VIRAR, E TODOS COM CÓDIGO ATRÁS");
{
  t(`há seis viradas (${M.VIRADAS.length})`, M.VIRADAS.length === 6);
  const chefe = { nome: "X", ameaca: "comum", vida: 40, vidaMax: 100, defesa: 14 };
  const esc = M.aplicarVirada(chefe, "escancara");
  t("escancara derruba a guarda de verdade", esc.chefe.defesa === 12);
  t("e sobe a ameaça dois degraus", esc.chefe.ameaca === "elite");
  const braco = M.aplicarVirada(chefe, "convoca_o_braco");
  t("o braço-direito chega sabendo lutar", braco.capangas.length === 1 && braco.capangas[0].ameaca === "competente");
  t("fasesDoChefe nunca repete a virada no mesmo chefe",
    ["A", "B", "C", "D", "E", "F", "G"].every((n) => { const f = M.fasesDoChefe(n); return f[0].virada !== f[1].virada; }));
}

sec("7. OITO TRANCAS — A RODA DOS ATRIBUTOS FECHOU");
{
  t(`há oito trancas (${M.TRANCAS.length})`, M.TRANCAS.length === 8);
  const ATRIBUTOS = ["forca", "destreza", "vigor", "intelecto", "presenca", "percepcao"];
  t("todo atributo da ficha abre alguma porta", ATRIBUTOS.every((a) => M.TRANCAS.some((x) => x.atributo === a)));
  t("nenhuma tranca pede atributo que não existe", M.TRANCAS.every((x) => ATRIBUTOS.includes(x.atributo)));
  t("toda tranca ensina com três pistas", M.TRANCAS.every((x) => x.dicas.length === 3 && x.dicas.every((d) => d.length > 15)));
  t("e traz o próprio artigo", M.TRANCAS.every((x) => !!x.artigo));
}

console.log(`\nmesa farta v9.167: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
