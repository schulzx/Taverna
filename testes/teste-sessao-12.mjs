/* A 12.ª SESSÃO DE PROVA, NO MOTOR (19/10) — o turno barato sem perder a mesa

   A 12.ª (mente/mm11-sessao-12.md) mediu as ondas 1–3 do custo do turno:
   US$ 0,63 por sessão (−64%), 4,6 s por resposta, 142 palavras — e a
   qualidade no mesmo sítio. E achou o que esta suíte guarda, cada coisa
   com a frase ou o número da sessão:

   1. o Léxico morria por MAX_TOKENS no Gemini em toda campanha: a rede de
      saída do Narrador (1200) valia para toda tarefa não-leve. E a
      tentativa que falhou não entrava na conta;
   2. os finais em "…" (22%) NÃO são a rede: a maior saída de turno foi 453
      tokens. São o fecho `silencio`, pedido pelo sistema. A rede que aparar
      passa a marcar o turno, para a próxima sessão separar as duas coisas;
   3. o cache escrito duas vezes seguidas, colado ao corte da janela;
   4. a viagem fantasma: "volto com Aelith a Ponte Rasa" de dentro da
      masmorra — o sistema não viaja, e agora o Mestre ouve que não;
   5. as perguntas sem resposta: "O que ronda a adega?" respondida com a
      ronda da guarda; "Leio o pergaminho" tratada como ato;
   6. o tique "Sou Wystan": o degrau mandava o nome dito a cada turno;
   7. a abertura de 519 palavras;
   8. o cuspe no veto do gesto, e a moeda com o nome do Léxico.

   FALHA em HEAD (v9.472): o Léxico com maxOutputTokens 1200, sem
   `perdidos`, a escrita dupla, sem veto da viagem, a ronda como guarda, o
   pergaminho como ato, "com o nome dito" para quem está em cena, a
   abertura sem teto, a rua sem moeda, o veto sem cuspe. */
const S = "../src/";
const N = await import("../api/narrador.js");
const C = await import(S + "custo.js");
const J = await import(S + "janela.js");
const R = await import(S + "rastro.js");
const CP = await import(S + "cidade-por-dentro.js");
const E = await import(S + "escuta.js");
const A = await import(S + "abertura.js");
const FE = await import(S + "fecho.js");
const M = await import(S + "mercado.js");
const { readFileSync } = await import("node:fs");
const APP = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");

let bons = 0, maus = 0;
const t = (n, c, extra = "") => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const tenta = (f, d) => { try { return f(); } catch { return d; } };
/* o que nasce nesta leva, lido sem estourar em HEAD (lá não existe: a
   asserção fica vermelha em vez de a suíte cair na primeira) */
const rede = (tarefa, teto) => tenta(() => N.redeDaTarefa(tarefa, teto), -1);
const corte = (n) => tenta(() => J.corteVemAi(n), null);
const vetoV = (f, c) => tenta(() => R.vetoDaViagemQueNaoHouve(f, c), null) || [];

/* ---------------- o servidor, com a rede de mentira (a de teste-cache-explicito) ---------------- */
const MOD = "gemini-3.8-flash";
const guardado = { ...process.env };
const LIMPAR = ["VERCEL_URL", "ORIGENS_EXTRA", "KV_REST_API_URL", "KV_REST_API_TOKEN", "UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN",
  "GEMINI_API_KEY", "DEEPSEEK_API_KEY", "OPENROUTER_API_KEY", "PLANO_SUPERIOR_LIGADO", "PLANO_PADRAO", "NARRADOR_BASE", "NARRADOR_SUPERIOR",
  "CRONISTA_MODELO", "CRONISTA_PENSAMENTO", "GM_PENSAMENTO", "GM_PENALIDADE", "GM_TEMPERATURA", "GM_CACHE_EXPLICITO", "PROVEDOR"];
