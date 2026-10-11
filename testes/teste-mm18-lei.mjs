/* A LEI DA PORTA (Fase MM, MM18 · a lei do mundo) — a lei da abertura é do sistema

   A pessoa (11/10): "não entendi a questão da lei do mundo que é citada no
   começo da campanha, algumas nem parecem fazer sentido". O pedido da
   abertura mandava o Narrador dizer "uma lei daqui que não valeria noutro
   lugar" sem lhe dar lei nenhuma, e ele inventava um lema: "A lei do
   lugar? Papel vale mais que ouro" (3.ª sessão), "a lei aqui é o Sino"
   (4.ª). Nenhuma tinha dono, nenhuma voltava, e a ficha da cidade,
   perguntada depois, dizia outra.

   Agora a abertura guarda a regra da PORTA da cidade de partida (a ficha
   da cidade, `reconhecimento`) e pede ao Narrador que a mostre a
   acontecer com o herói, à chegada. Esta suíte prova: a frase que pedia
   uma lei inventada saiu; a regra guardada é a da ficha (a mesma que a
   pauta responde a "como se reconhece quem é bem-vindo?"), em todos os
   mundos; o pedido a leva e cabe no teto; o save antigo abre sem lei. */
import {
  garantirAbertura, abrirAbertura, pedidoDaAbertura, LEI_DA_PORTA, PALAVRAS_DE_BASTIDOR,
} from "../src/abertura.js";
import { fichaDaCidade, RECONHECIMENTO } from "../src/cidade-por-dentro.js";
import { gerarGeografia } from "../src/geografia.js";
import { estenderEspinha } from "../src/saga.js";
import { MOLDES } from "../src/moldes.js";
import { generosDisponiveis } from "../src/nomes.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);

const MUNDOS = [];
for (const g of generosDisponiveis()) for (const M of MOLDES) {
  const semente = `Sonda MM18 lei|${g}|${M.id}`;
  const mapa = gerarGeografia(semente, M);
  MUNDOS.push({ semente, genero: g, molde: M, mapa, cidade: mapa.cidades[0].nome });
}
const abrir = (w) => {
  const espinha = estenderEspinha({ semente: w.semente, mapa: w.mapa, genero: w.genero, molde: w.molde, estrutura: "jornada", cidadeInicial: w.cidade });
  return abrirAbertura({ semente: w.semente, mapa: w.mapa, cidade: w.cidade, espinha, estrutura: "jornada", genero: w.genero, molde: w.molde, nivel: 1, dia: 1 });
};
const ABERTOS = MUNDOS.map((w) => ({ w, r: abrir(w) })).filter((x) => x.r);

sec("1. o pedido deixou de mandar inventar uma lei");
{
  const p = pedidoDaAbertura(ABERTOS[0].r.abertura);
  t("\"uma lei daqui que não valeria noutro lugar\" saiu do pedido", !/uma lei daqui/.test(p));
  t("e nenhum pedido das aberturas a tem", ABERTOS.every(({ r }) => !/lei daqui/.test(pedidoDaAbertura(r.abertura))));
}

sec("2. a regra guardada é a da porta, da ficha da cidade, em todos os mundos");
{
  t(`${ABERTOS.length} aberturas de ${MUNDOS.length} mundos`, ABERTOS.length === MUNDOS.length && ABERTOS.length >= 20);
  const todas = new Set(Object.values(RECONHECIMENTO).flat());
  const iguais = ABERTOS.filter(({ w, r }) => {
    const cidade = w.mapa.cidades.find((c) => c.nome === r.abertura.cidade);
    const f = fichaDaCidade(cidade, { semente: w.semente, mapa: w.mapa, genero: w.genero, lex: null, molde: w.molde });
    return r.abertura.porta === f.reconhecimento;
  });
  t("a regra é a que a ficha da cidade dá (a mesma que a pauta responde depois)", iguais.length === ABERTOS.length, `${iguais.length}/${ABERTOS.length}`);
  t("e é sempre uma linha da tabela RECONHECIMENTO", ABERTOS.every(({ r }) => todas.has(r.abertura.porta)));
  t("cabe no teto da regra", ABERTOS.every(({ r }) => r.abertura.porta.length <= LEI_DA_PORTA.teto));
  const de2 = ABERTOS.slice(0, 6).map(({ w }) => abrir(w).abertura.porta);
  t("determinística: a mesma semente dá a mesma regra", ABERTOS.slice(0, 6).every(({ r }, i) => r.abertura.porta === de2[i]));
}

sec("3. o pedido leva a regra, no lugar certo, e mostrada — não dita como lema");
{
  const falhas = [];
  for (const { r } of ABERTOS) {
    const p = pedidoDaAbertura(r.abertura);
    const i2 = p.indexOf("2) ONDE"), i3 = p.indexOf("3) A PEQUENA"), ir = p.indexOf(r.abertura.porta);
    if (!(ir > i2 && ir < i3)) falhas.push(r.abertura.cidade);
  }
  t("a regra vai na parte 2 (onde o herói está, à porta)", falhas.length === 0, falhas.slice(0, 4).join(", "));
  t("o pedido diz para a mostrar a acontecer, sem lema", /mostre-a acontecer, sem lema/.test(LEI_DA_PORTA.diz) && LEI_DA_PORTA.diz.includes("{porta}"));
  const maior = Math.max(...ABERTOS.map(({ r }) => pedidoDaAbertura(r.abertura).length));
  t(`o pedido continua dentro dos 1.500 da MM13 (maior: ${maior})`, maior <= 1500);
  const bast = PALAVRAS_DE_BASTIDOR.filter((w) => new RegExp(`\\b${w}\\b`, "i").test(LEI_DA_PORTA.diz));
  t("a frase da lei não tem palavra de bastidor", bast.length === 0, bast.join(","));
}

sec("4. o save antigo, o lixo e a imutabilidade");
{
  const semPorta = garantirAbertura({ ...ABERTOS[0].r.abertura, porta: undefined });
  t("save sem a regra abre sem lei (nenhuma inventada)", semPorta.porta === "" && !/À porta vale já/.test(pedidoDaAbertura(semPorta)));
  t("o campo atravessa a catraca do save", garantirAbertura(ABERTOS[0].r.abertura).porta === ABERTOS[0].r.abertura.porta);
  t("o legado continua legado", garantirAbertura(null).legado === true && pedidoDaAbertura(null) === "");
  const a = ABERTOS[1].r.abertura, antes = JSON.stringify(a);
  pedidoDaAbertura(a);
  t("o pedido não muta a abertura", JSON.stringify(a) === antes);
}

console.log(`\nmm18-lei: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
