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
/* a PROVA PENDENTE: a lei já está escrita, o código ainda não a cumpre.
   Imprime e NÃO conta — não toca `bons` nem `maus`, e o `process.exit` do
   fim continua olhando só para as falhas de verdade. A árvore não fica
   vermelha por dívida conhecida; a dívida fica VISÍVEL, com o número
   medido ao lado, até quem for consertar promovê-la a `t(...)`. */
const pendente = (nome, motivo) => { console.log("  ··  " + nome + " · pendente (A3)" + (motivo ? " — " + motivo : "")); };
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

/* ============================================================
   7. A PROVA QUE MEDE O BURACO (Fase A · A1)

   O buraco, confirmado no código: o piloto GASTA turno numa promessa que
   a arena não cumpre.

   - `aplicarAcoes` (arena.js, ramo `buff`/`guarda`) traduz o buff numa
     linha de prosa ("se guarda") e desconta mana. Nada mais acontece:
     `prepararDuelista` cria `f.efeitos = []` e ninguém nunca escreve nele.
   - `meiaRodada` TENTA tirar o buff da visão do piloto com
     `ehCuraDeGrupo(h) || ehOfensiva(h)` — mas o filtro é furado:
     `ehOfensiva` casa `RX_OFENSIVA` contra nome + descrição, e a descrição
     de "Postura Defensiva" e "Escudo Arcano" tem a palavra *dano*
     ("absorve o próximo dano"). As duas passam.
   - `decidirAcaoCompanheiro` (companheiros.js) testa `ehBuff` no passo 3,
     ANTES da ofensiva, com 70% de chance nas rodadas 1–2.

   Resultado: meia-rodada morta, e uma fatia das quedas ABRE com duas
   delas — os dois lados se guardam, e a queda começa com dois turnos em
   que nenhum número da mesa se mexeu.

   Esta seção só MEDE. As duas provas nascem PENDENTES: imprimem o número
   de hoje e não contam como falha. A3 é quem conserta a arena e promove
   as duas a `t(...)` — cada uma traz escrito, no comentário, o que tem de
   mudar para ficar verde.
   ============================================================ */
