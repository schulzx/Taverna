/* teste-mm8d-figurante.mjs (Fase MM · MM8d) — o figurante é de passagem

   Sem investimento, fora do elenco e fora da cena, uma pessoa sai das
   PESSOAS CONHECIDAS e do LONGE do rodapé — mesmo com lugar vazio. NADA se
   apaga do registo: o Códex conta-a, e ela volta no dia em que a cena a
   trouxer. E o cânone deixa de repetir a pessoa que a linha das PESSOAS
   CONHECIDAS já disse por inteiro. */
import {
  FIGURANTE, investimentoDe, ehDePassagem, resumoNPCsParaPrompt, criarNPC, firmarLaco, registrarConsulta,
  TETO_DAS_PESSOAS,
} from "../src/npcs.js";
import { resumoCenaPrompt } from "../src/cena.js";
import { formatarCanone, linhasJaDitas, montarSystemPrompt, TETO_DO_CANONE } from "../src/prompt.js";
import { registoSimulado, CENARIOS } from "./registo-simulado.mjs";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const pessoa = (nome, ultimaVez, extra = {}) => ({ ...criarNPC(nome, { papel: "morador", ...extra }), ultimaVez });

/* ============================================================ */
sec("1. a tabela e o critério");
{
  t("a janela da cena é curta (o figurante de agora, não o de ontem)", FIGURANTE.janela >= 1 && FIGURANTE.janela <= 5);
  t("neutro e desconhecido não são investimento", ["neutro", "desconhecido", ""].every((r) => FIGURANTE.relacoesSemPeso.includes(r)));
  t("sem nada, nenhum investimento", investimentoDe(pessoa("Zé", 1)).length === 0);
  const casos = [
    ["laço", firmarLaco(pessoa("A", 1), "amizade", 1)],
    ["laço", { ...pessoa("B", 1), laco: { tipo: "amor", forca: 1, rompido: true, rompidoEm: 2 } }],
    ["consultas", registrarConsulta({ C: pessoa("C", 1) }, "C").C],
    ["relação", pessoa("D", 1, { relacao: "rival" })],
    ["segredo", pessoa("E", 1, { segredo: "vende a guarda" })],
  ];
  for (const [motivo, n] of casos) t(`${motivo} é investimento (${n.nome})`, investimentoDe(n).includes(motivo));
  t("grupo, missão e elenco vêm do contexto", investimentoDe(pessoa("F", 1), { grupo: [{ nome: "f" }], missao: ["F"], elenco: ["F"] }).join() === "grupo,missão,elenco");
  t("lixo não tem investimento nem é de passagem", [null, 3, "x"].every((x) => investimentoDe(x).length === 0 && ehDePassagem(x) === false));
}

/* ============================================================ */
sec("2. quem sai e quem fica");
{
  const reg = {
    Ontem: pessoa("Ontem", 5),
    Agora: pessoa("Agora", 100),
    NaCena: pessoa("NaCena", 6),
    ComLaco: firmarLaco(pessoa("ComLaco", 4), "divida", 1),
    Rival: pessoa("Rival", 2, { relacao: "rival" }),
  };
  const txt = resumoNPCsParaPrompt(reg, undefined, { emCena: ["NaCena"] });
  t("o figurante de ontem, que não se viu mais, sai", !txt.includes("• Ontem"));
  t("o figurante que o Mestre anotou agora fica (está na cena)", txt.includes("• Agora"));
  t("o figurante que a cena cita fica", txt.includes("• NaCena"));
  t("quem tem laço fica", txt.includes("• ComLaco"));
  t("quem tem relação fica", txt.includes("• Rival"));
  t("e sai mesmo havendo lugar vazio", txt.split("\n").length === 4 && txt.split("\n").length < TETO_DAS_PESSOAS.pessoas);
  t("o relógio antigo (Date.now) não faz ninguém sair por engano", resumoNPCsParaPrompt({ V: pessoa("V", 1759100000000), X: pessoa("X", 10) }).includes("• V"));
  /* o LONGE do rodapé */
  const mapa = { cidades: [{ nome: "Aqui", x: 0, y: 0 }, { nome: "Longe", x: 60, y: 0 }] };
  const longe = { Figurante: pessoa("Figurante", 1, { local: "Longe" }), Amiga: pessoa("Amiga", 1, { local: "Longe", relacao: "amigo" }), Hoje: pessoa("Hoje", 50, { local: "Aqui" }) };
  const r = resumoCenaPrompt(longe, "Aqui", mapa);
  t("no LONGE, o figurante distante sai e a amiga fica", /LONGE .*Amiga está em Longe/.test(r) && !/Figurante/.test(r));
  t("e não conta no +N", !/\+\d/.test(r));
  t("o figurante do elenco ou da missão fica no LONGE", /Figurante está em Longe/.test(resumoCenaPrompt(longe, "Aqui", mapa, { elenco: ["Figurante"] })) && /Figurante está em Longe/.test(resumoCenaPrompt(longe, "Aqui", mapa, { missao: ["Figurante"] })));
  t("os PRESENTES não mudam (quem vive aqui continua)", /PRESENTES em Aqui: Hoje/.test(r));
}

