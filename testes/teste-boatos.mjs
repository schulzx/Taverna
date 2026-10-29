/* teste-boatos.mjs (Fase 4, trilha B · 29/10/2026) — o boato que se confirma pelo desenho

   O que se ouve numa fala (o `dito` do Cronista) e o rumor de cada masmorra
   ganham um veredito no dia em que o herói chega ao sítio de que se falava:
   verdade, meia-verdade ou mentira, por semente (src/boatos.js). Esta suíte
   prova, com casos montados: a verdade, a meia (a pessoa que partiu, a que
   não é quem diziam, a coisa arruinada), a mentira (a pessoa que «nunca
   existiu», a coisa que vira «Boato de…», e o rasto de quem a contou), o
   rumor da masmorra, a mesma revelação que não volta, a chegada que conta e
   a que não conta, o determinismo, a confiança de quem contou, o lixo — e,
   pela peça do pedido (motor/pedido-do-turno.js) sobre casos de verdade,
   que o Narrador não vê nada antes da chegada e que o estado só muda quando
   a linha chegou ao texto.

   E a medida da secção O BOATO nas 204 pautas cheias da 5.ª à 7.ª sessão
   (a prio que pauta.js escreve), e nos 287 pedidos do dourado (quantos
   disparam: nenhum, e porquê).

   Falha antes: no HEAD de antes, src/boatos.js não existe, a pauta não tem
   a secção `boato` e o elenco punha em cena quem «nunca existiu». */
import fs from "node:fs";
import {
  oBoatoDaChegada, oBoatoQueChegou, CHANCES_DO_BOATO, CONFIANCA_DE_QUEM_CONTOU, FORMAS_DO_BOATO, QUEM_CONTOU, BOATO,
} from "../src/boatos.js";
import { FORA_DE_CENA, elencoDaCena } from "../src/cena.js";
import { masmorrasDoMundo } from "../src/mundo-base.js";
import { MARCA_DO_DITO, criarNPC } from "../src/npcs.js";
import { SECOES, SECOES_QUE_CEDEM, secaoPorId, porNaPauta, textoDaPauta, cederNaCena, prioDaLinha, TETO_DA_PAUTA } from "../src/pauta.js";
import { O_QUE_O_CRONISTA_PODE } from "../src/motor/cronista.js";
import { oPedidoDoTurno } from "../src/motor/pedido-do-turno.js";
import { lerODourado, casosDoPedido, correrAPeca, osModulos, osPadroes } from "./pedido-bloco.mjs";

let ok = 0, mal = 0;
const t = (nome, cond, extra) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const Js = JSON.stringify;
const copia = (x) => JSON.parse(Js(x));

/* ---------------- o mundo montado ---------------- */
const DITO = O_QUE_O_CRONISTA_PODE.fatos.marca("");   // a marca que o Cronista escreve de facto
const MAPA = {
  regioes: [{ nome: "Vale", bioma: "floresta", cx: 30, cy: 30 }],
  cidades: [
    { nome: "Vau Seco", x: 30, y: 30, regiao: "Vale" },
    { nome: "Pedra Rasa", x: 40, y: 30, regiao: "Vale" },
    { nome: "Monte Alto", x: 70, y: 70, regiao: "Vale" },
  ],
};
const BROM = criarNPC("Brom", { papel: "taberneiro", local: "Pedra Rasa", relacao: "neutro", conhecidoEm: 1 });
const CLARISSA = criarNPC("Clarissa", { papel: "curandeira", local: "Vau Seco", dito: DITO, conhecidoEm: 2 });
const FALA = [{ autor: "mestre", texto: "Brom limpa o copo devagar.\n— A Clarissa? Vive em Vau Seco, cura febres — diz Brom, sem levantar os olhos." }];
const base = (extra = {}) => ({
  npcs: { Brom: copia(BROM), Clarissa: copia(CLARISSA) }, canone: {}, cidadeAtual: "Vau Seco", lugar: null, masmorra: null,
  mapa: copia(MAPA), dia: 5, mensagens: copia(FALA), heroi: "Aela", ...extra,
});
/* a primeira semente (s0, s1, …) que dá o veredito/forma pedidos */
const sementeQue = (estado, quer, n = 400) => {
  for (let i = 0; i < n; i++) { const r = oBoatoDaChegada(estado, null, "s" + i); if (r.nota && quer(r.nota)) return "s" + i; }
  return null;
};

