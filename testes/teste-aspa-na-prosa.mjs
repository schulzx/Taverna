/* teste-aspa-na-prosa.mjs (Fase MM · 4.ª sessão de prova, nº 3)
   — uma aspa sem escape na prosa do Narrador não corta a narração

   Na quarta sessão de prova (`mente/mm11-sessao-4.md`, defeito nº 3) o
   Narrador escreveu, dentro do campo "narrativa", `o apelido "Navarro" já
   no ar` sem escapar as aspas. O JSON não abriu, e o resgate por campo de
   `extrairJSON` levou tudo até à primeira aspa: o jogador leu 449 de ~1.690
   caracteres, a frase acabou a meio ("…se debruça, o apelido"), e o terço
   que faltava tinha a fala de Euzébio ("a tua metade da dívida, Navarro,
   não vai se pagar com lenda de homem morto") e a briga dos padeiros com os
   moedores. O Revisor recebeu o toco como se fosse a cena, e foi pago.

   A fixture (`registo-s4-aspa.json`) é a resposta real da chamada 9 do
   registo, letra a letra, e o que o Revisor recebeu na chamada 10.

   FALHA em HEAD de 11/10 (v9.379): a narrativa sai com 449 caracteres e
   `ASPA_QUE_FECHA` não existe. */
import fs from "fs";
import * as J from "../src/json.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const tenta = (f, d = null) => { try { return f(); } catch { return d; } };
const FIX = JSON.parse(fs.readFileSync(new URL("./registo-s4-aspa.json", import.meta.url), "utf8"));
const narr = (txt) => (tenta(() => J.extrairJSON(txt), {}) || {}).narrativa || "";

/* ============================================================ */
sec("1. a tabela");
{
  const A = J.ASPA_QUE_FECHA || {};
  t("a aspa que fecha é tabela: o que vem depois, e quanto se olha", A.depois instanceof RegExp && Number.isFinite(A.olhar) && A.olhar > 0);
  t("fecha antes de dois-pontos, de vírgula com aspa, de } e ] e do fim", A.depois && [":", ", \"x", "}", "]", "", "  }"].every((s) => A.depois.test(s)));
  t("não fecha antes de prosa", A.depois && [" já no ar", ", disse ela", ".", "Navarro", " e"].every((s) => !A.depois.test(s)));
}

/* ============================================================ */
sec("2. a resposta real do turno (chamada 9 do registo)");
{
  const n = narr(FIX.texto);
  t("a narração chega inteira (era 449 caracteres)", n.length > 1500, `${n.length} caracteres`);
  t("com a aspa da prosa no lugar: o apelido \"Navarro\" já no ar", /o apelido "Navarro" já no ar/.test(n));
  t("a fala de Euzébio chega ao jogador", /a tua metade da dívida, Navarro, não vai se pagar com lenda de homem morto/.test(n));
  t("e o fim da cena também (os padeiros e os moedores, o sino)", /confraria dos padeiros e a dos moedores/.test(n) && /apertando o cinto\.$/.test(n.trim()));
  t("sem JSON cru na tela", !/"narrativa"|\\"|^\{|\}$/.test(n.trim()));
  t("o que o Revisor recebeu era o toco (a reprodução do estrago)", /o apelido\n"""/.test(FIX.revisorRecebeu));
  t("e o toco é um prefixo do que agora chega", n.startsWith("Inocência sorri com a ponta da boca"));
}

/* ============================================================ */
sec("3. outras formas da mesma aspa");
{
  const base = (prosa, resto = "") => `{"narrativa":"${prosa}"${resto}}`;
  const a = narr(base('Ela disse "vem" e foi.', ',"sugestoes":["olhar"]'));
  t("aspa da prosa com outro campo depois: o campo inteiro", a === 'Ela disse "vem" e foi.', a);
  const b = narr(base('Ele grita "fogo!", e corre.'));
  t("aspa seguida de vírgula e prosa continua prosa", b === 'Ele grita "fogo!", e corre.', b);
  const c = narr(base('No fim, só "adeus".'));
  t("aspa da prosa colada ao fim da string", c === 'No fim, só "adeus".', c);
  const r = tenta(() => J.extrairJSON(base('Ela disse "vem" e foi.', ',"perigo":"a ponte cede","sugestoes":["olhar","correr"]')), {}) || {};
  t("os outros campos sobrevivem à reparação", r.perigo === "a ponte cede" && Array.isArray(r.sugestoes) && r.sugestoes.length === 2, JSON.stringify(r));
  const truncada = narr('{"narrativa":"Ela diz "Navarro" baixinho e a porta range enquanto a chuva');
  t("truncada E com aspa: leva tudo o que veio, não só até à aspa", /a porta range enquanto a chuva/.test(truncada) && /"Navarro"/.test(truncada), truncada);
}

/* ============================================================ */
sec("4. o que já funcionava continua igual");
{
  const boa = JSON.stringify({ narrativa: 'Ela disse "vem" e foi.', sugestoes: ["a"] });
  t("JSON bem escapado: igual", narr(boa) === 'Ela disse "vem" e foi.');
  t("prosa sem JSON nenhum: devolvida como prosa", narr("Só prosa, sem chaves.") === "Só prosa, sem chaves.");
  t("vírgula sobrando no fim: como antes", narr('{"narrativa":"Tudo certo.","sugestoes":[],}') === "Tudo certo.");
  const trunc = narr('{"narrativa":"A estrada segue para o norte e o vento');
  t("truncada sem aspa nenhuma: o que veio", /o vento$/.test(trunc.replace(/ \[…\]$/, "")), trunc);
}

/* ============================================================ */
sec("5. lixo e determinismo");
{
  t("lixo não estoura", [null, undefined, "", "{", "}", '{"narrativa":', '{"narrativa":"', 3].every((x) => typeof narr(x) === "string"));
  t("o mesmo texto dá a mesma narração", narr(FIX.texto) === narr(FIX.texto));
}

console.log(`\naspa na prosa: ${ok} passaram, ${mal} falharam`);
if (mal) process.exit(1);
