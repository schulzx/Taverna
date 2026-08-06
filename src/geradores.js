/* Taverna v7.2 — GERADORES DE VIDA (tudo em código, zero tokens).
   Três motores que entregam material PRONTO ao Mestre — ele só narra:
   1) SORTEADOR DE POSSIBILIDADES: quest montada conforme a fase do arco.
   2) EVENTOS LOCAIS: fios vivos do dia a dia (frequentes, máx. 3, expiram).
   3) EVENTOS GLOBAIS: arcos maiores que escalam por etapas (raros, máx. 1).
   Os atores já vêm com nome, raça e ofício sorteados — a diversidade do
   mundo deixa de depender da memória da IA. */
import { elencoDiverso } from "./nomes.js";

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/* ---------------- DADOS DO MESTRE (v8.2) ----------------
   Antes os eventos surgiam por sorteio invisível. Agora o Mestre ROLA,
   como numa mesa de verdade: o dado aparece, o alvo aparece, e só
   acontece se passar. Um mundo que se explica é mais confiável do que
   um mundo que só acontece. */
export const d20 = () => 1 + Math.floor(Math.random() * 20);

export function rolarGatilho(rotulo, alvo, { vantagem = false, garantido = false } = {}) {
  if (garantido) return { rotulo, alvo, d: 20, passou: true, garantido: true, texto: `${rotulo}: garantido pelo tempo decorrido` };
  const a = d20(), b = vantagem ? d20() : null;
  const d = b != null ? Math.max(a, b) : a;
  const passou = d >= alvo;
  return {
    rotulo, alvo, d, passou, vantagem,
    texto: `${rotulo}: d20 ${b != null ? `(${a}/${b}) ` : ""}= ${d} vs ${alvo} → ${passou ? "acontece" : "nada"}`,
  };
}

/* ---------------- contexto comum ---------------- */
export function ctxMundo({ mundo, mapa, dia }) {
  const genero = (mundo && mundo.genero) || "Fantasia medieval";
  const elenco = elencoDiverso(genero, 4);
  const cidades = ((mapa && mapa.cidades) || []).map((c) => c.nome);
  const faccoes = ((mapa && mapa.faccoes) || []).filter((f) => f && f.nome && !f.doJogador).map((f) => f.nome);
  return {
    dia,
    a1: elenco[0], a2: elenco[1], a3: elenco[2], a4: elenco[3],
    lugar: cidades.length ? pick(cidades) : "a cidade mais próxima",
    lugar2: cidades.length > 1 ? pick(cidades.filter((c) => c !== (cidades[0] || ""))) || cidades[0] : "uma vila vizinha",
    faccao: faccoes.length ? pick(faccoes) : null,
    pessoa: (a) => `${a.nome}, ${a.raca} ${a.genero_pessoa}, ${a.ocupacao} (${a.traco})`,
  };
}

/* ---------------- 1) SORTEADOR DE POSSIBILIDADES (quest por fase do arco) ----------------
   fase: "abertura" | "meio" | "climax" — derivada da etapa atual da estrutura. */
