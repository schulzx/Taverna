/* A/B CONTRA A API REAL — o Intérprete deve ganhar boca?

   A pergunta do autor: dividir a chamada em duas, uma para o Narrador ligar
   os pontos e outra que só VIVE o personagem e devolve a fala. A hipótese é
   que isso dá "mais eficácia ou mais trama".

   Os dois arranjos, na mesma cena e com a mesma gente:

     A — UMA chamada. O prompt real de hoje, inteiro, com os 18 mil
         caracteres de "como ser NPC" dentro dele.

     B — DUAS pontas. Primeiro um ATOR por pessoa que fala: prompt
         minúsculo, só o dossiê daquela pessoa e a troca — devolve a fala e
         nada mais. Depois o NARRADOR, com o prompt real MENOS os itens de
         comportamento de NPC, recebendo as falas como envelope.

   TRÊS MEDIDAS, e nenhuma é de gosto:

   1) DISTINÇÃO DE VOZ — Jaccard entre os conjuntos de palavras de conteúdo
      das duas pessoas da cena. Duas pessoas que soam igual compartilham
      vocabulário; quanto MENOR, mais distintas. É a medida que responde
      "personagens mais vivos".

   2) SEGUNDOS — o preço real da ideia. Em B as falas têm de existir antes
      da narração, então ator e narrador são sequenciais; os atores entre si
      vão em paralelo.

   3) CARACTERES ENVIADOS — o que a divisão faz com o orçamento.

   DESVIO ASSUMIDO: os dois arranjos devolvem `falas` num campo à parte, para
   a medida 1 ser possível. Em A isso é um acréscimo ao formato de hoje;
   tudo o mais é o prompt que roda de verdade. */

import { montarSystemPrompt } from "../src/prompt.js";

const API = "https://taverna-sooty.vercel.app/api/narrador";

const PERS = {
  nome: "Íris", sobrenome: "Vantel", conceito: "caçadora de fendas", historia: "", nivel: 8,
  raca: "Humano", classe: "Caçadora", atributos: { forca: 1, destreza: 3, vigor: 2, intelecto: 2, presenca: 1, percepcao: 4 },
  vidaMax: 61, manaMax: 30,
};

/* Três cenas, duas pessoas em cada, com querer e veto diferentes. O veto
   ("o que ela nunca faz") é o que `interprete.js` já guarda por pessoa. */
const CENAS = [
  {
    acao: "Pergunto aos dois quem foi o último a ver Ione viva.",
    gente: [
      { nome: "Fina Da Rede", papel: "taverneira", modo: "seca, resolve enquanto fala", quer: "que ninguém traga encrenca para dentro da casa dela", nunca: "nunca fala de um cliente na frente de outro", faz: "enche o caneco de alguém para não responder na hora" },
      { nome: "Torvald", papel: "carroceiro bêbado", modo: "fala demais, sempre em círculo", quer: "que alguém pague a próxima rodada", nunca: "nunca admite que estava bêbado", faz: "se apoia no balcão e olha para o caneco vazio" },
    ],
  },
  {
    acao: "Digo que a casa vai ter de me pagar mais pelo trabalho na fenda.",
    gente: [
      { nome: "Mestre Oldrik", papel: "arquivista da guilda", modo: "mede cada palavra, pausa antes de responder", quer: "que o contrato não abra precedente", nunca: "nunca ergue a voz", faz: "abre o livro-caixa e corre o dedo por uma linha" },
      { nome: "Brigid", papel: "capitã da guarda da guilda", modo: "direta, corta o outro", quer: "que a caçadora aceite e vá embora hoje", nunca: "nunca pede desculpa", faz: "cruza os braços e se põe entre a porta e a mesa" },
    ],
  },
  {
    acao: "Conto aos dois que a fenda no morro está aberta de novo.",
    gente: [
      { nome: "Irmã Vionna", papel: "sacerdotisa de vigília", modo: "fala baixo, cita o que reza", quer: "que a vigília seja retomada antes da lua nova", nunca: "nunca promete o que a ordem não aprovou", faz: "acende uma vela sem ser pedido" },
      { nome: "Kael Duarte", papel: "anão ferreiro, veterano", modo: "ríspido, prático, mede tudo em ferro e dias", quer: "que ninguém desça sem equipamento decente", nunca: "nunca diz que uma peça está boa quando não está", faz: "bate a peça na bigorna para ouvir o som" },
    ],
  },
];

