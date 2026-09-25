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
      mostra, porque é a mesma conta (R21: a frase fugia às cegas).

   NADA SAI DE GRAÇA — a terceira volta, pedida pela pessoa: "o arqueiro
   pode errar o tiro, mas ele pode se fortalecer e ir atrás do personagem;
   a consequência pode não ser dano, pode ser outra".
   12. QUEM ATACA DE LONGE não segura quem foge: sai da corrida e dispara
      uma vez, com desvantagem além da metade do alcance. Colado, golpeia
      como qualquer um — nunca os dois.
   13. A CHANCE antes do clique é EXATA: provada face por face contra o
      próprio resolverAtaque, com a sorte semeada a entregar cada face.
   14. A VOZ da chance: faixas lidas da tabela, dentro do teto, sem número.
   15. O CUSTO ROLADO com semente: a cena do Atirador rejogada com duas
      sementes, uma que acerta e uma que erra; a mesma semente, o mesmo
      golpe; e sem semente o combate de sempre, byte por byte.
   16. A CONSEQUÊNCIA que não é dano: os javalis do R15 e o Comandante
      rejogados, em números — e nunca uma fuga sem consequência.
   17. O BANDO QUE VOLTA e o território: o reforço pela tabela, o save
      atravessado, a luta que abre ao encher e a que abre ao voltar. */

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


/* ================== NADA SAI DE GRAÇA — a terceira volta ================== */
const {
  QUEM_ATACA_DE_LONGE, atacaDeLonge, DISPARO_NA_FUGA, chanceDeAcerto, FAIXAS_DA_CHANCE,
  rolarOCustoDaFuga, CONSEQUENCIAS_DA_FUGA, FAMA_DA_FUGA, REFORCO_DA_PERSEGUICAO,
  consequenciaDaFuga, bandoAoVoltar, lutaAoEncher, relogioDoTerritorio,
} = FUGA_MOD;
const { resolverAtaque, ladosDoDado, bonusContraOJogador, defesaDe, d, d20, danoDe, oportunidadesContraOJogador } = COMBATE;
const { ALCANCES } = await import(RAIZ + "golpe.js");
const { TETO_DA_LINHA } = await import(RAIZ + "golpe.js");
const { rng } = await import(RAIZ + "semente.js");
const { degrauDaCriatura, DEGRAUS } = await import(RAIZ + "degraus.js");
const { MAX_RELOGIOS, criarRelogio, garantirRelogios, avancar, avancarUm } = await import(RAIZ + "relogios.js");

/* A FICHA da heroína: destreza 2 → defesa 12 por defesaDe, a conta que o
   golpe de verdade usa. É a mesma dos javalis do R15 (18 PV). */
const ficha = (extra = {}) => ({ nome: "Heroína", vida: 18, vidaMax: 18, atributos: { destreza: 2 }, ...extra });
const atirador = (x, y, extra = {}) => ({ nome: "Atirador", ameaca: "comum", vida: 10, x, y, ...extra });

/* A SORTE QUE ENTREGA FACES: cada chamada devolve o número que faz d(20)
   cair na face pedida — (f − ½)/20. É por aqui que a suíte prova a chance
   face por face contra o resolverAtaque de verdade. */
const faces = (...fs) => { let i = 0; return () => (fs[Math.min(i++, fs.length - 1)] - 0.5) / 20; };

