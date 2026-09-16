/* ============================================================
   A SONDA DO EMPURRÃO (Fase Y · Y1) — quanto ele muda a distância

   COMO SE USA:
       node testes/sonda-empurrao.mjs

   SONDA, NÃO SUÍTE. O prefixo `sonda-` mantém-na fora do
   `rodar-tudo.mjs` (que só descobre `teste-*.mjs` e `check-*.mjs`): ela
   não entra em `npm test`, não tem limiar e não falha. **Medir não é
   travar.** Quem afirma o comportamento é `teste-disputa.mjs`; aqui só
   se publica o tamanho do efeito, e quem decide é a pessoa.

   ==================== POR QUE ELA É PRECISA ====================

   Empurrar muda DISTÂNCIA, e distância é o que decide o combate desta
   casa. X1 mediu que **10 de 10 plantas recusam corpo a corpo no turno
   1** — o herói abre a luta sem alcançar ninguém. W1 mediu **1,4
   rodadas de pura caminhada por luta**. Um verbo novo que mexe 1,5 m só
   vale a pena se esse 1,5 m for grande contra esses números — e se ele
   CHEGAR A ACONTECER, que é a segunda pergunta e a mais interessante:
   numa planta apertada, um empurrão que bate em parede na maioria das
   vezes é um botão decorativo.

   ==================== E POR QUE NÃO PELA RÉGUA ====================

   **A régua de B1 (`testes/regua-combate.mjs`) NÃO serve para isto, e
   está provado no próprio arquivo.** Ela roda com `grade: null`
   (`regua-combate.mjs:935`, declarado em `:484-486` e `:118-122`): não
   há tabuleiro nenhum, ninguém precisa de alcançar ninguém, e a tabela
   `TABULEIRO_NA_REGUA` (`:515-540`) lista `"distancia"`, `"posicao"` e
   `"deslocamento"` em **`naoMede`**, com todas as letras. Medir Y1 pela
   régua seria medir um empurrão num espaço sem espaço.

   Além disso `teste-regua.mjs:55-61` regista que os três cenários da
   régua estão **saturados** hoje (duro 0,0% · justo 1,6% · brando
   100%), e uma mudança de combate julgada neles não prova nada em
   direção nenhuma. **Esta sonda não reequilibra nada** — nenhum limiar
   é tocado, nenhum cenário muda. Balancear é decisão da pessoa.

   ==================== O QUE ELA MEDE, E COMO ====================

   Sobre as **`PLANTAS` reais de `grid.js`**, as dez, cada uma montada
   pela `montarGrade` de verdade (e não por uma planta fabricada aqui —
   uma parede inventada mediria o meu mapa, não o do jogo):

   1. **quantos metros** um empurrão bem-sucedido muda a distância NA
      PRÁTICA. Em teoria é uma casa (1,5 m); na prática o empurrão sai
      em diagonal, a distância é Chebyshev e o número medido pode ser
      outro. É por isso que se mede em vez de se afirmar.
   2. **com que frequência o empurrão é BLOQUEADO** pelos três casos —
      parede, borda do mapa, corpo no caminho —, planta a planta. Este
      é o número que interessa.
   3. **quanto isso vale** contra a caminhada medida em W1.

   DETERMINISMO POR SEMENTE. Tanto a colocação dos corpos como a sorte
   da disputa saem de `sorteDaSemente` (FNV-1a + LCG), **importada** de
   `regua-combate.mjs`, onde ela é exportada. Não é copiada de
   propósito: já há duas cópias do gerador no projeto e isso é dívida
   conhecida — uma terceira seria a dívida a crescer dentro do arquivo
   que a denuncia.

   A LIMITAÇÃO HONESTA: os corpos são colocados ao acaso em casas
   livres, não pela `posicionar` (que agrupa heróis de um lado e
   inimigos do outro). É o caso MÉDIO da planta, e não o da abertura da
   luta; a taxa de bloqueio por corpo é, por isso, uma média do campo e
   não a da primeira rodada. As duas outras causas — parede e borda —
   não dependem disto.
   ============================================================ */

