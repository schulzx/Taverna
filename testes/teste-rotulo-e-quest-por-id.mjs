/* O RÓTULO E A QUEST POR ID (23/11/2026, identidade · etapas 3 e 4) —
   src/quem-esta-aqui.js (rotulosDosHomonimos, oQualComRotulos,
   aEscolhaDoQual, comRotuloDoHomonimo, e quem decide pelo id), src/npcs.js
   (nomeComDono e o segundo homônimo), src/quem-e-quem.js (aliasDaPessoa) e
   src/condicoes-da-quest.js (o papel do homônimo e a leitura pelo apelido).

   A ordem da pessoa: «mesmo que tenha dois fulanos, o sistema vai saber qual
   é que está em cena». Esta suíte prova o MECANISMO; os nomes são de prova.
   As duas «Tabitha» saem da semente de um save real da décima quinta sessão
   (a taverneira d'A Lâmpada dos Sonhos e a recruta da Praça de Armas, na
   mesma cidade), lido por chave quando existe na máquina; sem ele, a mesma
   forma, escrita aqui.
   §1 o «qual» com rótulos distintos; número, nome inteiro e rótulo dão o id;
   §2 o segundo homônimo entra no registo e é achado depois;
   §3 um save antigo, sem nada disto, abre e resolve igual;
   §4 a pauta com dois homônimos em cena leva os dois rótulos e cabe no teto;
   §5 o que decidia por nome decide pelo id;
   §6 a quest cujo papel é uma de duas homônimas só anda com a certa;
   §7 o fato gravado como npc|Nome conta para a pessoa da base pelo alias;
   §8 um save antigo termina uma quest. */
import fs from "node:fs";
import { quemEstaAqui, rotulosDosHomonimos, oQualComRotulos, aEscolhaDoQual, comRotuloDoHomonimo, contextoDeQuemEsta,
  quemEstaNoutroSitio, naoEstaoAqui, oMesmoPorId, ROTULO_DO_HOMONIMO } from "../src/quem-esta-aqui.js";
import { idsDaGente, catalogoDoElenco, aliasDaPessoa, genteDaCidade, ALIAS_DA_PESSOA } from "../src/quem-e-quem.js";
import { nomeComDono, criarNPC, SEGUNDO_HOMONIMO } from "../src/npcs.js";
import { aplicarORegisto, contextoDoNomeCom } from "../src/motor/aplicar.js";
import { osAusentes, podarOAusente } from "../src/motor/poda-do-ausente.js";
import { montarEmCena, pautaComEmCena } from "../src/em-cena.js";
import { garantirPauta, porNaPauta, textoDaPauta, TETO_DA_PAUTA } from "../src/pauta.js";
import { avaliarCondicao, julgarEtapa, resolverPapeis } from "../src/condicoes-da-quest.js";
import { pessoaDoLivro } from "../src/livro-de-factos.js";
import { aPortaUnica } from "../src/motor/uma-porta-so.js";
import { estadoDoSave } from "../src/estado.js";

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);

/* ---------------- o estado, na forma do save ---------------- */
const SAVE = "C:/Users/clara/AppData/Local/Temp/claude/d5096f640d890ce8/5ad2bcc2-86e0-4c17-97ea-cf2402e06ad8/scratchpad/s15-save.json";
let save = null;
try { save = JSON.parse(fs.readFileSync(SAVE, "utf8")); } catch { save = null; }
const CIDADE = "Rio do Martelo";
const TAVERNA = "A Lâmpada dos Sonhos", PRACA = "A Praça de Armas do Afogado";
const gente = (id, local, papel) => ({ id, nome: "Tabitha", raca: "humano", genero_pessoa: "mulher", papel, traco: "", modo: "", vontade: "", local, cidade: CIDADE });
const GENTE = [gente(`${CIDADE}|taverna|0`, TAVERNA, "taverneiro(a)"), gente(`${CIDADE}|quartel|1`, PRACA, "recruta")];
/* as duas no MESMO sítio (a recruta foi beber à taverna) */
const JUNTAS = [gente(`${CIDADE}|taverna|0`, TAVERNA, "taverneira"), gente(`${CIDADE}|taverna|1`, TAVERNA, "recruta")];
const ficha = (nome, extra = {}) => ({ conhecidoEm: 0, nome, papel: "", relacao: "aliado", genero: "mulher", local: CIDADE, status: "vivo", segredo: "", notas: "", ...extra });
const MAPA = { cidades: [{ nome: CIDADE, tipo: "capital", porte: "capital", locais: [], x: 50, y: 50, descoberta: true, pisada: true }] };
const LUGARES = [{ nome: TAVERNA }, { nome: PRACA }];
const estado = (lugar, extra = {}) => ({ npcs: {}, cidadeAtual: CIDADE, mapa: MAPA, grupo: [], lugar: { nome: lugar, cidade: CIDADE, distancia: "dentro" }, lugares: LUGARES, gente: GENTE, porId: true, ...extra });
const [ID1, ID2] = idsDaGente(GENTE, CIDADE);

