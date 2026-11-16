/* A MESA CHEIA (V4 · F1 §6 · 16/11/2026)

   A tela principal vira a mesa do F1. Prova, em Node:
   · a conta pura de qual composição vale em qual janela (as quatro janelas
     do pacote: 1440, 1280, 800, 375) e as medidas do F1 (a página a 680 em
     x 380 a 1440; a 600 a 1280; a esquerda a 40 / 24);
   · a cobertura: a fração da janela com conteúdo ≥ 70 % a 1440 e a 1280
     (antes ~40 %, analise-visual §3.4);
   · a estampa (aberta só na chegada, e só na larga) e as trinta cenas;
   · o render das três zonas e da casca, com o piso da letra (12; 13 nome)
     e sem mono;
   · o Códex com porta a 375 (o grimório na tira);
   · a voz do sistema na folha: nota do Mestre ou lacre, nunca mono;
   · a fiação no App: a barra de topo fora da mesa larga, o trilho antigo
     fora, a casca à volta da página;
   · V4b (16/11) — a mesa no celular: a faixa de 48, a estampa com a
     bandeja de bolso, as cinco portas da borda, a gaveta, a janela baixa,
     um âmbar só, o piso de letra; e a 1440 o «Em cena» vazio e o painel do
     tempo na letra da mesa.
*/
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { buildSync } from "esbuild";
import { COMPOSICAO_DA_MESA, HUD_DA_MESA, PECAS_DA_MESA, LUZ_DA_MESA, MESA_NO_TELEFONE, T } from "../src/estilo.js";
import { composicaoDaJanela, temTresZonas, estadoDaEstampa, cenaDaEstampa, CENAS_DA_ESTAMPA, caixasDaComposicao, coberturaDaMesa, luzDaMesa } from "../src/mesa-do-mestre.js";

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const AQUI = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(AQUI, "..", "src");
const ler = (f) => fs.readFileSync(path.join(SRC, f), "utf8");

sec("1 · qual composição vale em qual janela");
t("1440 é a larga (o quadro 272:127)", composicaoDaJanela(1440).nome === "larga");
t("1280 é a media (o quadro 272:780)", composicaoDaJanela(1280).nome === "media");
t("1180 ainda é a media; 1179 já não", composicaoDaJanela(1180).nome === "media" && composicaoDaJanela(1179).nome === "estreita");
t("800 é a estreita (a do telefone com a página a 680, F1 §6)", composicaoDaJanela(800).nome === "estreita" && composicaoDaJanela(800).pagina === 680);
t("375 é o telefone", composicaoDaJanela(375).nome === "telefone");
t("largura inválida cai no telefone (nunca uma mesa que estoura)", composicaoDaJanela("x").nome === "telefone" && composicaoDaJanela(-5).nome === "telefone");
t("três zonas só na larga e na media", temTresZonas("larga") && temTresZonas("media") && !temTresZonas("estreita") && !temTresZonas("telefone"));
t("as faixas descem por largura mínima", COMPOSICAO_DA_MESA.faixas.every((f, i, a) => i === 0 || a[i - 1].aPartirDe > f.aPartirDe));

sec("2 · as medidas do F1 e a cobertura");
const c1440 = caixasDaComposicao(1440, 900);
const pag1440 = c1440.caixas.find((c) => c.zona === "pagina");
t("a 1440 a página tem 680 e começa perto de x 380 (F1: x 380, y 20)", pag1440.w === 680 && Math.abs(pag1440.x - 380) <= 12 && pag1440.y === 20, JSON.stringify(pag1440));
t("a 1440 a esquerda começa em x 40 com 316 de largura", COMPOSICAO_DA_MESA.faixas[0].lado === 40 && COMPOSICAO_DA_MESA.faixas[0].esquerda === 316);
const c1280 = caixasDaComposicao(1280, 720);
t("a 1280 a página tem 600 (F1: 600 × 680)", c1280.caixas.find((c) => c.zona === "pagina").w === 600 && c1280.caixas.find((c) => c.zona === "pagina").h === 680);
t("a 1280 sem cartas de pista (F1: saem as cartas de pista; nada mais)", !c1280.caixas.some((c) => c.zona === "pistas"));
const cob1440 = coberturaDaMesa(c1440.caixas, 1440, 900);
const cob1280 = coberturaDaMesa(c1280.caixas, 1280, 720);
t(`a 1440 a mesa cobre ≥ 70 % da janela (${(cob1440 * 100).toFixed(1)} %; antes ~40 %)`, cob1440 >= COMPOSICAO_DA_MESA.alvoDeCobertura);
t(`a 1280 a mesa cobre ≥ 70 % (${(cob1280 * 100).toFixed(1)} %)`, cob1280 >= COMPOSICAO_DA_MESA.alvoDeCobertura);
t("a cobertura é a união, não a soma (duas caixas iguais contam uma vez)", Math.abs(coberturaDaMesa([{ x: 0, y: 0, w: 50, h: 100 }, { x: 0, y: 0, w: 50, h: 100 }], 100, 100) - 0.5) < 0.03); /* a grelha amostra a cada 4 px: 0,48 */
t("nada da mesa sai da janela a 1440 nem a 1280", [[c1440, 1440, 900], [c1280, 1280, 720]].every(([c, W, H]) => c.caixas.every((k) => k.x >= 0 && k.y >= 0 && k.x + k.w <= W && k.y + k.h <= H)));
t("a 1180 a página ainda cabe (≥ paginaMin) e nada estoura", (() => { const c = caixasDaComposicao(1180, 700); return c.pagina >= COMPOSICAO_DA_MESA.faixas[1].paginaMin && c.caixas.every((k) => k.x + k.w <= 1180); })());

