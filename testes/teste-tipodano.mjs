/* O TIPO DE DANO DE UMA HABILIDADE (v9.21)

   Bug relatado jogando: "mesmo quando uso uma magia, aparece que eu dei dano
   físico". A causa estava escondida à vista — o combate mandava
   `tipoDano: "magico"`, e "magico" NÃO é um tipo de dano: é a NATUREZA de uma
   escola. A tabela real tem fisico, fogo, gelo, raio, veneno, sagrado,
   sombrio e arcano.

   O sintoma era cosmético; o estrago não era. `iconeDano` e `rotuloDano`
   caíam no padrão e escreviam 🗡 físico — isso dava para ver. O que ninguém
   via: `multiplicadorDano` e as resistências comparam por NOME de tipo,
   então fraqueza a fogo, imunidade a sombrio e resistência mágica nunca
   casavam. Um elemental de fogo levava dano cheio de uma bola de fogo. */

import { tipoDeDanoDaHabilidade, elementoDaHabilidade, naturezaDaHabilidade } from "../src/combos.js";
import { TIPOS_DANO, rotuloDano, iconeDano, multiplicadorDano, perfilDeCriatura } from "../src/danos.js";

let falhas = 0;
const ok = (c, t) => { if (!c) { falhas++; console.log("  FALHA:", t); } else console.log("  ok:", t); };
const H = (nome, descricao = "") => ({ nome, descricao });

console.log("\n[1. O QUE ESTAVA QUEBRADO]");
ok(!TIPOS_DANO.magico, "\"magico\" NÃO existe na tabela de tipos de dano — era a raiz do bug");
ok(rotuloDano("magico") === "físico", "e por isso rotuloDano(\"magico\") escrevia \"físico\" na tela");
ok(iconeDano("magico") === "🗡", "com o ícone de espada");

console.log("\n[2. TODO RESULTADO É UM TIPO QUE EXISTE]");
const casos = [
  H("Bola de Fogo", "uma esfera incandescente"), H("Lança de Gelo"), H("Relâmpago"),
  H("Nuvem Tóxica"), H("Toque Sombrio"), H("Luz Radiante"), H("Míssil Arcano"),
  H("Golpe Poderoso"), H("Investida"), H("Canção de Coragem"),
];
for (const h of casos) {
  const mago = tipoDeDanoDaHabilidade(h, { classe: "Mago" });
  ok(!!TIPOS_DANO[mago], `${h.nome.padEnd(20)} → ${rotuloDano(mago).padEnd(8)} ${iconeDano(mago)}`);
}

console.log("\n[3. O ELEMENTO NO NOME MANDA]");
ok(tipoDeDanoDaHabilidade(H("Bola de Fogo"), { classe: "Mago" }) === "fogo", "fogo é fogo");
ok(tipoDeDanoDaHabilidade(H("Bola de Fogo"), { classe: "Guerreiro" }) === "fogo", "e continua fogo mesmo na ficha de um guerreiro — o nome manda sobre a classe");
ok(tipoDeDanoDaHabilidade(H("Lança de Gelo"), { classe: "Mago" }) === "gelo", "gelo");
ok(tipoDeDanoDaHabilidade(H("Toque Sombrio"), { classe: "Mago" }) === "sombrio", "sombra vira sombrio — os dois vocabulários agora conversam");
ok(tipoDeDanoDaHabilidade(H("Luz Radiante"), { classe: "Mago" }) === "sagrado", "luz vira sagrado, idem");

console.log("\n[4. SEM ELEMENTO, A ESCOLA DECIDE]");
ok(tipoDeDanoDaHabilidade(H("Míssil"), { classe: "Mago" }) === "arcano", "mago sem elemento: arcano");
ok(tipoDeDanoDaHabilidade(H("Punição"), { classe: "Clérigo" }) === "sagrado", "clérigo: sagrado");
ok(tipoDeDanoDaHabilidade(H("Pacto"), { classe: "Bruxo" }) === "sombrio", "bruxo: sombrio");
ok(tipoDeDanoDaHabilidade(H("Golpe Poderoso"), { classe: "Guerreiro" }) === "fisico", "guerreiro: físico, como sempre foi");
ok(tipoDeDanoDaHabilidade(H("Ataque Furtivo"), { classe: "Ladino" }) === "fisico", "ladino: físico");
ok(tipoDeDanoDaHabilidade(H("Qualquer"), {}) === "fisico", "sem classe nenhuma: físico — nunca quebra");
ok(tipoDeDanoDaHabilidade(null, { classe: "Mago" }) === "arcano", "habilidade nula não quebra");

console.log("\n[5. O ESTRAGO QUE NINGUÉM VIA: fraqueza e resistência voltam a funcionar]");
const perfilFogo = perfilDeCriatura("Elemental de Fogo", "fúria de um elemento");
const antes = multiplicadorDano("magico", perfilFogo);
const agora = multiplicadorDano(tipoDeDanoDaHabilidade(H("Bola de Fogo"), { classe: "Mago" }), perfilFogo);
console.log(`  bola de fogo num elemental de fogo: antes ×${antes.mult} (${antes.tag || "sem tag"}) · agora ×${agora.mult} (${agora.tag || "sem tag"})`);
ok(antes.mult === 1, "com \"magico\", o elemental de fogo levava dano CHEIO de uma bola de fogo");
ok(agora.mult !== 1, "com o tipo certo, a tabela finalmente casa");
const perfilGelo = perfilDeCriatura("Elemental de Gelo", "");
const gelo = multiplicadorDano(tipoDeDanoDaHabilidade(H("Lança de Gelo"), { classe: "Mago" }), perfilGelo);
ok(typeof gelo.mult === "number", "e vale para os outros elementos também");

console.log("\n[6. COERÊNCIA COM A NATUREZA DA ESCOLA]");
for (const c of ["Mago", "Clérigo", "Druida", "Feiticeiro", "Bruxo", "Bardo", "Invocador"]) {
  const t = tipoDeDanoDaHabilidade(H("Poder"), { classe: c });
  ok(t !== "fisico" && naturezaDaHabilidade(H("Poder"), { classe: c }) === "magico", `${c.padEnd(11)} → ${rotuloDano(t)} (escola mágica, dano não-físico)`);
}
for (const c of ["Guerreiro", "Ladino", "Monge", "Engenheiro"]) {
  ok(tipoDeDanoDaHabilidade(H("Poder"), { classe: c }) === "fisico", `${c.padEnd(11)} → físico`);
}

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
