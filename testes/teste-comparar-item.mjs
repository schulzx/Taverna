/* teste-comparar-item.mjs (AAA · 05/11/2026) — a comparação antes do clique.

   formas.md §AAA §3 e o pedido ao sistema (b): a gaveta do encaixe mostra
   cada número que muda e o botão diz o preço. Aqui prova-se, em Node, que
   src/comparar-item.js põe lado a lado as contas que já existem — a CA de
   defesaDe, o atributo efetivo de bonusEquip, o dano de danoDaArma — sem
   inventar regra, e que cada item só cabe no encaixe que o seu `tipo` diz. */
import {
  ENCAIXES_DO_CORPO, RARIDADES, raridadeDoItem, iconeDoItem, encaixeDoItem, cabeNoEncaixe,
  itensParaEncaixe, compararItem, rotuloDoEquipar, fraseDaTroca,
} from "../src/comparar-item.js";
import { TROCA_DE_SLOT } from "../src/itens.js";
import { defesaDe } from "../src/combate.js";
import { COR_DA_RARIDADE, ICONES_DE_ITEM, GLIFO_DO_ENCAIXE, ENCAIXE } from "../src/estilo.js";

let ok = 0, mal = 0;
const t = (nome, cond, diz = "") => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (diz ? "\n      " + diz : "")); } };
const sec = (s) => console.log("\n" + s);

/* incomum: não pede sintonia, e o bónus conta logo (o raro dorme até ser
   sintonizado — sintonia.js —, e isso é a secção 7) */
const elmoNovo = { nome: "Capuz do Batedor", tipo: "elmo", raridade: "incomum", atributos: { defesa: 1, percepcao: -1 } };
const elmoVelho = { nome: "Elmo de Ferro", tipo: "elmo", raridade: "comum", atributos: {} };
const heroi = {
  nome: "Ilvara", classe: "Mago", nivel: 10,
  atributos: { forca: 0, destreza: 1, vigor: 1, intelecto: 4, presenca: 2, percepcao: 2 },
  equipados: { elmo: elmoVelho },
  inventario: [elmoVelho, elmoNovo, "Poção de Cura", { nome: "Montante", tipo: "arma" }, { nome: "Adaga" }, { nome: "Anel de Prata", tipo: "anel", raridade: "Épico" }],
};

sec("1. os encaixes do corpo são os de TROCA_DE_SLOT, e cada um tem glifo e nome");
{
  t("sete encaixes, os mesmos de TROCA_DE_SLOT", ENCAIXES_DO_CORPO.length === 7 && ENCAIXES_DO_CORPO.every((s) => TROCA_DE_SLOT[s]));
  t("cada encaixe tem glifo (GLIFO_DO_ENCAIXE) e o glifo é um ícone que existe", ENCAIXES_DO_CORPO.every((s) => ICONES_DE_ITEM[GLIFO_DO_ENCAIXE[s]]));
  t("cada encaixe tem nome e o verbo de tirar (ENCAIXE.nomes, ENCAIXE.tirar)", ENCAIXES_DO_CORPO.every((s) => ENCAIXE.nomes[s] && ENCAIXE.tirar[s]));
  const noBoneco = [...ENCAIXE.boneco.esquerda, ...ENCAIXE.boneco.direita, ...ENCAIXE.boneco.baixo];
  t("o boneco põe os sete, cada um uma vez (§3: 3 à esquerda, 3 à direita, botas por baixo)", noBoneco.length === 7 && new Set(noBoneco).size === 7 && ENCAIXES_DO_CORPO.every((s) => noBoneco.includes(s)) && ENCAIXE.boneco.baixo[0] === "botas");
}