sec("1. As tabelas");
{
  for (const [f, c] of Object.entries(CHANCES_DO_BOATO)) t(`as chances de «${f}» somam 1`, Math.abs(c.verdade + c.meia + c.mentira - 1) < 1e-9);
  t("a pessoa ouvida é meio a meio verdade (½ · 0,3 · 0,2); o rumor da masmorra um pouco menos (0,45 · 0,35 · 0,2)",
    Js(CHANCES_DO_BOATO.pessoa) === Js({ verdade: 0.5, meia: 0.3, mentira: 0.2 }) && Js(CHANCES_DO_BOATO.masmorra) === Js({ verdade: 0.45, meia: 0.35, mentira: 0.2 }));
  t("cada veredito tem forma para cada fonte; a mentira tem as três (isca, confusão, medo), cada uma com a culpa de quem contou",
    ["pessoa", "coisa", "masmorra"].every((f) => FORMAS_DO_BOATO.verdade[f].length && FORMAS_DO_BOATO.meia[f].length)
    && Js(FORMAS_DO_BOATO.mentira.map((x) => x.id)) === Js(["isca", "confusao", "medo"]) && FORMAS_DO_BOATO.mentira.every((x) => x.deQuem.includes("{nome}")));
  t("o amigo mente menos, o rival e o inimigo mais", CONFIANCA_DE_QUEM_CONTOU.amigo < 1 && CONFIANCA_DE_QUEM_CONTOU.rival > 1 && CONFIANCA_DE_QUEM_CONTOU.inimigo > 1);
  t("quem não se sabe é o que o Cronista escreve quando não sabe", QUEM_CONTOU.semQuem === O_QUE_O_CRONISTA_PODE.fatos.semQuem && DITO === `dito por ${QUEM_CONTOU.semQuem}, não fato`);
  t("a pessoa que «nunca existiu» está fora de cena, como o morto", FORA_DE_CENA.includes(BOATO.nuncaExistiu) && FORA_DE_CENA.includes("morto"));
  const s = secaoPorId("boato");
  t("a pauta tem a secção O BOATO, a 2,472 (depois do coração e do que volta, antes da batida), e na leitura antes do que volta e do rumo", !!s && s.rotulo === "O BOATO" && s.prio === 2.472
    && s.prio > secaoPorId("volta").prio && s.prio < prioDaLinha(secaoPorId("momento"), 0)
    && SECOES.findIndex((x) => x.id === "boato") < SECOES.findIndex((x) => x.id === "volta") && SECOES.findIndex((x) => x.id === "volta") < SECOES.findIndex((x) => x.id === "rumo"));
  t("e cede na luta e na pergunta", SECOES_QUE_CEDEM.luta.includes("boato") && SECOES_QUE_CEDEM.pergunta.includes("boato"));
  t("o sítio pelo pedaço usa a tabela de cabeças da mesa do buraco (uma tabela só)", fs.readFileSync(new URL("../src/boatos.js", import.meta.url), "utf8").includes("MESA_DO_BURACO.cabecas"));
}

