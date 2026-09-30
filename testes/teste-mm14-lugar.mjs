/* teste-mm14-lugar.mjs (Fase MM · MM14, o defeito nº 2) — onde a heroína está

   A sessão de prova (MM11, `mente/mm11-sessao.md`) viu o lugar da heroína e
   o da narração separarem-se cinco vezes. Esta suíte reproduz cada uma com o
   texto da transcrição — todas FALHAM em HEAD de 30/09 (v9.334) e passam
   depois — e varre os 24 mundos da MM13 com frases de deslocação reais.

     T10  "Eu vou à torre caída buscar a Branca… Venha comigo" (entre aspas)
          fez a viagem sozinho — consertado na MM14 (1), provado aqui outra vez.
     T17  "vou até à bancada de ervas … «Cheirou a sal?»" levou-a ao Cais do
          Sal: meio nome dentro da fala.
     T18  "Saio pelo portão e vou a pé até ao Poço de Sal" não saiu: nada se
          registou, e o Mestre foi recusado por a tirar do cais.
     T21  "Entro no galpão … com a lâmina à frente" abriu uma masmorra.
     T42  a mesma nota levou "continuo LÁ [no galpão]" e "AGORA estou no Sino
          Calado".
     T43  "Sino Calado" (sem artigo) virou "FORA DA CIDADE"; e "aqui em Foz do
          Meio?" contou como pedido de voltar à cidade.
     T47  "Desço ao salão com a lâmina à cintura" abriu outra masmorra.

   A causa das duas masmorras é uma só, e vale a pena dizê-la no topo: em
   JavaScript o `\b` é de ASCII, "lâmina" tem uma fronteira de palavra
   antes de "mina", e "mina" é covil (rastro.js).

   As secções: 1. as tabelas · 2. os casos da sessão · 3. a varredura ·
   4. lixo, null e a imutabilidade. Tudo por semente. Os imports são por
   espaço de nomes: em HEAD os nomes novos não existem, e a suíte tem de
   falhar asserção a asserção, não num import. */
import * as L from "../src/lugar.js";
import * as R from "../src/rastro.js";
import { gerarGeografia } from "../src/geografia.js";
import { MOLDES } from "../src/moldes.js";
import { generosDisponiveis } from "../src/nomes.js";
import { locaisDaCidade, masmorrasDoMundo } from "../src/mundo-base.js";
import { arredoresDaCidade } from "../src/arredores.js";
import { comodosDoLocal } from "../src/comodos.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const tenta = (f, d = null) => { try { return f(); } catch { return d; } };
const semA = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim().replace(/^(o|a|os|as)\s+/, "");

/* Em HEAD os nomes novos não existem: a MEDIÇÃO usa o que o App fazia
   então, escrito aqui, para contar o defeito em vez de estourar. */
const distancia = typeof L.distanciaNaCidade === "function" ? L.distanciaNaCidade
  /* o App de HEAD (`registrarLugar`): local da cidade letra a letra, senão o texto */
  : (n, c = {}) => ((c.locais || []).some((l) => String(l.nome || l).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim() === String(n).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim()) ? "dentro" : L.distanciaPorTexto(n));
const umSoLugar = typeof L.umSoLugar === "function" ? L.umSoLugar : (s) => String(s || "");
/* o sinal "masmorra:" do Narrador abria sem pergunta nenhuma */
const porta = typeof R.portaDaMasmorra === "function" ? R.portaDaMasmorra : () => ({ ok: true });

/* ============================================================
   Os dados da sessão (a transcrição)
   ============================================================ */
