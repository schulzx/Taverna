/* ============================================================
   A SONDA DOS ATIRADORES (Fase MM · MM7) — o arqueiro no tabuleiro

   A PERGUNTA QUE ELA RESPONDE: o Atirador (e o Mago) passou a ficar no
   posto e disparar em vez de vir colar no herói. A luta ficou DIFERENTE —
   ou só mais difícil, ou mais fácil? Quanto dano o herói leva por luta,
   quantas lutas ganha, quantas rodadas dura?

   O MOLDE É O DE MM6 (`sonda-do-furtivo.mjs`): a régua de Uma Vida não tem
   tabuleiro (`TABULEIRO_NA_REGUA.temGrade` é `false`), e esta regra é toda
   de tabuleiro — distância, linha de visão, cobertura, quem está colado.
   Então a sonda monta a planta com as PEÇAS DE PRODUÇÃO e nenhuma regra
   nasce aqui:
     · a planta e o posicionamento: `montarGrade`, `posicionar`;
     · o passo: `moverInimigos` — a mesma que o App usa para os inimigos e
       para o grupo —, e o do herói por `passoAteAlcancar`, o caminho que
       ela própria usa por dentro (desde a etapa das paredes);
     · o golpe: `resolverAtaque`, `danoDaClasse`, `turnoDosInimigos`,
       `turnoDosCompanheiros`;
     · o golpe de oportunidade no recuo: a conta que o App já faz em quem
       foge (`resolverRevide`, o bloco de `querFugir`), com o mesmo bônus e
       o mesmo dano — é a fiação que MM7 pede ao App, simulada como se
       estivesse ligada, para o número medir o jogo que vai ao ar.
   A sorte é a da régua (`comSorteTravada`): a mesma semente dá a mesma
   luta em qualquer máquina.

   O "ANTES" É O CÓDIGO DE ANTES, NÃO UMA IMITAÇÃO. `sondarAtiradores`
   aceita a raiz dos módulos; o retrato do antes foi medido com a árvore
   de `HEAD` antes de MM7 (`git archive`), pelas mesmas funções desta
   sonda. A suíte (`teste-mm7-atiradores.mjs`) mede só o depois, numa
   amostra menor, e compara com o retrato.

   O JOGADOR QUE ELA SIMULA é o Guerreiro da régua, e joga simples: vai ao
   inimigo mais perto e bate nele. Não procura cobertura nem caça o
   arqueiro de propósito — é o jogador que MENOS ganha com a mudança, e é
   por isso que é ele: se a luta não ficou muito mais dura para ele, não
   ficou para ninguém.
   ============================================================ */

import { comSorteTravada, CENARIOS_DA_REGUA } from "./regua-combate.mjs";

/* ---------------- AS TABELAS DA SONDA ---------------- */

/* As plantas: uma luta de cada lugar, em rodízio pela semente. */
export const PLANTAS_DOS_ATIRADORES = [
  { local: "taverna" }, { emMasmorra: true }, { local: "floresta" }, { local: "estrada" },
  { local: "cidade" }, { local: "caverna" }, { local: "ruina" },
];

/* As lutas. O herói e o grupo são os da régua (sem cópia); os inimigos são
   comuns de nível 5 do bestiário, pelo nome — é o nome que os faz
   atiradores. `dupla` é Uma Vida no começo (o herói sozinho, um de perto e
   um de longe); `conjurador` é a mesma com um Mago no lugar do Atirador;
   `bando` é o grupo contra dois de perto e dois de longe. */
export const LUTAS_DOS_ATIRADORES = {
  dupla: { grupo: false, inimigos: ["Soldado", "Atirador"] },
  conjurador: { grupo: false, inimigos: ["Soldado", "Mago"] },
  bando: { grupo: true, inimigos: ["Soldado", "Soldado", "Atirador", "Atirador"] },
};
export const AMOSTRA_DOS_ATIRADORES = { n: 140, prefixo: "mm7", tetoDeRodadas: 20, ameaca: "comum", nivel: 5 };

