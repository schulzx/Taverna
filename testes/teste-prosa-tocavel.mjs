/* teste-prosa-tocavel.mjs (TP, 09/11/2026) — os nomes da prosa são as fichas
   (mente/formas.md §TP; Figma 327:2, o `Nome tocável` 327:24).

   A pessoa aprovou a TL 10: o nome que o Mestre escreveu É a ficha — o 1.º
   toque aponta, o 2.º abre o cartão, o 3.º fecha, a máquina da fileira. O
   motor marca (`marcasDaProsa`); esta suíte prova a parte do `aprendiz`
   (TP 10), que só embrulha o trecho que ele devolveu:

   1. as tabelas da TP 8 (o token, PROSA_TOCAVEL) e a folha `.tv-nome-tocavel`
      com os estados, o foco, o alto contraste e a saída no reduce;
   2. os pares de contraste da TP 2, medidos;
   3. a catraca EM_CENA.fora === MARCAS_NA_PROSA.fora (a lista do motor);
   4. a fatia pura (`fatiarPelasMarcas`): a 1.ª menção, a fronteira Unicode;
   5. o que se vê, renderizado: os estados do nome, o teto na prosa, o Tab
      pela ordem da leitura, a máquina de três toques, os rótulos (o nome é a
      palavra, a linha vai por aria-describedby), as respostas antigas sem
      marcas, a prosa sem marcas igual à de antes;
   6. o Esc a devolver o foco e o toque fora (as mãos do cartão, com um
      documento de mentira);
   7. o `EmCena` sem os nomeados, e o disco «N» com todos nomeados;
   8. onde pousa o cartão: nunca sobre a linha do nome nem sobre o campo.

   O JSX não corre em Node: empacota-se um ponto de entrada com o esbuild e
   lê-se o HTML de renderToStaticMarkup, como a teste-tela-limpa. */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { buildSync } from "esbuild";
import { T, PROSA_TOCAVEL, EM_CENA, FICHAS, ALVOS, HUD_DA_MESA, SUPERFICIES_CSS } from "../src/estilo.js";
import { razao as razaoRgb, rgb } from "./conta-da-luz.mjs";
const razao = (a, b) => razaoRgb(rgb(a), rgb(b));

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? "\n      " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const AQUI = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(AQUI, "..", "src");
const f2 = (x) => x.toFixed(2);

