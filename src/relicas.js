/* ============================================================
   AS RELÍQUIAS (v9.82) — o degrau acima do lendário

   "Podem existir os itens únicos, que são acima dos lendários, e estes
   tenham um poder ativo — tipo 'uma vez ao dia essa lâmina se alimenta
   do seu inimigo e enche seu PV'. Podem existir habilidades únicas que
   só são adquiridas ao adquirir um item único. Assim um personagem
   nível 20 pode conseguir batalhar com um semideus com mais facilidade."

   Três coisas separam uma relíquia de um lendário, e as três importam:

   1. ELA NÃO É SORTEADA — É ESCRITA. O lendário nasce de base +
      prefixo + sufixo, e por isso existem milhares deles. A relíquia
      tem nome próprio, história própria e poderes próprios, escritos à
      mão. Duas campanhas nunca terão a "mesma" Comedora de Reis: terão
      A Comedora de Reis, e ela é uma só.

   2. ELA TEM UM PODER ATIVO. Tudo o que o arsenal da v9.81 concede é
      passivo: vale enquanto está no corpo. A relíquia tem um gesto —
      uma vez por dia, o portador FAZ alguma coisa com ela. É a
      diferença entre carregar poder e usar poder, e é o que dá à peça
      um lugar na memória da campanha.

   3. OS PASSIVOS DELA SÃO DELA. Não saem do catálogo geral: são
      escritos junto com a peça, e não aparecem em item nenhum. É o que
      a frase "habilidades únicas que só são adquiridas ao adquirir um
      item único" pede, ao pé da letra.

   ------------------------------------------------------------
   A TRAVA, e é a mesma da v9.80 — a única que impede tudo isto de
   virar enfeite: TODO CAMPO DE EFEITO TEM DE TER UM LEITOR. Os
   passivos falam o vocabulário de `afixos.js` (lido pelos leitores das
   dádivas); o ativo fala um vocabulário próprio, pequeno e fechado,
   aplicado por `usarAtivo` — que é uma função pura, do mesmo formato
   de `usarConsumivel`: recebe a ficha, devolve a ficha mexida e a
   linha que o jogador lê.

   E A PIMENTA É MEDIDA. Uma relíquia deve fazer um nível 20 encarar um
   semideus com mais chance — não com garantia. Por isso o ativo é UMA
   VEZ POR DIA e nunca resolve a luta sozinho: ele devolve fôlego,
   compra um turno, tira uma condição. Quem ganha a luta continua sendo
   quem jogou melhor.
   ============================================================ */

import { criarCondicao } from "./condicoes.js";

const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

/* ---------------- O CATÁLOGO ----------------
   `poderes` são passivos e falam o vocabulário de `afixos.js`.
   `ativo` é o gesto, uma vez por dia, aplicado por `usarAtivo`. */