/* A DECISÃO PENDENTE, em duas linhas: ligar `feridoPor` no App (a mira do bruto em quem
   o feriu) derruba o grupo do bando para −30,8% do antes e acende a catraca de ±20%.

   O RETRATO — medido a 140 lutas por cenário (sementes `mm7|0..139`), no
   dia em que a regra entrou (29/09/2026). `antes` com a árvore de HEAD
   (c06d904, v9.311), `depois` com MM7. `dano` é o dano que o HERÓI leva
   por luta; `danoGrupo` o que o grupo leva (só no `bando`); `vitoria` a
   fração das lutas ganhas; `rodadas` a média de rodadas.

   O DEPOIS FOI REFEITO NA ETAPA DAS PAREDES (29/09, depois de v9.313), e
   o motivo fica escrito porque a asserção se moveu: `moverInimigos` deixou
   de ser gulosa em linha reta (o soldado da ruína ficava colado ao muro
   caído do lado errado, e o herói tinha de dar a volta até ele debaixo dos
   disparos do mago), e o herói desta sonda passou a andar pelo caminho de
   produção (`passoAteAlcancar`), que só dá o alcance por encerrado com
   linha de visão — antes ele parava em diagonal do outro lado da quina de
   uma parede, de onde `alcanca` não o deixa bater. Os dois juntos:
   dupla 11,57 → 12,06, conjurador 12,01 → 12,69, bando 13,71 → 13,39; e
   sem o golpe de oportunidade 13,11/13,76/16,02 → 14,04/13,83/15,69. O
   ANTES NÃO MUDA: remedido na árvore de c06d904 com o mesmo conserto, dá
   13,03 · 10,64 · 16,36 — a luta de antes de MM7 não tinha a trava dentro
   desta sonda, e o limite continua a medir a regra dos atiradores, não o
   caminho.

   E O BANDO FOI REFEITO NA ETAPA DO EMPILHAMENTO (29/09, depois de
   v9.315): `moverInimigos` passou a ver a casa nova de quem já andou, e no
   `bando` 473 das 559 rodadas do retrato acabavam com dois corpos numa
   casa só — os dois soldados colavam-se ao herói na MESMA casa. Sem a
   pilha, o bando fica 13,39 → 13,94 no herói (grupo 7,49 → 7,46), e sem o
   golpe de oportunidade 15,69 → 15,89. A dupla e o conjurador não mexem
   (um só corpo de perto, nunca empilhavam): o conjurador continua a
   +19,3% do antes, a mesma margem de v9.314.
   O ANTES DO BANDO TAMBÉM EMPILHAVA, e nesta etapa ficou como foi medido
   (a etapa da mira, abaixo, trocou-o pelo sem pilha), com a
   medida sem pilha escrita aqui para quem decidir: na árvore de c06d904
   com o caminho e a ocupação que anda, o bando dá 15,30 no herói e 5,35
   no grupo (era 16,36 · 7,89). Contra esse antes, o herói fica a −8,9% e
   o GRUPO a +39% — os dois atiradores de MM7 espalham os tiros pelo
   grupo, que antes só apanhava de quem lhe chegava ao corpo. O total do
   bando mexe +3,6% (20,65 → 21,40). O limite de MM7 é sobre o herói, e a
   asserção do grupo continua a medir contra o antes gravado.

   E O BANDO FOI REFEITO NA ETAPA DA MIRA (depois de v9.316): quem dispara
   deixou de sortear (35% num companheiro ao acaso) e passou a mirar pela
   cabeça (`mira` em `DEGRAUS`, degraus.js). O Atirador do bestiário é
   `bruto`: mira em quem o feriu, e senão no mais perto. O App ainda não
   escreve `feridoPor`, então no jogo de hoje o bruto mira no mais perto —
   e É ESSE O JOGO QUE O RETRATO MEDE (`comFerida: false`, o padrão da
   sonda): o bando fica 13,94 → 15,21 no herói e 7,46 → 5,49 no grupo; sem
   o golpe de oportunidade, 15,89 → 17,94.
   E O ANTES PASSOU A SER O SEM PILHA, que é o honesto: o gravado (16,35 ·
   8,00) tinha dois soldados na mesma casa em quase toda rodada. Medido na
   árvore de c06d904 com o caminho e a ocupação que anda: 15,30 · 5,35 no
   bando; a dupla e o conjurador dão o mesmo número de sempre (nunca
   empilhavam). Contra ele, o bando fica a −0,6% no herói, +2,6% no grupo e
   +0,3% no total, e o conjurador continua a +19,3%.
   `registo` guarda, SEM ASSERÇÃO que o exija, o que a decisão tem à frente
   (bando, herói · grupo · total):
     com `feridoPor` (bruto)    16,26 ·  3,70 · 19,96  (grupo −30,8%)
     astuto, treinado            5,90 · 19,78 · 25,68  (o Mago de túnica é o frágil)
     brilhante                   4,71 · 16,19 · 20,91  (a magia e o remendo primeiro)
   O herói é quem mais fere os arqueiros (o golpe de oportunidade no
   recuo): com `feridoPor`, é nele que o bruto passa a disparar. */
