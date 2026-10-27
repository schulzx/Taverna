/* teste-estado.mjs (Fase T0, trilha A) — o estado do jogo, um objeto só

   O QUE SE PROVA. `src/estado.js` é a forma do estado v2 e a ponte entre
   o save v1 (o literal cru de `retratoDoJogo`, sem versão) e o v2. A lei
   que não se negocia é a da pessoa: **um save que existe na máquina de
   quem joga não pode deixar de abrir nem perder um campo.** Por isso a
   maior parte desta suíte não prova o módulo — prova os saves:

   1. a tabela é o retrato do App, campo a campo e na mesma ordem;
   2. três saves de eras diferentes (um de antes do mapa, um da v9.1xx, um
      de hoje montado com o registo real da 9.ª sessão) viram estado v2 e
      voltam a save sem perder nem mudar um byte de campo nenhum;
   3. um save v2 lido e regravado sai byte a byte igual;
   4. lixo e `null` não estouram;
   5. o padrão `null` é, para cada leitor do App, o mesmo que a ausência —
      e isto é o que torna a migração na leitura inofensiva;
   6. a vista (o ref que lê do estado) e a fiação no App. */

import { readFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

process.chdir(dirname(fileURLToPath(import.meta.url)));

const E = await import("../src/estado.js");
const APP = readFileSync("../src/App.jsx", "utf8");
const S9 = JSON.parse(readFileSync("./registo-s9-historia.json", "utf8"));

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? "  →  " + String(extra).slice(0, 300) : "")); }
};
const sec = (s) => console.log("\n" + s);
const bloco = (fn) => { try { fn(); } catch (e) { mal++; console.log("  XX  o bloco estourou: " + (e && e.stack || e)); } };
const J = (x) => JSON.stringify(x);

