import {
  dadoDeVida, garantirDadosVida, dadosDisponiveis, gastarDadoDeVida,
  podeDescansoLongo, aplicarCurto, aplicarLongo, resumoDescansoPrompt,
  FRACAO_MANA_CURTO,
} from "../src/descanso.js";
import { aplicarDescanso, migrarPersonagem } from "../src/regras-jogo.js";
import { CLASSES } from "../src/classes.js";

let falhas = 0;
const ok = (c, t) => { if (!c) { falhas++; console.log("  FALHA:", t); } else console.log("  ok:", t); };
const fixo = (v) => () => v;   // "sorte" determinística: sempre o mesmo dado

console.log("\n[1. O DADO VEM DA CLASSE]");
for (const c of CLASSES) console.log(`  ${c.nome.padEnd(12)} PV base ${String(c.vidaBase).padStart(2)} → d${dadoDeVida(c.vidaBase)}`);
ok(dadoDeVida(CLASSES.find((c) => c.nome === "Guerreiro").vidaBase) === 12, "o Guerreiro (14 de base) cura com d12");
ok(dadoDeVida(CLASSES.find((c) => c.nome === "Mago").vidaBase) === 6, "o Mago (8 de base) cura com d6");
ok(dadoDeVida(undefined) === 8, "classe sem base cai num d8, não quebra");
ok(CLASSES.every((c) => [6, 8, 10, 12].includes(dadoDeVida(c.vidaBase))), "nenhuma classe cai fora da escala");

console.log("\n[2. QUANTOS DADOS EXISTEM]");
ok(garantirDadosVida({ nivel: 7 }).total === 7, "um por nível");
ok(garantirDadosVida({ nivel: 7, dadosVida: { gastos: 3 } }).gastos === 3, "os gastos vêm da ficha");
ok(garantirDadosVida({ nivel: 5, dadosVida: { gastos: 99 } }).gastos === 5, "gastos corrompidos são aparados no total");
ok(garantirDadosVida({ nivel: 5, dadosVida: { gastos: -2 } }).gastos === 0, "e negativo vira 0");
ok(garantirDadosVida({}).total === 1, "ficha sem nível tem pelo menos um dado");

console.log("\n[3. GASTAR — cura de verdade, recurso de verdade]");
const ferido = { nivel: 6, vida: 20, vidaMax: 60, dadosVida: { total: 6, gastos: 0 } };
const g1 = gastarDadoDeVida(ferido, { lados: 8, modVigor: 2, sorte: fixo(0.5) });
console.log("  " + g1.texto);
ok(g1.ok && g1.rolado === 5 && g1.cura === 7, "d8 → 5, mais Vigor 2 = 7 PV");
ok(g1.pers.vida === 27 && g1.pers.dadosVida.gastos === 1, "o PV sobe e o dado some");
const teto = gastarDadoDeVida({ ...ferido, vida: 58 }, { lados: 8, modVigor: 2, sorte: fixo(0.99) });
ok(teto.pers.vida === 60 && teto.cura === 2, "não passa do PV máximo, e a cura relatada é a REAL");
const fraco = gastarDadoDeVida(ferido, { lados: 6, modVigor: -5, sorte: fixo(0) });
ok(fraco.cura === 1, "Vigor negativo não faz um dado gasto curar zero — piso 1, senão é castigo");
const semDados = gastarDadoDeVida({ ...ferido, dadosVida: { total: 6, gastos: 6 } }, { lados: 8 });
ok(!semDados.ok && /descanso longo/.test(semDados.motivo), `sem dados explica onde conseguir mais: "${semDados.motivo}"`);
const jaCheio = gastarDadoDeVida({ ...ferido, vida: 60 }, { lados: 8 });
ok(!jaCheio.ok && /PV cheio/.test(jaCheio.motivo), "não deixa queimar dado à toa");

console.log("\n[4. UM LONGO POR DIA]");
ok(podeDescansoLongo({ ultimoLongo: null }, 10).pode, "quem nunca dormiu pode");
ok(!podeDescansoLongo({ ultimoLongo: 10 }, 10).pode, "duas noites inteiras no mesmo dia, não");
ok(podeDescansoLongo({ ultimoLongo: 10 }, 11).pode, "no dia seguinte, sim");
ok(/duas vezes no mesmo dia/.test(podeDescansoLongo({ ultimoLongo: 3 }, 3).motivo), "e o motivo é legível");
ok(podeDescansoLongo({}, 0).pode, "ficha sem o campo pode — save antigo não acorda bloqueado");
/* o furo que o teste de mesa pegou: a noite longa AVANÇA o dia, então marcar
   o dia em que se deitou deixa a regra sempre liberada. O App marca o dia em
   que o herói ACORDA — é isso que faz o teto morder. */
{
  let dia = 36;
  let p = { ultimoLongo: null };
  /* primeira noite: dorme no 36, acorda no 37 e marca 37 */
  ok(podeDescansoLongo(p, dia).pode, "noite 1 no dia 36: liberada");
  dia += 1; p = { ...aplicarLongo(p, dia).pers };
  ok(p.ultimoLongo === 37, "acordou no 37 e é o 37 que fica marcado");
  ok(!podeDescansoLongo(p, dia).pode, "acampar de novo ANTES do próximo amanhecer: barrado");
  dia += 1;
  ok(podeDescansoLongo(p, dia).pode, "e no dia seguinte volta a liberar");
}

