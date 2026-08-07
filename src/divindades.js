/* ═══════════════ ASCENSÃO (v7.4) — balanceamento de divindades POR CÓDIGO ═══════════════
   Baseado na ideia do autor (arquivo "Os Três Estágios da Ascensão"):
   escala de Grau de Divindade (GD 0–4) alimentada por fé, com a Regra do
   Degrau (±2 por degrau de diferença) — o Mestre NUNCA calcula nada disso,
   o sistema entrega os parâmetros prontos e ele só narra. */

export const NIVEL_DESPERTAR = 15; // abaixo disso a ascensão NÃO existe na ficção

/* A escala: quem é quem no cosmos */
export const GRAUS = [
  { gd: 0, titulo: "Mortal", fieis: 0, desc: "Carne, tempo e medo — como quase todos." },
  { gd: 1, titulo: "Herói Lendário", fieis: 1000, desc: "O povo já reza BAIXINHO o seu nome." },
  { gd: 2, titulo: "Semideus", fieis: 10000, desc: "Uma centelha vive em você — sua presença pesa no ar." },
  { gd: 3, titulo: "Divindade Menor", fieis: 100000, desc: "Um domínio responde quando você chama." },
  { gd: 4, titulo: "Divindade Maior", fieis: 1000000, desc: "Força cósmica — o mundo se curva." },
];

export function grauDe(div) {
  const f = (div && div.fieis) || 0;
  let gd = 0;
  for (const g of GRAUS) if (f >= g.fieis) gd = g.gd;
  /* quem NÃO despertou é mortal, por mais famoso que seja */
  if (div && div.ehJogador && !div.despertar) return 0;
  return gd;
}

export function tituloDe(gd) { return (GRAUS[Math.max(0, Math.min(4, gd || 0))] || GRAUS[0]).titulo; }

export function proximoPatamar(div) {
  const gd = grauDe(div);
  if (gd >= 4) return null;
  const alvo = GRAUS[gd + 1];
  const base = GRAUS[gd].fieis;
  const atual = Math.max(0, ((div && div.fieis) || 0) - base);
  const total = alvo.fieis - base;
  return { gd: alvo.gd, titulo: alvo.titulo, falta: Math.max(0, alvo.fieis - ((div && div.fieis) || 0)), progresso: Math.min(1, atual / total) };
}

/* REGRA DO DEGRAU: para cada degrau de diferença de GD, o maior ganha +2 em
   ataques, resistências e CA contra o menor (e o menor sofre −2). */
export function bonusDivino(gdAtacante, gdAlvo) {
  const dif = (gdAtacante || 0) - (gdAlvo || 0);
  return dif * 2;
}

/* Mortais não ferem deuses de verdade: diferença de 3+ degraus torna o alvo
   IMUNE ao dano comum do atacante (exceto arma lendária/bênção — a ficção decide,
   mas o sistema avisa). */
export function imunePorEscopo(gdAtacante, gdAlvo) {
  return ((gdAlvo || 0) - (gdAtacante || 0)) >= 3;
}

/* Migração de saves antigos: o formato nasce completo e inofensivo */
export function garantirDivindade(dv) {
  const d = dv && typeof dv === "object" ? dv : {};
  return {
    ehJogador: true,
    despertar: !!d.despertar,
    fieis: Math.max(0, Number(d.fieis) || 0),
    pf: Math.max(0, Number(d.pf) || 0),           // Pontos de Fé (combustível de milagres)
    dominio: d.dominio || "",                      // o conceito que o herói encarnará
    patrono: d.patrono || "",                      // deus patrono, se houver
    estagio: d.estagio || "",                      // servo | semideus | divindade (rotulo narrativo)
    panteao: Array.isArray(d.panteao) ? d.panteao : [], // divindades conhecidas do mundo
    seq: Number(d.seq) || 1,
  };
}

