/* teste-talentos-ar.mjs (AR4, 06/11/2026) — os Talentos como árvore
   (formas.md §AR 3, §AR 5, §AR 6, §AR 7; Figma 276:685, 278:1047, 278:1537,
   280:1556, 280:1858).

   Prova:
   1. as tabelas dos Talentos estão em estilo.js com a forma de §AR 6, e as
      cores delas só nomeiam T ou a própria família de metais;
   2. os pares de letra (e de forma) passam o piso medido em §AR 5;
   3. a cerimónia tem a duração no CSS e `animation: none` no bloco reduce;
   4. o painel, renderizado de verdade: cada nó sai do estado das regras
      (aprendido ✓, disponível com o custo, bloqueado com o cadeado), as
      ligações só acendem entre dois aprendidos, as duas especializações
      estão à vista antes de se escolher, e o veredito diz o custo ANTES do
      toque (e o porquê, quando não se pode);
   5. o grimório: um círculo por linha, a diferença entre aprender e preparar.

   O JSX não corre em Node: empacota-se um ponto de entrada com o esbuild (o
   mesmo de teste-ar-pecas) e lê-se o HTML de renderToStaticMarkup. */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { buildSync } from "esbuild";
import {
  T, TIPOS, FOLHA, MOLDURA_POR_DEGRAU, GEMA_DA_SUBCLASSE, ICONES_DA_INTERFACE,
  NO_DE_TALENTO, LIGACAO, ARVORE_DE_TALENTOS, SELO_DE_PONTOS, CERIMONIA_DE_APRENDER,
} from "../src/estilo.js";
import { arvoreDaClasse, arvoreDaSubclasse, pontosDisponiveis, custoRespec, especializacoesDaSubclasse, habilidadesDaEspecializacao } from "../src/classes.js";
import { grimorioDaClasse } from "../src/magias.js";
import { razao, rgb } from "./conta-da-luz.mjs";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? "\n      " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const AQUI = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(AQUI, "..", "src");
const OURO = MOLDURA_POR_DEGRAU.ouro;