sec("2. A verdade, a meia-verdade e a mentira (a pessoa)");
{
  const E = base();
  const congelado = Js(E);
  const sv = sementeQue(E, (n) => n.veredito === "verdade");
  const v = oBoatoDaChegada(E, null, sv);
  t("a verdade: a ficha perde o `dito`, fica onde estava, e as notas dizem que o herói viu", !("dito" in v.estado.npcs.Clarissa) && v.estado.npcs.Clarissa.local === "Vau Seco" && v.estado.npcs.Clarissa.notas.includes("visto pelo herói"));
  t("a linha diz o nome, quem contou, o veredito e como mostrar", v.linhaDaPauta.startsWith("Clarissa (contou-o Brom) — VERDADE:") && v.linhaDaPauta.endsWith(BOATO.fecho), v.linhaDaPauta);
  t("nunca muta o recebido", Js(E) === congelado);
  const sp = sementeQue(E, (n) => n.forma === "partiu");
  const p = oBoatoDaChegada(E, null, sp);
  t("a meia «partiu»: existe, mas o `local` é outra cidade do mapa — um rasto a seguir", ["Pedra Rasa", "Monte Alto"].includes(p.estado.npcs.Clarissa.local) && p.linhaDaPauta.includes(`partiu para ${p.estado.npcs.Clarissa.local}`) && p.estado.npcs.Clarissa.notas.includes("partiu de Vau Seco"), p.linhaDaPauta);
  t("e o elenco já não a põe aqui", !elencoDaCena(p.estado.npcs, "Vau Seco", MAPA).aqui.some((n) => n.nome === "Clarissa"));
  const so = oBoatoDaChegada({ ...E, mapa: { cidades: [MAPA.cidades[0]] } }, null, sp);
  t("sem outra cidade no mapa, «partiu» não existe (a meia é a outra)", so.nota.veredito !== "meia" || so.nota.forma === "outra");
  const sq = sementeQue(E, (n) => n.forma === "outra");
  const q = oBoatoDaChegada(E, null, sq);
  t("a meia «outra»: existe e está aqui, mas não é quem diziam", q.estado.npcs.Clarissa.local === "Vau Seco" && q.estado.npcs.Clarissa.notas.includes("não é quem diziam") && !("dito" in q.estado.npcs.Clarissa));
  const sm = sementeQue(E, (n) => n.forma === "isca");
  const m = oBoatoDaChegada(E, null, sm);
  t("a mentira: «nunca existiu», e o elenco nunca a põe em cena", m.estado.npcs.Clarissa.status === BOATO.nuncaExistiu && !elencoDaCena(m.estado.npcs, "Vau Seco", MAPA).aqui.some((n) => n.nome === "Clarissa"));
  t("o rasto: as notas de quem mentiu dizem o que ele fez, e a linha diz que tem de responder por isso",
    m.estado.npcs.Brom.notas === "mentiu sobre Clarissa: era isca" && m.linhaDaPauta.includes("Brom terá de responder por isso") && m.linhaDaPauta.includes(BOATO.negaA.pessoa), m.linhaDaPauta);
  const sc = sementeQue(E, (n) => n.forma === "confusao"), sd = sementeQue(E, (n) => n.forma === "medo");
  t("a confusão e o medo ficam também, com a culpa que têm (enganou-se; repetiu um medo)",
    oBoatoDaChegada(E, null, sc).estado.npcs.Brom.notas.startsWith("enganou-se sobre Clarissa") && oBoatoDaChegada(E, null, sd).estado.npcs.Brom.notas.startsWith("repetiu um medo sobre Clarissa"));
  t("a nota diz o que se decidiu (para quem lê o turno)", m.nota && m.nota.fonte === "pessoa" && m.nota.veredito === "mentira" && m.nota.contou === "Brom" && m.nota.onde === "Vau Seco");
}

