/* ============================================================
   ITENS E PROFICIÊNCIA (v9.11) — quem pode usar o quê

   Até aqui qualquer um equipava qualquer coisa: o mago vestia
   armadura de placas e sacava um montante, o guerreiro conjurava
   com uma varinha, e nada no sistema reclamava. A ficha tinha
   slots, mas não tinha REGRA.

   Aqui cada item ganha categoria — a arma é simples ou marcial, a
   armadura é leve, média ou pesada — e cada classe ganha o que
   sabe usar. O 5e é a base, com uma diferença de propósito: quase
   nada é PROIBIDO, quase tudo é CARO. Vestir placas sendo mago não
   trava a interface; trava a conjuração e enche você de
   desvantagem. O jogador pode fazer besteira, e a besteira dói.

   Isso importa porque o resto depende: o inventário mostra o que
   serve, o craft produz o que a sua classe usa, e a ficha só faz
   sentido quando equipar significa alguma coisa.
   ============================================================ */

/* ---------------- CATEGORIAS ---------------- */
export const CAT_ARMA = {
  simples_corpo: { id: "simples_corpo", nome: "arma simples corpo a corpo", classe: "simples" },
  simples_dist: { id: "simples_dist", nome: "arma simples à distância", classe: "simples", distancia: true },
  marcial_corpo: { id: "marcial_corpo", nome: "arma marcial corpo a corpo", classe: "marcial" },
  marcial_dist: { id: "marcial_dist", nome: "arma marcial à distância", classe: "marcial", distancia: true },
  arcana: { id: "arcana", nome: "foco arcano", classe: "simples", foco: true },
};

export const CAT_ARMADURA = {
  leve: { id: "leve", nome: "armadura leve", peso: 1 },
  media: { id: "media", nome: "armadura média", peso: 2, furtividadeRuim: true },
  pesada: { id: "pesada", nome: "armadura pesada", peso: 3, furtividadeRuim: true, exigeForca: 3 },
  escudo: { id: "escudo", nome: "escudo", peso: 1 },
  panos: { id: "panos", nome: "veste sem proteção", peso: 0 },
};

/* Propriedades que mudam como a arma se usa (5e). */
export const PROPS = {
  leve: "leve", pesada: "pesada", duasMaos: "duas mãos", sutil: "sutil", alcance: "alcance",
};

/* ---------------- O CATÁLOGO ----------------
   Classifica as bases que o gerador de loot já usa. O que não estiver
   aqui é deduzido pelo nome — save antigo não pode quebrar. */
const A = (nome, cat, mao, props = []) => ({ nome, cat, mao, props });
export const ARMAS = [
  /* simples corpo a corpo */
  A("Adaga", "simples_corpo", 1, ["leve", "sutil"]),
  A("Stiletto", "simples_corpo", 1, ["leve", "sutil"]),
  A("Clava de Ossos", "simples_corpo", 1, ["leve"]),
  A("Soqueira Cravada", "simples_corpo", 1, ["leve"]),
  A("Lança", "simples_corpo", 1, ["alcance"]),
  A("Machadinha", "simples_corpo", 1, ["leve"]),
  A("Cajado de Carvalho", "arcana", 2, ["duas mãos"]),
  A("Varinha Rúnica", "arcana", 1, ["leve"]),
  A("Orbe de Batalha", "arcana", 1, []),
  /* simples à distância */
  A("Besta Leve", "simples_dist", 2, ["duas mãos"]),
  A("Arco Curto", "simples_dist", 2, ["duas mãos"]),
  /* marcial corpo a corpo */
  A("Espada Longa", "marcial_corpo", 1, []),
  A("Espada Curta", "marcial_corpo", 1, ["leve", "sutil"]),
  A("Montante", "marcial_corpo", 2, ["pesada", "duas mãos"]),
  A("Machado de Guerra", "marcial_corpo", 1, []),
  A("Machado Duplo", "marcial_corpo", 2, ["pesada", "duas mãos"]),
  A("Maça Pesada", "marcial_corpo", 1, []),
  A("Martelo de Batalha", "marcial_corpo", 1, []),
  A("Mangual", "marcial_corpo", 1, []),
  A("Lâmina Curva", "marcial_corpo", 1, []),
  A("Rapieira", "marcial_corpo", 1, ["sutil"]),
  A("Cimitarra", "marcial_corpo", 1, ["leve", "sutil"]),
  A("Katana", "marcial_corpo", 1, ["sutil"]),
  A("Pique", "marcial_corpo", 2, ["pesada", "duas mãos", "alcance"]),
  A("Alabarda", "marcial_corpo", 2, ["pesada", "duas mãos", "alcance"]),
  A("Foice de Guerra", "marcial_corpo", 2, ["duas mãos"]),
  A("Tridente", "marcial_corpo", 1, ["alcance"]),
  A("Chicote de Aço", "marcial_corpo", 1, ["leve", "alcance"]),
  /* marcial à distância */
  A("Arco Longo", "marcial_dist", 2, ["pesada", "duas mãos"]),
  A("Besta Pesada", "marcial_dist", 2, ["pesada", "duas mãos"]),
];

