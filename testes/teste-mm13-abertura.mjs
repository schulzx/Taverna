/* teste-mm13-abertura.mjs (Fase MM · MM13) — o mundo puxa o herói

   A prova de `src/abertura.js`. A pessoa pediu (29/09) que o herói fosse
   posto na história principal como nos jogos do Matt: o propósito antes
   da cena, a ordem da narração (o mundo, onde estou, a pequena história do
   lugar, porque estou aqui e o que sei), o mundo a pingar fios, o sino que
   faz a história vir, nenhum cartaz com Aceitar antes de estar orientado,
   e o próximo passo sempre à vista.

   O que esta suíte tranca:
     1. as tabelas cobrem o que o jogo tem (estruturas, antecedentes,
        moldes, feitios) e o sino é um relógio de tamanho legal;
     2. a abertura é determinística pela semente;
     3. TODA abertura tem razão e pista — uma pessoa com nome e um lugar
        DESTA cidade, tirados da base do mundo — em 24 mundos (6 géneros ×
        4 moldes) × estruturas × antecedentes, e a principal nasce ACEITA;
     4. o mural espera: fechado no turno 1, aberto depois do primeiro
        passo ou de MURAL.turnos turnos; save antigo, sempre aberto;
     5. a menção não é presença: o nome da pista não conta como encontro
        antes de o herói lá estar;
     6. o sino nunca toca antes do piso, toca por exploração e por
        afastamento, toca uma vez, e de longe vira notícia;
     7. a linha do próximo passo não tem palavra de bastidor;
     8. o fio que o mundo pinga;
     9. lixo e `null`, e a imutabilidade.

   Tudo por semente: nenhum `Math.random` decide uma asserção.

   A SEÇÃO 11 é diferente das outras dez: prova a FIAÇÃO no App.jsx, que é
   React e não roda em Node. Por isso lê o arquivo como TEXTO — a mesma
   técnica de teste-mm12-cidade.mjs (§7) e teste-mm8a-ficha.mjs (§10):
   âncora por chave balanceada, nunca por número de linha, porque o
   arquivo muda sob os pés desta suíte. `\r\n` normalizado para `\n`
   porque o Windows grava com final de linha diferente do que os regex
   abaixo assumem. */
import fs from "node:fs";
import {
  RAZOES_DA_ESTRUTURA, LACOS_DO_ANTECEDENTE, OBJETO_DO_FEITIO, TITULO_DO_FEITIO, O_QUE_SE_SABE,
  LUGARES_DE_CONVERSA, CHEGADAS, HISTORIA_DO_LUGAR, SINO, PRENUNCIOS, ACONTECIMENTOS_DO_SINO,
  SINO_DE_LONGE, MURAL, FIOS, PALAVRAS_DE_BASTIDOR, CONTRACOES,
  garantirAbertura, abrirAbertura, pedidoDaAbertura, muralLiberado, vetosDaAbertura,
  aindaSoUmNome, proximoPasso, fioParaAPrincipal, andarOSino,
} from "../src/abertura.js";
import { gerarGeografia } from "../src/geografia.js";
import { estenderEspinha, FEITIOS, conferirEspinha } from "../src/saga.js";
import { ESTRUTURAS } from "../src/historia.js";
import { ANTECEDENTES } from "../src/antecedentes.js";
import { MOLDES, moldePorId } from "../src/moldes.js";
import { generosDisponiveis } from "../src/nomes.js";
import { oQueExisteAqui, chaveDoLugar, locaisDaCidade, idDoLocal, idDaGente } from "../src/mundo-base.js";
import { conferir, criarMissao, TIPOS, etapaDef } from "../src/missoes.js";
import { TAMANHOS, garantirRelogios } from "../src/relogios.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/* ---------------- os mundos ---------------- */
const GENEROS = generosDisponiveis();
const MUNDOS = [];
for (const g of GENEROS) for (const M of MOLDES) {
  const semente = `Sonda MM13|${g}|${M.id}`;
  const mapa = gerarGeografia(semente, M);
  MUNDOS.push({ semente, genero: g, molde: M, mapa, cidade: mapa.cidades[0].nome });
}
const abrir = (w, estrutura = "jornada", antecedente = "") => {
  const espinha = estenderEspinha({ semente: w.semente, mapa: w.mapa, genero: w.genero, molde: w.molde, estrutura, cidadeInicial: w.cidade });
  return abrirAbertura({ semente: w.semente, mapa: w.mapa, cidade: w.cidade, espinha, estrutura, antecedente, genero: w.genero, molde: w.molde, nivel: 1, dia: 1 });
};
const W0 = MUNDOS[0];
const R0 = abrir(W0, "misterio", "Soldado Reformado");

/* ============================================================ */
sec("1. as tabelas");
{
  t("toda estrutura de historia.js tem razões", ESTRUTURAS.every((e) => (RAZOES_DA_ESTRUTURA[e.id] || []).length >= 2));
  t("toda razão aponta para o objeto e para a cidade", Object.values(RAZOES_DA_ESTRUTURA).flat().every((r) => r.includes("{objeto}") && r.includes("{cidade}")));
  t("todo antecedente tem laço, com o mesmo nome da ficha", ANTECEDENTES.every((a) => LACOS_DO_ANTECEDENTE[a.id] && LACOS_DO_ANTECEDENTE[a.id].nome === a.nome));
  t("todo molde tem chegada", MOLDES.every((m) => CHEGADAS[m.id] && CHEGADAS[m.id].includes("{cidade}")));
  const feitios = Object.keys(OBJETO_DO_FEITIO);
  t("os feitios da abertura são os da espinha", feitios.every((f) => FEITIOS[f]));
  t("cada feitio tem título e acontecimento", feitios.every((f) => TITULO_DO_FEITIO[f] && (ACONTECIMENTOS_DO_SINO[f] || []).length >= 2));
  t("o que se sabe tem as duas vozes", !!O_QUE_SE_SABE.propria && !!O_QUE_SE_SABE.informante);
  t("há lugares de conversa", LUGARES_DE_CONVERSA.length >= 3);
  t("a pequena história tem as quatro formas", ["comMasmorra", "comChefe", "soVocacao", "semVocacao"].every((k) => HISTORIA_DO_LUGAR[k]));
  t("o sino é um relógio de tamanho legal", TAMANHOS.includes(SINO.segmentos));
  t("o piso não é o primeiro minuto", SINO.piso >= 6);
  t("o prenúncio tem as duas formas", !!PRENUNCIOS.comSinal && !!PRENUNCIOS.semSinal);
  t("o sino de longe é notícia", SINO_DE_LONGE.includes("{cidade}") && SINO_DE_LONGE.includes("{o}"));
  t("o mural espera alguns turnos, não a campanha", MURAL.turnos >= 2 && MURAL.turnos <= 12 && !!MURAL.veto);
  t("o fio é minoria da cidade", FIOS.chance > 0 && FIOS.chance < 0.5 && FIOS.como.length >= 2);
  t("as contrações cobrem de, por e em", ["de", "por", "em"].every((p) => CONTRACOES[p] && CONTRACOES[p].o));
  t("a principal é um tipo que se não recusa", TIPOS.principal && TIPOS.principal.forcada === true);
}