/* ============================================================ */
sec("1. A TABELA É O RETRATO DO APP");
bloco(() => {
  const i0 = APP.indexOf("const retratoDoJogo = (");
  const iR = i0 >= 0 ? APP.indexOf("return {", i0) : -1;
  const i1 = iR >= 0 ? APP.indexOf("\n    };", iR) : -1;
  t("achei o literal de `retratoDoJogo`", i0 > 0 && iR > i0 && i1 > iR);
  const lit = APP.slice(iR + 8, i1).replace(/\/\*[\s\S]*?\*\//g, "");
  let fundo = 0, cur = "";
  const partes = [];
  for (const ch of lit) {
    if ("([{".includes(ch)) fundo++;
    if (")]}".includes(ch)) fundo--;
    if (ch === "," && fundo === 0) { partes.push(cur); cur = ""; } else cur += ch;
  }
  partes.push(cur);
  const chaves = partes.map((p) => p.trim()).filter(Boolean).map((p) => (p.match(/^([A-Za-z_$][\w$]*)/) || [])[1]);
  t("o retrato abre com `versao: ESTADO_VERSAO` (o retrato É o estado v2)", chaves[0] === "versao" && /versao:\s*ESTADO_VERSAO/.test(lit));
  const doApp = chaves.slice(1);
  const daTabela = E.CAMPOS.map((c) => c.campo);
  const faltam = doApp.filter((k) => !daTabela.includes(k));
  const sobram = daTabela.filter((k) => !doApp.includes(k));
  t(`os ${doApp.length} campos do retrato estão todos na tabela`, faltam.length === 0, "nasceu no App sem nascer em estado.js: " + faltam.join(","));
  t("e a tabela não tem campo que o retrato já não grava", sobram.length === 0, sobram.join(","));
  t("na mesma ordem (o save v2 sai na ordem em que o App sempre escreveu)", J(doApp) === J(daTabela));
  t("nenhum campo repetido", new Set(daTabela).size === daTabela.length);
  const semGrupo = E.CAMPOS.filter((c) => !E.GRUPOS.includes(c.grupo)).map((c) => c.campo);
  t("cada campo mora num grupo que existe", semGrupo.length === 0, semGrupo.join(","));
  const vazios = E.GRUPOS.filter((g) => E.camposDoGrupo(g).length === 0);
  t("e nenhum grupo está vazio", vazios.length === 0, vazios.join(","));
  t("a ficha é a personagem", J(E.camposDoGrupo("ficha")) === J(["personagem"]));
  t("o relógio é dia, minuto, acordouAbs e diaLuta",
    J(E.camposDoGrupo("relogio").slice().sort()) === J(["acordouAbs", "dia", "diaLuta", "minuto"]));
  const tiposMaus = E.CAMPOS.filter((c) => !["objeto", "lista", "texto", "numero", "qualquer"].includes(c.tipo)).map((c) => c.campo);
  t("todo tipo é um dos cinco", tiposMaus.length === 0, tiposMaus.join(","));
});

/* ============================================================ */
sec("2. O VAZIO");
bloco(() => {
  const v = E.estadoVazio();
  t("versão 2", v.versao === 2 && E.ESTADO_VERSAO === 2);
  t("tem todo campo da tabela", E.CAMPOS.every((c) => Object.prototype.hasOwnProperty.call(v, c.campo)));
  t("e só eles, mais a versão", Object.keys(v).length === E.CAMPOS.length + 1);
  const outro = E.estadoVazio();
  t("cada vazio é novo: as listas não são partilhadas", v.mensagens !== outro.mensagens && Array.isArray(v.mensagens));
  /* A AUSÊNCIA É SINAL — os três campos em que o App migra quando falta */
  t("`missoes` vazio é null, não [] (a ausência migra as quests antigas)", v.missoes === null);
  t("`abasAbertas` vazio é null (a ausência abre as abas a quem já jogava)", v.abasAbertas === null);
  t("`nevoaVersao` e `mapa` vazios são null (a ausência revela/gera o mapa)", v.nevoaVersao === null && v.mapa === null);
  t("é determinista: dois vazios, o mesmo JSON", J(v) === J(outro));
});

/* ============================================================ */
sec("3. OS SAVES ANTIGOS — abrem e voltam a salvar sem perder nada");

/* A. Um save de antes do mapa (v6/v7): sem mapa, sem missões, sem abas,
   sem névoa — com `quests` e o `acordouAbs = 0` do bug da v9.5. */
const SAVE_A = {
  nomeCampanha: "A Estrada de Sal",
  mundo: { genero: "Fantasia medieval", tom: "sombrio" },
  personagem: { nome: "Bruna", classe: "Guerreira", nivel: 3, vida: 18, vidaMax: 22, ouro: 40, inventario: ["espada", "corda"] },
  mensagens: [{ autor: "mestre", texto: "A estrada se abre diante de você." }, { autor: "jogador", texto: "Sigo para o norte." }],
  historico: [{ role: "user", content: "Sigo para o norte." }, { role: "assistant", content: "O vento muda." }],
  canone: { fatos: ["o rio Sal corre para o sul"] },
  npcs: { tobias: { nome: "Tobias", papel: "ferreiro" } },
  quests: [{ titulo: "O martelo perdido", status: "ativa", objetivo: "achar o martelo", tipo: "favor" }],
  dia: 4, minuto: 610, acordouAbs: 0,
  contadores: { lutas: 2 },
  rolagem: null,
  salvoEm: 1690000000000,
};

/* B. Um save da v9.1xx: mapa, missões, abas, masmorra nula, raid, e um
   campo que a tabela não conhece (remendo antigo) — que tem de atravessar. */
const SAVE_B = {
  ...SAVE_A,
  nomeCampanha: "Os Sinos de Varra",
  mapa: { cidades: [{ id: "varra", nome: "Varra", descoberta: true }], faccoes: [], rotas: [] },
  cidadeAtual: "Varra", faccaoJogador: "",
  missoes: [{ titulo: "O martelo perdido", status: "ativa", etapas: [] }],
  abasAbertas: ["ficha", "mapa"],
  masmorra: null, raid: null, jornada: null, lugar: null,
  nevoaVersao: 1, conquistas: { desbloqueadas: { primeiro: 3 }, ordem: ["primeiro"] },
  mercado: { comprados: { pao: 2 }, ambulante: null, pressoes: {}, gastos: {}, pechinchas: {} },
  ultimaCobranca: 12, vilaoAgiu: -99, cobradas: ["a", "b"], formasCobradas: ["x"],
  custo: { chamadas: 30, tokens: 1000 },
  preferenciaDaReacao: "normal",
  sessao: { ateODia: 3, turnos: 0, sugeriu: false },
  cofreAntigo: { moedas: 7 },
};

/* C. Um save de hoje: todo campo do retrato, com o que a 9.ª sessão real
   tinha (personagem, mapa, espinha, guildas, base do mundo, elenco, npcs)
   e valores plausíveis no resto. */
const SAVE_C = (() => {
  const s = {};
  for (const c of E.CAMPOS) {
    s[c.campo] = c.tipo === "lista" ? [{ marca: c.campo }]
      : c.tipo === "texto" ? "texto de " + c.campo
      : c.tipo === "numero" ? 7
      : { marca: c.campo };
  }
  s.nomeCampanha = (S9.campanha && S9.campanha.nomeCampanha) || "A saga da 9.ª sessão"; s.mundo = S9.campanha;
  s.personagem = S9.personagem; s.mapa = S9.mapa; s.espinha = S9.espinha;
  s.guildas = S9.guildas; s.baseMundo = S9.baseMundo; s.elencoMem = S9.elencoMem; s.npcs = S9.npcs;
  s.dia = 12; s.minuto = 845; s.acordouAbs = 15000; s.modo = "historia"; s.nevoaVersao = 1;
  s.acampado = false; s.provedor = "gemini"; s.provedores = ["gemini", "deepseek"];
  s.combate = null; s.sitio = null; s.rolagem = null; s.salvoEm = 1761000000000; s.backupEm = null;
  return s;
})();

const SAVES = [["A (antes do mapa)", SAVE_A], ["B (v9.1xx, com um campo desconhecido)", SAVE_B], ["C (de hoje, com a 9.ª sessão)", SAVE_C]];
bloco(() => {
  t("o save C tem dado real da 9.ª sessão (o mapa e a ficha não estão vazios)",
    SAVE_C.personagem && SAVE_C.personagem.nome && SAVE_C.mapa && Array.isArray(SAVE_C.mapa.cidades) && SAVE_C.mapa.cidades.length > 0);
  for (const [nome, sv] of SAVES) {
    const antes = J(sv);
    t(`${nome}: é v1 (sem versão)`, E.versaoDoSave(sv) === 1);
    const est = E.estadoDoSave(sv);
    t(`${nome}: vira estado v2`, est.versao === 2);
    t(`${nome}: a leitura não toca no save lido`, J(sv) === antes);
    const mudou = Object.keys(sv).filter((k) => J(est[k]) !== J(sv[k]));
    t(`${nome}: nenhum dos ${Object.keys(sv).length} campos muda na leitura`, mudou.length === 0, mudou.join(","));
    const mesmaRef = Object.keys(sv).filter((k) => sv[k] !== null && typeof sv[k] === "object" && est[k] !== sv[k]);
    t(`${nome}: e os objetos passam pela mesma referência (nada é copiado nem consertado)`, mesmaRef.length === 0, mesmaRef.join(","));
    const faltavam = E.CAMPOS.filter((c) => !(c.campo in sv));
    const padroes = faltavam.filter((c) => J(est[c.campo]) !== J(c.padrao === "lista" ? [] : null)).map((c) => c.campo);
    t(`${nome}: os ${faltavam.length} campos que faltavam ganham o padrão`, padroes.length === 0, padroes.join(","));
    const gravado = E.saveDoEstado(est);
    const perdeu = Object.keys(sv).filter((k) => !(k in gravado) || J(gravado[k]) !== J(sv[k]));
    t(`${nome}: volta a save sem perder nem mudar um campo (o JSON de cada um, comparado)`, perdeu.length === 0, perdeu.join(","));
    t(`${nome}: o save gravado é v2`, gravado.versao === 2 && E.versaoDoSave(gravado) === 2 && Object.keys(gravado)[0] === "versao");
    /* o save gravado é o v1 com a versão e os padrões — e nada mais */
    const esperado = { ...Object.fromEntries(E.CAMPOS.map((c) => [c.campo, c.padrao === "lista" ? [] : null])), ...sv };
    const extra = Object.keys(gravado).filter((k) => k !== "versao" && !(k in esperado));
    t(`${nome}: e não nasce campo além da versão e dos padrões`, extra.length === 0, extra.join(","));
    /* a segunda volta: o v2 gravado lido e regravado, byte a byte */
    const texto = J(gravado);
    const deNovo = J(E.saveDoEstado(E.estadoDoSave(JSON.parse(texto))));
    t(`${nome}: o save v2 lido e regravado sai byte a byte igual`, deNovo === texto);
  }
  /* A AUSÊNCIA SOBREVIVE À LEITURA: o save A não tinha missões nem abas, e
     o App migra as quests e abre as abas exatamente por isso. */
  const eA = E.estadoDoSave(SAVE_A);
  t("save A: `missoes` continua ausente-equivalente (null) e as quests intactas — a migração v9.27 ainda corre",
    eA.missoes === null && eA.quests === SAVE_A.quests);
  t("save A: `abasAbertas` null — quem já jogava continua com todas as abas", eA.abasAbertas === null);
  t("save A: `nevoaVersao` null — o mapa de quem já jogava continua revelado", eA.nevoaVersao === null);
  t("save A: o `acordouAbs = 0` antigo passa intacto (a correção é do leitor, v9.5)", eA.acordouAbs === 0);
  t("save B: o campo desconhecido atravessa a leitura e a gravação",
    J(E.estadoDoSave(SAVE_B).cofreAntigo) === J({ moedas: 7 }) && J(E.saveDoEstado(E.estadoDoSave(SAVE_B)).cofreAntigo) === J({ moedas: 7 }));
  t("save B: e vai depois dos campos da tabela", Object.keys(E.saveDoEstado(E.estadoDoSave(SAVE_B))).pop() === "cofreAntigo");
});

/* ============================================================ */
sec("4. O LIXO NÃO DERRUBA");
bloco(() => {
  const vazio = J(E.estadoVazio());
  for (const lixo of [null, undefined, "save", 42, true, [], [1, 2], () => 1]) {
    let r, estourou = false;
    try { r = E.estadoDoSave(lixo); } catch { estourou = true; }
    t(`estadoDoSave(${typeof lixo === "function" ? "função" : J(lixo)}) é o vazio, sem estourar`, !estourou && J(r) === vazio);
  }
  let estourou = false;
  try { E.saveDoEstado(null); E.saveDoEstado("x"); E.saveDoEstado([]); } catch { estourou = true; }
  t("saveDoEstado de lixo também não estoura", !estourou && E.saveDoEstado(null).versao === 2);
  const torto = { ...SAVE_B, mensagens: "lixo", mundo: "x", ultimaCobranca: "abc", nomeCampanha: 7, missoes: { nao: "lista" }, preferenciaDaReacao: 3, custo: "caro" };
  const e = E.estadoDoSave(torto);
  t("campo com o tipo errado vira o padrão (o que o leitor do App já faria)",
    Array.isArray(e.mensagens) && e.mensagens.length === 0 && e.mundo === null && e.ultimaCobranca === null
    && e.nomeCampanha === null && e.missoes === null && e.preferenciaDaReacao === null && e.custo === null);
  t("e os campos bons do mesmo save passam intactos", e.personagem === torto.personagem && e.mapa === torto.mapa && e.quests === torto.quests);
  t("`null` gravado é estado normal: passa como null", E.estadoDoSave({ masmorra: null, mundo: null }).masmorra === null);
  t("`versao` torta é lida como v1", E.versaoDoSave({ versao: "2" }) === 1 && E.versaoDoSave({ versao: 0 }) === 1 && E.versaoDoSave(null) === 1);
  t("um save de versão maior que a nossa é lido sem perder o que não conhecemos",
    J(E.saveDoEstado(E.estadoDoSave({ versao: 3, campoDoFuturo: [1] })).campoDoFuturo) === J([1]));
});

/* ============================================================ */
sec("5. O PADRÃO É A AUSÊNCIA, PARA CADA LEITOR DO App");
await (async () => {
  try {
    const i0 = APP.indexOf("const continuar = (comResumo");
    const i1 = APP.indexOf("\n  };", i0);
    const CONT = i0 > 0 && i1 > i0 ? APP.slice(i0, i1) : "";
    t("achei o leitor (`continuar`)", CONT.length > 10000);
    /* (a) nenhum leitor distingue null de ausente pela forma do JS */
    const distingue = [];
    for (const c of E.CAMPOS) {
      const k = c.campo;
      const re = new RegExp("sv\\." + k + "\\s*[!=]==\\s*undefined|typeof sv\\." + k + "\\s*[!=]==\\s*.undefined.|[\"']" + k + "[\"']\\s+in\\s+sv|hasOwnProperty\\([^)]*[\"']" + k + "[\"']");
      if (re.test(CONT)) distingue.push(k);
    }
    t("nenhum campo é lido com `=== undefined`, `in` ou `hasOwnProperty` (null e ausente são o mesmo para o JS do leitor)", distingue.length === 0, distingue.join(","));
    /* (b) `aplicarRetrato` usa `!== undefined` — e por isso todo campo que
       ele toca tem de ser reposto mais abaixo em `continuar`, que é o que
       faz o null do padrão nunca ficar no ref. */
    const iA = APP.indexOf("const aplicarRetrato = (retrato)");
    const iAf = APP.indexOf("\n  };", iA);
    const AR = APP.slice(iA, iAf);
    const tocados = [...AR.matchAll(/r\.(\w+) !== undefined/g)].map((m) => m[1]);
    const iChamada = CONT.indexOf("aplicarRetrato(sv);");
    const depois = CONT.slice(iChamada + 20);
    const naoRepostos = [...new Set(tocados)].filter((k) => !new RegExp("sv\\." + k + "\\b").test(depois));
    t(`os ${new Set(tocados).size} campos que \`aplicarRetrato\` lê por \`!== undefined\` são todos repostos depois em \`continuar\``,
      tocados.length > 10 && naoRepostos.length === 0, naoRepostos.join(","));
    /* (c) as garantias dos módulos: garantirX(null) === garantirX(undefined) */
    const deOnde = {};
    for (const m of APP.matchAll(/import \{([^}]+)\} from "\.\/([\w.-]+\.js)";/g)) {
      for (const parte of m[1].split(",")) {
        const [orig, alias] = parte.trim().split(/\s+as\s+/);
        if (orig) deOnde[(alias || orig).trim()] = { mod: m[2], orig: orig.trim() };
      }
    }
    const chamadas = [...CONT.matchAll(/(garantir\w+)\(sv\.(\w+)\s*([,)])/g)].map((m) => ({ fn: m[1], campo: m[2], mais: m[3] === "," }));
    const comNull = chamadas.filter((c) => {
      const d = E.CAMPOS.find((x) => x.campo === c.campo);
      return d && d.padrao !== "lista";
    });
    const MAPA = { cidades: [], faccoes: [], rotas: [] };
    const difere = [], semModulo = [], instavel = [];
    let provadas = 0;
    for (const c of comNull) {
      const d = deOnde[c.fn];
      if (!d) { semModulo.push(c.fn); continue; }
      const mod = await import("../src/" + d.mod);
      const f = mod[d.orig];
      if (typeof f !== "function") { semModulo.push(c.fn); continue; }
      const extra = c.mais ? [MAPA, {}] : [];
      const rodar = (x) => { try { return J(f(x, ...extra)); } catch (e) { return "ESTOUROU:" + (e && e.message); } };
      const u1 = rodar(undefined), u2 = rodar(undefined), n = rodar(null);
      if (u1 !== u2) { instavel.push(c.fn); continue; }
      provadas++;
      if (n !== u1) difere.push(`${c.fn}(sv.${c.campo}): null=${n.slice(0, 60)} · ausente=${u1.slice(0, 60)}`);
    }
    t(`as ${provadas} garantias que o leitor chama com campo de padrão null devolvem o mesmo para null e para a ausência`,
      provadas >= 25 && difere.length === 0, difere.join(" | "));
    t("toda garantia chamada pelo leitor foi achada no seu módulo", semModulo.length === 0, semModulo.join(","));
    if (instavel.length) console.log("      (não deterministas, fora da conta: " + instavel.join(",") + ")");
  } catch (e) { mal++; console.log("  XX  o bloco estourou: " + (e && e.stack || e)); }
})();

