/* ============================================================
   MOTOR DE COMBATE — Taverna
   O APP resolve a matemática (dados, acerto, dano, condições);
   a IA só narra o resultado. Isso corta tokens e garante um
   combate justo, consistente e idêntico ao das regras.
   Estilo D&D 5e / Baldur's Gate 3: todos rolam d20, com
   vantagem/desvantagem, críticos e condições de estado.
   ============================================================ */
import { alcanca, bonusDefesaEm } from "./grid.js";

import { perfilDeCriatura, multiplicadorDano, iconeDano, resistenciasEquipadas, elementoDaArma } from "./danos.js";
import { mecanicaDe } from "./condicoes.js";
import { golpeDaVez } from "./aflicoes.js";
import { decidirAcaoCompanheiro, valorDaCura, danoDaHabilidadeComp } from "./companheiros.js";
import { tipoDeDanoDaHabilidade } from "./combos.js";
import { proficienciaDe, fichaDoItem, danoDaArma, modDoGolpe } from "./itens.js";
import { estaSintonizado } from "./sintonia.js";
import { estaInvisivel } from "./gatilhos.js";

export function d(n) { return 1 + Math.floor(Math.random() * n); }

/* rola d20 com vantagem/desvantagem; devolve {valor, dados} */
export function d20(vantagem = false, desvantagem = false) {
  if (vantagem && !desvantagem) { const a = d(20), b = d(20); return { valor: Math.max(a, b), dados: [a, b], modo: "vantagem" }; }
  if (desvantagem && !vantagem) { const a = d(20), b = d(20); return { valor: Math.min(a, b), dados: [a, b], modo: "desvantagem" }; }
  const a = d(20); return { valor: a, dados: [a], modo: null };
}

/* competência -> bônus de ataque (usado por NPCs, do "fraco" ao "lendário") */
const BONUS_AMEACA = { fraco: 1, comum: 3, competente: 4, elite: 5, lendario: 6 };
export function bonusDeAmeaca(ameaca) { return BONUS_AMEACA[ameaca] || 3; }

/* Defesa de um combatente. Base 10 + destreza + bônus de escudo/armadura.
   Para inimigos, usamos a "defesa" declarada ou derivamos da ameaça. */
export function defesaDe(ent, ehInimigo = false) {
  if (ehInimigo) return ent.defesa || (10 + Math.floor((BONUS_AMEACA[ent.ameaca] || 3) / 2) + (ent.agil ? 3 : 0));
  const dex = (ent.atributos?.destreza || 0);
  /* v9.44: SINTONIA TAMBÉM AQUI. `bonusEquip` (regras-jogo) já respeitava a
     sintonia desde a v9.23 — item dormente não empresta atributo. Esta soma
     não respeitava, e por isso uma armadura dormente continuava defendendo:
     a mesma regra valia num lugar e não valia no outro. */
  const bonusEquip = ent.equipados
    ? Object.values(ent.equipados).reduce((s, it) => s + (estaSintonizado(ent, it) ? ((it?.atributos?.defesa) || 0) : 0), 0)
    : 0;
  /* DEFESA SEM ARMADURA (v9.44). O texto da penalidade de itens.js dizia,
     desde a v9.11, "o monge perde a Defesa sem Armadura enquanto estiver
     vestindo isto" — e a Defesa sem Armadura não existia em lugar nenhum do
     código. Perder o que nunca se teve não é penalidade, é ficção. Aqui ela
     passa a existir: quem tem classe de corpo livre e está sem armadura soma
     a Percepção, e vestir qualquer peça desliga isso de verdade. */
  const semArm = (() => {
    if (!proficienciaDe(ent.classe || "").semArmadura) return 0;
    const arm = ent.equipados && ent.equipados.armadura;
    const cat = arm ? fichaDoItem(arm).cat : null;
    if (arm && cat !== "panos") return 0;
    return Math.max(0, ent.atributos?.percepcao || 0);
  })();
  /* v9.32: `bonusDefesa` é o que as dádivas épicas depositam na ficha. Fica
     aqui, e não em bonusEquip, porque não vem de equipamento nenhum: é do
     corpo. Ausente em toda ficha que não tem dádiva — soma zero. */
  return 10 + dex + bonusEquip + semArm + (Number(ent.bonusDefesa) || 0);
}

/* Condições afetam as rolagens. A mecânica NÃO mora mais aqui: vem do
   catálogo único (condicoes.js), o mesmo que o Mestre, o HUD e o descanso
   leem. Antes, cada lugar adivinhava por substring e discordava do resto. */
export function modificadoresDeCondicao(condicoes = []) {
  const m = mecanicaDe(condicoes);
  return { vantagem: m.vantagem, desvantagem: m.desvantagem, danoExtra: m.danoExtra, danoReduzido: m.danoReduzido, perdeAcao: m.perdeAcao };
}

/* Resolve UM ataque. Devolve um objeto de resultado detalhado (sem narrar). */
/* `criticoEm` é a régua do crítico: 20 no d20 comum, 19 para quem tem a
   Dádiva da Sorte Impossível. Vem com padrão 20 para que toda chamada antiga
   — e são muitas — continue rolando exatamente como rolava. */
