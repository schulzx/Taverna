import {
  garantirBase, saquear, revelar, foiSaqueado, foiRevelado, matar,
  oQueExisteAqui, resumoDaqui, achavelAqui, recompensaDoAchado, envelopeDoAchado,
  mencionadosNaCena, idDoLocal, idDaGente,
} from "../src/mundo-base.js";
import { gerarGeografia } from "../src/geografia.js";

let falhas = 0;
const ok = (c, t) => { if (!c) { falhas++; console.log("  FALHA:", t); } else console.log("  ok:", t); };

const SEM = "taverna|teste-consumo";
const mapa = gerarGeografia(SEM, "Fantasia medieval");
const cidade = mapa.cidades[0].nome;
let base = garantirBase(null);
console.log(`\nMundo: ${mapa.cidades.length} cidades · trabalhando em ${cidade}`);

console.log("\n[1. O QUE EXISTE AQUI — antes de qualquer busca]");
const q0 = oQueExisteAqui(SEM, mapa, cidade, base, "Fantasia medieval");
console.log(`  ${q0.locais.length} locais · ${q0.gente.length} pessoas · ${q0.segredos.length} segredo(s) · ${(q0.tesouros || []).length} tesouro(s) no ermo`);
ok(q0.segredos.length > 0, "a cidade tem segredo gerado na criação do mundo");

console.log("\n[2. O ACHADO SAI DA BASE — o furo que existia]");
const alvo = achavelAqui(SEM, mapa, cidade, base, "Fantasia medieval", "percepcao");
ok(alvo, `procurar com percepção encontra alvo: ${alvo ? `${alvo.o} (dif. ${alvo.dc})` : "nenhum"}`);
ok(alvo && alvo.dc >= 13, "a dificuldade vem do PRÓPRIO segredo, não de uma escala genérica");
const maisFacil = achavelAqui(SEM, mapa, cidade, base, "Fantasia medieval", "percepcao");
ok(maisFacil.id === alvo.id, "consultar duas vezes devolve o mesmo alvo (determinístico)");

base = saquear(base, alvo.id);
ok(foiSaqueado(base, alvo.id), "depois de achado, o livro-razão registra");
const depois = achavelAqui(SEM, mapa, cidade, base, "Fantasia medieval", "percepcao");
ok(!depois || depois.id !== alvo.id, `e ele NÃO volta a ser oferecido${depois ? ` (agora oferece: ${depois.o})` : " (não há mais nada)"}`);

const antesTxt = resumoDaqui(SEM, mapa, cidade, garantirBase(null), "Fantasia medieval");
const depoisTxt = resumoDaqui(SEM, mapa, cidade, base, "Fantasia medieval");
ok(antesTxt.includes(alvo.o), "antes, o segredo ia no prompt de todo turno");
ok(!depoisTxt.includes(alvo.o), "depois de saqueado, ele SOME do prompt — é aqui que o token para de queimar");
console.log(`  prompt encolheu de ${antesTxt.length} para ${depoisTxt.length} caracteres`);

console.log("\n[3. ESVAZIA TUDO — nada fica preso para sempre]");
let b2 = garantirBase(null);
let voltas = 0;
while (voltas < 40) {
  const a = achavelAqui(SEM, mapa, cidade, b2, "Fantasia medieval", "percepcao") || achavelAqui(SEM, mapa, cidade, b2, "Fantasia medieval", "intelecto");
  if (!a) break;
  b2 = saquear(b2, a.id);
  voltas++;
}
ok(voltas > 0 && voltas < 40, `${voltas} achado(s) até o lugar esvaziar — o laço termina, não vira loop infinito`);
ok(!achavelAqui(SEM, mapa, cidade, b2, "Fantasia medieval", "percepcao"), "e depois disso procurar não acha mais nada aqui");

console.log("\n[4. A RECOMPENSA — prosa vira coisa, sem o Mestre arbitrar]");
for (const teste of [
  { o: "moedas antigas de um reino que não existe mais", dc: 15 },
  { o: "componentes de ritual embrulhados em couro", dc: 14 },
  { o: "frascos que ainda estão bons", dc: 16 },
  { o: "um mapa marcando outro esconderijo", dc: 13 },
]) {
  const r = recompensaDoAchado(teste);
  console.log(`  "${teste.o.slice(0, 42)}" → ◉ ${r.moedas}, ${r.componentes} comp., ${r.consumiveis} cons.`);
}
ok(recompensaDoAchado({ o: "moedas antigas", dc: 15 }).moedas > recompensaDoAchado({ o: "ossos", dc: 15 }).moedas, "achado de moeda rende mais moeda que achado de osso");
ok(recompensaDoAchado({ o: "componentes de ritual", dc: 14 }).componentes === 2, "componente de ritual vira componente de ofício na bolsa");
ok(recompensaDoAchado({ o: "frascos que ainda estão bons", dc: 16 }).consumiveis === 1, "frasco vira consumível");
ok(recompensaDoAchado(null).moedas === 0, "sem achado, sem recompensa");

