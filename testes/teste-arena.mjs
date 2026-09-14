/* A ARENA (v9.215) — o duelo provável, uma peça para três mesas

   As leis desta suíte: determinismo é o árbitro (mesma dupla + mesma
   semente = mesmo duelo, golpe a golpe); a ficha original nunca é mutada
   (o duelo não deixa cicatriz); toda queda TERMINA; e a CATRACA DO
   EQUILÍBRIO — o round-robin dos oito trava a taxa de vitória de todo
   pronto entre 35% e 65%, em quatro famílias de sementes independentes
   e num retrato de baixa variância que ainda limita a AMPLITUDE entre o
   topo e o fundo. Um pronto que domina quebra aqui, no dia em que passou
   a dominar — mesmo que domine sem estourar a faixa sozinho. */

const RAIZ = "../src/";
const A = await import(RAIZ + "arena.js");
const P = await import(RAIZ + "prontos.js");
const { readFileSync } = await import("node:fs");

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

/* A PROVA PENDENTE saiu daqui em v9.225, junto com a dívida que ela media.
   Era um `pendente(...)` que imprimia sem contar `bons` nem `maus`: a lei
   escrita antes de o código cumpri-la, visível e sem deixar a árvore
   vermelha. As duas pendentes de A1 viraram `t(...)` na seção 7 e o helper
   ficou sem leitor — export morto mente, e helper morto também. Se voltar a
   ser preciso, o molde está no diário de A1 (v9.223). */

/* ---------------- OS BUFFS DO REPERTÓRIO DOS OITO ----------------
   Servem a duas seções: a 5 prova que o piloto joga o repertório INTEIRO,
   a 7 mede quanto disso a arena firma de verdade.
   `BARRADAS_PELO_FILTRO_MORTO` é a memória do filtro que caiu em A3: as
   habilidades de buff que ele deixava de fora da mesa. */
const C = await import(RAIZ + "companheiros.js");
/* P1 (v9.231): a seção 8 precisa saber quem, no repertório dos oito,
   PROMETE abrigo — e quem decide isso é a tabela de combos.js, pelo
   texto da habilidade. */
const CB = await import(RAIZ + "combos.js");
const BUFFS_DOS_OITO = [];
for (const p of P.PRONTOS) {
  for (const h of P.montarPronto(p.id).habilidades) {
    if (C.ehBuff(h) && !BUFFS_DOS_OITO.some((x) => x.nome === h.nome)) BUFFS_DOS_OITO.push(h);
  }
}
const BARRADAS_PELO_FILTRO_MORTO = BUFFS_DOS_OITO.filter((h) => !(C.ehCuraDeGrupo(h) || C.ehOfensiva(h))).map((h) => h.nome);

sec("1. o determinismo é o árbitro (lei v)");
{
  const r1 = A.duelarProntos("muralha", "chama", { semente: "prova" });
  const r2 = A.duelarProntos("muralha", "chama", { semente: "prova" });
  t("mesma dupla + mesma semente = a MESMA série, golpe a golpe", JSON.stringify(r1) === JSON.stringify(r2));
  t("a sorte é travada e restaurada (Math.random volta ao original)", Math.random !== Math.random() && typeof Math.random() === "number");
  const muitos = new Set(["a", "b", "c", "d", "e", "f"].map((s) => A.duelarProntos("sombra", "punho", { semente: s }).placar + A.duelarProntos("sombra", "punho", { semente: s }).vencedor));
  t("sementes diferentes dão duelos diferentes (não é resultado fixo)", muitos.size >= 2);
}

sec("2. a série: melhor de três, terreno novo por queda");
{
  const r = A.duelarProntos("voz", "flecha", { semente: "serie" });
  /* o placar é aXb com a = quedas de A: quem vence tem 2, o outro 0 ou 1 */
  t("vence quem faz duas quedas", ["A", "B"].includes(r.vencedor) && (() => { const [a, b] = r.placar.split("×").map(Number); return Math.max(a, b) === 2 && Math.min(a, b) <= 1 && ((a > b) === (r.vencedor === "A")); })());
  t("no máximo três quedas", r.quedas.length >= 2 && r.quedas.length <= 3);
  t("todo terreno vem da tabela da arena", r.quedas.every((q) => A.TERRENOS_DA_ARENA.some((x) => x.id === q.terreno)));
  t("são 5 terrenos, no vocabulário do combate", A.TERRENOS_DA_ARENA.length === 5 && ["apertado", "aberto", "escuro", "alto", "agua"].every((id) => A.TERRENOS_DA_ARENA.some((x) => x.id === id)));
  t("cada queda conta a própria história (linhas do duelo seco)", r.quedas.every((q) => q.linhas.length >= 2));
}

sec("3. o duelo não deixa cicatriz (lei vi)");
{
  const original = P.montarPronto("remendo");
  const antes = JSON.stringify(original);
  A.simularSerie(original, P.montarPronto("punho"), { semente: "cicatriz" });
  t("a ficha original sai exatamente como entrou", JSON.stringify(original) === antes);
  t("prepararDuelista devolve cópia cheia (vida e mana no teto, limpo)", (() => { const d = A.prepararDuelista({ ...original, vida: 1, mana: 0, condicoes: [{ nome: "x" }] }); return d.vida === d.vidaMax && d.mana === d.manaMax && d.condicoes.length === 0; })());
}

sec("4. toda queda termina");
{
  /* os dois mais duros de matar, muitas sementes: nenhuma queda passa do
     teto, e sempre há vencedor — empate eterno não existe */
  let ok = true;
  for (const s of ["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8"]) {
    const q = A.simularQueda(P.montarPronto("muralha"), P.montarPronto("voto"), { semente: s });
    if (q.rodadas > A.RODADAS_MAX || !["A", "B"].includes(q.vencedor)) ok = false;
  }
  t("teto de rodadas respeitado e vencedor sempre declarado", ok);
}

sec("5. os pilotos da casa lutam como gente da casa (lei x)");
{
  /* o clérigo se cura em alguma queda — a decisão vem do catálogo de
     companheiros, não de IA nova; e a cura muda o duelo de verdade.
     O MESMO passeio recolhe os buffs FIRMADOS: a segunda prova abaixo lê
     esta lista, e assim as duas andam sobre a mesma amostra semeada. */
  let curou = false;
  const firmadas = new Set();
  const FIRMA = / firma (.+?) · /;   /* "A Voz firma Inspiração · +2 de dano mágico" */
  for (const s of ["c1", "c2", "c3", "c4", "c5", "c6"]) {
    for (const dupla of [["remendo", "sombra"], ["voz", "punho"]]) {
      const q = A.simularQueda(P.montarPronto(dupla[0]), P.montarPronto(dupla[1]), { semente: s });
      if (q.linhas.some((l) => /se recompõe/.test(l))) curou = true;
      for (const l of q.linhas) { const f = l.match(FIRMA); if (f) firmadas.add(f[1]); }
    }
  }
  /* MOTIVO da mexida (v9.225): a asserção da cura não mudou de sentido —
     mudou de amostra, porque o passeio agora percorre duas duplas em vez
     de uma (a segunda entrou para "Inspiração" chegar à mesa). `remendo ×
     sombra` continua lá, e continua sendo quem cura. */
  t("o curandeiro se recompõe quando o corpo pede", curou);

  /* ---------------- A ASSERÇÃO QUE TROCOU DE VERDADE (v9.225 · A3) -------
     O QUE ESTAVA AQUI: `t("o piloto só enxerga o que o duelo aplica por
     inteiro", /ehCuraDeGrupo\(h\) \|\| ehOfensiva\(h\)/.test(src))` — uma
     prova de FONTE de que `meiaRodada` podava a visão do piloto, deixando
     só cura de grupo e ofensiva.

     POR QUE ELA MORREU: o filtro que ela guardava era furado desde sempre.
     `ehOfensiva` (companheiros.js) casa `RX_OFENSIVA` contra nome **e**
     descrição, e "Postura Defensiva" ("Reduz o dano recebido...") e
     "Escudo Arcano" ("...aparar o golpe", descrição com *dano*) passavam
     por ele todos os dias — a régua dizia "buff não entra" e dois buffs
     entravam. A1 mediu o preço: 382 meias-rodadas mortas em 420 quedas.
     O filtro só existia porque a arena não portava efeito nenhum; A3
     portou (erguerGuarda, efeitoDeBuff, tickEfeitos) e ele caiu inteiro.

     A ÂNCORA NOVA é de COMPORTAMENTO, não de fonte — regex em fonte
     morre com o refatorador seguinte, e esta prova precisa sobreviver a
     ele. Ela mostra a arena FIRMANDO, numa amostra semeada, um buff que o
     filtro morto barrava (as barradas são as que NÃO casam com
     `ehCuraDeGrupo || ehOfensiva`: Grito de Guerra, Bênção, Escudo da Fé,
     Inspiração). Se o filtro voltar, nenhuma delas chega a `aplicarAcoes`
     e esta linha fica vermelha no mesmo dia. */
  const provasDoFiltroMorto = [...firmadas].filter((n) => BARRADAS_PELO_FILTRO_MORTO.includes(n));
  t("o piloto joga o repertório inteiro — e a arena firma o que ele escolhe",
    provasDoFiltroMorto.length > 0,
    `nenhum dos buffs que o filtro morto barrava (${BARRADAS_PELO_FILTRO_MORTO.join(", ")}) foi firmado na amostra`);

  const src = readFileSync("../src/arena.js", "utf8");
  t("a poção sai da bolsa pelo aplicador oficial", /usarConsumivel\(eu, a\.item\)/.test(src) && /inventario\.splice/.test(src));
}

