/* A RÉGUA DE COMBATE DE UMA VIDA (B1) — a prova do instrumento

   POR QUE ESTA SUÍTE EXISTE. `regua-combate.mjs` nasceu para ser a catraca
   de equilíbrio de Uma Vida — o modo que é o jogo, e o único que até hoje
   não tinha nenhuma. Mas um instrumento sem suíte é um script: ele apodrece
   em silêncio, e a lição inteira do cabeçalho da régua é sobre réguas que
   evaporam depois de usadas. O que esta suíte faz é transformar a medição
   em CATRACA — a régua passa a rodar em todo `npm test`, e uma mudança de
   combate que desequilibre Uma Vida fica vermelha no dia em que for escrita.

   A LEI QUE ELA TRAVA, em uma frase: no cenário `justo` o grupo vence entre
   35% e 65% das vezes, sobra no máximo 35 de 132 PV, e cai pelo menos 1,2
   dos 3 companheiros. Os três dentes, e por que cada número é esse, estão
   escritos na seção 5 — com a folga medida em margens, que é a única forma
   honesta de dizer "isto não vai ficar vermelho por resorteio".

   O QUE ELA DELIBERADAMENTE NÃO TRAVA está na seção 8, em `pendente(...)`:
   as métricas que a própria régua mediu como instáveis ou saturadas. Afirmar
   o instável é pior do que não afirmar — um dente que morde por acaso ensina
   a casa a ignorar o vermelho.

   NENHUMA REGRA DE JOGO MUDOU EM B1. `src/` está intocado; esta suíte lê a
   régua, e a régua compõe motores que já existiam. */

const R = await import("./regua-combate.mjs");
const { readFileSync, readdirSync } = await import("node:fs");

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

/* O PENDENTE — imprime, não conta, não derruba. É o lugar das medidas que a
   régua faz e que NÃO podem virar limiar (a régua mediu que oscilam entre
   famílias ou que estão saturadas contra um teto). Elas continuam visíveis
   em todo `npm test`, porque uma métrica que ninguém olha é uma métrica que
   ninguém percebe mudar — mas não têm força de lei. O molde é o mesmo que
   `teste-arena.mjs` usou em A1 e aposentou em A3 quando as duas pendentes
   dela viraram asserção; se algum destes números estabilizar um dia, o
   caminho é o mesmo: vira `t(...)`, com o motivo escrito. */
const pendente = (nome, valor) => console.log("  ··  " + nome + " — " + valor + "  (medido, não travado)");

const {
  CENARIOS_DA_REGUA, AMOSTRA_DA_REGUA, INTERVALO_DE_CONFIANCA, CATRACA_DE_UMA_VIDA, METRICAS_DA_REGUA,
  sorteDaSemente, comSorteTravada, simularCombate, mediaComMargem, proporcaoComMargem, concordam, medir, linhaDaMetrica,
} = R;

/* Quase toda asserção numérica desta suíte sai da mesma medição, e a medição
   é cara: 3 cenários × 4 famílias × 1000 sementes = 12 mil combates. Medir
   uma vez e afirmar muitas é o que mantém a suíte em ~10 s. */
const perto = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol;

/* ============================================================
   1. AS TABELAS, LIDAS DE VOLTA — "se é número, é tabela"
   ============================================================ */
