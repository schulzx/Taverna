/* ============================================================
   INVOCAÇÕES (v9.46) — o que é chamado ao campo e some sozinho

   Treze habilidades espalhadas por quatro classes prometiam a mesma
   coisa e nenhuma entregava: "Chama uma fera espiritual que luta por
   3 turnos", "Constrói uma torreta que atira por 4 turnos", "Ergue
   esqueletos que lutam ao seu lado", "Convoca um aliado animal por 5
   turnos". O sistema resolvia todas como qualquer outra habilidade —
   descontava o PM, procurava dano na descrição, não achava, e
   devolvia o turno ao Mestre. O bicho invocado existia só na frase
   que a IA escrevia depois.

   A CLASSE INTEIRA DO INVOCADOR dependia disso. Onze das doze
   habilidades dele mencionam "a invocação": Elo Vital divide o dano
   com ela, Comando: Atacar manda ela atacar, Sacrifício Arcano a
   desfaz por PM, Portal Duplo permite duas, Voz de Comando as faz
   agir duas vezes. Sem a primeira existir, as outras dez eram texto
   sobre um objeto que nunca esteve lá.

   A FORMA JÁ EXISTIA. Um companheiro é uma ficha com PV, PM, classe,
   habilidades e uma cabeça que decide o turno (companheiros.js), e o
   grid já o posiciona, move e deixa apanhar. Uma invocação é um
   companheiro com PRAZO — e por isso este arquivo não inventa um
   segundo motor de aliado: ele monta a mesma ficha, marca `invocada`
   e `expiraEm`, e deixa o motor que já existe fazer o resto.

   O que muda por ser invocação, e só isso:
   - não conta no limite do grupo nem entra no códex de recrutados;
   - some sozinha quando o prazo vence ou a luta acaba;
   - não ganha XP, não sobe de nível, não cria vínculo;
   - o dono tem um TETO de quantas sustenta ao mesmo tempo.
   ============================================================ */

const NORM = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/* `pv` e `dano` escalam com o nível de quem invoca — uma fera de nível 1
   e a mesma fera aos 15 não podem ser a mesma criatura. `quantos` existe
   para as legiões: o necromante não ergue UM esqueleto. */
