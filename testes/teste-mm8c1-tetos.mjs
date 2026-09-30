/* teste-mm8c1-tetos.mjs (Fase MM · MM8c-1) — as listas de pessoas têm teto

   O estudo da MM8 achou duas listas de pessoas que subiam ao Narrador SEM
   TETO nenhum — o QUEM do rodapé (`resumoCenaPrompt`: todo o registo, aqui
   e longe) e as pessoas do CÂNONE (`formatarCanone`) — e duas avarias na
   régua da recência, que é o critério com que o registo decide quem sai:
   o contador que voltava a zero a cada load, e o `Date.now()` que prendia
   o vilão no topo. Esta suíte prova os quatro consertos, e o custo em três
   campanhas de 200 turnos (`registo-simulado.mjs`). */
import fs from "node:fs";
import {
  LIMITE_DO_CONTADOR, retomarContador, normalizarRecencia, ordemDaRecencia,
  TETO_DAS_PESSOAS, resumoNPCsParaPrompt, criarNPC,
} from "../src/npcs.js";
import { TETO_DO_QUEM, resumoCenaPrompt, elencoDaCena } from "../src/cena.js";
import { TETO_DO_CANONE, formatarCanone } from "../src/prompt.js";
import { registoSimulado, CENARIOS } from "./registo-simulado.mjs";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const RELOGIO = 1759100000000;
/* MUDADO NA MM8d (30/09), com o motivo: esta suíte prova TETOS e a régua
   da RECÊNCIA, e enchia as listas com fichas sem investimento. Desde a MM8d
   uma ficha sem laço, relação, segredo nem consultas, fora do elenco e da
   cena, é "de passagem" e não ocupa lugar — as listas desta suíte ficariam
   vazias e não provariam teto nenhum. A gente daqui passa a ser "amigo":
   todas com o MESMO peso, logo a ordem entre elas continua a ser a da
   recência, que é o que as asserções medem. Quem precisa de ser outra
   coisa (o inimigo, o sem relação) continua a dizê-lo em `extra`. */
const pessoa = (nome, ultimaVez, extra = {}) => ({ ...criarNPC(nome, { papel: "ferreiro", relacao: "amigo", ...extra }), ultimaVez });
const nomesDe = (lista) => lista.map((n) => n.nome);

/* ============================================================ */
sec("1. as tabelas");
{
  const num = (x) => Number.isFinite(x) && x > 0;
  t("o teto das pessoas conhecidas é de pessoas e de caracteres", num(TETO_DAS_PESSOAS.pessoas) && num(TETO_DAS_PESSOAS.chars));
  t("as 22 pessoas continuam a ser 22 (a lei antiga não se afrouxou)", TETO_DAS_PESSOAS.pessoas === 22);
  t("o QUEM tem teto no aqui e no longe", ["aqui", "longe"].every((k) => num(TETO_DO_QUEM[k].pessoas) && num(TETO_DO_QUEM[k].chars)));
  t("as pessoas do cânone têm teto", num(TETO_DO_CANONE.pessoas) && num(TETO_DO_CANONE.chars));
  t("o limite do contador separa turnos de relógio", LIMITE_DO_CONTADOR === 1e9 && Date.now() > LIMITE_DO_CONTADOR && 10000 * 365 * 270 < LIMITE_DO_CONTADOR);
}

/* ============================================================ */
sec("2. a recência: o contador que voltava a zero");
{
  t("retoma do maior contador", retomarContador({ a: pessoa("A", 12), b: pessoa("B", 150), c: pessoa("C", 3) }) === 150);
  t("e ignora o relógio", retomarContador({ a: pessoa("A", 12), v: pessoa("V", RELOGIO) }) === 12);
  t("registo vazio ou lixo: zero", [null, undefined, {}, "x", 7, { a: null }, { a: { ultimaVez: "x" } }, { a: { ultimaVez: -5 } }].every((x) => retomarContador(x) === 0));

  /* O SAVE RECARREGADO MANTÉM A ORDEM. Antes: o load punha o contador a 0,
     e a primeira pessoa anotada depois recebia 1 — abaixo de todas. */
  let reg = {};
  for (let i = 1; i <= 150; i++) reg[`P${i}`] = pessoa(`P${i}`, i);
  const doSave = JSON.parse(JSON.stringify(reg));
  const antes = { ...doSave, Nova: pessoa("Nova", 0 + 1) };
  t("antes do conserto: quem se vê logo depois do load cai para o fim", nomesDe(ordemDaRecencia(antes)).indexOf("Nova") === 150);
  const carregado = normalizarRecencia(doSave);
  const contador = retomarContador(carregado);
  const depois = { ...carregado, Nova: pessoa("Nova", contador + 1) };
  t("depois: o contador volta onde estava", contador === 150);
  t("e quem se vê logo depois do load é o primeiro da lista", nomesDe(ordemDaRecencia(depois))[0] === "Nova");
  t("e as 22 do prompt são as 21 mais recentes do save e a nova", resumoNPCsParaPrompt(depois).split("\n").length === 22 && /^• Nova/.test(resumoNPCsParaPrompt(depois)) && resumoNPCsParaPrompt(depois).includes("• P130") && !resumoNPCsParaPrompt(depois).includes("• P129 "));
}