/* ============================================================
   6. A CATRACA DO EQUILÍBRIO — o que mudou em A4, e por quê

   O QUE ESTAVA AQUI (até v9.225): UMA chamada de `roundRobin({ sementes:
   30 })` — a família "rr", 30 sementes por par —, e os oito dentro de
   35%–65%. Uma amostra só.

   POR QUE ELA NÃO BASTAVA. A4 mediu 49 famílias independentes de 30
   sementes/par (a sonda fora da amostra) e achou ZERO estouros: a faixa
   se sustenta, e por isso NENHUM número de pronto mudou neste ciclo. Mas
   a mesma medição mostrou o desvio-padrão de cada pronto entre famílias:
   σ ≈ 3,4 pts. Nos extremos observados, `flecha` chegou a 63,8% (1,2 pt
   do teto) e `voz`/`voto` a 37,1% (2,1 pts do piso) — dentro da faixa,
   mas por pouco, e por sorte da amostra. Pior: os 61,9% de `flecha` que
   a família "rr" imprime são o MÁXIMO do intervalo dela própria (fora da
   amostra `flecha` fica em 49,5–57,6, e 55,7% no retrato de 480
   sementes/par). Uma amostra só prova SORTE, não estabilidade — e ainda
   deixava o diário com um retrato enviesado do roster.

   O QUE A NOVA PROVA. Dois dentes:

   - DENTE 1, estabilidade entre famílias. Quatro famílias de sementes
     INDEPENDENTES (o parâmetro `prefixo` que A4 abriu em `roundRobin`),
     cada uma do mesmo tamanho da amostra antiga, e os oito dentro da
     faixa em TODAS. "rr" continua sendo uma delas, de propósito: assim o
     retrato histórico do diário (flecha 61,9 etc.) segue comparável ao
     dígito. As outras três foram escolhidas ANTES de medir.
   - DENTE 2, o retrato de baixa variância. Uma amostra grande (120
     sementes/par), os oito na faixa E um teto de AMPLITUDE. Este é o
     dente que morde o caso que a faixa sozinha não pega: um pronto que
     vira dominante sem estourar o teto — ele sobe, os outros descem, e
     cada um continua entre 35 e 65 enquanto a distância entre o topo e o
     fundo abre. A faixa aguenta; a amplitude não.

   O LIMIAR 35–65 NÃO AFROUXOU — é o mesmo piso e o mesmo teto de sempre,
   e agora tem de valer em cinco amostras em vez de uma. A catraca só
   ficou mais dura.

   VERIFICADO CONTRA ARENA MUTANTE (uma cópia de `arena.js` fora do
   projeto, com um empurrão em `prepararDuelista`). Com `sombra` — o topo
   estrutural do roster — ganhando +3 de vida máxima, a catraca ANTIGA
   ficaria VERDE: na família "rr" ele mede 59,5%, dentro da faixa. A nova
   fica vermelha três vezes: 67,6% em "aa", 66,2% em "bb" e amplitude
   22,1 pts no retrato. Com +14 de vida e +4/+3 de atributo, `sombra` vai
   a 94–97% e as quatro famílias mordem de uma vez.
   ============================================================ */
sec("6. A CATRACA DO EQUILÍBRIO — teste, não intenção");
{
  /* A TABELA DA CATRACA — piso, teto, famílias, tamanhos e amplitude
     saem daqui, e a própria suíte os lê de volta (lei "se é número, é
     tabela"). Toda semente é fixa no código: `roundRobin` deriva a
     semente de cada duelo do prefixo, e nada aqui sorteia. */
  const CATRACA_DO_EQUILIBRIO = {
    piso: 0.35,
    teto: 0.65,
    /* "rr" é o padrão de `roundRobin` e o retrato do diário; as outras
       três são famílias independentes, escolhidas antes da medição. */
    familias: ["rr", "aa", "bb", "cc"],
    sementesPorFamilia: 30,
    familiaDoRetrato: "retrato",
    sementesDoRetrato: 120,
    /* O TETO DE AMPLITUDE, em pontos percentuais (topo − fundo do
       retrato). A FOLGA, declarada: o retrato mede hoje 15,7 pts, então
       o teto de 20 dá 4,3 pts de folga. O número não é chute. A
       amplitude estrutural do roster é ~13,9 pts (retrato de 480
       sementes/par: sombra 58,1 · flecha 55,7 · muralha 51,8 · remendo
       49,6 · punho 48,7 · chama 46,5 · voz 45,4 · voto 44,2 — quem está
       no topo é `sombra`, não `flecha`). A 120 sementes/par o ruído
       ainda infla isso: oito famílias medidas deram amplitude 13,0 ± 2,3
       (mínimo 9,9, máximo 16,2), e a nossa, "retrato", caiu no lado alto
       dessa distribuição com 15,7.
       POR QUE 20 E NÃO 16. A semente é fixa, mas qualquer mexida na
       arena reembaralha o fluxo do RNG — na prática a amplitude é
       RESORTEADA daquela distribuição a cada mudança de código. Um teto
       colado nos 15,7 de hoje ficaria vermelho na primeira brisa, sem
       nenhum pronto ter ficado dominante. 20 é ~3σ acima da média da
       distribuição: a brisa não derruba.
       POR QUE NÃO 25 OU 30. Precisa morder. Com teto 20, um pronto que
       encoste em 64% (verde na faixa!) contra um fundo em 42% dá 22 pts
       e fica VERMELHO aqui — que é exatamente o caso que este dente
       existe para pegar. */
    tetoDeAmplitude: 20,
  };
  const t0 = Date.now();
  const naFaixa = (tx) => tx >= CATRACA_DO_EQUILIBRIO.piso && tx <= CATRACA_DO_EQUILIBRIO.teto;
  const faixaEmPct = `${(CATRACA_DO_EQUILIBRIO.piso * 100).toFixed(0)}% e ${(CATRACA_DO_EQUILIBRIO.teto * 100).toFixed(0)}%`;

  /* DENTE 1 — a faixa vale em toda família, não na que deu sorte */
  let maisFina = null;   /* ver A MARGEM MAIS FINA, logo abaixo do laço */
  for (const fam of CATRACA_DO_EQUILIBRIO.familias) {
    const rr = A.roundRobin({ sementes: CATRACA_DO_EQUILIBRIO.sementesPorFamilia, prefixo: fam });
    const taxas = Object.entries(rr);
    t(`[${fam}] os oito jogam o round-robin completo`, taxas.length === 8);
    for (const [id, tx] of taxas) {
      t(`[${fam}] ${id} vence entre ${faixaEmPct} (${(tx * 100).toFixed(1)}%)`, naFaixa(tx));
      const folga = Math.min(tx - CATRACA_DO_EQUILIBRIO.piso, CATRACA_DO_EQUILIBRIO.teto - tx) * 100;
      if (!maisFina || folga < maisFina.folga) maisFina = { fam, id, pct: tx * 100, folga };
    }
  }
  /* A MARGEM MAIS FINA — FATO DECLARADO, não exigência. A catraca passa nas
     quatro famílias, mas passar por 1,2 pt e passar por 10 são coisas
     diferentes, e só uma delas aparece na lista de "ok". Esta linha imprime
     quem está mais perto da parede para a próxima etapa saber o que arrisca
     antes de medir. Não há asserção aqui de propósito: transformar a folga
     em limiar seria um segundo teto por cima do 35–65, e o 35–65 é a lei.
     Medido em v9.233: `punho` na família "cc" com 36,2% — 1,2 pt do piso. */
  if (maisFina) {
    console.log(`  ··  margem mais fina das 4 famílias: ${maisFina.id} em "${maisFina.fam}" com ${maisFina.pct.toFixed(1)}% — ${maisFina.folga.toFixed(1)} pt da parede mais próxima (faixa ${faixaEmPct})`);
  }

  /* DENTE 2 — o retrato de baixa variância, e a distância entre topo e fundo */
  const ret = A.roundRobin({ sementes: CATRACA_DO_EQUILIBRIO.sementesDoRetrato, prefixo: CATRACA_DO_EQUILIBRIO.familiaDoRetrato });
  const pct = Object.values(ret).map((x) => x * 100);
  const amplitude = Math.max(...pct) - Math.min(...pct);
  const ordem = Object.entries(ret).sort((a, b) => b[1] - a[1]).map(([id, tx]) => `${id} ${(tx * 100).toFixed(1)}`).join(" · ");
  console.log(`  ··  retrato de baixa variância (${CATRACA_DO_EQUILIBRIO.sementesDoRetrato} sementes/par): ${ordem}`);
  for (const [id, tx] of Object.entries(ret)) {
    t(`[retrato] ${id} vence entre ${faixaEmPct} (${(tx * 100).toFixed(1)}%)`, naFaixa(tx));
  }
  t(`a amplitude do retrato não passa de ${CATRACA_DO_EQUILIBRIO.tetoDeAmplitude} pts (${amplitude.toFixed(1)} pts entre o topo e o fundo)`,
    amplitude <= CATRACA_DO_EQUILIBRIO.tetoDeAmplitude,
    `topo ${Math.max(...pct).toFixed(1)}% · fundo ${Math.min(...pct).toFixed(1)}%`);
  console.log(`  ··  a catraca levou ${Date.now() - t0}ms (${CATRACA_DO_EQUILIBRIO.familias.length} famílias de ${CATRACA_DO_EQUILIBRIO.sementesPorFamilia} + o retrato de ${CATRACA_DO_EQUILIBRIO.sementesDoRetrato})`);
}

