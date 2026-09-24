/* A FUGA (fuga.js) — a prova de que "eu corro" corre de verdade

   O QUE ESTA SUÍTE PROTEGE, e por que cada bloco está escrito assim:

   1. O R15 REJOGADO, com números. Emboscada na estrada, três
      javalis-de-pedra a 19,5 m, a heroína com passo 9 — a cena exata que
      custou 15 PV a um jogador de verdade porque o sistema cobrou golpes
      de bichos que não a alcançavam. Se este bloco ficar vermelho, a
      regra que existe para nunca mais deixar isso acontecer quebrou.
   2/3. COLADO não é "perto": é "sem gap para o alcance dele". Um bicho da
      mesma velocidade do herói (passo 9, perseguição 2×) nunca abre gap
      nenhum, corra o herói ou não — só derrubá-lo (caído) ou pegar algo
      mais lento (zumbi, 6 m) muda a conta, e só CORRENDO, nunca
      desengajando (o desengajo é metade do passo).
   4. A ESCOLHA DO MODO, quando ninguém força: menos golpes primeiro,
      folga como desempate, e — quando os dois modos falham — o veredito
      é o de quem corre (para o jogador ver o "quase" mais generoso).
   5. A TABELA LIDA DE VOLTA. Nenhum número de PERSEGUICAO_POR_CONDICAO é
      copiado para dentro desta suíte: a conta usa FUGA e a própria
      tabela, para que mudar um fator na tabela não obrigue a mexer aqui
      — e para que um fator mudado sem querer estoure este arquivo.
   6. O TETO DA LINHA (o mesmo de golpe.js) e o VOCABULÁRIO — nenhuma
      linha que o jogador lê pode nomear o mecanismo por trás dela.
   7. ehFuga — a fronteira mais perigosa desta função é o falso positivo
      que encerraria a luta sem o jogador ter pedido, e o falso negativo
      que a deixaria continuar como no R15. As frases vetadas existem
      porque already morderam ("Grito para Elma: fuja!" não é o herói
      fugindo, e "não fujo" não pode ler como "fujo").
   8. Determinismo, imutabilidade e lixo — a mesma lei de sempre.
   9. O FÔLEGO DA FUGA — a cena do R21 rejogada: a heroína fugiu da Aranha
      do Fosso no Fosso das Aranhas, e na MESMA resposta a caçada da missão
      abriu "aranha do fosso, são 3. Estavam aqui." A fuga promete
      "ninguém te alcança"; este bloco é a promessa escrita em asserção:
      na resposta nada abre, no mesmo lugar o covil e quem ficou para trás
      não voltam, fora dali o mundo volta a valer.
   10. A LINHA DO ESCAPE — "Aranha do Fosso ficam para trás" (R21): um
      corpo "fica", dois ou mais "ficam", e a lista fecha com "e".
   11. O PREÇO DA FRASE — a frase escrita mostra o MESMO preço que o botão
      mostra, porque é a mesma conta (R21: a frase fugia às cegas). */

const RAIZ = "../src/";
const FUGA_MOD = await import(RAIZ + "fuga.js");
const COMBATE = await import(RAIZ + "combate.js");
const GRID = await import(RAIZ + "grid.js");
const CONTROLE = await import(RAIZ + "controle.js");

const {
  FUGA, PERSEGUICAO_POR_CONDICAO, quemGolpeiaAoSair, vereditoDaFuga,
  ehFuga, LINHAS_DA_FUGA, linhaDaFuga, notaDaFuga,
  LINHAS_DO_ESCAPE, linhaDoEscape, precoDaFrase,
  folegoDaFuga, folegoSegura, folegoDepoisDoTurno,
} = FUGA_MOD;
const { pedeDesengajar, ehRetirada } = COMBATE;
const { distanciaM, alcanceNatural } = GRID;
const { estaVirado } = CONTROLE;

let bons = 0, maus = 0, pendentes = 0;
const t = (nome, cond, extra) => {
  if (cond) { bons++; console.log("  ok  " + nome); }
  else { maus++; console.log("  XX  " + nome + (extra !== undefined ? " — " + JSON.stringify(extra) : "")); }
};
const pendente = (nome, motivo) => { pendentes++; console.log("  ??  " + nome + " — PENDENTE: " + motivo); };
const sec = (s) => console.log("\n" + s);

/* ---------------- AS FICHAS ----------------
   javali/bandido/zumbi por NOME, para que `tamanhoDe`/`deslocamentoDeCriatura`
   os leiam pelas mesmas tabelas que o jogo usa — nunca um tamanho ou passo
   inventado à mão. */
const heroi = (x, y, extra = {}) => ({ nome: "Heroína", vida: 18, vidaMax: 18, x, y, ...extra });
const javali = (n, x, y, extra = {}) => ({ nome: `Javali-de-pedra ${n}`, ameaca: "comum", vida: 8, x, y, ...extra });
const bandido = (x, y, extra = {}) => ({ nome: "Bandido", ameaca: "comum", vida: 10, x, y, ...extra });
const zumbi = (x, y, extra = {}) => ({ nome: "Zumbi", ameaca: "comum", vida: 10, x, y, ...extra });

sec("0. AS PEÇAS DE fuga.js BATEM COM AS TABELAS QUE ELE CITA");
{
  t("javali é médio, 1,5 m de alcance — a mesma leitura de grid.js",
    alcanceNatural(javali(1, 0, 0)) === 1.5);
  t("e o javali anda 9 m por rodada, como o cabeçalho descreve",
    (await import(RAIZ + "movimento.js")).deslocamentoDeCriatura(javali(1, 0, 0)).metros === 9);
}

