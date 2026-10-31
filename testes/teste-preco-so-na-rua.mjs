/* teste-preco-so-na-rua.mjs (31/10/2026, a 13.ª sessão de prova) — o prato quente não tem preço dentro da Fenda

   O DEFEITO (T23 da 13.ª): a heroína estava DENTRO da Fenda de Silêncio e
   perguntou «quanto custa um prato quente e uma cama?». A pauta respondeu
   «o preço daqui: refeição quente ◉ 3 moedas» — o preço da rua de Porto das
   Pedras, lá em cima —, ao lado de um NÃO PODE que proíbe narrar a chegada.
   A causa era o portão de `precoComumParaPauta` na pauta do turno
   (src/motor/pauta-do-turno.js): «fora da luta e com cidade», e a cidade fica
   marcada na estrada e dentro da masmorra. A mesa que fecha o buraco
   (`oQueAMesaFecha`, logo abaixo na mesma peça) já calava ali; o preço não.

   O conserto é o portão da mesa: cidade, fora da estrada, da masmorra e da
   luta. Esta suíte corre a PEÇA da pauta (`aPautaDoTurno`) sobre um caso do
   corpus que está numa cidade, com o mundo da 13.ª por cima (o mapa, Porto
   das Pedras, a gente), a frase do T23, e uma Fenda de Silêncio de verdade
   (`gerarMasmorra`, semeada: a do save de prova só guarda o nome). Põe-no na
   rua (o preço vem), dentro da Fenda (cala), na estrada (cala) e na luta
   (cala, como sempre calou).
   FALHA ANTES: dentro da Fenda e na estrada, a pergunta da pauta levava
   «o preço daqui: refeição quente ◉ 3 moedas». */
import fs from "node:fs";
import { lerODourado, casosDaPauta, correrAPeca, osModulos, osPadroes } from "./pauta-bloco.mjs";
import { aPautaDoTurno } from "../src/motor/pauta-do-turno.js";
import { textoDaPauta } from "../src/pauta.js";
import { precoComumParaPauta } from "../src/mercado.js";
import { gerarMasmorra } from "../src/masmorras.js";
import { sorteDaSemente } from "./regua-combate.mjs";

let ok = 0, mal = 0;
const t = (nome, cond, extra) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

const F = JSON.parse(fs.readFileSync(new URL("./sessao-s13-fenda.json", import.meta.url), "utf8"));
const FRASE = "quanto custa um prato quente e uma cama?";
const PRECO = "o preço daqui:";
const D = lerODourado();
const padroes = osPadroes(D, await osModulos(D.imports));

sec("1. a frase do T23 tem preço — é a tabela que responde, onde há rua");
{
  const r = precoComumParaPauta(FRASE, { fator: 1, moeda: "" });
  t("a frase pergunta um preço comum (a refeição quente)", r.pergunta.length === 1 && r.pergunta[0].startsWith(PRECO), JSON.stringify(r.pergunta));
}

sec("2. a peça da pauta: na rua sim; na masmorra, na estrada e na luta, não");
{
  const k0 = casosDaPauta().find((x) => x.estado && x.estado.cidadeAtual && !x.estado.combate && !x.estado.masmorra && !x.estado.jornada && x.estado.personagem);
  t(`há no corpus um caso numa cidade, fora de tudo (o caso ${k0 && k0.i})`, !!k0);
  const base = { ...k0.estado, mapa: F.mapa, cidadeAtual: F.cidadeAtual, npcs: F.npcs, nomeCampanha: F.nomeCampanha, canone: F.canone, mensagens: F.mensagens, dia: F.dia, ultimaAcao: FRASE };
  const fenda = gerarMasmorra(F.genero, F.masmorra.nivel || 1, F.masmorra.nome, { sorte: sorteDaSemente("fenda|13") });
  t(`a ${fenda.nome} de verdade: aberta, com salas`, fenda.nome === F.masmorra.nome && !fenda.encerrada && fenda.salas.length > 0);
  const correr = (estado) => {
    const a = correrAPeca(aPautaDoTurno, { ...k0, frase: FRASE, estado: { ...base, ...estado } }, D, padroes);
    const p = a.p || {};
    return { erro: a.erro, pergunta: Array.isArray(p.pergunta) ? p.pergunta : [], texto: a.erro ? "" : textoDaPauta(p) };
  };
  const temPreco = (r) => r.pergunta.some((l) => String(l).startsWith(PRECO)) || r.texto.includes(PRECO);
  const rua = correr({ lugar: null, masmorra: null });
  t(`na rua de ${F.cidadeAtual}: a pauta diz o preço da refeição`, !rua.erro && temPreco(rua), rua.erro || JSON.stringify(rua.pergunta));
  const dentro = correr({ lugar: F.lugar, masmorra: fenda });
  t(`dentro da ${fenda.nome} (o T23): o preço cala`, !dentro.erro && !temPreco(dentro), dentro.erro || JSON.stringify(dentro.pergunta));
  t("e a pauta lá dentro continua a ser pauta (não é ela que se cala)", !dentro.erro && dentro.texto.length > 0);
  const estrada = correr({ jornada: { de: F.cidadeAtual, para: "Outro Lugar", dias: 2, diaAtual: 1 } });
  t("na estrada: o preço cala (a rua ficou para trás)", !estrada.erro && !temPreco(estrada), estrada.erro || JSON.stringify(estrada.pergunta));
  const luta = correr({ combate: { ativo: true, rodada: 1, inimigos: [] } });
  t("na luta: o preço cala, como sempre calou", !luta.erro && !temPreco(luta), luta.erro || JSON.stringify(luta.pergunta));
}

console.log(`\n${ok} ok, ${mal} falha(s)`);
process.exit(mal ? 1 : 0);
