/* ============================================================
   A INTENÇÃO DO INIMIGO (CB6, 09/11/2026) — anunciada, e cumprida

   A pessoa jogou duas lutas e o turno deles era sempre uma surpresa: a
   vez do mundo chegava, alguém levava dano, e o jogador lia DEPOIS em quem
   o lobo tinha decidido morder. Não havia nada a decidir contra o que ia
   acontecer, porque não se sabia o que ia acontecer. Into the Breach e Slay
   the Spire são o contrário, e é a lição inteira deles: a ameaça ANUNCIADA
   e CUMPRIDA transforma o turno do inimigo num quebra-cabeças. Mover-se
   passa a ser decisão; matar primeiro quem ia derrubar o mago passa a ser
   decisão; provocar para salvar um aliado passa a ser decisão.

   O QUE ESTE MÓDULO FAZ: no começo da rodada, `intencoesDaRodada` decide o
   que cada inimigo VAI fazer — e decide-o com a MESMA mente que hoje decide
   na hora (`turnoDosInimigos`, combate.js: a intenção do bando, a mira de
   quem dispara, a provocação, a marionete), corrida sobre a mesa como ela
   vai estar quando ele agir (o passo de `moverInimigos` primeiro, como o
   App faz). Não há uma segunda cabeça a discordar da primeira: o anúncio é
   a escolha de sempre, tirada mais cedo e comprometida.

   Os tipos (`INTENCAO_DO_INIMIGO.tipos`):
     atacar    — o alvo de cada golpe, com a previsão (chance, dano, abate)
                 pela conta que o golpe vai rolar (`armarGolpeDoInimigo`);
     sopro     — a criatura de `SOPROS_DO_BESTIARIO` pinta as casas que vai
                 queimar (`quadradosDaArea`, a forma do sopro, apontada para
                 onde apanha mais gente); quem SAIR delas escapa;
     aproximar — não alcança quem quer, nem depois de andar: vem a caminho
                 dele (e golpeia-o na vez dele só se lhe ficar ao alcance);
     fugir     — está ferido abaixo do limiar e vai sair da luta
                 (`querFugir`, rolado AGORA e cumprido na vez dele).

   CUMPRIR é de `turnoDosInimigos` (o parâmetro `intencoes`), e a regra de
   quando o herói muda as condições é a tabela `RECURSO_DA_INTENCAO`, ao lado
   de quem a cumpre. Este módulo dá também o BALANÇO depois da vez deles
   (`balancoDasIntencoes`): o que se cumpriu, o que mudou e porquê — o que a
   tela e o Narrador contam.

   A MENTE QUE ESCONDE. Quem lê a mesa (`brilhante`, o degrau que só se
   DECLARA no bestiário — degraus.js) mostra o que vai fazer e esconde em
   quem (`INTENCAO_DO_INIMIGO.escondeAlvo`): a inteligência continua a ser
   uma vantagem dele. É o único degrau que esconde, de propósito: esconder a
   partir de `astuto` apagaria o anúncio de todo inimigo competente para
   cima (`DEGRAU_POR_AMEACA`), justamente nas lutas em que ler importa mais.

   Determinístico pela semente (`ctx.sorte`), puro, sem tocar no que recebe.
   O campo `combate.intencoes` que o App guarda é novo e aditivo.
   ============================================================ */
import { turnoDosInimigos, armarGolpeDoInimigo, querFugir } from "./combate.js";
import { moverInimigos, quadradosDaArea, pegosPelaArea } from "./grid.js";
import { degrauDaCriatura } from "./degraus.js";
import { comSorte, sorteDaCasa } from "./semente.js";
import { previsaoDoAtaque, previsaoDeVariosGolpes, danoDoInimigo } from "./previsao.js";

/* ---------------- AS TABELAS ---------------- */
export const INTENCAO_DO_INIMIGO = {
  tipos: ["atacar", "sopro", "aproximar", "fugir"],
  escondeAlvo: ["brilhante"],
  porque: "o turno deles anunciado é um quebra-cabeças: o jogador lê a ameaça e responde antes de ela cair",
};

