/* teste-intensidade-da-aflicao.mjs (31/10/2026, a 13.ª sessão de prova) — o sangue do rato não é o do elite

   O DEFEITO (relatório da 13.ª, o que ficou, item 3): o «Talho profundo» de
   um Rato Gigante «fraco», 4 PV, sangrava 3 por turno por três turnos — como
   o de um elite —, e pegava no mesmo 12. A condição saía do catálogo
   (`CONDICOES`, condicoes.js), que não sabe quem a pôs. Medido na régua com
   as aflições do inimigo ligadas, o sangue era metade das quedas da
   guerreira nova diante de três ratos — e o «Talho profundo» de um elite pegava no
   mesmo 12 e sangrava os mesmos 3.

   O conserto é uma tabela, `INTENSIDADE_DA_AFLICAO` (aflicoes.js): por
   ameaça de quem causa, o fator sobre o dano por turno e a soma na
   dificuldade. A instância leva o número dela, e o relógio
   (`tickCondicoes`) e a mecânica (`mecanicaDe`) cobram-no.

   MEDIDA (31/10, régua permanente com `comAflicoes`, 1000 sementes, a Iara
   da 13.ª — Guerreira nv1, 20 PV, Espada Longa, sem armadura; «cai» = chega
   a 0 PV na luta). Os dados da aflição têm corrente própria: a luta é a
   mesma nas três colunas, e o que muda é só a aflição.
                              sem aflição   catálogo (antes)   pela ameaça (depois)
     3 ratos, com o Dunstan       4,4%           7,4%               5,0%
     3 ratos, sozinha            18,5%          25,9%              20,2%
     2 bandidos, com o Dunstan   24,0%          26,8%              26,8%   (comum = catálogo)
     3 bandidos, com o Dunstan   73,0%          74,3%              74,3%
     1 elite (Ogro), com ele     82,2%          82,2%              82,2%   (os golpes do Ogro não afligem)
     1 elite (Lobo), com ele     85,7%          85,7%              86,2%
   O sangue de três ratos acrescentava 3,0 pontos às quedas da guerreira
   acompanhada (7,4 contra 4,4), e 7,4 à sozinha; pela ameaça, 0,6 e 1,7. O
   comum fica onde estava, e o elite aperta um pouco.
   FALHA ANTES: `INTENSIDADE_DA_AFLICAO` não existe (o import cai), e o
   sangue do rato é o do elite. */
import { INTENSIDADE_DA_AFLICAO, rolarAflicao, aflicaoDe } from "../src/aflicoes.js";
import { CONDICOES, tickCondicoes, mecanicaDe, criarCondicao } from "../src/condicoes.js";
import { DANO_DA_AMEACA } from "../src/combate.js";
import { simularCombate } from "./regua-combate.mjs";
import { sorteDaSemente } from "./regua-combate.mjs";

let ok = 0, mal = 0;
const t = (nome, cond, extra) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const ORDEM = ["fraco", "comum", "competente", "elite", "lendario"];
const J = JSON.stringify;

sec("1. A TABELA — a aflição segue a escala da ameaça");
{
  const T = INTENSIDADE_DA_AFLICAO;
  t("congelada, com as cinco ameaças de DANO_DA_AMEACA e só elas", Object.isFrozen(T) && ORDEM.every((a) => Object.isFrozen(T[a])) && Object.keys(T).join() === ORDEM.join() && Object.keys(DANO_DA_AMEACA).join() === ORDEM.join());
  t("o comum é o catálogo (fator 1, dificuldade +0): a chamada sem ameaça é a de sempre", T.comum.dano === 1 && T.comum.dif === 0);
  t("o fator do dano cresce do fraco ao lendário", ORDEM.every((a, i) => i === 0 || T[a].dano > T[ORDEM[i - 1]].dano));
  t("a dificuldade também, e em inteiros", ORDEM.every((a, i) => Number.isInteger(T[a].dif) && (i === 0 || T[a].dif > T[ORDEM[i - 1]].dif)));
  /* o fraco sangra na mesma razão em que morde: 2 / 5 do comum */
  t(`o fraco sangra na razão em que morde (${T.fraco.dano} = ${DANO_DA_AMEACA.fraco}/${DANO_DA_AMEACA.comum})`, Math.abs(T.fraco.dano - DANO_DA_AMEACA.fraco / DANO_DA_AMEACA.comum) < 1e-9);
  t("o texto do catálogo diz o número que cobra (é ele que se troca na instância)", Object.values(CONDICOES).filter((c) => c.danoTurno > 0).every((c) => String(c.desc).includes(`${c.danoTurno} de dano`)));
}

