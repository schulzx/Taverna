/* check-texto-de-tela.mjs (15/11/2026, S6 — a tela não mostra o bastidor)

   Na sessão de 15/11 a tela mostrou, em minutos de jogo: «187 de poder
   (você 126 + 1 no grupo) contra 515 — 2.8× menos do que isto pede»,
   «⌖ K11 50,5 · 50,2», «camada 0», «faltam 1 avanco», «3 Rato Gigantes»,
   «+8 cidade tem de tudo» e «(um favor que lhe custa pouco, desconhecido
   (+2))». Cada um foi corrigido na origem; este varredor é a catraca.

   O QUE SE VARRE: as linhas de tela tal como as funções que as montam as
   devolvem, sobre uma grade de entradas (níveis, grupos, estados, tochas,
   caídos, relações, viagens a meio) — e, no App, os sítios que juntavam o
   bastidor à linha (o endereço da casa, os fatores do oráculo). Falha com:
     · «de poder (» — a conta do poder na frase;
     · «\d\.\d×» ou «\d,\d×» — as vezes com casa decimal;
     · «⌖» — a coordenada da grade;
     · «camada 0» — o índice que começa em zero;
     · «avanco» — a palavra sem cedilha; e «faltam 1 » — sem concordância;
     · «(+N)» / «(−N)» — o modificador entre parêntesis;
     · o plural do nome composto com o «s» só na última palavra. */
import fs from "node:fs";
import { vereditoDaMasmorra } from "../src/boca.js";
import { avaliar, porqueAssim } from "../src/dificuldade.js";
import { cabecalhoDaCena, camadaEmPalavras } from "../src/palco.js";
import { etiquetasDaPagina, quemCaiu } from "../src/glifos.js";
import { linhaDaViagem, abrirViagem } from "../src/viagem.js";
import { dificuldadeSocial } from "../src/social.js";
import { linhaDaConsulta } from "../src/oraculo.js";
import { pluralDoNome, contagem, falta } from "../src/plural.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? "\n      " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const APP = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");

