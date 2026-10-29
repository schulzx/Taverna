/* A LICENÇA E O TURNO PELO SERVIDOR (29/10, Fase 4 do plano do motor,
   trilha B) — src/licenca.js e o esqueleto api/turno.js

   O que esta suíte prova:
   §1 a tabela tem os números dentro dos próprios limites;
   §2 emitir é determinístico com a sorte injetada, e a chave nunca vai
      para o registo — só o selo;
   §3 o lixo (null, {}, número, formato torto) não passa por chave;
   §4 a chave do pedido é `Bearer <chave>`, e só isso;
   §5 autorizar: a quota conta, esgota, reabre na janela seguinte; a
      recusa não distingue licenciante desconhecido de segredo errado; o
      selo não muda de dono; a suspensão só se revela a quem tem a chave;
      armazém fora, segredo ausente ou registo ilegível RECUSAM (falha
      fechada); o registo recebido não é mutado;
   §6 a conta da janela é pura;
   §7 o armazém do Upstash fala o mesmo REST que o portão e a sala;
   §8 a rota: 405, as duas portas, os 503 que dizem o nome da variável que
      falta, a forma do pedido, o 429 com retry-after, e a porta que abre
      para a montagem — sem NUNCA chamar um provedor (o `fetch` é espiado do
      começo ao fim). O pedido montado, byte a byte, é provado em
      teste-turno-no-servidor.mjs.

   Nada aqui toca Redis real: o armazém é de memória, e o da rota é um
   `fetch` falso que responde como o Upstash. */
const L = await import("../src/licenca.js");
const { LICENCA, QUOTA } = L;

let bons = 0, maus = 0;
const t = (n, c) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n); } };
const sec = (s) => console.log("\n" + s);
const lanca = (fn) => { try { fn(); return false; } catch { return true; } };

const SEGREDO = "s".repeat(LICENCA.minimoDoSegredoDoServidor) + "-do-servidor";
const sorteFixa = (b) => () => Buffer.alloc(LICENCA.bytesDoSegredo, b);
const AGORA = Date.UTC(2026, 9, 29, 12, 0, 0);

const memoria = () => {
  const m = new Map(), validade = new Map();
  return {
    m, validade,
    async ler(k) { return m.has(k) ? m.get(k) : null; },
    async somar(k, v) { const n = (Number(m.get(k)) || 0) + 1; m.set(k, String(n)); validade.set(k, v); return n; },
  };
};
const comLicenca = (emitido, armazem) => { armazem.m.set(emitido.onde, JSON.stringify(emitido.registo)); return armazem; };

sec("1. A TABELA");
{
  t("o padrão da janela cabe nos limites", QUOTA.janelaPadrao >= QUOTA.janelaMin && QUOTA.janelaPadrao <= QUOTA.janelaMax);
  t("o padrão do teto cabe nos limites", QUOTA.tetoPadrao >= QUOTA.tetoMin && QUOTA.tetoPadrao <= QUOTA.tetoMax);
  t("o segredo é de 256 bits", LICENCA.bytesDoSegredo * 8 === 256);
  t("e 32 bytes em base64url são 43 caracteres", Buffer.alloc(LICENCA.bytesDoSegredo).toString("base64url").length === 43);
  t("a folga é menor que a menor janela", QUOTA.folga <= QUOTA.janelaMin);
  t("as tabelas não se mexem", Object.isFrozen(LICENCA) && Object.isFrozen(QUOTA));
}

