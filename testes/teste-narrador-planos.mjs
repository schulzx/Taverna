/* O NARRADOR POR PLANO (v9.466)

   A pessoa decidiu em 13/10: o modelo barato na assinatura de entrada
   (base = Gemini 3.8 Flash, direto no Google), o GPT-5.6 Sol na superior
   (pelo OpenRouter), e por agora só a base. Esta suíte guarda as quatro
   coisas que, se quebrassem, ninguém veria na tela — porque o sistema
   não fala de si mesmo, e a troca de modelo é silenciosa de propósito:

   1. a ROTA: qual modelo responde a qual pedido, saída de tabela;
   2. a TRAVA: o superior não se liga pelo navegador — sem
      PLANO_SUPERIOR_LIGADO=1 na Vercel, pedir "superior" dá base;
   3. a RESERVA: o plano que cai (402, 429, vazio) passa ao DeepSeek
      v4-pro sem o jogador saber, e o 502 final ainda fala a língua que o
      `guardado.js` lê;
   4. o USO: as três casas contam o cache com nomes diferentes, e a conta
      só é verdade se `lerUso` lê os três.

   Rede nenhuma: o `fetch` é falso, e o ambiente é guardado e devolvido. */

const N = await import("../api/narrador.js");
const C = await import("../src/custo.js");
const { readFileSync } = await import("node:fs");
const FONTE = readFileSync(new URL("../api/narrador.js", import.meta.url), "utf8");

let bons = 0, maus = 0;
const t = (n, c) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n); } };
const sec = (s) => console.log("\n" + s);

/* chaves de mentira — o teste só precisa de que EXISTAM */
const TODAS = { GEMINI_API_KEY: "g-falsa", DEEPSEEK_API_KEY: "d-falsa", OPENROUTER_API_KEY: "o-falsa" };
const rota = (pedido, env, opcoes) => N.rotaDoPedido(pedido, env, opcoes);
const ids = (r) => r.passos.map((p) => `${p.provedor}:${p.modelo}`).join(" > ");

