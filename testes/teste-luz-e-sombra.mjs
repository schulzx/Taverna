/* teste-luz-e-sombra.mjs (Fase MM · pedido de 06/10) — esconder-se na sombra

   O pedido da pessoa, que autorizou a mecânica: *"Baixo a tocha e escondo-me
   na sombra" passa a funcionar — a grade aprende luz e escuridão.*

   O QUE A TERCEIRA SESSÃO VIU (mente/mm11-sessao-3.md, J18): "Baixo a tocha
   atrás das costas e escondo-me na sombra, colado à parede do fundo, sem
   fazer barulho." Numa sala de masmorra, com uma tocha só (a do herói) e o
   Lobo a 12 m no vão da porta. O veredito da v9.353 foi "Não há onde sumir:
   Lobo tem você à vista, sem nada no meio" — a grade não sabia o que era
   luz. O lobo do 5e não enxerga no escuro; com a tocha baixada, a sala é
   breu, e o herói some.

   O QUE ESTA SUÍTE GUARDA:
     §1 a frase da sessão: baixa a tocha e esconde no MESMO gesto (uma ação);
        sem baixar, a recusa do farol; e antes (sem a luz) a recusa velha;
     §2 quem enxerga no escuro não é enganado pela sombra — só pela pedra;
     §3 a noite cá fora e o dia, pela tabela; a taverna acesa; a chuva;
     §4 as tabelas são lidas de volta (nenhum número solto no módulo);
     §5 300 lutas semeadas: determinística, e nunca esconde de quem enxerga;
     §6 o herói que enxerga no escuro;
     §7 lixo, null e imutabilidade;
     §8 a pauta: 500 lutas semeadas, a linha da luz nunca tira desfecho,
        frase, veto nem planta; e o teto;
     §9 a fiação no App, lida pelo texto do código.

   FALHA no HEAD de 06/10 (v9.353): src/luz.js não existe (o import cai no
   vazio e cada asserção falha por si), `vereditoDoEsconder` ignora a luz e
   recusa a frase da sessão, a seção A LUZ não existe na pauta, e o App não
   tem a fiação. Toda sorte por semente: nenhum Math.random decide nada. */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { hashSemente, rng } from "../src/semente.js";
import * as E from "../src/escondido.js";
import * as P from "../src/pauta.js";
import { montarGrade, PLANTAS, temCobertura, linhaDeVisao, ehParede, distanciaM } from "../src/grid.js";
import { CRIATURAS_FANTASIA } from "../src/bestiario.js";
import { RACAS } from "../src/classes.js";
import { aplicarEscolha, envelopeDoGolpeFinal, golpeFinalNaPauta } from "../src/golpe-final.js";

const L = await import("../src/luz.js").catch(() => ({}));
const T = await import("../src/tracos.js").catch(() => ({}));
const AQUI = dirname(fileURLToPath(import.meta.url));

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const tenta = (f, d = null) => { try { return f(); } catch { return d; } };
const fn = (o, k) => (o && typeof o[k] === "function" ? o[k] : () => null);
const luzDaLuta = (c) => tenta(() => fn(L, "luzDaLuta")(c), null);
const luzEm = (l, p) => tenta(() => fn(L, "luzEm")(l, p), null);
const porQueVe = (l, a, b) => tenta(() => fn(L, "porQueVe")(l, a, b), "erro");
const veNoEscuro = (e) => tenta(() => fn(L, "veNoEscuro")(e), -1);
const gesto = (c, txt, o) => tenta(() => fn(L, "aplicarGestoDaLuz")(c, txt, o), null) || { combate: c, gesto: null };
const paraPauta = (l, o) => tenta(() => fn(L, "luzParaPauta")(l, o), "") || "";

/* a mesa da sessão 3, a mesma de teste-esconder-na-luta */
const masm = montarGrade({ emMasmorra: true });
const lobo = () => ({ nome: "Lobo", ameaca: "comum", x: 3, y: 9, vida: 4 });
const goblin = () => ({ nome: "Goblin", ameaca: "fraco", x: 3, y: 9, vida: 4 });
const iracema = { nome: "Iracema Sousa", x: 2, y: 16 };
const tobias = () => ({ nome: "Tobias Varzim", raca: "Humano", classe: "Guerreiro", nivel: 3, condicoes: [] });
const noFundo = { x: 3, y: 17 };
const FRASE = "Baixo a tocha atrás das costas e escondo-me na sombra, colado à parede do fundo, sem fazer barulho.";
const combDaSessao = () => ({ grade: masm, heroi: { ...noFundo }, inimigos: [lobo()], aliados: [{ ...iracema }], economia: { acao: 1, extra: 0 } });
/* o que o App faz (luzDaLutaAgora): o combate + as tochas da masmorra + a ficha */
const luzDe = (comb, extra = {}) => luzDaLuta({ ...comb, emMasmorra: true, tochas: 3, pers: tobias(), ...extra });

