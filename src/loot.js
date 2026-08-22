/* ============================================================
   LOOT PROCEDURAL E FORJA — Taverna
   Itens gerados por TABELA, no app: base + prefixo + sufixo,
   atributos escalados por raridade e nível. A IA não cria mais
   equipamento de vitória — o código gera e ela só descreve.
   Também resolve a forja: desmontar → essência → forjar.
   ============================================================ */

const d = (n) => Math.floor(Math.random() * n);
/* v9.53: mesmo off-by-one de `masmorras.js` — `d(n)` devolve 1..n, então
   `arr[d(arr.length)]` nunca alcançava o índice 0 e caía fora da lista uma
   vez a cada `n`. O primeiro prefixo, o primeiro sufixo e o primeiro poder
   de cada tabela de loot nunca saíram no jogo. */
const sortear = (arr) => (arr && arr.length ? arr[Math.floor(Math.random() * arr.length)] : undefined);

import { TIER as TIER_AFIXO, degrauDe, pesoDoPrefixo, tierDaBase, poderesPossiveis, concessaoPara, resumoDoItem, EFEITOS_DE_ATRIBUTO, CONCESSAO_DA_BASE } from "./afixos.js";

export const RARIDADES = ["comum", "incomum", "raro", "epico", "lendario", "unico"];
export const RARIDADE_ROTULO = { comum: "Comum", incomum: "Incomum", raro: "Raro", epico: "Épico", lendario: "Lendário", unico: "Único" };

/* ---------------- BASES POR SLOT (o coração do item) ----------------
   armas: bonus = dano · defesas: bonus = defesa · acessórios: sem bônus
   fixo (ganham atributo de personagem conforme a raridade) */
export const BASES = {
  arma: [
    { nome: "Espada Longa", dano: 2 }, { nome: "Espada Curta", dano: 1 }, { nome: "Montante", dano: 3 },
    { nome: "Machado de Guerra", dano: 2 }, { nome: "Machadinha", dano: 1 }, { nome: "Machado Duplo", dano: 3 },
    { nome: "Maça Pesada", dano: 2 }, { nome: "Martelo de Batalha", dano: 2 }, { nome: "Mangual", dano: 2 },
    { nome: "Adaga", dano: 1 }, { nome: "Stiletto", dano: 1 }, { nome: "Lâmina Curva", dano: 2 },
    { nome: "Rapieira", dano: 2 }, { nome: "Cimitarra", dano: 2 }, { nome: "Katana", dano: 2 },
    { nome: "Lança", dano: 2 }, { nome: "Pique", dano: 2 }, { nome: "Alabarda", dano: 3 },
    { nome: "Arco Curto", dano: 1 }, { nome: "Arco Longo", dano: 2 }, { nome: "Besta Leve", dano: 2 },
    { nome: "Besta Pesada", dano: 3 }, { nome: "Cajado de Carvalho", dano: 1 }, { nome: "Varinha Rúnica", dano: 1 },
    { nome: "Orbe de Batalha", dano: 2 }, { nome: "Foice de Guerra", dano: 2 }, { nome: "Tridente", dano: 2 },
    { nome: "Chicote de Aço", dano: 1 }, { nome: "Soqueira Cravada", dano: 1 }, { nome: "Clava de Ossos", dano: 1 },
  ],
  escudo: [
    { nome: "Escudo de Madeira", defesa: 1 }, { nome: "Broquel", defesa: 1 }, { nome: "Escudo Redondo", defesa: 1 },
    { nome: "Escudo Torre", defesa: 2 }, { nome: "Escudo Pavês", defesa: 2 }, { nome: "Escudo Estrelado", defesa: 1 },
    { nome: "Escudo de Placas", defesa: 2 }, { nome: "Aegis de Bronze", defesa: 1 }, { nome: "Escudo Espinhado", defesa: 1 },
    { nome: "Escudo Cerimonial", defesa: 1 },
  ],
  armadura: [
    { nome: "Gibão de Couro", defesa: 1 }, { nome: "Couro Batido", defesa: 1 }, { nome: "Brigantina", defesa: 1 },
    { nome: "Cota de Malha", defesa: 2 }, { nome: "Cota de Escamas", defesa: 2 }, { nome: "Peitoral de Aço", defesa: 2 },
    { nome: "Armadura de Placas", defesa: 3 }, { nome: "Loriga Segmenteira", defesa: 2 }, { nome: "Manto Encantado", defesa: 1 },
    { nome: "Veste de Batalha", defesa: 1 }, { nome: "Couraça Antiga", defesa: 2 }, { nome: "Carapaça de Quitina", defesa: 2 },
    { nome: "Armadura de Couro de Dragão", defesa: 3 }, { nome: "Hábito Rúnico", defesa: 1 },
  ],
  elmo: [
    { nome: "Capuz de Couro", defesa: 1 }, { nome: "Elmo de Ferro", defesa: 1 }, { nome: "Bacinete", defesa: 1 },
    { nome: "Barbuta", defesa: 1 }, { nome: "Elmo Chifrudo", defesa: 1 }, { nome: "Coroa de Guerra", defesa: 1 },
    { nome: "Tiara Arcana", defesa: 1 }, { nome: "Capacete de Placas", defesa: 1 }, { nome: "Máscara Ritual", defesa: 1 },
    { nome: "Coifa de Malha", defesa: 1 },
  ],
  botas: [
    { nome: "Botas de Couro", defesa: 1 }, { nome: "Grevas de Ferro", defesa: 1 }, { nome: "Botas do Viajante", defesa: 1 },
    { nome: "Sandálias de Couro", defesa: 1 }, { nome: "Botas Aladas", defesa: 1 }, { nome: "Grevas de Placas", defesa: 1 },
    { nome: "Botas Silenciosas", defesa: 1 }, { nome: "Pés de Aço", defesa: 1 }, { nome: "Botas de Pelagem", defesa: 1 },
    { nome: "Sapatos do Saltimbanco", defesa: 1 },
  ],
  anel: [
    { nome: "Anel de Prata" }, { nome: "Anel de Ouro" }, { nome: "Anel de Ossos" }, { nome: "Anel de Sinete" },
    { nome: "Anel Serpente" }, { nome: "Anel de Rubi" }, { nome: "Anel de Safira" }, { nome: "Anel de Jade" },
    { nome: "Anel Farpado" }, { nome: "Anel Gêmeo" }, { nome: "Anel de Obsidiana" }, { nome: "Anel Entrelacado" },
  ],
  amuleto: [
    { nome: "Amuleto de Madeira" }, { nome: "Talismã de Pena" }, { nome: "Pingente de Âmbar" }, { nome: "Relicário Pequeno" },
    { nome: "Colar de Presas" }, { nome: "Medalhão Antigo" }, { nome: "Escapulário" }, { nome: "Pérola Negra" },
    { nome: "Olho de Vidro" }, { nome: "Corda de Nós" }, { nome: "Dente de Serpente" }, { nome: "Estrela de Prata" },
  ],
};

