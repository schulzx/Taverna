/* ============================================================
   ESCOLAS E COMBOS (v9.6) — o que soma com o quê

   Duas coisas que faltavam e que andam juntas.

   1) ESCOLA. Toda habilidade pertence à escola da classe dela, e
      cada escola tem uma NATUREZA: física ou mágica. Isso resolve
      a pergunta certa do jogador — "Fúria de Batalha aumenta o
      dano da minha magia?". Não aumenta. Fúria é do guerreiro,
      escola física: ela levanta aço, não feitiço. Antes disso, os
      buffs não somavam a nada; agora somam à coisa certa.

   2) COMBO. O turno já aceita mais de uma habilidade quando há
      movimentos sobrando. Se as duas conversam entre si, o sistema
      reconhece e paga por isso: fogo e gelo se estilhaçam, magia e
      lâmina viram golpe encantado, dois marciais viram sequência.
      Quem montou uma build estranha ganha por ter montado.

   O sistema detecta e calcula. O Mestre recebe pronto e narra.
   ============================================================ */

import { classeDaHabilidade, fichaDaHabilidade } from "./classes.js";

/* ---------------- ESCOLAS ---------------- */
export const ESCOLAS = {
  fisico:    { id: "fisico",    nome: "Físico",    icone: "⚔",  natureza: "fisico", desc: "aço, corpo e fôlego" },
  engenho:   { id: "engenho",   nome: "Engenho",   icone: "⚙",  natureza: "fisico", desc: "pólvora, engrenagem e química" },
  arcano:    { id: "arcano",    nome: "Arcano",    icone: "✦",  natureza: "magico", desc: "o tecido bruto da realidade" },
  divino:    { id: "divino",    nome: "Divino",    icone: "☀",  natureza: "magico", desc: "o poder emprestado de algo maior" },
  natural:   { id: "natural",   nome: "Natural",   icone: "🌿", natureza: "magico", desc: "bicho, planta e tempestade" },
  sombrio:   { id: "sombrio",   nome: "Sombrio",   icone: "🌑", natureza: "magico", desc: "pactos e coisas sem nome" },
  encanto:   { id: "encanto",   nome: "Encanto",   icone: "🎵", natureza: "magico", desc: "palavra, música e vontade alheia" },
  invocacao: { id: "invocacao", nome: "Invocação", icone: "👁", natureza: "magico", desc: "o que você chama para lutar por você" },
};

const ESCOLA_DA_CLASSE = {
  "Guerreiro": "fisico", "Monge": "fisico", "Ladino": "fisico", "Caçador": "fisico",
  "Mago": "arcano", "Feiticeiro": "arcano",
  "Clérigo": "divino", "Druida": "natural", "Bruxo": "sombrio",
  "Bardo": "encanto", "Engenheiro": "engenho", "Invocador": "invocacao",
};

export function escolaDaClasse(classeNome) { return ESCOLA_DA_CLASSE[classeNome] || "fisico"; }

export function escolaDaHabilidade(hab, pers) {
  const nome = typeof hab === "string" ? hab : (hab && hab.nome) || "";
  const cls = classeDaHabilidade(nome);
  if (cls) return escolaDaClasse(cls);
  /* únicas, dádivas e improvisos herdam a escola da classe de origem do herói */
  return escolaDaClasse((pers && pers.classe) || "");
}

export function naturezaDaHabilidade(hab, pers) {
  return (ESCOLAS[escolaDaHabilidade(hab, pers)] || ESCOLAS.fisico).natureza;
}

/* ---------------- ELEMENTO ----------------
   Fogo, gelo e raio saem do nome e da descrição — é o que permite reconhecer
   choque térmico sem precisar etiquetar 400 habilidades à mão. */
