/* ============================================================
   CONSUMÍVEIS (v9.2) — poções, elixires e antídotos — Taverna

   Poção era palavra na ficção: o Mestre dizia "você bebe e se
   sente melhor" e nada acontecia na ficha. Agora consumível é
   item de verdade, com efeito ROLADO por dado (como no BG3) e
   aplicado pelo sistema.

   Três tamanhos para cura e mana — cada um com sua faixa — mais
   elixires de atributo temporário e antídotos que limpam
   condição. Tudo aqui alimenta três sistemas de uma vez: os
   drops de combate, o estoque dos mercadores e o que o grupo
   usa sozinho na luta.
   ============================================================ */

import { criarCondicao } from "./condicoes.js";

const d = (n) => 1 + Math.floor(Math.random() * n);
export function rolarDado(qtd, faces, fixo = 0) {
  let t = 0;
  for (let i = 0; i < qtd; i++) t += d(faces);
  return t + fixo;
}
export const textoDado = (qtd, faces, fixo) => `${qtd}d${faces}${fixo ? `+${fixo}` : ""}`;

/* ---------------- O CATÁLOGO ----------------
   `dado` é [quantidade, faces, fixo]. A faixa aparece na bolsa para o
   jogador saber o que está carregando antes de beber. */
export const CONSUMIVEIS = [
  /* cura — as faixas seguem a escala clássica (2d4+2 → 4d4+4 → 8d4+8) */
  { id: "cura_p", nome: "Poção de Cura Pequena", icone: "🧪", tipo: "cura", dado: [2, 4, 2], valor: 30, raridade: "comum", nivel: 1, desc: "Fecha cortes e devolve o fôlego." },
  { id: "cura_m", nome: "Poção de Cura Média", icone: "🧪", tipo: "cura", dado: [4, 4, 4], valor: 90, raridade: "incomum", nivel: 4, desc: "Solda o que estava quebrado por dentro." },
  { id: "cura_g", nome: "Poção de Cura Grande", icone: "🧪", tipo: "cura", dado: [8, 4, 8], valor: 260, raridade: "raro", nivel: 8, desc: "Traz de volta quem já estava de saída." },

  /* mana */
  { id: "mana_p", nome: "Poção de Mana Pequena", icone: "⚗", tipo: "mana", dado: [1, 6, 2], valor: 35, raridade: "comum", nivel: 1, desc: "Um gole frio que reacende a concentração." },
  { id: "mana_m", nome: "Poção de Mana Média", icone: "⚗", tipo: "mana", dado: [2, 6, 4], valor: 100, raridade: "incomum", nivel: 4, desc: "A cabeça clareia e o poder volta a fluir." },
  { id: "mana_g", nome: "Poção de Mana Grande", icone: "⚗", tipo: "mana", dado: [4, 6, 8], valor: 280, raridade: "raro", nivel: 8, desc: "Como abrir uma comporta dentro do peito." },

  /* elixires de atributo — bônus temporário nas rolagens daquele atributo */
  { id: "elixir_forca",     nome: "Elixir de Força",      icone: "🍷", tipo: "atributo", atributo: "forca",     rotulo: "Força",     bonus: 2, turnos: 8, valor: 120, raridade: "incomum", nivel: 3, desc: "Os músculos incham e o mundo fica mais leve." },
  { id: "elixir_intelecto", nome: "Elixir de Intelecto",  icone: "🍷", tipo: "atributo", atributo: "intelecto", rotulo: "Intelecto", bonus: 2, turnos: 8, valor: 120, raridade: "incomum", nivel: 3, desc: "Os padrões do mundo ficam óbvios por um tempo." },
  { id: "elixir_vigor",     nome: "Elixir de Vigor",      icone: "🍷", tipo: "atributo", atributo: "vigor",     rotulo: "Vigor",     bonus: 2, turnos: 8, valor: 120, raridade: "incomum", nivel: 3, desc: "O corpo aguenta o que não deveria aguentar." },
  { id: "elixir_destreza",  nome: "Elixir de Destreza",   icone: "🍷", tipo: "atributo", atributo: "destreza",  rotulo: "Destreza",  bonus: 2, turnos: 8, valor: 120, raridade: "incomum", nivel: 3, desc: "As mãos passam a chegar antes do pensamento." },
  { id: "elixir_presenca",  nome: "Elixir de Presença",   icone: "🍷", tipo: "atributo", atributo: "presenca",  rotulo: "Presença",  bonus: 2, turnos: 8, valor: 120, raridade: "incomum", nivel: 3, desc: "A voz ganha um peso que ninguém sabe explicar." },

  /* frascos de condição — buff direto do catálogo de condições */
  { id: "frasco_furia",  nome: "Frasco de Fúria",   icone: "🔥", tipo: "condicao", condicao: "enfurecido", valor: 140, raridade: "incomum", nivel: 4, desc: "Ferve na garganta. Você deixa de sentir medo — e de pensar." },
  { id: "frasco_pedra",  nome: "Frasco de Pedra",   icone: "🛡", tipo: "condicao", condicao: "protegido",  valor: 140, raridade: "incomum", nivel: 4, desc: "A pele endurece como couro velho." },
  { id: "frasco_vento",  nome: "Frasco de Vento",   icone: "💨", tipo: "condicao", condicao: "apressado",  valor: 150, raridade: "incomum", nivel: 5, desc: "O tempo desacelera ao seu redor." },
  { id: "frasco_sombra", nome: "Frasco de Sombra",  icone: "👤", tipo: "condicao", condicao: "furtivo",    valor: 150, raridade: "incomum", nivel: 5, desc: "Os contornos do seu corpo ficam difíceis de fixar." },

  /* antídotos e curativos — limpam condição */
  { id: "antidoto",  nome: "Antídoto",           icone: "🌿", tipo: "limpa", remove: ["envenenado"], valor: 40, raridade: "comum", nivel: 1, desc: "Amargo como culpa, mas corta o veneno." },
  { id: "ataduras",  nome: "Ataduras de Linho",  icone: "🩹", tipo: "limpa", remove: ["sangrando"],  valor: 25, raridade: "comum", nivel: 1, desc: "Estanca o que não para sozinho." },
  { id: "sais",      nome: "Sais Aromáticos",    icone: "🧂", tipo: "limpa", remove: ["atordoado", "amedrontado"], valor: 45, raridade: "comum", nivel: 2, desc: "Um cheiro violento que traz a cabeça de volta." },
  { id: "revigorante", nome: "Tônico Revigorante", icone: "☕", tipo: "limpa", remove: ["exausto"], valor: 60, raridade: "comum", nivel: 2, desc: "Amargo, quente e forte o bastante para roubar uma noite do corpo." },
];

