/* O QUE JÁ EXISTE CHEGA À CENA (Fase MM, MM19, 11/10) — a 5.ª sessão de prova

   A 5.ª sessão (mente/mm11-sessao-5.md) mediu o que a espinha enxuta
   (v9.389–v9.393) entregou ao Narrador: as batidas — a cena, o que está em
   jogo, a pergunta — em 0 dos pedidos; o momento do antagonista ("A OBRA
   DELE") cortado na abertura e nos turnos cheios; e a escada da escuta, que
   disparou o sinal, o "vem buscar" e o "cobra" aos 4, 7 e 10 turnos
   sem avanço, sem que nenhum virasse cena — a linha dizia "um NPC procura o
   herói NA TAVERNA" e apontava para a taverna que o herói tinha deixado.

   O registo das chamadas está reduzido em `registo-s5-pauta.json`: a pauta
   ENVIADA em cada um dos 66 pedidos que a levaram, linha a linha. A MEDIDA
   (o "faltou por quê"), refeita aqui a partir dele:

     · a batida não coube em 66 de 66: era UMA linha de 650–910 caracteres
       (a batida, o fio inteiro e a regra), e antes dela (prio 3) o teto já
       ia gasto em 897–1398 dos 1400 — o corte guloso saltava-a e metia a
       economia da praça (2,5) e a cauda do ONDE (1,2) no lugar;
     · o momento do antagonista chegou em 24 de 46 turnos fora da luta; os
       22 que faltaram foram TODOS o teto (gasto ≥ 1176 antes da prio 3,1);
       e foi em 20 de 20 turnos da luta com o Dragão, onde não mudava nada;
     · os 9 turnos de degrau levaram o degrau (o rumo é 2,42 e chegou):
       faltou-lhe a CENA — a forma do encalhe, o passo da missão de um sítio
       já deixado, e "na taverna" com o herói em Ponte Lenta.

   O que esta suíte prova (pauta.js, saga.js, escuta.js, batidas.js):
     1. a régua: a batida e o momento passam à frente da decoração (a
        economia, a cauda do ONDE) e atrás da escuta e dos vetos; na luta o
        momento cede;
     2. o envelope é a batida, e cabe; o fio e a regra mudaram-se para a
        última linha do momento;
     3. a 5.ª sessão reconstruída com as funções do jogo: a batida em X de
        46 turnos fora da luta (era 0), o momento em Y de 46 (era 24), e
        nada do que a escuta e os vetos mandaram deixa de chegar;
     4. os três degraus da sessão viram cena: um fato com nome e lugar, ali
        onde o herói está, e nunca "na taverna" nem a Candeia;
     5. lixo, determinismo e imutabilidade.

   FALHA em HEAD (v9.393): `cenaDoDegrau` não existe, a batida reconstruída
   chega em 0 de 46, e o momento cabe na luta. */

import fs from "node:fs";
const P = await import("../src/pauta.js");
const SG = await import("../src/saga.js");
const E = await import("../src/escuta.js");
const B = await import("../src/batidas.js");
const R = await import("../src/regiao.js");
const { ESTRUTURAS, estruturaPorId } = await import("../src/historia.js");
const { moldePorId } = await import("../src/moldes.js");
const { sementeDe, generoDe } = await import("./medir-regiao.mjs");

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const tenta = (f, d) => { try { return f(); } catch { return d; } };
const J = (v) => JSON.stringify(v);
const REG = JSON.parse(fs.readFileSync(new URL("./registo-s5-pauta.json", import.meta.url), "utf8"));
const secao = (id) => P.SECOES.find((s) => s.id === id);
const prio = (id, i) => (typeof P.prioDaLinha === "function" ? P.prioDaLinha(secao(id), i) : secao(id).prio + i * 0.1);

/* ---------------- a 5.ª sessão, como o save a guardava ----------------
   A espinha de Gaspar (acólito): o ato 0 com Edric na Ponte Lenta (a batida
   que a sessão cita: "Edric é a última ponta viva de os votos que o herói
   quebrou", "Edric diz a verdade inteira, ou só a que lhe convém?"), a
   Biblioteca do Peregrino à guarda de Corwin, e a Boca no fecho, com a
   etapa do relógio que a pauta mostrava ("em Casa da Fonte um carroceiro
   sem rosto recruta…"). O fio: o Dragão Jovem a Mão Fria e o prego dobrado
   em gancho. A abertura: a pista Osric Pé-Leve na Candeia Faiscante. */