sec("12. QUEM ATACA DE LONGE — não segura quem foge: cobra");
{
  t("a tabela de quem ataca de longe existe e cada linha tem id e regex",
    QUEM_ATACA_DE_LONGE.length >= 2 && QUEM_ATACA_DE_LONGE.every((q) => q.id && q.rx instanceof RegExp));
  const deLonge = ["Atirador", "Arqueira do Bosque", "Besteiro 2", "Fundibulário", "Mago Cinzento", "Feiticeira", "Bruxa do Pântano", "Xamã", "Lich", "Sacerdote Sombrio", "Franco-atirador"];
  const deperto = ["Bandido", "Javali-de-pedra 1", "Zumbi", "Cultista", "Soldado", "Comandante", "Aranha do Fosso", "Magistrado", "Imagem"];
  t("quem a tabela chama de longe, é de longe", deLonge.every((n) => atacaDeLonge({ nome: n })), deLonge.filter((n) => !atacaDeLonge({ nome: n })));
  t("e quem luta de perto não entra — nem por pedaço de palavra ('Magistrado' não é mago)",
    deperto.every((n) => !atacaDeLonge({ nome: n })), deperto.filter((n) => atacaDeLonge({ nome: n })));
  t("o campo `distancia` das invocações basta", atacaDeLonge({ nome: "Autômato Sentinela", distancia: true }));
  t("e o desc 'perigoso à distância' do bestiário também, no dia em que chegar à mesa",
    atacaDeLonge({ nome: "Vulto", desc: "perigoso à distância" }));
  t("lixo não é de longe", [null, undefined, 0, "Atirador", {}].every((x) => atacaDeLonge(x) === false));

  t("o alcance do disparo é o da arma de longe (golpe.js), e a faixa longa é a metade dele",
    DISPARO_NA_FUGA.alcance === ALCANCES.armaDeLonge && DISPARO_NA_FUGA.longaAcimaDe === ALCANCES.armaDeLonge / 2);

  /* a cena (b): o Atirador a 19,5 m — a casa de grade mais perto de 20 m
     (13 quadrados). Além de 18 m, desvantagem. */
  const h = heroi(0, 0);
  const a = atirador(13, 0);
  t("a montagem dá 19,5 m", distanciaM(h, a) === 19.5);
  const v = vereditoDaFuga({ heroi: h, inimigos: [a], passoHeroiM: 9, rodada: 1, ficha: ficha() });
  t("o Atirador não persegue: fora dos perseguidores, ninguém alcança, a fuga abre",
    v.escapa === true && v.perseguidores.length === 0 && v.quemAlcanca.length === 0);
  t("e ele dispara UMA vez, a 19,5 m, com desvantagem",
    v.disparos.length === 1 && v.disparos[0].nome === "Atirador" && v.disparos[0].distanciaM === 19.5 && v.disparos[0].desvantagem === true, v.disparos);
  t("sem golpe nenhum — ele não estava colado", v.golpes.length === 0);
  t("e continua entre quem ficou para trás, vivo no mundo", v.deixados.includes("Atirador"));

  const a18 = atirador(12, 7);
  t("a 18 m exatos (a metade), sem desvantagem — a faixa longa começa DEPOIS da metade",
    distanciaM(h, a18) === 18 && vereditoDaFuga({ heroi: h, inimigos: [a18], passoHeroiM: 9, ficha: ficha() }).disparos[0].desvantagem === false);
  const longe = atirador(25, 0);
  t("além do alcance (37,5 m), não dispara", distanciaM(h, longe) > DISPARO_NA_FUGA.alcance
    && vereditoDaFuga({ heroi: h, inimigos: [longe], passoHeroiM: 9, ficha: ficha() }).disparos.length === 0);

  /* COLADO A UM ATIRADOR conta como colado: golpe ao sair, não disparo,
     nunca os dois. E ele não segura — um Bandido colado segura. */
  const colado = atirador(1, 0);
  const corre = vereditoDaFuga({ heroi: h, inimigos: [colado], passoHeroiM: 9, desengajar: false, ficha: ficha() });
  t("colado a um Atirador, correndo: escapa, com o golpe dele e sem disparo",
    corre.escapa === true && corre.golpes.length === 1 && corre.golpes[0] === "Atirador" && corre.disparos.length === 0);
  const recua = vereditoDaFuga({ heroi: h, inimigos: [colado], passoHeroiM: 9, desengajar: true, ficha: ficha() });
  t("recuando de guarda erguida: nem golpe nem disparo", recua.escapa === true && recua.golpes.length === 0 && recua.disparos.length === 0);
  t("o Bandido na mesma casa segura a fuga — o Atirador não",
    vereditoDaFuga({ heroi: h, inimigos: [bandido(1, 0)], passoHeroiM: 9, desengajar: false }).escapa === false);

  /* quem não pode reagir não dispara: o atordoado perde a ação */
  t("o Atirador atordoado não dispara",
    vereditoDaFuga({ heroi: h, inimigos: [atirador(13, 0, { condicoes: [{ id: "atordoado" }] })], passoHeroiM: 9, ficha: ficha() }).disparos.length === 0);
  /* um arqueiro NÃO segura, mas o javali ao lado dele segura — a fuga é de todos */
  const misto = vereditoDaFuga({ heroi: h, inimigos: [atirador(13, 0), bandido(1, 0)], passoHeroiM: 9, desengajar: false });
  t("com um Bandido colado ao lado do Atirador, é o Bandido quem alcança", misto.escapa === false && misto.quemAlcanca.join() === "Bandido");
}

