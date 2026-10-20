/* O NARRADOR NOVO, NO CUSTO E NO TAMANHO (MM11 · 11.ª sessão, 13/10)

   A 11.ª sessão mediu o Gemini 3.8 Flash a narrar: melhor, mas com o
   cache a 25,4% (o Google creditou só o `system`), US$ 1,73 por sessão,
   262 palavras de mediana contra as 60–140 pedidas, a fala do herói
   escrita pelo Mestre em 16 de 62 respostas, e o Cronista a pagar dois
   402 da DeepSeek sem saldo antes de cada chamada. Esta suíte guarda os
   consertos, com a rede de mentira (não há chave do Google na máquina —
   a medida real fica para a próxima sessão de prova):

   1. a DECISÃO do cache explícito (janela.js) — pura, por semente de
      relógio, e a conta que escolheu a régua;
   2. o SERVIDOR a falar com o Google: escreve o cache, usa-o, troca-o,
      apaga o velho, e cai no pedido inteiro quando algo falha;
   3. a CONTA: escrever e guardar o cache custam, e custo.js os cobra;
   4. o TAMANHO e a VOZ: a lembrança colada à frase do jogador, a rede de
      saída que repara o JSON cortado, e a peneira da fala do herói. */
const S = "../src/";
const J = await import(S + "janela.js");
const N = await import("../api/narrador.js");
const C = await import(S + "custo.js");
const JS = await import(S + "json.js");
const E = await import(S + "escuta.js");
const F = await import(S + "fala-do-heroi.js");
const { readFileSync } = await import("node:fs");
const APP = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
const PROMPT = readFileSync(new URL("../src/prompt.js", import.meta.url), "utf8");

let bons = 0, maus = 0;
const t = (n, c) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n); } };
const sec = (s) => console.log("\n" + s);

const T = J.CACHE_EXPLICITO;
const SYS = "S".repeat(40541);                         /* o system da 11.ª, em caracteres */
const msg = (i) => ({ role: i % 2 ? "assistant" : "user", content: `mensagem ${i} ` + "x".repeat(1900) });
const conversa = (n) => Array.from({ length: n }, (_, i) => msg(i));
const MOD = "gemini-3.8-flash";