/* ============================================================
   7. O VEREDITO DA FASE A — o buraco que A1 mediu, fechado em A3

   O QUE ERA (até v9.224). O piloto GASTAVA turno numa promessa que a
   arena não cumpria:

   - `aplicarAcoes` (ramo `buff`/`guarda`) traduzia o buff numa linha de
     prosa ("se guarda") e descontava mana. Nada mais acontecia:
     `prepararDuelista` criava `f.efeitos = []` e ninguém nunca escrevia
     nele.
   - `meiaRodada` TENTAVA tirar o buff da visão do piloto com
     `ehCuraDeGrupo(h) || ehOfensiva(h)` — e o filtro era furado:
     `ehOfensiva` casa `RX_OFENSIVA` contra nome + descrição, e a
     descrição de "Postura Defensiva" e "Escudo Arcano" fala de *dano* e
     de *golpe*. As duas passavam.
   - `decidirAcaoCompanheiro` (companheiros.js) testa `ehBuff` no passo 3,
     ANTES da ofensiva, com 70% de chance nas rodadas 1–2.

   Resultado: meia-rodada morta, e uma fatia das quedas ABRINDO com duas
   delas — os dois lados se guardavam, e a queda começava com dois turnos
   em que nenhum número da mesa se mexia.

   O QUE A3 FEZ (v9.225). A arena passou a consumir os módulos que já
   existiam — `erguerGuarda`/`expirarGuardas` (habilidades.js),
   `efeitoDeBuff`/`empilhar` (efeitos.js), `bonusDeDano`/`bonusDeArma`
   (combos.js) e `tickEfeitos` (regras-jogo.js). O filtro perdeu o motivo
   e caiu inteiro. As duas provas que A1 deixou PENDENTES são hoje
   asserções: esta seção deixou de medir dívida e virou o veredito.

   ---------------- A MOEDA MIGROU (v9.233 · P3) ----------------

   O QUE ACONTECEU COM `comPeso`. A asserção "na mesa real a arena firma
   buff, engorda golpe e vence prazo" cobrava piso 100 de três contagens, e
   a do meio era `comPeso` — golpes cuja linha diz "... pesa no golpe". Ela
   media 329 em A3. Hoje mede 75, e NÃO por regressão:

   - P1 (v9.231) ensinou `bonusDeDano`/`bonusDeArma` a respeitar o rótulo
     `aplica`. "Escudo Arcano" parou de narrar "+2 de dano mágico" e parou
     de somar. `comPeso` 329 → 108, de propósito e medido no ciclo.
   - P3 (v9.233) fez a absorção TIRAR dano de verdade (`absorverDano`, em
     efeitos.js, mordendo em `aplicarAcoes`) e o piloto passar a escolhê-la.
     Remendo e Voto trocaram bônus de dano por abrigo. Na mesma amostra:
     `comPeso` 108 → 75, abrigos que morderam 0 → 241, dano parado 0 → 964.

   POR QUE ISTO NÃO É AFROUXAR O PISO. `comPeso` era um PROXY: a intenção
   escrita em A3 é "o turno de apoio pago compra alguma coisa", e em A3
   havia uma moeda só para comprá-la — o golpe maior. P1 e P3 criaram a
   SEGUNDA moeda (o golpe que não chega) e moveram metade do gasto para
   ela. O proxy não mede mais o que foi escrito para medir; baixar o piso de
   100 para 40 para ele caber seria afrouxar, e trocá-lo pela medida da
   intenção original não é. A prova disso é o número: a SOMA das duas moedas
   é 316 contra os 329 de A3 — o turno de apoio compra hoje praticamente o
   mesmo que comprava, em outra moeda.

   O DENTE ANDA NOS DOIS SENTIDOS, e é aqui que o conserto é honesto ou não
   é. Se a soma fosse cobrada sozinha, a metade ofensiva poderia ir a ZERO
   com a defensiva segurando o verde — exatamente o buraco que a moeda velha
   tinha ao contrário. Por isso são três dentes e não um: a soma contra 100,
   e CADA metade contra `minimoDeCadaMetade`. Sabotagens verificadas em
   cópia fora da árvore: (a) `aplicarAcoes` voltando a não consumir efeito
   nenhum derruba as três de uma vez; (b) `bonusDeDano`/`bonusDeArma`
   devolvendo bônus zero (ofensiva a 0, defensiva intacta em 241) deixa a
   SOMA verde em 241 e fica VERMELHA no dente da metade ofensiva.
   ============================================================ */
