/* teste-som-da-mesa.mjs (TE, 09/11/2026) — o som da mesa (src/som-da-mesa.js)
   e o seu interruptor (InterruptorDoSom, ui.jsx). formas.md §TE 9; a
   decisão 4 da pessoa: «sim, ligado por omissão e em volume baixo, com o
   interruptor à vista no menu… três momentos só».

   O som não se ouve numa suíte, e não precisa: prova-se o que ele FAZ com
   um AudioContext de mentira, que regista cada oscilador e cada curva de
   ganho. Cada caso importa o módulo de novo (?caso=N), porque o primeiro
   gesto é estado do módulo — e é justamente isso que se prova.

   Prova:
   1. as tabelas: a pentatónica sobe por raridade, a riqueza e a cauda nunca
      descem, o volume é baixo, a preferência guarda-se como as outras;
   2. em Node, sem AudioContext nem janela, nada lança e nada soa;
   3. o gesto primeiro: antes dele o contexto nem nasce; depois, soa;
   4. desligado na preferência, nada soa e o contexto não nasce; ligar volta;
   5. um som que estoura cala-se (o contexto que não nasce, o oscilador que
      lança): false, nunca uma exceção;
   6. com prefers-reduced-motion o som fica;
   7. as camadas nunca somam mais que o teto do volume;
   8. o interruptor: a forma do das rolagens (aria-pressed, 48 de alto), e
      o glifo desenhado. */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { buildSync } from "esbuild";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? "\n      " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const AQUI = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(AQUI, "..", "src");
const URL_SOM = pathToFileURL(path.join(SRC, "som-da-mesa.js")).href;
const FONTE = fs.readFileSync(path.join(SRC, "som-da-mesa.js"), "utf8");
const semComentarios = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
let caso = 0;
const carregar = () => import(`${URL_SOM}?caso=${++caso}`);

/* ---------------- o mundo de mentira ---------------- */
function Param(log) { this.log = log; }
Param.prototype.setValueAtTime = function (v, t) { this.log.push(["set", v, t]); };
Param.prototype.linearRampToValueAtTime = function (v, t) { this.log.push(["lin", v, t]); };
Param.prototype.exponentialRampToValueAtTime = function (v, t) { this.log.push(["exp", v, t]); };
function fazerCtx({ lancaNoOscilador = false, lancaAoNascer = false } = {}) {
  const reg = { nascidos: 0, osciladores: [], ganhos: [], retomados: 0 };
  class Ctx {
    constructor() { if (lancaAoNascer) throw new Error("sem áudio"); reg.nascidos++; this.currentTime = 1; this.state = "running"; this.destination = {}; }
    createOscillator() {
      if (lancaNoOscilador) throw new Error("estourou");
      const o = { type: "", frequency: new Param([]), connect() {}, start(t) { o.inicio = t; }, stop(t) { o.fim = t; } };
      reg.osciladores.push(o);
      return o;
    }
    createGain() { const g = { gain: new Param([]), connect() {} }; reg.ganhos.push(g); return g; }
    resume() { reg.retomados++; }
  }
  return { Ctx, reg };
}
function fazerGuarda(inicial = {}) {
  const m = new Map(Object.entries(inicial));
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), m };
}
/* monta o navegador de mentira: AudioContext, localStorage, a escuta do gesto */
function navegador({ ctx = fazerCtx(), guarda = fazerGuarda(), reduce = false } = {}) {
  const escutas = {};
  globalThis.AudioContext = ctx.Ctx;
  globalThis.localStorage = guarda;
  globalThis.addEventListener = (ev, fn) => { (escutas[ev] = escutas[ev] || []).push(fn); };
  globalThis.matchMedia = (q) => ({ matches: q.includes("reduce") ? reduce : false });
  return { reg: ctx.reg, guarda, gesto: (ev = "pointerdown") => (escutas[ev] || []).forEach((fn) => fn()), escutas };
}
function limpar() {
  for (const k of ["AudioContext", "webkitAudioContext", "localStorage", "addEventListener", "matchMedia"]) delete globalThis[k];
}
/* o pico de cada camada: o valor da rampa linear do ganho */
const picosDe = (reg) => reg.ganhos.map((g) => (g.gain.log.find((x) => x[0] === "lin") || [0, 0])[1]);