sec("1. A TABELA LIDA DE VOLTA — nenhum número da catraca repetido à mão");
{
  const ids = Object.keys(CENARIOS_DA_REGUA);
  t("são exatamente três cenários — duro, justo, brando", ids.length === 3 && ["duro", "justo", "brando"].every((x) => ids.includes(x)), ids.join(","));
  t("todo cenário declara os três blocos (herói, grupo, inimigos) e o teto de rodadas",
    ids.every((id) => { const c = CENARIOS_DA_REGUA[id]; return c.id === id && c.heroi && Array.isArray(c.grupo) && c.grupo.length > 0 && c.inimigos && c.tetoDeRodadas > 0; }));
  t("todo cenário se explica em uma frase (`diz`)", ids.every((id) => typeof CENARIOS_DA_REGUA[id].diz === "string" && CENARIOS_DA_REGUA[id].diz.length > 20));

  /* O QUE A RÉGUA COMPARA É A DUREZA DO OUTRO LADO DA MESA. Está escrito na
     tabela e é a razão de o `for` do fim do bloco 1 existir: se alguém
     copiar o herói para dentro de `justo` em vez de apontar para o mesmo
     objeto, os três cenários começam a divergir em silêncio e a régua passa
     a medir duas coisas somadas. Identidade de referência, não igualdade. */
  t("o herói é o MESMO objeto nos três cenários (não cópia que pode divergir)",
    CENARIOS_DA_REGUA.justo.heroi === CENARIOS_DA_REGUA.duro.heroi && CENARIOS_DA_REGUA.brando.heroi === CENARIOS_DA_REGUA.duro.heroi);
  t("e o grupo também", CENARIOS_DA_REGUA.justo.grupo === CENARIOS_DA_REGUA.duro.grupo && CENARIOS_DA_REGUA.brando.grupo === CENARIOS_DA_REGUA.duro.grupo);
  t("o grupo é o trio de nível 5 do molde de P3/T1 (Mago, Clérigo, Engenheiro)",
    CENARIOS_DA_REGUA.duro.grupo.length === 3 && CENARIOS_DA_REGUA.duro.grupo.every((g) => g.nivel === 5) &&
    ["Mago", "Clérigo", "Engenheiro"].every((c) => CENARIOS_DA_REGUA.duro.grupo.some((g) => g.classe === c)));
  /* O herói VAI EQUIPADO, e o cabeçalho da régua conta o preço de não ir:
     sem arma e sem armadura ele cai na rodada 1 em 99,5% dos combates, e a
     régua deixa de medir um grupo com herói. */
  t("o herói entra equipado (arma, armadura e escudo) — sem isso a régua mede outra coisa",
    !!(CENARIOS_DA_REGUA.duro.heroi.arma && CENARIOS_DA_REGUA.duro.heroi.armadura && CENARIOS_DA_REGUA.duro.heroi.escudo));

  /* A ESCADA DA DUREZA. O que separa os três cenários é só o outro lado da
     mesa, e ela tem de andar numa direção só: duro > justo > brando. */
  t("a dureza escala só pelo outro lado: 4 elites nv9 · 4 elites nv6 · 3 comuns nv5",
    CENARIOS_DA_REGUA.duro.inimigos.quantos === 4 && CENARIOS_DA_REGUA.duro.inimigos.nivel === 9 && CENARIOS_DA_REGUA.duro.inimigos.ameaca === "elite" &&
    CENARIOS_DA_REGUA.justo.inimigos.quantos === 4 && CENARIOS_DA_REGUA.justo.inimigos.nivel === 6 && CENARIOS_DA_REGUA.justo.inimigos.ameaca === "elite" &&
    CENARIOS_DA_REGUA.brando.inimigos.quantos === 3 && CENARIOS_DA_REGUA.brando.inimigos.nivel === 5 && CENARIOS_DA_REGUA.brando.inimigos.ameaca === "comum");

  t("a amostra declara a escada, o N e as famílias", Array.isArray(AMOSTRA_DA_REGUA.degraus) && AMOSTRA_DA_REGUA.degraus.length >= 3 && AMOSTRA_DA_REGUA.n > 0);
  t("a escada é crescente (é escada, não lista)", AMOSTRA_DA_REGUA.degraus.every((d, i) => i === 0 || d > AMOSTRA_DA_REGUA.degraus[i - 1]));
  t("o N escolhido é um degrau da escada — foi medido, não chutado", AMOSTRA_DA_REGUA.degraus.includes(AMOSTRA_DA_REGUA.n));
  /* POR QUE NÃO O MAIOR DEGRAU — e o motivo mudou, então a linha muda junto.
     Ela dizia que a 2000 as famílias passavam a DISCORDAR em `danoSofrido`;
     depois do conserto da ordem do teste de morte na régua isso deixou de ser
     verdade (a 2000 as quatro concordam nas treze métricas). O que sobrou é o
     motivo verdadeiro, e ele nunca dependeu daquela discordância: subir o N
     compra PRECISÃO, e precisão mais fina do que a distância entre famílias
     mede o resorteio. O sinal está medido no módulo — `absorvido`/`abrigos`
     já estão a 0,94 da soma das próprias margens a 1000. A asserção é a
     mesma, e continua sendo sobre a ESCOLHA, não sobre o número: o N do
     retrato não é o maior degrau rodado. */
  t("e não é o maior degrau — o degrau maior foi rodado, não escolhido", AMOSTRA_DA_REGUA.n < Math.max(...AMOSTRA_DA_REGUA.degraus));
  t("são quatro famílias independentes e distintas", AMOSTRA_DA_REGUA.familias.length === 4 && new Set(AMOSTRA_DA_REGUA.familias).size === 4);
  t("a família do retrato é uma delas", AMOSTRA_DA_REGUA.familias.includes(AMOSTRA_DA_REGUA.familiaDoRetrato));

  t("o intervalo é o de 95%, e o z mora numa tabela só", INTERVALO_DE_CONFIANCA.nivel === 0.95 && perto(INTERVALO_DE_CONFIANCA.z, 1.959964, 1e-6));

  /* A CATRACA: o que ela declara tem de fechar com o resto da casa. */
  t("a catraca mora num cenário que existe", !!CENARIOS_DA_REGUA[CATRACA_DE_UMA_VIDA.cenario]);
  t("e é o `justo` — o único com resolução nos dois sentidos", CATRACA_DE_UMA_VIDA.cenario === "justo");
  t("piso e teto de vitória são proporções, e o piso vem antes do teto",
    CATRACA_DE_UMA_VIDA.pisoDeVitoria > 0 && CATRACA_DE_UMA_VIDA.tetoDeVitoria < 1 && CATRACA_DE_UMA_VIDA.pisoDeVitoria < CATRACA_DE_UMA_VIDA.tetoDeVitoria);
  t("a faixa é simétrica em torno da mesa no meio (35–65 é 50 ± 15)",
    perto(CATRACA_DE_UMA_VIDA.pisoDeVitoria + CATRACA_DE_UMA_VIDA.tetoDeVitoria, 1, 1e-9));
  t("a catraca usa as mesmas famílias e o mesmo N da amostra — um só instrumento",
    CATRACA_DE_UMA_VIDA.sementesPorFamilia === AMOSTRA_DA_REGUA.n &&
    CATRACA_DE_UMA_VIDA.familias.join("|") === AMOSTRA_DA_REGUA.familias.join("|"));

  /* A FAIXA NÃO É UM NÚMERO NOVO, E ISSO É PROVÁVEL. 35%–65% é exatamente a
     faixa que `teste-arena.mjs` trava para todo pronto desde que a arena
     existe. Um segundo limiar para a mesma pergunta seria a casa discordando
     de si mesma — e o dia em que alguém mexer em UM dos dois, este dente
     morde. A faixa da arena é um literal local da suíte dela (não um export),
     então a prova é textual, que é o que existe para provar. */
  const ARENA = readFileSync("teste-arena.mjs", "utf8");
  t("a faixa de vitória é a MESMA lei da arena — piso 0.35 e teto 0.65 lá também",
    ARENA.includes(`piso: ${CATRACA_DE_UMA_VIDA.pisoDeVitoria}`) && ARENA.includes(`teto: ${CATRACA_DE_UMA_VIDA.tetoDeVitoria}`));

  t("as treze métricas têm id único e cada uma diz o que responde",
    METRICAS_DA_REGUA.length === 13 && new Set(METRICAS_DA_REGUA.map((m) => m.id)).size === 13 &&
    METRICAS_DA_REGUA.every((m) => typeof m.diz === "string" && m.diz.length > 10));
  t("as quatro taxas estão marcadas como taxa, e só elas",
    METRICAS_DA_REGUA.filter((m) => m.taxa).map((m) => m.id).sort().join(",") === "estourouTeto,quedaDoHeroi,tpk,vitoria");
  t("os três dentes da catraca são métricas da régua", ["vitoria", "pvGrupo", "quedas"].every((id) => METRICAS_DA_REGUA.some((m) => m.id === id)));
}

/* ============================================================
   2. A MATEMÁTICA DA MARGEM — contra valor conhecido
   ============================================================
   Um limiar só vale o que vale a margem que o cerca. Se `mediaComMargem`
   errar, toda folga escrita na seção 5 é ficção — por isso aqui ela é
   conferida contra casos de resposta fechada, calculados à mão, e não
   contra ela mesma. */
