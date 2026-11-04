/* A MESA À LUZ DE VELA (C) — 04/11/2026 — src/estilo.js, o bloco T

   A ordem da pessoa: «precisamos de uma casca pro nosso rpg». A paleta da
   v3 saiu para a da vela (mente/formas.md §«A mesa à luz de vela (C)»).
   Esta suíte prende o que a mesa de design mediu antes de entregar:
   §1 a folha de pergaminho: a prosa ≥ 7 (AAA) mesmo no pior ponto da
      vinheta; a fala do jogador, o rótulo e as cinco tintas de acento
      ≥ 4,5 no pior ponto; a folha contra a madeira ≥ 3;
   §2 a mesa escura: a tinta e os acentos sobre madeira, cinta e couro;
   §3 os dados: os cinco corpos ≥ 3 contra o couro da bandeja, e o número
      de cada papel ≥ 4,5 sobre o seu corpo;
   §4 a noite fria saiu: nenhum dos três neons da v3 ficou em T. */
import { T, FORMAS_DO_DADO, PAPEL_DO_DADO, BANDEJA, MOVIMENTO_DO_DADO } from "../src/estilo.js";
import { A_BANDEJA } from "../src/motor/a-bandeja.js";
import { rgb, razao } from "./conta-da-luz.mjs";

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const r = (a, b) => razao(rgb(a), rgb(b));
const f2 = (x) => x.toFixed(2);

/* o pior ponto da folha: o pergaminho com a vinheta no máximo (a borda a 0,75) */
const misturar = (a, b, p) => "#" + rgb(a).map((c, i) => Math.round(c + (rgb(b)[i] - c) * p).toString(16).padStart(2, "0")).join("");
const PIOR = misturar(T.pergaminho, T.pergaminhoBorda, 0.75);

sec("§1 a folha de pergaminho");
{
  t(`a prosa no centro da folha ≥ 7 (${f2(r(T.tintaDoPergaminho, T.pergaminho))})`, r(T.tintaDoPergaminho, T.pergaminho) >= 7);
  t(`a prosa no pior ponto da vinheta ≥ 7 (${f2(r(T.tintaDoPergaminho, PIOR))})`, r(T.tintaDoPergaminho, PIOR) >= 7);
  for (const k of ["tintaDoPergaminhoMeio", "tintaDoPergaminhoDim", "brasaNoPergaminho", "perigoNoPergaminho", "musgoNoPergaminho", "azulNoPergaminho"]) {
    t(`${k} no pior ponto ≥ 4,5 (${f2(r(T[k], PIOR))})`, r(T[k], PIOR) >= 4.5);
  }
  t(`a folha contra a madeira ≥ 3 (${f2(r(T.pergaminho, T.bg))})`, r(T.pergaminho, T.bg) >= 3);
  t(`o glifo em pergaminho sobre o lacre ≥ 4,5 (${f2(r(T.pergaminho, T.lacreNoPergaminho))})`, r(T.pergaminho, T.lacreNoPergaminho) >= 4.5);
}

sec("§2 a mesa escura");
{
  for (const chao of ["bg", "panel", "panelSoft", "pagina"]) {
    t(`ink sobre ${chao} ≥ 7 (${f2(r(T.ink, T[chao]))})`, r(T.ink, T[chao]) >= 7);
    t(`inkDim sobre ${chao} ≥ 4,5 (${f2(r(T.inkDim, T[chao]))})`, r(T.inkDim, T[chao]) >= 4.5);
    t(`danger sobre ${chao} ≥ 4,5 (${f2(r(T.danger, T[chao]))})`, r(T.danger, T[chao]) >= 4.5);
    t(`a borda de controlo sobre ${chao} ≥ 3 (${f2(r(T.lineStrong, T[chao]))})`, r(T.lineStrong, T[chao]) >= 3);
  }
  t(`onAccent sobre o âmbar ≥ 4,5 (${f2(r(T.onAccent, T.amber))})`, r(T.onAccent, T.amber) >= 4.5);
  t(`ok sobre okFundo ≥ 4,5 (${f2(r(T.ok, T.okFundo))})`, r(T.ok, T.okFundo) >= 4.5);
  t(`danger sobre perigoFundo ≥ 4,5 (${f2(r(T.danger, T.perigoFundo))})`, r(T.danger, T.perigoFundo) >= 4.5);
}

sec("§3 os dados");
{
  const PAPEIS = { teste: ["amber", "onAccent"], dano: ["danger", "onAccent"], cura: ["ok", "onAccent"], sorte: ["violet", "onSecond"], uso: ["inkMeio", "onAccent"] };
  for (const [papel, [corpo, numero]] of Object.entries(PAPEIS)) {
    t(`${papel}: o corpo (${corpo}) contra o couro ≥ 3 (${f2(r(T[corpo], T.pagina))})`, r(T[corpo], T.pagina) >= 3);
    t(`${papel}: o número (${numero}) sobre o corpo ≥ 4,5 (${f2(r(T[numero], T[corpo]))})`, r(T[numero], T[corpo]) >= 4.5);
  }
}

sec("§4 a noite fria saiu");
{
  const valores = Object.values(T).map((v) => String(v).toUpperCase());
  for (const neon of ["#12101F", "#00BBF9", "#F15BB5"]) t(`${neon} (a v3) já não está em T`, !valores.includes(neon));
  t("toda chave de T é uma cor de seis dígitos", Object.values(T).every((v) => /^#[0-9A-Fa-f]{6}$/.test(v)));
}

sec("§5 a forma da bandeja (FORMAS_DO_DADO, PAPEL_DO_DADO, BANDEJA, MOVIMENTO_DO_DADO)");
{
  t("toda face que o motor conhece tem forma", A_BANDEJA.faces.every((f) => FORMAS_DO_DADO[f]));
  t("toda forma desenhável tem corpo e número", Object.entries(FORMAS_DO_DADO).filter(([k]) => k !== "100").every(([, f]) => (f.corpo || f.retangulo) && Array.isArray(f.numero) && f.tam >= 12));
  t("o d100 desenha-se como d10", FORMAS_DO_DADO[100].de === 10);
  t("todo papel do motor tem cor, e só nomeia chaves de T", A_BANDEJA.papeis.every((p) => PAPEL_DO_DADO[p] && T[PAPEL_DO_DADO[p].corpo] && T[PAPEL_DO_DADO[p].numero]));
  t("o dado da bandeja mede o piso de toque (48)", BANDEJA.dado >= 48 && BANDEJA.altura.mesa >= BANDEJA.dado);
  t("o movimento tem saída, e o lance acaba antes de 1,22 s", MOVIMENTO_DO_DADO.semMovimento > 0 && MOVIMENTO_DO_DADO.rolar + MOVIMENTO_DO_DADO.pousar + MOVIMENTO_DO_DADO.veredito < 1220);
}

console.log(`\na mesa C: ${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
