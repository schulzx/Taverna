/* ============================================================
   OS ENVELOPES DO TURNO, NO MOTOR (Fase T2, trilha A, 28/10/2026) — testes/teste-motor-envelopes-do-turno.mjs

   Os textos que o App embrulhava à volta da frase do jogador saem, um
   grupo de cada vez, para src/motor/envelopes-do-turno.js. Aqui cada grupo
   é provado byte a byte contra o de antes: `envelopes-dourado.json` é o
   que o App do commit de antes de cada grupo montou — o sítio recortado à
   letra — sobre os 275 casos de `envelopes-bloco.mjs`; e esta suíte
   recorta do App de HOJE o mesmo sítio e corre-o, com as peças do motor,
   sobre os mesmos casos.

   E a prova tem de morder: a ordem das peças trocada, a peça vazia que
   ocupa linha, o espaço da ascensão perdido, a noite esquecida, a forma da
   cidade sem a água — as fotos TÊM de divergir.

   O 1.º grupo é o RODAPÉ DO SISTEMA (o relógio, o lugar, o inviolável e as
   25 peças do estado vivo).
   ============================================================ */
import fs from "node:fs";
import { N_CASOS } from "./combate-casos.mjs";
import { recorteDosEnvelopes, blocoComoFuncao, correrOBloco, fotoDoEnvelope, casosDosEnvelopes, BLOCOS } from "./envelopes-bloco.mjs";
import { oRodapeDoTurno, aCabecaDoRodape, aFormaDaqui, ORDEM_DO_RODAPE, RODAPE_DO_SISTEMA, A_FORMA_DAQUI } from "../src/motor/envelopes-do-turno.js";
import { formaDaCidade } from "../src/geografia.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const D = JSON.parse(fs.readFileSync(new URL("./envelopes-dourado.json", import.meta.url), "utf8"));
const APP = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");
const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const casos = casosDosEnvelopes(N_CASOS);
const recorte = recorteDosEnvelopes(APP);
const hoje = Object.fromEntries(BLOCOS.map((b) => [b, blocoComoFuncao(recorte[b])]));
const fotosDeHoje = (bloco, troca) => casos.map((k) => fotoDoEnvelope(correrOBloco(hoje[bloco], k, { novo: true, troca })));
const divergem = (bloco, novas) => novas.filter((f, i) => !igual(f, D.blocos[bloco][i])).length;

sec("1 · cada grupo, byte a byte contra o App de antes");
t(`o dourado tem ${N_CASOS} casos em cada grupo, e o commit de antes de cada um`, BLOCOS.every((b) => (D.blocos[b] || []).length === N_CASOS && D.antes[b]));
for (const bloco of BLOCOS) {
  const fotos = D.blocos[bloco];
  const novas = fotosDeHoje(bloco);
  const batem = novas.filter((f, i) => igual(f, fotos[i])).length;
  const primeira = novas.findIndex((f, i) => !igual(f, fotos[i]));
  t(`${bloco}: ${batem}/${N_CASOS} iguais ao App de ${D.antes[bloco]}`, batem === N_CASOS, primeira >= 0 ? `o caso ${primeira} diverge: ${JSON.stringify(novas[primeira]).slice(0, 300)} | antes ${JSON.stringify(fotos[primeira]).slice(0, 300)}` : "");
  t(`${bloco}: determinista`, igual(fotosDeHoje(bloco).slice(0, 60), novas.slice(0, 60)));
  t(`${bloco}: nenhum nome sem dublê, antes ou hoje`, [...fotos, ...novas].every((f) => !f.faltas.length), [...new Set(novas.flatMap((f) => f.faltas))].join(", "));
  t(`${bloco}: nenhum caso estoura`, [...fotos, ...novas].every((f) => !f.erro), (novas.find((f) => f.erro) || {}).erro);
  /* o teto do prompt é sagrado: o maior texto de hoje não passa do de antes */
  const maior = (xs) => Math.max(...xs.map((f) => (f.texto || "").length));
  t(`${bloco}: nenhum char a mais (o maior: ${maior(fotos)} antes, ${maior(novas)} hoje)`, maior(novas) <= maior(fotos) && novas.every((f, i) => (f.texto || "").length === (fotos[i].texto || "").length));
}

