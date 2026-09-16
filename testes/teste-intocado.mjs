/* teste-intocado.mjs (v9.280 · F3) — a maior das famílias que prometiam

   O QUE ESTA SUÍTE PROVA, e por que ela não é a irmã `teste-guardas.mjs`.
   Aquela prova a MÁQUINA da guarda (erguer, vencer, baixar, o piloto
   enxergar). Esta prova o VEREDITO de F3 — que `intocado` não é uma
   família, são três promessas debaixo de um rótulo, e que só uma delas
   chegou à escada. A separação importa porque o dia em que alguém quiser
   pagar as outras duas, é aqui que está escrito o que já foi respondido.

   O VEREDITO, EM UMA FRASE: a colisão que a pauta declarava — `intocado`
   contra `estaIntocavel` — não existe, porque `estaIntocavel` responde à
   promessa DE PRAZO ("por N turnos nada te atinge"), e a v9.53 já a
   respondeu. O que a família trouxe foi o degrau de BAIXO da escada.

   NADA AQUI SORTEIA. O acervo é o catálogo em código, `guardaDe` e
   `aplicacaoDoBuff` são puras, e a única seção com dado (a mordida, seção 5)
   trava `Math.random` num valor de tabela e o devolve no `finally` — o molde
   de `arena.js`, o mesmo que `teste-guardas.mjs` usa. Duas rodadas dão a
   mesma saída, em qualquer máquina. */

import { GUARDAS, ESCADA_DA_GUARDA, guardaDe, erguerGuarda, expirarGuardas, estaIntocavel, esquivaDeGuarda, guardasAtivas } from "../src/habilidades.js";
import { APLICACAO_DO_BUFF, aplicacaoDoBuff } from "../src/combos.js";
import { efeitoDeBuff } from "../src/efeitos.js";
import { resolverAtaque } from "../src/combate.js";
import { CLASSES } from "../src/classes.js";
import { SUBCLASSES } from "../src/subclasses.js";
import { ESPECIALIZACOES } from "../src/especializacoes.js";
import { MAGIAS } from "../src/grimorio.js";
import { AGUARDAM } from "../src/poder-de-classe.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

/* ---------------- A RÉGUA DESTA SUÍTE, em tabela ---------------- */
const MEDIDA_DE_F3 = {
  /* O PISO DO ALCANCE, o mesmo de `check-protecao` e `teste-guardas`, e pelo
     mesmo motivo: 148 de classe + 144 de subclasse + 216 de especialização =
     508, e o grimório entra por cima. Guarda o ALCANCE da varredura, não o
     tamanho do acervo. */
  pisoDoAcervo: 508,
  /* A FAMÍLIA INTEIRA, medida: 18 no acervo de 593. Piso e teto porque ela é
     a maior das cinco e a mais fácil de alargar por acidente — o `rx` de
     `intocado` lê palavras soltas ("imune", "desvia", "esquiva"). */
  pisoDaFamilia: 16,
  tetoDaFamilia: 20,
  /* AS QUE F3 PÔS NA ESCADA. Cinco, nomeadas na seção 2 — o número aqui é o
     dente que fica vermelho se alguém acrescentar uma sexta sem passar por
     esta suíte. */
  quantasChegaram: 5,
  /* AS QUE JÁ CUMPRIAM E NINGUÉM SABIA: três, desde a v9.53. */
  quantasJaCumpriam: 3,
  /* O TOTAL DE LINHAS DE `GUARDAS` depois de F3: 9 + 5. */
  linhasDaEscada: 14,
  /* A MORDIDA, seção 5: golpes contra o mesmo alvo, com e sem guarda. */
  golpesDaMordida: 600,
  sementeDaMordida: 0.5,
  bonusDoBruto: 5,
  danoDoBruto: 10,
  /* O piso da diferença que a esquiva tem de fazer nesses 600 golpes. É
     conservador de propósito (a medição deu ~23 pontos percentuais); o que
     ele guarda é que a desvantagem CHEGA ao dado, não o dígito exato. */
  pisoDaMordidaDaEsquiva: 10,
};

