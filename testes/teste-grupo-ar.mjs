/* teste-grupo-ar.mjs (AR5, 06/11/2026) — o Grupo como cartas
   (formas.md §AR 4, §AR 5, §AR 6, §AR 7; Figma 281:1947, 281:2439, 281:2922,
   a carta 272:392).

   Prova:
   1. a tabela CARTA_DO_COMPANHEIRO está em estilo.js com a forma de §AR 6, e
      as cores dela só nomeiam T ou a família de metais;
   2. os pares de letra (e de forma) da carta passam o piso de §AR 5;
   3. o marco que acende tem a duração no CSS e `animation: none` no reduce;
   4. o painel, renderizado de verdade, nos dois leiautes: cada companheiro é
      uma carta com o vínculo e os QUATRO marcos (alcançados pelo valor de
      vinculos.js), «Sabe fazer» com o mesmo nó da árvore, e TODA ação de
      antes — a bolsa, a ficha, o caminho, tirar do grupo (com o veredito
      antes do clique) — mais o lugar livre;
   5. o App liga o painel na gaveta e em tela inteira, e as portas abrem a
      carta do companheiro.

   O JSX não corre em Node: empacota-se um ponto de entrada com o esbuild (o
   mesmo de teste-talentos-ar) e lê-se o HTML de renderToStaticMarkup. */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { buildSync } from "esbuild";
import { T, TIPOS, FOLHA, MOLDURA_POR_DEGRAU, CARTA_DO_COMPANHEIRO, NO_DE_TALENTO } from "../src/estilo.js";
import { MAX_COMPANHEIROS } from "../src/constantes.js";
import { MARCOS_VINCULO, VINCULO_MAX } from "../src/vinculos.js";
import { garantirFichaCompanheiro } from "../src/companheiros.js";
import { razao, rgb } from "./conta-da-luz.mjs";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? "\n      " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const AQUI = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(AQUI, "..", "src");
const OURO = MOLDURA_POR_DEGRAU.ouro;
const C = CARTA_DO_COMPANHEIRO;

/* ============================================================ */
sec("1. a tabela de §AR 6");
{
  t("a carta: 400 na mesa, 343 no telefone; raio 14; enchimento 20 / 14",
    C.largura.mesa === 400 && C.largura.telefone === 343 && C.raio === 14 && C.enchimento.mesa === 20 && C.enchimento.telefone === 14);
  t("o retrato inteiro na mesa e a meio no telefone; o nome 18 na placa, TIPOS.titulo ao lado",
    C.retrato.mesa === 1 && C.retrato.telefone === 0.5 && C.nomeNaPlaca.mesa === 18 && C.nome.telefone === TIPOS.titulo);
  t("as barras de 8, o losango do marco de 11, três nós em «Sabe fazer»", C.barra === 8 && C.marco.lado === 11 && C.sabeFazer === 3);
  t("o marco alcançado é ouro; o por alcançar, o chão da carta", C.marco.alcancado === OURO.meio && C.marco.porAlcancar === T.panel);
  t("o losango acende em 320 ms (§AR 7)", C.acende.dura === 320);
  const permitidas = new Set([...Object.values(T), ...Object.values(MOLDURA_POR_DEGRAU).flatMap((m) => Object.values(m)).filter((x) => typeof x === "string")]);
  const soltas = [];
  const varrer = (o, onde) => {
    for (const [k, x] of Object.entries(o)) {
      if (typeof x === "string" && !permitidas.has(x)) soltas.push(`${onde}.${k}=${x}`);
      else if (x && typeof x === "object" && !Array.isArray(x)) varrer(x, `${onde}.${k}`);
    }
  };
  varrer(C, "CARTA_DO_COMPANHEIRO");
  t("toda cor da tabela é de T ou dos metais", soltas.length === 0, soltas.join(", "));
}

