/* teste-laco.mjs (v9.97) — o laço vira registro, e a onda sabe de quem fala.

   "Os fins não sabem de quem falam: o sistema escolhe 'um amor que
   termina' sem saber se há um casal registrado nesta campanha."

   O círculo que se fecha aqui: a SEMENTE escolhe um nome do elenco que já
   existe, a onda o carrega até o preço, o CLÍMAX grava o laço no registro
   de gente, e meses de campanha depois um "amor que termina" encontra
   aquele amor — com nome.

   Sem isto o laço existia só na narração, e o que existe só na narração o
   sistema não pode consultar depois. */
import {
  TIPOS_DE_LACO, tipoDeLacoPorId, FORCA_MAX, garantirLaco,
  firmarLaco, romperLaco, comLaco, criarNPC, firmarEntre, paresEntre, resumoNPCsParaPrompt,
} from "../src/npcs.js";
import { ASSUNTOS, assuntoPorId, escolherAssunto, garantirCompasso, avancarCompasso, envelopeDoCompasso } from "../src/compasso.js";
import { garantirSituacao } from "../src/biblioteca.js";
import fs from "node:fs";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

sec("1. O REGISTRO DO LAÇO");
{
  t(`há tipos de laço (${TIPOS_DE_LACO.length})`, TIPOS_DE_LACO.length >= 5);
  t("cada um diz o que é", TIPOS_DE_LACO.every((x) => x.id && x.rotulo && x.diz));
  t("tipoDeLacoPorId acha e não inventa", !!tipoDeLacoPorId("amor") && tipoDeLacoPorId("nao_existe") === null);

  const n0 = criarNPC("Marta", { papel: "ferreira" });
  t("gente nasce sem laço", n0.laco === null);
  t("e laço inválido é recusado", garantirLaco({ tipo: "inventado" }) === null && garantirLaco(null) === null);

  const n1 = firmarLaco(n0, "amor", 10);
  t("firmar cria o laço", n1.laco.tipo === "amor" && n1.laco.forca === 1 && n1.laco.desde === 10);
  const n2 = firmarLaco(n1, "amor", 20);
  t("firmar de novo fortalece", n2.laco.forca === 2);
  t("mas a data de origem não muda", n2.laco.desde === 10);
  let n3 = n2;
  for (let i = 0; i < 5; i++) n3 = firmarLaco(n3, "amor", 30);
  t(`a força tem teto (${n3.laco.forca})`, n3.laco.forca === FORCA_MAX);
  /* firmar um tipo DIFERENTE substitui: a rivalidade que nasce de uma
     amizade quebrada é outra coisa, não a mesma com outro nome */
  t("outro tipo substitui", firmarLaco(n2, "rivalidade", 40).laco.tipo === "rivalidade");

  const r = romperLaco(n2, 50);
  t("romper marca, não apaga", r.laco.rompido === true && r.laco.tipo === "amor" && r.laco.rompidoEm === 50);
  /* é essa marca que permite a RECONCILIAÇÃO existir: reatar sem ter
     rompido seria um laço nascendo do nada */
  const reatado = firmarLaco(r, "amor", 60);
  t("reatar limpa a marca", reatado.laco.rompido === false);
  t("mas não devolve a força", reatado.laco.forca < n2.laco.forca);
  t("romper o que não existe não quebra", romperLaco(n0, 5).laco === null);
}

sec("2. AS PERGUNTAS QUE O MESTRE FAZ");
{
  const reg = {
    Marta: firmarLaco(criarNPC("Marta"), "amor", 1),
    Ubba: firmarLaco(criarNPC("Ubba"), "amizade", 1),
    Lucan: romperLaco(firmarLaco(criarNPC("Lucan"), "amizade", 1), 9),
    Vaska: criarNPC("Vaska"),
    Sarna: firmarLaco(criarNPC("Sarna", { status: "morto" }), "rivalidade", 1),
  };
  t("acha por tipo", comLaco(reg, { tipo: "amor" }).join() === "Marta");
  t("o rompido não conta como de pé", comLaco(reg, { tipo: "amizade", rompido: false }).join() === "Ubba");
  t("e é achável como rompido", comLaco(reg, { rompido: true }).join() === "Lucan");
  t("quem não tem laço não aparece", !comLaco(reg, {}).includes("Vaska"));
  /* OS MORTOS FICAM DE FORA: um amor que termina com quem já morreu não é
     um fim de laço, é luto — e luto é outro assunto */
  t("e os mortos ficam de fora", !comLaco(reg, {}).includes("Sarna"));
}

