/* AAA · AS MOLDURAS VIVAS (05/11/2026) — formas.md §AAA §1, §6, §7, §8, §9

   Prova as tabelas de estilo.js e a conta pura de src/moldura.js: o degrau
   pelo nível (com as fronteiras), a gema de cada uma das 36 subclasses pelos
   nomes exatos de subclasses.js, a cor de cada raridade do motor, o path de
   cada ícone, toda a cor nomeada a existir, o contraste dos pares de §6 que
   levam letra ou forma, e a porta da geometria contra a fonte que montou o
   Figma (mente/figma/aaa-geometria.mjs) — d a d.

   As peças React (Moldura, CamadaDaMoldura, Gema, IconeDeItem e o
   useMolduraDoAnel de src/painel-moldura.jsx) leem-se aqui como texto: Node
   não corre JSX, e o que se prova delas é que leem as tabelas e não nascem
   com cor solta. */
import { readFileSync } from "node:fs";
import {
  T, MOLDURA_POR_DEGRAU, MOLDURA_DO_INIMIGO, LADO_DA_MOLDURA, DISCO_DE_NIVEL, ENGASTE_VAZIO,
  PECAS_DA_MOLDURA, VB_DA_MOLDURA, GEMA_DA_SUBCLASSE, COR_DA_RARIDADE, GLIFO_DO_ENCAIXE,
  ICONES_DE_ITEM, ICONES_DE_ATRIBUTO, CERIMONIA_DO_NIVEL, VELA, TAMANHOS_DA_MOLDURA,
  ESTADOS_DA_MOLDURA, BORDA_DA_MESA, MAPA_VIVO, MOVIMENTO_CSS,
} from "../src/estilo.js";
import { degrauDaMoldura, gemaDe, molduraDe, partesDaMoldura, partesDaCarta } from "../src/moldura.js";
import { SUBCLASSES } from "../src/subclasses.js";
import { CLASSES } from "../src/classes.js";
import { TIER } from "../src/afixos.js";
import { ATRIBUTOS } from "../src/constantes.js";
import * as FONTE from "../mente/figma/aaa-geometria.mjs";
import { rgb, razao } from "./conta-da-luz.mjs";

let ok = 0, mal = 0;
const t = (nome, cond, diz = "") => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (diz ? "\n      " + diz : "")); } };
const sec = (s) => console.log("\n" + s);
const HEX = /^#[0-9A-F]{6}$/;
const ehHex = (h) => typeof h === "string" && HEX.test(h);

sec("1. o degrau sai do nível (§1: ferro 1–4, bronze 5–9, prata 10–14, ouro 15+)");
{
  const casos = [[1, "ferro"], [4, "ferro"], [5, "bronze"], [9, "bronze"], [10, "prata"], [14, "prata"], [15, "ouro"], [20, "ouro"], [99, "ouro"], [150, "ouro"]];
  for (const [n, d] of casos) t(`nível ${n} → ${d}`, degrauDaMoldura(n) === d, `deu ${degrauDaMoldura(n)}`);
  t("lixo (0, null, «x», −3) é ferro", ["ferro"].includes(degrauDaMoldura(0)) && degrauDaMoldura(null) === "ferro" && degrauDaMoldura("x") === "ferro" && degrauDaMoldura(-3) === "ferro");
  const degs = Object.values(MOLDURA_POR_DEGRAU);
  t("os degraus encadeiam sem buraco (cada de = ate anterior + 1)", degs.every((d, i) => i === 0 ? d.de === 1 : d.de === degs[i - 1].ate + 1));
  t("as camadas só SOMAM: cada degrau tem todas as do anterior menos os rebites do ferro", degs.slice(2).every((d, i) => degs[i + 1].camadas.every((c) => d.camadas.includes(c))));
  t("o degrau novo é uma forma nova: nenhum par de degraus com as mesmas camadas", new Set(degs.map((d) => d.camadas.join())).size === degs.length);
}