const TODAS = { GEMINI_API_KEY: "g-falsa", DEEPSEEK_API_KEY: "d-falsa" };
const fetchVerdadeiro = globalThis.fetch;
const resp = (status, corpo) => ({ ok: status >= 200 && status < 300, status, json: async () => corpo, text: async () => JSON.stringify(corpo) });
const okGemini = (texto, fim = "STOP", uso = { promptTokenCount: 4779, candidatesTokenCount: 300, thoughtsTokenCount: 50 }) =>
  resp(200, { candidates: [{ content: { parts: texto ? [{ text: texto }] : [] }, finishReason: fim }], modelVersion: MOD, usageMetadata: uso });
const okDeepSeek = (texto) => resp(200, { choices: [{ message: { content: texto } }], usage: { prompt_tokens: 4779, completion_tokens: 6297 }, model: "deepseek-v4-pro" });

async function rodar({ corpo, roteiro }) {
  for (const k of LIMPAR) delete process.env[k];
  Object.assign(process.env, TODAS);
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
    await N.default({ method: "POST", headers: {}, body: { system: "o mundo", messages: [{ role: "user", content: "Leia o mundo acima e devolva só o JSON." }], formato: "json", ...corpo } }, res);
  } finally {
    globalThis.fetch = fetchVerdadeiro;
    for (const k of Object.keys(process.env)) if (!(k in guardado)) delete process.env[k];
    Object.assign(process.env, guardado);
  }
  return { status, saida, chamadas };
}
const gerou = (r) => r.chamadas.filter((c) => c.tipo === "gemini").map((c) => c.body.generationConfig.maxOutputTokens);

sec("1. O LÉXICO NÃO MORRE NA REDE DO NARRADOR, E A TENTATIVA QUE FALHA ENTRA NA CONTA");
{
  t("a rede é por tarefa, numa tabela: o Narrador tem 1200, o resto vai ao teto que pediu",
    N.REDE_DE_SAIDA.narrador === 1200 && rede("narrador", 3600) === 1200 && rede("lexico", 8192) === 8192 && rede("leve", 900) === 900 && rede(undefined, 3600) === 1200);
  const lex = await rodar({ corpo: { maxTokens: 8192, tarefa: "lexico" }, roteiro: { gemini: [okGemini('{"nomes":{}}')] } });
  t("o Léxico pede ao Gemini os 8192 que mandou (era 1200: o pensamento de 5 mil tokens não cabia)", lex.status === 200 && gerou(lex)[0] === 8192, String(gerou(lex)));
  t("e a conta do Léxico tem a tarefa dele", lex.saida && lex.saida.uso && lex.saida.uso.tarefa === "lexico");
  const turno = await rodar({ corpo: { maxTokens: 3600, tarefa: "narrador" }, roteiro: { gemini: [okGemini('{"narrativa":"Um."}')] } });
  t("o Narrador de turno continua na rede de 1200", gerou(turno)[0] === 1200);
  const leve = await rodar({ corpo: { maxTokens: 900, tarefa: "leve" }, roteiro: { gemini: [okGemini('{"x":1}')] } });
  t("e o Cronista no teto dele, como antes", gerou(leve)[0] === 900);
  t("o App manda a tarefa do Léxico", /chamarModelo\(pedidoDoLexico\(m\), \[[^\]]*\], 8192, "json", "lexico"\)/.test(APP));

  /* a 12.ª, chamada 0: o Gemini morreu por MAX_TOKENS sem texto, e a reserva respondeu */
  const caiu = await rodar({ corpo: { maxTokens: 3600, tarefa: "narrador" }, roteiro: {
    gemini: [okGemini("", "MAX_TOKENS", { promptTokenCount: 4779, candidatesTokenCount: 0, thoughtsTokenCount: 1200 })],
    deepseek: [okDeepSeek('{"narrativa":"Dois."}')] } });
  const per = (caiu.saida && caiu.saida.perdidos) || [];
  t("o Gemini que falhou volta em `perdidos`, com o modelo, a tarefa e o que pensou", caiu.status === 200 && per.length === 1 && per[0].modelo === MOD && per[0].tarefa === "narrador" && per[0].saida === 1200, JSON.stringify(per));
  t("e quem respondeu continua a ser a reserva, na conta de sempre", caiu.saida.provedor === "deepseek" && caiu.saida.uso.saida === 6297);
  const conta = per.reduce((a, u) => C.somarChamada(a, u), C.somarChamada(C.CUSTO_ZERO(), caiu.saida.uso));
  t("somadas as duas, o save vê as duas chamadas (era uma)", conta.chamadas === 2 && conta.porModelo[MOD] > 0);
  const nada = await rodar({ corpo: { maxTokens: 3600 }, roteiro: { gemini: [okGemini("", "MAX_TOKENS", { promptTokenCount: 10, candidatesTokenCount: 0, thoughtsTokenCount: 1200 })] } });
  t("com todos a falhar (502), o gasto viaja do mesmo jeito", nada.status === 502 && Array.isArray(nada.saida.perdidos) && nada.saida.perdidos.length === 1);
  t("o App soma os `perdidos` antes de olhar o status, dentro de calou", /for \(const u of Array\.isArray\(data\.perdidos\) \? data\.perdidos : \[\]\) custoRef\.atual = somarChamada\(custoRef\.atual, \{ \.\.\.u, tarefa \}\); \} catch \(e\) \{ calou\(/.test(APP)
    && APP.indexOf("data.perdidos") < APP.indexOf("if (!response.ok) {"));
}

