/* O RELÓGIO DO ANTAGONISTA (MM, a campanha que prende, 11/10) — o vilão vivo

   A quarta sessão: `vilaoAgiu = -99`, `nemesis = null`. O plano de vilao.js
   (nove passos, as fases rumor → marca → mão → rosto) só corria depois de a
   fama fazer nascer uma nêmesis, e na sessão nunca nasceu: o antagonista do
   fio esperou no fim da espinha sem mexer um dedo, e nada do que estava em
   jogo tinha prazo. A pessoa: *"uma campanha que prende"* — e não prende o
   que não corre.

   Agora o antagonista do fio anda desde o primeiro dia (batidas.js), pelos
   passos do mesmo plano: uma etapa por ato antes do último, a mirar o fecho
   desse ato. O herói que chega antes apanha-os a meio; o que demora
   encontra a marca do que eles já fizeram. O Narrador recebe a marca do
   momento — a obra dele, um bilhete dele, os servos dele —, nunca o plano.

   O que esta suíte prova:
     1. a tabela: os passos são os do plano de vilao.js antes do rosto, e o
        prazo é o passo do plano (DIAS_POR_PASSO);
     2. a etapa nasce no fecho de cada ato antes do último, e sobe a escada
        das fases sem nunca chegar ao rosto;
     3. o tempo e o herói: o ligeiro trava todas; o lento perde todas; o
        prazo de cada etapa conta da anterior;
     4. o dia em que um marco se cumpre fica gravado (conferirEspinha);
     5. o momento: a corrida, a perda, o que já se sabe, o que o mundo
        lembra — sem nome, sem plano, sem buraco, e calado quando a nêmesis
        do fio já fala por si;
     6. a nêmesis que nasce depois herda o passo do relógio;
     7. o save, o lixo, a espinha antiga, o determinismo.

   FALHA em HEAD (v9.385): batidas.js não existe; não há relógio. */

import * as SG from "../src/saga.js";
import * as R from "../src/regiao.js";
import * as G from "../src/geografia.js";
import * as V from "../src/vilao.js";
import { ESTRUTURAS, estruturaPorId } from "../src/historia.js";
import { moldePorId } from "../src/moldes.js";
import { sementeDe, generoDe } from "./medir-regiao.mjs";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const tenta = (f, d) => { try { return f(); } catch { return d; } };
const J = (v) => JSON.stringify(v);

const B = await import("../src/batidas.js").catch(() => ({}));
const relogio = B.relogioDoFio || (() => []);
const momento = SG.momentoDoFio || (() => []);
const ANTS = ["soldado", "orfao", "erudito", "ferreiro", "nobre_caido", "acolito"];

function campanha(i, { regiao = true } = {}) {
  const semente = sementeDe(i), genero = generoDe(i), estrutura = ESTRUTURAS[i % ESTRUTURAS.length].id, molde = moldePorId("sobremundo");
  const mapa = regiao ? R.mapaDaCampanhaNova(R.mapaDaCriacao({ semente, molde, genero, estrutura, modo: "historia" })) : G.gerarGeografia(semente, molde);
  let esp = SG.estenderEspinha({ semente, mapa, genero, molde, estrutura, cidadeInicial: mapa.cidades[0].nome, antecedente: ANTS[i % 6], dia: 1 });
  if (mapa.regiao) esp = R.espinhaNaRegiao(mapa, esp, { semente, genero, molde });
  return { semente, genero, molde, mapa, esp, est: estruturaPorId(estrutura) };
}
/* a espinha com os j primeiros marcos cumpridos, um a cada `passo` dias */
function ate(esp, j, passo) {
  const todos = esp.atos.flatMap((a) => a.marcos);
  return { ...esp, atos: esp.atos.map((a) => ({ ...a, marcos: a.marcos.map((m) => { const k = todos.indexOf(m); return k < j ? { ...m, feito: true, dia: 1 + Math.floor(k * passo) } : m; }) })) };
}
const atoDe = (esp, j) => { let n = 0; for (const a of esp.atos) { if (j < n + a.marcos.length) return a.ato; n += a.marcos.length; } return esp.atos.length - 1; };

