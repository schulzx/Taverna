/* teste-masmorra-certa.mjs (Fase MM · 4.ª sessão de prova, nº 1 e nº 2)
   — entrar na Muralha entra na Muralha, e o veredito conta o corpo que entra

   A quarta sessão de prova (`mente/mm11-sessao-4.md`, Partes 3 e 4; os
   defeitos nº 1 e nº 2) viu a heroína chegar pela estrada à boca da
   "Muralha Quebrada de Silêncio" (M22), acampar, e a partir daí:

     · o Cronista devolveu `lugar: "forte da Muralha Quebrada"` três vezes
       (chamadas 51, 58 e 60 do registo). O nome não casava letra a letra
       com o da boca, virou um sítio NOVO ancorado na cidade, "nos arredores
       de Rio Cinzento" — e o herói, sem dar um passo, voltou 20 km;
     · "entro na Muralha Quebrada de Silêncio" (J25, J26) refez a viagem
       duas vezes: 0,5 dias cada, 36 h de relógio no total;
     · "desço para dentro da masmorra, para as salas" (J27) abriu um covil
       GERADO, com o nome que o gerador sorteou: a "Fortaleza das Brasas",
       MÉDIO, no nível da heroína — e não a Muralha, DIFÍCIL;
     · e o veredito dessa porta disse "é do seu tamanho: dá para ganhar" a
       uma heroína Exausta e sem uma única tocha, que morreu em 3 rodadas.

   A semente do mundo não está no registo (o registo guarda as chamadas ao
   Narrador, não o save), e por isso o mundo é reconstruído com os nomes e
   as distâncias que a transcrição e o registo dizem. As falas do jogador e
   os `lugar` do Cronista são os do registo, letra a letra.

   FALHA em HEAD de 11/10 (v9.379): `mesmoSitioPeloNome`, `NUCLEO_DO_NOME`,
   `ESTADO_NA_PORTA` e `estadoNaPorta` não existem, o Cronista move o herói
   para o forte, e o veredito não conta o estado. Os imports são por espaço
   de nomes: a suíte falha asserção a asserção, não num import.

   As secções: 1. as tabelas · 2. a sessão, turno a turno · 3. o save que
   já tem o forte · 4. o veredito à porta · 5. o que continua a mover ·
   6. lixo, null, imutabilidade e determinismo. */
import * as R from "../src/rastro.js";
import * as L from "../src/lugar.js";
import * as B from "../src/boca.js";
import * as D from "../src/dificuldade.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const tenta = (f, d = null) => { try { return f(); } catch { return d; } };
const fn = (o, k) => (o && typeof o[k] === "function" ? o[k] : () => null);
const mesmoSitio = fn(L, "mesmoSitioPeloNome");
const estadoNaPorta = fn(D, "estadoNaPorta");

/* ============================================================
   O mundo da sessão (reconstruído com os nomes do registo)
   ============================================================ */
const RIO = { nome: "Rio Cinzento", x: 50, y: 50, regiao: "Vale Cinzento", bioma: "planicie" };
const ALTO = { nome: "Alto do Sal", x: 30, y: 40, regiao: "Vale Cinzento", bioma: "planicie" };
const MAPA = { cidades: [RIO, ALTO], regioes: [{ nome: "Vale Cinzento" }], rotas: [{ de: "Rio Cinzento", para: "Alto do Sal", km: 40, dias: 1, terreno: "planicie" }] };
/* a Muralha, a ~21 km a sudeste (M22: "a sudeste, a 21 km — 0,5 dias");
   nível 4 e 9 salas dão os 372 de poder que a tela leu */
const MURALHA = { id: "masmorra|Vale Cinzento|0", nome: "Muralha Quebrada de Silêncio", tipo: "forte", regiao: "Vale Cinzento", bioma: "planicie", cidadeProxima: "Rio Cinzento", nivel: 4, salas: 9, x: 57, y: 57 };
const OUTRA = { id: "masmorra|Vale Cinzento|1", nome: "Cova do Sal Velho", tipo: "mina", regiao: "Vale Cinzento", bioma: "planicie", cidadeProxima: "Alto do Sal", nivel: 2, salas: 5, x: 32, y: 38 };
const MASMORRAS = [OUTRA, MURALHA];

/* a heroína: nível 1, 10 PV, Euzébio no grupo — e, depois de M26, Exausta
   e sem tochas (M27: "Você não tem uma única tocha") */
