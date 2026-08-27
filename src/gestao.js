/* ============================================================
   GESTÃO DE GUILDA E DOMÍNIOS — Taverna
   Toda a economia e a administração roda por CÓDIGO: rendas,
   cofre, nível da guilda e o que cada cidade dominada produz.
   O Mestre só narra (e registra conquistas/fundações na ficção);
   números de gestão NUNCA passam pela IA — zero tokens, zero
   inconsistência, e o jogador administra de verdade.
   ============================================================ */

import { feDaCidade, bonusRendaDevocao } from "./devocao.js";
import { contaDoDominio, custeioDe } from "./dominios.js";
import { PORTES } from "./geografia.js";

/* ---------------- RENDA DIÁRIA DE UM DOMÍNIO ----------------
   v9.140: DERIVADA DA POPULAÇÃO. Isto era uma tabela com cinco nomes —
   vila, cidade, capital, fortaleza, ruína — e o jogo tem vinte portes em
   quatro formas de mundo. Tomei um "patamar" da Torre (800 almas) e ele
   rendia 12 por dia: exatamente o que rende uma cidade de oito mil, porque
   caía no valor padrão sem dizer nada.

   Tabela que enumera nomes esquece a próxima forma de mundo, e esquece em
   silêncio. A população cada porte já declara desde sempre. */
const GUARNICAO = new Set(["fortaleza", "forte", "base"]);

export function rendaDeCidade(c) {
  const porte = String((c && (c.porte || c.tipo)) || "cidade").toLowerCase();
  if (porte === "ruina") return 2;
  const P = PORTES[porte];
  const almas = P ? Math.max(20, (P.min + P.max) / 2) : 8000;
  /* A CURVA PASSA PELOS PONTOS QUE A TABELA ANTIGA CRAVAVA: vila (≈900
     almas) em 5, cidade (≈8.250) em 12, capital (≈47.500) em 25. Derivar em
     vez de enumerar não pode mudar, de lambuja, o que já estava calibrado —
     a primeira reta que escrevi mandava a vila para 12 e a cidade para 23. */
  let base = Math.max(1, Math.round(0.34 * Math.pow(almas, 0.395)));
  /* A ÚNICA EXCEÇÃO, e ela é explicável: guarnição rende além da sua gente.
     A tabela antiga dava 15 a uma fortaleza de mil almas, mais que a uma
     cidade de oito mil, e tinha razão — quem guarda um passo cobra pedágio,
     e pedágio não depende de quantos moram ali. */
  if (GUARNICAO.has(porte)) base *= 3;
  /* a sede da guilda rende o dobro: é o centro de tudo */
  return c && c.sede ? base * 2 : base;
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
/* v9.139: O GOVERNO ENTRA NA CONTA. Até aqui a renda de um domínio era o
   tipo da cidade e mais nada — o jogador não tinha decisão nenhuma que
   mexesse neste número. Agora o imposto que ele escolheu, as obras que
   mandou erguer e quem ele pôs no comando entram aqui, e o CUSTEIO sai.

   A conta é feita em `dominios.js`, num lugar só: se a etiqueta do painel e
   o que cai no cofre discordarem, é porque alguém a fez duas vezes. */
export function rendaDominios(mapa, devocao, { governos = null, semente = "", reino = null } = {}) {
  const porCidade = dominiosDe(mapa).map((c) => {
    const base = rendaDeCidade(c);
    const fe = devocao ? feDaCidade(devocao, c.nome) : 0;
    const mult = devocao ? bonusRendaDevocao(fe) : 1;
    const gov = governos ? governos[c.nome] : null;
    const fel = (reino && reino[c.nome] && reino[c.nome].felicidade) != null ? reino[c.nome].felicidade : 55;
    const conta = contaDoDominio({ semente, cidade: c, gov, rendaBase: base * mult, felicidade: fel });
    return {
      nome: c.nome, tipo: c.tipo || "cidade", sede: !!c.sede, base, fe, multFe: mult,
      renda: conta.bruta, custeio: conta.custeio, liquido: conta.liquido, conta,
    };
  });
  const total = porCidade.reduce((s, c) => s + c.renda, 0);
  const custeio = porCidade.reduce((s, c) => s + c.custeio, 0);
  return { porCidade, total, custeio, liquido: total - custeio };
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
export function rendaDiariaTotal(mapa, nivel, temGuilda, devocao, ctx = {}) {
  const { total, custeio } = rendaDominios(mapa, devocao, ctx);
  const contratos = temGuilda ? rendaContratos(nivel) : 0;
  const mult = temGuilda ? multGuilda(nivel) : 1;
  const { bonusPct, tributo } = efeitoTratados(mapa);
  /* o custeio sai DEPOIS dos multiplicadores: soldado e pedreiro recebem em
     moeda, e não em percentual do que o império rende */
  return Math.round((contratos + total) * mult * (1 + bonusPct)) + tributo - custeio;
}

/* NAO HA um `custeioTotal` exportado: quem quer a soma pede `rendaDominios`,
   que ja a devolve com a renda ao lado. Uma funcao que so soma de novo o que
   a outra acabou de somar e a segunda casa onde o numero pode divergir. */
