/* ============================================================
   A ARENA (v9.215) — o duelo provável, uma peça para três mesas

   Nasce a serviço do Torneio (M4: as chaves que correm sozinhas) e o
   Duelo (D2) a herda pronta. O trabalho dela: pôr duas fichas de HERÓI
   uma contra a outra, com as regras que já existem, e devolver o mesmo
   vencedor para a mesma semente em qualquer máquina.

   ---------------- LEI-MÃE: NENHUMA REGRA NOVA ----------------

   Os dois lados lutam como COMPANHEIROS: `turnoDosCompanheiros` decide
   (cura, poção, buff, habilidade ou arma, pelo catálogo de classes) e
   `resolverAtaque` rola — as fórmulas exatas que a mesa de campanha usa
   para quem luta sem jogador. O lado que apanha é uma PROJEÇÃO no
   formato de alvo do combate, mas com `defesa` explícita vinda de
   `defesaDe(ficha)` — o caminho de inimigo honra a defesa explícita, e
   assim o herói é defendido pelas regras de herói mesmo do outro lado
   do balcão. Simetria total: nenhum lado luta com conta de monstro.

   ---------------- A SORTE TRAVADA ----------------

   `combate.js` rola com Math.random. Em vez de duplicar as fórmulas
   para injetar dado (a regra copiada que a lei-mãe proíbe), a arena
   TRAVA a sorte: troca Math.random por um gerador semeado durante a
   simulação e restaura no finally. Mesma dupla + mesma semente = mesmo
   duelo, golpe a golpe — o determinismo é o árbitro (lei v).

   ---------------- O QUE ELA NÃO FAZ ----------------

   Não muta a ficha original (trabalha em cópia — o duelo não deixa
   cicatriz, lei vi), não fala com rede nem tela, e o TERRENO da queda é
   COR narrativa por enquanto: a mecânica de terreno da campanha mora na
   grade da luta do App, e portá-la inteira é trabalho de outra etapa —
   cor declarada é melhor que regra pela metade.
   ============================================================ */

import { turnoDosCompanheiros, defesaDe } from "./combate.js";
import { ehCuraDeGrupo, ehOfensiva } from "./companheiros.js";
import { usarConsumivel } from "./pocoes.js";
import { montarPronto, PRONTOS } from "./prontos.js";

/* ---------------- OS TERRENOS DA QUEDA ----------------
   O vocabulário é o mesmo do combate da campanha (apertado, aberto,
   escuro, alto, água) — cor para o duelo seco narrar. */
export const TERRENOS_DA_ARENA = [
  { id: "apertado", nome: "o fosso", diz: "paredes perto demais para arma comprida" },
  { id: "aberto", nome: "a areia aberta", diz: "sem canto para se esconder" },
  { id: "escuro", nome: "a arena às tochas", diz: "metade da luta é sombra" },
  { id: "alto", nome: "o tablado alto", diz: "cair já é meio golpe" },
  { id: "agua", nome: "o raso alagado", diz: "cada passo pesa" },
];

/* ---------------- A SORTE TRAVADA ---------------- */
function sorteDaSemente(semente) {
  let h = 2166136261;
  const s = String(semente || "arena");
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  let k = h >>> 0;
  return () => { k = (Math.imul(k, 1103515245) + 12345) >>> 0; return (k >>> 8) / 16777216; };
}
function comSorteTravada(semente, fn) {
  const original = Math.random;
  Math.random = sorteDaSemente(semente);
  try { return fn(); } finally { Math.random = original; }
}

/* ---------------- A PROJEÇÃO ----------------
   O duelista inteiro (a ficha em cópia funda, que ataca com as próprias
   habilidades) e o alvo-projeção que o outro lado enxerga. A projeção
   compartilha a MESMA vida por referência de leitura: a arena sincroniza
   após cada meia-rodada. */