sec("2. EMITIR");
{
  const a = L.emitirChave({ licenciante: "casa-de-jogo", nome: "Casa de Jogo", teto: 50, janela: 3600 }, SEGREDO, { aleatorio: sorteFixa(7), agora: AGORA });
  const b = L.emitirChave({ licenciante: "casa-de-jogo", nome: "Casa de Jogo", teto: 50, janela: 3600 }, SEGREDO, { aleatorio: sorteFixa(7), agora: AGORA });
  t("a mesma sorte dá a mesma chave", a.chave === b.chave && JSON.stringify(a.registo) === JSON.stringify(b.registo));
  t("outra sorte, outra chave", L.emitirChave({ licenciante: "casa-de-jogo" }, SEGREDO, { aleatorio: sorteFixa(8) }).chave !== a.chave);
  t("o formato é tav1.<licenciante>.<segredo>", /^tav1\.casa-de-jogo\.[A-Za-z0-9_-]{43}$/.test(a.chave));
  t("e a chave emitida se lê", JSON.stringify(L.lerChave(a.chave)) === JSON.stringify({ licenciante: "casa-de-jogo", segredo: a.chave.split(".")[2] }));
  t("o registo mora em licenca:<licenciante>", a.onde === "licenca:casa-de-jogo");
  const reg = JSON.stringify(a.registo);
  t("A CHAVE NÃO VAI PARA O REGISTO — nem o segredo", !reg.includes(a.chave) && !reg.includes(a.chave.split(".")[2]));
  t("o registo guarda o selo", a.registo.selo === L.seloDaChave(a.chave, SEGREDO) && /^[0-9a-f]{64}$/.test(a.registo.selo));
  t("o selo depende do segredo do servidor", L.seloDaChave(a.chave, SEGREDO + "x") !== a.registo.selo);
  t("teto e janela do pedido ficam", a.registo.teto === 50 && a.registo.janela === 3600 && a.registo.ativa === true);
  t("a data é a injetada", a.registo.emitida === new Date(AGORA).toISOString());
  const fora = L.emitirChave({ licenciante: "fora", teto: 0, janela: 5 }, SEGREDO, { aleatorio: sorteFixa(1) });
  t("teto e janela fora dos limites caem no padrão", fora.registo.teto === QUOTA.tetoPadrao && fora.registo.janela === QUOTA.janelaPadrao);
  t("sem licenciante, lança", lanca(() => L.emitirChave({}, SEGREDO)));
  t("com null, lança (o `= {}` não cobre null)", lanca(() => L.emitirChave(null, SEGREDO)));
  t("licenciante com maiúscula, lança", lanca(() => L.emitirChave({ licenciante: "Casa" }, SEGREDO)));
  t("licenciante com ponto, lança", lanca(() => L.emitirChave({ licenciante: "a.b.c" }, SEGREDO)));
  t("segredo do servidor curto, lança", lanca(() => L.emitirChave({ licenciante: "casa" }, "curto")));
  t("sorte que não dá os bytes, lança", lanca(() => L.emitirChave({ licenciante: "casa" }, SEGREDO, { aleatorio: () => Buffer.alloc(3) })));
}

sec("3. O LIXO NÃO É CHAVE");
{
  const boa = L.emitirChave({ licenciante: "casa" }, SEGREDO, { aleatorio: sorteFixa(2) }).chave;
  const [, , seg] = boa.split(".");
  for (const [n, x] of [["null", null], ["{}", {}], ["número", 42], ["vazio", ""], ["outro prefixo", `tav2.casa.${seg}`], ["quatro partes", `tav1.casa.${seg}.x`],
    ["licenciante maiúsculo", `tav1.Casa.${seg}`], ["licenciante de 2", `tav1.ab.${seg}`], ["segredo curto", "tav1.casa.abc"], ["segredo com +", `tav1.casa.${seg.slice(0, 42)}+`]]) {
    t(`${n}: não é chave`, L.lerChave(x) === null);
  }
  t("espaço nas pontas não estraga a boa", L.lerChave(`  ${boa} `) !== null);
}

sec("4. A CHAVE DO PEDIDO");
{
  t("Bearer <chave>", L.chaveDoPedido({ authorization: "Bearer tav1.casa.x" }) === "tav1.casa.x");
  t("sem cabeçalho, vazio", L.chaveDoPedido({}) === "");
  t("cabeçalhos null, vazio", L.chaveDoPedido(null) === "");
  t("outro esquema, vazio", L.chaveDoPedido({ authorization: "Basic abc" }) === "");
  t("Bearer sem chave, vazio", L.chaveDoPedido({ authorization: "Bearer" }) === "");
  t("Bearer com duas coisas, vazio", L.chaveDoPedido({ authorization: "Bearer a b" }) === "");
}