/* O SOPRO, por criatura. `forma` e `raioM` vão a `quadradosDaArea` (o cone
   do 5e: tudo no raio a até 45° da direção). `recarga`: o sopro vem na
   `primeiraRodada` e de `recarga` em `recarga` rodadas (1, 4, 7…) — o
   resto das rodadas é o multiataque de sempre. `multDano`: o sopro é a vez
   INTEIRA dele numa só rolagem — vale os golpes do multiataque que troca
   (`ataquesDoInimigo`: o Jovem, nível 10, dá 2; o Ancião, nível 16, dá 3),
   em cada um que apanha. Contra um herói sozinho o sopro pesa o mesmo que
   os golpes que substitui (a mesma esperança, mais variância); contra um
   grupo apinhado pesa mais; e contra quem leu e saiu, nada. `minimo`: o
   sopro só sai se apanhar pelo menos este número; senão, golpeia. */
export const SOPROS_DO_BESTIARIO = {
  "Dragão Jovem": { forma: "cone", raioM: 9, recarga: 3, primeiraRodada: 1, multDano: 2, elemento: "fogo", golpeNome: "Sopro incandescente", minimo: 1 },
  "Dragão Ancião": { forma: "cone", raioM: 18, recarga: 3, primeiraRodada: 1, multDano: 3, elemento: "fogo", golpeNome: "Sopro incandescente", minimo: 1 },
};

const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : null);
const lista = (x) => (Array.isArray(x) ? x : []);
const dePe = (e) => !!e && !e.derrotado && !e.fugiu && (Number(e.vida) || 0) > 0;
const nomeBase = (nome) => String(nome || "").replace(/\s+\d+$/, "").trim();
const soproDe = (inim) => SOPROS_DO_BESTIARIO[String(inim && inim.nome)] || SOPROS_DO_BESTIARIO[nomeBase(inim && inim.nome)] || null;
const soproNaRodada = (s, rodada) => rodada >= s.primeiraRodada && (rodada - s.primeiraRodada) % Math.max(1, s.recarga) === 0;

/* os alvos possíveis, na forma de `turnoDosInimigos` */
function alvosDaMesa(jogador, heroi, grupo, aliados) {
  return [
    { ref: "jogador", nome: jogador.nome, ent: jogador, onde: heroi || jogador },
    ...lista(grupo).map((g, i) => ({ ref: "grupo", nome: g.nome, ent: g, onde: lista(aliados)[i] || heroi || jogador, i }))
      .filter((a) => (a.ent.vida || 0) > 0),
  ];
}

/* a área do sopro apontada para quem apanha mais gente (desempate: o herói,
   que é o primeiro da lista) */
function miraDoSopro(s, inim, grade, alvos) {
  const comCasa = alvos.filter((a) => (a.ent.vida || 0) > 0 && a.onde && a.onde.x != null);
  let melhor = null;
  for (const a of comCasa) {
    let area = [];
    try { area = quadradosDaArea({ forma: s.forma, raio: s.raioM }, { grade, origem: inim, alvo: a.onde }); } catch { area = []; }
    const pegos = pegosPelaArea(area, comCasa.map((x) => ({ ...x.onde, vida: x.ent.vida, derrotado: false, __a: x }))).map((x) => x.__a);
    if (!melhor || pegos.length > melhor.pegos.length) melhor = { area, pegos, para: a };
  }
  return melhor && melhor.pegos.length >= (s.minimo || 1) ? melhor : null;
}

/* o que o jogador vê: o tipo, o alvo (salvo a mente que esconde), o dano
   e as casas */
function vistaDe(int) {
  const alvoVisto = int.escondeAlvo ? null : int.alvo ? int.alvo.nome : null;
  const p = lista(int.previsao);
  const principal = int.alvo ? p.find((x) => x.nome === int.alvo.nome && x.ref === int.alvo.ref) || p[0] : p[0];
  return {
    tipo: int.tipo,
    alvo: alvoVisto,
    golpes: int.golpes || 0,
    dano: principal && principal.dano ? { min: principal.dano.min, max: (principal.danoCritico || principal.dano).max } : null,
    abate: int.escondeAlvo || !principal ? null : principal.abate,
    area: int.area ? int.area.map((q) => ({ x: q.x, y: q.y })) : null,
  };
}