sec("13. A CHANCE — exata, provada face por face contra o resolverAtaque");
{
  /* A PROVA: para cada face (ou par de faces, com vantagem/desvantagem), o
     resolverAtaque de verdade rola com a sorte que entrega aquela face, e
     conta-se quantas acertam. A chance tem de ser essa contagem, sem erro. */
  const alvoDe = (dex) => ({ nome: "Alvo", atributos: { destreza: dex } });
  const acerta = (r) => r.resultado === "acerta" || r.resultado === "critico";
  const contar = ({ bonus, dex, vantagem, desvantagem }) => {
    const alvo = alvoDe(dex);
    const duplo = (vantagem && !desvantagem) || (desvantagem && !vantagem);
    let hits = 0, total = 0;
    for (let f = 1; f <= 20; f++) {
      for (let g = 1; g <= (duplo ? 20 : 1); g++) {
        const r = resolverAtaque({ atacante: "X", alvo, ehAtacanteInimigo: true, bonusAtaque: bonus, danoBase: 3, vantagem, desvantagem, rolar: faces(f, g) });
        total++; if (acerta(r)) hits++;
      }
    }
    return hits / total;
  };
  let divergiu = "";
  for (const bonus of [-5, 0, 3, 5, 8, 15, 30]) {
    for (const dex of [-2, 0, 2, 6]) {
      for (const [vantagem, desvantagem] of [[false, false], [true, false], [false, true], [true, true]]) {
        const esperado = contar({ bonus, dex, vantagem, desvantagem });
        const dita = chanceDeAcerto({ bonus, defesa: defesaDe(alvoDe(dex)), vantagem, desvantagem });
        if (Math.abs(esperado - dita) > 1e-12) divergiu += `b${bonus} d${dex} v${vantagem} x${desvantagem}: ${dita} vs ${esperado}; `;
      }
    }
  }
  t("chanceDeAcerto bate com o resolverAtaque em 112 combinações (bônus × defesa × vantagem)" + (divergiu ? " — " + divergiu : ""), divergiu === "");
  t("o 1 natural erra sempre: bônus enorme nunca passa de 19/20", chanceDeAcerto({ bonus: 99, defesa: 10 }) === 0.95);
  t("o 20 natural acerta sempre: defesa impossível nunca desce de 1/20", chanceDeAcerto({ bonus: 0, defesa: 99 }) === 0.05);
  t("vantagem é o melhor de dois, desvantagem o pior",
    chanceDeAcerto({ bonus: 3, defesa: 12, vantagem: true }) === 1 - 0.4 * 0.4 && chanceDeAcerto({ bonus: 3, defesa: 12, desvantagem: true }) === 0.6 * 0.6);
  t("e as duas juntas se cancelam", chanceDeAcerto({ bonus: 3, defesa: 12, vantagem: true, desvantagem: true }) === 0.6);
  t("sem defesa, a chance é desconhecida (null), nunca inventada",
    [undefined, null, {}, { bonus: 3 }, { defesa: "x" }].every((x) => chanceDeAcerto(x) === null));

  /* A PORTA DO DADO é uma só: ladosDoDado é o que resolverAtaque usa */
  t("ladosDoDado: vantagem e desvantagem se cancelam, como no motor",
    JSON.stringify(ladosDoDado({ alvo: {}, vantagem: true, desvantagem: true })) === JSON.stringify({ impedido: false, intocavel: false, vantagem: false, desvantagem: false }));
  t("e o alvo cego dá vantagem", ladosDoDado({ alvo: {}, condAlvo: [{ nome: "Cego" }] }).vantagem === true);
  t("e listas nulas não estouram", ladosDoDado({ alvo: null, condAtacante: null, condAlvo: null }).impedido === false && ladosDoDado(undefined).impedido === false);

  /* A CHANCE DO VEREDITO é esta conta, com o bônus e a defesa de verdade */
  const h = heroi(0, 0);
  const v = vereditoDaFuga({ heroi: h, inimigos: [atirador(13, 0)], passoHeroiM: 9, ficha: ficha() });
  const esperada = chanceDeAcerto({ bonus: bonusContraOJogador(atirador(0, 0), 0), defesa: defesaDe(ficha()), desvantagem: true });
  t(`a chance do disparo a 19,5 m é a da tabela: bônus ${bonusContraOJogador(atirador(0, 0), 0)} contra defesa ${defesaDe(ficha())}, com desvantagem = ${esperada}`,
    v.disparos[0].chance === esperada && esperada === 0.36);
  t("sem a ficha, a chance é null — e o veredito continua de pé",
    vereditoDaFuga({ heroi: h, inimigos: [atirador(13, 0)], passoHeroiM: 9 }).disparos[0].chance === null);
  t("defesaHeroi explícito manda sobre a ficha",
    vereditoDaFuga({ heroi: h, inimigos: [atirador(13, 0)], passoHeroiM: 9, ficha: ficha(), defesaHeroi: 30 }).disparos[0].chance === 0.05 * 0.05);
  t("a heroína invisível já tem desvantagem de perto: o golpe do colado cai para o pior de dois",
    vereditoDaFuga({ heroi: h, inimigos: [atirador(1, 0)], passoHeroiM: 9, desengajar: false, ficha: ficha({ efeitos: [{ nome: "Invisível" }] }) }).chancesDosGolpes[0].chance === 0.36);
  t("o degrau divino entra pela mesma conta do golpe rolado",
    vereditoDaFuga({ heroi: h, inimigos: [atirador(13, 0)], passoHeroiM: 9, ficha: ficha(), gdJogador: 2 }).disparos[0].chance
      === chanceDeAcerto({ bonus: bonusContraOJogador(atirador(0, 0), 2), defesa: 12, desvantagem: true }));
  const dois = vereditoDaFuga({ heroi: h, inimigos: [atirador(13, 0), atirador(1, 0, { nome: "Arqueira" })], passoHeroiM: 9, desengajar: false, ficha: ficha() });
  t("dois ataques: a chance de ALGUM acertar é 1 − (1 − p)(1 − q)",
    Math.abs(dois.chanceDeAlgum - (1 - (1 - 0.6) * (1 - 0.36))) < 1e-12, dois.chanceDeAlgum);
}

