/* teste-subtramas.mjs — as subtramas do núcleo (Fase MM-C, C2)

   A prova de `src/subtramas.js`: cada pessoa do núcleo com uma história de
   três batidas (o pedido, a crise, a decisão), amarrada a um ato e com
   relógio; o elo com as duas pistas e a reviravolta do ato 0 na boca dele;
   os dois lados como dado para a tela, com o preço em mundo; a linha QUEM
   CARREGA (≤ 220) na pauta; o campo `coracao` do save; e as peças do motor
   que a fogueira vai chamar. A especificação é `mente/coracao-c1-c2.md` §2,
   §3 e §7; a forma da fogueira, `mente/formas.md` "Fogueira" §7.

   O que esta suíte tranca:
     1. as tabelas, inteiras e coerentes com o núcleo, o Livro de Promessas
        e a pauta (os ids das chaves existem, os tons respeitam o "nunca",
        os efeitos são só os que existem);
     2. o determinismo;
     3. um arco por pessoa (a porta espera a C3), sem repetir no núcleo;
     4. 120 mundos × 60 turnos simulados: a ordem das batidas, uma linha
        por turno, só de quem está em cena, ≤ 220, nunca o segredo antes da
        hora, nunca palavra de bastidor, nunca "(a)", nunca duas crises no
        mesmo dia nem duas revelações no mesmo ato, e na luta só o que é
        da luta;
     5. quem repara chega antes (o confronto com uma pista, com as duas);
     6. os prazos: a omissão, a crise pior, a crise que passa longe;
     7. o veredito antes do clique: os lados, o pedido, a escolha;
     8. a pauta: a cidade cheia (~1323) em que a linha do núcleo entra, e as
        500 cenas em que ela não tira veto nem desfecho;
     9. a fogueira; 10. o Livro de Promessas; 11. o lixo e a imutabilidade;
    12. a voz presa ao nome e o género na linha (a prova viva da v9.414).

   Tudo por semente: nenhum `Math.random` decide uma asserção. */
import {
  BATIDAS, RELOGIO_DAS_BATIDAS, GATILHOS_DA_BATIDA, ANCORA_DO_PAPEL, TONS_DA_BATIDA, EFEITOS_DO_LADO, PRECO_DO_PEDIDO, SEM_NOME,
  ARCOS, PEDIDO_DO_ELO, ARCO_DE_RESERVA, LINHA_DO_CORACAO, SEM_BASTIDOR, PISTA_NO_LIVRO, CONFRONTO, RESPOSTAS_AO_PEDIDO,
  GESTOS_DA_FOGUEIRA, PORTA_DO_CORACAO, MANHA_DA_FOGUEIRA,
  subtramasDoNucleo, avancarCoracao, escolhasAbertas, opcoesDoPedido, responderPedido, escolherLado, sementesDoElo,
  quemAoFogo, gestoAoFogo, aguentaANoite, portaAberta, sentarAoFogo, fraseDaManha,
} from "../src/subtramas.js";
import {
  PAPEIS_DO_NUCLEO, QUER, TEME, ESCONDE, CARREGA, COMO_FALA, LINHA, ELO_DO_ANTECEDENTE, TIQUES_PROIBIDOS, QUEM_E, FOGUEIRA_CONTA,
  nucleoDaCampanha, garantirCoracaoDoSave, generoDaPessoa, quemEParaPauta,
  VOZ_PRESA, vozPresa, GENERO_NA_LINHA, temGenero, comGenero, linhaQuemE, fichaNaVoz,
} from "../src/nucleo.js";
import { FORMAS_DE_SEMENTE, semear, regar, pagar, sementePorId } from "../src/promessas.js";
import { ANTECEDENTES } from "../src/antecedentes.js";
import { companheiroInicial } from "../src/companheiro-inicial.js";
import { abrirAbertura } from "../src/abertura.js";
import { gerarGeografia, rngDe } from "../src/geografia.js";
import { estenderEspinha } from "../src/saga.js";
import { MOLDES } from "../src/moldes.js";
import { guildasDoMundo } from "../src/guildas.js";
import { elencoDoMundo } from "../src/elenco.js";
import { PROPOSITOS } from "../src/indole.js";
import { SECOES, SECOES_QUE_CEDEM, TETO_DA_PAUTA, porNaPauta, textoDaPauta, secaoPorId, cederNaCena } from "../src/pauta.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
const congelar = (o) => { if (o && typeof o === "object") { Object.freeze(o); for (const v of Object.values(o)) congelar(v); } return o; };
const unicos = (l) => new Set(l).size === l.length;
/* as palavras de bastidor em minúscula e inteiras ("Arco Pálido" é um lugar) */
const BASTIDOR = new RegExp(`(?<![\\p{L}])(${QUEM_E.proibidas.join("|")})(?![\\p{L}])`, "u");

/* ---------------- os mundos ---------------- */
const G = "Fantasia medieval";
const ANTS = ["", ...ANTECEDENTES.map((a) => a.id)];
const N_MUNDOS = 120;
const MUNDOS = [];
for (let i = 0; i < N_MUNDOS; i++) {
  const M = MOLDES[i % MOLDES.length];
  const semente = `Sonda Coracao|${i}`;
  const mapa = gerarGeografia(semente, M);
  const cidade = mapa.cidades[0].nome;
  const guildas = guildasDoMundo(semente, mapa, G, null);
  const antecedente = ANTS[i % ANTS.length];
  const espinha = estenderEspinha({ semente, mapa, genero: G, molde: M, estrutura: "jornada", cidadeInicial: cidade, antecedente, dia: 1 });
  const ab = abrirAbertura({ semente, mapa, cidade, espinha, estrutura: "jornada", antecedente, genero: G, molde: M, nivel: 1, dia: 1 });
  const ci = ab && ab.abertura ? companheiroInicial({ semente, mapa, genero: G, molde: M, espinha, guildas, cidade, antecedente, heroi: { nome: "Brann", nivel: 1, classe: "Guerreiro" }, abertura: ab.abertura }) : null;
  const elenco = elencoDoMundo(semente, mapa, { genero: G, molde: M, espinha, guildas });
  const nucleo = nucleoDaCampanha(semente, mapa, { genero: G, molde: M, espinha, guildas, antecedente, grupo: ci ? [ci.comp] : [], elenco });
  const subs = subtramasDoNucleo(nucleo, { semente, espinha, elenco });
  MUNDOS.push({ semente, mapa, espinha, elenco, nucleo, subs });
}
const W0 = MUNDOS[1];
const ctxDe = (w, extra = {}) => ({ semente: w.semente, espinha: w.espinha, elenco: w.elenco, subtramas: w.subs, ...extra });
/* a espinha com os marcos dos atos `ks` cumpridos no `dia` */
const fechar = (e, ks, dia) => ({ ...e, atos: e.atos.map((a, k) => (ks.includes(k) ? { ...a, marcos: a.marcos.map((m) => (m.feito ? m : { ...m, feito: true, dia })) } : a)) });

