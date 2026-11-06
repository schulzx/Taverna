/* teste-mercado-ar.mjs (AR6, 06/11/2026) — o Mercado como banca e veredito
   (formas.md §AR 1, §AR 4, §AR 5, §AR 6, §AR 7; Figma 282:3205, 282:3534,
   282:3839, a Peça da banca 271:134).

   Prova:
   1. a tabela MERCADO está em estilo.js com a forma de §AR 6, e o painel não
      tem cor solta;
   2. os pares de letra passam o piso (§AR 5) — incluindo os que a tela nova
      acrescenta (o nome raro na peça escolhida, a letra sobre o couro);
   3. o toque e o escolher têm duração no CSS e param no reduce;
   4. o painel, renderizado de verdade: cada ação de antes existe na tela nova
      (comprar na banca, comprar mantimento 1 e 5, vender, pechinchar), o
      veredito vem antes do clique («◉ 168 → ◉ 48», o porquê, o que tem
      vestido), e todo preço é o do sistema — a etiqueta do estoque e a
      oferta de `ofertaPor`, nunca uma conta do painel;
   5. o App liga o painel com as mesmas funções de antes, na gaveta e em tela
      inteira na mesa, e a sub-aba velha saiu de lá.

   O JSX não corre em Node: empacota-se um ponto de entrada com o esbuild (o
   mesmo de teste-talentos-ar) e lê-se o HTML de renderToStaticMarkup. */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { buildSync } from "esbuild";
import { T, FOLHA, MERCADO, ENCAIXE, GAVETA_DO_ENCAIXE, COR_DA_RARIDADE, MOLDURA_POR_DEGRAU } from "../src/estilo.js";
import { razao, rgb } from "./conta-da-luz.mjs";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? "\n      " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const AQUI = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(AQUI, "..", "src");
const PAINEL = fs.readFileSync(path.join(SRC, "painel-mercado.jsx"), "utf8");
const APP = fs.readFileSync(path.join(SRC, "App.jsx"), "utf8");