/* ============================================================ */
sec("1. as tabelas de §AR 6");
{
  t("o nó: alvo 64, as quatro formas do ramo", NO_DE_TALENTO.lado === 64 && ["classe", "subclasse", "especializacao", "magia"].every((r) => NO_DE_TALENTO.formas[r]));
  t("a forma diz o ramo: quadrado de raio 14, losango, escudo, círculo",
    NO_DE_TALENTO.formas.classe.rx === 14 && NO_DE_TALENTO.formas.subclasse.el === "path" && NO_DE_TALENTO.formas.magia.el === "circle");
  t("a insígnia diz o estado: ✓, o custo, o cadeado",
    NO_DE_TALENTO.estados.aprendido.insignia === "visto" && NO_DE_TALENTO.estados.disponivel.insignia === "custo" && NO_DE_TALENTO.estados.bloqueado.insignia === "cadeado");
  t("o custo da insígnia NÃO é Cinzel (o 1 lê-se I), nem o selo de pontos",
    NO_DE_TALENTO.insignia.custo.fonte !== "Cinzel" && SELO_DE_PONTOS.numero.fonte !== "Cinzel");
  t("os degraus: 1–10, 12, 14; a subclasse nasce no 3, a especialização no 10",
    ARVORE_DE_TALENTOS.colunas.join(",") === "1,2,3,4,5,6,7,8,9,10,12,14" && ARVORE_DE_TALENTOS.nascente.subclasse === 3 && ARVORE_DE_TALENTOS.nascente.especializacao === 10);
  t("o passo: 78 na mesa, 88 a 1280; a gaveta do telefone a 124", ARVORE_DE_TALENTOS.mesa.passo === 78 && ARVORE_DE_TALENTOS.meia.passo === 88 && ARVORE_DE_TALENTOS.telefone.passoVertical === 124);
  t("o halo do disponível é parado (sem tempo na tabela)", !("dura" in NO_DE_TALENTO.estados.disponivel.halo));
  const C = CERIMONIA_DE_APRENDER;
  t("a cerimónia cabe no total: 0–240 o selo, 240–620 o fio, 620–900 a frase",
    C.selo.de + C.selo.dura === C.fio.de && C.fio.de + C.fio.dura === C.frase.de && C.frase.de + C.frase.dura === C.total);
  t("o toque da cerimónia é o de todo encaixe (0,96 / 80 ms)", C.toque.escala === NO_DE_TALENTO.pressionado.escala && C.toque.dura === NO_DE_TALENTO.pressionado.dura);

  /* as tabelas só nomeiam T ou a própria família de metais */
  const permitidas = new Set([...Object.values(T), ...Object.values(MOLDURA_POR_DEGRAU).flatMap((m) => Object.values(m)).filter((x) => typeof x === "string")]);
  const SENTINELAS = new Set(["gema", "luz", "visto", "custo", "cadeado", "rect", "path", "circle", "JetBrains Mono", "Spectral"]);
  const soltas = [];
  const varrer = (o, onde) => {
    for (const [k, x] of Object.entries(o)) {
      if (typeof x === "string" && !SENTINELAS.has(x) && k !== "d" && !permitidas.has(x)) soltas.push(`${onde}.${k}=${x}`);
      else if (x && typeof x === "object" && !Array.isArray(x)) varrer(x, `${onde}.${k}`);
    }
  };
  varrer(NO_DE_TALENTO, "NO_DE_TALENTO"); varrer(LIGACAO, "LIGACAO"); varrer(SELO_DE_PONTOS, "SELO_DE_PONTOS");
  t("toda cor das tabelas dos Talentos é de T ou dos metais", soltas.length === 0, soltas.join(", "));
  const EST = fs.readFileSync(path.join(SRC, "estilo.js"), "utf8");
  const bloco = EST.slice(EST.indexOf("/* OS TALENTOS, A ÁRVORE"), EST.indexOf("export const FOLHA_DO_MESTRE"));
  t("o bloco dos Talentos em estilo.js não tem hex solto", bloco.length > 0 && !/#[0-9a-fA-F]{3,8}\b/.test(bloco.replace(/\/\*[\s\S]*?\*\//g, "")));
  const RX_HEX = /#[0-9a-fA-F]{3,8}\b|rgba?\(/;
  for (const a of ["painel-talentos.jsx", "painel-ar-pecas.jsx"]) {
    const txt = fs.readFileSync(path.join(SRC, a), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    const m = txt.match(RX_HEX);
    t(`${a}: nenhuma cor solta`, !m, m ? `achou ${m[0]}` : "");
  }
}

/* ============================================================ */
sec("2. o contraste de §AR 5");
{
  const LETRA = [
    ["veredito ouroClaro / panelSoft", OURO.claro, T.panelSoft],
    ["veredito inkMeio / panelSoft", T.inkMeio, T.panelSoft],
    ["veredito inkDim / panelSoft", T.inkDim, T.panelSoft],
    ["▼ piora danger / panelSoft", T.danger, T.panelSoft],
    ["▲ melhora ok / panelSoft", T.ok, T.panelSoft],
    ["verbo armado e insígnia do custo onAccent / amber", T.onAccent, T.amber],
    ["nome do nó escolhido ouroClaro / panel", OURO.claro, T.panel],
    ["nome do nó ink / panel", T.ink, T.panel],
    ["nome do nó bloqueado inkDim / panel", T.inkDim, T.panel],
    ["título da tela ouroClaro / couroBaixo", OURO.claro, T.couroBaixo],
    ["degrau andado amberSoft / panel", T.amberSoft, T.panel],
    ["círculo violetSoft / panel", T.violetSoft, T.panel],
  ];
  for (const [n, fg, bg] of LETRA) { const r = razao(rgb(fg), rgb(bg)); t(`${n}: ${r.toFixed(2)} ≥ 4,5`, r >= 4.5); }
  const FORMA = [
    ["aro ouro / panel", OURO.meio, T.panel],
    ["aro âmbar / panel", T.amber, T.panel],
    ["aro bloqueado lineStrong / panel", T.lineStrong, T.panel],
    ["aro gema Elementalista / panel", GEMA_DA_SUBCLASSE.Elementalista.corpo, T.panel],
    ["aro prata / panel", MOLDURA_POR_DEGRAU.prata.meio, T.panel],
    ["aro violeta / panel", T.violet, T.panel],
    ["insígnia ✓ ok / okFundo", T.ok, T.okFundo],
    ["ligação acesa / panel", LIGACAO.acesa.cor, T.panel],
  ];
  for (const [n, fg, bg] of FORMA) { const r = razao(rgb(fg), rgb(bg)); t(`(forma) ${n}: ${r.toFixed(2)} ≥ 3`, r >= 3); }
}

/* ============================================================ */
sec("3. a cerimónia: o tempo no CSS, e parada no reduce");
{
  const classes = ["tv-aprender-selo", "tv-aprender-insignia", "tv-aprender-menos", "tv-aprender-fio", "tv-aprender-pontos", "tv-aprender-frase"];
  const fora = FOLHA.split("@media (prefers-reduced-motion: reduce)")[0];
  t("cada quadro da cerimónia tem a duração no CSS", classes.every((c) => new RegExp(`\\.${c} \\{[^}]*animation: \\w+ \\d+ms`).test(fora)));
  t("o fio desenha-se da esquerda", /\.tv-aprender-fio \{[^}]*transform-origin: left center/.test(fora));
  const reduce = FOLHA.split("@media (prefers-reduced-motion: reduce)").slice(1).find((b) => b.includes("tv-aprender-selo")) || "";
  const parado = reduce.match(/([^{}]*tv-aprender-selo[^{}]*)\{ animation: none; \}/);
  t("no reduce, todos os quadros param (animation: none)", !!parado && classes.filter((c) => c !== "tv-aprender-menos").every((c) => parado[1].includes(c)) && /\.tv-aprender-menos \{ animation: none; opacity: 0; \}/.test(reduce));
  t("no reduce, o nó esvanece em 160 ms", new RegExp(`\\.tv-aprender-reduzida \\{ animation: tvCerimoniaEsvai ${CERIMONIA_DE_APRENDER.reduzido.dura}ms`).test(reduce));
}

/* ============================================================
   4 e 5 · O QUE SE VÊ */
const ENTRADA = `
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NoDeTalento, Ligacao, SeloDePontos, LinhaDaComparacao } from "./painel-ar-pecas.jsx";
import { PainelTalentos } from "./painel-talentos.jsx";
export const html = (el) => renderToStaticMarkup(el);
export { React, NoDeTalento, Ligacao, SeloDePontos, LinhaDaComparacao, PainelTalentos };
`;
const saida = path.join(AQUI, `.tmp-talentos-ar-${process.pid}.mjs`);
buildSync({
  stdin: { contents: ENTRADA, resolveDir: SRC, loader: "jsx", sourcefile: "entrada-talentos.jsx" },
  bundle: true, format: "esm", platform: "node", outfile: saida, jsx: "transform", logLevel: "silent", external: ["react", "react-dom", "react-dom/server"],
  loader: { ".js": "jsx" }, define: { "process.env.NODE_ENV": '"production"' },
});
const R = await import(pathToFileURL(saida).href);
fs.rmSync(saida, { force: true });
const h = R.React.createElement;
const html = (c, p) => R.html(h(c, p));
const texto = (s) => s.replace(/<[^>]+>/g, " ").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/\s+/g, " ");

sec("4a. as peças");
{
  const disp = html(R.NoDeTalento, { ramo: "classe", estado: "disponivel", nome: "Contramágica", custo: 2, glifo: "defesa" });
  t("o disponível leva o custo na insígnia", />2<\/text>/.test(disp) && /aria-label="Contramágica"/.test(disp));
  t("o aprendido leva o ✓", html(R.NoDeTalento, { ramo: "classe", estado: "aprendido", nome: "x" }).includes(`d="${ICONES_DA_INTERFACE.visto[0]}"`));
  const bloq = html(R.NoDeTalento, { ramo: "magia", estado: "bloqueado", nome: "x" });
  t("o bloqueado leva o cadeado e continua tocável (é botão, sem disabled)", bloq.includes(`d="${ICONES_DA_INTERFACE.cadeado[0]}"`) && /^<button/.test(bloq) && !/disabled/.test(bloq));
  t("a forma diz o ramo: o losango da subclasse", html(R.NoDeTalento, { ramo: "subclasse", estado: "bloqueado" }).includes(NO_DE_TALENTO.formas.subclasse.d));
  t("o escolhido leva o anel por fora", (html(R.NoDeTalento, { ramo: "classe", estado: "disponivel", escolhido: true }).match(/<rect /g) || []).length === 2);
  t("o estático não é alvo", /^<span aria-hidden="true"/.test(html(R.NoDeTalento, { estatico: true })));
  t("a ligação acesa é ouro; a apagada, lineStrong a 0,55",
    html(R.Ligacao, { x1: 0, y1: 0, x2: 1, y2: 0, acesa: true }).includes(`stroke="${LIGACAO.acesa.cor}"`) && html(R.Ligacao, { x1: 0, y1: 0, x2: 1, y2: 0 }).includes(`opacity="${LIGACAO.apagada.alfa}"`));
  t("o selo diz os pontos por extenso", /aria-label="3 pontos de talento por gastar"/.test(html(R.SeloDePontos, { pontos: 3 })));
  t("a linha da comparação: antes → depois e o sinal", texto(html(R.LinhaDaComparacao, { rotulo: "Habilidades de Mago", antes: 7, depois: 8, sinal: "melhora" })).includes("7 → 8 ▲"));
}

/* a Thalia: Maga Elementalista, nível 6, com cinco aprendidas */
const APRENDIDAS = ["Projétil Arcano", "Escudo Arcano", "Rajada de Fogo", "Ler Auras", "Manto Flamejante"];
const thalia = { nome: "Thalia", classe: "Mago", subclasse: "Elementalista", nivel: 6, moedas: 120, habilidades: APRENDIDAS.map((nome) => ({ nome })) };
const pontos = pontosDisponiveis(thalia);
const daClasse = arvoreDaClasse(thalia, "Mago");
const daSub = arvoreDaSubclasse(thalia, "Mago");
const ESTADO = (x) => (x.dominada ? "aprendido" : x.pode ? "disponivel" : "bloqueado");
const nosDo = (s) => [...s.matchAll(/aria-label="([^"]+?) — [^"]*" data-estado="(\w+)" data-ramo="(\w+)"/g)].map((m) => ({ nome: m[1].replace(/&#x27;/g, "'"), estado: m[2], ramo: m[3] }));

sec("4b. a árvore: os nós saem das regras");
{
  const mesa = html(R.PainelTalentos, { personagem: thalia, leiaute: "mesa" });
  const nos = nosDo(mesa);
  const erradas = [...daClasse, ...daSub].filter((x) => !nos.some((n) => n.nome === x.nome && n.estado === ESTADO(x)));
  t("cada habilidade da classe e da subclasse tem o seu nó, no estado das regras", erradas.length === 0 && daClasse.length + daSub.length > 0, erradas.map((x) => x.nome).join(", "));
  t("há dos três estados na prova", ["aprendido", "disponivel", "bloqueado"].every((e) => nos.some((n) => n.estado === e)));
  const pedacos = mesa.split("<button").slice(1);
  const doNo = (nome) => pedacos.find((p) => p.includes(`aria-label="${nome} — `)) || "";
  const umDisp = daClasse.find((x) => x.pode);
  t("o disponível diz o custo das regras no próprio nó", umDisp && doNo(umDisp.nome).includes(`>${umDisp.custoPontos}</text>`));
  const umBloq = daClasse.find((x) => !x.pode && !x.dominada);
  t("o bloqueado tem o cadeado", umBloq && doNo(umBloq.nome).includes(`d="${ICONES_DA_INTERFACE.cadeado[0]}"`));
  t("a subclasse desenha-se em losango", nos.filter((n) => n.ramo === "subclasse").length === daSub.length);
  /* as ligações: vizinhos da mesma linha, pelo degrau; e o fio que desce do 3 */
  const linhas = {};
  const porDeg = {};
  for (const x of daClasse) { const d = x.nivel || 1; porDeg[d] = (porDeg[d] || 0) + 1; (linhas["c" + (porDeg[d] - 1)] = linhas["c" + (porDeg[d] - 1)] || []).push(x); }
  linhas.s = [...daSub];
  let esperadas = 0, todas = 0;
  for (const l of Object.values(linhas)) { l.sort((a, b) => a.nivel - b.nivel); for (let i = 1; i < l.length; i++) { todas++; if (l[i - 1].dominada && l[i].dominada) esperadas++; } }
  const no3 = linhas.c0.find((x) => x.nivel === 3);
  /* o fio desce na mesma coluna: a subclasse nasce no degrau 3 */
  if (no3 && daSub[0]) { todas++; if (no3.dominada && daSub[0].dominada) esperadas += 1; }
  const acesas = (mesa.match(/data-acesa="sim"/g) || []).length;
  t(`as ligações acendem só entre dois aprendidos (${acesas} acesas)`, acesas === esperadas && esperadas > 0, `esperadas ${esperadas}`);
  const nenhum = html(R.PainelTalentos, { personagem: { ...thalia, habilidades: [] }, leiaute: "mesa" });
  t("sem nada aprendido, nenhuma ligação acende", !/data-acesa="sim"/.test(nenhum) && /data-acesa="nao"/.test(nenhum));
  const tm = texto(mesa);
  const esps = especializacoesDaSubclasse("Elementalista");
  t("as duas especializações à vista antes de escolher, com os talentos delas",
    esps.length === 2 && esps.every((e) => tm.includes(e) && habilidadesDaEspecializacao(e).every((x) => tm.includes(x.nome))));
  t("e fechadas, com o porquê guardado para o veredito", nos.filter((n) => n.ramo === "especializacao").every((n) => n.estado === "bloqueado"));
  t("o selo de pontos diz os pontos das regras", mesa.includes(`aria-label="${pontos} pontos de talento por gastar"`));
  t("o subtítulo diz quem, a classe e o nível", tm.includes("Thalia · Mago Elementalista · nível 6"));
  t("sem nada escolhido, o veredito convida", tm.includes("Toca num talento para ver o que custa"));
  t("a meia e o telefone também se desenham", nosDo(html(R.PainelTalentos, { personagem: thalia, leiaute: "meia" })).length === nos.length
    && nosDo(html(R.PainelTalentos, { personagem: thalia, leiaute: "telefone" })).length === nos.length);
}

sec("4c. o veredito antes do clique");
{
  const disp = daClasse.find((x) => x.pode);
  const v = texto(html(R.PainelTalentos, { personagem: thalia, leiaute: "mesa", inicial: disp.nome }));
  t("diz o nome, a classe, o degrau e o tipo", v.includes(`Mago · degrau ${disp.nivel} · ${disp.tipo}`));
  t(`diz os pontos antes e depois (${pontos} → ${pontos - disp.custoPontos})`, v.includes(`Pontos por gastar ${pontos} → ${pontos - disp.custoPontos}`));
  t("o verbo diz o preço e o que sobra", v.includes(`Aprender ${disp.nome}`) && v.includes(`${disp.custoPontos} ponto${disp.custoPontos > 1 ? "s" : ""} · ficas com ${pontos - disp.custoPontos}`));
  /* na prosa o ◉ é o Glifo da moeda (check-formas D5h.2): o texto dá o número, o nome acessível dá «moedas» */
  t(`e o que não se desfaz (◉ ${custoRespec(6)})`, v.includes(`Só sai se recomeçares do zero ( ${custoRespec(6)})`) && /aria-label="moedas"/.test(html(R.PainelTalentos, { personagem: thalia, leiaute: "mesa", inicial: disp.nome })));
  const bloq = daClasse.find((x) => !x.pode && !x.dominada && x.motivo);
  const vb = html(R.PainelTalentos, { personagem: thalia, leiaute: "mesa", inicial: bloq.nome });
  t("bloqueado: o verbo impedido, com a razão das regras", /aria-disabled="true"/.test(vb) && texto(vb).includes(bloq.motivo));
  const esp = especializacoesDaSubclasse("Elementalista")[0];
  const ve = texto(html(R.PainelTalentos, { personagem: thalia, leiaute: "mesa", inicial: esp }));
  t("a especialização: o que ganhas, o que fica fechada, e para sempre", ve.includes(`Seguir ${esp}`) && ve.includes("Fica fechada") && ve.includes("para sempre"));
  const semSub = { ...thalia, subclasse: undefined, habilidades: [{ nome: "Projétil Arcano" }] };
  const vs = html(R.PainelTalentos, { personagem: semSub, leiaute: "mesa", inicial: "Necromante" });
  t("sem subclasse: os caminhos são nós, e o veredito diz porquê ainda não", texto(vs).includes("Seguir Necromante") && /aria-disabled="true"/.test(vs) && texto(vs).includes("exige 3 degraus"));
  const vr = texto(html(R.PainelTalentos, { personagem: thalia, leiaute: "mesa", inicial: "respec" }));
  t("recomeçar: o preço e o que se perde, antes", vr.includes("Recomeçar do zero") && vr.includes("Habilidades de classe 5 → 0") && vr.includes("faltam"));
  t("o sistema não fala de si", !/subclasse_|pontosHab|podePegar|undefined|NaN/.test(v + ve + vr));
}

sec("5. o grimório");
{
  const grim = grimorioDaClasse(thalia, "Mago");
  const g = html(R.PainelTalentos, { personagem: thalia, leiaute: "mesa", abaInicial: "grimorio" });
  const tg = texto(g);
  t("a aba do Grimório existe para o Mago", /aria-selected="true"[^>]*><span>Grimório/.test(g));
  t("uma linha por círculo", grim.circulos.every((c) => tg.includes(`Círculo ${c.circulo}`)));
  const nos = nosDo(g);
  const magias = grim.circulos.flatMap((c) => c.magias);
  t("cada magia é um círculo, no estado do grimório", magias.every((m) => nos.some((n) => n.nome === m.nome && n.ramo === "magia")));
  if (grim.naCabeca) t("diz o que está na cabeça hoje", tg.includes(`Na cabeça hoje: ${grim.naCabeca.preparadas} de ${grim.naCabeca.limite}`));
  const disp = magias.find((m) => m.estado === "disponivel");
  if (disp) {
    const vm = texto(html(R.PainelTalentos, { personagem: thalia, leiaute: "mesa", abaInicial: "grimorio", inicial: disp.nome }));
    t("o veredito da magia: o círculo, o custo de uso e a diferença entre aprender e preparar",
      vm.includes(`Círculo ${disp.circulo}`) && vm.includes(`${disp.custoPM} PM`) && (!grim.naCabeca || vm.includes("Aprender não é preparar")));
  }
  t("o guerreiro não tem grimório", !/Grimório/.test(html(R.PainelTalentos, { personagem: { nome: "B", classe: "Guerreiro", nivel: 3, habilidades: [] }, leiaute: "mesa" })));
}

console.log(`\ntalentos-ar: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