sec("2. O DADO — o Talho profundo do rato e o do elite");
{
  const talho = aflicaoDe("Talho profundo");
  t("o Talho profundo carrega sangrando (o golpe dos ratos da 13.ª)", !!talho && talho.cond === "sangrando");
  const rolar = (ameaca, extra = {}) => rolarAflicao({ fonte: "Talho profundo", nomeFonte: "Talho profundo (Rato Gigante 1)", atacante: "Rato Gigante 1", alvo: { nome: "Iara", condicoes: [] }, alvoNome: "você", sempre: true, bonusResistir: -30, rotuloResistir: "Salvaguarda de Vigor", sorte: sorteDaSemente("talho"), ameaca, ...extra });
  const fraco = rolar("fraco"), comum = rolar("comum"), elite = rolar("elite"), lend = rolar("lendario"), nada = rolar(null);
  t("o rato sangra 1 por turno, e o efeito diz 1", fraco.aplicou && fraco.cond.danoTurno === 1 && fraco.cond.efeito === "1 de dano por turno até estancar.", J(fraco.cond));
  t("e pega num 10, não no 12", fraco.dif === 10, String(fraco.dif));
  t("o elite sangra 5 (3 × 1,5, arredondado) e pega num 14", elite.cond.danoTurno === 5 && elite.dif === 14 && elite.cond.efeito.startsWith("5 de dano"), J([elite.cond.danoTurno, elite.dif]));
  t("o lendário sangra 6 e pega num 15", lend.cond.danoTurno === 6 && lend.dif === 15);
  t("o comum é o catálogo: nem campo novo, nem outra dificuldade", !("danoTurno" in comum.cond) && comum.dif === 12 && J(comum.cond) === J(nada.cond) && comum.texto === nada.texto && comum.nota === nada.nota);
  t("sem ameaça (o herói, a habilidade, o item): exatamente o de antes", J(nada.cond) === J(criarCondicao("sangrando", { origem: "Talho profundo (Rato Gigante 1)" })) && nada.dif === 12);
  t("a nota ao Narrador diz o número do rato", fraco.nota.includes("1 de dano por turno"), fraco.nota);
  for (const lixo of ["toString", "constructor", 7, {}, "", "FRACO"]) {
    const r = rolar(lixo);
    t(`ameaça lixo (${J(lixo)}): o catálogo, sem estourar`, !!r && J(r.cond) === J(nada.cond) && r.dif === 12);
  }
  /* o veneno e o fogo também: 2 → 1 e 4 → 2 no fraco */
  const veneno = rolarAflicao({ fonte: "Mordida peçonhenta", alvo: { condicoes: [] }, sempre: true, bonusResistir: -30, sorte: sorteDaSemente("v"), ameaca: "fraco" });
  const fogo = rolarAflicao({ fonte: "Garra flamejante", alvo: { condicoes: [] }, sempre: true, bonusResistir: -30, sorte: sorteDaSemente("f"), ameaca: "fraco" });
  t("o veneno do fraco: 1 por turno (catálogo 2)", veneno.cond.id === "envenenado" && veneno.cond.danoTurno === 1, J(veneno.cond));
  t("o fogo do fraco: 2 por turno (catálogo 4)", fogo.cond.id === "queimando" && fogo.cond.danoTurno === 2, J(fogo.cond));
  /* a condição que não cobra dano não ganha número */
  const tonto = rolarAflicao({ fonte: "Cabeçada estonteante", alvo: { condicoes: [] }, sempre: true, bonusResistir: -30, sorte: sorteDaSemente("c"), ameaca: "elite" });
  const pTonto = aflicaoDe("Cabeçada estonteante");
  t("atordoar não cobra dano, nem com um elite (só a dificuldade sobe, +2)", !!tonto && !("danoTurno" in tonto.cond) && tonto.dif === (CONDICOES.atordoado.resistir?.dif || 12) + (pTonto.dif || 0) + INTENSIDADE_DA_AFLICAO.elite.dif, J([tonto.cond, tonto.dif]));
  /* o buff do inimigo não é aflição: não tem teste, não tem número */
  const furia = rolarAflicao({ fonte: "Fúria", atacante: "Ogro", sempre: true, sorte: sorteDaSemente("u"), ameaca: "fraco" });
  t("a fúria de quem bate (um buff) é a do catálogo", !!furia && furia.escopo === "proprio" && J(furia.cond) === J(criarCondicao("enfurecido", { origem: "Ogro" })));
}