/* ============================================================ */
sec("1. as tabelas da TP 8 e a folha");
{
  t("o token: marcaNoPergaminho = #DFBCAC (Figma VariableID:327:3)", T.marcaNoPergaminho === "#DFBCAC");
  const S = PROSA_TOCAVEL.sublinhado;
  t("só a resposta de agora", PROSA_TOCAVEL.so === "agora");
  t("o sublinhado: 1,5 a 4 da linha, pontilhado; 2 na cerimónia; o hostil tracejado",
    S.espessura === 1.5 && S.afastado === 4 && S.estilo === "dotted" && S.cerimonia === 2 && S.estiloHostil === "dashed");
  t("as cores do sublinhado: brasa e perigo do pergaminho", S.cor === T.brasaNoPergaminho && S.corHostil === T.perigoNoPergaminho);
  t("apontado: o chão marcaNoPergaminho, o sublinhado lacre a 2",
    PROSA_TOCAVEL.apontado.chao === T.marcaNoPergaminho && PROSA_TOCAVEL.apontado.sublinhado === T.lacreNoPergaminho && PROSA_TOCAVEL.apontado.espessura === 2);
  t("aberto: o chão lacre, a letra pergaminho", PROSA_TOCAVEL.aberto.chao === T.lacreNoPergaminho && PROSA_TOCAVEL.aberto.letra === T.pergaminho);
  t("o chão sangra 2 com raio 3; o toque alarga 4 de cada lado; 120 ms",
    PROSA_TOCAVEL.sangra === 2 && PROSA_TOCAVEL.raio === 3 && PROSA_TOCAVEL.alvo.lado === 4 && PROSA_TOCAVEL.dura === 120);
  t("o cartão: a 8 da linha na mesa, o nome 16 acima da folha no telefone",
    PROSA_TOCAVEL.cartao.folgaDaLinha === 8 && PROSA_TOCAVEL.cartao.acimaDaFolha === 16);
  const cores = new Set(Object.values(T));
  const deCor = [S.cor, S.corHostil, PROSA_TOCAVEL.apontado.chao, PROSA_TOCAVEL.apontado.sublinhado, PROSA_TOCAVEL.aberto.chao, PROSA_TOCAVEL.aberto.letra];
  t("toda cor de PROSA_TOCAVEL é uma cor de T", deCor.every((c) => cores.has(c)));

  const css = SUPERFICIES_CSS;
  const regra = (sel) => { const i = css.indexOf(sel + " {"); return i < 0 ? "" : css.slice(i, css.indexOf("}", i) + 1); };
  const base = regra(".tv-nome-tocavel");
  t("a peça: herda a letra e a cor, sem caixa, nowrap, raio 3, o pontilhado brasa 1,5 a 4",
    base.includes("font: inherit") && base.includes("color: inherit") && base.includes("border: 0") && base.includes("padding: 0")
    && base.includes("white-space: nowrap") && base.includes("border-radius: 3px") && base.includes("text-decoration-style: dotted")
    && base.includes(`text-decoration-color: ${T.brasaNoPergaminho}`) && base.includes("text-decoration-thickness: 1.5px") && base.includes("text-underline-offset: 4px"));
  t("a troca de estado em 120 ms (o chão, a sombra, o sublinhado)", /transition: background-color 120ms ease-out, box-shadow 120ms ease-out, text-decoration-color 120ms ease-out/.test(base));
  t("o ::after alarga o toque 4 para cada lado", regra(".tv-nome-tocavel::after").includes("left: -4px; right: -4px"));
  t("hostil: tracejado em perigo (a forma muda, não só a cor)",
    regra('.tv-nome-tocavel[data-tom="hostil"]').includes("text-decoration-style: dashed") && regra('.tv-nome-tocavel[data-tom="hostil"]').includes(T.perigoNoPergaminho));
  t("sobre: contínuo, só com ponteiro fino", css.includes("@media (hover: hover) and (pointer: fine) { .tv-nome-tocavel:hover { text-decoration-style: solid; } }"));
  t("foco: contínuo", regra(".tv-nome-tocavel:focus-visible").includes("text-decoration-style: solid"));
  const ap = regra('.tv-nome-tocavel[data-estado="apontado"]');
  t("apontado: o chão marca, que SANGRA 2 por box-shadow (a linha não mexe), o sublinhado lacre a 2",
    ap.includes(`background: ${T.marcaNoPergaminho}`) && ap.includes(`box-shadow: 0 0 0 2px ${T.marcaNoPergaminho}`) && !/padding/.test(ap)
    && ap.includes("text-decoration-thickness: 2px") && ap.includes(`text-decoration-color: ${T.lacreNoPergaminho}`));
  t("apontado hostil: o sublinhado em perigo", regra('.tv-nome-tocavel[data-estado="apontado"][data-tom="hostil"]').includes(T.perigoNoPergaminho));
  const ab = regra('.tv-nome-tocavel[data-estado="aberto"]');
  t("aberto: o chão lacre a sangrar 2, a letra pergaminho, sem sublinhado",
    ab.includes(`background: ${T.lacreNoPergaminho}`) && ab.includes(`box-shadow: 0 0 0 2px ${T.lacreNoPergaminho}`) && ab.includes(`color: ${T.pergaminho}`) && ab.includes("text-decoration-line: none"));
  t("a cerimónia engrossa o sublinhado a 2", css.includes('[data-abertura="cerimonia"] .tv-nome-tocavel { text-decoration-thickness: 2px; }'));
  /* a lei do anel (estilo.js, a peça do anel): no papel o anel que se lê é o
     de bg; a sombra do chão não o pode apagar — a regra é mais específica */
  t("o anel ganha ao chão: com foco, a sombra é a de bg, seja qual for o estado",
    css.includes(`.tv-nome-tocavel.tv-anel-foco:focus-visible { box-shadow: 0 0 0 2px ${T.bg}; }`));
  t("reduced motion: seco", /@media \(prefers-reduced-motion: reduce\) \{ \.tv-nome-tocavel \{ transition: none; animation: none; \} \}/.test(css));
  const fc = css.slice(css.lastIndexOf("@media (forced-colors: active) {\n  .tv-nome-tocavel"));
  t("alto contraste: LinkText; apontado e aberto em Highlight / HighlightText",
    fc.includes("color: LinkText; text-decoration-color: LinkText") && fc.includes("background: Highlight; color: HighlightText"));
}

/* ============================================================ */
sec("2. os pares de contraste da TP 2 (WCAG 2.2, sobre o pergaminho)");
{
  const pares = [
    ["repouso · a letra (a da prosa)", T.tintaDoPergaminho, T.pergaminho, 12.15, 4.5],
    ["repouso · o sublinhado brasa (forma, 1.4.11)", T.brasaNoPergaminho, T.pergaminho, 6.71, 3],
    ["hostil · o tracejado perigo", T.perigoNoPergaminho, T.pergaminho, 6.60, 3],
    /* a secção diz 13,50 para o anel; esse número é o do pergaminho contra a
       madeira (o comentário de T.pergaminho). O anel da casa é T.bg, o feltro
       (#12241B), e mede 11,95 — folgado acima do piso de 3. Prende-se o
       medido, e a diferença vai escrita ao desenho. */
    ["foco · o anel de bg no papel", T.bg, T.pergaminho, 11.95, 3],
    ["apontado · a letra sobre a marca", T.tintaDoPergaminho, T.marcaNoPergaminho, 9.37, 4.5],
    ["apontado · o sublinhado lacre sobre a marca", T.lacreNoPergaminho, T.marcaNoPergaminho, 5.22, 3],
    ["aberto · a letra pergaminho sobre o lacre", T.pergaminho, T.lacreNoPergaminho, 6.77, 4.5],
  ];
  for (const [nome, a, b, diz, piso] of pares) {
    const r = razao(a, b);
    t(`${nome}: ${f2(r)} (a secção diz ${f2(diz)}; piso ${piso})`, r >= piso && Math.abs(r - diz) < 0.02);
  }
  t("o contorno ink do anel no papel não conta (1,11): é o bg que se lê", razao(T.ink, T.pergaminho) < 1.5);
}