/* ============================================================ */
sec("2. o contraste de §AR 5 (letra ≥ 4,5; forma ≥ 3)");
{
  const LETRA = [
    ["classe do companheiro mundoSoft / panel", T.mundoSoft, T.panel],
    ["nome ouroClaro / panel", OURO.claro, T.panel],
    ["vínculo inkMeio / panel", T.inkMeio, T.panel],
    ["linha do próximo marco inkDim / panel", T.inkDim, T.panel],
    ["número da barra ink / panel", T.ink, T.panel],
    ["«Sabe fazer» inkDim / panel", T.inkDim, T.panel],
    ["o verbo da porta ink / feltro", T.ink, T.bg],
    ["a nota da porta inkDim / feltro", T.inkDim, T.bg],
    ["«Tirar» danger / feltro", T.danger, T.bg],
    ["«Todas as N» violetSoft / panel", T.violetSoft, T.panel],
  ];
  for (const [n, fg, bg] of LETRA) { const r = razao(rgb(fg), rgb(bg)); t(`${n}: ${r.toFixed(2)} ≥ 4,5`, r >= 4.5); }
  const FORMA = [
    ["marco alcançado ouro / panel", C.marco.alcancado, T.panel],
    ["aro do marco por alcançar lineStrong / panel", T.lineStrong, T.panel],
    ["a pista do vínculo violet / panel", T.violet, T.panel],
    ["PV danger / feltro", T.danger, T.bg],
    ["PM violet / feltro", T.violet, T.bg],
  ];
  for (const [n, fg, bg] of FORMA) { const r = razao(rgb(fg), rgb(bg)); t(`(forma) ${n}: ${r.toFixed(2)} ≥ 3`, r >= 3); }
}

/* ============================================================ */
sec("3. o marco acende: o tempo no CSS, e parado no reduce");
{
  const fora = FOLHA.split("@media (prefers-reduced-motion: reduce)")[0];
  t("o losango acende com a duração da tabela", new RegExp(`\\.tv-marco-acende \\{ animation: \\w+ ${C.acende.dura}ms`).test(fora));
  const reduce = FOLHA.split("@media (prefers-reduced-motion: reduce)").slice(1).join("");
  t("no reduce, troca seca (animation: none)", /\.tv-marco-acende \{ animation: none; \}/.test(reduce));
}

/* ============================================================
   4 · O QUE SE VÊ */
const ENTRADA = `
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PainelGrupo, CartaDoCompanheiro, PistaDoVinculo, SeletorCaminho } from "./painel-grupo.jsx";
export const html = (el) => renderToStaticMarkup(el);
export { React, PainelGrupo, CartaDoCompanheiro, PistaDoVinculo, SeletorCaminho };
`;
const saida = path.join(AQUI, `.tmp-grupo-ar-${process.pid}.mjs`);
buildSync({
  stdin: { contents: ENTRADA, resolveDir: SRC, loader: "jsx", sourcefile: "entrada-grupo.jsx" },
  bundle: true, format: "esm", platform: "node", outfile: saida, jsx: "transform", logLevel: "silent", external: ["react", "react-dom", "react-dom/server"],
  loader: { ".js": "jsx" }, define: { "process.env.NODE_ENV": '"production"' },
});
const R = await import(pathToFileURL(saida).href);
fs.rmSync(saida, { force: true });
const h = R.React.createElement;
const html = (c, p) => R.html(h(c, p));
const texto = (s) => s.replace(/<[^>]+>/g, " ").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/\s+/g, " ");
const nada = () => {};

/* a Ilsa (com classe, vínculo 62, mais de três habilidades) e o Bram (sem classe, vínculo 31) */
const ilsa = { ...garantirFichaCompanheiro({ nome: "Ilsa", classe: "Clérigo", nivel: 7, vida: 22, vidaMax: 30 }), vinculo: 62, inventario: ["Corda", "Tocha"] };
const bram = { ...garantirFichaCompanheiro({ nome: "Bram", nivel: 3, vida: 30, vidaMax: 30 }), classe: "", vinculo: 31 };
const heroi = { nome: "Vera", nivel: 7, moedas: 120, grupo: [ilsa, bram] };
const acoes = { trocarCaminho: nada, removerDoGrupo: nada, aoAbrirBolsa: nada, aoVerFicha: nada, aoFechar: nada };

