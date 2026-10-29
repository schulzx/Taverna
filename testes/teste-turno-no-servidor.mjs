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
      de montagem — os números vão para o diário;
   §9 O DEPOIS DA RESPOSTA (29/10): sobre a resposta gravada do Narrador e a
      proposta gravada do Cronista, o servidor corre o resto do turno com a
      função do replay; o estado do fim só difere do replay inteiro nos
      campos declarados (os que a montagem escreve e o replay deixa ao App,
      os do agir do cliente, e o cânone onde a foto do Juiz é outra), e na
      sessão do jogo é o do replay e o Juiz é o gravado; o eco do turno
      inteiro, reenviado, dá o pedido seguinte que o caminho do App daria.
  §10 A PRAÇA DO JUIZ E O CRONISTA NO SERVIDOR (29/10): a foto do Juiz leva
      as bancas e o balcão refeitos do estado (`aPracaDoJuiz`) — o mercado
      do App onde o App o tinha, a praça que a pauta mostrou, e o preço
      errado numa cidade com banca vira veto com o número certo (sem a praça
      só se media); o Cronista só é chamado quando o gatilho acende, a fila
      (`leituraDoCronista`) anda no save, e mede-se em quantos turnos o
      servidor faria a 2.ª chamada de IA.

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
const { TURNO_NO_SERVIDOR, PORTAS_DO_SERVIDOR, aCasaDoTurno, oPedidoNoServidor, oTurnoNoServidor } = S;
const { oEstadoDoServidor, aRespostaDoServidor } = await import("../src/motor/eco-do-turno.js");
const { oPreludioDoTurno } = await import("../src/motor/preludio-do-turno.js");
const { oPedidoDoTurno, oEstadoDoPedido, REFS_DO_PEDIDO, RENDER_DO_PEDIDO } = await import("../src/motor/pedido-do-turno.js");
const { REFS_DA_PAUTA } = await import("../src/motor/pauta-do-turno.js");
const { pontoDaSorte } = await import("../src/motor/sorte-do-turno.js");
const { semearACasa } = await import("../src/semente.js");
const { BOCAS_POR_TURNO } = await import("../src/falas.js");
const { estadoNoTurno, correrOTurno, FORA_DA_REGUA, AINDA_DO_APP } = await import("../src/sessao.js");
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
  /* MOVIDA (29/10, o depois): a 4.ª porta é a TELA — os setters do prelúdio
     guardam o último valor em vez de desenhar (volta em tela.avulsos); entra
     na montagem pelo espalhar `...guardarATela`, feito da lista do prelúdio */
  t("o servidor dá quatro portas, e são as da tabela", JSON.stringify(Object.keys(PORTAS_DO_SERVIDOR)) === JSON.stringify(["calou", "adiar", "agora", "tela"]));
  const fonte = readFileSync(aqui("../src/turno-no-servidor.js"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  const dadas = (/const portas = \{([\s\S]*?)\n  \};/.exec(fonte) || [])[1] || "";
  const nomes = [...dadas.matchAll(/^\s*(\w+):/gm)].map((m) => m[1]);
  if (/^\s*\.\.\.guardarATela,/m.test(dadas)) nomes.push("tela");
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
/* a conta do custo, para o diário: o que a §10 mede do Cronista */
const CUSTO = {};
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

sec("9. O DEPOIS DA RESPOSTA — o resto do turno no servidor, sobre a resposta gravada");
const temposDoTurno = [];
{
  const can = (x) => JSON.stringify(x, (k, v) => (v && typeof v === "object" && !Array.isArray(v) ? Object.fromEntries(Object.keys(v).sort().map((c) => [c, v[c]])) : v));
  const naRegua = (e) => Object.fromEntries(Object.entries(e).filter(([k]) => !(k in FORA_DA_REGUA)));
  const difs = (a, b) => [...new Set([...Object.keys(a), ...Object.keys(b)])].filter((k) => can(a[k]) !== can(b[k]));
  /* OS CAMPOS DECLARADOS, e de quem é cada um: o que a montagem (o
     prelúdio e o pedido) escreve e o replay deixa ao App — AINDA_DO_APP e
     o coração, a postura e as conquistas que a pauta e o prelúdio movem —;
     o que o AGIR do cliente faz antes do envio (o relógio do mundo, o sino,
     o tempo e o sítio: o cliente manda o estado do instante do semear); e
     o cânone, que a correção do Juiz tira por um veredito que, nas sessões
     de Node, sai de outra foto (o gravador delas não é o App) */
  const DA_MONTAGEM = new Set([...AINDA_DO_APP.map((d) => d.campo), "coracao", "postura", "conquistas"]);
  const DO_AGIR = new Set(["turnosDeMundo", "abertura", "lugar", "minuto"]);
  const DO_JUIZ = new Set(["canone"]);
  /* MOVIDA (29/10, o gatilho no servidor): o servidor só chama o Cronista
     quando `oGatilhoDoCronista` acende, como o App; as sessões de Node
     gravaram um Cronista a CADA turno. Onde o gatilho não acende, o passo
     dele corre com a resposta vazia (`{}`, a do App), e o que a proposta
     gravada escrevia — a gente, o cânone, as promessas — é o preço da
     chamada poupada, declarado: só nesses turnos, e só nos campos que o
     aceito do Cronista escreve (os efeitos de oAceitoDoCronista). O cânone
     desses turnos conta aqui, não no Juiz. */
  const DO_CRONISTA = new Set(["npcs", "canone", "prometido", "relogios", "eventos", "quests", "missoes", "personagem", "lugar", "mural", "divindade"]);
  let peloGatilho = 0, poupados = 0;
  let casos = 0, soDeclarados = 0, limpos = 0, porJuiz = 0, ecoIgual = 0, ecoMudouPeloJuiz = 0, comEco = 0, telaBoa = 0, imutavel = 0;
  let navTurnos = 0, navReplay = 0, navJuiz = 0, navGravado = 0;
  const fora = new Map();
  for (const { s, A } of SESSOES) {
    let eco = null;
    for (let i = 0; i < A.turnos.length; i++) {
      const L = A.turnos[i];
      const ent = L.entrada || {};
      const frase = typeof ent.frase === "string" && ent.frase.trim() ? ent.frase : ent.toque && typeof ent.toque.conteudo === "string" ? ent.toque.conteudo : "";
      if (!frase.trim() || frase.length > ROTA.fraseMax) continue;
      const estado = comoOLoadAbre(estadoNoTurno(A, i));
      const corpo = { estado, frase, ...(eco ? { eco } : {}), resposta: L.narrador };
      const antes = JSON.stringify(corpo);
      const t0 = performance.now();
      const sv = await oTurnoNoServidor(corpo, { cronista: () => (L.cronista ? L.cronista.proposta : null) });
      temposDoTurno.push(performance.now() - t0);
      casos++;
      if (JSON.stringify(corpo) === antes) imutavel++;
      /* o eco do turno inteiro, reenviado: o pedido do turno seguinte é o do
         caminho do App com o mesmo eco (a rota e o motor em Node) */
      if (eco) {
        comEco++;
        const ref = await peloCaminhoDoApp({ estado, frase, eco });
        const r = await rodar({ estado, frase, eco });
        if (r.corpo && r.corpo.pedido && r.corpo.pedido.hash === sha(ref.pedido)) ecoIgual++;
      }
      const pre = aRespostaDoServidor((await oPedidoNoServidor({ estado, frase, ...(eco ? { eco } : {}) })).estadoDoFim).eco;
      if (can(pre.vetosDoJuiz) !== can(sv.eco.vetosDoJuiz)) ecoMudouPeloJuiz++;
      eco = Object.keys(sv.eco).length ? sv.eco : null;
      /* contra o replay inteiro (o mesmo estado de partida, a linha gravada) */
      const rc = correrOTurno(estado, L, { semente: A.semente, mundo: A.mundo || null });
      const d = difs(naRegua(sv.estadoDoFim), naRegua(rc.estado));
      const poupado = !sv.cronista.corre;
      if (poupado) poupados++;
      const resto = d.filter((k) => !DA_MONTAGEM.has(k) && !DO_AGIR.has(k) && !DO_JUIZ.has(k) && !(poupado && DO_CRONISTA.has(k)));
      if (!resto.length) soDeclarados++; else for (const k of resto) fora.set(k, (fora.get(k) || 0) + 1);
      if (poupado && d.some((k) => DO_CRONISTA.has(k))) peloGatilho++;
      else if (d.some((k) => DO_JUIZ.has(k))) porJuiz++;
      if (!d.length) limpos++;
      const tl = sv.tela || {};
      if (typeof tl.narrativa === "string" && Array.isArray(tl.linhas) && Array.isArray(tl.campos) && tl.campos.every((k) => k in sv.estadoDoFim) && tl.avulsos && typeof tl.avulsos === "object") telaBoa++;
      /* A SESSÃO DO JOGO (gravada no navegador): o Juiz é o gravado, e o
         estado do fim é o do replay e o do jogo fora do que a montagem paga */
      if (s === "navegador") {
        navTurnos++;
        if (L.juiz && can(sv.juiz) === can(L.juiz.resumo)) navJuiz++;
        if (d.every((k) => DA_MONTAGEM.has(k) || DO_AGIR.has(k))) navReplay++;
        const g = difs(naRegua(sv.estadoDoFim), naRegua(estadoNoTurno(A, i + 1)));
        if (g.every((k) => DA_MONTAGEM.has(k) || DO_AGIR.has(k) || k === "personagem")) navGravado++;
      }
    }
  }
  console.log(`      (${casos} turnos; fora do declarado: ${[...fora].map(([k, v]) => k + ":" + v).join(" ") || "nenhum"}; o cânone pelo Juiz em ${porJuiz})`);
  t(`o estado do fim só difere do replay nos campos declarados em todos (${soDeclarados}/${casos})`, casos >= 140 && soDeclarados === casos);
  t(`e o cânone que a foto do Juiz muda é exceção (${porJuiz} de ${casos})`, porJuiz <= 3);
  t(`e o Cronista poupado pelo gatilho só muda os campos dele, em ${peloGatilho} dos ${poupados} turnos sem chamada`, peloGatilho <= poupados && poupados > 0);
  t(`na sessão do jogo, o Juiz do servidor é o gravado (${navJuiz}/${navTurnos})`, navTurnos === 3 && navJuiz === navTurnos);
  t(`e o estado do fim é o do replay fora da montagem e do agir (${navReplay}/${navTurnos}), e o do jogo (${navGravado}/${navTurnos}; a ficha leva os atributos que o load lhe põe)`, navReplay === navTurnos && navGravado === navTurnos);
  t(`o eco do turno inteiro, reenviado, dá o pedido do caminho do App (${ecoIgual}/${comEco})`, comEco > 100 && ecoIgual === comEco);
  t(`e o Juiz deste turno muda o eco (os vetos) em ${ecoMudouPeloJuiz} de ${casos}`, ecoMudouPeloJuiz > 0);
  t(`a tela tem a forma mínima em todos (${telaBoa}/${casos}): a narração, as linhas, os campos do save, os avulsos`, telaBoa === casos);
  t(`o corpo que entra não muda (${imutavel}/${casos})`, imutavel === casos);
  /* a rota em ensaio, com a resposta: o eco, os soltos, a tela, a impressão do estado */
  const { A } = SESSOES.find((x) => x.s === "navegador");
  const L = A.turnos[1];
  const corpo = { estado: comoOLoadAbre(estadoNoTurno(A, 1)), frase: L.entrada.frase, resposta: L.narrador, cronista: L.cronista && L.cronista.proposta };
  const r = await rodar(corpo);
  const sv = await oTurnoNoServidor(corpo, { cronista: () => corpo.cronista });
  t("a rota com `resposta` devolve o eco, os soltos, a tela e o estado em hash", r.codigo === 200 && r.corpo.ensaio === true && can(r.corpo.eco) === can(sv.eco) && can(r.corpo.soltos) === can(sv.soltos) && can(r.corpo.tela) === can(sv.tela) && r.corpo.estado.hash === createHash("sha256").update(JSON.stringify(sv.estadoDoFim)).digest("hex"));
  t("e o pedido é o mesmo de sem resposta", r.corpo.pedido.hash === (await rodar({ estado: corpo.estado, frase: corpo.frase })).corpo.pedido.hash);
  t("resposta sem narrativa: 400; cronista em lista: 400", (await rodar({ ...corpo, resposta: { mudancas: {} } })).codigo === 400 && (await rodar({ ...corpo, cronista: [1] })).codigo === 400);
  temposDoTurno.sort((a, b) => a - b);
  console.log(`      o turno inteiro no servidor: mediana ${temposDoTurno[temposDoTurno.length >> 1].toFixed(1)} ms · p95 ${temposDoTurno[Math.floor(temposDoTurno.length * 0.95)].toFixed(1)} ms · máx ${temposDoTurno[temposDoTurno.length - 1].toFixed(1)} ms`);
  t("o turno inteiro cabe num segundo", temposDoTurno[temposDoTurno.length - 1] < 1000);
}

sec("10. A PRAÇA DO JUIZ E O CRONISTA NO SERVIDOR");
{
  const { aPracaDoJuiz } = S;
  const { julgarAProsa, oQueAPautaSabe } = await import("../src/juiz-de-fidelidade.js");
  const { vetosDoVeredito } = await import("../src/motor/correcao-do-juiz.js");
  const { CAMPOS } = await import("../src/estado.js");
  const { CAMPOS_DO_SERVIDOR } = await import("../src/motor/eco-do-turno.js");
  const { REDE_DO_CRONISTA } = await import("../src/gatilho-do-cronista.js");
  const { nomeDaMoeda } = await import("../src/lexico.js");
  const can = (x) => JSON.stringify(x);
  const sem = (x) => String(x || "").normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
  /* (a) A SESSÃO DO JOGO: onde o App tinha a banca, o mercado da entrada do
     Juiz é o do App, item a item; no toque de abertura o App não o tinha (o
     render era o de antes da cidade) e o servidor tem a praça que a pauta viu */
  {
    const { A } = SESSOES.find((x) => x.s === "navegador");
    let eco = null, comBanca = 0, igual = 0, abertura = "";
    for (let i = 0; i < A.turnos.length; i++) {
      const L = A.turnos[i];
      const frase = L.entrada.frase || (L.entrada.toque && L.entrada.toque.conteudo) || "";
      const sv = await oTurnoNoServidor({ estado: comoOLoadAbre(estadoNoTurno(A, i)), frase, ...(eco ? { eco } : {}), resposta: L.narrador }, { cronista: () => L.cronista.proposta });
      eco = Object.keys(sv.eco).length ? sv.eco : null;
      const g = L.juiz && L.juiz.entrada;
      if (!g || !sv.entradaDoJuiz) continue;
      if (g.mercado.length) { comBanca++; if (can(sv.entradaDoJuiz.mercado) === can(g.mercado)) igual++; }
      else abertura = `turno ${i}: o App 0, o servidor ${sv.entradaDoJuiz.mercado.length}`;
    }
    console.log(`      (sem banca no App: ${abertura || "nenhum"})`);
    t(`na sessão do jogo, o mercado do Juiz é o do App onde o App tinha a banca (${igual}/${comBanca}, 29 itens cada)`, comBanca === 2 && igual === comBanca);
  }
  /* (b) OS 146 TURNOS: a praça do instante e a do render dão o mesmo mercado
     (a cidade, o dia, o mapa e a lei de antes do turno, como o App os lê no
     desenho); e o que a pauta do turno pôs a preço (◉) e a praça também
     vende tem lá o MESMO preço — a praça é a que a pauta mostrou ao
     Narrador. (A pauta põe a preço também a rua — a caneca, o prato quente,
     de precosDaRua —, que não é banca nem balcão: esses não se cruzam.) */
  let comPraca = 0, instanteRender = 0, pautaComPreco = 0, pautaNaPraca = 0, precoAntes = 0, precoDepois = 0, vetoDepois = 0, nomeAntes = 0, nomeDepois = 0, casos = 0;
  const foraDaPraca = [];
  for (const { s, A } of SESSOES) {
    let eco = null;
    for (let i = 0; i < A.turnos.length; i++) {
      const L = A.turnos[i], ent = L.entrada || {};
      const frase = typeof ent.frase === "string" && ent.frase.trim() ? ent.frase : ent.toque && typeof ent.toque.conteudo === "string" ? ent.toque.conteudo : "";
      if (!frase.trim() || frase.length > ROTA.fraseMax) continue;
      const estado = comoOLoadAbre(estadoNoTurno(A, i));
      const corpo = { estado, frase, ...(eco ? { eco } : {}) };
      const e0 = oEstadoDoServidor(estado, { eco });
      const fim = (await oPedidoNoServidor(corpo)).estadoDoFim;
      const sv = await oTurnoNoServidor({ ...corpo, resposta: L.narrador }, { cronista: () => (L.cronista ? L.cronista.proposta : null) });
      eco = Object.keys(sv.eco).length ? sv.eco : null;
      casos++;
      const pr = aPracaDoJuiz(e0, fim);
      const doRender = aPracaDoJuiz(e0, { ...fim, cidadeAtual: e0.cidadeAtual, dia: e0.dia, mapa: e0.mapa, lei: e0.lei });
      if (pr.bancas.length) comPraca++;
      if (can(pr) === can(doRender)) instanteRender++;
      const en = sv.entradaDoJuiz;
      const precoNaPraca = new Map();
      for (const x of en.mercado) { const k = sem(x.nome); if (!precoNaPraca.has(k)) precoNaPraca.set(k, new Set()); precoNaPraca.get(k).add(Number(x.preco)); }
      const cruzados = oQueAPautaSabe(en.pauta).mercado.filter((x) => precoNaPraca.has(sem(x.nome)));
      if (cruzados.length) {
        pautaComPreco++;
        const outros = cruzados.filter((x) => !precoNaPraca.get(sem(x.nome)).has(Number(x.preco)));
        if (!outros.length) pautaNaPraca++; else if (foraDaPraca.length < 3) foraDaPraca.push(`${s}#${i}: ${outros.map((x) => x.nome + " ◉ " + x.preco).join(", ")}`);
      }
      /* o Juiz com a praça e sem ela (a foto de antes deste commit) */
      const narr = L.narrador.narrativa || "";
      const v1 = julgarAProsa(narr, en), v0 = julgarAProsa(narr, { ...en, mercado: [] });
      precoAntes += v0.precosInventados.length; precoDepois += v1.precosInventados.length;
      nomeAntes += v0.nomesNovos.length + v0.pessoasNovas.length; nomeDepois += v1.nomesNovos.length + v1.pessoasNovas.length;
      vetoDepois += vetosDoVeredito(v1, { turno: 1, cidade: estado.cidadeAtual || "" }).filter((x) => x.especie === "preco-contra-a-mesa").length;
    }
  }
  console.log(`      (${casos} turnos; praça na cena em ${comPraca}; preços apanhados ${precoAntes} sem a praça → ${precoDepois} com ela; gente e nomes novos ${nomeAntes} → ${nomeDepois}; vetos contra a mesa ${vetoDepois})`);
  t(`a praça do instante é a do render em todos os turnos gravados (${instanteRender}/${casos})`, casos >= 140 && instanteRender === casos);
  t(`e há praça em boa parte deles (${comPraca})`, comPraca >= 40);
  t(`o que a pauta pôs a preço e a praça vende tem o mesmo preço nas duas (${pautaNaPraca}/${pautaComPreco} turnos)${foraDaPraca.length ? " — " + foraDaPraca.join(" · ") : ""}`, pautaComPreco > 0 && pautaNaPraca === pautaComPreco);
  t(`com a praça o Juiz não acusa mais preços nas sessões (${precoAntes} → ${precoDepois}) e nenhum veto contra a mesa nasce do nada (${vetoDepois})`, precoDepois <= precoAntes && vetoDepois === 0);
  /* (c) O CASO MONTADO: na Ponte do Martelo (a banca do boticário vende o
     Elixir de Destreza a ◉ 145), o Narrador diz «Trezentas» num turno que
     não falou de compra (a pauta não traz a ficha do mercado). Com a praça:
     o veto, com o número certo. Sem ela (a foto de antes): só se media — e
     o elixir saía como nome novo. */
  {
    const { A } = SESSOES.find((x) => x.s === "navegador");
    const L = A.turnos[1];
    const estado = comoOLoadAbre(estadoNoTurno(A, 1));
    const moeda = nomeDaMoeda((estado.mundo || {}).lexico);
    const narrativa = `A banca do boticário fica sob um toldo verde, e o homem atrás dela limpa um frasco com a manga antes de o pousar no balcão. — O Elixir de Destreza? Trezentas ${moeda}, e nem uma a menos — diz ele, sem levantar os olhos. A praça segue no seu murmúrio de sempre.`;
    const sv = await oTurnoNoServidor({ estado, frase: L.entrada.frase, resposta: { narrativa, mudancas: {} } }, {});
    const veto = (sv.eco.vetosDoJuiz || []).find((v) => v.especie === "preco-contra-a-mesa");
    t("o preço errado numa cidade com banca vira veto com o número da banca", !!veto && /Elixir de Destreza/.test(can(veto)) && /145/.test(can(veto)));
    const v0 = julgarAProsa(narrativa, { ...sv.entradaDoJuiz, mercado: [] });
    t("e sem a praça (a foto de antes) não vetava: o preço só se media, e o elixir era nome novo", vetosDoVeredito(v0, { turno: 1, cidade: "" }).every((x) => x.especie !== "preco-contra-a-mesa") && v0.precosInventados.length === 1 && v0.nomesNovos.length + v0.pessoasNovas.length > 0);
    /* (d) A MESMA COISA, UMA VEZ SÓ: quando a frase pergunta o preço, a pauta
       traz a ficha do mercado com o mesmo item da banca; somados eram dois
       elixires, e a regra da soma absolvia o «Trezentas» (≈ 145 + 145) */
    const sv2 = await oTurnoNoServidor({ estado, frase: "Pergunto ao boticário quanto custa o Elixir de Destreza.", resposta: { narrativa, mudancas: {} } }, {});
    const naPauta = oQueAPautaSabe(sv2.entradaDoJuiz.pauta).mercado.some((x) => /Elixir de Destreza/.test(x.nome));
    t("com a ficha do mercado na pauta E a banca na foto, o mesmo preço errado é apanhado", naPauta && (sv2.eco.vetosDoJuiz || []).some((v) => v.especie === "preco-contra-a-mesa" && /145/.test(can(v))));
    const dobro = julgarAProsa(`— O Elixir de Destreza? Trezentas ${moeda}.`, { moeda, mercado: [{ nome: "Elixir de Destreza", preco: 145 }], pauta: "MERCADO: Elixir de Destreza ◉ 145" });
    t("o Juiz conta a coisa dita pela banca e pela pauta uma vez só (a soma não absolve o dobro)", dobro.precosInventados.length === 1);
  }
  /* (e) O CRONISTA: só com o gatilho aceso, e a fila anda no save */
  {
    t("a fila do Cronista é campo do save (estado.js), logo não viaja no eco", CAMPOS.some((c) => c.campo === "leituraDoCronista") && !("leituraDoCronista" in CAMPOS_DO_SERVIDOR));
    t("e nenhum campo do eco, dos soltos ou dos bilhetes é do save (um valor, um canal)", Object.keys(CAMPOS_DO_SERVIDOR).every((k) => !CAMPOS.some((c) => c.campo === k)));
    const fontes = [readFileSync(aqui("../src/App.jsx"), "utf8"), ...["cronista-do-turno", "fim-do-turno", "fecho-da-resposta"].map((n) => { try { return readFileSync(aqui(`../src/motor/${n}.js`), "utf8"); } catch { return ""; } })].join("\n");
    t(`a narração mais curta que o Cronista lê é a do App (${TURNO_NO_SERVIDOR.cronistaMinimo})`, fontes.includes(`narrativa.length < ${TURNO_NO_SERVIDOR.cronistaMinimo}) return;`));
    let casos = 0, perguntas = 0, acesos = 0, chamadas = 0, foraDoGatilho = 0, filaBoa = 0, comRede = 0, letras = 0;
    const motivos = {};
    for (const { A } of SESSOES) {
      let eco = null, leitura = null;
      for (let i = 0; i < A.turnos.length; i++) {
        const L = A.turnos[i], ent = L.entrada || {};
        const frase = typeof ent.frase === "string" && ent.frase.trim() ? ent.frase : ent.toque && typeof ent.toque.conteudo === "string" ? ent.toque.conteudo : "";
        if (!frase.trim() || frase.length > ROTA.fraseMax) continue;
        /* a fila do turno anterior, como o save a levaria */
        const estado = { ...comoOLoadAbre(estadoNoTurno(A, i)), ...(leitura ? { leituraDoCronista: leitura } : {}) };
        let pedidos = 0, pedidoBom = true;
        const sv = await oTurnoNoServidor({ estado, frase, ...(eco ? { eco } : {}), resposta: L.narrador }, { cronista: (p) => { pedidos++; if (!p || typeof p.sys !== "string" || typeof p.user !== "string") pedidoBom = false; else letras += p.sys.length + p.user.length; return L.cronista ? L.cronista.proposta : null; } });
        casos++;
        const c = sv.cronista;
        if (c.pergunta) perguntas++;
        if (c.corre) acesos++;
        chamadas += pedidos;
        if (pedidos !== (c.corre ? 1 : 0) || c.chamado !== c.corre || !pedidoBom) foraDoGatilho++;
        for (const k of c.motivos) motivos[k] = (motivos[k] || 0) + 1;
        if (c.motivos.includes("rede")) comRede++;
        /* a fila: lida, zera; pulada, cresce um e nunca passa do teto */
        const l0 = estado.leituraDoCronista || { pulos: 0, fila: [] }, l1 = sv.estadoDoFim.leituraDoCronista;
        const ok = !c.pergunta ? can(l1) === can(estado.leituraDoCronista) : c.corre && L.cronista && L.cronista.proposta ? l1.pulos === 0 && l1.fila.length === 0 : l1.pulos === Math.min((l0.pulos || 0) + 1, REDE_DO_CRONISTA.pulosMax) && l1.fila.length <= REDE_DO_CRONISTA.filaMax;
        if (ok) filaBoa++;
        leitura = l1 || null;
        eco = Object.keys(sv.eco).length ? sv.eco : null;
      }
    }
    CUSTO.cronista = { casos, acesos, letras: acesos ? Math.round(letras / acesos) : 0, motivos };
    console.log(`      (o Cronista seria chamado em ${acesos} de ${casos} turnos — ${(100 * acesos / casos).toFixed(0)}% —; motivos: ${Object.entries(motivos).map(([k, v]) => k + " " + v).join(" · ")}; o pedido ao Cronista tem em média ${CUSTO.cronista.letras} caracteres)`);
    t(`toda narração do turno passa pelo gatilho (${perguntas}/${casos})`, perguntas === casos);
    t(`a porta do Cronista só é chamada quando o gatilho acende, uma vez, com o pedido inteiro (${chamadas} chamadas, ${acesos} acesos, fora da regra: ${foraDoGatilho})`, chamadas === acesos && foraDoGatilho === 0);
    t(`e o gatilho poupa chamadas: acende em ${acesos} de ${casos}`, acesos > 0 && acesos < casos);
    t(`a fila anda no save: lida zera, pulada cresce sem passar do teto (${filaBoa}/${casos})`, filaBoa === casos);
    t(`e a rede de segurança acende depois de ${REDE_DO_CRONISTA.pulosMax} pulos (${comRede} turnos)`, comRede > 0);
    /* a rota leva a decisão no ensaio */
    const { A } = SESSOES.find((x) => x.s === "navegador");
    const L = A.turnos[1];
    const r = await rodar({ estado: comoOLoadAbre(estadoNoTurno(A, 1)), frase: L.entrada.frase, resposta: L.narrador, cronista: L.cronista.proposta });
    t("a rota em ensaio diz o que o turno decidiu do Cronista", r.codigo === 200 && r.corpo.cronista && typeof r.corpo.cronista.corre === "boolean" && typeof r.corpo.cronista.chamado === "boolean" && Array.isArray(r.corpo.cronista.motivos));
  }
}

sec("11. O TRABALHO QUE O MUNDO OFERECE, NO SERVIDOR (o 1.º órgão do depois)");
{
  /* motor/depois-do-turno.js (trilha A) corre no depois do servidor como o
     passo «o trabalho daqui» (sessao.js, `servidor: true`). O caso é o da
     suíte da peça (`umaCidadeQuePrega`: a cidade, o dia novo, o diário
     vazio, o herói orientado), sem o dia do último trabalho — o save não o
     guarda. Nas sessões gravadas o órgão não prega: o dia delas é nulo (os
     registos não o guardavam), e o «um por dia» fecha-o, como no App. */
  const { umaCidadeQuePrega } = await import("./depois-bloco.mjs");
  const { oSaveComOsSoltos } = await import("../src/motor/eco-do-turno.js");
  const base = umaCidadeQuePrega();
  delete base.render; delete base.ultimoTrabalhoDia;
  const narrativa = "A praça segue no seu murmúrio de sempre, e o vento traz o cheiro do pão da manhã. Ninguém olha duas vezes para o forasteiro.";
  const umTurno = (estado, eco, frase) => oTurnoNoServidor({ estado, frase, ...(eco ? { eco } : {}), resposta: { narrativa, mudancas: {} } }, {});
  /* o turno seguinte parte do save que este devolveu, com os soltos, como o load o abre */
  const oSeguinte = (antes, sv) => oSaveComOsSoltos(comoOLoadAbre({ ...antes, ...sv.estadoDoFim }), sv.soltos);
  const t1 = await umTurno(base, null, "Olho em volta.");
  const of = (t1.estadoDoFim.mural || []).find((c) => c.oferecido);
  const aviso = of ? `📋 ${of.dador} tem um trabalho no mural.` : "";
  const recado = /TRABALHO PREGADO NO MURAL/;
  t(`o mundo prega um trabalho no mural do save (${of && of.dador}, no dia ${base.dia})`, !!of && t1.estadoDoFim.mural.length === 1 && of.pregadoEm === base.dia);
  t("o dia do último trabalho e o aviso viajam no eco, e não no save", t1.eco.ultimoTrabalhoDia === base.dia && JSON.stringify(t1.eco.trabalhoPendente) === JSON.stringify([aviso]) && !("ultimoTrabalhoDia" in t1.estadoDoFim) && !("trabalhoPendente" in t1.estadoDoFim));
  t("o aviso espera a cena: não sai nas linhas deste turno", !t1.tela.linhas.includes(aviso));
  t("o recado ao Narrador vai na nota (um solto), e não no pedido deste turno", recado.test(String(t1.soltos.nota || "")) && !recado.test(JSON.stringify(t1.pedido)));
  const e2 = oSeguinte(base, t1);
  const t2 = await umTurno(e2, t1.eco, "Espero um pouco.");
  t("DOIS TURNOS SEGUIDOS NO MESMO DIA NÃO OFERECEM DOIS TRABALHOS (com o eco reenviado)", t2.estadoDoFim.mural.length === 1 && t2.eco.ultimoTrabalhoDia === base.dia);
  t("e o aviso sai no turno seguinte, depois da narração da abordagem, uma vez só", t2.tela.linhas.filter((l) => l === aviso).length === 1 && JSON.stringify(t2.eco.trabalhoPendente) === "[]");
  const p2 = await oPedidoNoServidor({ estado: e2, frase: "Espero um pouco.", eco: t1.eco });
  t("o pedido do turno seguinte leva o recado ao Narrador (a nota que o load trouxe nos soltos)", recado.test(JSON.stringify(p2.pedido)));
  /* o porquê do eco: com o mural vazio no mesmo dia, só o dia do último
     trabalho segura o órgão — sem ele, o servidor ofereceria em todo turno */
  const e2v = { ...e2, mural: [] };
  const comEco = await umTurno(e2v, t1.eco, "Espero."), semEco = await umTurno(e2v, null, "Espero.");
  t(`e é o eco que o segura: no mesmo dia, sem o mural, com o eco ${comEco.estadoDoFim.mural.length} trabalho, sem ele ${semEco.estadoDoFim.mural.length}`, comEco.estadoDoFim.mural.length === 0 && semEco.estadoDoFim.mural.length === 1);
  t("o turno com o trabalho corre igual duas vezes, e nada calou", JSON.stringify(await umTurno(base, null, "Olho em volta.")) === JSON.stringify(t1) && !t1.calados.length && !t2.calados.length);
  /* a rota em ensaio leva o eco novo, e o eco reenviado dá o pedido do caminho do App */
  const r1 = await rodar({ estado: base, frase: "Olho em volta.", resposta: { narrativa, mudancas: {} } });
  const r2 = await rodar({ estado: e2, frase: "Espero um pouco.", eco: r1.corpo && r1.corpo.eco });
  const ref2 = await peloCaminhoDoApp({ estado: e2, frase: "Espero um pouco.", eco: r1.corpo && r1.corpo.eco });
  t("a rota devolve o eco com o dia do último trabalho, e reenviado dá o pedido do caminho do App", r1.codigo === 200 && r1.corpo.eco.ultimoTrabalhoDia === base.dia && r2.codigo === 200 && r2.corpo.pedido.hash === sha(ref2.pedido));
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
