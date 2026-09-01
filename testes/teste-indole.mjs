/* A ÍNDOLE (v9.136) — quem a pessoa É

   Três módulos, três perguntas, e faltava a primeira: `indole.js` diz quem
   ela é, `interprete.js` o que ela faz, `falas.js` o que ela diz.

   Até aqui a personalidade era UMA STRING sorteada, e os vetos que governam
   o que alguém nunca faz saíam de REGEX em cima dela — quem tivesse
   "reservado" no traço não entregava. Funcionava por acidente de
   vocabulário: bastava a lista de traços mudar uma palavra para metade dos
   vetos calar.

   O que esta suíte defende:

   · que traço que briga não conviva — corajoso e medroso na mesma cabeça não
     é complexidade, é ruído, e o ator escolheria um por sorteio;
   · que o medo só acorde quando a coisa temida ESTÁ na cena, senão vira
     maneirismo;
   · e sobretudo que o PROPÓSITO não seja etiqueta. "Trair o herói" só vale
     com uma condição que o sistema confere — é a quinta lei da casa. */

const S = "../src/";
const { readFileSync } = await import("node:fs");
const semCom = (x) => x.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
const APP = semCom(readFileSync("../src/App.jsx", "utf8"));
const I = await import(S + "indole.js");
const INT = await import(S + "interprete.js");
const F = await import(S + "falas.js");
const { gerarGeografia } = await import(S + "geografia.js");
const { locaisDaCidade, genteDoLocal } = await import(S + "mundo-base.js");

let bons = 0, maus = 0;
const t = (nome, cond) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);
const SEM = "O Decimo Portao";

sec("1. TRAÇO QUE BRIGA NÃO CONVIVE");
{
  t("a briga é simétrica", I.TRACOS.every((a) => a.briga.every((b) => {
    const B = I.tracoPorId(b); return B && B.briga.includes(a.id);
  })));
  t("corajoso e medroso brigam", !I.compativel("corajoso", "medroso"));
  t("fiel e traidor também", !I.compativel("fiel", "traidor"));
  t("e ninguém é compatível consigo", !I.compativel("fiel", "fiel"));
  /* a prova de volume: mil pessoas, zero pares brigando */
  let ruins = 0, comTraco = 0;
  for (let n = 0; n < 1000; n++) {
    const i = I.indoleDe(SEM, { nome: "gente-" + n });
    if (i.tracos.length) comTraco++;
    for (const a of i.tracos) for (const b of i.tracos) if (a !== b && !I.compativel(a, b)) ruins++;
  }
  t("mil pessoas, nenhum par brigando", ruins === 0);
  t("e todas têm ao menos um traço", comTraco === 1000);
  /* a catraca também não deixa entrar briga vinda de save torto */
  const forcado = I.garantirIndole({ tracos: ["corajoso", "medroso", "fiel", "traidor"] });
  t("a catraca apara a briga que vier de fora", forcado.tracos.length === 2 && forcado.tracos.includes("corajoso") && forcado.tracos.includes("fiel"));
  t("e no máximo três", I.garantirIndole({ tracos: ["curioso", "supersticioso", "rancoroso", "orgulhoso"] }).tracos.length === 3);
}

sec("2. O APELIDO MANDA");
{
  /* a sonda devolveu "Corwin Sem-Medo · calado, fiel, MEDROSO". O apelido é
     parte do nome e o jogador o lê primeiro: uma índole que o contradiz não
     é ironia, é o mundo se desmentindo na mesma linha. */
  t("Sem-Medo é corajoso", I.indoleDe(SEM, { nome: "Corwin Sem-Medo" }).tracos.includes("corajoso"));
  t("o Silencioso é calado", I.indoleDe(SEM, { nome: "Rurik o Silencioso" }).tracos.includes("calado"));
  t("Mata-Lobos é medonho", I.indoleDe(SEM, { nome: "Fendrel Mata-Lobos" }).tracos.includes("medonho"));
  t("e o apelido nunca traz briga junto", ["Corwin Sem-Medo", "Rurik o Silencioso", "Fendrel Mata-Lobos", "Ana Passo-de-Gato"].every((n) => {
    const i = I.indoleDe(SEM, { nome: n });
    return i.tracos.every((a) => i.tracos.every((b) => a === b || I.compativel(a, b)));
  }));
}

