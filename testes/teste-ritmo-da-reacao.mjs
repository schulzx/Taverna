/* O RITMO DA REAÇÃO (v9.258 · K1b) — o relógio de 15 s, e o que ele cobra

   O que esta suíte protege:

   1. O TETO DA ESPERA, medido e não declarado. O relógio dispara por golpe
      recebido: com quatro inimigos na mesa são quatro janelas de 15 s —
      60 000 ms numa rodada —, e com quatro lendários de nível ≥ 12 são
      180 000 ms. A janela é da RODADA, e a suíte prova o antes e o depois
      COMO NÚMERO, para que o ganho não evapore em silêncio no dia em que
      alguém mexer: 60 000 → 15 000 (−75,0 %) e 180 000 → 15 000 (−91,7 %).
      E o teto que importa não é o da rodada: é o de ENTRE RESPOSTAS —
      2 × 16 600 = 33 200 ms —, porque um teto por rodada multiplicado por
      um número de rodadas sem limite não é teto nenhum.

   2. AS OITO PORTAS, pelo nome. Provar que a janela não abriu é pouco; o
      que esta suíte cobra é POR QUE ela não abriu.

   3. O DANO NÃO VAZA. É a decisão da pessoa ("o dano vir surpresa",
      15/09) virada catraca: a reação é instinto, não cálculo. Três
      asserções guardam as duas portas mais subtis — o tamanho da lista
      oferecida (porta 7) e a duração da janela (porta 10).

   4. O DETERMINISMO. O módulo nunca rola dado: a prova é correr com
      `Math.random` substituído por uma função que estoura.
*/

const RAIZ = "../src/";
const { readFileSync } = await import("node:fs");
const R = await import(RAIZ + "ritmo-da-reacao.js");
const { RITMO_DA_REACAO, ESCADA_DO_SILENCIO, TETO_DA_ESPERA, PISO_DO_GOLPE, PORTAS_DA_JANELA, ritmoDaRodada } = R;
const R_REACOES = await import(RAIZ + "reacoes.js");

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

/* ---------------- AS FICHAS DA MESA ----------------
   `guerreiro`: perfil marcial → a única reação de `sofre_dano` é Aparar
   (0 PM, `minDano` 5, sem `chance`). O PM nunca trava e o dado nunca
   entra: é a ficha limpa para medir o relógio.
   `mago`: perfil conjurador → Escudo Arcano (2 PM, `minDano` 6, sem
   `chance`). Serve à porta `sem_pm` e à paridade. */
const guerreiro = { classe: "Guerreiro", nivel: 10, vidaMax: 100, mana: 0, habilidades: [] };
const mago = { classe: "Mago", nivel: 10, vidaMax: 60, mana: 10, habilidades: [] };
/* limiar do guerreiro: max(minDano 5, round(100 × 0,08) = 8) = 8 */
const DANO_QUE_PAGA = 20;
const DANO_DE_ARRANHAO = 3;

const golpe = (ordem, extra) => ({ ordem, inimigo: `Bandido ${ordem + 1}`, gatilho: "sofre_dano", dano: DANO_QUE_PAGA, tipoDano: "fisico", ...(extra || {}) });
const rodadaDe = (n, extra) => Array.from({ length: n }, (_, i) => golpe(i, extra));

sec("1. A CATRACA DA ETAPA — quatro inimigos na mesa, UMA janela");
{
  const r = ritmoDaRodada({ golpes: rodadaDe(4), heroi: guerreiro });
  t("a janela abre no primeiro golpe que qualifica", !!r.abre && r.abre.ordem === 0);
  t("os outros três ficam COBERTOS, não enfileirados", r.cobertos.length === 3 && r.cobertos.join(",") === "1,2,3", `cobertos: ${JSON.stringify(r.cobertos)}`);
  t("nenhum golpe é fechado por razão nenhuma", r.fechados.length === 0);
  t("a rodada inteira custa UMA janela: esperaMs === 15000", r.esperaMs === 15000, `esperaMs = ${r.esperaMs}`);
  t("e o teto da rodada respeita a tabela", r.esperaMs <= TETO_DA_ESPERA.msPorRodada);
  t("a rodada abre no máximo `janelasPorRodada` janela", TETO_DA_ESPERA.janelasPorRodada === 1 && (r.abre ? 1 : 0) <= TETO_DA_ESPERA.janelasPorRodada);
}