/* ---------------- O ACERVO INTEIRO ---------------- */
const ACERVO = [];
const guardar = (h, fonte) => { if (h && h.nome) ACERVO.push({ hab: h, fonte }); };
for (const c of CLASSES) for (const h of c.habilidades) guardar(h, `classe:${c.nome}`);
for (const [s, hs] of Object.entries(SUBCLASSES)) for (const h of hs) guardar(h, `subclasse:${s}`);
for (const [e, hs] of Object.entries(ESPECIALIZACOES)) for (const h of hs) guardar(h, `especializacao:${e}`);
for (const m of MAGIAS) guardar(m, "grimorio");
const doAcervo = (nome) => (ACERVO.find((x) => x.hab.nome === nome) || {}).hab || null;
const NORM = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const frase = (h) => NORM(`${(h && h.nome) || ""} ${(h && h.descricao) || ""}`);

sec("1. o alcance — a varredura chega ao acervo inteiro");
console.log(`  ··  ${ACERVO.length} habilidades varridas`);
t(`a varredura alcança pelo menos ${MEDIDA_DE_F3.pisoDoAcervo} habilidades`,
  ACERVO.length >= MEDIDA_DE_F3.pisoDoAcervo, `varreu ${ACERVO.length}`);

const familia = ACERVO.filter(({ hab }) => (aplicacaoDoBuff(hab) || {}).id === "intocado");
console.log(`  ··  a família \`intocado\` tem ${familia.length} habilidades: ${familia.map((x) => x.hab.nome).join(", ")}`);
t(`a família continua entre ${MEDIDA_DE_F3.pisoDaFamilia} e ${MEDIDA_DE_F3.tetoDaFamilia} (medidas 18)`,
  familia.length >= MEDIDA_DE_F3.pisoDaFamilia && familia.length <= MEDIDA_DE_F3.tetoDaFamilia,
  `achou ${familia.length}`);

/* ============================================================
   2. O VEREDITO — TRÊS PROMESSAS DEBAIXO DE UM RÓTULO

   Esta é a seção que carrega a decisão de F3, e as três listas são
   escritas À MÃO de propósito: perguntar ao módulo "quem chegou?" seria
   a mesma tautologia que `check-protecao` §4 existe para evitar. Quem
   decide aqui é o veredito, e o módulo é que responde por ele.
   ============================================================ */
sec("2. o veredito — três promessas, uma escada");

/* (1) O GOLPE QUE ERRA: as que a escada paga. */
const CHEGARAM = ["Esquiva Ágil", "Defesa Fluida", "Dança das Sombras", "Antevisão", "Corte de Espelhos"];
/* (2) as que JÁ CUMPRIAM desde a v9.53, e ninguém tinha percebido que eram
   desta família — o rótulo `intocado` de P1 nasceu por cima de mecânica viva. */
const JA_CUMPRIAM = ["Vazio Perfeito", "Dança Sem Vulto", "Nada Me Alcança"];
/* (3) e as que NÃO chegam, cada uma com o motivo por que não. É esta lista
   que impede a próxima mão de alargar a porta até todas caberem: uma
   habilidade que saia daqui tem de entrar em CHEGARAM, e entrar em CHEGARAM
   é escrever a linha na tabela e o motivo no cabeçalho dela. */
const NAO_CHEGAM = {
  "Contra-Canção": "remove condição no grupo — `removerPelaPorta` (condicoes.js), não a escada",
  "Mente Serena": "imunidade a CONDIÇÃO, e a porta da aflição inimiga nem `imuneA` consulta",
  "Mente Vazia": "imunidade a CONDIÇÃO",
  "Carne Sem Veneno": "imunidade a CONDIÇÃO",
  "Silêncio Interior": "imunidade a CONDIÇÃO",
  "Luz que Não Recua": "imunidade a CONDIÇÃO, e ainda no grupo",
  "Escapada": "fuga de cerco e agarrão — movimento, não dado",
  "Nada Passa": "zona: protege quem está ATRÁS, e zona presa ao lugar não existe (a Mina Oculta)",
  "Manto de Luz": "o absoluto num corpo ALHEIO, e guarda não viaja (o corpo alheio é o portador `amparo`, de F2)",
  "Ciclone Pessoal": "desvia SÓ projéteis, e a coluna que restringiria a esquiva à distância não tem leitor (`resolverAtaque` não sabe se o golpe veio de longe)",
};