const ELEMENTOS = [
  { id: "fogo", nome: "fogo", icone: "🔥", rx: /(fogo|flame|flamej|chama|brasa|ígne|igne|incandesc|queim|piro|lava|magma|forja|solar)/i },
  { id: "gelo", nome: "gelo", icone: "❄", rx: /(gelo|gélid|gelid|geada|glaci|congel|invern|frio|crio|neve)/i },
  { id: "raio", nome: "raio", icone: "⚡", rx: /(raio|relâmp|relamp|trov|elétric|eletric|choque|tempestade|centelha)/i },
  { id: "veneno", nome: "veneno", icone: "☠", rx: /(veneno|tóxic|toxic|peçonh|peconh|ácid|acid|apodrec)/i },
  { id: "sombra", nome: "sombra", icone: "🌑", rx: /(sombra|sombri|escurid|umbr|vazio|abissal|sepulcr|necro)/i },
  { id: "luz", nome: "luz", icone: "✨", rx: /(luz|radiant|sagrad|aurora|divin|santo|celest)/i },
];
export function elementoDaHabilidade(hab) {
  const texto = typeof hab === "string" ? hab : `${(hab && hab.nome) || ""} ${(hab && hab.descricao) || ""}`;
  for (const e of ELEMENTOS) if (e.rx.test(texto)) return e.id;
  return null;
}

/* ---------------- BUFFS: o que cada um levanta ----------------
   O efeito guarda `escopo`: "fisico", "magico" ou "todos". Quando não guarda
   (efeito antigo, ou vindo do Mestre), a natureza da habilidade que o criou
   decide — e alguns nomes são universais por direito. */
const UNIVERSAIS = /(bênção|bencao|abençoad|abencoad|inspir|coragem|grito de guerra|aplauso|hino|marcha|ovação|ovacao|guia ancestral|conselho|vantagem|foco|concentr)/i;

export function escopoDoEfeito(ef, pers) {
  if (!ef) return "todos";
  if (ef.escopo === "fisico" || ef.escopo === "magico" || ef.escopo === "todos") return ef.escopo;
  const nome = ef.nome || "";
  if (UNIVERSAIS.test(nome)) return "todos";
  const ficha = fichaDaHabilidade(nome);
  if (ficha) return naturezaDaHabilidade(ficha, pers);
  /* efeito de origem desconhecida não deve ser mais generoso que o explícito */
  return "todos";
}

/* Este efeito soma nesta habilidade? */
export function efeitoVale(ef, hab, pers) {
  const escopo = escopoDoEfeito(ef, pers);
  if (escopo === "todos") return true;
  return escopo === naturezaDaHabilidade(hab, pers);
}

/* Quanto os buffs ativos somam ao dano DESTA habilidade. É onde a resposta
   à pergunta do jogador vira número: Fúria de Batalha (+3 físico) não
   aparece aqui quando ele lança uma magia. */
export function bonusDeDano(pers, hab) {
  const efeitos = (pers && pers.efeitos) || [];
  let total = 0;
  const usados = [];
  for (const ef of efeitos) {
    const b = Math.max(0, Number(ef.bonus) || 0);
    if (!b) continue;
    if (!efeitoVale(ef, hab, pers)) continue;
    total += b;
    usados.push(ef.nome || "efeito");
  }
  return { bonus: total, fontes: usados };
}

/* Golpe de arma é FÍSICO por definição, venha de quem vier: o cajado do mago
   ainda é um pedaço de pau. Por isso não passa por escolaDaHabilidade. */
export function bonusDeArma(pers) {
  const efeitos = (pers && pers.efeitos) || [];
  let total = 0;
  const fontes = [];
  for (const ef of efeitos) {
    const b = Math.max(0, Number(ef.bonus) || 0);
    if (!b) continue;
    const escopo = escopoDoEfeito(ef, pers);
    if (escopo === "magico") continue;
    total += b;
    fontes.push(ef.nome || "efeito");
  }
  return { bonus: total, fontes };
}

/* E os que NÃO valeram — para o sistema poder dizer isso na cara do jogador,
   em vez de deixá-lo achar que o buff está somando. */
export function buffsIgnorados(pers, hab) {
  return ((pers && pers.efeitos) || [])
    .filter((ef) => (Number(ef.bonus) || 0) > 0 && !efeitoVale(ef, hab, pers))
    .map((ef) => ef.nome || "efeito");
}