const GANCHOS = {
  abertura: [
    (c) => ({ titulo: `O pedido de ${c.a1.nome}`, descricao: `${c.pessoa(c.a1)} procura ajuda: ${pick(["alguém roubou o que tinha de mais valioso", "um parente sumiu na estrada", "uma dívida antiga voltou para cobrar juros", "um segredo está prestes a vir à tona"])}.`, objetivo: `Encontrar ${c.a1.nome} em ${c.lugar} e ouvir o pedido completo` }),
    (c) => ({ titulo: "Boato de taverna", descricao: `Em ${c.lugar}, todos comentam: ${pick(["uma caravana inteira desapareceu sem deixar rastro", "viram luzes estranhas nas ruínas além do rio", "um poço secou do dia para a noite — e algo foi ouvido lá embaixo", "um forasteiro paga caro por um mapa que ninguém admite ter"])}.`, objetivo: `Investigar o boato em ${c.lugar} e descobrir o que há de verdade nele` }),
    (c) => ({ titulo: "A oferta estranha", descricao: `${c.pessoa(c.a2)} faz uma proposta boa demais para ser honesta — e talvez não seja.`, objetivo: `Descobrir o que ${c.a2.nome} realmente quer antes de aceitar (ou recusar)` }),
  ],
  meio: [
    (c) => ({ titulo: `Entre ${c.lugar} e ${c.lugar2}`, descricao: `Algo azedou a relação entre os dois lugares: ${pick(["mercadores acusam uns aos outros de sabotagem", "uma ponte vital foi queimada e cada lado culpa o outro", "dois jovens fugiram juntos e as famílias se culpam", "a água do rio que serve aos dois virou motivo de disputa armada"])}.`, objetivo: `Viajar entre ${c.lugar} e ${c.lugar2}, apurar a verdade e impedir (ou escolher) um lado` }),
    (c) => ({ titulo: `O capricho de ${c.faccao || "um poder local"}`, descricao: `${c.faccao ? `A facção ${c.faccao}` : "Um poder local"} precisa de alguém fora da folha de pagamento para ${pick(["recuperar algo que não pode ser ligado a eles", "entregar uma mensagem que não pode ser interceptada", "testar a lealdade de um dos seus", "sumir com uma prova incômoda"])}. O pagamento é bom; as perguntas, proibidas.`, objetivo: `Aceitar (ou recusar) o serviço e cumpri-lo sem virar bode expiatório` }),
    (c) => ({ titulo: "Dívida de sangue", descricao: `${c.pessoa(c.a3)} aparece cobrando ${pick(["uma promessa feita em noite de bebedeira", "a vida de alguém que o herói deixou escapar", "um favor do passado com juros de honra", "que o herói tome partido numa vingança antiga"])}.`, objetivo: `Resolver a cobrança de ${c.a3.nome} — pagando, negociando ou encarando` }),
    (c) => ({ titulo: "O preço do nome", descricao: `A fama do herói chegou antes dele em ${c.lugar}: ${pick(["um falso herói usa seu nome para enganar", "alguém oferece recompensa por uma proeza que você nunca fez", "um admirador se mete em perigo tentando imitá-lo", "um rival quer provar em público que sua fama é mentira"])}.`, objetivo: `Ir a ${c.lugar} e resolver o mal-entendido — do jeito que achar digno` }),
  ],
  climax: [
    (c) => ({ titulo: "Antes da tempestade", descricao: `Com o desfecho se aproximando, ${c.pessoa(c.a1)} pede ajuda para ${pick(["colocar a família em segurança", "esconder algo que não pode cair nas mãos erradas", "saldar uma dívida antes que seja tarde", "fazer as pazes com alguém do passado"])}.`, objetivo: `Cumprir o pedido de ${c.a1.nome} antes do confronto decisivo` }),
    (c) => ({ titulo: "A peça que falta", descricao: `Para o que vem pela frente, será preciso ${pick(["convencer um aliado relutante a se comprometer", "conseguir um item ou prova guardada em lugar perigoso", "virar um inimigo contra o próprio lado", "sacrificar algo valioso em troca de uma vantagem real"])}.`, objetivo: `Garantir essa peça — e decidir quanto ela custa` }),
    (c) => ({ titulo: "Contas paralelas", descricao: `Enquanto o arco corre para o fim, ${c.faccao ? `a facção ${c.faccao}` : "um poder menor"} tenta pescar em águas turbulentas: ${pick(["oferece ajuda com preço escondido", "move peças para sair ganhando qualquer que seja o vencedor", "pressiona um ponto fraco do herói exatamente agora"])}.`, objetivo: `Ler o jogo por trás da oferta e decidir se usa, recusa ou desarma` }),
  ],
};

export function faseDoArco(historia, estruturas) {
  const est = (estruturas || []).find((e) => e.id === (historia && historia.estrutura));
  const total = est ? est.etapas.length : 4;
  const et = (historia && historia.etapa) || 0;
  if (et === 0) return "abertura";
  if (et >= total - 2) return "climax";
  return "meio";
}

export function gerarQuestDeArco(ctx, fase) {
  const pool = GANCHOS[fase] || GANCHOS.meio;
  return pick(pool)(ctx);
}

