/* ============================================================
   AS HABILIDADES QUE PEDIAM MECÂNICA PRÓPRIA (v9.47)

   A varredura das 233 habilidades separou três famílias: as que a
   ficção resolve bem (Rastrear, Lábia, Conhecimento Vasto — não há
   número a calcular ali), as que só precisavam virar condição (feitas
   na v9.45) e estas — as que prometem uma REGRA que nenhum resolvedor
   existente sabia cobrar.

   São quatro contratos, e cada um exigia uma coisa que o jogo não
   tinha:

   METAMAGIA guarda um estado que atravessa turnos: "a PRÓXIMA magia"
   é uma promessa sobre o futuro, e não havia onde escrevê-la.

   AS FORMAS trocam o corpo do herói por outro e devolvem depois. O
   caminho barato seria dar um buff e chamar de urso; o que a
   descrição promete é um corpo diferente, com fôlego próprio e sem
   mão para conjurar.

   REERGUER devolve um aliado caído — a única habilidade do jogo que
   olha para um companheiro em 0 PV e o levanta.

   REESCREVER O INSTANTE dizia "desfaz o resultado do último turno", o
   que, ao pé da letra, exigiria guardar um retrato do mundo inteiro a
   cada rodada. Aqui ela desfaz o que o jogador de fato sente ter
   perdido — o dano da última rodada — e a descrição passa a dizer
   isso. Uma regra menor e verdadeira vale mais do que uma grande que
   o código não sustenta.
   ============================================================ */

const NORM = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const txtDe = (h) => NORM(`${(h && h.nome) || ""} ${(h && h.descricao) || ""}`);

/* ============================================================
   1. METAMAGIA — a promessa sobre a PRÓXIMA magia
   ============================================================ */

const METAMAGIAS = [
  { tipo: "alcance", rx: /metamagia:?\s*alcance|estende o alcance/, rotulo: "Alcance", diz: "a próxima magia vai o dobro de longe" },
  { tipo: "gemea",   rx: /metamagia:?\s*gemea|duplica a proxima magia|dois alvos/, rotulo: "Gêmea", diz: "a próxima magia atinge um segundo alvo" },
];

export function metamagiaDe(hab) {
  const t = txtDe(hab);
  if (!t.trim()) return null;
  return METAMAGIAS.find((m) => m.rx.test(t)) || null;
}

export function armarMetamagia(pers, meta) {
  if (!meta) return pers;
  return { ...pers, metamagia: { tipo: meta.tipo, rotulo: meta.rotulo } };
}

/* Consome a metamagia armada. Devolve `{ meta, pers }` — e `meta` é null
   quando não havia nenhuma, que é o caso da esmagadora maioria dos turnos. */
export function consumirMetamagia(pers) {
  const m = pers && pers.metamagia;
  if (!m || !m.tipo) return { meta: null, pers };
  const p = { ...pers };
  delete p.metamagia;
  return { meta: m, pers: p };
}

export const alcanceComMetamagia = (base, meta) => (meta && meta.tipo === "alcance" ? Math.round((Number(base) || 0) * 2) : Number(base) || 0);
export const ehGemea = (meta) => !!(meta && meta.tipo === "gemea");

/* ============================================================
   2. AS FORMAS — o corpo trocado por outro
   ============================================================ */

/* `pvBonus` é fôlego de bicho: entra como PV máximo E como cura, porque é
   um corpo novo, não um curativo. Ao voltar, o teto desce e o PV atual é
   aparado — quem gastou o fôlego da fera não leva o excedente para casa. */
export const FORMAS = [
  { id: "animal",    rx: /forma animal|transforma-?se em um animal/, nome: "Forma Animal",    turnos: 5, pvBonus: 10, pvNv: 1.5, dano: 2, semMagia: true,  conceito: "o corpo se refaz em bicho: pelo, garra e um fôlego que não é seu" },
  { id: "ancestral", rx: /forma ancestral|forma lendaria/,           nome: "Forma Ancestral", turnos: 5, pvBonus: 24, pvNv: 3,   dano: 5, semMagia: false, conceito: "a forma antiga da linhagem, grande demais para o salão" },
];

export function formaDe(hab) {
  const t = txtDe(hab);
  if (!t.trim()) return null;
  return FORMAS.find((f) => f.rx.test(t)) || null;
}

