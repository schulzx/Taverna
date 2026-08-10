/* ============================================================
   OFÍCIO: COMPONENTES, RECEITAS E BANCADA (v9.13) — Taverna

   O jogo já tinha consumíveis de verdade (pocoes.js) e uma forja
   de equipamento. O que faltava era o meio do caminho: de onde vem
   uma poção quando não há mercador por perto, e o que fazer com o
   mato que se colhe na estrada.

   Três peças, todas resolvidas por código:

   1. COMPONENTES — um catálogo fechado e pequeno. Erva, mineral e
      despojo de criatura. Não é item mágico: é matéria-prima, com
      preço baixo e origem clara (colher, matar, comprar).

   2. RECEITAS — cada uma diz o que consome, o que produz, qual
      atributo governa e qual a dificuldade. O produto NUNCA é
      inventado: sai do catálogo de consumíveis que o resto do jogo
      já conhece, então a poção forjada é idêntica à comprada.

   3. A BANCADA — rola d20 + atributo contra a dificuldade. Sucesso
      entrega; crítico entrega dobrado; falha comum devolve parte do
      material (o artesão aprende); falha feia perde tudo.

   Nada aqui fala com a IA. O Mestre recebe o resultado pronto e
   narra o cheiro da oficina — que é o trabalho dele.
   ============================================================ */

import { CONSUMIVEIS, consumivelPorId, itemConsumivel } from "./pocoes.js";

const d20 = () => 1 + Math.floor(Math.random() * 20);

/* ---------------- 1. COMPONENTES ----------------
   `origem` diz de onde cai, e é o que liga o craft ao resto do mundo:
   colher = forrageamento, abate = drop de combate, compra = mercador. */
export const COMPONENTES = [
  /* ervas — vêm do chão, do forrageamento */
  { id: "erva_amarga", nome: "Erva Amarga", icone: "🌿", classe: "erva", valor: 6, origem: "colher", desc: "Folha áspera que fecha ferida pequena." },
  { id: "raiz_sangue", nome: "Raiz-de-Sangue", icone: "🌿", classe: "erva", valor: 14, origem: "colher", desc: "Vermelha por dentro. Cheira a ferro." },
  { id: "musgo_lunar", nome: "Musgo Lunar", icone: "🌿", classe: "erva", valor: 22, origem: "colher", desc: "Só cresce onde a lua bate. Guarda frio." },
  { id: "flor_febre", nome: "Flor-de-Febre", icone: "🌸", classe: "erva", valor: 12, origem: "colher", desc: "Queima a língua e limpa o sangue." },

  /* minerais — pedreira, encosta, areia; saem de terreno duro, não de mato */
  { id: "po_ferro", nome: "Pó de Ferro", icone: "⛏", classe: "mineral", valor: 8, origem: "colher", desc: "Limalha fina. Endurece o que toca." },
  { id: "sal_negro", nome: "Sal Negro", icone: "⛏", classe: "mineral", valor: 18, origem: "colher", desc: "Puxa o veneno para fora da carne." },
  { id: "cristal_bruto", nome: "Cristal Bruto", icone: "💎", classe: "mineral", valor: 40, origem: "colher", desc: "Guarda carga arcana como um pote guarda água." },

  /* despojos — só saem de criatura abatida */
  { id: "glandula", nome: "Glândula de Veneno", icone: "🦂", classe: "despojo", valor: 25, origem: "abate", desc: "Ainda pulsa um pouco. Cuidado ao furar." },
  { id: "couro_curtido", nome: "Retalho de Couro", icone: "🐗", classe: "despojo", valor: 10, origem: "abate", desc: "Grosso o bastante para virar tira." },
  { id: "essencia", nome: "Essência Residual", icone: "✨", classe: "despojo", valor: 60, origem: "abate", desc: "O que sobra quando algo mágico morre." },
];

export const componentePorId = (id) => COMPONENTES.find((c) => c.id === id) || null;

/* Reconhece um item da bolsa como componente — pelo id ou pelo nome, porque
   o inventário guarda tanto string solta quanto objeto. */
export function comoComponente(raw) {
  if (!raw) return null;
  if (typeof raw === "object" && raw.compId) return componentePorId(raw.compId);
  const nome = typeof raw === "string" ? raw : (raw.nome || "");
  const n = nome.toLowerCase().trim();
  return COMPONENTES.find((c) => c.nome.toLowerCase() === n || c.id === n) || null;
}

export function itemComponente(id) {
  const c = componentePorId(id);
  if (!c) return null;
  return { nome: c.nome, tipo: "componente", compId: c.id, icone: c.icone, descricao: c.desc, valor: c.valor };
}