sec("1. O R15 REJOGADO — heroína (0,0), passo 9, três javalis a 19,5 m");
{
  const h = heroi(0, 0);
  const j1 = javali(1, 13, 0), j2 = javali(2, 13, 1), j3 = javali(3, 13, 2);
  const inimigos = [j1, j2, j3];

  t("a posição escolhida dá 19,5 m de verdade, para os três",
    [j1, j2, j3].every((j) => distanciaM(h, j) === 19.5));

  const golpes0 = quemGolpeiaAoSair(h, inimigos, { rodada: 1 });
  t("quemGolpeiaAoSair devolve ZERO — nenhum javali toca quem está a 19,5 m",
    Array.isArray(golpes0) && golpes0.length === 0, golpes0.map((e) => e.nome));
  /* documentando o fantasma que isto substitui: o App do R15 passava a
     lista INTEIRA (3 inimigos) para `oportunidadesContraOJogador`, sem
     olhar distância nenhuma — é essa lista de 3 que vira 0 aqui. */
  t("e a lista que o R15 cobrava inteira tinha 3 — é o fantasma que este número apaga",
    inimigos.length === 3);

  const v = vereditoDaFuga({ heroi: h, inimigos, passoHeroiM: 9, rodada: 1 });
  t("a fuga do R15 ABRE: escapa", v.escapa === true);
  t("sem golpe nenhum ao sair", Array.isArray(v.golpes) && v.golpes.length === 0);
  t("ninguém alcança", Array.isArray(v.quemAlcanca) && v.quemAlcanca.length === 0);
  t("e os três perseguidores medidos ficam a 19,5 m no fim — ninguém fechou o gap",
    v.perseguidores.length === 3 && v.perseguidores.every((p) => p.distFinal === 19.5));

  const teto1 = (await import(RAIZ + "golpe.js")).TETO_DA_LINHA.chars;
  const linha = linhaDaFuga(v);
  t("a linha não é vazia", typeof linha === "string" && linha.length > 0);
  t(`a linha cabe no teto (${linha.length}/${teto1})`, linha.length <= teto1);

  const nota = notaDaFuga(v);
  t("a nota ao Narrador não é vazia — a fuga aconteceu", nota.length > 0);
  t("os três nomes aparecem na nota", [j1, j2, j3].every((j) => nota.includes(j.nome)));
  t("a nota diz que eles seguem VIVOS", /VIVOS/.test(nota));
  t("e a nota NÃO carrega metro nenhum — número de grade é o sistema falando de si",
    !/\d+(,\d+)?\s*m\b/.test(nota) && !/19,5|13\b/.test(nota));
}

sec("2. COLADO A UM DA MESMA VELOCIDADE (9 m) — nem correndo, nem desengajando");
{
  /* adjacente de verdade: 1 quadrado = 1,5 m = o alcance natural dos dois */
  const h = heroi(0, 0, { passoM: undefined });
  const b = bandido(1, 0);
  t("a montagem está mesmo colada (1,5 m = o alcance natural)",
    distanciaM(h, b) === 1.5 && distanciaM(h, b) === alcanceNatural(b));

  const correndo = vereditoDaFuga({ heroi: h, inimigos: [b], passoHeroiM: 9, desengajar: false, rodada: 1 });
  const desengajando = vereditoDaFuga({ heroi: h, inimigos: [b], passoHeroiM: 9, desengajar: true, rodada: 1 });
  t("correndo não escapa — o bandido cobre o mesmo chão que a heroína ganha",
    correndo.escapa === false);
  t("desengajando também não — o desengajo é metade do passo, e o bandido persegue no dobro",
    desengajando.escapa === false);
  t("a linha nomeia quem alcança", linhaDaFuga(correndo).includes(b.nome));
  t("e a nota é vazia — a fuga NÃO aconteceu", notaDaFuga(correndo) === "");
}

sec("3. DERRUBAR ABRE A FUGA — colado a um CAÍDO");
{
  const h = heroi(0, 0);
  const caido = bandido(1, 0, { condicoes: [{ id: "caido" }] });

  const correndo = vereditoDaFuga({ heroi: h, inimigos: [caido], passoHeroiM: 9, desengajar: false, rodada: 1 });
  const desengajando = vereditoDaFuga({ heroi: h, inimigos: [caido], passoHeroiM: 9, desengajar: true, rodada: 1 });
  t("correndo ESCAPA — levantar custa metade do deslocamento a quem está caído",
    correndo.escapa === true);
  t("e paga o golpe de quem estava colado ao sair",
    correndo.golpes.length === 1 && correndo.golpes[0] === caido.nome);
  t("desengajando NÃO escapa — o passo cai à metade dos dois lados, e o caído ainda alcança",
    desengajando.escapa === false);
}

sec("3b. COLADO A UM ZUMBI (6 m) — mais lento também abre, só correndo");
{
  const h = heroi(0, 0);
  const z = zumbi(1, 0);
  t("o zumbi de fato anda 6 m — RX_ARRASTA de movimento.js",
    (await import(RAIZ + "movimento.js")).deslocamentoDeCriatura(z).metros === 6);

  const correndo = vereditoDaFuga({ heroi: h, inimigos: [z], passoHeroiM: 9, desengajar: false, rodada: 1 });
  const desengajando = vereditoDaFuga({ heroi: h, inimigos: [z], passoHeroiM: 9, desengajar: true, rodada: 1 });
  t("correndo escapa do zumbi mais lento", correndo.escapa === true);
  t("com 1 golpe ao sair", correndo.golpes.length === 1 && correndo.golpes[0] === z.nome);
  t("desengajando não escapa — a metade do passo não abre gap do zumbi",
    desengajando.escapa === false);
}

