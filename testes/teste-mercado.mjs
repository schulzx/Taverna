import { mercadoresDaCidade, talvezAmbulante, precoQueOferecem, precoDaBanca, resumoMercadoPrompt } from "../src/mercado.js";
import { comoConsumivel, usarConsumivel, sortearConsumivel, itemConsumivel, descricaoCurta, melhorCuraPara, CONSUMIVEIS } from "../src/pocoes.js";
import { gerarEspolios } from "../src/combate.js";

let falhas = 0;
const ok = (c, t) => { if (!c) { falhas++; console.log("  FALHA:", t); } else console.log("  ok:", t); };

console.log("\n[mercadores por cidade]");
const capital = { nome: "Rio do Sul", porte: "capital", populacao: 44720 };
const vila = { nome: "Ponto Seco", porte: "vila", populacao: 800 };
const m1 = mercadoresDaCidade(capital, 40, 8);
const m2 = mercadoresDaCidade(vila, 40, 8);
console.log(`  capital: ${m1.length} bancas`);
m1.forEach((m) => console.log(`    ${m.icone} ${m.nome} (${m.rotulo}): ${m.estoque.map((i) => i.nome + " ◉" + i.preco).join(" | ")}`));
console.log(`  vila: ${m2.length} banca(s)`);
m2.forEach((m) => console.log(`    ${m.icone} ${m.nome} (${m.rotulo}): ${m.estoque.map((i) => i.nome + " ◉" + i.preco).join(" | ")}`));
ok(m1.length === 3 && m2.length === 1, "capital tem mais bancas que vila");
ok(m1.every((m) => m.estoque.length > 0), "todas as bancas têm estoque");

console.log("\n[determinismo e giro semanal]");
const a = mercadoresDaCidade(capital, 43, 8), b = mercadoresDaCidade(capital, 47, 8), c = mercadoresDaCidade(capital, 55, 8);
const chave = (ms) => ms.map((m) => m.nome + m.estoque.map((i) => i.nome).join()).join("|");
ok(chave(a) === chave(b), "mesma semana (dias 43 e 47) = mesma banca");
ok(chave(a) !== chave(c), "duas semanas depois (dia 55) o estoque girou");

console.log("\n[preços por porte]");
const espada = { nome: "Espada Longa", raridade: "incomum", tipo: "arma" };
/* v9.138: as duas cidades passaram a ter bioma, senão a vocação de cada
   uma entrava na conta e o teste comparava duas praças diferentes. */
const pCap = precoDaBanca(espada, capital, { tipo: "ferreiro" });
const pVila = precoDaBanca(espada, vila, { tipo: "ferreiro" });
console.log(`  mesma espada: capital ◉${pCap} · vila ◉${pVila} · revenda na capital ◉${precoQueOferecem(espada, capital)}`);
ok(pCap > pVila, "capital cobra mais caro que vila");
ok(precoQueOferecem(espada, capital) < pCap, "vender rende menos que comprar");

console.log("\n[consumíveis]");
const heroi = { nome: "Vera", vida: 30, vidaMax: 90, mana: 5, manaMax: 20, condicoes: [{ id: "envenenado", nome: "Envenenado" }], efeitos: [], atributos: {} };
const cura = usarConsumivel(heroi, "cura_m");
console.log("  " + cura.texto);
ok(cura.ent.vida > heroi.vida && cura.ent.vida <= heroi.vidaMax, "cura soma PV sem passar do máximo");
const mana = usarConsumivel(heroi, "mana_p");
ok(mana.ent.mana > heroi.mana, "poção de mana devolve PM: " + mana.texto);
const anti = usarConsumivel(heroi, "antidoto");
ok(anti.ent.condicoes.length === 0, "antídoto tira o veneno: " + anti.texto);
const elixir = usarConsumivel(heroi, "elixir_forca");
ok(elixir.ent.efeitos.length === 1 && elixir.ent.efeitos[0].aplica === "Força", "elixir vira efeito temporário: " + elixir.texto);
const frasco = usarConsumivel(heroi, "frasco_furia");
ok(frasco.ent.condicoes.some((x) => x.id === "enfurecido"), "frasco aplica condição do catálogo: " + frasco.texto);
const semNada = usarConsumivel({ ...heroi, condicoes: [] }, "antidoto");
ok(semNada.gastou === false, "antídoto sem veneno não é desperdiçado");

console.log("\n[faixas de cura roladas]");
for (const id of ["cura_p", "cura_m", "cura_g"]) {
  const vals = [];
  for (let i = 0; i < 200; i++) vals.push(usarConsumivel({ vida: 0, vidaMax: 999 }, id).ent.vida);
  console.log(`  ${id}: ${Math.min(...vals)}–${Math.max(...vals)} PV (média ${Math.round(vals.reduce((s, v) => s + v, 0) / vals.length)})`);
}

console.log("\n[reconhecimento por nome solto]");
for (const [n, esperado] of [["Poção de Cura Pequena", "cura_p"], ["poção de cura", "cura_p"], ["Poção de Cura Grande", "cura_g"], ["poção de mana media", "mana_m"], ["antídoto", "antidoto"], ["Espada Longa", null]]) {
  const c = comoConsumivel(n);
  ok((c ? c.id : null) === esperado, `"${n}" → ${c ? c.id : "não é consumível"}`);
}

console.log("\n[drops]");
let comCons = 0;
for (let i = 0; i < 300; i++) { const e = gerarEspolios([{ ameaca: "comum" }, { ameaca: "fraco" }]); if (e.consumiveis > 0) comCons++; }
console.log(`  luta de 2 inimigos: ${comCons}/300 renderam consumível`);
ok(comCons > 120, "consumível cai com frequência (não é raro como equipamento)");

console.log("\n[IA de cura: qual poção usar]");
const bolsa = [itemConsumivel("cura_p"), itemConsumivel("cura_g")];
const escolha = melhorCuraPara({ vida: 85, vidaMax: 90 }, bolsa);
ok(escolha && escolha.c.id === "cura_p", "com pouco dano, usa a pequena: " + (escolha && escolha.c.nome));
const escolha2 = melhorCuraPara({ vida: 10, vidaMax: 90 }, bolsa);
ok(escolha2 && escolha2.c.id === "cura_g", "com muito dano, usa a grande: " + (escolha2 && escolha2.c.nome));

console.log("\n[o que o Mestre lê]\n  " + resumoMercadoPrompt(m1));
console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
