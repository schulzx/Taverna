/* A ESCADA (Fase N · N2) — quanta cabeça, e de onde cada um tira a sua

   O QUE ESTA SUÍTE IMPEDE DE ACONTECER:

   · Que um combatente chegue à mesa SEM DEGRAU. Degrau indefinido é
     intenção nenhuma, e intenção nenhuma é turno perdido — e a mudez
     não avisa. Ficha nula, `atributos: null`, classe que não existe,
     ameaça inventada, nome que o Narrador acabou de criar: tudo isso
     chega, e tudo isso tem de sair daqui com um degrau que existe.
   · Que `brilhante` VOLTE A SER DE GRAÇA. Foi assim que `calar_a_magia`
     ganhou a rodada 1 de quase toda luta: todo nome inventado nascia com
     a mente mais afiada da mesa. A regra que decide a fase é que o topo
     não se herda — declara-se —, e aqui ela é varrida no produto INTEIRO
     das duas tabelas, não só nas 27 criaturas que hoje existem.
   · Que a escada colapse o acervo. Se um degrau ficasse com um candidato
     só, o peso deixaria de desempatar e trocaríamos um tirano por cinco.
   · Que o chão fique sem intenção, ou que uma quebra jogue o combatente
     numa intenção que ele não enxerga.
   · Que N2 tenha MUDADO alguma coisa. Ela não podia mudar: o campo novo
     é inerte na eleição de hoje, e quem passa a filtrar é N4. A seção 8
     é a catraca permanente disso.
   · Que uma das seis tabelas do módulo envelheça calada. Elas só tinham
     leitores DENTRO do módulo; esta suíte é o segundo leitor de cada uma
     e prova a coerência entre elas, em vez de recopiar os números.

   Determinística de ponta a ponta: nenhuma varredura sorteia nada. */

const RAIZ = "../src/";
const G = await import(RAIZ + "degraus.js");
const { INTENCOES, intencaoPorId, consultarAdversario, intencaoDaVez, escolherAlvo, garantirAlvo, menteDaCriatura } = await import(RAIZ + "adversario.js");
const { CRIATURAS_FANTASIA, ARQUETIPOS, completarInimigo } = await import(RAIZ + "bestiario.js");
const { PRONTOS, montarPronto } = await import(RAIZ + "prontos.js");
const { CLASSES } = await import(RAIZ + "classes.js");
const { ATRIBUTOS, ATRIBUTO_MAX, ATRIBUTO_MAX_CRIACAO } = await import(RAIZ + "constantes.js");
const { readFileSync } = await import("node:fs");

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

const {
  DEGRAUS, DEGRAU_DO_CHAO, degrauPorId, ordemDoDegrau, enxerga,
  FAIXAS_DO_INTELECTO, RECUO_POR_ATRIBUTO_CHAVE, degrauDaFicha,
  AMEACA_PADRAO, DEGRAU_POR_AMEACA, TETO_POR_MENTE, TETO_DO_HERDADO,
  degrauDaCriatura, intencoesAte,
} = G;

const TOPO = DEGRAUS[DEGRAUS.length - 1].id;
const BESTIARIO = [...CRIATURAS_FANTASIA, ...ARQUETIPOS];
/* o domínio da ficha, lido do teto e nunca escrito à mão: no dia em que
   `ATRIBUTO_MAX` mudar, esta varredura acompanha sozinha */
const DOMINIO = Array.from({ length: ATRIBUTO_MAX + 1 }, (_, i) => i);

sec("1. A ESCADA — cinco degraus, e nenhum buraco entre eles");
{
  t("a escada não é vazia", DEGRAUS.length > 0, String(DEGRAUS.length));
  t("todo id é único", new Set(DEGRAUS.map((d) => d.id)).size === DEGRAUS.length);
  /* ordem 0..n-1 sem buraco e sem repetição: `enxerga` compara ordens, e
     um buraco faria dois degraus vizinhos ficarem a dois passos um do
     outro sem que ninguém escrevesse isso em lugar nenhum */
  const ordens = DEGRAUS.map((d) => d.ordem).sort((a, b) => a - b);
  t("a ordem vai de 0 a n-1, sem buraco e sem repetição",
    ordens.every((o, k) => o === k), ordens.join(","));
  t("o acervo está escrito na ordem da escada", DEGRAUS.every((d, k) => d.ordem === k));
  t("cada degrau diz o que ENXERGA e o que DECIDE",
    DEGRAUS.every((d) => typeof d.enxerga === "string" && d.enxerga.trim() && typeof d.decide === "string" && d.decide.trim()),
    DEGRAUS.filter((d) => !d.enxerga || !d.decide).map((d) => d.id).join(", "));
  t("cada degrau tem nome", DEGRAUS.every((d) => !!String(d.nome || "").trim()));

  t("`degrauPorId` acha os cinco e não inventa o sexto",
    DEGRAUS.every((d) => degrauPorId(d.id) === d) && degrauPorId("nao_existe") === null && degrauPorId(null) === null);
  t("`ordemDoDegrau` devolve -1 para o que não existe", ordemDoDegrau("nao_existe") === -1 && ordemDoDegrau(null) === -1);

  /* `enxerga` é a pergunta que o módulo inteiro existe para responder:
     reflexiva (todo mundo enxerga o próprio degrau), transitiva para
     baixo (quem sobe não perde nada) e FECHADA para cima */
  t("todo degrau enxerga a si mesmo", DEGRAUS.every((d) => enxerga(d.id, d.id)));
  t("quem está em cima enxerga tudo o que está embaixo",
    DEGRAUS.every((a) => DEGRAUS.every((b) => enxerga(a.id, b.id) === (a.ordem >= b.ordem))));
  t("degrau torto não enxerga nada, e nada o enxerga",
    !enxerga("nao_existe", DEGRAU_DO_CHAO) && !enxerga(DEGRAU_DO_CHAO, "nao_existe") && !enxerga(null, null));

  t("o chão da escada é o degrau de ordem 0", ordemDoDegrau(DEGRAU_DO_CHAO) === 0);
  /* A REGRA QUE DECIDE A FASE, em uma linha: o topo está ACIMA do teto do
     herdado. Se os dois se encontrassem, `brilhante` voltaria a ser de
     graça para todo nome que o Narrador inventasse. */
  t("o topo mora acima do teto do herdado — `brilhante` não se herda",
    ordemDoDegrau(TOPO) > ordemDoDegrau(TETO_DO_HERDADO), `${TOPO} vs ${TETO_DO_HERDADO}`);
  console.log("      " + DEGRAUS.map((d) => d.ordem + ":" + d.id).join(" · "));
}