export const estaEmForma = (pers) => !!(pers && pers.forma && pers.forma.nome);

export function assumirForma(pers, hab, rodada = 1) {
  const f = formaDe(hab);
  if (!f) return null;
  if (estaEmForma(pers)) {
    return { ok: false, pers, linha: `⛔ ${hab.nome}: você já está em ${pers.forma.nome} — volte ao seu corpo antes.`, nota: "" };
  }
  const nivel = Math.max(1, Number(pers.nivel) || 1);
  const ganho = Math.max(4, Math.round(f.pvBonus + f.pvNv * nivel));
  const p = {
    ...pers,
    vidaMax: (pers.vidaMax || 0) + ganho,
    vida: (pers.vida || 0) + ganho,
    forma: { id: f.id, nome: f.nome, ate: rodada + f.turnos, ganho, dano: Math.round(f.dano + nivel * 0.4), semMagia: !!f.semMagia },
  };
  return {
    ok: true, pers: p,
    linha: `🐾 ${f.nome} — ${f.conceito}. +${ganho} PV de fôlego, +${p.forma.dano} de dano${f.semMagia ? ", e sem conjurar enquanto durar" : ""} · ${f.turnos} turnos.`,
    nota: `[FORMA ASSUMIDA PELO SISTEMA] Virei ${f.nome}: ${f.conceito}. É um CORPO diferente e o sistema já ajustou os números — narre a transformação e trate-me como essa criatura enquanto durar (o que eu alcanço, o que eu derrubo, o que eu não consigo mais fazer${f.semMagia ? ", inclusive falar e conjurar" : ""}). Não me devolva ao corpo antigo por conta própria: o prazo é do sistema.`,
  };
}

/* Volta ao corpo. `motivo` distingue o prazo do fim da luta — os dois
   desfazem, e o jogador merece saber qual dos dois foi. */
export function desfazerForma(pers, motivo = "prazo") {
  if (!estaEmForma(pers)) return { pers, linha: "", nota: "" };
  const f = pers.forma;
  const vidaMax = Math.max(1, (pers.vidaMax || 0) - (f.ganho || 0));
  const p = { ...pers, vidaMax, vida: Math.min(pers.vida || 0, vidaMax) };
  delete p.forma;
  return {
    pers: p,
    linha: `🐾 ${f.nome} se desfaz — você volta ao seu corpo${motivo === "luta" ? "" : " (o prazo acabou)"}.`,
    nota: `[FORMA DESFEITA PELO SISTEMA] Voltei ao meu corpo: ${f.nome} acabou. Narre a reversão em uma frase e trate-me como eu de novo — não me deixe com garras nem com o tamanho da criatura.`,
  };
}

export function expirarForma(pers, rodada) {
  if (!estaEmForma(pers)) return { pers, linha: "", nota: "" };
  if (Number(pers.forma.ate) > Number(rodada)) return { pers, linha: "", nota: "" };
  return desfazerForma(pers, "prazo");
}

export const danoDaForma = (pers) => (estaEmForma(pers) ? Number(pers.forma.dano) || 0 : 0);
export const magiaTravadaPelaForma = (pers) => !!(estaEmForma(pers) && pers.forma.semMagia);

/* ============================================================
   3. REERGUER — o aliado que estava no chão
   ============================================================ */

/* v9.53: três ficaram de fora do casamento da v9.47 — a varredura das 508
   habilidades as achou prometendo exatamente isto e sem ninguém para cobrar.
   Refrão Teimoso diz "metade do PV" com todas as letras, e é o único caso em
   que a fração vinha escrita na descrição; as outras seguem a régua da casa
   (um aliado, pouco PV; todos, um pouco mais). */
const REERGUERES = [
  { rx: /ressurreicao menor|traz de volta um aliado caido|aliado caido de volta/, todos: false, fracao: 0.25, rotulo: "de volta, com pouco PV" },
  { rx: /ultima estrofe|reergue todos os aliados caidos/,                          todos: true,  fracao: 0.4,  rotulo: "de pé outra vez" },
  { rx: /refrao teimoso|volta cantando junto/,                                     todos: false, fracao: 0.5,  rotulo: "de pé, cantando junto" },
  { rx: /renascimento|todos os aliados caidos se erguem/,                          todos: true,  fracao: 0.35, rotulo: "de volta à vida" },
  { rx: /grande necropole|todos os caidos da cena se erguem/,                      todos: true,  fracao: 0.3,  rotulo: "de pé, servindo a quem os chamou" },
];

