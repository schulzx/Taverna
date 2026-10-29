/* O TURNO DE VERDADE (29/10, Fase 4 do plano do motor, trilha B) —
   api/turno.js com chave, api/_provedor.js e src/turno-no-servidor.js

   A pessoa: «pode fazer o recomendado, farei a parte da Vercel mais
   tarde». Com uma chave de licença, o /api/turno deixa de responder em
   ensaio: monta o pedido, chama o Narrador pela mesma via do /api/narrador,
   corre o depois (o aplicar, o fim, o Juiz, o Cronista quando o gatilho
   acende, pela mesma via) e devolve o turno. Sem chave, nada muda.

   A PROVA NÃO GASTA UM CENTAVO: o `fetch` é trocado ANTES de qualquer
   import, e responde como o Upstash (para o Redis falso) e como o Google
   (para o provedor falso), anotando cada ida. Nenhuma outra casa responde.
   A chave do provedor é uma palavra falsa, posta só durante cada pedido.

   §1 a tabela da IA do turno é a do App (o reforço, o teto do Cronista) —
      e a suíte confere-o no texto do App, para a cópia não divergir calada;
   §2 o Narrador pela porta, sem rede: a 2.ª escrita, a falha marcada, a
      ficha do cache, o lixo;
   §3 A PROVA: sobre as sessões gravadas, com o provedor falso a responder a
      resposta gravada do Narrador e a proposta gravada do Cronista, o turno
      de verdade dá o MESMO estado do fim (o hash), o mesmo eco, os mesmos
      soltos e a mesma tela que o ensaio com a mesma resposta; a quota conta
      UM por turno; e o custo medido (idas ao Narrador e ao Cronista);
   §4 a quota e as falhas: o provedor que cai devolve o uso; a resposta sem
      narrativa duas vezes também; o Cronista que cai não custa o turno; o
      teto esgotado barra antes de qualquer ida; `resposta` no corpo é 400;
      sem LICENCA_SEGREDO é 503 com o nome, sem ida nenhuma;
   §5 sem chave, nada chama o provedor — nem com a chave dele no ambiente;
   §6 a resposta de verdade não leva o prompt. */
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

let bons = 0, maus = 0;
const t = (n, c) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n); } };
const sec = (s) => console.log("\n" + s);
const aqui = (p) => new URL(p, import.meta.url);

/* ---------------- a rede falsa, antes de qualquer import ---------------- */
const idas = [];
const redis = new Map();
const fetchOriginal = globalThis.fetch;
const resp = (status, corpo) => ({ ok: status >= 200 && status < 300, status, json: async () => corpo, text: async () => JSON.stringify(corpo) });
/* o que o Google falso responde: `provedor(modelo, corpo)` → resposta */
let provedor = () => resp(500, { erro: "sem roteiro" });
let criados = 0;
globalThis.fetch = async (url, op) => {
  const u = String(url);
  const o = op || {};
  if (u.startsWith("https://redis.falso")) {
    idas.push({ casa: "redis", u });
    const corpo = JSON.parse(o.body);
    if (u.endsWith("/pipeline")) {
      const out = [];
      for (const [cmd, k] of corpo) {
        if (cmd === "INCR" || cmd === "DECR") { const n = (Number(redis.get(k)) || 0) + (cmd === "INCR" ? 1 : -1); redis.set(k, String(n)); out.push({ result: n }); } else out.push({ result: 1 });
      }
      return resp(200, out);
    }
    return resp(200, { result: redis.has(corpo[1]) ? redis.get(corpo[1]) : null });
  }
  if (u.startsWith("https://generativelanguage.googleapis.com/")) {
    if (o.method === "DELETE") { idas.push({ casa: "google", u, apagar: true }); return resp(200, {}); }
    const corpo = JSON.parse(o.body);
    if (/\/cachedContents$/.test(u)) { idas.push({ casa: "google", u, criar: true }); criados++; return resp(200, { name: `cachedContents/falso${criados}`, usageMetadata: { totalTokenCount: 30000 } }); }
    const modelo = (/models\/([^:]+):generateContent/.exec(u) || [])[1] || "?";
    idas.push({ casa: "google", u, modelo, corpo, chave: (o.headers || {})["x-goog-api-key"] });
    return provedor(modelo, corpo);
  }
  idas.push({ casa: "fora", u });
  return resp(599, {});
};