/* ============================================================ */
sec("3. a recência: o relógio que prendia o vilão no topo");
{
  let reg = {};
  for (let i = 1; i <= 30; i++) reg[`P${i}`] = pessoa(`P${i}`, i);
  reg.Vilao = pessoa("Vilao", RELOGIO, { relacao: "inimigo" });
  reg.Amiga = pessoa("Amiga", RELOGIO + 5000);
  /* antes: o relógio ganha de todos, para sempre */
  const cru = Object.values(reg).sort((a, b) => (b.ultimaVez || 0) - (a.ultimaVez || 0));
  t("antes do conserto: o relógio fica no topo", cru[0].nome === "Amiga" && cru[1].nome === "Vilao");
  const norm = normalizarRecencia(reg);
  t("o load troca cada relógio por um contador, logo acima do maior", norm.Vilao.ultimaVez === 31 && norm.Amiga.ultimaVez === 32);
  t("pela ordem em que foram escritos", norm.Vilao.ultimaVez < norm.Amiga.ultimaVez);
  t("sem relógio, nada muda — o mesmo objeto", normalizarRecencia(norm) === norm);
  t("o que se recebe não é tocado", reg.Vilao.ultimaVez === RELOGIO);
  /* O VILÃO VISTO HÁ 150 TURNOS DESCE ABAIXO DE QUEM SE VIU AGORA */
  let r = norm, cont = retomarContador(norm);
  for (let i = 1; i <= 150; i++) { cont++; r = { ...r, [`Q${i}`]: pessoa(`Q${i}`, cont) }; }
  const ordem = nomesDe(ordemDaRecencia(r));
  t("150 turnos depois, o vilão está abaixo de quem se viu agora", ordem.indexOf("Vilao") > ordem.indexOf("Q150") && ordem.indexOf("Vilao") === 151);
  /* MOVIDA NA MM8c-2 (30/09), com o motivo: "e sai das 22 do prompt" era a
     consequência da recência quando o prompt só lia a recência. Agora ele
     lê a importância e o Vilao é inimigo: fica. A prova da régua mede a
     recência onde ela vive (acima); e o prompt, sem a relação, ainda o tira. */
  const semRelacao = Object.fromEntries(Object.entries(r).map(([k, n]) => [k, { ...n, relacao: "desconhecido" }]));
  t("e, sem ser inimigo, sai das 22 do prompt (a recência desempata)", !resumoNPCsParaPrompt(semRelacao).includes("• Vilao"));
  t("sendo inimigo, fica nas 22: a importância manda (MM8c-2)", resumoNPCsParaPrompt(r).includes("• Vilao"));
  t("a leitura também conserta: um relógio nunca fica abaixo de um contador", nomesDe(ordemDaRecencia(reg)).slice(0, 2).join() === "Amiga,Vilao");
  t("no empate, a ordem do registo (o sort estável de antes)", nomesDe(ordemDaRecencia({ a: pessoa("A", 5), b: pessoa("B", 5), c: pessoa("C", 5) })).join() === "A,B,C");
}