sec("1. A ROTA SAI DA TABELA");
{
  const r = rota({}, TODAS);
  t("sem pedir nada, o plano é o base", r.plano === "base");
  t("o base é o Gemini 3.8 Flash, direto no Google", r.passos[0].provedor === "gemini" && r.passos[0].modelo === "gemini-3.8-flash");
  t("e o padrão mora na tabela, não solto", N.PLANOS.base.padrao === "gemini-3.8-flash" && N.PLANOS.superior.padrao === "openai/gpt-5.6-sol");
  /* MM11 · 11.ª sessão (13/10): a fila do Narrador ganhou o Cronista (o
     Flash-Lite) no FIM — outra cota da mesma casa, para o dia do 429 com a
     DeepSeek sem saldo. A asserção antiga ("… > deepseek-v4-flash") mudou
     por isso, não por a reserva ter deixado de ser o DeepSeek v4-pro. */
  t("a reserva é o DeepSeek v4-pro, depois o que houver",
    ids(r) === "gemini:gemini-3.8-flash > deepseek:deepseek-v4-pro > deepseek:deepseek-v4-flash > gemini:gemini-3.5-flash-lite");
  /* o Cronista não é do plano: é burocracia, e fica no barato. MM11 ·
     11.ª sessão: era o DeepSeek Flash, e a conta da DeepSeek estava sem
     saldo — cada chamada leve pagava dois 402 antes de o Gemini 3.8 a
     atender. Agora é o Flash-Lite do Google, e o DeepSeek é a reserva. */
  const leve = rota({ tarefa: "leve" }, TODAS);
  t("o Cronista é o Flash-Lite do Google, com o DeepSeek de reserva", ids(leve) === "gemini:gemini-3.5-flash-lite > deepseek:deepseek-v4-flash > gemini:gemini-3.8-flash");
  t("e pedir o superior não muda o Cronista", rota({ tarefa: "leve", plano: "superior" }, { ...TODAS, PLANO_SUPERIOR_LIGADO: "1" }).passos[0].modelo === "gemini-3.5-flash-lite");
  /* a casa sem saldo sai da fila inteira, pelo prazo da tabela */
  const riscada = rota({ tarefa: "leve" }, TODAS, { semSaldo: { deepseek: 5000 }, agora: 1000 });
  t("uma casa riscada por 402 não entra na fila", !riscada.passos.some((p) => p.provedor === "deepseek"));
  t("e volta quando o prazo passa", rota({ tarefa: "leve" }, TODAS, { semSaldo: { deepseek: 5000 }, agora: 6000 }).passos.some((p) => p.provedor === "deepseek"));
  t("opções nulas não estouram a rota", rota({}, TODAS, null).passos.length === 4 && N.SEM_SALDO.minutos > 0 && N.SEM_SALDO.status.includes(402));
  /* trocar o modelo é mudar UMA variável — a casa vem do nome */
  const outro = rota({}, { ...TODAS, NARRADOR_BASE: "deepseek-v4-pro" });
  t("NARRADOR_BASE com um DeepSeek vai à DeepSeek", outro.passos[0].provedor === "deepseek" && outro.passos[0].modelo === "deepseek-v4-pro");
  t("e o mesmo modelo não é tentado duas vezes", outro.passos.filter((p) => p.modelo === "deepseek-v4-pro").length === 1);
  t("um id com barra é do OpenRouter", rota({}, { ...TODAS, NARRADOR_BASE: "google/gemini-3.8-flash" }).passos[0].provedor === "openrouter");
  t("CRONISTA_MODELO troca o Cronista", rota({ tarefa: "leve" }, { ...TODAS, CRONISTA_MODELO: "gemini-3.6-flash" }).passos[0].provedor === "gemini");
  /* O DIA DO DEPLOY: o código sobe antes de a chave do Google estar na
     Vercel. Nesse dia o jogo tem de continuar a ter Mestre — o de antes. */
  const semGoogle = rota({}, { DEEPSEEK_API_KEY: "d" });
  t("sem GEMINI_API_KEY, o Narrador é o DeepSeek v4-pro de sempre", ids(semGoogle) === "deepseek:deepseek-v4-pro > deepseek:deepseek-v4-flash");
  t("sem chave nenhuma, a fila é vazia", rota({}, {}).passos.length === 0);
  t("modelo de casa desconhecida não entra", rota({}, { ...TODAS, NARRADOR_BASE: "llama-9" }).passos[0].modelo === "deepseek-v4-pro");
  /* lixo não derruba a rota */
  let vivo = true;
  try { rota(null, TODAS); rota(undefined, null); N.planoDoPedido(null, null); rota({ plano: 7 }, TODAS); } catch { vivo = false; }
  t("pedido nulo, ambiente nulo e plano torto não estouram", vivo);
  t("plano inventado vira base", rota({ plano: "ouro" }, TODAS).plano === "base");
}

sec("2. O SUPERIOR NÃO SE LIGA PELO NAVEGADOR");
{
  t("pedir o superior sem a trava dá base", rota({ plano: "superior" }, TODAS).plano === "base");
  t("e nenhum passo vai ao OpenRouter", !rota({ plano: "superior" }, TODAS).passos.some((p) => p.provedor === "openrouter"));
  t("a trava é '1', não qualquer coisa", rota({ plano: "superior" }, { ...TODAS, PLANO_SUPERIOR_LIGADO: "true" }).plano === "base");
  const semChave = { GEMINI_API_KEY: "g", DEEPSEEK_API_KEY: "d", PLANO_SUPERIOR_LIGADO: "1" };
  t("com a trava mas sem OPENROUTER_API_KEY, dá base", rota({ plano: "superior" }, semChave).plano === "base");
  const ligado = { ...TODAS, PLANO_SUPERIOR_LIGADO: "1" };
  const sup = rota({ plano: "superior" }, ligado);
  t("com as três coisas, é o superior", sup.plano === "superior");
  t("e o superior é o GPT-5.6 Sol pelo OpenRouter", sup.passos[0].provedor === "openrouter" && sup.passos[0].modelo === "openai/gpt-5.6-sol");
  t("a reserva do superior é a mesma: DeepSeek v4-pro, depois o base",
    ids(sup) === "openrouter:openai/gpt-5.6-sol > deepseek:deepseek-v4-pro > gemini:gemini-3.8-flash > deepseek:deepseek-v4-flash > gemini:gemini-3.5-flash-lite");
  t("ligado, quem não pede continua no base", rota({}, ligado).plano === "base");
  t("PLANO_PADRAO=superior vale para quem não pede", rota({}, { ...ligado, PLANO_PADRAO: "superior" }).plano === "superior");
  t("mas nunca sem a trava", rota({}, { ...TODAS, PLANO_PADRAO: "superior" }).plano === "base");
  t("e quem pede o base o tem", rota({ plano: "base" }, { ...ligado, PLANO_PADRAO: "superior" }).plano === "base");
}

