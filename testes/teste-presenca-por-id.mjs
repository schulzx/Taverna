/* A PRESENÇA POR ID (23/11/2026, identidade · etapa 2) — src/quem-esta-aqui.js,
   src/quem-e-quem.js, e quem delega a eles (o ouvido, a cena do ouvido, a porta
   única, os adaptadores por nome).

   A ordem da pessoa: «mesmo que tenha dois fulanos, o sistema vai saber qual é
   que está em cena». Esta suíte prova o MECANISMO — os nomes são de prova; as
   duas «Tabitha» copiam a forma da gente da base de um save real da décima
   quinta sessão (a taverneira d'A Lâmpada dos Sonhos e a recruta da Praça de
   Armas, na mesma cidade), e podiam ser outras:
   §1 quemEstaAqui dá o id a cada entrada (aditivo), e o homônimo do registo
      tem o dele;
   §2 dois homônimos, um presente e um longe: a frase com o primeiro nome dá o
      presente — e o id dele —, pela presença única e pela cena do ouvido;
   §3 dois homônimos presentes dão os dois candidatos (o «qual», com os dois
      ids), e a escolha leva o id;
   §4 a pessoa que a tela mostra é a que o ouvido recebe;
   §5 o morto é morto pelo id;
   §6 o save sem o campo `pessoas` funciona;
   §7 os adaptadores por nome delegam ao catálogo e levam o id;
   §8 sem ids, as listas de antes respondem como antes. */
import { quemEstaAqui, quemAgeAqui, aPresencaUnica, quemONomeDiz, aCasaNaBase } from "../src/quem-esta-aqui.js";
import { candidatos, catalogoDasListas, aReguaDoDito, oNomeDitoDiz, idNaPresenca, idsDaGente, CASA_O_DITO, QUEM_E_QUEM_DITO } from "../src/quem-e-quem.js";
import { aCenaDoOuvido } from "../src/motor/a-cena-do-ouvido.js";
import { aPortaUnica } from "../src/motor/uma-porta-so.js";
import { oOuvido } from "../src/o-ouvido.js";
import { mesmaPessoa } from "../src/missoes.js";
import { nomeProcurado } from "../src/procura.js";
import { quemDaFrase } from "../src/o-veredito-da-troca.js";
import { estadoDoSave } from "../src/estado.js";
import { osAusentes } from "../src/motor/poda-do-ausente.js";
import { pessoaDoLivro } from "../src/livro-de-factos.js";

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);

/* ---------------- o estado, na forma do save ---------------- */
const CIDADE = "Rio do Martelo";
const gente = (id, local, papel, extra = {}) => ({ id, nome: "Tabitha", raca: "humano", genero_pessoa: "mulher", papel, traco: "", modo: "", vontade: "", local, cidade: CIDADE, ...extra });
const TAVERNA = "A Lâmpada dos Sonhos", PRACA = "A Praça de Armas do Afogado";
const GENTE = [gente(`${CIDADE}|taverna|0`, TAVERNA, "taverneiro(a)"), gente(`${CIDADE}|quartel|1`, PRACA, "recruta")];
const ficha = (nome, extra = {}) => ({ conhecidoEm: 0, nome, papel: "", relacao: "aliado", genero: "mulher", local: CIDADE, status: "vivo", segredo: "", notas: "", ...extra });
const NPCS = { "Lavinia Sallow": ficha("Lavinia Sallow", { papel: "mestra de ofício, Mago" }) };
const MAPA = { cidades: [{ nome: CIDADE, tipo: "capital", porte: "capital", locais: [], x: 50, y: 50, descoberta: true, pisada: true }] };
const LUGARES = [{ nome: TAVERNA }, { nome: PRACA }];
const estado = (lugar, extra = {}) => ({ npcs: NPCS, cidadeAtual: CIDADE, mapa: MAPA, grupo: [], lugar: { nome: lugar, cidade: CIDADE, distancia: "dentro" }, lugares: LUGARES, gente: GENTE, porId: true, ...extra });
const [ID1, ID2] = idsDaGente(GENTE, CIDADE);