export function reerguerDe(hab) {
  const t = txtDe(hab);
  if (!t.trim()) return null;
  return REERGUERES.find((r) => r.rx.test(t)) || null;
}

export function reerguer(pers, hab) {
  const r = reerguerDe(hab);
  if (!r) return null;
  const caidos = ((pers && pers.grupo) || []).filter((g) => g && (g.vida || 0) <= 0);
  if (!caidos.length) return { ok: false, pers, linha: `⛔ ${hab.nome}: ninguém do seu grupo está caído.`, nota: "" };
  const alvos = r.todos ? caidos : [caidos[0]];
  const nomes = [];
  const grupo = (pers.grupo || []).map((g) => {
    if (!alvos.includes(g)) return g;
    const pv = Math.max(1, Math.round((g.vidaMax || 10) * r.fracao));
    nomes.push(`${g.nome} (${pv} PV)`);
    return { ...g, vida: pv, morrendo: false };
  });
  const um = nomes.length === 1;
  return {
    ok: true, pers: { ...pers, grupo },
    linha: `✨ ${hab.nome} — ${nomes.join(", ")} ${um ? "volta" : "voltam"} ${r.rotulo}.`,
    nota: `[ALIADO REERGUIDO PELO SISTEMA] "${hab.nome}" pôs ${nomes.join(", ")} de pé. O PV já subiu — narre o retorno (o ar que volta, os olhos que abrem) e trate ${um ? "essa pessoa" : "essas pessoas"} como ${um ? "viva" : "vivas"} e ${um ? "consciente" : "conscientes"} daqui em diante. Não recalcule.`,
  };
}

/* ============================================================
   4. REESCREVER O INSTANTE
   ============================================================ */

export const ehReescrever = (hab) => /reescrever o instante|desfaz o resultado do ultimo turno|desfaz a ultima rodada/.test(txtDe(hab));

/* Devolve o que a última rodada cobrou. `dano` vem de quem chama (o App
   guarda o golpe da rodada para o gasto "Aguentar" desde a v9.16) — e é
   por isso que esta função não precisa de retrato nenhum do mundo. */
export function reescreverInstante(pers, dano = 0) {
  const d = Math.max(0, Math.round(Number(dano) || 0));
  if (!d) return { ok: false, pers, linha: "⛔ Reescrever o Instante: nada aconteceu com você na última rodada que valha desfazer.", nota: "" };
  const antes = pers.vida || 0;
  const vida = Math.min(pers.vidaMax || antes, antes + d);
  return {
    ok: true,
    pers: { ...pers, vida, morrendo: vida > 0 ? false : pers.morrendo, morte: vida > 0 ? { sucessos: 0, falhas: 0, rolagens: [] } : pers.morte },
    linha: `⏪ Reescrever o Instante — a última rodada não te tocou: +${vida - antes} PV (${vida}/${pers.vidaMax}).`,
    nota: `[INSTANTE REESCRITO PELO SISTEMA] Desfiz o que a última rodada me custou: os ${d} de dano não aconteceram, e estou com ${vida}/${pers.vidaMax} PV. Narre isso como o que é — o tempo dobrando sobre si, o golpe que se desfaz no ar, a memória de uma ferida que ninguém mais tem. Os inimigos NÃO esquecem o que fizeram; só o meu corpo esqueceu.`,
  };
}