sec("1. A DECISÃO DO CACHE É CONTA PURA");
{
  t("a régua é tabela", T.raboMaxTokens === 6000 && T.ttlSegundos === 1800 && T.charsPorToken === 3.5 && T.minMensagens === 2);
  const curta = J.decidirOCache({ system: "pouco", mensagens: conversa(3), agora: 0, modelo: MOD });
  t("conversa pequena demais: sem cache (o mínimo do Google)", curta.acao === "nenhum");
  t("um turno só: sem cache (só o system é o que o implícito já dá)", J.decidirOCache({ system: SYS, mensagens: conversa(1), modelo: MOD }).acao === "nenhum");
  const ms = conversa(9);
  const novo = J.decidirOCache({ system: SYS, mensagens: ms, agora: 1000, modelo: MOD });
  t("sem ficha e conversa grande: cria com tudo menos a mensagem do turno", novo.acao === "criar" && novo.m === 8);
  t("e a impressão é a do prefixo que vai no cache", novo.impressao === J.impressaoDoPrefixo(SYS, ms, 8));
  const ficha = { nome: "cachedContents/abc", modelo: MOD, m: 8, impressao: novo.impressao, criado: 1000, expira: 1000 + T.ttlSegundos * 1000, tokens: 16000 };
  const depois = [...ms, msg(9), msg(10)];
  t("o turno seguinte usa o cache da ficha", JSON.stringify(J.decidirOCache({ ficha, system: SYS, mensagens: depois, agora: 60e3, modelo: MOD })) === JSON.stringify({ acao: "usar", m: 8 }));
  const longe = [...ms, ...Array.from({ length: 14 }, (_, i) => msg(9 + i))];
  const troca = J.decidirOCache({ ficha, system: SYS, mensagens: longe, agora: 60e3, modelo: MOD });
  t("o rabo passou da régua: cria outro e apaga o velho", troca.acao === "criar" && troca.m === longe.length - 1 && troca.apagar === "cachedContents/abc");
  const cortada = [msg(0), { role: "assistant", content: "outra coisa" }, ...ms.slice(2), msg(9)];
  t("a janela cortou (o começo mudou): cria outro", J.decidirOCache({ ficha, system: SYS, mensagens: cortada, agora: 60e3, modelo: MOD }).acao === "criar");
  t("o system mudou: cria outro", J.decidirOCache({ ficha, system: SYS + "!", mensagens: depois, agora: 60e3, modelo: MOD }).acao === "criar");
  t("a ficha perto do fim do prazo não se usa (o turno não morre num 404)",
    J.decidirOCache({ ficha, system: SYS, mensagens: depois, agora: ficha.expira - (T.folgaSegundos - 1) * 1000, modelo: MOD }).acao === "criar");
  t("a ficha de outro modelo não serve", J.decidirOCache({ ficha, system: SYS, mensagens: depois, agora: 60e3, modelo: "gemini-3.5-flash-lite" }).acao === "criar");
  /* determinismo e imutabilidade */
  const congelada = Object.freeze(depois.map((m) => Object.freeze({ ...m })));
  const a = J.decidirOCache({ ficha: Object.freeze({ ...ficha }), system: SYS, mensagens: congelada, agora: 60e3, modelo: MOD });
  const b = J.decidirOCache({ ficha: { ...ficha }, system: SYS, mensagens: congelada, agora: 60e3, modelo: MOD });
  t("a mesma conversa dá a mesma decisão, sem tocar no que recebe", JSON.stringify(a) === JSON.stringify(b));
  t("uma letra muda a impressão", J.impressaoDoPrefixo(SYS, ms, 8) !== J.impressaoDoPrefixo(SYS, [...ms.slice(0, 7), { ...ms[7], content: ms[7].content + "y" }], 8));
  let vivo = true;
  try {
    J.decidirOCache(); J.decidirOCache(null); J.decidirOCache({ ficha: null, mensagens: null }); J.decidirOCache({ ficha: {}, system: null, mensagens: [null, 3] });
    J.impressaoDoPrefixo(null, null, null); J.decidirOCache({ ficha: { nome: 5, m: "x" }, mensagens: conversa(4) });
  } catch { vivo = false; }
  t("lixo não estoura", vivo);
}

sec("2. A CONTA QUE ESCOLHEU A RÉGUA (a sessão da 11.ª, reconstruída)");
{
  /* 62 turnos com os números medidos: system de 11.490 tokens, ~560 por
     mensagem do histórico, ~10 mil na mensagem do turno (o vivo, a pauta,
     a frase), a janela ancorada 24/24 de verdade. Preços do 3.8 Flash. */
  const p = C.PRECOS["gemini-3.8-flash"];
  const sys = "s".repeat(Math.round(11490 * T.charsPorToken));
  const h = (i) => ({ role: i % 2 ? "assistant" : "user", content: `#${i} ` + "h".repeat(Math.round(560 * T.charsPorToken) - 6) });
  const L = Math.round(10000 * T.charsPorToken);
  let ficha = null, entrada = 0, cache = 0, dolares = 0, semCache = 0, minuto = 0;
  const historico = [];
  for (let turno = 0; turno < 62; turno++) {
    const janela = J.janelaAncorada([...historico, { role: "user", content: "fala" }]);
    const ultima = { role: "user", content: "v".repeat(L) };
    const ms = [...janela.slice(0, -1), ultima];
    const tok = (sys.length + ms.reduce((a, m) => a + m.content.length, 0)) / T.charsPorToken;
    const d = J.decidirOCache({ ficha, system: sys, mensagens: ms, agora: minuto * 60e3, modelo: MOD });
    let c = 0;
    if (d.acao === "criar") {
      c = (sys.length + ms.slice(0, d.m).reduce((a, m) => a + m.content.length, 0)) / T.charsPorToken;
      dolares += (c * p.entrada) / 1e6;                               /* a escrita, a preço cheio */
      ficha = { nome: "cachedContents/x" + turno, modelo: MOD, m: d.m, impressao: d.impressao, criado: minuto * 60e3, expira: minuto * 60e3 + T.ttlSegundos * 1000, tokens: c };
    } else if (d.acao === "usar") c = (sys.length + ms.slice(0, d.m).reduce((a, m) => a + m.content.length, 0)) / T.charsPorToken;
    dolares += (c * p.cache + (tok - c) * p.entrada) / 1e6;
    semCache += (tok * p.entrada) / 1e6;
    entrada += tok; cache += c; minuto += 2;
    historico.push(h(2 * turno), h(2 * turno + 1));
  }
  const taxa = cache / entrada;
  console.log(`      (cache ${(100 * taxa).toFixed(1)}%, entrada US$ ${dolares.toFixed(3)} contra ${semCache.toFixed(3)} sem cache)`);
  t("o cache do Narrador passa dos 65%", taxa >= 0.65);
  t("e a entrada do Narrador cai a menos de 60% do que custaria sem cache, escrita incluída", dolares < 0.6 * semCache);
}

