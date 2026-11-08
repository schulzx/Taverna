/* teste-bq-tela.mjs (BQ, 08/11/2026) — as quests na tela: a encruzilhada e
   o Diário das duas histórias (formas.md «## BQ · as quests na tela»).

   Prova, com as peças renderizadas de verdade (o JSX empacota-se com o
   esbuild, como no teste-ar-pecas, e lê-se o HTML de renderToStaticMarkup):
   1. as tabelas de §BQ 8 em estilo.js, só com cores de T, e os pares de
      letra de §BQ 6 acima do piso; os quatro glifos desenhados;
   2. o veredito antes do clique — cada carta mostra as duas faces, o preço,
      o «acaba aqui», e o botão diz o preço no verbo;
   3. os dois toques — tocar numa carta nunca confirma; só o botão, com uma
      carta escolhida, chama aoConfirmar;
   4. o risco de vida com o rosto — o aro e a faixa, o nome por extenso, o
      rosto; e a soleira vermelha;
   5. a soleira aprende a escolha, pela prioridade;
   6. o Diário com uma quest de cada tipo — a estrada e quem anda contigo, o
      que falta (≤ 2 de um «ou»), os caminhos, a gente, a reviravolta (por
      ler no topo, lida na linha), a estante com desfecho e luto;
   7. o cartaz que não passa da camada — nem o nome antes do rosto, nem o
      plano antes da guerra, mesmo que o dado chegue;
   8. os rótulos acessíveis, e o sistema não fala de si (nem «quest», nem
      «predicado», nem «camada» no que se lê). */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { buildSync } from "esbuild";
import {
  T, ALVOS, ENCRUZILHADA, GRAVIDADE_DA_ESCOLHA, DIARIO_DA_QUEST, CARTAZ_DA_SOMBRA, SOLEIRA_DO_MOMENTO,
  ETAPA_DA_MISSAO, DIARIO_DE_MISSOES, MOLDURA_POR_DEGRAU, MOVIMENTO_CSS,
} from "../src/estilo.js";
import { GLIFOS } from "../src/glifos.js";
import { razao, rgb } from "./conta-da-luz.mjs";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? "\n      " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const AQUI = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(AQUI, "..", "src");