sec("1. a tabela é a do plano");
{
  const T = B.RELOGIO_DO_FIO;
  t("RELOGIO_DO_FIO existe", !!T);
  t("os passos são do plano de vilao.js e vêm todos antes do rosto", !!T && T.passos.every((p) => V.PASSOS_DO_PLANO[p] && V.FASES[V.FASE_DO_PASSO[p]].ordem < 3));
  t("e sobem: rumor, marca, mão", !!T && T.passos.every((p, i) => i === 0 || p > T.passos[i - 1]) && V.FASE_DO_PASSO[T.passos[0]] === 0 && V.FASES[V.FASE_DO_PASSO[T.passos[T.passos.length - 1]]].id === "mao");
  t("todo passo tem a corrida e a perda; toda fase, a forma de se mostrar", !!T && T.passos.every((p) => T.marcas[p] && T.marcas[p].travada && T.marcas[p].cumprida) && ["rumor", "marca", "mao"].every((f) => !!T.rosto[f]));
  t("o bilhete sem palavras tem por onde variar", !!T && T.assinaturas.length >= 4);
  const c = campanha(0);
  const et = relogio(c.esp, { dia: 1 })[0];
  t("o prazo da primeira etapa é o passo do plano, contado do dia em que a história nasce", !!et && et.prazo === 1 + V.DIAS_POR_PASSO);
}

sec("2. uma etapa por ato antes do último, no fecho, sem chegar ao rosto");
{
  let camp = 0, certas = 0, noFecho = 0, escada = 0, semRosto = 0;
  for (let i = 0; i < 40; i++) {
    const c = campanha(i, { regiao: i % 4 !== 0 });
    if (!c.esp.fio) continue;
    camp++;
    const ets = relogio(c.esp, { dia: 1 });
    if (ets.length === c.esp.atos.length - 1 && ets.every((e, k) => e.ato === k)) certas++;
    if (c.esp.atos.slice(0, -1).every((a) => { const f = a.marcos.find((m) => m.relogio); return f && f.batida && f.batida.fecho; })) noFecho++;
    if (ets.every((e, k) => k === 0 ? e.passo === 0 : e.passo >= ets[k - 1].passo)) escada++;
    if (ets.every((e) => V.FASES[V.FASE_DO_PASSO[e.passo]].ordem < 3)) semRosto++;
  }
  t(`uma etapa por ato antes do último (${certas}/${camp})`, camp > 0 && certas === camp);
  t(`e cada uma mira o fecho do seu ato (${noFecho}/${camp})`, noFecho === camp);
  t(`começa no rumor e só sobe (${escada}/${camp})`, escada === camp);
  t(`e nunca chega ao rosto — o nome é do último ato (${semRosto}/${camp})`, semRosto === camp);
}

sec("3. o tempo e o herói");
{
  let camp = 0, ligeiro = 0, lento = 0, cadeia = 0, parado = 0;
  for (let i = 0; i < 30; i++) {
    const c = campanha(i);
    if (!c.esp.fio) continue;
    camp++;
    const n = c.esp.atos.flatMap((a) => a.marcos).length;
    const rapido = relogio(ate(c.esp, n, 0.5), {});
    if (rapido.length && rapido.every((e) => e.como === "travada")) ligeiro++;
    const devagar = ate(c.esp, n, 3);
    const ls = relogio(devagar, {});
    if (ls.length && ls.every((e) => e.como === "cumprida")) lento++;
    let desde = 1;
    if (ls.every((e, k) => { const okk = e.prazo === desde + V.DIAS_POR_PASSO + B.RELOGIO_DO_FIO.diasAMaisPorAto * k; desde = e.caiu != null ? e.caiu : e.prazo; return okk; })) cadeia++;
    if (relogio(c.esp, { dia: 1 }).every((e) => e.como === "")) parado++;
  }
  t(`o herói ligeiro chega antes a todas (${ligeiro}/${camp})`, camp > 0 && ligeiro === camp);
  t(`o lento encontra todas cumpridas (${lento}/${camp})`, lento === camp);
  t(`o prazo de cada etapa conta da anterior (${cadeia}/${camp})`, cadeia === camp);
  t(`no primeiro dia, nada caiu ainda (${parado}/${camp})`, parado === camp);
  const c = campanha(2);
  const p0 = relogio(c.esp, {})[0].prazo;
  t("sem dia de agora nem marco cumprido, conta do dia em que a história nasceu", relogio(c.esp, {})[0].como === "");
  t("o dia de agora passa do prazo e a etapa cai, cumprida", relogio(c.esp, { dia: p0 })[0].como === "cumprida" && relogio(c.esp, { dia: p0 - 1 })[0].como === "");
  const um = ate(c.esp, 1, 0);
  t("sem dia de agora, vale o último dia que a espinha conhece", relogio({ ...um, atos: um.atos.map((a) => ({ ...a, marcos: a.marcos.map((m) => (m.feito ? { ...m, dia: p0 + 5 } : m)) })) }, {})[0].como === "cumprida");
}

