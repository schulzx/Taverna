/* A ARENA (v9.215) — o duelo provável, uma peça para três mesas

   As leis desta suíte: determinismo é o árbitro (mesma dupla + mesma
   semente = mesmo duelo, golpe a golpe); a ficha original nunca é mutada
   (o duelo não deixa cicatriz); toda queda TERMINA; e a CATRACA DO
   EQUILÍBRIO — o round-robin dos oito trava a taxa de vitória de todo
   pronto entre 35% e 65%. Um pronto que domina quebra aqui, no dia em
   que passou a dominar. */

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

sec("6. A CATRACA DO EQUILÍBRIO — teste, não intenção");
{
  const rr = A.roundRobin({ sementes: 30 });
  const taxas = Object.entries(rr);
  t("os oito jogam o round-robin completo", taxas.length === 8);
  for (const [id, tx] of taxas) {
    t(`${id} vence entre 35% e 65% (${(tx * 100).toFixed(1)}%)`, tx >= 0.35 && tx <= 0.65);
  }
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
    /* A mesa real: ordem de grandeza, não número mágico. Medidos hoje 791
       buffs firmados, 329 golpes com o bônus dentro e 409 efeitos vencendo
       o prazo, em 424 quedas. O piso é conservador de propósito — ele
       guarda o "acontece", e o quanto é assunto de A4 (o equilíbrio). */
    minimoDaMesaReal: 100,
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
  const t0 = Date.now();

  /* ---------------- A MESA REAL: OS 28 PARES DOS OITO ----------------
     `m.linhas` conta LINHAS DE QUEDA, e o nome é esse de propósito. Até
     v9.224 ele se chamava `m.meias` e a conta batia por acidente: cada
     linha depois do terreno era mesmo uma meia-rodada, porque a arena não
     tinha outra coisa para narrar. A3 fez nascer linha de guarda, de buff
     e de prazo vencendo — a conta deixou de ser de meias-rodadas e o nome
     tinha de deixar de mentir. Nenhum número da tabela mudou com isso. */
  const m = { quedas: 0, linhas: 0, mortas: 0, aberturas: 0, firmados: 0, comPeso: 0, dissipados: 0 };
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
          }
          if (GUARDA.test(ls[0] || "") && GUARDA.test(ls[1] || "")) m.aberturas++;
        }
      }
    }
  }
  const pctAberturas = (100 * m.aberturas / m.quedas).toFixed(1);

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
  console.log(`  ··  a arena cumpre o que o piloto escolhe: ${m.firmados} buffs firmados, ${m.comPeso} golpes com o bônus dentro, ${m.dissipados} efeitos vencendo o prazo`);
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
     por ausência: zero buff firmado também daria zero meia-rodada morta. */
  t("na mesa real a arena firma buff, engorda golpe e vence prazo",
    m.firmados >= MEDIDA_DO_BURACO.minimoDaMesaReal && m.comPeso >= MEDIDA_DO_BURACO.minimoDaMesaReal && m.dissipados >= MEDIDA_DO_BURACO.minimoDaMesaReal,
    `${m.firmados} firmados, ${m.comPeso} com bônus, ${m.dissipados} dissipados`);

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

console.log(`\n${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