export const RELIQUIAS = [
  {
    id: "comedora", nome: "A Comedora de Reis", tipo: "arma", icone: "🗡",
    historia: "Foi forjada para matar um só homem, e matou. Continua com fome.",
    poderes: [
      { id: "fome_antiga", nome: "Fome Antiga", efeito: { danoExtra: 5, criticoEm: 18 }, diz: "Ela não corta para ferir: corta para tirar." },
      { id: "peso_da_coroa", nome: "Peso da Coroa", efeito: { presenca: 3, imunidades: ["amedrontado"] }, diz: "Quem a carrega anda como quem já decidiu." },
    ],
    ativo: {
      nome: "Banquete", diz: "A lâmina bebe do que você acabou de abrir, e devolve pelo braço.",
      efeito: { curaFracao: 0.5, limpa: ["sangrando", "enfraquecido"] },
    },
  },
  {
    id: "ultimo_argumento", nome: "O Último Argumento", tipo: "arma", icone: "⚔",
    historia: "Nenhuma guerra que ela terminou precisou de uma segunda conversa.",
    poderes: [
      { id: "palavra_final", nome: "Palavra Final", efeito: { ataqueExtra: 1, danoExtra: 3 }, diz: "O braço encontra o ritmo de duas armas com uma só." },
      { id: "sem_replica", nome: "Sem Réplica", efeito: { iniciativa: 5 }, diz: "Ela já está no ar quando o outro decide sacar." },
    ],
    ativo: {
      nome: "Ponto Final", diz: "Um instante inteiro comprado ao mundo: você age, e o resto ainda está decidindo.",
      efeito: { buff: { nome: "Ponto Final", bonus: 5, turnos: 3, aplica: "todos" }, manaFracao: 0.25 },
    },
  },
  {
    id: "muralha_de_um", nome: "Muralha de Um", tipo: "escudo", icone: "🛡",
    historia: "Segurou uma ponte por uma tarde inteira. O dono não segurou.",
    poderes: [
      { id: "ponte_estreita", nome: "Ponte Estreita", efeito: { defesa: 5 }, diz: "Atrás dela cabe uma pessoa, e é sempre a certa." },
      { id: "nao_cede", nome: "Não Cede", efeito: { imunidades: ["caido", "atordoado"] }, diz: "O chão pode ir embora; você fica." },
    ],
    ativo: {
      nome: "A Tarde Inteira", diz: "Você planta os pés, e por um tempo nada que venha de frente importa.",
      efeito: { buff: { nome: "A Tarde Inteira", bonus: 6, turnos: 4, aplica: "vigor" }, curaFracao: 0.25 },
    },
  },
  {
    id: "pele_do_mundo", nome: "A Pele do Mundo", tipo: "armadura", icone: "🜃",
    historia: "Curtida de alguma coisa que não era animal. Ainda respira quando ninguém olha.",
    poderes: [
      { id: "respira", nome: "Respira", efeito: { defesa: 4, vigor: 3 }, diz: "Ela se ajusta ao corpo antes de o corpo pedir." },
      { id: "sete_climas", nome: "Sete Climas", efeito: { resist: ["fogo", "gelo", "raio"] }, diz: "Fogo, geada e raio chegam nela como notícia velha." },
    ],
    ativo: {
      nome: "Fechar o Casco", diz: "A pele endurece e o que estava dentro de você sara pelo caminho.",
      efeito: { curaFracao: 0.4, limpa: ["queimando", "envenenado", "sangrando"], buff: { nome: "Casco Fechado", bonus: 4, turnos: 3, aplica: "todos" } },
    },
  },
  {
    id: "coroa_do_juiz", nome: "A Coroa do Juiz", tipo: "elmo", icone: "👑",
    historia: "Quem a usou por último condenou a si mesmo, e cumpriu a pena.",
    poderes: [
      { id: "sem_disfarce", nome: "Sem Disfarce", efeito: { vantagem: ["percepcao", "intelecto"], percepcao: 3 }, diz: "Mentira soa diferente quando ela está na sua cabeça." },
      { id: "cabeca_propria", nome: "Cabeça Própria", efeito: { imunidades: ["enfeiticado", "amedrontado", "atordoado"], vantagemMental: true }, diz: "Nenhuma vontade alheia acha porta." },
    ],
    ativo: {
      nome: "Sentença", diz: "Você diz o que é verdade, e por um tempo o mundo não discute.",
      efeito: { buff: { nome: "Sentença", bonus: 5, turnos: 4, aplica: "testes" } },
    },
  },
  {
    id: "passos_do_exilado", nome: "Os Passos do Exilado", tipo: "botas", icone: "🥾",
    historia: "Atravessaram um continente sem que ninguém as visse chegar em lugar nenhum.",
    poderes: [
      { id: "sem_rastro", nome: "Sem Rastro", efeito: { vantagem: ["destreza"], destreza: 3, movimento: 2 }, diz: "O chão esquece você um instante depois." },
      { id: "nunca_cai", nome: "Nunca Cai", efeito: { imunidades: ["caido", "lento"] }, diz: "Nada segura quem já foi expulso de todo lugar." },
    ],
    concede: "Passo Nebuloso",
    ativo: {
      nome: "A Longa Fuga", diz: "Você some do lugar onde estava — e chega onde precisava, sem que o caminho tenha existido.",
      efeito: { buff: { nome: "A Longa Fuga", bonus: 6, turnos: 3, aplica: "destreza" }, limpa: ["agarrado", "lento", "caido"] },
    },
  },
  {
    id: "olho_do_afogado", nome: "O Olho do Afogado", tipo: "amuleto", icone: "🔮",
    historia: "Foi arrancado de um profeta que via demais e não sabia nadar.",
    poderes: [
      { id: "ve_o_fio", nome: "Vê o Fio", efeito: { rerroll: 2, vantagem: ["intelecto"] }, diz: "Você percebe o erro um instante antes de cometê-lo." },
      { id: "mare_de_poder", nome: "Maré de Poder", efeito: { descontoPM: 2, intelecto: 3 }, diz: "A magia sai como quem desce um rio." },
    ],
    concede: "Presságio",
    ativo: {
      nome: "A Maré Sobe", diz: "Tudo o que você gastou volta de uma vez, como água entrando por uma fresta.",
      efeito: { manaFracao: 1, buff: { nome: "Maré Alta", bonus: 4, turnos: 3, aplica: "intelecto" } },
    },
  },
  {
    id: "anel_da_divida", nome: "O Anel da Dívida", tipo: "anel", icone: "💍",
    historia: "Alguém pagou por ele com uma coisa que não era dinheiro. A conta segue aberta.",
    poderes: [
      { id: "cobranca", nome: "Cobrança", efeito: { bonusSocial: 5, vantagem: ["presenca"], presenca: 3 }, diz: "As pessoas sentem que devem alguma coisa a você, e não lembram o quê." },
      { id: "juros", nome: "Juros", efeito: { danoExtra: 3, criticoEm: 19 }, diz: "Cada golpe cobra um pouco mais do que o anterior." },
    ],
    ativo: {
      nome: "Vencimento", diz: "A dívida vence agora, e quem paga é o mundo: o que faltava em você volta inteiro.",
      efeito: { curaFracao: 0.35, manaFracao: 0.35, limpa: ["exausto", "enfraquecido", "lento"] },
    },
  },
  {
    id: "lampada_do_pacto", nome: "A Lâmpada do Pacto", tipo: "amuleto", icone: "🕯",
    historia: "Ainda acesa. Ninguém lembra qual dos dois lados cumpriu.",
    poderes: [
      { id: "chama_que_fica", nome: "Chama que Fica", efeito: { segundoFolego: 1, rerroll: 1 }, diz: "Enquanto ela arde, você tem sempre mais uma tentativa." },
      { id: "luz_que_julga", nome: "Luz que Julga", efeito: { resist: ["sombrio"], elemento: "sagrado", danoExtra: 2 }, diz: "O que vem do escuro chega nela pela metade." },
    ],
    ativo: {
      nome: "Reacender", diz: "A chama baixa até quase nada — e sobe levando você junto.",
      efeito: { curaFracao: 0.6, revive: true },
    },
  },
  {
    id: "manto_de_ninguem", nome: "O Manto de Ninguém", tipo: "armadura", icone: "🧥",
    historia: "Vinte pessoas juraram tê-lo visto. Nenhuma descreveu a mesma coisa.",
    poderes: [
      { id: "sem_nome", nome: "Sem Nome", efeito: { vantagem: ["destreza", "presenca"], defesa: 3 }, diz: "Ninguém consegue dizer depois quem estava ali." },
      { id: "sem_alvo", nome: "Sem Alvo", efeito: { resist: ["arcano"], imunidades: ["enfeiticado"] }, diz: "Feitiço que precisa de alvo tem um problema com você." },
    ],
    concede: "Invisibilidade",
    ativo: {
      nome: "Não Estive Aqui", diz: "Por um tempo você não é ninguém — e ninguém é difícil de acertar.",
      efeito: { buff: { nome: "Não Estive Aqui", bonus: 6, turnos: 4, aplica: "todos" } },
    },
  },
];

