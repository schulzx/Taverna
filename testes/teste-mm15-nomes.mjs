/* teste-mm15-nomes.mjs (Fase MM · MM15, item 5) — os nomes que se fundem

   A segunda sessão de prova (mente/mm11-sessao-2.md, T5 e o defeito 4):
   o cartaz de Otávio fala de "Túlio da Runa", que sumiu a caminho de Gomo
   do Ermo; a regra dos nomes de v9.338 (`nomeComDono`, npcs.js) fundiu-o
   com Túlio, o músico do Último Gomo — que está no elenco com a cidade
   dele, Runa do Poço, onde a heroína estava. O passo do lugar juntava o
   local da ficha nova ao "aqui" da heroína, e o "aqui" bastava. Daí em
   diante "Túlio ✓ conhecido" sem ela o ter visto, A GENTE e falas pagas.

   Agora o primeiro nome igual só funde quando nada os distingue: o sexo,
   o sobrenome de família, o paradeiro (sumido vs. em casa), o ofício, o
   lugar de quem está longe. A gente do mundo (de: "mundo") deixa o novo
   nascer com o nome inteiro; quem a história persegue recusa-o. O nome
   inteiro que o mundo já conhece (o cartaz) é a própria pessoa. E o
   "Túlio" solto decide-se pelo que está mais perto, ou não se liga.

   Esta suíte prova o motor. A fiação (o "de", o papel, as notas, os
   conhecidos do mural, a conversa recente no `contextoDoNome` do App) é
   da mão `frontend`; as provas de v9.338 continuam em teste-mm14-gente. */
import fs from "node:fs";
import {
  HOMONIMO, MOTIVO_DO_HOMONIMO, SAIDA_DO_HOMONIMO, DISTINTO_DE, PARADEIRO, OFICIOS, NOME_SOLTO,
  primeiroNome, nomeComDono, notaDoHomonimo, criarNPC,
} from "../src/npcs.js";
import { ofertaDePessoa } from "../src/ofertas.js";
import { oQueExisteAqui, garantirBase } from "../src/mundo-base.js";
import { gerarGeografia } from "../src/geografia.js";
import { elencoDoMundo } from "../src/elenco.js";
import { estenderEspinha } from "../src/saga.js";
import { guildasDoMundo } from "../src/guildas.js";
import { nomeProcurado } from "../src/procura.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);

/* ---------------- O MUNDO DA SESSÃO ----------------
   Runa do Poço; a forja (O Tesouro sem Fio) onde Otávio trabalha; a
   taverna (O Último Gomo) onde Túlio toca e Lina serve; e o cartaz que
   Otávio pregou, no molde "busca" do mural. */
const RUNA = "Runa do Poço";
const FORJA = ["Runa do Poço", "O Tesouro sem Fio"];
const TAVERNA = ["Runa do Poço", "O Último Gomo"];
/* o que o App passa (contextoDoNome, com a fiação de MM15 · 5): a pista e
   o elenco — este com "de", ofício e sexo */
const ELENCO = [
  { nome: "Otávio do Sal", onde: "O Tesouro sem Fio" },
  { nome: "Túlio", onde: RUNA, de: "mundo", papel: "músico de canto", genero: "homem" },
  { nome: "Lina do Sal", onde: RUNA, de: "mundo", papel: "taverneiro(a)", genero: "mulher" },
  { nome: "Nero do Couro", onde: RUNA, de: "mundo", papel: "ferreiro(a)", genero: "homem" },
];
/* o mesmo elenco com a fiação de v9.338 (sem "de", sem ofício) */
const ELENCO_V338 = ELENCO.map(({ nome, onde }) => ({ nome, onde }));
/* o cartaz, como o mural o guarda: quem procura e o que lhe aconteceu */
const CARTAZ = { nome: "Túlio da Runa", notas: "Túlio da Runa sumiu a caminho de Gomo do Ermo. Otávio do Sal quer notícia — qualquer uma." };
/* M5, palavra por palavra (o que fica na conversa recente) */
const M5 = "Túlio da Runa sumiu no caminho de Gomo do Ermo. Eu queria notícia. Qualquer uma. Paguei um cartaz no mural, se te servir.";
/* as três fichas que o Cronista pode ter devolvido (nome, papel, local, notas) */
const FICHAS = {
  muda: {},
  comLocal: { local: "caminho de Gomo do Ermo" },
  comNotas: { papel: "desaparecido", notas: "sumiu no caminho de Gomo do Ermo" },
};
/* a régua de quem chama: aplica a decisão ao registo como o App faz nas três
   portas (recusada não entra; nome e chave decidem criar ou mesclar) */
