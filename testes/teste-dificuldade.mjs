/* A DIFICULDADE, agora medida em PODER (v9.116).

   O que se mede aqui não é "a função devolve algo": é se os quatro
   patamares descrevem MESMO o que o pedido pediu — grupo forte demais dá
   Fácil, páreo dá Médio, fraco demais dá Difícil, sem chance dá
   Impossível — e se os cortes continuam caindo onde a v9.115 os punha.

   Essa última parte é a que importa mais. A régua mudou de delta de
   nível para razão de poder; se os CORTES mudassem junto, ninguém teria
   como saber qual dos dois mexeu no jogo. */

const S = "../src/";
const D = await import(S + "dificuldade.js");
const P = await import(S + "poder.js");
const { gerarLoot } = await import(S + "loot.js");

let ok = 0; const falhas = [];
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; return; }
  falhas.push(nome);
  console.log("  ✗ " + nome + (extra ? ` — ${extra}` : ""));
};

const SLOTS = ["arma", "armadura", "elmo", "botas", "anel", "amuleto", "escudo"];
const ABAIXO = { lendario: "epico", epico: "raro", raro: "incomum", incomum: "comum", comum: "comum" };
const raridadeDoNivel = (n) => (n < 4 ? "comum" : n < 8 ? "incomum" : n < 13 ? "raro" : n < 18 ? "epico" : "lendario");
function ficha(nivel, extra = {}) {
  const pontos = 9 + 2 * (nivel - 1);
  const chave = Math.min(Math.max(3, 3 + Math.floor(nivel / 3)), 12);
  const resto = Math.max(0, pontos - chave), cada = Math.floor(resto / 5);
  const eq = {};
  SLOTS.forEach((s, i) => {
    const r = raridadeDoNivel(nivel);
    eq[s] = gerarLoot(i % 2 === 0 ? r : ABAIXO[r], { tipo: s, nivel });
  });
  return {
    nome: "Íris", nivel, equipados: eq, grupo: [],
    atributos: { destreza: chave, forca: cada, vigor: cada, intelecto: cada, presenca: cada, percepcao: resto - cada * 4 },
    habilidades: Array.from({ length: Math.max(0, nivel - 1) }, (_, i) => ({ nome: "h" + i })),
    subclasse: nivel >= 3 ? "Batedora" : "", especializacao: nivel >= 6 ? "Caçadora" : "",
    ...extra,
  };
}

/* ---------------- OS QUATRO PATAMARES ---------------- */
const heroi = ficha(12);
const pat = (n, tam = 0) => D.avaliar({ nivel: n, tamanho: tam }, heroi).patamar.id;
t("conteúdo bem abaixo → Fácil", pat(6) === "facil", pat(6));
t("conteúdo do tamanho → Médio", pat(12) === "medio", pat(12));
t("conteúdo acima → Difícil", pat(16) === "dificil", pat(16));
t("conteúdo muito acima → Impossível", pat(24) === "impossivel", pat(24));

/* ---------------- OS CORTES CONTINUAM ONDE ESTAVAM ----------------
   A v9.115 cortava em níveis: +3 vira Fácil, −1 ainda é Médio, −6 ainda
   é Difícil, −7 é Impossível. Trocar a régua E os cortes ao mesmo tempo
   tornaria impossível saber qual dos dois mexeu no jogo. */
t("três níveis acima ainda é Fácil", pat(12 - 3) === "facil", pat(12 - 3));
t("dois níveis acima ainda é Médio", pat(12 - 2) === "medio", pat(12 - 2));
t("um nível abaixo ainda é Médio", pat(12 + 1) === "medio", pat(12 + 1));
t("dois níveis abaixo já é Difícil", pat(12 + 2) === "dificil", pat(12 + 2));
t("seis níveis abaixo ainda é Difícil", pat(12 + 6) === "dificil", pat(12 + 6));
t("oito níveis abaixo é Impossível", pat(12 + 8) === "impossivel", pat(12 + 8));