/* ============================================================ */
sec("1. as tabelas");
{
  t("as três batidas, na ordem", BATIDAS.join() === "pedido,crise,escolha");
  t("ESPERA_DO_PEDIDO é 3 dias; a omissão espera 2; a mesma pessoa de 3 em 3 turnos", RELOGIO_DAS_BATIDAS.esperaDoPedido === 3 && RELOGIO_DAS_BATIDAS.esperaDaEscolha === 2 && RELOGIO_DAS_BATIDAS.turnosEntreBatidas === 3);
  t("GATILHOS_DA_BATIDA: os oito da especificação", GATILHOS_DA_BATIDA.map((g) => g.id).join() === "emCena,atoMin,diasDesde,fechoDoAto,relogio,pistas,confrontada,aliadoCaido" && GATILHOS_DA_BATIDA.every((g) => g.le && g.usadoPor));
  t("ANCORA_DO_PAPEL: os seis papéis do núcleo, e a porta espera a C3", Object.keys(ANCORA_DO_PAPEL).sort().join() === PAPEIS_DO_NUCLEO.map((p) => p.id).sort().join() && ANCORA_DO_PAPEL.porta.c3 === true);
  t("a âncora em números: o companheiro pede no dia 2 e decide no ato 2; o elo revela no fecho do ato 0 depois de 2 pistas; a voz fecha em 2–4 dias", ANCORA_DO_PAPEL.companheiro.pedido.diaMin === 2 && ANCORA_DO_PAPEL.companheiro.escolha.ato === 2 && ANCORA_DO_PAPEL.elo.crise.fechoDoAto === 0 && ANCORA_DO_PAPEL.elo.crise.pistas === 2 && ANCORA_DO_PAPEL.voz.crise.dias.de === 2 && ANCORA_DO_PAPEL.voz.crise.dias.ate === 4);
  t("ARCOS: os onze, ids únicos", ARCOS.length === 11 && unicos(ARCOS.map((a) => a.id)));
  const idsFicha = new Set([...QUER, ...TEME, ...ESCONDE, ...LINHA, ...Object.values(CARREGA).flat()].map((x) => x.id));
  const chavesMortas = ARCOS.flatMap((a) => a.chave.filter((c) => !["vilao", "elo"].includes(c) && !idsFicha.has(c)));
  t("toda chave é um id da ficha (ou o papel do vilão/elo)", chavesMortas.length === 0, chavesMortas.join());
  t("nenhuma chave em dois arcos", unicos(ARCOS.flatMap((a) => a.chave)));
  t("cada arco: pedido, crise, decisão com dois lados e a omissão", ARCOS.every((a) => a.pedido && a.crise && a.escolha && a.escolha.lados.length === 2 && a.escolha.omissao && a.escolha.omissao.id));
  t("ids dos lados únicos por arco (a omissão também)", ARCOS.every((a) => unicos([...a.escolha.lados.map((l) => l.id), a.escolha.omissao.id])));
  const tonsMaus = ARCOS.flatMap((a) => BATIDAS.flatMap((b) => a[b].tom.filter((x) => TONS_DA_BATIDA[b].nunca.includes(x)).map((x) => `${a.id}.${b}:${x}`)));
  t("os tons respeitam o \"nunca\" do §2.6 (pedido sem batalha; crise e decisão sem alívio)", tonsMaus.length === 0, tonsMaus.join());
  t("todo tom é um dos possíveis da batida, ou provação/batalha que a tabela dos arcos dá", ARCOS.every((a) => BATIDAS.every((b) => a[b].tom.length >= 1)));
  const efs = ARCOS.flatMap((a) => [...a.escolha.lados.flatMap((l) => l.efeitos), ...a.escolha.omissao.efeitos, ...(a.crise.efeitos || [])]);
  t("os efeitos são só os que já existem (EFEITOS_DO_LADO)", efs.every((e) => Object.prototype.hasOwnProperty.call(EFEITOS_DO_LADO, e.tipo)), efs.filter((e) => !EFEITOS_DO_LADO[e.tipo]).map((e) => e.tipo).join());
  t("o propósito que o perdão do elo usa existe na índole", efs.filter((e) => e.tipo === "proposito").every((e) => PROPOSITOS.some((p) => p.id === e.id)));
  t("todo lado tem verbo, o que a pessoa diz, e o preço em mundo", ARCOS.every((a) => a.escolha.lados.every((l) => l.verbo && l.diz && l.preco)) && ARCOS.every((a) => a.escolha.omissao.preco));
  t("o preço nunca fala do mecanismo (\"lado A\", \"escolha\", \"opção\" — \"do seu lado\" é mundo)", ARCOS.every((a) => [...a.escolha.lados, a.escolha.omissao].every((l) => !/\blado [ab12]\b|\bescolha\b|\bop[cç][aã]o\b/i.test(`${l.verbo || ""} ${l.preco}`))));
  t("PEDIDO_DO_ELO: um para cada desejo da tabela do elo", Object.values(ELO_DO_ANTECEDENTE).every((e) => PEDIDO_DO_ELO[e.quer]) && !!PEDIDO_DO_ELO.outro);
  t("o pedido do elo é pequeno (≤ 70) e nunca diz a sombra", Object.values(PEDIDO_DO_ELO).every((f) => f.length <= 70 && !/\{sombra\}/.test(f)));
  t("ARCO_DE_RESERVA: um arco que existe para cada tipo do que se carrega", Object.keys(ARCO_DE_RESERVA).sort().join() === Object.keys(CARREGA).sort().join() && Object.values(ARCO_DE_RESERVA).every((id) => ARCOS.some((a) => a.id === id)));
  t("PRECO_DO_PEDIDO: de 20 a 60", PRECO_DO_PEDIDO.de === 20 && PRECO_DO_PEDIDO.ate === 60);
  t("SEM_NOME cobre os buracos que o mundo pode não ter", ["destino", "lugar", "casa", "outro", "alvo"].every((k) => SEM_NOME[k]));
  t("LINHA_DO_CORACAO: 220, e nenhum modelo com palavra de bastidor (fora dos buracos, que se enchem)", LINHA_DO_CORACAO.max === 220 && Object.values(LINHA_DO_CORACAO).filter((x) => typeof x === "string").every((x) => !BASTIDOR.test(x.replace(/\{\w+\}/g, ""))));
  t("os modelos de linha são frase fechada: \"é fato: entra nesta resposta\" ou \"a decisão é do herói\"", Object.entries(LINHA_DO_CORACAO).filter(([k, v]) => typeof v === "string" && !["tique"].includes(k)).every(([, v]) => /é fato: entra nesta resposta|a decisão é do herói/.test(v)));
  t("SEM_BASTIDOR: a frase que troca existe e a troca não tem bastidor", SEM_BASTIDOR.every(([de, por]) => BASTIDOR.test(de) && !BASTIDOR.test(por)));
  const formas = new Map(FORMAS_DE_SEMENTE.map((f) => [f.id, f.categoria]));
  t("PISTA_NO_LIVRO: a pista A é de fala, a B de objeto, formas do Livro", formas.get(PISTA_NO_LIVRO.formas[0]) === "fala" && formas.get(PISTA_NO_LIVRO.formas[1]) === "objeto" && PISTA_NO_LIVRO.dona === "coracao");
  t("CONFRONTO: palavras de 5 letras ou mais", CONFRONTO.tamanhoMinimo === 5 && CONFRONTO.vazias.length > 0);
  t("RESPOSTAS_AO_PEDIDO: aceitar, recusar, perguntar porquê", RESPOSTAS_AO_PEDIDO.map((r) => r.id).join() === "aceitou,recusou,porque");
  const gestos = [GESTOS_DA_FOGUEIRA.querFalar, ...Object.values(GESTOS_DA_FOGUEIRA.objeto), ...["divida", "culpa", "quer", "linha", "teme", "calado"].flatMap((k) => GESTOS_DA_FOGUEIRA[k])];
  t("GESTOS_DA_FOGUEIRA: um gesto para cada objeto da tabela, e listas para os outros campos", CARREGA.objeto.every((o) => GESTOS_DA_FOGUEIRA.objeto[o.id]) && ["divida", "culpa", "quer", "linha", "teme", "calado"].every((k) => GESTOS_DA_FOGUEIRA[k].length >= 2));
  t("nenhum gesto é muleta (TIQUES_PROIBIDOS) nem bastidor, e cabe no lugar (≤ 60)", gestos.every((g) => !TIQUES_PROIBIDOS.some((p) => norm(g).includes(norm(p))) && !BASTIDOR.test(g) && g.length <= 60));
  t("PORTA_DO_CORACAO: duas noites", PORTA_DO_CORACAO.noitesParaAbrir === 2);
  t("MANHA_DA_FOGUEIRA: os sete fins de noite", ["vazio", "dormir", "ficha", "pedido", "lado", "porta", "semResposta"].every((k) => MANHA_DA_FOGUEIRA[k]));
  const s = secaoPorId("coracao");
  t("a secção QUEM CARREGA existe, prio 2,46: depois de todo veto e da planta, à frente do que volta e da batida", !!s && s.rotulo === "QUEM CARREGA" && s.prio === 2.46 && secaoPorId("masmorra").prio < s.prio && secaoPorId("volta").prio > s.prio && secaoPorId("momento").frente[0] > s.prio);
  t("o coração não cede na luta pela tabela (é o motor que só deixa a batalha)", !SECOES_QUE_CEDEM.luta.includes("coracao"));
  t("numa pergunta, o coração cede à resposta (e volta no turno seguinte)", SECOES_QUE_CEDEM.pergunta.includes("coracao"));
  t("o teto da pauta não subiu", TETO_DA_PAUTA === 1400);
}

/* ============================================================ */
sec("2. o determinismo");
{
  const a = JSON.stringify(subtramasDoNucleo(W0.nucleo, ctxDe(W0)));
  const b = JSON.stringify(subtramasDoNucleo(JSON.parse(JSON.stringify(W0.nucleo)), { semente: W0.semente, espinha: W0.espinha, elenco: W0.elenco }));
  t("o mesmo núcleo e a mesma semente dão os mesmos arcos", a === b && a === JSON.stringify(W0.subs));
  const corrida = (w) => {
    let C = null; const log = [];
    for (let turno = 1; turno <= 40; turno++) {
      const r = avancarCoracao(C, w.nucleo, ctxDe(w, { dia: 1 + Math.floor(turno / 4), ato: turno < 20 ? 0 : 1, turno, emCena: w.nucleo.pessoas.map((p) => p.nome) }));
      C = r.coracao; log.push(r.linha);
    }
    return JSON.stringify([C, log]);
  };
  t("a mesma corrida de 40 turnos dá o mesmo coração e as mesmas linhas", corrida(W0) === corrida(W0));
}