sec("2. A MATEMÁTICA DA MARGEM — casos de valor conhecido");
{
  /* amostra constante: não há dispersão, e uma margem honesta é ZERO. */
  const cte = mediaComMargem([5, 5, 5, 5, 5]);
  t("amostra constante → média exata e margem 0", cte.media === 5 && cte.margem === 0 && cte.n === 5 && cte.desvio === 0);

  /* 1..5: média 3, desvio amostral √(10/4) = √2,5, margem = z·√2,5/√5. */
  const cinco = mediaComMargem([1, 2, 3, 4, 5]);
  const esperado = INTERVALO_DE_CONFIANCA.z * Math.sqrt(2.5) / Math.sqrt(5);
  t("1..5 → média 3 e margem z·s/√n, conferida à mão", perto(cinco.media, 3) && perto(cinco.margem, esperado, 1e-12) && perto(cinco.desvio, Math.sqrt(2.5), 1e-12));

  /* AS PONTAS DA AMOSTRA. Uma amostra vazia ou de um elemento não tem
     precisão nenhuma: `Infinity` é a verdade, e devolver 0 seria dizer que a
     medida é exata quando não há medida. */
  t("amostra vazia → margem infinita (não zero: não há medida)", mediaComMargem([]).margem === Infinity && mediaComMargem([]).n === 0);
  t("amostra de um → média certa, margem infinita", mediaComMargem([7]).media === 7 && mediaComMargem([7]).margem === Infinity);
  t("lixo não entra na conta (null, NaN, undefined são descartados)", (() => { const x = mediaComMargem([1, null, NaN, undefined, 3]); return x.n === 2 && x.media === 2; })());
  t("null/undefined no lugar da lista não derrubam", mediaComMargem(null).n === 0 && mediaComMargem(undefined).margem === Infinity);

  /* A PROPORÇÃO tem fórmula PRÓPRIA, e não é capricho: usar a margem da média
     num 0/1 dá quase o mesmo número por acidente aritmético e MENTE nas
     pontas, onde o desvio amostral é zero e a incerteza não é. */
  const meio = proporcaoComMargem(50, 100);
  t("50 de 100 → p = 0,5 e meia-largura z·√(p(1−p)/n)", perto(meio.media, 0.5) && perto(meio.margem, INTERVALO_DE_CONFIANCA.z * Math.sqrt(0.25 / 100), 1e-12));
  t("proporção conhecida fora do meio: 20 de 400", (() => { const x = proporcaoComMargem(20, 400); return perto(x.media, 0.05) && perto(x.margem, INTERVALO_DE_CONFIANCA.z * Math.sqrt(0.05 * 0.95 / 400), 1e-12); })());
  /* NAS PONTAS, o recuo é a regra de três de Laplace (3/n) — limite superior
     conhecido para p = 0 com 95%. Margem honesta em vez de margem nula. */
  t("zero acertos → margem 3/n, não 0 (a incerteza de p=0 não é nula)", perto(proporcaoComMargem(0, 1000).margem, 0.003) && proporcaoComMargem(0, 1000).media === 0);
  t("todos os acertos → o mesmo recuo do outro lado", perto(proporcaoComMargem(1000, 1000).margem, 0.003) && proporcaoComMargem(1000, 1000).media === 1);
  t("n = 0 → margem infinita", proporcaoComMargem(0, 0).margem === Infinity && proporcaoComMargem(3, 0).n === 0);

  /* CONCORDAM MORDE NOS DOIS SENTIDOS — é esta função que decide se a régua
     está medindo o jogo ou o resorteio, e uma que dissesse "sim" sempre
     deixaria a régua cega justamente onde ela é mais útil. */
  t("concordam: a 1,5 de distância com margens que somam 2 → sim", concordam({ media: 10, margem: 1 }, { media: 11.5, margem: 1 }));
  t("concordam: a 3 de distância com margens que somam 2 → NÃO", !concordam({ media: 10, margem: 1 }, { media: 13, margem: 1 }));
  t("concordam: distância exatamente igual à soma das margens ainda é acordo", concordam({ media: 10, margem: 1 }, { media: 12, margem: 1 }));
  t("concordam: um centésimo além já é desacordo", !concordam({ media: 10, margem: 1 }, { media: 12.01, margem: 1 }));
  t("concordam: sem os dois lados não há acordo", !concordam(null, { media: 1, margem: 1 }) && !concordam({ media: 1, margem: 1 }, null) && !concordam(null, null));
  t("margem infinita concorda com tudo (é o que 'não sei' significa)", concordam(mediaComMargem([7]), { media: -900, margem: 0 }));

  /* A LINHA PRONTA — é ela que vai para o diário e para o relato, e uma
     vírgula decimal errada já mandou número torto para a pauta antes. */
  t("linhaDaMetrica escreve 'média ± margem' com vírgula decimal", linhaDaMetrica({ media: 12.345, margem: 0.5678 }, 2) === "12,35 ± 0,57");
  t("e sabe dizer infinito e nada", linhaDaMetrica(mediaComMargem([7]), 1) === "7,0 ± ∞" && linhaDaMetrica(null) === "—");
}

/* ============================================================
   3. A SORTE TRAVADA — determinismo por semente
   ============================================================
   É o único árbitro que um sistema sem servidor tem. E a segunda metade
   importa tanto quanto a primeira: a troca de `Math.random` NÃO PODE VAZAR
   para a suíte seguinte — `rodar-tudo.mjs` roda cada suíte num processo,
   mas dentro DESTA suíte a régua roda dezenas de milhares de vezes, e um
   `Math.random` deixado semeado transformaria todo teste posterior num
   teste sobre o gerador da régua. */
sec("3. A SORTE TRAVADA — mesma semente, mesmo mundo; e nada vaza");
{
  const s1 = sorteDaSemente("prova");
  const s2 = sorteDaSemente("prova");
  const a = Array.from({ length: 20 }, () => s1());
  const b = Array.from({ length: 20 }, () => s2());
  t("mesma semente → a MESMA série de números", a.join("|") === b.join("|"));
  t("sementes diferentes → série diferente", Array.from({ length: 20 }, sorteDaSemente("outra")).join("|") !== a.join("|"));
  t("todo número cai em [0, 1)", a.every((x) => x >= 0 && x < 1));
  t("e a série não é constante (é gerador, não relógio parado)", new Set(a).size > 10);
  /* semente vazia/nula cai no padrão "regua" — a régua nunca fica sem árbitro */
  t("semente ausente cai num padrão, e ainda é determinística",
    Array.from({ length: 5 }, sorteDaSemente(null)).join("|") === Array.from({ length: 5 }, sorteDaSemente("")).join("|"));

  const original = Math.random;
  const dentro = comSorteTravada("travada", () => Math.random);
  t("comSorteTravada troca Math.random DURANTE a chamada", dentro !== original);
  t("e o restaura depois — a sorte não vaza", Math.random === original);
  t("o valor da função volta ao chamador", comSorteTravada("x", () => 42) === 42);
  /* O `finally` é o ponto inteiro: se a régua estourar no meio de um combate,
     a suíte seguinte não pode herdar um `Math.random` semeado. */
  let estourou = false;
  try { comSorteTravada("boom", () => { throw new Error("boom"); }); } catch { estourou = true; }
  t("e restaura MESMO quando a função estoura (o finally é o ponto)", estourou && Math.random === original);
}

