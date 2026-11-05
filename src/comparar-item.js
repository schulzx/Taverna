/* ============================================================
   COMPARAR UM ITEM (AAA · 05/11/2026) — formas.md §AAA §3 e o pedido
   ao sistema (b): «a comparação de um item contra o equipado — uma função
   pura que devolve as linhas que mudam, com antes e depois».

   É a lei da casa — o veredito antes do clique — aplicada ao inventário:
   a gaveta do encaixe mostra cada número que muda e o botão diz o preço
   («Equipar · CA 15, Percepção −1»). Nada aqui decide regra nova: a CA é a
   de `defesaDe` (combate.js), o atributo efetivo é base + `bonusEquip`
   (regras-jogo.js, que já respeita a sintonia), o dano é o de `danoDaArma`
   (itens.js) e o encaixe de cada item é o mesmo `item.tipo` que o
   `equipar` do App lê. Esta casa só põe as contas lado a lado.

   E as duas leituras de cara do item, que a peça precisa e o motor ainda
   não dá: a raridade normalizada (chave de COR_DA_RARIDADE) e o ícone
   (chave de ICONES_DE_ITEM). O ícone respeita `item.icone` quando existir
   (o pedido (a)); sem ele, deduz-se da família do item, como `fichaDoItem`
   já deduz a categoria — save antigo não pode ficar sem cara.
   ============================================================ */
import { TROCA_DE_SLOT, fichaDoItem, danoDaArma, podeTrocarAgora, CAT_ARMA } from "./itens.js";
import { defesaDe } from "./combate.js";
import { bonusEquip } from "./regras-jogo.js";
import { ATRIBUTOS } from "./constantes.js";
import { pedeSintonia, estaSintonizado } from "./sintonia.js";

const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/* os encaixes do corpo, na ordem de TROCA_DE_SLOT (a tabela que já existe) */
export const ENCAIXES_DO_CORPO = Object.freeze(Object.keys(TROCA_DE_SLOT));

/* AS RARIDADES que a tela conhece (as chaves de COR_DA_RARIDADE). O save
   pode trazer acento ou caixa ("Épico"); o que não se reconhece é comum. */
export const RARIDADES = Object.freeze(["comum", "incomum", "raro", "epico", "lendario", "unico"]);
export function raridadeDoItem(item) {
  const r = item && typeof item === "object" ? norm(item.raridade) : "";
  return RARIDADES.includes(r) ? r : "comum";
}

/* O ÍCONE DO ITEM: `item.icone` manda; sem ele, a família (fichaDoItem) e,
   para o que não é de vestir, as pistas do nome. Ordem importa: a primeira
   pista que bate é a que vale. Nunca devolve vazio. */
const PISTAS_DO_ICONE = [
  { rx: /machad/, icone: "machado" },
  { rx: /adaga|punhal|faca/, icone: "adaga" },
  { rx: /maca\b|maça|martelo|clava|mangual/, icone: "maca" },
  { rx: /arco|besta/, icone: "arco" },
  { rx: /cajado|bordao|varinha|orbe|bastao/, icone: "cajado" },
  { rx: /pocao|elixir|frasco|tonico/, icone: "pocao" },
  { rx: /pergaminho|mapa|carta\b|nota/, icone: "pergaminho" },
  { rx: /chave/, icone: "chave" },
  { rx: /aljava|flecha|virote|seta/, icone: "aljava" },
  { rx: /tomo|livro|grimorio|diario/, icone: "tomo" },
];
export function iconeDoItem(item, icones = null) {
  if (!item) return "pergaminho";
  if (typeof item === "object" && item.icone && (!icones || icones[item.icone])) return item.icone;
  const nome = norm(typeof item === "string" ? item : item.base || item.nome);
  const tipo = typeof item === "object" ? item.tipo || "" : "";
  let f = null;
  try { f = tipo && TROCA_DE_SLOT[tipo] ? fichaDoItem(item) : null; } catch (e) { f = null; }
  if (f) {
    if (f.familia === "escudo") return "escudo";
    if (["elmo", "botas", "anel", "amuleto"].includes(f.familia)) return f.familia;
    if (f.familia === "armadura") return f.cat === "leve" || f.cat === "panos" ? "armaduraLeve" : "armaduraPesada";
    if (f.familia === "arma") {
      if (f.cat === "arcana") return "cajado";
      if ((CAT_ARMA[f.cat] || {}).distancia) return "arco";
      const p = PISTAS_DO_ICONE.find((x) => x.rx.test(nome));
      return p && ["machado", "adaga", "maca", "cajado"].includes(p.icone) ? p.icone : "espada";
    }
  }
  const p = PISTAS_DO_ICONE.find((x) => x.rx.test(nome));
  return p ? p.icone : "pergaminho";
}

/* QUEM CABE EM CADA ENCAIXE: o `tipo` gravado no item (o que o `equipar`
   do App lê). O item sem tipo cabe na mão se for arma — é o mesmo recuo
   do App (`item.tipo || "arma"`), sem o deixar pôr uma poção na mão. */
