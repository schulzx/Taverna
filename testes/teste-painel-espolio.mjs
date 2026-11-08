/* teste-painel-espolio.mjs (TE10, 09/11/2026) — as peças dos espólios na
   tela (src/painel-espolio.jsx), formas.md §TE, renderizadas de verdade.

   O JSX não corre em Node: a suíte empacota um ponto de entrada com o
   esbuild (o mesmo que o vite usa) e lê o HTML de renderToStaticMarkup,
   como teste-bq-tela. O quadro final renderiza-se pedindo menos movimento
   (window.matchMedia de mentira): é o quadro que o reduce mostra, e é o
   mesmo do primeiro toque.

   Prova:
   1. a folha: os oito keyframes de §TE 8 (e os dois do ganho que conta),
      cada classe do espólio com saída no prefers-reduced-motion, as
      durações no CSS e nunca na peça;
   2. o painel só nomeia T e as tabelas (nenhum hex solto), e nenhum
      componente nasce dentro do render;
   3. a cerimónia a correr: as costas fora do grupo (sem nome), o véu é o
      botão «Toque para saltar», os atrasos saem do cronograma e o último
      fica abaixo do teto;
   4. o quadro final: um diálogo com nome, o radiogroup «As peças», a mais
      rara escolhida, o resumo lido uma vez, «Equipar já» com o preço e o
      outro lado em aria-describedby, «Guardar na mochila» e «Continuar»;
      e nenhuma animação a correr;
   5. a relíquia, o despertar, o chip do achado e a faixa do fecho. */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { buildSync } from "esbuild";
import {
  T, MOVIMENTO_CSS, SUPERFICIES_CSS, REVELACAO_DO_ESPOLIO, RELIQUIA_DA_TELA, PALAVRAS_DO_ESPOLIO, VEREDITO_DO_ESPOLIO, CHIP_DO_ACHADO,
} from "../src/estilo.js";
import { pagaDaQuest, revelacaoDoEspolio, despertarArtefacto, promessaDoArtefacto } from "../src/espolios.js";
import { questPorId } from "../src/biblioteca-de-quests.js";
import { itemConsumivel } from "../src/pocoes.js";
import { gerarLoot } from "../src/loot.js";
import { RELIQUIAS, itemDaReliquia } from "../src/relicas.js";
import { cronogramaDoEspolio, duracaoDoCronograma, nomeDaCarta, resumoDoEspolio, cartasDoEspolio, despertarNaTela } from "../src/espolio-na-tela.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? "\n      " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const AQUI = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(AQUI, "..", "src");
const W = PALAVRAS_DO_ESPOLIO;
const PAINEL = fs.readFileSync(path.join(SRC, "painel-espolio.jsx"), "utf8");
const PURO = fs.readFileSync(path.join(SRC, "espolio-na-tela.js"), "utf8");
const semComentarios = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