/* ---------------- 2. RECEITAS ----------------
   `custo` é [idComponente, quantidade]. `produz` aponta para o catálogo de
   consumíveis — o que sai da bancada é o MESMO item que o mercador vende, e
   é por isso que não existe poção "de craft" mais fraca ou mais forte. */
export const RECEITAS = [
  /* — alquimia: intelecto — */
  { id: "r_cura_p", produz: "cura_p", oficio: "alquimia", atributo: "intelecto", dificuldade: 10, nivel: 1, custo: [["erva_amarga", 2]] },
  { id: "r_cura_m", produz: "cura_m", oficio: "alquimia", atributo: "intelecto", dificuldade: 14, nivel: 4, custo: [["erva_amarga", 2], ["raiz_sangue", 1]] },
  { id: "r_cura_g", produz: "cura_g", oficio: "alquimia", atributo: "intelecto", dificuldade: 18, nivel: 8, custo: [["raiz_sangue", 2], ["musgo_lunar", 1]] },
  { id: "r_mana_p", produz: "mana_p", oficio: "alquimia", atributo: "intelecto", dificuldade: 11, nivel: 1, custo: [["musgo_lunar", 1]] },
  { id: "r_mana_m", produz: "mana_m", oficio: "alquimia", atributo: "intelecto", dificuldade: 15, nivel: 4, custo: [["musgo_lunar", 2], ["cristal_bruto", 1]] },
  { id: "r_mana_g", produz: "mana_g", oficio: "alquimia", atributo: "intelecto", dificuldade: 19, nivel: 8, custo: [["musgo_lunar", 2], ["cristal_bruto", 2], ["essencia", 1]] },
  { id: "r_antidoto", produz: "antidoto", oficio: "alquimia", atributo: "intelecto", dificuldade: 10, nivel: 1, custo: [["flor_febre", 1], ["sal_negro", 1]] },
  { id: "r_elixir_forca", produz: "elixir_forca", oficio: "alquimia", atributo: "intelecto", dificuldade: 15, nivel: 3, custo: [["raiz_sangue", 1], ["po_ferro", 1], ["couro_curtido", 1]] },
  { id: "r_elixir_intelecto", produz: "elixir_intelecto", oficio: "alquimia", atributo: "intelecto", dificuldade: 15, nivel: 3, custo: [["musgo_lunar", 1], ["cristal_bruto", 1]] },
  { id: "r_elixir_vigor", produz: "elixir_vigor", oficio: "alquimia", atributo: "intelecto", dificuldade: 15, nivel: 3, custo: [["raiz_sangue", 1], ["couro_curtido", 2]] },
  { id: "r_elixir_destreza", produz: "elixir_destreza", oficio: "alquimia", atributo: "intelecto", dificuldade: 15, nivel: 3, custo: [["flor_febre", 1], ["glandula", 1]] },
  { id: "r_frasco_furia", produz: "frasco_furia", oficio: "alquimia", atributo: "intelecto", dificuldade: 16, nivel: 4, custo: [["raiz_sangue", 2], ["glandula", 1]] },
  { id: "r_frasco_pedra", produz: "frasco_pedra", oficio: "alquimia", atributo: "intelecto", dificuldade: 16, nivel: 4, custo: [["po_ferro", 2], ["couro_curtido", 1]] },
  { id: "r_frasco_vento", produz: "frasco_vento", oficio: "alquimia", atributo: "intelecto", dificuldade: 17, nivel: 5, custo: [["musgo_lunar", 1], ["essencia", 1]] },
  { id: "r_frasco_sombra", produz: "frasco_sombra", oficio: "alquimia", atributo: "intelecto", dificuldade: 17, nivel: 5, custo: [["flor_febre", 2], ["essencia", 1]] },

  /* — utilitários: destreza. Trabalho de mão, não de livro — */
  { id: "r_ataduras", produz: "ataduras", oficio: "utilitario", atributo: "destreza", dificuldade: 8, nivel: 1, custo: [["couro_curtido", 1]] },
  { id: "r_sais", produz: "sais", oficio: "utilitario", atributo: "destreza", dificuldade: 11, nivel: 2, custo: [["flor_febre", 1], ["sal_negro", 1]] },
  { id: "r_revigorante", produz: "revigorante", oficio: "utilitario", atributo: "destreza", dificuldade: 12, nivel: 2, custo: [["erva_amarga", 1], ["flor_febre", 1]] },
];

export function receitaPorId(id) { return RECEITAS.find((r) => r.id === id) || null; }

export const OFICIOS = {
  alquimia: { nome: "Alquimia", icone: "⚗", desc: "Fervura, decantação e paciência. Governada pelo Intelecto." },
  utilitario: { nome: "Utilitários", icone: "🧵", desc: "Corte, costura e mistura seca. Governada pela Destreza." },
};