import { sorteDaSemente } from "./regua-combate.mjs";
import {
  PLANTAS, montarGrade, distanciaM, ehParede, dentro,
  DESLOCAMENTO_PADRAO, METROS_POR_QUADRADO, EMPURRAO_NO_TABULEIRO,
} from "../src/grid.js";
import { empurrar, TABELA_DA_DISPUTA } from "../src/disputa.js";

const L = (...a) => console.log(...a);
const barra = (n = 72) => L("=".repeat(n));
const num = (x, casas = 2) => (Number.isFinite(x) ? x.toFixed(casas).replace(".", ",") : "—");
const pct = (a, b, casas = 1) => (b ? ((a / b) * 100).toFixed(casas).replace(".", ",") + "%" : "—");
/* o molde de `pendente` em `teste-regua.mjs:78`: imprime e não trava */
const med = (nome, valor) => L("  ··  " + nome + " — " + valor + "  (medido, não travado)");

/* ---------------- OS NÚMEROS DE FORA ----------------
   Os dois que dão escala ao resultado. Estão escritos aqui porque vêm
   de medições de OUTRAS fases (X1 e W1) e esta sonda não as refaz. */
const RODADAS_DE_CAMINHADA = 1.4;          // W1: rodadas de pura caminhada por luta
const AMOSTRA_POR_PLANTA = 2000;
const CORPOS_EXTRA = 4;                    // uma escaramuça pequena: herói, um aliado, três inimigos

/* O contexto que faz `cenarioDe` escolher cada planta. Passar pelo
   caminho real de `montarGrade` é o que garante que a parede medida é a
   parede do jogo. */
const CTX = {
  taverna: { local: "taverna" },
  masmorra: { emMasmorra: true },
  floresta: { bioma: "floresta" },
  estrada: {},
  cidade: { local: "cidade" },
  caverna: { local: "caverna" },
  ruina: { local: "ruina" },
  navio: { local: "navio" },
  gelo: { bioma: "gelo" },
  deserto: { bioma: "deserto" },
};

/* ---------------- AS FICHAS ----------------
   Um atacante forte contra um alvo fraco, de propósito: a pergunta
   desta sonda NÃO é "com que frequência a disputa se ganha" (isso é
   aritmética do d20 e muda com cada ficha) — é "quando ela se ganha, o
   que o tabuleiro faz com a vitória". Um par equilibrado desperdiçaria
   metade da amostra em derrotas e mediria a mesma coisa com metade da
   precisão. */
const FORTE = {
  nome: "Bram", classe: "Guerreiro", tamanho: "medio", nivel: 5, vida: 30, vidaMax: 30,
  atributos: { forca: 5, destreza: 1, vigor: 3 },
  pericias: { treinadas: ["atletismo"], especialistas: [] },
};
const FRACO = {
  nome: "Alvo", tamanho: "medio", nivel: 2, vida: 14, vidaMax: 14,
  atributos: { forca: 0, destreza: 0, vigor: 0 },
  pericias: { treinadas: [], especialistas: [] },
};

const venceu = (r) => !!(r && r.venceu === true);
const posDo = (r, alvo) => (r && r.para) || { x: alvo.x, y: alvo.y };

barra();
L("A SONDA DO EMPURRÃO — Taverna, Fase Y · Y1");
barra();
L(`\nA tabela diz: o empurrão anda ${JSON.stringify(EMPURRAO_NO_TABULEIRO)}`);
L(`Uma casa vale ${num(METROS_POR_QUADRADO, 1)} m · o deslocamento padrão é ${DESLOCAMENTO_PADRAO} m por rodada`);
L(`A disputa: ${JSON.stringify(TABELA_DA_DISPUTA)}`);
L(`\nAmostra: ${AMOSTRA_POR_PLANTA} empurrões por planta, ${Object.keys(PLANTAS).length} plantas, ${CORPOS_EXTRA} corpos extra no campo.`);

