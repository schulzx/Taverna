/* O INSTRUMENTO ERRADO, e o certo.

   Os três exemplos do jogador não têm palavra faltando:

     "Tu não paga bebida, não paga estrada"   → tu + 3ª pessoa
     "Quinze agora ficam melhores"            → sujeito e verbo brigando
     "cobre o risco antes do sangue secar"    → sujeito que não existe

   É CONCORDÂNCIA. E a primeira medida que fiz — densidade de artigo e
   preposição — é cega para isso: uma frase com concordância quebrada tem
   exatamente os mesmos artigos de uma frase certa. Por isso A e B deram
   30,8% e 30,1% e eu li empate onde havia diferença.

   A prova de que o defeito está aí veio do meu próprio teste A, sem que
   eu tivesse olhado para ela:

     "Cê volta com OS BOLSO CHEIO ou não volta, boneca."
     "levo UMAS MOEDA ADIANTADO e te guardo o resto"

   E a causa está escrita na voz padrão da casa, em vozes.js:

     frase: "curta, QUEBRADA, com FRAGMENTO SEM VERBO. Fala em cima de fala"
     boca:  "... e NINGUÉM FALA BONITO de propósito"

   O modelo obedece às duas — e a única forma que ele conhece de "falar
   feio" em português é errar concordância. O registro que se queria
   (gíria, contração, palavrão) não precisa disso; a gramática quebrada
   não é sotaque, é ruído, e é o que o jogador está lendo.

   Aqui o juiz é um segundo modelo, a temperatura baixa, lendo linha por
   linha. Regex não julga concordância em português. */

const S = "../src/";
const { VOZES } = await import(S + "vozes.js");
const { montarSystemPrompt } = await import(S + "prompt.js");

const API = "https://taverna-sooty.vercel.app/api/narrador";
const N = Number(process.env.N || 10);

const V = VOZES.find((v) => v.id === "taverneiro");

/* O CONSERTO: o registro fica inteiro — gíria, contração, apelido,
   palavrão, fala em cima de fala. Sai só a licença para errar. */
const CONSERTO = {
  frase: "curta e falada, com interrupção e resposta em cima da fala do outro. Cortada pelo RITMO — a frase termina antes do esperado —, nunca pela gramática",
  boca: "palavrão à vontade quando cabe no personagem — merda, porra, filho da puta, caralho —, apelido em vez de nome, gíria e a contração da fala viva ('tá', 'cê', 'pra', 'né'). Quem se machuca xinga antes de gemer. Ninguém fala BONITO; todo mundo fala CERTO — gíria e contração sim, concordância errada não, que erro de concordância não é sotaque, é ruído",
};

function bloco(v, over = {}) {
  const x = { ...v, ...over };
  return `A SUA VOZ — ${x.nome.toUpperCase()} (${x.resumo}). É assim que você conta, em toda cena, do começo ao fim da campanha.
O QUE ESTA VOZ FAZ: ${x.faz.map((s, i) => `(${i + 1}) ${s}`).join("; ")}.
COMO ELA SOA: ${x.frase}.
COMO AS PESSOAS FALAM: ${x.boca}.
DE ONDE VEM A GRAÇA: ${x.graca}.
O ERRO CARACTERÍSTICO DESTA VOZ, e é o único de que você precisa se guardar: ${x.naoFaz}.
UMA FRASE NO REGISTRO CERTO: "${x.exemplo}"
A VOZ É A BOCA, NÃO O MUNDO: o que existe e o que acontece continuam vindo do sistema e dos envelopes; ela decide só como aquilo soa.`;
}

const mundo = { genero: "Fantasia sombria", descricao: "Fendas se abrem no chão e cospem coisas que não deviam existir. Caçadores são pagos por contenção.", voz: "taverneiro" };
const personagem = {
  nome: "Íris Vantel", conceito: "Caçadora de fendas", nivel: 1,
  vida: 19, vidaMax: 19, mana: 8, manaMax: 8, xp: 0, moedas: 40,
  raca: "Meio-orc", classe: "Caçador", profissao: "Ferreiro",
  atributos: { forca: 2, destreza: 3, vigor: 4, intelecto: 0, sabedoria: 0, carisma: 1 },
  inventario: [{ nome: "Faca" }], habilidades: [], grupo: [], cicatrizes: [],
};
const sysBase = montarSystemPrompt(
  "O Décimo Portão", mundo, personagem, {},
  { elenco: [], cidades: ["Baixo do Eco"], tavernas: ["Quintal da Esquina"] },
  "Cidades: Baixo do Eco (capital).", "Arco: a fenda que não fecha. Etapa 2 de 8.", "",
  "Sid do Norte (mercador, aqui). Vera da Serpente (recrutadora, aqui). Otávio Oliveira (taverneiro, aqui).",
  "DIA 2, manhã, 08h55.", "", "", null
);

