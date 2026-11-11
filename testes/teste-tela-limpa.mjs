/* teste-tela-limpa.mjs (TL, 07/11/2026) — a tela limpa: a prosa é o jogo
   (mente/formas.md §TL; Figma 306:2).

   A pessoa, com a foto do telefone na v9.618: «veja só como fica poluída a
   tela». Na foto não se via uma linha de prosa. A TL junta a barra do topo e o
   ecrã do Mestre numa faixa, dá UM lugar ao momento e recolhe a mesa do
   telefone numa tira. Esta suíte prova o que é do `aprendiz` (TL 9):

   1. as tabelas da TL 8 estão em estilo.js com a forma que a secção dá;
   2. a régua da TL 2, a parte que é tabela: as linhas de prosa à vista a
      375 × 667 saem das alturas das peças (≥ 16 no turno normal, ≥ 14 com o
      momento) e a linha do telefone tem os 327 px do Figma;
   3. a tira, a 375: nenhum número passa da borda (a conta da largura, com a
      letra mono medida), e nenhum número mora num nó que corta;
   4. a soleira do momento: uma coisa de cada vez, pela prioridade; o
      veredito e o preço nunca se cortam; o pedido do Mestre (o cartão real do
      motor) chega inteiro;
   5. os rótulos acessíveis de cada peça: a barra, o Em cena, a tira, a mesa
      puxada — o que sai da vista fica no nome;
   6. a página é a folha: a folha saiu da resposta e o relato pinta na tinta
      do papel.

   O JSX não corre em Node: a suíte empacota um ponto de entrada com o esbuild
   (o mesmo que o vite usa) e lê o HTML de renderToStaticMarkup, como a
   teste-ar-pecas. */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { buildSync } from "esbuild";
import {
  T, TIPOS, ALVOS, HUD_DA_MESA, SOLEIRA_DO_MOMENTO, EM_CENA, TIRA_DA_MESA, HORIZONTE_DA_CENA, DADO_DE_USO_NA_MESA,
  PAGINA, FOLHA_DO_MESTRE, ESBATIMENTO, BORDA_DA_MESA, RUNA, FOLHA, MOLDURA_POR_DEGRAU,
} from "../src/estilo.js";
import { oCartaoDoPedido, O_MESTRE_PEDE } from "../src/motor/o-mestre-pede.js";
import { razao as razaoRgb, rgb } from "./conta-da-luz.mjs";
const razao = (a, b) => razaoRgb(rgb(a), rgb(b));

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? "\n      " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const AQUI = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(AQUI, "..", "src");
const ler = (f) => fs.readFileSync(path.join(SRC, f), "utf8");