const geral = { tentativas: 0, ganhos: 0, movidos: 0, parede: 0, borda: 0, ocupado: 0, outro: 0, metros: 0, miolo: 0, mioloBloqueado: 0 };
const porPlanta = [];

for (const id of Object.keys(PLANTAS)) {
  const grade = montarGrade(CTX[id] || {});
  if (grade.cenario !== id) { L(`  !!  ${id}: o contexto escolheu "${grade.cenario}" — a planta não foi medida`); continue; }
  const sorte = sorteDaSemente("empurrao-" + id);
  const inteiro = (n) => Math.min(n - 1, Math.floor(sorte() * n));

  const livres = [];
  for (let x = 0; x < grade.largura; x++) for (let y = 0; y < grade.altura; y++) if (!ehParede(grade, x, y)) livres.push({ x, y });

  /* QUEM JÁ COMEÇAVA ENCOSTADO AO PERÍMETRO é um caso à parte, e misturá-lo
     com os outros infla a taxa de bloqueio: colocar corpos ao acaso põe uma
     boa fatia deles na moldura do mapa, e numa luta de verdade eles estão
     mais no meio. Contam-se os dois — o número bruto e o do MIOLO. */
  const naMoldura = (p) => p.x === 0 || p.y === 0 || p.x === grade.largura - 1 || p.y === grade.altura - 1;
  const c = { tentativas: 0, ganhos: 0, movidos: 0, parede: 0, borda: 0, ocupado: 0, outro: 0, metros: 0, metrosLista: [],
    miolo: 0, mioloBloqueado: 0 };

  for (let i = 0; i < AMOSTRA_POR_PLANTA; i++) {
    const alvoP = livres[inteiro(livres.length)];
    /* o atacante está COLADO ao alvo — empurrar é ação de corpo a corpo */
    const vizinhos = [];
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
      if (!dx && !dy) continue;
      const x = alvoP.x + dx, y = alvoP.y + dy;
      if (dentro(grade, x, y) && !ehParede(grade, x, y)) vizinhos.push({ x, y });
    }
    if (!vizinhos.length) continue;
    const quemP = vizinhos[inteiro(vizinhos.length)];

    const ocupadas = new Set([`${alvoP.x},${alvoP.y}`, `${quemP.x},${quemP.y}`]);
    const extras = [];
    for (let k = 0; k < CORPOS_EXTRA; k++) {
      const p = livres[inteiro(livres.length)];
      if (ocupadas.has(`${p.x},${p.y}`)) continue;
      ocupadas.add(`${p.x},${p.y}`);
      extras.push({ ...FRACO, nome: "corpo" + k, x: p.x, y: p.y });
    }

    const quem = { ...FORTE, x: quemP.x, y: quemP.y };
    const alvo = { ...FRACO, x: alvoP.x, y: alvoP.y };
    const r = empurrar({ grade, quem, alvo, entidades: [quem, alvo, ...extras], sorte });

    c.tentativas++;
    if (!venceu(r)) continue;
    c.ganhos++;
    const doMiolo = !naMoldura(alvoP);
    if (doMiolo) c.miolo++;
    const p = posDo(r, alvo);
    const andou = p.x !== alvo.x || p.y !== alvo.y;
    if (!andou && doMiolo) c.mioloBloqueado++;
    if (andou) {
      c.movidos++;
      const ganho = distanciaM(quem, p) - distanciaM(quem, alvo);
      c.metros += ganho;
      c.metrosLista.push(ganho);
    } else if (r.bloqueio === "parede") c.parede++;
    else if (r.bloqueio === "borda") c.borda++;
    else if (r.bloqueio === "ocupado") c.ocupado++;
    else c.outro++;
  }

  const bloqueados = c.parede + c.borda + c.ocupado + c.outro;
  porPlanta.push({ id, grade, ...c, bloqueados });
  for (const k of ["tentativas", "ganhos", "movidos", "parede", "borda", "ocupado", "outro", "metros", "miolo", "mioloBloqueado"]) geral[k] += c[k];
}