sec("3 · a estampa e a luz");
t("larga: aberta na chegada, recolhida depois", estadoDaEstampa("larga", true) === "aberta" && estadoDaEstampa("larga", false) === "recolhida");
t("media: sempre recolhida (F1 a 1280); telefone: estreita", estadoDaEstampa("media", true) === "recolhida" && estadoDaEstampa("telefone", true) === "estreita");
const cenas = fs.readdirSync(path.join(AQUI, "..", "public", "cenas")).filter((f) => f.endsWith(".webp")).map((f) => f.replace(/\.webp$/, "")).sort();
t("as trinta cenas da tabela são as trinta de public/cenas", cenas.length === 30 && JSON.stringify(cenas) === JSON.stringify([...CENAS_DA_ESTAMPA].sort()));
t("a cena é a do bioma; masmorra ganha; bioma sem pintura dá só o título", cenaDaEstampa({ bioma: "floresta" }) === "floresta" && cenaDaEstampa({ bioma: "floresta", emMasmorra: true }) === "masmorra" && cenaDaEstampa({ bioma: "lua" }) === "");
/* 16/11 (a prova jogada): da cidade ao Ossuário o nome trocou e a pintura ficou a da cidade; ao sair
   da cripta voltou à da cidade. A cena sai do lugar onde o herói está — a mesma fonte do nome. */
{
  const mundo = [{ nome: "Ossuário de Vel", bioma: "pantano" }, { nome: "Cripta Funda", bioma: "colina" }];
  t("na estrada, o chão da estrada (não a cidade de onde partiu)", cenaDaEstampa({ bioma: "planicie", jornada: { para: "Ossuário de Vel", terreno: "pantano" } }) === "pantano");
  t("estrada sem chão pintado cai na cidade", cenaDaEstampa({ bioma: "planicie", jornada: { para: "X", terreno: "" } }) === "planicie");
  t("à boca de uma masmorra do mundo, a masmorra (o mesmo nome, sem acento nem caixa)", cenaDaEstampa({ bioma: "planicie", lugar: { nome: "ossuario de vel" }, masmorras: mundo }) === "masmorra");
  t("ao sair da cripta, diante da porta, continua a da masmorra — não a cidade", cenaDaEstampa({ bioma: "planicie", emMasmorra: false, lugar: { nome: "Cripta Funda" }, masmorras: mundo }) === "masmorra");
  t("outro lugar com bioma próprio, esse; sem ele, o da cidade", cenaDaEstampa({ bioma: "planicie", lugar: { nome: "Fazenda", bioma: "floresta" } }) === "floresta" && cenaDaEstampa({ bioma: "planicie", lugar: { nome: "Fazenda" } }) === "planicie");
  t("null e lixo não estouram", cenaDaEstampa(null) === "" && cenaDaEstampa({ lugar: null, jornada: null, masmorras: null }) === "");
  const app = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
  t("a fiação passa a estrada, o lugar e as masmorras do mundo", /cenaDaEstampa\(\{ bioma, emMasmorra: [^}]*jornada: jornadaRef\.current, lugar: lugarRef\.current, masmorras: masmorrasAqui \}\)/.test(app));
}
t("na masmorra o halo sai das tochas, com teto", luzDaMesa({ emMasmorra: true, tochas: 2 }).haloRaio === 200 && luzDaMesa({ emMasmorra: true, tochas: 99 }).haloRaio === LUZ_DA_MESA.masmorra.haloRaio.teto);
t("à noite o véu da página é 8 %; nunca passa de 12 %", luzDaMesa({ hora: 22 }).veuDaPagina === 0.08 && luzDaMesa({ emMasmorra: true }).veuDaPagina <= 0.12);

