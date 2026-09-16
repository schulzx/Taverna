/* teste-amortece.mjs (v9.274 · F1) — o abafo comprado com PM

   A segunda família de `APLICACAO_DO_BUFF` a comprar alguma coisa. A primeira
   (`absorve`) ganhou número na v9.233 e tem a suíte dela em `teste-efeitos`
   (13/14); esta cobra a irmã — a que compra PORCENTAGEM em vez de pontos, e
   que por isso não se gasta: o abrigo morre na primeira batida, o abafo vale
   em todo golpe enquanto o prazo durar.

   O CORAÇÃO DESTA SUÍTE É A ORDEM, e não o número. O número é uma régua de
   tabela e uma multiplicação; a ORDEM é onde uma etapa aditiva vira regressão
   silenciosa. `amortecerDano` (tracos.js) passou a ter quatro estações —
   Pele de Pedra → resistência de origem → ABAFO → redução fixa —, e o
   cabeçalho dele declara três razões para o abafo estar exatamente ali. As
   três são provadas na seção 3, cada uma com o seu CONTRAFACTUAL: não basta
   mostrar que a ordem de hoje dá certo, é preciso mostrar que a outra dava
   errado, senão a asserção não guarda nada.

   NENHUM NÚMERO DE TABELA APARECE AQUI COMO LITERAL. A régua (`porPM`,
   `minimo`, `teto`, `pisoDoGolpe`) é lida de volta de `AMORTECIMENTO_DO_BUFF`,
   e os quatro degraus que o cabeçalho de `efeitos.js` escreve em prosa são
   EXTRAÍDOS do próprio comentário e cobrados contra a tabela: se alguém mudar
   `porPM` de 5 para 6 e esquecer a prosa, é aqui que se vê. Os literais que
   sobram são RESULTADOS de golpe (30 → 15 → 11 → 6 → 2), e esses são o que a
   suíte existe para fixar.

   DETERMINISMO: não há `Math.random` em lado nenhum — todo golpe desta suíte é
   um número escrito, e as varreduras são laços fechados sobre faixas fixas. */

import { readFileSync } from "node:fs";
import {
  AMORTECIMENTO_DO_BUFF, ABSORCAO_DO_BUFF, BUFF_DA_HABILIDADE,
  efeitoDeBuff, efeitoDeMilagre, efeitoDeMagia, absorverDano, efeitosDe,
} from "../src/efeitos.js";
import { APLICACAO_DO_BUFF, aplicacaoDoBuff } from "../src/combos.js";
import { amortecerDano, reducaoDeTraco, pedraDisponivel } from "../src/tracos.js";
import { repartirDano } from "../src/invocacoes.js";
import { CLASSES } from "../src/classes.js";
import { SUBCLASSES } from "../src/subclasses.js";
import { ESPECIALIZACOES } from "../src/especializacoes.js";
import { MAGIAS } from "../src/grimorio.js";

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

const T = AMORTECIMENTO_DO_BUFF;

/* a régua da tabela, refeita aqui pela MESMA fórmula que `forcaDoAmortecimento`
   usa — ela é privada de propósito (efeitos.js), e a suíte não pode importá-la.
   O que garante que as duas não divergiram é a seção 1: esta régua é cobrada
   contra o que `efeitoDeBuff` de facto devolve, habilidade por habilidade. */
const regua = (pm) => Math.min(T.teto, Math.max(T.minimo, Math.round(pm * T.porPM)));

/* ---------------- O ACERVO, do mesmo jeito de `check-protecao` ----------------
   Uma família não se prova com objetos inventados: quem tem de casar com a
   tabela são as habilidades que o jogador compra. */
const acervo = [];
const guardar = (h, fonte) => { if (h && h.nome) acervo.push({ hab: h, fonte }); };
for (const c of CLASSES) for (const h of c.habilidades) guardar(h, `classe:${c.nome}`);
for (const [s, hs] of Object.entries(SUBCLASSES)) for (const h of hs) guardar(h, `subclasse:${s}`);
for (const [e, hs] of Object.entries(ESPECIALIZACOES)) for (const h of hs) guardar(h, `especializacao:${e}`);
for (const m of MAGIAS) guardar(m, "grimorio");

const HEROI_REGUA = { nome: "Régua", classe: "Guerreiro", nivel: 5, efeitos: [] };
const daFamilia = (id) => acervo.filter(({ hab }) => { const l = aplicacaoDoBuff(hab); return !!l && l.id === id; });
const familiaAmortece = daFamilia(T.familia);
const primeiraDe = (id) => (daFamilia(id)[0] || {}).hab || null;

/* as habilidades de verdade que esta suíte usa como instrumento, achadas pelo
   nome no acervo — se uma delas mudar de custo ou sair do catálogo, é melhor
   a suíte apontar o dedo do que continuar verde sobre um objeto inventado */
const porNome = (n) => (acervo.find(({ hab }) => hab.nome === n) || {}).hab || null;
const POSTURA = porNome("Postura Defensiva");   /* 2 PM — o piso da família */
const CORPO = porNome("Corpo de Ferro");        /* 3 PM */
const FE = porNome("Fé Compartilhada");         /* 4 PM */
const RESPIRACAO = porNome("Respiração de Ferro"); /* 5 PM — o teto */
const ESCUDO = porNome("Escudo Arcano");        /* a irmã `absorve`, 2 PM */
const ELO_VITAL = porNome("Elo Vital");         /* a invocação que divide o golpe */

const efeitoDe = (hab) => efeitoDeBuff(hab, HEROI_REGUA).efeito;
const fraseDe = (hab) => efeitoDeBuff(hab, HEROI_REGUA).extraEscopo;

