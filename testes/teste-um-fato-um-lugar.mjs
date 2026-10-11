/* UM FATO, UM LUGAR (nexo, 11/10)

   Duas contradições entre órgãos da 4.ª sessão (mente/mm11-sessao-4.md) eram
   o mesmo defeito visto de dois lados — um órgão a dizer ONDE alguém está de
   um jeito que outro desmentia:

     3. o passado que volta × o Geógrafo: "[O PASSADO VOLTA] … reaparece:
        Inocência" e, no mesmo pedido, "Inocência está a 8 h, não entra sem
        8 h narradas" (mestria.js);
     8. a procura × o mapa: "Noé está em Rua dos Retalhos", sem cidade — e o
        Narrador pôs a rua na cidade onde o herói estava, duas vezes
        (procura.js, a partir do marco da espinha);
   e, da 11 (o género), a procura dizia "ela" de toda a gente: "Noé … ela".

   A régua: a verdade é uma só, e quem a tem é o motor. A espinha nova guarda
   a CIDADE de cada marco (saga.js); a procura diz a rua e a cidade, e mede o
   rumo pela cidade; o passado diz QUE volta, não que entra pela porta.

   FALHA em HEAD (v9.374): o marco não tem cidade, a procura diz só a rua e
   "ela", e o passado "reaparece". */

import * as SG from "../src/saga.js";
import * as R from "../src/regiao.js";
import * as P from "../src/procura.js";
import * as ME from "../src/mestria.js";
import * as H from "../src/historia.js";
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

function campanha(i) {
  const semente = sementeDe(i), genero = generoDe(i), estrutura = ESTRUTURAS[i % ESTRUTURAS.length].id, molde = moldePorId("sobremundo");
  const mapa = R.mapaDaCampanhaNova(R.mapaDaCriacao({ semente, molde, genero, estrutura, modo: "historia" }));
  let esp = SG.estenderEspinha({ semente, mapa, genero, molde, estrutura, cidadeInicial: mapa.cidades[0].nome });
  esp = R.espinhaNaRegiao(mapa, esp, { semente, genero, molde });
  return { mapa, esp };
}

sec("1. o marco sabe em que cidade fica");
{
  let gente = 0, comCidade = 0, existe = 0;
  for (let i = 0; i < 40; i++) {
    const { mapa, esp } = campanha(i);
    for (const m of esp.atos.flatMap((a) => a.marcos)) {
      if (m.feitio !== "procurar" && m.feitio !== "descobrir") continue;
      gente++;
      if (m.cidade) comCidade++;
      if (mapa.cidades.some((c) => c.nome === m.cidade)) existe++;
    }
  }
  t(`todo marco de gente ou de lugar da cidade guarda a cidade (${comCidade}/${gente})`, gente > 0 && comCidade === gente);
  t(`e a cidade existe no mapa (${existe}/${gente})`, existe === gente);
  const { esp } = campanha(3);
  const volta = SG.garantirEspinha(JSON.parse(JSON.stringify(esp)));
  t("a cidade sobrevive ao save", JSON.stringify(volta.atos) === JSON.stringify(esp.atos));
  t("e a espinha antiga, sem ela, não ganha campo vazio", !("cidade" in SG.garantirEspinha({ atos: [{ marcos: [{ feitio: "procurar", quem: "Noé", onde: "Rua dos Retalhos" }] }] }).atos[0].marcos[0]));
}