/* ============================================================ */
sec("§1 o «qual» com rótulos distintos");
{
  const q = quemEstaAqui(estado(TAVERNA, { gente: JUNTAS }));
  const [J1, J2] = idsDaGente(JUNTAS, CIDADE);
  t("com a chave, as duas estão no sítio, cada uma com o seu id", J(q.doSitio.map((x) => x.id)) === J([J1, J2]), J(q.doSitio));
  const retrato = { lugar: { nome: TAVERNA, tipo: "taverna" }, pessoas: q.doSitio.map((x) => ({ id: x.id, nome: x.nome, papel: x.rotulo })), grupo: [], bancas: [], ausentes: [], conhecidos: [], chao: [], ficha: { moedas: 20, inventario: [] } };
  const r1 = aPortaUnica("dou duas moedas para a Tabitha", retrato, {});
  const ops0 = (r1 && r1.pergunta && r1.pergunta.opcoes) || [];
  t("a porta única pergunta qual (as duas opções com o mesmo nome e os dois ids)", ops0.length === 2 && J(ops0.map((o) => o.id)) === J([J1, J2]), J(ops0));
  const ops = oQualComRotulos(ops0, retrato.pessoas);
  t("oQualComRotulos dá rótulos distintos (o ofício)", ops[0].rotulo !== ops[1].rotulo && /taverneira/.test(ops[0].rotulo) && /recruta/.test(ops[1].rotulo), J(ops.map((o) => o.rotulo)));
  t("e não muda o valor nem o id", J(ops.map((o) => [o.valor, o.id])) === J(ops0.map((o) => [o.valor, o.id])));
  t("a escolha por número dá o id", aEscolhaDoQual("2", ops).id === J2);
  t("a escolha pelo rótulo inteiro dá o id", aEscolhaDoQual(ops[1].rotulo, ops).id === J2);
  t("a escolha por uma palavra que só um rótulo tem dá o id («a recruta»)", aEscolhaDoQual("a recruta", ops).id === J2 && aEscolhaDoQual("a taverneira", ops).id === J1);
  t("o nome que as duas têm não escolhe", aEscolhaDoQual("Tabitha", ops) === null);
  const outras = oQualComRotulos([{ valor: "Hilda Ferro", id: "npc|Hilda Ferro" }, { valor: "Hilda Lima", id: "npc|Hilda Lima" }], []);
  t("sem ofício nem lugar, o nome inteiro distingue, e a escolha pelo nome inteiro dá o id", outras[0].rotulo === "Hilda Ferro" && aEscolhaDoQual("Hilda Lima", outras).id === "npc|Hilda Lima");
  const iguais = rotulosDosHomonimos([{ id: "a", nome: "Brom" }, { id: "b", nome: "Brom" }]);
  t("nada distingue: o número da ordem, e o rótulo nunca se repete", iguais.get("a") !== iguais.get("b") && iguais.get("b") === ROTULO_DO_HOMONIMO.ordem("Brom", 2));
  t("lista sem homônimo: nenhum rótulo", rotulosDosHomonimos([{ id: "a", nome: "Brom" }, { id: "b", nome: "Tabitha" }]).size === 0);
}