sec("2. AS SEIS TABELAS SE LEEM DE VOLTA, E CONCORDAM ENTRE SI");
{
  /* o `backend` avisou que estas seis só tinham leitores DENTRO do
     módulo. Esta seção é o segundo leitor de cada uma — e ela prova
     COERÊNCIA (para onde a entrada aponta, e se cabe no teto), nunca
     recopia o valor que a tabela tem. */

  t("toda faixa do intelecto aponta para um degrau que existe",
    FAIXAS_DO_INTELECTO.every((f) => !!degrauPorId(f.degrau)),
    FAIXAS_DO_INTELECTO.filter((f) => !degrauPorId(f.degrau)).map((f) => f.degrau).join(", "));
  t("as faixas sobem, e o degrau delas sobe junto",
    FAIXAS_DO_INTELECTO.every((f, k) => k === 0 || (f.ate > FAIXAS_DO_INTELECTO[k - 1].ate && ordemDoDegrau(f.degrau) > ordemDoDegrau(FAIXAS_DO_INTELECTO[k - 1].degrau))));
  t("as faixas cobrem o domínio inteiro 0..ATRIBUTO_MAX",
    DOMINIO.every((v) => FAIXAS_DO_INTELECTO.some((f) => v <= f.ate)),
    DOMINIO.filter((v) => !FAIXAS_DO_INTELECTO.some((f) => v <= f.ate)).join(", "));
  t("a última faixa vai até o teto dos atributos, e não até um número escrito à mão",
    FAIXAS_DO_INTELECTO[FAIXAS_DO_INTELECTO.length - 1].ate === ATRIBUTO_MAX);

  t("o recuo cobre os seis atributos",
    ATRIBUTOS.every((a) => RECUO_POR_ATRIBUTO_CHAVE[a.id] !== undefined),
    ATRIBUTOS.filter((a) => RECUO_POR_ATRIBUTO_CHAVE[a.id] === undefined).map((a) => a.id).join(", "));
  t("nenhum recuo inventa atributo que não existe",
    Object.keys(RECUO_POR_ATRIBUTO_CHAVE).every((k) => ATRIBUTOS.some((a) => a.id === k)));
  /* presumir acima do teto da criação seria dar ao companheiro o que nem
     o herói ganha na criação */
  t("nenhum recuo passa do teto da criação",
    Object.values(RECUO_POR_ATRIBUTO_CHAVE).every((v) => Number.isInteger(v) && v >= 0 && v <= ATRIBUTO_MAX_CRIACAO),
    Object.entries(RECUO_POR_ATRIBUTO_CHAVE).filter(([, v]) => v > ATRIBUTO_MAX_CRIACAO).map(([k]) => k).join(", "));

  t("toda ameaça aponta para um degrau que existe",
    Object.values(DEGRAU_POR_AMEACA).every((d) => !!degrauPorId(d)),
    Object.entries(DEGRAU_POR_AMEACA).filter(([, d]) => !degrauPorId(d)).map(([k, d]) => k + "→" + d).join(", "));
  t("nenhuma ameaça sozinha passa do teto do herdado",
    Object.values(DEGRAU_POR_AMEACA).every((d) => ordemDoDegrau(d) <= ordemDoDegrau(TETO_DO_HERDADO)),
    Object.entries(DEGRAU_POR_AMEACA).filter(([, d]) => ordemDoDegrau(d) > ordemDoDegrau(TETO_DO_HERDADO)).map(([k, d]) => k + "→" + d).join(", "));
  /* a ameaça é ordinal — é a propriedade que a fez ser escolhida como
     âncora. Uma tabela que não a respeitasse faria `fraco` valer mais
     que `lendario` sem ninguém escrever isso em lugar nenhum. */
  t("a ameaça é escada: nenhuma linha desce o que a de cima subiu",
    ordemDoDegrau(DEGRAU_POR_AMEACA.fraco) <= ordemDoDegrau(DEGRAU_POR_AMEACA.comum)
    && ordemDoDegrau(DEGRAU_POR_AMEACA.comum) <= ordemDoDegrau(DEGRAU_POR_AMEACA.competente)
    && ordemDoDegrau(DEGRAU_POR_AMEACA.competente) <= ordemDoDegrau(DEGRAU_POR_AMEACA.elite)
    && ordemDoDegrau(DEGRAU_POR_AMEACA.elite) <= ordemDoDegrau(DEGRAU_POR_AMEACA.lendario));

  t("o teto por mente aponta para degraus que existem",
    Object.values(TETO_POR_MENTE).every((d) => !!degrauPorId(d)),
    Object.entries(TETO_POR_MENTE).filter(([, d]) => !degrauPorId(d)).map(([k, d]) => k + "→" + d).join(", "));
  t("nenhum teto de mente passa do teto do herdado",
    Object.values(TETO_POR_MENTE).every((d) => ordemDoDegrau(d) <= ordemDoDegrau(TETO_DO_HERDADO)),
    Object.entries(TETO_POR_MENTE).filter(([, d]) => ordemDoDegrau(d) > ordemDoDegrau(TETO_DO_HERDADO)).map(([k, d]) => k + "→" + d).join(", "));
  /* a única coisa que amarra `menteDaCriatura` a esta tabela: o
     classificador tem três valores, e os três precisam de teto. Um quarto
     valor cairia no recuo em silêncio e daria ao desconhecido o teto do
     herdado inteiro. */
  t("todo valor que `menteDaCriatura` produz tem teto nomeado",
    [...new Set(BESTIARIO.map((c) => menteDaCriatura(c.nome, c.desc)))].every((m) => TETO_POR_MENTE[m] !== undefined));

  t("o teto do herdado é um degrau que existe", !!degrauPorId(TETO_DO_HERDADO));
  t("a ameaça padrão é uma linha da tabela de ameaças", DEGRAU_POR_AMEACA[AMEACA_PADRAO] !== undefined);
  /* o recuo do desconhecido é o que a tabela diz — e não "o mais baixo",
     que é como ele seria escrito se ninguém olhasse */
  t("a ameaça inventada recua exatamente para a ameaça padrão",
    degrauDaCriatura({ nome: "Farrapo de Névoa", ameaca: "inventada" }) === degrauDaCriatura({ nome: "Farrapo de Névoa", ameaca: AMEACA_PADRAO })
    && degrauDaCriatura({ nome: "Farrapo de Névoa" }) === degrauDaCriatura({ nome: "Farrapo de Névoa", ameaca: AMEACA_PADRAO }));
}