/* ============================================================ */
sec("3. a catraca: a lista do que fica de fora é a mesma na tela e no motor");
{
  /* MARCAS_NA_PROSA nasce no motor (o pedido TP-1, outra mão); procura-se
     onde estiver. Enquanto não existir, prende-se o valor da secção (TP 9). */
  const fontes = [...fs.readdirSync(SRC).filter((f) => /\.js$/.test(f)).map((f) => path.join(SRC, f)),
    ...(fs.existsSync(path.join(SRC, "motor")) ? fs.readdirSync(path.join(SRC, "motor")).filter((f) => /\.js$/.test(f)).map((f) => path.join(SRC, "motor", f)) : [])];
  const casa = fontes.find((f) => /export const MARCAS_NA_PROSA\b/.test(fs.readFileSync(f, "utf8")));
  t("EM_CENA.fora é a da secção: a pessoa do grupo e o lugar onde se está", EM_CENA.fora.join() === "pessoaDoGrupo,aqui");
  if (casa) {
    const { MARCAS_NA_PROSA } = await import(pathToFileURL(casa).href);
    t(`EM_CENA.fora === MARCAS_NA_PROSA.fora (${path.basename(casa)})`, JSON.stringify(EM_CENA.fora) === JSON.stringify(MARCAS_NA_PROSA.fora));
    t("o teto do motor é o da secção (5)", MARCAS_NA_PROSA.teto === 5);
  } else {
    console.log("  ··  MARCAS_NA_PROSA ainda não existe no motor — a catraca de igualdade acorda quando nascer");
  }
}

/* ============================================================
   4 a 8 · O QUE SE VÊ */
const ENTRADA = `
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Prosa, NomeTocavel, fatiarPelasMarcas } from "./ui.jsx";
import { EmCena, marcasParaProsa, CartaoNaProsa, ondePousaOCartao, maosDoCartao, useCartaoAberto, FileiraAVista } from "./painel-fichas.jsx";
import { Relato } from "./painel-relato.jsx";
export const html = (el) => renderToStaticMarkup(el);
export { React, Prosa, NomeTocavel, fatiarPelasMarcas, EmCena, marcasParaProsa, CartaoNaProsa, ondePousaOCartao, maosDoCartao, useCartaoAberto, FileiraAVista, Relato };
`;
const saida = path.join(AQUI, `.tmp-prosa-tocavel-${process.pid}.mjs`);
buildSync({
  stdin: { contents: ENTRADA, resolveDir: SRC, loader: "jsx", sourcefile: "entrada-prosa-tocavel.jsx" },
  bundle: true, format: "esm", platform: "node", outfile: saida,
  jsx: "automatic", logLevel: "silent", external: ["react", "react/jsx-runtime", "react-dom", "react-dom/server"],
  loader: { ".js": "jsx" }, define: { "process.env.NODE_ENV": '"production"' },
});
const R = await import(pathToFileURL(saida).href);
fs.rmSync(saida, { force: true });
const h = R.React.createElement;
const html = (c, p, ...filhos) => R.html(h(c, p, ...filhos));
const desfaz = (s) => s.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
const botoes = (s) => [...s.matchAll(/<button[^>]*>([^<]*)<\/button>/g)].map((m) => ({ tag: m[0], texto: m[1] }));

/* A RESPOSTA DO QUADRO (Figma 328:27 / 329:722): cinco fichas, Conrado e a
   ermida nomeados duas vezes. As marcas são como o motor as devolve. */
const RESPOSTA = "A estrada desce por entre pedras, e Conrado para à beira do caminho, tira o chapéu e olha para a ermida.\n\n"
  + "Martim Cinzentos aponta a porta da ermida. «Ninguém passa aqui à noite.»\n\n"
  + "Mécia ri baixinho. Conrado volta a pôr o chapéu; Conradinho, o filho, corre para a ermida.";
const FICHA = {
  conrado: { id: "conrado", tipo: "pessoa", nome: "Conrado Sem-Senhor", linha: "cavaleiro sem senhor", frase: "Falo com Conrado", verbos: [{ verbo: "Falar", frase: "Falo com Conrado" }, { verbo: "Ajudar", frase: "Ajudo Conrado" }, { verbo: "Atacar", frase: "Ataco Conrado", impedido: "é crime aqui" }] },
  martim: { id: "martim", tipo: "pessoa", nome: "Martim Cinzentos", linha: "barqueiro" },
  mecia: { id: "mecia", tipo: "pessoa", nome: "Mécia dos Juncos", linha: "vende ataduras · ◉ 29" },
  porta: { id: "porta", tipo: "lugar", nome: "A porta", linha: "a saída" },
  ermida: { id: "ermida", tipo: "lugar", nome: "A ermida", linha: "a 2 h, norte" },
  rato: { id: "rato", tipo: "criatura", nome: "Rato gigante", hostil: true, linha: "3 · hostis" },
};
const MARCAS = [
  { id: "conrado", palavra: "Conrado", de: RESPOSTA.indexOf("Conrado"), longe: false, ficha: FICHA.conrado },
  { id: "ermida", palavra: "ermida", de: RESPOSTA.indexOf("ermida"), longe: false, ficha: FICHA.ermida },
  { id: "martim", palavra: "Martim Cinzentos", de: RESPOSTA.indexOf("Martim"), longe: false, ficha: FICHA.martim },
  { id: "porta", palavra: "porta", de: RESPOSTA.indexOf("porta"), longe: false, ficha: FICHA.porta },
  { id: "mecia", palavra: "Mécia", de: RESPOSTA.indexOf("Mécia"), longe: false, ficha: FICHA.mecia },
];

