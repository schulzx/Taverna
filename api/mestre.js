/* Função de servidor (Vercel) — Motor: Google Gemini 3.1 Pro.
   A chave fica AQUI, na variável de ambiente GEMINI_API_KEY — nunca no navegador.
   O jogo chama POST /api/mestre com { system, messages, maxTokens, formato }.
   formato "json" liga o modo de saída JSON garantida do Gemini (adeus JSON quebrado). */
export default async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ erro: "Use POST" }); return; }
  try {
    const { system, messages, maxTokens, formato } = req.body || {};
    if (!system || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ erro: "Pedido inválido" }); return;
    }

    /* Formato Anthropic -> formato Gemini: assistant vira "model" */
    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: String(m.content || "") }],
    }));

    const generationConfig = {
      maxOutputTokens: Math.min(Math.max(Number(maxTokens) || 1000, 1200), 2048),
      temperature: 1.0,
    };
    if (formato === "json") generationConfig.responseMimeType = "application/json";

    /* RPG tem combate; sem isto o filtro padrão pode bloquear narrativa de luta */
    const safetySettings = [
      "HARM_CATEGORY_HARASSMENT",
      "HARM_CATEGORY_HATE_SPEECH",
      "HARM_CATEGORY_SEXUALLY_EXPLICIT",
      "HARM_CATEGORY_DANGEROUS_CONTENT",
    ].map((category) => ({ category, threshold: "BLOCK_ONLY_HIGH" }));

    const r = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro:generateContent",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents,
          generationConfig,
          safetySettings,
        }),
      }
    );

    if (!r.ok) {
      const t = await r.text();
      res.status(502).json({ erro: `API ${r.status}: ${t.slice(0, 300)}` });
      return;
    }

    const data = await r.json();
    const cand = data.candidates && data.candidates[0];
    const texto = ((cand && cand.content && cand.content.parts) || [])
      .map((p) => p.text || "")
      .filter(Boolean)
      .join("\n");

    if (!texto) {
      const motivo =
        (cand && cand.finishReason) ||
        (data.promptFeedback && data.promptFeedback.blockReason) ||
        "resposta vazia";
      res.status(502).json({ erro: `Mestre sem texto (${motivo})` });
      return;
    }

    res.status(200).json({ texto });
  } catch (e) {
    res.status(500).json({ erro: String((e && e.message) || e).slice(0, 200) });
  }
}