/* ───────── Gerador de divindades (panteão nasce PRONTO — o Mestre só narra) ───────── */
const DIV_NOMES_A = ["Vhar", "Oss", "Mel", "Thar", "Ilu", "Kael", "Zor", "Ael", "Mor", "Sae", "Dun", "Rha", "Vel", "Nyss", "Oth", "Bren"];
const DIV_NOMES_B = ["ath", "imir", "andra", "ok", "is", "ael", "un", "eira", "oth", "yra", "ash", "iel", "om", "essa"];
const DOMINIOS = [
  { dominio: "da Colheita e da Fome", icone: "🌾", temper: ["generosa", "cobradora", "silenciosa"] },
  { dominio: "das Tempestades", icone: "⛈", temper: ["colérica", "imprevisível", "orgulhosa"] },
  { dominio: "dos Mortos e dos Juramentos", icone: "💀", temper: ["solene", "vingativa", "justa"] },
  { dominio: "da Forja e do Fogo", icone: "🔥", temper: ["teimosa", "honrada", "ciumenta"] },
  { dominio: "dos Mares e das Perdições", icone: "🌊", temper: ["volúvel", "ciumenta", "antiga"] },
  { dominio: "da Lua e dos Segredos", icone: "🌙", temper: ["enigmática", "gentil", "mentirosa"] },
  { dominio: "da Guerra e das Correntes", icone: "⛓", temper: ["brutal", "honrada", "faminta"] },
  { dominio: "das Bestas e das Fronteiras", icone: "🐺", temper: ["selvagem", "protetora", "desconfiada"] },
  { dominio: "do Comércio e dos Cifrões", icone: "⚖", temper: ["negociadora", "avara", "elegante"] },
  { dominio: "dos Sonhos e dos Pesadelos", icone: "🕯", temper: ["tênue", "perturbadora", "maternal"] },
  { dominio: "da Doença e da Cura", icone: "🩸", temper: ["ambígua", "fria", "compassiva"] },
  { dominio: "do Conhecimento Proibido", icone: "📖", temper: ["curiosa", "perigosa", "paciente"] },
];
const TITULOS_CULTO = ["a Ordem", "o Círculo", "os Filhos", "a Seita", "os Vigias", "o Concílio", "as Mãos"];

function nomeDivino() {
  return DIV_NOMES_A[Math.floor(Math.random() * DIV_NOMES_A.length)] + DIV_NOMES_B[Math.floor(Math.random() * DIV_NOMES_B.length)];
}

/* Gera UMA divindade completa: força (GD/fiéis/PF) já sorteada e coerente —
   é o "parâmetro" que o Mestre recebe de graça, sem gastar tokens inventando números. */
export function gerarDivindade(ctx, dia, { gdFixo = null } = {}) {
  const dom = DOMINIOS[Math.floor(Math.random() * DOMINIOS.length)];
  /* distribuição: deuses menores são comuns; maiores, raros */
  const rolo = Math.random();
  const gd = gdFixo != null ? gdFixo : (rolo < 0.40 ? 2 : rolo < 0.75 ? 3 : 4);
  const baseFieis = GRAUS[gd].fieis || 5000;
  const fieis = gd === 2 ? 5000 + Math.floor(Math.random() * 45000)
    : gd === 3 ? 100000 + Math.floor(Math.random() * 400000)
    : 1000000 + Math.floor(Math.random() * 3000000);
  const temper = dom.temper[Math.floor(Math.random() * dom.temper.length)];
  const nome = nomeDivino();
  return {
    id: `dv${dia}-${Math.floor(Math.random() * 1e6)}`,
    nome,
    dominio: dom.dominio,
    icone: dom.icone,
    gd,
    fieis,
    pf: Math.floor(fieis / 1000), // reserva de milagres proporcional à fé
    temperamento: temper,
    culto: `${TITULOS_CULTO[Math.floor(Math.random() * TITULOS_CULTO.length)]} ${nome.endsWith("a") || nome.endsWith("e") ? "de" : "de"} ${nome}`,
    lugar: ctx && ctx.lugar ? ctx.lugar : "",
    criadoEm: dia,
    nota: `${temper[0].toUpperCase()}${temper.slice(1)} — culto ${gd >= 4 ? "antigo e presente em todo o mundo conhecido" : gd === 3 ? "forte em várias cidades" : "local, mas fervoroso"}.`,
  };
}

/* Panteão inicial quando o jogador desperta: o mundo GANHA céu de repente —
   3 divindades variadas já existiam (só agora o herói consegue percebê-las). */
export function gerarPanteaoInicial(ctx, dia) {
  return [
    gerarDivindade(ctx, dia, { gdFixo: 2 }),
    gerarDivindade(ctx, dia, { gdFixo: 3 }),
    gerarDivindade(ctx, dia, { gdFixo: 4 }),
  ];
}

