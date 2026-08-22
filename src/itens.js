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

/* ---------------- O QUE SE TROCA COM UMA LUTA CORRENDO (v9.100) ----------------
   Anotado na v9.99 e verdadeiro desde sempre: dava para vestir armadura
   completa no meio da briga. A ficha abre com um toque, o slot troca, a
   defesa sobe, e a rodada seguinte encontra o herói de placas.

   O remendo NÃO é proibir de equipar — esta casa já decidiu, na v9.13,
   que abrir a bolsa não custa o turno, e voltar atrás disso seria
   desmanchar uma decisão boa por causa de outra. O remendo é o relógio:
   uma rodada tem SEIS SEGUNDOS, e o que não cabe em seis segundos não
   cabe numa rodada.

   Empunhar uma arma cabe. Enfiar um anel cabe. Afivelar um elmo, apertar
   as correias de um escudo, calçar botas e — principalmente — vestir uma
   armadura de placas, que ninguém veste sozinho, não cabem. Não é uma
   regra nova: é a mesma régua do 5e (arma é interação de objeto,
   armadura leva minutos), escrita aqui em segundos porque em segundos
   ela se explica sozinha ao jogador.

   Fora de combate continua tudo livre, como sempre foi. */
export const SEGUNDOS_DA_RODADA = 6;
export const TROCA_DE_SLOT = {
  arma: { segundos: 1, como: "empunhar é um gesto de mão" },
  anel: { segundos: 2, como: "um anel entra num dedo" },
  amuleto: { segundos: 3, como: "passa pela cabeça e pronto" },
  escudo: { segundos: 60, como: "as correias passam pelo braço e apertam com a outra mão" },
  elmo: { segundos: 60, como: "a fivela é debaixo do queixo, e você precisa das duas mãos" },
  botas: { segundos: 120, como: "é preciso sentar e calçar" },
  armadura: { segundos: 600, como: "as fivelas são nas costas — ninguém veste uma armadura sozinho, e ninguém a veste de pé no meio de uma briga" },
};
export function trocaDeSlot(slot) {
  return TROCA_DE_SLOT[String(slot || "")] || TROCA_DE_SLOT.arma;
}
export function podeTrocarAgora(slot, { emCombate = false } = {}) {
  const t = trocaDeSlot(slot);
  if (!emCombate || t.segundos <= SEGUNDOS_DA_RODADA) return { ok: true, motivo: "", segundos: t.segundos };
  return {
    ok: false,
    segundos: t.segundos,
    motivo: `isso não se troca no meio da luta: ${t.como}, e uma rodada tem ${SEGUNDOS_DA_RODADA} segundos`,
  };
}

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

/* ============================================================
   O DADO DA ARMA E A LÂMINA SUTIL (v9.45)

   Até aqui a arma quase não importava. `danoDe` somava um d4 fixo
   mais o MAIOR entre Força e Destreza, para todo mundo e em toda
   arma — o montante e a adaga batiam igual, e a propriedade "sutil"
   do catálogo era decoração, porque a finesse já valia para tudo.

   Duas mudanças que só fazem sentido juntas:

   1. CADA ARMA TEM SEU DADO. É o que transforma escolher arma em
      decisão: o montante bate 2d6 e ocupa as duas mãos; a adaga bate
      1d4 e cabe em qualquer lugar.

   2. SUTIL VOLTA A SER UMA PROPRIEDADE. Corpo a corpo usa FORÇA;
      arma sutil (adaga, rapieira, espada curta, cimitarra, katana,
      stiletto, chicote) e arma à distância usam o melhor entre Força
      e Destreza. Sem o passo 1 isso seria só uma perda: o duelista
      de Destreza perderia o machado e não ganharia nada em troca.
      Com ele, a rapieira (1d8, sutil) passa a ser a arma que ela
      sempre deveria ter sido.

   O FOCO ARCANO conta como sutil de propósito. Cajado e orbe não são
   armas de músculo, e obrigar o mago a ter Força para bater com o
   bastão seria cobrar dele um atributo que a classe inteira despreza.
   ============================================================ */

/* {n, faces} — quantos dados e de quantas faces. Sai da CATEGORIA,
   ajustado pelas propriedades: leve desce, pesada/duas mãos sobe. */
