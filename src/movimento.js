/* ============================================================
   DESLOCAMENTO (v9.34) — de quem são as pernas

   O grid mede o chão; este arquivo diz quanto chão cada um cobre.
   Ficam separados de propósito: grid.js é geometria pura e não
   deveria saber o que é uma raça, e a velocidade de um anão não
   deveria mudar quando eu mexer num cone de gelo.

   OS NÚMEROS SÃO OS DO 5e, convertidos a 1,5 m por quadrado:

     30 ft = 9 m    → humano, elfo, meio-orc, draconato, tiefling,
                      meio-elfo, goliath (o padrão do jogo)
     25 ft = 7,5 m  → anão, halfling, gnomo (as raças pequenas e a
                      anã, que troca passo por firmeza)
     35 ft = 10,5 m → o élfico da floresta e quem tem perna de fábrica

   Registro de uma correção, porque ela muda a mesa: a conversa que
   originou este arquivo dizia "um humano pode andar 7,5 m". Não —
   7,5 m é a velocidade das raças PEQUENAS; humano anda 9 m. E "voar
   15 m" é o número do aarakocra (50 ft); a magia Voo do 5e concede
   18 m (60 ft). Chutar isso para baixo faria o combate inteiro
   parecer mais lento do que a regra que ele diz seguir.

   VOO NÃO É UM EIXO Z. Modelar altura exigiria uma terceira
   coordenada em tudo — posição, área, linha de visão, alcance — e
   entregaria ao jogador uma contabilidade que ele não pediu. O que
   voar dá aqui é o que ele dá de útil numa mesa: ignora terreno
   difícil, ignora o golpe livre de quem está no chão sem alcance
   para o alto, e anda mais. É a parte que decide alguma coisa.
   ============================================================ */

export const DESLOCAMENTO_BASE = 9;      // metros por turno (30 ft)
export const DESLOCAMENTO_PEQUENO = 7.5; // 25 ft
export const DESLOCAMENTO_LIGEIRO = 10.5;// 35 ft

/* andar / voar / nadar / escalar, em metros. Zero quer dizer "não faz".
   Escalar e nadar sem velocidade própria custam o dobro do passo, que é a
   regra do 5e e é o que este arquivo devolve em `metadeDoPasso`. */
const V = (andar, extra = {}) => ({ andar, voar: extra.voar || 0, nadar: extra.nadar || 0, escalar: extra.escalar || 0, nota: extra.nota || "" });

export const VELOCIDADE_RACA = {
  "humano": V(9),
  "elfo": V(9, { nota: "passo leve entre árvores" }),
  "anão": V(7.5, { nota: "passo curto que a armadura pesada não encurta" }),
  "anao": V(7.5, { nota: "passo curto que a armadura pesada não encurta" }),
  "halfling": V(7.5),
  "meio-orc": V(9),
  "draconato": V(9),
  "tiefling": V(9),
  "gnomo": V(7.5),
  "meio-elfo": V(9),
  "goliath": V(9),
  /* origens (ficção científica, cyberpunk, pós-apocalíptico) */
  "terrano": V(9),
  "colono orbital": V(9, { escalar: 9, nota: "criado em gravidade baixa: sobe tão rápido quanto anda" }),
  "sintético": V(9),
  "sintetico": V(9),
  "mutante": V(9, { nadar: 9 }),
  "cromado": V(10.5, { nota: "perna de fábrica" }),
  "vagante": V(9),
};

const N = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

export function velocidadeDaRaca(raca) {
  const k = N(raca);
  if (VELOCIDADE_RACA[k]) return VELOCIDADE_RACA[k];
  for (const [nome, v] of Object.entries(VELOCIDADE_RACA)) if (N(nome) === k) return v;
  return V(DESLOCAMENTO_BASE);
}

/* ---------------- O QUE MUDA A VELOCIDADE ----------------
   Fontes, na ordem em que se aplicam: a raça dá a base; efeitos de
   duração somam ou tiram; a exaustão corta pela metade (5e: nível 2);
   a armadura pesada tira 3 m de quem não tem força para ela — menos do
   anão, cujo traço racial existe exatamente para isto. E a Dádiva dos
   Passos Longos dobra o que sobrou, porque ela diz "move-se o dobro". */
const RX_VOO = /(vo[ao]|voar|asas|levita|alado|planad)/i;
const RX_LENTO = /(lentid[ãa]o|lento|atolad|preso|enraizad|paralis|imobiliz|agrilhoad|ret[ée]m)/i;
const RX_RAPIDO = /(pressa|acelera|c[ée]lere|velocidade|expedito|passo largo|haste)/i;
const RX_PESADA = /(pesada|placas|cota de malha pesada|armadura completa|couraça)/i;

