/* O DEFEITO QUE O JOGO MOSTROU, procurado em todo o acervo.

   "Subo até a Associação e mostro o crachá" pediu um teste de ESCALADA,
   dificuldade 15. A causa é `subo (o|a|pel)`: a alternativa `a` não tem
   fronteira depois, então ela casa o "a" de "até".

   É o mesmo erro que `verme` dentro de "Vermelho" na etapa 8. Aqui ele
   custa mais: um teste falso interrompe a cena, gasta uma rolagem e
   ensina o jogador a não escrever naturalmente.

   Este script gera ARMADILHAS: para cada verbo que o acervo procura,
   monta frases em que a palavra seguinte começa com a mesma letra da
   alternativa curta. Se a regra casar, ela morde onde não devia. */
import fs from "node:fs";
const B = "../src/";

/* palavras comuns que começam com a/o/n/e e que NÃO são o complemento
   que a regra quer */
const ISCAS = ["até", "atrás", "agora", "ali", "assim", "antes", "aqui", "ainda", "onde", "ontem", "outra vez", "novamente", "nunca", "então", "enfim", "embora"];

const alvos = ["desafios.js", "emboscada.js", "interprete.js", "reacoes.js", "gatilhos.js", "cobranca.js"];
let total = 0;

for (const arq of alvos) {
  let s;
  try { s = fs.readFileSync(B + arq, "utf8"); } catch { continue; }
  const linhas = s.split(/\r?\n/);
  const achados = [];
  for (let li = 0; li < linhas.length; li++) {
    const m = linhas[li].match(/rx:\s*(\/(?:[^\/\\]|\\.)+\/[gimsuy]*)/);
    if (!m) continue;
    let re; try { re = eval(m[1]); } catch { continue; }
    /* o id costuma estar na linha anterior ou na mesma */
    let id = "?";
    for (let k = li; k >= Math.max(0, li - 4); k--) { const g = linhas[k].match(/id:\s*"([^"]+)"/); if (g) { id = g[1]; break; } }
    /* acha os verbos seguidos de grupo com alternativa de 1 letra */
    const fonte = m[1];
    const rxVerbo = /([a-zçãéêáíóôõ]{3,14})\s\((?:[^()]*\|)?([ao])(?:\|[^()]*)?\)/gi;
    let v;
    while ((v = rxVerbo.exec(fonte))) {
      const verbo = v[1], letra = v[2];
      for (const isca of ISCAS) {
        if (isca[0].toLowerCase() !== letra.toLowerCase()) continue;
        const frase = `${verbo} ${isca} e sigo em frente`;
        if (re.test(frase)) { achados.push({ id, linha: li + 1, frase, alternativa: `${verbo} (…|${letra}|…)` }); break; }
      }
    }
  }
  if (achados.length) {
    console.log(`\n=== ${arq} ===`);
    for (const a of achados) { console.log(`  linha ${a.linha}  [${a.id}]  morde: "${a.frase}"`); console.log(`      por causa de: ${a.alternativa}`); total++; }
  }
}
console.log(`\n${total} regra(s) que mordem palavra maior`);

process.exit(total ? 1 : 0);
