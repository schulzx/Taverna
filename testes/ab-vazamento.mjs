/* A CAUSA, e agora com o envelope real no meio.

   Os três testes anteriores usavam o prompt de sistema real mas um turno
   NU — sem Pauta e sem envelope. Por isso a fala saía impecável nos três.
   No jogo de verdade o turno chega assim (capturado da partida, turno 12):

     [PAUTA DO TURNO 12 …]
     ONDE   … comporta: usar a plateia — envergonhar, apelar, chamar
            testemunha; sumir na multidão, comprar depressa …
     A GENTE  Vera continua o que estava fazendo …
     NÃO PODE  o lugar não comporta: fazer qualquer coisa em segredo …
     [O MUNDO SE MEXE] … A FORMA: A notícia chega VELHA …
     [AGORA] … a data chega, e nela é possível o que não é possível …

   E o que voltou foi o Sid dizendo "— Você está atrasada. A DATA CHEGOU."
   e, no turno anterior, "— Você quer CAUSAR BOA IMPRESSÃO", que é o
   RÓTULO DO TESTE do sistema, palavra por palavra.

   A Pauta já sabe disso: "se uma linha da Pauta pode ser copiada para a
   narração como está, ela está errada." Só que isso está escrito num
   COMENTÁRIO — o prompt nunca diz ao Narrador que aquelas palavras são
   do sistema e não são de ninguém. Regra escrita sem código atrás.

   Este teste mede o VAZAMENTO: quantas falas trazem palavra que veio do
   envelope. E compara com o mesmo turno mais uma linha proibindo. */

const S = "../src/";
const { montarSystemPrompt } = await import(S + "prompt.js");

const API = "https://taverna-sooty.vercel.app/api/narrador";
const N = Number(process.env.N || 8);

const mundo = {
  genero: "Fantasia sombria",
  descricao: "Fendas se abrem no chão e cospem coisas que não deviam existir. Caçadores são pagos por contenção.",
  voz: "taverneiro",
};
const personagem = {
  nome: "Íris Vantel", conceito: "Caçadora de fendas", nivel: 1,
  vida: 19, vidaMax: 19, mana: 8, manaMax: 8, xp: 0, moedas: 40,
  raca: "Meio-orc", classe: "Caçador", profissao: "Ferreiro",
  atributos: { forca: 2, destreza: 3, vigor: 4, intelecto: 0, sabedoria: 0, carisma: 1 },
  inventario: [{ nome: "Faca" }], habilidades: [], grupo: [], cicatrizes: [],
};
const bancoNomes = {
  elenco: Array.from({ length: 10 }, (_, i) => ({ nome: `Pessoa ${i}`, genero_pessoa: i % 2 ? "mulher" : "homem", raca: "humano", ocupacao: "feirante", traco: "desconfiada" })),
  cidades: ["Baixo do Eco"], tavernas: ["Quintal da Esquina"],
};
const sysBase = montarSystemPrompt(
  "O Décimo Portão", mundo, personagem,
  { "Íris Vantel": { tipo: "pessoa", papel: "caçadora de fendas", local: "Baixo do Eco" } },
  bancoNomes,
  "Cidades: Baixo do Eco (capital, Margens Escarlates).",
  "Arco: a fenda que não fecha. Etapa 2 de 8.",
  "Missões oferecidas: 'Tirar Kleber de lá' (de Sid do Norte).",
  "Sid do Norte (mercador, neutro, aqui). Vera da Serpente (recrutadora, neutro, aqui).",
  "DIA 2, manhã, 08h55.", "", "", null
);

/* A REGRA QUE FALTA — a mesma que a Pauta já escreveu no comentário dela,
   agora dita ao Narrador. */
const REGRA = `
- AS PALAVRAS DO SISTEMA NÃO SÃO DE NINGUÉM (regra dura): a PAUTA e os envelopes são anotações de bastidor, escritas em língua de sistema — rótulos, resumos e etiquetas ("causar boa impressão", "a data chega", "o lugar comporta", "a notícia chega velha"). Elas dizem O QUE acontece; as palavras com que aquilo acontece são SUAS e dos personagens. É PROIBIDO copiar uma expressão da Pauta ou de um envelope para dentro da narrativa, e é PIOR AINDA pôr uma delas na boca de alguém: ninguém neste mundo fala em rótulo de sistema. Se ao reler uma fala ela repetir uma expressão que você leu no envelope, reescreva a fala.
- TODA FALA É DE GENTE: cada linha de diálogo tem de ser uma frase inteira que uma pessoa daquele ofício diria em voz alta, com verbo e sem etiqueta. Um personagem responde ao que foi perguntado ANTES de trazer o que o envelope pediu — e traz o assunto do envelope pelo que ele significa para ELE, nunca pelo nome que o sistema deu.`;

