/* Põe as portas da cena nos blocos do prompt. Arquivo em vez de node -e
   porque o bash come as crases — a memória do projeto já registra isso. */
import fs from "node:fs";
const P = "../src/prompt.js";
let s = fs.readFileSync(P, "utf8");

const PORTAS = {
  MERCADO_PROMPT: "mercado",
  COMPANHEIROS_PROMPT: "grupo",
  REACOES_PROMPT: "combate",
  PRESENCA_PROMPT: "combate",
  CRAFT_PROMPT: "bancada",
  ESPECIALIZACOES_PROMPT: "especializacao",
  COMBOS_PROMPT: "combate",
  GRIMORIO_PROMPT: "magia",
  GATILHOS_PROMPT: "gatilho",
  INVOCACOES_PROMPT: "invocacao",
  CONTROLE_PROMPT: "combate",
  OFICINA_PROMPT: "bancada",
  MAGIAS_PROMPT: "magia",
  SINTONIA_PROMPT: "sintonia",
  LEGADO_PROMPT: "legado",
  GRID_PROMPT: "combate",
  MOVIMENTO_PROMPT: "combate",
  CHAO_PROMPT: "chao",
  MISSOES_PROMPT: "missao",
  OFERTAS_PROMPT: "missao",
  ARREDORES_PROMPT: "cidade",
  ASCENSAO_SISTEMA_PROMPT: "ascensao",
};

let n = 0;
for (const [bloco, porta] of Object.entries(PORTAS)) {
  const de = "${" + bloco + "}";
  const para = '${so("' + porta + '", ' + bloco + ")}";
  const antes = s.split(de).length - 1;
  if (antes !== 1) { console.log(`!! ${bloco}: ${antes} ocorrências (esperava 1)`); continue; }
  s = s.split(de).join(para);
  n++;
}

/* buraco de linha em branco onde o bloco não entrou */
const fim = "Quando algo mudar,";
if (!s.includes("_limparVazios")) {
  s = s.replace(
    "export function montarSystemPrompt(",
    "/* Sem esta linha, cada bloco recusado deixaria a própria linha em branco\n   para trás e o prompt viraria uma escada de buracos. */\nconst _limparVazios = (t) => String(t).replace(/\\n{3,}/g, \"\\n\\n\");\n\nexport function montarSystemPrompt(",
  );
}

fs.writeFileSync(P, s);
console.log(`${n} blocos gateados`);
