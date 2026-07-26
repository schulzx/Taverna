/* ============================================================
   MOTOR DE COMBATE — Taverna
   O APP resolve a matemática (dados, acerto, dano, condições);
   a IA só narra o resultado. Isso corta tokens e garante um
   combate justo, consistente e idêntico ao das regras.
   Estilo D&D 5e / Baldur's Gate 3: todos rolam d20, com
   vantagem/desvantagem, críticos e condições de estado.
   ============================================================ */

export function d(n) { return 1 + Math.floor(Math.random() * n); }

/* rola d20 com vantagem/desvantagem; devolve {valor, dados} */
export function d20(vantagem = false, desvantagem = false) {
  if (vantagem && !desvantagem) { const a = d(20), b = d(20); return { valor: Math.max(a, b), dados: [a, b], modo: "vantagem" }; }
  if (desvantagem && !vantagem) { const a = d(20), b = d(20); return { valor: Math.min(a, b), dados: [a, b], modo: "desvantagem" }; }
  const a = d(20); return { valor: a, dados: [a], modo: null };
}

/* competência -> bônus de ataque (usado por NPCs, do "fraco" ao "lendário") */
const BONUS_AMEACA = { fraco: 1, comum: 3, competente: 4, elite: 5, lendario: 6 };
export function bonusDeAmeaca(ameaca) { return BONUS_AMEACA[ameaca] || 3; }

/* Defesa de um combatente. Base 10 + destreza + bônus de escudo/armadura.
   Para inimigos, usamos a "defesa" declarada ou derivamos da ameaça. */
export function defesaDe(ent, ehInimigo = false) {
  if (ehInimigo) return ent.defesa || (10 + Math.floor((BONUS_AMEACA[ent.ameaca] || 3) / 2) + (ent.agil ? 3 : 0));
  const dex = (ent.atributos?.destreza || 0);
  const bonusEquip = ent.equipados ? Object.values(ent.equipados).reduce((s, it) => s + ((it?.atributos?.defesa) || 0), 0) : 0;
  return 10 + dex + bonusEquip;
}

/* condições afetam as rolagens (ex.: cego/amedrontado dão desvantagem) */
export function modificadoresDeCondicao(condicoes = []) {
  let vantagem = false, desvantagem = false, danoExtra = 0, danoReduzido = 0, perdeAcao = false;
  for (const c of condicoes) {
    const n = (c.nome || "").toLowerCase();
    if (["amedrontado", "cego", "confuso", "enfraquecido", "lento"].some((x) => n.includes(x))) desvantagem = true;
    if (["abençoado", "abencoado", "inspirado", "furtivo", "apressado", "enfurecido"].some((x) => n.includes(x))) vantagem = true;
    if (["atordoado", "congelado", "paralisado", "preso", "enraizado"].some((x) => n.includes(x))) perdeAcao = true;
    if (["fortalecido", "enfurecido"].some((x) => n.includes(x))) danoExtra += 2;
    if (["enfraquecido"].some((x) => n.includes(x))) danoReduzido += 2;
  }
  return { vantagem, desvantagem, danoExtra, danoReduzido, perdeAcao };
}

/* Resolve UM ataque. Devolve um objeto de resultado detalhado (sem narrar). */
export function resolverAtaque({ atacante, alvo, ehAtacanteInimigo, bonusAtaque, danoBase, vantagem, desvantagem, condAtacante = [], condAlvo = [] }) {
  const modAtk = modificadoresDeCondicao(condAtacante);
  const modAlvo = modificadoresDeCondicao(condAlvo);
  if (modAtk.perdeAcao) return { tipo: "impedido", texto: `${atacante} está impossibilitado de agir` };

  // cego no alvo dá vantagem a quem ataca; vantagem/desvantagem do atacante somam
  let vant = vantagem || modAtk.vantagem;
  let desv = desvantagem || modAtk.desvantagem;
  if (condAlvo.some((c) => (c.nome || "").toLowerCase().includes("cego"))) vant = true;
  // se vantagem e desvantagem coexistem, cancelam (regra 5e)
  if (vant && desv) { vant = false; desv = false; }

  const rolagem = d20(vant, desv);
  const bonus = bonusAtaque || 0;
  const total = rolagem.valor + bonus;
  const ca = defesaDe(alvo, !ehAtacanteInimigo); // se o atacante é inimigo, o alvo é o jogador/aliado
  const critico = rolagem.valor === 20;
  const desastre = rolagem.valor === 1;

  let resultado, dano = 0;
  if (desastre) { resultado = "desastre"; dano = 0; }
  else if (critico) { resultado = "critico"; dano = (danoBase + modAtk.danoExtra) * 2 - modAlvo.danoReduzido; }
  else if (total >= ca) { resultado = "acerta"; dano = danoBase + modAtk.danoExtra - modAlvo.danoReduzido; }
  else { resultado = "erra"; dano = 0; }
  dano = Math.max(0, Math.round(dano));

  return {
    tipo: "ataque", atacante, alvo: alvo.nome || alvo, resultado,
    d20: rolagem.valor, dados: rolagem.dados, modo: rolagem.modo,
    bonus, total, ca, dano, critico, desastre,
  };
}