sec("2. OS FINAIS EM \"…\" NÃO SÃO A REDE — E A REDE QUE APARA PASSA A CONTAR");
{
  /* as saídas do Narrador na 12.ª (registo-s12.csv, coluna `saida`, que é
     candidatos + pensamento): nenhuma passou de metade da rede */
  const SAIDAS_S12 = [778, 234, 277, 218, 269, 239, 228, 168, 222, 235, 305, 227, 229, 258, 453, 258, 313, 245, 161, 123, 403, 217, 426, 220, 203, 281, 224];
  t(`a maior saída de turno foi ${Math.max(...SAIDAS_S12.slice(1))} tokens, a abertura ${SAIDAS_S12[0]} — a rede de ${N.REDE_DE_SAIDA.narrador} nunca cortou`, Math.max(...SAIDAS_S12) < N.REDE_DE_SAIDA.narrador);
  t("o \"…\" é o fecho do silêncio, pedido pelo sistema: a fala deixada a meio", /fala a meio/.test((FE.FECHOS.find((f) => f.id === "silencio") || {}).diz || ""));
  const truncado = '{"narrativa":"A chuva bate nas telhas de Ponte Rasa e Wystan enxuga a caneca com o pano encardido. Você firma o pé na lama do pátio. Aelith olha para a porta da adega, que range sozinha. E então a voz dele baixa até quase';
  const ap = await rodar({ corpo: { maxTokens: 3600, tarefa: "narrador" }, roteiro: { gemini: [okGemini(truncado, "MAX_TOKENS", { promptTokenCount: 20000, candidatesTokenCount: 1150, thoughtsTokenCount: 50 })] } });
  t("a resposta que a rede aparou chega reparada e marcada (`uso.aparado`)", ap.status === 200 && ap.saida.uso.aparado === true && JSON.parse(ap.saida.texto).narrativa.endsWith("sozinha."), ap.saida && ap.saida.texto);
  const inteira = await rodar({ corpo: { maxTokens: 3600 }, roteiro: { gemini: [okGemini('{"narrativa":"Inteira."}')] } });
  t("a inteira não leva marca", inteira.saida.uso.aparado === undefined);
  const acc = C.somarChamada(C.somarChamada(C.CUSTO_ZERO(), ap.saida.uso), inteira.saida.uso);
  t("custo.js conta as aparadas (campo novo, só quando há)", acc.aparadas === 1 && !("aparadas" in C.somarChamada(C.CUSTO_ZERO(), inteira.saida.uso)));
  t("e o /custo diz quantas", C.linhasDoCusto(acc).some((l) => /1 resposta\(s\) aparada\(s\)/.test(l)));
}