sec("3. A FICHA — o herói pelo intelecto, o companheiro pela classe");
{
  t("o domínio inteiro 0..ATRIBUTO_MAX devolve degrau válido",
    DOMINIO.every((v) => !!degrauPorId(degrauDaFicha({ atributos: { intelecto: v } }))),
    DOMINIO.filter((v) => !degrauPorId(degrauDaFicha({ atributos: { intelecto: v } }))).join(", "));
  /* MONOTONICIDADE: mais intelecto nunca dá degrau menor. Sem isto, subir
     o atributo poderia BURRIFICAR o herói — e ninguém repara, porque o
     degrau é bastidor e não aparece na tela. */
  t("mais intelecto nunca dá degrau menor",
    DOMINIO.every((v, k) => k === 0 || ordemDoDegrau(degrauDaFicha({ atributos: { intelecto: v } })) >= ordemDoDegrau(degrauDaFicha({ atributos: { intelecto: DOMINIO[k - 1] } }))));
  const daFicha = new Set(DOMINIO.map((v) => degrauDaFicha({ atributos: { intelecto: v } })));
  /* o chão é da CRIATURA: quem tem ficha é gente, e nem o herói de
     intelecto 0 decide pelo corpo — ele decide mal, que é outra coisa */
  t("nenhuma ficha cai no chão da escada", !daFicha.has(DEGRAU_DO_CHAO), [...daFicha].join(", "));
  t("o intelecto máximo chega ao topo, e só ele",
    degrauDaFicha({ atributos: { intelecto: ATRIBUTO_MAX } }) === TOPO
    && degrauDaFicha({ atributos: { intelecto: ATRIBUTO_MAX - 1 } }) !== TOPO);
  /* NENHUM DEGRAU É MORTO — e "morto" aqui é degrau que fonte nenhuma
     alcança. A ficha alcança quatro; a criatura alcança o chão. */
  const daCriatura = new Set(BESTIARIO.map((c) => degrauDaCriatura(c)));
  t("as duas fontes juntas acendem os cinco degraus",
    DEGRAUS.every((d) => daFicha.has(d.id) || daCriatura.has(d.id)),
    DEGRAUS.filter((d) => !daFicha.has(d.id) && !daCriatura.has(d.id)).map((d) => d.id).join(", "));

  /* OS OITO PRONTOS, nas duas formas em que existem: a entrada crua da
     tabela e a ficha montada (que é a que chega à mesa, já com o bônus
     de raça somado). N1 mediu a montada: intelecto 0, 1 e 3 — três
     valores, e o 2 vazio. */
  t("os oito prontos existem", PRONTOS.length === 8, String(PRONTOS.length));
  t("nenhum pronto cru fica sem degrau válido",
    PRONTOS.every((p) => !!degrauPorId(degrauDaFicha(p))),
    PRONTOS.filter((p) => !degrauPorId(degrauDaFicha(p))).map((p) => p.id).join(", "));
  const montados = PRONTOS.map((p) => ({ id: p.id, f: montarPronto(p.id) }));
  t("os oito montam", montados.every((x) => !!x.f));
  t("nenhum pronto montado fica sem degrau válido",
    montados.every((x) => !!degrauPorId(degrauDaFicha(x.f))),
    montados.filter((x) => !degrauPorId(degrauDaFicha(x.f))).map((x) => x.id).join(", "));
  /* a escada de cinco não cabia em três valores de intelecto, e é por
     isso que o mapa é por FAIXA: com um degrau por valor, metade da
     escada nasceria inalcançável pelos prontos */
  const degrausDosProntos = new Set(montados.map((x) => degrauDaFicha(x.f)));
  t("os oito não colapsam num degrau só", degrausDosProntos.size >= 2, [...degrausDosProntos].join(", "));
  console.log("      prontos: " + montados.map((x) => `${x.id} i${x.f.atributos.intelecto}→${degrauDaFicha(x.f)}`).join(" · "));

  /* AS 12 CLASSES — o recuo do companheiro, que não tem `atributos`
     nenhum. `atributoChave` é o que a classe considera que resolve os
     problemas dela, e isso é exatamente a pergunta que a escada faz. */
  t("as doze classes existem", CLASSES.length === 12, String(CLASSES.length));
  t("toda classe tem `atributoChave` tabelado no recuo — nenhuma cai no `??` calada",
    CLASSES.every((c) => RECUO_POR_ATRIBUTO_CHAVE[c.atributoChave] !== undefined),
    CLASSES.filter((c) => RECUO_POR_ATRIBUTO_CHAVE[c.atributoChave] === undefined).map((c) => c.nome + "→" + c.atributoChave).join(", "));
  t("toda classe devolve degrau válido sem `atributos` nenhum",
    CLASSES.every((c) => !!degrauPorId(degrauDaFicha({ classe: c.nome }))),
    CLASSES.filter((c) => !degrauPorId(degrauDaFicha({ classe: c.nome }))).map((c) => c.nome).join(", "));
  /* a razão de o recuo ser pela classe: ele SEPARA. Um recuo que desse o
     mesmo degrau às doze seria um `|| 1` solto com nome de tabela. */
  t("o recuo separa as classes em mais de um degrau",
    new Set(CLASSES.map((c) => degrauDaFicha({ classe: c.nome }))).size >= 2);
  t("quem estuda recua mais alto do que quem resolve com o corpo",
    ordemDoDegrau(degrauDaFicha({ classe: "Mago" })) > ordemDoDegrau(degrauDaFicha({ classe: "Guerreiro" })));
  /* NENHUM COMPANHEIRO CHEGA AO TOPO PELO RECUO: o topo custa o máximo da
     criação MAIS a raça, e o presumido nunca passa do máximo da criação.
     Herdar o topo sem ficha seria a mesma doença do lado do inimigo. */
  t("nenhuma classe alcança o topo pelo recuo",
    CLASSES.every((c) => degrauDaFicha({ classe: c.nome }) !== TOPO),
    CLASSES.filter((c) => degrauDaFicha({ classe: c.nome }) === TOPO).map((c) => c.nome).join(", "));
  t("nenhum valor possível do recuo alcança o topo",
    Object.values(RECUO_POR_ATRIBUTO_CHAVE).every((v) => degrauDaFicha({ atributos: { intelecto: Math.min(ATRIBUTO_MAX_CRIACAO, v) } }) !== TOPO));
  console.log("      classes: " + [...new Set(CLASSES.map((c) => c.atributoChave + "→" + degrauDaFicha({ classe: c.nome })))].join(" · "));

  /* O LIXO. `= {}` no destructuring NÃO cobre `null`, e ficha nula chega
     aqui (companheiro que ainda não foi garantido, alvo de sala vazia). */
  const lixo = [null, undefined, 0, "", "texto", [], {}, { atributos: null }, { atributos: {} },
    { atributos: { intelecto: null } }, { atributos: { intelecto: "abc" } }, { atributos: { intelecto: NaN } },
    { atributos: { intelecto: Infinity } }, { atributos: { intelecto: -9 } }, { atributos: { intelecto: ATRIBUTO_MAX + 99 } },
    { atributos: "texto" }, { classe: null }, { classe: "Classe Que Não Existe" }, { classe: 7 }];
  let explodiu = "";
  const invalidos = [];
  for (const l of lixo) {
    try { if (!degrauPorId(degrauDaFicha(l))) invalidos.push(JSON.stringify(l)); }
    catch (e) { explodiu += JSON.stringify(l) + ":" + e.message + " "; }
  }
  t("nenhum lixo explode na ficha", explodiu === "", explodiu);
  t("todo lixo devolve degrau que existe", invalidos.length === 0, invalidos.join(", "));
  t("intelecto fora da faixa satura no teto, não estoura",
    degrauDaFicha({ atributos: { intelecto: ATRIBUTO_MAX + 99 } }) === degrauDaFicha({ atributos: { intelecto: ATRIBUTO_MAX } })
    && degrauDaFicha({ atributos: { intelecto: -9 } }) === degrauDaFicha({ atributos: { intelecto: 0 } }));
  t("`atributos: null` recua pela classe, como se não houvesse atributos",
    degrauDaFicha({ atributos: null, classe: "Mago" }) === degrauDaFicha({ classe: "Mago" })
    && degrauDaFicha({ atributos: {}, classe: "Mago" }) === degrauDaFicha({ classe: "Mago" }));
  t("classe desconhecida recua pelo mesmo atributo que a tabela dá ao corpo",
    degrauDaFicha({ classe: "Classe Que Não Existe" }) === degrauDaFicha({ atributos: { intelecto: RECUO_POR_ATRIBUTO_CHAVE.forca } }));
}