/* Estima o dano-base de um atacante a partir de seus atributos/arma.
   Jogador: força ou destreza + arma. Inimigo: pela ameaça. */
export function danoDe(ent, ehInimigo = false) {
  if (ehInimigo) {
    const base = { fraco: 3, comum: 5, competente: 7, elite: 10, lendario: 14 }[ent.ameaca] || 5;
    return base + d(4) - 1;
  }
  const forca = ent.atributos?.forca || 0, dex = ent.atributos?.destreza || 0;
  const atr = Math.max(forca, dex);
  const bonusArma = ent.equipados?.arma?.atributos?.dano || 0;
  return 4 + atr + bonusArma + d(4) - 1;
}

/* frase curta e neutra do que aconteceu (o app mostra; a IA embeleza) */
export function resumoDoAtaque(r) {
  if (r.tipo === "impedido") return r.texto;
  const dadosTxt = r.dados.length > 1 ? `${r.dados.join("/")}→${r.d20}` : `${r.d20}`;
  const base = `${r.atacante} → ${r.alvo}: d20 ${dadosTxt}${r.bonus ? `+${r.bonus}` : ""}=${r.total} vs ${r.ca}`;
  if (r.resultado === "critico") return `${base} · CRÍTICO! ${r.dano} de dano`;
  if (r.resultado === "desastre") return `${base} · desastre (errou feio)`;
  if (r.resultado === "acerta") return `${base} · acerta, ${r.dano} de dano`;
  return `${base} · erra`;
}

/* ---------------- TURNO DO MUNDO EM COMBATE ----------------
   Cada inimigo vivo age: escolhe um alvo (jogador ou companheiro)
   e ataca. O app resolve toda a matemática; devolve os resultados
   para o app aplicar o dano e o Mestre narrar as DECISÕES. */
export function turnoDosInimigos({ inimigos, jogador, grupo = [] }) {
  const vivos = (inimigos || []).filter((e) => !e.derrotado && e.vida > 0);
  const alvosPossiveis = [
    { ref: "jogador", nome: jogador.nome, ent: jogador },
    ...grupo.filter((g) => (g.vida || 0) > 0).map((g) => ({ ref: "grupo", nome: g.nome, ent: g })),
  ];
  const acoes = [];
  for (const inim of vivos) {
    // escolha de alvo: 65% no jogador, 35% num companheiro (se houver)
    let alvo;
    if (alvosPossiveis.length > 1 && Math.random() < 0.35) {
      const comps = alvosPossiveis.filter((a) => a.ref === "grupo");
      alvo = comps[Math.floor(Math.random() * comps.length)];
    } else {
      alvo = alvosPossiveis[0];
    }
    const r = resolverAtaque({
      atacante: inim.nome, alvo: alvo.ent, ehAtacanteInimigo: true,
      bonusAtaque: bonusDeAmeaca(inim.ameaca), danoBase: danoDe(inim, true),
      condAtacante: inim.condicoes || [], condAlvo: alvo.ent.condicoes || [],
    });
    acoes.push({ inimigo: inim.nome, alvoRef: alvo.ref, alvoNome: alvo.nome, r });
  }
  return acoes;
}