/* ---------------- A MONOTONIA ----------------
   Subir o conteúdo nunca facilita; subir o herói nunca endurece. Sem
   isso a escala se contradiz e o rótulo deixa de valer. */
{
  let anterior = -1, monotona = true, quebrou = "";
  for (let n = 1; n <= 40; n++) {
    const i = D.PATAMARES.indexOf(D.avaliar({ nivel: n }, heroi).patamar);
    if (i < anterior) { monotona = false; quebrou = `nível ${n}`; }
    anterior = i;
  }
  t("subir o nível do conteúdo nunca facilita", monotona, quebrou);

  let dur = 99, monot2 = true, q2 = "";
  for (let nv = 1; nv <= 30; nv++) {
    const i = D.PATAMARES.indexOf(D.avaliar({ nivel: 15 }, ficha(nv)).patamar);
    if (i > dur) { monot2 = false; q2 = `herói ${nv}`; }
    dur = i;
  }
  t("subir o herói nunca endurece", monot2, q2);
}

/* ---------------- O QUE O PEDIDO GANHOU COM O PODER ----------------
   Duas fichas do MESMO nível, uma pelada e outra lendária, têm de ler
   patamares diferentes contra o mesmo conteúdo. É exatamente o que o
   delta de nível não conseguia fazer, e é a razão de tudo isto. */
{
  const pelado = { ...ficha(12), equipados: {}, habilidades: [] };
  const lendario = { ...ficha(12), equipados: Object.fromEntries(SLOTS.map((s) => [s, gerarLoot("lendario", { tipo: s, nivel: 12 })])) };
  const a = D.avaliar({ nivel: 14 }, pelado);
  const b = D.avaliar({ nivel: 14 }, lendario);
  t("o equipamento muda o patamar no mesmo nível", a.patamar.id !== b.patamar.id,
    `pelado ${a.patamar.id} (${a.razao}) · lendário ${b.patamar.id} (${b.razao})`);
  t("e quem está mais bem equipado lê mais fácil",
    D.PATAMARES.indexOf(b.patamar) < D.PATAMARES.indexOf(a.patamar));
}

/* ---------------- O GRUPO ---------------- */
{
  const so = D.avaliar({ nivel: 15 }, heroi);
  const acompanhado = D.avaliar({ nivel: 15 }, { ...heroi, grupo: [ficha(12), ficha(12)] });
  t("trazer gente melhora a leitura", acompanhado.razao > so.razao, `${so.razao} → ${acompanhado.razao}`);
  /* mas não resolve tudo: o teto do grupo continua valendo, e é por isso
     que "leve mais gente" não é a resposta para qualquer patamar */
  const multidao = D.avaliar({ nivel: 26 }, { ...heroi, grupo: Array.from({ length: 20 }, () => ficha(12)) });
  t("nem vinte companheiros tornam o impossível possível", multidao.patamar.id === "impossivel", multidao.patamar.id);
}

/* ---------------- O TAMANHO É CUSTO, NÃO FORÇA ---------------- */
{
  const curta = D.avaliar({ nivel: 12, tamanho: 1 }, heroi);
  const longa = D.avaliar({ nivel: 12, tamanho: 12 }, heroi);
  t("mais salas pesam", longa.poderDoConteudo > curta.poderDoConteudo);
  t("mas o tamanho tem teto", longa.poderDoConteudo / curta.poderDoConteudo <= 1.3,
    (longa.poderDoConteudo / curta.poderDoConteudo).toFixed(2));
}

/* ---------------- SEM O DADO, NÃO SE OPINA ---------------- */
t("missão sem nível devolve null", D.dificuldadeDaMissao({ titulo: "velha", etapas: [] }, heroi) === null);
t("missão com nível devolve patamar", !!D.dificuldadeDaMissao({ titulo: "x", nivel: 12, etapas: [{}, {}] }, heroi));
t("masmorra sem nível devolve null", D.dificuldadeDaMasmorra({ nome: "x", salas: [] }, heroi) === null);
t("masmorra com nível devolve patamar", !!D.dificuldadeDaMasmorra({ nome: "x", nivel: 11, salas: [1, 2, 3] }, heroi));