/* ---------------- o servidor, com a rede de mentira ---------------- */
const guardado = { ...process.env };
const LIMPAR = ["VERCEL_URL", "ORIGENS_EXTRA", "KV_REST_API_URL", "KV_REST_API_TOKEN", "UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN",
  "GEMINI_API_KEY", "DEEPSEEK_API_KEY", "OPENROUTER_API_KEY", "PLANO_SUPERIOR_LIGADO", "PLANO_PADRAO", "NARRADOR_BASE", "NARRADOR_SUPERIOR",
  "CRONISTA_MODELO", "CRONISTA_PENSAMENTO", "GM_PENSAMENTO", "GM_PENALIDADE", "GM_TEMPERATURA", "GM_CACHE_EXPLICITO", "PROVEDOR"];
const TODAS = { GEMINI_API_KEY: "g-falsa", DEEPSEEK_API_KEY: "d-falsa" };
const fetchVerdadeiro = globalThis.fetch, agoraVerdadeiro = Date.now;
let relogio = Date.UTC(2026, 9, 13, 12);
const resp = (status, corpo) => ({ ok: status >= 200 && status < 300, status, json: async () => corpo, text: async () => JSON.stringify(corpo) });
const okGemini = (texto, extra = {}) => resp(200, { candidates: [{ content: { parts: [{ text: texto }] }, finishReason: "STOP", ...extra }], modelVersion: MOD,
  usageMetadata: { promptTokenCount: 40000, candidatesTokenCount: 300, thoughtsTokenCount: 50, cachedContentTokenCount: 30000 } });
const criado = (nome, tokens = 30000) => resp(200, { name: nome, model: "models/" + MOD, usageMetadata: { totalTokenCount: tokens } });

async function rodar({ env = TODAS, corpo, roteiro, passo = 3600e3 }) {
  for (const k of LIMPAR) delete process.env[k];
  Object.assign(process.env, env);
  relogio += passo;
  Date.now = () => relogio;
  const chamadas = [];
  globalThis.fetch = async (url, init) => {
    const tipo = /cachedContents$/.test(url) ? "criar" : init.method === "DELETE" ? "apagar" : /generateContent/.test(url) ? "gemini" : /deepseek/.test(url) ? "deepseek" : "?";
    chamadas.push({ tipo, url, body: init.body ? JSON.parse(init.body) : null });
    const fila = roteiro[tipo] || [];
    return fila.length ? fila.shift() : resp(tipo === "apagar" ? 200 : 500, {});
  };
  let status = 0, saida = null;
  const res = { status(s) { status = s; return this; }, json(j) { saida = j; return this; } };
  try {
    await N.default({ method: "POST", headers: {}, body: { system: SYS, messages: conversa(9), formato: "json", maxTokens: 3600, ...corpo } }, res);
  } finally {
    globalThis.fetch = fetchVerdadeiro; Date.now = agoraVerdadeiro;
    for (const k of Object.keys(process.env)) if (!(k in guardado)) delete process.env[k];
    Object.assign(process.env, guardado);
  }
  return { status, saida, chamadas };
}
const so = (r, tipo) => r.chamadas.filter((c) => c.tipo === tipo);