const ESPINHA = SG.garantirEspinha({
  estrutura: "jornada", semente: "s5",
  fio: { antagonista: "Dragão Jovem a Mão Fria", titulo: "a Mão Fria", especie: "Dragão Jovem", motivo: "quer de volta o que a ordem perdeu", antecedente: "acolito", inicio: 1, assinatura: "um prego dobrado em gancho" },
  atos: [
    { ato: 0, marcos: [
      { id: "espinha|0|0", feitio: "procurar", titulo: "Encontrar Edric", quem: "Edric", onde: "A Ponte Lenta", cidade: "Rio Profundo", condicao: { tipo: "falar_com", alvo: "Edric" },
        batida: { cena: "Edric, músico de canto, em A Ponte Lenta, em Rio Profundo", emJogo: "Edric é a última ponta viva de os votos que o herói quebrou; perder esta conversa é perder o rasto", pergunta: "Edric diz a verdade inteira, ou só a que lhe convém?" } },
      { id: "espinha|0|1", feitio: "descobrir", titulo: "O que A Biblioteca do Peregrino esconde", onde: "A Biblioteca do Peregrino", cidade: "Casa da Fonte", ehLugar: true, condicao: { tipo: "revelar", alvo: "A Biblioteca do Peregrino" },
        batida: { cena: "A Biblioteca do Peregrino, em Casa da Fonte, à guarda de Corwin o Silencioso", emJogo: "o que aqui se esconde é a prova de a liberdade que o herói roubou à ordem que {sombra} quer apagada", pergunta: "o herói leva a prova, ou deixa-a onde está e finge que não viu?" },
        segredo: { coisa: "um cofre pequeno atrás de um quadro", diz: B.SEGREDO_DIZ.cofre, acha: "Percepção", dc: 16, escondido: true } },
      { id: "espinha|0|2", feitio: "descer", titulo: "Descer à Boca de Pedra Torta", onde: "A Boca de Pedra Torta", cidade: "Rio Profundo", ehLugar: true, condicao: { tipo: "masmorra", alvo: "A Boca de Pedra Torta" },
        batida: { cena: "o fundo de A Boca de Pedra Torta", emJogo: "no fundo de A Boca de Pedra Torta está o que falta saber sobre o que a ordem de que o herói fugiu procura", pergunta: "o herói sobe com o que foi buscar, e inteiro?", fecho: true },
        relogio: { passo: 0, gente: "", cidade: "Casa da Fonte" } },
    ] },
    { ato: 1, marcos: [{ id: "espinha|1|0", feitio: "procurar", titulo: "Encontrar Inês", quem: "Inês", onde: "O Salão das Cinzas", cidade: "Campos Escarlates",
      batida: { cena: "Inês, em O Salão das Cinzas, em Campos Escarlates", emJogo: "Inês sabe uma coisa sobre os votos que o herói quebrou", pergunta: "Inês confia no herói antes de confiar no medo?", fecho: true } }] },
    { ato: 2, marcos: [{ id: "espinha|2|0", feitio: "confronto", titulo: "Acabar com Dragão Jovem a Mão Fria", alvo: "Dragão Jovem a Mão Fria", onde: "Bastião de Mil Bocas",
      batida: { cena: "{sombra}, em Bastião de Mil Bocas", emJogo: "{sombra} tem nas mãos os votos que o herói quebrou — e sabe o nome do herói", pergunta: "o que o herói está disposto a perder para acabar com isto?", fecho: true } }] },
  ],
});
/* o marco de Edric fecha quando o Cronista regista a conversa (a chamada 70
   do registo; a pauta seguinte é a 71) */
const espinhaNo = (k) => (k >= 71 ? { ...ESPINHA, atos: ESPINHA.atos.map((a) => ({ ...a, marcos: a.marcos.map((m) => (m.id === "espinha|0|0" ? { ...m, feito: true, dia: 1 } : m)) })) } : ESPINHA);
const EST = estruturaPorId("jornada");
const ABERTURA = { principalId: "mis_principal", cidade: "Casa da Fonte", titulo: "O rasto de Edric",
  pista: { nome: "Osric Pé-Leve", papel: "taverneiro", local: "Candeia Faiscante" },
  alvo: { feitio: "procurar", quem: "Edric", onde: "A Ponte Lenta", origem: "Casa da Fonte" } };
