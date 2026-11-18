/* teste-exame-do-mestre.mjs (M2 · 18/11/2026) — «o exame do Mestre».

   O desenho é mente/lancamento/o-mestre-vivo.md (§3 a régua do momento, §4 a
   cena que o Mestre lê, §8 o exame). O veredito de cada item sai do estudo das
   mesas reais (mente/lancamento/estudo-das-mesas.md §6 e §8); as frases são
   nossas, escritas ANTES de abrir o catálogo, para não serem moldadas pelas
   regex. O exame está em testes/exame-do-mestre.json.

   Isto é MEDIDA, não conserto. O Mestre de hoje recebe a frase do jeito que o
   jogo a passa — `lerAcao` → `porQueNaoChama` (e, no social, a conta da escada
   do pedido, que `lerAcao` já faz) — com o contexto que ele hoje aceita. O que
   da cena ele não sabe ler (medo, pressa, testemunha, vigia, perigo, motivo
   para negar), ele simplesmente não recebe: é esse buraco que se quer medir.

   O que da cena ENTRA, porque o Mestre de hoje tem porta para isso
   (PORTAS_DA_CENA, abaixo): a pessoa (relação, papel e segredo, por
   `pessoaDe`), o achado escondido (`achadoDe`), a armadilha em cena
   (`objetoEmCena`), a chuva e o escuro (`chove`, `escuro`) e o que o herói
   já sabe (`saber`, para a régua do saber comum).

   «Pede dado» é a convenção de teste-corpus-das-situacoes: um veredito de
   teste que `porQueNaoChama` não cala, ou que cala só por ser conversa (a
   conversa rola pela escada do pedido, sem o chamado).

   As catracas (CATRACA_DO_EXAME) guardam os números de hoje: os acertos não
   descem, os erros não sobem. Quando um número melhorar, move-se o piso para
   o novo valor, com a data — e só para esse lado. Pela regra da rodada, frase
   usada para afinar o Mestre sai do exame e entra outra (e a catraca da
   rodada nova recomeça da medida dela). */
import fs from "node:fs";
import { lerAcao, DESAFIOS } from "../src/desafios.js";
import { ehDeclaracaoDeAtaque } from "../src/agressao.js";
import { porQueNaoChama, oChamado } from "../src/motor/o-mestre-chama.js";
import { PERICIAS } from "../src/pericias.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const pct = (a, b) => (b ? Math.round((100 * a) / b) + "%" : "—");

const EXAME = JSON.parse(fs.readFileSync(new URL("./exame-do-mestre.json", import.meta.url), "utf8"));
const MESA = JSON.parse(fs.readFileSync(new URL("./corpus-da-mesa.json", import.meta.url), "utf8"));
const SITUACOES = JSON.parse(fs.readFileSync(new URL("./corpus-das-situacoes.json", import.meta.url), "utf8"));

/* ---------------- AS CATRACAS (rodada 1, 18/11/2026) ----------------
   Contagens inteiras. Acertos: «não desce de». Erros: «não sobe de». */
const CATRACA_DO_EXAME = {
  data: "2026-11-18",
  rolaCerto: 150,          // dos itens com ação declarada (fora os espontâneos)
  pedeIndevido: 26,       // pediu onde a mesa não pediria
  deixaDePedir: 99,       // não pediu onde a mesa pediria
  categoria: 93,          // a intenção certa
  pericia: 41,            // perícia certa, entre os que rolam dos dois lados
  paresQueSeparam: 2,    // pares em que o Mestre dá vereditos diferentes
  espontaneosCertos: 10,  // espontâneos: rola certo (hoje só os «não» acertam)
};