sec("4a. o vínculo e os quatro marcos");
{
  const p = html(R.PistaDoVinculo, { vinculo: 62 });
  const marcos = [...p.matchAll(/data-marco="([^"]+)" data-alcancado="(\w+)"/g)].map((m) => [m[1], m[2]]);
  t("os quatro marcos de MARCOS_VINCULO, pela ordem", marcos.map((m) => m[0]).join(",") === MARCOS_VINCULO.map((m) => m.nome).join(","));
  t("aos 62: alcançados os de 25 e 50, por alcançar os de 75 e 100", marcos.map((m) => m[1]).join(",") === MARCOS_VINCULO.map((m) => (62 >= m.valor ? "sim" : "nao")).join(","));
  t("a linha diz o próximo: «62 → Lealdade aos 75»", texto(p).includes("62 → Lealdade aos 75") && texto(p).includes("Vínculo · Amizade"));
  t("no máximo, diz o máximo", texto(html(R.PistaDoVinculo, { vinculo: VINCULO_MAX })).includes(`${VINCULO_MAX} · o máximo`));
  t("o alcançado é ouro; o por alcançar, o chão com aro", p.includes(`background:${C.marco.alcancado}`) && p.includes(`background:${C.marco.porAlcancar}`));
  t("a pista diz-se por extenso a quem não vê", /role="img" aria-label="Vínculo 62 de 100; 2 marcos alcançados de 4"/.test(p));
}

