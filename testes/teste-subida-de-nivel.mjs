/* teste-subida-de-nivel.mjs (AAA · 05/11/2026) — a cerimónia em conta.

   formas.md §AAA §4: a cerimónia mostra os ganhos com os números de sempre
   (os do confirmarNivel do App), forja a camada nova só quando o degrau
   muda, acende a gema se a subclasse abriu, e deixa escolher os pontos de
   atributo — tocar põe, tocar outra vez desfaz, pelo custo e pelo teto de
   atributos.js. Aqui prova-se src/subida-de-nivel.js em Node e lê-se como
   texto src/painel-subida-de-nivel.jsx (Node não importa JSX): que a peça
   lê a tabela dos tempos, tem a saída de reduce e diz o preço. */
import { readFileSync } from "node:fs";
import { degrauMudou, gemaQueAcendeu, ganhosDaSubida, alternarPonto, planoDosPontos, rotuloDoConfirmar } from "../src/subida-de-nivel.js";
import { PV_POR_NIVEL, PM_POR_NIVEL } from "../src/regras-jogo.js";
import { pontosNoNivel } from "../src/classes.js";
import { pontosAtributoNoNivel, custoDoDegrau } from "../src/atributos.js";
import { CERIMONIA_DO_NIVEL, CERIMONIA_DA_TELA, MOVIMENTO_CSS } from "../src/estilo.js";

let ok = 0, mal = 0;
const t = (nome, cond, diz = "") => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (diz ? "\n      " + diz : "")); } };
const sec = (s) => console.log("\n" + s);

const ilvara = {
  nome: "Ilvara", classe: "Mago", nivel: 10, vidaMax: 74, manaMax: 33, pontosAtr: 2, heroismo: 2,
  atributos: { forca: 0, destreza: 1, vigor: 1, intelecto: 4, presenca: 2, percepcao: 5 },
};

sec("1. a forja só quando o degrau muda (5, 10, 15 — CERIMONIA_DO_NIVEL.forja.soNoDegrau)");
{
  const forjas = Array.from({ length: 30 }, (_, i) => i + 1).filter(degrauMudou);
  t("os níveis da forja são os da tabela", forjas.join() === CERIMONIA_DO_NIVEL.forja.soNoDegrau.join(), forjas.join());
  t("nível 1 e lixo não forjam", !degrauMudou(1) && !degrauMudou(null) && !degrauMudou("x"));
}

sec("2. os ganhos, com os números de sempre (os do confirmarNivel)");
{
  const g = ganhosDaSubida(10, { vidaMax: 68, manaMax: 29, heroismo: 1 }, ilvara);
  const de = (id) => g.find((l) => l.id === id);
  t("PV máx. antes → depois", de("pv").antes === 68 && de("pv").depois === 74);
  t("PM máx. antes → depois", de("pm").antes === 29 && de("pm").depois === 33);
  t("pontos de habilidade = pontosNoNivel", de("habilidade").mais === pontosNoNivel(10));
  t("pontos de atributo = pontosAtributoNoNivel", de("atributo").mais === pontosAtributoNoNivel(10));
  t("no 10 o teto sobe (+5 → +6)", de("teto") && de("teto").antes === "+5" && de("teto").depois === "+6");
  t("o Heroísmo, quando a ficha o mostra", de("heroismo") && de("heroismo").mais === 1);
  const sem = ganhosDaSubida(11, null, { ...ilvara, nivel: 11 });
  t("sem a ficha de antes, os máximos de antes são os de depois menos o degrau da tabela", sem.find((l) => l.id === "pv").antes === 74 - PV_POR_NIVEL && sem.find((l) => l.id === "pm").antes === 33 - PM_POR_NIVEL);
  t("no 11 o teto não sobe, e não há linha dele", !sem.some((l) => l.id === "teto"));
  t("ficha nula não lança", Array.isArray(ganhosDaSubida(2, null, null)));
}

sec("3. a gema que acende (a subclasse abriu agora)");
{
  const antes = { classe: "Mago", nivel: 9 };
  const depois = { classe: "Mago", nivel: 10, subclasses: { Mago: "Arcanista" } };
  const g = gemaQueAcendeu(antes, depois);
  t("abriu: a gema é a da subclasse", g && g.pedra === "ametista");
  t("já estava aberta: nada acende", gemaQueAcendeu(depois, depois) === null);
  t("sem subclasse: nada acende", gemaQueAcendeu(antes, antes) === null && gemaQueAcendeu(null, null) === null);
}