/* O TURNO REAL, copiado da partida (turno 12). */
const PAUTA = `[PAUTA DO TURNO 12 — decidido pelo SISTEMA. Ligue os pontos e conte COMO aconteceu; o que está aqui é o QUE e o COM QUEM, e não se discute.]
ONDE      em Praça de Escambo, dentro de Baixo do Eco · chuva
          comporta: usar a plateia — envergonhar, apelar, chamar testemunha; sumir na multidão, comprar depressa, ver de longe quem te segue; achar qualquer ofício, sumir sem esforço, comprar o que não se acha
A GENTE   Vera da Serpente continua o que estava fazendo, e o que estava fazendo é do ofício dela
          Sid do Norte fala comigo mas olha para quem está comigo, medindo os dois
NÃO PODE  o lugar não comporta: fazer qualquer coisa em segredo, ameaçar sem que corra; conversa longa sem ser interrompido; chegar a quem manda sem intermediário
[O MUNDO SE MEXE — ESCOLHIDO PELO SISTEMA] Enquanto eu fazia o que fiz, a notícia de algo que já aconteceu chega até você: o que já se comenta por aqui.
REGRA DESTE ENVELOPE (obrigatória): este fio JÁ EXISTE no jogo — traga-o à cena agora, em duas ou três frases, ENTRELAÇADO com o que eu acabei de fazer.
A FORMA (escolhida pelo sistema, obrigatória): A notícia chega VELHA: aquilo já aconteceu há tempo e o mundo já andou desde então. Deixe claro que eu estou reagindo tarde.
[AGORA — DECISÃO DO SISTEMA] Agora ACONTECE: a data chega, e nela é possível o que não é possível nos outros dias.
Pergunto ao Sid quanto custa uma corda boa e um lampião, e tento baixar o preço.
[RODAPÉ DO SISTEMA] Agora: 2 de Brumal (dia 2), 08:55, primavera. Local: em Praça de Escambo, dentro de Baixo do Eco.`;

/* As expressões que só existem no envelope. Se aparecerem na fala, vazou. */
const MARCAS = [
  "causar boa impress", "a data cheg", "a data chegou", "o lugar comporta", "comporta",
  "notícia chega velha", "reagindo tarde", "usar a plateia", "chamar testemunha",
  "sumir na multidão", "o que já se comenta", "envelope", "pauta", "sistema decidiu",
  "não comporta", "medindo os dois", "do ofício dela",
];

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
  try { return { n: JSON.parse(d.texto || "").narrativa || "" }; } catch { return { n: "" }; }
}

async function rodar(rot, system) {
  console.log("\n" + "=".repeat(72) + "\n" + rot + "\n" + "=".repeat(72));
  let turnosComVazamento = 0, falasVazadas = 0, totalFalas = 0, ok = 0;
  for (let i = 0; i < N; i++) {
    const r = await pedir(system, PAUTA);
    if (r.erro || !r.n) { console.log(`  [${i + 1}] erro ${r.erro || "sem narrativa"}`); continue; }
    ok++;
    const fs = falasDe(r.n);
    totalFalas += fs.length;
    const vaz = fs.filter((f) => MARCAS.some((m) => baixa(f).includes(m)));
    falasVazadas += vaz.length;
    if (vaz.length) turnosComVazamento++;
    console.log(`\n  [${i + 1}] ${fs.length} falas${vaz.length ? ` · VAZOU ${vaz.length}: ${vaz.map((v) => '"' + v.slice(0, 70) + '"').join(" | ")}` : " · limpo"}`);
    console.log("      " + r.n.replace(/\s+/g, " ").slice(0, 400));
  }
  console.log(`\n>>> ${rot}: ${turnosComVazamento}/${ok} turnos com vazamento · ${falasVazadas}/${totalFalas} falas`);
  return { rot, turnosComVazamento, ok, falasVazadas, totalFalas };
}

const r1 = await rodar("A · como está hoje", sysBase);
const r2 = await rodar("B · com a regra que falta", sysBase.replace("\nESTILO: NPCs falam em 1ª pessoa", REGRA + "\nESTILO: NPCs falam em 1ª pessoa"));

console.log("\n\n" + "#".repeat(72));
for (const r of [r1, r2]) console.log(`${r.rot.padEnd(28)} turnos ${r.turnosComVazamento}/${r.ok}   falas ${r.falasVazadas}/${r.totalFalas}`);