const heroi = (extra = {}) => ({
  nome: "Orin", raca: "Humano", classe: "Guerreiro", nivel: 5,
  vida: 40, vidaMax: 40, grupo: [], habilidades: [], condicoes: [], efeitos: [], ...extra,
});

/* A FILA INTEIRA DO HERÓI, na ordem em que o `App.jsx` a monta:
   origem (`amortecerDano`) → invocação (`repartirDano`) → abrigo/poço/PV
   (`absorverDano`). A seção 9 confere que essa é mesmo a ordem lá. */
const fila = (pers, dano, tipo = "fisico") => {
  const a = amortecerDano(pers, dano, tipo);
  const r = repartirDano(a.pers, a.dano);
  const b = absorverDano(r.pers, r.dano);
  return {
    pers: b.pers,
    dano: b.dano,
    origem: a.dano, invocacao: r.dano, abrigo: b.dano,
    linhas: [...a.linhas, ...r.linhas, ...(b.linha ? [b.linha] : [])],
  };
};

/* ============================================================
   1. A TABELA É LIDA DE VOLTA
   ============================================================ */
sec("1. a tabela é lida de volta — a régua, a família e a prosa do cabeçalho");
{
  t("`AMORTECIMENTO_DO_BUFF` existe e é tabela", !!T && typeof T === "object");
  for (const k of ["familia", "porPM", "custoPadrao", "minimo", "teto", "pisoDoGolpe"]) {
    t(`a coluna \`${k}\` está escrita`, Object.prototype.hasOwnProperty.call(T, k));
  }
  t("a régua é crescente: o piso abaixo do teto", T.minimo < T.teto);
  t("e ninguém compra proporção de graça", T.porPM > 0);

  /* A FAMÍLIA CASA COM UMA LINHA REAL. Uma tabela que aponta para um id que
     `APLICACAO_DO_BUFF` não tem é a forma de a família inteira nascer morta
     sem que nada fique vermelho: `efeitoDeBuff` simplesmente nunca entraria
     no ramo dela. */
  const linha = APLICACAO_DO_BUFF.find((a) => a.id === T.familia);
  t("`familia` casa com uma linha de verdade de `APLICACAO_DO_BUFF`", !!linha, T.familia);
  t("e a linha traz o conceito que a frase do efeito vai usar", !!linha && typeof linha.conceito === "string" && linha.conceito.length > 0);
  t("e não é a linha da irmã `absorve`", T.familia !== ABSORCAO_DO_BUFF.familia);

  /* `custoPadrao` é o das DUAS irmãs, e o comentário diz que é pelo mesmo
     motivo (relíquia, poção e grimório chegam sem custo). Três números iguais
     em três tabelas é exatamente o que diverge em silêncio daqui a três
     versões — por isso a suíte cobra que continuem iguais. */
  t("`custoPadrao` continua o mesmo da irmã `absorve`", T.custoPadrao === ABSORCAO_DO_BUFF.custoPadrao);
  t("e o mesmo do buff ofensivo", T.custoPadrao === BUFF_DA_HABILIDADE.custoPadrao);

  /* OS QUATRO DEGRAUS QUE O CABEÇALHO ESCREVE, extraídos do próprio arquivo.
     O comentário de `AMORTECIMENTO_DO_BUFF` promete "2 PM → 10% · 3 → 15 ·
     4 → 20 · 5 → 25" e mais o total no prazo. Se alguém mexer em `porPM` e
     deixar a prosa para trás, a tabela passa a mentir por escrito — e é a
     prosa que o próximo agente lê antes de decidir alguma coisa. */
  const FONTE_EFEITOS = readFileSync(new URL("../src/efeitos.js", import.meta.url), "utf8");
  const degraus = [...FONTE_EFEITOS.matchAll(/·\s*(\d+)\s*PM\s*→\s*(\d+)%\s*→\s*(\d+)\s*por golpe\s*→\s*~(\d+)\s*no total/g)]
    .map((m) => ({ pm: +m[1], pct: +m[2], porGolpe: +m[3], total: +m[4] }));
  t("o cabeçalho escreve os degraus da régua em prosa", degraus.length >= 4, `achou ${degraus.length}`);
  for (const d of degraus) {
    t(`${d.pm} PM dá ${d.pct}% — a prosa e a tabela concordam`, regua(d.pm) === d.pct, `tabela diz ${regua(d.pm)}`);
  }

  /* O TETO MORDE ACIMA. O degrau mais caro da prosa já é o teto; um PM acima
     dele tem de continuar no teto, senão a coluna é decoração. */
  const maisCaro = degraus.reduce((a, b) => (b.pm > a.pm ? b : a), degraus[0]);
  t("o degrau mais caro da prosa já está no teto", maisCaro.pct === T.teto, `${maisCaro.pct} contra ${T.teto}`);
  t("e um PM acima dele não passa do teto", regua(maisCaro.pm + 1) === T.teto);
  t("e a conta sem teto passaria mesmo — o teto não é enfeite", (maisCaro.pm + 1) * T.porPM > T.teto);

  /* O PISO MORDE ABAIXO, pelo mesmo argumento. */
  const pmMinimo = Math.ceil(T.minimo / T.porPM);
  t("abaixo do piso a régua devolve o piso", regua(Math.max(1, pmMinimo - 1)) === T.minimo);
  t("e sem custo nenhum cai no `custoPadrao`", regua(T.custoPadrao) === Math.min(T.teto, Math.max(T.minimo, Math.round(T.custoPadrao * T.porPM))));

  /* A PARIDADE COM A IRMÃ — é o argumento inteiro do cabeçalho ("as duas
     famílias compram a mesma coisa pelo mesmo preço"), e ele depende de um
     número medido: o golpe mediano da arena, que o comentário de
     `ABSORCAO_DO_BUFF` escreve. Lido de lá, não copiado para cá. */
  const mediana = Number((FONTE_EFEITOS.match(/mediana (\d+)/) || [])[1]);
  t("o cabeçalho ainda declara o golpe mediano medido", Number.isFinite(mediana) && mediana > 0, String(mediana));
  const absorveDe = (pm) => Math.min(ABSORCAO_DO_BUFF.teto, Math.max(ABSORCAO_DO_BUFF.minimo, Math.round(pm * ABSORCAO_DO_BUFF.porPM)));
  for (const d of degraus) {
    const porGolpe = Math.round((mediana * regua(d.pm)) / 100);
    t(`${d.pm} PM abafa ${porGolpe} de um golpe mediano — é o que a prosa diz`, porGolpe === d.porGolpe, `prosa diz ${d.porGolpe}`);
    const noPrazo = porGolpe * BUFF_DA_HABILIDADE.turnosPadrao;
    t(`e o total no prazo (${noPrazo}) fica a um ponto do que a irmã compra (${absorveDe(d.pm)})`,
      Math.abs(noPrazo - absorveDe(d.pm)) <= 1);
  }

  /* E A FAMÍLIA DE VERDADE OBEDECE À RÉGUA, habilidade por habilidade. É o
     que liga a tabela ao acervo: `check-protecao` mede a faixa, aqui cobra-se
     a CONTA — cada número é o que a régua manda para aquele custo. */
  t("a família tem gente no acervo", familiaAmortece.length > 0, `achou ${familiaAmortece.length}`);
  for (const { hab, fonte } of familiaAmortece) {
    const n = efeitoDe(hab).amortece;
    const custo = Number(hab.custo) > 0 ? Number(hab.custo) : T.custoPadrao;
    t(`${fonte}/${hab.nome} (${hab.custo} PM) nasce com ${n}% — o que a régua manda`, n === regua(custo));
  }
  t("e a régua não achatou a família num número só", new Set(familiaAmortece.map(({ hab }) => efeitoDe(hab).amortece)).size > 1);
}