sec("2. a procura diz a rua e a cidade, e o rumo sai da cidade");
{
  let procuras = 0, comCidade = 0, comRumo = 0, exemplo = "";
  for (let i = 0; i < 40; i++) {
    const { mapa, esp } = campanha(i);
    const base = mapa.cidades[0].nome;
    for (const m of esp.atos.flatMap((a) => a.marcos)) {
      if (m.feitio !== "procurar" || !m.cidade || m.cidade === base) continue;
      const r = P.procurarPessoa(m.quem, { espinha: esp, cidadeAtual: base, mapa });
      if (!r || r.desfecho !== "noutro_lugar") continue;
      procuras++;
      const env = P.envelopeDaProcura(r);
      if (env.includes(m.cidade)) comCidade++; else exemplo = exemplo || env.slice(0, 160);
      if (r.rumo) comRumo++;
    }
  }
  t(`a procura de quem mora noutra cidade diz a cidade (${comCidade}/${procuras})`, procuras > 0 && comCidade === procuras, exemplo);
  t(`e dá o rumo e a distância (${comRumo}/${procuras})`, procuras > 0 && comRumo === procuras);
  const velha = { atos: [{ marcos: [{ feitio: "procurar", quem: "Noé Laminado", onde: "Rua dos Retalhos" }] }] };
  const r = P.procurarPessoa("Noé", { espinha: velha, cidadeAtual: "Alto do Sal", mapa: null });
  t("a espinha antiga continua a responder (só a rua, como antes)", !!r && r.desfecho === "noutro_lugar" && r.onde === "Rua dos Retalhos");
  /* o homónimo: por pedaço, "Vex" achava "Vex Valdez", um marco antes, e a
     procura mandava o herói à cidade do outro (3 em 227 procuras medidas) */
  const dois = { atos: [{ marcos: [{ feitio: "procurar", quem: "Vex Valdez", onde: "O Armazém Girante", cidade: "Baixo da Fonte" }, { feitio: "procurar", quem: "Vex", onde: "O Posto da Sonda", cidade: "Velha da Fonte" }] }] };
  const rv = P.procurarPessoa("Vex", { espinha: dois, cidadeAtual: "Outra", mapa: null });
  t("com dois marcos de nome parecido, o nome inteiro ganha ao pedaço", !!rv && /Velha da Fonte/.test(rv.onde));
  t("e o pedaço continua a achar quando não há nome inteiro", /Baixo da Fonte/.test((P.procurarPessoa("Valdez", { espinha: dois, cidadeAtual: "Outra" }) || {}).onde || ""));
}

sec("3. a procura não decide o género de ninguém");
{
  const casos = ["aqui", "aqui_escondida", "noutro_lugar", "morta", "no_grupo", "ninguem"].map((desfecho) => P.envelopeDaProcura({ nome: "Noé", onde: "Rua dos Retalhos", desfecho, situacao: "livre" }) + " " + P.linhaDaProcura({ nome: "Noé", onde: "Rua dos Retalhos", desfecho }));
  /* \b do JS não conhece o "ã": "não faça" casava "o faça". A fronteira é
     a letra Unicode, à mão */
  const PRONOME = /(^|[^\p{L}])(ela|ele|encontrada|encontrado|achá-la|achá-lo|morta|morto|viva|vivo)(?![\p{L}])|Não a faça|Não o faça/iu;
  const culpados = casos.filter((x) => PRONOME.test(x));
  t(`nenhum envelope nem linha da procura diz "ela" ou "ele" da pessoa${culpados.length ? " — " + culpados[0].slice(0, 120) : ""}`, culpados.length === 0);
}

sec("4. o passado volta sem atravessar a estrada");
{
  const f = ME.FIOS_DA_MEMORIA.find((x) => x.id === "nome") || null;
  t("o fio de quem ficou para trás existe", !!f);
  t("e não manda reaparecer", !!f && !/reaparece/.test(f.diz));
  t("diz que de longe volta por notícia, e em pessoa só quem está aqui", !!f && /not[íi]cia/.test(f.diz) && /em pessoa/.test(f.diz));
  const env = ME.envelopeDoFio(ME.fioDaMemoria({ nomeEsquecido: { nome: "Inocência", vontade: "quer o alaúde de volta" } }, { sorte: () => 0 }));
  t("e o envelope leva isso inteiro", /Inocência/.test(env) && /not[íi]cia/.test(env));
}

sec("5. a história principal não sai da mesa quando chega um evento global");
{
  /* contradição 7: depois do Torneio das Coroas, as peças na mesa eram só o
     evento global, "que engole a região", e Noé saiu delas. A fiação (o App
     passar `principal` no motor do arco) é do frontend; aqui prova-se a regra */
  const com = H.resumoHistoria({ estrutura: "jornada", etapa: 2 }, { principal: "O rasto de Noé Laminado", global: "O Torneio das Coroas" });
  const sem = H.resumoHistoria({ estrutura: "jornada", etapa: 2 }, { global: "O Torneio das Coroas" });
  t("com a principal no motor, ela abre as peças", /PEÇAS[^\n]*: a história principal, "O rasto de Noé Laminado"/.test(com));
  t("e o evento global corre ao lado, sem engolir nada", /Torneio das Coroas", que corre ao lado/.test(com) && !/engole a região/.test(com));
  t("sem a principal, a frase é a de sempre", /que engole a região/.test(sem) && !/história principal/.test(sem));
  t("lixo no campo não entra", !/história principal/.test(H.resumoHistoria({ estrutura: "jornada", etapa: 2 }, { principal: 42, global: "X" })));
}

console.log(`\num fato, um lugar: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