/* ============================================================ */
sec("1. a tabela de §AR 6");
{
  t("a mesa: 300 à esquerda, veredito 420, 4 colunas de 245", MERCADO.mesa.esquerda === 300 && MERCADO.mesa.veredito === 420 && MERCADO.mesa.colunas === 4 && MERCADO.mesa.peca === 245);
  t("a 1280: veredito 380, 4 colunas de 186; o telefone: 2 de 165", MERCADO.meia.veredito === 380 && MERCADO.meia.peca === 186 && MERCADO.telefone.colunas === 2 && MERCADO.telefone.peca === 165);
  t("a peça usa o Encaixe da casa; a bolsa a 48", MERCADO.peca.encaixe === ENCAIXE.lado && MERCADO.bolsa.encaixe === 48);
  t("a gaveta do veredito é a do encaixe", MERCADO.gaveta === GAVETA_DO_ENCAIXE);
  t("o escolher leva 120 ms (§AR 7)", MERCADO.escolher === 120);
  const corpo = PAINEL.replace(/\/\*[\s\S]*?\*\//g, "");
  const m = corpo.match(/#[0-9a-fA-F]{3,8}\b|rgba?\(/);
  t("painel-mercado.jsx: nenhuma cor solta", !m, m ? `achou ${m[0]}` : "");
  t("painel-mercado.jsx: não calcula preço (sem precoDe*, sem fator*)", !/precoDe\w*\(|precoQueOferecem|fatorDe\w*\(|precoDeVenda/.test(corpo));
}

/* ============================================================ */
sec("2. o contraste (§AR 5)");
{
  const LETRA = [
    ["nome comum / panel", COR_DA_RARIDADE.comum.cor, T.panel],
    ["nome incomum / panel", COR_DA_RARIDADE.incomum.cor, T.panel],
    ["nome raro / panel", COR_DA_RARIDADE.raro.cor, T.panel],
    ["nome incomum / panelSoft (escolhida)", COR_DA_RARIDADE.incomum.cor, T.panelSoft],
    ["nome raro / panelSoft (escolhida)", COR_DA_RARIDADE.raro.cor, T.panelSoft],
    ["preço amberSoft / panel", T.amberSoft, T.panel],
    ["faltam danger / panel", T.danger, T.panel],
    ["▼ danger / panelSoft", T.danger, T.panelSoft],
    ["▲ ok / panelSoft", T.ok, T.panelSoft],
    ["veredito inkMeio / panelSoft", T.inkMeio, T.panelSoft],
    ["veredito inkDim / panelSoft", T.inkDim, T.panelSoft],
    ["verbo armado onAccent / amber", T.onAccent, T.amber],
    ["verbo gesto ink / pagina", T.ink, T.pagina],
    ["sem volta danger / pagina", T.danger, T.pagina],
    ["subtítulo da banca inkDim / couro", T.inkDim, T.couro],
    ["moedas amber / panelSoft", T.amber, T.panelSoft],
    ["título da tela ouroClaro / couroBaixo", MOLDURA_POR_DEGRAU.ouro.claro, T.couroBaixo],
  ];
  for (const [n, fg, bg] of LETRA) {
    if (!fg || !bg) { t(`${n}: a cor existe`, false); continue; }
    const r = razao(rgb(fg), rgb(bg)); t(`${n}: ${r.toFixed(2)} ≥ 4,5`, r >= 4.5);
  }
}

/* ============================================================ */
sec("3. o movimento: tempo no CSS, parado no reduce");
{
  const [fora, ...resto] = FOLHA.split("@media (prefers-reduced-motion: reduce)");
  t("a peça da banca: o toque e o escolher com duração", new RegExp(`\\.tv-peca-banca \\{ transition: transform ${ENCAIXE.pressionado.dura}ms[^}]*${MERCADO.escolher}ms`).test(fora));
  t("o pressionado é 0,96", new RegExp(`\\.tv-peca-banca:active \\{ transform: scale\\(${ENCAIXE.pressionado.escala}\\)`).test(fora));
  const reduce = resto.find((b) => b.includes("tv-peca-banca")) || "";
  t("no reduce, troca seca", /\.tv-peca-banca \{ transition: none; \}/.test(reduce) && /\.tv-peca-banca:active \{ transform: none; \}/.test(reduce));
  t("a gaveta do telefone usa a subida da casa (parada no reduce)", PAINEL.includes("tv-gaveta-sobe"));
}

/* ============================================================
   4 · O QUE SE VÊ */
const ENTRADA = `
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PainelMercado } from "./painel-mercado.jsx";
export const html = (el) => renderToStaticMarkup(el);
export { React, PainelMercado };
`;
const saida = path.join(AQUI, `.tmp-mercado-ar-${process.pid}.mjs`);
buildSync({
  stdin: { contents: ENTRADA, resolveDir: SRC, loader: "jsx", sourcefile: "entrada-mercado.jsx" },
  bundle: true, format: "esm", platform: "node", outfile: saida, jsx: "transform", logLevel: "silent", external: ["react", "react-dom", "react-dom/server"],
  loader: { ".js": "jsx" }, define: { "process.env.NODE_ENV": '"production"' },
});
const R = await import(pathToFileURL(saida).href);
fs.rmSync(saida, { force: true });
const h = R.React.createElement;
const html = (p) => R.html(h(R.PainelMercado, p));
/* a moeda desenha-se (TextoComMoeda: o Glifo com o nome «moedas»); aqui volta a ◉ para se ler */
const texto = (s) => s.replace(/<span[^>]*aria-label="moedas"[^>]*>[\s\S]*?<\/span>/g, "◉ ").replace(/\u00A0/g, " ").replace(/<[^>]+>/g, " ").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/\s+/g, " ");

/* o herói e a praça: números esquisitos de propósito (168, 120, 37), para
   que só passem se vierem de quem os deu */
const heroi = {
  nome: "Ilsa", classe: "Guerreiro", nivel: 3, moedas: 168, atributos: { forca: 2, destreza: 1 },
  equipados: { elmo: { nome: "Capuz de couro", tipo: "elmo", raridade: "comum" } },
  equipamento: [{ nome: "Capuz de couro", tipo: "elmo", raridade: "comum" }, { nome: "Machado velho", tipo: "arma", raridade: "comum" }],
  inventario: ["Tocha", { nome: "Poção de cura", tipo: "consumivel", raridade: "incomum" }],
};
const bigorna = {
  id: "ferreiro|1", tipo: "ferreiro", nome: "A Bigorna do Cais", icone: "⚒", rotulo: "Ferraria", desc: "aço, couro e o cheiro de brasa", caixa: 340, barganha: null,
  estoque: [
    { nome: "Elmo de ferro batido", tipo: "elmo", raridade: "incomum", preco: 120, porques: ["a serra tem ferro de sobra"] },
    { nome: "Cota de escamas", tipo: "armadura", raridade: "raro", preco: 240, porques: [] },
  ],
};
const boticario = { id: "boticario|1", tipo: "boticario", nome: "O Vidro Verde", icone: "⚗", rotulo: "Botica", desc: "", caixa: 90, barganha: { dia: 4, ajuste: 0.9, texto: "ele cede dez por cento", ok: true }, estoque: [] };
const balcao = [
  { id: "racao", nome: "Ração", icone: "🍞", desc: "um dia de comida", preco: 2, porques: ["outono numa vila agrícola"] },
  { id: "kit", nome: "Kit de viagem", icone: "🎒", desc: "corda, pederneira", preco: 15, porques: [] },
];
const chamadas = [];
const ofertaPor = (it) => { chamadas.push(it && it.nome); return it && it.nome === "Tocha" ? { valor: 1, quem: null, motivo: "ninguém aqui lida com isso", porques: [] } : { valor: 37, quem: { id: "ferreiro|1", nome: "A Bigorna do Cais" }, motivo: "", porques: ["o ferro sobra aqui"] }; };
const base = { personagem: heroi, bancas: [bigorna, boticario], cidade: { nome: "Vila Clara" }, balcao, ofertaPor, comercio: null };

sec("4. a mesa (1905): a banca, a peça, o veredito antes do clique");
{
  const s = texto(html({ ...base, leiaute: "mesa", inicial: { banca: "ferreiro|1", item: "Elmo de ferro batido" } }));
  t("o cabeçalho: O Mercado, a cidade, as bancas", /O Mercado/.test(s) && /Vila Clara · 2 bancas/.test(s));
  t("as bancas como cartões, o balcão primeiro", s.indexOf("Balcão de mantimentos") > -1 && s.indexOf("Balcão de mantimentos") < s.indexOf("A Bigorna do Cais") && /O Vidro Verde/.test(s));
  t("a peça mostra a etiqueta do estoque (◉ 120)", /Elmo de ferro batido.*◉ 120/.test(s));
  t("cara demais: o preço e o que falta (◉ 240 · faltam ◉ 72)", /◉ 240 · faltam ◉ 72/.test(s));
  /* «Elmo · agora», e não «No teu elmo agora» do Figma: o encaixe tem género
     («No teu armadura»), e a forma sem artigo serve aos sete */
  t("o que tem vestido no mesmo encaixe", /Elmo · agora Capuz de couro/.test(s));
  t("as moedas antes → depois: ◉ 168 → ◉ 48", /◉ 168 → ◉ 48/.test(s));
  t("sem dinheiro, as moedas não descem de zero: dizem o que falta", /◉ 168 → faltam ◉ 72/.test(texto(html({ ...base, leiaute: "mesa", inicial: { banca: "ferreiro|1", item: "Cota de escamas" } }))));
  t("o porquê do preço sai de `porques`", /a serra tem ferro de sobra/.test(s));
  t("o tempo de vestir sai de TROCA_DE_SLOT", /Trocar leva/.test(s));
  t("AÇÃO comprar: o verbo armado com o preço e o que sobra", /Comprar Elmo de ferro batido ◉ 120 · vai para a bolsa · ficas com ◉ 48/.test(s));
  t("AÇÃO pechinchar: com o preço de falhar", /Pechinchar uma proposta por dia · se ele se ofender, o preço sobe/.test(s));
  t("a gaveta do mercador à vista (◉ 340)", /a gaveta dele hoje: ◉ 340/.test(s));
  t("a bolsa por baixo, com o que pagam (ofertaPor)", /A tua bolsa · o que te pagam aqui/.test(s) && /paga ◉ 37/.test(s) && /não compra/.test(s));
  t("o painel pergunta a oferta ao sistema por cada coisa da bolsa", ["Capuz de couro", "Machado velho", "Tocha", "Poção de cura"].every((n) => chamadas.includes(n)));
}

sec("4b. vender, o balcão e a pechincha já feita");
{
  const v = texto(html({ ...base, leiaute: "mesa", inicial: { banca: "ferreiro|1", venda: "Machado velho", origem: "equipamento" } }));
  t("AÇÃO vender: o veredito diz quem paga e quanto (◉ 37 de ofertaPor)", /Vender Machado velho A Bigorna do Cais paga ◉ 37 · não volta/.test(v));
  t("vender: as moedas ◉ 168 → ◉ 205 e o porquê", /◉ 168 → ◉ 205/.test(v) && /o ferro sobra aqui/.test(v));
  const vest = texto(html({ ...base, leiaute: "mesa", inicial: { banca: "ferreiro|1", venda: "Capuz de couro", origem: "equipamento" } }));
  t("o vestido não se vende por engano (impedido, com o porquê)", /está vestido: tira-o primeiro na ficha/.test(vest));
  const nin = texto(html({ ...base, leiaute: "mesa", inicial: { banca: "ferreiro|1", venda: "Tocha", origem: "inventario" } }));
  t("ninguém compra: diz porquê, e o verbo vem impedido", /Ninguém aqui lida com isso/.test(nin) && /ninguém aqui compra/.test(nin));
  const b = texto(html({ ...base, leiaute: "mesa", inicial: { banca: "balcao" } }));
  t("AÇÃO mantimento: 1 e 5, com o preço do balcão", /Ração.*Comprar ◉ 2 · ficas com ◉ 166.*Comprar 5 ◉ 10 · ficas com ◉ 158/.test(b));
  t("o kit vende-se um só", !/Kit de viagem.*Comprar 5 ◉ 75/.test(b));
  t("o porquê do balcão", /outono numa vila agrícola/.test(b));
  const p = texto(html({ ...base, leiaute: "mesa", inicial: { banca: "boticario|1" } }));
  t("a pechincha de hoje fica à vista, com o sinal", /▼ ele cede dez por cento/.test(p) && !/Pechinchar uma proposta/.test(p));
  t("banca vazia diz o que fazer", /Prateleiras vazias/.test(p));
  const nada = texto(html({ personagem: heroi, bancas: [], balcao: [], leiaute: "mesa" }));
  t("sem banca nenhuma: o recado de antes", /Nenhuma banca por perto/.test(nada));
}

sec("4c. a 1280 e o telefone");
{
  const m = html({ ...base, leiaute: "meia" });
  t("a 1280: as bancas são abas", (m.match(/role="tab"/g) || []).length === 3);
  const tel0 = html({ ...base, leiaute: "telefone" });
  t("no telefone, sem escolha, não há gaveta", !/aria-label="O veredito"/.test(tel0));
  const tel = html({ ...base, leiaute: "telefone", inicial: { banca: "ferreiro|1", item: "Elmo de ferro batido" } });
  t("no telefone, a escolha abre a gaveta de baixo com o veredito", /role="dialog" aria-label="O veredito"/.test(tel) && /◉ 168 → ◉ 48/.test(texto(tel)));
  t("no telefone, duas colunas", tel.includes(`repeat(${MERCADO.telefone.colunas}, minmax(0, 1fr))`));
}

/* ============================================================ */
sec("5. a fiação no App");
{
  const usos = APP.match(/<PainelMercado [^>]*\/>/g) || [];
  t("o App usa o painel duas vezes (a gaveta e a tela inteira)", usos.length === 2, `achou ${usos.length}`);
  t("com as mesmas funções de antes", usos.length > 0 && usos.every((u) => /onComprar=\{onComprar\}/.test(u) && /onVender=\{onVender\}/.test(u) && /onPechinchar=\{onPechinchar\}/.test(u) && /onComprarSuprimento=\{onComprarSuprimento\}/.test(u) && /ofertaPor=\{ofertaPor\}/.test(u)));
  t("e as funções são as que pagam e cobram", /onComprar=\{comprarNoMercado\}/.test(APP) && /onVender=\{venderNoMercado\}/.test(APP) && /onPechinchar=\{pechincharCom\}/.test(APP) && /onComprarSuprimento=\{comprarSuprimento\}/.test(APP));
  t("a sub-aba velha saiu do App", !APP.includes("Vender — quem compra é quem lida com aquilo"));
  t("na mesa, em tela inteira, com o fechar", /aria-label="Mercado"/.test(APP) && /aoFechar=\{fecharMercado\}/.test(APP));
}

console.log(`\n${ok} ok, ${mal} mal`);
if (mal) process.exit(1);