sec("3. O SERVIDOR ESCREVE O CACHE, USA-O E TROCA-O");
{
  const r1 = await rodar({ corpo: { cache: {} }, roteiro: { criar: [criado("cachedContents/um")], gemini: [okGemini('{"narrativa":"Um."}')] } });
  t("o primeiro turno escreve o cache", r1.status === 200 && so(r1, "criar").length === 1);
  const cria = so(r1, "criar")[0].body;
  t("com o system e tudo menos a mensagem do turno", cria.model === "models/" + MOD && cria.systemInstruction.parts[0].text === SYS && cria.contents.length === 8 && cria.ttl === `${T.ttlSegundos}s`);
  const g1 = so(r1, "gemini")[0].body;
  t("e o turno vai pelo cache, só com o que vem depois", g1.cachedContent === "cachedContents/um" && g1.contents.length === 1 && !("systemInstruction" in g1));
  t("sem perder o pensamento, o JSON e a rede de saída", g1.generationConfig.thinkingConfig.thinkingLevel === "LOW" && g1.generationConfig.responseMimeType === "application/json" && g1.generationConfig.maxOutputTokens === N.REDE_DE_SAIDA.narrador);
  const f1 = r1.saida.cache;
  t("a ficha volta selada", f1 && f1.nome === "cachedContents/um" && f1.m === 8 && typeof f1.selo === "string" && f1.selo.length === 64);
  t("e a escrita vai na conta do turno", r1.saida.uso.escrita === 30000);

  const r2 = await rodar({ passo: 120e3, corpo: { cache: f1, messages: [...conversa(9), msg(9), msg(10)] }, roteiro: { gemini: [okGemini('{"narrativa":"Dois."}')] } });
  t("o turno seguinte não escreve nada", so(r2, "criar").length === 0 && so(r2, "apagar").length === 0);
  t("e relê o mesmo cache", so(r2, "gemini")[0].body.cachedContent === "cachedContents/um" && so(r2, "gemini")[0].body.contents.length === 3);
  t("a ficha volta a mesma", JSON.stringify(r2.saida.cache) === JSON.stringify(f1) && !r2.saida.uso.escrita);

  const longa = [...conversa(9), ...Array.from({ length: 14 }, (_, i) => msg(9 + i))];
  const r3 = await rodar({ passo: 120e3, corpo: { cache: f1, messages: longa }, roteiro: { criar: [criado("cachedContents/dois", 50000)], gemini: [okGemini('{"narrativa":"Três."}')] } });
  t("o rabo cresceu: escreve outro", so(r3, "criar").length === 1 && r3.saida.cache.nome === "cachedContents/dois");
  t("e apaga o velho na hora", so(r3, "apagar").length === 1 && /cachedContents\/um$/.test(so(r3, "apagar")[0].url));
  t("a guarda do velho entra na conta (tokens × hora)", r3.saida.uso.guardado > 0 && Math.abs(r3.saida.uso.guardado - 30000 * (240e3 / 3.6e6)) < 1);

  const forjada = { ...f1, nome: "cachedContents/alheio" };
  const r4 = await rodar({ passo: 60e3, corpo: { cache: forjada }, roteiro: { criar: [criado("cachedContents/tres")], gemini: [okGemini('{"narrativa":"Quatro."}')] } });
  t("a ficha forjada não se usa — nem se apaga o cache alheio", so(r4, "gemini")[0].body.cachedContent === "cachedContents/tres" && so(r4, "apagar").length === 0);

  const r5 = await rodar({ corpo: {}, roteiro: { gemini: [okGemini('{"narrativa":"Cinco."}')] } });
  t("quem não pede cache vai inteiro, como sempre", so(r5, "criar").length === 0 && so(r5, "gemini")[0].body.systemInstruction && !("cache" in r5.saida));
  const r6 = await rodar({ corpo: { cache: {}, tarefa: "leve" }, roteiro: { gemini: [okGemini('{"ok":1}')] } });
  t("o Cronista nunca usa o cache explícito", so(r6, "criar").length === 0);
  t("e roda o Flash-Lite com o pensamento no MINIMAL", /gemini-3\.5-flash-lite:generateContent/.test(so(r6, "gemini")[0].url) && so(r6, "gemini")[0].body.generationConfig.thinkingConfig.thinkingLevel === "MINIMAL");
  t("sem a rede de saída do Narrador", so(r6, "gemini")[0].body.generationConfig.maxOutputTokens === 3600);
  const r7 = await rodar({ env: { ...TODAS, GM_CACHE_EXPLICITO: "0" }, corpo: { cache: {} }, roteiro: { gemini: [okGemini('{"narrativa":"Sete."}')] } });
  t("GM_CACHE_EXPLICITO=0 desliga sem redeploy", so(r7, "criar").length === 0 && so(r7, "gemini")[0].body.systemInstruction);

  /* O CAMINHO A (20/10, a regra em teste-cache-ritmo.mjs): o cache nasce com
     a vida do ciclo dele, e o que morreu de velho cobra a guarda só pela
     vida que teve — antes a conta cobrava até ao turno seguinte, três
     horas de guarda por um cache que o Google já apagara aos 30 min */
  const r8 = await rodar({ corpo: { cache: {} }, roteiro: { criar: [criado("cachedContents/oito")], gemini: [okGemini('{"narrativa":"Oito."}')] } });
  const r9 = await rodar({ passo: 3 * 3600e3, corpo: { cache: r8.saida.cache, messages: [...conversa(9), msg(9), msg(10)] }, roteiro: { criar: [criado("cachedContents/nove")], gemini: [okGemini('{"narrativa":"Nove."}')] } });
  t("o cache que expirou cobra a guarda só até expirar", Math.abs(r9.saida.uso.guardado - 30000 * T.ttlSegundos / 3600) < 1, String(r9.saida.uso.guardado));
  t("e o novo nasce com o tempo do ritmo (um turno em três horas: o teto)", so(r9, "criar")[0].body.ttl === `${T.ttlMaxSegundos}s` && r9.saida.cache.expira === relogio + T.ttlMaxSegundos * 1000);
}

