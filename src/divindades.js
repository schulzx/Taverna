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
- GANHO DE FÉ: quando o jogador fizer algo que mereça fé (feito lendário testemunhado, milagre público, santuário erguido, NPC importante convertido), registre em "fe" no JSON: {"fieis": +N, "pf": +N} — santos pequenos 10–50 fiéis, feitos grandes 100–500, marcos de campanha 1000+. NÃO inflacione: fé é recurso escasso.
- PF (Pontos de Fé) é o combustível de milagres: o jogador pode gastar PF pedindo intervenção (invocação). Milagre pequeno ~5 PF, médio ~20 PF, grande ~50 PF. Você narra o efeito; o SISTEMA cobra.
- PRESENÇA DIVINA (com moderação!): perto de uma divindade GD 3+ manifesta, mortais podem tremer — o SISTEMA rola a resistência e aplica o efeito; você narra. NUNCA aplique efeitos de presença por conta própria, e fora de combate use o pavor divino só como tempero, nunca como rotina — o jogador e o grupo íntimo dele estão protegidos pela convivência.
- ASCENSÃO É NARRATIVA: os três estágios (Servo Escolhido → Semideus/Receptáculo → Nova Divindade) avançam por FEITOS na ficção (acúmulo de fé, ritual do vazio, deicídio), guiados pelos números do sistema. Quando o jogador atingir um marco, celebre à altura — virar deus deve doer, custar e mudar o jogo.`;
