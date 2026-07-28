/* Função de servidor (Vercel) — Motor: Google Gemini (com lista de fallback).
   A chave fica AQUI, na variável de ambiente GEMINI_API_KEY — nunca no navegador.
   O jogo chama POST /api/mestre com { system, messages, maxTokens, formato, tarefa }.
   formato "json" liga o modo de saída JSON garantida do Gemini (adeus JSON quebrado).
   ROTEAMENTO POR TAREFA: "leve" (livro/resumo/burocracia) vai SÓ para modelos Flash
   (baratíssimos); "mestre" (padrão) tenta o Pro e cai para Flash se indisponível.
   É o mesmo princípio do resto do app: nem toda tarefa merece o modelo caro. */
export default async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ erro: "Use POST" }); return; }
  try {
    const { system, messages, maxTokens, formato, tarefa } = req.body || {};
    if (!system || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ erro: "Pedido inválido" }); return;
    }

    /* Formato Anthropic -> formato Gemini: assistant vira "model" */
    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: String(m.content || "") }],
    }));

    /* Respeita o teto pedido pelo app (padrão 1500). O mínimo de 800 evita
       truncamento do JSON; o teto de 8192 barra respostas descontroladas.
       Antes havia um piso de 4096 — todo turno pagava teto 4× maior que o necessário. */
    const generationConfig = {
      maxOutputTokens: Math.min(Math.max(Number(maxTokens) || 1500, 800), 8192),
    };
    if (formato === "json") generationConfig.responseMimeType = "application/json";
    /* Gemini 3 Pro sempre "pensa"; o padrão HIGH consome o orçamento de saída e
       trunca a narrativa. LOW deixa espaço para o texto completo (e é mais barato). */
    generationConfig.thinkingConfig = { thinkingLevel: "LOW" };

    /* RPG tem combate; sem isto o filtro padrão pode bloquear narrativa de luta */
    const safetySettings = [
      "HARM_CATEGORY_HARASSMENT",
      "HARM_CATEGORY_HATE_SPEECH",
      "HARM_CATEGORY_SEXUALLY_EXPLICIT",
      "HARM_CATEGORY_DANGEROUS_CONTENT",
    ].map((category) => ({ category, threshold: "BLOCK_ONLY_HIGH" }));

    /* Modelos em ordem de preferência.
       MESTRE (narração): Pro primeiro (conta com faturamento), Flash como reserva.
       LEVE (livro/resumo/burocracia): só Flash — qualidade narrativa não importa,
       custo quase zero. É aqui que mora a economia das assinaturas baratas. */
    const MODELOS = tarefa === "leve"
      ? ["gemini-3.5-flash", "gemini-3.6-flash"]
      : ["gemini-3.1-pro-preview", "gemini-3.5-flash", "gemini-3.6-flash"];

    let r = null, ultimoErro = "";
    for (const modelo of MODELOS) {
      r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`,
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
      if (r.ok) break;
      ultimoErro = `${modelo}: ${r.status}`;
      if (![404, 403, 429].includes(r.status)) break; /* indisponível/sem permissão/sem cota: tenta o próximo */
    }

    if (!r || !r.ok) {
      const t = r ? await r.text() : "";
      res.status(502).json({ erro: `API (${ultimoErro}): ${t.slice(0, 250)}` });
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
