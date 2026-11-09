/* check-golpe-sentido.mjs (CB, 09/11/2026) — o golpe sente-se em menos de
   400 ms, e a entrada nunca espera (formas.md §CB 5)

   POR QUE UM VARREDOR. O golpe sentido é TEMPO: a pausa no impacto, o
   tremor da ficha, o número que salta e assenta. Cada um destes números é
   pequeno e parece inofensivo de afinar sozinho — e a soma é que decide se
   o jogo responde ou se arrasta. A régua é a da planta: em cada desfecho,
   pausa + tremor + assenta ≤ GOLPE_SENTIDO.teto (400). Um «só mais 40 ms
   de pausa» no crítico passa por todas as suítes e torna a luta lenta.

   E A SEGUNDA LEI, que é a da casa: NADA BLOQUEIA. O estado já está
   aplicado quando a animação começa, e a animação é só leitura. Um golpe
   que prende a entrada (um `await`, um `bloqueado` enquanto anima, uma
   camada que apanha o toque) é o golpe a custar o turno.

   Mede:
   1. a soma de cada desfecho ≤ teto, lida da tabela e da conta pura;
   2. cada classe `tv-golpe-*` que anima tem saída `animation: none` no
      prefers-reduced-motion (WCAG 2.3.3), e o número reduzido esvanece;
   3. as durações na folha são as da tabela (nenhuma escrita à mão);
   4. a peça nunca escreve duração (só a folha), e as classes que a conta
      devolve existem na folha;
   5. a entrada nunca espera: o golpe não toca no movimento nem no
      bloqueio, as camadas não apanham o toque, e nada é aguardado. */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { GOLPE_SENTIDO, MOVIMENTO_CSS } from "../src/estilo.js";
import { somaDoGolpe, variacaoDoGolpe } from "../src/batalha-na-tela.js";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const ler = (a) => readFileSync(join(RAIZ, a), "utf8");
let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? "\n      " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const semComentarios = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
const DESFECHOS = ["acerto", "critico", "abate", "erro"];
const G = GOLPE_SENTIDO;

/* ============================================================ */
sec("1. a régua dos 400 ms");
{
  for (const d of DESFECHOS) {
    const v = G[d];
    const soma = v.pausa + v.tremor.ms + v.assenta;
    t(`${d}: ${v.pausa} + ${v.tremor.ms} + ${v.assenta} = ${soma} ≤ ${G.teto}`, soma <= G.teto && somaDoGolpe(d) === soma);
  }
  t("o teto é 400 e o acerto fecha em 380 (a planta)", G.teto === 400 && somaDoGolpe("acerto") === 380);
  t("a pausa no impacto fica na faixa do hitstop (≤ 110 ms; Nijman 2013, Sakurai 2022)", DESFECHOS.every((d) => G[d].pausa <= 110));
  t("o alcance da régua: os quatro desfechos estão na tabela", DESFECHOS.every((d) => G[d] && G[d].tremor));
}