/* ============================================================ */
sec("6. A VISTA — o ref que lê do estado");
bloco(() => {
  const caixa = { current: E.estadoVazio() };
  const minuto = E.vistaDoCampo(caixa, "minuto");
  t("lê o campo do estado", minuto.current === null);
  const antes = caixa.current;
  minuto.current = 420;
  t("escrever põe o valor no estado", caixa.current.minuto === 420 && minuto.current === 420);
  t("e SUBSTITUI o estado, não o muta (o de antes continua como era)", antes !== caixa.current && antes.minuto === null);
  t("os outros campos atravessam a escrita", caixa.current.versao === 2 && Array.isArray(caixa.current.mensagens) && caixa.current.missoes === null);
  const dia = E.vistaDoCampo(caixa, "dia");
  dia.current = 3; minuto.current += 30;
  t("duas vistas sobre a mesma caixa não se pisam", caixa.current.dia === 3 && caixa.current.minuto === 450);
  const sem = { current: null };
  const v = E.vistaDoCampo(sem, "personagem");
  t("caixa vazia: lê undefined e a primeira escrita cria o estado", v.current === undefined && ((v.current = { nome: "X" }), sem.current.personagem.nome === "X"));
  const f = E.fatiaDoGrupo(caixa.current, "relogio");
  t("a fatia do relógio sai do estado", f.dia === 3 && f.minuto === 450 && "acordouAbs" in f && "diaLuta" in f);
  t("a fatia de lixo não estoura", J(E.fatiaDoGrupo(null, "ficha")) === J({ personagem: null }));
});