export function danoDaArma(item) {
  const f = item ? fichaDoItem(item) : null;
  if (!f || f.familia !== "arma") return { n: 1, faces: 2, texto: "1d2", rotulo: "desarmado" };
  const props = f.props || [];
  const leve = props.includes("leve");
  const duasMaos = props.includes("duas mãos");
  const pesada = props.includes("pesada");
  const marcial = (CAT_ARMA[f.cat] || {}).classe === "marcial";

  if (f.cat === "arcana") return { n: 1, faces: leve ? 4 : 6, texto: leve ? "1d4" : "1d6", rotulo: "foco arcano" };
  const aDistancia = !!(CAT_ARMA[f.cat] || {}).distancia;
  if (pesada && duasMaos) {
    /* 2d6 é o dado do MONTANTE — peso movido pelos ombros. Arco longo e besta
       pesada também são "pesada, duas mãos" no catálogo, e por isso a
       distinção tem de estar aqui: o que a corda entrega é 1d10, não o
       balanço de uma lâmina de dois gumes. */
    const dado = (marcial && !aDistancia) ? { n: 2, faces: 6, texto: "2d6" } : { n: 1, faces: 10, texto: "1d10" };
    return { ...dado, rotulo: aDistancia ? "arma pesada de longo alcance" : "arma pesada de duas mãos" };
  }
  if (duasMaos) return { n: 1, faces: marcial ? 10 : 8, texto: marcial ? "1d10" : "1d8", rotulo: "arma de duas mãos" };
  if (leve) return { n: 1, faces: marcial ? 6 : 4, texto: marcial ? "1d6" : "1d4", rotulo: "arma leve" };
  return { n: 1, faces: marcial ? 8 : 6, texto: marcial ? "1d8" : "1d6", rotulo: marcial ? "arma marcial" : "arma simples" };
}

/* Qual atributo entra no golpe: "forca", "destreza" ou "melhor". */
export function atributoDaArma(item) {
  const f = item ? fichaDoItem(item) : null;
  if (!f || f.familia !== "arma") return "forca";           // punho e chute são força
  if ((CAT_ARMA[f.cat] || {}).distancia) return "destreza";  // arco e besta, sempre
  if (f.cat === "arcana") return "melhor";                   // o foco não é músculo
  return (f.props || []).includes("sutil") ? "melhor" : "forca";
}

/* O número que o combate usa, já resolvido contra uma ficha. */
export function modDoGolpe(ent, item) {
  const forca = (ent && ent.atributos && ent.atributos.forca) || 0;
  const dex = (ent && ent.atributos && ent.atributos.destreza) || 0;
  const modo = atributoDaArma(item);
  if (modo === "destreza") return dex;
  if (modo === "forca") return forca;
  return Math.max(forca, dex);
}

/* Uma linha para a bolsa e para a mensagem de equipar: "1d8 · sutil". */
export function fichaDeCombateTexto(item) {
  const f = item ? fichaDoItem(item) : null;
  if (!f || f.familia !== "arma") return "";
  const d = danoDaArma(item);
  const modo = atributoDaArma(item);
  const atr = modo === "destreza" ? "Destreza" : modo === "melhor" ? "Força ou Destreza" : "Força";
  return `${d.texto} · ${atr}${(f.props || []).length ? ` · ${f.props.join(", ")}` : ""}`;
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

export const ITENS_PROMPT = `ARMAS E ARMADURAS (v9.45 — o sistema decide, você narra):
- Cada arma é simples ou marcial; cada armadura é leve, média ou pesada. Cada classe sabe usar um conjunto — o guerreiro veste placas e empunha montante, o mago fica na adaga e no cajado, o ladino em armadura leve e lâminas sutis.
- A ARMA IMPORTA: cada uma tem seu dado (o montante bate 2d6 e ocupa as duas mãos; a adaga bate 1d4 e cabe em qualquer lugar) e pede um atributo. Corpo a corpo é FORÇA, salvo as lâminas SUTIS (adaga, rapieira, espada curta, cimitarra, katana, estilete, chicote) e os focos arcanos, que valem pela Destreza quando ela for maior; arco e besta são sempre Destreza. Narre a diferença — o peso que o golpe carrega, ou a precisão que ele tem —, mas nunca o número.
- Arma de DUAS MÃOS ocupa as duas: quem empunha montante ou arco longo não segura escudo, e o sistema tira um quando o outro entra. Arma de ALCANCE (lança, tridente, alabarda, pique, chicote) espeta de um passo mais longe.
- Usar o que não se sabe usar NÃO é proibido: é caro. O sistema aplica desvantagem, perda de proficiência, deslocamento reduzido — e, para conjuradores em armadura sem treino, a IMPOSSIBILIDADE de conjurar. Quando o envelope avisar que o herói está mal-equipado, narre isso com honestidade: o gesto que não sai, o peso que atrasa, a lâmina grande demais para o pulso.
- Você NUNCA concede nem retira proficiência, e nunca deixa um mago sair conjurando de dentro de uma armadura de placas porque a cena ficaria bonita.`;