const { default: turno } = await import("../api/turno.js");
const S = await import("../src/turno-no-servidor.js");
const { IA_DO_TURNO, oNarradorDoServidor, oPedidoNoServidor, oTurnoNoServidor } = S;
const L = await import("../src/licenca.js");
const { PLANOS, CRONISTA } = await import("../api/_provedor.js");
const { estadoNoTurno } = await import("../src/sessao.js");
const { abrirOSave } = await import("../src/abrir-o-save.js");
const { MOTIVO_SEM_NARRATIVA } = await import("../src/guardado.js");

const sha = (x) => createHash("sha256").update(JSON.stringify(x)).digest("hex");
const can = (x) => JSON.stringify(x, (k, v) => (v && typeof v === "object" && !Array.isArray(v) ? Object.fromEntries(Object.keys(v).sort().map((c) => [c, v[c]])) : v));
const MODELO_DO_NARRADOR = PLANOS.base.padrao, MODELO_DO_CRONISTA = CRONISTA.padrao;
const gemini = (texto) => resp(200, { candidates: [{ content: { parts: [{ text: texto }] }, finishReason: "STOP" }], modelVersion: "falso", usageMetadata: { promptTokenCount: 1000, candidatesTokenCount: 100 } });

/* o ambiente: tudo o que abriria uma casa de verdade sai; a chave do
   provedor é uma palavra falsa, só durante o pedido */
const LIMPAR = ["VERCEL_URL", "ORIGENS_EXTRA", "KV_REST_API_URL", "KV_REST_API_TOKEN", "UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN", "LICENCA_SEGREDO",
  "GEMINI_API_KEY", "DEEPSEEK_API_KEY", "OPENROUTER_API_KEY", "PLANO_PADRAO", "PLANO_SUPERIOR_LIGADO", "NARRADOR_BASE", "NARRADOR_SUPERIOR", "CRONISTA_MODELO", "GM_CACHE_EXPLICITO"];
const guardado = { ...process.env };
const SEGREDO = "s".repeat(L.LICENCA.minimoDoSegredoDoServidor) + "-de-verdade";
const VARS = { KV_REST_API_URL: "https://redis.falso", KV_REST_API_TOKEN: "tk", LICENCA_SEGREDO: SEGREDO, GEMINI_API_KEY: "chave-falsa-de-teste" };
const rodar = async (corpo, { headers = { origin: "http://localhost:5173" }, vars = {} } = {}) => {
  for (const k of LIMPAR) delete process.env[k];
  Object.assign(process.env, vars);
  const res = { codigo: 0, corpo: null, cab: {}, status(c) { this.codigo = c; return this; }, json(b) { this.corpo = b; return this; }, setHeader(k, v) { this.cab[k.toLowerCase()] = v; } };
  try { await turno({ method: "POST", headers, body: corpo === undefined ? undefined : JSON.parse(JSON.stringify(corpo)) }, res); } finally {
    for (const k of Object.keys(process.env)) if (!(k in guardado)) delete process.env[k];
    Object.assign(process.env, guardado);
  }
  return res;
};
const emitir = (licenciante, teto, byte) => {
  const e = L.emitirChave({ licenciante, teto, janela: 3600 }, SEGREDO, { aleatorio: () => Buffer.alloc(L.LICENCA.bytesDoSegredo, byte) });
  redis.set(e.onde, JSON.stringify(e.registo));
  return { ...e, cab: { authorization: `Bearer ${e.chave}` } };
};
const usosDe = (licenciante) => [...redis.entries()].filter(([k]) => k.startsWith(`${L.QUOTA.contador}${licenciante}:`)).reduce((s, [, v]) => s + Number(v), 0);
const idasAoProvedor = () => idas.filter((x) => x.casa === "google" && x.modelo).length;