/* ---------------- AFIXOS (nome e alma do item) ---------------- */
/* [masculino, feminino] — a concordância sai certa por tabela */
export const PREFIXOS = [
  ["Afiadíssimo", "Afiadíssima"], ["Pesado", "Pesada"], ["Leve", "Leve"], ["Antigo", "Antiga"],
  ["Rústico", "Rústica"], ["Elegante", "Elegante"], ["Sombrio", "Sombria"], ["Radiante", "Radiante"],
  ["Gélido", "Gélida"], ["Flamejante", "Flamejante"], ["Abençoado", "Abençoada"], ["Amaldiçoado", "Amaldiçoada"],
  ["Rúnico", "Rúnica"], ["Élfico", "Élfica"], ["Anão", "Anã"], ["Orc", "Orc"],
  ["Dracônico", "Dracônica"], ["Celestial", "Celestial"], ["Abissal", "Abissal"], ["Tempestuoso", "Tempestuosa"],
  ["Silencioso", "Silenciosa"], ["Feroz", "Feroz"], ["Real", "Real"], ["Perdido", "Perdida"],
  ["Lendário", "Lendária"], ["Sangrento", "Sangrenta"], ["Dourado", "Dourada"], ["Prateado", "Prateada"],
  ["Sagrado", "Sagrada"], ["Profano", "Profana"],
];

/* sufixo com "de/do/da" — cola no final do nome */
export const SUFIXOS = [
  "do Amanhecer", "do Crepúsculo", "da Meia-Noite", "das Nove Vidas", "do Andarilho",
  "da Tempestade", "do Inverno", "das Cinzas", "do Trovão", "da Lua Cheia",
  "do Caçador", "da Sentinela", "do Rei Caído", "da Rainha Esquecida", "do Juramento",
  "da Vingança", "do Mártir", "das Profundezas", "do Vazio", "da Última Guerra",
  "dos Ancestrais", "do Pacto", "da Serpente", "do Lobo Branco", "da Fênix",
  "do Carrasco", "do Penitente", "das Marés", "do Norte", "da Chama Eterna",
  "do Sussurro", "da Rocha Viva", "dos Mil Golpes", "do Apostata", "da Vigília",
];

