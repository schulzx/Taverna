/* teste-guardas.mjs (v9.232) — a defesa que dura turnos, os tres reerguer
   que faltaram no casamento da v9.47, e a catraca de P2: as nove guardas
   sao VISIVEIS ao piloto que joga companheiro e duelista.                   */
import { guardaDe, erguerGuarda, expirarGuardas, baixarGuardas, defesaDeGuarda, guardasAtivas, estaIntocavel, esquivaDeGuarda, GUARDAS, reerguerDe, reerguer } from "../src/habilidades.js";
import { defesaDe, resolverAtaque } from "../src/combate.js";
import { CLASSES } from "../src/classes.js";
import { SUBCLASSES } from "../src/subclasses.js";
import { ESPECIALIZACOES } from "../src/especializacoes.js";
import { MAGIAS } from "../src/grimorio.js";
import { decidirAcaoCompanheiro, ehGuarda, ehBuff } from "../src/companheiros.js";

let ok = 0, mal = 0;
/* v9.232: o `extra` entrou (terceiro parametro OPCIONAL) para a secao 6 poder
   dizer QUEM falhou numa varredura de 593 habilidades — "XX  nenhuma falsa
   guarda" sem a lista nao ajuda ninguem a consertar. Nenhuma asserção antiga
   mudou de sentido: quem chama com dois argumentos imprime igual a antes. */
const t = (nome, cond, extra) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

const doCatalogo = (nome) => {
  for (const c of CLASSES) { const h = (c.habilidades || []).find((x) => x.nome === nome); if (h) return h; }
  for (const arr of Object.values(SUBCLASSES)) { const h = (arr || []).find((x) => x.nome === nome); if (h) return h; }
  for (const arr of Object.values(ESPECIALIZACOES)) { const h = (arr || []).find((x) => x.nome === nome); if (h) return h; }
  return null;
};
const heroi = (extra = {}) => ({ nome: "Vera", classe: "Druida", nivel: 8, vida: 60, vidaMax: 60, atributos: { destreza: 2 }, grupo: [], ...extra });

sec("1. as cinco que prometiam defesa agora a têm");
{
  const nomes = ["Casca de Carvalho", "Pele Arcana", "Forma Dracônica", "Enxerto Mecânico", "Elixir de Combate"];
  for (const n of nomes) {
    const h = doCatalogo(n);
    t(`"${n}" existe no catálogo`, !!h);
    t(`  e é reconhecida como guarda`, !!guardaDe(h));
  }
  t("Bola de Fogo não é guarda", !guardaDe({ nome: "Bola de Fogo", descricao: "Explosão de chamas." }));
  t("toda guarda de defesa tem valor e prazo", GUARDAS.filter(g=>!g.tipo).every((g) => g.valor > 0 && g.turnos > 0));
  t("e nenhuma passa de +4 (a régua da casa)", GUARDAS.filter(g=>!g.tipo).every((g) => g.valor <= 4));
}