const SIBILA = { nome: "Sibila Navarro", nivel: 1, vida: 10, vidaMax: 10, atributos: { forca: 0, destreza: 1, vigor: 0, intelecto: 3, presenca: 3, percepcao: 2 }, grupo: [{ nome: "Euzébio", nivel: 1, vida: 12, vidaMax: 12 }], suprimentos: { racoes: 0, agua: 0, tochas: 0, kit: false }, condicoes: [] };
const EXAUSTA = { ...SIBILA, condicoes: [{ id: "exausto", nome: "Exausto" }] };

/* as falas do jogador, do registo (chamadas 50, 57, 59 e 61) */
const J22 = "Não respondo ao homem da fita. Aperto as chaves no cinto, faço sinal ao Euzébio e saio da botica sem pressa. Vou à Muralha Quebrada de Silêncio, procurar o que Norberto escondeu.";
const J25 = "Respondo a Belmira que ainda não sei o que enterro, e peço-lhe que volte para Alto do Sal. Depois acendo uma tocha, faço sinal ao Euzébio e entro na Muralha Quebrada de Silêncio, passo a passo, com as chaves prontas.";
const J26 = "Passo entre os dois soldados da fita vermelha, sem lhes tocar, e atravesso o arco: entro na Muralha Quebrada de Silêncio com o Euzébio, a tocha à frente.";
const J27 = "Respiro fundo e desço para dentro da masmorra, para as salas, com a tocha à frente. Euzébio vem logo atrás.";
/* o `lugar` que o Cronista devolveu nas chamadas 51, 58 e 60 */
const DO_CRONISTA = "forte da Muralha Quebrada";

/* a boca, como `chegadaABoca` a regista ao fim da estrada de M22 */
const CHEGADA = tenta(() => B.chegadaABoca(MURALHA, { cidade: "Rio Cinzento", dia: 2, pers: SIBILA }), null);
const BOCA = CHEGADA && CHEGADA.lugar;
const ctxDe = (lugar, extra = {}) => ({ cidadeAtual: "Rio Cinzento", cidades: MAPA.cidades.map((c) => c.nome), mapa: MAPA, masmorras: MASMORRAS, lugar, pers: EXAUSTA, ...extra });

/* ============================================================ */
sec("1. as tabelas — lidas de volta");
{
  const N = L.NUCLEO_DO_NOME || {};
  t("o núcleo do nome é tabela: longe, duas palavras no mínimo, os conectores", Array.isArray(N.distancias) && N.distancias.includes("perto") && N.palavrasMinimas === 2 && Array.isArray(N.conectores) && N.conectores.includes("de"));
  t("só LONGE: dentro dos muros e nos arredores o nome manda como sempre", Array.isArray(N.distancias) && !N.distancias.includes("dentro") && !N.distancias.includes("arredores"));
  const Q = L.QUEM_DIZ_O_LUGAR || {};
  t("o Cronista, ao longe, só muda o sítio com o pedido do jogador", Q.cronista && Q.cronista.sitioNovoAoLonge === "soComPedido");
  t("o Mestre, ao longe, continua a poder dizer um sítio novo", Q.mestre && Q.mestre.sitioNovoAoLonge === "novo");
  const E = D.ESTADO_NA_PORTA || {};
  t("o estado à porta é tabela: desvantagem, escuro e o piso dos PV", E.desvantagem && E.escuro && E.pv && Number.isFinite(E.desvantagem.fator) && Number.isFinite(E.escuro.fator) && Number.isFinite(E.pv.piso));
  t("cada fator rebaixa, e nenhum zera (o veredito de quem entra ferido não é 'impossível' por decreto)", E.desvantagem && E.desvantagem.fator > 0 && E.desvantagem.fator < 1 && E.escuro.fator > 0 && E.escuro.fator < 1 && E.pv.piso > 0 && E.pv.piso < 1);
}