/* ───────── Gerador de eventos divinos (só depois do despertar) ───────── */
const EVENTOS_DIVINOS = [
  (c, d) => ({ icone: "⛈", texto: `${d.icone} ${d.nome} ${d.dominio} manifesta-se: um sinal impossível (${d.temperamento === "colérica" ? "tempestade com relâmpagos que escrevem runas" : "fenômeno que ninguém consegue explicar"}) é visto ${c.lugar ? `perto de ${c.lugar}` : "na região"}. O culto ${d.culto} interpreta como ${Math.random() < 0.5 ? "aviso" : "promessa"}.`, gancho: "investigar o sinal pode render favor — ou inimizade — da divindade" }),
  (c, d) => ({ icone: "🕯", texto: `Paladinos d${d.culto} chegam ${c.lugar ? `a ${c.lugar}` : "à região"} caçando um relicário roubado d${d.nome === "relicário" ? "e" : `e ${d.nome}`}. Oferecem recompensa em bênçãos (PF) a quem ajudar.`, gancho: "relicário pode estar à venda no mercado negro — ou nas mãos de alguém do círculo do herói" }),
  (c, d, d2) => (d2 ? { icone: "⚡", texto: `Guerra de fé: ${d.nome} ${d.icone} e ${d2.nome} ${d2.icone} disputam um mesmo domínio nas orações do povo. Templos rivais se provocam ${c.lugar ? `em ${c.lugar}` : "na região"} — e cada lado busca campeões mortais.`, gancho: "escolher um lado muda sua relação com os dois deuses" } : null),
  (c, d) => ({ icone: "📿", texto: `Um profeta menor d${d.culto} prega que ${d.nome} ${d.dominio} "escolherá um novo receptáculo entre os mortais desta geração". Multidões se agitam; olhares começam a medir os heróis conhecidos — inclusive você.`, gancho: "o culto pode vir testar (ou recrutar) o herói" }),
  (c, d) => ({ icone: "🌑", texto: `As orações a ${d.nome} ficaram sem resposta por três noites seguidas. O culto ${d.culto} entra em pânico discreto: algo enfraquece a divindade — ou a distraiu.`, gancho: "uma divindade vulnerável é oportunidade rara (e perigosa)" }),
  (c, d) => ({ icone: "🩸", texto: `Um milagre brutal atribuído a ${d.nome}: ${Math.random() < 0.5 ? "um ímpio foi consumido por dentro pela própria sombra em praça pública" : "uma criança condenada acordou curada falando na língua dos deuses"}. A fé da região oscila.`, gancho: "testemunhas do milagre podem ter visto mais do que deviam" }),
];

export function gerarEventoDivino(ctx, dia, panteao) {
  const lista = (panteao || []).filter((d) => d && d.nome);
  if (!lista.length) return null;
  const d = lista[Math.floor(Math.random() * lista.length)];
  const d2 = lista.length > 1 ? lista.filter((x) => x.nome !== d.nome)[Math.floor(Math.random() * (lista.length - 1))] : null;
  for (let tent = 0; tent < 6; tent++) {
    const ev = EVENTOS_DIVINOS[Math.floor(Math.random() * EVENTOS_DIVINOS.length)](ctx, d, d2);
    if (ev) return { id: `ed${dia}-${Math.floor(Math.random() * 1e6)}`, ...ev, criadoEm: dia };
  }
  return null;
}

/* Resumo injetado no rodapé do sistema: o estado da ascensão SEMPRE visível
   ao Mestre, sem custar tokens de memória dele. */
export function resumoAscensao(div, nivelJogador) {
  if (!div || !div.despertar) return "";
  const gd = grauDe(div);
  const prox = proximoPatamar(div);
  return `Ascensão: GD ${gd} (${tituloDe(gd)}), ${div.fieis} fiéis, ${div.pf} PF${div.dominio ? `, domínio: ${div.dominio}` : ""}${div.patrono ? `, patrono: ${div.patrono}` : ""}${prox ? ` — faltam ${prox.falta} fiéis para GD ${prox.gd}` : ""}. Regra do Degrau: ±2 por degrau de GD em confrontos entre seres divinos (o sistema calcula; você NÃO inventa números).`;
}

/* Âncoras de economia divina — mesma ideia do ECONOMIA_PROMPT: parâmetros
   fixos para o Mestre não se perder em milagres, fiéis e presença. */
