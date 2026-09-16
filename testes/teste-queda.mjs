/* A QUEDA (Fase Q · Q1) — quem cai, e quem só morre

   O QUE ESTA SUÍTE IMPEDE DE ACONTECER:

   · Que chegar a 0 PV volte a ter DUAS respostas no projeto. Hoje a
     pergunta tem uma porta só (`quedaAoChegarAZero`) e ela devolve
     sempre a mesma forma — inclusive para lixo. A seção 3 varre o lixo
     todo justamente para que ninguém precise de um plano B próprio, que
     é como uma regra vira três regras.
   · Que um lado NOVO ganhe imortalidade por acidente. O padrão seguro é
     morrer direto, e os dois erros não custam o mesmo: a morte a mais se
     explica, o inimigo que não morre trava a mesa.
   · Que `importante` passe a sair de `ameaca` ou de NOME. Foi assim que
     `calar_a_magia` deu a mente mais afiada da mesa a toda criatura
     inventada (v. `degraus.js`); aqui o preço seria maior. A seção 6
     prova a não-derivação pelo par que o `backend` deixou de propósito —
     Comandante (`elite`, importante) e Colosso (`lendario`, não).
   · Que o campo fique CERTO NA TABELA e invisível na mesa. Foi a doença
     do `perfil` (v9.152) e do `degrau` (v9.259): o Troll ganhou fraqueza
     a fogo no bestiário e continuou imune na luta.
   · Que alguém PROMOVA uma criatura em silêncio. A seção 7 conta as
     declarações: mexer no número obriga a passar por aqui.
   · Que o `3` de `aplicarTesteMorte` e o `falhasAteMorrer` desta tabela
     se separem. A seção 5 empurra falhas pelo motor de verdade e conta —
     se o literal de lá mudar, esta asserção acende.
   · Que Q1 tenha LIGADO alguma coisa. Ela não podia: nenhum
     comportamento vivo muda nesta etapa, e a seção 8 é a catraca disso.

   E ela fecha a catraca de `teste-ligacao`: `falhasDoGolpeNoCaido` nasceu
   sem leitor nenhum (`check-mortas` o acusava, sozinho, em todo o repo) e
   `quedaAoChegarAZero` só passava por menção em comentário. Esta suíte é
   o segundo leitor dos OITO nomes exportados.

   Determinística de ponta a ponta: o módulo é tabela pura e não rola
   dado. A única rolagem do arquivo é a da seção 5, e ela é fabricada à
   mão (os `res` são escritos, não sorteados) exatamente para que a prova
   do contrato não dependa de sorte. */

const RAIZ = "../src/";
const Q = await import(RAIZ + "queda.js");
const { CRIATURAS_FANTASIA, ARQUETIPOS, completarInimigo } = await import(RAIZ + "bestiario.js");
const { aplicarTesteMorte } = await import(RAIZ + "combate.js");
const { readFileSync } = await import("node:fs");

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

const {
  DONOS_DA_QUEDA, LADO_DESCONHECIDO, DESFECHO_PADRAO, APELIDOS_DO_LADO,
  ehImportante, quedaAoChegarAZero, GOLPE_NO_CAIDO, falhasDoGolpeNoCaido,
} = Q;

const FONTE_QUEDA = readFileSync(RAIZ + "queda.js", "utf8");
const BESTIARIO = [...CRIATURAS_FANTASIA, ...ARQUETIPOS];
/* o desfecho que NÃO é o padrão, lido da única função que o produz em vez
   de escrito à mão: no dia em que "cai" virar outra palavra, esta suíte
   acompanha sozinha */
const DESFECHO_DE_QUEM_CAI = quedaAoChegarAZero({ lado: "heroi" }).desfecho;

