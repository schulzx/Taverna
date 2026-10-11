/* O ASSUNTO DO COMPASSO TEM CHÃO (nexo, 11/10)

   Contradição 2 da lista da 4.ª sessão (mente/mm11-sessao-4.md, "As
   contradições entre órgãos"): o compasso × a ficha do lugar. A "intriga de
   corte" só nasce numa capital (assuntos.js), e nasceu em Alto do Sal; os
   movimentos seguintes iam ao Narrador onde quer que o herói estivesse, e o
   "O QUE FICOU" chegou a Rio Cinzento — uma aldeia pastoril de uma rua só,
   sem guarda —, onde o Narrador escreveu "a corte de Rio Cinzento já
   escolheu o teu lado".

   A regra (compasso.js): na virada para um movimento que fala, o assunto
   tem de caber no CHÃO de agora (`cabeNoLugar`, com o que não é lugar —
   `O_QUE_NAO_E_LUGAR` — dado como cumprido). Não cabe: a onda espera que eu
   volte; não volto em `ESPERA_DO_LUGAR` turnos: a história de lá seguiu sem
   mim, e a onda recomeça do respiro, sem assunto.

   FALHA em HEAD (v9.374): cabeNoLugar e ESPERA_DO_LUGAR não existem, e o
   preço da intriga chega à aldeia. */

import * as C from "../src/compasso.js";
import { assuntoPorId } from "../src/assuntos.js";
import { rng } from "../src/semente.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const J = (v) => JSON.stringify(v);
const cabe = C.cabeNoLugar || (() => true);
const ESPERA = Number.isFinite(C.ESPERA_DO_LUGAR) ? C.ESPERA_DO_LUGAR : 0;

const CAPITAL = { emCidade: true, porte: "capital", momento: 0.5, pessoaNaCena: true };
const ALDEIA = { emCidade: true, porte: "aldeia", momento: 0.5, pessoaNaCena: true };
const corte = assuntoPorId("intriga_de_corte");
/* a onda no fim da véspera de uma intriga, pronta a virar para o clímax */
const naVespera = (extra = {}) => C.garantirCompasso({ movimento: "vespera", turnos: 0, alvo: 1, assunto: "intriga_de_corte", quem: "Belmira", usados: ["intriga_de_corte"], familias: ["laco"], ...extra });

sec("1. a régua do chão");
{
  t("ESPERA_DO_LUGAR é um número da tabela", ESPERA >= 1);
  t("o que não é lugar não inclui o chão (cidade, porte, bioma, masmorra, estrada, combate)", !!C.O_QUE_NAO_E_LUGAR && ["emCidade", "porte", "bioma", "emMasmorra", "emViagem", "emCombate", "diasAteVizinha"].every((k) => !(k in C.O_QUE_NAO_E_LUGAR)));
  t("a intriga de corte cabe numa capital", !!corte && cabe(corte, CAPITAL));
  t("e não cabe numa aldeia", !!corte && !cabe(corte, ALDEIA));
  t("nem fora da cidade", !!corte && !cabe(corte, { emCidade: false }));
  t("o que não é lugar não a prende: com momento baixo e ninguém na cena, na capital, cabe", !!corte && cabe(corte, { emCidade: true, porte: "capital", momento: 0, pessoaNaCena: false }));
  t("um assunto sem chão cabe em qualquer sítio (o romance, pessoa ou cidade)", cabe(assuntoPorId("romance"), { emCidade: true, porte: "aldeia" }));
  /* sem assunto não há o que prender (o lado seguro é o de antes); sem cena,
     a intriga não tem cidade — e não cabe */
  t("lixo: sem assunto cabe; sem cena, a intriga não cabe — e nada estoura", cabe(null, ALDEIA) && cabe({}, ALDEIA) && cabe(corte, null) === false && cabe(corte, "x") === false);
}

sec("2. na aldeia, a onda espera");
{
  const sorte = rng("compasso-no-chao|1");
  const r = C.avancarCompasso(naVespera(), ALDEIA, { sorte });
  t("não vira para o clímax", r.virou === false && r.compasso.movimento === "vespera");
  t("e não manda envelope", C.envelopeDoCompasso(r) === "");
  t("guarda o assunto e quem", r.compasso.assunto === "intriga_de_corte" && r.compasso.quem === "Belmira");
  t("e diz porquê (para o console de autor)", /outro lugar/.test(r.porque || ""));
  const volta = C.avancarCompasso(r.compasso, CAPITAL, { sorte });
  t("de volta à capital, vira para o clímax", volta.virou === true && volta.compasso.movimento === "climax");
  t("e o envelope é o da intriga, com quem", /AGORA/.test(C.envelopeDoCompasso(volta)) && /BELMIRA/.test(C.envelopeDoCompasso(volta)));
}

sec("3. se eu não volto, a história de lá segue sem mim");
{
  const sorte = rng("compasso-no-chao|2");
  let c = naVespera(), r = null, voltas = 0;
  for (; voltas < ESPERA + 3; voltas++) {
    r = C.avancarCompasso(c, ALDEIA, { sorte });
    c = r.compasso;
    if (c.movimento === "respiro") break;
  }
  t(`a onda desfaz-se ao fim da espera (${voltas + 1} turnos, espera ${ESPERA})`, c.movimento === "respiro" && voltas + 1 >= ESPERA && voltas + 1 <= ESPERA + 1);
  t("sem assunto nem gente presos", c.assunto === "" && c.quem === "" && c.quem2 === "");
  t("e sem envelope nenhum pelo caminho", r && C.envelopeDoCompasso(r) === "");
  t("os assuntos já usados continuam lembrados (não volta logo a seguir)", c.usados.includes("intriga_de_corte"));
}

sec("4. o que não mudou");
{
  const sorte = rng("compasso-no-chao|3");
  const r = C.avancarCompasso(naVespera(), CAPITAL, { sorte });
  t("no chão dele, a onda vira como sempre", r.virou === true && r.compasso.movimento === "climax");
  const romance = C.garantirCompasso({ movimento: "vespera", turnos: 0, alvo: 1, assunto: "romance", quem: "Ana" });
  t("um assunto sem chão vira em qualquer sítio", C.avancarCompasso(romance, { emCidade: false, emViagem: true }, { sorte }).virou === true);
  t("segurar continua a mandar primeiro", C.avancarCompasso(naVespera(), ALDEIA, { sorte, segurar: true }).porque.includes("espera"));
  const antes = J(naVespera());
  const c0 = naVespera();
  C.avancarCompasso(c0, ALDEIA, { sorte });
  t("não muta o compasso recebido", J(c0) === antes);
  const a = C.avancarCompasso(naVespera(), ALDEIA, { sorte: rng("x") }), b = C.avancarCompasso(naVespera(), ALDEIA, { sorte: rng("x") });
  t("determinístico pela semente", J(a) === J(b));
}

console.log(`\no compasso no chão: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