export function reliquiaPorId(id) { return RELIQUIAS.find((r) => r.id === id) || null; }
export function reliquiaPorNome(nome) {
  const a = norm(nome);
  return RELIQUIAS.find((r) => norm(r.nome) === a) || null;
}
export function reliquiasDoSlot(tipo) { return RELIQUIAS.filter((r) => r.tipo === tipo); }

/* O item de equipamento pronto — a mesma forma que `gerarLoot` devolve, para
   que tudo o que já lê item (ficha, mercado, sintonia, dádivas) leia esta
   peça sem saber que ela é especial. */
export function itemDaReliquia(rel) {
  if (!rel) return null;
  return {
    nome: rel.nome, tipo: rel.tipo, raridade: "unico",
    atributos: atributosDaReliquia(rel),
    poderes: rel.poderes.map((p) => ({ id: p.id, nome: p.nome, efeito: p.efeito, diz: p.diz })),
    ...(rel.concede ? { concede: rel.concede } : {}),
    ativo: { id: rel.id, nome: rel.ativo.nome, diz: rel.ativo.diz },
    poder: [...rel.poderes.map((p) => `✦ ${p.nome} — ${p.diz}`),
      ...(rel.concede ? [`★ ${rel.concede} — enquanto estiver equipado e sintonizado, você usa sem gastar PM.`] : []),
      `◈ ${rel.ativo.nome} (uma vez por dia) — ${rel.ativo.diz}`].join(" · "),
    descricao: rel.historia,
    sintoniza: true,
  };
}

