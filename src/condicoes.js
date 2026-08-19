/* ============================================================
   CONDIÇÕES (v9.0) — o vocabulário único de estados — Taverna

   O problema que este módulo resolve: o Mestre narrava "você está
   envenenado" e o sistema não sabia de nada; o sistema aplicava
   "Atordoado" e o Mestre narrava o herói agindo normalmente. Duas
   verdades sobre o mesmo corpo.

   Agora existe UM catálogo. Toda condição — venha do Mestre, do
   combate, de um milagre ou da própria narração — é NORMALIZADA
   para um id daqui, e é daqui que saem os efeitos mecânicos. O
   Mestre não decide mais o que uma condição faz: ele descreve o
   que o sistema já aplicou.
   ============================================================ */

/* ---------------- O CATÁLOGO ----------------
   Campos mecânicos (o que o CÓDIGO faz com a condição):
     vantagem/desvantagem → nas rolagens de quem a carrega
     perdeAcao            → não age no turno (o combate já respeita)
     danoTurno            → dano por turno enquanto durar
     danoExtra/danoReduzido → no dano causado
     defesa               → soma na CA
     turnos               → duração padrão (null = até algo tirá-la)
     saiCom               → ["curto","longo","cura"] o que a remove
     resistir             → teste que o SISTEMA rola quando ELE aplica
     aliases              → como a ficção costuma chamar isso
*/
export const CONDICOES = {
  /* ---- ruins ---- */
  envenenado: {
    id: "envenenado", rotulo: "Envenenado", icone: "🧪", tipo: "ruim",
    turnos: 4, desvantagem: true, danoTurno: 2, saiCom: ["longo", "cura"],
    resistir: { attr: "vigor", dif: 12 }, subst: "veneno|peçonha",
    desc: "Desvantagem nas rolagens e 2 de dano por turno.",
    aliases: [/envenenad/, /intoxicad/, /veneno (corre|se espalha|toma|sobe|queima)/, /peçonha/],
  },
  sangrando: {
    id: "sangrando", rotulo: "Sangrando", icone: "🩸", tipo: "ruim",
    turnos: 3, danoTurno: 3, saiCom: ["curto", "longo", "cura"], subst: "sangramento|hemorragia|sangria",
    desc: "3 de dano por turno até estancar.",
    aliases: [/sangrand/, /sangra (muito|sem parar|de|pelo|pela)/, /hemorragia/, /sangue (jorra|escorre|não para|encharca)/, /ferida aberta/],
  },
  queimando: {
    id: "queimando", rotulo: "Queimando", icone: "🔥", tipo: "ruim",
    turnos: 2, danoTurno: 4, saiCom: ["curto", "longo"], subst: "fogo|chamas|queimadura",
    resistir: { attr: "agilidade", dif: 12 },
    desc: "4 de dano por turno enquanto o fogo pega.",
    aliases: [/em chamas/, /queimand/, /pegando fogo/, /fogo (lambe|consome|se alastra)/],
  },
  atordoado: {
    id: "atordoado", rotulo: "Atordoado", icone: "💫", tipo: "ruim",
    turnos: 1, perdeAcao: true, subst: "atordoamento|tontura",
    resistir: { attr: "vigor", dif: 13 },
    desc: "Perde a ação: não ataca nem age neste turno.",
    aliases: [/atordoad/, /zonz/, /sem conseguir reagir/, /a cabeça (gira|roda)/, /desnortead/],
  },
  paralisado: {
    id: "paralisado", rotulo: "Paralisado", icone: "🥶", tipo: "ruim",
    turnos: 2, perdeAcao: true, subst: "paralisia",
    resistir: { attr: "vigor", dif: 14 },
    desc: "Corpo travado: perde a ação enquanto durar.",
    aliases: [/paralisad/, /imobilizad/, /congelad/, /petrificad/, /não consegue (se mover|mexer)/],
  },
  caido: {
    id: "caido", rotulo: "Caído", icone: "🤕", tipo: "ruim",
    turnos: 1, desvantagem: true,
    desc: "No chão: desvantagem até levantar.",
    aliases: [/derrubad/, /cai de costas/, /vai ao chão/, /caíd[oa] no chão/],
  },
  agarrado: {
    id: "agarrado", rotulo: "Agarrado", icone: "🕸", tipo: "ruim",
    turnos: 2, desvantagem: true,
    resistir: { attr: "forca", dif: 12 },
    desc: "Preso: desvantagem e sem sair do lugar.",
    aliases: [/agarrad/, /enredad/, /preso (pel|n[ao])/, /imprensad/, /teia/],
  },
  cego: {
    id: "cego", rotulo: "Cego", icone: "🌑", tipo: "ruim",
    turnos: 2, desvantagem: true, saiCom: ["curto", "longo", "cura"],
    desc: "Sem enxergar: desvantagem, e quem te ataca tem vantagem.",
    aliases: [/cegad/, /sem enxergar/, /vista (some|apaga|turva)/, /escuridão total/],
  },
  amedrontado: {
    id: "amedrontado", rotulo: "Amedrontado", icone: "😨", tipo: "ruim",
    turnos: 3, desvantagem: true, subst: "medo|pavor|terror",
    resistir: { attr: "vontade", dif: 12 },
    desc: "Medo dominante: desvantagem em tudo.",
    aliases: [/amedrontad/, /apavorad/, /aterrorizad/, /pavor (toma|domina)/, /gelad[oa] de medo/],
  },
  enfeiticado: {
    id: "enfeiticado", rotulo: "Enfeitiçado", icone: "💜", tipo: "ruim",
    turnos: 3, desvantagem: true, saiCom: ["cura"],
    resistir: { attr: "vontade", dif: 13 },
    desc: "Vontade capturada: desvantagem e obediência ao encantador.",
    aliases: [/enfeitiçad/, /encantad[oa] pel/, /hipnotizad/, /dominad[oa] pel/],
  },
  enfraquecido: {
    id: "enfraquecido", rotulo: "Enfraquecido", icone: "💧", tipo: "ruim",
    turnos: 3, desvantagem: true, danoReduzido: 2, saiCom: ["longo"],
    desc: "Desvantagem e −2 no dano causado.",
    aliases: [/enfraquecid/, /sem forças/, /força (drenada|sugada)/, /debilitad/],
  },
  lento: {
    id: "lento", rotulo: "Lento", icone: "🐌", tipo: "ruim",
    turnos: 3, desvantagem: true,
    desc: "Movimentos pesados: desvantagem enquanto durar.",
    aliases: [/lentidão/, /movimentos (pesados|arrastad)/, /o tempo (arrasta|pesa)/],
  },
  exausto: {
    id: "exausto", rotulo: "Exausto", icone: "😵", tipo: "ruim",
    turnos: null, desvantagem: true, saiCom: ["longo"],
    desc: "Desvantagem até um descanso longo.",
    aliases: [/exaust/, /esgotad/, /não aguenta mais de cansaço/],
  },

  /* ---- boas ---- */
  abencoado: {
    id: "abencoado", rotulo: "Abençoado", icone: "✨", tipo: "bom",
    turnos: 5, vantagem: true,
    desc: "Vantagem nas rolagens.",
    aliases: [/abençoad/, /bênção (desce|toca|cobre)/, /graça divina/],
  },
  inspirado: {
    id: "inspirado", rotulo: "Inspirado", icone: "🎵", tipo: "bom",
    turnos: 3, vantagem: true,
    desc: "Vantagem nas rolagens.",
    aliases: [/inspirad/, /coragem renovada/],
  },
  fortalecido: {
    id: "fortalecido", rotulo: "Fortalecido", icone: "💪", tipo: "bom",
    turnos: 4, danoExtra: 2,
    desc: "+2 no dano causado.",
    aliases: [/fortalecid/, /força sobre-?humana/, /músculos (ardem|incham) de poder/],
  },
  enfurecido: {
    id: "enfurecido", rotulo: "Enfurecido", icone: "😤", tipo: "bom",
    turnos: 3, vantagem: true, danoExtra: 2,
    desc: "Vantagem e +2 no dano — mas é fúria, não estratégia.",
    aliases: [/enfurecid/, /fúria (toma|domina|explode)/, /sangue ferve/],
  },
  apressado: {
    id: "apressado", rotulo: "Apressado", icone: "💨", tipo: "bom",
    turnos: 3, vantagem: true,
    desc: "Velocidade sobrenatural: vantagem nas rolagens.",
    aliases: [/apressad/, /acelerad/, /rápido como/],
  },
  furtivo: {
    id: "furtivo", rotulo: "Furtivo", icone: "👤", tipo: "bom",
    turnos: 3, vantagem: true,
    desc: "Escondido: vantagem enquanto não for notado.",
    aliases: [/furtiv/, /nas sombras, sem ser vist/, /escondid[oa] de todos/],
  },
  protegido: {
    id: "protegido", rotulo: "Protegido", icone: "🛡", tipo: "bom",
    turnos: 4, defesa: 2,
    desc: "+2 de defesa.",
    aliases: [/protegid[oa] por/, /escudo (mágico|arcano|divino)/, /barreira (envolve|cobre)/],
  },
  concentrado: {
    id: "concentrado", rotulo: "Concentrado", icone: "🎯", tipo: "bom",
    turnos: null, concentracao: true,
    desc: "Mantendo um efeito: levar dano pode quebrar.",
    aliases: [/concentrad[oa] (em|no|na)/],
  },
};