const MISSOES = [{ id: "mis_principal", titulo: "O rasto de Edric", tipo: "principal", status: "ativa",
  etapas: [{ tipo: "ir_a", alvo: "Candeia Faiscante", lugar: true }, { tipo: "falar_com", alvo: "Edric", onde: "A Ponte Lenta" }] }];
const PASSO = "Procurar Osric Pé-Leve na Candeia Faiscante"; /* o que a sessão mandou em todo turno */

sec("1. a régua: o que move a história ganha do que a decora");
{
  t("a pauta exporta a régua de cada linha (prioDaLinha)", typeof P.prioDaLinha === "function");
  const bat = prio("momento", 0), mom = prio("momento", 1);
  t(`a batida (${bat}) passa à frente da economia da praça (${prio("economia", 0)})`, bat < prio("economia", 0));
  t(`e da cauda do ONDE — o "comporta" que se repete (${prio("onde", 2)})`, bat < prio("onde", 2) && mom < prio("onde", 2));
  t("e do que a cidade diz, de quem está, da gente, do contra", ["cidade", "quem", "gente", "contra", "daqui"].every((id) => bat < prio(id, 0)));
  t(`o momento do fio vem logo a seguir (${mom})`, mom > bat);
  t("a promessa que volta (uma por turno, curta) e a planta inteira da masmorra entram antes da batida", prio("volta", 0) < bat && [0, 1, 2, 3, 4].every((i) => prio("masmorra", i) < bat));
  t("mas a escuta e os vetos não cedem a ninguém: rumo, fecho e os cinco vetos cortam depois de nada disto",
    [prio("rumo", 0), prio("fecho", 0), ...[0, 1, 2, 3, 4].map((i) => prio("naoPode", i))].every((p) => p < bat));
  t("o lugar (ferro) e o endereço (⌖) continuam à frente de tudo", prio("onde", 0) === P.PRIO_DE_FERRO && prio("onde", 1) < prio("naoPode", 0));
  t("o resto do momento corta como sempre (3 e mais)", prio("momento", 2) >= 3);
  t("as outras secções não mudaram de régua", prio("gente", 1) === secao("gente").prio + 0.1 && prio("desfecho", 0) === P.PRIO_DE_FERRO);
  t("na luta o momento cede inteiro", (P.SECOES_QUE_CEDEM.luta || []).includes("momento"));
  const fora = P.cederNaCena({ momento: ["ESPINHA — x"], onde: ["em X"] }, { masmorra: true });
  t("fora da luta, não", !!fora.momento);
  t("e numa pergunta que uma ficha respondeu cede também: responde-se, e o único empurrão é a ponte do rumo", (P.SECOES_QUE_CEDEM.pergunta || []).includes("momento") && !P.cederNaCena({ momento: ["x"], pergunta: ["y"] }, {}).momento);
}

