/* ============================================================
   RELÓGIOS DE PROGRESSO (v9.18) — a ameaça que se vê chegando

   O buraco: fora do combate, nada na Taverna tinha aposta. A
   nêmesis "te caçava" só na prosa; o evento global avançava em
   etapas que o jogador nunca via; a Guarda ficava furiosa sem que
   isso significasse nada. Tudo era adjetivo. E quando a ameaça é
   adjetivo, o jogador não decide nada em relação a ela — ele lê
   sobre ela.

   O relógio resolve isso com a coisa mais simples que existe: uma
   barra de N pedaços que enche. "A nêmesis fecha o cerco ●●●○○○".
   O jogador olha, entende, e passa a jogar EM RELAÇÃO àquilo —
   apressar, desviar, atacar a origem. É a peça que transforma
   tempo em recurso, e é por isso que ela vem depois do descanso:
   agora dormir custa alguma coisa em algum outro lugar.

   TRÊS DECISÕES QUE VALEM ESTAR ESCRITAS:

   1) QUEM AVANÇA O PONTEIRO É O SISTEMA. O Mestre pode PEDIR um
      relógio (ele conhece a ficção melhor que qualquer tabela),
      mas quem valida, quem enche e quem dispara a consequência é
      o código. Deixar a IA mover o ponteiro seria devolver a ela
      exatamente o poder que o resto do jogo passou dois meses
      tirando: decidir sozinha quando a coisa ruim acontece.

   2) TODO AVANÇO TEM CAUSA VISÍVEL. Cada tique diz por que
      aconteceu ("mais uma noite passou", "você falhou feio"). Um
      ponteiro que anda sem explicação é pior que ponteiro nenhum:
      vira aleatoriedade com cara de sistema.

   3) ENCHER NÃO É FIM DE JOGO. O relógio cheio dispara um EVENTO
      — a nêmesis aparece, o ritual se completa, a porta se fecha —
      e some. Consequência, não derrota. Um relógio que mata o
      personagem ao encher só ensinaria o jogador a nunca deixar
      encher, e aí ele nunca correria risco nenhum.
   ============================================================ */

export const TAMANHOS = [4, 6, 8];
export const MAX_RELOGIOS = 6;

/* ---------------- OS TIPOS ----------------
   O tipo decide a cor, o verbo e — o que importa — QUEM enche.
   Ameaça enche sozinha com o tempo; oportunidade só enche com o
   trabalho do jogador. É a diferença entre o mundo agindo e o
   jogador agindo, e ela precisa ser visível de longe. */
export const TIPOS = {
  ameaca: {
    id: "ameaca", icone: "⚠", rotulo: "Ameaça", cor: "danger",
    verbo: "se aproxima", desc: "avança sozinha com o tempo — ignorar custa caro",
  },
  cacada: {
    id: "cacada", icone: "🐺", rotulo: "Caçada", cor: "danger",
    verbo: "fecha o cerco", desc: "alguém está atrás de você e cada rastro deixado ajuda",
  },
  oportunidade: {
    id: "oportunidade", icone: "🗝", rotulo: "Oportunidade", cor: "ok",
    verbo: "se abre", desc: "só avança com o seu trabalho — nada acontece se você não agir",
  },
  obra: {
    id: "obra", icone: "⚒", rotulo: "Obra", cor: "amber",
    verbo: "toma forma", desc: "algo longo que você começou e que só o seu esforço termina",
  },
};
export function tipoDe(id) { return TIPOS[id] || TIPOS.ameaca; }

/* ---------------- OS GATILHOS ----------------
   O que faz o ponteiro andar. Deliberadamente poucos e todos
   deterministas: se um gatilho precisasse de julgamento, o
   julgamento voltaria para a IA. */