const AR = (nome, cat) => ({ nome, cat });
export const ARMADURAS = [
  AR("Gibão de Couro", "leve"), AR("Couro Batido", "leve"), AR("Manto Encantado", "panos"),
  AR("Hábito Rúnico", "panos"), AR("Veste de Batalha", "leve"),
  AR("Brigantina", "media"), AR("Cota de Malha", "media"), AR("Cota de Escamas", "media"),
  AR("Peitoral de Aço", "media"), AR("Carapaça de Quitina", "media"), AR("Couraça Antiga", "media"),
  AR("Armadura de Placas", "pesada"), AR("Loriga Segmenteira", "pesada"), AR("Armadura de Couro de Dragão", "pesada"),
];

/* ---------------- DEDUÇÃO PELO NOME ----------------
   O gerador de loot cria "Espada Longa Flamejante da Víbora". A base
   continua sendo Espada Longa — e é ela que decide a categoria. */
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

const PISTAS_ARMA = [
  { rx: /(cajado|varinha|orbe|bastao|báculo|baculo|foco)/, cat: "arcana", mao: 2 },
  { rx: /(montante|espadao|machado duplo|alabarda|pique|arco longo|besta pesada|malho)/, cat: "marcial_corpo", mao: 2 },
  { rx: /(arco|besta|funda|estilingue|zarabatana)/, cat: "simples_dist", mao: 2 },
  { rx: /(adaga|punhal|stiletto|faca|soqueira|clava|porrete|bordao|lanca|lança|machadinha|foice curta)/, cat: "simples_corpo", mao: 1 },
  { rx: /(espada|machado|maca|maça|martelo|mangual|rapieira|cimitarra|katana|sabre|lamina|lâmina|alfanje|tridente|chicote|foice)/, cat: "marcial_corpo", mao: 1 },
];
const PISTAS_ARMADURA = [
  { rx: /(placas|loriga|couraça de aco|couraca de aco|couro de dragao|dragão|plate)/, cat: "pesada" },
  { rx: /(malha|escamas|brigantina|peitoral|couraça|couraca|quitina|lamelar)/, cat: "media" },
  /* "leve" sozinho não serve de pista: "Besta Leve" é arma, não armadura */
  { rx: /(couro|gibao|gibão|acolchoad|batido|armadura leve)/, cat: "leve" },
  { rx: /(manto|habito|hábito|veste|tunica|túnica|robe|panos|seda)/, cat: "panos" },
];

/* A ficha completa de um item: categoria, mãos e propriedades. */
export function fichaDoItem(item) {
  if (!item) return null;
  const nome = typeof item === "string" ? item : item.nome || "";
  const tipo = (typeof item === "object" && item.tipo) || "";
  const n = norm(nome);

  if (tipo === "escudo" || /escudo|broquel|aegis|pavês|paves/.test(n)) {
    return { nome, familia: "escudo", cat: "escudo", rotulo: CAT_ARMADURA.escudo.nome, mao: 1, props: [] };
  }
  /* o `tipo` gravado no item manda; só quando ele falta é que o nome decide.
     Sem esta ordem, "Besta Leve" virava armadura por causa da palavra "leve". */
  if (tipo === "arma" || (!tipo && PISTAS_ARMA.some((p) => p.rx.test(n)))) {
    const exata = ARMAS.find((a) => n.includes(norm(a.nome)));
    if (exata) return { nome, familia: "arma", cat: exata.cat, rotulo: CAT_ARMA[exata.cat].nome, mao: exata.mao, props: exata.props };
    const pista = PISTAS_ARMA.find((p) => p.rx.test(n)) || { cat: "simples_corpo", mao: 1 };
    return { nome, familia: "arma", cat: pista.cat, rotulo: CAT_ARMA[pista.cat].nome, mao: pista.mao, props: [] };
  }
  if (tipo === "armadura" || PISTAS_ARMADURA.some((p) => p.rx.test(n))) {
    const exata = ARMADURAS.find((a) => n.includes(norm(a.nome)));
    const cat = exata ? exata.cat : (PISTAS_ARMADURA.find((p) => p.rx.test(n)) || { cat: "leve" }).cat;
    return { nome, familia: "armadura", cat, rotulo: CAT_ARMADURA[cat].nome, props: [], peso: CAT_ARMADURA[cat].peso };
  }
  /* elmo, botas, anel, amuleto: acessório, sem proficiência */
  return { nome, familia: tipo || "acessorio", cat: "acessorio", rotulo: "acessório", props: [] };
}

