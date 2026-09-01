/* Quanto custa cada pedaço candidato a corte, por turno de cena comum.
   Sem número, corte de prompt é chute — e chute no prompt é o jeito mais
   caro de descobrir que a regra fazia falta. */

import { readFileSync } from "node:fs";

const P = readFileSync("../src/prompt.js", "utf8");
const B = readFileSync("../src/bestiario.js", "utf8");

const bloco = (nome, txt) => console.log(String(txt.length).padStart(6) + "  " + nome);

/* TABELA_TESTES, literal, como ela sai no prompt */
const m = B.match(/export const TABELA_TESTES = `([\s\S]*?)`;/);
bloco("TABELA_TESTES (bestiario.js)", m ? m[1] : "");

/* as linhas de combate que hoje entram em TODA cena, inclusive nas que
   não têm luta nenhuma */
const linhas = P.split("\n");
const faixa = linhas.slice(459, 481);
const SO_NA_LUTA = [
  "- COMBATE RESOLVIDO PELO SISTEMA",
  "- INTENSIDADE FIEL",
  "- AÇÃO DE TURNO DO HERÓI",
  "- Em combate, mantenha a narrativa CURTA",
  "- Cada inimigo tem competência implícita",
  "- DANO DE GOLPE NÃO PASSA POR VOCÊ",
  '- Use "combate_atualizar"',
  "- ECONOMIA DE TURNO DO JOGADOR",
  "- ATAQUES MÚLTIPLOS DO HERÓI",
];
let soNaLuta = 0;
for (const l of faixa) if (SO_NA_LUTA.some((p) => l.startsWith(p))) soNaLuta += l.length + 1;
bloco("linhas de combate hoje SEM porta", { length: soNaLuta });

/* e o que dessa faixa precisa continuar fora de porta, porque governa o
   INSTANTE em que a luta abre — o turno mais perigoso do jogo */
const ABERTURA = ["- ABERTURA NO MESMO TURNO", "- Quando um combate REAL começar", "- Se algum dano legítimo", "- BESTIÁRIO", "- PATAMAR DE COMBATE", "- COESÃO DE RESULTADO"];
let abertura = 0;
for (const l of faixa) if (ABERTURA.some((p) => l.startsWith(p))) abertura += l.length + 1;
bloco("linhas que NÃO podem entrar na porta", { length: abertura });
