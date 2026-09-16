/* teste-onde-foi.mjs (v9.279) — a ação diz onde foi

   A QUEIXA que originou isto: `turnoDosInimigos` mede a distância entre
   o bicho e o alvo — `alcanca` devolve-a, e é ela que decide se o golpe
   sai — e deita-a fora antes de voltar. A ação carregava o NOME de quem
   bateu e nada sobre onde ele estava, e por isso quem age fora do
   enquadramento da câmara age em silêncio absoluto: não há borda onde
   pôr a marca nem distância para escrever nela.

   O QUE ESTA SUÍTE TEM DE PROVAR, e por esta ordem:

   1. que os campos CHEGAM, com a medida certa;
   2. que quem já lia a ação não muda de comportamento — os oito campos
      de antes continuam lá, com os mesmos valores;
   3. que SEM GRADE nenhum campo novo nasce, porque ausente quer dizer
      "não sei onde ele está" e um zero de enchimento diria "está colado
      em mim", que é a mentira mais cara que este tabuleiro conta.

   `turnoDosInimigos` rola dados de verdade: nada aqui depende de um
   rolo, só da forma do que volta. */
import { turnoDosInimigos, lugarDaAcao, LUGAR_NA_ACAO } from "../src/combate.js";
import { montarGrade, garantirGrade, distanciaM, q2m, metrosTxt } from "../src/grid.js";