export function resolverAtaque({ atacante, alvo, ehAtacanteInimigo, bonusAtaque, danoBase, vantagem, desvantagem, condAtacante = [], condAlvo = [], tipoDano = "fisico", perfilAlvo = null, resistAlvo = [], bonusDefesaAlvo = 0, criticoEm = 20 }) {
  const modAtk = modificadoresDeCondicao(condAtacante);
  const modAlvo = modificadoresDeCondicao(condAlvo);
  if (modAtk.perdeAcao) return { tipo: "impedido", texto: `${atacante} está impossibilitado de agir` };

  // cego no alvo dá vantagem a quem ataca; vantagem/desvantagem do atacante somam
  let vant = vantagem || modAtk.vantagem;
  let desv = desvantagem || modAtk.desvantagem;
  if (condAlvo.some((c) => (c.nome || "").toLowerCase().includes("cego"))) vant = true;
  // se vantagem e desvantagem coexistem, cancelam (regra 5e)
  if (vant && desv) { vant = false; desv = false; }

  const rolagem = d20(vant, desv);
  const bonus = bonusAtaque || 0;
  const total = rolagem.valor + bonus;
  /* v9.20: a cobertura do terreno soma na defesa do alvo. Fica AQUI e não
     em defesaDe() porque cobertura é do lugar, não da pessoa: a mesma ficha
     é mais difícil de acertar atrás do muro e mais fácil no campo aberto. */
  const ca = defesaDe(alvo, !ehAtacanteInimigo) + (bonusDefesaAlvo || 0); // se o atacante é inimigo, o alvo é o jogador/aliado
  const critico = rolagem.valor >= Math.max(2, Math.min(20, criticoEm || 20));
  const desastre = rolagem.valor === 1;

  let resultado, dano = 0;
  if (desastre) { resultado = "desastre"; dano = 0; }
  else if (critico) { resultado = "critico"; dano = (danoBase + modAtk.danoExtra) * 2 - modAlvo.danoReduzido; }
  else if (total >= ca) { resultado = "acerta"; dano = danoBase + modAtk.danoExtra - modAlvo.danoReduzido; }
  else { resultado = "erra"; dano = 0; }
  dano = Math.max(0, Math.round(dano));

  /* TIPOS DE DANO (v6.6): fraqueza ×1,5 / resistido ×0,5 / imune 0 — por tabela */
  let tagDano = "";
  if (dano > 0 && (perfilAlvo || (resistAlvo && resistAlvo.length))) {
    let mult = 1;
    if (perfilAlvo) {
      const m = multiplicadorDano(tipoDano, perfilAlvo);
      mult = m.mult; tagDano = m.tag;
    }
    if (mult > 0 && resistAlvo.includes(tipoDano)) { mult = mult * 0.5; tagDano = `${iconeDano(tipoDano)} resistido ×0,5`; }
    if (mult === 0) { dano = 0; resultado = "imune"; }
    else if (mult !== 1) dano = Math.max(1, Math.round(dano * mult));
  }

  return {
    tipo: "ataque", atacante, alvo: alvo.nome || alvo, resultado,
    d20: rolagem.valor, dados: rolagem.dados, modo: rolagem.modo,
    bonus, total, ca, dano, critico, desastre, tipoDano, tagDano,
  };
}

/* Estima o dano-base de um atacante a partir de seus atributos/arma.
   Jogador: o DADO DA ARMA + o atributo que a arma pede. Inimigo: pela ameaça.

   v9.45: até aqui a conta era `4 + max(força, destreza) + d4`, igual para
   toda arma — o montante e a adaga batiam o mesmo, e o `4` fixo fazia o
   punho valer quase uma espada. Agora o dado sai do catálogo e o atributo
   sai da propriedade: corpo a corpo é Força, salvo se a arma for sutil.
   O `2` que sobrou do antigo `4` é o piso que mantém o dano total na mesma
   faixa de antes — sem ele, trocar a fórmula seria também nerfar todo
   mundo, e uma coisa de cada vez. */
export function danoDe(ent, ehInimigo = false) {
  if (ehInimigo) {
    const base = { fraco: 3, comum: 5, competente: 7, elite: 10, lendario: 14 }[ent.ameaca] || 5;
    return base + d(4) - 1;
  }
  const arma = ent.equipados?.arma || null;
  const dado = danoDaArma(arma);
  const atr = modDoGolpe(ent, arma);
  const bonusArma = arma?.atributos?.dano || 0;
  let total = 2 + atr + bonusArma;
  for (let i = 0; i < dado.n; i++) total += d(dado.faces);
  return total;
}

/* frase curta e neutra do que aconteceu (o app mostra; a IA embeleza) */
export function resumoDoAtaque(r) {
  if (r.tipo === "impedido") return r.texto;
  const dadosTxt = r.dados.length > 1 ? `${r.dados.join("/")}→${r.d20}` : `${r.d20}`;
  const base = `${r.atacante} → ${r.alvo}: d20 ${dadosTxt}${r.bonus ? `+${r.bonus}` : ""}=${r.total} vs ${r.ca}`;
  if (r.resultado === "critico") return `${base} · CRÍTICO! ${r.dano} de dano${r.tagDano ? ` ${r.tagDano}` : ""}`;
  if (r.resultado === "desastre") return `${base} · desastre (errou feio)`;
  if (r.resultado === "acerta") return `${base} · acerta, ${r.dano} de dano${r.tagDano ? ` ${r.tagDano}` : ""}`;
  if (r.resultado === "imune") return `${base} · ${r.tagDano || "sem efeito"}`;
  return `${base} · erra`;
}

/* ---------------- TURNO DO MUNDO EM COMBATE ----------------
   Cada inimigo vivo age: escolhe um alvo (jogador ou companheiro)
   e ataca. O app resolve toda a matemática; devolve os resultados
   para o app aplicar o dano e o Mestre narrar as DECISÕES. */
