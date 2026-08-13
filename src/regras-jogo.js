/* ============================================================
   REGRAS DO JOGO (v8.7) — Taverna
   Nível, descanso, aplicação das mudanças do Mestre, efeitos,
   combate e migração de save. Puro: recebe e devolve estado,
   sem React e sem tocar na interface.
   Extraído do App.jsx na modularização.
   ============================================================ */
import { ATRIBUTOS, XP_POR_NIVEL, MAX_COMPANHEIROS } from "./constantes.js";
import { bonusProficiencia, ehProficiente, MOD_MAX_5E, XP_POR_DADIVA } from "./regras.js";
import { completarInimigo } from "./bestiario.js";
import { elencoDiverso, nomeCidade, nomeTaverna } from "./nomes.js";
import { garantirSuprimentos } from "./ermos.js";
import { limparPorDescanso } from "./condicoes.js";
import { garantirFichaCompanheiro } from "./companheiros.js";
import { pontosTotais, custoJaGasto } from "./classes.js";
import { migrarAtributos } from "./atributos.js";
import { valorDeItem, PRECO_VENDA, FAIXA_COMPRA } from "./economia.js";
import { VINCULO_INICIAL } from "./vinculos.js";
import { garantirPericias, periciasIniciais } from "./pericias.js";
import { garantirHeroismo } from "./heroismo.js";
import { garantirDadosVida, aplicarCurto, aplicarLongo } from "./descanso.js";
import { garantirPreparadas, preparadasIniciais, temCaderno } from "./magias.js";
import { garantirSintonia, sintoniaInicial, atributosValem } from "./sintonia.js";

export function aplicarNivel(pers) {
  let { xp, nivel, nivelPendentes, vidaMax, manaMax, vida, mana } = pers;
  let dadivas = [...(pers.dadivas || [])];
  let dadivasPendentes = pers.dadivasPendentes || 0;
  while (true) {
    if (nivel >= 20) {
      /* ÁPICE MORTAL: o nível para em 20, mas o XP continua — a cada
         30.000 vem uma DÁDIVA ÉPICA (como no 5e). */
      if (xp < XP_POR_DADIVA) break;
      xp -= XP_POR_DADIVA;
      dadivasPendentes += 1;
      continue;
    }
    const custo = XP_POR_NIVEL(nivel);
    if (xp < custo) break;
    xp -= custo; nivel += 1; nivelPendentes += 1;
    vidaMax += 6; manaMax += 4; vida = vidaMax; mana = manaMax;
  }
  return { ...pers, xp, nivel, nivelPendentes, vidaMax, manaMax, vida, mana, dadivas, dadivasPendentes };
}

/* Evolução de companheiro por XP acumulado. Cada nível: +3 PV máx, e a cada
   nível o app pode subir levemente a competência. Companheiros evoluem junto. */
export function evoluirCompanheiro(g) {
  let { xp = 0, nivel = 1, vidaMax = 10 } = g;
  let subiu = 0;
  while (xp >= XP_POR_NIVEL(nivel)) { xp -= XP_POR_NIVEL(nivel); nivel += 1; vidaMax += 3; subiu++; }
  /* subir de nível também abre habilidades novas do catálogo da classe dele */
  const base = { ...g, xp, nivel, vidaMax, vida: subiu ? vidaMax : g.vida };
  return { ...(subiu ? garantirFichaCompanheiro(base) : base), _subiu: subiu };
}

/* Descanso aplicado por CÓDIGO — garante reset real do jogador E do grupo. */
/* v9.17: a cura em si mudou de casa — foi para descanso.js, onde virou
   ECONOMIA (dados de vida finitos, um longo por dia, PM preso à noite).
   Aqui ficou só o que sempre foi daqui: as condições, que somem por regra
   de catálogo e não por fração de PV. */