sec("1b. as quatro que prometiam invulnerabilidade");
{
  for (const n of ["Vazio Perfeito", "Dança Sem Vulto", "Nada Me Alcança", "Improvável"]) {
    const h = doCatalogo(n);
    t(`"${n}" existe no catálogo`, !!h);
    t(`  e é reconhecida`, !!guardaDe(h));
  }
  /* a escada: quanto mais absoluta a promessa, mais curto o prazo */
  const abs = GUARDAS.filter((g) => g.tipo === "intocavel");
  t("só a intocável é absoluta, e dura 1 turno", abs.length === 1 && abs[0].turnos === 1);
  t("as de prazo longo são desvantagem, não imunidade", GUARDAS.filter((g) => g.turnos >= 3 && g.tipo).every((g) => g.tipo === "esquiva"));

  const p = erguerGuarda(heroi(), doCatalogo("Vazio Perfeito"), 1).pers;
  t("o herói fica intocável", estaIntocavel(p));
  /* 60 golpes de um inimigo brutal: nenhum acerta */
  let acertos = 0;
  for (let i = 0; i < 60; i++) { const r = resolverAtaque({ atacante: "Ogro", alvo: p, ehAtacanteInimigo: true, bonusAtaque: 30, danoBase: 40 }); if (r.dano > 0) acertos++; }
  t("e 60 golpes com +30 de bônus não tiram um PV", acertos === 0);
  t("o resultado se identifica como intocável", resolverAtaque({ atacante: "X", alvo: p, ehAtacanteInimigo: true, bonusAtaque: 30, danoBase: 40 }).intocavel === true);

  const q = erguerGuarda(heroi(), doCatalogo("Dança Sem Vulto"), 1).pers;
  t("a dança não é intocável", !estaIntocavel(q));
  t("mas dá desvantagem a quem ataca", esquivaDeGuarda(q));

  /* Nada Me Alcança só morde feitiço */
  const m = erguerGuarda(heroi(), doCatalogo("Nada Me Alcança"), 1).pers;
  t("contra magia, esquiva", esquivaDeGuarda(m, { magico: true }));
  t("contra aço, não", !esquivaDeGuarda(m, { magico: false }));
  t("herói sem guarda nenhuma não esquiva nada", !esquivaDeGuarda(heroi()) && !estaIntocavel(heroi()));
}

sec("2. a defesa sobe DE VERDADE na conta do combate");
{
  const p = heroi();
  const antes = defesaDe(p);
  const r = erguerGuarda(p, doCatalogo("Casca de Carvalho"), 1);
  t("ergue", r.ok);
  const depois = defesaDe(r.pers);
  console.log(`      defesa ${antes} → ${depois}`);
  t("a defesa subiu +4", depois === antes + 4);
  t("defesaDeGuarda confere", defesaDeGuarda(r.pers) === 4);
  t("o jogador lê o número", /\+4 de defesa/.test(r.linha));
  t("o Mestre é proibido de inventar", /não invente número/.test(r.nota));
  t("não ergue a mesma guarda duas vezes", !erguerGuarda(r.pers, doCatalogo("Casca de Carvalho"), 2).ok);

  /* duas guardas diferentes SOMAM */
  const r2 = erguerGuarda(r.pers, doCatalogo("Pele Arcana"), 1);
  t("duas guardas diferentes convivem", r2.ok && guardasAtivas(r2.pers).length === 2);
  t("e somam", defesaDe(r2.pers) === antes + 7);
}

sec("3. e desce quando o prazo acaba");
{
  const p = erguerGuarda(heroi(), doCatalogo("Pele Arcana"), 1).pers;   // 2 turnos
  const base = defesaDe(heroi());
  t("na rodada 2 ainda está de pé", expirarGuardas(p, 2).linhas.length === 0);
  t("e a defesa continua alta", defesaDe(expirarGuardas(p, 2).pers) === base + 3);
  const fim = expirarGuardas(p, 3);
  t("na rodada 3 cai", fim.linhas.length === 1);
  t("o jogador lê a queda", /se desfaz/.test(fim.linhas[0]));
  t("e a defesa volta ao normal", defesaDe(fim.pers) === base);
  t("a ficha não fica com lixo", fim.pers.guardas === undefined);
  t("sem guarda, expirar não faz nada", expirarGuardas(heroi(), 9).linhas.length === 0);
}

sec("4. a luta acaba, a guarda baixa");
{
  const p = erguerGuarda(heroi(), doCatalogo("Casca de Carvalho"), 1).pers;
  const b = baixarGuardas(p);
  t("baixa", !!b.linha && defesaDe(b.pers) === defesaDe(heroi()));
  t("sem guarda nenhuma, cala", baixarGuardas(heroi()).linha === "");
}

