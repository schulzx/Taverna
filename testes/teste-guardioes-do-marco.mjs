/* OS GUARDIÕES DO MARCO NÃO PREGAM NO MURAL (Fase MM, o laço da história, 11/10)

   O único cartaz da 5.ª sessão de prova foi "A caçada de Corwin o
   Silencioso" — o arquivista d'A Biblioteca do Peregrino, que a espinha
   guarda para o marco 2 ("O que A Biblioteca do Peregrino esconde", a cena
   "…, à guarda de Corwin o Silencioso"). O filtro da v9.374 ("a gente da
   história não prega no mural") só lia quem um marco PROCURA (`quem`); o
   marco de um lugar não procura ninguém, e o guardião passou
   (mente/mm11-sessao-5.md, defeito 6 e "4. o mural sem gente da história").

   O que esta suíte prova (ofertas.js, batidas.js):
     1. a sessão reconstruída: o Corwin da Biblioteca deixa de poder pregar
        — no mural do mundo e no cartaz que o Mestre propõe;
     2. 24 campanhas de verdade: o guardião de cada marco de "descobrir"
        pregava no mural com o filtro de antes (99 de 126); com o de agora,
        nenhum — e só ele: a outra gente da casa continua a pregar, e o
        mural da cidade quase nunca fica vazio por isso;
     3. todos os guardiões: o alvo de "acabar com" e o do confronto entram
        na gente da história; a frase do guardião é uma só (GUARDA_NA_CENA);
     4. a casa é da cidade dela: a Biblioteca homónima noutra cidade prega;
        marco feito não guarda nada;
     5. lixo.

   FALHA em HEAD (v9.399): o Corwin não está na gente da história, e o
   guardião de cada marco de lugar continua a pregar. */

const SG = await import("../src/saga.js");
const R = await import("../src/regiao.js");
const O = await import("../src/ofertas.js");
const B = await import("../src/batidas.js");
const MB = await import("../src/mundo-base.js");
const { ESTRUTURAS } = await import("../src/historia.js");
const { moldePorId } = await import("../src/moldes.js");
const { sementeDe, generoDe } = await import("./medir-regiao.mjs");

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const tenta = (f, d) => { try { return f(); } catch { return d; } };
const J = (v) => JSON.stringify(v);

/* ---------------- a 5.ª sessão ---------------- */
const ESPINHA = SG.garantirEspinha({ estrutura: "jornada", semente: "s5",
  fio: { antagonista: "Dragão Jovem a Mão Fria", titulo: "a Mão Fria", especie: "Dragão Jovem", motivo: "quer de volta o que a ordem perdeu" },
  atos: [
    { ato: 0, marcos: [
      { id: "espinha|0|0", feitio: "procurar", titulo: "Encontrar Edric", quem: "Edric", onde: "A Ponte Lenta", cidade: "Rio Profundo", condicao: { tipo: "falar_com", alvo: "Edric" } },
      { id: "espinha|0|1", feitio: "descobrir", titulo: "O que A Biblioteca do Peregrino esconde", onde: "A Biblioteca do Peregrino", cidade: "Casa da Fonte", ehLugar: true, condicao: { tipo: "revelar", alvo: "A Biblioteca do Peregrino" },
        batida: { cena: "A Biblioteca do Peregrino, em Casa da Fonte, à guarda de Corwin o Silencioso", emJogo: "a prova", pergunta: "leva a prova?" } },
    ] },
    { ato: 1, marcos: [
      { id: "espinha|1|0", feitio: "enfrentar", titulo: "Acabar com Dragão Jovem a Viúva de Ferro", alvo: "Dragão Jovem a Viúva de Ferro", onde: "Casa valente", condicao: { tipo: "derrotar", alvo: "Dragão Jovem a Viúva de Ferro" } },
      { id: "espinha|1|z", feitio: "confronto", titulo: "Dragão Jovem a Mão Fria", alvo: "Dragão Jovem a Mão Fria", onde: "Bastião de Mil Bocas", condicao: { tipo: "derrotar", alvo: "Dragão Jovem a Mão Fria" } },
    ] },
  ] });