/* ============================================================ */
sec("1. as tabelas da TL 8");
{
  const M = HUD_DA_MESA.mesa, F = HUD_DA_MESA.telefone;
  t("a mesa: a barra (56) e três colunas a 72 do topo, folga 32",
    M.barra.alto === 56 && M.barra.velaAlta === 40 && M.topo === 72 && M.folga === 32 && M.colunas.join(" ") === "236px minmax(560px, 600px) 120px");
  t("a mesa: barra · grupo|livro|objetos · grupo|momento|objetos · grupo|campo|objetos — e a fila de baixo saiu",
    M.areas.join("/") === "barra barra barra/grupo livro objetos/grupo momento objetos/grupo campo objetos"
    && M.linhas.join(" ") === "56px 1fr auto 48px" && !M.areas.some((a) => a.includes("cartas")));
  t("o grupo: 236 de largo, as cartas a 0,9 com 12 entre elas, a Bandeja 20 abaixo com teto 300",
    M.grupo.largura === 236 && M.grupo.cartas.heroi === 0.9 && M.grupo.cartas.companheiro === 0.9 && M.grupo.cartas.entre === 12
    && M.grupo.bandeja.acima === 20 && M.grupo.bandeja.teto === 300);
  /* a carta do grupo na coluna: 0,9 da carta da mesa (a do componente do
     Figma), que é o que fecha com os 117,9 px de 309:1795 */
  t("o grupo cabe na coluna: as duas cartas a 0,9 lado a lado ≤ 236",
    Math.round(0.9 * (M.cartas.heroi + M.cartas.companheiro) * 212) + M.grupo.cartas.entre <= M.grupo.largura);
  t("a mesa baixa: abaixo de 800, as cartas do grupo a 0,8", M.baixa.abaixoDe === 800 && M.baixa.cartas.heroi === 0.8 && M.baixa.cartas.companheiro === 0.8);
  t("o telefone: barra · livro · momento · campo · tira, com 48 · 1fr · auto · 48 · 72",
    F.areas.join(" ") === "barra livro momento campo tira" && F.linhas.join(" ") === "48px 1fr auto 48px 72px");
  t("o telefone: a barra 48 com a vela 28, o vão 8, a página 2 além da borda, 16 dos lados, 12 em cima e 8 em baixo",
    F.barra.alto === 48 && F.barra.velaAlta === 28 && F.vao === 8 && F.livro.margem === 2 && F.livro.enchimento === 16 && F.livro.cima === 12 && F.livro.baixo === 8);
  t("a soleira do momento: 56 (ALVOS.chamado), vão 8, raio 10, enchimento 14",
    SOLEIRA_DO_MOMENTO.alto === ALVOS.chamado && ALVOS.chamado === 56 && SOLEIRA_DO_MOMENTO.vao === 8 && SOLEIRA_DO_MOMENTO.raio === 10 && SOLEIRA_DO_MOMENTO.enchimento === 14);
  /* MOVIDA (08/11, BQ): a escolha de uma quest entra entre o dado e a oferta
     (formas.md §BQ 2) — é a quest que já se aceitou a pedir uma decisão, e
     passa à frente da porta nova; a rolagem e o dado continuam primeiro.
     A suíte da BQ (teste-bq-tela) prova a escolha na soleira renderizada. */
  /* MC (10/11, formas.md §MC 5): o chamado do Mestre passa à frente de tudo;
     a «rolagem» de hoje fica logo atrás, de passagem, até o oficial mudar o
     pedido do Mestre para «chamado» (§MC 7, 2.2) — então sai daqui também. */
  t("a prioridade: o chamado > a rolagem > o dado que pousou > a escolha > a oferta", SOLEIRA_DO_MOMENTO.prioridade.join(">") === "chamado>rolagem>dado>escolha>proposta");
  t("o principal: onAccent sobre amber, o verbo Spectral 500 16/20, o preço mono 12/16, o d20 28",
    SOLEIRA_DO_MOMENTO.principal.chao === T.amber && SOLEIRA_DO_MOMENTO.principal.letra === T.onAccent
    && SOLEIRA_DO_MOMENTO.principal.verbo.tamanho === 16 && SOLEIRA_DO_MOMENTO.principal.verbo.peso === 500 && SOLEIRA_DO_MOMENTO.principal.verbo.entrelinha === 20
    && SOLEIRA_DO_MOMENTO.principal.preco.tamanho === TIPOS.maquina && SOLEIRA_DO_MOMENTO.principal.preco.entrelinha === 16 && SOLEIRA_DO_MOMENTO.principal.dado === 28);
  t("o secundário: panel com aro lineStrong", SOLEIRA_DO_MOMENTO.secundario.chao === T.panel && SOLEIRA_DO_MOMENTO.secundario.aro === T.lineStrong);
  t("o dado mostra-se o tempo do dado de uso (1 600 ms) — nenhum tempo novo",
    SOLEIRA_DO_MOMENTO.mostraODado === DADO_DE_USO_NA_MESA.rolar.mostra && SOLEIRA_DO_MOMENTO.mostraODado === 1600);
  t("em cena: rostos de 32, aro 2, sobrepostos 8, no máximo 3, alvo 48",
    EM_CENA.rosto === 32 && EM_CENA.aro === 2 && EM_CENA.sobrepoe === 8 && EM_CENA.mostra === 3 && EM_CENA.alvo === ALVOS.piso);
  t("em cena: ficam de fora a pessoa do grupo e o lugar onde se está", EM_CENA.fora.join() === "pessoaDoGrupo,aqui");
  /* as variantes de fora têm de existir em fichas.js — senão o filtro tira nada */
  const fichas = ler("fichas.js");
  t("e as duas variantes existem em fichas.js", EM_CENA.fora.every((v) => fichas.includes(`"${v}"`)));
  t("a tira: 72, a fila a 13, lados 10 e 6", TIRA_DA_MESA.alto === 72 && TIRA_DA_MESA.cima === 13 && TIRA_DA_MESA.lado.join() === "10,6");
  t("a tira: a pega 36 × 4 a 5 do topo, em inkDim a 0,7",
    TIRA_DA_MESA.pega.largura === 36 && TIRA_DA_MESA.pega.alto === 4 && TIRA_DA_MESA.pega.cima === 5 && TIRA_DA_MESA.pega.cor === T.inkDim && TIRA_DA_MESA.pega.alfa === 0.7);
  t("a tira: o herói 44 (aro 2, nível 18, até três gemas), o companheiro 34",
    TIRA_DA_MESA.heroi.retrato === 44 && TIRA_DA_MESA.heroi.aro === 2 && TIRA_DA_MESA.heroi.nivel === 18 && TIRA_DA_MESA.heroi.gemas === 3 && TIRA_DA_MESA.companheiro.retrato === 34);
  t("a tira: os objetos num alvo 48 × 56 com o desenho a 40, sem rótulo",
    TIRA_DA_MESA.objeto.alvo.largura === ALVOS.piso && TIRA_DA_MESA.objeto.alvo.alto === 56 && TIRA_DA_MESA.objeto.desenho === 40 && TIRA_DA_MESA.objeto.rotulo === false);
  t("a fila da tira cabe na tira: 13 + 56 ≤ 72", TIRA_DA_MESA.cima + TIRA_DA_MESA.objeto.alvo.alto <= TIRA_DA_MESA.alto);
  t("a mesa puxada: 340, raio 14, véu 0,55, as cartas do telefone, os objetos a 0,62, o dado a 28, 220 ms",
    TIRA_DA_MESA.puxada.alto === 340 && TIRA_DA_MESA.puxada.raio === 14 && TIRA_DA_MESA.puxada.veu === 0.55 && TIRA_DA_MESA.puxada.cartas === "telefone"
    && TIRA_DA_MESA.puxada.objetos === 0.62 && TIRA_DA_MESA.puxada.dado === 28 && TIRA_DA_MESA.puxada.dura === 220);
  t("a mesa puxada lê as cartas do telefone que a tabela diz", !!HUD_DA_MESA[TIRA_DA_MESA.puxada.cartas] && HUD_DA_MESA.telefone.cartas.heroi > 0);
  t("o objeto na puxada é o da mesa a 0,62: 59,5 × 74,4 (Figma 307:1188)",
    Math.abs(M.objetos.alvo.largura * TIRA_DA_MESA.puxada.objetos - 59.52) < 0.01 && Math.abs(M.objetos.alvo.alto * TIRA_DA_MESA.puxada.objetos - 74.4) < 0.01);
  t("o horizonte: ao chegar no relato, a pedido numa gaveta (96 / 48), em viagem preso; 220 ms",
    HORIZONTE_DA_CENA.aoChegar === "relato" && HORIZONTE_DA_CENA.aPedido === "gaveta" && HORIZONTE_DA_CENA.emViagem === "preso"
    && HORIZONTE_DA_CENA.gaveta.mesa === 96 && HORIZONTE_DA_CENA.gaveta.telefone === 48 && HORIZONTE_DA_CENA.gaveta.dura === 220);
  const U = DADO_DE_USO_NA_MESA.telefone;
  t("o dado de uso no telefone: 22, os glifos 8/11/11/9, alvo 76 × 56, debaixo da tira",
    U.dado === 22 && U.glifo[10] === 8 && U.glifo[8] === 11 && U.glifo[6] === 11 && U.glifo[4] === 9 && U.alvo.largura === 76 && U.alvo.alto === 56 && U.debaixoDos === "tira");
  t("três colunas de 24 com 2 entre elas são os 76 do alvo, e o dado de 22 cabe na coluna",
    3 * TIRA_DA_MESA.mantimentos.coluna + 2 * TIRA_DA_MESA.mantimentos.entre === U.alvo.largura && TIRA_DA_MESA.mantimentos.dado === U.dado && U.dado <= TIRA_DA_MESA.mantimentos.coluna);
  t("a página é a folha: 12 / 8 no telefone, 16 / 16 na mesa; os lados 16 e 26 da folha",
    PAGINA.cima === 12 && PAGINA.baixo === 8 && PAGINA.mesa.cima === 16 && PAGINA.mesa.baixo === 16 && FOLHA_DO_MESTRE.ladoTelefone === 16 && FOLHA_DO_MESTRE.lado === 26);
  t("o enchimento de cima nunca desce do esbatimento (12 e 12 — o do Figma)", PAGINA.cima >= ESBATIMENTO.altura && PAGINA.mesa.cima >= ESBATIMENTO.altura && ESBATIMENTO.altura === 12);
}