/* ---------------- O FORMATO DO EXAME ---------------- */
const FORMATO = {
  minItens: 250,
  minPares: 60,
  situacoes: 65,
  minPorSituacao: 2,      // com os pares, a maioria passa de 3; ver §1
  espontaneos: [15, 25],
  fracaoNaoRola: [0.4, 0.6],
  bases: ["numero", "padrao", "fraco"],
  categorias: ["procurar", "esgueirar", "ler_pessoa", "saber", "arcano", "forcar", "travessia", "rastrear", "socorrer", "furtar",
    "convencer", "intimidar", "enganar", "atuar", "animal", "perguntar", "logistica", "outro"],
};

/* ---------------- A CATEGORIA DO RÓTULO ----------------
   O que o Mestre de hoje leu (id do catálogo, ou a família do improviso), na
   língua do exame. Sem teste (livre, conversa, nada) é «sem_acao», que é a
   categoria certa para perguntar, logística e outro. */
const CATEGORIA_DO_ROTULO = {
  buscar: "procurar", investigar: "procurar", escutar: "procurar", desarmar: "procurar", imp_percepcao: "procurar",
  furtar_se: "esgueirar", seguir_alguem: "esgueirar",
  mentira: "ler_pessoa",
  lembrar: "saber", fraqueza: "saber", heraldica: "saber", orientar: "saber", imp_intelecto: "saber",
  arcano: "arcano",
  tranca: "forcar", forcar: "forcar", arrebentar: "forcar", imp_forca: "forcar",
  escalar: "travessia", nadar: "travessia", saltar: "travessia", equilibrio: "travessia", escapar: "travessia", cavalgar: "travessia", imp_destreza: "travessia",
  rastrear: "rastrear",
  estancar: "socorrer", diagnosticar: "socorrer", aguentar: "socorrer", imp_vigor: "socorrer",
  bater_carteira: "furtar",
  convencer: "convencer", fazer_falar: "convencer", impressionar: "convencer", imp_presenca: "convencer",
  intimidar: "intimidar",
  mentir: "enganar", falsificar: "enganar",
  atuar: "atuar",
  acalmar_bicho: "animal",
  atacar: "atacar",
};
const SEM_ACAO = ["perguntar", "logistica", "outro"];
const categoriaObtida = (rot) => (rot == null || rot === "livre" || rot === "naoSePede" ? "sem_acao" : CATEGORIA_DO_ROTULO[rot] || "?" + rot);
const categoriaCerta = (esperada, obtida) => esperada === obtida || (SEM_ACAO.includes(esperada) && obtida === "sem_acao");

/* ---------------- AS PORTAS DA CENA ----------------
   O que da cena o Mestre de hoje consegue receber, e por qual porta. O resto
   dos estados de §4 não tem porta e não vai — é a lacuna medida. */
const PORTAS_DA_CENA = {
  relacao: (c) => (c.hostil ? "inimigo" : c.disposta || c.deve_favor ? "amigo" : "desconhecido"),
  segredo: (c) => (c.esconde_algo ? c.nota || "algo que não conta" : ""),
  notas: (c) => (c.deve_favor ? "deve um favor ao herói" : ""),
  chove: (c) => /chuva|neve|nevasca/.test(String(c.clima || "")),
  escuro: (c) => /noite|madrugada/.test(String(c.hora || "")),
  armadilha: (c) => c.armadilhado === true,
  achado: (c) => c.ha_algo_escondido === true,
};
/* o que o herói já sabe (a régua do saber comum), pela cena: só os casos em
   que o jogo de hoje teria isto na ficha (o livro de factos, a terra) */
const SABER_DA_CENA = [
  { se: (c) => /cresceu no porto/.test(c.heroi || ""), saber: { terra: ["porto", "estivadores", "guilda dos estivadores", "guilda do porto"] } },
  { se: (c) => /sacerdote desse culto/.test(c.heroi || ""), saber: { factos: ["simbolo", "olho com chifres", "culto"] } },
  { se: (c) => /bom teste sobre dragões/.test(c.nota || ""), saber: { factos: ["dragao", "dragoes"] } },
  { se: (c) => /sessão anterior/.test(c.nota || ""), saber: { factos: ["capitao", "velho", "mina", "senha", "porteiro"] } },
];

