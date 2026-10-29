/* O TURNO NO SERVIDOR, EM ENSAIO (29/10, Fase 4 do plano do motor, trilha B)
   — api/turno.js e src/turno-no-servidor.js

   O que esta suíte prova:
   §1 as portas que o servidor dá são só as da tabela (nenhuma de tela, de
      disco ou de rede), as bocas estão caladas, e a semente do turno é a
      conta que o App faz no envio;
   §2 A PROVA: a rota, com o corpo passado por JSON como a Vercel o passa,
      sobre os estados das sessões gravadas (s8, s9, s10 e a do navegador),
      dá o MESMO pedido — o hash SHA-256 do JSON, byte a byte — que a cadeia
      das peças corrida em Node pelo caminho do App (`semearACasa` e
      nenhuma sorte explícita); o eco de cada turno é o que a cadeia do
      turno anterior deixou, e o eco serve (muda o pedido);
   §3 o determinismo: o mesmo corpo dá o mesmo hash, outra frase outro; o
      estado que entra não muda;
   §4 o lixo e os estouros: o eco em lista é 400, o eco gordo é 413, o
      estado cru da sessão sintética (os nulos que o load nunca deixa)
      estoura igual nos dois lados e a rota diz 422 sem a pilha;
   §5 o segredo não sai: a resposta não leva o prompt nem a frase;
   §6 com chave: o licenciante ouve o ensaio com a conta da licença;
   §7 NENHUMA CHAMADA DE REDE: o `fetch` espiado do começo ao fim, e nenhum
      `window`, `document` ou `localStorage` tocado;
   §8 o tamanho da função (o bundle do esbuild, para a Vercel) e o tempo
      de montagem — os números vão para o diário.

   Os estados das sessões s8–s10 são de um herói jogado em Node: o save
   guarda `null` onde o load do App põe o valor de partida, e a ficha não
   tem atributos nem conceito (um herói do jogo sempre os tem). Como em
   pauta-bloco.mjs e pedido-bloco.mjs, o nulo fica de fora e a ficha ganha
   os dois — NOS DOIS LADOS, igual: a prova é a igualdade, não o caso. */
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

let bons = 0, maus = 0;
const t = (n, c) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n); } };
const sec = (s) => console.log("\n" + s);
const aqui = (p) => new URL(p, import.meta.url);

/* o que o navegador tem e o servidor não: quem tocar, fica anotado */
const tocados = new Set();
for (const g of ["window", "document", "localStorage", "sessionStorage"]) {
  Object.defineProperty(globalThis, g, { configurable: true, get() { tocados.add(g); return undefined; } });
}
/* o fetch espiado, antes de qualquer import: responde como o Upstash para o
   Redis falso, e anota tudo — um provedor chamado seria um host fora dele */
const chamados = [];
const redis = new Map();
const fetchOriginal = globalThis.fetch;
globalThis.fetch = async (url, op) => {
  chamados.push(String(url));
  if (!String(url).startsWith("https://redis.falso")) return { ok: false, status: 599, json: async () => ({}), text: async () => "" };
  const corpo = JSON.parse(op.body);
  if (String(url).endsWith("/pipeline")) {
    const out = [];
    for (const [cmd, k] of corpo) {
      if (cmd === "INCR") { const n = (Number(redis.get(k)) || 0) + 1; redis.set(k, String(n)); out.push({ result: n }); } else out.push({ result: 1 });
    }
    return { ok: true, status: 200, json: async () => out };
  }
  return { ok: true, status: 200, json: async () => ({ result: redis.has(corpo[1]) ? redis.get(corpo[1]) : null }) };
};