/* ============================================================
   5. LIMIARES — o golpe que cobra o ESTADO do alvo (v9.48)

   Achado jogando: "Colheita Final — todo inimigo abaixo de um terço
   de PV cai de uma vez" foi usada contra um zumbi com 23 de 92 PV, e
   o zumbi continuou de pé. Os 8 PM saíram da ficha e nada aconteceu.

   O motivo é instrutivo. A régua que decide se uma habilidade é
   ofensiva procura palavras de violência no texto — "dano", "golpe",
   "chama", "corta". A descrição da Colheita Final não tem NENHUMA
   delas: ela não fala em ferir, fala em cair. A habilidade era
   descartada antes de qualquer conta, e o jogador via só o débito.

   A família inteira estava no mesmo buraco, e ela é maior do que
   parecia: seis habilidades de cinco caminhos diferentes prometem
   algo que depende de QUANTO o alvo já perdeu. Duas dobram o dano
   contra quem está por baixo; quatro simplesmente derrubam.

   Aqui elas viram tabela. Cada linha casa com o texto REAL do
   catálogo — nada de regex esperto: um falso positivo aqui mata um
   inimigo que devia estar de pé, e esse é o pior erro que este jogo
   sabe cometer.
   ============================================================ */

/* `fracao` é do PV MÁXIMO do alvo, e a comparação é estrita: "abaixo
   de um terço" é abaixo, não "no terço". */
const LIMIARES = [
  {
    id: "colheita", rx: /todo inimigo abaixo de um terco/, modo: "abate", escopo: "todos", fracao: 1 / 3,
    fracaoTxt: "um terço", diz: "todo inimigo abaixo de um terço dos PV cai de uma vez",
  },
  {
    id: "execucao_ladino", rx: /elimina alvo com pouco pv/, modo: "abate", escopo: "alvo", fracao: 0.25,
    fracaoTxt: "um quarto", diz: "o alvo com pouco PV é eliminado",
  },
  {
    id: "cobranca", rx: /executa alvo enfraquecido/, modo: "abate", escopo: "alvo", fracao: 0.25,
    fracaoTxt: "um quarto", diz: "o alvo enfraquecido é executado e a alma vai para o patrono",
  },
  {
    id: "uma_respiracao", rx: /o alvo cai antes de reagir, se estiver ferido/, modo: "abate", escopo: "alvo", fracao: 0.5,
    fracaoTxt: "metade", diz: "o alvo já ferido cai antes de reagir",
  },
  {
    id: "execucao_assassino", rx: /contra alvo abaixo de metade da vida, o dano dobra/, modo: "dobra", escopo: "alvo", fracao: 0.5,
    fracaoTxt: "metade", diz: "contra quem está abaixo da metade, o dano dobra",
  },
  {
    id: "golpe_decisivo", rx: /dano massivo em alvo abaixo de metade do pv/, modo: "dobra", escopo: "alvo", fracao: 0.5,
    fracaoTxt: "metade", diz: "abaixo da metade dos PV, o golpe dobra",
  },
];

/* As habilidades ÚNICAS não têm texto fixo — elas nascem de um molde, e
   o molde "execucao" já prometia o dobro abaixo da metade desde a v7.4.
   Era a única desta família com código, e agora entra pela mesma porta. */
const MOLDE_EXECUCAO = {
  id: "molde_execucao", modo: "dobra", escopo: "alvo", fracao: 0.5,
  fracaoTxt: "metade", diz: "contra quem está abaixo da metade, o dano dobra",
};

export function limiarDe(hab) {
  if (!hab) return null;
  if (hab.molde === "execucao") return MOLDE_EXECUCAO;
  const t = txtDe(hab);
  if (!t.trim()) return null;
  return LIMIARES.find((l) => l.rx.test(t)) || null;
}

export function abaixoDoLimiar(alvo, fracao) {
  const max = Number(alvo && alvo.vidaMax) || 0;
  const pv = Number(alvo && alvo.vida) || 0;
  if (max <= 0 || pv <= 0) return false;
  return pv < max * (Number(fracao) || 0);
}

/* Quem cai. Função pura sobre a lista de inimigos — `podeCair` é a
   porta por onde quem chama recusa o que não pode ser abatido (a
   Regra do Degrau: o poder de um mortal não colhe um deus). */
export function colherPorLimiar(inimigos, regra, { podeCair } = {}) {
  if (!regra || regra.modo !== "abate") return null;
  const lista = Array.isArray(inimigos) ? inimigos : [];
  const alvos = lista.filter((e) => e && !e.derrotado && (e.vida || 0) > 0 && abaixoDoLimiar(e, regra.fracao) && (!podeCair || podeCair(e)));
  const nomes = new Set(alvos.map((e) => e.nome));
  return {
    nomes: alvos.map((e) => e.nome),
    lista: lista.map((e) => (nomes.has(e.nome) ? { ...e, vida: 0, derrotado: true, ultimoDano: e.vida } : e)),
  };
}