/* ============================================================ */
sec("2. a sessão, turno a turno");
{
  t("M22 · a boca regista-se com o nome e o ponto da Muralha", BOCA && BOCA.nome === MURALHA.nome && BOCA.distancia === "perto" && BOCA.coord && Math.abs(BOCA.coord.x - MURALHA.x) < 0.01);
  t("M22 · J22 é uma ida à Muralha (a viagem certa, como foi)", (tenta(() => R.idaAMasmorra(J22, ctxDe(L.definirLugar("botica no fim da Rua dos Retalhos", { cidade: "Rio Cinzento", distancia: "dentro", ancora: RIO }))), {}) || {}).nome === MURALHA.nome);
  /* o defeito: as três respostas do Cronista à boca */
  for (const [n, pedido] of [[51, J22], [58, J25], [60, J26]]) {
    const lido = tenta(() => L.lerLugarDito(DO_CRONISTA, { lugar: BOCA, cidade: "Rio Cinzento", pedido, fonte: "cronista" }), {}) || {};
    t(`chamada ${n} · o "${DO_CRONISTA}" do Cronista, à boca, não move nem acusa`, lido.acao === "ignora", JSON.stringify(lido));
  }
  const peloMestre = tenta(() => L.lerLugarDito(DO_CRONISTA, { lugar: BOCA, cidade: "Rio Cinzento", pedido: J25, fonte: "mestre" }), {}) || {};
  t("e dito pelo Mestre também não: é o mesmo sítio por outro nome", peloMestre.acao === "ignora" && peloMestre.porque === "mesmoSitio", JSON.stringify(peloMestre));
  /* com a boca intacta, as três frases */
  const ida25 = tenta(() => R.idaAMasmorra(J25, ctxDe(BOCA)), "erro");
  t("J25 · \"entro na Muralha\" à boca NÃO é outra ida (era 22 km, 0,5 dia)", ida25 === null || (ida25 && ida25.acao !== "partir"), JSON.stringify(ida25 && { acao: ida25.acao, km: ida25.rota && ida25.rota.km }));
  const ent25 = tenta(() => R.detectarEntradaEmMasmorra(J25, ctxDe(BOCA)), null);
  t("J25 · … abre a porta da Muralha", ent25 && ent25.nome === MURALHA.nome, JSON.stringify(ent25));
  const ent26 = tenta(() => R.detectarEntradaEmMasmorra(J26, ctxDe(BOCA)), null);
  t("J26 · \"atravesso o arco: entro na Muralha\" abre a Muralha", ent26 && ent26.nome === MURALHA.nome, JSON.stringify(ent26));
  const ent27 = tenta(() => R.detectarEntradaEmMasmorra(J27, ctxDe(BOCA)), null);
  t("J27 · \"desço para dentro da masmorra\" à boca abre a Muralha, não um covil sorteado", ent27 && ent27.nome === MURALHA.nome && /mundo/.test(ent27.motivo || ""), JSON.stringify(ent27));
}

/* ============================================================ */
sec("3. o save que já tem o forte (o lugar rebatizado, com o ponto da cidade)");
{
  /* o que o App fazia com o "novo" do Cronista: definirLugar ancorado na cidade */
  const FORTE = L.definirLugar(DO_CRONISTA, { cidade: "Rio Cinzento", dia: 2, ancora: RIO });
  t("o forte rebatizado ficou nos arredores, longe da boca (a reprodução do estrago)", FORTE && FORTE.distancia === "arredores" && FORTE.coord && Math.hypot(FORTE.coord.x - MURALHA.x, FORTE.coord.y - MURALHA.y) > 3);
  t("o forte é reconhecido como a boca da Muralha", (tenta(() => B.masmorraDaBoca(FORTE, MASMORRAS), null) || {}).nome === MURALHA.nome);
  const ida = tenta(() => R.idaAMasmorra(J25, ctxDe(FORTE)), "erro");
  t("J25 dali não refaz a estrada", ida === null || (ida && ida.acao !== "partir"), JSON.stringify(ida && { acao: ida.acao, km: ida.rota && ida.rota.km }));
  const e27 = tenta(() => R.detectarEntradaEmMasmorra(J27, ctxDe(FORTE)), null);
  t("J27 dali abre a Muralha", e27 && e27.nome === MURALHA.nome, JSON.stringify(e27));
  const naBoca = tenta(() => B.lugarAoEntrarNaMasmorra(MURALHA, { cidade: "Rio Cinzento", dia: 4, lugar: FORTE }), null);
  t("e entrar regista a boca verdadeira, com o ponto da Muralha (não guarda o da cidade)", naBoca && naBoca !== FORTE && naBoca.nome === MURALHA.nome && naBoca.coord && Math.abs(naBoca.coord.x - MURALHA.x) < 0.01);
}