sec("2. as 36 gemas, pelos nomes exatos de subclasses.js");
{
  const subs = Object.keys(SUBCLASSES), gemas = Object.keys(GEMA_DA_SUBCLASSE);
  t(`36 subclasses no motor, 36 gemas (${subs.length} · ${gemas.length})`, subs.length === 36 && gemas.length === 36);
  t("toda a subclasse tem gema", subs.every((s) => GEMA_DA_SUBCLASSE[s]), subs.filter((s) => !GEMA_DA_SUBCLASSE[s]).join(", "));
  t("nenhuma gema sem subclasse", gemas.every((g) => SUBCLASSES[g]), gemas.filter((g) => !SUBCLASSES[g]).join(", "));
  const classeDe = {};
  for (const c of CLASSES) for (const s of c.subclasses || []) classeDe[s.nome] = c.nome;
  t("a classe escrita na gema é a de classes.js", gemas.every((g) => classeDe[g] === GEMA_DA_SUBCLASSE[g].classe), gemas.filter((g) => classeDe[g] !== GEMA_DA_SUBCLASSE[g].classe).join(", "));
  t("cada pedra tem corpo, luz e sombra em hex", gemas.every((g) => ["corpo", "luz", "sombra"].every((k) => ehHex(GEMA_DA_SUBCLASSE[g][k]))));
  const pior = Math.min(...gemas.map((g) => razao(rgb(GEMA_DA_SUBCLASSE[g].corpo), rgb(ENGASTE_VAZIO))));
  t(`toda a pedra passa 3:1 contra o furo do engaste (pior ${pior.toFixed(2)}; §6 diz 3,45)`, pior >= 3);
  t("ENGASTE_VAZIO é o furo das peças miúdas", ENGASTE_VAZIO === PECAS_DA_MOLDURA.engaste);
}

sec("3. a gema e o selo de uma pessoa (molduraDe, gemaDe)");
{
  t("sem subclasse, o engaste fica vazio", gemaDe({ classe: "Guerreiro", nivel: 3 }) === null);
  t("a da criação, na classe de origem, acende a gema", gemaDe({ classe: "Guerreiro", subclasse: "Cavaleiro" }) === GEMA_DA_SUBCLASSE.Cavaleiro);
  t("a da árvore manda", gemaDe({ classe: "Mago", subclasse: "Elementalista", subclasses: { Mago: "Necromante" } }) === GEMA_DA_SUBCLASSE.Necromante);
  t("lixo não lança (null, número, {})", gemaDe(null) === null && gemaDe(7) === null && gemaDe({}) === null);
  const m = molduraDe({ nivel: 11, classe: "Ladino", subclasse: "Assassino", especializacoes: { Ladino: "Envenenador" } });
  t("molduraDe: degrau, gema e selo de uma vez", m.degrau === "prata" && m.gema === GEMA_DA_SUBCLASSE.Assassino && m.selo === true && m.nivel === 11 && m.lado === "heroi");
  const v = molduraDe(null, "companheiro");
  t("molduraDe(null) é a de ferro vazia, do lado pedido", v.degrau === "ferro" && v.gema === null && v.selo === false && v.lado === "companheiro");
  t("um lado que não existe volta ao herói", molduraDe({}, "dragao").lado === "heroi");
}

