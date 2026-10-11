/* AS BATIDAS (MM, a campanha que prende, 11/10) — a espinha enxuta

   A pessoa, depois da quarta sessão: *"achei a história de morna para frio,
   não prendeu muito"*. A espinha tinha nexo (o fio, v9.379) e continuava a
   ser uma lista de tarefas: 280 marcos em 12 campanhas, todos com a mesma
   cara, nenhum a dizer o que o herói tinha a perder nem que pergunta a cena
   respondia. Uma campanha à Matt/Brennan tem poucas batidas fortes por ato,
   e cada uma é uma cena com algo em jogo, uma pergunta e um fecho.

   O que esta suíte prova (batidas.js, saga.js, regiao.js):
     1. as tabelas: o tamanho do ato, o que está em jogo para cada passado
        de herói (todos os antecedentes da ficha), a pergunta de cada feitio;
     2. em 60 campanhas de região e 30 de continente, todo ato tem de 3 a 5
        batidas (ou todas as que tem, se tiver menos marcos), e o fecho é a
        cena que vira o ato — o confronto, a descida ao lugar do ato, ou a
        última cena forte; nunca o bicho que sobrou do sorteio;
     3. o que está em jogo é DESTE herói: cada batida diz a coisa do passado
        dele; sem antecedente, o que o trouxe até aqui;
     4. os marcos não mudam: a mesma semente estende os mesmos marcos, com
        ou sem antecedente — a batida é uma leitura deles;
     5. o envelope: a batida diz a cena, o que está em jogo e a pergunta; o
        caminho diz para que cena leva; o fecho pede uma escolha; a sombra
        continua a crescer com a história; e cabe no teto;
     6. o save: a batida e o antecedente sobrevivem ao JSON e à catraca; o
        lixo não passa; a espinha antiga continua a falar como falava;
     7. determinismo e imutabilidade.

   FALHA em HEAD (v9.385): batidas.js não existe e a espinha não tem batidas. */

import * as SG from "../src/saga.js";
import * as R from "../src/regiao.js";
import * as G from "../src/geografia.js";
import * as MB from "../src/mundo-base.js";
import * as AB from "../src/abertura.js";
import { ANTECEDENTES } from "../src/antecedentes.js";
import { ESTRUTURAS, estruturaPorId, custoDaEtapa, pesoDe } from "../src/historia.js";
import { moldePorId } from "../src/moldes.js";
import { sementeDe, generoDe } from "./medir-regiao.mjs";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const tenta = (f, d) => { try { return f(); } catch { return d; } };
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
const J = (v) => JSON.stringify(v);

const B = await import("../src/batidas.js").catch(() => ({}));
const ANTS = ANTECEDENTES.map((a) => a.id);
/* o teto do envelope é o de teste-fio-da-espinha.mjs: a batida paga-se com
   o que a regra tinha de repetido, e o teto de prompt é sagrado */
const TETO_DO_ENVELOPE = 1000;

function campanha(i, { regiao = true, antecedente = ANTS[i % ANTS.length] } = {}) {
  const semente = sementeDe(i), genero = generoDe(i), estrutura = ESTRUTURAS[i % ESTRUTURAS.length].id, molde = moldePorId("sobremundo");
  const mapa = regiao ? R.mapaDaCampanhaNova(R.mapaDaCriacao({ semente, molde, genero, estrutura, modo: "historia" })) : G.gerarGeografia(semente, molde);
  let esp = SG.estenderEspinha({ semente, mapa, genero, molde, estrutura, cidadeInicial: mapa.cidades[0].nome, antecedente });
  if (mapa.regiao) esp = R.espinhaNaRegiao(mapa, esp, { semente, genero, molde });
  return { semente, genero, molde, estrutura, mapa, esp, est: estruturaPorId(estrutura), antecedente };
}
/* o envelope do j-ésimo marco quando ele é o de agora (tudo antes, feito) */
function envelopes(esp, est) {
  const todos = esp.atos.flatMap((a, k) => a.marcos.map((m) => ({ m, k })));
  return todos.map(({ m, k }, j) => {
    const e2 = { ...esp, atos: esp.atos.map((a) => ({ ...a, marcos: a.marcos.map((x) => ({ ...x, feito: todos.findIndex((y) => y.m === x) < j })) })) };
    return { m, k, j, env: SG.envelopeDaEspinha(e2, k, est) || "" };
  });
}