/* ============================================================
   4. UM COMBATE — o retrato, e a mesma semente byte a byte
   ============================================================ */
sec("4. UM COMBATE — determinismo byte a byte e a forma do retrato");
{
  const c1 = simularCombate("justo", "umavida|0");
  const c2 = simularCombate("justo", "umavida|0");
  t("mesma semente = o MESMO combate, byte a byte", JSON.stringify(c1) === JSON.stringify(c2));
  /* e a ordem em que se roda não muda nada: um combate no meio não contamina
     o seguinte, porque cada um trava a própria sorte do zero. */
  simularCombate("duro", "ruido|1"); simularCombate("brando", "ruido|2");
  t("e continua o mesmo depois de outros combates no meio", JSON.stringify(simularCombate("justo", "umavida|0")) === JSON.stringify(c1));
  const diferentes = new Set(["a", "b", "c", "d", "e", "f"].map((s) => JSON.stringify(simularCombate("justo", s))));
  t("sementes diferentes = combates diferentes (não é resultado fixo)", diferentes.size >= 5, `${diferentes.size} distintos em 6`);
  t("a semente vale por cenário: o mesmo `umavida|0` dá lutas diferentes no duro e no brando",
    JSON.stringify(simularCombate("duro", "umavida|0")) !== JSON.stringify(simularCombate("brando", "umavida|0")));

  t("aceita o cenário por id ou pelo próprio objeto (é assim que a sabotagem entra)",
    JSON.stringify(simularCombate(CENARIOS_DA_REGUA.justo, "umavida|0")) === JSON.stringify(c1));
  let erro = false;
  try { simularCombate("nao-existe", "x"); } catch { erro = true; }
  t("cenário desconhecido estoura em vez de medir o nada", erro);

  /* A FORMA DO RETRATO: toda métrica da tabela aparece, e aparece número. */
  t("todas as treze métricas estão no retrato, e todas são finitas",
    METRICAS_DA_REGUA.every((m) => m.id === "primeiraQueda" || Number.isFinite(c1[m.id])), METRICAS_DA_REGUA.filter((m) => m.id !== "primeiraQueda" && !Number.isFinite(c1[m.id])).map((m) => m.id).join(","));
  t("`primeiraQueda` é rodada ou null — nunca um número inventado para combate sem queda",
    c1.primeiraQueda === null || (Number.isInteger(c1.primeiraQueda) && c1.primeiraQueda >= 1));
  t("os tetos do cenário vêm juntos: 132 PV de grupo e o PV do herói", c1.pvGrupoMax === 132 && c1.pvHeroiMax > 0);
  t("as quatro taxas são 0 ou 1 num combate só", ["vitoria", "quedaDoHeroi", "tpk", "estourouTeto"].every((k) => c1[k] === 0 || c1[k] === 1));
  t("o combate respeita o teto de rodadas do cenário", c1.rodadas >= 1 && c1.rodadas <= CENARIOS_DA_REGUA.justo.tetoDeRodadas);
  t("quedas nunca passa do tamanho do grupo", c1.quedas >= 0 && c1.quedas <= CENARIOS_DA_REGUA.justo.grupo.length);
  t("PV nunca é negativo, nem passa do máximo", c1.pvGrupo >= 0 && c1.pvGrupo <= c1.pvGrupoMax && c1.pvHeroi >= 0 && c1.pvHeroi <= c1.pvHeroiMax);
  /* OS TRÊS DESFECHOS SÃO EXCLUDENTES por construção — vitória, aniquilação e
     teto estourado. Um retrato com dois acesos (ou nenhum) é um combate que
     não terminou, e toda média feita em cima dele mente. */
  t("todo combate termina em exatamente um desfecho: vitória, TPK ou teto",
    ["umavida|0", "umavida|1", "aa|7", "bb|13", "cc|99"].every((s) => ["duro", "justo", "brando"].every((cen) => { const c = simularCombate(cen, s); return c.vitoria + c.tpk + c.estourouTeto === 1; })));

  /* A TABELA NÃO É GASTA PELO USO. `simularCombate` monta fichas novas a cada
     chamada; se um dia alguém mutar o herói do cenário dentro da simulação,
     o segundo combate mediria um herói já ferido e a régua andaria sozinha. */
  const antes = JSON.stringify(CENARIOS_DA_REGUA);
  for (let i = 0; i < 20; i++) simularCombate("duro", `desgaste|${i}`);
  t("a tabela de cenários sai da medição exatamente como entrou (nada é mutado)", JSON.stringify(CENARIOS_DA_REGUA) === antes);
  t("e as outras tabelas também", JSON.stringify(METRICAS_DA_REGUA).length > 0 && METRICAS_DA_REGUA.length === 13 && CATRACA_DE_UMA_VIDA.pisoDeVitoria === 0.35);
}

/* ============================================================
   A MEDIÇÃO — feita uma vez, afirmada muitas
   ============================================================
   O N DA SUÍTE É O N DA TABELA (1000), e não um recorte: a medição inteira
   dos três cenários nas quatro famílias custa ~8 s neste repositório, o que
   cabe de sobra no orçamento de `npm test`. Reduzir aqui só encolheria a
   folga (a margem cresce com 1/√n) para economizar segundos que não estão
   faltando — e a folga é o único motivo de os limiares serem confiáveis. */
const T0 = Date.now();
const MED = {};
for (const cen of ["justo", "duro", "brando"]) {
  MED[cen] = CATRACA_DE_UMA_VIDA.familias.map((fam) => medir(cen, { n: CATRACA_DE_UMA_VIDA.sementesPorFamilia, prefixo: fam }));
}
const CUSTO_DA_MEDIDA = Date.now() - T0;