const PROIBIDOS = [
  ["a conta do poder", /de poder \(/],
  ["as vezes com casa decimal", /\d[.,]\d×/],
  ["a coordenada da grade", /⌖/],
  ["o índice a partir de zero", /camada 0\b/i],
  /* S6b (15/11): nenhum índice de camada na tela, nem o 1 */
  ["o índice da camada", /\bcamada \d/i],
  ["a palavra sem cedilha", /\bavancos?\b/i],
  ["a contagem de um sem concordância", /\bfaltam 1 /],
  ["o modificador entre parêntesis", /\([+−-]\d+\)/],
];
const varrer = (linhas) => {
  const achados = [];
  for (const l of linhas) for (const [o, rx] of PROIBIDOS) if (rx.test(l)) achados.push(`${o}: «${l}»`);
  return achados;
};

/* ============================================================ */
sec("1. o veredito do perigo, em palavras");
const linhas1 = [];
{
  const heroi = (nivel, grupo = 0, extra = {}) => ({
    nome: "Velha valente", nivel, vida: 20, vidaMax: 20, atributos: { forca: 12, destreza: 12, constituicao: 12, inteligencia: 10, sabedoria: 10, carisma: 10 },
    grupo: Array.from({ length: grupo }, (_, i) => ({ nome: `Companheiro ${i + 1}`, nivel, vida: 12, vidaMax: 12 })), suprimentos: { tochas: 3 }, ...extra,
  });
  for (let nivel = 1; nivel <= 12; nivel += 1) for (let mm = 1; mm <= 14; mm += 2) for (const grupo of [0, 1, 3]) {
    const p = heroi(nivel, grupo, mm % 3 === 0 ? { suprimentos: { tochas: 0 }, vida: 6 } : {});
    const v = vereditoDaMasmorra({ nome: "Fenda de Silêncio", nivel: mm, salas: 8 }, p);
    if (v) linhas1.push(v.linha);
    const d = avaliar({ nivel: mm, tamanho: 4 }, p);
    linhas1.push(d.porque);
  }
  t(`as linhas foram montadas (${linhas1.length})`, linhas1.length > 300);
  const ach = varrer(linhas1);
  t("nenhuma linha do veredito traz a conta, o «×» decimal ou o modificador", ach.length === 0, ach.slice(0, 4).join("\n      "));
  t("o veredito diz a distância em palavras", linhas1.some((l) => /vezes acima de vocês/.test(l)) && linhas1.some((l) => /do tamanho de você/.test(l)));
  t("o que rebaixa quem entra continua dito («sem uma tocha»)", linhas1.some((l) => /sem uma tocha/.test(l)));
  const d = avaliar({ nivel: 9, tamanho: 4 }, heroi(2, 1));
  t("a conta com os números fica no detalhe (conta), para o toque", /de poder/.test(d.conta) && !/de poder/.test(d.porque));
  t("porqueAssim aguenta lixo", typeof porqueAssim(null, 0, NaN) === "string");
}

/* ============================================================ */
sec("2. o cabeçalho da masmorra");
{
  const salas = [{ id: 0, camada: 0 }, { id: 1, camada: 1 }, { id: 2, camada: 2 }];
  const linhas = [];
  for (const s of salas) for (const tochas of [0, 1, 5]) {
    const c = cabecalhoDaCena({ masmorra: { nome: "Cripta do Sal", salas, atual: s.id, tochas } });
    const onde = Array.isArray(c.onde) ? c.onde.join(" · ") : String(c.onde || "");
    linhas.push(onde);
    const e = etiquetasDaPagina({ lugar: c.titulo, cena: { ...c, onde } });
    linhas.push([...(e.direita || [])].join(" · "));
  }
  const ach = varrer(linhas);
  t("nenhum cabeçalho diz «camada 0»", ach.length === 0, ach.join("\n      "));
  /* S6b (15/11): a camada 2 já não se diz «camada 2» — é o segundo subsolo, ou o fundo quando é a última */
  t("a camada 0 é a entrada", camadaEmPalavras(0) === "entrada" && camadaEmPalavras(2) === "segundo subsolo" && camadaEmPalavras(2, 2) === "fundo" && camadaEmPalavras(1, 3) === "primeiro subsolo");
  t("a entrada aparece na etiqueta da página", linhas.some((l) => /^entrada\b/.test(l)));
}

/* ============================================================ */
sec("3. a estrada e a contagem");
{
  const linhas = [];
  for (const dias of [0.5, 1, 2, 3, 5]) {
    let j = abrirViagem({ de: "Monte Profundo", para: "Fenda de Silêncio", dia: 1, rota: { dias, terreno: "colinas" } });
    if (!j) continue;
    for (let passo = 0; passo < 20; passo++) {
      linhas.push(linhaDaViagem(j));
      j = { ...j, andadoMin: (j.andadoMin || 0) + 240 };
    }
  }
  t(`as linhas da estrada foram montadas (${linhas.filter(Boolean).length})`, linhas.filter(Boolean).length > 10);
  const ach = varrer(linhas);
  t("nenhuma linha da estrada sem cedilha, sem concordância ou com coordenada", ach.length === 0, ach.slice(0, 4).join("\n      "));
  t("falta concorda com um", falta(1, "avanço") === "falta 1 avanço" && falta(3, "avanço") === "faltam 3 avanços");
  t("a coordenada da grade não vai à mensagem da estrada no App", !/texto: `\$\{linha\}\$\{r \? ` · ⌖/.test(APP));
  t("a oferta de seguir viagem conta pela régua da tela", /retorno: falta\(p\.turnosRestantes, "avanço"\)/.test(APP) && !/"avanco" : "avancos"/.test(APP));
}

/* ============================================================ */
sec("4. o plural de nome composto");
{
  const casos = [
    [["Rato Gigante 1", "Rato Gigante 2", "Rato Gigante 3"], "3 Ratos Gigantes caíram"],
    [["Lobo da Neve 1", "Lobo da Neve 2"], "2 Lobos da Neve caíram"],
    [["Homem-Lagarto 1", "Homem-Lagarto 2"], "2 Homens-Lagarto caíram"],
    [["Aranha Gigante 1", "Aranha Gigante 2"], "2 Aranhas Gigantes caíram"],
    [["lobo 1", "lobo 2"], "2 lobos caíram"],
  ];
  for (const [nomes, esp] of casos) t(`«${esp}»`, quemCaiu(nomes) === esp, quemCaiu(nomes));
  t("contagem de um não pluraliza", contagem(1, "Rato Gigante") === "1 Rato Gigante");
  t("o «s» nunca fica só na última palavra de um composto", !/\b\d+ [A-ZÁ-Ú][a-zà-ú]+[aeiou] [A-ZÁ-Ú][a-zà-ú]+s\b/.test(casos.map(([n]) => quemCaiu(n)).join(" | ")));
  t("pluralDoNome aguenta lixo", pluralDoNome(null) === "" && contagem("x", "y") === "" && falta(2, "") === "");
}

/* ============================================================ */
sec("5. o porquê social e o oráculo");
{
  const linhas = [];
  for (const relacao of ["desconhecido", "amigo", "rival", "inimigo", "aliado", "neutro"]) for (const fama of [0, 50, 90]) for (const texto of ["peço um favor", "quanto deves ao morto?", "convenço-o a abrir a porta", "ameaço-o com a espada"]) {
    const d = dificuldadeSocial({ texto, pessoa: { nome: "Isen", relacao, papel: "guarda" }, pers: { moedas: 40, nivel: 2 }, fama });
    linhas.push(d.deOnde);
  }
  const ach = varrer(linhas);
  t("o porquê da dificuldade social diz-se sem «(+N)»", ach.length === 0, ach.slice(0, 4).join("\n      "));
  const r = { pergunta: "Isen deve dinheiro?", grau: { rotulo: "Não" }, porque: ["+8 cidade tem de tudo"] };
  t("a linha do oráculo é a pergunta e a resposta", linhaDaConsulta(r) === "🔮 \"Isen deve dinheiro?\" — Não");
  t("e o App não lhe cola os fatores", !/linhaDaConsulta\(r\) \+ \(!r\.reusado && r\.porque/.test(APP));
}

console.log(`\n${ok} ok · ${mal} falhas`);
process.exit(mal ? 1 : 0);