/* ============================================================ */
sec("4. o veredito à porta conta o corpo que entra");
{
  /* um conteúdo à medida da ficha: MÉDIO para quem entra inteiro */
  const ficha = tenta(() => D.avaliar({ nivel: 1 }, SIBILA), null);
  /* a Fortaleza da sessão: o covil gerado no nível da heroína, 7 salas — os
     131 de poder que a tela leu em M27 */
  const nivelMedio = 1;
  const FORTALEZA = { nome: "Fortaleza das Brasas", nivel: nivelMedio, salas: 7 };
  t("a Fortaleza mede os 131 da sessão", (tenta(() => D.dificuldadeDaMasmorra(FORTALEZA, SIBILA), {}) || {}).poderDoConteudo === 131);
  t("e a Muralha os 372", (tenta(() => D.dificuldadeDaMasmorra(MURALHA, SIBILA), {}) || {}).poderDoConteudo === 372);
  const inteira = tenta(() => D.dificuldadeDaMasmorra(FORTALEZA, { ...SIBILA, suprimentos: { tochas: 6 } }), null);
  const comoFoi = tenta(() => D.dificuldadeDaMasmorra(FORTALEZA, EXAUSTA), null);
  t("a heroína inteira e com tochas lê MÉDIO (a régua de antes, para quem pode)", inteira && inteira.patamar.id === "medio", inteira && inteira.patamar.id);
  t("Exausta e sem uma tocha, a mesma porta já não é MÉDIO", comoFoi && comoFoi.patamar.id !== "medio" && D.PATAMARES.indexOf(comoFoi.patamar) > D.PATAMARES.indexOf(inteira.patamar), comoFoi && `${comoFoi.patamar.id} · razão ${comoFoi.razao}`);
  const E = D.ESTADO_NA_PORTA || { desvantagem: {}, escuro: {} };
  t("o fator é a desvantagem vezes o escuro (as duas desvantagens não somam)", comoFoi && comoFoi.estado && Math.abs(comoFoi.estado.fator - E.desvantagem.fator * E.escuro.fator) < 0.002, comoFoi && JSON.stringify(comoFoi.estado));
  const linha = (tenta(() => B.vereditoDaMasmorra(FORTALEZA, EXAUSTA), {}) || {}).linha || "";
  t("a linha da tela diz porquê: exausto, sem uma tocha, e o poder que entra", /exausto/.test(linha) && /sem uma tocha/.test(linha) && /entram \d/.test(linha), linha);
  const ferida = tenta(() => D.estadoNaPorta({ ...SIBILA, suprimentos: { tochas: 3 }, vida: 3 }), null);
  t("PV baixos pesam (3 de 10), e a linha os nomeia", ferida && ferida.fator < 1 && ferida.fator >= E.pv.piso && ferida.motivos.some((m) => /3 de 10 PV/.test(m)), JSON.stringify(ferida));
  const zero = tenta(() => D.estadoNaPorta({ ...SIBILA, suprimentos: { tochas: 3 }, vida: 0 }), null);
  t("a 0 PV o fator é o piso, nunca zero", zero && Math.abs(zero.fator - E.pv.piso) < 0.002, JSON.stringify(zero));
  const soExausta = tenta(() => D.estadoNaPorta({ ...EXAUSTA, suprimentos: { tochas: 4 } }), null);
  t("Exausta com tochas: só a desvantagem", soExausta && Math.abs(soExausta.fator - E.desvantagem.fator) < 0.002 && soExausta.motivos.length === 1, JSON.stringify(soExausta));
  const naPlanta = tenta(() => D.estadoNaPorta(EXAUSTA, { tochas: 5 }), null);
  t("as tochas que a planta já leva (mm.tochas) ganham da mochila vazia", naPlanta && !naPlanta.motivos.includes(E.escuro.rotulo), JSON.stringify(naPlanta));
  const semSaber = tenta(() => D.estadoNaPorta({ nome: "x", nivel: 1 }), null);
  t("sem suprimentos na ficha a luz não se sabe, e não pesa", semSaber && semSaber.fator === 1 && semSaber.motivos.length === 0, JSON.stringify(semSaber));
  const sessao = tenta(() => B.vereditoDaMasmorra(MURALHA, EXAUSTA), null);
  t("a Muralha, para a heroína de M27, continua acima dela (e a conta diz que entra menos)", sessao && ["dificil", "impossivel"].includes(sessao.dif.patamar.id) && sessao.dif.poderDoGrupo < sessao.dif.grupo.total, sessao && sessao.linha);
  const missao = tenta(() => D.dificuldadeDaMissao({ nivel: nivelMedio, etapas: [1, 2, 3], titulo: "x" }, EXAUSTA), null);
  t("a missão (que é de dias) não sente o corpo de hoje", missao && !missao.estado, missao && JSON.stringify(missao.estado));
  t("ficha sem estado: o avaliar de sempre, número a número", ficha && !ficha.estado && ficha.poderDoGrupo === ficha.grupo.total);
}