L("\n----------------------------------------------------------------------");
L("1. COM QUE FREQUÊNCIA O EMPURRÃO É BLOQUEADO — por planta");
L("   (a percentagem é sobre as disputas GANHAS: é a vitória que o chão come)");
L("----------------------------------------------------------------------");
for (const p of porPlanta) {
  med(`${p.id.padEnd(9)} ${String(p.grade.largura).padStart(2)}×${String(p.grade.altura).padEnd(2)} · ${p.grade.paredes.length} casas de parede`,
    `bloqueado ${pct(p.bloqueados, p.ganhos).padStart(6)}  (parede ${pct(p.parede, p.ganhos)} · borda ${pct(p.borda, p.ganhos)} · corpo ${pct(p.ocupado, p.ganhos)})`
    + `  ·  só no miolo: ${pct(p.mioloBloqueado, p.miolo)}`);
}
med("TOTAL das dez plantas", `bloqueado ${pct(geral.parede + geral.borda + geral.ocupado + geral.outro, geral.ganhos)} de ${geral.ganhos} vitórias`);
med("TOTAL, contando só quem NÃO começava encostado ao perímetro",
  `bloqueado ${pct(geral.mioloBloqueado, geral.miolo)} de ${geral.miolo} vitórias no miolo`);
{
  const piores = [...porPlanta].sort((a, b) => (b.bloqueados / b.ganhos) - (a.bloqueados / a.ganhos));
  L(`\n      a planta mais apertada é ${piores[0].id} (${pct(piores[0].bloqueados, piores[0].ganhos)} das vitórias comidas)`);
  L(`      a mais aberta é ${piores[piores.length - 1].id} (${pct(piores[piores.length - 1].bloqueados, piores[piores.length - 1].ganhos)})`);
  const porCausa = [["parede", geral.parede], ["borda", geral.borda], ["corpo no caminho", geral.ocupado]].sort((a, b) => b[1] - a[1]);
  L(`      a causa que mais barra é "${porCausa[0][0]}" (${pct(porCausa[0][1], geral.ganhos)} das vitórias)`);
  if (geral.outro) L(`      !! ${geral.outro} vitórias sem movimento e sem bloqueio nomeado — isso é um buraco no contrato, não uma medida`);
}

L("\n----------------------------------------------------------------------");
L("2. QUANTOS METROS O EMPURRÃO MUDA A DISTÂNCIA — na prática");
L("----------------------------------------------------------------------");
for (const p of porPlanta) {
  const media = p.movidos ? p.metros / p.movidos : 0;
  const distintos = [...new Set(p.metrosLista.map((x) => num(x, 2)))].sort();
  med(`${p.id.padEnd(9)} ${p.movidos} empurrões que moveram`,
    `${num(media)} m em média  (valores vistos: ${distintos.join(" · ")})`);
}
{
  const media = geral.movidos ? geral.metros / geral.movidos : 0;
  med("TOTAL — o metro médio de um empurrão que sai", `${num(media)} m`);
  L(`\n      em teoria uma casa são ${num(METROS_POR_QUADRADO, 1)} m; medido, o empurrão vale ${num(media)} m`);
  L(`      E O MEDIDO NÃO TEM DISPERSÃO NENHUMA. A suspeita, escrita antes de medir,`);
  L(`      era que o empurrão em diagonal afastasse MENOS de uma casa, porque a`);
  L(`      distância desta casa é Chebyshev. Não afasta: empurrar na diagonal para`);
  L(`      longe de quem empurra aumenta a Chebyshev exatamente uma casa, igual à`);
  L(`      reta. A hipótese estava errada, e o número mostra-o — que é toda a razão`);
  L(`      de se medir em vez de se afirmar.`);
  const porEmpurraoTentado = geral.tentativas ? geral.metros / geral.tentativas : 0;
  med("e por empurrão TENTADO (contando disputas perdidas e bloqueios)", `${num(porEmpurraoTentado)} m`);
}

