/* ============================================================
   O PASSO ANTES DO ATO (11/10, MM11 · 5.ª sessão, J6)

   "Agradeço, termino a cerveja e saio para a praça. Procuro o mural de
   cartazes…" rolou Percepção dentro da taverna (5+2 contra 13, falha), o
   Mestre narrou a busca no salão e "o lugar fica remexido" — e o herói não
   saiu. Duas causas, e esta suíte prende as duas:

   1. procurar o MURAL é ir até ele (`PROCURAR_PARA_IR`, desafios.js), e
      não revirar um cômodo — o catálogo julgava a frase como `buscar`;
   2. a frase com saída e destino move ANTES de o catálogo julgar o resto
      (`adjudicarAcao`, App.jsx) — o passo morava só no envio, que corre
      depois de o desafio já ter fechado o turno.
   ============================================================ */
import fs from "node:fs";
import { lerAcao, ehProcuraDeIr } from "../src/desafios.js";
import { lugarPedido } from "../src/lugar.js";

let falhas = 0;
const ok = (c, t) => { if (!c) { falhas++; console.log("  FALHA:", t); } else console.log("  ok:", t); };

const CTX = { personagem: { atributos: {} }, semente: 7, lugar: "Candeia Faiscante" };
/* a cidade da sessão: a taverna de onde se sai e a praça do mercado */
const LUGARES = [
  { nome: "Candeia Faiscante", tipo: "taverna", onde: "dentro" },
  { nome: "Mercado do Ogro", tipo: "mercado", onde: "dentro" },
  { nome: "Templo do Sol Baixo", tipo: "templo", onde: "dentro" },
];
const ehBusca = (f) => { const v = lerAcao(f, CTX); return !!(v && v.tipo === "teste" && v.id === "buscar"); };

console.log("\n[o turno real e as variantes: andar, não revirar]");
const VARIANTES = [
  /* o J6 da sessão, como o jogador o escreveu */
  "Agradeço, termino a cerveja e saio para a praça. Procuro o mural de cartazes",
  "saio para a praça e procuro o mural",
  "vou até à praça ver o mural",
  "saio e procuro o mural na praça",
  "Saio da taverna e caminho até a praça. Procuro o mural de cartazes no meio dela.",
];
for (const f of VARIANTES) {
  ok(!ehBusca(f), `não é "vasculhar o lugar": ${f.slice(0, 60)}`);
  const l = lugarPedido(f, LUGARES);
  ok(l && l.nome === "Mercado do Ogro", `move à praça (${l && l.nome}): ${f.slice(0, 50)}`);
}
ok(ehProcuraDeIr("procuro o mural de cartazes"), "procurar o mural é procurar para ir");
ok(ehProcuraDeIr("procuro um cartaz de trabalho"), "procurar um cartaz também");

console.log("\n[o que continua a ser busca]");
/* a régua de sempre: revirar e o escondido mandam, mesmo com o mural na frase */
ok(ehBusca("vasculho o mural atrás de um bilhete escondido"), "vasculhar o mural é busca");
ok(ehBusca("procuro um compartimento secreto no mural"), "o escondido no mural é busca");
ok(ehBusca("vasculho o quarto"), "vasculhar o quarto continua busca");

console.log("\n[a ordem no App: o passo antes do catálogo]");
const app = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
const ini = app.indexOf("const adjudicarAcao = (acao) => {");
const corpo = app.slice(ini, ini + 4000);
const iPasso = corpo.indexOf("moverParaLocal(passo)");
const iProcura = corpo.indexOf("if (procurarAlguem(acao))");
const iVeredito = corpo.indexOf("const v = veredictoDaAcao(acao);");
ok(ini > 0 && iPasso > 0, "adjudicarAcao move pelo mesmo moverParaLocal do envio");
ok(iPasso > 0 && iPasso < iProcura && iPasso < iVeredito, "o passo vem antes da procura e do veredito");
ok(/alvoLocalPedido\(acao\)/.test(corpo.slice(0, iPasso)), "o destino sai do mesmo detector do envio (alvoLocalPedido)");
ok(/calou\("o passo antes do ato"/.test(corpo), "a fiação cala (nunca custa o turno)");

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