const nrm = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const HEROI = { nivel: 1, inventario: [], habilidades: [], equipado: { arma: "Espada curta" }, moedas: 50 };
const quemDaCena = (c) => (Array.isArray(c.quem) ? c.quem[0] : c.quem) || "";
function ctxDe(item) {
  const c = (item && item.cena) || {};
  const quem = quemDaCena(c);
  const pessoa = quem ? { nome: "Fulana", papel: quem, relacao: PORTAS_DA_CENA.relacao(c), segredo: PORTAS_DA_CENA.segredo(c), notas: PORTAS_DA_CENA.notas(c) } : null;
  return {
    personagem: HEROI, semente: "exame-do-mestre", lugar: c.lugar || "", tentativas: {}, dia: 1,
    ehPessoaConhecida: () => false,
    pessoaDe: () => pessoa,
    achadoDe: () => (PORTAS_DA_CENA.achado(c) ? { o: "o que a cena esconde" } : null),
    objetoEmCena: (tipo) => tipo === "armadilha" && PORTAS_DA_CENA.armadilha(c),
    chove: PORTAS_DA_CENA.chove(c),
    escuro: PORTAS_DA_CENA.escuro(c),
  };
}
function ctxDoChamado(item, extra) {
  const c = (item && item.cena) || {};
  const s = SABER_DA_CENA.find((x) => { try { return x.se(c); } catch { return false; } });
  return { ...(s ? { saber: { lugar: c.lugar || "", ...s.saber } } : {}), ...(extra || {}) };
}

/* ---------------- A LEITURA DO MESTRE DE HOJE ---------------- */
const ROLA_MESMO_SEM_CHAMADO = [null, "conversa"];
function lerNoJogo(item, extraDoChamado) {
  const frase = item && typeof item === "object" ? item.frase : item;
  let atk = false;
  try { atk = ehDeclaracaoDeAtaque(frase, { nomes: [] }); } catch { atk = false; }
  if (atk) return { rot: "atacar", pede: false, pericia: "", por: "luta" };
  let v = null;
  try { v = lerAcao(frase, ctxDe(item && typeof item === "object" ? item : null)); } catch { v = null; }
  if (!v) return { rot: null, pede: false, pericia: "", por: "nada" };
  if (v.tipo !== "teste") return { rot: v.tipo === "naoSePede" ? "naoSePede" : "livre", pede: false, pericia: "", por: v.tipo };
  let rot = v.id;
  if (v.id === "improviso") { const p = String(v.chave || "").split("|"); rot = "imp_" + p[p.indexOf("improviso") + 1]; }
  const cx = ctxDoChamado(item, typeof extraDoChamado === "function" ? extraDoChamado(v) : null);
  let por = null;
  try { por = porQueNaoChama(v, cx); } catch { por = "erro"; }
  let chamado = null;
  try { chamado = oChamado(v, cx); } catch { chamado = null; }
  return { rot, pede: ROLA_MESMO_SEM_CHAMADO.includes(por), pericia: v.pericia || "", por: por || "chama", social: !!v.social, comPreco: !!chamado, dc: v.dc };
}

/* ---------------- A MEDIDA ---------------- */
const ITENS = EXAME.itens;
const declarados = ITENS.filter((i) => !i.espontaneo);
const espontaneos = ITENS.filter((i) => i.espontaneo);
const lido = new Map(ITENS.map((i) => [i.id, lerNoJogo(i)]));