const FOZ = "Foz do Meio";
const SINO = { nome: "O Sino Calado", tipo: "taverna", onde: "dentro" };
const CAIS = { nome: "O Cais do Sal", tipo: "docas", onde: "dentro" };
const CAMPO = { nome: "O Campo das Mães", tipo: "cemitério", onde: "dentro" };
const TORRE = { nome: "a torre caída", tipo: "ruína", onde: "arredores", minutos: 84 };
const COMODOS_SINO = [
  { nome: "o salão", onde: "comodo", dentroDe: "O Sino Calado" },
  { nome: "o quarto de cima", onde: "comodo", dentroDe: "O Sino Calado" },
  { nome: "o porão", onde: "comodo", dentroDe: "O Sino Calado" },
];
const NA_CIDADE = [SINO, CAIS, CAMPO, TORRE];
const J10 = "Volto para a mesa do Teodoro … \"Eu vou à torre caída buscar a Branca. Mas não conheço o caminho nem a Branca. Venha comigo — o senhor conhece-a, e ela confia em quem conhece.\" Olho-o nos olhos.";
const J17 = "Deixo o Teodoro a falar sozinho e vou até à bancada de ervas. … \"Cheirou a sal? O que queres dizer com isso — e tu quem és?\"";
const J18 = "\"Obrigada, Lino.\" Deixo-lhe uma moeda na banca. Tenho até ao pôr do sol. Saio pelo portão e vou a pé até ao Poço de Sal, a sudeste, para ver com os meus olhos quem anda a mexer na mina.";
const J21 = "Não respondo ao Teodoro. Entro no galpão devagar, com a lâmina à frente e as costas junto à parede, e deixo os olhos habituarem-se ao escuro. O que há lá dentro?";
const J43 = "Antes de subir, viro-me para a Rosalina: \"Hoje de manhã tocaram três pancadas fora de hora. Para que toca o sino assim, aqui em Foz do Meio?\"";
const J47 = "Desço ao salão com a lâmina à cintura e sento-me num canto, de costas para a parede … Peço um caldo à Rosalina e fico a ver quem entra.";
const CIDADES = [FOZ, "Alto do Sal", "Campo das Cinco Torres"];
const RASTRO = { cidadeAtual: FOZ, cidades: CIDADES };
const QUARTO = L.definirLugar("o quarto de cima", { cidade: FOZ, distancia: "dentro", dentroDe: "O Sino Calado" });
const SALAO = L.definirLugar("o salão", { cidade: FOZ, distancia: "dentro", dentroDe: "O Sino Calado" });
const GALPAO = L.definirLugar("o galpão do cais", { cidade: FOZ, distancia: "dentro" });

/* ============================================================ */
sec("1. as tabelas");
{
  const s = L.SAIDA_DOS_MUROS || {};
  t("a saída dos muros é um lugar com nome, nos arredores, a minutos", !!s.nome && s.minutos > 0 && s.minutos <= 15 && s.rx instanceof RegExp);
  t("e sabe quando a frase é de estrada (e aí não é passo)", s.estrada instanceof RegExp && s.estrada.test("rumo a alto do sal"));
  t("há palavras que só podem ser campo", L.RX_FORA_DOS_MUROS instanceof RegExp && L.RX_FORA_DOS_MUROS.test("a fazenda de jessa"));
  t("e nenhuma delas é de interior", !(L.RX_FORA_DOS_MUROS instanceof RegExp && L.RX_FORA_DOS_MUROS.test("o salao")));
  t("os envelopes de lugar estão listados", (L.ENVELOPES_DE_LUGAR || []).length >= 3 && L.ENVELOPES_DE_LUGAR.every((e) => /^\[.*\]$/.test(e)));
}

