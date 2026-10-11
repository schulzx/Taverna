/* teste-relogio-da-marcha.mjs (Fase MM · 4.ª sessão de prova, nº 8)
   — o relógio da estrada é o tempo real da marcha, sem o piso de 12 h

   Até v9.381 cada avanço de estrada custava ao calendário o passo inteiro
   vezes três, e o passo tem piso de 4 h: 12 h por avanço, sempre. Uma
   caminhada de 97 minutos até uma vila gastava 12 h; a ida de 4 h à Muralha
   da quarta sessão (`mente/mm11-sessao-4.md`, M22, M25, M26) também, três
   vezes — e cada chegada rendia uma condição.

   Agora (viagem.js, `relogioDoAvanco`) o relógio é o que se anda neste
   avanço mais as noites que a estrada atravessa: um dia tem 8 h de marcha,
   e quem passa delas dormiu pelo caminho (16 h). O passo não muda.

   FALHA em HEAD de 11/10 (v9.381): 97 min custam 720. */
import * as V from "../src/viagem.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const tenta = (f, d = "estourou") => { try { return f(); } catch { return d; } };
/* o laço de viajar (App), sem os dados: avanços e relógio até chegar */
const viajar = (j0) => {
  let j = j0, relogio = 0, avancos = 0;
  while (j && j.estado !== V.ESTADOS.concluida && avancos < 60) { relogio += V.relogioDoAvanco(j); j = V.andar(j, V.minutosPorAvanco(j)); avancos++; }
  return { relogio, avancos, estrada: j.andadoMin };
};
const curta = (min) => ({ ...V.abrirViagem({ de: "Bastião", para: "Forte do Sul", rota: { dias: 1 } }), totalMin: min });

sec("1. as tabelas que a conta lê");
t("8 h de marcha por dia, e o dia de calendário é três vezes isso", V.HORAS_MARCHA_POR_DIA === 8 && V.RELOGIO_POR_ESTRADA === 3);
t("o passo continua a ter o piso de 4 h de estrada (a estrada anda o mesmo)", V.MINUTOS_ESTRADA_POR_TURNO === 240 && V.minutosPorAvanco(curta(97)) === 240);

sec("2. os casos da sessão");
{
  const c = viajar(curta(97));
  t(`a caminhada de 97 min custa 97 min (era 720) — ${c.relogio}`, c.relogio === 97 && c.avancos === 1);
  const m = viajar(V.abrirViagem({ de: "Rio Cinzento", para: "Muralha Quebrada de Silêncio", rota: { dias: 0.5, km: 21 } }));
  t(`a ida de meio dia de marcha à Muralha custa 4 h (era 12 h) — ${m.relogio / 60} h`, m.relogio === 240 && m.avancos === 1);
  t("três idas à boca custariam 12 h, e não 36 h", 3 * m.relogio === 720);
}

sec("3. as noites pelo caminho");
{
  const um = viajar(V.abrirViagem({ de: "a", para: "b", rota: { dias: 1 } }));
  t(`um dia de marcha (8 h) chega no fim da marcha, sem noite — ${um.relogio / 60} h`, um.relogio === 480);
  const dois = viajar(V.abrirViagem({ de: "a", para: "b", rota: { dias: 2 } }));
  t(`dois dias de marcha custam 32 h: 16 h de marcha e uma noite — ${dois.relogio / 60} h`, dois.relogio === 32 * 60);
  const meio = viajar(V.abrirViagem({ de: "a", para: "b", rota: { dias: 1.5 } }));
  t(`dia e meio: 12 h de marcha e uma noite — ${meio.relogio / 60} h`, meio.relogio === 28 * 60);
  /* a noite cai no avanço que atravessa as 8 h de marcha */
  let j = V.abrirViagem({ de: "a", para: "b", rota: { dias: 2 } });
  const porAvanco = [];
  while (j.estado !== V.ESTADOS.concluida) { porAvanco.push(V.relogioDoAvanco(j)); j = V.andar(j); }
  t(`os avanços de dois dias: ${porAvanco.join(" + ")} (a noite no terceiro)`, JSON.stringify(porAvanco) === JSON.stringify([240, 240, 1200, 240]));
  const longa = viajar(V.abrirViagem({ de: "a", para: "b", rota: { dias: 37 } }));
  t(`a travessia mais longa cabe no teto de avanços (${longa.avancos}) e custa 36 noites e 8 h`, longa.avancos <= V.TETO_DE_AVANCOS && longa.relogio === 36 * 1440 + 480);
  t("a estrada andada é a jornada inteira, nem um minuto a mais", longa.estrada === 37 * 480);
}

sec("4. o resto do avanço, e o lixo");
{
  const j = { ...curta(300), andadoMin: 240 };
  t("o último avanço cobra só o que falta (60 min)", V.relogioDoAvanco(j) === 60);
  t("a jornada já concluída não cobra nada", V.relogioDoAvanco({ ...curta(300), andadoMin: 300 }) === 0);
  t("jornada null ou vazia não estoura, e não cobra o piso antigo", [null, undefined, {}].every((x) => { const r = tenta(() => V.relogioDoAvanco(x)); return Number.isFinite(r) && r <= 240; }));
  const antes = JSON.stringify(j);
  V.relogioDoAvanco(j);
  t("não muda a jornada que recebe", JSON.stringify(j) === antes);
  t("determinístico", V.relogioDoAvanco(curta(1000)) === V.relogioDoAvanco(curta(1000)));
}

console.log(`\nrelógio da marcha: ${ok} passaram, ${mal} falharam`);
if (mal) process.exit(1);