/* ============================================================
   A FUNÇÃO
   `combate`: { inimigos, grade, heroi, aliados, rodada } — o combate do App
     (`combateRef.current`), tal como está no começo da rodada.
   `ctx`: { jogador (a ficha do herói), grupo (as fichas do grupo, pela
     ordem de `combate.aliados`), gdJogador, provocado, prioridade (o alvo
     da intenção do bando, `intencaoPorId(...).alvo`), sorte (o gerador
     semeado: `sorteDoTurno("intencoes")`), comFuga (anunciar quem foge —
     o App sim; a régua de combate não tem fuga de inimigo) }.
   Devolve { rodada, lista: [intenção] }, ou null sem combate ou sem herói.
   Cada intenção: { inimigo, tipo, alvos (o de cada golpe), alvo (o
   primeiro), golpes, previsao ([{ ref, nome, golpes, chance, dano,
   danoCritico, abate }]), area/multDano/elemento/golpeNome (o sopro),
   escondeAlvo, vista (o que a tela mostra) }.
   ============================================================ */
export function intencoesDaRodada(combate, ctx) {
  const cb = obj(combate), c = obj(ctx);
  if (!cb || !c || !obj(c.jogador)) return null;
  const rodada = Number(cb.rodada) || Number(c.rodada) || 1;
  const grade = cb.grade || null;
  const heroi = obj(cb.heroi);
  const aliados = lista(cb.aliados);
  const jogador = c.jogador, grupo = lista(c.grupo);
  const gdJogador = Number(c.gdJogador) || 0;
  const vivos = lista(cb.inimigos).filter(dePe);
  if (!vivos.length) return { rodada, lista: [], porAlvo: [] };
  const sorte = typeof c.sorte === "function" ? c.sorte : null;

  return comSorte(sorte, () => {
    const saida = [];
    const ficam = [];
    for (const inim of vivos) {
      const esconde = INTENCAO_DO_INIMIGO.escondeAlvo.includes(degrauDaCriatura(inim));
      /* 1. quem vai fugir — a mesma regra, rolada agora */
      if (c.comFuga === true && querFugir(inim, { sorte: sorteDaCasa })) {
        saida.push({ inimigo: inim.nome, tipo: "fugir", alvos: [], alvo: null, golpes: 0, previsao: [], escondeAlvo: false });
        continue;
      }
      /* 2. o sopro — se é a rodada dele e apanha alguém */
      const s = soproDe(inim);
      if (s && grade && soproNaRodada(s, rodada)) {
        const alvos = alvosDaMesa(jogador, heroi, grupo, aliados);
        const mira = miraDoSopro(s, inim, grade, alvos);
        if (mira) {
          const previsao = mira.pegos.map((a) => {
            const arm = armarGolpeDoInimigo(inim, a, { grade, pos: heroi || jogador, gdJogador, colado: false, area: true });
            const p = previsaoDoAtaque({ alvo: a.ent, ...arm.args, tipoDano: s.elemento, dano: danoDoInimigo(inim, s.multDano) });
            return { ref: a.ref, nome: a.nome, golpes: 1, chance: p ? p.chance : null, dano: p ? p.dano : null, danoCritico: p ? p.danoCritico : null, abate: p ? p.abate : null };
          });
          saida.push({
            inimigo: inim.nome, tipo: "sopro", alvos: [], alvo: { ref: mira.para.ref, nome: mira.para.nome }, golpes: 1,
            area: mira.area.map((q) => ({ x: q.x, y: q.y })), multDano: s.multDano, elemento: s.elemento, golpeNome: s.golpeNome,
            previsao, escondeAlvo: esconde,
          });
          continue;
        }
      }
      ficam.push(inim);
    }

    /* 3. os outros: a vez deles, corrida mais cedo sobre a mesa como vai
       estar — primeiro o passo (`moverInimigos`, como o App), depois a mente
       de sempre. Os golpes simulados não contam: só se lê em QUEM cairiam. */
    if (ficam.length) {
      let postos = ficam;
      if (grade && heroi && heroi.x != null) {
        try { postos = moverInimigos(grade, ficam, heroi, [heroi, ...aliados]).inimigos; } catch { postos = ficam; }
      }
      const porNome = new Map(postos.map((e) => [e.nome, e]));
      let acoes = [];
      try {
        acoes = turnoDosInimigos({
          inimigos: postos, jogador, grupo, gdJogador, grade, heroi, aliados, rodada,
          provocado: c.provocado === true, prioridade: typeof c.prioridade === "string" ? c.prioridade : "",
          comOsPerdidos: true,
        });
      } catch { acoes = []; }
      const alvos = alvosDaMesa(jogador, heroi, grupo, aliados);
      for (const inim of ficam) {
        const esconde = INTENCAO_DO_INIMIGO.escondeAlvo.includes(degrauDaCriatura(inim));
        const todos = acoes.filter((a) => a.inimigo === inim.nome);
        /* o golpe que não chega ao alvo que ele quer vai `perdido`: anuncia-se
           que vem a caminho dele, e a vez dele cumpre-o (golpeia se o alvo
           ficou ao alcance; senão, não golpeia — combate.js) */
        const alvosDosGolpes = todos.map((a) => ({ ref: a.alvoRef, nome: a.alvoNome, ...(a.perdido ? { perdido: true } : {}) }));
        const meus = todos.filter((a) => !a.perdido);
        if (!meus.length) {
          const quer = alvosDosGolpes[0] || { ref: "jogador", nome: jogador.nome, perdido: true };
          saida.push({ inimigo: inim.nome, tipo: "aproximar", alvos: alvosDosGolpes, alvo: { ref: quer.ref, nome: quer.nome }, golpes: 0, previsao: [], escondeAlvo: esconde });
          continue;
        }
        const posto = porNome.get(inim.nome) || inim;
        const distintos = [];
        for (const x of alvosDosGolpes) if (!x.perdido && !distintos.some((d) => d.ref === x.ref && d.nome === x.nome)) distintos.push({ ref: x.ref, nome: x.nome });
        const previsao = distintos.map((d) => {
          const a = alvos.find((x) => x.ref === d.ref && x.nome === d.nome);
          if (!a) return { ref: d.ref, nome: d.nome, golpes: 0, chance: null, dano: null, danoCritico: null, abate: null };
          const n = alvosDosGolpes.filter((x) => !x.perdido && x.ref === d.ref && x.nome === d.nome).length;
          const arm = armarGolpeDoInimigo(posto, a, { grade, pos: heroi || jogador, gdJogador, alvosDele: alvos });
          if (!arm.args) return { ref: d.ref, nome: d.nome, golpes: n, chance: null, dano: null, danoCritico: null, abate: null };
          const um = { alvo: a.ent, ...arm.args, dano: danoDoInimigo(posto) };
          const v = previsaoDeVariosGolpes(Array.from({ length: n }, () => um), a.ent.vida);
          const p = v ? v.porGolpe[0] : null;
          return { ref: d.ref, nome: d.nome, golpes: n, chance: p ? p.chance : null, dano: p ? p.dano : null, danoCritico: p ? p.danoCritico : null, abate: v ? v.abate : null };
        });
        saida.push({
          inimigo: inim.nome, tipo: "atacar", alvos: alvosDosGolpes, alvo: { ref: meus[0].alvoRef, nome: meus[0].alvoNome },
          golpes: meus.length,
          previsao, escondeAlvo: esconde,
        });
      }
    }

    /* na ordem da lista de inimigos, com o que a tela vê */
    const ordem = new Map(vivos.map((e, i) => [e.nome, i]));
    saida.sort((a, b) => ordem.get(a.inimigo) - ordem.get(b.inimigo));
    return { rodada, lista: saida.map((x) => ({ ...x, vista: vistaDe(x) })), porAlvo: ameacaPorAlvo(saida, vivos, { jogador, heroi, grupo, aliados, grade, gdJogador }) };
  });
}

