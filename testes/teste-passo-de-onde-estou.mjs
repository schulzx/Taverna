/* O PASSO SAI DE ONDE O HERÓI ESTÁ (Fase MM, o laço da história, 11/10) — a 5.ª sessão

   Na 5.ª sessão de prova a ponte do rumo (O RUMO, a linha da escuta) disse
   "Procurar Osric Pé-Leve na Candeia Faiscante" em 42 pautas — 22 delas com
   o herói EM PONTE LENTA, 12 km a norte, à espera do Edric que a missão
   procurava; e 3 com ele dentro da própria Candeia (mente/mm11-sessao-5.md,
   defeito 3, "o passo a apontar para a taverna que o herói já deixou"). O
   passo era calculado da missão, sem saber onde o herói estava.

   O que esta suíte prova (abertura.js#proximoPasso, escuta.js#linhaDoRumo):
     1. a sessão reconstruída sobre o registo das pautas
        (`registo-s5-pauta.json`): em cada pauta que levou o rumo, o passo
        recalculado de onde o herói estava — na Ponte Lenta aponta para o
        Edric que está ali (22 → 0 a apontar para a Candeia), dentro da
        Candeia para o Osric pelo nome (3 → 0 a "procurar");
     2. a régua: a etapa adiante só conta se se chega a ela por cima de
        caminho (a mesma de `conferir`); uma etapa de derrotar no meio
        segura o passo; o sítio é o nome inteiro, sem artigo e sem a cidade;
     3. o fecho: missão fechada não tem passo, e o rumo não inventa um;
     4. lixo, determinismo.

   FALHA em HEAD (v9.397): `proximoPasso` não lê `aqui`, e as 22 pautas da
   Ponte Lenta continuam a apontar para a Candeia. */

import fs from "node:fs";
const M = await import("../src/missoes.js");
const A = await import("../src/abertura.js");
const E = await import("../src/escuta.js");

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const tenta = (f, d) => { try { return f(); } catch { return d; } };
const J = (v) => JSON.stringify(v);
const REG = JSON.parse(fs.readFileSync(new URL("./registo-s5-pauta.json", import.meta.url), "utf8"));

const ABERTURA = A.garantirAbertura({ principalId: "mis_principal", cidade: "Casa da Fonte", titulo: "O rasto de Edric",
  pista: { nome: "Osric Pé-Leve", papel: "taverneiro", local: "A Candeia Faiscante" },
  alvo: { feitio: "procurar", quem: "Edric", onde: "A Ponte Lenta", alvo: "", objeto: "Edric" } });
const PRINCIPAL = M.criarMissao({ id: "mis_principal", titulo: "O rasto de Edric", tipo: "principal", status: "ativa", dia: 1, etapas: [
  { tipo: "falar_com", alvo: "Osric Pé-Leve", onde: "A Candeia Faiscante" },
  { tipo: "falar_com", alvo: "Edric", onde: "A Ponte Lenta, em Rio Profundo" },
] });
const passo = (aqui, missoes = [PRINCIPAL]) => A.proximoPasso({ abertura: ABERTURA, missoes, aqui });

sec("1. a sessão reconstruída: o passo de cada pauta, de onde o herói estava");
{
  const L = REG.linhas;
  let comRumo = 0, ponteAntes = 0, ponteDepois = 0, candeiaAntes = 0, candeiaDepois = 0, edric = 0, osricPeloNome = 0;
  for (const tr of REG.turnos) {
    const rumo = (tr.secoes.rumo || []).map((i) => L[i]).join(" ");
    if (!rumo) continue;
    comRumo++;
    const onde = L[(tr.secoes.onde || [])[0]] || "";
    const antes = /Procurar Osric Pé-Leve na Candeia Faiscante/.test(rumo);
    const agora = passo(onde);
    if (/Ponte Lenta/.test(onde)) {
      if (antes) ponteAntes++;
      if (/Candeia/.test(agora)) ponteDepois++;
      if (/Edric, que está aqui/.test(agora)) edric++;
    }
    if (/Candeia Faiscante/.test(onde)) {
      if (antes) candeiaAntes++;
      if (/^Procurar/.test(agora)) candeiaDepois++;
      if (/Osric Pé-Leve, taverneiro daqui/.test(agora)) osricPeloNome++;
    }
  }
  console.log(`      pautas com rumo: ${comRumo} · na Ponte Lenta a apontar para a Candeia: ${ponteAntes} → ${ponteDepois} · dentro da Candeia a "procurar": ${candeiaAntes} → ${candeiaDepois}`);
  t("o registo tem as 22 pautas da Ponte Lenta a apontar para a Candeia (o defeito, medido)", ponteAntes === 22, `${ponteAntes}`);
  t("recalculadas de onde o herói estava: 0 apontam para a Candeia", ponteDepois === 0);
  t("as 22 apontam para o Edric, que está ali", edric === 22, `${edric}`);
  t("dentro da Candeia, 3 pautas mandavam \"procurar\" quem estava à frente: agora 0", candeiaAntes === 3 && candeiaDepois === 0);
  t("e as 3 mandam falar com o Osric pelo nome e ofício", osricPeloNome === 3);
  /* a linha inteira, como a escuta a escreve com o mundo na mão */
  const linha = E.linhaDoRumo({ pedido: E.lerOPedido("Sento-me na ponte e espero."), degrau: E.degrauDaEscuta(0),
    passo: A.proximoPasso({ abertura: ABERTURA, missoes: [PRINCIPAL] }), semente: 3,
    mundo: { aqui: "em Ponte Lenta", abertura: ABERTURA, missoes: [PRINCIPAL] } });
  t("O RUMO na ponte: \"…aponta para: falar com Edric, que está aqui\"", /aponta para: falar com Edric, que está aqui/.test(linha), linha);
  t("o passo sai da tabela PASSO_AQUI", A.PASSO_AQUI.pessoa === "falar com {nome}, que está aqui");
}

