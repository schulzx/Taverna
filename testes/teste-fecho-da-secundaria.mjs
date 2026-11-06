/* ============================================================
   O FECHO DA SECUNDÁRIA PLANEADA (Fase SQ · a dívida de prova da SQ3, 05/11/2026)
   — testes/teste-fecho-da-secundaria.mjs

   A SQ3 deu à secundária um fecho que muda o mundo (src/secundaria-planeada.js,
   `lerSecundaria`), e o conferente das missões aplica-o quando ela conclui
   (src/motor/depois-do-turno.js, `conferirAsMissoes`, no
   `calou("o fecho da secundária")`). Aqui prova-se jogando a peça
   (depois-bloco.mjs: o motor não se lê pelo texto), um caso por tipo:
     · o laço  — quem pediu ganha o laço (`firmarLaco`);
     · o lugar — o sítio fica revelado na base (`revelar`);
     · a porta — as vizinhanças da cidade aparecem no mapa (`descobrirVizinhanca`).
   E o contraprova de cada um: a missão que só avança não fecha nada, e a
   que não é planeada conclui sem mexer no mundo.
   Suíte própria, e não em teste-motor-depois-do-turno: aquela prova a peça
   contra o dourado de um commit anterior à SQ3, e o dourado não muda.
   ============================================================ */
import { jogarODepois, aCenaQueConfere, aqui } from "./depois-bloco.mjs";
import { lerSecundaria, TETO_DAS_SECUNDARIAS } from "../src/secundaria-planeada.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);

const base = aCenaQueConfere();
const AQUI = aqui(base);
const QUEM = "Ana do Poço";
const VIZINHA = "Vau das Garças";
/* a planeada: o id diz o molde, o veículo diz que é planeada (o que
   `lerSecundaria` lê de volta — nenhum campo novo) */
const planeada = (molde, etapas, extra = {}) => ({
  id: `sq_${molde}_prova`, titulo: "Uma história pequena", tipo: "favor", status: "ativa",
  dador: QUEM, veiculo: TETO_DAS_SECUNDARIAS.veiculo, intencao: "secundaria", prazo: 6,
  recompensa: { moedas: 5, xp: 20 }, etapas, ...extra,
});
const chegar = () => ({ tipo: "ir_a", alvo: AQUI, feito: false });
const longe = () => ({ tipo: "ir_a", alvo: "Uma Cidade Que Não Há", feito: false });
const npcs = { [QUEM]: { nome: QUEM, cidade: AQUI } };
const mapa = {
  cidades: [{ nome: AQUI, descoberta: true }, { nome: VIZINHA, descoberta: false }],
  rotas: [{ de: AQUI, para: VIZINHA, dias: 1 }],
};
const conferir = (missao, sobre = {}) => {
  const estado = { ...aCenaQueConfere({ npcs, mapa, ...sobre }), missoes: [missao] };
  const j = jogarODepois("conferirAsMissoes", { estado, args: [estado.personagem || (estado.render || {}).personagem || { nome: "Vera", nivel: 3 }] });
  const fim = (n) => { const p = j.portas.filter((x) => x[0] === n); return p.length ? p[p.length - 1][1] : undefined; };
  return { j, fim, calou: j.portas.filter((x) => x[0] === "calou").map((x) => x[1]) };
};
const concluiu = (r) => ((r.fim("setMissoes") || [])[0] || {}).status === "concluida";

sec("1. O laço: quem pediu ganha o laço");
{
  const m = planeada("a_divida", [chegar()]);
  t("a forma lê o fecho do molde", (lerSecundaria(m) || {}).fecho && lerSecundaria(m).fecho.tipo === "laco" && lerSecundaria(m).fecho.quem === QUEM);
  const r = conferir(m);
  const ana = (r.fim("setNpcs") || {})[QUEM];
  t("a missão conclui", concluiu(r));
  t("e quem pediu fica com o laço do molde (dívida)", !!ana && !!ana.laco && ana.laco.tipo === "divida" && ana.laco.forca >= 1, JSON.stringify(ana && ana.laco));
  t("sem estourar (nada calado)", !r.calou.includes("o fecho da secundária"), r.calou.join(","));
  const so = conferir(planeada("a_divida", [chegar(), longe()]));
  t("contraprova: a que só avança não firma laço", so.fim("setNpcs") === undefined && !concluiu(so));
  const fora = conferir(planeada("a_divida", [chegar()], { dador: "Quem Ninguém Conhece" }));
  t("contraprova: quem pediu e não está no registo fica à espera — o fecho não cria gente", concluiu(fora) && fora.fim("setNpcs") === undefined);
}

sec("2. O lugar: o sítio fica revelado na base");
{
  const CHAVE = "sitio|prova|o-poco-velho";
  const m = planeada("o_sitio_que_esconde", [{ tipo: "revelar", alvo: "O Poço Velho", chave: CHAVE, feito: true }, chegar()], { prazo: 4 });
  t("a forma lê o fecho do molde", (lerSecundaria(m) || {}).fecho && lerSecundaria(m).fecho.tipo === "lugar" && lerSecundaria(m).fecho.chave === CHAVE);
  const r = conferir(m);
  const b = r.fim("setBaseMundo");
  t("a missão conclui", concluiu(r));
  t("e a chave do sítio entra nos revelados da base", !!b && Array.isArray(b.revelados) && b.revelados.includes(CHAVE), JSON.stringify(b && b.revelados));
  t("sem estourar (nada calado)", !r.calou.includes("o fecho da secundária"), r.calou.join(","));
  const nao = conferir({ ...m, id: "mc_nao_planeada", veiculo: undefined });
  t("contraprova: a que não é planeada conclui sem revelar nada", concluiu(nao) && nao.fim("setBaseMundo") === undefined);
}

sec("3. A porta: as vizinhanças aparecem no mapa");
{
  const m = planeada("a_estrada_para", [chegar()], { prazo: 8 });
  t("a forma lê o fecho do molde", (lerSecundaria(m) || {}).fecho && lerSecundaria(m).fecho.tipo === "porta" && lerSecundaria(m).fecho.cidade === AQUI);
  const r = conferir(m);
  const mp = r.fim("setMapa");
  const viz = mp && (mp.cidades || []).find((c) => c.nome === VIZINHA);
  t("a missão conclui", concluiu(r));
  t("e a cidade vizinha deixa de estar escondida", !!viz && viz.descoberta !== false, JSON.stringify(viz));
  const linhas = (r.j.portas.filter((x) => x[0] === "pushMsgs").flatMap((x) => x[1]) || []).map((x) => x.texto);
  t("e o relato diz o que se abriu, uma linha", linhas.filter((l) => l.startsWith("🧭 Para lá de " + AQUI) && l.includes(VIZINHA)).length === 1, linhas.join(" | "));
  t("sem estourar (nada calado)", !r.calou.includes("o fecho da secundária"), r.calou.join(","));
  const ja = conferir(m, { mapa: { ...mapa, cidades: mapa.cidades.map((c) => ({ ...c, descoberta: true })) } });
  t("contraprova: com tudo já descoberto, não mexe no mapa nem escreve", concluiu(ja) && ja.fim("setMapa") === undefined);
}

console.log(`\nfecho-da-secundaria: ${ok} passaram, ${mal} falharam`);
if (mal) process.exit(1);