/* ============================================================
   2. O NASCIMENTO
   ============================================================ */
sec("2. o nascimento — a chave só existe onde a família existe");
{
  t("Postura Defensiva, Corpo de Ferro, Fé Compartilhada e Respiração de Ferro continuam no acervo",
    !!POSTURA && !!CORPO && !!FE && !!RESPIRACAO);
  t("e o Escudo Arcano e o Elo Vital também", !!ESCUDO && !!ELO_VITAL);

  t("um buff da família devolve a chave", "amortece" in efeitoDe(POSTURA));
  t("e o número é o da régua", efeitoDe(POSTURA).amortece === regua(POSTURA.custo));
  t("o buff mais caro da família chega ao teto", efeitoDe(RESPIRACAO).amortece === T.teto);
  t("e o mais barato ao piso", efeitoDe(POSTURA).amortece === T.minimo);

  /* A CHAVE É AUSENTE, NUNCA `false` NEM `0` — a mesma régua de `absorve` e de
     `concentracao`. `=== undefined` passaria por acaso; `in` é a pergunta
     certa, porque é ela que distingue "não nasceu" de "nasceu valendo zero". */
  const foraDaFamilia = efeitoDe({ nome: "Golpe Duplo", custo: 2, descricao: "Dois ataques no mesmo turno." });
  t("fora da família a chave não nasce (nem como `false`, nem como `0`)", ("amortece" in foraDaFamilia) === false);
  t("e o efeito ofensivo continua a somar dano como sempre somou", foraDaFamilia.bonus > 0 && foraDaFamilia.aplica === BUFF_DA_HABILIDADE.aplica);

  const abrigo = efeitoDe(ESCUDO);
  t("a irmã `absorve` nasce com a chave DELA", abrigo.absorve > 0);
  t("e não carrega a chave desta família", ("amortece" in abrigo) === false);

  /* as outras três famílias, colhidas do acervo de verdade */
  for (const linha of APLICACAO_DO_BUFF) {
    if (linha.id === T.familia) continue;
    const hab = primeiraDe(linha.id);
    if (!hab) { t(`a família "${linha.id}" tem representante no acervo`, false); continue; }
    t(`a família "${linha.id}" (${hab.nome}) não carrega a chave desta`, ("amortece" in efeitoDe(hab)) === false);
  }

  /* SEM CUSTO CAI NO `custoPadrao` — relíquia, poção e o que o piloto escolhe
     chegam assim, e sem isso a família inteira nasceria no piso por acidente. */
  const semCusto = { nome: "Manto de Bruma", descricao: "Reduz o dano recebido enquanto durar." };
  t("uma defensiva sem custo entra na família", (aplicacaoDoBuff(semCusto) || {}).id === T.familia);
  t("e cai no `custoPadrao`", efeitoDe(semCusto).amortece === regua(T.custoPadrao));
  t("custo zero também", efeitoDe({ ...semCusto, custo: 0 }).amortece === regua(T.custoPadrao));
  t("custo negativo também", efeitoDe({ ...semCusto, custo: -3 }).amortece === regua(T.custoPadrao));
  t("custo que não é número também", efeitoDe({ ...semCusto, custo: "caro" }).amortece === regua(T.custoPadrao));

  /* E AQUI A ASSERÇÃO DE CIMA NÃO CHEGA, E É PRECISO DIZÊ-LO. Com os números
     de hoje `regua(custoPadrao)` dá exatamente `minimo` (2 × 5 = 10 = o piso),
     logo "caiu no custoPadrao" e "caiu no piso porque o custo virou zero" são
     o MESMO número — medido por mutação: trocar o `custoPadrao` do fallback
     por `0` deixava esta suíte inteira verde. O único jeito de separar as duas
     é mexer na coluna e ver o código obedecer, como a seção 5 faz com o piso:
     `forcaDoAmortecimento` lê a tabela em tempo de chamada. Devolvida no
     `finally`, e a devolução é cobrada. */
  const custoOriginal = T.custoPadrao;
  const outro = Math.ceil((T.minimo + T.porPM) / T.porPM);  /* um degrau acima do piso */
  try {
    T.custoPadrao = outro;
    t(`com o \`custoPadrao\` em ${outro} PM, a defensiva sem custo passa a valer ${regua(outro)}%`,
      efeitoDe(semCusto).amortece === regua(outro) && regua(outro) !== T.minimo);
    t("ou seja: o fallback é mesmo o `custoPadrao`, e não o piso por acidente",
      efeitoDe({ ...semCusto, custo: 0 }).amortece === regua(outro));
  } finally {
    T.custoPadrao = custoOriginal;
  }
  t("e a tabela voltou ao que era", T.custoPadrao === custoOriginal);

  /* e o resto do efeito continua o que era: `bonus: 0` e o rótulo `protecao`,
     que é o que tira a defensiva da soma do golpe (`efeitoNoGolpe`, combos.js) */
  const ef = efeitoDe(FE);
  t("o efeito da família não soma no golpe (`bonus: 0`)", ef.bonus === 0);
  t("e leva o rótulo da linha da tabela", ef.aplica === (APLICACAO_DO_BUFF.find((a) => a.id === T.familia) || {}).aplica);
  t("e o prazo padrão do buff", ef.turnos === BUFF_DA_HABILIDADE.turnosPadrao);
}