let ok = 0, mau = 0;
const t = (n, c, extra = "") => { if (c) { ok++; console.log("  ok  " + n); } else { mau++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

/* OS OITO DE ONTEM. A lista está escrita à mão de propósito: se alguém
   acrescentar um campo ao objeto, esta suíte não o descobre por
   derivação — descobre porque a asserção de regressão foi escrita
   contra o contrato de ontem, e é esse contrato que não pode mudar. */
const OITO_DE_ONTEM = ["inimigo", "alvoRef", "alvoNome", "r", "golpe", "deTotal", "golpeNome", "virado"];

const heroi = { nome: "Kael", vida: 90, vidaMax: 90, nivel: 8, classe: "Guerreiro", atributos: { destreza: 3, vigor: 3 }, equipados: {}, condicoes: [] };
const goblin = { nome: "Goblin", ameaca: "comum", nivel: 8, vida: 30, vidaMax: 30, desc: "ladrãozinho de estrada" };

/* a masmorra é 7x18 — o campo comprido em que a queixa foi medida, com
   o herói e o bicho longe o bastante para um sair do enquadramento */
const campo = montarGrade({ emMasmorra: true });
const G = garantirGrade(campo);

sec("1. a tabela declara o contrato, e ele é de três campos");
t("são três", LUGAR_NA_ACAO.length === 3);
t("e são estes", LUGAR_NA_ACAO.join(",") === "onde,alvoOnde,metros");
t("nenhum deles pisa um campo de ontem", LUGAR_NA_ACAO.every((c) => !OITO_DE_ONTEM.includes(c)));

sec("2. a peça pura: a chave só nasce quando existe");
{
  const cheio = lugarDaAcao({ x: 3, y: 1 }, { x: 3, y: 9 }, { ok: true, metros: 12 });
  t("com tudo, vêm os três", Object.keys(cheio).sort().join(",") === "alvoOnde,metros,onde");
  t("a casa de quem agiu", cheio.onde.x === 3 && cheio.onde.y === 1);
  t("a casa de quem apanhou", cheio.alvoOnde.x === 3 && cheio.alvoOnde.y === 9);
  t("e a distância que `alcanca` mediu", cheio.metros === 12);

  /* ZERO MEDIDO É MEDIDA. Colado é uma distância de verdade, e recusá-la
     seria trocar "está em cima de mim" por "não sei onde ele está". */
  const colado = lugarDaAcao({ x: 2, y: 2 }, { x: 3, y: 2 }, { ok: true, metros: 0 });
  t("zero metros medido nasce na mesma", colado.metros === 0);

  /* e a ausência continua a ser ausência, nunca `null` nem `0` */
  const semNada = lugarDaAcao(null, null, null);
  t("sem nada, objeto vazio", Object.keys(semNada).length === 0);
  t("e nenhuma chave com null dentro", !("onde" in semNada) && !("metros" in semNada));
  const semMedida = lugarDaAcao({ x: 1, y: 1 }, { x: 2, y: 2 }, { ok: true });
  t("sem medida, só as casas", Object.keys(semMedida).sort().join(",") === "alvoOnde,onde");
  const semLugar = lugarDaAcao({ nome: "reforço que chegou tarde" }, { x: 2, y: 2 }, { ok: true, metros: 3 });
  t("quem não está no tabuleiro não ganha casa", !("onde" in semLugar) && semLugar.alvoOnde.x === 2);
  t("mas a medida que existe continua a vir", semLugar.metros === 3);
  t("coordenada de lixo não vira casa", !("onde" in lugarDaAcao({ x: "a", y: 2 }, null, null)));
  t("medida de lixo não vira distância", !("metros" in lugarDaAcao(null, null, { metros: "longe" })));
}

sec("3. no motor, com grade: os campos chegam e a conta bate");
{
  /* o goblin em (3,1) e o herói em (3,2): uma casa de distância, que é
     1,5 m — o alcance do goblin, logo o golpe sai */
  const inim = [{ ...goblin, x: 3, y: 1 }];
  const pos = { ...heroi, x: 3, y: 2 };
  const acoes = turnoDosInimigos({ inimigos: inim, jogador: heroi, heroi: pos, grade: campo, rodada: 2 });
  t("houve golpe", acoes.length > 0);
  const a = acoes[0];
  t("a ação diz a casa de quem agiu", !!a.onde && a.onde.x === 3 && a.onde.y === 1);
  t("e a casa de quem apanhou", !!a.alvoOnde && a.alvoOnde.x === 3 && a.alvoOnde.y === 2);
  t("e a distância em metros", a.metros === q2m(1) && a.metros === 1.5);
  t("que é a mesma que o grid mede", a.metros === distanciaM(inim[0], pos));
  /* o exemplo numérico do pedido: N casas → N × 1,5 m, e a tela sabe
     escrevê-lo sem inventar formato */
  t("e que a tela sabe escrever", metrosTxt(a.metros) === "1,5");

  /* REGRESSÃO ZERO: os oito de ontem continuam lá, e nenhum mudou. */
  t("os oito campos de ontem continuam todos", OITO_DE_ONTEM.every((c) => c in a), Object.keys(a).join(","));
  t("o nome de quem bateu não mudou", a.inimigo === "Goblin");
  t("nem o de quem apanhou", a.alvoNome === "Kael" && a.alvoRef === "jogador");
  t("nem a contagem do multiataque", a.golpe === 1 && a.deTotal >= 1);
  t("nem o resultado do golpe", !!a.r && typeof a.r.dano === "number");
  t("e não nasceu nenhum campo além dos três", Object.keys(a).every((c) => OITO_DE_ONTEM.includes(c) || LUGAR_NA_ACAO.includes(c)));
}

sec("4. a distância grande — o caso que a marca de borda existe para contar");
{
  /* um atirador do outro lado da masmorra: 16 filas, que é a medição da
     queixa. Ele alcança (arma de longe) e a ação tem de dizer de onde. */
  const longe = [{ ...goblin, nome: "Atirador", distancia: true, x: 3, y: 1 }];
  const pos = { ...heroi, x: 3, y: 17 };
  const acoes = turnoDosInimigos({ inimigos: longe, jogador: heroi, heroi: pos, grade: campo, rodada: 2 });
  t("o atirador longe ainda age", acoes.length > 0);
  const a = acoes[0] || {};
  t("e a ação carrega os 24 m", a.metros === q2m(16) && a.metros === 24);
  t("com a casa dele, para a borda saber de que lado pô-lo", a.onde && a.onde.y === 1);
  t("e a casa do alvo, para quem quiser medir da câmara", a.alvoOnde && a.alvoOnde.y === 17);
}

sec("5. SEM GRADE — o caso comum, e nada muda");
{
  const acoes = turnoDosInimigos({ inimigos: [{ ...goblin }], jogador: heroi, rodada: 2 });
  t("a luta sem terreno continua a acontecer", acoes.length > 0);
  const a = acoes[0];
  t("os oito de ontem, byte a byte", OITO_DE_ONTEM.every((c) => c in a));
  t("e NENHUM campo novo nasceu", LUGAR_NA_ACAO.every((c) => !(c in a)), Object.keys(a).join(","));
  /* a distinção que o pedido exige: quem lê tem de poder separar "não sei
     onde ele está" de "está a 0 m" */
  t("não sei onde ele está ≠ está a zero metros", a.metros === undefined && !("metros" in a));
  t("e a chave da casa também não existe", !("onde" in a) && !("alvoOnde" in a));
}

sec("6. a marionete também diz onde bateu");
{
  /* quem está virado bate noutro inimigo, e o alvo dele não é o herói:
     é exactamente o caso em que `metros` NÃO é a distância até a câmara,
     e por isso `alvoOnde` vem junto. */
  const virado = { ...goblin, nome: "Bruto", x: 2, y: 4, virado: { ate: 9 } };
  const outro = { ...goblin, nome: "Rato", x: 3, y: 4 };
  const pos = { ...heroi, x: 3, y: 17 };
  const acoes = turnoDosInimigos({ inimigos: [virado, outro], jogador: heroi, heroi: pos, grade: campo, rodada: 2 });
  const a = acoes.find((x) => x.virado) || null;
  if (!a) t("a marionete agiu", false, "nenhuma ação virada");
  else {
    t("a marionete agiu", true);
    t("e a ação diz de onde", a.onde.x === 2 && a.onde.y === 4);
    t("e para onde — que não é o herói", a.alvoOnde.y === 4 && a.alvoRef === "inimigo");
    t("com a distância entre as duas, não até a câmara", a.metros === 1.5);
  }
}

console.log(`\n${ok} ok, ${mau} falhas`);
process.exit(mau ? 1 : 0);