/* ---------------- PODERES (raridade alta ganha um efeito nomeado) ---------------- */
const PODERES_POR_SLOT = {
  arma: [
    "Brilha quando perigo se aproxima", "Corta o ar com um zumbido baixo", "Nunca perde o fio",
    "Devolve um clarão a cada golpe certeiro", "Sussurra o nome de quem já matou", "Aquece na presença de magia",
    "Golpes críticos ecoam como trovão", "Pesa menos na mão de quem jura proteger",
  ],
  escudo: [
    "Repele o primeiro susto de cada batalha", "Símbolo que inspira aliados próximos",
    "Não amassa, não importa o golpe", "Reflete a luz como um espelho de guerra",
  ],
  armadura: [
    "Leve como seda, firme como muralha", "Aquece o corpo no frio mortal",
    "As fivelas se fecham sozinhas", "Cheira a cedro e fumaça de batalhas antigas",
  ],
  elmo: [
    "Visão clara mesmo sob chuva e fumaça", "Sussurros de batalhas antigas guiam o portador",
    "Nenhum golpe na cabeça soa tão alto quanto deveria", "A viseira nunca embaça",
  ],
  botas: [
    "Passos que não acordam nem o sono mais leve", "Nunca escorregam em gelo ou lama",
    "Deixam pegadas que se apagam em minutos", "O cansaço da estrada pesa menos",
  ],
  anel: [
    "Aquece quando alguém mente por perto", "Gira sozinho perto de ouro",
    "Pulsa no ritmo do coração do portador", "Gelo ao toque, sempre",
  ],
  amuleto: [
    "Brilha fracamente na escuridão total", "Protege sonhos de intrusos",
    "A corrente nunca se parte", "Guarda o cheiro de casa, onde quer que casa seja",
  ],
};

/* ---------------- BÔNUS POR RARIDADE ----------------
   Escala com o nível do herói para o loot acompanhar a lenda. */
const TIER = { comum: 0, incomum: 1, raro: 2, epico: 3, lendario: 4 };
const ATRIBUTOS_PERSONAGEM = ["forca", "destreza", "vigor", "intelecto", "presenca", "percepcao"];
const ROTULO_ATTR = { forca: "Força", destreza: "Destreza", vigor: "Vigor", intelecto: "Intelecto", presenca: "Presença", percepcao: "Percepção" };

/* Concordância do prefixo com o nome base (gênero e número). */
function concordancia(par, baseNome) {
  const primeiro = (baseNome || "").split(" ")[0];
  const fem = /a(s)?$/i.test(primeiro) || /^(Veste|Aegis|Coifa|Manga)/.test(primeiro);
  const plural = /s$/i.test(primeiro);
  let forma = fem ? par[1] : par[0];
  if (plural) {
    if (/[oa]$/.test(forma)) forma += "s";
    else if (forma === "Anão") forma = "Anões";
    else if (forma === "Anã") forma = "Anãs";
    else if (forma === "Real") forma = "Reais";
    else if (forma === "Celestial") forma = "Celestiais";
    else if (forma === "Abissal") forma = "Abissais";
    else if (forma === "Feroz") forma = "Ferozes";
    /* v9.2: a linha antiga aqui fazia `forma += "" || forma` quando a palavra
       terminava em "e" — e "Elegante" virava "EleganteElegante" na loja. Os
       casos de plural já estão cobertos abaixo. */
    if (forma === "Leve") forma = "Leves";
    else if (["Elegante", "Radiante", "Flamejante"].includes(forma)) forma += "s";
  }
  return forma;
}

/* Gera UM equipamento. raridade: id · nivel: nível do herói (escala o bônus)
   tipo: força um slot ("arma", "anel"…) ou null para sortear. */