export function aplicarDescanso(pers, tipo, msgs, dia = 0) {
  const longo = tipo === "longo";
  const r = longo ? aplicarLongo(pers, dia) : aplicarCurto(pers);
  let p = r.pers;
  r.msgs.forEach((m) => msgs.push(m));
  /* Condições: quem some com qual descanso é decisão do CATÁLOGO (v9.0) —
     veneno e exaustão exigem noite inteira, sangramento estanca num curto. */
  const lim = limparPorDescanso(p.condicoes || [], longo ? "longo" : "curto");
  if (lim.removidas.length) msgs.push(`✓ Passou com o descanso: ${lim.removidas.map((c) => c.nome).join(", ")}.`);
  const grupo = (p.grupo || []).map((gm) => ({
    ...gm,
    condicoes: limparPorDescanso(gm.condicoes || [], longo ? "longo" : "curto").condicoes,
  }));
  return { ...p, condicoes: lim.condicoes, grupo };
}

/* RECARGA PADRÃO (v7.4.3): habilidade forte precisa de fôlego — o sistema
   deriva a recarga do custo quando o Mestre não define (2t para 6+ PM,
   1t para 3+ PM, livre abaixo disso). */
export function recargaPadrao(custo) { return custo >= 6 ? 2 : custo >= 3 ? 1 : 0; }

