/* AS TOCHAS À PORTA E A CARROÇA SEMEADA (11/10) — duas fiações do backend

   O `backend` deixou duas linhas para o App no diário (v9.380 e v9.384):

     1. `entrarMasmorra` tira as tochas da mochila para a planta (`persIn`
        fica com 0) ANTES de pedir o veredito. A masmorra gerada leva-as em
        `mm.tochas`; a masmorra DO MUNDO não — o veredito lia-as da ficha,
        via zero, e dizia "sem uma tocha" a quem levava cinco.
     2. `viajar` sorteava a carroça do mercador com `Math.random`: a mesma
        semente, a mesma estrada e o mesmo passo davam carroças diferentes.
        `talvezAmbulante` aceita `semente` desde a v9.384; faltava o App dá-la
        (o mundo, o trecho e quanto já se andou).

   O que esta suíte prova:
     1. o veredito à porta de uma masmorra do mundo conta as tochas que levo
        (a ficha de antes de as tirar), e a fiação passa essa ficha;
     2. a carroça da mesma estrada, no mesmo passo, é sempre a mesma — e a
        fiação passa a semente nesse formato, em try com calou.

   FALHA em HEAD (v9.384): o App passa `persIn` ao veredito e não passa
   semente à carroça. */

import { readFileSync } from "node:fs";
import * as B from "../src/boca.js";
import * as M from "../src/mercado.js";
import { garantirSuprimentos } from "../src/ermos.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const tenta = (f, d) => { try { return f(); } catch { return d; } };
const J = (v) => JSON.stringify(v);

const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
const corpoApos = (ancora) => {
  const ini = app.indexOf(ancora);
  if (ini < 0) return "";
  const abre = ini + ancora.length - 1;
  let prof = 0;
  for (let i = abre; i < app.length; i++) {
    if (app[i] === "{") prof++;
    else if (app[i] === "}") { prof--; if (prof === 0) return app.slice(abre, i + 1); }
  }
  return "";
};

/* a Muralha da 4.ª sessão e uma heroína com cinco tochas na mochila */
const MURALHA = { id: "masmorra|Vale Cinzento|0", nome: "Muralha Quebrada de Silêncio", tipo: "forte", regiao: "Vale Cinzento", bioma: "planicie", cidadeProxima: "Rio Cinzento", nivel: 4, salas: 9, x: 57, y: 57 };
const HEROINA = { nome: "Sibila Navarro", nivel: 1, vida: 10, vidaMax: 10, atributos: { forca: 0, destreza: 1, vigor: 0, intelecto: 3, presenca: 3, percepcao: 2 }, grupo: [], suprimentos: { racoes: 2, agua: 2, tochas: 5, kit: false }, condicoes: [] };

sec("1. as tochas à porta da masmorra do mundo");
{
  /* o que entrarMasmorra faz antes do veredito */
  const supIn = garantirSuprimentos(HEROINA.suprimentos);
  const persIn = { ...HEROINA, suprimentos: { ...supIn, tochas: 0 } };
  const antes = (tenta(() => B.vereditoDaMasmorra(MURALHA, persIn), {}) || {}).linha || "";
  const agora = (tenta(() => B.vereditoDaMasmorra(MURALHA, { ...persIn, suprimentos: supIn }), {}) || {}).linha || "";
  t("ANTES: com a ficha já sem tochas, o veredito diz \"sem uma tocha\" (o que o jogador lia)", /sem uma tocha/.test(antes), antes);
  t("com as tochas que levo, o veredito não fala de escuro", agora.length > 0 && !/sem uma tocha/.test(agora), agora);
  const semNenhuma = { ...HEROINA, suprimentos: { ...supIn, tochas: 0 } };
  t("e quem de facto não leva tocha continua a ler o escuro", /sem uma tocha/.test((tenta(() => B.vereditoDaMasmorra(MURALHA, { ...semNenhuma, suprimentos: garantirSuprimentos(semNenhuma.suprimentos) }), {}) || {}).linha || ""));
  const entrar = corpoApos("const entrarMasmorra = (nomeSugerido = \"\", opcoes = null) => {");
  t("a fiação: o veredito recebe a ficha com as tochas (supIn)", /vereditoDaMasmorra\(doMapa \|\| mm, \{ \.\.\.persIn, suprimentos: supIn \}\)/.test(entrar));
  t("dentro do try com calou de sempre", /vereditoDaMasmorra\(doMapa \|\| mm, \{ \.\.\.persIn, suprimentos: supIn \}\)[\s\S]{0,400}calou\("veredito da masmorra"/.test(entrar));
}

sec("2. a carroça da estrada sai da semente");
{
  const j = { de: "Rio Cinzento", para: "Alto do Sal", andadoMin: 720 };
  const semente = (s, jj) => `${s}|${jj.de}>${jj.para}|${jj.andadoMin || 0}`;
  /* procura um passo em que a carroça aparece, para comparar o estoque */
  let achou = null;
  for (let k = 0; k < 400 && !achou; k++) {
    const jj = { ...j, andadoMin: 720 + 240 * k };
    const a = tenta(() => M.talvezAmbulante(12, 3, { semente: semente("mundo-x", jj) }), null);
    if (a) achou = { jj, a };
  }
  t("numa estrada longa, a carroça aparece em algum passo", !!achou);
  if (achou) {
    const b = M.talvezAmbulante(12, 3, { semente: semente("mundo-x", achou.jj) });
    t("o mesmo mundo, o mesmo trecho e o mesmo passo: a mesma carroça", J(b) === J(achou.a));
  }
  let iguais = 0, total = 0;
  for (let k = 0; k < 200; k++) {
    const jj = { ...j, andadoMin: 240 * k };
    const x = M.talvezAmbulante(7, 2, { semente: semente("mundo-y", jj) });
    const y = M.talvezAmbulante(7, 2, { semente: semente("mundo-y", jj) });
    total++; if (J(x) === J(y)) iguais++;
  }
  t(`200 passos repetidos dão o mesmo resultado (${iguais}/${total})`, iguais === total);
  const viajar = app.slice(app.indexOf("MERCADOR AMBULANTE (v9.2)"), app.indexOf("MERCADOR AMBULANTE (v9.2)") + 1500);
  t("a fiação: a semente é o mundo, o trecho e o já andado", /semente: \(\(\) => \{ try \{ const j = jornadaRef\.current; return j \? `\$\{sementeMundo\(\)\}\|\$\{j\.de\}>\$\{j\.para\}\|\$\{j\.andadoMin \|\| 0\}` : ""; \}/.test(viajar));
  t("em try com calou, e sem jornada fica a sorte de sempre (semente vazia)", /calou\("semente do ambulante", e\); return ""; \}/.test(viajar));
  t("semente vazia é a sorte de quem chama (o comportamento antigo)", tenta(() => { let n = 0; const s = () => { n++; return 0.99; }; M.talvezAmbulante(1, 1, { semente: "", sorte: s }); return n > 0; }, false));
}

console.log(`\ntochas e carroça: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