sec("5. os três reerguer que faltaram");
{
  for (const n of ["Refrão Teimoso", "Renascimento", "Grande Necrópole"]) {
    const h = doCatalogo(n);
    t(`"${n}" existe`, !!h);
    t(`  e agora reergue`, !!reerguerDe(h));
  }
  t("Refrão Teimoso devolve metade, como diz a descrição", reerguerDe(doCatalogo("Refrão Teimoso")).fracao === 0.5);
  t("Renascimento pega todos", reerguerDe(doCatalogo("Renascimento")).todos === true);
  t("Grande Necrópole pega todos", reerguerDe(doCatalogo("Grande Necrópole")).todos === true);

  const caidos = heroi({ grupo: [{ nome: "Ilse", vida: 0, vidaMax: 20 }, { nome: "Bram", vida: 0, vidaMax: 30 }] });
  const r = reerguer(caidos, doCatalogo("Renascimento"));
  t("Renascimento ergue os dois", r.ok && r.pers.grupo.every((g) => g.vida > 0));
  const rt = reerguer(caidos, doCatalogo("Refrão Teimoso"));
  t("Refrão Teimoso ergue um, com metade do PV", rt.ok && rt.pers.grupo[0].vida === 10);
  t("as duas antigas continuam valendo", !!reerguerDe(doCatalogo("Ressurreição Menor")) && !!reerguerDe(doCatalogo("Última Estrofe")));
}

/* ============================================================
   6. O PILOTO RECONHECE AS NOVE GUARDAS (P2 · v9.232)

   A DOENÇA. `GUARDAS` existe desde a v9.53 com nove entradas, e o herói
   de carne as erguia. O piloto que joga o companheiro e o duelista
   (`decidirAcaoCompanheiro`, companheiros.js) NUNCA erguia nenhuma:
   ele adivinhava "isto é apoio?" por um regex de nome, e nenhum dos
   nove nomes casava com ele. Casca de Carvalho, Pele Arcana, Forma
   Dracônica, Enxerto Mecânico, Elixir de Combate, Vazio Perfeito,
   Dança Sem Vulto, Nada Me Alcança e Improvável: a família defensiva
   inteira era promessa que só metade da mesa cumpria. P2 trocou o
   palpite pela pergunta — `ehGuarda(h) = !!guardaDe(h)`, a mesma
   tabela, num lugar só.

   POR QUE ESTA CATRACA É PERMANENTE, e por que ela PERCORRE `GUARDAS`
   em vez de uma lista de nomes escrita à mão. O buraco não foi "alguém
   esqueceu de escrever Casca de Carvalho no regex": foi o regex existir.
   Uma lista de nomes aqui reproduziria o mesmo defeito uma camada
   acima — a guarda nova de amanhã entraria na tabela, nasceria
   invisível ao piloto, e esta suíte passaria verde sem nunca a ter
   olhado. Percorrendo `GUARDAS`, a entrada nova chega aqui sozinha e
   cobra o próprio lugar na mesa no dia em que nasce.

   O DENTE ANDA NOS DOIS SENTIDOS, como em P1 (`check-protecao`). O
   primeiro: toda entrada da tabela tem habilidade real no acervo e o
   piloto a escolhe. O segundo: NADA fora da tabela vira guarda —
   varrendo as 12 classes, as subclasses, as especializações e o
   grimório, 593 habilidades, uma por uma.

   NADA AQUI SORTEIA. O passo de apoio do piloto passa por
   `Math.random() < 0.7`; a sorte é travada num valor fixo da tabela
   abaixo (o molde é `comSorteTravada`, de arena.js) e devolvida ao
   original no `finally`. Mesma máquina ou outra, a mesma saída.
   ============================================================ */