/* ============================================================
   6. A GUARDA — defesa que dura alguns turnos (v9.53)

   Cinco habilidades prometiam "aumenta a defesa por N turnos" e nenhuma
   somava um ponto à CA: Casca de Carvalho, Pele Arcana, Forma Dracônica,
   Enxerto Mecânico e Elixir de Combate. O jogador gastava PM, lia a linha
   bonita e continuava sendo acertado exatamente como antes.

   A ficha já tinha onde guardar isso — `bonusDefesa`, que as dádivas épicas
   usam desde a v9.32 e `defesaDe` soma. O que faltava era o PRAZO: dádiva é
   para sempre, guarda vence. Por isso não dá para reusar o campo: uma lista
   própria, com `ate` em rodadas, do mesmo jeito que a forma e a invocação.

   O valor não sai da descrição — "aumenta MUITO a defesa" não é número. Sai
   da tabela, e a tabela é a régua: +2 é uma peça de armadura, +4 é uma
   armadura inteira. Nada acima disso, porque defesa alta é a estatística
   que mais rápido quebra um combate.
   ============================================================ */

/* `tipo`: "defesa" soma à CA; "esquiva" dá desvantagem a quem te ataca;
   "intocavel" faz o golpe errar. A escada é de propósito — quanto mais
   absoluta a promessa, mais curto o prazo, porque "nada te atinge" por três
   turnos é um combate inteiro sem combate. */
export const GUARDAS = [
  { id: "casca_carvalho", rx: /casca de carvalho/, valor: 4, turnos: 3, conceito: "a pele vira casca: o golpe encontra madeira antes de encontrar carne" },
  { id: "pele_arcana",    rx: /pele arcana/,       valor: 3, turnos: 2, conceito: "a magia endurece a pele num verniz que a lâmina não gosta" },
  { id: "forma_draconica", rx: /forma draconica/,  valor: 3, turnos: 3, conceito: "escamas sobem pelos braços e as costas ganham peso de asa" },
  { id: "enxerto_mecanico", rx: /enxerto mecanico/, valor: 3, turnos: 4, conceito: "peças presas ao próprio corpo: mais resistência, menos gente" },
  { id: "elixir_combate", rx: /elixir de combate/, valor: 2, turnos: 3, conceito: "o elixir desce queimando e o corpo responde mais firme" },
  /* v9.53: as quatro que prometiam invulnerabilidade. "Por um turno, nada te
     atinge" é a única que fica absoluta — e fica porque dura UM turno. As de
     três e quatro turnos viram desvantagem: um combate inteiro sem poder ser
     acertado não é uma habilidade, é o fim do combate. */
  { id: "vazio_perfeito", rx: /vazio perfeito|nada te atinge/, tipo: "intocavel", turnos: 1, conceito: "o corpo para de estar onde o golpe procura" },
  { id: "danca_sem_vulto", rx: /danca sem vulto|tudo que vier em sua direcao erra/, tipo: "esquiva", turnos: 3, conceito: "o corpo vira dança: o que vem em sua direção passa por onde você não está mais" },
  { id: "nada_me_alcanca", rx: /nada me alcanca|nenhum efeito mental ou magico funciona/, tipo: "esquiva", soMagia: true, turnos: 4, conceito: "a mente fecha como punho: o que é feitiço escorrega e não encontra onde entrar" },
  { id: "improvavel", rx: /improvavel|tudo que puder dar certo/, tipo: "esquiva", turnos: 3, conceito: "a sorte entorta a favor: o que podia dar certo, dá" },
];

export function guardaDe(hab) {
  const t = txtDe(hab);
  if (!t.trim()) return null;
  return GUARDAS.find((g) => g.rx.test(t)) || null;
}

export const guardasAtivas = (pers) => ((pers && pers.guardas) || []).filter(Boolean);
export const defesaDeGuarda = (pers) => guardasAtivas(pers).reduce((s, g) => s + (Number(g.valor) || 0), 0);

/* O golpe simplesmente NÃO acerta: só a guarda de um turno faz isso. */
export const estaIntocavel = (pers) => guardasAtivas(pers).some((g) => g.tipo === "intocavel");
/* Quem ataca este herói rola com desvantagem. `magico` distingue a guarda que
   só morde feitiço (Nada Me Alcança) da que morde tudo. */
