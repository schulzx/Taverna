/* teste-chao-do-espolio.mjs (Fase T, trilha B, 28/10/2026) — o crachá do
   que cai no chão sai do achado, e não do relógio.

   O id de cada achado (chao.js) era `Date.now()` mais um contador do
   MÓDULO, que andava de corrida em corrida dentro do mesmo processo. Era
   a lei do determinismo por semente quebrada pela porta mais pequena: a
   mesma luta, com a mesma semente, dava ids diferentes em cada máquina, a
   cada hora e conforme quantas corridas tinham vindo antes — e a prova do
   combate tinha de os normalizar para conseguir comparar. Achado pela
   trilha A ao mover o combate (6.ª fatia da T1-A).

   A prova: a mesma sequência, duas vezes no mesmo processo (e com o
   relógio em outra hora), dá os mesmos ids. E dois achados iguais no
   mesmo chão continuam a ser dois. */
import {
  achadoDeEquipamento, achadoDeConsumivel, achadoDeComponente,
  porNoChao, tirarDoChao, criarChao, garantirChao, LIMITE_CHAO,
} from "../src/chao.js";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

/* uma luta qualquer: uma espada, duas poções iguais do mesmo corpo (fora do
   tabuleiro, logo sem quadrado), um couro, e o chão que já tinha coisa */
const espada = { nome: "Espada Curta", raridade: "incomum", atributos: { dano: 2 } };
const pocao = { id: "pocao_cura", nome: "Poção de Cura", icone: "🧪", desc: "cura 2d4" };
const couro = { id: "couro", nome: "Couro de Lobo", icone: "🧺", desc: "para a bancada" };
const sequencia = () => {
  let chao = porNoChao(criarChao(), [achadoDeComponente(couro, { id: "couro", qtd: 1 }, { de: "Lobo" })], { cena: "Vau|bosque|3" });
  const lote = [
    achadoDeEquipamento(espada, { de: "Bandido", x: 2, y: 3 }),
    achadoDeConsumivel(pocao, { id: "pocao_cura", qtd: 1 }, { de: "Bandido" }),
    achadoDeConsumivel(pocao, { id: "pocao_cura", qtd: 1 }, { de: "Bandido" }),
    achadoDeComponente(couro, { id: "couro", qtd: 1 }, { de: "Lobo" }),
  ];
  chao = porNoChao(chao, lote, { cena: "Vau|bosque|3" });
  return chao.itens.map((i) => i.id);
};

sec("1. A MESMA SEQUÊNCIA DÁ OS MESMOS IDS");
{
  const a = sequencia();
  const b = sequencia();
  t(`duas corridas no mesmo processo, os mesmos ids (${a.join(" ")})`, JSON.stringify(a) === JSON.stringify(b));
  const relogio = Date.now;
  Date.now = () => relogio() + 86400000 * 400;
  const c = sequencia();
  Date.now = relogio;
  t("e com o relógio em outra hora, também", JSON.stringify(a) === JSON.stringify(c));
  t("todo achado tem id", a.length === 5 && a.every((id) => typeof id === "string" && id.length > 2));
}

sec("2. DOIS ACHADOS IGUAIS CONTINUAM A SER DOIS");
{
  const ids = sequencia();
  t("nenhum id repetido no chão (as duas poções, os dois couros)", new Set(ids).size === ids.length);
  const chao = porNoChao(criarChao(), [
    achadoDeConsumivel(pocao, { id: "pocao_cura" }, { de: "Bandido" }),
    achadoDeConsumivel(pocao, { id: "pocao_cura" }, { de: "Bandido" }),
  ]);
  const { chao: resto, pegos } = tirarDoChao(chao, chao.itens[0].id);
  t("pegar uma poção leva só uma", pegos.length === 1 && resto.itens.length === 1);
  /* o que já está no chão também conta: uma terceira poção que cai depois
     não pode tomar o crachá de uma das duas */
  const mais = porNoChao(chao, [achadoDeConsumivel(pocao, { id: "pocao_cura" }, { de: "Bandido" })]);
  t("a que cai depois ganha crachá próprio", new Set(mais.itens.map((i) => i.id)).size === 3);
}

sec("3. O ID SAI DO ACHADO, E SÓ DELE");
{
  const um = achadoDeEquipamento(espada, { de: "Bandido", x: 2, y: 3 });
  t("o mesmo achado, o mesmo id", um.id === achadoDeEquipamento(espada, { de: "Bandido", x: 2, y: 3 }).id);
  t("outro dono, outro id", um.id !== achadoDeEquipamento(espada, { de: "Ogro", x: 2, y: 3 }).id);
  t("outro quadrado, outro id", um.id !== achadoDeEquipamento(espada, { de: "Bandido", x: 4, y: 3 }).id);
  t("outra espécie com o mesmo nome, outro id", achadoDeComponente(couro, { id: "couro" }).id !== achadoDeConsumivel(couro, { id: "couro" }).id);
}

sec("4. PÔR NO CHÃO NÃO MEXE NO QUE RECEBE");
{
  const p1 = achadoDeConsumivel(pocao, { id: "pocao_cura" }, { de: "Bandido" });
  const p2 = achadoDeConsumivel(pocao, { id: "pocao_cura" }, { de: "Bandido" });
  const antes = JSON.stringify([p1, p2]);
  const base = porNoChao(criarChao(), [p1]);
  const baseAntes = JSON.stringify(base);
  Object.freeze(p1); Object.freeze(p2);
  let erro = null;
  try { porNoChao(base, [p2]); } catch (e) { erro = e; }
  t(`o achado repetido não é reescrito no lugar${erro ? " — " + erro.message : ""}`, !erro && JSON.stringify([p1, p2]) === antes);
  t("e o chão de entrada fica como estava", JSON.stringify(base) === baseAntes);
}

sec("5. O QUE SEMPRE FEZ, CONTINUA");
{
  t("nada vira nada", achadoDeEquipamento(null) === null && achadoDeConsumivel(pocao, null) === null && achadoDeComponente(null, {}) === null);
  t("o chão nulo é um chão vazio", garantirChao(null).itens.length === 0 && porNoChao(null, []).itens.length === 0);
  /* um chão de save antigo, com ids do relógio: o que cai depois convive */
  const velho = { cena: "Vau|bosque|3", itens: [{ id: "chmh3k2x1a", nome: "Adaga" }, null] };
  const junto = porNoChao(velho, [achadoDeEquipamento(espada, { de: "Bandido" })]);
  t("o chão antigo continua a abrir, e o novo achado entra ao lado", junto.itens.length === 2 && junto.itens[0].id === "chmh3k2x1a");
  const cheio = porNoChao(criarChao(), Array.from({ length: LIMITE_CHAO + 5 }, (_, i) => achadoDeEquipamento({ nome: `Faca ${i}` }, { de: "Bandido" })));
  t("o teto do chão vale", cheio.itens.length === LIMITE_CHAO && new Set(cheio.itens.map((i) => i.id)).size === LIMITE_CHAO);
}

console.log(`\no chão do espólio: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
