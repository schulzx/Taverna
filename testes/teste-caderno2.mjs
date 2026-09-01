import {
  ehPreparavel, preparaveisDe, temCaderno, limitePreparadas, garantirPreparadas,
  estaPreparada, alternarPreparada, motivoDoCaderno, podeLancar, ehRitual,
} from "../src/magias.js";
import { classesDaHabilidade, classeDaHabilidade } from "../src/classes.js";
import { magiaPorNome } from "../src/grimorio.js";

let ok = 0, mau = 0;
const t = (n, c) => { if (c) { ok++; console.log("  ok  " + n); } else { mau++; console.log("  XX  " + n); } };
const sec = (s) => console.log("\n" + s);

sec("1. classesDaHabilidade devolve a lista inteira");
{
  const bola = magiaPorNome("Bola de Fogo");
  t("Bola de Fogo existe no grimório", !!bola);
  t("ela é de mais de uma classe", bola.classes.length > 1);
  const cs = classesDaHabilidade("Bola de Fogo");
  t("todas as classes dela voltam", bola.classes.every((c) => cs.includes(c)));
  t("classeDaHabilidade continua devolvendo uma só", typeof classeDaHabilidade("Bola de Fogo") === "string");
  t("nome que não existe devolve lista vazia", classesDaHabilidade("Chute na Canela") .length === 0);
  t("null não derruba", classesDaHabilidade(null).length === 0);
}

sec("2. o furo que o jogador sentiu: magia de duas classes ficava fora do caderno");
{
  /* Encontra uma magia cuja PRIMEIRA classe não é Mago mas que o Mago lança.
     Antes, essas ficavam de fora do caderno do mago por ordem de escrita. */
  const alvo = ["Bola de Fogo", "Relâmpago", "Mísseis Mágicos", "Escudo Arcano", "Teleporte", "Meteoro", "Contramágica", "Lentidão"]
    .map((n) => ({ n, m: magiaPorNome(n) }))
    .filter((x) => x.m && x.m.classes.includes("Mago") && x.m.classes[0] !== "Mago")[0];
  if (!alvo) {
    console.log("  --  nenhuma magia com Mago fora da primeira posição; teste vale pelo caso geral");
  } else {
    const mago = { nome: "Merlim", classe: "Mago", nivel: 12, atributos: { intelecto: 5 }, habilidades: [{ nome: alvo.n, custo: 5, descricao: "" }] };
    t(`"${alvo.n}" (classes ${alvo.m.classes.join("/")}) entra no caderno do Mago`, ehPreparavel(mago.habilidades[0], mago));
  }
  /* e o caso direto, que precisa continuar valendo */
  const mago = { nome: "Merlim", classe: "Mago", nivel: 12, atributos: { intelecto: 5 }, habilidades: [{ nome: "Bola de Fogo", custo: 5, descricao: "" }] };
  t("Bola de Fogo é do caderno do Mago", ehPreparavel(mago.habilidades[0], mago));
}

sec("3. magia de classe que o herói NÃO tem fica sempre à mão");
{
  const mago = {
    nome: "Merlim", classe: "Mago", nivel: 12, atributos: { intelecto: 5 },
    habilidades: [{ nome: "Bola de Fogo", custo: 5 }, { nome: "Golpe Poderoso", custo: 3 }],
  };
  t("golpe de guerreiro nunca prepara", !ehPreparavel({ nome: "Golpe Poderoso", custo: 3 }, mago));
  t("e por isso está sempre à mão", estaPreparada(mago, { nome: "Golpe Poderoso", custo: 3 }));
}

sec("4. quem não estuda não tem caderno — e o painel diz por quê");
{
  const feit = { nome: "Vera", classe: "Feiticeiro", nivel: 12, atributos: { presenca: 5 }, habilidades: [{ nome: "Bola de Fogo", custo: 5 }] };
  t("Feiticeiro não tem caderno", !temCaderno(feit));
  t("nada dele é preparável", !ehPreparavel(feit.habilidades[0], feit));
  const m = motivoDoCaderno(feit);
  t("o motivo cita a classe", /Feiticeiro/.test(m));
  t("o motivo explica que é de nascença", /nascen/.test(m));
  t("e diz que está sempre à mão", /sempre à mão/.test(m));

  const guer = { nome: "Tor", classe: "Guerreiro", nivel: 8, atributos: { forca: 5 }, habilidades: [{ nome: "Golpe Poderoso", custo: 3 }] };
  const mg = motivoDoCaderno(guer);
  t("guerreiro recebe o motivo dele", /Guerreiro/.test(mg) && /nunca se preparam/.test(mg));

  const semClasse = { nome: "X", classe: "", nivel: 1, atributos: {}, habilidades: [] };
  t("sem classe, manda escolher um caminho", /caminho/.test(motivoDoCaderno(semClasse)));
}

