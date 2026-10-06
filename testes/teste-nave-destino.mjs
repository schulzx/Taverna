/* teste-nave-destino.mjs (Fase MM · MM16 nº 2) — "vou à Nave" leva à Nave

   A terceira sessão de prova (`mente/mm11-sessao-3.md`, Partes 3 e 4; os
   defeitos nº 2, 4 e 10) viu três coisas numa frase só:

     J8   "Saio da Viela da Fome e vou à Nave de Ferro, pela estrada do
          poente" abriu uma viagem SEM DESTINO pela direção (`jornada.para:
          ""`, três dias), o relógio saltou treze horas, o sistema escreveu
          na boca da heroína "Sigo viagem pela estrada." (a segunda resposta
          do Mestre num toque) e o Mestre seguiu a espinha para São do Meio.
     J11  "entro na Nave de Ferro" abriu a masmorra de onde ela estava, o
          sistema escreveu por ela "Encontrei uma entrada: …. Vou explorar."
          (outra resposta dupla), e o veredito ("DIFÍCIL… é onde se morre")
          chegou DEPOIS de a porta abrir.

   Esta suíte prova o conserto em módulo puro — FALHA em HEAD de 05/10
   (v9.350: `idaAMasmorra`, `boca.js` e a porta `ida` não existem) e passa
   depois — e a secção 6 prova a fiação no App, que é da etapa do frontend.

   As secções: 1. as tabelas · 2. os casos da sessão · 3. a varredura dos
   24 mundos · 4. o veredito antes da porta · 5. lixo, null, imutabilidade
   e determinismo · 6. a fiação. Os imports são por espaço de nomes e a
   `boca.js` entra por import dinâmico: em HEAD os nomes não existem, e a
   suíte tem de falhar asserção a asserção, não num import. */
import * as R from "../src/rastro.js";
import * as T from "../src/turno.js";
import * as D from "../src/dificuldade.js";
import { gerarGeografia, TERRENO_VIAGEM } from "../src/geografia.js";
import { MOLDES } from "../src/moldes.js";
import { generosDisponiveis } from "../src/nomes.js";
import { masmorrasDoMundo, oQueExisteAqui } from "../src/mundo-base.js";
import { kmEntre, minutosAPe, KM_ATE_ONDE_SE_VAI_A_PE } from "../src/coordenadas.js";
import { minutosDaRota, andar, progressoDaViagem } from "../src/viagem.js";
import { definirLugar, comA, comEm, comDe } from "../src/lugar.js";

const Bo = await import("../src/boca.js").catch(() => ({}));

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const tenta = (f, d = null) => { try { return f(); } catch { return d; } };
const fn = (o, k) => (o && typeof o[k] === "function" ? o[k] : () => null);
const ida = fn(R, "idaAMasmorra");
const rotaAte = fn(Bo, "rotaAteAMasmorra");
const jornadaAte = fn(Bo, "jornadaAteAMasmorra");
const chegada = fn(Bo, "chegadaABoca");
const veredito = fn(Bo, "vereditoDaMasmorra");
const daBoca = fn(Bo, "masmorraDaBoca");
const conhecidas = (m, c) => tenta(() => fn(Bo, "masmorrasConhecidas")(m, c), null) || [];
const quem = fn(R, "quemResponde");
const semArt = (s) => String(s || "").replace(/^(O|A|Os|As)\s+/, "");
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

/* ============================================================
   O mundo da sessão (reconstruído com os nomes da transcrição)
   ============================================================ */