sec("4. A ESCOLHA DO MODO — menos golpes, depois folga, e o veredito de quem corre");
{
  /* desengajar/frase ausentes: o veredito escolhe entre os dois modos.
     Um perseguidor tão lento que os DOIS modos escapam — correndo com um
     golpe (estava colado), desengajando sem nenhum: aqui folga não decide,
     GOLPES decide, e desengajando (0 golpes) tem de vencer. */
  /* amedrontado ZERA a perseguição (não corre atrás) mas NÃO tem
     `perdeAcao` — ainda reage e golpeia quem sai de perto. Colado (1,5 m),
     ele nunca fecha gap nenhum: os dois modos escapam, e o que muda entre
     eles é só o golpe de quem estava colado ao sair, que só existe
     correndo (desengajar nunca golpeia — é a promessa do próprio Desengajar). */
  const h1 = heroi(0, 0);
  const parado1 = bandido(1, 0, { condicoes: [{ id: "amedrontado" }] });
  const c1 = vereditoDaFuga({ heroi: h1, inimigos: [parado1], passoHeroiM: 9, desengajar: false, rodada: 1 });
  const d1 = vereditoDaFuga({ heroi: h1, inimigos: [parado1], passoHeroiM: 9, desengajar: true, rodada: 1 });
  t("os dois modos escapam deste perseguidor que o medo prende no lugar",
    c1.escapa === true && d1.escapa === true);
  t("correndo paga o golpe de quem estava colado; desengajar não paga golpe algum",
    c1.golpes.length === 1 && d1.golpes.length === 0);
  const escolha1 = vereditoDaFuga({ heroi: h1, inimigos: [parado1], passoHeroiM: 9, rodada: 1 });
  t("e a escolha automática prefere MENOS GOLPES: desengajando (0), não correndo (1)",
    escolha1.modo === "desengajando" && escolha1.golpes.length === 0);

  /* dois perseguidores fracos e sem posição — sem gap nenhum, os dois
     modos empatam em golpes (zero: nenhum está colado o bastante para
     bater DEPOIS de qualquer um dos dois passos), e aí desempata FOLGA:
     correndo abre mais chão do que desengajar. */
  const h2 = heroi(0, 0);
  const longe = bandido(9, 0); // 13,5 m — nem colado, nem alcançável por nenhum dos dois modos
  const escolha2 = vereditoDaFuga({ heroi: h2, inimigos: [longe], passoHeroiM: 9, rodada: 1 });
  t("sem golpe em nenhum dos dois modos, a folga desempata a favor de quem corre",
    escolha2.modo === "correndo" && escolha2.golpes.length === 0);

  /* ninguém escapa em nenhum dos dois modos: o veredito devolve o de
     quem CORRE, com escapa:false — é o "quase" mais generoso de mostrar */
  const h3 = heroi(0, 0);
  const colado = bandido(1, 0); // mesma velocidade, sempre alcança, os dois modos
  const escolha3 = vereditoDaFuga({ heroi: h3, inimigos: [colado], passoHeroiM: 9, rodada: 1 });
  t("quando NINGUÉM escapa, o veredito é o de quem corre",
    escolha3.modo === "correndo" && escolha3.escapa === false);

  /* `desengajar` explícito manda sobre a frase */
  const h4 = heroi(0, 0);
  const j = javali(1, 13, 0);
  const explicito = vereditoDaFuga({ heroi: h4, inimigos: [j], passoHeroiM: 9, desengajar: false, frase: "recuo de guarda erguida e fujo", rodada: 1 });
  t("`desengajar: false` explícito vence a frase que pedia guarda erguida",
    explicito.modo === "correndo");

  /* a frase "de guarda erguida" põe em desengajando quando não há campo explícito */
  const porFrase = vereditoDaFuga({ heroi: h4, inimigos: [j], passoHeroiM: 9, frase: "recuo de guarda erguida", rodada: 1 });
  t("e sem o campo explícito, a frase de guarda erguida basta para desengajar",
    porFrase.modo === "desengajando" && pedeDesengajar("recuo de guarda erguida") === true);
}