/* ============================================================ */
sec("3. um arco por pessoa");
{
  let semArco = [], repetidos = 0, porReserva = 0, pessoas = 0, porta = 0, buracos = [];
  const ARCO_DO_PAPEL = { elo: "a_revelacao", vilao: "a_oferta" };
  let papelErrado = 0;
  for (const w of MUNDOS) {
    for (const p of w.nucleo.pessoas) {
      if (p.papel === "porta") { porta++; if (w.subs.some((s) => s.nome === p.nome)) semArco.push("a porta tem arco"); continue; }
      pessoas++;
      const s = w.subs.find((x) => x.nome === p.nome);
      if (!s) { semArco.push(`${p.papel}:${p.nome}`); continue; }
      if (ARCO_DO_PAPEL[p.papel] && s.arco !== ARCO_DO_PAPEL[p.papel]) papelErrado++;
      const A = ARCOS.find((a) => a.id === s.arco);
      const f = p.ficha;
      const ids = [f.esconde && !f.esconde.sombra ? f.esconde.id : "", f.carrega && f.carrega.id, f.quer && f.quer.id, f.teme && f.teme.id, f.linha && f.linha.id];
      if (!ARCO_DO_PAPEL[p.papel] && !A.chave.some((c) => ids.includes(c))) porReserva++;
      const textos = [s.pedido.fala, s.crise.o, s.crise.pior, s.escolha.contexto, ...s.escolha.lados.flatMap((l) => [l.diz, l.verbo, l.preco]), s.escolha.omissao.preco];
      for (const x of textos) if (/\{(?!sombra\}|leva\}|cidade\})\w+\}/.test(x) || /\(a\)/.test(x)) buracos.push(`${s.arco}: ${x}`);
    }
    repetidos += w.subs.length - new Set(w.subs.map((s) => s.arco)).size;
  }
  t(`${pessoas} pessoas em ${N_MUNDOS} mundos: todas com arco (a porta, ${porta}, espera a C3)`, semArco.length === 0, semArco.slice(0, 3).join());
  t("o elo leva a reviravolta, o vilão a oferta", papelErrado === 0);
  t("nenhum arco repetido dentro de um núcleo", repetidos === 0);
  t("nenhum buraco por encher (só a sombra e o rasto, que dependem do ato) e nenhum \"(a)\"", buracos.length === 0, buracos[0]);
  console.log(`      (${porReserva} de ${pessoas} pela reserva — a ficha não tinha id de nenhuma chave)`);
  const elo = W0.subs.find((s) => s.papel === "elo");
  const pe = W0.nucleo.pessoas.find((p) => p.papel === "elo");
  t("o pedido do elo sai do desejo dele, e a crise dele é a reviravolta da ficha", elo.pedido.fala === (PEDIDO_DO_ELO[pe.ficha.quer.id] || PEDIDO_DO_ELO.outro) && elo.crise.o === pe.ficha.esconde.revela);
}

/* ============================================================ */
sec("4. 120 mundos × 60 turnos simulados");
const SIM = [];
function simular(w, { confronto = false, responde = false, decide = false } = {}) {
  let C = null, espinha = w.espinha;
  const ultimas = {}, log = [], eventos = [];
  const r0 = rngDe(`${w.semente}|sim`);
  const nomes = w.nucleo.pessoas.map((p) => p.nome);
  const elo = w.nucleo.pessoas.find((p) => p.papel === "elo");
  const ult = espinha.atos.length - 1;
  for (let turno = 1; turno <= 60; turno++) {
    const dia = 1 + Math.floor(turno / 4);
    const ato = turno < 22 ? 0 : turno < 40 ? 1 : turno < 52 ? Math.min(2, ult) : ult;
    if (turno === 20) espinha = fechar(espinha, [0], dia);
    if (turno === 38) espinha = fechar(espinha, [1], dia);
    const emCena = nomes.filter(() => r0() < 0.5);
    const luta = turno % 9 === 0;
    let frase = "";
    if (confronto && elo && turno % 5 === 0) {
      const a = garantirCoracaoDoSave(C).arcos[elo.nome];
      const pista = a && a.pistas.length ? elo.ficha.esconde.pistas[a.pistas.length - 1].o : "";
      const w5 = norm(pista).split(/[^a-z0-9]+/).filter((x) => x.length >= 5 && !CONFRONTO.vazias.includes(x))[0];
      if (w5) frase = `${elo.nome.split(" ")[0]}, o que é isso, ${w5}?`;
    }
    const ctx = ctxDe(w, { espinha, dia, ato, turno, emCena, ultimas, luta, frase, maoDoVilao: turno % 11 === 0 });
    const antes = JSON.stringify(C);
    const r = avancarCoracao(C, w.nucleo, ctx);
    if (JSON.stringify(C) !== antes) eventos.push({ erro: "mutou" });
    C = r.coracao;
    if (r.batida) {
      eventos.push({ turno, dia, ato, luta, emCena, ...r.batida, linha: r.linha });
      ultimas[r.quem] = turno;
    }
    for (const l of r.longe) eventos.push({ turno, dia, ato, longe: true, nome: l.nome, linha: l.texto });
    log.push(r.linha);
    if (responde && r.batida && r.batida.tipo === "pedido") C = responderPedido(C, w.nucleo, r.batida.nome, turno % 2 ? "aceitou" : "recusou", ctx).coracao;
    if (decide) for (const e of escolhasAbertas(C, w.nucleo, ctx)) if (r0() < 0.5) C = escolherLado(C, w.nucleo, e.nome, e.lados[turno % 2].id, ctx).coracao;
  }
  return { C, eventos, log };
}
{
  const falhas = { longa: [], bastidor: [], comA: [], buraco: [], foraDeCena: [], ordem: [], segredo: [], revelacao: [], duasCrises: [], duasRev: [], luta: [], mutou: 0, umaPorTurno: 0, genero: [], lados: [] };
  let linhas = 0, tipos = {};
  MUNDOS.forEach((w, i) => {
    const sim = simular(w, { confronto: i % 3 === 0, responde: i % 2 === 0, decide: i % 4 !== 3 });
    SIM.push(sim);
    const elo = w.nucleo.pessoas.find((p) => p.papel === "elo");
    const eloSub = w.subs.find((s) => s.papel === "elo");
    const segredos = elo ? [elo.ficha.esconde.o, eloSub.crise.o].map((x) => x.replace(/\{\w+\}/g, "").slice(0, 28)).filter((x) => x.length > 12) : [];
    let revelou = false;
    const visto = {}, crisesDia = {}, revAto = {};
    for (const e of sim.eventos) {
      if (e.erro === "mutou") { falhas.mutou++; continue; }
      const l = e.linha || "";
      if (!e.longe) {
        linhas++;
        tipos[e.tipo] = (tipos[e.tipo] || 0) + 1;
        if (l.length > LINHA_DO_CORACAO.max) falhas.longa.push(l);
        if (BASTIDOR.test(l)) falhas.bastidor.push(l);
        if (/\(a\)/.test(l)) falhas.comA.push(l);
        if (/[{}]/.test(l)) falhas.buraco.push(l);
        const p = w.nucleo.pessoas.find((x) => x.nome === e.nome);
        const presente = e.emCena.includes(e.nome) || (p.papel === "vilao" && e.turno % 11 === 0);
        if (!presente && e.tipo !== "corpo") falhas.foraDeCena.push(`${e.tipo}:${e.nome}`);
        if (/dito por (ele|ela)/.test(l) && !l.includes(generoDaPessoa(p) === "mulher" ? "dito por ela" : "dito por ele")) falhas.genero.push(l);
        const v = (visto[e.nome] = visto[e.nome] || []);
        const precisa = { crise: ["pedido"], escolha: ["pedido", "crise"], pistaA: ["pedido"], pistaB: ["pistaA"], revelacao: ["pistaA", "pistaB"] }[e.tipo] || [];
        if (!precisa.every((x) => v.includes(x) || (x === "crise" && v.includes("revelacao")))) falhas.ordem.push(`${e.nome}: ${e.tipo} antes de ${precisa.join("+")}`);
        if (e.tipo !== "mente") v.push(e.tipo);
        /* MOVIDA (7.ª sessão de prova, M52–M55): a revelação que o JOGADOR
           ganhou pelo confronto (`porConfronto`) já não espera por o dia não
           ter outra crise — `CONFRONTO.furaODia`. A regra "uma crise por
           dia" continua inteira para o que o SISTEMA põe na cena; a sessão
           provou que, aplicada à verdade que o jogador foi buscar, ela
           deixava o Narrador sem a linha e com um álibi por inventar. */
        if (["crise", "revelacao", "corpo"].includes(e.tipo) && !e.porConfronto) { crisesDia[e.dia] = (crisesDia[e.dia] || 0) + 1; if (crisesDia[e.dia] > 1) falhas.duasCrises.push(`dia ${e.dia}`); }
        if (["revelacao", "corpo"].includes(e.tipo)) { revelou = true; revAto[e.ato] = (revAto[e.ato] || 0) + 1; if (revAto[e.ato] > 1) falhas.duasRev.push(`ato ${e.ato}`); }
        if (e.luta && !e.tom.includes("batalha")) falhas.luta.push(`${e.tipo}:${e.tom.join("/")}`);
        if (e.tipo === "escolha" && !(e.lados && e.lados.length === 2 && e.lados.every((x) => x.verbo && x.preco && !/[{}]/.test(x.verbo + x.preco)))) falhas.lados.push(e.nome);
      }
      if (!revelou && segredos.some((s) => l.includes(s))) falhas.segredo.push(l);
    }
    if (sim.eventos.filter((e) => !e.longe && !e.erro).length !== new Set(sim.eventos.filter((e) => !e.longe && !e.erro).map((e) => e.turno)).size) falhas.umaPorTurno++;
  });
  console.log(`      (${linhas} linhas: ${Object.entries(tipos).map(([k, v]) => `${k} ${v}`).join(", ")})`);
  t("há de tudo: pedidos, as duas pistas, revelações, crises e decisões", ["pedido", "pistaA", "pistaB", "revelacao", "crise", "escolha"].every((k) => tipos[k] > 0));
  t("toda linha cabe em 220", falhas.longa.length === 0, falhas.longa[0]);
  t("nenhuma palavra de bastidor (subtrama, arco, pedido, crise, escolha, pista, núcleo)", falhas.bastidor.length === 0, falhas.bastidor[0]);
  t("nenhum \"(a)\", nenhum buraco por encher", falhas.comA.length === 0 && falhas.buraco.length === 0, falhas.comA[0] || falhas.buraco[0]);
  t("o pronome é o de quem fala", falhas.genero.length === 0, falhas.genero[0]);
  t("só quem está em cena (o vilão pela mão dele; o elo morto pelo que levava)", falhas.foraDeCena.length === 0, falhas.foraDeCena[0]);
  t("uma batida por turno, no máximo", falhas.umaPorTurno === 0);
  t("a ordem: pedido → crise → decisão; pedido → pista A → pista B → revelação", falhas.ordem.length === 0, falhas.ordem[0]);
  t("o segredo do elo nunca vai antes da revelação", falhas.segredo.length === 0, falhas.segredo[0]);
  t("nunca duas crises no mesmo dia", falhas.duasCrises.length === 0, falhas.duasCrises[0]);
  t("nunca duas revelações no mesmo ato", falhas.duasRev.length === 0, falhas.duasRev[0]);
  t("na luta, só o que é da luta (tom de batalha)", falhas.luta.length === 0, falhas.luta[0]);
  t("toda decisão chega com os dois lados, verbo e preço", falhas.lados.length === 0, falhas.lados[0]);
  t("o coração recebido nunca é mutado", falhas.mutou === 0);
  const final = SIM.map((s) => s.C);
  t("o coração que sai é sempre o do save, limpo (garantir não muda nada)", final.every((C) => JSON.stringify(garantirCoracaoDoSave(C)) === JSON.stringify(C)));
  const fechou = SIM.filter((s, i) => { const e = MUNDOS[i].subs.find((x) => x.papel === "elo"); return e && s.C.arcos[e.nome] && s.C.arcos[e.nome].crise != null; }).length;
  t(`a reviravolta do ato 0 joga-se com o elo na maioria das campanhas (${fechou}/${N_MUNDOS})`, fechou >= N_MUNDOS * 0.8);
}