sec("2. a régua do salto e do sítio");
{
  t("fora de qualquer sítio da missão, o passo de sempre (a estrada)", passo("em estrada do norte") === "Procurar Osric Pé-Leve na Candeia Faiscante");
  t("\"em Ponte Lenta\" (o ONDE da sessão) é \"A Ponte Lenta, em Rio Profundo\" da etapa: sem artigo, sem cidade", /Edric/.test(passo("em Ponte Lenta")));
  t("a caminho de outro sítio não é estar na ponte", passo("a caminho de A Boca de Pedra Torta · ensolarado") === "Procurar Osric Pé-Leve na Candeia Faiscante");
  t("o nome inteiro: \"Ponte\" sozinho não é a Ponte Lenta", passo("na Ponte Velha") === "Procurar Osric Pé-Leve na Candeia Faiscante");
  const dura = M.criarMissao({ id: "mis_principal", titulo: "x", tipo: "principal", status: "ativa", etapas: [
    { tipo: "derrotar", alvo: "Lobo Cinzento" },
    { tipo: "falar_com", alvo: "Edric", onde: "A Ponte Lenta" },
  ] });
  t("uma etapa de derrotar à frente segura o passo (não se salta a luta)", /Lobo Cinzento/.test(passo("em Ponte Lenta", [dura])));
  const atual = M.criarMissao({ ...PRINCIPAL, etapas: [{ ...PRINCIPAL.etapas[0], feito: true }, PRINCIPAL.etapas[1]] });
  t("com a pista feita, na ponte: falar com o Edric, que está aqui", passo("em Ponte Lenta", [atual]) === "falar com Edric, que está aqui");
  t("com a pista feita, longe: procurar o Edric na Ponte Lenta (a voz de missoes.js)", /^Procurar Edric/.test(passo("no Mercado do Ogro, dentro de Casa da Fonte", [atual])));
  const lugar = M.criarMissao({ id: "mis_principal", titulo: "x", tipo: "principal", status: "ativa", etapas: [
    { tipo: "falar_com", alvo: "Osric Pé-Leve", onde: "A Candeia Faiscante" },
    { tipo: "revelar", alvo: "A Biblioteca do Peregrino", onde: "A Biblioteca do Peregrino" },
  ] });
  t("um sítio a descobrir adiante, com o herói lá: o passo é o dele", /Biblioteca do Peregrino/.test(passo("na Biblioteca do Peregrino, dentro de Casa da Fonte", [lugar])));
}

sec("3. o fecho");
{
  const fim = M.criarMissao({ ...PRINCIPAL, etapas: PRINCIPAL.etapas.map((e) => ({ ...e, feito: true })) });
  const fechada = { ...fim, status: "concluida" };
  t("missão fechada não tem passo", passo("em Ponte Lenta", [fechada]) === "");
  const linha = E.linhaDoRumo({ pedido: E.lerOPedido("Espero."), degrau: E.degrauDaEscuta(0), passo: "", semente: 1,
    mundo: { aqui: "em Ponte Lenta", abertura: ABERTURA, missoes: [fechada] } });
  t("e o rumo não inventa destino (só o primeiro tempo)", !/aponta para/.test(linha), linha);
}

sec("4. lixo, determinismo");
{
  t("o mesmo lugar dá o mesmo passo", passo("em Ponte Lenta") === passo("em Ponte Lenta"));
  for (const lixo of [null, undefined, 7, {}, [], ""]) t(`aqui lixo (${J(lixo)}) dá o passo de sempre`, tenta(() => passo(lixo), "x") === "Procurar Osric Pé-Leve na Candeia Faiscante");
  t("estado lixo devolve vazio", tenta(() => A.proximoPasso(null), "x") === "" && tenta(() => A.proximoPasso({ aqui: "em Ponte Lenta" }), "x") === "");
  const c = J(PRINCIPAL); passo("em Ponte Lenta");
  t("a missão não é mutada", J(PRINCIPAL) === c);
}