export const RETRATO_DOS_ATIRADORES = {
  n: 140,
  antes: {
    dupla:      { dano: 13.03, danoGrupo: 0,    vitoria: 0.993, rodadas: 4.98 },
    conjurador: { dano: 10.64, danoGrupo: 0,    vitoria: 1,     rodadas: 5.01 },
    bando:      { dano: 15.30, danoGrupo: 5.35, vitoria: 1,     rodadas: 4.31 },
  },
  depois: {
    dupla:      { dano: 12.06, danoGrupo: 0,    vitoria: 0.986, rodadas: 4.67 },
    conjurador: { dano: 12.69, danoGrupo: 0,    vitoria: 0.993, rodadas: 4.72 },
    bando:      { dano: 15.21, danoGrupo: 5.49, vitoria: 1,     rodadas: 4.06 },
  },
  /* o mesmo depois SEM o golpe de oportunidade no recuo — o jogo enquanto a
     fiação do App não chega. O conjurador passa do limite (+30%): é por
     isso que a fiação não é enfeite. */
  semOportunidade: {
    dupla:      { dano: 14.04 },
    conjurador: { dano: 13.83 },
    bando:      { dano: 17.94 },
  },
  /* o que a decisão pendente tem à frente — registo, sem asserção */
  registo: {
    comFerida: { bando: { dano: 16.26, danoGrupo: 3.70, vitoria: 1, rodadas: 4.04 } },
    astuto:    { bando: { dano: 5.90,  danoGrupo: 19.78, vitoria: 1, rodadas: 4.06 } },
    brilhante: { bando: { dano: 4.71,  danoGrupo: 16.19, vitoria: 1, rodadas: 3.99 } },
  },
};
/* O LIMITE — a luta tem de ficar DIFERENTE, não mais dura nem mais mole:
   o dano no herói de cada cenário fica a menos de 20% do antes, para os
   dois lados. */
export const LIMITE_DOS_ATIRADORES = { variacao: 0.2 };

/* ---------------- OS MÓDULOS ----------------
   A raiz é argumento para o retrato do antes poder correr sobre a árvore
   de HEAD; por padrão é `src/`. */
export async function carregar(raiz = new URL("../src/", import.meta.url).href) {
  const r = raiz.endsWith("/") ? raiz : raiz + "/";
  const [combate, grid, companheiros, bestiario, condicoes, danos, itens, prontos, combos] = await Promise.all(
    ["combate", "grid", "companheiros", "bestiario", "condicoes", "danos", "itens", "prontos", "combos"].map((m) => import(r + m + ".js")));
  return { combate, grid, companheiros, bestiario, condicoes, danos, itens, prontos, combos };
}

