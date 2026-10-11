/* UM LUGAR NÃO É GENTE (Fase MM, o laço da história, 11/10) — a 5.ª sessão de prova

   O herói entrou na Candeia Faiscante para falar com o Osric Pé-Leve (a
   pista da abertura, taverneiro da casa). A pauta continuou a mandar
   "Procurar Osric Pé-Leve na Candeia Faiscante" com ele lá dentro; o
   Narrador pôs um draconato de um olho atrás do balcão e nunca lhe deu o
   nome; o Cronista registou-o como "Taverna Candeia Faiscante" (papel
   taverneiro); e "falar com Osric" ficou aberto a sessão inteira
   (mente/mm11-sessao-5.md, coerência 1 e defeito 4).

   O que esta suíte prova (npcs.js, abertura.js, escuta.js):
     1. a sessão reconstruída: a ficha do Cronista "Taverna Candeia
        Faiscante" deixa de nascer como pessoa e resolve-se para o Osric —
        e, registado ele, a etapa da pista fecha (0/2 → 1/2);
     2. longe da casa, ou com dois donos possíveis, o registo recusa e diz
        porquê numa linha própria (não como homónimo de ninguém);
     3. a tabela não morde gente: 3000 nomes do gerador, em todos os
        géneros, e nenhum abre por um tipo de lugar;
     4. a pauta: com o herói na casa da pista, O RUMO manda falar com ele
        PELO NOME e dizê-lo ao herói; fora dela, "Procurar…" como sempre;
        e a abertura leva o nome e o ofício da ficha;
     5. lixo e imutabilidade.

   FALHA em HEAD (v9.396): "Taverna Candeia Faiscante" nasce pessoa
   ("nova"), a missão fica 0/2, e O RUMO diz "Procurar Osric" dentro da
   Candeia. */

const N = await import("../src/npcs.js");
const M = await import("../src/missoes.js");
const A = await import("../src/abertura.js");
const E = await import("../src/escuta.js");
const { nomePessoa, generosDisponiveis } = await import("../src/nomes.js");
const { rngDe } = await import("../src/geografia.js");

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const tenta = (f, d) => { try { return f(); } catch { return d; } };
const J = (v) => JSON.stringify(v);

/* ---------------- a 5.ª sessão ---------------- */
const ABERTURA = A.garantirAbertura({ principalId: "mis_principal", cidade: "Casa da Fonte", titulo: "O rasto de Edric",
  razao: "um homem a quem devia a vida pediu-lhe, antes de morrer, que fosse a Casa da Fonte atrás de Edric",
  sabe: "Osric Pé-Leve, taverneiro, é quem, nesta cidade, sabe mais de Edric; encontra-se na Candeia Faiscante",
  chegada: "pela estrada de terra batida", historia: "a cidade vive do que os outros trazem",
  pista: { nome: "Osric Pé-Leve", papel: "taverneiro", local: "A Candeia Faiscante" },
  alvo: { feitio: "procurar", quem: "Edric", onde: "A Ponte Lenta", alvo: "", objeto: "Edric" } });
const PRINCIPAL = M.criarMissao({ id: "mis_principal", titulo: "O rasto de Edric", tipo: "principal", status: "ativa", dia: 1, etapas: [
  { tipo: "falar_com", alvo: "Osric Pé-Leve", onde: "A Candeia Faiscante" },
  { tipo: "falar_com", alvo: "Edric", onde: "A Ponte Lenta, em Rio Profundo" },
] });
/* o contexto que o App dá ao registo (`contextoDoNome`): a pista, o alvo,
   os marcos, a gente do mundo; e onde o herói está */
const CTX = {
  importantes: [{ nome: "Osric Pé-Leve", onde: "A Candeia Faiscante" }, { nome: "Edric", onde: "A Ponte Lenta" },
    { nome: "Corwin o Silencioso", onde: "A Biblioteca do Peregrino", papel: "arquivista", de: "mundo" }],
  conhecidos: [], recentes: [], grupo: [{ nome: "Hakon Guarda-Portão" }],
  aqui: ["Casa da Fonte", "A Candeia Faiscante"],
};
/* a ficha que o Cronista devolveu no turno 3 */
const FICHA = { nome: "Taverna Candeia Faiscante", papel: "taverneiro", relacao: "neutro", local: "cidade", notas: "draconato de um olho, vende boatos" };
const ctxDe = (n, extra = {}) => ({ ...CTX, local: n.local, papel: n.papel, notas: n.notas, ...extra });