sec("3. O MEDO SÓ ACORDA COM A COISA NA CENA");
{
  const medroso = I.garantirIndole({ tracos: ["medroso"], medo: "feras" });
  t("com lobo na cena, acorda", !!I.medoAcordado(medroso, { inimigos: [{ nome: "Lobo Cinzento" }] }));
  t("sem lobo, dorme", I.medoAcordado(medroso, { inimigos: [{ nome: "Bandido" }] }) === null);
  t("e o lugar também acorda", !!I.medoAcordado(I.garantirIndole({ medo: "escuro" }), { lugar: "a cripta funda" }));
  t("a noite acorda o escuro", !!I.medoAcordado(I.garantirIndole({ medo: "escuro" }), { noite: true }));
  t("quem não tem medo não acorda nunca", I.medoAcordado(I.garantirIndole({}), { inimigos: [{ nome: "Lobo" }], noite: true }) === null);
  t("todo medo diz o que a pessoa faz", I.MEDOS.every((m) => m.faz && m.faz.length > 8));
  t("e todo medo tem como acordar", I.MEDOS.every((m) => m.acorda instanceof RegExp));
}

sec("4. O PROPÓSITO NÃO É ETIQUETA");
{
  /* A REGRA DESTA VERSÃO: todo propósito tem de dizer o que o faz amadurecer,
     e essa condição tem de ser conferível. Sem isso é adjetivo, e adjetivo
     devolve a decisão para a IA. */
  t("todo propósito sabe amadurecer", I.PROPOSITOS.every((p) => typeof p.madura === "function"));
  t("todo propósito diz o que muda no mundo", I.PROPOSITOS.every((p) => p.vira && p.vira.length > 12));
  t("e diz de que gente ele é", I.PROPOSITOS.every((p) => p.exige.length && p.exige.every((x) => !!I.tracoPorId(x))));
  /* nenhum amadurece num mundo sem convivência: se amadurecesse, seria
     etiqueta que dispara sozinha */
  t("nenhum amadurece no dia zero", I.PROPOSITOS.every((p) => !p.madura(I.garantirConvivio({}))));

  const traidora = I.garantirIndole({ tracos: ["traidor"], proposito: "trair", relevancia: "recorrente" });
  t("laço forte sem tempo não basta", !I.propositoMaduro(traidora, { dias: 2, forcaDoLaco: 3 }));
  t("tempo sem laço não basta", !I.propositoMaduro(traidora, { dias: 8, forcaDoLaco: 1 }));
  t("os dois juntos amadurecem", !!I.propositoMaduro(traidora, { dias: 8, forcaDoLaco: 3 }));
  t("ou um segredo dele na mão dela", !!I.propositoMaduro(traidora, { dias: 8, sabeDeMim: true }));
  t("cumprido não acontece duas vezes", I.propositoMaduro(I.cumprir(traidora), { dias: 99, forcaDoLaco: 3 }) === null);
  t("quem não tem propósito nunca amadurece", I.propositoMaduro(I.garantirIndole({}), { dias: 99, forcaDoLaco: 3 }) === null);
}

sec("5. PROPÓSITO É DE QUEM VOLTA");
{
  /* Um mundo em que cada taverneiro tem um plano secreto é um mundo sem
     taverneiro nenhum: o jogador para de acreditar em qualquer um. */
  let fig = 0, figComProposito = 0, comProposito = 0;
  for (let n = 0; n < 600; n++) {
    const i = I.indoleDe(SEM, { nome: "x-" + n });
    if (i.relevancia === "figurante") { fig++; if (i.proposito) figComProposito++; }
    if (i.proposito) comProposito++;
  }
  t("figurante nunca carrega propósito", figComProposito === 0);
  t("e a maioria é figurante", fig > 600 * 0.45);
  t("mas há propósito no mundo", comProposito > 20);
  /* e o propósito casa com os traços: um fiel não nasce querendo trair */
  let incoerentes = 0;
  for (let n = 0; n < 600; n++) {
    const i = I.indoleDe(SEM, { nome: "y-" + n });
    if (!i.proposito) continue;
    const p = I.propositoPorId(i.proposito);
    if (!p.exige.some((x) => i.tracos.includes(x))) incoerentes++;
  }
  t("nenhum propósito contradiz a índole de quem o carrega", incoerentes === 0);
}

sec("6. DETERMINISMO, E A CHAVE É O NOME");
{
  t("a mesma pessoa dá sempre a mesma índole", JSON.stringify(I.indoleDe(SEM, { nome: "Fina Da Rede" })) === JSON.stringify(I.indoleDe(SEM, { nome: "Fina Da Rede" })));
  t("gente diferente, índole diferente", JSON.stringify(I.indoleDe(SEM, { nome: "Fina" })) !== JSON.stringify(I.indoleDe(SEM, { nome: "Kael" })));
  t("mundo diferente, índole diferente", JSON.stringify(I.indoleDe("outro", { nome: "Fina" })) !== JSON.stringify(I.indoleDe(SEM, { nome: "Fina" })));
  /* A CHAVE É O NOME, e não o id: é o que torna a índole derivável de
     qualquer lugar, como o rosto já era. Com o id na frente, a mesma pessoa
     teria uma índole na base e outra na ficha. */
  t("o id não muda a índole de quem tem nome", JSON.stringify(I.indoleDe(SEM, { nome: "Fina", id: "a|1" })) === JSON.stringify(I.indoleDe(SEM, { nome: "Fina", id: "b|9" })));
}