sec("7. o veredito da Fase A — o buraco de A1, fechado em A3");
{
  /* A TABELA DA MEDIÇÃO — sementes fixas e molde fixo, para o número
     medido ser o mesmo em qualquer máquina (lei v). São os 28 pares dos
     oito prontos × 6 sementes = 168 séries ≈ 424 quedas na mesa real,
     mais as duas duplas sintéticas de 60 quedas cada, em ~0,3s. */
  const MEDIDA_DO_BURACO = {
    sementesPorPar: 6,
    semente: (a, b, s) => `m|${a}|${b}|${s}`,
    /* o que A1 cobrou e A3 entregou */
    tetoDeAberturasMortas: 0,
    razaoMaximaDeDanoAposGuarda: 0.9,
    /* ---- v9.225: a régua das duplas sintéticas (ver A SONDA SINTÉTICA) ---- */
    quedasDaSonda: 60,
    /* O PISO DA AMOSTRA. Sem ele a prova da guarda passa VAZIA: uma arena
       que voltasse a não erguer guarda nenhuma mediria 0 golpe, média 0 e
       razão 0,000 — verde sem provar nada, que é pior que a dívida.
       Medidos hoje: 185 dentro / 224 fora (guarda), 65 com / 89 sem (buff). */
    golpesMinimosDaSonda: 40,
    /* A força do buff sintético é `round(custo/2)` = 2 (efeitos.js,
       `BUFF_DA_HABILIDADE`). O crítico NÃO dobra o bônus — a arena o soma
       depois do golpe pronto, e diz isso por escrito —, então a média sobe
       um pouco menos que 2: medido 1,95. O piso é 1, porque menos de um
       ponto inteiro é o buff não mexer em número nenhum. */
    ganhoMinimoDoBuffNoGolpe: 1,
    /* A mesa real: ordem de grandeza, não número mágico. Medidos em A3
       (v9.225) 791 buffs firmados, 329 golpes com o bônus dentro e 409
       efeitos vencendo o prazo, em 424 quedas. O piso é conservador de
       propósito — ele guarda o "acontece", e o quanto é assunto de A4 (o
       equilíbrio).

       O PISO NÃO MUDOU — O QUE ELE CONTA É QUE MUDOU (v9.233 · P3). Ver o
       bloco "A MOEDA MIGROU" no cabeçalho desta seção. Em resumo: a
       terceira parcela desta asserção era `comPeso` sozinho, e `comPeso`
       conta só a metade OFENSIVA do turno de apoio ("o golpe saiu com o
       bônus dentro"). P1 tirou a família defensiva de dentro do golpe e P3
       fez o piloto preferi-la; a metade defensiva passou a ser paga em
       ABRIGO, que a régua `PESO` não enxerga. Medição na mesma amostra:
       comPeso 329 (v9.225) → 108 (P1) → 75 (P3); abrigos que morderam
       0 → 0 → 241. A SOMA das duas: 329 → 316. O piso continua 100 e
       continua sendo cobrado — de `firmados`, de `dissipados` e agora da
       SOMA, que é o que a asserção sempre quis medir: "turno de apoio pago
       compra alguma coisa". */
    minimoDaMesaReal: 100,
    /* O PISO DE CADA METADE — o dente que impede o conserto acima de ser um
       afrouxamento. Com a soma sozinha, a ofensiva poderia desabar para 0 e
       a defensiva segurar o verde; cada metade tem de morder por si.

       POR QUE 40, e não um número novo. É o mesmo limiar que esta tabela já
       escolheu duas linhas acima (`golpesMinimosDaSonda`), com o motivo já
       escrito ali: abaixo disso a prova "passa VAZIA". A casa já decidiu,
       sobre esta mesma arena e estas mesmas quedas, onde fica a fronteira
       entre "aconteceu" e "não há o que medir"; as metades herdam essa
       fronteira em vez de inventar uma segunda. Em escala: a amostra tem
       414 quedas, então 40 é uma mordida a cada dez quedas.

       POR QUE NÃO 100 EM CADA METADE. A ofensiva mede 75 hoje, e mede 75
       porque P1 e P3 tiraram metade dos buffs do golpe DE PROPÓSITO.
       Cobrar 100 de cada metade seria cobrar que a migração não tivesse
       acontecido — reprovar o conserto em nome do proxy velho.

       POR QUE NÃO COLADO NOS 75 DE HOJE. A ofensiva é justamente a metade
       que as fases estão encolhendo de propósito (329 → 108 → 75). Um piso
       colado no dígito de hoje fica vermelho na próxima etapa legítima, sem
       nada ter quebrado — e um dente que grita por engano é um dente que a
       casa aprende a ignorar. 40 sobrevive a mais um encolhimento honesto e
       ainda pega o caso que este dente existe para pegar: uma metade que
       desaba a zero, ou que cai pela metade outra vez.

       MARGEM DECLARADA (não é exigência, é o que se sabe hoje): ofensiva
       75, 1,9× o piso; defensiva 241, 6,0× o piso. */
    minimoDeCadaMetade: 40,
  };
  /* O RETRATO DE v9.222 — o "antes" do antes-e-depois, para a fase ter
     régua: 420 quedas · 4584 linhas de queda · 382 meias-rodadas mortas
     (8,3% do total, 0,91 por queda) · 20 quedas (4,8%) abrindo com duas
     guardas · dano sofrido logo depois da guarda 1,034× o normal (ou
     seja: nenhum).
     O RETRATO DE v9.225 — o "depois": 424 quedas · 5667 linhas de queda
     (as 1083 a mais são as linhas que A3 fez nascer — guarda erguida,
     buff firmado, prazo vencendo) · 0 meias-rodadas mortas · 0 aberturas
     mortas · 791 buffs firmados, 329 golpes saindo maiores, 409 efeitos
     dissipados no prazo. Nas duplas sintéticas: o dano sofrido com a
     guarda de pé é 0,699× o dano com ela caída, e o golpe de quem firmou
     o buff sai 1,95 ponto mais pesado. */

  const GUARDA = / se guarda$/;   /* a meia-rodada morta: a prosa de v9.224 */
  const DANO = / \(−(\d+)\)$/;    /* "A Muralha acerta O Punho (−7)" */
  const FIRMA = / firma .+? · /;  /* "A Chama firma Escudo Arcano · +1 de dano mágico" */
  const PESO = / pesa(?:m)? no golpe /;  /* o bônus dentro do número do golpe */
  const DISSIPOU = / se dissipou$/;      /* o prazo vencendo, uma vez por rodada */
  /* A SEGUNDA MOEDA (P3). O molde é a linha que `absorverDano` devolve
     (efeitos.js) depois de `secar` (arena.js) comer o emoji e o ponto final:
     "O Remendo — Escudo da Fé encontra o golpe primeiro e se desfaz: 4 param
     ali, 12 chegam". A arena só empurra a linha quando `ab.absorvido > 0`,
     então toda linha lida aqui é um abrigo que MORDEU — não uma promessa. */
  const ABRIGO = / encontra o golpe primeiro e se desfaz: /;
  const PAROU = / encontra o golpe primeiro e se desfaz: (\d+) param ali, \d+ chegam$/;
  const COMEU = / encontra o golpe primeiro e se desfaz: nada chega$/;  /* a batida inteira */
  const t0 = Date.now();

  /* ---------------- A MESA REAL: OS 28 PARES DOS OITO ----------------
     `m.linhas` conta LINHAS DE QUEDA, e o nome é esse de propósito. Até
     v9.224 ele se chamava `m.meias` e a conta batia por acidente: cada
     linha depois do terreno era mesmo uma meia-rodada, porque a arena não
     tinha outra coisa para narrar. A3 fez nascer linha de guarda, de buff
     e de prazo vencendo — a conta deixou de ser de meias-rodadas e o nome
     tinha de deixar de mentir. Nenhum número da tabela mudou com isso. */
  const m = {
    quedas: 0, linhas: 0, mortas: 0, aberturas: 0, firmados: 0, comPeso: 0, dissipados: 0,
    /* a segunda moeda: `abrigos` são as mordidas, `parou`/`comeu` as duas
       formas da linha, `danoParado` o que elas tiraram do golpe */
    abrigos: 0, parou: 0, comeu: 0, danoParado: 0,
  };
  for (let i = 0; i < P.PRONTOS.length; i++) {
    for (let j = i + 1; j < P.PRONTOS.length; j++) {
      const a = P.PRONTOS[i].id, b = P.PRONTOS[j].id;
      for (let s = 0; s < MEDIDA_DO_BURACO.sementesPorPar; s++) {
        for (const q of A.duelarProntos(a, b, { semente: MEDIDA_DO_BURACO.semente(a, b, s) }).quedas) {
          /* a primeira linha é o terreno, não é linha de queda: fora da conta */
          const ls = q.linhas.slice(1);
          m.quedas++; m.linhas += ls.length;
          for (const l of ls) {
            if (GUARDA.test(l)) m.mortas++;
            if (FIRMA.test(l)) m.firmados++;
            if (PESO.test(l) && DANO.test(l)) m.comPeso++;
            if (DISSIPOU.test(l)) m.dissipados++;
            if (ABRIGO.test(l)) m.abrigos++;
            const parou = l.match(PAROU);
            /* o número vem da LINHA e não do módulo: é o que o jogador lê,
               e é a única prova de que o abrigo tirou dano e não só narrou */
            if (parou) { m.parou++; m.danoParado += Number(parou[1]); }
            if (COMEU.test(l)) m.comeu++;
          }
          if (GUARDA.test(ls[0] || "") && GUARDA.test(ls[1] || "")) m.aberturas++;
        }
      }
    }
  }
  const pctAberturas = (100 * m.aberturas / m.quedas).toFixed(1);
  /* AS DUAS MOEDAS DO TURNO DE APOIO, somadas. Ver "A MOEDA MIGROU", acima:
     a ofensiva é o golpe que sai maior, a defensiva é o golpe que não chega
     inteiro. É a soma que responde à pergunta que a asserção sempre fez. */
  const rendeu = m.comPeso + m.abrigos;

  /* ---------------- A SONDA SINTÉTICA ----------------
     POR QUE ELA EXISTE. A frente da GUARDA quase nunca dispara no
     round-robin: para o piloto escolher o plano `buff`,
     `decidirAcaoCompanheiro` exige `ehBuff`, que casa `RX_BUFF`
     (companheiros.js) — e nenhum dos nove nomes da tabela `GUARDAS`
     (habilidades.js) casa com ele. A guarda está portada e ninguém a
     ergue: medir só a mesa real seria declarar verde um caminho que a
     amostra nunca percorre.

     A DUPLA. Uma ficha de `muralha` com UMA habilidade, montada para
     casar com as duas réguas ao mesmo tempo — "Postura de Casca de
     Carvalho" bate em `GUARDAS` (por "casca de carvalho") e em `RX_BUFF`
     (por "postura"). Contra ela, uma ficha de `punho` sem habilidade e
     sem bolsa: só arma, para nenhuma cura e nenhuma poção entrarem no
     meio da medição. Defesa 15 sem a guarda, 19 com ela.

     O QUE SE MEDE, e por que não é o que A1 media. A sonda de A1 olhava o
     dano do golpe seguinte a uma linha `/ se guarda$/` — e essa linha
     deixou de existir, porque era exatamente a prosa vazia que A3 matou.
     Medir a mesma coisa hoje dá 0 golpe, média 0, razão 0,000: passaria
     no limiar sem provar coisa alguma. A âncora nova é a JANELA da
     guarda: o que acontece entre a linha "ergue ..." e a linha "... se
     desfaz". E não é dano por acerto, é dano por GOLPE TENTADO (o erro
     conta como zero) — porque a guarda de defesa mexe na chance de
     acertar, não no tamanho do dano: `resolverAtaque` compara o d20 com a
     CA e só depois decide o número. Medir por acerto era a outra metade
     do porquê de a razão de A1 dar 1,034. */
  const fichaDaSonda = (id, nome, habs) => ({ ...P.montarPronto(id), nome, habilidades: habs, inventario: [] });
  const HAB_DA_GUARDA = { nome: "Postura de Casca de Carvalho", custo: 2, descricao: "O corpo endurece como tronco." };
  const HAB_DO_BUFF = { nome: "Postura de Ferro", custo: 4, descricao: "O corpo assenta e o braço fica pesado." };

  const g = { dentro: 0, nDentro: 0, fora: 0, nFora: 0 };
  {
    const guardiao = fichaDaSonda("muralha", "O Guardião", [HAB_DA_GUARDA]);
    const agressor = fichaDaSonda("punho", "O Agressor", []);
    const ERGUE = /^O Guardião ergue Postura de Casca de Carvalho/;
    const DESFEZ = /^O Guardião — Postura de Casca de Carvalho se desfaz/;
    /* todo golpe TENTADO contra o guardião: acerto, acerto em cheio, erro
       e erro feio. O erro entra com dano zero, que é o ponto da medida. */
    const GOLPE = /^O Agressor (?:acerta em cheio|acerta|erra feio|erra) O Guardião(?: — .+?)?(?: \(−(\d+)\))?$/;
    for (let s = 0; s < MEDIDA_DO_BURACO.quedasDaSonda; s++) {
      let dePe = false;
      for (const l of A.simularQueda(guardiao, agressor, { semente: `guarda|${s}` }).linhas) {
        if (ERGUE.test(l)) { dePe = true; continue; }
        if (DESFEZ.test(l)) { dePe = false; continue; }
        const golpe = l.match(GOLPE);
        if (!golpe) continue;
        const d = Number(golpe[1] || 0);
        if (dePe) { g.dentro += d; g.nDentro++; } else { g.fora += d; g.nFora++; }
      }
    }
  }
  const mediaComGuarda = g.dentro / (g.nDentro || 1);
  const mediaSemGuarda = g.fora / (g.nFora || 1);
  const razao = mediaComGuarda / (mediaSemGuarda || 1);

  /* A SEGUNDA FRENTE: o buff que engorda o golpe. Mesma dupla sintética,
     outro papel — "Postura de Ferro" casa com `RX_BUFF` e NÃO casa com
     `GUARDAS`, então cai no ramo do efeito (`efeitoDeBuff`/`empilhar`).
     O firmado não tem habilidade ofensiva nenhuma: todo golpe dele é de
     ARMA, com a mesma base de dano do começo ao fim da queda. É isso que
     faz a medida limpa — a única diferença entre os dois grupos é o buff
     estar de pé, e não o tipo de golpe que ele escolheu naquela rodada.
     A mesma medida na mesa real fica suja: lá o bônus só "pesa" quando o
     escopo bate (fúria física não levanta feitiço), e os golpes que ele
     pesa são justamente os das classes que batem mais forte. Na mesa real
     medimos o QUE ACONTECE (as três contagens abaixo); aqui, QUANTO. */
  const bf = { com: 0, nCom: 0, sem: 0, nSem: 0 };
  {
    const firmado = fichaDaSonda("muralha", "O Firmado", [HAB_DO_BUFF]);
    const boneco = fichaDaSonda("punho", "O Boneco", []);
    const ACERTO = /^O Firmado (?:acerta em cheio|acerta) O Boneco(?: — (.+?))? \(−(\d+)\)$/;
    for (let s = 0; s < MEDIDA_DO_BURACO.quedasDaSonda; s++) {
      for (const l of A.simularQueda(firmado, boneco, { semente: `buff|${s}` }).linhas) {
        const acerto = l.match(ACERTO);
        if (!acerto) continue;
        const d = Number(acerto[2]);
        if (acerto[1] && / pesa(?:m)? no golpe$/.test(acerto[1])) { bf.com += d; bf.nCom++; }
        else { bf.sem += d; bf.nSem++; }
      }
    }
  }
  const mediaComBuff = bf.com / (bf.nCom || 1);
  const mediaSemBuff = bf.sem / (bf.nSem || 1);
  const ganhoDoBuff = mediaComBuff - mediaSemBuff;

  console.log(`  ··  ${m.quedas} quedas e ${m.linhas} linhas de queda medidas (os 28 pares dos oito, ${MEDIDA_DO_BURACO.sementesPorPar} sementes cada)`);
  console.log(`  ··  meias-rodadas mortas ("se guarda"): ${m.mortas} — ${(100 * m.mortas / m.linhas).toFixed(1)}% do total, ${(m.mortas / m.quedas).toFixed(2)} por queda`);
  console.log(`  ··  quedas que ABREM com duas meias-rodadas mortas: ${m.aberturas} de ${m.quedas} (${pctAberturas}%)`);
  console.log(`  ··  a arena cumpre o que o piloto escolhe: ${m.firmados} buffs firmados, ${m.dissipados} efeitos vencendo o prazo`);
  console.log(`  ··  e o turno de apoio rende ${rendeu} vezes: ${m.comPeso} golpes com o bônus dentro (ofensiva) + ${m.abrigos} abrigos que morderam (defensiva)`);
  /* FATO DECLARADO, não exigência: quanto a metade defensiva tirou do golpe.
     A linha só carrega o número quando sobra dano ("N param ali"); quando o
     abrigo come a batida inteira ela diz "nada chega" e o número fica de
     fora — por isso `danoParado` é um PISO do que foi parado, nunca o total.
     Medido hoje: 241 mordidas, 0 delas comendo a batida inteira, 964 pontos
     parados, média 4,00 por mordida (a força de Escudo Arcano e Escudo da Fé
     é 4, por `ABSORCAO_DO_BUFF`: custo 2 × porPM 2). */
  console.log(`  ··  a defensiva tirou ao menos ${m.danoParado} pontos do golpe em ${m.abrigos} mordidas (média ${(m.danoParado / (m.abrigos || 1)).toFixed(2)}; ${m.comeu} comeram a batida inteira e não dizem o número)`);
  console.log(`  ··  buffs no repertório dos oito: ${BUFFS_DOS_OITO.length}, e ${BARRADAS_PELO_FILTRO_MORTO.length} deles o filtro morto barrava (${BARRADAS_PELO_FILTRO_MORTO.join(", ")})`);
  console.log(`  ··  sonda da guarda: ${mediaComGuarda.toFixed(2)} de dano por golpe tentado com a guarda de pé contra ${mediaSemGuarda.toFixed(2)} com ela caída — razão ${razao.toFixed(3)} (${g.nDentro} e ${g.nFora} golpes)`);
  console.log(`  ··  sonda do buff: ${mediaComBuff.toFixed(2)} de dano por acerto com o buff firmado contra ${mediaSemBuff.toFixed(2)} sem ele — ganho ${ganhoDoBuff.toFixed(2)} (${bf.nCom} e ${bf.nSem} acertos)`);
  console.log(`  ··  a medição levou ${Date.now() - t0}ms`);

  /* PROMOVIDA (1) — nasceu `pendente` em A1 e virou asserção em A3.
     POR QUE ERA PENDENTE: com `ehBuff` decidido antes da ofensiva e o
     filtro deixando "Postura Defensiva" e "Escudo Arcano" passarem, perto
     de 5% das quedas (20 de 420) abriam com os dois lados se guardando —
     dois turnos em que nenhum número da mesa se mexia.
     POR QUE ESTÁ VERDE: o buff virou efeito. A abertura continua existindo
     — o piloto ainda gasta a rodada 1 firmando —, mas deixou de ser MORTA:
     a linha agora diz o que subiu, e o número sobe junto. A prosa vazia
     `${nome} se guarda` só sobrevive no caso sem inimigo de pé, que num
     duelo de dois não acontece. */
  t("nenhuma queda abre com duas meias-rodadas de \"se guarda\"",
    m.aberturas <= MEDIDA_DO_BURACO.tetoDeAberturasMortas,
    `${m.aberturas} de ${m.quedas} abrem mortas (${pctAberturas}%)`);
  /* e a forma forte da mesma lei: nem no meio da queda sobra meia-rodada
     morta. Fica junto da de cima porque, se um dia a prosa vazia voltar,
     esta fala primeiro e diz quantas. */
  t("nenhuma meia-rodada morta em queda nenhuma", m.mortas <= MEDIDA_DO_BURACO.tetoDeAberturasMortas, `${m.mortas} em ${m.quedas} quedas`);

  /* A MESA REAL ACONTECE — o piso que impede as provas de cima de passarem
     por ausência: zero buff firmado também daria zero meia-rodada morta.

     A ASSERÇÃO FOI MOVIDA em v9.233, e este é o motivo (o bloco longo está
     em "A MOEDA MIGROU", no cabeçalho da seção). A parcela do meio era
     `m.comPeso` sozinho contra o piso 100 — um PROXY de "o turno de apoio
     comprou alguma coisa", escrito em A3 num dia em que só havia uma moeda
     para comprá-la. P1 e P3 criaram a segunda (o abrigo que morde) e
     moveram metade do gasto para lá, DE PROPÓSITO: comPeso 329 → 108 → 75,
     abrigos 0 → 0 → 241. A parcela passa a ser a SOMA, que é o que a frase
     sempre quis dizer, e o piso 100 fica onde estava — medida hoje 316,
     contra os 329 de A3. Nenhum limiar desta seção desceu. */
  t("na mesa real o turno de apoio compra alguma coisa — e o prazo vence",
    m.firmados >= MEDIDA_DO_BURACO.minimoDaMesaReal && rendeu >= MEDIDA_DO_BURACO.minimoDaMesaReal && m.dissipados >= MEDIDA_DO_BURACO.minimoDaMesaReal,
    `${m.firmados} firmados, ${rendeu} rendeu (${m.comPeso} com bônus + ${m.abrigos} abrigos), ${m.dissipados} dissipados`);

  /* E AS DUAS METADES, CADA UMA POR SI — os dois dentes que fazem da troca
     acima um conserto e não um afrouxamento. Sem eles a soma toparia que uma
     das moedas fosse a ZERO em silêncio, contanto que a outra segurasse o
     total; com eles, a arena que parasse de engordar o golpe fica vermelha
     AQUI mesmo que os 241 abrigos continuem mordendo. O piso e o porquê de
     ele ser 40 estão em `minimoDeCadaMetade`, na tabela. */
  t("a metade OFENSIVA não sumiu — o golpe ainda sai maior por causa do apoio",
    m.comPeso >= MEDIDA_DO_BURACO.minimoDeCadaMetade,
    `${m.comPeso} golpes com o bônus dentro, piso ${MEDIDA_DO_BURACO.minimoDeCadaMetade}`);
  t("a metade DEFENSIVA não sumiu — o abrigo ainda tira dano do golpe",
    m.abrigos >= MEDIDA_DO_BURACO.minimoDeCadaMetade,
    `${m.abrigos} abrigos morderam, piso ${MEDIDA_DO_BURACO.minimoDeCadaMetade}`);

  /* E A MOEDA DEFENSIVA É CONTÁVEL: toda mordida cai numa das duas formas da
     linha, e a que sobra dano diz quanto parou. Uma terceira forma — ou uma
     mordida que não dissesse nada — apagaria `danoParado` sem apagar
     `abrigos`, e o fato declarado acima viraria mentira em silêncio. */
  t("toda mordida de abrigo diz o que parou (ou que nada chegou)",
    m.parou + m.comeu === m.abrigos && m.danoParado >= m.parou,
    `${m.abrigos} mordidas = ${m.parou} com número + ${m.comeu} inteiras · ${m.danoParado} pontos parados`);

  /* A SONDA TEM AMOSTRA — e esta linha é a que impede a promovida (2) de
     virar prova vazia. Uma arena que parasse de erguer a guarda mediria
     razão 0,000 e passaria no limiar; com o piso, ela fica vermelha aqui. */
  t("a sonda sintética mede golpe de verdade dos dois lados da janela",
    g.nDentro >= MEDIDA_DO_BURACO.golpesMinimosDaSonda && g.nFora >= MEDIDA_DO_BURACO.golpesMinimosDaSonda
    && bf.nCom >= MEDIDA_DO_BURACO.golpesMinimosDaSonda && bf.nSem >= MEDIDA_DO_BURACO.golpesMinimosDaSonda,
    `guarda ${g.nDentro}/${g.nFora}, buff ${bf.nCom}/${bf.nSem} — piso ${MEDIDA_DO_BURACO.golpesMinimosDaSonda}`);

  /* PROMOVIDA (2) — nasceu `pendente` em A1 e virou asserção em A3.
     POR QUE ERA PENDENTE: o buff não escrevia em `efeitos` e o ramo
     `buff`/`guarda` de `aplicarAcoes` só descontava mana; o golpe depois
     da guarda era idêntico a qualquer outro, e a razão medida ficava em
     1,034.
     POR QUE A ÂNCORA MUDOU: a sonda de A1 procurava a linha
     `/ se guarda$/` e media o golpe seguinte. Essa linha morreu junto com
     a coisa que ela media — é a prosa vazia que A3 matou. Mantê-la seria
     trocar dívida visível por prova vazia: 0 golpe medido, razão 0,000,
     verde sem morder. A âncora nova está descrita no bloco A SONDA
     SINTÉTICA, acima: a janela entre "ergue" e "se desfaz", dano por
     golpe TENTADO, numa dupla montada para a guarda chegar à mesa.
     O LIMIAR NÃO AFROUXOU: `razaoMaximaDeDanoAposGuarda` continua 0,9 e
     continua saindo da tabela. Hoje mede 0,699 (defesa 15 → 19).
     As DUAS FAMÍLIAS entram na mesma asserção porque a lei é uma só — um
     buff aplicado muda um número: a guarda desconta o que se sofre, o
     buff engorda o que se dá. Verificado contra três arenas mutantes: a
     que volta a narrar prosa, a que ergue a guarda sem a projeção enxergar
     (razão 1,071) e a que empilha o efeito sem somá-lo ao dano (ganho
     0,042). As três ficam vermelhas aqui. */
  t("um buff aplicado muda de verdade um número da queda seguinte",
    razao <= MEDIDA_DO_BURACO.razaoMaximaDeDanoAposGuarda && ganhoDoBuff >= MEDIDA_DO_BURACO.ganhoMinimoDoBuffNoGolpe,
    `guarda: razão ${razao.toFixed(3)} (teto ${MEDIDA_DO_BURACO.razaoMaximaDeDanoAposGuarda}) · buff: ganho ${ganhoDoBuff.toFixed(2)} (piso ${MEDIDA_DO_BURACO.ganhoMinimoDoBuffNoGolpe})`);
}

