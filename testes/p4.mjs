import { lerAcao } from "../src/desafios.js";
import { ehPerguntaAoMundo } from "../src/oraculo.js";
const base = { personagem: { nivel: 5, inventario: [], habilidades: [] }, semente: "x", lugar: "a taverna", tentativas: {}, dia: 1 };
const frases = [
  "Uso leitura de aura para identificar algo estranho nele",
  "Olho ao redor para achar uma saída",
  "Me concentro na forma do objeto para entender o que é",
  "O guarda é subornável?",
  "Tem uma saída pelos fundos?",
  "procuro uma saída pelos fundos",
];
for (const f of frases) {
  const v = lerAcao(f, base);
  console.log(`"${f}"`);
  console.log(`   desafio: ${v ? `${v.tipo}${v.pericia ? "/" + v.pericia : ""}` : "NENHUM"}  ·  oráculo: ${ehPerguntaAoMundo(f) ? "sim" : "não"}`);
}