/* ============================================================ */
sec("§2 o segundo homônimo entra no registo e é achado depois");
{
  const reg = { Hilda: ficha("Hilda", { papel: "taverneira" }) };
  const ctx = { porId: true, papel: "guarda", genero: "mulher", aqui: [CIDADE] };
  const v = nomeComDono("Hilda", reg, ctx);
  t("com a chave, a guarda de mesmo nome é «homonimo», na chave numerada", v.decisao === "homonimo" && v.chave === "Hilda~2" && v.nome === "Hilda" && v.id === "npc|Hilda~2", J(v));
  t("sem a chave, a régua de antes (funde na primeira)", nomeComDono("Hilda", reg, { ...ctx, porId: false }).chave === "Hilda");
  t("o que muda com o tempo não faz nascer ninguém: o mesmo ofício é ela", nomeComDono("Hilda", reg, { ...ctx, papel: "taverneira" }).chave === "Hilda");
  t("os motivos que separam são tabela", J(SEGUNDO_HOMONIMO.separam) === J(["sexo", "oficio", "sobrenome"]));
  /* a porta do registo (aplicarORegisto), com a chave que o App põe na base do nome */
  const e0 = { npcs: reg, canone: {}, mapa: MAPA, cidadeAtual: CIDADE, dia: 3, npcTurno: 5 };
  const r = aplicarORegisto(e0, { mudancas: { npcs: [{ nome: "Hilda", papel: "guarda", genero: "mulher", local: CIDADE }] } }, { baseDoNome: { porId: true, aqui: [CIDADE] }, modoDoNarrador: "mestre" });
  const npcs = r.estado.npcs;
  t("aplicarORegisto cria a ficha em Hilda~2 com o nome Hilda, e a primeira fica intacta", npcs["Hilda~2"] && npcs["Hilda~2"].nome === "Hilda" && npcs["Hilda~2"].papel === "guarda" && npcs.Hilda.papel === "taverneira", J(Object.keys(npcs)));
  t("contextoDoNomeCom só leva a chave quando ela vem", contextoDoNomeCom({ porId: true }, {}).porId === true && !("porId" in contextoDoNomeCom({}, {})));
  const v2 = nomeComDono("Hilda", npcs, ctx);
  t("depois, a guarda dita outra vez é achada (Hilda~2), sem nascer a terceira", v2.decisao === "mesma" && v2.chave === "Hilda~2", J(v2));
  const cat = catalogoDoElenco({ npcs, cidade: CIDADE });
  t("o catálogo dá dois ids, npc|Hilda e npc|Hilda~2", !!cat.porId["npc|Hilda"] && !!cat.porId["npc|Hilda~2"]);
  const q = quemEstaAqui({ npcs, cidadeAtual: CIDADE, mapa: MAPA, porId: true });
  t("e a presença tem as duas, cada uma com o seu id", J(q.aqui.map((x) => x.id)) === J(["npc|Hilda", "npc|Hilda~2"]));
}

/* ============================================================ */
sec("§3 um save antigo abre e resolve igual");
{
  const base = save || { npcs: { "Lavinia Sallow": ficha("Lavinia Sallow") }, cidadeAtual: CIDADE, mapa: MAPA };
  const e = estadoDoSave(base);
  t("o save de antes abre sem campo novo (pessoas null)", e.pessoas == null);
  const reg = e.npcs || {};
  const nomes = Object.keys(reg);
  t("nomeComDono sem a chave responde como antes para cada nome do registo", nomes.every((n) => nomeComDono(n, reg, {}).decisao === "mesma"));
  t("e com a chave também (nenhum deles é outra pessoa)", nomes.every((n) => { const v = nomeComDono(n, reg, { porId: true }); return v.decisao === "mesma" && v.chave === n; }));
  const sem = quemEstaAqui({ ...e, porId: false }), com = quemEstaAqui({ ...e, porId: true });
  t("quemEstaAqui: os nomes da presença iguais com e sem a chave", J(sem.aqui.map((x) => x.nome)) === J(com.aqui.map((x) => x.nome)));
  t("comRotuloDoHomonimo sem a chave devolve o mesmo objeto", comRotuloDoHomonimo(sem) === sem);
  t("oQualComRotulos sem ids devolve as opções como vieram", J(oQualComRotulos([{ rotulo: "Brom", valor: "Brom" }], [])) === J([{ rotulo: "Brom", valor: "Brom" }]));
}