sec("1. OS OITO NOMES, E A FORMA DAS TABELAS");
{
  /* A CATRACA DE `teste-ligacao` EM PESSOA. Ela varre `export function|const|class`
     e cobra um segundo leitor; a lista sai daqui do arquivo, não de uma
     cópia à mão, para que um export NOVO em `queda.js` apareça nesta
     asserção no dia em que nascer — e não na versão em que alguém reparar. */
  const exportados = [...FONTE_QUEDA.matchAll(/^export (?:async )?(?:function|const|class) ([A-Za-z_][A-Za-z0-9_]*)/gm)].map((m) => m[1]);
  const lidos = { DONOS_DA_QUEDA, LADO_DESCONHECIDO, DESFECHO_PADRAO, APELIDOS_DO_LADO, ehImportante, quedaAoChegarAZero, GOLPE_NO_CAIDO, falhasDoGolpeNoCaido };
  const semLeitor = exportados.filter((n) => lidos[n] === undefined);
  t("esta suíte é o segundo leitor de TODO export de `queda.js`", semLeitor.length === 0, semLeitor.join(", "));
  t("e não lê nome que o módulo não exporta",
    Object.keys(lidos).every((n) => exportados.includes(n)),
    Object.keys(lidos).filter((n) => !exportados.includes(n)).join(", "));
  console.log("      " + exportados.length + " exports: " + exportados.join(" · "));

  /* os três donos, e a coluna que decide. `nunca` não é usada por lado
     nenhum hoje — ela existe para que "morrer direto" seja declaração
     possível e não esquecimento —, então a asserção é sobre o DOMÍNIO
     fechado, não sobre quem o ocupa. */
  const VALORES_DE_TESTA = ["sempre", "se_importante", "nunca"];
  const donos = Object.values(DONOS_DA_QUEDA);
  t("a tabela tem uma entrada por lado, e a chave bate com o `id`",
    donos.every((d) => DONOS_DA_QUEDA[d.id] === d),
    donos.filter((d) => DONOS_DA_QUEDA[d.id] !== d).map((d) => d.id).join(", "));
  t("toda entrada declara um `testa` do domínio fechado",
    donos.every((d) => VALORES_DE_TESTA.includes(d.testa)),
    donos.filter((d) => !VALORES_DE_TESTA.includes(d.testa)).map((d) => d.id + "→" + d.testa).join(", "));
  /* `porque` é DIAGNÓSTICO e nunca frase de tela — o sistema não fala de
     si mesmo. O que a suíte pode cobrar é que ele EXISTA: um motivo de log
     vazio é uma decisão sem rastro. */
  t("toda entrada escreve o seu `porque`",
    donos.every((d) => typeof d.porque === "string" && d.porque.trim()),
    donos.filter((d) => !String(d.porque || "").trim()).map((d) => d.id).join(", "));

  /* O LADO DESCONHECIDO NÃO É UM LADO DA TABELA, e isso é a regra: quem
     chega sem lado não é herói, nem companheiro, nem inimigo. Se ele
     virasse linha, entrada torta ganharia dono — e dono tem resposta. */
  t("o lado desconhecido NÃO tem entrada na tabela dos donos", DONOS_DA_QUEDA[LADO_DESCONHECIDO] === undefined);
  t("e o padrão seguro é morrer, não cair", DESFECHO_PADRAO !== DESFECHO_DE_QUEM_CAI, `${DESFECHO_PADRAO} vs ${DESFECHO_DE_QUEM_CAI}`);

  /* OS APELIDOS: toda tradução tem de pousar num lado que existe, senão o
     `ref: "grupo"` que a mesa já usa (`combate.js:246-260`) cairia no
     desconhecido e o companheiro morreria direto sem ninguém escrever isso. */
  t("todo apelido aponta para um lado declarado",
    Object.values(APELIDOS_DO_LADO).every((l) => !!DONOS_DA_QUEDA[l]),
    Object.entries(APELIDOS_DO_LADO).filter(([, l]) => !DONOS_DA_QUEDA[l]).map(([k, l]) => k + "→" + l).join(", "));
  t("todo lado da tabela é alcançável por pelo menos um apelido",
    Object.keys(DONOS_DA_QUEDA).every((l) => Object.values(APELIDOS_DO_LADO).includes(l)),
    Object.keys(DONOS_DA_QUEDA).filter((l) => !Object.values(APELIDOS_DO_LADO).includes(l)).join(", "));
  /* os três `ref` que `turnoDosInimigos` monta hoje. Se um deles saísse do
     mapa, a fiação de Q2 teria de traduzir à mão — que é plantar a
     terceira classificação, exatamente o que o mapa existe para evitar. */
  t("os três `ref` que a mesa já fala continuam traduzidos",
    ["jogador", "grupo", "inimigo"].every((r) => !!DONOS_DA_QUEDA[APELIDOS_DO_LADO[r]]));
  t("o lado canónico é apelido de si mesmo",
    Object.keys(DONOS_DA_QUEDA).every((l) => APELIDOS_DO_LADO[l] === l));
  console.log("      " + Object.entries(APELIDOS_DO_LADO).map(([k, v]) => k + "→" + v).join(" · "));
}