/* A AMEAÇA SOMADA SOBRE CADA ALVO — o quebra-cabeças inteiro. Quatro
   inimigos que anunciam dois golpes cada no mago não ameaçam o mago com a
   chance de UM deles: ameaçam-no com a soma. É esta a frase que faz o
   jogador mudar de plano («a Elma cai se nada mudar»), e a régua de combate
   lê-a para o herói que lê. Cada alvo: quem o ameaça, quantos golpes, o
   dano esperado e a chance de a soma o derrubar — os golpes de cada um pela
   conta que vão rolar (`armarGolpeDoInimigo`), o sopro com o dano dele.
   Ordenado da maior chance de queda para a menor. Escondidos (a mente que
   esconde) não entram: o jogador não os pode somar. */
function ameacaPorAlvo(intencoes, vivos, m) {
  const alvos = alvosDaMesa(m.jogador, m.heroi, m.grupo, m.aliados);
  const porNome = new Map(vivos.map((e) => [e.nome, e]));
  const out = [];
  for (const a of alvos) {
    const golpes = [], de = [];
    for (const it of intencoes) {
      if (it.escondeAlvo) continue;
      const inim = porNome.get(it.inimigo);
      if (!inim) continue;
      if (it.tipo === "atacar") {
        const n = lista(it.alvos).filter((x) => !x.perdido && x.ref === a.ref && x.nome === a.nome).length;
        if (!n) continue;
        const arm = armarGolpeDoInimigo(inim, a, { grade: m.grade, pos: m.heroi || m.jogador, gdJogador: m.gdJogador, alvosDele: alvos });
        if (!arm.args) continue;
        for (let i = 0; i < n; i++) golpes.push({ alvo: a.ent, ...arm.args, dano: danoDoInimigo(inim) });
        de.push(it.inimigo);
      } else if (it.tipo === "sopro" && lista(it.previsao).some((p) => p.ref === a.ref && p.nome === a.nome)) {
        const arm = armarGolpeDoInimigo(inim, a, { grade: m.grade, pos: m.heroi || m.jogador, gdJogador: m.gdJogador, colado: false, area: true });
        golpes.push({ alvo: a.ent, ...arm.args, tipoDano: it.elemento, dano: danoDoInimigo(inim, it.multDano) });
        de.push(it.inimigo);
      }
    }
    if (!golpes.length) continue;
    const v = previsaoDeVariosGolpes(golpes, a.ent.vida);
    if (v) out.push({ ref: a.ref, nome: a.nome, de, golpes: golpes.length, danoEsperado: v.danoEsperado, abate: v.abate });
  }
  return out.sort((x, y) => (y.abate - x.abate) || (y.danoEsperado - x.danoEsperado));
}