export const listaCondicoes = () => Object.values(CONDICOES);
export const condicaoPorId = (id) => CONDICOES[String(id || "").toLowerCase()] || null;

/* ---------------- NORMALIZAÇÃO ----------------
   "Envenenado gravemente", "envenenamento", "POISONED", "atordoada"…
   tudo vira o mesmo id. Sem isso, cada sinônimo do Mestre criava uma
   condição nova e sem efeito mecânico nenhum. */
const semAcento = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export function normalizarCondicao(nome) {
  const n = semAcento(nome).trim();
  if (!n) return null;
  /* 1) id exato */
  for (const c of listaCondicoes()) if (semAcento(c.id) === n || semAcento(c.rotulo) === n) return c;
  /* 2) raiz da palavra (envenenad-o/-a/-amente, atordoad-o/-a…) */
  for (const c of listaCondicoes()) {
    const raiz = semAcento(c.rotulo).replace(/[oa]$/, "");
    if (raiz.length >= 4 && n.includes(raiz)) return c;
  }
  /* 3) apelidos da ficção */
  for (const c of listaCondicoes()) {
    for (const re of c.aliases || []) {
      const reSemAcento = new RegExp(semAcento(re.source), "i");
      if (reSemAcento.test(n)) return c;
    }
  }
  return null;
}

