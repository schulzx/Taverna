/* O PV TEMPORÁRIO (Fase V · V1) — o poço que se gasta antes da carne

   A REGRA QUE ESTA SUÍTE PROVA, ditada na mesa em 14/09 e copiada aqui
   inteira porque é dela que toda asserção deste arquivo desce:

     "Da mesma forma da mesa: absorve o dano antes do PV real, não cura e
      não acumula; se você tem +4 e usa +10, deve escolher qual vai ser,
      ou o sistema escolhe automaticamente o maior."

   São quatro leis numa frase, e cada uma tem aqui a sua seção:
   (a) absorve ANTES do PV real — a ordem do dano, seção 7;
   (b) NÃO CURA — `vida` e `vidaMax` não são tocadas em caminho nenhum,
       seção 4, e a varredura de lixo da seção 9 repete a pergunta em
       cada entrada torta;
   (c) NÃO ACUMULA — +4 depois +10 dá 10, e +10 depois +4 dá 10; nunca
       14, em nenhuma ordem, seção 4;
   (d) A ESCOLHA — `vereditoDoTemporario` diz que há duas ofertas em jogo
       e qual fica; o padrão declarado é o maior, seção 3.

   O QUE ESTA SUÍTE IMPEDE DE ACONTECER:

   · Que o poço vire CURA. É o erro fácil da etapa: somar ao `vida` é uma
     linha a menos de código e uma regra a menos de jogo — o herói passa a
     terminar a luta mais inteiro do que entrou. A seção 4 prova a ficha
     FERIDA de propósito (vida bem abaixo de vidaMax): numa ficha cheia,
     curar e não curar devolvem o mesmo número e a asserção passaria verde
     por acidente.
   · Que o poço vire POUPANÇA entre dois lançamentos. Acumular é como o
     escudo de uma batida vira o escudo de sempre; foi por isso que o
     abrigo (`absorverDano`) some depois de uma batida só, e o temporário
     herda o mesmo desenho pelo lado do lançamento.
   · Que o EMPATE pisque na tela. Oferecer o mesmo número que já está de
     pé não é um ganho: a seção 4 cobra a MESMA REFERÊNCIA de volta
     (`r.pers === p`), que é a única forma de o App não reescrever estado
     nem imprimir linha por uma decisão que não aconteceu.
   · Que o herói caia COM ESCUDO DE PÉ. É a junta com Q1 e o motivo de a
     fase existir: se o temporário for consumido DEPOIS de a porta da
     queda decidir, um golpe que a ficha aguentava leva-a a 0 e a cena da
     queda acontece com o poço ainda cheio. A seção 7 mostra o mesmo golpe
     duas vezes — com poço ninguém pergunta nada à porta, sem poço a porta
     responde `cai`.
   · Que a REGRESSÃO apareça em quem não tem temporário nenhum. Toda ficha
     do jogo de hoje é uma dessas, e `absorverDano` está no caminho de
     TODO dano que chega a um corpo (sete sítios do App mais a arena, v.
     `teste-efeitos` seção 14). A seção 7 prova os dois casos sem poço —
     com abrigo e sem abrigo — contra os números que `teste-efeitos` já
     pina, e não contra uma expectativa reescrita aqui.
   · Que a `linha` de `absorverDano` cresça. O App faz
     `.replace("🛡 ", ...)` nela; a voz do poço sai por uma chave NOVA
     (`linhaDoTemporario`), e a seção 7 guarda essa separação.
   · Que o poço expirado fique pendurado como `{ pv: 0 }`. Um campo morto
     na ficha é um campo que o save carrega, que o veredito lê como
     "temporário de pé" e que a tela mostra a zero. Seções 5 e 6.
   · Que o sistema passe a falar de si mesmo. Seção 10: nenhuma frase de
     tela deste órgão pode conter as palavras do bastidor.

   O QUE ESTA SUÍTE DELIBERADAMENTE NÃO PROVA:

   · A FIAÇÃO NO APP. V1 é módulo puro mais a chave nova em `absorverDano`
     — não há tela, não há save, não há botão. A seção "ligado ao jogo"
     das suítes irmãs (`teste-efeitos` 14, `teste-queda` 8) nasce na etapa
     que ligar, e uma âncora escrita aqui antes disso seria uma âncora
     inventada.
   · DE ONDE O POÇO VEM. Qual habilidade, qual milagre, qual poção o
     concede é catálogo, e catálogo é outra etapa; aqui prova-se o que o
     poço FAZ depois de existir, venha de onde vier.
   · O NÚMERO EXATO das colunas de `PV_TEMPORARIO`. `teto`,
     `turnosPadrao` e `turnosMax` estão a ser medidos, e nenhuma asserção
     deste arquivo os crava: toda conta LÊ a tabela e deriva dali
     (`teto + 1` para provar o aparo, `minimo - 1` para provar a recusa).
     É a lei "se é número, é tabela" aplicada à prova — uma suíte que
     cravasse 10 ficaria vermelha no dia do reequilíbrio sem que nada de
     errado tivesse acontecido. O que ESTÁ cravado são as duas RELAÇÕES
     entre tabelas (seção 1), porque relação entre tabelas é desenho, e
     desenho tem de passar por aqui para mudar.

   Determinística de ponta a ponta: o módulo é tabela e aritmética, não
   rola dado nenhum, e a seção 1 cobra isso por leitura da fonte.        */

const RAIZ = "../src/";
const T = await import(RAIZ + "temporario.js");
/* as duas tabelas vizinhas entram para as CATRACAS DE RELAÇÃO da seção 1 —
   é assim que esta casa impede dois donos do mesmo número (o molde é
   `GOLPE_NO_CAIDO.falhasAteMorrer` espelhando o literal de `combate.js`) */
const { ABSORCAO_DO_BUFF, LIMITES_DO_EFEITO, absorverDano } = await import(RAIZ + "efeitos.js");
/* e a porta da queda entra para a seção 7: a prova de que o poço é gasto
   ANTES de alguém perguntar "cai ou morre?" */
const { quedaAoChegarAZero } = await import(RAIZ + "queda.js");
const { readFileSync } = await import("node:fs");

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

const {
  PV_TEMPORARIO, temporarioDe, vereditoDoTemporario,
  ganharTemporario, gastarTemporario, tickTemporario,
} = T;

const FONTE = readFileSync(RAIZ + "temporario.js", "utf8");

/* um herói FERIDO de propósito: `vida` bem abaixo de `vidaMax` é o que torna
   a lei "não cura" observável. Numa ficha cheia, curar e não curar dão o
   mesmo número e a asserção passa verde sem provar nada. */
const ferido = (extra = {}) => ({
  nome: "Orin", classe: "Guerreiro", nivel: 5, lado: "heroi",
  vida: 7, vidaMax: 30, efeitos: [], ...extra,
});
const comPoco = (pv, turnos = 3, extra = {}) =>
  ferido({ temporario: { pv, turnos, fonte: "Bênção de Pedra" }, ...extra });
const comAbrigo = (n) => ferido({ efeitos: [{ nome: "Véu de Bronze", absorve: n, turnos: 3 }] });
const inteiroPositivo = (n) => Number.isInteger(n) && n > 0;
/* o campo AUSENTE e o campo `null` querem dizer a mesma coisa — "sem poço" —,
   e a prova aceita as duas grafias porque o contrato pede que ele SAIA da
   ficha, não uma grafia específica de saída */
const semPoco = (p) => p && p.temporario == null;

sec("1. OS SEIS NOMES, A TABELA, E AS DUAS CATRACAS DE RELAÇÃO");
{
  /* A CATRACA DE `teste-ligacao` EM PESSOA (o molde é `teste-queda` §1): a
     lista de exports sai da FONTE, não de uma cópia à mão, para que um export
     novo em `temporario.js` apareça nesta asserção no dia em que nascer — e
     não na versão em que alguém reparar. */
  const exportados = [...FONTE.matchAll(/^export (?:async )?(?:function|const|class) ([A-Za-z_][A-Za-z0-9_]*)/gm)].map((m) => m[1]);
  const lidos = { PV_TEMPORARIO, temporarioDe, vereditoDoTemporario, ganharTemporario, gastarTemporario, tickTemporario };
  const semLeitor = exportados.filter((n) => lidos[n] === undefined);
  t("esta suíte é o segundo leitor de TODO export de `temporario.js`", semLeitor.length === 0, semLeitor.join(", "));
  t("e não lê nome que o módulo não exporta",
    Object.keys(lidos).every((n) => exportados.includes(n)),
    Object.keys(lidos).filter((n) => !exportados.includes(n)).join(", "));
  t("os seis nomes do contrato estão todos de pé",
    typeof PV_TEMPORARIO === "object" && [temporarioDe, vereditoDoTemporario, ganharTemporario, gastarTemporario, tickTemporario].every((f) => typeof f === "function"));
  console.log("      " + exportados.length + " exports: " + exportados.join(" · "));
}