/* ============================================================ */
sec("2. determinismo");
{
  const a = abrir(W0, "misterio", "Soldado Reformado");
  t("a mesma semente dá a mesma abertura", JSON.stringify(a) === JSON.stringify(R0));
  const b = abrir(MUNDOS[5], "misterio", "Soldado Reformado");
  t("outra semente dá outra pista", b && b.abertura.pista.nome !== R0.abertura.pista.nome);
  t("o pedido é o mesmo texto", pedidoDaAbertura(a.abertura) === pedidoDaAbertura(R0.abertura));
}

/* ============================================================ */
sec("3. toda abertura tem razão e pista — 24 mundos × estruturas × antecedentes");
{
  let n = 0, falhas = [];
  const pedidos = [];
  MUNDOS.forEach((w, i) => {
    for (const est of [ESTRUTURAS[i % ESTRUTURAS.length].id, ESTRUTURAS[(i + 3) % ESTRUTURAS.length].id]) {
      const ant = ANTECEDENTES[(i + est.length) % ANTECEDENTES.length];
      const r = abrir(w, est, i % 2 ? ant.nome : ant.id);
      n++;
      const onde = `${w.genero}/${w.molde.id}/${est}`;
      if (!r) { falhas.push(`${onde}: sem abertura`); continue; }
      const a = r.abertura, m = r.missao;
      const q = oQueExisteAqui(w.semente, w.mapa, w.cidade, null, w.genero, w.molde);
      if (!a.razao || !a.razao.includes(w.cidade)) falhas.push(`${onde}: razão sem a cidade`);
      if (!q.gente.some((p) => p.nome === a.pista.nome && p.local === a.pista.local)) falhas.push(`${onde}: pista fora da base`);
      if (!q.locais.some((l) => l.nome === a.pista.local)) falhas.push(`${onde}: lugar da pista fora desta cidade`);
      if (!norm(a.razao).includes(norm(LACOS_DO_ANTECEDENTE[ant.id].o).slice(0, 20))) falhas.push(`${onde}: sem o laço do antecedente`);
      if (/\b(de|por|em) (o|a) que\b/i.test(a.razao + " " + a.sabe)) falhas.push(`${onde}: costura "de o que"`);
      if (!(m.tipo === "principal" && m.status === "ativa")) falhas.push(`${onde}: principal não nasceu aceita`);
      /* MM13b (30/09): o primeiro passo era "ir aonde a pista está" (ir_a) e
         passou a ser ENCONTRAR a pista, no lugar dela (falar_com com onde).
         Na prova jogada o ✓ dizia "Chegar a…" a quem ia procurar alguém, e
         o passo contava ao chegar e não ao encontrar. A intenção desta
         asserção fica: o primeiro passo leva à pista, e à morada dela. */
      if (!(m.etapas[0].tipo === "falar_com" && m.etapas[0].alvo === a.pista.nome && m.etapas[0].onde === a.pista.local)) falhas.push(`${onde}: o primeiro passo não é encontrar a pista onde ela está`);
      if (m.etapas.some((e) => e.feito)) falhas.push(`${onde}: passo nascido cumprido`);
      const p = pedidoDaAbertura(a, { habilidades: ["Golpe"] });
      pedidos.push(p.length);
      for (const x of [a.pista.nome, a.chegada, a.historia, a.razao]) if (!p.includes(x)) falhas.push(`${onde}: o pedido não traz "${String(x).slice(0, 30)}"`);
      /* a ordem do Matt: o mundo, onde, a pequena história, porque e o que sei */
      const i1 = p.indexOf("1) O MUNDO"), i2 = p.indexOf("2) ONDE"), i3 = p.indexOf("3) A PEQUENA"), i4 = p.indexOf("4) PORQUE");
      if (!(i1 >= 0 && i1 < i2 && i2 < i3 && i3 < i4)) falhas.push(`${onde}: ordem da narração`);
    }
  });
  t(`${n} aberturas, nenhuma falha`, falhas.length === 0, falhas.slice(0, 6).join(" | "));
  /* O TETO DO PEDIDO: o modelo de `abrirACampanha` (App.jsx, v9.120) tinha
     ~1.420 caracteres crus e ia com o envelope da trama sorteada (~450 a
     550). O pedido novo substitui os dois (medido em 30/09: 1.188 a 1.350
     nos 48 casos) — a abertura não pode custar mais do que custava, e o
     teto fica abaixo da soma com folga para nomes compridos. */
  t(`o pedido cabe em 1.500 caracteres (maior: ${Math.max(...pedidos)})`, Math.max(...pedidos) <= 1500);
  t("o pedido diz que ninguém oferece trabalho", pedidoDaAbertura(R0.abertura).includes("ninguém me oferece trabalho"));
}

