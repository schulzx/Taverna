/* O PAGAMENTO DA FRASE (04/11/2026) — src/motor/o-pagamento-da-frase.js

   «Pago a sopa» (14.ª T5) não cobrou; «Pago um quarto comum… durmo» (14.ª
   T9, 15.ª T3) dormiu de graça; «Ponho duas moedas no balcão pela caneca»
   (16.ª T4) nem foi visto. Esta suíte prova:
   §1 as quatro frases das sessões, com o preço das tabelas da casa;
   §2 a quantia dita ganha, por número, por extenso, pelo ◉ e pela moeda do
      mundo; e diz pelo que se paga;
   §3 a quantidade («duas canecas»), o quarto bom, o fator do porte;
   §4 o que não é pagar: a pergunta, a negação, a prosa alheia, o envelope;
      sem pouso não há quarto; o lixo não estoura. */
import { oPagamentoDaFrase, O_PAGAMENTO_DA_FRASE } from "../src/motor/o-pagamento-da-frase.js";
import { precoComum } from "../src/economia.js";

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);
const POUSO = { comum: 4, bom: 10 };
const p = (f, c = {}) => oPagamentoDaFrase(f, { fator: 1, pouso: POUSO, ...c });

sec("§1 as frases das sessões");
const s1 = p("Pago a sopa e sento-me ao canto.");
t(`14.ª T5 «Pago a sopa» → o prato quente, ◉ ${precoComum("refeicao", 1)} (a tabela do cenário)`, !!s1 && s1.total === precoComum("refeicao", 1) && s1.itens[0].nome === "prato quente" && !s1.dito, J(s1));
const s2 = p("Pago um quarto comum e durmo até de manhã.");
t("14.ª T9 «Pago um quarto comum… durmo» → o quarto comum, ◉ 4 (o pouso da cidade)", !!s2 && s2.total === 4 && s2.itens[0].nome === O_PAGAMENTO_DA_FRASE.nomes.comum, J(s2));
const s3 = p("Ponho duas moedas no balcão pela caneca.");
t("16.ª T4 «Ponho duas moedas no balcão pela caneca» → ◉ 2, dito, pela caneca", !!s3 && s3.total === 2 && s3.dito && s3.itens[0].nome === "caneca", J(s3));

sec("§2 a quantia dita");
t("«pago 3 moedas ao guarda» → ◉ 3, sem nome", J(p("Pago 3 moedas ao guarda")) === J({ itens: [{ nome: "", quantos: 1, preco: 3 }], total: 3, dito: true }), J(p("Pago 3 moedas ao guarda")));
t("«dou cinco moedas ao menino» → ◉ 5", (p("Dou cinco moedas ao menino") || {}).total === 5);
t("«deixo ◉ 2 na mesa» → ◉ 2", (p("Deixo ◉ 2 na mesa") || {}).total === 2);
t("a moeda do mundo: «pago as dez escamas» com a moeda Escamas → ◉ 10", (p("Pago as dez escamas", { moeda: "Escamas" }) || {}).total === 10, J(p("Pago as dez escamas", { moeda: "Escamas" })));

sec("§3 a quantidade, o quarto bom, o porte");
const q = p("Pago duas canecas de cerveja");
t("«pago duas canecas» → 2 × caneca", !!q && q.itens[0].quantos === 2 && q.total === 2 * precoComum("caneca", 1), J(q));
t("«pago o melhor quarto» → o quarto bom, ◉ 10", (p("Pago o melhor quarto") || {}).total === 10);
t("numa capital rica (fator 2) a sopa custa o dobro", (p("Pago a sopa", { fator: 2 }) || {}).total === precoComum("refeicao", 2));

sec("§4 o que não é pagar");
for (const f of ["Quanto custa a sopa?", "Não pago nada a ninguém.", "Ele paga a caneca dele.", "[COMPRA — JÁ REGISTRADA PELO SISTEMA] pago", "Olho a sopa.", ""]) t(`«${f}» → nada`, p(f) === null, J(p(f)));
t("sem pouso conhecido, o quarto não tem preço inventado", oPagamentoDaFrase("Pago um quarto", { fator: 1 }) === null);
let estourou = false; try { for (const x of [null, undefined, 3, {}, []]) { oPagamentoDaFrase(x, x); oPagamentoDaFrase("pago a sopa", x); } } catch (z) { estourou = z; }
t("o lixo não estoura", !estourou, String(estourou));

console.log(`\no pagamento da frase: ${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
