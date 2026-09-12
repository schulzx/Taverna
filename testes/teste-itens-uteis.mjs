/* ITENS ÚTEIS (v9.200) — a lei que mata o item inerte

   O jogador reclamou com nome e sobrenome: o caderno de anotações
   cifradas só tinha "soltar". A lei desta casa passa a ser: todo item é
   usável, insumo, mercadoria declarada ou semente — senão não existe.

   Esta suíte é a catraca dessa lei. Ela lê os itens de antecedente DA
   FONTE e exige que cada um esteja classificado — assim, um antecedente
   novo que nasça com item sem classe quebra aqui, no dia em que for
   escrito, e não quando um jogador topar com o item morto na bolsa. */

const RAIZ = "../src/";
const I = await import(RAIZ + "itens-uteis.js");
const P = await import(RAIZ + "promessas.js");
const { readFileSync } = await import("node:fs");
const semComentarios = (s) => s.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
const ANTES = readFileSync("../src/antecedentes.js", "utf8");
const APP = semComentarios(readFileSync("../src/App.jsx", "utf8"));

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

sec("1. as quatro classes e os 24 verbos");
{
  t("quatro classes", I.CLASSES.length === 4 && I.classeValida("semente") && !I.classeValida("mágico"));
  t("são 24 verbos", I.VERBOS.length === 24, String(I.VERBOS.length));
  t("ids de verbo únicos", new Set(I.VERBOS.map((v) => v.id)).size === 24);
  t("todo verbo tem classe válida", I.VERBOS.every((v) => I.classeValida(v.classe)));
  t("todo verbo tem rótulo e alimenta um sistema", I.VERBOS.every((v) => v.rotulo && v.alimenta && v.faz));
  t("as quatro classes têm pelo menos um verbo",
    I.CLASSES.every((c) => I.verbosDaClasse(c).length > 0));
  t("verboPorId acha e erra", I.verboPorId("decifrar") && !I.verboPorId("teleportar"));
  t("decifrar é a classe semente e fala com o Livro",
    I.verboPorId("decifrar").classe === "semente" && I.verboPorId("decifrar").alimenta === "promessas");
}

sec("2. A CATRACA — nenhum item de antecedente sem classe");
{
  /* lê os itens direto da fonte: item: "..." */
  const itens = [...ANTES.matchAll(/item:\s*"([^"]+)"/g)].map((m) => m[1]);
  t("achou itens de antecedente na fonte", itens.length >= 9, String(itens.length));
  const semClasse = itens.filter((nome) => !I.classeDoItem(nome));
  t(`todos os ${itens.length} itens têm classe${semClasse.length ? " — SEM: " + semClasse.join(" | ") : ""}`, semClasse.length === 0);
  t("cada classe atribuída é válida", itens.every((nome) => I.classeValida(I.classeDoItem(nome))));
  t("cada item tem um verbo conhecido", itens.every((nome) => I.verboPorId(I.verboDoItem(nome))));
}

sec("3. as sementes apontam para formas REAIS do Livro");
{
  const sementes = Object.entries(I.ITENS_DE_ANTECEDENTE).filter(([, f]) => f.classe === "semente");
  t("há itens-semente", sementes.length >= 3, String(sementes.length));
  t("toda forma de semente existe no Livro",
    sementes.every(([, f]) => P.formaPorId(f.forma)),
    sementes.filter(([, f]) => !P.formaPorId(f.forma)).map(([n]) => n).join(" | "));
  t("toda semente tem material e colheita", sementes.every(([, f]) => f.material && f.colheita));
  t("toda semente tem peso válido do Livro", sementes.every(([, f]) => P.pesoValido(f.peso)));
  /* o material NUNCA é a conclusão: a colheita e o material são coisas diferentes */
  t("material e colheita são textos distintos", sementes.every(([, f]) => f.material !== f.colheita));
}

sec("4. sementeDoItem entrega o que o Livro semeia");
{
  const spec = I.sementeDoItem("Caderno de anotações cifradas", { ato: 1, dia: 5 });
  t("o caderno vira spec de semente", spec && spec.dona === "item" && spec.forma === "margem_anotada");
  t("carrega ato e dia", spec.ato === 1 && spec.dia === 5);
  /* e o spec planta de verdade no Livro */
  const r = P.semear(P.garantirLivro(null), spec);
  t("o spec planta no Livro sem erro", r.semente && r.semente.estado === "semeada" && r.semente.dona === "item");
  t("item usável não vira semente", I.sementeDoItem("Gazua de osso (presente de despedida)") === null);
  t("colheitaDoItem devolve a leitura do caderno", /mapa/.test(I.colheitaDoItem("Caderno de anotações cifradas")));
}

sec("5. mercadoria declarada não mente");
{
  t("a marca de mercadoria existe", I.MARCA_DE_MERCADORIA === "pagam caro");
  t("declaraVenda reconhece a frase", I.declaraVenda("Uma estátua da deusa; alguns mercadores pagam caro por ela."));
  t("e recusa quem não declara", !I.declaraVenda("Uma pedra qualquer."));
  t("fraseDeMercadoria já vem declarada", I.declaraVenda(I.fraseDeMercadoria("a estátua")));
}

sec("6. acaoDaBolsa mata o soltar-solitário");
{
  const a = I.acaoDaBolsa("Caderno de anotações cifradas");
  t("o caderno agora tem ação (investigar)", a && a.verbo === "decifrar" && a.rotulo);
  const b = I.acaoDaBolsa("Instrumento de viagem gasto");
  t("o instrumento oferece tocar", b && b.verbo === "tocar");
  /* item desconhecido mas declarado como mercadoria ganha vender */
  const c = I.acaoDaBolsa({ nome: "Estátua da deusa", descricao: "Mercadores pagam caro por ela." });
  t("mercadoria declarada oferece vender", c && c.verbo === "vender");
  /* item desconhecido e não declarado: sem ação (cai no soltar, agora exceção) */
  t("item sem classe e sem declaração não inventa ação", I.acaoDaBolsa("Pedra sem graça") === null);
  /* item que carrega a própria classe é respeitado */
  t("item que traz a própria classe é respeitado", I.classeDoItem({ nome: "X", classe: "insumo" }) === "insumo");
}

sec("7. a Reforma está ligada à bolsa");
{
  t("o App importa itens-uteis", /from "\.\/itens-uteis\.js"/.test(APP));
  t("a bolsa consulta a ação do item", /acaoDaBolsa/.test(APP));
  t("a semente do item fala com o Livro pela bolsa", /sementeDoItem/.test(APP));
}

console.log(`\n${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