/* v9.34: `grade` e as POSIÇÕES substituem `campo`/`zonaHeroi`. Cada alvo
   possível carrega o próprio lugar no tabuleiro — inclusive os companheiros,
   que antes contavam como estando "na zona do herói" por economia de estado.
   Com o grid isso deixou de ser economia e virou mentira: era exatamente o
   que impedia a área de dizer se o fogo amigo ia pegar alguém. Quem move o
   companheiro continua sendo o sistema; o jogador nunca faz essa conta. */
export function turnoDosInimigos({ inimigos, jogador, grupo = [], gdJogador = 0, grade = null, heroi = null, aliados = [] }) {
  const vivos = (inimigos || []).filter((e) => !e.derrotado && e.vida > 0);
  const pos = heroi || jogador;
  const alvosPossiveis = [
    { ref: "jogador", nome: jogador.nome, ent: jogador, onde: pos },
    ...grupo.map((g, i) => ({ ref: "grupo", nome: g.nome, ent: g, onde: aliados[i] || pos, i }))
      .filter((a) => (a.ent.vida || 0) > 0),
  ];
  const acoes = [];
  for (const inim of vivos) {
    /* MULTIATAQUE (5e): elites agem 2 vezes, lendários até 3 — como o
       Multiattack dos monstros. Cada golpe escolhe alvo de novo. */
    const nGolpes = ataquesDoInimigo(inim.ameaca, inim.nivel);
    for (let g = 0; g < nGolpes; g++) {
      const vivosAlvo = alvosPossiveis.filter((a) => (a.ent.vida || 0) > 0);
      if (!vivosAlvo.length) break;
      let alvo;
      if (vivosAlvo.length > 1 && Math.random() < 0.35) {
        const comps = vivosAlvo.filter((a) => a.ref === "grupo");
        alvo = comps.length ? comps[Math.floor(Math.random() * comps.length)] : vivosAlvo[0];
      } else {
        alvo = vivosAlvo[0];
      }
      /* quem não alcança, não bate — e agora "alcançar" é uma distância em
         metros contra o alcance natural do bicho (o ogro pega de 3 m), com
         parede cortando o tiro. Sem grade, devolve "alcança, sem penalidade"
         e o comportamento antigo fica intacto. */
      const alc = alcanca(grade, { ...inim }, alvo.onde || pos, { distancia: !!inim.distancia, alcanceM: inim.distancia ? 36 : null });
      if (!alc.ok) continue;
      const penalidadeZona = alc.penalidade || 0;
      const perfilInim = perfilDeCriatura(inim.nome, inim.desc);
      const r = resolverAtaque({
        atacante: inim.nome, alvo: alvo.ent, ehAtacanteInimigo: true,
        /* REGRA DO DEGRAU (v7.4): divindades ganham +2/degrau sobre o alvo */
        bonusAtaque: bonusDeAmeaca(inim.ameaca) + 2 * ((inim.gd || 0) - (gdJogador || 0)) - penalidadeZona,
        danoBase: danoDe(inim, true),
        condAtacante: inim.condicoes || [], condAlvo: alvo.ent.condicoes || [],
        tipoDano: perfilInim.ataque, resistAlvo: resistenciasEquipadas(alvo.ent),
        /* cobertura do LUGAR de quem apanha: quem luta atrás de alguma coisa
           é mais difícil de acertar, e é isso que dá motivo para recuar */
        bonusDefesaAlvo: bonusDefesaEm(grade, alvo.onde || pos),
        /* v9.45: quem não é visto é difícil de acertar. Enquanto a
           invisibilidade dura — e ela dura até o herói atacar ou conjurar —
           todo golpe contra ele sai com desvantagem. É a metade da magia que
           faltava; sem ela, sumir não protegia de nada. */
        desvantagem: estaInvisivel(alvo.ent),
      });
      /* GOLPE DO CATÁLOGO (v9.1): o bicho não "ataca" genericamente — ele usa
         um golpe com nome, do repertório fixo dele. É esse nome que o Mestre
         narra e é dele que o sistema tira a aflição que o golpe carrega. */
      const golpeNome = golpeDaVez(inim.nome, perfilInim.ataque, inim.ameaca, g);
      acoes.push({ inimigo: inim.nome, alvoRef: alvo.ref, alvoNome: alvo.nome, r, golpe: g + 1, deTotal: nGolpes, golpeNome });
    }
  }
  return acoes;
}

/* ---------------- TESTES DE MORTE (D&D 5e) ----------------
   A 0 PV o combatente cai inconsciente e "morrendo": a cada turno
   rola um d20 puro. 10+ é sucesso, <10 é falha. 3 sucessos estabiliza
   (vivo, inconsciente); 3 falhas morre. 20 natural revive com 1 PV.
   Qualquer cura reergue na hora e zera os contadores. */
export function testeDeMorte() {
  const rolo = d(20);
  if (rolo === 20) return { rolo, tipo: "revive", texto: "20 natural — volta à luta com 1 PV!" };
  if (rolo === 1) return { rolo, tipo: "falha2", texto: "1 natural — duas falhas!" };
  if (rolo >= 10) return { rolo, tipo: "sucesso", texto: `${rolo} — resiste (sucesso)` };
  return { rolo, tipo: "falha", texto: `${rolo} — enfraquece (falha)` };
}

