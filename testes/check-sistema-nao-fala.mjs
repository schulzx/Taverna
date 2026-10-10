/* ============================================================
   O SISTEMA NÃO FALA DE SI MESMO — a catraca (A1, 10/10/2026)

   A lei da casa (CLAUDE.md): *só aparece na tela o que é gameplay*. O
   jogador sente pelo efeito, nunca lê o nome do mecanismo. No ANTES de A1
   (`mente/a1-jogo.md` §1, regra 4) ela estava quebrada diante do jogador,
   no relato e nos rodapés de quem procura ajuda: "⚖ Preço aferido pelo
   sistema … pela tabela", "Quem decide é o sistema, e não o Narrador",
   "Recalibrar com a IA", "sem gastar tokens", "o Cronista escreve…".

   O QUE ISTO CONTA: as palavras que nomeiam a máquina —

       sistema · IA · Narrador · Cronista · tokens · aferid… · pela tabela

   — nas strings VISÍVEIS de `src/` (*.js e *.jsx), e só nelas:
     1. o valor de `texto:` (a linha que vai ao relato);
     2. o texto de JSX entre tags (`>…<`);
     3. os atributos que o jogador lê ou ouve: `title=`, `placeholder=`,
        `aria-label=`, `ariaLabel=` — com TODO literal dentro de `={…}`;
     4. a expressão filha de JSX (`>{cond ? "a" : "b"}<`): todo literal
        dentro dela.

   O QUE NÃO CONTA, e é a lista de exceções escrita:
     · os COMENTÁRIOS (são para quem lê o código — mascarados antes);
     · os NOMES (de variável, de função, de campo): a palavra só conta com
       fronteira de palavra, e um identificador em camelCase
       (`envelopeDoNarrador`) não a tem;
     · o ENVELOPE AO NARRADOR e o PROMPT: estão em `notaRef`, em
       `*_PROMPT`, na pauta — nenhum deles é `texto:`, JSX ou atributo,
       logo ficam fora por construção (o Narrador PRECISA de ouvir a palavra
       "sistema"; o jogador não);
     · `EXCECOES`, abaixo, uma a uma e com o motivo.

   O LIMITE, declarado: uma fala de sistema montada fora destes contextos
   (`msgs.push("…")` e devolvida depois como `texto`) não se conta aqui —
   chega ao relato por outro caminho. A morada da linha (`glifos.js`) já
   cala as famílias que o `jogo` decidiu; o que sobra lá é dívida do
   motor (C8, `mente/pedidos-ao-sistema.md`).

   A CATRACA (como D5h.1 de `check-formas`): o número por arquivo CONGELA e
   SÓ PODE DESCER. Subir é vermelho; descer é verde com o aviso de baixar o
   teto (a outra mão pode estar a baixá-lo ao mesmo tempo — quem rege
   reconcilia o número no fim do ciclo).
   ============================================================ */
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(RAIZ, "src");

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? "\n      " + extra : "")); } };
const info = (s) => console.log("  ··  " + s);
const sec = (s) => console.log("\n" + s);

/* as palavras — com fronteira, para um nome não contar */
const RX_PALAVRA = /\bsistemas?\b|\bIA\b|\bNarrador(?:es)?\b|\bCronista\b|\btokens?\b|\baferid[oa]s?\b|\bpela tabela\b/u;

/* ---------------- O TETO, por arquivo (10/10/2026) ----------------
   Medido na árvore de A1 (segunda etapa), com o `oficial` a baixar o
   `App.jsx` em paralelo. No HEAD de antes de A1 (`160d7f2`) eram 22: App 12,
   ascensão 4, diário 3, talentos 2, diplomacia 1. Os painéis zeraram (A10, o
   `aprendiz`); o App desceu a 3 (B8, o `oficial`). Os três que sobram, à
   data: o véu do teste ("O sistema fixou a dificuldade"), o aviso "— o
   sistema resolve" e o `title` do estoque do mercado ("O estoque é do
   sistema"). Só desce. */
