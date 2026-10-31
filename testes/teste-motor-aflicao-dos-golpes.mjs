/* ============================================================
   A AFLIÇÃO DOS GOLPES, NO MOTOR (31/10/2026, a 13.ª sessão) — testes/teste-motor-aflicao-dos-golpes.mjs

   Na 13.ª, o «Talho profundo» de um Rato Gigante de 4 PV sangrava 3 por
   turno, por três turnos — o mesmo que o de um elite. A régua já tinha a
   força de quem aflige (`INTENSIDADE_DA_AFLICAO`, aflicoes.js, e47bf8b), e
   `rolarAflicao` já a aceitava (`ameaca`); faltava quem joga recebê-la: o
   App (`aplicarCondicoesDosGolpes`) chamava sem a ameaça, e o jogo rolava o
   catálogo. A aflição que os golpes deixam no herói ganhou peça em
   src/motor/golpe-no-corpo.js#aAflicaoDosGolpes, e o App passa-lhe a lista
   da luta.

   Aqui a peça é provada:
   1. contra o recorte à letra do App de antes (`aflicao-dourado.json`, de
      `gerar-aflicao-dourado.mjs`, de9540f), compilado com as dependências
      reais e corrido lado a lado sobre casos por semente — a mesma sorte
      dos dois lados. Sem lista de inimigos, ou com todos «comum», as fotos
      são IGUAIS: a mudança só pesa onde a força difere;
   2. a mordida: trocar um pedaço do recorte TEM de mudar fotos;
   3. a regra, por chamada: o rato sangra menos, o lendário mais, e a ameaça
      que a tabela não tem é o catálogo.
   ============================================================ */
import fs from "node:fs";
import { aAflicaoDosGolpes } from "../src/motor/golpe-no-corpo.js";
import { dadoDo } from "../src/semente.js";
import { rolarAflicao, aflicaoDe, INTENSIDADE_DA_AFLICAO } from "../src/aflicoes.js";
import { salvaDoGolpe, bonusDeSalvaguarda, nomeDaSalva, ehSalvaMental } from "../src/salvaguardas.js";
import { temVantagemMental } from "../src/dadivas.js";
import { vantagemMentalDeTraco } from "../src/tracos.js";
import { atributoEfetivo } from "../src/regras-jogo.js";
import { CONDICOES } from "../src/condicoes.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

const DOURADO = JSON.parse(fs.readFileSync(new URL("./aflicao-dourado.json", import.meta.url), "utf8"));
const SEMENTE = "taverna|aflicao-dos-golpes";
const N = 400;

/* ---------------- os casos ---------------- */
const RACAS = ["Humano", "Gnomo", "Sintético", "Anão", "Elfo"];
const CLASSES = ["Guerreiro", "Mago", "Ladino", "Clérigo", "Bardo", undefined];
const GOLPES = ["Talho profundo", "Mordida peçonhenta", "Garra flamejante", "Cabeçada estonteante", "Garras", "Mordida", "Grito de guerra", "Bafo ígneo", "Ferroada tóxica", "", undefined];
const NOMES = ["Rato Gigante 1", "Rato Gigante 2", "Bandido", "Lobo Alfa", "Ogro", "Dragão"];
const AMEACAS = ["fraco", "comum", "competente", "elite", "lendario", undefined, "toString", 3];
const DANOS = [0, 0, 1, 3, 5, 8, -2, null];
const NOTAS = ["", "", "[ANTES] uma nota que já estava."];