/* ---------------- os prompts ---------------- */
const FORMATO = `\n\n=== FORMATO DA RESPOSTA ===\nResponda com UM ÚNICO objeto JSON válido, sem cerca de código:\n{"narrativa":"a cena narrada, com os diálogos dentro dela","falas":{"Nome da pessoa":"exatamente a fala dela, sem aspas de citação"}}`;

const promptCheio = () => montarSystemPrompt(
  "A Faixa da Vez", { genero: "Fantasia sombria" }, PERS, {},
  { elenco: [], cidades: [], tavernas: [] }, "", "", "", "", "", "", "Mortal", { emCidade: true },
);

/* B: o mesmo prompt, sem os itens que são sobre SER a gente — que é
   exatamente o material que muda de dono na proposta. */
const GENTE_RX = /NPC|personagem|personagens|pessoa|pessoas|elenco|di[áa]logo|voz|vozes|rea[çc][õo]es|interpret|amansar|moraliz|sedutora|covarde|fan[áa]tico|diversidade|conhecid[ao]s|passado compartilhad/i;
function promptSemComportamento() {
  const p = promptCheio();
  const itens = []; let at = null;
  for (const l of p.split("\n")) {
    if (/^- /.test(l) || /^[A-ZÀ-Ú][A-ZÀ-Ú0-9 ,ÇÃÕÉÍÓÚÂÊÔ()\/·—-]{10,}[:(]/.test(l)) { if (at) itens.push(at); at = { txt: l }; }
    else if (at) at.txt += "\n" + l; else itens.push({ txt: l });
  }
  if (at) itens.push(at);
  return itens.filter((i) => !GENTE_RX.test(i.txt)).map((i) => i.txt).join("\n");
}

const promptDoAtor = (p, acao, outros) => `Você É ${p.nome}. Não narra, não descreve, não explica: FALA, em primeira pessoa, como esta pessoa falaria.

QUEM VOCÊ É: ${p.papel}. ${p.modo}.
O QUE VOCÊ QUER AGORA: ${p.quer}.
O QUE VOCÊ NUNCA FAZ: ${p.nunca}. Isto não tem exceção nesta cena.
O QUE O SISTEMA JÁ DECIDIU QUE VOCÊ FAZ: ${p.faz}. A sua fala tem de caber nisso.
QUEM MAIS ESTÁ AQUI: ${outros.join(", ")} — e a caçadora Íris Vantel, que acabou de falar.

O QUE ELA DISSE: "${acao}"

Responda com UM objeto JSON e nada mais: {"fala":"a sua fala, uma a três frases, sem aspas de citação"}
A fala é SÓ sua boca. Você não decide o que existe no mundo, não move ninguém e não conta o que os outros fazem.`;

const promptDoNarrador = (falas) => `${promptSemComportamento()}

=== AS FALAS DESTE TURNO (fato consumado — use estas palavras) ===
${Object.entries(falas).map(([n, f]) => `${n} disse: "${f}"`).join("\n")}
Estas falas já aconteceram. Costure-as na cena com gesto, lugar e silêncio; NÃO as reescreva, não invente outra fala para quem já falou, e não faça falar quem não está na lista.${FORMATO}`;

/* ---------------- a chamada ---------------- */
async function chamar(system, user, maxTokens = 1200, tarefa = "narrador") {
  const t0 = Date.now();
  const r = await fetch(API, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system, messages: [{ role: "user", content: user }], maxTokens, formato: "json", tarefa }),
  });
  const j = await r.json().catch(() => ({}));
  const bruto = j.texto || j.conteudo || j.content || (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || "";
  let obj = {};
  try { obj = JSON.parse(String(bruto).replace(/^```json\s*|\s*```$/g, "")); } catch { obj = { erro: String(bruto).slice(0, 160) }; }
  return { obj, ms: Date.now() - t0, enviados: system.length + user.length };
}