const TETO = {
  /* "App.jsx": 3 → 0, e a linha sai (A1, terceira etapa, o `oficial`):
     as três reescritas na voz do mundo, com o número que decide mantido —
     o rodapé do Mercado (a pessoa citou-o pelo nome), "Dificuldade N
     (porquê). Seu bônus: +M" e "— o corpo reage antes de você". Arquivo
     fora desta tabela tem teto 0: daqui em diante, qualquer fala da
     máquina na tela é vermelho. */
};

/* ---------------- AS EXCEÇÕES, uma a uma ----------------
   `arquivo` + um pedaço do texto; cada uma com o porquê. Vazia de
   propósito no dia em que nasce: a lista de perdão que nasce cheia é onde
   os defeitos vão morar. */
const EXCECOES = [];

/* ============================================================
   O LEXER MÍNIMO — o que é string e onde acaba uma expressão
   ============================================================ */
const brancos = (s) => s.replace(/[^\n]/g, " ");
function semComentarios(texto) {
  /* um lexer de verdade, e não regex: `//` dentro de uma string ("https://")
     e `/*` dentro de um template não são comentários */
  let out = "", i = 0;
  const n = texto.length;
  while (i < n) {
    const c = texto[i], d = texto[i + 1];
    if (c === "/" && d === "*") { const f = texto.indexOf("*/", i + 2); const fim = f < 0 ? n : f + 2; out += brancos(texto.slice(i, fim)); i = fim; continue; }
    if (c === "/" && d === "/") { const f = texto.indexOf("\n", i); const fim = f < 0 ? n : f; out += brancos(texto.slice(i, fim)); i = fim; continue; }
    if (c === '"' || c === "'" || c === "`") { const fim = fimDaString(texto, i); out += texto.slice(i, fim); i = fim; continue; }
    out += c; i++;
  }
  return out;
}
/* devolve o índice LOGO DEPOIS do fecho da string que começa em i */
function fimDaString(s, i) {
  const q = s[i];
  let j = i + 1;
  while (j < s.length) {
    const c = s[j];
    if (c === "\\") { j += 2; continue; }
    if (q === "`" && c === "$" && s[j + 1] === "{") { j = fimDaChave(s, j + 1) + 1; continue; }
    if (c === q) return j + 1;
    if (q !== "`" && c === "\n") return j; /* string partida: pára na linha */
    j++;
  }
  return s.length;
}
/* recebe o índice de um `{` e devolve o índice do `}` que o fecha */
function fimDaChave(s, i) {
  let prof = 0, j = i;
  while (j < s.length) {
    const c = s[j];
    if (c === '"' || c === "'" || c === "`") { j = fimDaString(s, j); continue; }
    if (c === "{") prof++;
    else if (c === "}") { prof--; if (prof === 0) return j; }
    j++;
  }
  return s.length - 1;
}
/* os literais de string de um trecho (o texto cru de um template, sem os `${…}`) */
function literais(s) {
  const out = [];
  let j = 0;
  while (j < s.length) {
    const c = s[j];
    if (c === '"' || c === "'" || c === "`") {
      const fim = fimDaString(s, j);
      let corpo = s.slice(j + 1, Math.max(j + 1, fim - 1));
      if (c === "`") corpo = corpo.replace(/\$\{[\s\S]*?\}/g, " ");
      out.push(corpo);
      j = fim; continue;
    }
    j++;
  }
  return out;
}
/* a expressão de um valor (depois de `texto:`): até `,` ou `}` ou `]` ou `)` na profundidade 0 */
function fimDoValor(s, i) {
  let prof = 0, j = i;
  while (j < s.length) {
    const c = s[j];
    if (c === '"' || c === "'" || c === "`") { j = fimDaString(s, j); continue; }
    if (c === "(" || c === "[" || c === "{") prof++;
    else if (c === ")" || c === "]" || c === "}") { if (prof === 0) return j; prof--; }
    else if (c === "," && prof === 0) return j;
    j++;
  }
  return s.length;
}