sec("4 · o render das três zonas");
const ENTRADA = `
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MesaCheia, CascaDaMesa, ColunaDoGrupo, ColunaDasPecas, EstampaDaPagina, VeuDaPagina, fundoDaLuz, cssDaPaginaNaMesa, FaixaDoTelefone, BordaDoTelefone, BandejaDeBolso, GavetaDaBandeja } from "./painel-mesa.jsx";
import { DesenhoDoEscudo } from "./pecas-da-mesa.jsx";
import { TiraDaMesa, ObjetoDaMesa } from "./painel-mesa-do-mestre.jsx";
import { tipoDaNota, TIPO_DA_NOTA } from "./painel-relato.jsx";
export const html = (el) => renderToStaticMarkup(el);
export { React, MesaCheia, CascaDaMesa, ColunaDoGrupo, ColunaDasPecas, EstampaDaPagina, VeuDaPagina, fundoDaLuz, cssDaPaginaNaMesa, TiraDaMesa, ObjetoDaMesa, tipoDaNota, TIPO_DA_NOTA, FaixaDoTelefone, BordaDoTelefone, BandejaDeBolso, GavetaDaBandeja, DesenhoDoEscudo };
`;
const saida = path.join(AQUI, `.tmp-painel-mesa-${process.pid}.mjs`);
buildSync({
  stdin: { contents: ENTRADA, resolveDir: SRC, loader: "jsx", sourcefile: "entrada-painel-mesa.jsx" },
  bundle: true, format: "esm", platform: "node", outfile: saida, jsx: "automatic", logLevel: "silent", external: ["react", "react-dom", "react-dom/server", "react/jsx-runtime"],
  loader: { ".js": "jsx", ".webp": "file", ".png": "file" }, define: { "process.env.NODE_ENV": '"production"' },
});
const R = await import(pathToFileURL(saida).href);
fs.rmSync(saida, { force: true });
const h = R.React.createElement;
const heroi = { nome: "Saoirse", legenda: "Ladina · nível 2", retrato: "/r.webp", vida: 18, vidaMax: 18, mana: 6, manaMax: 6, vez: true, aoTocar: () => {} };
const comp = { nome: "Nolan", legenda: "Caçador · nível 2", vida: 9, vidaMax: 18, aoTocar: () => {} };
const objetos = ["livro", "carta", "bolsa", "grimorio"].map((o) => ({ chave: o, objeto: o, aoAbrir: () => {} }));
const pistas = { sabe: 1, de: 2, novo: true, cartas: [{ id: "a", estado: "virada", costas: "o chão", face: "Pegadas de bota ferrada" }, { id: "b", estado: "costas", costas: "uma pessoa" }] };
const mesa = (nome) => {
  const f = COMPOSICAO_DA_MESA.faixas.find((x) => x.nome === nome);
  return R.html(h(R.CascaDaMesa, { tresZonas: true, composicao: f, luz: luzDaMesa({ hora: 22 }),
    esquerda: h(R.ColunaDoGrupo, { composicao: f, heroi, companheiros: [comp], emCena: h("span", null, "Cedric"), quest: { titulo: "O que desce ao anoitecer", atual: "Seguir o rastro" }, pistas, aoAbrirPistas: () => {} }),
    direita: h(R.ColunaDasPecas, { hora: 8, recursos: { racoes: 8, agua: 8, tochas: 4, moedas: 150 }, aoAbrirRecursos: () => {}, aoAbrirTempo: () => {}, objetos }) },
  h("main", null, "a página")));
};
const larga = mesa("larga"), media = mesa("media");
t("a larga desenha as três zonas com a grelha da tabela (316 · 600–680 · 300)", larga.includes('data-mesa-cheia="larga"') && larga.includes("grid-template-columns:316px minmax(600px, 680px) 300px"));
t("a media com a da 1280 (292 · 500–600 · 292)", media.includes("grid-template-columns:292px minmax(500px, 600px) 292px"));
t("o grupo de pé: duas cartas de 140 com PV e PM em contas", (larga.match(/data-estado=/g) || []).length >= 2 && larga.includes("width:140px"));
t("a carta do herói diz a vida e a magia por extenso", larga.includes("Saoirse: 18 de 18 de vida, 6 de 6 de magia"));
t("em cena, a nota da quest e as pistas (a virada e a por virar)", larga.includes(">Em cena<") && larga.includes("O que desce ao anoitecer") && larga.includes('data-pista="virada"') && larga.includes('data-pista="costas"'));
t("a 1280 a carta de pista sai e o rótulo fica (a porta do quadro continua)", !media.includes("data-pista=") && media.includes("Pistas · 1 de 2"));
t("as quatro pilhas e a vela", (larga.match(/data-recurso=/g) || []).length === 4 && larga.includes("A vela: Dia · 08:00"));
t("os quatro objetos pousados, o grimório incluído", ["O livro", "A carta", "A bolsa", "O grimório"].every((n) => larga.includes(`aria-label="${n}"`)));
t("a bandeja tem lugar no feltro mesmo vazia", larga.includes("data-bandeja-no-feltro") && larga.includes("A bandeja espera o dado."));
t("a noite traz o véu sobre a página (8 %)", larga.includes('data-veu-da-pagina="0.08"'));
t("o fundo da luz é tabela: feltro do modo, halo e penumbra", R.fundoDaLuz(luzDaMesa({ hora: 22 })).backgroundColor === LUZ_DA_MESA.noite.feltro && /radial-gradient\(circle 400px/.test(R.fundoDaLuz(luzDaMesa({ hora: 22 })).backgroundImage));
const tamanhos = [...larga.matchAll(/font-size:(\d+(?:\.\d+)?)px/g)].map((m) => Number(m[1]));
t("nenhuma letra fixa abaixo de 12 px na mesa (o piso vem de letraDaMesa: max(12, …))", tamanhos.every((n) => n >= 12), tamanhos.filter((n) => n < 12).join(","));
t("o piso de nome é 13 e o de rótulo 12, depois do multiplicador", larga.includes("max(13px, calc(13px * var(--tv-texto, 1)))") && larga.includes("max(12px, calc(12px * var(--tv-texto, 1)))"));
t("nada de mono na mesa (fora da folha de estilo, que é quem a desliga)", !/Mono|tv-mono/.test(larga.replace(/<style>[\s\S]*?<\/style>/g, "")));
t("no feltro a letra é ink ou inkMeio (inkDim sai do feltro)", !larga.includes("inkDim"));
const fora = R.html(h(R.CascaDaMesa, { tresZonas: false }, h("main", null, "só a página")));
t("fora das três zonas a casca devolve só a página (e veste a mono da folha de Spectral)", fora.includes("só a página") && !fora.includes("data-mesa-cheia") && fora.includes("[data-tv-pagina] .tv-mono"));
const css = R.cssDaPaginaNaMesa();
t("o pé veste a forma do F1: ofertas em papel, a pílula vira a linha da pena", css.includes("O que o mundo oferece agora") && css.includes(".tv-pilula-do-campo") && css.includes("border-bottom: 1px solid"));
const est = R.html(h(R.EstampaDaPagina, { estado: "aberta", cena: "floresta", lugar: "Monte Profundo", sub: "de manhã", aoTocar: () => {} }));
t("a estampa diz o lugar, pinta a cena e abre o horizonte ao toque", est.includes("Monte Profundo") && est.includes("/cenas/floresta.webp") && est.includes("Abrir o horizonte."));
t("sem lugar, nada de estampa", R.html(h(R.EstampaDaPagina, { lugar: "" })) === "");

sec("5 · o Códex com porta a 375");
t("o grimório entra na ordem da tira do telefone", HUD_DA_MESA.telefone.objetos.ordem.includes("codex"));
const tira = R.html(h(R.TiraDaMesa, { heroi: { nome: "Saoirse", vida: 10, vidaMax: 10 }, objetos: [{ id: "diario", rotulo: "Diário", aoTocar: () => {} }, { id: "codex", rotulo: "Códex", aoTocar: () => {} }] }));
t("a tira do telefone desenha a porta do Códex", tira.includes("Códex"));
t("o objeto da tira continua a ser a mesma peça (ObjetoDaMesa)", typeof R.ObjetoDaMesa === "function");

sec("6 · a voz do sistema na folha");
t("ganho: XP e moedas", R.tipoDaNota("+17 XP — você leu o chão").tipo === "ganho" && R.tipoDaNota("Achou 12 moedas").tipo === "ganho");
t("conquista é selo (o lacre)", R.tipoDaNota("Conquista desbloqueada: o primeiro passo").lacre === "conquista");
t("o impedido é aviso; a lei do mundo é regra", R.tipoDaNota("qualquer", "impedido").tipo === "aviso" && R.tipoDaNota("A lei deste mundo: todo juramento obriga").tipo === "regra");
t("a tabela termina sempre numa regra (nenhuma linha fica sem tipo)", R.TIPO_DA_NOTA[R.TIPO_DA_NOTA.length - 1].tipo === "regra");
const relato = ler("painel-relato.jsx");
t("o relato já não escreve mono (as linhas, a dobra, a luta)", !/className="[^"]*tv-mono/.test(relato) && !relato.includes("fontSize: TIPOS.maquina"));
t("a linha do sistema é NotaDoMestre; a porta é tira de papel com seta", relato.includes("<NotaDoMestre tipo={nota.tipo}>") && relato.includes("background: T.ossoLume"));