for (const nome of CHEGARAM) {
  const h = doAcervo(nome);
  if (!h) { t(`"${nome}" existe no acervo`, false, "não encontrada"); continue; }
  const g = guardaDe(h);
  t(`"${nome}" chegou à escada, como esquiva`, !!g && g.tipo === "esquiva", g ? `tipo ${g.tipo}` : "não é guarda");
  t(`  e continua sendo da família \`intocado\` (a precedência é que decide, não a etiqueta)`,
    (aplicacaoDoBuff(h) || {}).id === "intocado");
}
for (const nome of JA_CUMPRIAM) {
  const h = doAcervo(nome);
  if (!h) { t(`"${nome}" existe no acervo`, false, "não encontrada"); continue; }
  t(`"${nome}" já cumpria desde a v9.53 — F3 não lhe tocou`, !!guardaDe(h));
  t(`  e é da família \`intocado\`: o rótulo de P1 nasceu por cima de mecânica viva`,
    (aplicacaoDoBuff(h) || {}).id === "intocado");
}
for (const [nome, porque] of Object.entries(NAO_CHEGAM)) {
  const h = doAcervo(nome);
  if (!h) { t(`"${nome}" existe no acervo`, false, "não encontrada"); continue; }
  t(`"${nome}" NÃO entrou na escada — ${porque}`, !guardaDe(h),
    `guardaDe devolveu ${JSON.stringify((guardaDe(h) || {}).id)}`);
}
/* e as três listas somam a família inteira: nenhuma das 18 fica sem veredito */
const julgadas = new Set([...CHEGARAM, ...JA_CUMPRIAM, ...Object.keys(NAO_CHEGAM)]);
const semVeredito = familia.map((x) => x.hab.nome).filter((n) => !julgadas.has(n));
t("as três listas cobrem a família inteira — nenhuma das 18 fica sem veredito escrito",
  semVeredito.length === 0, semVeredito.join(" | "));

/* ============================================================
   3. O RECORTE — E O QUE IMPEDE A PRÓXIMA MÃO DE ALARGAR A PORTA

   18 é um número que convida a alargar o regex até todas caberem, e F2
   pagou essa lição por escrito. O dente aqui anda nos dois sentidos: o
   recorte apanha EXATAMENTE as cinco, e os alargamentos tentadores são
   medidos com as intrusas NOMEADAS — para que quem os tentar amanhã leia
   aqui quanto custam antes de os escrever.
   ============================================================ */
sec("3. o recorte — exatamente cinco, e as intrusas nomeadas");
{
  const novas = new Set(["esquiva_agil", "defesa_fluida", "danca_das_sombras", "antevisao", "corte_de_espelhos"]);
  const apanhadas = ACERVO.filter(({ hab }) => novas.has((guardaDe(hab) || {}).id));
  console.log(`  ··  as linhas novas apanham ${apanhadas.length} frases do acervo: ${apanhadas.map((x) => x.hab.nome).join(", ")}`);
  t(`as cinco linhas novas apanham exatamente ${MEDIDA_DE_F3.quantasChegaram} frases do acervo`,
    apanhadas.length === MEDIDA_DE_F3.quantasChegaram,
    apanhadas.map((x) => `${x.hab.nome} (${x.fonte})`).join(" | "));
  t("e são exatamente as cinco do veredito",
    apanhadas.every((x) => CHEGARAM.includes(x.hab.nome)) && apanhadas.length === CHEGARAM.length);

  /* cada linha nova pega UMA frase, e só uma: uma linha da escada que
     apanhasse duas habilidades diferentes estaria a decidir por uma delas
     sem ninguém ter escrito o porquê */
  for (const id of novas) {
    const quantas = ACERVO.filter(({ hab }) => (guardaDe(hab) || {}).id === id);
    t(`[${id}] apanha uma frase e só uma`, quantas.length === 1,
      quantas.map((x) => x.hab.nome).join(", ") || "nenhuma");
  }

  /* ---------------- OS ALARGAMENTOS QUE NÃO SE FAZEM ----------------
     Três regex que a preguiça escreveria, e o preço de cada um, medido no
     acervo inteiro. Quem os escrever amanhã leva junto as intrusas que
     estão nomeadas aqui — e nenhuma delas promete um golpe que erra. */
  const TENTACOES = [
    { rx: /desvia/, porque: "`desvia` solto apanha quem desvia PROJÉTEIS e quem desvia o golpe PARA outro" },
    { rx: /imune/, porque: "`imune` solto apanha a imunidade a CONDIÇÃO, que é a segunda promessa do rótulo e não é esta" },
    { rx: /erra/, porque: "`erra` solto apanha quem faz o INIMIGO errar por outro caminho que não a guarda" },
    { rx: /esquiva/, porque: "`esquiva` solto apanha a palavra onde ela é substantivo de perícia, não promessa de dado" },
  ];
  for (const { rx, porque } of TENTACOES) {
    const pegaria = ACERVO.filter(({ hab }) => rx.test(frase(hab)));
    const intrusas = pegaria.filter((x) => !CHEGARAM.includes(x.hab.nome) && !JA_CUMPRIAM.includes(x.hab.nome));
    console.log(`  ··  /${rx.source}/ apanharia ${pegaria.length} — ${intrusas.length} intrusas: ${intrusas.map((x) => x.hab.nome).join(", ") || "nenhuma"}`);
    t(`o alargamento /${rx.source}/ NÃO foi feito — ${porque}`,
      !GUARDAS.some((g) => g.rx.source === rx.source));
  }
  /* E O DENTE QUE IMPORTA: a frase tem de prometer o que a família paga.
     Nenhuma das habilidades que ficaram de fora do veredito pode ter
     entrado na escada por um regex frouxo. */
  const entraramSemVeredito = Object.keys(NAO_CHEGAM).filter((n) => !!guardaDe(doAcervo(n)));
  t("nenhuma das que o veredito recusou entrou pela porta dos fundos",
    entraramSemVeredito.length === 0, entraramSemVeredito.join(" | "));
}

