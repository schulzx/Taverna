/* ============================================================
   AS BRASAS (v9.198) — Taverna

   O menu ganhou no Figma um shader chamado "Taverna Embers": brasas
   subindo pelas bordas de baixo e um halo quente nos cantos. O shader é
   WGSL e roda por WebGPU DENTRO da API HTML-in-Canvas, que ainda é
   experimental e vem desligada em todo navegador. Portado tal e qual,
   ele seria um runtime inteiro que não acende para jogador nenhum.

   O que atravessou foi a TABELA — que é onde o desenho realmente mora.
   Quantas brasas, em que faixa nascem, quanto vivem, com que cor e com
   que brilho: os números abaixo são os do WGSL, um a um, e a conta que
   os usa é a mesma. Quem desenha é um canvas 2D, no `ui.jsx`.

   Está separado do desenho pela razão de sempre nesta casa: conta se
   prova e desenho se olha. Enquanto a brasa morasse dentro de um .jsx,
   nenhuma prova em Node conseguiria sequer importar a função — é a
   mesma divisão de `semente.js` e `rosto.jsx`.
   ============================================================ */

/* Quantas. No shader é o teto do laço; aqui é o tamanho do elenco.
   Cento e oitenta é pouco para o canvas e é o que o desenho pediu. */
export const QUANTAS_BRASAS = 180;

/* ---------------- E QUANTAS DE VERDADE ----------------
   As 180 foram contadas num quadro de 1280 de largura. Isso é
   DENSIDADE, não número: no monitor, as bordas onde a brasa nasce são
   margem vazia ao lado da pilha de 520; num telefone de 375 as bordas
   são exatamente onde o cartão está, e as mesmas 180 viram uma cortina
   de faísca por cima do texto. Lido no aparelho, "A campanha em
   arquivo" deixava de se ler.

   Então o elenco encolhe com a largura e a densidade fica de pé. O
   piso existe porque meia dúzia de brasas não é fogo baixo — é
   sujeira na tela. */
export const LARGURA_DO_DESENHO = 1280;
export const MINIMO_DE_BRASAS = 40;

export function quantasBrasas(largura) {
  const proporcional = Math.round(QUANTAS_BRASAS * (Number(largura) || 0) / LARGURA_DO_DESENHO);
  return Math.max(MINIMO_DE_BRASAS, Math.min(QUANTAS_BRASAS, proporcional));
}

/* ---------------- ONDE NASCEM ----------------
   A brasa não nasce em qualquer lugar da largura: nasce ENCOSTADA nas
   bordas, que é onde o fogo da taverna estaria. O sorteio cru de 0 a 1
   é dobrado por esta tabela — 42% da cartela cai no terço da esquerda,
   42% no da direita e só 16% sobra para o meio, que por isso fica
   ralo. Sem essa dobra as brasas viram chuva uniforme e o efeito perde
   a origem: fogo tem lugar. */
export const FAIXAS_DE_NASCIMENTO = [
  { sorteioAte: 0.42, de: 0.00, a: 0.30 },   /* borda esquerda */
  { sorteioAte: 0.58, de: 0.30, a: 0.70 },   /* o meio, onde caem poucas */
  { sorteioAte: 1.00, de: 0.70, a: 1.00 },   /* borda direita */
];

/* ---------------- DE QUE COR ----------------
   A paleta do fogo, do carvão ao branco incandescente. As faixas não
   são iguais de propósito: o branco quentíssimo é 10% e o vermelho
   fundo 15% — brasa é majoritariamente laranja, e o branco só aparece
   de vez em quando, que é o que faz ele valer alguma coisa. */
export const PALETA_DA_BRASA = [
  { ate: 0.15, rgb: [204, 33, 0], nome: "vermelho fundo" },
  { ate: 0.35, rgb: [255, 69, 0], nome: "vermelho-laranja" },
  { ate: 0.55, rgb: [255, 107, 43], nome: "âmbar" },
  { ate: 0.75, rgb: [255, 171, 51], nome: "laranja claro" },
  { ate: 0.90, rgb: [255, 214, 0], nome: "amarelo" },
  { ate: 1.00, rgb: [255, 242, 204], nome: "núcleo branco" },
];

/* ---------------- QUANTO VIVEM, E COMO SOBEM ----------------
   Tudo o que no shader era `a + hash * b` está aqui como par [a, b]: o
   piso e a folga do sorteio. Deixar solto no meio da conta é como um
   número vira dois números diferentes em dois lugares. */
export const FAIXAS_DA_BRASA = {
  vida: [2.5, 4.5],          /* segundos até renascer */
  alturaDeNascimento: [0.92, 0.12],  /* abaixo da borda, para entrar subindo */
  velocidade: [0.06, 0.14],
  freqDaDeriva: [1.2, 2.5],  /* o bamboleio lateral */
  ampDaDeriva: [0.015, 0.04],
  raio: [1.5, 3.5],          /* em pixels, o núcleo aceso */
  freqDoTremor: [8, 12],
};