const t0 = performance.now();
const { default: turno } = await import("../api/turno.js");
const importMs = performance.now() - t0;
const S = await import("../src/turno-no-servidor.js");
const { TURNO_NO_SERVIDOR, PORTAS_DO_SERVIDOR, aCasaDoTurno, oPedidoNoServidor } = S;
const { oEstadoDoServidor, aRespostaDoServidor } = await import("../src/motor/eco-do-turno.js");
const { oPreludioDoTurno } = await import("../src/motor/preludio-do-turno.js");
const { oPedidoDoTurno, oEstadoDoPedido, REFS_DO_PEDIDO, RENDER_DO_PEDIDO } = await import("../src/motor/pedido-do-turno.js");
const { REFS_DA_PAUTA } = await import("../src/motor/pauta-do-turno.js");
const { pontoDaSorte } = await import("../src/motor/sorte-do-turno.js");
const { semearACasa } = await import("../src/semente.js");
const { BOCAS_POR_TURNO } = await import("../src/falas.js");
const { estadoNoTurno } = await import("../src/sessao.js");
const L = await import("../src/licenca.js");

const sha = (x) => createHash("sha256").update(JSON.stringify(x)).digest("hex");
const ORIGEM = { origin: "http://localhost:5173" };
const LIMPAR = ["VERCEL_URL", "ORIGENS_EXTRA", "KV_REST_API_URL", "KV_REST_API_TOKEN", "UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN", "LICENCA_SEGREDO"];
const guardado = { ...process.env };
/* a rota como a Vercel a chama: o corpo passa por JSON (o que não viaja
   num JSON não chega ao servidor) */
const rodar = async (corpo, { headers = ORIGEM, vars = {} } = {}) => {
  for (const k of LIMPAR) delete process.env[k];
  Object.assign(process.env, vars);
  const res = { codigo: 0, corpo: null, cab: {}, status(c) { this.codigo = c; return this; }, json(b) { this.corpo = b; return this; }, setHeader(k, v) { this.cab[k.toLowerCase()] = v; } };
  try { await turno({ method: "POST", headers, body: corpo === undefined ? undefined : JSON.parse(JSON.stringify(corpo)) }, res); } finally {
    for (const k of Object.keys(process.env)) if (!(k in guardado)) delete process.env[k];
    Object.assign(process.env, guardado);
  }
  return res;
};

/* O CAMINHO DO APP, escrito daqui: a semente como `enviar` a faz
   (`${sementeMundo()}|${pontoDaSorte()}`, App: o semear do envio), a
   reserva da casa semeada e NENHUMA sorte explícita nas peças; o que o
   turno adia corre depois do pedido. E o estado do pedido como o App de
   HEAD o monta (1409f0b): `oEstadoDoPedido` sobre os refs `{ current }`
   das duas tabelas, pelo nome do ref, com o que o prelúdio deixou neles, e
   o render com os seis do React de antes do turno (o `enviar` é do último
   render). Até 1409f0b este caminho passava o espalhar cru ao pedido; com
   o App mudado, o caminho muda com ele (a medida deu 0 de 146 pedidos
   diferentes entre os dois). */
const refsComoNoApp = (valores) => Object.fromEntries([REFS_DA_PAUTA, REFS_DO_PEDIDO].flatMap((tab) => Object.entries(tab).map(([c, r]) => [r.ref, { current: valores[c] }])));
const renderComoNoApp = (antes) => Object.fromEntries(RENDER_DO_PEDIDO.filter((n) => antes[n] !== undefined).map((n) => [n, antes[n]]));
const casaDoApp = (e) => `${e.nomeCampanha || "aventura"}|${(e.mundo && e.mundo.genero) || ""}|${pontoDaSorte({ dia: e.dia, minuto: e.minuto, falas: (e.mensagens || []).length })}`;
async function peloCaminhoDoApp({ estado, frase, eco, bilhetes }) {
  const e0 = oEstadoDoServidor(estado, { eco, bilhetes });
  const adiados = [];
  const portas = { adiar: (g) => adiados.push(g) };
  semearACasa(casaDoApp(e0));
  const r1 = await oPreludioDoTurno(e0, { frase }, portas);
  const r2 = oPedidoDoTurno(oEstadoDoPedido(refsComoNoApp({ ...e0, ...r1.escritas }), renderComoNoApp(e0)), r1.entradaDoPedido, portas);
  for (const g of adiados) { try { g(); } catch { /* como o setTimeout do App */ } }
  return { pedido: r2.pedido, fim: { ...e0, ...r1.escritas, ...r2.escritas } };
}