sec("4. a raridade é cor E forma (§3), para toda a raridade do motor");
{
  const ids = Object.keys(TIER);
  t(`toda a raridade de afixos.js tem cor (${ids.join(", ")})`, ids.every((r) => COR_DA_RARIDADE[r]), ids.filter((r) => !COR_DA_RARIDADE[r]).join(", "));
  t("cor, fundo e fundo escolhido em hex; fio 1 ou 2; a forma escrita", ids.every((r) => { const c = COR_DA_RARIDADE[r]; return ehHex(c.cor) && ehHex(c.fundo) && ehHex(c.fundoEscolhido) && [1, 2].includes(c.fio) && c.forma; }));
  t("o lendário deixou de ser a brasa do herói, e o único o vermelho do perigo", COR_DA_RARIDADE.lendario.cor !== T.amber && COR_DA_RARIDADE.unico.cor !== T.danger);
  t("o App lê a cor daqui (RARIDADE_COR = COR_DA_RARIDADE)", /const RARIDADE_COR = Object\.fromEntries\(Object\.entries\(COR_DA_RARIDADE\)/.test(readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8")));
}

sec("5. todo o ícone tem path (quadro 24)");
{
  const itens = Object.entries(ICONES_DE_ITEM);
  t(`18 ícones de item (${itens.length})`, itens.length === 18);
  t("todo o ícone de item é uma lista de d que começam por M", itens.every(([, ds]) => Array.isArray(ds) && ds.length && ds.every((d) => /^M[\d.-]/.test(d))));
  t("todo o glifo do encaixe vazio aponta para um ícone que existe", Object.values(GLIFO_DO_ENCAIXE).every((n) => ICONES_DE_ITEM[n]));
  const atr = ATRIBUTOS.map((a) => a.id);
  t("um ícone por atributo, pelos ids de ATRIBUTOS", atr.length === Object.keys(ICONES_DE_ATRIBUTO).length && atr.every((a) => Array.isArray(ICONES_DE_ATRIBUTO[a]) && ICONES_DE_ATRIBUTO[a].every((d) => /^M/.test(d))));
}

sec("6. toda a cor nomeada existe — em T ou na tabela");
{
  const metais = [...Object.values(MOLDURA_POR_DEGRAU), MOLDURA_DO_INIMIGO.metal];
  t("todo o metal tem claro, meio, escuro e brilho em hex", metais.every((m) => ["claro", "meio", "escuro", "brilho"].every((k) => ehHex(m[k]))));
  t("o fio do lado é T: herói amber, companheiro mundo, inimigo danger", LADO_DA_MOLDURA.heroi.fio === T.amber && LADO_DA_MOLDURA.companheiro.fio === T.mundo && LADO_DA_MOLDURA.inimigo.fio === T.danger);
  t("e a forma também diz o lado: só o herói tem o fio duplo", LADO_DA_MOLDURA.heroi.duplo && !LADO_DA_MOLDURA.companheiro.duplo && !LADO_DA_MOLDURA.inimigo.duplo);
  t("o número do disco é T.ink", DISCO_DE_NIVEL.heroi.numero === T.ink && DISCO_DE_NIVEL.inimigo.numero === T.ink);
  t("os discos em hex", Object.values(DISCO_DE_NIVEL).every((d) => ["corpo", "luz", "sombra"].every((k) => ehHex(d[k]))));
  t("as peças miúdas em hex, e as que repetem T são T", Object.values(PECAS_DA_MOLDURA).every(ehHex) && PECAS_DA_MOLDURA.caixa === T.panel && PECAS_DA_MOLDURA.escudo === T.panelSoft && PECAS_DA_MOLDURA.auraDoChefe === T.danger);
  t("a vela: todas as cores em hex, e o pavio é a tinta da folha", Object.values(VELA.cor).every(ehHex) && VELA.cor.pavio === T.tintaDoPergaminho);
  t("a vela lê as fases do relógio (as de MAPA_VIVO.modoDaFase)", Object.keys(VELA.porFase).sort().join() === Object.keys(MAPA_VIVO.modoDaFase).sort().join());
  t("a borda da mesa lê o ouro das molduras", BORDA_DA_MESA.ouro === MOLDURA_POR_DEGRAU.ouro.meio);
  t("as caixas de VB_DA_MOLDURA são as da fonte (anel, medalhão, carta)", VB_DA_MOLDURA.anel.join() === FONTE.VB.anel.join() && VB_DA_MOLDURA.medalhao.join() === FONTE.VB.medalhao.join() && VB_DA_MOLDURA.carta.join() === FONTE.VB_CARTA.join());
  t("as tabelas de cor são as da fonte, valor a valor", JSON.stringify(MOLDURA_POR_DEGRAU) === JSON.stringify(FONTE.MOLDURA_POR_DEGRAU) && JSON.stringify(MOLDURA_DO_INIMIGO) === JSON.stringify(FONTE.MOLDURA_DO_INIMIGO) && JSON.stringify(DISCO_DE_NIVEL) === JSON.stringify(FONTE.DISCO_DE_NIVEL) && JSON.stringify(VELA) === JSON.stringify(FONTE.VELA) && JSON.stringify(ICONES_DE_ITEM) === JSON.stringify(FONTE.ICONES_DE_ITEM) && JSON.stringify(ICONES_DE_ATRIBUTO) === JSON.stringify(FONTE.ICONES_DE_ATRIBUTO));
}

sec("7. o contraste dos pares de §6 (WCAG 2.2)");
{
  const feltro = rgb(T.bg), madeira = rgb("#1B130D"); /* a madeira de §6, a mesa de antes do feltro */
  const meio = (m) => rgb(m.meio);
  for (const [nome, m] of [...Object.entries(MOLDURA_POR_DEGRAU), ["inimigo", MOLDURA_DO_INIMIGO.metal]]) {
    t(`moldura ${nome}: o meio passa 3:1 contra o feltro (forma; ${razao(meio(m), feltro).toFixed(2)})`, razao(meio(m), feltro) >= 3);
  }
  t("e contra a madeira (§6 mediu as duas)", Object.values(MOLDURA_POR_DEGRAU).every((m) => razao(meio(m), madeira) >= 3));
  for (const [lado, L] of Object.entries(LADO_DA_MOLDURA)) t(`fio ${lado} sobre o fundo do retrato ≥ 3 (${razao(rgb(L.fio), rgb(PECAS_DA_MOLDURA.retrato)).toFixed(2)})`, razao(rgb(L.fio), rgb(PECAS_DA_MOLDURA.retrato)) >= 3);
  for (const [lado, d] of Object.entries(DISCO_DE_NIVEL)) t(`o número do disco (${lado}) passa 4,5 sobre o corpo (${razao(rgb(d.numero), rgb(d.corpo)).toFixed(2)})`, razao(rgb(d.numero), rgb(d.corpo)) >= 4.5);
  for (const [r, c] of Object.entries(COR_DA_RARIDADE)) {
    const letra = Math.min(razao(rgb(c.cor), rgb(T.panel)), razao(rgb(c.cor), rgb(T.panelSoft)));
    t(`raridade ${r}: a letra passa 4,5 em panel/panelSoft (${letra.toFixed(2)}) e a borda 3 no fundo do encaixe (${razao(rgb(c.cor), rgb(c.fundo)).toFixed(2)})`, letra >= 4.5 && razao(rgb(c.cor), rgb(c.fundo)) >= 3);
  }
  t("o rótulo do disco (inkDim) passa 4,5 sobre o feltro", razao(rgb(T.inkDim), feltro) >= 4.5);
  t("ink no número do disco de atributo (panelSoft) ≥ 4,5 e amberSoft no ícone ≥ 3", razao(rgb(T.ink), rgb(T.panelSoft)) >= 4.5 && razao(rgb(T.amberSoft), rgb(T.panelSoft)) >= 3);
  t("danger no −1 (panelSoft) ≥ 4,5", razao(rgb(T.danger), rgb(T.panelSoft)) >= 4.5);
}

sec("8. a geometria é a da fonte (formas.md §8), d a d");
{
  const ds = (svg) => [...svg.matchAll(/ d="([^"]+)"/g)].map((m) => m[1]).sort();
  const dsP = (p) => { const out = []; const andar = (l) => { for (const [, a, f] of l) { if (a && a.d) out.push(a.d); if (Array.isArray(f)) andar(f); } }; andar([...p.abaixo, ...p.acima]); return out.sort(); };
  const g = GEMA_DA_SUBCLASSE.Cavaleiro;
  for (const degrau of Object.keys(MOLDURA_POR_DEGRAU)) for (const forma of ["anel", "medalhao"]) for (const sel of [false, true]) {
    const a = ds(FONTE.medalhao({ degrau, forma, g, especialista: sel, tamanho: forma === "anel" ? 40 : 64 }));
    const b = dsP(partesDaMoldura({ degrau, forma, gema: g, selo: sel }));
    t(`${forma} ${degrau}${sel ? " com selo" : ""}: ${b.length} paths iguais aos da fonte`, a.join("|") === b.join("|"));
  }
  for (const tier of ["comum", "elite", "chefe"]) {
    const a = ds(FONTE.medalhao({ lado: "inimigo", tier }));
    const b = dsP(partesDaMoldura({ lado: "inimigo", tier }));
    t(`inimigo ${tier}: olho no lugar da gema, paths iguais`, a.join("|") === b.join("|"));
  }
  for (const degrau of Object.keys(MOLDURA_POR_DEGRAU)) {
    const a = ds(FONTE.carta({ degrau, g, especialista: true }));
    const b = dsP(partesDaCarta({ degrau, gema: g, selo: true }));
    t(`carta ${degrau}: paths iguais`, a.join("|") === b.join("|"));
  }
  const vazio = partesDaMoldura({ degrau: "ferro" });
  t("sem gema, o engaste vazio (o anel de sombra, sem pedra)", JSON.stringify(vazio.acima).includes(PECAS_DA_MOLDURA.furo) && !JSON.stringify(vazio.acima).includes("data-gema"));
  t("a gema só anima quando acende (nunca ao montar)", !JSON.stringify(partesDaMoldura({ gema: g })).includes("tv-moldura-gema") && JSON.stringify(partesDaMoldura({ gema: g, acende: true })).includes("tv-moldura-gema"));
  t("só o ouro leva o lume", JSON.stringify(partesDaMoldura({ degrau: "ouro" })).includes("tv-moldura-lume") && !JSON.stringify(partesDaMoldura({ degrau: "prata" })).includes("tv-moldura-lume"));
  const ids = JSON.stringify(partesDaMoldura({ degrau: "bronze", id: "zz" }));
  t("os gradientes levam o prefixo pedido (duas molduras não partilham «m»)", ids.includes("url(#zz-m)") && !ids.includes("url(#m)"));
  t("o disco só com comDisco, e o rebite de 135° cede-lhe o lugar", partesDaMoldura({ comDisco: false }).numero === null && partesDaMoldura({}).numero !== null);
}

sec("9. o tamanho e o movimento (§1, §9)");
{
  t("o anel vai de 36 a 44, o disco desde 40, e o número em Cinzel 9 / 10 / 15", TAMANHOS_DA_MOLDURA.anel.de === 36 && TAMANHOS_DA_MOLDURA.anel.ate === 44 && TAMANHOS_DA_MOLDURA.anel.discoDesde === 40 && TAMANHOS_DA_MOLDURA.anel.numero === 9 && TAMANHOS_DA_MOLDURA.medalhao.numero === 10 && TAMANHOS_DA_MOLDURA.carta.numero === 15);
  t("o lume do ouro: 8 s a 0,35; a gema acende em 520 ms (0,6 → 1,12 → 1)", ESTADOS_DA_MOLDURA.lume === 8000 && ESTADOS_DA_MOLDURA.alfaDoLume === 0.35 && ESTADOS_DA_MOLDURA.gema === 520 && ESTADOS_DA_MOLDURA.gemaDe === 0.6 && ESTADOS_DA_MOLDURA.gemaPico === 1.12 && ESTADOS_DA_MOLDURA.tombado === 0.8);
  t("a cerimónia acaba quando a escolha aparece (total = escolha.de + escolha.dura)", CERIMONIA_DO_NIVEL.total === CERIMONIA_DO_NIVEL.escolha.de + CERIMONIA_DO_NIVEL.escolha.dura && CERIMONIA_DO_NIVEL.gema.dura === ESTADOS_DA_MOLDURA.gema);
  const iMedia = MOVIMENTO_CSS.indexOf("@media (prefers-reduced-motion");
  const antes = MOVIMENTO_CSS.slice(0, iMedia), depois = MOVIMENTO_CSS.slice(iMedia);
  t("o CSS do lume e da gema traz a duração de ESTADOS_DA_MOLDURA", antes.includes(`tvMolduraLume ${ESTADOS_DA_MOLDURA.lume}ms`) && antes.includes(`tvMolduraGema ${ESTADOS_DA_MOLDURA.gema}ms`));
  t("e para com reduce: animation none nas duas", /\.tv-moldura-lume, \.tv-moldura-gema \{ animation: none; \}/.test(depois));
}

sec("10. as peças React leem as tabelas (texto de painel-moldura.jsx, ui.jsx, painel-ficha.jsx)");
{
  const pm = readFileSync(new URL("../src/painel-moldura.jsx", import.meta.url), "utf8");
  const ui = readFileSync(new URL("../src/ui.jsx", import.meta.url), "utf8");
  const ficha = readFileSync(new URL("../src/painel-ficha.jsx", import.meta.url), "utf8");
  t("painel-moldura.jsx não tem uma cor solta", !/#[0-9A-Fa-f]{3,8}\b|rgba?\(/.test(pm.replace(/\/\*[\s\S]*?\*\//g, "")));
  t("exporta Moldura, CamadaDaMoldura, Gema, IconeDeItem e useMolduraDoAnel", ["Moldura", "CamadaDaMoldura", "Gema", "IconeDeItem", "useMolduraDoAnel"].every((n) => new RegExp(`export function ${n}\\b`).test(pm)));
  t("o IconeDeItem desenha os paths de ICONES_DE_ITEM", /ICONES_DE_ITEM\[nome\]/.test(pm));
  t("o Anel da cinta veste a moldura (useMolduraDoAnel), por cima e por baixo do arco", /useMolduraDoAnel\(ente, lado, tamanho, discoDeNivel\)/.test(ui) && /camada="abaixo"/.test(ui) && /camada="acima"/.test(ui));
  t("e o arco de vida fica onde está: a pista panelSoft só cede quando há moldura", /\{!moldura && <circle cx=\{meio\} cy=\{meio\} r=\{r\} fill="none" stroke=\{T\.panelSoft\}/.test(ui));
  t("os companheiros da cinta dizem o lado", (ui.match(/<Anel ente=\{c\} lado="companheiro"/g) || []).length === 2);
  t("a ficha do herói põe o rosto no medalhão (Moldura tamanho medalhao, por molduraDe)", /<Moldura tamanho="medalhao"/.test(ficha) && /molduraDe\(p, "heroi"\)/.test(ficha));
}

console.log(`\n${ok} ok · ${mal} falhas`);
if (mal) process.exit(1);