/* ============================================================ */
sec("2. os casos da sessão");
{
  t("T10 · o convite entre aspas não move", L.lugarPedido(J10, NA_CIDADE) === null);
  const r17 = L.lugarPedido(J17, NA_CIDADE);
  t("T17 · ir à banca ao lado não muda de bairro (o \"sal\" era da fala)", !r17 || r17.nome !== CAIS.nome, JSON.stringify(r17));

  const r18 = L.lugarPedido(J18, NA_CIDADE);
  t("T18 · \"Saio pelo portão\" sai: do lado de fora dos portões", !!r18 && r18.onde === "arredores" && r18.saida === true, JSON.stringify(r18));
  t("T18 · e não volta a pedir o cais", !r18 || r18.nome !== CAIS.nome);
  t("T18 · e o Mestre que a tira do cais já não é recusado", L.pediuParaVoltar(J18, FOZ) === true);
  t("T18 · e não abre estrada nenhuma (não há destino de estrada)", R.detectarPartida(J18, RASTRO) === null);
  const comArredor = L.lugarPedido("Saio pelo portão e vou até a torre caída.", NA_CIDADE);
  t("sair pelo portão para um lugar de fora vai a esse lugar", !!comArredor && comArredor.nome === TORRE.nome, JSON.stringify(comArredor));

  t("T21 · entrar no galpão com a lâmina na mão não abre masmorra", R.detectarEntradaEmMasmorra(J21, RASTRO) === null);
  t("T47 · descer ao salão com a lâmina à cintura não abre masmorra", R.detectarEntradaEmMasmorra(J47, { ...RASTRO, lugar: QUARTO }) === null);
  const r47 = L.lugarPedido(J47, [...COMODOS_SINO, ...NA_CIDADE]);
  t("T47 · descer ao salão é ir ao salão do mesmo prédio", !!r47 && r47.nome === "o salão" && r47.onde === "comodo", JSON.stringify(r47));
  t("T47 · e o sinal do Narrador não abre masmorra num cômodo", porta({ nome: "" }, { ...RASTRO, lugar: SALAO, masmorras: [] }).ok === false);
  t("T21 · nem num galpão da cidade", porta({ nome: "" }, { ...RASTRO, lugar: GALPAO, masmorras: [] }).ok === false);

  const nota42 = [
    "[LUGAR — RECUSADO PELO SISTEMA] Você me tirou de onde eu estava — o galpão do cais — sem que eu tenha dito que saio. O SISTEMA registra que eu continuo LÁ.",
    "[MOVIMENTO — REGISTRADO PELO SISTEMA] Eu me desloquei dentro de Foz do Meio e AGORA estou n'O Sino Calado.",
  ].join("\n");
  const so = umSoLugar(nota42);
  t("T42 · a nota leva uma versão só do lugar, a última", !/continuo LÁ/.test(so) && /AGORA estou/.test(so), so);

  const antes = L.definirLugar("O Sino Calado", { cidade: FOZ, distancia: "dentro" });
  const dito = L.definirLugar("Sino Calado", { cidade: FOZ, distancia: distancia("Sino Calado", { locais: NA_CIDADE, comodos: COMODOS_SINO }) });
  t("T43 · \"Sino Calado\" sem artigo é o mesmo lugar", L.ehOMesmoLugar(dito, antes) === true);
  t("T43 · e está dentro dos muros", dito.distancia === "dentro" && !/FORA DA CIDADE/.test(L.linhaDeLugar(dito)), L.linhaDeLugar(dito).slice(0, 50));
  t("T43 · perguntar \"aqui em Foz do Meio?\" não é pedir para voltar", L.pediuParaVoltar(J43, FOZ) === false);
  t("o galpão do cais (dito pelo Mestre, dentro dos muros) não é \"arredores\"", distancia("o galpão do cais", { locais: NA_CIDADE, foraDosMuros: false }) === "dentro");
  t("mas a fazenda de Jessa é", distancia("a fazenda de Jessa", { locais: NA_CIDADE, foraDosMuros: false }) === "arredores");
  t("e um lugar sem nome conhecido, com o herói já lá fora, é de fora", distancia("o celeiro", { locais: NA_CIDADE, foraDosMuros: true }) === "arredores");

  /* regressão: a viagem, a masmorra e o passo de verdade */
  t("a viagem de verdade continua: \"Parto para Alto do Sal\"", (R.detectarPartida("Parto para Alto do Sal.", RASTRO) || {}).destino === "Alto do Sal");
  t("\"Saio pelo portão rumo a Alto do Sal\" é estrada, não passo", L.lugarPedido("Saio pelo portão rumo a Alto do Sal.", NA_CIDADE) === null && (R.detectarPartida("Saio pelo portão rumo a Alto do Sal.", RASTRO) || {}).destino === "Alto do Sal");
  t("\"sigo para fora dos portões\" continua a abrir a estrada", !!R.detectarPartida("Sigo para fora dos portões.", RASTRO) && L.lugarPedido("Sigo para fora dos portões.", NA_CIDADE) === null);
  const poco = { nome: "O Poço de Sal", tipo: "mina" };
  const noPoco = L.definirLugar("o Poço de Sal", { cidade: FOZ, distancia: "arredores" });
  const mmPoco = R.detectarEntradaEmMasmorra("Entro no Poço de Sal com a tocha acesa.", { ...RASTRO, lugar: noPoco, masmorras: [poco] });
  t("a masmorra do mundo abre, com o nome dela", !!mmPoco && mmPoco.nome === "O Poço de Sal", JSON.stringify(mmPoco));
  t("e o sinal do Narrador também, no lugar dela", porta({ nome: "" }, { ...RASTRO, lugar: noPoco, masmorras: [poco] }).ok === true);
  t("fora dos muros, o covil improvisado continua a abrir", !!R.detectarEntradaEmMasmorra("Desço na Cripta de Malgar.", { cidadeAtual: "", cidades: CIDADES }));
  t("\"Vou até o Sino Calado\" é um passo dentro dos muros", (L.lugarPedido("Vou até o Sino Calado.", NA_CIDADE) || {}).onde === "dentro" && R.detectarPartida("Vou até o Sino Calado.", RASTRO) === null);
}

