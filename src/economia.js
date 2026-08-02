/* Taverna v7.1 — ECONOMIA: âncoras de preço para o Mestre não se perder.
   Bloco de texto injetado no prompt do sistema (zero tokens de raciocínio —
   é só referência). Valores em moedas de ouro (◉), calibrados ao que o app
   realmente entrega (mural, decretos, espólios, renda). */
export const ECONOMIA_PROMPT = `ECONOMIA DO MUNDO (âncoras OBRIGATÓRIAS — qualquer preço/salário/recompensa que você citar na ficção DEVE respeitar estas faixas; nunca invente valores fora delas):
ESCALA DE RIQUEZA: ◉ 10 sustenta um pobre por uma semana · ◉ 50 é um mês de vida simples · ◉ 200 compra equipamento de aventureiro respeitável · ◉ 1.000 é uma pequena fortuna (casa modesta, navio velho) · ◉ 10.000 é riqueza de nobre. Um camponês ganha ◉ 2–5 por dia de trabalho; um artesão, ◉ 5–10; um guarda, ◉ 8–15; um cavaleiro a serviço, ◉ 20–40.
PREÇOS COMUNS: refeição simples ◉ 1–2 · refeição boa com bebida ◉ 3–5 · noite em estalagem simples ◉ 3–6 (quarto bom ◉ 8–15, luxo ◉ 25+) · caneca de cerveja ◉ 1 · garrafa de vinho bom ◉ 5–12 · ferradura/reparo simples ◉ 2–5 · poção de cura comum ◉ 25–50.
EQUIPAMENTO: arma simples ◉ 10–25 · arma de qualidade ◉ 40–100 · armadura leve ◉ 15–40 · armadura pesada ◉ 60–150 · escudo ◉ 10–20 · item mágico menor ◉ 150–400 (raros e poderosos NÃO se vendem em loja comum).
TRANSPORTE: cavalo de sela ◉ 75–150 · cavalo de guerra ◉ 300–600 · carroça ◉ 40–80 · passagem de navio por pessoa ◉ 5–20 por trecho (cabine boa ◉ 30–60) · fretar navio pequeno ◉ 150–400 por viagem.
SERVIÇOS E PESSOAS: mercenário por dia ◉ 5–15 · guia por dia ◉ 3–8 · mensageiro ◉ 5–15 · suborno comum ◉ 10–50 · resgate de refém comum ◉ 100–500.
CIDADES: em vilas tudo é mais barato (−30% a −50%); em capitais e portos ricos, mais caro (+30% a +100%). Escassez de guerra/cerco pode dobrar preços de comida.
RECOMPENSAS: as recompensas de contratos e decretos são definidas PELO SISTEMA (mural/decretos) — na ficção, trate esses valores como justos e proporcionais ao perigo; não invente recompensas maiores por conta própria.
COMPRA E VENDA: o preço final é AFERIDO PELO SISTEMA (venda = metade do valor; compra dentro da faixa justa). Você negocia e narra à vontade — descontos e ágios de roleplay são bem-vindos na ficção — mas o número que entra/sai do bolso é o do sistema.`;

/* VALOR DE MERCADO POR CÓDIGO (v7.4.3): o sistema precifica o que troca de
   mãos — o Mestre não inventa mais número de compra/venda. Equipamentos
   valem pela raridade; miudezas de inventário valem uma taxa simbólica. */
const VALOR_RARIDADE = { comum: 15, incomum: 60, raro: 220, epico: 900, lendario: 3500 };
export function valorDeItem(item) {
  if (!item) return 5;
  if (typeof item === "string") return 5;
  if (item.raridade && VALOR_RARIDADE[item.raridade]) return VALOR_RARIDADE[item.raridade];
  return 10;
}
export const PRECO_VENDA = 0.5;        // revender rende METADE do valor
export const FAIXA_COMPRA = [0.5, 2];  // compra justa: entre metade e o dobro da estimativa