sec("2. a raridade: seis, cada uma com cor e forma; o desconhecido é comum");
{
  t("RARIDADES são as chaves de COR_DA_RARIDADE e de ENCAIXE.marcas", RARIDADES.every((r) => COR_DA_RARIDADE[r] && Array.isArray(ENCAIXE.marcas[r])) && Object.keys(COR_DA_RARIDADE).length === RARIDADES.length);
  t("a forma SOBE com a raridade (cada uma tem as marcas da anterior, ou mais)", RARIDADES.slice(3).every((r, i) => ENCAIXE.marcas[RARIDADES[i + 2]].every((m) => ENCAIXE.marcas[r].includes(m)) || RARIDADES[i + 2] === "raro"));
  t("do raro para cima, a cor nunca é o único portador (WCAG 1.4.1): cada uma tem uma marca de forma", ["raro", "epico", "lendario", "unico"].every((r) => ENCAIXE.marcas[r].length > 0));
  t("de raro a único, nenhum par com as mesmas marcas", new Set(["raro", "epico", "lendario", "unico"].map((r) => ENCAIXE.marcas[r].join())).size === 4);
  t("«Épico» com acento e caixa lê-se epico", raridadeDoItem({ raridade: "Épico" }) === "epico");
  t("sem raridade, objeto ou texto: comum", raridadeDoItem({}) === "comum" && raridadeDoItem("Poção") === "comum" && raridadeDoItem({ raridade: "objeto" }) === "comum");
}

sec("3. o ícone: o campo icone manda; sem ele, a família; nunca vazio");
{
  t("item.icone manda (o pedido (a) ao sistema)", iconeDoItem({ nome: "Coisa", tipo: "elmo", icone: "tomo" }, ICONES_DE_ITEM) === "tomo");
  t("item.icone que não existe é ignorado", iconeDoItem({ nome: "Elmo", tipo: "elmo", icone: "nada" }, ICONES_DE_ITEM) === "elmo");
  t("elmo, escudo, botas, anel, amuleto pela família", ["elmo", "escudo", "botas", "anel", "amuleto"].every((s) => iconeDoItem({ nome: "x", tipo: s }) === s));
  t("arco longo é arco; montante é espada; adaga é adaga", iconeDoItem({ nome: "Arco Longo", tipo: "arma" }) === "arco" && iconeDoItem({ nome: "Montante", tipo: "arma" }) === "espada" && iconeDoItem({ nome: "Adaga", tipo: "arma" }) === "adaga");
  t("poção, chave e o desconhecido (pergaminho)", iconeDoItem("Poção de Cura") === "pocao" && iconeDoItem({ nome: "Chave Velha" }) === "chave" && iconeDoItem({ nome: "Bugiganga" }) === "pergaminho");
  const todos = heroi.inventario.map((it) => iconeDoItem(it));
  t("todo ícone devolvido existe em ICONES_DE_ITEM", todos.every((n) => ICONES_DE_ITEM[n]), todos.join());
}

sec("4. quem cabe em cada encaixe (o tipo do item, o mesmo que o equipar do App lê)");
{
  t("o elmo cabe no elmo e não na arma", cabeNoEncaixe(elmoNovo, "elmo") && !cabeNoEncaixe(elmoNovo, "arma"));
  t("a arma sem tipo cabe na mão (o recuo do App)", encaixeDoItem({ nome: "Adaga" }) === "arma");
  t("a poção não cabe em encaixe nenhum", encaixeDoItem("Poção de Cura") === null && encaixeDoItem({ nome: "Poção de Cura", tipo: "consumivel" }) === null);
  const elmos = itensParaEncaixe(heroi.inventario, "elmo");
  t("a gaveta do elmo tem só os dois elmos", elmos.length === 2 && elmos.every((x) => x.tipo === "elmo"));
  t("inventário torto dá gaveta vazia", itensParaEncaixe(null, "elmo").length === 0);
}