export function esquivaDeGuarda(pers, { magico = false } = {}) {
  return guardasAtivas(pers).some((g) => g.tipo === "esquiva" && (!g.soMagia || magico));
}

export function erguerGuarda(pers, hab, rodada = 1) {
  const g = guardaDe(hab);
  if (!g) return null;
  const jaTem = ((pers && pers.guardas) || []).some((x) => x.id === g.id);
  if (jaTem) return { ok: false, pers, linha: `⛔ ${hab.nome}: essa guarda já está de pé.`, nota: "" };
  const guardas = [...((pers && pers.guardas) || []), { id: g.id, nome: hab.nome, valor: g.valor, tipo: g.tipo || "defesa", soMagia: !!g.soMagia, ate: rodada + g.turnos }];
  const efeito = g.tipo === "intocavel" ? "nenhum golpe te acerta"
    : g.tipo === "esquiva" ? `quem ${g.soMagia ? "te conjura" : "te ataca"} rola com desvantagem`
    : `+${g.valor} de defesa`;
  return {
    ok: true, pers: { ...pers, guardas },
    linha: `🛡 ${hab.nome} — ${g.conceito}. ${efeito} · ${g.turnos} turno${g.turnos > 1 ? "s" : ""}.`,
    nota: `[GUARDA ERGUIDA PELO SISTEMA] "${hab.nome}": ${g.conceito}. O sistema já aplicou (${efeito}) e conta os ${g.turnos} turnos. Narre o que mudou no meu corpo e mostre os golpes resvalando — não invente número, não estenda o prazo e não a desfaça.`,
  };
}

/* Vence por rodada, como a forma e a invocação. Devolve o que caiu. */
export function expirarGuardas(pers, rodada) {
  const ativas = (pers && pers.guardas) || [];
  if (!ativas.length) return { pers, linhas: [] };
  const ficam = ativas.filter((g) => Number(g.ate) > Number(rodada));
  if (ficam.length === ativas.length) return { pers, linhas: [] };
  const caidas = ativas.filter((g) => !ficam.includes(g));
  const p = { ...pers };
  if (ficam.length) p.guardas = ficam; else delete p.guardas;
  return { pers: p, linhas: caidas.map((g) => `🛡 ${g.nome} se desfaz — a defesa volta ao normal.`) };
}

/* A luta acabou: guarda de combate não atravessa a porta. */
export function baixarGuardas(pers) {
  if (!((pers && pers.guardas) || []).length) return { pers, linha: "" };
  const p = { ...pers }; delete p.guardas;
  return { pers: p, linha: "🛡 Com o fim da luta, sua guarda baixa." };
}

/* ============================================================
   7. O QUE O GOLPE IGNORA — cobertura, distância e armadura (v9.54)

   Sete habilidades dizem "ignora" com todas as letras e nenhuma
   ignorava coisa alguma. Quatro furam armadura (Quebra-Guarda, Mira do
   Batedor, Punho que Rompe, Punho de Pedra) e três furam cobertura
   (Cano Longo, Tiro Calibrado, Olho que Mede o Vento).

   E o buraco era mais fundo do que "faltou somar um número": a régua
   que decide se uma habilidade é ofensiva procura palavras de violência
   no texto, e "Ignora cobertura, penumbra e distância neste disparo"
   não tem nenhuma. Era o mesmo poço da Colheita Final — a habilidade
   nem chegava à conta. O jogador gastava o PM, lia a frase e o disparo
   não acontecia. Por isso o leitor daqui é consultado ANTES daquela
   régua, exatamente como o limiar.

   ARMADURA NÃO É COBERTURA, e as duas continuam separadas: furar a
   couraça de alguém não faz o muro na frente dele desaparecer. Quem
   ignora armadura acerta contra o corpo nu — os 10 que são a base de
   toda defesa nesta casa —, mas ainda tem o muro pela frente.
   ============================================================ */

/* A defesa de um corpo sem nada vestido. É o mesmo 10 de onde `defesaDe`
   parte antes de somar destreza, equipamento e guarda. */
export const DEFESA_NUA = 10;