sec("14. A VOZ DA CHANCE — faixas da tabela, no teto, sem número");
{
  t("as faixas descem, e a última cobre o zero",
    FAIXAS_DA_CHANCE.every((f, i, arr) => i === 0 || arr[i - 1].min > f.min) && FAIXAS_DA_CHANCE[FAIXAS_DA_CHANCE.length - 1].min === 0);
  const h = heroi(0, 0);
  const linhaCom = (defesa) => linhaDaFuga(vereditoDaFuga({ heroi: h, inimigos: [atirador(12, 7)], passoHeroiM: 9, defesaHeroi: defesa }));
  /* a 18 m, sem desvantagem: p = faces que acertam / 20, com bônus 3 */
  const vozDe = (p) => FAIXAS_DA_CHANCE.find((f) => p >= f.min);
  const casos = [[5, 0.95], [12, 0.6], [16, 0.4], [21, 0.15]];
  for (const [defesa, p] of casos) {
    const l = linhaCom(defesa);
    t(`defesa ${defesa} (chance ${p}): "${l}" — a voz da faixa '${vozDe(p).id}'`, l.includes(vozDe(p).um) && l.includes("Atirador"));
  }
  t("a cena (b) antes do clique: 'Escapa, mas Atirador pode te acertar.'",
    linhaDaFuga(vereditoDaFuga({ heroi: h, inimigos: [atirador(13, 0)], passoHeroiM: 9, ficha: ficha() })) === "Escapa, mas Atirador pode te acertar.");
  t("sem a ficha, a voz do meio — 'pode' — nem promete nem assusta",
    linhaDaFuga(vereditoDaFuga({ heroi: h, inimigos: [atirador(13, 0)], passoHeroiM: 9 })).includes("pode te acertar"));
  const gig = "Sentinela-Comandante-Terrível-das-Sombras-Eternas-Arqueira";
  const linhas = [
    linhaDaFuga(vereditoDaFuga({ heroi: h, inimigos: [atirador(13, 0, { nome: gig })], passoHeroiM: 9, ficha: ficha() })),
    linhaDaFuga(vereditoDaFuga({ heroi: h, inimigos: [atirador(13, 0), atirador(13, 2), atirador(1, 0, { nome: gig })], passoHeroiM: 9, desengajar: false, defesaHeroi: 2 })),
    linhaDaFuga(vereditoDaFuga({ heroi: h, inimigos: [atirador(13, 0), atirador(13, 2)], passoHeroiM: 9, defesaHeroi: 40 })),
  ];
  t("toda linha de custo cabe no teto, com nome gigante e com vários ataques", linhas.every((l) => l.length <= TETO_DA_LINHA.chars), linhas);
  t("vários ataques falam da chance de ALGUM", /^Escapa sob 3 ataques — algum quase certamente acerta\.$/.test(linhas[1]) && /dificilmente algum acerta/.test(linhas[2]), linhas);
  t("nenhuma linha diz número de chance, porcentagem ou mecanismo",
    linhas.every((l) => !/%|0[,.]\d|chance|desvantagem|disparo|dado|desengaj|sistema/i.test(l)), linhas);
  const nota = notaDaFuga(vereditoDaFuga({ heroi: h, inimigos: [atirador(13, 0), bandido(1, 0, { condicoes: [{ id: "caido" }] })], passoHeroiM: 9, desengajar: false }));
  t("a nota ao Narrador diz a que ataques ele se expôs, sem dizer que acertaram",
    /exposto ao golpe de Bandido/.test(nota) && /ao ataque de longe de Atirador/.test(nota) && !/levando/.test(nota), nota);
}