/* a presença única e o retrato do ouvido, como o App os monta (presencaAgora, retratoDoOuvido) */
function presencaDe(e, tela = []) {
  const q = quemEstaAqui(e);
  const aus = osAusentes(q, { gente: e.gente, npcs: e.npcs, heroi: { nome: "Barnabas" }, lugar: e.lugar });
  return aPresencaUnica(q, { npcs: e.npcs, gente: e.gente, grupo: e.grupo, cidade: e.cidadeAtual, heroi: { nome: "Barnabas" }, pessoas: e.pessoas, ausentes: aus, tela });
}
function cenaDe(P) {
  return aCenaDoOuvido({
    lugar: { nome: "", tipo: "" },
    pessoas: P.aqui.map((p) => ({ id: p.id, nome: p.nome, papel: p.papel })),
    grupo: [],
    ausentes: [...P.noutroSitio, ...P.longe].map((a) => ({ id: a.id, nome: a.nome, onde: a.onde, morto: false })).concat(P.mortos.map((m) => ({ id: m.id, nome: m.nome, morto: true }))),
    conhecidos: P.conhecidos.map((c) => ({ id: c.id, nome: c.nome })),
    ficha: { moedas: 20, inventario: [] },
  });
}

/* ============================================================ */
sec("§1 quemEstaAqui dá o id a cada entrada");
{
  const q = quemEstaAqui(estado(TAVERNA));
  const todas = [...q.aqui, ...q.longe, ...q.doSitio, ...q.doPasso];
  t("toda entrada leva um id", todas.length > 0 && todas.every((x) => typeof x.id === "string" && x.id), J(todas.map((x) => [x.nome, x.id])));
  t("a taverneira do sítio tem o id da base (o primeiro, sem número)", q.doSitio.some((x) => x.nome === "Tabitha" && x.id === ID1) && ID1 === `${CIDADE}|gente|Tabitha`);
  t("e a homônima da praça tem o dela (~2), pela ordem da base", ID2 === `${CIDADE}|gente|Tabitha~2`);
  const q2 = quemEstaAqui({ npcs: { Hilda: ficha("Hilda"), "Hilda~2": ficha("Hilda", { papel: "guarda" }) }, cidadeAtual: CIDADE, mapa: MAPA });
  t("o homônimo do registo (Hilda e Hilda~2) dá dois ids", J(q2.aqui.map((x) => x.id)) === J(["npc|Hilda", "npc|Hilda~2"]));
  const sem = quemEstaAqui({ ...estado(TAVERNA), porId: false });
  t("sem a chave, os nomes das listas são os mesmos (o id é só a mais)", J(sem.doSitio.map((x) => x.nome)) === J(q.doSitio.map((x) => x.nome)) && J(sem.aqui.map((x) => x.nome)) === J(q.aqui.map((x) => x.nome)));
}

/* ============================================================ */
sec("§2 dois homônimos, um presente e um longe: o primeiro nome dá o presente");
{
  const P = presencaDe(estado(TAVERNA));
  t("a presença única põe a taverneira aqui, pelo id", P.aqui.some((p) => p.id === ID1));
  t("e a recruta não está aqui (está noutro balde, com o id dela)", !P.aqui.some((p) => p.id === ID2) && [...P.longe, ...P.noutroSitio, ...P.conhecidos].some((p) => p.id === ID2));
  t("cada id num balde só", (() => { const ids = [...P.aqui, ...P.noutroSitio, ...P.longe, ...P.mortos, ...P.conhecidos].map((p) => p.id); return ids.length === new Set(ids).size; })());
  const cena = cenaDe(P);
  t("a cena do ouvido leva as duas — uma em pessoas, outra entre os ausentes —, cada uma com o seu id", cena.pessoas.some((p) => p.id === ID1) && cena.ausentes.includes("Tabitha") && cena.ids.ausentes.includes(ID2));
  const l = oOuvido("dou duas moedas para a Tabitha", cena);
  t("«dou duas moedas para a Tabitha» é a que está, e o quemId é o dela", l.quem === "Tabitha" && l.quemEstado === "aqui" && l.quemId === ID1, J({ q: l.quem, e: l.quemEstado, id: l.quemId }));
  const l2 = oOuvido("dou duas moedas para a Tabitha", cenaDe(presencaDe(estado(PRACA))));
  t("na praça, a mesma frase é a recruta (o outro id)", l2.quemEstado === "aqui" && l2.quemId === ID2, J({ e: l2.quemEstado, id: l2.quemId }));
  const r = quemONomeDiz("Tabitha", { aqui: [{ nome: "Tabitha", id: ID1 }], longe: [{ nome: "Tabitha", id: ID2, onde: PRACA }] });
  t("quemONomeDiz: o presente ganha do homônimo de longe, com o id", r.estado === "aqui" && r.id === ID1);
}