export function aplicarMudancas(pers, m, msgs) {
  /* DANO AMBIENTAL PADRONIZADO (v7.4.2): queda, fogo, veneno, armadilha —
     o Mestre envia só a SEVERIDADE e o código calcula pelo PV máximo do
     herói. Acaba o "dragão cospe 8 de dano" no nível 20. */
  let danoAmb = 0;
  if (m.dano_ambiental) {
    const SEV = { leve: 0.08, moderado: 0.18, grave: 0.3 };
    const sev = SEV[String(m.dano_ambiental).toLowerCase()];
    if (sev) danoAmb = Math.max(1, Math.round((pers.vidaMax || 10) * sev));
  }
  let vida = Math.max(0, Math.min(pers.vidaMax, pers.vida + (m.vida || 0) - danoAmb));
  let mana = Math.max(0, Math.min(pers.manaMax, pers.mana + (m.mana || 0)));
  let moedas = Math.max(0, pers.moedas + (m.moedas || 0));
  const nomeItem = (x) => (typeof x === "string" ? x : (x && x.nome) || "");
  let inv = [...pers.inventario, ...(m.adicionar_itens || [])];
  /* COMÉRCIO AFERIDO PELO SISTEMA (v7.4.3): o Mestre negocia na ficção, mas
     o número é do código — venda rende METADE do valor; compra fica presa na
     faixa justa (0,5× a 2× a estimativa pela tabela). */
  let moedasAferidas = false;
  if (m.moedas > 0 && (m.remover_itens || []).length) {
    const vendidos = (m.remover_itens || [])
      .map((r) => pers.inventario.find((i) => nomeItem(i).toLowerCase() === String(r).toLowerCase()))
      .filter(Boolean);
    if (vendidos.length) {
      const justo = Math.max(1, Math.round(vendidos.reduce((s, i) => s + valorDeItem(i), 0) * PRECO_VENDA));
      if (m.moedas !== justo) { moedas = Math.max(0, pers.moedas + justo); msgs.push(`⚖ Venda aferida pelo sistema: ◉ ${justo} (metade do valor de tabela — o preço falado era ◉ ${m.moedas})`); moedasAferidas = true; }
    }
  }
  if (m.moedas < 0) {
    const comprados = [...(m.adicionar_itens || []), ...(m.adicionar_equipamento || [])];
    if (comprados.length) {
      const estima = comprados.reduce((s, i) => s + valorDeItem(i), 0);
      const min = Math.max(1, Math.round(estima * FAIXA_COMPRA[0])), max = Math.max(2, Math.round(estima * FAIXA_COMPRA[1]));
      const cobrado = -m.moedas;
      if (cobrado < min || cobrado > max) {
        const justo = Math.min(max, Math.max(min, cobrado));
        moedas = Math.max(0, pers.moedas - justo);
        msgs.push(`⚖ Preço aferido pelo sistema: ◉ ${justo} (faixa justa ◉ ${min}–${max} pela tabela — o cobrado era ◉ ${cobrado})`);
        moedasAferidas = true;
      }
    }
  }
  inv = inv.filter((i) => !(m.remover_itens || []).some((r) => nomeItem(i).toLowerCase() === String(r).toLowerCase()));
  let habs = [...pers.habilidades];
  (m.adicionar_habilidades || []).forEach((h) => { if (h?.nome && !habs.some((x) => x.nome.toLowerCase() === h.nome.toLowerCase())) habs.push({ nome: h.nome, custo: Math.max(0, h.custo || 1), descricao: h.descricao || "", recarga: h.recarga != null ? Math.max(0, Number(h.recarga) || 0) : recargaPadrao(Math.max(0, h.custo || 1)) }); });
  habs = habs.filter((h) => !(m.remover_habilidades || []).some((r) => h.nome.toLowerCase() === r.toLowerCase()));
  let grupo = [...pers.grupo];
  (m.grupo_adicionar || []).forEach((g) => {
    if (!g?.nome || grupo.some((x) => x.nome.toLowerCase() === g.nome.toLowerCase())) return;
    if (grupo.length >= MAX_COMPANHEIROS) { msgs.push(`O grupo está cheio — ${g.nome} não pôde se juntar.`); return; }
    /* v9.2: o companheiro entra COM CLASSE e habilidades do catálogo — é o
       que permite o sistema jogar por ele (curar, dar buff, usar magia). */
    grupo.push(garantirFichaCompanheiro({ nome: g.nome, conceito: g.conceito || "", nivel: g.nivel ?? 1, vida: g.vida ?? 10, vidaMax: g.vidaMax ?? g.vida ?? 10, descricao: g.descricao || "", habilidades: g.habilidades || [], classe: g.classe || "", semente: `npc|${g.nome}|${g.conceito || ""}`, vinculo: VINCULO_INICIAL, marcos: [], inventario: [] }));
    msgs.push(`⚑ ${g.nome} juntou-se ao grupo!`);
  });
  (m.grupo_remover || []).forEach((nome) => { if (grupo.some((g) => g.nome.toLowerCase() === nome.toLowerCase())) { grupo = grupo.filter((g) => g.nome.toLowerCase() !== nome.toLowerCase()); msgs.push(`⚑ ${nome} deixou o grupo.`); } });
  (m.grupo_vida || []).forEach((gv) => { grupo = grupo.map((g) => g.nome.toLowerCase() === (gv.nome || "").toLowerCase() ? { ...g, vida: Math.max(0, Math.min(g.vidaMax, g.vida + (gv.vida || 0))) } : g); });
  /* XP de companheiros (evoluem junto com o herói) */
  (m.grupo_xp || []).forEach((gx) => {
    grupo = grupo.map((g) => {
      if (g.nome.toLowerCase() !== (gx.nome || "").toLowerCase()) return g;
      const antes = g.nivel ?? 1;
      const ev = evoluirCompanheiro({ ...g, xp: (g.xp || 0) + Math.max(0, gx.xp || 0) });
      if (ev.nivel > antes) msgs.push(`✦ ${g.nome} subiu para o nível ${ev.nivel}!`);
      delete ev._subiu; return ev;
    });
  });
  /* bolsas dos companheiros: o Mestre dá/tira itens deles por "grupo_itens" */
  (m.grupo_itens || []).forEach((gi) => {
    grupo = grupo.map((g) => {
      if (g.nome.toLowerCase() !== (gi.nome || "").toLowerCase()) return g;
      let inv2 = [...(g.inventario || [])];
      let eqp2 = [...(g.equipamento || [])];
      (gi.adicionar || []).forEach((it) => {
        const ehEquip = it && typeof it === "object" && it.tipo && it.raridade;
        if (ehEquip) eqp2.push(it); else inv2.push(it);
        msgs.push(`◆ ${g.nome} obteve: ${nomeItem(it)}`);
      });
      (gi.remover || []).forEach((r) => { const ix = eqp2.findIndex((x) => nomeItem(x).toLowerCase() === String(r).toLowerCase()); if (ix >= 0) { msgs.push(`${g.nome} perdeu: ${nomeItem(eqp2[ix])}`); eqp2.splice(ix, 1); } });
      (gi.remover || []).forEach((r) => { const ix = inv2.findIndex((x) => nomeItem(x).toLowerCase() === String(r).toLowerCase()); if (ix >= 0) { msgs.push(`${g.nome} perdeu: ${nomeItem(inv2[ix])}`); inv2.splice(ix, 1); } });
      return { ...g, inventario: inv2, equipamento: eqp2 };
    });
  });
  (m.grupo_atualizar || []).forEach((ga) => {
    grupo = grupo.map((g) => {
      if (g.nome.toLowerCase() !== (ga.nome || "").toLowerCase()) return g;
      let gh = [...(g.habilidades || [])];
      (ga.adicionar_habilidades || []).forEach((h) => { if (h?.nome && !gh.some((x) => x.nome.toLowerCase() === h.nome.toLowerCase())) gh.push({ nome: h.nome, custo: h.custo ?? null, descricao: h.descricao || "" }); });
      if (ga.nivel && ga.nivel > (g.nivel ?? 1)) msgs.push(`✦ ${g.nome} evoluiu para o nível ${ga.nivel}!`);
      (ga.adicionar_habilidades || []).forEach((h) => h?.nome && msgs.push(`✦ ${g.nome} aprendeu: ${h.nome}`));
      return { ...g, habilidades: gh, nivel: ga.nivel ?? g.nivel, vidaMax: ga.vidaMax ?? g.vidaMax, vida: ga.vidaMax ? Math.min(ga.vidaMax, g.vida) : g.vida, descricao: ga.descricao ?? g.descricao };
    });
  });

  let novo = { ...pers, vida, mana, moedas, inventario: inv, habilidades: habs, grupo };

  /* EFEITOS TEMPORÁRIOS (buffs com duração) — bônus limitado a +2 por equilíbrio */
  let efeitos = [...(pers.efeitos || [])];
  (m.efeitos_adicionar || []).forEach((ef) => {
    if (!ef?.nome) return;
    const bonus = Math.max(1, Math.min(2, ef.bonus ?? 2)); // teto de +2
    const turnos = Math.max(1, Math.min(10, ef.turnos ?? 3)); // teto de 10 turnos
    efeitos = efeitos.filter((e) => e.nome.toLowerCase() !== ef.nome.toLowerCase());
    efeitos.push({ nome: ef.nome, bonus, turnos, aplica: ef.aplica || "", descricao: ef.descricao || "" });
    msgs.push(`✧ ${ef.nome} ativo (+${bonus} em ${ef.aplica || "testes"}, ${turnos} turno${turnos !== 1 ? "s" : ""})`);
  });
  (m.efeitos_remover || []).forEach((nome) => { efeitos = efeitos.filter((e) => e.nome.toLowerCase() !== (nome || "").toLowerCase()); });
  novo.efeitos = efeitos;

  /* EQUIPAMENTOS obtidos (vão para a mochila de equipamentos, não equipados ainda) */
  let equip = [...(pers.equipamento || [])];
  (m.adicionar_equipamento || []).forEach((eq) => {
    if (!eq?.nome || equip.some((x) => x.nome.toLowerCase() === eq.nome.toLowerCase())) return;
    const item = {
      nome: eq.nome, tipo: (eq.tipo || "arma").toLowerCase(), raridade: (eq.raridade || "comum").toLowerCase(),
      atributos: eq.atributos || {}, poder: eq.poder || "", descricao: eq.descricao || "",
    };
    equip.push(item);
    msgs.push(`⚔ Equipamento encontrado: ${item.nome} (${item.raridade})`);
  });
  (m.remover_equipamento || []).forEach((nome) => {
    equip = equip.filter((e) => e.nome.toLowerCase() !== (nome || "").toLowerCase());
    /* se estava equipado, desequipa */
    const eqp = { ...(novo.equipados || {}) };
    Object.keys(eqp).forEach((slot) => { if (eqp[slot]?.nome?.toLowerCase() === (nome || "").toLowerCase()) delete eqp[slot]; });
    novo.equipados = eqp;
  });
  novo.equipamento = equip;
  if (!novo.equipados) novo.equipados = pers.equipados || {};

  if (Math.max(0, m.xp || 0)) {
    novo = aplicarNivel({ ...novo, xp: novo.xp + Math.max(0, m.xp || 0) });
    /* Companheiros evoluem JUNTOS por código: 60% do XP do herói, sempre.
       (Antes dependia do Mestre enviar "grupo_xp" — e ele quase nunca enviava,
       deixando companheiros congelados no nível 1.) */
    const xpComp = Math.floor(Math.max(0, m.xp || 0) * 0.6);
    if (xpComp > 0) {
      novo.grupo = (novo.grupo || []).map((g) => {
        const ev = evoluirCompanheiro({ ...g, xp: (g.xp || 0) + xpComp });
        const subiu = ev._subiu; delete ev._subiu;
        if (subiu) msgs.push(`✦ ${g.nome} subiu para o nível ${ev.nivel}! (no acampamento, "trilhar caminho" destrava novas habilidades)`);
        return ev;
      });
    }
  }

  if (danoAmb) msgs.push(`💥 Dano ambiental (${String(m.dano_ambiental).toLowerCase()}): −${danoAmb} PV (calculado pelo sistema)`);
  if (m.vida) msgs.push(m.vida < 0 ? `Você perdeu ${-m.vida} PV.` : `Você recuperou ${m.vida} PV.`);
  if (m.mana) msgs.push(m.mana < 0 ? `Você gastou ${-m.mana} PM.` : `Você recuperou ${m.mana} PM.`);
  if (m.moedas && !moedasAferidas) msgs.push(m.moedas > 0 ? `◉ +${m.moedas} moedas` : `◉ −${-m.moedas} moedas`);
  if (m.xp) msgs.push(`✧ +${m.xp} XP`);
  if (novo.nivel > pers.nivel) msgs.push(`✦ NÍVEL ${novo.nivel} ALCANÇADO!`);
  (m.adicionar_itens || []).forEach((i) => msgs.push(`Item obtido: ${nomeItem(i)}`));
  (m.remover_itens || []).forEach((i) => msgs.push(`Item perdido: ${nomeItem(i)}`));
  (m.adicionar_habilidades || []).forEach((h) => h?.nome && msgs.push(`✦ Nova habilidade: ${h.nome} (${Math.max(0, h.custo || 1)} PM)`));
  return novo;
}