/* ============================================================
   3. A MORDIDA, E A ORDEM — o coração da etapa
   ============================================================ */
sec("3. a mordida, e a ORDEM — a fila inteira do herói");
{
  /* ---- a mordida simples, com a conta à vista ---- */
  const comAbafo = (hab, extra = {}) => heroi({ efeitos: [efeitoDe(hab)], ...extra });
  const r15 = amortecerDano(comAbafo(CORPO), 20, "fisico");
  /* 15% de 20 = 3 → 20 vira 17 */
  t("Corpo de Ferro (15%) tira 3 de um golpe de 20", r15.dano === 17);
  t("e a linha nasce porque o número mudou", r15.linhas.length === 1);
  const r25 = amortecerDano(comAbafo(RESPIRACAO), 20, "fisico");
  /* 25% de 20 = 5 → 20 vira 15 */
  t("Respiração de Ferro (25%) tira 5 do mesmo golpe", r25.dano === 15);
  /* e o arredondamento é o do módulo, não uma segunda régua aqui:
     10% de 13 é 1,3 → 1; 10% de 15 é 1,5 → 2 (Math.round sobe no meio) */
  t("10% de 13 arredonda para baixo (13 → 12)", amortecerDano(comAbafo(POSTURA), 13, "fisico").dano === 12);
  t("10% de 15 arredonda para cima (15 → 13)", amortecerDano(comAbafo(POSTURA), 15, "fisico").dano === 13);
  t("um golpe pequeno de mais não muda e não gera linha",
    amortecerDano(comAbafo(POSTURA), 4, "fisico").dano === 4 && amortecerDano(comAbafo(POSTURA), 4, "fisico").linhas.length === 0);

  /* ---- A FILA INTEIRA, com números conferíveis do começo ao fim ----
     Goliath (Pele de Pedra) + Respiração de Ferro (25%) + Elo Vital com uma
     invocação de pé + Escudo Arcano (absorve 4), contra um golpe de 30:
       30 → Pele: floor(30/2) = 15
          → abafo: 15 − round(15×25/100 = 3,75 → 4) = 11
          → Elo Vital: floor(11/2) = 5 na invocação, 6 no herói
          → abrigo: 4 param, 2 chegam                                     */
  const invocacao = { nome: "Fera Espiritual", invocada: true, invocacaoId: "fera_menor", vida: 12, vidaMax: 12 };
  const oGoliath = heroi({
    raca: "Goliath",
    habilidades: [ELO_VITAL],
    grupo: [invocacao],
    efeitos: [efeitoDe(RESPIRACAO), efeitoDe(ESCUDO)],
  });
  const f = fila(oGoliath, 30, "fisico");
  t("a Pele de Pedra corta o golpe CHEIO: 30 → 15",
    amortecerDano(oGoliath, 30, "fisico").linhas.some((l) => /o golpe de 30 vira 15/.test(l)));
  t("o abafo morde depois dela: 15 → 11", f.origem === 11);
  t("a invocação divide o que sobrou: 11 → 6", f.invocacao === 6);
  t("e o abrigo come 4 do que de facto chega: 6 → 2", f.abrigo === 2);
  t("as quatro estações deixaram quatro linhas", f.linhas.length === 4);
  t("a invocação pagou 5 de PV", (((f.pers || {}).grupo || [])[0] || {}).vida === invocacao.vida - 5);

  /* ---- (i) A REDUÇÃO FIXA CONTINUA A ÚLTIMA ----
     Prova pela DIFERENÇA: o Anão e um herói sem traço nenhum, mesmo abafo,
     mesmo golpe. O que os separa tem de ser exatamente o que a tabela do Anão
     promete — um ponto inteiro, não uma fração dele. Se a subtração viesse
     antes da proporção, o ponto do Anão seria abafado junto com o golpe. */
  const anao = heroi({ raca: "Anão", efeitos: [efeitoDe(RESPIRACAO)] });
  const humano = heroi({ efeitos: [efeitoDe(RESPIRACAO)] });
  const red = reducaoDeTraco(anao, "fogo");
  t("o Anão ainda reduz dano de fogo por tabela", red > 0);
  let faixaFixa = 0;
  for (let d = 1; d <= 60; d++) {
    const a = amortecerDano(anao, d, "fogo").dano;
    const h = amortecerDano(humano, d, "fogo").dano;
    if (h > 0 && a === h - red) faixaFixa++;
  }
  t("a redução fixa vale o ponto INTEIRO em todo golpe da faixa — ela é a última",
    faixaFixa === 60, `só ${faixaFixa} de 60`);

  /* o contrafactual: com a ordem invertida (fixa antes da proporção) o Anão
     receberia MAIS dano em pelo menos um golpe da mesma faixa — ou seja, a
     tabela dele passaria a valer menos do que promete, em silêncio */
  const abafo25 = efeitoDe(RESPIRACAO).amortece;
  const invertida = [];
  for (let d = 1; d <= 60; d++) {
    const hoje = amortecerDano(anao, d, "fogo").dano;
    const trocado = Math.max(0, (() => { const s = Math.max(0, d - red); return s - Math.round((s * abafo25) / 100); })());
    if (trocado > hoje) invertida.push(d);
  }
  t("e invertê-las custaria dano ao Anão — o perigo é real, não teórico",
    invertida.length > 0, `nenhum golpe de 1 a 60 mudaria`);

  /* ---- (ii) A PORTA `d >= 4` DA PELE DE PEDRA VÊ O MESMO NÚMERO DE HOJE ----
     É a regressão silenciosa que a ordem existe para impedir: um Goliath com
     abafo tem de gastar a Pele exatamente nos mesmos golpes em que a gastaria
     sem ele. Varre-se a faixa inteira e compara-se o GASTO, não o dano. */
  const goliathNu = heroi({ raca: "Goliath" });
  const goliathAbafo = heroi({ raca: "Goliath", efeitos: [efeitoDe(RESPIRACAO)] });
  const divergem = [];
  for (let d = 0; d <= 40; d++) {
    const nu = pedraDisponivel(amortecerDano(goliathNu, d, "fisico").pers);
    const com = pedraDisponivel(amortecerDano(goliathAbafo, d, "fisico").pers);
    if (nu !== com) divergem.push(d);
  }
  t("o abafo não muda UM golpe em que a Pele de Pedra se gasta (0 a 40)",
    divergem.length === 0, `divergem em ${divergem.join(", ")}`);
  t("e a Pele continua a gastar-se a partir do golpe que a tabela dela manda",
    !pedraDisponivel(amortecerDano(goliathAbafo, 4, "fisico").pers) && pedraDisponivel(amortecerDano(goliathAbafo, 3, "fisico").pers));

  /* o contrafactual: se o abafo cortasse ANTES, um golpe de 4 chegaria à porta
     valendo 3 e ela fecharia — o traço racial mudaria por causa de um buff */
  const fechariam = [];
  for (let d = 0; d <= 40; d++) {
    const antesDaPele = d - Math.round((d * abafo25) / 100);
    if (d >= 4 && antesDaPele < 4) fechariam.push(d);
  }
  t("e cortar antes da Pele fecharia a porta dela em pelo menos um golpe",
    fechariam.length > 0, "nenhum golpe mudaria de lado");

  /* ---- (iii) O ABAFO MORDE O GOLPE CHEIO, ANTES DO ABRIGO ----
     O mesmo buff tem de valer o mesmo contra quem tem escudo e contra quem
     não tem. Mede-se a ECONOMIA (com abafo contra sem abafo) dos dois lados. */
  const abafoEf = efeitoDe(FE);       /* 20% */
  const abrigoEf = efeitoDe(ESCUDO);  /* absorve 4 */
  const comEscudo = (efs) => heroi({ efeitos: efs });
  const golpe = 20;
  const economiaComEscudo =
    fila(comEscudo([abrigoEf]), golpe).dano - fila(comEscudo([abafoEf, abrigoEf]), golpe).dano;
  const economiaSemEscudo =
    fila(comEscudo([]), golpe).dano - fila(comEscudo([abafoEf]), golpe).dano;
  t("o mesmo buff economiza o mesmo com escudo e sem escudo",
    economiaComEscudo === economiaSemEscudo && economiaComEscudo > 0,
    `${economiaComEscudo} contra ${economiaSemEscudo}`);

  /* o contrafactual: abafar o que SOBROU do abrigo faria o buff valer menos
     para quem tem escudo — a proporção passaria a depender da defesa alheia */
  const depoisDoAbrigo = (() => {
    const sobra = golpe - Math.min(abrigoEf.absorve, golpe);
    return sobra - Math.round((sobra * abafoEf.amortece) / 100);
  })();
  const economiaTrocada = fila(comEscudo([abrigoEf]), golpe).dano - depoisDoAbrigo;
  t("e abafar depois do abrigo pagaria menos a quem tem escudo",
    economiaTrocada < economiaSemEscudo, `${economiaTrocada} contra ${economiaSemEscudo}`);

  /* e a ordem vale igual para o poço de PV temporário, que mora dentro de
     `absorverDano` — ele é fixo como o abrigo, logo também come o que sobra */
  const comPoco = heroi({ efeitos: [abafoEf], temporario: { pv: 5, turnos: 3, fonte: "A bruma" } });
  const semPoco = heroi({ temporario: { pv: 5, turnos: 3, fonte: "A bruma" } });
  t("e o mesmo vale contra o poço de PV temporário",
    fila(semPoco, golpe).dano - fila(comPoco, golpe).dano === economiaSemEscudo);
}