/* ---------------- A MESA ---------------- */

function fichaDoHeroi(M) {
  const h = CENARIOS_DA_REGUA.duro.heroi;
  const vidaMax = M.combate.pvEsperadoJogador(h.nivel, h.vigor);
  const peca = (nome, tipo) => (nome ? { nome, tipo, ...(tipo === "arma" ? {} : { atributos: { defesa: M.prontos.DEFESA_DA_ARMADURA[nome] || 1 } }) } : null);
  const equipados = {};
  if (h.arma) equipados.arma = peca(h.arma, "arma");
  if (h.armadura) equipados.armadura = peca(h.armadura, "armadura");
  if (h.escudo) equipados.escudo = peca(h.escudo, "escudo");
  return {
    nome: h.nome, classe: h.classe, nivel: h.nivel, atributos: { ...h.atributos },
    vida: vidaMax, vidaMax, condicoes: [], efeitos: [], guardas: [], inventario: [], equipados,
  };
}

function fichasDoGrupo(M, comGrupo) {
  if (!comGrupo) return [];
  return CENARIOS_DA_REGUA.duro.grupo.map((g) => {
    const vidaMax = M.combate.pvEsperadoJogador(g.nivel, g.vigor);
    return M.companheiros.garantirFichaCompanheiro({
      nome: g.nome, classe: g.classe, nivel: g.nivel, atributos: { ...g.atributos },
      vida: vidaMax, vidaMax, condicoes: [], efeitos: [], guardas: [], inventario: [], equipados: {}, morrendo: false,
    });
  });
}

/* Quem dispara, entre os nomes das lutas desta sonda. Só serve para a
   medida por degrau (`degrauDeQuemAtira`): quem decide se dispara é
   `mantemDistancia` (atirador.js), e a sonda não a copia. */
export const QUEM_ATIRA_NA_SONDA = ["Atirador", "Mago"];

function fichasDosInimigos(M, nomes, degrauDeQuemAtira = null) {
  const { ameaca, nivel } = AMOSTRA_DOS_ATIRADORES;
  const conta = {};
  return nomes.map((base) => {
    conta[base] = (conta[base] || 0) + 1;
    const nome = nomes.filter((n) => n === base).length > 1 ? `${base} ${conta[base]}` : base;
    const ficha = { ...M.bestiario.completarInimigo({ nome, ameaca, nivel }, nivel), derrotado: false, condicoes: [] };
    return degrauDeQuemAtira && QUEM_ATIRA_NA_SONDA.includes(base) ? { ...ficha, degrau: degrauDeQuemAtira } : ficha;
  });
}

/* ---------------- O PASSO DO HERÓI ----------------
   O jogador escolhe a casa, e a tela mostra-lhe por onde se chega: ele
   contorna o balcão. Até MM7 a sonda tinha o seu próprio caminho, porque
   `moverInimigos` era gulosa em linha reta e prendia o herói atrás de uma
   parede com o arqueiro do outro lado. Desde a etapa das paredes o caminho
   é de produção (`passoAteAlcancar`, grid.js) — o mesmo que os inimigos e o
   grupo andam —, e a sonda o lê de lá: uma conta só, e não duas que podem
   divergir.

   O JOGADOR DAS PAREDES (`passo`, para `sonda-das-paredes.mjs`): além do
   jogador que anda pelo caminho, dois que a sonda das paredes precisa —
     · "companheiro": anda pela `moverInimigos`, como o App move o grupo;
       é o herói que a sonda de MM7 tinha antes de ter caminho próprio;
     · "espera": não sai do lugar, e bate em quem chega. São os inimigos
       que têm de vir, e é aí que se vê se chegam;
     · "abrigo": o "escondo-me atrás do balcão" — começa a luta colado a
       uma parede que o esconde do inimigo mais perto (`abrigoDoHeroi`) e
       espera ali. É o herói que põe a parede ENTRE ele e quem vem, e é
       onde a busca em linha reta prendia os inimigos. Planta sem parede
       não tem abrigo: ele espera onde está. */