sec("5. PERSEGUICAO_POR_CONDICAO — lida de volta da tabela, nunca copiada");
{
  t("a tabela tem as seis condições que o cabeçalho promete, e só elas",
    Object.keys(PERSEGUICAO_POR_CONDICAO).sort().join(",") ===
    ["caido", "lento", "agarrado", "paralisado", "atordoado", "amedrontado"].sort().join(","));
  t("caído e lento cortam a METADE, agarrado/paralisado/atordoado/amedrontado ZERAM",
    PERSEGUICAO_POR_CONDICAO.caido === 0.5 && PERSEGUICAO_POR_CONDICAO.lento === 0.5
    && [PERSEGUICAO_POR_CONDICAO.agarrado, PERSEGUICAO_POR_CONDICAO.paralisado,
      PERSEGUICAO_POR_CONDICAO.atordoado, PERSEGUICAO_POR_CONDICAO.amedrontado].every((v) => v === 0));

  /* a conta feita COM os números da tabela, não com um "9" ou "4,5" à mão */
  const h = heroi(0, 0);
  const passoDoJavali = (await import(RAIZ + "movimento.js")).deslocamentoDeCriatura(javali(1, 0, 0)).metros;
  const lento = javali(1, 13, 0, { condicoes: [{ id: "lento" }] });
  const v = vereditoDaFuga({ heroi: h, inimigos: [lento], passoHeroiM: 9, desengajar: false, rodada: 1 });
  const corridaDeleEsperada = Math.round(passoDoJavali * FUGA.perseguicao * PERSEGUICAO_POR_CONDICAO.lento * 10) / 10;
  t("o javali lento persegue exatamente passo × FUGA.perseguicao × 0,5 da tabela",
    v.perseguidores[0].corridaDele === corridaDeleEsperada, { esperado: corridaDeleEsperada, obtido: v.perseguidores[0].corridaDele });

  /* o PIOR fator entre várias condições: lento (0,5) + paralisado (0) → 0 */
  const h2 = heroi(0, 0);
  const varias = javali(1, 1, 0, { condicoes: [{ id: "lento" }, { id: "paralisado" }] });
  const v2 = vereditoDaFuga({ heroi: h2, inimigos: [varias], passoHeroiM: 9, desengajar: false, rodada: 1 });
  t("com duas condições, vale a PIOR (o menor fator) — aqui, o zero do paralisado",
    v2.perseguidores[0].corridaDele === 0);
  t("e por estar paralisado (perde a ação), ele NÃO golpeia ao ver a heroína sair",
    v2.golpes.length === 0);

  /* marionete (estaVirado) não golpeia nem persegue: o turno dele é
     contra os próprios, não contra quem foge */
  const h3 = heroi(0, 0);
  const virado = javali(1, 1, 0, { virado: { ate: 5, por: "Discórdia" } });
  t("a montagem está mesmo virada nesta rodada — a mesma leitura de controle.js",
    estaVirado(virado, 1) === true);
  const v3 = vereditoDaFuga({ heroi: h3, inimigos: [virado], passoHeroiM: 9, desengajar: false, rodada: 1 });
  t("quem está virado não golpeia ao sair", v3.golpes.length === 0);
  t("nem entra na lista de perseguidores", v3.perseguidores.length === 0);
  t("e por isso a fuga abre sozinha, mesmo colado", v3.escapa === true);

  /* sem posição conta como colado — o gap nasce zero, não infinito */
  const h4 = heroi(0, 0);
  const semPos = { nome: "Sombra", ameaca: "comum", vida: 6 };
  const golpesSemPos = quemGolpeiaAoSair(h4, [semPos], { rodada: 1 });
  t("sem posição, quem golpeia ao sair inclui o inimigo (colado por convenção)",
    golpesSemPos.length === 1 && golpesSemPos[0] === semPos);

  /* herói parado (passo 0) não foge, e a linha diz por quê */
  const parado = vereditoDaFuga({ heroi: heroi(0, 0), inimigos: [javali(1, 13, 0)], passoHeroiM: 0, rodada: 1 });
  t("passo 0: a fuga não abre", parado.escapa === false && parado.parado === true);
  t("e a linha diz que não dá para sair do lugar", linhaDaFuga(parado) === LINHAS_DA_FUGA.parado());

  /* o mesmo por agarrado, lido das PERNAS do herói (deslocamentoDe), sem passoHeroiM */
  const heroiAgarrado = heroi(0, 0, { condicoes: [{ id: "agarrado" }] });
  const parado2 = vereditoDaFuga({ heroi: heroiAgarrado, inimigos: [javali(1, 13, 0)], rodada: 1 });
  t("agarrado (sem passo declarado, lido de deslocamentoDe): também não foge",
    parado2.escapa === false && parado2.parado === true);
}

sec("6. A LINHA — sempre dentro do teto, sempre voz de mundo");
{
  const TETO = (await import(RAIZ + "golpe.js")).TETO_DA_LINHA;
  const nomeGigante = "Sentinela-Comandante-Terrível-das-Sombras-Eternas-da-Masmorra";
  t("o nome de teste é mesmo gigante (40+)", nomeGigante.length >= 40);

  const gigante1 = { ...bandido(1, 0), nome: nomeGigante };
  const gigante2 = { ...javali(2, 1, 1), nome: nomeGigante + "-2" };
  const casos = [
    vereditoDaFuga({ heroi: heroi(0, 0), inimigos: [javali(1, 13, 0)], passoHeroiM: 9, rodada: 1 }), // limpa, ninguém alcança
    vereditoDaFuga({ heroi: heroi(0, 0), inimigos: [gigante1], passoHeroiM: 9, rodada: 1 }), // colado e da mesma velocidade: NÃO escapa, um nome gigante alcança
    vereditoDaFuga({ heroi: heroi(0, 0), inimigos: [gigante1, gigante2], passoHeroiM: 9, rodada: 1 }), // dois colados: NÃO escapa, plural "alcançam"
    vereditoDaFuga({ heroi: heroi(0, 0), inimigos: [{ ...gigante1, condicoes: [{ id: "caido" }] }], passoHeroiM: 9, desengajar: false, rodada: 1 }), // escapa CORRENDO, pagando o golpe do nome gigante
    vereditoDaFuga({ heroi: heroi(0, 0), inimigos: [], passoHeroiM: 0, rodada: 1 }), // herói parado
  ];
  const linhas = casos.map(linhaDaFuga);
  t("todas as linhas cabem no teto, mesmo com nome de 40+ caracteres" +
    (linhas.some((l) => l.length > TETO.chars) ? " — " + linhas.filter((l) => l.length > TETO.chars).join(" | ") : ""),
    linhas.every((l) => l.length <= TETO.chars));

  const MECANISMO = /desengaj|disparada|sistema|\bmodo\b/i;
  t("nenhuma linha nomeia o mecanismo por trás dela",
    linhas.every((l) => !MECANISMO.test(l)), linhas);
  const notas = casos.map(notaDaFuga);
  t("e a nota ao narrador também não nomeia 'sistema' fora do cabeçalho fixo do aviso",
    notas.every((n) => !n || /\[FUGA — RESOLVIDA PELO SISTEMA\]/.test(n)));
}

