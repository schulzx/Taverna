/* SONDA DA QUEDA (Fase Q · Q1) — quanto do desperdício viraria consequência

   ============================ O QUE ELA É ============================

   SONDA, NÃO SUÍTE: não entra em `npm test` (o corredor só junta
   `teste-*.mjs` e `check-*.mjs`), não tem limiar e não falha. Ela mede e
   publica; quem decide é a pessoa.

   E O QUE ELA PUBLICA É **PROJEÇÃO**, NÃO EFEITO MEDIDO. Q1 não liga nada
   — `quedaAoChegarAZero` e `falhasDoGolpeNoCaido` não são chamadas por
   nenhum arquivo de `src/` (a seção 8 de `teste-queda.mjs` é a catraca
   disso). Logo nenhum número aqui é "o combate depois de Q1": é "o que a
   tabela de Q1 cobraria pelos golpes que o combate de HOJE dá em quem já
   está no chão", com a mesa a comportar-se exatamente como se comporta
   agora. É aritmética sobre uma contagem, e está escrita assim de
   propósito.

   ==================== E ANTES DE LER QUALQUER NÚMERO ====================

   **A RÉGUA PASSA `grade: null` AO MOTOR** (`regua-combate.mjs`, no
   `turnoDosInimigos`; o cabeçalho di-lo inteiro em `TABULEIRO_NA_REGUA`).
   Ela NÃO TEM TABULEIRO: ninguém precisa de alcançar ninguém, todo golpe
   chega. É o **limite otimista** do desperdício — num combate com grade,
   parte destes golpes nem seria desferida. Nenhum número desta sonda pode
   ser vendido como "o jogo": é o teto do que o jogo pode estar a perder.

   E ela **NÃO REEQUILIBRA NADA**. `CATRACA_DE_UMA_VIDA` não é tocada,
   limiar nenhum é afrouxado, cenário nenhum muda. Balancear é da pessoa,
   e a régua está saturada — a medição de Q1 não é a etapa que a destrava.

   ==================== O NÚMERO ANTIGO, E POR QUE DIVERGE ====================

   O cabeçalho de `queda.js` e a pauta citam N1: **13,40% (`justo`) e
   18,03% (`duro`)** do dano inimigo em corpo caído, 38,15 ± 1,80 e
   62,19 ± 2,16 PV por combate. Esta sonda **não reproduz esses números**,
   e a causa está escrita no diário, no mesmo parágrafo em que eles
   nascem: N1 mediu com o **Adversário fora do circuito** (a régua passava
   `prioridade: ""`) e em parte por uma **reconstrução de `lutaDaMesa` no
   scratchpad**, não pela régua. N1b consertou o instrumento, e a régua de
   hoje mede o combate em que a oposição TEM vontade — e concentração de
   fogo é exatamente o que fabrica golpe em corpo caído (`teste-regua.mjs`
   mede a mesma coisa pelo lado dos golpes: 0,88 → 4,98 por combate).

   O número novo, com o instrumento declarado, está abaixo. O antigo não
   foi forçado a bater: forçá-lo seria escolher o número confortável em
   vez do medido. */

import {
  AMOSTRA_DA_REGUA, CENARIOS_DA_REGUA, ADVERSARIO_NA_REGUA, INTERVALO_DE_CONFIANCA,
  simularCombate, mediaComMargem, proporcaoComMargem, linhaDaMetrica,
} from "./regua-combate.mjs";
import { GOLPE_NO_CAIDO, falhasDoGolpeNoCaido, quedaAoChegarAZero, DONOS_DA_QUEDA } from "../src/queda.js";

const CENARIOS = ["justo", "duro"];
const N = AMOSTRA_DA_REGUA.n;
const FAMILIA = AMOSTRA_DA_REGUA.familiaDoRetrato;

const pct = (x, casas = 2) => (x * 100).toFixed(casas).replace(".", ",") + "%";
const num = (x, casas = 2) => x.toFixed(casas).replace(".", ",");

/* O QUE A TABELA DE Q1 COBRARIA POR UM CORPO, e a pergunta é feita à porta
   de verdade em vez de decidida aqui: `quedaAoChegarAZero` diz se aquele
   lado TEM contador de falhas, e `falhasDoGolpeNoCaido` diz quanto custa
   cada golpe. A sonda não sabe a regra — ela pergunta. */
const TESTA_DO_LADO = {
  heroi: quedaAoChegarAZero({ lado: DONOS_DA_QUEDA.heroi.id }).testa,
  companheiro: quedaAoChegarAZero({ lado: DONOS_DA_QUEDA.companheiro.id }).testa,
};
const falhasDeUmCorpo = (x, lado) => {
  const testa = TESTA_DO_LADO[lado];
  return falhasDoGolpeNoCaido({ critico: true, testa }) * x.criticos
    + falhasDoGolpeNoCaido({ critico: false, testa }) * (x.golpes - x.criticos);
};

console.log("=".repeat(72));
console.log("SONDA DA QUEDA (Q1) — o desperdício em corpo caído, e o que Q1 cobraria");
console.log("=".repeat(72));
console.log(`instrumento: régua sem tabuleiro (grade: null) · Adversário ${ADVERSARIO_NA_REGUA.ligado ? "LIGADO" : "desligado"}`);
console.log(`amostra: ${N} sementes da família "${FAMILIA}" · IC ${(INTERVALO_DE_CONFIANCA.nivel * 100).toFixed(0)}%`);
console.log(`tabela de Q1: ${JSON.stringify(GOLPE_NO_CAIDO)}`);