const IGNORAM = [
  { id: "quebra_guarda",  rx: /quebra-?guarda|ignora a armadura do alvo neste golpe/,        armadura: true, diz: "passa por dentro da armadura" },
  { id: "mira_batedor",   rx: /mira do batedor|disparo calculado que ignora a armadura/,      armadura: true, diz: "a flecha encontra a fresta" },
  { id: "punho_rompe",    rx: /punho que rompe|ignora a defesa do alvo neste ataque/,         armadura: true, diz: "o punho atravessa a guarda" },
  { id: "punho_pedra",    rx: /punho de pedra|ignora armadura e racha escudo/,                armadura: true, diz: "a placa cede e o escudo racha" },
  { id: "cano_longo",     rx: /cano longo|longuissimo alcance que ignora cobertura/,          cobertura: true, alcanceM: 90, diz: "o tiro vem de onde ninguém esperava" },
  { id: "tiro_calibrado", rx: /tiro calibrado|disparo preciso que ignora cobertura/,          cobertura: true, diz: "o disparo entra pelo vão" },
  { id: "olho_vento",     rx: /olho que mede o vento|ignora cobertura, penumbra e distancia/, cobertura: true, alcanceM: 90, diz: "vento, sombra e distância deixam de contar" },
];

export function ignoraDoGolpe(hab) {
  const t = txtDe(hab);
  if (!t.trim()) return null;
  return IGNORAM.find((g) => g.rx.test(t)) || null;
}

/* A linha que o jogador lê. Nasce junto do efeito, como toda linha desta
   casa: se um dia o efeito mudar, a frase muda no mesmo lugar. */
export function linhaDoIgnorar(ig, hab) {
  if (!ig) return "";
  const o = ig.armadura ? "a armadura do alvo" : "a cobertura e a distância";
  return `🎯 ${(hab && hab.nome) || "O golpe"} — ${ig.diz}: este ataque ignora ${o}.`;
}
export function notaDoIgnorar(ig, hab) {
  if (!ig) return "";
  const o = ig.armadura
    ? "a ARMADURA do alvo não conta neste golpe — o sistema já rolou contra o corpo, não contra a placa"
    : "a COBERTURA e a DISTÂNCIA não contam neste disparo — o sistema já rolou como se o alvo estivesse em campo aberto";
  return `[GOLPE QUE IGNORA — RESOLVIDO PELO SISTEMA] "${(hab && hab.nome) || "O golpe"}": ${o}. Narre ${ig.diz} e não descreva o alvo se protegendo do que este golpe atravessa. O número já saiu; não o recalcule.`;
}

/* ============================================================
   8. A PRESSA — agir duas vezes na mesma rodada (v9.54)

   Três habilidades prometem uma segunda ação e nenhuma tinha código:
   "Você age duas vezes por rodada durante quatro turnos", "Você age
   duas vezes neste turno", "ataques dobrados por quatro turnos".

   O caminho barato seria dobrar o número de golpes do ataque de arma.
   Não serve: quem conjura não bate, e a promessa é "AGIR" duas vezes,
   não "bater" duas vezes. O jogo já tem onde escrever isso — a economia
   de ação da rodada, que nasce em `economiaNova` e é gasta tanto pelo
   golpe quanto pela conjuração. A pressa apenas faz essa economia
   nascer com duas ações em vez de uma, e todo o resto do motor continua
   sem saber que ela existe.

   Vence por rodada, como a forma, a invocação e a guarda — no mesmo
   lugar, para não virar o quinto relógio que alguém esquece de ligar.
   ============================================================ */

export const PRESSAS = [
  { id: "mais_rapido_olho", rx: /mais rapido que o olho|age duas vezes por rodada/, acoes: 2, turnos: 4, conceito: "o corpo termina o gesto antes de o olho começar a ver" },
  { id: "forma_conjunta",   rx: /forma conjunta|ataques dobrados por quatro turnos/, acoes: 2, turnos: 4, conceito: "você e a fera viram uma criatura só, com dois pares de garras" },
  { id: "instante_roubado", rx: /instante roubado|age duas vezes neste turno/,       acoes: 2, turnos: 1, conceito: "um instante subtraído do mundo, e só você o gasta" },
];