sec("2. O ANTES E O DEPOIS, ESCRITOS COMO NÚMERO");
{
  /* O «antes» não é espantalho: é o que o relógio de 15 s faz sozinho com
     o gatilho por golpe, sem ninguém desenhar nada de mau. */
  const janela = RITMO_DA_REACAO.find((x) => x.id === "normal").janela;
  const antes4 = 4 * janela;
  const depois4 = ritmoDaRodada({ golpes: rodadaDe(4), heroi: guerreiro }).esperaMs;
  t("quatro comuns, uma janela por golpe: 60 000 ms", antes4 === 60000);
  t("quatro comuns, uma janela por RODADA: 15 000 ms", depois4 === 15000);
  const corte4 = (antes4 - depois4) / antes4;
  console.log(`  ··  quatro inimigos: ${antes4} ms → ${depois4} ms (−${(corte4 * 100).toFixed(1)} %)`);
  t("o corte é de 75,0 % — a razão 4:1", Math.abs(corte4 - 0.75) < 1e-9);

  /* quatro lendários de nível ≥ 12 batem três vezes cada: doze golpes */
  const antes12 = 12 * janela;
  const r12 = ritmoDaRodada({ golpes: rodadaDe(12), heroi: guerreiro });
  t("doze golpes, uma janela por golpe: 180 000 ms", antes12 === 180000);
  t("doze golpes continuam a abrir UMA janela", !!r12.abre && r12.cobertos.length === 11);
  t("e continuam a custar 15 000 ms", r12.esperaMs === 15000, `esperaMs = ${r12.esperaMs}`);
  const corte12 = (antes12 - r12.esperaMs) / antes12;
  console.log(`  ··  doze golpes: ${antes12} ms → ${r12.esperaMs} ms (−${(corte12 * 100).toFixed(1)} %)`);
  t("o corte é de 91,7 %", Math.abs(corte12 * 100 - 91.7) < 0.05);

  /* de 1 a 12 golpes, com os dois bónus de pé: o pior caso da tabela */
  let estourou = null;
  for (let n = 1; n <= 12; n++) {
    const r = ritmoDaRodada({ golpes: rodadaDe(n), heroi: guerreiro, contagem: true, toque: true });
    if (r.esperaMs > TETO_DA_ESPERA.msPorRodada) estourou = `${n} golpes → ${r.esperaMs} ms`;
  }
  t("de 1 a 12 golpes, nenhuma rodada passa de `msPorRodada` (pior caso, com os dois bónus)", !estourou, estourou);
}

sec("3. O TETO ENTRE RESPOSTAS — o único que é teto de verdade");
{
  const normal = RITMO_DA_REACAO.find((x) => x.id === "normal");
  t("`msPorRodada` não diverge do relógio: 15000 + 1000 + 600", TETO_DA_ESPERA.msPorRodada === normal.janela + normal.bonusContagem + normal.bonusToque);
  t("duas janelas até ao silêncio", TETO_DA_ESPERA.janelasAteOSilencio === 2);
  t("2 × 16 600 = 33 200 ms, e a tabela diz exatamente isso", TETO_DA_ESPERA.msEntreRespostas === TETO_DA_ESPERA.janelasAteOSilencio * TETO_DA_ESPERA.msPorRodada && TETO_DA_ESPERA.msEntreRespostas === 33200);
  /* o pior caso de uma rodada, medido no módulo e não na tabela */
  const pior = ritmoDaRodada({ golpes: rodadaDe(4), heroi: guerreiro, contagem: true, toque: true });
  t("e o pior caso medido bate com o declarado", pior.esperaMs === TETO_DA_ESPERA.msPorRodada, `medido ${pior.esperaMs}`);
}

