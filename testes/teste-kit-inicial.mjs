/* O KIT INICIAL (S10b, 13/10 — a 10.ª sessão de prova)

   A heroína da 10.ª sessão era Guerreira e entrou na luta SEM ARMA: a tela
   de criação de Uma Vida monta a ficha com `equipados: {}`, para as doze
   classes, e sem arma `danoDaArma` devolve 1d2, «desarmado». Esta suíte
   prova `src/kit-inicial.js`:

     1. a tabela, lida de volta: cada classe do jogo tem a sua arma, e cada
        arma existe no catálogo (`ARMAS`) e na banca (`BASES.arma`);
     2. para CADA classe: a ficha nova sai com a arma da classe empunhada,
        sem penalidade de treino (`avaliarEquipar`), e o golpe deixa de ser
        o desarmado; a do Guerreiro é marcial;
     3. só a ficha nova: nunca troca a arma que já está na mão, nunca tira
        o resto do que está equipado, e o LOAD (`migrarPersonagem`) não põe
        arma em save nenhum — a ficha de quem vendeu a espada fica sem ela;
     4. imutabilidade, determinismo e lixo;
     5. (31/10, a 13.ª) a armadura da classe: cada peça na banca e no
        catálogo, vestida sem penalidade, a defesa que sobe, a mão vazia, o
        herói novo aberto (`aFichaAberta`) que a leva, e a régua.

   FALHA ANTES (HEAD v9.458): `src/kit-inicial.js` não existe, e o import
   cai na primeira linha — não havia kit nenhum.
   FALHA ANTES da §5 (HEAD de 31/10): `armaduraInicial` não existe, a
   Guerreira nasce com defesa 11 e o kit não tem armadura nenhuma. */

import * as KI from "../src/kit-inicial.js";
import { defesaDe } from "../src/combate.js";
import { aFichaAberta } from "../src/abrir-o-save.js";
import { simularCombate } from "./regua-combate.mjs";
const { KIT_INICIAL, armaInicial, equiparKitInicial } = KI;
const armaduraInicial = KI.armaduraInicial || (() => null);
import { CLASSES } from "../src/classes.js";
import { ARMAS, CAT_ARMA, avaliarEquipar, danoDaArma, fichaDoItem } from "../src/itens.js";
import { BASES } from "../src/loot.js";
import { migrarPersonagem } from "../src/regras-jogo.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);

/* a ficha como a tela de criação a monta hoje (o que importa: a classe e
   `equipados: {}`) */
const fichaNova = (classe) => ({
  nome: "Teste", classe, raca: "Humano", nivel: 1, xp: 0,
  atributos: { forca: 0, destreza: 0, vigor: 0, intelecto: 0, presenca: 0, percepcao: 0 },
  inventario: [], habilidades: [], grupo: [], efeitos: [], condicoes: [],
  equipamento: [], equipados: {},
});

sec("1. a tabela, lida de volta");
{
  const classes = CLASSES.map((c) => c.nome);
  const semKit = classes.filter((c) => !KIT_INICIAL[c] || !KIT_INICIAL[c].arma);
  t(`as ${classes.length} classes têm arma no kit`, semKit.length === 0, semKit.join(", "));
  const sobra = Object.keys(KIT_INICIAL).filter((c) => !classes.includes(c));
  t("e o kit não tem classe que o jogo não tem", sobra.length === 0, sobra.join(", "));
  const foraDoCatalogo = Object.values(KIT_INICIAL).map((k) => k.arma).filter((a) => !ARMAS.some((x) => x.nome === a));
  t("toda arma do kit está no catálogo (ARMAS)", foraDoCatalogo.length === 0, foraDoCatalogo.join(", "));
  const foraDaBanca = Object.values(KIT_INICIAL).map((k) => k.arma).filter((a) => !BASES.arma.some((x) => x.nome === a));
  t("e na banca (BASES.arma): o dano é o da forja", foraDaBanca.length === 0, foraDaBanca.join(", "));
}

sec("2. cada classe começa com a arma da classe na mão");
{
  for (const c of CLASSES) {
    const k = KIT_INICIAL[c.nome];
    const p = equiparKitInicial(fichaNova(c.nome));
    const arma = p && p.equipados && p.equipados.arma;
    const veredito = arma ? avaliarEquipar(p, arma) : null;
    const dado = danoDaArma(arma);
    const base = BASES.arma.find((x) => x.nome === k.arma);
    t(`${c.nome}: ${k.arma} empunhada, sem penalidade, ${dado.texto} (não o desarmado)`,
      !!arma && arma.nome === k.arma && arma.tipo === "arma" && arma.raridade === "comum"
        && !!veredito && veredito.pode && veredito.penalidades.length === 0
        && dado.rotulo !== "desarmado" && arma.atributos.dano === base.dano,
      veredito ? veredito.penalidades.map((x) => x.texto).join("; ") : "sem arma");
  }
  const g = equiparKitInicial(fichaNova("Guerreiro")).equipados.arma;
  t("o Guerreiro, «mestre das armas», nasce com arma MARCIAL", CAT_ARMA[fichaDoItem(g).cat].classe === "marcial");
  t("antes do kit, a mesma ficha dava socos (1d2)", danoDaArma(fichaNova("Guerreiro").equipados.arma).rotulo === "desarmado");
}