export function pressaDe(hab) {
  const t = txtDe(hab);
  if (!t.trim()) return null;
  return PRESSAS.find((p) => p.rx.test(t)) || null;
}

/* Quantas ações a rodada dá. Um, para todo mundo, quase sempre. */
export function acoesPorRodada(pers) {
  const p = pers && pers.pressa;
  return p && Number(p.acoes) > 1 ? Number(p.acoes) : 1;
}
export const estaApressado = (pers) => acoesPorRodada(pers) > 1;

export function apressar(pers, hab, rodada = 1) {
  const p = pressaDe(hab);
  if (!p) return null;
  if (pers && pers.pressa) return { ok: false, pers, linha: `⛔ ${hab.nome}: você já está agindo duas vezes por rodada.`, nota: "" };
  return {
    ok: true,
    pers: { ...pers, pressa: { id: p.id, nome: hab.nome, acoes: p.acoes, ate: rodada + p.turnos } },
    linha: `⏩ ${hab.nome} — ${p.conceito}. Você age ${p.acoes} vezes por rodada · ${p.turnos} turno${p.turnos > 1 ? "s" : ""}.`,
    nota: `[PRESSA CONCEDIDA PELO SISTEMA] "${hab.nome}": ${p.conceito}. O sistema já me deu ${p.acoes} ações por rodada e conta os ${p.turnos} turnos. Narre a velocidade — dois gestos onde cabia um — e deixe que eu declare as duas; não aja por mim, não estenda o prazo e não me tire a segunda ação.`,
  };
}

export function expirarPressa(pers, rodada) {
  const p = pers && pers.pressa;
  if (!p) return { pers, linha: "" };
  if (Number(p.ate) > Number(rodada)) return { pers, linha: "" };
  const novo = { ...pers };
  delete novo.pressa;
  return { pers: novo, linha: `⏩ ${p.nome} passa — você volta a agir uma vez por rodada.` };
}

export function baixarPressa(pers) {
  if (!(pers && pers.pressa)) return { pers, linha: "" };
  const novo = { ...pers };
  delete novo.pressa;
  return { pers: novo, linha: "⏩ Com o fim da luta, a pressa passa." };
}

export const HABILIDADES_PROMPT = `HABILIDADES DE REGRA PRÓPRIA (v9.54 — o sistema resolve, você narra):
- IGNORAR: alguns golpes atravessam o que normalmente protege — a armadura do alvo, ou a cobertura e a distância. O sistema já rolou assim; narre a passagem e não descreva o alvo se defendendo com aquilo que o golpe atravessou.
- PRESSA: algumas habilidades dão DUAS ações por rodada durante alguns turnos. Quem declara as duas sou eu — narre a velocidade e espere; não aja no meu lugar.
- GUARDA: algumas habilidades erguem uma defesa que dura alguns turnos. O sistema soma o número à minha defesa e conta o prazo — narre o corpo que mudou e os golpes que resvalam, sem inventar valor nem estender a duração.
- METAMAGIA arma a PRÓXIMA magia (mais alcance, ou um segundo alvo) e o sistema a consome sozinho quando ela sai. Você não escolhe qual magia recebe o efeito nem o aplica duas vezes.
- FORMAS (animal, ancestral) trocam o CORPO do herói: outro fôlego, outro golpe, e — na forma animal — nenhuma conjuração e nenhuma fala articulada. Trate-o como a criatura enquanto durar, inclusive no que ele deixa de conseguir fazer. O prazo é do sistema; não o devolva ao corpo antigo por conta própria.
- REERGUER põe um aliado caído de pé com uma fração do PV. O número já está aplicado: narre o retorno, não o milagre genérico.
- REESCREVER O INSTANTE desfaz o dano da última rodada no corpo do herói — e só isso. Os inimigos lembram do que fizeram, o mundo não volta atrás, e nada mais é desfeito.
- LIMIAR: algumas habilidades cobram o ESTADO do alvo — abaixo de uma fração dos PV, o dano dobra ou o inimigo simplesmente CAI, sem rolagem. Quem mede o PV e decide quem tomba é o sistema, e o envelope traz os nomes prontos. Narre a queda de quem o sistema derrubou e NÃO derrube mais ninguém: quem não estava fraco o bastante continua de pé, mesmo que a cena peça o contrário.`;