/* ============================================================ */
const { SOM_DA_MESA: S } = await carregar();
sec("1. as tabelas");
{
  const ordem = ["comum", "incomum", "raro", "epico", "lendario", "unico"];
  t("as seis raridades têm a sua nota", ordem.every((r) => S.carta[r] && S.carta[r].nota > 0) && Object.keys(S.carta).length === 6);
  /* a pentatónica maior de Dó, temperada: 0, 2, 4, 7, 9 e 12 meios-tons sobre
     a primeira (a 5 cêntimos; as notas da tabela têm duas casas decimais) */
  const PENTA = [0, 2, 4, 7, 9, 12].map((m) => Math.pow(2, m / 12));
  const razoes = ordem.map((r) => S.carta[r].nota / S.carta.comum.nota);
  t("uma nota pentatónica por raridade, sempre a subir", razoes.every((x, i) => Math.abs(1200 * Math.log2(x / PENTA[i])) < 5) && razoes.every((x, i) => i === 0 || x > razoes[i - 1]), razoes.map((x) => x.toFixed(3)).join(" "));
  t("mais rica quanto mais rara: as camadas e a cauda nunca descem",
    ordem.every((r, i) => i === 0 || (S.carta[r].camadas.length >= S.carta[ordem[i - 1]].camadas.length && S.carta[r].dura >= S.carta[ordem[i - 1]].dura))
    && S.carta.unico.camadas.length > S.carta.comum.camadas.length);
  t("a relíquia tem a cauda de 1,2 s (formas.md §TE 9)", S.carta.unico.dura === 1.2);
  t("o dado: duas batidas, a segunda mais fraca; o despertar: um sino grave de 900 ms",
    S.dado.batidas.length === 2 && S.dado.batidas[1].ganho < S.dado.batidas[0].ganho && S.dado.de > S.dado.ate
    && S.despertar.dura === 0.9 && S.despertar.nota < S.carta.comum.nota);
  t("volume baixo: o teto é −18 dB (≤ −12)", S.volumeDb === -18 && S.volumeDb <= -12);
  t("ligado por omissão, guardado como as outras preferências (taverna_cfg_*)", S.porOmissao === true && /^taverna_cfg_/.test(S.chave));
  t("as tabelas não se mudam por fora (congeladas)", Object.isFrozen(S) && Object.isFrozen(S.carta) && Object.isFrozen(S.carta.raro.camadas));
  t("o módulo nunca pergunta pelo movimento: o som fica com o reduce", !/reduced-motion|matchMedia/.test(semComentarios(FONTE)));
  t("e não sorteia nem descarrega nada (sem Math.random, sem ficheiros de áudio)", !/Math\.random|new Audio\(|fetch\(|\.mp3|\.ogg|\.wav/.test(semComentarios(FONTE)));
}

/* ============================================================ */
sec("2. em Node, sem AudioContext nem janela, nada lança e nada soa");
{
  limpar();
  const M = await carregar();
  let lancou = false, r = [];
  try { r = [M.tocarCarta("raro"), M.tocarDado(), M.tocarDespertar(), M.tocarCarta("inexistente")]; } catch (e) { lancou = true; }
  t("as três funções devolvem false, sem exceção", !lancou && r.every((x) => x === false), JSON.stringify(r));
  t("sem guarda, a preferência é a de omissão (ligado)", M.somLigado() === true);
  let lancouLigar = false;
  try { M.ligarSom(false); M.ligarSom(true); } catch (e) { lancouLigar = true; }
  t("ligar e desligar sem guarda não lança", !lancouLigar);
}

/* ============================================================ */
sec("3. o gesto primeiro");
{
  const nav = navegador();
  const M = await carregar();
  t("a escuta do gesto arma-se ao carregar (pointerdown, keydown, touchstart)", S.gestos.every((ev) => (nav.escutas[ev] || []).length === 1));
  t("antes do gesto, tocar cala e o contexto NEM NASCE", M.tocarCarta("raro") === false && M.tocarDado() === false && nav.reg.nascidos === 0);
  nav.gesto();
  t("o primeiro gesto faz nascer o contexto (um só)", nav.reg.nascidos === 1);
  t("depois do gesto, a carta rara soa com as suas três camadas", M.tocarCarta("raro") === true && nav.reg.osciladores.length === S.carta.raro.camadas.length);
  t("…na nota da raridade e nos seus múltiplos", nav.reg.osciladores.map((o) => o.frequency.log[0][1]).join(",") === S.carta.raro.camadas.map((k) => S.carta.raro.nota * k).join(","));
  const antes = nav.reg.osciladores.length;
  t("o dado: duas batidas, a segunda depois da primeira", M.tocarDado() === true && nav.reg.osciladores.length === antes + 2 && nav.reg.osciladores[antes + 1].inicio > nav.reg.osciladores[antes].inicio);
  const antes2 = nav.reg.osciladores.length;
  t("o despertar: o sino com os seus parciais", M.tocarDespertar() === true && nav.reg.osciladores.length === antes2 + S.despertar.parciais.length);
  t("raridade desconhecida cala", M.tocarCarta("mitica") === false);
  nav.gesto("keydown");
  t("um segundo gesto não faz nascer outro contexto", nav.reg.nascidos === 1);
  limpar();
  /* o navegador que já sabe do gesto (userActivation), sem a escuta o ter visto */
  const nav2 = navegador();
  const M2 = await carregar();
  let posto = false;
  try { Object.defineProperty(globalThis, "navigator", { value: { userActivation: { hasBeenActive: true } }, configurable: true, writable: true }); posto = true; } catch (e) { posto = false; }
  if (posto) t("com o userActivation do navegador a dizer que já houve gesto, soa", M2.tocarCarta("comum") === true && nav2.reg.nascidos === 1);
  try { delete globalThis.navigator; } catch (e) { /* segue */ }
  limpar();
}

/* ============================================================ */
sec("4. desligado na preferência, nada soa");
{
  const nav = navegador({ guarda: fazerGuarda({ taverna_cfg_som: "0" }) });
  const M = await carregar();
  t("a preferência guardada «0» lê-se desligada", M.somLigado() === false);
  nav.gesto();
  t("desligado, o gesto não faz nascer o contexto", nav.reg.nascidos === 0);
  t("desligado, nenhuma das três soa", [M.tocarCarta("lendario"), M.tocarDado(), M.tocarDespertar()].every((x) => x === false) && nav.reg.osciladores.length === 0);
  t("ligar guarda «1» e, depois do gesto, acorda o contexto e soa", M.ligarSom(true) === true && nav.guarda.m.get(S.chave) === "1" && nav.reg.nascidos === 1 && M.tocarCarta("comum") === true);
  t("desligar guarda «0» e cala outra vez", M.ligarSom(false) === false && nav.guarda.m.get(S.chave) === "0" && M.tocarDado() === false);
  limpar();
}

/* ============================================================ */
sec("5. um som que estoura cala-se");
{
  const nav = navegador({ ctx: fazerCtx({ lancaNoOscilador: true }) });
  const M = await carregar();
  nav.gesto();
  let lancou = false, r = [];
  try { r = [M.tocarCarta("epico"), M.tocarDado(), M.tocarDespertar()]; } catch (e) { lancou = true; }
  t("o oscilador que lança: false nas três, sem exceção", !lancou && r.every((x) => x === false));
  limpar();
  const nav2 = navegador({ ctx: fazerCtx({ lancaAoNascer: true }) });
  const M2 = await carregar();
  let lancou2 = false, r2 = null;
  try { nav2.gesto(); r2 = M2.tocarCarta("raro"); } catch (e) { lancou2 = true; }
  t("o contexto que não nasce: o gesto não lança, e tocar devolve false", !lancou2 && r2 === false);
  limpar();
  const nav3 = navegador({ guarda: { getItem() { throw new Error("privado"); }, setItem() { throw new Error("cheio"); } } });
  const M3 = await carregar();
  let lancou3 = false;
  try { M3.ligarSom(true); nav3.gesto(); } catch (e) { lancou3 = true; }
  t("a guarda que lança (modo privado, cheia): a preferência cai na de omissão, sem exceção", !lancou3 && M3.somLigado() === true && M3.tocarCarta("raro") === true);
  limpar();
}

/* ============================================================ */
sec("6. com prefers-reduced-motion, o som fica");
{
  const nav = navegador({ reduce: true });
  const M = await carregar();
  nav.gesto();
  t("pedir menos movimento não cala nenhum dos três", M.tocarCarta("raro") && M.tocarDado() && M.tocarDespertar());
  limpar();
}

/* ============================================================ */
sec("7. o volume: as camadas dividem o teto, nunca o somam");
{
  const teto = Math.pow(10, S.volumeDb / 20);
  let pior = 0;
  for (const r of Object.keys(S.carta)) {
    const nav = navegador();
    const M = await carregar();
    nav.gesto();
    M.tocarCarta(r);
    pior = Math.max(pior, picosDe(nav.reg).reduce((a, b) => a + b, 0));
    limpar();
  }
  t(`a carta mais rica soma no máximo o teto (${teto.toFixed(3)})`, pior <= teto + 1e-9 && pior > teto * 0.9, pior.toFixed(4));
  const nav = navegador();
  const M = await carregar();
  nav.gesto();
  M.tocarDespertar();
  const sino = picosDe(nav.reg).reduce((a, b) => a + b, 0);
  t("o sino também", sino <= teto + 1e-9);
  const envelope = nav.reg.ganhos[0].gain.log.map((x) => x[0]).join(",");
  t("cada voz tem envelope: começa em zero, sobe curto, cai em exponencial (sem estalido)", envelope === "set,lin,exp" && nav.reg.ganhos[0].gain.log[0][1] === 0);
  t("e o oscilador para depois da cauda", nav.reg.osciladores.every((o) => o.fim > o.inicio));
  limpar();
}

/* ============================================================ */
sec("8. o interruptor (ui.jsx)");
{
  const ENTRADA = `
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { InterruptorDoSom } from "./ui.jsx";
export const html = (el) => renderToStaticMarkup(el);
export { React, InterruptorDoSom };
`;
  const saida = path.join(AQUI, `.tmp-som-da-mesa-${process.pid}.mjs`);
  buildSync({
    stdin: { contents: ENTRADA, resolveDir: SRC, loader: "jsx", sourcefile: "entrada-som.jsx" },
    bundle: true, format: "esm", platform: "node", outfile: saida, jsx: "transform", logLevel: "silent", external: ["react", "react-dom", "react-dom/server"],
    loader: { ".js": "jsx" }, define: { "process.env.NODE_ENV": '"production"' },
  });
  const R = await import(pathToFileURL(saida).href);
  fs.rmSync(saida, { force: true });
  const h = R.React.createElement;
  const des = (s) => s.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
  const texto = (s) => des(s.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ");
  limpar();
  const ligado = R.html(h(R.InterruptorDoSom));
  t("por omissão diz «Som da mesa: sim», com aria-pressed", /aria-pressed="true"/.test(ligado) && texto(ligado).includes(`${S.palavras.rotulo}: ${S.palavras.sim}`));
  t("a forma do interruptor das rolagens: botão de 48 de alto, letra de máquina", /^<button type="button"/.test(ligado) && /min-height:48px/.test(ligado) && /tv-mono/.test(ligado));
  t("e diz os três momentos, por escrito", texto(ligado).includes(S.palavras.diz));
  t("o glifo é desenhado (svg), nunca emoji", /<svg/.test(ligado) && !/\p{Extended_Pictographic}/u.test(texto(ligado)));
  globalThis.localStorage = fazerGuarda({ taverna_cfg_som: "0" });
  const desligado = R.html(h(R.InterruptorDoSom));
  t("com a preferência guardada «0», nasce desligado («não»)", /aria-pressed="false"/.test(desligado) && texto(desligado).includes(`${S.palavras.rotulo}: ${S.palavras.nao}`));
  limpar();
}

console.log(`\n${ok} ok, ${mal} mal`);
if (mal) process.exit(1);
