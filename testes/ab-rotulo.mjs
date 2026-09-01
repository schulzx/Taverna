/* O ENVELOPE QUE VAZA, e o teste que o prende.

   Capturado na partida do jogador, dois turnos seguidos:

     envelope → [ROLAGEM] Teste de Presença (causar boa impressão): rolei 4 …
     na tela   → "— Você quer CAUSAR BOA IMPRESSÃO. Achei que fosse outro tipo."

     envelope → [AGORA] a data chega, e nela é possível o que não é possível…
     na tela   → "— Você está atrasada. A DATA CHEGOU."

   "causar boa impressão" é `rotulo` em desafios.js:377 — texto escrito para
   o PAINEL ("🎯 causar boa impressão — dificuldade 14"), não para a boca de
   ninguém. O envelope o entrega ao Narrador como se fosse a matéria da
   cena, e o Narrador faz a única coisa que pode com um rótulo: repete.

   É a regra que a Pauta já escreveu no comentário dela — "se uma linha
   pode ser copiada para a narração como está, ela está errada" — e que o
   prompt nunca disse a ninguém. Regra escrita sem código atrás.

   Mede: quantas falas trazem o rótulo do sistema. */

const S = "../src/";
const { montarSystemPrompt } = await import(S + "prompt.js");

const API = "https://taverna-sooty.vercel.app/api/narrador";
const N = Number(process.env.N || 10);

const mundo = { genero: "Fantasia sombria", descricao: "Fendas se abrem no chão e cospem coisas que não deviam existir. Caçadores são pagos por contenção.", voz: "taverneiro" };
const personagem = {
  nome: "Íris Vantel", conceito: "Caçadora de fendas", nivel: 1,
  vida: 19, vidaMax: 19, mana: 8, manaMax: 8, xp: 0, moedas: 40,
  raca: "Meio-orc", classe: "Caçador", profissao: "Ferreiro",
  atributos: { forca: 2, destreza: 3, vigor: 4, intelecto: 0, sabedoria: 0, carisma: 1 },
  inventario: [{ nome: "Faca" }], habilidades: [], grupo: [], cicatrizes: [],
};
const bancoNomes = { elenco: [], cidades: ["Baixo do Eco"], tavernas: ["Quintal da Esquina"] };

const sysBase = montarSystemPrompt(
  "O Décimo Portão", mundo, personagem, {}, bancoNomes,
  "Cidades: Baixo do Eco (capital, Margens Escarlates).",
  "Arco: a fenda que não fecha. Etapa 2 de 8.", "",
  "Sid do Norte (mercador, neutro, aqui). Vera da Serpente (recrutadora, neutro, aqui).",
  "DIA 2, manhã, 08h55.", "", "", null
);

/* Os quatro turnos reais, cada um com o rótulo do sistema dentro. */
const TURNOS = [
  { rot: "impressao", marca: ["causar boa impress", "boa impress"],
    txt: `Chego na banca que vende equipamento de fenda e pergunto o que ela tem para quem entra pela primeira vez.
[ROLAGEM] Teste de Presença (causar boa impressão): rolei 4, modificador +0, total 4, dificuldade 14. Resultado: falha. Narre as consequências de forma coerente com o resultado.` },
  { rot: "vestigios", marca: ["ler os vestígios", "ler o vestígio", "vestígios"],
    txt: `Reviro o chão perto da barraca atrás de qualquer coisa que me diga quem esteve aqui.
[ROLAGEM] Teste de Percepção (ler os vestígios): rolei 17, modificador +1, total 18, dificuldade 15. Resultado: sucesso. Narre as consequências de forma coerente com o resultado.` },
  { rot: "intencao", marca: ["ler a intenção", "a intenção dele", "ler a intencao"],
    txt: `Olho para o Sid tentando entender se ele está me enrolando.
[ROLAGEM] Teste de Percepção (ler a intenção): rolei 3, modificador +1, total 4, dificuldade 15. Resultado: falha. Narre as consequências de forma coerente com o resultado.` },
  { rot: "convencer", marca: ["convencer"],
    txt: `Peço ao Sid que me deixe levar a corda fiado e pago quando voltar.
[ROLAGEM] Teste de Presença (convencer): rolei 8, modificador +1, total 9, dificuldade 15. Resultado: falha. Narre as consequências de forma coerente com o resultado.` },
];