function caso(i) {
  const r = dadoDo(SEMENTE, "caso", i);
  const esc = (l) => l[Math.floor(r() * l.length)];
  const attr = () => esc([-1, 0, 1, 2, 3, 4]);
  const pers = {
    nome: "Herói", raca: esc(RACAS), classe: esc(CLASSES), nivel: esc([1, 3, 5, 9, 13]),
    atributos: { vigor: attr(), destreza: attr(), intelecto: attr(), sabedoria: attr(), carisma: attr(), presenca: attr() },
    vida: 20, vidaMax: 20,
  };
  const c = r();
  if (c < 0.2) pers.condicoes = [{ id: "sangrando", nome: "Sangrando", turnos: 2 }];
  else if (c < 0.6) pers.condicoes = [];
  const acoes = Array.from({ length: Math.floor(r() * 5) }, () => {
    const d = esc(DANOS);
    return {
      inimigo: esc(NOMES), alvoRef: esc(["jogador", "jogador", "jogador", "aliado"]), alvoNome: "x",
      r: r() < 0.1 ? null : { dano: d, critico: r() < 0.35 },
      golpeNome: esc(GOLPES),
    };
  });
  const inimigos = NOMES.map((nome) => ({ nome, ameaca: esc(AMEACAS), vida: 5 }));
  return { i, pers, acoes, inimigos, nota: esc(NOTAS) };
}
const CASOS = Array.from({ length: N }, (_, i) => caso(i));
/* a sorte da vez: a mesma sequência para os dois lados, um passo por golpe que tenta */
const sorteDoCaso = (i) => { let k = 0; return () => dadoDo(SEMENTE, "sorte", i, k++); };

/* ---------------- a foto ---------------- */
const foto = (k, saida) => JSON.stringify({ ...saida, mesmoPers: saida.pers === k.pers }, (key, x) => (x === undefined ? "∅undefined" : x));

/* a peça, com a fiação do App: a tela e a nota como o App as monta */
function daPeca(k, inimigos) {
  const r = aAflicaoDosGolpes(k.acoes, k.pers, { sorte: sorteDoCaso(k.i), ...(inimigos !== undefined ? { inimigos } : {}) });
  let nota = k.nota;
  for (const d of r.ditas) nota = `${nota ? nota + "\n" : ""}${d.nota}`;
  return { pers: r.pers, textos: r.ditas.map((d) => d.texto), nota };
}
/* o recorte de antes, compilado com as dependências reais */
function doRecorte(recorte = DOURADO.recorte) {
  const f = new Function("salvaDoGolpe", "bonusDeSalvaguarda", "atributoEfetivo", "rolarAflicao", "sorteDoTurno", "nomeDaSalva", "ehSalvaMental", "temVantagemMental", "vantagemMentalDeTraco", "pushMsgs", "notaRef",
    `${recorte}\nreturn aplicarCondicoesDosGolpes;`);
  return (k) => {
    const textos = [];
    const notaRef = { current: k.nota };
    const sorte = sorteDoCaso(k.i);
    const aplicar = f(salvaDoGolpe, bonusDeSalvaguarda, atributoEfetivo, rolarAflicao, (ev) => (ev === "aflicao" ? sorte() : null), nomeDaSalva, ehSalvaMental, temVantagemMental, vantagemMentalDeTraco,
      (m) => { for (const x of m) textos.push(x.texto); }, notaRef);
    const pers = aplicar(k.acoes, k.pers);
    return { pers, textos, nota: notaRef.current };
  };
}
const ANTES = CASOS.map((k) => foto(k, doRecorte()(k)));
const iguais = (fotos) => fotos.filter((x, i) => x === ANTES[i]).length;