sec("2. OS TRÊS DONOS — herói e companheiro caem; o inimigo só se foi declarado");
{
  /* A REGRA É LIDA DA TABELA, NÃO RECOPIADA. Para cada lado, a coluna
     `testa` diz o que esperar, e a asserção varre os dois estados do campo
     declarado. Recopiar "herói cai, goblin morre" provaria o que eu
     escrevi aqui; ler a coluna prova que o resolvedor CONCORDA com ela. */
  const esperado = { sempre: () => true, nunca: () => false, se_importante: (imp) => imp === true };
  const divergem = [];
  for (const dono of Object.values(DONOS_DA_QUEDA)) {
    for (const imp of [true, false]) {
      const r = quedaAoChegarAZero({ lado: dono.id, importante: imp });
      const deveTestar = esperado[dono.testa](imp);
      if (r.testa !== deveTestar) divergem.push(`${dono.id}/importante:${imp} → testa:${r.testa}, tabela diz ${deveTestar}`);
      if (r.desfecho !== (deveTestar ? DESFECHO_DE_QUEM_CAI : DESFECHO_PADRAO)) divergem.push(`${dono.id}/importante:${imp} → ${r.desfecho}`);
      if (r.lado !== dono.id) divergem.push(`${dono.id} → lado ${r.lado}`);
    }
  }
  t("o resolvedor concorda com a coluna `testa`, lado a lado", divergem.length === 0, divergem.join(" | "));

  /* e as quatro linhas que a etapa pede com todas as letras, pelos
     apelidos que a mesa usa de verdade */
  const heroi = quedaAoChegarAZero({ ref: "jogador", nome: "Kael" });
  const comp = quedaAoChegarAZero({ ref: "grupo", nome: "Vess" });
  const chefe = quedaAoChegarAZero({ ref: "inimigo", nome: "Lich", importante: true });
  const bando = quedaAoChegarAZero({ ref: "inimigo", nome: "Goblin" });
  t("o herói a 0 PV cai e testa", heroi.desfecho === DESFECHO_DE_QUEM_CAI && heroi.testa === true && heroi.lado === DONOS_DA_QUEDA.heroi.id, JSON.stringify(heroi));
  t("o companheiro a 0 PV cai e testa", comp.desfecho === DESFECHO_DE_QUEM_CAI && comp.testa === true && comp.lado === DONOS_DA_QUEDA.companheiro.id, JSON.stringify(comp));
  t("o inimigo IMPORTANTE a 0 PV cai e testa", chefe.desfecho === DESFECHO_DE_QUEM_CAI && chefe.testa === true && chefe.lado === DONOS_DA_QUEDA.inimigo.id, JSON.stringify(chefe));
  t("o inimigo comum a 0 PV morre direto, sem testar", bando.desfecho === DESFECHO_PADRAO && bando.testa === false && bando.lado === DONOS_DA_QUEDA.inimigo.id, JSON.stringify(bando));
  /* o que dá peso ao teste de morte é ele ser RARO: seis goblins com três
     rolagens cada são dezoito rolagens a decidir nada, e a cena final do
     chefe acontecendo seis vezes por escaramuça */
  t("um bando de seis não gera rolagem nenhuma",
    Array.from({ length: 6 }, () => quedaAoChegarAZero({ ref: "inimigo", nome: "Goblin" })).every((r) => r.testa === false));

  /* A FORMA É SEMPRE A MESMA — devolver `null` no caso torto obrigaria
     todo chamador a ter o seu próprio plano B. */
  t("a resposta tem sempre os quatro campos, e `testa` é booleano de verdade",
    [heroi, comp, chefe, bando].every((r) => typeof r.desfecho === "string" && typeof r.testa === "boolean" && typeof r.lado === "string" && typeof r.motivo === "string" && r.motivo.trim()));
  /* IMUTABILIDADE (lei da casa): perguntar não escreve no alvo. Se a porta
     carimbasse o veredito dentro da ficha, a segunda leitura do mesmo
     combatente passaria a ler o carimbo em vez da tabela. */
  const alvo = { ref: "inimigo", nome: "Lich", importante: true, vida: 0 };
  const antes = JSON.stringify(alvo);
  quedaAoChegarAZero(alvo); quedaAoChegarAZero(alvo);
  t("perguntar não escreve dentro do alvo", JSON.stringify(alvo) === antes, JSON.stringify(alvo));
  t("e a mesma ficha dá sempre o mesmo veredito (é tabela, não dado)",
    JSON.stringify(quedaAoChegarAZero(alvo)) === JSON.stringify(quedaAoChegarAZero({ ...alvo })));
}