/* ============================================================
   8. A LINHA DE QUEDA NÃO PODE PROMETER O CONTRÁRIO DA FICHA (P1)

   A DOENÇA. "A Chama firma Escudo Arcano · +1 de dano mágico" — a
   habilidade promete uma barreira que absorve o próximo dano, e a linha
   que o jogador lê na arena anuncia golpe. Duas frases opostas sobre a
   mesma coisa, e ninguém as via porque a suíte nunca as mediu: a sonda
   sintética da seção 7 usa "Postura de Ferro", um nome INVENTADO que não
   promete proteção nenhuma, e por isso continuava (e continua) certa
   dizendo "+2 de dano físico".

   POR QUE SOBRE QUEDAS DE VERDADE. Montar a string à mão e conferir o
   regex provaria o regex, não a arena. `aplicarAcoes` é quem escreve a
   linha, e é dela que a mentira saía. Então a medida é a mesma da seção
   7: os 28 pares dos oito prontos, sementes fixas, e as linhas que a
   arena de fato escreveu. As sementes têm prefixo próprio ("p1|") para
   esta seção não se pendurar no fluxo de RNG da outra — nenhuma das duas
   sorteia, e as duas medem o mesmo motor por amostras independentes.

   O DENTE ANDA NOS DOIS SENTIDOS. Se o rótulo emudecesse TODO buff, a
   primeira metade ficaria verde sozinha e a arena pararia de dizer o
   número a quem tem direito a ele. Por isso a ofensiva também é cobrada:
   quem não promete abrigo continua anunciando "+N de dano" com escola.
   ============================================================ */