/* ---------------- QUEM SABE USAR O QUÊ ----------------
   Base do 5e, adaptada às doze classes da Taverna. */
export const PROFICIENCIAS = {
  "Guerreiro": { armas: ["simples", "marcial"], armaduras: ["leve", "media", "pesada"], escudo: true },
  "Clérigo": { armas: ["simples"], armaduras: ["leve", "media"], escudo: true },
  "Ladino": { armas: ["simples"], armaduras: ["leve"], escudo: false, extras: ["Espada Curta", "Rapieira", "Besta Leve", "Adaga"] },
  "Caçador": { armas: ["simples", "marcial"], armaduras: ["leve", "media"], escudo: true },
  "Monge": { armas: ["simples"], armaduras: [], escudo: false, extras: ["Espada Curta"], semArmadura: true },
  "Bardo": { armas: ["simples"], armaduras: ["leve"], escudo: false, extras: ["Rapieira", "Espada Curta", "Besta Leve"] },
  "Mago": { armas: ["simples"], armaduras: [], escudo: false, extras: ["Adaga", "Cajado de Carvalho", "Varinha Rúnica", "Orbe de Batalha", "Besta Leve"], conjurador: true },
  "Feiticeiro": { armas: ["simples"], armaduras: [], escudo: false, extras: ["Adaga", "Cajado de Carvalho", "Varinha Rúnica", "Orbe de Batalha"], conjurador: true },
  "Bruxo": { armas: ["simples"], armaduras: ["leve"], escudo: false, conjurador: true },
  "Druida": { armas: ["simples"], armaduras: ["leve", "media"], escudo: true, conjurador: true, semMetal: true },
  "Engenheiro": { armas: ["simples"], armaduras: ["leve", "media"], escudo: false, extras: ["Besta Leve", "Besta Pesada"] },
  "Invocador": { armas: ["simples"], armaduras: ["leve"], escudo: false, conjurador: true },
};

export function proficienciaDe(classe) {
  return PROFICIENCIAS[classe] || { armas: ["simples"], armaduras: ["leve"], escudo: false };
}

/* Todas as proficiências do herói — multiclasse SOMA (quem abriu guerreiro
   aprendeu a usar armadura pesada, e não desaprende ao virar mago também). */
export function proficienciasDoHeroi(pers, ranks) {
  const classes = new Set([pers && pers.classe, ...Object.keys(ranks || {})].filter(Boolean));
  const out = { armas: new Set(), armaduras: new Set(), escudo: false, extras: new Set(), conjurador: false, semArmadura: false, semMetal: false };
  for (const c of classes) {
    const p = proficienciaDe(c);
    (p.armas || []).forEach((x) => out.armas.add(x));
    (p.armaduras || []).forEach((x) => out.armaduras.add(x));
    (p.extras || []).forEach((x) => out.extras.add(norm(x)));
    if (p.escudo) out.escudo = true;
    if (p.conjurador) out.conjurador = true;
    if (p.semArmadura) out.semArmadura = true;
    if (p.semMetal) out.semMetal = true;
  }
  return out;
}

/* ---------------- PODE USAR? ----------------
   Devolve sempre um veredito com PENALIDADE, não um "não". A ideia é que
   o jogador possa insistir e sentir o preço — como no 5e, onde vestir
   armadura sem treino não é proibido, é ruim. */