/* ============================================================
   4. A RÉGUA DA ESCADA — o prazo deixa de ser número solto

   `ESCADA_DA_GUARDA` não introduziu número nenhum: ela DESCOBRIU o que já
   estava escrito à mão nas três linhas de esquiva da v9.53, e agora cobra
   a igualdade. É a lei "se é número, é tabela" aplicada a um número que
   já existia e ninguém tinha nomeado.
   ============================================================ */
sec("4. a régua da escada — o prazo sai do custo, e a suíte o lê de volta");
{
  t("GUARDAS tem as 14 linhas da escada depois de F3",
    GUARDAS.length === MEDIDA_DE_F3.linhasDaEscada, `tem ${GUARDAS.length}`);
  t("a régua está em tabela, e o piso e o divisor são números positivos",
    ESCADA_DA_GUARDA.pmPorTurno > 0 && ESCADA_DA_GUARDA.pisoDeTurnos >= 1 && ESCADA_DA_GUARDA.turnosDoAbsoluto >= 1);

  const fora = [];
  const vistas = new Set();
  for (const { hab } of ACERVO) {
    const g = guardaDe(hab);
    if (!g || vistas.has(g.id)) continue;
    vistas.add(g.id);
    if (g.tipo !== "esquiva") continue;
    const pm = Number(hab.custo) || 0;
    const esperado = Math.max(ESCADA_DA_GUARDA.pisoDeTurnos, Math.floor(pm / ESCADA_DA_GUARDA.pmPorTurno));
    if (g.turnos !== esperado) fora.push(`${g.id}: ${pm} PM → ${g.turnos} turnos (a régua manda ${esperado})`);
  }
  t("TODA guarda de esquiva do acervo obedece à régua — prazo = floor(PM / pmPorTurno), piso 1",
    fora.length === 0, fora.join(" | "));

  /* e a régua não é vazia: ela tem de ter enxergado as oito esquivas */
  t("a régua foi cobrada em todas as esquivas da tabela (não passou verde medindo lista vazia)",
    GUARDAS.filter((g) => g.tipo === "esquiva").length >= 8,
    `só ${GUARDAS.filter((g) => g.tipo === "esquiva").length} esquivas`);

  /* ---------------- A LEI DO ABSOLUTO ---------------- */
  const absolutas = GUARDAS.filter((g) => g.tipo === "intocavel");
  t("continua havendo UMA guarda absoluta, e só uma", absolutas.length === 1, absolutas.map((g) => g.id).join(", "));
  t(`e ela dura ${ESCADA_DA_GUARDA.turnosDoAbsoluto} turno — o absoluto paga o prazo em 1, custe o que custar`,
    absolutas.every((g) => g.turnos === ESCADA_DA_GUARDA.turnosDoAbsoluto));
  {
    const vazio = doAcervo("Vazio Perfeito");
    const pm = Number(vazio.custo) || 0;
    const seFosseEsquiva = Math.floor(pm / ESCADA_DA_GUARDA.pmPorTurno);
    t(`o absoluto ABRE MÃO do prazo: Vazio Perfeito paga ${pm} PM e compraria ${seFosseEsquiva} turnos de esquiva — leva 1`,
      seFosseEsquiva > absolutas[0].turnos, `${seFosseEsquiva} contra ${absolutas[0].turnos}`);
  }
  /* NENHUMA DAS CINCO NOVAS É ABSOLUTA, e este é o dente que guarda a
     decisão da etapa. Um absoluto barato é a única coisa que, entregue
     errada, acaba com o combate (combate.js:105-111). */
  for (const nome of CHEGARAM) {
    const h = doAcervo(nome);
    t(`"${nome}" (${h.custo} PM) NÃO é absoluta — o absoluto custa 8 PM nesta casa`,
      guardaDe(h).tipo !== "intocavel");
  }
  /* as de prazo longo continuam a ser desvantagem, nunca imunidade (v9.53) */
  t("nenhuma guarda de 2 turnos ou mais é absoluta",
    !GUARDAS.some((g) => g.tipo === "intocavel" && g.turnos >= 2));
}