export const consumivelPorId = (id) => CONSUMIVEIS.find((c) => c.id === id) || null;

/* Reconhece um consumível vindo da bolsa: pode ser o objeto salvo, ou só um
   nome solto (itens antigos e coisas que o Mestre citou na ficção). */
export function comoConsumivel(raw) {
  if (!raw) return null;
  if (typeof raw === "object" && raw.consumivel && consumivelPorId(raw.consumivel)) return consumivelPorId(raw.consumivel);
  const nome = (typeof raw === "string" ? raw : raw.nome || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (!nome) return null;
  const exato = CONSUMIVEIS.find((c) => c.nome.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "") === nome);
  if (exato) return exato;
  /* "poção de cura" sem tamanho vira a pequena; "poção de mana grande" acha a grande */
  const tam = /grande|superior|maior/.test(nome) ? "_g" : /media|média|melhorada/.test(nome) ? "_m" : "_p";
  if (/cura|curativ|vida|saude|saúde/.test(nome) && /poc|poç|frasco|elixir/.test(nome)) return consumivelPorId("cura" + tam);
  if (/mana|arcan|magi/.test(nome) && /poc|poç|frasco|elixir/.test(nome)) return consumivelPorId("mana" + tam);
  if (/antidot|antídot/.test(nome)) return consumivelPorId("antidoto");
  if (/atadura|bandagem|curativo/.test(nome)) return consumivelPorId("ataduras");
  return null;
}
export const ehConsumivel = (raw) => !!comoConsumivel(raw);

/* Item pronto para entrar na bolsa (guarda o id, não o efeito — o efeito
   é sempre lido do catálogo, então nunca fica desatualizado no save). */
export function itemConsumivel(id) {
  const c = consumivelPorId(id);
  if (!c) return null;
  return { nome: c.nome, consumivel: c.id, tipo: "consumivel", raridade: c.raridade, descricao: c.desc, valor: c.valor };
}

/* Faixa mostrada na bolsa: "recupera 4–12 PV" */
export function faixaDe(c) {
  if (!c || !c.dado) return "";
  const [q, f, fx] = c.dado;
  const alvo = c.tipo === "mana" ? "PM" : "PV";
  return `${q + fx}–${q * f + fx} ${alvo} (${textoDado(q, f, fx)})`;
}

export function descricaoCurta(c) {
  if (!c) return "";
  if (c.tipo === "cura" || c.tipo === "mana") return `recupera ${faixaDe(c)}`;
  if (c.tipo === "atributo") return `+${c.bonus} ${c.rotulo} por ${c.turnos} turnos`;
  if (c.tipo === "condicao") return `aplica ${c.condicao}`;
  if (c.tipo === "limpa") return `remove ${c.remove.join(" e ")}`;
  return c.desc || "";
}

/* ---------------- BEBER ----------------
   Resolve o efeito e devolve a ficha nova + o que dizer. Não mexe em
   inventário: quem chama decide se consome (o herói consome; um
   companheiro usando o próprio frasco também). */
