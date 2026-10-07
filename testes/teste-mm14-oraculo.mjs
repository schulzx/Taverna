/* teste-mm14-oraculo.mjs (Fase MM · MM14, o resto do nº 6) — o que o mundo
   já decidiu não se rola

   Na prova jogada da MM14 (4) — `mente/diario.md`, o bloco "perguntar é de
   graça" — "Maren, há quanto tempo a senhora tem essa taverna?" foi ao
   oráculo (`[PERGUNTA AO MUNDO]`, um d100) em vez da ficha. O diário pôs a
   culpa no registo ("a taverneira ainda não estava registada"); a causa é
   outra, e está no sinal:

     · `ehPerguntaAoMundo` (oraculo.js) lia só o COMEÇO da frase à procura de
       pergunta aberta, e o começo era o chamamento ("Maren,"); "há quanto",
       "que horas", "de onde" nunca foram abertas. Uma pergunta sem sim nem
       não ia a um dado de sim ou não;
     · e o sinal não perguntava a ficha nenhuma: a porta do oráculo (turno.js,
       `PORTAS_DO_TURNO`, `fase: "atalho"`, `intercepta: true`) resolve o turno
       ANTES de a pauta existir — a ficha da gente, que teria respondido
       ("Maren está no posto há N anos"), nunca chegou a correr.

   O registo não era o problema: a gente da base da casa entra na ficha da
   gente pelo nome, registada ou não (secção 2). O que faltava era a pessoa
   chamada SEM nome — "a senhora", "a taverneira" — ao balcão da casa onde a
   heroína está (secção 4).

   Secções: 0. o mundo da sessão · 1. as tabelas · 2. a causa, com a frase
   da prova · 3. a regra: o que a ficha decide vai à pauta, o que ninguém
   decidiu vai ao d100 · 4. a pessoa da casa onde se está · 5. a sessão MM11 ·
   6. a varredura das 157 da sonda, antes → depois · 7. o turno do oráculo
   ainda leva a ficha · 8. lixo, null, determinismo e imutabilidade ·
   9. a fiação — a asserção de verdade: o App passa as fichas ao sinal.
      Tudo por semente, sem rede. */
import fs from "node:fs";
import {
  ehPerguntaAoMundo, PERGUNTA_ABERTA, ABERTA_NO_FIM, A_FICHA_DECIDE, TIPOS, tipoDaPergunta,
  envelopeDoOraculo, consultar,
} from "../src/oraculo.js";
import { fraseDoJogador, juntarRespostas } from "../src/perguntas.js";
import { fichaParaPauta } from "../src/cidade-por-dentro.js";
import { genteParaPauta, TRATAMENTOS } from "../src/gente-por-dentro.js";
import { mercadoresDaCidade, mercadoParaPauta } from "../src/mercado.js";
import { locaisDaCidade, genteDoLocal } from "../src/mundo-base.js";
import { decidirTurno } from "../src/turno.js";
import { CASOS } from "./sonda-da-mesa-casos.mjs";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);

/* ============================================================
   0. O mundo da sessão — o mesmo de teste-mm14-perguntas.mjs (a semente da
   campanha, o mapa da transcrição, o léxico mínimo que dá às casas de Foz os
   nomes da sessão). A taverneira do Sino Calado é Mabel (na sessão, com o
   léxico da IA, chamou-se Rosalina; na prova jogada da MM14 (4), Maren).
   ============================================================ */
