/* O LÉXICO TOTAL (v9.166) — o treinamento completo do Mestre

   "O léxico tem que ser completo na hora da criação do mundo e do
   treinamento do mestre." Três buracos fechados nesta leva:

   O PASSADO — todo mundo do léxico nascia no dia da criação: nenhuma
   guerra velha para o taverneiro culpar, nenhuma ferida que explicasse
   a guarda revistando estrangeiro. Agora a criação pergunta pelos dois
   ou três fatos que toda boca cita, e eles sobem ao bloco fixo — que é
   cacheável porque o passado, por definição, não muda.

   OS TÍTULOS — "o Rei Emprestado" como chefe de um mundo cyberpunk
   denunciava o gerador na primeira aparição: o banco de epítetos era
   medieval no osso. O mundo agora traz os seus.

   A JUSTIÇA E A FÉ — o que o Mestre mais improvisava numa cena de
   cidade (quem prende, a quem se reza), improvisado com o hábito do
   gênero, que é exatamente o que o léxico existe para substituir.

   (A reforma das raças — grupos, gentílico — mora em teste-racas.mjs,
   que é a suíte dona daquela lei.) */

const S = "../src/";
const LEX = await import(S + "lexico.js");
const { garantirLexico, passadoDo, titulosDo, sistemaPorId, lexicoPrompt, lexicoDaCena, pedidoDoLexico, TETO_DO_BLOCO } = LEX;
const { chefesDoMundo } = await import(S + "mundo-base.js");
const { gerarGeografia } = await import(S + "geografia.js");
const { moldePorId } = await import(S + "moldes.js");

let bons = 0, maus = 0;
const t = (n, c) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n); } };
const sec = (s) => console.log("\n" + s);

/* um léxico gordo o bastante para valer, com os campos novos dentro */
const CRU = {
  chamado: { masmorra: "fenda", taverna: "cantina" },
  funciona: { justica: "Os tribunais são leilões: quem paga mais leva o veredito, e todo mundo sabe.", fe: "Reza-se ao Sinal, uma luz que cruza o céu ao anoitecer; quem a perde três noites seguidas raspa a cabeça." },
  povos: ["ferrenhos", "vagantes do poço"],
  oficios: ["catador", "afiador", "vigia de fenda", "cozinheiro de rua"],
  criaturas: [{ ameaca: "comum", nomes: ["rato-de-conduíte", "lodo pálido", "vespa de cabo"] }],
  passado: [
    "a Queda do Segundo Sol, há quarenta anos, deixou o céu cinza para sempre",
    "a Guerra dos Nove Portões terminou sem vencedor e com oito portões",
    "o Ano Sem Colheita, quando se comeu o que não se nomeia",
  ],
  titulos: ["a Mão de Cinza", "o Fio Duplo", "a Voz do Conduíte", "o Último Leilão", "a Dívida Andante"],
  aLei: "Ninguém sobe sem pagar a quem desceu.",
};

sec("1. O PASSADO QUE TODOS CARREGAM");
{
  const l = garantirLexico(CRU);
  t("a garantia guarda o passado", l.passado.length === 3);
  t("com teto por fato", garantirLexico({ passado: ["x".repeat(500)] }).passado[0].length <= 110);
  t("e teto de quatro fatos", garantirLexico({ passado: ["a", "b", "c", "d", "e", "f"] }).passado.length === 4);
  /* um fato solto viraria A única história do mundo, repetida por toda boca */
  t("um fato só não vale como passado", passadoDo({ ...CRU, passado: ["só um"] }) === null);
  t("dois já valem", passadoDo({ ...CRU, passado: CRU.passado.slice(0, 2) }).length === 2);
  const p = lexicoPrompt({ ...garantirLexico(CRU), gerado: true });
  t("o bloco fixo carrega o passado", p.includes("O PASSADO QUE TODOS CARREGAM"));
  t("com os fatos literais", p.includes("Segundo Sol") && p.includes("Nove Portões"));
  t("como fato consumado, não como rascunho", p.includes("cite-os, não os reescreva"));
  /* e ele é CACHEÁVEL: o bloco fixo é o mesmo com qualquer cena aberta —
     é a mesma lei da v9.162, agora com um campo a mais dentro */
  t("o bloco fixo não depende da cena", lexicoPrompt({ ...garantirLexico(CRU), gerado: true }) === p);
  t("sem passado, sem linha", !lexicoPrompt({ ...garantirLexico({ ...CRU, passado: [] }), gerado: true }).includes("PASSADO QUE TODOS"));
}