sec("4. O CACHE NUNCA CUSTA O TURNO");
{
  const r1 = await rodar({ corpo: { cache: {} }, roteiro: { criar: [resp(400, { error: "min tokens" })], gemini: [okGemini('{"narrativa":"Inteiro."}')] } });
  t("o Google recusa o cache: o turno vai inteiro", r1.status === 200 && so(r1, "gemini")[0].body.systemInstruction && !so(r1, "gemini")[0].body.cachedContent);
  const r2 = await rodar({ passo: 60e3, corpo: { cache: {} }, roteiro: { gemini: [okGemini('{"narrativa":"De novo inteiro."}')] } });
  t("e o explícito descansa: o turno seguinte nem tenta", so(r2, "criar").length === 0);
  const r0 = await rodar({ corpo: { cache: {} }, roteiro: { criar: [criado("cachedContents/q")], gemini: [okGemini('{"narrativa":"ok."}')] } });
  const r3 = await rodar({ passo: 60e3, corpo: { cache: r0.saida.cache, messages: [...conversa(9), msg(9), msg(10)] }, roteiro: { gemini: [resp(404, { error: "not found" }), okGemini('{"narrativa":"Salvo."}')] } });
  t("o cache sumiu (404): o mesmo turno, inteiro", r3.status === 200 && /Salvo/.test(r3.saida.texto) && so(r3, "gemini")[1].body.systemInstruction);
  t("e a ficha morre", r3.saida.cache === null);
  const r4 = await rodar({ passo: 60e3, corpo: { cache: r0.saida.cache, messages: [...conversa(9), msg(9), msg(10)] }, roteiro: { gemini: [resp(429, {})], deepseek: [resp(200, { model: "deepseek-v4-pro", choices: [{ message: { content: '{"narrativa":"Reserva."}' } }] })] } });
  t("a reserva responde: a ficha volta como veio", r4.saida.provedor === "deepseek" && JSON.stringify(r4.saida.cache) === JSON.stringify(r0.saida.cache));
  t("e a reserva não recebe cache nenhum", !("cachedContent" in so(r4, "deepseek")[0].body));
}

