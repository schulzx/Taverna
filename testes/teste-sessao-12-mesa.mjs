/* A MESA DA 12.ª SESSÃO — o que ficou da qualidade (mente/mm11-sessao-12.md, 20/10)

   A 12.ª provou que as ondas do custo não custaram memória, e deixou três
   defeitos de mesa que não eram da economia:
     a. "a sua irmã" para Aelith, duas vezes — a companheira de armas, sem
        parentesco na ficha do grupo;
     b. o registo como confete: nove nomes sem verbo a dançar na taverna
        (T4–T14), e Magnus o Exilado a cuspir sangue dentro da mina;
     c. a bolsa, que a sessão não conferiu turno a turno — e os dois "mal
        cobrados" que a 10.ª deixou abertos.
   Cada um com a causa e o conserto, provados aqui. */
const N = await import("../src/npcs.js");
const C = await import("../src/cena.js");
const K = await import("../src/cobranca.js");
const CI = await import("../src/companheiro-inicial.js");

let bons = 0, maus = 0;
const t = (n, c, extra = "") => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? "  → " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

sec("a. QUEM ANDA COMIGO DIZ O QUE NÃO É");
{
  const P = N.PARENTESCO_NO_GRUPO;
  t("a frase e o que já diz sangue são tabela", P.frase === "não é parente do herói" && P.lacosDeSangue.includes("familia") && P.relacoesDeSangue.includes("conjuge"));
  /* a ficha que companheiroInicial grava para a ligação "armas" (a da 12.ª) e para "sangue" */
  const lig = (id) => CI.LIGACOES_AO_PASSADO.find((l) => l.id === id);
  const armas = lig("armas"), sangue = lig("sangue");
  const aelith = N.criarNPC("Aelith", { papel: `${armas.curto.mulher}, Guerreiro`, relacao: armas.relacao, genero: "mulher", local: "Ponte Rasa",
    notas: `${armas.quem.mulher}; conhecem-se há 5 anos`, conhecidoEm: 0, laco: { tipo: armas.laco, forca: armas.forca, desde: -1800 } });
  const brida = N.criarNPC("Brida", { papel: `${sangue.curto.mulher}, Ladino`, relacao: sangue.relacao, genero: "mulher", local: "Ponte Rasa",
    notas: `${sangue.quem.mulher}; conhecem-se há 25 anos`, conhecidoEm: 0, laco: { tipo: sangue.laco, forca: sangue.forca, desde: -9000 } });
  const wystan = N.criarNPC("Wystan", { papel: "taverneiro", local: "Ponte Rasa" });
  const reg = { Aelith: aelith, Brida: brida, Wystan: wystan };
  const txt = N.resumoNPCsParaPrompt(reg, undefined, { grupo: [{ nome: "Aelith" }, { nome: "Brida" }] });
  const linha = (nome) => txt.split("\n").find((l) => l.startsWith(`• ${nome} `)) || "";
  t("a companheira de armas leva a frase fechada (era: só o que ela é, e o Mestre fê-la irmã)", linha("Aelith").endsWith(`· ${P.frase}`), linha("Aelith"));
  t("a irmã de sangue não a leva — a ficha já diz \"irmã do herói\"", !linha("Brida").includes(P.frase) && linha("Brida").includes("irmã do herói"), linha("Brida"));
  t("quem não anda comigo não a leva (o taverneiro não precisa)", !linha("Wystan").includes(P.frase));
  t("o cônjuge também não", !N.resumoNPCsParaPrompt({ X: N.criarNPC("Xavier", { relacao: "conjuge" }) }, undefined, { grupo: ["Xavier"] }).includes(P.frase));
  t("sem contexto (o prompt fora de um turno), a lista de sempre", !N.resumoNPCsParaPrompt(reg).includes(P.frase) && !N.resumoNPCsParaPrompt(reg, undefined, null).includes(P.frase));
  /* o teto de caracteres da lista continua a valer com a frase a mais */
  const muitos = {};
  for (let i = 1; i <= 30; i++) muitos[`G${i}`] = N.criarNPC(`Gente ${i}`, { papel: "companheira de armas, Guerreiro", relacao: "companheiro", notas: "x".repeat(90), laco: { tipo: "amizade", forca: 3, desde: -100 } });
  const cheio = N.resumoNPCsParaPrompt(muitos, undefined, { grupo: Object.values(muitos).map((n) => n.nome) });
  t("o pior caso não sobe: a lista cabe no teto de caracteres", cheio.length <= N.TETO_DAS_PESSOAS.chars, String(cheio.length));
}