sec("2. OS TÍTULOS DO MUNDO");
{
  t("a garantia guarda os títulos", garantirLexico(CRU).titulos.length === 5);
  /* os chefes são quatro a seis: com menos títulos que chefes, dois
     dividiriam o mesmo epíteto */
  t("três títulos não valem como banco", titulosDo({ ...CRU, titulos: CRU.titulos.slice(0, 3) }) === null);
  t("quatro valem", titulosDo({ ...CRU, titulos: CRU.titulos.slice(0, 4) }).length === 4);
  const mapa = gerarGeografia("mundo-dos-titulos|3", moldePorId("sobremundo"));
  const comLex = chefesDoMundo("mundo-dos-titulos|3", mapa, "Fantasia medieval", garantirLexico(CRU));
  t("todo chefe veste um título do mundo", comLex.every((c) => CRU.titulos.some((tt) => c.nome.includes(tt))));
  /* e o mundo SEM léxico sorteia exatamente o que sempre sorteou — uma
     chamada de rnd nos dois caminhos, determinismo de save preservado */
  const semLex = chefesDoMundo("mundo-dos-titulos|3", mapa, "Fantasia medieval", null);
  const semLex2 = chefesDoMundo("mundo-dos-titulos|3", mapa, "Fantasia medieval", null);
  t("sem léxico, os chefes de sempre", JSON.stringify(semLex) === JSON.stringify(semLex2) && semLex.every((c) => !CRU.titulos.some((tt) => c.nome.includes(tt))));
}

sec("3. A JUSTIÇA E A FÉ ENTRAM PELA PORTA DA CIDADE");
{
  const j = sistemaPorId("justica"), f = sistemaPorId("fe");
  t("as duas perguntas existem", !!j && !!f);
  t("e viajam pela porta da cidade", j.porta === "cidade" && f.porta === "cidade");
  /* mecanismo, não adjetivo: as perguntas pedem quem/o quê, não clima */
  t("a da justiça pede o mecanismo", /quem prende, quem julga/.test(j.pergunta));
  t("a da fé pede o que se vê na rua", /como isso aparece/.test(f.pergunta));
  const cena = lexicoDaCena({ ...garantirLexico(CRU), gerado: true }, { cidade: true });
  t("com a porta aberta, a cena recebe as duas", cena.includes("COMO A LEI COBRA AQUI") && cena.includes("A QUEM SE REZA"));
  t("com a porta fechada, nada", !lexicoDaCena({ ...garantirLexico(CRU), gerado: true }, { combate: true }).includes("A QUEM SE REZA"));
}

sec("4. O PEDIDO PERGUNTA TUDO ISSO NA CRIAÇÃO");
{
  const pedido = pedidoDoLexico({ genero: "Fantasia medieval", descricao: "um mundo de fendas" });
  t("pede o passado", pedido.includes('"passado"') && /acontecimentos do passado/.test(pedido));
  t("pede os títulos", pedido.includes('"titulos"') && /epítetos/.test(pedido));
  t("pede a justiça", /o que se pune de verdade/.test(pedido));
  t("pede a fé", /veneram ou temem/.test(pedido));
  t("pede a passagem (v9.165)", /passagem fechada|portal cego/i.test(pedido));
}

sec("5. O ORÇAMENTO CONTINUA SENDO LEI");
{
  /* o teto subiu 1700 → 2000 PARA CABER o passado — esta seção prova que
     ele coube e que o teto novo ainda morde */
  const gordo = { ...CRU };
  gordo.funciona = Object.fromEntries(LEX.SISTEMAS.map((s) => [s.id, "x".repeat(170)]));
  gordo.naoExiste = ["cavalos", "pólvora", "deuses com nome", "neve", "moeda cunhada", "sinos"];
  const bloco = lexicoPrompt({ ...garantirLexico(gordo), gerado: true });
  t(`o bloco fixo cabe no teto (${bloco.length}/${TETO_DO_BLOCO})`, bloco.length > 0 && bloco.length <= TETO_DO_BLOCO);
  t("e o passado coube nele", bloco.includes("O PASSADO QUE TODOS CARREGAM"));
  t("o teto novo é 2000, com razão escrita", TETO_DO_BLOCO === 2000);
}

console.log(`\nléxico total v9.166: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