sec("7. ehFuga — o detector, e a fronteira dos vetos");
{
  const positivas = [
    "fujo", "fugir", "bato em retirada", "dou no pé", "saio correndo",
    "corro para longe", "escapo da luta", "bloqueio o golpe e fujo", "se ficar feio, fujo",
  ];
  for (const f of positivas) t(`"${f}" é fuga`, ehFuga(f) === true);

  const negativas = [
    "recuo dois passos e observo", "não fujo", "não deixo o javali fugir",
    "corro atrás do javali que está fugindo", "Grito para Elma: fuja!", "mando o garoto fugir",
  ];
  for (const f of negativas) t(`"${f}" NÃO é fuga`, ehFuga(f) === false);

  /* a ordem dada a outro não pode encerrar a luta do herói — é o caso
     mais perigoso, porque "fuja" está lá, gritado bem alto */
  t("a ordem gritada a Elma não encerra a luta do herói (o veto específico)",
    ehFuga("Grito para Elma: fuja!") === false);

  /* ehRetirada é outra pergunta (só afastar-se), e casa a lista de
     retirada só quando NÃO pede desengajar — amostra dos dois lados */
  const amostraRetirada = [
    "recuo dois passos e observo", "me afasto com cuidado", "recuo de guarda erguida",
    "bato em retirada", "dou meia volta e corro", "não fujo", "ataco com fúria",
  ];
  for (const f of amostraRetirada) {
    const RX_RETIRADA_CASA = /\b(recuo|recuar|me afasto|afasto-me|me distancio|fujo|fugir|bato em retirada|dou meia.volta|saio de perto|corro para (fora|longe)|volto correndo)\b/;
    const t2 = f.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    const esperado = RX_RETIRADA_CASA.test(t2) && !pedeDesengajar(f);
    t(`ehRetirada("${f}") === casa a lista de retirada && !pedeDesengajar`,
      ehRetirada(f) === esperado);
  }

  /* lixo não estoura */
  let estourou = "";
  for (const l of [null, undefined, {}, 0, [], 7, NaN]) {
    try { if (typeof ehFuga(l) !== "boolean") estourou += "forma torta em " + JSON.stringify(l) + " "; }
    catch (e) { estourou += JSON.stringify(l) + ":" + e.message + " "; }
  }
  t("ehFuga nunca estoura com lixo" + (estourou ? " — " + estourou : ""), estourou === "");
}

sec("8. DETERMINISMO, IMUTABILIDADE E LIXO");
{
  const h = heroi(0, 0);
  const inimigos = [javali(1, 13, 0), javali(2, 13, 1), bandido(1, 0, { condicoes: [{ id: "caido" }] })];

  const a = vereditoDaFuga({ heroi: h, inimigos, passoHeroiM: 9, rodada: 1 });
  const b = vereditoDaFuga({ heroi: h, inimigos, passoHeroiM: 9, rodada: 1 });
  t("mesma entrada, mesmo veredito, caractere por caractere", JSON.stringify(a) === JSON.stringify(b));
  t("e é estrutura nova a cada chamada", a !== b && a.perseguidores !== b.perseguidores);

  /* entradas CONGELADAS não podem quebrar nem ser mutadas */
  const hCong = Object.freeze(heroi(0, 0));
  const inimCong = Object.freeze([Object.freeze(javali(1, 13, 0)), Object.freeze(bandido(1, 0))]);
  let estourouCongelado = "";
  try {
    const antes = JSON.stringify(inimCong);
    vereditoDaFuga({ heroi: hCong, inimigos: inimCong, passoHeroiM: 9, rodada: 1 });
    quemGolpeiaAoSair(hCong, inimCong, { rodada: 1 });
    if (JSON.stringify(inimCong) !== antes) estourouCongelado += "mutou a lista congelada ";
  } catch (e) { estourouCongelado += e.message; }
  t("entradas congeladas (Object.freeze) não quebram nem são mutadas" + (estourouCongelado ? " — " + estourouCongelado : ""),
    estourouCongelado === "");

  /* `= {}` no destructuring NÃO cobre `null` — cada forma de lixo testada */
  const lixos = [
    undefined, null, {}, 0, "", [], 7, NaN, "string qualquer",
    { heroi: null, inimigos: null },
    { heroi: {}, inimigos: [null, undefined, 0, "x", {}] },
    { heroi: h, inimigos: [{ nome: null, vida: "oito", x: "a", y: null }] },
    { heroi: h, inimigos, passoHeroiM: "nove" },
    { heroi: h, inimigos, desengajar: "talvez" },
    { heroi: h, inimigos, frase: null },
    { heroi: h, inimigos, rodada: null },
  ];
  let estourouLixo = "";
  for (const l of lixos) {
    try {
      const v = vereditoDaFuga(l);
      if (!v || typeof v.escapa !== "boolean" || !Array.isArray(v.golpes)) estourouLixo += "forma torta em " + JSON.stringify(l) + " ";
      linhaDaFuga(v);
      notaDaFuga(v);
    } catch (e) { estourouLixo += JSON.stringify(l) + ":" + e.message + " "; }
  }
  for (const l of [undefined, null, {}, 0, "", [], 7, NaN]) {
    try { quemGolpeiaAoSair(l, l, l); } catch (e) { estourouLixo += "quemGolpeiaAoSair(" + JSON.stringify(l) + "):" + e.message + " "; }
  }
  t("nenhum lixo derruba o veredito, a linha ou a nota" + (estourouLixo ? " — " + estourouLixo : ""), estourouLixo === "");

  /* só null/undefined/não-objeto caem no piso vazio de `linhaDaFuga`; um
     `{}` é uma FORMA de veredito (só que sem `escapa`), e cai — de
     propósito — no ramo de "alguém te alcança", nunca em exceção */
  t("linhaDaFuga(null/undefined/lixo não-objeto) devolve string vazia",
    linhaDaFuga(null) === "" && linhaDaFuga(undefined) === "" && linhaDaFuga(0) === "" && linhaDaFuga("x") === "");
  const tetoAqui = (await import(RAIZ + "golpe.js")).TETO_DA_LINHA.chars;
  t("e linhaDaFuga({}) não estoura — é string, e cabe no teto",
    typeof linhaDaFuga({}) === "string" && linhaDaFuga({}).length <= tetoAqui);
  t("notaDaFuga(null) não estoura e devolve string vazia", notaDaFuga(null) === "" && notaDaFuga(undefined) === "" && notaDaFuga({}) === "");
}