sec("1 · o recorte de antes, congelado");
t("o dourado é do commit de antes (de9540f), e o recorte é a função inteira, sem a ameaça",
  DOURADO.commit === "de9540f" && /^const aplicarCondicoesDosGolpes = \(acoes, persBase\) => \{[\s\S]*rolarAflicao\(\{[\s\S]*return p;\n  \};$/.test(DOURADO.recorte) && !/ameaca/.test(DOURADO.recorte));
const comDitas = CASOS.filter((k, i) => JSON.parse(ANTES[i]).textos.length > 0).length;
const pegou = CASOS.filter((k, i) => !JSON.parse(ANTES[i]).mesmoPers).length;
t(`os casos percorrem os ramos: ${comDitas}/${N} com aflição rolada, ${pegou}/${N} com aflição que pegou`, comDitas >= N / 5 && pegou >= N / 10, `${comDitas}, ${pegou}`);

sec("2 · a peça é o recorte, à letra, onde a força não muda nada");
t(`sem lista de inimigos: ${iguais(CASOS.map((k) => foto(k, daPeca(k))))}/${N} fotos iguais`, iguais(CASOS.map((k) => foto(k, daPeca(k)))) === N);
for (const lixo of [null, "Rato", {}, 7, [null, 3, "x"]]) {
  t(`com «inimigos» = ${JSON.stringify(lixo)}: o catálogo de sempre (${N}/${N})`, iguais(CASOS.map((k) => foto(k, daPeca(k, lixo)))) === N);
}
const todosComum = (k) => k.inimigos.map((e) => ({ ...e, ameaca: "comum" }));
t("com todos «comum» (a força 1): as mesmas fotos", iguais(CASOS.map((k) => foto(k, daPeca(k, todosComum(k))))) === N);
const foraDaTabela = (k) => k.inimigos.map((e, j) => ({ ...e, ameaca: ["toString", "", "hasOwnProperty", 2][j % 4] }));
t("com ameaça que a tabela não tem («toString», vazia, número): as mesmas fotos", iguais(CASOS.map((k) => foto(k, daPeca(k, foraDaTabela(k))))) === N);

sec("3 · com a força de quem bateu, só muda onde ela pesa");
const COM = CASOS.map((k) => foto(k, daPeca(k, k.inimigos)));
const mudaram = COM.map((x, i) => (x !== ANTES[i] ? i : -1)).filter((i) => i >= 0);
t(`com a lista da luta, ${mudaram.length} casos mudam (e algum muda)`, mudaram.length > 0);
/* a força pesa em dois sítios (o dano por turno e a dificuldade de resistir),
   logo um caso pode mudar no número, no texto ou em pegar ou não pegar — mas
   só onde houve um golpe de aflição a um alvo, dado por quem a tabela pesa
   diferente do «comum» */
const FORTES = new Set(Object.keys(INTENSIDADE_DA_AFLICAO).filter((n) => n !== "comum"));
const pesa = (k) => k.acoes.some((a) => a.r && a.r.dano > 0 && a.alvoRef === "jogador"
  && (aflicaoDe(a.golpeNome || a.inimigo) || {}).alvo === "alvo"
  && FORTES.has((k.inimigos.find((e) => e.nome === a.inimigo) || {}).ameaca));
t("e todo caso que muda teve um golpe de aflição dado por quem não é «comum»", mudaram.every((i) => pesa(CASOS[i])), mudaram.filter((i) => !pesa(CASOS[i])).slice(0, 5).join(", "));
const nosNumeros = mudaram.filter((i) => (JSON.parse(COM[i]).pers.condicoes || []).some((c) => Number.isFinite(c.danoTurno))).length;
t(`e em ${nosNumeros} deles a instância leva o número da força (danoTurno próprio)`, nosNumeros > 0);

sec("4 · a mordida: a comparação vê a diferença");
const mordido = (de, para) => {
  if (DOURADO.recorte.split(de).length !== 2) throw new Error("a troca da mordida não bate uma vez só: " + de);
  const f = doRecorte(DOURADO.recorte.replace(de, para));
  return CASOS.filter((k, i) => foto(k, f(k)) !== ANTES[i]).length;
};
t("a salvaguarda esquecida (sem bonusResistir) muda fotos", mordido("bonusResistir: b.total,", "") > 0);
t("a ★ da proficiência esquecida muda fotos", mordido(`b.proficiente ? " ★" : ""`, `""`) > 0);
t("o golpe que cai no aliado tentando o herói muda fotos", mordido(`x.alvoRef === "jogador"`, `x.alvoRef !== "ninguem"`) > 0);
t("a ameaça posta à mão no recorte (o «fraco» fixo) muda fotos", mordido(`critico: a.r.critico,`, `critico: a.r.critico, ameaca: "fraco",`) > 0);

sec("5 · a regra, por chamada: o rato sangra menos que o lendário");
/* um herói sem defesa, um golpe crítico (sempre tenta) e a semente que acha o
   primeiro caso em que o talho pega pelos dois lados */
const nu = { nome: "Iara", classe: "Mago", nivel: 1, atributos: { vigor: -5, destreza: -5 }, condicoes: [] };
const golpe = (inimigo) => [{ inimigo, alvoRef: "jogador", r: { dano: 4, critico: true }, golpeNome: "Talho profundo" }];
const LUTA = [{ nome: "Rato Gigante 1", ameaca: "fraco" }, { nome: "Ogro Velho", ameaca: "lendario" }, { nome: "Bandido", ameaca: "comum" }];
const sangue = (inimigo, inimigos, k) => {
  const r = aAflicaoDosGolpes(golpe(inimigo), nu, { sorte: () => dadoDo(SEMENTE, "regra", k), inimigos });
  return r.pers.condicoes.find((c) => c.id === "sangrando") || null;
};
let k = 0;
while (k < 200 && !(sangue("Rato Gigante 1", LUTA, k) && sangue("Ogro Velho", LUTA, k) && sangue("Bandido", LUTA, k) && sangue("Rato Gigante 1", null, k))) k++;
const cat = CONDICOES.sangrando.danoTurno;
const doRato = sangue("Rato Gigante 1", LUTA, k), doOgro = sangue("Ogro Velho", LUTA, k), doBandido = sangue("Bandido", LUTA, k), semLista = sangue("Rato Gigante 1", null, k);
t("achou-se a semente em que o talho pega nos quatro", k < 200, String(k));
const esperado = (forca) => Math.max(1, Math.round(cat * INTENSIDADE_DA_AFLICAO[forca].dano));
t(`o rato (fraco) sangra ${esperado("fraco")} por turno, não os ${cat} do catálogo — e o texto diz o número`,
  doRato && doRato.danoTurno === esperado("fraco") && doRato.danoTurno < cat && new RegExp(`\\b${esperado("fraco")} de dano`).test(doRato.efeito));
t(`o lendário sangra ${esperado("lendario")}`, doOgro && doOgro.danoTurno === esperado("lendario") && doOgro.danoTurno > cat);
t("o «comum» é o catálogo, sem número próprio (a instância de antes)", doBandido && doBandido.danoTurno === undefined);
t("sem a lista da luta, o rato volta ao catálogo (a chamada de antes)", semLista && semLista.danoTurno === undefined);
t("quem não está na lista é o catálogo", sangue("Lobo Fantasma", LUTA, k) === null || sangue("Lobo Fantasma", LUTA, k).danoTurno === undefined);

sec("6 · a forma da peça");
const nada = aAflicaoDosGolpes([], nu, { sorte: () => null, inimigos: LUTA });
t("nada pegou: o MESMO pers, e nenhuma dita", nada.pers === nu && nada.ditas.length === 0);
t("acoes nulas e opções nulas não estouram", aAflicaoDosGolpes(null, nu, null).pers === nu);
const umaDita = aAflicaoDosGolpes(golpe("Rato Gigante 1"), nu, { sorte: () => dadoDo(SEMENTE, "regra", k), inimigos: LUTA });
t("a dita leva o texto da tela e a nota do Narrador", umaDita.ditas.length === 1 && typeof umaDita.ditas[0].texto === "string" && umaDita.ditas[0].texto.length > 0 && typeof umaDita.ditas[0].nota === "string");
t("o que entra não é tocado", nu.condicoes.length === 0);

console.log(`\n${ok} ok, ${mal} falhas`);
if (mal) process.exit(1);