/* ============================================================ */
sec("§4 a pauta com dois homônimos em cena: os dois rótulos, dentro do teto");
{
  const [J1, J2] = idsDaGente(JUNTAS, CIDADE);
  const ctxCena = (q) => ({ semente: "prova", cidade: CIDADE, grupo: [], comigo: [], mostrado: [], lugar: { nome: TAVERNA }, ...contextoDeQuemEsta(q) });
  const qSem = quemEstaAqui(estado(TAVERNA, { gente: JUNTAS, porId: false }));
  const qCom = quemEstaAqui(estado(TAVERNA, { gente: JUNTAS }));
  const antes = montarEmCena(ctxCena(qSem)).filter((x) => x.tipo === "pessoa");
  const depois = montarEmCena(ctxCena(comRotuloDoHomonimo(qCom))).filter((x) => x.tipo === "pessoa");
  t("sem a chave, o EM CENA juntava as duas numa (o defeito)", antes.length === 1, J(antes.map((x) => x.nome)));
  t("com a chave, as duas, cada uma pelo rótulo no lugar do nome", depois.length === 2 && depois.some((x) => /taverneira/.test(x.nome)) && depois.some((x) => /recruta/.test(x.nome)), J(depois.map((x) => x.nome)));
  /* o pior caso: a pauta cheia até perto do teto (cada secção que o turno pode trazer) */
  const cheia = () => {
    let p = garantirPauta(null);
    p = porNaPauta(p, "fato", "O herói pagou 12 moedas à taverneira pela ceia e pelo quarto; a recruta viu e calou-se, de copo na mão.");
    p = porNaPauta(p, "naoPode", "pôr a agir ou a falar quem não está nesta cena: Brannoc Ferro (ficou em A Forja Velha); aqui estão Tabitha", "entregar o que a bolsa não pagou");
    p = porNaPauta(p, "acabou", "a luta acabou: os dois salteadores fugiram pela viela, um deles ferido na perna.");
    for (let i = 0; i < 12; i++) p = porNaPauta(p, "naoPode", `veto de prova número ${i} com texto bastante para ocupar a pauta até perto do teto dela`);
    return p;
  };
  const tamanho = (lista) => textoDaPauta(pautaComEmCena(cheia(), lista, { turno: 7 }), { turno: 7 }).length;
  const listaAntes = montarEmCena(ctxCena(qSem)), listaDepois = montarEmCena(ctxCena(comRotuloDoHomonimo(qCom)));
  const nA = tamanho(listaAntes), nD = tamanho(listaDepois);
  console.log(`      (pior caso: ${nA} caracteres antes, ${nD} depois; teto ${TETO_DA_PAUTA})`);
  t("a pauta no pior caso cabe no teto, antes e depois", nA <= TETO_DA_PAUTA && nD <= TETO_DA_PAUTA);
  const leve = textoDaPauta(pautaComEmCena(garantirPauta(null), listaDepois, { turno: 7 }), { turno: 7 });
  t("numa pauta com folga, a linha leva os dois rótulos, sem linha nova", /Tabitha, taverneira/.test(leve) && /Tabitha, recruta/.test(leve) && !/Tabitha, taverneira \(taverneira\)/.test(leve), leve);
  t("os ids do EM CENA continuam um por pessoa", new Set(listaDepois.filter((x) => x.tipo === "pessoa").map((x) => x.id)).size === 2 && J1 !== J2);
}

