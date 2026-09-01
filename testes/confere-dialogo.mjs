/* A CONFERÊNCIA FINAL, com o prompt REAL de hoje.

   A investigação fechou: a fila do servidor é ["gemini","deepseek"], o
   gemini está com o crédito zerado (429: "prepayment credits are
   depleted") e por isso TODO turno que o jogador já jogou foi servido
   pelo deepseek — os mesmos ~130 turnos que eu medi. A hipótese do
   provedor morreu com evidência, não com palpite.

   O que sobrou de conserto foi a voz, e é isto que se confere aqui: o
   prompt como está na fonte hoje, e um revisor à parte julgando cada
   fala. */

const S = "../src/";
const { montarSystemPrompt } = await import(S + "prompt.js");

const API = "https://taverna-sooty.vercel.app/api/narrador";
const N = Number(process.env.N || 12);

const personagem = {
  nome: "Íris Vantel", conceito: "Caçadora de fendas", nivel: 12,
  vida: 60, vidaMax: 60, mana: 20, manaMax: 20, xp: 0, moedas: 40,
  raca: "Meio-orc", classe: "Caçador", profissao: "Ferreiro", subclasse: "Batedora",
  atributos: { forca: 3, destreza: 7, vigor: 4, intelecto: 2, presenca: 2, percepcao: 5 },
  inventario: [{ nome: "Faca" }], habilidades: [], grupo: [], cicatrizes: [], equipados: {},
};
const sys = montarSystemPrompt(
  "O Décimo Portão",
  { genero: "Fantasia sombria", descricao: "Fendas se abrem no chão e cospem coisas que não deviam existir.", voz: "taverneiro" },
  personagem, {}, { elenco: [], cidades: ["Baixo do Eco"], tavernas: ["Quintal da Esquina"] },
  "Cidades: Baixo do Eco.", "Arco: a fenda que não fecha.", "",
  "Sid do Norte (mercador, aqui). Vera da Serpente (recrutadora, aqui). Otávio (taverneiro, aqui).",
  "DIA 2, manhã.", "", "", null
);
console.log(`prompt: ${sys.length.toLocaleString("pt-BR")} caracteres · voz taverneiro (a consertada)\n`);

const CENAS = [
  "Pergunto ao Sid quanto custa uma corda boa e um lampião, e tento baixar o preço.",
  "Chego na taverna e peço trabalho ao Otávio.",
  "Cobro da Vera o que ela me prometeu, na frente dos outros.",
  "Peço fiado ao Otávio: pago quando voltar da fenda.",
  "Discuto com o Sid: acho que ele me vendeu corda podre da última vez.",
  "Pergunto na feira quem conhece o caminho até a fenda do Setor 9.",
];

function falasDe(txt) {
  const out = [];
  for (const m of String(txt || "").matchAll(/[—–]\s*([^\n—–]{8,})/g)) out.push(m[1].trim());
  for (const m of String(txt || "").matchAll(/[“”«]([^“”»]{8,})[”“»]/g)) out.push(m[1].trim());
  for (const m of String(txt || "").matchAll(/"([^"]{8,})"/g)) out.push(m[1].trim());
  return out;
}

async function pedir(system, user, maxTokens = 1600, tarefa = "mestre") {
  const r = await fetch(API, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ system, messages: [{ role: "user", content: user }], maxTokens, formato: "json", tarefa }),
  });
  const d = await r.json().catch(() => ({}));
  return { txt: d.texto || "", prov: d.provedor, fila: d.fila, falharam: d.falharam };
}

const JUIZ = `Você é revisor de português do Brasil. Recebe FALAS de personagens de um RPG.
Para CADA fala, diga se ela tem ERRO DE GRAMÁTICA que um falante nativo adulto não cometeria — concordância de número ou gênero ("os bolso", "umas moeda adiantado"), concordância verbal ("tu não paga", "eles vai"), regência quebrada, ou frase sem sujeito nem verbo que não se entende.
NÃO marque como erro: gíria, contração da fala ("tá", "cê", "pra", "né", "tô"), palavrão, frase curta e cortada de propósito, elipse compreensível, ou registro popular que esteja CORRETO.
Responda SOMENTE JSON: {"v":[0,1,0,...]} — um número por fala, na ordem, 1 = tem erro, 0 = não tem.`;

const falas = [];
let prov = "", fila = null, falharam = null;
for (let i = 0; i < N; i++) {
  const r = await pedir(sys, CENAS[i % CENAS.length]);
  prov = r.prov; fila = r.fila || fila; falharam = r.falharam || falharam;
  let n = "";
  try { n = JSON.parse(r.txt).narrativa || ""; } catch { continue; }
  const f = falasDe(n);
  falas.push(...f);
  console.log(`[${i + 1}] ${f.length} falas · ${n.replace(/\s+/g, " ").slice(0, 260)}`);
}

console.log(`\nquem serviu: ${prov} · fila: ${JSON.stringify(fila)}`);
if (falharam && falharam.length) console.log(`o reserva caiu: ${String(falharam[0]).slice(0, 110)}`);

const marcas = [];
for (let i = 0; i < falas.length; i += 25) {
  const lote = falas.slice(i, i + 25);
  const r = await pedir(JUIZ, lote.map((f, k) => `${k + 1}. ${f}`).join("\n"), 1200, "leve");
  let v = [];
  try { v = JSON.parse(r.txt).v || []; } catch { v = []; }
  for (let k = 0; k < lote.length; k++) marcas.push({ fala: lote[k], erro: Number(v[k]) === 1 });
}
const ruins = marcas.filter((m) => m.erro);
console.log(`\n${"#".repeat(70)}`);
console.log(`${ruins.length}/${marcas.length} falas com erro de gramática (${(100 * ruins.length / (marcas.length || 1)).toFixed(1)}%)`);
for (const r of ruins) console.log("   ✗ " + r.fala.slice(0, 110));