sec("3. OS ASSUNTOS DECLARAM O QUE PEDEM E O QUE DEIXAM");
{
  const firmam = ASSUNTOS.filter((a) => a.firma);
  const exigem = ASSUNTOS.filter((a) => a.exige);
  const reatam = ASSUNTOS.filter((a) => a.reata);
  t(`há assuntos que firmam laço (${firmam.length})`, firmam.length >= 6);
  t(`e que exigem um (${exigem.length})`, exigem.length >= 6);
  t(`e que reatam (${reatam.length})`, reatam.length >= 3);

  /* GARANTIA DE LEITOR DO SISTEMA DE LAÇOS: todo tipo exigido tem de ser
     criado por alguém, e todo tipo criado tem de existir no catálogo.
     Um `exige` sem `firma` correspondente é uma regra que nunca dispara —
     e foi exatamente o que aconteceu com "proteção", que viveu dez
     minutos nesta versão antes de a prova o pegar. */
  const tipos = new Set(TIPOS_DE_LACO.map((x) => x.id));
  const criados = new Set(firmam.map((a) => a.firma));
  const pedidos = new Set(exigem.map((a) => a.exige));
  const semCriador = [...pedidos].filter((x) => !criados.has(x));
  t(`todo laço exigido tem quem o crie${semCriador.length ? " — " + semCriador.join(", ") : ""}`, semCriador.length === 0);
  const foraDoCatalogo = [...new Set([...criados, ...pedidos])].filter((x) => !tipos.has(x));
  t(`nenhum tipo fora do catálogo${foraDoCatalogo.length ? " — " + foraDoCatalogo.join(", ") : ""}`, foraDoCatalogo.length === 0);
  const semUso = [...tipos].filter((x) => !criados.has(x));
  t(`nenhum tipo do catálogo sem criador${semUso.length ? " — " + semUso.join(", ") : ""}`, semUso.length === 0);

  /* e quem exige um laço não pode continuar com a trava velha: `precisa`
     só garantia que existisse ALGUÉM, e mantê-la ao lado de `exige` faria
     a fraca esconder a forte */
  t("nenhum assunto tem `exige` e `precisa: gente` ao mesmo tempo",
    !ASSUNTOS.some((a) => a.exige && a.precisa === "gente"));
}