export const INVOCACOES = [
  { id: "fera_menor",   rx: /(invocar\s+)?fera\s+menor|fera\s+espiritual/,          nome: "Fera Espiritual",   conceito: "fera espiritual de garras e presas, invocada do outro lado", turnos: 3, pv: 10, pvNv: 2,   dano: 3, quantos: 1, classe: "Guerreiro" },
  { id: "fera_maior",   rx: /(invocar\s+)?fera\s+maior|fera\s+poderosa/,            nome: "Fera Maior",        conceito: "fera enorme e antiga, presença que assusta a linha inimiga", turnos: 4, pv: 22, pvNv: 3.5, dano: 6, quantos: 1, classe: "Guerreiro" },
  { id: "elemental",    rx: /servo\s+elemental|elemental\s+do\s+ambiente/,          nome: "Servo Elemental",   conceito: "elemental erguido do próprio ambiente — pedra, chama ou vento", turnos: 4, pv: 16, pvNv: 3,   dano: 5, quantos: 1, classe: "Guerreiro" },
  { id: "guardiao_esp", rx: /espirito\s+guardiao/,                                  nome: "Espírito Guardião", conceito: "espírito protetor que se põe entre o aliado e o golpe",       turnos: 2, pv: 14, pvNv: 2,   dano: 2, quantos: 1, classe: "Clérigo", guarda: true },
  { id: "avatar",       rx: /avatar\s+ancestral/,                                   nome: "Avatar Ancestral",  conceito: "avatar lendário de uma linhagem antiga, alto como uma casa", turnos: 3, pv: 40, pvNv: 5,   dano: 10, quantos: 1, classe: "Guerreiro", tamanho: "grande" },
  { id: "sentinela",    rx: /automato\s+sentinela|torreta/,                         nome: "Autômato Sentinela",conceito: "torreta de latão e engrenagem, dispara sozinha à distância", turnos: 4, pv: 12, pvNv: 2,   dano: 5, quantos: 1, classe: "Caçador", distancia: true },
  { id: "guardiao_mec", rx: /automato\s+guardiao|golem\s+mecanico/,                 nome: "Autômato Guardião", conceito: "golem mecânico de placas rebitadas, lento e implacável",     turnos: 5, pv: 26, pvNv: 3.5, dano: 6, quantos: 1, classe: "Guerreiro" },
  { id: "colosso",      rx: /obra-?prima|colosso/,                                  nome: "Colosso",           conceito: "a criação máxima do engenheiro: um colosso de ferro e vapor", turnos: 3, pv: 45, pvNv: 5,   dano: 11, quantos: 1, classe: "Guerreiro", tamanho: "grande" },
  /* NECROMANTE — a mesma lógica do invocador, com outra ficção e em
     NÚMERO: quem ergue mortos não ergue um. */
  { id: "servos_osso",  rx: /servos?\s+de\s+osso|ergue\s+esqueletos/,               nome: "Servo de Osso",     conceito: "esqueleto erguido do chão, ossos amarelos e vontade emprestada", turnos: 4, pv: 8,  pvNv: 1.5, dano: 3, quantos: 2, classe: "Guerreiro" },
  { id: "legiao_osso",  rx: /legiao\s+de\s+ossos|exercito\s+de\s+esqueletos/,       nome: "Legionário de Osso",conceito: "esqueleto de uma legião inteira erguida de uma vez",         turnos: 5, pv: 8,  pvNv: 1.5, dano: 3, quantos: 4, classe: "Guerreiro" },
  { id: "morto_animado",rx: /animar\s+mortos|cadaver\s+se\s+levanta/,               nome: "Morto Animado",     conceito: "cadáver reanimado que obedece sem entender",                 turnos: 10, pv: 12, pvNv: 2,  dano: 4, quantos: 1, classe: "Guerreiro" },
  /* CAÇADOR — companheiro animal é invocação de prazo, não recruta */
  { id: "animal",       rx: /companheiro\s+animal|aliado\s+animal/,                 nome: "Companheiro Animal",conceito: "animal fiel que caça ao lado do dono",                       turnos: 5, pv: 14, pvNv: 2.5, dano: 4, quantos: 1, classe: "Caçador" },
];

export function invocacaoDe(hab) {
  if (!hab) return null;
  const txt = NORM(`${hab.nome || ""} ${hab.descricao || ""}`);
  if (!txt.trim()) return null;
  return INVOCACOES.find((i) => i.rx.test(txt)) || null;
}
export const ehInvocacao = (hab) => !!invocacaoDe(hab);

/* ---------------- O TETO ----------------
   Um de cada vez, salvo quem aprendeu Portal Duplo. Sem teto, o
   Invocador enche o tabuleiro na terceira rodada e a luta vira
   contabilidade — que é exatamente o que o grid existe para evitar. */
const RX_PORTAL_DUPLO = /portal\s+duplo|duas\s+invoca/;
export function limiteDeInvocacoes(pers) {
  const habs = (pers && pers.habilidades) || [];
  const tem = habs.some((h) => RX_PORTAL_DUPLO.test(NORM(typeof h === "string" ? h : `${h.nome || ""} ${h.descricao || ""}`)));
  return tem ? 2 : 1;
}

/* As invocações VIVAS no grupo. Uma legião de quatro esqueletos conta
   como UMA invocação — o teto é de conjurações sustentadas, não de
   corpos, senão Legião de Ossos nunca caberia. */
export function invocacoesDe(pers) {
  return ((pers && pers.grupo) || []).filter((g) => g && g.invocada);
}
export function conjuracoesAtivas(pers) {
  return new Set(invocacoesDe(pers).map((g) => g.invocacaoId)).size;
}

/* ---------------- A FICHA QUE ENTRA NO CAMPO ----------------
   Deliberadamente parecida com a de um companheiro, porque é isso que
   ela é. `garantirFichaCompanheiro` (chamado por quem usa) completa a
   classe e as habilidades — e é assim que a fera invocada sai batendo
   sem que este arquivo precise saber o que é um turno. */