/* ============================================================
   4. UM POR GOLPE, O MAIOR
   ============================================================ */
sec("4. um por golpe, o maior — dois abafos não somam nem se multiplicam");
{
  const dois = heroi({ efeitos: [efeitoDe(POSTURA), efeitoDe(FE)] });  /* 10% e 20% */
  const so20 = heroi({ efeitos: [efeitoDe(FE)] });
  const d = 20;
  const r = amortecerDano(dois, d, "fisico");
  t("dois abafos valem o do MAIOR", r.dano === amortecerDano(so20, d, "fisico").dano);
  /* 20% de 20 = 4 → 16. Somados (30%) dariam 14; multiplicados (0,9 × 0,8),
     também 14. O 16 é o que distingue a lei das duas alternativas. */
  t("e não somam: 20 vira 16, não 14", r.dano === 16);
  t("a ordem na lista não decide nada",
    amortecerDano(heroi({ efeitos: [efeitoDe(FE), efeitoDe(POSTURA)] }), d, "fisico").dano === r.dano);
  t("e a linha nomeia o que de facto abafou", r.linhas.some((l) => l.includes(FE.nome)));
  t("e não nomeia o menor", !r.linhas.some((l) => l.includes(POSTURA.nome)));

  /* três, e um deles empatado com o maior: continua um só */
  const tres = heroi({ efeitos: [efeitoDe(POSTURA), efeitoDe(FE), efeitoDe(CORPO)] });
  t("três abafos também valem um só", amortecerDano(tres, d, "fisico").dano === r.dano);
  t("e sai uma linha, não três", amortecerDano(tres, d, "fisico").linhas.length === 1);
}

