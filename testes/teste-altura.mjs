/* teste-altura.mjs (CB14, Fase CB lote 3, 10/11/2026) — de cima acerta-se melhor e vê-se mais longe

   A mecânica de BG3/DOS2: +2 no d20 de quem está mais alto que o alvo, −2
   de quem está mais baixo (`BONUS_DA_ALTURA`, grid.js); o terreno de dois
   degraus tapa a vista a quem está mais baixo dos dois lados; o objeto alto
   (o carro de feno) tapa a vista no chão e não a quem está num degrau. Esta
   suíte prova: a tabela; as plantas (algumas com altura, nunca todas, todo
   degrau dentro do campo e fora da parede); a leitura nula sem grade; o
   olhar; e que a altura entra nas TRÊS contas que têm de bater — o golpe do
   inimigo (`armarGolpeDoInimigo`), a previsão do herói (`previsaoDoHeroi`,
   o campo `alto`) e a rolagem verdadeira (±3 pp, a catraca da casa). */
import {
  BONUS_DA_ALTURA, PLANTAS, montarGrade, garantirGrade, alturaEm, bonusDaAltura, linhaDeVisao,
  OBJETOS_DO_CENARIO, ehParede, dentro, alturasDaPlanta,
} from "../src/grid.js";
import { armarGolpeDoInimigo, resolverAtaque, defesaDe, danoDe, danoDaClasse } from "../src/combate.js";
import { previsaoDoHeroi } from "../src/previsao.js";
import { chanceDeAcerto } from "../src/fuga.js";
import { completarInimigo } from "../src/bestiario.js";
import { perfilDe, elementoDaArma } from "../src/danos.js";
import { modDoGolpe } from "../src/itens.js";
import { rng, hashSemente } from "../src/semente.js";

let bons = 0, maus = 0;
const t = (nome, cond, extra = "") => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? "  — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const perto = (a, b, tol) => Math.abs(a - b) <= tol;

/* uma grade à mão: campo 10×10, sem parede, com os degraus e objetos dados */
const grade = (alturas = {}, objetos = [], paredes = []) => ({ cenario: "estrada", largura: 10, altura: 10, paredes, estorvos: objetos.map((o) => `${o.x},${o.y}`), alturas, objetos });

sec("1. a tabela");
{
  t("de cima +2, de baixo −2 (o plano, §3.8)", BONUS_DA_ALTURA.doAlto === 2 && BONUS_DA_ALTURA.deBaixo === -2);
  t("os degraus são 0, 1 e 2", BONUS_DA_ALTURA.degraus.join() === "0,1,2");
  t("o terreno tapa a vista de dois degraus para cima", BONUS_DA_ALTURA.tapaAVistaDesde === 2);
  t("o porquê está escrito", typeof BONUS_DA_ALTURA.porque === "string" && BONUS_DA_ALTURA.porque.length > 20);
}

sec("2. as plantas: algumas com altura, nunca todas");
{
  const ids = Object.keys(PLANTAS);
  const com = ids.filter((id) => (PLANTAS[id].alturas || []).length);
  t(`há plantas com altura (${com.join(", ")}) e plantas sem`, com.length >= 5 && com.length < ids.length);
  let foraDaTabela = 0, foraDoCampo = 0, naParede = 0;
  for (const id of com) {
    const p = PLANTAS[id];
    const g = montarGrade({ local: id === "masmorra" ? "" : id, emMasmorra: id === "masmorra" });
    if (g.cenario !== id) continue;
    for (const [k, h] of Object.entries(alturasDaPlanta(id))) {
      const [x, y] = k.split(",").map(Number);
      if (!BONUS_DA_ALTURA.degraus.includes(h) || h === 0) foraDaTabela++;
      if (x < 0 || y < 0 || x >= p.largura || y >= p.altura) foraDoCampo++;
      if (ehParede(g, x, y)) naParede++;
    }
  }
  t("todo degrau é da tabela (1 ou 2)", foraDaTabela === 0);
  t("todo degrau mora dentro do campo", foraDoCampo === 0);
  t("nenhum degrau em cima de parede", naParede === 0);
  const sem = ids.find((id) => !(PLANTAS[id].alturas || []).length);
  t(`a planta sem altura (${sem}) não tem degrau nenhum`, Object.keys(alturasDaPlanta(sem)).length === 0);
  /* a grade que o save guarda é a de antes: a altura e os objetos saem da
     planta em garantirGrade, e os dourados do motor tiram foto da grade */
  const ruina = montarGrade({ local: "ruina" });
  t("montarGrade não escreve altura nem objetos (a grade do save é a de antes)", !("alturas" in ruina) && !("objetos" in ruina));
  t("garantirGrade lê-os da planta pelo nome", alturaEm(ruina, 0, 12) === 2 && garantirGrade(ruina).objetos.size === 2);
  t("a grade inventada não herda o barril de ninguém (sem estorvo, sem objeto)", garantirGrade({ cenario: "ruina", largura: 16, altura: 14, paredes: [], estorvos: [] }).objetos.size === 0);
  t("um degrau dois existe em alguma planta (o topo da torre)", com.some((id) => PLANTAS[id].alturas.some((a) => a[4] === 2)));
}