sec("4. A ONDA SÓ DÁ NOME A QUEM PEDE PESSOA");
{
  const elenco = { aqui: ["Marta", "Ubba"], lacos: { amor: ["Marta"], amizade: ["Ubba"], rompidos: ["Lucan"] } };
  const sit = garantirSituacao({
    emCidade: true, pessoaNaCena: true, momento: 0.6, porte: "cidade", bioma: "colina",
    temGenteConhecida: true, temPassado: true, temLugarVisitado: true, temFalaAnterior: true,
    gentePorPerto: 2, genteLonge: 1, diasAteVizinha: 2, nivel: 8, fama: 40,
  });
  let c = garantirCompasso(null);
  const sementes = [];
  for (let i = 0; i < 400; i++) {
    const r = avancarCompasso(c, sit, { sorte: () => (i * 0.0611 + i * i * 0.0017) % 1, elenco });
    c = r.compasso;
    if (r.virou && r.movimento.id === "semente" && r.assunto) sementes.push({ a: r.assunto, quem: r.quem });
  }
  t(`houve sementes (${sementes.length})`, sementes.length >= 10);
  /* A PRIMEIRA VERSÃO DAVA NOME A TODO ASSUNTO, e com isso um achado de
     documento saía com "e é com Marta" grampeado no envelope — o sistema
     enfiando gente numa cena que não pede gente. */
  const nomeIndevido = sementes.filter((x) => x.quem && !x.a.pede && !x.a.exige && !x.a.exigeRompido);
  t(`nenhum assunto ganha nome sem pedir${nomeIndevido.length ? " — " + nomeIndevido.map((x) => x.a.id).join(", ") : ""}`, nomeIndevido.length === 0);
  const semNomeIndevido = sementes.filter((x) => !x.quem && (x.a.pede === "pessoa" || x.a.exige));
  t(`e todo assunto que pede pessoa recebe uma${semNomeIndevido.length ? " — " + semNomeIndevido.map((x) => x.a.id).join(", ") : ""}`, semNomeIndevido.length === 0);
  /* e o nome vem do BALDE CERTO: quem exige amor tira de quem tem amor */
  const doAmor = sementes.filter((x) => x.a.exige === "amor");
  t("quem exige amor tira de quem tem amor", doAmor.every((x) => x.quem === "Marta"));
  const doRompido = sementes.filter((x) => x.a.exigeRompido);
  t("e quem exige rompimento tira dos rompidos", doRompido.every((x) => x.quem === "Lucan"));

  /* SEM ELENCO NENHUM: os que pedem pessoa não abrem, e os outros seguem */
  let c2 = garantirCompasso(null);
  let houve = 0, comNome = 0;
  for (let i = 0; i < 400; i++) {
    const r = avancarCompasso(c2, sit, { sorte: () => (i * 0.0611 + i * i * 0.0017) % 1, elenco: { aqui: [], lacos: {} } });
    c2 = r.compasso;
    if (r.virou && r.movimento.id === "semente" && r.assunto) { houve++; if (r.quem) comNome++; }
  }
  t(`sem elenco, a onda continua germinando (${houve})`, houve >= 8);
  t("mas ninguém é nomeado", comNome === 0);
}

sec("5. O NOME SOBE AO ENVELOPE");
{
  const a = assuntoPorId("romance");
  const env = envelopeDoCompasso({ virou: true, movimento: { id: "semente", fala: true }, assunto: a, quem: "Marta" });
  t("o envelope traz a instrução", env.includes(a.preparo));
  t("e o nome, em destaque", /E É COM MARTA/.test(env));
  /* a âncora existe para impedir a IA de resolver "alguém" inventando */
  t("proibindo trocar de pessoa", /NÃO troque por outra e NÃO invente ninguém/.test(env));
  const sem = envelopeDoCompasso({ virou: true, movimento: { id: "semente", fala: true }, assunto: a, quem: "" });
  t("sem nome, o envelope não fala de ninguém", !/E É COM/.test(sem) && sem.includes(a.preparo));
}

