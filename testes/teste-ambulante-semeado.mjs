/* teste-ambulante-semeado.mjs (Fase MM · 4.ª sessão de prova, item 4)
   — a carroça da estrada sai da semente, não de um Math.random cravado

   `talvezAmbulante` (mercado.js) decidia com dois `Math.random()` cravados
   se a carroça aparecia e o que trazia. Contra a lei da casa: mesma semente,
   mesmo mundo — e a suíte não tinha como provar o que a estrada dá. Agora a
   sorte entra por argumento: `semente` (a chave da estrada) vira um gerador
   semeado e as duas tiradas saem dele; sem semente, a `sorte` de quem chama.

   FALHA em HEAD de 11/10 (v9.381): com a semente, `Math.random` ainda é
   chamado (o espião estoura), e a mesma semente dá carroças diferentes. */
import { trocarACasa } from "../src/semente.js";
import * as M from "../src/mercado.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const tenta = (f, d = "estourou") => { try { return f(); } catch { return d; } };
const J = JSON.stringify;

/* o espião: com semente, ninguém pode tocar no Math.random */
const real = trocarACasa();
let chamadas = 0;
const espiar = () => { chamadas = 0; trocarACasa(() => { chamadas++; return real(); }); };
const soltar = () => { trocarACasa(real); };

sec("1. a tabela");
t("a chance da carroça é tabela, e pequena", Number.isFinite(M.CHANCE_AMBULANTE) && M.CHANCE_AMBULANTE > 0 && M.CHANCE_AMBULANTE < 0.5);

sec("2. com semente, a semente decide");
{
  espiar();
  const a = tenta(() => M.talvezAmbulante(3, 2, { semente: "mundo|Rio Cinzento>Muralha|240", chance: 1 }));
  const b = tenta(() => M.talvezAmbulante(3, 2, { semente: "mundo|Rio Cinzento>Muralha|240", chance: 1 }));
  let vistas = 0;
  for (let i = 0; i < 3000; i++) if (tenta(() => M.talvezAmbulante(5, 3, { semente: `mundo|a>b|${i}` }), null)) vistas++;
  soltar();
  t("Math.random não é chamado uma única vez", chamadas === 0, `${chamadas} chamadas`);
  t("a mesma semente dá a mesma carroça, com o mesmo estoque", a && a !== "estourou" && J(a) === J(b));
  const outra = tenta(() => M.talvezAmbulante(3, 2, { semente: "mundo|Rio Cinzento>Muralha|480", chance: 1 }));
  t("outro trecho da estrada, outra carroça", outra && J(outra) !== J(a));
  const f = vistas / 3000;
  t(`a frequência é a da tabela (${(f * 100).toFixed(1)}% contra ${M.CHANCE_AMBULANTE * 100}%)`, Math.abs(f - M.CHANCE_AMBULANTE) < 0.02);
  t("chance zero nunca dá carroça; chance um, sempre", tenta(() => M.talvezAmbulante(1, 1, { semente: "s", chance: 0 })) === null && !!tenta(() => M.talvezAmbulante(1, 1, { semente: "s", chance: 1 }), null));
}

sec("3. sem semente, a sorte de quem chama");
{
  const seq = (xs) => { let i = 0; return () => xs[i++ % xs.length]; };
  t("uma sorte acima da chance: nada", tenta(() => M.talvezAmbulante(1, 1, { sorte: seq([0.99]) })) === null);
  const a = tenta(() => M.talvezAmbulante(1, 1, { sorte: seq([0.01, 0.5]) }));
  const b = tenta(() => M.talvezAmbulante(1, 1, { sorte: seq([0.01, 0.5]) }));
  t("a mesma sequência dá a mesma carroça", a && a !== "estourou" && J(a) === J(b));
  t("sem nada, continua a funcionar (a chamada que o App faz hoje)", tenta(() => { M.talvezAmbulante(1, 1, { lex: null }); return true; }) === true);
}

sec("4. lixo");
t("opções null não estouram (`= {}` não cobre null)", tenta(() => { M.talvezAmbulante(1, 1, null); return true; }) === true);
t("semente vazia é como não ter semente", tenta(() => M.talvezAmbulante(1, 1, { semente: "", sorte: () => 0.99 })) === null);
t("chance que não é número vale a da tabela", tenta(() => M.talvezAmbulante(1, 1, { semente: "s|1", chance: "x" }), "e") !== "estourou");

console.log(`\nambulante semeado: ${ok} passaram, ${mal} falharam`);
if (mal) process.exit(1);