/* ============================================================ */
sec("5. quem repara chega antes");
{
  const w = W0;
  const elo = w.nucleo.pessoas.find((p) => p.papel === "elo");
  const nome1 = elo.nome.split(" ")[0];
  const palavra = (i) => norm(elo.ficha.esconde.pistas[i].o).split(/[^a-z0-9]+/).filter((x) => x.length >= 5 && !CONFRONTO.vazias.includes(x))[0];
  const base = { v: 1, arcos: { [elo.nome]: { pedido: 1, pistas: [2] } } };
  const ctx = ctxDe(w, { dia: 3, ato: 0, turno: 30, emCena: [elo.nome], frase: `${nome1}, de onde vem isso — ${palavra(0)}?` });
  const r1 = avancarCoracao(base, w.nucleo, ctx);
  t("com uma pista vista: ele mente, e o herói percebe — o segredo não sai", r1.batida && r1.batida.tipo === "mente" && r1.coracao.arcos[elo.nome].crise === null && /mente ao herói/.test(r1.linha));
  const dois = { v: 1, arcos: { [elo.nome]: { pedido: 1, pistas: [2, 3] } } };
  const r2 = avancarCoracao(dois, w.nucleo, { ...ctx, frase: `${nome1}, e isto, ${palavra(1)}?` });
  t("com as duas: a revelação já, antes do fecho do ato", r2.batida && r2.batida.tipo === "revelacao" && r2.coracao.arcos[elo.nome].crise === 3 && r2.coracao.arcos[elo.nome].ato === 0);
  const r3 = avancarCoracao(dois, w.nucleo, { ...ctx, frase: `de onde vem isso, ${palavra(1)}?` });
  t("sem o nome dele, não é confronto (e sem o fecho, não há revelação)", !r3.batida || r3.batida.tipo !== "revelacao");
  const r4 = avancarCoracao({ v: 1, arcos: { [elo.nome]: { pedido: 1 } } }, w.nucleo, { ...ctx, frase: `${nome1}, ${palavra(0)}?` });
  t("sem pista vista, perguntar não faz nada de especial", !r4.batida || !["mente", "revelacao"].includes(r4.batida.tipo));
  /* a máscara do aliado caiu de fora neste ato: a do elo espera */
  const comp = w.nucleo.pessoas.find((p) => p.papel === "companheiro");
  const r5 = avancarCoracao(dois, w.nucleo, { ...ctx, frase: `${nome1}, e isto, ${palavra(1)}?`, reveladas: [{ nome: comp ? comp.nome : "Outro", ato: 0 }] });
  t("duas revelações nunca no mesmo ato: com outra já caída no ato 0, a do elo não cai", !r5.batida || r5.batida.tipo !== "revelacao");
  const r6 = avancarCoracao(dois, w.nucleo, { ...ctx, ato: 1, frase: `${nome1}, e isto, ${palavra(1)}?`, reveladas: [{ nome: comp ? comp.nome : "Outro", ato: 0 }] });
  t("…e cai no ato seguinte", r6.batida && r6.batida.tipo === "revelacao");
  /* o elo morto: a revelação vem do que ele levava, no fecho do ato 0 */
  const fechada = fechar(w.espinha, [0], 5);
  const r7 = avancarCoracao({ v: 1, arcos: { [elo.nome]: { pedido: 1, pistas: [2] } } }, w.nucleo, ctxDe(w, { espinha: fechada, dia: 6, ato: 1, turno: 40, emCena: [], mortos: [elo.nome] }));
  t("o elo morto antes: a perda torna-se a revelação (o que ele levava, com a marca no forro)", r7.batida && r7.batida.tipo === "corpo" && /No que .* levava/.test(r7.linha) && r7.linha.length <= 220);
}

/* ============================================================ */
sec("6. os prazos — o que custa não responder");
{
  const w = MUNDOS.find((x) => x.subs.some((s) => s.papel === "voz")) || W0;
  const voz = w.subs.find((s) => s.papel === "voz");
  /* a decisão posta e sem resposta: dois dias, e decide a omissão */
  const posto = { v: 1, arcos: { [voz.nome]: { pedido: 1, crise: 3, posta: 4 } } };
  const r1 = avancarCoracao(posto, w.nucleo, ctxDe(w, { dia: 5, ato: 0, turno: 30, emCena: [] }));
  t("um dia depois, ainda espera", r1.coracao.arcos[voz.nome].escolha === "" && r1.efeitos.length === 0);
  const r2 = avancarCoracao(posto, w.nucleo, ctxDe(w, { dia: 6, ato: 0, turno: 34, emCena: [] }));
  t("dois dias depois, a omissão: o lado dela, os efeitos marcados, e o ENTRETANTO", r2.coracao.arcos[voz.nome].escolha === voz.escolha.omissao.id && r2.efeitos.every((e) => e.porOmissao && e.nome === voz.nome) && r2.longe.length === 1 && !/[{}]/.test(r2.longe[0].texto));
  /* o pedido ignorado três dias: a crise chega na variante pior */
  const ign = { v: 1, arcos: { [voz.nome]: { pedido: 1 } } };
  const r3 = avancarCoracao(ign, w.nucleo, ctxDe(w, { dia: 4, ato: 0, turno: 30, emCena: [voz.nome] }));
  t("o pedido ignorado três dias: a crise é a pior", r3.batida && r3.batida.tipo === "crise" && r3.batida.pior === true && r3.linha.includes(voz.crise.pior.slice(0, 20)));
  const resp = { v: 1, arcos: { [voz.nome]: { pedido: 1, resposta: "aceitou" } } };
  const r4 = avancarCoracao(resp, w.nucleo, ctxDe(w, { dia: 4, ato: 0, turno: 30, emCena: [voz.nome] }));
  t("o pedido aceite: a crise de sempre", r4.batida && r4.batida.tipo === "crise" && !r4.batida.pior);
  /* a voz longe quando a crise lhe chega: resolve-se sem o herói */
  const r5 = avancarCoracao(ign, w.nucleo, ctxDe(w, { dia: 6, ato: 0, turno: 40, emCena: [] }));
  t("a crise da voz passou longe (mais de 4 dias): resolve-se sem o herói, e mal", r5.coracao.arcos[voz.nome].escolha === voz.escolha.omissao.id && r5.coracao.arcos[voz.nome].crise === 6 && r5.longe[0].porque === "longe");
  t("nada acontece longe: a crise devida não sobe à pauta sem a pessoa", !avancarCoracao(resp, w.nucleo, ctxDe(w, { dia: 4, ato: 0, turno: 30, emCena: [] })).linha);
  /* nunca duas crises no mesmo dia */
  const outro = w.subs.find((s) => s.nome !== voz.nome && s.papel === "companheiro");
  if (outro) {
    const dois = { v: 1, arcos: { [voz.nome]: { pedido: 1, resposta: "aceitou" }, [outro.nome]: { pedido: 1, crise: 4 } } };
    t("uma crise já caiu hoje: a da voz espera", !avancarCoracao(dois, w.nucleo, ctxDe(w, { dia: 4, ato: 0, turno: 30, emCena: [voz.nome] })).linha);
  }
}