/* ============================================================
   5. ONDE MORDE — o número próprio desta etapa

   A catraca da arena e a régua de Uma Vida não medem F3, e as duas por
   motivos DIFERENTES, que ficam escritos aqui porque uma medição que
   ninguém sabe cega é pior que nenhuma:
     · a régua de Uma Vida é cega por ROSTER — o grupo dela é Guerreiro,
       Mago, Clérigo e Engenheiro, e as cinco são de Ladino, Monge,
       Andarilho, Mente Vazia e Enganador Radiante. Ela sai idêntica.
     · a arena NÃO é cega: `erguerGuarda` corre lá, e `sombra` tem Esquiva
       Ágil na ficha. Ela mede — e o que mede está no diário.
   O que esta seção faz é medir a MORDIDA em si, que é o que nenhuma das
   duas isola: quantos golpes deixam de acertar enquanto a guarda está de pé.
   ============================================================ */
sec("5. onde morde — 600 golpes contra o mesmo alvo");
{
  const comSorteTravada = (valor, fn) => {
    const original = Math.random;
    Math.random = () => valor;
    try { return fn(); } finally { Math.random = original; }
  };
  /* A SORTE TRAVADA NÃO SERVE AQUI, e é por isso que este bloco usa um
     gerador PRÓPRIO e semeado: com `Math.random` preso num valor, todo d20
     sai igual e a desvantagem (que é o MENOR de dois dados iguais) não
     mudaria nada. O gerador é o mesmo molde de `sorteDaSemente`
     (regua-combate.mjs): determinístico, e devolvido no `finally`. */
  const semeado = (s) => { let x = s >>> 0 || 1; return () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; }; };
  const comSemente = (fn) => {
    const original = Math.random;
    Math.random = semeado(20260916);
    try { return fn(); } finally { Math.random = original; }
  };
  const ALVO = { nome: "Alvo", classe: "Ladino", nivel: 5, atributos: { destreza: 2 }, vida: 999, vidaMax: 999 };
  const bater = (quem) => comSemente(() => {
    let acertos = 0, dano = 0;
    for (let i = 0; i < MEDIDA_DE_F3.golpesDaMordida; i++) {
      const r = resolverAtaque({ atacante: "Bruto", alvo: quem, ehAtacanteInimigo: true, bonusAtaque: MEDIDA_DE_F3.bonusDoBruto, danoBase: MEDIDA_DE_F3.danoDoBruto });
      if (r.dano > 0) { acertos++; dano += r.dano; }
    }
    return { acertos, dano };
  });

  const nu = bater(ALVO);
  console.log(`  ··  sem guarda: ${nu.acertos}/${MEDIDA_DE_F3.golpesDaMordida} acertos (${(100 * nu.acertos / MEDIDA_DE_F3.golpesDaMordida).toFixed(1)}%) · ${nu.dano} de dano`);
  t("a amostra nua acerta alguma coisa (senão a comparação não mede nada)",
    nu.acertos > MEDIDA_DE_F3.golpesDaMordida * 0.2, `${nu.acertos} acertos`);
  t("e a mesma amostra, duas vezes, dá o mesmo número — a semente é o árbitro",
    JSON.stringify(bater(ALVO)) === JSON.stringify(nu));

  for (const nome of CHEGARAM) {
    const h = doAcervo(nome);
    const r = erguerGuarda(ALVO, h, 1);
    t(`"${nome}" é erguida de verdade e a ficha do alvo não foi mutada`,
      !!r && r.ok === true && guardasAtivas(ALVO).length === 0);
    const com = bater(r.pers);
    const queda = 100 * (nu.acertos - com.acertos) / MEDIDA_DE_F3.golpesDaMordida;
    console.log(`  ··  ${nome}: ${com.acertos}/${MEDIDA_DE_F3.golpesDaMordida} acertos (${(100 * com.acertos / MEDIDA_DE_F3.golpesDaMordida).toFixed(1)}%) · ${com.dano} de dano · −${queda.toFixed(1)} pontos de acerto`);
    t(`  e ela morde: pelo menos ${MEDIDA_DE_F3.pisoDaMordidaDaEsquiva} pontos de acerto a menos`,
      queda >= MEDIDA_DE_F3.pisoDaMordidaDaEsquiva, `caiu ${queda.toFixed(1)}`);
    t(`  e NÃO zera o golpe — quem entorta o dado não é absoluto`, com.acertos > 0);
    t(`  e o alvo não fica intocável por causa dela`, !estaIntocavel(r.pers) && esquivaDeGuarda(r.pers));
  }

  /* O CONTRASTE QUE EXPLICA A ESCADA INTEIRA, num número só: o absoluto
     apaga 600 golpes de 600, e é por isso que ele dura um turno e custa 8. */
  {
    const vazio = erguerGuarda(ALVO, doAcervo("Vazio Perfeito"), 1);
    const com = bater(vazio.pers);
    console.log(`  ··  Vazio Perfeito (o absoluto): ${com.acertos}/${MEDIDA_DE_F3.golpesDaMordida} acertos · ${com.dano} de dano`);
    t("o absoluto apaga TODOS os golpes — e é por isso que dura um turno", com.acertos === 0 && com.dano === 0);
  }
}