sec("1. as tabelas");
{
  t("BATIDAS diz o tamanho de um ato: de 3 a 5", !!B.BATIDAS && B.BATIDAS.porAto.min === 3 && B.BATIDAS.porAto.max === 5);
  t("todo passado da ficha tem o que pôr em jogo (três jeitos de dizer)", !!B.EM_JOGO && ANTS.every((a) => Array.isArray(B.EM_JOGO.coisas[a]) && B.EM_JOGO.coisas[a].length >= 3));
  t("e sem antecedente também", !!B.EM_JOGO && Array.isArray(B.EM_JOGO.coisas.sem) && B.EM_JOGO.coisas.sem.length >= 1);
  const feitios = Object.keys(SG.FEITIOS);
  t("todo feitio tem o que está em jogo, e todo modelo diz a coisa do herói", !!B.EM_JOGO && feitios.every((f) => (B.EM_JOGO.porFeitio[f] || []).length && B.EM_JOGO.porFeitio[f].every((x) => x.includes("{coisa}"))));
  t("todo feitio tem a sua pergunta, e toda pergunta é pergunta", !!B.PERGUNTAS && feitios.every((f) => (B.PERGUNTAS[f] || []).length && B.PERGUNTAS[f].every((x) => x.trim().endsWith("?"))));
  t("o antecedente lê-se pelo id e pelo nome da ficha", tenta(() => B.antecedenteDe("soldado") === "soldado" && B.antecedenteDe("Soldado Reformado") === "soldado" && B.antecedenteDe("Herdeiro da Forja") === "ferreiro", false));
  t("e o que não é antecedente não passa", tenta(() => B.antecedenteDe("") === "" && B.antecedenteDe(null) === "" && B.antecedenteDe("pirata do espaço") === "", false));
}

sec("2. de 3 a 5 batidas por ato, e o fecho é a cena que vira o ato");
for (const regiao of [true, false]) {
  const n = regiao ? 60 : 30;
  let atos = 0, naFaixa = 0, umFecho = 0, fechoForte = 0, comMarcos = 0, marcos = 0, batidas = 0;
  const falhas = [];
  for (let i = 0; i < n; i++) {
    const c = campanha(i, { regiao });
    for (const a of c.esp.atos) {
      atos++;
      const bs = a.marcos.filter((m) => m.batida);
      marcos += a.marcos.length; batidas += bs.length;
      const alvo = Math.min(a.marcos.length, 3);
      if (bs.length >= alvo && bs.length <= 5) naFaixa++;
      else if (falhas.length < 3) falhas.push(`${c.semente} ato ${a.ato}: ${bs.length} de ${a.marcos.length}`);
      if (bs.filter((m) => m.batida.fecho).length === 1) umFecho++;
      if (!a.marcos.length) continue;
      comMarcos++;
      const f = a.marcos.find((m) => m.batida && m.batida.fecho);
      const depois = f ? a.marcos.slice(a.marcos.indexOf(f) + 1) : [];
      const conf = a.marcos.find((m) => m.feitio === "confronto");
      const doLugar = a.marcos.find((m) => m.feitio === "descer" && m.id.endsWith("|d"));
      /* o confronto fecha o último ato; a descida ao lugar do ato fecha um do
         meio (o que vem depois dela é o resto do sorteio, que a região diz
         que a história não precisa para andar) — ou o chefe que espera depois
         dela; sem nenhum dos dois, depois do fecho só fica caminho que não é
         cena por natureza */
      const iDe = (m) => a.marcos.indexOf(m);
      const certo = conf ? f === conf : doLugar ? (f === doLugar || (f.feitio === "enfrentar" && iDe(f) > iDe(doLugar))) : depois.every((m) => !["procurar", "descobrir", "confronto", "descer"].includes(m.feitio));
      /* e o ato pequeno que acaba num bicho fecha no último marco */
      if (f && (certo || f === a.marcos[a.marcos.length - 1])) fechoForte++;
    }
  }
  const rot = regiao ? "região" : "continente";
  t(`${rot}: todo ato tem de 3 a 5 batidas (${naFaixa}/${atos})`, atos > 0 && naFaixa === atos, falhas.join("; "));
  t(`${rot}: e um fecho só (${umFecho}/${comMarcos})`, umFecho === comMarcos);
  t(`${rot}: o fecho é o confronto, a descida ao lugar do ato, ou a última cena forte (${fechoForte}/${comMarcos})`, fechoForte === comMarcos);
  t(`${rot}: a espinha enxugou — ${batidas} batidas em ${marcos} marcos (${(batidas / atos).toFixed(2)} por ato)`, batidas < marcos && batidas / atos <= 5);
}