/* ============================================================ */
sec("1. a folha: os keyframes, a saída no reduce, as durações no CSS");
{
  const KF = ["tvCartaChega", "tvCartaTreme", "tvCartaViraA", "tvCartaViraB", "tvLuzVaza", "tvBrilhoPassa", "tvAnelAbre", "tvRunaAcende", "tvAchadoPousa", "tvFaixaEnche", "tvConta"];
  const faltam = KF.filter((k) => !MOVIMENTO_CSS.includes(`@keyframes ${k} `));
  t("os oito keyframes de §TE 8, e os dois do ganho (a barra que enche e o número que conta)", faltam.length === 0, faltam.join(", "));
  const iMedia = MOVIMENTO_CSS.lastIndexOf("@media (prefers-reduced-motion");
  const antes = MOVIMENTO_CSS.slice(0, iMedia), dentro = MOVIMENTO_CSS.slice(iMedia);
  const RX = /(\.[A-Za-z][\w-]*(?:\s*,\s*\.[A-Za-z][\w-]*)*)\s*\{([^{}]*)\}/g;
  const doEspolio = new Set();
  for (const m of antes.matchAll(RX)) if (/animation\s*:/.test(m[2])) for (const c of m[1].split(",").map((x) => x.trim())) if (/^\.tv-(carta-(chega|treme|vira)|reliquia-|luz-vaza|brilho-passa|achado-|anel-(abre|reliquia)|runa-|estrela-|despertar-|espolio-|faixa-enche|conta-)/.test(c)) doEspolio.add(c);
  const comSaida = new Set();
  for (const m of dentro.matchAll(RX)) if (/animation\s*:\s*none/.test(m[2])) for (const c of m[1].split(",").map((x) => x.trim())) comSaida.add(c);
  const semSaida = [...doEspolio].filter((c) => !comSaida.has(c));
  t(`as ${doEspolio.size} classes do espólio que animam têm saída no prefers-reduced-motion`, doEspolio.size >= 25 && semSaida.length === 0, semSaida.join(", "));
  t("a viragem dura na folha o que a tabela diz (160 + 160), e a relíquia 200 + 200",
    MOVIMENTO_CSS.includes(`.tv-carta-vira-a { animation: tvCartaViraA ${REVELACAO_DO_ESPOLIO.vira.meia}ms`) && MOVIMENTO_CSS.includes(`.tv-reliquia-vira-b { animation: tvCartaViraB ${RELIQUIA_DA_TELA.vira.abre}ms`));
  t("a peça nunca escreve uma duração (animationDuration) — só o atraso", !/animationDuration|animation:\s*["'`]/.test(semComentarios(PAINEL)));
  t("o chip alarga o toque ao piso pelo ::after", SUPERFICIES_CSS.includes(".tv-chip-do-achado::after") && SUPERFICIES_CSS.includes(`top: -${(CHIP_DO_ACHADO.alvo - CHIP_DO_ACHADO.alto) / 2}px`));
}

/* ============================================================ */
sec("2. só T e as tabelas; nenhum componente nascido dentro do render");
{
  const RX_HEX = /#[0-9a-fA-F]{3,8}\b|rgba?\(/;
  t("o painel não tem cor solta", !RX_HEX.test(semComentarios(PAINEL)));
  t("o módulo puro não tem cor solta nem React", !RX_HEX.test(semComentarios(PURO)) && !/from "react"/.test(PURO));
  /* um componente é uma função com nome em maiúscula; dentro de outra
     função (indentado) seria um componente nascido no render */
  const aninhados = semComentarios(PAINEL).split("\n").filter((l) => /^\s+(const|function)\s+[A-Z][A-Za-z]*\s*(=\s*\(|\()/.test(l));
  t("nenhum componente definido dentro de outro (o foco não se perde)", aninhados.length === 0, aninhados.join(" | "));
  t("a cerimónia não fala da máquina", !/\b(sistema|Narrador|Cronista|tokens)\b/.test(semComentarios(PAINEL).replace(/\/\/.*$/gm, "")));
}

/* ============================================================ */
/* a mesa de prova (a mesma de teste-espolio-na-tela) */
const HEROI = { nome: "Vera", classe: "Guerreiro", nivel: 7, atributos: { forca: 3 }, inventario: [], equipamento: [],
  equipados: { arma: { nome: "Espada Longa", tipo: "arma", base: "Espada Longa", raridade: "comum" }, anel: { nome: "Anel de Cobre", tipo: "anel", raridade: "comum" } } };
const F = questPorId("o_cimo_da_escada");
const feitas = Object.fromEntries(F.etapas.map((e) => [e.id, { dia: 1, ramo: Array.isArray(e.ramos) ? e.ramos[0] : null }]));
const paga = pagaDaQuest(F, { id: F.id, tipo: F.tipo, papeis: {}, feitas, escolhas: {}, estado: "concluida", desfecho: null }, { semente: "te10", nivel: 7, heroi: HEROI });
const ART = paga.itens.find((i) => i.artefacto);
const ANEL = gerarLoot("raro", { tipo: "anel", nivel: 7, rnd: () => 0.3 });
const PAGA = { ...paga, moedas: 98, xp: 269, efeitos: [{ tipo: "favor", papel: "capela" }], achados: [], itens: [ART, ANEL, itemConsumivel("ataduras")] };
const ENT = revelacaoDoEspolio(PAGA, HEROI, {});
const RELIQUIA = itemDaReliquia(RELIQUIAS[0]);
const ENT_REL = revelacaoDoEspolio({ ...PAGA, itens: [ART, RELIQUIA, ANEL] }, HEROI, {});

const ENTRADA = `
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PainelEspolio, PainelDespertar, ChipDoAchado, FaixaDoFecho, CartaDoEspolio, FioDoDespertar, LinhaDoGanho, VereditoDoEspolio, FaixaDoGanho } from "./painel-espolio.jsx";
export const html = (el) => renderToStaticMarkup(el);
export { React, PainelEspolio, PainelDespertar, ChipDoAchado, FaixaDoFecho, CartaDoEspolio, FioDoDespertar, LinhaDoGanho, VereditoDoEspolio, FaixaDoGanho };
`;
const saida = path.join(AQUI, `.tmp-painel-espolio-${process.pid}.mjs`);
buildSync({
  stdin: { contents: ENTRADA, resolveDir: SRC, loader: "jsx", sourcefile: "entrada-espolio.jsx" },
  bundle: true, format: "esm", platform: "node", outfile: saida, jsx: "transform", logLevel: "silent", external: ["react", "react-dom", "react-dom/server"],
  loader: { ".js": "jsx" }, define: { "process.env.NODE_ENV": '"production"' },
});
const R = await import(pathToFileURL(saida).href);
fs.rmSync(saida, { force: true });
const h = R.React.createElement;
const des = (s) => s.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const texto = (s) => des(s.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ");
const rotulos = (s) => [...s.matchAll(/aria-label="([^"]*)"/g)].map((m) => des(m[1]));
/* o mundo do navegador, de mentira: `reduce` pede o quadro final; `largo`, a mesa de 1024 */
const mundo = ({ reduce = false, largo = false } = {}) => {
  globalThis.window = { matchMedia: (q) => ({ matches: q.includes("reduce") ? reduce : largo, addEventListener() {}, removeEventListener() {} }), addEventListener() {}, removeEventListener() {} };
};
const semMundo = () => { delete globalThis.window; };

/* ============================================================ */
sec("3. a cerimónia a correr");
{
  mundo({ reduce: false, largo: false });
  const s = R.html(h(R.PainelEspolio, { entradas: ENT, titulo: "O Cimo da Escada", nivel: 7, xpAntes: 300, xpParaSubir: 900, nomeDoFavor: () => "a capela" }));
  t("é um diálogo modal com nome (o da quest)", /role="dialog"/.test(s) && /aria-modal="true"/.test(s) && (() => { const id = (s.match(/aria-labelledby="([^"]+)"/) || [])[1]; return id && s.includes(`id="${id}"`) && texto(s).includes("O Cimo da Escada"); })());
  t("o véu inteiro é o botão «Toque para saltar»", rotulos(s).includes(W.saltar) && texto(s).includes(W.saltar));
  t("as costas não entram no grupo: nenhum radio enquanto nada virou", !/role="radio"/.test(s) && /role="radiogroup"/.test(s));
  t("as cartas chegam de costas: o selo das costas, e nenhum nome de peça à vista", !texto(s).includes(ANEL.nome) && (s.match(/tv-carta-chega/g) || []).length === 3);
  const c = cronogramaDoEspolio(ENT);
  const chegas = c.filter((p) => p.passo === "chega").map((p) => `animation-delay:${p.de}ms`);
  t("os atrasos da chegada e da viragem são os do cronograma", chegas.every((a) => s.includes(a)) && c.filter((p) => p.passo === "vira").every((p) => s.includes(`animation-delay:${p.de}ms`)));
  const v = c.find((p) => p.passo === "veredito");
  t(`o veredito sobe no fim (${v.de} ms), e o fim não passa do teto`, s.includes(`animation-delay:${v.de}ms`) && duracaoDoCronograma(c) <= REVELACAO_DO_ESPOLIO.teto);
  t("a última, rara, treme e a luz vaza antes de virar", /tv-carta-treme/.test(s) && /tv-luz-vaza/.test(s));
  t("o resumo ainda não foi lido (a região viva está vazia)", /<p class="sr-only" aria-live="polite"><\/p>/.test(s));
  t("o XP e as moedas contam (o --alvo), e a barra enche", s.includes("--alvo:269") && s.includes("--alvo:98") && /tv-faixa-enche/.test(s));
  const coracao = R.html(h(R.PainelEspolio, { entradas: ENT, titulo: "A Última Lição", coracao: true }));
  t("o coração: «O QUE FICA», o título devagar e sem o clarão âmbar", texto(coracao).includes(W.coracao) && /tv-espolio-rotulo-coracao/.test(coracao) && !/tv-cerimonia-luz/.test(coracao));
}

/* ============================================================ */
sec("4. o quadro final (o reduce, e o primeiro toque)");
{
  mundo({ reduce: true, largo: false });
  const s = R.html(h(R.PainelEspolio, { entradas: ENT, titulo: "O Cimo da Escada", nivel: 7, xpAntes: 300, xpParaSubir: 900, nomeDoFavor: () => "a capela" }));
  const cartas = cartasDoEspolio(ENT);
  t("nada chega, nada vira, nada treme, nada conta", !/tv-carta-(chega|vira|treme)|tv-luz-vaza|tv-conta|tv-faixa-enche|animation-delay/.test(s));
  t("o radiogroup «As peças» com uma carta-radio por peça", /role="radiogroup" aria-label="As peças"/.test(s) && (s.match(/role="radio"/g) || []).length === cartas.length);
  t("cada carta tem por nome o de nomeDaCarta", cartas.every((e) => rotulos(s).includes(nomeDaCarta(e))));
  const marcadas = [...s.matchAll(/role="radio" aria-checked="(true|false)" tabindex="(-?\d)"/g)];
  t("a mais rara (a última) está escolhida, e é a única com tabindex 0 (roving)", marcadas.length === 3 && marcadas[2][1] === "true" && marcadas[2][2] === "0" && marcadas.slice(0, 2).every((m) => m[1] === "false" && m[2] === "-1"));
  const resumo = resumoDoEspolio(ENT, { nomeDoFavor: () => "a capela" });
  t("o resumo é lido uma vez, na região viva", s.includes(`aria-live="polite">${resumo.replace(/&/g, "&amp;")}</p>`) || des(s).includes(`aria-live="polite">${resumo}</p>`));
  const equipar = (s.match(/<button[^>]*aria-describedby="([^"]+)"[^>]*>([^<]*)<\/button>/) || []);
  t("«Equipar já» diz o preço, e o outro lado («Sai …») é a sua descrição",
    equipar[2] && des(equipar[2]).startsWith(W.equipar) && new RegExp(`id="${equipar[1]}"[^>]*>Sai `).test(des(s)), equipar[0]);
  t("«Guardar na mochila» e «Continuar»", texto(s).includes(W.guardar) && texto(s).includes(W.continuar));
  t("o veredito do artefacto: o estado com o nível, e os poderes por acordar", texto(s).includes(`Adormecida · ${W.acorda.replace("{n}", promessaDoArtefacto(ART, 7).nivelQueAcorda)}`) && texto(s).includes(W.porAcordar));
  t("o favor tem o lugar («A capela fica a dever-te»)", texto(s).includes("A capela fica a dever-te"));
  t("a barra mostra o que havia a 0,55 e o que entra cheio", s.includes("width:33.33") && s.includes(`background:rgba(240,162,59,0.55)`));
  t("no telefone, as cartas a ×0,8 (96 de largo) e o veredito de 343", s.includes("width:96px") && s.includes(`max-width:${VEREDITO_DO_ESPOLIO.largura.telefone}px`));
  mundo({ reduce: true, largo: true });
  const m = R.html(h(R.PainelEspolio, { entradas: ENT, titulo: "O Cimo da Escada", nivel: 7 }));
  t("na mesa (≥ 1024), as cartas a ×1,27 e o veredito de 360", m.includes("width:152.4px") && m.includes(`max-width:${VEREDITO_DO_ESPOLIO.largura.mesa}px`));
  const sem = R.html(h(R.PainelEspolio, { entradas: ENT, titulo: "x" }));
  t("sem o nome do lugar, o favor cala-se; sem régua, a barra também", !texto(sem).includes("capela") && !sem.includes("rgba(240,162,59,0.55)"));
}

/* ============================================================ */
sec("5. a relíquia, o despertar, o achado e o fecho");
{
  mundo({ reduce: true });
  const s = R.html(h(R.PainelEspolio, { entradas: ENT_REL, titulo: "O Cimo da Escada", nivel: 7 }));
  t("a relíquia: «Há N no mundo. Esta é tua.» com o N de RELIQUIAS", texto(s).includes(W.reliquia.replace("{n}", RELIQUIAS.length)));
  t("a vela apaga-se: o véu sem retorno e o lume turquesa", s.includes(`rgba(18,36,27,${RELIQUIA_DA_TELA.veu})`) && s.includes(`rgba(63,214,198,${RELIQUIA_DA_TELA.lume.alfa})`));
  t("as outras cartas descem a 0,4", s.includes(`opacity:${RELIQUIA_DA_TELA.outras}`));
  t("o veredito da relíquia diz o gesto, uma vez por dia", texto(s).includes(`${RELIQUIA.ativo.nome}, ${W.porDia}`));

  const desperta = despertarArtefacto(ART, { nivel: 10 });
  const d = R.html(h(R.PainelDespertar, { antes: ART, depois: desperta, nivel: 10 }));
  const dd = despertarNaTela(ART, desperta, 10);
  t("o despertar: um diálogo, «DESPERTA», o nome e o ganho", /role="dialog"/.test(d) && texto(d).includes(W.desperta) && texto(d).includes(ART.nome) && texto(d).includes(`+ ${dd.ganhos[0].nome}`));
  t("o leitor ouve o despertar uma vez", des(d).includes(`aria-live="polite">${dd.leitor}</p>`));
  t("no quadro final, «Toque para continuar»", rotulos(d).includes(W.continuarToque));
  mundo({ reduce: false });
  const dv = R.html(h(R.PainelDespertar, { antes: ART, depois: desperta, nivel: 10 }));
  t("a correr: a runa nova acende, o anel abre, saltam dez faíscas", /tv-runa-acende/.test(dv) && /tv-anel-abre/.test(dv) && (dv.match(/tv-cerimonia-faisca/g) || []).length === 10);
  t("nada mudou, nada se desenha", R.html(h(R.PainelDespertar, { antes: ART, depois: ART, nivel: 7 })) === "");

  const chip = R.html(h(R.ChipDoAchado, { achado: { item: { nome: "Anel do astrónomo", tipo: "anel", raridade: "comum", atributos: { defesa: 1 } } }, heroi: { equipados: {} } }));
  t("o chip do achado é um botão: «Achaste: …, melhor que o teu (CA mais 1). Examinar.»", /^<button/.test(chip) && rotulos(chip)[0] === "Achaste: Anel do astrónomo, comum, melhor que o teu (CA mais 1). Examinar.", rotulos(chip)[0]);
  t("pousa, alarga o toque, e leva «▲ CA +1»", /tv-achado-pousa/.test(chip) && /tv-chip-do-achado/.test(chip) && texto(chip).includes("▲ CA +1"));
  const moedas = R.html(h(R.ChipDoAchado, { achado: { diz: "uma dívida escrita, assinada", moedas: 65 }, pousa: false }));
  t("as moedas: a borda de controlo, sem brilho, e já pousado quando não é a primeira vez", moedas.includes(`border:1px solid ${T.lineStrong}`) && !/tv-achado-(pousa|brilho)/.test(moedas));

  const fecho = R.html(h(R.FaixaDoFecho, { quest: "O Recado do Moleiro", xp: 88, moedas: 61, barra: { havia: 0.4, entra: 0.2, subiu: false } }));
  t("o fecho sem peça: «✓ {quest}», a mini-barra, +XP e as moedas, a entrar como o fim da luta", texto(fecho).includes("O Recado do Moleiro") && texto(fecho).includes("+88") && texto(fecho).includes("+61") && /tv-fim-entra/.test(fecho) && fecho.includes("width:40px"));
  t("sem ganho, sem faixa", R.html(h(R.FaixaDoFecho, { quest: "x" })) === "");

  const linha = R.html(h(R.LinhaDoGanho, { linha: { id: "ca", rotulo: "Classe de armadura", antes: 15, depois: 16, delta: 1, sinal: "ok" } }));
  t("a linha do ganho: ▲ escondido do leitor, que ouve «sobe»", /aria-hidden="true"[^>]*>▲</.test(linha) && linha.includes(`<span class="sr-only">${W.leitor.sobe}</span>`));
  const costas = R.html(h(R.CartaDoEspolio, { item: ANEL, face: "costas" }));
  t("as costas da carta rara deixam a luz vazar pela borda, e não dizem o nome", costas.includes("box-shadow") && costas.includes("rgba(90,169,240") && !texto(costas).includes(ANEL.nome) && /aria-hidden="true"/.test(costas));
  const fio = R.html(h(R.FioDoDespertar, { fio: { runas: [true, false], estrela: false } }));
  t("o fio: duas casas de runa e a estrela", (fio.match(/rotate\(45deg\)/g) || []).length === 3 && /<path/.test(fio));
  const vered = R.html(h(R.VereditoDoEspolio, { entrada: cartasDoEspolio(ENT)[0] }));
  const faixa = R.html(h(R.FaixaDoGanho, { xp: 10, moedas: 0, barra: { havia: 0.9, entra: 0.1, subiu: true }, nivelNovo: 8 }));
  t("o veredito do consumível sem botão; a faixa que passa o nível diz o nível novo e põe o selo", texto(vered).includes(W.naMochila) && !/<button/.test(vered) && texto(faixa).includes("Nível 8") && /<svg/.test(faixa));
}
semMundo();

console.log(`\n${ok} ok, ${mal} mal`);
if (mal) process.exit(1);