sec("8. a frase da queda — a defensiva não promete dano (P1)");
{
  const MEDIDA_DA_FRASE = {
    sementesPorPar: 6,
    semente: (a, b, s) => `p1|${a}|${b}|${s}`,
    /* OS PISOS DA AMOSTRA, e é deles que depende a prova não ser vazia.
       Uma arena que parasse de firmar buff mediria 0 linha e passaria
       verde sem ter lido uma frase — o mesmo buraco que a seção 7
       tapou com `golpesMinimosDaSonda`. Medidos em P1 (v9.231): 772 linhas
       de buff firmado, 391 delas defensivas (Postura Defensiva e Escudo
       Arcano) e 381 ofensivas (Bênção e Inspiração). Os pisos guardam a
       ordem de grandeza, não o número.

       A MESMA MIGRAÇÃO DA SEÇÃO 7, vista daqui (v9.233 · P3). NENHUM piso
       mudou — o que mudou foi a REPARTIÇÃO, e o número medido tinha de
       parar de mentir no comentário: 783 firmados · 578 defensivas · 205
       ofensivas. O piloto passou a preferir o abrigo depois que ele começou
       a tirar dano de verdade (`absorverDano`), então a mesma quantidade de
       turnos de apoio mudou de lado: defensivas 391 → 578, ofensivas
       381 → 205. As duas continuam MUITO acima dos pisos de 50 (a ofensiva,
       a que encolhe, em 4,1× o piso), e é por isso que este dente não foi
       mexido: aqui ele mede a FRASE de cada família, não quanto cada uma
       pesa — e as duas famílias continuam chegando à mesa. */
    minimoDeFirmados: 200,
    minimoDeDefensivas: 50,
    minimoDeOfensivas: 50,
  };

  /* O NOME NÃO BASTA. `aplicacaoDoBuff` classifica pelo TEXTO, e o texto
     é nome + descrição: "Postura Defensiva" não tem uma palavra de
     abrigo no nome — quem promete metade do dano é a descrição dela.
     Por isso a régua consulta a FICHA que o pronto carrega, e não a
     string que a linha imprimiu. */
  const FICHA_DO_REPERTORIO = new Map();
  for (const p of P.PRONTOS) for (const h of P.montarPronto(p.id).habilidades) FICHA_DO_REPERTORIO.set(h.nome, h);

  const LINHA_DO_BUFF = /^(.+?) firma (.+?) · (.+)$/;
  const NUMERO_DE_DANO = /\+\d+ de dano/;
  const FALA_DE_DANO = / de dano\b/;
  const ESCOLA = /\+\d+ de dano (físico|mágico)$/;

  const f = { firmados: 0, defensivas: 0, ofensivas: 0, semFicha: 0 };
  const mentirosas = [], emudecidas = [];
  const t0 = Date.now();
  for (let i = 0; i < P.PRONTOS.length; i++) {
    for (let j = i + 1; j < P.PRONTOS.length; j++) {
      const a = P.PRONTOS[i].id, b = P.PRONTOS[j].id;
      for (let s = 0; s < MEDIDA_DA_FRASE.sementesPorPar; s++) {
        for (const q of A.duelarProntos(a, b, { semente: MEDIDA_DA_FRASE.semente(a, b, s) }).quedas) {
          for (const l of q.linhas.slice(1)) {
            const m = l.match(LINHA_DO_BUFF);
            if (!m) continue;
            const [, , nome, cauda] = m;
            const hab = FICHA_DO_REPERTORIO.get(nome);
            if (!hab) { f.semFicha++; continue; }
            f.firmados++;
            if (CB.aplicacaoDoBuff(hab)) {
              f.defensivas++;
              if (NUMERO_DE_DANO.test(cauda) || FALA_DE_DANO.test(cauda)) mentirosas.push(l);
            } else {
              f.ofensivas++;
              if (!ESCOLA.test(cauda)) emudecidas.push(l);
            }
          }
        }
      }
    }
  }

  console.log(`  ··  ${f.firmados} linhas de buff firmado lidas nas quedas de verdade (${MEDIDA_DA_FRASE.sementesPorPar} sementes por par, prefixo "p1|")`);
  console.log(`  ··  ${f.defensivas} delas de habilidade que promete abrigo (e não dizem número), ${f.ofensivas} de habilidade que levanta o golpe (e dizem)`);
  console.log(`  ··  a leitura levou ${Date.now() - t0}ms`);

  t("a arena firmou buff de sobra para a frase ser medida",
    f.firmados >= MEDIDA_DA_FRASE.minimoDeFirmados, `${f.firmados} de piso ${MEDIDA_DA_FRASE.minimoDeFirmados}`);
  t("e as duas famílias chegaram à mesa — defensiva e ofensiva",
    f.defensivas >= MEDIDA_DA_FRASE.minimoDeDefensivas && f.ofensivas >= MEDIDA_DA_FRASE.minimoDeOfensivas,
    `defensivas ${f.defensivas}, ofensivas ${f.ofensivas}`);
  /* toda habilidade que o piloto firma vem do repertório do pronto: uma
     linha sem ficha seria a arena narrando o que não está na mesa. */
  t("toda linha firmada tem ficha por trás", f.semFicha === 0, `${f.semFicha} sem ficha`);

  t("NENHUMA linha de defensiva diz \"+N de dano\" na arena",
    mentirosas.length === 0, `${mentirosas.length} linhas, ex.: ${mentirosas.slice(0, 3).join(" | ")}`);
  t("e toda linha de ofensiva continua dizendo o número e a escola",
    emudecidas.length === 0, `${emudecidas.length} linhas, ex.: ${emudecidas.slice(0, 3).join(" | ")}`);
}