export function deslocamentoDe(pers, { dobrar = false } = {}) {
  const base = velocidadeDaRaca(pers && pers.raca);
  let andar = base.andar;
  let voar = base.voar;
  const fontes = [];

  const efeitos = (pers && pers.efeitos) || [];
  for (const e of efeitos) {
    const txt = `${e.nome || ""} ${e.descricao || ""}`;
    if (RX_VOO.test(txt)) { voar = Math.max(voar, 18); fontes.push(`${e.nome} (voo)`); }      // a magia Voo: 60 ft
    else if (RX_RAPIDO.test(txt)) { andar += 3; fontes.push(e.nome); }
    else if (RX_LENTO.test(txt)) { andar = Math.max(1.5, andar - 3); fontes.push(e.nome); }
  }
  const condicoes = (pers && pers.condicoes) || [];
  for (const c of condicoes) {
    const id = N(c.id || c.nome);
    if (/paralis|inconsciente|petrific|atordoad|agarrad/.test(id)) return { andar: 0, voar: 0, nadar: 0, escalar: 0, fontes: [c.nome || id], parado: true };
    if (/lent|atolad|enraizad/.test(id)) { andar = Math.max(1.5, andar / 2); fontes.push(c.nome || id); }
  }

  /* armadura pesada sem a força que ela pede: −3 m. O anão passa direto. */
  const arm = (pers && pers.equipados && pers.equipados.armadura) || null;
  const ehAnao = /^an[ãa]o$/.test(N(pers && pers.raca));
  if (arm && RX_PESADA.test(arm.nome || "") && !ehAnao && ((pers.atributos || {}).forca || 0) < 3) {
    andar = Math.max(1.5, andar - 3);
    fontes.push(`${arm.nome} (pesada demais)`);
  }

  /* exaustão: a partir do segundo nível, metade (5e) */
  const ex = Math.max(0, Number((pers && pers.exaustao) || 0));
  if (ex >= 2) { andar = Math.max(1.5, andar / 2); fontes.push(`exaustão ${ex}`); }

  if (dobrar) { andar *= 2; voar = voar ? voar * 2 : 0; fontes.push("Passos Longos"); }

  return {
    andar: Math.round(andar * 10) / 10,
    voar: Math.round(voar * 10) / 10,
    nadar: base.nadar, escalar: base.escalar,
    fontes, parado: false,
    nota: base.nota,
  };
}

/* O que vale para andar de fato neste turno: voa se puder voar, porque
   voar é sempre igual ou melhor — e quem voa ignora terreno difícil. */
export function passoEfetivo(pers, opcoes = {}) {
  const d = deslocamentoDe(pers, opcoes);
  const voando = d.voar > 0;
  return {
    metros: voando ? d.voar : d.andar,
    voando,
    ignoraDificil: voando,
    parado: d.parado,
    fontes: d.fontes,
  };
}

/* Criaturas do bestiário: sem ficha de raça, a velocidade sai do tamanho e
   do que o nome anuncia. Um dragão voa; um zumbi arrasta. */
const RX_VOADOR = /(dragao|dragão|wyvern|grifo|harpia|morcego|quimera|arauto|anjo|demonio alado|vespa|aguia|corvo|fenix|imp)/i;
const RX_ARRASTA = /(zumbi|esqueleto lento|slime|gosma|tartaruga|golem de pedra|treant|arvore)/i;
const RX_VELOZ = /(lobo|cavalo|felino|pantera|tigre|leopardo|batedor|assassino|ladino|gato|guepardo)/i;

export function deslocamentoDeCriatura(c) {
  const txt = `${(c && c.nome) || ""} ${(c && c.desc) || ""}`;
  if (RX_VOADOR.test(txt)) return { andar: 9, voar: 18, voando: true, metros: 18 };
  if (RX_ARRASTA.test(txt)) return { andar: 6, voar: 0, voando: false, metros: 6 };
  if (RX_VELOZ.test(txt) || (c && c.agil)) return { andar: 12, voar: 0, voando: false, metros: 12 };
  return { andar: 9, voar: 0, voando: false, metros: 9 };
}

/* ---------------- OS TEXTOS ---------------- */
export function resumoDeslocamento(pers, opcoes = {}) {
  const d = deslocamentoDe(pers, opcoes);
  if (d.parado) return `parado (${d.fontes.join(", ")})`;
  const p = [`${d.andar} m a pé`];
  if (d.voar) p.push(`${d.voar} m voando`);
  if (d.nadar) p.push(`${d.nadar} m nadando`);
  if (d.escalar) p.push(`${d.escalar} m escalando`);
  return p.join(" · ");
}

export function resumoDeslocamentoPrompt(pers, opcoes = {}) {
  const d = deslocamentoDe(pers, opcoes);
  if (d.parado) return `DESLOCAMENTO: estou imobilizado (${d.fontes.join(", ")}) — não me faça atravessar lugar nenhum.`;
  return `DESLOCAMENTO (do sistema): ${resumoDeslocamento(pers, opcoes)} por turno${d.fontes.length ? ` — ${d.fontes.join(", ")}` : ""}. Nunca me faça cobrir mais chão do que isso num turno, e nunca diga números de metro na narração.`;
}

export const MOVIMENTO_PROMPT = `DESLOCAMENTO (v9.34):
- Cada criatura cobre uma distância por turno, definida pelo SISTEMA a partir da raça, do tamanho e do que está ativo na ficha. Raças pequenas andam menos; quem voa cobre o dobro e ignora terreno difícil.
- Você nunca decide quanto alguém anda e nunca faz ninguém atravessar o campo inteiro num turno. O movimento chega pronto no envelope, com o nome do lugar de saída e o de chegada.
- Narre distância em imagens ("três passos", "do outro lado do salão"), nunca em metros e nunca em quadrados.`;