/* ============================================================
   3. A VARREDURA — 24 mundos (6 géneros × 4 moldes), a primeira cidade
   ============================================================ */
sec("3. a varredura: frases de deslocação reais");
const GENEROS = generosDisponiveis();
const MUNDOS = [];
for (const g of GENEROS) for (const Mo of MOLDES) {
  const semente = `Sonda MM13|${g}|${Mo.id}`;
  const mapa = gerarGeografia(semente, Mo);
  MUNDOS.push({ semente, genero: g, molde: Mo, mapa, cidade: mapa.cidades[0] });
}
{
  const c = { passos: 0, viagensPorPasso: 0, passosPerdidos: 0, comodos: 0, masmorraPorComodo: 0, sinalPorComodo: 0,
    saidas: 0, saidasPerdidas: 0, perguntas: 0, perguntasQueMovem: 0, dosMundo: 0, dosMundoPerdidas: 0,
    nomes: 0, arredoresDentro: 0, arredoresPerdidos: 0, turnos: 0, duasVersoes: 0 };
  const ex = {};
  const nota = (k, s) => { (ex[k] = ex[k] || []).length < 3 && ex[k].push(s); };
  MUNDOS.forEach((w, wi) => {
    const cid = w.cidade;
    const locais = locaisDaCidade(w.semente, cid, w.genero, w.molde);
    const arred = arredoresDaCidade(w.semente, cid);
    const dentro = locais.map((l) => ({ ...l, onde: "dentro" }));
    const fora = arred.map((a) => ({ ...a, onde: "arredores" }));
    const lugares = [...dentro, ...fora];
    const rastro = { cidadeAtual: cid.nome, cidades: w.mapa.cidades.map((x) => x.nome) };
    const masmorras = masmorrasDoMundo(w.semente, w.mapa).filter((m) => m.cidadeProxima === cid.nome);

    /* o passo na cidade: nunca estrada, sempre o lugar pedido */
    for (const l of dentro) for (const f of [`Vou até ${l.nome}.`, `Caminho até ${l.nome} e peço uma cerveja.`]) {
      c.passos++;
      if (R.detectarPartida(f, rastro)) { c.viagensPorPasso++; nota("viagem", f); }
      const r = L.lugarPedido(f, lugares);
      if (!r || r.nome !== l.nome) { c.passosPerdidos++; nota("passo", `${f} → ${r ? r.nome : "nada"}`); }
    }
    /* o cômodo: é o prédio, nunca masmorra — nem pela frase, nem pelo sinal */
    for (const l of dentro.slice(0, 4)) {
      const cs = tenta(() => comodosDoLocal(w.semente, l, w.genero, w.molde), []) || [];
      const noPredio = L.definirLugar(l.nome, { cidade: cid.nome, distancia: "dentro" });
      for (const q of cs) {
        const noComodo = L.definirLugar(q.nome, { cidade: cid.nome, distancia: "dentro", dentroDe: l.nome });
        for (const f of [`Desço ${L.comA(q.nome)} com a lâmina à cintura.`, `Entro ${L.comEm(q.nome)} com a lâmina na mão.`, `Subo ${L.comA(q.nome)}.`]) {
          c.comodos++;
          if (R.detectarEntradaEmMasmorra(f, { ...rastro, lugar: noPredio, masmorras })) { c.masmorraPorComodo++; nota("comodo", `${l.nome} › ${f}`); }
        }
        c.comodos++;
        if (porta({ nome: "" }, { ...rastro, lugar: noComodo, masmorras }).ok) { c.sinalPorComodo++; nota("sinal", `${l.nome} › ${q.nome}`); }
      }
    }
    /* para fora: "saio pelo portão" sai, com ou sem destino lá fora */
    for (const f of ["Saio pelo portão.", "Saio da cidade a pé.", "Atravesso os portões e sigo o muro.", "Deixo a cidade pelo portão do sul.",
      ...fora.slice(0, 2).map((a) => `Saio pelo portão e vou até ${a.nome}.`)]) {
      c.saidas++;
      const r = L.lugarPedido(f, lugares);
      if (!r || r.onde !== "arredores") { c.saidasPerdidas++; nota("saida", `${f} → ${r ? `${r.nome} (${r.onde})` : "nada"}`); }
    }
    /* a pergunta não move */
    for (const l of [...dentro.slice(0, 3), ...fora.slice(0, 2)]) for (const f of [`Onde fica ${l.nome}?`, `Como chego até ${l.nome}?`, `Posso ir até ${l.nome}?`, `Quanto tempo leva até ${l.nome}?`]) {
      c.perguntas++;
      if (L.lugarPedido(f, lugares) || R.detectarPartida(f, rastro) || R.detectarEntradaEmMasmorra(f, rastro)) { c.perguntasQueMovem++; nota("pergunta", f); }
    }
    /* a masmorra de verdade: estando à boca dela, entrar abre-a, com o nome dela */
    for (const m of masmorras) {
      const boca = L.definirLugar(m.nome, { cidade: cid.nome, distancia: "arredores" });
      c.dosMundo++;
      const r = R.detectarEntradaEmMasmorra(`Entro em ${m.nome} com a tocha acesa.`, { ...rastro, lugar: boca, masmorras });
      const s = porta({ nome: "" }, { ...rastro, lugar: boca, masmorras });
      if (!r || !s.ok || (typeof R.portaDaMasmorra === "function" && (semA(r.nome) !== semA(m.nome) || semA(s.nome) !== semA(m.nome)))) { c.dosMundoPerdidas++; nota("mundo", `${m.nome} → ${JSON.stringify(r)} / ${JSON.stringify(s)}`); }
    }
    /* "arredores" só fora dos muros: todo nome de dentro (local, cômodo, o que
       o Mestre inventa junto dele, e o mesmo sem artigo) é dentro; todo arredor é fora */
    const ctxDentro = { locais: dentro, comodos: [], arredores: fora, masmorras, foraDosMuros: false };
    for (const l of dentro) {
      for (const n of [l.nome, l.nome.replace(/^(o|a|os|as)\s+/i, ""), `o galpão ${L.comDe(l.nome)}`, `os fundos ${L.comDe(l.nome)}`]) {
        c.nomes++;
        if (distancia(n, ctxDentro) !== "dentro") { c.arredoresDentro++; nota("arredores", n); }
      }
    }
    for (const a of fora) { c.nomes++; if (distancia(a.nome, ctxDentro) !== "arredores") { c.arredoresPerdidos++; nota("fora", a.nome); } }
    /* duas versões na pauta: o que sobra do turno anterior + o que este turno decide */
    const env = [
      `[LUGAR — RECUSADO PELO SISTEMA] Você me tirou de onde eu estava — ${(dentro[0] || {}).nome} — sem que eu tenha dito que saio. O SISTEMA registra que eu continuo LÁ.`,
      `[CORREÇÃO DE LUGAR — REGISTRO DO SISTEMA] Você me devolveu a ${cid.nome}, e eu não pedi para voltar.`,
      `[MOVIMENTO — REGISTRADO PELO SISTEMA] Eu me desloquei dentro de ${cid.nome} e AGORA estou ${L.comEm((dentro[1] || dentro[0] || {}).nome || "")}.`,
    ];
    for (let mask = 1; mask < 8; mask++) {
      const linhas = ["[INFO] outra coisa qualquer", ...env.filter((_, i) => mask & (1 << i)), "[RELÓGIO] mais uma"];
      c.turnos++;
      const saiu = umSoLugar(linhas.join("\n"));
      const n = saiu.split("\n").filter((x) => (L.ENVELOPES_DE_LUGAR || ["[LUGAR —", "[MOVIMENTO —", "[CORREÇÃO DE LUGAR"]).some((e) => x.startsWith(e.slice(0, 10)))).length;
      if (n > 1) { c.duasVersoes++; nota("versoes", `${wi}/${mask}`); }
      if (!saiu.includes("[INFO] outra coisa qualquer") || !saiu.includes("[RELÓGIO] mais uma")) { c.duasVersoes++; nota("versoes", `${wi}/${mask}: comeu o resto`); }
    }
  });
  console.log(`       passos na cidade: ${c.passos} · viraram estrada ${c.viagensPorPasso} · perdidos ${c.passosPerdidos}`);
  console.log(`       cômodos: ${c.comodos} · masmorras pela frase ${c.masmorraPorComodo} · pelo sinal ${c.sinalPorComodo}`);
  console.log(`       saídas pelo portão: ${c.saidas} · perdidas ${c.saidasPerdidas} · perguntas: ${c.perguntas} · que movem ${c.perguntasQueMovem}`);
  console.log(`       masmorras do mundo: ${c.dosMundo} · perdidas ${c.dosMundoPerdidas}`);
  console.log(`       nomes: ${c.nomes} · "arredores" dentro dos muros ${c.arredoresDentro} · arredor dado como dentro ${c.arredoresPerdidos}`);
  console.log(`       turnos: ${c.turnos} · com duas versões do lugar ${c.duasVersoes}`);
  const x = (k) => (ex[k] || []).join(" | ");
  t(`0 viagens por um passo de cidade (${c.viagensPorPasso}/${c.passos})`, c.viagensPorPasso === 0, x("viagem"));
  t(`e todo passo leva ao lugar pedido (${c.passos - c.passosPerdidos}/${c.passos})`, c.passosPerdidos === 0, x("passo"));
  t(`0 masmorras por um cômodo, pela frase (${c.masmorraPorComodo})`, c.masmorraPorComodo === 0, x("comodo"));
  t(`0 masmorras por um cômodo, pelo sinal do Narrador (${c.sinalPorComodo})`, c.sinalPorComodo === 0, x("sinal"));
  t(`toda saída pelo portão sai (${c.saidas - c.saidasPerdidas}/${c.saidas})`, c.saidasPerdidas === 0, x("saida"));
  t(`nenhuma pergunta move (${c.perguntasQueMovem}/${c.perguntas})`, c.perguntasQueMovem === 0, x("pergunta"));
  t(`toda masmorra do mundo abre, com o nome dela (${c.dosMundo - c.dosMundoPerdidas}/${c.dosMundo})`, c.dosMundo > 0 && c.dosMundoPerdidas === 0, x("mundo"));
  t(`0 "arredores" dentro dos muros (${c.arredoresDentro})`, c.arredoresDentro === 0, x("arredores"));
  t(`e todo arredor continua fora (${c.arredoresPerdidos})`, c.arredoresPerdidos === 0, x("fora"));
  t(`0 turnos com duas versões do lugar (${c.duasVersoes}/${c.turnos})`, c.duasVersoes === 0, x("versoes"));
}