sec("b. O LUGAR NÃO É A CENA");
{
  const L = C.LUGAR_NAO_E_CENA;
  t("o fecho e a linha da cidade são tabela", /mais ninguém do registro/.test(L.fecho) && /NA CIDADE/.test(L.naCidade) && L.lugarMinimo === 4);
  /* a 12.ª reconstruída: Ponte Rasa, a Ferradura & a Viúva, a companheira e
     os nove nomes que dançaram na taverna sem ninguém os chamar */
  const mapa = { cidades: [{ nome: "Ponte Rasa", x: 0, y: 0 }, { nome: "Vau Alto", x: 60, y: 0 }] };
  const CONFETE = ["Ivarr Sombravinda", "Greta", "Yorick", "Sigrun", "Jarl", "Rowena Rompe-Escudos", "Rhogar", "Ylva Mão-Torta", "Ondine"];
  const reg = {
    Aelith: { nome: "Aelith", local: "Ponte Rasa", relacao: "companheiro" },
    Wystan: { nome: "Wystan", local: "Ferradura & a Viúva, Ponte Rasa", relacao: "aliado" },
    Magnus: { nome: "Magnus o Exilado", local: "Ponte Rasa", relacao: "rival" },
  };
  CONFETE.forEach((n, i) => { reg[n] = { nome: n, local: i % 3 ? "Ponte Rasa" : "", relacao: "amigo" }; });
  const ctx = { comGrupo: [{ nome: "Aelith" }], emCena: [], lugar: ["Ferradura & a Viúva"] };
  const tx = C.resumoCenaPrompt(reg, "Ponte Rasa", mapa, ctx);
  const pres = tx.split("\n").find((l) => /PRESENTES/.test(l)) || "";
  const cid = tx.split("\n").find((l) => /NA CIDADE/.test(l)) || "";
  console.log("      " + pres + "\n      " + cid.slice(0, 160) + "…");
  t("na taverna, PRESENTES é a companheira e quem está no prédio", /Aelith \(viaja com você\)/.test(pres) && /Wystan/.test(pres));
  t("e nenhum dos nove (era: os nove, \"vive em Ponte Rasa\", sob \"obedeça\")", CONFETE.every((n) => !pres.includes(n)), pres);
  t("a lista da cena fecha", pres.endsWith(`${L.fecho}.`));
  t("os nove continuam no mundo, só com o nome, na linha da cidade", CONFETE.every((n) => cid.includes(n)) && !/vive em/.test(cid));
  t("quem a narração já pôs na cena fica nela (a continuidade)", /PRESENTES[^\n]*Greta/.test(C.resumoCenaPrompt(reg, "Ponte Rasa", mapa, { ...ctx, emCena: ["Greta"] })));
  t("o prédio que é a própria cidade não traz a cidade inteira", CONFETE.every((n) => !(C.resumoCenaPrompt(reg, "Ponte Rasa", mapa, { ...ctx, lugar: ["Ponte Rasa"] }).split("\n").find((l) => /PRESENTES/.test(l)) || "").includes(n)));
  /* a mina: Magnus a cuspir sangue na pedra */
  const mina = C.resumoCenaPrompt(reg, "Ponte Rasa", mapa, { ...ctx, masmorra: { nome: "Poço de Sangue Velho" } });
  const pm = mina.split("\n").find((l) => /PRESENTES/.test(l)) || "";
  t("na mina, PRESENTES é o grupo, e a lista fecha (era: aberta, e Magnus desceu)", pm === `- PRESENTES em Poço de Sangue Velho: Aelith (viaja com você)${L.fecho}.`, pm);
  t("e a cidade não aparece como cidade dentro da mina", !/NA CIDADE/.test(mina));
  /* o pior caso: sessenta moradores — as duas linhas juntas cabem no teto do aqui, e encolhem */
  const cheia = {};
  for (let i = 1; i <= 60; i++) cheia[`P${i}`] = { nome: `Pessoa Comprida Numero ${i}`, local: "Ponte Rasa", ultimaVez: i, relacao: "amigo" };
  cheia.Aelith = { nome: "Aelith", local: "Ponte Rasa" };
  const tc = C.resumoCenaPrompt(cheia, "Ponte Rasa", mapa, { comGrupo: [{ nome: "Aelith" }], emCena: ["Pessoa Comprida Numero 3"] });
  const duas = tc.split("\n").filter((l) => /PRESENTES|NA CIDADE/.test(l)).reduce((a, l) => a + l.length, 0);
  /* medido com a versão de antes (HEAD v9.474): 693 caracteres numa linha só */
  t(`o pior caso desce (antes 693, agora ${duas})`, duas < 693 && duas <= C.TETO_DO_QUEM.aqui.chars + 40, String(duas));
  t("e diz que é parcial", /NA CIDADE[^\n]*· \+\d+\./.test(tc));
  t("lixo não derruba", C.resumoCenaPrompt(null, "", null) === "" && typeof C.resumoCenaPrompt(reg, "Ponte Rasa", mapa, { lugar: [null, 5, ""] }) === "string");
}