/* ============================================================
   5. NADA ZERA UM GOLPE — e o piso sai da tabela
   ============================================================ */
sec("5. nada zera um golpe, e a estação nunca o aumenta");
{
  /* a varredura: todo abafo imaginável (inclusive os que a tabela nunca
     venderia, que é o que um save torto ou uma ficha injetada trazem) contra
     toda a faixa de golpe. Duas invariantes e nenhuma exceção. */
  let baixou = 0, subiu = 0, zerou = 0;
  for (let pct = 1; pct <= 100; pct++) {
    for (let d = 1; d <= 60; d++) {
      const saiu = amortecerDano(heroi({ efeitos: [{ nome: "Bruma", amortece: pct }] }), d, "fisico").dano;
      if (saiu > d) subiu++;
      if (saiu < Math.min(d, T.pisoDoGolpe)) zerou++;
      if (saiu < d) baixou++;
    }
  }
  t("a estação NUNCA aumenta um golpe (6000 combinações)", subiu === 0, `subiu em ${subiu}`);
  t("e NUNCA o leva abaixo do piso da tabela", zerou === 0, `furou em ${zerou}`);
  t("e morde de verdade na maior parte delas", baixou > 0, "nunca mordeu");
  t("nem um abafo de 100% zera o golpe", amortecerDano(heroi({ efeitos: [{ nome: "Bruma", amortece: 100 }] }), 40, "fisico").dano === T.pisoDoGolpe);

  /* O PISO SAI DA TABELA, NÃO DE UM LITERAL — e a única prova que vale é
     MEXER na tabela e ver o código obedecer. Com `pisoDoGolpe: 1` a coluna
     nunca morde (75% de 1 ainda é 1), então sem isto ela seria uma linha
     escrita e nunca exercida: exatamente o tipo de sentinela que apodrece.
     A tabela é devolvida ao que era no `finally`, e a devolução é cobrada. */
  const pisoOriginal = T.pisoDoGolpe;
  const alto = pisoOriginal + 6;
  try {
    T.pisoDoGolpe = alto;
    const bruma = () => heroi({ efeitos: [{ nome: "Bruma", amortece: 100 }] });
    t(`com o piso em ${alto}, um golpe grande para no piso e não abaixo`,
      amortecerDano(bruma(), 40, "fisico").dano === alto);
    t("e um golpe MENOR que o piso não é levantado por ele",
      amortecerDano(bruma(), alto - 1, "fisico").dano === alto - 1);
    t("e nesse caso nem linha nasce — nada mudou",
      amortecerDano(bruma(), alto - 1, "fisico").linhas.length === 0);
  } finally {
    T.pisoDoGolpe = pisoOriginal;
  }
  t("e a tabela voltou ao que era", T.pisoDoGolpe === pisoOriginal);

  /* a frase só nasce quando o número MUDOU — "13 vira 13" é contabilidade */
  const nuloEfeito = heroi({ efeitos: [{ nome: "Bruma", amortece: 1 }] });
  const r = amortecerDano(nuloEfeito, 2, "fisico");
  t("1% de 2 não muda nada, e por isso não há frase", r.dano === 2 && r.linhas.length === 0);
}

/* ============================================================
   6. REGRESSÃO ZERO FORA DA FAMÍLIA
   ============================================================ */