sec("3. O RELÓGIO — cobra o número da instância");
{
  const doRato = rolarAflicao({ fonte: "Talho profundo", alvo: { condicoes: [] }, sempre: true, bonusResistir: -30, sorte: sorteDaSemente("r"), ameaca: "fraco" }).cond;
  const r1 = tickCondicoes([doRato]);
  t("o sangue do rato cobra 1 por turno", r1.dano === 1 && r1.condicoes[0].danoTurno === 1, J(r1));
  t("e vence nos mesmos três turnos do catálogo", doRato.turnos === CONDICOES.sangrando.turnos);
  t("a mecânica diz 1 (o que o Narrador lê: «Perco 1 PV por turno»)", mecanicaDe([doRato]).danoTurno === 1);
  const doCatalogo = criarCondicao("sangrando");
  t("a instância sem número (todo save de antes): o catálogo, 3", tickCondicoes([doCatalogo]).dano === 3 && mecanicaDe([doCatalogo]).danoTurno === 3);
  t("número que não é número: o catálogo", tickCondicoes([{ ...doCatalogo, danoTurno: "x" }]).dano === 3 && tickCondicoes([{ ...doCatalogo, danoTurno: -2 }]).dano === 3 && tickCondicoes([{ ...doCatalogo, danoTurno: null }]).dano === 3);
  t("uma instância não inventa dano onde o catálogo não o tem", tickCondicoes([{ ...criarCondicao("atordoado"), danoTurno: 9 }]).dano === 0 && mecanicaDe([{ ...criarCondicao("atordoado"), danoTurno: 9 }]).danoTurno === 0);
  t("o sangue do rato e o veneno do elite somam cada um o seu", tickCondicoes([doRato, { ...criarCondicao("envenenado"), danoTurno: 3 }]).dano === 4);
  t("não muta a instância recebida", doRato.turnos === 3 && tickCondicoes([Object.freeze({ ...doRato })]).condicoes[0].turnos === 2);
}

sec("4. A CATRACA DA 13.ª — na régua, com as aflições do inimigo ligadas");
const IARA = { nome: "Iara", classe: "Guerreiro", nivel: 1, vidaMax: 20, vigor: 3, atributos: { forca: 2, destreza: 1, vigor: 3, intelecto: 1, presenca: 2, percepcao: 3 }, arma: "Espada Longa", armadura: null, escudo: null };
const DUNSTAN = { nome: "Dunstan", classe: "Caçador", nivel: 1, vidaMax: 12, vigor: 2, atributos: { forca: 1, destreza: 3, vigor: 2, intelecto: 0, presenca: 0, percepcao: 2 } };
const N = 1000;
function medir(inimigos, op = { comAflicoes: true }, grupo = [DUNSTAN]) {
  let cai = 0, dano = 0;
  for (let i = 0; i < N; i++) {
    const r = simularCombate({ id: "afl13", heroi: IARA, grupo, inimigos, tetoDeRodadas: 20 }, `ratos13|${i}`, op);
    if (r.rodadaDaQuedaDoHeroi != null) cai++;
    dano += r.pvHeroiMax - r.pvHeroi;
  }
  return { cai: cai / N, dano: dano / N };
}
const pct = (x) => (x * 100).toFixed(1) + "%";
{
  const ANTES = { comAflicoes: { forca: false } };
  const RATOS = { quantos: 3, ameaca: "fraco", nivel: 1, base: "Rato Gigante" };
  const r3 = medir(RATOS), r3a = medir(RATOS, ANTES), r3s = medir(RATOS, {});
  const s3 = medir(RATOS, undefined, []), s3a = medir(RATOS, ANTES, []);
  const BAND2 = { quantos: 2, ameaca: "comum", nivel: 2, base: "Bandido" }, BAND3 = { ...BAND2, quantos: 3 };
  const b2 = medir(BAND2), b2a = medir(BAND2, ANTES), b3 = medir(BAND3), b3a = medir(BAND3, ANTES);
  const LOBO = { quantos: 1, ameaca: "elite", nivel: 2, base: "Lobo" };
  const e1 = medir(LOBO), e1a = medir(LOBO, ANTES);
  console.log(`     3 ratos c/ Dunstan: sem aflição ${pct(r3s.cai)} · catálogo ${pct(r3a.cai)} · pela ameaça ${pct(r3.cai)} | sozinha: ${pct(s3a.cai)} → ${pct(s3.cai)} | 2 bandidos ${pct(b2a.cai)} → ${pct(b2.cai)} · 3 bandidos ${pct(b3a.cai)} → ${pct(b3.cai)} · 1 elite (Lobo) ${pct(e1a.cai)} → ${pct(e1.cai)}`);
  t(`três ratos com o sangue deles: a guerreira acompanhada cai em menos de 6% (${pct(r3.cai)}; com o sangue do catálogo, ${pct(r3a.cai)})`, r3.cai < 0.06 && r3.cai < r3a.cai);
  t(`sozinha, abaixo de 22% (${pct(s3.cai)}; antes ${pct(s3a.cai)})`, s3.cai < 0.22 && s3.cai < s3a.cai);
  t("o sangue do rato ainda dói: com ele, a guerreira cai mais do que sem aflição nenhuma", r3.cai > r3s.cai && r3.dano > r3s.dano);
  t("o comum é o catálogo também na luta: 2 e 3 bandidos, exatamente o de antes", b2.cai === b2a.cai && b2.dano === b2a.dano && b3.cai === b3a.cai && b3.dano === b3a.dano);
  t(`o elite aperta, nunca alivia (${pct(e1a.cai)} → ${pct(e1.cai)})`, e1.cai >= e1a.cai);
}

console.log(`\n${ok} ok, ${mal} falha(s)`);
process.exit(mal ? 1 : 0);