sec("3. o que está em jogo é DESTE herói");
{
  let total = 0, deste = 0, semAnt = 0, semOk = 0;
  for (let i = 0; i < 24; i++) {
    const c = campanha(i);
    const coisas = (B.EM_JOGO && B.EM_JOGO.coisas[c.antecedente]) || ["\u0000"];
    for (const m of c.esp.atos.flatMap((a) => a.marcos).filter((x) => x.batida)) {
      total++;
      if (coisas.some((k) => m.batida.emJogo.includes(k))) deste++;
    }
    const s = campanha(i, { antecedente: "" });
    for (const m of s.esp.atos.flatMap((a) => a.marcos).filter((x) => x.batida)) {
      semAnt++;
      if (((B.EM_JOGO && B.EM_JOGO.coisas.sem) || ["\u0000"]).some((k) => m.batida.emJogo.includes(k))) semOk++;
    }
  }
  t(`toda batida põe em jogo a coisa do passado do herói (${deste}/${total})`, total > 0 && deste === total);
  t(`sem antecedente, o que o trouxe até aqui (${semOk}/${semAnt})`, semAnt > 0 && semOk === semAnt);
  const c = campanha(3, { antecedente: "Herdeiro da Forja" });
  t("o nome da ficha serve (Herdeiro da Forja → a forja da família)", !!c.esp.fio && c.esp.fio.antecedente === "ferreiro" && c.esp.atos.flatMap((a) => a.marcos).filter((m) => m.batida).every((m) => /forja|martelo/.test(m.batida.emJogo)));
  const procura = c.esp.atos.flatMap((a) => a.marcos).filter((m) => m.batida && m.feitio === "procurar");
  t("a batida de gente diz quem é a pessoa, onde está, e o que está em jogo com ela", procura.length > 0 && procura.every((m) => m.batida.cena.startsWith(m.quem) && m.batida.cena.includes(m.onde)));
}

sec("4. os marcos não mudam: a batida é uma leitura deles");
{
  let iguais = 0, pesoIgual = 0;
  const n = 20;
  for (let i = 0; i < n; i++) {
    const a = campanha(i), b = campanha(i, { antecedente: "" });
    /* o que depende do herói: a batida e a reviravolta (o segredo do lugar não depende) */
    const sem = (e) => J(e.atos.map((x) => x.marcos.map(({ batida, reviravolta, ...m }) => m)));
    if (sem(a.esp) === sem(b.esp)) iguais++;
    /* o arco continua a virar quando o peso dos marcos do ato chega */
    if (a.esp.atos.every((x, k) => x.marcos.reduce((s, m) => s + pesoDe(SG.feitioDe(m.feitio).peso), 0) >= Math.min(custoDaEtapa(a.est, k), 1))) pesoIgual++;
  }
  t(`com ou sem antecedente, os mesmos marcos (${iguais}/${n})`, iguais === n);
  t(`e todo ato continua a ter peso para o arco virar (${pesoIgual}/${n})`, pesoIgual === n);
}

