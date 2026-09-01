import { gerarGeografia } from "../src/geografia.js";
import { garantirDivindade, grauDe, tituloDe } from "../src/divindades.js";
import { garantirDevocao, fieisTotais, processarDiaFe, depositarFieis, erguerTemplo, feDaCidade, estadoFe, resumoNumerico } from "../src/devocao.js";

const geo = gerarGeografia("taverna|Nova");
const mapa = { cidades: geo.cidades, faccoes: [], rotas: geo.rotas, regioes: geo.regioes };
const cap = mapa.cidades.find((c) => c.porte === "capital");
const aldeia = [...mapa.cidades].sort((a, b) => a.populacao - b.populacao)[0];
console.log("capital:", cap.nome, cap.populacao, "| menor:", aldeia.nome, aldeia.populacao);

/* JOGO NOVO: desperta com 50 fiéis na capital */
let dv = garantirDivindade({ despertar: true, fieis: 0, pf: 0, panteao: [] });
let dev = garantirDevocao(null, mapa, dv);
console.log("\n[jogo novo] fiéis:", fieisTotais(mapa, dev));

let d = depositarFieis(dev, mapa, cap.nome, 50, 1).devocao;
console.log("[despertar] 50 fiéis em", cap.nome, "->", feDaCidade(d, cap.nome).toFixed(2) + "%", "total:", fieisTotais(mapa, d));

/* TRANSBORDO: milagre gigante numa aldeia pequena */
const dep = depositarFieis(d, mapa, aldeia.nome, 5000, 2);
console.log("\n[transbordo] 5000 fiéis em", aldeia.nome, `(pop ${aldeia.populacao})`);
console.log("  devoção:", feDaCidade(dep.devocao, aldeia.nome) + "%", "| sobra p/ andarilhos:", dep.sobra, "| total mundo:", fieisTotais(mapa, dep.devocao), "(esperado ~5050)");
console.log("  virada:", dep.estadoAntes.rotulo, "->", dep.estadoDepois.rotulo);

/* CAMPANHA LONGA: 6 meses com templo na capital + presença ocasional */
let d2 = erguerTemplo(dep.devocao, cap.nome, 3).devocao;
let marcosTot = [], pf = 0;
for (let dia = 3; dia < 183; dia++) {
  const onde = dia % 30 < 10 ? cap.nome : "";       // o herói passa 1/3 do tempo na capital
  const p = processarDiaFe({ mapa, devocao: d2, divindade: { ...dv, ultimoFeitoDia: onde ? dia : dv.ultimoFeitoDia || 0 }, dia, cidadeAtual: onde });
  d2 = p.devocao; pf += p.pf; marcosTot.push(...p.marcos);
  if (dia === 60) d2 = erguerTemplo(d2, cap.nome, dia).devocao;   // vira Templo
}
console.log("\n[6 meses] fiéis:", fieisTotais(mapa, d2), "| PF dos templos:", pf);
console.log("  capital:", feDaCidade(d2, cap.nome).toFixed(1) + "%", estadoFe(cap, d2).rotulo);
console.log("  aldeia :", feDaCidade(d2, aldeia.nome).toFixed(1) + "%", estadoFe(aldeia, d2).rotulo);
console.log("  marcos disparados:", marcosTot.length);
marcosTot.slice(0, 6).forEach((m) => console.log("   -", m.texto));
console.log("  resumo:", JSON.stringify(resumoNumerico(mapa, d2)));
console.log("  GD do herói com esses fiéis:", grauDe({ ...dv, fieis: fieisTotais(mapa, d2) }), tituloDe(grauDe({ ...dv, fieis: fieisTotais(mapa, d2) })));

/* ABANDONO: 6 meses sem o herói e sem novos templos */
let d3 = d2;
for (let dia = 183; dia < 363; dia++) d3 = processarDiaFe({ mapa, devocao: d3, divindade: dv, dia, cidadeAtual: "" }).devocao;
console.log("\n[6 meses sumido] fiéis:", fieisTotais(mapa, d3), "| capital (com templo):", feDaCidade(d3, cap.nome).toFixed(1) + "%", "| aldeia (sem):", feDaCidade(d3, aldeia.nome).toFixed(1) + "%");