/* O halo quente dos cantos de baixo: não é brasa, é o ar em volta do
   fogo. Estático — não depende do tempo — e por isso o desenho pode
   guardá-lo pronto em vez de refazer a cada quadro. */
export const HALO = {
  rgb: [255, 89, 13],
  forca: 0.18,
  alturaDe: 0.3, alturaAte: 1.0,   /* só na metade de baixo */
  bordaDe: 0.25, bordaAte: 0.0,    /* e só perto das laterais */
};

const TAU = Math.PI * 2;
const fracao = (x) => x - Math.floor(x);

/* O MESMO HASH DO SHADER, e ele precisa ser o mesmo: é o que garante
   que a brasa número 7 nasça no lugar em que o desenho a mostrou. */
export function hashBrasa(p) {
  let a = fracao(p * 0.1031);
  a += a * (2 * a + 76.66);
  return fracao(2 * a * a);
}

/* smoothstep. Aceita a borda invertida (de > para), que é como o shader
   escreve o apagar: suave(1, 0.5, idade) vale 1 até a metade da vida e
   cai a zero no fim. */
export function suave(de, para, x) {
  const t = Math.min(1, Math.max(0, (x - de) / (para - de || 1e-9)));
  return t * t * (3 - 2 * t);
}

export function nascimentoEmX(sorteio) {
  let piso = 0;
  for (const f of FAIXAS_DE_NASCIMENTO) {
    if (sorteio < f.sorteioAte || f.sorteioAte >= 1) {
      const dentro = (sorteio - piso) / (f.sorteioAte - piso || 1e-9);
      return f.de + Math.min(1, Math.max(0, dentro)) * (f.a - f.de);
    }
    piso = f.sorteioAte;
  }
  return 0.5;
}

export function corDaBrasa(sorteio) {
  for (const c of PALETA_DA_BRASA) if (sorteio < c.ate) return c;
  return PALETA_DA_BRASA[PALETA_DA_BRASA.length - 1];
}

/* ---------------- UMA BRASA, NUM INSTANTE ----------------
   Devolve posição em fração da caixa (0..1), raio em pixels, cor e
   FORÇA — que já traz dentro dela o nascer, o morrer, o tremor da chama
   e o facto de que brasa perto do chão brilha mais do que brasa que já
   subiu. Determinística: o mesmo `i` no mesmo `tempo` dá sempre o
   mesmo ponto, e é por isso que ela se prova. */
export function brasaEm(i, tempo) {
  const s = i * 7.31;
  const F = FAIXAS_DA_BRASA;
  const vida = F.vida[0] + hashBrasa(s + 1) * F.vida[1];
  const nascida = hashBrasa(s + 2) * vida;
  const idade = ((tempo + nascida) % vida) / vida;

  const x0 = nascimentoEmX(hashBrasa(s + 3));
  const y0 = F.alturaDeNascimento[0] + hashBrasa(s + 4) * F.alturaDeNascimento[1];
  const velocidade = F.velocidade[0] + hashBrasa(s + 5) * F.velocidade[1];
  const freq = F.freqDaDeriva[0] + hashBrasa(s + 6) * F.freqDaDeriva[1];
  const amp = F.ampDaDeriva[0] + hashBrasa(s + 7) * F.ampDaDeriva[1];

  const y = y0 - idade * velocidade * vida * 0.14;
  const x = x0 + Math.sin(idade * freq * TAU + s) * amp;

  const nasce = suave(0, 0.04, idade);
  const morre = suave(1, 0.5, idade);
  const rente = 0.5 + 0.5 * suave(0.3, 0.95, y);   /* brasa baixa brilha mais */
  const tremor = 0.7 + 0.3 * Math.sin(tempo * (F.freqDoTremor[0] + hashBrasa(s + 9) * F.freqDoTremor[1]) + s);

  return {
    x, y,
    raio: F.raio[0] + hashBrasa(s + 8) * F.raio[1],
    cor: corDaBrasa(hashBrasa(s + 10)),
    forca: Math.max(0, nasce * morre * rente * tremor),
  };
}

/* A força do halo num ponto qualquer da caixa. Separável — altura vezes
   borda — e é isso que deixa o desenho pintá-lo em tiras baratas. */
export function forcaDoHalo(x, y) {
  const daBorda = Math.min(x, 1 - x);
  return suave(HALO.alturaDe, HALO.alturaAte, y) * suave(HALO.bordaDe, HALO.bordaAte, daBorda) * HALO.forca;
}
