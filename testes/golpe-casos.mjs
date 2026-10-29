/* golpe-casos.mjs (Fase T, trilha B, 28/10/2026) — os casos da prova do golpe no corpo e do carimbo da luta

   Os mesmos casos alimentam os dois lados: o recorte à letra do App de
   antes (`golpe-dourado.json`, compilado aqui com as dependências reais) e
   a peça pura de src/motor/. Cada caso nasce de `dadoDo` pelo índice — sem
   Math.random —, e a sorte do teste de concentração também: os dois lados
   rolam com a MESMA semente, o recorte dentro de `comSorte` (como o App,
   que rola com a da casa), a peça com `{ sorte }`.

   As fichas variam para que cada ramo seja percorrido muitas vezes: o
   abrigo (com resto, sem resto, com força em texto, negativa, zero), o
   poço temporário, o abafo, a origem (Goliath, Tiefling, Anão, Mutante, e
   o "anao" sem til), a invocação (Elo Vital, Fusão, a que já caiu), a
   concentração (uma, duas, com nome torto), e o lixo: `null`, `{}`, a
   ficha cujo `efeitos` estoura e a cujos `atributos` estouram.

   A FOTO distingue o que JSON apaga: `undefined`, `NaN` e a identidade
   (devolver o MESMO objeto que entrou é a regressão zero, e é prova). */
import fs from "node:fs";
import { dadoDo, comSorte } from "../src/semente.js";
import { absorverDano, efeitoEmConcentracao, quebrarConcentracao } from "../src/efeitos.js";
import { testeConcentracao } from "../src/combate.js";
import { atributoEfetivo } from "../src/regras-jogo.js";
import { amortecerDano } from "../src/tracos.js";
import { repartirDano } from "../src/invocacoes.js";
import { N_CASOS } from "./combate-casos.mjs";

export { N_CASOS };
export const SEMENTE_DA_PROVA = "taverna|golpe-no-corpo";
export const DOURADO = JSON.parse(fs.readFileSync(new URL("./golpe-dourado.json", import.meta.url), "utf8"));
export const sorteDoCaso = (i) => dadoDo(SEMENTE_DA_PROVA, "sorte", i);

/* ---------------- a foto ---------------- */
const IGUAL = "≡entrada";
export function foto(valor, entradas = []) {
  return JSON.stringify(valor, (k, x) => {
    if (k && entradas.includes(x) && x && typeof x === "object") return IGUAL;
    if (x === undefined) return "∅undefined";
    if (typeof x === "number" && !Number.isFinite(x)) return "∅" + String(x);
    return x;
  });
}

/* ---------------- os casos do carimbo ---------------- */
const LUTAS = [[null, null], [{ inimigos: [{ nome: "Lobo" }] }, null], [null, { fim: true }], [{ a: 1 }, { b: 1 }], [undefined, 0], [0, ""], [null, { }]];
export function casoDoCarimbo(i) {
  const r = dadoDo(SEMENTE_DA_PROVA, "carimbo", i);
  const esc = (l) => l[Math.floor(r() * l.length)];
  const [combate, fecho] = LUTAS[i % LUTAS.length];
  const jog = { autor: "jogador", texto: "golpeio" };
  const sis = { autor: "sistema", texto: "⚔ 6" };
  const mestre = { autor: "mestre", texto: "O lobo tomba.", naLuta: true };
  const desmarcada = { autor: "sistema", texto: "📋 depois", naLuta: false };
  const NOVAS = [
    () => [], () => [jog, sis], () => [jog, null, "texto solto", 7, undefined], () => [mestre], () => [desmarcada, mestre, jog],
    () => null, () => "não é lista", () => ({ length: 1, 0: { autor: "sistema", texto: "x" } }), () => [[1, 2]], () => [{ ...jog }, { ...sis, recibo: { itens: [] } }],
  ];
  return { combate, fecho, novas: esc(NOVAS)() };
}
export const casosDoCarimbo = () => Array.from({ length: N_CASOS }, (_, i) => casoDoCarimbo(i));
export const fotoDoCarimbo = (caso, saida) => foto({ saida, mesmaLista: saida === caso.novas, mesmas: Array.isArray(saida) && Array.isArray(caso.novas) ? saida.map((m, j) => m === caso.novas[j]) : null });