sec("4. AS OITO PORTAS — provar POR QUE não abriu");
{
  const portasConhecidas = new Set(PORTAS_DA_JANELA.map((p) => p.id));
  const soPorta = (r) => (r.fechados[0] || {}).porta;

  /* sem PM: o conjurador com 1 de mana não paga os 2 PM do Escudo Arcano */
  const semPm = ritmoDaRodada({ golpes: rodadaDe(3), heroi: { ...mago, mana: 1 } });
  t("herói sem PM não é perguntado — porta `sem_pm`", semPm.abre === null && soPorta(semPm) === "sem_pm", `porta: ${soPorta(semPm)}`);
  t("e não espera nada", semPm.esperaMs === 0);

  /* a reação é uma por rodada, e já foi usada */
  const gasta = ritmoDaRodada({ golpes: rodadaDe(4), heroi: guerreiro, reacaoGasta: true });
  t("a reação já gasta na rodada — porta `reacao_gasta`", gasta.abre === null && soPorta(gasta) === "reacao_gasta");
  t("todos os golpes da rodada ficam fechados pela mesma razão", gasta.fechados.length === 4 && gasta.fechados.every((f) => f.porta === "reacao_gasta"));
  t("e a espera é zero", gasta.esperaMs === 0);

  /* É ESTA QUE FECHA A PORTA DO MINUTO: quem recusou no golpe 1 não é
     importunado no 2 e no 3. Uma recusa é uma declaração sobre a RODADA. */
  const respondeu = ritmoDaRodada({ golpes: rodadaDe(4), heroi: guerreiro, jaRespondeu: true });
  t("já respondeu nesta rodada — porta `ja_respondeu`", respondeu.abre === null && soPorta(respondeu) === "ja_respondeu");
  t("e a espera é zero", respondeu.esperaMs === 0);

  /* zero reação aplicável: o mago não tem nada que responda a um golpe
     que passou longe (Contra-ataque é dos marciais e dos furtivos) */
  const semReacao = ritmoDaRodada({ golpes: rodadaDe(2, { gatilho: "inimigo_erra", dano: 0 }), heroi: mago });
  t("zero reação aplicável — porta `sem_reacao`", semReacao.abre === null && soPorta(semReacao) === "sem_reacao", `porta: ${soPorta(semReacao)}`);

  /* ---------------- A PORTA `so_magia` ESTÁ ESCRITA E HOJE NÃO TEM DONO ----
     ACHADO DESTA ETAPA, e fica escrito em vez de fingido. A porta existe na
     tabela porque `escolherReacao` tem o filtro (v9.47: "reação que só morde
     magia não morde uma machadada"), mas NENHUMA FICHA a alcança hoje:

     - a única reação com `soMagia` é a Contramágica, e ela custa 3 PM;
     - `reacoesDe` dá SEMPRE ao herói a reação de `sofre_dano` do seu perfil
       — aparar (marcial/misto), esquiva ágil (furtivo) ou escudo arcano
       (conjurador) — e `perfilCombate` devolve "marcial" para toda classe
       desconhecida, logo não existe ficha sem uma;
     - as três custam 0, 0 e 2 PM, ou seja MENOS que a Contramágica. Quem
       paga os 3 PM dela paga a sua também, e a sua não morde só magia.

     Logo, a lista nunca fica "só magia". A VARREDURA ABAIXO é a catraca
     disso: se um dia uma reação mágica barata nascer (ou o perfil deixar de
     garantir uma reação física), esta linha fica VERMELHA — e quem a vir
     escreve o caso real no lugar deste comentário. Uma porta sem caso é
     dívida; uma porta sem caso E sem aviso é armadilha. */
  const PERFIS = await import(RAIZ + "combate.js");
  const alcancadas = new Set();
  for (const classe of [...Object.keys(PERFIS.PERFIS_COMBATE), "Classe Que Não Existe"]) {
    for (let mana = 0; mana <= 10; mana++) {
      for (const habs of [[], ["Contramágica"]]) {
        for (const tipoDano of ["fisico", "arcano"]) {
          const x = ritmoDaRodada({ golpes: [{ ordem: 0, inimigo: "Ogro", gatilho: "sofre_dano", dano: 30, tipoDano }], heroi: { classe, vidaMax: 100, mana, habilidades: habs } });
          for (const f of x.fechados) alcancadas.add(f.porta);
        }
      }
    }
  }
  t("a porta `so_magia` está na tabela, com o porquê escrito", !!PORTAS_DA_JANELA.find((p) => p.id === "so_magia" && p.porque));
  t("e HOJE nenhuma ficha a alcança — ver o comentário acima; vermelho aqui é a porta ganhando dono",
    !alcancadas.has("so_magia"), `alcançadas na varredura: ${[...alcancadas].join(", ")}`);
  t("a Contramágica, essa, é oferecida quando o golpe é mágico", (() => {
    const r = ritmoDaRodada({ golpes: [{ ordem: 0, inimigo: "Ogro", gatilho: "sofre_dano", dano: 30, tipoDano: "arcano" }], heroi: { classe: "Mago", vidaMax: 100, mana: 10, habilidades: ["Contramágica"] } });
    return !!r.abre && r.abre.reacoes.some((x) => x.id === "contramagia");
  })());
  t("e NÃO é oferecida quando o golpe é físico", (() => {
    const r = ritmoDaRodada({ golpes: [{ ordem: 0, inimigo: "Ogro", gatilho: "sofre_dano", dano: 30, tipoDano: "fisico" }], heroi: { classe: "Mago", vidaMax: 100, mana: 10, habilidades: ["Contramágica"] } });
    return !!r.abre && !r.abre.reacoes.some((x) => x.id === "contramagia");
  })());

  /* O ARRANHÃO, e é a TRAVA K2: quem não é perguntado tem o jogo de hoje.
     `escolherReacao` já não gasta a reação num golpe pequeno; a janela não
     pode abrir onde o sistema de hoje não fazia nada. */
  const arranhao = ritmoDaRodada({ golpes: rodadaDe(4, { dano: DANO_DE_ARRANHAO }), heroi: guerreiro });
  t("o arranhão não abre janela — porta `arranhao`", arranhao.abre === null && soPorta(arranhao) === "arranhao", `porta: ${soPorta(arranhao)}`);
  t("TRAVA K2: onde a janela não abre, `escolherReacao` também não reage",
    R_REACOES.escolherReacao({ pers: guerreiro, gatilho: "sofre_dano", dano: DANO_DE_ARRANHAO }) === null);
  t("e um golpe grande na mesma rodada ainda abre (o arranhão fecha só o seu golpe)", (() => {
    const mistura = [golpe(0, { dano: DANO_DE_ARRANHAO }), golpe(1), golpe(2)];
    const r = ritmoDaRodada({ golpes: mistura, heroi: guerreiro });
    return !!r.abre && r.abre.ordem === 1 && r.fechados.length === 1 && r.fechados[0].porta === "arranhao" && r.cobertos.join(",") === "2";
  })());

  /* a preferência da ficha decidiu por ele: o sistema faz e não pergunta */
  const passar = ritmoDaRodada({ golpes: rodadaDe(4), heroi: guerreiro, preferencia: "deixar_passar" });
  t("`deixar_passar` — porta `preferencia`, nenhuma janela", passar.abre === null && soPorta(passar) === "preferencia" && passar.esperaMs === 0);
  const travado = ritmoDaRodada({ golpes: rodadaDe(4), heroi: guerreiro, preferencia: "aparar" });
  t("verbo travado na ficha — porta `preferencia`, nenhuma janela", travado.abre === null && soPorta(travado) === "preferencia" && travado.esperaMs === 0);

  /* a escada, e é a oitava porta: é temporal */
  const calou = ritmoDaRodada({ golpes: rodadaDe(4), heroi: guerreiro, expiracoesSeguidas: 2 });
  t("à SEGUNDA expiração seguida a luta cala — `silencio === true`", calou.silencio === true);
  t("e nenhuma janela abre — porta `silencio`", calou.abre === null && soPorta(calou) === "silencio");
  t("e a espera é zero", calou.esperaMs === 0);
  t("a PRIMEIRA expiração é de graça (a escada perdoa uma)", (() => {
    const r = ritmoDaRodada({ golpes: rodadaDe(4), heroi: guerreiro, expiracoesSeguidas: 1 });
    return r.silencio === false && !!r.abre;
  })());
  t("e o silêncio continua pelo resto da luta (3, 4, 5 expirações)", [3, 4, 5].every((n) => {
    const r = ritmoDaRodada({ golpes: rodadaDe(2), heroi: guerreiro, expiracoesSeguidas: n });
    return r.silencio === true && r.abre === null;
  }));
  t("a escada tem os dois degraus da tabela, e o segundo cala", ESCADA_DO_SILENCIO.length === 2 && ESCADA_DO_SILENCIO[0].faz === "nada" && ESCADA_DO_SILENCIO[1].faz === "silencio" && ESCADA_DO_SILENCIO[1].seguidas === TETO_DA_ESPERA.janelasAteOSilencio);

  /* NENHUMA PORTA SEM NOME: toda razão devolvida existe na tabela */
  const todas = [semPm, gasta, respondeu, semReacao, arranhao, passar, travado, calou];
  t(`toda porta devolvida existe em PORTAS_DA_JANELA (${PORTAS_DA_JANELA.length} razões)`,
    todas.every((r) => r.fechados.every((f) => portasConhecidas.has(f.porta))));
  /* SETE das nove têm caso nesta seção. As duas que faltam:

     · `so_magia` — a que não tem dono hoje, e a varredura acima é a
       catraca dela (ver o comentário longo mais acima).
     · `escondida` — A NONA, NASCIDA EM K2 (v9.266). O MOTIVO DE ELA NÃO
       TER CASO AQUI, e é para ficar escrito: esta seção prova as portas
       DO JOGO — a preferência, o silêncio, o recurso gasto, o arranhão.
       `escondida` não é uma porta do jogo, é uma condição da MÁQUINA (a
       aba de fundo não garante temporizador nenhum, logo a janela nasce
       já fechada e a rodada resolve-se como hoje, na hora). Ela é provada
       inteira — precedência, espera zero, e o facto de NÃO alimentar a
       escada — na asserção 15 de `teste-trava-da-reacao.mjs`, que é a
       suíte da trava. Duplicá-la aqui seria provar a mesma coisa em dois
       sítios e deixar as duas divergirem em silêncio.

     A ASSERÇÃO MUDOU DE `faltam.length === 1` PARA A LISTA NOMEADA, e é
     de propósito: uma contagem diria só "faltam duas" no dia em que
     nascesse uma décima porta sem caso. A lista diz QUAIS, e uma porta
     nova sem caso continua a ficar vermelha aqui. */
  t("e sete das nove têm caso escrito aqui (`so_magia` e `escondida` têm o seu, escrito acima)", (() => {
    const vistas = new Set(todas.flatMap((r) => r.fechados.map((f) => f.porta)));
    const faltam = PORTAS_DA_JANELA.filter((p) => !vistas.has(p.id)).map((p) => p.id).sort();
    return faltam.join(",") === "escondida,so_magia";
  })());
  t("toda porta tem o porquê escrito", PORTAS_DA_JANELA.every((p) => typeof p.porque === "string" && p.porque.length > 10));
}