export const DIVINDADE_PROMPT = `ASCENSÃO E DIVINDADES (parâmetros do sistema — siga-os, não improvise números):
- A escala cósmica é GD 0–4: Mortal, Herói Lendário (1k fiéis), Semideus (10k), Divindade Menor (100k), Divindade Maior (1M+). O sistema rastreia fiéis e PF do jogador e avisa no rodapé; as divindades do mundo vêm prontas pelo sistema (GD, fiéis e culto JÁ DEFINIDOS — use-os como fato).
- REGRA DO DEGRAU: cada degrau de diferença de GD dá +2 ao mais forte e −2 ao mais fraco em ataques, defesas e resistências — O SISTEMA APLICA nos dados, você só narra a disparidade (o golpe do mortal parece "invisível" ao deus, etc.).
- Mortais (GD 0) não ferem de verdade divindades de GD 3+ sem artefato lendário ou bênção — se o jogador insistir, a ficção mostra a futilidade com honestidade (isso motiva a ascensão, não a punge).
- GANHO DE FÉ (por SINAL, nunca por número): quando o herói fizer algo que mereça fé, mande em "sinais" a magnitude — "fe:sussurro" (gesto notado por poucos), "fe:feito" (a cidade comenta), "fe:proeza" (a região conta), "fe:marco" (muda a história do mundo). O SISTEMA converte em fiéis levando a fama dele em conta. NÃO envie quantidade de fiéis nem de PF.
- PF (Pontos de Fé) é o combustível de milagres e REGENERA SOZINHO por dia, proporcional aos fiéis — você nunca concede PF. Para gastar, mande "milagre:<id>" (bencao, cura, presagio, juramento, furia, refugio, ressurgir, decreto, avatar): o sistema cobra o custo, aplica o efeito e te avisa; você só narra a manifestação. Se o jogador pedir um milagre que ele ainda não pode pagar ou cujo grau não alcançou, o sistema recusa e você narra o silêncio do domínio.
- FÉ MÍNGUA: devoção exige presença. A fé some sozinha, dia a dia, em toda cidade onde não há templo do herói nem ele em pessoa — e mesmo o clero de um templo prega com menos convicção depois de meses sem sinal dele. O sistema faz essa conta por cidade; use o resultado na ficção (templos vazios, profetas desanimados, altar coberto de pó).
- PRESENÇA DIVINA (com moderação!): perto de uma divindade GD 3+ manifesta, mortais podem tremer — o SISTEMA rola a resistência e aplica o efeito; você narra. NUNCA aplique efeitos de presença por conta própria, e fora de combate use o pavor divino só como tempero, nunca como rotina — o jogador e o grupo íntimo dele estão protegidos pela convivência.
- ASCENSÃO É NARRATIVA: os três estágios (Servo Escolhido → Semideus/Receptáculo → Nova Divindade) avançam por FEITOS na ficção (acúmulo de fé, ritual do vazio, deicídio), guiados pelos números do sistema. Quando o jogador atingir um marco, celebre à altura — virar deus deve doer, custar e mudar o jogo.`;

/* ═══════════════ v7.6 — TÍTULO ÚNICO, MILAGRES E ECONOMIA DE FÉ ═══════════════ */

/* ---------------- TÍTULO ÚNICO DO HERÓI ----------------
   Três escalas medem coisas diferentes e NÃO podem dividir vocabulário:
   · patamar (nível)  = o que ele AGUENTA   → balanceamento de combate
   · fama   (façanhas) = quanto o mundo o CONHECE
   · GD     (fiéis)    = o que ele É no cosmos
   Palavra divina só se conquista com fé. Nível nenhum, sozinho, faz
   alguém ser chamado de Semideus. Esta função resolve o nome exibido. */
export function tituloDoHeroi(divindade, patamarFamaRotulo, patamarNivelNome) {
  const dv = divindade || {};
  const gd = grauDe(dv);
  if (dv.despertar && gd >= 1) {
    return { titulo: tituloDe(gd), fonte: "fe", gd, divino: true };
  }
  return { titulo: patamarFamaRotulo || patamarNivelNome || "Mortal", fonte: patamarFamaRotulo ? "fama" : "nivel", gd: 0, divino: false };
}

/* Teto de GD por nível: fé sem poder não faz deus (evita GD 4 no nível 15). */
export function gdMaximoPorNivel(nivel) {
  const n = nivel || 1;
  if (n < NIVEL_DESPERTAR) return 0;
  if (n < 17) return 1;
  if (n < 19) return 2;
  if (n < 20) return 3;
  return 4; // no ápice mortal (20) nada mais limita a ascensão
}

