/* Função de servidor (Vercel) — o Narrador, roteado por PLANO (v9.466).

   A pessoa decidiu em 13/10, depois de duas rodadas de teste cego de
   provedores (mente/ab-provedores.md): "já que teremos duas assinaturas,
   uma de entrada e a superior, colocamos o modelo barato na de entrada e
   o gpt sol na superior; entretanto agora nos testes e desenvolvimento
   vamos trabalhar apenas com a base."

   Então o Narrador deixa de ter modelo escrito no código. Tem PLANO, e o
   plano diz qual modelo responde — por variável de ambiente, com padrão
   aqui na tabela (PLANOS, logo abaixo):

     plano      variável            padrão                 casa (chave)
     base       NARRADOR_BASE       gemini-3.8-flash       Google direto (GEMINI_API_KEY)
     superior   NARRADOR_SUPERIOR   openai/gpt-5.6-sol     OpenRouter (OPENROUTER_API_KEY)
     cronista   CRONISTA_MODELO     deepseek-v4-flash      DeepSeek (DEEPSEEK_API_KEY)

   PLANO_PADRAO (padrão "base") é o plano de quem não pede nenhum.

   A CASA SAI DO NOME DO MODELO, não de uma segunda variável: um id com
   barra ("openai/gpt-5.6-sol") é do OpenRouter, "gemini-…" é do Google,
   "deepseek-…" é da DeepSeek. Trocar o modelo de um plano é mudar UMA
   variável na Vercel, e a casa vem junto — duas variáveis para a mesma
   decisão é como esta casa fabrica configuração que se contradiz.

   O SUPERIOR ESTÁ DESLIGADO até existir assinatura. Só se usa quando as
   TRÊS coisas valem: o pedido pede `plano: "superior"`, a chave da casa
   dele existe, e PLANO_SUPERIOR_LIGADO=1 na Vercel. Sem a terceira, o
   pedido cai no base em silêncio — senão qualquer um que abrisse o
   console do navegador escolhia o modelo caro sozinho, e a conta seria
   de quem paga, não de quem pediu.

   A RESERVA. Se o modelo do plano falha (erro, 402, 429, resposta vazia),
   o turno vai para o DeepSeek v4-pro — o Narrador de antes, que já se
   conhece —, e depois para o que houver (RESERVAS). O jogador nunca vê a
   troca: o sistema não fala de si mesmo. Quem investiga vê no corpo da
   resposta (`provedor`, `fila`, `falharam`) e no console do App.

   As chaves ficam AQUI, nas variáveis de ambiente — nunca no navegador.

   O jogo chama POST /api/narrador com
   { system, messages, maxTokens, formato, tarefa, plano }.
   formato "json" liga saída JSON garantida (response_format / responseMimeType).
   tarefa "leve" (livro/resumo/burocracia) vai para o Cronista; o resto
   ("narrador", o padrão) vai para o modelo do plano. */
import { lerUso } from "../src/custo.js";

import { deixarEntrar } from "./_portao.js";

/* ---------------- AS CASAS ----------------
   Onde mora a chave de cada provedor, e como reconhecer um modelo dele
   pelo id. A ordem importa: a barra vem primeiro, porque o OpenRouter
   serve também modelos que se chamam "google/gemini-…" e "deepseek/…" —
   e esses pedem a chave do OpenRouter, não a do Google. */
export const PROVEDORES = [
  { id: "openrouter", chave: "OPENROUTER_API_KEY", reconhece: (m) => m.includes("/") },
  { id: "gemini", chave: "GEMINI_API_KEY", reconhece: (m) => m.startsWith("gemini") },
  { id: "deepseek", chave: "DEEPSEEK_API_KEY", reconhece: (m) => m.startsWith("deepseek") },
];
const casaDoModelo = (modelo) => PROVEDORES.find((p) => p.reconhece(String(modelo || "").toLowerCase())) || null;