/* ---------------- 2) EVENTOS LOCAIS (fios vivos — frequentes, máx. 3, expiram) ---------------- */
const LOCAIS = [
  (c) => ({ icone: "🍺", texto: `Briga de taverna em ${c.lugar}: ${c.a1.nome} (${c.a1.raca}) e ${c.a2.nome} (${c.a2.raca}) se digladiam por ${pick(["uma dívida de jogo", "um insulto de família", "o amor da mesma pessoa", "uma aposta que azedou"])} — e o estrago está sobrando para quem estiver perto.`, gancho: "Separar, tomar um lado, ou lucrar com o caos?" }),
  (c) => ({ icone: "🎪", texto: `Uma feira nômade armou tenda nos arredores de ${c.lugar}: quermesse, atravessadores de mercadorias e ${c.pessoa(c.a3)}, que diz ler o futuro — e acertou detalhes demais.`, gancho: "Compras, jogos, ou descobrir o truque da vidente?" }),
  (c) => ({ icone: "🔥", texto: `Um incêndio destruiu ${pick(["o moinho", "o armazém do porto", "três casas do bairro pobre", "a oficina de um respeitado artesão"])} em ${c.lugar}. Foi acidente — ou recado?`, gancho: "Ajudar nas perdas ou apurar a origem do fogo?" }),
  (c) => ({ icone: "⚖️", texto: `Julgamento público em ${c.lugar}: ${c.pessoa(c.a1)} responde por ${pick(["roubo de grãos", "heresia", "morte numa briga", "magia proibida"])} e a multidão já escolheu o veredito.`, gancho: "Intervir, investigar, ou deixar a lei correr?" }),
  (c) => ({ icone: "🐗", texto: `Uma fera ${pick(["gigante e raivosa", "que ninguém consegue rastrear", "que ataca só à noite", "marcada por uma cicatriz antiga"])} vem atacando ${pick(["rebanhos", "viajantes", "as plantações", "caçadores experientes"])} nos arredores.`, gancho: "Caçar a fera — ou descobrir por que ela veio?" }),
  (c) => ({ icone: "💍", texto: `Noivado político à vista em ${c.lugar}: ${c.a2.nome} (${c.a2.raca}) vai casar por interesse, e ${pick(["o(a) noivo(a) verdadeiro amor está desesperado(a)", "uma das famílias quer sabotar", "o dote esconde algo valioso demais", "alguém contratou capangas para impedir a cerimônia"])}.`, gancho: "Proteger, impedir ou aproveitar a festa?" }),
  (c) => ({ icone: "🤒", texto: `Uma doença estranha se espalha pelo ${pick(["bairro portuário", "mercado", "orfanato", "acampamento dos forasteiros"])} de ${c.lugar}: febre que vem e volta, e ${c.pessoa(c.a4)} jura saber a causa.`, gancho: "Conter, tratar, ou provar a teoria?" }),
  (c) => ({ icone: "📣", texto: `Um pregador ${c.a1.raca} inflama a praça de ${c.lugar} contra ${pick(["os magos", "os forasteiros", "a nobreza", "uma raça específica", "a guilda local"])} — e a plateia cresce a cada dia.`, gancho: "Enfrentar, ignorar, ou descobrir quem o financia?" }),
  (c) => ({ icone: "🏆", texto: `Torneio aberto em ${c.lugar}: ${pick(["luta livre", "arco e flecha", "justa", "duelo de magia controlada"])} com bolsa gorda e olhares de gente importante na arquibancada.`, gancho: "Competir, apostar, ou usar o torneio como palco?" }),
  (c) => ({ icone: "🕳️", texto: `Abriu-se uma ${pick(["fenda no chão do mercado", "passagem atrás de uma taverna em reforma", "cripta sob a capela antiga", "mina abandonada que se julgava esgotada"])} em ${c.lugar}. O primeiro curioso não voltou; o segundo voltou diferente.`, gancho: "Explorar antes que a guarda feche tudo?" }),
  (c) => ({ icone: "🛶", texto: `Contrabando desavergonhado movimenta as noites de ${c.lugar}: ${c.faccao ? `dizem que a ${c.faccao} está por trás` : "ninguém sabe quem comanda"}, e a guarda finge cegueira a troco de uma fatia.`, gancho: "Denunciar, infiltrar, ou comprar silêncio também?" }),
  (c) => ({ icone: "👻", texto: `Em ${c.lugar}, juram que ${pick(["a torre abandonada voltou a ter luzes", "um antigo herói enterrado foi visto caminhando", "os sinos tocam sozinhos à meia-noite", "retratos sangram numa mansão fechada"])}. Céticos riem — de dia.`, gancho: "Desmascarar o mistério ou encontrar o que é real?" }),
];