sec("3. a leitura, e o lixo");
{
  const g = grade({ "2,2": 1, "3,3": 2 });
  t("alturaEm lê o degrau, e o chão é zero", alturaEm(g, 2, 2) === 1 && alturaEm(g, 3, 3) === 2 && alturaEm(g, 5, 5) === 0);
  t("sem grade, zero", alturaEm(null, 2, 2) === 0 && bonusDaAltura(null, { x: 2, y: 2 }, { x: 5, y: 5 }) === 0);
  t("de cima +2", bonusDaAltura(g, { x: 2, y: 2 }, { x: 5, y: 5 }) === 2);
  t("de baixo −2", bonusDaAltura(g, { x: 5, y: 5 }, { x: 3, y: 3 }) === -2);
  t("no mesmo degrau, zero (dois e dois, um e um)", bonusDaAltura(grade({ "1,1": 2, "6,6": 2 }), { x: 1, y: 1 }, { x: 6, y: 6 }) === 0);
  t("os dois sem posição, zero", bonusDaAltura(g, { nome: "a" }, { x: 2, y: 2 }) === 0 && bonusDaAltura(g, null, null) === 0);
  const grande = { nome: "Ogro", tamanho: "grande", x: 1, y: 1 };
  t("o grande com um pé no degrau já está no degrau", bonusDaAltura(g, grande, { x: 7, y: 7 }) === 2);
  t("o save com degrau fora da tabela é ignorado", alturaEm(grade({ "1,1": 7, "2,1": -1, "3,1": "x" }), 1, 1) === 0 && garantirGrade(grade({ "1,1": 7 })).alturas.size === 0);
  t("o objeto sem tipo conhecido não entra", garantirGrade(grade({}, [{ x: 1, y: 1, tipo: "dragao" }])).objetos.size === 0);
}

sec("4. o olhar: o alto vê por cima");
{
  const rocha = grade({ "4,5": 2, "4,4": 2, "4,6": 2 });
  const a = { x: 1, y: 5 }, b = { x: 8, y: 5 };
  t("a rocha de dois degraus tapa a vista entre dois no chão", !linhaDeVisao(rocha, a, b));
  t("de cima da rocha vê-se dos dois lados", linhaDeVisao(rocha, { x: 4, y: 5 }, b) && linhaDeVisao(rocha, a, { x: 4, y: 5 }));
  const alto2 = grade({ "4,5": 2, "4,4": 2, "4,6": 2, "1,5": 2 });
  t("de outro degrau dois vê-se por cima da rocha", linhaDeVisao(alto2, a, b));
  const muro = grade({ "4,5": 1, "4,4": 1, "4,6": 1 });
  t("um degrau só não tapa nada (o muro do pátio)", linhaDeVisao(muro, a, b));
  const carro = grade({}, [{ x: 4, y: 5, tipo: "carro_de_feno" }]);
  t("o carro de feno tapa a vista no chão", !linhaDeVisao(carro, a, b));
  const carroAlto = grade({ "1,5": 1 }, [{ x: 4, y: 5, tipo: "carro_de_feno" }]);
  t("de um degrau acima vê-se por cima do carro", linhaDeVisao(carroAlto, a, b));
  t("quem está encostado ao carro não é tapado pelo carro", linhaDeVisao(carro, { x: 4, y: 5 }, b));
  const barril = grade({}, [{ x: 4, y: 5, tipo: "barril_de_oleo" }]);
  t("o barril é baixo: não tapa (o estorvo atrapalha o golpe, não o olhar)", linhaDeVisao(barril, a, b));
  t("o vulto dos objetos sai da tabela", OBJETOS_DO_CENARIO.carro_de_feno.vulto === 1 && OBJETOS_DO_CENARIO.barril_de_oleo.vulto === 0);
  const sem = { cenario: "estrada", largura: 10, altura: 10, paredes: [], estorvos: [] };
  t("sem altura nem objeto, a linha de visão de sempre", linhaDeVisao(sem, a, b) && !linhaDeVisao({ ...sem, paredes: ["4,5"] }, a, b));
  t("dentro() continua a dizer o campo", dentro(rocha, 9, 9) && !dentro(rocha, 10, 9));
}