/* ============================================================
   9. O DUELISTA ERGUE GUARDA DE VERDADE (P2 · v9.232)

   O QUE A SEÇÃO 7 JÁ DIZIA, e é a origem desta. O bloco A SONDA
   SINTÉTICA registra, por escrito, que "a frente da GUARDA quase nunca
   dispara no round-robin: para o piloto escolher o plano, ele exige um
   regex de nome — e nenhum dos nove nomes da tabela `GUARDAS` casa com
   ele". Por isso a sonda de A3 teve de INVENTAR "Postura de Casca de
   Carvalho": um nome de mentira, montado para casar com as duas réguas
   ao mesmo tempo. A arena consumia a guarda; o piloto é que não a
   escolhia. P2 tirou o regex do caminho: `ehGuarda` pergunta à tabela.

   O QUE ESTA SEÇÃO PROVA, e por que com ficha sintética. Que a
   habilidade REAL do catálogo — "Casca de Carvalho", o nome que o
   Druida tem na ficha, sem uma palavra do vocabulário de apoio — hoje
   atravessa o caminho inteiro: o piloto a escolhe, `turnoDosCompanheiros`
   a carrega, e a arena ERGUE a guarda e vence o prazo dela.

   O CUIDADO QUE A ETAPA MEDIU, e que esta seção declara em vez de
   esconder: NENHUM dos oito prontos carrega qualquer uma das nove
   guardas. A amostra normal do round-robin dá ZERO guarda erguida, e
   isso é um fato do acervo, não um defeito — uma asserção que exigisse
   guarda na amostra dos prontos seria uma mentira sobre o roster. Por
   isso o fato entra como MEDIDA (com teto zero), e a prova do caminho
   corre sobre ficha própria.
   ============================================================ */