sec("3. A coisa do cânone, o sítio que não pode mentir, e o rumor da masmorra");
{
  const E = base({ npcs: { Brom: copia(BROM) }, canone: { "Livro-caixa da guilda": { tipo: "artefato", descricao: "o livro das dívidas da cidade", local: "Vau Seco", dito: DITO, registradoDia: 2 } },
    mensagens: [{ autor: "mestre", texto: "Brom baixa a voz: «o Livro-caixa da guilda está em Vau Seco, numa arca»." }] });
  const sm = sementeQue(E, (n) => n.veredito === "mentira");
  const m = oBoatoDaChegada(E, null, sm);
  t("a mentira de uma coisa: a entrada sai do cânone e entra «Boato de…», com quem a contou",
    !m.estado.canone["Livro-caixa da guilda"] && m.estado.canone["Boato de Livro-caixa da guilda"] && m.estado.canone["Boato de Livro-caixa da guilda"].tipo === BOATO.tipo
    && m.estado.canone["Boato de Livro-caixa da guilda"].notas === "contou-o Brom" && m.linhaDaPauta.includes(BOATO.negaA.coisa), Js(m.estado.canone));
  const sa = sementeQue(E, (n) => n.forma === "arruinado");
  const a = oBoatoDaChegada(E, null, sa);
  t("a meia de uma coisa: perde o `dito`, e as notas dizem como é de verdade", !("dito" in a.estado.canone["Livro-caixa da guilda"]) && a.estado.canone["Livro-caixa da guilda"].notas.includes("arruinado"));
  /* o sítio que não pode mentir: o cânone com o nome do lugar e nada mais */
  const S = base({ npcs: {}, cidadeAtual: "Pedra Rasa", canone: { "Cerco de Pedra Rasa": { tipo: "artefato", descricao: "—", dito: DITO } } });
  const vs = Array.from({ length: 200 }, (_, i) => oBoatoDaChegada(S, null, "s" + i).nota);
  t("«Cerco de Pedra Rasa» bate em Pedra Rasa (o pedaço sem a cabeça), e o sítio que se pisa é sempre verdade (200 de 200)", vs.every((n) => n && n.nome === "Cerco de Pedra Rasa" && n.veredito === "verdade"));
  /* o rumor da masmorra do mundo */
  const mm = masmorrasDoMundo("sem", MAPA)[0];
  const R = base({ npcs: {}, masmorra: { nome: mm.nome, salas: [], encerrada: false } });
  const r = oBoatoDaChegada(R, null, "sem");
  t("entrar na masmorra julga o rumor dela, e escreve «Rumor de…» no cânone com o veredito",
    r.nota && r.nota.fonte === "masmorra" && r.estado.canone[BOATO.rumorDe + mm.nome] && r.estado.canone[BOATO.rumorDe + mm.nome].descricao === mm.rumor
    && r.estado.canone[BOATO.rumorDe + mm.nome].notas.startsWith(BOATO.vereditos[r.nota.veredito].toLowerCase()) && r.linhaDaPauta.includes(`«${mm.rumor}»`), r.linhaDaPauta);
  t("a masmorra encerrada não julga nada", oBoatoDaChegada({ ...R, masmorra: { ...R.masmorra, encerrada: true }, cidadeAtual: "" }, null, "sem").linhaDaPauta === "");
}

sec("4. A mesma revelação não volta");
{
  for (const [nome, quer] of [["a verdade", (n) => n.veredito === "verdade"], ["a meia", (n) => n.forma === "outra"], ["a mentira", (n) => n.veredito === "mentira"]]) {
    const E = base();
    const r = oBoatoDaChegada(E, null, sementeQue(E, quer));
    t(`${nome} da pessoa, uma vez aplicada, não se revela outra vez`, oBoatoDaChegada(r.estado, null, "qualquer").linhaDaPauta === "");
  }
  /* o Cronista volta a marcar `dito` no mesmo nome (o merge preenche o vazio) */
  const C = base({ npcs: {}, canone: { Forja: { tipo: "lugar", descricao: "a forja velha", local: "Vau Seco", dito: DITO } } });
  const v = oBoatoDaChegada(C, null, sementeQue(C, (n) => n.veredito === "verdade"));
  const outraVez = { ...v.estado, canone: { ...v.estado.canone, Forja: { ...v.estado.canone.Forja, dito: DITO } } };
  t("a verdade do cânone não volta nem quando o Cronista lhe repõe o `dito` (a marca nas notas)", oBoatoDaChegada(outraVez, null, "x").linhaDaPauta === "");
  const m = oBoatoDaChegada(C, null, sementeQue(C, (n) => n.veredito === "mentira"));
  const deNovo = { ...m.estado, canone: { ...m.estado.canone, Forja: { tipo: "lugar", descricao: "a forja velha", local: "Vau Seco", dito: DITO } } };
  t("a mentira do cânone não volta quando o nome é dito de novo («Boato de…» guarda-a)", oBoatoDaChegada(deNovo, null, "x").linhaDaPauta === "");
  const mm = masmorrasDoMundo("sem", MAPA)[0];
  const R = base({ npcs: {}, masmorra: { nome: mm.nome, salas: [] } });
  t("o rumor da masmorra julga-se uma vez («Rumor de…» guarda-o)", oBoatoDaChegada(oBoatoDaChegada(R, null, "sem").estado, null, "sem").linhaDaPauta === "");
}