sec("5. o golpe do inimigo soma a altura");
{
  const orc = { ...completarInimigo({ nome: "Orc", ameaca: "comum" }, 3), x: 2, y: 2 };
  const heroi = { nome: "Bran", vida: 30, vidaMax: 30, atributos: { destreza: 1 }, condicoes: [] };
  const alvo = (x, y) => ({ ref: "jogador", nome: "Bran", ent: heroi, onde: { nome: "Bran", x, y } });
  const plano = grade({});
  const alto = grade({ "2,2": 1 });
  const baixo = grade({ "3,2": 2 });
  const b0 = armarGolpeDoInimigo(orc, alvo(3, 2), { grade: plano, colado: false }).args.bonusAtaque;
  const b1 = armarGolpeDoInimigo(orc, alvo(3, 2), { grade: alto, colado: false }).args.bonusAtaque;
  const b2 = armarGolpeDoInimigo(orc, alvo(3, 2), { grade: baixo, colado: false }).args.bonusAtaque;
  t(`do alto, +2 no golpe (${b0} → ${b1})`, b1 === b0 + 2);
  t(`de baixo, −2 (${b0} → ${b2})`, b2 === b0 - 2);
  const semGrade = armarGolpeDoInimigo(orc, alvo(3, 2), { grade: null, colado: false }).args.bonusAtaque;
  t("sem grade, o golpe de antes", semGrade === b0);
}

sec("6. a previsão do herói diz a altura, e a rolagem cumpre-a (±3 pp)");
{
  const pers = { nome: "Bran", classe: "Guerreiro", nivel: 3, vida: 30, vidaMax: 30, atributos: { forca: 2, destreza: 1, vigor: 2 }, equipados: {}, condicoes: [], efeitos: [] };
  const lobo = { ...completarInimigo({ nome: "Lobo", ameaca: "comum" }, 3), derrotado: false, condicoes: [], x: 5, y: 5 };
  const g = grade({ "4,4": 1, "7,7": 2 });
  const deCima = previsaoDoHeroi(pers, lobo, { grade: g, meuLugar: { nome: "Bran", x: 4, y: 4 } });
  const plano = previsaoDoHeroi(pers, lobo, { grade: g, meuLugar: { nome: "Bran", x: 6, y: 5 } });
  const deBaixo = previsaoDoHeroi(pers, { ...lobo, x: 7, y: 7 }, { grade: g, meuLugar: { nome: "Bran", x: 6, y: 6 } });
  t("o campo `alto` diz +2, 0 e −2", deCima.alto === 2 && plano.alto === 0 && deBaixo.alto === -2);
  const bonus = modDoGolpe(pers, null) + 2 + Math.floor((pers.nivel - 1) / 4);
  const def = defesaDe(lobo, true);
  t("a chance de cima é a do d20 com +2 (chanceDeAcerto)", perto(deCima.chance, chanceDeAcerto({ bonus: bonus + 2, defesa: def }), 1e-4), `${deCima.chance}`);
  t("a de baixo, com −2", perto(deBaixo.chance, chanceDeAcerto({ bonus: bonus - 2, defesa: def }), 1e-4), `${deBaixo.chance}`);
  t("e o plano, sem nada", perto(plano.chance, chanceDeAcerto({ bonus, defesa: def }), 1e-4));
  /* a rolagem verdadeira: o golpe do App com a altura somada (a nota de
     fiação diz ao oficial para somar `bonusDaAltura` ao bónus do golpe) */
  const N = 20000;
  let acerto = 0;
  for (let i = 0; i < N; i++) {
    const rolar = rng(hashSemente(`altura|${i}`));
    const r = resolverAtaque({
      rolar, atacante: pers.nome, alvo: lobo, ehAtacanteInimigo: false,
      bonusAtaque: bonus + bonusDaAltura(g, { x: 4, y: 4 }, lobo),
      danoBase: danoDaClasse(pers.classe, pers.nivel, Math.round(danoDe(pers, false, rolar) / 2)),
      condAtacante: [], condAlvo: [], tipoDano: elementoDaArma(pers), perfilAlvo: perfilDe(lobo),
    });
    if (r.resultado === "acerta" || r.resultado === "critico" || r.resultado === "imune") acerto++;
  }
  t(`dito ${(deCima.chance * 100).toFixed(1)}%, rolado ${(acerto / N * 100).toFixed(1)}% (±3 pp)`, perto(deCima.chance, acerto / N, 0.03));
}

console.log(`\na altura: ${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
