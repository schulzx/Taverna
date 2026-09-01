import { gerarGeografia } from "../src/geografia.js";
import { garantirDivindade, grauDe } from "../src/divindades.js";
import {
  garantirDevocao, fieisTotais, processarDiaFe, depositarFieis, erguerTemplo,
  podeErguerTemplo, resumoFePrompt, estadoFe, feDaCidade, resumoNumerico,
  espalharFieis, perderFieis, alvosFelicidade, temploDaCidade,
} from "../src/devocao.js";
import { processarDiaReino, garantirReino } from "../src/reino.js";
import { rendaDominios, rendaDiariaTotal } from "../src/gestao.js";

const geo = gerarGeografia("taverna|Testa");
const mapa = { cidades: geo.cidades, faccoes: [], continente: geo.continente, regioes: geo.regioes, rotas: geo.rotas };
console.log("cidades:", mapa.cidades.length, "rotas:", mapa.rotas.length, "pop total:", mapa.cidades.reduce((s, c) => s + c.populacao, 0));

/* 1. MIGRAÇÃO: save veterano com 40.000 fiéis soltos */
let dv = garantirDivindade({ despertar: true, fieis: 40000, pf: 30, panteao: [] });
let dev = garantirDevocao(null, mapa, dv);
const totalMigrado = fieisTotais(mapa, dev);
console.log("\n[migração] fiéis antes:", dv.fieis, "| depois de ancorar:", totalMigrado, "| andarilhos:", dev.andarilhos);
console.log("  perda na migração:", dv.fieis - totalMigrado, "(deve ser ~0)");
dv = { ...dv, fieis: totalMigrado };

/* 2. DIA A DIA sem templo: deve minguar */
let d1 = dev, pfTot = 0;
for (let i = 0; i < 30; i++) {
  const p = processarDiaFe({ mapa, devocao: d1, divindade: dv, dia: i, cidadeAtual: mapa.cidades[0].nome });
  d1 = p.devocao; pfTot += p.pf;
}
console.log("\n[30 dias sem templo] fiéis:", fieisTotais(mapa, d1), "| PF de templos:", pfTot);
console.log("  cidade onde o herói está:", mapa.cidades[0].nome, feDaCidade(d1, mapa.cidades[0].nome).toFixed(1) + "%", "(antes:", feDaCidade(dev, mapa.cidades[0].nome).toFixed(1) + "%)");

/* 3. TEMPLO num domínio */
mapa.cidades[1].relacao = "jogador";
const chkPobre = podeErguerTemplo({ cidade: mapa.cidades[1], devocao: dev, divindade: dv, cofre: 10 });
const chkRico = podeErguerTemplo({ cidade: mapa.cidades[1], devocao: dev, divindade: dv, cofre: 900 });
console.log("\n[construir] cofre 10:", chkPobre.pode, "-", chkPobre.motivo, "| cofre 900:", chkRico.pode, chkRico.alvo && chkRico.alvo.nome);
let d2 = erguerTemplo(dev, mapa.cidades[1].nome, 1).devocao;
const feDepoisObra = feDaCidade(d2, mapa.cidades[1].nome);
for (let i = 0; i < 60; i++) d2 = processarDiaFe({ mapa, devocao: d2, divindade: dv, dia: i, cidadeAtual: "" }).devocao;
console.log("  ", mapa.cidades[1].nome, "após obra:", feDepoisObra.toFixed(1) + "%", "| após 60 dias:", feDaCidade(d2, mapa.cidades[1].nome).toFixed(1) + "%");
console.log("   vizinhos por rota (contágio):", (mapa.rotas.filter((r) => r.de === mapa.cidades[1].nome || r.para === mapa.cidades[1].nome).map((r) => (r.de === mapa.cidades[1].nome ? r.para : r.de))).map((n) => `${n} ${feDaCidade(d2, n).toFixed(1)}%`).join(", "));

/* 4. MARCOS de patamar */
let d3 = espalharFieis(garantirDevocao(null, mapa, garantirDivindade(null)), mapa, 0);
d3 = depositarFieis(d3, mapa, mapa.cidades[2].nome, Math.round(mapa.cidades[2].populacao * 0.34), 1).devocao;
const passo = processarDiaFe({ mapa, devocao: d3, divindade: dv, dia: 2, cidadeAtual: mapa.cidades[2].nome });
console.log("\n[marcos]", passo.marcos.map((m) => m.texto).join(" | ") || "(nenhum)");

/* 5. ESTADOS e heresia */
console.log("\n[estados]");
for (const c of mapa.cidades.slice(0, 6)) {
  console.log(`  ${c.nome.padEnd(18)} ${String(Math.round(feDaCidade(d2, c.nome))).padStart(3)}% -> ${estadoFe(c, d2).rotulo}`);
}

/* 6. ECONOMIA: renda com devoção */
mapa.cidades[1].sede = true;
console.log("\n[renda] sem devoção:", rendaDiariaTotal(mapa, 2, true).toFixed(0), "| com devoção:", rendaDiariaTotal(mapa, 2, true, d2).toFixed(0));
const r0 = garantirReino({}, mapa);
const alvos = alvosFelicidade(mapa, d2);
console.log("[felicidade] alvos com templo:", JSON.stringify(alvos));
let rr = r0;
for (let i = 0; i < 40; i++) rr = processarDiaReino(rr, mapa, alvos).reino;
console.log("  felicidade após 40 dias:", JSON.stringify(rr));

/* 7. PERDER e PROMPT */
const d4 = perderFieis(d2, mapa, 5000);
console.log("\n[perder 5000] antes:", fieisTotais(mapa, d2), "depois:", fieisTotais(mapa, d4));
console.log("\n[resumo numérico]", JSON.stringify(resumoNumerico(mapa, d2)));
console.log("\n[prompt]\n" + resumoFePrompt(mapa, d2, { ...dv, panteao: [{ nome: "Vharoth", gd: 3, icone: "⛈", dominio: "das Tempestades", culto: "a Ordem de Vharoth" }] }));