const env = envelopeDoAchado({ ...alvo, especie: "segredo" }, recompensaDoAchado(alvo));
console.log("  envelope:", env.slice(0, 190) + "…");
ok(/NÃO envie itens nem moedas/.test(env), "o Mestre é proibido de duplicar a recompensa");
ok(/nunca mais ofereça este mesmo achado/.test(env), "e de reoferecer o esconderijo vazio");

console.log("\n[5. DA BASE PARA O CÂNONE — quem entra em cena vira história]");
const b3 = garantirBase(null);
const pessoa = q0.gente[0];
const local = q0.locais[0];
const nar = `Você empurra a porta d${/^[aA]/.test(local.nome) ? "" : "o "}${local.nome}. ${pessoa.nome} levanta os olhos do balcão e mede você em silêncio.`;
const m = mencionadosNaCena(SEM, mapa, cidade, b3, "Fantasia medieval", nar);
console.log(`  narrativa: "${nar.slice(0, 90)}…"`);
console.log(`  reconheceu: ${m.locais.map((l) => l.nome).join(", ") || "—"} · ${m.gente.map((p) => p.nome).join(", ") || "—"}`);
ok(m.gente.some((p) => p.nome === pessoa.nome), "a pessoa da base citada na cena é reconhecida");
ok(m.locais.some((l) => l.nome === local.nome), "o local também");

let b4 = b3;
for (const l of m.locais) b4 = revelar(b4, idDoLocal(cidade, l));
for (const p of m.gente) b4 = revelar(b4, idDaGente(cidade, p));
ok(foiRevelado(b4, idDaGente(cidade, pessoa)), "depois de marcada, fica revelada");
const m2 = mencionadosNaCena(SEM, mapa, cidade, b4, "Fantasia medieval", nar);
ok(m2.gente.length === 0 && m2.locais.length === 0, "e não é reconhecida de novo — não vira mensagem repetida todo turno");

const txtRev = resumoDaqui(SEM, mapa, cidade, b4, "Fantasia medieval");
ok(txtRev.includes(`${pessoa.nome} ✓`), `o prompt marca com ✓ quem já apareceu (${pessoa.nome} ✓)`);
ok(/NUNCA reapresente/.test(txtRev), "e proíbe reapresentar quem tem ✓");

console.log("\n[6. NÃO CONFUNDE NOME]");
const semNada = mencionadosNaCena(SEM, mapa, cidade, b3, "Fantasia medieval", "A chuva não dá trégua e ninguém fala com você.");
ok(semNada.gente.length === 0 && semNada.locais.length === 0, "narrativa sem ninguém não revela ninguém");
const parcial = mencionadosNaCena(SEM, mapa, cidade, b3, "Fantasia medieval", `${pessoa.nome}zinho passou correndo.`);
ok(!parcial.gente.some((p) => p.nome === pessoa.nome), "nome como pedaço de outra palavra não conta");
ok(mencionadosNaCena(SEM, mapa, cidade, b3, "Fantasia medieval", "").gente.length === 0, "narrativa vazia não quebra");

console.log("\n[7. O MORTO CONTINUA SAINDO — o que já funcionava não regrediu]");
const b5 = matar(garantirBase(null), pessoa.nome);
const q5 = oQueExisteAqui(SEM, mapa, cidade, b5, "Fantasia medieval");
ok(!q5.gente.some((p) => p.nome === pessoa.nome), "quem morreu sai da lista de gente viva");

console.log("\n[8. O LIVRO-RAZÃO CABE NO SAVE]");
const cheio = JSON.stringify({ ...b4, saqueados: Array.from({ length: 12 }, (_, i) => `cidade|segredo|${i}`), mortos: ["A", "B", "C"] });
console.log(`  ${cheio.length} caracteres com 12 saques, 3 mortos e ${b4.revelados.length} revelados`);
ok(cheio.length < 900, "continua sendo texto curto — o mundo inteiro segue derivado da semente");

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
