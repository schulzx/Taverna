/* A MESA FARTA DO MUNDO (v9.168)

   A segunda metade da generosidade: a onda v9.167 engordou a HISTÓRIA
   (arcos, vilões, heranças); esta engorda o MUNDO — a gente que o
   habita (índole), o que ela quer (vontades por molde), o que acontece
   nas terras do jogador (reino) e o céu de cada dia (clima).

   E ela protege as três leis que a generosidade quase quebrou na
   primeira rodada, todas mordidas por suítes vizinhas:
   · briga de traço é SIMÉTRICA — declarar de um lado só esconde o ruído;
   · todo traço vota no convite e tem cadeira no governo;
   · toda força aponta perícia que EXISTE — "religiao" e "oficio" eram
     fantasmas desde o nascimento e ninguém viu, porque o campo ainda
     não tinha leitor com número. */

const S = "../src/";
const I = await import(S + "indole.js");
const { MOLDES } = await import(S + "moldes.js");
const { EVENTOS_REINO } = await import(S + "reino.js");
const { CLIMAS } = await import(S + "encontros.js");
const { PERICIAS } = await import(S + "pericias.js");
const { MANDO } = await import(S + "dominios.js");

let bons = 0, maus = 0;
const t = (n, c) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n); } };
const sec = (s) => console.log("\n" + s);

sec("1. A ÍNDOLE ENGORDOU SEM QUEBRAR AS PRÓPRIAS LEIS");
{
  t(`há traços de sobra (${I.TRACOS.length})`, I.TRACOS.length >= 25);
  t("nenhum id repetido", new Set(I.TRACOS.map((x) => x.id)).size === I.TRACOS.length);
  t("toda briga é simétrica", I.TRACOS.every((a) => a.briga.every((b) => {
    const B = I.tracoPorId(b); return B && (B.briga.includes(a.id) || a.briga.includes(B.id));
  })) && I.TRACOS.every((a) => a.briga.every((b) => !I.compativel(a.id, b))));
  t("todo traço vota no convite", I.TRACOS.every((x) => I.VONTADE_DE_IR[x.id] !== undefined));
  t("e tem cadeira no governo", I.TRACOS.every((x) => !!MANDO[x.id]));
  t(`há medos de sobra (${I.MEDOS.length})`, I.MEDOS.length >= 16);
  /* os gatilhos novos acordam de verdade */
  const acorda = (id, txt) => { const m = I.medoPorId(id); return m && m.acorda.test(txt); };
  t("o granizo acorda o medo de tempestade", acorda("tempestade", "granizo bate no telhado"));
  t("o prefeito acorda o medo de posto", acorda("autoridade", "o prefeito chega com escolta"));
  t("a peste acorda o medo de doença", acorda("doenca", "há peste no bairro baixo"));
  t("e nada disso acorda o medo errado", !acorda("fundo", "granizo no telhado") && !acorda("feras", "o prefeito chega"));
}

sec("2. TODA FORÇA APONTA PERÍCIA QUE EXISTE");
{
  t(`há forças de sobra (${I.FORCAS.length})`, I.FORCAS.length >= 17);
  const ids = new Set(PERICIAS.map((p) => p.id));
  const fantasmas = I.FORCAS.filter((f) => !ids.has(f.pericia));
  t(`nenhuma perícia fantasma${fantasmas.length ? " — " + fantasmas.map((f) => `${f.id}→${f.pericia}`).join(", ") : ""}`, fantasmas.length === 0);
  t("nenhum id repetido", new Set(I.FORCAS.map((x) => x.id)).size === I.FORCAS.length);
}

sec("3. OS PROPÓSITOS NOVOS AMADURECEM POR FATO, COMO OS VELHOS");
{
  t(`há propósitos de sobra (${I.PROPOSITOS.length})`, I.PROPOSITOS.length >= 13);
  t("todo exige aponta traço que existe", I.PROPOSITOS.every((p) => p.exige.every((x) => !!I.tracoPorId(x))));
  t("todo propósito tem condição, virada e efeito", I.PROPOSITOS.every((p) => typeof p.madura === "function" && p.vira && p.efeito && p.efeito.tipo));
  /* os efeitos são só os que o App executa — tipo novo sem leitor é
     propósito que amadurece no vácuo */
  t("nenhum efeito de tipo inventado", I.PROPOSITOS.every((p) => ["relacao", "convite", "missao", "furto"].includes(p.efeito.tipo)));
  const desafiar = I.propositoPorId("desafiar");
  t("o desafio amadurece de ver o herói ganhar", desafiar.madura({ euGanhei: true, dias: 5 }) && !desafiar.madura({ euGanhei: false, dias: 30 }));
  const vender = I.propositoPorId("vender_o_que_sabe");
  t("vender o que sabe exige saber", vender.madura({ sabeDeMim: true, dias: 6 }) && !vender.madura({ sabeDeMim: false, dias: 60 }));
  const adotar = I.propositoPorId("adotar");
  t("adotar exige laço e tempo", adotar.madura({ forcaDoLaco: 2, dias: 9 }) && !adotar.madura({ forcaDoLaco: 0, dias: 90 }));
}

sec("4. AS VONTADES DOS QUATRO MOLDES");
{
  for (const m of MOLDES) {
    t(`${m.nome}: vontades de sobra (${m.vontades.length})`, m.vontades.length >= 24);
    t(`${m.nome}: nenhuma repetida`, new Set(m.vontades).size === m.vontades.length);
  }
}

sec("5. O REINO E O CÉU");
{
  t(`há eventos de reino de sobra (${EVENTOS_REINO.length})`, EVENTOS_REINO.length >= 20);
  t("nenhum id repetido", new Set(EVENTOS_REINO.map((e) => e.id)).size === EVENTOS_REINO.length);
  t("todo evento nomeia a cidade no texto", EVENTOS_REINO.every((e) => e.txt("Vila Teste").includes("Vila Teste")));
  t("todo evento tem peso e felicidade", EVENTOS_REINO.every((e) => e.peso > 0 && Number.isFinite(e.fel)));
  t("há dias bons e dias ruins", EVENTOS_REINO.some((e) => e.fel > 0) && EVENTOS_REINO.some((e) => e.fel < 0));
  t(`há céus de sobra (${CLIMAS.length})`, CLIMAS.length >= 12);
  t("nenhum céu repetido", new Set(CLIMAS.map((c) => c.id)).size === CLIMAS.length);
  t("todo céu tem peso, ícone e nota", CLIMAS.every((c) => c.peso > 0 && c.icone && c.nota));
}

console.log(`\nmesa farta do mundo v9.168: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