export const GATILHOS = {
  noite: { id: "noite", rotulo: "a cada noite inteira" },
  turno_mundo: { id: "turno_mundo", rotulo: "conforme o mundo se move" },
  falha: { id: "falha", rotulo: "quando você falha feio" },
  sucesso: { id: "sucesso", rotulo: "quando você tem êxito" },
  viagem: { id: "viagem", rotulo: "a cada viagem" },
  manual: { id: "manual", rotulo: "só por acontecimento" },
};

const norm = (s) => String(s || "").trim();

export function garantirRelogios(lista) {
  if (!Array.isArray(lista)) return [];
  return lista
    .filter((r) => r && r.nome && Number.isFinite(r.segmentos))
    .map((r) => ({
      id: r.id || `rel_${Math.random().toString(36).slice(2, 8)}`,
      nome: norm(r.nome).slice(0, 60),
      tipo: TIPOS[r.tipo] ? r.tipo : "ameaca",
      segmentos: TAMANHOS.includes(r.segmentos) ? r.segmentos : 6,
      cheios: Math.max(0, Math.min(TAMANHOS.includes(r.segmentos) ? r.segmentos : 6, Math.floor(Number(r.cheios) || 0))),
      gatilho: GATILHOS[r.gatilho] ? r.gatilho : "noite",
      consequencia: norm(r.consequencia).slice(0, 220),
      fonte: norm(r.fonte).slice(0, 40),
      criadoEm: Number.isFinite(r.criadoEm) ? r.criadoEm : 0,
    }))
    .slice(0, MAX_RELOGIOS);
}

export function criarRelogio({ nome, tipo = "ameaca", segmentos = 6, gatilho = "noite", consequencia = "", fonte = "sistema", dia = 0, id }) {
  return garantirRelogios([{ id, nome, tipo, segmentos, cheios: 0, gatilho, consequencia, fonte, criadoEm: dia }])[0] || null;
}

export function relogioPorId(lista, id) { return garantirRelogios(lista).find((r) => r.id === id) || null; }

/* Já existe um relógio para esta coisa? Compara por FONTE, não por
   nome: a fonte é estável ("nemesis"), o nome muda com a ficção. */
export function temDaFonte(lista, fonte) {
  return garantirRelogios(lista).some((r) => r.fonte === fonte);
}

/* ---------------- AVANÇAR ----------------
   Devolve { relogios, avancados: [{relogio, de, para, porque}], cheios: [relogio] }.
   Os que encheram SAEM da lista — o relógio cheio virou acontecimento,
   e acontecimento não fica pendurado na tela. */
export function avancar(lista, gatilho, { quanto = 1, porque = "", apenasIds = null } = {}) {
  const atual = garantirRelogios(lista);
  const avancados = [], cheios = [], restantes = [];
  for (const r of atual) {
    const alvo = apenasIds ? apenasIds.includes(r.id) : r.gatilho === gatilho;
    if (!alvo || r.cheios >= r.segmentos) { restantes.push(r); continue; }
    const para = Math.min(r.segmentos, r.cheios + Math.max(1, quanto));
    const novo = { ...r, cheios: para };
    avancados.push({ relogio: novo, de: r.cheios, para, porque: porque || GATILHOS[gatilho]?.rotulo || "" });
    if (para >= r.segmentos) cheios.push(novo);
    else restantes.push(novo);
  }
  return { relogios: restantes, avancados, cheios };
}

/* Avanço manual por id — é o que a maioria dos acontecimentos usa. */
export function avancarUm(lista, id, { quanto = 1, porque = "" } = {}) {
  return avancar(lista, null, { quanto, porque, apenasIds: [id] });
}

export function removerRelogio(lista, id) {
  return garantirRelogios(lista).filter((r) => r.id !== id);
}

/* ---------------- AS SEMENTES DO SISTEMA ----------------
   Relógios que o código sabe criar sozinho, a partir de estado que
   ele já tem. É o que garante que o sistema funcione mesmo se o
   Mestre nunca propuser nada. */
