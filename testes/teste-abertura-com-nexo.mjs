/* A ABERTURA NÃO SE CONTRADIZ (nexo, 11/10)

   Da lista de contradições entre órgãos da 4.ª sessão (mente/mm11-sessao-4.md)
   e da leitura de 12 campanhas novas como um editor lê um roteiro, três
   nasciam na abertura (abertura.js):

     1. o SINO × a missão × a cena: "{quem} chega a {cidade} às pressas,
        ferido(a)" — e quem a história procura MORA noutro sítio, que a
        procura, o diário e a ficha continuam a dizer. Na sessão, o herói
        estava ao lado de Noé em Rio Cinzento quando o sino trouxe "Noé"
        ferido a Alto do Sal: um segundo Noé (3 das 12 campanhas lidas);
     2. a RAZÃO contra o LAÇO: "uma carta sem assinatura … e quem mandou o
        recado foi um antigo companheiro de armas" — um anónimo com nome; e
        "alguém pediu-lhe, antes de morrer … e quem mandou o recado foi" —
        dois remetentes;
    11. o GÉNERO: "Inocência Bordão, músico … ele" — o ofício da base, neutro
        ou masculino, copiado para uma mulher (7 das 12 pistas com "(a)").

   FALHA em HEAD (v9.374): o sino move quem se procura, o laço do soldado diz
   quem mandou, e `oficioNoGenero` não existe. */

import * as AB from "../src/abertura.js";
import * as SG from "../src/saga.js";
import * as R from "../src/regiao.js";
import * as MB from "../src/mundo-base.js";
import { ESTRUTURAS } from "../src/historia.js";
import { moldePorId } from "../src/moldes.js";
import { sementeDe, generoDe } from "./medir-regiao.mjs";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
const N = 120;

function abertura(i, antecedente = "") {
  const semente = sementeDe(i), genero = generoDe(i), estrutura = ESTRUTURAS[i % ESTRUTURAS.length].id, molde = moldePorId("sobremundo");
  const mapa = R.mapaDaCampanhaNova(R.mapaDaCriacao({ semente, molde, genero, estrutura, modo: "historia" }));
  let esp = SG.estenderEspinha({ semente, mapa, genero, molde, estrutura, cidadeInicial: mapa.cidades[0].nome });
  if (mapa.regiao) esp = R.espinhaNaRegiao(mapa, esp, { semente, genero, molde });
  const ab = AB.abrirAbertura({ semente, mapa, cidade: mapa.cidades[0].nome, espinha: esp, estrutura, antecedente, genero, molde, base: MB.garantirBase(null), nivel: 1, dia: 1 });
  return { semente, genero, molde, mapa, ab };
}

sec("1. o sino move a pressão, nunca quem se procura");
{
  const v = AB.ACONTECIMENTOS_DO_SINO.procurar;
  t("nenhuma variante põe {quem} a chegar", v.every((x) => !/\{quem\}\s+chega/.test(x)));
  t("e todas falam de {quem}", v.every((x) => x.includes("{quem}")));
  let procurar = 0, moveu = 0, exemplo = "";
  for (let i = 0; i < N; i++) {
    const { ab } = abertura(i);
    if (!ab || ab.abertura.alvo.feitio !== "procurar") continue;
    procurar++;
    /* o sino cheio, depois do piso, com o herói na cidade e com ele longe */
    for (const cidade of [ab.abertura.cidade, "Outro Sítio"]) {
      const r = AB.andarOSino({ ...ab.abertura, cheios: AB.SINO.segmentos - 1, turnos: AB.SINO.piso + 4 }, { missoes: [ab.missao], cidade, lugar: "x" });
      const linha = norm(r.toque && r.toque.linha);
      if (linha.includes(norm(ab.abertura.alvo.quem) + " chega")) { moveu++; exemplo = exemplo || r.toque.linha; }
    }
  }
  t(`em ${procurar} aberturas de procura, o sino nunca traz quem se procura (${moveu})`, procurar > 0 && moveu === 0, exemplo);
}