sec("5. a comparação: as linhas que MUDAM, com as contas de sempre");
{
  const r = compararItem(heroi, elmoNovo, "elmo");
  const ca = r.linhas.find((l) => l.id === "ca");
  t("a CA de antes é a de defesaDe, e a de depois também", ca && ca.antes === defesaDe(heroi) && ca.depois === defesaDe({ ...heroi, equipados: { elmo: elmoNovo } }));
  t("a CA sobe 1 e o sinal é ok", ca && ca.delta === 1 && ca.sinal === "ok");
  const per = r.linhas.find((l) => l.id === "percepcao");
  t("a Percepção desce 1 e o sinal é danger", per && per.delta === -1 && per.sinal === "danger" && per.antes === "+2" && per.depois === "+1");
  t("o que não muda não aparece (nenhuma linha de Força)", !r.linhas.some((l) => l.id === "forca"));
  t("a CA vem primeiro", r.linhas[0].id === "ca");
  t("o preço no botão: «Equipar · CA 12, Percepção −1»", rotuloDoEquipar(r.linhas) === `Equipar · CA ${ca.depois}, Percepção −1`, rotuloDoEquipar(r.linhas));
  t("sem nada a mudar, o verbo fica sozinho", rotuloDoEquipar([]) === "Equipar" && rotuloDoEquipar(null) === "Equipar");
  const arma = compararItem(heroi, { nome: "Montante", tipo: "arma" }, "arma");
  t("na mão, o dano entra (1d2 desarmado → 2d6)", arma.linhas.some((l) => l.id === "dano" && l.antes === "1d2" && l.depois === "2d6" && l.sinal === "ok"));
  t("tirar (item null) também se compara", compararItem({ ...heroi, equipados: { elmo: elmoNovo } }, null, "elmo").linhas.some((l) => l.id === "ca" && l.delta === -1));
  t("ficha nula não lança", Array.isArray(compararItem(null, elmoNovo, "elmo").linhas));
}

sec("6. o tempo da troca: o motor já sabe (TROCA_DE_SLOT, podeTrocarAgora)");
{
  t("fora da luta, troca-se", compararItem(heroi, elmoNovo, "elmo").troca.ok === true);
  const luta = compararItem(heroi, elmoNovo, "elmo", { emCombate: true }).troca;
  t("em luta, o elmo não cabe numa rodada, e diz porquê", luta.ok === false && /fivela/.test(luta.motivo));
  t("em luta, a arma troca-se", compararItem(heroi, { nome: "Adaga", tipo: "arma" }, "arma", { emCombate: true }).troca.ok === true);
  t("«Trocar leva 1 minuto: a fivela é debaixo do queixo…»", /^Trocar leva 1 minuto: a fivela é debaixo do queixo/.test(fraseDaTroca("elmo")), fraseDaTroca("elmo"));
  t("e os segundos e os minutos no plural certo", fraseDaTroca("arma").startsWith("Trocar leva 1 segundo:") && fraseDaTroca("anel").startsWith("Trocar leva 2 segundos:") && fraseDaTroca("botas").startsWith("Trocar leva 2 minutos:") && fraseDaTroca("armadura").startsWith("Trocar leva 10 minutos:"));
  t("encaixe que não existe: frase vazia", fraseDaTroca("cauda") === "");
}

sec("7. o que pede sintonia e não a tem dorme — e a comparação di-lo");
{
  const raro = { ...elmoNovo, nome: "Elmo Rúnico", raridade: "raro" };
  const r = compararItem(heroi, raro, "elmo");
  t("o raro sem sintonia não muda número nenhum (o poder dorme)", r.linhas.length === 0 && r.dorme === true);
  const s = compararItem({ ...heroi, sintonizados: ["Elmo Rúnico"] }, raro, "elmo");
  t("sintonizado, conta e já não dorme", s.dorme === false && s.linhas.some((l) => l.id === "ca"));
  t("o incomum nunca dorme", compararItem(heroi, elmoNovo, "elmo").dorme === false);
}

console.log(`\n${ok} ok · ${mal} falhas`);
if (mal) process.exit(1);