/* ============================================================ */
sec("3. nada se apaga — o registo e o Códex");
{
  for (const c of CENARIOS) {
    const r = registoSimulado(c);
    const antes = JSON.stringify(r.npcs);
    const n = Object.keys(r.npcs).length;
    resumoNPCsParaPrompt(r.npcs);
    resumoCenaPrompt(r.npcs, r.cidade.nome, r.mapa);
    formatarCanone(r.canone, { teto: TETO_DO_CANONE, npcs: r.npcs, jaDitos: linhasJaDitas(resumoNPCsParaPrompt(r.npcs)) });
    t(`${c.id}: o registo fica byte a byte igual, e o Códex conta o mesmo (${n})`, JSON.stringify(r.npcs) === antes && Object.keys(r.npcs).length === n);
  }
}

/* ============================================================ */
sec("4. o ganho em três campanhas de 200 turnos");
{
  for (const c of CENARIOS) {
    const r = registoSimulado(c);
    const todos = Object.keys(r.npcs);
    /* o antes: a mesma ordem da MM8c-2, sem o corte (toda a gente "na cena") */
    const antes = resumoNPCsParaPrompt(r.npcs, undefined, { emCena: todos });
    const depois = resumoNPCsParaPrompt(r.npcs);
    const la = resumoCenaPrompt(r.npcs, r.cidade.nome, r.mapa, { emCena: todos }).split("\n").find((l) => /LONGE/.test(l)) || "";
    const ld = resumoCenaPrompt(r.npcs, r.cidade.nome, r.mapa).split("\n").find((l) => /LONGE/.test(l)) || "";
    const fica = depois.split("\n").filter(Boolean).map((l) => l.slice(2).split(" (")[0]);
    console.log(`      ${c.id}: ${todos.length} no registo · PESSOAS CONHECIDAS ${antes.split("\n").length} → ${fica.length} pessoas, ${antes.length} → ${depois.length} caracteres · LONGE ${la.length} → ${ld.length}`);
    console.log(`         ficam: ${fica.join(", ")}`);
    t(`${c.id}: o vilão e a amiga ficam (relação)`, fica.includes("Morvath, o Sem-Rosto") && fica.includes("Ilsa Marés"));
    t(`${c.id}: nunca mais caracteres do que antes`, depois.length <= antes.length && ld.length <= la.length);
  }
}