export function semearRelogios(lista, ctx = {}) {
  const atual = garantirRelogios(lista);
  const novos = [];
  const cabe = () => atual.length + novos.length < MAX_RELOGIOS;

  /* A NÊMESIS. Ela já existia, com ódio e tudo — e não fazia nada com
     isso. Agora o ódio vira ponteiro: quanto mais alto, menor o
     relógio, e mais cedo ela aparece. */
  const nem = ctx.nemesis;
  if (cabe() && nem && nem.nome && nem.status !== "derrotada" && !temDaFonte(atual, "nemesis")) {
    const odio = Number(nem.odio) || 0;
    if (odio >= 30) {
      novos.push(criarRelogio({
        nome: `${nem.nome} fecha o cerco`, tipo: "cacada",
        segmentos: odio >= 70 ? 4 : odio >= 50 ? 6 : 8,
        gatilho: "noite", fonte: "nemesis", dia: ctx.dia || 0,
        consequencia: `${nem.nome} te encontra — e não vem sozinha.`,
      }));
    }
  }

  /* O EVENTO GLOBAL. Ele já tinha etapas; o jogador é que nunca as
     via. O relógio é a mesma coisa, só que na tela. */
  const g = ctx.global;
  if (cabe() && g && g.nome && Array.isArray(g.etapas) && g.etapas.length && !temDaFonte(atual, "global")) {
    novos.push(criarRelogio({
      nome: g.nome, tipo: "ameaca",
      segmentos: TAMANHOS.includes(g.etapas.length) ? g.etapas.length : 8,
      gatilho: "noite", fonte: "global", dia: ctx.dia || 0,
      consequencia: `${g.nome} chega ao seu desfecho — a região não volta a ser o que era.`,
    }));
  }

  /* A GUARDA. Fama alta com facção em guerra é uma caçada esperando
     para acontecer, e o sistema já sabe as duas coisas. */
  if (cabe() && (ctx.fama || 0) >= 60 && ctx.emGuerra && !temDaFonte(atual, "guarda")) {
    novos.push(criarRelogio({
      nome: `A ${ctx.emGuerra} põe um preço na sua cabeça`, tipo: "cacada",
      segmentos: 8, gatilho: "viagem", fonte: "guarda", dia: ctx.dia || 0,
      consequencia: `Caçadores de recompensa da ${ctx.emGuerra} te alcançam na estrada.`,
    }));
  }

  return { relogios: [...atual, ...novos], novos };
}

/* ---------------- O QUE O MESTRE PODE PEDIR ----------------
   Ele conhece a ficção melhor que qualquer tabela, então PODE
   propor um relógio. Só que propor não é criar: o sistema apara o
   tamanho, força um gatilho da lista, recusa duplicata e recusa
   quando já há relógios demais. É o mesmo contrato do resto da
   casa — a IA sugere, o código decide. */
export function aceitarProposta(lista, proposta, dia = 0) {
  const atual = garantirRelogios(lista);
  if (!proposta || !norm(proposta.nome)) return { ok: false, motivo: "sem nome" };
  if (atual.length >= MAX_RELOGIOS) return { ok: false, motivo: "já há relógios demais em jogo" };
  const nome = norm(proposta.nome).slice(0, 60);
  if (atual.some((r) => r.nome.toLowerCase() === nome.toLowerCase())) return { ok: false, motivo: "já existe um relógio com esse nome" };
  /* fonte "mestre" com sufixo: dois pedidos diferentes dele podem coexistir,
     mas nunca colidem com os do sistema (nemesis, global, guarda). */
  const r = criarRelogio({
    nome,
    tipo: TIPOS[proposta.tipo] ? proposta.tipo : "ameaca",
    segmentos: TAMANHOS.includes(Number(proposta.segmentos)) ? Number(proposta.segmentos) : 6,
    gatilho: GATILHOS[proposta.gatilho] ? proposta.gatilho : "noite",
    consequencia: norm(proposta.consequencia),
    fonte: `mestre:${nome.toLowerCase().slice(0, 24)}`,
    dia,
  });
  if (!r) return { ok: false, motivo: "proposta malformada" };
  return { ok: true, relogios: [...atual, r], relogio: r };
}