sec("6. regressão zero fora da família — mesmo dano, o MESMO objeto, nenhuma frase a mais");
{
  /* o controle: quem não tem traço nenhum e não tem abafo nenhum sai daqui
     exatamente como entrou, e a IDENTIDADE é a parte que importa — igualdade
     passaria com uma cópia nova, e é a cópia nova que faz a fiação de cima
     piscar por uma mudança que não existe */
  const casos = [];
  const juntar = (nome, pers) => casos.push([nome, pers]);

  juntar("ficha sem `efeitos`", (() => { const p = heroi(); delete p.efeitos; return p; })());
  juntar("`efeitos: null`", heroi({ efeitos: null }));
  juntar("`efeitos: [null]`", heroi({ efeitos: [null] }));
  juntar("`efeitos: [null, undefined, 0]`", heroi({ efeitos: [null, undefined, 0] }));
  juntar("`efeitos: {}` (nem lista é)", heroi({ efeitos: {} }));
  juntar("ficha `{}`", {});
  juntar("save antigo (sem `efeitos`, sem `tracoGastos`)", { nome: "Velho", raca: "Humano", vida: 10, vidaMax: 10 });
  juntar("efeito de milagre", heroi({ efeitos: [efeitoDeMilagre({ nome: "Bênção de Aço" }, "o aço canta")] }));
  juntar("magia de duração", heroi({ efeitos: [efeitoDeMagia(MAGIAS.find((m) => /hora/.test(String(m.duracao || ""))) || MAGIAS[0]).efeito] }));
  juntar("efeito do canal do Mestre (nome de atributo)", heroi({ efeitos: [{ nome: "Fôlego", bonus: 2, turnos: 3, aplica: "Força" }] }));
  juntar("abafo zerado num save torto", heroi({ efeitos: [{ nome: "Bruma", amortece: 0 }] }));
  juntar("abafo negativo num save torto", heroi({ efeitos: [{ nome: "Bruma", amortece: -30 }] }));
  juntar("abafo que não é número", heroi({ efeitos: [{ nome: "Bruma", amortece: "muito" }] }));
  for (const linha of APLICACAO_DO_BUFF) {
    if (linha.id === T.familia) continue;
    const hab = primeiraDe(linha.id);
    if (hab) juntar(`a família "${linha.id}" (${hab.nome})`, heroi({ efeitos: [efeitoDe(hab)] }));
  }

  for (const [nome, pers] of casos) {
    const d = 17;
    const r = amortecerDano(pers, d, "fisico");
    t(`${nome}: o dano sai inteiro`, r.dano === d, `saiu ${r.dano}`);
    t(`${nome}: sai o MESMO objeto \`pers\` (identidade)`, r.pers === pers);
    t(`${nome}: e nenhuma frase a mais`, r.linhas.length === 0, r.linhas.join(" | "));
  }

  /* e a ficha nula continua a não derrubar a conta — é a lei "nunca pode
     custar o turno", e esta função é chamada no meio do golpe */
  t("ficha `null` devolve o dano e não explode", amortecerDano(null, 9, "fisico").dano === 9);
  t("e devolve o `null` que entrou", amortecerDano(null, 9, "fisico").pers === null);
  t("golpe 0 sai 0 mesmo com abafo de pé",
    amortecerDano(heroi({ efeitos: [efeitoDe(RESPIRACAO)] }), 0, "fisico").dano === 0);
  t("e golpe que não é número sai 0",
    amortecerDano(heroi({ efeitos: [efeitoDe(RESPIRACAO)] }), "muito", "fisico").dano === 0);
}

/* ============================================================
   7. IMUTABILIDADE
   ============================================================ */
sec("7. imutabilidade — a ficha que entra não é tocada");
{
  const ef = efeitoDe(RESPIRACAO);
  const antesLista = [ef];
  const p = heroi({ raca: "Goliath", efeitos: antesLista });
  const foto = JSON.stringify(p);
  const r = amortecerDano(p, 30, "fisico");
  t("a ficha que entrou continua byte a byte o que era", JSON.stringify(p) === foto);
  t("a lista de efeitos que entrou é a mesma, com o mesmo tamanho", p.efeitos === antesLista && antesLista.length === 1);
  t("e o efeito lá dentro não foi tocado", antesLista[0] === ef && ef.amortece === T.teto);

  /* A FICHA QUE SAI É NOVA QUANDO ALGO FOI GASTO NELA — e só então. O abafo
     NÃO se gasta (é a diferença inteira para a irmã `absorve`), logo ele
     sozinho não tem o que escrever na ficha: quem cria ficha nova aqui é a
     Pele de Pedra, que é um recurso. Devolver uma cópia por um abafo que não
     mudou nada seria a fiação de cima a piscar de graça. */
  t("o Goliath gastou a Pele, então a ficha que volta é NOVA", r.pers !== p);
  t("e o gasto está nela, não na que entrou", !pedraDisponivel(r.pers) && pedraDisponivel(p));
  const so = heroi({ efeitos: [ef] });
  const rSo = amortecerDano(so, 30, "fisico");
  t("só o abafo mordeu: o dano baixou", rSo.dano < 30);
  t("mas nada foi gasto, então a ficha que volta é a MESMA", rSo.pers === so);
}

/* ============================================================
   8. A VOZ
   ============================================================ */