/* ============================================================ */
sec("2. a régua da TL 2, a parte que é tabela (375 × 667)");
{
  /* a linha de prosa: a letra da prosa × a entrelinha (27,625) */
  const linha = TIPOS.prosa * PAGINA.entrelinha;
  const F = HUD_DA_MESA.telefone;
  /* de cima para baixo (Figma 307:103): a barra, a borda da mesa (a página
     nasce a 54), a página, o vão, o campo, o vão, a tira */
  const pagina = (alto, momento) => alto - F.barra.alto - BORDA_DA_MESA.telefone - F.vao - parseInt(F.linhas[3], 10) - F.vao - TIRA_DA_MESA.alto
    - (momento ? SOLEIRA_DO_MOMENTO.alto + F.vao : 0);
  const linhas = (alto, momento) => (pagina(alto, momento) - PAGINA.cima - PAGINA.baixo) / linha;
  t(`a página a 375 × 667 mede 477 no turno normal e 413 com o momento (o Figma)`, pagina(667, false) === 477 && pagina(667, true) === 413, `${pagina(667, false)} / ${pagina(667, true)}`);
  /* A CATRACA DA TL 2: ≥ 16 no normal e ≥ 14 em qualquer estado — subiu da
     meta da mente (≥ 8) para guardar o que se ganhou. Medida no navegador é
     da prova de quem liga; aqui prende-se a parte que é tabela. */
  t(`≥ 16 linhas de prosa no turno normal (${linhas(667, false).toFixed(1)})`, linhas(667, false) >= 16);
  t(`≥ 14 linhas com o momento por cima do campo (${linhas(667, true).toFixed(1)})`, linhas(667, true) >= 14);
  t(`a 375 × 812: ≥ 21 / ≥ 19 (${linhas(812, false).toFixed(1)} / ${linhas(812, true).toFixed(1)})`, linhas(812, false) >= 21 && linhas(812, true) >= 19);
  /* a largura: a borda 6 + a margem 2 de cada lado, e os 16 da folha */
  const largura = 375 - 2 * (BORDA_DA_MESA.telefone + F.livro.margem) - 2 * FOLHA_DO_MESTRE.ladoTelefone;
  t(`a linha da prosa a 375 tem 327 px (eram 259: três molduras uma dentro da outra)`, largura === 327, String(largura));
}

