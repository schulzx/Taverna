/* ============================================================
   GESTÃO DE GUILDA E DOMÍNIOS — Taverna
   Toda a economia e a administração roda por CÓDIGO: rendas,
   cofre, nível da guilda e o que cada cidade dominada produz.
   O Mestre só narra (e registra conquistas/fundações na ficção);
   números de gestão NUNCA passam pela IA — zero tokens, zero
   inconsistência, e o jogador administra de verdade.
   ============================================================ */

/* Renda diária base por tipo de cidade dominada */
export const RENDA_CIDADE = { vila: 5, cidade: 12, capital: 25, fortaleza: 15, ruina: 2 };

/* A sede da guilda rende o dobro (é o centro de tudo) */
export function rendaDeCidade(c) {
  const base = RENDA_CIDADE[(c.tipo || "cidade").toLowerCase()] ?? RENDA_CIDADE.cidade;
  return c.sede ? base * 2 : base;
}

/* Domínios = cidades com relacao "jogador" (o mapa já as conhece —
   o império se deriva sozinho, sem a IA planilhar nada) */
export function dominiosDe(mapa) {
  return (mapa?.cidades || []).filter((c) => c.relacao === "jogador");
}

/* Detalhe da renda diária dos domínios, cidade a cidade */
export function rendaDominios(mapa) {
  const porCidade = dominiosDe(mapa).map((c) => ({ nome: c.nome, tipo: c.tipo || "cidade", sede: !!c.sede, renda: rendaDeCidade(c) }));
  const total = porCidade.reduce((s, c) => s + c.renda, 0);
  return { porCidade, total };
}

/* ---------------- GUILDA ----------------
   nivel 1..5. A guilda rende contratos próprios (mesmo sem domínios)
   e seu nível multiplica a renda dos domínios (administração melhor). */
export const NIVEL_GUILD_MAX = 5;
export const RENDA_CONTRATOS = 3;      // por nível, por dia

export function multGuilda(nivel) { return 1 + 0.25 * ((nivel || 1) - 1); }  // nv5 = 2×
export function rendaContratos(nivel) { return RENDA_CONTRATOS * (nivel || 1); }
export function custoUpgradeGuilda(nivel) { return nivel >= NIVEL_GUILD_MAX ? null : 150 * (nivel || 1); }

/* Renda diária total = contratos da guilda + domínios × multiplicador */
export function rendaDiariaTotal(mapa, nivel, temGuilda) {
  const { total } = rendaDominios(mapa);
  const contratos = temGuilda ? rendaContratos(nivel) : 0;
  return Math.round((contratos + total) * (temGuilda ? multGuilda(nivel) : 1));
}