sec("3. O CACHE NÃO SE ESCREVE PARA UM TURNO SÓ (o corte da janela)");
{
  const T = J.CACHE_EXPLICITO;
  t("o passo da janela é tabela", T.mensagensPorTurno === 2);
  t("o corte vem aí com 46 e 47 mensagens, não com 45 nem com 25", corte(47) && corte(46) && !corte(45) && !corte(25) && !corte(null) && !corte(-3));
  /* a 12.ª reconstruída: o system a 14.155 tokens, ~480 caracteres por
     mensagem (a memória do turno enxuta) — o rabo passa da régua na janela
     de 47 mensagens, como no turno 24 da sessão */
  const SYS = "S".repeat(Math.round(14155 * T.charsPorToken));
  const m = (role, i) => ({ role, content: `${role} ${i} ` + "x".repeat(470) });
  let hist = [m("user", 0)], ficha = null;
  const passos = [];
  for (let turno = 1; turno <= 32; turno++) {
    const win = J.janelaAncorada(hist);
    const agora = turno * 30e3;
    const d = J.decidirOCache({ ficha, system: SYS, mensagens: win, agora, modelo: MOD });
    passos.push({ turno, n: win.length, acao: d.acao });
    if (d.acao === "criar") ficha = { nome: "cachedContents/t" + turno, modelo: MOD, m: d.m, impressao: d.impressao, criado: agora, expira: agora + T.ttlSegundos * 1000 };
    else if (d.acao === "nenhum") ficha = null;
    hist = [...hist, m("assistant", turno), m("user", turno)];
  }
  const escritas = passos.filter((p) => p.acao === "criar");
  const coladas = passos.filter((p, i) => i > 0 && p.acao === "criar" && passos[i - 1].acao === "criar");
  console.log(`      (escritas nos turnos ${escritas.map((p) => `${p.turno}·${p.n}`).join(", ")})`);
  t("a janela de 47 usa o cache que tem (era: escrevia um novo, que durava um turno)", passos.some((p) => p.n === 47 && p.acao === "usar"));
  t("e o cache nasce do lado de lá do corte, na janela de 25", passos.some((p) => p.n === 25 && p.acao === "criar"));
  t("nunca duas escritas seguidas", coladas.length === 0, JSON.stringify(coladas));
  t("e só se escreve no nascimento e no corte", escritas.every((p) => p.n === 3 || p.n === 25));
  t("lixo: o pedido nulo não escreve nada", J.decidirOCache(null).acao === "nenhum");
}

