/* O PREFIXO ESTÁVEL — a pergunta que vale mais do que "o que cortar".

   Cortar instrução é caro e arriscado: cada linha do prompt está lá
   porque alguém viu o Narrador errar sem ela. Mas existe uma pergunta
   anterior, e ela pode valer mais do que qualquer corte:

     QUANTO DO PROMPT É IDÊNTICO ENTRE DOIS TURNOS?

   O provedor cobra um token de entrada relido por cerca de um décimo do
   preço de um novo — mas só do PREFIXO, e só enquanto ele for
   byte-a-byte igual. A primeira diferença encerra o desconto: tudo dali
   para a frente é cobrado cheio, mesmo o que não mudou.

   Então a ordem do texto vale dinheiro. Se as partes voláteis (a ficha,
   o dia, o lugar, a cena) estiverem no COMEÇO ou espalhadas pelo meio, o
   prefixo estável é curto e a campanha paga o prompt inteiro toda
   jogada. Se estiverem todas no fim, quase tudo cai no preço barato — e
   sem apagar uma linha sequer.

   Isto mede o prefixo comum entre turnos de uma mesma partida. */

const S = "../src/";
const { montarSystemPrompt } = await import(S + "prompt.js");

const base = { nome: "Brann", conceito: "druida", historia: "", nivel: 8, raca: "Humano", classe: "Druida", atributos: { forca: 1, destreza: 1, vigor: 4, intelecto: 4, presenca: 1, percepcao: 1 }, vidaMax: 61, manaMax: 48, vida: 61, mana: 48, moedas: 40 };
const bn = { elenco: [], cidades: [], tavernas: [] };
const cena = { emCidade: true };

const monta = (p, extra = {}) => montarSystemPrompt(
  "A Maré de Ferro", { genero: "Fantasia medieval" }, p,
  extra.canone || {}, bn,
  extra.mapa || "", extra.historia || "", extra.quests || "", extra.npcs || "",
  extra.tempo || "", "", "Mortal", cena
);

const prefixo = (a, b) => { let i = 0; while (i < a.length && i < b.length && a[i] === b[i]) i++; return i; };

const T1 = monta(base, { tempo: "TEMPO: dia 12, 09:00" });

console.log("TURNO A:", T1.length, "caracteres\n");
console.log("prefixo idêntico depois de cada mudança de um turno para o outro:\n");

const CASOS = [
  ["o herói levou dano (vida 61→44)", monta({ ...base, vida: 44 }, { tempo: "TEMPO: dia 12, 09:00" })],
  ["passou uma hora", monta(base, { tempo: "TEMPO: dia 12, 10:00" })],
  ["gastou moedas", monta({ ...base, moedas: 12 }, { tempo: "TEMPO: dia 12, 09:00" })],
  ["subiu de nível", monta({ ...base, nivel: 9 }, { tempo: "TEMPO: dia 12, 09:00" })],
  ["o cânone ganhou um fato", monta(base, { tempo: "TEMPO: dia 12, 09:00", canone: { ume: { tipo: "pessoa", papel: "ferreira" } } })],
  ["descobriu uma cidade", monta(base, { tempo: "TEMPO: dia 12, 09:00", mapa: "MAPA: Forte Rasa, Ponte das Velas" })],
  ["abriu uma missão", monta(base, { tempo: "TEMPO: dia 12, 09:00", quests: "MISSÃO: achar o irmão de Ume" })],
];

let pior = T1.length;
for (const [nome, T2] of CASOS) {
  const p = prefixo(T1, T2);
  if (T1 === T2) { console.log(`  ${String("idêntico").padStart(7)}  ${nome} (não mexe no prompt)`); continue; }
  pior = Math.min(pior, p);
  const pct = Math.round((p / T1.length) * 100);
  console.log(`  ${String(p).padStart(7)}  ${String(pct + "%").padStart(4)}  ${nome}`);
}

console.log(`\nPIOR CASO: ${pior} de ${T1.length} (${Math.round((pior / T1.length) * 100)}%) sobrevivem como prefixo.`);
console.log(`Ou seja: ${T1.length - pior} caracteres são cobrados CHEIOS em todo turno em que qualquer uma dessas coisas muda.`);

/* ---------------- ONDE ESTÁ A PRIMEIRA DIFERENÇA ----------------
   O número acima não diz o que consertar. Isto diz: qual é a primeira
   coisa volátil do texto, porque é ela que decide o teto de todas as
   outras. */
const T2 = monta({ ...base, vida: 44 }, { tempo: "TEMPO: dia 12, 09:00" });
const i = prefixo(T1, T2);
console.log(`\n-- a primeira divergência, em ${i} --`);
console.log("...antes: " + JSON.stringify(T1.slice(Math.max(0, i - 90), i)));
console.log("   A vira: " + JSON.stringify(T1.slice(i, i + 70)));
console.log("   B vira: " + JSON.stringify(T2.slice(i, i + 70)));