sec("5. `SEM PRESSA` — a janela abre, e não cobra nada");
{
  /* WCAG 2.2.1 (Timing Adjustable, nível A): quem escolheu que o jogo o
     espere não pode ser quem o teto conta como espera. Um teto que
     contasse o tempo de quem pediu tempo seria um teto contra o
     utilizador que a lei protege. */
  const r = ritmoDaRodada({ golpes: rodadaDe(4), heroi: guerreiro, preferencia: "parado" });
  t("a janela ABRE — ele decide na mesma", !!r.abre);
  t("o ritmo é `parado`", r.abre.ritmo === "parado");
  t("a janela não expira — `janelaMs === 0`", r.abre.janelaMs === 0);
  t("e a espera imposta é ZERO", r.esperaMs === 0);
  t("os outros golpes continuam cobertos", r.cobertos.length === 3);
  t("nem os bónus a fazem cobrar", ritmoDaRodada({ golpes: rodadaDe(4), heroi: guerreiro, preferencia: "parado", contagem: true, toque: true }).esperaMs === 0);
}

sec("6. O RELÓGIO — os invariantes de toda linha da tabela");
{
  /* `folgado` MORREU, e a suíte prova que morreu. Ele nasceu para ser o
     DOBRO de um `normal` de 4 000; com `normal` a 15 000 um `folgado`
     mais curto seria castigo e um mais longo não tem estrada que o
     alcance. Regra sem leitor é export morto no dia em que nasce. */
  t("`folgado` NÃO EXISTE em RITMO_DA_REACAO", RITMO_DA_REACAO.find((r) => r.id === "folgado") === undefined);
  t("são duas linhas, duas estradas: `normal` e `parado`", RITMO_DA_REACAO.length === 2 && RITMO_DA_REACAO.map((r) => r.id).join(",") === "normal,parado");

  for (const r of RITMO_DA_REACAO.filter((x) => x.janela > 0)) {
    t(`[${r.id}] folga + trilho === janela (${r.folga} + ${r.trilho} === ${r.janela})`, r.folga + r.trilho === r.janela);
    /* a contagem regressiva nunca tem dois dígitos */
    t(`[${r.id}] o trilho não passa de 9 000 ms (${r.trilho})`, r.trilho <= 9000);
    t(`[${r.id}] o aperto é menor que o trilho (${r.aperto} < ${r.trilho})`, r.aperto < r.trilho);
    /* os 4 s medidos por K1 são o PRAZO, não a janela */
    t(`[${r.id}] o trilho é o prazo medido por K1 (4 030 ms, arredondado)`, r.trilho === 4000);
    t(`[${r.id}] a janela é 3,72× o tempo medido`, Math.abs(r.janela / 4030 - 3.72) < 0.01);
  }

  /* o piso do golpe é o mesmo 0,08 que `escolherReacao` escreve à mão */
  t("PISO_DO_GOLPE é 0,08", PISO_DO_GOLPE === 0.08);
  t("e é o 0,08 que `reacoes.js` tem escrito à mão (a dívida declarada de K3)", readFileSync("../src/reacoes.js", "utf8").includes("* 0.08)"));
}

