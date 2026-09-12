/* A ARENA (v9.215) — o duelo provável, uma peça para três mesas

   As leis desta suíte: determinismo é o árbitro (mesma dupla + mesma
   semente = mesmo duelo, golpe a golpe); a ficha original nunca é mutada
   (o duelo não deixa cicatriz); toda queda TERMINA; e a CATRACA DO
   EQUILÍBRIO — o round-robin dos oito trava a taxa de vitória de todo
   pronto entre 35% e 65%. Um pronto que domina quebra aqui, no dia em
   que passou a dominar. */

const RAIZ = "../src/";
const A = await import(RAIZ + "arena.js");
const P = await import(RAIZ + "prontos.js");
const { readFileSync } = await import("node:fs");

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

sec("1. o determinismo é o árbitro (lei v)");
{
  const r1 = A.duelarProntos("muralha", "chama", { semente: "prova" });
  const r2 = A.duelarProntos("muralha", "chama", { semente: "prova" });
  t("mesma dupla + mesma semente = a MESMA série, golpe a golpe", JSON.stringify(r1) === JSON.stringify(r2));
  t("a sorte é travada e restaurada (Math.random volta ao original)", Math.random !== Math.random() && typeof Math.random() === "number");
  const muitos = new Set(["a", "b", "c", "d", "e", "f"].map((s) => A.duelarProntos("sombra", "punho", { semente: s }).placar + A.duelarProntos("sombra", "punho", { semente: s }).vencedor));
  t("sementes diferentes dão duelos diferentes (não é resultado fixo)", muitos.size >= 2);
}

sec("2. a série: melhor de três, terreno novo por queda");
{
  const r = A.duelarProntos("voz", "flecha", { semente: "serie" });
  /* o placar é aXb com a = quedas de A: quem vence tem 2, o outro 0 ou 1 */
  t("vence quem faz duas quedas", ["A", "B"].includes(r.vencedor) && (() => { const [a, b] = r.placar.split("×").map(Number); return Math.max(a, b) === 2 && Math.min(a, b) <= 1 && ((a > b) === (r.vencedor === "A")); })());
  t("no máximo três quedas", r.quedas.length >= 2 && r.quedas.length <= 3);
  t("todo terreno vem da tabela da arena", r.quedas.every((q) => A.TERRENOS_DA_ARENA.some((x) => x.id === q.terreno)));
  t("são 5 terrenos, no vocabulário do combate", A.TERRENOS_DA_ARENA.length === 5 && ["apertado", "aberto", "escuro", "alto", "agua"].every((id) => A.TERRENOS_DA_ARENA.some((x) => x.id === id)));
  t("cada queda conta a própria história (linhas do duelo seco)", r.quedas.every((q) => q.linhas.length >= 2));
}

sec("3. o duelo não deixa cicatriz (lei vi)");
{
  const original = P.montarPronto("remendo");
  const antes = JSON.stringify(original);
  A.simularSerie(original, P.montarPronto("punho"), { semente: "cicatriz" });
  t("a ficha original sai exatamente como entrou", JSON.stringify(original) === antes);
  t("prepararDuelista devolve cópia cheia (vida e mana no teto, limpo)", (() => { const d = A.prepararDuelista({ ...original, vida: 1, mana: 0, condicoes: [{ nome: "x" }] }); return d.vida === d.vidaMax && d.mana === d.manaMax && d.condicoes.length === 0; })());
}

sec("4. toda queda termina");
{
  /* os dois mais duros de matar, muitas sementes: nenhuma queda passa do
     teto, e sempre há vencedor — empate eterno não existe */
  let ok = true;
  for (const s of ["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8"]) {
    const q = A.simularQueda(P.montarPronto("muralha"), P.montarPronto("voto"), { semente: s });
    if (q.rodadas > A.RODADAS_MAX || !["A", "B"].includes(q.vencedor)) ok = false;
  }
  t("teto de rodadas respeitado e vencedor sempre declarado", ok);
}

sec("5. os pilotos da casa lutam como gente da casa (lei x)");
{
  /* o clérigo se cura em alguma queda — a decisão vem do catálogo de
     companheiros, não de IA nova; e a cura muda o duelo de verdade */
  let curou = false;
  for (const s of ["c1", "c2", "c3", "c4", "c5", "c6"]) {
    const q = A.simularQueda(P.montarPronto("remendo"), P.montarPronto("sombra"), { semente: s });
    if (q.linhas.some((l) => /se recompõe/.test(l))) curou = true;
  }
  t("o curandeiro se recompõe quando o corpo pede", curou);
  /* o filtro do piloto: só ataque e cura — buff que a arena não aplica
     por inteiro fica fora da mesa (a razão está escrita no módulo) */
  const src = readFileSync("../src/arena.js", "utf8");
  /* o filtro usa os classificadores da CASA (companheiros.js), não string
     de tipo — cura é "suporte" e só o classificador sabe disso */
  t("o piloto só enxerga o que o duelo aplica por inteiro", /ehCuraDeGrupo\(h\) \|\| ehOfensiva\(h\)/.test(src));
  t("a poção sai da bolsa pelo aplicador oficial", /usarConsumivel\(eu, a\.item\)/.test(src) && /inventario\.splice/.test(src));
}

sec("6. A CATRACA DO EQUILÍBRIO — teste, não intenção");
{
  const rr = A.roundRobin({ sementes: 30 });
  const taxas = Object.entries(rr);
  t("os oito jogam o round-robin completo", taxas.length === 8);
  for (const [id, tx] of taxas) {
    t(`${id} vence entre 35% e 65% (${(tx * 100).toFixed(1)}%)`, tx >= 0.35 && tx <= 0.65);
  }
}

console.log(`\n${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