sec("8. a voz — o sistema não fala de si mesmo");
{
  /* os nomes de mecanismo que nunca podem aparecer na tela. "amortece" é o
     nome da chave e da família; "buff", "efeito", "tabela", "sistema",
     "mecanismo" e "família" são a casa a falar de si. */
  const PROIBIDAS = /amortec|família|familia|buff|tabela|mecanismo|modificador|percentagem|porcentagem|\bstat\b|sistema/i;

  /* `|| ""` não é frouxidão: é para que a estação MUDA falhe na asserção
     seguinte em vez de rebentar a suíte inteira com um `TypeError` — um
     varredor que estoura conta menos do que um que aponta o dedo. */
  const linha = amortecerDano(heroi({ efeitos: [efeitoDe(RESPIRACAO)] }), 20, "fisico").linhas[0] || "";
  t("o golpe abafado deixa uma linha", linha.length > 0);
  t("e ela nomeia o que o jogador ergueu", linha.includes(RESPIRACAO.nome));
  t("e não nomeia mecanismo nenhum", !PROIBIDAS.test(linha), linha);
  /* a linha de combate não traz sequer o SINAL de porcentagem: o que o jogador
     lê ali são os dois números do golpe, que é o que ele vê acontecer */
  t("e não traz sinal de porcentagem — só os dois números do golpe", !linha.includes("%"), linha);
  t("e é voz de mundo, com os dois lados à vista (20 → 15)", /20/.test(linha) && /15/.test(linha));

  /* um efeito sem nome não pode deixar a frase aleijada nem denunciar a chave */
  const semNome = amortecerDano(heroi({ efeitos: [{ amortece: T.teto }] }), 20, "fisico").linhas[0] || "";
  t("um abafo sem nome continua a render frase inteira", semNome.length > 0);
  t("e ela também não nomeia mecanismo nenhum", !PROIBIDAS.test(semNome), semNome);

  /* a frase do NASCIMENTO, que o jogador lê ao lançar */
  const frase = fraseDe(RESPIRACAO);
  const conceito = (APLICACAO_DO_BUFF.find((a) => a.id === T.familia) || {}).conceito;
  t("a frase do nascimento traz o conceito da tabela, não um texto novo", frase.includes(conceito));
  t("e não nomeia mecanismo nenhum", !PROIBIDAS.test(frase), frase);
  /* O NÚMERO ENTRA, E ENTRA DE PROPÓSITO — é gameplay: o jogador pagou PM e
     tem de poder saber o que comprou. É a mesma decisão que a irmã `absorve`
     tomou na v9.233 ("aguenta 4 do próximo golpe"), e `check-protecao` (7)
     cobra o número nesta frase no acervo inteiro. O sinal "%" viaja junto do
     número por ser a UNIDADE do que se comprou, não o nome de um mecanismo —
     é a única marca de sistema que esta suíte deixa passar, e deixa passar
     aqui e não na linha de combate, onde nenhum número de tabela aparece. */
  t("e o número que o jogador comprou está lá", frase.includes(String(efeitoDe(RESPIRACAO).amortece)));
  t("e o nome da chave não está", !/amortece/.test(frase));
  for (const { hab, fonte } of familiaAmortece) {
    t(`${fonte}/${hab.nome}: a frase não fala do mecanismo`, !PROIBIDAS.test(fraseDe(hab)), fraseDe(hab));
  }
}

/* ============================================================
   9. LIGADO AO JOGO — e a catraca
   ============================================================ */
sec("9. ligado ao jogo — a fila do App e os leitores da tabela");
{
  /* A ORDEM NO APP. A seção 3 prova a ordem CHAMANDO as três funções; isto
     confere que o `App.jsx` as chama na mesma ordem — uma coisa é a fila
     estar certa, outra é a mesa usar essa fila. */
  const APP = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
  const iAmort = APP.indexOf("amortecerDano(persTracos");
  t("o App amortece o golpe do herói pela porta de `tracos.js`", iAmort > 0);
  const bloco = APP.slice(iAmort, iAmort + 4000);
  const iRep = bloco.indexOf("repartirDano(");
  const iAbr = bloco.indexOf("passarPeloAbrigo(persTracos");
  t("e reparte com a invocação DEPOIS de amortecer", iRep > 0);
  t("e o abrigo vem por último", iAbr > iRep, `repartir em ${iRep}, abrigo em ${iAbr}`);

  /* A CATRACA (`teste-ligacao`): todo export precisa de ≥2 leitores, e uma
     regra nova sem leitor quebra a suíte no dia em que nasce. Esta suíte é
     um dos leitores de `AMORTECIMENTO_DO_BUFF`; o outro é `tracos.js`, que a
     lê para o PISO. Conferido aqui para que, se alguém tirar o import de lá,
     esta suíte diga POR QUE a catraca ficou vermelha. */
  const TRACOS = readFileSync(new URL("../src/tracos.js", import.meta.url), "utf8");
  t("`tracos.js` importa a tabela em vez de repetir os números",
    /import \{[^}]*AMORTECIMENTO_DO_BUFF[^}]*\} from "\.\/efeitos\.js"/.test(TRACOS));
  t("e lê o piso de lá, dentro da estação do abafo",
    /AMORTECIMENTO_DO_BUFF\.pisoDoGolpe/.test(TRACOS));
  t("e não deixou nenhum piso solto no meio do código",
    !/Math\.max\(1, *antes - Math\.round/.test(TRACOS));
  /* e a família é lida pelo NOME da tabela nos dois lados, nunca por um
     literal "amortece" solto — é o que impede as duas metades de divergirem */
  const EFEITOS = readFileSync(new URL("../src/efeitos.js", import.meta.url), "utf8");
  t("`efeitos.js` gateia o ramo pela `familia` da tabela",
    /protecao\.id === AMORTECIMENTO_DO_BUFF\.familia/.test(EFEITOS));
}

console.log(`\n${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
