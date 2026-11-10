/* check-turno-deles.mjs (CB 17, 09/11/2026) — o turno deles nunca prende o
   jogador (formas.md §CB 17.2, a regra dos 4 s; Figma F6 370:2104)

   DUAS GARANTIAS, e este varredor guarda as duas:

   1. SEM TOQUE, NUNCA MAIS DE `teto`. Para QUALQUER lista de passos — a luta
      da praça, a horda de lobos, o sopro que apanha seis, o grupo inteiro a
      andar — a duração planeada (`duracaoDosPassos`, turno-contado.js, com a
      tabela `TURNO_DELES` de estilo.js) fica ≤ teto a 1×, ≤ teto × acelerado
      com 2×, e ≤ teto com o movimento reduzido. É o WCAG 2.2, 2.2.2 (Pause,
      Stop, Hide): o que se mexe sozinho mais de 5 s tem de poder parar; aqui
      nada passa de 4.

   2. HÁ SEMPRE SAÍDA. A tela da batalha (painel-batalha.jsx) mostra o
      «Saltar ›» sempre que o turno deles se conta, e ouve Esc e Espaço; o
      toque no tabuleiro só salta. Isto é TEXTO — o comportamento renderizado
      prova-se em teste-batalha-na-tela.mjs.

   OS BURACOS, com número: as listas são geradas por uma semente fixa (1 000
   listas, de 0 a 14 passos, com caminhos de 0 a 12 casas e até 4 golpes por
   passo), mais os quatro casos de F6 escritos à mão. Uma forma de passo que
   nenhuma delas tenha não está provada — mas a regra (c) de §CB 17.2 («no
   teto, o resto pousa de uma vez») não depende da forma do passo. */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { TURNO_DELES } from "../src/estilo.js";
import { duracaoDosPassos } from "../src/turno-contado.js";

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? "\n      " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const TELA = readFileSync(join(RAIZ, "src/painel-batalha.jsx"), "utf8");

/* a semente: um gerador pequeno e determinístico (mesma saída em qualquer máquina) */
let estado = 20261109;
const sorte = () => { estado = (estado * 1103515245 + 12345) % 2147483648; return estado / 2147483648; };
const inteiro = (a, b) => a + Math.floor(sorte() * (b - a + 1));
const evento = () => {
  const r = sorte();
  return r < 0.35 ? { tipo: "golpe", desfecho: "erro", dano: 0 }
    : r < 0.45 ? { tipo: "golpe", desfecho: "critico", critico: true, dano: inteiro(6, 20) }
      : r < 0.55 ? { tipo: "golpe", desfecho: "acerto", dano: inteiro(4, 12), abate: true }
        : { tipo: "golpe", desfecho: "acerto", dano: inteiro(1, 9) };
};
const passo = (i) => {
  const tipo = ["atacar", "sopro", "aproximar", "fugir", "nada"][inteiro(0, 4)];
  const casas = tipo === "fugir" ? 0 : inteiro(0, 12);
  const caminho = casas ? Array.from({ length: casas + 1 }, (_, k) => ({ x: k, y: i })) : [];
  const golpes = tipo === "aproximar" || tipo === "nada" ? [] : Array.from({ length: inteiro(0, 4) }, () => ({ alvo: "Bran", evento: evento() }));
  return { quem: `Lobo ${i + 1}`, lado: "inimigo", tipo, caminho, golpes };
};
const listas = Array.from({ length: 1000 }, () => Array.from({ length: inteiro(0, 14) }, (_, i) => passo(i)));

/* os casos de F6, à mão: a luta da praça (4 passos) e a horda de 8 lobos */
const golpe = (desfecho, dano) => ({ alvo: "Bran", evento: { tipo: "golpe", desfecho, dano } });
const reta = (n) => Array.from({ length: n + 1 }, (_, k) => ({ x: k, y: 0 }));
const PRACA = [
  { quem: "Bandido", lado: "inimigo", tipo: "atacar", caminho: [], golpes: [golpe("erro", 0)] },
  { quem: "Goblin", lado: "inimigo", tipo: "atacar", caminho: reta(6), golpes: [golpe("acerto", 5)] },
  { quem: "Dragão Jovem", lado: "inimigo", tipo: "sopro", caminho: [], golpes: [golpe("acerto", 14), { alvo: "Quorin", evento: { tipo: "golpe", desfecho: "acerto", dano: 9 } }] },
  { quem: "Quorin", lado: "aliado", tipo: "atacar", caminho: [], golpes: [{ alvo: "Bandido", evento: { tipo: "golpe", desfecho: "acerto", dano: 6 } }] },
];
const HORDA = Array.from({ length: 8 }, (_, i) => ({ quem: `Lobo ${i + 1}`, lado: "inimigo", tipo: "atacar", caminho: reta(5), golpes: [golpe(i % 2 ? "erro" : "acerto", 4)] }));