/* ============================================================ */
sec("7. A FIAÇÃO NO App");
bloco(() => {
  t("o App lê do módulo do estado", /import \{[^}]*estadoDoSave[^}]*\} from "\.\/estado\.js";/.test(APP));
  t("a gravação passa por `saveDoEstado` (o disco recebe o v2)",
    /const gravar = \(d\) => \{ try \{ localStorage\.setItem\(chaveDoSave\(\), JSON\.stringify\(saveDoEstado\(d\)\)\)/.test(APP));
  t("o mundo que atravessa a sala não leva a versão (o protocolo da sala não muda)",
    /const \{ versao: _versaoLocal, elenco: _elencoLocal, lei: _leiLocal, memoria: _memoriaLocal, \.\.\.paraSala \} = dados;/.test(APP));
  const leitor = APP.indexOf("const lerSave = (sv) =>");
  t("toda leitura de save passa por `lerSave`, que é `estadoDoSave` + a migração da ficha",
    leitor > 0 && /const lerSave = \(sv\) => \{ if \(!sv \|\| typeof sv !== "object" \|\| Array\.isArray\(sv\)\) return null; const e = estadoDoSave\(sv\);/.test(APP));
  t("e `lerSave` mora fora de `Taverna()` (é pura: só lê módulos)", leitor > 0 && leitor < APP.indexOf("export default function Taverna()"));
  t("o carregar da abertura usa `lerSave`", /if \(bruto\) \{ const sv = lerSave\(JSON\.parse\(bruto\)\);/.test(APP));
  t("o importar e o desfazer também", APP.includes("const sv = lerSave(bruto);") && APP.includes("const sv = lerSave(JSON.parse(anterior));"));
  t("e nenhum `JSON.parse` de save sobra sem passar por ela",
    !/const sv = JSON\.parse\(bruto\); if \(sv && sv\.personagem\)/.test(APP) && !/const sv = JSON\.parse\(anterior\);\n\s*if \(sv && sv\.personagem\)/.test(APP));
  t("o carimbo do backup (exportar no menu) também grava v2", APP.includes("localStorage.setItem(chaveDoSave(), JSON.stringify(saveDoEstado(sv2)));"));
});

/* ============================================================ */
sec("8. OS GRUPOS QUE JÁ LEEM DO ESTADO");
bloco(() => {
  t("o estado do jogo é um ref só, nascido vazio",
    APP.includes("const estadoRef = useRef(null);") && APP.includes("if (estadoRef.current === null) estadoRef.current = estadoVazio();"));
  const iH = APP.indexOf("function useVistaDoEstado(");
  const iT = APP.indexOf("export default function Taverna()");
  t("o gancho da vista mora FORA de `Taverna()` (nada definido dentro do render)", iH > 0 && iT > iH);
  t("e nasce uma vez só, com o valor inicial do `useRef` de antes",
    /if \(r\.current === null\) \{ r\.current = vistaDoCampo\(estadoRef, campo\); r\.current\.current = inicial; \}/.test(APP));
  t("o `estadoRef` nasce antes da primeira vista, no topo de `Taverna()`",
    APP.indexOf("const estadoRef = useRef(null);") > iT && APP.indexOf("const estadoRef = useRef(null);") < APP.indexOf("= useVistaDoEstado(estadoRef,"));
  t("a ficha: `personagemRef` é vista sobre o estado", /const personagemRef = useVistaDoEstado\(estadoRef, "personagem", null\);/.test(APP));
  t("e o espelho da ficha continua a escrever nela (pela vista)", APP.includes("useEffect(() => { if (personagem) personagemRef.current = personagem; }, [personagem]);"));
  t("a ficha viva continua a ser o ref, e o ref agora é o estado", APP.includes("const fichaViva = () => personagemRef.current || personagem;"));
  t("nenhuma vista é passada como ref de DOM (a vista não é um nó)", !/ref=\{personagemRef\}/.test(APP));
});

console.log(`\nestado: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
