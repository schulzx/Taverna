/* Terceira hipótese, e a única que sobrou de pé.

   Caíram duas: a VOZ não quebra a fala (prompt curto, três vozes, nenhuma
   quebrou) e o TAMANHO do prompt também não (87 mil caracteres, o prompt
   real inteiro, fala impecável). O que os dois testes tinham em comum é
   que ambos eram TURNO ÚNICO — sem histórico.

   O jogo manda 30 mensagens de histórico a cada turno. E a penalidade de
   frequência da API é cobrada sobre o texto ACUMULADO: quanto mais longa a
   conversa, mais caro fica para o modelo reusar um token que já gastou. Em
   português, os tokens mais gastos são exatamente artigo, preposição e
   conjunção — e é justamente eles que somem nas falas que o jogador
   mostrou ("trinta e cinco você paga", "não paga bebida, não paga
   estrada").

   Este teste JOGA de verdade: turnos encadeados, histórico crescendo, o
   prompt real. Se a densidade gramatical da fala cair com o turno, a causa
   é a penalidade — e não o texto de nenhum prompt. */

const S = "../src/";
const { montarSystemPrompt } = await import(S + "prompt.js");

const API = "https://taverna-sooty.vercel.app/api/narrador";
const TURNOS = Number(process.env.TURNOS || 16);
const JANELA = 30;

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
  habilidades: [{ nome: "Golpe firme", descricao: "" }], grupo: [], cicatrizes: [],
};
const bancoNomes = {
  elenco: Array.from({ length: 12 }, (_, i) => ({
    nome: `Pessoa ${i}`, genero_pessoa: i % 2 ? "mulher" : "homem",
    raca: "humano", ocupacao: "feirante", traco: "desconfiada" })),
  cidades: ["Praça de Escambo", "Vau Baixo", "Torre Nona"],
  tavernas: ["O Décimo Portão", "A Bigorna"],
};

const sys = montarSystemPrompt(
  "O Décimo Portão", mundo, personagem,
  { "Praça de Escambo": { tipo: "local", notas: "onde as bancas ficam" } },
  bancoNomes,
  "Cidades: Praça de Escambo (capital, Sul). Facções: Departamento de Contenção de Fendas (neutro).",
  "Arco: a fenda que não fecha. Etapa 3 de 8.",
  "Missões ativas: 'Mapear a fenda do Vau' — etapa: encontrar quem viu a abertura.",
  "Marta (feirante, neutro, aqui, entrou na história no DIA 1).",
  "DIA 2, manhã, 09h20.", "", "", null
);

const ACOES = [
  "Pergunto a Marta quem viu a fenda se abrir no Vau.",
  "Peço o preço da espada curta pendurada atrás do ferreiro. Quero pechinchar.",
  "Vou até a taverna e procuro quem contrata escolta de carroça.",
  "Cobro a dívida da mulher que me deve, na frente dos outros.",
  "Pergunto ao guarda do Departamento se posso ver o registro da fenda.",
  "Ofereço uma rodada de bebida ao homem da capa para soltar a língua dele.",
  "Discuto o pagamento do frete: acho pouco e digo isso.",
  "Peço informação sobre o atalho do Cemitério dos Bois.",
  "Volto à banca do ferreiro e tento outra proposta pela espada.",
  "Pergunto a Marta se ela conhece alguém que trabalhe no Vau.",
  "Procuro o careca de capa verde e pergunto do trabalho.",
  "Digo ao contratante que aceito, mas quero metade adiantada.",
  "Pergunto no mercado quem comprou ferro velho essa semana.",
  "Chamo o guarda de lado e pergunto o que ele viu de verdade.",
  "Peço à Marta que me arrume um lugar para dormir esta noite.",
  "Pergunto quanto custa contratar alguém que conheça a estrada do Vau.",
  "Confronto o contratante sobre a fenda que ele não mencionou.",
  "Peço ao ferreiro que conserte o cabo da minha espada e pergunto o preço.",
  "Falo com a mulher da banca de nabos sobre a dívida, de novo.",
  "Pergunto quem manda de verdade na Praça de Escambo.",
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
      t++; if (GRAMATICAIS.has(w)) g++;
    }
  }
  return { d: t ? g / t : 0, t };
}

async function pedir(messages) {
  const r = await fetch(API, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ system: sys, messages, maxTokens: 1600, formato: "json" }),
  });
  if (!r.ok) return { erro: `${r.status} ${(await r.text()).slice(0, 160)}` };
  const d = await r.json();
  const txt = d.texto || "";
  try { return { n: JSON.parse(txt).narrativa || "", cru: txt }; }
  catch { return { n: "", cru: txt, quebrado: true }; }
}

const historico = [];
const serie = [];
for (let i = 0; i < TURNOS; i++) {
  const acao = ACOES[i % ACOES.length];
  historico.push({ role: "user", content: acao });
  const r = await pedir(historico.slice(-JANELA));
  if (r.erro) { console.log(`[${i + 1}] ERRO ${r.erro}`); continue; }
  if (r.quebrado) { console.log(`[${i + 1}] JSON QUEBRADO: ${r.cru.slice(0, 200)}`); historico.push({ role: "assistant", content: r.cru.slice(0, 1200) }); continue; }
  historico.push({ role: "assistant", content: JSON.stringify({ narrativa: r.n }) });
  const f = falasDe(r.n);
  const { d, t } = densidade(f);
  serie.push({ turno: i + 1, d, t, falas: f.length });
  console.log(`\n[${i + 1}] (${f.length} falas · ${t} palavras faladas · ${(d * 100).toFixed(1)}%)\n${r.n.replace(/\s+/g, " ").slice(0, 700)}`);
}

console.log("\n\n" + "#".repeat(70) + "\nturno  falas  palavras  densidade");
for (const s of serie) console.log(String(s.turno).padStart(4) + "  " + String(s.falas).padStart(5) + "  " + String(s.t).padStart(8) + "  " + (s.d * 100).toFixed(1) + "%");
const meta = (a) => { let g = 0, t = 0; for (const s of a) { g += s.d * s.t; t += s.t; } return t ? g / t : 0; };
const meio = Math.ceil(serie.length / 2);
console.log(`\nprimeira metade: ${(meta(serie.slice(0, meio)) * 100).toFixed(1)}%   ·   segunda metade: ${(meta(serie.slice(meio)) * 100).toFixed(1)}%`);
