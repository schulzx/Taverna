/* O BANCO (v9.212) — a prateleira pesada, e o tempero enfim consumido

   Primeira prateleira do banco: os assuntos pesados (perda e poder) e a
   ligação que faltava — o `tempero` que o Termômetro produzia e ninguém
   lia. No Passeando, o mundo passa a servir os temas mais pesados, e a
   escolha da onda os prefere. Conteúdo e fiação juntos, como o documento
   pede. */

const RAIZ = "../src/";
const A = await import(RAIZ + "assuntos.js");
const C = await import(RAIZ + "compasso.js");
const T = await import(RAIZ + "termometro.js");
const { readFileSync } = await import("node:fs");
const semComentarios = (s) => s.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
const APP = semComentarios(readFileSync("../src/App.jsx", "utf8"));

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

sec("1. a prateleira pesada existe");
{
  const pesados = A.ASSUNTOS.filter((x) => x.pesado);
  t("há uma prateleira pesada substancial (~20+)", pesados.length >= 20, String(pesados.length));
  t("o pesado é tom, não peso de sorteio: são as famílias perda e poder", pesados.every((x) => x.familia === "perda" || x.familia === "poder"));
  t("toda perda e todo poder estão marcados", A.ASSUNTOS.filter((x) => x.familia === "perda" || x.familia === "poder").every((x) => x.pesado));
  t("nenhuma outra família foi marcada por engano", A.ASSUNTOS.filter((x) => x.pesado).every((x) => ["perda", "poder"].includes(x.familia)));
}

sec("2. o compasso prefere o pesado quando pedido");
{
  /* sem preferência, a onda sorteia de tudo; com preferirTom pesado, a
     escolha pende MUITO para a prateleira pesada (peso ×3). Rodo muitas
     sementes e comparo a fração de pesados. */
  const sit = { emCidade: true, temGenteConhecida: true };
  const roda = (opts) => {
    let pesados = 0, n = 0;
    for (let i = 0; i < 300; i++) {
      const seq = (i + 1) * 2654435761 % 4294967296;
      let k = 0; const sorte = () => { k = (k * 1103515245 + 12345 + seq) % 2147483648; return k / 2147483648; };
      const a = C.escolherAssunto(sit, { sorte, ...opts });
      if (a) { n++; if (a.pesado) pesados++; }
    }
    return n ? pesados / n : 0;
  };
  const semTom = roda({});
  const comTom = roda({ preferirTom: "pesado" });
  t("com preferirTom pesado, a onda pende para o pesado", comTom > semTom + 0.15, `sem ${semTom.toFixed(2)} vs com ${comTom.toFixed(2)}`);
  t("sem o tom, o pesado não domina (a onda respira de tudo)", semTom < 0.6, semTom.toFixed(2));
}

sec("3. o tempero do Termômetro — antes sem consumidor — agora é lido");
{
  /* o Passeando produz o tempero 'prateleira_pesada' */
  t("Passeando carrega o tempero da prateleira pesada", T.leituraPorId("passeando").tempero === "prateleira_pesada");
  /* e o App traduz esse tempero em preferirTom na onda */
  t("o App consome o tempero (prateleira_pesada -> preferirTom pesado)", /leitura\.tempero === "prateleira_pesada" \? "pesado"/.test(APP));
  t("o preferirTom entra no avancarCompasso", /preferirTom: leitura\.tempero/.test(APP));
}

console.log(`\n${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