sec("5. o encontro que o registo já viu (a 13.ª sessão, 29/10)");
{
  /* O Corrado apresentou-se quatro vezes: a heroína achou-o no Largo da Liça
     no T2, o passo «falar com Corrado» ficou `feito: false` até ao fim, e a
     pauta pediu-lhe o nome em cada turno lá (PASSO_AQUI.pista). O registo
     sabia — `registro[t]` com o sítio e quem estava. FALHA antes deste
     commit: `proximoPasso` não lia o registo. */
  const F = JSON.parse(fs.readFileSync(new URL("./sessao-s13-fenda.json", import.meta.url), "utf8"));
  const NO_LARGO = "no Largo da Liça, em Porto das Pedras";
  const p13 = (t, aqui = NO_LARGO) => A.proximoPasso({ abertura: F.abertura, missoes: F.missoes, aqui, registro: F.registro.filter((r) => r.t < t) });
  const seApresenta = [2, 3, 4, 5].filter((t) => /o próprio nome/.test(p13(t)));
  t(`no Largo, do T2 ao T5, o Corrado diz o nome uma vez só (${seApresenta.length}; o jogo deu 4)`, seApresenta.length === 1 && seApresenta[0] === 2, seApresenta.join());
  t("no T2 (a chegada: o registo só o tem nomeado no Porto) ainda é a pista que se apresenta", p13(2) === A.PASSO_AQUI.pista.replace("{nome}", "Corrado").replace("{papel}", F.abertura.pista.papel));
  t("do T3 em diante, quem já se apresentou está aqui (PASSO_AQUI.pessoa)", [3, 4, 5].every((t) => p13(t) === A.PASSO_AQUI.pessoa.replace("{nome}", "Corrado")), p13(3));
  const rumo = E.linhaDoRumo({ pedido: E.lerOPedido("\"É com quem, Corrado?\""), degrau: E.degrauDaEscuta(0), passo: "", semente: 1,
    mundo: { aqui: NO_LARGO, abertura: F.abertura, missoes: F.missoes, registro: F.registro.filter((r) => r.t < 4) } });
  t("e o rumo da escuta lê o registo do mundo (o T4: «É com quem, Corrado?»)", /que está aqui/.test(rumo) && !/o próprio nome/.test(rumo), rumo);
  t("dentro da Fenda (T18), o passo é o de sempre — o registo não o inventa", p13(18, "dentro de Fenda de Silêncio, à entrada") === A.proximoPasso({ abertura: F.abertura, missoes: F.missoes, aqui: "dentro de Fenda de Silêncio, à entrada" }));
  /* a régua, no mundo montado desta suíte (o Osric na Candeia, depois o Edric na Ponte) */
  const comReg = (registro, aqui) => A.proximoPasso({ abertura: ABERTURA, missoes: [PRINCIPAL], aqui, registro });
  const viuOsric = [{ t: 3, onde: "A Candeia Faiscante", quem: ["Osric Pé-Leve"] }];
  t("o Osric encontrado na Candeia: o passo dá a vez ao Edric, mesmo longe dos dois", comReg(viuOsric, "em Vau Seco") === "Procurar Edric na Ponte Lenta, em Rio Profundo", comReg(viuOsric, "em Vau Seco"));
  t("e sem `aqui` também (o passo da pauta)", comReg(viuOsric) === comReg(viuOsric, "em Vau Seco"));
  t("o nome dito noutro sítio não é encontro (menção não é presença)", comReg([{ t: 1, onde: "Casa da Fonte", quem: ["Osric Pé-Leve"] }]) === "Procurar Osric Pé-Leve na Candeia Faiscante");
  t("a Candeia sem o Osric também não", comReg([{ t: 2, onde: "A Candeia Faiscante", quem: ["Brom"] }]) === "Procurar Osric Pé-Leve na Candeia Faiscante");
  for (const lixo of [null, 7, "x", {}, [null, 3, "x", { quem: "Osric Pé-Leve", onde: 5 }, { onde: "A Candeia Faiscante", quem: "Osric Pé-Leve" }]]) {
    t(`registo lixo (${J(lixo)}) dá o passo de sempre`, tenta(() => comReg(lixo), "x") === "Procurar Osric Pé-Leve na Candeia Faiscante");
  }
  const antes = J(F.registro) + J(F.missoes);
  p13(5);
  t("o registo e a missão não são mutados", J(F.registro) + J(F.missoes) === antes);
}

console.log(`\no passo de onde estou: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