/* ---------------- COMBOS ----------------
   Casam DUAS habilidades usadas no mesmo turno. A ordem importa: o bônus
   entra na segunda, porque é ela que colhe o que a primeira preparou.
   A lista é ordenada por prioridade — vale o primeiro que casar. */
const nat = (h, p) => naturezaDaHabilidade(h, p);
const el = (h) => elementoDaHabilidade(h);
const tipoDe = (h) => (h && h.tipo) || (fichaDaHabilidade(h && h.nome) || {}).tipo || "";
const ehAtaque = (h) => tipoDe(h) === "ataque" || h.danoBase != null;
/* "preparo" é o que arma o golpe seguinte. O tipo do catálogo resolve quase
   tudo, mas alguns buffs estão catalogados como "ataque" — Fúria de Batalha é
   o caso clássico: ela não bate em ninguém, ela liga o dano por alguns turnos.
   A descrição denuncia esses ("três turnos de dano aumentado"). */
const DURACAO_RX = /(um|dois|dois|três|tres|quatro|cinco|v[áa]rios|\d+)\s+turnos/i;
const AREA_RX = /(em área|em area|todos os inimigos|todos por perto|no caminho)/i;
const ehPreparo = (h) => {
  if (["defesa", "suporte", "utilidade", "passiva"].includes(tipoDe(h))) return true;
  const desc = (h && h.descricao) || "";
  return DURACAO_RX.test(desc) && !AREA_RX.test(desc);
};

export const COMBOS = [
  {
    id: "choque_termico", nome: "Choque Térmico", icone: "💥", mult: 1.5,
    desc: "O que estava em brasa racha ao congelar — ou o contrário.",
    casa: (a, b) => (el(a) === "fogo" && el(b) === "gelo") || (el(a) === "gelo" && el(b) === "fogo"),
    narrar: "o metal e a carne estalam entre o calor e o gelo, e a matéria simplesmente cede",
  },
  {
    id: "condutor", nome: "Condutor", icone: "⚡", mult: 1.4,
    desc: "Gelo, água ou veneno molham o alvo; o raio faz o resto.",
    casa: (a, b) => (["gelo", "veneno"].includes(el(a)) && el(b) === "raio"),
    narrar: "a descarga encontra caminho pronto e percorre o alvo inteiro",
  },
  {
    id: "golpe_encantado", nome: "Golpe Encantado", icone: "🗡✦", mult: 1.35,
    desc: "Magia primeiro, aço depois: o clássico do mago-guerreiro.",
    casa: (a, b, p) => nat(a, p) === "magico" && nat(b, p) === "fisico" && ehAtaque(b),
    narrar: "a lâmina entra pela brecha que o feitiço abriu, e as duas coisas acertam como uma só",
  },
  {
    id: "furia_canalizada", nome: "Fúria Canalizada", icone: "⚔🔥", mult: 1.3,
    desc: "Um preparo físico seguido de um golpe físico. Simples e brutal.",
    casa: (a, b, p) => ehPreparo(a) && nat(a, p) === "fisico" && nat(b, p) === "fisico" && ehAtaque(b),
    narrar: "o corpo inteiro entra no golpe, do calcanhar ao punho",
  },
  {
    id: "ressonancia", nome: "Ressonância", icone: "✦✦", mult: 1.25,
    desc: "Duas conjurações da mesma escola se reforçam.",
    casa: (a, b, p) => ehAtaque(b) && nat(a, p) === "magico" && nat(b, p) === "magico" && escolaDaHabilidade(a, p) === escolaDaHabilidade(b, p),
    narrar: "a segunda conjuração pega carona na primeira e sai maior do que devia",
  },
  {
    id: "sequencia", nome: "Sequência", icone: "⚔⚔", mult: 1.2,
    desc: "Dois golpes físicos encadeados sem dar tempo de reagir.",
    casa: (a, b, p) => nat(a, p) === "fisico" && nat(b, p) === "fisico" && ehAtaque(a) && ehAtaque(b),
    narrar: "o segundo golpe emenda no primeiro antes que a guarda volte",
  },
  {
    id: "abertura", nome: "Abertura", icone: "🎯", mult: 1.15,
    desc: "Preparar e então executar — funciona com qualquer par.",
    casa: (a, b) => ehPreparo(a) && ehAtaque(b),
    narrar: "o que veio antes deixou o alvo exatamente onde você queria",
  },
];

