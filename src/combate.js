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

/* ---------------- TESTES DE MORTE (D&D 5e) ----------------
   A 0 PV o combatente cai inconsciente e "morrendo": a cada turno
   rola um d20 puro. 10+ é sucesso, <10 é falha. 3 sucessos estabiliza
   (vivo, inconsciente); 3 falhas morre. 20 natural revive com 1 PV.
   Qualquer cura reergue na hora e zera os contadores. */
export function testeDeMorte() {
  const rolo = d(20);
  if (rolo === 20) return { rolo, tipo: "revive", texto: "20 natural — volta à luta com 1 PV!" };
  if (rolo === 1) return { rolo, tipo: "falha2", texto: "1 natural — duas falhas!" };
  if (rolo >= 10) return { rolo, tipo: "sucesso", texto: `${rolo} — resiste (sucesso)` };
  return { rolo, tipo: "falha", texto: `${rolo} — enfraquece (falha)` };
}

/* aplica o resultado a um estado {sucessos, falhas} e diz o desfecho */
export function aplicarTesteMorte(estado, res) {
  let { sucessos = 0, falhas = 0 } = estado || {};
  if (res.tipo === "revive") return { sucessos: 0, falhas: 0, desfecho: "revive" };
  if (res.tipo === "sucesso") sucessos += 1;
  if (res.tipo === "falha") falhas += 1;
  if (res.tipo === "falha2") falhas += 2;
  if (sucessos >= 3) return { sucessos: 0, falhas: 0, desfecho: "estavel" };
  if (falhas >= 3) return { sucessos, falhas, desfecho: "morto" };
  return { sucessos, falhas, desfecho: "morrendo" };
}

/* ---------------- TURNO DOS COMPANHEIROS ----------------
   Cada companheiro vivo age: se algum aliado está caído (0 PV/morrendo),
   há chance de ir CURAR/estabilizar; senão, ATACA um inimigo. O app
   resolve a matemática; a IA narra a decisão. */
export function turnoDosCompanheiros({ grupo = [], inimigos = [], jogadorCaido = false, jogadorNome = "" }) {
  const vivos = (grupo || []).filter((g) => (g.vida || 0) > 0 && !g.morrendo);
  const inimigosVivos = (inimigos || []).filter((e) => !e.derrotado && e.vida > 0);
  const acoes = [];
  for (const comp of vivos) {
    // há alguém para socorrer? (jogador caído ou companheiro morrendo)
    const aliadoCaido = jogadorCaido || (grupo || []).some((g) => g.morrendo);
    const curador = /clérigo|clerigo|sacerdote|paladino|druida|bardo|curandeir/i.test(`${comp.classe || ""} ${comp.subclasse || ""} ${comp.conceito || ""}`);
    if (aliadoCaido && (curador || Math.random() < 0.5)) {
      const alvoNome = jogadorCaido ? jogadorNome : ((grupo || []).find((g) => g.morrendo)?.nome || jogadorNome);
      acoes.push({ companheiro: comp.nome, tipo: "socorro", alvo: alvoNome });
      continue;
    }
    if (inimigosVivos.length === 0) { acoes.push({ companheiro: comp.nome, tipo: "guarda" }); continue; }
    // ataca um inimigo (o de menor PV, para ajudar a fechar a luta)
    const alvo = [...inimigosVivos].sort((a, b) => (a.vida || 0) - (b.vida || 0))[0];
    const r = resolverAtaque({
      atacante: comp.nome, alvo, ehAtacanteInimigo: false,
      bonusAtaque: 2 + (comp.nivel || 1), danoBase: 4 + (comp.nivel || 1) + d(4),
      condAtacante: comp.condicoes || [], condAlvo: alvo.condicoes || [],
    });
    acoes.push({ companheiro: comp.nome, tipo: "ataque", alvoNome: alvo.nome, r });
  }
  return acoes;
}

/* ---------------- BALANCEAMENTO: PV POR NÍVEL (referência D&D 5e) ----------------
   Mantém o combate proporcional em vez de números inventados. */
export function pvEsperadoJogador(nivel, vigor = 0) {
  // ~ classe média: 8 + (nivel-1)*5 + vigor*nivel/2  (aproximação enxuta)
  return Math.round(10 + (nivel - 1) * 6 + vigor * (1 + nivel * 0.3));
}
export function pvEsperadoInimigo(nivelJogador, ameaca = "comum") {
  const base = pvEsperadoJogador(nivelJogador, 1);
  const mult = { fraco: 0.35, comum: 0.7, competente: 1.0, elite: 1.6, lendario: 2.6 }[ameaca] || 0.7;
  return Math.max(4, Math.round(base * mult));
}

/* ---------------- ESPÓLIOS POR CÓDIGO ----------------
   Moedas e XP calculados por tabela (por ameaça), como nos RPGs de
   verdade — zero tokens e sempre proporcional. A IA só narra, e o
   app decide SE cai um item (a identidade criativa do item fica
   com a IA, que é onde ela vale a pena). */
const XP_AMEACA = { fraco: 15, comum: 30, competente: 50, elite: 90, lendario: 160 };
const MOEDAS_AMEACA = { fraco: [1, 6], comum: [4, 12], competente: [8, 20], elite: [15, 40], lendario: [40, 100] };
const CHANCE_ITEM = { fraco: 0.05, comum: 0.12, competente: 0.25, elite: 0.45, lendario: 0.8 };

export function gerarEspolios(inimigosDerrotados) {
  let xp = 0, moedas = 0, chance = 0;
  for (const e of inimigosDerrotados || []) {
    xp += XP_AMEACA[e.ameaca] || 30;
    const [a, b] = MOEDAS_AMEACA[e.ameaca] || [4, 12];
    moedas += a + Math.floor(Math.random() * (b - a + 1));
    chance = Math.max(chance, CHANCE_ITEM[e.ameaca] || 0.12);
  }
  return { xp, moedas, caiItem: Math.random() < chance };
}