/* ============================================================
   3 a 6 · O QUE SE VÊ — empacota-se um ponto de entrada e renderiza-se. */
const ENTRADA = `
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BarraDoMestre, TiraDaMesa, MesaPuxada, PrateleiraDosMantimentos } from "./painel-mesa-do-mestre.jsx";
import { EmCena } from "./painel-fichas.jsx";
import { SoleiraDoMomento, Prosa, DivisoriaRunica } from "./ui.jsx";
import { PropostaDaFrase, momentoDaProposta } from "./painel-proposta.jsx";
import { Relato } from "./painel-relato.jsx";
export const html = (el) => renderToStaticMarkup(el);
export { React, BarraDoMestre, TiraDaMesa, MesaPuxada, PrateleiraDosMantimentos, EmCena, SoleiraDoMomento, Prosa, DivisoriaRunica, PropostaDaFrase, momentoDaProposta, Relato };
`;
const saida = path.join(AQUI, `.tmp-tela-limpa-${process.pid}.mjs`);
buildSync({
  stdin: { contents: ENTRADA, resolveDir: SRC, loader: "jsx", sourcefile: "entrada-tela-limpa.jsx" },
  bundle: true, format: "esm", platform: "node", outfile: saida, /* automatic: painel-proposta.jsx não importa o React (o vite usa o runtime automático) */
  jsx: "automatic", logLevel: "silent", external: ["react", "react/jsx-runtime", "react-dom", "react-dom/server"],
  loader: { ".js": "jsx" }, define: { "process.env.NODE_ENV": '"production"' },
});
const R = await import(pathToFileURL(saida).href);
fs.rmSync(saida, { force: true });
const h = R.React.createElement;
const html = (c, p) => R.html(h(c, p));
const texto = (s) => s.replace(/<[^>]+>/g, " ").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/\s+/g, " ");
const desfaz = (s) => s.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");

const HEROI = { nome: "Ilvara Sem-Medo", semente: "ilvara", nivel: 20, vida: 132, vidaMax: 140, mana: 1, manaMax: 30 };
const COMPANHEIRO = { nome: "Brann", semente: "brann", nivel: 7, vida: 14, vidaMax: 31, mana: 11, manaMax: 12 };
const OBJETOS = [
  { id: "diario", rotulo: "Diário" }, { id: "mapa", rotulo: "Mapa" }, { id: "inv", rotulo: "Bolsa", legenda: "12 moedas", novo: true },
];
const MANT = { dados: { racoes: 10, agua: 10, tochas: 6 }, contagens: { racoes: 10, agua: 10, tochas: 5 } };