sec("2. a razão e o laço contam a mesma história");
{
  const remetente = /quem mandou|mandou o recado|enviou/i;
  const jaTemRemetente = /sem assinatura|antes de morrer|recebeu um recado/i;
  const choques = [];
  for (const [est, razoes] of Object.entries(AB.RAZOES_DA_ESTRUTURA)) {
    for (const r of razoes) for (const [id, l] of Object.entries(AB.LACOS_DO_ANTECEDENTE)) {
      if (jaTemRemetente.test(r) && remetente.test(l.o)) choques.push(`${est} × ${id}`);
    }
  }
  t(`nenhuma razão com remetente leva um laço que diz quem mandou${choques.length ? " — " + choques.slice(0, 3).join(", ") : ""}`, choques.length === 0);
  t("nenhum laço diz quem mandou (o laço diz quem está metido)", Object.values(AB.LACOS_DO_ANTECEDENTE).every((l) => !remetente.test(l.o)));
  let soldados = 0, limpos = 0;
  for (let i = 0; i < 40; i++) {
    const { ab } = abertura(i, "soldado");
    if (!ab) continue;
    soldados++;
    if (!(jaTemRemetente.test(ab.abertura.razao) && remetente.test(ab.abertura.razao))) limpos++;
  }
  t(`a razão do soldado nunca tem dois remetentes (${limpos}/${soldados})`, soldados > 0 && limpos === soldados);
}

sec("3. o ofício no género de quem o tem");
{
  const f = AB.oficioNoGenero;
  t("taverneiro(a) → taverneira / taverneiro", f("taverneiro(a)", "mulher") === "taverneira" && f("taverneiro(a)", "homem") === "taverneiro");
  t("dono(a) da casa → dona da casa (a locução não concorda)", f("dono(a) da casa", "mulher") === "dona da casa");
  t("mercador(a) → mercadora", f("mercador(a)", "mulher") === "mercadora");
  t("músico → música; empresário da arena → empresária da arena", f("músico", "mulher") === "música" && f("empresário da arena", "mulher") === "empresária da arena");
  t("vendedor de ervas → vendedora de ervas; capitão → capitã", f("vendedor de ervas", "mulher") === "vendedora de ervas" && f("capitão da guarda", "mulher") === "capitã da guarda");
  t("o neutro de -ão: capitão(ã) → capitã / capitão", f("capitão(ã) da guarda", "mulher") === "capitã da guarda" && f("capitão(ã) da guarda", "homem") === "capitão da guarda");
  t("e o de -isa: sacerdote(isa) → sacerdotisa / sacerdote", f("sacerdote(isa)", "mulher") === "sacerdotisa" && f("sacerdote(isa)", "homem") === "sacerdote");
  t("o invariável fica (serviçal, guarda) e o homem não muda", f("serviçal", "mulher") === "serviçal" && f("guarda", "mulher") === "guarda" && f("músico", "homem") === "músico");
  t("sem género, ou lixo: devolve o que veio", f("taverneiro(a)", "") === "taverneiro(a)" && f(null, "mulher") === "" && f("x", null) === "x");
  let pistas = 0, neutras = 0, masculinas = 0;
  for (let i = 0; i < N; i++) {
    const { ab, semente, mapa, genero, molde } = abertura(i);
    if (!ab) continue;
    const q = MB.oQueExisteAqui(semente, mapa, ab.abertura.cidade, null, genero, molde, null);
    const p = q.gente.find((x) => x.nome === ab.abertura.pista.nome);
    if (!p) continue;
    pistas++;
    if (/\((a|ã)\)/.test(ab.abertura.pista.papel) || /\((a|ã)\)/.test(ab.abertura.sabe)) neutras++;
    if (p.genero_pessoa === "mulher" && /^\S+(o|or|ão)\b/.test(ab.abertura.pista.papel)) masculinas++;
  }
  t(`nenhuma pista sai com "(a)" (${neutras} em ${pistas})`, pistas > 0 && neutras === 0);
  t(`nenhuma mulher sai com o ofício no masculino (${masculinas} em ${pistas})`, pistas > 0 && masculinas === 0);
}

console.log(`\na abertura com nexo: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