/* ---------------- OS PLANOS ----------------
   O padrão de cada um é o vencedor do teste cego de 13/10:
   · base — Gemini 3.8 Flash: nota 8,7 contra 6,8 do DeepSeek em produção,
     o único barato melhor em TODOS os critérios (cumpre a pauta 1,92
     contra 1,08). US$ 0,60 por sessão com o cache a 85%.
   · superior — GPT-5.6 Sol: o único que cumpriu tudo (9,4), PT-BR
     impecável; US$ 1,67 por sessão. Medido em só 5 pautas.
   · cronista — DeepSeek v4 Flash: ~1% da conta, e não pede escrita fina.
   O id do Gemini é o da API do Google ("gemini-3.8-flash", estável, sem
   "-preview", conferido na doc oficial em 13/10). */
export const PLANOS = {
  base: { variavel: "NARRADOR_BASE", padrao: "gemini-3.8-flash" },
  superior: { variavel: "NARRADOR_SUPERIOR", padrao: "openai/gpt-5.6-sol", trava: "PLANO_SUPERIOR_LIGADO" },
};
export const CRONISTA = { variavel: "CRONISTA_MODELO", padrao: "deepseek-v4-flash" };

/* A fila de reserva por tarefa. "@base" é o modelo do plano base, seja
   ele qual for na Vercel. Um modelo já tentado não entra duas vezes, e um
   modelo sem chave configurada não entra nenhuma. */
export const RESERVAS = {
  narrador: ["deepseek-v4-pro", "@base", "deepseek-v4-flash"],
  leve: ["deepseek-v4-pro", "@base"],
};

/* A régua da rede. Um 5xx merece UMA retentativa com pausa antes do
   próximo modelo; um 429 não — limite de taxa não passa em 1,2 s, e a
   reserva responde mais depressa do que a segunda tentativa falharia. */
export const REGUA_DA_REDE = { retentaEm: [500, 502, 503, 504], pausaMs: 1200, corpoMax: 250 };

const modeloDe = (entrada, env) => String(env[entrada.variavel] || entrada.padrao).trim();

/* O plano que vale para este pedido — nunca o superior sem a trava. */
export function planoDoPedido(pedido, env = process.env) {
  const e = env || {};
  const pedidoNome = pedido && typeof pedido === "object" ? pedido.plano : null;
  const nome = String(pedidoNome || e.PLANO_PADRAO || "base").toLowerCase();
  if (nome !== "superior") return "base";
  const casa = casaDoModelo(modeloDe(PLANOS.superior, e));
  const ligado = String(e[PLANOS.superior.trava] || "") === "1";
  return ligado && casa && e[casa.chave] ? "superior" : "base";
}

/* A ROTA: a lista ordenada de { provedor, modelo } que este pedido vai
   tentar. É função pura do pedido e do ambiente — a suíte a prova sem
   rede nenhuma. */
export function rotaDoPedido(pedido, env = process.env) {
  const e = env || {};
  const leve = !!(pedido && typeof pedido === "object" && pedido.tarefa === "leve");
  const plano = planoDoPedido(pedido, e);
  const base = modeloDe(PLANOS.base, e);
  const primeiro = leve ? modeloDe(CRONISTA, e) : modeloDe(PLANOS[plano], e);
  const candidatos = [primeiro, ...RESERVAS[leve ? "leve" : "narrador"].map((m) => (m === "@base" ? base : m))];
  const passos = [], vistos = new Set();
  for (const modelo of candidatos) {
    const casa = casaDoModelo(modelo);
    if (!modelo || vistos.has(modelo) || !casa || !e[casa.chave]) continue;
    vistos.add(modelo);
    passos.push({ provedor: casa.id, modelo });
  }
  return { plano, passos };
}

