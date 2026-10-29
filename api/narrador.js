/* Função de servidor (Vercel) — o Narrador (POST /api/narrador).

   O jogo chama esta rota com { system, messages, maxTokens, formato,
   tarefa, plano, cache } e recebe { texto, provedor, plano, fila, falharam,
   cache, uso } — a mesma resposta de sempre.

   O QUE ELA FAZ É O QUE FAZIA, e a casa mudou em 29/10 (Fase 4 do plano do
   motor, trilha B): o caminho ao provedor — os planos, as casas, as
   reservas, o cache explícito do Gemini, a conta do uso — saiu à letra para
   api/_provedor.js, porque o /api/turno passou a chamar o Narrador também,
   e uma chamada só é uma verdade só. Aqui fica a porta: o portão antes de
   tudo, e o corpo entregue ao módulo. As tabelas continuam a sair por aqui
   (as suítes do Narrador leem-nas desta rota). */
import { chamarOProvedor } from "./_provedor.js";
import { deixarEntrar } from "./_portao.js";

export { PROVEDORES, PLANOS, CRONISTA, RESERVAS, REGUA_DA_REDE, SEM_SALDO, PISO_DO_PENSAMENTO, REDE_DE_SAIDA, redeDaTarefa, planoDoPedido, rotaDoPedido } from "./_provedor.js";

export default async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ erro: "Use POST" }); return; }
  /* v9.155: O PORTAO. Sem ele esta rota respondia a internet inteira —
     e quem achasse a URL gastaria as chaves de graca, sem nem abrir o
     jogo. Vem antes de tudo: nao se paga pela contagem de um robo. */
  { const p = await deixarEntrar(req); if (!p.ok) { res.status(p.status).json({ erro: p.erro, motivo: p.motivo, origem: p.origem }); return; } }
  const { status, corpo } = await chamarOProvedor(req.body);
  res.status(status).json(corpo);
}