export function gerarEventoLocal(ctx, dia) {
  const t = pick(LOCAIS)(ctx);
  return { id: `ev_${dia}_${Math.floor(Math.random() * 9999)}`, ...t, criadoEm: dia, expiraEm: dia + 2 + Math.floor(Math.random() * 3) };
}

/* ---------------- 3) EVENTOS GLOBAIS (arcos maiores — raros, máx. 1, escalam) ---------------- */
const GLOBAIS = [
  { nome: "Guerra de Sucessão", semente: (c) => `O velho regente está morto (ou às portas disso) e ${pick(["dois herdeiros", "três pretendentes", "um herdeiro legítimo e um bastardo popular"])} disputam a coroa da região. Cada facção começa a escolher lado.`, etapas: [
    "Fase fria: proclamações, enviados pedindo apoio, pequenos 'acidentes' entre partidários.",
    "Fase quente: confrontos abertos em pontos-chave, cidades pressionadas a declarar lado, preços de guerra.",
    "Desfecho: a batalha, o acordo ou o assassinato que decide a coroa — as escolhas do herói pesam."] },
  { nome: "O Culto Crescente", semente: (c) => `Um culto antes insignificante cresce rápido demais: promessas de ${pick(["cura", "poder", "ressurreição dos mortos", "um mundo novo"])} e um líder ${pick(["carismático", "que nunca mostra o rosto", "que fala com voz de multidão"])}. Convertidos deixam tudo para trás.`, etapas: [
    "Murmúrios: templos improvisados, sumiços isolados, símbolos aparecendo em paredes.",
    "Ascensão: convertidos em cargos, 'milagres' públicos, opositores começam a sumir.",
    "Revelação: o que o culto realmente serve se mostra — e quer algo grande."] },
  { nome: "A Praga Cinzenta", semente: (c) => `Uma praga nova avança pela região: ${pick(["manchas cinzentas e tosse seca", "sono que não acorda", "febre que transforma o temperamento dos doentes"])}. Cidades fecham portões; curandeiros discordam.`, etapas: [
    "Primeiros focos: bairros isolados, medo de viajantes, boatos sobre a origem.",
    "Propagação: quarentenas, escassez, caça às bruxas — alguém será culpado.",
    "Encruzilhada: cura, contenção ou catástrofe — e a verdade sobre a origem."] },
  { nome: "O Inverno dos Lobos", semente: (c) => `Algo expulsa feras e povos das fronteiras para dentro das terras civilizadas: ${pick(["inverno brutal fora de época", "um predador novo e pior", "tribos empurradas por algo que não nomeiam"])}. Estradas e vilas sofrem primeiro.`, etapas: [
    "Sinais: rebanhos mortos, vilas vazias, refugiados com histórias incoerentes.",
    "Pressão: cidades superlotadas, escassez, saques e pânico — a causa se aproxima.",
    "A fonte: enfrentar, conter ou negociar com aquilo que vem das fronteiras."] },
  { nome: "O Torneio das Coroas", semente: (c) => `O maior torneio da geração foi anunciado: campeões de todos os reinos, bolsa lendária e — mais importante — os poderosos todos no mesmo lugar, no mesmo mês.`, etapas: [
    "Preparativos: qualificatórias, convites, apostas e intrigas de bastidor.",
    "Os jogos: duelos memoráveis, sabotagens, negócios feitos entre uma prova e outra.",
    "A final: o título, o prêmio — e o que for decidido nos corredores mudará a região."] },
  { nome: "O Eclipse Anunciado", semente: (c) => `Astrólogos e profetas concordam pela primeira vez: o eclipse vem, e com ele ${pick(["uma profecia antiga", "o enfraquecimento dos selos de algo", "o retorno de alguém", "uma noite que durará dias"])}. Cada facção se prepara do seu jeito.`, etapas: [
    "Expectativa: peregrinos, acumuladores, pregadores do fim — o mundo segura a respiração.",
    "Sinais: fenômenos estranhos antecipam a data; quem se preparou colhe vantagem.",
    "A noite longa: o que a profecia prometia acontece — para bem ou mal, nada volta a ser igual."] },
];