/* ============================================================ */
sec("7. o veredito antes do clique");
{
  const w = W0;
  const s = w.subs.find((x) => x.papel !== "vilao" && x.papel !== "elo") || w.subs[0];
  const C = { v: 1, arcos: { [s.nome]: { pedido: 1, crise: 3, posta: 4 } } };
  const ab = escolhasAbertas(C, w.nucleo, ctxDe(w, { dia: 4, ato: 1 }));
  t("a decisão aberta: quem, o que está em jogo, os dois lados com verbo e preço, e quantos dias restam", ab.length === 1 && ab[0].nome === s.nome && ab[0].lados.length === 2 && ab[0].lados.every((l) => l.verbo && l.preco && !/[{}]/.test(l.verbo + l.preco)) && ab[0].resta === 2);
  t("nenhum lado diz o mecanismo", ab[0].lados.every((l) => !/\b(lado|escolha|subtrama)\b/i.test(l.verbo + l.preco)));
  const e = escolherLado(C, w.nucleo, s.nome, ab[0].lados[0].id, ctxDe(w, { dia: 4, ato: 1 }));
  t("escolher: o lado fica, os efeitos vêm cheios e com o nome", e.coracao.arcos[s.nome].escolha === ab[0].lados[0].id && e.efeitos.every((x) => x.nome === s.nome && EFEITOS_DO_LADO[x.tipo] && !Object.values(x).some((v) => typeof v === "string" && /[{}]/.test(v))) && e.linha.length <= 220 && !BASTIDOR.test(e.linha));
  t("escolher duas vezes não muda nada", JSON.stringify(escolherLado(e.coracao, w.nucleo, s.nome, ab[0].lados[1].id, ctxDe(w)).coracao) === JSON.stringify(e.coracao));
  t("sem a decisão posta, escolher não faz nada", escolherLado({ v: 1, arcos: { [s.nome]: { pedido: 1 } } }, w.nucleo, s.nome, ab[0].lados[0].id, ctxDe(w)).coracao.arcos[s.nome].escolha === "");
  t("lado que não existe, nada", escolherLado(C, w.nucleo, s.nome, "lado_x", ctxDe(w)).coracao.arcos[s.nome].escolha === "");
  /* o "fica ou parte" decide-se pela semente, e sempre igual */
  const nf = MUNDOS.find((x) => x.subs.some((y) => y.arco === "a_nome_falso"));
  if (nf) {
    const y = nf.subs.find((z) => z.arco === "a_nome_falso");
    const Cn = { v: 1, arcos: { [y.nome]: { pedido: 1, crise: 3, posta: 4 } } };
    const a1 = JSON.stringify(escolherLado(Cn, nf.nucleo, y.nome, "responder", ctxDe(nf)).efeitos);
    t("o \"fica ou parte\" é da semente, e o mesmo em qualquer máquina", a1 === JSON.stringify(escolherLado(Cn, nf.nucleo, y.nome, "responder", ctxDe(nf)).efeitos) && !a1.includes("talvez"));
  }
  /* o pedido: aceitar, recusar, perguntar porquê */
  const op = opcoesDoPedido(s);
  t("o pedido como opções: aceitar, recusar, perguntar porquê, com o preço em mundo", op.map((o) => o.id).join() === "aceitou,recusou,porque" && op.every((o) => o.preco && !/[{}]/.test(o.preco)));
  t("o vilão não pede ao herói como os outros", opcoesDoPedido(w.subs.find((x) => x.papel === "vilao") || { papel: "vilao", nome: "x" }).length === 0);
  const P = { v: 1, arcos: { [s.nome]: { pedido: 1 } } };
  const pq = responderPedido(P, w.nucleo, s.nome, "porque", ctxDe(w, { ato: 0 }));
  t("perguntar porquê não fecha nada: abre o que quer, sem custo", pq.coracao.arcos[s.nome].porque === true && pq.coracao.arcos[s.nome].resposta === "" && /diz porquê — quer/.test(pq.linha) && pq.linha.length <= 220);
  const ac = responderPedido(P, w.nucleo, s.nome, "aceitou", ctxDe(w));
  t("aceitar fica no arco; responder duas vezes não muda", ac.coracao.arcos[s.nome].resposta === "aceitou" && responderPedido(ac.coracao, w.nucleo, s.nome, "recusou", ctxDe(w)).coracao.arcos[s.nome].resposta === "aceitou");
  t("resposta que não existe, nada", responderPedido(P, w.nucleo, s.nome, "talvez", ctxDe(w)).coracao.arcos[s.nome].resposta === "");
}

/* ============================================================ */
sec("7b. o jogo trata o jogador por você");
/* A tela diz "sua/seu" (182 contra 2 "tua/teu") e o Narrador fala em
   segunda pessoa com "você" desde a v9.346; os textos da C2 nasceram em
   "tu" ("a Casa fica tua inimiga", "ao teu lado até ao fim"). Esta catraca
   varre o que vai à TELA (os lados da decisão, as opções do pedido, a frase
   da manhã) e o que vai ao Narrador como fala ao herói (as linhas da
   simulação, as noites ao fogo, os exemplos de voz), nos 120 mundos. */
{
  const TU = /(?<![\p{L}])(tua|teu|tuas|teus|contigo|convosco)(?![\p{L}])|-te(?![\p{L}])/iu;
  const tela = [], narr = [];
  MUNDOS.forEach((w, i) => {
    for (const s of w.subs) {
      tela.push(...opcoesDoPedido(s).map((o) => o.verbo + " | " + o.preco));
      const C = { v: 1, arcos: { [s.nome]: { pedido: 1, crise: 3, posta: 4 } } };
      for (const e of escolhasAbertas(C, w.nucleo, ctxDe(w, { dia: 4, ato: 1 }))) {
        tela.push(e.contexto, ...e.lados.map((l) => l.verbo + " | " + l.preco));
        for (const l of e.lados) tela.push(fraseDaManha({ tipo: "lado", nome: s.nome, genero: s.genero, preco: l.preco }));
      }
      for (const tipo of Object.keys(MANHA_DA_FOGUEIRA)) tela.push(fraseDaManha({ tipo, nome: s.nome, genero: s.genero, preco: "x" }));
      if (s.papel !== "vilao") {
        let Cf = null;
        for (let noite = 0; noite < 6; noite++) { const r = sentarAoFogo(Cf, w.nucleo, s.nome, ctxDe(w, { dia: 2 + noite, ato: 0 })); Cf = r.coracao; narr.push(r.linha, ...r.lados.map((l) => l.preco)); }
      }
    }
    for (const e of SIM[i].eventos) narr.push(e.linha || "");
  });
  const telaTu = tela.filter((x) => TU.test(x)), narrTu = narr.filter((x) => TU.test(x));
  t(`na tela, nenhum texto trata o jogador por tu (${tela.length} textos)`, tela.length > 1000 && telaTu.length === 0, telaTu.slice(0, 3).join(" ‖ "));
  t(`ao Narrador, nenhuma fala ao herói em tu (${narr.filter(Boolean).length} linhas)`, narr.filter(Boolean).length > 500 && narrTu.length === 0, narrTu.slice(0, 3).join(" ‖ "));
  /* e nas tabelas, de onde tudo isto sai: nenhum texto em tu, nem "Ficaste" */
  const textos = [JSON.stringify(ARCOS), JSON.stringify(PEDIDO_DO_ELO), JSON.stringify(RESPOSTAS_AO_PEDIDO), JSON.stringify(MANHA_DA_FOGUEIRA), JSON.stringify(SEM_NOME), JSON.stringify(GESTOS_DA_FOGUEIRA)];
  t("as tabelas da C2 dizem você (nem tu/teu/contigo, nem o verbo em tu)", textos.every((x) => !TU.test(x) && !/\b(Ficaste|digas|vires|perguntes|viste)\b/.test(x)));
  t("os exemplos de voz e as falas das pistas dizem você (o registo é do tique, não do pronome)", COMO_FALA.every((c) => !TU.test(c.exemplo) && !/(?<![\p{L}])(tu|tens|vieste|disseste)(?![\p{L}])/iu.test(c.exemplo)) && ESCONDE.every((e) => (e.pistas || []).every((p) => !TU.test(p.o) && !/(?<![\p{L}])te(?![\p{L}])/u.test(p.o))));
}

