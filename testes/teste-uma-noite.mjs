/* UMA NOITE (v9.217) — o Capítulo: o episódio é a campanha

   As leis desta suíte: o mundo mínimo nasce válido e determinístico por
   poda do MESMO gerador; o orçamento de cenas de todo episódio cabe na
   noite (lei ix); o ritmo por cena empurra o marco na cena-limite SEM
   tocar o ritmo por dia da campanha (regressão do G2); a postura da
   noite é declarada e real; o veredito fecha e a conversão produz um
   personagem que a campanha aceita. */

const RAIZ = "../src/";
const N = await import(RAIZ + "uma-noite.js");
const E = await import(RAIZ + "episodios.js");
const PO = await import(RAIZ + "posturas.js");
const P = await import(RAIZ + "prontos.js");
const CB = await import(RAIZ + "combate.js");

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

sec("1. o mundo de uma noite: poda, não gerador novo");
{
  const m = N.mundoDaNoite("prova");
  t("uma região, uma cidade, rota nenhuma", m.regioes.length === 1 && m.cidades.length === 1 && m.rotas.length === 0);
  t("a cidade já nasce descoberta (a noite não se perde)", m.cidades[0].descoberta === true);
  t("a cidade pertence à região que ficou", m.cidades[0].regiao === m.regioes[0].nome);
  t("determinístico por semente", JSON.stringify(N.mundoDaNoite("prova")) === JSON.stringify(m));
  t("sementes diferentes, noites diferentes", N.mundoDaNoite("outra").cidades[0].nome !== m.cidades[0].nome || N.mundoDaNoite("outra").regioes[0].nome !== m.regioes[0].nome);
}

sec("2. o orçamento cabe na noite (lei ix)");
{
  t("TODO episódio fecha dentro do teto da noite", E.EPISODIOS.every((e) => N.orcamentoDoEpisodio(e.id).total <= N.TETO_DA_NOITE));
  t("episódio de 4 marcos aperta os do meio (3+2+2+3)", N.orcamentoDoEpisodio("linha_escura").tetos.join("+") === "3+2+2+3");
  t("episódio de 3 marcos respira (3+3+3)", N.orcamentoDoEpisodio("a_cobranca").tetos.join("+") === "3+3+3");
  t("tetoDoMarco lê o orçamento certo", N.tetoDoMarco("linha_escura", 1) === 2 && N.tetoDoMarco("a_cobranca", 1) === 3);
}

sec("3. o ritmo por cena empurra — e o ritmo por dia segue intacto");
{
  let e = E.garantirEpisodio({ id: "a_cobranca", marco: 0, aberto: true, desde: 0, avancouEm: 0 });
  t("nasce com zero cenas", e.cenas === 0);
  e = E.cenaResolvida(E.cenaResolvida(e));
  t("cenaResolvida conta", e.cenas === 2);
  t("abaixo do teto, o marco não anda", E.avancarEpisodio(e, { ritmo: "cena", teto: 3 }).avancou === false);
  e = E.cenaResolvida(e);
  const r = E.avancarEpisodio(e, { ritmo: "cena", teto: 3, dia: 1 });
  t("na cena-limite, o marco EMPURRA", r.avancou === true && r.empurrou === true && r.episodio.marco === 1);
  t("o marco novo zera as cenas", r.episodio.cenas === 0);
  /* fecha no último marco pelo mesmo caminho */
  let fim = E.garantirEpisodio({ id: "a_cobranca", marco: 2, aberto: true, cenas: 3 });
  const rf = E.avancarEpisodio(fim, { ritmo: "cena", teto: 3 });
  t("no último marco, o teto fecha a partida", rf.fechou === true && !!rf.pesoNoArco);
  /* REGRESSÃO G2: sem ritmo, a conta por dias é a mesma de sempre */
  let d = E.garantirEpisodio({ id: "a_cobranca", marco: 0, aberto: true, avancouEm: 0, cenas: 3 });
  t("sem ritmo, cenas NÃO movem o marco (a campanha não muda)", E.avancarEpisodio(d, { dia: 1 }).avancou === false);
  t("e os dias movem, como no G2", E.avancarEpisodio(d, { dia: E.DIAS_ENTRE_MARCOS }).avancou === true);
}

sec("4. a postura da noite é declarada, e é real");
{
  t("os 8 episódios declaram postura", E.EPISODIOS.every((e) => N.POSTURA_DA_NOITE[e.id]));
  t("toda postura declarada existe no catálogo", Object.values(N.POSTURA_DA_NOITE).every((id) => PO.posturaPorId(id)));
  t("posturaDaNoite erra para o anonimato", N.posturaDaNoite("nada") === "anonimato");
  t("cada episódio tem o clima certo (amostra)", N.posturaDaNoite("linha_escura") === "vespera" && N.posturaDaNoite("a_queda_reconstrucao") === "crise");
}

sec("5. o veredito e a crônica");
{
  const v = N.veredito({ episodioId: "linha_escura", pronto: "muralha", venceu: true, cenas: 10, pagas: 2, murchas: 1 });
  t("veredito com título, três linhas e crônica", v.titulo && v.linhas.length === 3 && /A Muralha/.test(v.cronica));
  t("a derrota tem veredito próprio", N.veredito({ episodioId: "a_cobranca", pronto: "voz", venceu: false }).titulo === "A noite venceu");
  t("lixo devolve null", N.veredito({ episodioId: "x", pronto: "y" }) === null);
}

sec("6. a conversão: dar a ele uma vida");
{
  const suja = { ...P.montarPronto("voz"), vida: 3, condicoes: [{ nome: "sangrando" }], efeitos: [{ nome: "x" }], grupo: [{ nome: "alguém" }] };
  const c = N.converterParaCampanha(suja);
  t("o convertido nasce inteiro e limpo do que era da noite", c.vida === c.vidaMax && c.condicoes.length === 0 && c.grupo.length === 0);
  t("leva a marca de onde veio", c.veioDeUmaNoite === true);
  t("os itens e o nível vão juntos (cicatrizes contam)", c.nivel === P.NIVEL_DO_PRONTO && c.inventario.length > 0);
  t("a campanha aceita a ficha (o combate calcula)", CB.defesaDe(c) >= 10);
  t("lixo devolve null", N.converterParaCampanha(null) === null && N.converterParaCampanha({}) === null);
}

sec("7. me sirva qualquer coisa");
{
  t("o sorteio é determinístico", JSON.stringify(N.sortearNoite("s")) === JSON.stringify(N.sortearNoite("s")));
  t("e aponta episódio e pronto reais", (() => { const s = N.sortearNoite("z"); return !!E.episodioPorId(s.episodio) && !!P.prontoPorId(s.pronto); })());
  t("sementes diferentes servem pratos diferentes (alguma vez)", new Set(["a", "b", "c", "d", "e"].map((x) => JSON.stringify(N.sortearNoite(x)))).size >= 2);
  t("resumoDaNoite condensa para o autor", N.resumoDaNoite({ episodioId: "a_subida", marco: 1, cenas: 2 }).postura === "promessa");
}

console.log(`\n${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