/* Sem o contrato mínimo não há o que provar, e deixar as 200 asserções
   seguintes estourarem uma a uma esconderia a única falha que interessa. */
if (!PV_TEMPORARIO || typeof ganharTemporario !== "function" || typeof gastarTemporario !== "function"
  || typeof tickTemporario !== "function" || typeof temporarioDe !== "function" || typeof vereditoDoTemporario !== "function") {
  console.log("\n  XX  o módulo não entrega o contrato mínimo — o resto da suíte não pode correr.");
  console.log(`\n${bons} ok · ${maus + 1} falhas`);
  process.exit(1);
}

/* OS DOIS NÚMEROS DA REGRA DITADA ("+4 e +10"), traduzidos para a faixa que a
   tabela declara HOJE. A pessoa deu o par em números concretos; a suíte não os
   crava, porque `teto` está a ser medido e um reequilíbrio legítimo não pode
   ficar vermelho aqui. O que importa da frase é a RELAÇÃO — dois números
   válidos e diferentes —, e é ela que a tabela fornece. */
const POUCO = PV_TEMPORARIO.minimo;
const MUITO = PV_TEMPORARIO.teto;

sec("2. A TABELA — a faixa, o prazo, e o padrão declarado");
{
  const P = PV_TEMPORARIO;
  t("o piso e o teto são uma faixa utilizável", inteiroPositivo(P.minimo) && inteiroPositivo(P.teto) && P.minimo < P.teto,
    `${P.minimo}..${P.teto}`);
  t("o prazo padrão cabe no prazo máximo", inteiroPositivo(P.turnosPadrao) && inteiroPositivo(P.turnosMax) && P.turnosPadrao <= P.turnosMax,
    `${P.turnosPadrao}/${P.turnosMax}`);
  /* `escolhaPadrao` é a frase da pessoa virada coluna: "ou o sistema escolhe
     automaticamente o maior". Escrito na tabela, e não enterrado num `if`,
     porque no dia em que a mesa quiser oferecer a escolha ao jogador é esta
     coluna que muda — e a seção 3 lê-a de volta em vez de recopiar "maior". */
  t("a tabela declara o padrão da escolha, e hoje é o maior", P.escolhaPadrao === "maior", String(P.escolhaPadrao));

  /* ---- CATRACA DE RELAÇÃO 1: o poço não pode ter teto maior que o abrigo ----
     O MOTIVO, escrito porque uma desigualdade sem motivo é um número solto:
     o abrigo (`ABSORCAO_DO_BUFF`) come UMA batida e desfaz-se — pago uma vez,
     gasto uma vez. O poço temporário ATRAVESSA batidas: sobra do primeiro
     golpe, espera o segundo, e ainda tem prazo em turnos. Ponto por ponto, o
     poço vale MAIS que o abrigo, logo não pode custar o mesmo nem chegar mais
     alto. Se um dia o teto do poço passar o do abrigo, a defensiva de uma
     batida vira troco e ninguém mais a compra — que é como uma das duas
     metades morre em silêncio. */
  t("o teto do poço não passa o teto do abrigo (o que atravessa batidas vale mais por ponto)",
    PV_TEMPORARIO.teto <= ABSORCAO_DO_BUFF.teto, `poço ${PV_TEMPORARIO.teto} vs abrigo ${ABSORCAO_DO_BUFF.teto}`);

  /* ---- CATRACA DE RELAÇÃO 2: o prazo vindo de fora tem um teto só ----
     `LIMITES_DO_EFEITO.turnosMax` é o prazo máximo que esta casa aceita de
     quem chega de fora (o canal do Mestre, a poção, o save antigo). O poço é
     mais uma promessa com prazo e não pode ter uma régua própria: duas
     réguas para a mesma pergunta são duas verdades, e a segunda é sempre a
     que ninguém lembra de atualizar. */
  t("o prazo máximo do poço cabe no prazo máximo que a casa dá a prazo de fora",
    PV_TEMPORARIO.turnosMax <= LIMITES_DO_EFEITO.turnosMax, `poço ${PV_TEMPORARIO.turnosMax} vs casa ${LIMITES_DO_EFEITO.turnosMax}`);

  /* toda coluna numérica é inteiro — o poço é somado e subtraído de PV, e PV
     é inteiro em todo o resto do jogo (`absorverDano` arredonda o dano de
     propósito, v. `teste-efeitos` §13) */
  t("toda coluna numérica da tabela é inteiro não-negativo",
    ["minimo", "teto", "turnosPadrao", "turnosMax"].every((k) => Number.isInteger(P[k]) && P[k] >= 0),
    JSON.stringify(P));

  /* O MÓDULO É TABELA E ARITMÉTICA: não rola dado, e não fecha círculo com
     `efeitos.js`. O círculo importa de verdade — quem importa quem decide a
     ordem de avaliação dos módulos, e um ciclo aqui é a bomba silenciosa de
     `degraus.js` (v. `teste-queda` §8a). A seta aponta num sentido só:
     `efeitos.js` lê o poço, o poço não lê `efeitos.js`. */
  t("o poço não rola dado nenhum", !/Math\.random|\bd\(\s*\d/.test(FONTE));
  t("e não importa `efeitos.js` — a seta aponta num sentido só",
    !/from\s+["']\.\/efeitos\.js["']/.test(FONTE));
  t("`efeitos.js` é que importa o poço", /from\s+["']\.\/temporario\.js["']/.test(readFileSync(RAIZ + "efeitos.js", "utf8")));
}

sec("3. O VEREDITO — a escolha, e a forma que nunca muda");
{
  /* `vereditoDoTemporario` é o molde de `quedaAoChegarAZero`: devolve SEMPRE
     os cinco campos, inclusive para lixo. Devolver `null` no caso torto
     obrigaria todo chamador a ter o seu próprio plano B, que é como uma
     regra vira três regras. */
  const forma = (r) => !!r && typeof r.atual === "number" && Number.isFinite(r.atual)
    && typeof r.oferta === "number" && Number.isFinite(r.oferta)
    && typeof r.ficaCom === "number" && Number.isFinite(r.ficaCom)
    && typeof r.haEscolha === "boolean" && typeof r.motivo === "string" && !!r.motivo.trim();

  {
    /* A FRASE DA PESSOA, LADO A LADO: "se você tem +4 e usa +10, deve escolher
       qual vai ser, ou o sistema escolhe automaticamente o maior." */
    const sobe = vereditoDoTemporario(comPoco(POUCO), MUITO);
    t("com POUCO de pé e MUITO oferecido, há escolha", forma(sobe) && sobe.haEscolha === true, JSON.stringify(sobe));
    t("e quem fica é o maior — o padrão que a tabela declara",
      sobe.ficaCom === MUITO && sobe.ficaCom === Math.max(sobe.atual, sobe.oferta), JSON.stringify(sobe));
    t("e os dois números aparecem no veredito, para quem quiser escolher à mão",
      sobe.atual === POUCO && sobe.oferta === MUITO);

    /* A ORDEM INVERSA é a mesma pergunta: ter MUITO e receber POUCO também é
       escolher, e a resposta automática continua a ser o maior. Se o veredito
       calasse aqui, o App teria de decidir sozinho no caminho de descida — e
       aí a regra passava a ter dois donos. */
    const desce = vereditoDoTemporario(comPoco(MUITO), POUCO);
    t("com MUITO de pé e POUCO oferecido, há escolha na mesma", forma(desce) && desce.haEscolha === true, JSON.stringify(desce));
    t("e quem fica continua a ser o maior", desce.ficaCom === MUITO);
  }
  {
    /* O EMPATE NÃO É ESCOLHA: dois números iguais não dão o que escolher, e
       oferecer a pergunta seria a mesa a pedir uma decisão sem consequência. */
    const igual = vereditoDoTemporario(comPoco(MUITO), MUITO);
    t("oferta IGUAL ao que está de pé não é escolha", forma(igual) && igual.haEscolha === false, JSON.stringify(igual));
    t("e o que fica é o próprio número", igual.ficaCom === MUITO && igual.atual === igual.oferta);
  }
  {
    /* SEM POÇO DE PÉ não há escolha: há uma oferta e mais nada. */
    const vazio = vereditoDoTemporario(ferido(), MUITO);
    t("sem poço de pé não há escolha nenhuma", forma(vazio) && vazio.haEscolha === false, JSON.stringify(vazio));
    t("e o atual é zero", vazio.atual === 0);
    t("e o que fica é a oferta", vazio.ficaCom === MUITO);
  }
  {
    /* OFERTA INVÁLIDA não abre escolha, mesmo com poço de pé: o contrato diz
       "temporário de pé, oferta VÁLIDA e os dois números diferentes", e abaixo
       do mínimo a oferta não é válida. Perguntar "qual dos dois?" com uma das
       pontas recusada seria a mesa a inventar uma decisão. */
    for (const [rotulo, of] of [["zero", 0], ["negativa", -5], ["abaixo do mínimo", PV_TEMPORARIO.minimo - 1]]) {
      const r = vereditoDoTemporario(comPoco(MUITO), of);
      t(`oferta ${rotulo} não abre escolha`, forma(r) && r.haEscolha === false, JSON.stringify(r));
      t(`oferta ${rotulo} deixa o poço onde estava`, r.ficaCom === MUITO);
    }
  }
  {
    /* PERGUNTAR NÃO ESCREVE. Se o veredito carimbasse a decisão dentro da
       ficha, a segunda leitura do mesmo combatente passaria a ler o carimbo
       em vez da tabela (é a mesma lei de `quedaAoChegarAZero`). */
    const p = comPoco(POUCO);
    const antes = JSON.stringify(p);
    vereditoDoTemporario(p, MUITO); vereditoDoTemporario(p, MUITO);
    t("perguntar não escreve dentro da ficha", JSON.stringify(p) === antes, JSON.stringify(p));
    t("e a mesma ficha dá sempre o mesmo veredito (é tabela, não dado)",
      JSON.stringify(vereditoDoTemporario(p, MUITO)) === JSON.stringify(vereditoDoTemporario({ ...p }, MUITO)));
  }
}

sec("4. GANHAR — não cura, não acumula, e o empate não pisca");
{
  /* ---- (a) NÃO CURA, em CAMINHO NENHUM ----
     A lei mais fácil de quebrar da etapa inteira: somar ao `vida` é uma linha
     a menos de código e uma regra a menos de jogo. A prova varre os cinco
     caminhos que a função tem — aceite, recusa, empate, aparo no teto e lixo —
     porque basta UM deles curar para o herói terminar a luta mais inteiro do
     que entrou, e seria o caminho que ninguém testou. */
  const CAMINHOS = [
    ["aceite (poço novo)", ferido(), MUITO],
    ["aceite (troca por maior)", comPoco(POUCO), MUITO],
    ["recusa (oferta menor)", comPoco(MUITO), POUCO],
    ["empate", comPoco(MUITO), MUITO],
    ["aparo no teto", ferido(), PV_TEMPORARIO.teto + 1],
    ["recusa (abaixo do mínimo)", ferido(), PV_TEMPORARIO.minimo - 1],
    ["oferta em objeto", ferido(), { pv: MUITO, turnos: 2, fonte: "Bênção de Pedra" }],
    ["oferta lixo (null)", ferido(), null],
    ["oferta lixo ({})", ferido(), {}],
    ["oferta lixo (NaN)", ferido(), NaN],
  ];
  const curou = [], curouMax = [];
  for (const [rotulo, p, of] of CAMINHOS) {
    const r = ganharTemporario(p, of);
    if (!r || r.pers.vida !== p.vida) curou.push(rotulo);
    if (!r || r.pers.vidaMax !== p.vidaMax) curouMax.push(rotulo);
  }
  t("ganhar poço NUNCA mexe em `vida` — nos dez caminhos", curou.length === 0, curou.join(", "));
  t("e NUNCA mexe em `vidaMax`", curouMax.length === 0, curouMax.join(", "));
  t("a ficha ferida continua ferida depois de ganhar o maior poço possível",
    ganharTemporario(ferido(), PV_TEMPORARIO.teto).pers.vida === 7);
  /* e o inverso, que é o outro lado do mesmo engano: o poço não SAI de `vida`
     nem a rebaixa para se pagar */
  t("e o poço não se paga com PV real", ganharTemporario(ferido(), MUITO).pers.vida === ferido().vida);

  /* ---- (b) NÃO ACUMULA, em nenhuma ordem ----
     "+4 e +10" da frase da pessoa, nos números que a tabela declara hoje. A
     soma (POUCO + MUITO) é calculada e negada explicitamente para que a
     asserção diga o que impede, e não só o que espera. */
  {
    const um = ganharTemporario(ferido(), POUCO);
    const dois = ganharTemporario(um.pers, MUITO);
    t("POUCO depois MUITO: fica MUITO", temporarioDe(dois.pers) === MUITO, String(temporarioDe(dois.pers)));
    t("e NUNCA a soma dos dois", temporarioDe(dois.pers) !== POUCO + MUITO, `${POUCO}+${MUITO}`);
    t("o veredito e o resultado concordam", dois.depois === MUITO && dois.antes === POUCO);
  }
  {
    const um = ganharTemporario(ferido(), MUITO);
    const dois = ganharTemporario(um.pers, POUCO);
    t("MUITO depois POUCO: fica MUITO — o maior, como a tabela manda", temporarioDe(dois.pers) === MUITO, String(temporarioDe(dois.pers)));
    t("e também nunca a soma", temporarioDe(dois.pers) !== POUCO + MUITO);
    /* recusar não pisca: nada mudou, então nada tem de aparecer na tela.
       Mesma disciplina do empate, e pelo mesmo motivo. */
    t("a oferta menor não é aceite", dois.aceito === false, JSON.stringify(dois.aceito));
    t("e não escreve linha nenhuma", dois.linha === "", JSON.stringify(dois.linha));
    t("mas ainda diz PORQUÊ, para o log", typeof dois.motivo === "string" && !!dois.motivo.trim());
  }
  {
    /* TRÊS LANÇAMENTOS SEGUIDOS do mesmo número: um escudo relançado não é
       uma poupança que engorda. É o mesmo dente que `empilhar` guarda para os
       efeitos ("o novo vence", v. `teste-efeitos` §13). */
    let p = ferido();
    for (let i = 0; i < 3; i++) p = ganharTemporario(p, MUITO).pers;
    t("três lançamentos do mesmo poço continuam a dar UM poço", temporarioDe(p) === MUITO, String(temporarioDe(p)));
  }

  /* ---- (c) O EMPATE: a asserção mais fina da etapa ----
     Oferecer exatamente o que já está de pé não é um ganho, e o contrato é
     mais duro do que "não muda o número": a ficha volta pela MESMA
     REFERÊNCIA. É o que impede o App de reescrever estado (e disparar um
     render, e um autosave) por uma decisão que não aconteceu. Um `{ ...pers }`
     devolvido aqui passaria em toda asserção de valor e falharia só esta. */
  {
    const p = comPoco(MUITO);
    const antes = JSON.stringify(p);
    const r = ganharTemporario(p, MUITO);
    t("o empate devolve a MESMA ficha, não uma cópia", r.pers === p);
    t("o empate não é aceite", r.aceito === false, JSON.stringify(r.aceito));
    t("o empate não escreve linha", r.linha === "", JSON.stringify(r.linha));
    t("e nada na ficha mudou", JSON.stringify(p) === antes);
    t("o poço continua exatamente o que era", temporarioDe(r.pers) === MUITO);
    t("e os dois lados do veredito batem", r.antes === MUITO && r.depois === MUITO);
    t("mas o motivo é escrito, sempre", typeof r.motivo === "string" && !!r.motivo.trim());
  }

  /* ---- (d) OS LIMITES: o teto apara, o piso recusa ---- */
  {
    const acima = ganharTemporario(ferido(), PV_TEMPORARIO.teto + 1);
    t("oferta acima do teto é APARADA no teto", temporarioDe(acima.pers) === PV_TEMPORARIO.teto, String(temporarioDe(acima.pers)));
    t("e ainda assim é um aceite — aparar não é recusar", acima.aceito === true);
    t("o `depois` é o número aparado, não o pedido", acima.depois === PV_TEMPORARIO.teto);
    t("nem uma oferta absurda passa do teto", temporarioDe(ganharTemporario(ferido(), 999).pers) === PV_TEMPORARIO.teto);

    const abaixo = ganharTemporario(ferido(), PV_TEMPORARIO.minimo - 1);
    t("oferta abaixo do mínimo é RECUSADA", abaixo.aceito === false, JSON.stringify(abaixo));
    t("e não deixa um poço raquítico na ficha", temporarioDe(abaixo.pers) === 0 && semPoco(abaixo.pers), JSON.stringify(abaixo.pers.temporario));
    t("nem escreve linha", abaixo.linha === "");

    t("a oferta no mínimo exato é aceite", ganharTemporario(ferido(), PV_TEMPORARIO.minimo).aceito === true);
    t("e a oferta no teto exato também", ganharTemporario(ferido(), PV_TEMPORARIO.teto).aceito === true);
  }

  /* ---- (e) O PRAZO que vem junto com o poço ---- */
  {
    const cru = ganharTemporario(ferido(), MUITO);
    t("um número cru ganha o prazo padrão da tabela",
      cru.pers.temporario.turnos === PV_TEMPORARIO.turnosPadrao, String(cru.pers.temporario.turnos));
    const obj = ganharTemporario(ferido(), { pv: MUITO, turnos: 2, fonte: "Bênção de Pedra" });
    t("uma oferta em objeto traz o próprio prazo", obj.pers.temporario.turnos === 2, String(obj.pers.temporario.turnos));
    t("e a fonte atravessa até à ficha", obj.pers.temporario.fonte === "Bênção de Pedra");
    t("o poço da oferta em objeto é o `pv` dela", temporarioDe(obj.pers) === MUITO);
    /* o prazo vindo de fora é APARADO pelo mesmo teto que a casa dá a todo
       prazo de fora (a catraca de relação 2, seção 2) — senão o canal do
       Mestre ou um save antigo plantaria um poço de cinquenta turnos */
    const longo = ganharTemporario(ferido(), { pv: MUITO, turnos: PV_TEMPORARIO.turnosMax + 5 });
    t("prazo acima do máximo é aparado no máximo",
      longo.pers.temporario.turnos === PV_TEMPORARIO.turnosMax, String(longo.pers.temporario.turnos));
    const semPrazo = ganharTemporario(ferido(), { pv: MUITO });
    t("oferta em objeto sem prazo cai no prazo padrão",
      semPrazo.pers.temporario.turnos === PV_TEMPORARIO.turnosPadrao, String(semPrazo.pers.temporario.turnos));
  }

  /* ---- (f) A FORMA, sempre a mesma ---- */
  {
    const r = ganharTemporario(ferido(), MUITO);
    t("o resultado tem as seis chaves do contrato",
      !!r && typeof r.pers === "object" && typeof r.antes === "number" && typeof r.depois === "number"
      && typeof r.aceito === "boolean" && typeof r.motivo === "string" && typeof r.linha === "string",
      JSON.stringify(Object.keys(r || {})));
    t("`aceito` é booleano de verdade, nunca um número que mente", r.aceito === true);
    t("e o aceite ESCREVE linha — o jogador tem de ver o que ganhou", r.linha.length > 0);
  }

  /* ---- (g) IMUTABILIDADE ---- */
  {
    const p = comPoco(POUCO);
    const poco = p.temporario;
    const antes = JSON.stringify(p);
    const r = ganharTemporario(p, MUITO);
    t("a ficha de entrada sai da chamada idêntica", JSON.stringify(p) === antes, JSON.stringify(p));
    t("o poço antigo não foi reescrito por dentro", p.temporario === poco && poco.pv === POUCO);
    t("a ficha devolvida é OUTRA", r.pers !== p);
    t("e o poço devolvido é outro objeto", r.pers.temporario !== poco);
    t("o que não é o poço atravessa sem toque",
      r.pers.nome === p.nome && r.pers.classe === p.classe && r.pers.efeitos === p.efeitos);
  }
}

sec("5. GASTAR — o poço come o golpe, guarda a sobra, e some quando seca");
{
  /* `gastarTemporario` é o molde de `absorverDano`: devolve o dano que SOBROU
     (não o que entrou), quanto foi absorvido, e a ficha nova. */
  {
    /* GOLPE MENOR que o poço: o poço guarda a sobra. É aqui que ele se separa
       do abrigo — o abrigo some mesmo quando o golpe foi pequeno ("escudo não
       é poupança", `teste-efeitos` §13); o poço é uma segunda barra de PV e
       comporta-se como PV: o que não foi gasto continua lá. */
    const p = comPoco(MUITO);
    const r = gastarTemporario(p, MUITO - 1);
    t("golpe menor que o poço: nada chega ao PV real", r.dano === 0, String(r.dano));
    t("e o poço absorveu exatamente o golpe", r.absorvido === MUITO - 1, String(r.absorvido));
    t("e guarda a sobra para a próxima batida", temporarioDe(r.pers) === 1, String(temporarioDe(r.pers)));
    t("a soma fecha: o que parou mais o que chegou é o golpe inteiro", r.absorvido + r.dano === MUITO - 1);
  }
  {
    /* GOLPE MAIOR que o poço: o resto passa, e o campo SAI da ficha — não
       fica um `{ pv: 0 }` pendurado que o save carrega e o veredito lê como
       "poço de pé". */
    const p = comPoco(POUCO);
    const r = gastarTemporario(p, POUCO + 9);
    t("golpe maior que o poço: o resto chega ao PV real", r.dano === 9, String(r.dano));
    t("e o poço levou só o que tinha (não inventa absorção)", r.absorvido === POUCO);
    t("e o campo SAI da ficha quando seca", semPoco(r.pers), JSON.stringify(r.pers.temporario));
    t("e `temporarioDe` concorda que não há poço", temporarioDe(r.pers) === 0);
  }
  {
    const p = comPoco(MUITO);
    const r = gastarTemporario(p, MUITO);
    t("golpe do tamanho exato do poço: nada chega e o campo sai",
      r.dano === 0 && r.absorvido === MUITO && semPoco(r.pers), JSON.stringify(r));
  }
  {
    /* DUAS BATIDAS: a sobra da primeira é o poço da segunda. É o contrário do
       abrigo, e é o que faz do temporário uma barra e não um escudo. */
    const um = gastarTemporario(comPoco(MUITO), MUITO - 1);
    const dois = gastarTemporario(um.pers, 5);
    t("a sobra da primeira batida absorve a segunda", dois.absorvido === 1, String(dois.absorvido));
    t("e o resto da segunda chega ao PV real", dois.dano === 4, String(dois.dano));
    t("e agora sim o campo saiu", semPoco(dois.pers));
  }
  {
    /* GASTAR NÃO CURA, do outro lado da mesma lei. */
    const p = comPoco(MUITO);
    const r = gastarTemporario(p, 3);
    t("gastar não mexe em `vida`", r.pers.vida === p.vida);
    t("nem em `vidaMax`", r.pers.vidaMax === p.vidaMax);
  }
  {
    /* SEM POÇO: regressão pura — o dano sai intacto e nada é tocado. */
    const p = ferido();
    const r = gastarTemporario(p, 9);
    t("sem poço, o dano sai intacto", r.dano === 9 && r.absorvido === 0);
    t("e a linha é vazia — o sítio nem toca na ficha", r.linha === "");
    t("e a ficha volta a MESMA (identidade, não cópia)", r.pers === p);
  }
  {
    /* DANO ZERO, NEGATIVO E TORTO: o poço tem de sobreviver a um golpe que
       não aconteceu. Gastá-lo ali seria o jogador perder o que ganhou por uma
       rolagem que errou — o mesmo dente que `absorverDano` já guarda. */
    const p = comPoco(MUITO);
    for (const [rotulo, d] of [["zero", 0], ["negativo", -8], ["NaN", NaN], ["undefined", undefined], ["null", null], ["texto", "abc"]]) {
      const r = gastarTemporario(p, d);
      t(`dano ${rotulo}: nada é gasto`, r.absorvido === 0 && r.linha === "", JSON.stringify(r));
      t(`dano ${rotulo}: o poço continua de pé`, temporarioDe(r.pers) === MUITO);
      t(`dano ${rotulo}: o dano devolvido é 0, nunca negativo`, r.dano === 0);
    }
  }
  {
    /* o dano chega ARREDONDADO e nunca negativo — quem soma PV do outro lado
       conta com inteiro, e é o que `absorverDano` já garante */
    const r = gastarTemporario(comPoco(MUITO), 1.6);
    t("dano fracionário é arredondado antes de encontrar o poço", Number.isInteger(r.dano) && Number.isInteger(r.absorvido),
      JSON.stringify(r));
  }
  {
    /* A FORMA e a IMUTABILIDADE */
    const p = comPoco(MUITO);
    const poco = p.temporario;
    const antes = JSON.stringify(p);
    const r = gastarTemporario(p, 3);
    t("o resultado tem as quatro chaves do contrato",
      typeof r.pers === "object" && typeof r.dano === "number" && typeof r.absorvido === "number" && typeof r.linha === "string",
      JSON.stringify(Object.keys(r)));
    t("a ficha de entrada sai da chamada idêntica", JSON.stringify(p) === antes, JSON.stringify(p));
    t("o poço de entrada não foi reescrito por dentro", p.temporario === poco && poco.pv === MUITO);
    t("a ficha devolvida é outra", r.pers !== p);
    t("e o resto da ficha atravessa sem toque", r.pers.nome === p.nome && r.pers.efeitos === p.efeitos);
  }
}

sec("6. O PRAZO — o relógio desconta, e o poço vencido sai da ficha");
{
  {
    /* UM TIQUE: desconta um turno e mais nada. O `pv` não encolhe com o tempo
       — o poço vence de uma vez, não se dissolve. */
    const p = comPoco(MUITO, PV_TEMPORARIO.turnosMax);
    const r = tickTemporario(p);
    t("o tique desconta exatamente um turno", r.pers.temporario.turnos === PV_TEMPORARIO.turnosMax - 1,
      String(r.pers.temporario.turnos));
    t("e o poço em si não encolhe com o tempo", temporarioDe(r.pers) === MUITO);
    t("e `msgs` é sempre uma lista", Array.isArray(r.msgs));
    /* nada a dizer enquanto o poço está de pé: uma mensagem por turno seria a
       mesa a narrar a contagem em vez da ficção */
    t("e enquanto o poço está de pé o relógio cala", r.msgs.length === 0, JSON.stringify(r.msgs));
  }
  {
    /* ATÉ VENCER: o campo SAI da ficha, e entra UMA mensagem. O laço tem teto
       para que um poço que nunca vence dê asserção vermelha em vez de pendurar
       a suíte (o molde é `teste-efeitos` §3). */
    let p = comPoco(MUITO, PV_TEMPORARIO.turnosPadrao);
    let n = 0, ultimas = [];
    while (temporarioDe(p) > 0 && n < 200) { const r = tickTemporario(p); p = r.pers; ultimas = r.msgs; n++; }
    t("o poço vence, e vence no prazo que a ficha trazia", n === PV_TEMPORARIO.turnosPadrao, `venceu em ${n}`);
    t("e o campo SAI da ficha — nada de `{ pv: 0 }` pendurado", semPoco(p), JSON.stringify(p.temporario));
    t("e o tique que o venceu escreveu uma mensagem", ultimas.length === 1, JSON.stringify(ultimas));
    t("e a mensagem é frase de verdade, não `undefined`",
      typeof ultimas[0] === "string" && ultimas[0].trim().length > 0 && !/undefined/.test(ultimas[0]), JSON.stringify(ultimas));
    t("o tique seguinte não diz mais nada", tickTemporario(p).msgs.length === 0);
    t("e não mexe em `vida` nem quando vence", p.vida === ferido().vida && p.vidaMax === ferido().vidaMax);
  }
  {
    /* SEM POÇO: o relógio não tem o que fazer e não pode inventar campo. */
    const p = ferido();
    const r = tickTemporario(p);
    t("sem poço, o relógio não escreve nada", r.msgs.length === 0 && semPoco(r.pers));
    t("e devolve a MESMA ficha (identidade, não cópia)", r.pers === p);
  }
  {
    /* IMUTABILIDADE e FORMA */
    const p = comPoco(MUITO, PV_TEMPORARIO.turnosMax);
    const poco = p.temporario;
    const antes = JSON.stringify(p);
    const r = tickTemporario(p);
    t("o resultado tem as duas chaves do contrato", typeof r.pers === "object" && Array.isArray(r.msgs),
      JSON.stringify(Object.keys(r)));
    t("a ficha de entrada sai do relógio idêntica", JSON.stringify(p) === antes, JSON.stringify(p));
    t("o poço de entrada não foi reescrito por dentro", p.temporario === poco && poco.turnos === PV_TEMPORARIO.turnosMax);
    t("a ficha devolvida é outra", r.pers !== p);
  }
}

sec("7. A ORDEM DO DANO — abrigo, depois poço, depois carne, e só então a porta");
{
  /* A SECÇÃO QUE JUSTIFICA A ETAPA. A ordem é:
       abrigo (`absorve`, família de P3) → poço temporário → PV real
       → e SÓ ENTÃO `quedaAoChegarAZero`.
     Cada troca de lugar nessa fila é um bug de mesa diferente, e as
     asserções abaixo estão escritas para apanhar cada uma delas. */

  const ABRIGO = ABSORCAO_DO_BUFF.minimo;
  const POCO = PV_TEMPORARIO.teto;
  const SOBRA = 1;
  const GOLPE = ABRIGO + POCO - SOBRA;
  t("as duas tabelas deixam montar o golpe da prova (a prova não é vazia)",
    ABRIGO >= 1 && POCO - SOBRA >= 1 && GOLPE > ABRIGO, `abrigo ${ABRIGO} · poço ${POCO} · golpe ${GOLPE}`);

  const comOsDois = () => ferido({
    efeitos: [{ nome: "Véu de Bronze", absorve: ABRIGO, turnos: 3 }],
    temporario: { pv: POCO, turnos: 3, fonte: "Bênção de Pedra" },
  });

  {
    const p = comOsDois();
    const r = absorverDano(p, GOLPE);

    /* A PROVA DA ORDEM, e ela é indireta de propósito porque é assim que se
       prova ordem sem espiar o código: se o POÇO mordesse primeiro, ele teria
       comido o golpe inteiro até secar (GOLPE > POCO) e o campo sairia da
       ficha; o abrigo comeria o resto e o poço estaria em ZERO. Com o abrigo
       primeiro, o poço fica com exatamente SOBRA. O número final do poço é a
       assinatura da ordem. */
    t("o poço guarda a sobra — logo o abrigo mordeu PRIMEIRO",
      temporarioDe(r.pers) === SOBRA, `ficou ${temporarioDe(r.pers)}, esperava ${SOBRA}`);
    t("e o abrigo gastou-se inteiro e saiu da ficha (é de UMA batida)",
      r.pers.efeitos.length === 0, JSON.stringify(r.pers.efeitos));
    t("nada chegou ao PV real", r.dano === 0, String(r.dano));
    t("e o PV real não foi tocado pelo órgão", r.pers.vida === p.vida && r.pers.vidaMax === p.vidaMax);

    /* AS DUAS CONTAS: `absorvido` é o TOTAL, `doTemporario` é a parte do poço,
       e a diferença entre os dois é a parte do abrigo. Devolver só o total
       deixaria o App sem como narrar os dois lados. */
    t("`absorvido` é o TOTAL — abrigo mais poço", r.absorvido === GOLPE, `${r.absorvido} vs ${GOLPE}`);
    t("`doTemporario` é a parte do poço", r.doTemporario === POCO - SOBRA, `${r.doTemporario} vs ${POCO - SOBRA}`);
    t("e a diferença entre os dois é a parte do abrigo", r.absorvido - r.doTemporario === ABRIGO);
    t("a soma fecha: o que parou mais o que chegou é o golpe inteiro", r.absorvido + r.dano === GOLPE);

    /* A LINHA NÃO CRESCEU. O App faz `.replace("🛡 ", ...)` nela; se a voz do
       poço entrasse por aí, o `replace` cortaria o prefixo de uma frase e
       deixaria a outra pela metade. A chave é NOVA. */
    t("`linha` continua a ser só a do abrigo — e traz o prefixo que o App corta",
      r.linha.startsWith("🛡 ") && r.linha.includes("Véu de Bronze"), JSON.stringify(r.linha));
    t("e a voz do poço sai por uma chave NOVA", typeof r.linhaDoTemporario === "string" && r.linhaDoTemporario.length > 0,
      JSON.stringify(r.linhaDoTemporario));
    t("que não é a mesma frase", r.linhaDoTemporario !== r.linha);

    /* O GOLPE SEGUINTE come a sobra, e agora sim o campo sai. */
    const dois = absorverDano(r.pers, SOBRA + 5);
    t("o golpe seguinte come a sobra do poço", dois.doTemporario === SOBRA, String(dois.doTemporario));
    t("e o resto chega ao PV real", dois.dano === 5, String(dois.dano));
    t("e agora o campo saiu da ficha", semPoco(dois.pers), JSON.stringify(dois.pers.temporario));
  }

  {
    /* ---- REGRESSÃO ZERO: quem NÃO tem poço volta exatamente o que voltava ----
       Toda ficha do jogo de hoje é uma dessas, e `absorverDano` está no
       caminho de TODO dano que chega a um corpo (sete sítios do App mais a
       arena, v. `teste-efeitos` §14). Os três números abaixo são COPIADOS de
       `teste-efeitos` §13 de propósito: se divergirem, uma das duas suítes
       está errada e é essa a informação que se quer. */
    const p = comAbrigo(4);
    const r = absorverDano(p, 10);
    t("com abrigo e sem poço: o dano é o mesmo de sempre", r.dano === 6, String(r.dano));
    t("e o absorvido é o mesmo de sempre", r.absorvido === 4, String(r.absorvido));
    t("e a linha é a mesma de sempre — prefixo, nome e os dois números",
      r.linha.startsWith("🛡 ") && r.linha.includes("Véu de Bronze") && r.linha.includes("4") && r.linha.includes("6"),
      JSON.stringify(r.linha));
    t("e as duas chaves novas vêm neutras", r.doTemporario === 0 && r.linhaDoTemporario === "", JSON.stringify(r));
    t("e o abrigo some, como sempre somiu", r.pers.efeitos.length === 0);

    const nu = ferido();
    const rn = absorverDano(nu, 10);
    t("sem abrigo e sem poço: o dano sai intacto", rn.dano === 10 && rn.absorvido === 0);
    t("a linha continua vazia", rn.linha === "");
    t("as chaves novas continuam neutras", rn.doTemporario === 0 && rn.linhaDoTemporario === "");
    t("e a ficha volta a MESMA (identidade, não cópia)", rn.pers === nu);
  }

  {
    /* AS DUAS CHAVES NOVAS EXISTEM EM TODO CAMINHO DE SAÍDA, inclusive nos
       atalhos de `absorverDano` (dano zero, ficha nula, sem abrigo). Uma
       chave que às vezes não vem obriga o chamador a um `|| 0` próprio, e é
       assim que a mesma conta ganha dois donos. */
    const CAMINHOS = [
      ["dano zero", comOsDois(), 0], ["dano negativo", comOsDois(), -5],
      ["dano NaN", comOsDois(), NaN], ["sem argumentos", undefined, undefined],
      ["ficha null", null, 9], ["ficha {}", {}, 9],
      ["só abrigo", comAbrigo(4), 10], ["só poço", comPoco(MUITO), 3], ["nada", ferido(), 7],
    ];
    const semChave = [];
    for (const [rotulo, p, d] of CAMINHOS) {
      let r;
      try { r = absorverDano(p, d); } catch (e) { semChave.push(rotulo + ":estourou:" + e.message); continue; }
      if (typeof r.doTemporario !== "number" || !Number.isFinite(r.doTemporario) || r.doTemporario < 0
        || typeof r.linhaDoTemporario !== "string") semChave.push(rotulo + "→" + JSON.stringify({ d: r.doTemporario, l: r.linhaDoTemporario }));
    }
    t("as duas chaves novas vêm em TODO caminho de saída de `absorverDano`", semChave.length === 0, semChave.join(" | "));
  }

  {
    /* ---- A ASSERÇÃO QUE LIGA V1 A Q1 ----
       O herói ferido apanha um golpe que, SEM o poço, o levaria a 0 — e a 0
       PV a porta de Q1 decide se ele cai ou morre. Com o poço consumido
       ANTES, o PV real fica acima de zero e a porta nunca chega a ser
       perguntada. Se a ordem se inverter um dia, esta asserção acende: o
       herói cai com o escudo de pé, que é o bug que a fase inteira existe
       para impedir. */
    const SOBRA_DE_VIDA = 3;
    const ATRAVESSA = 2;                       /* o que passa o poço e chega à carne */
    const p = comPoco(POCO, 3, { vida: SOBRA_DE_VIDA });
    const G = POCO + ATRAVESSA;
    t("a prova está bem montada: sem o poço o golpe mata, com o poço não",
      G > SOBRA_DE_VIDA && ATRAVESSA < SOBRA_DE_VIDA, `golpe ${G} · vida ${SOBRA_DE_VIDA} · poço ${POCO}`);

    const comEle = absorverDano(p, G);
    const vidaComEle = p.vida - comEle.dano;
    t("com o poço, o golpe deixa o PV real ACIMA de zero", vidaComEle > 0, `ficou ${vidaComEle}`);
    t("e o poço saiu inteiro — foi ele que pagou", comEle.doTemporario === POCO && semPoco(comEle.pers), JSON.stringify(comEle));

    const nu = { ...p, temporario: null };
    const semEle = absorverDano(nu, G);
    const vidaSemEle = nu.vida - semEle.dano;
    t("sem o poço, o MESMO golpe leva o PV real a zero ou abaixo", vidaSemEle <= 0, `ficou ${vidaSemEle}`);

    /* e o outro lado, dito com a porta de Q1 na mão. O desfecho é LIDO de
       volta da única função que o produz, e não escrito à mão: no dia em que
       "cai" virar outra palavra, esta asserção acompanha sozinha. */
    const DESFECHO_DE_QUEM_CAI = quedaAoChegarAZero({ lado: "heroi" }).desfecho;
    const porta = (quem, vidaDepois) => vidaDepois > 0 ? "ninguém pergunta" : quedaAoChegarAZero(quem).desfecho;
    t("com o poço, a porta da queda NUNCA chega a ser perguntada",
      porta(comEle.pers, vidaComEle) === "ninguém pergunta");
    t("e sem ele a porta responde que o herói cai",
      porta(nu, vidaSemEle) === DESFECHO_DE_QUEM_CAI, porta(nu, vidaSemEle));
    t("— logo o poço é consumido ANTES de a porta decidir, e ninguém cai com escudo de pé",
      vidaComEle > 0 && vidaSemEle <= 0);
  }
}

sec("8. O LIXO — nenhuma das seis estoura, e todas devolvem o prometido");
{
  /* `= {}` NO DESTRUCTURING NÃO COBRE `null` — lei da casa, e foi exatamente
     esse o bug que Q1 teve de consertar na própria suíte
     (`falhasDoGolpeNoCaido(null)`, v9.268). Por isso `null` entra explícito
     em TODAS as listas abaixo, ao lado de `{}` e de `undefined`.
     E o motivo de a varredura ser larga: este órgão mora no caminho de todo
     dano que chega a um corpo, e um órgão que estoura no meio de um turno é
     exatamente o que a casa proíbe. */
  const FICHAS = [
    ["null", null], ["undefined", undefined], ["{}", {}], ["0", 0], ["[]", []],
    ["\"\"", ""], ["\"texto\"", "texto"], ["7", 7], ["true", true], ["false", false], ["NaN", NaN],
    ["{temporario: null}", { temporario: null }],
    ["{temporario: undefined}", { temporario: undefined }],
    ["{temporario: {}}", { temporario: {} }],
    ["{temporario: 7}", { temporario: 7 }],
    ["{temporario: \"x\"}", { temporario: "x" }],
    ["{temporario: []}", { temporario: [] }],
    ["{temporario: {pv: null}}", { temporario: { pv: null } }],
    ["{temporario: {pv: NaN}}", { temporario: { pv: NaN } }],
    ["{temporario: {pv: -5}}", { temporario: { pv: -5 } }],
    ["{temporario: {pv: 0}}", { temporario: { pv: 0 } }],
    ["{temporario: {pv: Infinity}}", { temporario: { pv: Infinity } }],
    ["{temporario: {pv: \"12\"}}", { temporario: { pv: "12" } }],
    ["{temporario: {pv: {}}}", { temporario: { pv: {} } }],
    ["{temporario: {turnos: 3}}", { temporario: { turnos: 3 } }],
  ];
  const OFERTAS = [
    ["null", null], ["undefined", undefined], ["{}", {}], ["NaN", NaN],
    ["\"12\"", "12"], ["-5", -5], ["0", 0], ["Infinity", Infinity], ["-Infinity", -Infinity],
    ["{pv: null}", { pv: null }], ["{pv: {}}", { pv: {} }], ["{pv: NaN}", { pv: NaN }],
    ["{pv: Infinity}", { pv: Infinity }], ["{pv: -5}", { pv: -5 }], ["{pv: \"12\"}", { pv: "12" }],
    ["[]", []], ["true", true], ["\"texto\"", "texto"], ["{turnos: 3}", { turnos: 3 }],
  ];

  /* (a) `temporarioDe` — sempre um número finito, nunca negativo, nunca `NaN`.
     É a leitura mais chamada das seis (o veredito, o gasto e o relógio passam
     por ela), e devolver `NaN` aqui contaminaria toda conta a jusante. */
  {
    let explodiu = "", torto = [];
    for (const [rotulo, f] of FICHAS) {
      try {
        const n = temporarioDe(f);
        if (typeof n !== "number" || !Number.isFinite(n) || n < 0 || !Number.isInteger(n)) torto.push(rotulo + "→" + String(n));
      } catch (e) { explodiu += rotulo + ":" + e.message + " "; }
    }
    t("nenhuma ficha torta explode em `temporarioDe` — nem `null`, nem ausente", explodiu === "", explodiu);
    t("e ela devolve sempre inteiro finito não-negativo", torto.length === 0, torto.join(", "));
    t("`null`, `{}` e lixo dão zero", [null, undefined, {}, 0, "", "texto", [], NaN, true].every((f) => temporarioDe(f) === 0));
    t("e uma ficha com poço de verdade dá o número do poço", temporarioDe(comPoco(MUITO)) === MUITO);
    /* O APARO TEM UM DONO SÓ, e ele é a ENTRADA (`ofertaEmNumero`, dentro de
       `ganharTemporario`) — nunca a leitura. O módulo escreve o argumento com
       todas as letras: "dois sítios a aparar o mesmo número é a forma exata de
       eles divergirem daqui a três versões". A consequência fica REGISTADA
       aqui, nas duas asserções, para que mudar de ideia tenha de passar por
       este arquivo: o que o sistema ESCREVE nunca passa do teto; um `pv: 999`
       injetado à mão (save torto, ficha de teste) é lido como está. */
    t("nenhuma oferta, por maior que seja, põe o poço acima do teto — o aparo mora na ENTRADA",
      temporarioDe(ganharTemporario(ferido(), 999).pers) === PV_TEMPORARIO.teto,
      String(temporarioDe(ganharTemporario(ferido(), 999).pers)));
    t("e a leitura é honesta: o que está escrito na ficha é o que ela devolve",
      temporarioDe({ temporario: { pv: 999 } }) === 999, String(temporarioDe({ temporario: { pv: 999 } })));
  }

  /* (b) `vereditoDoTemporario` — a forma completa para TODO par torto. */
  {
    let explodiu = "", forma = [];
    for (const [rf, f] of FICHAS) for (const [ro, o] of OFERTAS) {
      try {
        const r = vereditoDoTemporario(f, o);
        if (!r || !Number.isFinite(r.atual) || !Number.isFinite(r.oferta) || !Number.isFinite(r.ficaCom)
          || typeof r.haEscolha !== "boolean" || typeof r.motivo !== "string" || !r.motivo.trim()) forma.push(`${rf}/${ro}`);
      } catch (e) { explodiu += `${rf}/${ro}:${e.message} `; }
    }
    t("nenhum par torto explode no veredito", explodiu === "", explodiu.slice(0, 300));
    t("e todo par torto devolve a forma completa, nunca `null`", forma.length === 0, forma.slice(0, 12).join(", "));
    t("e nenhum par torto inventa escolha",
      FICHAS.every(([, f]) => vereditoDoTemporario(f, null).haEscolha === false));
    console.log(`      ${FICHAS.length}×${OFERTAS.length} = ${FICHAS.length * OFERTAS.length} pares tortos varridos`);
  }

  /* (c) `ganharTemporario` — a forma, o teto, e a lei "não cura" outra vez.
     Repetida aqui de propósito: a seção 4 prova os caminhos nomeados, esta
     prova a combinatória, e é na combinatória que o caminho não testado vive. */
  {
    let explodiu = "", forma = [], acima = [], curou = [];
    for (const [rf, f] of FICHAS) for (const [ro, o] of OFERTAS) {
      try {
        const r = ganharTemporario(f, o);
        /* `"pers" in r` e NÃO `r.pers !== undefined`: a ficha torta volta pela
           chave `pers` com o valor que ENTROU — é o molde de `absorverDano`,
           que devolve o que recebeu quando não há o que fazer, e entrar
           `undefined` é sair `undefined`. Exigir um objeto ali seria exigir
           que a função inventasse uma ficha, e uma ficha inventada a subir
           pela fiação é pior que o `undefined` que o chamador já tinha. */
        if (!r || !("pers" in r) || !Number.isFinite(r.antes) || !Number.isFinite(r.depois)
          || typeof r.aceito !== "boolean" || typeof r.motivo !== "string" || typeof r.linha !== "string") { forma.push(`${rf}/${ro}`); continue; }
        if (r.depois > PV_TEMPORARIO.teto || r.depois < 0 || !Number.isInteger(r.depois)) acima.push(`${rf}/${ro}→${r.depois}`);
        if (f && typeof f === "object" && "vida" in f && r.pers && r.pers.vida !== f.vida) curou.push(`${rf}/${ro}`);
      } catch (e) { explodiu += `${rf}/${ro}:${e.message} `; }
    }
    t("nenhum par torto explode em `ganharTemporario`", explodiu === "", explodiu.slice(0, 300));
    t("e todo par torto devolve a forma completa", forma.length === 0, forma.slice(0, 12).join(", "));
    t("e nenhum par torto põe o poço acima do teto (nem `Infinity`, nem `\"12\"`, nem 999)",
      acima.length === 0, acima.slice(0, 12).join(", "));
    t("e nenhum par torto cura ninguém", curou.length === 0, curou.slice(0, 12).join(", "));
    /* a mesma pergunta com a ficha FERIDA em vez das tortas, que é onde o
       engano teria consequência de mesa */
    const curouFerido = OFERTAS.filter(([, o]) => {
      const p = comPoco(POUCO);
      const r = ganharTemporario(p, o);
      return r.pers.vida !== p.vida || r.pers.vidaMax !== p.vidaMax;
    });
    t("nem com a ficha ferida e o poço de pé", curouFerido.length === 0, curouFerido.map(([r]) => r).join(", "));
    t("e sem argumento nenhum também não estoura",
      (() => { try { const r = ganharTemporario(); return typeof r.aceito === "boolean"; } catch { return false; } })());
  }

  /* (d) `gastarTemporario` — a forma, e o dano nunca negativo. */
  {
    /* `Infinity` está na lista de propósito, e a asserção da FORMA aceita-o em
       `dano`: a fórmula de entrada é a MESMA de `absorverDano`
       (`Math.max(0, Math.round(Number(dano) || 0))`, efeitos.js), e lá o golpe
       infinito também sai infinito. Aparar o GOLPE não é trabalho do poço — um
       poço que o aparasse seria a segunda régua do dano, que é a doença que
       esta casa persegue. O que ele não pode é absorver infinito, e isso é a
       asserção separada logo abaixo. */
    const DANOS = [null, undefined, NaN, 0, -5, 3, 999, "7", "abc", Infinity, 2.6, {}];
    let explodiu = "", forma = [], negativo = [];
    for (const [rf, f] of FICHAS) for (const d of DANOS) {
      try {
        const r = gastarTemporario(f, d);
        if (!r || typeof r.dano !== "number" || Number.isNaN(r.dano)
          || !Number.isFinite(r.absorvido) || typeof r.linha !== "string") { forma.push(`${rf}/${String(d)}`); continue; }
        if (r.dano < 0 || r.absorvido < 0 || !Number.isInteger(r.absorvido)
          || (Number.isFinite(r.dano) && !Number.isInteger(r.dano))) negativo.push(`${rf}/${String(d)}→${r.dano}/${r.absorvido}`);
      } catch (e) { explodiu += `${rf}/${String(d)}:${e.message} `; }
    }
    t("nenhum par torto explode em `gastarTemporario`", explodiu === "", explodiu.slice(0, 300));
    t("e todo par torto devolve a forma completa", forma.length === 0, forma.slice(0, 12).join(", "));
    t("e nunca devolve dano ou absorção negativa, nem `NaN`, nem fracionária", negativo.length === 0, negativo.slice(0, 12).join(", "));
    /* o poço só pode parar o que tem — mesmo debaixo de um golpe infinito. Se
       `absorvido` alguma vez saísse infinito daqui, o PV real do outro lado
       viraria `NaN` na primeira subtração. */
    t("e o poço nunca absorve infinito — pára o que tem, e o resto passa",
      gastarTemporario(comPoco(MUITO), Infinity).absorvido === MUITO
      && absorverDano(comPoco(MUITO), Infinity).doTemporario === MUITO,
      JSON.stringify(gastarTemporario(comPoco(MUITO), Infinity)));
    t("e sem argumento nenhum também não estoura",
      (() => { try { const r = gastarTemporario(); return r.dano === 0 && r.absorvido === 0; } catch { return false; } })());
  }

  /* (e) `tickTemporario` — a forma, e nenhum campo inventado. */
  {
    let explodiu = "", forma = [], inventou = [];
    for (const [rf, f] of FICHAS) {
      try {
        const r = tickTemporario(f);
        /* mesma disciplina do `ganharTemporario` acima: a chave tem de EXISTIR,
           e o valor dela é o que entrou quando não há o que fazer */
        if (!r || !("pers" in r) || !Array.isArray(r.msgs)) { forma.push(rf); continue; }
        if (r.msgs.some((m) => typeof m !== "string" || !m.trim() || /undefined|NaN/.test(m))) inventou.push(rf + "→" + JSON.stringify(r.msgs));
        if (temporarioDe(r.pers) > temporarioDe(f)) inventou.push(rf + ": o relógio ENCHEU o poço");
      } catch (e) { explodiu += rf + ":" + e.message + " "; }
    }
    t("nenhuma ficha torta explode no relógio", explodiu === "", explodiu);
    t("e o relógio devolve sempre `{ pers, msgs }`", forma.length === 0, forma.join(", "));
    t("e nunca escreve `undefined` nem enche o poço", inventou.length === 0, inventou.slice(0, 12).join(", "));
    t("e sem argumento nenhum também não estoura",
      (() => { try { return Array.isArray(tickTemporario().msgs); } catch { return false; } })());
  }

  /* (f) `absorverDano` com a ficha torta continua a não estourar — a chave
     nova não podia ter fragilizado a porta por onde passa todo o dano. */
  {
    let explodiu = "";
    for (const [rf, f] of FICHAS) {
      try { absorverDano(f, 9); } catch (e) { explodiu += rf + ":" + e.message + " "; }
    }
    t("e `absorverDano` continua a não estourar com ficha torta", explodiu === "", explodiu);
  }
}

sec("9. AS DUAS PONTAS QUE NÃO PODEM DIVERGIR — o poço tem UM dono");
{
  /* `absorverDano` não pode ter a sua PRÓPRIA aritmética do poço: se ela
     subtrair à mão em vez de chamar `gastarTemporario`, o dia em que o poço
     ganhar uma regra nova (um poço que não absorve veneno, por exemplo)
     passa a ter duas respostas em dois arquivos. A prova não espia o código —
     compara as duas pontas nos mesmos números e cobra o mesmo resultado. */
  const CASOS = [
    [PV_TEMPORARIO.teto, 1], [PV_TEMPORARIO.teto, PV_TEMPORARIO.teto],
    [PV_TEMPORARIO.teto, PV_TEMPORARIO.teto + 7], [PV_TEMPORARIO.minimo, 0],
    [PV_TEMPORARIO.minimo, 1], [PV_TEMPORARIO.minimo, 99],
  ];
  const divergem = [];
  for (const [pv, dano] of CASOS) {
    const p = comPoco(pv);
    const pelaPorta = absorverDano(p, dano);      /* sem abrigo na ficha: só o poço decide */
    const direto = gastarTemporario(p, dano);
    if (pelaPorta.doTemporario !== direto.absorvido) divergem.push(`poço ${pv} · golpe ${dano}: ${pelaPorta.doTemporario} vs ${direto.absorvido}`);
    if (pelaPorta.dano !== direto.dano) divergem.push(`poço ${pv} · golpe ${dano}: resto ${pelaPorta.dano} vs ${direto.dano}`);
    if (temporarioDe(pelaPorta.pers) !== temporarioDe(direto.pers)) divergem.push(`poço ${pv} · golpe ${dano}: sobra ${temporarioDe(pelaPorta.pers)} vs ${temporarioDe(direto.pers)}`);
    if (pelaPorta.linhaDoTemporario !== direto.linha) divergem.push(`poço ${pv} · golpe ${dano}: linha diferente`);
  }
  t("a porta do dano e o órgão do poço dão sempre o mesmo número — há UM dono da conta",
    divergem.length === 0, divergem.join(" | "));
  t("e a mesma frase — a voz do poço também tem um dono só", divergem.length === 0);
}

sec("10. A VOZ — o sistema não fala de si mesmo");
{
  /* Lei iv da casa. As frases deste órgão vão para a TELA do jogador, e o
     jogador sente o poço pelo efeito, nunca lê o nome do mecanismo. O número
     pode aparecer (é gameplay: quem ganhou 8 precisa de saber que ganhou 8);
     o bastidor, não.
     A comparação tira os acentos antes de olhar, senão "temporário" passaria
     e "temporario" não — a mesma palavra em duas grafias. */
  const semAcento = (s) => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const PALAVRAS_DE_BASTIDOR = ["temporario", "buff", "campo", "efeito", "sistema"];

  const FRASES = [];
  FRASES.push(["o ganho", ganharTemporario(ferido(), MUITO).linha]);
  FRASES.push(["a troca por um maior", ganharTemporario(comPoco(POUCO), MUITO).linha]);
  FRASES.push(["o gasto parcial", gastarTemporario(comPoco(MUITO), 1).linha]);
  FRASES.push(["o gasto que seca o poço", gastarTemporario(comPoco(POUCO), POUCO + 5).linha]);
  FRASES.push(["a voz do poço dentro da porta do dano", absorverDano(comPoco(MUITO), 3).linhaDoTemporario]);
  {
    let p = comPoco(MUITO, PV_TEMPORARIO.turnosPadrao);
    let ultimas = [];
    for (let i = 0; i < 200 && temporarioDe(p) > 0; i++) { const r = tickTemporario(p); p = r.pers; ultimas = r.msgs; }
    ultimas.forEach((m, i) => FRASES.push([`o poço a vencer (${i})`, m]));
  }

  t("há frases de tela para varrer (a prova não é vazia)", FRASES.length >= 5, String(FRASES.length));
  for (const [rotulo, frase] of FRASES) {
    t(`${rotulo}: é frase de verdade, não vazia nem \`undefined\``,
      typeof frase === "string" && frase.trim().length > 0 && !/undefined|NaN|\[object/.test(frase), JSON.stringify(frase));
    const ditas = PALAVRAS_DE_BASTIDOR.filter((p) => semAcento(frase).includes(p));
    t(`${rotulo}: não nomeia mecanismo nenhum`, ditas.length === 0, `disse "${ditas.join('", "')}" em ${JSON.stringify(frase)}`);
    /* e não narra contabilidade: nada de número negativo na tela */
    t(`${rotulo}: não mostra número negativo`, !/-\d/.test(frase), JSON.stringify(frase));
  }
  {
    /* O NÚMERO APARECE quando há número a mostrar — o jogador tem de ver o
       que ganhou e o que se gastou, ou o poço vira uma sensação sem régua. */
    t("a frase do ganho traz o número ganho", ganharTemporario(ferido(), MUITO).linha.includes(String(MUITO)));
    t("e a frase do gasto traz o número que parou", gastarTemporario(comPoco(MUITO), 1).linha.includes("1"));
  }
  {
    /* POÇO SEM FONTE (save antigo, canal do Mestre) ainda produz frase de
       mundo — não um `undefined` na tela do jogador. */
    const r = gastarTemporario(ferido({ temporario: { pv: MUITO, turnos: 3 } }), 1);
    t("poço sem fonte não escreve `undefined` na linha", !/undefined/.test(r.linha), JSON.stringify(r.linha));
    t("e ainda assim fala como mundo", r.linha.trim().length > 0);
  }
}

console.log(`\n${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
