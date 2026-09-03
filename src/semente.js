/* ============================================================
   A SEMENTE (v9.126) — Taverna

   O rosto de cada um sai de uma semente fixada na criação: a mesma pessoa
   dá sempre a mesma cara, sem IA de imagem, sem custo e sem um byte de
   arquivo. Isto aqui é a parte que é CONTA — hash, gerador, sorteio preso à
   semente, e os traços que saem dela.

   Está separado do desenho porque conta se prova e desenho se olha. O
   `rosto.jsx` desenha, a carta desenha outra coisa, e os dois perguntam
   aqui. Enquanto morava dentro de um .jsx, nenhuma prova em Node conseguia
   sequer importar a função.
   ============================================================ */

export function hashSemente(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0);
}
/* gerador pseudoaleatório determinístico a partir da semente */
export function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
}
export function escolher(rand, arr) { return arr[Math.floor(rand() * arr.length)]; }

export const PELE = ["#F2D2B6", "#E8B893", "#D89B6E", "#B87A4E", "#8C5A38", "#6B4226", "#F5DCC4", "#C68A5E"];
export const CABELO = ["#1A1310", "#3B2415", "#6B4226", "#A6641E", "#C9A227", "#8C8C8C", "#D8D8D8", "#5B2A86", "#7A1F1F", "#2E4A3B"];
export const OLHOS = ["#4A3728", "#5B7A3A", "#3A5A7A", "#6B4226", "#3B3B3B", "#7A5A2E"];

/* deriva os traços visuais a partir da semente (determinístico) */
export function tracos(semente) {
  const rand = rng(hashSemente(semente || "herói"));
  return {
    pele: escolher(rand, PELE),
    cabelo: escolher(rand, CABELO),
    olhos: escolher(rand, OLHOS),
    formatoRosto: Math.floor(rand() * 3),   // 0 oval, 1 quadrado, 2 fino
    penteado: Math.floor(rand() * 5),
    barba: rand() < 0.45 ? Math.floor(rand() * 3) + 1 : 0,
    sobrancelha: 0.2 + rand() * 0.3,
    marca: rand() < 0.3 ? Math.floor(rand() * 3) : -1, // cicatriz/pintura
    fundo: escolher(rand, ["#241C33", "#2A2036", "#1E2A33", "#33241C", "#2A2A33"]),
  };
}

/* estado: "normal" | "ferido" (PV ≤ 2/3) | "grave" (PV ≤ 1/3) | "furioso" (inimigo pressionado).
   O ROSTO BASE nunca muda (mesma semente = mesmos traços); só expressão e marcas mudam. */
export function estadoDe(vida, vidaMax, inimigo = false) {
  const r = vidaMax > 0 ? vida / vidaMax : 1;
  if (inimigo) return r <= 0.25 ? "grave" : r <= 0.55 ? "furioso" : "normal";
  return r <= 0.33 ? "grave" : r <= 0.66 ? "ferido" : "normal";
}

/* semente estável do personagem: fixada na criação e nunca mais alterada */
export function sementeDe(ent) {
  return ent?.semente || ent?.nome || "herói";
}

/* ============================================================
   AS FEIÇÕES (v9.158) — os eixos do retrato de xilogravura

   O rosto antigo tinha um eixo só: a semente. O novo tem quatro, e três
   deles vêm do MUNDO, não do sorteio:

     SEXO         quem a pessoa é — "homem"/"mulher" na ficha dela
     CLASSE       o que ela veste — o retrato de um mago tem de dizer mago
     SUBCLASSE    o acento — UMA cor, num lugar só
     SEMENTE      o resto: queixo, cabelo, marca, expressão de base

   ---------------- A APRESENTAÇÃO ----------------

   Na criação do mundo o jogador escolhe: apresentação ESTRITA (retrato
   de mulher é feminino, de homem é masculino, sempre) ou LIVRE (uma
   minoria semeada — cerca de um em sete — apresenta-se diferente do que
   a ficha diz). É escolha de mesa, como tom de violência: o jogo não
   opina, oferece as duas e cumpre a que foi escolhida.

   `fixo: true` é para quem ESCOLHEU a própria cara — o herói do jogador
   e qualquer companheiro montado à mão. Sobre esses, o sorteio da
   apresentação nunca passa: seria o gerador desfazendo uma decisão que
   não é dele.
   ============================================================ */
/* Lido do objeto, e não desestruturado na assinatura: `= {}` cobre
   `undefined` e NÃO cobre `null` — a armadilha da v9.149, de novo, e pela
   mesma razão: o que chega aqui é ficha de jogo, que é exatamente o tipo
   de coisa que vem nula no dia em que um save vem pela metade. */
export function feicoes(semente, opcoes) {
  const o = opcoes && typeof opcoes === "object" ? opcoes : {};
  const genero = o.genero || "", apresentacao = o.apresentacao || "estrita", fixo = o.fixo === true;
  const rand = rng(hashSemente("feicoes|" + (semente || "herói")));
  /* a ordem dos sorteios é contrato: mudar a ordem muda a cara de todo
     mundo que já existe. Novos eixos entram SEMPRE no fim. */
  const sorteioApresentacao = rand();
  const sorteioCruza = rand();
  let fem = genero === "mulher" ? true : genero === "homem" ? false : sorteioApresentacao < 0.5;
  if (!fixo && apresentacao === "livre" && sorteioCruza < 1 / 7) fem = !fem;
  return {
    fem,
    /* geometria do queixo DENTRO da faixa da apresentação: nem todo homem
       tem o mesmo maxilar, nem toda mulher o mesmo — a faixa é que muda */
    queixo: rand(),
    cabelo: Math.floor(rand() * 4),
    barba: !fem && rand() < 0.55 ? 1 + Math.floor(rand() * 3) : 0,
    franja: rand() < 0.5,
  };
}

/* O ACENTO DA SUBCLASSE: uma cor, sempre a mesma para a mesma subclasse,
   sem tabela para manter — subclasse nova nasce com cor no dia em que
   nasce. A paleta é curta e da casa: acento é tempero, não fantasia. */
export const ACENTOS = ["#E8A33D", "#8B7BD8", "#7BC98F", "#D86A5B", "#5BA8D8", "#C9A227", "#B06AC9", "#D88A5B"];
export function acentoDe(subclasse) {
  if (!subclasse) return "#8B7BD8";
  return ACENTOS[hashSemente("acento|" + String(subclasse)) % ACENTOS.length];
}