/* ---------------- o servidor, com a rede de mentira ---------------- */
const guardado = { ...process.env };
const LIMPAR = ["VERCEL_URL", "ORIGENS_EXTRA", "KV_REST_API_URL", "KV_REST_API_TOKEN", "UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN",
  "GEMINI_API_KEY", "DEEPSEEK_API_KEY", "OPENROUTER_API_KEY", "PLANO_SUPERIOR_LIGADO", "PLANO_PADRAO", "NARRADOR_BASE", "NARRADOR_SUPERIOR",
  "CRONISTA_MODELO", "GM_PENSAMENTO", "GM_PENALIDADE", "GM_TEMPERATURA", "OR_TEMPERATURA", "OR_PROVEDORES", "VERCEL_PROJECT_PRODUCTION_URL", "PROVEDOR"];
const fetchVerdadeiro = globalThis.fetch;
/* MM11 · 11.ª sessão: o servidor lembra as casas que disseram 402 por
   alguns minutos (SEM_SALDO). Cada `rodar` anda o relógio uma hora, para
   que o 402 de uma prova não risque a casa da prova seguinte. */
const agoraVerdadeiro = Date.now;
let relogio = Date.UTC(2026, 9, 13, 12);

const resp = (status, corpo) => ({ ok: status >= 200 && status < 300, status, json: async () => corpo, text: async () => JSON.stringify(corpo) });
const okGemini = (texto) => resp(200, { candidates: [{ content: { parts: [{ text: texto }] }, finishReason: "STOP" }], modelVersion: "gemini-3.8-flash",
  usageMetadata: { promptTokenCount: 30000, candidatesTokenCount: 300, thoughtsTokenCount: 50, cachedContentTokenCount: 24000 } });
const okOpenAI = (texto, modelo, usage) => resp(200, { model: modelo, choices: [{ message: { content: texto } }], usage });

/* roda o handler com um ambiente e um roteiro de respostas por casa */
async function rodar({ env, corpo, roteiro }) {
  for (const k of LIMPAR) delete process.env[k];
  Object.assign(process.env, env);
  const chamadas = [];
  relogio += 3600e3;
  Date.now = () => relogio;
  globalThis.fetch = async (url, init) => {
    const casa = /googleapis/.test(url) ? "gemini" : /openrouter/.test(url) ? "openrouter" : /deepseek/.test(url) ? "deepseek" : "?";
    const body = JSON.parse(init.body);
    chamadas.push({ casa, url, headers: init.headers, body });
    const fila = roteiro[casa] || [];
    return fila.length ? fila.shift() : resp(500, { erro: "sem roteiro" });
  };
  let status = 0, saida = null;
  const res = { status(s) { status = s; return this; }, json(j) { saida = j; return this; } };
  try {
    await N.default({ method: "POST", headers: {}, body: { system: "SISTEMA", messages: [{ role: "user", content: "olá" }], formato: "json", ...corpo } }, res);
  } finally {
    globalThis.fetch = fetchVerdadeiro;
    Date.now = agoraVerdadeiro;
    for (const k of Object.keys(process.env)) if (!(k in guardado)) delete process.env[k];
    Object.assign(process.env, guardado);
  }
  return { status, saida, chamadas };
}

