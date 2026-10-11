/* A TRAMA AMARRADA (MM, a campanha que prende, 11/10) — fio novo só com amarra

   Na quarta sessão uma viagem, um acampamento e um correio trouxeram três
   fios novos sem relação com o herói (a Câmara do Dragão, o Torneio das
   Coroas, o pedido de Ondine), e o Mestre, obrigado a tocá-los, dispersou a
   única linha que havia. O backend das promessas segurou-os na estrada
   (`fiosNovosNaEstrada`, v9.388) e pediu a mesma porta onde a trama nasce.

   O que esta suíte prova (tramas.js):
     1. com `amarra`, a trama que não toca o fio, uma promessa aberta nem um
        nome que importa não nasce;
     2. a que toca nasce, e diz a que se amarra — no envelope também;
     3. sem `amarra` (a trama forçada da abertura, o save de antes), tudo como
        sempre: a mesma trama, byte a byte;
     4. lixo na porta não derruba nada.

   FALHA em HEAD (v9.390): montarTrama não conhece `amarra`. */

import * as T from "../src/tramas.js";
import { rngDe } from "../src/geografia.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const J = (v) => JSON.stringify(v);
const sit = () => T.garantirSituacao({ nivel: 2, momento: 0.3 });
const material = (quem = "Ondine Barba-Ruiva") => ({
  cidade: { nome: "Vau Fundo" }, pessoa: { nome: quem }, local: { nome: "O Cálice Magro" },
  criatura: { nome: "Lobo" }, ermo: { nome: "a Ravina" },
});
const monta = (o) => T.montarTrama({ situacao: sit(), material: material(), rnd: rngDe("trama|7"), ...o });

console.log("\n1. sem amarra ao fio, a trama não nasce");
{
  const livre = monta({});
  t("(a mesma trama, sem porta, nasce)", !!livre);
  const fora = monta({ amarra: { fio: [{ nome: "Noé Laminado", tipo: "pessoa" }], prometido: null, nomes: [] } });
  t("com o fio noutra gente e nenhuma promessa, não nasce", fora === null);
  t("contexto vazio: nada amarra, não nasce", monta({ amarra: {} }) === null);
}

console.log("\n2. a que toca o fio nasce, e diz a que se amarra");
{
  const pelaGente = monta({ amarra: { fio: [{ nome: "Ondine Barba-Ruiva", tipo: "pessoa" }] } });
  t("quem pede é gente do fio: nasce", !!pelaGente && pelaGente.amarra === "Ondine Barba-Ruiva");
  const pelaPromessa = monta({ amarra: { prometido: { sementes: [{ id: "s1", texto: "a dívida com Ondine Barba-Ruiva", quem: "Ondine Barba-Ruiva", estado: "aberta", tipo: "volta" }] } } });
  t("quem pede é a pessoa de uma promessa aberta: nasce, amarrada à promessa", !!pelaPromessa && /Ondine/.test(pelaPromessa.amarra || ""));
  const peloNome = monta({ amarra: { nomes: ["Ondine Barba-Ruiva"] } });
  t("um nome que importa também amarra", !!peloNome && peloNome.amarra === "Ondine Barba-Ruiva");
  const env = T.envelopeDaTrama(pelaGente);
  t("o envelope diz a amarra, para o Mestre a trazer por aí", env.includes("Isto amarra-se a Ondine Barba-Ruiva"));
  t("e a trama amarrada é a mesma que nasceria sem porta, mais a amarra", !!pelaGente && J({ ...pelaGente, amarra: undefined }) === J({ ...monta({}), amarra: undefined }));
}

console.log("\n3. sem amarra, como sempre");
{
  const a = monta({}), b = T.montarTrama({ situacao: sit(), material: material(), rnd: rngDe("trama|7") });
  t("sem o campo, a mesma trama, byte a byte, e sem amarra", J(a) === J(b) && !("amarra" in a));
  t("o envelope de sempre", !T.envelopeDaTrama(a).includes("amarra-se"));
}

console.log("\n4. lixo na porta");
{
  let erro = null;
  try { monta({ amarra: { fio: "x", prometido: 3, nomes: null } }); } catch (e) { erro = e; }
  t("contexto de lixo não estoura", erro === null);
  t("amarra que não é objeto é ignorada", J(monta({ amarra: "sim" })) === J(monta({})));
}

console.log(`\ntrama amarrada: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