/* os estados das sessões gravadas, como o load os abre */
const FICHA = { atributos: { forca: 2, destreza: 1, constituicao: 2, inteligencia: 0, sabedoria: 1, carisma: 0 }, conceito: "Andarilha sem nome" };
const comoOLoadAbre = (e) => {
  const x = Object.fromEntries(Object.entries(e).filter(([, v]) => v != null));
  const p = x.personagem || {};
  x.personagem = { ...p, atributos: p.atributos || FICHA.atributos, conceito: p.conceito || FICHA.conceito };
  return x;
};
const SESSOES = ["s8", "s9", "s10", "navegador"].map((s) => ({ s, A: JSON.parse(readFileSync(aqui(`sessao-${s}.json`), "utf8")) }));
const ROTA = (() => { const m = /fraseMax:\s*(\d+)/.exec(readFileSync(aqui("../api/turno.js"), "utf8")); return { fraseMax: Number(m && m[1]) }; })();

sec("1. AS PORTAS E A SEMENTE");
{
  t("o servidor dá três portas, e são as da tabela", JSON.stringify(Object.keys(PORTAS_DO_SERVIDOR)) === JSON.stringify(["calou", "adiar", "agora"]));
  const fonte = readFileSync(aqui("../src/turno-no-servidor.js"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  const dadas = (/const portas = \{([\s\S]*?)\n  \};/.exec(fonte) || [])[1] || "";
  const nomes = [...dadas.matchAll(/^\s*(\w+):/gm)].map((m) => m[1]);
  t(`e a montagem passa exatamente essas (${nomes.join(", ")})`, JSON.stringify(nomes) === JSON.stringify(Object.keys(PORTAS_DO_SERVIDOR)));
  t("nenhuma porta de rede, de disco ou de tela no módulo", !/chamarModelo|salvar\s*:|pushMsgs|\bset[A-Z]\w*\s*:/.test(fonte));
  t("as bocas estão caladas (BOCAS_POR_TURNO = 0)", BOCAS_POR_TURNO === 0);
  t("a tabela tem os números dentro dos limites", TURNO_NO_SERVIDOR.caladosMax > 0 && Number.isInteger(TURNO_NO_SERVIDOR.caladosMax) && TURNO_NO_SERVIDOR.semNome === "aventura");
  const app = readFileSync(aqui("../src/App.jsx"), "utf8");
  t("a semente é a do envio do App (`${sementeMundo()}|${pontoDaSorte()}`)", app.includes("const casa = `${sementeMundo()}|${pontoDaSorte()}`; if (turnoDaSessao) turnoDaSessao.casa = casa; semearACasa(casa);"));
  t("e o sementeMundo do App tem o nome que falta à campanha", app.includes("const sementeMundo = () => `${nomeCampanhaRef.current || nomeCampanha || \"aventura\"}|${(mundoAtual() && mundoAtual().genero) || \"\"}`;"));
  t("aCasaDoTurno(null) não estoura e é a semente vazia", aCasaDoTurno(null) === "aventura||0|0|0" && aCasaDoTurno({}) === aCasaDoTurno(undefined));
  const e = { nomeCampanha: "Vau", mundo: { genero: "Fantasia" }, dia: 3, minuto: 615, mensagens: [1, 2, 3, 4] };
  t("aCasaDoTurno lê o nome, o gênero, o dia, o minuto e as falas", aCasaDoTurno(e) === "Vau|Fantasia|3|615|4" && aCasaDoTurno(e) === casaDoApp(e));
}

sec("2. A ROTA CONTRA O MOTOR EM NODE — o pedido byte a byte");
const tempos = [];
const tamanhos = [];
let casoGordo = null;
{
  let casos = 0, iguais = 0, tamIguais = 0, ok200 = 0, comEco = 0, ecoMudou = 0, ecoVisto = 0, foraDoTeto = 0, semFrase = 0;
  const difs = [];
  for (const { s, A } of SESSOES) {
    let ecoDaVespera = null;
    for (let i = 0; i < A.turnos.length; i++) {
      const ent = A.turnos[i].entrada || {};
      const frase = typeof ent.frase === "string" && ent.frase.trim() ? ent.frase : ent.toque && typeof ent.toque.conteudo === "string" ? ent.toque.conteudo : "";
      if (!frase.trim()) { semFrase++; continue; }
      if (frase.length > ROTA.fraseMax) { foraDoTeto++; continue; }
      const estado = comoOLoadAbre(estadoNoTurno(A, i));
      const corpo = { estado, frase, ...(ecoDaVespera ? { eco: ecoDaVespera } : {}) };
      casos++;
      const ref = await peloCaminhoDoApp(corpo);
      const r = await rodar(corpo);
      if (r.codigo === 200 && r.corpo && r.corpo.ensaio === true) ok200++;
      const h = sha(ref.pedido);
      if (r.corpo && r.corpo.pedido && r.corpo.pedido.hash === h) iguais++; else if (difs.length < 3) difs.push(`${s}#${i}: ${r.codigo} ${r.corpo && r.corpo.pedido ? r.corpo.pedido.hash.slice(0, 12) : JSON.stringify(r.corpo).slice(0, 80)} ≠ ${h.slice(0, 12)}`);
      if (r.corpo && r.corpo.pedido && r.corpo.pedido.tamanho === JSON.stringify(ref.pedido).length) tamIguais++;
      if (r.corpo && typeof r.corpo.montagemMs === "number") tempos.push(r.corpo.montagemMs);
      tamanhos.push(JSON.stringify(ref.pedido).length);
      if (!casoGordo || JSON.stringify(estado).length > JSON.stringify(casoGordo.estado).length) casoGordo = corpo;
      if (ecoDaVespera) {
        comEco++;
        const semEco = await peloCaminhoDoApp({ estado, frase });
        if (sha(semEco.pedido) !== h) ecoMudou++;
      }
      const { eco } = aRespostaDoServidor(ref.fim);
      ecoDaVespera = eco && Object.keys(eco).length ? eco : null;
      if (ecoDaVespera) ecoVisto++;
    }
  }
  console.log(`      (${casos} turnos com frase; ${semFrase} sem frase nem toque; ${foraDoTeto} toques acima do teto da frase)`);
  t(`a rota responde 200 em ensaio em todos (${ok200}/${casos})`, casos > 0 && ok200 === casos);
  t(`o hash do pedido montado no servidor é o do motor em Node em todos (${iguais}/${casos})${difs.length ? " — " + difs.join(" · ") : ""}`, casos >= 140 && iguais === casos);
  t(`e o tamanho também (${tamIguais}/${casos})`, tamIguais === casos);
  t(`o eco do turno anterior viaja em ${comEco} turnos (o turno deixa eco em ${ecoVisto})`, comEco > 0);
  t(`e o eco serve: sem ele o pedido muda em ${ecoMudou} de ${comEco}`, ecoMudou > 0);
}

sec("3. O DETERMINISMO E A IMUTABILIDADE");
{
  const corpo = casoGordo;
  const a = await rodar(corpo), b = await rodar(corpo);
  t("o mesmo corpo, duas vezes: o mesmo hash", a.codigo === 200 && a.corpo.pedido.hash === b.corpo.pedido.hash);
  const c = await rodar({ ...corpo, frase: corpo.frase + " E olho para trás." });
  t("outra frase: outro hash", c.codigo === 200 && c.corpo.pedido.hash !== a.corpo.pedido.hash);
  const antes = JSON.stringify(corpo);
  const m = await oPedidoNoServidor(corpo);
  t("o corpo que entra não muda", JSON.stringify(corpo) === antes);
  t("o módulo dá o mesmo pedido que a rota mede", sha(m.pedido) === a.corpo.pedido.hash && m.casa === aCasaDoTurno(oEstadoDoServidor(corpo.estado, corpo)));
  const outra = await oPedidoNoServidor({ ...corpo, estado: { ...corpo.estado, dia: (corpo.estado.dia || 0) + 1 } });
  t("o estado do fim traz o que o turno escreveu (o eco sai dele)", m.estadoDoFim && typeof aRespostaDoServidor(m.estadoDoFim).eco === "object");
  t("outro dia, outra semente", outra.casa !== m.casa);
}

sec("4. O LIXO E OS ESTOUROS");
{
  const bom = casoGordo;
  t("eco em lista: 400", (await rodar({ ...bom, eco: [1, 2] })).codigo === 400);
  t("bilhetes em texto: 400", (await rodar({ ...bom, bilhetes: "x" })).codigo === 400);
  t("eco null passa (é o mesmo que sem eco)", (await rodar({ ...bom, eco: null })).corpo.pedido.hash === sha((await peloCaminhoDoApp({ estado: bom.estado, frase: bom.frase })).pedido));
  t("eco gordo: 413", (await rodar({ ...bom, eco: { quemE: "x".repeat(200 * 1024) } })).codigo === 413);
  const { s, A } = SESSOES[0];
  const cru = estadoNoTurno(A, 1);
  let refEstourou = false;
  try { await peloCaminhoDoApp({ estado: cru, frase: "Abro a porta." }); } catch { refEstourou = true; }
  const r = await rodar({ estado: cru, frase: "Abro a porta." });
  t(`o estado cru de ${s} (com os nulos) estoura no motor em Node e a rota diz 422`, refEstourou && r.codigo === 422 && r.corpo.motivo === "montagem-estourou");
  t("e o 422 não leva a pilha nem a mensagem do motor", Object.keys(r.corpo).sort().join(",") === "erro,motivo" && !/Cannot|undefined|null/.test(r.corpo.erro));
  const vazio = await rodar({ estado: {}, frase: "Olho em volta." });
  t(`o estado vazio não derruba a rota (${vazio.codigo})`, vazio.codigo === 200 || vazio.codigo === 422);
}

sec("5. O SEGREDO NÃO SAI");
{
  const r = await rodar(casoGordo);
  const ref = await peloCaminhoDoApp(casoGordo);
  const texto = JSON.stringify(r.corpo);
  const sys = String(ref.pedido.system || "");
  const amostras = [0.1, 0.4, 0.7].map((f) => sys.slice(Math.floor(sys.length * f), Math.floor(sys.length * f) + 60));
  t(`a resposta é pequena (${texto.length} caracteres para um pedido de ${r.corpo.pedido.tamanho})`, texto.length < 1000);
  t("e não leva nenhum pedaço do system", amostras.every((a) => a.length === 60 && !texto.includes(a)));
  t("nem a frase do jogador", !texto.includes(casoGordo.frase.slice(0, 40)));
  t("as chaves do ensaio são as medidas e os parâmetros da chamada", Object.keys(r.corpo.pedido).sort().join(",") === "comCache,formato,hash,maxTokens,mensagens,system,tamanho,tarefa");
}

sec("6. COM CHAVE — o licenciante");
{
  const SEGREDO = "s".repeat(L.LICENCA.minimoDoSegredoDoServidor) + "-do-servidor";
  const e = L.emitirChave({ licenciante: "casa-de-ensaio", teto: 5, janela: 3600 }, SEGREDO, { aleatorio: () => Buffer.alloc(L.LICENCA.bytesDoSegredo, 7) });
  redis.set(e.onde, JSON.stringify(e.registo));
  const vars = { KV_REST_API_URL: "https://redis.falso", KV_REST_API_TOKEN: "tk", LICENCA_SEGREDO: SEGREDO };
  const r = await rodar(casoGordo, { headers: { authorization: `Bearer ${e.chave}` }, vars });
  const ref = await peloCaminhoDoApp(casoGordo);
  t("com chave boa: 200 em ensaio, o mesmo hash", r.codigo === 200 && r.corpo.ensaio === true && r.corpo.pedido.hash === sha(ref.pedido));
  t("e a conta da licença vem junto", r.corpo.licenca && r.corpo.licenca.licenciante === "casa-de-ensaio" && r.corpo.licenca.usos === 1 && r.corpo.licenca.restam === 4);
  const lixo = await rodar({ estado: estadoNoTurno(SESSOES[0].A, 1), frase: "x" }, { headers: { authorization: `Bearer ${e.chave}` }, vars });
  t("o 422 de um licenciante também leva a conta (o turno contou)", lixo.codigo === 422 && lixo.corpo.licenca && lixo.corpo.licenca.usos === 2);
}

sec("7. NENHUMA CHAMADA DE REDE, NENHUM NAVEGADOR");
{
  const fora = chamados.filter((u) => !u.startsWith("https://redis.falso"));
  t(`NENHUM PROVEDOR FOI CHAMADO (${chamados.length} idas, todas ao Redis falso)`, fora.length === 0 && chamados.length > 0);
  t(`nenhum window, document, localStorage ou sessionStorage tocado${tocados.size ? " — tocados: " + [...tocados].join(", ") : ""}`, tocados.size === 0);
  const src = readFileSync(aqui("../api/turno.js"), "utf8") + readFileSync(aqui("../src/turno-no-servidor.js"), "utf8");
  t("e a rota nem conhece os provedores", !/googleapis|deepseek|openrouter|GEMINI_API_KEY|DEEPSEEK_API_KEY|OPENROUTER_API_KEY/i.test(src));
}

sec("8. O TAMANHO DA FUNÇÃO E O TEMPO");
{
  /* o bundle de api/turno.js como um empacotador o faria (a Vercel rastreia
     os arquivos em vez de empacotar; o bundle é a medida do que ela leva) */
  let esbuild = null;
  try { esbuild = await import("esbuild"); } catch { /* sem esbuild, sem a medida */ }
  if (esbuild) {
    const r = await esbuild.build({ entryPoints: [new URL("../api/turno.js", import.meta.url).pathname.replace(/^\/(\w:)/, "$1")], bundle: true, platform: "node", format: "esm", write: false, metafile: true, logLevel: "silent" });
    const bytes = r.outputFiles[0].contents.length;
    const min = await esbuild.build({ entryPoints: [new URL("../api/turno.js", import.meta.url).pathname.replace(/^\/(\w:)/, "$1")], bundle: true, platform: "node", format: "esm", write: false, minify: true, logLevel: "silent" });
    const entradas = Object.keys(r.metafile.inputs);
    const doNavegador = entradas.filter((f) => /\.jsx$|node_modules[\\/]react|App\./.test(f));
    /* a folha de estilo vem pela reexportação de `T` em constantes.js: é
       texto puro (não importa nada, não toca o navegador — a §7 prova-o), e
       por isso é peso, não dependência; mede-se para o diário */
    const estilo = entradas.filter((f) => /estilo\.js$/.test(f)).reduce((s, f) => s + r.metafile.inputs[f].bytes, 0);
    console.log(`      bundle: ${(bytes / 1024).toFixed(0)} KB (${(min.outputFiles[0].contents.length / 1024).toFixed(0)} KB minificado), ${entradas.length} módulos; a folha de estilo pesa ${(estilo / 1024).toFixed(0)} KB dele`);
    t(`o bundle da função não arrasta React, JSX nem o App${doNavegador.length ? " — " + doNavegador.join(", ") : ""}`, doNavegador.length === 0);
    t("e cabe com folga no teto da Vercel (250 MB descomprimido)", bytes < 250 * 1024 * 1024 / 50);
  } else console.log("      (esbuild ausente: sem a medida do bundle)");
  tempos.sort((a, b) => a - b);
  const q = (f) => tempos[Math.min(tempos.length - 1, Math.floor(tempos.length * f))];
  console.log(`      montagem na rota: mediana ${q(0.5)} ms · p95 ${q(0.95)} ms · máx ${tempos[tempos.length - 1]} ms (${tempos.length} turnos) · import da rota ${importMs.toFixed(0)} ms`);
  tamanhos.sort((a, b) => a - b);
  console.log(`      o pedido: ${tamanhos[0]} a ${tamanhos[tamanhos.length - 1]} caracteres de JSON`);
  t("a montagem cabe num segundo em todos os turnos", tempos.length > 0 && tempos[tempos.length - 1] < 1000);
}

globalThis.fetch = fetchOriginal;
console.log(`\nturno no servidor: ${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