/* ============================================================ */
sec("4. a fatia pura (fatiarPelasMarcas)");
{
  const F = R.fatiarPelasMarcas;
  const partes = RESPOSTA.split("\n\n");
  const fat = F(partes, MARCAS.map((m) => m.palavra));
  const marcadas = fat.flat().filter((x) => typeof x !== "string");
  t("cinco marcas, uma por palavra", marcadas.length === 5 && new Set(marcadas.map((m) => m.marca)).size === 5);
  t("o texto não perde nem ganha um carácter", fat.map((p) => p.map((x) => (typeof x === "string" ? x : x.texto)).join("")).join("\n\n") === RESPOSTA);
  t("Conrado: só a 1.ª menção (o 2.º é prosa)", fat[0].some((x) => x.texto === "Conrado") && !fat[2].some((x) => x.texto === "Conrado"));
  t("a ermida: só a 1.ª (no 1.º parágrafo)", fat[0].some((x) => x.texto === "ermida") && !fat[1].some((x) => x.texto === "ermida") && !fat[2].some((x) => x.texto === "ermida"));
  t("o nome inteiro, numa marca só: «Martim Cinzentos»", fat[1].some((x) => x.texto === "Martim Cinzentos"));
  t("a fronteira de palavra: Conradinho nunca acende", F(["Conradinho corre. Conrado espera."], ["Conrado"])[0][1].texto === "Conrado"
    && F(["Conradinho corre."], ["Conrado"])[0].length === 1);
  t("a fronteira Unicode: «Mécia» não acende em «Mécias», e acende antes de «,»",
    F(["As Mécias, e Mécia, riem."], ["Mécia"])[0].find((x) => typeof x !== "string").texto === "Mécia"
    && F(["As Mécias, e Mécia, riem."], ["Mécia"])[0][0] === "As Mécias, e ");
  t("o pedaço não cai dentro do nome inteiro: «Martim» passa à ocorrência seguinte",
    JSON.stringify(F(["Martim Cinzentos e o filho Martim."], ["Martim", "Martim Cinzentos"])[0]) === JSON.stringify([{ marca: 1, texto: "Martim Cinzentos" }, " e o filho ", { marca: 0, texto: "Martim" }, "."]));
  t("a mesma palavra duas vezes é uma marca só", F(["Conrado e Conrado."], ["Conrado", "Conrado"])[0].filter((x) => typeof x !== "string").length === 1);
  t("os caracteres da regex são texto («(ele)»)", F(["Disse (ele) baixo."], ["(ele)"])[0].length === 3 && F(["Disse (ele) baixo."], ["(ele)"])[0][1].texto === "(ele)");
  t("sem palavras, cada parágrafo é ele mesmo", JSON.stringify(F(["a", "b"], [])) === JSON.stringify([["a"], ["b"]]));
  t("lixo dá vazio e não estoura", JSON.stringify(F(null, null)) === "[]" && JSON.stringify(F(["x"], [null, "", 3])) === JSON.stringify([["x"]]));
}