function abrigoDoHeroi(G, grade, lugar, outros, inimigos) {
  const g = G.garantirGrade(grade);
  const ocupados = G.ocupacaoDe(outros, lugar);
  const perto = [...inimigos].sort((a, b) => G.distanciaM(a, lugar) - G.distanciaM(b, lugar))[0];
  let melhor = null;
  for (let x = 0; x < g.largura; x++) for (let y = 0; y < g.altura; y++) {
    if (G.ehParede(grade, x, y) || ocupados.has(x + "," + y)) continue;
    let colado = false;
    for (let dx = -1; dx <= 1 && !colado; dx++) for (let dy = -1; dy <= 1; dy++) if ((dx || dy) && G.ehParede(grade, x + dx, y + dy)) { colado = true; break; }
    if (!colado || (perto && G.linhaDeVisao(grade, { ...lugar, x, y }, perto))) continue;
    const d = G.distanciaM({ ...lugar, x, y }, lugar), lado = Math.abs(x - lugar.x);
    if (!melhor || d < melhor.d || (d === melhor.d && lado < melhor.lado)) melhor = { x, y, d, lado };
  }
  return melhor ? { ...lugar, x: melhor.x, y: melhor.y } : lugar;
}

function passoDoHeroi(G, grade, lugar, alvo, outros, passo) {
  if (!alvo || passo === "espera" || passo === "abrigo") return lugar;
  if (passo === "companheiro") {
    const mv = G.moverInimigos(grade, [{ ...lugar, vida: 1 }], alvo, outros);
    return { ...lugar, x: mv.inimigos[0].x, y: mv.inimigos[0].y };
  }
  const p = G.passoAteAlcancar(grade, lugar, alvo, { ocupados: G.ocupacaoDe(outros, lugar), desempate: "passo" });
  return p ? { ...lugar, x: p.x, y: p.y } : lugar;
}

/* ---------------- UMA LUTA ---------------- */

/* `comOportunidade`: o recuo cobra o golpe do herói (a fiação que MM7 pede
   ao App). Desligado, mede o jogo como fica ENQUANTO a fiação não chega.
   `planta`, `luta` e `passo` são da sonda das paredes: uma planta fixa em
   vez do rodízio, uma luta que não está na tabela desta sonda, e o jogador
   (ver `passoDoHeroi`). Omitidos, a luta é byte a byte a de MM7.
   A MIRA (depois de v9.316): `comFerida` escreve em cada inimigo o nome de
   quem o acertou por último (`feridoPor`), que é o que a mira do bicho e
   do bruto lê — a fiação que a mira pede ao App, simulada como se já
   estivesse ligada, como MM7 fez com o golpe de oportunidade. Desligada,
   mede o jogo ENQUANTO ela não chega. `degrauDeQuemAtira` declara o
   degrau de quem dispara, para medir a mira de cada degrau. */
