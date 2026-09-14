/* ============================================================
   SINCRONIZAR O PAINEL — Taverna
   Parte o painel.json nos dois documentos que a página lê:
   `painel/estado` (o que muda a cada ciclo — as duas filas em
   resumo, as mãos, as decisões) e `painel/registro` (os dois
   diários, as duas filas abertas, os commits). Quem os envia ao
   armazém do artefato é a sessão principal; este script só
   prepara, para que o ciclo nunca dependa de rede.

   Roda depois de painel.mjs:  node mente/sincronizar.mjs
   ============================================================ */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const p = JSON.parse(readFileSync(join(RAIZ, "mente", "painel.json"), "utf8"));
const fora = join(RAIZ, "mente", "painel");
mkdirSync(fora, { recursive: true });

/* O estado é o que a pessoa olha de relance; o registro é o que ela abre
   quando quer detalhe. A divisão não é de tamanho, é de pressa. */
const estado = {
  gerado: p.gerado, versao: p.versao, bastao: p.bastao, agentes: p.agentes,
  filas: p.filas.map((f) => ({
    id: f.id, nome: f.nome, conduz: f.conduz, ciclo: f.ciclo,
    pendentes: f.pendentes, fases: f.fases,
    nAberto: f.aberto.length,
  })),
};
const registro = {
  gerado: p.gerado, commits: p.commits,
  filas: p.filas.map((f) => ({ id: f.id, nome: f.nome, diario: f.diario, aberto: f.aberto, recusado: f.recusado })),
};

writeFileSync(join(fora, "estado.json"), JSON.stringify(estado));
writeFileSync(join(fora, "registro.json"), JSON.stringify(registro));
const kb = (o) => (JSON.stringify(o).length / 1024).toFixed(1);
console.log(`painel pronto: estado ${kb(estado)} KiB · registro ${kb(registro)} KiB`);
