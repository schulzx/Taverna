/* O QUE SÃO OS 54 MIL.

   As portas cortaram um terço e acabaram: 28 das 30 já estão fechadas
   numa cena comum. O que sobra é núcleo, e núcleo só encolhe sendo
   reescrito — então a primeira pergunta não é "o que dá para fechar", é
   "o que este texto está FAZENDO".

   A hipótese que quero testar: o prompt é um museu de responsabilidades
   removidas. Cada vez que uma decisão saiu da IA e virou código, a
   instrução que falava dela ficou — só que virada do avesso, de "faça
   assim" para "NÃO faça, o sistema faz".

   Se isso for verdade, a maior parte do núcleo não ensina a narrar:
   ensina a não fazer coisas que já não são possíveis. */

const S = "../src/";
const { montarSystemPrompt } = await import(S + "prompt.js");

const pers = { nome: "Brann", conceito: "druida", historia: "", nivel: 8, raca: "Humano", classe: "Druida", atributos: { forca: 1, destreza: 1, vigor: 4, intelecto: 4, presenca: 1, percepcao: 1 }, vidaMax: 61, manaMax: 48 };
const P = montarSystemPrompt("C", { genero: "Fantasia medieval" }, pers, {}, { elenco: [], cidades: [], tavernas: [] }, "", "", "", "", "", "", "Mortal", { emCidade: true });

console.log("núcleo da cena comum:", P.length, "caracteres\n");

/* ---------------- A CLASSIFICAÇÃO ----------------
   Por FRASE, e não por bloco: um bloco "sobre combate" costuma ter uma
   linha de ofício e seis de proibição, e medir por bloco esconde
   exatamente o que eu quero ver. */
const frases = P.split(/(?<=[.!?])\s+|\n/).map((x) => x.trim()).filter((x) => x.length > 25);

const PROIBE = /\bNÃO\b|\bNUNCA\b|\bJAMAIS\b|não invente|não decida|não recalcule|não escolha|não envie|não declare|não narre|é proibido|não pode|não deve/;
const ATRIBUI = /o sistema (já|resolve|calcula|decide|rola|aplica|cobra|escolhe)|resolvido pelo sistema|pelo app|o app (já|calcula|resolve)|quem (rola|decide|julga|aplica) é|é do sistema|do código|por código/i;
const OFICIO = /narre|conte|descreva|mostre|abra a cena|na ficção|voz de|encene|escreva|frase|imagem|cheiro|silêncio|detalhe|tom\b|ritmo/i;
const FORMATO = /"[a-z_]+"\s*:|JSON|campo|envie em|chave\b/;

const balde = { proibicao: [], atribuicao: [], oficio: [], formato: [], fato: [] };
for (const f of frases) {
  if (PROIBE.test(f)) balde.proibicao.push(f);
  else if (ATRIBUI.test(f)) balde.atribuicao.push(f);
  else if (FORMATO.test(f)) balde.formato.push(f);
  else if (OFICIO.test(f)) balde.oficio.push(f);
  else balde.fato.push(f);
}

const total = frases.reduce((s, f) => s + f.length, 0);
const pct = (n) => `${Math.round((n / total) * 100)}%`.padStart(4);
console.log("-- o que o núcleo FAZ, por caractere --");
for (const [k, v] of Object.entries(balde).sort((a, b) => b[1].reduce((s, x) => s + x.length, 0) - a[1].reduce((s, x) => s + x.length, 0))) {
  const n = v.reduce((s, x) => s + x.length, 0);
  console.log(`${String(n).padStart(6)}  ${pct(n)}  ${k.padEnd(11)} (${v.length} frases)`);
}

/* ---------------- O MUSEU ----------------
   Quantas frases falam de um sistema que a IA já não toca? A lista de
   sistemas é a dos envelopes "RESOLVIDO PELO SISTEMA" que o jogo emite. */
const SISTEMAS = [
  ["combate", /combate|golpe|dano|iniciativa|ataque|inimigo/i],
  ["rolagem", /rolagem|d20|dificuldade|teste\b|dado\b/i],
  ["economia", /moeda|preço|comprar|vender|mercador/i],
  ["tempo", /tempo|dia\b|hora|relógio|calendário/i],
  ["nível", /XP|nível|habilidade|subir de/i],
  ["mundo", /cidade|mapa|facção|viagem|masmorra/i],
  ["fé", /fé|fiéis|divindade|milagre/i],
];
console.log("\n-- de que sistema cada proibição/atribuição fala --");
const naoNarrativo = [...balde.proibicao, ...balde.atribuicao];
let somaSis = 0;
for (const [nome, rx] of SISTEMAS) {
  const n = naoNarrativo.filter((f) => rx.test(f)).reduce((s, x) => s + x.length, 0);
  somaSis += n;
  console.log(`${String(n).padStart(6)}  ${nome}`);
}
console.log(`${String(naoNarrativo.reduce((s, x) => s + x.length, 0)).padStart(6)}  TOTAL não-narrativo`);

/* ---------------- O QUE ESTÁ NO BALDE MAIOR ----------------
   "fato" é o balde de sobra do meu classificador, e ele ficou com 53%.
   Balde de sobra grande é sinal de classificação preguiçosa, não de
   descoberta — então: as vinte maiores frases dele, na cara. */
console.log("\n-- as 20 maiores frases do balde 'fato' --");
for (const f of balde.fato.sort((a, b) => b.length - a.length).slice(0, 20)) {
  console.log(String(f.length).padStart(5) + "  " + f.slice(0, 110).replace(/\s+/g, " "));
}
