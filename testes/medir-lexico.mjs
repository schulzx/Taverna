import { montarSystemPrompt } from "../src/prompt.js";
import { lerLexico, pedidoDoLexico, lexicoPrompt, SISTEMAS, COISAS } from "../src/lexico.js";

/* um léxico CHEIO, no teto de todos os campos — é o pior caso do orçamento */
const cheio = lerLexico({
  chamado: Object.fromEntries(COISAS.map((c) => [c.id, "x".repeat(28)])),
  funciona: Object.fromEntries(SISTEMAS.map((s) => [s.id, "y".repeat(230)])),
  povos: Array.from({ length: 8 }, (_, i) => `povo${i}${"p".repeat(10)}`),
  oficios: Array.from({ length: 16 }, (_, i) => `oficio${i}${"o".repeat(12)}`),
  criaturas: Array.from({ length: 10 }, (_, i) => `bicho${i}${"b".repeat(14)}`),
  naoExiste: Array.from({ length: 6 }, (_, i) => `ausente${i}${"a".repeat(14)}`),
  cidades: Array.from({ length: 8 }, (_, i) => `Cidade${i}`),
  tavernas: Array.from({ length: 4 }, (_, i) => `A Sede ${i}`),
  lugares: Array.from({ length: 10 }, (_, i) => ({ tipo: `lugar${i}${"l".repeat(12)}`, exemplo: "N" })),
  faccoes: Array.from({ length: 4 }, (_, i) => ({ nome: `Facção ${i}`, quer: "z".repeat(60) })),
  aLei: "L".repeat(200),
  comoSeFala: "F".repeat(200),
});

const heroi = { nome: "V", conceito: "x", nivel: 5, atributos: { forca: 1, destreza: 1, vigor: 1, intelecto: 1, presenca: 1, percepcao: 1 }, vidaMax: 40, manaMax: 20 };
const monta = (cena, lex) => montarSystemPrompt("C", { genero: "Fantasia medieval", lexico: lex }, heroi, "", {}, {}, "", "", "", "", "", "", "", cena);

const cenas = {
  "taverna (cena comum)": { emCidade: true, temMercado: true },
  "combate": { emCombate: true },
  "masmorra": { emMasmorra: true, emCombate: true },
  "viagem": { emViagem: true, ermo: true },
  "TUDO ligado": Object.fromEntries(["emCombate", "emMasmorra", "temChao", "emCidade", "temMercado", "temBancada", "temMissao", "conjura", "temGrupo", "temLegado", "temSintonia", "temEspecializacao", "despertou", "invoca", "temGatilho", "temDadiva", "temRegraPropria", "emViagem", "dentroDeUmLocal", "acampado"].map((k) => [k, true])),
};

console.log("cena".padEnd(24), "sem léxico".padStart(12), "com léxico".padStart(12), "delta".padStart(9));
for (const [rot, c] of Object.entries(cenas)) {
  const a = monta(c, null).length, b = monta(c, cheio).length;
  console.log(rot.padEnd(24), String(a).padStart(12), String(b).padStart(12), String("+" + (b - a)).padStart(9));
}
console.log("\nbloco do léxico (pior caso, cena comum):", lexicoPrompt(cheio, { cidade: true, mercado: true }).length);
console.log("bloco do léxico (pior caso, TUDO):", lexicoPrompt(cheio, Object.fromEntries(SISTEMAS.map((s) => [s.porta, true]))).length);
console.log("pedido de geração:", pedidoDoLexico({ genero: "Fantasia medieval", descricao: "x".repeat(1200) }).length, "caracteres");