for (const cen of CENARIOS) {
  const golpes = [], dano = [], fracao = [], falhasComp = [], falhasHeroi = [];
  const mortesComp = [], mortesHeroi = [], corposComp = [];
  let totalDanoInimigo = 0, totalDanoCaidos = 0, combatesComDesperdicio = 0;

  for (let i = 0; i < N; i++) {
    const s = simularCombate(cen, `${FAMILIA}|${i}`);
    golpes.push(s.golpesEmCaidos);
    dano.push(s.danoEmCaidos);
    fracao.push(s.danoDosInimigos > 0 ? s.danoEmCaidos / s.danoDosInimigos : 0);
    totalDanoInimigo += s.danoDosInimigos;
    totalDanoCaidos += s.danoEmCaidos;
    if (s.golpesEmCaidos > 0) combatesComDesperdicio++;

    /* A PROJEÇÃO, CABEÇA A CABEÇA. Somar as falhas do combate e dividir
       pelo teto daria um número plausível e errado: três golpes espalhados
       por três caídos não matam ninguém, três no mesmo matam um. */
    let fc = 0, fh = 0, mc = 0, mh = 0, corpos = 0;
    for (const nome of Object.keys(s.golpesEmCaidosPorNome)) {
      const x = s.golpesEmCaidosPorNome[nome];
      const lado = nome === s.nomeDoHeroi ? "heroi" : "companheiro";
      const f = falhasDeUmCorpo(x, lado);
      if (lado === "heroi") { fh += f; if (f >= GOLPE_NO_CAIDO.falhasAteMorrer) mh++; }
      else { corpos++; fc += f; if (f >= GOLPE_NO_CAIDO.falhasAteMorrer) mc++; }
    }
    falhasComp.push(fc); falhasHeroi.push(fh);
    mortesComp.push(mc); mortesHeroi.push(mh); corposComp.push(corpos);
  }

  const mGolpes = mediaComMargem(golpes);
  const mDano = mediaComMargem(dano);
  const mFrac = mediaComMargem(fracao);
  const mFalhasC = mediaComMargem(falhasComp);
  const mFalhasH = mediaComMargem(falhasHeroi);
  const mMortesC = mediaComMargem(mortesComp);
  const mMortesH = mediaComMargem(mortesHeroi);
  const mCorpos = mediaComMargem(corposComp);
  const taxaComDesperdicio = proporcaoComMargem(combatesComDesperdicio, N);
  const comMorteComp = proporcaoComMargem(mortesComp.filter((x) => x > 0).length, N);

  const c = CENARIOS_DA_REGUA[cen];
  console.log("\n" + "-".repeat(72));
  console.log(`CENÁRIO "${cen}" — ${c.inimigos.quantos}× ${c.inimigos.base} (${c.inimigos.ameaca} nv${c.inimigos.nivel}) · grupo de ${c.grupo.length}`);
  console.log("-".repeat(72));

  console.log("\n  O QUE SE PERDE HOJE (contagem, não projeção)");
  console.log(`    golpes em corpo caído ....... ${linhaDaMetrica(mGolpes, 2)} por combate`);
  console.log(`    dano em corpo caído ......... ${linhaDaMetrica(mDano, 2)} PV por combate`);
  /* DUAS FRAÇÕES, e elas respondem a perguntas diferentes: a de cima é a
     média das frações por combate (com margem, que é o que se pode citar);
     a de baixo é a fração agregada, que é a que a frase "X% do dano
     inimigo" costuma querer dizer. Publicar só uma seria escolher. */
  console.log(`    fração do dano inimigo ...... ${pct(mFrac.media)} ± ${pct(mFrac.margem)}  (média por combate)`);
  console.log(`                                  ${pct(totalDanoCaidos / totalDanoInimigo)}  (agregado: ${num(totalDanoCaidos / N)} de ${num(totalDanoInimigo / N)} PV por combate)`);
  console.log(`    combates em que há sobra .... ${pct(taxaComDesperdicio.media, 1)} ± ${pct(taxaComDesperdicio.margem, 1)}`);
  console.log(`    corpos de companheiro que apanham no chão: ${linhaDaMetrica(mCorpos, 2)} por combate`);

  console.log("\n  O QUE Q1 COBRARIA POR ISSO (projeção — nada disto acontece hoje)");
  console.log(`    falhas em companheiros ...... ${linhaDaMetrica(mFalhasC, 2)} por combate`);
  console.log(`    quedas que virariam MORTE ... ${linhaDaMetrica(mMortesC, 3)} por combate`);
  console.log(`      (combates com ao menos uma: ${pct(comMorteComp.media, 1)} ± ${pct(comMorteComp.margem, 1)})`);
  console.log(`    e no herói caído ............ ${linhaDaMetrica(mFalhasH, 2)} falhas · ${linhaDaMetrica(mMortesH, 3)} mortes por combate`);
  console.log(`      [o herói JÁ rola teste de morte hoje; estas falhas seriam SOMADAS às dele]`);
}

console.log("\n" + "=".repeat(72));
console.log("A RESSALVA, repetida porque é ela que qualifica tudo acima:");
console.log("  · `grade: null` — a régua não tem tabuleiro. Todo golpe alcança.");
console.log("    É o LIMITE OTIMISTA do desperdício, nunca o número do jogo.");
console.log("  · Q1 não liga nada. Ninguém em `src/` chama a porta da queda.");
console.log("    Tudo acima é aritmética de tabela sobre uma contagem de hoje —");
console.log("    e a mesa de verdade reagiria (quem morre para de ser alvo),");
console.log("    o que esta sonda NÃO simula. Projeção, não efeito medido.");
console.log("  · Nada foi reequilibrado: `CATRACA_DE_UMA_VIDA` intacta.");
console.log("=".repeat(72));