sec("6. o piloto reconhece as nove guardas (P2)");
{
  /* A RÉGUA, em tabela — piso, tetos, e a sorte travada saem daqui. */
  const MEDIDA_DO_PILOTO = {
    /* O PISO DO ALCANCE, o mesmo de `check-protecao` e pelo mesmo motivo:
       as 12 classes (148) + subclasses (144) + especializações (216)
       somam 508, e o grimório entra por cima. O piso guarda o ALCANCE da
       varredura (uma importação que quebre e devolva lista vazia fica
       vermelha aqui em vez de passar verde medindo nada), não o tamanho
       do acervo, que cresce quando alguém escreve habilidade nova. */
    pisoDoAcervo: 508,
    /* ZERO É A LEI, nos dois sentidos. Uma entrada de `GUARDAS` que o
       piloto não enxergue é a doença de volta; uma habilidade que não é
       guarda e vira guarda é o exagero do outro lado. */
    tetoDeGuardasInvisiveis: 0,
    tetoDeFalsasGuardas: 0,
    /* A SORTE TRAVADA. O passo 3 abre com `Math.random() < 0.7`: 0 passa
       sempre, 0,99 nunca. Os dois valores entram porque a prova é dos
       dois lados — com o portão aberto o piloto escolhe a guarda, com
       ele fechado ele não escolhe apoio nenhum. */
    sorteQueAbreOApoio: 0,
    sorteQueFechaOApoio: 0.99,
    /* A rodada do apoio (o piloto só apoia em 1–2) e uma bolsa de PM que
       paga qualquer habilidade do acervo, para o custo nunca ser o que
       explica uma escolha. */
    rodadaDoApoio: 1,
    manaDeSobra: 99,
  };

  /* o molde de arena.js: trava, roda, e devolve `Math.random` no finally */
  const comSorteTravada = (valor, fn) => {
    const original = Math.random;
    Math.random = () => valor;
    try { return fn(); } finally { Math.random = original; }
  };

  /* ---------------- O ACERVO INTEIRO ---------------- */
  const ACERVO = [];
  const guardar = (h, fonte) => { if (h && h.nome) ACERVO.push({ hab: h, fonte }); };
  for (const c of CLASSES) for (const h of c.habilidades) guardar(h, `classe:${c.nome}`);
  for (const [s, hs] of Object.entries(SUBCLASSES)) for (const h of hs) guardar(h, `subclasse:${s}`);
  for (const [e, hs] of Object.entries(ESPECIALIZACOES)) for (const h of hs) guardar(h, `especializacao:${e}`);
  for (const m of MAGIAS) guardar(m, "grimorio");
  const doAcervo = (nome) => (ACERVO.find((x) => x.hab.nome === nome) || {}).hab || null;

  /* a mesa mínima em que o piloto decide: ninguém ferido (o passo 1 e o 2
     ficam calados), um inimigo de pé (o passo 3 é alcançado e a guarda SECA
     não dispara) e a rodada do apoio. */
  const INIMIGOS = [{ nome: "Goblin", vida: 20, vidaMax: 20, condicoes: [] }];
  const HEROI_INTEIRO = { nome: "Vera", vida: 90, vidaMax: 90, condicoes: [] };
  const comAHabilidade = (hab, extra = {}) => ({
    nome: "Prova", classe: "Guerreiro", nivel: 8, vida: 60, vidaMax: 60,
    mana: MEDIDA_DO_PILOTO.manaDeSobra, manaMax: MEDIDA_DO_PILOTO.manaDeSobra,
    habilidades: [{ nome: hab.nome, custo: hab.custo, tipo: hab.tipo, descricao: hab.descricao }],
    ...extra,
  });
  const planoCom = (hab, sorte = MEDIDA_DO_PILOTO.sorteQueAbreOApoio, extra = {}) =>
    comSorteTravada(sorte, () => decidirAcaoCompanheiro(comAHabilidade(hab, extra), {
      aliados: [], inimigos: INIMIGOS, jogador: HEROI_INTEIRO, rodada: MEDIDA_DO_PILOTO.rodadaDoApoio,
    }));

  console.log(`  ··  ${ACERVO.length} habilidades no acervo: ${CLASSES.reduce((a, c) => a + c.habilidades.length, 0)} de classe, ${Object.values(SUBCLASSES).flat().length} de subclasse, ${Object.values(ESPECIALIZACOES).flat().length} de especialização e ${MAGIAS.length} do grimório`);
  t(`a varredura alcança pelo menos ${MEDIDA_DO_PILOTO.pisoDoAcervo} habilidades`,
    ACERVO.length >= MEDIDA_DO_PILOTO.pisoDoAcervo, `varreu ${ACERVO.length}`);

  /* ---------------- DENTE 1: toda entrada de GUARDAS chega à mesa ------- */
  const semHabilidade = [], invisiveis = [];
  for (const g of GUARDAS) {
    const achada = ACERVO.find(({ hab }) => { const x = guardaDe(hab); return x && x.id === g.id; });
    if (!achada) { semHabilidade.push(g.id); t(`[${g.id}] tem habilidade real no acervo`, false, "nenhuma habilidade casa com essa linha"); continue; }
    t(`[${g.id}] tem habilidade real no acervo: "${achada.hab.nome}" (${achada.fonte})`, true);
    const plano = planoCom(achada.hab);
    const acertou = plano.tipo === "guarda" && plano.habilidade && plano.habilidade.nome === achada.hab.nome;
    if (!acertou) invisiveis.push(`${g.id} → ${plano.tipo}${plano.habilidade ? ` (${plano.habilidade.nome})` : ""}`);
    t(`[${g.id}] e o piloto ergue "${achada.hab.nome}" quando a tem na ficha`, acertou,
      `plano ${plano.tipo}${plano.habilidade ? ` com ${plano.habilidade.nome}` : ""}`);
  }
  t(`nenhuma das ${GUARDAS.length} entradas de GUARDAS é invisível ao piloto (teto ${MEDIDA_DO_PILOTO.tetoDeGuardasInvisiveis})`,
    invisiveis.length + semHabilidade.length <= MEDIDA_DO_PILOTO.tetoDeGuardasInvisiveis,
    [...semHabilidade.map((id) => `${id} sem habilidade`), ...invisiveis].join(" | "));

  /* ---------------- DENTE 2: nada fora da tabela vira guarda ------------ */
  const falsas = [], ehGuardaDiscorda = [];
  for (const { hab, fonte } of ACERVO) {
    const plano = planoCom(hab);
    /* `ehGuarda` é o leitor da tabela, e é ele que o piloto consulta: se o
       plano disser "guarda" para quem `ehGuarda` nega, o piloto voltou a
       adivinhar por conta própria. */
    if (plano.tipo === "guarda" && !ehGuarda(hab)) falsas.push(`${hab.nome} (${fonte})`);
    if (ehGuarda(hab) !== !!guardaDe(hab)) ehGuardaDiscorda.push(`${hab.nome} (${fonte})`);
  }
  console.log(`  ··  ${ACERVO.filter(({ hab }) => ehGuarda(hab)).length} habilidades do acervo são guarda pela tabela; ${falsas.length} falsas guardas no plano do piloto`);
  t(`nenhuma habilidade fora da tabela vira guarda (teto ${MEDIDA_DO_PILOTO.tetoDeFalsasGuardas})`,
    falsas.length <= MEDIDA_DO_PILOTO.tetoDeFalsasGuardas, falsas.slice(0, 8).join(" | "));
  /* `ehGuarda` citado por nome numa asserção de verdade (lei "export morto
     mente"): ele é `guardaDe` e nada mais — nenhum palpite por dentro. */
  t("ehGuarda é a tabela e só a tabela, no acervo inteiro",
    ehGuardaDiscorda.length === 0, ehGuardaDiscorda.slice(0, 8).join(" | "));

  /* ---------------- DENTE 3: os quatro golpes disfarçados de abrigo ----- */
  /* O caso nomeado de P1: "Dissipar Magia" casava com o regex antigo por
     dizer *barreira* (ela DESFAZ a do outro) e chegava a `efeitoDeBuff`
     narrando "+2 de dano mágico". Com ela, os três da mesma família:
     "Tiro Perfurante" ATRAVESSA escudo, "Punho de Pedra" e "Linha da
     Lâmina" RACHAM escudo. Quatro habilidades que falam de abrigo e
     estão atacando — e nenhuma delas é guarda, porque guarda sai da
     tabela e nenhuma das quatro está lá. */
  for (const nome of ["Dissipar Magia", "Tiro Perfurante", "Punho de Pedra", "Linha da Lâmina"]) {
    const h = doAcervo(nome);
    if (!h) { t(`"${nome}" existe no acervo`, false, "não encontrada"); continue; }
    t(`"${nome}" fala de abrigo e não é buff nem guarda`, !ehBuff(h) && !ehGuarda(h),
      `ehBuff=${ehBuff(h)} ehGuarda=${ehGuarda(h)}`);
  }

  /* ---------------- DENTE 4: o exagero do outro lado -------------------- */
  /* E ISTO É O QUE IMPEDE O REMÉDIO DE VIRAR DOENÇA — custou uma volta
     nesta etapa. Cinco buffs de dano PURO dizem "dano aumentado", "dano
     extra" ou "batem mais forte" na descrição; um veto solto contra essa
     linguagem os derrubaria junto com os quatro de cima. Eles não
     prometem abrigo nenhum, então nunca chegam ao desempate da tabela —
     e o piloto não pode perdê-los. */
  for (const nome of ["Fúria de Batalha", "Hino de Guerra", "Fúria Sangrenta", "Hino da Vitória", "Sangue dos Antigos"]) {
    const h = doAcervo(nome);
    if (!h) { t(`"${nome}" existe no acervo`, false, "não encontrada"); continue; }
    t(`"${nome}" continua sendo buff honesto de dano`, ehBuff(h) && !ehGuarda(h),
      `ehBuff=${ehBuff(h)} ehGuarda=${ehGuarda(h)}`);
  }

  /* ---------------- DENTE 5: a guarda de pé não é re-erguida ------------ */
  /* `erguerGuarda` recusa a repetida (seção 2), e o piloto que escolhesse
     uma que já está de pé pagaria o turno por uma linha de "essa guarda já
     está de pé". Quem sabe o que está de pé é `guardasAtivas`, o mesmo
     leitor que a defesa usa. */
  {
    const casca = doAcervo("Casca de Carvalho");
    const g = guardaDe(casca);
    const dePe = { guardas: [{ id: g.id, nome: casca.nome, valor: g.valor, tipo: "defesa", ate: 99 }] };
    t("com a guarda de pé, o piloto deixa de escolhê-la", planoCom(casca, MEDIDA_DO_PILOTO.sorteQueAbreOApoio, dePe).tipo !== "guarda");
    t("e sem ela de pé ele volta a escolhê-la (a prova de cima não passa por ausência)",
      planoCom(casca).tipo === "guarda");
  }

  /* ---------------- DENTE 6: o portão do apoio ainda é um só ------------ */
  /* UM sorteio para o passo inteiro, não dois: o portão decide SE há turno
     de apoio, nunca QUAL apoio. Com a sorte fechada nenhuma guarda é
     escolhida — se um segundo `Math.random()` nascesse dentro do passo, o
     fluxo de sorte de toda a arena mudaria junto. */
  {
    const casca = doAcervo("Casca de Carvalho");
    t("com o portão do apoio fechado, o piloto não ergue guarda nenhuma",
      planoCom(casca, MEDIDA_DO_PILOTO.sorteQueFechaOApoio).tipo !== "guarda");
  }
}

console.log(`\nguardas v9.232: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