sec("15. O CUSTO ROLADO — com semente; a mesma semente, o mesmo golpe");
{
  const h = heroi(0, 0);
  const a = atirador(13, 0);
  const v = vereditoDaFuga({ heroi: h, inimigos: [a], passoHeroiM: 9, ficha: ficha() });
  const rola = (semente) => rolarOCustoDaFuga(v, { heroi: ficha(), inimigos: [a], semente });
  /* as duas sementes da cena (b), compostas como o App compõe: mundo, dia, rodada */
  const erra = rola("mundo-b|dia-5|rodada-0");
  const acerta = rola("mundo-b|dia-5|rodada-2");
  t("semente 'mundo-b|dia-5|rodada-0': o tiro sai com desvantagem (dois dados, o pior) e ERRA",
    erra.length === 1 && erra[0].tipo === "disparo" && erra[0].r.dados.length === 2 && erra[0].r.modo === "desvantagem"
      && erra[0].r.resultado === "erra" && erra[0].r.dano === 0, erra.map((x) => x.r));
  t("semente 'mundo-b|dia-5|rodada-2': o mesmo tiro ACERTA, e fere",
    acerta.length === 1 && acerta[0].r.resultado === "acerta" && acerta[0].r.dano > 0, acerta.map((x) => x.r));
  t("o d20 que conta é o menor dos dois (desvantagem)", erra[0].r.d20 === Math.min(...erra[0].r.dados) && acerta[0].r.d20 === Math.min(...acerta[0].r.dados));
  t("a defesa rolada é a da ficha (12), a mesma da chance mostrada", erra[0].r.ca === defesaDe(ficha()));
  t("a mesma semente dá o mesmo resultado, caractere por caractere",
    JSON.stringify(rola("mundo-b|dia-5|rodada-2")) === JSON.stringify(acerta) && JSON.stringify(rola("mundo-b|dia-5|rodada-0")) === JSON.stringify(erra));

  /* a frequência sobre muitas sementes bate com a chance mostrada */
  let hits = 0; const N_ = 4000;
  for (let i = 0; i < N_; i++) { const r = rola("s" + i)[0].r; if (r.resultado === "acerta" || r.resultado === "critico") hits++; }
  t(`em ${N_} sementes, o tiro acerta ${(hits / N_).toFixed(3)} — a chance mostrada é ${v.disparos[0].chance}`, Math.abs(hits / N_ - v.disparos[0].chance) < 0.03);

  /* golpes e disparos na ordem da linha, cada corpo rolado uma vez */
  const mesa = [atirador(13, 0), bandido(1, 0, { condicoes: [{ id: "caido" }] }), bandido(0, 1, { condicoes: [{ id: "caido" }] })];
  const vm = vereditoDaFuga({ heroi: h, inimigos: mesa, passoHeroiM: 9, desengajar: false, ficha: ficha() });
  const rm = rolarOCustoDaFuga(vm, { heroi: ficha(), inimigos: mesa, semente: "ordem" });
  t("dois Bandidos com o mesmo nome e um Atirador: três ataques, golpes primeiro, cada corpo uma vez",
    rm.map((x) => `${x.tipo}:${x.nome}`).join() === "golpe:Bandido,golpe:Bandido,disparo:Atirador", rm.map((x) => x.tipo + ":" + x.nome));

  t("fuga que não escapa não custa nada", rolarOCustoDaFuga({ ...v, escapa: false }, { heroi: ficha(), inimigos: [a], semente: "x" }).length === 0);
  let estourou = "";
  for (const [vv, aa] of [[null, null], [undefined, {}], [{}, {}], [v, null], [v, { heroi: null }], [v, { heroi: ficha(), inimigos: null }], [{ escapa: true, golpes: "x", disparos: [null, 3] }, { heroi: ficha() }]]) {
    try { if (!Array.isArray(rolarOCustoDaFuga(vv, aa))) estourou += "torta "; } catch (e) { estourou += e.message + " "; }
  }
  t("rolarOCustoDaFuga nunca estoura com lixo" + (estourou ? " — " + estourou : ""), estourou === "");

  /* SEM SEMENTE, O COMBATE DE SEMPRE: sem `rolar`, cada dado é um Math.random */
  const velho = Math.random;
  try {
    let chamadas = 0;
    Math.random = () => { chamadas++; return 0.5; };
    const um = d(20), dois = d20(false, true), r = resolverAtaque({ atacante: "X", alvo: ficha(), ehAtacanteInimigo: true, bonusAtaque: 3, danoBase: 4 });
    t("sem sorte de fora, d/d20/resolverAtaque rolam Math.random, como sempre rolaram",
      um === 11 && dois.valor === 11 && dois.dados.length === 2 && r.d20 === 11 && chamadas === 4, { um, dois, d20: r.d20, chamadas });
    chamadas = 0;
    t("e d(20, lixo) ignora o que não é função — `[..].map(d)` passaria o índice", d(20, 3) === 11 && d(20, "x") === 11 && chamadas === 2);
    chamadas = 0;
    const semSemente = rolarOCustoDaFuga(v, { heroi: ficha(), inimigos: [a] });
    t("e a fuga sem semente rola pelo Math.random do combate", semSemente.length === 1 && chamadas === 3, chamadas);
    chamadas = 0;
    danoDe({ ameaca: "comum" }, true); oportunidadesContraOJogador([bandido(1, 0)], ficha(), 0);
    t("danoDe e oportunidadesContraOJogador sem opções: Math.random também", chamadas === 3, chamadas);
  } finally { Math.random = velho; }
  const semeado = (s) => oportunidadesContraOJogador([bandido(1, 0)], ficha(), 0, { rolar: rng(s) });
  t("oportunidadesContraOJogador com a mesma sorte dá o mesmo golpe", JSON.stringify(semeado(7)) === JSON.stringify(semeado(7)));
}

