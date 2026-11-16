/* ============================================================
   O PLURAL DA TELA (15/11/2026, S6 — a tela não mostra o bastidor)

   Na sessão de 15/11 a tela disse «3 Rato Gigantes caíram» e «faltam 1
   avanco». Os dois saíam de um «+ s» e de um «=== 1 ?» espalhados pelo
   código, e cada sítio errava à sua maneira: o nome composto levava o «s»
   na última palavra, a contagem de um não concordava, e um deles nem tinha
   a cedilha. A regra mora aqui, uma vez, e quem escreve uma contagem na
   tela chama-a.

     pluralDoNome("Rato Gigante")     → "Ratos Gigantes"
     pluralDoNome("Lobo da Neve")     → "Lobos da Neve"   (a preposição para)
     pluralDoNome("Homem-Lagarto")    → "Homens-Lagarto"  (o hífen: só a cabeça)
     contagem(3, "Rato Gigante")      → "3 Ratos Gigantes"
     falta(1, "avanço")               → "falta 1 avanço"
     falta(3, "avanço")               → "faltam 3 avanços"

   PURO. Lixo dá "" (nunca exceção). Provado em testes/teste-plural.mjs, e o
   varredor testes/check-texto-de-tela.mjs corre-o contra as linhas de tela.
   ============================================================ */

/* ---------------- A TABELA ----------------
   `preposicoes`: depois delas o nome não varia («Lobos da Neve»).
   `invariaveis`: as palavras que não mudam no plural (terminam em -s/-x
   átono, ou são números romanos). `irregulares`: as que a regra erraria.
   `terminacoes`: [fim, troca] na ordem em que se testam — a primeira que
   casa ganha; sem nenhuma, a vogal leva «s». */
export const PLURAL_DA_TELA = Object.freeze({
  preposicoes: Object.freeze(["de", "da", "do", "das", "dos", "d'", "em", "na", "no", "nas", "nos", "e", "com", "sem", "sob", "sobre", "entre"]),
  invariaveis: Object.freeze(["lápis", "pires", "tórax", "ônix", "fênix", "ii", "iii", "iv", "vi", "vii", "viii", "ix", "xi", "xii"]),
  irregulares: Object.freeze({ mal: "males", cônsul: "cônsules", réptil: "répteis", fóssil: "fósseis", projétil: "projéteis", mão: "mãos", irmão: "irmãos", cristão: "cristãos", pão: "pães", cão: "cães", capitão: "capitães", alemão: "alemães", guardião: "guardiões" }),
  terminacoes: Object.freeze([
    ["ão", "ões"], ["al", "ais"], ["el", "éis"], ["ol", "óis"], ["ul", "uis"], ["il", "is"],
    ["m", "ns"], ["r", "res"], ["z", "zes"], ["s", "s"], ["x", "x"],
  ]),
  falta: Object.freeze({ um: "falta {n} {coisa}", varios: "faltam {n} {coisas}" }),
});
const P = PLURAL_DA_TELA;

const caixaComo = (modelo, palavra) => (modelo && modelo[0] === modelo[0].toUpperCase() && modelo[0] !== modelo[0].toLowerCase()
  ? palavra.charAt(0).toUpperCase() + palavra.slice(1) : palavra);

/* uma palavra só */
function pluralDaPalavra(w) {
  if (!w) return w;
  if (/^\d+$/.test(w)) return w;
  const k = w.toLowerCase();
  if (P.invariaveis.includes(k)) return w;
  if (P.irregulares[k]) return caixaComo(w, P.irregulares[k]);
  for (const [fim, troca] of P.terminacoes) {
    if (k.endsWith(fim)) {
      /* «-s» e «-x» ficam (o plural de «Ás» e de «Ônix» é ele mesmo) */
      if (fim === troca) return w;
      return w.slice(0, w.length - fim.length) + troca;
    }
  }
  return w + "s";
}

/* pluralDoNome(nome) → o plural de um nome (simples ou composto) */
export function pluralDoNome(nome) {
  if (typeof nome !== "string") return "";
  const n = nome.replace(/\s+/g, " ").trim();
  if (!n) return "";
  const partes = n.split(" ");
  const out = [];
  let parou = false;
  for (const p of partes) {
    if (parou || P.preposicoes.includes(p.toLowerCase())) { parou = true; out.push(p); continue; }
    /* o hífen: só a cabeça varia («Homens-Lagarto») */
    const [cabeca, ...resto] = p.split("-");
    out.push([pluralDaPalavra(cabeca), ...resto].join("-"));
  }
  return out.join(" ");
}

/* contagem(n, nome) → «1 Rato Gigante», «3 Ratos Gigantes» */
export function contagem(n, nome) {
  const q = Number(n);
  if (!Number.isFinite(q) || typeof nome !== "string" || !nome.trim()) return "";
  const k = Math.round(q);
  return `${k} ${k === 1 ? nome.trim() : pluralDoNome(nome)}`;
}

/* falta(n, coisa) → «falta 1 avanço», «faltam 3 avanços» */
export function falta(n, coisa) {
  const q = Number(n);
  if (!Number.isFinite(q) || typeof coisa !== "string" || !coisa.trim()) return "";
  const k = Math.max(0, Math.round(q));
  return k === 1
    ? P.falta.um.replace("{n}", "1").replace("{coisa}", coisa.trim())
    : P.falta.varios.replace("{n}", String(k)).replace("{coisas}", pluralDoNome(coisa.trim()));
}