sec("4. o dia em que o marco se cumpre fica gravado");
{
  const c = campanha(1);
  const m0 = c.esp.atos[0].marcos[0];
  const ver = () => true;
  const r = SG.conferirEspinha(c.esp, { dia: 7 }, ver);
  t("conferirEspinha grava o dia do mundo no marco que cai", r.cumpridos.length > 0 && SG.marcosDoAto(r.espinha, 0).find((m) => m.id === m0.id).dia === 7);
  const r2 = SG.conferirEspinha(c.esp, {}, ver);
  t("sem dia no mundo, não inventa um", !("dia" in SG.marcosDoAto(r2.espinha, 0).find((m) => m.id === m0.id)));
  t("e o dia sobrevive ao save", SG.garantirEspinha(JSON.parse(J(r.espinha))).atos[0].marcos[0].dia === 7);
}

sec("5. o momento: a marca, nunca o plano");
{
  let antesDoFim = 0, corrida = 0, perda = 0, jaSabe = 0, depois = 0, semNome = 0, linhas = 0, buraco = 0, maior = 0, calado = 0, camp = 0;
  for (let i = 0; i < 24; i++) {
    const c = campanha(i, { regiao: i % 3 !== 0 });
    if (!c.esp.fio) continue;
    camp++;
    const f = c.esp.fio;
    const todos = c.esp.atos.flatMap((a) => a.marcos);
    const ultimo = c.esp.atos.length - 1;
    for (const passo of [0.5, 3]) {
      for (let j = 0; j < todos.length; j++) {
        const e2 = ate(c.esp, j, passo);
        const k = atoDe(c.esp, j);
        const dia = 1 + Math.floor(j * passo);
        const ls = momento(e2, k, { dia });
        for (const l of ls) {
          linhas++;
          maior = Math.max(maior, l.length);
          if (/\{\w+\}/.test(l)) buraco++;
          /* a sombra cresce como no fio: no primeiro ato nem nome nem título;
             no meio o título (o que o mundo lhe chama), nunca o nome */
          if (k < ultimo) { antesDoFim++; if (!l.includes(f.antagonista) && (k > 0 || !l.includes(f.titulo))) semNome++; }
          if (/corre agora/.test(l)) corrida++;
          if (/já aconteceu/.test(l)) perda++;
          if (/^JÁ SE SABE/.test(l)) jaSabe++;
          if (/chegou antes deles/.test(l)) depois++;
        }
        if (k < ultimo && momento(e2, k, { dia, vilao: { daEspinha: true, status: "ativa" } }).every((l) => !/corre agora|já aconteceu|chegou antes/.test(l))) calado++;
      }
    }
  }
  t(`a corrida aparece enquanto o herói pode chegar antes (${corrida})`, corrida > 0);
  t(`e a perda, quando eles chegaram primeiro (${perda})`, perda > 0);
  t(`o que se achou há pouco volta como JÁ SE SABE (${jaSabe})`, jaSabe > 0);
  t(`e o ato seguinte lembra quem chegou a tempo (${depois})`, depois > 0);
  t(`antes do último ato, nenhuma linha diz o nome (e no primeiro, nem o título) (${semNome}/${antesDoFim})`, antesDoFim > 0 && semNome === antesDoFim);
  t(`nenhum buraco por encher (${buraco})`, buraco === 0);
  t(`cada linha cabe na pauta (a maior tem ${maior}; teto 420)`, maior > 0 && maior <= 420);
  t(`com a nêmesis do fio viva, o relógio cala-se — ela fala pelos envelopes dela`, calado > 0);
  const c = campanha(5);
  const semBatidas = { ...c.esp, atos: c.esp.atos.map((a) => ({ ...a, marcos: a.marcos.map(({ batida, ...m }) => m) })) };
  t("a espinha antiga (sem batidas) não ganha momento", J(momento(semBatidas, 0, { dia: 99 })) === "[]");
  t("lixo: nada, sem erro", J(tenta(() => momento(null, 0, {}), "x")) === "[]" && J(tenta(() => momento({}, 3), "x")) === "[]");
  t("a marca nunca diz o plano (o passo de vilao.js não vai ao Narrador)", (() => {
    const todas = [];
    for (let j = 0; j < 30; j++) todas.push(...momento(ate(c.esp, j, 3), atoDe(c.esp, j), { dia: 1 + j * 3 }));
    return todas.length > 0 && todas.every((l) => !V.PASSOS_DO_PLANO.some((p) => l.includes(p.diz)) && !/\b(passo|plano|etapa)\b/i.test(l));
  })());
}