/* ============================================================
   5. A CATRACA DE UMA VIDA — os três dentes
   ============================================================
   DE ONDE VEM CADA NÚMERO, e quanta folga ele tem. O retrato de hoje (4
   famílias × 1000 sementes, cenário `justo`) é:

     vitória      0,521 · 0,511 · 0,527 · 0,542   ± 0,031
     PV do grupo  25,88 · 26,35 · 26,52 · 28,06   ± 1,9 a 2,0  (de 132)
     quedas       1,790 · 1,773 · 1,768 · 1,740   ± 0,08   (de 3)

   · A FAIXA 35%–65% não é um número novo: é exatamente a que
     `teste-arena.mjs` trava para todo pronto desde que a arena existe (a
     seção 1 prova isso lendo a suíte dela). Um segundo limiar para a mesma
     pergunta — "a mesa está no meio?" — seria a casa discordando de si
     mesma. Folga medida: 5,20 a 6,22 margens acima do piso, 3,50 a 4,49
     abaixo do teto.
   · O TETO DE 35 PV (de 132) é a FOLGA no fim. Ele é o dente mais sensível
     a bônus ofensivo, porque matar mais cedo é apanhar menos — a régua
     mediu que +1 de dano por golpe já tira o PV da margem antes de tirar a
     vitória. Folga: 3,45 a 4,80 margens abaixo do teto — a menor da catraca,
     e ela NÃO foi comprada de volta: subir o teto de 35 para 36 devolveria os
     dois décimos que o conserto da ordem custou, e seria afrouxar um dente por
     cosmética. A lei é "mais de 2 margens", e 3,45 passa longe.
   · O PISO DE 1,2 QUEDA (de 3) é o PREÇO. Um grupo forte demais atravessa
     a luta sem derrubar ninguém, e isso acontece antes de a vitória
     estourar o teto. Folga: 6,69 a 7,41 margens acima do piso.

   POR QUE TANTA FOLGA, e por que isso não é frouxidão. É a lição de A4 e de
   C2b, e ela custou caro duas vezes: limiar encostado no retrato fica
   vermelho por RESORTEIO — mede o embaralhamento do RNG, não o jogo. Um
   dente que morde por acaso ensina a casa a ignorar o vermelho, e aí ele
   não protege mais nada. O teto tem de nomear uma MUDANÇA. Que a folga não
   é cegueira, a seção 7 prova com sabotagem: há mudanças pequenas o
   bastante para caber nela e mudanças reais que não cabem.

   NENHUM DOS TRÊS NÚMEROS APARECE ESCRITO AQUI: todos saem de
   `CATRACA_DE_UMA_VIDA`. Se é número, é tabela. */
sec("5. A CATRACA DE UMA VIDA — o grupo não é fraco demais nem forte demais");
{
  const K = CATRACA_DE_UMA_VIDA;
  const pct = (x) => (x * 100).toFixed(1) + "%";
  const faixa = `${(K.pisoDeVitoria * 100).toFixed(0)}%–${(K.tetoDeVitoria * 100).toFixed(0)}%`;

  MED.justo.forEach((r, i) => {
    const fam = K.familias[i];
    /* DENTE 1 — O DESFECHO. Vale em TODA família, não na que deu sorte: uma
       amostra só prova sorte, e é por isso que são quatro. */
    t(`[${fam}] o grupo vence entre ${faixa} — ${pct(r.vitoria.media)}`,
      r.vitoria.media >= K.pisoDeVitoria && r.vitoria.media <= K.tetoDeVitoria, linhaDaMetrica(r.vitoria, 3));
    /* DENTE 2 — A FOLGA. O dente mais sensível a bônus ofensivo. */
    t(`[${fam}] sobra no máximo ${K.tetoDePvDoGrupo} de ${r.pvGrupoMax} PV — ${r.pvGrupo.media.toFixed(2)}`,
      r.pvGrupo.media <= K.tetoDePvDoGrupo, linhaDaMetrica(r.pvGrupo, 2));
    /* DENTE 3 — O PREÇO. Um grupo que atravessa sem derrubar ninguém. */
    t(`[${fam}] o combate derruba pelo menos ${K.pisoDeQuedas} dos ${CENARIOS_DA_REGUA.justo.grupo.length} — ${r.quedas.media.toFixed(3)}`,
      r.quedas.media >= K.pisoDeQuedas, linhaDaMetrica(r.quedas, 3));
  });

  /* A FOLGA EM MARGENS, TRAVADA. É o dente que guarda os OUTROS dentes: se a
     folga encolher para menos de 2 margens, o limiar passou a medir
     resorteio e a régua deixou de ser confiável ANTES de ficar vermelha.
     Descobrir isso quando já está piscando é tarde demais. */
  const folgas = [];
  MED.justo.forEach((r) => {
    folgas.push((r.vitoria.media - CATRACA_DE_UMA_VIDA.pisoDeVitoria) / r.vitoria.margem);
    folgas.push((CATRACA_DE_UMA_VIDA.tetoDeVitoria - r.vitoria.media) / r.vitoria.margem);
    folgas.push((CATRACA_DE_UMA_VIDA.tetoDePvDoGrupo - r.pvGrupo.media) / r.pvGrupo.margem);
    folgas.push((r.quedas.media - CATRACA_DE_UMA_VIDA.pisoDeQuedas) / r.quedas.margem);
  });
  const menor = Math.min(...folgas);
  t(`todo limiar está a mais de 2 margens do retrato — a menor folga é ${menor.toFixed(2)}`, menor > 2, `${menor.toFixed(2)} margens`);

  /* E AS FAMÍLIAS TÊM DE CONCORDAR ENTRE SI nos três dentes. É a prova de
     que a régua mede o jogo e não o resorteio: duas famílias independentes
     que discordam estão medindo o embaralhamento. A régua declarou que a
     1000 as quatro concordam em todas as treze métricas — os três dentes
     são a parte disso que vira lei. */
  for (const id of ["vitoria", "pvGrupo", "quedas"]) {
    let discordes = 0;
    for (let i = 0; i < MED.justo.length; i++) for (let j = i + 1; j < MED.justo.length; j++) if (!concordam(MED.justo[i][id], MED.justo[j][id])) discordes++;
    t(`as quatro famílias concordam em \`${id}\` (o instrumento repete a si mesmo)`, discordes === 0, `${discordes} pares discordantes`);
  }
}

/* ============================================================
   6. OS DOIS GUARDAS — as pontas que não são catraca
   ============================================================ */
