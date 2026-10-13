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
     4. imutabilidade, determinismo e lixo.

   FALHA ANTES (HEAD v9.458): `src/kit-inicial.js` não existe, e o import
   cai na primeira linha — não havia kit nenhum. */

import { KIT_INICIAL, armaInicial, equiparKitInicial } from "../src/kit-inicial.js";
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
  t("arma já na mão (o pronto, a herança): a ficha volta a MESMA", equiparKitInicial(armada) === armada);
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

console.log(`\n${ok} ok, ${mal} falhas`);
if (mal) process.exit(1);