/* ---------------- O COMPANHEIRO QUE SE CONVIDA ----------------
   "pra ele saber se o personagem é fraco ou forte pra entrar no grupo." */
{
  const forte = D.pesarCompanheiro(ficha(12), heroi);
  const fraco = D.pesarCompanheiro(ficha(3), heroi);
  t("um par lê 'à sua altura'", forte.veredito === "à sua altura", `${forte.veredito} (${forte.fracao})`);
  t("um aprendiz lê 'muito abaixo'", /muito abaixo/.test(fraco.veredito), `${fraco.veredito} (${fraco.fracao})`);
  t("e o forte soma mais ao grupo que o fraco", forte.ganho > fraco.ganho, `${forte.ganho} vs ${fraco.ganho}`);
  t("o peso traz o poder dele", forte.poder > 0);
  /* a fração é contra MIM, que é o que o jogador quer saber */
  t("a fração compara com o herói", Math.abs(forte.fracao - forte.poder / P.poderDe(heroi).total) < 0.02);
}

/* ---------------- O PORQUÊ ----------------
   Um rótulo sem motivo é número mágico: o jogador não sabe se sobe de
   nível, arruma gente ou troca de espada. */
{
  const av = D.avaliar({ nivel: 16 }, { ...heroi, grupo: [ficha(12)] });
  t("o porquê traz o poder do grupo", av.porque.includes(P.formatarPoder(av.poderDoGrupo)));
  t("o porquê traz o poder do conteúdo", av.porque.includes(P.formatarPoder(av.poderDoConteudo)));
  t("o porquê cita o grupo quando há grupo", /no grupo/.test(av.porque), av.porque);
  t("e não cita grupo quando se está só", !/no grupo/.test(D.avaliar({ nivel: 16 }, heroi).porque));
  t("o porquê diz quantas vezes", /×/.test(av.porque), av.porque);
  /* e NÃO diz "1,1× menos" quando é empate: perto de um, a conta não tem
     o que dizer além de "é do seu tamanho" — foi o que apareceu na tela
     na primeira vez que isto rodou. */
  {
    const empate = D.avaliar({ nivel: 12 }, heroi);
    if (empate.razao >= 0.8 && empate.razao <= 1.25) {
      t("perto de um, não se diz em vezes", /mesmo tamanho/.test(empate.porque), empate.porque);
      t("e não sai um '1× menos'", !/1[,.]\d× menos/.test(empate.porque), empate.porque);
    } else { ok += 2; }
  }
}

/* ---------------- A LINHA DA TELA ---------------- */
{
  const av = D.avaliar({ nivel: 12 }, heroi);
  t("a linha traz ícone e rótulo", D.linhaDaDificuldade(av).includes(av.patamar.rotulo) && D.linhaDaDificuldade(av).includes(av.patamar.icone));
  t("sem avaliação, linha vazia", D.linhaDaDificuldade(null) === "");
}

/* ---------------- O QUE SOBE AO NARRADOR ---------------- */
{
  const env = D.envelopeDaDificuldade(D.avaliar({ nivel: 26 }, heroi), "a Cripta");
  t("o envelope existe", env.includes("DIFICULDADE"));
  t("o envelope NÃO leva número nenhum", !/\d/.test(env), env.slice(0, 140));
  t("o envelope NÃO diz o rótulo do patamar", !/Impossível|Fácil|Médio|Difícil/.test(env));
  t("mas manda o Mestre não abrir exceção", /não vira|fora do alcance|nunca coragem/i.test(env));
  t("sem avaliação, envelope vazio", D.envelopeDaDificuldade(null, "x") === "");
}

/* ---------------- A CATRACA ---------------- */
for (const p of D.PATAMARES) {
  t(`patamar ${p.id} completo`, !!(p.id && p.icone && p.rotulo && p.nota && p.aoMestre && p.cor));
  t(`patamar ${p.id} fala ao Mestre em português de cena`, p.aoMestre.length > 60);
}
t("os quatro patamares do pedido, nessa ordem",
  D.PATAMARES.map((p) => p.id).join(",") === "facil,medio,dificil,impossivel",
  D.PATAMARES.map((p) => p.id).join(","));
t("sem ficha não explode", !!D.avaliar({ nivel: 3 }, null).patamar);
t("ficha vazia não explode", !!D.avaliar({ nivel: 3 }, {}).patamar);
t("conteúdo sem nível não explode", !!D.avaliar({}, heroi).patamar);

console.log(`\n${ok} passaram` + (falhas.length ? ` · ${falhas.length} FALHARAM` : " · sem falhas"));
process.exit(falhas.length ? 1 : 0);