sec("5. A REDE DE SAÍDA REPARA O JSON QUE CORTA");
{
  const longo = "Uma frase inteira que diz alguma coisa sobre a taverna e as pessoas. ".repeat(6);
  const cortado = JSON.stringify({ narrativa: longo + "E esta fica pela met", mudancas: { x: 1 } }).slice(0, -15);
  const r = await rodar({ corpo: {}, roteiro: { gemini: [okGemini(cortado, { finishReason: "MAX_TOKENS" })] } });
  const j = JSON.parse(r.saida.texto);
  t("cortado no teto: chega JSON inteiro, aparado na última frase", r.status === 200 && j.narrativa.endsWith("pessoas.") && j.mudancas === null);
  const r2 = await rodar({ corpo: {}, roteiro: { gemini: [okGemini('{"narrativa":"Quase nada e', { finishReason: "MAX_TOKENS" })], deepseek: [resp(200, { model: "deepseek-v4-pro", choices: [{ message: { content: '{"narrativa":"Reserva."}' } }] })] } });
  t("cortado cedo demais: a reserva responde", r2.saida.provedor === "deepseek");
  t("o JSON inteiro passa intocado", JS.repararJsonTruncado('{"narrativa":"ok."}') === '{"narrativa":"ok."}');
  t("lixo devolve vazio", JS.repararJsonTruncado(null) === "" && JS.repararJsonTruncado("") === "");
  t("o mínimo é tabela", JS.APARO_DO_TRUNCADO.minPalavras === 25);
}

sec("6. A CONTA DO CACHE EXPLÍCITO");
{
  const p = C.PRECOS["gemini-3.8-flash"];
  const sem = C.custoDaChamada({ modelo: MOD, entrada: 40000, cache: 30000, saida: 300 });
  const com = C.custoDaChamada({ modelo: MOD, entrada: 40000, cache: 30000, saida: 300, escrita: 30000, guardado: 1000 });
  t("escrever cobra a preço de entrada; guardar, por token-hora", Math.abs(com - sem - (30000 * p.entrada + 1000 * p.armazenamento) / 1e6) < 1e-12);
  const acc = C.somarChamada({ chamadas: 1, entrada: 1, cache: 0, saida: 1, dolares: 0, porTarefa: {}, porModelo: {} }, { modelo: MOD, entrada: 40000, saida: 300, cache: 30000, escrita: 30000 });
  t("o acumulado de um save antigo (sem `escrita`) soma sem estourar", acc.escrita === 30000 && acc.dolares > 0);
  t("e o zero já nasce com a linha", C.CUSTO_ZERO().escrita === 0);
  t("o Flash-Lite do Cronista tem preço", C.PRECOS[N.CRONISTA.padrao] && C.PRECOS[N.CRONISTA.padrao].entrada < p.entrada);
  t("e o relatório mostra o que se escreveu", C.linhasDoCusto(acc).some((l) => /cache escrito/.test(l)));
}

