/* A ESPERA DA FRASE (04/11/2026) — src/motor/a-espera-da-frase.js

   Esperar não tinha porta: «fico à espera dele até às onze» (17.ª T10)
   andou 10 minutos. Esta suíte prova as frases das sessões e as vizinhas:
   §1 as frases das sessões dão o tempo certo;
   §2 a hora dita: «até às onze», «até as 14h», «até o meio-dia», «até
      anoitecer», «até as sete da noite», a hora que já passou é amanhã;
   §3 a duração dita: «uma hora», «duas horas», «meia hora», «20 minutos»;
   §4 sem dizer quanto: as escolhas da tabela;
   §5 o que não é esperar: o desejo («espero que…»), a negação, a prosa
      alheia, o envelope do sistema; o teto de um dia. */
import { aEsperaDaFrase, A_ESPERA_DA_FRASE } from "../src/motor/a-espera-da-frase.js";
import { oEnvelopeDaViagem } from "../src/motor/envelopes-do-turno.js";
import { aFichaDeAtor, verificarAFicha } from "../src/motor/ficha-de-ator.js";

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);
const e = (f, minuto) => aEsperaDaFrase(f, { minuto });

sec("§1 as frases das sessões");
t("17.ª T10, 9h40: «fico à espera dele até às onze» → 80 min, até as 11h", J(e("Fico à espera dele até às onze.", 580)) === J({ minutos: 80, ate: 660 }), J(e("Fico à espera dele até às onze.", 580)));
t("14.ª, 8h: «Espero pela Inez até ela chegar» → as escolhas (quanto ela demora não se sabe)", J(e("Espero pela Inez até ela chegar", 480)) === J({ opcoes: A_ESPERA_DA_FRASE.opcoes }), J(e("Espero pela Inez até ela chegar", 480)));

sec("§2 a hora dita");
t("«aguardo até as 14h», às 13h → 60 min", (e("Aguardo até as 14h", 780) || {}).minutos === 60);
t("«espero até as 14:30», às 13h → 90 min", (e("espero até as 14:30", 780) || {}).minutos === 90);
t("«espero até o meio-dia», às 9h → 180 min", (e("espero até o meio-dia", 540) || {}).minutos === 180);
t("«fico à espera até anoitecer», às 15h → 180 min", (e("fico à espera até anoitecer", 900) || {}).minutos === 180);
t("«espero até as sete da noite», às 15h → 240 min", (e("espero até as sete da noite", 900) || {}).minutos === 240);
t("«espero até as sete», às 15h → as sete da noite (a primeira que vem), 240 min", (e("espero até as sete", 900) || {}).minutos === 240, J(e("espero até as sete", 900)));
t("«espero até as onze», às 23h30 → as onze da manhã, 690 min", (e("espero até as onze", 1410) || {}).minutos === 690, J(e("espero até as onze", 1410)));
t("«espero até de manhã», às 22h → 480 min", (e("espero até de manhã", 1320) || {}).minutos === 480);

sec("§3 a duração dita");
t("«espero uma hora» → 60", (e("Espero uma hora.", 600) || {}).minutos === 60);
t("«aguardamos duas horas» → 120", (e("aguardamos duas horas", 600) || {}).minutos === 120);
t("«espero meia hora» → 30", (e("espero meia hora", 600) || {}).minutos === 30);
t("«fico esperando 20 minutos» → 20", (e("fico esperando 20 minutos", 600) || {}).minutos === 20);

sec("§4 sem dizer quanto");
t("«espero» → as escolhas", J((e("Espero.", 600) || {}).opcoes) === J(A_ESPERA_DA_FRASE.opcoes));
t("as escolhas são uma cópia (a tabela não muda)", (() => { const o = e("Espero.", 600); o.opcoes.push(9); return A_ESPERA_DA_FRASE.opcoes.length === 3; })());

sec("§5 o que não é esperar");
for (const f of ["Espero que ele diga a verdade.", "Não espero por ninguém, sigo.", "Ele espera à porta.", "[ESPERA] o sistema", "Olho à volta.", ""]) t(`«${f}» → nada`, e(f, 600) === null, J(e(f, 600)));
t("nunca mais de um dia: «espero 30 horas» não é uma hora a menos, é as escolhas", J(e("espero 30 horas", 600)) === J({ opcoes: A_ESPERA_DA_FRASE.opcoes }));
let estourou = false; try { for (const x of [null, undefined, 3, {}, []]) { aEsperaDaFrase(x, x); aEsperaDaFrase("espero", x); } } catch (z) { estourou = z; }
t("o lixo não estoura", !estourou, String(estourou));

sec("§6 a ficha do ator diz que o tempo passou");
/* o relógio e a frase de esperar mandam o mesmo envelope; a ficha cortava-o */
for (const [h, diz] of [[1, "uma hora"], [1.3, "1,3 horas"], [0.5, "30 minutos"]]) {
  const env = oEnvelopeDaViagem("passarOTempo", { horas: h, escala: "curta", lugar: null, clima: "", reino: "" });
  const F = aFichaDeAtor({ frase: "Fico à espera.", nota: "ONDE      em Torre Alto\n" + env, estado: { personagem: { nome: "Inês" }, cidadeAtual: "Torre Alto" } });
  t(`${h} h → «Inês deixou passar ${diz}» no que aconteceu, sem bastidor`, F.texto.includes(`Inês deixou passar ${diz}`) && !/PASSAR O TEMPO|Simule/.test(F.texto) && verificarAFicha(F.texto).length === 0, F.texto.split("\n").slice(0, 4).join(" | "));
}
console.log(`\na espera da frase: ${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