/* aplica o resultado a um estado {sucessos, falhas} e diz o desfecho */
export function aplicarTesteMorte(estado, res) {
  let { sucessos = 0, falhas = 0 } = estado || {};
  if (res.tipo === "revive") return { sucessos: 0, falhas: 0, desfecho: "revive" };
  if (res.tipo === "sucesso") sucessos += 1;
  if (res.tipo === "falha") falhas += 1;
  if (res.tipo === "falha2") falhas += 2;
  if (sucessos >= 3) return { sucessos: 0, falhas: 0, desfecho: "estavel" };
  if (falhas >= 3) return { sucessos, falhas, desfecho: "morto" };
  return { sucessos, falhas, desfecho: "morrendo" };
}

/* ---------------- TURNO DOS COMPANHEIROS ----------------
   Cada companheiro vivo age: se algum aliado está caído (0 PV/morrendo),
   há chance de ir CURAR/estabilizar; senão, ATACA um inimigo. O app
   resolve a matemática; a IA narra a decisão. */
export function turnoDosCompanheiros({ grupo = [], inimigos = [], jogadorCaido = false, jogadorNome = "", jogador = null, rodada = 1 }) {
  const vivos = (grupo || []).filter((g) => (g.vida || 0) > 0 && !g.morrendo);
  const acoes = [];
  for (const comp of vivos) {
    /* v9.2: o companheiro DECIDE (cura, poção, buff, magia ou arma) pelo
       catálogo de classes — antes ele só sabia bater e "correr para socorrer",
       o que não fazia nada na ficha de ninguém. */
    const outros = (grupo || []).filter((g) => g.nome !== comp.nome);
    const alvoJogador = jogador ? { ...jogador, nome: jogador.nome || jogadorNome, morrendo: jogadorCaido || jogador.morrendo } : null;
    const plano = decidirAcaoCompanheiro(comp, { aliados: outros, inimigos, jogador: alvoJogador, rodada });

    if (plano.tipo === "cura") {
      acoes.push({ companheiro: comp.nome, tipo: "cura", alvo: plano.alvo, habilidade: plano.habilidade, custo: Number(plano.habilidade.custo) || 0, valor: valorDaCura(comp, plano.habilidade) });
      continue;
    }
    if (plano.tipo === "pocao") {
      acoes.push({ companheiro: comp.nome, tipo: "pocao", alvo: plano.alvo, item: plano.item, consumivel: plano.consumivel });
      continue;
    }
    if (plano.tipo === "buff") {
      acoes.push({ companheiro: comp.nome, tipo: "buff", habilidade: plano.habilidade, custo: Number(plano.habilidade.custo) || 0 });
      continue;
    }
    if (plano.tipo === "guarda") { acoes.push({ companheiro: comp.nome, tipo: "guarda" }); continue; }

    const alvo = (inimigos || []).find((e) => e.nome === plano.alvoNome) || (inimigos || []).find((e) => !e.derrotado && e.vida > 0);
    if (!alvo) { acoes.push({ companheiro: comp.nome, tipo: "guarda" }); continue; }
    const bonusArmaComp = (comp.equipados && comp.equipados.arma && comp.equipados.arma.atributos && comp.equipados.arma.atributos.dano) || 0;

    if (plano.tipo === "habilidade") {
      const r = resolverAtaque({
        atacante: comp.nome, alvo, ehAtacanteInimigo: false,
        bonusAtaque: 2 + (comp.nivel || 1), danoBase: danoDaHabilidadeComp(comp, plano.habilidade),
        condAtacante: comp.condicoes || [], condAlvo: alvo.condicoes || [],
        /* v9.21: mesmo conserto do lado do jogador — "magico" nao e um tipo
           de dano, e mandar isso fazia a habilidade do companheiro sair
           rotulada como fisica e passar por cima de toda resistencia. */
        tipoDano: tipoDeDanoDaHabilidade(plano.habilidade, comp), perfilAlvo: perfilDeCriatura(alvo.nome, alvo.desc),
      });
      acoes.push({ companheiro: comp.nome, tipo: "habilidade", habilidade: plano.habilidade, custo: Number(plano.habilidade.custo) || 0, alvoNome: alvo.nome, r });
      continue;
    }
    const r = resolverAtaque({
      atacante: comp.nome, alvo, ehAtacanteInimigo: false,
      bonusAtaque: 2 + (comp.nivel || 1), danoBase: 4 + (comp.nivel || 1) + bonusArmaComp + d(4),
      condAtacante: comp.condicoes || [], condAlvo: alvo.condicoes || [],
      tipoDano: elementoDaArma(comp), perfilAlvo: perfilDeCriatura(alvo.nome, alvo.desc),
    });
    acoes.push({ companheiro: comp.nome, tipo: "ataque", alvoNome: alvo.nome, r });
  }
  return acoes;
}

/* ---------------- BALANCEAMENTO: PV POR NÍVEL (referência D&D 5e) ----------------
   Mantém o combate proporcional em vez de números inventados. */
export function pvEsperadoJogador(nivel, vigor = 0) {
  // ~ classe média: 8 + (nivel-1)*5 + vigor*nivel/2  (aproximação enxuta)
  return Math.round(10 + (nivel - 1) * 6 + vigor * (1 + nivel * 0.3));
}
export function pvEsperadoInimigo(nivelJogador, ameaca = "comum") {
  const base = pvEsperadoJogador(nivelJogador, 1);
  const mult = { fraco: 0.35, comum: 0.7, competente: 1.0, elite: 1.6, lendario: 2.6 }[ameaca] || 0.7;
  const pv = Math.max(4, Math.round(base * mult));
  /* TETO DE VEROSSIMILHANÇA: bicho fraco/comum não vira saco de PV só porque
     o herói está em nível alto (um rato gigante continua sendo um rato). A
     escala grande fica para competente/elite/lendário, onde faz sentido. */
  if (ameaca === "fraco") return Math.min(pv, 10 + nivelJogador * 4);
  if (ameaca === "comum") return Math.min(pv, 16 + nivelJogador * 6);
  return pv;
}

