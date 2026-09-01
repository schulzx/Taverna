import {
  PESO_AMEACA, pesoDe, multiplicadorDeGrupo, capacidadeDoGrupo, VALOR_COMPANHEIRO,
  FAIXAS, faixaDe, avaliarEncontro, quantosPara, selo,
  ORCAMENTO_DIA, garantirDia, gastarDoDia, zerarDia, folgaDoDia, resumoOrcamentoPrompt,
} from "../src/orcamento.js";
import { completarInimigo, CRIATURAS_FANTASIA } from "../src/bestiario.js";

let falhas = 0;
const ok = (c, t) => { if (!c) { falhas++; console.log("  FALHA:", t); } else console.log("  ok:", t); };
const heroi = (nivel, comps = 0) => ({ nivel, grupo: Array.from({ length: comps }, (_, i) => ({ nome: "C" + i, vida: 10 })) });
const bicho = (nome, nivelJ) => completarInimigo({ nome }, nivelJ);

console.log("\n[1. O PESO VEM DA MESMA ESCALA DO COMBATE]");
ok(PESO_AMEACA.fraco === 0.35 && PESO_AMEACA.lendario === 2.6, "os multiplicadores são os mesmos que combate.js usa para PV");
ok(pesoDe({ ameaca: "lendario" }, 10) > pesoDe({ ameaca: "elite" }, 10), "lendário pesa mais que elite");
ok(pesoDe({ ameaca: "fraco" }, 10) < pesoDe({ ameaca: "comum" }, 10), "e fraco pesa menos que comum");
ok(pesoDe({}, 5) === pesoDe({ ameaca: "comum" }, 5), "sem ameaça declarada, conta como comum");
const acima = pesoDe({ ameaca: "comum", nivel: 15 }, 5);
const abaixo = pesoDe({ ameaca: "comum", nivel: 1 }, 5);
ok(acima > abaixo, "nível acima do herói pesa mais que nível abaixo");
ok(acima / abaixo < 1.7, `mas o ajuste é SUAVE (${(acima / abaixo).toFixed(2)}×) — o PV já escala pelo nível do herói, dobrar a conta aqui seria contar duas vezes`);
console.log("  divino: " + [0, 1, 2, 3, 4].map((g) => `GD${g}=${pesoDe({ ameaca: "comum", gd: g }, 10).toFixed(1)}`).join("  ") + `  (lendário mortal = ${pesoDe({ ameaca: "lendario" }, 10).toFixed(1)})`);
ok(pesoDe({ ameaca: "comum", gd: 1 }, 10) > pesoDe({ ameaca: "lendario" }, 10), "grau divino rompe a escala mortal: até o GD 1 pesa mais que qualquer lendário");
ok(pesoDe({ ameaca: "comum", gd: 2 }, 10) / pesoDe({ ameaca: "comum", gd: 1 }, 10) > 2, "cada grau mais que dobra");
ok(pesoDe({ ameaca: "comum", gd: 4 }, 10) > 20, "um GD 4 vale mais de vinte heróis — luta que só existe no fim do rito");
ok(pesoDe({ ameaca: "fraco", gd: 3 }, 10) === pesoDe({ ameaca: "lendario", gd: 3 }, 10), "divindade tem piso: a ameaça mortal dela deixa de importar");
ok(pesoDe({ ameaca: "comum", gd: 99 }, 10) === pesoDe({ ameaca: "comum", gd: 4 }, 10), "GD absurdo é aparado em 4");

console.log("\n[2. NÚMERO PESA MAIS QUE SOMA]");
console.log("  " + [1, 2, 3, 6, 8, 12].map((n) => `${n}→×${multiplicadorDeGrupo(n)}`).join("  "));
ok(multiplicadorDeGrupo(1) === 1, "um inimigo não ganha bônus");
ok(multiplicadorDeGrupo(3) > multiplicadorDeGrupo(2), "o salto grande está entre 2 e 3 — é onde a economia de ação vira");
ok(multiplicadorDeGrupo(12) === 2.5, "e satura em 2.5");
ok(multiplicadorDeGrupo(0) === 1 && multiplicadorDeGrupo(-5) === 1, "entrada absurda não quebra");

console.log("\n[3. A CAPACIDADE DO GRUPO]");
ok(capacidadeDoGrupo(heroi(10, 0)) === 1, "sozinho, o herói vale 1");
ok(capacidadeDoGrupo(heroi(10, 2)) === 1 + 2 * VALOR_COMPANHEIRO, "cada companheiro soma 0.6 — menos que um herói, porque não tem heroísmo nem perícia");
ok(capacidadeDoGrupo({ nivel: 5, grupo: [{ nome: "morto", vida: 0 }] }) === 1, "companheiro caído não conta para a capacidade");
ok(capacidadeDoGrupo(null) === 1, "personagem nulo não quebra");

console.log("\n[4. A AVALIAÇÃO — o caso que motivou tudo]");
const p12 = heroi(12, 1);
const tresOgros = [bicho("Ogro", 12), bicho("Ogro", 12), bicho("Ogro", 12)];
const av = avaliarEncontro(tresOgros, p12);
console.log(`  três ogros contra nível 12 com 1 companheiro: ${selo(av)}`);
console.log(`  peso bruto ${av.bruto} × ${av.mult} = ${av.ajustado} contra capacidade ${av.capacidade} → razão ${av.razao}`);
ok(av.faixa.id !== "trivial", "três ogros NÃO são aquecimento — que era exatamente a pergunta sem resposta");
ok(av.quantos === 3 && av.mult === 1.5, "conta os três e aplica o multiplicador de grupo");
const umOgro = avaliarEncontro([bicho("Ogro", 12)], p12);
ok(umOgro.razao < av.razao, "um ogro é bem mais fácil que três");
ok(av.razao / umOgro.razao > 3, "e a diferença é MAIOR que 3× — é o multiplicador fazendo o trabalho dele");
ok(avaliarEncontro([], p12) === null, "sem inimigos, não há encontro");
ok(avaliarEncontro([{ nome: "x", derrotado: true }], p12) === null, "inimigo já derrotado não conta");
ok(avaliarEncontro(null, p12) === null, "lista nula não quebra");

