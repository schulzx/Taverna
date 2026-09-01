/* A/B contra a API REAL: de onde vem o diálogo quebrado.

   Três variantes do MESMO pedido, mesma cena, mesma temperatura (a do
   servidor — não dá para mexer nela daqui, e é justamente por isso que
   este teste isola o PROMPT).

     A — a voz taverneiro como está hoje (padrão da casa)
     B — a mesma voz com `frase` e `exemplo` consertados
     C — a voz épico como está hoje (controle: outra voz quebra também?)

   A medida objetiva é a DENSIDADE DE PALAVRA GRAMATICAL dentro da fala.
   Português quebrado por penalidade de frequência perde primeiro artigo e
   preposição — o modelo foge do token que já gastou —, então a fala boa
   fica em torno de 0,30 e a fala telegráfica desaba. */

import { VOZES } from "../src/vozes.js";

const API = "https://taverna-sooty.vercel.app/api/narrador";
const N = Number(process.env.N || 6);

const bloco = (v, over = {}) => {
  const x = { ...v, ...over };
  return `A SUA VOZ — ${x.nome.toUpperCase()} (${x.resumo}). É assim que você conta, em toda cena, do começo ao fim da campanha.
O QUE ESTA VOZ FAZ: ${x.faz.map((s, i) => `(${i + 1}) ${s}`).join("; ")}.
COMO ELA SOA: ${x.frase}.
COMO AS PESSOAS FALAM: ${x.boca}.
DE ONDE VEM A GRAÇA: ${x.graca}.
O ERRO CARACTERÍSTICO DESTA VOZ, e é o único de que você precisa se guardar: ${x.naoFaz}.
UMA FRASE NO REGISTRO CERTO: "${x.exemplo}"
A VOZ É A BOCA, NÃO O MUNDO: o que existe e o que acontece continuam vindo do sistema e dos envelopes; ela decide só como aquilo soa.`;
};

const ESTILO = `ESTILO: NPCs falam em 1ª pessoa ("—").

VARIEDADE DE LINGUAGEM (anti-repetição — leve a sério):
- NUNCA recicle muletas verbais nem imagens já usadas na sessão. Se uma construção apareceu uma vez (ex.: "qualidade de", "algo muito antigo", "os olhos brilharam"), está PROIBIDA nas próximas — busque outro ângulo sensorial, outra metáfora, outro ritmo.
- Varie aberturas de frase e de parágrafo; alterne frases curtas e longas.
- UM DETALHE CONCRETO VALE TRÊS ADJETIVOS.
- CORTE ANTES DE EXPLICAR. Termine na imagem, não no resumo do que ela significa.`;

const FORMATO = `=== FORMATO DA RESPOSTA ===
Responda com UM ÚNICO objeto JSON válido: {"narrativa":"texto da cena com diálogos","perigo":null,"mudancas":null}`;

const sistema = (vozBloco) => `Você é o Mestre de um RPG de mesa em português do Brasil.
Gênero: fantasia sombria. O herói é Íris Vantel, caçadora de fendas.

${vozBloco}
- LIBERDADE CRIATIVA: diálogos com alma. O SISTEMA decide o que existe e o que acontece; VOCÊ decide como aquilo se parece e o que significa.
${ESTILO}

${FORMATO}`;

const CENAS = [
  "Entro na banca do ferreiro e pergunto o preço da espada curta pendurada atrás dele. Quero pechinchar.",
  "Chego na taverna e peço trabalho ao homem que contrata gente para escoltar carroça.",
  "Encontro a mulher que me devia dinheiro há dias e cobro na frente dos outros.",
];

const VOZ_A = VOZES.find((v) => v.id === "taverneiro");
const VOZ_C = VOZES.find((v) => v.id === "epico");

/* O conserto que está em teste: o `frase` deixa de mandar quebrar a
   frase, e o `exemplo` deixa de ser uma construção elíptica em série —
   que é o molde que o modelo copia para dentro de toda fala. */
const CONSERTO = {
  frase: "curta e falada, com interrupção e resposta em cima da fala do outro — mas SEMPRE frase inteira e gramatical",
  exemplo: "O sujeito atrás do balcão nem levanta a cabeça. \"Olha, eu não quero saber quem começou. Se vocês vão brigar, briguem na rua, que aqui dentro eu é que pago o vidro.\"",
};

const VARIANTES = [
  ["A · taverneiro como está", bloco(VOZ_A)],
  ["B · taverneiro consertado", bloco(VOZ_A, CONSERTO)],
  ["C · épico como está", bloco(VOZ_C)],
];

/* ---- a medida ---- */
const GRAMATICAIS = new Set(("o a os as um uma uns umas de do da dos das em no na nos nas " +
  "ao aos à às pelo pela por para com sem sobre entre que se e ou mas quando porque " +
  "meu minha seu sua teu tua esse essa este esta aquele aquela isso isto lhe me te " +
  "é são está estão foi era tem têm há").split(" "));

function falasDe(txt) {
  const s = String(txt || "");
  const out = [];
  /* travessão de diálogo e aspas — as duas formas que o prompt autoriza */
  for (const m of s.matchAll(/[—–]\s*([^\n—–]{6,})/g)) out.push(m[1]);
  for (const m of s.matchAll(/[""«]([^""»]{6,})[""»]/g)) out.push(m[1]);
  for (const m of s.matchAll(/"([^"]{6,})"/g)) out.push(m[1]);
  return out;
}

function densidade(falas) {
  let g = 0, t = 0;
  for (const f of falas) {
    for (const w of String(f).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").split(/[^a-z]+/)) {
      if (!w) continue;
      t++;
      if (GRAMATICAIS.has(w)) g++;
    }
  }
  return t ? g / t : 0;
}

async function pedir(system, user) {
  const r = await fetch(API, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ system, messages: [{ role: "user", content: user }], maxTokens: 1200, formato: "json" }),
  });
  if (!r.ok) return { erro: `${r.status} ${(await r.text()).slice(0, 120)}` };
  const d = await r.json();
  const txt = d.texto || d.completion || "";
  try { return { n: JSON.parse(txt).narrativa || "" }; } catch { return { n: String(txt).slice(0, 900) }; }
}

const linhas = [];
for (const [rot, vozBloco] of VARIANTES) {
  const sys = sistema(vozBloco);
  const todas = [];
  console.log("\n" + "=".repeat(70) + "\n" + rot + "\n" + "=".repeat(70));
  for (let i = 0; i < N; i++) {
    const cena = CENAS[i % CENAS.length];
    const r = await pedir(sys, cena);
    if (r.erro) { console.log("  ERRO " + r.erro); continue; }
    const fs = falasDe(r.n);
    todas.push(...fs);
    console.log("\n[" + (i + 1) + "] " + r.n.replace(/\s+/g, " ").slice(0, 620));
  }
  const d = densidade(todas);
  linhas.push([rot, todas.length, d]);
  console.log(`\n>>> ${rot}: ${todas.length} falas · densidade gramatical ${(d * 100).toFixed(1)}%`);
}

console.log("\n\n" + "#".repeat(70));
for (const [rot, n, d] of linhas) console.log(`${rot.padEnd(30)} ${String(n).padStart(3)} falas   ${(d * 100).toFixed(1)}%`);