sec("5. o envelope diz a cena, o que está em jogo e a pergunta");
{
  let bat = 0, batOk = 0, cam = 0, camOk = 0, fechos = 0, fechoOk = 0, maior = 0, buraco = 0, ini = 0, iniSemNome = 0;
  for (let i = 0; i < 30; i++) {
    const c = campanha(i, { regiao: i % 3 !== 0 });
    const f = c.esp.fio;
    const todos = c.esp.atos.flatMap((a) => a.marcos);
    for (const x of envelopes(c.esp, c.est)) {
      maior = Math.max(maior, x.env.length);
      if (/\{\w+\}/.test(x.env)) buraco++;
      if (x.m.batida) {
        bat++;
        if (/batida \d+ de \d+/.test(x.env) && (x.m.reviravolta ? x.env.includes("REVIRAVOLTA") : x.env.includes("EM JOGO:")) && x.env.includes("A PERGUNTA:") && x.env.includes("?")) batOk++;
        if (x.m.batida.fecho) { fechos++; if (x.env.includes(SG.ENVELOPE_DAS_BATIDAS.fecho)) fechoOk++; }
      } else {
        cam++;
        const prox = todos.slice(todos.indexOf(x.m) + 1).find((m) => m.batida);
        /* quem, o quê ou onde é a cena seguinte (sem artigo: o envelope contrai "em O" em "no") */
        const chave = prox ? norm(prox.quem || prox.alvo || prox.onde).replace(/^(o|a|os|as) /, "") : "";
        if (x.env.includes("a caminho") && (!prox || norm(x.env).includes(chave))) camOk++;
      }
      if (x.k === 0 && f) { ini++; if (!x.env.includes(f.antagonista) && !x.env.includes(f.titulo)) iniSemNome++; }
    }
  }
  t(`toda batida, quando é a de agora, diz a cena, o que está em jogo e a pergunta (${batOk}/${bat})`, bat > 0 && batOk === bat);
  t(`todo caminho diz para que cena leva (${camOk}/${cam})`, cam > 0 && camOk === cam);
  t(`todo fecho pede uma escolha com preço, não um presságio (${fechoOk}/${fechos})`, fechos > 0 && fechoOk === fechos);
  t(`no primeiro ato, nem o nome nem o título do antagonista (${iniSemNome}/${ini})`, ini > 0 && iniSemNome === ini);
  t(`nenhum buraco por encher chega ao Narrador (${buraco})`, buraco === 0);
  t(`o envelope cabe (o maior tem ${maior} caracteres, teto ${TETO_DO_ENVELOPE})`, maior > 0 && maior <= TETO_DO_ENVELOPE);
  const c = campanha(1);
  const env = envelopes(c.esp, c.est);
  t("e nunca conta ao jogador que existe uma estrutura", env.every((x) => /NUNCA diga ao jogador que existe uma estrutura/.test(x.env)));
  t("a sombra cresce com a história: o fim diz o nome", env.filter((x) => x.k === c.esp.atos.length - 1).every((x) => x.env.includes(c.esp.fio.antagonista)));
}

sec("6. o save, o lixo e a espinha antiga");
{
  const c = campanha(2);
  const volta = SG.garantirEspinha(JSON.parse(J(c.esp)));
  t("a batida e o antecedente sobrevivem ao save (JSON e garantirEspinha)", J(volta) === J(c.esp) && volta.atos.some((a) => a.marcos.some((m) => m.batida)) && volta.fio.antecedente === c.antecedente);
  const lixo = SG.garantirEspinha({ atos: [{ marcos: [{ id: "x", batida: { emJogo: "y" } }, { id: "z", batida: "w" }, { id: "k", batida: { cena: "c".repeat(900), emJogo: "e".repeat(900), pergunta: "p".repeat(900) } }] }], fio: { antagonista: "A", antecedente: "pirata" } });
  t("batida sem cena, ou que não é objeto, não passa", !("batida" in lixo.atos[0].marcos[0]) && !("batida" in lixo.atos[0].marcos[1]));
  t("os textos da batida são aparados", lixo.atos[0].marcos[2].batida.cena.length <= 140 && lixo.atos[0].marcos[2].batida.emJogo.length <= 240 && lixo.atos[0].marcos[2].batida.pergunta.length <= 160);
  t("antecedente que não existe não se grava", !("antecedente" in lixo.fio));
  const antiga = { ...c.esp, atos: c.esp.atos.map((a) => ({ ...a, marcos: a.marcos.map(({ batida, ...m }) => m) })) };
  const ea = SG.envelopeDaEspinha(antiga, 0, c.est);
  t("a espinha antiga (sem batidas) fala como falava: marco, fio, regra de sempre", /marco 1 de \d+/.test(ea) && /O FIO \(do sistema — é a verdade desta peça\)/.test(ea) && !ea.includes("EM JOGO"));
  t("marcarBatidas com lixo devolve o que veio, sem erro", tenta(() => B.marcarBatidas(null) === null && J(B.marcarBatidas({ atos: [] })) === J({ atos: [] }) && B.marcarBatidas(undefined, null) === null, false));
  t("espinha sem marcos não ganha batida nem envelope", tenta(() => SG.envelopeDaEspinha(SG.garantirEspinha(B.marcarBatidas({ atos: [{ marcos: [] }] }, {})), 0, c.est) === "", false));
  const semMapa = tenta(() => B.marcarBatidas({ semente: "x", atos: [{ ato: 0, marcos: [{ id: "a", feitio: "procurar", quem: "Ana", onde: "Vau" }, { id: "b", feitio: "descobrir", onde: "O Poço" }] }] }, { antecedente: "orfao" }), null);
  t("sem mapa ainda marca (sem ofício nem vontade, com o que está em jogo)", !!semMapa && semMapa.atos[0].marcos.every((m) => m.batida && /família/.test(m.batida.emJogo)));
}