/* ============================================================ */
sec("1. sem toque, nunca mais do que o teto");
{
  const T = TURNO_DELES;
  t("a tabela tem o teto, o piso do passo, o 2× e o passo reduzido (§CB 17.3)", T.teto === 4000 && T.pisoDoPasso === 250 && T.acelerado === 0.5 && T.reduzido.passo === 400);
  const casos = [...listas, PRACA, HORDA, []];
  const acima = [];
  for (const [i, ps] of casos.entries()) {
    const um = duracaoDosPassos(ps, { velocidade: 1, tabela: T });
    const dois = duracaoDosPassos(ps, { velocidade: 2, tabela: T });
    const parado = duracaoDosPassos(ps, { velocidade: 1, reduzido: true, tabela: T });
    if (!um || um.total > T.teto) acima.push(`lista ${i} a 1×: ${um && um.total}`);
    if (!dois || dois.total > T.teto * T.acelerado) acima.push(`lista ${i} a 2×: ${dois && dois.total}`);
    if (!parado || parado.total > T.teto) acima.push(`lista ${i} reduzida: ${parado && parado.total}`);
    /* e nenhum passo some: todo índice está num grupo (a lista inteira é contada) */
    const contados = new Set(um ? um.passos.flatMap((g) => g.i) : []);
    if (ps.some((_, k) => !contados.has(k))) acima.push(`lista ${i}: um passo ficou por contar`);
  }
  t(`${casos.length} listas de passos: a 1× ≤ ${TURNO_DELES.teto} ms, a 2× ≤ ${TURNO_DELES.teto * TURNO_DELES.acelerado} ms, reduzido ≤ ${TURNO_DELES.teto} ms, e nenhum passo por contar`, acima.length === 0, acima.slice(0, 5).join(" · "));
  const praca = duracaoDosPassos(PRACA, { velocidade: 1, tabela: T });
  t("a luta da praça (4 passos) cabe sem encolher", praca.fator === 1 && praca.total <= T.teto, JSON.stringify(praca));
  const horda = duracaoDosPassos(HORDA, { velocidade: 1, tabela: T });
  t("a horda de 8 lobos encolhe e acaba no teto, sem passar", horda.fator < 1 && horda.total <= T.teto, JSON.stringify({ total: horda.total, fator: horda.fator }));
  t("sem tabela, a conta cala-se (null) — e a tela pousa tudo", duracaoDosPassos(PRACA, { velocidade: 1 }) === null);
}

/* ============================================================ */
sec("2. há sempre saída");
{
  t("o «Saltar ›» está no controlo do turno deles, ligado a aoSaltar", /function ControloDoTurnoDeles\(/.test(TELA) && /onClick=\{chama\(aoSaltar\)\}[^>]*aria-label="Saltar o turno deles"/.test(TELA) && /Saltar ›/.test(TELA));
  t("e o controlo nasce sempre que o turno deles se conta (sem outra condição)", /controlo=\{contando \? <ControloDoTurnoDeles [^>]*aoSaltar=\{saltarTurno\}[^>]*\/> : null\}/.test(TELA));
  t("Esc e Espaço saltam enquanto o turno se conta", /if \(!contando\) return undefined;\s*const ouve = \(e\) => \{[\s\S]{0,200}e\.key === "Escape" \|\| e\.key === " "/.test(TELA));
  t("o toque no tabuleiro só salta (consumido), e um verbo salta e arma", /e\.stopPropagation\(\); engolirCliqueRef\.current = true; saltarTurno\(\);/.test(TELA) && /if \(contando\) saltarTurno\(\);/.test(TELA));
  t("a preferência do 2× tem nome na tabela (o localStorage, nunca o save)", typeof TURNO_DELES.preferencia === "string" && TURNO_DELES.preferencia.startsWith("taverna:"));
}

console.log(`\n${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