/* Atributo efetivo = base + bônus de equipamentos equipados + efeitos ativos que se aplicam */
export function bonusEquip(pers, attrId) {
  let b = 0;
  const eqp = pers.equipados || {};
  /* v9.23: só o item SINTONIZADO empresta atributo. O que não pede sintonia
     (aço comum) passa direto; o que pede e não recebeu fica dormente — serve
     de arma e de armadura, mas o poder não responde. É a divisão que impede
     o teto de virar "seu equipamento não funciona". */
  Object.values(eqp).forEach((it) => {
    if (!it?.atributos?.[attrId]) return;
    if (!atributosValem(pers, it)) return;
    b += it.atributos[attrId];
  });
  return b;
}
export function bonusEfeito(pers, attrNome) {
  let b = 0;
  (pers.efeitos || []).forEach((e) => {
    if (!e.aplica || e.aplica.toLowerCase() === (attrNome || "").toLowerCase() || e.aplica.toLowerCase() === "testes" || e.aplica.toLowerCase() === "todos") b += e.bonus;
  });
  return b;
}
export const MOD_MAX_ROLAGEM = MOD_MAX_5E; // atributo +5, proficiência +6, mais itens
export function atributoEfetivo(pers, attrId) {
  const attr = ATRIBUTOS.find((a) => a.id === attrId);
  /* 5e: o bônus não é só o atributo — soma a PROFICIÊNCIA no que a classe
     domina (chega a +6 no nível 17+). Era isso que fazia um mago 20 rolar
     só +5 no que deveria ser a especialidade dele. */
  const prof = ehProficiente(pers.classe, attrId) ? bonusProficiencia(pers.nivel || 1) : 0;
  const total = ((pers.atributos || {})[attrId] || 0) + prof + bonusEquip(pers, attrId) + bonusEfeito(pers, attr?.nome || "");
  return Math.min(MOD_MAX_ROLAGEM, total);
}