/* ============================================================ */
const iMedia = MOVIMENTO_CSS.lastIndexOf("@media (prefers-reduced-motion");
const antes = MOVIMENTO_CSS.slice(0, iMedia), dentro = MOVIMENTO_CSS.slice(iMedia);
const RX = /(\.[A-Za-z][\w-]*(?:\s*,\s*\.[A-Za-z][\w-]*)*)\s*\{([^{}]*)\}/g;
const regras = (texto) => [...texto.matchAll(RX)].map((m) => ({ classes: m[1].split(",").map((x) => x.trim()), corpo: m[2] }));
sec("2. o movimento reduzido: toda classe do golpe sabe parar");
{
  const doGolpe = new Set();
  for (const r of regras(antes)) if (/animation\s*:/.test(r.corpo)) for (const c of r.classes) if (/^\.tv-golpe-/.test(c)) doGolpe.add(c);
  const comSaida = new Set();
  for (const r of regras(dentro)) if (/animation\s*:\s*none/.test(r.corpo)) for (const c of r.classes) comSaida.add(c);
  const semSaida = [...doGolpe].filter((c) => !comSaida.has(c));
  t(`as ${doGolpe.size} classes tv-golpe-* que animam têm saída no prefers-reduced-motion`, doGolpe.size >= 13 && semSaida.length === 0, semSaida.join(", ") || `achou ${doGolpe.size}`);
  t("parado, o número aparece num esvanecer de 120 ms (tv-golpe-reduzido, só dentro do @media)",
    /\.tv-golpe-reduzido \{ animation: tvGolpeSaltoErro \$\{GOLPE_SENTIDO\.reduzido\.esvai\}ms|\.tv-golpe-reduzido \{ animation: tvGolpeSaltoErro 120ms/.test(dentro) && !/\.tv-golpe-reduzido/.test(antes) && G.reduzido.esvai === 120);
  t("parado, a queda pousa já afundada (a informação fica, o movimento sai)", /\.tv-golpe-afunda \{ animation: none; transform: scale\(0\.9\); opacity: 0\.45; \}/.test(dentro));
}

/* ============================================================ */
sec("3. as durações na folha são as da tabela");
{
  const primeiraDuracao = (classe) => {
    const r = regras(antes).find((x) => x.classes.includes(classe) && /animation\s*:/.test(x.corpo));
    if (!r) return null;
    const m = /animation\s*:\s*\w+\s+(\d+)ms/.exec(r.corpo);
    return m ? Number(m[1]) : null;
  };
  const sufixo = (d) => (d === "acerto" ? "" : `-${d}`);
  for (const d of ["acerto", "critico", "abate"]) {
    t(`${d}: a pausa (${G[d].pausa}), o tremor (${G[d].tremor.ms}) e o salto (${somaDoGolpe(d)}) na folha`,
      primeiraDuracao(`.tv-golpe-pausa${sufixo(d)}`) === G[d].pausa && primeiraDuracao(`.tv-golpe-tremor${sufixo(d)}`) === G[d].tremor.ms && primeiraDuracao(`.tv-golpe-salto${sufixo(d)}`) === somaDoGolpe(d));
  }
  t(`erro: o desvio (${G.erro.tremor.ms}) na folha`, primeiraDuracao(".tv-golpe-desvia") === G.erro.tremor.ms);
  t(`a moldura em ti (${G.emTi.ms}), a mesa do crítico (${G.critico.mesa.ms}) e a queda (${G.abate.assenta})`,
    primeiraDuracao(".tv-golpe-borda") === G.emTi.ms && primeiraDuracao(".tv-golpe-mesa") === G.critico.mesa.ms && primeiraDuracao(".tv-golpe-afunda") === G.abate.assenta);
  t("o número esvanece depois da leitura (golpe + 900 ms), em 200 ms",
    MOVIMENTO_CSS.includes(`tvGolpeEsvai ${G.esvai}ms ease-in ${somaDoGolpe("acerto") + G.leitura}ms forwards`));
}

/* ============================================================ */
sec("4. a peça não escreve duração, e as classes da conta existem");
{
  const GRADE = semComentarios(ler("src/grade-de-batalha.jsx"));
  t("a grade nunca escreve uma duração de golpe (animationDuration)", !/animationDuration/.test(GRADE));
  const classes = new Set();
  for (const d of [{ desfecho: "acerto" }, { desfecho: "critico", critico: true }, { desfecho: "acerto", abate: true }, { desfecho: "erro" }, { desfecho: "imune" }]) {
    const v = variacaoDoGolpe({ tipo: "golpe", alvo: "x", dano: 5, ...d });
    for (const c of Object.values(v.classes)) if (c) classes.add(c);
  }
  const faltam = [...classes].filter((c) => !new RegExp(`\\.${c}\\b`).test(antes));
  t(`as ${classes.size} classes que a conta devolve estão na folha`, classes.size >= 9 && faltam.length === 0, faltam.join(", "));
  t("o número do golpe substitui o flutuante para o dano do golpe", /comGolpe\.has\(nomeDele\)/.test(GRADE) && /<NumeroDoGolpe variacao=\{gq\}/.test(GRADE));
}

/* ============================================================ */
sec("5. a entrada nunca espera");
{
  const GRADE = semComentarios(ler("src/grade-de-batalha.jsx"));
  const i = GRADE.indexOf("const golpesVistosRef");
  const efeito = i < 0 ? "" : GRADE.slice(i, GRADE.indexOf("}, [golpes]);", i));
  t("o efeito do golpe foi achado", efeito.length > 200, `${efeito.length} caracteres`);
  t("o golpe não mexe no movimento, no bloqueio nem na escolha: só pousa e sai",
    !/podeMover|bloqueado|onMover|setModo|setAndando/.test(efeito) && /setGolpesNaMesa/.test(efeito));
  t("nada é aguardado (nenhum await, nenhuma promessa a segurar o turno)", !/\bawait\b|\.then\(/.test(efeito));
  t("o som nasce no impacto e um som que estoura cala-se", /try \{ tocarGolpe\(ev\); \} catch/.test(efeito));
  t("a camada do número e das pílulas não apanha o toque", /<div style=\{\{ position: "absolute", inset: 0, pointerEvents: "none" \}\}>/.test(GRADE));
  t("a moldura em ti não apanha o toque", /className="tv-golpe-borda"[\s\S]{0,200}pointerEvents: "none"/.test(GRADE));
  const TELA = semComentarios(ler("src/painel-batalha.jsx"));
  t("a tela não segura o turno por causa do golpe (nenhum bloqueio pelos golpes)", !/golpes[^\n]{0,80}bloque|bloque[^\n]{0,80}golpes/.test(TELA));
  const BANDEJA = semComentarios(ler("src/painel-bandeja.jsx"));
  t("o d20 do golpe na bandeja salta com um toque, e rola pelo relógio da tabela",
    /ultimo\.golpe \? GOLPE_SENTIDO\.dadoNaBandeja : MOVIMENTO_DO_DADO\.rolar/.test(BANDEJA) && /pousarRef\.current\(\)/.test(BANDEJA));
}

console.log(`\ngolpe sentido: ${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