sec("7. A PARIDADE COM `escolherReacao` — a dívida do PISO_DO_GOLPE");
{
  /* As duas reações sem `chance` (Aparar e Escudo Arcano) são as únicas
     em que `escolherReacao` é determinística. Varrendo uma matriz de dano,
     a porta `arranhao` tem de fechar EXATAMENTE quando `escolherReacao`
     devolve null por limiar. O dia em que os dois 0,08 divergirem, isto
     fica vermelho. */
  const matriz = [];
  for (const pers of [guerreiro, mago, { ...guerreiro, vidaMax: 20 }, { ...mago, vidaMax: 200 }]) {
    for (let dano = 0; dano <= 40; dano++) matriz.push({ pers, dano });
  }
  let divergiu = null;
  for (const { pers, dano } of matriz) {
    const r = ritmoDaRodada({ golpes: [golpe(0, { dano })], heroi: pers });
    const fechouPorArranhao = r.abre === null && (r.fechados[0] || {}).porta === "arranhao";
    const motorNaoReage = R_REACOES.escolherReacao({ pers, gatilho: "sofre_dano", dano }) === null;
    if (fechouPorArranhao !== motorNaoReage) { divergiu = `${pers.classe} vidaMax ${pers.vidaMax}, dano ${dano}: porta=${fechouPorArranhao} motor=${motorNaoReage}`; break; }
  }
  t(`a porta \`arranhao\` e \`escolherReacao\` concordam em ${matriz.length} casos`, !divergiu, divergiu);
  t("e os dois lados do limiar aparecem na varredura (não é verde vazio)", (() => {
    const abriu = ritmoDaRodada({ golpes: [golpe(0, { dano: 8 })], heroi: guerreiro }).abre !== null;
    const fechou = ritmoDaRodada({ golpes: [golpe(0, { dano: 7 })], heroi: guerreiro }).abre === null;
    return abriu && fechou;
  })(), "o limiar do guerreiro com vidaMax 100 é max(5, round(100 × 0,08)) = 8");
}