sec("4. A CRIATURA — e `brilhante` não se herda, declara-se");
{
  /* 18 criaturas de fantasia + 9 arquétipos. O número está pinado porque
     a fase inteira raciocina sobre ele (N1 mediu 27, com 18 em `pensa`):
     uma criatura nova tem de passar por esta suíte de propósito, e não
     entrar na mesa sem ninguém ter perguntado quanta cabeça ela tem. */
  t("o bestiário tem as 27 entradas que N1 mediu", BESTIARIO.length === 27, String(BESTIARIO.length));
  t("toda criatura do bestiário tem degrau válido",
    BESTIARIO.every((c) => !!degrauPorId(degrauDaCriatura(c))),
    BESTIARIO.filter((c) => !degrauPorId(degrauDaCriatura(c))).map((c) => c.nome).join(", "));
  t("o nome que o Narrador inventa também tem degrau",
    ["Farrapo de Névoa", "Larva de Fenda", "O Que Range no Porão", ""].every((n) => !!degrauPorId(degrauDaCriatura({ nome: n }))));

  const declaradas = BESTIARIO.filter((c) => c.degrau);
  t("quem declara degrau recebe exatamente o que declarou",
    declaradas.every((c) => degrauDaCriatura(c) === c.degrau),
    declaradas.filter((c) => degrauDaCriatura(c) !== c.degrau).map((c) => c.nome).join(", "));
  t("toda declaração do bestiário aponta para um degrau que existe",
    declaradas.every((c) => !!degrauPorId(c.degrau)),
    declaradas.filter((c) => !degrauPorId(c.degrau)).map((c) => c.nome + "→" + c.degrau).join(", "));
  t("declarar é a exceção, não a regra", declaradas.length < BESTIARIO.length / 2, `${declaradas.length} de ${BESTIARIO.length}`);
  t("ninguém alcança o topo sem declarar",
    BESTIARIO.every((c) => degrauDaCriatura(c) !== TOPO || !!c.degrau),
    BESTIARIO.filter((c) => degrauDaCriatura(c) === TOPO && !c.degrau).map((c) => c.nome).join(", "));

  /* A VARREDURA QUE DECIDE A FASE, e ela não é sobre as 27: é sobre o
     PRODUTO INTEIRO das duas tabelas — toda ameaça (mais a inventada e a
     vazia) × todo tipo de mente. Herdar o topo foi exatamente o erro que
     `calar_a_magia` cometia, e ele não voltaria pela criatura que existe:
     voltaria pelo nome que o Narrador criar amanhã. */
  const NOME_DA_MENTE = { besta: "Lobo", morto: "Zumbi", pensa: "Bandido" };
  const mentes = Object.keys(TETO_POR_MENTE);
  t("há um nome de prova para cada tipo de mente da tabela",
    mentes.every((m) => NOME_DA_MENTE[m] && menteDaCriatura(NOME_DA_MENTE[m]) === m),
    mentes.filter((m) => !NOME_DA_MENTE[m] || menteDaCriatura(NOME_DA_MENTE[m]) !== m).join(", "));
  const ameacas = [...Object.keys(DEGRAU_POR_AMEACA), "ameaca_inventada", "", null];
  const acimaDoTeto = [], semDegrau = [];
  let casos = 0;
  for (const a of ameacas) for (const m of mentes) {
    casos++;
    const d = degrauDaCriatura({ nome: NOME_DA_MENTE[m], ameaca: a });
    if (!degrauPorId(d)) semDegrau.push(`${a}×${m}`);
    else if (ordemDoDegrau(d) > ordemDoDegrau(TETO_DO_HERDADO)) acimaDoTeto.push(`${a}×${m}→${d}`);
  }
  t("nenhum caso do produto fica sem degrau", semDegrau.length === 0, semDegrau.join(", "));
  t("NENHUMA criatura sem declaração passa do teto do herdado", acimaDoTeto.length === 0, acimaDoTeto.join(", "));
  console.log(`      ${casos} casos varridos (${ameacas.length} ameaças × ${mentes.length} mentes) · 0 acima do teto`);
  /* e o teto morde de verdade: a mente rebaixa o que a ameaça sozinha
     daria. Sem isto, a varredura acima passaria por um módulo que
     simplesmente devolvesse o chão para todo mundo. */
  t("a mente rebaixa o que a ameaça sozinha daria",
    mentes.some((m) => ameacas.some((a) => {
      const so = DEGRAU_POR_AMEACA[String(a || "")] || DEGRAU_POR_AMEACA[AMEACA_PADRAO];
      return ordemDoDegrau(degrauDaCriatura({ nome: NOME_DA_MENTE[m], ameaca: a })) < ordemDoDegrau(so);
    })));
  t("e a ameaça também separa dentro da mesma mente",
    new Set(Object.keys(DEGRAU_POR_AMEACA).map((a) => degrauDaCriatura({ nome: NOME_DA_MENTE.pensa, ameaca: a }))).size >= 2);

  /* O BURACO QUE N1 APONTOU: Comandante ("perigoso e tático") e Sentinela
     Blindada ("muralha ambulante") são as DUAS `elite` do acervo e
     herdariam o MESMO degrau. É a prova de que `ameaca` sozinha não basta. */
  const elites = BESTIARIO.filter((c) => c.ameaca === "elite");
  t("o acervo tem as duas `elite` que N1 nomeou",
    elites.some((c) => c.nome === "Comandante") && elites.some((c) => c.nome === "Sentinela Blindada"));
  t("Comandante e Sentinela Blindada NÃO caem no mesmo degrau",
    degrauDaCriatura(BESTIARIO.find((c) => c.nome === "Comandante")) !== degrauDaCriatura(BESTIARIO.find((c) => c.nome === "Sentinela Blindada")),
    degrauDaCriatura(BESTIARIO.find((c) => c.nome === "Comandante")));

  /* O LIXO do outro lado: a criatura chega da IA, e ela manda o que quer. */
  const lixo = [null, undefined, 0, "", "texto", [], {}, { nome: 3 }, { ameaca: 7 }, { nome: null, ameaca: null },
    { degrau: "degrau_que_nao_existe" }, { degrau: 5 }, { degrau: {} }, { nome: "X", ameaca: {} }];
  let explodiu = "";
  const invalidos = [];
  for (const l of lixo) {
    try { if (!degrauPorId(degrauDaCriatura(l))) invalidos.push(JSON.stringify(l)); }
    catch (e) { explodiu += JSON.stringify(l) + ":" + e.message + " "; }
  }
  t("nenhum lixo explode na criatura", explodiu === "", explodiu);
  t("todo lixo devolve degrau que existe", invalidos.length === 0, invalidos.join(", "));
  t("declaração torta é ignorada e o herdado vale",
    degrauDaCriatura({ nome: "Bandido", ameaca: "elite", degrau: "degrau_que_nao_existe" }) === degrauDaCriatura({ nome: "Bandido", ameaca: "elite" }));
  t("o `lex` torto não derruba a criatura",
    !!degrauPorId(degrauDaCriatura({ nome: "Bandido" }, { lex: { quebrado: true } }))
    && !!degrauPorId(degrauDaCriatura({ nome: "Bandido" }, { lex: 7 })));
  t("o mesmo nome dá sempre o mesmo degrau",
    BESTIARIO.every((c) => degrauDaCriatura(c) === degrauDaCriatura({ ...c })));
}