/* ============================================================ */
sec("1. a frase da sessão: baixa a tocha e some na sombra, numa ação só");
{
  const comb = combDaSessao();
  const antes = E.vereditoDoEsconder(tobias(), comb);
  t("sem a luz (a regra de antes): a recusa velha, intacta", !antes.pode && antes.motivo === "a_descoberto" && /Não há onde sumir: Lobo tem você à vista/.test(antes.linha));

  const g = gesto(comb, FRASE, { tochas: 3, emMasmorra: true });
  t("a frase traz o gesto: a tocha baixa", g.gesto === "baixar" && g.combate && g.combate.tochaDoHeroi === "baixada", JSON.stringify(g.gesto));
  t("…num combate NOVO (o recebido fica como estava)", comb.tochaDoHeroi === undefined && g.combate !== comb);
  t("…e o gesto não custa ação (a tabela diz livre)", L.GESTO_DA_LUZ && L.GESTO_DA_LUZ.custo === "livre" && g.combate.economia.acao === 1);
  const luz = luzDe(g.combate);
  t("com a tocha baixada, o fundo da sala é breu", luzEm(luz, noFundo) === "escuro");
  t("o Lobo não enxerga no escuro (a tabela não o tem)", veNoEscuro(lobo()) === 0);
  const ve = E.vereditoDoEsconder(tobias(), { ...g.combate, luz });
  t("o veredito deixa esconder: a sombra é o abrigo", ve.pode === true && ve.motivo === "sombra", JSON.stringify(ve));
  t("…e custa UMA ação, a do esconder (o gesto foi de graça)", ve.custo === "acao" && ve.economiaDepois.acao === 0);
  const ns = E.nascerEscondido(tobias(), { total: 25, grade: masm, heroi: noFundo, inimigos: [lobo()], luz });
  t("passou (25 contra 18): o estado nasce, e lembra que é na sombra", ns.ok && E.estadoEscondido(ns.pers).sombra === true && E.estadoEscondido(ns.pers).total === 25);
  t("a linha de tela diz a sombra, sem nome de mecanismo", /^🌠 Você está escondido na sombra \(furtividade 25\)\./.test(ns.linhas[0]) && !/sistema|\bestado\b|condi[cç]|mapa|n[ií]vel/i.test(ns.linhas[0]), ns.linhas[0]);
  const nota = E.notaDoEscondido({ passou: true, ns, total: 25, dc: 18, inimigos: [lobo()] });
  t("o Mestre lê o mesmo: escondido na sombra, de Lobo", /Escondi-me na sombra/.test(nota) && /Estou escondido de Lobo/.test(nota), nota);
  t("o Lobo não o vê — nem com o mapa nem sem ele (o golpe do inimigo não traz mapa)",
    E.oculto(ns.pers, lobo(), { grade: masm, heroi: noFundo, luz }) && E.oculto(ns.pers, lobo(), { grade: masm, heroi: noFundo }));
  const rv = E.revisarEscondido(ns.pers, { grade: masm, heroi: noFundo, inimigos: [lobo()], luz });
  t("na vez do mundo o Lobo não o acha a descoberto", rv.achadoAgora.length === 0);

  /* SEM baixar: a tocha na mão é o farol */
  const semBaixar = "escondo-me na sombra, colado à parede do fundo";
  const g2 = gesto(combDaSessao(), semBaixar, { tochas: 3, emMasmorra: true });
  t("sem \"baixo a tocha\", nada se mexe na tocha", g2.gesto === null);
  const luzAcesa = luzDe(combDaSessao());
  t("a tocha acende-se sozinha na masmorra com tochas (o padrão)", luzAcesa && luzAcesa.tocha === "acesa" && luzEm(luzAcesa, noFundo) === "clara");
  const far = E.vereditoDoEsconder(tobias(), { ...combDaSessao(), luz: luzAcesa });
  t("com a tocha acesa: recusa, com a linha do farol", !far.pode && far.motivo === "farol" && far.linha === "👁 Com a tocha acesa você é um farol — baixe-a primeiro.", far.linha);
  t("…e não rola, nem cobra", far.custo === null && !far.economiaDepois);
  const nsF = E.nascerEscondido(tobias(), { total: 25, grade: masm, heroi: noFundo, inimigos: [lobo()], luz: luzAcesa });
  t("o nascer concorda (mesma linha), e a nota ao Mestre diz a tocha",
    !nsF.ok && nsF.motivo === "farol" && nsF.linhas[0] === far.linha && /a tocha acesa na minha mão me mostra/.test(E.notaDoEscondido({ passou: true, ns: nsF, total: 25, dc: 18, inimigos: [lobo()] })));
  /* erguer de novo: o gesto inverso, e ele revela quem estava escondido */
  const g3 = gesto(g.combate, "ergo a tocha", { tochas: 3, emMasmorra: true });
  t("\"ergo a tocha\" acende de novo", g3.gesto === "erguer" && g3.combate.tochaDoHeroi === "acesa");
  const rva = E.revelarPorAto(ns.pers, "ergo a tocha e olho em volta");
  t("…e quem estava na sombra é revelado pelo ato", rva.revelado && !E.estadoEscondido(rva.pers));
  t("pergunta e negação não mexem na tocha", gesto(combDaSessao(), "posso baixar a tocha?", { tochas: 3, emMasmorra: true }).gesto === null
    && gesto(combDaSessao(), "não baixo a tocha", { tochas: 3, emMasmorra: true }).gesto === null);
  t("sem tochas, não há o que baixar nem erguer", gesto(combDaSessao(), FRASE, { tochas: 0, emMasmorra: true }).gesto === null
    && gesto(combDaSessao(), "acendo a tocha", { tochas: 0, emMasmorra: true }).gesto === null);
}