sec("5. AUTORIZAR");
{
  const e = L.emitirChave({ licenciante: "casa", teto: 3, janela: 3600 }, SEGREDO, { aleatorio: sorteFixa(9), agora: AGORA });
  const arm = comLicenca(e, memoria());
  const vai = (extra = {}) => L.autorizar({ chave: e.chave, segredoDoServidor: SEGREDO, armazem: arm, agora: AGORA, ...extra });
  const r1 = await vai();
  t("a chave boa entra", r1.ok && r1.licenciante === "casa");
  t("e conta 1 de 3", r1.usos === 1 && r1.teto === 3 && r1.restam === 2);
  const r2 = await vai(), r3 = await vai(), r4 = await vai();
  t("a 3.ª ainda entra, com 0 a restar", r2.ok && r3.ok && r3.restam === 0);
  t("a 4.ª é recusada com 429", !r4.ok && r4.status === 429 && r4.motivo === "quota-esgotada");
  t("e diz quando reabre", r4.reabreEm === L.janelaDe(AGORA, 3600).reabreEm && r4.reabreEm > 0 && r4.reabreEm <= 3600 * 1000);
  const chaves = [...arm.m.keys()].filter((k) => k.startsWith(QUOTA.contador));
  t("um contador só para a janela", chaves.length === 1 && arm.m.get(chaves[0]) === "4");
  t("que vive a janela mais a folga", arm.validade.get(chaves[0]) === 3600 + QUOTA.folga);
  const r5 = await vai({ agora: AGORA + 3600 * 1000 });
  t("na janela seguinte, reabre do 1", r5.ok && r5.usos === 1);
  /* a recusa não ensina nomes */
  const errada = `tav1.casa.${Buffer.alloc(32, 1).toString("base64url")}`;
  const ninguem = `tav1.ninguem.${e.chave.split(".")[2]}`;
  const rE = await vai({ chave: errada }), rN = await vai({ chave: ninguem });
  t("segredo errado: 401", !rE.ok && rE.status === 401);
  t("licenciante que não existe: 401", !rN.ok && rN.status === 401);
  t("e as duas recusas são a mesma, letra a letra", JSON.stringify(rE) === JSON.stringify(rN));
  t("a recusada sem chave não gasta quota", [...arm.m.keys()].filter((k) => k.includes("ninguem")).length === 0);
  /* o selo não muda de dono */
  const outra = L.emitirChave({ licenciante: "outra" }, SEGREDO, { aleatorio: sorteFixa(9) });
  arm.m.set(outra.onde, JSON.stringify({ ...outra.registo, selo: e.registo.selo }));
  t("o selo copiado para outro licenciante não abre", !(await vai({ chave: `tav1.outra.${e.chave.split(".")[2]}` })).ok);
  /* a suspensão */
  const s = L.emitirChave({ licenciante: "parada" }, SEGREDO, { aleatorio: sorteFixa(4) });
  arm.m.set(s.onde, JSON.stringify({ ...s.registo, ativa: false }));
  const rS = await vai({ chave: s.chave });
  t("licença suspensa: 403", !rS.ok && rS.status === 403 && rS.motivo === "licenca-suspensa");
  const rSE = await vai({ chave: `tav1.parada.${Buffer.alloc(32, 5).toString("base64url")}` });
  t("mas a quem não tem a chave, é só 401", rSE.status === 401);
  /* falha fechada */
  t("sem segredo do servidor: 503", (await vai({ segredoDoServidor: "" })).status === 503);
  t("com o segredo curto: 503, e diz o nome", /LICENCA_SEGREDO/.test((await vai({ segredoDoServidor: "curto" })).erro));
  t("sem armazém: 503", (await vai({ armazem: null })).status === 503);
  const quebrado = { async ler() { throw new Error("caiu"); }, async somar() { throw new Error("caiu"); } };
  t("armazém que lança na leitura: 503, nunca passa", (await vai({ armazem: quebrado })).status === 503);
  const meio = { ler: arm.ler, async somar() { throw new Error("caiu"); } };
  t("armazém que lança na conta: 503, nunca passa", (await vai({ armazem: meio })).status === 503);
  const semNum = { ler: arm.ler, async somar() { return "abc"; } };
  t("conta que não é número: 503", (await vai({ armazem: semNum })).status === 503);
  arm.m.set("licenca:torta", "{isto não é json");
  t("registo ilegível: 503", (await vai({ chave: `tav1.torta.${e.chave.split(".")[2]}` })).status === 503);
  t("chave null: 401 de formato", (await vai({ chave: null })).motivo === "chave-malformada");
  t("autorizar sem nada: 503, sem estourar", (await L.autorizar()).status === 503);
  t("autorizar com null: 503, sem estourar", (await L.autorizar(null).catch(() => ({ status: "estourou" }))).status !== "estourou");
  /* registo vindo como objeto, e não mutado */
  const obj = { ...e.registo, teto: 9e9 };
  const congelado = JSON.stringify(obj);
  const armO = { async ler() { return obj; }, async somar() { return 1; } };
  const rO = await vai({ armazem: armO });
  t("registo em objeto também serve, com o teto fora do limite no padrão", rO.ok && rO.teto === QUOTA.tetoPadrao);
  t("e o registo recebido não é mutado", JSON.stringify(obj) === congelado);
  /* determinismo */
  const d1 = await L.autorizar({ chave: e.chave, segredoDoServidor: SEGREDO, armazem: comLicenca(e, memoria()), agora: AGORA });
  const d2 = await L.autorizar({ chave: e.chave, segredoDoServidor: SEGREDO, armazem: comLicenca(e, memoria()), agora: AGORA });
  t("o mesmo armazém e o mesmo instante dão a mesma resposta", JSON.stringify(d1) === JSON.stringify(d2));
}