sec("3. só a ficha nova, e só a mão vazia");
{
  const espada = { nome: "Espada do Avô", base: "Montante", tipo: "arma", raridade: "raro", atributos: { dano: 5 } };
  const armada = { ...fichaNova("Guerreiro"), equipados: { arma: espada } };
  /* Asserção movida (31/10, a 13.ª): era «a ficha volta a MESMA». Desde que
     o kit tem armadura, cada peça entra só no lugar VAZIO — a herança de uma
     espada não deixa a Guerreira sem a cota. A intenção que fica: a arma que
     já está na mão nunca troca; e a ficha com tudo na mão volta a MESMA. */
  const ka = equiparKitInicial(armada);
  t("arma já na mão (o pronto, a herança): a arma fica a mesma, e só a armadura vazia se enche", ka.equipados.arma === espada && ka.equipados.armadura && ka.equipados.armadura.nome === KIT_INICIAL.Guerreiro.armadura);
  const vestidaEArmada = { ...fichaNova("Guerreiro"), equipados: { arma: espada, armadura: { nome: "Couraça Antiga", tipo: "armadura" } } };
  t("com a arma e a armadura na mão: a ficha volta a MESMA", equiparKitInicial(vestidaEArmada) === vestidaEArmada);
  const vestida = { ...fichaNova("Clérigo"), equipados: { armadura: { nome: "Cota de Malha", tipo: "armadura" } } };
  const v = equiparKitInicial(vestida);
  t("o resto do que está equipado fica", v.equipados.armadura === vestida.equipados.armadura && v.equipados.arma.nome === KIT_INICIAL["Clérigo"].arma);
  const doSave = migrarPersonagem(fichaNova("Guerreiro"));
  t("o LOAD não põe arma em save nenhum (só a criação chama o kit)", !(doSave.equipados && doSave.equipados.arma));
  const semKit = { ...fichaNova("Pirata") };
  t("classe sem kit: a mesma ficha, sem arma inventada", equiparKitInicial(semKit) === semKit && armaInicial("Pirata") === null);
}

sec("4. imutabilidade, determinismo e lixo");
{
  const congelada = Object.freeze({ ...fichaNova("Bardo"), equipados: Object.freeze({}) });
  let p = null;
  try { p = equiparKitInicial(congelada); } catch { p = null; }
  t("não muta a ficha recebida (congelada não estoura)", !!p && p !== congelada && Object.keys(congelada.equipados).length === 0);
  t("determinístico: a mesma classe dá a mesma arma", JSON.stringify(equiparKitInicial(fichaNova("Mago"))) === JSON.stringify(equiparKitInicial(fichaNova("Mago"))));
  const a1 = armaInicial("Caçador"), a2 = armaInicial("Caçador");
  a1.atributos.dano = 99;
  t("cada chamada dá uma peça nova (mexer numa não mexe na outra)", a2.atributos.dano !== 99);
  t("lixo volta como veio", [null, undefined, 3, "x", []].every((x) => equiparKitInicial(x) === x));
  const semEquipados = equiparKitInicial({ classe: "Monge", equipados: null });
  t("`equipados: null` (o `= {}` não cobre null): ganha a arma sem estourar", !!semEquipados.equipados && semEquipados.equipados.arma.nome === KIT_INICIAL.Monge.arma);
  t("armaInicial com lixo dá null", [null, undefined, 3, {}, "", "guerreiro"].every((x) => armaInicial(x) === null));
}