/* Cria a instância que vai para a ficha: mecânica do catálogo + contexto. */
export function criarCondicao(idOuNome, { turnos, origem } = {}) {
  const c = condicaoPorId(idOuNome) || normalizarCondicao(idOuNome);
  if (!c) return null;
  return {
    id: c.id,
    nome: c.rotulo,
    icone: c.icone,
    tipo: c.tipo,
    turnos: turnos != null ? Math.max(1, Math.min(20, Math.round(turnos))) : c.turnos,
    efeito: c.desc,
    origem: origem || "",
  };
}

/* ---------------- A MECÂNICA (fonte única) ----------------
   Combate, rolagens e HUD leem daqui — ninguém mais adivinha por
   substring o que "Congelado" faz. */
export function mecanicaDe(condicoes = []) {
  const m = { vantagem: false, desvantagem: false, perdeAcao: false, danoTurno: 0, danoExtra: 0, danoReduzido: 0, defesa: 0, motivos: [] };
  for (const inst of condicoes || []) {
    const c = condicaoPorId(inst.id) || normalizarCondicao(inst.nome || inst.id || "");
    if (!c) continue;
    if (c.vantagem) { m.vantagem = true; m.motivos.push(`${c.rotulo}: vantagem`); }
    if (c.desvantagem) { m.desvantagem = true; m.motivos.push(`${c.rotulo}: desvantagem`); }
    if (c.perdeAcao) { m.perdeAcao = true; m.motivos.push(`${c.rotulo}: perde a ação`); }
    if (c.danoTurno) { m.danoTurno += c.danoTurno; }
    if (c.danoExtra) { m.danoExtra += c.danoExtra; }
    if (c.danoReduzido) { m.danoReduzido += c.danoReduzido; }
    if (c.defesa) { m.defesa += c.defesa; }
  }
  return m;
}

/* Vantagem e desvantagem juntas se cancelam (5e) — o HUD mostra o líquido. */
export function estadoDeRolagem(condicoes = []) {
  const m = mecanicaDe(condicoes);
  if (m.vantagem && m.desvantagem) return { rotulo: "neutro", vantagem: false, desvantagem: false };
  if (m.vantagem) return { rotulo: "vantagem", vantagem: true, desvantagem: false };
  if (m.desvantagem) return { rotulo: "desvantagem", vantagem: false, desvantagem: true };
  return { rotulo: "neutro", vantagem: false, desvantagem: false };
}

/* ---------------- PASSAGEM DE TURNO ----------------
   Decrementa, cobra o dano-por-turno e devolve o que expirou. */
export function tickCondicoes(condicoes = []) {
  const vivas = [], expiradas = [];
  let dano = 0;
  const fontes = [];
  for (const inst of condicoes || []) {
    const c = condicaoPorId(inst.id) || normalizarCondicao(inst.nome || "");
    if (c && c.danoTurno) { dano += c.danoTurno; fontes.push(c.rotulo); }
    if (inst.turnos == null || isNaN(Number(inst.turnos))) { vivas.push({ ...inst, turnos: null }); continue; }
    const t = Number(inst.turnos) - 1;
    if (t <= 0) expiradas.push(inst);
    else vivas.push({ ...inst, turnos: t });
  }
  return { condicoes: vivas, expiradas, dano, fontes };
}