sec("8. O DANO NÃO VAZA — a decisão da pessoa virada catraca");
{
  /* "acho que ficaria melhor o dano vir surpresa e aumentar o relógio" —
     a pessoa, 15/09. A reação passa a ser INSTINTO, NÃO CÁLCULO: um
     duelista não sabe quanto dói o machado antes de ele chegar. O segredo
     não se guarda com uma promessa; guarda-se fechando cada porta pelo
     nome, porque a mesma informação com outro rosto continua a ser a
     mesma informação. */

  /* (I) NENHUMA CHAVE DERIVADA DO DANO — nem o número cru (porta 1), nem a
     conta feita (porta 2). Chave nova quebra a suíte, e é de propósito. */
  const r = ritmoDaRodada({ golpes: rodadaDe(4), heroi: guerreiro });
  const CHAVES = ["ordem", "inimigo", "gatilho", "reacoes", "ritmo", "janelaMs", "folgaMs", "trilhoMs", "apertoMs"];
  t("o objeto `abre` tem exatamente as nove chaves acordadas", Object.keys(r.abre).sort().join(",") === CHAVES.slice().sort().join(","), `tem: ${Object.keys(r.abre).join(",")}`);
  t("e nenhuma delas cheira a dano (dano, corte, previsao, forte, pesado...)",
    Object.keys(r.abre).every((k) => !/dano|corta|corte|previs|dor|forte|fraco|pesad|lev(e|ar)|grav|peso|sever/i.test(k)));
  t("o retorno de topo também não (abre, cobertos, fechados, esperaMs, silencio)",
    Object.keys(r).sort().join(",") === "abre,cobertos,esperaMs,fechados,silencio");
  /* e o mais forte dos três: a MESMA rodada com dois danos muito diferentes
     devolve o MESMO objeto, byte a byte. Nenhum valor — nem chave, nem
     número, nem lista — pode ser função do dano se isto for verdade. */
  t("a resposta é byte a byte a mesma com 9 e com 97 de dano", (() => {
    const seco = (x) => JSON.stringify({ ...x, abre: x.abre && { ...x.abre, reacoes: x.abre.reacoes.map((y) => y.id) } });
    return seco(ritmoDaRodada({ golpes: rodadaDe(4, { dano: 9 }), heroi: guerreiro })) === seco(ritmoDaRodada({ golpes: rodadaDe(4, { dano: 97 }), heroi: guerreiro }));
  })());

  /* (II) A PORTA 7, PROVADA. Os `minDano` diferem por reação, logo uma
     lista filtrada por dano mudaria de TAMANHO com a faixa do golpe — e o
     tamanho da lista é o dano com outro rosto. Duas fichas, porque é
     justamente quem tem DUAS reações aplicáveis que vazaria. */
  const comDuas = { classe: "Mago", nivel: 10, vidaMax: 50, mana: 10, habilidades: ["Contramágica"] };
  for (const [rotulo, pers, tipoDano] of [["guerreiro", guerreiro, "fisico"], ["mago com duas", comDuas, "arcano"]]) {
    const listas = new Set();
    let aberturas = 0;
    for (let dano = 1; dano <= 99; dano++) {
      const x = ritmoDaRodada({ golpes: [golpe(0, { dano, tipoDano })], heroi: pers });
      if (!x.abre) continue;
      aberturas++;
      listas.add(x.abre.reacoes.map((y) => y.id).join("|"));
    }
    t(`[${rotulo}] a oferta é IDÊNTICA de 1 a 99 de dano (${aberturas} janelas, ${listas.size} lista distinta)`, listas.size === 1, `listas: ${[...listas].join(" / ")}`);
  }
  t("e a ficha com duas reações oferece MESMO as duas (senão a prova acima era vazia)", (() => {
    const x = ritmoDaRodada({ golpes: [golpe(0, { dano: 99, tipoDano: "arcano" })], heroi: comDuas });
    return !!x.abre && x.abre.reacoes.length === 2;
  })());

  /* (III) A PORTA 10, PROVADA — e é a mais subtil, porque soa a
     generosidade: um golpe grande com mais tempo faria o relógio SER o
     dano. A duração não olha o golpe, nunca. */
  const relogios = new Set();
  for (let dano = 1; dano <= 99; dano++) {
    const x = ritmoDaRodada({ golpes: [golpe(0, { dano })], heroi: guerreiro });
    if (!x.abre) continue;
    relogios.add([x.abre.janelaMs, x.abre.folgaMs, x.abre.trilhoMs, x.abre.apertoMs, x.abre.ritmo].join("|"));
  }
  t(`o relógio é IDÊNTICO de 1 a 99 de dano (${[...relogios][0]})`, relogios.size === 1, `relógios: ${[...relogios].join(" / ")}`);
  t("e a espera também não varia com o dano", (() => {
    const esperas = new Set();
    for (let dano = 8; dano <= 99; dano++) esperas.add(ritmoDaRodada({ golpes: [golpe(0, { dano })], heroi: guerreiro }).esperaMs);
    return esperas.size === 1 && [...esperas][0] === 15000;
  })());
  /* a ORDEM dos verbos é a de REACOES e é fixa (porta 6, fechada por construção) */
  t("a ordem da oferta é a de REACOES, e não a do golpe", (() => {
    const x = ritmoDaRodada({ golpes: [golpe(0, { dano: 99, tipoDano: "arcano" })], heroi: comDuas });
    const ids = x.abre.reacoes.map((y) => y.id);
    const naTabela = R_REACOES.REACOES.filter((y) => ids.includes(y.id)).map((y) => y.id);
    return ids.join(",") === naTabela.join(",");
  })());
}