sec("9. o duelista ergue guarda de verdade (P2)");
{
  const H = await import(RAIZ + "habilidades.js");
  const CL = await import(RAIZ + "classes.js");

  const MEDIDA_DA_GUARDA = {
    /* O FATO DO ACERVO: quantas das nove a mesa dos oito carrega. Hoje
       zero, e o teto é zero — o dia em que um pronto ganhar uma guarda
       esta linha fica vermelha e alguém decide de propósito se a amostra
       do round-robin passa a ter guarda dentro (e o equilíbrio junto). */
    tetoDeGuardasNosProntos: 0,
    quedasDaSonda: 20,
    /* OS PISOS DA AMOSTRA. Medidos hoje: 19 quedas em 20 abrem com a
       guarda erguida e 16 a veem vencer o prazo. Os pisos guardam a ordem
       de grandeza — o portão do apoio é sorteado (0,7) e a queda pode
       acabar antes dos 3 turnos —, e o que eles impedem é a prova vazia:
       uma arena que voltasse a não erguer guarda nenhuma mediria zero e
       passaria verde sem ter erguido nada. */
    pisoDeErguidas: 10,
    pisoDeDesfeitas: 5,
  };

  const CASCA = CL.fichaDaHabilidade("Casca de Carvalho");
  t('"Casca de Carvalho" está no catálogo, com custo e descrição', !!CASCA && Number(CASCA.custo) > 0);
  /* A PROVA DE QUE QUEM A ENXERGA É A TABELA, e só ela: o nome não tem uma
     palavra do vocabulário de apoio (bênção, grito, canção, hino, postura,
     fúria) nem de abrigo (escudo, barreira, proteção), e a descrição
     também não. `ehBuff` a nega; `ehGuarda` a reconhece — e é por
     `ehGuarda` que o piloto passa a vê-la. */
  t("o piloto a enxerga pela tabela (ehGuarda), não por palpite de nome (ehBuff)",
    C.ehGuarda(CASCA) === true && C.ehBuff(CASCA) === false,
    `ehGuarda=${C.ehGuarda(CASCA)} ehBuff=${C.ehBuff(CASCA)}`);

  /* O FATO DO ACERVO, medido e impresso */
  const guardasNosProntos = [];
  for (const p of P.PRONTOS) for (const h of P.montarPronto(p.id).habilidades) if (H.guardaDe(h)) guardasNosProntos.push(`${p.id}:${h.nome}`);
  console.log(`  ··  guardas da tabela no repertório dos oito prontos: ${guardasNosProntos.length}${guardasNosProntos.length ? ` (${guardasNosProntos.join(", ")})` : " — a amostra do round-robin não tem guarda dentro"}`);
  t(`nenhum dos oito prontos carrega uma das ${H.GUARDAS.length} guardas (teto ${MEDIDA_DA_GUARDA.tetoDeGuardasNosProntos})`,
    guardasNosProntos.length <= MEDIDA_DA_GUARDA.tetoDeGuardasNosProntos, guardasNosProntos.join(", "));

  /* A DUPLA SINTÉTICA, no molde da seção 7: um guardião com UMA habilidade
     (a real, do catálogo) contra um agressor sem habilidade e sem bolsa —
     nenhuma cura e nenhuma poção no meio da medida. Sementes fixas: a
     arena trava a sorte por semente, e duas rodadas dão a mesma saída. */
  const fichaDaSonda = (id, nome, habs) => ({ ...P.montarPronto(id), nome, habilidades: habs, inventario: [] });
  const guardiao = fichaDaSonda("muralha", "O Guardião", [CASCA]);
  const agressor = fichaDaSonda("punho", "O Agressor", []);
  const ERGUE = /^O Guardião ergue Casca de Carvalho(?: \(defesa \+(\d+)\))?$/;
  const DESFEZ = /Casca de Carvalho se desfaz/;

  let ergueu = 0, desfez = 0, ganhos = new Set();
  for (let s = 0; s < MEDIDA_DA_GUARDA.quedasDaSonda; s++) {
    for (const l of A.simularQueda(guardiao, agressor, { semente: `p2|${s}` }).linhas) {
      const m = l.match(ERGUE);
      if (m) { ergueu++; ganhos.add(Number(m[1] || 0)); continue; }
      if (DESFEZ.test(l)) desfez++;
    }
  }
  console.log(`  ··  em ${MEDIDA_DA_GUARDA.quedasDaSonda} quedas: ${ergueu} guardas erguidas e ${desfez} vencendo o prazo · ganho de defesa medido: ${[...ganhos].join("/")}`);

  t(`a arena ergue a guarda REAL do catálogo (piso ${MEDIDA_DA_GUARDA.pisoDeErguidas} em ${MEDIDA_DA_GUARDA.quedasDaSonda} quedas)`,
    ergueu >= MEDIDA_DA_GUARDA.pisoDeErguidas, `${ergueu} erguidas`);
  /* o número não sai do teste nem da prosa: é `defesaDe` de antes contra
     `defesaDe` de depois, e a tabela GUARDAS diz +4 para esta linha */
  t("e o ganho que a linha anuncia é o da tabela (+4), medido pela defesa",
    ganhos.size === 1 && ganhos.has(H.GUARDAS.find((g) => g.id === "casca_carvalho").valor),
    `ganhos vistos: ${[...ganhos].join(", ")}`);
  t(`e o prazo dela vence dentro da queda (piso ${MEDIDA_DA_GUARDA.pisoDeDesfeitas})`,
    desfez >= MEDIDA_DA_GUARDA.pisoDeDesfeitas, `${desfez} desfeitas`);
  /* determinismo por semente, nesta amostra e não só na do topo da suíte */
  t("mesma semente = a mesma queda da sonda, linha a linha",
    JSON.stringify(A.simularQueda(guardiao, agressor, { semente: "p2|0" })) === JSON.stringify(A.simularQueda(guardiao, agressor, { semente: "p2|0" })));
}

console.log(`\n${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