sec("7. O TAMANHO E A VOZ, ONDE O GEMINI OBEDECE");
{
  t("a etiqueta do pedido diz o tamanho, da tabela", E.ETIQUETA_DO_PEDIDO.includes(`${E.TAMANHO_DA_NARRATIVA.min} a ${E.TAMANHO_DA_NARRATIVA.max} palavras`));
  t("e a voz do herói", /Não ponha na minha boca fala que eu não escrevi/.test(E.ETIQUETA_DO_PEDIDO));
  t("a etiqueta fecha num colchete só (cobranca.js lê até ele)", E.ETIQUETA_DO_PEDIDO.indexOf("]") === E.ETIQUETA_DO_PEDIDO.length - 1);
  t("a frase do jogador continua a ser a última coisa", E.fechoDoPedido(E.lerOPedido("Olho em volta.")).endsWith("\nOlho em volta."));
  /* mudou de lugar, não cresceu */
  t("o TAMANHO saiu do system", !/TAMANHO DAS RESPOSTAS \(concisão/.test(PROMPT));
  t("e a regra do que eu sinto e decido ficou lá", /NÃO NARRE O QUE EU SINTO NEM O QUE EU DECIDO/.test(PROMPT));
}

sec("8. A FALA DO HERÓI É DO JOGADOR");
{
  const m = (frase) => `[PAUTA]\n${E.ETIQUETA_DO_PEDIDO}\n${frase}`;
  const corpo = "Você encara o homem do balcão. O vento entra pela porta e a taverneira limpa o balcão com um pano encardido, sem pressa, enquanto dois carroceiros discutem o preço do sal no canto mais escuro, perto da lareira apagada.";
  const a = F.semFalaInventada(`${corpo}\n— Some daqui, seu verme — você rosna, a mão no punho.\n— Calma — ele recua.`, m("Encaro o homem."));
  t("o parágrafo da fala inventada sai inteiro", a.cortadas.length === 1 && !/verme/.test(a.narrativa) && /Calma/.test(a.narrativa));
  const b = F.semFalaInventada(`${corpo} — Me dá a chave — você diz. Ele recua.`, m("Encaro o homem."));
  t("no meio da narração, só a fala e a atribuição", !/chave/.test(b.narrativa) && /lareira apagada\. Ele recua\./.test(b.narrativa));
  const c = F.semFalaInventada(`${corpo} "Some daqui", você rosna. Ele recua.`, m("Encaro o homem."));
  t("entre aspas também", !/Some daqui/.test(c.narrativa));
  const d = F.semFalaInventada(`${corpo}\n— Você diz que pagou? — ele pergunta.`, m("Encaro o homem."));
  t("o NPC que pergunta \"Você diz…\" não é atribuição", d.cortadas.length === 0);
  const e = F.semFalaInventada(`${corpo}\n— Some daqui — você rosna.`, m("Digo a ele que suma daqui."));
  t("o jogador falou: o eco dele fica", e.cortadas.length === 0);
  t("com aspas na frase, também", F.semFalaInventada(`${corpo}\n— Some — você rosna.`, m('Olho para ele: "some".')).cortadas.length === 0);
  t("sem a frase do jogador, nada se toca", F.semFalaInventada(`${corpo}\n— Some — você rosna.`, "[PAUTA] sem etiqueta").cortadas.length === 0);
  t("nunca corta demais: a fala que é quase tudo fica", F.semFalaInventada("Ele ri.\n— Some daqui, verme, e leve o teu cavalo — você rosna.", m("Olho.")).cortadas.length === 0);
  t("a frase do pedido sai da etiqueta", F.fraseDoPedido(m("Ataco.")) === "Ataco." && F.fraseDoPedido(null) === "");
  t("os verbos são tabela", F.FALA_DO_HEROI.verbos.includes("rosna") && F.FALA_DO_HEROI.maxFracaoCortada < 0.5);
  let vivo = true;
  try { F.semFalaInventada(null, null); F.semFalaInventada({}, 3); } catch { vivo = false; }
  t("lixo não estoura", vivo);
}

sec("9. A FIAÇÃO NO APP");
{
  t("chamarModelo leva a ficha só quando pedida", /comCache \? \{ cache: fichaDoCacheRef\.atual \|\| \{\} \}/.test(APP));
  t("e guarda a que volta", /fichaDoCacheRef\.atual = data\.cache/.test(APP));
  t("o turno do Narrador pede o cache; o reforço não", /chamarModelo\(pedido\.system, pedido\.messages, 3600, "json", "narrador", true\)/.test(APP) && /chamarModelo\(pedido\.system, reforco, 3600, "json"\)/.test(APP));
  t("a peneira da fala vem dentro de um try", /try \{\s*const ultima = [^]*?semFalaInventada\([^]*?\} catch \(e\) \{ calou\("a fala do herói", e\); \}/.test(APP));
  t("a ficha não vai ao save", !/fichaDoCacheRef\.atual[^\n]*localStorage|sv\.fichaDoCache/.test(APP));
}

console.log(`\ncache explícito e o Narrador novo (MM11 #11): ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