sec("4. a escolha: tocar põe, tocar outra vez desfaz, pelo custo e pelo teto de sempre");
{
  let e = alternarPonto(ilvara, [], "forca");
  t("um toque põe um ponto", e.join() === "forca");
  e = alternarPonto(ilvara, e, "forca");
  t("o segundo toque no mesmo disco desfaz", e.length === 0);
  e = alternarPonto(ilvara, [], "percepcao");
  t("no teto (+5 no nível 10 tem teto +6, mas custa 3 e só há 2): não aceita", e.length === 0, `custo ${custoDoDegrau(5)}`);
  e = alternarPonto(ilvara, ["forca"], "destreza");
  const p = planoDosPontos(ilvara, e);
  t("dois pontos baratos em dois atributos", p.feitas.join() === "forca,destreza" && p.restam === 0);
  t("acabados os pontos, o terceiro não entra", alternarPonto(ilvara, e, "vigor").length === 2);
  t("as linhas dizem antes e depois", p.linhas[0].antes === 0 && p.linhas[0].depois === 1 && p.linhas[0].rotulo === "Força");
  t("o preço no primário: «Confirmar · Força +0 → +1, Destreza +1 → +2»", rotuloDoConfirmar(p.linhas) === "Confirmar · Força +0 → +1, Destreza +1 → +2", rotuloDoConfirmar(p.linhas));
  t("sem escolha, o verbo sozinho", rotuloDoConfirmar([]) === "Confirmar");
  t("escolha que já não cabe cai calada", planoDosPontos({ ...ilvara, pontosAtr: 0 }, ["forca"]).feitas.length === 0);
}

sec("5. a peça: a tabela dos tempos, a saída e o preço (texto de painel-subida-de-nivel.jsx)");
{
  const src = readFileSync(new URL("../src/painel-subida-de-nivel.jsx", import.meta.url), "utf8");
  const semComentario = src.replace(/\/\*[\s\S]*?\*\//g, "");
  t("exporta PainelSubidaDeNivel e textoDoGanho", /export function PainelSubidaDeNivel\b/.test(src) && /export function textoDoGanho\b/.test(src));
  t("as props que o oficial liga", ["nivel", "antes", "depois", "pontos", "ganhos", "subclasse", "aoEscolher", "aoFechar", "aoGastarDepois", "lex"].every((n) => new RegExp(`\\b${n}\\b`).test(src.slice(src.indexOf("export function PainelSubidaDeNivel"), src.indexOf("export function PainelSubidaDeNivel") + 400))));
  t("nenhuma cor solta", !/#[0-9A-Fa-f]{3,8}\b|rgba?\(/.test(semComentario));
  t("nenhum relógio de JavaScript (os tempos são do CSS)", !/setTimeout|setInterval|requestAnimationFrame/.test(semComentario));
  t("cada atraso sai de CERIMONIA_DO_NIVEL", ["C.luz.de", "C.forja.de", "C.pulso.de", "C.numero.de", "C.ganhos.de", "C.ganhos.passo", "C.gema.de", "C.escolha.de"].every((k) => semComentario.includes(k)));
  t("o primeiro toque salta (não fecha) e Esc também", /onClick=\{vivo \? saltar : undefined\}/.test(src) && /e\.key === "Escape"\) saltar\(\)/.test(src));
  t("«Gastar depois» existe e o primário diz o preço", src.includes("Gastar depois") && src.includes("rotuloDoConfirmar(plano.linhas)"));
  t("quem pediu menos movimento começa parado (só o quadro 5)", /prefers-reduced-motion: reduce/.test(src) && /"parado"/.test(src));
}

sec("6. o CSS da cerimónia: durações da tabela e saída no reduce");
{
  const i = MOVIMENTO_CSS.indexOf("@media (prefers-reduced-motion");
  const antes = MOVIMENTO_CSS.slice(0, i), dentro = MOVIMENTO_CSS.slice(i);
  const classes = ["veu", "luz", "forja", "faisca", "pulso", "numero", "ganho", "gema", "escolha", "esvai"];
  t("as dez classes da cerimónia animam", classes.every((c) => new RegExp(`\\.tv-cerimonia-${c} \\{[^}]*animation:`).test(antes)));
  t("e todas param no reduce", classes.every((c) => dentro.includes(`.tv-cerimonia-${c}`)));
  t("o véu, a luz e a escolha com as durações da tabela", antes.includes(`tvCerimoniaVeu ${CERIMONIA_DO_NIVEL.veu.dura}ms`) && antes.includes(`tvCerimoniaLuz ${CERIMONIA_DO_NIVEL.luz.dura}ms`) && antes.includes(`tvCerimoniaSobe ${CERIMONIA_DO_NIVEL.escolha.dura}ms`));
  t("com reduce, a raiz esvanece em reduzido.dura (só no reduce)", dentro.includes(`.tv-cerimonia-reduzida { animation: tvCerimoniaEsvai ${CERIMONIA_DO_NIVEL.reduzido.dura}ms`) && !antes.includes(".tv-cerimonia-reduzida"));
  t("o medalhão a ×2,4 e o número em 64 (CERIMONIA_DA_TELA)", CERIMONIA_DA_TELA.escalaDoMedalhao === 2.4 && CERIMONIA_DA_TELA.numero === 64);
  t("até à escolha: 2,54 s (escolha.de + escolha.dura = total)", CERIMONIA_DO_NIVEL.escolha.de + CERIMONIA_DO_NIVEL.escolha.dura === CERIMONIA_DO_NIVEL.total);
}

console.log(`\n${ok} ok · ${mal} falhas`);
if (mal) process.exit(1);