/* ---------------- ESPÓLIOS POR CÓDIGO ----------------
   Moedas e XP calculados por tabela (por ameaça), como nos RPGs de
   verdade — zero tokens e sempre proporcional. A IA só narra, e o
   app decide SE cai um item (a identidade criativa do item fica
   com a IA, que é onde ela vale a pena). */
const XP_AMEACA = { fraco: 15, comum: 30, competente: 50, elite: 90, lendario: 160 };
const MOEDAS_AMEACA = { fraco: [1, 6], comum: [4, 12], competente: [8, 20], elite: [15, 40], lendario: [40, 100] };
const CHANCE_ITEM = { fraco: 0.05, comum: 0.12, competente: 0.25, elite: 0.45, lendario: 0.8 };

export function gerarEspolios(inimigosDerrotados) {
  let xp = 0, moedas = 0, chance = 0;
  const lista = inimigosDerrotados || [];
  for (const e of lista) {
    xp += XP_AMEACA[e.ameaca] || 30;
    const [a, b] = MOEDAS_AMEACA[e.ameaca] || [4, 12];
    moedas += a + Math.floor(Math.random() * (b - a + 1));
    chance = Math.max(chance, CHANCE_ITEM[e.ameaca] || 0.12);
  }
  /* CONSUMÍVEIS (v9.2): equipamento é raro de propósito, mas voltar de toda
     luta sem NADA na bolsa era o que fazia os espólios parecerem vazios.
     Poção cai com frequência bem maior — e quanto mais gente derrubada,
     mais chance de sair mais de uma. */
  const chanceCons = Math.min(0.85, 0.32 + lista.length * 0.12 + (lista.some((e) => e.ameaca === "elite" || e.ameaca === "lendario") ? 0.2 : 0));
  let consumiveis = 0;
  if (Math.random() < chanceCons) consumiveis = 1;
  if (consumiveis && lista.length >= 3 && Math.random() < 0.35) consumiveis = 2;
  return { xp, moedas, caiItem: Math.random() < chance, consumiveis };
}

/* ---------------- PATAMARES DE PODER ----------------
   O nível define o PATAMAR do herói, e o patamar define a escala:
   o que é trivial, o que é desafio digno e o que está acima. O
   Mestre não precisa "pensar" — consulta a tabela. O jogador não
   tem teto de progressão, mas cada patamar tem sua régua. */
export const PATAMARES = [
  { min: 1, nome: "Iniciante", desc: "Um mortal talentoso dando os primeiros passos. Um lobo é perigo real; um golem é morte certa.",
    triviais: "animais pequenos, valentões de taverna", dignos: "lobos, bandidos, goblins (fracos/comuns)", acima: "golens, cavaleiros veteranos, magos formados, qualquer elite — fugir ou usar astúcia" },
  { min: 3, nome: "Aventureiro", desc: "Nome conhecido na região. Resolve problemas que assustam gente comum.",
    triviais: "bandidos comuns, animais selvagens", dignos: "ogros, capitães mercenários, feras grandes (comuns/competentes)", acima: "golens de guerra, dragões jovens, arquimagos (elites/lendários)" },
  { min: 6, nome: "Herói", desc: "Canções falam de você. Cidades pedem sua ajuda pelo nome.",
    triviais: "bandidos, soldados rasos, feras comuns — resolva em UMA frase, sem abrir combate", dignos: "golens, gigantes, campeões inimigos, pequenos grupos de elite", acima: "dragões adultos, avatares, exércitos inteiros" },
  { min: 9, nome: "Campeão", desc: "Entre os mais poderosos da era. Reis o tratam como igual.",
    triviais: "qualquer tropa comum, feras, golens menores — um gesto os resolve", dignos: "dragões, senhores da guerra lendários, horrores antigos (lendários)", acima: "semideuses, entidades primordiais" },
  { min: 12, nome: "Portento", desc: "Uma força da natureza em forma de gente. Poucos mortais o desafiam.",
    triviais: "praticamente qualquer ameaça mortal comum — inclusive golens; NUNCA abra combate por isso", dignos: "os maiores dragões, liches ancestrais, campeões divinos", acima: "deuses menores, forças cósmicas" },
  { min: 16, nome: "Coloso", desc: "O mundo físico raramente o ameaça — mas ele segue mortal.",
    triviais: "exércitos mortais inteiros, monstros lendários comuns", dignos: "avatares divinos, titãs, entidades primordiais", acima: "deuses maiores, o próprio tecido da realidade" },
  { min: 20, nome: "Titã", desc: "Potência bruta no ápice mortal. Um golem é uma pedra que fala.",
    triviais: "TUDO que é mortal — jamais abra combate contra mortais; narre com um gesto", dignos: "outras divindades, conceitos encarnados, o impossível", acima: "os deuses primeiros — e mesmo esses, com astúcia…" },
];

export function patamarDe(nivel) {
  let atual = PATAMARES[0];
  for (const p of PATAMARES) if ((nivel || 1) >= p.min) atual = p;
  return atual;
}