/* O que um descanso limpa (o catálogo manda, não a ficção). */
export function limparPorDescanso(condicoes = [], tipo = "curto") {
  const ficam = [], saem = [];
  for (const inst of condicoes || []) {
    const c = condicaoPorId(inst.id) || normalizarCondicao(inst.nome || "");
    const sai = c ? (c.saiCom || []).includes(tipo) || (tipo === "longo" && c.tipo === "ruim" && (c.saiCom || []).length === 0) : tipo === "longo";
    (sai ? saem : ficam).push(inst);
  }
  return { condicoes: ficam, removidas: saem };
}

/* ---------------- ONDE MORAVA O CÃO DE GUARDA (v9.49) ----------------
   Aqui viviam `detectarCondicoesNarradas` e `detectarAliviosNarrados`: o
   sistema lia a narração do Mestre atrás de condições que ele tivesse
   descrito e esquecido de registrar, e aplicava sozinho.

   A ideia era boa — a ficção virando mecânica em vez de enfeite — e a
   prática entregou isto: "sente o ar quente ainda PRESO NA garganta"
   virou Agarrado, dois turnos de desvantagem por uma metáfora. Não era
   o regex: prosa não é ficha. O mesmo verbo que prende o herói numa
   teia prende o ar na garganta dele.

   As condições agora vêm de três lugares, todos do código: o combate
   (`aflicoes.js`), o tempo (`tickCondicoes` e `limparPorDescanso`, logo
   acima) e a falha crítica num teste (`consequencias.js`).

   Os `aliases` do catálogo continuam servindo: `normalizarCondicao` os usa
   para casar o nome que o combate produz com o id certo. */

/* ---------------- O QUE O MESTRE LÊ ----------------
   Vai no rodapé de TODO turno: enquanto houver condição ativa, ele não
   tem como narrar o herói inteiro por engano. */
export function resumoCondicoesPrompt(pers, grupo = []) {
  const minhas = (pers && pers.condicoes) || [];
  const linhas = [];
  if (minhas.length) {
    const est = estadoDeRolagem(minhas);
    const m = mecanicaDe(minhas);
    linhas.push(`MINHAS CONDIÇÕES AGORA (fato do sistema — narre-as, nunca as ignore nem invente outras): ${minhas.map((c) => `${c.icone || ""} ${c.nome}${c.turnos ? ` (${c.turnos}t)` : ""} — ${c.efeito || ""}`).join("; ")}.${est.rotulo !== "neutro" ? ` Rolagens com ${est.rotulo.toUpperCase()}.` : ""}${m.perdeAcao ? " ATENÇÃO: estou IMPOSSIBILITADO DE AGIR neste turno — não me faça atacar, correr nem conversar como se nada houvesse." : ""}${m.danoTurno ? ` Perco ${m.danoTurno} PV por turno enquanto isso durar (o sistema cobra).` : ""}`);
  }
  const comCond = (grupo || []).filter((c) => c && (c.condicoes || []).length);
  if (comCond.length) {
    linhas.push(`CONDIÇÕES DO GRUPO: ${comCond.map((c) => `${c.nome}: ${(c.condicoes || []).map((x) => x.nome).join(", ")}`).join(" · ")}.`);
  }
  return linhas.join("\n");
}

export const CONDICOES_PROMPT = `CONDIÇÕES E EFEITOS (v9.49 — o sistema aplica, você narra):
- Existe um catálogo fechado de condições: ${listaCondicoes().map((c) => c.rotulo).join(", ")}. Elas são MECÂNICA, com duração e efeito numérico, e são do SISTEMA.
- VOCÊ NÃO APLICA NEM REMOVE CONDIÇÃO — não existe campo para isso e não existe frase que faça isso. Só três coisas põem uma condição em alguém: o combate (o sistema rola a aflição da arma, da magia ou do bicho), o tempo (o turno que vence, o descanso que limpa) e a FALHA CRÍTICA num teste. Nenhuma delas passa por você.
- Quando a cena pedir uma consequência mecânica — a teia que prende, o veneno da taça, o degrau que cede —, NARRE o perigo acontecendo e repita-o em UMA frase no campo "perigo". Você não pede rolagem nenhuma: o sistema lê a frase, escolhe a salvaguarda, rola, cobra e aplica. Descrever a teia caindo é seu; dizer que ela prendeu, não.
- Também não descreva alguém "envenenado", "atordoado", "sangrando", "cego" ou "paralisado" como estado de ficha se o envelope não disser que ele está: isso é afirmar mecânica que não existe. Descreva a cena, não o estado.
- O caminho inverso vale igual: as condições ATIVAS chegam a você no rodapé de cada turno, e são fato. Enquanto o herói estiver ATORDOADO ou PARALISADO ele NÃO age — narre o corpo que não obedece, jamais uma ação normal. Enquanto estiver ENVENENADO ou SANGRANDO, mostre o preço disso na cena. E nunca anuncie que uma condição passou: quem a tira é o relógio, o descanso ou a cura.`;
