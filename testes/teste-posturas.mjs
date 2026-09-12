/* AS POSTURAS DO MUNDO (v9.206) — a mesma ação, outro resultado

   A gordura recalibrada: sub-estruturas que o sistema aciona lendo o
   momento, em vez de menu para o jogador. Esta suíte guarda as leis das
   posturas: derivada e determinística; nunca anunciada; tempera e não
   decide; histerese (o mundo não vira casaca a cada turno); e a ligação
   viva do G1 — o adversário lê o viés de moral. */

const RAIZ = "../src/";
const M = await import(RAIZ + "posturas.js");
const A = await import(RAIZ + "adversario.js");
const { readFileSync } = await import("node:fs");
const semComentarios = (s) => s.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
const APP = semComentarios(readFileSync("../src/App.jsx", "utf8"));

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

sec("1. as 12 posturas e os 8 botões");
{
  t("são 12 posturas", M.POSTURAS.length === 12, String(M.POSTURAS.length));
  t("ids únicos", new Set(M.POSTURAS.map((p) => p.id)).size === 12);
  t("oito botões", M.BOTOES.length === 8);
  t("toda postura preenche os 8 botões", M.POSTURAS.every((p) => M.BOTOES.every((b) => p.config[b] && p.config[b].length > 3)));
  t("toda postura tem quando(), dias e moral", M.POSTURAS.every((p) => typeof p.quando === "function" && p.dias >= 1 && Number.isInteger(p.moral)));
  t("o Anonimato é a padrão e sempre casa", M.POSTURAS[M.POSTURAS.length - 1].id === "anonimato" && M.posturaPorId("anonimato").quando({}));
  t("posturaPorId acha e erra", M.posturaPorId("apice") && !M.posturaPorId("nada"));
}

sec("2. a derivação lê o momento (precedência: a primeira que casa vence)");
{
  t("mundo vazio cai no Anonimato", M.posturaCrua({}).id === "anonimato");
  t("passeando + fama alta = Ápice", M.posturaCrua({ termometro: "passeando", famaAlta: true }).id === "apice");
  t("afogando = Crise", M.posturaCrua({ termometro: "afogando" }).id === "crise");
  t("luto recente vence tudo (mais grave, vem primeiro)", M.posturaCrua({ pesoRecente: "luto", termometro: "passeando", famaAlta: true }).id === "luto");
  t("relógio alto = Véspera", M.posturaCrua({ relogioAlto: true }).id === "vespera");
  t("vilão fundo sem rosto = Sombra", M.posturaCrua({ faseVilao: 3, rostoCaiu: false }).id === "sombra");
  t("inverno = Escassez", M.posturaCrua({ estacaoDura: true }).id === "escassez");
  t("passeando sem relógio = Bonança", M.posturaCrua({ termometro: "passeando", semRelogio: true }).id === "bonanca");
  /* a Caçada (herói alvo do vilão) vence a Crise */
  t("herói caçado vence a crise", M.posturaCrua({ heroiAlvoDoVilao: true, termometro: "afogando" }).id === "cacada");
}

sec("3. A HISTERESE: o mundo não vira casaca a cada turno");
{
  /* na Crise há 0 dias; uma leitura de bonança NÃO troca antes da permanência */
  let ativa = M.garantirPosturaAtiva({ postura: "crise", desde: 0 });
  const r1 = M.derivarPostura(ativa, { termometro: "passeando", semRelogio: true }, { dia: 1 });
  t("uma trégua isolada na Crise não vira Bonança antes da hora", r1.postura === "crise" && r1.mudou === false);
  /* cumprida a permanência (crise dura 2 dias), aí sim troca */
  const r2 = M.derivarPostura(ativa, { termometro: "passeando", semRelogio: true }, { dia: 5 });
  t("passada a permanência, a postura troca", r2.postura === "bonanca" && r2.mudou === true);
  /* mas uma postura MAIS GRAVE não espera permanência: o luto interrompe na hora */
  const r3 = M.derivarPostura(M.garantirPosturaAtiva({ postura: "bonanca", desde: 5 }), { pesoRecente: "luto" }, { dia: 5 });
  t("uma desgraça (mais grave) interrompe na hora, sem esperar", r3.postura === "luto" && r3.mudou === true);
  t("gravidadeDe ordena: luto é mais grave que bonança", M.gravidadeDe("luto") < M.gravidadeDe("bonanca"));
  t("mesma postura não conta como troca", M.derivarPostura(M.garantirPosturaAtiva({ postura: "apice", desde: 0 }), { termometro: "passeando", famaAlta: true }, { dia: 9 }).mudou === false);
}