sec("9. O FÔLEGO DA FUGA — a cena do R21: fugiu da Aranha do Fosso no Fosso das Aranhas");
{
  /* As funções têm de EXISTIR antes de serem provadas: contra o fuga.js de
     antes do R21 este bloco fica vermelho aqui, e não num TypeError que
     esconderia o resto da suíte. */
  const existem = [folegoDaFuga, folegoSegura, folegoDepoisDoTurno].every((f) => typeof f === "function");
  t("folegoDaFuga, folegoSegura e folegoDepoisDoTurno existem", existem);
  if (existem) {
    /* a aranha longe o bastante para a fuga abrir de verdade — o veredito
       sai de vereditoDaFuga, não de um objeto montado à mão */
    const h = heroi(0, 0);
    const aranha = { nome: "Aranha do Fosso", ameaca: "comum", vida: 12, x: 30, y: 0 };
    const v = vereditoDaFuga({ heroi: h, inimigos: [aranha], passoHeroiM: 9, rodada: 1 });
    t("a montagem escapa de verdade (pré-condição da cena)", v.escapa === true, v.motivo);

    const ONDE = ["Fosso das Aranhas"];
    const f = folegoDaFuga(v, ONDE);
    t("o fôlego nasce com o lugar, quem ficou e naResposta",
      !!f && f.naResposta === true && f.lugares.join() === "Fosso das Aranhas" && f.deixados.join() === "Aranha do Fosso", f);

    /* 1. na resposta da própria fuga: NADA abre, venha de onde vier — é
       exatamente a luta que o R21 viu abrir */
    for (const origem of ["cacada", "virada", "emboscada"]) {
      t(`na resposta da fuga, segura a ${origem}`,
        folegoSegura(f, { lugares: ONDE, origem, criatura: "aranha do fosso" }) === true);
    }
    t("na resposta segura até a emboscada de OUTRA criatura — nenhuma luta aberta pelo sistema",
      folegoSegura(f, { lugares: ONDE, origem: "emboscada", criatura: "Bandido" }) === true);

    /* 2. o turno seguinte, ainda no fosso (com artigo e sem acento, como o
       Narrador escreve: a comparação é a tolerante do mesmoLugar do App) */
    const f2 = folegoDepoisDoTurno(f, ["o Fosso das Aranhas"]);
    t("depois do turno, no mesmo lugar, o fôlego continua — sem naResposta",
      !!f2 && f2.naResposta === false && f2.deixados.join() === "Aranha do Fosso", f2);
    t("e é estrutura nova — o registro de antes não foi mutado",
      f2 !== f && f.naResposta === true);
    t("no mesmo lugar, a caçada continua segura (o covil não se reabre sozinho)",
      folegoSegura(f2, { lugares: ONDE, origem: "cacada" }) === true);
    t("e a emboscada de ARANHA continua segura (quem ficou para trás não aparece à frente)",
      folegoSegura(f2, { lugares: ONDE, origem: "emboscada", criatura: "aranha do fosso" }) === true);
    t("inclusive quando o bando vem numerado ('Aranha do Fosso 2')",
      folegoSegura(f2, { lugares: ONDE, origem: "emboscada", criatura: "Aranha do Fosso 2" }) === true);
    t("mas a emboscada de um BANDIDO passa — o mundo não parou",
      folegoSegura(f2, { lugares: ONDE, origem: "emboscada", criatura: "Bandido" }) === false);
    t("e a emboscada sem criatura dita também passa — não se segura o que não se sabe quem é",
      folegoSegura(f2, { lugares: ONDE, origem: "emboscada" }) === false);
    t("a virada passa depois da resposta — não é o covil nem quem ficou",
      folegoSegura(f2, { lugares: ONDE, origem: "virada" }) === false);

    /* 3. saiu do lugar: o fôlego acaba e nada fica seguro */
    t("em outro lugar, mesmo com o fôlego vivo, nada fica seguro",
      folegoSegura(f2, { lugares: ["Estrada"], origem: "cacada" }) === false
      && folegoSegura(f2, { lugares: ["Estrada"], origem: "emboscada", criatura: "aranha do fosso" }) === false);
    t("e o turno na Estrada acaba o fôlego (null)",
      folegoDepoisDoTurno(f2, ["Estrada"]) === null);
    t("com o fôlego acabado, nada segura",
      folegoSegura(null, { lugares: ONDE, origem: "cacada" }) === false);

    /* o LUGAR é o mais interno: fugir na praça não protege o mercado da
       mesma cidade, mas vale em qualquer canto do ponto de onde se fugiu */
    const naPraca = folegoDepoisDoTurno(folegoDaFuga(v, ["Praça de Escambo", "Baixo do Eco"]), ["Praça de Escambo", "Baixo do Eco"]);
    t("fugiu na Praça de Escambo: ainda na praça, a caçada fica segura",
      folegoSegura(naPraca, { lugares: ["Praça de Escambo", "Baixo do Eco"], origem: "cacada" }) === true);
    t("no Mercado da mesma cidade, não — a cidade não é o covil",
      folegoSegura(naPraca, { lugares: ["Mercado", "Baixo do Eco"], origem: "cacada" }) === false
      && folegoDepoisDoTurno(naPraca, ["Mercado", "Baixo do Eco"]) === null);

    /* quem não escapou não tem fôlego */
    const colado = vereditoDaFuga({ heroi: heroi(0, 0), inimigos: [bandido(1, 0)], passoHeroiM: 9, rodada: 1 });
    t("fuga que não abriu não dá fôlego (null)", colado.escapa === false && folegoDaFuga(colado, ONDE) === null);

    /* determinismo e lixo: a lei de sempre, e `= {}` não cobre null */
    t("mesma entrada, mesmo fôlego",
      JSON.stringify(folegoDaFuga(v, ONDE)) === JSON.stringify(folegoDaFuga(v, ONDE)));
    let estourou = "";
    const lixos = [undefined, null, {}, 0, "", [], 7, "x", { escapa: true }, { escapa: true, deixados: null },
      { lugares: null, deixados: null, naResposta: false }, { lugares: "Fosso", naResposta: false }];
    for (const l of lixos) {
      try {
        folegoDaFuga(l, l); folegoDaFuga(l, null);
        if (typeof folegoSegura(l, l) !== "boolean") estourou += "folegoSegura torta em " + JSON.stringify(l) + " ";
        folegoSegura(l, null); folegoSegura(f2, l);
        folegoDepoisDoTurno(l, l); folegoDepoisDoTurno(f2, l);
      } catch (e) { estourou += JSON.stringify(l) + ":" + e.message + " "; }
    }
    t("nenhum lixo derruba o fôlego" + (estourou ? " — " + estourou : ""), estourou === "");
    t("fôlego com escapa mas sem lugar nenhum: segura na resposta, e acaba no turno seguinte",
      folegoSegura(folegoDaFuga({ escapa: true }, null), { origem: "cacada" }) === true
      && folegoDepoisDoTurno(folegoDaFuga({ escapa: true }, null), ONDE) === null);
  }
}