/* ============================================================ */
sec("§3 dois homônimos presentes: os dois candidatos, sem escolher");
{
  const r = quemONomeDiz("Tabitha", { aqui: [{ nome: "Tabitha", id: ID1 }, { nome: "Tabitha", id: ID2 }] });
  t("quemONomeDiz devolve «qual» com os dois ids", r.estado === "qual" && J(r.ids) === J([ID1, ID2]));
  const cena = aCenaDoOuvido({ pessoas: [{ id: ID1, nome: "Tabitha", papel: "taverneira" }, { id: ID2, nome: "Tabitha", papel: "recruta" }], ficha: { moedas: 20 } });
  t("a cena do ouvido não funde os dois (dedupe pelo id)", cena.pessoas.length === 2);
  const l = oOuvido("dou duas moedas para a Tabitha", cena);
  t("o ouvido pergunta qual, com os dois ids", l.quemEstado === "qual" && J(l.opcoesIdsDeQuem) === J([ID1, ID2]), J({ e: l.quemEstado, ids: l.opcoesIdsDeQuem }));
  const retrato = { lugar: { nome: TAVERNA, tipo: "taverna" }, pessoas: [{ id: ID1, nome: "Tabitha", papel: "taverneira" }, { id: ID2, nome: "Tabitha", papel: "recruta" }], grupo: [], bancas: [], ausentes: [], conhecidos: [], chao: [], ficha: { moedas: 20, inventario: [] } };
  const r1 = aPortaUnica("dou duas moedas para a Tabitha", retrato, {});
  const ops = (r1 && r1.pergunta && r1.pergunta.opcoes) || [];
  t("a porta única abre a pergunta com duas opções, cada uma com o seu id", r1 && r1.caminho === "pergunta" && ops.length === 2 && J(ops.map((o) => o.id)) === J([ID1, ID2]), J(r1 && { c: r1.caminho, ops }));
  const r2 = r1 && r1.pergunta ? aPortaUnica("2", retrato, { pendente: r1.pergunta }) : null;
  const leitura = r2 && (r2.leitura || (r2.veredito && r2.veredito.leitura) || null);
  t("e a escolha «2» completa a leitura com o id da segunda", !!r2 && J(r2).includes(ID2) && !J(r2).includes(`"quemId":"${ID1}"`), J(leitura || r2).slice(0, 200));
  const sem = quemONomeDiz("Tabitha", { aqui: ["Tabitha", "Tabitha"] });
  t("sem ids, o mesmo nome escrito duas vezes continua a ser um (como antes)", sem.estado === "aqui" && sem.nome === "Tabitha");
}

/* ============================================================ */
sec("§4 a pessoa que a tela mostra é a que o ouvido recebe");
{
  const npcs = { ...NPCS, "Mercy Quintus": ficha("Mercy Quintus", { local: "Vau Distante" }), "Mercy Ottoline": ficha("Mercy Ottoline", { local: "Vau Distante" }) };
  const e = estado(TAVERNA, { npcs });
  const P = presencaDe(e, [{ nome: "Mercy Quintus" }]);
  const mq = P.aqui.find((p) => p.nome === "Mercy Quintus");
  t("quem a tela mostra entra no «aqui» da presença única, com o id do catálogo", !!mq && mq.id === "npc|Mercy Quintus" && mq.deOnde === "tela");
  t("a homônima de primeiro nome fica fora do «aqui»", !P.aqui.some((p) => p.nome === "Mercy Ottoline"));
  const l = oOuvido("dou uma moeda para a Mercy", cenaDe(P));
  t("«dou uma moeda para a Mercy» é a da tela — o mesmo id", l.quemEstado === "aqui" && l.quemId === mq.id, J({ e: l.quemEstado, id: l.quemId, q: l.quem }));
}