sec("5. O TRANSPORTE — o degrau chega na ficha que vai à mesa");
{
  /* uma tabela certa que a mesa não vê é uma tabela que não existe: foi
     assim que o Troll ganhou fraqueza a fogo em `bestiario.js` e
     continuou imune na luta */
  const semDegrau = [], divergem = [];
  for (const c of BESTIARIO) {
    const ficha = completarInimigo({ nome: c.nome }, 3);
    if (!degrauPorId(ficha.degrau)) semDegrau.push(c.nome);
    if (ficha.degrau !== degrauDaCriatura(c)) divergem.push(`${c.nome}: ${ficha.degrau} vs ${degrauDaCriatura(c)}`);
  }
  t("as 27 chegam à mesa com degrau válido", semDegrau.length === 0, semDegrau.join(", "));
  t("o que chega à mesa é o que o único sítio computa", divergem.length === 0, divergem.join(", "));
  t("o nome inventado chega à mesa com degrau",
    ["Farrapo de Névoa", "Coisa Sem Nome"].every((n) => !!degrauPorId(completarInimigo({ nome: n }, 3).degrau)));
  t("inimigo sem nome nenhum ainda chega com degrau", !!degrauPorId(completarInimigo({}, 3).degrau));
  t("a declaração que a IA manda ganha da base",
    completarInimigo({ nome: "Bandido", degrau: TOPO }, 3).degrau === TOPO);
  t("declaração torta vinda da IA cai no herdado, não no vazio",
    completarInimigo({ nome: "Bandido", degrau: "nao_existe" }, 3).degrau === degrauDaCriatura({ nome: "Bandido" }));

  /* A INDEPENDÊNCIA DO `desc` — a suíte PROVA, não conserta: o `desc` da
     base continua não sendo copiado por `completarInimigo` (dívida
     conhecida, de outro dono). O degrau nasce de NOME + AMEAÇA
     exatamente para não ser uma tabela que a mesa nunca veria. */
  t("o `desc` da base de fato não chega à mesa (a dívida continua lá)",
    completarInimigo({ nome: "Ogro" }, 3).desc === undefined);
  const mudaComDesc = BESTIARIO.filter((c) => completarInimigo({ nome: c.nome }, 3).degrau !== completarInimigo({ nome: c.nome, desc: c.desc }, 3).degrau);
  t("mandar o `desc` junto não muda um degrau sequer", mudaComDesc.length === 0, mudaComDesc.map((c) => c.nome).join(", "));
  t("nem mandar um `desc` que mente",
    completarInimigo({ nome: "Ogro", desc: "arquimago genial e sutil" }, 3).degrau === completarInimigo({ nome: "Ogro" }, 3).degrau);
  /* e o preço exato dessa dívida, medido: o classificador de mente LÊ o
     `desc` quando ele existe, e o Colosso é a criatura em que isso
     aparece — "máquina/besta de cerco" casa `besta` no texto e não no
     nome. N1 mediu 18 em `pensa` COM o desc; a mesa, que não o tem, vê
     19. A declaração do bestiário é o que impede a diferença de virar
     degrau diferente. */
  const conta = (comDesc) => BESTIARIO.reduce((m, c) => { const k = menteDaCriatura(c.nome, comDesc ? c.desc : ""); m[k] = (m[k] || 0) + 1; return m; }, {});
  t("o retrato de N1 se reproduz com o `desc`: 18 das 27 em `pensa`", conta(true).pensa === 18, JSON.stringify(conta(true)));
  t("e sem o `desc` — que é o que a mesa vê — são 19", conta(false).pensa === 19, JSON.stringify(conta(false)));
  t("mas o degrau do Colosso não depende disso, porque ele declara",
    degrauDaCriatura(BESTIARIO.find((c) => c.nome === "Colosso")) === BESTIARIO.find((c) => c.nome === "Colosso").degrau);
}