sec("10. A LINHA DO ESCAPE — um fica, dois ficam, e a lista fecha com 'e'");
{
  const existe = typeof linhaDoEscape === "function" && !!LINHAS_DO_ESCAPE;
  t("linhaDoEscape e LINHAS_DO_ESCAPE existem", existe);
  if (existe) {
    const esc = (deixados) => linhaDoEscape({ escapa: true, deixados });
    /* o R21: um nome só, e o verbo no plural */
    t("1 deixado: 'fica' — o erro jogado no R21 era 'Aranha do Fosso ficam'",
      esc(["Aranha do Fosso"]) === LINHAS_DO_ESCAPE.um("Aranha do Fosso")
      && /Aranha do Fosso fica para trás/.test(esc(["Aranha do Fosso"])), esc(["Aranha do Fosso"]));
    t("2 deixados: 'A e B ficam'",
      esc(["Javali", "Bandido"]) === LINHAS_DO_ESCAPE.varios("Javali e Bandido"), esc(["Javali", "Bandido"]));
    t("3 deixados: 'A, B e C ficam'",
      esc(["Javali", "Bandido", "Zumbi"]) === LINHAS_DO_ESCAPE.varios("Javali, Bandido e Zumbi"), esc(["Javali", "Bandido", "Zumbi"]));
    t("0 deixados: frase inteira, sem sujeito vazio nem vírgula órfã",
      esc([]) === LINHAS_DO_ESCAPE.sozinho() && !/—\s+fica|\s,|—\s*$/.test(esc([])), esc([]));
    /* o bando numerado da caçada vira um nome com a contagem — e a
       concordância conta CORPOS: três aranhas "ficam" */
    t("o bando numerado junta-se: 'Aranha do Fosso ×3 ficam'",
      esc(["Aranha do Fosso 1", "Aranha do Fosso 2", "Aranha do Fosso 3"]) === LINHAS_DO_ESCAPE.varios("Aranha do Fosso ×3"),
      esc(["Aranha do Fosso 1", "Aranha do Fosso 2", "Aranha do Fosso 3"]));
    t("a linha real, saída de um veredito, bate com a tabela",
      linhaDoEscape(vereditoDaFuga({ heroi: heroi(0, 0), inimigos: [javali(1, 13, 0), javali(2, 13, 1)], passoHeroiM: 9, rodada: 1 }))
        === LINHAS_DO_ESCAPE.varios("Javali-de-pedra ×2"));
    const MECANISMO = /desengaj|disparada|sistema|\bmodo\b/i;
    t("nenhuma linha do escape nomeia o mecanismo",
      [esc([]), esc(["A"]), esc(["A", "B"])].every((l) => !MECANISMO.test(l)));
    let estourou = "";
    for (const l of [undefined, null, {}, 0, "", [], 7, { deixados: null }, { deixados: [null, "", 3] }]) {
      try { if (typeof linhaDoEscape(l) !== "string" || !linhaDoEscape(l)) estourou += "vazia em " + JSON.stringify(l) + " "; }
      catch (e) { estourou += JSON.stringify(l) + ":" + e.message + " "; }
    }
    t("linhaDoEscape nunca estoura nem devolve vazio" + (estourou ? " — " + estourou : ""), estourou === "");
  }

  /* a nota ao Narrador com a mesma gramática: dois golpes são "os golpes
     de A e B", e a lista de quem ficou fecha com "e" */
  const nota = notaDaFuga({ escapa: true, quem: "Heroína", modo: "correndo", golpes: ["Javali", "Bandido"], deixados: ["Javali", "Bandido", "Zumbi"] });
  t("a nota com dois golpes diz 'os golpes de Javali e Bandido'", /os golpes de Javali e Bandido/.test(nota), nota);
  t("a nota lista quem ficou com 'e' no último", /Javali, Bandido e Zumbi/.test(nota), nota);
  const nota1 = notaDaFuga({ escapa: true, quem: "Heroína", modo: "correndo", golpes: ["Javali"], deixados: ["Aranha do Fosso"] });
  t("com um golpe só, 'o golpe de Javali'", /o golpe de Javali\b/.test(nota1), nota1);
  /* "Não os mate" errava para uma aranha só: a frase não pode depender de
     número nem de gênero de quem ficou */
  t("e a nota não flexiona 'os' para uma criatura só", !/\bos mate\b|\bos faça\b/.test(nota1), nota1);
}