sec("16. A CONSEQUÊNCIA QUE NÃO É DANO — os javalis e o Comandante, rejogados");
{
  const ids = Object.keys(CONSEQUENCIAS_DA_FUGA);
  t("três consequências: perseguição, território, rasto", ids.join() === "perseguicao,territorio,rasto");
  t("todo degrau tem peso e tamanho em toda consequência, e nenhum degrau fica sem nenhuma",
    DEGRAUS.every((dg) => ids.every((id) => Number.isFinite(CONSEQUENCIAS_DA_FUGA[id].pesos[dg.id]) && [4, 6, 8].includes(CONSEQUENCIAS_DA_FUGA[id].segmentos[dg.id]))
      && ids.reduce((s, id) => s + CONSEQUENCIAS_DA_FUGA[id].pesos[dg.id], 0) > 0));
  t("bicho não tem plano de vingança: perseguição pesa zero para animal", CONSEQUENCIAS_DA_FUGA.perseguicao.pesos.animal === 0);
  t("quem planeja não demora: a perseguição do treinado é mais curta que a do bruto",
    CONSEQUENCIAS_DA_FUGA.perseguicao.segmentos.treinado < CONSEQUENCIAS_DA_FUGA.perseguicao.segmentos.bruto);

  /* (a) OS JAVALIS DO R15 — três Javali-de-pedra (animal), a 19,5 m */
  const h = heroi(0, 0);
  const js = [javali(1, 13, 0), javali(2, 13, 1), javali(3, 13, 2)];
  t("os javalis são animal (degraus.js)", js.every((j) => degrauDaCriatura(j) === "animal"));
  const va = vereditoDaFuga({ heroi: h, inimigos: js, passoHeroiM: 9, rodada: 1, ficha: ficha() });
  const argsA = { inimigos: js, semente: "mundo-r15|dia-3|rodada-0", lugares: ["Estrada do Vale"], dia: 3 };
  const ca = consequenciaDaFuga(va, argsA);
  t("(a) semente 'mundo-r15|dia-3|rodada-0': o lugar fica deles — território", ca.id === "territorio", ca.id);
  t("(a) o aviso antes do clique: 'Não vão esquecer este lugar.'", ca.aviso === "Não vão esquecer este lugar.", ca.aviso);
  t("(a) a linha depois: 'Javali-de-pedra ×3 não esquecem este lugar.'", ca.linha === "Javali-de-pedra ×3 não esquecem este lugar.", ca.linha);
  t("(a) o relógio: ameaça, por noite, 4 — e leva o bando e o lugar",
    ca.relogio.tipo === "ameaca" && ca.relogio.gatilho === "noite" && ca.relogio.segmentos === 4 && ca.relogio.cheios === 0
      && ca.relogio.fuga.efeito === "territorio" && ca.relogio.fuga.bando.length === 3 && ca.relogio.fuga.lugar === "Estrada do Vale"
      && ca.relogio.fuga.bando.every((b) => b.nome === "Javali-de-pedra" && b.ameaca === "comum"), ca.relogio);
  t("(a) a fonte começa por 'fuga:' e cabe nos 40 do relógio", /^fuga:/.test(ca.relogio.fonte) && ca.relogio.fonte.length <= 40, ca.relogio.fonte);
  t("(a) e a nota ao Narrador diz o que é fato, curta", /CONSEQUÊNCIA DO SISTEMA/.test(ca.nota) && ca.nota.length < 400);
  t("o aviso previsto antes do clique é o que sai depois: a mesma semente, a mesma consequência",
    JSON.stringify(consequenciaDaFuga(va, argsA)) === JSON.stringify(ca));
  let perseguiu = 0; const vistos = new Set();
  for (let i = 0; i < 600; i++) { const c = consequenciaDaFuga(va, { inimigos: js, semente: "r15-" + i }); vistos.add(c.id); if (c.id === "perseguicao") perseguiu++; }
  t("em 600 sementes, javali NUNCA persegue — e território e rasto aparecem os dois", perseguiu === 0 && vistos.has("territorio") && vistos.has("rasto"));

  /* (b) O ATIRADOR — bruto: as três podem sair */
  const a = atirador(13, 0);
  const vb = vereditoDaFuga({ heroi: h, inimigos: [a], passoHeroiM: 9, ficha: ficha() });
  const cb = consequenciaDaFuga(vb, { inimigos: [a], semente: "mundo-b|dia-5|rodada-2", lugares: ["Ponte Velha"], dia: 5 });
  t("(b) semente 'mundo-b|dia-5|rodada-2': o Atirador vai voltar, e mais forte (perseguição, 8 noites — bruto)",
    cb.id === "perseguicao" && cb.relogio.segmentos === 8 && cb.aviso === "Vai voltar mais forte." && cb.linha === "Atirador vai voltar, e mais forte.", cb);

  /* (c) O COMANDANTE — elite, treinado, com dois Soldados */
  const cmd = { nome: "Comandante", ameaca: "elite", vida: 40, x: 13, y: 0 };
  const sol = (n, y) => ({ nome: `Soldado ${n}`, ameaca: "comum", vida: 15, x: 13, y });
  const band = [cmd, sol(1, 1), sol(2, 2)];
  t("(c) o Comandante é treinado — e é a cabeça do bando", degrauDaCriatura(cmd) === "treinado");
  const vc = vereditoDaFuga({ heroi: h, inimigos: band, passoHeroiM: 9, ficha: ficha() });
  const cc = consequenciaDaFuga(vc, { inimigos: band, semente: "mundo-c|dia-9|rodada-0", lugares: ["Quartel do Passo"], dia: 9 });
  t("(c) semente 'mundo-c|dia-9|rodada-0': perseguição, caçada por noite, em 4 noites",
    cc.id === "perseguicao" && cc.relogio.tipo === "cacada" && cc.relogio.gatilho === "noite" && cc.relogio.segmentos === 4, cc.relogio);
  t("(c) aviso 'Vão voltar mais fortes.'", cc.aviso === "Vão voltar mais fortes.");
  const volta = bandoAoVoltar(cc.relogio);
  t("(c) ao voltar são QUATRO: o Comandante (elite, o teto) e três Soldados, agora competentes",
    volta.length === 4 && volta.filter((b) => b.nome === "Comandante" && b.ameaca === "elite").length === 1
      && volta.filter((b) => b.nome === "Soldado" && b.ameaca === "competente").length === 3, volta);
  let pc = 0;
  for (let i = 0; i < 900; i++) if (consequenciaDaFuga(vc, { inimigos: band, semente: "c-" + i }).id === "perseguicao") pc++;
  t(`(c) perseguição é a mais provável para treinado: ${pc}/900 (peso 5 de 9)`, pc > 900 * 0.45 && pc < 900 * 0.65);

  /* NUNCA UMA FUGA SEM CONSEQUÊNCIA */
  const cheios = Array.from({ length: MAX_RELOGIOS }, (_, i) => criarRelogio({ id: "r" + i, nome: "Relógio " + i, segmentos: 6 }));
  const cf = consequenciaDaFuga(va, { ...argsA, relogios: cheios });
  t(`com ${MAX_RELOGIOS} relógios em jogo, cai para a fama — e diz isso`,
    cf.id === "fama" && cf.relogio === null && cf.linha === FAMA_DA_FUGA.linha() && cf.aviso === FAMA_DA_FUGA.aviso() && /demais/.test(cf.nota), cf);
  t("ninguém deixado para trás: ainda assim a fama", consequenciaDaFuga({ escapa: true, deixados: [] }, { semente: "x" }).id === "fama");
  let sem = 0;
  for (const dg of ["Lobo", "Bandido", "Soldado", "Comandante"]) {
    for (let i = 0; i < 50; i++) {
      const c = consequenciaDaFuga({ escapa: true, deixados: [dg] }, { inimigos: [{ nome: dg, ameaca: dg === "Comandante" ? "elite" : "comum", vida: 5 }], semente: dg + i });
      if (!c || !c.linha || !c.aviso || !c.nota) sem++;
    }
  }
  t("200 fugas de quatro cabeças diferentes: nenhuma sem consequência, linha, aviso e nota", sem === 0);
  t("fuga que não escapa não tem consequência (null)", consequenciaDaFuga({ escapa: false, deixados: ["X"] }, {}) === null);

  /* A MESMA COISA DUAS VEZES não vira dois relógios */
  const lista1 = [ca.relogio];
  const de_novo = consequenciaDaFuga(va, { ...argsA, semente: "outra", relogios: lista1 });
  t("fugir de novo dos mesmos javalis no mesmo sítio: a marca é a que existe, sem relógio novo",
    de_novo.relogio === null && de_novo.id === "territorio" && de_novo.reforca === null && /De novo/.test(de_novo.nota));
  const dup = consequenciaDaFuga(vc, { inimigos: band, semente: "mundo-c|dia-9|rodada-1", lugares: ["Quartel do Passo"], relogios: [cc.relogio] });
  t("fugir de novo de quem já vinha atrás: a caçada que existe fica mais perto (reforca = o id dela)", dup.reforca === cc.relogio.id && dup.relogio === null);

  let estourou = "";
  for (const [vv, aa] of [[null, null], [{}, {}], [va, null], [va, { inimigos: null, lugares: null, relogios: "x", dia: "x" }], [{ escapa: true, deixados: [null, 3, ""] }, {}]]) {
    try { consequenciaDaFuga(vv, aa); } catch (e) { estourou += e.message + " "; }
  }
  t("consequenciaDaFuga nunca estoura com lixo" + (estourou ? " — " + estourou : ""), estourou === "");
}

