/* check-chamado.mjs — MC3, A FORMA DO MESTRE QUE CHAMA O DADO (10/11/2026)

   formas.md §MC (Figma 382:31 a fala, 382:237 a peça). Varre o que a mesa
   de design decidiu e o que costuma apodrecer calado:

   1. a tabela CHAMADO_DO_MESTRE lê T e as tabelas vizinhas, sem cor nova;
   2. o chamado vem primeiro na prioridade da soleira;
   3. os pares de contraste de §MC 6, pela conta da luz (WCAG 2.2);
   4. as duas peças (ChamadoDoMestre, LinhaDoChamado) e a preferência não
      têm cor literal;
   5. toda classe tv-chamado-* que anima tem saída no bloco de movimento
      reduzido, a vela NÃO aparece lá, e a espera continua (a peça não lê o
      reduce para nada que não seja o relógio do lance);
   6. renderizadas de verdade (esbuild + renderToStaticMarkup): a fala
      recompõe a linha do motor palavra por palavra, nenhuma palavra de
      mecanismo aparece («teste», «dif.», «CD», «chamado», «falhar:»), o
      nome acessível leva tudo, e sem props tudo é como hoje. */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { buildSync } from "esbuild";
import { T, TIPOS, ALVOS, BANDEJA, DADO, MOVIMENTO_DO_DADO, SOLEIRA_DO_MOMENTO, CHAMADO_DO_MESTRE, MOVIMENTO_CSS } from "../src/estilo.js";
import { O_CHAMADO } from "../src/motor/o-mestre-chama.js";
import { razao, rgb } from "./conta-da-luz.mjs";

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const AQUI = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(AQUI, "..", "src");
const C = CHAMADO_DO_MESTRE;
const r = (a, b) => razao(rgb(a), rgb(b));
const f2 = (x) => x.toFixed(2);
const misturar = (a, b, p) => "#" + rgb(a).map((c, i) => Math.round(c + (rgb(b)[i] - c) * p).toString(16).padStart(2, "0")).join("");

