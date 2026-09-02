/* ONDE MORA CADA COISA VOLÁTIL.

   O prefixo estável é 2%. Para consertar a ordem eu preciso saber onde,
   no texto, está cada pedaço que muda de turno para turno — e quanto de
   REGRA está preso depois dele.

   Cada interpolação volátil funciona como uma tesoura: tudo o que vem
   depois dela deixa de ser cacheável. A primeira é a que manda. */

import { readFileSync } from "node:fs";
const P = readFileSync("../src/prompt.js", "utf8");

const i0 = P.indexOf("return _limparVazios(`");
const corpo = P.slice(i0);

/* o que é volátil de turno para turno, e o que é estável dentro de uma
   campanha (essas podem ficar no prefixo sem custo nenhum) */
const VOLATIL = [
  "tempoInfo", "fichaTexto(personagem)", "canoneTexto", "mapaTexto",
  "historiaInfo", "questsInfo", "npcsTexto", "divindadeInfo", "tituloInfo",
  "personagem.raca", "personagem.classe", "personagem.nivel", "resumoPatamar",
  "MOEDAS_INICIAIS",
];
const DA_CAMPANHA = ["nomeCampanha", "mundo.genero", "mundo.descricao", "lexTexto", "bn.elenco", "bn.cidades", "bn.tavernas", "criaturasDoGenero"];

const linhas = corpo.split("\n");
let pos = 0;
const achados = [];
for (const l of linhas) {
  for (const v of VOLATIL) if (l.includes("${" + v) || l.includes(v + "}") || l.includes(v)) { achados.push({ pos, tipo: "VOLÁTIL", o: v, l: l.slice(0, 70) }); break; }
  for (const v of DA_CAMPANHA) if (l.includes(v)) { achados.push({ pos, tipo: "campanha", o: v, l: l.slice(0, 70) }); break; }
  pos += l.length + 1;
}

console.log("posição no template · o que é · quem\n");
const vistos = new Set();
for (const a of achados) {
  const chave = a.tipo + a.o;
  if (vistos.has(chave)) continue;
  vistos.add(chave);
  console.log(String(a.pos).padStart(6) + "  " + a.tipo.padEnd(9) + "  " + a.o.padEnd(24) + "  " + a.l.replace(/\s+/g, " ").trim().slice(0, 55));
}

const primeiraVolatil = achados.find((a) => a.tipo === "VOLÁTIL");
console.log(`\nA PRIMEIRA TESOURA está em ${primeiraVolatil.pos} de ${corpo.length} do template (${Math.round(primeiraVolatil.pos / corpo.length * 100)}%).`);
console.log(`Tudo depois dela — ${corpo.length - primeiraVolatil.pos} caracteres de template — deixa de ser cacheável por causa dela.`);

const nVolateis = new Set(achados.filter((a) => a.tipo === "VOLÁTIL").map((a) => a.o)).size;
console.log(`\n${nVolateis} interpolações voláteis distintas, espalhadas por ${achados.filter((a) => a.tipo === "VOLÁTIL").length} linhas.`);