export function avaliarEquipar(pers, item, ranks) {
  const f = fichaDoItem(item);
  if (!f) return { pode: false, motivo: "item desconhecido", penalidades: [] };
  const prof = proficienciasDoHeroi(pers, ranks);
  const nomeN = norm(f.nome);
  const penalidades = [];

  if (f.familia === "arma") {
    const classeArma = CAT_ARMA[f.cat] ? CAT_ARMA[f.cat].classe : "simples";
    const temExtra = [...prof.extras].some((e) => nomeN.includes(e));
    if (!prof.armas.has(classeArma) && !temExtra) {
      penalidades.push({ tipo: "desvantagem", texto: `você não tem treino em ${CAT_ARMA[f.cat].nome}: ataques com desvantagem e sem bônus de proficiência` });
    }
    if (f.props.includes("pesada") && (pers.atributos?.forca || 0) < 2) {
      penalidades.push({ tipo: "desvantagem", texto: "arma pesada demais para a sua força: desvantagem no ataque" });
    }
    return { pode: true, ficha: f, penalidades, aviso: penalidades.length ? penalidades[0].texto : "" };
  }

  if (f.familia === "armadura" || f.familia === "escudo") {
    const cat = f.familia === "escudo" ? "escudo" : f.cat;
    if (cat === "panos") return { pode: true, ficha: f, penalidades: [], aviso: "" };
    const treinado = cat === "escudo" ? prof.escudo : prof.armaduras.has(cat);
    if (!treinado) {
      penalidades.push({ tipo: "desvantagem", texto: `sem treino em ${cat === "escudo" ? "escudo" : CAT_ARMADURA[cat].nome}: desvantagem em ataque, furtividade e testes de corpo` });
      if (prof.conjurador) penalidades.push({ tipo: "sem_magia", texto: "você NÃO consegue conjurar vestindo isto" });
    }
    if (cat === "pesada" && (pers.atributos?.forca || 0) < (CAT_ARMADURA.pesada.exigeForca || 3)) {
      penalidades.push({ tipo: "lento", texto: `armadura pesada exige Força +${CAT_ARMADURA.pesada.exigeForca}: seu deslocamento cai` });
    }
    if (prof.semMetal && /placas|malha|aco|aço|ferro|escamas|loriga|metal/.test(nomeN)) {
      penalidades.push({ tipo: "juramento", texto: "druidas não vestem metal — usar isto quebra o seu voto" });
    }
    if (prof.semArmadura && cat !== "panos") {
      penalidades.push({ tipo: "sem_defesa", texto: "o monge perde a Defesa sem Armadura enquanto estiver vestindo isto" });
    }
    return { pode: true, ficha: f, penalidades, aviso: penalidades.length ? penalidades[0].texto : "" };
  }

  return { pode: true, ficha: f, penalidades: [], aviso: "" };
}

/* O que está pesando AGORA no herói — lido do que ele tem equipado. */
export function penalidadesAtivas(pers, ranks) {
  const eq = (pers && pers.equipados) || {};
  const out = [];
  for (const [slot, item] of Object.entries(eq)) {
    if (!item) continue;
    const av = avaliarEquipar(pers, item, ranks);
    for (const p of av.penalidades) out.push({ slot, item: item.nome, ...p });
  }
  return out;
}

export function conjuracaoBloqueada(pers, ranks) {
  return penalidadesAtivas(pers, ranks).some((p) => p.tipo === "sem_magia");
}

/* ---------------- O QUE A CLASSE COMEÇA USANDO ----------------
   Serve à criação de personagem e ao craft: o que faz sentido para você. */
export function armasRecomendadas(classe) {
  const p = proficienciaDe(classe);
  const ok = new Set(p.armas || []);
  const extras = (p.extras || []).map(norm);
  return ARMAS.filter((a) => ok.has(CAT_ARMA[a.cat].classe) || extras.some((e) => norm(a.nome).includes(e)));
}
export function armadurasRecomendadas(classe) {
  const p = proficienciaDe(classe);
  const ok = new Set([...(p.armaduras || []), "panos"]);
  return ARMADURAS.filter((a) => ok.has(a.cat));
}

export function resumoProficienciaPrompt(pers, ranks) {
  if (!pers) return "";
  const prof = proficienciasDoHeroi(pers, ranks);
  const pen = penalidadesAtivas(pers, ranks);
  const treino = `Treino: ${[...prof.armas].join(" e ") || "nenhuma"} em armas; ${[...prof.armaduras].join(", ") || "nenhuma"} em armadura${prof.escudo ? "; escudo" : ""}.`;
  if (!pen.length) return `EQUIPAMENTO: ${treino}`;
  return `EQUIPAMENTO: ${treino} ATENÇÃO — o herói está usando o que não sabe usar: ${pen.map((p) => `${p.item} (${p.texto})`).join("; ")}. Isso é FATO mecânico: narre o desconforto, o peso, a manga que atrapalha o gesto — e nunca deixe passar como se estivesse tudo bem.`;
}

export const ITENS_PROMPT = `ARMAS E ARMADURAS (v9.11 — o sistema decide, você narra):
- Cada arma é simples ou marcial; cada armadura é leve, média ou pesada. Cada classe sabe usar um conjunto — o guerreiro veste placas e empunha montante, o mago fica na adaga e no cajado, o ladino em armadura leve e lâminas sutis.
- Usar o que não se sabe usar NÃO é proibido: é caro. O sistema aplica desvantagem, perda de proficiência, deslocamento reduzido — e, para conjuradores em armadura sem treino, a IMPOSSIBILIDADE de conjurar. Quando o envelope avisar que o herói está mal-equipado, narre isso com honestidade: o gesto que não sai, o peso que atrasa, a lâmina grande demais para o pulso.
- Você NUNCA concede nem retira proficiência, e nunca deixa um mago sair conjurando de dentro de uma armadura de placas porque a cena ficaria bonita.`;