/* ============================================================ */
sec("4. o teto das pessoas conhecidas");
{
  const longas = {};
  for (let i = 1; i <= 40; i++) longas[`L${i}`] = pessoa(`L${i}`, i, { notas: "n".repeat(300) });
  const txt = resumoNPCsParaPrompt(longas);
  t(`fichas de notas longas não passam do teto de caracteres (${txt.length}/${TETO_DAS_PESSOAS.chars})`, txt.length <= TETO_DAS_PESSOAS.chars);
  t("e quem entra é o mais recente", txt.startsWith("• L40") && !txt.includes("• L1 "));
  const curtas = {};
  for (let i = 1; i <= 10; i++) curtas[`C${i}`] = pessoa(`C${i}`, i);
  t("um registo pequeno sobe inteiro, como sempre", resumoNPCsParaPrompt(curtas).split("\n").length === 10);
  t("o limite passado à mão ainda vale", resumoNPCsParaPrompt(curtas, 3).split("\n").length === 3);
  t("vazio é vazio", resumoNPCsParaPrompt({}) === "" && resumoNPCsParaPrompt(null) === "");
}

/* ============================================================ */
sec("5. o teto do QUEM (o rodapé)");
{
  const mapa = { cidades: [{ nome: "Aqui", x: 0, y: 0 }, { nome: "Longe", x: 60, y: 0 }] };
  const reg = {};
  for (let i = 1; i <= 60; i++) reg[`A${i}`] = pessoa(`A${i}`, i, { local: "Aqui" });
  for (let i = 1; i <= 60; i++) reg[`L${i}`] = pessoa(`L${i}`, 100 + i, { local: "Longe" });
  reg.Companheira = pessoa("Companheira", 1, { local: "Longe" });
  const txt = resumoCenaPrompt(reg, "Aqui", mapa, { comGrupo: [{ nome: "Companheira" }], emCena: ["A2"] });
  const aqui = (txt.split("\n").find((l) => /PRESENTES/.test(l)) || "");
  const longe = (txt.split("\n").find((l) => /LONGE/.test(l)) || "");
  const quantos = (l) => (l.match(/(?:^|· )[AL]\d+ /g) || []).length;
  console.log(`      aqui ${aqui.length} caracteres, ${quantos(aqui)} nomes · longe ${longe.length}, ${quantos(longe)} nomes`);
  t("quem viaja comigo nunca sai do aqui, mesmo sendo o mais antigo", /Companheira \(viaja com você\)/.test(aqui));
  t("quem a cena diz que está aqui nunca sai, mesmo sendo antigo", /A2 \(vive em Aqui\)/.test(aqui));
  t("o aqui tem teto de pessoas (fora os protegidos)", quantos(aqui) - 1 <= TETO_DO_QUEM.aqui.pessoas);
  t("o longe tem teto de pessoas", quantos(longe) <= TETO_DO_QUEM.longe.pessoas);
  t("e de caracteres", longe.length <= TETO_DO_QUEM.longe.chars + 120 && aqui.length <= TETO_DO_QUEM.aqui.chars + 120);
  t("quem fica é o mais recente (aqui e longe)", /A60 /.test(aqui) && !/· A1 /.test(aqui) && /L60 /.test(longe) && !/L1 está/.test(longe));
  t("a lista parcial diz que é parcial (+N)", /· \+\d+/.test(aqui) && /· \+\d+/.test(longe));
  const inteiro = elencoDaCena(reg, "Aqui", mapa);
  t("só o texto tem teto: o elenco da cena continua inteiro (o cão de guarda vê todos)", inteiro.aqui.length === 60 && inteiro.longe.length === 61);
  const pequeno = { a: pessoa("Ana", 2, { local: "Aqui" }), b: pessoa("Bia", 1, { local: "Longe" }) };
  const tp = resumoCenaPrompt(pequeno, "Aqui", mapa);
  t("uma cena pequena sai como sempre saiu, sem +N", /PRESENTES em Aqui: Ana \(vive em Aqui\)\./.test(tp) && /LONGE .*: Bia está em Longe/.test(tp) && !/\+\d/.test(tp));
}