sec("6. OS GUARDAS — o teto de rodadas e o extremo brando");
{
  /* O GUARDA DA PRÓPRIA RÉGUA. Combate que bate no teto de rodadas NÃO
     TERMINOU, e toda média tirada de um monte deles está medindo o teto e
     não o jogo. Zero em 12 mil combates, nos três cenários — se um dia isto
     acender, a régua parou de medir antes de qualquer limiar mexer. */
  for (const cen of ["justo", "duro", "brando"]) {
    const estouros = MED[cen].reduce((s, r) => s + Math.round(r.estourouTeto.media * r.estourouTeto.n), 0);
    const combates = MED[cen].reduce((s, r) => s + r.estourouTeto.n, 0);
    t(`[${cen}] nenhum combate bate no teto de rodadas — 0 de ${combates}`, estouros === 0, `${estouros} estouros`);
  }

  /* O EXTREMO BRANDO. Ninguém cai, nunca: zero em 4000 combates nas quatro
     famílias. Não é catraca de equilíbrio — é alarme de incêndio. Uma queda
     aqui significa que alguma coisa quebrou em silêncio no combate, e este
     é o lugar mais barato do jogo para perceber. */
  const quedasBrando = MED.brando.reduce((s, r) => s + Math.round(r.quedas.media * r.quedas.n), 0);
  t(`[brando] ninguém cai — 0 quedas em ${MED.brando.reduce((s, r) => s + r.quedas.n, 0)} combates`, quedasBrando === 0, `${quedasBrando} quedas`);
  /* e a outra ponta do mesmo par: o brando se ganha SEMPRE. Sem isso, "0
     quedas" poderia significar que o grupo morreu antes de alguém cair. */
  t("[brando] e a luta se ganha em todas as famílias", MED.brando.every((r) => r.vitoria.media === 1), MED.brando.map((r) => r.vitoria.media).join(" "));

  /* A ESCADA DA DUREZA, medida. Os três cenários têm de ficar em ordem —
     duro < justo < brando em vitória — ou a tabela deixou de descrever o que
     mede. É o dente que pega uma troca de nível feita sem querer. */
  const vit = (cen) => Math.min(...MED[cen].map((r) => r.vitoria.media));
  const vitMax = (cen) => Math.max(...MED[cen].map((r) => r.vitoria.media));
  t("a dureza está em ordem: duro < justo < brando, em toda família",
    vitMax("duro") < vit("justo") && vitMax("justo") < vit("brando"),
    `duro ≤ ${vitMax("duro").toFixed(3)} · justo ${vit("justo").toFixed(3)}–${vitMax("justo").toFixed(3)} · brando ${vit("brando").toFixed(3)}`);
  /* E POR QUE A CATRACA NÃO MORA NOS OUTROS DOIS: eles estão SATURADOS. O
     duro perde quase sempre e o brando ganha sempre — uma mudança de combate
     que passe nos dois extremos não provou nada, provou que os dois extremos
     não a enxergam. Este dente trava a razão de existir do `justo`. */
  t("os outros dois cenários estão saturados — é por isso que a catraca mora no `justo`",
    vitMax("duro") < CATRACA_DE_UMA_VIDA.pisoDeVitoria && vit("brando") > CATRACA_DE_UMA_VIDA.tetoDeVitoria);
}

/* ============================================================
   7. A CATRACA MORDE — as sabotagens
   ============================================================
   UM LIMIAR QUE NUNCA FICA VERMELHO NÃO É UM LIMIAR: é decoração com custo
   de CPU. Estas três sabotagens mudam o cenário (nunca `src/`: B1 prometeu
   não tocar em produção) e provam que cada dente pega o que promete pegar.

   Números medidos a 500 sementes da família do retrato, escritos aqui para
   quem vier depois não precisar rodar de novo:

     sabotagem                         vitória   PV grupo   quedas
     (controle — nada sabotado)         51,2%     24,19      1,820
     4 elites de nível 8                21,0%      8,12      2,556   ← piso
     3 elites de nível 9                76,2%     45,16      1,058   ← os três
     grupo de nível 7                   89,4%     78,11      0,578   ← os três

   A PRIMEIRA MUDOU DE NÍVEL, E O MOTIVO É O ACHADO DO CICLO. Ela era "4
   elites de nível 7" e media 34,2% contra um piso de 35% — oito décimos de
   folga, o dente mais fino da suíte. Depois do conserto da ordem do teste de
   morte na régua, a MESMA sabotagem mede 36,4%: ela PAROU DE MORDER, e um
   dente que não morde não é dente. A saída não foi mexer no piso (35% é lei
   da casa, herdada da arena) e sim tornar a sabotagem uma sabotagem de novo:
   nível 8, que mede 21,0%.

   O QUE SE PERDEU ESTÁ ESCRITO, porque perder resolução em silêncio é pior
   do que perdê-la: a menor mudança de dureza que a faixa pega hoje é de DOIS
   níveis, não de um. Um nível inteiro (nv7, 36,3% a 1000 sementes) cabe na
   faixa por 1,3 ponto. A faixa continua não sendo larga o bastante para tudo
   passar — só não é mais fina a ponto de pegar um degrau.

   A TERCEIRA É A QUE B2 VAI ENCOSTAR: "grupo forte demais" é literalmente o
   risco da fase, e ela derruba os três dentes de uma vez. A régua também já
   mediu a escada do bônus ofensivo direto (ver `CATRACA_DE_UMA_VIDA`, no
   módulo): cada ponto de dano por golpe vale ~2,9 pontos de vitória, +1 já
   sai da margem no PV do grupo, e a catraca fica vermelha em +5 (nos dois
   tetos ao mesmo tempo). Essa escada não é reproduzida AQUI porque somar dano por golpe
   exige mexer no motor, e B1 não mexe — a sabotagem por cenário é a forma
   de provar o mesmo sem tocar em `src/`.

   AS SABOTAGENS USAM N MENOR (500) de propósito: elas estão a dezenas de
   margens do limiar, não a quatro. Gastar 1000 sementes para provar que
   90,2% > 65% seria comprar precisão que ninguém vai usar. */
