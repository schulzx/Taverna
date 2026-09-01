/* O ESTADO DA LUTA SOBREVIVE À RECONSTRUÇÃO (v9.20)

   `processarCombate` devolve um objeto NOVO a cada turno. Até a v9.20 ela
   carregava só a economia — e o efeito colateral passou despercebido por
   versões: a ORDEM DE INICIATIVA morria junto, e o bloco que a rola só
   dispara quando `!combate.ordem`. Resultado: a iniciativa era RE-ROLADA a
   cada resposta do Mestre que tocasse no combate, e a luta trocava de ordem
   no meio sem ninguém notar — a linha nova parecia só mais uma mensagem.

   Só apareceu porque o terreno das zonas sumia junto, e terreno que some dá
   na vista. Este arquivo existe para o bug não voltar em silêncio. */

import { processarCombate } from "../src/regras-jogo.js";

let falhas = 0;
const ok = (c, t) => { if (!c) { falhas++; console.log("  FALHA:", t); } else console.log("  ok:", t); };

const antes = {
  inimigos: [{ nome: "Ogro", vida: 50, vidaMax: 50, derrotado: false, zona: 2 }],
  economia: { acao: 0, extra: 1, movimento: 0 },
  ordem: [{ nome: "Vera", valor: 18 }, { nome: "Ogro", valor: 7 }],
  rodada: 3,
  recursos: { algo: true },
  aval: { faixa: { id: "dificil", rotulo: "Difícil" } },
  grade: { cenario: "taverna", largura: 12, altura: 9, paredes: [], estorvos: [] },
  heroi: { nome: "Vera", x: 3, y: 7 },
  aliados: [{ nome: "Brisa", x: 4, y: 7 }],
  log: ["linha antiga"],
};

console.log("\n[1. O QUE MUDA, MUDA]");
const msgs = [];
const dep = processarCombate(antes, { combate_inimigo_vida: [{ nome: "Ogro", vida: -10 }] }, msgs);
ok(dep.inimigos[0].vida === 40, "o dano é aplicado");
ok(dep.inimigos[0].zona === 2, "e a zona do inimigo atravessa com ele");

console.log("\n[2. O QUE DESCREVE A LUTA SOBREVIVE]");
ok(dep.ordem && dep.ordem.length === 2, "a ORDEM DE INICIATIVA sobrevive — era o bug de verdade");
ok(dep.ordem[0].nome === "Vera", "e sobrevive intacta, não recriada");
ok(dep.rodada === 3, "a rodada sobrevive");
ok(dep.economia.acao === 0, "a economia sobrevive (já sobrevivia antes)");
ok(dep.recursos && dep.recursos.algo, "os recursos do turno sobrevivem");
ok(dep.aval && dep.aval.faixa.id === "dificil", "o peso do encontro sobrevive");
ok(dep.grade && dep.grade.largura === 12, "a grade sobrevive");
ok(dep.heroi && dep.heroi.x === 3 && dep.heroi.y === 7, "e a posição do herói também");
ok(dep.aliados && dep.aliados.length === 1 && dep.aliados[0].nome === "Brisa", "e a dos companheiros");
ok(dep.log && dep.log[0] === "linha antiga", "o log sobrevive");

console.log("\n[3. COMBATE NOVO NASCE LIMPO]");
const zero = processarCombate(null, { combate_iniciar: [{ nome: "Lobo" }], __nivelJogador: 5 }, []);
ok(zero.economia.acao === 1, "economia nova");
ok(zero.ordem === undefined, "sem ordem — é isso que faz a iniciativa ser rolada UMA vez, na abertura");
ok(zero.grade === undefined, "sem terreno até o app montar um");

console.log("\n[4. VÁRIOS TURNOS SEGUIDOS NÃO EROdEM O ESTADO]");
let atual = antes;
for (let i = 0; i < 5; i++) atual = processarCombate(atual, { combate_inimigo_vida: [{ nome: "Ogro", vida: -1 }] }, []);
ok(atual.ordem && atual.ordem.length === 2 && atual.grade && atual.heroi && atual.heroi.x === 3 && atual.aliados.length === 1,
   "depois de cinco reconstruções, ordem, terreno e posição continuam lá");
ok(atual.inimigos[0].vida === 45, "e o dano acumulou certo (50 − 5)");

console.log("\n[5. ENCERRAR CONTINUA ENCERRANDO]");
ok(processarCombate(antes, { combate_encerrar: true }, []) === null, "encerrar devolve null, como sempre");
const todosMortos = processarCombate({ inimigos: [{ nome: "X", vida: 0, derrotado: true }] }, {}, []);
ok(todosMortos === null, "todos caídos encerra sozinho");

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