/* O que a receita produz, já com nome e cara — sai do catálogo, não daqui. */
export function produtoDaReceita(r) {
  return r ? consumivelPorId(r.produz) : null;
}

/* ---------------- 3. A BANCADA ---------------- */

/* Quantos de cada componente estão na bolsa. Aceita string e objeto. */
export function contarComponentes(inventario) {
  const conta = {};
  for (const raw of inventario || []) {
    const c = comoComponente(raw);
    if (c) conta[c.id] = (conta[c.id] || 0) + 1;
  }
  return conta;
}

/* O que falta para esta receita — lista vazia significa "dá para forjar". */
export function faltaPara(receita, inventario) {
  const tem = contarComponentes(inventario);
  const falta = [];
  for (const [id, qtd] of receita.custo || []) {
    const disp = tem[id] || 0;
    if (disp < qtd) falta.push({ id, nome: (componentePorId(id) || {}).nome || id, precisa: qtd, tem: disp });
  }
  return falta;
}

/* Receitas visíveis para este herói: nível abre o caderno, e nada mais.
   De propósito: quem quiser ser mago-ferreiro-alquimista pode. */
export function receitasDisponiveis(nivel = 1) {
  return RECEITAS.filter((r) => (r.nivel || 1) <= (nivel || 1));
}

/* ---------------- DE ONDE VEM A MATÉRIA-PRIMA ----------------
   Componente que não se acha é receita que não existe. Duas torneiras:

   COLHER — o forrageamento já roda por bioma; agora ele traz também o que dá
   para trabalhar. Mato rende erva, terreno duro rende mineral: é a diferença
   entre andar num pântano e andar numa encosta. */
const COLHEITA_POR_BIOMA = {
  floresta: ["erva_amarga", "erva_amarga", "raiz_sangue", "musgo_lunar", "flor_febre"],
  planicie: ["erva_amarga", "erva_amarga", "flor_febre"],
  pantano: ["raiz_sangue", "flor_febre", "musgo_lunar", "glandula"],
  costa: ["sal_negro", "erva_amarga", "musgo_lunar"],
  colina: ["po_ferro", "erva_amarga", "raiz_sangue"],
  montanha: ["po_ferro", "po_ferro", "cristal_bruto", "musgo_lunar"],
  deserto: ["sal_negro", "sal_negro", "po_ferro"],
  gelo: ["musgo_lunar", "cristal_bruto", "sal_negro"],
};

export function colherComponentes(bioma, modPercepcao = 0, { sorte = Math.random } = {}) {
  const tabela = COLHEITA_POR_BIOMA[bioma] || COLHEITA_POR_BIOMA.planicie;
  /* mão treinada acha mais: 1 achado garantido, e o modificador compra a chance de um segundo */
  const quantos = 1 + (sorte() < Math.min(0.6, 0.12 * Math.max(0, modPercepcao)) ? 1 : 0);
  const out = [];
  for (let i = 0; i < quantos; i++) out.push(tabela[Math.floor(sorte() * tabela.length)]);
  return out.map((id) => componentePorId(id)).filter(Boolean);
}

/* ABATE — o que dá para tirar de um corpo. Criatura mágica deixa essência;
   bicho deixa couro; o que peçonhento deixa é glândula. A ameaça decide
   quantos, porque esfolar um lobo não é esfolar um dragão. */
export function despojosDe(inimigos = [], { sorte = Math.random } = {}) {
  const out = [];
  for (const e of inimigos) {
    if (!e || !e.nome) continue;
    const n = String(e.nome).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    const magico = /(elemental|espectro|fantasma|aparic|arcan|magi|drag|demon|diabo|anjo|golem|horror|abissal|divin)/.test(n);
    const peconhento = /(aranha|serpente|cobra|escorpi|verme|inseto|vespa|sapo|naja|viuva)/.test(n);
    const chance = e.ameaca === "lendario" ? 1 : e.ameaca === "elite" ? 0.7 : 0.35;
    if (sorte() > chance) continue;
    const id = magico ? "essencia" : peconhento ? "glandula" : "couro_curtido";
    out.push(componentePorId(id));
  }
  return out.filter(Boolean);
}

/* Rola a bancada. `mod` é o atributo que governa o ofício.
   - 20 natural, ou 5 acima da dificuldade: sai DOBRADO
   - passou: sai um
   - falhou: perde metade do material (arredonda para baixo)
   - errou por 10+, ou 1 natural: perde tudo
   Falhar sem perder nada tiraria o peso da decisão; perder sempre tudo faria
   ninguém tentar. E a margem larga do desastre é de propósito: o artesão
   treinado quase nunca destrói o material — só o atrapalhado destrói. */