sec("5. A chegada que conta e a que não conta");
{
  const E = base();
  t("noutra cidade, nada", oBoatoDaChegada({ ...E, cidadeAtual: "Pedra Rasa" }, null, "x").linhaDaPauta === "");
  t("na luta e na estrada, nada", oBoatoDaChegada({ ...E, combate: { inimigos: [] } }, null, "x").linhaDaPauta === "" && oBoatoDaChegada({ ...E, jornada: { destino: "x" } }, null, "x").linhaDaPauta === "");
  t("dentro de uma masmorra perto da cidade, só o que é da masmorra", oBoatoDaChegada({ ...E, masmorra: { nome: "Gruta Funda", salas: [] } }, null, "x").linhaDaPauta === "");
  t("o que se disse HOJE da cidade em que se está não é chegada", oBoatoDaChegada({ ...E, npcs: { ...E.npcs, Clarissa: { ...E.npcs.Clarissa, conhecidoEm: 5 } } }, null, "x").linhaDaPauta === "");
  const L = base({ npcs: { Clarissa: { ...copia(CLARISSA), local: "o Posto Velho", conhecidoEm: 5 } }, lugar: { nome: "Posto Velho" } });
  t("mas o sítio dentro dela conta, sem o artigo («o Posto Velho» = Posto Velho)", oBoatoDaChegada(L, null, "x").nota?.onde === "Posto Velho");
  t("a chegada pode vir dita (`chegada`), por cima do estado", oBoatoDaChegada({ ...E, cidadeAtual: "Pedra Rasa" }, { cidade: "Vau Seco" }, "x").nota?.nome === "Clarissa");
  const dois = base({ canone: { Forja: { tipo: "lugar", descricao: "a forja velha", local: "Vau Seco", dito: DITO } } });
  t(`um boato por turno (${BOATO.porTurno}), a pessoa antes da coisa`, oBoatoDaChegada(dois, null, "x").nota.nome === "Clarissa");
  t("o morto não se revela", oBoatoDaChegada(base({ npcs: { Clarissa: { ...copia(CLARISSA), status: "morto" } } }), null, "x").linhaDaPauta === "");
}

sec("6. A semente é o árbitro, e a confiança de quem contou pesa");
{
  const E = base();
  t("a mesma semente dá o mesmo veredito, a mesma forma e a mesma linha", Js(oBoatoDaChegada(E, null, "abc")) === Js(oBoatoDaChegada(copia(E), null, "abc")));
  const outro = base({ canone: { "Ordem dos Esquecidos": { tipo: "organizacao", descricao: "—", dito: DITO } } });
  t("o veredito é do mundo, não do turno: o resto do estado não o muda", Js(oBoatoDaChegada(E, null, "abc").nota) === Js(oBoatoDaChegada(outro, null, "abc").nota));
  const gen = () => 0.99;
  t("um gerador passado como sorte também serve (0,99 → mentira)", oBoatoDaChegada(E, null, gen).nota.veredito === "mentira");
  const fatia = (rel) => {
    const F = base({ npcs: { Brom: { ...copia(BROM), relacao: rel }, Clarissa: copia(CLARISSA) } });
    const c = { verdade: 0, meia: 0, mentira: 0 };
    for (let i = 0; i < 600; i++) c[oBoatoDaChegada(F, null, "f" + i).nota.veredito]++;
    return c;
  };
  const neutro = fatia("neutro"), amigo = fatia("amigo"), rival = fatia("rival");
  console.log(`     600 sementes: neutro ${Js(neutro)} · amigo ${Js(amigo)} · rival ${Js(rival)}`);
  t("com quem contou neutro, as fatias são as da tabela (±0,06)", Math.abs(neutro.verdade / 600 - 0.5) < 0.06 && Math.abs(neutro.meia / 600 - 0.3) < 0.06 && Math.abs(neutro.mentira / 600 - 0.2) < 0.06);
  t("o amigo mente menos e o rival mais (a meia não muda de tamanho)", amigo.mentira < neutro.mentira && neutro.mentira < rival.mentira && Math.abs(amigo.meia - rival.meia) < 60);
}