/* os estados como o load os abre (o mesmo de teste-turno-no-servidor) */
const FICHA = { atributos: { forca: 2, destreza: 1, constituicao: 2, inteligencia: 0, sabedoria: 1, carisma: 0 }, conceito: "Andarilha sem nome" };
const comoOLoadAbre = (e) => {
  const x = Object.fromEntries(Object.entries(abrirOSave(e, { naSentada: false })).filter(([, v]) => v != null));
  const p = x.personagem || {};
  x.personagem = { ...p, atributos: p.atributos || FICHA.atributos, conceito: p.conceito || FICHA.conceito };
  return x;
};
const SESSOES = ["s8", "s9", "s10", "navegador"].map((s) => ({ s, A: JSON.parse(readFileSync(aqui(`sessao-${s}.json`), "utf8")) }));
const FRASE_MAX = Number((/fraseMax:\s*(\d+)/.exec(readFileSync(aqui("../api/turno.js"), "utf8")) || [])[1]);
const fraseDe = (T) => { const ent = T.entrada || {}; return typeof ent.frase === "string" && ent.frase.trim() ? ent.frase : ent.toque && typeof ent.toque.conteudo === "string" ? ent.toque.conteudo : ""; };

sec("1. A TABELA DA IA DO TURNO É A DO APP");
{
  const APP = readFileSync(aqui("../src/App.jsx"), "utf8");
  const mestre = APP.slice(APP.indexOf("async function chamarMestre("), APP.indexOf("async function chamarMestre(") + 4000);
  t("o reforço é o texto que o chamarMestre do App manda", mestre.includes(JSON.stringify(IA_DO_TURNO.textoDoReforco).slice(1, -1)));
  t(`e com o teto dele (${IA_DO_TURNO.reforco.maxTokens}, ${IA_DO_TURNO.reforco.formato})`, mestre.includes(`chamarModelo(pedido.system, reforco, ${IA_DO_TURNO.reforco.maxTokens}, "${IA_DO_TURNO.reforco.formato}")`));
  t("a régua da 2.ª escrita é a do App (o «…» e o «O Mestre hesita»)", mestre.includes(`resp.narrativa === "${IA_DO_TURNO.vazia}" || resp.narrativa.startsWith("${IA_DO_TURNO.hesita}")`));
  const c = IA_DO_TURNO.cronista;
  t(`o Cronista pede o que o cronistaDoTurno do App pede (${c.maxTokens}, ${c.formato}, ${c.tarefa})`, APP.includes(`chamarModelo(sys, [{ role: "user", content: user }], ${c.maxTokens}, "${c.formato}", "${c.tarefa}")`));
  t("a tabela está congelada", Object.isFrozen(IA_DO_TURNO) && Object.isFrozen(IA_DO_TURNO.cronista) && Object.isFrozen(IA_DO_TURNO.reforco));
}