console.log("\n[5. O CURTO]");
const gasto = { nivel: 6, vida: 20, vidaMax: 60, mana: 10, manaMax: 40, dadosVida: { total: 6, gastos: 2 }, grupo: [{ nome: "Brisa", vida: 5, vidaMax: 40 }] };
const c1 = aplicarCurto(gasto);
console.log("  " + c1.msgs[0]);
ok(c1.pers.vida === 20, "o curto NÃO cura PV sozinho — essa é a mudança inteira");
ok(c1.pers.mana === 10 + Math.ceil(40 * FRACAO_MANA_CURTO), "devolve um quarto da mana");
ok(c1.pers.grupo[0].vida === 15, "o grupo cura uma fração fixa — a ficha deles não é planilha do jogador");
ok(c1.pers.dadosVida.gastos === 2, "e não devolve dado nenhum");
ok(/você tem 4/.test(c1.msgs[0]), "a mensagem diz quantos dados sobraram");

console.log("\n[6. O LONGO]");
const l1 = aplicarLongo(gasto, 12);
l1.msgs.forEach((m) => console.log("  " + m));
ok(l1.pers.vida === 60 && l1.pers.mana === 40, "PV e PM cheios");
ok(l1.pers.grupo[0].vida === 40, "o grupo também");
ok(l1.pers.dadosVida.gastos === 0, "2 gastos, devolve 3 (metade de 6) → volta a zero");
ok(l1.pers.ultimoLongo === 12, "e o dia fica marcado");
const muitoGasto = aplicarLongo({ ...gasto, dadosVida: { total: 6, gastos: 6 } }, 12);
ok(muitoGasto.pers.dadosVida.gastos === 3, "quem queimou os 6 recupera 3 — uma noite não apaga um dia inteiro");
const nivel1 = aplicarLongo({ nivel: 1, vida: 1, vidaMax: 10, mana: 0, manaMax: 4, dadosVida: { total: 1, gastos: 1 } }, 5);
ok(nivel1.pers.dadosVida.gastos === 0, "no nível 1 a metade seria 0 — o mínimo de 1 salva");

console.log("\n[7. INTEGRAÇÃO COM aplicarDescanso — condições continuam no lugar]");
const comCond = { nivel: 6, vida: 20, vidaMax: 60, mana: 10, manaMax: 40, dadosVida: { total: 6, gastos: 1 }, grupo: [], condicoes: [{ id: "sangrando", nome: "Sangrando" }] };
const msgs = [];
const dep = aplicarDescanso(comCond, "curto", msgs, 4);
ok(dep.vida === 20, "pelo curto, o PV continua onde estava");
ok(msgs.some((m) => /Descanso curto/.test(m)), "a mensagem do curto aparece");
const msgs2 = [];
const dep2 = aplicarDescanso(comCond, "longo", msgs2, 4);
ok(dep2.vida === 60 && dep2.ultimoLongo === 4, "pelo longo, cura e marca o dia");
ok(Array.isArray(dep2.condicoes), "as condições continuam sendo tratadas pelo catálogo");

console.log("\n[8. MIGRAÇÃO — ninguém é punido por uma regra que não existia]");
const antigo = migrarPersonagem({ nome: "Vera", classe: "Mago", nivel: 12, vida: 51, vidaMax: 72 });
ok(antigo.dadosVida.total === 12 && antigo.dadosVida.gastos === 0, "save antigo acorda com todos os dados na mão");
ok(antigo.ultimoLongo === null, "e sem noite marcada — a primeira não pode chegar bloqueada");
ok(antigo.dadosVidaVersao === 1, "marca a versão");
const remig = migrarPersonagem({ ...antigo, dadosVida: { total: 12, gastos: 7 }, ultimoLongo: 40 });
ok(remig.dadosVida.gastos === 7 && remig.ultimoLongo === 40, "migrar de novo não devolve dado nem apaga a noite");

console.log("\n[9. O QUE O MESTRE RECEBE]");
const cheio2 = resumoDescansoPrompt({ nivel: 10, dadosVida: { total: 10, gastos: 0 } }, 5);
const noOsso = resumoDescansoPrompt({ nivel: 10, dadosVida: { total: 10, gastos: 10 }, ultimoLongo: 5 }, 5);
console.log("  inteiro: " + cheio2.slice(0, 120));
console.log("  no osso: " + noOsso.slice(0, 160));
ok(/lenha para queimar/.test(cheio2), "com fôlego, o Mestre sabe que dá para apertar");
ok(/no limite/.test(noOsso) && /já dormiu/.test(noOsso), "sem fôlego, ele sabe o tamanho do desgaste");
ok(/Nunca invente cura/.test(cheio2), "e é proibido de conceder descanso por narração");
ok(cheio2.length < 500, `curto: ${cheio2.length} caracteres`);

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
