/* teste-constelacao.mjs (AR 11 e AR 12, 07/11/2026) — a constelação do herói
   e a prateleira dos mantimentos (formas.md §AR 11, §AR 12; Figma 298:4457,
   299:4688, 300:4812, 302:4813 · 294:3628, 294:4040, 294:4080).

   Prova:
   1. as tabelas estão em estilo.js, e a geometria é a do desenho tal qual
      (mente/figma/constelacao-geometria.mjs);
   2. validarCeu(): dentro da borda, e a distância mínima de 0,07 entre duas
      estrelas que possam estar à vista juntas (12 classes × os três conjuntos);
   3. cada estrela aponta para um nó que existe na árvore REAL da classe
      (arvoreDaClasse, arvoreDaSubclasse, arvoreDaEspecializacao), e cada nó
      tem a sua estrela;
   4. o contraste do céu (WCAG 2.2) e o movimento (a duração no CSS, a saída
      no reduce);
   5. o céu renderizado: as 12 classes têm figura, cada estrela é um botão com
      nome, o clique leva ao veredito da árvore, os nomes repetidos, a
      multiclasse e o estado sem pontos;
   6. a prateleira: o dado de uso lê a face (não a calcula), é um botão só, e
      os glifos novos chegam à tela no lugar dos emojis;
   7. o fim do dia (294:4493, 08/11): o lance de uso roda só os dados que vêm
      em «usos», o selo «−1» só no 1, a contagem que corre, o null, o reduce e
      o nome do lance.

   O JSX não corre em Node: empacota-se um ponto de entrada com o esbuild (o
   mesmo de teste-ar-pecas) e lê-se o HTML de renderToStaticMarkup. */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { buildSync } from "esbuild";
import {
  T, FOLHA, CONSTELACAO, FIGURAS_DA_CONSTELACAO, LUGAR_DAS_FIGURAS, GEMA_DA_SUBCLASSE, MOLDURA_POR_DEGRAU,
  CERIMONIA_DE_APRENDER, DADO_DE_USO_NA_MESA, ALVOS, MOVIMENTO_DO_DADO, PAPEL_DO_DADO, TIRA_DA_MESA,
} from "../src/estilo.js";
import * as GEO from "../mente/figma/constelacao-geometria.mjs";
import {
  CLASSES, arvoreDaClasse, arvoreDaSubclasse, arvoreDaEspecializacao, especializacoesDaSubclasse, pontosDisponiveis,
} from "../src/classes.js";
import { GLIFOS, ASSUNTO_DO_EMOJI, assuntoDaLinha } from "../src/glifos.js";
import { DADO_DE_USO, faceDoDadoDeUso } from "../src/dado-de-uso.js";
import { lancamentoDoDadoDeUso, lancamentoDoTeste, naBandeja } from "../src/motor/a-bandeja.js";
import { razao, rgb } from "./conta-da-luz.mjs";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? "\n      " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const AQUI = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(AQUI, "..", "src");

/* o ponto de entrada: o céu, o painel e a prateleira */
const ENTRADA = `
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CeuDoHeroi, ceuDaClasse, medidasDoCeu } from "./painel-ceu.jsx";
import { PainelTalentos } from "./painel-talentos.jsx";
import { PrateleiraDosMantimentos, DadoDeUso, nomeDaPrateleira, vistaDoLanceDeUso, nomeDoLanceDeUso } from "./painel-mesa-do-mestre.jsx";
export const html = (el) => renderToStaticMarkup(el);
export { React, CeuDoHeroi, ceuDaClasse, medidasDoCeu, PainelTalentos, PrateleiraDosMantimentos, DadoDeUso, nomeDaPrateleira, vistaDoLanceDeUso, nomeDoLanceDeUso };
`;
const saida = path.join(AQUI, `.tmp-constelacao-${process.pid}.mjs`);
buildSync({
  stdin: { contents: ENTRADA, resolveDir: SRC, loader: "jsx", sourcefile: "entrada-constelacao.jsx" },
  /* automatic: painel-bandeja.jsx (o Corpo) não importa React, como o vite permite */
  bundle: true, format: "esm", platform: "node", outfile: saida, jsx: "automatic", logLevel: "silent", external: ["react", "react-dom", "react-dom/server", "react/jsx-runtime"],
  loader: { ".js": "jsx" }, define: { "process.env.NODE_ENV": '"production"' },
});
const R = await import(pathToFileURL(saida).href);
fs.rmSync(saida, { force: true });
const h = R.React.createElement;
const html = (c, p) => R.html(h(c, p));
const texto = (s) => s.replace(/<[^>]+>/g, " ").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/\s+/g, " ");
const desfaz = (s) => s.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");