/* Os efeitos de atributo dos passivos, dobrados como em `loot.js`: quem lê
   atributo e resistência é `bonusEquip` e `danos.js`, e sempre foi. */
const DE_ATRIBUTO = ["forca", "destreza", "vigor", "intelecto", "presenca", "percepcao", "defesa"];
export function atributosDaReliquia(rel) {
  const out = {};
  for (const p of (rel && rel.poderes) || []) {
    for (const [k, v] of Object.entries(p.efeito || {})) {
      if (DE_ATRIBUTO.includes(k)) out[k] = (out[k] || 0) + Number(v || 0);
      else if (k === "resist") out.resist = [...new Set([...(out.resist || []), ...(Array.isArray(v) ? v : [v])])];
      else if (k === "elemento") out.elemento = v;
    }
  }
  return out;
}

/* ============================================================
   O GESTO — uma vez por dia

   `usarAtivo` é pura e tem o mesmo formato de `usarConsumivel`: recebe a
   ficha, devolve a ficha mexida e a linha que o jogador lê. Quem salva,
   quem avisa o Mestre e quem cobra o turno é o App.

   O CONTADOR é por DIA da campanha, e não por descanso: descanso se
   força, dia não. É o que impede a relíquia de virar um botão de
   "recuperar tudo" apertado três vezes na mesma luta.
   ============================================================ */
export function garantirGastos(pers) {
  const g = (pers && pers.relicaGastos) || {};
  return g && typeof g === "object" ? g : {};
}

export function usadaHoje(pers, idRelica, dia = 0) {
  const q = garantirGastos(pers)[String(idRelica)];
  return q != null && Number(q) === Number(dia);
}

export function reliquiasEquipadas(pers) {
  const out = [];
  for (const it of Object.values((pers && pers.equipados) || {})) {
    if (!it || !it.ativo || !it.ativo.id) continue;
    const rel = reliquiaPorId(it.ativo.id);
    if (rel) out.push({ item: it, rel });
  }
  return out;
}

export function podeUsarAtivo(pers, rel, { dia = 0, sintonizado = true } = {}) {
  if (!rel) return { pode: false, porque: "" };
  if (!sintonizado) return { pode: false, porque: `${rel.nome} está dormente — sintonize antes de pedir alguma coisa a ela.` };
  if (usadaHoje(pers, rel.id, dia)) return { pode: false, porque: `${rel.ativo.nome} já foi usado hoje. Uma vez por dia, e o dia ainda é este.` };
  return { pode: true, porque: "" };
}

