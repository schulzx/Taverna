/* teste-motor-aplicar.mjs (Fase T1, trilha A, 27/10/2026) — o aplicar, fora do App

   O primeiro bloco do `aplicarResposta` saiu do componente para
   `src/motor/aplicar.js`: a poda, as travas anti-duplo, o relógio dos
   efeitos e das condições (eu, o grupo, os inimigos), as recargas, as
   mudanças declaradas, a cobrança e o débito. A promessa de quem move é
   que NADA muda — e a prova é byte a byte:

   1. o dourado: 275 respostas reais (as narrações das sessões 8 a 10),
      cada uma com ficha, luta e mudanças variadas; o App de ANTES
      (b9e6e20, lido do git por `gerar-aplicar-dourado.mjs`) produziu um
      estado, e `aplicar` tem de produzir o MESMO — a mesma impressão
      digital do retrato inteiro (a ficha, as linhas, a nota, a luta, as
      travas, a textura, a resposta podada).
   2. pureza: o que entra não sai mexido, e a mesma entrada dá a mesma saída.
   3. a forma da saída: { estado, efeitos, paraOCronista, podado, msgs }.
   4. a fiação no App: o App chama `aplicar` e aplica os efeitos num lugar só. */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { aplicar, notaComOTurno } from "../src/motor/aplicar.js";
import { semearACasa } from "../src/semente.js";
import { casosDoAplicar, retrato, digital } from "./aplicar-casos.mjs";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

/* o que o App faz com a saída — é o mesmo que `aplicarOsEfeitos` faz lá */
function oQueOAppVe(c, s) {
  let combate = c.estado.combate, textura = {};
  for (const ef of s.efeitos) {
    if (ef.tipo === "combate") combate = ef.combate;
    else if (ef.tipo === "textura") textura = { ...textura, ganho: true };
  }
  return retrato({
    pers: s.estado.personagem, msgs: s.msgs, nota: notaComOTurno(c.notaAntes, s.paraOCronista), combate,
    danoJaAplicado: s.estado.danoJaAplicado, habUsada: s.estado.habUsada, textura, resp: s.podado,
  });
}

sec("1. o dourado — o App de antes e o motor de agora, byte a byte");
const DOURADO = JSON.parse(fs.readFileSync(path.join(AQUI, "aplicar-dourado.json"), "utf8"));
const CASOS = casosDoAplicar();
t(`os casos são os do dourado (${CASOS.length})`, CASOS.length === DOURADO.casos.length && CASOS.every((c, i) => c.id === DOURADO.casos[i].id));
t("o App de antes não calou em nenhum caso", DOURADO.calou === 0);
let iguais = 0, bytes = 0; const diferentes = [];
for (let i = 0; i < CASOS.length; i++) {
  const c = JSON.parse(JSON.stringify(CASOS[i]));
  semearACasa(c.semente);
  const s = aplicar(c.estado, c.resp, c.ctx);
  const r = oQueOAppVe(c, s);
  bytes += r.length;
  if (digital(r) === DOURADO.casos[i].digital) iguais++;
  else diferentes.push(`${c.id}: msgs ${JSON.stringify(s.msgs).slice(0, 160)} / dourado ${JSON.stringify(DOURADO.casos[i].msgs).slice(0, 160)}`);
}
t(`${iguais}/${CASOS.length} estados iguais ao byte (${bytes} bytes comparados)`, iguais === CASOS.length, diferentes.slice(0, 3).join(" | "));
const ramos = DOURADO.casos;
t("o dourado percorre o relógio dos inimigos", CASOS.filter((c) => c.estado.combate).length >= 50);
t("…a nota do turno", ramos.filter((x) => x.nota && x.nota !== "[NOTA DE ANTES]").length >= 50);
t("…a cobrança e o débito", ramos.filter((x) => /moedas|escamas/.test(x.msgs.join(" "))).length >= 50);
t("…a segunda chance (a salvaguarda rolou)", ramos.filter((x) => /deu \d+/.test(x.msgs.join(" "))).length >= 20);

