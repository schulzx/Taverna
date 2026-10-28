/* replay.mjs (Fase T3, trilha B · 28/10/2026) — a sessão como arquivo, corrida outra vez

   Lê um arquivo de sessão (src/sessao.js: a semente, o save inicial e, por
   turno, a frase, a sorte, o pedido, as respostas cruas do Narrador e do
   Cronista, o veredito do Juiz e o estado do fim do turno), corre o motor
   turno a turno com as respostas gravadas — sem React, sem rede, sem IA — e
   diz, turno a turno, se o estado saiu igual ao gravado; onde não saiu, o
   campo, os dois valores e de quem é a culpa — o DEFEITO do motor, ou a
   DÍVIDA do App (um campo que um órgão do App ainda escreve, em
   `AINDA_DO_APP`, ou o que a linha diz que o App fez naquele turno), que se
   conta à parte.

   uso: node testes/replay.mjs <arquivo.json> [--encadeado] [--ver]
     --encadeado  parte só do save inicial e nunca se ressincroniza (a
                  corrida inteira; por omissão cada turno parte do estado
                  gravado do anterior, e cada divergência diz a sua culpa)
     --ver        mostra também os turnos que reproduzem

   sai com 0 quando o motor não tem defeito (a dívida do App não conta: ela
   diverge sempre, e é a tabela que a vigia), 2 quando tem, 1 quando o
   arquivo não é válido (ou não abre).

   Os arquivos das sessões de prova (testes/sessao-s8.json, -s9, -s10) são
   escritos por `node testes/jogar-em-node.mjs --gravar`. */
import fs from "node:fs";
import { reproduzirASessao } from "../src/sessao.js";

const args = process.argv.slice(2);
const caminho = args.find((a) => !a.startsWith("--"));
const ENCADEADO = args.includes("--encadeado"), VER = args.includes("--ver");
if (!caminho) { console.log("uso: node testes/replay.mjs <arquivo.json> [--encadeado] [--ver]"); process.exit(1); }

let arquivo;
try { arquivo = JSON.parse(fs.readFileSync(caminho, "utf8")); } catch (e) { console.log(`não abre ${caminho}: ${e.message}`); process.exit(1); }

const r = reproduzirASessao(arquivo, { encadeado: ENCADEADO });
if (!r.valido) {
  console.log(`${caminho}: o arquivo não é válido (${r.erros.length} erro${r.erros.length === 1 ? "" : "s"})`);
  for (const e of r.erros.slice(0, 30)) console.log(`  ${e.caminho || "(o arquivo)"}: ${e.motivo}`);
  process.exit(1);
}

console.log(`${caminho}${arquivo.origem ? ` — ${arquivo.origem}` : ""}`);
console.log(`semente ${arquivo.semente} · ${r.turnos.length} turnos · ${ENCADEADO ? "encadeado (a partir do save inicial)" : "turno a turno (cada um a partir do gravado anterior)"}\n`);
for (const t of r.turnos) {
  if (t.igual) { if (VER) console.log(`  ${String(t.n).padStart(3)}  igual${t.app ? " (com a ajuda declarada do App: " + t.app.map((a) => a.orgao).join("; ") + ")" : ""}`); continue; }
  console.log(`  ${String(t.n).padStart(3)}  ${t.defeito ? "DIVERGE (defeito do motor)" : "diverge só na dívida do App"}`);
  for (const d of t.diferencas) console.log(`         ${d.caminho}: gravado ${d.gravado} · replay ${d.reproduzido}`);
  if (t.cronista && !t.cronista.igual) console.log(`         o juízo do Cronista: gravado ${t.cronista.gravado} · replay ${t.cronista.reproduzido}`);
  for (const d of t.divida) console.log(`         dívida (${d.de}) — ${d.campo}: ${d.caminhos.join(", ")}`);
  for (const p of t.porque) console.log(`         porquê — ${p}`);
}
const devendo = r.divida.campos.filter((d) => d.turnos.length);
console.log(`\n${r.reproduzidos} de ${r.turnos.length} turnos reproduzem${r.primeira ? `; a primeira divergência é no turno ${r.primeira}` : ""}.`);
console.log(`o motor: ${r.defeitos.length ? `DEFEITO em ${r.defeitos.length} turno${r.defeitos.length === 1 ? "" : "s"} (${r.defeitos.join(", ")})` : "nenhum defeito"}; joga sozinho ${r.soOMotor} de ${r.turnos.length}.`);
console.log(`a dívida do App: ${devendo.length} campo${devendo.length === 1 ? "" : "s"} da tabela${devendo.length ? " (" + devendo.map((d) => d.campo).join(", ") + ")" : ""}, e ${r.divida.doTurno.length} turno${r.divida.doTurno.length === 1 ? "" : "s"} em que a linha diz o que o App fez.`);
process.exit(r.defeitos.length ? 2 : 0);