sec("2. O NARRADOR PELA PORTA, SEM REDE");
{
  const pedido = { system: "S", messages: [{ role: "user", content: "abro a porta" }], maxTokens: 3600, formato: "json", tarefa: "narrador", comCache: true };
  const porta = (respostas) => { const corpos = []; const f = async (c) => { corpos.push(c); const r = respostas.shift(); if (r instanceof Error) throw r; return r; }; f.corpos = corpos; return f; };
  const p1 = porta([{ texto: '{"narrativa":"A porta range.","mudancas":{"hp":-1}}', cache: { nome: "cachedContents/x" }, uso: { entrada: 10, tarefa: "narrador" } }]);
  const n1 = await oNarradorDoServidor(pedido, p1, { cache: { nome: "velha" } });
  t("uma ida: a narrativa e as mudanças", n1.chamadas === 1 && n1.resposta.narrativa === "A porta range." && n1.resposta.mudancas.hp === -1);
  t("o corpo é o do /api/narrador, com a ficha que o cliente guardou", can(p1.corpos[0]) === can({ system: "S", messages: pedido.messages, maxTokens: 3600, formato: "json", tarefa: "narrador", cache: { nome: "velha" } }));
  t("e a ficha nova volta, com o uso", n1.cache && n1.cache.nome === "cachedContents/x" && n1.usos.length === 1);
  const n1b = await oNarradorDoServidor(pedido, porta([{ texto: '{"narrativa":"ok, a porta abre."}' }]));
  t("sem ficha guardada vai a vazia (o 1.º turno), e a que não volta morre (null)", n1b.cache === null);
  const n1c = await oNarradorDoServidor({ ...pedido, comCache: false }, porta([{ texto: '{"narrativa":"ok, a porta abre."}' }]));
  t("pedido sem cache: a ficha nem existe (undefined)", n1c.cache === undefined);
  const p2 = porta([{ texto: '{"narrativa":"…","mudancas":{"ouro":3}}' }, { texto: '{"narrativa":"Agora sim, a porta range."}' }]);
  const n2 = await oNarradorDoServidor(pedido, p2);
  t("narrativa «…»: a 2.ª escrita, com o reforço no fim e sem a ficha", n2.chamadas === 2 && p2.corpos[1].messages.length === 2 && p2.corpos[1].messages[1].content === IA_DO_TURNO.textoDoReforco && !("cache" in p2.corpos[1]) && p2.corpos[1].maxTokens === IA_DO_TURNO.reforco.maxTokens);
  t("e as mudanças da 1.ª ficam quando a 2.ª não as traz", n2.resposta.narrativa === "Agora sim, a porta range." && n2.resposta.mudancas.ouro === 3);
  const marcado = async (f) => { try { await f(); return null; } catch (e) { return e; } };
  const e3 = await marcado(() => oNarradorDoServidor(pedido, porta([{ texto: "{}" }, { texto: '{"narrativa":"O Mestre hesita por um instante…"}' }])));
  t("nem a 2.ª traz narrativa: o turno não acontece, MARCADO", e3 && e3.motivo === IA_DO_TURNO.falhou && e3.message === MOTIVO_SEM_NARRATIVA);
  const e4 = await marcado(() => oNarradorDoServidor(pedido, porta([new Error("gemini: 500")])));
  t("a porta que lança: marcado, com a mensagem dela", e4 && e4.motivo === IA_DO_TURNO.falhou && /gemini: 500/.test(e4.message));
  const e5 = await marcado(() => oNarradorDoServidor(null, null, null));
  t("lixo (tudo null): lança marcado, não estoura de outra forma", e5 && e5.motivo === IA_DO_TURNO.falhou);
  const congelado = JSON.stringify(pedido);
  await oNarradorDoServidor(pedido, porta([{ texto: '{"narrativa":"ok, a porta abre."}' }]), null);
  t("o pedido recebido não é mutado", JSON.stringify(pedido) === congelado);
}