for (const leiaute of ["mesa", "telefone"]) {
  sec(`4b. o painel (${leiaute})`);
  const g = html(R.PainelGrupo, { personagem: heroi, leiaute, ...acoes });
  const tg = texto(g);
  t("o leiaute é o pedido", g.includes(`data-leiaute="${leiaute}"`));
  t("uma carta por companheiro, com data-membro e foco programático",
    /data-membro="Ilsa" tabindex="-1"/.test(g) && /data-membro="Bram" tabindex="-1"/.test(g));
  t("o cabeçalho conta e diz o lugar livre", tg.includes(`2 companheiros · ${MAX_COMPANHEIROS - 2 === 1 ? "1 lugar livre" : `${MAX_COMPANHEIROS - 2} lugares livres`}`));
  t("o fechar está no cabeçalho", /aria-label="Fechar"/.test(g));
  t("cada carta leva os quatro marcos", (g.match(/data-marco=/g) || []).length === 2 * MARCOS_VINCULO.length);
  t("a classe da Ilsa na carta", tg.includes("Clérigo"));
  t("PV e PM na carta", tg.includes(`PV ${ilsa.vida}/${ilsa.vidaMax}`) && tg.includes(`PM ${ilsa.mana}/${ilsa.manaMax}`));
  const nos = [...g.matchAll(/aria-label="([^"]+?) — sabe fazer" data-estado="(\w+)" data-ramo="(\w+)"/g)];
  t("«Sabe fazer» com o nó da árvore, aprendido, três por carta", tg.includes("Sabe fazer") && nos.length >= 3 && nos.every((m) => m[2] === "aprendido") && nos.filter((m) => ilsa.habilidades.some((x) => x.nome === m[1].replace(/&#x27;/g, "'"))).length === Math.min(C.sabeFazer, ilsa.habilidades.length));
  t("o nó tem a largura do nó da árvore", g.includes(`width:${leiaute === "telefone" ? NO_DE_TALENTO.largura.telefone : NO_DE_TALENTO.largura.mesa}px`));
  if (ilsa.habilidades.length > C.sabeFazer) t("as que não cabem estão a um toque", tg.includes(`Todas as ${ilsa.habilidades.length}`));
  /* as ações de antes, todas: a bolsa (AR3), a ficha, o caminho, tirar do grupo */
  t("a porta da bolsa, com o que leva", tg.includes("Abrir a bolsa de Ilsa 2 coisas") && tg.includes("Abrir a bolsa de Bram"));
  /* AR8 (06/11): a nota só promete atributos a quem os tem (D5 da prova jogada —
     a etiqueta prometia o que a ficha não mostrava); o companheiro sem
     atributos diz só «talentos». A porta continua uma por carta. */
  t("a porta da ficha", (tg.match(/Ver a ficha (atributos e )?talentos/g) || []).length === 2);
  t("trilhar (com classe) ou definir (sem) o caminho", tg.includes("Trilhar novo caminho") && tg.includes("Definir caminho"));
  t("tirar do grupo", (tg.match(/Tirar do grupo/g) || []).length === 2);
  t("o lugar livre diz onde se encontra gente", tg.includes("Um lugar à fogueira") && tg.includes("nas tavernas"));
  t("o sistema não fala de si: nenhum nome de mecanismo", !/postura|preset|modo |VINCULO|marcoDe/.test(tg));
}

sec("4c. o veredito antes do clique, e o caminho");
{
  const conf = texto(html(R.CartaDoCompanheiro, { c: ilsa, aoRemover: nada, confirmarInicial: true }));
  t("tirar do grupo mostra o que se perde antes de acontecer", conf.includes("Ilsa deixa o grupo, e leva o que tem na bolsa.") && conf.includes("Tirar Ilsa") && conf.includes("Fica"));
  const cam = texto(html(R.CartaDoCompanheiro, { c: ilsa, aoTrocarCaminho: nada, caminhoAberto: true,
    caminho: h(R.SeletorCaminho, { mundo: null, alvo: "Ilsa", atual: ilsa, acampado: true, trocarCaminho: nada, fechar: nada }) }));
  t("o caminho abre o seletor, com o preço no verbo", cam.includes("Trilhar novo caminho · 80 moedas") && cam.includes("Confirmar · 80 moedas"));
  const fora = texto(html(R.SeletorCaminho, { mundo: null, alvo: "Bram", atual: bram, acampado: false, trocarCaminho: nada, fechar: nada }));
  t("fora do acampamento, diz porquê", fora.includes("Você precisa estar acampado"));
  t("sozinho, diz que viaja só", texto(html(R.PainelGrupo, { personagem: { nome: "V", grupo: [] }, leiaute: "mesa" })).includes("Viajas sozinho"));
}

/* ============================================================ */
sec("5. a ligação no App");
{
  const APP = fs.readFileSync(path.join(SRC, "App.jsx"), "utf8");
  t("o App importa o painel e o seletor de lá", /import \{ PainelGrupo, SeletorCaminho \} from "\.\/painel-grupo\.jsx";/.test(APP) && !/function SeletorCaminho\(/.test(APP) && !/function CartaoMembro\(/.test(APP));
  t("na gaveta (telefone) e em tela inteira (mesa)", /subGestao === "grupo" && !heroiNaMesa && \(\s*<LimiteDasFichas key="grupo-na-gaveta">\s*<PainelGrupo \{\.\.\.propsDoGrupo\} \/>/.test(APP)
    && /if \(!\(aba === "gestao" && subGestao === "grupo" && heroiNaMesa\)\) return null;/.test(APP) && /<PainelGrupo \{\.\.\.propsDoGrupo\} aoFechar=\{fecharGrupo\} \/>/.test(APP));
  t("as portas abrem a carta do companheiro: a bolsa no boneco, a ficha na ficha",
    /aoAbrirBolsa: abrirCartaDoCompanheiro\("equipamento"\), aoVerFicha: abrirCartaDoCompanheiro\("ficha"\)/.test(APP)
    && /const daBolsa = abaDaCarta && comp \? abaDaCarta === "equipamento" : aba === "inv" \|\| !!comp;/.test(APP));
  t("a fiação nova não custa o turno", /try \{ setInvDe\(nome\); setAbaDaCarta\(qual\); setSubGestao\("ficha"\); \} catch \(e\) \{ calou\(/.test(APP)
    && /try \{ trocarCaminho\(alvo, esc\); \} catch/.test(APP) && /try \{ removerDoGrupo\(nome\); \} catch/.test(APP) && /calou\("o grupo por cima", e\)/.test(APP));
}

console.log(`\ngrupo-ar: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