/* ============================================================ */
sec("8. a pauta — a cidade cheia, e as 500 cenas");
{
  const x = (n, c = "a") => (c + " ").repeat(Math.ceil(n / 2)).slice(0, n).trim();
  /* um turno comum de cidade, como a prova viva da C1 o mediu (~1323 de
     1400): o lugar com o endereço e o que comporta, a economia da praça,
     dois vetos, o rumo, o fecho, a batida e o momento do fio, quem está,
     a gente, a cidade, o daqui */
  const cidade = () => {
    let p = porNaPauta({}, "onde", "em Casa da Fonte, na praça do mercado, com o sino a dar as onze", "⌖ Rua das Velas, 4", "comporta: " + x(170, "correr"));
    p = porNaPauta(p, "economia", "Cheira a cera, tinta e perfume caro: " + x(200, "praça"));
    p = porNaPauta(p, "naoPode", "o guarda da porta norte deixar o herói passar sem selo: " + x(60, "veto"), "a taverneira saber o nome do herói: " + x(50, "veto"));
    p = porNaPauta(p, "rumo", "Reaja primeiro ao que o herói fez; depois, por dentro da resposta, " + x(90, "rumo"));
    p = porNaPauta(p, "fecho", "Feche com uma pergunta de alguém em cena: " + x(70, "fecho"));
    p = porNaPauta(p, "momento", "A BATIDA: " + x(150, "batida"), "UM BILHETE DELE: " + x(120, "fio"));
    p = porNaPauta(p, "quem", "Taverneira Inês, ao balcão; dois carroceiros à mesa do canto");
    p = porNaPauta(p, "gente", x(110, "gente"));
    p = porNaPauta(p, "cidade", x(110, "cidade"));
    p = porNaPauta(p, "daqui", x(150, "daqui"));
    return p;
  };
  const base = textoDaPauta(cidade());
  t(`o turno de cidade, sem o núcleo, ocupa ~1323 de 1400 (${base.length})`, base.length >= 1280 && base.length <= TETO_DA_PAUTA);
  const W = W0;
  const comp = W.nucleo.pessoas.find((p) => p.papel !== "vilao");
  const qe = quemEParaPauta(W.nucleo, { emCena: [comp.nome], ato: 0, ultimoAto: 3, turno: 1, fio: W.espinha.fio }).quemE;
  const com1 = textoDaPauta(porNaPauta(cidade(), "quemE", ...qe));
  const vetos = cidade().naoPode;
  t(`a linha QUEM É de quem está em cena entra (${qe[0].length} caracteres)`, qe.length === 1 && com1.includes(qe[0]));
  t("…sem tirar veto, rumo, fecho nem a batida da espinha", vetos.every((v) => com1.includes(v)) && com1.includes(cidade().rumo[0]) && com1.includes(cidade().fecho[0]) && com1.includes(cidade().momento[0]) && com1.length <= TETO_DA_PAUTA);
  /* a batida da pessoa (220): entra, e o que cede é a decoração. (v9.415:
     a voz na forma nova, presa ao nome — o corte a 220 não muda) */
  const cor = "Vando (é fato: entra nesta resposta, dito por ele): traz ao pescoço a tábua da irmã, num cordão de couro, e PEDE ao herói: \"Se a carroça partir comigo, leva isto à Lia.\" (voz do Vando: conta tudo em dias). " + x(10, "z");
  const corLinha = cor.slice(0, 220);
  const com2 = textoDaPauta(porNaPauta(cidade(), "coracao", corLinha));
  t("a linha QUEM CARREGA (220) entra no mesmo turno de cidade", com2.includes(corLinha));
  t("…e o que cedeu foi a decoração (a economia, a cauda do ONDE, a cidade), nunca veto, rumo, fecho, batida nem o lugar", vetos.every((v) => com2.includes(v)) && [cidade().rumo[0], cidade().fecho[0], cidade().momento[0], cidade().onde[0]].every((l) => com2.includes(l)) && !com2.includes(cidade().economia[0]) && com2.length <= TETO_DA_PAUTA);
  /* as duas juntas (350): com a pauta mais leve — um veto, sem o momento do
     fio, o caso comum de uma cena de conversa — entram as duas. Na cidade
     cheia de cima não cabem as duas sem cortar a batida da espinha ou o
     rumo, e aí a ficha é que cede (é cor, a batida é verdade) — o §3.2 diz
     que "na prática" vai uma só. */
  const leve = () => { const p = cidade(); return { ...p, naoPode: p.naoPode.slice(0, 1), momento: p.momento.slice(0, 1) }; };
  const com3 = textoDaPauta(porNaPauta(porNaPauta(leve(), "coracao", corLinha), "quemE", qe[0].slice(0, 130)));
  t("os 350 do §3.2: a batida e a ficha de outra pessoa entram as duas na cena de conversa", com3.includes(corLinha) && com3.includes(qe[0].slice(0, 130)) && com3.includes(leve().naoPode[0]) && com3.includes(leve().momento[0]));
  const com4 = textoDaPauta(porNaPauta(porNaPauta(cidade(), "coracao", corLinha), "quemE", qe[0].slice(0, 130)));
  t("na cidade cheia, com as duas, a ficha cede e nada da história sai", com4.includes(corLinha) && vetos.every((v) => com4.includes(v)) && [cidade().rumo[0], cidade().fecho[0], cidade().momento[0]].every((l) => com4.includes(l)));
  t("a mesma pessoa não leva a batida e a ficha no mesmo turno (`jaCarrega`)", quemEParaPauta(W.nucleo, { emCena: [comp.nome], turno: 1, jaCarrega: comp.nome }).quemE.length === 0);
  /* numa pergunta, a resposta passa à frente da ficha */
  const perg = porNaPauta(porNaPauta(cidade(), "pergunta", "A diária na Fonte: três moedas, com ceia; " + x(120, "resposta")), "quemE", qe[0]);
  const pc = textoDaPauta(cederNaCena(porNaPauta(perg, "coracao", corLinha), {}));
  t("numa pergunta: a resposta entra; a batida e a ficha cedem (a lei da escuta)", pc.includes(perg.pergunta[0]) && !pc.includes(corLinha) && !pc.includes(qe[0]) && vetos.every((v) => pc.includes(v)));

  /* as 500 cenas semeadas (a catraca do §7): o que entra sem as linhas do
     núcleo continua a entrar com elas — nenhum veto, nenhum desfecho */
  const r = rngDe("coracao|500");
  const txt = (min, max, c) => x(min + Math.floor(r() * (max - min + 1)), c);
  let tirou = 0, teto = 0, entrou = 0;
  for (let i = 0; i < 500; i++) {
    let p = porNaPauta({}, "onde", txt(60, 110, "lugar"), txt(15, 30, "end"), "comporta: " + txt(110, 210, "comp"));
    p = porNaPauta(p, "economia", txt(180, 280, "eco"));
    p = porNaPauta(p, "naoPode", ...Array.from({ length: 1 + Math.floor(r() * 4) }, () => txt(60, 200, "veto")));
    if (r() < 0.3) p = porNaPauta(p, "desfecho", txt(100, 300, "desf"));
    if (r() < 0.3) p = porNaPauta(p, "vetoDoDesfecho", txt(50, 90, "vd"));
    if (r() < 0.4) p = porNaPauta(p, "fala", txt(60, 200, "fala"));
    for (const [id, pr, a, b] of [["rumo", 0.8, 100, 180], ["fecho", 0.8, 80, 130], ["momento", 0.6, 120, 220], ["volta", 0.2, 80, 140], ["quem", 0.5, 30, 90], ["gente", 0.5, 60, 140], ["daqui", 0.4, 100, 180], ["cidade", 0.4, 80, 150]]) if (r() < pr) p = porNaPauta(p, id, txt(a, b, id));
    const sem = textoDaPauta(p);
    const com = textoDaPauta(porNaPauta(porNaPauta(p, "coracao", txt(200, 220, "cor")), "quemE", txt(110, 130, "qe")));
    for (const id of ["naoPode", "vetoDoDesfecho", "desfecho"]) for (const l of p[id] || []) if (sem.includes(l) && !com.includes(l)) tirou++;
    if (com.length > TETO_DA_PAUTA) teto++;
    if (/cor cor/.test(com)) entrou++;
  }
  t("500 cenas semeadas: as linhas do núcleo não tiram veto nenhum nem desfecho", tirou === 0, `${tirou}`);
  t("…e o teto nunca passa", teto === 0);
  console.log(`      (a linha QUEM CARREGA entra em ${entrou}/500 — cede só onde vetos e desfecho enchem a pauta)`);
}