sec("6. AS 46 INTENÇÕES — toda uma declara, e o chão nunca fica sem nenhuma");
{
  /* pinado pelo mesmo motivo que as 27: a fase inteira raciocina sobre
     este número (14 das 46 nunca venciam). Intenção nova tem de passar
     por aqui e declarar seu degrau de propósito. */
  t("o acervo tem as 46 entradas que N1 mediu", INTENCOES.length === 46, String(INTENCOES.length));
  t("todas declaram um degrau que existe",
    INTENCOES.every((i) => !!degrauPorId(i.degrauMinimo)),
    INTENCOES.filter((i) => !degrauPorId(i.degrauMinimo)).map((i) => i.id + "→" + i.degrauMinimo).join(", "));

  /* A CATRACA QUE IMPEDE O TURNO PERDIDO. Se a rede subisse um degrau, um
     bicho ficaria sem intenção nenhuma — e a mudez não avisa. */
  t("o chão da escada nunca fica sem intenção", intencoesAte(DEGRAU_DO_CHAO).length > 0);
  t("nenhum degrau da escada fica sem intenção nenhuma",
    DEGRAUS.every((d) => intencoesAte(d.id).length > 0),
    DEGRAUS.filter((d) => !intencoesAte(d.id).length).map((d) => d.id).join(", "));
  /* a rede é a última linha de defesa contra a mudez: ela tem de morar no
     chão, senão a situação mais comum do jogo deixa alguém sem plano */
  t("a rede mora no chão",
    ["brigar", "sobrepujar", "aguentar"].every((id) => intencaoPorId(id).degrauMinimo === DEGRAU_DO_CHAO));
  /* o achado de N1: um pensamento de graça que ganhava toda rodada 1 */
  t("calar a magia e matar o remendo moram no topo",
    ["calar_a_magia", "matar_o_remendo"].every((id) => intencaoPorId(id).degrauMinimo === TOPO));

  t("`intencoesAte` é acumulativa: subir de degrau nunca tira uma intenção",
    DEGRAUS.every((d, k) => {
      if (k === 0) return true;
      const antes = new Set(intencoesAte(DEGRAUS[k - 1].id).map((i) => i.id));
      return [...antes].every((id) => intencoesAte(d.id).some((i) => i.id === id));
    }));
  t("e monotônica no tamanho",
    DEGRAUS.every((d, k) => k === 0 || intencoesAte(d.id).length >= intencoesAte(DEGRAUS[k - 1].id).length));
  t("o topo enxerga o acervo inteiro", intencoesAte(TOPO).length === INTENCOES.length);
  t("cada degrau enxerga exatamente quem declarou dele para baixo",
    DEGRAUS.every((d) => intencoesAte(d.id).length === INTENCOES.filter((i) => ordemDoDegrau(i.degrauMinimo) <= d.ordem).length));
  t("a escada não é decorativa: o chão enxerga MENOS que o topo",
    intencoesAte(DEGRAU_DO_CHAO).length < INTENCOES.length);
  t("degrau torto cai no chão, não no vazio",
    intencoesAte("nao_existe").length === intencoesAte(DEGRAU_DO_CHAO).length
    && intencoesAte(null).length === intencoesAte(DEGRAU_DO_CHAO).length
    && intencoesAte(undefined).length === intencoesAte(DEGRAU_DO_CHAO).length);
  t("`intencoesAte` só devolve intenções do acervo",
    DEGRAUS.every((d) => intencoesAte(d.id).every((i) => intencaoPorId(i.id) === i)));

  /* A INVARIANTE DA QUEBRA: todo `vira` aponta para intenção de degrau
     IGUAL OU MENOR. Uma quebra que jogasse o combatente numa intenção que
     ele não enxerga o deixaria sem plano no pior momento da luta dele —
     e o pior momento é justamente quando a quebra acontece. */
  const foraDoAlcance = INTENCOES.filter((i) => i.vira && !enxerga(i.degrauMinimo, (intencaoPorId(i.vira) || {}).degrauMinimo));
  t("todo `vira` está ao alcance de quem vira", foraDoAlcance.length === 0,
    foraDoAlcance.map((i) => `${i.id}(${i.degrauMinimo})→${i.vira}`).join(", "));
  console.log("      " + DEGRAUS.map((d) => d.id + " " + intencoesAte(d.id).length).join(" · "));
}

