/* A segunda hipótese, depois que a primeira caiu.

   Com prompt de 2 mil caracteres, NENHUMA voz quebrou a fala — nem o
   taverneiro, que é o que manda "frase quebrada, fragmento sem verbo".
   Então não é a voz: é o TAMANHO, que é exatamente o que o comentário da
   v9.45 em `api/mestre.js` já dizia ("é português, é saída em JSON e o
   prompt passa de 90 mil caracteres — nessas três condições a
   temperatura alta produz ERRO DE SINTAXE").

   Aqui monta-se o prompt REAL, pelo `montarSystemPrompt` do jogo, e
   pede-se a mesma cena. Se a fala quebrar agora, a causa é o par
   temperatura/penalidade sob prompt longo, e não o texto da voz. */

const S = "../src/";
const { montarSystemPrompt } = await import(S + "prompt.js");

const API = "https://taverna-sooty.vercel.app/api/narrador";
const N = Number(process.env.N || 6);

const mundo = {
  genero: "Fantasia sombria",
  descricao: "Um mundo onde fendas se abrem no chão e cospem coisas que não deviam existir. Caçadores são pagos por contenção.",
  voz: process.env.VOZ || "taverneiro",
};

const personagem = {
  nome: "Íris Vantel", conceito: "Caçadora de fendas", nivel: 4,
  vida: 31, vidaMax: 38, mana: 9, manaMax: 12, xp: 340, moedas: 62,
  raca: "Humano", classe: "Guerreiro", subclasse: "Batedora", profissao: "Cartógrafo",
  atributos: { forca: 2, destreza: 3, vigor: 1, intelecto: 0, sabedoria: 1, carisma: 0 },
  inventario: [{ nome: "Espada curta elétrica" }, { nome: "Corda" }, { nome: "Lampião" }],
  habilidades: [{ nome: "Golpe firme", descricao: "" }],
  grupo: [], cicatrizes: [],
};

const canone = {
  "Praça de Escambo": { tipo: "local", notas: "onde as bancas ficam" },
  "Departamento de Contenção de Fendas": { tipo: "organizacao", notas: "a autoridade daqui" },
};

const bancoNomes = {
  elenco: Array.from({ length: 12 }, (_, i) => ({
    nome: `Pessoa ${i}`, genero_pessoa: i % 2 ? "mulher" : "homem",
    raca: "humano", ocupacao: "feirante", traco: "desconfiada",
  })),
  cidades: ["Praça de Escambo", "Vau Baixo", "Torre Nona"],
  tavernas: ["O Décimo Portão", "A Bigorna"],
};

const sys = montarSystemPrompt(
  "O Décimo Portão", mundo, personagem, canone, bancoNomes,
  "Cidades: Praça de Escambo (capital, Sul). Facções: Departamento de Contenção de Fendas (neutro).",
  "Arco: a fenda que não fecha. Etapa 3 de 8.",
  "Missões ativas: 'Mapear a fenda do Vau' — etapa: encontrar quem viu a abertura.",
  "Marta (feirante, neutro, aqui, entrou na história no DIA 1).",
  "DIA 2, manhã, 09h20.",
  "", "", null
);

console.log(`prompt de sistema: ${sys.length.toLocaleString("pt-BR")} caracteres\n`);

const CENAS = [
  "Entro na banca do ferreiro e pergunto o preço da espada curta pendurada atrás dele. Quero pechinchar.",
  "Chego na taverna e peço trabalho ao homem que contrata gente para escoltar carroça.",
  "Encontro a mulher que me devia dinheiro há dias e cobro na frente dos outros.",
];

const GRAMATICAIS = new Set(("o a os as um uma uns umas de do da dos das em no na nos nas " +
  "ao aos à às pelo pela por para com sem sobre entre que se e ou mas quando porque " +
  "meu minha seu sua teu tua esse essa este esta aquele aquela isso isto lhe me te " +
  "é são está estão foi era tem têm há").split(" "));

function falasDe(txt) {
  const s = String(txt || "");
  const out = [];
  for (const m of s.matchAll(/[—–]\s*([^\n—–]{6,})/g)) out.push(m[1]);
  for (const m of s.matchAll(/[“”«]([^“”»]{6,})[”“»]/g)) out.push(m[1]);
  for (const m of s.matchAll(/"([^"]{6,})"/g)) out.push(m[1]);
  return out;
}

function densidade(falas) {
  let g = 0, t = 0;
  for (const f of falas) {
    for (const w of String(f).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(/[^a-z]+/)) {
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
    body: JSON.stringify({ system, messages: [{ role: "user", content: user }], maxTokens: 1600, formato: "json" }),
  });
  if (!r.ok) return { erro: `${r.status} ${(await r.text()).slice(0, 160)}` };
  const d = await r.json();
  const txt = d.texto || "";
  try { return { n: JSON.parse(txt).narrativa || "" }; } catch { return { n: "[JSON QUEBRADO] " + String(txt).slice(0, 700) }; }
}

const todas = [];
for (let i = 0; i < N; i++) {
  const r = await pedir(sys, CENAS[i % CENAS.length]);
  if (r.erro) { console.log("ERRO " + r.erro); continue; }
  todas.push(...falasDe(r.n));
  console.log("\n[" + (i + 1) + "] " + r.n.replace(/\s+/g, " ").slice(0, 800));
}
console.log(`\n>>> ${todas.length} falas · densidade gramatical ${(densidade(todas) * 100).toFixed(1)}%`);