sec("9. O DETERMINISMO — o módulo NUNCA rola dado");
{
  /* Não é deep-equal mil vezes: é a prova de que não há rolo nenhum.
     `chance` diz se a reação FUNCIONA, não se ela é OFERECIDA — uma janela
     deve abrir mesmo quando a esquiva pode falhar. */
  const original = Math.random;
  let estourou = null, correu = false;
  try {
    Math.random = () => { throw new Error("o ritmo rolou um dado"); };
    const ladino = { classe: "Ladino", nivel: 10, vidaMax: 80, mana: 0, habilidades: [] };
    const r1 = ritmoDaRodada({ golpes: rodadaDe(4), heroi: ladino });
    const r2 = ritmoDaRodada({ golpes: rodadaDe(4), heroi: ladino, contagem: true });
    correu = !!r1.abre && !!r2.abre && r2.esperaMs === 16000;
  } catch (err) { estourou = err.message; } finally { Math.random = original; }
  t("`ritmoDaRodada` corre com `Math.random` a estourar", !estourou, estourou);
  t("e a esquiva ágil (que TEM `chance`) é oferecida na mesma", correu);
  t("Math.random foi restaurado", Math.random === original && typeof Math.random() === "number");
  /* mesma entrada, mesma saída, byte a byte */
  const a = ritmoDaRodada({ golpes: rodadaDe(4), heroi: guerreiro });
  const b = ritmoDaRodada({ golpes: rodadaDe(4), heroi: guerreiro });
  t("mesma rodada = mesma resposta, byte a byte", JSON.stringify(a) === JSON.stringify(b));
}