/* ============================================================ */
sec("6. o teto das pessoas do cânone");
{
  /* a função antiga, caractere por caractere, para provar que sem teto nada muda */
  const velha = (canone) => Object.entries(canone).filter(([, f]) => f).map(([nome, f]) => {
    const p = [f.tipo, f.papel, f.genero, f.local ? `em ${f.local}` : "", f.status].filter(Boolean);
    return `• ${nome}${p.length ? ` — ${p.join(", ")}` : ""}${f.notas ? `. ${f.notas}` : ""}`;
  }).join("\n");
  const canone = {};
  for (let i = 1; i <= 40; i++) canone[`Gente ${i}`] = { tipo: "pessoa", papel: "guarda", notas: "uma frase factual sobre quem ela é" };
  canone["A Espada Berço"] = { tipo: "artefato", notas: "um disco de ossos" };
  canone["Vale Torto"] = { tipo: "lugar" };
  canone["Promessa ao moleiro"] = { tipo: "promessa", notas: "x".repeat(200) };
  canone["Nulo"] = null;
  t("sem teto, o cânone sai exatamente como antes (o Cronista e o Arquivista)", formatarCanone(canone) === velha(canone));
  const npcs = {};
  for (let i = 1; i <= 40; i++) npcs[`Gente ${i}`] = pessoa(`Gente ${i}`, 41 - i);
  const txt = formatarCanone(canone, { teto: TETO_DO_CANONE, npcs, grupo: [{ nome: "Gente 40" }] });
  const pessoasDentro = txt.split("\n").filter((l) => /— pessoa/.test(l));
  const chars = pessoasDentro.reduce((a, l) => a + l.length + 1, 0);
  console.log(`      ${pessoasDentro.length} pessoas do cânone dentro, ${chars} caracteres (teto ${TETO_DO_CANONE.pessoas} / ${TETO_DO_CANONE.chars})`);
  t("as pessoas do cânone ficam dentro do teto (fora quem anda comigo)", pessoasDentro.length - 1 <= TETO_DO_CANONE.pessoas && chars <= TETO_DO_CANONE.chars + 120);
  t("fica quem o registo viu por último", txt.includes("• Gente 1 ") && !txt.includes("• Gente 39 "));
  t("quem anda comigo nunca sai, mesmo sendo o mais antigo", txt.includes("• Gente 40 "));
  t("lugares, artefatos e promessas não têm teto nesta etapa", ["A Espada Berço", "Vale Torto", "Promessa ao moleiro"].every((n) => txt.includes(`• ${n}`)));
  const ordemVelha = velha(canone).split("\n").filter((l) => txt.split("\n").includes(l));
  t("e a ordem de leitura não muda", ordemVelha.join("\n") === txt);
  const semRegisto = formatarCanone(canone, { teto: TETO_DO_CANONE });
  t("sem registo, fica quem entrou no cânone por último", semRegisto.includes("• Gente 40 ") && !semRegisto.includes("• Gente 1 "));
}

/* ============================================================ */
sec("7. três campanhas de 200 turnos");
{
  for (const c of CENARIOS) {
    const r = registoSimulado(c);
    const N = Object.keys(r.npcs).length;
    const { aqui, longe } = elencoDaCena(r.npcs, r.cidade.nome, r.mapa);
    const quemAntes = [...aqui.map((n) => `${n.nome} (${n.motivo})`), ...longe.map((n) => `${n.nome} está em ${n.onde}, a ${n.dias} dias daqui`)].join(" · ").length;
    const quem = resumoCenaPrompt(r.npcs, r.cidade.nome, r.mapa);
    const canAntes = formatarCanone(r.canone).length;
    const can = formatarCanone(r.canone, { teto: TETO_DO_CANONE, npcs: r.npcs });
    const pes = resumoNPCsParaPrompt(r.npcs);
    console.log(`      ${c.id}: ${N} pessoas, ${Object.keys(r.canone).length} no cânone · QUEM ${quemAntes} → ${quem.length} · cânone ${canAntes} → ${can.length} · PESSOAS ${pes.length}`);
    t(`${c.id}: o QUEM fica no teto`, quem.length <= TETO_DO_QUEM.aqui.chars + TETO_DO_QUEM.longe.chars + 300);
    t(`${c.id}: as pessoas do cânone ficam no teto`, can.length <= TETO_DO_CANONE.chars + 1);
    t(`${c.id}: as pessoas conhecidas ficam no teto`, pes.length <= TETO_DAS_PESSOAS.chars && pes.split("\n").length <= TETO_DAS_PESSOAS.pessoas);
    const carregado = normalizarRecencia(r.npcs);
    /* antes: o relógio do turno 30 ficava nas 22 para sempre. Depois do
       load ele vale "visto agora" — e desce como toda a gente: 22 pessoas
       anotadas depois tiram-no da lista. */
    const cru = Object.values(r.npcs).sort((a, b) => (b.ultimaVez || 0) - (a.ultimaVez || 0));
    t(`${c.id}: sem o conserto, os dois relógios estavam no topo ao fim de 200 turnos`, cru[0].nome === "Ilsa Marés" && cru[1].nome === "Morvath, o Sem-Rosto");
    let depois = carregado, cont = retomarContador(carregado);
    for (let i = 1; i <= TETO_DAS_PESSOAS.pessoas; i++) { cont++; depois = { ...depois, [`Nova ${i}`]: pessoa(`Nova ${i}`, cont) }; }
    /* MOVIDA NA MM8c-2 (30/09), com o motivo: esta linha provava a RÉGUA DA
       RECÊNCIA pelo prompt ("22 anotadas tiram o vilão das 22"). Desde a
       MM8c-2 o prompt ordena por IMPORTÂNCIA, e um inimigo (o vilão) e uma
       amiga (Ilsa) ficam nas 22 por serem quem são — é exatamente o que a
       etapa pede ("o vilão antes do padeiro"). A régua da recência não
       mudou, e a prova passa a lê-la onde ela vive: `ordemDaRecencia`. */
    const rec = ordemDaRecencia(depois).map((n) => n.nome);
    t(`${c.id}: depois do load, 22 pessoas anotadas passam à frente do vilão na recência`, rec.indexOf("Morvath, o Sem-Rosto") >= TETO_DAS_PESSOAS.pessoas && rec.indexOf("Ilsa Marés") >= TETO_DAS_PESSOAS.pessoas);
    t(`${c.id}: e o contador retomado é o do último turno anotado`, retomarContador(r.npcs) <= r.contador && retomarContador(carregado) >= retomarContador(r.npcs));
  }
}