export function prepararDuelista(ficha) {
  const f = JSON.parse(JSON.stringify(ficha));
  f.vida = f.vidaMax; f.mana = f.manaMax;
  f.condicoes = []; f.efeitos = [];
  return f;
}
function projecaoDe(f) {
  return {
    nome: f.nome, vida: f.vida, vidaMax: f.vidaMax,
    /* defesa de HERÓI, explícita — o caminho de inimigo a honra */
    defesa: defesaDe(f, false),
    condicoes: f.condicoes || [], derrotado: false,
  };
}

/* aplica as ações que turnoDosCompanheiros devolveu: dano no outro lado,
   cura e custo no próprio. Devolve linhas do que houve (o duelo seco). */
function aplicarAcoes(acoes, eu, outro) {
  const linhas = [];
  for (const a of acoes || []) {
    if (a.tipo === "cura") {
      eu.mana = Math.max(0, (eu.mana || 0) - (a.custo || 0));
      eu.vida = Math.min(eu.vidaMax, eu.vida + (a.valor || 0));
      linhas.push(`${eu.nome} se recompõe (+${a.valor || 0})`);
      continue;
    }
    if (a.tipo === "pocao") {
      /* a pocao e aplicada pelo aplicador oficial (pocoes.js) e SAI da
         bolsa — sem isso o frasco seria eterno */
      const r2 = usarConsumivel(eu, a.item);
      if (r2 && r2.ent) {
        eu.vida = r2.ent.vida; if (r2.ent.mana != null) eu.mana = r2.ent.mana;
        if (r2.gastou !== false) {
          const i = (eu.inventario || []).indexOf(a.item);
          if (i >= 0) eu.inventario.splice(i, 1);
        }
        linhas.push(`${eu.nome} bebe às pressas`);
      } else linhas.push(`${eu.nome} tateia a bolsa`);
      continue;
    }
    if (a.tipo === "buff" || a.tipo === "guarda") {
      if (a.custo) eu.mana = Math.max(0, (eu.mana || 0) - a.custo);
      linhas.push(`${eu.nome} se guarda`);
      continue;
    }
    const r = a.r;
    if (!r) continue;
    if (a.custo) eu.mana = Math.max(0, (eu.mana || 0) - a.custo);
    if (r.dano > 0) {
      outro.vida = Math.max(0, outro.vida - r.dano);
      linhas.push(`${eu.nome} ${r.critico ? "acerta em cheio" : "acerta"} ${outro.nome} (−${r.dano})`);
    } else {
      linhas.push(`${eu.nome} ${r.desastre ? "erra feio" : "erra"} ${outro.nome}`);
    }
  }
  return linhas;
}

/* meia-rodada: `eu` age contra `outro`, pelas regras de companheiro.
   O piloto enxerga só as habilidades cujo efeito o duelo aplica POR
   INTEIRO — ataque e cura. Buff e defesa ("absorve o próximo dano")
   dependem do sistema de efeitos do App, que a arena ainda não porta:
   deixá-los na mesa fazia o piloto gastar turnos em promessas que a
   simulação não cumpria, e o mago perdia por culpa da moldura, não da
   classe. Quando os efeitos forem portáteis, o filtro cai. */
function meiaRodada(eu, outro, rodada) {
  const alvo = projecaoDe(outro);
  const visao = { ...eu, habilidades: (eu.habilidades || []).filter((h) => ehCuraDeGrupo(h) || ehOfensiva(h)) };
  /* o duelista entra também como `jogador`: o cérebro de companheiro só
     cura "quem está pior (inclui o herói)" — num duelo de um, o herói a
     proteger é ele mesmo. Sem isso o curandeiro nunca se curaria. */
  const acoes = turnoDosCompanheiros({ grupo: [visao], inimigos: [alvo], jogador: visao, jogadorNome: eu.nome, rodada });
  const linhas = aplicarAcoes(acoes, eu, outro);
  return linhas;
}

/* ---------------- UMA QUEDA ----------------
   Iniciativa por destreza + dado; depois, meia-rodada de cada lado até
   alguém cair. O teto de rodadas nunca deixa a queda virar empate
   eterno: estourou, vence quem tiver a maior fração de vida. */