sec("17. O BANDO QUE VOLTA — o reforço, o save, e as duas portas da luta");
{
  const rel = (efeito, bando, degrau, lugar = "Ponte Velha") => criarRelogio({ id: "x", nome: "x", segmentos: 4, fonte: "fuga:x", fuga: { efeito, bando, lugar, degrau } });
  const B = (...xs) => xs.map(([nome, ameaca]) => ({ nome, ameaca }));
  const R = REFORCO_DA_PERSEGUICAO;
  t("a escada do reforço pára em elite (lendário não sobe)", R.escada[R.escada.length - 1] === "elite" && !R.escada.includes("lendario"));
  t("perseguição bruta: +1 do mais numeroso, ameaça igual",
    JSON.stringify(bandoAoVoltar(rel("perseguicao", B(["Lobo", "fraco"], ["Bandido", "comum"], ["Bandido", "comum"]), "bruto")))
      === JSON.stringify(B(["Lobo", "fraco"], ["Bandido", "comum"], ["Bandido", "comum"], ["Bandido", "comum"])));
  t("perseguição treinada: todos um degrau acima, e mais um",
    JSON.stringify(bandoAoVoltar(rel("perseguicao", B(["Batedor", "fraco"]), "treinado"))) === JSON.stringify(B(["Batedor", "comum"], ["Batedor", "comum"])));
  t("o lendário não sobe, e ninguém vira lendário",
    JSON.stringify(bandoAoVoltar(rel("perseguicao", B(["Dragão Jovem", "lendario"], ["Gigante", "elite"]), "brilhante")).map((b) => b.ameaca)) === JSON.stringify(["lendario", "elite", "lendario"]));
  t("rasto e território voltam como estavam",
    bandoAoVoltar(rel("rasto", B(["Soldado", "comum"]), "treinado")).length === 1 && bandoAoVoltar(rel("territorio", B(["Lobo", "fraco"], ["Lobo", "fraco"]), "animal")).length === 2);
  t("relógio comum, ou sem campo, ou lixo: bando vazio",
    [criarRelogio({ nome: "comum", segmentos: 4 }), null, undefined, {}, { fuga: 3 }, { fuga: { efeito: "perseguicao", bando: "x" } }].every((r) => JSON.stringify(bandoAoVoltar(r)) === "[]"));

  /* A PORTA DO RELÓGIO QUE ENCHE: perseguição e rasto abrem luta, território sossega */
  t("ao encher, a perseguição abre luta com o bando reforçado", lutaAoEncher(rel("perseguicao", B(["Bandido", "comum"]), "bruto")).length === 2);
  t("o rasto abre luta com o bando como estava", lutaAoEncher(rel("rasto", B(["Bandido", "comum"]), "bruto")).length === 1);
  t("o território NÃO abre luta ao encher — sossega", lutaAoEncher(rel("territorio", B(["Lobo", "fraco"]), "animal")).length === 0);

  /* O SAVE ATRAVESSADO: o relógio da cena (c) vai ao JSON, volta, anda
     quatro noites, enche — e a luta que sai dele é a mesma */
  const h = heroi(0, 0);
  const cmd = { nome: "Comandante", ameaca: "elite", vida: 40, x: 13, y: 0 };
  const band = [cmd, { nome: "Soldado 1", ameaca: "comum", vida: 15, x: 13, y: 1 }, { nome: "Soldado 2", ameaca: "comum", vida: 15, x: 13, y: 2 }];
  const c = consequenciaDaFuga(vereditoDaFuga({ heroi: h, inimigos: band, passoHeroiM: 9 }), { inimigos: band, semente: "mundo-c|dia-9|rodada-0", lugares: ["Quartel do Passo"], dia: 9 });
  let lista = garantirRelogios(JSON.parse(JSON.stringify([c.relogio])));
  let cheio = null;
  for (let noite = 1; noite <= 4 && !cheio; noite++) { const av = avancar(lista, "noite"); lista = av.relogios; cheio = av.cheios[0] || null; if (cheio) t(`a caçada enche na noite ${noite}`, noite === 4); }
  t("o que encheu abre a luta com os quatro, idêntica à prevista", !!cheio && JSON.stringify(lutaAoEncher(cheio)) === JSON.stringify(bandoAoVoltar(c.relogio)));

  /* A PORTA DO TERRITÓRIO: voltar ao lugar reabre a luta com eles */
  const terr = rel("territorio", B(["Javali-de-pedra", "comum"], ["Javali-de-pedra", "comum"]), "animal", "Estrada do Vale");
  const outros = [criarRelogio({ id: "n", nome: "A nêmesis", segmentos: 6, fonte: "nemesis" }), terr];
  t("chegar à Estrada do Vale acha o território", relogioDoTerritorio(outros, ["Estrada do Vale", "Vale Torto"])?.fuga?.efeito === "territorio");
  t("pela comparação tolerante do fôlego ('a estrada do vale')", !!relogioDoTerritorio(outros, ["a estrada do vale"]));
  t("e em qualquer outro lugar, nada", relogioDoTerritorio(outros, ["Vale Torto"]) === null && relogioDoTerritorio(outros, []) === null && relogioDoTerritorio(null, null) === null);
  t("uma perseguição não é território: não reabre ao voltar",
    relogioDoTerritorio([rel("perseguicao", B(["Bandido", "comum"]), "bruto", "Estrada do Vale")], ["Estrada do Vale"]) === null);
  t("e o bando que espera lá é o de sempre, pronto para abrir a luta", JSON.stringify(bandoAoVoltar(relogioDoTerritorio(outros, ["Estrada do Vale"]))) === JSON.stringify(B(["Javali-de-pedra", "comum"], ["Javali-de-pedra", "comum"])));
  t("avancarUm serve ao reforço da caçada repetida", avancarUm([c.relogio], c.relogio.id).avancados[0].para === 1);
}

console.log(`\nfuga: ${bons} passaram, ${maus} falharam${pendentes ? `, ${pendentes} pendentes` : ""}`);
process.exit(maus ? 1 : 0);