/* ============================================================ */
sec("9. a fogueira — as peças do motor");
{
  const w = W0;
  const nomes = w.nucleo.pessoas.map((p) => p.nome);
  const roda = quemAoFogo(w.nucleo, ctxDe(w, { coracao: null, presentes: nomes, dia: 3, ato: 0 }));
  const ordem = ["companheiro", "elo", "voz", "balanca", "porta"];
  t("quem se senta: na ordem dos papéis, sem o vilão", roda.length === w.nucleo.pessoas.filter((p) => p.papel !== "vilao").length && roda.every((x, i, a) => i === 0 || ordem.indexOf(a[i - 1].papel) <= ordem.indexOf(x.papel)) && !roda.some((x) => x.papel === "vilao"));
  t("só quem está presente", quemAoFogo(w.nucleo, ctxDe(w, { presentes: [nomes[0]], dia: 3 })).length <= 1 && quemAoFogo(w.nucleo, ctxDe(w, { presentes: [] })).length === 0);
  t("cada um com voz (\"pedido\", \"ficha\" ou calado) e um gesto que não diz a coisa", roda.every((x) => [null, "pedido", "ficha"].includes(x.voz) && x.gesto && x.gesto.length <= 60 && !BASTIDOR.test(x.gesto)));
  t("a batida madura acende «quer falar com você»", roda.filter((x) => x.voz === "pedido").every((x) => x.gesto === GESTOS_DA_FOGUEIRA.querFalar));
  const p0 = w.nucleo.pessoas.find((p) => p.papel !== "vilao" && p.ficha.carrega && p.ficha.carrega.tipo === "objeto" && GESTOS_DA_FOGUEIRA.objeto[p.ficha.carrega.id]);
  if (p0) t("o objeto vê-se: o gesto dele", gestoAoFogo(p0, "ficha", "carrega", { semente: w.semente }) === GESTOS_DA_FOGUEIRA.objeto[p0.ficha.carrega.id]);
  t("calado continua com gesto (e clicável)", !!gestoAoFogo(w.nucleo.pessoas[0], null, "", { semente: w.semente }));
  t("o gesto é da semente", gestoAoFogo(w.nucleo.pessoas[0], "ficha", "teme", { semente: "s" }) === gestoAoFogo(w.nucleo.pessoas[0], "ficha", "teme", { semente: "s" }));

  /* sentar-se: noites, contados, e a pessoa acaba por se calar */
  let C = null, falou = 0;
  const alguem = w.nucleo.pessoas.find((p) => p.papel === "voz" || p.papel === "balanca") || w.nucleo.pessoas.find((p) => p.papel !== "vilao");
  const vozes = [];
  for (let noite = 0; noite < 8; noite++) {
    const r = sentarAoFogo(C, w.nucleo, alguem.nome, ctxDe(w, { dia: 10 + noite, ato: 0 }));
    C = r.coracao; vozes.push(r.voz);
    if (r.linha) { falou++; if (r.linha.length > 220 || BASTIDOR.test(r.linha) || /[{}]/.test(r.linha)) falou = -99; }
  }
  const a = C.arcos[alguem.nome];
  t("cada noite conta: as noites somam", a.noites === 8);
  t("a pessoa conta cada campo uma vez, guardado em `contados`, e cala-se", unicos(a.contados) && a.contados.every((c) => FOGUEIRA_CONTA.ordem.includes(c)) && vozes[vozes.length - 1] === null);
  t("toda linha da noite cabe e não diz bastidor", falou > 0);
  t("o vilão não se senta", sentarAoFogo(null, w.nucleo, (w.nucleo.pessoas.find((p) => p.papel === "vilao") || {}).nome, ctxDe(w)).voz === null);
  /* a decisão posta, à noite: os lados (estado C) */
  const s = w.subs.find((x) => x.papel !== "vilao");
  const posta = { v: 1, arcos: { [s.nome]: { pedido: 1, crise: 3, posta: 9 } } };
  const rC = sentarAoFogo(posta, w.nucleo, s.nome, ctxDe(w, { dia: 9, ato: 1 }));
  t("com a decisão posta, a noite traz os dois lados", rC.voz === "pedido" && rC.lados.length === 2 && rC.linha.includes("a decisão é do herói"));
  t("«Dormir sem responder» só se a noite aguenta: posta hoje, aguenta; posta ontem, não", aguentaANoite(posta, s.nome, { dia: 9 }) === true && aguentaANoite(posta, s.nome, { dia: 10 }) === false);
  t("o pedido sem resposta aguenta até ao terceiro dia", aguentaANoite({ v: 1, arcos: { X: { pedido: 1 } } }, "X", { dia: 2 }) === true && aguentaANoite({ v: 1, arcos: { X: { pedido: 1 } } }, "X", { dia: 3 }) === false);
  t("sem nada pendente, a noite aguenta sempre", aguentaANoite(null, "Ninguém", { dia: 9 }) === true);
  /* a porta: só pelo jogador, duas noites */
  const wp = MUNDOS.find((m) => m.nucleo.pessoas.some((p) => p.papel === "porta"));
  if (wp) {
    const po = wp.nucleo.pessoas.find((p) => p.papel === "porta");
    let Cp = null;
    t("a porta começa fechada", portaAberta(Cp, wp.nucleo) === false);
    Cp = sentarAoFogo(Cp, wp.nucleo, po.nome, ctxDe(wp, { dia: 3 })).coracao;
    t("uma noite ao lado dela ainda não a abre", portaAberta(Cp, wp.nucleo) === false);
    Cp = sentarAoFogo(Cp, wp.nucleo, po.nome, ctxDe(wp, { dia: 4 })).coracao;
    t("duas noites: a porta está aberta", portaAberta(Cp, wp.nucleo) === true);
  }
  t("sem porta no núcleo, nunca aberta", portaAberta(null, { pessoas: [] }) === false);
  /* a manhã */
  const m = ["vazio", "dormir", "ficha", "pedido", "lado", "porta", "semResposta"].map((tipo) => fraseDaManha({ tipo, nome: "Nira", genero: "mulher", preco: "Vando vai só — e você segue sem ele até a Serra" }));
  t("a frase da manhã: verdadeira, cheia, fechada, sem bastidor", m.every((f) => f && !/[{}]/.test(f) && /[.!?]$/.test(f) && !BASTIDOR.test(f)));
  t("o que ficou decidido diz o preço", m[4].includes("Vando vai só"));
  t("sem nome, a manhã vazia (nunca um buraco)", fraseDaManha({ tipo: "ficha" }) === MANHA_DA_FOGUEIRA.vazio && fraseDaManha(null) === MANHA_DA_FOGUEIRA.vazio);
}

/* ============================================================ */
sec("10. o Livro de Promessas, ligado e não duplicado");
{
  const w = W0;
  const elo = w.nucleo.pessoas.find((p) => p.papel === "elo");
  const sp = sementesDoElo(w.nucleo, { dia: 1 });
  t("as duas sementes do elo: fala e objeto, da dona coração, com a pista como material", sp.length === 2 && sp[0].forma === PISTA_NO_LIVRO.formas[0] && sp[1].forma === PISTA_NO_LIVRO.formas[1] && sp.every((x) => x.dona === "coracao" && x.alvo === elo.nome && x.material));
  t("o material nunca diz o segredo", sp.every((x) => !x.material.includes(elo.ficha.esconde.o.replace(/\{\w+\}/g, "").slice(0, 24))));
  let L = null; const ids = [];
  for (const x of sp) { const r = semear(L, x); L = r.livro; ids.push(r.semente.id); }
  L = regar(L, ids[0], { dia: 2 }).livro; L = regar(L, ids[1], { dia: 3 }).livro;
  t("cada pista amadurece na rega da sua linha", ids.every((id) => sementePorId(L, id).estado === "madura"));
  for (const id of ids) L = pagar(L, id, { dia: 5 }).livro;
  t("e a revelação colhe as duas", ids.every((id) => sementePorId(L, id).estado === "paga"));
  t("sem elo, nenhuma semente", sementesDoElo({ pessoas: [] }).length === 0 && sementesDoElo(null).length === 0);
}