function portaDoRegisto(reg, n, id) {
  if (id.decisao === "recusada") return reg;
  const nomeCerto = id.nome || n.nome;
  const chave = id.chave || Object.keys(reg).find((k) => k.toLowerCase() === nomeCerto.toLowerCase());
  return { ...reg, [chave || nomeCerto]: chave ? { ...reg[chave], ...n, nome: reg[chave].nome } : criarNPC(nomeCerto, n) };
}

/* ============================================================ */
sec("1. as tabelas");
{
  t("HOMONIMO tem as partículas do sobrenome de família", ["do", "da", "dos", "das", "de"].every((p) => HOMONIMO.particulas.includes(p)));
  t("todo motivo tem saída para o Narrador, e vice-versa", Object.keys(MOTIVO_DO_HOMONIMO).join() === Object.keys(SAIDA_DO_HOMONIMO).join() && Object.values(SAIDA_DO_HOMONIMO).every((s) => typeof s === "string" && s.length > 5));
  t("os motivos novos existem: sobrenome, paradeiro, ofício, ambíguo", ["sobrenome", "paradeiro", "oficio", "ambiguo"].every((k) => typeof MOTIVO_DO_HOMONIMO[k] === "string"));
  t("DISTINTO_DE: a história recusa, o mundo deixa nascer", DISTINTO_DE.historia === "recusada" && DISTINTO_DE.mundo === "nova");
  t("PARADEIRO.fora tem o sumiço e a estrada", ["sumi", "desaparec", "caminho", "estrada"].every((r) => PARADEIRO.fora.includes(r)));
  t("OFICIOS: ids únicos, e música e forja são famílias diferentes", new Set(OFICIOS.map((f) => f.id)).size === OFICIOS.length && OFICIOS.find((f) => f.id === "musica").raizes.includes("music") && OFICIOS.find((f) => f.id === "forja").raizes.includes("ferreir"));
  t("toda raiz está sem acento e em minúsculas", [...PARADEIRO.fora, ...OFICIOS.flatMap((f) => f.raizes)].every((r) => r === r.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")));
  /* a ordem dos pesos é a regra: o que a conversa trata vence o lugar, e o
     lugar sozinho não vence o nome exato mais o lugar dele */
  t("NOME_SOLTO: conversa > exato + lugar − ...; os pesos contrários são negativos",
    NOME_SOLTO.conversa > NOME_SOLTO.lugar + NOME_SOLTO.exato - 1 && NOME_SOLTO.lugarOutro < 0 && NOME_SOLTO.oficioOutro < 0 && NOME_SOLTO.paradeiroOutro < 0 && NOME_SOLTO.paradeiro > 0);
}

/* ============================================================ */
sec("2. o T5 reconstruído — Túlio da Runa não é o músico");
{
  /* com a fiação nova e o mural: o cartaz diz o nome inteiro, e esse nome é dele */
  for (const [k, f] of Object.entries(FICHAS)) {
    const r = nomeComDono("Túlio da Runa", {}, { importantes: ELENCO, conhecidos: [CARTAZ], aqui: FORJA, ...f });
    t(`ficha ${k}, com o cartaz no mural: entra como "Túlio da Runa"`, r.decisao !== "recusada" && r.nome === "Túlio da Runa" && r.chave === "", J(r));
  }
  /* com a fiação nova sem o mural: o que a ficha diz separa-os */
  for (const k of ["comLocal", "comNotas"]) {
    const r = nomeComDono("Túlio da Runa", {}, { importantes: ELENCO, aqui: FORJA, ...FICHAS[k] });
    t(`ficha ${k}, sem o mural: nasce própria, com o nome inteiro`, r.decisao === "nova" && r.nome === "Túlio da Runa", J(r));
  }
  /* a ficha muda e nenhum cartaz: nada os distingue — funde, como deve (é a
     razão de o mural entrar no contexto) */
  const muda = nomeComDono("Túlio da Runa", {}, { importantes: ELENCO, aqui: FORJA });
  t("ficha muda e sem cartaz: nada os distingue, é o músico (o mural é que o salva)", muda.decisao === "mesma" && muda.nome === "Túlio", J(muda));
  /* com a fiação de v9.338 (sem "de"): o músico conta como quem a história
     persegue. A ficha que diz ONDE o sumido anda já não funde (recusa pelo
     lugar). A que só diz "sumiu" ainda funde — sem o "de", um músico em casa
     e uma Delfina procurada que pode ter sumido são o mesmo dado (secção 4);
     é o "de: mundo" da fiação que diz que ele está em casa. */
  const v338l = nomeComDono("Túlio da Runa", {}, { importantes: ELENCO_V338, aqui: FORJA, ...FICHAS.comLocal });
  t("sem a fiação nova, a ficha com o local na estrada já não funde (recusa pelo lugar)", v338l.decisao === "recusada" && v338l.motivo === "lugar", J(v338l));

  /* o registo, pelas portas do App: o músico já registado fica intocado */
  const musico = criarNPC("Túlio", { papel: "músico de canto", relacao: "neutro", genero: "homem", local: "O Último Gomo", status: "vivo", notas: "de folga hoje: em casa", conhecidoEm: 0 });
  const REG = { "Otávio do Sal": criarNPC("Otávio do Sal", { papel: "aprendiz", relacao: "neutro", local: "O Tesouro sem Fio", conhecidoEm: 0 }), "Túlio": musico };
  const antes = J(REG);
  const n = { nome: "Túlio da Runa", papel: "desaparecido", relacao: "neutro", local: "a caminho de Gomo do Ermo", notas: "sumiu no caminho de Gomo do Ermo" };
  const id = nomeComDono(n.nome, REG, { importantes: ELENCO, conhecidos: [CARTAZ], aqui: FORJA, local: n.local, papel: n.papel, notas: n.notas });
  const depois = portaDoRegisto(REG, n, id);
  t("o registo passa a ter duas pessoas: Túlio e Túlio da Runa", !!depois["Túlio"] && !!depois["Túlio da Runa"], Object.keys(depois).join(", "));
  t("a ficha do músico é exatamente a de antes", J(depois["Túlio"]) === J(musico));
  t("Túlio da Runa entra com o paradeiro do cartaz", depois["Túlio da Runa"].local === "a caminho de Gomo do Ermo" && /sumiu/.test(depois["Túlio da Runa"].notas));
  t("o registo recebido não foi mexido", J(REG) === antes);
  /* e mesmo com o músico investido (laço/relação → da história) */
  const REGA = { ...REG, "Túlio": { ...musico, relacao: "amigo" } };
  const idA = nomeComDono(n.nome, REGA, { importantes: ELENCO, conhecidos: [CARTAZ], aqui: FORJA, local: n.local, papel: n.papel, notas: n.notas });
  t("com o músico amigo e o cartaz: Túlio da Runa entra próprio", idA.decisao === "mesma" && idA.nome === "Túlio da Runa" && idA.chave === "", J(idA));
  const idB = nomeComDono(n.nome, REGA, { importantes: ELENCO, aqui: FORJA, local: n.local, papel: n.papel, notas: n.notas });
  t("com o músico amigo e sem cartaz: recusado, nunca fundido no amigo", idB.decisao === "recusada" && idB.dono === "Túlio", J(idB));
}

/* ============================================================ */
sec("3. o que v9.338 acertou fica");
{
  /* a sessão 1: Foz do Meio, a Delfina da principal em Alto do Sal */
  const IMP = [{ nome: "Teodoro das Tábuas", onde: "Foz do Meio" }, { nome: "Delfina", onde: "A Porta Aberta, Alto do Sal" }];
  const REG = { "Teodoro das Tábuas": criarNPC("Teodoro das Tábuas", { papel: "bardo", relacao: "amigo", genero: "homem", local: "Foz do Meio", conhecidoEm: 0 }) };
  const r19 = nomeComDono("Delfina da Névoa", REG, { importantes: IMP, genero: "homem", papel: "recrutador", aqui: ["Foz do Meio", "o Cais do Sal"] });
  t("'Delfina da Névoa' em Foz do Meio é recusada: ela está noutro lugar", r19.decisao === "recusada" && r19.motivo === "lugar" && r19.dono === "Delfina", J(r19));
  t("à porta dela, em Alto do Sal: é ela, com o nome dela", (() => { const r = nomeComDono("Delfina da Névoa", REG, { importantes: IMP, aqui: ["Alto do Sal", "A Porta Aberta"] }); return r.decisao === "mesma" && r.nome === "Delfina"; })());
  const regD = { ...REG, Delfina: criarNPC("Delfina", { papel: "contrabandista", relacao: "neutro", genero: "mulher", local: "A Porta Aberta, Alto do Sal", conhecidoEm: 4 }) };
  t("já registada: mescla na ficha dela, não se recria", (() => { const r = nomeComDono("Delfina da Névoa", regD, { importantes: IMP, aqui: ["Alto do Sal"] }); return r.decisao === "mesma" && r.chave === "Delfina"; })());
  t("'Teodoro Ruivo' (um apelido, não família) continua a ser o Teodoro", (() => { const r = nomeComDono("Teodoro Ruivo", REG, { aqui: ["Foz do Meio"] }); return r.decisao === "mesma" && r.chave === "Teodoro das Tábuas"; })());
  /* a sessão 2: Otávio, chamado pelo primeiro nome na forja, é o Otávio */
  t("'Otávio' na forja é o Otávio do Sal", (() => { const r = nomeComDono("Otávio", {}, { importantes: ELENCO, aqui: FORJA }); return r.decisao === "mesma" && r.nome === "Otávio do Sal"; })());
  t("'Lina' ao balcão é a Lina do Sal", (() => { const r = nomeComDono("Lina", {}, { importantes: ELENCO, aqui: TAVERNA, papel: "taverneira" }); return r.decisao === "mesma" && r.nome === "Lina do Sal"; })());
}

/* ============================================================ */
sec("4. os sinais, um a um");
{
  const MUNDO = [{ nome: "Aldric Barba-Ruiva", onde: "Casa clara", de: "mundo", papel: "mercador(a)" }];
  const HIST = MUNDO.map(({ nome, onde, papel }) => ({ nome, onde, papel }));
  /* sobrenome de família diferente */
  t("sobrenome: 'Aldric Lâmina-Rápida' não é 'Aldric Barba-Ruiva' (mundo → nasce)", nomeComDono("Aldric Lâmina-Rápida", {}, { importantes: MUNDO, aqui: ["Casa clara"] }).decisao === "nova");
  t("sobrenome: com quem a história persegue → recusado pelo sobrenome", (() => { const r = nomeComDono("Aldric Lâmina-Rápida", {}, { importantes: HIST, aqui: ["Casa clara"] }); return r.decisao === "recusada" && r.motivo === "sobrenome"; })());
  t("o mesmo sobrenome, dito de outro jeito, não separa ('Barba-ruiva')", nomeComDono("Aldric Barba-ruiva", {}, { importantes: MUNDO, aqui: ["Casa clara"] }).decisao === "mesma");
  /* ofício */
  t("ofício: um ferreiro chamado Aldric não é o mercador (mundo → nasce)", nomeComDono("Aldric", {}, { importantes: MUNDO, aqui: ["Casa clara"], papel: "ferreiro" }).decisao === "nova");
  t("ofício da mesma família não separa (vendedor ~ mercador)", nomeComDono("Aldric", {}, { importantes: MUNDO, aqui: ["Casa clara"], papel: "vendedor de tecidos" }).decisao === "mesma");
  t("ofício que a tabela não conhece não é sinal ('amigo de Otávio')", nomeComDono("Aldric", {}, { importantes: MUNDO, aqui: ["Casa clara"], papel: "amigo de Otávio" }).decisao === "mesma");
  t("músico e bardo são a mesma família", nomeComDono("Túlio", {}, { importantes: ELENCO, aqui: TAVERNA, papel: "bardo" }).nome === "Túlio");
  /* sexo, no mundo */
  t("sexo: uma mulher chamada Túlio, com o músico no elenco → nasce própria", nomeComDono("Túlio Branco", {}, { importantes: ELENCO, aqui: TAVERNA, genero: "mulher" }).decisao === "nova");
  /* o paradeiro: o sumiço só separa de quem está em casa */
  t("paradeiro: quem a história persegue e ainda não se viu pode ter sumido (não separa)", (() => { const r = nomeComDono("Delfina da Névoa", {}, { importantes: [{ nome: "Delfina", onde: "Alto do Sal" }], aqui: ["Alto do Sal"], notas: "desaparecida desde ontem" }); return r.decisao === "mesma" && r.nome === "Delfina"; })());
  /* "a caminho de X" não é estar em X */
  t("'a caminho de Runa do Poço' não confirma o lugar do músico", nomeComDono("Túlio da Runa", {}, { importantes: ELENCO, aqui: ["Gomo do Ermo"], local: "a caminho de Runa do Poço" }).decisao === "nova");
}

/* ============================================================ */
sec("5. o \"Túlio\" solto, depois de haver dois");
{
  const musico = { nome: "Túlio", onde: RUNA, de: "mundo", papel: "músico de canto", genero: "homem" };
  const REG = {
    "Otávio do Sal": criarNPC("Otávio do Sal", { papel: "aprendiz", local: "O Tesouro sem Fio" }),
    "Túlio da Runa": criarNPC("Túlio da Runa", { papel: "desaparecido", local: "a caminho de Gomo do Ermo", notas: "sumiu a caminho de Gomo do Ermo" }),
  };
  const ctx = (x) => ({ importantes: [ELENCO[0], musico], conhecidos: [CARTAZ], ...x });
  const forja = nomeComDono("Túlio", REG, ctx({ aqui: FORJA, recentes: ["Quem mais trabalha nesta forja?", M5] }));
  t("na forja, logo depois de Otávio falar dele: é Túlio da Runa", forja.decisao === "mesma" && forja.chave === "Túlio da Runa", J(forja));
  const tav = nomeComDono("Túlio", REG, ctx({ aqui: TAVERNA, papel: "músico" }));
  t("na taverna, sem conversa sobre o sumido: é o músico", tav.decisao === "mesma" && tav.nome === "Túlio" && tav.chave === "", J(tav));
  const gomo = nomeComDono("Túlio", REG, ctx({ aqui: ["Gomo do Ermo"], local: "Gomo do Ermo" }));
  t("em Gomo do Ermo: é Túlio da Runa (o músico está em casa, noutra cidade)", gomo.chave === "Túlio da Runa", J(gomo));
  const sumido = nomeComDono("Túlio", REG, ctx({ aqui: FORJA, notas: "o que sumiu" }));
  t("'o Túlio que sumiu': é Túlio da Runa", sumido.chave === "Túlio da Runa", J(sumido));
  /* dois portadores e nenhum chamado exatamente assim: não se inventa ligação */
  const dois = { ...REG, "Túlio Pardal": criarNPC("Túlio Pardal", { local: "Vau Fundo" }) };
  const amb = nomeComDono("Túlio", dois, { aqui: ["Alto Seco"] });
  t("dois Túlios de nome inteiro, longe dos dois: recusado por ambíguo", amb.decisao === "recusada" && amb.motivo === "ambiguo" && /Túlio da Runa/.test(amb.dono) && /Túlio Pardal/.test(amb.dono), J(amb));
  const nota = notaDoHomonimo([amb]);
  t("e a nota pede o nome inteiro", nota.includes("\"Túlio\"") && nota.includes(MOTIVO_DO_HOMONIMO.ambiguo) && nota.includes(SAIDA_DO_HOMONIMO.ambiguo), nota);
  /* "Edric", o sumido do cartaz, numa cidade onde vive Edric Rompe-Escudos */
  const ed = nomeComDono("Edric", {}, { importantes: [{ nome: "Edric Rompe-Escudos", onde: "Pedra das Velas", de: "mundo", papel: "batedor de carteiras" }], conhecidos: [{ nome: "Edric", notas: "Edric sumiu a caminho de Vau Fundo." }], aqui: ["Pedra das Velas"] });
  t("'Edric', o do cartaz, não vira Edric Rompe-Escudos", ed.decisao === "mesma" && ed.nome === "Edric", J(ed));
  /* um portador só: a régua de sempre */
  t("um só portador do primeiro nome: a régua de sempre (Otávio)", nomeComDono("Otávio", REG, ctx({ aqui: FORJA })).chave === "Otávio do Sal");
}

/* ============================================================ */
sec("6. a nota ao Narrador");
{
  const rLugar = { decisao: "recusada", nome: "Delfina da Névoa", dono: "Delfina", motivo: "lugar" };
  const rSob = { decisao: "recusada", nome: "Aldric Lâmina-Rápida", dono: "Aldric Barba-Ruiva", motivo: "sobrenome" };
  const n1 = notaDoHomonimo([rLugar]);
  t("lugar: 'ela não está nesta cena'", n1.includes(SAIDA_DO_HOMONIMO.lugar) && n1.length <= 400, n1);
  const n2 = notaDoHomonimo([rSob]);
  t("sobrenome: pede o nome dela, não diz que ela não está aqui", n2.includes(SAIDA_DO_HOMONIMO.sobrenome) && !n2.includes("não está nesta cena") && n2.includes(MOTIVO_DO_HOMONIMO.sobrenome), n2);
  const n3 = notaDoHomonimo([rLugar, rSob]);
  t("duas recusas: uma linha cada, e as duas saídas", n3.split("já é outra pessoa").length === 3 && n3.includes(SAIDA_DO_HOMONIMO.lugar) && n3.includes(SAIDA_DO_HOMONIMO.sobrenome), n3);
  t("sem recusas, nota vazia", notaDoHomonimo([]) === "" && notaDoHomonimo(null) === "" && notaDoHomonimo([{ decisao: "nova", nome: "X", dono: "Y" }]) === "");
}

/* ============================================================ */
sec("7. a medida — 24 mundos, quem sumiu num cartaz e a gente do elenco");
{
  /* para cada cidade, o mural inteiro (uma oferta por pessoa); de cada
     cartaz "busca", quem sumiu; se partilha o primeiro nome com alguém do
     elenco ou da espinha, pergunta-se ao registo com a fiação nova (o "de"
     do elenco e os conhecidos do mural), em três fichas. E as fusões
     certas: cada pessoa do elenco chamada pelo primeiro nome, ou com um
     apelido, na casa dela e com o ofício dela, tem de continuar a ser ela. */
  const G = "Fantasia medieval";
  let colisoes = 0, fundidas = 0, recusadas = 0, certas = 0, certasOk = 0;
  for (let i = 0; i < 24; i++) {
    const semente = `mm15|nomes|${i}`;
    const mapa = gerarGeografia(semente, "sobremundo");
    const espinha = estenderEspinha({ semente, mapa, genero: G, cidadeInicial: mapa.cidades[0].nome });
    const el = elencoDoMundo(semente, mapa, { genero: G, espinha, guildas: guildasDoMundo(semente, mapa, G) });
    const imp = [];
    for (const at of espinha.atos || []) for (const m of at.marcos || []) if (m && m.quem) imp.push({ nome: m.quem, onde: m.onde || "" });
    for (const p of el.pessoas) imp.push({ nome: p.nome, onde: p.cidade || "", papel: p.papel || "", genero: p.genero_pessoa || "", ...(p.fonte === "espinha" || p.fonte === "chefe" ? {} : { de: "mundo" }) });
    const base = garantirBase(null);
    for (const c of mapa.cidades.slice(0, 12)) {
      const aqui = oQueExisteAqui(semente, mapa, c.nome, base, G);
      if (!aqui || !aqui.gente) continue;
      const mural = aqui.gente.map((p) => ofertaDePessoa({ semente, pessoa: p, aqui, mapa, nivel: 3 })).filter(Boolean);
      const conhecidos = mural.flatMap((of) => of.etapas.filter((e) => e.tipo === "falar_com").map((e) => ({ nome: e.alvo, notas: of.descricao })));
      for (const of of mural) {
        if (of.molde !== "busca") continue;
        const quem = of.etapas.find((e) => e.tipo === "falar_com").alvo;
        const destino = of.etapas.find((e) => e.tipo === "ir_a").alvo;
        if (!imp.some((d) => primeiroNome(d.nome) === primeiroNome(quem) && d.nome !== quem)) continue;
        colisoes++;
        for (const f of [{}, { notas: `sumiu a caminho de ${destino}` }, { local: `a caminho de ${destino}` }]) {
          const r = nomeComDono(quem, {}, { importantes: imp, conhecidos, aqui: [c.nome], ...f });
          if (r.decisao === "recusada") recusadas++;
          else if (r.nome !== quem) fundidas++;
        }
      }
    }
    for (const p of el.pessoas) {
      if (!p.cidade || !p.nome.includes(" ")) continue;
      const pn = p.nome.split(" ")[0];
      for (const v of [pn, `${pn} o Moço`]) {
        if (el.pessoas.some((q) => q !== p && primeiroNome(q.nome) === primeiroNome(v))) continue;
        certas++;
        const r = nomeComDono(v, {}, { importantes: imp, aqui: [p.cidade, p.casaDeTrabalho].filter(Boolean), papel: p.papel });
        if (r.decisao === "mesma" && r.nome === p.nome) certasOk++;
      }
    }
  }
  console.log(`      ${colisoes} cartazes com o primeiro nome de alguém do elenco/espinha; ${fundidas} fichas fundidas, ${recusadas} recusadas; fusões certas ${certasOk}/${certas}`);
  t(`há colisões a medir (${colisoes})`, colisoes >= 20);
  t(`nenhum sumido de cartaz fundido em outra pessoa (${fundidas})`, fundidas === 0);
  t(`nenhum sumido de cartaz recusado (${recusadas})`, recusadas === 0);
  t(`as fusões certas mantêm-se todas (${certasOk}/${certas})`, certas >= 200 && certasOk === certas);
}

/* ============================================================ */
sec("8. determinismo, lixo e imutabilidade");
{
  const ctx = { importantes: ELENCO, conhecidos: [CARTAZ], aqui: FORJA, recentes: [M5] };
  t("o mesmo pedido dá o mesmo veredito", J(nomeComDono("Túlio", {}, ctx)) === J(nomeComDono("Túlio", {}, ctx)) && J(nomeComDono("Túlio da Runa", {}, ctx)) === J(nomeComDono("Túlio da Runa", {}, ctx)));
  let estourou = false;
  try {
    t("nome nulo: 'nova' com nome vazio", nomeComDono(null, null, null).nome === "");
    t("contexto nulo não quebra", nomeComDono("Túlio da Runa", { "Túlio": null }, null).decisao === "nova");
    nomeComDono("Túlio", { "Túlio": null, "Túlio da Runa": "texto" }, { importantes: [null, 3, { nome: 7 }, { nome: "Túlio", de: 9, papel: {} }], conhecidos: [null, {}, { nome: null }, "Túlio Pardal"], aqui: [null, 3], recentes: [null, 5], local: 7, papel: [], notas: {}, genero: 1 });
    nomeComDono("Túlio", {}, { importantes: "x", conhecidos: "y", recentes: "z", aqui: "w" });
  } catch (e) { estourou = e; }
  t("lixo nunca estoura", !estourou, String(estourou && estourou.stack));
  const imp = J(ELENCO), cz = J(CARTAZ);
  const reg = { "Túlio": criarNPC("Túlio", { papel: "músico", local: "O Último Gomo" }) };
  const r0 = J(reg);
  nomeComDono("Túlio da Runa", reg, { importantes: ELENCO, conhecidos: [CARTAZ], aqui: FORJA, notas: "sumiu" });
  nomeComDono("Túlio", reg, { importantes: ELENCO, conhecidos: [CARTAZ], aqui: TAVERNA, recentes: [M5] });
  t("nada do que entra é mexido (registo, elenco, cartaz)", J(reg) === r0 && J(ELENCO) === imp && J(CARTAZ) === cz);
}

/* ============================================================ */
sec("9. a fiação — App.jsx (MM15 · 5)");
{
  const app = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");

  t("contextoDoNome ganha `conhecidos` ao lado de `importantes`",
    app.includes("  const contextoDoNome = (n) => {\n    const importantes = [];\n    const conhecidos = [];\n    try {"));
  t("o elenco leva papel, sexo e `de: \"mundo\"` para quem não é da espinha/chefe",
    app.includes('for (const p of elencoDoMundo(sementeMundo(), mapaRef.current, contextoDoElenco()).pessoas) if (p && p.nome) importantes.push({ nome: p.nome, onde: p.cidade || "", papel: p.papel || "", genero: p.genero_pessoa || "", ...(p.fonte === "espinha" || p.fonte === "chefe" ? {} : { de: "mundo" }) });'));
  t("o mural vira `conhecidos`: quem um cartaz (`falar_com`) nomeia, com a descrição",
    app.includes('for (const cz of (muralRef.current || [])) for (const e of ((cz && cz.etapas) || [])) if (e && e.tipo === "falar_com" && e.alvo) conhecidos.push({ nome: e.alvo, notas: cz.descricao || "" });'));
  t("a conversa recente entra por `recentes`, no mesmo padrão de ~6898 (try/calou)",
    app.includes('try { recentes = (mensagensRef.current || []).filter((m) => m && (m.autor === "jogador" || m.autor === "mestre")).slice(-4).map((m) => m.texto); } catch (e) { calou("recentes do contexto do nome", e); }'));
  /* Movida de propósito (v9.349, a companheira com uma ficha só): a MESMA
     intenção de antes — o retorno leva conhecidos, recentes, papel e notas ao
     motor — com o campo novo `grupo` entre `recentes` e `local`, que é como
     `nomeComDono` sabe que o nome já é de quem está ao lado do herói. */
  t("o retorno leva conhecidos, recentes, grupo, papel e notas ao motor novo",
    app.includes('return { importantes, conhecidos, recentes, grupo: (personagemRef.current || personagem || {}).grupo || [], local: (n && n.local) || "", genero: (n && n.genero) || "", papel: (n && n.papel) || "", notas: [n && n.notas, n && n.status, n && n.descricao].filter((x) => typeof x === "string" && x).join(" · "), aqui: [cidadeAtualRef.current, lugarRef.current && lugarRef.current.nome, mm && !mm.encerrada ? mm.nome : ""].filter(Boolean) };'));

  /* o "Lina," — o mesmo defeito de nomes, na mesma sessão: T10 não achou
     a Lina do Sal e foi contra "essa pessoa" porque `pessoaNaFrente` só
     reconhecia o nome INTEIRO. Troca para o motor da procura
     (`nomeProcurado`), com a guarda de não adivinhar entre duas pessoas
     presentes que partilham o primeiro nome achado. */
  t("App.jsx importa nomeProcurado e primeiroNome para a guarda do \"Lina,\"",
    app.includes("import { ehProcura, nomeProcurado, procurarPessoa, envelopeDaProcura, linhaDaProcura, pedeDado as procuraPedeDado } from \"./procura.js\";")
    && app.includes("nomeComDono, notaDoHomonimo, primeiroNome } from \"./npcs.js\";"));
  t("pessoaNaFrente acha pelo motor da procura, não por substring do nome inteiro",
    app.includes("const achado = nomeProcurado(t, vivos.map((n) => n.nome));"));
  t("e a guarda: dois presentes com o mesmo primeiro nome não se adivinha qual",
    app.includes("if (achado) return vivos.filter((n) => primeiroNome(n.nome) === primeiroNome(achado)).length > 1 ? null : vivos.find((n) => n.nome === achado);"));
}

/* ============================================================ */
sec("10. a composição do T5 e da Lina, fora do App — Node puro");
{
  /* T5: o contexto que `contextoDoNome` monta hoje — o elenco com "de" e
     ofício, o cartaz do mural em "conhecidos" — mantém o cartaz "Túlio da
     Runa" e o músico "Túlio" como DUAS pessoas; o músico, intocado. */
  const contexto = { importantes: ELENCO, conhecidos: [CARTAZ], aqui: FORJA, local: "a caminho de Gomo do Ermo", papel: "desaparecido", notas: "sumiu a caminho de Gomo do Ermo" };
  const idCartaz = nomeComDono("Túlio da Runa", {}, contexto);
  const idMusico = nomeComDono("Túlio", {}, { importantes: ELENCO, aqui: TAVERNA, papel: "músico" });
  t("T5 (Node puro): o cartaz vira pessoa própria", idCartaz.decisao !== "recusada" && idCartaz.nome === "Túlio da Runa" && idCartaz.chave === "", J(idCartaz));
  t("T5 (Node puro): o músico continua o músico — duas pessoas, nenhuma fundida", idMusico.decisao === "mesma" && idMusico.nome === "Túlio" && idMusico.chave === "" && idCartaz.nome !== idMusico.nome);

  /* a Lina, por fora: a mesma composição de `pessoaNaFrente` hoje —
     `nomeProcurado` (de procura.js, o módulo de verdade) mais a guarda do
     primeiro nome partilhado — sem montar o App. */
  const achar = (texto, nomes) => {
    const achado = nomeProcurado(texto, nomes);
    if (!achado) return null;
    return nomes.filter((n) => primeiroNome(n) === primeiroNome(achado)).length > 1 ? null : achado;
  };
  t("'Lina,' com só a Lina do Sal presente: é ela", achar("Lina, diz-me o que sabes", ["Lina do Sal", "Otávio do Sal"]) === "Lina do Sal");
  t("'Lina,' com Lina do Sal E Lina Ferro presentes: ninguém — não se adivinha", achar("Lina, diz-me o que sabes", ["Lina do Sal", "Lina Ferro"]) === null);
}

/* ============================================================ */
sec("11. o nome curto de quem anda no grupo (05/10, 3.ª sessão de prova, defeito 3)");
{
  /* A companheira de antes, Iracema Sousa, chegou a Vau Fincado onde servia
     uma "Iracema"; o primeiro nome solto casava com a serviçal (pelo nome
     exato e pelo lugar). Com `grupo` no contexto, o nome curto é de quem
     anda ao lado do herói. */
  const GRUPO = [{ nome: "Iracema Sousa", conceito: "companheira de armas", classe: "Monge" }];
  const REG = {
    "Iracema Sousa": criarNPC("Iracema Sousa", { papel: "companheira de armas, Monge", genero: "mulher", local: "Vau Fincado" }),
    Iracema: criarNPC("Iracema", { papel: "serviçal da taverna", local: "Vau Fincado" }),
  };
  const antes = nomeComDono("Iracema", REG, { aqui: ["Vau Fincado"] });
  t("sem o grupo, 'Iracema' é a serviçal (a regra antiga, intocada)", antes.decisao === "mesma" && antes.chave === "Iracema", J(antes));
  const com = nomeComDono("Iracema", REG, { aqui: ["Vau Fincado"], grupo: GRUPO });
  t("com o grupo, 'Iracema' é a Iracema Sousa", com.decisao === "mesma" && com.chave === "Iracema Sousa", J(com));
  t("o grupo como lista de nomes também serve", nomeComDono("Iracema", REG, { grupo: ["Iracema Sousa"] }).chave === "Iracema Sousa");
  t("noutra cidade continua a ser ela (anda onde o herói anda)", nomeComDono("Iracema", { "Iracema Sousa": REG["Iracema Sousa"] }, { aqui: ["São do Meio"], grupo: GRUPO }).chave === "Iracema Sousa");
  const servical = nomeComDono("Iracema", { "Iracema Sousa": REG["Iracema Sousa"] }, { grupo: GRUPO, papel: "serviçal" });
  t("dita serviçal: recusada (nunca uma segunda pessoa com o nome curto dela)", servical.decisao === "recusada" && servical.motivo === "oficio" && servical.dono === "Iracema Sousa", J(servical));
  t("dita homem: recusada pelo sexo", nomeComDono("Iracema", REG, { grupo: GRUPO, genero: "homem" }).motivo === "sexo");
  t("dita monge: é ela", nomeComDono("Iracema", REG, { grupo: GRUPO, papel: "monge" }).chave === "Iracema Sousa");
  t("dois no grupo com o mesmo primeiro nome: não se adivinha pelo grupo (a regra antiga decide)",
    J(nomeComDono("Iracema", REG, { aqui: ["Vau Fincado"], grupo: [...GRUPO, { nome: "Iracema Lopes" }] })) === J(antes));
  t("as invocações não são gente", nomeComDono("Iracema", REG, { aqui: ["Vau Fincado"], grupo: [{ nome: "Iracema Sousa", invocada: true }] }).chave === "Iracema");
  t("lixo no grupo não quebra", nomeComDono("Iracema", REG, { grupo: [null, 3, {}, { nome: "" }] }).decisao === antes.decisao);
}

console.log(`\n${ok} ok, ${mal} falhas`);
process.exit(mal ? 1 : 0);