/* Recebe as habilidades do turno na ORDEM em que foram usadas. Devolve o
   combo (se houver), já com o multiplicador e os textos prontos. */
export function detectarCombo(habs, pers) {
  const lista = (habs || []).filter(Boolean);
  if (lista.length < 2) return null;
  const a = lista[lista.length - 2];
  const b = lista[lista.length - 1];
  for (const c of COMBOS) {
    let casou = false;
    try { casou = !!c.casa(a, b, pers); } catch { casou = false; }
    if (!casou) continue;
    return {
      ...c,
      primeira: a.nome || String(a), segunda: b.nome || String(b),
      texto: `${c.icone} COMBO — ${c.nome}: ${a.nome} → ${b.nome} (×${c.mult.toFixed(2).replace(/0$/, "")} de dano)`,
      nota: `[COMBO — RESOLVIDO PELO SISTEMA] Encadeei ${a.nome} e ${b.nome} no mesmo turno: ${c.nome}. Narre o encadeamento — ${c.narrar} — e trate o dano do envelope como fato, sem recalcular nem somar por conta própria.`,
    };
  }
  return null;
}

/* Todos os combos que a ficha do herói consegue montar hoje — o painel usa
   isso para mostrar ao jogador o que a build DELE permite. */
export function combosPossiveis(pers) {
  const habs = ((pers && pers.habilidades) || []).map((h) => (typeof h === "string" ? fichaDaHabilidade(h) || { nome: h } : h)).filter(Boolean);
  const achados = new Map();
  for (const a of habs) for (const b of habs) {
    if (a === b) continue;
    const c = detectarCombo([a, b], pers);
    if (c && !achados.has(c.id)) achados.set(c.id, { id: c.id, nome: c.nome, icone: c.icone, desc: c.desc, mult: c.mult, exemplo: `${a.nome} → ${b.nome}` });
  }
  return [...achados.values()].sort((x, y) => y.mult - x.mult);
}

export function resumoCombosPrompt(pers) {
  const cs = combosPossiveis(pers);
  if (!cs.length) return "";
  return `COMBOS QUE A FICHA PERMITE (detectados e calculados pelo SISTEMA quando eu uso duas habilidades no mesmo turno — você nunca os declara): ${cs.slice(0, 5).map((c) => `${c.icone} ${c.nome} (${c.exemplo})`).join(" · ")}.`;
}

export const COMBOS_PROMPT = `ESCOLAS, BUFFS E COMBOS (v9.6 — o sistema decide, você narra):
- Toda habilidade tem uma ESCOLA (física, arcana, divina, natural, sombria, de encanto, de engenho ou de invocação) e uma natureza: FÍSICA ou MÁGICA. Um bônus físico (Fúria de Batalha, Postura Defensiva, Pele de Pedra) NÃO aumenta magia, e um bônus arcano não aumenta golpe de espada. O sistema já aplica isso nos números; se o jogador esperava que somasse e não somou, o envelope avisa — narre a frustração com honestidade, sem compensar.
- Bênçãos, inspirações e gritos de guerra são as exceções universais: valem para tudo.
- COMBO: quando o herói usa duas habilidades no mesmo turno e elas conversam (fogo depois de gelo, magia antes da lâmina, dois golpes físicos encadeados), o sistema reconhece, dá nome e multiplica o dano. O envelope chega com "[COMBO — RESOLVIDO PELO SISTEMA]" e o nome do combo. Narre o encadeamento como uma coisa só — não como dois turnos — e nunca invente um combo que o sistema não anunciou.`;