/* ============================================================ */
sec("3. a tira, a 375: nenhum número passa da borda");
{
  const s = html(R.TiraDaMesa, { heroi: HEROI, grupo: [COMPANHEIRO], destino: 2, objetos: OBJETOS, mantimentos: MANT, rotuloDoHeroi: "Ilvara Sem-Medo, nível 20, 132 de 140 PV" });
  const tx = texto(s);
  t("o herói: 132, 1 e o Destino 2 à vista, e o nível 20", /\b132\b/.test(tx) && /\b1\b/.test(tx) && /\b2\b/.test(tx) && /\b20\b/.test(tx));
  t("o companheiro: 14 e 11", /\b14\b/.test(tx) && /\b11\b/.test(tx));
  t("os mantimentos: ×10 ×10 ×5", (tx.match(/×10/g) || []).length === 2 && tx.includes("×5"));
  /* nenhum número mora num nó que corta (reticência ou overflow escondido) */
  const cortantes = [...s.matchAll(/<span[^>]*style="[^"]*(text-overflow:ellipsis|overflow:hidden)[^"]*"[^>]*>([^<]*)<\/span>/g)].map((m) => m[2]).filter((x) => /\d/.test(x));
  t("nenhum número da tira mora num nó que corta", cortantes.length === 0, cortantes.join(" | "));
  /* A CONTA DA LARGURA a 375, com a letra mono medida (JetBrains Mono: 0,6 em
     de avanço; a 12 px, 7,2 px por algarismo) e os piores números de um
     herói de nível 20: PV com 3 algarismos, PM com 2, o Destino com 1; o
     companheiro 2 e 2; os mantimentos ×10. */
  const av = 0.6 * TIPOS.maquina;
  const gemaH = (n) => HUD_DA_MESA.gema.mesa + 4 + n * av;          /* a gema, o vão, o número */
  const gemaC = (n) => HUD_DA_MESA.gema.telefone + 4 + n * av;
  const heroi = TIRA_DA_MESA.heroi.retrato + TIRA_DA_MESA.heroi.entre + Math.max(gemaH(3), gemaH(2), gemaH(1));
  const comp = Math.max(TIRA_DA_MESA.companheiro.retrato, gemaC(2) + 4 + gemaC(2), ALVOS.piso);
  const objetos = 3 * TIRA_DA_MESA.objeto.alvo.largura;
  const mant = DADO_DE_USO_NA_MESA.telefone.alvo.largura;
  const fila = TIRA_DA_MESA.lado[0] + heroi + comp + objetos + mant + TIRA_DA_MESA.lado[1];
  t(`a fila cabe nos 375 (${fila.toFixed(1)} px — o Figma mede 354)`, fila <= 375, `${fila}`);
  t("o herói é um alvo de 82 × 56 (TL 6)", Math.round(heroi) <= 82 && TIRA_DA_MESA.objeto.alvo.alto === 56);
  t("a contagem «×10» cabe na coluna de 24", 3 * av <= TIRA_DA_MESA.mantimentos.coluna);
  t("o nível de dois algarismos cabe no disco de 18 (a letra no piso, 12)", 2 * 0.6 * TIPOS.piso <= TIRA_DA_MESA.heroi.nivel);
  t("o herói e a pega ficam fora do que rola de lado",
    s.indexOf('data-tira="heroi"') < s.indexOf("tv-scroll") && s.indexOf("A mesa: as cartas") < s.indexOf("tv-scroll"));
}

/* ============================================================ */
sec("4. a soleira do momento");
{
  const longo = "Aceitar: parar para rezar no caminho da ermida antes que a luz se vá de vez";
  const proposta = { verbo: longo, cede: "Martim Cinzentos conta contigo", preco: "5 min", aoPrincipal: () => {}, secundario: { quantos: 2, aoTocar: () => {} } };
  const s = html(R.SoleiraDoMomento, { momentos: { proposta } });
  t("a oferta: 56 de alto, o verbo e o preço", s.includes(`height:${ALVOS.chamado}px`) && s.includes("5 min") && s.includes("Martim Cinzentos conta contigo"));
  /* O PREÇO NUNCA ENCURTA: o nó do preço não encolhe, não quebra e não corta */
  const preco = (s.match(/<span data-momento-preco=""[^>]*style="([^"]*)"/) || [])[1] || "";
  t("o nó do preço não encolhe nem corta", /flex-shrink:0/.test(preco) && /white-space:nowrap/.test(preco) && !/overflow:hidden/.test(preco) && !/text-overflow/.test(preco), preco);
  const cede = (s.match(/<span data-momento-cede=""[^>]*style="([^"]*)"/) || [])[1] || "";
  t("e é a outra metade que cede (reticência)", /text-overflow:ellipsis/.test(cede) && /min-width:0/.test(cede));
  t("o nome acessível leva o verbo inteiro e o preço", desfaz(s).includes(`aria-label="${longo}. Martim Cinzentos conta contigo · 5 min"`));
  t("o secundário: «+2 ofertas», com nome acessível", /\+(<!-- -->)?2</.test(s) && s.includes("ofertas") && s.includes('aria-label="Mais 2 ofertas"'));
  t("o principal é âmbar com a letra onAccent (8,68)", razao(T.onAccent, T.amber) >= 8.6 && s.includes(`background:${T.amber}`) && s.includes(`color:${T.onAccent}`));
  t("o secundário passa: ink sobre panel e inkMeio sobre panel", razao(T.ink, T.panel) >= 4.5 && razao(T.inkMeio, T.panel) >= 4.5);
  t("sem momento, 0 px", html(R.SoleiraDoMomento, { momentos: {} }) === "" && html(R.SoleiraDoMomento, { momentos: null }) === "");

  /* O PEDIDO DO MESTRE, com o cartão real do motor: «Olhar à volta», d20 + 3, precisa de 13 */
  const pedido = O_MESTRE_PEDE.pedidos.find((p) => p.id === "chegada");
  const cartao = oCartaoDoPedido({ chave: "chegada|x|1", frase: pedido.frase(), verbo: pedido.verbo() }, { tipo: "teste", dc: 13 }, { mod: 3, pericia: "Percepção" });
  const m = R.momentoDaProposta(cartao, { preco: cartao.preco });
  t("o pedido vira Momento=rolagem: «Rolar d20 + 3 · Olhar à volta»", m && m.qual === "rolagem" && m.momento.verbo === "Rolar d20 + 3 · Olhar à volta", JSON.stringify(m && m.momento.verbo));
  t("o veredito antes do clique: «Percepção» cede, «precisa de 13» é o nó que não encolhe", m.momento.cede === "Percepção" && m.momento.preco === "precisa de 13");
  t("o recuo é «Agora não»", m.momento.secundario.rotulo === "Agora não");
  const r = html(R.PropostaDaFrase, { proposta: cartao, preco: cartao.preco, compacta: true });
  t("a proposta compacta do pedido desenha a soleira, com o d20 e o dado inteiro no nome",
    r.includes('data-momento="rolagem"') && r.includes("<svg") && desfaz(r).includes('aria-label="Rolar d20 + 3 · Olhar à volta. Percepção · precisa de 13"') && r.includes("Agora não"));
  /* a frase do jogador: fechada é a soleira (o toque abre); aberta, o cartão de sempre */
  const frase = { verbo: "Ir até o mercado", frase: "vou ao mercado", confirmar: "Ir", linhas: ["a 5 min daqui"], glifo: "mapa" };
  const f1 = html(R.PropostaDaFrase, { proposta: frase, preco: "5 min", compacta: true });
  t("a frase do jogador, compacta: o verbo, a frase entre aspas que cede, o preço", f1.includes('data-momento="proposta"') && f1.includes("«vou ao mercado»") && f1.includes("5 min") && f1.includes("Reescrever"));
  const f2 = html(R.PropostaDaFrase, { proposta: frase, preco: "5 min", compacta: true, aberta: true });
  t("aberta, é o cartão de sempre (as linhas e o verbo de mesa)", !f2.includes("data-momento") && f2.includes("a 5 min daqui") && f2.includes("Ir · 5 min"));
  t("sem `compacta`, a peça é a de ontem", !html(R.PropostaDaFrase, { proposta: frase, preco: "5 min" }).includes("data-momento"));

  /* A PRIORIDADE: uma coisa de cada vez */
  const rolagem = m.momento;
  const dado = { chave: 7, conteudo: h("span", { "data-lance": "" }, "15 · passa"), rotulo: "Percepção, 15, passa" };
  const p1 = html(R.SoleiraDoMomento, { momentos: { proposta, rolagem, dado } });
  t("rolagem + dado + oferta: só a rolagem", p1.includes('data-momento="rolagem"') && !p1.includes("data-lance") && !p1.includes("5 min"));
  const p2 = html(R.SoleiraDoMomento, { momentos: { proposta, dado } });
  t("dado + oferta: o dado que acabou de pousar", p2.includes('data-momento="dado"') && p2.includes("data-lance") && p2.includes('aria-label="Percepção, 15, passa"') && !p2.includes("5 min"));
  t("o dado não pede toque: é um estado (role=status)", p2.includes('role="status"'));
}