sec("3. O LIXO E OS LIMITES — e o padrão seguro é morrer direto");
{
  /* O alvo chega da mesa, do save e do envelope da IA, e os três mandam o
     que querem. `= {}` no destructuring NÃO cobre `null` — lei da casa —,
     e por isso `null` entra nesta lista ao lado de `{}`. */
  const LIXO = [null, undefined, {}, 0, [], "", "texto", 7, true, false, NaN,
    { lado: "xpto" }, { lado: "" }, { lado: null }, { lado: 7 }, { lado: {} }, { lado: [] },
    { ref: "nao_existe" }, { ref: null }, { nome: "Lich" }, { vida: 0 }, { importante: true }];
  let explodiu = "";
  const forma = [], seguros = [];
  for (const l of LIXO) {
    try {
      const r = quedaAoChegarAZero(l);
      if (!r || typeof r.desfecho !== "string" || typeof r.testa !== "boolean" || typeof r.lado !== "string" || typeof r.motivo !== "string") forma.push(JSON.stringify(l));
      else if (!(r.desfecho === DESFECHO_PADRAO && r.testa === false && r.lado === LADO_DESCONHECIDO)) seguros.push(JSON.stringify(l) + "→" + JSON.stringify(r));
    } catch (e) { explodiu += JSON.stringify(l) + ":" + e.message + " "; }
  }
  t("nenhum lixo explode na porta da queda", explodiu === "", explodiu);
  t("todo lixo devolve a forma completa, nunca `null`", forma.length === 0, forma.join(", "));
  /* e o veredito do lixo é sempre o MESMO: lado desconhecido, não testa,
     morre. Um lado novo que testasse por engano é o inimigo que não morre
     — o bug que trava a mesa, não o que a irrita. */
  t("todo lixo cai no padrão seguro: desconhecido, não testa, morre", seguros.length === 0, seguros.join(" | "));
  console.log(`      ${LIXO.length} entradas tortas varridas · 0 fora do padrão seguro`);

  /* O LADO COM ESPAÇOS E MAIÚSCULAS, que é o que um save antigo ou um
     envelope da IA manda de verdade. Normalizar aqui, uma vez, é o que
     impede cada chamador de o fazer à sua maneira. */
  const CRU = ["  JOGADOR  ", "Jogador", "GRUPO", " grupo\t", "Inimigo", "  InImIgO "];
  const naoNormalizou = CRU.filter((c) => quedaAoChegarAZero({ lado: c }).lado === LADO_DESCONHECIDO);
  t("lado com espaço e maiúscula normaliza para o lado canónico", naoNormalizou.length === 0, naoNormalizou.join(", "));
  t("e normalizar não muda o veredito",
    quedaAoChegarAZero({ lado: "  JOGADOR  " }).desfecho === quedaAoChegarAZero({ lado: "heroi" }).desfecho);
  /* `lado` ganha de `ref` quando os dois vêm: um só campo decide, senão
     haveria duas verdades no mesmo objeto */
  t("`lado` tem precedência sobre `ref`",
    quedaAoChegarAZero({ lado: "inimigo", ref: "jogador" }).lado === DONOS_DA_QUEDA.inimigo.id);
  t("e `ref` responde quando `lado` não veio",
    quedaAoChegarAZero({ ref: "jogador" }).lado === DONOS_DA_QUEDA.heroi.id
    && quedaAoChegarAZero({ lado: null, ref: "jogador" }).lado === DONOS_DA_QUEDA.heroi.id);

  /* A ÚNICA VERDADE ACEITE É O BOOLEANO `true`. O campo nasce no bestiário,
     escrito à mão como booleano; tudo o que chega noutra forma veio de
     fora da tabela — save torto ou envelope da IA —, e de fora da tabela
     ninguém declara regra. */
  const FALSOS = ["true", "sim", "SIM", 1, -1, [], {}, null, undefined, "", 0, false, NaN, "importante", [true], { valor: true }];
  const aceitou = FALSOS.filter((v) => ehImportante({ nome: "Goblin", importante: v }) !== false);
  t("só o booleano `true` é importante — nem `\"true\"`, nem `\"sim\"`, nem `1`, nem `[]`",
    aceitou.length === 0, aceitou.map((v) => JSON.stringify(v)).join(", "));
  t("e o booleano `true` é aceite", ehImportante({ importante: true }) === true);
  /* e a mentira não vira cena: um `importante: "sim"` num inimigo continua
     morrendo direto, que é o padrão seguro do outro lado da mesma regra */
  const coladosNaCena = FALSOS.filter((v) => quedaAoChegarAZero({ lado: "inimigo", importante: v }).testa !== false);
  t("inimigo com `importante` torto morre direto, sem cena", coladosNaCena.length === 0, coladosNaCena.map((v) => JSON.stringify(v)).join(", "));

  let explodiuImp = "";
  const naoBooleano = [];
  for (const l of [null, undefined, {}, 0, [], "", "texto", 7, true, false, NaN, { importante: true }]) {
    try { if (typeof ehImportante(l) !== "boolean") naoBooleano.push(JSON.stringify(l)); }
    catch (e) { explodiuImp += JSON.stringify(l) + ":" + e.message + " "; }
  }
  t("nenhum lixo explode em `ehImportante`", explodiuImp === "", explodiuImp);
  t("e ela devolve booleano de verdade, sempre", naoBooleano.length === 0, naoBooleano.join(", "));
  t("um não-objeto nunca é importante",
    [null, undefined, 0, "", "texto", 7, true, false, NaN].every((l) => ehImportante(l) === false));
}