/* ============================================================ */
sec("§5 o morto é morto pelo id");
{
  const npcs = { ...NPCS, "Hilda Ferro": ficha("Hilda Ferro", { status: "morta" }), "Hilda Lima": ficha("Hilda Lima") };
  const P = presencaDe(estado(TAVERNA, { npcs, lugar: null, lugares: [] }));
  t("a morta está entre os mortos pelo id, e a viva não", P.mortos.some((m) => m.id === "npc|Hilda Ferro") && !P.mortos.some((m) => m.id === "npc|Hilda Lima"));
  t("a morta nunca está aqui", !P.aqui.some((p) => p.id === "npc|Hilda Ferro"));
  const cena = cenaDe(P);
  const l = oOuvido("dou uma moeda para Hilda Ferro", cena);
  t("«dou uma moeda para Hilda Ferro» lê a morta, com o id", l.quemEstado === "morto" && l.quemId === "npc|Hilda Ferro", J({ e: l.quemEstado, id: l.quemId }));
  const l2 = oOuvido("dou uma moeda para Hilda Lima", cena);
  t("e «Hilda Lima» é a viva, com o outro id", l2.quemEstado !== "morto" && l2.quemId === "npc|Hilda Lima", J({ e: l2.quemEstado, id: l2.quemId }));
  /* o fato gravado sob o apelido (`npc|Brannoc`, o registo) é da pessoa da base que o catálogo funde nele */
  const gB = { id: `${CIDADE}|forja|0`, nome: "Brannoc Ferro", papel: "ferreiro", local: "A Forja Velha", cidade: CIDADE };
  const eB = estado(TAVERNA, { npcs: { ...NPCS, Brannoc: ficha("Brannoc") }, gente: [...GENTE, gB] });
  const factos = { pessoas: { "npc|Brannoc": { nome: "Brannoc", derrotado: { como: "morto", dia: 3 } } } };
  const qB = quemEstaAqui(eB);
  const PB = aPresencaUnica(qB, { npcs: eB.npcs, gente: eB.gente, cidade: CIDADE, ausentes: [], factos });
  const idB = idsDaGente(eB.gente, CIDADE)[2];
  t("o morto do livro gravado como npc|Brannoc é o Brannoc Ferro da base, pelo alias", PB.mortos.some((m) => m.id === idB) && !PB.aqui.some((p) => p.id === idB), J(PB.mortos));
  t("pessoaDoLivro com o alias acha o fato pelo id do catálogo", pessoaDoLivro(factos, idB, { alias: { "npc|Brannoc": idB } }) === "npc|Brannoc" && pessoaDoLivro(factos, idB) === "");
  const r = quemONomeDiz("Hilda", { aqui: [], longe: [{ nome: "Hilda", id: "npc|Hilda", morto: true }, { nome: "Hilda", id: "npc|Hilda~2", onde: "Vau" }] });
  t("dois homônimos fora, um morto e um vivo, não se fundem: ficam os dois em aberto", r.estado === "longe" && r.ids.length === 2);
}

/* ============================================================ */
sec("§6 o save sem o campo `pessoas`");
{
  const save = estadoDoSave({ npcs: NPCS, cidadeAtual: CIDADE, mapa: MAPA });
  t("o save de antes não tem `pessoas`, e o estado o lê como null", save.pessoas == null);
  const P = presencaDe({ ...estado(TAVERNA), pessoas: save.pessoas });
  t("e a presença única responde igual, com os ids derivados", P.aqui.some((p) => p.id === ID1));
  let ok = true;
  try { aPresencaUnica(null, null); aPresencaUnica({}, { pessoas: { lixo: 1 } }); quemEstaAqui(null); } catch { ok = false; }
  t("lixo e null não estouram", ok);
}