sec("7. A GENTE DO MUNDO NASCE COM ELA");
{
  const mapa = gerarGeografia(SEM, null, null);
  const gente = [];
  for (const l of locaisDaCidade(SEM, mapa.cidades[0], "Fantasia medieval", null, null)) {
    gente.push(...genteDoLocal(SEM, l, "Fantasia medieval", null, null));
  }
  t("há gente na cidade", gente.length > 5);
  t("e toda ela tem índole", gente.every((p) => p.indole && Array.isArray(p.indole.tracos)));
  t("com traços de verdade", gente.every((p) => p.indole.tracos.length >= 1));
  /* e a índole da base bate com a derivada pelo nome */
  t("a base e a derivação concordam", gente.every((p) => JSON.stringify(p.indole) === JSON.stringify(I.indoleDe(SEM, { nome: p.nome }))));
}

sec("8. O VETO SAI DA ESTRUTURA, E CHEGA À FALA");
{
  t("a índole devolve os vetos dos traços", I.vetosDaIndole({ tracos: ["medroso"] }).includes("ameaca"));
  t("e junta os de todos", I.vetosDaIndole({ tracos: ["calado", "ganancioso"] }).includes("entrega"));
  t("sem índole, nenhum veto", I.vetosDaIndole(null).length === 0);
  /* o Intérprete passa a somar os dois: a estrutura e a rede antiga */
  const pessoa = { nome: "Fina", papel: "taverneira", temperamento: "", indole: { tracos: ["medroso"] } };
  t("o Intérprete lê a índole", INT.gestosProibidos(pessoa).includes("ameaca"));
  t("e a rede antiga continua para quem não tem índole", INT.gestosProibidos({ nome: "X", papel: "guarda", temperamento: "" }).includes("esquiva"));

  /* e o ator recebe tudo isso */
  const d = F.dossieDe({ nome: "Fina", papel: "taverneira", indole: I.garantirIndole({ tracos: ["calado"], medo: "feras", forca: "olho", proposito: "trair", relevancia: "recorrente" }) },
    { faz: "enche o caneco", proibidos: ["entrega"], acao: "Quem viu Ione?", cena: { inimigos: [{ nome: "Lobo" }], convivio: { dias: 9, forcaDoLaco: 3 } } });
  const p = F.promptDoAtor(d);
  t("o ator sabe como ela é", /COMO VOCÊ É:/.test(p) && /fala o mínimo/.test(p));
  t("e no que ela é boa", /NO QUE VOCÊ É BOM:/.test(p));
  t("o medo entra porque o lobo está na cena", /O QUE VOCÊ TEME, E ESTÁ AQUI:/.test(p) && /feras/.test(p));
  t("o propósito entra como INTENÇÃO SECRETA", /A SUA INTENÇÃO SECRETA:/.test(p));
  t("e ele é proibido de anunciá-la", /NUNCA a anuncie/.test(p));
  t("madura, o ator sabe que a hora chegou", /A hora chegou/.test(p));
  /* sem o lobo, o medo não entra — senão vira maneirismo */
  const semLobo = F.dossieDe({ nome: "Fina", indole: I.garantirIndole({ medo: "feras" }) }, { cena: { inimigos: [{ nome: "Bandido" }] } });
  t("sem a coisa temida, o medo não é dito", !/O QUE VOCÊ TEME/.test(F.promptDoAtor(semLobo)));
}

sec("9. NA TELA, SEM ESTRAGAR O QUE É SEGREDO");
{
  const li = I.linhaDaIndole(I.garantirIndole({ tracos: ["calado", "fiel"], medo: "fogo", forca: "olho", proposito: "trair" }));
  t("a linha diz traços, medo e força", /calado/.test(li) && /fogo/.test(li) && /passam batido/.test(li));
  /* o PROPÓSITO não entra: ler o fundo falso numa ficha mataria a única
     coisa que ele tem */
  t("e NUNCA diz o propósito", !/trair/i.test(li));
  t("a ficha do elenco a mostra", /linhaDaIndole\(indoleDe\(semente, n\)\)/.test(APP));
  t("com a semente vinda de fora, e não de escopo errado", /function PainelPessoas\(\{[^}]*semente = ""/.test(APP));
}

console.log(`\níndole v9.136: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
