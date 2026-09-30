/* teste-mm12-cidade.mjs (Fase MM · MM12) — a cidade por dentro

   A prova de `src/cidade-por-dentro.js` e das duas secções novas da Pauta
   (A CIDADE e PERGUNTOU). As perguntas de mesa que esta etapa responde
   (sonda da mesa, C1E1):
     #6   "aqui todo mundo fala a mesma língua que eu?"         → a língua
     #14  "quanto custa a diária?"  · #15 "cem pela semana?"    → o pouso
     #31  "tem gente que estuda magia arcana aqui?"            → as instituições
     #37  "chamam esse povo de cabeças-de-vento?" · #38         → a gíria
     #80  "ela me entrega isso de graça?"                      → a dádiva
     #107 "usamos algum distintivo para sermos reconhecidos?"  → o reconhecimento
     #110 "para que serve aquele sino tocando?"                → o hoje
     #70  "a rua inteira é vigiada?"                           → a vigilância

   Tudo por semente: nenhum `Math.random` decide uma asserção. */
import fs from "node:fs";
import {
  ESCALA_DO_PORTE, PORTES_MILITARES, LINGUA_DA_REGIAO, LINGUAS_DOS_POVOS, ALCANCE_DA_COMUM,
  PRECOS_DO_POUSO, INSTITUICOES, VIGILANCIA, RECONHECIMENTO, DADIVAS,
  APELIDOS_DE_FORA, APELIDOS_DE_OFICIO, EXPRESSOES, O_HOJE, SINOS,
  PERGUNTAS_DA_CIDADE, RESPOSTAS_POR_TURNO,
  fichaDaCidade, fichaParaPauta,
} from "../src/cidade-por-dentro.js";
import { PORTES, gerarGeografia } from "../src/geografia.js";
import { ECONOMIA_PROMPT } from "../src/economia.js";
import { GRUPOS_DE_RACA } from "../src/lexico.js";
import { locaisDaCidade } from "../src/mundo-base.js";
import { envelopeDoComercio } from "../src/comercio.js";
import { paraPauta as geografoParaPauta } from "../src/geografo.js";
import { SECOES, porNaPauta, textoDaPauta, TETO_DA_PAUTA } from "../src/pauta.js";
import { CASOS } from "./sonda-da-mesa-casos.mjs";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);

const SEM = "Sonda da Cidade|Fantasia medieval";
const G = "Fantasia medieval";
const MAPA = gerarGeografia(SEM, "sobremundo");
const ficha = (c, extra = {}) => fichaDaCidade(c, { semente: SEM, mapa: MAPA, genero: G, ...extra });
const pauta = (c, extra = {}) => fichaParaPauta(c, { semente: SEM, mapa: MAPA, genero: G, dia: 2, minuto: 10 * 60, ...extra });
const doPorte = (porte) => MAPA.cidades.find((c) => c.porte === porte);
const pergunta = (n) => CASOS.find((c) => c.n === n).pergunta;

