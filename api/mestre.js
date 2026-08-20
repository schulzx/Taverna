/* Função de servidor (Vercel) — Motor de IA com DOIS provedores:
   DeepSeek (padrão, baratíssimo) e Google Gemini (reserva).
   As chaves ficam AQUI, nas variáveis de ambiente — nunca no navegador:
     DEEPSEEK_API_KEY · GEMINI_API_KEY · PROVEDOR ("deepseek" | "gemini")
   Se PROVEDOR não existir, o app escolhe sozinho: DeepSeek se houver chave,
   senão Gemini. Se o provedor escolhido falhar, o outro cobre (quando tem chave).

   O jogo chama POST /api/mestre com { system, messages, maxTokens, formato, tarefa }.
   formato "json" liga saída JSON garantida (response_format / responseMimeType).
   ROTEAMENTO POR TAREFA: "leve" (livro/resumo/burocracia) vai para o modelo
   barato do provedor; "mestre" (padrão) vai para o modelo forte.
   É o mesmo princípio do resto do app: nem toda tarefa merece o modelo caro. */
export default async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ erro: "Use POST" }); return; }
  try {
    const { system, messages, maxTokens, formato, tarefa } = req.body || {};
    if (!system || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ erro: "Pedido inválido" }); return;
    }
    const teto = Math.min(Math.max(Number(maxTokens) || 1500, 800), 8192);
    const emJson = formato === "json";

    /* Erros transitórios merecem UMA retentativa com pausa antes do próximo modelo. */
    const TRANSITORIOS = [429, 500, 502, 503, 504];
    const pausa = (ms) => new Promise((ok) => setTimeout(ok, ms));

    /* ---------- DeepSeek (OpenAI-compatível) ----------
       MESTRE: deepseek-v4-pro (US$ 0,435/M in · 0,87/M out — ~14x mais barato
       que o Gemini Pro na saída). LEVE: deepseek-v4-flash (quase de graça).
       Thinking DESLIGADO: raciocínio oculto queima tokens de saída e atrasa a
       narrativa sem ganho visível para mestre de RPG com regras por código. */
    const chamarDeepSeek = async () => {
      const MODELOS = tarefa === "leve"
        ? ["deepseek-v4-flash", "deepseek-v4-pro"]
        : ["deepseek-v4-pro", "deepseek-v4-flash"];
      const msgs = [{ role: "system", content: String(system) },
        ...messages.map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: String(m.content || "") }))];
      let r = null, ultimoErro = "";
      for (const modelo of MODELOS) {
        for (let tentativa = 0; tentativa < 2; tentativa++) {
          r = await fetch("https://api.deepseek.com/chat/completions", {
            method: "POST",
            headers: {
              "content-type": "application/json",
              "authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`,
            },
            body: JSON.stringify({
              model: modelo,
              messages: msgs,
              max_tokens: teto,
              /* TEMPERATURA POR TAREFA. A burocracia (livro/resumo) fica a
                 0.3: ali criatividade é defeito — queremos fidelidade aos fatos.

                 v9.45 — O MESTRE DESCE DE 1.1 PARA 0.85. A recomendação de
                 1.3 para "escrita criativa" é dada para inglês, prosa livre e
                 prompt curto. Aqui não é nada disso: é português, é saída em
                 JSON e o prompt de sistema passa de 90 mil caracteres. Nessas
                 três condições a temperatura alta para de produzir surpresa e
                 passa a produzir ERRO DE SINTAXE — o jogador mandou uma
                 captura com "o Arco tinha fome; a laje esta; o segundo andar
                 mordiscava à toa" e "Nicolau se interessa por ninguém e por
                 dívida", frases que não querem dizer nada e não são escolha
                 estilística de ninguém.

                 v9.75 — SOBE PARA 1.0, a pedido de quem joga: "o narrador
                 ficou muito contido". O relato é o outro lado da mesma moeda
                 da v9.45, e as duas coisas são verdade ao mesmo tempo — a
                 janela entre "contido" e "agramatical" é estreita neste jogo,
                 e 1.0 fica dentro dela por pouco. É meio degrau abaixo do
                 1.1 que produziu as frases quebradas, e o prompt de sistema
                 encolheu bastante desde então (58,7k na cena comum contra os
                 90k daquela época), o que dá mais folga.

                 SE VOLTAR A SAIR PROSA QUEBRADA, o conserto não pede
                 redeploy: DS_TEMPERATURA desce para 0.9 na Vercel e vale no
                 pedido seguinte. É variável de ambiente justamente para isso. */
              temperature: tarefa === "leve" ? 0.3 : Number(process.env.DS_TEMPERATURA || 1),
              /* ---------------- A REPETIÇÃO TEM ALAVANCA PRÓPRIA (v9.75) ----------------
                 "Fica sempre repetindo coisas" é a outra metade da queixa, e
                 temperatura é o remédio errado para ela: temperatura mexe no
                 quanto o modelo ARRISCA, não no quanto ele se repete. Quem
                 mexe nisso é a penalidade de frequência, que cobra do modelo
                 cada vez que ele reusa um token que já usou — é ela que
                 desmancha o tique de reabrir toda cena com o mesmo cheiro de
                 cevada e o mesmo "o salão prende a respiração".

                 0.3 é conservador de propósito. Penalidade alta em português
                 estraga a concordância (o modelo foge das preposições e dos
                 artigos que ele já gastou), e este canal devolve JSON — o
                 mesmo risco que derrubou a temperatura na v9.45. A presença
                 fica em 0: ela empurra o modelo para ASSUNTOS novos, e assunto
                 novo é justamente o que ele não pode inventar aqui. */
              frequency_penalty: Number(process.env.DS_PENALIDADE || 0.3),
              presence_penalty: 0,
              thinking: { type: "disabled" },
              ...(emJson ? { response_format: { type: "json_object" } } : {}),
            }),
          });
          if (r.ok) break;
          ultimoErro = `${modelo}: ${r.status}`;
          if (r.status === 404 || r.status === 403 || r.status === 401 || r.status === 402) break;
          if (tentativa === 0 && TRANSITORIOS.includes(r.status)) { ultimoErro = `${modelo}: ${r.status} (retentando…)`; await pausa(1200); continue; }
          break;
        }
        if (r && r.ok) break;
      }
      if (!r || !r.ok) return { erro: ultimoErro, corpo: r ? (await r.text()).slice(0, 250) : "" };
      const data = await r.json();
      const texto = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "";
      return texto ? { texto } : { erro: "resposta vazia", corpo: "" };
    };

    /* ---------- Google Gemini (reserva) ---------- */
    const chamarGemini = async () => {
      const contents = messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: String(m.content || "") }],
      }));
      /* v9.75: o reserva também obedece à mesma régua. Ele nunca teve
         temperatura nenhuma configurada — rodava no padrão da casa do
         Google —, e por isso trocar de provedor trocava o tom do narrador
         sem que nada no jogo tivesse mudado. Duas configurações para a
         mesma decisão é a mesma coisa que duas portas para a mesma regra. */
      const generationConfig = {
        maxOutputTokens: teto,
        thinkingConfig: { thinkingLevel: "LOW" },
        temperature: tarefa === "leve" ? 0.3 : Number(process.env.DS_TEMPERATURA || 1),
        frequencyPenalty: Number(process.env.DS_PENALIDADE || 0.3),
      };
      if (emJson) generationConfig.responseMimeType = "application/json";
      const safetySettings = [
        "HARM_CATEGORY_HARASSMENT", "HARM_CATEGORY_HATE_SPEECH",
        "HARM_CATEGORY_SEXUALLY_EXPLICIT", "HARM_CATEGORY_DANGEROUS_CONTENT",
      ].map((category) => ({ category, threshold: "BLOCK_ONLY_HIGH" }));
      const MODELOS = tarefa === "leve"
        ? ["gemini-3.5-flash", "gemini-3.6-flash", "gemini-3.1-pro-preview"]
        : ["gemini-3.1-pro-preview", "gemini-3.5-flash", "gemini-3.6-flash"];
      let r = null, ultimoErro = "";
      for (const modelo of MODELOS) {
        for (let tentativa = 0; tentativa < 2; tentativa++) {
          r = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`,
            {
              method: "POST",
              headers: { "content-type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
              body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents, generationConfig, safetySettings }),
            }
          );
          if (r.ok) break;
          ultimoErro = `${modelo}: ${r.status}`;
          if (r.status === 404 || r.status === 403) break;
          if (tentativa === 0 && TRANSITORIOS.includes(r.status)) { ultimoErro = `${modelo}: ${r.status} (retentando…)`; await pausa(1200); continue; }
          break;
        }
        if (r && r.ok) break;
      }
      if (!r || !r.ok) return { erro: ultimoErro, corpo: r ? (await r.text()).slice(0, 250) : "" };
      const data = await r.json();
      const cand = data.candidates && data.candidates[0];
      const texto = ((cand && cand.content && cand.content.parts) || []).map((p) => p.text || "").filter(Boolean).join("\n");
      if (!texto) return { erro: `sem texto (${(cand && cand.finishReason) || (data.promptFeedback && data.promptFeedback.blockReason) || "vazio"})`, corpo: "" };
      return { texto };
    };

    /* ---------- Roteador de provedor ----------
       Ordem: a da variável PROVEDOR; sem ela, DeepSeek primeiro (se houver
       chave). Só entram na fila provedores COM chave configurada. */
    const preferido = (process.env.PROVEDOR || "").toLowerCase();
    const fila = [];
    if (process.env.DEEPSEEK_API_KEY) fila.push({ id: "deepseek", fn: chamarDeepSeek });
    if (process.env.GEMINI_API_KEY) fila.push({ id: "gemini", fn: chamarGemini });
    if (preferido === "gemini" || preferido === "deepseek") {
      fila.sort((a, b) => (a.id === preferido ? -1 : b.id === preferido ? 1 : 0));
    }
    if (!fila.length) { res.status(500).json({ erro: "Nenhuma chave configurada (DEEPSEEK_API_KEY / GEMINI_API_KEY)" }); return; }

    const tentativas = [];
    for (const p of fila) {
      const out = await p.fn();
      if (out.texto) { res.status(200).json({ texto: out.texto, provedor: p.id }); return; }
      tentativas.push(`${p.id} (${out.erro}${out.corpo ? `: ${out.corpo}` : ""})`);
    }
    res.status(502).json({ erro: `Todos os provedores falharam — ${tentativas.join(" · ")}`.slice(0, 400) });
  } catch (e) {
    res.status(500).json({ erro: String((e && e.message) || e).slice(0, 200) });
  }
}