/* ============================================================ */
sec("5. o que se vê: os estados, o teto, o Tab, os toques, os rótulos");
{
  /* os estados do nome (327:24: 5 estados × 2 tons — sobre e foco são da folha) */
  const nome = (p) => desfaz(html(R.NomeTocavel, p, "Conrado"));
  const rep = nome({ idDaLinha: "l1", idDoCartao: "c1" });
  t("repouso: <button type=button> com o anel da casa e a classe da folha",
    rep.startsWith("<button") && rep.includes('type="button"') && rep.includes('class="tv-nome-tocavel tv-anel-foco"') && rep.includes('data-estado="repouso"') && rep.includes('data-tom="comum"'));
  t("o nome acessível é a palavra; a linha por aria-describedby; diz que abre um diálogo, recolhido",
    />Conrado<\/button>$/.test(rep) && !rep.includes("aria-label") && rep.includes('aria-describedby="l1"') && rep.includes('aria-haspopup="dialog"') && rep.includes('aria-expanded="false"') && !rep.includes("aria-controls"));
  const apo = nome({ estado: "apontado", idDoCartao: "c1" });
  t("apontado: data-estado, e ainda recolhido", apo.includes('data-estado="apontado"') && apo.includes('aria-expanded="false"') && !apo.includes("aria-controls"));
  const abe = nome({ estado: "aberto", idDoCartao: "c1" });
  t("aberto: expandido e aponta o cartão", abe.includes('data-estado="aberto"') && abe.includes('aria-expanded="true"') && abe.includes('aria-controls="c1"'));
  t("hostil: data-tom", nome({ tom: "hostil" }).includes('data-tom="hostil"'));
  t("estado e tom fora da lista caem no repouso comum", nome({ estado: "sei-la", tom: "x" }).includes('data-estado="repouso"') && nome({ tom: "x" }).includes('data-tom="comum"'));
  t("sem linha, sem aria-describedby", !nome({}).includes("aria-describedby"));

  /* a prosa com as marcas do motor */
  const ms = R.marcasParaProsa(MARCAS, { escrita: null, aberta: null, idDoCartao: "c", idBase: "n" });
  const p = desfaz(html(R.Prosa, { texto: RESPOSTA, marcas: ms }));
  const bs = botoes(p);
  t("o teto respeitado: 5 nomes tocáveis, cada palavra uma vez", bs.length === 5 && new Set(bs.map((b) => b.texto)).size === 5);
  t("o 2.º Conrado e a 2.ª e 3.ª ermida são prosa", (p.match(/Conrado(?![a-z])/g) || []).length === 2 && bs.filter((b) => b.texto === "Conrado").length === 1);
  /* o Tab pela ordem da leitura (WCAG 2.4.3): os botões no DOM pela ordem em
     que a prosa os nomeia, e nenhum tabindex a baralhar */
  const ordemNaProsa = MARCAS.slice().sort((a, b) => a.de - b.de).map((m) => m.palavra);
  t(`o Tab pela ordem da leitura: ${bs.map((b) => b.texto).join(" › ")}`, JSON.stringify(bs.map((b) => b.texto)) === JSON.stringify(ordemNaProsa));
  t("nenhum tabindex no nome (a ordem é a do texto)", bs.every((b) => !/tabindex/i.test(b.tag)));
  t("o nome não muda a letra: a prosa continua na tinta, e o botão herda",
    p.includes(`color:${T.tintaDoPergaminho}`) && bs.every((b) => !/style=/.test(b.tag)));

  /* a máquina de três toques (a da fileira) */
  const chamadas = [];
  const maos = { onToque: (f) => chamadas.push("toque:" + f.id), onAbrir: (f) => chamadas.push("abrir:" + f.id), onFechar: () => chamadas.push("fechar") };
  const toque = (escrita, aberta, id) => {
    chamadas.length = 0;
    const m = R.marcasParaProsa(MARCAS, { escrita, aberta, ...maos }).find((x) => x.id === id);
    m.no(m.palavra).props.onToque();
    return chamadas.join(" ");
  };
  t("1.º toque (repouso) escreve", toque(null, null, "conrado") === "toque:conrado");
  t("2.º toque (apontado) abre", toque("conrado", null, "conrado") === "abrir:conrado");
  t("3.º toque (aberto) fecha", toque("conrado", "conrado", "conrado") === "fechar");
  t("outro nome com um cartão aberto: fecha e aponta o outro", toque("conrado", "conrado", "martim") === "fechar toque:martim");
  t("a ficha que chega à mão é a do motor, com a frase", (() => { let f = null; R.marcasParaProsa(MARCAS, { onToque: (x) => { f = x; } })[0].no("Conrado").props.onToque(); return f && f.frase === "Falo com Conrado" && f.id === "conrado"; })());
  const est = R.marcasParaProsa(MARCAS, { escrita: "martim", aberta: "conrado" });
  t("os estados saem da escrita e da aberta (as mesmas do EmCena)",
    est[0].no("x").props.estado === "aberto" && est[2].no("x").props.estado === "apontado" && est[1].no("x").props.estado === "repouso");
  const hostil = R.marcasParaProsa([{ id: "rato", palavra: "rato", ficha: FICHA.rato }])[0].no("rato").props.tom;
  t("a criatura hostil é tracejada", hostil === "hostil" && est[0].no("x").props.tom === "comum");
  t("uma marca por id, e sem id ou palavra não há marca",
    R.marcasParaProsa([...MARCAS, { id: "conrado", palavra: "Conrado" }, { palavra: "x" }, { id: "z", palavra: "  " }, null], {}).length === 5);
  t("lixo dá vazio", R.marcasParaProsa(null, null).length === 0 && R.marcasParaProsa("x").length === 0);

  /* os rótulos: a linha falada no sr-only, apontada pelo nome */
  const rel = desfaz(html(R.Relato, { mensagens: [{ autor: "mestre", texto: RESPOSTA }], tocaveis: { i: 0, marcas: MARCAS } }));
  const ids = [...rel.matchAll(/aria-describedby="([^"]+)"/g)].map((m) => m[1]);
  t("cada nome aponta uma linha que existe na resposta", ids.length === 5 && ids.every((id) => rel.includes(`id="${id}"`)));
  t("as linhas moram num sr-only no fim da resposta", /<div class="sr-only">(<span id="[^"]+">[^<]*<\/span>){5}<\/div>/.test(rel));
  t("a moeda diz-se «29 moedas», e o «·» é pausa", rel.includes(">vende ataduras, 29 moedas<"));
  t("o lugar diz o caminho: «a 2 h, norte»", rel.includes(">a 2 h, norte<"));
  t("a tela não fala do mecanismo (nem ficha, nem marca, nem id)", !/\b(ficha|marca|tocável|tocavel)\b/i.test(rel.replace(/<[^>]+>/g, " ")));
}

/* ============================================================ */
sec("5b. as respostas antigas sem marcas, e a prosa sem marcas é a de antes");
{
  const msgs = [{ autor: "mestre", texto: "Conrado acena da ermida." }, { autor: "jogador", texto: "Falo com Conrado." }, { autor: "mestre", texto: RESPOSTA }];
  const agora = desfaz(html(R.Relato, { mensagens: msgs, tocaveis: { i: 2, marcas: MARCAS } }));
  const primeira = agora.slice(agora.indexOf('data-msg="0"'), agora.indexOf('data-fala="jogador"'));
  t("só a resposta de agora tem nomes tocáveis (5)", botoes(agora.slice(agora.indexOf('data-msg="2"'))).filter((b) => b.tag.includes("tv-nome-tocavel")).length === 5);
  t("a resposta de cima é prosa, e o Conrado lá é texto", primeira.includes("Conrado acena da ermida.") && !primeira.includes("tv-nome-tocavel"));
  const semNada = desfaz(html(R.Relato, { mensagens: msgs }));
  t("sem tocaveis, o relato é o de antes", semNada === desfaz(html(R.Relato, { mensagens: msgs, tocaveis: null })) && !semNada.includes("tv-nome-tocavel"));
  t("tocaveis sem marcas, ou de outra resposta: o relato é o de antes",
    semNada === desfaz(html(R.Relato, { mensagens: msgs, tocaveis: { i: 2, marcas: [] } })) && semNada === desfaz(html(R.Relato, { mensagens: msgs, tocaveis: { i: 7, marcas: MARCAS } })));
  const prosa = html(R.Prosa, { texto: RESPOSTA });
  t("a Prosa sem marcas, com marcas = [] e com null: byte a byte a mesma",
    prosa === html(R.Prosa, { texto: RESPOSTA, marcas: [] }) && prosa === html(R.Prosa, { texto: RESPOSTA, marcas: null }) && !prosa.includes("<button"));
  t("e cada parágrafo é só o texto dele (nenhum nó a mais)", prosa.includes(">Mécia ri baixinho. Conrado volta a pôr o chapéu; Conradinho, o filho, corre para a ermida.</p>"));
  const cer = desfaz(html(R.Prosa, { texto: RESPOSTA, abertura: "cerimonia", marcas: R.marcasParaProsa(MARCAS, {}) }));
  const frase = cer.slice(cer.indexOf('data-abertura="cerimonia"'), cer.indexOf("</p>"));
  t("na cerimónia, o nome da primeira frase também se toca", frase.includes(">Conrado</button>") && botoes(cer).length === 5);
  t("e a cerimónia sem marcas é a de antes", html(R.Prosa, { texto: RESPOSTA, abertura: "cerimonia" }) === html(R.Prosa, { texto: RESPOSTA, abertura: "cerimonia", marcas: [] }));
  t("o cartão não se desenha sem medida (no servidor: nada)", html(R.CartaoNaProsa, { ficha: FICHA.conrado, id: "c" }) === "");
}

/* ============================================================ */
sec("6. as mãos do cartão: o Esc devolve o foco, o toque fora fecha");
{
  /* um documento de mentira: o que as mãos leem é getElementById e
     activeElement; o resto é o que quem liga lhes passa */
  const no = (nome, filhos = []) => ({ nome, filhos, contains(el) { return el === this || this.filhos.some((f) => f.contains(el)); } });
  const verboDoCartao = no("verbo");
  const cartao = no("cartao", [verboDoCartao]);
  const nomeConrado = no("Conrado"), nomeMartim = no("Martim"), campo = { ...no("campo"), tagName: "TEXTAREA" }, fora = no("fora");
  const raiz = { contains: (el) => [nomeConrado, nomeMartim].some((b) => b.contains(el)) };
  const antes = globalThis.document;
  const doc = { activeElement: null, getElementById: (id) => (id === "c" ? cartao : null) };
  globalThis.document = doc;
  try {
    const registo = [];
    const atual = { current: { fichaAberta: FICHA.conrado, raiz, idDoCartao: "c",
      focar: (id) => registo.push("foco:" + id), onFechar: () => registo.push("fechar"), onVerbo: (f, v) => registo.push("verbo:" + v.verbo) } };
    const { aoTeclar, aoTocarFora } = R.maosDoCartao(atual);
    const tecla = (key, alvo = null, mais = {}) => { let parado = false; aoTeclar({ key, target: alvo, defaultPrevented: false, preventDefault: () => { parado = true; }, ...mais }); return parado; };
    doc.activeElement = verboDoCartao; registo.length = 0;
    t("Esc com o foco no cartão: fecha e o foco volta ao nome", tecla("Escape") && registo.join(" ") === "fechar foco:conrado");
    doc.activeElement = nomeConrado; registo.length = 0; tecla("Escape");
    t("Esc com o foco no nome: fecha e o foco fica no nome", registo.join(" ") === "fechar foco:conrado");
    doc.activeElement = campo; registo.length = 0; tecla("Escape");
    t("Esc com o foco no campo: fecha, e o foco não sai do campo", registo.join(" ") === "fechar");
    registo.length = 0; tecla("Escape", null, { ctrlKey: true });
    t("Ctrl+Esc não é do cartão", registo.length === 0);
    doc.activeElement = verboDoCartao; registo.length = 0;
    t("1 escreve o verbo da posição, e o foco volta ao nome", tecla("1", verboDoCartao) && registo.join(" ") === "foco:conrado verbo:Falar");
    registo.length = 0; tecla("3", verboDoCartao);
    t("o verbo impedido cala o seu atalho", registo.length === 0);
    registo.length = 0; tecla("2", campo);
    t("o atalho nunca rouba a tecla do campo", registo.length === 0);
    registo.length = 0; aoTocarFora({ target: fora });
    t("o toque fora fecha", registo.join(" ") === "fechar");
    registo.length = 0; aoTocarFora({ target: nomeMartim }); aoTocarFora({ target: verboDoCartao });
    t("o toque noutro nome ou no cartão não é fora (o nome trata o seu toque)", registo.length === 0);
    atual.current.fichaAberta = null; registo.length = 0; tecla("Escape"); aoTocarFora({ target: fora });
    t("sem cartão aberto, as mãos não fazem nada", registo.length === 0);
    atual.current.fichaAberta = FICHA.conrado; atual.current.onFechar = () => { throw new Error("rebentou"); };
    let estourou = false; try { tecla("Escape"); aoTocarFora({ target: fora }); } catch (e) { estourou = true; }
    t("quem liga a rebentar não custa o turno", !estourou);
  } finally { globalThis.document = antes; }
  /* a fileira usa o MESMO gancho: a extração não mudou o comportamento dela
     (as asserções do texto vivem em teste-painel-fichas, secções 5 a 7) */
  const fonte = fs.readFileSync(path.join(SRC, "painel-fichas.jsx"), "utf8");
  t("a fileira e o cartão na prosa usam o mesmo gancho",
    /useCartaoAberto\(\{ fichaAberta, raiz, idDoCartao, focar, onFechar, onVerbo \}\);/.test(fonte) && /useCartaoAberto\(\{ fichaAberta: ficha, raiz: raiz \|\| ancora/.test(fonte));
  t("o gancho e as mãos são funções do módulo (nunca nascem no render)", typeof R.useCartaoAberto === "function" && typeof R.maosDoCartao === "function");
}

/* ============================================================ */
sec("7. o Em cena sem os nomeados (TP 5)");
{
  const gente = [
    { id: "conrado", tipo: "pessoa", nome: "Conrado Sem-Senhor" }, { id: "mecia", tipo: "pessoa", nome: "Mécia dos Juncos" },
    { id: "martim", tipo: "pessoa", nome: "Martim Cinzentos" }, { id: "porta", tipo: "lugar", nome: "A porta" }, { id: "barqueiro", tipo: "pessoa", nome: "O barqueiro" },
    { id: "brann", tipo: "pessoa", nome: "Brann", variante: "pessoaDoGrupo" },
  ];
  const rostos = (s) => (s.match(/data-em-cena="/g) || []).length;
  const todos = desfaz(html(R.EmCena, { itens: gente }));
  const ditos = desfaz(html(R.EmCena, { itens: gente, nomeados: ["conrado", "martim", "mecia", "porta"] }));
  t("o quadro: Conrado, Martim, Mécia e a porta na prosa → a barra fica com 1 rosto (o barqueiro)", rostos(ditos) === 1 && !/\+(<!-- -->)?\d/.test(ditos));
  t("o nome acessível continua a dizer TODOS", ditos.includes('aria-label="Em cena: Conrado Sem-Senhor, Mécia dos Juncos, Martim Cinzentos e mais 2. Abrir."')
    && todos.includes('aria-label="Em cena: Conrado Sem-Senhor, Mécia dos Juncos, Martim Cinzentos e mais 2. Abrir."'));
  t("sem nomeados, a barra é a de antes (3 rostos e o «+2»)", rostos(todos) === 3 && /\+(<!-- -->)?2</.test(todos)
    && todos === desfaz(html(R.EmCena, { itens: gente, nomeados: [] })) && todos === desfaz(html(R.EmCena, { itens: gente, nomeados: null })));
  const uns = desfaz(html(R.EmCena, { itens: gente, nomeados: ["conrado"] }));
  t("um nomeado: os três rostos seguintes e o «+1»", rostos(uns) === 3 && /\+(<!-- -->)?1</.test(uns));
  const nenhum = desfaz(html(R.EmCena, { itens: gente, nomeados: gente.map((g) => g.id) }));
  t("todos nomeados: zero rostos e o disco «5» — a gaveta nunca fica sem porta",
    rostos(nenhum) === 0 && nenhum.includes("data-todos-ditos") && />5<\/span>/.test(nenhum) && (nenhum.match(/<button/g) || []).length === 1 && nenhum.includes('aria-haspopup="dialog"'));
  t("o disco «N» tem a forma do «+N» (panelSoft, aro lineStrong)", nenhum.includes(`background:${T.panelSoft}`) && nenhum.includes(`border:1px solid ${T.lineStrong}`));
  t("ids numéricos e de texto casam", rostos(desfaz(html(R.EmCena, { itens: [{ id: 7, tipo: "pessoa", nome: "Sete" }, { id: "8", tipo: "pessoa", nome: "Oito" }], nomeados: ["7", 8] }))) === 0);
  t("ninguém em cena continua 0 px, mesmo com nomeados", html(R.EmCena, { itens: [], nomeados: ["x"] }) === "");
}

/* ============================================================ */
sec("8. onde pousa o cartão: nunca sobre a linha do nome nem sobre o campo (TP 4)");
{
  const O = R.ondePousaOCartao;
  /* a mesa do quadro 329:1062, a 1905 × 860: a página de 410 a 757 (x) e de
     72 a 776 (y); o campo mora por baixo da página */
  const vw = 1905, vh = 860;
  const pagina = { top: 72, bottom: 776, left: 708, right: 1308, width: 600 };
  const linha = 27.6;
  const caixa = (pos) => {
    const top = pos.top != null ? pos.top : vh - pos.bottom - pos.maxHeight;
    const bottom = pos.top != null ? pos.top + pos.maxHeight : vh - pos.bottom;
    return { top, bottom, left: pos.left, right: pos.left + pos.width };
  };
  const nomeEm = (y, x = 860, largura = 70) => ({ top: y, bottom: y + linha, left: x, right: x + largura, width: largura });
  let pior = null;
  for (let y = pagina.top; y + linha <= pagina.bottom; y += 7) {
    for (const x of [pagina.left, 860, pagina.right - 70]) {
      const n = nomeEm(y, x);
      const pos = O({ formato: "mesa", nome: n, pagina, vh, vw });
      const c = caixa(pos);
      const tapaALinha = c.top < n.bottom && c.bottom > n.top;
      const saiDaPagina = c.top < pagina.top - 0.01 || c.bottom > pagina.bottom + 0.01 || c.left < pagina.left || c.right > pagina.right;
      const espaco = Math.max(n.top - 8 - pagina.top, pagina.bottom - n.bottom - 8);
      if ((tapaALinha || saiDaPagina) && espaco >= ALVOS.piso) { pior = { y, x, c }; break; }
    }
    if (pior) break;
  }
  t("a mesa: em toda a página, o popover nunca tapa a linha do nome nem sai da página (logo, nunca chega ao campo)", !pior, JSON.stringify(pior));
  const alto = O({ formato: "mesa", nome: nomeEm(198), pagina, vh, vw });
  t("o quadro: o nome perto do topo (126 acima, 524 abaixo) abre por baixo, a 8 da linha",
    alto.top === 198 + linha + 8 && alto.bottom == null && Math.abs(alto.maxHeight - (pagina.bottom - (198 + linha) - 8)) < 0.01);
  const baixo = O({ formato: "mesa", nome: nomeEm(700), pagina, vh, vw });
  t("o nome perto do fundo abre por cima, a 8 da linha", baixo.bottom === vh - (700 - 8) && baixo.top == null);
  t("376 de largo, alinhado à esquerda da palavra", alto.width === FICHAS.cartao.largura && alto.left === 860);
  t("preso à borda direita da página", O({ formato: "mesa", nome: nomeEm(198, 1250), pagina, vh, vw }).left === pagina.right - FICHAS.cartao.largura);
  t("a página estreita encolhe o cartão à largura dela", O({ formato: "mesa", nome: nomeEm(198, 10), pagina: { ...pagina, left: 0, right: 300, width: 300 }, vh, vw }).width === 300);
  /* o telefone, 375 × 667: a página de 54 a 531, o campo por baixo dela */
  const tel = O({ formato: "telefone", nome: nomeEm(232, 120), pagina: { top: 54, bottom: 531, left: 8, right: 367, width: 359 }, vh: 667, vw: 375 });
  t("o telefone: a folha de lado a lado, com o fundo no pé da página (o campo à vista)", tel.left === 0 && tel.width === 375 && tel.bottom === 667 - 531);
  t("e até 62 % da altura, nunca acima do topo da página", tel.maxHeight === Math.min(FICHAS.cartao.folhaMax * 667, 531 - 54));
  t("o corte da mesa da prosa é o da mesa de 1024 (HUD_DA_MESA)", HUD_DA_MESA.mesa.aPartirDe === 1024
    && /MESA_DA_PROSA = `\(min-width: \$\{HUD_DA_MESA\.mesa\.aPartirDe\}px\)`/.test(fs.readFileSync(path.join(SRC, "painel-fichas.jsx"), "utf8")));
}

console.log(`\nprosa tocável: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