/* ============================================================
   AS STRINGS VISÍVEIS de um arquivo
   ============================================================ */
function visiveis(bruto, jsx) {
  const s = semComentarios(bruto);
  const achadas = [];
  /* 1 · `texto:` */
  for (const m of s.matchAll(/\btexto\s*:\s*/g)) {
    const ini = m.index + m[0].length;
    for (const l of literais(s.slice(ini, fimDoValor(s, ini)))) achadas.push(l);
  }
  /* 3 · os atributos lidos ou ouvidos */
  for (const m of s.matchAll(/\b(?:title|placeholder|aria-label|ariaLabel)\s*=\s*/g)) {
    const ini = m.index + m[0].length;
    const c = s[ini];
    if (c === "{") achadas.push(...literais(s.slice(ini, fimDaChave(s, ini) + 1)));
    else if (c === '"' || c === "'") achadas.push(s.slice(ini + 1, fimDaString(s, ini) - 1));
  }
  if (jsx) {
    /* 2 · o texto entre tags. O `>` que FECHA uma tag vem colado a um nome,
       a uma aspa, a um `}` ou a um `/` (`<div>`, `<b className="x">`,
       `<X a={b}>`, `<br/>`); o `>` de uma comparação vem depois de um espaço
       (`x > 3`) e o de uma seta depois de um `=` — nenhum dos dois abre texto. */
    for (const m of s.matchAll(/(?<=[\w"'}\/])>([^<>{}]+)(?=[<{])/g)) {
      const txt = m[1];
      if (/[A-Za-zÀ-ú]/.test(txt) && !/^\s*[)\];,]/.test(txt)) achadas.push(txt);
      /* 4 · a expressão filha que vem logo a seguir ao texto ou à tag */
    }
    /* o texto entre a tag e o `{` não tem código: nem `(`, `=`, `;`, `&`, `|`, `?` ou `:` */
    for (const m of s.matchAll(/(?<=[\w"'}\/])>[^<>{}()=;&|?:]*\{/g)) {
      let ini = m.index + m[0].length - 1;
      /* `{…}{…}`: filhos seguidos */
      while (s[ini] === "{") {
        const fim = fimDaChave(s, ini);
        const dentro = s.slice(ini, fim + 1);
        /* só literais que são TEXTO (não classes, não chaves de objeto, não nomes de glifo) */
        for (const l of literais(dentro)) achadas.push(l);
        let k = fim + 1;
        while (k < s.length && /\s/.test(s[k])) k++;
        ini = s[k] === "{" ? k : -1;
        if (ini < 0) break;
      }
    }
  }
  return achadas;
}

/* ============================================================ */
sec("1. o alcance — a catraca mede alguma coisa");
const arquivos = readdirSync(SRC).filter((f) => /\.(js|jsx)$/.test(f)).sort();
const medido = {};
const exemplos = {};
let strings = 0;
for (const arq of arquivos) {
  const bruto = readFileSync(join(SRC, arq), "utf8").split(String.fromCharCode(13)).join("");
  const lista = visiveis(bruto, arq.endsWith(".jsx"));
  strings += lista.length;
  for (const v of lista) {
    if (!RX_PALAVRA.test(v)) continue;
    /* um literal que é UMA palavra minúscula é valor de código (`autor === "sistema"`), não frase */
    if (/^[a-z_]+$/.test(v.trim())) continue;
    if (EXCECOES.some((e) => e.arquivo === arq && v.includes(e.trecho))) continue;
    medido[arq] = (medido[arq] || 0) + 1;
    (exemplos[arq] = exemplos[arq] || []).push(v.replace(/\s+/g, " ").trim().slice(0, 90));
    /* MOSTRAR=1 node check-sistema-nao-fala.mjs — a lista inteira, para quem vai baixar o número */
    if (process.env.MOSTRAR) console.log(`   > ${arq}: ${JSON.stringify(v.replace(/\s+/g, " ").trim().slice(0, 140))}`);
  }
}
const total = Object.values(medido).reduce((a, b) => a + b, 0);
info(`${arquivos.length} arquivos em src/ · ${strings} strings visíveis lidas · ${total} falam do sistema`);
info("por arquivo: " + (Object.entries(medido).sort((a, b) => b[1] - a[1]).map(([a, n]) => `${a} ${n}`).join(" · ") || "nenhum"));
t("a varredura leu strings visíveis de verdade (catraca verde por vazio é pior que nenhuma)", strings > 1000, `leu ${strings}`);

/* os casos que a varredura TEM de ver, e os que NÃO pode ver */
const sonda = (txt, jsx = true) => visiveis(txt, jsx).filter((v) => RX_PALAVRA.test(v)).length;
t("vê `texto:`, JSX, title, placeholder, aria-label e o filho de JSX",
  sonda('pushMsgs([{ autor: "sistema", texto: "aferido pelo sistema" }]);', false) === 1
  && sonda("<div>Quem decide é o sistema</div>") === 1
  && sonda('<b title={x ? "arbitrado pelo sistema" : "y"}>a</b>') === 1
  && sonda('<input placeholder="fale com a IA" />') === 1
  && sonda('<button aria-label="o Cronista">x</button>') === 1
  && sonda('<span>{carregando ? "…" : "Recalibrar com a IA"}</span>') === 1);
t("e não vê comentário, nome de variável nem envelope ao Narrador",
  sonda("/* o sistema decide */ <div>ok</div>") === 0
  && sonda("// o Narrador\n<div>{envelopeDoNarrador}</div>") === 0
  && sonda('notaRef.current = "[REGISTRADO PELO SISTEMA] o Narrador narra";', false) === 0
  && sonda('const ADVERSARIO_PROMPT = "o sistema decide";', false) === 0);

/* ============================================================ */
sec("2. a catraca — o número congela e só desce (como D5h.1)");
const subiram = [], desceram = [];
for (const arq of [...new Set([...Object.keys(TETO), ...Object.keys(medido)])].sort()) {
  const m = medido[arq] || 0, x = TETO[arq] || 0;
  if (m > x) subiram.push(`SUBIU: ${arq} tem ${m}, o teto é ${x} — a máquina voltou a falar de si: ${(exemplos[arq] || []).slice(0, 4).join(" | ")}`);
  else if (m < x) desceram.push(`${arq}: ${x} → ${m}`);
}
t("nenhum arquivo ganhou fala da máquina", subiram.length === 0, subiram.join("\n      "));
if (desceram.length) info("desceu — baixe o teto, com a data: " + desceram.join(" · "));
const mortas = Object.entries(TETO).filter(([, x]) => x === 0).map(([a]) => a);
if (mortas.length) info("ENTRADA MORTA (teto 0 — a dívida foi paga; tire a linha): " + mortas.join(", "));
t("a lista de exceções diz o porquê de cada uma", EXCECOES.every((e) => e.arquivo && e.trecho && typeof e.porque === "string" && e.porque.length > 20));
t("os painéis de A1 (peças 114 a 119) não falam da máquina",
  ["painel-diplomacia.jsx", "painel-talentos.jsx", "painel-ascensao.jsx", "painel-diario.jsx", "painel-ficha.jsx"].every((a) => !medido[a]),
  ["painel-diplomacia.jsx", "painel-talentos.jsx", "painel-ascensao.jsx", "painel-diario.jsx", "painel-ficha.jsx"].filter((a) => medido[a]).map((a) => `${a}: ${exemplos[a].join(" | ")}`).join("\n      "));

console.log(`\nsistema-não-fala: ${bons} ok · ${maus} falhas · ${total} falas da máquina na tela`);
process.exit(maus ? 1 : 0);
