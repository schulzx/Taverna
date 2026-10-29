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
  /* (movidos, T1-A 6.ª fatia: `montarGrid` e `equiparCombate` saíram do App
     para `abrirOCombate`, no motor, e a catraca de teste-assercoes-de-texto
     não deixa ler o motor como texto. O que fica no App é a fiação, e é ela
     que se lê aqui: a situação entra na peça, a semente é a do mundo e do
     turno, e a rede é a do App. Que a situação chega a `posicionar` e que a
     queda abre como encontro é jogado em teste-motor-combate §6.) */
  t("abrirCombate aceita a situação, com a cena por padrão", APP.includes('jaNoRef = false, situacao = "cena" } = {}) => {'));
  t("e passa-a à peça, com a semente do mundo e do turno",
    /const r = abrirOCombate\(\{\s*inimigosCrus, jaNoRef, combateNoRef: combateRef\.current, pers: persEntra \|\| fichaViva\(\) \|\| personagem, situacao,/.test(APP)
    && APP.includes("sementeDaAbertura: `${sementeMundo()}|abertura|${turnoDeRegistroRef.current}`,"));
  t("a abertura pela situação é em calou (nunca custa o turno): a rede do App vai à peça", APP.includes("}, { sorteDoTurno, calou });"));
}

sec("2. quem abre a luta diz como ela abriu");
{
  t("a agressão declarada abre como `declarada` (o alvo é o primeiro inimigo)",
    APP.includes('abrirCombate([{ nome: a.nome, ameaca: a.ameaca }], { pers: p, situacao: "declarada" })'));
  t("a luta que o lado do coração prometeu entra pela mesma porta (`declarada`)",
    APP.includes('abrirCombate([{ nome: luta.nome, ameaca: luta.ameaca }], { pers, situacao: "declarada" })'));
  t("a investida da estrada abre como `emboscada`", APP.includes('abrirCombate(inv.inimigos, { pers: persV, situacao: "emboscada" })'));
  /* (movido, T1-A 7.ª fatia: a emboscada do perigo saiu do App para `oPerigoDaResposta` (src/motor/fecho-da-resposta.js), que se prova JOGANDO e não lendo. A intenção é a mesma: a investida que o Narrador descreve abre pela porta única como `emboscada`. No texto do App ficam as outras quatro.) */
  {
    const { oPerigoDaResposta } = await import("../src/motor/fecho-da-resposta.js");
    const abriu = [];
    oPerigoDaResposta({ pers: { nome: "Vera", nivel: 10 }, perigo: "Três bandidos saltam do mato.", combate: null, folego: null, lugares: [] }, { aplicar: () => {}, abrirCombate: (ins, o) => { abriu.push(o.situacao); return { pers: o.pers, msgs: [], nota: "" }; }, dispararPerigo: () => {} });
    t("a emboscada do perigo abre como `emboscada`", abriu.length === 1 && abriu[0] === "emboscada" && /oPerigoDaResposta\(\{[^}]*\}, portasDoFecho\(\)\)/.test(APP) && /sorteDoTurno, abrirCombate, dispararPerigo,/.test(APP));
  }
  /* MOVIDA (trilha A, 29/10), E O MOTIVO: a emboscada devida da virada e a da volta ao território (`revelarAVirada`, `talvezVoltarAoTerritorio`) saíram do App: o trecho de `enviar` da frase às bocas mudou-se para src/motor/preludio-do-turno.js (oPreludioDoTurno) com as funções que só ele chamava; o mesmo código à letra está provado lá, byte a byte contra o recorte do App, em teste-motor-preludio-do-turno.mjs (335 casos, e a cadeia até à rede), e o texto do motor não se lê (teste-assercoes-de-texto). Ficam no App o bando da fuga que volta e a emboscada da viagem. */
  t("o bando da fuga e a emboscada da viagem também (2 no App; a da virada e a da volta ao território no prelúdio, a do perigo no motor)", conta('situacao: "emboscada" })') === 2);
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

sec("4. o kit inicial: na criação e no companheiro que nasce");
{
  t("a tela de criação equipa a ficha nova: concluir(equiparKitInicial(comDom({...})))", APP.includes("onClick={() => concluir(equiparKitInicial(comDom({"));
  /* 13/10 (v9.463): a asserção era «uma chamada só». Moveu-se para duas
     porque o companheiro recrutado também nasce armado (fichaDeCompanheiro,
     a pendência 3 da prova viva v9.462); a intenção fica: o LOAD nunca arma
     (garantirFichaCompanheiro e migrarPersonagem seguem sem kit). */
  t("o companheiro recrutado nasce armado: equiparKitInicial(garantirFichaCompanheiro(...))", APP.includes("try { return equiparKitInicial(garantirFichaCompanheiro({ ...f, genero:"));
  t("…e em mais lado nenhum (duas chamadas, além do import)", conta("equiparKitInicial(") === 2);
  const g = equiparKitInicial({ classe: "Guerreiro", equipados: {} });
  t("o Guerreiro nasce com a Espada Longa na mão", g.equipados && g.equipados.arma && g.equipados.arma.nome === "Espada Longa");
}

console.log(`\nabertura e kit no App: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
