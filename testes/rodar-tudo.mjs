/* A PROVA DA CASA — roda toda suíte e todo varredor de uma vez.

   Cada suíte é um programa independente que sai com código != 0 quando
   falha. Não há framework: a suíte é o teste, e o `node` é o corredor.
   O preço disso é não ter relatório bonito; o ganho é que nenhuma delas
   depende de configuração, plugin ou versão de biblioteca para dizer a
   verdade sobre o módulo que ela mede.

   O `chdir` da primeira linha é a única coisa que mudou quando elas
   saíram do %TEMP%: as suítes leem `../src/App.jsx` com `readFileSync`,
   que resolve pelo diretório de trabalho e não pelo do módulo. Sem esta
   linha, `npm test` da raiz procuraria `src/` um nível acima do repo e
   toda suíte que lê o App quebraria — todas de uma vez, e por um motivo
   que não tem nada a ver com o código que elas medem. */

import { readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

process.chdir(dirname(fileURLToPath(import.meta.url)));

/* Duas famílias, e a diferença importa. A SUÍTE mede um módulo: ela
   sabe o que aquele módulo deveria fazer e confere. O VARREDOR mede o
   repositório inteiro procurando uma classe de defeito que já mordeu
   antes — import que falta, ref fora de escopo, regra escrita sem
   código atrás. Suíte falha quando o módulo mudou; varredor falha
   quando um erro velho voltou. */
const suites = readdirSync(".").filter((f) => /^teste-.*\.mjs$/.test(f)).sort();
const varredores = readdirSync(".").filter((f) => /^check-.*\.mjs$/.test(f)).sort();

const rodar = (arqs, rotulo) => {
  let ok = 0; const ruins = [];
  for (const a of arqs) {
    const r = spawnSync(process.execPath, [a], { encoding: "utf8", timeout: 120000 });
    if (r.status === 0) ok++;
    else { ruins.push(a); console.log(`\n✗ ${a}\n${(r.stdout || "").split("\n").slice(-14).join("\n")}${(r.stderr || "").slice(0, 900)}`); }
  }
  console.log(`\n${ok}/${arqs.length} ${rotulo}` + (ruins.length ? ` · FALHARAM: ${ruins.join(" ")}` : ""));
  return ruins.length;
};

const maus = rodar(suites, "suítes verdes") + rodar(varredores, "varredores limpos");
process.exit(maus ? 1 : 0);