/* Reduz a duração dos efeitos em 1 turno; remove os que expiram. Retorna {efeitos, msgs}. */
export function tickEfeitos(pers) {
  const msgs = [];
  const efeitos = [];
  (pers.efeitos || []).forEach((e) => {
    const t = e.turnos - 1;
    if (t <= 0) msgs.push(`✧ ${e.nome} se dissipou.`);
    else efeitos.push({ ...e, turnos: t });
  });
  return { efeitos, msgs };
}

/* Processa mudanças de combate. Recebe o estado atual (ou null) e as mudanças,
   devolve o novo estado de combate e mensagens. Combate é transitório (fora da ficha). */
export function processarCombate(combateAtual, m, msgs) {
  if (!m) return combateAtual;
  let inimigos = combateAtual ? [...combateAtual.inimigos] : [];

  (m.combate_iniciar || []).forEach((ini) => {
    if (!ini?.nome) return;
    if (inimigos.some((x) => x.nome.toLowerCase() === ini.nome.toLowerCase())) return;
    /* BESTIÁRIO: completa PV/defesa/nível pela tabela (o Mestre pode mandar só
       nome+ameaca; números coerentes com o nível do jogador saem do código) */
    const comp = completarInimigo(ini, m.__nivelJogador || 1);
    inimigos.push({ ...comp, gd: Math.max(0, Math.min(4, Number(ini.gd) || 0)), derrotado: false, semente: `inimigo|${comp.nome}|${comp.ameaca || ""}` });
    msgs.push(`⚔ ${comp.nome} entra no combate! (${comp.vida} PV)`);
  });

  (m.combate_inimigo_vida || []).forEach((cv) => {
    inimigos = inimigos.map((e) => {
      if (e.nome.toLowerCase() !== (cv.nome || "").toLowerCase()) return e;
      const vida = Math.max(0, Math.min(e.vidaMax, e.vida + (cv.vida || 0)));
      const derrotado = vida <= 0;
      if (derrotado && !e.derrotado) msgs.push(`☠ ${e.nome} foi derrotado!`);
      return { ...e, vida, derrotado };
    });
  });

  (m.combate_atualizar || []).forEach((ca) => {
    inimigos = inimigos.map((e) => e.nome.toLowerCase() === (ca.nome || "").toLowerCase() ? { ...e, ameaca: ca.ameaca ?? e.ameaca, vidaMax: ca.vidaMax ?? e.vidaMax } : e);
  });

  (m.combate_remover || []).forEach((nome) => { inimigos = inimigos.filter((e) => e.nome.toLowerCase() !== (nome || "").toLowerCase()); });

  if (m.combate_encerrar) {
    /* ESPÓLIOS POR CÓDIGO TAMBÉM NO ENCERRAR MANUAL (v7.4.2): o Mestre fechava
       o combate e o XP dos abatidos dependia da memória dele. Agora o sistema
       paga pelos derrotados em qualquer encerramento (fuga/rendição inclusa). */
    const caidos = inimigos.filter((e) => e.derrotado || e.vida <= 0);
    if (caidos.length) { m.__vitoriaAuto = true; m.__inimigosFinais = caidos; }
    if (inimigos.length) msgs.push("⚔ O combate termina.");
    return null;
  }
  if (inimigos.length === 0) return combateAtual; // nada mudou de combate
  /* ENCERRAMENTO AUTOMÁTICO: se todos estão derrotados, o app fecha o combate
     na hora — sem esperar o Mestre. Marca uma flag para pedir os espólios. */
  const todosMortos = inimigos.length > 0 && inimigos.every((e) => e.derrotado || e.vida <= 0);
  if (todosMortos) {
    msgs.push("⚔ Todos os inimigos foram derrotados! O combate termina.");
    m.__vitoriaAuto = true;
    m.__inimigosFinais = inimigos; // para o app calcular os espólios por código
    return null;
  }
  /* O QUE SOBREVIVE À RECONSTRUÇÃO (v9.20) — e por que isto virou uma lista.
     Esta função devolve um objeto NOVO a cada turno, e até aqui ela carregava
     só a economia. O efeito colateral passou despercebido por versões: a
     ORDEM DE INICIATIVA também morria, e o bloco que a rola só dispara quando
     `!combate.ordem` — então ela era RE-ROLADA a cada resposta do Mestre que
     tocasse no combate. A luta trocava de ordem no meio, e ninguém via porque
     a linha nova parecia só mais uma mensagem de sistema.

     Apareceu agora porque o terreno das zonas sumia junto, e terreno que some
     dá na vista. Tudo que descreve a LUTA (e não os inimigos) precisa
     atravessar: ordem, rodada, o peso do encontro e o campo com a posição do
     herói. */
  const anterior = combateAtual || {};
  return {
    inimigos,
    economia: anterior.economia || { acao: 1, extra: 1 },
    ordem: anterior.ordem,
    rodada: anterior.rodada,
    recursos: anterior.recursos,
    aval: anterior.aval,
    /* v9.34: a grade e as POSIÇÕES entraram no lugar de `campo`/`zonaHeroi`,
       e a lista mordeu exatamente como o parágrafo acima previu: o herói e os
       aliados sumiam do combate a cada resposta do Mestre, o grid ficava com
       inimigos flutuando sozinhos e o fogo amigo parava de saber quem estava
       onde. Se um dia o combate ganhar mais um campo que descreve a LUTA, ele
       entra aqui — é o único jeito de ele sobreviver ao turno. */
    grade: anterior.grade,
    heroi: anterior.heroi,
    aliados: anterior.aliados,
    log: anterior.log,
  };
}