export function lutaDosAtiradores(M, cenarioId, semente, { comOportunidade = true, planta: plantaFixa = null, luta = null, passo = "caminho", comFerida = false, degrauDeQuemAtira = null } = {}) {
  const cen = luta || LUTAS_DOS_ATIRADORES[cenarioId];
  const { combate: C, grid: G } = M;
  const planta = plantaFixa || PLANTAS_DOS_ATIRADORES[Math.abs(Number(String(semente).split("|").pop()) || 0) % PLANTAS_DOS_ATIRADORES.length];
  return comSorteTravada(`${semente}|${cenarioId}`, () => {
    const grade = G.montarGrade(planta);
    let heroi = fichaDoHeroi(M);
    let grupo = fichasDoGrupo(M, cen.grupo);
    const pos = G.posicionar(grade, {
      heroi: { nome: heroi.nome, tamanho: "medio" },
      grupo: grupo.map((c) => ({ nome: c.nome, vida: c.vida, tamanho: "medio" })),
      inimigos: fichasDosInimigos(M, cen.inimigos, degrauDeQuemAtira),
    });
    let lugar = passo === "abrigo" ? abrigoDoHeroi(G, grade, pos.heroi, [...pos.grupo, ...pos.inimigos], pos.inimigos) : pos.heroi;
    let aliados = pos.grupo;
    let inimigos = pos.inimigos;
    const vivos = () => inimigos.filter((e) => !e.derrotado && (e.vida || 0) > 0);
    const ferir = (nome, dano, quem = "") => {
      inimigos = inimigos.map((e) => (e.nome !== nome ? e : {
        ...e, vida: Math.max(0, e.vida - dano), derrotado: e.vida - dano <= 0,
        ...(comFerida && quem ? { feridoPor: quem } : {}),
      }));
    };
    let danoNoHeroi = 0, danoNoGrupo = 0, recuos = 0, oportunidades = 0, disparos = 0, disparosColados = 0, rodada = 1;
    /* a última rodada em que alguém ATACOU alguém (acertando ou não) — a
       sonda das paredes separa por ela a luta LENTA (dados até o teto) da
       TRAVADA (ninguém alcança ninguém, e o teto chega sozinho). Contar só
       os acertos confundia cinco erros seguidos com uma trava. */
    let ultimoAtaque = 0;
    /* AS RODADAS COM DUAS CRIATURAS NA MESMA CASA (a etapa do empilhamento).
       Desde MM2 a posição é verdade contada ao Narrador (`resumoGridPrompt`):
       três soldados numa casa só é o sistema a dizer ao Mestre uma coisa
       impossível. Conta-se no fim de cada rodada, só entre quem está de pé
       (herói, grupo e inimigos vivos), casa a casa de cada corpo — o grande
       ocupa `ladoDe`² casas. */
    let sobreposicoes = 0;
    const sobrepostos = () => {
      const corpos = [];
      if ((heroi.vida || 0) > 0) corpos.push(lugar);
      aliados.forEach((a, i) => { if (((grupo[i] || {}).vida || 0) > 0) corpos.push(a); });
      corpos.push(...vivos());
      const vistas = new Set();
      for (const c of corpos) for (const q of G.quadradosDe(c)) {
        const k = q.x + "," + q.y;
        if (vistas.has(k)) return true;
        vistas.add(k);
      }
      return false;
    };
    const nv = heroi.nivel;
    const arma = heroi.equipados.arma;
    const bonusAtk = M.itens.modDoGolpe(heroi, arma) + 2 + Math.floor((nv - 1) / 4);
    for (; rodada <= AMOSTRA_DOS_ATIRADORES.tetoDeRodadas; rodada++) {
      if (!vivos().length) break;
      /* ---- 1. O HERÓI: vai ao mais perto e bate ---- */
      if ((heroi.vida || 0) > 0) {
        const alvo0 = [...vivos()].sort((a, b) => G.distanciaM(a, lugar) - G.distanciaM(b, lugar))[0];
        lugar = passoDoHeroi(G, grade, lugar, alvo0, [...aliados, ...vivos()], passo);
        const nAt = C.ataquesPorTurno(heroi.classe, nv);
        for (let i = 0; i < nAt; i++) {
          const perto = vivos().filter((e) => G.distanciaM(lugar, e) <= G.alcanceNatural(lugar) && G.linhaDeVisao(grade, lugar, e))
            .sort((a, b) => (a.vida || 0) - (b.vida || 0));
          if (!perto.length) break;
          const alvo = perto[0];
          ultimoAtaque = rodada;
          const r = C.resolverAtaque({
            atacante: heroi.nome, alvo, ehAtacanteInimigo: false, bonusAtaque: bonusAtk,
            danoBase: C.danoDaClasse(heroi.classe, nv, Math.round(C.danoDe(heroi, false) / 2)),
            condAtacante: heroi.condicoes, condAlvo: alvo.condicoes || [],
            tipoDano: M.danos.elementoDaArma(heroi), perfilAlvo: M.danos.perfilDe(alvo),
          });
          if (r.dano > 0) ferir(alvo.nome, r.dano, heroi.nome);
        }
      }
      if (!vivos().length) break;
      /* ---- 2. OS INIMIGOS: andam (o recuo provoca), e golpeiam ---- */
      const mv = G.moverInimigos(grade, inimigos, lugar, [lugar, ...aliados]);
      inimigos = mv.inimigos;
      for (const m of mv.movimentos) {
        if (m.recua) recuos++;
        if (!comOportunidade || !m.provoca || (heroi.vida || 0) <= 0) continue;
        const e = inimigos.find((x) => x.nome === m.nome);
        if (!e || e.derrotado) continue;
        /* a conta do App (resolverRevide, o golpe em quem foge) */
        const bonusOp = Math.max(heroi.atributos.forca || 0, heroi.atributos.destreza || 0) + 2 + Math.floor((nv - 1) / 4);
        const dOp = C.danoDaClasse(heroi.classe, nv, Math.round(C.danoDe(heroi, false) / 2)) + M.combos.bonusDeArma(heroi).bonus;
        const r = C.ataqueDeOportunidade(heroi, e, bonusOp, dOp, { tipoDano: M.danos.elementoDaArma(heroi) });
        ultimoAtaque = rodada;
        oportunidades++;
        if (r.dano > 0) ferir(e.nome, r.dano, heroi.nome);
      }
      if (!vivos().length) break;
      const grupoDePe = grupo.filter((g) => (g.vida || 0) > 0);
      const acoes = C.turnoDosInimigos({
        inimigos: vivos(), jogador: heroi, grupo: grupoDePe.length ? grupo : [],
        gdJogador: 0, grade, heroi: lugar, aliados, rodada, provocado: false, prioridade: "",
      });
      for (const a of acoes) {
        if (a.r) ultimoAtaque = rodada;
        if (a.deLonge) { disparos++; if (a.r && a.r.modo === "desvantagem") disparosColados++; }
        if (!(a.r && a.r.dano > 0)) continue;
        if (a.alvoRef === "jogador") { heroi = { ...heroi, vida: Math.max(0, (heroi.vida || 0) - a.r.dano) }; danoNoHeroi += a.r.dano; }
        else if (a.alvoRef === "grupo") { grupo = grupo.map((g) => (g.nome === a.alvoNome ? { ...g, vida: Math.max(0, (g.vida || 0) - a.r.dano) } : g)); danoNoGrupo += a.r.dano; }
      }
      /* ---- 3. O GRUPO: anda para o inimigo mais perto do herói, e age ---- */
      if (grupo.length) {
        const alvoDeles = [...vivos()].sort((a, b) => G.distanciaM(a, lugar) - G.distanciaM(b, lugar))[0];
        if (alvoDeles) {
          const vivosAli = aliados.map((a, i) => ({ ...a, vida: (grupo[i] || {}).vida || 0, i }));
          const mvA = G.moverInimigos(grade, vivosAli, alvoDeles, [lugar, ...vivos()]);
          aliados = mvA.inimigos.map(({ vida, i, ...resto }) => resto);
        }
        const acoesComp = C.turnoDosCompanheiros({
          grupo: grupo.filter((g) => (g.vida || 0) > 0), inimigos: vivos(),
          jogadorCaido: (heroi.vida || 0) <= 0, jogadorNome: heroi.nome, jogador: heroi, rodada, provocado: false, comFuria: [],
        });
        for (const ac of acoesComp) {
          if ((ac.tipo === "ataque" || ac.tipo === "habilidade") && ac.r) ultimoAtaque = rodada;
          if ((ac.tipo === "ataque" || ac.tipo === "habilidade") && ac.r && ac.r.dano > 0) ferir(ac.alvoNome, ac.r.dano, ac.companheiro);
          else if (ac.tipo === "cura") {
            const valor = ac.valor || 0;
            if (ac.alvo === heroi.nome) heroi = { ...heroi, vida: Math.min(heroi.vidaMax, Math.max(0, heroi.vida) + valor) };
            else grupo = grupo.map((g) => (g.nome === ac.alvo ? { ...g, vida: Math.min(g.vidaMax, Math.max(0, g.vida) + valor) } : g));
          }
          if (ac.custo) grupo = grupo.map((g) => (g.nome === ac.companheiro ? { ...g, mana: Math.max(0, (g.mana || 0) - ac.custo) } : g));
        }
      }
      if (sobrepostos()) sobreposicoes++;
      /* ---- 4. O RELÓGIO ---- */
      if ((heroi.condicoes || []).length) heroi = { ...heroi, condicoes: M.condicoes.tickCondicoes(heroi.condicoes).condicoes };
      if (!vivos().length) break;
      if ((heroi.vida || 0) <= 0 && !grupo.some((g) => (g.vida || 0) > 0)) break;
    }
    return {
      danoNoHeroi, danoNoGrupo, vitoria: vivos().length ? 0 : 1,
      rodadas: Math.min(rodada, AMOSTRA_DOS_ATIRADORES.tetoDeRodadas),
      recuos, oportunidades, disparos, disparosColados, ultimoAtaque, sobreposicoes,
    };
  });
}