sec("7. A CATRACA MORDE — sabotagem, o dente não é cego");
{
  const K = CATRACA_DE_UMA_VIDA;
  const J = CENARIOS_DA_REGUA.justo;
  const N_SABOTAGEM = 500;
  const sabotar = (id, mods) => medir({ ...J, id, ...mods }, { n: N_SABOTAGEM, prefixo: AMOSTRA_DA_REGUA.familiaDoRetrato });

  /* SABOTAGEM 1 — o outro lado da mesa DOIS níveis mais duro. Derruba SÓ o
     piso de vitória: é a prova de que a faixa tem resolução, e o comentário
     da seção diz exatamente quanta (um nível cabe, dois não). Era nível 7 e
     passou a 8 porque o nível 7 parou de morder depois do conserto da ordem
     do teste de morte — o piso não se moveu um dígito. */
  const s1 = sabotar("sabotagem:elites-nv8", { inimigos: { ...J.inimigos, nivel: 8 } });
  t(`sabotagem 1 (4 elites nv8): a vitória cai ABAIXO do piso — ${(s1.vitoria.media * 100).toFixed(1)}% < ${K.pisoDeVitoria * 100}%`,
    s1.vitoria.media < K.pisoDeVitoria, linhaDaMetrica(s1.vitoria, 3));
  /* e o dente do PV NÃO morde aqui — de propósito: os três dentes medem
     coisas diferentes, e um cenário mais duro deixa MENOS PV, não mais. Se
     este dia mordesse, os três seriam o mesmo dente com três nomes. */
  t("  ...e o teto de PV continua verde: os três dentes não são o mesmo dente", s1.pvGrupo.media <= K.tetoDePvDoGrupo, linhaDaMetrica(s1.pvGrupo, 2));

  /* SABOTAGEM 2 — um inimigo a menos e mais forte. Derruba os três. */
  const s2 = sabotar("sabotagem:tres-elites-nv9", { inimigos: { quantos: 3, ameaca: "elite", nivel: 9, base: "Adversário" } });
  t(`sabotagem 2 (3 elites nv9): a vitória passa do teto — ${(s2.vitoria.media * 100).toFixed(1)}% > ${K.tetoDeVitoria * 100}%`, s2.vitoria.media > K.tetoDeVitoria, linhaDaMetrica(s2.vitoria, 3));
  t(`  ...e sobra PV demais — ${s2.pvGrupo.media.toFixed(2)} > ${K.tetoDePvDoGrupo}`, s2.pvGrupo.media > K.tetoDePvDoGrupo, linhaDaMetrica(s2.pvGrupo, 2));
  t(`  ...e cai gente de menos — ${s2.quedas.media.toFixed(3)} < ${K.pisoDeQuedas}`, s2.quedas.media < K.pisoDeQuedas, linhaDaMetrica(s2.quedas, 3));

  /* SABOTAGEM 3 — O RISCO LITERAL DE B2: o grupo fica forte demais. Dois
     níveis a mais nos três companheiros, e nada mais muda de lado nenhum. */
  const s3 = sabotar("sabotagem:grupo-nv7", { grupo: J.grupo.map((g) => ({ ...g, nivel: 7 })) });
  t(`sabotagem 3 (grupo nv7 — o risco de B2): vitória acima do teto — ${(s3.vitoria.media * 100).toFixed(1)}%`, s3.vitoria.media > K.tetoDeVitoria, linhaDaMetrica(s3.vitoria, 3));
  t(`  ...PV acima do teto — ${s3.pvGrupo.media.toFixed(2)}`, s3.pvGrupo.media > K.tetoDePvDoGrupo, linhaDaMetrica(s3.pvGrupo, 2));
  t(`  ...quedas abaixo do piso — ${s3.quedas.media.toFixed(3)}`, s3.quedas.media < K.pisoDeQuedas, linhaDaMetrica(s3.quedas, 3));

  /* E A SABOTAGEM QUE NÃO SABOTA — o controle. O mesmo cenário copiado sem
     mudar nada tem de sair VERDE nos três dentes; sem esta linha, as três
     acima poderiam estar ficando vermelhas porque o caminho do objeto
     literal quebrou alguma coisa, e não porque a mudança pesou. */
  const s0 = sabotar("controle", {});
  t("controle (cenário copiado, nada mudado): os três dentes continuam verdes",
    s0.vitoria.media >= K.pisoDeVitoria && s0.vitoria.media <= K.tetoDeVitoria && s0.pvGrupo.media <= K.tetoDePvDoGrupo && s0.quedas.media >= K.pisoDeQuedas,
    `${linhaDaMetrica(s0.vitoria, 3)} · ${linhaDaMetrica(s0.pvGrupo, 2)} · ${linhaDaMetrica(s0.quedas, 3)}`);
  /* e o controle mede o MESMO que o id — o objeto e a string são a mesma mesa */
  t("e o controle bate com a medida por id (objeto e string são a mesma mesa)",
    perto(s0.vitoria.media, medir("justo", { n: N_SABOTAGEM, prefixo: AMOSTRA_DA_REGUA.familiaDoRetrato }).vitoria.media, 1e-12));
}

/* ============================================================
   8. O QUE NÃO VIRA LIMIAR — e por que não
   ============================================================
   A régua mediu, em 4 famílias × 1000, quais métricas NÃO aguentam virar
   catraca. Elas ficam aqui: asserção de FORMA (existe, é número finito,
   está no intervalo possível) e o valor impresso como `pendente`, para a
   casa continuar vendo o número sem que ele tenha força de lei.

   Afirmar o instável é pior do que não afirmar. Um dente que fica vermelho
   por resorteio treina a pessoa a rodar de novo até ficar verde, e nesse dia
   TODOS os dentes pararam de valer. */