/* ---------------- os casos do golpe ---------------- */
const RACAS = ["Humano", "Goliath", "Tiefling", "Anão", "Mutante", "anao", "", "Elfo"];
const CLASSES = ["Guerreiro", "Mago", "Clérigo", "Ladino", "Bárbaro", undefined];
const MAGIAS = ["Bênção", "Voo", "  Invisibilidade  ", "", "Escudo da Fé", 7, "Marca do Caçador"];
const DANOS = [0, 1, 3, 4, 5, 6, 7, 9, 12, 15, 20, 26, 33, 41, -5, null, "8", 10.6, NaN, undefined, 2, 8, 11];
const TIPOS = ["fisico", "fogo", "veneno", undefined, "Fogo", "", "gelo", "fisico"];
const DONOS = ["", "Bruna Ferro", undefined, "Corvo", 0, "Ilda"];
const NOTAS = ["", null, undefined, "[RUMOR] o vau sobe.", "[A] um\n[B] dois"];
const HABS = [[], [], ["Elo Vital"], [{ nome: "Fusão Espiritual" }], ["Elo Vital", "Fusão Espiritual"], [{ nome: "Golpe", descricao: "divide o dano com a fera" }], ["Bênção"]];

function fichaDoCaso(r, i) {
  const esc = (l) => l[Math.floor(r() * l.length)];
  const p = (x) => r() < x;
  if (i % 23 === 22) return null;
  if (i % 23 === 21) return {};
  const efeitos = [];
  if (p(0.5)) efeitos.push({ nome: esc(["Escudo Arcano", "Armadura Arcana", "", undefined]), absorve: esc([3, 5, 9, "4", 0, -2, "muito", 14, 2]) });
  if (p(0.2)) efeitos.push({ nome: "Égide", absorve: esc([4, 8]) });
  if (p(0.35)) efeitos.push({ nome: esc(["Pele de Casca", "Névoa", ""]), amortece: esc([25, 50, 10]) });
  if (p(0.6)) efeitos.push({ nome: esc(MAGIAS), concentracao: true, turnos: 3 });
  if (p(0.2)) efeitos.push({ nome: esc(MAGIAS), concentracao: true });
  if (p(0.15)) efeitos.push(null);
  if (p(0.25)) efeitos.push({ nome: "Graça", turnos: 2 });
  if (p(0.4)) efeitos.reverse();
  const grupo = [];
  if (p(0.55)) grupo.push({ nome: esc(["Lobo Espiritual", "Torreta"]), invocada: true, vida: esc([0, 3, 8, 12]), vidaMax: 12 });
  if (p(0.2)) grupo.push({ nome: "Esqueleto", invocada: true, vida: esc([0, 5]), vidaMax: 5 });
  if (p(0.4)) grupo.push({ nome: "Bruna Ferro", vida: 10, vidaMax: 14 });
  const ficha = {
    nome: "Herói", raca: esc(RACAS), classe: esc(CLASSES), nivel: esc([1, 3, 5, 9, 13, 17]),
    vida: esc([0, 6, 20]), vidaMax: 20, atributos: { vigor: esc([-1, 0, 1, 2, 3, 4]) }, habilidades: esc(HABS), grupo,
  };
  const ef = r();
  if (ef < 0.06) { /* sem `efeitos`: save antigo */ } else if (ef < 0.09) ficha.efeitos = "lixo"; else ficha.efeitos = efeitos;
  if (p(0.3)) ficha.temporario = { pv: esc([2, 5, 11]), fonte: esc(["Bênção Sombria", "", undefined]) };
  if (p(0.25)) ficha.tracoGastos = { pedra: true };
  /* o lixo que estoura: `efeitos` (o abrigo, a concentração e a fila leem-no) e
     `atributos` (só o teste lê; não enumerável, para a cópia não o levar) */
  if (i % 29 === 28) Object.defineProperty(ficha, "efeitos", { get() { throw new Error("efeitos podres"); }, enumerable: true });
  if (i % 31 === 30) { ficha.efeitos = [{ nome: "Voo", concentracao: true }]; Object.defineProperty(ficha, "atributos", { get() { throw new Error("atributos podres"); }, enumerable: false }); }
  return ficha;
}
export function casoDoGolpe(i) {
  const r = dadoDo(SEMENTE_DA_PROVA, "golpe", i);
  const esc = (l) => l[Math.floor(r() * l.length)];
  const pers = fichaDoCaso(r, i);
  const grupo = pers && !(i % 29 === 28) && Array.isArray(pers.grupo) ? pers.grupo : [];
  return { i, pers, grupo, dano: esc(DANOS), tipo: esc(TIPOS), nome: esc(DONOS), nota: esc(NOTAS), mostrarRolagens: r() < 0.5 };
}
export const casosDoGolpe = () => Array.from({ length: N_CASOS }, (_, i) => casoDoGolpe(i));