/* o recado que a sessão recebeu (M15): Corwin, arquivista, na Biblioteca */
const CORWIN = { dador: "Corwin o Silencioso", dadorPapel: "arquivista", dadorLocal: "A Biblioteca do Peregrino" };
/* o filtro de antes: só quem os marcos procuram */
const deAntes = (esp) => esp.atos.flatMap((a) => a.marcos).filter((m) => !m.feito && m.quem).map((m) => m.quem);

sec("1. a sessão reconstruída: o Corwin não prega");
{
  const h = O.genteDaHistoria({ espinha: ESPINHA });
  t("antes, o Corwin não era gente da história (o defeito)", !O.ehDaHistoria(CORWIN.dador, { historia: deAntes(ESPINHA) }));
  t("agora é: o guardião da Biblioteca está na gente da história", O.ehDaHistoria(CORWIN.dador, { historia: h }), J(h));
  t("e a casa dele também, pela cidade do marco (é por ela que o mural acha o guardião sem nome na cena)", O.casaDaHistoria(CORWIN.dadorLocal, "Casa da Fonte", h));
  const prop = { titulo: "A caçada de Corwin o Silencioso", dador: "Corwin o Silencioso", dadorLocal: "A Biblioteca do Peregrino", tipo: "contrato", etapas: [{ tipo: "derrotar", alvo: "Zumbi" }] };
  t("o cartaz que o Mestre propõe pelo Corwin não nasce", O.cartazDaProposta(prop, { cidade: "Casa da Fonte", historia: h }) === null);
  t("…e nascia com o filtro de antes", O.cartazDaProposta(prop, { cidade: "Casa da Fonte", historia: deAntes(ESPINHA) }) !== null);
  t("outra pessoa da mesma casa continua a poder pregar (só o guardião se cala)", O.cartazDaProposta({ ...prop, dador: "Yorick o Manco" }, { cidade: "Casa da Fonte", historia: h }) !== null);
}

sec("2. 24 campanhas de verdade: a casa de cada marco de descobrir");
{
  let casos = 0, antes = 0, depois = 0, vazios = 0, vaziosAntes = 0, comGuarda = 0, daCasa = 0;
  for (let i = 0; i < 24; i++) {
    const semente = sementeDe(i), genero = generoDe(i), estrutura = ESTRUTURAS[i % ESTRUTURAS.length].id, molde = moldePorId("sobremundo");
    const mapa = R.mapaDaCampanhaNova(R.mapaDaCriacao({ semente, molde, genero, estrutura, modo: "historia" }));
    let esp = SG.estenderEspinha({ semente, mapa, genero, molde, estrutura, cidadeInicial: mapa.cidades[0].nome });
    if (mapa.regiao) esp = R.espinhaNaRegiao(mapa, esp, { semente, genero, molde });
    const h = O.genteDaHistoria({ espinha: esp });
    for (const m of esp.atos.flatMap((a) => a.marcos)) {
      if (m.feitio !== "descobrir" || !m.cidade) continue;
      casos++;
      if (m.batida && m.batida.cena.includes(B.GUARDA_NA_CENA)) comGuarda++;
      /* o guardião: o primeiro da gente da casa — o mesmo que a cena põe "à guarda" */
      const local = MB.locaisDaCidade(semente, mapa.cidades.find((c) => c.nome === m.cidade), genero, molde).find((l) => l.nome === m.onde);
      const g = local ? (MB.genteDoLocal(semente, local, genero, molde)[0] || {}).nome : "";
      if (!g) continue;
      const ofs = (historia) => O.ofertasDaqui({ semente, mapa, cidade: m.cidade, base: null, genero, molde, quantas: 99, historia });
      const velhas = ofs(deAntes(esp));
      if (velhas.some((o) => o.dador === g)) antes++;
      if (!velhas.length) vaziosAntes++;
      const agora = ofs(h);
      if (agora.some((o) => o.dador === g)) depois++;
      if (agora.some((o) => o.dadorLocal === m.onde && o.dador !== g)) daCasa++;
      if (!agora.length) vazios++;
    }
  }
  console.log(`      marcos de descobrir: ${casos} (${comGuarda} com guardião na cena) · o guardião no mural: ${antes} → ${depois} · murais vazios: ${vaziosAntes} → ${vazios} · casas com outra gente a pregar: ${daCasa}`);
  t("o guardião pregava na maioria dos casos com o filtro de antes", casos > 50 && antes > casos / 2, `${antes}/${casos}`);
  t("agora em nenhum", depois === 0);
  t("o mural da cidade quase nunca fica vazio por isso (≤ 5% dos marcos)", vazios - vaziosAntes <= Math.ceil(casos * 0.05), `${vaziosAntes} → ${vazios}`);
  t("e a outra gente da casa continua a pregar", daCasa > 0);
}