sec("7. O PESO DESEMPATA DENTRO DO DEGRAU");
{
  /* O QUE ESTA SEÇÃO PROVA: que a escada não COLAPSOU o acervo. Se um
     degrau ficasse com um candidato só, não haveria o que desempatar, e
     trocaríamos um tirano global por um tirano por degrau — que é
     exatamente o defeito que a fase existe para consertar.

     O QUE ELA NÃO PROVA, E POR QUÊ: não prova ELEIÇÃO por degrau.
     `consultarAdversario` continua varrendo o acervo inteiro pelo peso
     GLOBAL, de propósito — N2 não liga nada (a seção 8 é a catraca
     disso). A asserção de que a eleição acontece DENTRO do degrau, e de
     que o peso desempata ali, existirá em N4, que é a etapa que liga o
     filtro ao motor. Ela ainda não existe porque a asserção que a
     escrevesse hoje estaria provando código que ninguém chamou — e um
     teste que passa sobre um caminho morto é a pior espécie de verde. */
  const porDegrau = {};
  for (const i of INTENCOES) (porDegrau[i.degrauMinimo] = porDegrau[i.degrauMinimo] || []).push(i);
  const vazios = DEGRAUS.filter((d) => !(porDegrau[d.id] || []).length);
  t("todo degrau tem candidato PRÓPRIO — nenhum degrau é decorativo",
    vazios.length === 0, vazios.map((d) => d.id).join(", "));
  const semDisputa = DEGRAUS.filter((d) => (porDegrau[d.id] || []).length < 2);
  t("todo degrau tem pelo menos DOIS candidatos próprios",
    semDisputa.length === 0, semDisputa.map((d) => d.id + ":" + (porDegrau[d.id] || []).length).join(", "));
  const semDesempate = DEGRAUS.filter((d) => new Set((porDegrau[d.id] || []).map((i) => i.peso)).size < 2);
  t("e dentro de cada degrau o peso ainda separa dois candidatos",
    semDesempate.length === 0, semDesempate.map((d) => d.id).join(", "));
  /* e, olhando de quem ENXERGA (não só de quem declarou), a disputa é
     maior ainda: o degrau de cima herda os candidatos de baixo */
  t("quem enxerga mais tem mais candidatos para desempatar",
    DEGRAUS.every((d) => new Set(intencoesAte(d.id).map((i) => i.peso)).size >= 2));
  console.log("      " + DEGRAUS.map((d) => `${d.id} ${(porDegrau[d.id] || []).length} próprias/${new Set((porDegrau[d.id] || []).map((i) => i.peso)).size} pesos`).join(" · "));
}