/* ============================================================ */
sec("§5 o que decidia por nome decide pelo id");
{
  const q = quemEstaAqui(estado(TAVERNA));
  const aus = osAusentes(q, { gente: GENTE, npcs: {}, heroi: { nome: "Barnabas" }, lugar: q && estado(TAVERNA).lugar, cidade: CIDADE });
  t("osAusentes: com a chave, a recruta (outra Tabitha, noutro sítio) é ausente, com o id dela", aus.some((a) => a.id === ID2 && /Praça/.test(a.onde)), J(aus));
  const ausSem = osAusentes(quemEstaAqui(estado(TAVERNA, { porId: false })), { gente: GENTE, npcs: {}, heroi: { nome: "Barnabas" }, lugar: estado(TAVERNA).lugar });
  t("sem a chave, a régua de antes: o primeiro nome de quem está descarta-a", !ausSem.some((a) => a.nome === "Tabitha"));
  const pd = podarOAusente("Tabitha enche a caneca e sorri.", aus, { outros: ["Tabitha"] });
  t("a poda não corta quem está pelo nome da homônima ausente (o nome é de quem está)", pd.podadas.length === 0 && /sorri/.test(pd.narrativa));
  const nao = naoEstaoAqui(q, { mostrado: ["Tabitha enche a caneca."], gente: GENTE, cidade: CIDADE });
  t("naoEstaoAqui: a homônima de fora não é vetada pelo nome de quem está", !nao.some((n) => n.nome === "Tabitha"), J(nao));
  const ns = quemEstaNoutroSitio({ porId: true, longe: [{ nome: "Tabitha", id: ID2, dias: 0, laFora: PRACA }], doSitio: [{ nome: "Tabitha", id: ID1 }], aqui: [], grupo: [], noSitio: true }, {});
  t("quemEstaNoutroSitio: a do posto noutro sítio fica, mesmo com a homônima no sítio", ns.length === 1 && ns[0].id === ID2);
  const nsSem = quemEstaNoutroSitio({ longe: [{ nome: "Tabitha", id: ID2, dias: 0, laFora: PRACA }], doSitio: [{ nome: "Tabitha", id: ID1 }], aqui: [], grupo: [], noSitio: true }, {});
  t("sem a chave, o nome de sempre", nsSem.length === 0);
  const igual = oMesmoPorId(true);
  t("oMesmoPorId: dois ids, decide o id; um sem id, o nome", !igual({ nome: "A", id: "x" }, { nome: "A", id: "y" }) && igual({ nome: "A", id: "x" }, { nome: "A" }));
}

/* ============================================================ */
/* a quest: o estado no formato do save, com a semente que dá as duas Tabithas */
const MUNDO = save ? { semente: `${save.nomeCampanha}|${save.mundo.genero}`, genero: save.mundo.genero, molde: save.mundo.molde, lexico: save.mundo.lexico } : null;
const daSemente = save ? genteDaCidade(MUNDO.semente, save.mapa.cidades.find((c) => c.nome === save.cidadeAtual), { genero: MUNDO.genero, molde: MUNDO.molde, lex: MUNDO.lexico }) : [];
const comAsDuas = daSemente.filter((g) => g.nome === "Tabitha").length === 2;
sec("§6 a quest cujo papel é uma de duas homônimas só anda com a certa");
if (!comAsDuas) console.log("      (sem o save da 15.ª sessão nesta máquina: secções 6 a 8 provam só a forma)");
{
  const E = (npcs, factos) => ({ ...(save ? estadoDoSave(save) : { mapa: MAPA, cidadeAtual: CIDADE, nomeCampanha: "x", mundo: {} }), npcs, factos: { pessoas: factos } });
  const recruta = { tipo: "pessoa", nome: "Tabitha", cidade: CIDADE, local: PRACA };
  const taverneira = { tipo: "pessoa", nome: "Tabitha", cidade: CIDADE, local: TAVERNA };
  if (comAsDuas) {
    const r = resolverPapeis({ a: recruta, b: taverneira }, E({}, {}), { mundo: MUNDO });
    t("resolverPapeis: o papel do homônimo ganha o id dele pela casa (Tabitha~2 é a recruta)", r.papeis.a.id === `${CIDADE}|gente|Tabitha~2` && r.papeis.b.id === `${CIDADE}|gente|Tabitha`, J(r.papeis));
    /* o herói falou com a recruta; o registo guarda-a como «Tabitha», posta na praça */
    const npcs = { Tabitha: ficha("Tabitha", { papel: "recruta", local: PRACA }) };
    const factos = { "npc|Tabitha": { nome: "Tabitha", visto: { de: 1, ate: 1, vezes: 1 }, falou: { de: 1, ate: 1, vezes: 2 } } };
    const conv = (papel) => avaliarCondicao(["conversou", "papel:x"], { estado: E(npcs, factos), papeis: { x: papel }, mundo: MUNDO });
    t("a quest da recruta anda (o fato do registo é dela, pelo posto)", conv(recruta) === true);
    t("a quest da taverneira não anda com a conversa da recruta", conv(taverneira) === false);
    const j = julgarEtapa({ id: "e1", conclui: ["conversou", "papel:x"] }, { estado: E(npcs, factos), papeis: { x: taverneira }, mundo: MUNDO });
    t("e o «o que falta» diz o id do papel (o da taverneira)", !j.feita && j.falta[0].args[0].id === `${CIDADE}|gente|Tabitha`, J(j.falta));
  }
}