/* ---------------- FÉ POR CÓDIGO ----------------
   O Mestre não manda mais números: manda um SINAL de magnitude e o
   sistema converte, levando em conta a fama (quem é conhecido converte
   mais gente por feito). Fé deixa de ser inflacionável ou esquecível. */
export const MAGNITUDE_FE = {
  sussurro: { rotulo: "sussurro", base: 15,   desc: "um gesto notado por poucos" },
  feito:    { rotulo: "feito",    base: 120,  desc: "algo que a cidade comenta" },
  proeza:   { rotulo: "proeza",   base: 600,  desc: "algo que a região inteira conta" },
  marco:    { rotulo: "marco",    base: 3000, desc: "algo que muda a história do mundo" },
};
export function fieisPorFeito(magnitude, fama0a100) {
  const m = MAGNITUDE_FE[magnitude] || MAGNITUDE_FE.feito;
  const mult = 1 + (Math.max(0, Math.min(100, fama0a100 || 0)) / 100) * 2; // fama triplica no topo
  return Math.round(m.base * mult);
}

/* PF regenera sozinho por dia, proporcional aos fiéis — como a renda das
   cidades no reino. A IA só GASTA milagre; conceder deixou de ser dela. */
export function pfPorDia(div) {
  const f = (div && div.fieis) || 0;
  if (!f) return 0;
  return Math.max(1, Math.round(Math.sqrt(f) / 3));
}
export function pfMaximo(div) {
  const f = (div && div.fieis) || 0;
  return Math.max(10, Math.round(Math.sqrt(f) * 2));
}

/* Fé míngua se o herói some: devoção exige presença. */
export function decaimentoFe(div, diasSemManifestacao) {
  const f = (div && div.fieis) || 0;
  if (!f || (diasSemManifestacao || 0) < 30) return 0;
  const taxa = Math.min(0.03, 0.005 * Math.floor(diasSemManifestacao / 30));
  return Math.round(f * taxa);
}

/* ---------------- MILAGRES: no que gastar os Pontos de Fé ----------------
   Efeito RESOLVIDO PELO SISTEMA; o Mestre só narra. Cada milagre exige um
   GD mínimo — o poder cresce junto com o que o herói é. */
export const MILAGRES = [
  { id: "bencao",    nome: "Bênção",             icone: "✨", pf: 5,  gd: 1, alvo: "grupo",
    desc: "Vantagem nas próximas rolagens de todo o grupo.", efeito: { tipo: "efeito", nome: "Abençoado", bonus: 2, turnos: 5, aplica: "todos" } },
  { id: "cura",      nome: "Toque Restaurador",  icone: "🩶", pf: 8,  gd: 1, alvo: "grupo",
    desc: "Restaura a vida do herói e dos companheiros.",     efeito: { tipo: "cura", fracao: 0.5 } },
  { id: "presagio",  nome: "Presságio",          icone: "🔮", pf: 6,  gd: 1, alvo: "mundo",
    desc: "O domínio revela o que está por vir — uma verdade oculta da cena.", efeito: { tipo: "revelacao" } },
  { id: "juramento", nome: "Juramento Selado",   icone: "⛓", pf: 15, gd: 2, alvo: "npc",
    desc: "Um NPC presente jura lealdade — vínculo sobe ao máximo.",  efeito: { tipo: "vinculo", valor: 100 } },
  { id: "furia",     nome: "Fúria do Domínio",   icone: "⚡", pf: 20, gd: 2, alvo: "combate",
    desc: "O poder desaba sobre os inimigos: dano pesado em todos.",  efeito: { tipo: "dano_area", fracao: 0.35 } },
  { id: "refugio",   nome: "Refúgio Sagrado",    icone: "🛡", pf: 18, gd: 2, alvo: "grupo",
    desc: "Ninguém do grupo cai neste combate — o golpe fatal é negado uma vez.", efeito: { tipo: "efeito", nome: "Refúgio", bonus: 0, turnos: 6, aplica: "todos" } },
  { id: "ressurgir", nome: "Chamar de Volta",    icone: "🕯", pf: 50, gd: 3, alvo: "grupo",
    desc: "Traz de volta quem tombou — a morte devolve o que é seu.", efeito: { tipo: "ressurreicao" } },
  { id: "decreto",   nome: "Decreto Divino",     icone: "📜", pf: 40, gd: 3, alvo: "mundo",
    desc: "Sua vontade vira lei natural numa região: o mundo obedece.", efeito: { tipo: "mundo" } },
  { id: "avatar",    nome: "Manifestação",       icone: "🌟", pf: 80, gd: 4, alvo: "mundo",
    desc: "Você se manifesta em pessoa a todos de uma cidade inteira.", efeito: { tipo: "mundo", fe: "marco" } },
];
export function milagresDisponiveis(div) {
  const gd = grauDe(div);
  const pf = (div && div.pf) || 0;
  return MILAGRES.filter((m) => m.gd <= gd).map((m) => ({ ...m, podeUsar: pf >= m.pf }));
}
export function milagrePorId(id) { return MILAGRES.find((m) => m.id === id) || null; }