sec("4. TEMPERA, NÃO DECIDE: o viés de moral do adversário");
{
  t("Ápice deixa os inimigos receosos (moral negativo)", M.moralDoInimigo("apice") <= -2);
  t("Crise deixa os inimigos aproveitadores (moral positivo)", M.moralDoInimigo("crise") >= 2);
  t("Anonimato: subestimam (moral positivo)", M.moralDoInimigo("anonimato") >= 2);
  t("Firme/neutra não mexe (moral 0)", M.moralDoInimigo("vespera") === 0 && M.moralDoInimigo("cacada") === 0);
  /* e o adversário REALMENTE lê isso: as duas intenções novas existem */
  const receoso = A.intencaoPorId("receoso"), aproveitador = A.intencaoPorId("aproveitador");
  t("o adversário ganhou as intenções receoso e aproveitador", !!receoso && !!aproveitador);
  t("elas são de peso baixo (temperam, não dominam a tática)", receoso.peso <= 6 && aproveitador.peso <= 6);
  /* a prova viva: a MESMA luta, moral diferente, intenção diferente */
  const lutaBase = { nome: "Bandido", pensa: true, minhaVida: 0.6, heroiVida: 0.9, quantos: 1, quantosDoOutroLado: 1, rodada: 2 };
  const noApice = A.intencaoDaVez({ ...lutaBase, posturaMoral: -3 });
  const naCrise = A.intencaoDaVez({ ...lutaBase, heroiVida: 0.4, posturaMoral: 3 });
  const neutra = A.intencaoDaVez({ ...lutaBase });
  t("no Ápice o bandido fica receoso", noApice && noApice.intencao.id === "receoso");
  t("na Crise, diante do ferido, ele se aproveita", naCrise && naCrise.intencao.id === "aproveitador");
  t("sem postura (moral 0) nenhum dos dois acende", neutra && neutra.intencao.id !== "receoso" && neutra.intencao.id !== "aproveitador");
  /* a lei: o viés perde para a tática específica — calar a magia ganha do receoso */
  const comConjurador = A.intencaoDaVez({ ...lutaBase, temConjurador: true, posturaMoral: -3 });
  t("a tática específica ainda vence o viés (calar a magia > receoso)", comConjurador && comConjurador.intencao.id === "calar_a_magia");
}

sec("5. a config e o console de autor");
{
  t("configDaPostura devolve os 8 botões", Object.keys(M.configDaPostura("crise")).length === 8);
  t("botaoDaPostura lê um botão", /aproveitam|feridos|recua/i.test(M.botaoDaPostura("crise", "inimigos")));
  t("resumoDaPostura é para o autor, com nome e viés", (() => { const r = M.resumoDaPostura({ postura: "apice", desde: 3 }); return r.nome === "O Ápice" && r.moral <= -2; })());
}

sec("6. ligado ao jogo — e nunca anunciada");
{
  t("o App importa as posturas", /import \{ garantirPosturaAtiva, derivarPostura, moralDoInimigo \}/.test(APP));
  t("há um ref e ele entra no save", /posturaRef/.test(APP) && /postura: posturaRef\.current/.test(APP));
  t("a postura é derivada por turno", /mexerNaPostura\(\)/.test(APP) && /derivarPostura\(posturaRef\.current/.test(APP));
  t("o adversário recebe o viés de moral", /posturaMoral: moralDoInimigo/.test(APP));
  /* QUINTA LEI: o sistema não fala de si mesmo. A postura NÃO vira linha de
     pauta nem mensagem ao jogador — só tempera tabelas. */
  t("a postura nunca é anunciada ao jogador (sem seção de pauta própria)", !/porNaPauta\([^)]*postura/.test(APP) && !/pushMsgs[^;]*postura/i.test(APP));
}

console.log(`\n${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