/* ============================================================ */
sec("1. as tabelas de §BQ 8, as cores e os glifos");
{
  const E = ENCRUZILHADA, G = GRAVIDADE_DA_ESCOLHA;
  t("a encruzilhada: 900 com até três cartas, 1060 com quatro; véu 0,55", E.mesa.largura.ate3 === 900 && E.mesa.largura.com4 === 1060 && E.veu === 0.55);
  t("a carta: 216 na mesa, 331 no telefone; a escolhida sobe 8 com aro âmbar 3", E.carta.largura.mesa === 216 && E.carta.largura.telefone === 331 && E.carta.escolhida.sobe === 8 && E.carta.escolhida.espessura === 3 && E.carta.escolhida.aro === T.amber);
  t("o botão de confirmar tem o piso de toque", E.confirmar.alto === ALVOS.piso);
  t("o movimento: dar 180 (60 entre), escolher 120, folha 220", E.movimento.dar.dura === 180 && E.movimento.dar.entre === 60 && E.movimento.escolher.dura === 120 && E.movimento.folha.dura === 220);
  t("a gravidade, da mais grave à mais leve", G.ordem.join(">") === "vida>fecha>preco>leve");
  t("a soleira: a escolha entre o dado e a oferta, com o glifo da encruzilhada e o chão danger na vida",
    SOLEIRA_DO_MOMENTO.prioridade.join(">") === "rolagem>dado>escolha>proposta" && SOLEIRA_DO_MOMENTO.escolha.glifo === "encruzilhada" && SOLEIRA_DO_MOMENTO.escolha.vida.chao === T.danger);
  t("a etapa que virou: rosa, com o glifo da reviravolta", ETAPA_DA_MISSAO.virou && ETAPA_DA_MISSAO.virou.aro === T.rosa && ETAPA_DA_MISSAO.virou.glifo === "reviravolta");
  const L = DIARIO_DE_MISSOES.lombada;
  t("a lombada: frisos de bronze no desfecho, de ferro no luto; o selo do coração e a fita",
    L.corDoFriso.desfecho === MOLDURA_POR_DEGRAU.bronze.meio && L.corDoFriso.luto === MOLDURA_POR_DEGRAU.ferro.meio && L.seloDe.desfecho.glifo === "coracao" && L.seloDe.luto.glifo === "fita");
  t("o que falta: até dois de um «ou», e o resto calado", DIARIO_DA_QUEST.falta.doOu === 2 && DIARIO_DA_QUEST.falta.resto === "ou outro caminho" && DIARIO_DA_QUEST.falta.conta.max === 5);
  t("o cartaz: 420, três linhas à vista, «Alguém» sem nome", CARTAZ_DA_SOMBRA.largura === 420 && CARTAZ_DA_SOMBRA.linhas === 3 && CARTAZ_DA_SOMBRA.semNome === "Alguém");

  /* toda cor das tabelas novas é de T (ou um metal da moldura, que é tabela) */
  const deT = new Set([...Object.values(T), ...Object.values(MOLDURA_POR_DEGRAU).flatMap((m) => [m.claro, m.meio, m.escuro, m.brilho])]);
  const cores = [];
  const varrer = (o, onde) => { for (const [k, v] of Object.entries(o || {})) { if (typeof v === "string" && /^#/.test(v)) cores.push([`${onde}.${k}`, v]); else if (v && typeof v === "object" && !Array.isArray(v)) varrer(v, `${onde}.${k}`); } };
  varrer(ENCRUZILHADA, "ENCRUZILHADA"); varrer(GRAVIDADE_DA_ESCOLHA, "GRAVIDADE"); varrer(DIARIO_DA_QUEST, "DIARIO_DA_QUEST"); varrer(CARTAZ_DA_SOMBRA, "CARTAZ"); varrer(ETAPA_DA_MISSAO.virou, "virou"); varrer(L, "lombada");
  const soltas = cores.filter(([, c]) => !deT.has(c));
  t(`as ${cores.length} cores das tabelas novas são de T ou da moldura`, cores.length > 30 && soltas.length === 0, soltas.map(([n, c]) => `${n}=${c}`).join(", "));
  const RX_HEX = /#[0-9a-fA-F]{3,8}\b|rgba?\(/;
  for (const a of ["painel-encruzilhada.jsx"]) {
    const txt = fs.readFileSync(path.join(SRC, a), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    const m = txt.match(RX_HEX);
    t(`${a}: nenhuma cor solta (só T e as tabelas)`, !m, m ? `achou ${m[0]}` : "");
  }

  /* §BQ 6: os pares de letra (≥ 4,5) e de forma (≥ 3) */
  const LETRA = [
    ["a prosa da carta tinta / pergaminho", T.tintaDoPergaminho, T.pergaminho],
    ["GANHAS musgo / pergaminho", T.musgoNoPergaminho, T.pergaminho],
    ["CUSTA perigo / pergaminho", T.perigoNoPergaminho, T.pergaminho],
    ["COM BRASH lacre / pergaminho", T.lacreNoPergaminho, T.pergaminho],
    ["a faixa da vida ink / perigoFundo", T.ink, T.perigoFundo],
    ["a ficha do preço amberSoft / couro", T.amberSoft, T.couro],
    ["a impedida ink / perigoFundo", T.ink, T.perigoFundo],
    ["a soleira e o botão da vida onAccent / danger", T.onAccent, T.danger],
    ["a tag escolhida onAccent / amber", T.onAccent, T.amber],
    ["a nota da reviravolta rosa / couro", T.rosa, T.couro],
    ["a nota da reviravolta rosa / panel", T.rosa, T.panel],
    ["quem traiu danger / couro", T.danger, T.couro],
    ["o cartaz ink / couro", T.ink, T.couro],
    ["o cartaz inkMeio / couro", T.inkMeio, T.couro],
    ["o cartaz inkDim / couro", T.inkDim, T.couro],
  ];
  for (const [n, fg, bg] of LETRA) { const r = razao(rgb(fg), rgb(bg)); t(`${n}: ${r.toFixed(2)} ≥ 4,5`, r >= 4.5); }
  const FORMA = [["o aro âmbar da escolhida / panel", T.amber, T.panel], ["o aro danger da vida / panel", T.danger, T.panel]];
  for (const [n, fg, bg] of FORMA) { const r = razao(rgb(fg), rgb(bg)); t(`(forma) ${n}: ${r.toFixed(2)} ≥ 3`, r >= 3); }
  t("o âmbar e o danger nunca são letra sobre o papel (abaixo de 4,5 lá)", razao(rgb(T.amber), rgb(T.pergaminho)) < 4.5 && razao(rgb(T.danger), rgb(T.pergaminho)) < 4.5);

  /* os glifos: desenho da casa, M absoluto, dentro da grelha */
  const quatro = ["encruzilhada", "reviravolta", "fita", "coracao"];
  t("os quatro glifos da BQ estão desenhados na tabela da casa", quatro.every((n) => GLIFOS[n] && GLIFOS[n].de === "casa" && /^M/.test(GLIFOS[n].d) && !/m/.test(GLIFOS[n].d)));
  const nums = (d) => (d.match(/-?\d*\.?\d+/g) || []).map(Number);
  t("e cabem na grelha de 24", quatro.every((n) => nums(GLIFOS[n].d).every((x) => x >= -24 && x <= 24)));

  /* o movimento tem saída no reduce, e a duração mora no CSS */
  const iMedia = MOVIMENTO_CSS.indexOf("@media (prefers-reduced-motion");
  const reduz = MOVIMENTO_CSS.slice(iMedia);
  t("a encruzilhada anima com a duração da tabela", MOVIMENTO_CSS.includes(`.tv-carta-dada { animation: tvCartaDada ${ENCRUZILHADA.movimento.dar.dura}ms`) && MOVIMENTO_CSS.includes(`tvMesaSobe ${ENCRUZILHADA.movimento.folha.dura}ms`));
  t("e aparece seca no reduce (as cartas, a folha, o véu; a escolhida não sobe)",
    /\.tv-carta-dada, \.tv-folha-da-escolha, \.tv-veu-da-escolha \{ animation: none; \}/.test(reduz) && /\.tv-carta-escolha\[aria-pressed="true"\] \{ transform: none; \}/.test(reduz));
}

/* ============================================================
   2 a 8 · O QUE SE VÊ — empacota-se um ponto de entrada e renderiza-se. */
const ENTRADA = `
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Encruzilhada, CartaDaEscolha, CartaVirada, momentoDaEscolha, verboDeConfirmar, gravidadeDe } from "./painel-encruzilhada.jsx";
import { SoleiraDoMomento } from "./ui.jsx";
import { PainelDiario, QuestDoCoracao, CartazDaSombra, linhasDaFalta } from "./painel-diario.jsx";
import { LinhaDoQueFalta, CaminhosDaEtapa, RostoDaHistoria, LombadaDaEstante, EtapaDaMissao } from "./painel-ar-pecas.jsx";
export const html = (el) => renderToStaticMarkup(el);
export { React, Encruzilhada, CartaDaEscolha, CartaVirada, momentoDaEscolha, verboDeConfirmar, gravidadeDe, SoleiraDoMomento,
  PainelDiario, QuestDoCoracao, CartazDaSombra, linhasDaFalta, LinhaDoQueFalta, CaminhosDaEtapa, RostoDaHistoria, LombadaDaEstante, EtapaDaMissao };
`;
const saida = path.join(AQUI, `.tmp-bq-tela-${process.pid}.mjs`);
buildSync({
  stdin: { contents: ENTRADA, resolveDir: SRC, loader: "jsx", sourcefile: "entrada-bq.jsx" },
  bundle: true, format: "esm", platform: "node", outfile: saida, jsx: "transform", logLevel: "silent", external: ["react", "react-dom", "react-dom/server"],
  loader: { ".js": "jsx" }, define: { "process.env.NODE_ENV": '"production"' },
});
const R = await import(pathToFileURL(saida).href);
fs.rmSync(saida, { force: true });
const h = R.React.createElement;
const html = (c, p) => R.html(h(c, p));
const texto = (s) => s.replace(/<[^>]+>/g, " ").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/\s+/g, " ");
/* o picote é o único traço a meia tinta (0,5, da tabela): tirado ele, nada
   na carta pode estar esbatido */
const semPicote = (s) => s.split(`opacity:${ENCRUZILHADA.carta.picote.alfa};background-image:repeating-linear-gradient`).join("");
/* o nome acessível de um nó: os aria-label do HTML */
const rotulos = (s) => [...s.matchAll(/aria-label="([^"]*)"/g)].map((m) => m[1].replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, "&"));
/* percorre a árvore de elementos (sem montar) e devolve os que casam */
const achar = (no, pred, out = []) => {
  if (!no || typeof no !== "object") return out;
  if (Array.isArray(no)) { for (const x of no) achar(x, pred, out); return out; }
  if (no.props) { if (pred(no)) out.push(no); achar(no.props.children, pred, out); }
  return out;
};
/* a encruzilhada é desenhada dentro de um pai que guarda a árvore dela:
   os hooks correm no render do pai (legítimo), e a árvore fica à mão para
   se tocar nos botões sem DOM */
const arvoreDa = (props) => { let arvore = null; R.html(h(function Pai() { arvore = R.Encruzilhada(props); return arvore; })); return arvore; };

/* «O que Gil merece», do Salvo-Conduto, e «Brash e Tomé, frente a frente», da Carta */
const VEREDITO_GIL = {
  chave: "verdade", etapa: "verdade", contexto: "Gil fala a dormir, e o que diz é culpa.",
  opcoes: [
    { id: "entregar", texto: "Entregar Gil a quem o procura", ganha: "A estrada abre-se à tua frente.", custa: "Gil não volta a ver o sol.", custo: 0, podeEscolher: true, gravidade: "fecha", fecha: "falhada" },
    { id: "levar", texto: "Levar Gil até ao fim na mesma", ganha: "Chegas a Alto do Sal com a palavra cumprida.", custa: "Levas pela estrada quem roubou.", custo: 0, podeEscolher: true, gravidade: "leve" },
    { id: "portagem", texto: "Pagar a portagem no Vau", ganha: "Gil passa sem que ninguém tire a lâmina.", custa: "A bolsa fica mais leve.", custo: 60, podeEscolher: true, gravidade: "preco" },
  ],
};
const VEREDITO_BRASH = {
  chave: "frente", etapa: "frente", contexto: "Tomé esperou vinte anos por esta conta.",
  opcoes: [
    { id: "meio", texto: "Pôr-te entre os dois", ganha: "Ninguém puxa de uma lâmina.", custa: "Tomé passa a odiar-te um bocadinho também.", custo: 0, podeEscolher: true, gravidade: "leve" },
    { id: "pagar", texto: "Pagar a dívida de Brash", ganha: "Tomé aceita de ti o que Brash nunca lhe pôde dar.", custa: "O preço sai da tua bolsa.", custo: 60, podeEscolher: false, gravidade: "preco" },
    { id: "antiga", texto: "Deixá-los acertar contas à maneira antiga", ganha: "A conta é deles.", custa: "Só um costuma ir-se embora a andar.", custo: 0, podeEscolher: true, gravidade: "vida", risco: { papel: "companheiro", quem: "Brash", certo: false } },
  ],
};
const rostoDe = (risco) => h("img", { alt: "", src: "rosto.png", "data-quem": risco && risco.quem });

sec("2. o veredito antes do clique");
{
  const s = html(R.Encruzilhada, { aberta: true, veredito: VEREDITO_GIL, quest: "O Salvo-Conduto", titulo: "O que Gil merece", aoConfirmar: () => {}, aoDepois: () => {} });
  const tx = texto(s);
  t("as três cartas, cada uma com as duas faces", VEREDITO_GIL.opcoes.every((o) => tx.includes(o.texto) && tx.includes(o.ganha) && tx.includes(o.custa)));
  t("os rótulos das faces ficam (GANHAS e CUSTA, um por carta)", (tx.match(/Ganhas/g) || []).length >= 3 && (tx.match(/Custa/g) || []).length >= 3);
  t("a cabeça: «Uma escolha · O Salvo-Conduto», o título e o que está em jogo", tx.includes("Uma escolha · O Salvo-Conduto") && tx.includes("O que Gil merece") && tx.includes(VEREDITO_GIL.contexto));
  t("o preço na carta: a ficha «60 da tua bolsa», com a moeda desenhada", /data-ficha="preco"/.test(s) && tx.includes("60 da tua bolsa") && /aria-label="moedas"/.test(s));
  t("o que fecha diz-se na carta: «Esta história acaba aqui.»", tx.includes(GRAVIDADE_DA_ESCOLHA.fecha.frase));
  t("a carta virada diz que há outras maneiras, sem as contar", tx.includes(ENCRUZILHADA.textos.virada.titulo) && /data-carta="virada"/.test(s));
  t("sem carta escolhida, o botão cala: «Escolhe uma carta», desligado", /data-confirmar="calado"/.test(s) && /disabled=""[^>]*data-confirmar="calado"|data-confirmar="calado"[^>]*disabled/.test(s) || (/<button[^>]*disabled=""[^>]*>/.test(s) && tx.includes("Escolhe uma carta")));
  t("o verbo diz a escolha e o preço, por gravidade",
    R.verboDeConfirmar(VEREDITO_GIL.opcoes[1]) === "Escolher: levar Gil até ao fim na mesma"
    && R.verboDeConfirmar(VEREDITO_GIL.opcoes[2]) === "Pagar ◉ 60"
    && R.verboDeConfirmar(VEREDITO_GIL.opcoes[0]) === "Entregar Gil a quem o procura, e acabar aqui"
    && R.verboDeConfirmar(VEREDITO_BRASH.opcoes[2]) === "Escolher, e arriscar Brash");
  t("a mesa: cartão de 1060 com três cartas e a virada (quatro), lado a lado", /min\(1060px/.test(s) && /repeat\(4, minmax\(0, 1fr\)\)/.test(s));
  const tel = html(R.Encruzilhada, { aberta: true, telefone: true, veredito: VEREDITO_GIL, titulo: "O que Gil merece", aoConfirmar: () => {}, aoDepois: () => {} });
  t("o telefone: a folha que sobe, com a pega e o rodapé do campo", /data-encruzilhada="telefone"/.test(tel) && /tv-folha-da-escolha/.test(tel) && texto(tel).includes(ENCRUZILHADA.textos.rodape.telefone));
  t("fechada, a encruzilhada não existe", html(R.Encruzilhada, { aberta: false, veredito: VEREDITO_GIL }) === "" && html(R.Encruzilhada, { aberta: true, veredito: { opcoes: [] } }) === "");
  /* a impedida: não se escolhe, não se esbate, e diz quanto falta */
  const imp = html(R.CartaDaEscolha, { opcao: VEREDITO_BRASH.opcoes[1], bolsa: 48 });
  t("a impedida diz «faltam 12» e não se escolhe (aria-disabled), sem esbater", /data-impedida="sim"/.test(imp) && texto(imp).includes("faltam") && texto(imp).includes("12") && /aria-disabled="true"/.test(imp) && !/opacity/.test(semPicote(imp)));
  t("a frase do jogador que escolhe uma carta: ela vem escolhida, e a frase entre aspas na cabeça",
    /aria-pressed="true"[^>]*aria-label="Entregar Gil/.test(html(R.Encruzilhada, { aberta: true, veredito: VEREDITO_GIL, preEscolhida: "entregar", frase: "entrego-o à guarda" }))
    && texto(html(R.Encruzilhada, { aberta: true, veredito: VEREDITO_GIL, preEscolhida: "entregar", frase: "entrego-o à guarda" })).includes("“entrego-o à guarda”"));
  t("a pré-escolhida impedida não vem escolhida (o preço não se salta)", !/aria-pressed="true"/.test(html(R.Encruzilhada, { aberta: true, veredito: VEREDITO_BRASH, preEscolhida: "pagar" })));
}

sec("3. os dois toques");
{
  const confirmados = [];
  const aoConfirmar = (id) => confirmados.push(id);
  /* antes do primeiro toque */
  const a0 = arvoreDa({ aberta: true, veredito: VEREDITO_GIL, titulo: "O que Gil merece", aoConfirmar, aoDepois: () => {} });
  const cartas0 = achar(a0, (n) => n.type === R.CartaDaEscolha);
  const botao0 = achar(a0, (n) => n.props && n.props["data-confirmar"])[0];
  t("as cartas são três, e o botão de confirmar existe", cartas0.length === 3 && !!botao0);
  t("antes de escolher, o botão está desligado e tocar nele não faz nada", botao0.props.disabled === true && (botao0.props.onClick(), confirmados.length === 0));
  /* o primeiro toque: a carta só escolhe — chama o seu aoTocar, nunca aoConfirmar */
  const escolhas = [];
  const carta = R.CartaDaEscolha({ opcao: VEREDITO_GIL.opcoes[1], aoTocar: (id) => escolhas.push(id) });
  const botaoDaCarta = achar(carta, (n) => n.type === "button")[0];
  botaoDaCarta.props.onClick();
  t("o primeiro toque escolhe a carta e não confirma nada", escolhas.join() === "levar" && confirmados.length === 0);
  t("a carta é um botão com aria-pressed", botaoDaCarta.props["aria-pressed"] === "false");
  /* depois do primeiro toque (a carta escolhida) */
  const a1 = arvoreDa({ aberta: true, veredito: VEREDITO_GIL, titulo: "O que Gil merece", aoConfirmar, aoDepois: () => {}, preEscolhida: "levar" });
  const botao1 = achar(a1, (n) => n.props && n.props["data-confirmar"])[0];
  const escolhida = achar(a1, (n) => n.type === R.CartaDaEscolha && n.props.escolhida);
  t("com a carta escolhida, só ela está marcada", escolhida.length === 1 && escolhida[0].props.opcao.id === "levar");
  t("o botão acende e diz a escolha", botao1.props.disabled === false && texto(R.html(botao1)).includes("Escolher: levar Gil até ao fim na mesma"));
  botao1.props.onClick();
  t("o segundo toque, no botão, confirma a carta escolhida — uma vez", confirmados.join() === "levar");
  const s1 = R.html(h(function P() { return R.Encruzilhada({ aberta: true, veredito: VEREDITO_GIL, preEscolhida: "levar" }); }));
  t("a escolhida leva a tag «A tua escolha», e as outras não se esbatem", texto(s1).includes(ENCRUZILHADA.textos.escolhida) && !/opacity/.test(semPicote(s1)));
  /* Esc e o véu são «Depois» */
  let depois = 0;
  const a2 = arvoreDa({ aberta: true, veredito: VEREDITO_GIL, aoDepois: () => { depois++; } });
  const raiz = achar(a2, (n) => n.props && n.props.onKeyDown)[0];
  raiz.props.onKeyDown({ key: "Escape", stopPropagation() {} });
  const veu = achar(a2, (n) => n.props && /tv-veu-da-escolha/.test(n.props.className || ""))[0];
  veu.props.onClick();
  t("Esc e tocar no véu são «Depois» (a escolha espera)", depois === 2);
  let escreveu = 0;
  const virada = R.CartaVirada({ aoTocar: () => { escreveu++; } });
  achar(virada, (n) => n.type === "button")[0].props.onClick();
  t("a carta virada põe o foco no campo e não escolhe nada", escreveu === 1 && confirmados.length === 1);
}

sec("4. o risco de vida, com o rosto");
{
  const s = R.html(h(function P() { return R.Encruzilhada({ aberta: true, veredito: VEREDITO_BRASH, titulo: "Brash e Tomé, frente a frente", rostoDe, preEscolhida: "antiga" }); }));
  const tx = texto(s);
  t("a carta da vida diz o nome por extenso: «Pode custar a vida de Brash.»", tx.includes("Pode custar a vida de Brash."));
  t("com o rosto de quem pode morrer, na faixa", /data-faixa="vida"/.test(s) && /data-rosto=""/.test(s) && /data-quem="Brash"/.test(s));
  t("o aro de perigo na carta da vida", new RegExp(`data-gravidade="vida"`).test(s));
  t("escolhida, a faixa continua lá, e o botão é vermelho e diz quem", /data-confirmar="vida"/.test(s) && tx.includes("Escolher, e arriscar Brash") && s.includes(`background:${T.danger}`));
  const certo = html(R.CartaDaEscolha, { opcao: { ...VEREDITO_BRASH.opcoes[2], risco: { papel: "companheiro", quem: "Brash", certo: true } } });
  t("quando é o desfecho que ganharia hoje, a frase diz que custa", texto(certo).includes("Com o que há hoje entre vocês, custa a vida de Brash."));
  const semQuem = html(R.CartaDaEscolha, { opcao: { ...VEREDITO_BRASH.opcoes[2], risco: { papel: "companheiro", quem: "" } } });
  t("sem quem, a faixa cala (não se inventa um nome)", !/data-faixa="vida"/.test(semQuem) && R.gravidadeDe({ gravidade: "vida", risco: {} }) === "leve");
  const semRosto = html(R.CartaDaEscolha, { opcao: VEREDITO_BRASH.opcoes[2] });
  t("sem o rosto, a faixa fica com a frase", /data-faixa="vida"/.test(semRosto) && !/data-rosto/.test(semRosto));
}

sec("5. a soleira aprende a escolha");
{
  const m = R.momentoDaEscolha(VEREDITO_GIL, { titulo: "O que Gil merece", aoAbrir: () => {}, aoDepois: () => {} });
  t("momentoDaEscolha: «Decidir · O que Gil merece», o que está em jogo, «3 caminhos»", m.qual === "escolha" && m.momento.verbo === "Decidir · O que Gil merece" && m.momento.cede === VEREDITO_GIL.contexto && m.momento.preco === "3 caminhos" && !m.momento.vida);
  const s = html(R.SoleiraDoMomento, { momentos: { escolha: m.momento } });
  t("na soleira: o verbo, o nó que não encurta, «Depois», e o chão âmbar", /data-momento="escolha"/.test(s) && texto(s).includes("3 caminhos") && texto(s).includes("Depois") && s.includes(`background:${T.amber}`));
  const v = R.momentoDaEscolha(VEREDITO_BRASH, { titulo: "Brash e Tomé, frente a frente" });
  const sv = html(R.SoleiraDoMomento, { momentos: { escolha: v.momento } });
  t("uma escolha que pode matar já é vermelha fechada, e o nó diz quem", v.momento.vida && v.momento.preco === "pode custar Brash" && sv.includes(`background:${T.danger}`) && texto(sv).includes("pode custar Brash"));
  const proposta = { verbo: "Ir ao mercado", preco: "5 min", aoPrincipal: () => {} };
  t("a escolha passa à frente da oferta", /data-momento="escolha"/.test(html(R.SoleiraDoMomento, { momentos: { escolha: m.momento, proposta } })));
  t("e a rolagem passa à frente da escolha", /data-momento="rolagem"/.test(html(R.SoleiraDoMomento, { momentos: { rolagem: { verbo: "Rolar d20 + 3", preco: "precisa de 13" }, escolha: m.momento } })));
  t("sem opções, não há momento", R.momentoDaEscolha(null) === null && R.momentoDaEscolha({ opcoes: [] }) === null);
}

sec("6. o Diário com uma quest de cada tipo");
{
  /* a projeção (missaoDaQuest) e a vista (estadoDaQuest) na forma da BQ 9 */
  const estrada = {
    missao: { id: "quest:salvo_conduto", titulo: "O Salvo-Conduto", tipo: "principal", status: "ativa", descricao: "Gil Ramalho tem de chegar a Alto do Sal com vida.", dador: "",
      etapas: [
        { tipo: "quest", alvo: "Ouvir Gil Ramalho", chave: "salvo_conduto:ouvir", feito: true, feitoEm: 3 },
        { tipo: "quest", alvo: "Sair de Vila Clara com Gil", chave: "salvo_conduto:sair", feito: true, feitoEm: 4 },
        { tipo: "quest", alvo: "Passar o Vau Negro", chave: "salvo_conduto:passo", feito: false, rotulo: "x" },
        { tipo: "quest", alvo: "SEGREDO_DA_ULTIMA", chave: "salvo_conduto:fim", feito: false },
      ], criadaEm: 1, nivel: 0, prazo: 0, recompensa: null },
    estado: {
      id: "salvo_conduto", tipo: 1, titulo: "O Salvo-Conduto", estado: "aberta", visivel: true, gancho: "Gil Ramalho tem de chegar a Alto do Sal com vida.",
      etapa: "passo", etapaTexto: "Passar o Vau Negro", acesa: true,
      feitas: [{ id: "ouvir", dia: 3 }, { id: "sair", dia: 4, como: "Pelo desvio. «Ninguém vos viu passar.»" }],
      falta: [{ predicado: "algum", texto: "…", opcoes: [
        [{ predicado: "derrotou", texto: "vencer quem guarda o Vau Negro" }],
        [{ predicado: "esteve", texto: "achar o desvio pelo pântano" }],
        [{ predicado: "escolheu", texto: "pagar a portagem" }],
      ] }],
      escolhas: ["passo"],
      gente: [{ papel: "protegido", id: "gil", nome: "Gil Ramalho", rotulo: "o protegido", traiu: false }, { papel: "guarda", id: "ilda", nome: "Ilda Seixas", rotulo: "vendeu-te", traiu: true }],
      reviravolta: { id: "ilda", dia: 6, texto: "Ilda Seixas vendeu-te a quem guarda o Vau Negro." },
    },
  };
  const coracao = {
    missao: { id: "quest:carta", titulo: "A Carta Que Não Se Abre", tipo: "trama", status: "ativa", descricao: "Brash leva uma carta que não abre.", dador: "",
      etapas: [
        { tipo: "quest", alvo: "Reparar na carta", chave: "carta:reparar", feito: true, feitoEm: 2 },
        { tipo: "quest", alvo: "Perguntar a Brash pela carta", chave: "carta:perguntar", feito: false },
        { tipo: "quest", alvo: "SEGREDO_DO_CORACAO", chave: "carta:abrir", feito: false },
        { tipo: "quest", alvo: "SEGREDO_DO_FIM", chave: "carta:fim", feito: false },
      ], criadaEm: 1, nivel: 0, prazo: 0, recompensa: null },
    estado: { id: "carta", tipo: 2, estado: "aberta", visivel: true, etapaTexto: "Perguntar a Brash pela carta", comQuem: { id: "brash", nome: "Brash" },
      falta: [{ predicado: "conversou", texto: "falar com Brash junto ao fogo", tem: 1, precisa: 3 }], feitas: [{ id: "reparar", dia: 2 }], escolhas: [], gente: [] },
  };
  const escondida = { missao: { id: "quest:outra", titulo: "Ninguém a vê", tipo: "trama", status: "ativa", etapas: [{ tipo: "quest", alvo: "x", feito: false }] }, estado: { tipo: 2, visivel: false } };
  const desfecho = { missao: { id: "quest:velha", titulo: "A Carta Que Não Se Abre", tipo: "trama", status: "concluida", etapas: [{ tipo: "quest", alvo: "x", feito: true }] },
    estado: { tipo: 2, estado: "terminada", desfecho: "ficou", comQuem: "Brash", comoFicou: "Brash ficou", fecho: { dia: 19, texto: "Brash leu a carta ao fogo, e ficou." } } };
  const luto = { missao: { id: "quest:luto", titulo: "A Conta Velha", tipo: "trama", status: "concluida", etapas: [{ tipo: "quest", alvo: "x", feito: true }] },
    estado: { tipo: 2, estado: "terminada", desfecho: "morreu", luto: true, comQuem: "Brash", comoFicou: "Brash não voltou", fecho: { texto: "Tomé foi-se embora a andar." } } };
  const vilao = { camada: "mao", nome: "Vesper Malho", quemE: "sem nome — mas tem quem o sirva", linhas: [{ texto: "Brás Malho trabalha por ele.", nova: true }, { texto: "Por onde passa, fica um nó de corda.", nova: false }, { texto: "Alguém compra o medo desta região.", nova: false }], plano: null };
  const base = { historia: { estrutura: "jornada" }, quests: [], trocarArco: () => {}, eventos: { global: null, locais: [] }, diaAtual: 7, missoes: [], relogios: [],
    questsDaBiblioteca: [estrada, coracao, escondida, desfecho, luto], rostoDe: (g) => h("img", { alt: "", "data-rosto-de": g && (g.id || g.nome) }), vilaoNoDiario: vilao, rostoDoTenente: h("img", { alt: "", "data-tenente-img": "" }) };

  const mesa = html(R.PainelDiario, { ...base, leiaute: "mesa" });
  const tm = texto(mesa);
  t("o índice separa A ESTRADA e QUEM ANDA CONTIGO", tm.includes(DIARIO_DA_QUEST.indice.estrada) && tm.includes(DIARIO_DA_QUEST.indice.coracao));
  t("a estrada à frente, com a frase da etapa no próximo passo", tm.includes("O próximo passo") && tm.includes("Passar o Vau Negro"));
  const linhas = R.linhasDaFalta(estrada.estado.falta);
  t("de um «ou» de três, dois caminhos — primeiro a carta — e «ou outro caminho»",
    linhas.length === 3 && linhas[0].texto === "pagar a portagem" && linhas[1].texto === "vencer quem guarda o Vau Negro" && linhas[2].estado === "outro");
  t("no Diário: as duas linhas à vista e o terceiro calado", tm.includes("pagar a portagem") && tm.includes("vencer quem guarda o Vau Negro") && tm.includes("ou outro caminho") && !tm.includes("achar o desvio pelo pântano"));
  t("a etapa tomada diz como foi, nas palavras do jogo", /data-caminhos="tomado"/.test(mesa) && tm.includes("Pelo desvio. «Ninguém vos viu passar.»"));
  t("a etapa de agora fecha por mais de um caminho — nunca quais", /data-caminhos="abertos"/.test(mesa) && tm.includes(DIARIO_DA_QUEST.caminhos.abertos));
  t("a gente desta história: quem traiu leva a racha e «vendeu-te»", /data-traiu="sim"/.test(mesa) && tm.includes("Ilda Seixas") && tm.includes("vendeu-te") && /data-rosto-de="gil"/.test(mesa));
  t("a reviravolta por ler: o bilhete no topo, «A história virou · dia 6»", /data-reviravolta="por-ler"/.test(mesa) && tm.includes("A história virou · dia 6") && tm.includes("Ilda Seixas vendeu-te a quem guarda o Vau Negro."));
  t("e o índice diz que a história virou", (tm.match(/a história virou/g) || []).length >= 1);
  t("o que vem depois conta-se e não se diz", !tm.includes("SEGREDO_DA_ULTIMA") && !tm.includes("SEGREDO_DO_CORACAO") && !tm.includes("SEGREDO_DO_FIM"));
  /* a do coração, à direita */
  const iCoracao = mesa.indexOf('data-coracao=""');
  const cartaDoCoracao = mesa.slice(iCoracao, mesa.indexOf("</section>", iCoracao));
  t("a do coração, sempre à vista: «Com Brash», o título, o passo e «1 de 3»", iCoracao > 0 && texto(cartaDoCoracao).includes("Com Brash") && texto(cartaDoCoracao).includes("Perguntar a Brash pela carta") && texto(cartaDoCoracao).includes("1 de 3"));
  t("o rosário: uma conta por etapa, dito ao leitor", /aria-label="1 de 4 passos desta história"/.test(cartaDoCoracao));
  t("a do coração nunca tem relógio, nem «Ver no mapa»", !/Ver no mapa|faltam \d+ noites/.test(texto(cartaDoCoracao)));
  t("a do coração antes de acender não existe", !tm.includes("Ninguém a vê"));
  t("o cartaz da sombra está à direita", /aria-label="A mão por trás"/.test(mesa));
  /* a estante: o desfecho e o luto, sem ordem de melhor a pior */
  t("a estante guarda o desfecho (o selo do coração, «Brash ficou») e o luto («Brash não voltou»)",
    /aria-label="a história fechou"/.test(mesa) && tm.includes("Brash ficou") && /aria-label="de luto"/.test(mesa) && tm.includes("Brash não voltou"));
  t("aberta, a lombada mostra o desfecho como epitáfio", /<details>/.test(mesa) && tm.includes("Brash leu a carta ao fogo, e ficou."));
  t("a estante nunca conta desfechos «N de M»", !/\d+ de \d+ desfechos/.test(tm));

  /* lida: o bilhete desce para a linha do tempo */
  const lida = { ...estrada, estado: { ...estrada.estado, reviravolta: { ...estrada.estado.reviravolta, vistaEm: 7 } } };
  const ml = html(R.PainelDiario, { ...base, leiaute: "mesa", questsDaBiblioteca: [lida, coracao] });
  t("lida, a reviravolta sai do topo e é um marco na linha do tempo", !/data-reviravolta="por-ler"/.test(ml) && texto(ml).includes("dia 6 · a história virou") && texto(ml).includes("Ilda Seixas vendeu-te"));
  const marco = html(R.EtapaDaMissao, { estado: "virou", texto: "x", nota: "dia 6" });
  t("o marco desenha o glifo da reviravolta em rosa", /<svg/.test(marco) && marco.includes(T.rosa));

  /* o telefone: a estrada, depois a do coração inteira, o cartaz, e a gente no fim */
  const tel = html(R.PainelDiario, { ...base, leiaute: "telefone" });
  const tt = texto(tel);
  const iEstrada = tt.indexOf("O próximo passo"), iCor = tel.indexOf('data-coracao=""'), iCartaz = tel.indexOf('aria-label="A mão por trás"'), iGente = tel.indexOf('aria-label="Gente desta história"');
  t("no telefone: a estrada primeiro, a do coração logo a seguir", iEstrada > 0 && iCor > tel.indexOf("O próximo passo") && iCor > 0);
  t("depois o cartaz e a gente da estrada", iCartaz > iCor && iGente > iCartaz);
  t("a aba Em curso conta as duas histórias", tt.includes("Em curso · 2"));

  /* sem quests, o Diário de AR2: «Em curso», nenhum cartaz */
  const ar2 = texto(html(R.PainelDiario, { ...base, leiaute: "mesa", questsDaBiblioteca: [], vilaoNoDiario: null }));
  t("sem quests da biblioteca, o índice continua «Em curso» e não há cartaz", ar2.includes("Em curso") && !ar2.includes(DIARIO_DA_QUEST.indice.estrada) && !ar2.includes("A mão por trás"));

  /* as peças sozinhas */
  t("a linha do que falta: o anel, o ✓ (dito ao leitor) e o tracejado",
    /border:2px solid/.test(html(R.LinhaDoQueFalta, { texto: "a" })) && texto(html(R.LinhaDoQueFalta, { estado: "feito", texto: "a" })).includes("feito:") && /dashed/.test(html(R.LinhaDoQueFalta, { estado: "outro" })));
  t("a conta tem no máximo cinco pontos", (html(R.LinhaDoQueFalta, { texto: "a", tem: 2, precisa: 9 }).match(/border-radius:6px/g) || []).length === 5);
  t("os caminhos tomados sem frase calam", html(R.CaminhosDaEtapa, { estado: "tomado", texto: "" }) === "");
  t("o rosto sem nome não existe", html(R.RostoDaHistoria, { nome: "" }) === "");
  t("a do coração escondida é 0 px", html(R.QuestDoCoracao, { missao: coracao.missao, estado: { ...coracao.estado, visivel: false } }) === "");
}

sec("7. o cartaz que não passa da camada");
{
  /* o dado chega todo (o nome, o plano, o retrato) — a peça só mostra o que a camada deixa */
  const tudo = { nome: "Vesper Malho", quemE: "o senhor do Vau", linhas: [{ texto: "Quer o Vau inteiro.", nova: true }, { texto: "Alguém compra o medo desta região.", nova: false }], plano: ["feito", "travado", "agora", "por_vir", "por_vir", "por_vir"] };
  const retrato = h("img", { alt: "", "data-pintura": "" });
  const tenente = h("img", { alt: "", "data-tenente-img": "" });
  const em = (camada) => html(R.CartazDaSombra, { vilao: { ...tudo, camada }, retrato, rostoDoTenente: tenente });
  t("sem camada, o cartaz não existe", html(R.CartazDaSombra, { vilao: null }) === "" && html(R.CartazDaSombra, { vilao: { camada: "nenhuma" } }) === "");
  for (const camada of ["rumor", "marca", "mao"]) {
    const s = em(camada);
    t(`${camada}: «Alguém», a silhueta, nenhum nome, nenhuma pintura, nenhum plano`, texto(s).includes("Alguém") && !s.includes("Vesper") && !/data-pintura/.test(s) && !/data-passo/.test(s));
  }
  t("rumor: sem o selo da assinatura e sem o tenente", !/data-assinatura/.test(em("rumor")) && !/data-tenente/.test(em("rumor")));
  t("marca: o selo da assinatura", /data-assinatura/.test(em("marca")) && !/data-tenente=""/.test(em("marca")));
  t("mão: o rosto do tenente no canto", /data-tenente=""/.test(em("mao")));
  const rosto = em("rosto");
  t("rosto: o nome e a pintura, e o aro de ouro; o plano ainda não", rosto.includes("Vesper Malho") && /data-pintura/.test(rosto) && rosto.includes(CARTAZ_DA_SOMBRA.aro.comRosto) && !/data-passo/.test(rosto));
  const guerra = em("guerra");
  t("guerra: o plano, seis traços, cada um com o seu estado", (guerra.match(/data-passo=/g) || []).length === 6 && /data-passo="porVir"/.test(guerra) && /aria-label="O plano dele: feito, travado por ti, o de agora, por vir/.test(guerra));
  t("o aro de ferro enquanto não tem rosto", em("marca").includes(CARTAZ_DA_SOMBRA.aro.semRosto));
  const muitas = html(R.CartazDaSombra, { vilao: { camada: "rosto", nome: "V", linhas: [1, 2, 3, 4, 5].map((i) => ({ texto: `linha ${i}`, nova: i === 1 })) } });
  t("três linhas à vista, a mais nova marcada, as outras um toque abaixo", texto(muitas).includes("linha 3") && !texto(muitas).includes("linha 4") && texto(muitas).includes("e mais 2") && (muitas.match(/data-nova="sim"/g) || []).length === 1);
}

sec("8. os rótulos acessíveis, e o sistema não fala de si");
{
  const s = R.html(h(function P() { return R.Encruzilhada({ aberta: true, veredito: VEREDITO_BRASH, quest: "A Carta", titulo: "Brash e Tomé, frente a frente", rostoDe, bolsa: 48 }); }));
  const rs = rotulos(s);
  const daVida = rs.find((r) => r.startsWith("Deixá-los acertar contas"));
  t("cada carta é um botão com o nome inteiro: o verbo, o ganho, o custo e o risco",
    !!daVida && daVida.includes("Ganhas: A conta é deles.") && daVida.includes("Custa: Só um costuma") && daVida.endsWith("Pode custar a vida de Brash."));
  t("a do preço diz quanto falta, em palavras", rs.some((r) => r.startsWith("Pagar a dívida de Brash") && r.includes("Faltam 12 moedas.")));
  t("a carta virada diz-se inteira", rs.includes(`${ENCRUZILHADA.textos.virada.titulo} ${ENCRUZILHADA.textos.virada.linha}`));
  t("o cartão é um diálogo com o nome da escolha", rs.includes("Uma escolha: Brash e Tomé, frente a frente") && /role="dialog"/.test(s));
  t("os glifos sem rótulo ficam calados ao leitor", /aria-hidden="true"/.test(s));
  const sol = html(R.SoleiraDoMomento, { momentos: { escolha: R.momentoDaEscolha(VEREDITO_BRASH, { titulo: "Brash e Tomé" }).momento } });
  t("a soleira diz-se: «Uma escolha à tua frente», e o botão leva o verbo e quem", rotulos(sol).includes("Uma escolha à tua frente") && rotulos(sol).some((r) => r.includes("Decidir · Brash e Tomé") && r.includes("pode custar Brash")));
  /* nada de «quest», «predicado» ou «camada» no que se lê ou se ouve */
  const tudoVisto = [s, sol, html(R.PainelDiario, { historia: {}, missoes: [], leiaute: "mesa", questsDaBiblioteca: [{ missao: { id: "quest:a", titulo: "A", tipo: "principal", status: "ativa", etapas: [{ tipo: "quest", alvo: "b", chave: "a:b", feito: false }] }, estado: { tipo: 1, etapaTexto: "b", falta: [{ predicado: "esteve", texto: "ir ao poço" }] } }], vilaoNoDiario: { camada: "rumor", linhas: [{ texto: "Alguém compra o medo.", nova: true }] } })];
  const lido = tudoVisto.map((x) => texto(x) + " " + rotulos(x).join(" ")).join(" ");
  t("o sistema não fala de si: nem «quest», nem «predicado», nem «camada»", !/\bquests?\b|predicad|camada/i.test(lido), (lido.match(/\bquests?\b|predicad|camada/i) || [""])[0]);
}

console.log(`\nbq-tela: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