sec("4. O GOLPE NO CAÍDO — a tabela lida de volta, e nenhum 1/2/3 recopiado");
{
  /* Bater em quem caiu não é dano, é PRESSA: não tira PV (não há PV), tira
     as chances de o corpo se levantar. As asserções LEEM `GOLPE_NO_CAIDO`
     em vez de repetir os números — "se é número, é tabela" vale para o
     teste também, e uma suíte que recopiasse 1/2/3 continuaria verde no
     dia em que a tabela mudasse sem ninguém querer. */
  t("um golpe em quem caiu custa o que a tabela diz",
    falhasDoGolpeNoCaido({ critico: false, testa: true }) === GOLPE_NO_CAIDO.falhas);
  t("e o crítico custa o que a tabela diz para o crítico",
    falhasDoGolpeNoCaido({ critico: true, testa: true }) === GOLPE_NO_CAIDO.falhasNoCritico);
  t("em quem NÃO testa, custa o que a tabela diz para o corpo",
    falhasDoGolpeNoCaido({ critico: false, testa: false }) === GOLPE_NO_CAIDO.emQuemNaoTesta
    && falhasDoGolpeNoCaido({ critico: true, testa: false }) === GOLPE_NO_CAIDO.emQuemNaoTesta);
  /* `emQuemNaoTesta` é a outra metade da regra e não um esquecimento: o
     corpo do inimigo comum não tem contador de falhas para gastar, e
     "nada" só tem uma grafia em número. */
  t("bater no corpo de quem já morreu não faz NADA", GOLPE_NO_CAIDO.emQuemNaoTesta === 0);
  /* a coerência interna da tabela: o crítico é a mesma pressa com o dobro
     de força, e nenhum golpe sozinho pode matar — senão o teste de morte
     deixava de ser uma cena e virava um número, que é o que a fase
     inteira existe para evitar */
  t("o crítico pesa mais que o golpe comum", GOLPE_NO_CAIDO.falhasNoCritico > GOLPE_NO_CAIDO.falhas);
  t("e nenhum golpe sozinho mata — nem o crítico", GOLPE_NO_CAIDO.falhasNoCritico < GOLPE_NO_CAIDO.falhasAteMorrer,
    `${GOLPE_NO_CAIDO.falhasNoCritico} vs ${GOLPE_NO_CAIDO.falhasAteMorrer}`);
  t("toda linha da tabela é inteiro não-negativo",
    Object.values(GOLPE_NO_CAIDO).every((v) => Number.isInteger(v) && v >= 0),
    JSON.stringify(GOLPE_NO_CAIDO));
  /* a ESCALA, derivada e não escrita: quantos golpes o chão aguenta. Sem
     `falhasAteMorrer` na tabela, "um golpe custa 1 falha" seria um número
     sem régua. */
  const golpesAteMorrer = Math.ceil(GOLPE_NO_CAIDO.falhasAteMorrer / GOLPE_NO_CAIDO.falhas);
  const criticosAteMorrer = Math.ceil(GOLPE_NO_CAIDO.falhasAteMorrer / GOLPE_NO_CAIDO.falhasNoCritico);
  t("a escala fecha: é preciso mais de um golpe, e o crítico encurta o caminho",
    golpesAteMorrer > 1 && criticosAteMorrer > 0 && criticosAteMorrer < golpesAteMorrer,
    `${golpesAteMorrer} golpes · ${criticosAteMorrer} críticos`);
  console.log(`      ${golpesAteMorrer} golpes comuns ou ${criticosAteMorrer} críticos fecham as ${GOLPE_NO_CAIDO.falhasAteMorrer} falhas`);

  /* O LIXO. Quem chama isto chama do meio de uma rodada: um órgão que
     estoura no turno é exatamente o que a casa proíbe — e o `= {}` que
     estava aqui NÃO cobria `null` (conserto da v9.268, com o motivo
     escrito em `queda.js`). */
  const LIXO = [undefined, null, {}, 0, [], "", "texto", 7, true, false, NaN,
    { critico: "sim" }, { critico: 1 }, { critico: null }, { critico: [] },
    { testa: 0 }, { testa: "" }, { testa: null }, { testa: "sim" }, { testa: 1 },
    { critico: "sim", testa: 0 }, { critico: true, testa: "nao" }];
  let explodiu = "";
  const foraDaTabela = [];
  for (const l of LIXO) {
    try {
      const n = falhasDoGolpeNoCaido(l);
      if (!Object.values(GOLPE_NO_CAIDO).includes(n)) foraDaTabela.push(JSON.stringify(l) + "→" + n);
    } catch (e) { explodiu += JSON.stringify(l) + ":" + e.message + " "; }
  }
  t("nenhum lixo explode no golpe — nem `null`, nem argumento ausente", explodiu === "", explodiu);
  t("e todo resultado é um valor que a tabela declara", foraDaTabela.length === 0, foraDaTabela.join(", "));
  /* os padrões, um a um: sem dizer nada, quem chega está a bater em
     alguém que caiu de verdade (`testa` presume `true`) e o golpe é comum */
  t("sem argumento, o padrão é o golpe comum em quem testa",
    falhasDoGolpeNoCaido() === GOLPE_NO_CAIDO.falhas
    && falhasDoGolpeNoCaido(null) === GOLPE_NO_CAIDO.falhas
    && falhasDoGolpeNoCaido({}) === GOLPE_NO_CAIDO.falhas);
  /* `critico` só é crítico com o booleano `true` — mesma disciplina de
     `ehImportante`, e pelo mesmo motivo: o valor chega de fora */
  t("`critico: \"sim\"` não é crítico", falhasDoGolpeNoCaido({ critico: "sim" }) === GOLPE_NO_CAIDO.falhas
    && falhasDoGolpeNoCaido({ critico: 1 }) === GOLPE_NO_CAIDO.falhas);
  /* `testa: 0` é "não testa" de verdade — o padrão `true` só vale para o
     campo AUSENTE, e um zero que virasse `true` daria contador de falhas
     ao corpo do goblin */
  t("`testa: 0` (e todo falsy explícito) cai em quem não testa",
    [0, "", null, false, NaN].every((v) => falhasDoGolpeNoCaido({ testa: v }) === GOLPE_NO_CAIDO.emQuemNaoTesta));

  /* A PORTA E O GOLPE FALAM A MESMA LÍNGUA: quem chama passa o `testa` que
     recebeu de `quedaAoChegarAZero`, em vez de perguntar outra vez e
     arriscar responder diferente. Esta é a junta entre os dois. */
  const juntaTorta = [];
  for (const dono of Object.values(DONOS_DA_QUEDA)) for (const imp of [true, false]) {
    const r = quedaAoChegarAZero({ lado: dono.id, importante: imp });
    const custo = falhasDoGolpeNoCaido({ testa: r.testa });
    const devia = r.testa ? GOLPE_NO_CAIDO.falhas : GOLPE_NO_CAIDO.emQuemNaoTesta;
    if (custo !== devia) juntaTorta.push(`${dono.id}/${imp}: ${custo} vs ${devia}`);
  }
  t("o custo do golpe segue o `testa` que a porta devolveu", juntaTorta.length === 0, juntaTorta.join(" | "));
}