/* ---------------- o recorte de antes, compilado ----------------
   Cada recorte é o texto à letra do App; aqui ganha as dependências reais
   e um `calou` que regista o nome. `recortes` deixa a mordida trocar um
   pedaço do texto antes de compilar. */
export function compilarORecorte(recortes = DOURADO.recortes) {
  const R = recortes;
  const comCalou = () => { const calados = []; return { calados, calou: (onde) => { calados.push(onde); } }; };
  const abrigoCom = (calou) => new Function("absorverDano", "calou", `${R.abrigo}\nreturn passarPeloAbrigo;`)(absorverDano, calou);
  return {
    /* o estouro também é foto: no App o try/calou o engolia e a mensagem entrava sem marca */
    carimbo: (caso) => {
      try { return new Function("novas", "combateRef", "fechoDaLutaRef", `${R.carimbo}\nreturn novas;`)(caso.novas, { current: caso.combate }, { current: caso.fecho }); }
      catch (e) { return { "∅estourou": String(e && e.message) }; }
    },
    abrigo: (caso) => {
      const c = comCalou();
      const r = abrigoCom(c.calou)(caso.pers, caso.dano, caso.nome);
      return { r, calados: c.calados };
    },
    concentracao: (caso) => {
      const c = comCalou();
      const f = new Function("efeitoEmConcentracao", "testeConcentracao", "atributoEfetivo", "quebrarConcentracao", "calou", `${R.concentracao}\nreturn segurarOuPerder;`)(efeitoEmConcentracao, testeConcentracao, atributoEfetivo, quebrarConcentracao, c.calou);
      const r = comSorte(sorteDoCaso(caso.i), () => f(caso.pers, caso.dano, caso.nome));
      return { r, calados: c.calados };
    },
    quebra: (caso) => {
      const c = comCalou();
      const empurradas = [];
      const notaRef = { current: caso.nota };
      const f = new Function("efeitoEmConcentracao", "testeConcentracao", "atributoEfetivo", "calou", "persBase", "danoNoJogador", "mostrarRolagensRef", "notaRef", "pushMsgs",
        `let persConcQuebrada = null;\nif (danoNoJogador > 0) {\n${R.quebra}\n}\nreturn persConcQuebrada;`);
      const quebrada = comSorte(sorteDoCaso(caso.i), () => f(efeitoEmConcentracao, testeConcentracao, atributoEfetivo, c.calou, caso.pers, caso.dano, { current: caso.mostrarRolagens }, notaRef, (m) => { empurradas.push(...m); }));
      return { r: { mensagens: empurradas, quebrada, nota: notaRef.current }, calados: c.calados };
    },
    fila: (caso) => {
      const c = comCalou();
      const f = new Function("amortecerDano", "repartirDano", "passarPeloAbrigo", "persTracos0", "grupo0", "a", "linhasSis",
        `let persTracos = persTracos0; let grupoAtual = grupo0;\n${R.fila}\nreturn { pers: persTracos, grupo: grupoAtual, dano: a.r.dano, mensagens: linhasSis };`);
      try {
        const r = f(amortecerDano, repartirDano, abrigoCom(c.calou), caso.pers, caso.grupo, { r: { dano: caso.dano, tipoDano: caso.tipo } }, []);
        return { r, calados: c.calados };
      } catch (e) { return { erro: String(e && e.message), calados: c.calados }; }
    },
  };
}

/* a mesma régua para a peça: o que ela devolveu, com quem calou */
export function fotoDoGolpe(caso, saida) {
  return foto(saida, [caso.pers, caso.grupo].filter((x) => x && typeof x === "object"));
}