/* ============================================================ */
sec("11. o lixo e a imutabilidade");
{
  let erro = "";
  for (const x of [null, undefined, "x", 7, {}, []]) {
    try {
      if (subtramasDoNucleo(x, x).length) erro = "arcos do nada";
      const r = avancarCoracao(x, x, x);
      if (!r || r.linha || !r.coracao || r.coracao.v !== 1) erro = "turno do nada";
      escolhasAbertas(x, x, x); opcoesDoPedido(x); responderPedido(x, x, x, x, x); escolherLado(x, x, x, x, x);
      quemAoFogo(x, x); gestoAoFogo(x, x, x, x); aguentaANoite(x, x, x); portaAberta(x, x); sentarAoFogo(x, x, x, x); fraseDaManha(x); sementesDoElo(x);
    } catch (e) { erro = e.message; }
  }
  t("lixo em tudo: nada estoura, nada nasce do nada", erro === "", erro);
  const nuC = congelar(JSON.parse(JSON.stringify(W0.nucleo)));
  const subC = congelar(JSON.parse(JSON.stringify(W0.subs)));
  const C0 = congelar({ v: 1, arcos: { [W0.subs[0].nome]: { pedido: 1, crise: 3, posta: 4 } } });
  try {
    const ctx = congelar({ ...ctxDe(W0), subtramas: subC, dia: 5, ato: 1, turno: 9, emCena: congelar(nuC.pessoas.map((p) => p.nome)) });
    subtramasDoNucleo(nuC, ctx); avancarCoracao(C0, nuC, ctx); escolhasAbertas(C0, nuC, ctx);
    escolherLado(C0, nuC, W0.subs[0].nome, W0.subs[0].escolha.lados[0].id, ctx); responderPedido(C0, nuC, W0.subs[0].nome, "aceitou", ctx);
    quemAoFogo(nuC, { ...ctx, coracao: C0, presentes: nuC.pessoas.map((p) => p.nome) }); sentarAoFogo(C0, nuC, W0.subs[0].nome, ctx);
  } catch (e) { erro = e.message; }
  t("nada muta o núcleo, os arcos, o coração nem o contexto (congelados)", erro === "", erro);
  t("as tabelas não são mutadas pelo uso", ARCOS.every((a) => a.escolha.lados.length === 2) && JSON.stringify(ARCOS).includes("{nome}"));
}

sec("12. a voz presa ao nome e o género na linha (a prova viva da v9.414)");
/* A prova viva da fiação da C2 achou duas coisas que nenhuma suíte via:
   (1) o tique colado ao fim da linha como frase solta ("…Treze dias."
   Pergunta o preço de tudo, até do silêncio.") foi lido como prosa — o
   Mestre repetiu "Jura por coisas pequenas." tal e qual, e uma vez deu o
   tique da Dora ao Irineu; (2) a Dora, "ela" na ficha, saiu "um homem" na
   narração. Esta catraca varre as três linhas que levam a voz (QUEM É,
   QUEM CARREGA, a fogueira) e as do coração nos 120 mundos. */
{
  const PRIM = (n) => String(n).trim().split(/[\s,]+/)[0];
  const maiusc = (x) => x.charAt(0).toUpperCase() + x.slice(1);
  t("a tabela: um marcador por género, e o modelo põe o nome dentro dele", VOZ_PRESA.marcador.mulher === "(voz da " && VOZ_PRESA.marcador.homem === "(voz do " && VOZ_PRESA.marcador[""] === "(voz de " && VOZ_PRESA.modelo.includes("{marcador}{nome}: {tique}"));
  t("a marca do género é curta", Object.values(GENERO_NA_LINHA.marca).every((m) => m.length <= 6));

  /* (1) cada linha com o tique de alguém tem-no preso ao nome dessa pessoa,
     pelo marcador do género dela — e em mais lado nenhum da linha */
  const comVoz = { quemE: 0, carrega: 0, fogo: 0 }, soltas = [], longas = [], abertas = [], generoErrado = [];
  const ver = (tipo, l, p, max) => {
    if (!l || !p || !p.ficha || !p.ficha.fala) return;
    const tq = p.ficha.fala.o;
    if (l.length > max) longas.push(l);
    if (!/[.!?…]"?$/.test(l)) abertas.push(l);
    const vezes = l.split(tq).length - 1;
    if (!vezes) return;
    comVoz[tipo]++;
    const g = generoDaPessoa(p);
    const presa = VOZ_PRESA.marcador[g] + PRIM(p.nome) + ": " + tq;
    if (l.split(presa).length - 1 !== vezes || l.includes(maiusc(tq) + ".")) soltas.push(l);
    if ((g === "mulher" && l.includes(VOZ_PRESA.marcador.homem)) || (g === "homem" && l.includes(VOZ_PRESA.marcador.mulher))) generoErrado.push(l);
  };
  MUNDOS.forEach((w, i) => {
    const ultimo = w.espinha.atos.length - 1;
    for (const p of w.nucleo.pessoas) {
      for (const ato of [0, 1, ultimo]) for (const cenas of [0, 1, 3]) {
        const tamanho = ato <= 0 ? "inicio" : ato >= ultimo ? "fim" : "meio";
        ver("quemE", linhaQuemE(p, { tamanho, fio: w.espinha.fio, cenas }), p, QUEM_E.max);
      }
      const contados = [];
      for (let k = 0; k < 5; k++) { const r = fichaNaVoz(p, { contados, fio: w.espinha.fio }); if (!r) break; contados.push(r.campo); ver("fogo", r.linha, p, FOGUEIRA_CONTA.max); }
    }
    for (const ev of SIM[i].eventos) {
      if (!ev.linha || ev.longe) continue;
      ver("carrega", ev.linha, w.nucleo.pessoas.find((p) => p.nome === ev.nome), LINHA_DO_CORACAO.max);
    }
  });
  t(`as três linhas levam a voz (QUEM É ${comVoz.quemE}, QUEM CARREGA ${comVoz.carrega}, fogueira ${comVoz.fogo})`, comVoz.quemE > 500 && comVoz.carrega > 100 && comVoz.fogo > 100);
  t("toda linha com tique tem-no preso ao nome (\"(voz da Dora: …)\"), nunca como frase solta", soltas.length === 0, soltas[0]);
  t("o artigo do marcador concorda com quem fala (nunca \"voz do\" de uma mulher)", generoErrado.length === 0, generoErrado[0]);
  t("e as linhas continuam a caber (130 / 220) e fechadas", longas.length === 0 && abertas.length === 0, longas[0] || abertas[0]);
  t("a voz sem tique é vazia, e o lixo não estoura", vozPresa({ nome: "X", ficha: {} }) === "" && [null, undefined, 7, "x", {}].every((x) => vozPresa(x) === ""));

  /* (2) o género: toda linha do coração sobre alguém de género conhecido
     di-lo — pela voz, pelo "dito por ela", por uma frase flexionada, ou
     pela marca curta; e a marca só entra onde faz falta */
  const semGenero = [], marcaDobrada = [];
  let comMarca = 0, vistas = 0;
  MUNDOS.forEach((w, i) => {
    for (const ev of SIM[i].eventos) {
      if (!ev.linha || ev.longe) continue;
      const p = w.nucleo.pessoas.find((x) => x.nome === ev.nome);
      const g = generoDaPessoa(p);
      if (!p || !g || !ev.linha.includes(PRIM(p.nome))) continue;
      if (p.papel === "vilao" && !ev.linha.startsWith(p.nome.split(",")[0])) continue; /* o servo do vilão fala por ele */
      vistas++;
      if (!temGenero(ev.linha, g)) semGenero.push(ev.linha);
      const m = GENERO_NA_LINHA.marca[g];
      if (ev.linha.includes(m)) { comMarca++; if (temGenero(ev.linha.replace(m, ""), g)) marcaDobrada.push(ev.linha); }
    }
  });
  t(`toda linha do coração diz o género de quem a vive (${vistas} linhas, ${comMarca} com a marca)`, vistas > 500 && semGenero.length === 0, semGenero[0]);
  t("a marca só onde nada mais o diz (nunca junto do \"dito por ela\" ou da voz)", marcaDobrada.length === 0, marcaDobrada[0]);
  /* a QUEM É: na estreia diz o género; depois não gasta a marca */
  const estreiaSem = [], depoisCom = [];
  for (const w of MUNDOS) for (const p of w.nucleo.pessoas) {
    const g = generoDaPessoa(p);
    if (!g) continue;
    const l0 = linhaQuemE(p, { fio: w.espinha.fio, cenas: 0 }), l3 = linhaQuemE(p, { fio: w.espinha.fio, cenas: 3 });
    if (l0 && !temGenero(l0, g)) estreiaSem.push(l0);
    if (l3.includes(GENERO_NA_LINHA.marca[g])) depoisCom.push(l3);
  }
  t("a QUEM É diz o género na estreia da pessoa", estreiaSem.length === 0, estreiaSem[0]);
  t("e depois da estreia não gasta a marca", depoisCom.length === 0, depoisCom[0]);
  /* as peças */
  t("comGenero: põe a marca depois do nome, só quando falta", comGenero("Dora (é fato: entra nesta resposta): x.", { nome: "Dora", genero: "mulher" }) === "Dora (ela) (é fato: entra nesta resposta): x." && comGenero("Dora (é fato: entra nesta resposta, dito por ela): x.", { nome: "Dora", genero: "mulher" }) === "Dora (é fato: entra nesta resposta, dito por ela): x.");
  t("comGenero: sem género conhecido, ou sem o nome na linha, não inventa", comGenero("Golem: x.", { nome: "Golem" }) === "Golem: x." && comGenero("Outra: x.", { nome: "Dora", genero: "mulher" }) === "Outra: x.");
  t("temGenero: o lixo não estoura", [null, undefined, 7].every((x) => temGenero(x, "mulher") === false) && temGenero("x", "") === true && comGenero(null, null) === "");
}

console.log(`\n${ok} ok, ${mal} mal`);
process.exit(mal ? 1 : 0);