/* ============================================================ */
sec("§7 os adaptadores por nome delegam ao catálogo");
{
  t("a régua do dito é tabela", J(QUEM_E_QUEM_DITO.regua) === J(["inteiro", "presente", "cidade", "unico"]) && typeof CASA_O_DITO.dito === "function");
  t("o nível «dito»: o primeiro nome basta, o sobrenome dito separa", CASA_O_DITO.dito(["ulric"], ["ulric", "coracao-de-ferro"]) && !CASA_O_DITO.dito(["ulric", "coracao-de-ferro"], ["ulric", "olho-de-corvo"]));
  const cat = catalogoDasListas({ aqui: [{ nome: "Tabitha", id: ID1 }], longe: [{ nome: "Tabitha", id: ID2, daCidade: true }] });
  const cs = candidatos("Tabitha", cat, null, { niveis: ["dito"] });
  t("candidatos dá os dois, cada um com o seu estado", J(cs.map((c) => [c.id, c.estado])) === J([[ID1, "aqui"], [ID2, "longe"]]));
  t("a régua: o presente ganha", aReguaDoDito(cs, "Tabitha").um.id === ID1);
  const fora = catalogoDasListas({ longe: [{ nome: "Brom", id: "a" }, { nome: "Brom", id: "b", daCidade: true }] });
  t("a régua: fora, quem é da cidade ganha", oNomeDitoDiz("Brom", fora).um.id === "b");
  const inteiro = catalogoDasListas({ aqui: [{ nome: "Ulric Olho-de-Corvo", id: "a" }], longe: [{ nome: "Ulric Coração-de-Ferro", id: "b" }] });
  t("a régua: o nome inteiro dito decide, mesmo contra quem está", oNomeDitoDiz("Ulric Coração-de-Ferro", inteiro).um.id === "b");
  const usados = new Set();
  const catG = catalogoDasListas({ conhecidos: [{ nome: "Tabitha", id: ID1 }, { nome: "Tabitha", id: ID2 }] });
  t("idNaPresenca dá dois ids a dois nomes iguais numa lista", idNaPresenca("Tabitha", catG, { usados }) === ID1 && idNaPresenca("Tabitha", catG, { usados }) === ID2);
  t("mesmaPessoa: com ids, compara os ids (dois homônimos são dois)", !mesmaPessoa({ nome: "Tabitha", id: ID1 }, { nome: "Tabitha", id: ID2 }) && mesmaPessoa({ nome: "Tabitha", id: ID1 }, { nome: "Tabitha", id: ID1 }));
  t("mesmaPessoa: sem ids, o primeiro nome (o de sempre)", mesmaPessoa("Marl", "Marl de Osso") && !mesmaPessoa("Al", "Al Moura"));
  t("nomeProcurado: quem está perto pelo id", nomeProcurado("procuro a Tabitha", [{ nome: "Tabitha", id: ID2 }], { perto: [{ nome: "Tabitha", id: ID2 }] }) === "Tabitha");
  const qd = quemDaFrase("dou a moeda à Tabitha", [{ nome: "Tabitha", id: ID1 }, { nome: "Tabitha", id: ID2 }]);
  t("quemDaFrase: dois presentes de mesmo nome dão o «qual» com os ids", !!qd && J(qd.quais) === J([ID1, ID2]), J(qd));
  const qd1 = quemDaFrase("dou a moeda à Tabitha", [{ nome: "Tabitha", id: ID1 }]);
  t("quemDaFrase: um presente leva o id", !!qd1 && qd1.id === ID1);
  t("aCasaNaBase: homônimos com posto não viram uma casa só", aCasaNaBase("Tabitha", GENTE) === null);
  const casa = aCasaNaBase("Tabitha", [GENTE[0]]);
  t("aCasaNaBase: uma só, a casa vem com o id dela", !!casa && casa.local === TAVERNA && casa.id === GENTE[0].id);
  t("quemAgeAqui leva o id de quem o sítio põe", quemAgeAqui(quemEstaAqui(estado(TAVERNA))).some((p) => p.id === ID1));
}

/* ============================================================ */
sec("§8 sem ids, as listas de antes respondem como antes");
{
  const r = quemONomeDiz("Ulric", { aqui: ["Ulric Coração-de-Ferro"], longe: [{ nome: "Ulric Olho-de-Corvo", onde: "Vau" }] });
  t("o primeiro nome com um presente e um ausente: o presente", r.estado === "aqui" && r.nome === "Ulric Coração-de-Ferro");
  const r2 = quemONomeDiz("Ulric Olho-de-Corvo", { aqui: ["Ulric Coração-de-Ferro"], longe: [{ nome: "Ulric Olho-de-Corvo", onde: "Vau" }] });
  t("o nome inteiro do ausente: está longe, com onde", r2.estado === "longe" && r2.onde === "Vau");
  const r3 = quemONomeDiz("Constance", { aqui: [], longe: [], conhecidos: ["Constance"] });
  t("o conhecido sem onde: longe", r3.estado === "longe" && r3.nome === "Constance");
  t("ninguém: ninguem", quemONomeDiz("Zé", { aqui: ["Brom"] }).estado === "ninguem");
}

console.log(`\n${bons} ok · ${maus} falhas`);
if (maus) process.exit(1);