sec("3. todos os guardiões, e a frase é uma só");
{
  const h = O.genteDaHistoria({ espinha: ESPINHA });
  t("o alvo de \"acabar com\" é da história", O.ehDaHistoria("Dragão Jovem a Viúva de Ferro", { historia: h }));
  t("o do confronto também", O.ehDaHistoria("Dragão Jovem a Mão Fria", { historia: h }));
  t("quem um marco procura continua lá (o filtro da v9.374)", O.ehDaHistoria("Edric", { historia: h }));
  t("a frase do guardião vem de batidas.js", B.GUARDA_NA_CENA === "à guarda de");
  t("e ninguém de fora da história é apanhado (Rowena, do Mercado)", !O.ehDaHistoria("Rowena Cinza-Antiga", { historia: h }) && !O.casaDaHistoria("O Mercado do Ogro", "Casa da Fonte", h));
}

sec("4. a casa é da cidade dela; o marco feito não guarda");
{
  const h = O.genteDaHistoria({ espinha: ESPINHA });
  t("a Biblioteca do Peregrino de outra cidade prega", !O.casaDaHistoria("A Biblioteca do Peregrino", "Monte do Sul", h));
  t("sem cidade de quem pergunta, a casa pelo nome", O.casaDaHistoria("Biblioteca do Peregrino", "", h));
  const feita = { ...ESPINHA, atos: ESPINHA.atos.map((a) => ({ ...a, marcos: a.marcos.map((m) => (m.feitio === "descobrir" ? { ...m, feito: true } : m)) })) };
  const hf = O.genteDaHistoria({ espinha: feita });
  t("com o marco descoberto, o Corwin volta a poder pregar", !O.ehDaHistoria(CORWIN.dador, { historia: hf }) && !O.casaDaHistoria(CORWIN.dadorLocal, "Casa da Fonte", hf));
}

sec("5. lixo");
{
  for (const lixo of [null, undefined, 3, "", {}]) {
    t(`casaDaHistoria com local lixo (${J(lixo)}) é falso`, tenta(() => O.casaDaHistoria(lixo, "Casa da Fonte", ["A Biblioteca do Peregrino, em Casa da Fonte"]), true) === false);
    t(`casaDaHistoria com história lixo (${J(lixo)}) é falso`, tenta(() => O.casaDaHistoria("A Biblioteca do Peregrino", "Casa da Fonte", lixo), true) === false);
  }
  t("espinha com marcos tortos não estoura", J(tenta(() => O.genteDaHistoria({ espinha: { atos: [{ marcos: [null, { batida: { cena: 3 } }, { feitio: "descobrir" }] }] } }), "x")) === "[]");
  const c = J(ESPINHA); O.genteDaHistoria({ espinha: ESPINHA });
  t("a espinha não é mutada", J(ESPINHA) === c);
}

console.log(`\nos guardiões do marco: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