/* ---------------- OS TEXTOS ---------------- */
export function barraDe(r) {
  return "●".repeat(r.cheios) + "○".repeat(Math.max(0, r.segmentos - r.cheios));
}

export function linhaDoAvanco(av) {
  const t = tipoDe(av.relogio.tipo);
  return `${t.icone} ${av.relogio.nome} ${barraDe(av.relogio)} (${av.para}/${av.relogio.segmentos}) — ${av.porque}`;
}

/* O envelope do relógio CHEIO. É o momento em que o relógio deixa de
   ser aviso e vira cena, e o Mestre precisa saber que não tem escolha
   sobre SE aquilo acontece — só sobre COMO. */
export function envelopeCheio(r) {
  const t = tipoDe(r.tipo);
  return `[RELÓGIO COMPLETO — ACONTECIMENTO DO SISTEMA] O relógio "${r.nome}" (${t.rotulo.toLowerCase()}) encheu: ${barraDe(r)}. ${r.consequencia || `${r.nome} chega ao seu desfecho.`}

REGRA DESTE ENVELOPE: isto ACONTECE agora, nesta cena. Você não adia, não atenua, não transforma em "quase" e não resolve com um aviso de que talvez aconteça um dia. O que você decide é a FORMA — quem chega, por onde, com que cara, o que diz. Narre como consequência do que já vinha se acumulando, nunca como coincidência. Não mencione relógio, ponteiro nem sistema.`;
}

export function envelopeNovo(r) {
  const t = tipoDe(r.tipo);
  return `[RELÓGIO ABERTO — REGISTRADO PELO SISTEMA] Começou a contar: "${r.nome}" (${t.rotulo.toLowerCase()}, ${r.segmentos} passos, ${GATILHOS[r.gatilho].rotulo}). Deixe isso PRESENTE na ficção de agora em diante — um sinal aqui, um comentário ali, a sensação de que algo se move. Não anuncie como mecânica e não diga em quantos passos está.`;
}

export function resumoRelogiosPrompt(lista) {
  const rs = garantirRelogios(lista);
  if (!rs.length) return "";
  const linhas = rs.map((r) => {
    const t = tipoDe(r.tipo);
    const perto = r.cheios >= r.segmentos - 1;
    return `- ${t.icone} "${r.nome}" ${barraDe(r)} ${r.cheios}/${r.segmentos}${perto ? " — QUASE LÁ" : ""}${r.consequencia ? ` · ao encher: ${r.consequencia}` : ""}`;
  });
  return `RELÓGIOS EM CURSO (do sistema — quem move o ponteiro é o código, NUNCA você):
${linhas.join("\n")}
Use isto como TENSÃO DE FUNDO: quanto mais cheio, mais a ficção deve sentir a coisa se aproximando (sinais, boatos, pressa alheia). Nunca faça a consequência acontecer por conta própria — ela chega por envelope quando encher. E nunca cite números, barras ou a palavra "relógio".`;
}

export const RELOGIOS_PROMPT = `RELÓGIOS DE PROGRESSO (v9.18):
- Certas ameaças e obras longas têm um contador que o SISTEMA mantém. Você recebe o estado deles a cada turno e deve deixá-los presentes na ficção — sinais, boatos, pressa — sem nunca citar números, barras ou a palavra "relógio".
- Você NUNCA avança um relógio e NUNCA faz a consequência acontecer por conta própria. Ela chega por envelope, e aí é obrigatória.
- Você PODE PROPOR um relógio novo quando a ficção pedir (um ritual em curso, uma perseguição que começa, uma obra que o jogador iniciou), pelo campo "relogio_novo" da sua resposta. Propor não é criar: o sistema aceita, apara ou recusa. Proponha no máximo um por turno, e só quando algo de fato começou em cena.`;