sec("3. O BASE VAI AO GOOGLE COMO O TESTE CEGO O MEDIU");
{
  const { status, saida, chamadas } = await rodar({ env: TODAS, corpo: {}, roteiro: { gemini: [okGemini('{"narrativa":"A taverna."}')] } });
  t("respondeu", status === 200 && /taverna/.test(saida.texto));
  t("quem respondeu foi o Gemini, no plano base", saida.provedor === "gemini" && saida.plano === "base");
  t("uma chamada só", chamadas.length === 1 && /models\/gemini-3\.8-flash:generateContent/.test(chamadas[0].url));
  const gc = chamadas[0].body.generationConfig;
  t("o pensamento no chão do 3.8 Flash (LOW)", gc.thinkingConfig && gc.thinkingConfig.thinkingLevel === "LOW");
  t("a temperatura do teste cego (0,85)", gc.temperature === 0.85);
  /* a 0 a penalidade nem viaja: há Gemini que devolve 400 por o campo existir */
  t("sem penalidade no corpo", !("frequencyPenalty" in gc));
  t("e o JSON garantido", gc.responseMimeType === "application/json");
  t("o sistema vai à frente (o prefixo que o cache relê)", chamadas[0].body.systemInstruction.parts[0].text === "SISTEMA");
  t("o uso conta o cache do Gemini", saida.uso && saida.uso.cache === 24000 && saida.uso.entrada === 30000);
  t("e o pensamento como saída, que é como se paga", saida.uso.saida === 350);
  t("a fila diz casa e modelo", saida.fila[0] === "gemini:gemini-3.8-flash");
  /* a GM_PENALIDADE ainda existe, para quem a quiser medir */
  const comPen = await rodar({ env: { ...TODAS, GM_PENALIDADE: "0.2" }, corpo: {}, roteiro: { gemini: [okGemini("x")] } });
  t("GM_PENALIDADE diferente de zero viaja", comPen.chamadas[0].body.generationConfig.frequencyPenalty === 0.2);
}