sec("3. A PROVA — o turno de verdade, com o provedor falso, é o do ensaio com a mesma resposta");
const CUSTO = { turnos: 0, narrador: 0, cronista: 0, reforcos: 0 };
{
  const lic = emitir("casa-de-prova", 100000, 11);
  let casos = 0, estadoIgual = 0, ecoIgual = 0, soltosIgual = 0, telaIgual = 0, narrativaIgual = 0, cronistaIgual = 0, umUso = 0, podadas = 0, comFicha = 0, falhas = 0;
  const exemplos = [];
  for (const { s, A } of SESSOES) {
    let eco = null, ficha = null;
    for (let i = 0; i < A.turnos.length; i++) {
      const T = A.turnos[i];
      const frase = fraseDe(T);
      if (!frase.trim() || frase.length > FRASE_MAX || !T.narrador) continue;
      const estado = comoOLoadAbre(estadoNoTurno(A, i));
      const proposta = T.cronista ? T.cronista.proposta : null;
      provedor = (modelo) => modelo === MODELO_DO_CRONISTA ? gemini(JSON.stringify(proposta)) : modelo === MODELO_DO_NARRADOR ? gemini(JSON.stringify(T.narrador)) : resp(500, {});
      const antesN = idas.filter((x) => x.modelo === MODELO_DO_NARRADOR).length, antesC = idas.filter((x) => x.modelo === MODELO_DO_CRONISTA).length;
      const usosAntes = usosDe("casa-de-prova");
      const r = await rodar({ estado, frase, ...(eco ? { eco } : {}), ...(ficha ? { cache: ficha } : {}) }, { headers: lic.cab, vars: VARS });
      casos++;
      if (r.codigo !== 200) { falhas++; if (exemplos.length < 2) exemplos.push(`${s}#${i}: ${r.codigo} ${JSON.stringify(r.corpo).slice(0, 160)}`); continue; }
      const nN = idas.filter((x) => x.modelo === MODELO_DO_NARRADOR).length - antesN, nC = idas.filter((x) => x.modelo === MODELO_DO_CRONISTA).length - antesC;
      CUSTO.turnos++; CUSTO.narrador += nN; CUSTO.cronista += nC; if (nN > 1) CUSTO.reforcos++;
      if (usosDe("casa-de-prova") - usosAntes === 1 && r.corpo.chamadas === nN + nC) umUso++;
      if ("cache" in r.corpo && (r.corpo.cache === null || typeof r.corpo.cache === "object")) comFicha++;
      /* A MESMA RESPOSTA, para o ensaio: a do Narrador pela porta — o JSON
         extraído e a fala do herói podada, como a rota a recebeu */
      const montado = await oPedidoNoServidor({ estado, frase, ...(eco ? { eco } : {}) });
      const n = await oNarradorDoServidor(montado.pedido, async () => ({ texto: JSON.stringify(T.narrador) }));
      if (n.resposta.narrativa !== T.narrador.narrativa) podadas++;
      const en = await rodar({ estado, frase, ...(eco ? { eco } : {}), resposta: n.resposta, ...(proposta ? { cronista: proposta } : {}) });
      if (en.codigo === 200 && en.corpo.estado.hash === sha(r.corpo.estadoDoFim)) estadoIgual++;
      else if (exemplos.length < 4) exemplos.push(`${s}#${i}: estado do fim difere`);
      if (en.codigo === 200 && can(en.corpo.eco) === can(r.corpo.eco)) ecoIgual++;
      if (en.codigo === 200 && can(en.corpo.soltos) === can(r.corpo.soltos)) soltosIgual++;
      if (en.codigo === 200 && can(en.corpo.tela) === can(r.corpo.tela)) telaIgual++;
      if (en.codigo === 200 && can(en.corpo.cronista) === can(r.corpo.cronista) && (r.corpo.cronista.chamado ? nC === 1 : nC === 0)) cronistaIgual++;
      if (r.corpo.narrativa === n.resposta.narrativa) narrativaIgual++;
      eco = r.corpo.eco && Object.keys(r.corpo.eco).length ? r.corpo.eco : null;
      ficha = r.corpo.cache || null;
    }
  }
  if (exemplos.length) console.log("      " + exemplos.join("\n      "));
  console.log(`      (${casos} turnos; a fala do herói podada em ${podadas}; caches criados ${criados} — as sessões gravadas têm histórico curto demais para o mínimo do cache explícito, janela.js)`);
  t(`o turno de verdade responde 200 em todos (${casos - falhas}/${casos})`, casos >= 140 && falhas === 0);
  t(`o estado do fim é o do ensaio com a mesma resposta, byte a byte (${estadoIgual}/${casos})`, estadoIgual === casos);
  t(`e o eco (${ecoIgual}), os soltos (${soltosIgual}) e a tela (${telaIgual}) também`, ecoIgual === casos && soltosIgual === casos && telaIgual === casos);
  t(`o Cronista decide igual, e só vai à rede quando o gatilho acende (${cronistaIgual}/${casos})`, cronistaIgual === casos);
  t(`a narrativa devolvida é a do Narrador (${narrativaIgual}/${casos})`, narrativaIgual === casos);
  t(`A QUOTA: um uso por turno, por mais idas que o turno faça (${umUso}/${casos})`, umUso === casos);
  t(`e a conta da licença fecha: ${usosDe("casa-de-prova")} usos para ${casos} turnos e ${CUSTO.narrador + CUSTO.cronista} idas à IA`, usosDe("casa-de-prova") === casos && CUSTO.narrador + CUSTO.cronista > casos);
  /* a ficha do cache: o pedido do Narrador leva-a (comCache) e a rota devolve-a SEMPRE ao cliente — a nova, ou null quando não houve; a decisão de criar é de janela.js, provada em teste-cache-explicito */
  t(`a ficha do cache volta ao cliente em todo turno (${comFicha}/${casos})`, comFicha === casos);
  const porTurno = (x) => (x / Math.max(1, CUSTO.turnos)).toFixed(2).replace(".", ",");
  console.log(`      O CUSTO MEDIDO: ${CUSTO.narrador} idas ao Narrador (${porTurno(CUSTO.narrador)} por turno; ${CUSTO.reforcos} com 2.ª escrita) + ${CUSTO.cronista} ao Cronista (${porTurno(CUSTO.cronista)} por turno) em ${CUSTO.turnos} turnos — ${porTurno(CUSTO.narrador + CUSTO.cronista)} chamadas de IA por turno, UM uso da quota`);
  t("o custo é 1 Narrador por turno e o Cronista em menos de 2 de 3", CUSTO.narrador === CUSTO.turnos && CUSTO.cronista > 0 && CUSTO.cronista < CUSTO.turnos * 0.7);
}