sec("4. A VIAGEM FANTASMA: \"volto com Aelith a Ponte Rasa, direto à Ferradura\"");
{
  const FRASE = "volto com Aelith a Ponte Rasa, direto à Ferradura";
  const boca = { nome: "Poço de Sangue Velho", cidade: "Ponte Rasa", distancia: "perto", dia: 1 };
  const ctx = { cidadeAtual: "Ponte Rasa", cidades: ["Ponte Rasa", "Vau Seco"], lugar: boca, masmorras: [{ nome: "Poço de Sangue Velho", cidade: "Ponte Rasa" }] };
  const ida = R.detectarPartida(FRASE, ctx);
  t("à boca da masmorra, a frase da sessão parte para Ponte Rasa (as regras de partida não apertaram demais)", ida && ida.destino === "Ponte Rasa", JSON.stringify(ida));
  t("e \"voltamos para a cidade\" também", (R.detectarPartida("voltamos para a cidade", ctx) || {}).destino === "Ponte Rasa");
  t("\"não volto a Ponte Rasa\" já não parte (a negação da volta não era lida)", R.detectarPartida("não volto a Ponte Rasa", ctx) === null);
  const dentro = { ...ctx, emMasmorra: true, masmorra: "Poço de Sangue Velho" };
  t("de dentro da masmorra nada parte por frase (sai-se pela boca)", R.detectarPartida(FRASE, dentro) === null);
  const veto = vetoV(FRASE, dentro);
  t("e o Mestre ouve que não houve viagem: o veto diz o destino, a razão e onde a cena continua",
    veto.length === 1 && veto[0].includes("Ponte Rasa") && veto[0].includes(R.VIAGEM_QUE_NAO_HOUVE.razoes.emMasmorra) && veto[0].includes("em Poço de Sangue Velho"), veto[0]);
  t("\"voltamos para a cidade\" lá dentro também veta", vetoV("voltamos para a cidade", dentro).length === 1);
  t("outra cidade do mapa, dita lá dentro, veta com o nome dela", (vetoV("sigo para Vau Seco", dentro)[0] || "").includes("Vau Seco"));
  t("passos da planta não vetam: \"volto pelo corredor\", \"volto à sala da entrada\"", ["volto pelo corredor", "volto à sala da entrada", "volto até a porta de ferro"].every((f) => vetoV(f, dentro).length === 0));
  t("a intenção, a negação, a pergunta e o envelope não vetam",
    ["penso em voltar a Ponte Rasa", "não volto a Ponte Rasa", "Pergunto a Aelith: volto a Ponte Rasa?", "[SISTEMA] volto a Ponte Rasa"].every((f) => vetoV(f, dentro).length === 0));
  t("com a porta aberta o veto cala — quem responde são as portas de sempre", vetoV(FRASE, ctx).length === 0);
  t("na luta e acampado, a razão é a deles", vetoV(FRASE, { ...ctx, emCombate: true })[0].includes(R.VIAGEM_QUE_NAO_HOUVE.razoes.emCombate)
    && vetoV(FRASE, { ...ctx, acampado: true })[0].includes(R.VIAGEM_QUE_NAO_HOUVE.razoes.acampado));
  t("lixo não quebra", typeof R.vetoDaViagemQueNaoHouve === "function" && [null, undefined, "", 7].every((x) => Array.isArray(R.vetoDaViagemQueNaoHouve(x, x)) && R.vetoDaViagemQueNaoHouve(x, x).length === 0));
  t("o App manda o veto pelo canal do turno, dentro de calou", /const vv = vetoDaViagemQueNaoHouve\(acao, \{ \.\.\.ctxDoRastro\(\), masmorra: [^}]+\}\);\s*if \(vv && vv\.length\) naoPodeDoTurnoRef\.current = \[/.test(APP) && APP.includes('calou("o veto da viagem que não houve", e)'));
}

sec("5. A PERGUNTA DIRETA TEM RESPOSTA");
{
  const CID = { nome: "Ponte Rasa", porte: "vila" };
  const adega = CP.fichaParaPauta(CID, { semente: "s12", frase: "O que ronda a adega?" }).pergunta;
  t("\"O que ronda a adega?\" não é pergunta pela ronda da guarda (T5: o Mestre respondeu com o Corpo de Paz)", !adega.some((l) => /^quem vigia/.test(l)), JSON.stringify(adega));
  t("\"algo ronda a casa?\" e \"quem ronda as docas?\" também não", ["algo ronda a casa?", "quem ronda as docas à noite?"].every((f) => !CP.fichaParaPauta(CID, { semente: "s12", frase: f }).pergunta.some((l) => /^quem vigia/.test(l))));
  t("a patrulha, sim: \"há ronda à noite?\", \"quando passa a ronda?\", \"quantas rondas?\"",
    ["Há ronda à noite?", "quando passa a ronda da guarda?", "quantas rondas fazem de noite?", "como passo sem ser visto?"].every((f) => CP.fichaParaPauta(CID, { semente: "s12", frase: f }).pergunta.some((l) => /^quem vigia/.test(l))));
  const ler = E.lerOPedido("Leio o pergaminho.");
  t("\"Leio o pergaminho.\" é pergunta ao papel (era ato: o Mestre respondeu \"ninguém decifra letra aqui\")", ler.le === true && ler.pergunta === true);
  t("e as outras formas de ler", ["Desenrolo o pergaminho e leio.", "leio de novo o papel que tirei do fogo", "abro a carta", "estudo o mapa"].every((f) => E.lerOPedido(f).le));
  t("examinar uma caneca ou olhar para alguém não é ler", ["examino a caneca", "Olho para Wystan", "abro a porta"].every((f) => !E.lerOPedido(f).le));
  const rumo = E.linhaDoRumo({ pedido: ler, passo: "Falar com Wystan" });
  t("o rumo de quem lê manda dizer o que lá está, e nunca \"não se sabe\"", rumo.startsWith(E.RUMOS.ler) && !rumo.includes("diz que não sabe"), rumo);
  t("lixo: o pedido vazio não lê", E.lerOPedido(null).le === false && E.lerOPedido("[ENVELOPE] leio o pergaminho").le === false);
}