sec("6. O CÍRCULO FECHA NO APP");
{
  const app = fs.readFileSync("../src/App.jsx", "utf8");
  t("há um elenco da onda", /const elencoDaOnda = \(\) => \{/.test(app));
  t("com quem está na cena", /aqui: \(el\.aqui \|\| \[\]\)\.map\(\(x\) => x\.nome\)/.test(app));
  t("e os laços por tipo", /for \(const t of TIPOS_DE_LACO\) lacos\[t\.id\] = comLaco/.test(app));
  t("a onda recebe o elenco", /elenco: elencoDaOnda\(\)/.test(app));

  const g = app.split("const registrarLacoDaOnda")[1].split("\n  };")[0];
  /* SÓ NO CLÍMAX: nem a semente nem a véspera mexem no registro, porque
     até o clímax nada aconteceu de fato */
  t("o registro só acontece no clímax", /r\.movimento\.id !== "climax"/.test(g));
  t("firma o que o assunto declarou", /if \(a\.firma\) novo = firmarLaco/.test(g));
  t("reata o que já havia", /else if \(a\.reata\)/.test(g));
  t("e rompe o que o fim rompe", /else if \(a\.rompe\) novo = romperLaco/.test(g));
  t("protegido por try", /try \{/.test(g) && /catch \{/.test(g));
  /* e o registro é do SISTEMA: a IA narra o beijo, o sistema anota que há
     um amor */
  t("nada disto passa pela IA", !/resp\.|mudancas/.test(g));
}


sec("7. O MUNDO SEM MIM NO MEIO");
{
  /* "O laco e sempre com o heroi. Nao ha laco entre dois NPCs, e e o que
     faria o mundo ter vida propria." Numa campanha so com `laco`, todo
     mundo existe em relacao ao heroi e mais ninguem tem historia — e e a
     razao pela qual mundos de RPG parecem um teatro que so se monta
     quando o protagonista entra. */
  let reg = { Marta: criarNPC("Marta"), Ubba: criarNPC("Ubba"), Lucan: criarNPC("Lucan") };
  t("gente nasce sem laco entre si", Object.keys(reg.Marta.entre).length === 0);
  reg = firmarEntre(reg, "Ubba", "Lucan", "rivalidade", 10);
  /* AS DUAS PONTAS: guardar so de um lado e ter meia relacao, e a metade
     que falta e a que ninguem lembra de olhar */
  t("firmar grava nos dois", reg.Ubba.entre.Lucan === "rivalidade" && reg.Lucan.entre.Ubba === "rivalidade");
  t("e o par aparece uma vez so", paresEntre(reg).length === 1);
  t("com os dois nomes", paresEntre(reg)[0].a && paresEntre(reg)[0].b);
  t("filtra por tipo", paresEntre(reg, "rivalidade").length === 1 && paresEntre(reg, "amor").length === 0);
  t("consigo mesmo nao vale", firmarEntre(reg, "Ubba", "Ubba", "amizade") === reg);
  t("com quem nao existe, nao vale", firmarEntre(reg, "Ubba", "Ninguem", "amizade") === reg);
  t("tipo invalido nao vale", firmarEntre(reg, "Ubba", "Marta", "inventado") === reg);
  /* e o morto sai do par: uma rivalidade com quem morreu nao e rivalidade */
  const comMorto = { ...reg, Lucan: { ...reg.Lucan, status: "morto" } };
  t("morto sai dos pares", paresEntre(comMorto).length === 0);

  /* OS ASSUNTOS DE PAR: pedem duas pessoas e gravam entre elas */
  const deDuas = ASSUNTOS.filter((a) => a.pede === "duas");
  t(`ha assuntos de par (${deDuas.length})`, deDuas.length >= 3);
  t("todos firmam entre dois", deDuas.every((a) => !!a.firmaEntre));
  t("e todos pedem duas pessoas na cena", deDuas.every((a) => /gentePorPerto >= 2/.test(String(a.quando))));
  const usam = ASSUNTOS.filter((a) => a.exigeEntre);
  t(`e ha quem exija um par pronto (${usam.length})`, usam.length >= 1);
  /* garantia de leitor, de novo: todo par exigido tem de ter quem o crie */
  const criados = new Set(deDuas.map((a) => a.firmaEntre));
  const pedidos = new Set(usam.map((a) => a.exigeEntre));
  t("todo par exigido tem quem o crie", [...pedidos].every((x) => criados.has(x)));

  /* A ONDA CARREGA OS DOIS */
  const elenco2 = { aqui: ["Marta", "Ubba", "Lucan"], lacos: {}, entre: [{ a: "Ubba", b: "Lucan", tipo: "rivalidade" }] };
  const sit2 = garantirSituacao({ emCidade: true, pessoaNaCena: true, momento: 0.6, porte: "cidade",
    bioma: "colina", temGenteConhecida: true, temPassado: true, gentePorPerto: 3, genteLonge: 1,
    diasAteVizinha: 2, nivel: 8, fama: 40, temLugarVisitado: true, temFalaAnterior: true });
  let c3 = garantirCompasso(null);
  const pares = [];
  for (let i = 0; i < 400; i++) {
    const r = avancarCompasso(c3, sit2, { sorte: () => (i * 0.0431 + i * i * 0.0013) % 1, elenco: elenco2 });
    c3 = r.compasso;
    if (r.virou && r.movimento.id === "semente" && r.assunto && (r.assunto.pede === "duas" || r.assunto.exigeEntre)) {
      pares.push({ id: r.assunto.id, a: r.quem, b: r.quem2 });
    }
  }
  t(`a onda escolheu pares (${pares.length})`, pares.length >= 2);
  t("os dois nomes vem preenchidos", pares.every((p) => p.a && p.b));
  /* ninguem se odeia sozinho */
  t("e nunca sao a mesma pessoa", pares.every((p) => p.a !== p.b));
  /* quem exige um par PRONTO tira do registro, nao sorteia dois */
  const doPar = pares.filter((p) => assuntoPorId(p.id).exigeEntre);
  t("quem exige par pronto tira do registro", doPar.every((p) => (p.a === "Ubba" && p.b === "Lucan") || (p.a === "Lucan" && p.b === "Ubba")));

  /* SEM DUAS PESSOAS NA CENA nenhum assunto de par abre */
  let c4 = garantirCompasso(null), houve = 0;
  for (let i = 0; i < 300; i++) {
    const r = avancarCompasso(c4, garantirSituacao({ ...sit2, gentePorPerto: 1 }), { sorte: () => (i * 0.0431) % 1, elenco: { aqui: ["Marta"], lacos: {}, entre: [] } });
    c4 = r.compasso;
    if (r.virou && r.movimento.id === "semente" && r.assunto && r.assunto.pede === "duas") houve++;
  }
  t("com uma pessoa so, nenhum par germina", houve === 0);

  /* O ENVELOPE NOMEIA OS DOIS, e diz que eu nao sou a causa */
  const a2 = ASSUNTOS.find((x) => x.pede === "duas");
  const env2 = envelopeDoCompasso({ virou: true, movimento: { id: "semente", fala: true }, assunto: a2, quem: "Ubba", quem2: "Lucan" });
  t("o envelope nomeia os dois", /E É ENTRE UBBA E LUCAN/.test(env2));
  t("e diz que estou por perto, nao no meio", /eu estou por perto, não no meio/.test(env2));
  t("proibindo me pôr como causa", /NÃO me ponha como causa/.test(env2));
}

sec("8. O LAÇO SOBE AO PROMPT");
{
  /* O Mestre sabia que Marta era um amor rompido e a IA nao — ela so
     recebia o nome dentro do envelope da onda, e so no turno em que a onda
     falava. Fora dali, para a narracao, Marta era uma ferreira qualquer. */
  let reg = { Marta: criarNPC("Marta", { papel: "ferreira" }), Ubba: criarNPC("Ubba", { papel: "batedor" }), Lucan: criarNPC("Lucan") };
  reg.Marta = romperLaco(firmarLaco(reg.Marta, "amor", 10), 40);
  reg.Ubba = firmarLaco(firmarLaco(firmarLaco(reg.Ubba, "amizade", 5), "amizade", 9), "amizade", 12);
  reg = firmarEntre(reg, "Ubba", "Lucan", "rivalidade", 20);
  const txt = resumoNPCsParaPrompt(reg);
  t("o rompimento aparece", txt.includes("Marta") && txt.includes("ROMPEU comigo (era amor, no dia 40)"));
  t("o laço de pé aparece", /amizade comigo/.test(txt));
  t("a força profunda aparece", /e é profunda/.test(txt));
  t("e o laço entre dois também", /rivalidade com Lucan/.test(txt) && /rivalidade com Ubba/.test(txt));
  /* quem nao tem nada continua sem nada: o resumo nao inventa relacao */
  /* a linha que COMEÇA com ele: procurar por "Lucan" em qualquer posição
     achava a linha do Ubba, que o menciona ("rivalidade com Lucan") e que
     tem "comigo" por outro motivo. Mais um caso de casar um pedaço em vez
     de casar a coisa. */
  const linhaLucan = txt.split("\n").find((l) => l.startsWith("• Lucan")) || "";
  t("quem não tem laço não ganha um", !linhaLucan.includes("comigo"));
}

console.log(`\nlaço v9.97: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
