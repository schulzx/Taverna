/* Função de servidor (Vercel). A chave da API fica AQUI, em variável de
   ambiente — nunca no navegador. O jogo chama POST /api/mestre. */
export default async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ erro: "Use POST" }); return; }
  try {
    const { system, messages, maxTokens } = req.body || {};
    if (!system || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ erro: "Pedido inválido" }); return;
    }
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: Math.min(Number(maxTokens) || 1000, 1200),
        system,
        messages,
      }),
    });
    if (!r.ok) {
      const t = await r.text();
      res.status(502).json({ erro: `API ${r.status}: ${t.slice(0, 200)}` });
      return;
    }
    const data = await r.json();
    const texto = (data.content || [])
      .map((c) => (c.type === "text" ? c.text : ""))
      .filter(Boolean)
      .join("\n");
    res.status(200).json({ texto });
  } catch (e) {
    res.status(500).json({ erro: String((e && e.message) || e).slice(0, 200) });
  }
}