/* ============================================================ */
sec("5. o cânone não repete quem já foi dito");
{
  const npcs = { Cael: pessoa("Cael", 9, { papel: "mago viajante", genero: "homem", local: "Dwen", notas: "usou o nome Falkion" }) };
  const ditos = linhasJaDitas(resumoNPCsParaPrompt(npcs, undefined, { emCena: ["Cael"] }));
  const igual = { Cael: { tipo: "pessoa", papel: "mago viajante", genero: "homem", local: "Dwen", status: "vivo", notas: "usou o nome Falkion" } };
  t("a pessoa que as PESSOAS CONHECIDAS já disseram por inteiro sai do cânone", formatarCanone(igual, { teto: TETO_DO_CANONE, npcs, jaDitos: ditos }) === "");
  const aMais = { Cael: { ...igual.Cael, notas: "usou o nome Falkion; é filho do rei" } };
  t("se o cânone sabe uma palavra a mais, a linha dele fica", formatarCanone(aMais, { teto: TETO_DO_CANONE, npcs, jaDitos: ditos }).includes("filho do rei"));
  t("quem não está nas PESSOAS CONHECIDAS deste turno fica no cânone", formatarCanone({ Outra: { tipo: "pessoa", papel: "x" } }, { teto: TETO_DO_CANONE, npcs, jaDitos: ditos }).includes("Outra"));
  t("lugares e artefatos nunca saem por isto", formatarCanone({ Cael: { tipo: "artefato", notas: "usou o nome Falkion" } }, { jaDitos: ditos }).includes("Cael"));
  t("sem jaDitos, o cânone é o de sempre", formatarCanone(igual).includes("• Cael"));
  /* no prompt inteiro: montarSystemPrompt tira os ditos das próprias PESSOAS CONHECIDAS */
  const pers = { nome: "X", atributos: { forca: 1, destreza: 1, vigor: 1, intelecto: 1, presenca: 1, percepcao: 1 }, vidaMax: 10, manaMax: 8, nivel: 1 };
  const P = montarSystemPrompt("T", { genero: "Fantasia medieval" }, pers, igual, {}, "", "", "", resumoNPCsParaPrompt(npcs, undefined, { emCena: ["Cael"] }), "", "", "", { emCidade: true }, { npcs });
  t("o prompt diz o Cael uma vez só", (P.match(/• Cael/g) || []).length === 1);

  /* O GANHO. Na simulação, as notas do cânone e as do registo são frases
     diferentes (o Narrador escreve as duas), e nada se repete por inteiro:
     o ganho é zero, e isto é dito. No caminho em que o App COPIA a pessoa
     do cânone para o registo (App ~9753, "blindagem de memória"), os
     campos são os mesmos — é aí que a repetição mora. */
  for (const c of CENARIOS) {
    const r = registoSimulado(c);
    const pes = resumoNPCsParaPrompt(r.npcs);
    const sem = formatarCanone(r.canone, { teto: TETO_DO_CANONE, npcs: r.npcs }).length;
    const com = formatarCanone(r.canone, { teto: TETO_DO_CANONE, npcs: r.npcs, jaDitos: linhasJaDitas(pes) }).length;
    /* a cópia do App: o registo das pessoas do cânone feito dos mesmos campos */
    const copia = { ...r.npcs };
    for (const [nome, f] of Object.entries(r.canone)) copia[nome] = { ...criarNPC(nome, { papel: f.papel, genero: f.genero, local: f.local, status: f.status, notas: f.notas, relacao: "amigo" }), ultimaVez: (r.npcs[nome] || {}).ultimaVez || 1 };
    const pesC = resumoNPCsParaPrompt(copia);
    const semC = formatarCanone(r.canone, { teto: TETO_DO_CANONE, npcs: copia }).length;
    const comC = formatarCanone(r.canone, { teto: TETO_DO_CANONE, npcs: copia, jaDitos: linhasJaDitas(pesC) }).length;
    console.log(`      ${c.id}: cânone de pessoas ${sem} → ${com} (simulação) · com a cópia do App ${semC} → ${comC}`);
    t(`${c.id}: o corte nunca aumenta o cânone`, com <= sem && comC <= semC);
  }
}

/* ============================================================ */
sec("6. lixo");
{
  let erro = "";
  for (const x of [null, undefined, {}, "x", 7, { a: null }, { a: { nome: "Z", ultimaVez: "q", laco: 5, consultas: "x" } }]) {
    try {
      resumoNPCsParaPrompt(x, undefined, { emCena: "x", grupo: 3, missao: {}, elenco: null });
      resumoCenaPrompt(x, "Aqui", null, { missao: "x" });
      linhasJaDitas(x); formatarCanone(x, { jaDitos: "x" }); formatarCanone({ A: { tipo: "pessoa" } }, { jaDitos: linhasJaDitas(null) });
    } catch (e) { erro = `${JSON.stringify(x)}: ${e.message}`; }
  }
  t("nenhum lixo derruba o corte", !erro, erro);
  t("linhasJaDitas lê o nome de cada linha", [...linhasJaDitas("• Ana (ferreira)\n• Bram — amizade comigo\nlixo").keys()].join() === "ana,bram");
}

/* A FIAÇÃO — sem ela, quem a missão ativa procura (o alvo da pista da
   MM13, o dador) sairia das pessoas conhecidas por não ter laço. O App
   passa a cena e a missão às duas listas. Por texto, fim de linha
   normalizado. */
{
  const { readFileSync } = await import("node:fs");
  const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");
  const i = app.indexOf("resumoNPCsParaPrompt(npcsRef.current, undefined, {");
  const pessoas = i >= 0 ? app.slice(i, app.indexOf("\n", i)) : "";
  t("as pessoas conhecidas recebem quem a cena cita", pessoas.includes("emCena:"));
  t("as pessoas conhecidas recebem quem a missão ativa procura", pessoas.includes("missao:") && pessoas.includes("m.status === \"ativa\""));
  /* MOVIDA NA MM14 · 9a (30/09), com o motivo: a masmorra aberta entrou
     entre `emCena` e `elenco` nesta mesma chamada (resumoCenaPrompt). A
     âncora segue por `emCena: emCenaAgora,` sozinho — é o pedaço que esta
     asserção sempre quis achar, e o que vem depois dele pode crescer de novo. */
  const j = app.indexOf("emCena: emCenaAgora,");
  const rodape = j >= 0 ? app.slice(j, app.indexOf("\n", j)) : "";
  t("o rodapé recebe a missão ativa", rodape.includes("missao:"));
}

console.log(`\nMM8d · o figurante é de passagem: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