export function gerarLoot(raridade = "comum", { tipo = null, nivel = 1, rnd = null } = {}) {
  /* rnd opcional (v9.2): com semente, o mesmo mercador tem sempre o mesmo
     estoque — sem ela, o sorteio é aleatório como sempre foi. */
  const rand = rnd || Math.random;
  const dL = (n) => Math.floor(rand() * n);
  const pickL = (arr) => arr[dL(arr.length)];
  const slot = tipo && BASES[tipo] ? tipo : pickL(Object.keys(BASES));
  const tier = TIER[raridade] ?? 0;
  /* ---------------- O NOME NÃO PROMETE O QUE A RARIDADE NÃO PAGA (v9.80) ----
     "Apareceu no mercado uma bota lendária de asas, e a raridade dela era
     comum." A base era sorteada da lista inteira, com "Botas Aladas" ao
     lado de "Botas de Couro" e o mesmo peso — e nem a base nem o prefixo
     olhavam a raridade. Duas fontes soltas, as duas mentindo.

     O jogador não tem como saber que o nome é decorativo: ele lê "alada"
     e "lendária" e espera asas e lenda. E depois de receber um pedaço de
     couro, todo nome bonito do jogo perde o crédito. */
  const elegiveis = BASES[slot].filter((b) => tierDaBase(b.nome) <= tier);
  /* E O LENDÁRIO PREFERE A BASE QUE JÁ PROMETE O PODER. Sem isto o degrau
     mais alto sorteava "Botas de Couro" e concedia Voo — coerente na
     mecânica e absurdo no nome, que é meia correção do defeito que abriu
     esta versão. A bota que voa deve ser a Bota Alada. */
  const promissoras = degrauDe(raridade).concede ? elegiveis.filter((b) => CONCESSAO_DA_BASE[b.nome]) : [];
  const base = promissoras.length ? pickL(promissoras)
    : elegiveis.length ? pickL(elegiveis)
      : BASES[slot].find((b) => tierDaBase(b.nome) === 0) || BASES[slot][0];
  const escalaNivel = Math.min(3, Math.floor((nivel - 1) / 5)); // +1 a cada 5 níveis, teto +3

  const atributos = {};
  if (base.dano) atributos.dano = base.dano + tier + escalaNivel;
  if (base.defesa) atributos.defesa = base.defesa + Math.floor(tier / 2) + Math.floor(escalaNivel / 2);
  /* acessórios e raridades altas: bônus em atributo de personagem */
  const ehAcessorio = slot === "anel" || slot === "amuleto";
  if (ehAcessorio || tier >= 2) {
    const qtd = ehAcessorio ? Math.max(1, tier) : tier >= 3 ? 2 : 1;
    const pool = [...ATRIBUTOS_PERSONAGEM];
    for (let i = 0; i < qtd && pool.length; i++) {
      const a = pool.splice(dL(pool.length), 1)[0];
      atributos[a] = (atributos[a] || 0) + Math.max(1, Math.min(3, tier + (tier >= 3 ? 1 : 0)));
    }
  }

  /* nome: comum/incomum = base [+ prefixo] · raro+ = prefixo + base + sufixo.
     v9.80: e o PREFIXO tem peso. "Rústico" e "Lendário" estavam na mesma
     lista, sorteados com a mesma chance — era assim que um item comum saía
     "Lendário". Cada palavra agora mora num degrau mínimo, e a régua é a
     que o jogador aplicaria: quanto mais a palavra promete, mais alto ela
     mora. */
  let nome = base.nome;
  const dosMeus = PREFIXOS.filter((p) => pesoDoPrefixo(p) <= tier);
  const comPrefixo = dosMeus.length && (tier >= 2 ? true : tier === 1 ? rand() < 0.6 : rand() < 0.15);
  if (comPrefixo) nome = `${concordancia(pickL(dosMeus), base.nome)} ${base.nome}`;
  if (tier >= 2) nome = `${nome} ${pickL(SUFIXOS)}`;

  /* v6.6 — dano elemental em armas e resistência elemental em defesas (raro+) */
  const ELEMENTOS = ["fogo", "gelo", "raio", "veneno", "sagrado", "sombrio", "arcano"];
  const ROTULO_ELEM = { fogo: "chamas", gelo: "geada", raio: "tempestade", veneno: "toxinas", sagrado: "luz", sombrio: "trevas", arcano: "magia" };
  const ehDefesa = ["escudo", "armadura", "elmo", "botas"].includes(slot);
  let poder = tier >= 2 ? pickL(PODERES_POR_SLOT[slot] || []) : "";
  if (tier >= 2 && slot === "arma" && rand() < 0.35) {
    const el = pickL(ELEMENTOS);
    atributos.elemento = el;
    poder = poder || `A lâmina pulsa com ${ROTULO_ELEM[el]} — o dano é de ${el}.`;
  } else if (tier >= 2 && ehDefesa && rand() < 0.35) {
    const el = pickL(ELEMENTOS);
    atributos.resist = [el];
    poder = poder || `Protege contra ${ROTULO_ELEM[el]} — dano de ${el} reduzido à metade.`;
  }
  const descricao = tier >= 3 ? "Uma peça que já sobreviveu a donos lendários." : tier === 2 ? "Trabalho de mestre artesão." : "";

  /* ---------------- E AGORA A RARIDADE COMPRA ALGUMA COISA (v9.80) --------
     O campo `poder` acima é TEXTO, e sempre foi: nenhuma linha de código o
     consultava. O que valia mecanicamente era só `atributos` — e atributo é
     a mesma coisa em qualquer raridade, só que maior. Era isso que fazia
     escolher item virar escolher número, e escolher número não é escolher.

     `poderes` é a lista que o jogo LÊ. Cada degrau compra a sua, e o
     lendário compra também uma CONCESSÃO: uma habilidade do catálogo posta
     na mão do herói, sem custo de PM. */
  const degrau = degrauDe(raridade);
  const poderes = [];
  {
    const pool = poderesPossiveis(slot, tier).filter((p) => !p.forte || tier >= 2);
    /* o primeiro poder de um item forte é FORTE — sem isto o épico podia
       sair com dois traços menores e valer menos que um raro */
    const fortes = pool.filter((p) => p.forte);
    const usados = new Set();
    for (let i = 0; i < degrau.quantos; i++) {
      /* v9.81: no LENDÁRIO os dois são fortes. O épico compra "dois, e um
         deles pesa"; o lendário não pode sair com um traço menor no
         segundo lugar — "Passo Largo + Passo Leve" numa peça de lenda lê
         como um item bom com um enfeite ao lado. Onde o slot não tiver
         dois fortes, cai no resto e ninguém fica sem poder. */
      const soForte = degrau.forte && (i === 0 || tier >= 4);
      const de = (soForte && fortes.length ? fortes : pool).filter((p) => !usados.has(p.id));
      if (!de.length) break;
      const p = pickL(de);
      usados.add(p.id);
      poderes.push({ id: p.id, nome: p.nome, efeito: p.efeito, diz: p.diz });
      /* efeito de ATRIBUTO é dobrado para dentro de `atributos`, onde
         `bonusEquip` já os soma há versões. Manter uma segunda soma só
         para itens seria criar a régua dupla que este arquivo evita. */
      for (const [k, v] of Object.entries(p.efeito || {})) {
        if (EFEITOS_DE_ATRIBUTO.includes(k)) { atributos[k] = (atributos[k] || 0) + Number(v || 0); continue; }
        /* v9.81: e os dois que também moram em `atributos` sem serem
           atributo — `danos.js` lê a resistência e o tipo elemental direto
           do item equipado, e sempre leu. */
        if (k === "resist") atributos.resist = [...new Set([...(atributos.resist || []), ...(Array.isArray(v) ? v : [v])])];
        else if (k === "elemento") atributos.elemento = v;
      }
    }
  }
  const concede = degrau.concede ? concessaoPara(slot, base.nome, pickL) : "";

  return {
    nome, tipo: slot, raridade, atributos,
    poderes, ...(concede ? { concede } : {}),
    /* `poder` continua existindo porque a ficha, o mercado e o prompt já o
       leem — mas agora ele DESCREVE o que a mecânica faz, em vez de ser
       enfeite solto ao lado dela. */
    poder: resumoDoItem({ poderes, concede }) || poder,
    descricao,
  };
}