sec("7. determinismo e imutabilidade");
{
  const a = campanha(5), b = campanha(5);
  t("a mesma semente dá as mesmas batidas", J(a.esp) === J(b.esp));
  const antes = J(a.esp);
  SG.envelopeDaEspinha(a.esp, 0, a.est);
  tenta(() => B.marcarBatidas(a.esp, { semente: a.semente, mapa: a.mapa, genero: a.genero, molde: a.molde }), null);
  t("nem o envelope nem marcarBatidas mutam a espinha", J(a.esp) === antes);
  const re = tenta(() => SG.garantirEspinha(B.marcarBatidas(a.esp, { semente: a.semente, mapa: a.mapa, genero: a.genero, molde: a.molde })), null);
  t("marcar outra vez dá o mesmo (as batidas velhas saem antes)", !!re && J(re) === J(a.esp));
}

/* ============================================================
   O SEGREDO E A REVIRAVOLTA (v9.389)
   A quarta sessão: os dois "descobrir" fecharam por presença, "com um
   vendedor de papel e um preço"; e a reviravolta do sistema era null — as
   três que houve saíram todas do Mestre. O laço do antecedente que a
   abertura planta ("e um antigo companheiro de armas anda metido nisto")
   nunca era colhido.
   ============================================================ */
sec("8. todo \"descobrir\" guarda um segredo de verdade");
{
  let desc = 0, comSegredo = 0, doEscondido = 0, escondidoCerto = 0, envOk = 0, envDesc = 0, dizTabela = 0;
  for (let i = 0; i < 40; i++) {
    const c = campanha(i, { regiao: i % 4 !== 0 });
    const todos = c.esp.atos.flatMap((a) => a.marcos);
    for (const m of todos.filter((x) => x.feitio === "descobrir")) {
      desc++;
      if (m.segredo && MB.SEGREDOS.some((s) => s.o === m.segredo.coisa)) comSegredo++;
      if (m.segredo && B.SEGREDO_DIZ && Object.values(B.SEGREDO_DIZ).includes(m.segredo.diz)) dizTabela++;
      if (m.segredo && m.segredo.escondido) {
        doEscondido++;
        const cid = c.mapa.cidades.find((x) => x.nome === m.cidade);
        const sg = cid ? MB.segredosDaCidade(c.semente, cid, c.genero, c.molde, null).find((x) => norm(x.local) === norm(m.onde)) : null;
        if (sg && sg.o === m.segredo.coisa) escondidoCerto++;
      }
    }
    for (const x of envelopes(c.esp, c.est)) {
      if (x.m.feitio !== "descobrir" || !x.m.batida || x.m.reviravolta) continue;
      envDesc++;
      const prox = todos.slice(todos.indexOf(x.m) + 1).find((m) => !m.feito);
      const chave = prox ? norm(prox.quem || prox.alvo || prox.onde).replace(/^(o|a|os|as) /, "") : "";
      if (x.env.includes(x.m.segredo.coisa) && !/\{\w+\}/.test(x.env) && (!prox || norm(x.env).includes(chave)) && /CD \d+/.test(x.env)) envOk++;
    }
  }
  t(`todo "descobrir" guarda uma coisa do Escondido (${comSegredo}/${desc})`, desc > 0 && comSegredo === desc);
  t(`e o que ela prova sai da tabela (${dizTabela}/${desc})`, dizTabela === desc);
  t(`quando o lugar tem o seu no Escondido do mundo, é esse (${escondidoCerto}/${doEscondido})`, doEscondido > 0 && escondidoCerto === doEscondido);
  t(`o envelope diz a coisa, o que prova, o teste, e aponta para a peça seguinte (${envOk}/${envDesc})`, envDesc > 0 && envOk === envDesc);
  t("todo tipo do Escondido tem o que prova, e todo o que prova aponta para a peça seguinte", !!B.SEGREDO_DIZ && MB.SEGREDOS.every((s) => typeof B.SEGREDO_DIZ[s.tipo] === "string" && B.SEGREDO_DIZ[s.tipo].includes("{leva}")));
  const volta = SG.garantirEspinha(JSON.parse(J(campanha(3).esp)));
  t("o segredo sobrevive ao save", J(volta) === J(campanha(3).esp) && volta.atos.some((a) => a.marcos.some((m) => m.segredo)));
  const lixo = SG.garantirEspinha({ atos: [{ marcos: [{ id: "a", segredo: { coisa: "x" } }, { id: "b", segredo: { coisa: "c", diz: "d", dc: 999 } }, { id: "k", reviravolta: 3 }] }] });
  t("segredo sem o que prova não passa; a CD fica na régua; reviravolta que não é texto não passa", !("segredo" in lixo.atos[0].marcos[0]) && lixo.atos[0].marcos[1].segredo.dc === 30 && !("reviravolta" in lixo.atos[0].marcos[2]));
}

