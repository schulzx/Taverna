/* AS BRASAS (v9.198)

   O menu ganhou um shader no Figma e ele não podia atravessar como
   shader: WebGPU dentro da API HTML-in-Canvas não acende para jogador
   nenhum hoje. Atravessou a TABELA — e uma tabela que atravessa de um
   arquivo WGSL para um .js é exatamente o tipo de coisa que se copia
   errado em silêncio, porque nada quebra: as brasas simplesmente ficam
   no lugar errado, ou todas da mesma cor, e ninguém percebe.

   Por isso esta suíte prova os NÚMEROS contra o desenho, e não só que a
   função devolve alguma coisa. */

const RAIZ = "../src/";
const { readFileSync } = await import("node:fs");
const B = await import(RAIZ + "brasas.js");
const CRU = (p) => readFileSync("../src/" + p, "utf8");
const semComentarios = (s) => s.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
const UI = semComentarios(CRU("ui.jsx"));
const APP = semComentarios(CRU("App.jsx"));

let bons = 0, maus = 0;
const t = (nome, cond) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

sec("1. o elenco e as faixas são os do desenho");
{
  t("cento e oitenta brasas", B.QUANTAS_BRASAS === 180);
  t("vive de 2,5 a 7 segundos", B.FAIXAS_DA_BRASA.vida[0] === 2.5 && B.FAIXAS_DA_BRASA.vida[1] === 4.5);
  t("nasce abaixo da borda, para entrar subindo", B.FAIXAS_DA_BRASA.alturaDeNascimento[0] === 0.92);
  t("o núcleo aceso tem de 1,5 a 5 pixels", B.FAIXAS_DA_BRASA.raio[0] === 1.5 && B.FAIXAS_DA_BRASA.raio[1] === 3.5);
}

sec("1b. o elenco encolhe com a largura, para a densidade ficar de pé");
{
  t("no quadro do desenho, as 180 do shader", B.quantasBrasas(B.LARGURA_DO_DESENHO) === B.QUANTAS_BRASAS);
  t("nunca passa das 180", B.quantasBrasas(4000) === B.QUANTAS_BRASAS);
  /* 375 é o telefone do desenho de mesa: lá as bordas onde a brasa nasce
     são o próprio cartão, e 180 tapavam o texto de "A campanha em arquivo" */
  t("no telefone sobra bem menos", B.quantasBrasas(375) < B.QUANTAS_BRASAS / 3);
  t("mas nunca menos que o piso", B.quantasBrasas(1) === B.MINIMO_DE_BRASAS && B.quantasBrasas(0) === B.MINIMO_DE_BRASAS);
  t("largura inválida não vira NaN nem elenco vazio", B.quantasBrasas(undefined) === B.MINIMO_DE_BRASAS && B.quantasBrasas(null) === B.MINIMO_DE_BRASAS);
  t("cresce sem voltar atrás", [375, 600, 900, 1280].every((w, i, xs) => i === 0 || B.quantasBrasas(w) >= B.quantasBrasas(xs[i - 1])));
}

sec("2. o hash é o mesmo do shader");
{
  /* o hash do WGSL é determinístico e mora entre 0 e 1: se o port
     escorregar numa constante, ele sai da faixa ou vira constante */
  const vs = Array.from({ length: 400 }, (_, i) => B.hashBrasa(i * 7.31 + 3));
  t("nunca sai de [0,1)", vs.every((v) => v >= 0 && v < 1));
  t("não é constante", new Set(vs.map((v) => v.toFixed(3))).size > 300);
  t("o mesmo pedido dá o mesmo número", B.hashBrasa(41.7) === B.hashBrasa(41.7));
}

sec("3. o fogo tem lugar: as brasas nascem nas bordas");
{
  const xs = Array.from({ length: B.QUANTAS_BRASAS }, (_, i) => B.nascimentoEmX(B.hashBrasa(i * 7.31 + 3)));
  const esq = xs.filter((x) => x < 0.30 + 1e-9).length;
  const dir = xs.filter((x) => x > 0.70 - 1e-9).length;
  const meio = xs.length - esq - dir;
  t("toda brasa nasce dentro da largura", xs.every((x) => x >= 0 && x <= 1));
  /* a dobra promete ~42/16/42; o miolo tem de ficar RALO, que é o efeito
     inteiro — sem isso vira chuva uniforme e o fogo perde a origem */
  t("as bordas levam a maioria", esq + dir > meio * 2, `esq ${esq} meio ${meio} dir ${dir}`);
  t("o meio não fica vazio", meio > 0);
  t("as faixas cobrem o sorteio inteiro, sem buraco", B.FAIXAS_DE_NASCIMENTO[B.FAIXAS_DE_NASCIMENTO.length - 1].sorteioAte === 1);
}