export function gerarEventoGlobal(ctx, dia) {
  const g = pick(GLOBAIS);
  return { id: `gl_${dia}_${Math.floor(Math.random() * 9999)}`, nome: g.nome, semente: g.semente(ctx), etapas: g.etapas, etapa: 0, desde: dia };
}

/* ---------------- cadência e processamento diário ----------------
   Regras de convivência (anti-inundação):
   - Local: no máx. 3 ativos; nasce no descanso longo (~55%) e expira em 2–4 dias.
   - Quest sorteada: só se houver menos de 2 secundárias ativas (~40%/descanso).
   - Global: no máx. 1; ~20% por descanso longo quando vazio; avança 1 etapa por
     descanso longo (o Mestre costura na ficção); o Mestre encerra quando resolvido. */
export function garantirEventos(ev) {
  return ev && typeof ev === "object" && Array.isArray(ev.locais)
    ? { locais: ev.locais, global: ev.global && typeof ev.global === "object" ? ev.global : null, semGlobalDesde: ev.semGlobalDesde || 0, seq: ev.seq || 1 }
    : { locais: [], global: null, semGlobalDesde: 0, seq: 1 };
}

export function processarDescansoLongoEventos(ev, ctx, { dia, secundariasAtivas = 2 } = {}) {
  const e = garantirEventos(ev);
  const out = { eventos: e, localNovo: null, questNova: null, globalNovo: null, globalAvancou: false, expirados: [] };

  /* expiração dos fios locais */
  e.locais = e.locais.filter((l) => {
    if (l.expiraEm >= dia) return true;
    out.expirados.push(l);
    return false;
  });

  /* ROLAGENS DO MESTRE: cada possibilidade tem seu alvo no d20 e o
     resultado fica registrado (out.rolagens) para o jogador ver. */
  out.rolagens = [];

  /* novo fio local — alvo 10 (55% ≈ 10+ no d20) */
  if (e.locais.length < 3) {
    const r = rolarGatilho("Fio local", 10);
    out.rolagens.push(r);
    if (r.passou) { out.localNovo = gerarEventoLocal(ctx, dia); e.locais.push(out.localNovo); }
  }

  /* quest da fase do arco — alvo 13 (mais rara) */
  if (secundariasAtivas < 2) {
    const r = rolarGatilho("Nova missão", 13);
    out.rolagens.push(r);
    if (r.passou) out.questNova = gerarQuestDeArco(ctx, ctx.fase || "meio");
  }

  /* evento global — alvo 17 (raro); garantido se faz 10 dias sem nenhum */
  if (!e.global) {
    e.semGlobalDesde = e.semGlobalDesde || dia;
    const garantia = dia - e.semGlobalDesde >= 10;
    const r = rolarGatilho("Arco regional", 17, { garantido: garantia });
    out.rolagens.push(r);
    if (r.passou) { out.globalNovo = gerarEventoGlobal(ctx, dia); e.global = out.globalNovo; }
  } else if (e.global.etapa < e.global.etapas.length - 1) {
    /* o arco global só escala se o dado mandar — alvo 12 */
    const r = rolarGatilho(`Escalada de "${e.global.nome}"`, 12);
    out.rolagens.push(r);
    if (r.passou) { e.global = { ...e.global, etapa: e.global.etapa + 1 }; out.globalAvancou = true; }
  }

  out.eventos = e;
  return out;
}