sec("9. a reviravolta do ato 0 colhe o laço que a abertura plantou");
{
  t("todo laço da abertura tem a sua verdade, e há uma sem antecedente", !!B.REVIRAVOLTA_DO_ATO0 && Object.keys(AB.LACOS_DO_ANTECEDENTE).every((k) => typeof B.REVIRAVOLTA_DO_ATO0[k] === "string") && typeof B.REVIRAVOLTA_DO_ATO0.sem === "string");
  t("e toda verdade liga a sombra à peça seguinte", !!B.REVIRAVOLTA_DO_ATO0 && Object.values(B.REVIRAVOLTA_DO_ATO0).every((v) => v.includes("{sombra}") && v.includes("{leva}")));
  let n = 0, uma = 0, noFecho = 0, plantada = 0, envOk = 0, semNome = 0;
  for (let i = 0; i < 36; i++) {
    const c = campanha(i, { regiao: i % 3 !== 0 });
    if (c.esp.atos.length < 2) continue;
    n++;
    const revs = c.esp.atos.flatMap((a) => a.marcos).filter((m) => m.reviravolta);
    if (revs.length === 1) uma++;
    const a0 = c.esp.atos[0].marcos;
    const f0 = a0.find((m) => m.batida && m.batida.fecho);
    if (f0 && f0.reviravolta) noFecho++;
    /* a abertura do mesmo herói diz o laço que a reviravolta colhe */
    const ab = tenta(() => AB.abrirAbertura({ semente: c.semente, mapa: c.mapa, cidade: c.mapa.cidades[0].nome, espinha: c.esp, estrutura: c.estrutura, antecedente: c.antecedente, genero: c.genero, molde: c.molde, nivel: 1, dia: 1 }), null);
    const laco = AB.LACOS_DO_ANTECEDENTE[c.antecedente];
    if (ab && laco && ab.abertura.razao.includes(laco.o)) plantada++;
    const x = envelopes(c.esp, c.est).find((y) => f0 && y.m.id === f0.id);
    const prox = c.esp.atos[1].marcos[0];
    const chave = prox ? norm(prox.quem || prox.alvo || prox.onde).replace(/^(o|a|os|as) /, "") : "";
    if (x && x.env.includes("REVIRAVOLTA") && norm(x.env).includes(chave)) envOk++;
    if (x && c.esp.fio && !x.env.includes(c.esp.fio.antagonista) && !x.env.includes(c.esp.fio.titulo)) semNome++;
  }
  t(`toda campanha com mais de um ato tem UMA reviravolta (${uma}/${n})`, n > 0 && uma === n);
  t(`e ela mora no fecho do primeiro ato (${noFecho}/${n})`, noFecho === n);
  t(`plantada na abertura: a razão do herói diz o laço que ela colhe (${plantada}/${n})`, plantada === n);
  t(`o envelope do fecho diz a REVIRAVOLTA e aponta para o ato seguinte (${envOk}/${n})`, envOk === n);
  t(`e ainda não diz o nome nem o título do antagonista (${semNome}/${n})`, semNome === n);
  const s = campanha(4, { antecedente: "" });
  const r = s.esp.atos.flatMap((a) => a.marcos).find((m) => m.reviravolta);
  t("sem antecedente: o que o trouxe não foi acaso, na cidade dele", !!r && r.reviravolta.includes("não foi acaso") && s.mapa.cidades.some((cc) => r.reviravolta.includes(cc.nome)));
}

console.log(`\nbatidas: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