export function criarInvocacoes(hab, pers, rodada = 1) {
  const inv = invocacaoDe(hab);
  if (!inv) return [];
  const nivel = Math.max(1, Number((pers && pers.nivel) || 1));
  const pv = Math.max(4, Math.round(inv.pv + inv.pvNv * nivel));
  const jaTem = invocacoesDe(pers).length;
  const out = [];
  for (let i = 0; i < (inv.quantos || 1); i++) {
    const sufixo = (inv.quantos || 1) > 1 ? ` ${i + 1}` : "";
    out.push({
      nome: `${inv.nome}${sufixo}${jaTem && (inv.quantos || 1) === 1 ? ` ${jaTem + 1}` : ""}`,
      conceito: inv.conceito,
      invocada: true,
      invocacaoId: inv.id,
      expiraEm: rodada + inv.turnos,
      turnosTotais: inv.turnos,
      dono: (pers && pers.nome) || "",
      nivel,
      /* a classe vem do molde, não do sorteio por nome que
         `classeDeCompanheiro` faz quando não há pista: uma fera de garras
         saiu Feiticeiro no primeiro teste em jogo, e uma fera que conjura
         é o tipo de detalhe que estraga a cena inteira. */
      classe: inv.classe || "Guerreiro",
      vida: pv, vidaMax: pv,
      danoBase: Math.round(inv.dano + nivel * 0.6),
      distancia: !!inv.distancia,
      tamanho: inv.tamanho || "medio",
      guarda: !!inv.guarda,
      /* sem XP, sem vínculo, sem marcos: não é gente, é conjuração */
      xp: 0, vinculo: 0, marcos: [],
      inventario: [],
    });
  }
  return out;
}

/* ---------------- O PRAZO ----------------
   Vence por rodada dentro da luta. Fora da luta, `dispensarTodas` limpa —
   invocação que sobrevive ao fim do combate viraria companheiro
   permanente pela porta dos fundos. */
export function expirarInvocacoes(pers, rodada) {
  const grupo = (pers && pers.grupo) || [];
  const vencidas = grupo.filter((g) => g && g.invocada && Number(g.expiraEm) <= Number(rodada));
  if (!vencidas.length) return { pers, sumiram: [], linhas: [] };
  return {
    pers: { ...pers, grupo: grupo.filter((g) => !vencidas.includes(g)) },
    sumiram: vencidas.map((g) => g.nome),
    linhas: [`✧ ${vencidas.map((g) => g.nome).join(", ")} ${vencidas.length > 1 ? "se desfazem" : "se desfaz"} — o prazo da conjuração acabou.`],
  };
}

export function dispensarTodas(pers) {
  const grupo = (pers && pers.grupo) || [];
  const inv = grupo.filter((g) => g && g.invocada);
  if (!inv.length) return { pers, sumiram: [] };
  return { pers: { ...pers, grupo: grupo.filter((g) => !g.invocada) }, sumiram: inv.map((g) => g.nome) };
}

/* SACRIFÍCIO ARCANO: "desfaz uma invocação para recuperar PM". Devolve
   metade do PV que restava, em PM — o que ainda estava de pé vale mais
   do que o que já estava caindo, e é isso que torna a escolha do
   MOMENTO uma decisão em vez de um botão. */
export function sacrificarInvocacao(pers, nome = "") {
  const inv = invocacoesDe(pers);
  if (!inv.length) return { ok: false, motivo: "você não sustenta nenhuma invocação agora" };
  const alvo = (nome && inv.find((g) => NORM(g.nome) === NORM(nome))) || inv[inv.length - 1];
  const pm = Math.max(1, Math.round((alvo.vida || 0) / 2));
  const p = { ...pers, grupo: (pers.grupo || []).filter((g) => g !== alvo), mana: Math.min(pers.manaMax || 0, (pers.mana || 0) + pm) };
  return { ok: true, pers: p, nome: alvo.nome, pm };
}