/* ============================================================ */
sec("4. o mural espera");
{
  const e1 = { abertura: R0.abertura, missoes: [R0.missao] };
  t("fechado no turno 1", muralLiberado(e1) === false);
  t("e o veto vai à pauta", vetosDaAbertura(e1).length === 1 && vetosDaAbertura(e1)[0] === MURAL.veto);
  /* MM13b: chegar já não cumpre — encontrar é que cumpre. A pista entra no
     registo (e é isso que `falar_com` lê) só depois de o herói estar no
     lugar dela: `aindaSoUmNome`, provado na secção 5. */
  const soChegar = conferir([R0.missao], { lugarAtual: { nome: R0.abertura.pista.local }, npcs: {} });
  t("chegar ao lugar da pista, sem a encontrar, ainda não é o passo", soChegar.missoes[0].etapas[0].feito === false);
  const c = conferir([R0.missao], { lugarAtual: { nome: R0.abertura.pista.local }, npcs: { [R0.abertura.pista.nome]: { nome: R0.abertura.pista.nome, conhecidoEm: 1 } } });
  t("encontrar a pista cumpre o primeiro passo", c.missoes[0].etapas[0].feito === true);
  t("e abre o mural", muralLiberado({ abertura: R0.abertura, missoes: c.missoes }) === true);
  t("e o veto sai", vetosDaAbertura({ abertura: R0.abertura, missoes: c.missoes }).length === 0);
  let ab = R0.abertura;
  for (let i = 0; i < MURAL.turnos - 1; i++) ab = andarOSino(ab, { missoes: [R0.missao] }).abertura;
  t(`ainda fechado ao turno ${MURAL.turnos - 1} sem passo`, muralLiberado({ abertura: ab, missoes: [R0.missao] }) === false);
  ab = andarOSino(ab, { missoes: [R0.missao] }).abertura;
  t(`aberto ao turno ${MURAL.turnos} mesmo sem passo`, muralLiberado({ abertura: ab, missoes: [R0.missao] }) === true);
  t("save antigo (sem abertura): sempre aberto", muralLiberado({ abertura: undefined, missoes: [] }) === true);
  t("principal fora de jogo: aberto", muralLiberado({ abertura: R0.abertura, missoes: [{ ...R0.missao, status: "concluida" }] }) === true);
  t("lixo: aberto", muralLiberado(null) === true && vetosDaAbertura(null).length === 0);
}

/* ============================================================ */
sec("5. a menção não é presença");
{
  const a = R0.abertura;
  t("o nome da pista, antes de lá estar, é só um nome", aindaSoUmNome(a, a.pista.nome, { missoes: [R0.missao], lugar: null }) === true);
  t("sem acento e em minúsculas, também", aindaSoUmNome(a, norm(a.pista.nome), { missoes: [R0.missao] }) === true);
  t("no lugar da pista, é presença", aindaSoUmNome(a, a.pista.nome, { missoes: [R0.missao], lugar: { nome: a.pista.local } }) === false);
  /* MM13b: o primeiro passo é encontrar a pista (era chegar ao lugar dela) */
  const c = conferir([R0.missao], { lugarAtual: { nome: a.pista.local }, npcs: { [a.pista.nome]: { nome: a.pista.nome, conhecidoEm: 1 } } });
  t("depois do primeiro passo, é presença em qualquer lado", aindaSoUmNome(a, a.pista.nome, { missoes: c.missoes }) === false);
  t("outra pessoa nunca é travada", aindaSoUmNome(a, "Fulano de Tal", { missoes: [R0.missao] }) === false);
  t("save antigo: nunca trava", aindaSoUmNome(null, a.pista.nome, {}) === false);
}