/* ============================================================ */
sec("5. o que continua a mover");
{
  t("o Cronista que lê um sítio para onde o jogador FOI, ao longe, move", (tenta(() => L.lerLugarDito("clareira do ermitão", { lugar: BOCA, cidade: "Rio Cinzento", pedido: "Deixo a boca e vou até a clareira do ermitão.", fonte: "cronista" }), {}) || {}).acao === "novo");
  t("o Mestre que diz um sítio novo, ao longe, move como sempre", (tenta(() => L.lerLugarDito("clareira do ermitão", { lugar: BOCA, cidade: "Rio Cinzento", fonte: "mestre" }), {}) || {}).acao === "novo");
  const BOTICA = L.definirLugar("botica no fim da Rua dos Retalhos", { cidade: "Rio Cinzento", distancia: "dentro", ancora: RIO });
  t("dentro dos muros, o nome manda como sempre: a Rua dos Retalhos não é a botica", (tenta(() => L.lerLugarDito("Rua dos Retalhos", { lugar: BOTICA, cidade: "Rio Cinzento", fonte: "mestre" }), {}) || {}).acao === "novo");
  t("dois sítios que partilham a cabeça e têm complementos diferentes são dois", mesmoSitio("Santuário Cego de Silêncio", "Santuário Cego de Raízes") === false);
  t("uma palavra só nunca casa (\"Forte\" não é a \"Fortaleza das Brasas\")", mesmoSitio("Forte", "Fortaleza das Brasas") === false && mesmoSitio("forte", "forte da Muralha Quebrada") === false);
  t("o mesmo sítio, nos dois sentidos", mesmoSitio(DO_CRONISTA, MURALHA.nome) === true && mesmoSitio(MURALHA.nome, DO_CRONISTA) === true);
  const SANT = [{ nome: "Santuário Cego de Silêncio" }, { nome: "Santuário Cego de Raízes" }];
  t("à boca de uma, a outra não é \"a da boca\"", tenta(() => B.masmorraDaBoca({ nome: "Santuário Cego de Silêncio", distancia: "perto" }, [SANT[1]]), "erro") === null);
  t("duas candidatas pelo núcleo: na dúvida, nenhuma", tenta(() => B.masmorraDaBoca({ nome: "ruína do Santuário Cego", distancia: "perto" }, SANT), "erro") === null);
  t("um lugar dentro dos muros nunca é boca pelo núcleo", tenta(() => B.masmorraDaBoca({ nome: "forte da Muralha Quebrada", distancia: "dentro" }, MASMORRAS), "erro") === null);
}

/* ============================================================ */
sec("6. lixo, null, imutabilidade e determinismo");
{
  t("mesmoSitioPeloNome com lixo é falso", [null, undefined, {}, 3, ""].every((x) => mesmoSitio(x, "Muralha Quebrada") === false && mesmoSitio("Muralha Quebrada", x) === false));
  t("estadoNaPorta com lixo é fator 1", [null, undefined, 3, "x"].every((x) => { const e = estadoNaPorta(x, null); return e && e.fator === 1 && e.motivos.length === 0; }));
  t("estadoNaPorta com condições-lixo não estoura", (tenta(() => D.estadoNaPorta({ condicoes: [null, 3, { id: "nada" }], suprimentos: null }), null) || {}).fator === 1);
  t("masmorraDaBoca com lixo é null", [null, {}, { nome: "" }].every((x) => tenta(() => B.masmorraDaBoca(x, MASMORRAS), "erro") === null) && tenta(() => B.masmorraDaBoca({ nome: "forte da Muralha Quebrada" }, null), "erro") === null);
  const antes = JSON.stringify([EXAUSTA, BOCA, MASMORRAS]);
  tenta(() => D.dificuldadeDaMasmorra(MURALHA, EXAUSTA));
  tenta(() => L.lerLugarDito(DO_CRONISTA, { lugar: BOCA, cidade: "Rio Cinzento", fonte: "cronista" }));
  tenta(() => R.detectarEntradaEmMasmorra(J27, ctxDe(BOCA)));
  t("nada do que entra sai mudado", JSON.stringify([EXAUSTA, BOCA, MASMORRAS]) === antes);
  const a = JSON.stringify(tenta(() => B.vereditoDaMasmorra(MURALHA, EXAUSTA)));
  const b = JSON.stringify(tenta(() => B.vereditoDaMasmorra(MURALHA, EXAUSTA)));
  t("o mesmo herói à mesma porta lê o mesmo veredito", a === b && a !== "null");
}

console.log(`\nmasmorra certa: ${ok} passaram, ${mal} falharam`);
if (mal) process.exit(1);