const VAU = { nome: "Vau Fincado", x: 50, y: 50, regiao: "Colinas Pardas", bioma: "colina" };
const SAO = { nome: "São do Meio", x: 62, y: 49, regiao: "Colinas Pardas", bioma: "planicie" };
const LONGE = { nome: "Alto do Corvo", x: 15, y: 85, regiao: "Charneca Fria", bioma: "gelo" };
const MAPA = { cidades: [VAU, SAO, LONGE], regioes: [{ nome: "Colinas Pardas" }, { nome: "Charneca Fria" }], rotas: [{ de: "Vau Fincado", para: "São do Meio", km: 300, dias: 12, terreno: "colina" }] };
const NAVE = { id: "masmorra|Colinas Pardas|0", nome: "A Nave de Ferro", tipo: "templo", regiao: "Colinas Pardas", bioma: "colina", cidadeProxima: "Vau Fincado", nivel: 12, salas: 12, x: 44, y: 52 };
const CRIPTA = { id: "masmorra|Charneca Fria|0", nome: "Cripta dos Corvos", tipo: "cripta", regiao: "Charneca Fria", bioma: "gelo", cidadeProxima: "Alto do Corvo", nivel: 5, salas: 7, x: 18, y: 80 };
const POCO = { id: "masmorra|Colinas Pardas|1", nome: "O Poço Fundo", tipo: "mina", regiao: "Colinas Pardas", bioma: "colina", cidadeProxima: "Vau Fincado", nivel: 3, salas: 5, x: 50.3, y: 50.2 };
const MASMORRAS = [POCO, CRIPTA, NAVE];
const VIELA = definirLugar("a Viela da Fome", { cidade: "Vau Fincado", distancia: "dentro", ancora: VAU });
const HEROINA = { nome: "Clara", nivel: 3, vida: 30, vidaMax: 30, atributos: { forca: 12, destreza: 14 }, grupo: [{ nome: "Iracema", nivel: 2 }] };
const CTX = { cidadeAtual: "Vau Fincado", cidades: MAPA.cidades.map((c) => c.nome), mapa: MAPA, masmorras: MASMORRAS, lugar: VIELA, pers: HEROINA };
/* J8 e J11, com as falas da transcrição — a fala também cita a Nave, e não move */
const J8 = "\"Sem arco, então.\" Compro tochas e viro-me para a Iracema: \"Não vamos esperar pela estudante. A Nave de Ferro está perto, e quem proíbe uma estrada guarda alguma coisa nela.\" Saio da Viela da Fome e vou à Nave de Ferro, pela estrada do poente.";
const J11 = "\"Não volto, e também não vou a São do Meio hoje.\" Viro para o poente, sigo o rasto da estrada proibida e entro na Nave de Ferro com a Iracema, de tocha erguida.";
/* a estrada sem destino que J8 abriu (o save da sessão) */
const ESTRADA_SEM_DESTINO = { de: "Vau Fincado", para: "", desde: 4, km: 0, terreno: "", dias: 3, totalMin: 1440, andadoMin: 240, estado: "em_curso" };

/* ============================================================ */
sec("1. as tabelas");
{
  const I = Bo.IDA_A_MASMORRA || {};
  t("a ida tem tabela, e a fronteira a pé é a régua da casa", I.kmAPeAte === KM_ATE_ONDE_SE_VAI_A_PE, JSON.stringify(I));
  t("o piso de dias é o de gerarRotas (meio dia)", I.diasMinimos === 0.5);
  t("o terreno padrão existe na tabela de marcha", !!(TERRENO_VIAGEM[I.terrenoPadrao] && TERRENO_VIAGEM[I.terrenoPadrao].kmDia > 0));
  t("a caminhada mais curta ainda custa minutos (nunca zero)", I.minutosAPeMinimos > 0);
  t("a boca registra-se fora dos muros, nunca \"dentro\"", I.distanciaDaBoca && I.distanciaDaBoca !== "dentro");
  const Q = R.QUEM_RESPONDE || {};
  t("uma frase, uma resposta: as três origens estão na tabela", !!(Q.frase && Q.sinal && Q.toque));
  t("e nenhuma fala na boca do herói", Object.values(Q).length === 3 && Object.values(Q).every((q) => q.vozDoHeroi === false));
  t("a frase não faz chamada própria: o envelope vai junto da frase", (Q.frase || {}).chamadas === 0 && (Q.frase || {}).envelope === "junto");
  t("o sinal do Mestre também não (ele já respondeu): o envelope espera a próxima frase", (Q.sinal || {}).chamadas === 0 && (Q.sinal || {}).envelope === "proximo");
  t("o toque faz uma, a sua — não há frase onde colar", (Q.toque || {}).chamadas === 1 && (Q.toque || {}).envelope === "proprio");
  t("origem desconhecida conta como sinal (zero chamadas)", (quem("???") || {}).id === "sinal" && (quem(null) || {}).id === "sinal");
  const ids = T.PORTAS_DO_TURNO.map((p) => p.id);
  const i = ids.indexOf("ida");
  t("a porta \"ida\" existe no despachante", i >= 0);
  t("depois da entrada à boca, antes da estrada, da partida, do passo e do destino",
    i > ids.indexOf("masmorra") && ["seguir", "partida", "desafio", "destino"].every((x) => i < ids.indexOf(x)), ids.join(","));
  t("e aponta para o mesmo executor de movimento", (T.portaPorId("ida") || {}).faz === "movimento");
}