sec("2. o envelope é a batida, e cabe");
{
  let n = 0, cabe = 0, maior = 0, temBatida = 0, semFioNaBatida = 0, fioNoMomento = 0, regra = 0;
  for (let i = 0; i < 12; i++) {
    const semente = sementeDe(i), genero = generoDe(i), estrutura = ESTRUTURAS[i % ESTRUTURAS.length].id, molde = moldePorId("sobremundo");
    const mapa = R.mapaDaCampanhaNova(R.mapaDaCriacao({ semente, molde, genero, estrutura, modo: "historia" }));
    let esp = SG.estenderEspinha({ semente, mapa, genero, molde, estrutura, cidadeInicial: mapa.cidades[0].nome, antecedente: "acolito", dia: 1 });
    if (mapa.regiao) esp = R.espinhaNaRegiao(mapa, esp, { semente, genero, molde });
    const env = SG.envelopeDaEspinha(esp, 0, estruturaPorId(estrutura));
    const mo = SG.momentoDoFio(esp, 0, { dia: 1 });
    n++;
    maior = Math.max(maior, env.length);
    if (env.length <= 420) cabe++;
    if (/batida \d+ de \d+/.test(env) && env.includes("EM JOGO:") && env.includes("A PERGUNTA:")) temBatida++;
    if (!/O FIO \(do sistema/.test(env)) semFioNaBatida++;
    const ult = mo[mo.length - 1] || "";
    if (/O FIO \(do sistema/.test(ult)) fioNoMomento++;
    if (/NUNCA diga ao jogador que existe uma estrutura/.test(ult)) regra++;
  }
  t(`o envelope diz a cena, o que está em jogo e a pergunta (${temBatida}/${n})`, temBatida === n);
  t(`e só isso: o fio saiu dele (${semFioNaBatida}/${n})`, semFioNaBatida === n);
  t(`e cabe numa linha da pauta — o maior tem ${maior} (era 650–910)`, cabe === n);
  t(`o fio mudou-se para a última linha do momento (${fioNoMomento}/${n})`, fioNoMomento === n);
  t(`com a regra de não anunciar a estrutura (${regra}/${n})`, regra === n);
  const e5 = SG.envelopeDaEspinha(ESPINHA, 0, EST);
  t("a batida da 5.ª sessão: Edric, os votos quebrados e a pergunta", /Edric/.test(e5) && /dos votos que o herói quebrou/.test(e5) && /A PERGUNTA: Edric diz a verdade inteira/.test(e5), e5);
}

/* ---------------- a reconstrução ----------------
   A pauta do turno, como o App a montaria agora: as linhas que a sessão
   enviou (o que o teto deixou passar) e, no lugar do momento, o que a
   espinha da sessão dá hoje — o envelope da batida e as linhas do fio (o
   App já põe as duas na secção `momento`). Nos turnos de degrau, o rumo é
   o de `linhaDoRumo` com o mundo (a fiação que o App ainda não tem; a
   secção 4 prova-o à parte). As linhas que a sessão perdeu para o teto não
   estão no registo; as de régua à frente da batida (A FALA, O PESO) não
   aparecem em nenhum dos 66 pedidos. */
const linha = (i) => REG.linhas[i];
function pautaDo(tu, { comDegrau = true } = {}) {
  const p = {};
  for (const [id, ixs] of Object.entries(tu.secoes)) if (id !== "momento") p[id] = ixs.map(linha);
  const esp = espinhaNo(tu.k);
  p.momento = [SG.envelopeDaEspinha(esp, 0, EST), ...SG.momentoDoFio(esp, 0, { dia: 1 })].filter(Boolean);
  if (comDegrau && tu.degrau) {
    const d = E.ESCADA_DA_ESCUTA.find((x) => x.id === tu.degrau);
    p.rumo = [E.linhaDoRumo({ pedido: { doJogador: tu.doJogador, pergunta: tu.pergunta }, degrau: d, passo: PASSO, semente: 1,
      mundo: { aqui: linha(tu.secoes.onde[0]), abertura: ABERTURA, missoes: MISSOES, espinha: esp, ato: 0, dia: 1 } })];
  }
  return P.cederNaCena(p, { luta: tu.luta, masmorra: tu.masmorra });
}

sec("3. a 5.ª sessão, reconstruída com as funções do jogo");
{
  const fora = REG.turnos.filter((x) => !x.luta);
  const luta = REG.turnos.filter((x) => x.luta);
  t(`o registo: ${REG.turnos.length} pedidos com pauta, ${fora.length} fora da luta`, REG.turnos.length === 66 && fora.length === 46);
  const antesBatida = REG.turnos.filter((x) => (x.secoes.momento || []).some((i) => /^ESPINHA/.test(linha(i)))).length;
  const antesMomento = fora.filter((x) => (x.secoes.momento || []).some((i) => /^A OBRA DELE/.test(linha(i)))).length;
  t(`antes (o que a sessão enviou): a batida em ${antesBatida} de 66, o momento em ${antesMomento} de 46`, antesBatida === 0 && antesMomento === 24);
  let batida = 0, momento = 0, acima = 0, perdeu = [], degraus = 0, degrausCom = 0, decorou = [];
  const DECORA = ["economia", "cidade", "daqui", "gente", "quem", "forma", "antes", "mundo", "foraDeCena", "aliado", "vilao"];
  for (const tu of fora) {
    const p = pautaDo(tu);
    const txt = P.textoDaPauta(p, { turno: tu.turno });
    if (txt.length > P.TETO_DA_PAUTA) acima++;
    if (/ESPINHA — batida \d+ de \d+:.*EM JOGO:.*A PERGUNTA:/.test(txt)) batida++;
    if (/A OBRA DELE \(corre agora/.test(txt)) momento++;
    else {
      /* onde a obra do antagonista falta, nenhuma decoração (nem a cauda do
         ONDE) lhe tirou o lugar: sem decoração nenhuma, continuaria a não
         caber — quem o tirou foi a história. (A decoração que ainda entra
         é a que cabe na sobra que a obra não enche.) */
      const semDecoracao = Object.fromEntries(Object.entries(p).filter(([id]) => !DECORA.includes(id)).map(([id, ls]) => [id, id === "onde" ? ls.slice(0, 2) : ls]));
      if (/A OBRA DELE \(corre agora/.test(P.textoDaPauta(semDecoracao, { turno: tu.turno }))) decorou.push(`M${tu.M}`);
    }
    /* nada do que a escuta e os vetos mandaram deixa de chegar */
    for (const id of ["onde", "naoPode", "rumo", "fecho", "masmorra", "volta", "pergunta", "desfecho"]) {
      if (id === "onde") { if (!txt.includes(linha(tu.secoes.onde[0]))) perdeu.push(`${tu.M}:onde`); continue; }
      if (id === "rumo" && tu.degrau) continue;
      for (const i of tu.secoes[id] || []) if (!txt.includes(linha(i))) perdeu.push(`${tu.M}:${id}`);
    }
    if (tu.degrau) { degraus++; if (/aqui e agora: .*é fato: entra nesta resposta/.test(txt)) degrausCom++; }
  }
  console.log(`      batida ${batida}/46 · momento ${momento}/46 · degraus em cena ${degrausCom}/${degraus}`);
  /* as que faltam: a pergunta que uma ficha respondeu (M35 — a resposta
     passa à frente e o momento cede), o degrau que cobra (que traz a obra
     dele na própria linha) e a planta inteira da masmorra (M42–M48) */
  t(`a batida chega em ${batida} de 46 turnos fora da luta (era 0)`, batida >= 41);
  /* A obra do antagonista e a batida (~223 e ~270) mal cabem as duas num
     turno que já leva o lugar, os vetos, o rumo e o fecho. Com a cabeça da
     pauta de antes (293), a batida chegava em 39 e a obra caía para 11; a
     cabeça encurtada (228, a mesma regra) devolve-lhe o lugar. Onde ainda
     falta, só a HISTÓRIA lho tirou — nunca a decoração. */
  t(`a obra do antagonista chega em ${momento} de 46 (era 24), e onde falta nenhuma decoração entrou no lugar dela${decorou.length ? " — " + decorou.slice(0, 6).join(", ") : ""}`, momento > 24 && decorou.length === 0);
  t("a cabeça da pauta diz a regra inteira em 228 caracteres (era 293)", (() => {
    const c = P.textoDaPauta({ onde: ["x"] }, { turno: 13 }).split("\n")[0];
    return c.length <= 230 && /Abra pelo que eu fiz ou perguntei e conte COMO/.test(c) && /não se discute/.test(c) && /ETIQUETA DE SISTEMA/.test(c) && /nem na boca de ninguém/.test(c);
  })());
  t(`a escuta e os vetos: nenhuma linha que chegou na sessão deixa de chegar${perdeu.length ? " — " + perdeu.slice(0, 6).join(", ") : ""}`, perdeu.length === 0);
  t(`e os degraus, já em cena, cabem com o resto (${degrausCom}/${degraus})`, degraus === 9 && degrausCom === 9);
  t("o teto da pauta não se mexe: nenhum pedido passa dos 1400", acima === 0 && P.TETO_DA_PAUTA === 1400);
  let lutaMomento = 0, lutaContra = 0;
  for (const tu of luta) {
    const txt = P.textoDaPauta(pautaDo(tu), { turno: tu.turno });
    if (/MOMENTO/.test(txt)) lutaMomento++;
    if ((tu.secoes.contra || []).every((i) => txt.includes(linha(i)))) lutaContra++;
  }
  t(`na luta com o Dragão o momento já não gasta a pauta (${lutaMomento} de ${luta.length}; eram 20)`, lutaMomento === 0);
  t(`e o que a oposição quer continua a chegar (${lutaContra}/${luta.length})`, lutaContra === luta.length);
}

sec("4. o degrau vira cena: um fato com nome e lugar, onde o herói está");
{
  t("a tabela existe, e cada degrau da escada tem a sua cena", !!E.DEGRAU_EM_CENA && E.ESCADA_DA_ESCUTA.filter((d) => d.n > 0).every((d) => !!E.DEGRAU_EM_CENA.rumo[d.id] && !!E.DEGRAU_EM_CENA[d.id]));
  const cenas = {};
  for (const tu of REG.turnos.filter((x) => x.degrau)) {
    const d = E.ESCADA_DA_ESCUTA.find((x) => x.id === tu.degrau);
    const aqui = linha(tu.secoes.onde[0]);
    const c = tenta(() => E.cenaDoDegrau(d, { aqui, abertura: ABERTURA, missoes: MISSOES, espinha: espinhaNo(tu.k), ato: 0, dia: 1, semente: tu.turno }), "");
    (cenas[tu.degrau] = cenas[tu.degrau] || []).push({ aqui, c, antes: linha(tu.secoes.rumo[0]) });
  }
  const aquiOk = (x) => x.c.includes("Ponte Lenta") && x.aqui.includes("Ponte Lenta");
  const nunca = (x) => !/na taverna|Candeia/.test(x.c);
  t("a sessão: os três degraus, cada um em três turnos, todos em Ponte Lenta", ["sinal", "vem_buscar", "cobra"].every((k) => (cenas[k] || []).length === 3 && cenas[k].every((x) => x.aqui === "em Ponte Lenta")));
  t("antes, os três apontavam para a Candeia e um mandava procurar o herói na taverna",
    ["sinal", "vem_buscar", "cobra"].every((k) => (cenas[k] || []).every((x) => /Candeia Faiscante/.test(x.antes))) && (cenas.vem_buscar || []).every((x) => /na taverna/.test(x.antes)));
  let certos = 0;
  const s = cenas.sinal || [], v = cenas.vem_buscar || [], c = cenas.cobra || [];
  const sinalOk = s.length && s.every((x) => aquiOk(x) && nunca(x) && /Edric/.test(x.c));
  const vemOk = v.length && v.every((x) => aquiOk(x) && nunca(x) && /^Edric vem ter com o herói em Ponte Lenta/.test(x.c));
  const cobraOk = c.length && c.every((x) => aquiOk(x) && nunca(x) && x.c.includes("um prego dobrado em gancho") && /carroceiro sem rosto/.test(x.c) && /Casa da Fonte/.test(x.c));
  certos = [sinalOk, vemOk, cobraOk].filter(Boolean).length;
  console.log("      sinal: " + (s[0] || {}).c);
  console.log("      vem buscar: " + (v[0] || {}).c);
  console.log("      cobra: " + (c[0] || {}).c);
  t("o sinal: algo que ele ouve ali, com o nome de quem a história procura (Edric, que está ali mesmo)", !!sinalOk);
  t("o vem buscar: uma pessoa com nome, do fio, chega até ele onde ele está", !!vemOk);
  t("o cobra: a marca dele à vista ali, e o fato do relógio — o mesmo que o MOMENTO diz", !!cobraOk);
  t(`degraus com fato e lugar certos: ${certos} de 3 (era 0)`, certos === 3);
  /* longe: quem vem diz de onde vem, e o sinal diz onde está quem se procura */
  const d1 = E.ESCADA_DA_ESCUTA.find((x) => x.id === "sinal"), d2 = E.ESCADA_DA_ESCUTA.find((x) => x.id === "vem_buscar");
  const longe = tenta(() => E.cenaDoDegrau(d1, { aqui: "em estrada do norte", espinha: ESPINHA, ato: 0, abertura: ABERTURA, semente: 0 }), "");
  t("longe do alvo, o sinal acontece onde o herói está e diz onde o alvo está", /^em estrada do norte, /.test(longe) && /Edric/.test(longe) && /na Ponte Lenta/.test(longe), longe);
  const vem = tenta(() => E.cenaDoDegrau(d2, { aqui: "em estrada do norte", espinha: ESPINHA, ato: 0, abertura: ABERTURA, semente: 0 }), "");
  t("e quem vem de longe diz de onde vem", /^Edric vem ter com o herói em estrada do norte, vindo da Ponte Lenta/.test(vem), vem);
  const depois = tenta(() => E.cenaDoDegrau(d2, { aqui: "em Ponte Lenta", espinha: espinhaNo(99), ato: 0, abertura: ABERTURA, semente: 0 }), "");
  t("com Edric já encontrado, quem vem é a peça seguinte da espinha… ou, sem pessoa nela, a pista", /^Osric Pé-Leve vem ter com o herói em Ponte Lenta, vindo de Candeia Faiscante/.test(depois), depois);
  const sinalLugar = tenta(() => E.cenaDoDegrau(d1, { aqui: "em Ponte Lenta", espinha: espinhaNo(99), ato: 0, semente: 0 }), "");
  t("e o sinal de um lugar que guarda fala dele", /Biblioteca do Peregrino/.test(sinalLugar) && /^em Ponte Lenta, /.test(sinalLugar), sinalLugar);
  const d3 = E.ESCADA_DA_ESCUTA.find((x) => x.id === "cobra");
  const comNemesis = tenta(() => E.cenaDoDegrau(d3, { aqui: "em Ponte Lenta", espinha: ESPINHA, ato: 0, vilao: { daEspinha: true, status: "ativa" }, semente: 0 }), "");
  t("com a nêmesis do fio viva o relógio cala-se, e a cobrança acontece ali mesmo", /^em Ponte Lenta: /.test(comNemesis) && !/prego/.test(comNemesis), comNemesis);
  const r = E.linhaDoRumo({ pedido: { doJogador: true, pergunta: true }, degrau: d2, passo: PASSO, semente: 1, mundo: { aqui: "em Ponte Lenta", espinha: ESPINHA, ato: 0, abertura: ABERTURA } });
  t("na linha do rumo, a escuta continua primeiro (responder) e a cena depois, sem o passo do sítio deixado",
    r.startsWith(E.RUMOS.pergunta) && r.includes("e alguém vem até mim, aqui e agora: Edric") && r.endsWith(E.DEGRAU_EM_CENA.rumo.fato) && !r.includes("Candeia"), r);
}

sec("5. lixo, determinismo e imutabilidade");
{
  const d = E.ESCADA_DA_ESCUTA.find((x) => x.id === "cobra");
  t("lixo não quebra e não inventa", ["", null, undefined, {}, 0].every((x) => tenta(() => E.cenaDoDegrau(x, x), "x") === "") && tenta(() => E.cenaDoDegrau(d, null), "x") === "");
  t("o degrau 0 não tem cena", tenta(() => E.cenaDoDegrau(E.ESCADA_DA_ESCUTA[0], { aqui: "em X", espinha: ESPINHA, abertura: ABERTURA }), "x") === "");
  t("sem fio nenhum, nada: a linha do rumo fica a de antes", tenta(() => E.cenaDoDegrau(d, { aqui: "em X" }), "x") === "");
  const sem = E.linhaDoRumo({ pedido: { doJogador: true }, degrau: d, passo: PASSO, semente: 1 });
  t("sem o mundo, o rumo é o de sempre (o App que ainda não o passa não muda)", sem === E.linhaDoRumo({ pedido: { doJogador: true }, degrau: d, passo: PASSO, semente: 1, mundo: null }) && sem.includes(PASSO));
  const ctx = { aqui: "em Ponte Lenta", espinha: ESPINHA, abertura: ABERTURA, ato: 0, dia: 1, semente: 7 };
  const antes = J(ctx);
  const a = E.cenaDoDegrau(d, ctx), b = E.cenaDoDegrau(d, ctx);
  t("a mesma semente dá a mesma cena", a === b && a.length > 0);
  t("e o recebido não muda", J(ctx) === antes);
  const p0 = { momento: ["a"], onde: ["b", "c", "d"] };
  const c0 = J(p0);
  P.textoDaPauta(p0); P.cederNaCena(p0, { luta: true });
  t("a pauta recebida não muda", J(p0) === c0);
  t("prioDaLinha com lixo não quebra", Number.isFinite(tenta(() => P.prioDaLinha(null, null), NaN)) && Number.isFinite(tenta(() => P.prioDaLinha({}, "x"), NaN)));
  t("a espinha antiga (sem batidas) continua a falar como falava", (() => {
    const velha = { ...ESPINHA, atos: ESPINHA.atos.map((a) => ({ ...a, marcos: a.marcos.map(({ batida, ...m }) => m) })) };
    return /^ESPINHA — .*marco 1 de/.test(SG.envelopeDaEspinha(velha, 0, EST)) && J(SG.momentoDoFio(velha, 0, { dia: 1 })) === "[]";
  })());
}

console.log(`\nbatida na cena (MM19): ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