/* ============================================================ */
sec("8. lixo, null e imutabilidade");
{
  let erro = "";
  const lixo = [null, undefined, {}, "x", 7, [], { a: null }, { a: 3 }, { a: { nome: "" } }, { a: { nome: "Z", ultimaVez: "q" } }, { a: { ultimaVez: RELOGIO } }];
  for (const x of lixo) {
    try {
      retomarContador(x); normalizarRecencia(x); ordemDaRecencia(x); resumoNPCsParaPrompt(x);
      resumoCenaPrompt(x, "Aqui", null, { emCena: "x" }); resumoCenaPrompt(x, null, "lixo", { emCena: [null, 3, { nome: "Z" }] });
      formatarCanone(x, { teto: TETO_DO_CANONE, npcs: x, grupo: "y" }); formatarCanone(x, "lixo");
    } catch (e) { erro = `${JSON.stringify(x)}: ${e.message}`; }
  }
  t("nenhum lixo derruba a régua, o QUEM nem o cânone", !erro, erro);
  const congela = (o) => { Object.freeze(o); for (const v of Object.values(o)) if (v && typeof v === "object") congela(v); return o; };
  const reg = congela({ a: pessoa("A", 3), v: pessoa("V", RELOGIO) });
  let mudou = "";
  try { normalizarRecencia(reg); ordemDaRecencia(reg); resumoCenaPrompt(reg, "Aqui", null); formatarCanone(congela({ A: { tipo: "pessoa" } }), { teto: TETO_DO_CANONE, npcs: reg }); } catch (e) { mudou = e.message; }
  t("o registo e o cânone recebidos não são tocados", !mudou, mudou);
}