sec("1. a sessão reconstruída: o taverneiro é o Osric");
{
  const id = N.nomeComDono(FICHA.nome, {}, ctxDe(FICHA));
  t("\"Taverna Candeia Faiscante\" não nasce pessoa", id.decisao !== "nova", `decisao ${id.decisao}`);
  t("resolve-se para quem a casa tem: o Osric Pé-Leve", id.decisao === "mesma" && id.nome === "Osric Pé-Leve", J(id));
  /* o que o App faz com "mesma" sem chave: cria a pessoa com o nome certo */
  const reg = { [id.nome]: N.criarNPC(id.nome, { ...FICHA, conhecidoEm: 1 }) };
  t("o registo guarda o Osric (e não a taverna)", !!reg["Osric Pé-Leve"] && !reg["Taverna Candeia Faiscante"] && reg["Osric Pé-Leve"].papel === "taverneiro");
  const mundo = { cidadeAtual: "Casa da Fonte", lugarAtual: { nome: "A Candeia Faiscante", cidade: "Casa da Fonte" }, npcs: reg, dia: 1 };
  const r = M.conferir([PRINCIPAL], mundo);
  t("e a etapa da pista fecha na Candeia: 0/2 → 1/2", r.missoes[0].etapas[0].feito && !r.missoes[0].etapas[1].feito, J(r.missoes[0].etapas.map((e) => !!e.feito)));
  const so = N.nomeComDono("A Candeia Faiscante", {}, ctxDe(FICHA));
  t("o nome da casa com artigo, sem o tipo, também é a casa (\"A Candeia Faiscante\" → Osric)", so.decisao === "mesma" && so.nome === "Osric Pé-Leve");
  const jaLa = N.nomeComDono(FICHA.nome, { "Osric Pé-Leve": { nome: "Osric Pé-Leve", conhecidoEm: 1 } }, ctxDe(FICHA));
  t("com o Osric já no registo, a ficha mescla na chave dele", jaLa.decisao === "mesma" && jaLa.chave === "Osric Pé-Leve");
}

sec("2. a recusa, e a linha que a diz");
{
  const fora = N.nomeComDono(FICHA.nome, {}, ctxDe(FICHA, { aqui: ["Casa da Fonte", "O Mercado do Ogro"] }));
  t("com o herói fora da casa, recusa (nomear de longe não é encontrar)", fora.decisao === "recusada" && fora.motivo === "lugar_nao_e_gente", J(fora));
  const nota = N.notaDoHomonimo([fora]);
  t("a nota diz que é um lugar, e não um homónimo", /lugar, não de uma pessoa/.test(nota) && !/já é outra pessoa/.test(nota), nota);
  t("a saída da nota sai da tabela", nota.includes(N.SAIDA_DO_HOMONIMO.lugar_nao_e_gente) && nota.includes(N.MOTIVO_DO_HOMONIMO.lugar_nao_e_gente));
  const sem = N.nomeComDono("Estalagem do Corvo", {}, ctxDe({ papel: "estalajadeiro" }));
  t("uma casa sem dono que importa também é recusada", sem.decisao === "recusada" && sem.motivo === "lugar_nao_e_gente");
  const dois = N.nomeComDono("Taverna Candeia Faiscante", {}, ctxDe(FICHA, { importantes: [...CTX.importantes, { nome: "Brana Sal-Grosso", onde: "A Candeia Faiscante" }] }));
  t("dois donos possíveis: recusa, não escolhe", dois.decisao === "recusada");
  const misto = N.notaDoHomonimo([fora, { decisao: "recusada", nome: "Edric da Névoa", dono: "Edric", motivo: "lugar" }]);
  t("misturada com um homónimo, cada uma tem a sua linha", misto.split("\n").length === 2 && /Edric da Névoa/.test(misto));
  const oficio = N.nomeComDono("Biblioteca do Peregrino", {}, ctxDe({ papel: "ferreiro" }, { aqui: ["Casa da Fonte", "A Biblioteca do Peregrino"] }));
  t("o ofício que não casa (ferreiro × arquivista) não resolve para o dono", oficio.decisao === "recusada");
}