sec("5. mago com caderno mas sem magia aprendida");
{
  const novato = { nome: "Aprendiz", classe: "Mago", nivel: 1, atributos: { intelecto: 2 }, habilidades: [{ nome: "Golpe Poderoso", custo: 3 }] };
  t("tem caderno", temCaderno(novato));
  t("mas nada preparável", preparaveisDe(novato).length === 0);
  const m = motivoDoCaderno(novato);
  t("o motivo diz que ainda não aprendeu nenhuma", /ainda não aprendeu/.test(m));
  t("e diz de onde elas vêm", /árvore de Mago/.test(m));
}

sec("6. mago com magias: motivo vazio, painel normal");
{
  const mago = {
    nome: "Merlim", classe: "Mago", nivel: 12, atributos: { intelecto: 5 },
    habilidades: [{ nome: "Bola de Fogo", custo: 5 }, { nome: "Mísseis Mágicos", custo: 3 }, { nome: "Escudo Arcano", custo: 3 }],
    preparadas: [],
  };
  t("motivo vazio quando há o que preparar", motivoDoCaderno(mago) === "");
  t("o teto é maior que zero", limitePreparadas(mago) > 0);
  const r = alternarPreparada(mago, "Bola de Fogo");
  t("dá para preparar", r.ok && r.acao === "preparou");
  const comUma = { ...mago, preparadas: r.preparadas };
  t("a preparada está preparada", estaPreparada(comUma, comUma.habilidades[0]));
  t("as outras não", !estaPreparada(comUma, comUma.habilidades[1]));
  t("a guardada é barrada em combate", !podeLancar(comUma, comUma.habilidades[1], { emCombate: true }).ok);
}

sec("7. a lista do botão Habilidades separa certo");
{
  const mago = {
    nome: "Merlim", classe: "Mago", nivel: 12, atributos: { intelecto: 5 },
    habilidades: [
      { nome: "Bola de Fogo", custo: 5 },
      { nome: "Mísseis Mágicos", custo: 3 },
      { nome: "Escudo Arcano", custo: 3 },
      { nome: "Golpe Poderoso", custo: 3 },
    ],
    preparadas: ["Bola de Fogo"],
  };
  /* a mesma conta que PainelHabilidades faz */
  const tudo = mago.habilidades;
  const guardadas = tudo.filter((h) => ehPreparavel(h, mago) && !estaPreparada(mago, h));
  const naLuta = tudo.filter((h) => !guardadas.includes(h));
  t("as guardadas saem da lista principal", guardadas.length === 2);
  t("a preparada fica", naLuta.some((h) => h.nome === "Bola de Fogo"));
  t("o golpe físico fica", naLuta.some((h) => h.nome === "Golpe Poderoso"));
  t("nada se perde entre as duas listas", guardadas.length + naLuta.length === tudo.length);
  t("nenhuma aparece nas duas", !naLuta.some((h) => guardadas.includes(h)));
}

sec("8. ritual continua sendo a válvula de escape");
{
  const mago = {
    nome: "Merlim", classe: "Mago", nivel: 12, atributos: { intelecto: 5 },
    habilidades: [{ nome: "Detectar Magia", custo: 2, descricao: "revela auras" }],
    preparadas: [],
  };
  const h = mago.habilidades[0];
  if (ehPreparavel(h, mago)) {
    t("guardada, mas ritual fora de combate", podeLancar(mago, h, { emCombate: false }).ritual === true);
    t("e barrada dentro do combate", !podeLancar(mago, h, { emCombate: true }).ok);
  } else {
    t("Detectar Magia não é do caderno deste herói (então está sempre à mão)", estaPreparada(mago, h));
  }
  t("ehRitual reconhece uma utilitária barata", ehRitual({ nome: "Detectar Magia", custo: 2 }));
  t("e recusa uma magia de arrasar", !ehRitual({ nome: "Meteoro", custo: 7 }));
}

console.log(`\n${ok} ok, ${mau} falhas`);
process.exit(mau ? 1 : 0);