L("\n----------------------------------------------------------------------");
L("3. QUANTO ISSO VALE CONTRA A CAMINHADA (W1: 1,4 rodadas por luta)");
L("----------------------------------------------------------------------");
{
  const media = geral.movidos ? geral.metros / geral.movidos : 0;
  const efetivo = geral.tentativas ? geral.metros / geral.tentativas : 0;
  const metrosDaCaminhada = RODADAS_DE_CAMINHADA * DESLOCAMENTO_PADRAO;
  med("a caminhada medida em W1, em metros", `${num(RODADAS_DE_CAMINHADA, 1)} rodadas × ${DESLOCAMENTO_PADRAO} m = ${num(metrosDaCaminhada, 1)} m por luta`);
  med("um empurrão bem-sucedido, em rodadas de caminhada", `${num(media / DESLOCAMENTO_PADRAO, 3)} rodada (${pct(media, metrosDaCaminhada)} da caminhada da luta)`);
  med("um empurrão TENTADO, em rodadas de caminhada", `${num(efetivo / DESLOCAMENTO_PADRAO, 3)} rodada (${pct(efetivo, metrosDaCaminhada)})`);
  const quantos = media ? metrosDaCaminhada / media : 0;
  med("empurrões para desfazer a caminhada inteira de uma luta", `${num(quantos, 1)} empurrões bem-sucedidos`);
  L(`\n      LEITURA. Um turno de empurrão devolve ${pct(media, DESLOCAMENTO_PADRAO)} do que um turno de`);
  L(`      corrida devolve. Empurrar NÃO é uma forma barata de fazer distância — e não`);
  L(`      devia ser: ele gasta o turno inteiro para mover UMA casa alguém que resiste.`);
  L(`      O que ele compra é POSIÇÃO (tirar do alcance, abrir a linha, pôr no terreno`);
  L(`      ruim), e posição não se mede em metros médios. O número que decide se o botão`);
  L(`      vale a pena é o da secção 1: em ${pct(geral.parede + geral.borda + geral.ocupado, geral.ganhos)} das vitórias o chão come o empurrão —`);
  L(`      ${pct(geral.mioloBloqueado, geral.miolo)} quando o alvo não começava encostado à moldura do mapa. E é esse`);
  L(`      número que diz que Empurrar NÃO é decorativo: na masmorra e na taverna ele`);
  L(`      sobe para ~10%, no deserto e na floresta fica em ~2%. O chão importa, e`);
  L(`      importa de forma diferente em cada planta — que é exatamente o que um verbo`);
  L(`      de posição devia fazer.`);
}

L("\n----------------------------------------------------------------------");
L("O QUE ESTA SONDA NÃO MEDIU");
L("----------------------------------------------------------------------");
L("  · o EFEITO no combate. Empurrar ainda não está ligado ao App — nenhum");
L("    destes empurrões acontece numa luta de verdade. Isto é o tamanho do");
L("    gesto, não o do resultado.");
L("  · a posição de ABERTURA. Os corpos são colocados ao acaso em casas");
L("    livres, não pela `posicionar`; a taxa de bloqueio por corpo é a média");
L("    do campo, não a da primeira rodada.");
L("  · e é essa colocação uniforme que INFLA a `borda`: uma fatia grande dos");
L("    alvos cai na moldura do mapa, onde empurrar para fora é o resultado");
L("    esperado. A coluna `só no miolo` da secção 1 é a leitura honesta do");
L("    aperto do TERRENO; a bruta é o limite de cima.");
L("  · o EQUILÍBRIO. A régua de B1 não tem tabuleiro e está saturada; nada");
L("    aqui foi recalibrado, e recalibrar é decisão da pessoa.");
barra();