export const RODADAS_MAX = 30;
export function simularQueda(fichaA, fichaB, { semente = "queda", terreno = null } = {}) {
  return comSorteTravada(semente, () => {
    const A = prepararDuelista(fichaA);
    const B = prepararDuelista(fichaB);
    const linhas = [];
    const t = terreno || TERRENOS_DA_ARENA[0];
    linhas.push(`Em ${t.nome}: ${t.diz}.`);
    const iniA = (A.atributos?.destreza || 0) + Math.floor(Math.random() * 20);
    const iniB = (B.atributos?.destreza || 0) + Math.floor(Math.random() * 20);
    let ordem = iniA >= iniB ? [A, B] : [B, A];
    let rodada = 1;
    while (rodada <= RODADAS_MAX && A.vida > 0 && B.vida > 0) {
      for (const quem of ordem) {
        if (A.vida <= 0 || B.vida <= 0) break;
        const outro = quem === A ? B : A;
        linhas.push(...meiaRodada(quem, outro, rodada));
      }
      rodada++;
    }
    let vencedor;
    if (A.vida <= 0 && B.vida <= 0) vencedor = ordem[0] === A ? "B" : "A"; /* quem caiu por último de pé */
    else if (B.vida <= 0) vencedor = "A";
    else if (A.vida <= 0) vencedor = "B";
    else vencedor = (A.vida / A.vidaMax) >= (B.vida / B.vidaMax) ? "A" : "B";
    return { vencedor, rodadas: rodada - 1, linhas, vidaA: A.vida, vidaB: B.vida };
  });
}

/* ---------------- A SÉRIE: MELHOR DE TRÊS ----------------
   Terreno novo por queda, sorteado da tabela pela semente. */
export function simularSerie(fichaA, fichaB, { semente = "serie", melhorDe = 3 } = {}) {
  const precisa = Math.floor(melhorDe / 2) + 1;
  const sorte = sorteDaSemente(semente + "|terrenos");
  const quedas = [];
  let a = 0, b = 0;
  for (let q = 0; a < precisa && b < precisa && q < melhorDe; q++) {
    const terreno = TERRENOS_DA_ARENA[Math.floor(sorte() * TERRENOS_DA_ARENA.length)];
    const r = simularQueda(fichaA, fichaB, { semente: `${semente}|queda${q}`, terreno });
    quedas.push({ ...r, terreno: terreno.id });
    if (r.vencedor === "A") a++; else b++;
  }
  return { vencedor: a > b ? "A" : "B", placar: `${a}×${b}`, quedas };
}

/* ---------------- OS PRONTOS NA ARENA ----------------
   A porta que o Torneio e o Duelo justo usam: dois ids do roster, uma
   semente, uma série. É também por aqui que a CATRACA DO EQUILÍBRIO
   roda o round-robin — o equilíbrio do roster é teste, não intenção. */
export function duelarProntos(idA, idB, { semente = "duelo", melhorDe = 3 } = {}) {
  const A = montarPronto(idA);
  const B = montarPronto(idB);
  if (!A || !B) return null;
  return { a: idA, b: idB, ...simularSerie(A, B, { semente, melhorDe }) };
}

/* o round-robin completo do roster: todo par, muitas sementes. Devolve a
   taxa de vitória de cada pronto — a suíte trava a faixa (35%–65%). */
export function roundRobin({ sementes = 20, melhorDe = 3 } = {}) {
  const vit = Object.fromEntries(PRONTOS.map((p) => [p.id, 0]));
  const jogos = Object.fromEntries(PRONTOS.map((p) => [p.id, 0]));
  for (let i = 0; i < PRONTOS.length; i++) {
    for (let j = i + 1; j < PRONTOS.length; j++) {
      const a = PRONTOS[i].id, b = PRONTOS[j].id;
      for (let s = 0; s < sementes; s++) {
        const r = duelarProntos(a, b, { semente: `rr|${a}|${b}|${s}`, melhorDe });
        jogos[a]++; jogos[b]++;
        vit[r.vencedor === "A" ? a : b]++;
      }
    }
  }
  return Object.fromEntries(PRONTOS.map((p) => [p.id, jogos[p.id] ? vit[p.id] / jogos[p.id] : 0]));
}
