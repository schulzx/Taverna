/* ============================================================
   A ABERTURA E O KIT, LIGADOS NO App.jsx (S10b, 13/10 — o oficial)

   O motor (`ABERTURA_DA_LUTA` em grid.js, `equiparKitInicial` em
   kit-inicial.js) é provado nas suítes dele. Esta prova a FIAÇÃO: lê o
   App.jsx como texto e ancora em conteúdo que só existe se a fiação ligou
   o motor (nunca em número de linha), e refaz em Node a conta que o App
   faz — a mesma semente e o mesmo turno abrem à mesma distância.
   ============================================================ */
import { readFileSync } from "node:fs";
import { montarGrade, posicionar, distanciaQuadrados, ABERTURA_DA_LUTA } from "../src/grid.js";
import { rng, hashSemente } from "../src/semente.js";
import { equiparKitInicial } from "../src/kit-inicial.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra !== "" ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

/* o fim de linha normalizado (uma cópia fresca pode vir em CRLF) */
const APP = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");
const conta = (s) => APP.split(s).length - 1;

sec("1. a situação chega a `posicionar`");
{
  t("montarGrid recebe a situação, e a cena é o padrão", APP.includes('const montarGrid = (pers, inimigos, situacao = "cena") => {'));
  t("posicionar recebe a situação e uma sorte semeada pelo mundo e pelo turno",
    APP.includes('situacao: typeof situacao === "string" && situacao ? situacao : "cena",')
    && APP.includes("sorte: rng(hashSemente(`${sementeMundo()}|abertura|${turnoDeRegistroRef.current}`)),"));
  t("abrirCombate aceita a situação e passa-a a equiparCombate",
    APP.includes('jaNoRef = false, situacao = "cena" } = {}) => {') && APP.includes("pers, { situacao });"));
  t("a abertura pela situação é em calou (nunca custa o turno)", APP.includes('calou("a abertura da luta pela situação", e)'));
}

sec("2. quem abre a luta diz como ela abriu");
{
  t("a agressão declarada abre como `declarada` (o alvo é o primeiro inimigo)",
    APP.includes('abrirCombate([{ nome: a.nome, ameaca: a.ameaca }], { pers: p, situacao: "declarada" })'));
  t("a luta que o lado do coração prometeu entra pela mesma porta (`declarada`)",
    APP.includes('abrirCombate([{ nome: luta.nome, ameaca: luta.ameaca }], { pers, situacao: "declarada" })'));
  t("a investida da estrada abre como `emboscada`", APP.includes('abrirCombate(inv.inimigos, { pers: persV, situacao: "emboscada" })'));
  t("a emboscada do perigo abre como `emboscada`", APP.includes('abrirCombate(emb.inimigos, { pers, situacao: "emboscada" })'));
  t("a emboscada devida da virada e os dois bandos da fuga também (5 no total)", conta('situacao: "emboscada" })') === 5);
  t("a sala da masmorra não força nada: a planta decide (`cena` → masmorra)",
    APP.includes("const ab = abrirCombate(inimigos, { pers: personagemRef.current || personagem });"));
}

sec("3. a conta do App, refeita: a mesma semente e o mesmo turno, a mesma casa");
{
  const sorte = (sem, turno) => rng(hashSemente(`${sem}|abertura|${turno}`));
  const abre = (planta, situacao, sem, turno) => {
    const g = montarGrade(planta);
    const p = posicionar(g, { heroi: { nome: "Vera", tamanho: "medio" }, grupo: [], inimigos: [{ nome: "Lobo" }, { nome: "Lobo 2" }], situacao, sorte: sorte(sem, turno) });
    return distanciaQuadrados(p.heroi, p.inimigos[0]);
  };
  const S = ABERTURA_DA_LUTA.situacoes;
  let dentro = true, iguais = true;
  const vistas = new Set();
  for (let turno = 0; turno < 40; turno++) {
    const a = abre({ local: "estrada" }, "declarada", "Vera|Fantasia", turno);
    const b = abre({ local: "estrada" }, "declarada", "Vera|Fantasia", turno);
    if (a !== b) iguais = false;
    if (a < S.declarada.min || a > S.declarada.max) dentro = false;
    const e = abre({ local: "estrada" }, "emboscada", "Vera|Fantasia", turno);
    if (e < S.emboscada.min || e > S.emboscada.max) dentro = false;
    vistas.add(e);
  }
  t("determinismo: a mesma semente no mesmo turno abre à mesma distância", iguais);
  t("a declarada abre a 1–2 casas e a emboscada a 2–4, em 40 turnos", dentro);
  t("a sorte sorteia de verdade (a emboscada usou mais de uma distância)", vistas.size > 1, [...vistas].join(","));
  const m = abre({ emMasmorra: true }, "cena", "Vera|Fantasia", 3);
  t("a cena na masmorra abre à porta da sala (3–5)", m >= S.masmorra.min && m <= S.masmorra.max, m);
}

sec("4. o kit inicial: só na criação");
{
  t("a tela de criação equipa a ficha nova: concluir(equiparKitInicial(comDom({...})))", APP.includes("onClick={() => concluir(equiparKitInicial(comDom({"));
  t("…e em mais lado nenhum (uma chamada só, além do import)", conta("equiparKitInicial(") === 1);
  const g = equiparKitInicial({ classe: "Guerreiro", equipados: {} });
  t("o Guerreiro nasce com a Espada Longa na mão", g.equipados && g.equipados.arma && g.equipados.arma.nome === "Espada Longa");
}

console.log(`\nabertura e kit no App: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