sec("4. A QUOTA E AS FALHAS");
{
  const { A } = SESSOES.find((x) => x.s === "navegador");
  const T = A.turnos[1];
  const corpo = { estado: comoOLoadAbre(estadoNoTurno(A, 1)), frase: fraseDe(T) };
  const lic = emitir("casa-das-falhas", 3, 12);
  provedor = () => resp(400, { error: "pedido recusado" });
  const cai = await rodar(corpo, { headers: lic.cab, vars: VARS });
  t("o provedor que cai: 502, o turno não aconteceu", cai.codigo === 502 && cai.corpo.motivo === IA_DO_TURNO.falhou && !("estadoDoFim" in cai.corpo) && /Todos os provedores falharam/.test(cai.corpo.detalhe));
  t("e o uso VOLTA: a conta diz 0 de 3, e o Redis também", cai.corpo.devolvido === true && cai.corpo.licenca.usos === 0 && cai.corpo.licenca.restam === 3 && usosDe("casa-das-falhas") === 0);
  provedor = (modelo) => gemini(modelo === MODELO_DO_NARRADOR ? '{"narrativa":"…"}' : "{}");
  const antes = idasAoProvedor();
  const mudo = await rodar(corpo, { headers: lic.cab, vars: VARS });
  t("a resposta sem narrativa, duas vezes: 502 e o uso volta", mudo.codigo === 502 && mudo.corpo.detalhe === MOTIVO_SEM_NARRATIVA && usosDe("casa-das-falhas") === 0);
  t("e foram duas idas (a 2.ª escrita), nenhuma ao Cronista", idasAoProvedor() - antes === 2 && idas.filter((x) => x.casa === "google").slice(-2).every((x) => x.modelo === MODELO_DO_NARRADOR));
  /* o Cronista que cai não custa o turno */
  provedor = (modelo) => modelo === MODELO_DO_NARRADOR ? gemini(JSON.stringify(T.narrador)) : resp(400, { error: "cronista fora" });
  const semCronista = await rodar(corpo, { headers: lic.cab, vars: VARS });
  t("o Cronista que cai: o turno acontece (200), e conta 1", semCronista.codigo === 200 && typeof semCronista.corpo.narrativa === "string" && semCronista.corpo.narrativa.length > 0 && usosDe("casa-das-falhas") === 1);
  t("e diz que o Cronista foi chamado e calou", semCronista.corpo.cronista.corre === false || (semCronista.corpo.cronista.chamado === true && semCronista.corpo.calados > 0));
  /* com chave, a resposta do cliente não entra */
  const antes2 = idasAoProvedor();
  const forjada = await rodar({ ...corpo, resposta: T.narrador }, { headers: lic.cab, vars: VARS });
  const forjadaC = await rodar({ ...corpo, cronista: { npcs: [] } }, { headers: lic.cab, vars: VARS });
  t("com chave, `resposta` ou `cronista` no corpo: 400, e nenhuma ida ao provedor", forjada.codigo === 400 && forjada.corpo.motivo === "resposta-do-cliente" && forjadaC.codigo === 400 && idasAoProvedor() === antes2);
  /* o teto esgotado barra antes da rede */
  provedor = (modelo) => gemini(modelo === MODELO_DO_NARRADOR ? JSON.stringify(T.narrador) : "null");
  const antes3 = idasAoProvedor();
  const esgotou = await rodar(corpo, { headers: lic.cab, vars: VARS });
  t("a quota esgotada (os dois 400 contaram): 429 com retry-after, sem ida ao provedor", esgotou.codigo === 429 && Number(esgotou.cab["retry-after"]) > 0 && idasAoProvedor() === antes3);
  /* sem o segredo do servidor: 503 com o nome, e nada */
  const lic2 = emitir("casa-sem-segredo", 5, 13);
  const idasAntes = idas.length;
  const semSegredo = await rodar(corpo, { headers: lic2.cab, vars: { ...VARS, LICENCA_SEGREDO: "" } });
  t("sem LICENCA_SEGREDO: 503 que diz o nome, sem ida nenhuma (nem ao Redis)", semSegredo.codigo === 503 && /LICENCA_SEGREDO/.test(semSegredo.corpo.erro) && idas.length === idasAntes);
  /* sem chave de provedor no ambiente: o turno cai antes da rede, e devolve */
  const lic3 = emitir("casa-sem-provedor", 5, 14);
  const antes4 = idasAoProvedor();
  const semProvedor = await rodar(corpo, { headers: lic3.cab, vars: { ...VARS, GEMINI_API_KEY: "" } });
  t("sem a chave do provedor: 502, o uso volta, nenhuma ida ao provedor", semProvedor.codigo === 502 && /Nenhuma chave configurada/.test(semProvedor.corpo.detalhe) && usosDe("casa-sem-provedor") === 0 && idasAoProvedor() === antes4);
  /* a devolução, no módulo */
  const memo = { n: 5, async descontar() { this.n--; return this.n; } };
  t("devolverOUso: só sobre uma conta autorizada", (await L.devolverOUso(null, memo)) === null && (await L.devolverOUso({ ok: false, contador: "quota:x" }, memo)) === null && memo.n === 5);
  t("devolverOUso: com o contador da licença, desconta uma vez", (await L.devolverOUso({ ok: true, contador: `${L.QUOTA.contador}casa:3600:1`, validade: 3660 }, memo)) === 4 && memo.n === 4);
  t("devolverOUso: contador que não é da quota não se toca", (await L.devolverOUso({ ok: true, contador: "licenca:casa" }, memo)) === null && memo.n === 4);
  t("devolverOUso: armazém sem descontar, ou que lança: null, sem estourar", (await L.devolverOUso({ ok: true, contador: "quota:a" }, { somar() {} })) === null && (await L.devolverOUso({ ok: true, contador: "quota:a" }, { async descontar() { throw new Error("caiu"); } })) === null);
  t("devolverOUso: nunca abaixo de zero", (await L.devolverOUso({ ok: true, contador: "quota:a" }, { async descontar() { return -1; } })) === 0);
}