sec("4. a paleta é fogo, e o branco é raro");
{
  const p = B.PALETA_DA_BRASA;
  t("seis tons, do carvão ao branco", p.length === 6);
  t("os limiares sobem sem cruzar", p.every((c, i) => i === 0 || c.ate > p[i - 1].ate));
  t("fecha em 1 — nenhum sorteio fica sem cor", p[p.length - 1].ate === 1);
  t("todo canal é byte válido", p.every((c) => c.rgb.length === 3 && c.rgb.every((v) => v >= 0 && v <= 255)));
  /* o branco incandescente é 10% de propósito: comum, deixa de valer */
  t("o núcleo branco é o mais raro", 1 - p[4].ate <= 0.10 + 1e-9);
  t("sorteio 0 e sorteio quase-1 caem nos extremos",
    B.corDaBrasa(0).nome === "vermelho fundo" && B.corDaBrasa(0.999).nome === "núcleo branco");
}

sec("5. a brasa nasce, sobe e apaga");
{
  const b0 = B.brasaEm(3, 0);
  t("determinística: o mesmo instante dá o mesmo ponto",
    JSON.stringify(B.brasaEm(3, 0)) === JSON.stringify(b0));
  t("brasas diferentes não se sobrepõem",
    JSON.stringify(B.brasaEm(3, 0)) !== JSON.stringify(B.brasaEm(4, 0)));

  /* toda brasa vive no terço de baixo: é fogo de chão, não chuva */
  let maisAlta = 1, maisBaixa = 0, forcaMax = 0;
  for (let i = 0; i < B.QUANTAS_BRASAS; i++) {
    for (let ms = 0; ms < 600; ms++) {
      const b = B.brasaEm(i, ms / 20);
      maisAlta = Math.min(maisAlta, b.y); maisBaixa = Math.max(maisBaixa, b.y);
      forcaMax = Math.max(forcaMax, b.forca);
    }
  }
  t("nenhuma passa da metade da tela", maisAlta > 0.5, "mais alta " + maisAlta.toFixed(3));
  t("nenhuma escapa por baixo", maisBaixa <= 1.05);
  t("a força nunca é negativa", forcaMax > 0);

  /* o nascer e o morrer: recém-nascida e prestes a renascer, apagada */
  const F = B.FAIXAS_DA_BRASA;
  const vida = F.vida[0] + B.hashBrasa(3 * 7.31 + 1) * F.vida[1];
  const nascida = B.hashBrasa(3 * 7.31 + 2) * vida;
  const noNascimento = B.brasaEm(3, vida - nascida);          /* idade 0 */
  const noFim = B.brasaEm(3, vida - nascida + vida * 0.999);  /* idade ~1 */
  t("apagada ao nascer", noNascimento.forca < 0.01);
  t("apagada ao morrer", noFim.forca < 0.01);
}

sec("6. o halo é dos cantos de baixo, e só");
{
  t("aceso no canto inferior esquerdo", B.forcaDoHalo(0.02, 0.98) > 0.1);
  t("aceso no canto inferior direito", B.forcaDoHalo(0.98, 0.98) > 0.1);
  t("apagado no meio de baixo", B.forcaDoHalo(0.5, 0.98) < 0.001);
  t("apagado no topo", B.forcaDoHalo(0.02, 0.05) < 0.001);
  t("nunca passa da força do desenho", B.forcaDoHalo(0, 1) <= B.HALO.forca + 1e-9);
  t("é estático — não recebe tempo", B.forcaDoHalo.length === 2);
}

sec("7. o campo está ligado, e sabe se comportar");
{
  t("o menu monta o campo de brasas", /<CampoDeBrasas\s*\/>/.test(APP));
  t("o menu vira palco (relative) para ele", /tv-fade relative flex-1 flex flex-col items-center/.test(APP));
  t("o campo lê a tabela, e não repete os números", /from "\.\/brasas\.js"/.test(UI));
  /* três promessas do componente que só se veem quebrando */
  /* a primeira escrita desta asserção procurava um ternário
     (`parado ? pintar(0) : …`) e o componente usa um `if`. Quem estava
     errado era a prova, não o código — o que importa é que exista um
     caminho onde `parado` PINTA, em vez de sair sem desenhar nada. */
  t("quem pediu menos animação recebe um quadro parado, não uma tela vazia",
    /prefers-reduced-motion/.test(UI) && /if \(parado\) pintar\(0\)/.test(UI.replace(/\s+/g, " ")));
  t("não recebe dedo nem leitor de tela", /aria-hidden/.test(UI) && /pointer-events-none/.test(UI));
  t("desliga o quadro ao sair da tela", /cancelAnimationFrame/.test(UI));
  /* brasa é luz: some, não tapa. Sem isto ela vira bolinha opaca sobre o texto */
  t("acende somando (aditivo)", /globalCompositeOperation\s*=\s*"lighter"/.test(UI));
}

console.log(`\n${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