/* ============================================================ */
sec("§7 o fato gravado como npc|Nome conta para a pessoa da base pelo alias");
{
  const gB = { id: `${CIDADE}|forja|0`, nome: "Brannoc Ferro", papel: "ferreiro", local: "A Forja Velha", cidade: CIDADE };
  const idB = idsDaGente([gB], CIDADE)[0];
  const al = aliasDaPessoa(idB, { gente: [gB], npcs: { Brannoc: ficha("Brannoc") }, cidade: CIDADE });
  t("aliasDaPessoa: npc|Brannoc é Brannoc Ferro da base", al["npc|Brannoc"] === idB, J(al));
  const factos = { pessoas: { "npc|Brannoc": { nome: "Brannoc", falou: { de: 1, ate: 1, vezes: 1 } } } };
  t("pessoaDoLivro com o alias acha o fato", pessoaDoLivro(factos, idB, { alias: al }) === "npc|Brannoc");
  const alH = aliasDaPessoa(ID2, { gente: GENTE, npcs: { Tabitha: ficha("Tabitha", { local: PRACA, papel: "recruta" }) }, cidade: CIDADE });
  t("no homônimo, o apelido sai do posto da ficha (o local), um só", alH["npc|Tabitha"] === ID2);
  const alT = aliasDaPessoa(ID1, { gente: GENTE, npcs: { Tabitha: ficha("Tabitha", { local: PRACA, papel: "recruta" }) }, cidade: CIDADE });
  t("e a outra homônima não fica com o apelido", !alT["npc|Tabitha"]);
  const alN = aliasDaPessoa(ID1, { gente: GENTE, npcs: { Tabitha: ficha("Tabitha") }, cidade: CIDADE });
  t("nada separa a ficha (sem posto nem ofício): ninguém, não se escolhe calado", !alN["npc|Tabitha"]);
  t("o desempate é tabela", J(ALIAS_DA_PESSOA.desempate) === J(["local", "oficio"]));
}

/* ============================================================ */
sec("§8 um save antigo termina uma quest");
{
  if (save) {
    const e = estadoDoSave(save);
    const papeis = { x: { tipo: "pessoa", nome: "Lavinia Sallow" } };
    const j = julgarEtapa({ id: "e1", conclui: ["todos", ["conheceu", "papel:x"], ["conversou", "papel:x"]] }, { estado: e, papeis, mundo: MUNDO });
    t("a etapa «conhecer e falar com Lavinia Sallow» fecha no save da 15.ª, sem campo novo", j.feita === true, J(j.falta));
  } else {
    const e = estadoDoSave({ npcs: { "Lavinia Sallow": ficha("Lavinia Sallow") }, cidadeAtual: CIDADE, mapa: MAPA, factos: { pessoas: { "npc|Lavinia Sallow": { nome: "Lavinia Sallow", visto: { de: 1, ate: 1, vezes: 1 }, falou: { de: 1, ate: 1, vezes: 1 } } } } });
    const j = julgarEtapa({ id: "e1", conclui: ["conversou", "papel:x"] }, { estado: e, papeis: { x: { tipo: "pessoa", nome: "Lavinia Sallow" } } });
    t("a etapa fecha num save sem campo novo", j.feita === true, J(j.falta));
  }
}

console.log(`\n${bons} ok · ${maus} falhas`);
if (maus) process.exit(1);