function medir(lista, leitura) {
  const m = { n: lista.length, rolaCerto: 0, nNao: 0, pedeIndevido: 0, nSim: 0, deixaDePedir: 0, categoria: 0, nPericia: 0, pericia: 0, comPreco: 0, social: 0 };
  for (const i of lista) {
    const r = leitura(i), e = i.esperado;
    if (r.pede === e.rola) m.rolaCerto++;
    if (e.rola) { m.nSim++; if (!r.pede) m.deixaDePedir++; } else { m.nNao++; if (r.pede) m.pedeIndevido++; }
    if (categoriaCerta(e.categoria, categoriaObtida(r.rot))) m.categoria++;
    if (e.rola && r.pede) { m.nPericia++; if (e.pericias.includes(r.pericia)) m.pericia++; }
    if (r.pede && r.comPreco) m.comPreco++;
    if (r.pede && r.social) m.social++;
  }
  return m;
}
const M = medir(declarados, (i) => lido.get(i.id));
const E = medir(espontaneos, (i) => lido.get(i.id));

/* os pares: a mesma frase, duas cenas, vereditos opostos na mesa real */
const pares = {};
for (const i of ITENS) if (i.par) (pares[i.par] = pares[i.par] || []).push(i);
const listaPares = Object.values(pares);
const paresDecl = listaPares.filter((p) => !p[0].espontaneo);
const separa = (p) => lido.get(p[0].id).pede !== lido.get(p[1].id).pede;
const acertaOsDois = (p) => p.every((i) => lido.get(i.id).pede === i.esperado.rola);
const paresQueSeparam = paresDecl.filter(separa).length;
const paresCertos = paresDecl.filter(acertaOsDois).length;
const paresMetade = paresDecl.filter((p) => !acertaOsDois(p) && p.some((i) => lido.get(i.id).pede === i.esperado.rola)).length;

/* por categoria e por base (rola certo) */
const porChave = (f) => {
  const o = {};
  for (const i of declarados) { const k = f(i); const x = (o[k] = o[k] || [0, 0]); x[1]++; if (lido.get(i.id).pede === i.esperado.rola) x[0]++; }
  return o;
};
const porCategoria = porChave((i) => i.esperado.categoria);
const porBase = porChave((i) => i.esperado.base);

/* E SE O MUNDO SOUBESSE A CENA? Uma linha só de comparação, sem catraca: o
   oráculo de hoje é sorteio; aqui ele responderia «não» quando a cena diz que
   não há nada escondido — e só nos testes que perguntam ao mundo
   (`v.oportunidade`). Mede quanto da lacuna da busca uma porta só fecharia.
   Em 18/11 a resposta foi nenhuma: só três testes do catálogo perguntam ao
   mundo (escutar, ler a intenção, rastrear), e a busca não é um deles. */
const comOraculo = medir(declarados, (i) => {
  const c = i.cena || {};
  return lerNoJogo(i, (v) => (v && v.oportunidade && c.ha_algo_escondido === false ? { mundoDisseNao: true } : null));
});