sec("6. A JANELA");
{
  const j = L.janelaDe(AGORA, 3600);
  t("o índice é floor(agora / janela)", j.indice === Math.floor(AGORA / 3600000));
  t("e reabre na fronteira", AGORA + j.reabreEm === (j.indice + 1) * 3600000);
  t("na fronteira exata, a janela inteira", L.janelaDe(3600000 * 5, 3600).reabreEm === 3600000);
}

sec("7. O ARMAZÉM DO UPSTASH");
{
  const vistos = [];
  const buscar = async (url, op) => {
    vistos.push({ url, op, corpo: JSON.parse(op.body) });
    return { ok: true, status: 200, json: async () => (url.endsWith("/pipeline") ? [{ result: 7 }, { result: 1 }] : { result: "registo" }) };
  };
  const a = L.armazemDoUpstash({ url: "https://redis.exemplo/", token: "tk", buscar });
  t("ler faz GET", (await a.ler("licenca:casa")) === "registo" && JSON.stringify(vistos[0].corpo) === JSON.stringify(["GET", "licenca:casa"]));
  t("na raiz, sem barra dobrada", vistos[0].url === "https://redis.exemplo");
  t("com o token no cabeçalho", vistos[0].op.headers.authorization === "Bearer tk");
  t("somar é INCR + EXPIRE no pipeline", (await a.somar("quota:x", 99)) === 7 && vistos[1].url === "https://redis.exemplo/pipeline" && JSON.stringify(vistos[1].corpo) === JSON.stringify([["INCR", "quota:x"], ["EXPIRE", "quota:x", 99]]));
  const mau = L.armazemDoUpstash({ url: "https://r", token: "t", buscar: async () => ({ ok: false, status: 500 }) });
  t("resposta ruim lança", await mau.ler("k").then(() => false, () => true));
  t("sem credenciais lança", await L.armazemDoUpstash({}).ler("k").then(() => false, () => true));
  t("chamado sem nada não estoura ao nascer", !lanca(() => L.armazemDoUpstash()));
}