sec("7. Quem contou");
{
  const E = base();
  t("das narrações: a pessoa nomeada perto da fala com o nome («— … — diz Brom»)", oBoatoDaChegada(E, null, "x").nota.contou === "Brom");
  const aspas = base({ mensagens: [{ autor: "mestre", texto: "Nessa noite, Brom inclinou-se: «a Clarissa? Vive em Vau Seco»." }] });
  t("entre aspas também", oBoatoDaChegada(aspas, null, "x").nota.contou === "Brom");
  t("da marca, quando ela diz quem foi («dito por Tomas, não fato»)", oBoatoDaChegada(base({ npcs: { Clarissa: { ...copia(CLARISSA), dito: "dito por Tomas, não fato" } } }), null, "x").nota.contou === "Tomas");
  const ninguem = oBoatoDaChegada(base({ mensagens: [] }), null, "x");
  t("sem narração que o diga, ninguém — e a linha não inventa quem", ninguem.nota.contou === "" && !ninguem.linhaDaPauta.includes("contou-o"));
  const fora = oBoatoDaChegada(base({ mensagens: [{ autor: "mestre", texto: "Brom serve a sopa. Clarissa entra pela porta." }] }), null, "x");
  t("o nome fora de fala não é boato contado por ninguém", fora.nota.contou === "");
  const heroi = oBoatoDaChegada(base({ npcs: { Aela: criarNPC("Aela", {}), Clarissa: copia(CLARISSA) }, mensagens: [{ autor: "mestre", texto: "— A Clarissa vive em Vau Seco — diz Aela." }] }), null, "x");
  t("o herói nunca é quem contou", heroi.nota.contou === "");
}

sec("8. O lixo, e o que só chega quando a linha chegou");
{
  const vazio = (r) => r && r.linhaDaPauta === "" && r.nota === null;
  t("null, {}, listas e números dão o vazio, sem lançar",
    [null, undefined, {}, [], 7, "x"].every((x) => vazio(oBoatoDaChegada(x, null, "s"))) && vazio(oBoatoDaChegada({ npcs: [], canone: "x", cidadeAtual: 3 }, 5, null)));
  t("um registo torto não derruba (fichas nulas, dito sem texto)", vazio(oBoatoDaChegada({ cidadeAtual: "Vau Seco", npcs: { A: null, B: { nome: "B", local: "Vau Seco", dito: "" } }, canone: { C: null } }, null, "s")));
  const r = oBoatoDaChegada(base(), null, "s1");
  t("oBoatoQueChegou: com a linha no texto, o que escrever", Js(oBoatoQueChegou(r, "[PAUTA]\nO BOATO   " + r.linhaDaPauta)) === Js({ canone: r.estado.canone, npcs: r.estado.npcs }));
  t("sem a linha no texto (o teto cortou-a), nada — o boato fica e volta", oBoatoQueChegou(r, "[PAUTA] outra coisa") === null && oBoatoQueChegou(null, "x") === null && oBoatoQueChegou(r, null) === null);
}