sec("6. O NOME DITO SÓ NA ESTREIA (\"Sou Wystan\", 5 em 27)");
{
  const AB = { principalId: "mis_principal", cidade: "Ponte Rasa", titulo: "O nome que a praga deixou",
    pista: { nome: "Wystan", papel: "taverneiro", local: "Ferradura & a Viúva" },
    alvo: { feitio: "procurar", quem: "Mirela Cardo", onde: "Poço de Sangue Velho", origem: "Ponte Rasa" } };
  const vem = E.ESCADA_DA_ESCUTA.find((x) => x.id === "vem_buscar"), sinal = E.ESCADA_DA_ESCUTA.find((x) => x.id === "sinal");
  const mundo = { aqui: "na Ferradura & a Viúva, em Ponte Rasa", abertura: AB, ato: 0, dia: 1 };
  const MOSTRADO = ["Wystan enxuga a caneca de estanho e não levanta os olhos. — Escolhe qual das duas pontas você quer largar, caçadora.", "Aelith cospe no chão."];
  const estreia = E.linhaDoRumo({ pedido: { doJogador: true }, degrau: vem, passo: "x", semente: 1, mundo });
  t("na estreia, Wystan entra com o nome dito (a regra de sempre)", estreia.includes("Wystan") && estreia.endsWith(E.DEGRAU_EM_CENA.rumo.fato), estreia);
  const depois = E.linhaDoRumo({ pedido: { doJogador: true }, degrau: vem, passo: "x", semente: 1, mundo: { ...mundo, mostrado: MOSTRADO } });
  t("já nomeado nas últimas respostas, não se apresenta de novo", depois.endsWith(E.DEGRAU_EM_CENA.rumo.fatoEmCena) && !depois.includes("com o nome dito") && !depois.includes("vem ter com o herói"), depois);
  const sin = E.linhaDoRumo({ pedido: { doJogador: true }, degrau: sinal, passo: "x", semente: 1, mundo: { ...mundo, mostrado: MOSTRADO } });
  t("e o sinal não o aponta como quem ainda não o viu", sin.includes("Wystan") && !sin.includes("ainda não o viu") && sin.endsWith(E.DEGRAU_EM_CENA.rumo.fatoEmCena), sin);
  t("outro nome nas respostas não conta como Wystan", E.linhaDoRumo({ pedido: { doJogador: true }, degrau: vem, passo: "x", semente: 1, mundo: { ...mundo, mostrado: ["Aelith ri."] } }).endsWith(E.DEGRAU_EM_CENA.rumo.fato));
  t("cenaDoDegrau continua a devolver a cena (string), com mostrado lixo", typeof E.cenaDoDegrau(vem, { ...mundo, mostrado: null }) === "string" && E.cenaDoDegrau(vem, { ...mundo, mostrado: null }).includes("Wystan"));
  // retirada (trilha A, 29/10): «o App passa o mostrado ao rumo» — a pauta do turno mudou-se para src/motor/pauta-do-turno.js (aPautaDoTurno), e o App já não tem este texto; é a mesma pauta à letra, provada byte a byte contra o recorte do App em teste-motor-pauta-do-turno.mjs (275 casos), e o texto do motor não se lê (teste-assercoes-de-texto).
}

