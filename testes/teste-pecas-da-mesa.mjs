/* AS PEÇAS DA MESA DO MESTRE e O ESCUDO (V1 + V2 · F1 · 15/11/2026)

   Renderiza em Node (esbuild + renderToStaticMarkup) as peças de
   `pecas-da-mesa.jsx` e o conteúdo do escudo (`painel-escudo.jsx`) e
   confere contra formas.md §«A Mesa do Mestre · F1» §4 e §7: as medidas,
   os estados, o rótulo acessível, o alvo ≥ 44 quando tocável, o piso da
   letra depois do multiplicador, e a ausência de mono e de emoji.
*/
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { buildSync } from "esbuild";
import { T, PECAS_DA_MESA, ESCUDO_DO_MESTRE, TAMANHO_DO_TEXTO, SOMBRA_DA_MESA, RECIBO } from "../src/estilo.js";
import { razao, rgb } from "./conta-da-luz.mjs";
import { RITMOS_VIAGEM } from "../src/ermos.js";
import { PREFERENCIAS_DO_GOLPE_FINAL } from "../src/golpe-final.js";

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(AQUI, "..", "src");
const ENTRADA = `
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NotaDoMestre, Lacre, PecaDeRecurso, VelaRelogio, CartaDePe, Estampa, ObjetoPousado, CantoDoEscudo, Proposta, LinhaDaPena, letraDaMesa } from "./pecas-da-mesa.jsx";
import { EscudoDoMestre, PortaDoEscudo, PALAVRAS_DO_ESCUDO } from "./painel-escudo.jsx";
export const html = (el) => renderToStaticMarkup(el);
export { React, NotaDoMestre, Lacre, PecaDeRecurso, VelaRelogio, CartaDePe, Estampa, ObjetoPousado, CantoDoEscudo, Proposta, LinhaDaPena, letraDaMesa, EscudoDoMestre, PortaDoEscudo, PALAVRAS_DO_ESCUDO };
`;
const saida = path.join(AQUI, `.tmp-pecas-da-mesa-${process.pid}.mjs`);
buildSync({
  stdin: { contents: ENTRADA, resolveDir: SRC, loader: "jsx", sourcefile: "entrada-pecas.jsx" },
  bundle: true, format: "esm", platform: "node", outfile: saida, jsx: "automatic", logLevel: "silent", external: ["react", "react-dom", "react-dom/server", "react/jsx-runtime"],
  loader: { ".js": "jsx" }, define: { "process.env.NODE_ENV": '"production"' },
});
const R = await import(pathToFileURL(saida).href);
fs.rmSync(saida, { force: true });
const h = R.React.createElement;
const html = (c, p) => R.html(h(c, p));
const desfazer = (s) => s.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
const texto = (s) => desfazer(s.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
const rotulos = (s) => [...s.matchAll(/aria-label="([^"]*)"/g)].map((m) => desfazer(m[1]));
const minAlto = (s) => [...s.matchAll(/min-height:\s*(\d+)px/g)].map((m) => Number(m[1]));
const semEmoji = (s) => !/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(texto(s));

sec("1. A letra das peças: max(piso, corpo × multiplicador)");
{
  const r = R.letraDaMesa("rotulo"), n = R.letraDaMesa("nome"), p = R.letraDaMesa("prosa", true);
  t("rótulo: max(12px, calc(12px × var(--tv-texto)))", r.fontSize === `max(12px, calc(12px * var(${TAMANHO_DO_TEXTO.variavel}, 1)))`, r.fontSize);
  t("nome: piso 13", n.fontSize.startsWith("max(13px"));
  t("prosa no telefone: 17", p.fontSize.includes("calc(17px"));
  t("Cinzel em caixa alta; Spectral não", r.textTransform === "uppercase" && p.textTransform === "none");
  t("a nota do Mestre é itálico", R.letraDaMesa("notaDoMestre").fontStyle === "italic");
}

sec("2. A nota do Mestre");
{
  const s = html(R.NotaDoMestre, { tipo: "ganho", children: "+17 XP — uma conversa que ficou." });
  t("é uma nota (role=note), com o tipo", /role="note"/.test(s) && /data-tipo="ganho"/.test(s));
  t("o traço da pena tem 18 × 20 e a cor do tipo (musgo)", /width="18" height="20"/.test(s) && s.includes(`stroke="${T.musgoNoPergaminho}"`));
  t("a tinta é tintaDoPergaminhoDim (6,56)", s.includes(T.tintaDoPergaminhoDim.toLowerCase()) || s.toLowerCase().includes(T.tintaDoPergaminhoDim.toLowerCase()));
  t("sem mono", !/JetBrains|tv-mono/.test(s));
  const a = html(R.NotaDoMestre, { tipo: "aviso", children: "Não chega." });
  t("aviso usa o perigo no pergaminho", a.includes(`stroke="${T.perigoNoPergaminho}"`));
  /* 16/11 (a prova jogada da mesa): o «+17 XP» debaixo da prosa saiu bege (inkMeio, rgb 210,192,164) sobre o
     pergaminho — era o Recibo, que pintava a segunda voz do feltro. Toda tinta do Mestre na página mede ≥ 4,5. */
  const naFolha = (cor) => razao(rgb(cor), rgb(T.pergaminho));
  t("a nota do Mestre: ≥ 4,5 sobre o pergaminho", naFolha(PECAS_DA_MESA.nota.tinta) >= 4.5, naFolha(PECAS_DA_MESA.nota.tinta).toFixed(2));
  t("o recibo na página (tinta, momento, e mais): ≥ 4,5", Object.values(RECIBO.naPagina).every((c) => naFolha(c) >= 4.5), Object.values(RECIBO.naPagina).map((c) => naFolha(c).toFixed(2)).join(" "));
  t("e o bege de antes não passaria (a conta morde)", naFolha(T.inkMeio) < 4.5, naFolha(T.inkMeio).toFixed(2));
  const rel = fs.readFileSync(path.join(SRC, "painel-relato.jsx"), "utf8");
  t("o recibo da resposta pede a tinta da página", rel.split("<Recibo chips={resto} telefone={!mesa} naPagina />").length - 1 === 2);
  const ui = fs.readFileSync(path.join(SRC, "ui.jsx"), "utf8");
  t("o Recibo lê a tinta da página da tabela", ui.includes("naPagina ? (momento ? RECIBO.naPagina.momento : RECIBO.naPagina.tinta)"));
}

sec("3. O lacre: G 96 · M 56 · P 32");
{
  for (const [tam, lado] of Object.entries(PECAS_DA_MESA.lacre.tamanhos)) {
    const s = html(R.Lacre, { tamanho: tam, tipo: "quest" });
    t(`${tam}: ${lado} px, rotulado`, s.includes(`width="${lado}" height="${lado}"`) && rotulos(s).includes("Selo: quest cumprida"));
  }
  const n = html(R.Lacre, { tamanho: "G", tipo: "nivel", numero: 2 });
  t("nível: o número em Spectral Bold, e o rótulo diz o nível", /Spectral/.test(n) && /font-weight:700/.test(n) && rotulos(n).includes("Selo: nível 2") && texto(n) === "2");
  const c = html(R.Lacre, { tamanho: "M", tipo: "conquista" });
  t("conquista: a coroa", rotulos(c).includes("Selo: conquista"));
  t("a cera é T.lacre com aro lacreLume e impressão lataoLume", n.includes(`fill="${T.lacre}"`) && n.includes(`stroke="${T.lacreLume}"`) && n.includes(`fill="${T.lataoLume}"`));
  t("sombra de peça", n.includes("box-shadow:" + SOMBRA_DA_MESA.peca.replace(/, /g, ",").slice(0, 10)) || n.includes("rgba(0,0,0,.55)"));
}

sec("4. A peça de recurso: a pilha que se conta olhando");
{
  const r = html(R.PecaDeRecurso, { tipo: "racoes", quantidade: 8 });
  t("8 rações: rótulo «8 rações», 8 discos", rotulos(r).includes("8 rações") && /data-discos="8"/.test(r));
  t("alvo 72 × 112", /width:72px/.test(r) && minAlto(r).includes(112));
  const m = html(R.PecaDeRecurso, { tipo: "moedas", quantidade: 150 });
  t("150 moedas: 15 discos em latão, número 150", /data-discos="15"/.test(m) && m.includes(`fill="${T.latao}"`) && texto(m).startsWith("150"));
  t("1 tocha: singular", rotulos(html(R.PecaDeRecurso, { tipo: "tochas", quantidade: 1 })).includes("1 tocha"));
}

sec("5. A vela-relógio: a altura é a hora");
{
  const a = html(R.VelaRelogio, { hora: 6 }), b = html(R.VelaRelogio, { hora: 22 });
  t("às 6 a cera tem 104; às 22, 40", /data-altura="104"/.test(a) && /data-altura="40"/.test(b));
  t("caixa 88 × 172", /width:88px/.test(a) && /height:172px/.test(a));
  t("rotulada: «A vela: Noite · 22:00»", rotulos(b).includes("A vela: Noite · 22:00"));
  t("o prato é de latão", a.includes(`fill="${T.latao}"`));
}

sec("6. A carta de pé");
{
  const base = { nome: "Saoirse", legenda: "Ladina · nível 2", vida: 18, vidaMax: 18, mana: 6, manaMax: 10 };
  const r = html(R.CartaDePe, base);
  t("repouso: aro de latão, 140 × 196, alvo 252", /data-estado="repouso"/.test(r) && r.includes(`3px solid ${T.latao}`) && /width:140px/.test(r) && /height:196px/.test(r) && minAlto(r).includes(252));
  t("dez contas redondas de PV (7) e dez losangos de PM", (r.match(/<circle /g) || []).length === 10 && (r.match(/<path d="M/g) || []).length >= 10);
  t("o rótulo diz a vida e a magia em palavras", rotulos(r)[0] === "Saoirse: 18 de 18 de vida, 6 de 10 de magia");
  t("a vez: aro âmbar", html(R.CartaDePe, { ...base, vez: true }).includes(`3px solid ${T.amber}`));
  t("ferido: aro lacreLume", html(R.CartaDePe, { ...base, vida: 5 }).includes(`3px solid ${T.lacreLume}`));
  const c = html(R.CartaDePe, { ...base, vida: 0 });
  t("caído: sem cor e «ainda respira»", /grayscale/.test(c) && /ainda respira/.test(rotulos(c)[0]));
  const b = html(R.CartaDePe, { ...base, aoTocar: () => {} });
  t("tocável: é botão", b.startsWith("<button"));
}

sec("7. A estampa");
{
  const a = html(R.Estampa, { cena: "cidade", lugar: "Monte Profundo", sub: "o Malho das Cinzas, de manhã", estado: "aberta" });
  t("aberta: 212 de altura, a pintura de 188 vinda de /cenas/", /height:212px/.test(a) && /height:188px/.test(a) && a.includes("/cenas/cidade.webp"));
  t("o lugar em Cinzel na brasa", texto(a).includes("Monte Profundo") && a.includes(T.brasaNoPergaminho));
  t("recolhida: 48", /height:48px/.test(html(R.Estampa, { cena: "cidade", lugar: "X", estado: "recolhida" })));
  t("estreita: miniatura de 96", /width:96px/.test(html(R.Estampa, { cena: "cidade", lugar: "X", estado: "estreita" })));
  t("a figura diz o lugar ao leitor de tela", rotulos(a)[0] === "Monte Profundo, o Malho das Cinzas, de manhã");
}

sec("8. O objeto pousado e o canto do escudo");
{
  for (const o of ["livro", "carta", "bolsa", "grimorio"]) {
    const s = html(R.ObjetoPousado, { objeto: o, aoAbrir: () => {} });
    t(`${o}: botão 104 × 128 com desenho de 96`, s.startsWith("<button") && /width:104px/.test(s) && minAlto(s).includes(128) && /width="96" height="96"/.test(s));
  }
  t("pousado: sombra pousado; erguido: sombra erguido", html(R.ObjetoPousado, { objeto: "livro", erguido: true }).includes("34px 48px"));
  const c = html(R.CantoDoEscudo, { aoAbrir: () => {} });
  t("o canto: alvo 72 × 84, desenho 64, rótulo Esc, atalho Escape", /width:72px/.test(c) && minAlto(c).includes(84) && /width="64"/.test(c) && /aria-keyshortcuts="Escape"/.test(c) && texto(c) === "Esc");
  const ct = html(R.CantoDoEscudo, { aoAbrir: () => {}, telefone: true });
  t("no telefone: 46 de desenho, alvo ≥ 44", /width="46"/.test(ct) && minAlto(ct).every((v) => v >= 44));
}

sec("9. A proposta e a linha da pena");
{
  const p = html(R.Proposta, { texto: "Seguir as pegadas na cinza", dado: { pericia: "Sobrevivência", cd: 15, preco: "a trilha se perde" }, aoTocar: () => {} });
  t("com dado: 60 de altura, a 2.ª linha diz perícia, número e preço", minAlto(p).includes(60) && texto(p).includes("Sobrevivência · precisa de 15 · se falhar, a trilha se perde"));
  t("o chão é ossoLume, a borda tintaDoPergaminhoDim 1 px", p.includes(T.ossoLume) && p.includes(`1px solid ${T.tintaDoPergaminhoDim}`));
  const s = html(R.Proposta, { texto: "Perguntar a Nolan quem é a Myrna", aoTocar: () => {} });
  t("sem dado: 48", minAlto(s).includes(48));
  const d = html(R.Proposta, { texto: "Comprar o antídoto", razao: "Não chega: o antídoto custa 48 e a bolsa tem 25." });
  t("desabilitada: sem chão, com a razão escrita (nunca opacidade)", /disabled=""/.test(d) && /background:transparent/.test(d) && texto(d).includes("Não chega") && !/opacity/.test(d));
  const l = html(R.LinhaDaPena, { valor: "" });
  t("a pena vazia: 56, convite «O que você faz?», «Dizer» 44 × 44", minAlto(l).includes(56) && /placeholder="O que você faz\?"/.test(l) && /width:44px;height:44px/.test(l) && rotulos(l).includes("Dizer"));
  t("escrevendo: a regra engrossa a 2 px", /data-estado="escrevendo"/.test(html(R.LinhaDaPena, { valor: "Sigo as pegadas" })) && /border-bottom:2px/.test(html(R.LinhaDaPena, { valor: "Sigo" })));
}

sec("10. O escudo do Mestre (quadro I)");
{
  const reacao = { titulo: "Quando um golpe chega", escolhida: "normal", fila: [{ id: "normal", rotulo: "Eu decido" }, { id: "parado", rotulo: "Eu decido, sem pressa" }, { id: "deixar_passar", rotulo: "Deixar passar" }], aoEscolher: () => {} };
  const golpe = { titulo: "Ao derrubar um inimigo", escolhida: "perguntar", fila: Object.values(PREFERENCIAS_DO_GOLPE_FINAL).map((p) => ({ id: p.id, rotulo: p.rotulo })), aoEscolher: () => {} };
  const marcha = { titulo: "Ritmo de marcha", escolhida: "normal", fila: RITMOS_VIAGEM.map((r) => ({ id: r.id, rotulo: r.nome })), diz: RITMOS_VIAGEM[1].desc, aoEscolher: () => {} };
  const props = { som: true, rolagens: true, rolaPorMim: false, tamanhoDoTexto: 1, reacao, golpe, marcha, campanha: "Saoirse · dia 2", aoGuardar: () => {}, aoSair: () => {}, aoVoltar: () => {} };
  const m = html(R.EscudoDoMestre, props);
  const W = R.PALAVRAS_DO_ESCUDO;
  t("mesa: três folhas (Na luta + Na estrada · A casa · A campanha)", /data-forma="mesa"/.test(m) && (m.match(/width:336px/g) || []).length === 2 && /width:460px/.test(m));
  const tx = texto(m);
  for (const k of ["som", "texto", "rolagens", "rolaPorMim", "guardar", "voltar", "sair"]) t(`tem «${W[k].rotulo}»`, tx.includes(W[k].rotulo));
  t("o veredito antes do clique: a frase do preço por baixo de «Sair»", tx.indexOf(W.sair.rotulo) < tx.indexOf(W.sair.diz));
  t("os rótulos das opções são os das tabelas de hoje", ["Eu decido", "Deixar passar", "Perguntar a cada golpe final", "Sempre matar", "Sempre poupar", "Lento", "Normal", "Rápido"].every((r) => tx.includes(r)));
  t("interruptores são role=switch com aria-checked e a palavra ligado/desligado", (m.match(/role="switch"/g) || []).length === 3 && /aria-checked="true"/.test(m) && tx.includes("ligado") && tx.includes("desligado"));
  t("as escolhas são radiogroup; a escolhida em osso com tinta", (m.match(/role="radiogroup"/g) || []).length === 4 && m.includes(`background:${T.osso};color:${T.tintaDoPergaminho}`));
  t("quatro «A» crescentes, cada um rotulado", ["Texto a 90 %", "Texto a 100 %", "Texto a 115 %", "Texto a 130 %"].every((r) => rotulos(m).includes(r)));
  t("todo controle tem alvo ≥ 44", minAlto(m).every((v) => v >= 44), JSON.stringify(minAlto(m)));
  t("o principal é âmbar e é um só («Voltar à mesa»)", (m.match(new RegExp(`background:${T.amber};color:${T.onAccent}`, "g")) || []).length === 1);
  t("sair tem aro lacreLume", m.includes(`2px solid ${T.lacreLume}`));
  t("sem mono e sem emoji do sistema", !/JetBrains|tv-mono/.test(m) && semEmoji(m));
  const f = html(R.EscudoDoMestre, { ...props, telefone: true });
  t("telefone: uma folha que rola, pé fixo de 84 com «Voltar à mesa»", /data-forma="telefone"/.test(f) && minAlto(f).includes(ESCUDO_DO_MESTRE.telefone.pe) && (texto(f).match(/Voltar à mesa/g) || []).length === 1);
  const ft = texto(f);
  t("telefone: a ordem A casa · Na luta · Na estrada · A campanha", ft.indexOf("A casa") < ft.indexOf("Na luta") && ft.indexOf("Na luta") < ft.indexOf("Na estrada") && ft.indexOf("Na estrada") < ft.indexOf("A campanha"));
  t("sem luta nem estrada, o escudo ainda abre (nada lança)", texto(html(R.EscudoDoMestre, {})).includes(W.titulo));
  t("a porta fechada não desenha nada", html(R.PortaDoEscudo, { aberto: false }) === "");
}

console.log(`\n${bons} ok · ${maus} mal`);
process.exit(maus ? 1 : 0);