/* ============================================================ */
sec("5. os rótulos acessíveis");
{
  const b = desfaz(html(R.BarraDoMestre, { telefone: true, lugar: "Cova Escuro", luz: "Dia", hora: "08:10", minuto: 490, ameaca: 0 }));
  t("a barra (telefone): o lugar é um botão que abre o horizonte", b.includes('aria-label="Cova Escuro. Abrir o horizonte."') && b.includes('aria-expanded="false"'));
  t("a hora é um botão (O TEMPO), e a luz vai no nome", b.includes('aria-label="O tempo, Dia, 08:10"'));
  t("a barra do telefone mede 48; a ameaça 0 não nasce", b.includes(`height:${HUD_DA_MESA.telefone.barra.alto}px`) && !b.includes("Ameaça"));
  const bm = desfaz(html(R.BarraDoMestre, { lugar: "Cova Escuro", cena: "1.º andar · a cripta", luz: "Dia", hora: "08:10", minuto: 490, ameaca: 1, clima: { glifo: "noite", rotulo: "nublado" } }));
  t("a barra (mesa): 56, LUGAR, HORA «Dia · 08:10», AMEAÇA «1 de 3»",
    bm.includes(`height:${HUD_DA_MESA.mesa.barra.alto}px`) && bm.includes(">Lugar<") && bm.includes(">Hora<") && bm.includes("Dia · 08:10") && texto(bm).includes("1 de 3") && bm.includes('aria-label="Ameaça, 1 de 3"'));
  t("na mesa a linha da masmorra vai por baixo do lugar; o clima vai no nome da hora",
    bm.includes("1.º andar · a cripta") && bm.includes("Cova Escuro") && bm.includes('aria-label="O tempo, Dia, 08:10, nublado"'));
  const bt = desfaz(html(R.BarraDoMestre, { telefone: true, lugar: "Cova Escuro", cena: "1.º andar · a cripta", hora: "08:10" }));
  t("no telefone a masmorra SUBSTITUI o nome do lugar (e o nome acessível diz os dois)",
    texto(bt).includes("1.º andar · a cripta") && bt.includes('aria-label="Cova Escuro, 1.º andar · a cripta. Abrir o horizonte."'));
  t("a ranhura do Em cena entra na barra", html(R.BarraDoMestre, { telefone: true, lugar: "x", emCena: h("i", { "data-ranhura": "" }) }).includes("data-ranhura"));

  const gente = [
    { id: "a", tipo: "pessoa", nome: "Conrado Sem-Senhor" }, { id: "b", tipo: "pessoa", nome: "Mécia dos Juncos" },
    { id: "c", tipo: "pessoa", nome: "Martim Cinzentos" }, { id: "d", tipo: "coisa", nome: "As ataduras" }, { id: "e", tipo: "lugar", nome: "A ermida" },
    { id: "f", tipo: "pessoa", nome: "Brann", variante: "pessoaDoGrupo" }, { id: "g", tipo: "lugar", nome: "Cova Escuro", variante: "aqui" },
  ];
  const e = desfaz(html(R.EmCena, { itens: gente }));
  t("em cena: «Em cena: Conrado Sem-Senhor, Mécia dos Juncos, Martim Cinzentos e mais 2. Abrir.»",
    e.includes('aria-label="Em cena: Conrado Sem-Senhor, Mécia dos Juncos, Martim Cinzentos e mais 2. Abrir."'));
  t("três rostos e o «+2»; a pessoa do grupo e o lugar onde se está ficam de fora",
    (e.match(/data-em-cena="/g) || []).length === 3 && /\+(<!-- -->)?2</.test(e) && !e.includes("Brann") && !e.includes("Cova Escuro"));
  t("é UM botão, de 48 de alto, que abre a gaveta", (e.match(/<button/g) || []).length === 1 && e.includes(`min-height:${EM_CENA.alvo}px`) && e.includes('aria-haspopup="dialog"'));
  t("dois em cena: «A e B»", desfaz(html(R.EmCena, { itens: gente.slice(0, 2) })).includes('aria-label="Em cena: Conrado Sem-Senhor e Mécia dos Juncos. Abrir."'));
  t("a coisa pelo glifo, num disco panelSoft", desfaz(html(R.EmCena, { itens: [gente[3]] })).includes(`background:${T.panelSoft}`));
  t("ninguém em cena: 0 px", html(R.EmCena, { itens: [] }) === "" && html(R.EmCena, { itens: null }) === "" && html(R.EmCena, { itens: gente.slice(5) }) === "");

  const tira = desfaz(html(R.TiraDaMesa, { heroi: HEROI, grupo: [COMPANHEIRO], destino: 2, objetos: OBJETOS, mantimentos: MANT }));
  t("a tira: o nome do herói sai da vista e fica no nome acessível", !texto(tira).includes("Ilvara") && tira.includes('aria-label="Ilvara Sem-Medo, nível 20, PV 132, PM 1, Destino 2"'));
  t("o companheiro: «Brann, 14 de 31 PV»", tira.includes('aria-label="Brann, 14 de 31 PV"') && !texto(tira).includes("Brann"));
  t("os objetos sem rótulo à vista, e com ele no nome (e a novidade dita)",
    !texto(tira).includes("Diário") && tira.includes('aria-label="Diário"') && tira.includes('aria-label="Bolsa, 12 moedas, há coisa nova"'));
  t("os objetos da tira num alvo 48 × 56", tira.includes(`min-width:${TIRA_DA_MESA.objeto.alvo.largura}px;min-height:${TIRA_DA_MESA.objeto.alvo.alto}px`));
  t("os mantimentos: um botão, com o nome da prateleira", tira.includes('aria-label="Mantimentos: rações 10, dado de dez; água 10, dado de dez; tochas 5, dado de seis. Abrir na Bolsa."'));
  t("a pega é um botão que abre a mesa", tira.includes('aria-label="A mesa: as cartas, a Bandeja e os objetos"') && tira.includes('aria-haspopup="dialog"'));
  t("a tira mede 72, com o fio de ouro por cima", tira.includes(`height:${TIRA_DA_MESA.alto}px`) && tira.includes(`border-top:1px solid ${MOLDURA_POR_DEGRAU.ouro.meio}`));

  t("a mesa puxada fechada não existe", html(R.MesaPuxada, { aberta: false, heroi: HEROI }) === "");
  const mp = desfaz(html(R.MesaPuxada, { aberta: true, heroi: HEROI, grupo: [COMPANHEIRO], objetos: OBJETOS, mantimentos: MANT, bandeja: h("div", { "data-bandeja": "" }) }));
  t("aberta: um diálogo modal, com nome, por cima de um véu", mp.includes('role="dialog"') && mp.includes('aria-modal="true"') && mp.includes('aria-label="A mesa"') && mp.includes("tv-veu-da-mesa"));
  t("a folha sobe: 340 de alto, raio 14, com a classe do movimento", mp.includes(`height:${TIRA_DA_MESA.puxada.alto}px`) && mp.includes(`border-top-left-radius:${TIRA_DA_MESA.puxada.raio}px`) && mp.includes("tv-mesa-sobe"));
  t("lá dentro: as cartas, a Bandeja, os objetos COM rótulo e os mantimentos a 28",
    mp.includes("data-bandeja") && texto(mp).includes("Diário") && texto(mp).includes("Mapa") && mp.includes('aria-label="Fechar a mesa"')
    && mp.includes(`width:${TIRA_DA_MESA.puxada.dado}px;height:${TIRA_DA_MESA.puxada.dado}px`));
  t("e a puxada tem os glifos do dado de 28 para cada face", [10, 8, 6, 4].every((f) => TIRA_DA_MESA.puxada.glifo[f] > 0));

  /* 08/11 · o fim do dia (formas.md §AR 12, 294:4493): o App põe o último lance
     de uso em «mantimentos.lancamento», e a tira e a mesa puxada passam-no à
     prateleira — o nome do botão diz o que saiu. */
  const LANCE = { papel: "uso", n: 7, rotulo: "Os mantimentos", dados: [{ faces: 10, valor: 1 }, { faces: 10, valor: 7 }], usos: ["racoes", "agua"] };
  const comLance = { ...MANT, lancamento: LANCE };
  const lanceNaTira = desfaz(html(R.TiraDaMesa, { heroi: HEROI, objetos: OBJETOS, mantimentos: comLance }));
  const lanceNaPuxada = desfaz(html(R.MesaPuxada, { aberta: true, heroi: HEROI, objetos: OBJETOS, mantimentos: comLance }));
  t("o lance de uso chega à prateleira da tira e da mesa puxada (no nome do botão)",
    lanceNaTira.includes("tochas 5, dado de seis. Rações: 1, perdeu uma; água: 7. Abrir na Bolsa.\"")
    && lanceNaPuxada.includes("Rações: 1, perdeu uma; água: 7. Abrir na Bolsa.\""));
}

/* ============================================================ */
sec("6. a página é a folha");
{
  const p = html(R.Prosa, { texto: "A estrada desce.\n\nMartim espera." });
  t("a prosa já não traz a folha (o pergaminho é a página)", !p.includes("tv-folha") && p.includes(`color:${T.tintaDoPergaminho}`));
  t("a folha de estilo: .tv-folha é o papel, sem enchimento; .tv-pagina leva o enchimento da TL",
    /\.tv-folha \{[^}]*background-color:[^}]*\}/.test(FOLHA) && !/\.tv-folha \{[^}]*padding/.test(FOLHA)
    && FOLHA.includes(`.tv-pagina {\n  padding: ${PAGINA.cima}px ${FOLHA_DO_MESTRE.ladoTelefone}px ${PAGINA.baixo}px;`)
    && FOLHA.includes(`.tv-pagina { padding: ${PAGINA.mesa.cima}px ${FOLHA_DO_MESTRE.lado}px ${PAGINA.mesa.baixo}px; }`));
  const runa = html(R.DivisoriaRunica, { respiro: 0, naFolha: true });
  t("a runa na folha: o losango em brasa e os fios em pergaminhoBorda (307:811)",
    runa.includes('data-runa="folha"') && runa.includes(`background:${T.brasaNoPergaminho}`) && runa.includes(`width:${RUNA.naFolha.fio}px`) && runa.includes(`background:${T.pergaminhoBorda}`));
  t("e a brasa passa no papel (6,71)", razao(T.brasaNoPergaminho, T.pergaminho) >= 4.5);
  const rel = html(R.Relato, { mensagens: [{ autor: "jogador", texto: "Sigo o Martim pela estrada." }, { autor: "mestre", texto: "A estrada desce." }] });
  t("a tua fala na folha: tinta meia em itálico, na letra da prosa, com o filete de 2 em tintaDim (sem caixa)",
    rel.includes(`color:${T.tintaDoPergaminhoMeio}`) && rel.includes(`border-left:2px solid ${T.tintaDoPergaminhoDim}`) && rel.includes(`font-size:${TIPOS.prosa}px`) && !rel.includes(`background:${T.paginaAlta}`));
  t("e passa no papel (7,78 e 6,56)", razao(T.tintaDoPergaminhoMeio, T.pergaminho) >= 4.5 && razao(T.tintaDoPergaminhoDim, T.pergaminho) >= 3);
  t("a resposta começa pela runa da folha, com o botão de ouvir em tinta", rel.includes('data-runa="folha"') && rel.includes("Ouvir o Mestre") && rel.includes(`color:${T.tintaDoPergaminhoMeio}`));
  t("sem horizonte, nada do horizonte", !rel.includes("data-horizonte"));
  const dados = null;
  t("horizonte sem dados: 0 px (calado)", !html(R.Relato, { mensagens: [{ autor: "mestre", texto: "x" }], horizonte: { i: 0, dados } }).includes("data-horizonte"));
}

console.log(`\ntela-limpa: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