export function forjarNaBancada(receita, mod = 0) {
  const dado = d20();
  const total = dado + mod;
  const dif = receita.dificuldade;
  const critico = dado === 20 || total >= dif + 5;
  const desastre = dado === 1 || total <= dif - 10;
  const passou = dado !== 1 && total >= dif;
  const rolagem = `d20 → ${dado}${mod >= 0 ? "+" : ""}${mod} = ${total} vs dif. ${dif}`;
  if (passou) {
    const qtd = critico ? 2 : 1;
    return { ok: true, critico, qtd, dado, total, rolagem, gastaTudo: true, devolve: 0 };
  }
  return { ok: false, critico: false, qtd: 0, dado, total, rolagem, gastaTudo: true, devolve: desastre ? 0 : 0.5, desastre };
}

/* Aplica o resultado ao personagem: tira componentes, devolve o que sobrou
   e põe o produto na bolsa. Função PURA — devolve a ficha nova. */
export function aplicarCraft(ent, receita, res) {
  let inv = [...(ent.inventario || [])];
  /* consome: tira exatamente a quantidade pedida, do fim para o começo */
  for (const [id, qtd] of receita.custo || []) {
    let restam = qtd;
    for (let i = inv.length - 1; i >= 0 && restam > 0; i--) {
      const c = comoComponente(inv[i]);
      if (c && c.id === id) { inv.splice(i, 1); restam--; }
    }
  }
  /* devolve parte na falha comum — o artesão salva o que dá */
  if (!res.ok && res.devolve > 0) {
    for (const [id, qtd] of receita.custo || []) {
      const volta = Math.floor(qtd * res.devolve);
      for (let i = 0; i < volta; i++) { const it = itemComponente(id); if (it) inv.push(it); }
    }
  }
  if (res.ok) {
    for (let i = 0; i < res.qtd; i++) { const it = itemConsumivel(receita.produz); if (it) inv.push(it); }
  }
  return { ...ent, inventario: inv };
}

/* O texto que o jogador lê e o envelope que o Mestre recebe. */
export function textoDoCraft(receita, res, mostrarDado = false) {
  const p = produtoDaReceita(receita);
  const nome = (p && p.nome) || receita.produz;
  const dado = mostrarDado ? ` (${res.rolagem})` : "";
  if (res.ok && res.critico) return `${(p && p.icone) || "⚗"} Mão cheia: saíram DOIS ${nome}${dado}.`;
  if (res.ok) return `${(p && p.icone) || "⚗"} Pronto: ${nome}${dado}.`;
  if (res.desastre) return `💥 A mistura virou e você perdeu tudo o que tinha posto${dado}.`;
  return `⚠ Não deu liga. Metade do material se salvou${dado}.`;
}

export function envelopeDoCraft(receita, res) {
  const p = produtoDaReceita(receita);
  const nome = (p && p.nome) || receita.produz;
  const of = OFICIOS[receita.oficio] || OFICIOS.alquimia;
  if (res.ok) {
    return `[OFÍCIO — RESOLVIDO PELO SISTEMA] Trabalhei na bancada (${of.nome.toLowerCase()}) e ${res.critico ? `saíram DOIS ${nome}` : `saiu um ${nome}`}. O material já foi consumido e o produto JÁ está na minha bolsa — NÃO envie itens nem repita números. Narre o trabalho em 2-3 frases: o cheiro, o calor, o ponto em que a mistura virou. ${res.critico ? "Foi um acerto acima do esperado: mostre isso na ficção." : ""}`;
  }
  return `[OFÍCIO — RESOLVIDO PELO SISTEMA] Tentei fazer ${nome} na bancada e FALHEI${res.desastre ? " feio: perdi todo o material" : ": metade do material se salvou"}. O sistema já tirou o que foi perdido. NÃO me dê o item, NÃO invente um resultado parcial útil. Narre o erro em 2-3 frases — o que cheirou errado, o que estourou, o silêncio depois.`;
}

export const CRAFT_PROMPT = `OFÍCIO E COMPONENTES (v9.13 — o sistema resolve, você narra):
- Componentes são MATÉRIA-PRIMA, não item mágico: ervas, minerais e despojos de criatura. O jogador colhe na estrada, tira de um corpo ou compra.
- Quando ele forja algo, o SISTEMA rola a bancada, consome o material e entrega (ou não) o produto. Você recebe o resultado pronto no envelope: narre o trabalho, nunca o resultado. Não invente que "deu certo mesmo assim", e não dê consolo material numa falha.
- Ao descrever despojos de uma criatura abatida, é natural mencionar o que dá para aproveitar (glândula, couro, essência) — mas quem coloca na bolsa é o sistema, então NÃO envie itens por isso.`;