sec("9. Pela peça do pedido: o Narrador não vê antes, e o estado só muda com a linha no texto");
{
  const D = lerODourado();
  const mods = await osModulos(D.imports);
  const padroes = osPadroes(D, mods);
  const CASOS = casosDoPedido();
  /* casos de cidade, fora da luta, da masmorra e da estrada, e sem pergunta respondida */
  const candidatos = CASOS.filter((k) => k.estado && k.estado.cidadeAtual && !k.estado.combate && !k.estado.masmorra && !k.estado.jornada && !/\?/.test(String(k.frase || "")));
  const comBoato = (k, onde) => ({ ...k, estado: { ...k.estado,
    npcs: { ...(k.estado.npcs || {}), Clarissa: criarNPC("Clarissa", { papel: "curandeira", local: onde, dito: DITO, conhecidoEm: 0 }) } } });
  const VEREDITOS = Object.values(BOATO.vereditos);
  let antesLimpo = 0, estouram = 0, entraram = 0, depois = null, cortado = null;
  for (const k of candidatos) {
    const outra = ((k.estado.mapa || {}).cidades || []).map((c) => c.nome).find((n) => n && n !== k.estado.cidadeAtual) || "Lugar Nenhum";
    const a = correrAPeca(oPedidoDoTurno, comBoato(k, outra), D, padroes);
    /* o caso de lixo que o App também deixa estourar (o grupo torto) não é turno */
    if (a.erro) { estouram++; continue; }
    const rede = Js(a.rede || "");
    if (a.out && !String(a.out.pauta).includes("O BOATO") && !VEREDITOS.some((v) => rede.includes(` — ${v}:`)) && a.valores.npcs.Clarissa && a.valores.npcs.Clarissa.dito) antesLimpo++;
    const b = correrAPeca(oPedidoDoTurno, comBoato(k, k.estado.cidadeAtual), D, padroes);
    if (!b.out) continue;
    const entrou = String(b.out.pauta).includes("O BOATO");
    if (entrou) entraram++;
    if (entrou && !depois) depois = { k, b };
    if (!entrou && !cortado) cortado = { k, b };
  }
  const turnos = candidatos.length - estouram;
  t(`antes da chegada (a Clarissa noutra cidade), nem a pauta nem o pedido à rede têm o veredito, e ela segue \`dito\` (${antesLimpo} de ${turnos})`, antesLimpo === turnos && turnos > 100);
  /* MEDIDA (29/10): os casos do pedido são pautas apertadas de propósito (a
     cobertura); a linha entra em 65 dos 132 — no resto espera */
  console.log(`     na chegada, a linha entra em ${entraram} de ${turnos} pedidos (os outros esperam pelo turno seguinte)`);
  t("na chegada, a pauta leva O BOATO", !!depois && entraram * 4 > turnos, `${entraram} de ${turnos}`);
  if (depois) {
    const { b } = depois;
    const npc = b.valores.npcs.Clarissa;
    t("e a linha chegou: o registo mudou no mesmo turno (sem `dito`), e o App soube pelo `setNpcs`", npc && !npc.dito && b.log.portas.some(([p]) => p === "setNpcs"), Js(npc));
    console.log(`     o caso ${depois.k.i}: ${String(b.out.pauta).split("\n").find((l) => l.startsWith("O BOATO"))}`);
  }
  if (cortado) t(`quando o teto a corta (o caso ${cortado.k.i}), o registo fica como estava — e o boato volta no turno seguinte`, cortado.b.valores.npcs.Clarissa && cortado.b.valores.npcs.Clarissa.dito === DITO);
  else console.log("     (nenhum candidato com a linha cortada pelo teto: a régua do corte é a §8)");
  /* os 287 pedidos do dourado: nenhum dispara — as fichas com `dito` deles não dizem onde */
  let ditos = 0, comSitio = 0, dispara = 0;
  for (const k of CASOS) {
    const e = k.estado || {};
    for (const x of [...Object.values(e.npcs || {}), ...Object.values(e.canone || {})]) if (x && x.dito) { ditos++; if (x.local) comSitio++; }
    if (oBoatoDaChegada({ ...e, heroi: (e.personagem || {}).nome }, null, "corpus").linhaDaPauta) dispara++;
  }
  console.log(`     nos ${CASOS.length} pedidos do dourado: ${ditos} fichas com \`dito\`, ${comSitio} com sítio; dispara em ${dispara}`);
  t("nos pedidos do dourado não dispara nenhum (as fichas `dito` gravadas não dizem onde, ou dizem a estrada) — o dourado não muda", dispara === 0);
}