const SEM = "Prova da Mesa|Fantasia medieval";
const G = "Fantasia medieval";
const REGIOES = [
  { nome: "Margens", bioma: "costa", cx: 86, cy: 57 },
  { nome: "Salinas", bioma: "costa", cx: 80, cy: 54 },
  { nome: "Campos", bioma: "planicie", cx: 60, cy: 42 },
];
const CIDADES = [
  { nome: "Foz do Meio", porte: "cidade", bioma: "costa", regiao: "Margens", x: 87, y: 57, descoberta: true },
  { nome: "Alto do Sal", porte: "cidade", bioma: "costa", regiao: "Salinas", x: 82, y: 54 },
  { nome: "Campo Grande", porte: "cidade", bioma: "planicie", regiao: "Campos", x: 60, y: 40 },
  { nome: "Vila Maria", porte: "vila", bioma: "planicie", regiao: "Campos", x: 66, y: 46 },
];
const MAPA = { regioes: REGIOES, cidades: CIDADES, rotas: [{ de: "Foz do Meio", para: "Alto do Sal", dias: 5 }] };
const FOZ = CIDADES[0];
const PARES = { taverna: ["O Sino Calado", "A Porta Aberta"], docas: ["O Cais do Sal", "O Cais Velho"], mercado: ["Campo das Cinco Torres", "A Praça do Sal"] };
const lugaresLex = Object.entries(PARES).map(([tipo, nomes]) => ({ tipo, nomes }));
for (let i = 0; i < lugaresLex.length; i++) {
  const l = lugaresLex[i];
  const deu = locaisDaCidade(SEM, FOZ, G, null, { lugares: lugaresLex }).find((x) => x.tipo === l.tipo);
  if (deu && deu.nome !== PARES[l.tipo][0]) lugaresLex[i] = { tipo: l.tipo, nomes: [...l.nomes].reverse() };
}
const LEX = { lugares: lugaresLex };
const LOCAIS = locaisDaCidade(SEM, FOZ, G, null, LEX);
const SINO_CALADO = LOCAIS.find((l) => l.tipo === "taverna");
const DA_TAVERNA = genteDoLocal(SEM, SINO_CALADO, G, null, LEX);
const semAc = (x) => String(x || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const TAVERNEIRA = DA_TAVERNA.find((p) => /taverneir/.test(semAc(p.papel)));
const MUSICO = DA_TAVERNA.find((p) => /music/.test(semAc(p.papel)));
const primeiro = (n) => String(n).split(/\s+/)[0];
const T = primeiro(TAVERNEIRA.nome), M = MUSICO.nome;
const NPCS = {
  [TAVERNEIRA.nome]: { nome: TAVERNEIRA.nome, papel: TAVERNEIRA.papel, local: FOZ.nome, status: "vivo", genero: TAVERNEIRA.genero_pessoa || "" },
  [MUSICO.nome]: { nome: MUSICO.nome, papel: MUSICO.papel, local: FOZ.nome, status: "vivo", genero: MUSICO.genero_pessoa || "" },
  "Isolina do Lamento": { nome: "Isolina do Lamento", papel: "carpideira", local: "O Campo das Mães", status: "vivo", genero: "mulher" },
  "Branca da Troca": { nome: "Branca da Troca", papel: "estudante", local: FOZ.nome, status: "vivo", genero: "mulher" },
};
const NA_TAVERNA = Object.values(NPCS);
const NO_SINO = { nome: SINO_CALADO.nome, cidade: FOZ.nome, distancia: "dentro" };
/* a prova jogada: a taverneira AINDA NÃO REGISTADA, ninguém em cena */
const SEM_REGISTO = { npcs: {}, presentes: [] };

/* As três fichas como a pauta as monta (App.jsx, pautaDoTurno) — e o que o
   sinal do oráculo passa a receber. */
const fichas = (frase, { npcs = NPCS, presentes = NA_TAVERNA, lugar = NO_SINO, recentes = [], grupo = [], base = null, dia = 1, minuto = 12 * 60 } = {}) => {
  const nomes = [...Object.keys(npcs), lugar ? lugar.nome : ""].filter(Boolean);
  return {
    cidade: fichaParaPauta(FOZ, { semente: SEM, mapa: MAPA, lex: LEX, genero: G, dia, minuto, frase, nomes }),
    gente: genteParaPauta({ semente: SEM, mapa: MAPA, cidade: FOZ.nome, genero: G, lex: LEX, npcs, presentes, grupo, base, heroi: "Iara do Vau", recentes, lugar, dia, minuto, frase, nomes }),
    mercado: mercadoParaPauta(mercadoresDaCidade(FOZ, dia, 1, LEX), frase, { onde: FOZ.nome }),
  };
};
const linhas = (f) => juntarRespostas([f.cidade, f.gente, f.mercado]);
/* o sinal como o App o passa a pedir: as fichas só correm se a frase é
   mesmo pergunta fechada (a função é preguiçosa) */
const aoOraculo = (frase, o) => ehPerguntaAoMundo(frase, { fichas: () => fichas(frase, o) });

/* O DETECTOR DE ANTES (v9.339), copiado para a medida — é contra ele que a
   varredura da secção 6 conta o "antes". Não é código do jogo. */
const ANTIGO = (texto) => {
  const tx = String(texto || "").trim();
  if (!tx || tx.length < 6 || tx.length > 200) return false;
  if (!/\?\s*$/.test(tx)) return false;
  if (/^\s*(o que|quem|onde|quando|como|por que|porque|quanto|qual)\b/i.test(tx)) return false;
  return true;
};

sec("0. o mundo reconstruído é o da sessão");
t("a taverna de Foz é O Sino Calado, com uma taverneira e um músico na base", SINO_CALADO && SINO_CALADO.nome === "O Sino Calado" && !!TAVERNEIRA && !!MUSICO,
  DA_TAVERNA.map((p) => `${p.nome}/${p.papel}`).join(", "));
t("a taverneira é mulher e responde pela casa (o primeiro ofício do lugar)", semAc(TAVERNEIRA.genero_pessoa) === "mulher" && /taverneir/.test(semAc(SINO_CALADO.papeis[0])));

/* ============================================================ */
sec("1. as tabelas");
{
  t("a pergunta aberta é uma regex ancorada e lida sem acento", PERGUNTA_ABERTA instanceof RegExp && PERGUNTA_ABERTA.source.startsWith("^") && PERGUNTA_ABERTA.test("ha quanto tempo") && !PERGUNTA_ABERTA.test("há quanto tempo"));
  t("\"há quanto\", \"desde quando\", \"que horas\", \"de onde\" são abertas", ["ha quanto tempo", "desde quando", "que horas sao", "de onde vens", "faz quanto tempo", "a quantos passos"].every((x) => PERGUNTA_ABERTA.test(x)));
  t("a aberta no fim: \"fica onde?\", \"foi por quê?\"", ABERTA_NO_FIM.test("isso fica onde") && ABERTA_NO_FIM.test("isso foi por que") && !ABERTA_NO_FIM.test("isso fica aberto"));
  /* MM17 C2: a lista do mundo ganhou "horizonte" (as terras de além de uma
     campanha com região, masmorra-sem-cidade.js) — é ficha de forma das
     coisas como as outras três, e o d100 não pode desmentir o mapa. A
     asserção continua exata (a lista inteira, na ordem); só cresceu a
     verdade que ela guarda. */
  t("o que a ficha decide, por tipo de pergunta: todas no mundo; só o mercado no social; nenhuma no perigo",
    JSON.stringify(A_FICHA_DECIDE.mundo) === JSON.stringify(["cidade", "gente", "mercado", "horizonte"]) && JSON.stringify(A_FICHA_DECIDE.social) === JSON.stringify(["mercado"]) && A_FICHA_DECIDE.perigo.length === 0);
  t("e os tipos da tabela são os do oráculo (TIPOS)", Object.keys(A_FICHA_DECIDE).every((k) => TIPOS[k]) && Object.keys(TIPOS).every((k) => A_FICHA_DECIDE[k]));
  t("o tratamento diz o sexo de quem ouve: \"a senhora\" mulher, \"o senhor\" homem, \"você\" ninguém",
    TRATAMENTOS.find((x) => x.rx.test("a senhora tem"))?.genero === "mulher" && TRATAMENTOS.find((x) => x.rx.test("o senhor toca"))?.genero === "homem" && TRATAMENTOS.find((x) => x.rx.test("voce trabalha"))?.genero === "");
}

/* ============================================================ */
sec("2. a causa, com a frase da prova");
{
  const PROVA = "Maren, há quanto tempo a senhora tem essa taverna?";
  t("antes: a frase da prova ia ao oráculo (o começo era o chamamento)", ANTIGO(PROVA));
  t("e sem o chamamento também ia (\"há quanto\" nunca foi aberta)", ANTIGO("Há quanto tempo a senhora tem essa taverna?"));
  t("e a porta do oráculo resolve o turno antes da pauta (atalho que intercepta)", decidirTurno({ ehPerguntaAoMundo: true }).id === "oraculo" && decidirTurno({ ehPerguntaAoMundo: true }).intercepta === true);
  t("agora: é pergunta aberta, não vai ao d100 — com fichas ou sem", !ehPerguntaAoMundo(PROVA) && !aoOraculo(PROVA, SEM_REGISTO));
  t("e \"Pergunto à Maren: há quanto tempo…?\" — a oração que pergunta é a de depois dos dois-pontos", !ehPerguntaAoMundo("Pergunto à Maren: há quanto tempo a senhora tem essa taverna?"));
  /* o registo não era o problema: a gente da base entra pelo nome */
  const pelaBase = fichas(`${T}, há quanto tempo a senhora tem essa taverna?`, SEM_REGISTO);
  t(`${T} SEM REGISTO é achada pela base da casa, pelo nome: a ficha dá o posto`, pelaBase.gente.pergunta.some((l) => l.startsWith(`${TAVERNEIRA.nome} está no posto há`)), pelaBase.gente.pergunta.join(" | "));
  /* e quem ninguém conhece não se adivinha */
  const maren = fichas(PROVA, SEM_REGISTO);
  t("\"Maren\" (que o mundo não tem) não recebe a ficha de outra pessoa", maren.gente.pergunta.length === 0, maren.gente.pergunta.join(" | "));
  const marenConversa = fichas(PROVA, { npcs: NPCS, presentes: NA_TAVERNA, recentes: [`${M} dedilha o alaúde ao canto.`] });
  t("nem a do último citado da conversa (o \"a senhora\" não cai no músico)", marenConversa.gente.pergunta.length === 0, marenConversa.gente.pergunta.join(" | "));
  const marenSo = fichas(PROVA, { npcs: NPCS, presentes: [NPCS[MUSICO.nome]] });
  t("nem a da única pessoa em cena", marenSo.gente.pergunta.length === 0, marenSo.gente.pergunta.join(" | "));
}

/* ============================================================ */
sec("3. a regra: o que a ficha decide vai à pauta; o que ninguém decidiu, ao d100");
{
  const decididas = [
    [`${T}, a senhora já era assim quando abriu a casa?`, "gente (o jeito)", /o jeito:/],
    [`A senhora já era assim quando abriu a casa?`, "gente, sem nome (a casa onde se está)", new RegExp(`^${TAVERNEIRA.nome}, o jeito:`)],
    [`${T} está de folga hoje?`, "gente (a rotina)", new RegExp(`^${TAVERNEIRA.nome}:`)],
    [`Tem curandeiro nesta cidade?`, "cidade (quem cura)", /^quem cura:/],
    [`Aqui todo mundo fala a mesma língua que eu?`, "cidade (a língua)", /^língua:/],
    [`Este lugar tem quartos para esta noite?`, "cidade (o pouso)", /^pouso:/],
    [`Vocês vendem adagas aqui?`, "mercado — \"vende\" é social, e a banca decide", /adaga/],
  ];
  for (const [f, de, rx] of decididas) {
    const fi = fichas(f, SEM_REGISTO);
    const l = linhas(fi);
    t(`"${f}" — ${de}: na pauta, e não ao oráculo`, ANTIGO(f) && ehPerguntaAoMundo(f) && !aoOraculo(f, SEM_REGISTO) && l.some((x) => rx.test(x)), `${tipoDaPergunta(f)} · ${l.join(" | ")}`);
  }
  const ninguem = ["vai chover amanhã?", "o guarda aceita suborno?", "há alguém escondido no beco?", "o guarda é subornável?", "tem uma saída pelos fundos?", "será que ele acredita em mim?"];
  for (const f of ninguem) t(`"${f}" — ninguém decidiu: continua a ir ao oráculo`, aoOraculo(f) && aoOraculo(f, SEM_REGISTO));
  /* a razão do tipo: a ficha da lei acende pelo "guarda", e não diz se ESTE
     guarda se vende */
  const suborno = linhas(fichas("o guarda aceita suborno?"));
  t("\"o guarda aceita suborno?\" acende a lei da cidade, e mesmo assim rola (é social: a disposição de alguém)", suborno.some((l) => /^quem guarda a lei:/.test(l)) && tipoDaPergunta("o guarda aceita suborno?") === "social" && aoOraculo("o guarda aceita suborno?"));
  t("sem fichas, o sinal é o de sempre (pergunta fechada → oráculo)", ehPerguntaAoMundo("Tem curandeiro nesta cidade?") && ehPerguntaAoMundo("Vocês vendem adagas aqui?"));
  t("e a porta do turno obedece ao sinal: com a ficha a responder, o turno vai à cena", decidirTurno({ ehPerguntaAoMundo: aoOraculo("Tem curandeiro nesta cidade?") }).id === "cena");
}

/* ============================================================ */
sec("4. a pessoa da casa onde se está — achada sem registo, pelo tratamento ou pelo ofício");
{
  const posto = (f, o = SEM_REGISTO) => fichas(f, o).gente.pergunta.join(" | ");
  t("\"Há quanto tempo a senhora tem essa taverna?\" ao balcão do Sino: a taverneira", posto("Há quanto tempo a senhora tem essa taverna?").startsWith(`${TAVERNEIRA.nome} está no posto há`), posto("Há quanto tempo a senhora tem essa taverna?"));
  t("\"Senhora, há quanto tempo tem essa taverna?\" (o chamamento é tratamento, não nome)", posto("Senhora, há quanto tempo tem essa taverna?").startsWith(`${TAVERNEIRA.nome} está no posto há`), posto("Senhora, há quanto tempo tem essa taverna?"));
  t("\"Há quanto tempo o músico toca aqui?\": o ofício escolhe", posto("Há quanto tempo o músico toca aqui?").startsWith(`${M} está no posto há`), posto("Há quanto tempo o músico toca aqui?"));
  t("\"Há quanto tempo a taverneira tem esta casa?\": o ofício, sem tratamento", posto("Há quanto tempo a taverneira tem esta casa?").startsWith(`${TAVERNEIRA.nome} está no posto há`));
  const homem = posto("Há quanto tempo o senhor tem essa taverna?");
  t("\"o senhor\" não é a taverneira — e sem ninguém que responda pela casa nesse sexo, não se escolhe", !homem.includes(TAVERNEIRA.nome), homem);
  t("sem chamar ninguém (nem tratamento nem ofício), a casa não responde por si", posto("Há quanto tempo tem essa taverna?") === "");
  t("fora de uma casa (na rua), ninguém é \"a senhora\" do balcão", posto("Há quanto tempo a senhora tem essa taverna?", { ...SEM_REGISTO, lugar: null }) === "");
  const noGrupo = posto("Há quanto tempo a senhora tem essa taverna?", { ...SEM_REGISTO, grupo: [{ nome: TAVERNEIRA.nome }] });
  t("quem anda no grupo da heroína não é a gente da casa", !noGrupo.startsWith(`${TAVERNEIRA.nome} está no posto`), noGrupo);
  const morta = posto("Há quanto tempo a senhora tem essa taverna?", { ...SEM_REGISTO, base: { mortos: [TAVERNEIRA.nome] } });
  t("nem quem morreu", !morta.startsWith(`${TAVERNEIRA.nome} está no posto`), morta);
  /* o que já valia continua a valer: o nome e a conversa ganham da casa */
  const pelaConversa = posto(`Há quanto tempo a senhora tem essa taverna?`, { npcs: NPCS, presentes: NA_TAVERNA, recentes: [`${M} pousa o alaúde.`, `${TAVERNEIRA.nome} enxuga a caneca.`] });
  t("com a conversa a apontar para alguém, é esse (o pronome ganha da casa)", pelaConversa.startsWith(`${TAVERNEIRA.nome} está no posto há`), pelaConversa);
  const pelaCena = fichas(`${primeiro(M)}, há quanto tempo tocas aqui?`, SEM_REGISTO).gente.pergunta[0] || "";
  t("pelo nome, a gente da base, mesmo de outro ofício", pelaCena.startsWith(`${M} está no posto há`), pelaCena);
}

/* ============================================================ */
sec("5. a sessão MM11 — nenhuma pergunta com resposta na ficha vai ao oráculo");
{
  const txt = fs.readFileSync(new URL("../mente/mm11-sessao.md", import.meta.url), "utf8").replace(/\r\n/g, "\n").split("\n");
  const frases = [];
  for (let i = 0; i < txt.length; i++) {
    const m = txt[i].match(/^\*\*(J\d+)\*\* — (.*)$/);
    if (!m) continue;
    let s = m[2];
    for (let k = i + 1; k < txt.length && txt[k].trim() && !/^[`*>#]/.test(txt[k]); k++) s += " " + txt[k].trim();
    frases.push({ j: m[1], frase: s.replace(/Rosalina/g, T).replace(/Teodoro/g, primeiro(M)) });
  }
  t(`as ${frases.length} falas da heroína lidas da transcrição`, frases.length >= 25);
  const antes = frases.filter((x) => ANTIGO(x.frase)).map((x) => x.j);
  const depois = frases.filter((x) => aoOraculo(x.frase)).map((x) => x.j);
  console.log(`      ao oráculo — antes: ${antes.join(", ") || "nenhuma"} · depois: ${depois.join(", ") || "nenhuma"}`);
  t("nenhuma fala da sessão com resposta na ficha vai ao oráculo", frases.every((x) => !(aoOraculo(x.frase) && linhas(fichas(x.frase)).length && A_FICHA_DECIDE[tipoDaPergunta(x.frase)].length)));
  t("J21 (\"…O que há lá dentro?\") deixa de ir: a última oração é aberta", antes.includes("J21") && !depois.includes("J21"));
  t("e nenhuma fala entrou no oráculo que antes não ia", depois.every((j) => antes.includes(j)));
  /* as doze da MM14 (4), pela frase sem aspas no fim — a forma em que o
     oráculo as apanharia: a que a ficha responde não vai */
  const doze = [
    `Há quanto tempo a senhora tem o Sino Calado?`,
    `E quem mais trabalha aqui, além de você?`,
    `Que família manda aqui, e o que se diz dela?`,
    `Quanto custa uma adaga boa, equilibrada para lançar?`,
    `O Poço de Sal, a sudeste — a quantos passos daqui fica?`,
    `Há quanto tempo tocas aqui no Sino, ${primeiro(M)}? E de onde vens?`,
    `Para que toca o sino assim, aqui em Foz do Meio?`,
    `Que língua se fala mais por aqui? A comum serve?`,
  ];
  const foram = doze.filter((f) => aoOraculo(f));
  t("as perguntas da sessão, sem as aspas, também não vão ao oráculo", foram.length === 0, foram.join(" · "));
}

/* ============================================================
   6. A VARREDURA — as 157 perguntas da sonda da mesa (C1E1), cada uma dita
   na taverna cheia do mundo da sessão. "Com resposta nas fichas" é o
   veredito da própria sonda: `chega` por `fichaParaPauta`, `genteParaPauta`
   ou `mercadoParaPauta`.
   ============================================================ */
sec("6. a varredura das 157, antes → depois");
{
  const DA_FICHA = /cidade-por-dentro|gente-por-dentro|mercado\.js/;
  const daFicha = CASOS.filter((c) => c.veredito === "chega" && (DA_FICHA.test(c.via || "") || DA_FICHA.test(c.ondeVive || "")));
  const antes = daFicha.filter((c) => ANTIGO(c.pergunta));
  const depois = daFicha.filter((c) => aoOraculo(c.pergunta));
  console.log(`      ${daFicha.length} das 157 têm a resposta nas fichas; iam ao oráculo: antes ${antes.length} → depois ${depois.length}`);
  console.log(`      ainda vão: ${depois.map((c) => `#${c.n} [${tipoDaPergunta(c.pergunta)}]`).join(", ")}`);
  t("o número de antes é o medido na etapa (15)", antes.length === 15, String(antes.length));
  t(`depois: ${depois.length} (≤ 3)`, depois.length <= 3);
  /* os que ficam têm razão escrita */
  const n70 = CASOS.find((c) => c.n === 70);
  t("#70 (\"a rua é vigiada, dá pra passar sem ser visto?\") fica no oráculo por ser do instante (perigo) — e a ficha vai junto (secção 7)", tipoDaPergunta(n70.pergunta) === "perigo" && aoOraculo(n70.pergunta));
  const ela = [105, 106].map((n) => CASOS.find((c) => c.n === n));
  t("#105 e #106 (\"ela…\") ficam só sem conversa: com a conversa a nomear quem é \"ela\", vão à ficha",
    ela.every((c) => !aoOraculo(c.pergunta, { npcs: NPCS, presentes: NA_TAVERNA, recentes: [`${TAVERNEIRA.nome} enxuga a caneca.`] })));
  /* nada entra no oráculo que não entrava: a leitura nova só tira */
  const entraram = CASOS.filter((c) => !ANTIGO(c.pergunta) && aoOraculo(c.pergunta));
  t("nenhuma das 157 passou a ir ao oráculo", entraram.length === 0, entraram.map((c) => `#${c.n}`).join(", "));
  /* o que saiu do oráculo sem ter a resposta nas fichas: as abertas (não
     têm sim nem não) e as que alguma ficha responde. As "ninguém decide"
     que saíram por uma linha de ficha contam-se — é o custo da regra */
  const sairam = CASOS.filter((c) => ANTIGO(c.pergunta) && !aoOraculo(c.pergunta));
  const abertas = sairam.filter((c) => !ehPerguntaAoMundo(c.pergunta));
  const ninguemPorFicha = sairam.filter((c) => c.veredito === "ninguem-decide" && ehPerguntaAoMundo(c.pergunta));
  console.log(`      saíram do oráculo: ${sairam.length} (${abertas.length} abertas; ${sairam.length - abertas.length} por uma ficha, das quais ${ninguemPorFicha.length} "ninguém decide": ${ninguemPorFicha.map((c) => `#${c.n}`).join(", ")})`);
  t("as \"ninguém decide\" que uma ficha tira do oráculo são poucas (≤ 2)", ninguemPorFicha.length <= 2, ninguemPorFicha.map((c) => `#${c.n} ${c.pergunta}`).join(" · "));
}

/* ============================================================ */
sec("7. quando o oráculo rola, a ficha vai junto");
{
  const r = consultar("o guarda aceita suborno?", { emCidade: true }, { sorte: () => 0.9 });
  const env = envelopeDoOraculo(r);
  t("o envelope do oráculo devolve a frase do jogador (\"Eu perguntei\")", fraseDoJogador(env) === "o guarda aceita suborno?", fraseDoJogador(env));
  const fc = fichaParaPauta(FOZ, { semente: SEM, mapa: MAPA, lex: LEX, genero: G, dia: 1, minuto: 600, frase: env });
  t("e a pauta desse turno leva a lei da cidade junto do d100", fc.pergunta.some((l) => /^quem guarda a lei:/.test(l)), fc.pergunta.join(" | "));
  const reusado = envelopeDoOraculo({ ...r, reusado: true });
  t("também no \"já respondida\"", fraseDoJogador(reusado) === "o guarda aceita suborno?");
  t("mas \"Eu perguntei ao cadáver de…\" (Falar com os Mortos) não é a frase sobre a cidade", fraseDoJogador(`[FALAR COM OS MORTOS] Eu perguntei ao cadáver de Vela: "quem te matou?"`) === "");
  t("e o \"Eu disse\" do envelope social continua a valer", fraseDoJogador(`[SOCIAL] Eu disse: "Quanto custa?"`) === "Quanto custa?");
}

/* ============================================================ */
sec("8. lixo, null, determinismo e imutabilidade");
{
  let erro = "";
  for (const x of [undefined, null, "", 7, {}, [], "?", "   ", "[", "\u0000", "a,?", ",,,?", "Maren,?"]) {
    try {
      ehPerguntaAoMundo(x); ehPerguntaAoMundo(x, x); ehPerguntaAoMundo("tem curandeiro aqui?", { fichas: x });
      genteParaPauta({ semente: SEM, mapa: MAPA, cidade: FOZ.nome, genero: G, lex: LEX, npcs: x, presentes: x, grupo: x, lugar: x, recentes: x, frase: x });
    } catch (e) { erro = `${JSON.stringify(x)}: ${e.message}`; }
  }
  t("nenhum lixo derruba o sinal nem a ficha", !erro, erro);
  t("fichas que estouram não roubam o d100 (o sinal cai no de sempre)", ehPerguntaAoMundo("tem curandeiro aqui?", { fichas: () => { throw new Error("x"); } }));
  t("fichas vazias também não", ehPerguntaAoMundo("tem curandeiro aqui?", { fichas: { cidade: null, gente: { pergunta: [" "] }, mercado: {} } }));
  t("as fichas só correm quando a frase é pergunta fechada", (() => { let n = 0; ehPerguntaAoMundo("ataco o ogro", { fichas: () => { n++; return {}; } }); ehPerguntaAoMundo("quem está na sala?", { fichas: () => { n++; return {}; } }); return n === 0; })());
  const a = JSON.stringify(fichas("Há quanto tempo a senhora tem essa taverna?", SEM_REGISTO).gente);
  const b = JSON.stringify(fichas("Há quanto tempo a senhora tem essa taverna?", SEM_REGISTO).gente);
  t("a mesma frase na mesma semente dá a mesma pessoa", a === b && a.includes(TAVERNEIRA.nome));
  const congela = (o) => { Object.freeze(o); for (const v of Object.values(o)) if (v && typeof v === "object") congela(v); return o; };
  const npcs = congela(JSON.parse(JSON.stringify(NPCS)));
  const lugar = congela({ ...NO_SINO });
  const f = congela(fichas("Tem curandeiro nesta cidade?"));
  let mudou = "";
  try {
    genteParaPauta({ semente: SEM, mapa: MAPA, cidade: FOZ.nome, genero: G, lex: LEX, npcs, presentes: Object.values(npcs), lugar, frase: "Há quanto tempo a senhora tem essa taverna?" });
    ehPerguntaAoMundo("Tem curandeiro nesta cidade?", { fichas: f });
  } catch (e) { mudou = e.message; }
  t("o registo, o lugar e as fichas recebidos não são tocados", !mudou, mudou);
}

/* ============================================================
   9. A FIAÇÃO — informativa. O sinal `ehPerguntaAoMundo` no App.jsx
   (`sinaisDoTurno`) ainda o chama só com o texto; ligar as fichas é do
   `frontend`. Esta secção não reprova: diz o que vê. Quando a fiação
   entrar, a asserção passa a morar aqui.
   ============================================================ */
sec("9. a fiação no App.jsx — o sinal passa as fichas");
{
  const app = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");
  t("o App ainda importa o sinal do oráculo", /import \{[^}]*\behPerguntaAoMundo\b[^}]*\} from "\.\/oraculo\.js"/.test(app));
  /* o sinal do turno (sinaisDoTurno) chama ehPerguntaAoMundo com a frase E
     um `fichas` preguiçoso — a mesma fichasDaMesa que pautaDoTurno usa, só
     com a frase (sem `presentes`: o sinal roda antes do elenco da cena ter
     sido recalculado para este turno, e fichasDaMesa sabe calcular sozinha
     quando falta). */
  t("o App passa as fichas ao sinal: ehPerguntaAoMundo(acao, { fichas: () => fichasDaMesa(acao) })",
    /ehPerguntaAoMundo:\s*ler\(\(\)\s*=>\s*ehPerguntaAoMundo\(acao,\s*\{\s*fichas:\s*\(\)\s*=>\s*fichasDaMesa\(acao\)\s*\}\)\)/.test(app));
  t("e fichasDaMesa existe no App, como a função que junta as três fichas",
    /const fichasDaMesa = \(frase = "", presentes = null\) => \{/.test(app));
}

console.log(`\n${ok} ok · ${mal} falha(s)`);
if (mal) process.exit(1);