/* ============================================================
   O BALANÇO — depois da vez deles, o que se cumpriu
   `intencoes`: o que se anunciou; `acoes`: o que `turnoDosInimigos`
   devolveu com elas; `inimigos`: a lista da luta DEPOIS (quem caiu antes de
   agir, quem fugiu). Uma linha por intenção:
     cumprida     — fez o que disse (todos os golpes no anunciado, ou o sopro
                    apanhou alguém);
     mudou        — o herói mudou as condições, e manda o recurso (`porque`:
                    a chave de `RECURSO_DA_INTENCAO`);
     esquivaram   — o sopro queimou casas vazias: todos saíram;
     caiu         — morreu antes da vez dele;
     fugiu        — anunciou a fuga e foi-se;
     aproximou    — vinha a caminho, e não chegou;
     chegou       — vinha a caminho, e o alvo ficou-lhe ao alcance: golpeou.
   ============================================================ */
export function balancoDasIntencoes(intencoes, acoes, inimigos) {
  const ints = Array.isArray(intencoes) ? intencoes : obj(intencoes) && Array.isArray(intencoes.lista) ? intencoes.lista : [];
  const as = lista(acoes);
  const ini = lista(inimigos);
  return ints.filter(obj).map((it) => {
    const meus = as.filter((a) => a && a.inimigo === it.inimigo);
    const ele = ini.find((e) => e && e.nome === it.inimigo) || null;
    const base = { inimigo: it.inimigo, tipo: it.tipo };
    if (it.tipo === "fugir") return { ...base, desfecho: ele && ele.fugiu ? "fugiu" : ele && !dePe(ele) ? "caiu" : "fugiu" };
    if (!meus.length) {
      if (ele && !dePe(ele)) return { ...base, desfecho: "caiu" };
      if (it.tipo === "sopro") return { ...base, desfecho: "esquivaram" };
      return { ...base, desfecho: it.tipo === "aproximar" ? "aproximou" : "mudou", porque: it.tipo === "aproximar" ? null : "foraDeAlcance" };
    }
    if (it.tipo === "aproximar") return { ...base, desfecho: "chegou" };
    /* chegar ao alvo que vinha «a caminho» é cumprir o anunciado */
    const recursos = meus.map((a) => a.intencao).filter((x) => x && x !== "cumprida" && x !== "aproximar");
    if (!recursos.length) return { ...base, desfecho: "cumprida" };
    return { ...base, desfecho: "mudou", porque: recursos[0] };
  });
}
