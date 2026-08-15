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

const REERGUERES = [
  { rx: /ressurreicao menor|traz de volta um aliado caido|aliado caido de volta/, todos: false, fracao: 0.25, rotulo: "de volta, com pouco PV" },
  { rx: /ultima estrofe|reergue todos os aliados caidos/,                          todos: true,  fracao: 0.4,  rotulo: "de pé outra vez" },
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

export const HABILIDADES_PROMPT = `HABILIDADES DE REGRA PRÓPRIA (v9.47 — o sistema resolve, você narra):
- METAMAGIA arma a PRÓXIMA magia (mais alcance, ou um segundo alvo) e o sistema a consome sozinho quando ela sai. Você não escolhe qual magia recebe o efeito nem o aplica duas vezes.
- FORMAS (animal, ancestral) trocam o CORPO do herói: outro fôlego, outro golpe, e — na forma animal — nenhuma conjuração e nenhuma fala articulada. Trate-o como a criatura enquanto durar, inclusive no que ele deixa de conseguir fazer. O prazo é do sistema; não o devolva ao corpo antigo por conta própria.
- REERGUER põe um aliado caído de pé com uma fração do PV. O número já está aplicado: narre o retorno, não o milagre genérico.
- REESCREVER O INSTANTE desfaz o dano da última rodada no corpo do herói — e só isso. Os inimigos lembram do que fizeram, o mundo não volta atrás, e nada mais é desfeito.`;
