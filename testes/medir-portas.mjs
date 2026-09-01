/* AS PORTAS ESTÃO SEGURANDO QUANTO?

   O catálogo tem 30 portas e ninguém nunca mediu o que elas poupam. Sem
   isso não dá para saber se o prompto de 58k é "muita regra condicional
   numa cena cheia" ou "um núcleo enorme que nenhuma porta governa" — e
   as duas coisas pedem consertos opostos. */

const S = "../src/";
const { montarSystemPrompt, PORTAS_DA_CENA, portasAbertas } = await import(S + "prompt.js");

const pers = { nome: "Brann", conceito: "druida", historia: "", nivel: 8, raca: "Humano", classe: "Druida", atributos: { forca: 1, destreza: 1, vigor: 4, intelecto: 4, presenca: 1, percepcao: 1 }, vidaMax: 61, manaMax: 48 };
const monta = (cena) => montarSystemPrompt("C", { genero: "Fantasia medieval" }, pers, {}, { elenco: [], cidades: [], tavernas: [] }, "", "", "", "", "", "", "Mortal", cena).length;

const CENAS = {
  "taverna (cena comum)": { emCidade: true },
  "combate": { emCombate: true, emCidade: true },
  "masmorra": { emMasmorra: true },
  "viagem": { emViagem: true },
  "tudo aberto (cena=null)": null,
};

console.log("TAMANHO DO PROMPT POR CENA\n");
for (const [nome, c] of Object.entries(CENAS)) console.log(String(monta(c)).padStart(7) + "  " + nome);

const comum = { emCidade: true };
const abertas = portasAbertas(comum);
const nAbertas = Object.values(abertas).filter(Boolean).length;
console.log(`\nportas: ${PORTAS_DA_CENA.length} no catálogo · ${nAbertas} abertas na cena comum`);
console.log("fechadas:", PORTAS_DA_CENA.filter((p) => !abertas[p.id]).map((p) => p.id).join(", "));

/* O NÚCLEO: o que entra em TODA cena, sem exceção. É a interseção de
   todas as cenas — e é o único número que diz quanto custa simplesmente
   abrir o jogo. */
const base = monta(comum);
console.log(`\ncena comum: ${base} · tudo aberto: ${monta(null)} · as portas poupam ${monta(null) - base} numa cena comum`);

/* E quanto CADA porta aberta na cena comum está pesando: abre-se a cena
   comum sem ela e mede-se a diferença. */
console.log("\n-- peso de cada porta que está ABERTA na cena comum --");
const pesos = [];
for (const p of PORTAS_DA_CENA) {
  if (!abertas[p.id]) continue;
  /* forçar esta porta a fechar sem mexer nas outras: a única forma
     honesta é perguntar ao próprio catálogo, então usa-se um objeto de
     cena que falha só na condição dela. */
  const finge = { ...comum, __fechar: p.id };
  const origem = p.quando;
  p.quando = (c) => (c && c.__fechar === p.id ? false : origem(c));
  pesos.push([p.id, base - monta(finge)]);
  p.quando = origem;
}
pesos.sort((a, b) => b[1] - a[1]);
for (const [id, n] of pesos) if (n > 0) console.log(String(n).padStart(6), id);
console.log("\nsoma do que as portas abertas trazem:", pesos.reduce((s, x) => s + x[1], 0));
