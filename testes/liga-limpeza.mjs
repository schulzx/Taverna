/* App.jsx e CRLF: nada de "\n" nos padroes. */
import fs from "node:fs";
const p = "../src/App.jsx";
let s = fs.readFileSync(p, "utf8");

const troca = (de, para, esperado) => {
  const n = s.split(de).length - 1;
  if (n !== esperado) throw new Error(`"${de.slice(0, 50)}…": esperava ${esperado}, achei ${n}`);
  s = s.split(de).join(para);
};

troca(
  "if (combateRef.current) { combateRef.current = null; setCombate(null); combateOciosoRef.current = 0; }",
  "if (combateRef.current) { combateRef.current = null; setCombate(null); combateOciosoRef.current = 0; limparConjuracoesDaLuta(null); }",
  2
);
troca(
  "          combateRef.current = null; setCombate(null);\r",
  "          combateRef.current = null; setCombate(null); limparConjuracoesDaLuta(null);\r",
  1
);
troca(
  "    setCombate(null); combateRef.current = null;\r",
  "    setCombate(null); combateRef.current = null;   /* fim de campanha: nao ha ficha para limpar */\r",
  1
);

fs.writeFileSync(p, s);
console.log("limpeza ligada nos 3 fechamentos que faltavam");