sec("3. a tabela não morde gente");
{
  let vistos = 0;
  const mordidos = [];
  for (const g of generosDisponiveis()) {
    const r = rngDe(`lugar-nao-e-gente|${g}`);
    for (let i = 0; i < 3000 / generosDisponiveis().length; i++) {
      const nome = nomePessoa(g, i % 2 ? "m" : "f", r);
      vistos++;
      const id = N.nomeComDono(nome, {}, { aqui: [] });
      if (id.motivo === "lugar_nao_e_gente") mordidos.push(nome);
    }
  }
  t(`${vistos} nomes do gerador, nenhum lido como lugar`, mordidos.length === 0, mordidos.slice(0, 5).join(", "));
  for (const p of ["Guardião da Ponte Lenta", "Hakon Guarda-Portão", "Nyla da Torre", "Bjorn da Torre", "Godfrey Mata-Lobos"]) {
    t(`"${p}" continua gente`, N.nomeComDono(p, {}, ctxDe({})).motivo !== "lugar_nao_e_gente");
  }
  t("as palavras que abrem uma casa estão na tabela", ["taverna", "estalagem", "mercado", "templo", "biblioteca"].every((w) => N.LUGAR_NAO_E_GENTE.abre.includes(w)));
}

sec("4. a pauta diz o nome; a abertura leva-o");
{
  const rumo = (aqui) => E.linhaDoRumo({ pedido: E.lerOPedido("Quanto custa um quarto? E quem manda nesta cidade?"), degrau: E.degrauDaEscuta(0),
    passo: A.proximoPasso({ abertura: ABERTURA, missoes: [PRINCIPAL] }), semente: 1,
    mundo: { aqui, abertura: ABERTURA, missoes: [PRINCIPAL] } });
  const dentro = rumo("na Candeia Faiscante, dentro de Casa da Fonte");
  t("na Candeia, O RUMO manda falar com o Osric e que ele diga o nome", /Osric Pé-Leve/.test(dentro) && /próprio nome/.test(dentro) && !/Procurar Osric/.test(dentro), dentro);
  t("com o ofício da ficha (taverneiro daqui)", /taverneiro daqui/.test(dentro));
  const fora = rumo("na praça, em Casa da Fonte");
  t("fora da Candeia, o passo de sempre (Procurar Osric na Candeia)", /Procurar Osric Pé-Leve na Candeia Faiscante/.test(fora), fora);
  t("sem o mundo, o passo que o App mandou (regressão zero)", /Procurar Osric/.test(E.linhaDoRumo({ pedido: E.lerOPedido("e agora?"), degrau: E.degrauDaEscuta(0), passo: "Procurar Osric Pé-Leve na Candeia Faiscante" })));
  t("o passo de dentro sai da tabela PASSO_AQUI", dentro.includes(A.PASSO_AQUI.pista.replace("{nome}", "Osric Pé-Leve").replace("{papel}", "taverneiro")));
  const semPapel = A.proximoPasso({ abertura: { ...ABERTURA, pista: { ...ABERTURA.pista, papel: "" } }, missoes: [PRINCIPAL], aqui: "na Candeia Faiscante" });
  t("sem ofício na ficha, a variante sem ele", semPapel.includes("que está aqui e diz ao herói o próprio nome"), semPapel);
  const ped = A.pedidoDaAbertura(ABERTURA, { habilidades: [] });
  t("a abertura leva o nome e o ofício da pista", ped.includes("Osric Pé-Leve, taverneiro"));
  const feito = M.criarMissao({ ...PRINCIPAL, etapas: [{ ...PRINCIPAL.etapas[0], feito: true }, PRINCIPAL.etapas[1]] });
  t("com o Osric já achado, na Candeia o passo é o seguinte (o Edric)", /Edric/.test(A.proximoPasso({ abertura: ABERTURA, missoes: [feito], aqui: "na Candeia Faiscante" })));
}

sec("5. lixo e imutabilidade");
{
  for (const lixo of [null, undefined, "", 3, {}, []]) {
    t(`nome lixo (${J(lixo)}) não estoura`, tenta(() => N.nomeComDono(lixo, null, null).decisao, "x") === "nova");
  }
  t("contexto null não estoura com nome de casa", tenta(() => N.nomeComDono("Taverna do Sol", {}, null).decisao, "x") === "recusada");
  t("notaDoHomonimo com lixo devolve vazio", N.notaDoHomonimo([null, {}, 3]) === "");
  for (const aqui of [null, 3, {}, ""]) t(`proximoPasso com aqui lixo (${J(aqui)}) dá o passo de sempre`, tenta(() => A.proximoPasso({ abertura: ABERTURA, missoes: [PRINCIPAL], aqui }), "x") === "Procurar Osric Pé-Leve na Candeia Faiscante");
  const reg = { Hakon: { nome: "Hakon" } }; const c = J(reg); const cx = J(CTX);
  N.nomeComDono(FICHA.nome, reg, ctxDe(FICHA));
  t("o registo e o contexto não são mutados", J(reg) === c && J(CTX) === cx);
}

console.log(`\num lugar não é gente: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