/* Raridade do espólio conforme a ameaça do maior inimigo derrotado. */
export function raridadeDeAmeaca(ameaca) {
  const rolagem = Math.random();
  const tabela = {
    fraco: [["comum", 0.7], ["incomum", 1]],
    comum: [["comum", 0.45], ["incomum", 0.9], ["raro", 1]],
    competente: [["comum", 0.2], ["incomum", 0.6], ["raro", 0.95], ["epico", 1]],
    elite: [["incomum", 0.25], ["raro", 0.75], ["epico", 0.97], ["lendario", 1]],
    lendario: [["raro", 0.3], ["epico", 0.8], ["lendario", 1]],
  }[ameaca] || [["comum", 1]];
  for (const [rar, limite] of tabela) if (rolagem < limite) return rar;
  return "comum";
}

/* Espólio de vitória: um item gerado pela ameaça do inimigo mais forte. */
export function gerarEspolioItem(inimigos, nivel = 1) {
  const ordem = { fraco: 0, comum: 1, competente: 2, elite: 3, lendario: 4 };
  const maisForte = (inimigos || []).reduce((m, e) => Math.max(m, ordem[e.ameaca] ?? 1), 1);
  const ameacaMax = Object.keys(ordem).find((k) => ordem[k] === maisForte) || "comum";
  const raridade = raridadeDeAmeaca(ameacaMax);
  return gerarLoot(raridade, { nivel });
}