/* A REGRA QUE FALTA. O prompt nunca disse que o texto do envelope é
   anotação de bastidor — só disse isso do que está entre colchetes, e o
   rótulo vem DENTRO dos parênteses, fora dos colchetes. */
const REGRA = `
- O RÓTULO DO SISTEMA NÃO É FALA DE NINGUÉM (regra dura): os envelopes trazem o nome que o SISTEMA deu à ação — "causar boa impressão", "ler os vestígios", "ler a intenção", "convencer", "a data chega". Isso é etiqueta de painel, não é português de gente: serve para você saber O QUE foi tentado e com que resultado, e morre aí. É PROIBIDO escrever essa expressão na narrativa, e é pior ainda pôr uma delas na boca de um personagem — ninguém neste mundo diz "você quer causar boa impressão". Narre o GESTO que o rótulo nomeia (o sorriso que não pegou, o olho que não achou nada, a mão que hesitou) e deixe as palavras do rótulo fora da cena.`;

function falasDe(txt) {
  const s = String(txt || "");
  const out = [];
  for (const m of s.matchAll(/[—–]\s*([^\n—–]{6,})/g)) out.push(m[1]);
  for (const m of s.matchAll(/[“”«]([^“”»]{6,})[”“»]/g)) out.push(m[1]);
  for (const m of s.matchAll(/"([^"]{6,})"/g)) out.push(m[1]);
  return out;
}
const baixa = (s) => String(s).toLowerCase();

async function pedir(system, user) {
  const r = await fetch(API, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ system, messages: [{ role: "user", content: user }], maxTokens: 1600, formato: "json" }),
  });
  if (!r.ok) return { erro: `${r.status}` };
  const d = await r.json();
  try { return { n: JSON.parse(d.texto || "").narrativa || "", prov: d.provedor }; } catch { return { n: "", prov: d.provedor }; }
}

async function rodar(rot, system) {
  console.log("\n" + "=".repeat(72) + "\n" + rot + "\n" + "=".repeat(72));
  let naFala = 0, naProsa = 0, ok = 0;
  for (let i = 0; i < N; i++) {
    const t = TURNOS[i % TURNOS.length];
    const r = await pedir(system, t.txt);
    if (r.erro || !r.n) { console.log(`  [${i + 1}] erro ${r.erro || "sem narrativa"}`); continue; }
    ok++;
    const fs = falasDe(r.n);
    const vazFala = fs.filter((f) => t.marca.some((m) => baixa(f).includes(m)));
    const vazProsa = t.marca.some((m) => baixa(r.n).includes(m));
    if (vazFala.length) naFala++;
    if (vazProsa) naProsa++;
    const sinal = vazFala.length ? "VAZOU NA FALA" : vazProsa ? "vazou na prosa" : "limpo";
    console.log(`\n  [${i + 1}] ${t.rot} · ${sinal}`);
    if (vazFala.length) console.log("      >>> " + vazFala.map((v) => '"' + v.slice(0, 90) + '"').join("\n      >>> "));
    console.log("      " + r.n.replace(/\s+/g, " ").slice(0, 340));
  }
  console.log(`\n>>> ${rot}: rótulo na FALA em ${naFala}/${ok} · em qualquer lugar da prosa em ${naProsa}/${ok}`);
  return { rot, naFala, naProsa, ok };
}

const a = await rodar("A · como está hoje", sysBase);
const b = await rodar("B · com a regra", sysBase.replace("\nESTILO: NPCs falam em 1ª pessoa", REGRA + "\nESTILO: NPCs falam em 1ª pessoa"));

console.log("\n\n" + "#".repeat(72));
for (const r of [a, b]) console.log(`${r.rot.padEnd(24)} na fala ${r.naFala}/${r.ok}   na prosa ${r.naProsa}/${r.ok}`);