sec("6. a nêmesis que nasce depois herda o passo do relógio");
{
  const c = campanha(3);
  const n = c.esp.atos.flatMap((a) => a.marcos).length;
  const v0 = V.gerarVilao({ nome: "Fulano", dia: 1, sorte: G.rngDe("v") });
  const tarde = ate(c.esp, n - 1, 3);
  const ets = relogio(tarde, {}).filter((e) => e.como);
  const v = SG.vilaoDoFio(v0, tarde);
  t("nasce no passo onde o relógio está, não no rumor", ets.length > 0 && v.passo === ets[ets.length - 1].passo && v.passo > 0);
  t("na fase desse passo, e ainda sem rosto", v.fase === V.FASES[V.FASE_DO_PASSO[v.passo]].id && v.conhecido === false && V.ehCoerente(v));
  t("e com o fio dele (o nome, daEspinha)", v.daEspinha === true && !!v.nome);
  t("no primeiro dia, a nêmesis do fio nasce como sempre nasceu (passo 0)", SG.vilaoDoFio(v0, c.esp).passo === v0.passo);
}

sec("7. o save, o lixo e o determinismo");
{
  const c = campanha(4);
  t("estenderEspinha guarda o dia em que a história nasce e a assinatura dele", c.esp.fio && c.esp.fio.inicio === 1 && B.RELOGIO_DO_FIO.assinaturas.includes(c.esp.fio.assinatura));
  const volta = SG.garantirEspinha(JSON.parse(J(c.esp)));
  t("o relógio sobrevive ao save", J(volta) === J(c.esp) && volta.atos.some((a) => a.marcos.some((m) => m.relogio)));
  const lixo = SG.garantirEspinha({ fio: { antagonista: "A", inicio: "x", assinatura: "y".repeat(200) }, atos: [{ marcos: [{ id: "a", relogio: { passo: 99, gente: "g".repeat(200) } }, { id: "b", relogio: { passo: "x" } }, { id: "c", dia: "3" }] }] });
  t("o lixo não passa, e o que passa vem aparado", !("inicio" in lixo.fio) && lixo.fio.assinatura.length <= 60 && lixo.atos[0].marcos[0].relogio.passo === 8 && lixo.atos[0].marcos[0].relogio.gente.length <= 60 && !("relogio" in lixo.atos[0].marcos[1]) && !("dia" in lixo.atos[0].marcos[2]));
  t("relogioDoFio com lixo: nada, sem erro", J(tenta(() => relogio(null), "x")) === "[]" && J(tenta(() => relogio({ atos: [{ marcos: [null, { relogio: "x" }] }] }), "x")) === "[]");
  const a = campanha(6), b = campanha(6);
  t("a mesma semente dá o mesmo relógio, e o mesmo momento", J(relogio(a.esp, { dia: 40 })) === J(relogio(b.esp, { dia: 40 })) && J(momento(a.esp, 0, { dia: 9 })) === J(momento(b.esp, 0, { dia: 9 })));
  const antes = J(a.esp);
  relogio(a.esp, { dia: 50 }); momento(a.esp, 0, { dia: 50 }); SG.vilaoDoFio(V.gerarVilao({ nome: "X", sorte: G.rngDe("x") }), a.esp);
  t("nada disto muta a espinha", J(a.esp) === antes);
}

console.log(`\nrelógio do fio: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