export function usarConsumivel(ent, idOuItem) {
  const c = typeof idOuItem === "string" ? (consumivelPorId(idOuItem) || comoConsumivel(idOuItem)) : comoConsumivel(idOuItem);
  if (!c) return null;
  const p = { ...ent };
  let texto = "";

  if (c.tipo === "cura") {
    const [q, f, fx] = c.dado;
    const bruto = rolarDado(q, f, fx);
    const antes = p.vida || 0;
    p.vida = Math.min(p.vidaMax || antes, antes + bruto);
    if (p.vida > 0) { p.morrendo = false; p.morte = { sucessos: 0, falhas: 0 }; }
    texto = `${c.icone} ${c.nome}: ${textoDado(q, f, fx)} = ${bruto} → +${p.vida - antes} PV (${p.vida}/${p.vidaMax})`;
  } else if (c.tipo === "mana") {
    const [q, f, fx] = c.dado;
    const bruto = rolarDado(q, f, fx);
    const antes = p.mana || 0;
    p.mana = Math.min(p.manaMax || antes, antes + bruto);
    texto = `${c.icone} ${c.nome}: ${textoDado(q, f, fx)} = ${bruto} → +${p.mana - antes} PM (${p.mana}/${p.manaMax})`;
  } else if (c.tipo === "atributo") {
    const efeitos = (p.efeitos || []).filter((e) => e.nome !== c.nome);
    efeitos.push({ nome: c.nome, bonus: c.bonus, turnos: c.turnos, aplica: c.rotulo, descricao: c.desc });
    p.efeitos = efeitos;
    texto = `${c.icone} ${c.nome}: +${c.bonus} em ${c.rotulo} por ${c.turnos} turnos`;
  } else if (c.tipo === "condicao") {
    const cond = criarCondicao(c.condicao, { origem: c.nome });
    if (!cond) return null;
    p.condicoes = [...(p.condicoes || []).filter((x) => x.id !== cond.id), cond];
    texto = `${c.icone} ${c.nome}: ${cond.nome}${cond.turnos ? ` (${cond.turnos}t)` : ""} — ${cond.efeito}`;
  } else if (c.tipo === "limpa") {
    const tinha = (p.condicoes || []).filter((x) => c.remove.includes(x.id));
    if (!tinha.length) return { ent: p, texto: `${c.icone} ${c.nome}: nada para curar agora — o frasco fica.`, gastou: false };
    p.condicoes = (p.condicoes || []).filter((x) => !c.remove.includes(x.id));
    texto = `${c.icone} ${c.nome}: ${tinha.map((x) => x.nome).join(" e ")} passou`;
  }
  return { ent: p, texto, gastou: true, consumivel: c };
}

/* ---------------- SORTEIO (drops e estoque de mercador) ----------------
   Nível do herói filtra o que aparece: ninguém acha poção grande no
   nível 2, e no nível 15 a bolsa não vive de poção pequena. */
export function sortearConsumivel(nivel = 1, { tipos = null } = {}) {
  const pool = CONSUMIVEIS.filter((c) => c.nivel <= (nivel || 1) + 2 && (!tipos || tipos.includes(c.tipo)));
  if (!pool.length) return null;
  /* peso: o que é caro demais para o nível aparece menos */
  const pesos = pool.map((c) => (c.nivel > (nivel || 1) ? 1 : c.raridade === "comum" ? 5 : c.raridade === "incomum" ? 3 : 1));
  const total = pesos.reduce((s, x) => s + x, 0);
  let r = Math.random() * total;
  for (let i = 0; i < pool.length; i++) { r -= pesos[i]; if (r <= 0) return pool[i]; }
  return pool[0];
}

/* Quem no grupo deveria beber o quê — usado pela IA dos companheiros. */
export function melhorCuraPara(ent, bolsa = []) {
  const falta = (ent.vidaMax || 0) - (ent.vida || 0);
  if (falta <= 0) return null;
  const curas = (bolsa || []).map((raw) => ({ raw, c: comoConsumivel(raw) })).filter((x) => x.c && x.c.tipo === "cura");
  if (!curas.length) return null;
  /* pega a menor que resolve; se nenhuma resolve, a maior que tiver */
  const media = (c) => (c.dado[0] * (c.dado[1] + 1)) / 2 + c.dado[2];
  const ordenadas = curas.sort((a, b) => media(a.c) - media(b.c));
  return (ordenadas.find((x) => media(x.c) >= falta) || ordenadas[ordenadas.length - 1]);
}

export const CONSUMIVEIS_PROMPT = `POÇÕES E CONSUMÍVEIS (v9.2 — o sistema resolve, você narra):
- Poções são itens de verdade, com efeito rolado em dado pelo sistema (cura pequena/média/grande, mana, elixires de atributo, frascos de condição, antídotos). NUNCA diga quanto alguém recuperou nem invente uma poção fora do catálogo: se o jogador beber, o envelope traz o número já rolado.
- Beber é AÇÃO BÔNUS: o herói pode tomar uma poção e ainda atacar no mesmo turno. Não narre o turno como perdido por causa disso.
- Se a ficção pedir uma poção de recompensa ou de loja, ela sai do catálogo do sistema (o mercador e os espólios já entregam) — não crie "poção de cura suprema do arquimago" por conta própria.`;