/* ============================================================ */
sec("1. as tabelas");
{
  const semEscala = Object.keys(PORTES).filter((p) => !Number.isFinite(ESCALA_DO_PORTE[p]));
  t("todo porte de PORTES tem escala", semEscala.length === 0, semEscala.join(","));
  t("a escala do sobremundo é o peso de mundo-base (aldeia 1, vila 2, fortaleza 3, cidade 4, capital 5)",
    ESCALA_DO_PORTE.aldeia === 1 && ESCALA_DO_PORTE.vila === 2 && ESCALA_DO_PORTE.fortaleza === 3 && ESCALA_DO_PORTE.cidade === 4 && ESCALA_DO_PORTE.capital === 5);
  t("os portes militares são de escala 3", PORTES_MILITARES.every((p) => ESCALA_DO_PORTE[p] === 3));
  for (const [nome, tab] of Object.entries({ ALCANCE_DA_COMUM, VIGILANCIA, RECONHECIMENTO, ...Object.fromEntries(Object.entries(INSTITUICOES).map(([k, v]) => [`INSTITUICOES.${k}`, v])) })) {
    t(`${nome} cobre as escalas 1 a 5`, [1, 2, 3, 4, 5].every((e) => tab[e]));
  }
  t("toda escala tem ao menos um costume de dádiva", [1, 2, 3, 4, 5].every((e) => DADIVAS.some((d) => d.escalas.includes(e))));
  t("as línguas dos povos são de raças que o jogo tem", LINGUAS_DOS_POVOS.every((l) => GRUPOS_DE_RACA.fantasia.includes(l.raca)));
  t("a chance de fala própria é minoria (a comum corre o mundo)", LINGUA_DA_REGIAO.chancePropria > 0 && LINGUA_DA_REGIAO.chancePropria < 0.5);
  t("os sinos não se sobrepõem e cabem no dia", SINOS.every((s, i) => s.de < s.ate && s.ate <= 24 * 60 && (i === 0 || s.de >= SINOS[i - 1].ate)));
  t("toda gíria diz o que quer dizer", [...APELIDOS_DE_FORA, ...APELIDOS_DE_OFICIO, ...EXPRESSOES].every((g) => g.quer && (g.a || g.e)));
  t("toda pergunta da tabela tem id e regex", PERGUNTAS_DA_CIDADE.every((p) => p.id && p.rx instanceof RegExp));
  t("duas respostas por turno, no máximo", RESPOSTAS_POR_TURNO === 2);
  t("o luto é raro", O_HOJE.chanceDeLuto > 0 && O_HOJE.chanceDeLuto <= 0.05);

  /* O POUSO NÃO ABRE UMA SEGUNDA ECONOMIA: as bases saem de dentro das
     faixas que o Narrador lê desde a v7.1, lidas do próprio texto. */
  const m = ECONOMIA_PROMPT.match(/estalagem simples ◉ (\d+)–(\d+) \(quarto bom ◉ (\d+)–(\d+)/);
  t("o ECONOMIA_PROMPT ainda traz as faixas da estalagem", !!m);
  if (m) {
    const [, a, b, c, d] = m.map(Number);
    t(`o quarto comum (◉ ${PRECOS_DO_POUSO.comum}) está na faixa ◉ ${a}–${b}`, PRECOS_DO_POUSO.comum >= a && PRECOS_DO_POUSO.comum <= b);
    t(`o quarto bom (◉ ${PRECOS_DO_POUSO.bom}) está na faixa ◉ ${c}–${d}`, PRECOS_DO_POUSO.bom >= c && PRECOS_DO_POUSO.bom <= d);
  }
  /* "em vilas −30% a −50%; em capitais e portos ricos +30% a +100%" */
  t("o fator do porte fica entre metade e o dobro, como manda o texto das CIDADES",
    PRECOS_DO_POUSO.piso === 0.5 && PRECOS_DO_POUSO.teto === 2
    && Object.values(PRECOS_DO_POUSO.fatorPorEscala).every((f) => f >= 0.5 && f <= 2));
  t("a semana paga menos noites do que dorme", PRECOS_DO_POUSO.semana.pagas < PRECOS_DO_POUSO.semana.noites);
}

/* ============================================================ */
sec("2. determinismo");
{
  const c = MAPA.cidades[3];
  const a = JSON.stringify(ficha(c)), b = JSON.stringify(ficha({ ...c }));
  t("mesma semente e mesma cidade, mesma ficha", a === b);
  const outraVez = JSON.stringify(fichaDaCidade(c, { semente: SEM, mapa: gerarGeografia(SEM, "sobremundo"), genero: G }));
  t("e com o mundo regerado da semente, a mesma ficha (nada vem do save)", a === outraVez);
  const todas = MAPA.cidades.map((x) => JSON.stringify(ficha(x)));
  t(`cidades diferentes, fichas diferentes (${new Set(todas).size}/${todas.length})`, new Set(todas).size === todas.length);
  const apelidos = new Set(MAPA.cidades.map((x) => ficha(x).giria[0].palavra));
  t(`a gíria varia pelo mundo (${apelidos.size} apelidos distintos)`, apelidos.size >= 3);
  const outra = fichaDaCidade(c, { semente: "Outra Campanha|Fantasia medieval", mapa: MAPA, genero: G });
  t("outra semente, outra ficha para a mesma cidade", JSON.stringify(outra) !== a);
  const p1 = JSON.stringify(pauta(c, { frase: pergunta(14) })), p2 = JSON.stringify(pauta(c, { frase: pergunta(14) }));
  t("a pauta também é determinística", p1 === p2);
}

/* ============================================================ */
sec("3. coerência pelo porte");
{
  const aldeia = { nome: "Vau Seco", porte: "aldeia", regiao: "Brejos", bioma: "planicie" };
  const vila = { ...aldeia, nome: "Vau Largo", porte: "vila" };
  const cidade = { ...aldeia, nome: "Vau Alto", porte: "cidade" };
  const capital = { ...aldeia, nome: "Vau Real", porte: "capital" };
  const forte = { ...aldeia, nome: "Vau Armado", porte: "fortaleza" };
  const fa = ficha(aldeia), fv = ficha(vila), fc = ficha(cidade), fk = ficha(capital), ff = ficha(forte);
  t("a aldeia não tem academia: quem estuda magia é ninguém", /^ninguém/.test(fa.instituicoes.magia), fa.instituicoes.magia);
  t("a aldeia não tem quarto bom", fa.pouso.bom === null);
  t("a aldeia não tem sino nem feira", fa.hoje.sinal === "" && fa.hoje.diaDaFeira === null);
  t("a capital tem guarda", /guarda/.test(fk.instituicoes.lei), fk.instituicoes.lei);
  t("a capital tem academia", /academia/.test(fk.instituicoes.magia), fk.instituicoes.magia);
  t("a capital tem sino e feira", fk.hoje.sinal === "o sino" && fk.hoje.diaDaFeira !== null);
  t("a fortaleza é militar: a lei é a guarnição, e o sinal é a corneta", ff.militar && /guarnição/.test(ff.instituicoes.lei) && ff.hoje.sinal === "a corneta");
  t("o preço sobe com o porte (aldeia ≤ vila ≤ cidade ≤ capital)",
    fa.pouso.comum <= fv.pouso.comum && fv.pouso.comum <= fc.pouso.comum && fc.pouso.comum <= fk.pouso.comum,
    [fa, fv, fc, fk].map((f) => f.pouso.comum).join(" ≤ "));
  t("a semana é seis noites do quarto comum", [fa, fv, fc, fk].every((f) => f.pouso.semana === f.pouso.comum * PRECOS_DO_POUSO.semana.pagas));
  const porto = { nome: "Cais", porte: "cidade", bioma: "costa", regiao: "Brejos" };
  const fp = ficha(porto);
  t(`o porto rico cobra mais que a cidade do interior (◉ ${fp.pouso.comum} contra ◉ ${fc.pouso.comum})`,
    fp.pouso.comum >= fc.pouso.comum && fp.pouso.fator === PRECOS_DO_POUSO.fatorPorVocacao.portuaria);

  /* A FICHA NOMEIA O PRÉDIO QUE A CIDADE TEM — o mesmo que o Narrador
     conhece pelo resumo do lugar. Procura-se no mundo uma cidade com
     biblioteca; se houver, a magia aponta para ela. */
  const comBib = MAPA.cidades.find((c) => (ESCALA_DO_PORTE[c.porte] || 0) >= 4
    && locaisDaCidade(SEM, c, G, null, null).some((l) => l.tipo === "biblioteca"));
  if (comBib) {
    const bib = locaisDaCidade(SEM, comBib, G, null, null).find((l) => l.tipo === "biblioteca").nome;
    const nomeSemArtigo = bib.replace(/^(a|o|as|os)\s+/i, "");
    t(`a magia de ${comBib.nome} aponta para a biblioteca que ela tem (${bib})`, ficha(comBib).instituicoes.magia.includes(nomeSemArtigo));
  } else t("(nenhuma cidade com biblioteca neste mundo — a regra não se aplica)", true);

  /* A LÍNGUA PELO TAMANHO: numa região com fala própria, a aldeia a fala
     na rua e a capital fala a comum. Procura-se a região pela semente. */
  let regiao = null;
  for (let i = 0; i < 60 && !regiao; i++) {
    const r = `Região ${i}`;
    if (ficha({ nome: "X", porte: "aldeia", regiao: r }).lingua.propria) regiao = r;
  }
  t("há regiões com fala própria", !!regiao);
  if (regiao) {
    const la = ficha({ nome: "Aldeola", porte: "aldeia", regiao }).lingua;
    const lk = ficha({ nome: "Corte", porte: "capital", regiao }).lingua;
    t(`na aldeia, a rua fala ${la.propria}`, la.rua.includes(la.propria) && /comum/.test(la.naoFala), la.rua);
    t("na capital, a rua fala a comum", /^a comum/.test(lk.rua) && lk.propria === la.propria);
  }
  const semPropria = [];
  for (let i = 0; i < 60; i++) if (!ficha({ nome: "X", porte: "vila", regiao: `Região ${i}` }).lingua.propria) semPropria.push(i);
  t(`a maioria das regiões só fala a comum (${semPropria.length}/60)`, semPropria.length > 30);

  /* A FRONTEIRA: a cidade colada a outra região, que tem fala própria,
     entende a do vizinho. */
  const rOutra = regiao;
  const rMinha = `Região ${semPropria[0]}`;
  if (rOutra) {
    const mapa = { cidades: [
      { nome: "Aqui", porte: "vila", regiao: rMinha, x: 50, y: 50 },
      { nome: "Lá", porte: "vila", regiao: rOutra, x: 55, y: 52 },
      { nome: "Longe", porte: "vila", regiao: rOutra, x: 95, y: 95 },
    ] };
    const f = fichaDaCidade(mapa.cidades[0], { semente: SEM, mapa, genero: G });
    t("a cidade de fronteira entende a fala do vizinho", !!f.lingua.fronteira && f.lingua.fronteira.regiao === rOutra, JSON.stringify(f.lingua.fronteira));
    t("e o apelido dos de fora é para os de lá", f.giria[0].alvo === `os de ${rOutra}`);
    const longe = { cidades: [mapa.cidades[0], { ...mapa.cidades[2] }] };
    t("longe da outra região, não é fronteira", fichaDaCidade(mapa.cidades[0], { semente: SEM, mapa: longe, genero: G }).lingua.fronteira === null);
  }

  /* OS OUTROS MOLDES E O FUTURO */
  const colonia = fichaDaCidade({ nome: "Kepler", porte: "colônia", regiao: "Setor Ômega" }, { semente: "Estelar|Ficção científica", genero: "Ficção científica", molde: "estelar" });
  t("no mundo futurista o sinal é a sirene", colonia.hoje.sinal === "a sirene");
  t("e não há língua de raça, só dialeto", !colonia.lingua.propria || /dialeto/.test(colonia.lingua.propria));
  const futuros = new Set();
  for (let i = 0; i < 40; i++) futuros.add(fichaDaCidade({ nome: `K${i}`, porte: "sistema", regiao: "S" }, { semente: "E", genero: "Cyberpunk" }).giria[2].palavra);
  t("nem gíria de nabo num mundo futurista", ![...futuros].some((p) => /nabo/.test(p)));
  const andar = fichaDaCidade({ nome: "Andar 7", porte: "andar-mestre", regiao: "Meio II" }, { semente: "Torre|Fantasia medieval", genero: G, molde: "torre" });
  t("o andar-mestre da Torre tem a escala de uma cidade", andar.escala === 4);

  /* o léxico renomeia a guarda, e a ficha fala a língua do mundo */
  const lex = { chamado: { autoridade: "a Associação", magia: "o despertar" } };
  const fl = fichaDaCidade(capital, { semente: SEM, genero: G, lex });
  t("o léxico renomeia quem guarda a lei", /a Associação/.test(fl.instituicoes.lei) && /a Associação/.test(fl.vigilancia.dia), fl.instituicoes.lei);
  t("e o que se estuda", /o despertar/.test(fl.instituicoes.magia), fl.instituicoes.magia);
}

/* ============================================================ */
sec("4. a pauta: o ambiente, e a resposta ao que se perguntou");
{
  const c = doPorte("cidade") || MAPA.cidades[1];
  const f = ficha(c);
  const calado = pauta(c, { frase: "Ataco o goblin com a espada" });
  t("sem pergunta, nenhuma resposta", calado.pergunta.length === 0);
  t("e o ambiente leva a língua", calado.cidade.some((l) => /^língua:/.test(l)), calado.cidade.join(" | "));
  const festa = pauta(c, { dia: 35, minuto: 12 * 60 + 5 });
  t("no dia da Festa da Semeadura o ambiente diz a festa, sem a descrição", festa.cidade.some((l) => /Festa da Semeadura/.test(l) && !/benze os campos/.test(l)));
  t("e o sino que toca agora", festa.cidade.some((l) => /toca agora o sino do meio-dia/.test(l)));
  const quieto = pauta(c, { dia: 2, minuto: 15 * 60 });
  const semEvento = !quieto.cidade.some((l) => /^hoje:/.test(l));
  t("num dia comum, fora das horas do sino, não há linha do hoje (ou só a feira/luto)", semEvento || quieto.cidade.some((l) => /feira|luto/.test(l)));

  const esperado = { 6: "lingua", 14: "pouso", 15: "pouso", 31: "magia", 37: "giria", 38: "giria", 80: "dadiva", 107: "reconhecer", 110: "hoje", 70: "vigia" };
  const marca = {
    lingua: /^língua:/, pouso: /^pouso: quarto comum ◉ \d+/, magia: /^quem estuda magia:/, giria: /^gíria:/,
    dadiva: /^o costume com o que se dá:/, reconhecer: /^como se reconhece quem é bem-vindo:/, hoje: /(sino|corneta|sirene) das horas/, vigia: /^quem vigia a rua/,
  };
  const custos = [];
  for (const [n, id] of Object.entries(esperado)) {
    const r = pauta(c, { frase: pergunta(Number(n)) });
    custos.push(r.pergunta[0] ? r.pergunta[0].length : 0);
    t(`#${n} "${pergunta(Number(n))}" → ${id}`, r.pergunta.length >= 1 && marca[id].test(r.pergunta[0]), r.pergunta.join(" | "));
  }
  console.log(`      custo das respostas: ${Math.min(...custos)}–${Math.max(...custos)} caracteres`);
  t("nenhuma resposta passa de 300 caracteres", Math.max(...custos) <= 300);

  const preco = pauta(c, { frase: pergunta(14) }).pergunta[0];
  t(`o preço da pauta é o da ficha (◉ ${f.pouso.comum})`, preco.includes(`◉ ${f.pouso.comum} a noite`) && preco.includes(`◉ ${f.pouso.semana}`));
  const lg = pauta(c, { frase: pergunta(6) });
  t("perguntada a língua, ela sobe à resposta e sai do ambiente", lg.pergunta.some((l) => /^língua:/.test(l)) && !lg.cidade.some((l) => /^língua:/.test(l)));
  const sino = pauta(c, { frase: pergunta(110), dia: 35, minuto: 12 * 60 + 5 });
  t("perguntado o sino, a festa vem com o que ela é", sino.pergunta[0].includes("benze os campos") && !sino.cidade.some((l) => /^hoje:/.test(l)));
  t("e o sino da hora é o que toca", /toca agora o sino do meio-dia/.test(sino.pergunta[0]) && !/agora não toca/.test(sino.pergunta[0]));
  const foraDaHora = pauta(c, { frase: pergunta(110), dia: 2, minuto: 15 * 60 });
  t("fora da hora, a resposta diz que nenhum sino da cidade toca agora", /agora não toca o sino da cidade/.test(foraDaHora.pergunta[0]), foraDaHora.pergunta[0]);
  const noite = pauta(c, { frase: pergunta(70), minuto: 23 * 60 });
  t("de noite, a vigilância é a da noite", noite.pergunta[0].includes(`de noite (agora): ${f.vigilancia.noite}`) && noite.pergunta[0].includes(f.vigilancia.brecha));
  const dia = pauta(c, { frase: pergunta(70), minuto: 11 * 60 });
  t("de dia, a do dia", dia.pergunta[0].includes(`de dia (agora): ${f.vigilancia.dia}`));
  const duas = pauta(c, { frase: "Quanto custa o quarto? E a guarda daqui é honesta? E há magos?" });
  t("três perguntas, duas respostas — na ordem em que foram feitas", duas.pergunta.length === 2 && /^pouso/.test(duas.pergunta[0]) && /^quem guarda a lei/.test(duas.pergunta[1]), duas.pergunta.join(" | "));
  /* o apelido trazido pelo jogador que não é daqui */
  const alheio = APELIDOS_DE_FORA.map((x) => x.a).find((a) => !f.giria.some((g) => g.palavra === a));
  const gr = pauta(c, { frase: `Esses ${alheio}!` });
  t(`o apelido que não é daqui ("${alheio}") é dito como não sendo daqui`, gr.pergunta[0] && gr.pergunta[0].includes(`"${alheio}" não se diz aqui`), gr.pergunta.join(" | "));
  const proprio = pauta(c, { frase: `"${f.giria[0].palavra}" quer dizer o quê?` });
  t("e o daqui não leva a negação", proprio.pergunta[0] && !/não se diz aqui/.test(proprio.pergunta[0]));

  const amb = pauta(c, { dia: 35, minuto: 12 * 60 + 5 }).cidade;
  const custoAmb = amb.reduce((s, l) => s + l.length + 14, 0);
  console.log(`      ambiente num dia de festa ao meio-dia: ${amb.length} linhas, ${custoAmb} caracteres na pauta`);
  amb.forEach((l) => console.log("        A CIDADE  " + l));
  console.log("        PERGUNTOU " + pauta(c, { frase: pergunta(14) }).pergunta[0]);
  t("o ambiente custa menos de 300 caracteres", custoAmb < 300);
}

/* ============================================================ */
sec("5. o teto: a cidade não empurra quem vale mais");
{
  const cid = SECOES.find((s) => s.id === "cidade"), per = SECOES.find((s) => s.id === "pergunta");
  const idx = (id) => SECOES.findIndex((s) => s.id === id);
  t("A CIDADE tem prioridade baixa (7) e vem depois do aliado, do vilão e do mundo", cid && cid.prio === 7 && idx("cidade") > idx("mundo") && idx("cidade") > idx("aliado"));
  t("PERGUNTOU tem a prioridade de QUEM (4) e vem depois dela e do que o sistema resolveu", per && per.prio === 4 && idx("pergunta") > idx("quem") && idx("pergunta") > idx("acabou"));

  /* a ordem do corte é a de textoDaPauta: prio + 0,1·linha, e no empate a
     ordem da lista. "Vale mais" é quem entra antes da minha linha. */
  const chave = (id, i) => [SECOES.find((s) => s.id === id).prio + i * 0.1, idx(id)];
  const antesDe = (a, b) => a[0] < b[0] || (a[0] === b[0] && a[1] < b[1]);
  const longa = (id, i) => `${id} linha ${i} ` + "x".repeat(110);
  let cheia = {};
  for (const s of SECOES) if (!["cidade", "pergunta"].includes(s.id)) cheia = porNaPauta(cheia, s.id, longa(s.id, 0), longa(s.id, 1), longa(s.id, 2));
  const c = doPorte("capital") || MAPA.cidades[0];
  const r = pauta(c, { frase: pergunta(14), dia: 35, minuto: 12 * 60 + 5 });
  const com = porNaPauta(porNaPauta(cheia, "cidade", r.cidade), "pergunta", r.pergunta);
  const tx0 = textoDaPauta(cheia), tx1 = textoDaPauta(com);
  t(`a pauta cheia continua no teto (${tx0.length} → ${tx1.length} de ${TETO_DA_PAUTA})`, tx1.length <= TETO_DA_PAUTA);
  const empurradas = { cidade: [], pergunta: [] };
  for (const s of SECOES) {
    if (["cidade", "pergunta"].includes(s.id)) continue;
    for (let i = 0; i < 3; i++) {
      const l = longa(s.id, i);
      if (!tx0.includes(l) || tx1.includes(l)) continue;
      if (antesDe(chave(s.id, i), chave("pergunta", 0))) empurradas.pergunta.push(`${s.id}#${i}`);
      if (antesDe(chave(s.id, i), chave("cidade", 0))) empurradas.cidade.push(`${s.id}#${i}`);
    }
  }
  t("a resposta não empurra nada que entre antes dela", empurradas.pergunta.length === 0, empurradas.pergunta.join(","));
  /* o ambiente é o último da fila: numa pauta cheia ele simplesmente não
     entra, e nada do que entrou antes dele sai */
  const soAmb = textoDaPauta(porNaPauta(cheia, "cidade", r.cidade));
  const tiradasPeloAmb = [];
  for (const s of SECOES) for (let i = 0; i < 3; i++) {
    const l = longa(s.id, i);
    if (tx0.includes(l) && !soAmb.includes(l) && antesDe(chave(s.id, i), chave("cidade", 0))) tiradasPeloAmb.push(`${s.id}#${i}`);
  }
  t("o ambiente não empurra nada que entre antes dele", tiradasPeloAmb.length === 0, tiradasPeloAmb.join(","));

  /* A TAVERNA CHEIA DE VERDADE: o lugar do Geógrafo, o comércio real, o
     taverneiro, a batida, três gestos, uma fala, o mundo, o arquivista, a
     vizinhança e o veto — a cena em que se pergunta o preço da diária. */
  const cidade = doPorte("cidade") || MAPA.cidades[1];
  const g = geografoParaPauta({ espaco: { dentro: true, tipoDoLocal: "taverna", publico: true, gentePorPerto: 6, porte: "cidade" }, cidadeAtual: cidade.nome, mapa: MAPA, semente: SEM });
  let p = porNaPauta({}, "onde", g.onde);
  p = porNaPauta(p, "onde", envelopeDoComercio(cidade, 40));
  p = porNaPauta(p, "naoPode", g.naoPode);
  p = porNaPauta(p, "daqui", g.daqui);
  const QUEM = "Aldo Ferreira, o taverneiro, atrás do balcão; Mira Vasconcelos, serviçal, entre as mesas";
  p = porNaPauta(p, "quem", QUEM);
  p = porNaPauta(p, "momento", "a chegada: o herói acaba de pisar numa cidade que não conhece, e alguém ali já sabe o nome dele");
  p = porNaPauta(p, "gente", "Aldo Ferreira limpa o mesmo copo há tempo demais e não tira os olhos da porta", "Mira Vasconcelos serve a mesa do canto e demora-se a ouvir a conversa", "um caravaneiro bêbado canta alto demais e desafina de propósito");
  p = porNaPauta(p, "fala", "Aldo Ferreira disse: \"Forasteiro? Paga adiantado.\"");
  p = porNaPauta(p, "mundo", "a Ordem do Vácuo quer o porto e desconfia de você; a Casa Arden quer ouro e acha-o útil");
  p = porNaPauta(p, "antes", "há dois dias, aqui mesmo, você recusou o pedido de Mira", "Aldo lembra-se de ter visto o seu rosto num cartaz");
  const rr = pauta(cidade, { frase: pergunta(14), dia: 40, minuto: 18 * 60 + 5 });
  const taverna = textoDaPauta(porNaPauta(porNaPauta(p, "cidade", rr.cidade), "pergunta", rr.pergunta));
  console.log(`      a taverna cheia com a pergunta do preço: ${taverna.length}/${TETO_DA_PAUTA}`);
  t("na taverna cheia, a resposta do preço entra", taverna.includes(rr.pergunta[0]));
  t("e quem responde continua na cena (QUEM), com o lugar, a fala, a batida e o veto",
    taverna.includes(QUEM) && taverna.includes(g.onde[0]) && taverna.includes("Paga adiantado") && /MOMENTO/.test(taverna) && /NÃO PODE/.test(taverna));
}

/* ============================================================ */
sec("6. lixo, null e imutabilidade");
{
  let erro = "";
  const lixo = [null, undefined, {}, { nome: "" }, { nome: "X" }, { nome: "X", porte: "inventado" }, { nome: "X", porte: "ruina" }, "texto", 42, []];
  const fichas = [];
  for (const c of lixo) {
    for (const ctx of [undefined, null, {}, { semente: null, mapa: "lixo", lex: 7, genero: null, molde: "nenhum" }, { mapa: { cidades: [null, 3, { regiao: "R" }] } }]) {
      try { fichas.push(fichaDaCidade(c, ctx)); fichaParaPauta(c, { ...(ctx || {}), frase: null, dia: "x", minuto: "y" }); }
      catch (e) { erro = `${JSON.stringify(c)} / ${JSON.stringify(ctx)}: ${e.message}`; }
    }
  }
  t("nenhum lixo derruba a ficha nem a pauta", !erro, erro);
  const campos = ["lingua", "pouso", "instituicoes", "vigilancia", "reconhecimento", "dadiva", "giria", "hoje"];
  t("toda ficha tem todos os campos, mesmo a de lixo", fichas.every((f) => campos.every((k) => f[k] != null)));
  const minima = fichaDaCidade(null);
  t("a cidade sem dados recebe a ficha da vila (o meio honesto)", minima.escala === 2 && /comum/.test(minima.lingua.rua));
  t("null não vai à pauta", JSON.stringify(fichaParaPauta(null)) === JSON.stringify({ cidade: [], pergunta: [] }));
  t("a ruína não tem rua, nem língua, nem sino", fichaParaPauta({ nome: "Ruínas", porte: "ruina" }, { frase: pergunta(14) }).cidade.length === 0);

  const congela = (o) => { Object.freeze(o); for (const v of Object.values(o)) if (v && typeof v === "object") congela(v); return o; };
  const c = congela(JSON.parse(JSON.stringify(MAPA.cidades[2])));
  const mapa = congela(JSON.parse(JSON.stringify(MAPA)));
  let mudou = "";
  try { fichaDaCidade(c, { semente: SEM, mapa, genero: G }); fichaParaPauta(c, { semente: SEM, mapa, genero: G, frase: pergunta(14), dia: 35, minuto: 720 }); }
  catch (e) { mudou = e.message; }
  t("a cidade e o mapa recebidos não são tocados", !mudou, mudou);
}

/* ============================================================ */
sec("7. a fiação — pautaDoTurno chama fichaParaPauta de verdade");
{
  /* Prova por texto, não por import: App.jsx é fiação (React), e esta suíte
     é de módulo puro. A âncora é a mesma que teste-mm1-sonda-da-mesa.mjs usa
     para extrair o corpo de `pautaDoTurno` — por chave balanceada, nunca por
     número de linha, porque o arquivo muda sob os pés desta suíte. `\r\n` é
     normalizado para `\n` antes de qualquer teste, porque o Windows grava o
     arquivo com final de linha diferente do que os regex abaixo assumem. */
  const appPath = new URL("../src/App.jsx", import.meta.url);
  const app = fs.readFileSync(appPath, "utf8").replace(/\r\n/g, "\n");
  const anchor = "const pautaDoTurno = (";
  const i = app.indexOf(anchor);
  t("a âncora de pautaDoTurno existe no App.jsx de hoje", i >= 0);
  let corpo = "";
  if (i >= 0) {
    const j = app.indexOf("{", app.indexOf("=>", i));
    let depth = 0, k = j;
    for (; k < app.length; k++) {
      if (app[k] === "{") depth++;
      else if (app[k] === "}") { depth--; if (depth === 0) break; }
    }
    corpo = app.slice(i, k + 1);
  }
  t("o corpo de pautaDoTurno não está vazio", corpo.length > 2000);
  t("pautaDoTurno importa fichaParaPauta de cidade-por-dentro.js", /import\s*\{[^}]*\bfichaParaPauta\b[^}]*\}\s*from\s*"\.\/cidade-por-dentro\.js"/.test(app));
  t("pautaDoTurno CHAMA fichaParaPauta", /\bfichaParaPauta\s*\(/.test(corpo));
  t("e põe o resultado na secção \"cidade\"", /porNaPauta\(p,\s*"cidade"/.test(corpo));
  t("e na secção \"pergunta\"", /porNaPauta\(p,\s*"pergunta"/.test(corpo));
  t("a chamada está guardada por calou (um órgão que estoura não derruba o turno)", /try\s*\{[^]*?fichaParaPauta\s*\([^]*?\}\s*catch\s*\(e\)\s*\{\s*calou\("fichaParaPauta"/.test(corpo));
  t("e fora de jornada, masmorra e combate — ali não há rua para se perguntar nada dela",
    /if\s*\(cidadeAtualRef\.current\s*&&\s*!jornadaRef\.current\s*&&\s*!masmorraRef\.current\s*&&\s*!combateRef\.current\)/.test(corpo));
}

console.log(`\nMM12 · a cidade por dentro: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
