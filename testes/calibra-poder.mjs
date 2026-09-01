/* A CALIBRAÇÃO. Os pesos do índice não podem ser escolhidos por gosto:
   o pedido deu dois âncoras — "um lvl 5 tem 400 ou 500, um lvl 20 tem
   50k" — e eles são a régua. Aqui monta-se uma ficha TÍPICA de cada
   patamar, com o equipamento que aquele patamar costuma ter, e mede-se.

   Também se mede o extremo de baixo (pelado, mal distribuído) e o de
   cima (lendário inteiro, dádivas), porque o pedido diz que os âncoras
   valem "dependendo de seus status e seus itens, podendo ser menos que
   isso ou bem mais" — e uma faixa que não se abre não cumpre isso. */

const S = "../src/";
const P = await import(S + "poder.js");
const { gerarLoot } = await import(S + "loot.js");

const SLOTS = ["arma", "armadura", "elmo", "botas", "anel", "amuleto", "escudo"];

/* a raridade que o patamar costuma vestir */
const raridadeDoNivel = (n) => (n < 4 ? "comum" : n < 8 ? "incomum" : n < 13 ? "raro" : n < 18 ? "epico" : "lendario");

const ABAIXO = { lendario: "epico", epico: "raro", raro: "incomum", incomum: "comum", comum: "comum" };

/* Um herói real não veste sete peças do topo do patamar dele: veste
   algumas do topo e o resto de um degrau abaixo. Calibrar contra o
   conjunto perfeito faria o "típico" ser o melhor caso, e aí o âncora
   estaria medindo outra coisa. */
function equipar(nivel, raridade, { perfeito = false } = {}) {
  const eq = {};
  SLOTS.forEach((s, i) => {
    const r = perfeito || i % 2 === 0 ? raridade : ABAIXO[raridade];
    eq[s] = gerarLoot(r, { tipo: s, nivel });
  });
  return eq;
}

/* atributos como a ficha os teria: 9 de partida, 2 por nível, concentrados
   como um jogador concentra (metade no atributo da estrada) */
function atributosDe(nivel) {
  const pontos = 9 + 2 * (nivel - 1);
  const chave = Math.min(Math.max(3, 3 + Math.floor(nivel / 3)), 12);
  const resto = Math.max(0, pontos - chave);
  const cada = Math.floor(resto / 5);
  return { destreza: chave, forca: cada, vigor: cada, intelecto: cada, presenca: cada, percepcao: resto - cada * 4 };
}

function ficha(nivel, { raridade = null, pelado = false, dadivas = 0, gd = 0, habs = null } = {}) {
  return {
    nome: "H", nivel,
    atributos: atributosDe(nivel),
    equipados: pelado ? {} : equipar(nivel, raridade || raridadeDoNivel(nivel), { perfeito: !!raridade }),
    habilidades: Array.from({ length: habs == null ? Math.max(0, nivel - 1) : habs }, (_, i) => ({ nome: "h" + i })),
    subclasse: nivel >= 3 ? "Batedora" : "", especializacao: nivel >= 6 ? "Caçadora" : "",
    dadivas: Array.from({ length: dadivas }, (_, i) => "d" + i),
    gd, grupo: [],
  };
}

const linha = (rot, p) => `${rot.padEnd(30)} ${String(P.formatarPoder(p.total)).padStart(10)}   ×${p.mult.toFixed(2)}   base ${String(p.base).padStart(6)}`;

console.log("=".repeat(78));
console.log("A PROGRESSÃO TÍPICA — é ela que tem de bater os âncoras do pedido");
console.log("=".repeat(78));
const tipicos = {};
for (const n of [1, 3, 5, 8, 10, 12, 15, 18, 20, 25]) {
  const p = P.poderDe(ficha(n));
  tipicos[n] = p.total;
  console.log(linha(`nível ${n} (típico)`, p));
}