/* ---------------- FORJA (desmontar → essência → forjar) ---------------- */
/* v9.82: o ÚNICO não entra na forja. Desmontar a única que existe para
   virar pó seria destruir uma peça do mundo por vinte de essência — e
   `essenciaDe` devolvendo zero é o que impede o botão de aparecer. */
export const ESSENCIA_POR_RARIDADE = { comum: 2, incomum: 5, raro: 12, epico: 25, lendario: 60, unico: 0 };
export const CUSTO_FORJA = {
  comum: { essencia: 4, moedas: 0 },
  incomum: { essencia: 10, moedas: 10 },
  raro: { essencia: 25, moedas: 40 },
  epico: { essencia: 55, moedas: 120 },
  lendario: { essencia: 130, moedas: 300 },
};
/* ---------------- O BOTÃO SOBRE O CUSTO QUE NÃO EXISTE (v9.99) ----------------
   Relato: "A forja está com erro undefined is not an object evaluating
   'ae.essencia'". Era isto, e é o bug mais típico desta casa.

   A v9.82 acrescentou "unico" a RARIDADES e DELIBERADAMENTE não o
   acrescentou a CUSTO_FORJA: forjar a única peça do mundo seria
   fabricá-la, e a tabela recusar o único é a regra funcionando. Só que
   a TELA da forja percorria RARIDADES — a lista de todas as raridades
   que existem — e para cada uma lia `CUSTO_FORJA[rar].essencia`. Na
   sexta volta o custo era `undefined`, e a forja inteira morria ao
   abrir: não era o botão do único que quebrava, era o painel.

   A regra ("o único não se forja") morava num só dos dois caminhos.
   Aqui ela passa a morar num lugar só, e quem oferece lê daqui. */
export const RARIDADES_FORJAVEIS = RARIDADES.filter((r) => !!CUSTO_FORJA[r]);
/* v9.82: `??` e não `||` — o único rende ZERO, e `|| 2` transformava esse
   zero de volta em dois. A relíquia voltaria a ser desmontável por engano,
   e o botão da forja apareceria sobre a única peça do mundo que não pode
   virar pó. */
export function essenciaDe(item) { return ESSENCIA_POR_RARIDADE[(item && item.raridade) || "comum"] ?? 2; }

/* ---------------- A SEGUNDA FONTE (v9.54) ----------------
   Desmontar equipamento era a ÚNICA maneira de conseguir essência, e isso
   fechava a forja num círculo: quem não acha equipamento não desmonta, quem
   não desmonta não forja, e quem não forja continua sem achar. O jogador que
   mais precisa da forja é exatamente o que menos consegue usá-la.

   A segunda fonte é o que ele já está fazendo: matar coisa difícil. Bicho
   comum não deixa nada — a essência é o que sobra quando algo com poder
   morre, e é essa a frase que o craft.js já usava para o despojo. Um bando
   de goblins continua rendendo só moeda; um elite deixa resíduo.

   Os números são pequenos de propósito. Uma forja incomum custa 10, e assim
   ela sai de umas três lutas duras ou de um chefe — perto do que custaria
   desmontando, sem virar a fonte principal. */
export const ESSENCIA_POR_AMEACA = { fraco: 0, comum: 0, competente: 1, elite: 3, lendario: 8 };

export function essenciaDeEspolio(inimigos = []) {
  return (inimigos || []).reduce((s, e) => s + (ESSENCIA_POR_AMEACA[e && e.ameaca] || 0), 0);
}

/* O chefe da masmorra deixa mais: é a criatura mais carregada de poder que
   o jogo põe na frente do herói, e o momento em que ele mais quer forjar. */
export function essenciaDoChefe(nivel = 1) {
  return 10 + Math.floor((nivel || 1) * 1.5);
}
export function valorDe(item) {
  const t = TIER[(item && item.raridade) || "comum"] ?? 0;
  return 8 + t * t * 18 + t * 7; // comum 8 · incomum 33 · raro 94 · epico 209 · lendario 396
}