/* ============================================================ */
sec("4. lixo, null e a imutabilidade");
{
  t("lugarPedido com lixo é null", tenta(() => L.lugarPedido(null, null) === null && L.lugarPedido("Saio pelo portão.", null).saida === true, false));
  t("distanciaNaCidade com lixo não quebra", tenta(() => ["dentro", "arredores"].includes(L.distanciaNaCidade(null, null)), false));
  t("umSoLugar com lixo é texto vazio", tenta(() => L.umSoLugar(null) === "" && L.umSoLugar(undefined) === "", false));
  t("portaDaMasmorra com lixo diz sim (o de sempre)", tenta(() => R.portaDaMasmorra(undefined, null).ok === true, false));
  t("pediuParaVoltar com lixo é falso", L.pediuParaVoltar(null, null) === false && L.pediuParaVoltar("[PASSAR O TEMPO] NÃO me leve de volta à cidade", "Foz") === false);
  const lista = [...COMODOS_SINO, ...NA_CIDADE]; const antes = JSON.stringify(lista);
  L.lugarPedido(J18, lista); L.lugarPedido(J47, lista);
  t("lugarPedido não muta a lista que recebe", JSON.stringify(lista) === antes);
}

/* A FIAÇÃO — por texto, fim de linha normalizado. */
{
  const { readFileSync } = await import("node:fs");
  const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");
  t("fiação: a distância de um lugar novo decide-se por distanciaNaCidade", app.includes("return distanciaNaCidade(cru, {"));
  t("fiação: a nota do turno passa por umSoLugar", app.includes("umSoLugar(notaRef.current)"));
  t("fiação: os dois contextos do rastro levam o lugar e as masmorras do mundo", app.split("emViagem: !!jornadaRef.current, lugar: lugarRef.current, masmorras:").length - 1 >= 2);
  t("fiação: o sinal masmorra do Narrador passa por portaDaMasmorra", app.includes("const pm = portaDaMasmorra({ nome: arg }") && !app.includes("sinalMasmorraRef.current = arg || \"\";"));
}

console.log(`\nmm14-lugar: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