/* ---------------- O QUE AS OUTRAS DEZ FAZEM ---------------- */
const RX_ELO = /elo\s+vital|divide\s+o\s+dano/;
const RX_FUSAO = /fusao\s+espiritual|atingem\s+ela\s+primeiro/;
const RX_VOZ = /voz\s+de\s+comando|agem\s+duas\s+vezes/;
const RX_COMANDO = /comando:?\s*atacar|furia\s+redobrada/;
const temHab = (pers, rx) => ((pers && pers.habilidades) || []).some((h) => rx.test(NORM(typeof h === "string" ? h : `${h.nome || ""} ${h.descricao || ""}`)));

export const temEloVital = (pers) => temHab(pers, RX_ELO);
export const temFusao = (pers) => temHab(pers, RX_FUSAO);
export const temVozDeComando = (pers) => temHab(pers, RX_VOZ);
export const temComandoAtacar = (pers) => temHab(pers, RX_COMANDO);

/* ELO VITAL divide o golpe ao meio com a invocação; FUSÃO ESPIRITUAL
   manda o golpe inteiro para ela. A fusão é mais forte e mais cara, e
   vem depois na árvore — por isso ela vence quando o herói tem as duas.
   Devolve a ficha porque quem paga é a invocação, e ela mora no grupo. */
export function repartirDano(pers, dano) {
  const d = Math.max(0, Math.round(Number(dano) || 0));
  if (!d) return { dano: d, pers, linhas: [] };
  const inv = invocacoesDe(pers);
  if (!inv.length) return { dano: d, pers, linhas: [] };
  const escudo = inv.find((g) => (g.vida || 0) > 0);
  if (!escudo) return { dano: d, pers, linhas: [] };

  if (temFusao(pers)) {
    const grupo = (pers.grupo || []).map((g) => (g === escudo ? { ...g, vida: Math.max(0, (g.vida || 0) - d) } : g));
    return {
      dano: 0,
      pers: { ...pers, grupo },
      linhas: [`🜁 Fusão Espiritual — ${escudo.nome} leva o golpe inteiro (${d}) no seu lugar.`],
    };
  }
  if (temEloVital(pers)) {
    const meio = Math.floor(d / 2);
    if (meio <= 0) return { dano: d, pers, linhas: [] };
    const grupo = (pers.grupo || []).map((g) => (g === escudo ? { ...g, vida: Math.max(0, (g.vida || 0) - meio) } : g));
    return {
      dano: d - meio,
      pers: { ...pers, grupo },
      linhas: [`🜁 Elo Vital — ${escudo.nome} divide o golpe: ${meio} nela, ${d - meio} em você.`],
    };
  }
  return { dano: d, pers, linhas: [] };
}

export function resumoInvocacoesPrompt(pers) {
  const inv = invocacoesDe(pers);
  if (!inv.length) return "";
  const lista = inv.map((g) => `${g.nome} (${g.vida}/${g.vidaMax} PV, ${g.conceito})`).join(" · ");
  return `INVOCAÇÕES NO CAMPO (do sistema — são criaturas de verdade, com PV, posição e turno próprio): ${lista}. Elas agem sozinhas e o sistema resolve o que fazem; você narra. Não as remova, não as fira e não as faça desaparecer por conta própria — o prazo é do sistema e ele avisa quando vence.`;
}

export const INVOCACOES_PROMPT = `INVOCAÇÕES E CONSTRUTOS (v9.46 — o sistema resolve, você narra):
- Quando o herói invoca uma fera, ergue esqueletos, monta uma torreta ou chama um elemental, o sistema põe uma CRIATURA DE VERDADE no campo: com PV, lugar no terreno, turno próprio e prazo. Ela aparece no envelope de combate como qualquer aliado.
- Você nunca cria, move, fere nem desfaz uma invocação, e nunca decide o que ela faz no turno. Narre a presença dela — o peso das patas, o latão que range, os ossos que se levantam — e a reação dos inimigos a ela.
- Toda invocação TEM PRAZO e some sozinha quando ele vence; o sistema avisa. Não a mantenha na ficção depois disso, e não a traga de volta.
- O herói sustenta um número limitado ao mesmo tempo. Se ele pedir mais do que pode, o sistema recusa e você narra o esforço que não se completa — nunca conceda a invocação extra.`;