export function usarAtivo(pers, rel, { dia = 0 } = {}) {
  if (!rel || !rel.ativo) return null;
  const e = rel.ativo.efeito || {};
  const p = { ...pers };
  const partes = [];

  if (e.revive && (p.vida || 0) <= 0) {
    p.morrendo = false; p.morte = { sucessos: 0, falhas: 0 };
    partes.push("de pé outra vez");
  }
  if (e.curaFracao) {
    const antes = p.vida || 0;
    const ganho = Math.max(1, Math.round((p.vidaMax || 1) * e.curaFracao));
    p.vida = Math.min(p.vidaMax || antes + ganho, antes + ganho);
    if (p.vida > 0) { p.morrendo = false; p.morte = { sucessos: 0, falhas: 0 }; }
    partes.push(`+${p.vida - antes} PV (${p.vida}/${p.vidaMax})`);
  }
  if (e.manaFracao) {
    const antes = p.mana || 0;
    const ganho = Math.max(1, Math.round((p.manaMax || 1) * e.manaFracao));
    p.mana = Math.min(p.manaMax || antes + ganho, antes + ganho);
    partes.push(`+${p.mana - antes} PM (${p.mana}/${p.manaMax})`);
  }
  if (Array.isArray(e.limpa) && e.limpa.length) {
    const antes = (p.condicoes || []).length;
    p.condicoes = (p.condicoes || []).filter((c) => !e.limpa.includes(c.id));
    const tirou = antes - p.condicoes.length;
    if (tirou > 0) partes.push(`${tirou} condição${tirou === 1 ? "" : "ões"} embora`);
  }
  if (e.buff && e.buff.nome) {
    const efeitos = (p.efeitos || []).filter((x) => x.nome !== e.buff.nome);
    efeitos.push({ nome: e.buff.nome, bonus: e.buff.bonus, turnos: e.buff.turnos, aplica: e.buff.aplica || "todos", descricao: rel.ativo.diz });
    p.efeitos = efeitos;
    partes.push(`+${e.buff.bonus} em ${e.buff.aplica || "tudo"} por ${e.buff.turnos} turnos`);
  }
  p.relicaGastos = { ...garantirGastos(p), [rel.id]: dia };
  return { pers: p, texto: `◈ ${rel.nome} — ${rel.ativo.nome}: ${partes.join(" · ") || "o gesto se cumpre"}` };
}

/* ============================================================
   O QUE O JOGADOR ESCREVE

   "Uso o Banquete", "invoco Vencimento", "aciono A Maré Sobe". O nome do
   ATIVO ou o nome da RELÍQUIA — os dois servem, porque é assim que se
   fala de uma coisa que tem nome próprio.
   ============================================================ */
export const RX_ATIVA = /\b(uso|usar|invoco|invocar|ativo|ativar|aciono|acionar|conjuro|canalizo|desperto|despertar|chamo|pe[cç]o)\b/;

export function ativoDeclarado(texto, pers) {
  const t = norm(texto);
  if (!t || !RX_ATIVA.test(t)) return null;
  let achado = null, tamanho = 0;
  for (const { item, rel } of reliquiasEquipadas(pers)) {
    for (const alvo of [rel.ativo.nome, rel.nome]) {
      const n = norm(alvo);
      if (n.length > 3 && t.includes(n) && n.length > tamanho) { achado = { item, rel }; tamanho = n.length; }
    }
  }
  return achado;
}

export function falaDoAtivoNegado(r) { return r && r.porque ? `⛔ ${r.porque}` : ""; }

export function envelopeDoAtivo(rel, texto) {
  if (!rel) return "";
  return `[RELÍQUIA — JÁ RESOLVIDA PELO SISTEMA] Eu acionei ${rel.ativo.nome}, de ${rel.nome}. O sistema rolou, aplicou na minha ficha e marcou o uso do dia. ${texto ? `Resultado: ${texto.replace(/^◈ /, "")}` : ""}
REGRA DESTE ENVELOPE (obrigatória): narre o GESTO e o que ele parece — ${rel.ativo.diz} — em duas ou três frases, com o peso que uma peça assim merece. NÃO mande vida, mana, condições nem itens em "mudancas": seria dobrado. NÃO invente outro efeito, NÃO diga que falhou e NÃO deixe usar de novo hoje.
E trate a relíquia como o que ela é: existe UMA no mundo, ela tem história (${rel.historia}) e quem a vê reconhece.`;
}

export function envelopeDaReliquiaAchada(rel) {
  if (!rel) return "";
  return `[RELÍQUIA ENCONTRADA — REGISTRADA PELO SISTEMA] ${rel.nome} (${rel.tipo}) entrou na minha bolsa. ${rel.historia}
REGRA DESTE ENVELOPE (obrigatória): descreva o achado à altura — não é mais um item de baú, é a única que existe. Use ESTE nome e ESTA história; NÃO invente outras propriedades, NÃO diga o que ela faz em números e NÃO crie uma segunda igual em lugar nenhum do mundo. Os poderes dela o sistema já conhece e mostra ao jogador na ficha.`;
}