/* ---------------- A MEDIDA ---------------- */
export function sondarAtiradores(M, { n = AMOSTRA_DOS_ATIRADORES.n, prefixo = AMOSTRA_DOS_ATIRADORES.prefixo, cenarios = Object.keys(LUTAS_DOS_ATIRADORES), comOportunidade = true, comFerida = false, degrauDeQuemAtira = null } = {}) {
  const out = {};
  for (const c of cenarios) {
    const soma = { dano: 0, danoGrupo: 0, vitoria: 0, rodadas: 0, recuos: 0, oportunidades: 0, disparos: 0, disparosColados: 0 };
    for (let i = 0; i < n; i++) {
      const r = lutaDosAtiradores(M, c, `${prefixo}|${i}`, { comOportunidade, comFerida, degrauDeQuemAtira });
      soma.dano += r.danoNoHeroi; soma.danoGrupo += r.danoNoGrupo; soma.vitoria += r.vitoria; soma.rodadas += r.rodadas;
      soma.recuos += r.recuos; soma.oportunidades += r.oportunidades; soma.disparos += r.disparos; soma.disparosColados += r.disparosColados;
    }
    out[c] = Object.fromEntries(Object.entries(soma).map(([k, v]) => [k, v / n]));
  }
  return out;
}

/* rodado direto: `node sonda-dos-atiradores.mjs [raiz-dos-modulos]` */
if (process.argv[1] && process.argv[1].endsWith("sonda-dos-atiradores.mjs")) {
  const t0 = Date.now();
  const raiz = process.argv[2] ? new URL("file:///" + process.argv[2].replace(/\\/g, "/").replace(/^\/+/, "") + "/").href : undefined;
  const M = await carregar(raiz);
  const m = sondarAtiradores(M);
  for (const [c, x] of Object.entries(m)) {
    console.log(`${c.padEnd(11)} dano no herói ${x.dano.toFixed(2).padStart(6)} · no grupo ${x.danoGrupo.toFixed(2).padStart(6)} · vitória ${(x.vitoria * 100).toFixed(1)}% · rodadas ${x.rodadas.toFixed(2)} · disparos ${x.disparos.toFixed(2)} (colados ${x.disparosColados.toFixed(2)}) · recuos ${x.recuos.toFixed(2)} · oportunidades ${x.oportunidades.toFixed(2)}`);
  }
  console.log(`(${Date.now() - t0} ms)`);
}