export function resumoPatamar(nivel) {
  const p = patamarDe(nivel);
  const prox = PATAMARES[PATAMARES.indexOf(p) + 1];
  return `${p.nome} (nível ${nivel || 1}) — isto é ESCALA DE COMBATE (o que ele aguenta), NÃO um título nem posição no cosmos: nível nenhum torna alguém divino, só a fé faz isso. ${p.desc} TRIVIAL para ele (resolva narrativamente num gesto, SEM abrir combate nem pedir rolagem difícil): ${p.triviais}. DESAFIO DIGNO (combate/rolagens valem a pena): ${p.dignos}. ACIMA dele (vitória direta é implausível — exija astúcia, aliados, preparação ou fuga): ${p.acima}.${prox ? ` Próximo patamar: ${prox.nome} no nível ${prox.min}.` : ""}`;
}

/* ---------------- SEVERIDADE (v7.7) — sinal do SISTEMA para o Mestre ----------------
   O Mestre recebia só o número cru ("14 de dano") e não tinha como saber se
   aquilo era um arranhão ou um golpe decisivo — daí narrar "estraçalhou" com
   1 de dano. Aqui o código traduz o número em INTENSIDADE, medindo o dano
   contra a vida máxima do alvo e o estado em que ele ficou. */
export const SEVERIDADES = [
  { max: 0.05, rotulo: "arranhão",   guia: "quase nada — a defesa aguentou, o alvo mal sente" },
  { max: 0.15, rotulo: "golpe leve", guia: "acertou, mas é ferimento pequeno; o alvo segue firme" },
  { max: 0.30, rotulo: "golpe sólido", guia: "dói de verdade e o alvo recua um passo" },
  { max: 0.50, rotulo: "golpe pesado", guia: "estrago sério, sangue, o alvo perde postura" },
  { max: 1.01, rotulo: "golpe devastador", guia: "brutal — quase o derruba de uma vez" },
];

export function severidadeDano(dano, alvoVidaMax, vidaDepois, critico) {
  if (!dano || dano <= 0) return { rotulo: "erro", guia: "o golpe não conecta — narre a esquiva, o aparo ou a defesa" };
  if (vidaDepois !== undefined && vidaDepois <= 0) {
    return { rotulo: "abate", guia: "golpe final — o alvo cai; só aqui cabe linguagem de aniquilação" };
  }
  const frac = dano / Math.max(1, alvoVidaMax || dano);
  const s = SEVERIDADES.find((x) => frac < x.max) || SEVERIDADES[SEVERIDADES.length - 1];
  return { rotulo: critico ? `${s.rotulo} (crítico)` : s.rotulo, guia: s.guia, pct: Math.round(frac * 100) };
}

/* Linha pronta para o envelope do Mestre: número + intensidade + estado. */
export function linhaParaMestre(atacante, alvoNome, r, alvoVidaMax, vidaDepois) {
  if (!r || r.dano <= 0) {
    const como = r && r.resultado === "desastre" ? "erro desastroso" : "errou";
    return `${atacante}→${alvoNome}: ${como}`;
  }
  const sev = severidadeDano(r.dano, alvoVidaMax, vidaDepois, r.critico);
  const estado = vidaDepois !== undefined
    ? (vidaDepois <= 0 ? "CAIU" : `de pé com ${vidaDepois}/${alvoVidaMax}`)
    : "";
  return `${atacante}→${alvoNome}: ${r.dano} de dano = ${sev.rotulo}${sev.pct ? ` (${sev.pct}% da vida dele)` : ""}${estado ? `, ${estado}` : ""} [narre como: ${sev.guia}]`;
}

/* ═══════════ v7.8 — PERFIL DE COMBATE POR CLASSE (fiel ao D&D 5e) ═══════════
   No 5e, "mais ataques" NÃO é universal:
   · Marciais ganham Ataque Extra: Guerreiro 2/3/4 (nv 5/11/20); Bárbaro,
     Monge, Paladino e Patrulheiro só 2 (nv 5).
   · Ladino NUNCA ganha ataque extra — cresce por Ataque Furtivo (dados
     que aumentam a cada 2 níveis).
   · Conjuradores fazem UMA conjuração; o que cresce são os DADOS do
     truque: 2 dados no nv 5, 3 no 11, 4 no 17.
   Aqui cada classe da Taverna recebe o perfil equivalente. */
export const PERFIS_COMBATE = {
  "Guerreiro":  { tipo: "marcial",     extras: [5, 11, 20], dadoBase: 8, nota: "mestre das armas: o único que chega a 4 golpes" },
  "Monge":      { tipo: "marcial",     extras: [5],         dadoBase: 6, nota: "rajada de golpes desarmados" },
  "Caçador":    { tipo: "marcial",     extras: [5],         dadoBase: 8, nota: "disparos precisos em sequência" },
  "Engenheiro": { tipo: "marcial",     extras: [5],         dadoBase: 8, nota: "engenhocas e disparos calibrados" },
  "Ladino":     { tipo: "furtivo",     extras: [],          dadoBase: 6, nota: "um golpe só, mas com Ataque Furtivo somando dados" },
  "Mago":       { tipo: "conjurador",  extras: [],          dadoBase: 10, nota: "uma conjuração; os dados do truque crescem" },
  "Feiticeiro": { tipo: "conjurador",  extras: [],          dadoBase: 10, nota: "magia bruta: dados crescentes" },
  "Bruxo":      { tipo: "conjurador",  extras: [],          dadoBase: 10, nota: "explosão mística: feixes que se multiplicam" },
  "Druida":     { tipo: "conjurador",  extras: [],          dadoBase: 8,  nota: "poder natural crescente" },
  "Invocador":  { tipo: "conjurador",  extras: [],          dadoBase: 8,  nota: "conjura e comanda: as invocações agem à parte" },
  "Clérigo":    { tipo: "misto",       extras: [5],         dadoBase: 8,  nota: "guerreiro sagrado: dois golpes ou uma prece" },
  "Bardo":      { tipo: "misto",       extras: [6],         dadoBase: 6,  nota: "lâmina e canção" },
};
export function perfilCombate(classe) {
  return PERFIS_COMBATE[classe] || { tipo: "marcial", extras: [5], dadoBase: 8, nota: "" };
}