/* ============================================================ */
sec("2. os casos da sessão");
{
  const r8 = tenta(() => ida(J8, CTX));
  t("J8 · \"vou à Nave de Ferro, pela estrada do poente\" vai à Nave", !!r8 && r8.acao === "partir" && r8.nome === "A Nave de Ferro", JSON.stringify(r8 && { acao: r8.acao, nome: r8.nome }));
  t("J8 · e a direção não abre estrada para lugar nenhum", R.detectarPartida(J8, CTX) === null, JSON.stringify(R.detectarPartida(J8, CTX)));
  t("J8 · a estrada tem a distância do mapa", !!r8 && !!r8.rota && r8.rota.km === Math.round(kmEntre(VIELA.coord, NAVE)), JSON.stringify(r8 && r8.rota));
  const dias8 = r8 && r8.rota ? Math.max(0.5, Math.round((kmEntre(VIELA.coord, NAVE) / TERRENO_VIAGEM.colina.kmDia) * 2) / 2) : -1;
  t("J8 · e os dias da tabela de marcha (colinas, a fórmula de gerarRotas)", !!r8 && !!r8.rota && r8.rota.modo === "estrada" && r8.rota.dias === dias8 && r8.rota.terreno === "colina", `${r8 && r8.rota && r8.rota.dias} vs ${dias8}`);
  const j8 = tenta(() => jornadaAte(r8, { de: "Vau Fincado", dia: 4 }));
  t("J8 · a jornada TEM destino (para = a Nave), não \"\"", !!j8 && j8.para === "A Nave de Ferro", JSON.stringify(j8 && j8.para));
  t("J8 · e o total de estrada é o da rota (não os três dias de piso)", !!j8 && j8.totalMin === minutosDaRota(r8.rota.dias) && j8.dias === r8.rota.dias);
  t("J8 · a jornada sabe que acaba numa boca, não numa cidade", !!j8 && !!j8.alvo && j8.alvo.tipo === "masmorra" && j8.alvo.nome === "A Nave de Ferro");
  t("J8 · o preço é dito na partida: a rota e o veredito, em linhas de sistema", !!r8 && r8.linhas.length === 2 && /Nave de Ferro fica/.test(r8.linhas[0]) && r8.linhas[1] === (veredito(NAVE, HEROINA) || {}).linha, JSON.stringify(r8 && r8.linhas));
  const meio = j8 ? R.pontoDoHeroi({ cidadeAtual: "Vau Fincado", jornada: { ...j8, andadoMin: j8.totalMin / 2 }, mapa: MAPA }) : null;
  t("J8 · no meio do caminho o herói está no meio do caminho (não cravado na cidade)", !!meio && Math.abs(meio.x - (VIELA.coord.x + NAVE.x) / 2) < 0.01 && meio.naEstrada === true, JSON.stringify(meio));

  /* J11: na estrada sem destino, "entro na Nave" — de longe */
  const naEstrada = { ...CTX, lugar: null, emViagem: true, jornada: ESTRADA_SEM_DESTINO };
  t("J11 · \"entro na Nave de Ferro\" de longe NÃO abre a masmorra", R.detectarEntradaEmMasmorra(J11, naEstrada) === null, JSON.stringify(R.detectarEntradaEmMasmorra(J11, naEstrada)));
  const r11 = tenta(() => ida(J11, naEstrada));
  t("J11 · vira ida até à boca, largando a estrada sem destino", !!r11 && r11.acao === "partir" && r11.nome === "A Nave de Ferro" && r11.deixaEstrada === true, JSON.stringify(r11 && { acao: r11.acao, d: r11.deixaEstrada }));
  const pS = R.portaDaMasmorra({ nome: "A Nave de Ferro" }, { cidadeAtual: "Vau Fincado", emViagem: true, lugar: null, masmorras: MASMORRAS });
  t("J11 · e o sinal do Mestre (masmorra:A Nave de Ferro) também é recusado de longe", pS.ok === false && pS.longe === true, JSON.stringify(pS));

  /* uma frase, uma resposta: o despachante com os sinais de verdade */
  const sinais = (f, c) => ({ texto: f, ehEntradaEmMasmorra: !!R.detectarEntradaEmMasmorra(f, c), ehIdaAMasmorra: !!tenta(() => ida(f, c)), ehSeguirViagem: !!R.detectarSeguirViagem(f, c), ehPartidaPorNome: !!R.detectarPartida(f, c), querPartir: true, emViagem: !!c.emViagem });
  for (const [rot, f, c] of [["J8", J8, CTX], ["J11", J11, naEstrada]]) {
    const d = T.decidirTurno(sinais(f, c));
    const cas = T.cascataDoTurno(sinais(f, c));
    t(`${rot} · quem ganha o turno é a porta "ida"`, d.id === "ida", `${d.id} (passou por ${d.descartadas.join(",")})`);
    t(`${rot} · um só executor de movimento na cascata, e a frase faz UMA chamada ao Mestre`, cas.atalhos.filter((p) => p.faz === "movimento").length === 1 && (quem("frase") || {}).chamadas === 0);
  }
  /* à boca: o segundo "entro" é que abre */
  const boca = (tenta(() => chegada(NAVE, { cidade: "Vau Fincado", dia: 9, pers: HEROINA })) || {}).lugar || null;
  const naBoca = { ...CTX, lugar: boca };
  const e2 = R.detectarEntradaEmMasmorra("Entro na Nave de Ferro, de tocha erguida.", naBoca);
  t("à boca, \"entro na Nave de Ferro\" abre — com o nome dela", !!e2 && e2.nome === "A Nave de Ferro", JSON.stringify(e2));
  t("e não é ida nenhuma (quem abre é a entrada)", tenta(() => ida("Entro na Nave de Ferro, de tocha erguida.", naBoca)) === null);
  t("\"vou à Nave\" à boca é ficar: nada a mover", (tenta(() => ida("Vou à Nave de Ferro.", naBoca)) || {}).acao === "ficar");
  t("a boca é a da Nave (masmorraDaBoca)", daBoca(boca, MASMORRAS) === NAVE);

  /* o núcleo e o nome sem artigo */
  for (const f of ["Vou à Nave.", "Sigo para a Nave de Ferro.", "Vou a Nave de Ferro.", "Me dirijo à Nave de Ferro.", "Parto rumo à Nave de Ferro.", "Pego a estrada e vou até à Nave de Ferro."]) {
    t(`"${f}" → a Nave`, (tenta(() => ida(f, CTX)) || {}).nome === "A Nave de Ferro");
  }
  /* sem destino falso */
  for (const f of [
    "vou à nave da igreja rezar.",                      // minúscula: não é o nome próprio
    "Onde fica a Nave de Ferro?",                        // pergunta
    "Quero ir à Nave de Ferro.",                         // intenção
    "Amanhã vou à Nave de Ferro.",                       // plano
    "\"Vou à Nave de Ferro\", digo-lhe.",                // fala
    "Ouço falar da Nave de Ferro e vou à taverna.",      // menção numa oração, ida noutra
    "Saio da Nave de Ferro e vou à taverna.",            // a Nave é a origem
    "Vou a São do Meio, que fica perto da Nave de Ferro.", // a cidade dita antes é o destino
    "Vou à Cripta dos Corvos.",                          // de outra região: o herói não a conhece
    "Sigo pela estrada do poente.",                      // direção sem nome
    "Vou a São do Meio.",                                // cidade
  ]) t(`sem destino falso: "${f}"`, tenta(() => ida(f, CTX)) === null, JSON.stringify(tenta(() => ida(f, CTX))));
  t("a cidade continua a ser da partida (regressão zero)", (R.detectarPartida("Vou a São do Meio.", CTX) || {}).destino === "São do Meio");
  t("a direção sem nome continua a abrir estrada, como hoje", (R.detectarPartida("Sigo pela estrada do poente.", CTX) || {}).destino === "");
  t("a masmorra desconhecida + direção continua como hoje", (R.detectarPartida("Vou à Cripta dos Corvos, pela estrada.", CTX) || {}).destino === "");

  /* a boca perto: caminhada, minutos */
  const rp = tenta(() => ida("Vou ao Poço Fundo.", { ...CTX, lugar: null }));
  t("a boca a menos de 15 km é caminhada, em minutos da régua", !!rp && rp.rota && rp.rota.modo === "a_pe" && rp.rota.minutos === Math.max(Bo.IDA_A_MASMORRA.minutosAPeMinimos, minutosAPe(kmEntre(VAU, POCO))), JSON.stringify(rp && rp.rota));
  t("e a caminhada não abre jornada", jornadaAte(rp, { de: "Vau Fincado" }) === null);
  const cp = tenta(() => chegada(POCO, { cidade: "Vau Fincado", pers: HEROINA, minutos: rp && rp.rota && rp.rota.minutos }));
  t("a chegada a pé põe à boca, com o veredito", !!cp && cp.lugar.nome === "O Poço Fundo" && cp.linhas.length === 2 && /diante do Poço Fundo/.test(cp.linhas[0]), JSON.stringify(cp && cp.linhas));
}