sec("c. A BOLSA DA 12.ª E OS DOIS DA 10.ª");
{
  /* a 12.ª pagou em lascas (a moeda do mundo); a frase do ganho é a real */
  const achado = K.oQueFaltaCreditar("Você acha quatro lascas na terra.", {}, { moeda: "lascas" });
  t("\"você acha quatro lascas na terra\" entra na bolsa (+4)", achado.moedas === 4);
  const preco = K.oQueFaltaDebitar("— Cinco lascas por um remendo de boldrié — diz o homem, sem largar a agulha.", {}, { pedido: "Pergunto quanto custa remendar o boldrié.", moeda: "lascas", bolsa: 30 });
  t("o preço dito pelo Mestre (inventado) não sai da bolsa: ninguém pagou", preco.moedas === 0 && !preco.temAlgo);
  /* os dois "mal cobrados" da 10.ª: fechados a 13/10 (RECUSA_DA_CENA e
     ORACAO_DO_PAGAMENTO), e provados com as frases inteiras em
     teste-sessao-10-mao.mjs — aqui só a confirmação de que continuam */
  const m6 = K.oQueFaltaDebitar("Você desliza dois cobres sobre o balcão. Ele devolve a carta.", {}, { pedido: "Sento no balcão, peço uma caneca de cerveja a Godfrey e pago os dois cobres. Depois mostro a carta sem assinatura e pergunto o que ele sabe do Rossio Torto.", bolsa: 15 });
  const m45 = K.oQueFaltaDebitar("Você despeja as moedas na palma do taverneiro, uma a uma.", {}, { pedido: "Digo ao taverneiro que eu sei o que isso quer dizer. Conto vinte e três moedas na mão dele e pago a dívida de Perrin, e peço que me diga onde posso encontrá-lo.", bolsa: 161 });
  t("10.ª M6: a carta devolvida não anula a caneca (−2)", m6.moedas === 2);
  t("10.ª M45: o \"posso\" de outra oração não anula a dívida (−23)", m45.moedas === 23);
}

console.log(`\n${bons} ok, ${maus} falha(s)`);
if (maus) process.exit(1);