/* ---------------- as medidas ---------------- */
const VAZIAS = new Set("a o as os um uma uns umas de do da dos das em no na nos nas por para com que se e ou mas nao não me te lhe eu voce você ele ela nos vos eles elas isso isto aquilo ja já mais menos muito bem so só ao aos à às pelo pela sim seu sua meu minha e é ser esta este essa esse aqui ali la lá quem qual quando onde como porque entao então tem ter vai vou".split(/\s+/));
const palavras = (s) => new Set(String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .split(/[^a-z]+/).filter((w) => w.length > 3 && !VAZIAS.has(w)));
function jaccard(a, b) {
  const A = palavras(a), B = palavras(b);
  if (!A.size || !B.size) return null;
  let i = 0; for (const w of A) if (B.has(w)) i++;
  return i / (A.size + B.size - i);
}

/* ---------------- a corrida ---------------- */
const linhas = [];
for (const [n, cena] of CENAS.entries()) {
  const nomes = cena.gente.map((g) => g.nome);
  const user = `${cena.acao}\n(Presentes: ${nomes.join(" e ")}.)`;

  /* --- A: uma chamada --- */
  const A = await chamar(promptCheio() + FORMATO, user, 1200);
  const fA = A.obj.falas || {};
  const jA = jaccard(fA[nomes[0]], fA[nomes[1]]);

  /* --- B: atores em paralelo, depois o narrador --- */
  const t0 = Date.now();
  const atores = await Promise.all(cena.gente.map((g) =>
    chamar(promptDoAtor(g, cena.acao, nomes.filter((x) => x !== g.nome)), "Fale.", 220, "leve")));
  const msAtores = Date.now() - t0;
  const fB = {};
  cena.gente.forEach((g, i) => { fB[g.nome] = (atores[i].obj.fala || "").trim(); });
  const N = await chamar(promptDoNarrador(fB), user, 1200);
  const jB = jaccard(fB[nomes[0]], fB[nomes[1]]);

  linhas.push({
    cena: n + 1,
    jA, jB,
    msA: A.ms, msB: msAtores + N.ms,
    carA: A.enviados, carB: atores.reduce((s, x) => s + x.enviados, 0) + N.enviados,
    carNarrA: A.enviados, carNarrB: N.enviados,
    falasA: fA, falasB: fB,
  });
  console.log(`cena ${n + 1} pronta — A ${A.ms}ms · B ${msAtores + N.ms}ms`);
}

/* ---------------- o relatório ---------------- */
const md = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
console.log("\n================ RESULTADO ================\n");
console.log("cena   Jaccard A   Jaccard B     msA     msB    carA    carB");
for (const l of linhas) {
  console.log(String(l.cena).padStart(4),
    String(l.jA == null ? "—" : l.jA.toFixed(3)).padStart(11),
    String(l.jB == null ? "—" : l.jB.toFixed(3)).padStart(11),
    String(l.msA).padStart(8), String(l.msB).padStart(7),
    String(l.carA).padStart(7), String(l.carB).padStart(7));
}
const jAs = linhas.map((l) => l.jA).filter((x) => x != null);
const jBs = linhas.map((l) => l.jB).filter((x) => x != null);
console.log("\nDISTINÇÃO DE VOZ (Jaccard — menor é mais distinto)");
console.log("  A (uma chamada):", md(jAs).toFixed(3), " B (ator + narrador):", md(jBs).toFixed(3));
console.log("  diferença:", (((md(jAs) - md(jBs)) / (md(jAs) || 1)) * 100).toFixed(1) + "% mais distinto em B");
console.log("\nSEGUNDOS POR TURNO");
console.log("  A:", (md(linhas.map((l) => l.msA)) / 1000).toFixed(1) + "s   B:", (md(linhas.map((l) => l.msB)) / 1000).toFixed(1) + "s");
console.log("\nCARACTERES ENVIADOS");
console.log("  total   A:", Math.round(md(linhas.map((l) => l.carA))), " B:", Math.round(md(linhas.map((l) => l.carB))));
console.log("  só o Narrador  A:", Math.round(md(linhas.map((l) => l.carNarrA))), " B:", Math.round(md(linhas.map((l) => l.carNarrB))));

console.log("\n---------------- AS FALAS ----------------");
for (const l of linhas) {
  console.log(`\n[cena ${l.cena}]`);
  for (const k of Object.keys(l.falasA)) console.log(`  A · ${k}: ${String(l.falasA[k]).slice(0, 150)}`);
  for (const k of Object.keys(l.falasB)) console.log(`  B · ${k}: ${String(l.falasB[k]).slice(0, 150)}`);
}