sec("5. a armadura da classe (31/10, a 13.ª: a Guerreira nascia com defesa 11)");
{
  const PROF = { leve: ["Gibão de Couro", "Couro Batido"], media: ["Brigantina", "Cota de Malha"] };
  const comArmadura = Object.entries(KIT_INICIAL).filter(([, k]) => k.armadura);
  t(`oito classes vestem armadura no kit (${comArmadura.map(([c]) => c).join(", ")})`, comArmadura.length === 8);
  t("…e as quatro que não a sabem usar, ou lutam sem ela, não: Monge, Mago, Feiticeiro, Invocador", ["Monge", "Mago", "Feiticeiro", "Invocador"].every((c) => !KIT_INICIAL[c].armadura && armaduraInicial(c) === null));
  const foraDaBanca = comArmadura.map(([, k]) => k.armadura).filter((a) => !BASES.armadura.some((x) => x.nome === a));
  t("toda armadura do kit está na banca (BASES.armadura): a defesa é a da forja", foraDaBanca.length === 0, foraDaBanca.join(", "));
  t("só peças leves e médias, de banca (nenhuma placa de partida)", comArmadura.every(([, k]) => [...PROF.leve, ...PROF.media].includes(k.armadura)));
  for (const [c, k] of comArmadura) {
    const p = equiparKitInicial(fichaNova(c));
    const a = p.equipados.armadura;
    const v = a ? avaliarEquipar(p, a) : null;
    const base = BASES.armadura.find((x) => x.nome === k.armadura);
    t(`${c}: ${k.armadura} vestida, sem penalidade, defesa +${base && base.defesa}`, !!a && a.nome === k.armadura && a.tipo === "armadura" && a.raridade === "comum" && a.atributos.defesa === base.defesa && !!v && v.pode && v.penalidades.length === 0, v ? v.penalidades.map((x) => x.texto).join("; ") : "sem armadura");
  }
  t("o Druida veste couro (não toca metal)", !/malha|placa|escama|aço/i.test(KIT_INICIAL.Druida.armadura));
  /* a Guerreira da 13.ª: destreza 1 */
  const iara = { ...fichaNova("Guerreiro"), atributos: { forca: 2, destreza: 1, vigor: 3, intelecto: 1, presenca: 2, percepcao: 3 } };
  t("a Guerreira da 13.ª: defesa 11 nua, 13 com a cota do kit", defesaDe(iara) === 11 && defesaDe(equiparKitInicial(iara)) === 13, `${defesaDe(iara)} → ${defesaDe(equiparKitInicial(iara))}`);
  const vestida = { ...fichaNova("Caçador"), equipados: { armadura: { nome: "Couraça Antiga", tipo: "armadura", atributos: { defesa: 2 } } } };
  t("a armadura já vestida fica (a do kit não a troca)", equiparKitInicial(vestida).equipados.armadura === vestida.equipados.armadura);
  t("o LOAD não veste ninguém (só a criação chama o kit)", !(migrarPersonagem(fichaNova("Guerreiro")).equipados || {}).armadura);
  const aberta = aFichaAberta(equiparKitInicial(iara));
  t("o herói novo aberto (aFichaAberta, o iniciar do App) leva a cota", !!aberta.equipados.armadura && aberta.equipados.armadura.nome === "Cota de Malha" && defesaDe(aberta) === 13);
  const a1 = armaduraInicial("Guerreiro"), a2 = armaduraInicial("Guerreiro");
  a1.atributos.defesa = 99;
  t("cada chamada dá uma peça nova", a2.atributos.defesa !== 99 && [null, undefined, 3, {}, "", "guerreiro", "toString"].every((x) => armaduraInicial(x) === null));
  /* a régua: a Guerreira da 13.ª, nua e com a cota, com as aflições do inimigo */
  const IARA = { nome: "Iara", classe: "Guerreiro", nivel: 1, vidaMax: 20, vigor: 3, atributos: iara.atributos, arma: "Espada Longa", escudo: null };
  const DUN = { nome: "Dunstan", classe: "Caçador", nivel: 1, vidaMax: 12, vigor: 2, atributos: { forca: 1, destreza: 3, vigor: 2, intelecto: 0, presenca: 0, percepcao: 2 } };
  const cai = (armadura, inimigos, grupo) => { let n = 0; for (let i = 0; i < 1000; i++) { const r = simularCombate({ id: "kit13", heroi: { ...IARA, armadura }, grupo, inimigos, tetoDeRodadas: 20 }, `ratos13|${i}`, { comAflicoes: true }); if (r.rodadaDaQuedaDoHeroi != null) n++; } return n / 1000; };
  const RATOS = { quantos: 3, ameaca: "fraco", nivel: 1, base: "Rato Gigante" }, B3 = { quantos: 3, ameaca: "comum", nivel: 2, base: "Bandido" };
  const r = [cai(null, RATOS, [DUN]), cai("Cota de Malha", RATOS, [DUN]), cai(null, RATOS, []), cai("Cota de Malha", RATOS, []), cai(null, B3, [DUN]), cai("Cota de Malha", B3, [DUN])];
  const pc = (x) => (x * 100).toFixed(1) + "%";
  console.log(`     3 ratos com o Dunstan ${pc(r[0])} → ${pc(r[1])} · sozinha ${pc(r[2])} → ${pc(r[3])} · 3 bandidos com ele ${pc(r[4])} → ${pc(r[5])}`);
  t(`na régua: três ratos com o companheiro derrubam-na em menos de 3,5% (${pc(r[1])}; nua, ${pc(r[0])})`, r[1] < 0.035 && r[1] < r[0]);
  t(`sozinha, em menos de 15% (${pc(r[3])}; nua, ${pc(r[2])})`, r[3] < 0.15 && r[3] < r[2]);
  t(`e o mortal continua mortal: três Bandidos derrubam-na em mais de 60% (${pc(r[5])})`, r[5] > 0.6);
}

console.log(`\n${ok} ok, ${mal} falhas`);
if (mal) process.exit(1);
