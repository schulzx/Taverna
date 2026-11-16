/* ============================================================
   A QUEM A FRASE CHAMA (S4e · 2, 16/11/2026) — testes/teste-a-quem-a-frase-chama.mjs

   A prova jogada de 16/11: «Falo com Orla» na Feira, com a Orla na estalagem,
   foi ACEITO, e a prosa pô-la «no balcão». Duas causas: quem estava «à vista»
   para a proposta era a cidade inteira (elencoDaCena), e a gente da base (a
   Orla é a taverneira da Roda dos Insones) não era «conhecida». Agora o App
   lê a conta única (quemAgeAqui) e a base da cidade, e o sistema responde
   antes do Narrador: «Orla não está aqui — Ir até a Roda dos Insones». O nome
   que o mundo não tem («Falo com Kolvar») é recusado sem inventar.

   O corpus: 36 frases (com e sem acento, PT-BR e PT-PT), 100 % resolvidas.
   ============================================================ */
const { aPessoaChamada, aPropostaDaFrase, A_PROPOSTA_DA_FRASE } = await import("../src/motor/a-proposta-da-frase.js");

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (typeof cond === "function") { try { cond = cond(); } catch (e) { extra = String(e && e.message); cond = false; } } if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? "  → " + extra : "")); } };

/* o mundo do caso: na Feira estão o Quorin e a Sigrun; a Orla trabalha na Roda dos
   Insones; o Varek é morador (o registo), longe; a cidade é a Pedra das Águias */
const ctx = {
  conhecidos: ["Orla Vau", "Varek Dente-Frio", "Quorin Mão-Leve", "Sigrun Olho-Baixo", "Ceridwen Passo-de-Gato"],
  presentes: ["Quorin Mão-Leve", "Sigrun Olho-Baixo", "Lia (com você)"],
  mundo: ["A Roda dos Insones", "A Feira das Cinzas", "Pedra das Águias", "Mina de Cinzas", "Vera Lume"],
};
const chama = (f) => aPessoaChamada(f, ctx);
const ausente = (f, nome) => { const r = chama(f); return !!(r && !r.desconhecido && r.nome === nome); };
const desconhecido = (f, nome) => { const r = chama(f); return !!(r && r.desconhecido && r.nome === nome); };
const segue = (f) => chama(f) === null;

console.log("\n§1 quem o sistema conhece e não está — recusado, com o caminho");
const AUSENTES = [
  ["Falo com Orla", "Orla Vau"], ["falo com a Orla", "Orla Vau"], ["Converso com Orla Vau sobre a cerveja.", "Orla Vau"],
  ["Pergunto à Orla se viu o Varek", "Orla Vau"], ["Pergunto a Orla onde fica a mina", "Orla Vau"], ["pergunto a orla", "Orla Vau"],
  ["Chamo a Orla", "Orla Vau"], ["Digo à Orla que volto à noite", "Orla Vau"], ["Peço à Orla um quarto", "Orla Vau"],
  ["Vou ter com a Orla", "Orla Vau"], ["Cumprimento a Orla com um aceno", "Orla Vau"], ["Entrego a carta ao Varek", "Varek Dente-Frio"],
  ["Mostro o mapa ao Varek", "Varek Dente-Frio"], ["Falo com o Varek sobre a mina", "Varek Dente-Frio"], ["Converso com Varek", "Varek Dente-Frio"],
  ["Interpelo o Varek", "Varek Dente-Frio"], ["Quero falar com a Ceridwen", "Ceridwen Passo-de-Gato"], ["Aproximo-me e falo com a Ceridwen", "Ceridwen Passo-de-Gato"],
];
for (const [f, n] of AUSENTES) t(`«${f}» → ${n} não está`, ausente(f, n), JSON.stringify(chama(f)));

console.log("\n§2 o nome que o mundo não tem — o sistema diz que não há");
const NINGUEM = [["Falo com Kolvar", "Kolvar"], ["Converso com Thalia", "Thalia"], ["Pergunto ao Brannoc onde fica a mina", "Brannoc"],
  ["Chamo o Edwyn Corvo", "Edwyn Corvo"], ["Peço a Maelis um quarto", "Maelis"], ["Digo ao Torvald que sim", "Torvald"]];
for (const [f, n] of NINGUEM) t(`«${f}» → não há ninguém chamado ${n}`, desconhecido(f, n), JSON.stringify(chama(f)));

console.log("\n§3 a conversa segue sem cartão — quem está, ninguém nomeado, lugar, o herói");
const SEGUE = ["Falo com o Quorin", "Pergunto à Sigrun o preço", "Converso com a Lia", "Falo com o taverneiro", "Pergunto a quem está ao balcão",
  "Falo com a Feira das Cinzas", "Peço à Roda dos Insones um quarto", "Digo que sim", "Olho em volta", "Pergunto ao guarda do portão",
  "Falo com a Sigrun Olho-Baixo"];
for (const f of SEGUE) t(`«${f}» → segue`, segue(f), JSON.stringify(chama(f)));

console.log("\n§4 o cartão: o caminho até o posto, ou a recusa do nome");
{
  const estado = { cidadeAtual: "Pedra das Águias", npcs: {} };
  const sitios = [{ nome: "A Roda dos Insones", onde: "dentro", minutos: 6 }, { nome: "A Feira das Cinzas", onde: "dentro", minutos: 0 }];
  const p = aPropostaDaFrase({ frase: "Falo com Orla", ausente: { nome: "Orla Vau", sitios, posto: "A Roda dos Insones" } }, estado);
  t("«Falo com Orla» vira «Ir até a roda dos insones», e a linha diz que não está", !!(p && p.tipo === "ausente" && /Ir até/.test(p.verbo) && /Roda dos Insones/i.test(p.verbo) && p.linhas.some((l) => /Orla Vau não está aqui/.test(l))), JSON.stringify(p && { v: p.verbo, l: p.linhas }));
  t("…e diz onde ela trabalha", !!(p && p.linhas.some((l) => /trabalha/.test(l) && /Roda dos Insones/.test(l))));
  t("…e o botão faz «ir»", p && p.faz === "ir");
  const k = aPropostaDaFrase({ frase: "Falo com Kolvar", ausente: { nome: "Kolvar", sitios, desconhecido: true } }, estado);
  t("«Falo com Kolvar»: o cartão diz que não há ninguém com esse nome", !!(k && k.linhas.some((l) => l === A_PROPOSTA_DA_FRASE.linhas.desconhecido.replace("{N}", "Kolvar"))), JSON.stringify(k && k.linhas));
}

console.log("\n§5 lixo não estoura");
t("null, número, objeto", () => aPessoaChamada(null, null) === null && aPessoaChamada(7, {}) === null && aPessoaChamada("Falo com", { conhecidos: 3 }) === null);

const total = AUSENTES.length + NINGUEM.length + SEGUE.length;
console.log(`\n      corpus: ${total} frases`);
t("o corpus tem ≥ 30 frases", total >= 30);
console.log(`\na quem a frase chama (S4e): ${ok} passaram, ${mal} falharam`);
if (mal) process.exit(1);