/* Quantos ATAQUES o herói faz por turno (marciais e mistos). */
export function ataquesPorTurno(classe, nivel) {
  const p = perfilCombate(classe);
  if (p.tipo === "conjurador" || p.tipo === "furtivo") return 1;
  return 1 + (p.extras || []).filter((n) => (nivel || 1) >= n).length;
}

/* Quantos DADOS de dano a conjuração/golpe carrega (conjuradores e ladino). */
export function dadosDeDano(classe, nivel) {
  const p = perfilCombate(classe);
  const nv = nivel || 1;
  if (p.tipo === "conjurador") return 1 + (nv >= 5 ? 1 : 0) + (nv >= 11 ? 1 : 0) + (nv >= 17 ? 1 : 0);
  if (p.tipo === "furtivo") return 1 + Math.floor(nv / 2); // Ataque Furtivo: +1 dado a cada 2 níveis
  return 1;
}

/* Resumo pronto para a ficha e para o prompt. */
export function resumoAcaoDeTurno(classe, nivel) {
  const p = perfilCombate(classe);
  const n = ataquesPorTurno(classe, nivel);
  const dd = dadosDeDano(classe, nivel);
  if (p.tipo === "conjurador") return { n: 1, dados: dd, texto: `1 conjuração por turno com ${dd}d${p.dadoBase} de dano`, tipo: p.tipo };
  if (p.tipo === "furtivo") return { n: 1, dados: dd, texto: `1 golpe por turno com ${dd}d${p.dadoBase} (Ataque Furtivo)`, tipo: p.tipo };
  return { n, dados: 1, texto: `${n} ataque${n > 1 ? "s" : ""} por turno`, tipo: p.tipo };
}

/* Dano por golpe já considerando os dados da classe. */
export function danoDaClasse(classe, nivel, bonusAtributo = 0) {
  const p = perfilCombate(classe);
  const nd = dadosDeDano(classe, nivel);
  let total = 0;
  for (let i = 0; i < nd; i++) total += d(p.dadoBase);
  return Math.max(1, total + bonusAtributo);
}

/* MULTIATAQUE DE INIMIGOS: elites e lendários agem mais de uma vez (como o
   Multiattack dos monstros no 5e), proporcional à ameaça. */
export function ataquesDoInimigo(ameaca, nivelInimigo) {
  if (ameaca === "lendario") return (nivelInimigo || 1) >= 12 ? 3 : 2;
  if (ameaca === "elite") return 2;
  return 1;
}

/* ═══════════ v8.9 — ECONOMIA DE AÇÃO (5e) ═══════════
   O que faltava para o combate ser fiel: ORDEM de turno rolada por
   iniciativa, AÇÃO BÔNUS e REAÇÃO como recursos separados (uma de
   cada por rodada) e CONCENTRAÇÃO, que quebra quando você apanha. */

/* INICIATIVA: d20 + Destreza. Empate desempata pelo modificador. */
export function rolarIniciativa(combatentes) {
  return (combatentes || []).map((c) => {
    const mod = c.modDestreza || 0;
    const rolo = d(20);
    return { ...c, iniciativa: rolo + mod, rolo, mod };
  }).sort((a, b) => (b.iniciativa - a.iniciativa) || (b.mod - a.mod) || (Math.random() - 0.5));
}

export function resumoIniciativa(ordem) {
  return (ordem || []).map((c, i) => `${i + 1}º ${c.nome} (${c.iniciativa})`).join(" · ");
}

/* RECURSOS DO TURNO: ação, ação bônus e reação. Reação repõe no início
   da SUA vez; ação e bônus repõem a cada turno seu. */
export function novosRecursos() {
  return { acao: true, bonus: true, reacao: true, movimento: true };
}
export function gastarRecurso(rec, tipo) {
  const r = { ...novosRecursos(), ...(rec || {}) };
  if (!r[tipo]) return { rec: r, ok: false };
  r[tipo] = false;
  return { rec: r, ok: true };
}

/* AÇÕES BÔNUS típicas por classe (5e) — o que a classe pode fazer
   "de graça" no mesmo turno, além da ação principal. */