/* ============================================================
   6. A PRECEDÊNCIA — as duas portas convivem, e a regra é de uma linha
   ============================================================ */
sec("6. a precedência — guardaDe primeiro, e nada mais muda");
{
  const colisoes = ACERVO.filter(({ hab }) => guardaDe(hab) && aplicacaoDoBuff(hab));
  console.log(`  ··  ${colisoes.length} frases casam com GUARDAS e com uma família de APLICACAO_DO_BUFF: ${colisoes.map((x) => `${x.hab.nome}→${aplicacaoDoBuff(x.hab).id}`).join(", ")}`);
  /* CONTRA `absorve` A CONTA CONTINUA SENDO 1, e é a frase que o comentário
     de `efeitos.js` escreveu na v9.233: Forma Dracônica. As outras colisões
     são todas da família `intocado`, que é a desta etapa. */
  const contraAbsorve = colisoes.filter((x) => aplicacaoDoBuff(x.hab).id === "absorve");
  t("contra `absorve` continua havendo exatamente 1 colisão, e é a Forma Dracônica",
    contraAbsorve.length === 1 && contraAbsorve[0].hab.nome === "Forma Dracônica",
    contraAbsorve.map((x) => x.hab.nome).join(", "));
  t("e todas as outras colisões são da família desta etapa",
    colisoes.filter((x) => aplicacaoDoBuff(x.hab).id !== "absorve").every((x) => aplicacaoDoBuff(x.hab).id === "intocado"));
  /* A PRECEDÊNCIA, provada pelo efeito e não pelo texto: quem é guarda não
     recebe número de abrigo nenhum por `efeitoDeBuff`. */
  const HEROI = { nome: "Régua", classe: "Guerreiro", nivel: 5, efeitos: [] };
  for (const { hab } of colisoes) {
    const { efeito } = efeitoDeBuff(hab, HEROI, undefined);
    t(`"${hab.nome}" é guarda, e a família não lhe inventa número`,
      efeito.amortece === undefined && efeito.curaTurno === undefined,
      JSON.stringify(efeito));
  }
  /* e a tabela das famílias não foi tocada por F3: o rótulo continua onde
     estava, e quem decide o que acontece é a precedência */
  t("APLICACAO_DO_BUFF continua com as cinco famílias de P1",
    APLICACAO_DO_BUFF.length === 5 && APLICACAO_DO_BUFF.some((a) => a.id === "intocado"));
}