/* ============================================================ */
sec("2. quem enxerga no escuro não é enganado pela sombra");
{
  const comb = { ...combDaSessao(), inimigos: [goblin()], tochaDoHeroi: "baixada" };
  const luz = luzDe(comb);
  t("o Goblin enxerga no escuro a 18 m (a tabela)", veNoEscuro(goblin()) === 18);
  const ve = E.vereditoDoEsconder(tobias(), { ...comb, luz });
  t("recusa: a sombra não o esconde do Goblin", !ve.pode && ve.motivo === "no_escuro" && /^👁 Goblin enxerga no escuro: a sombra não esconde você\./.test(ve.linha), ve.linha);
  t("…e diz onde há pedra (a cobertura física ainda vale)", /Há abrigo a 3 m, aqui mesmo no fundo da sala/.test(ve.linha));
  const naPedra = E.vereditoDoEsconder(tobias(), { ...comb, heroi: { x: 3, y: 15 }, luz });
  t("colado à pedra, esconde-se até do Goblin", naPedra.pode && naPedra.motivo === "cobertura");
  const dois = E.vereditoDoEsconder(tobias(), { ...comb, inimigos: [lobo(), { ...goblin(), x: 4, y: 9 }], luz });
  t("Lobo e Goblin: basta um que enxergue para recusar, e só ele é nomeado", !dois.pode && dois.motivo === "no_escuro" && /^👁 Goblin enxerga/.test(dois.linha));
  const longe = { nome: "Goblin", x: 3, y: 0, vida: 4 };
  t("fora do alcance dos olhos (25,5 m > 18 m), a sombra volta a esconder",
    distanciaM(longe, noFundo) > 18 && E.vereditoDoEsconder(tobias(), { ...comb, inimigos: [longe], luz }).pode);
  const ns = E.nascerEscondido(tobias(), { total: 30, grade: masm, heroi: noFundo, inimigos: [lobo(), { ...goblin(), x: 4, y: 9 }], luz });
  t("o nascer concorda: não nasce", !ns.ok && ns.motivo === "no_escuro");
  /* o estado de antes do Goblin chegar: nasceu na sombra só com o Lobo */
  const soLobo = E.nascerEscondido(tobias(), { total: 30, grade: masm, heroi: noFundo, inimigos: [lobo()], luz });
  t("escondido do Lobo, o Goblin que entra o vê — com e sem o mapa",
    soLobo.ok && !E.oculto(soLobo.pers, goblin(), { grade: masm, heroi: noFundo, luz }) && !E.oculto(soLobo.pers, goblin(), { grade: masm, heroi: noFundo }));
  const rv = E.revisarEscondido(soLobo.pers, { grade: masm, heroi: noFundo, inimigos: [lobo(), goblin()] });
  t("e na vez do mundo o Goblin o acha, dizendo porquê", rv.achadoAgora.includes("Goblin") && /Goblin acha você/.test(rv.linhas[0]) && /enxerga no escuro/.test(rv.nota), rv.nota);
  t("a quinta porta está na tabela de quem acha", E.QUEM_ACHA.some((q) => q.id === "no_escuro"));
  /* a tabela é curta e honesta: o bestiário de fantasia, um a um */
  const enxergam = CRIATURAS_FANTASIA.filter((c) => veNoEscuro(c) > 0).map((c) => c.nome);
  t("do bestiário, enxergam: Rato Gigante, Goblin, Esqueleto, Zumbi, Ogro, Troll, Elemental, Golem, Quimera, Dragões, Lich, Slime",
    ["Rato Gigante", "Goblin", "Esqueleto", "Zumbi", "Ogro", "Troll", "Elemental Menor", "Golem de Pedra", "Quimera", "Dragão Jovem", "Lich", "Dragão Ancião", "Slime"].every((n) => enxergam.includes(n)), enxergam.join(", "));
  t("…e não enxergam: Lobo, Lobo Atroz, Bandido, Cultista, Gigante (no 5e, faro e olhos de gente)",
    ["Lobo", "Lobo Atroz", "Bandido", "Cultista", "Gigante"].every((n) => !enxergam.includes(n)));
}

