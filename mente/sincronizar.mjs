/* ============================================================
   SINCRONIZAR O PAINEL — Taverna
   Parte o painel.json nos dois documentos que a página lê:
   `painel/estado` (o que muda a cada ciclo, pequeno) e
   `painel/registro` (o histórico, grande). Quem os envia ao
   armazém do artefato é a sessão principal — este script só
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

/* `atividade` é o que só a sessão principal sabe: qual mão está na mesa
   agora. O ciclo não a apaga — preserva o que já estava escrito. */
let atividade = [];
try { atividade = JSON.parse(readFileSync(join(fora, "estado.json"), "utf8")).atividade || []; } catch {}

const estado = { gerado: p.gerado, versao: p.versao, ciclo: p.ciclo, agentes: p.agentes, pendentes: p.pendentes, fases: p.fases, atividade };
const registro = { gerado: p.gerado, diario: p.diario, aberto: p.aberto, recusado: p.recusado, commits: p.commits };

writeFileSync(join(fora, "estado.json"), JSON.stringify(estado));
writeFileSync(join(fora, "registro.json"), JSON.stringify(registro));
const kb = (o) => (JSON.stringify(o).length / 1024).toFixed(1);
console.log(`painel pronto: estado ${kb(estado)} KiB · registro ${kb(registro)} KiB`);