/* ============================================================
   7. A MÁQUINA NÃO MUDOU — prazo, lixo e imutabilidade
   ============================================================ */
sec("7. o prazo vence, o lixo não custa o turno, e nada é mutado");
{
  const alvo = { nome: "Vera", classe: "Monge", nivel: 5, atributos: { destreza: 2 }, vida: 40, vidaMax: 40 };
  const h = doAcervo("Esquiva Ágil");
  const erguida = erguerGuarda(alvo, h, 3).pers;
  t("a guarda de 1 turno erguida na rodada 3 ainda está de pé na rodada 3",
    expirarGuardas(erguida, 3).pers.guardas.length === 1);
  t("e cai na rodada 4", (expirarGuardas(erguida, 4).pers.guardas || []).length === 0);
  t("a ficha original não foi tocada em nenhum dos dois caminhos",
    (alvo.guardas || []).length === 0 && (erguida.guardas || []).length === 1);
  t("erguer a mesma guarda duas vezes é recusado, e a ficha volta inteira",
    erguerGuarda(erguida, h, 3).ok === false);

  t("guardaDe(null) é null — o caminho do padrão, não um erro", guardaDe(null) === null);
  t("guardaDe({}) é null", guardaDe({}) === null);
  t("guardaDe de frase vazia é null", guardaDe({ nome: "", descricao: "" }) === null);
  t("erguerGuarda com habilidade que não é guarda devolve null", erguerGuarda(alvo, { nome: "Bola de Fogo", descricao: "Explosão." }, 1) === null);
  t("estaIntocavel(null) é false e não estoura", estaIntocavel(null) === false);
  t("esquivaDeGuarda(null) é false e não estoura", esquivaDeGuarda(null) === false);
  /* `= {}` não cobre `null`: a segunda opção entra explicitamente */
  t("esquivaDeGuarda(pers, null) não estoura", esquivaDeGuarda(alvo, null) === false);
}

/* ============================================================
   8. A CONTABILIDADE — `AGUARDAM` não cresceu, e as dívidas trocadas
      estão escritas
   ============================================================ */
sec("8. a contabilidade da dívida");
{
  for (const nome of ["Esquiva Ágil", "Defesa Fluida"]) {
    const linha = AGUARDAM.find((a) => a.nome === nome);
    t(`"${nome}" CONTINUA em AGUARDAM — a escada paga a desvantagem, não o "anula"`, !!linha);
    t(`  e a linha dela registra a troca de dívida feita em F3`,
      !!linha && /F3/.test(linha.motivo) && /MUDOU DE DÍVIDA|irmã exata/.test(linha.motivo),
      linha ? linha.motivo.slice(0, 80) : "");
  }
  /* A terceira troca: a dívida da imunidade temporária foi MEDIDA e é maior
     do que a linha antiga dizia — a porta da aflição inimiga nem `imuneA`
     consulta. Fica escrita para a etapa que a pagar. */
  {
    const linha = AGUARDAM.find((a) => a.nome === "Mente Serena");
    t("\"Mente Serena\" continua em AGUARDAM, com a dívida medida e reescrita em F3",
      !!linha && /F3/.test(linha.motivo) && /rolarAflicao/.test(linha.motivo));
  }
  /* e nenhuma saiu: F3 não quitou dívida nenhuma, e dizer o contrário seria
     a contabilidade a mentir. O teto de `AGUARDAM` é cobrado em
     `teste-poder-de-classe.mjs` §6 e não se repete aqui. */
  t("nenhuma das cinco que chegaram à escada saiu de AGUARDAM por causa disso",
    ["Esquiva Ágil", "Defesa Fluida"].every((n) => AGUARDAM.some((a) => a.nome === n)));
}

console.log(`\nintocado (F3): ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