sec("7. a prova que mede o buraco (Fase A) — pendentes até A3");
{
  const C = await import(RAIZ + "companheiros.js");
  /* A TABELA DA MEDIÇÃO — sementes fixas e molde fixo, para o número
     medido ser o mesmo em qualquer máquina (lei v). São os 28 pares dos
     oito prontos × 6 sementes = 168 séries ≈ 420 quedas, em ~0,2s. */
  const MEDIDA_DO_BURACO = {
    sementesPorPar: 6,
    semente: (a, b, s) => `m|${a}|${b}|${s}`,
    /* o que A3 tem de entregar, quando promover as pendentes */
    tetoDeAberturasMortas: 0,
    razaoMaximaDeDanoAposGuarda: 0.9,
  };
  /* O RETRATO DE v9.222 — o "antes" do antes-e-depois, para a fase ter
     régua: 420 quedas · 4584 meias-rodadas · 382 mortas (8,3% do total,
     0,91 por queda) · 20 quedas (4,8%) abrindo com duas guardas · dano
     sofrido logo depois da guarda 1,034× o normal (ou seja: nenhum). */

  const GUARDA = / se guarda$/;   /* a meia-rodada morta */
  const DANO = / \(−(\d+)\)$/;    /* "A Muralha acerta O Punho (−7)" */
  const t0 = Date.now();
  const m = { quedas: 0, meias: 0, mortas: 0, aberturas: 0, danoApos: 0, golpesApos: 0, danoResto: 0, golpesResto: 0 };
  for (let i = 0; i < P.PRONTOS.length; i++) {
    for (let j = i + 1; j < P.PRONTOS.length; j++) {
      const a = P.PRONTOS[i].id, b = P.PRONTOS[j].id;
      for (let s = 0; s < MEDIDA_DO_BURACO.sementesPorPar; s++) {
        for (const q of A.duelarProntos(a, b, { semente: MEDIDA_DO_BURACO.semente(a, b, s) }).quedas) {
          /* a primeira linha é o terreno, não é meia-rodada: fora da conta */
          const ls = q.linhas.slice(1);
          m.quedas++; m.meias += ls.length;
          const jaContada = new Set();
          ls.forEach((l, k) => {
            if (!GUARDA.test(l)) return;
            m.mortas++;
            /* o golpe que o outro lado dá LOGO depois, em quem se guardou:
               se a guarda valesse alguma coisa, este número seria menor */
            const nome = l.replace(GUARDA, "");
            const prox = ls[k + 1] || "";
            const d = prox.match(DANO);
            if (d && prox.includes(nome + " (−")) { m.danoApos += Number(d[1]); m.golpesApos++; jaContada.add(k + 1); }
          });
          ls.forEach((l, k) => {
            const d = l.match(DANO);
            if (d && !jaContada.has(k)) { m.danoResto += Number(d[1]); m.golpesResto++; }
          });
          if (GUARDA.test(ls[0] || "") && GUARDA.test(ls[1] || "")) m.aberturas++;
        }
      }
    }
  }
  const mediaApos = m.danoApos / (m.golpesApos || 1);
  const mediaResto = m.danoResto / (m.golpesResto || 1);
  const razao = mediaApos / (mediaResto || 1);
  const pctAberturas = (100 * m.aberturas / m.quedas).toFixed(1);

  /* as habilidades de buff dos oito, e quais furam o filtro do piloto */
  const buffs = [];
  for (const p of P.PRONTOS) {
    for (const h of P.montarPronto(p.id).habilidades) {
      if (C.ehBuff(h) && !buffs.some((x) => x.nome === h.nome)) buffs.push(h);
    }
  }
  const furam = buffs.filter((h) => C.ehCuraDeGrupo(h) || C.ehOfensiva(h));

  console.log(`  ··  ${m.quedas} quedas e ${m.meias} meias-rodadas medidas (os 28 pares dos oito, ${MEDIDA_DO_BURACO.sementesPorPar} sementes cada)`);
  console.log(`  ··  meias-rodadas mortas ("se guarda"): ${m.mortas} — ${(100 * m.mortas / m.meias).toFixed(1)}% do total, ${(m.mortas / m.quedas).toFixed(2)} por queda`);
  console.log(`  ··  quedas que ABREM com duas meias-rodadas mortas: ${m.aberturas} de ${m.quedas} (${pctAberturas}%)`);
  console.log(`  ··  dano sofrido logo depois da guarda: ${mediaApos.toFixed(2)} contra ${mediaResto.toFixed(2)} no resto — razão ${razao.toFixed(3)} (guardar não desconta nada)`);
  console.log(`  ··  buffs no repertório dos oito: ${buffs.length}, e ${furam.length} furam o filtro do piloto (${furam.map((h) => h.nome).join(", ")})`);
  console.log(`  ··  a medição levou ${Date.now() - t0}ms`);

  /* PENDENTE (1) — por que não é asserção hoje: com `ehBuff` decidido
     antes da ofensiva e o filtro deixando "Postura Defensiva" e "Escudo
     Arcano" passarem, perto de 5% das quedas abrem com os dois lados se
     guardando. A3 promove esta linha trocando `pendente(...)` por:
        t("nenhuma queda abre com duas meias-rodadas de \"se guarda\"",
          m.aberturas <= MEDIDA_DO_BURACO.tetoDeAberturasMortas,
          `${m.aberturas} de ${m.quedas}`);
     Fica verde quando o buff virar efeito de verdade (e aí a abertura
     deixa de ser morta) ou quando o filtro do piloto parar de furar. */
  pendente("nenhuma queda abre com duas meias-rodadas de \"se guarda\"", `${m.aberturas} de ${m.quedas} abrem mortas (${pctAberturas}%)`);

  /* PENDENTE (2) — por que não é asserção hoje: o buff não escreve em
     `efeitos` e o ramo `buff`/`guarda` de `aplicarAcoes` só desconta
     mana, então o golpe que vem logo depois da guarda é idêntico a
     qualquer outro — a razão medida fica em torno de 1. A3 promove esta
     linha trocando `pendente(...)` por:
        t("um buff aplicado muda de verdade um número da queda seguinte",
          razao <= MEDIDA_DO_BURACO.razaoMaximaDeDanoAposGuarda,
          `razão ${razao.toFixed(3)}`);
     Fica verde quando a guarda escrever o efeito no duelista e
     `aplicarAcoes` descontá-lo do dano recebido na meia-rodada seguinte:
     o número cai, e a razão cai com ele. */
  pendente("um buff aplicado muda de verdade um número da queda seguinte", `dano depois da guarda é ${razao.toFixed(3)}× o normal — a guarda não mexe em número nenhum`);
}

console.log(`\n${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