export function encaixeDoItem(item) {
  if (!item || typeof item !== "object") return null;
  if (item.tipo) return TROCA_DE_SLOT[item.tipo] ? item.tipo : null;
  let f = null;
  try { f = fichaDoItem(item); } catch (e) { f = null; }
  return f && f.familia === "arma" ? "arma" : null;
}
export function cabeNoEncaixe(item, slot) {
  return !!slot && encaixeDoItem(item) === slot;
}
export function itensParaEncaixe(inventario, slot) {
  return (Array.isArray(inventario) ? inventario : []).filter((it) => cabeNoEncaixe(it, slot));
}

const sinal = (n) => (n > 0 ? "+" : n < 0 ? "−" : "±") + Math.abs(n);
const vale = (pers, id) => (Number((pers.atributos || {})[id]) || 0) + (Number(bonusEquip(pers, id)) || 0);

/* A COMPARAÇÃO. `item` = o que vai entrar no encaixe (null = tirar o que
   lá está). Devolve as linhas que MUDAM: { id, rotulo, antes, depois,
   delta, sinal: "ok" | "danger" | "neutro" }, com a CA primeiro, depois os
   seis atributos, depois o dano (só no encaixe da arma). E o tempo da
   troca, que o motor já sabe, e `dorme` (pede sintonia e não a tem). Nunca
   lança: ficha torta dá lista vazia. */
export function compararItem(pers, item, slot, { emCombate = false } = {}) {
  const p = pers && typeof pers === "object" ? pers : {};
  const eq = { ...(p.equipados || {}) };
  const atual = eq[slot] || null;
  const depoisEq = { ...eq };
  if (item) depoisEq[slot] = item; else delete depoisEq[slot];
  const depois = { ...p, equipados: depoisEq };
  const linhas = [];
  try {
    const a = defesaDe(p), d = defesaDe(depois);
    if (a !== d) linhas.push({ id: "ca", rotulo: "Classe de armadura", curto: "CA", antes: a, depois: d, delta: d - a, sinal: d > a ? "ok" : "danger" });
  } catch (e) { /* sem CA, as outras linhas continuam */ }
  for (const at of ATRIBUTOS) {
    try {
      const a = vale(p, at.id), d = vale(depois, at.id);
      if (a !== d) linhas.push({ id: at.id, rotulo: at.nome, curto: at.nome, antes: sinal(a), depois: sinal(d), delta: d - a, sinal: d > a ? "ok" : "danger" });
    } catch (e) { /* um atributo torto não cala os outros */ }
  }
  if (slot === "arma") {
    try {
      const a = danoDaArma(atual), d = danoDaArma(item);
      if (a.texto !== d.texto) {
        const media = (x) => x.n * (x.faces + 1) / 2;
        linhas.push({ id: "dano", rotulo: "Dano", curto: "dano", antes: a.texto, depois: d.texto, delta: media(d) - media(a), sinal: media(d) >= media(a) ? "ok" : "danger" });
      }
    } catch (e) { /* sem dano, sem linha */ }
  }
  const troca = podeTrocarAgora(slot, { emCombate });
  /* o item que pede sintonia e não a tem DORME: serve de peça, mas o poder
     não responde (sintonia.js) — e por isso as linhas acima não o contam.
     A gaveta tem de o dizer, senão o jogador lê «nada muda» e não sabe porquê. */
  let dorme = false;
  try { dorme = !!item && pedeSintonia(item) && !estaSintonizado(depois, item); } catch (e) { dorme = false; }
  return { linhas, troca, atual, item: item || null, dorme };
}

/* O TEMPO DA TROCA, em palavras (§3: «trocar leva 1 minuto: a fivela é
   debaixo do queixo»). Os segundos e o como são de TROCA_DE_SLOT. */
export function fraseDaTroca(slot) {
  const t = TROCA_DE_SLOT[slot];
  if (!t) return "";
  const s = t.segundos;
  const quanto = s < 60 ? `${s} segundo${s > 1 ? "s" : ""}` : `${Math.round(s / 60)} minuto${s >= 120 ? "s" : ""}`;
  return `Trocar leva ${quanto}: ${t.como}.`;
}

/* O PREÇO NO BOTÃO: «Equipar · CA 15, Percepção −1». A CA diz o número
   de depois (é o número que o inimigo tem de bater); o resto diz a
   diferença. Sem nada a mudar, o verbo fica sozinho. */
export function rotuloDoEquipar(linhas, verbo = "Equipar") {
  const ls = Array.isArray(linhas) ? linhas : [];
  if (!ls.length) return verbo;
  const partes = ls.map((l) => (l.id === "ca" ? `CA ${l.depois}` : l.id === "dano" ? `dano ${l.depois}` : `${l.curto} ${sinal(l.delta)}`));
  return `${verbo} · ${partes.join(", ")}`;
}