sec("5. SEM CHAVE, NADA CHAMA O PROVEDOR");
{
  const antes = idasAoProvedor();
  provedor = () => gemini('{"narrativa":"não devia ser chamado"}');
  let duzentos = 0, n = 0;
  for (const { A } of SESSOES.slice(0, 2)) {
    for (let i = 0; i < Math.min(8, A.turnos.length); i++) {
      const T = A.turnos[i];
      const frase = fraseDe(T);
      if (!frase.trim() || !T.narrador) continue;
      const estado = comoOLoadAbre(estadoNoTurno(A, i));
      /* com a chave do provedor no ambiente: o ensaio do pedido e o do depois */
      const a = await rodar({ estado, frase }, { vars: VARS });
      const b = await rodar({ estado, frase, resposta: T.narrador, ...(T.cronista ? { cronista: T.cronista.proposta } : {}) }, { vars: VARS });
      n += 2;
      if (a.codigo === 200 && a.corpo.ensaio === true && b.codigo === 200 && b.corpo.ensaio === true) duzentos += 2;
    }
  }
  t(`sem chave a rota é ensaio, como era (${duzentos}/${n})`, n > 0 && duzentos === n);
  t(`e nenhuma ida ao provedor, com a chave dele no ambiente (${idasAoProvedor() - antes})`, idasAoProvedor() === antes);
}