sec("1. o exame é o que diz ser");
{
  const ids = new Set(PERICIAS.map((p) => p.id));
  const sits = {};
  for (const i of ITENS) sits[i.situacao] = (sits[i.situacao] || 0) + 1;
  const nNao = ITENS.filter((i) => !i.esperado.rola).length;
  t(`${ITENS.length} itens, ${listaPares.length} pares (${paresDecl.length} com ação declarada), ${espontaneos.length} espontâneos`,
    ITENS.length >= FORMATO.minItens && paresDecl.length >= FORMATO.minPares);
  t("todo item tem id, situação, cena, frase, esperado e rodada", ITENS.every((i) => i.id && Number.isInteger(i.situacao) && i.cena && typeof i.cena === "object"
    && typeof i.frase === "string" && i.frase.trim() && i.esperado && typeof i.esperado.rola === "boolean" && i.rodada >= 1));
  t("ids únicos", new Set(ITENS.map((i) => i.id)).size === ITENS.length);
  t(`as ${FORMATO.situacoes} situações do estudo estão todas, cada uma com ≥ ${FORMATO.minPorSituacao} itens`,
    Array.from({ length: FORMATO.situacoes }, (_, k) => sits[k + 1] || 0).every((n) => n >= FORMATO.minPorSituacao), JSON.stringify(sits));
  t(`cerca de metade não rola (${nNao} de ${ITENS.length})`, nNao / ITENS.length >= FORMATO.fracaoNaoRola[0] && nNao / ITENS.length <= FORMATO.fracaoNaoRola[1]);
  t(`espontâneos entre ${FORMATO.espontaneos.join(" e ")}`, espontaneos.length >= FORMATO.espontaneos[0] && espontaneos.length <= FORMATO.espontaneos[1]);
  t("categorias e bases do vocabulário fechado", ITENS.every((i) => FORMATO.categorias.includes(i.esperado.categoria) && FORMATO.bases.includes(i.esperado.base)));
  t("as perícias são ids do projeto, e só quem rola tem perícia", ITENS.every((i) => i.esperado.pericias.every((p) => ids.has(p))
    && (i.esperado.rola ? i.esperado.pericias.length > 0 : i.esperado.pericias.length === 0)));
  t("todo item diz a regra que decide (porque)", ITENS.every((i) => typeof i.esperado.porque === "string" && i.esperado.porque.length > 10));
  t("cada par é a mesma frase em duas cenas diferentes, com vereditos opostos", listaPares.every((p) => p.length === 2 && p[0].frase === p[1].frase
    && p[0].esperado.rola !== p[1].esperado.rola && JSON.stringify(p[0].cena) !== JSON.stringify(p[1].cena)));
  const vistas = new Set([...MESA.frases, ...SITUACOES.frases].map((f) => nrm(f.frase)));
  t("nenhuma frase do exame está nos corpus que afinaram o catálogo", ITENS.every((i) => !vistas.has(nrm(i.frase))));
  t("a origem diz de onde vem o veredito e que não há frase de mesa real; a regra da rodada existe",
    /estudo-das-mesas/.test(EXAME.origem) && /Nenhuma frase de mesa real/.test(EXAME.origem) && /sai do exame/.test(EXAME.regra_da_rodada));
  t("todo rótulo que o catálogo devolve tem categoria", DESAFIOS.every((d) => d.id === "improviso" || CATEGORIA_DO_ROTULO[d.id]));
}

sec("2. a medida (o Mestre de hoje contra a mesa real)");
const C = CATRACA_DO_EXAME;
console.log(`     com ação declarada: ${M.n} itens (${M.nSim} rolam na mesa, ${M.nNao} não)`);
console.log(`     1. rola certo ............ ${M.rolaCerto}/${M.n} (${pct(M.rolaCerto, M.n)})`);
console.log(`        pede onde a mesa não . ${M.pedeIndevido}/${M.nNao} (${pct(M.pedeIndevido, M.nNao)})`);
console.log(`        não pede onde a mesa . ${M.deixaDePedir}/${M.nSim} (${pct(M.deixaDePedir, M.nSim)})`);
console.log(`     2. categoria certa ....... ${M.categoria}/${M.n} (${pct(M.categoria, M.n)})`);
console.log(`     3. perícia certa ......... ${M.pericia}/${M.nPericia} (${pct(M.pericia, M.nPericia)}) — entre os que rolam dos dois lados`);
console.log(`        dos pedidos, com o preço dito antes (oChamado): ${M.comPreco}/${M.nSim - M.deixaDePedir + M.pedeIndevido} · pela escada social, sem chamado: ${M.social}`);
console.log(`     4. pares que o Mestre separa: ${paresQueSeparam}/${paresDecl.length} (${pct(paresQueSeparam, paresDecl.length)}) · acerta os dois lados: ${paresCertos} · acerta só um: ${paresMetade}`);
console.log(`     5. por categoria (rola certo): ` + Object.entries(porCategoria).map(([k, [a, b]]) => `${k} ${a}/${b}`).join(" · "));
console.log(`        por base: ` + Object.entries(porBase).map(([k, [a, b]]) => `${k} ${a}/${b} (${pct(a, b)})`).join(" · "));
console.log(`     6. espontâneos: rola certo ${E.rolaCerto}/${E.n} · dos ${E.nSim} que a mesa rolaria, o Mestre pediu ${E.nSim - E.deixaDePedir} · pediu indevido ${E.pedeIndevido}/${E.nNao}`);
console.log(`     (comparação, sem catraca) se o oráculo soubesse a cena: rola certo ${comOraculo.rolaCerto}/${comOraculo.n} · pede indevido ${comOraculo.pedeIndevido}/${comOraculo.nNao}`);