sec("2 · o rodapé: os casos percorrem o que o texto decide");
{
  const R = D.blocos.rodape;
  const conta = (fn) => R.filter(fn).length;
  const noite = conta((f) => f.texto.includes(RODAPE_DO_SISTEMA.noite + ","));
  const desperto = conta((f, i) => casos[i].divindade && casos[i].divindade.despertar);
  const ascVazia = conta((f) => f.texto.includes("já estava. \n") || / $/.test(f.texto.split("\n")[0]));
  const forma = conta((f) => f.texto.includes(A_FORMA_DAQUI.abre));
  const agua = conta((f) => f.texto.includes(A_FORMA_DAQUI.agua));
  const aperto = conta((f) => f.texto.includes(A_FORMA_DAQUI.aperto));
  const semMuro = conta((f) => f.texto.includes(A_FORMA_DAQUI.semMuro));
  const comMuro = conta((f) => f.texto.includes("A defesa é "));
  const luta = conta((f) => f.texto.includes("<resumoGridPrompt"));
  const calados = conta((f) => f.calados.length);
  const linhas = R.map((f) => f.texto.split("\n").length);
  t(`a noite (${noite}) e o dia (${N_CASOS - noite})`, noite >= 40 && N_CASOS - noite >= 40);
  t(`quem despertou (${desperto}), e o resumo vazio com o espaço à frente (${ascVazia})`, desperto >= 60 && ascVazia >= 5);
  t(`a forma daqui (${forma}): sem muro ${semMuro}, com muro ${comMuro}, a água ${agua}, o aperto ${aperto}`, forma >= 30 && semMuro >= 5 && comMuro >= 10 && agua >= 3 && aperto >= 3);
  t(`o tabuleiro só na luta (${luta})`, luta >= 10 && R.every((f, i) => !f.texto.includes("<resumoGridPrompt") || casos[i].combate));
  t(`o calou do "onde se procura" (${calados})`, calados >= 5);
  t(`peças vazias não ocupam linha: de ${Math.min(...linhas)} a ${Math.max(...linhas)} linhas`, Math.min(...linhas) < Math.max(...linhas) && R.every((f) => !f.texto.endsWith("\n")));
}

sec("3 · as peças, direto (o que o motor exporta)");
{
  const cab = { dia: 1, minuto: 1300, local: "em Ponte do Martelo", ascensao: false };
  t("a cabeça: o relógio, a noite, a estação, o lugar e o inviolável, nesta ordem",
    /^\[RODAPÉ DO SISTEMA\] Agora: .+ \(dia 1\), 21:40 \(noite\), .+\. Local: em Ponte do Martelo\. Inviolável: \(1\)/.test(aCabecaDoRodape(cab)));
  t("quem não despertou: nada depois do inviolável", aCabecaDoRodape(cab).endsWith("já estava."));
  t("quem despertou com o resumo vazio: o espaço fica (como no App)", aCabecaDoRodape({ ...cab, ascensao: "" }).endsWith("já estava. "));
  t("as 25 peças, cada uma na sua linha e na ordem da tabela", oRodapeDoTurno(cab, Object.fromEntries(ORDEM_DO_RODAPE.map((k) => [k, k]))).split("\n").slice(1).join(",") === ORDEM_DO_RODAPE.join(",") && ORDEM_DO_RODAPE.length === 25);
  t("sem peças, só a cabeça", oRodapeDoTurno(cab, null) === aCabecaDoRodape(cab));
  const aldeia = { nome: "Vau", populacao: 100 };
  t("a forma da aldeia: sem muralha", aFormaDaqui(aldeia) === `${A_FORMA_DAQUI.abre}Vau é ${formaDaCidade(aldeia).nota}. ${A_FORMA_DAQUI.semMuro}`);
}

sec("4 · a prova morde");
{
  const B = "rodape";
  const juntar = (cab, P, ordem) => aCabecaDoRodape(cab) + ordem.map((k) => (P[k] ? `\n${P[k]}` : "")).join("");
  const trocadas = [...ORDEM_DO_RODAPE]; [trocadas[3], trocadas[4]] = [trocadas[4], trocadas[3]];
  const mordidas = [
    ["a ordem das peças trocada (a cena depois da proficiência)", { oRodapeDoTurno: (c, P) => juntar(c, P || {}, trocadas) }],
    ["a peça vazia ocupa linha", { oRodapeDoTurno: (c, P) => aCabecaDoRodape(c) + ORDEM_DO_RODAPE.map((k) => `\n${(P || {})[k] || ""}`).join("") }],
    ["o espaço da ascensão vazia perdido", { oRodapeDoTurno: (c, P) => oRodapeDoTurno({ ...c, ascensao: c.ascensao || false }, P) }],
    ["a noite esquecida", { oRodapeDoTurno: (c, P) => oRodapeDoTurno(c, P).replace(RODAPE_DO_SISTEMA.noite + ",", ",") }],
    ["a forma da cidade sem a água", { aFormaDaqui: (c) => aFormaDaqui(c).replace(A_FORMA_DAQUI.agua, "") }],
    ["a forma da cidade sem o aperto", { aFormaDaqui: (c) => aFormaDaqui(c).replace(A_FORMA_DAQUI.aperto, "") }],
  ];
  for (const [nome, troca] of mordidas) {
    const n = divergem(B, fotosDeHoje(B, troca));
    t(`${nome}: ${n} casos mudam`, n > 0);
  }
}

console.log(`\n${ok} ok, ${mal} falhas`);
if (mal) process.exit(1);