/* ---------------- App ---------------- */

/* Normaliza personagem de saves antigos: preenche campos que versões novas
   esperam mas que não existiam quando o save foi criado. Preserva tudo. */
export function migrarPersonagem(p) {
  if (!p || typeof p !== "object") return p;
  const atributosBase = { forca: 0, destreza: 0, vigor: 0, intelecto: 0, presenca: 0, percepcao: 0 };
  /* v9.6: atributo virou moeda com custo crescente. Congela a base de criação
     da ficha antiga, cobra o que ela já gastou pela tabela nova e devolve o
     troco — ninguém perde o que tinha, e quem gastou bem só não recebe extra. */
  p = migrarAtributos({ ...p, atributos: { ...atributosBase, ...(p.atributos || {}) } });
  return {
    ...p,
    atributos: { ...atributosBase, ...(p.atributos || {}) },
    inventario: Array.isArray(p.inventario) ? p.inventario : [],
    habilidades: Array.isArray(p.habilidades) ? p.habilidades.filter((h) => h && h.nome).map((h) => ({ nome: h.nome, custo: Math.max(0, Number(h.custo) || 0), descricao: h.descricao || "", duracao: h.duracao || 0, recarga: h.recarga != null ? Math.max(0, Number(h.recarga) || 0) : recargaPadrao(Math.max(0, Number(h.custo) || 0)) })) : [],
    habRecarga: p.habRecarga && typeof p.habRecarga === "object" ? p.habRecarga : {},
    grupo: Array.isArray(p.grupo) ? p.grupo.map((g) => ({ ...g, xp: g.xp || 0, nivel: g.nivel || 1, inventario: Array.isArray(g.inventario) ? g.inventario : [], equipamento: Array.isArray(g.equipamento) ? g.equipamento : [], equipados: g.equipados && typeof g.equipados === "object" ? g.equipados : {}, semente: g.semente || `npc|${g.nome || ""}|${g.conceito || ""}`, vinculo: g.vinculo ?? VINCULO_INICIAL, marcos: Array.isArray(g.marcos) ? g.marcos : [] })).map(garantirFichaCompanheiro) : [],
    /* v9.4: a curva de pontos de habilidade mudou (acelera a cada 5 níveis).
       Recalcula UMA vez por ficha e marca a versão, para não inflar de novo a
       cada carregamento. O que já foi gasto continua gasto. */
    pontosHab: (p.pontosVersao || 1) >= 2 ? (p.pontosHab || 0) : Math.max(0, pontosTotais(p.nivel || 1) - custoJaGasto(p)),
    pontosVersao: 2,
    subclasses: p.subclasses && typeof p.subclasses === "object" ? p.subclasses : {},
    especializacoes: p.especializacoes && typeof p.especializacoes === "object" ? p.especializacoes : {},
    antecedente: p.antecedente || "", antecedenteGancho: p.antecedenteGancho || "",
    /* v9.15: perícias. Save antigo não pode acordar leigo em tudo — o sistema
       nasceu depois dele, a culpa não é da ficha. `periciasIniciais` derruba
       o treino que a classe e o passado JÁ justificavam; a partir daí o
       jogador redistribui no painel, como faz com atributos e talentos. */
    pericias: p.periciasVersao >= 1 ? garantirPericias(p) : periciasIniciais(p),
    periciasVersao: 1,
    /* v9.16: a ficha antiga entra no sistema com um ponto na mão. Zero seria
       tecnicamente correto e praticamente ruim — o jogador conheceria o
       recurso só depois de uma falha crítica, que é a pior hora para
       aprender uma mecânica nova. */
    heroismo: p.heroismoVersao >= 1 ? garantirHeroismo(p) : 1,
    heroismoVersao: 1,
    /* v9.17: dados de vida. A ficha antiga acorda com todos na mão — cobrar
       retroativamente um recurso que nunca existiu seria punir o jogador
       por uma regra que ele não teve chance de administrar. `ultimoLongo`
       fica nulo pelo mesmo motivo: a primeira noite depois da atualização
       não pode chegar já bloqueada. */
    /* v9.21: o caderno de magias. Save antigo acorda com o caderno CHEIO —
       preparadasIniciais pega as maiores que couberem. Acordar sem magia
       nenhuma seria transformar uma regra nova em punição retroativa, e o
       jogador descobriria a mecânica no pior lugar possível: no meio de uma
       luta, tentando lançar o que sempre lançou. */
    preparadas: p.magiasVersao >= 1 ? garantirPreparadas(p) : preparadasIniciais(p),
    magiasVersao: 1,
    /* v9.23: sintoniza sozinho os melhores que ja estao equipados. Ninguem
       pode acordar com o equipamento apagado por uma regra que nao existia
       quando ele conquistou aquilo. */
    sintonizados: p.sintoniaVersao >= 1 ? garantirSintonia(p) : sintoniaInicial(p),
    sintoniaVersao: 1,
    dadosVida: p.dadosVidaVersao >= 1 ? garantirDadosVida(p) : { total: p.nivel || 1, gastos: 0 },
    ultimoLongo: p.dadosVidaVersao >= 1 ? (p.ultimoLongo ?? null) : null,
    dadosVidaVersao: 1,
    essencia: p.essencia || 0,
    suprimentos: p.suprimentos ? garantirSuprimentos(p.suprimentos) : { racoes: 10, agua: 10, tochas: 5, kit: true },
    exaustao: p.exaustao || 0,
    ritmoViagem: p.ritmoViagem || "normal",
    dadivas: Array.isArray(p.dadivas) ? p.dadivas : [],
    dadivasPendentes: p.dadivasPendentes || 0,
    /* v9.32: as dádivas exclusivas desta lenda (nome, descrição e efeito
       guardados por inteiro, porque não existe tabela onde procurá-las) e o
       registro do que já foi gasto nas que têm carga. Save antigo acorda com
       as duas coisas vazias, que é exatamente o estado de quem nunca usou. */
    dadivasUnicas: Array.isArray(p.dadivasUnicas) ? p.dadivasUnicas : [],
    dadivaGastos: (p.dadivaGastos && typeof p.dadivaGastos === "object") ? p.dadivaGastos : {},
    bonusDefesa: Number(p.bonusDefesa) || 0,
    cicatrizes: Array.isArray(p.cicatrizes) ? p.cicatrizes : [],
    efeitos: Array.isArray(p.efeitos) ? p.efeitos : [],
    condicoes: Array.isArray(p.condicoes) ? p.condicoes : [],
    equipamento: Array.isArray(p.equipamento) ? p.equipamento : [],
    equipados: p.equipados && typeof p.equipados === "object" ? p.equipados : {},
    raca: p.raca || "", classe: p.classe || "", subclasse: p.subclasse || "", profissao: p.profissao || "",
    semente: p.semente || `${p.nome || "herói"}|${p.conceito || ""}|0`,
    nivel: p.nivel || 1, xp: p.xp || 0, moedas: p.moedas ?? 0,
    nivelPendentes: p.nivelPendentes || 0,
    vida: p.vida ?? p.vidaMax ?? 10, vidaMax: p.vidaMax ?? 10,
    mana: p.mana ?? p.manaMax ?? 8, manaMax: p.manaMax ?? 8,
  };
}