/* ═══════════ v8.2 — CAMINHOS DE ASCENSÃO ═══════════
   Fé não é a única estrada. Um herói pode roubar a divindade de quem já
   a tem (deicídio) ou drenar uma fonte antiga por ritual. Cada caminho
   tem exigências e testes; o sistema entrega os parâmetros prontos. */
export const CAMINHOS_ASCENSAO = [
  {
    id: "fe",
    nome: "A Via da Fé",
    desc: "Acumular fiéis até o próprio nome virar oração. Lento, seguro e legítimo.",
    exige: "fiéis suficientes para o grau seguinte",
    risco: "nenhum — só tempo e feitos",
    testes: [],
  },
  {
    id: "deicidio",
    nome: "Deicídio",
    desc: "Matar uma divindade e tomar o domínio dela. Rápido, brutal e faz inimigos eternos.",
    exige: "enfrentar um deus de GD igual ou maior — e vencer",
    risco: "o culto do morto jura vingança; outros deuses passam a te vigiar",
    testes: [
      { nome: "Encontrar o corpo verdadeiro", atributo: "Percepção", dificuldade: 20, nota: "deuses não morrem onde parecem estar" },
      { nome: "Romper a proteção divina", atributo: "Presença", dificuldade: 22, nota: "exige artefato lendário ou bênção rival" },
      { nome: "Absorver o domínio no instante da morte", atributo: "Vontade", dificuldade: 24, nota: "falhar aqui dispersa o poder — e queima o herói" },
    ],
    ganho: { gd: 1, fieis: 0.5 },
  },
  {
    id: "reliquia",
    nome: "A Fonte Milenar",
    desc: "Encontrar uma relíquia de energia primordial e drená-la num ritual longo.",
    exige: "localizar a relíquia e reunir os componentes do ritual",
    risco: "o ritual pode falhar catastroficamente; a fonte pode ter dono",
    testes: [
      { nome: "Decifrar o ritual", atributo: "Intelecto", dificuldade: 20, nota: "línguas que precedem a escrita" },
      { nome: "Sustentar a canalização", atributo: "Vigor", dificuldade: 22, nota: "o corpo mortal não foi feito para isso" },
      { nome: "Não se perder no que entra", atributo: "Vontade", dificuldade: 23, nota: "falhar aqui não mata — apaga quem você era" },
    ],
    ganho: { gd: 1, fieis: 0.3 },
  },
];
export function caminhoPorId(id) { return CAMINHOS_ASCENSAO.find((c) => c.id === id) || CAMINHOS_ASCENSAO[0]; }

export const CAMINHOS_PROMPT = `CAMINHOS DE ASCENSÃO (além da fé — o sistema fornece os parâmetros; você conduz a ficção):
- DEICÍDIO: matar um deus e tomar seu domínio. Três provas, nesta ordem: achar o corpo verdadeiro (Percepção, dif. 20), romper a proteção divina (Presença, dif. 22 — exige artefato lendário ou bênção rival) e absorver o domínio no instante da morte (Vontade, dif. 24). Cada prova é uma CENA, não uma frase. Vencer sobe UM grau e transfere metade dos fiéis do morto; o culto dele jura vingança para sempre.
- FONTE MILENAR: drenar uma relíquia primordial por ritual. Provas: decifrar o ritual (Intelecto, dif. 20), sustentar a canalização (Vigor, dif. 22) e não se perder no que entra (Vontade, dif. 23). Vencer sobe UM grau; falhar a última prova não mata — muda quem o herói é (proponha uma consequência permanente).
- Estes caminhos exigem PREPARAÇÃO na ficção (encontrar o alvo, reunir componentes, aliados). Nunca os conceda de imediato porque o jogador pediu: construa a jornada. Quando as provas forem vencidas, mande o sinal "ascender:deicidio" ou "ascender:reliquia" e o SISTEMA aplica o grau.`;