export const ACOES_BONUS = {
  "Guerreiro": [{ id: "surto", nome: "Surto de Ação", desc: "Uma ação inteira a mais neste turno.", nivel: 2 }],
  "Ladino":    [{ id: "disparada", nome: "Ação Ardilosa", desc: "Disparar, desengajar ou esconder-se.", nivel: 2 }],
  "Monge":     [{ id: "rajada", nome: "Rajada de Golpes", desc: "Dois ataques desarmados extras.", nivel: 1 }],
  "Bárbaro":   [{ id: "furia", nome: "Fúria", desc: "Entra em fúria: mais dano e resistência.", nivel: 1 }],
  "Bardo":     [{ id: "inspiracao", nome: "Inspiração de Bardo", desc: "Dá um dado de bônus a um aliado.", nivel: 1 }],
  "Feiticeiro":[{ id: "metamagia", nome: "Metamagia Rápida", desc: "Conjura um truque como ação bônus.", nivel: 3 }],
  "Clérigo":   [{ id: "bencao", nome: "Prece Rápida", desc: "Uma bênção menor num aliado.", nivel: 2 }],
  "Druida":    [{ id: "forma", nome: "Forma Selvagem", desc: "Assume a forma de uma fera.", nivel: 2 }],
};
export function acoesBonusDe(classe, nivel) {
  return (ACOES_BONUS[classe] || []).filter((a) => (nivel || 1) >= a.nivel);
}

/* ---------------- ATAQUE DE OPORTUNIDADE (v9.14) ----------------
   A função abaixo existia desde a v8 e nunca foi chamada por ninguém: a
   regra estava escrita no prompt do Mestre ("ataque de oportunidade é
   REAÇÃO") sem uma linha de código atrás. Na prática, sair de perto de um
   inimigo era de graça — dos dois lados.

   Agora vale nos dois sentidos, que é o que torna a regra interessante:
   recuar CUSTA, e por isso vira decisão; e o inimigo ferido que corre
   também expõe as costas. */
export function ataqueDeOportunidade(atacante, alvo, bonusAtaque, danoBase, { ehAtacanteInimigo = false, tipoDano } = {}) {
  return resolverAtaque({
    atacante: atacante.nome || atacante, alvo, ehAtacanteInimigo,
    bonusAtaque, danoBase, condAtacante: atacante.condicoes || [], condAlvo: alvo.condicoes || [],
    tipoDano, resistAlvo: resistenciasEquipadas(alvo),
    /* v9.45: acertar quem não se vê é difícil. Vale para o ataque de
       oportunidade porque é exatamente aqui que a invisibilidade deveria
       salvar o herói que decide sair de perto. */
    desvantagem: estaInvisivel(alvo),
  });
}

/* O jogador anunciou que vai sair de perto? Recuar ordenado ("desengajo")
   NÃO conta — no 5e é justamente a ação de Desengajar que evita o golpe. */
const RETIRADA = /\b(recuo|recuar|me afasto|afasto-me|me distancio|fujo|fugir|bato em retirada|dou meia.volta|saio de perto|corro para (fora|longe)|volto correndo)\b/;
const DESENGAJA = /\b(desengaj|com cuidado|sem dar as costas|passo a passo|de guarda erguida|protegendo a retirada)\b/;
export function ehRetirada(texto) {
  const t = String(texto || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  return RETIRADA.test(t) && !DESENGAJA.test(t);
}

/* Cada inimigo de pé leva UM golpe livre em quem está saindo. É reação:
   um por inimigo, independente de quantos ataques ele tenha na rodada. */
export function oportunidadesContraOJogador(inimigos, jogador, gdJogador = 0) {
  return (inimigos || []).filter((e) => !e.derrotado && (e.vida || 0) > 0).map((inim) => {
    const perfil = perfilDeCriatura(inim.nome, inim.desc);
    const r = ataqueDeOportunidade(inim, jogador,
      bonusDeAmeaca(inim.ameaca) + 2 * ((inim.gd || 0) - (gdJogador || 0)),
      danoDe(inim, true), { ehAtacanteInimigo: true, tipoDano: perfil.ataque });
    return { inimigo: inim.nome, r };
  });
}

/* O outro lado: quem está muito ferido tenta sair da luta. Chefe não foge —
   um lendário que dá as costas estragaria a cena que ele mesmo é. */
export const LIMIAR_FUGA = 0.2;
export function querFugir(inimigo, { sorte = Math.random } = {}) {
  if (!inimigo || inimigo.derrotado || (inimigo.vida || 0) <= 0) return false;
  if (inimigo.ameaca === "lendario" || inimigo.chefe) return false;
  const frac = (inimigo.vida || 0) / (inimigo.vidaMax || 1);
  if (frac > LIMIAR_FUGA) return false;
  return sorte() < (inimigo.ameaca === "elite" ? 0.25 : 0.5);
}

/* CONCENTRAÇÃO: uma magia por vez; apanhar exige resistência de Vigor
   com CD 10 ou metade do dano, o que for maior. */
export function testeConcentracao(dano, modVigor) {
  const cd = Math.max(10, Math.floor((dano || 0) / 2));
  const rolo = d(20) + (modVigor || 0);
  return { cd, rolo, manteve: rolo >= cd, texto: `Concentração: d20+${modVigor || 0}=${rolo} vs CD ${cd} → ${rolo >= cd ? "mantida" : "QUEBRADA"}` };
}

export const ECONOMIA_ACAO_PROMPT = `ECONOMIA DE AÇÃO (5e — o sistema controla, você narra): cada combatente tem por rodada UMA ação, UMA ação bônus (só se a classe conceder), UMA reação e seu movimento. A ordem dos turnos vem da INICIATIVA rolada no início do combate — respeite-a na narração (não faça um inimigo agir fora da vez dele). Ataque de oportunidade é REAÇÃO: só acontece quando alguém sai do alcance, e só uma vez por rodada. CONCENTRAÇÃO: um conjurador mantém no máximo UMA magia de duração por vez; se ele apanhar, o sistema testa e pode quebrar — quando quebrar, narre o efeito se desfazendo na hora.`;