sec(`10. O teto — as 204 pautas cheias da 5.ª à 7.ª (TETO_DA_PAUTA ${TETO_DA_PAUTA})`);
{
  const ler = (f) => JSON.parse(fs.readFileSync(new URL("./" + f, import.meta.url), "utf8"));
  /* a linha mais longa que a peça escreve (a mentira com quem contou) e a mais curta (a verdade) */
  const E = base();
  const longa = oBoatoDaChegada(E, null, sementeQue(E, (n) => n.forma === "isca")).linhaDaPauta;
  const curta = oBoatoDaChegada(E, null, sementeQue(E, (n) => n.veredito === "verdade")).linhaDaPauta;
  /* o que é de uma vez ou é ordem: o boato nunca o tira (a régua da prio, em pauta.js) */
  const NUNCA = ["rumo", "fecho", "naoPode", "vetoDoDesfecho", "desfecho", "vetoDoJuiz", "masmorra", "coracao", "volta", "peso", "fala", "acabou"];
  for (const [nome, linha] of [["a longa", longa], ["a curta", curta]]) {
    let n = 0, entrou = 0, passou = 0;
    const cortou = {}, proibidos = [];
    for (const f of ["registo-s5-pauta.json", "registo-s6-s7-pauta.json"]) {
      const R = ler(f);
      for (const tt of R.turnos) {
        const p0 = {};
        for (const [s, ids] of Object.entries(tt.secoes)) p0[s] = ids.map((i) => R.linhas[i]);
        const c0 = cederNaCena(p0, { luta: tt.luta, masmorra: tt.masmorra });
        /* na luta e na pergunta o boato cede (espera): não são turnos dele */
        if (tt.luta || (c0.pergunta || []).length) continue;
        const antes = textoDaPauta(c0);
        const depoisT = textoDaPauta(cederNaCena(porNaPauta(c0, "boato", linha), {}));
        n++;
        if (depoisT.length > TETO_DA_PAUTA) passou++;
        if (depoisT.includes(linha)) entrou++;
        for (const [s, xs] of Object.entries(c0)) xs.forEach((x, i) => {
          if (!antes.includes(x) || depoisT.includes(x)) return;
          cortou[s] = (cortou[s] || 0) + 1;
          if (NUNCA.includes(s) || prioDaLinha(secaoPorId(s), i) < secaoPorId("boato").prio) proibidos.push(`${tt.sessao || f}#${tt.turno} ${s}`);
        });
      }
    }
    console.log(`     ${nome} (${linha.length} letras): ${n} pautas; entra em ${entrou}; o que tira: ${Js(cortou)}`);
    t(`${nome}: nunca passa do teto`, passou === 0);
    t(`${nome}: nunca tira o que é de uma vez ou é ordem (os vetos, o rumo, o fecho, o lugar, a planta, o coração, o que volta)`, proibidos.length === 0, proibidos.slice(0, 5).join(", "));
    /* MEDIDA (29/10): a longa (155) entra em 130 de 169, a curta (89) em 138 */
    t(`${nome}: entra em mais de três quartos das pautas cheias (${entrou} de ${n}) — no resto, espera pelo turno seguinte`, entrou * 4 > n * 3);
  }
  t("a linha não é bloco estático: o system prompt não ganhou nada (só a pauta, e só no turno em que bate)", !fs.readFileSync(new URL("../src/prompt.js", import.meta.url), "utf8").includes("O BOATO"));
}

console.log(`\n${ok} ok, ${mal} falha(s)`);
process.exit(mal ? 1 : 0);