/* ============================================================ */
sec("9. a fiação no App.jsx (prova por texto)");
{
  /* Esta suíte só prova o MOTOR; a fiação vive em src/App.jsx (React), que
     nenhuma suíte importa. A prova possível aqui é textual: o padrão exato
     que o frontend escreveu está nas âncoras certas, \r\n normalizado para
     o CRLF do Windows não quebrar a comparação. */
  const app = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");
  const tem = (nome, trecho) => t(nome, app.includes(trecho));

  /* ponto 3 — o load retoma o contador do save, não volta a zero */
  tem("o load normaliza os relógios do save antes de guardar o registo",
    "npcsRef.current = normalizarRecencia(sv.npcs && typeof sv.npcs === \"object\" ? sv.npcs : {}); setNpcs(npcsRef.current); npcTurnoRef.current = retomarContador(npcsRef.current); npcTurnoNoLoadRef.current = npcTurnoRef.current;");

  /* ponto 4 — capítulo novo mantém o registo e retoma o contador dele */
  tem("o capítulo novo normaliza e retoma o contador do registo que sobrevive",
    "if (cap) npcsRef.current = normalizarRecencia(npcsRef.current);");
  tem("e a marca do load acompanha o contador também no capítulo novo",
    "npcTurnoRef.current = cap ? retomarContador(npcsRef.current) : 0; npcTurnoNoLoadRef.current = npcTurnoRef.current;");

  /* ponto 5 — nenhum relógio de parede escrevendo em ultimaVez, nos três
     sítios que escreviam (vilão, definirRelacao, e o líder do bando que
     aceita decreto — um terceiro achado nesta etapa e consertado igual) */
  t("nenhum ultimaVez: Date.now() sobra no App", !app.includes("ultimaVez: Date.now()"));
  tem("a revelação do vilão usa o contador de turno",
    "conhecidoEm: diaRef.current, ultimaVez: npcTurnoRef.current,");
  tem("definirRelacao preserva a marca de quando a pessoa foi de fato vista",
    "npcsRef.current = { ...reg, [nome]: { ...n, nome, relacao, ultimaVez: n.ultimaVez || npcTurnoRef.current } };");

  /* ponto 6 — a soleira do convite compara com a marca do load, não com zero */
  tem("a soleira do convite se cala até o mundo voltar a falar depois do load",
    "if (marcaDeAgora > npcTurnoNoLoadRef.current && !grupoCheio) {");

  /* ponto 7 — o Cronista marca a gente nova com o turno atual */
  /* MOVIDA NA MM14 · 10a (30/09), com o motivo: o nome que cria a ficha
     passou a ser `nomeCerto` (o que `nomeComDono` decide), não mais o
     `n.nome` cru — um homônimo de quem já importa mescla-se na ficha
     dela em vez de abrir uma segunda pessoa com o apelido. */
  tem("o Cronista marca a gente nova com o turno atual, não com o padrão (zero)",
    "criarNPC(String(nomeCerto).slice(0, 40), { ...n, ultimaVez: npcTurnoRef.current, conhecidoEm: diaRef.current });");

  /* ponto 8 — o QUEM do rodapé recebe emCena (citados nas 2 últimas falas) */
  tem("o rodapé calcula quem foi citado nas duas últimas falas do Mestre",
    "(mensagensRef.current || []).filter((m) => m && m.autor === \"mestre\").slice(-2).map((m) => m.texto).join(\" \");");
  /* MOVIDA NA MM8c-2 (30/09), com o motivo: a MM8c-2 acrescentou `elenco:
     nomesDoElenco()` ao final desta chamada, para o QUEM (perto e longe)
     pesar também pelo elenco (MM8b). O texto exato mudou; o que o ponto 8
     prova (emCena chegando a resumoCenaPrompt) continua verdadeiro. */
  /* MOVIDA OUTRA VEZ NA MM8d (30/09), com o motivo: a MM8d acrescentou
     `missao:` ao fim desta chamada (quem a missão ativa procura não sai do
     LONGE). O que se prova continua o mesmo — emCena chega a
     resumoCenaPrompt —, por isso a asserção passa a ler só o começo da
     chamada até ao emCena, que é o que ela sempre quis dizer. */
  /* MOVIDA OUTRA VEZ NA MM14 · 9a (30/09), com o motivo: a masmorra aberta
     entrou entre `emCena` e `elenco` (para PRESENTES ser a masmorra e a
     gente da cidade ir para o LONGE). A asserção volta a cortar antes do
     que mudou — ela já provava só "emCena chega a resumoCenaPrompt", nunca
     o texto inteiro da chamada. */
  tem("e manda isso como emCena para resumoCenaPrompt",
    "resumoCenaPrompt(npcsRef.current, cidadeAtualRef.current, mapaRef.current, { comGrupo: p.grupo || [], confidencias: confidenciasRef.current, emCena: emCenaAgora, masmorra: masmorraRef.current, elenco: nomesDoElenco()");

  /* ponto 9 — o cânone por recência: o 14º argumento na chamada por turno.
     MOVIDA NA MM8c-2 (30/09), com o motivo: o banco de nomes (5º
     argumento) passou a levar `elenco: elencoParaPovoar(...)` e este
     último objeto ganhou `elenco: nomesDoElenco()` ao lado de `npcs` — o
     cânone agora pesa pelo elenco também, não só pela recência. */
  tem("a chamada por turno de montarSystemPrompt manda o registo para a recência do cânone",
    "tempoInfoPrompt(), infoDivindade(), infoTitulo(), cenaDoPrompt(),\n      /* MM8c-1: o cânone lê a recência do registo para decidir quem sai do teto; MM8c-2: e o elenco, para pesar igual */\n      { npcs: npcsRef.current, elenco: nomesDoElenco() },\n    );");
}

console.log(`\nMM8c-1 · os tetos das pessoas: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