/* ============================================================ */
sec("1. as tabelas, e a geometria do desenho tal qual");
{
  t("CONSTELACAO: o céu e a estrela de fundo são as duas cores novas", /^#[0-9A-F]{6}$/.test(CONSTELACAO.ceu) && /^#[0-9A-F]{6}$/.test(CONSTELACAO.estrela));
  t("o quadrado: 600 na mesa, 343 no telefone; a barra 76 / 44", CONSTELACAO.lado.mesa === 600 && CONSTELACAO.lado.telefone === 343 && CONSTELACAO.topo.mesa === 76 && CONSTELACAO.topo.telefone === 44);
  t("o alvo vai de 24 (WCAG 2.5.8) a 44, e a distância mínima é 0,07", CONSTELACAO.alvo.minimo === 24 && CONSTELACAO.alvo.maximo === 44 && CONSTELACAO.minimo === 0.07);
  t("0,07 do lado do telefone dá os 24 px de 2.5.8", Math.round(CONSTELACAO.minimo * CONSTELACAO.lado.telefone) >= CONSTELACAO.alvo.minimo);
  t("os metais saem da moldura: ouro na classe, a gema na subclasse, prata na especialização",
    CONSTELACAO.metal.classe.luz === MOLDURA_POR_DEGRAU.ouro.claro && CONSTELACAO.metal.especializacao.fio === MOLDURA_POR_DEGRAU.prata.meio && CONSTELACAO.metal.subclasse.luz === "gema.luz");
  t("FIGURAS_DA_CONSTELACAO é a do desenho, byte a byte", JSON.stringify(FIGURAS_DA_CONSTELACAO) === JSON.stringify(GEO.FIGURAS_DA_CONSTELACAO));
  t("LUGAR_DAS_FIGURAS também", JSON.stringify(LUGAR_DAS_FIGURAS) === JSON.stringify(GEO.LUGAR_DAS_FIGURAS));
  const nomes = CLASSES.map((c) => c.nome);
  t("as 12 classes têm figura (e nenhuma figura sem classe)", nomes.length === 12 && nomes.every((n) => FIGURAS_DA_CONSTELACAO[n]) && Object.keys(FIGURAS_DA_CONSTELACAO).every((n) => nomes.includes(n)),
    nomes.filter((n) => !FIGURAS_DA_CONSTELACAO[n]).join(", "));
  t("cada figura tem nome, raiz entre as estrelas e três braços", Object.values(FIGURAS_DA_CONSTELACAO).every((f) => f.figura && f.estrelas[f.raiz] && Object.keys(f.bracos).length === 3));
  t("DADO_DE_USO_NA_MESA: rações, água, tochas, no papel do osso", DADO_DE_USO_NA_MESA.ordem.join() === "racoes,agua,tochas" && DADO_DE_USO_NA_MESA.papel === "uso" && PAPEL_DO_DADO.uso);
  /* MOVIDAS em 07/11 (TL 8, a tela limpa): no telefone os mantimentos mudaram
     para a Tira da mesa — o dado a 22, em colunas de 24 com 2 entre elas, e o
     alvo 76 × 56 (a altura da fila da tira). A intenção fica: o alvo do
     telefone cabe os três dados, e nunca desce do piso de toque. */
  t("os alvos: 120 × 132 na mesa, 76 × 56 no telefone (nunca abaixo do piso)", DADO_DE_USO_NA_MESA.mesa.alvo.largura === 120 && DADO_DE_USO_NA_MESA.mesa.alvo.alto === 132 && DADO_DE_USO_NA_MESA.telefone.alvo.largura === 76 && DADO_DE_USO_NA_MESA.telefone.alvo.alto === 56 && DADO_DE_USO_NA_MESA.telefone.alvo.alto >= ALVOS.piso);
  t("três dados de 22 em colunas de 24 cabem nos 76 da tira", 3 * TIRA_DA_MESA.mantimentos.coluna + 2 * TIRA_DA_MESA.mantimentos.entre <= DADO_DE_USO_NA_MESA.telefone.alvo.largura && DADO_DE_USO_NA_MESA.telefone.dado <= TIRA_DA_MESA.mantimentos.coluna);
  t("as duas linhas de 44 e a contagem cabem nos 132 da mesa",
    2 * (DADO_DE_USO_NA_MESA.mesa.dado + DADO_DE_USO_NA_MESA.contagem.entre + DADO_DE_USO_NA_MESA.contagem.tamanho) + (DADO_DE_USO_NA_MESA.mesa.entreLinhas - DADO_DE_USO_NA_MESA.contagem.entre - DADO_DE_USO_NA_MESA.contagem.tamanho) <= DADO_DE_USO_NA_MESA.mesa.alvo.alto);
  t("o dado de uso tem um glifo para cada face que o sistema dá", [10, 8, 6, 4].every((f) => DADO_DE_USO_NA_MESA.mesa.glifo[f] && DADO_DE_USO_NA_MESA.telefone.glifo[f]));
  t("o rolar é o da Bandeja (nenhum tempo novo)", DADO_DE_USO_NA_MESA.rolar.dura === MOVIMENTO_DO_DADO.rolar && DADO_DE_USO_NA_MESA.reduzido === MOVIMENTO_DO_DADO.semMovimento);
}

/* ============================================================ */
sec("2. validarCeu() — a borda e a distância mínima, em cada conjunto à vista");
/* A régua é a de mente/figma/constelacao-geometria.mjs: dentro de [0,03 · 0,97]
   e nunca mais perto que 0,07 (menos meio passo de arredondamento dos três
   decimais, 0,0015). Mede o ceuDaClasse DA PEÇA, não o do desenho. */
function validarCeu() {
  const erros = [];
  const [b0, b1] = GEO.BRACO_E_RAMO.borda;
  const medir = (rot, es) => {
    for (const e of es) if (e.p.some((v) => v < b0 || v > b1)) erros.push(`${rot}: ${e.chave} fora`);
    for (let i = 0; i < es.length; i++) for (let j = i + 1; j < es.length; j++)
      if (Math.hypot(es[i].p[0] - es[j].p[0], es[i].p[1] - es[j].p[1]) < CONSTELACAO.minimo - 0.0015) erros.push(`${rot}: ${es[i].chave} ~ ${es[j].chave}`);
  };
  let conjuntos = 0;
  for (const [classe, f] of Object.entries(FIGURAS_DA_CONSTELACAO)) {
    medir(classe, R.ceuDaClasse(classe).estrelas); conjuntos++;
    for (const s of Object.keys(f.bracos)) {
      medir(`${classe}/${s}`, R.ceuDaClasse(classe, { sub: s }).estrelas); conjuntos++;
      for (const e of Object.keys(f.bracos[s].ramos)) { medir(`${classe}/${s}/${e}`, R.ceuDaClasse(classe, { sub: s, esp: e }).estrelas); conjuntos++; }
    }
  }
  return { erros, conjuntos };
}
{
  const { erros, conjuntos } = validarCeu();
  t(`zero erros em ${conjuntos} conjuntos (12 classes × três braços, braço + dois ramos, braço + um ramo)`, erros.length === 0 && conjuntos === 12 * (1 + 3 + 6), erros.slice(0, 5).join(" | "));
  t("o desenho mede o mesmo (o validarCeu dele)", GEO.validarCeu().length === 0);
  const sem = R.ceuDaClasse("Mago"), com = R.ceuDaClasse("Mago", { sub: "Elementalista" }), esp = R.ceuDaClasse("Mago", { sub: "Elementalista", esp: "Piromante" });
  t("o que está à vista: sem subclasse, a figura e os três braços (16 + 12)", sem.estrelas.length === 28 && new Set(sem.estrelas.filter((e) => e.sub).map((e) => e.sub)).size === 3);
  t("com subclasse, o braço e os dois ramos (16 + 4 + 6 = 26, o «6 de 26» do quadro)", com.estrelas.length === 26);
  t("com especialização, só o ramo escolhido (16 + 4 + 3)", esp.estrelas.length === 23 && esp.estrelas.every((e) => !e.esp || e.esp === "Piromante"));
  t("a nascença do braço parte da raiz da figura, a do ramo da última estrela do braço",
    com.ligacoes.some((l) => l.nascenca && l.de === "classe:Projétil Arcano" && l.para === "sub:Elementalista:Manto Flamejante")
    && com.ligacoes.some((l) => l.nascenca && l.de === "sub:Elementalista:Convergência" && l.para === "esp:Piromante:Brasa Persistente"));
}

/* ============================================================ */
sec("3. cada estrela é um nó da árvore real (e cada nó tem a sua estrela)");
{
  const faltas = [], sobras = [];
  for (const c of CLASSES) {
    const f = FIGURAS_DA_CONSTELACAO[c.nome];
    if (!f) continue;
    const comparar = (rot, estrelas, nos) => {
      const ne = new Set(estrelas), nn = new Set(nos);
      for (const n of ne) if (!nn.has(n)) faltas.push(`${rot}: ${n}`);
      for (const n of nn) if (!ne.has(n)) sobras.push(`${rot}: ${n}`);
    };
    comparar(c.nome, Object.keys(f.estrelas), arvoreDaClasse({ classe: c.nome, nivel: 20, habilidades: [] }, c.nome).map((x) => x.nome));
    for (const [s, b] of Object.entries(f.bracos)) {
      const pers = { classe: c.nome, nivel: 20, habilidades: [], subclasses: { [c.nome]: s } };
      comparar(`${c.nome}/${s}`, Object.keys(b.estrelas), arvoreDaSubclasse(pers, c.nome).map((x) => x.nome));
      t(`${c.nome}/${s}: os ramos são as especializações da subclasse`, JSON.stringify(Object.keys(b.ramos).sort()) === JSON.stringify(especializacoesDaSubclasse(s).slice().sort()), Object.keys(b.ramos).join(", "));
      for (const [e, r] of Object.entries(b.ramos)) {
        const pe = { ...pers, especializacoes: { [c.nome]: e } };
        comparar(`${c.nome}/${s}/${e}`, Object.keys(r.estrelas), arvoreDaEspecializacao(pe, c.nome).map((x) => x.nome));
      }
    }
    t(`${c.nome}: os três braços são as três subclasses`, JSON.stringify(Object.keys(f.bracos).sort()) === JSON.stringify((c.subclasses || []).map((x) => x.nome).sort()));
  }
  t("toda estrela aponta para um nó que existe", faltas.length === 0, faltas.slice(0, 6).join(" | "));
  t("e todo nó da árvore tem a sua estrela", sobras.length === 0, sobras.slice(0, 6).join(" | "));
}

/* ============================================================ */
sec("4. o contraste do céu (WCAG 2.2) e o movimento");
{
  const ceu = rgb(CONSTELACAO.ceu);
  const LETRA = [
    ["nome aceso ink", T.ink], ["nome disponível inkMeio", T.inkMeio], ["escolhida ouro claro", MOLDURA_POR_DEGRAU.ouro.claro],
    ["ponta da especialização prata clara", MOLDURA_POR_DEGRAU.prata.claro], ["título e linha inkDim", T.inkDim],
  ];
  for (const [n, c] of LETRA) { const r = razao(rgb(c), ceu); t(`(letra) ${n}: ${r.toFixed(2)} ≥ 4,5`, r >= 4.5); }
  const pioresLuz = Object.entries(GEMA_DA_SUBCLASSE).map(([s, g]) => [s, razao(rgb(g.luz), ceu)]).sort((a, b) => a[1] - b[1]);
  t(`(letra) a luz das ${pioresLuz.length} gemas (as pontas): a pior, ${pioresLuz[0][0]}, ${pioresLuz[0][1].toFixed(2)} ≥ 4,5`, pioresLuz[0][1] >= 4.5);
  const FORMA = [
    ["anel disponível amber", T.amber], ["por acender inkDim", T.inkDim], ["ligação ouro meio", MOLDURA_POR_DEGRAU.ouro.meio],
    ["ligação prata meio", MOLDURA_POR_DEGRAU.prata.meio], ["ligação apagada lineStrong", T.lineStrong],
  ];
  for (const [n, c] of FORMA) { const r = razao(rgb(c), ceu); t(`(forma) ${n}: ${r.toFixed(2)} ≥ 3`, r >= 3); }
  const piorCorpo = Object.entries(GEMA_DA_SUBCLASSE).map(([s, g]) => [s, razao(rgb(g.corpo), ceu)]).sort((a, b) => a[1] - b[1])[0];
  t(`(forma) o corpo das gemas nas ligações: o pior, ${piorCorpo[0]}, ${piorCorpo[1].toFixed(2)} ≥ 3`, piorCorpo[1] >= 3);

  const classes = ["tv-ceu-acende", "tv-ceu-halo", "tv-ceu-fio", "tv-ceu-brilho", "tv-ceu-sai", "tv-uso-encolhe"];
  const fora = FOLHA.split("@media (prefers-reduced-motion: reduce)")[0];
  const semDuracao = classes.filter((c) => !new RegExp(`\\.${c} \\{[^}]*animation: \\w+ \\d+ms`).test(fora));
  t("cada movimento do céu e da prateleira tem a duração no CSS", semDuracao.length === 0, semDuracao.join(", "));
  t("acender e o fio têm os tempos da cerimónia de aprender (sem número novo)",
    new RegExp(`\\.tv-ceu-acende \\{[^}]*${CERIMONIA_DE_APRENDER.selo.dura}ms`).test(fora) && new RegExp(`\\.tv-ceu-fio \\{[^}]*${CERIMONIA_DE_APRENDER.fio.dura}ms ease-out ${CERIMONIA_DE_APRENDER.fio.de}ms`).test(fora));
  t("o brilho da figura fechada dura 600 ms e os braços saem em 320", new RegExp(`\\.tv-ceu-brilho \\{[^}]*${CONSTELACAO.fecho.brilho}ms`).test(fora) && new RegExp(`\\.tv-ceu-sai \\{[^}]*${CONSTELACAO.saida.bracos}ms`).test(fora));
  t("o encolher: 0,82 → 1 em 320 ms", fora.includes(`scale(${DADO_DE_USO_NA_MESA.encolher.escala})`) && new RegExp(`\\.tv-uso-encolhe \\{[^}]*${DADO_DE_USO_NA_MESA.encolher.dura}ms`).test(fora));
  const reduce = FOLHA.split("@media (prefers-reduced-motion: reduce)").slice(1).find((b) => b.includes("tv-ceu-acende")) || "";
  const paradas = classes.filter((c) => new RegExp(`\\.${c}[^{]*\\{ animation: none;`).test(reduce) || new RegExp(`[^{}]*\\.${c}[^{}]*\\{ animation: none;`).test(reduce));
  t("no reduce, todos param (animation: none)", paradas.length === classes.length, classes.filter((c) => !paradas.includes(c)).join(", "));
  t("no reduce, a estrela e a ligação esvanecem juntas em 160 ms", new RegExp(`\\.tv-ceu-reduzida \\{ animation: tvCerimoniaEsvai ${CERIMONIA_DE_APRENDER.reduzido.dura}ms`).test(reduce));
  t("no reduce, os braços somem a seco em 120 ms", new RegExp(`\\.tv-ceu-sai-reduzida \\{ animation: tvCeuSai ${CONSTELACAO.saida.reduzido}ms steps`).test(reduce));
}

/* ============================================================
   5 · O CÉU RENDERIZADO */
/* a Thalia: Maga Elementalista, nível 6, com cinco aprendidas (a mesma de teste-talentos-ar) */
const APRENDIDAS = ["Projétil Arcano", "Escudo Arcano", "Rajada de Fogo", "Ler Auras", "Manto Flamejante"];
const thalia = { nome: "Thalia", classe: "Mago", subclasse: "Elementalista", nivel: 6, moedas: 120, habilidades: APRENDIDAS.map((nome) => ({ nome })) };
const estrelasDo = (s) => [...s.matchAll(/<button type="button" data-chave="([^"]+)" aria-label="([^"]+)"/g)].map((m) => ({ chave: desfaz(m[1]), rotulo: desfaz(m[2]) }));

sec("5a. as 12 figuras, cada estrela um botão com nome");
{
  for (const c of CLASSES) {
    const pers = { nome: "X", classe: c.nome, nivel: 3, habilidades: [] };
    const s = html(R.PainelTalentos, { personagem: pers, leiaute: "mesa", vistaInicial: "ceu" });
    const es = estrelasDo(s);
    const vistas = R.ceuDaClasse(c.nome).estrelas;
    t(`${c.nome} (${FIGURAS_DA_CONSTELACAO[c.nome].figura}): ${es.length} estrelas tocáveis, todas com nome`,
      es.length === vistas.length && es.every((e) => e.rotulo.length > e.chave.split(":").pop().length) && s.includes(`data-vista="ceu"`), `${es.length} de ${vistas.length}`);
  }
  const mesa = html(R.PainelTalentos, { personagem: thalia, leiaute: "mesa", vistaInicial: "ceu" });
  const es = estrelasDo(mesa);
  const pontos = pontosDisponiveis(thalia);
  const acesas = es.filter((e) => /— aprendida\.$/.test(e.rotulo));
  t("o céu é um grupo com o nome e a conta: «O céu do Mago: 5 de 26 estrelas acesas»", /role="group" aria-label="O céu do Mago: 5 de 26 estrelas acesas"/.test(mesa));
  t("a linha de cima: a figura, a conta e a subclasse", texto(mesa).includes("o cajado · 5 de 26 estrelas acesas · Elementalista"));
  t("as cinco aprendidas dizem-no no nome", acesas.length === 5 && APRENDIDAS.every((n) => acesas.some((e) => e.rotulo.startsWith(n + " —"))));
  const contra = es.find((e) => e.chave === "classe:Contramágica");
  t("a disponível diz o ramo, o degrau, o tipo e o preço: «Contramágica — Mago, degrau 6, defesa. Por acender: custa 2 pontos.»",
    !!contra && contra.rotulo === "Contramágica — Mago, degrau 6, defesa. Por acender: custa 2 pontos.", contra && contra.rotulo);
  const meteoro = es.find((e) => e.chave === "classe:Meteoro");
  t("a fechada diz o porquê, das regras", !!meteoro && /Meteoro — Mago, degrau \d+\. .+\.$/.test(meteoro.rotulo) && !/Por acender/.test(meteoro.rotulo), meteoro && meteoro.rotulo);
  t("UMA paragem de Tab: só uma estrela com tabindex 0", (mesa.match(/data-chave="[^"]+" aria-label="[^"]+" aria-pressed="(?:true|false)" tabindex="0"/g) || []).length === 1);
  t("o verbo que volta: «Ver a árvore · a mesma árvore, deitada»", texto(mesa).includes("Ver a árvore") && texto(mesa).includes("a mesma árvore, deitada"));
  const arvore = html(R.PainelTalentos, { personagem: thalia, leiaute: "mesa" });
  t("a árvore continua a abrir primeiro, com o verbo «Ver o céu»", !arvore.includes(`data-vista="ceu"`) && texto(arvore).includes("Ver o céu") && texto(arvore).includes("a mesma árvore, no céu"));
  t("os anéis âmbar são as disponíveis (forma, não só cor)", (mesa.match(/data-estrela="disponivel"/g) || []).length === es.filter((e) => /Por acender/.test(e.rotulo)).length && pontos > 0);
  const tel = html(R.PainelTalentos, { personagem: thalia, leiaute: "telefone", vistaInicial: "ceu" });
  t("no telefone: o mesmo céu, e o verbo sem o preço", estrelasDo(tel).length === 26 && texto(tel).includes("Ver a árvore") && !texto(tel).includes("a mesma árvore, deitada"));
  const alvos = [...mesa.matchAll(/data-chave="[^"]+"[^>]*width:(\d+(?:\.\d+)?)px/g)].map((m) => Number(m[1]));
  t(`o alvo de cada estrela na mesa: min(44, a vizinha) — o menor ${Math.min(...alvos).toFixed(1)} ≥ ${CONSTELACAO.alvo.minimo}`, alvos.length === 26 && Math.min(...alvos) >= CONSTELACAO.alvo.minimo && Math.max(...alvos) <= CONSTELACAO.alvo.maximo);
}

sec("5b. o clique leva ao veredito");
{
  /* A peça não tem hooks: chama-se como função, acha-se o botão da estrela
     na árvore de elementos e carrega-se nele de verdade. */
  const achar = (el, pred, out = []) => {
    if (el == null || typeof el !== "object") return out;
    if (Array.isArray(el)) { for (const x of el) achar(x, pred, out); return out; }
    if (el.props) { if (pred(el)) out.push(el); achar(el.props.children, pred, out); }
    return out;
  };
  const tocadas = [];
  const estado = (cl, e) => ({ estado: e.chave === "classe:Contramágica" ? "disponivel" : "porAcender", rotulo: e.nome });
  const arvoreDeElementos = R.CeuDoHeroi({ classe: "Mago", sub: "Elementalista", estadoDaEstrela: estado, aoTocarEstrela: (e, p) => tocadas.push({ e, p }), aoFocar: () => {} });
  const [botao] = achar(arvoreDeElementos, (el) => el.type === "button" && el.props["data-chave"] === "classe:Contramágica");
  t("a estrela é um <button> na árvore da peça", !!botao && typeof botao.props.onClick === "function");
  if (botao) botao.props.onClick({ currentTarget: {} });
  t("tocar entrega ao painel a estrela e onde ela está", tocadas.length === 1 && tocadas[0].e.chave === "classe:Contramágica" && Number.isFinite(tocadas[0].p.x) && Number.isFinite(tocadas[0].p.y));
  /* o painel usa a MESMA função para o toque e para a porta `inicial`: a chave da estrela */
  const v = texto(html(R.PainelTalentos, { personagem: thalia, leiaute: "mesa", vistaInicial: "ceu", inicial: tocadas[0] ? tocadas[0].e.chave : "classe:Contramágica" }));
  t("o veredito é o da árvore: o nome, «Mago · degrau 6 · defesa», o verbo armado com o preço", v.includes("Contramágica") && v.includes("Mago · degrau 6 · defesa") && v.includes("Aprender Contramágica") && v.includes("2 pontos · ficas com"));
  const vArv = texto(html(R.PainelTalentos, { personagem: thalia, leiaute: "mesa", inicial: "Contramágica" }));
  const corte = (s) => s.slice(s.indexOf("Cancela"), s.indexOf("Fica tua"));
  t("e diz o mesmo que o veredito aberto pela árvore", corte(v).length > 0 && corte(v) === corte(vArv));
  const ms = html(R.PainelTalentos, { personagem: thalia, leiaute: "mesa", vistaInicial: "ceu", inicial: "classe:Contramágica" });
  t("a estrela escolhida leva o anel de ouro e fica pressionada", /data-chave="classe:Contramágica" aria-label="[^"]+" aria-pressed="true"/.test(ms) && ms.includes(`r="${CONSTELACAO.escolhida.anel.mesa}" fill="none" stroke="${CONSTELACAO.escolhida.cor}"`));
  /* o braço de uma subclasse por escolher abre a escolha dela */
  const ilsa = { nome: "Ilsa", classe: "Clérigo", nivel: 4, habilidades: ["Cura Leve", "Luz Sagrada", "Bênção", "Escudo da Fé"].map((nome) => ({ nome })), subclasses: {} };
  const vSub = texto(html(R.PainelTalentos, { personagem: ilsa, leiaute: "mesa", vistaInicial: "ceu", inicial: "sub:Paladino:Golpe Consagrado" }));
  t("a estrela de um braço por escolher abre o veredito da subclasse («Seguir Paladino»)", vSub.includes("Seguir Paladino") && vSub.includes("para sempre"));
}

sec("5c. os nomes repetidos, a multiclasse e o estado sem pontos");
{
  /* ATÉ 07/11 o Arqueiro repetia «Tiro Duplo» da classe, e esta secção provava
     o defeito como verdade: com o Arqueiro escolhido, a ficha guarda só o nome
     e acendiam as duas. MUDOU COM O PEDIDO C1: a do braço passou a chamar-se
     «Flechas Gêmeas», e o nome antigo ficou na classe, onde o save já o lia.
     A asserção agora prova o conserto — o herói com «Tiro Duplo» acende só a
     da classe, e a do braço fica por comprar. */
  const semSub = { nome: "R", classe: "Caçador", nivel: 6, habilidades: [{ nome: "Tiro Duplo" }], subclasses: {} };
  const s1 = estrelasDo(html(R.PainelTalentos, { personagem: semSub, leiaute: "mesa", vistaInicial: "ceu" }));
  t("sem subclasse: a classe acende, o braço do Arqueiro não", /aprendida/.test((s1.find((e) => e.chave === "classe:Tiro Duplo") || {}).rotulo || "") && !/aprendida/.test((s1.find((e) => e.chave === "sub:Arqueiro:Flechas Gêmeas") || {}).rotulo || "x"));
  const comSub = { ...semSub, subclasses: { "Caçador": "Arqueiro" } };
  const s2 = estrelasDo(html(R.PainelTalentos, { personagem: comSub, leiaute: "mesa", vistaInicial: "ceu" }));
  t("com o Arqueiro: «Tiro Duplo» acende só a da classe (C1: o braço tem «Flechas Gêmeas», por comprar)",
    /aprendida/.test((s2.find((e) => e.chave === "classe:Tiro Duplo") || {}).rotulo || "")
    && !!s2.find((e) => e.chave === "sub:Arqueiro:Flechas Gêmeas")
    && !/aprendida/.test((s2.find((e) => e.chave === "sub:Arqueiro:Flechas Gêmeas") || {}).rotulo || "x")
    && !s2.some((e) => e.chave === "sub:Arqueiro:Tiro Duplo"));

  const multi = { ...thalia, habilidades: [...thalia.habilidades, { nome: "Ataque Furtivo" }, { nome: "Esquiva Ágil" }] };
  const sm = html(R.PainelTalentos, { personagem: multi, leiaute: "mesa", vistaInicial: "ceu" });
  t("a figura de trás é UM botão: «Trazer o Ladino para a frente — 2 de 24 acesas»", /<button type="button" aria-label="Trazer o Ladino para a frente — 2 de 24 acesas"/.test(sm));
  t("e as estrelas dela não são alvo (só as da frente)", estrelasDo(sm).length === 26 && !estrelasDo(sm).some((e) => e.chave.includes("Ataque Furtivo")));
  const M = R.medidasDoCeu("mesa", 0, 1);
  t("na mesa a de trás mora em (648, 160), lado 432", Math.round(M.atras[0].x) === 648 && Math.round(M.atras[0].y) === 160 && Math.round(M.atras[0].lado) === 432);
  const Mt = R.medidasDoCeu("telefone", 343, 1);
  t("no telefone, por baixo (y 1,06 do lado) a 0,72", Math.round(Mt.atras[0].y - Mt.y0) === Math.round(1.06 * 343) && Math.round(Mt.atras[0].lado) === Math.round(0.72 * 343));

  const pobre = { ...thalia, pontosHab: 0 };
  const sp = html(R.PainelTalentos, { personagem: pobre, leiaute: "mesa", vistaInicial: "ceu" });
  t("sem pontos: nenhum anel âmbar no céu", !sp.includes(`data-estrela="disponivel"`));
  t("e a linha diz quando chega o próximo: «Sem pontos por gastar — o próximo chega no nível 7»", texto(sp).includes("Sem pontos por gastar — o próximo chega no nível 7"));
  t("as estrelas continuam tocáveis (o veredito vem impedido)", estrelasDo(sp).length === 26 && texto(html(R.PainelTalentos, { personagem: pobre, leiaute: "mesa", vistaInicial: "ceu", inicial: "classe:Contramágica" })).includes("sem pontos"));
}

/* ============================================================ */
sec("6. a prateleira dos mantimentos");
{
  const dados = { racoes: faceDoDadoDeUso("racoes", { racoes: 3 }, 1), agua: faceDoDadoDeUso("agua", { agua: 9 }, 1), tochas: faceDoDadoDeUso("tochas", { tochas: 2 }) };
  const contagens = { racoes: 3, agua: 9, tochas: 2 };
  t("a face vem do sistema (faceDoDadoDeUso): d6, d10, d4", dados.racoes === 6 && dados.agua === 10 && dados.tochas === 4, JSON.stringify(dados));
  const s = html(R.PrateleiraDosMantimentos, { dados, contagens, aoAbrir: () => {} });
  t("é UM botão, com o nome inteiro: «Mantimentos: rações 3, dado de seis; água 9, dado de dez; tochas 2, dado de quatro, a acabar. Abrir na Bolsa.»",
    (s.match(/<button/g) || []).length === 1 && desfaz(s).includes(`aria-label="Mantimentos: rações 3, dado de seis; água 9, dado de dez; tochas 2, dado de quatro, a acabar. Abrir na Bolsa."`));
  t("cada dado diz a face que o sistema deu", /data-uso="racoes" data-face="6"/.test(s) && /data-uso="agua" data-face="10"/.test(s) && /data-uso="tochas" data-face="4"/.test(s));
  t("o desenho é o Corpo da Bandeja (o d10 com as facetas) no papel do osso", s.includes(`fill="${T[PAPEL_DO_DADO.uso.corpo]}"`) && s.includes("M4 21 L24 29 L44 21"));
  t("dentro, o glifo do mantimento (desenhado, nunca emoji)", s.includes(GLIFOS.racao.d) && s.includes(GLIFOS.agua.d) && s.includes(GLIFOS.tocha.d) && !/🥖|💧|🕯/.test(s));
  t("a contagem «×3», e na face d4 em danger", texto(s).includes("×3") && texto(s).includes("×9") && new RegExp(`color:${T.danger}"[^>]*>×(?:<!-- -->)?2<`).test(s));
  const vazio = html(R.PrateleiraDosMantimentos, { dados: { racoes: 4, agua: 4, tochas: null }, contagens: { racoes: 3, agua: 3, tochas: 0 } });
  t("vazio: o d4 tracejado em lineStrong, «tochas: nenhuma», «×0»", /data-uso="tochas" data-face="vazio"/.test(vazio) && vazio.includes(`stroke="${T.lineStrong}"`) && vazio.includes(`stroke-dasharray="${DADO_DE_USO_NA_MESA.vazio.tracejado.join(" ")}"`) && desfaz(vazio).includes("tochas: nenhuma") && texto(vazio).includes("×0"));
  t("o nome acessível sai de uma função só (nomeDaPrateleira)", R.nomeDaPrateleira(dados, contagens).startsWith("Mantimentos: rações 3"));
  t("lixo não parte a peça (faces fora da tabela contam como vazio)", /data-face="vazio"/.test(html(R.DadoDeUso, { tipo: "racoes", face: 7, n: "x" })));
  const tel = html(R.PrateleiraDosMantimentos, { dados, contagens, telefone: true });
  /* MOVIDA em 07/11 (TL 8): o telefone é a tira — 76 × 56, os três dados a 22 */
  t("no telefone: 76 × 56, os três numa fila de 22", tel.includes(`min-width:${DADO_DE_USO_NA_MESA.telefone.alvo.largura}px`) && tel.includes(`min-height:${DADO_DE_USO_NA_MESA.telefone.alvo.alto}px`) && (tel.match(new RegExp(`width="${DADO_DE_USO_NA_MESA.telefone.dado}"`, "g")) || []).length === 3);
  t("na mesa: 120 × 132", s.includes(`min-width:${DADO_DE_USO_NA_MESA.mesa.alvo.largura}px`) && s.includes(`min-height:${DADO_DE_USO_NA_MESA.mesa.alvo.alto}px`));

  t("os glifos novos: racao e agua na família de sempre", GLIFOS.racao && GLIFOS.agua && GLIFOS.racao.de === "casa" && /^M/.test(GLIFOS.agua.d));
  t("o mapa dos emojis: 🥖 → racao, 💧 → agua, 🕯 → tocha", ASSUNTO_DO_EMOJI["🥖"] === "racao" && ASSUNTO_DO_EMOJI["💧"] === "agua" && ASSUNTO_DO_EMOJI["🕯"] === "tocha");
  const falas = [...DADO_DE_USO.falas.racoes, ...DADO_DE_USO.falas.agua, ...DADO_DE_USO.falas.tochas, DADO_DE_USO.ultimaTocha];
  const semGlifo = falas.filter((f) => { const a = assuntoDaLinha(f); return !a || !a.glifo || /🥖|💧|🕯/.test(a.texto || ""); });
  t("as falas do dado de uso chegam à tela com o glifo, sem o emoji", semGlifo.length === 0, semGlifo.join(" | "));
}

/* ============================================================ */
sec("7. o fim do dia: o dado de uso rola na prateleira (294:4493)");
{
  const U = DADO_DE_USO_NA_MESA;
  /* o lance como o sistema o faz: rações num d6 deu 1 (encolhe), água num d8 deu 7 */
  const dia = naBandeja([], lancamentoDoDadoDeUso(DADO_DE_USO.rotulos.dia, [{ faces: 6, valor: 1, uso: "racoes" }, { faces: 8, valor: 7, uso: "agua" }], DADO_DE_USO.encolheEm + 1))[0];
  const tocha = naBandeja([], lancamentoDoDadoDeUso(DADO_DE_USO.rotulos.tocha, [{ faces: 6, valor: 4, uso: "tochas" }], DADO_DE_USO.encolheEm + 1))[0];
  const V = (l, ms, o) => R.vistaDoLanceDeUso(l, ms, o);
  const rolar = U.rolar.dura, pousou = U.rolar.dura + MOVIMENTO_DO_DADO.pousar;

  const a = V(dia, 10);
  t("rodam só os dados que vêm em «usos» (rações e água; as tochas ficam paradas)", a && Object.keys(a).join(",") === "racoes,agua");
  t("o lance da tocha rola só a tocha", Object.keys(V(tocha, 10) || {}).join(",") === "tochas");
  t("a água sai «entreDados» depois: aos 10 ms as rações rodam e a água ainda espera",
    a.racoes.rolando && !a.agua.rolando && a.agua.numero === null && V(dia, U.rolar.entreDados + 10).agua.rolando);
  const trocas = new Set(); for (let ms = 0; ms < rolar; ms += U.rolar.troca) trocas.add(V(dia, ms).racoes.numero);
  t("enquanto rola, o número troca (teatro) e fica dentro da face", trocas.size > 1 && [...trocas].every((n) => n >= 1 && n <= 6), [...trocas].join(","));
  const p = V(dia, rolar + 10);
  t("aos «rolar» ms pousa no número que o sistema rolou, com o ressalto do pouso", p.racoes.numero === 1 && !p.racoes.rolando && p.racoes.pousa && V(dia, rolar + U.rolar.entreDados + 10).agua.numero === 7);
  t("o selo «−1» só no 1: as rações levam-no, a água não", p.racoes.selo && !V(dia, rolar + U.rolar.entreDados + 10).agua.selo);
  t("o selo não aparece antes de pousar", !V(dia, rolar - 10).racoes.selo);
  t("a face do lance fica até pousar; depois, a face que o sistema der", !V(dia, pousou - 1).racoes.faceNova && V(dia, pousou + 1).racoes.faceNova);
  const ctx = { antes: { racoes: 5, agua: 9, tochas: 2 }, agora: { racoes: 3, agua: 8, tochas: 2 } };
  const seq = []; for (let ms = 0; ms <= pousou + U.encolher.dura + 60; ms += 20) seq.push(V(dia, ms, ctx).racoes.contagem);
  t("a contagem fica em ×5 até pousar e corre 5 → 4 → 3 enquanto a face desce",
    V(dia, pousou - 1, ctx).racoes.contagem === 5 && seq.includes(4) && V(dia, pousou + U.encolher.dura, ctx).racoes.contagem === 3 && seq.every((n, i) => i === 0 || n <= seq[i - 1]), seq.join(","));
  t("sem a contagem de antes, a peça não inventa: contagem null (fica a do sistema)", V(dia, 700).racoes.contagem === null);
  const fim = V(dia, U.rolar.entreDados + U.rolar.mostra);
  t("aos «mostra» ms o glifo volta: sem número, sem selo", fim.racoes.acabou && fim.agua.acabou && fim.racoes.numero === null && !fim.racoes.selo);

  const r0 = V(dia, 0, { reduzido: true, ...ctx });
  t("reduce: sem rodar — o número e o selo já pousados no instante zero", !r0.racoes.rolando && !r0.agua.rolando && r0.racoes.numero === 1 && r0.racoes.selo && r0.agua.numero === 7);
  const r1 = V(dia, U.reduzido, { reduzido: true, ...ctx });
  t("reduce: a face e a contagem trocam secas aos «reduzido» ms", !r0.racoes.faceNova && r0.racoes.contagem === 5 && r1.racoes.faceNova && r1.racoes.contagem === 3);

  t("o null: sem lance, lance de outro papel ou lixo, não há vista",
    V(null, 0) === null && V(undefined, 0) === null && V(lancamentoDoTeste({ valor: 12, dc: 10 }), 0) === null
    && V({ papel: "uso", dados: [{ faces: 7, valor: 9 }], usos: ["racoes"] }, 0) === null && V({ papel: "uso", dados: [{ faces: 6, valor: 2 }], usos: ["ouro"] }, 0) === null);

  t("o nome do lance: «Rações: 1, perdeu uma; água: 7»", R.nomeDoLanceDeUso(dia) === "Rações: 1, perdeu uma; água: 7", R.nomeDoLanceDeUso(dia));
  t("a tocha que pega: «Tochas: 4»; sem lance, nada", R.nomeDoLanceDeUso(tocha) === "Tochas: 4" && R.nomeDoLanceDeUso(null) === "");
  const dados = { racoes: 4, agua: 8, tochas: 4 }, contagens = { racoes: 3, agua: 8, tochas: 2 };
  const nome = R.nomeDaPrateleira(dados, contagens, dia);
  t("o lance entra no nome do botão, antes de «Abrir na Bolsa.»",
    nome === "Mantimentos: rações 3, dado de quatro, a acabar; água 8, dado de oito; tochas 2, dado de quatro, a acabar. Rações: 1, perdeu uma; água: 7. Abrir na Bolsa.", nome);
  t("o sistema não fala de si no nome (nem do papel do dado)", !/\bsistemas?\b|\bIA\b|\bNarrador|\bCronista\b|\btokens?\b|\bpela tabela\b|\bpapel\b|\buso\b/u.test(nome));
  t("sem lance, o nome de sempre (regressão zero)", R.nomeDaPrateleira(dados, contagens, null) === R.nomeDaPrateleira(dados, contagens));
  /* um anúncio só: quem anuncia o lance ao leitor de ecrã é a Bandeja (formas.md §AR 12) */
  const sl = html(R.PrateleiraDosMantimentos, { dados, contagens, lancamento: dia });
  t("a prateleira com lance: o nome no botão, e nenhum segundo aria-live (o anúncio é da Bandeja)", desfaz(sl).includes('aria-label="' + nome + '"') && !sl.includes("aria-live"));
  t("montar com um lance já rolado não o rola outra vez (a mesa puxada que se abre)", !sl.includes("data-lance") && !sl.includes("data-menos-um"));

  const rola = html(R.DadoDeUso, { tipo: "racoes", face: 6, n: 5, lance: { numero: 3, rolando: true } });
  t("o dado que rola: o Corpo rodado −18° com o número no lugar do glifo", rola.includes("rotate(-18deg)") && rola.includes('data-lance="rola"') && />3<\/text>/.test(rola) && !rola.includes(GLIFOS.racao.d));
  const selo = html(R.DadoDeUso, { tipo: "racoes", face: 6, n: 5, lance: { numero: 1, pousa: true, selo: true } });
  t("o dado que pousou no 1: o número, o ressalto do pouso e o selo «−1» (disco danger de 18, letra onAccent)",
    />1<\/text>/.test(selo) && selo.includes("tv-dado-pousa") && selo.includes("data-menos-um") && selo.includes('fill="' + U.selo.chao + '"')
    && selo.includes('fill="' + U.selo.letra + '"') && selo.includes('width="' + U.selo.lado + '"') && selo.includes(U.selo.texto));
  const sete = html(R.DadoDeUso, { tipo: "agua", face: 8, n: 9, lance: { numero: 7 } });
  t("o 7 da água: número sem selo", />7<\/text>/.test(sete) && !sete.includes("data-menos-um"));
  const vz = html(R.DadoDeUso, { tipo: "racoes", face: null, n: 0, lance: { numero: 1, selo: true } });
  t("se a face acabou (vazio), o contorno fica com o glifo e o selo — sem número", vz.includes('data-face="vazio"') && vz.includes(GLIFOS.racao.d) && vz.includes("data-menos-um") && !/>1<\/text>/.test(vz));
  const foraDoReduce = FOLHA.split("@media (prefers-reduced-motion: reduce)")[0];
  t("o selo e o pouso usam as classes da Bandeja: duração no CSS e saída no reduce",
    /\.tv-dado-veredito \{[^}]*animation: \w+ \d+ms/.test(foraDoReduce) && /\.tv-dado-pousa \{[^}]*animation: \w+ \d+ms/.test(foraDoReduce)
    && /\.tv-dado-veredito \{ animation: none/.test(FOLHA) && /\.tv-dado-rola, \.tv-dado-pousa \{ animation: none/.test(FOLHA));
}

console.log(`\nconstelacao: ${ok} passaram, ${mal} falharam`);
if (mal) process.exit(1);