/* ============================================================
   3. A VARREDURA — 24 mundos (6 géneros × 4 moldes), três cidades cada
   ============================================================ */
sec("3. a varredura dos 24 mundos");
const MUNDOS = [];
for (const g of generosDisponiveis()) for (const Mo of MOLDES) {
  const semente = `Sonda MM13|${g}|${Mo.id}`;
  MUNDOS.push({ semente, genero: g, molde: Mo, mapa: gerarGeografia(semente, Mo) });
}
{
  const c = { mundos: 0, cidades: 0, frases: 0, resolvidas: 0, perdidas: 0, estradasFalsas: 0, nucleos: 0, nucleosPerdidos: 0,
    tempos: 0, temposErrados: 0, mesmaRegra: 0, regraDiferente: 0, falsas: 0, falsasQueMovem: 0, determinismo: 0, naoDeterministas: 0 };
  const ex = {};
  const nota = (k, s) => { (ex[k] = ex[k] || []).length < 3 && ex[k].push(s); };
  for (const w of MUNDOS) {
    c.mundos++;
    const todas = masmorrasDoMundo(w.semente, w.mapa);
    for (const cid of w.mapa.cidades.slice(0, 3)) {
      c.cidades++;
      const ctx = { cidadeAtual: cid.nome, cidades: w.mapa.cidades.map((x) => x.nome), mapa: w.mapa, masmorras: todas, pers: HEROINA };
      const sabidas = conhecidas(todas, cid);
      /* a régua de quem o herói conhece é a do prompt (oQueExisteAqui) */
      const doPrompt = (oQueExisteAqui(w.semente, w.mapa, cid.nome, null, w.genero, w.molde) || {}).masmorras || [];
      c.mesmaRegra++;
      if (sabidas.map((m) => m.nome).join("|") !== doPrompt.map((m) => m.nome).join("|")) { c.regraDiferente++; nota("regra", `${cid.nome}: ${sabidas.length} vs ${doPrompt.length}`); }
      for (const m of sabidas) {
        const outra = w.mapa.cidades.find((x) => x.nome !== cid.nome) || cid;
        const frases = [
          `Vou ${comA(m.nome)}.`,
          `Vou a ${semArt(m.nome)}.`,
          `Sigo para ${m.nome}.`,
          `Me dirijo ${comA(m.nome)}.`,
          `Saio de ${cid.nome} e vou ${comA(m.nome)}, pela estrada do poente.`,
          `Saio da Viela da Fome e vou ${comA(m.nome)}, pela estrada do poente.`,
          `Entro ${comEm(m.nome)} de tocha erguida.`,
        ];
        for (const f of frases) {
          c.frases++;
          const r = tenta(() => ida(f, ctx));
          if (!r || r.nome !== m.nome || r.acao !== "partir") { c.perdidas++; nota("perdida", `${f} → ${JSON.stringify(r && r.nome)}`); }
          else c.resolvidas++;
          if (R.detectarPartida(f, ctx)) { c.estradasFalsas++; nota("estrada", f); }
          if (R.detectarEntradaEmMasmorra(f, ctx)) { c.estradasFalsas++; nota("abriu", f); }
          /* o tempo é o da tabela */
          if (r && r.rota) {
            c.tempos++;
            const km = kmEntre(r.origem, m);
            const ter = TERRENO_VIAGEM[m.bioma] && TERRENO_VIAGEM[m.bioma].kmDia > 0 ? m.bioma : Bo.IDA_A_MASMORRA.terrenoPadrao;
            const certo = km <= KM_ATE_ONDE_SE_VAI_A_PE
              ? r.rota.modo === "a_pe" && r.rota.minutos === Math.max(Bo.IDA_A_MASMORRA.minutosAPeMinimos, minutosAPe(km))
              : r.rota.modo === "estrada" && r.rota.dias === Math.max(0.5, Math.round((km / TERRENO_VIAGEM[ter].kmDia) * 2) / 2)
                && (jornadaAte(r, { de: cid.nome }) || {}).totalMin === minutosDaRota(r.rota.dias);
            if (!certo) { c.temposErrados++; nota("tempo", `${m.nome}: ${JSON.stringify(r.rota)}`); }
          }
          c.determinismo++;
          if (JSON.stringify(tenta(() => ida(f, ctx))) !== JSON.stringify(r)) { c.naoDeterministas++; nota("det", f); }
        }
        /* o núcleo ("a Nave"), quando o nome tem artigo e a primeira palavra é única */
        const art = /^(A|O)\s+(\S{4,})\s+\S/.exec(m.nome);
        if (art) {
          const cab = norm(art[2]);
          const unico = sabidas.filter((x) => norm(semArt(x.nome)).split(/[^a-z0-9]+/)[0] === cab).length === 1
            && !w.mapa.cidades.some((x) => norm(semArt(x.nome)).split(/[^a-z0-9]+/)[0] === cab);
          const f = `Vou ${comA(`${art[1]} ${art[2]}`)}.`;
          c.nucleos++;
          const r = tenta(() => ida(f, ctx));
          /* único, chega lá; partilhado com outra masmorra ou com uma cidade,
             é ambíguo — e na dúvida não move */
          const certo = unico ? !!r && r.nome === m.nome : r === null;
          if (!certo) { c.nucleosPerdidos++; nota("nucleo", `${f} → ${JSON.stringify(r && r.nome)}`); }
        }
        /* o que não é ida */
        for (const f of [`Onde fica ${m.nome}?`, `Quero ir ${comA(m.nome)}.`, `Amanhã vou ${comA(m.nome)}.`, `"Vou ${comA(m.nome)}", digo.`,
          `Saio ${comDe(m.nome)} e vou à taverna.`, `Vou a ${outra.nome}, que fica longe ${comDe(m.nome)}.`]) {
          c.falsas++;
          if (tenta(() => ida(f, ctx))) { c.falsasQueMovem++; nota("falsa", f); }
        }
      }
      /* as masmorras que ele NÃO conhece não movem */
      /* (o gerador repete nomes entre regiões — "A Nave de Sal" pode existir
         aqui e lá; a homónima de uma conhecida não conta como desconhecida) */
      const nomesSabidos = new Set(sabidas.map((x) => norm(x.nome)));
      for (const m of todas.filter((x) => !sabidas.includes(x) && !nomesSabidos.has(norm(x.nome))).slice(0, 3)) {
        c.falsas++;
        const f = `Vou ${comA(m.nome)}.`;
        if (tenta(() => ida(f, ctx))) { c.falsasQueMovem++; nota("desconhecida", `${cid.nome} › ${f}`); }
      }
    }
  }
  console.log(`       mundos ${c.mundos} · cidades ${c.cidades} · frases de ida ${c.frases}: resolvidas ${c.resolvidas}, perdidas ${c.perdidas}`);
  console.log(`       estradas sem destino / masmorras abertas por elas: ${c.estradasFalsas} · núcleos ${c.nucleos} (perdidos ${c.nucleosPerdidos})`);
  console.log(`       tempos conferidos ${c.tempos} (errados ${c.temposErrados}) · frases que não são ida ${c.falsas} (moveram ${c.falsasQueMovem}) · determinismo ${c.determinismo - c.naoDeterministas}/${c.determinismo}`);
  const x = (k) => (ex[k] || []).join(" | ");
  t(`há masmorras conhecidas para varrer (${c.frases} frases)`, c.frases >= 200);
  t(`toda frase de ida chega à masmorra nomeada (${c.resolvidas}/${c.frases})`, c.frases > 0 && c.perdidas === 0, x("perdida"));
  t(`0 estradas sem destino e 0 portas abertas de longe (${c.estradasFalsas})`, c.estradasFalsas === 0, x("estrada") + x("abriu"));
  t(`o núcleo com maiúscula chega lá (${c.nucleos - c.nucleosPerdidos}/${c.nucleos})`, c.nucleosPerdidos === 0, x("nucleo"));
  t(`o tempo de toda ida é o da tabela (${c.tempos - c.temposErrados}/${c.tempos})`, c.tempos > 0 && c.temposErrados === 0, x("tempo"));
  t(`quem o herói conhece é quem o prompt lhe mostra (${c.mesmaRegra - c.regraDiferente}/${c.mesmaRegra})`, c.regraDiferente === 0, x("regra"));
  t(`nenhuma pergunta, plano, fala, origem ou masmorra desconhecida move (${c.falsasQueMovem}/${c.falsas})`, c.falsas > 0 && c.falsasQueMovem === 0, x("falsa") + x("desconhecida"));
  t(`mesma entrada, mesmo resultado (${c.determinismo - c.naoDeterministas}/${c.determinismo})`, c.naoDeterministas === 0, x("det"));
}