export default async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ erro: "Use POST" }); return; }
  /* v9.155: O PORTAO. Sem ele esta rota respondia a internet inteira —
     e quem achasse a URL gastaria as chaves de graca, sem nem abrir o
     jogo. Vem antes de tudo: nao se paga pela contagem de um robo. */
  { const p = await deixarEntrar(req); if (!p.ok) { res.status(p.status).json({ erro: p.erro, motivo: p.motivo, origem: p.origem }); return; } }
  try {
    const corpo = req.body || {};
    const { system, messages, maxTokens, formato, tarefa } = corpo;
    if (!system || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ erro: "Pedido inválido" }); return;
    }
    const teto = Math.min(Math.max(Number(maxTokens) || 1500, 800), 8192);
    const emJson = formato === "json";
    const env = process.env;

    const pausa = (ms) => new Promise((ok) => setTimeout(ok, ms));
    /* Um pedido, com a retentativa da régua. Devolve a resposta boa, ou o
       erro no formato que `guardado.js` lê ("<modelo>: <status>" e o
       começo do corpo — é nele que viaja o "insufficient balance"). */
    const pedir = async (modelo, fazer) => {
      let r = null;
      for (let tentativa = 0; tentativa < 2; tentativa++) {
        r = await fazer();
        if (r.ok) return { r };
        if (tentativa === 0 && REGUA_DA_REDE.retentaEm.includes(r.status)) { await pausa(REGUA_DA_REDE.pausaMs); continue; }
        break;
      }
      const txt = await r.text().catch(() => "");
      return { erro: `${modelo}: ${r.status}`, corpo: String(txt || "").slice(0, REGUA_DA_REDE.corpoMax) };
    };
    const msgsOpenAI = () => [{ role: "system", content: String(system) },
      ...messages.map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: String(m.content || "") }))];
    const textoOpenAI = (data) => (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "";

    /* ---------- DeepSeek (OpenAI-compatível) ----------
       Hoje: o Cronista (v4-flash) e a reserva do Narrador (v4-pro).
       Thinking DESLIGADO: raciocínio oculto queima tokens de saída e atrasa a
       narrativa sem ganho visível para mestre de RPG com regras por código. */
    const chamarDeepSeek = async (modelo) => {
      const p = await pedir(modelo, () => fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "authorization": `Bearer ${env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: modelo,
          messages: msgsOpenAI(),
          max_tokens: teto,
          /* TEMPERATURA POR TAREFA. A burocracia (livro/resumo) fica a
             0.3: ali criatividade é defeito — queremos fidelidade aos fatos.

             v9.45 — O NARRADOR DESCE DE 1.1 PARA 0.85. A recomendação de
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
          temperature: tarefa === "leve" ? 0.3 : Number(env.DS_TEMPERATURA || 1),
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
          frequency_penalty: Number(env.DS_PENALIDADE || 0.3),
          presence_penalty: 0,
          thinking: { type: "disabled" },
          ...(emJson ? { response_format: { type: "json_object" } } : {}),
        }),
      }));
      if (!p.r) return p;
      const data = await p.r.json();
      const texto = textoOpenAI(data);
      const uso = lerUso(data);
      return texto ? { texto, uso: uso ? { ...uso, modelo: data.model || modelo } : null } : { erro: "resposta vazia", corpo: "" };
    };

    /* ---------- Google Gemini (o plano base) ---------- */
    const chamarGemini = async (modelo) => {
      const contents = messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: String(m.content || "") }],
      }));
      /* v9.75: o Gemini também obedece à mesma régua. Ele nunca teve
         temperatura nenhuma configurada — rodava no padrão da casa do
         Google —, e por isso trocar de provedor trocava o tom do narrador
         sem que nada no jogo tivesse mudado. */
      const generationConfig = {
        maxOutputTokens: teto,
        /* O PENSAMENTO NO CHÃO (v9.466). Os tokens de pensamento do Gemini
           são cobrados como SAÍDA (US$ 3,75/M no 3.8 Flash), e o teste cego
           correu sem eles. Pela doc do Google (13/10), o 3.8 Flash aceita só
           LOW, MEDIUM e HIGH — o MINIMAL dos Flash anteriores ele recusa, e
           desligar de todo não existe na família 3. LOW é o chão. Se um dia
           o NARRADOR_BASE for um modelo que aceite menos, GM_PENSAMENTO
           desce sem redeploy. */
        thinkingConfig: { thinkingLevel: String(env.GM_PENSAMENTO || "LOW") },
        /* ---------------- O MESMO NÚMERO NÃO É A MESMA COISA (v9.115) ----------------
           A v9.75 pôs os dois provedores sob a mesma régua, e a razão escrita
           era boa: "duas configurações para a mesma decisão é a mesma coisa
           que duas portas para a mesma regra". Só que aqui não são duas
           portas para a mesma regra — são duas ESCALAS diferentes com o
           mesmo nome. `frequency_penalty` da OpenAI e `frequencyPenalty` do
           Gemini não têm a mesma unidade nem o mesmo efeito, e 0,3 num não
           quer dizer 0,3 no outro. Copiar o número entre os dois é a mesma
           classe de erro que copiar uma tabela de peso: parece uma regra só,
           e são duas contas.

           E o risco não é hipotético neste arquivo: o comentário do DeepSeek
           logo acima já avisa que penalidade alta em português "estraga a
           concordância — o modelo foge das preposições e dos artigos que ele
           já gastou". É exatamente o defeito que o jogador relatou. No
           Gemini, que ninguém nunca mediu, ela vai a ZERO: a anti-repetição
           que ela comprava vale menos do que a gramática que ela pode custar,
           e o Gemini repete menos que o DeepSeek de saída.

           v9.466 — E A ZERO ELA NEM VIAJA. O teste cego de 13/10 correu o
           3.8 Flash a 0,85 e sem penalidade (e foi o melhor barato), e o
           OpenRouter nem lista `frequency_penalty` entre os parâmetros que
           ele aceita: há modelos Gemini que devolvem 400 só por o campo
           existir. Um 400 aqui mandaria TODO turno para a reserva, em
           silêncio. Então o campo só vai quando GM_PENALIDADE pede um
           número diferente de zero. */
        temperature: tarefa === "leve" ? 0.3 : Number(env.GM_TEMPERATURA || 0.85),
      };
      const penalidade = Number(env.GM_PENALIDADE || 0);
      if (penalidade) generationConfig.frequencyPenalty = penalidade;
      if (emJson) generationConfig.responseMimeType = "application/json";
      const safetySettings = [
        "HARM_CATEGORY_HARASSMENT", "HARM_CATEGORY_HATE_SPEECH",
        "HARM_CATEGORY_SEXUALLY_EXPLICIT", "HARM_CATEGORY_DANGEROUS_CONTENT",
      ].map((category) => ({ category, threshold: "BLOCK_ONLY_HIGH" }));
      /* O CACHE DO GEMINI É IMPLÍCITO: o Google relê sozinho o PREFIXO que
         já viu, e o devolve em `usageMetadata.cachedContentTokenCount`
         (que `lerUso` lê). O prefixo aqui é o `systemInstruction` e depois
         o histórico — a mesma ordem que a v9.465 arrumou para o DeepSeek. */
      const p = await pedir(modelo, () => fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`,
        {
          method: "POST",
          headers: { "content-type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
          body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents, generationConfig, safetySettings }),
        }
      ));
      if (!p.r) return p;
      const data = await p.r.json();
      const cand = data.candidates && data.candidates[0];
      const texto = ((cand && cand.content && cand.content.parts) || []).filter((x) => !x.thought).map((x) => x.text || "").filter(Boolean).join("\n");
      if (!texto) return { erro: `sem texto (${(cand && cand.finishReason) || (data.promptFeedback && data.promptFeedback.blockReason) || "vazio"})`, corpo: "" };
      const uso = lerUso(data);
      return { texto, uso: uso ? { ...uso, modelo: data.modelVersion || modelo } : null };
    };

    /* ---------- OpenRouter (o plano superior) ----------
       OpenAI-compatível, como o DeepSeek. Só o superior passa por aqui —
       o base vai direto ao Google, que é mais barato e tem cache implícito
       sem intermediário. Os cabeçalhos HTTP-Referer e X-Title são os que o
       OpenRouter recomenda para identificar o aplicativo. */
    const chamarOpenRouter = async (modelo) => {
      const site = env.VERCEL_PROJECT_PRODUCTION_URL || env.VERCEL_URL || "";
      const ordem = String(env.OR_PROVEDORES || "").split(",").map((s) => s.trim()).filter(Boolean);
      const p = await pedir(modelo, () => fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "authorization": `Bearer ${env.OPENROUTER_API_KEY}`,
          ...(site ? { "HTTP-Referer": `https://${String(site).replace(/^https?:\/\//, "")}` } : {}),
          "X-Title": "Taverna",
        },
        body: JSON.stringify({
          model: modelo,
          messages: msgsOpenAI(),
          max_tokens: teto,
          /* A temperatura do teste cego (0,85), e sem penalidade: o GPT-5.6
             Sol não lista nenhuma das duas entre os parâmetros que aceita,
             e o OpenRouter descarta em silêncio o que o modelo não aceita —
             por isso NÃO vai `require_parameters`, que transformaria isso
             num erro. O raciocínio desligado é o mesmo do teste (0 tokens
             de raciocínio em todos os modelos). */
          temperature: tarefa === "leve" ? 0.3 : Number(env.OR_TEMPERATURA || 0.85),
          reasoning: { enabled: false },
          usage: { include: true },
          ...(ordem.length ? { provider: { order: ordem, allow_fallbacks: true } } : {}),
          ...(emJson ? { response_format: { type: "json_object" } } : {}),
        }),
      }));
      if (!p.r) return p;
      const data = await p.r.json();
      const texto = textoOpenAI(data);
      const uso = lerUso(data);
      return texto ? { texto, uso: uso ? { ...uso, modelo: data.model || modelo } : null } : { erro: "resposta vazia", corpo: "" };
    };

    const CHAMAR = { deepseek: chamarDeepSeek, gemini: chamarGemini, openrouter: chamarOpenRouter };
    const rota = rotaDoPedido(corpo, env);
    if (!rota.passos.length) { res.status(500).json({ erro: "Nenhuma chave configurada (GEMINI_API_KEY / DEEPSEEK_API_KEY / OPENROUTER_API_KEY)" }); return; }

    const tentativas = [];
    for (const passo of rota.passos) {
      const out = await CHAMAR[passo.provedor](passo.modelo);
      /* QUEM ESTAVA NA FILA, e não só quem respondeu (v9.116).

         Custou uma investigação inteira: o cliente no ar já tinha o código
         de hoje, o pedido pedia `gemini`, e a resposta vinha `deepseek`.
         O único ramo que produz isso é a fila não TER o gemini — mas de
         fora não havia como distinguir "não configurado" de "configurado e
         falhou em silêncio", porque as duas coisas devolvem a mesma
         palavra. Uma linha aqui responde as duas para sempre.

         E `falharam` responde a pergunta seguinte, que so apareceu depois:
         a fila TINHA o gemini, ele estava na FRENTE, e mesmo assim quem
         respondeu foi o deepseek. Ou seja, o reserva foi tentado e caiu —
         em silencio, porque so o 502 (todos falharam) contava o motivo. Um
         reserva que nunca funciona nao e um reserva: e um jogo sem Mestre
         no dia em que o primeiro sair do ar.

         v9.466: a fila diz também o MODELO de cada passo, e a resposta diz
         o plano — com dois modelos na mesma casa (o Cronista e a reserva
         são os dois DeepSeek), o nome da casa sozinho já não responde. */
      if (out.texto) { res.status(200).json({ texto: out.texto, provedor: passo.provedor, plano: rota.plano, fila: rota.passos.map((x) => `${x.provedor}:${x.modelo}`), falharam: tentativas, uso: out.uso ? { ...out.uso, tarefa: tarefa || "narrador" } : null }); return; }
      tentativas.push(`${passo.provedor} (${out.erro}${out.corpo ? `: ${out.corpo}` : ""})`);
    }
    res.status(502).json({ erro: `Todos os provedores falharam — ${tentativas.join(" · ")}`.slice(0, 400) });
  } catch (e) {
    res.status(500).json({ erro: String((e && e.message) || e).slice(0, 200) });
  }
}