/* ============================================================ */
sec("3. a noite cá fora e o dia, pela tabela");
{
  const A = L.AMBIENTE_DA_LUZ || {};
  const amb = (c) => tenta(() => fn(L, "ambienteDaCena")(c), null);
  t("dia → clara; noite → penumbra (luar); noite de chuva → escuro", amb({ noite: false }) === A.dia && A.dia === "clara"
    && amb({ noite: true }) === A.noite && A.noite === "penumbra" && amb({ noite: true, clima: "Chuva forte" }) === A.noiteFechada && A.noiteFechada === "escuro");
  t("masmorra e caverna são escuras a qualquer hora; a taverna é acesa", amb({ emMasmorra: true }) === "escuro" && amb({ cenario: "caverna" }) === "escuro" && amb({ cenario: "taverna", noite: true }) === "clara");
  const estrada = montarGrade({ local: "estrada" });
  const heroi = { x: 9, y: 5 };
  const orc = (y) => ({ nome: "Bandido", ameaca: "comum", x: 9, y, vida: 9 });
  const veDia = E.vereditoDoEsconder(tobias(), { grade: estrada, heroi, inimigos: [orc(9)], economia: { acao: 1 }, luz: luzDaLuta({ grade: estrada, heroi, noite: false }) });
  const veNoite = E.vereditoDoEsconder(tobias(), { grade: estrada, heroi, inimigos: [orc(9)], economia: { acao: 1 }, luz: luzDaLuta({ grade: estrada, heroi, noite: true }) });
  const vePerto = E.vereditoDoEsconder(tobias(), { grade: estrada, heroi, inimigos: [orc(7)], economia: { acao: 1 }, luz: luzDaLuta({ grade: estrada, heroi, noite: true }) });
  const veChuva = E.vereditoDoEsconder(tobias(), { grade: estrada, heroi, inimigos: [orc(7)], economia: { acao: 1 }, luz: luzDaLuta({ grade: estrada, heroi, noite: true, clima: "tempestade" }) });
  t("de dia, na estrada aberta, o bandido a 6 m vê-o: não há onde sumir", !veDia.pode && veDia.motivo === "a_descoberto");
  t("à noite, ao luar, o bandido a 6 m (o limiar da tabela) perde-o", veNoite.pode && veNoite.motivo === "sombra" && distanciaM(orc(9), heroi) === L.SOMBRA_QUE_ESCONDE.penumbra);
  t("ao luar, de perto (3 m), meia-luz ainda mostra o vulto", !vePerto.pode && vePerto.motivo === "a_descoberto");
  t("noite de tempestade: breu, esconde-se até a 3 m", veChuva.pode && veChuva.motivo === "sombra");
  const tav = montarGrade({ local: "taverna" });
  t("na taverna à noite, os candeeiros mostram-no", luzEm(luzDaLuta({ grade: tav, heroi: { x: 5, y: 1 }, noite: true }), { x: 5, y: 1 }) === "clara");
  t("cá fora, com tochas na mochila, a tocha só se acende se ele a acender", (luzDaLuta({ grade: estrada, heroi, noite: true, tochas: 5 }) || {}).tocha === "sem"
    && gesto({ grade: estrada, heroi }, "acendo uma tocha", { tochas: 5 }).combate.tochaDoHeroi === "acesa");
}