sec("11. O PREÇO DA FRASE — a frase escrita vê o mesmo preço que o botão");
{
  const existe = typeof precoDaFrase === "function";
  t("precoDaFrase existe", existe);
  if (existe) {
    const { VERBO_DE_FUGA } = await import(RAIZ + "tela-de-batalha.js");
    const h = heroi(0, 0);
    /* colado a um caído: correndo escapa com um golpe, recuando não — o
       modo muda o preço, e por isso a frase tem de ler o mesmo modo */
    const mesa = { heroi: h, inimigos: [bandido(1, 0, { condicoes: [{ id: "caido" }] })], passoHeroiM: 9, rodada: 1 };
    const doBotao = linhaDaFuga(vereditoDaFuga({ ...mesa, frase: VERBO_DE_FUGA.frase }));
    const daTela = linhaDaFuga(vereditoDaFuga(mesa));
    t("o botão e a tela já liam o mesmo preço (a frase do botão não força modo)", doBotao === daTela, { doBotao, daTela });
    t("'recuo depressa e fujo' mostra o MESMO preço que o botão",
      precoDaFrase({ ...mesa, frase: "recuo depressa e fujo" }) === doBotao, precoDaFrase({ ...mesa, frase: "recuo depressa e fujo" }));
    /* e o preço mostrado é o que acontece ao enviar: fugirDaLuta chama
       vereditoDaFuga com a própria frase — a mesma conta */
    const guarda = "recuo de guarda erguida e fujo";
    t("a frase 'de guarda erguida' lê o recuo — e mostra o preço desse modo",
      precoDaFrase({ ...mesa, frase: guarda }) === linhaDaFuga(vereditoDaFuga({ ...mesa, frase: guarda }))
      && vereditoDaFuga({ ...mesa, frase: guarda }).modo === "desengajando");
    t("que aqui é outro preço: recuando, o caído ainda alcança",
      precoDaFrase({ ...mesa, frase: guarda }) !== doBotao);
    t("frase que não é fuga devolve vazio",
      precoDaFrase({ ...mesa, frase: "ataco o bandido" }) === "" && precoDaFrase({ ...mesa, frase: "não fujo" }) === "");
    let estourou = "";
    for (const l of [undefined, null, {}, 0, "", [], 7, { frase: "fujo" }, { frase: "fujo", heroi: null, inimigos: null }, { ...mesa, frase: null }]) {
      try { if (typeof precoDaFrase(l) !== "string") estourou += "torta em " + JSON.stringify(l) + " "; }
      catch (e) { estourou += JSON.stringify(l) + ":" + e.message + " "; }
    }
    t("precoDaFrase nunca estoura (é lida a cada tecla)" + (estourou ? " — " + estourou : ""), estourou === "");
  }
}

console.log(`\nfuga: ${bons} passaram, ${maus} falharam${pendentes ? `, ${pendentes} pendentes` : ""}`);
process.exit(maus ? 1 : 0);