sec("5. O CONTRATO COM `aplicarTesteMorte` — as duas réguas têm de concordar");
{
  /* `falhasAteMorrer` ESPELHA o `3` que ainda é literal em `combate.js`
     (`aplicarTesteMorte`). Não é uma segunda fonte da regra: é a mesma,
     escrita onde se pode ler. A prova não recopia o número — EMPURRA
     falhas pelo motor de verdade e conta quantas custaram a morte. Se um
     dia o literal de lá mudar, esta asserção acende no mesmo dia.
     Os `res` são fabricados à mão (nunca `testeDeMorte()`) de propósito:
     o contrato entre as duas tabelas não pode depender de sorte. */
  const contar = (tipo) => {
    let estado = { sucessos: 0, falhas: 0 };
    for (let i = 1; i <= 20; i++) {
      const r = aplicarTesteMorte(estado, { tipo });
      estado = { sucessos: r.sucessos, falhas: r.falhas };
      if (r.desfecho === "morto") return i;
    }
    return null;
  };
  const falhasSimples = contar("falha");
  t("empurrar falhas por `aplicarTesteMorte` mata em exatamente `falhasAteMorrer`",
    falhasSimples === GOLPE_NO_CAIDO.falhasAteMorrer, `${falhasSimples} vs ${GOLPE_NO_CAIDO.falhasAteMorrer}`);
  /* o `1` natural vale duas falhas no motor — é a mesma aritmética que o
     crítico usa aqui, e prová-la amarra as duas tabelas pelo PASSO, não
     só pelo total */
  const falhasDobradas = contar("falha2");
  t("e o passo duplo do motor bate com o passo duplo da tabela",
    falhasDobradas === Math.ceil(GOLPE_NO_CAIDO.falhasAteMorrer / GOLPE_NO_CAIDO.falhasNoCritico),
    `${falhasDobradas} rolagens de passo 2 para ${GOLPE_NO_CAIDO.falhasAteMorrer} falhas`);
  /* e o motor continua sendo o dono da SORTE: a decisão ("cai ou morre?")
     e a sorte ("resiste ou enfraquece?") são duas perguntas em dois
     sítios, e é isso que torna `queda.js` provável sem semente */
  t("`queda.js` não rola dado nenhum — nem `d(`, nem `Math.random`",
    !/Math\.random|\bd\(\s*\d/.test(FONTE_QUEDA));
  t("e não importa nada de `src/` — ele é tabela pura",
    !/^\s*import\s/m.test(FONTE_QUEDA));
}

sec("6. O CAMPO DECLARADO — nem de `ameaca`, nem de nome");
{
  /* O PAR QUE O `backend` DEIXOU DE PROPÓSITO. Se `importante` saísse de
     `ameaca`, estes dois seriam impossíveis: o Comandante é `elite` e É
     importante; o Colosso é `lendario` e NÃO é. `ameaca` é perigo, não
     papel — o Golem de Pedra é `elite` e é um obstáculo. */
  const comandante = BESTIARIO.find((c) => c.nome === "Comandante");
  const colosso = BESTIARIO.find((c) => c.nome === "Colosso");
  t("o acervo tem o par que a etapa nomeia", !!comandante && !!colosso);
  t("o Comandante é `elite` e É importante", comandante.ameaca === "elite" && ehImportante(comandante) === true, comandante.ameaca);
  t("o Colosso é `lendario` e NÃO é importante", colosso.ameaca === "lendario" && ehImportante(colosso) === false, colosso.ameaca);
  /* e a prova geral, que não depende de eu ter escolhido bem o par:
     NENHUMA função de `ameaca` reproduz esta coluna, porque há ameaças com
     os dois valores dentro delas */
  const porAmeaca = {};
  for (const c of BESTIARIO) (porAmeaca[c.ameaca] = porAmeaca[c.ameaca] || []).push(ehImportante(c));
  const ambiguas = Object.keys(porAmeaca).filter((a) => new Set(porAmeaca[a]).size > 1);
  t("`importante` NÃO é função de `ameaca` — há ameaça com os dois valores dentro",
    ambiguas.length > 0, "ameaças ambíguas: " + ambiguas.join(", "));
  t("e a ameaça mais alta não basta: `lendario` tem declarada e não declarada",
    new Set(porAmeaca.lendario).size > 1);
  console.log("      " + Object.entries(porAmeaca).map(([a, v]) => `${a} ${v.filter(Boolean).length}/${v.length}`).join(" · "));

  /* NEM DE NOME. `ehImportante` lê UM campo e mais nada — nunca adivinha
     por regex. Foi assim que `calar_a_magia` deu a mente mais afiada da
     mesa a toda criatura inventada; aqui o preço é um inimigo que não
     morre. */
  t("o NOME de um declarado, sozinho, não importa nada",
    ["Lich", "Dragão Ancião", "Horror", "Comandante"].every((n) => ehImportante({ nome: n }) === false));
  t("nem o `desc`, nem o `degrau`, nem o `perfil`",
    ehImportante({ nome: "Lich", desc: "arquimago morto-vivo com filactério", degrau: "brilhante", ameaca: "lendario", perfil: { ataque: "sombrio" } }) === false);

  /* O TRANSPORTE — uma tabela certa que a mesa não vê é uma tabela que não
     existe. Foi a doença do `perfil` (v9.152) e do `degrau` (v9.259): o
     Troll ganhou fraqueza a fogo no bestiário e continuou imune na luta,
     porque a ficha que chega ao combate é a que sai de `completarInimigo`. */
  const naoViaja = [], semCampo = [];
  for (const c of BESTIARIO) {
    const ficha = completarInimigo({ nome: c.nome }, 3);
    if (typeof ficha.importante !== "boolean") semCampo.push(c.nome);
    if (ficha.importante !== ehImportante(c)) naoViaja.push(`${c.nome}: ${ficha.importante} vs ${ehImportante(c)}`);
  }
  t("as 27 chegam à mesa com o campo, e sempre booleano", semCampo.length === 0, semCampo.join(", "));
  t("o que chega à mesa é o que a tabela declara", naoViaja.length === 0, naoViaja.join(", "));
  /* e a ponta a ponta: da ficha que chega à luta até o veredito da queda */
  const vereditoTorto = BESTIARIO.filter((c) => {
    const ficha = completarInimigo({ nome: c.nome }, 3);
    const r = quedaAoChegarAZero({ ...ficha, lado: "inimigo" });
    return r.testa !== ehImportante(c);
  });
  t("e a ficha que chega à luta decide a queda pela declaração da tabela",
    vereditoTorto.length === 0, vereditoTorto.map((c) => c.nome).join(", "));

  /* O NOME INVENTADO PELO NARRADOR não bate com base nenhuma, e quem não
     bate não é importante — o padrão seguro. */
  const INVENTADOS = ["Farrapo de Névoa", "Larva de Fenda", "O Que Range no Porão", "Coisa Sem Nome", ""];
  t("o nome inventado pelo Narrador não é importante",
    INVENTADOS.every((n) => completarInimigo({ nome: n }, 3).importante === false),
    INVENTADOS.filter((n) => completarInimigo({ nome: n }, 3).importante !== false).join(", "));
  t("nem o inimigo sem nome nenhum", completarInimigo({}, 3).importante === false);
  /* E `e.importante` MANDADO DE FORA É IGNORADO — ao contrário do `degrau`,
     que aceita o que a IA manda. Aqui não: "o critério sai de campo
     declarado no bestiário", e o Narrador declarar que o goblin dele é
     importante é o Narrador inventando mecânica. */
  const MENTIRAS = [true, "true", "sim", 1, []];
  const colou = MENTIRAS.filter((v) => completarInimigo({ nome: "Goblin", importante: v }, 3).importante !== false);
  t("o `importante` que a IA manda num comum é IGNORADO", colou.length === 0, colou.map((v) => JSON.stringify(v)).join(", "));
  t("e um `importante: false` da IA não rebaixa quem a tabela declarou",
    completarInimigo({ nome: "Lich", importante: false }, 3).importante === true);
  t("nem num nome inventado a mentira cola",
    completarInimigo({ nome: "Farrapo de Névoa", importante: true }, 3).importante === false);
  /* idempotente: completar duas vezes dá o mesmo campo, porque ele é
     sempre recalculado do nome e nunca herdado do objeto que chegou */
  const duasVezes = BESTIARIO.filter((c) => {
    const uma = completarInimigo({ nome: c.nome }, 3);
    return completarInimigo(uma, 3).importante !== uma.importante;
  });
  t("completar duas vezes dá o mesmo campo (é recalculado, não herdado)", duasVezes.length === 0, duasVezes.map((c) => c.nome).join(", "));
}

sec("7. A CONTAGEM DAS DECLARAÇÕES — ninguém promove uma criatura em silêncio");
{
  /* 18 criaturas de fantasia + 9 arquétipos, o mesmo 27 que N1 mediu e que
     `teste-degraus` pina. O número de DECLARADAS está pinado pelo motivo
     que a etapa escreve: promover uma criatura é dar-lhe uma cena de morte
     e tirar-lhe a morte num número — decisão de desenho, nunca efeito
     colateral de quem estava a mexer noutra coluna. Mexer no número aqui
     obriga a passar por esta suíte e a escrever o porquê. */
  t("o bestiário continua com as 27 entradas", BESTIARIO.length === 27, String(BESTIARIO.length));
  t("e são 18 de fantasia + 9 arquétipos", CRIATURAS_FANTASIA.length === 18 && ARQUETIPOS.length === 9,
    `${CRIATURAS_FANTASIA.length} + ${ARQUETIPOS.length}`);
  const declaradas = BESTIARIO.filter((c) => ehImportante(c));
  t("exatamente 5 das 27 declaram `importante`", declaradas.length === 5,
    `${declaradas.length}: ${declaradas.map((c) => c.nome).join(", ")}`);
  /* declarar é a EXCEÇÃO: o que dá peso ao teste de morte é ele ser raro,
     e uma tabela em que metade do acervo cai seria a cena do chefe
     acontecendo em toda escaramuça */
  t("declarar é a exceção, e larga: menos de um quinto do acervo",
    declaradas.length * 5 < BESTIARIO.length, `${declaradas.length} de ${BESTIARIO.length}`);
  /* o campo só é GUARDADO quando é `true` — ausente e `false` querem dizer
     a mesma coisa, e guardar os dois seria convidar o save a discordar de si */
  const guardadoAtoa = BESTIARIO.filter((c) => "importante" in c && c.importante !== true);
  t("o campo só existe no objeto quando é `true`", guardadoAtoa.length === 0, guardadoAtoa.map((c) => c.nome).join(", "));
  console.log("      declaradas: " + declaradas.map((c) => `${c.nome} (${c.ameaca})`).join(" · "));
}

sec("8. Q1 NÃO LIGOU NADA — a catraca da inércia");
{
  /* Q1 é o molde de `degraus.js` em N2: a tabela nasce pronta e ninguém a
     lê na mesa. Quem passa a decidir por ela é Q2 (o companheiro) e Q3 (a
     escolha letal/não letal). Enquanto esta seção for verde, nenhuma
     medição de antes/depois pode divergir — não há caminho. */
  const arqs = (await import("node:fs")).readdirSync(RAIZ).filter((f) => /\.(js|jsx)$/.test(f));
  const fonte = Object.fromEntries(arqs.map((f) => [f, readFileSync(RAIZ + f, "utf8")]));

  /* (a) A SETA APONTA NUM SENTIDO SÓ. Um círculo entre os dois deixaria a
     ordem de avaliação decidir se `CRIATURAS_FANTASIA` nasce antes ou
     depois de `DONOS_DA_QUEDA` — bomba silenciosa, a mesma de `degraus.js`. */
  t("`bestiario.js` importa `queda.js`", /from\s+["']\.\/queda\.js["']/.test(fonte["bestiario.js"]));
  t("e `queda.js` não importa `bestiario.js` — o sentido único",
    !/from\s+["']\.\/bestiario\.js["']/.test(FONTE_QUEDA));

  /* (b) NINGUÉM CHAMA A PORTA AINDA. `ehImportante` já tem o seu leitor
     (é o que faz o campo viajar); a DECISÃO, não. */
  /* o próprio `queda.js` fica de fora da varredura: a linha que casa lá é a
     DECLARAÇÃO da função, não uma chamada. O que se procura é um segundo
     arquivo — é ele que seria o comportamento ligado. */
  const foraDeCasa = arqs.filter((f) => f !== "queda.js");
  const chamam = foraDeCasa.filter((f) => new RegExp("\\bquedaAoChegarAZero\\s*\\(").test(fonte[f]));
  t("ninguém CHAMA `quedaAoChegarAZero` em `src/` — Q1 não liga nada",
    chamam.length === 0, chamam.join(", "));
  const cobram = foraDeCasa.filter((f) => new RegExp("\\bfalhasDoGolpeNoCaido\\s*\\(").test(fonte[f]));
  t("e ninguém cobra `falhasDoGolpeNoCaido` na mesa", cobram.length === 0, cobram.join(", "));
  t("o único leitor vivo do módulo é `ehImportante`, e ele só faz o campo viajar",
    /ehImportante\(/.test(fonte["bestiario.js"]));

  /* (c) `aplicarTesteMorte` FICOU EXATAMENTE COMO ESTAVA. Q1 não a
     reescreve — dá-lhe os outros dois donos por tabela. O `3` continua
     literal lá, e é POR ISSO que a seção 5 existe: quem troca o literal
     pela leitura é Q2. Se esta asserção ficar vermelha, ou o motor mudou,
     ou alguém já ligou o que Q1 prometeu não ligar — e nos dois casos a
     seção 5 tem de ser relida antes de se mexer nela. */
  t("`aplicarTesteMorte` continua sem ler `queda.js`",
    !/queda/i.test(String(aplicarTesteMorte)));
  t("e `combate.js` não importa o módulo da queda", !/from\s+["']\.\/queda\.js["']/.test(fonte["combate.js"]));

  /* (d) O APP NÃO GANHOU UMA SEGUNDA CLASSIFICAÇÃO. O único sítio a
     perguntar "cai ou morre?" é a porta; se aparecer um segundo
     `vida <= 0 ? ... : ...` COM o módulo importado no App, a doença desta
     casa voltou (duas classificações em dois lugares). */
  t("o `App.jsx` ainda não importa `queda.js`", !/from\s+["']\.\/queda\.js["']/.test(fonte["App.jsx"]));

  /* (e) E O CAMPO NOVO É INERTE NA LUTA DE HOJE: `completarInimigo` passou
     a devolvê-lo, e nenhuma outra coisa da ficha mudou por causa dele. A
     prova é por COMPARAÇÃO — a ficha sem o campo tem de ser idêntica à de
     sempre, campo a campo. */
  const mudou = [];
  for (const c of BESTIARIO) {
    const ficha = completarInimigo({ nome: c.nome }, 3);
    const semImp = { ...ficha }; delete semImp.importante;
    /* completar um inimigo que JÁ tem o campo não pode mexer em mais nada:
       se mexesse, o campo teria virado entrada de cálculo em silêncio */
    const outra = { ...completarInimigo({ ...semImp }, 3) }; delete outra.importante;
    if (JSON.stringify(outra) !== JSON.stringify(semImp)) mudou.push(c.nome);
  }
  t("o campo novo não mexe em mais nada da ficha que vai à luta", mudou.length === 0, mudou.join(", "));
}

console.log(`\n${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