sec("7 · a fiação no App");
const APP = ler("App.jsx");
/* V4b (16/11): no telefone a faixa de 48 do F1 toma o lugar da barra; a barra de antes
   fica só de rede, quando os dados da mesa calam (antes: «a barra de topo só fora da
   mesa larga», que deixou de ser verdade — fora da mesa larga quem aparece é a faixa). */
t("fora da mesa larga, a faixa; a barra só se os dados da mesa calarem", /\{!mesaLarga && dadosDaMesaCheia \? \(\s*<LimiteDasFichas key="v4b-faixa">\s*<FaixaDoTelefone/.test(APP) && /\) : !mesaLarga \? \(\s*<LimiteDasFichas>\s*<BarraDoMestre/.test(APP));
t("o trilho antigo e a coluna do grupo de TL 3 saíram", !APP.includes('<nav aria-label="Painéis"') && !APP.includes('<aside aria-label="O grupo" className="shrink-0'));
t("a casca abraça a página", APP.includes("<CascaDaMesa tresZonas={!!(mesaLarga && dadosDaMesaCheia)}") && /<\/main>\s*<\/CascaDaMesa>/.test(APP));
t("os dados da mesa em calou", /const dadosDaMesaCheia = \(\(\) => \{[\s\S]{0,200}try \{/.test(APP) && APP.includes('calou("V4 · a mesa cheia", e)'));
t("a mesa larga é a das três zonas (useMesaLarga lê a composição)", /function useMesaLarga\(\) \{\s*return temTresZonas\(useComposicaoDaMesa\(\)\.nome\);/.test(APP));
t("as portas de antes continuam: a vela abre o tempo, as pistas o quadro, a estampa o horizonte", APP.includes("aoAbrirTempo={() => { try { setTempoAberto((v) => !v);") && APP.includes("aoAbrirPistas={alternarOQuadro}") && APP.includes("calou(\"V4 · a estampa abre o horizonte\""));
t("a ligação partida deixou a mono (papel com aro de cera, nota do Mestre)", APP.includes('{falha.linha && <NotaDoMestre tipo="aviso">{falha.linha}</NotaDoMestre>}'));

/* 16/11 (a prova jogada a 375): a carta do herói abria com a placa do nome vazia e preta, e o
   nome do lugar saía cortado no topo («Ossuário …», ~100 px numa linha só). */
console.log("\n8 · o telefone: a placa e o nome do lugar (16/11)");
{
  const ficha = fs.readFileSync(new URL("../src/painel-ficha-carta.jsx", import.meta.url), "utf8");
  t("no telefone a carta é a carta com placa, e o nome pousa nela", /<CartaComPlaca p=\{p\} largura=\{FICHA_CARTA\.carta\.telefone\} lex=\{lex\} telefone \/>/.test(ficha) && /soNome/.test(ficha));
  t("e ao lado ficam a classe e o nível, sem repetir o nome", /<QuemE p=\{p\} tamanho=\{FICHA_CARTA\.nome\.telefone\} semNome \/>/.test(ficha));
  const barra = fs.readFileSync(new URL("../src/painel-mesa-do-mestre.jsx", import.meta.url), "utf8");
  t("o nome do lugar no telefone quebra em até duas linhas, sem corte numa linha só",
    /WebkitLineClamp: BARRA_LETRA\.lugar\.linhas/.test(barra) && /telefone \? "tv-display" : "tv-display truncate"/.test(barra));
  t("o nome longo desce para a letra longa (≥ piso 13)", /telefoneLongo: (1[3-9])/.test(barra));
}

/* V4b (16/11/2026) — A MESA NO CELULAR. O público chega por link no celular, e a 375 a
   tela estava pela metade do redesenho: a barra e a tira antigas, dois botões âmbar
   juntos, sem a cena no alto da página, sem a casa da bandeja. Medido por CDP a 375 × 812
   (IA muda): a prosa útil passou de 372 px (com a fila das pistas) a 424, um âmbar só,
   cinco portas de 70 × 68, nenhum texto abaixo de 12 px, sem rolagem lateral. */
console.log("\n9 · a mesa no celular (V4b)");
{
  const MT = MESA_NO_TELEFONE;
  t("as medidas do F1 a 375: faixa 48, retratos de 44, borda 76", MT.faixa.alto === 48 && MT.faixa.retrato === 44 && MT.borda.alto === 76);
  t("cinco portas, nesta ordem: Livro · Carta · Bolsa · Grimório · Escudo", JSON.stringify(MT.borda.portas) === JSON.stringify(["livro", "carta", "bolsa", "grimorio", "escudo"]));
  t("cada porta tem 70 × 68 (alvo ≥ 44 nos dois lados)", MT.borda.porta.largura === 70 && MT.borda.porta.alto === 68 && Math.min(MT.borda.porta.largura, MT.borda.porta.alto) >= 44);
  t("a bandeja de bolso tem 56 × 48 com feltro 46 × 38 e o dado a 40 (F2)", MT.bolso.largura === 56 && MT.bolso.alto === 48 && MT.bolso.feltro.largura === 46 && MT.bolso.feltro.alto === 38 && MT.bolso.dado === 40);
  t("a página a 8 das bordas, prosa com margens de 18", MT.pagina.margem === 8 && MT.pagina.prosa === 18);
  t("768, 800 e 1024 são a estreita (página a 680, centrada); 375 e 390, o telefone", ["768", "800", "1024"].every((w) => composicaoDaJanela(+w).nome === "estreita") && composicaoDaJanela(390).nome === "telefone");

  const faixa = R.html(h(R.FaixaDoTelefone, { heroi, companheiros: [comp, { nome: "Terceiro", vida: 5, vidaMax: 5 }], recursos: { racoes: 8, agua: 8, tochas: 4, moedas: 150 }, hora: "08:10", prazo: "falta 1 noite", falaDaHora: "O tempo, de manhã", aoAbrirTempo: () => {}, aoAbrirRecursos: () => {} }));
  t("a faixa: dois retratos (o terceiro fica de fora), com PV e PM por extenso", (faixa.match(/Abrir a ficha\./g) || []).length === 2 && faixa.includes("Saoirse: 18 de 18 de vida, 6 de 6 de magia") && !faixa.includes("Terceiro"));
  t("a faixa: as quatro pilhas e a vela com a hora e o prazo", (faixa.match(/data-pilha=/g) || []).length === 4 && faixa.includes(">08:10<") && faixa.includes("data-prazo") && faixa.includes("falta 1 noite"));
  t("a faixa tem 48 de altura", faixa.includes("height:48px"));

  const objetosTel = ["livro", "carta", "bolsa", "grimorio"].map((o) => ({ chave: o, objeto: o, aoAbrir: () => {}, erguido: o === "carta" }));
  const borda = R.html(h(R.BordaDoTelefone, { objetos: objetosTel, aoAbrirEscudo: () => {} }));
  t("a borda: as cinco portas, todas presentes e tocáveis", ["livro", "carta", "bolsa", "grimorio", "escudo"].every((p) => borda.includes(`data-porta="${p}"`)) && !borda.includes("disabled"));
  t("a borda: cada porta tem nome acessível e rótulo escrito", ["Livro", "Carta", "Bolsa", "Grimório", "Escudo"].every((n) => borda.includes(`>${n}<`)) && borda.includes("O escudo do Mestre"));
  t("a porta aberta diz que está aberta", /data-porta="carta" aria-label="Carta" aria-expanded="true"/.test(borda));
  t("o escudo é o mesmo desenho do canto (DesenhoDoEscudo)", typeof R.DesenhoDoEscudo === "function" && borda.includes("M32 22l7 4v8l-7 4-7-4v-8z"));
  t("sem objetos a porta fica, mas não finge que abre", (() => { const b = R.html(h(R.BordaDoTelefone, { objetos: [] })); return (b.match(/data-porta=/g) || []).length === 5 && (b.match(/disabled=""/g) || []).length === 5; })());

  /* um âmbar por tela: nada da faixa, da borda ou do bolso pinta o chão de âmbar —
     a ação principal (o dizer, ou o «Tentar de novo» da falha) é a única */
  const vazia = R.html(h(R.BandejaDeBolso, { lancamentos: [] }));
  const cheia = R.html(h(R.BandejaDeBolso, { lancamentos: [{ n: 3, dados: [{ faces: 20, valor: 14 }], desfecho: "sucesso" }] }));
  const amb = new RegExp("background:\\s*" + T.amber.replace("#", "#?"), "i");
  t("um âmbar só: a faixa, a borda e o bolso não pintam âmbar", ![faixa, borda, vazia, cheia].some((x) => amb.test(x)));
  t("as propostas no pé vestem o papel (osso), não o âmbar, também no telefone", (() => { const c = R.cssDaPaginaNaMesa("[data-mesa-telefone]", 18); return c.includes("[data-mesa-telefone] [aria-label='O que o mundo oferece agora'] button { background: " + T.ossoLume) && c.includes("padding-inline: 18px"); })());
  t("o bolso: vazio diz que espera; cheio diz o último dado", vazia.includes('data-bandeja-de-bolso="vazia"') && cheia.includes('data-bandeja-de-bolso="cheia"') && cheia.includes("o último deu 14") && vazia.includes("width:56px;height:48px"));
  t("o bolso mostra o de antes enquanto o lance novo rola (emVoo)", R.html(h(R.BandejaDeBolso, { emVoo: true, lancamentos: [{ n: 4, dados: [{ faces: 20, valor: 2 }] }, { n: 3, dados: [{ faces: 20, valor: 14 }] }] })).includes("o último deu 14"));

  const fechada = R.html(h(R.GavetaDaBandeja, { aberta: false }, h("span", null, "historico")));
  const aberta = R.html(h(R.GavetaDaBandeja, { aberta: true, aoFechar: () => {} }, h("span", null, "historico")));
  t("a gaveta fechada fica montada, escondida e fora da leitura", fechada.includes('data-gaveta-da-bandeja="fechada"') && fechada.includes('aria-hidden="true"') && fechada.includes("translateY(110%)") && fechada.includes("historico"));
  t("a gaveta aberta sobe da borda (260 ms) e fecha ao toque fora (o véu)", aberta.includes("translateY(0)") && aberta.includes("data-veu-da-gaveta") && MT.gaveta.sobe === 260 && MT.gaveta.curva === "cubic-bezier(.2,.8,.2,1)" && aberta.includes("bottom:" + MT.borda.alto + "px"));

  const est = R.html(h(R.EstampaDaPagina, { estado: "estreita", cena: "floresta", lugar: "Monte Profundo", sub: "de manhã", aoTocar: () => {}, bolso: h("span", { "data-um-bolso": "" }) }));
  t("no telefone a estampa leva a cena e o bolso na ponta (dois botões irmãos)", est.includes("data-estampa-com-bolso") && est.includes("/cenas/floresta.webp") && est.includes("data-um-bolso") && est.includes("Abrir o horizonte."));

  const tel = (nome) => R.html(h(R.CascaDaMesa, { telefone: true, composicao: COMPOSICAO_DA_MESA.faixas.find((x) => x.nome === nome), luz: luzDaMesa({ hora: 9 }), borda: h("nav", { "data-borda-do-telefone": "" }), gaveta: h("i", { "data-g": "" }) }, h("main", null, "a página")));
  /* o React escreve o > da folha de estilo como &gt; no HTML do servidor; o navegador lê > */
  const c375 = tel("telefone").replace(/&gt;/g, ">").replace(/&#x27;/g, "'"), c800 = tel("estreita");
  t("a casca do telefone: a página, a gaveta e a borda, e o pé do F1 por CSS", c375.includes('data-mesa-telefone="telefone"') && c375.includes("a página") && c375.includes("data-g") && c375.includes("data-borda-do-telefone") && c375.includes("[data-mesa-telefone] .tv-pilula-do-campo"));
  t("entre 768 e 1179 a página para em 680 (+ as margens de 8), centrada; no telefone, sem teto", c800.includes("max-width:696px") && !c375.includes("max-width:696px"));
  t("quando o Mestre pede o dado, «Rolar» é o âmbar da tela (F2-375-1)", c375.includes("[aria-label='O Mestre pede o dado'] button[aria-label^='Rolar'] { background: " + T.amber));
  t("o nome do lugar no bolso corta com reticências (F2: faixa − bolso)", c375.includes("tv-estampa-no-telefone figcaption > span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }"));
  t("a janela baixa: deitada, a borda vira trilho à direita; com o teclado, sai de vista", c375.includes("@media (max-height: 519px) and (min-width: 568px)") && c375.includes("flex-direction: row !important") && c375.includes("@media (max-height: 519px) and (max-width: 567px) { [data-mesa-telefone] > [data-borda-do-telefone] { display: none; }"));
  t("a régua da janela baixa é tabela (≥ 6 linhas de 28)", MT.janelaBaixa.linhasMinimas === 6 && MT.janelaBaixa.entrelinha === 28 && MT.janelaBaixa.alto === 520);
  const tam = [...(faixa + borda + cheia + est).matchAll(/font-size:(\d+(?:\.\d+)?)px/g)].map((m) => Number(m[1]));
  t("nenhuma letra fixa abaixo de 12 px no telefone (o piso vem de letraDaMesa)", tam.every((n) => n >= 12), tam.filter((n) => n < 12).join(","));
  t("nada de mono na faixa, na borda e no bolso", !/Mono|tv-mono/.test(faixa + borda + cheia));

  const APP = ler("App.jsx");
  t("os dados da mesa valem também no telefone (não pedem mais a mesa larga)", APP.includes('if (fase !== "jogo" || !personagem || emBatalha) return null;') && !APP.includes('if (fase !== "jogo" || !personagem || !mesaLarga || emBatalha) return null;'));
  t("a casca do telefone abraça a página com a borda e a gaveta, caladas", APP.includes("telefone={!!(!mesaLarga && dadosDaMesaCheia)}") && APP.includes('<LimiteDasFichas key="v4b-borda">') && APP.includes('<LimiteDasFichas key="v4b-gaveta">') && APP.includes('calou("V4b · abrir o escudo pela porta"'));
  t("a tira de 72 só de rede, quando os dados da mesa calam", /\{!mesaLarga && !dadosDaMesaCheia \? \(\s*<LimiteDasFichas key="tira-da-mesa">/.test(APP));
  t("o bolso abre a gaveta em calou; o dado já não se repete na soleira", APP.includes('calou("V4b · o bolso abre a gaveta"') && APP.includes("if (!mesaLarga && !dadosDaMesaCheia && !lanceNoAr && bandeja[0]"));
  t("o teclado virtual encolhe a página, não a cobre (interactive-widget)", fs.readFileSync(path.join(AQUI, "..", "index.html"), "utf8").includes("interactive-widget=resizes-content"));

  /* a 1440, o resto */
  const f1440 = COMPOSICAO_DA_MESA.faixas[0];
  const sem = R.html(h(R.ColunaDoGrupo, { composicao: f1440, heroi, companheiros: [comp], emCena: null, ninguemEmCena: true }));
  t("a 1440 sem ficha em cena a zona fica, o lugar vazio sem palavra (a cobertura passa de 68 a 71 %)", sem.includes(">Em cena<") && sem.includes("data-em-cena-vazio") && !sem.includes("Ninguém") && sem.includes("min-height:" + COMPOSICAO_DA_MESA.esquerda.emCenaVazio.alto + "px"));
  t("na fogueira (ninguemEmCena falso) a zona não aparece", !R.html(h(R.ColunaDoGrupo, { composicao: f1440, heroi, emCena: null })).includes("Em cena"));
  const tempo = APP.slice(APP.indexOf("function OPainelDoTempo("), APP.indexOf("R13-B · O TOPO DO PAPEL"));
  t("o painel do tempo veste a letra da mesa: nada de mono nem da letra de máquina", tempo.length > 500 && !tempo.includes("tv-mono") && !tempo.includes("TIPOS.maquina") && tempo.includes('letraDaMesa("rotulo")'));
  const rel = ler("painel-relogios.jsx");
  t("os prazos do painel saem dos 8 e 11 px (sobem ao piso)", !rel.includes("text-[8px]") && !rel.includes("text-[11px]"));
}

console.log(`\n${bons} ok, ${maus} falharam`);
process.exit(maus ? 1 : 0);