t(`rola certo não desce de ${C.rolaCerto} (${C.data})`, M.rolaCerto >= C.rolaCerto, `${M.rolaCerto}`);
t(`pede indevido não sobe de ${C.pedeIndevido} (${C.data})`, M.pedeIndevido <= C.pedeIndevido, `${M.pedeIndevido}`);
t(`deixa de pedir não sobe de ${C.deixaDePedir} (${C.data})`, M.deixaDePedir <= C.deixaDePedir, `${M.deixaDePedir}`);
t(`categoria certa não desce de ${C.categoria} (${C.data})`, M.categoria >= C.categoria, `${M.categoria}`);
t(`perícia certa não desce de ${C.pericia} (${C.data})`, M.pericia >= C.pericia, `${M.pericia}`);
t(`pares que o Mestre separa não descem de ${C.paresQueSeparam} (${C.data})`, paresQueSeparam >= C.paresQueSeparam, `${paresQueSeparam}`);
t(`espontâneos certos não descem de ${C.espontaneosCertos} (${C.data})`, E.rolaCerto >= C.espontaneosCertos, `${E.rolaCerto}`);

sec("3. os erros mais instrutivos");
{
  const rotulo = (rola, cat) => `${rola ? "rola" : "não rola"}/${cat}`;
  const resumo = (c) => Object.entries(c || {}).filter(([k, v]) => v === true || k === "nota").map(([k, v]) => (v === true ? k : v)).join(", ");
  const erros = declarados.filter((i) => lido.get(i.id).pede !== i.esperado.rola || !categoriaCerta(i.esperado.categoria, categoriaObtida(lido.get(i.id).rot)));
  /* os mais instrutivos primeiro: o par que o Mestre não separou, a base
     forte, o veredito errado antes da categoria errada; uma situação só por
     vez, para a lista não ser vinte vezes a mesma lacuna */
  const peso = (i) => (i.par && !separa(pares[i.par]) ? 4 : 0) + ({ numero: 2, padrao: 1, fraco: 0 }[i.esperado.base] || 0)
    + (lido.get(i.id).pede !== i.esperado.rola ? 3 : 0);
  erros.sort((a, b) => peso(b) - peso(a) || a.situacao - b.situacao);
  const vistas = new Set(), lista = [];
  for (const passo of [1, 2]) for (const i of erros) {
    if (lista.length >= 25 || lista.includes(i)) continue;
    if (passo === 1 && vistas.has(i.situacao)) continue;
    vistas.add(i.situacao); lista.push(i);
  }
  for (const i of lista) {
    const r = lido.get(i.id);
    console.log(`     #${i.situacao} ${rotulo(i.esperado.rola, i.esperado.categoria)} → ${rotulo(r.pede, categoriaObtida(r.rot))}${r.rot ? " (" + r.rot + ", " + r.por + ")" : ""} · «${i.frase}» [${resumo(i.cena)}]`);
  }
}

sec("4. a medida não estoura com lixo");
t("frase vazia, null e lixo devolvem sem dado", [null, "", "   ", 42, {}, { frase: null }, { frase: "pulo", cena: null }].every((x) => lerNoJogo(x).pede === false));

console.log(`\n${ok} ok, ${mal} falha(s)`);
if (mal) process.exit(1);