sec("8. A ROTA — api/turno.js");
{
  const { default: turno } = await import("../api/turno.js");
  const guardado = { ...process.env };
  const LIMPAR = ["VERCEL_URL", "ORIGENS_EXTRA", "KV_REST_API_URL", "KV_REST_API_TOKEN", "UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN", "LICENCA_SEGREDO"];
  /* o fetch espiado: responde como o Upstash para o Redis falso, e anota
     tudo — um provedor chamado seria um host fora do Redis */
  const fetchOriginal = globalThis.fetch;
  const chamados = [];
  const redisFalso = memoria();
  globalThis.fetch = async (url, op) => {
    chamados.push(String(url));
    if (!String(url).startsWith("https://redis.falso")) return { ok: false, status: 599, json: async () => ({}), text: async () => "" };
    const corpo = JSON.parse(op.body);
    if (String(url).endsWith("/pipeline")) {
      const out = [];
      for (const [cmd, k, v] of corpo) out.push({ result: cmd === "INCR" ? await redisFalso.somar(k, 0) : cmd === "EXPIRE" ? (redisFalso.validade.set(k, v), 1) : null });
      return { ok: true, status: 200, json: async () => out };
    }
    return { ok: true, status: 200, json: async () => ({ result: await redisFalso.ler(corpo[1]) }) };
  };
  const rodar = async (vars, req) => {
    for (const k of LIMPAR) delete process.env[k];
    Object.assign(process.env, vars);
    const res = { codigo: 0, corpo: null, cab: {}, status(c) { this.codigo = c; return this; }, json(b) { this.corpo = b; return this; }, setHeader(k, v) { this.cab[k.toLowerCase()] = v; } };
    try { await turno({ method: "POST", headers: {}, body: {}, ...req }, res); } finally {
      for (const k of Object.keys(process.env)) if (!(k in guardado)) delete process.env[k];
      Object.assign(process.env, guardado);
    }
    return res;
  };
  const REDIS = { KV_REST_API_URL: "https://redis.falso", KV_REST_API_TOKEN: "tk" };
  const e = L.emitirChave({ licenciante: "casa", teto: 2, janela: 3600 }, SEGREDO, { aleatorio: sorteFixa(3) });
  redisFalso.m.set(e.onde, JSON.stringify(e.registo));
  const comChave = { authorization: `Bearer ${e.chave}` };
  const corpoBom = { estado: { versao: 2, mundo: {} }, frase: "Abro a porta." };

  t("GET: 405", (await rodar({}, { method: "GET" })).codigo === 405);
  const semOrigem = await rodar({ VERCEL_URL: "taverna.vercel.app" }, { body: corpoBom });
  t("sem chave e sem origem, com domínio: o portão barra (403)", semOrigem.codigo === 403 && semOrigem.corpo.motivo === "sem origem");
  const jogo = await rodar({}, { headers: { origin: "http://localhost:5173" }, body: corpoBom });
  /* 29/10, trilha B: a rota deixou de responder 501 ("turno-por-montar") —
     ela agora MONTA o pedido em ensaio (teste-turno-no-servidor.mjs prova o
     pedido byte a byte). O corpo daqui é um save sem herói, e a montagem
     estoura nele como estouraria no App: 422. O que esta suíte guarda é a
     PORTA — o portão deixou passar e a rota chegou ao motor —, e isso o 422
     prova tão bem quanto o 501 provava. */
  t("sem chave, o jogo passa pelo portão e chega à montagem (422 neste save sem herói)", jogo.codigo === 422 && jogo.corpo.motivo === "montagem-estourou" && !jogo.corpo.licenca);
  const semVar = await rodar(REDIS, { headers: comChave, body: corpoBom });
  t("com chave e sem LICENCA_SEGREDO: 503 com o nome", semVar.codigo === 503 && /LICENCA_SEGREDO/.test(semVar.corpo.erro));
  const semKV = await rodar({ LICENCA_SEGREDO: SEGREDO }, { headers: comChave, body: corpoBom });
  t("com chave e sem o Redis: 503 com os nomes", semKV.codigo === 503 && /KV_REST_API_URL/.test(semKV.corpo.erro) && /KV_REST_API_TOKEN/.test(semKV.corpo.erro));
  const ruim = await rodar({ ...REDIS, LICENCA_SEGREDO: SEGREDO }, { headers: { authorization: "Bearer tav1.casa.errada" }, body: corpoBom });
  t("chave malformada: 401", ruim.codigo === 401);
  const com = await rodar({ ...REDIS, LICENCA_SEGREDO: SEGREDO }, { headers: comChave, body: corpoBom });
  /* o mesmo motivo da asserção do jogo acima: era 501, é a montagem (422 neste save) */
  t("chave boa: chega à montagem, e a conta da licença vem junto", com.codigo === 422 && com.corpo.licenca && com.corpo.licenca.usos === 1 && com.corpo.licenca.teto === 2);
  t("a recusa não leva ok nem status no corpo", !("ok" in ruim.corpo) && !("status" in ruim.corpo));
  const semEstado = await rodar({ ...REDIS, LICENCA_SEGREDO: SEGREDO }, { headers: comChave, body: { frase: "x" } });
  t("sem estado: 400", semEstado.codigo === 400);
  const esgotou = await rodar({ ...REDIS, LICENCA_SEGREDO: SEGREDO }, { headers: comChave, body: corpoBom });
  t("a quota de 2 esgota na 3.ª: 429 com retry-after", esgotou.codigo === 429 && Number(esgotou.cab["retry-after"]) > 0);
  t("frase vazia: 400", (await rodar({}, { headers: { origin: "http://localhost:5173" }, body: { estado: {}, frase: "  " } })).codigo === 400);
  t("estado em lista: 400", (await rodar({}, { headers: { origin: "http://localhost:5173" }, body: { estado: [], frase: "x" } })).codigo === 400);
  t("frase longa demais: 413", (await rodar({}, { headers: { origin: "http://localhost:5173" }, body: { estado: {}, frase: "a".repeat(5000) } })).codigo === 413);
  t("corpo null: 400, sem estourar", (await rodar({}, { headers: { origin: "http://localhost:5173" }, body: null })).codigo === 400);
  /* A REGRA DE OURO DO ESQUELETO: nenhum provedor foi chamado */
  t(`NENHUM PROVEDOR FOI CHAMADO (${chamados.length} idas, todas ao Redis falso)`, chamados.length > 0 && chamados.every((u) => u.startsWith("https://redis.falso")));
  const src = (await import("node:fs")).readFileSync(new URL("../api/turno.js", import.meta.url), "utf8");
  t("e a rota nem conhece os provedores", !/googleapis|deepseek|openrouter|GEMINI_API_KEY|DEEPSEEK_API_KEY|OPENROUTER_API_KEY/i.test(src));
  globalThis.fetch = fetchOriginal;
}

console.log(`\nlicença: ${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