console.log("\n" + "=".repeat(78));
console.log("A FAIXA DE CADA PATAMAR — 'podendo ser menos que isso ou bem mais'");
console.log("=".repeat(78));
for (const n of [5, 12, 20]) {
  const pelado = P.poderDe(ficha(n, { pelado: true, habs: 0 }));
  const tipico = P.poderDe(ficha(n));
  const otimo = P.poderDe(ficha(n, { raridade: "lendario", dadivas: n >= 20 ? 3 : 0 }));
  console.log(linha(`nível ${n} · pelado`, pelado));
  console.log(linha(`nível ${n} · típico`, tipico));
  console.log(linha(`nível ${n} · o melhor possível`, otimo));
  console.log(`   faixa: ${(otimo.total / pelado.total).toFixed(1)}× entre o pior e o melhor do mesmo nível\n`);
}

console.log("=".repeat(78));
console.log("OS ÂNCORAS DO PEDIDO");
console.log("=".repeat(78));
const a5 = tipicos[5], a20 = tipicos[20];
const ok5 = a5 >= 350 && a5 <= 600;
const ok20 = a20 >= 38000 && a20 <= 70000;
console.log(`nível 5  → ${P.formatarPoder(a5)}   ${ok5 ? "✓ na faixa 400–500" : "✗ FORA (pedido: ~400 a 500)"}`);
console.log(`nível 20 → ${P.formatarPoder(a20)}   ${ok20 ? "✓ na ordem de 50 mil" : "✗ FORA (pedido: ~50 mil)"}`);

console.log("\n" + "=".repeat(78));
console.log("O ITEM: duas peças da MESMA raridade têm de valer diferente");
console.log("=".repeat(78));
for (const r of ["comum", "raro", "lendario"]) {
  const amostra = Array.from({ length: 8 }, () => gerarLoot(r, { nivel: 12 }));
  const idx = amostra.map((it) => P.poderDoItem(it));
  console.log(`${r.padEnd(10)} índices: ${idx.join(", ")}  (menor ${Math.min(...idx)}, maior ${Math.max(...idx)}, ${new Set(idx).size} distintos de 8)`);
}

console.log("\n" + "=".repeat(78));
console.log("A ESCOLHA QUE O PEDIDO QUER: menos poder por uma habilidade");
console.log("=".repeat(78));
const bruto = { nome: "Lâmina Bruta", tipo: "arma", raridade: "raro", atributos: { dano: 6, forca: 3 }, poderes: [] };
const util = { nome: "Lâmina do Fôlego", tipo: "arma", raridade: "raro", atributos: { dano: 3 }, poderes: [{ efeito: { imunidades: ["envenenado"], resist: "fogo" } }], concede: "Passo do Vento" };
const h = ficha(12);
console.log(`${bruto.nome.padEnd(20)} índice ${String(P.poderDoItem(bruto)).padStart(4)} · vale ${P.formatarPoder(P.pontosDoItem(bruto, h))} para um nível 12`);
console.log(`${util.nome.padEnd(20)} índice ${String(P.poderDoItem(util)).padStart(4)} · vale ${P.formatarPoder(P.pontosDoItem(util, h))} para um nível 12`);
console.log(`A peça com habilidade custa ${Math.round((1 - P.poderDoItem(util) / P.poderDoItem(bruto)) * 100)}% de poder — e essa é a decisão.`);

console.log("\n" + "=".repeat(78));
console.log("O GRUPO");
console.log("=".repeat(78));
for (const q of [0, 1, 2, 4, 22]) {
  const comp = Array.from({ length: q }, (_, i) => ficha(12));
  const g = P.poderDoGrupo({ ...ficha(12), grupo: comp });
  console.log(`${String(q).padStart(2)} companheiros → ${P.formatarPoder(g.total).padStart(10)}  (herói ${P.formatarPoder(g.heroi)}${g.aparado ? " · APARADO pelo teto" : ""})`);
}

console.log("\n" + "=".repeat(78));
console.log("A RAZÃO CONTRA O CONTEÚDO — é ela que vira o patamar de dificuldade");
console.log("=".repeat(78));
for (const dn of [-6, -3, -1, 0, 3, 6, 10]) {
  const nv = 12;
  const g = P.poderDoGrupo(ficha(nv));
  const c = P.poderDoConteudo({ nivel: nv + dn, tamanho: 6 });
  console.log(`herói ${nv} contra conteúdo ${String(nv + dn).padStart(2)} → razão ${(g.total / c).toFixed(2)}`);
}