sec("8. O QUE NÃO VIRA LIMIAR — medido, impresso, não travado");
{
  const r = MED.justo[0], d = MED.duro[0], b = MED.brando[0];

  /* ABSORVIDO e ABRIGOS: os números mais ralos da régua (0,24 a 0,29 abrigo
     por combate) e os que mais oscilam entre famílias — 1,75 · 1,57 · 1,55 ·
     1,43 de PV parado. Concordam a 1000, mas são o par MAIS APERTADO da régua
     inteira (a 0,94 da soma das próprias margens); um limiar ali mede o
     NASCIMENTO do escudo, não o equilíbrio. E a contagem ainda por cima não é
     portável entre reconstruções — o módulo mede quanto o kit do herói e a
     ordem da rodada a movem. É justamente a peça que B2 encosta, então ela
     fica visível. */
  t("`absorvido` e `abrigos` existem e são finitos (forma, não limiar)", Number.isFinite(r.absorvido.media) && Number.isFinite(r.abrigos.media) && r.absorvido.media >= 0 && r.abrigos.media >= 0);
  pendente("[justo] PV parado pelo abrigo", linhaDaMetrica(r.absorvido, 2) + " · abrigos " + linhaDaMetrica(r.abrigos, 3) + "  [ralo e oscilante entre famílias]");

  /* DANOSOFRIDO: a terceira métrica mais apertada da régua (0,79 da soma das
     margens a 1000), e a única do par ofensivo/defensivo que chega perto de
     discordar entre famílias. Um limiar em cima dela mede o resorteio antes
     de medir o jogo. (Ela JÁ discordou a 2000, e não discorda mais desde o
     conserto da ordem do teste de morte — o motivo de não travá-la é a folga
     curta, não a discordância que passou.) */
  t("`danoSofrido` existe e é finito, e o par ofensivo/defensivo continua completo", Number.isFinite(r.danoSofrido.media) && Number.isFinite(r.danoDesferido.media) && r.danoDesferido.media > 0);
  pendente("[justo] dano sofrido", linhaDaMetrica(r.danoSofrido, 2) + "  [a terceira mais apertada entre famílias]");
  pendente("[justo] dano desferido", linhaDaMetrica(r.danoDesferido, 2));

  /* PVHEROI e QUEDADOHEROI no duro e no justo: o herói cai em 98% a 100%
     dos combates. São métricas SATURADAS, e limiar em cima de um teto não
     mede nada — pode ficar verde depois de uma mudança que piorou tudo. */
  t("`quedaDoHeroi` é uma taxa válida nos dois cenários duros", r.quedaDoHeroi.media >= 0 && r.quedaDoHeroi.media <= 1 && d.quedaDoHeroi.media >= 0 && d.quedaDoHeroi.media <= 1);
  pendente("[justo] o herói cai em", (r.quedaDoHeroi.media * 100).toFixed(1) + "% dos combates, PV final " + linhaDaMetrica(r.pvHeroi, 2) + "  [saturada]");
  pendente("[duro]  o herói cai em", (d.quedaDoHeroi.media * 100).toFixed(1) + "% dos combates  [saturada]");

  /* PRIMEIRAQUEDA no brando: ninguém cai, e a média de um conjunto vazio não
     é um número. A régua devolve n=0 e margem infinita — que é a resposta
     honesta, e é ISSO que vira asserção: não o valor, a honestidade. */
  t("[brando] `primeiraQueda` não inventa número onde não houve queda — n = 0 e margem infinita",
    b.primeiraQueda.n === 0 && b.primeiraQueda.margem === Infinity);
  pendente("[justo] rodada da primeira queda", linhaDaMetrica(r.primeiraQueda, 2) + " sobre " + r.primeiraQueda.n + " combates com queda");

  /* TPK e RODADAS ficam de forma: são bons diagnósticos, mas nenhum foi
     medido em quatro famílias com folga bastante para virar dente. */
  t("`tpk` é taxa válida e `rodadas` está dentro do teto do cenário",
    r.tpk.media >= 0 && r.tpk.media <= 1 && r.rodadas.media > 0 && r.rodadas.media <= CENARIOS_DA_REGUA.justo.tetoDeRodadas);
  pendente("[justo] TPK / duração", (r.tpk.media * 100).toFixed(1) + "% · " + linhaDaMetrica(r.rodadas, 2) + " rodadas");

  /* E A MEDIDA DEVOLVE TUDO O QUE A TABELA PROMETE — este é o dente que
     guarda a seção inteira: se uma métrica sumir de `medir`, as pendentes
     acima passariam a imprimir "—" em silêncio e ninguém notaria. */
  t("`medir` devolve TODAS as métricas da tabela, cada uma com média, margem e n",
    METRICAS_DA_REGUA.every((m) => r[m.id] && Number.isFinite(r[m.id].media) && typeof r[m.id].n === "number"),
    METRICAS_DA_REGUA.filter((m) => !r[m.id]).map((m) => m.id).join(","));
  t("e o cabeçalho da medida diz o que foi medido (cenário, família, quantos)",
    r.cenario === "justo" && r.prefixo === CATRACA_DE_UMA_VIDA.familias[0] && r.combates === CATRACA_DE_UMA_VIDA.sementesPorFamilia);
  t("os tetos do cenário viajam com a medida (PV do grupo e do herói)", r.pvGrupoMax === 132 && r.pvHeroiMax > 0);
  t("`medir` sem opções usa o N e a família do retrato declarados na tabela",
    (() => { const x = medir("brando", { n: 3 }); return x.prefixo === AMOSTRA_DA_REGUA.familiaDoRetrato && x.combates === 3; })());
}

/* ============================================================
   9. A RÉGUA NÃO MORA EM src/ — e não pode passar a morar
   ============================================================
   Não há "ligação ao App" para provar aqui, e a AUSÊNCIA dela é que é a
   lei: `src/` é o motor — o que o jogador vive —, e instrumento de medida
   ao lado de regra de jogo é a mesma confusão que "conta se prova, tela se
   olha" existe para evitar. `teste-ligacao.mjs` (seção 1) exige que todo
   módulo de `src/` seja importado por outro módulo de `src/`; um simulador
   de balanceamento não pode ser importado por nada do jogo, então nascer em
   `src/` seria nascer vermelho. Este dente guarda a fronteira nos dois
   sentidos. */
sec("9. A RÉGUA NÃO MORA EM src/ — a fronteira, nos dois sentidos");
{
  const arqs = readdirSync("../src").filter((f) => /\.(js|jsx)$/.test(f));
  t("nenhum arquivo de src/ se chama regua-combate", !arqs.some((f) => /^regua-combate\./.test(f)));
  const importadores = arqs.filter((f) => readFileSync("../src/" + f, "utf8").includes("regua-combate"));
  t("e nada do jogo importa a régua — nem sequer a menciona", importadores.length === 0, importadores.join(", "));
  /* E O CAMINHO DE VOLTA EXISTE: a régua compõe os motores de produção, não
     uma cópia deles. Uma régua que duplicasse as fórmulas mediria um segundo
     combate, que diverge do primeiro na primeira versão que alguém esquecer
     de copiar. */
  const FONTE = readFileSync("regua-combate.mjs", "utf8");
  t("a régua importa o combate de verdade (compõe o motor, não copia as fórmulas)",
    FONTE.includes('from "../src/combate.js"') && FONTE.includes('from "../src/companheiros.js"') && FONTE.includes('from "../src/bestiario.js"'));
  t("e não escreve em src/ (não há uma linha de escrita de arquivo)", !/writeFileSync|appendFileSync/.test(FONTE));

  /* OS TREZE EXPORTS TÊM LEITOR, e o segundo leitor é esta suíte. "Export
     morto mente" vale fora de `src/` também: `teste-ligacao` só varre o
     motor, então a única catraca que a régua tem é esta linha. */
  const EXPORTADOS = [...FONTE.matchAll(/^export (?:function|const) ([A-Za-z_][A-Za-z0-9_]*)/gm)].map((m) => m[1]);
  const ESTA = readFileSync("teste-regua.mjs", "utf8");
  const semLeitor = EXPORTADOS.filter((nome) => !new RegExp("\\b" + nome + "\\b").test(ESTA));
  t(`os ${EXPORTADOS.length} exports da régua têm leitor nesta suíte — export morto mente`, EXPORTADOS.length === 13 && semLeitor.length === 0, semLeitor.join(", "));
}

console.log(`\n(medição: ${(CUSTO_DA_MEDIDA / 1000).toFixed(1)}s · suíte inteira: ${((Date.now() - T0 + 0) / 1000).toFixed(1)}s)`);
console.log(`\n${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