sec("8. N2 NÃO MUDOU COMPORTAMENTO — o campo novo é inerte na eleição de hoje");
{
  /* O `backend` rodou 42 093 casos contra `git show HEAD:` e achou 0
     divergências. Repetir a comparação aqui seria medir uma vez mais o
     que já foi medido; esta seção prova a PROPRIEDADE que faz aquele
     resultado ser obrigatório em vez de sortudo: o degrau não participa
     da eleição, e não tem por onde participar. */

  /* (a) A SETA APONTA NUM SENTIDO SÓ. Um círculo entre os dois módulos
     deixaria a ordem de avaliação decidir se `INTENCOES` nasce antes ou
     depois de `DEGRAUS` — bomba silenciosa. */
  const fonteAdversario = readFileSync("../src/adversario.js", "utf8");
  t("`adversario.js` NÃO importa `degraus.js`", !/from\s+["']\.\/degraus\.js["']/.test(fonteAdversario));
  t("e `degraus.js` importa `adversario.js` — o sentido único",
    /from\s+["']\.\/adversario\.js["']/.test(readFileSync("../src/degraus.js", "utf8")));

  /* (b) AS QUATRO FUNÇÕES NÃO TÊM COMO LER O CAMPO: ele não aparece no
     corpo de nenhuma delas. Enquanto isto valer, nenhuma medição pode
     divergir — não há caminho. */
  const semDegrau = [["consultarAdversario", consultarAdversario], ["intencaoDaVez", intencaoDaVez], ["escolherAlvo", escolherAlvo], ["menteDaCriatura", menteDaCriatura]]
    .filter(([, fn]) => /degrau/i.test(String(fn)));
  t("nenhuma das quatro funções da eleição menciona degrau", semDegrau.length === 0, semDegrau.map(([n]) => n).join(", "));
  t("`garantirAlvo` não deixa um degrau entrar no alvo pela porta dos fundos",
    garantirAlvo({ degrau: TOPO }).degrau === undefined);

  /* (c) A VARREDURA, sem sorte nenhuma: produto cartesiano fechado. Para
     cada situação, a eleição de hoje tem de devolver a PRIMEIRA intenção
     de peso máximo entre as que batem — a regra do peso GLOBAL, lida de
     volta do acervo, sem o degrau em lugar nenhum. */
  const base = { nome: "Coisa", ameaca: "comum", quantos: 2, quantosEram: 4, quantosDoOutroLado: 3, saidas: 2, vidaDosMeus: 0.5, heroiVida: 0.5 };
  const vf = [true, false];
  let casos = 0, foraDaRegra = 0, oscilou = 0, mudos = 0, fariaDiferenca = 0, semAlvoEstavel = 0;
  const alvos = [
    { ref: "jogador", nome: "Kael", vida: 30, vidaMax: 40, nivel: 8, heroi: true, perto: true },
    { ref: "grupo", nome: "Vess", vida: 10, vidaMax: 30, nivel: 7, conjurador: true, perto: false },
    { ref: "grupo", nome: "Bram", vida: 28, vidaMax: 32, nivel: 7, cura: true, bloqueia: true, perto: true },
  ];
  for (const ehBicho of vf) for (const ehMorto of vf) for (const pensa of vf)
    for (const temConjurador of vf) for (const temCurandeiro of vf) for (const temRefem of vf)
      for (const alto of vf) for (const ameaca of Object.keys(DEGRAU_POR_AMEACA))
        for (const rodada of [1, 3, 5]) for (const minhaVida of [1, 0.5, 0.15]) {
          casos++;
          const s = { ...base, ameaca, ehBicho, ehMorto, pensa, temConjurador, temCurandeiro, temRefem, alto, ondeCai: alto ? "o poço" : "", rodada, minhaVida };
          const batem = INTENCOES.filter((i) => { try { return !!i.quando(s); } catch { return false; } });
          const eleita = consultarAdversario(s);
          if (!eleita) { if (batem.length) foraDaRegra++; continue; }
          const maior = Math.max(...batem.map((i) => i.peso));
          const primeiraDasMaiores = batem.find((i) => i.peso === maior);
          if (eleita !== primeiraDasMaiores) foraDaRegra++;
          /* determinismo: o `turnoDosInimigos` chama isto mais de uma vez
             por rodada, e um inimigo que troca de plano entre dois golpes
             da mesma rodada não tem plano */
          if (consultarAdversario(s) !== eleita) oscilou++;
          const v1 = intencaoDaVez(s), v2 = intencaoDaVez(s);
          if (!v1 || !v1.intencao) mudos++;
          else if (!v2 || v2.intencao.id !== v1.intencao.id) oscilou++;
          /* o alvo, que é a saída mecânica, também não vê degrau nenhum */
          const a1 = escolherAlvo(eleita.alvo, alvos);
          const a2 = escolherAlvo(eleita.alvo, alvos.map((x) => ({ ...x, degrau: TOPO })));
          if ((a1 && a1.nome) !== (a2 && a2.nome)) semAlvoEstavel++;
          /* E A PROVA DE QUE A INÉRCIA É VISÍVEL: se a eleição filtrasse
             pelo degrau da criatura, a resposta seria OUTRA em parte dos
             casos. Que ela nunca seja outra é o que faz "0 divergências"
             ser propriedade, e não sorte. */
          const meu = degrauDaCriatura({ nome: s.nome, ameaca: s.ameaca });
          const visiveis = batem.filter((i) => enxerga(meu, i.degrauMinimo));
          if (visiveis.length) {
            const maiorVisivel = Math.max(...visiveis.map((i) => i.peso));
            if (visiveis.find((i) => i.peso === maiorVisivel) !== eleita) fariaDiferenca++;
          }
        }
  t("a eleição de hoje é a do peso GLOBAL, caso a caso", foraDaRegra === 0, String(foraDaRegra));
  t("nenhuma situação deixa o adversário mudo", mudos === 0, String(mudos));
  t("a mesma situação dá sempre a mesma intenção", oscilou === 0, String(oscilou));
  t("o alvo não muda quando se pendura um degrau no alvo", semAlvoEstavel === 0, String(semAlvoEstavel));
  t("e filtrar pelo degrau MUDARIA a resposta — a inércia é visível, não vácua",
    fariaDiferenca > 0, String(fariaDiferenca));
  console.log(`      ${casos} situações varridas · 0 fora da regra do peso · ${fariaDiferenca} em que o degrau mudaria a eleição (e não mudou)`);

  /* (d) `menteDaCriatura` continua respondendo QUE TIPO de mente, e o
     campo novo não a alcança: ela só recebe nome, `desc` e léxico, e o
     degrau não é nenhum dos três. Duas classificações de cabeça em dois
     lugares é a doença que esta casa conhece — o que as mantém separadas
     é cada uma ter um dono e ninguém ler o campo do outro. */
  t("`menteDaCriatura` segue com os três valores de sempre",
    [...new Set(BESTIARIO.map((c) => menteDaCriatura(c.nome, c.desc)))].sort().join(",") === "besta,morto,pensa");
  t("e ela responde o mesmo antes e depois de a criatura ganhar declaração",
    BESTIARIO.every((c) => menteDaCriatura(c.nome, c.desc) === menteDaCriatura(c.nome, c.desc, null)));
  /* IMUTABILIDADE (lei da casa): estado é substituído, nunca mutado. Se
     `degrauDaCriatura` escrevesse o degrau dentro do objeto que recebe,
     a segunda leitura de uma criatura herdada viraria declaração — e o
     teto do herdado deixaria de valer a partir da segunda chamada. */
  const antes = BESTIARIO.map((c) => JSON.stringify(c));
  BESTIARIO.forEach((c) => degrauDaCriatura(c));
  t("computar o degrau não escreve dentro da criatura",
    BESTIARIO.every((c, k) => JSON.stringify(c) === antes[k]),
    BESTIARIO.filter((c, k) => JSON.stringify(c) !== antes[k]).map((c) => c.nome).join(", "));
  const ficha = { classe: "Mago", atributos: { intelecto: 2 } };
  const fichaAntes = JSON.stringify(ficha);
  degrauDaFicha(ficha);
  t("nem dentro da ficha", JSON.stringify(ficha) === fichaAntes);
}

console.log(`\n${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