/* ============================================================ */
sec("4. as tabelas são lidas de volta");
{
  const F = L.FONTES_DE_LUZ || {};
  t("a tocha do 5e: 6 m de luz e mais 6 m de meia-luz", F.tocha && F.tocha.brilhante === 6 && F.tocha.penumbra === 6);
  t("toda fonte tem os dois raios, positivos", Object.values(F).length >= 4 && Object.values(F).every((f) => f.brilhante > 0 && f.penumbra > 0 && f.nome));
  /* o raio vem da tabela: ponto a ponto, na borda de cada faixa */
  const g = montarGrade({ local: "estrada" });
  const fonte = { x: 0, y: 5 };
  const luzEstrada = (tipo) => luzDaLuta({ grade: g, noite: true, clima: "chuva", fontes: [{ ...fonte, tipo }] });
  let bordas = true;
  for (const [tipo, f] of Object.entries(F)) {
    const l = luzEstrada(tipo);
    for (let x = 0; x < 18; x++) {
      const d = distanciaM(fonte, { x, y: 5 });
      const espera = d <= f.brilhante ? "clara" : d <= f.brilhante + f.penumbra ? "penumbra" : "escuro";
      if (luzEm(l, { x, y: 5 }) !== espera) bordas = false;
    }
  }
  t("cada fonte ilumina exatamente o raio da tabela (18 casas × 5 fontes)", bordas);
  t("os três degraus, em ordem", JSON.stringify(L.NIVEIS_DE_LUZ) === JSON.stringify(["escuro", "penumbra", "clara"]));
  t("a sombra esconde: no escuro sempre, na meia-luz a partir de 6 m, na luz nunca",
    L.SOMBRA_QUE_ESCONDE && L.SOMBRA_QUE_ESCONDE.escuro === 0 && L.SOMBRA_QUE_ESCONDE.penumbra === 6 && L.SOMBRA_QUE_ESCONDE.clara === null);
  /* a parede corta a luz: no corredor, a tocha do outro lado do muro não chega */
  const atras = luzDaLuta({ grade: masm, emMasmorra: true, fontes: [{ x: 0, y: 6, tipo: "tocha" }] });
  t("parede corta a luz como corta o olhar", ehParede(masm, 0, 7) && luzEm(atras, { x: 0, y: 8 }) === "escuro" && luzEm(atras, { x: 0, y: 5 }) === "clara");
  /* nenhum número solto: depois das tabelas, só 0 e 1 no código */
  const fonteTxt = tenta(() => readFileSync(join(AQUI, "..", "src", "luz.js"), "utf8"), "");
  const codigo = fonteTxt.slice(fonteTxt.indexOf("/* ---------------- LEITURA")).replace(/\/\*[\s\S]*?\*\//g, "").replace(/"[^"\n]*"/g, '""').replace(/`[^`]*`/g, "``").replace(/\/[^/\n]+\/[a-z]*/g, "");
  const soltos = (codigo.match(/(?<![\w.])\d+(\.\d+)?(?![\w])/g) || []).filter((n) => n !== "0" && n !== "1");
  t(`nenhuma constante de regra no meio das funções${soltos.length ? " — " + soltos.join(", ") : ""}`, !!fonteTxt && soltos.length === 0);
  /* a visão no escuro das raças sai da mesma linha da frase da criação */
  const comVisao = RACAS.filter((r) => r.efeito && r.efeito.veNoEscuro);
  t("as seis raças do 5e com visão no escuro, 18 m", comVisao.map((r) => r.nome).sort().join(",") === ["Anão", "Elfo", "Gnomo", "Meio-elfo", "Meio-orc", "Tiefling"].sort().join(",") && comVisao.every((r) => r.efeito.veNoEscuro === 18));
  t("…e a frase da criação diz o mesmo número (a raça não promete o que não faz)", comVisao.every((r) => r.traco.includes(`vê no escuro a ${r.efeito.veNoEscuro} m`) || r.traco.includes(`Vê no escuro a ${r.efeito.veNoEscuro} m`)));
  t("quem não a tem, não a promete", RACAS.filter((r) => !(r.efeito && r.efeito.veNoEscuro)).every((r) => !/no escuro/i.test(r.traco)));
  t("tracos.js é a porta da raça", tenta(() => T.veNoEscuroDeTraco({ raca: "Anao" }), 0) === 18 && tenta(() => T.veNoEscuroDeTraco({ raca: "Humano" }), -1) === 0);
}

/* ============================================================ */
sec("5. 300 lutas semeadas: determinística, e nunca esconde de quem enxerga");
{
  const CENARIOS = Object.keys(PLANTAS);
  const BICHOS = CRIATURAS_FANTASIA.map((c) => c.nome);
  const umaLuta = (i) => {
    const r = rng(hashSemente(`luz-e-sombra|${i}`));
    const pega = (l) => l[Math.floor(r() * l.length)];
    /* metade das lutas na masmorra: é lá que a luz decide */
    const cen = r() < 0.5 ? "masmorra" : pega(CENARIOS);
    const grade = montarGrade({ emMasmorra: cen === "masmorra", local: cen });
    const p = PLANTAS[grade.cenario];
    const livre = () => { for (;;) { const x = Math.floor(r() * p.largura), y = Math.floor(r() * p.altura); if (!ehParede(grade, x, y)) return { x, y }; } };
    const heroi = livre();
    /* metade dos bichos sem olhos para o escuro (o lobo, o bandido), para a
       sombra ter de quem esconder */
    const inimigos = Array.from({ length: 1 + Math.floor(r() * 3) }, (_, k) => ({ nome: `${r() < 0.5 ? pega(["Lobo", "Bandido", "Lobo Atroz", "Cultista"]) : pega(BICHOS)}${k ? " " + (k + 1) : ""}`, ameaca: "comum", vida: 5, ...livre() }));
    const aliados = r() < 0.4 ? [{ nome: "Iracema", ...livre(), ...(r() < 0.5 ? { luz: "tocha" } : {}) }] : [];
    const ctx = { grade, heroi, inimigos, aliados, emMasmorra: cen === "masmorra", noite: r() < 0.5, clima: r() < 0.3 ? "chuva" : "",
      tochas: r() < 0.7 ? 3 : 0, tochaDoHeroi: pega([undefined, "baixada", "acesa"]), pers: { raca: pega(RACAS).nome } };
    const luz = luzDaLuta(ctx);
    const ve = E.vereditoDoEsconder(tobias(), { grade, heroi, inimigos, aliados, economia: { acao: 1 }, luz });
    const semLuz = E.vereditoDoEsconder(tobias(), { grade, heroi, inimigos, aliados, economia: { acao: 1 } });
    return { ctx, luz, ve, semLuz };
  };
  const N = 300;
  let iguais = 0, nuncaDeQuemVe = 0, nuncaNaLuz = 0, monotono = 0, sombras = 0, farois = 0, noEscuro = 0, nasceConcorda = 0;
  for (let i = 0; i < N; i++) {
    const a = umaLuta(i), b = umaLuta(i);
    if (JSON.stringify({ v: a.ve, l: { ...a.luz, grade: null } }) === JSON.stringify({ v: b.ve, l: { ...b.luz, grade: null } })) iguais++;
    const { grade, heroi, inimigos } = a.ctx;
    /* quem olha sem nada no meio, e o que vê */
    const olham = inimigos.filter((e) => linhaDeVisao(grade, e, heroi));
    const abrigo = temCobertura(grade, heroi.x, heroi.y);
    const deQuemVe = a.ve.motivo === "sombra" && olham.some((e) => veNoEscuro(e) > 0 && distanciaM(e, heroi) <= veNoEscuro(e));
    if (!deQuemVe) nuncaDeQuemVe++;
    if (!(a.ve.motivo === "sombra" && luzEm(a.luz, heroi) === "clara")) nuncaNaLuz++;
    /* a luz só ACRESCENTA abrigo: o que podia sem ela, pode com ela pelo mesmo motivo */
    if ((!a.semLuz.pode || (a.ve.pode && a.ve.motivo === a.semLuz.motivo)) && (a.ve.pode || !a.semLuz.pode)) monotono++;
    if (a.ve.motivo === "sombra") sombras++;
    if (a.ve.motivo === "farol") farois++;
    if (a.ve.motivo === "no_escuro") noEscuro++;
    const ns = E.nascerEscondido(tobias(), { total: 40, grade, heroi, inimigos, luz: a.luz });
    if (ns.ok === a.ve.pode && (ns.ok ? ns.motivo === a.ve.motivo : ns.motivo === a.ve.motivo || ns.motivo === "todos_veem") && !abrigo === !abrigo) nasceConcorda++;
  }
  t(`mesma semente, mesmo veredito e mesma luz (${iguais}/${N})`, iguais === N);
  t(`nunca esconde na sombra de quem enxerga no escuro ao alcance (${nuncaDeQuemVe}/${N})`, nuncaDeQuemVe === N);
  t(`nunca esconde na sombra quem está na luz (${nuncaNaLuz}/${N})`, nuncaNaLuz === N);
  t(`a luz só acrescenta abrigo, nunca o tira (${monotono}/${N})`, monotono === N);
  t(`o nascer concorda com o veredito (${nasceConcorda}/${N})`, nasceConcorda === N);
  t(`a varredura exercita os três caminhos novos (sombra ${sombras}, farol ${farois}, no escuro ${noEscuro})`, sombras >= 15 && farois >= 5 && noEscuro >= 15);
}

/* ============================================================ */
sec("6. o herói que enxerga no escuro");
{
  const anao = { ...tobias(), raca: "Anão" };
  const comb = { ...combDaSessao(), tochaDoHeroi: "baixada" };
  const luz = luzDaLuta({ ...comb, emMasmorra: true, tochas: 3, pers: anao });
  t("os olhos do herói vêm da raça (18 m)", luz && luz.olhosDoHeroi === 18 && veNoEscuro(anao) === 18);
  t("ele vê o Lobo no escuro, a 12 m", porQueVe(luz, { ...anao, ...noFundo }, lobo()) === "olhos");
  t("…e o humano não o vê", porQueVe(luz, { ...tobias(), ...noFundo }, lobo()) === null);
  const ve = E.vereditoDoEsconder(anao, { ...comb, luz });
  t("e continua a esconder-se na sombra de quem não a tem", ve.pode && ve.motivo === "sombra");
  const pa = paraPauta(luz, { heroi: noFundo, inimigos: [lobo()] });
  t("a pauta diz a verdade dos dois lados: \"Lobo não vê no escuro; eu vejo no escuro até 18 m\"", /Lobo não vê no escuro; eu vejo no escuro até 18 m\./.test(pa), pa);
  const paH = paraPauta(luzDe(comb), { heroi: noFundo, inimigos: [lobo()] });
  t("o humano lê \"Lobo não vê no escuro; eu não\"", /Lobo não vê no escuro; eu não\.$/.test(paH), paH);
}

/* ============================================================ */
sec("7. lixo, null e imutabilidade");
{
  t("luzDaLuta(null) não estoura e é clara de dia", tenta(() => fn(L, "luzDaLuta")(null).ambiente, null) === "clara");
  t("luzEm sem mapa é clara (a regra de antes)", tenta(() => fn(L, "luzEm")(null, { x: 1, y: 1 }), null) === "clara");
  t("veNoEscuro(null/{}/\"x\") = 0", [null, {}, "x", 7].every((x) => veNoEscuro(x) === 0));
  t("veNoEscuro com número explícito manda, e negativo vira 0", veNoEscuro({ nome: "Lobo", veNoEscuro: 9 }) === 9 && veNoEscuro({ nome: "Goblin", veNoEscuro: -3 }) === 0);
  t("o gesto sem combate não estoura", tenta(() => fn(L, "aplicarGestoDaLuz")(null, FRASE, null).gesto, "erro") === null);
  t("o gesto com texto lixo não estoura", tenta(() => fn(L, "aplicarGestoDaLuz")({}, null, {}).gesto, "erro") === null);
  t("a pauta sem mapa é vazia, e com tudo claro também", paraPauta(null, null) === "" && paraPauta(luzDaLuta({ grade: montarGrade({ local: "estrada" }), heroi: noFundo }), { heroi: noFundo, inimigos: [lobo()] }) === "");
  t("o veredito com luz lixo cai na regra de antes", tenta(() => E.vereditoDoEsconder(tobias(), { ...combDaSessao(), luz: "x" }).motivo, null) === "a_descoberto");
  const comb = combDaSessao();
  const congelado = JSON.stringify(comb);
  const luz = luzDe(comb);
  const luzAntes = JSON.stringify({ ...luz, grade: null });
  E.vereditoDoEsconder(tobias(), { ...comb, luz });
  E.nascerEscondido(tobias(), { total: 25, grade: masm, heroi: noFundo, inimigos: comb.inimigos, luz });
  tenta(() => fn(L, "semATochaDoHeroi")(luz));
  t("nada recebido é mutado (o combate e o mapa)", JSON.stringify(comb) === congelado && JSON.stringify({ ...luz, grade: null }) === luzAntes);
  const pers = tobias();
  const ns = E.nascerEscondido(pers, { total: 25, grade: masm, heroi: noFundo, inimigos: [lobo()], luz: luzDe({ ...comb, tochaDoHeroi: "baixada" }) });
  t("a ficha recebida fica sem o estado; a nova o tem", ns.ok && pers.condicoes.length === 0 && E.estadoEscondido(ns.pers));
  t("sem a sombra, o estado não ganha o campo novo (save de antes, letra a letra)",
    !("sombra" in E.estadoEscondido(E.nascerEscondido(tobias(), { total: 25, grade: masm, heroi: { x: 3, y: 15 }, inimigos: [lobo()] }).pers)));
}

/* ============================================================ */
sec("8. a pauta: 500 lutas semeadas, a luz nunca tira o que importa");
{
  const { textoDaPauta, porNaPauta, SECOES, TETO_DA_PAUTA, cederNaCena } = P;
  const secLuz = SECOES.find((s) => s.id === "luz") || null;
  const prioLuz = secLuz ? secLuz.prio : 0; /* sem a seção (HEAD), nada corta depois dela e a prova falha por si */
  const prios = Object.fromEntries(SECOES.map((s) => [s.id, s.prio]));
  t("a seção A LUZ existe, e corta depois do veto, do desfecho, da planta, de quem está e do contra",
    !!secLuz && secLuz.prio > prios.naoPode && secLuz.prio > prios.masmorra && secLuz.prio > prios.quem && secLuz.prio > prios.contra && secLuz.prio > prios.desfecho);
  const PAL = "lobo goblin câmara tocha corrente pedra sombra porta passagem fundo sala mordida lâmina escudo grito correntes eco breu calor".split(" ");
  const texto = (r, min, max) => {
    const alvo = min + Math.floor(r() * (max - min + 1));
    let s = "";
    while (s.length < alvo) s += (s ? " " : "") + PAL[Math.floor(r() * PAL.length)];
    return s.slice(0, alvo).trim();
  };
  const N = 500;
  let iguais = 0, chega = 0, teto = 0;
  for (let i = 0; i < N; i++) {
    const r = rng(hashSemente(`luz-pauta|${i}`));
    const talvez = (pr) => r() < pr;
    let p = porNaPauta({}, "onde", texto(r, 40, 95), texto(r, 15, 25), "comporta: " + texto(r, 110, 210));
    p = porNaPauta(p, "masmorra", texto(r, 120, 260));
    p = porNaPauta(p, "naoPode", ...Array.from({ length: 1 + Math.floor(r() * 3) }, () => texto(r, 80, 200)));
    for (const [id, pr, min, max] of [["gente", 0.8, 40, 120], ["contra", 0.6, 50, 130], ["momento", 0.4, 60, 160], ["fala", 0.35, 60, 200],
      ["antes", 0.7, 100, 180], ["acabou", 0.3, 60, 150], ["quem", 0.3, 30, 90], ["vilao", 0.2, 60, 140], ["aliado", 0.3, 60, 120]]) if (talvez(pr)) p = porNaPauta(p, id, texto(r, min, max));
    const escolha = talvez(0.4) ? "nao_letal" : "letal";
    const alvo = aplicarEscolha({ nome: "Lobo", vida: 2 }, escolha, { semente: `luz|${i}` });
    const env = envelopeDoGolpeFinal({ alvo, escolha, heroi: "Tobias Varzim", comoFez: texto(r, 1, 240) });
    if (talvez(0.5)) p = golpeFinalNaPauta(p, env);
    p = cederNaCena(p, { luta: true, masmorra: true });
    /* a linha da luz, como o App a monta: uma luta de masmorra com o Lobo */
    const comb = { ...combDaSessao(), tochaDoHeroi: talvez(0.5) ? "baixada" : undefined, inimigos: talvez(0.5) ? [lobo(), goblin()] : [lobo()] };
    const linha = paraPauta(luzDe(comb), { heroi: comb.heroi, inimigos: comb.inimigos });
    const sem = textoDaPauta(p, { turno: i + 1 });
    const com = textoDaPauta(porNaPauta(p, "luz", linha), { turno: i + 1 });
    /* tudo o que corta antes da luz chega igual, linha por linha */
    const importantes = Object.entries(P.garantirPauta(p)).filter(([id]) => (prios[id] ?? 99) < prioLuz).flatMap(([, ls]) => ls).filter((l) => sem.includes(l));
    if (linha && importantes.every((l) => com.includes(l))) iguais++;
    if (com.includes(linha)) chega++;
    if (com.length <= TETO_DA_PAUTA) teto++;
  }
  t(`desfecho, frase, vetos, planta e o resto que corta antes chegam iguais com a luz (${iguais}/${N})`, iguais === N);
  t(`o teto nunca passa (${teto}/${N})`, teto === N);
  /* esta é uma pauta de ESTRESSE (a de teste-como-chega, mais a planta da
     masmorra): metade das lutas já passa do teto antes da luz. A prio é a
     mais barata que ainda ganha da gente, do vilão e do aliado, e por isso
     ali ela cede — é o preço escrito de não tirar o contra nem quem está. */
  t(`a linha da luz chega numa pauta de estresse em ${chega}/${N} (o piso medido é 150)`, chega >= 150, `${chega}`);
  console.log(`      (a linha da luz chegou em ${chega}/${N}; prio ${secLuz && secLuz.prio})`);

  /* E NA PAUTA DE VERDADE: a da chamada 68 da sessão 3 (M30), remontada
     como teste-como-chega a remonta (o ONDE da câmara, a gente, o veto do
     lugar e o golpe final com a frase da Iracema), já com a economia a ceder
     na luta. Com a linha da luz, tudo o que chegava chega, e a luz também. */
  const ONDE = ["em câmara das correntes · calor opressivo · (aqui isto é um forte)", "⌖ O13 74,0 · 61,0",
    "comporta: brigar de perto, um de cada vez, e usar o próprio corpo como porta; sumir sem se esforçar, passar por quem está a dois passos; segurar a passagem sozinho, e obrigar a conversa a acabar aqui"];
  const FRASE_M30 = "Iracema deixa-o vir, gira por baixo da mordida e quebra-lhe o pescoço com o calcanhar, num estalo seco que a câmara inteira ouve.";
  let p30 = porNaPauta({}, "onde", ...ONDE);
  p30 = porNaPauta(p30, "gente", "Iracema Sousa conta a coisa inteira, e conta de uma vez");
  p30 = porNaPauta(p30, "naoPode", "o lugar não comporta: cercar por vários lados, correr, recuar sem virar as costas; mirar de longe, reconhecer um rosto, ler; fugir sem passar por quem está no caminho");
  const env30 = envelopeDoGolpeFinal({ alvo: aplicarEscolha({ nome: "Lobo", vida: 1 }, "letal", { semente: "mm16" }), escolha: "letal", heroi: "Iracema Sousa", comoFez: FRASE_M30 });
  p30 = golpeFinalNaPauta(p30, env30);
  const linha30 = paraPauta(luzDe({ ...combDaSessao(), tochaDoHeroi: "baixada" }), { heroi: noFundo, inimigos: [lobo()] });
  const txt30 = textoDaPauta(porNaPauta(p30, "luz", linha30), { turno: 24 });
  t("na pauta da chamada 68 (M30): a frase do golpe, o fato, o veto e o lugar chegam, e a luz também",
    txt30.includes(FRASE_M30) && txt30.includes(env30.acabou[0]) && txt30.includes(ONDE[0]) && txt30.includes("o lugar não comporta") && txt30.includes(linha30) && txt30.length <= TETO_DA_PAUTA,
    `${txt30.length}`);
  const exemplo = paraPauta(luzDe({ ...combDaSessao(), tochaDoHeroi: "baixada" }), { heroi: noFundo, inimigos: [lobo()] });
  t("a linha é curta (≤ 200) e não fala de si", exemplo.length > 0 && exemplo.length <= 200 && !/sistema|mapa|n[ií]vel|penumbra|tabela/i.test(exemplo), exemplo);
}

/* ============================================================ */
sec("9. a fiação no App, lida pelo texto do código");
{
  const app = tenta(() => readFileSync(join(AQUI, "..", "src", "App.jsx"), "utf8"), "");
  t("o App importa o módulo", /import \{ luzDaLuta, aplicarGestoDaLuz, luzParaPauta \} from "\.\/luz\.js";/.test(app));
  t("o mapa da luta sai dos refs vivos (tochas, masmorra, hora, clima, ficha), em try/calou",
    /const luzDaLutaAgora = \(comb\) => \{\s*try \{[\s\S]{0,700}?luzDaLuta\(\{[\s\S]{0,400}?tochaDoHeroi: c\.tochaDoHeroi, tochas: tochasAgora\(\)[\s\S]{0,300}?noite: ehNoite\(minutoRef\.current\)[\s\S]{0,200}?pers: fichaViva\(\)[\s\S]{0,80}?\} catch \(e\) \{ calou\("a luz da luta", e\)/.test(app));
  const iGesto = app.indexOf('calou("o gesto da luz"');
  const iVeredito = app.indexOf("const ve = vereditoDoEsconder(");
  t("o gesto da luz vem logo depois do ato que revela, em try/calou", iGesto > 0 && /calou\("revelarPorAto", e\); \}\s*\/\*[\s\S]{0,400}?try \{\s*if \(combateRef\.current\) \{\s*const gl = aplicarGestoDaLuz\(combateRef\.current, acao,/.test(app));
  t("…e ANTES do veredito do esconder (a mesma frase baixa e esconde)", iGesto > 0 && iVeredito > iGesto);
  t("o veredito do esconder recebe a luz", /vereditoDoEsconder\(fichaViva\(\) \|\| personagem, \{[\s\S]{0,300}?luz: luzDaLutaAgora\(combH\)/.test(app));
  t("o nascer recebe o mesmo mapa", /nascerEscondido\(baseEsc, \{[\s\S]{0,200}?luz: combEsc \? luzDaLutaAgora\(combEsc\) : null/.test(app));
  t("quem me vê e o achar na vez do mundo também", /quemMeVe\(p, \{[^}]*luz: luzDaLutaAgora\(\) \}\)/.test(app) && /revisarEscondido\(persBase, \{[^\n]*luz: luzDaLutaAgora\(/.test(app));
  t("a linha da luz entra na pauta só na luta, em try/calou", /if \(combateRef\.current\) p = porNaPauta\(p, "luz", luzParaPauta\(luzDaLutaAgora\(\),[\s\S]{0,160}?\} catch \(e\) \{ calou\("luzParaPauta", e\); \}/.test(app));
  t("o campo novo do save é só combate.tochaDoHeroi (o combate já vai inteiro no save), e o App só o escreve pelo gesto",
    /combate: combateRef\.current, registro:/.test(app) && !/tochaDoHeroi\s*=[^=]|tochaDoHeroi: (?!c\.tochaDoHeroi)/.test(app) && /combateRef\.current = gl\.combate; setCombate\(gl\.combate\)/.test(app));
}

console.log(`\nluz e sombra: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