const ORIGINAL = bloco(V);
const CORRIGIDO = bloco(V, CONSERTO);
const sysA = sysBase;
const sysB = sysBase.replace(ORIGINAL, CORRIGIDO);
if (sysA === sysB) { console.log("!! o bloco da voz não bateu — o teste seria falso"); process.exit(1); }

const CENAS = [
  "Pergunto ao Sid quanto custa uma corda boa e um lampião, e tento baixar o preço.",
  "Chego na taverna e peço trabalho ao Otávio.",
  "Cobro da Vera o que ela me prometeu, na frente dos outros.",
  "Pergunto ao Sid o que ele sabe sobre a fenda do Setor 9.",
  "Peço fiado ao Otávio: pago quando voltar da fenda.",
];

function falasDe(txt) {
  const s = String(txt || "");
  const out = [];
  for (const m of s.matchAll(/[—–]\s*([^\n—–]{8,})/g)) out.push(m[1].trim());
  for (const m of s.matchAll(/[“”«]([^“”»]{8,})[”“»]/g)) out.push(m[1].trim());
  for (const m of s.matchAll(/"([^"]{8,})"/g)) out.push(m[1].trim());
  return out;
}

async function pedir(system, user, maxTokens = 1600, tarefa = "mestre") {
  const r = await fetch(API, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ system, messages: [{ role: "user", content: user }], maxTokens, formato: "json", tarefa }),
  });
  if (!r.ok) return { erro: `${r.status}` };
  const d = await r.json();
  return { txt: d.texto || "", prov: d.provedor };
}

async function colher(rot, sys) {
  const falas = [];
  for (let i = 0; i < N; i++) {
    const r = await pedir(sys, CENAS[i % CENAS.length]);
    if (r.erro) { console.log(`  ${rot}[${i + 1}] erro ${r.erro}`); continue; }
    let n = "";
    try { n = JSON.parse(r.txt).narrativa || ""; } catch { continue; }
    falas.push(...falasDe(n));
  }
  console.log(`${rot}: ${falas.length} falas colhidas`);
  return falas;
}

/* O JUIZ. Temperatura da tarefa leve (0,3): aqui criatividade é defeito. */
const JUIZ = `Você é revisor de português do Brasil. Recebe FALAS de personagens de um RPG.
Para CADA fala, diga se ela tem ERRO DE GRAMÁTICA que um falante nativo adulto não cometeria — concordância de número ou gênero ("os bolso", "umas moeda adiantado"), concordância verbal ("tu não paga", "eles vai"), regência quebrada, ou frase sem sujeito nem verbo que não se entende.
NÃO marque como erro: gíria, contração da fala ("tá", "cê", "pra", "né", "tô"), palavrão, frase curta e cortada de propósito, elipse compreensível, ou registro popular que esteja CORRETO.
Responda SOMENTE JSON: {"v":[0,1,0,...]} — um número por fala, na ordem, 1 = tem erro, 0 = não tem.`;

async function julgar(falas) {
  const marcas = [];
  for (let i = 0; i < falas.length; i += 25) {
    const lote = falas.slice(i, i + 25);
    const user = lote.map((f, k) => `${k + 1}. ${f}`).join("\n");
    const r = await pedir(JUIZ, user, 1200, "leve");
    let v = [];
    try { v = JSON.parse(r.txt).v || []; } catch { v = []; }
    for (let k = 0; k < lote.length; k++) marcas.push({ fala: lote[k], erro: Number(v[k]) === 1 });
  }
  return marcas;
}

console.log("colhendo…\n");
const fA = await colher("A", sysA);
const fB = await colher("B", sysB);

console.log("\njulgando…\n");
const mA = await julgar(fA);
const mB = await julgar(fB);

const conta = (m) => ({ erros: m.filter((x) => x.erro).length, total: m.length });
const cA = conta(mA), cB = conta(mB);

console.log("=".repeat(72) + "\nA · taverneiro como está — falas marcadas com erro:");
for (const x of mA.filter((y) => y.erro)) console.log("   ✗ " + x.fala.slice(0, 100));
console.log("\n" + "=".repeat(72) + "\nB · taverneiro com a gramática exigida — falas marcadas com erro:");
for (const x of mB.filter((y) => y.erro)) console.log("   ✗ " + x.fala.slice(0, 100));

console.log("\n" + "#".repeat(72));
console.log(`A · como está    ${cA.erros}/${cA.total} falas com erro   (${(100 * cA.erros / (cA.total || 1)).toFixed(1)}%)`);
console.log(`B · consertado   ${cB.erros}/${cB.total} falas com erro   (${(100 * cB.erros / (cB.total || 1)).toFixed(1)}%)`);
