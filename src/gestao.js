/* ============================================================
   GESTÃO DE GUILDA E DOMÍNIOS — Taverna
   Toda a economia e a administração roda por CÓDIGO: rendas,
   cofre, nível da guilda e o que cada cidade dominada produz.
   O Mestre só narra (e registra conquistas/fundações na ficção);
   números de gestão NUNCA passam pela IA — zero tokens, zero
   inconsistência, e o jogador administra de verdade.
   ============================================================ */

import { feDaCidade, bonusRendaDevocao } from "./devocao.js";

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

/* Detalhe da renda diária dos domínios, cidade a cidade.
   DEVOÇÃO (v8.9): povo que reza pelo herói dizima, peregrina e gasta na
   cidade — até +25% de renda. O bônus é opcional: sem devoção passada,
   a conta é exatamente a de antes. */
export function rendaDominios(mapa, devocao) {
  const porCidade = dominiosDe(mapa).map((c) => {
    const base = rendaDeCidade(c);
    const fe = devocao ? feDaCidade(devocao, c.nome) : 0;
    const mult = devocao ? bonusRendaDevocao(fe) : 1;
    return { nome: c.nome, tipo: c.tipo || "cidade", sede: !!c.sede, base, fe, multFe: mult, renda: base * mult };
  });
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

/* ---------------- TRATADOS AFETAM A ECONOMIA (por código) ----------------
   comércio: +5% na renda por parceiro comercial (teto +25%)
   aliança:  +5% também (aliados comerciam e protegem rotas)
   vassalagem: o vassalo paga TRIBUTO fixo de 10/dia
   guerra: sem bônus — os efeitos da guerra são ficção do Mestre */
export const BONUS_COMERCIO_PCT = 0.05;
export const BONUS_COMERCIO_TETO = 0.25;
export const TRIBUTO_VASSALO = 10;

export function efeitoTratados(mapa) {
  const fs = mapa?.faccoes || [];
  const parceiros = fs.filter((f) => f.tratado === "comercio" || f.tratado === "alianca").length;
  const vassalos = fs.filter((f) => f.tratado === "vassalagem").length;
  const bonusPct = Math.min(BONUS_COMERCIO_TETO, parceiros * BONUS_COMERCIO_PCT);
  const tributo = vassalos * TRIBUTO_VASSALO;
  return { parceiros, vassalos, bonusPct, tributo };
}

/* Renda diária total = (contratos da guilda + domínios) × multiplicadores + tributos */
export function rendaDiariaTotal(mapa, nivel, temGuilda, devocao) {
  const { total } = rendaDominios(mapa, devocao);
  const contratos = temGuilda ? rendaContratos(nivel) : 0;
  const mult = temGuilda ? multGuilda(nivel) : 1;
  const { bonusPct, tributo } = efeitoTratados(mapa);
  return Math.round((contratos + total) * mult * (1 + bonusPct)) + tributo;
}