/* ============================================================
   4. O VEREDITO ANTES DA PORTA — a sequência inteira, mundo a mundo
   ============================================================ */
sec("4. o veredito antes da porta");
{
  const c = { idas: 0, vereditoNaPartida: 0, portaFechadaNaEstrada: 0, chegadas: 0, vereditoNaBoca: 0, abreNaBoca: 0, forma: 0 };
  for (const w of MUNDOS) {
    const todas = masmorrasDoMundo(w.semente, w.mapa);
    const cid = w.mapa.cidades[0];
    const ctx = { cidadeAtual: cid.nome, cidades: w.mapa.cidades.map((x) => x.nome), mapa: w.mapa, masmorras: todas, pers: HEROINA };
    for (const m of conhecidas(todas, cid)) {
      const r = tenta(() => ida(`Vou ${comA(m.nome)}.`, ctx));
      if (!r || !r.rota) continue;
      c.idas++;
      const v = veredito(m, HEROINA);
      if (!v) continue;
      if (r.rota.modo !== "estrada" || r.linhas.includes(v.linha)) c.vereditoNaPartida++;
      let j = jornadaAte(r, { de: cid.nome, dia: 1 });
      const naEstrada = { cidadeAtual: cid.nome, emViagem: !!j, lugar: null, masmorras: todas };
      if (!j || R.portaDaMasmorra({ nome: m.nome }, naEstrada).ok === false) c.portaFechadaNaEstrada++;
      let guarda = 0;
      while (j && !(progressoDaViagem(j) || {}).chegou && guarda++ < 50) j = andar(j);
      const ch = tenta(() => chegada(j ? j.alvo : m, { cidade: cid.nome, dia: 9, pers: HEROINA, jornada: j, minutos: r.rota.minutos }));
      if (!ch) continue;
      c.chegadas++;
      if (ch.linhas.includes(v.linha) && /NÃO me ponha lá dentro/.test(ch.nota) && /\[DIFICULDADE/.test(ch.nota)) c.vereditoNaBoca++;
      const aberta = R.detectarEntradaEmMasmorra(`Entro ${comEm(m.nome)}.`, { ...ctx, lugar: ch.lugar });
      if (aberta && aberta.nome === m.nome && R.portaDaMasmorra({ nome: "" }, { cidadeAtual: cid.nome, lugar: ch.lugar, masmorras: todas }).ok) c.abreNaBoca++;
      const p = v.dif.patamar;
      if (v.linha === `${p.icone} ${m.nome} — ${p.rotulo.toUpperCase()}: ${p.nota}. (${v.dif.porque})`) c.forma++;
    }
  }
  console.log(`       idas ${c.idas} · veredito na partida ${c.vereditoNaPartida} · porta fechada na estrada ${c.portaFechadaNaEstrada} · chegadas ${c.chegadas} · veredito à boca ${c.vereditoNaBoca} · abre à boca ${c.abreNaBoca}`);
  t(`o veredito vem na partida (${c.vereditoNaPartida}/${c.idas})`, c.idas > 0 && c.vereditoNaPartida === c.idas);
  t(`a porta não abre pelo caminho (${c.portaFechadaNaEstrada}/${c.idas})`, c.portaFechadaNaEstrada === c.idas);
  t(`a chegada põe à boca com o veredito, e manda o Mestre parar à porta (${c.vereditoNaBoca}/${c.chegadas})`, c.chegadas === c.idas && c.vereditoNaBoca === c.chegadas);
  t(`só à boca a porta abre, com o nome do mundo (${c.abreNaBoca}/${c.chegadas})`, c.abreNaBoca === c.chegadas);
  t(`a linha do veredito é a de sempre (${c.forma}/${c.chegadas})`, c.forma === c.chegadas);
  /* a masmorra do mundo conta as salas que anuncia (antes contava zero) */
  const d12 = D.dificuldadeDaMasmorra({ nome: "x", nivel: 11, salas: 12 }, HEROINA);
  const d0 = D.dificuldadeDaMasmorra({ nome: "x", nivel: 11, salas: [] }, HEROINA);
  t("o veredito da masmorra do mundo conta as salas anunciadas", !!d12 && !!d0 && d12.poderDoConteudo > d0.poderDoConteudo);
  t("e a planta gerada mede como sempre (array)", (D.dificuldadeDaMasmorra({ nome: "x", nivel: 11, salas: new Array(12).fill(0) }, HEROINA) || {}).poderDoConteudo === (d12 || {}).poderDoConteudo);
}

/* ============================================================ */
sec("5. lixo, null, imutabilidade e determinismo");
{
  t("idaAMasmorra com lixo é null", tenta(() => ida(null, null) === null && ida(undefined, undefined) === null && ida("Vou à Nave.", {}) === null && ida("Vou à Nave.", null) === null, false));
  t("e com envelope do sistema também", tenta(() => ida("[VIAGEM] vou à Nave de Ferro", CTX), "x") === null);
  t("nada abre em combate, acampado ou já dentro", ["emCombate", "acampado", "emMasmorra"].every((k) => tenta(() => ida("Vou à Nave de Ferro.", { ...CTX, [k]: true }), "x") === null));
  t("rotaAteAMasmorra com lixo é null", tenta(() => rotaAte(null, null) === null && rotaAte({ nome: "x" }, { x: 1, y: 1 }) === null && rotaAte(NAVE, null) === null, false));
  t("jornadaAteAMasmorra com lixo é null", tenta(() => jornadaAte(null) === null && jornadaAte({}) === null && jornadaAte({ rota: { modo: "estrada" } }, null) === null, false));
  t("chegadaABoca com lixo é null", tenta(() => chegada(null) === null && chegada({}) === null, false));
  t("chegadaABoca sem herói ainda põe à boca (sem veredito)", tenta(() => { const r = chegada(NAVE, null); return !!r && r.lugar.nome === "A Nave de Ferro" && r.linhas.length === 1; }, false));
  t("vereditoDaMasmorra com lixo é null", tenta(() => veredito(null, null) === null && veredito({ nome: "x" }, HEROINA) === null, false));
  t("masmorraDaBoca e masmorrasConhecidas com lixo", tenta(() => daBoca(null, null) === null && daBoca({ nome: "" }, MASMORRAS) === null, false) && conhecidas(null, null).length === 0 && conhecidas(MASMORRAS, {}).length === 0);
  t("pontoDoHeroi aguenta um alvo torto", tenta(() => !!R.pontoDoHeroi({ jornada: { de: "Vau Fincado", para: "A Nave de Ferro", alvo: { coord: "lixo", origem: null } }, mapa: MAPA }), false));
  t("portaDaMasmorra com lixo continua a dizer sim (o de sempre)", tenta(() => R.portaDaMasmorra(undefined, null).ok === true, false));
  t("sem nada que diga onde o herói está, o nome abre como sempre abriu", R.portaDaMasmorra({ nome: "A Nave de Ferro" }, { masmorras: MASMORRAS }).ok === true);
  /* imutabilidade: congelado por inteiro, nada muda e nada estoura */
  const gelo = (o) => { if (o && typeof o === "object" && !Object.isFrozen(o)) { Object.freeze(o); Object.values(o).forEach(gelo); } return o; };
  const ctxG = gelo(JSON.parse(JSON.stringify({ ...CTX, jornada: ESTRADA_SEM_DESTINO })));
  const antes = JSON.stringify(ctxG);
  const r = tenta(() => ida(J8, ctxG));
  const j = tenta(() => jornadaAte(gelo(JSON.parse(JSON.stringify(r))), { de: "Vau Fincado" }));
  const ch = tenta(() => chegada(gelo(JSON.parse(JSON.stringify(j ? j.alvo : NAVE))), { cidade: "Vau Fincado", pers: gelo(JSON.parse(JSON.stringify(HEROINA))) }));
  t("não muta o que recebe (tudo congelado, e tudo funciona)", !!r && !!j && !!ch && JSON.stringify(ctxG) === antes);
  t("mesma frase, mesmo mundo: o mesmo resultado", JSON.stringify(ida(J8, CTX)) === JSON.stringify(ida(J8, CTX)) && JSON.stringify(jornadaAte(ida(J8, CTX), { de: "Vau Fincado", dia: 4 })) === JSON.stringify(jornadaAte(ida(J8, CTX), { de: "Vau Fincado", dia: 4 })));
}

/* ============================================================
   6. A FIAÇÃO — por texto, fim de linha normalizado. É a etapa do
   frontend (MM16 nº 2): fica vermelha até o App ligar o que está acima.
   ============================================================ */
sec("6. a fiação (App.jsx)");
{
  const { readFileSync } = await import("node:fs");
  const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");
  t("fiação: o sistema não escreve \"Sigo viagem pela estrada.\" na boca do herói", !/autor: "jogador", texto: `Sigo viagem pela estrada/.test(app));
  t("fiação: nem \"Encontrei uma entrada\"", !/autor: "jogador", texto: `Encontrei uma entrada/.test(app));
  t("fiação: o despachante lê a ida (sinal ehIdaAMasmorra)", /ehIdaAMasmorra: ler\(/.test(app));
  t("fiação: o movimento chama idaAMasmorra", app.includes("idaAMasmorra(acao"));
  t("fiação: a jornada até à boca nasce de jornadaAteAMasmorra", app.includes("jornadaAteAMasmorra("));
  t("fiação: a chegada à boca passa por chegadaABoca", app.includes("chegadaABoca("));
  t("fiação: viajar e entrarMasmorra perguntam quemResponde", (app.match(/quemResponde\(/g) || []).length >= 2);
  t("fiação: o contexto do rastro leva o mapa e a jornada", /ctxDoRastro = \(\) => \(\{[\s\S]{0,600}?mapa: mapaRef\.current[\s\S]{0,200}?jornada: jornadaRef\.current/.test(app));
}

console.log(`\nnave-destino: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