sec("6. A RESPOSTA DE VERDADE NÃO LEVA O PROMPT");
{
  const { A } = SESSOES.find((x) => x.s === "s9");
  const T = A.turnos[3];
  const corpo = { estado: comoOLoadAbre(estadoNoTurno(A, 3)), frase: fraseDe(T) };
  const lic = emitir("casa-do-segredo", 5, 15);
  provedor = (modelo) => gemini(modelo === MODELO_DO_NARRADOR ? JSON.stringify(T.narrador) : "null");
  const r = await rodar(corpo, { headers: lic.cab, vars: VARS });
  const pedido = idas.filter((x) => x.modelo === MODELO_DO_NARRADOR).slice(-1)[0];
  const sys = String((pedido && pedido.corpo.systemInstruction && pedido.corpo.systemInstruction.parts[0].text) || "");
  const texto = JSON.stringify(r.corpo);
  const amostras = [0.1, 0.4, 0.7].map((f) => sys.slice(Math.floor(sys.length * f), Math.floor(sys.length * f) + 60));
  t(`o system foi ao provedor (${sys.length} caracteres)`, r.codigo === 200 && sys.length > 1000);
  t("e nenhum pedaço dele volta na resposta", amostras.every((a) => a.length === 60 && !texto.includes(a)));
  t("a resposta tem as chaves do turno", ["estadoDoFim", "eco", "soltos", "tela", "narrativa", "cronista", "chamadas", "uso", "licenca"].every((k) => k in r.corpo) && !("pedido" in r.corpo) && !("ensaio" in r.corpo));
  t("e a conta da licença não leva o contador do servidor", !("contador" in r.corpo.licenca) && !("validade" in r.corpo.licenca));
}

sec("7. NENHUMA CASA DE VERDADE");
{
  const fora = idas.filter((x) => x.casa === "fora");
  t(`nenhuma ida fora do Redis falso e do provedor falso (${idas.length} idas: ${idas.filter((x) => x.casa === "redis").length} ao Redis, ${idas.filter((x) => x.casa === "google").length} ao provedor falso)`, fora.length === 0 && idas.length > 0);
  t("e toda ida ao provedor levou a chave falsa", idas.some((x) => x.modelo) && idas.filter((x) => x.modelo).every((x) => x.chave === VARS.GEMINI_API_KEY));
}

globalThis.fetch = fetchOriginal;
console.log(`\nturno de verdade: ${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