console.log("\n[5. AS FAIXAS FAZEM SENTIDO ENTRE SI]");
const faixaDe3 = (nome) => avaliarEncontro([bicho(nome, 12), bicho(nome, 12), bicho(nome, 12)], p12).faixa.id;
for (const n of ["Rato Gigante", "Bandido", "Ogro", "Gigante", "Dragão Ancião"]) {
  const a = avaliarEncontro([bicho(n, 12)], p12);
  console.log(`  1× ${n.padEnd(14)} → ${a.faixa.rotulo.padEnd(8)} (razão ${a.razao})`);
}
const escada = ["Rato Gigante", "Bandido", "Ogro", "Gigante", "Dragão Ancião"].map((n) => avaliarEncontro([bicho(n, 12)], p12).razao);
ok(escada.every((v, i) => i === 0 || v >= escada[i - 1]), "a escada de criaturas é monotônica — nada de bicho fraco pesando mais que um forte");
ok(faixaDe(0.1).id === "trivial" && faixaDe(1.0).id === "medio" && faixaDe(5).id === "mortal", "os limiares mapeiam como o esperado");
ok(FAIXAS.every((f) => f.icone && f.rotulo && f.nota), "toda faixa tem ícone, rótulo e uma frase que explica o que ela quer dizer");

console.log("\n[6. O CAMINHO INVERSO — quantos para tal dificuldade]");
for (const alvo of ["facil", "medio", "dificil", "mortal"]) {
  const n = quantosPara(bicho("Goblin", 12), p12, alvo);
  const conf = avaliarEncontro(Array.from({ length: n }, () => bicho("Goblin", 12)), p12);
  console.log(`  ${alvo.padEnd(8)} → ${n}× Goblin  (saiu ${conf.faixa.rotulo})`);
  ok(n >= 1, `${alvo}: nunca devolve zero inimigo`);
}
const nMortal = quantosPara(bicho("Goblin", 12), p12, "mortal");
const nFacil = quantosPara(bicho("Goblin", 12), p12, "facil");
ok(nMortal > nFacil, "mortal pede mais goblins que fácil");
ok(quantosPara(bicho("Dragão Ancião", 12), p12, "facil") === 1, "não dá para deixar um Dragão Ancião fácil — devolve 1, não zero");
ok(quantosPara(bicho("Goblin", 12), p12, "faixa_inventada") >= 1, "faixa desconhecida cai no médio e não quebra");

console.log("\n[7. O DIA DE AVENTURA]");
ok(ORCAMENTO_DIA === 4, "quatro encontros médios por dia — menos que o 5e porque o grupo aqui é pequeno e solo");
let dia = zerarDia();
ok(folgaDoDia(dia).estado === "inteiro", "o dia começa inteiro");
dia = gastarDoDia(dia, 1.0);
ok(dia.lutas === 1 && dia.gasto === 1, "uma luta média gasta uma unidade");
ok(folgaDoDia(dia).estado === "inteiro", "com 1 de 4, ainda está inteiro");
dia = gastarDoDia(dia, 1.5);
ok(folgaDoDia(dia).estado === "gasto", "com 2.5 de 4, está gasto");
dia = gastarDoDia(dia, 1.2);
ok(folgaDoDia(dia).estado === "no osso", "com 3.7 de 4, está no osso");
dia = gastarDoDia(dia, 2);
ok(folgaDoDia(dia).estado === "estourado" && folgaDoDia(dia).restante === 0, "passou de 4: estourado, e a folga não fica negativa");
ok(zerarDia().gasto === 0 && zerarDia().lutas === 0, "a noite zera tudo");
ok(garantirDia(null).gasto === 0 && garantirDia({ gasto: -5 }).gasto === 0, "estado corrompido é aparado");

console.log("\n[8. O QUE O MESTRE RECEBE]");
const r1 = resumoOrcamentoPrompt(av, zerarDia());
const r2 = resumoOrcamentoPrompt(av, gastarDoDia(gastarDoDia(gastarDoDia(gastarDoDia(zerarDia(), 1.5), 1.5), 1.5), 1.5));
console.log("  " + r1.slice(0, 150));
ok(/Calibre a NARRAÇÃO/.test(r1), "a faixa vai ao Mestre para a prosa combinar com o perigo");
ok(!/razão|\d\.\d/.test(r1), "mas os NÚMEROS não vão — número na boca do Mestre vira número na cena");
ok(/esgotamento/.test(r2), "com o dia estourado, ele é instruído a mostrar o desgaste");
ok(resumoOrcamentoPrompt(null, zerarDia()) === "", "sem encontro, nada no prompt");
ok(r1.length < 600, `curto: ${r1.length} caracteres`);

console.log("\n[9. TODO O BESTIÁRIO PASSA PELA CONTA]");
const semAmeaca = CRIATURAS_FANTASIA.filter((c) => !PESO_AMEACA[c.ameaca]);
ok(semAmeaca.length === 0, `nenhuma das ${CRIATURAS_FANTASIA.length} criaturas tem ameaça fora da escala`);
ok(CRIATURAS_FANTASIA.every((c) => avaliarEncontro([bicho(c.nome, 8)], heroi(8)).faixa), "toda criatura do bestiário recebe uma faixa");

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