sec("10. O LIXO E A IMUTABILIDADE");
{
  /* `= {}` no destructuring NÃO cobre `null`: é a armadilha da casa. */
  t("`heroi: null` não estoura — porta `sem_reacao`", (() => {
    const r = ritmoDaRodada({ golpes: rodadaDe(3), heroi: null });
    return r.abre === null && r.fechados.length === 3 && r.fechados.every((f) => f.porta === "sem_reacao");
  })());
  t("`golpes: null` não estoura", (() => {
    const r = ritmoDaRodada({ golpes: null, heroi: guerreiro });
    return r.abre === null && r.cobertos.length === 0 && r.fechados.length === 0 && r.esperaMs === 0;
  })());
  t("rodada vazia não estoura", (() => {
    const r = ritmoDaRodada({ golpes: [], heroi: guerreiro });
    return r.abre === null && r.esperaMs === 0;
  })());
  t("entrada `{}` não estoura", (() => { const r = ritmoDaRodada({}); return r.abre === null && r.esperaMs === 0; })());
  t("entrada `null` não estoura", (() => { const r = ritmoDaRodada(null); return r.abre === null && r.esperaMs === 0; })());
  t("golpe sem gatilho nem dano não estoura", (() => {
    const r = ritmoDaRodada({ golpes: [{ ordem: 0 }, { ordem: 1 }], heroi: guerreiro });
    return r.abre === null && r.fechados.every((f) => f.porta === "sem_reacao");
  })());
  t("`preferencia: null` cai no ritmo normal", ritmoDaRodada({ golpes: rodadaDe(2), heroi: guerreiro, preferencia: null }).esperaMs === 15000);

  /* IMUTABILIDADE: estado é substituído, nunca mutado */
  const golpes = rodadaDe(4);
  const antesGolpes = JSON.stringify(golpes);
  const heroi = { ...guerreiro };
  const antesHeroi = JSON.stringify(heroi);
  const antesTabela = JSON.stringify(RITMO_DA_REACAO);
  ritmoDaRodada({ golpes, heroi });
  t("a lista de golpes sai como entrou", JSON.stringify(golpes) === antesGolpes);
  t("a ficha do herói sai como entrou", JSON.stringify(heroi) === antesHeroi);
  t("e a tabela do relógio não foi tocada", JSON.stringify(RITMO_DA_REACAO) === antesTabela);
}

console.log(`\nritmo da reação (K1b): ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