sec("4. A RESERVA: O JOGADOR NUNCA VÊ A TROCA");
{
  const dsOk = () => okOpenAI('{"narrativa":"O DeepSeek."}', "deepseek-v4-pro", { prompt_tokens: 20000, completion_tokens: 200, prompt_cache_hit_tokens: 15000 });
  const sem = await rodar({ env: TODAS, corpo: {}, roteiro: { gemini: [resp(402, { error: "sem crédito" })], deepseek: [dsOk()] } });
  t("402 no Gemini: o DeepSeek v4-pro responde", sem.status === 200 && sem.saida.provedor === "deepseek" && sem.chamadas[1].body.model === "deepseek-v4-pro");
  t("e a queda fica escrita para quem investiga", sem.saida.falharam.length === 1 && /gemini \(gemini-3\.8-flash: 402/.test(sem.saida.falharam[0]));
  const taxa = await rodar({ env: TODAS, corpo: {}, roteiro: { gemini: [resp(429, {}), okGemini("não devia")], deepseek: [dsOk()] } });
  t("429 no Gemini: vai direto à reserva, sem retentar", taxa.saida.provedor === "deepseek" && taxa.chamadas.filter((c) => c.casa === "gemini").length === 1);
  const vazio = await rodar({ env: TODAS, corpo: {}, roteiro: { gemini: [resp(200, { candidates: [{ finishReason: "SAFETY" }] })], deepseek: [dsOk()] } });
  t("resposta vazia do Gemini: a reserva responde", vazio.saida.provedor === "deepseek" && /sem texto \(SAFETY\)/.test(vazio.saida.falharam[0]));
  const tosse = await rodar({ env: TODAS, corpo: {}, roteiro: { gemini: [resp(503, {}), okGemini("segunda")] } });
  t("503 merece uma retentativa na mesma casa", tosse.saida.provedor === "gemini" && tosse.chamadas.length === 2);
  const todos = await rodar({ env: TODAS, corpo: {}, roteiro: { gemini: [resp(402, {})], deepseek: [resp(402, { error: "Insufficient Balance" }), resp(402, { error: "Insufficient Balance" })] } });
  t("todos caem: 502", todos.status === 502);
  /* MM11 · 11.ª sessão: um 402 risca a CASA no mesmo pedido — o v4-flash
     e o Flash-Lite (casas já riscadas) nem são tentados */
  t("402 é da conta: cada casa é tentada uma vez só", todos.chamadas.filter((c) => c.casa === "deepseek").length === 1 && todos.chamadas.filter((c) => c.casa === "gemini").length === 1);
  const depois = await (async () => {
    /* o pedido seguinte, dez minutos dentro do prazo, na mesma instância */
    relogio -= 3600e3 - 60e3;
    return rodar({ env: TODAS, corpo: { tarefa: "leve" }, roteiro: { gemini: [okGemini("nao devia")], deepseek: [resp(402, {})] } });
  })();
  t("e o pedido seguinte nem vai às casas sem saldo", depois.chamadas.length === 0 && depois.status === 502 && /sem saldo/.test(depois.saida.erro));
  t("na língua que o guardado.js lê", /^Todos os provedores falharam — gemini \(gemini-3\.8-flash: 402/.test(todos.saida.erro) && / · /.test(todos.saida.erro));
  t("com o corpo do 402 dentro (é ali que mora o 'insufficient balance')", /Insufficient Balance/.test(todos.saida.erro));
  const nada = await rodar({ env: {}, corpo: {}, roteiro: {} });
  t("sem chave nenhuma: 500 que o guardado.js reconhece", nada.status === 500 && /^Nenhuma chave configurada/.test(nada.saida.erro));
  /* o pedido mal formado não gasta rede */
  const torto = await rodar({ env: TODAS, corpo: { messages: [] }, roteiro: {} });
  t("pedido sem mensagens: 400 e nenhuma chamada", torto.status === 400 && torto.chamadas.length === 0);
}

sec("5. O SUPERIOR, QUANDO HOUVER ASSINATURA");
{
  const or = () => okOpenAI('{"narrativa":"O Sol."}', "openai/gpt-5.6-sol", { prompt_tokens: 23395, completion_tokens: 281, prompt_tokens_details: { cached_tokens: 20000 } });
  const travado = await rodar({ env: TODAS, corpo: { plano: "superior" }, roteiro: { gemini: [okGemini("base")], openrouter: [or()] } });
  t("sem a trava, pedir o superior dá o base", travado.saida.plano === "base" && !travado.chamadas.some((c) => c.casa === "openrouter"));
  const ligado = { ...TODAS, PLANO_SUPERIOR_LIGADO: "1", VERCEL_PROJECT_PRODUCTION_URL: "taverna.example" };
  const sup = await rodar({ env: ligado, corpo: { plano: "superior" }, roteiro: { openrouter: [or()] } });
  const c = sup.chamadas[0];
  t("com a trava, vai ao OpenRouter", sup.saida.provedor === "openrouter" && sup.saida.plano === "superior" && /openrouter\.ai\/api\/v1\/chat\/completions/.test(c.url));
  t("com o Sol", c.body.model === "openai/gpt-5.6-sol");
  t("os cabeçalhos que o OpenRouter recomenda", c.headers["X-Title"] === "Taverna" && c.headers["HTTP-Referer"] === "https://taverna.example");
  t("a chave no cabeçalho, como Bearer", c.headers.authorization === "Bearer o-falsa");
  t("raciocínio desligado, como no teste", c.body.reasoning && c.body.reasoning.enabled === false);
  /* require_parameters transformaria a temperatura que o Sol ignora em erro */
  t("sem require_parameters", !c.body.provider || !("require_parameters" in c.body.provider));
  t("o uso lê o cache do OpenRouter", sup.saida.uso && sup.saida.uso.cache === 20000 && sup.saida.uso.modelo === "openai/gpt-5.6-sol");
  const caiu = await rodar({ env: ligado, corpo: { plano: "superior" }, roteiro: { openrouter: [resp(402, {})], deepseek: [okOpenAI("ds", "deepseek-v4-pro", { prompt_tokens: 1, completion_tokens: 1 })] } });
  t("o superior que cai passa ao DeepSeek v4-pro", caiu.saida.provedor === "deepseek" && caiu.chamadas[1].body.model === "deepseek-v4-pro");
  const ordem = await rodar({ env: { ...ligado, OR_PROVEDORES: "openai, azure" }, corpo: { plano: "superior" }, roteiro: { openrouter: [or()] } });
  t("OR_PROVEDORES fixa a ordem das casas do OpenRouter", JSON.stringify(ordem.chamadas[0].body.provider.order) === '["openai","azure"]');
}

sec("6. O USO DAS TRÊS CASAS, E O PREÇO DOS DOIS PLANOS");
{
  const ds = C.lerUso({ usage: { prompt_tokens: 14000, completion_tokens: 700, prompt_cache_hit_tokens: 13000 } });
  t("DeepSeek: prompt_cache_hit_tokens", ds.cache === 13000);
  const orx = C.lerUso({ usage: { prompt_tokens: 23395, completion_tokens: 281, prompt_tokens_details: { cached_tokens: 20000, cache_write_tokens: 3000 } } });
  t("OpenRouter: prompt_tokens_details.cached_tokens", orx.cache === 20000 && orx.entrada === 23395);
  t("e prompt_tokens_details nulo não estoura", C.lerUso({ usage: { prompt_tokens: 5, prompt_tokens_details: null } }).cache === 0);
  const gm = C.lerUso({ usageMetadata: { promptTokenCount: 9000, candidatesTokenCount: 400, thoughtsTokenCount: 100, cachedContentTokenCount: 7000 } });
  t("Gemini: cachedContentTokenCount", gm.cache === 7000);
  t("e o pensamento somado à saída", gm.saida === 500);
  t("o base tem preço na tabela", C.PRECOS["gemini-3.8-flash"] && C.PRECOS["gemini-3.8-flash"].saida === 3.75);
  /* o nome que volta do OpenRouter tem a casa na frente, e às vezes a data */
  t("o Sol acha o preço com a casa na frente", C.precoDe("openai/gpt-5.6-sol") === C.PRECOS["gpt-5.6-sol"]);
  t("e com a data no fim", C.precoDe("openai/gpt-5.6-sol-20260709") === C.PRECOS["gpt-5.6-sol"]);
  t("o Gemini com sufixo de revisão também", C.precoDe("gemini-3.8-flash-001") === C.PRECOS["gemini-3.8-flash"]);
  t("o preço de quem responde existe para todos os padrões da rota",
    /* os apelidos ("@base", "@cronista") apontam para padrões já listados */
    [N.PLANOS.base.padrao, N.PLANOS.superior.padrao, N.CRONISTA.padrao, ...N.RESERVAS.narrador.filter((m) => !m.startsWith("@"))]
      .every((m) => Object.values(C.PRECOS).includes(C.precoDe(m))));
}

sec("7. NENHUMA CHAVE NO CÓDIGO");
{
  t("só nomes de variável, nunca valor", !/sk-[A-Za-z0-9]{10,}|AIza[0-9A-Za-z_-]{20,}|sk-or-v1/.test(FONTE));
  t("o PROVEDOR antigo e o `provedor` do pedido saíram (o plano os substitui)", !/process\.env\.PROVEDOR\b|provedorPedido/.test(FONTE));
  t("a régua da rede é tabela", N.REGUA_DA_REDE.pausaMs === 1200 && !N.REGUA_DA_REDE.retentaEm.includes(429));
}

console.log(`\nnarrador por plano v9.466: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