sec("1. a tabela lê as outras, e não copia");
{
  t("a fala: prosa 17/26, a marca 18 a 8 do texto, 12 por cima", C.fala.tamanho === TIPOS.prosa && C.fala.entrelinha === 26 && C.fala.marca === 18 && C.fala.entre === 8 && C.fala.acima === 12);
  t("a bandeja: o chão, a sombra e o raio são os da Bandeja", C.bandeja.chao === T.pagina && C.bandeja.sombra === BANDEJA.sombraInterior && C.bandeja.raio === BANDEJA.raio);
  t("o aro: amber a 0,55, aceso a 1, line depois de pousar", C.bandeja.aro === T.amber && C.bandeja.alfaDoAro === 0.55 && C.bandeja.alfaDoAroAceso === 1 && C.bandeja.aroPousado === T.line);
  t("o d20: 40 numa caixa de 48 (ALVOS.piso), o brilho de V6", C.dado.caixa === ALVOS.piso && C.dado.lado === 40 && C.dado.brilho === DADO.brilho && C.dado.alfaDoBrilho === DADO.alfaDoBrilho && C.dado.alfaDoBrilhoAceso === DADO.alfaDoBrilhoAceso);
  t("pôr o d20: 260 ms, com a curva do pouso", C.poe.dura === 260 && C.poe.curva === MOVIMENTO_DO_DADO.curva);
  t("a vela: raio 23, traço 2, amber 0,85", C.vela.raio === 23 && C.vela.traco === 2 && C.vela.cor === T.amber && C.vela.alfa === 0.85);
  const deT = new Set(Object.values(T));
  const cores = [];
  const varrer = (o, onde) => { for (const [k, v] of Object.entries(o || {})) { if (typeof v === "string" && /^#/.test(v)) cores.push([`${onde}.${k}`, v]); else if (v && typeof v === "object" && !Array.isArray(v)) varrer(v, `${onde}.${k}`); } };
  varrer(C, "CHAMADO_DO_MESTRE");
  const soltas = cores.filter(([, c]) => !deT.has(c));
  t(`as ${cores.length} cores da tabela são todas de T`, cores.length >= 9 && soltas.length === 0, soltas.map(([n, c]) => `${n}=${c}`).join(", "));
}

sec("2. a soleira: o chamado primeiro");
t(`«chamado» abre a prioridade (${SOLEIRA_DO_MOMENTO.prioridade.join(" > ")})`, SOLEIRA_DO_MOMENTO.prioridade[0] === "chamado");

sec("3. o contraste de §MC 6 (WCAG 2.2: letra ≥ 4,5, forma e aro ≥ 3)");
{
  /* o pior ponto da folha: o pergaminho com a vinheta no máximo (a régua de teste-mesa-c) */
  const PIOR = misturar(T.pergaminho, T.pergaminhoBorda, 0.75);
  const aro = misturar(T.pagina, T.amber, C.bandeja.alfaDoAro);
  const vela = misturar(T.pagina, T.amber, C.vela.alfa);
  const d20Falha = misturar(T.pagina, T.amber, BANDEJA.falhaApagada);
  const PARES = [
    ["a perícia brasa / pergaminho, no pior ponto", T.brasaNoPergaminho, PIOR, 4.5],
    ["o texto e o número tinta / pergaminho, no pior ponto", T.tintaDoPergaminho, PIOR, 4.5],
    ["o aviso perigo / pergaminho, no pior ponto", T.perigoNoPergaminho, PIOR, 4.5],
    ["o verbo ink / pagina", T.ink, T.pagina, 4.5],
    ["a perícia e a conta inkMeio / pagina", T.inkMeio, T.pagina, 4.5],
    ["o nó do preço amberSoft / pagina", T.amberSoft, T.pagina, 4.5],
    ["«passou» ok / pagina", T.ok, T.pagina, 4.5],
    ["«falhou» danger / pagina", T.danger, T.pagina, 4.5],
    ["o d20 amber / pagina (1.4.11)", T.amber, T.pagina, 3],
    ["o d20 da falha a 0,5 / pagina", d20Falha, T.pagina, 3],
    /* §MC 6 escreve 3,39; pela conta da casa o aro composto (#906025) dá 3,00 contra a mesa — passa, no fio */
    ["o aro amber 0,55 / a mesa bg (1.4.11)", aro, T.bg, 3],
    ["o aro amber 0,55 / pagina", aro, T.pagina, 3],
    ["a vela amber 0,85 / pagina", vela, T.pagina, 3],
    ["«Mudar de ideia» ink / panel", T.ink, SOLEIRA_DO_MOMENTO.secundario.chao, 4.5],
    ["o aro do recuo lineStrong / panel", SOLEIRA_DO_MOMENTO.secundario.aro, SOLEIRA_DO_MOMENTO.secundario.chao, 3],
  ];
  for (const [n, a, b, piso] of PARES) t(`${n} ≥ ${piso} (${f2(r(a, b))})`, r(a, b) >= piso);
  /* §MC 6: «com amber a 0,35 daria 2,10 e chumbava» — o aro existe por isto */
  t(`e o aro não se suaviza: a 0,35 chumbaria (${f2(r(misturar(T.pagina, T.amber, 0.35), T.bg))} < 3)`, r(misturar(T.pagina, T.amber, 0.35), T.bg) < 3);
}

sec("4. nenhuma cor literal nas peças");
{
  const semComentario = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
  const RX_COR = /#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/;
  const bandeja = fs.readFileSync(path.join(SRC, "painel-bandeja.jsx"), "utf8");
  const ui = fs.readFileSync(path.join(SRC, "ui.jsx"), "utf8");
  const iC = bandeja.indexOf("MC · O CHAMADO DO MESTRE");
  const iF = ui.indexOf("MC · A FALA DO MESTRE QUE CHAMA O DADO");
  const fF = ui.indexOf("A VOZ (R2)", iF);
  t("o recorte do ChamadoDoMestre acha-se", iC > 0 && /export function ChamadoDoMestre/.test(bandeja.slice(iC)));
  t("o recorte da fala e da preferência acha-se", iF > 0 && fF > iF && /export function LinhaDoChamado/.test(ui.slice(iF, fF)) && /export function RolaPorMim/.test(ui.slice(iF, fF)));
  const chamado = semComentario(bandeja.slice(iC));
  const fala = semComentario(ui.slice(iF, fF));
  const m1 = chamado.match(RX_COR), m2 = fala.match(RX_COR);
  t("ChamadoDoMestre e momentoDoChamado: nenhuma cor solta", !m1, m1 ? m1[0] : "");
  t("LinhaDoChamado e RolaPorMim: nenhuma cor solta", !m2, m2 ? m2[0] : "");
  /* §MC 4: a espera é tempo de leitura e fica com o reduce — a peça só lê o
     reduce pelo relógio do lance (useLance), nunca para a vela ou o verbo */
  t("o ChamadoDoMestre não lê o reduce (a vela e «Rolar já» não dependem dele)", !/semMovimento|matchMedia/.test(chamado));
}

sec("5. o movimento: toda classe tem saída no reduce, a vela some, a espera fica");
{
  const iMedia = MOVIMENTO_CSS.indexOf("@media (prefers-reduced-motion");
  const antes = MOVIMENTO_CSS.slice(0, iMedia);
  const dentro = MOVIMENTO_CSS.slice(iMedia);
  const RX_REGRA = /([.][A-Za-z][\w-]*(?:\s*,\s*[.][A-Za-z][\w-]*)*)\s*\{([^{}]*)\}/g;
  const colher = (texto, filtro) => { const s = new Set(); for (const m of texto.matchAll(RX_REGRA)) if (filtro(m[2])) for (const c of m[1].split(",")) s.add(c.trim()); return s; };
  const animam = [...colher(antes, (b) => /animation\s*:/.test(b))].filter((c) => c.startsWith(".tv-chamado-"));
  const comSaida = colher(dentro, (b) => /animation\s*:\s*none/.test(b));
  t(`as três animações do chamado existem (${animam.join(", ")})`, ["poe", "rola", "vela"].every((k) => animam.includes(".tv-chamado-" + k)));
  const sem = animam.filter((c) => !comSaida.has(c));
  t("toda classe tv-chamado que anima tem animation: none no reduce", sem.length === 0, sem.join(", "));
  const transitam = [...colher(antes, (b) => /transition\s*:/.test(b))].filter((c) => c.startsWith(".tv-chamado-"));
  const semTransicao = colher(dentro, (b) => /transition\s*:\s*none/.test(b));
  t(`toda classe tv-chamado que transita troca seca no reduce (${transitam.join(", ")})`, transitam.length >= 2 && transitam.every((c) => semTransicao.has(c)));
  t("a vela não aparece no reduce (display: none)", /\.tv-chamado-vela\s*\{[^}]*display:\s*none/.test(dentro));
  t("o d20 aparece num esvanecer de semMovimento, e só no reduce", new RegExp(`\\.tv-chamado-surge\\s*\\{[^}]*tvFade ${MOVIMENTO_DO_DADO.semMovimento}ms`).test(dentro) && !/\.tv-chamado-surge/.test(antes));
  /* a cascata: o surge tem de vir DEPOIS do none da mesma especificidade */
  t("e o surge vem depois do none (é ele que ganha)", dentro.indexOf(".tv-chamado-surge {") > dentro.indexOf(".tv-chamado-poe, .tv-chamado-rola { animation: none"));
  t("a vela corre na espera que a peça passa (--tv-vela-dura, linear)", /\.tv-chamado-vela\s*\{\s*animation:\s*tvChamadoVela var\(--tv-vela-dura\) linear/.test(antes));
}

sec("6. as peças renderizadas");
const ENTRADA = `
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ChamadoDoMestre, momentoDoChamado, Bandeja } from "./painel-bandeja.jsx";
import { SoleiraDoMomento, LinhaDoChamado, RolaPorMim, pedacosDoChamado, precoDoChamado } from "./ui.jsx";
export const html = (el) => renderToStaticMarkup(el);
export { React, ChamadoDoMestre, momentoDoChamado, Bandeja, SoleiraDoMomento, LinhaDoChamado, RolaPorMim, pedacosDoChamado, precoDoChamado };
`;
const saida = path.join(AQUI, `.tmp-check-chamado-${process.pid}.mjs`);
buildSync({
  stdin: { contents: ENTRADA, resolveDir: SRC, loader: "jsx", sourcefile: "entrada-chamado.jsx" },
  bundle: true, format: "esm", platform: "node", outfile: saida, jsx: "automatic", logLevel: "silent", external: ["react", "react-dom", "react-dom/server", "react/jsx-runtime"],
  loader: { ".js": "jsx" }, define: { "process.env.NODE_ENV": '"production"' },
});
const R = await import(pathToFileURL(saida).href);
fs.rmSync(saida, { force: true });
const h = R.React.createElement;
const html = (c, p) => R.html(h(c, p));
const desfazer = (s) => s.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
const texto = (s) => desfazer(s.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
const textoJunto = (s) => desfazer(s.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
const rotulos = (s) => [...s.matchAll(/aria-label="([^"]*)"/g)].map((m) => desfazer(m[1]));
const PROIBIDAS = [/\bteste\b/i, /\bdif\./i, /\bCD\b/, /chamado/i, /falhar:/i];
const limpo = (s) => PROIBIDAS.filter((rx) => rx.test(s)).map(String);

/* um chamado com a forma do que oChamado devolve (o rasto com chuva, §MC 8) */
const AVISO = "Se falhar, a chuva apaga a trilha e meia hora se vai.";
const linhaDe = (o) => O_CHAMADO.molde.replace("{pericia}", o.periciaNome).replace("{dc}", String(o.dc)).replace("{porque}", o.porque ? `, ${o.porque}` : "").replace("{aviso}", o.aviso);
const CH = { pericia: "sobrevivencia", periciaNome: "Sobrevivência", dc: 14, aviso: AVISO, efeito: "tempo", dado: { teste: "d20", preco: null }, chave: "rasto-1", porque: "com a chuva" };
CH.linha = linhaDe(CH);
const SEM_PORQUE = { ...CH, porque: "", chave: "rasto-2" };
SEM_PORQUE.linha = linhaDe(SEM_PORQUE);

{
  /* a fala */
  const f = html(R.LinhaDoChamado, { chamado: CH });
  t(`a fala recompõe a linha do motor, palavra por palavra («${textoJunto(f)}»)`, textoJunto(f) === CH.linha);
  t("e sem «porque» também", textoJunto(html(R.LinhaDoChamado, { chamado: SEM_PORQUE })) === SEM_PORQUE.linha);
  const partes = Object.fromEntries([...f.matchAll(/data-chamado-parte="(\w+)"[^>]*>([^<]*)</g)].map((m) => [m[1], desfazer(m[2])]));
  t("as partes vestidas: a perícia com o ponto, o número, o porquê, o aviso", partes.pericia === "Sobrevivência." && partes.dc === "14" && partes.porque === ", com a chuva" && partes.aviso === AVISO);
  t("o número é mono e o aviso itálico", /class="tv-mono" data-chamado-parte="dc"/.test(f) && /data-chamado-parte="aviso" style="font-style:italic/.test(f));
  t("a fala não tem palavra de mecanismo", limpo(texto(f)).length === 0, limpo(texto(f)).join(" "));
  t("sem chamado, não há fala", html(R.LinhaDoChamado, {}) === "" && html(R.LinhaDoChamado, { chamado: null }) === "");
  t(`o preço sai do molde: «${R.precoDoChamado(CH)}»`, R.precoDoChamado(CH) === "precisa de 14");
  t("as partes são do motor (sem chamado, nada)", R.pedacosDoChamado(null).length === 0);
}
{
  /* a peça na espera */
  const e = html(R.ChamadoDoMestre, { chamado: CH, mod: 2 });
  const vis = texto(e);
  t(`na espera: «Rolar d20 + 2», a perícia e o preço (${vis})`, /Rolar d20 \+ 2/.test(vis) && /Sobrevivência/.test(vis) && /precisa de 14/.test(vis));
  t("o nome acessível leva tudo, sem corte", rotulos(e)[0] === `Rolar d20 + 2. Sobrevivência, precisa de 14. ${AVISO}`, rotulos(e)[0]);
  t("o d20 da espera está de pé e sem número", /tv-chamado-poe tv-chamado-surge/.test(e) && !/<text[^>]*>\d+<\/text>/.test(e));
  t("a bandeja é o botão, com o aro de quem se toca", /<button[^>]*data-chamado="espera"/.test(e) && /tv-chamado-bandeja/.test(e));
  t("sem vela fora da preferência", !/tv-chamado-vela/.test(e));
  t("a peça não tem palavra de mecanismo", limpo(vis).length === 0, limpo(vis).join(" "));
  const tel = texto(html(R.ChamadoDoMestre, { chamado: CH, mod: 2, telefone: true }));
  t(`no telefone a perícia sai da bandeja, o verbo e o preço ficam (${tel})`, !/Sobrevivência/.test(tel) && /Rolar d20 \+ 2/.test(tel) && /precisa de 14/.test(tel));
  t("o bónus negativo diz-se com o menos da conta", /Rolar d20 − 1/.test(texto(html(R.ChamadoDoMestre, { chamado: CH, mod: -1 }))));
  t("sem chamado, não há peça", html(R.ChamadoDoMestre, {}) === "");
}
{
  /* a vela: só com a preferência, e a espera que a peça recebe */
  const s = html(R.ChamadoDoMestre, { chamado: CH, mod: 2, sozinho: true, espera: 4800 });
  t("com «o Mestre rola por mim», o verbo é «Rolar já»", /Rolar já/.test(texto(s)) && /data-chamado="sozinho"/.test(s));
  t("a vela acende, com a espera que veio (4800 ms)", /class="tv-chamado-vela"/.test(s) && /--tv-vela-dura:4800ms/.test(s));
  t("a vela começa às 12 h (rodada um quarto para trás)", /rotate\(-90deg\)/.test(s));
  t("sem espera dada, a vela usa a do motor", new RegExp(`--tv-vela-dura:${O_CHAMADO.esperaSozinho}ms`).test(html(R.ChamadoDoMestre, { chamado: CH, sozinho: true })));
}
{
  /* pousado (sem efeitos no servidor, o lance renderiza já pousado) */
  const lance = { n: 7, dados: [{ faces: 20, valor: 9, papel: "teste" }], mod: 2, total: 11, alvo: 14, desfecho: "falha", rotulo: "d20" };
  const cobrado = "a chuva apaga a trilha e meia hora se vai";
  const p = html(R.ChamadoDoMestre, { chamado: { ...CH, cobrado }, mod: 2, lance });
  const vis = texto(p);
  t(`a falha repete o aviso depois do dado (${vis})`, vis.includes(`— ${cobrado}`) && /✕/.test(vis));
  t("pousado, a bandeja já não se toca (aro line, sem a classe do aro)", /aria-disabled="true"/.test(p) && !/tv-chamado-bandeja/.test(p) && /data-chamado="pousado"/.test(p));
  t("a conta é a da bandeja (precisa de 14)", vis.includes("9 + 2 = 11 · precisa de 14"));
  const ok = texto(html(R.ChamadoDoMestre, { chamado: CH, mod: 2, lance: { ...lance, valor: 15, dados: [{ faces: 20, valor: 15, papel: "teste" }], total: 17, desfecho: "sucesso" } }));
  t("o sucesso diz-se com ✓ e não repete o preço", /✓/.test(ok) && !ok.includes(cobrado));
  t("o pousado não tem palavra de mecanismo", limpo(vis).length === 0, limpo(vis).join(" "));
}
{
  /* a soleira */
  const m = R.momentoDoChamado({ chamado: CH, mod: 2, aoMudar: () => {} });
  t("momentoDoChamado devolve { qual: chamado, momento }", m && m.qual === "chamado" && m.momento.chave === "rasto-1" && m.momento.conteudo);
  const s = html(R.SoleiraDoMomento, { momentos: { [m.qual]: m.momento, proposta: { verbo: "Ir ao mercado", aoPrincipal: () => {} } } });
  t("na soleira, o chamado passa à frente da oferta", /data-momento="chamado"/.test(s) && !/Ir ao mercado/.test(s));
  t("o grupo chama-se «O Mestre pede o dado»", rotulos(s).includes("O Mestre pede o dado"));
  t("e o recuo é «Mudar de ideia», com maiúscula", /Mudar de ideia/.test(texto(s)));
  t("a soleira do chamado não tem palavra de mecanismo", limpo(texto(s)).length === 0, limpo(texto(s)).join(" "));
  const depois = R.momentoDoChamado({ chamado: CH, mod: 2, lance: { n: 8, dados: [{ faces: 20, valor: 15, papel: "teste" }], mod: 2, total: 17, alvo: 14, desfecho: "sucesso" } });
  t("depois do toque não há volta: o secundário some", depois.momento.secundario === null && !/Mudar de ideia/.test(texto(html(R.SoleiraDoMomento, { momentos: { chamado: depois.momento } }))));
  t("sem chamado, momentoDoChamado é null", R.momentoDoChamado(null) === null && R.momentoDoChamado({}) === null);
  /* regressão zero: a rolagem de hoje (o pedido do Mestre) continua igual */
  const hoje = html(R.SoleiraDoMomento, { momentos: { rolagem: { verbo: "Rolar d20 + 3 · Olhar à volta", cede: "Percepção", preco: "precisa de 13", aoPrincipal: () => {}, secundario: { rotulo: "Agora não", aoTocar: () => {} } } } });
  t("sem chamado, a rolagem de hoje aparece como sempre", /data-momento="rolagem"/.test(hoje) && /Agora não/.test(hoje));
  t("um chamado sem conteúdo não existe", html(R.SoleiraDoMomento, { momentos: { chamado: { chave: "x" } } }) === "");
}
{
  /* a preferência */
  const nao = html(R.RolaPorMim, {});
  const sim = html(R.RolaPorMim, { ligado: true });
  const P = C.preferencia;
  t("a preferência: aria-pressed e o rótulo com sim | não", /aria-pressed="false"/.test(nao) && texto(nao).includes(`${P.rotulo}: ${P.nao}`) && /aria-pressed="true"/.test(sim) && texto(sim).includes(`${P.rotulo}: ${P.sim}`));
  t("e a linha que diz o que faz", texto(nao).includes(P.diz));
  t("tem 48 de alto, a forma de «Rolagens do mundo à vista»", new RegExp(`min-height:${ALVOS.piso}px`).test(nao) && /w-full tv-mono rounded-lg/.test(nao));
}
{
  /* a Bandeja continua a mesma depois de o relógio sair dela */
  const b = html(R.Bandeja, { lancamentos: [{ n: 3, dados: [{ faces: 20, valor: 15, papel: "teste" }], mod: 2, total: 17, alvo: 14, desfecho: "sucesso", rotulo: "Percepção" }] });
  t("a Bandeja ainda pousa e diz o desfecho com o selo", /tv-dado-pousa/.test(b) && /✓ passou/.test(texto(b)));
}

console.log(`\n${bons} ok · ${maus} mal`);
process.exit(maus ? 1 : 0);