sec("7. A ABERTURA TEM TAMANHO, E A MOEDA TEM NOME");
{
  const AB = { principalId: "mis_principal", cidade: "Ponte Rasa", titulo: "O nome", chegada: "à porta de Ponte Rasa", historia: "a praga levou metade", razao: "um nome sussurrado", sabe: "Wystan",
    pista: { nome: "Wystan", papel: "taverneiro", local: "Ferradura & a Viúva" }, alvo: { feitio: "procurar", quem: "Mirela", onde: "Poço", origem: "Ponte Rasa" } };
  const p = A.pedidoDaAbertura(AB, { moeda: "lascas" });
  t(`a abertura pede até ${A.TAMANHO_DA_ABERTURA.max} palavras, da tabela (eram 519)`, A.TAMANHO_DA_ABERTURA.max > 0 && A.TAMANHO_DA_ABERTURA.max <= 260 && p.includes(`Até ${A.TAMANHO_DA_ABERTURA.max} palavras`), p.slice(0, 260));
  t("e o preço do mundo na moeda do Léxico (a abertura disse \"cobres\" num mundo de lascas)", p.includes("um preço (em lascas)"));
  t("sem moeda, a linha de sempre", A.pedidoDaAbertura(AB, {}).includes("um preço.") && A.pedidoDaAbertura(AB, null).includes("um preço."));
  // retirada (trilha A, 29/10): «o App passa a moeda à abertura e à rua» — a pauta do turno mudou-se para src/motor/pauta-do-turno.js (aPautaDoTurno), e o App já não tem este texto; é a mesma pauta à letra, provada byte a byte contra o recorte do App em teste-motor-pauta-do-turno.mjs (275 casos), e o texto do motor não se lê (teste-assercoes-de-texto).
  t("a rua diz em que se paga", M.precosDaRua(1, { moeda: "lascas" }).startsWith("na rua, em lascas: caneca ◉ 1"));
  t("e sem moeda (ou com lixo) é a rua de antes", M.precosDaRua(1, null) === M.precosDaRua(1) && M.precosDaRua(1, { moeda: 7 }) === M.precosDaRua(1));
}

sec("8. O CUSPE NO VETO DO GESTO, SEM A LINHA CRESCER");
{
  t("os gestos gastos são tabela, com a medida de cada um", FE.GESTOS_GASTOS.length >= 4 && FE.GESTOS_GASTOS.every((g) => g.id && g.diz && g.medido));
  t("o veto lê a tabela e leva o cuspe (48% na 12.ª, 55% na 11.ª)", FE.GESTOS_GASTOS.every((g) => FE.VETO_DO_GESTO.includes(g.diz)) && FE.VETO_DO_GESTO.includes("cuspe") && /o ar a pressagiar/.test(FE.VETO_DO_GESTO));
  /* as duas linhas de gente como eram na v9.472 */
  const ANTES = {
    pergunta: "termine em alguém em cena faz-me uma pergunta direta, e ela é a última frase; sem braços cruzados, olhar fixo, ninguém à espera nem o ar a pressagiar",
    silencio: "termine em alguém em cena deixa uma fala a meio, e a resposta acaba nela; sem braços cruzados, olhar fixo, ninguém à espera nem o ar a pressagiar",
  };
  const linha = (id) => { const f = FE.FECHOS.find((x) => x.id === id); return `termine em ${f.diz}; ${FE.VETO_DO_GESTO}`; };
  t(`a linha do FECHO não cresce (pergunta ${linha("pergunta").length} ≤ ${ANTES.pergunta.length}, silêncio ${linha("silencio").length} ≤ ${ANTES.silencio.length})`,
    linha("pergunta").length <= ANTES.pergunta.length && linha("silencio").length <= ANTES.silencio.length);
  const esc = FE.escolherFecho({ pedido: { doJogador: true, pergunta: true }, gente: true, sorte: () => 0 });
  t("e o fecho de gente escolhido leva-a", esc.linha.includes("cuspe"), esc.linha);
}

console.log(`\n${bons} ok, ${maus} falhas`);
process.exit(maus ? 1 : 0);