/* ============================================================ */
sec("6. o sino");
{
  const principalFechada = [{ ...R0.missao, status: "concluida", etapas: R0.missao.etapas.map((e) => ({ ...e, feito: true })) }];
  /* pressão máxima: um sítio novo e quatro pessoas novas no registo por
     turno, parado na história */
  let ab = R0.abertura, antes = null;
  for (let i = 1; i < SINO.piso; i++) {
    const r = andarOSino(ab, { missoes: [R0.missao], lugar: `sitio ${i}`, conhecidos: i * 4 });
    ab = r.abertura;
    if (r.toque) antes = i;
  }
  t(`nunca toca antes do piso (${SINO.piso}), nem sob pressão máxima`, antes === null);
  const noPiso = andarOSino(ab, { missoes: [R0.missao] });
  t("e toca no piso quando já está cheio", !!noPiso.toque);

  /* por exploração: um sítio novo a cada dois turnos, sem afastamento */
  const quando = (fn, teto = 80) => {
    let a = R0.abertura;
    for (let i = 1; i <= teto; i++) { const r = andarOSino(a, fn(i)); a = r.abertura; if (r.toque) return { i, r }; }
    return null;
  };
  const expl = quando((i) => ({ missoes: principalFechada, lugar: i % 2 ? `rua ${i}` : "" }));
  t(`toca por exploração (turno ${expl && expl.i})`, !!expl && expl.i >= SINO.piso && expl.i <= SINO.piso + 4);
  const afast = quando(() => ({ missoes: [R0.missao] }));
  t(`toca por afastamento, parado (turno ${afast && afast.i})`, !!afast && afast.i >= SINO.piso && afast.i <= SINO.piso + SINO.tolerancia);
  const quieto = quando(() => ({ missoes: principalFechada }));
  t(`quem não explora nem se afasta ouve-o só pelo tempo (turno ${quieto && quieto.i})`, !!quieto && quieto.i === SINO.segmentos * SINO.turnosPorSegmento);
  t("explorar traz o sino antes do tempo", expl.i < quieto.i);

  const tq = expl.r.toque;
  t("o toque é um relógio legal e cheio", garantirRelogios([tq.relogio]).length === 1 && tq.relogio.cheios === tq.relogio.segmentos);
  t("o envelope é o do relógio cheio, com a consequência", tq.envelope.includes(tq.relogio.consequencia) && tq.envelope.includes("ACONTECE"));
  t("a consequência cita a cidade e não tem buraco", tq.relogio.consequencia.includes(R0.abertura.cidade) && !/\{|undefined/.test(tq.relogio.consequencia));
  t("a linha da tela não fala de relógio", !/rel[oó]gio|sino\b.*encheu/i.test(tq.linha));
  const depois = andarOSino(expl.r.abertura, { missoes: principalFechada, lugar: "outra rua" });
  t("toca uma vez só", depois.toque === null && depois.abertura.tocou === true);

  /* o prenúncio: um segmento antes, uma vez */
  let pren = 0, a2 = R0.abertura;
  for (let i = 1; i <= 40; i++) { const r = andarOSino(a2, { missoes: [R0.missao], lugar: `beco ${i}` }); a2 = r.abertura; if (r.prenuncio) pren++; if (r.toque) break; }
  t("o prenúncio chega uma vez, antes do toque", pren === 1);

  /* a pausa: combate, sono, masmorra */
  const p = andarOSino(R0.abertura, { missoes: [R0.missao], lugar: "x", pausa: true });
  t("em pausa o sino não anda", p.abertura.turnos === 0 && p.abertura.cheios === 0);

  /* de longe */
  let a3 = R0.abertura, longe = null;
  for (let i = 1; i <= 60 && !longe; i++) { const r = andarOSino(a3, { missoes: [R0.missao], cidade: "Outra Cidade Qualquer" }); a3 = r.abertura; if (r.toque) longe = r.toque; }
  t("longe da cidade, o sino chega como notícia", !!longe && longe.relogio.consequencia.startsWith("chega a notícia de"));

  /* o teto dos visitados */
  let a4 = R0.abertura;
  for (let i = 0; i < 40; i++) a4 = andarOSino(a4, { missoes: principalFechada, lugar: `p${i}`, conhecidos: i }).abertura;
  t(`o save guarda no máximo ${SINO.tetoVisitados} visitas`, a4.visitados.length <= SINO.tetoVisitados);

  /* a gente nova conta pela diferença do registo, e só uma vez */
  const g1 = andarOSino(R0.abertura, { missoes: principalFechada, conhecidos: 3 }).abertura;
  const g2 = andarOSino(g1, { missoes: principalFechada, conhecidos: 3 }).abertura;
  t("três pessoas novas enchem três", g1.cheios === 3 * SINO.porVisita && g1.conhecidos === 3);
  t("e o mesmo registo no turno seguinte não enche de novo", g2.cheios === g1.cheios);
  t("a lista também serve de contagem", andarOSino(R0.abertura, { missoes: principalFechada, conhecidos: ["a", "b"] }).abertura.cheios === 2 * SINO.porVisita);
  t("sem contagem, a gente não conta", andarOSino(R0.abertura, { missoes: principalFechada }).abertura.cheios === 0);
}

/* ============================================================ */
sec("7. o próximo passo, em voz de mundo");
{
  const bastidor = new RegExp(`\\b(${PALAVRAS_DE_BASTIDOR.map(norm).join("|")})\\b`);
  const falhas = [];
  MUNDOS.forEach((w, i) => {
    const r = abrir(w, ESTRUTURAS[i % ESTRUTURAS.length].id, ANTECEDENTES[i % ANTECEDENTES.length].id);
    if (!r) return;
    const l0 = proximoPasso({ abertura: r.abertura, missoes: [r.missao] });
    /* MM13b: o primeiro passo fecha ao encontrar a pista, não ao chegar */
    const c = conferir([r.missao], { lugarAtual: { nome: r.abertura.pista.local }, npcs: { [r.abertura.pista.nome]: { nome: r.abertura.pista.nome, conhecidoEm: 1 } } });
    const l1 = proximoPasso({ abertura: r.abertura, missoes: c.missoes });
    /* MM13b: quando a pista É o marco (o Nostoc do Matt), a principal tem um
       passo só — encontrá-la — e fecha nele; aí não há próximo passo, e a
       linha vazia é a verdade. Nos outros casos continua a ser defeito. */
    const fechou = c.missoes[0].status === "concluida";
    for (const l of fechou ? [l0] : [l0, l1]) {
      if (!l) falhas.push(`${w.genero}/${w.molde.id}: linha vazia`);
      if (bastidor.test(norm(l))) falhas.push(`${w.genero}/${w.molde.id}: "${l}"`);
      if (/\{|undefined|\|/.test(l)) falhas.push(`${w.genero}/${w.molde.id}: buraco em "${l}"`);
    }
    if (!l0.includes(r.abertura.pista.nome)) falhas.push(`${w.genero}/${w.molde.id}: o primeiro passo não nomeia a pista`);
  });
  t("toda linha de próximo passo é de mundo, nunca de bastidor", falhas.length === 0, falhas.slice(0, 5).join(" | "));
  t("o primeiro passo diz quem e onde", proximoPasso({ abertura: R0.abertura, missoes: [R0.missao] }).startsWith(`Procurar ${R0.abertura.pista.nome}`));
  /* save antigo: a trama ativa também tem próximo passo */
  const trama = criarMissao({ id: "t1", titulo: "Os lobos", tipo: "trama", status: "ativa", etapas: [{ tipo: "derrotar", alvo: "Lobo Cinzento", onde: "o bosque" }], dia: 1 });
  t("save antigo com trama: a linha existe", proximoPasso({ abertura: null, missoes: [trama] }) === "Acabar com Lobo Cinzento — o bosque");
  t("sem história em curso, nada", proximoPasso({ abertura: null, missoes: [] }) === "" && proximoPasso(null) === "");
}

/* ============================================================ */
sec("8. o mundo pinga fios");
{
  const a = R0.abertura, ms = [R0.missao];
  t("a pista tem fio", fioParaAPrincipal({ abertura: a, missoes: ms, semente: W0.semente, pessoa: { nome: a.pista.nome } }).startsWith(a.pista.nome));
  t("o lugar da pista tem fio", fioParaAPrincipal({ abertura: a, missoes: ms, lugar: { nome: a.pista.local } }).length > 0);
  const nomes = Array.from({ length: 400 }, (_, i) => `Pessoa ${i}`);
  const com = nomes.filter((n) => fioParaAPrincipal({ abertura: a, missoes: ms, semente: W0.semente, pessoa: { nome: n } })).length;
  t(`da gente comum, uma minoria ouviu falar (${com}/400)`, com > 400 * FIOS.chance * 0.6 && com < 400 * FIOS.chance * 1.4);
  const n0 = nomes.find((n) => fioParaAPrincipal({ abertura: a, missoes: ms, semente: W0.semente, pessoa: { nome: n } }));
  t("e é sempre a mesma pessoa", fioParaAPrincipal({ abertura: a, missoes: ms, semente: W0.semente, pessoa: { nome: n0 } }) === fioParaAPrincipal({ abertura: a, missoes: ms, semente: W0.semente, pessoa: { nome: n0 } }));
  t("principal fechada: o mundo cala", fioParaAPrincipal({ abertura: a, missoes: [{ ...R0.missao, status: "concluida" }], pessoa: { nome: a.pista.nome } }) === "");
  t("save antigo: nada", fioParaAPrincipal({ abertura: null, pessoa: { nome: "x" } }) === "");
}

/* ============================================================ */
sec("9. lixo, null e imutabilidade");
{
  t("garantirAbertura(null) é legado", garantirAbertura(null).legado === true);
  t("garantirAbertura([]) e texto são legado", garantirAbertura([]).legado === true && garantirAbertura("x").legado === true);
  const vazio = garantirAbertura({});
  t("garantirAbertura({}) tem todos os campos", vazio.v === 1 && Array.isArray(vazio.visitados) && vazio.pista && vazio.alvo && vazio.turnos === 0);
  t("a ida e volta pelo save não muda nada", JSON.stringify(garantirAbertura(JSON.parse(JSON.stringify(R0.abertura)))) === JSON.stringify(R0.abertura));
  t("campos tortos são aparados", garantirAbertura({ turnos: -3, cheios: 999, visitados: [null, 7, "x"], alvo: { feitio: "voar" } }).cheios === SINO.segmentos
    && garantirAbertura({ turnos: -3 }).turnos === 0 && garantirAbertura({ alvo: { feitio: "voar" } }).alvo.feitio === "procurar");
  t("abrirAbertura(null) e ({}) são null", abrirAbertura(null) === null && abrirAbertura({}) === null);
  /* sem espinha e numa cidade fora do mapa (a cidade avulsa da base): a
     história começa por alguém daqui, e a pista é outra pessoa */
  const avulsa = abrirAbertura({ semente: "s", mapa: W0.mapa, cidade: "Vila Inventada", genero: "Fantasia medieval" });
  t("sem espinha e fora do mapa, ainda há razão e pista", !!avulsa && !!avulsa.abertura.pista.nome && avulsa.missao.etapas.length === 2
    && avulsa.abertura.alvo.quem !== avulsa.abertura.pista.nome);
  t("pedidoDaAbertura(null) é vazio", pedidoDaAbertura(null) === "" && pedidoDaAbertura(undefined, {}) === "");
  t("andarOSino(null) não anda", andarOSino(null, null).toque === null && andarOSino(null).abertura.legado === true);
  t("fioParaAPrincipal(null) é vazio", fioParaAPrincipal(null) === "");
  t("aindaSoUmNome sem nome é falso", aindaSoUmNome(R0.abertura, "", {}) === false);
  const congelar = (o) => { Object.freeze(o); for (const v of Object.values(o)) if (v && typeof v === "object") congelar(v); return o; };
  const fixo = congelar(JSON.parse(JSON.stringify(R0.abertura)));
  let erro = null;
  try { andarOSino(fixo, { missoes: [R0.missao], lugar: "praça", conhecidos: ["Zé"] }); } catch (e) { erro = e; }
  t("andarOSino não muta o que recebe", erro === null && fixo.turnos === 0 && fixo.visitados.length === 0);
}

/* ============================================================ */
sec("10. descobrir cumpre-se quando o lugar é revelado (o defeito A)");
{
  /* A etapa `revelar` comparava o NOME do local com o que a base grava ao
     revelar — o ID `Cidade|tipo`, sem o nome dentro. Nunca casava. Estas
     asserções falham em HEAD de 30/09 (antes do conserto) e passam depois. */
  const verRevelar = (e, m) => etapaDef("revelar").ver(e, m);
  let marcoD = null, wD = null;
  for (const w of MUNDOS) {
    for (const est of ESTRUTURAS) {
      const esp = estenderEspinha({ semente: w.semente, mapa: w.mapa, genero: w.genero, molde: w.molde, estrutura: est.id, cidadeInicial: w.cidade });
      marcoD = esp.atos.flatMap((a) => a.marcos).find((m) => m.feitio === "descobrir");
      if (marcoD) { wD = { ...w, esp }; break; }
    }
    if (marcoD) break;
  }
  t("a sonda achou um marco descobrir", !!marcoD);
  const chave = chaveDoLugar(wD.semente, wD.mapa, marcoD.onde, { genero: wD.genero, molde: wD.molde });
  t("a chave do lugar é o id que a base grava (Cidade|tipo)", /\|/.test(chave) && !norm(chave).includes(norm(marcoD.onde)));
  t("a espinha nova já nasce com a chave", marcoD.condicao && marcoD.condicao.chave === chave);
  const ver = (cond, m) => etapaDef(cond.tipo).ver(cond, m);
  const nada = conferirEspinha(wD.esp, { revelados: [] }, ver);
  t("sem nada revelado, o marco continua de pé", !nada.cumpridos.some((m) => m.id === marcoD.id));
  const sim = conferirEspinha(wD.esp, { revelados: [chave] }, ver);
  t("o marco descobrir cumpre-se quando o lugar é revelado", sim.cumpridos.some((m) => m.id === marcoD.id));
  /* a espinha JÁ GRAVADA (sem chave) e as tarefas de guilda: a ponte é a do
     App, `chaveDoLugar` no mundo das missões */
  const antiga = { tipo: "revelar", alvo: marcoD.onde };
  t("etapa antiga sem ponte continua sem casar (o defeito, medido)", verRevelar(antiga, { revelados: [chave] }) === false);
  const ponte = (n) => chaveDoLugar(wD.semente, wD.mapa, n, { genero: wD.genero, molde: wD.molde });
  t("etapa antiga com a ponte do App casa", verRevelar(antiga, { revelados: [chave], chaveDoLugar: ponte }) === true);
  t("a ponte que estoura não derruba o turno", verRevelar(antiga, { revelados: [chave], chaveDoLugar: () => { throw new Error("x"); } }) === false);
  t("o nome dentro do id continua a valer (a gente)", verRevelar({ tipo: "revelar", alvo: "Fina" }, { revelados: [idDaGente("Vila", { nome: "Fina" })] }) === true);
  t("revelado outro lugar não cumpre", verRevelar({ ...antiga, chave }, { revelados: [`${wD.cidade}|nada-disto`] }) === false);
  t("chaveDoLugar de lixo é vazio", chaveDoLugar("s", null, "x") === "" && chaveDoLugar("s", W0.mapa, "") === "" && chaveDoLugar("s", W0.mapa, "Lugar Que Não Existe") === "");
  const l0 = locaisDaCidade(W0.semente, W0.mapa.cidades[0], W0.genero, W0.molde)[0];
  t("chaveDoLugar é o inverso de idDoLocal", chaveDoLugar(W0.semente, W0.mapa, l0.nome, { genero: W0.genero, molde: W0.molde }) === idDoLocal(W0.mapa.cidades[0].nome, l0));
  t("a chave viaja na missão, e só quando existe", criarMissao({ titulo: "x", tipo: "trama", etapas: [{ tipo: "revelar", alvo: "A", chave: "C|t" }] }).etapas[0].chave === "C|t"
    && !("chave" in criarMissao({ titulo: "x", tipo: "trama", etapas: [{ tipo: "revelar", alvo: "A" }] }).etapas[0]));

  /* A VARREDURA: quantas principais ficavam presas. Dá-se a cada uma o
     mundo que a cumpriria — o herói chega ao lugar da pista, o lugar do
     marco é revelado com o id que o App grava, quem se procura foi
     conhecido, o bicho morreu — e confere-se até ela fechar. "Antes" é a
     mesma principal sem a chave e sem a ponte: exatamente o `ver` de antes. */
  const chavesErradas = [];
  const presaCom = (missao, a, w, semChave) => {
    let ms = [semChave ? { ...missao, etapas: missao.etapas.map(({ chave: _c, ...e }) => e) } : missao];
    /* o id que o App grava quando o lugar entra em cena NA CIDADE DELE. Os
       moldes repetem nomes de local entre cidades (a Torre tem um "Fogo do
       Patamar" em cada andar), e só a chave da espinha sabe qual é a cidade
       do marco; que ela aponta para um local com esse nome, nessa cidade,
       confere-se à parte, logo abaixo. */
    const rev = missao.etapas.find((e) => e.tipo === "revelar");
    const alvoLocal = rev ? (rev.chave || chaveDoLugar(w.semente, w.mapa, rev.alvo, { genero: w.genero, molde: w.molde })) : "";
    if (rev && rev.chave) {
      const cid = w.mapa.cidades.find((c) => rev.chave.startsWith(`${c.nome}|`));
      const l = cid && locaisDaCidade(w.semente, cid, w.genero, w.molde).find((x) => idDoLocal(cid.nome, x) === rev.chave);
      if (!l || l.nome !== rev.alvo) chavesErradas.push(`${w.genero}/${w.molde.id}: ${rev.chave} ≠ ${rev.alvo}`);
    }
    const mundo = {
      lugarAtual: { nome: a.pista.local },
      revelados: alvoLocal ? [alvoLocal] : [],
      /* MM13b: e a pista, que o primeiro passo agora pede que se encontre */
      npcs: { [a.pista.nome]: { nome: a.pista.nome, conhecidoEm: 1 }, ...(a.alvo.quem ? { [a.alvo.quem]: { nome: a.alvo.quem, conhecidoEm: 1 } } : {}) },
      derrotados: a.alvo.alvo ? [a.alvo.alvo] : [],
    };
    for (let i = 0; i < 4; i++) ms = conferir(ms, mundo).missoes;
    return ms[0].status !== "concluida";
  };
  const porGenero = {};
  MUNDOS.forEach((w, i) => {
    for (const est of ESTRUTURAS) {
      const r = abrir(w, est.id, ANTECEDENTES[i % ANTECEDENTES.length].id);
      if (!r) continue;
      const g = (porGenero[w.genero] = porGenero[w.genero] || { n: 0, antes: 0, depois: 0 });
      g.n++;
      if (presaCom(r.missao, r.abertura, w, true)) g.antes++;
      if (presaCom(r.missao, r.abertura, w, false)) g.depois++;
    }
  });
  const pct = (a, n) => `${Math.round((100 * a) / Math.max(1, n))}%`;
  for (const [g, v] of Object.entries(porGenero)) console.log(`       ${g.padEnd(18)} ${String(v.n).padStart(3)} principais · presas antes ${pct(v.antes, v.n).padStart(4)} · depois ${pct(v.depois, v.n)}`);
  const tot = Object.values(porGenero).reduce((s, v) => ({ n: s.n + v.n, antes: s.antes + v.antes, depois: s.depois + v.depois }), { n: 0, antes: 0, depois: 0 });
  t(`antes do conserto, ${pct(tot.antes, tot.n)} das ${tot.n} principais ficavam presas (o defeito existia)`, tot.antes > 0);
  t("depois, nenhuma principal fica presa", tot.depois === 0);
  t("e toda chave aponta para um local com aquele nome, naquela cidade", chavesErradas.length === 0, chavesErradas.slice(0, 3).join(" | "));
}

/* ============================================================ */
sec("11. a fiação — App.jsx e painel-diario.jsx");
{
  const app = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");
  const diario = fs.readFileSync(new URL("../src/painel-diario.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");

  /* extrai o corpo de uma função a partir de uma âncora que TERMINA na
     chave que abre o corpo — funciona para `const nome = (...) => {` e
     para `const nome = useCallback((...) => {`, sem precisar casar
     parênteses (a âncora já inclui os do cabeçalho). */
  const corpoApos = (fonte, ancora) => {
    const ini = fonte.indexOf(ancora);
    if (ini < 0) return "";
    const abre = ini + ancora.length - 1;
    let prof = 0;
    for (let i = abre; i < fonte.length; i++) {
      if (fonte[i] === "{") prof++;
      else if (fonte[i] === "}") { prof--; if (prof === 0) return fonte.slice(abre, i + 1); }
    }
    return "";
  };

  /* ---- 1. os imports ---- */
  t("App.jsx importa as nove funções de abertura.js",
    app.includes('import { abrirAbertura, garantirAbertura, pedidoDaAbertura, muralLiberado, vetosDaAbertura, aindaSoUmNome, proximoPasso, fioParaAPrincipal, andarOSino } from "./abertura.js";'));
  t("App.jsx importa chaveDoLugar de mundo-base.js",
    app.includes("masmorrasDoMundo, chaveDoLugar, BASE_PROMPT } from \"./mundo-base.js\";"));

  /* ---- 2. os refs ---- */
  t("a abertura vive num ref, garantido no nascimento", app.includes("const aberturaMundoRef = useRef(garantirAbertura(null));"));
  t("o prenúncio do sino vive noutro, e nasce vazio", app.includes('const sinoDoTurnoRef = useRef("");'));

  /* ---- 3. iniciar — a abertura substitui a trama forçada ---- */
  const iniciar = corpoApos(app, "const iniciar = (pers) => {");
  t("a âncora de iniciar existe, e o corpo não está vazio", iniciar.length > 3000);
  t("chama abrirAbertura dentro de um try, guardado por calou",
    iniciar.includes("ab = abrirAbertura({") && iniciar.includes('calou("a abertura", e); ab = null;')
    && iniciar.indexOf("try {") < iniciar.indexOf("ab = abrirAbertura({") && iniciar.indexOf("ab = abrirAbertura({") < iniciar.indexOf('calou("a abertura", e)'));
  t("a principal da abertura substitui qualquer missão de mesmo id, sem apagar as outras",
    iniciar.includes("missoesRef.current = [...(missoesRef.current || []).filter((m) => m.id !== ab.missao.id), ab.missao];"));
  t("a abertura vai para o ref, e o pedido substitui abrirACampanha",
    iniciar.includes("aberturaMundoRef.current = ab.abertura;")
    && iniciar.includes("enviar(pedidoDaAbertura(ab.abertura, { habilidades: (pers.habilidades || []).map((h) => h.nome) }), pers, []);"));
  {
    /* sem pista (abrirAbertura devolveu null): o caminho antigo — trama
       forçada + abrirACampanha — continua de pé, dentro do `else`. */
    const iElse = iniciar.indexOf("} else {");
    const iNulo = iniciar.indexOf("aberturaMundoRef.current = garantirAbertura(null);", iElse);
    const iCampanha = iniciar.indexOf("enviar(abrirACampanha(pers), pers, []);");
    t("sem pista, o caminho antigo (trama forçada + abrirACampanha) continua de pé",
      iElse >= 0 && iNulo > iElse && iCampanha > iNulo);
  }
  {
    /* um capítulo novo (mesma campanha) cai para legado ANTES do envelope
       de capítulo — nunca herda a abertura da campanha anterior */
    const iNuloCap = iniciar.indexOf("aberturaMundoRef.current = garantirAbertura(null);");
    const iPushCap = iniciar.indexOf("linhaDoNovoCapitulo(historiaRef.current.capitulo, cap.forma)");
    t("um capítulo novo cai para legado antes do envelope de capítulo (nunca herda a abertura de antes)",
      iNuloCap >= 0 && iPushCap > iNuloCap && (iPushCap - iNuloCap) < 400);
  }
  t("defeito B: a espinha usa a estrutura ESCOLHIDA agora, não a da campanha anterior",
    iniciar.includes("estrutura: (mundo && mundo.estrutura) || historiaRef.current.estrutura,"));
  t("defeito C: campanha nova esvazia as missões da anterior, nunca num capítulo",
    iniciar.includes("if (!cap) { missoesRef.current = []; setMissoes([]); }"));

  /* ---- 4. save/load ---- */
  const salvar = corpoApos(app, "const salvar = useCallback((extra = {}) => {");
  t("a abertura entra no save", salvar.length > 200 && salvar.includes("abertura: aberturaMundoRef.current,"));
  const continuar = corpoApos(app, "const continuar = (comResumo, { silencioso = false } = {}) => {");
  t("e volta do save, garantida (legado sem ela)", continuar.length > 200 && continuar.includes("aberturaMundoRef.current = garantirAbertura(sv.abertura);"));

  /* ---- 5. o mural fecha até o herói estar orientado ---- */
  const oferecer = corpoApos(app, "const oferecerTrabalhoDaqui = () => {");
  t("oferecerTrabalhoDaqui espera o mural, na primeira linha do corpo",
    oferecer.length > 100 && /^\{\s*\/\*[^]*?\*\/\s*if \(!muralLiberado\(\{ abertura: aberturaMundoRef\.current, missoes: missoesRef\.current \}\)\) return;/.test(oferecer.slice(0, 260)));
  const mural = corpoApos(app, "const garantirMural = (forcar = false) => {");
  t("garantirMural espera o mural", mural.includes("if (!muralLiberado({ abertura: aberturaMundoRef.current, missoes: missoesRef.current })) return;"));
  const trama = corpoApos(app, "const talvezDarUmaTrama = ({ forcar = false } = {}) => {");
  t("a trama forçada espera o mural, salvo quando forçada (a própria abertura)",
    trama.includes('if (!forcar && !muralLiberado({ abertura: aberturaMundoRef.current, missoes: missoesRef.current })) return "";'));
  const aplicar = corpoApos(app, "const aplicarResposta = useCallback((resp, persAtual) => {");
  t("o corpo de aplicarResposta não está vazio", aplicar.length > 20000);
  const cronista = corpoApos(app, "const cronistaDoTurno = async (pers, narrativa) => {");
  t("a proposta do Cronista (missao_oferecida, em cronistaDoTurno) respeita o mural",
    cronista.length > 200 && cronista.includes('if (prop && typeof prop === "object" && prop.titulo && muralLiberado({ abertura: aberturaMundoRef.current, missoes: missoesRef.current })) {'));
  const soleira = corpoApos(app, "const ofertasDaSoleira = () => {");
  t("a soleira não oferece cartaz oferecido antes do mural abrir",
    soleira.length > 200 && soleira.includes("for (const c of (mural || []).filter((c) => c && c.oferecido && podeAceitarCartaz(c) && muralLiberado({ abertura: aberturaMundoRef.current, missoes: missoesRef.current }))) {"));
  const pauta = corpoApos(app, 'const pautaDoTurno = (acaoDoTurno = "") => {');
  t("o corpo de pautaDoTurno não está vazio", pauta.length > 3000);
  t("o veto do mural vai à pauta (NÃO PODE), junto do veto do geógrafo",
    pauta.includes('p = porNaPauta(p, "naoPode", g.naoPode);') && pauta.includes('p = porNaPauta(p, "naoPode", vetosDaAbertura({ abertura: aberturaMundoRef.current, missoes: missoesRef.current }));')
    && pauta.indexOf('p = porNaPauta(p, "naoPode", g.naoPode);') < pauta.indexOf("vetosDaAbertura("));

  /* ---- 6. a menção não é presença (três sítios) ---- */
  t("os NPCs que o Mestre envia não registam a pista/alvo antes da hora",
    aplicar.includes("if (aindaSoUmNome(aberturaMundoRef.current, n.nome, { lugar: lugarRef.current, missoes: missoesRef.current })) return;"));
  t("nem as pessoas do cânone sem ficha",
    aplicar.includes("if (aindaSoUmNome(aberturaMundoRef.current, nome, { lugar: lugarRef.current, missoes: missoesRef.current })) continue;"));
  t("nem quem é só mencionado na narrativa — e sai também dos ids de revelação",
    aplicar.includes("const genteRevelavel = m.gente.filter((p) => !aindaSoUmNome(aberturaMundoRef.current, p.nome, { lugar: lugarRef.current, missoes: missoesRef.current }));")
    && aplicar.includes("...genteRevelavel.map((p) => idDaGente(cidadeAtualRef.current, p)),")
    && aplicar.includes("if (genteRevelavel.length) {"));

  /* ---- 7. o sino ---- */
  const marcarMundo = corpoApos(app, "const marcarTurnoDoMundo = () => {");
  t("o corpo de marcarTurnoDoMundo não está vazio", marcarMundo.length > 200);
  t("o sino anda a cada turno de mundo, dentro de um try guardado por calou",
    marcarMundo.includes("const s = andarOSino(aberturaMundoRef.current, {") && marcarMundo.includes('calou("o sino da abertura", e);')
    && marcarMundo.indexOf("try {") < marcarMundo.indexOf("andarOSino(") && marcarMundo.indexOf("andarOSino(") < marcarMundo.indexOf('calou("o sino da abertura"'));
  t("a abertura devolvida pelo sino substitui a de antes", marcarMundo.includes("aberturaMundoRef.current = s.abertura;"));
  t("o prenúncio vira aviso de um turno", marcarMundo.includes("if (s.prenuncio) sinoDoTurnoRef.current = s.prenuncio;"));
  t("o toque entra na cena (pushMsgs) e no envelope do turno (notaRef) — sem CHAMAR marcarNoArco",
    marcarMundo.includes('pushMsgs([{ autor: "sistema", texto: s.toque.linha }]);')
    && marcarMundo.includes('notaRef.current = `${notaRef.current ? notaRef.current + "\\n" : ""}${s.toque.envelope}`;')
    && !marcarMundo.includes("marcarNoArco("));
  t("o prenúncio do turno entra na pauta (MOMENTO) e se apaga depois de dito",
    pauta.includes('if (sinoDoTurnoRef.current) { p = porNaPauta(p, "momento", sinoDoTurnoRef.current); sinoDoTurnoRef.current = ""; }'));

  /* ---- 8. o mundo pinga fios ---- */
  t("um fio por turno, de quem está em cena, na secção GENTE, guardado por calou",
    pauta.includes("for (const pessoa of aqui || []) {")
    && pauta.includes("const fio = fioParaAPrincipal({ abertura: aberturaMundoRef.current, missoes: missoesRef.current, semente: sementeMundo(), pessoa });")
    && pauta.includes('if (fio) { p = porNaPauta(p, "gente", fio); break; }')
    && pauta.includes('calou("o fio da abertura", e);'));

  /* ---- 9/10. a ponte do "descobrir" (o defeito A que o backend consertou) ---- */
  const mundoDasMissoes = corpoApos(app, "const mundoDasMissoes = (persAtual) => {");
  t("mundoDasMissoes dá ao App.jsx a chave do lugar, para a etapa antiga casar",
    mundoDasMissoes.length > 100 && mundoDasMissoes.includes("chaveDoLugar: (n) => chaveDoLugar(sementeMundo(), mapaRef.current, n, { genero: generoMundo(), molde: moldeMundo(), lex: (mundoAtual() || {}).lexico, cidade: cidadeAtualRef.current }),"));

  /* ---- o próximo passo sempre à vista (painel-diario.jsx) ---- */
  t("o painel do diário lê proximoPasso de abertura.js", diario.includes('import { proximoPasso } from "./abertura.js";'));
  t("só a missão principal fala em voz de mundo — as outras continuam com a etapa crua",
    diario.includes('if (m.tipo === "principal") { try { pistaMundo = proximoPasso({ abertura, missoes: todas }); } catch { pistaMundo = ""; } }'));
  t("e o cartão usa a pista do mundo quando ela existe, senão a etapa crua",
    diario.includes("{etapaDef(atual.tipo).icone} {pistaMundo || textoDaEtapa(atual)}"));
  {
    /* PainelDiario mora dentro de PainelLateral (outro componente, definido
       ANTES de Taverna() no arquivo) — aberturaMundoRef não está no escopo
       ali. A cadeia certa é: Taverna() lê o ref e passa por PROP a quem
       invoca PainelLateral; PainelLateral recebe a prop e repassa por prop
       a quem invoca PainelDiario. As três pontas, por texto. */
    t("PainelLateral recebe a abertura por prop", app.includes("aoGerarCronica = null, alforje = null, abertura = null }) {"));
    t("...e repassa ao painel do diário", app.includes('<PainelDiario historia={historia} quests={quests} trocarArco={trocarArco} eventos={eventos} diaAtual={dia} missoes={missoes} aoResponderMissao={onResponderMissao} aoEncerrarLegado={onEncerrarLegado} pers={personagem} abertura={abertura} />'));
    t("e quem invoca PainelLateral (dentro de Taverna()) manda o ref", app.includes("aoIrAoMenu={irMenu} aoGerarCronica={gerarCronica} alforje={alforjeDoPainel} abertura={aberturaMundoRef.current} />"));
  }
}

console.log(`\nmm13-abertura: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
