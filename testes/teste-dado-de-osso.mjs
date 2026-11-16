/* ============================================================
   O DADO DE OSSO (V3 · 16/11/2026) — testes/teste-dado-de-osso.mjs

   A forma do F2 (formas.md §«A Mesa do Mestre · F2» §2): as sete formas
   por tabela (o d20 icosaedro de dez faces), os tamanhos, os estados, o
   histórico, o contraste medido, e o DadoDeOsso renderizado. E a lei da
   forma única: fora da luta, só o DadoDeOsso desenha um dado.
   ============================================================ */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { buildSync } from "esbuild";
import { T, FORMAS_DO_DADO, TAMANHO_DO_DADO, OSSO_DO_DADO, ESTADO_DO_DADO, HISTORICO_DO_DADO, LUZ_DA_MESA } from "../src/estilo.js";
import * as ESTILO from "../src/estilo.js";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(AQUI, "..", "src");
let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (n) => console.log("\n" + n);

/* a conta da luz (WCAG 2.2) */
const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const lum = (hex) => { const h = hex.replace("#", ""); const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b); };
const contraste = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

sec("1. as sete formas (FORMAS_DO_DADO nova)");
{
  const formas = [4, 6, 8, 10, 12, 20];
  t("seis formas desenháveis + o d100 (dois d10)", formas.every((f) => FORMAS_DO_DADO[f] && FORMAS_DO_DADO[f].faces) && FORMAS_DO_DADO[100].de === 10);
  t("o d20 tem DEZ faces (o icosaedro, não sete traços)", FORMAS_DO_DADO[20].faces.length === 10);
  t("e a primeira é a TRL lume, a do número", FORMAS_DO_DADO[20].faces[0][0] === "24,9.3 36.73,31.35 11.27,31.35" && FORMAS_DO_DADO[20].faces[0][1] === "lume");
  t("o número de toda forma vai numa face lume (pelo ponto dentro do polígono)", formas.every((n) => {
    const f = FORMAS_DO_DADO[n];
    const dentro = (p, [x, y]) => { const v = p.split(" ").map((q) => q.split(",").map(Number)); let c = false; for (let i = 0, j = v.length - 1; i < v.length; j = i++) { const [xi, yi] = v[i], [xj, yj] = v[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };
    const onde = f.faces.filter(([p]) => dentro(p, f.numero));
    return onde.length > 0 && onde[onde.length - 1][1] === "lume";
  }));
  t("todo tom nomeia um tom do osso", formas.every((n) => FORMAS_DO_DADO[n].faces.every(([, tom]) => OSSO_DO_DADO.tons[tom])));
  t("os fatores do número são os do F2 (d4 .30 · d6 .34 · d8 .27 · d10 .28 · d12 .27 · d20 .30)",
    [[4, 0.3], [6, 0.34], [8, 0.27], [10, 0.28], [12, 0.27], [20, 0.3]].every(([n, f]) => FORMAS_DO_DADO[n].fator === f));
  t("o d12 tem o pentágono de dentro e cinco trapézios", FORMAS_DO_DADO[12].faces.length === 6 && FORMAS_DO_DADO[12].faces[5][1] === "lume");
}

sec("2. os tamanhos (TAMANHO_DO_DADO) e os estados");
{
  const Z = TAMANHO_DO_DADO;
  t("lance 160 · telefone 128 · luta 112 · bandeja 76 · dano 44 · histórico 40 · botão 36",
    Z.lance === 160 && Z.lanceTelefone === 128 && Z.luta === 112 && Z.bandeja === 76 && Z.dano === 44 && Z.historico === 40 && Z.botao === 36);
  t("o lance é 11 × a área do dado de antes (48)", Math.round((Z.lance * Z.lance) / (48 * 48)) === 11);
  t("no histórico o número fica a 14 (40 × 0,30 × 1,15), acima do piso de 12", Math.round(Z.historico * FORMAS_DO_DADO[20].fator * Z.fatorDoHistorico) === 14 && Z.pisoDaLetra === 12);
  t("os quatro estados do d20", ["pousado", "vivo", "aceso", "rachado"].every((e) => ESTADO_DO_DADO[e]));
  t("o rachado desce um degrau (lume→meio, osso→sombra, meio→sombra)", ESTADO_DO_DADO.rachado.degrau.lume === "meio" && ESTADO_DO_DADO.rachado.degrau.osso === "sombra" && ESTADO_DO_DADO.rachado.degrau.meio === "sombra");
  t("o histórico: teto de 4, a coroa de latão, o vazado no chão do feltro", HISTORICO_DO_DADO.teto === 4 && HISTORICO_DO_DADO.coroa.cor === T.lataoLume && HISTORICO_DO_DADO.falhou.chao === LUZ_DA_MESA.dia.feltroFundo);
  t("T.ossoMeio é o #CFBF9F do Figma", T.ossoMeio === "#CFBF9F");
  t("o PAPEL_DO_DADO aposentou-se (todo dado é osso)", !("PAPEL_DO_DADO" in ESTILO));
}

sec("3. o contraste do F2 §2 (WCAG 2.2, letra ≥ 4,5)");
{
  const tinta = OSSO_DO_DADO.tinta;
  const pares = [
    ["tinta sobre ossoLume", tinta, T.ossoLume, 14.3], ["tinta sobre osso", tinta, T.osso, 11.81],
    ["tinta sobre ossoMeio", tinta, T.ossoMeio, 9.12], ["tinta sobre ossoSombra (o 1 natural)", tinta, T.ossoSombra, 6.67],
    ["onAccent sobre âmbar (o 20)", T.onAccent, T.amber, 8.68], ["ink sobre o feltro (o vazado)", T.ink, HISTORICO_DO_DADO.falhou.chao, 4.5],
  ];
  for (const [nome, a, b, alvo] of pares) {
    const c = contraste(a, b);
    t(`${nome}: ${c.toFixed(2)} ≥ 4,5 (F2: ${alvo})`, c >= 4.5 && Math.abs(c - alvo) < 0.6 || (alvo === 4.5 && c >= 4.5));
  }
}

sec("4. o DadoDeOsso renderizado");
const ENTRADA = `
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DadoDeOsso } from "./ui.jsx";
import { Corpo } from "./painel-bandeja.jsx";
export const html = (el) => renderToStaticMarkup(el);
export { React, DadoDeOsso, Corpo };
`;
const saida = path.join(AQUI, `.tmp-dado-de-osso-${process.pid}.mjs`);
buildSync({
  stdin: { contents: ENTRADA, resolveDir: SRC, loader: "jsx", sourcefile: "entrada-osso.jsx" },
  bundle: true, format: "esm", platform: "node", outfile: saida, jsx: "automatic", logLevel: "silent", external: ["react", "react-dom", "react-dom/server", "react/jsx-runtime"],
  loader: { ".js": "jsx" }, define: { "process.env.NODE_ENV": '"production"' },
});
const R = await import(pathToFileURL(saida).href);
fs.rmSync(saida, { force: true });
const h = R.React.createElement;
const html = (p) => R.html(h(R.DadoDeOsso, p));
{
  const d = html({ forma: 20, lado: 160, numero: "14" });
  t("o d20 a 160: dez faces + o contorno, e o número", (d.match(/<polygon/g) || []).length === 11 && />14</.test(d) && /width="160"/.test(d));
  const fsz = Number((d.match(/font-size="([0-9.]+)"/) || [])[1]);
  t("o número é Cinzel 700 a 48 px (160 × 0,30)", /font-family="&#x27;Cinzel&#x27;/.test(d) && /font-weight="700"/.test(d) && Math.abs(fsz * (160 / 48) - 48) < 0.01, String(fsz));
  t("tem a sombra de contato e a do corpo", /<ellipse/.test(d) && /drop-shadow/.test(d));
  const v = html({ forma: 20, lado: 160, numero: "7", estado: "vivo" });
  t("vivo: o aro âmbar atrás (× 1,07)", v.includes(`fill="${T.amber}"`) && /scale\(1\.07\)/.test(v));
  const a = html({ forma: 20, lado: 160, numero: "20", estado: "aceso" });
  t("aceso (o 20): a face âmbar, as vizinhas amberSoft, o número onAccent", a.includes(`fill="${T.amber}"`) && a.includes(`fill="${T.amberSoft}"`) && a.includes(`fill="${T.onAccent}"`));
  const r = html({ forma: 20, lado: 160, numero: "1", estado: "rachado" });
  t("rachado (o 1): a fissura, e nenhuma face lume", /class="tv-fissura"/.test(r) && !r.includes(`fill="${T.ossoLume}"`));
  const hf = html({ forma: 20, lado: 40, numero: "6", historico: "falhou" });
  t("histórico falhou: vazado, tracejado, sem faces", /stroke-dasharray/.test(hf) && (hf.match(/<polygon/g) || []).length === 1 && hf.includes(`fill="${T.ink}"`));
  const hv = html({ forma: 20, lado: 40, numero: "20", historico: "vinte" });
  t("histórico vinte: a coroa de latão", hv.includes(HISTORICO_DO_DADO.coroa.pontos) && hv.includes(`fill="${T.lataoLume}"`));
  const hu = html({ forma: 20, lado: 40, numero: "1", historico: "um" });
  t("histórico um: o vazado e a fissura", /stroke-dasharray/.test(hu) && /tv-fissura/.test(hu));
  t("as sete formas renderizam", [4, 6, 8, 10, 12, 20, 100].every((f) => /<svg/.test(html({ forma: f, lado: 76, numero: "3" }))));
  t("o d100: dois d10 (dezenas e unidades)", (() => { const s = html({ forma: 100, lado: 76, numero: "47" }); return />40</.test(s) && />7</.test(s); })());
  t("o Corpo da Bandeja é o osso (sem corpo de cor)", (() => { const s = R.html(h(R.Corpo, { faces: 20, legenda: "9", tam: 44 })); return s.includes(`fill="${T.ossoLume}"`) && !s.includes(`fill="${T.amber}"`); })());
}

sec("5. uma forma só — fora da luta, só o DadoDeOsso desenha um dado");
{
  /* o varredor: nenhum ficheiro de fora da luta desenha um polígono de d20 à
     mão (o hexágono do contorno) nem um hexágono por clip-path — o dado é o
     DadoDeOsso (ui.jsx), e quem o quer importa-o. A luta (grade, painel-batalha)
     fica para o pacote dela e não é varrida. */
  const LUTA = new Set(["grade-de-batalha.jsx", "painel-batalha.jsx", "batalha-na-tela.js"]);
  const ficheiros = fs.readdirSync(SRC).filter((f) => /\.(jsx|js)$/.test(f) && !LUTA.has(f) && f !== "estilo.js");
  const hexagono = /24,3 42\.19,13\.5|polygon\(50% 0%, 100% 27%, 100% 73%, 50% 100%, 0% 73%, 0% 27%\)/;
  const culpados = ficheiros.filter((f) => hexagono.test(fs.readFileSync(path.join(SRC, f), "utf8")));
  t("nenhum hexágono de d20 desenhado à mão fora da luta", culpados.length === 0, culpados.join(", "));
}

console.log(`\no dado de osso: ${ok} ok · ${mal} falhas`);
process.exit(mal ? 1 : 0);
