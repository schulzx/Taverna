/* A HISTÓRIA PRINCIPAL NAS PEÇAS DO ARCO (11/10) — a contradição 7

   Na 4.ª sessão de prova, depois do Torneio das Coroas, as peças do arco que
   subiam ao Narrador eram só o evento global — "que engole a região" —, e a
   busca pelo Noé, que era a história, saiu delas: o Narrador passou a
   conduzir o Torneio. A v9.379 deu a regra a `resumoHistoria` (historia.js):
   quando o motor diz qual é a principal, ela abre a lista e o global corre
   ao lado. Faltava o App dizer: `motorDoArco` não passava `principal`.

   O que esta suíte prova:
     1. o motor do arco passa o título da missão principal, em try com calou;
     2. a principal não vai duas vezes à mesma linha (sai das impostas);
     3. com principal e global, a linha que o Narrador lê põe a principal
        primeiro e o global ao lado dela — e sem principal, a de sempre.

   FALHA em HEAD (v9.379): `motorDoArco` não tem `principal`. */

import { readFileSync } from "node:fs";
import * as H from "../src/historia.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);

const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
const corpoApos = (ancora) => {
  const ini = app.indexOf(ancora);
  if (ini < 0) return "";
  const abre = ini + ancora.length - 1;
  let prof = 0;
  for (let i = abre; i < app.length; i++) {
    if (app[i] === "{") prof++;
    else if (app[i] === "}") { prof--; if (prof === 0) return app.slice(abre, i + 1); }
  }
  return "";
};

sec("1. o motor do arco diz a principal");
const arco = corpoApos("const motorDoArco = () => {");
{
  t("o corpo de motorDoArco existe", arco.length > 100);
  t("passa principal: o título da missão do tipo principal", /principal: \(\(\) => \{ try \{ return \(ms\.find\(\(m\) => m\.tipo === "principal"\) \|\| \{\}\)\.titulo;/.test(arco));
  t("em try, com calou", /calou\("a principal do arco"/.test(arco));
}

sec("2. a principal não vai duas vezes");
{
  t("as impostas deixam a principal de fora", /tipoMissao\(m\.tipo\)\.forcada && m\.tipo !== "principal"/.test(arco));
}

sec("3. a linha que o Narrador lê");
{
  /* o mesmo retrato que motorDoArco monta, com as missões da 4.ª sessão */
  const ms = [
    { tipo: "principal", titulo: "O rasto de Noé Laminado", status: "ativa" },
    { tipo: "contrato", titulo: "Escoltar o carroceiro", status: "ativa" },
  ];
  const motor = { principal: (ms.find((m) => m.tipo === "principal") || {}).titulo, global: "O Torneio das Coroas", impostas: [], relogios: [] };
  const h = { estrutura: "jornada", etapa: 2 };
  const linha = H.resumoHistoria(h, motor);
  const iP = linha.indexOf("O rasto de Noé Laminado"), iG = linha.indexOf("O Torneio das Coroas");
  t("a principal está nas peças", iP > 0);
  t("e vem antes do evento global", iP > 0 && iG > iP);
  t("o global corre ao lado dela, sem a substituir", /ao lado da história principal/.test(linha));
  const sem = H.resumoHistoria(h, { global: "O Torneio das Coroas" });
  t("sem principal (save antigo, ou nenhuma ativa), a frase de sempre", /que engole a região/.test(sem) && !/história principal/.test(sem));
  const semMissao = { principal: ([].find((m) => m.tipo === "principal") || {}).titulo, global: "O Torneio das Coroas" };
  t("sem missão principal, o campo vai vazio e nada muda", H.resumoHistoria(h, semMissao) === sem);
}

console.log(`\narco com principal: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