sec("2. pureza");
{
  const c = JSON.parse(JSON.stringify(CASOS[1]));
  const antes = JSON.stringify(c);
  semearACasa(c.semente); const a = aplicar(c.estado, c.resp, c.ctx);
  t("o estado, a resposta e o contexto que entraram saem intactos", JSON.stringify(c) === antes);
  semearACasa(c.semente); const b = aplicar(c.estado, c.resp, c.ctx);
  t("a mesma entrada (e a mesma sorte) dá a mesma saída", oQueOAppVe(c, a) === oQueOAppVe(c, b));
  t("a trava do dano que pegou vira estado novo, não ref", CASOS[0].estado.danoJaAplicado === true && (() => { const k = JSON.parse(JSON.stringify(CASOS[1])); k.estado.danoJaAplicado = true; semearACasa(k.semente); return aplicar(k.estado, k.resp, k.ctx).estado.danoJaAplicado === false; })());
}

sec("3. a forma da saída");
{
  const c = JSON.parse(JSON.stringify(CASOS[5]));
  semearACasa(c.semente);
  const s = aplicar(c.estado, c.resp, c.ctx);
  t("{ estado, efeitos, paraOCronista, podado, msgs }", s.estado && Array.isArray(s.efeitos) && Array.isArray(s.paraOCronista) && s.podado && Array.isArray(s.msgs));
  t("todo efeito é descrito por tipo", s.efeitos.every((e) => e && typeof e.tipo === "string"));
  const semFicha = aplicar({ personagem: null }, { narrativa: "x" }, {});
  t("sem ficha não há turno (o App devolve null, como antes)", semFicha.semFicha === true && semFicha.msgs.length === 0);
  t("lixo no estado e no contexto não estoura", !!aplicar(null, { narrativa: "" }, null));
  t("a nota cresce como no App", notaComOTurno("", ["a", "b"]) === "a\nb" && notaComOTurno("x", ["a"]) === "x\na" && notaComOTurno(null, []) === "");
}

sec("4. a fiação no App");
const APP = fs.readFileSync(path.join(AQUI, "..", "src", "App.jsx"), "utf8");
const iAR = APP.indexOf("const aplicarResposta = useCallback((resp, persAtual, opts = {}) => {");
const corpoAR = iAR > 0 ? APP.slice(iAR, APP.indexOf("}, [pushMsgs]);", iAR)) : "";
t("o App importa o aplicar", /from "\.\/motor\/aplicar\.js"/.test(APP));
t("aplicarResposta chama o motor", /aplicar\(\{\s*personagem: pers,/.test(corpoAR));
t("…e aplica os efeitos num lugar só", /aplicarOsEfeitos\(saida\)/.test(corpoAR) && (APP.match(/const aplicarOsEfeitos = /g) || []).length === 1);
const MOTOR = fs.readFileSync(path.join(AQUI, "..", "src", "motor", "aplicar.js"), "utf8");
t("o corpo mudou-se com o texto: o relógio, a cobrança e as travas estão no motor", /const \{ efeitos, msgs: msgsTick \} = tickEfeitos\(pers\);/.test(MOTOR) && /oQueFaltaCreditar\(resp\.narrativa/.test(MOTOR) && /travas\.danoJaAplicado = false;/.test(MOTOR));
t("o motor não lê ref nem chama setX", !/Ref\.current|\bset[A-Z]\w*\(/.test(MOTOR.replace(/\/\*[\s\S]*?\*\//g, "")));
t("o relógio dos efeitos já não mora no App", !/const \{ efeitos, msgs: msgsTick \} = tickEfeitos\(pers\);/.test(APP));
t("a cobrança já não mora no App", !/oQueFaltaCreditar\(resp\.narrativa/.test(APP));

console.log(`\nmotor · aplicar: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
