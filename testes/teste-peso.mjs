/* O PESO DA CENA (v9.204) — luto e glória como movimento

   O compasso rege o ritmo; este órgão rege a gravidade. A prova cuida das
   seis proteções — sobretudo a que o documento pôs no centro: numa cena
   de peso o mundo CALA (nenhum mercador no velório), e o peso NÃO empilha
   (um por cena). */

const RAIZ = "../src/";
const W = await import(RAIZ + "peso.js");
const { readFileSync } = await import("node:fs");
const semComentarios = (s) => s.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
const APP = semComentarios(readFileSync("../src/App.jsx", "utf8"));
const PAUTA = readFileSync("../src/pauta.js", "utf8");

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

sec("1. os dez pesos e os 28 gatilhos");
{
  t("dez pesos", W.PESOS.length === 10);
  t("os pesos certos", ["luto", "furia", "vergonha", "despedida", "juramento", "gloria", "assombro", "alivio", "reencontro", "queda"].every((id) => W.pesoPorId(id)));
  t("são 28 gatilhos", W.GATILHOS.length === 28, String(W.GATILHOS.length));
  t("ids de gatilho únicos", new Set(W.GATILHOS.map((g) => g.id)).size === 28);
  t("todo gatilho aponta para um peso real", W.GATILHOS.every((g) => W.pesoPorId(g.peso)));
  t("todo gatilho tem quando() e texto", W.GATILHOS.every((g) => typeof g.quando === "function" && g.diz));
  /* os dez pesos são todos exercidos por algum gatilho — nenhum peso órfão */
  const usados = new Set(W.GATILHOS.map((g) => g.peso));
  t("todo peso tem ao menos um gatilho", W.PESOS.every((p) => usados.has(p.id)));
}

sec("2. pesoDaCena reconhece o fato, e NÃO empilha");
{
  t("cena sem fato não tem peso", W.pesoDaCena({}) === null);
  const luto = W.pesoDaCena({ companheiroMortoComLaco: true });
  t("companheiro morto = Luto", luto && luto.peso === "luto");
  const furia = W.pesoDaCena({ traicaoRevelada: true });
  t("traição revelada = Fúria", furia && furia.peso === "furia");
  const gloria = W.pesoDaCena({ primeiraConquista: true });
  t("primeira conquista = Glória", gloria && gloria.peso === "gloria");
  /* NÃO EMPILHA: dois fatos ao mesmo tempo dão UM peso só, o mais grave (o
     que vem primeiro na tabela) */
  const dois = W.pesoDaCena({ traicaoRevelada: true, cancaoNaTaverna: true });
  t("dois fatos dão um peso só (o mais grave vence)", dois && dois.peso === "furia");
  t("o gatilho que acendeu vem junto", furia.gatilho === "traicao_revelada");
  t("gatilhoPorId acha o gatilho e erra o que não existe", W.gatilhoPorId("traicao_revelada") && !W.gatilhoPorId("nada"));
}

sec("3. as proteções: CALA e SEGURA");
{
  const v = W.vetoDoPeso("luto");
  t("o veto cala mercado, oferta e trabalho", /mercado/i.test(v) && /trabalho/i.test(v) && /proposta|venda|compra/i.test(v));
  t("o veto CONVOCA quem tem laço", /comparece|laço/i.test(v));
  t("o veto garante a saída (SOLTA)", /encerra|saída|não prenda/i.test(v));
  t("veto de peso inválido é vazio", W.vetoDoPeso("nao_existe") === "");
  t("seguraOCompasso vale para um peso real", W.seguraOCompasso("luto") === true);
  t("e é falso para nenhum peso", W.seguraOCompasso(null) === false && W.seguraOCompasso("xyz") === false);
  t("as seções que calam incluem mercado e oferta", W.SECOES_QUE_CALAM.includes("mercado") && W.SECOES_QUE_CALAM.includes("oferta"));
  t("resumoDoPeso condensa para o autor", W.resumoDoPeso({ traicaoRevelada: true }).peso === "furia" && W.resumoDoPeso({}).peso === null);
}

sec("4. ligado ao jogo");
{
  t("existe a seção O PESO na pauta", /id: "peso"/.test(PAUTA));
  t("o App importa o Peso", /import \{ pesoDaCena, vetoDoPeso, seguraOCompasso \}/.test(APP));
  t("a traição revelada acende a fúria", /traicaoRevelada: true/.test(APP));
  t("a pauta reconhece o peso e cala pelo veto", /pesoDaCena\(fatosDoPesoRef\.current\)/.test(APP) && /vetoDoPeso\(cena\.peso\)/.test(APP));
  t("o compasso segura numa cena de peso", /seguraOCompasso\(\(pesoDaCena/.test(APP));
  /* o peso é um beat: a pauta consome e limpa os fatos */
  t("os fatos do peso são limpos após consumir", /fatosDoPesoRef\.current = \{\};/.test(APP));
}

console.log(`\n${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
