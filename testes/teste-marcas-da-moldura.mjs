/* AS MARCAS DA MOLDURA (05/11/2026) — src/marcas-da-moldura.js

   A proposta do desenho, aprovada pela pessoa: cada feito verdadeiro grava
   uma marca no aro. Esta suíte prova:
   §1 os três feitos e a forma de cada um (entalhe, runa, cicatriz);
   §2 gravar é imutável, e o mesmo feito não grava duas vezes;
   §3 no aro: as doze primeiras, cada uma na sua hora, e gravado não se apaga;
   §4 a linha diz o nome e o dia; o save velho (sem feitos) e o lixo não estouram;
   §5 o teto do registo segura o save. */
import { MARCAS_DA_MOLDURA, garantirFeitos, gravarFeito, linhaDaMarca, marcasNoAro } from "../src/marcas-da-moldura.js";

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

sec("§1 os três feitos");
{
  t("chefe → entalhe, promessa → runa, levantou → cicatriz", MARCAS_DA_MOLDURA.tipos.chefe.forma === "entalhe" && MARCAS_DA_MOLDURA.tipos.promessa.forma === "runa" && MARCAS_DA_MOLDURA.tipos.levantou.forma === "cicatriz");
  t("doze no aro", MARCAS_DA_MOLDURA.noAro === 12);
}

sec("§2 gravar");
{
  const a = [];
  const r = gravarFeito(a, { tipo: "chefe", nome: "o Rei-Lobo", dia: 14 });
  t("grava o feito e devolve lista nova", r.gravou && r.feitos.length === 1 && a.length === 0);
  const r2 = gravarFeito(r.feitos, { tipo: "chefe", nome: "o Rei-Lobo", dia: 14 });
  t("o mesmo feito não grava duas vezes", !r2.gravou && r2.feitos.length === 1);
  t("a chave própria manda (a mesma promessa noutro dia não regrava)", (() => { const x = gravarFeito([], { tipo: "promessa", nome: "Levar a carta", dia: 3, chave: "p1" }).feitos; return !gravarFeito(x, { tipo: "promessa", nome: "Levar a carta", dia: 9, chave: "p1" }).gravou; })());
  t("tipo desconhecido não grava", !gravarFeito([], { tipo: "bolo", nome: "x", dia: 1 }).gravou);
}

sec("§3 no aro");
{
  let f = [];
  for (let i = 1; i <= 15; i++) f = gravarFeito(f, { tipo: i % 3 ? "chefe" : "levantou", nome: `Chefe ${i}`, dia: i }).feitos;
  const aro = marcasNoAro(f);
  t("no aro ficam doze", aro.length === 12);
  t("são as doze primeiras: gravado não se apaga", aro[0].nome === "Chefe 1" && aro[11].nome === "Chefe 12");
  t("cada uma na sua hora, no sentido do relógio", aro[0].hora === 0 && aro[0].angulo === 0 && aro[3].angulo === 90 && aro[11].angulo === 330);
  t("o registo guarda as quinze (para a crónica)", f.length === 15);
}

sec("§4 a linha, o save velho e o lixo");
{
  t("«o Rei-Lobo, dia 14»", linhaDaMarca({ tipo: "chefe", nome: "o Rei-Lobo", dia: 14 }) === "o Rei-Lobo, dia 14");
  t("a promessa diz que foi cumprida", linhaDaMarca({ tipo: "promessa", nome: "Levar a carta", dia: 3 }) === "Levar a carta — cumprida, dia 3");
  t("a cicatriz diz o dia", linhaDaMarca({ tipo: "levantou", dia: 7 }) === "voltou do chão, dia 7");
  t("save velho e lixo: lista vazia, sem estourar", [undefined, null, {}, 3, "x", [null, 1, { tipo: "x" }]].every((x) => garantirFeitos(x).length === 0 && marcasNoAro(x).length === 0));
  t("a linha de lixo é vazia", linhaDaMarca(null) === "" && linhaDaMarca({ tipo: "x" }) === "");
}

sec("§5 o teto");
{
  let f = [];
  for (let i = 0; i < MARCAS_DA_MOLDURA.teto + 10; i++) f = gravarFeito(f, { tipo: "chefe", nome: `C${i}`, dia: i }).feitos;
  t(`o registo para em ${MARCAS_DA_MOLDURA.teto}`, f.length === MARCAS_DA_MOLDURA.teto);
}

console.log(`\nas marcas da moldura: ${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
