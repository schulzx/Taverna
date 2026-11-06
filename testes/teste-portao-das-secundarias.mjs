/* teste-portao-das-secundarias.mjs — o portão da introdução (Fase SQ · SQ2, 05/11)

   A prova de `src/portao-das-secundarias.js`. A pessoa, a 05/11: as
   secundárias não aparecem no começo do jogo, o jogador entra na história
   sem ruído, e o mural só a partir de um certo nível. O censo de SQ1
   (`mente/sq1-censo.md`) mediu o antes.

   O que esta suíte tranca:
     1. a tabela: o primeiro marco OU o nível 3; o mural nunca antes do
        portão; o veto é a mesma frase da MM13;
     2. o portão numa campanha nova de verdade (geografia, espinha,
        abertura): fechado no nível 1 e no começo; aberto pelo marco ou pelo
        nível; o mural só pelo nível;
     3. o lixo e o save antigo: nunca estoura, e o que já jogava fica aberto;
     4. cada fonte pura calada com o portão fechado e viva com ele aberto —
        a noite (geradores.js), o correio, o figurante (depois-do-turno), a
        proposta do Cronista, a trama (prelúdio) e o veto da pauta;
     5. a imutabilidade e o determinismo.

   Tudo por semente: nenhum `Math.random` decide uma asserção. */
import { PORTAO_DAS_SECUNDARIAS, secundariasAbertas } from "../src/portao-das-secundarias.js";
import { abrirAbertura, MURAL } from "../src/abertura.js";
import { gerarGeografia } from "../src/geografia.js";
import { estenderEspinha } from "../src/saga.js";
import { MOLDES } from "../src/moldes.js";
import { processarDescansoLongoEventos } from "../src/geradores.js";
import { processarDiaCorreio, garantirCorreio } from "../src/correio.js";
import { rng, hashSemente } from "../src/semente.js";
import { XP_ACUMULADO } from "../src/regras.js";
import { textoDaPauta } from "../src/pauta.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const copia = (x) => JSON.parse(JSON.stringify(x));
const P = PORTAO_DAS_SECUNDARIAS;

/* uma campanha nova, como o `iniciar` do App a monta */
const semente = "Prova SQ2|portão";
const M = MOLDES[0];
const mapa = gerarGeografia(semente, M);
const cidade = mapa.cidades[0].nome;
const espinha = estenderEspinha({ semente, mapa, molde: M, estrutura: "jornada", cidadeInicial: cidade });
const R0 = abrirAbertura({ semente, mapa, cidade, espinha, estrutura: "jornada", antecedente: "", molde: M, nivel: 1, dia: 1 });
const abertura = R0 && R0.abertura;
/* a espinha com o primeiro marco cumprido (imutável: a original não muda) */
const comMarco = (e) => ({ ...e, atos: e.atos.map((a, i) => (i === 0 ? { ...a, marcos: a.marcos.map((m, j) => (j === 0 ? { ...m, feito: true } : m)) } : a)) });
const espinhaFeita = comMarco(espinha);

sec("1. A tabela");
t("o portão abre com o primeiro marco", P.marcos === 1);
t("ou com o nível 3 — o fim do aprendizado da 5e (900 XP)", P.nivel === 3 && XP_ACUMULADO[P.nivel - 1] === 900);
t("o mural nunca abre antes do portão", P.nivelDoMural >= P.nivel);
t("o veto é a frase da MM13 (a pauta leva-a uma vez só)", P.veto === MURAL.veto && typeof P.veto === "string" && P.veto.length > 10);
t("a tabela não se muda por fora", Object.isFrozen(P));

sec("2. Numa campanha nova");
t("a campanha nasceu com abertura e espinha", !!abertura && espinha.atos.flatMap((a) => a.marcos).length > 0);
const n1 = secundariasAbertas({ abertura, espinha, nivel: 1 });
t("nível 1, no começo: fechado, e o mural também", n1.abertas === false && n1.mural === false && n1.porque === "introducao");
const n2 = secundariasAbertas({ abertura, espinha, nivel: 2 });
t("nível 2, sem marco: ainda fechado", n2.abertas === false && n2.mural === false);
const n3 = secundariasAbertas({ abertura, espinha, nivel: 3 });
t("nível 3: aberto pelo nível, e o mural com ele", n3.abertas === true && n3.mural === true && n3.porque === "nivel");
const m1 = secundariasAbertas({ abertura, espinha: espinhaFeita, nivel: 1 });
t("o primeiro marco cumprido no nível 1: aberto pela história", m1.abertas === true && m1.porque === "marco");
t("mas o mural é só por nível (a pessoa: «liberado a partir de um certo lvl»)", m1.mural === false);
const m3 = secundariasAbertas({ abertura, espinha: espinhaFeita, nivel: 3 });
t("marco e nível: tudo aberto", m3.abertas === true && m3.mural === true);
t("o que vier primeiro: o marco não espera o nível, o nível não espera o marco", m1.abertas && n3.abertas);
t("os turnos não abrem o portão (o relógio da MM13 não é estar na história)",
  secundariasAbertas({ abertura: { ...abertura, turnos: 99 }, espinha, nivel: 1 }).abertas === false);

sec("3. O lixo e o save antigo");
let semEstouro = true;
for (const x of [null, undefined, {}, [], "x", 7, { abertura: null }, { abertura: abertura, espinha: "torta" }, { abertura, espinha: { atos: "x" } }, { abertura, espinha, nivel: "abc" }, { abertura, espinha, nivel: -4 }, { abertura, espinha, nivel: NaN }]) {
  try { const r = secundariasAbertas(x); if (typeof r.abertas !== "boolean" || typeof r.mural !== "boolean" || !r.porque) semEstouro = false; } catch { semEstouro = false; }
}
t("lixo, null, nível torto: nunca estoura, e devolve a forma inteira", semEstouro);
t("null é save antigo: aberto", secundariasAbertas(null).abertas === true && secundariasAbertas(null).porque === "save-antigo");
t("abertura legado: aberto, mural incluído", (() => { const r = secundariasAbertas({ abertura: { legado: true }, espinha, nivel: 1 }); return r.abertas && r.mural && r.porque === "save-antigo"; })());
t("espinha sem marcos: não há introdução a proteger", (() => { const r = secundariasAbertas({ abertura, espinha: { atos: [] }, nivel: 1 }); return r.abertas && r.mural && r.porque === "sem-historia"; })());
t("nível torto conta como 1 (fechado)", secundariasAbertas({ abertura, espinha, nivel: "abc" }).abertas === false && secundariasAbertas({ abertura, espinha, nivel: -4 }).abertas === false);

sec("4. Imutabilidade e determinismo");
const antes = copia({ abertura, espinha });
const est = { abertura, espinha, nivel: 1 };
const a1 = secundariasAbertas(est), a2 = secundariasAbertas(est);
t("o estado recebido não muda", JSON.stringify({ abertura, espinha }) === JSON.stringify(antes) && espinha.atos[0].marcos[0].feito === false);
t("o mesmo estado dá a mesma resposta", JSON.stringify(a1) === JSON.stringify(a2));

sec("5. A noite (geradores.js): nem missão nova nem arco regional com o portão fechado");
{
  const ctx = { pessoa: (a) => a.nome, fase: "inicio", lugar: cidade, lugar2: cidade, a1: { nome: "Ana", raca: "h" }, a2: { nome: "Bento", raca: "h" }, a3: { nome: "Cora", raca: "h" }, a4: { nome: "Davi", raca: "h" } };
  const noites = (secundarias, n = 400) => {
    let q = 0, g = 0, l = 0;
    for (let s = 0; s < n; s++) {
      let ev = null; const sorte = rng(hashSemente("noite|" + s));
      for (let d = 1; d <= 3; d++) { const r = processarDescansoLongoEventos(ev, ctx, { dia: d, secundariasAtivas: 0, sorte, ...(secundarias == null ? {} : { secundarias }) }); ev = r.eventos; if (r.questNova) q++; if (r.globalNovo) g++; if (r.localNovo) l++; }
    }
    return { q, g, l };
  };
  const fechado = noites(false), aberto = noites(true), deSempre = noites(null);
  t("fechado: nenhuma missão sorteada em 1.200 noites", fechado.q === 0);
  t("fechado: nenhum arco regional (que impõe a sua missão)", fechado.g === 0);
  t("aberto: a noite volta a dar missão e arco", aberto.q > 0 && aberto.g > 0);
  t("sem o campo, o de sempre (letra por letra)", JSON.stringify(deSempre) === JSON.stringify(aberto));
  t("o fio local continua (é o dia a dia da cidade, não trabalho)", fechado.l > 0);
  /* o arco que já corre não estoura com o portão fechado: só não nasce outro */
  let escala = true;
  try {
    const ev = { locais: [], global: { id: "g", nome: "A Guerra", etapas: ["a", "b", "c"], etapa: 0, desde: 1 }, semGlobalDesde: 0, seq: 1 };
    const r = processarDescansoLongoEventos(ev, ctx, { dia: 2, secundariasAtivas: 0, sorte: () => 0.99, secundarias: false });
    escala = !!r.eventos.global && r.globalNovo === null;
  } catch { escala = false; }
  t("um arco que já corre segue a correr, e sem estouro", escala);
}

sec("6. O correio: nenhuma petição nova com o portão fechado");
{
  const dias = (peticoes, n = 400) => {
    let p = 0;
    for (let s = 0; s < n; s++) {
      let c = garantirCorreio(null); const sorte = rng(hashSemente("correio|" + s));
      for (let d = 1; d <= 3; d++) { const pc = processarDiaCorreio(c, { dia: d, faccoes: ["Casa do Rio", "Os Vigias"], potencias: [], sorte, ...(peticoes == null ? {} : { peticoes }) }); p += pc.msgs.filter((m) => m.includes("PETIÇÃO RECEBIDA")).length; c = pc.correio; }
    }
    return p;
  };
  t("fechado: nenhuma petição em 1.200 dias", dias(false) === 0);
  t("aberto: as petições voltam", dias(true) > 0);
  t("sem o campo, o de sempre", dias(null) === dias(true));
}

sec("7. O figurante que prega no mural (depois-do-turno)");
{
  const { jogarODepois, umaCidadeQuePrega } = await import("./depois-bloco.mjs");
  const naCidade = umaCidadeQuePrega();
  /* o herói já orientado pela MM13 (a principal fora de jogo): só o portão decide */
  const AB = { principalId: "zz", turnos: 9, tocou: true };
  const comNivel = (n) => ({ ...naCidade, ...(naCidade.personagem ? { personagem: { ...naCidade.personagem, nivel: n } } : {}), ...(naCidade.render && naCidade.render.personagem ? { render: { ...naCidade.render, personagem: { ...naCidade.render.personagem, nivel: n } } } : {}) });
  const prega = (nivel, esp) => { const j = jogarODepois("oferecerTrabalhoDaqui", { estado: { ...comNivel(nivel), abertura: AB, missoes: [], espinha: esp } }); return !!(j.escritas.mural && j.escritas.mural.length); };
  t("a sessão gravada tem espinha com marcos por fazer", ((naCidade.espinha || {}).atos || []).flatMap((a) => a.marcos || []).some((m) => !m.feito));
  t("nível 1: o figurante cala-se", prega(1, naCidade.espinha) === false);
  t("nível 1 com o primeiro marco: ainda cala-se (o mural é por nível)", prega(1, comMarco(naCidade.espinha)) === false);
  t("nível 3: prega", prega(3, naCidade.espinha) === true);
  t("save antigo (abertura legado), nível 1: prega como sempre", (() => { const j = jogarODepois("oferecerTrabalhoDaqui", { estado: { ...comNivel(1), abertura: { legado: true }, missoes: [] } }); return !!(j.escritas.mural && j.escritas.mural.length); })());
}

sec("8. A proposta do Cronista (o cartaz do missao_oferecida)");
{
  const { oAceitoDoCronista } = await import("../src/motor/cronista-do-turno.js");
  const AB = { principalId: "zz", turnos: 9, tocou: true };
  const pregou = (nivel, esp) => { let n = 0; oAceitoDoCronista({ missao_oferecida: { titulo: "Os lobos", tipo: "contrato", dador: "Hilda", paga: 10, etapas: [{ tipo: "derrotar", alvo: "Lobo", quantos: 1 }] } }, [], {}, { pers: { nome: "Vera", nivel, grupo: [] }, narrativa: "x", ler: () => ({ abertura: AB, missoes: [], espinha: esp, cidadeAtual: "Vau", npcs: {}, coracao: null }), aplicar: () => {}, historiaDoMural: () => [], contextoDoNome: () => ({}), nucleoAgora: () => null, pregarNoMural: () => { n++; return true; } }); return n; };
  t("nível 1: a proposta não vira cartaz", pregou(1, espinha) === 0);
  t("nível 3: vira", pregou(3, espinha) === 1);
}

sec("9. A trama (o prelúdio): espera o portão");
{
  const { lerODourado, casosDoPreludio, osModulos, osPadroes, correrAPeca } = await import("./preludio-bloco.mjs");
  const { oPreludioDoTurno } = await import("../src/motor/preludio-do-turno.js");
  const D = lerODourado(); const pad = osPadroes(D, await osModulos(D.imports));
  const AB = { principalId: "zz", turnos: 9, tocou: true };
  const com = (k, nivel) => { const c = copia(k); c.estado.abertura = AB; for (const o of [c.estado.personagem, c.render && c.render.personagem, c.entrada && c.entrada.persAtual]) if (o && typeof o === "object") o.nivel = nivel; return c; };
  let caso = null, aos3 = "", aos1 = "x";
  for (const k of casosDoPreludio()) {
    const ms = Array.isArray((k.estado.espinha || {}).atos) ? k.estado.espinha.atos.flatMap((a) => (a && a.marcos) || []) : [];
    if (!ms.length || ms.some((m) => m.feito)) continue;
    const r3 = await correrAPeca(oPreludioDoTurno, com(k, 3), D, pad);
    if (!(r3.out && r3.out.daTrama)) continue;
    caso = k.i; aos3 = r3.out.daTrama;
    const r1 = await correrAPeca(oPreludioDoTurno, com(k, 1), D, pad);
    aos1 = (r1.out && r1.out.daTrama) || "";
    break;
  }
  t(`há um caso em que a trama nasce no nível 3 (o caso ${caso})`, caso != null && aos3.length > 0);
  t("o mesmo caso no nível 1, sem marco: a trama não nasce", aos1 === "");
}

sec("10. O veto da pauta enquanto o mural está fechado");
{
  const { lerODourado, casosDaPauta, osModulos, osPadroes, correrAPeca } = await import("./pauta-bloco.mjs");
  const { aPautaDoTurno } = await import("../src/motor/pauta-do-turno.js");
  const D = lerODourado(); const pad = osPadroes(D, await osModulos(D.imports));
  const AB = { principalId: "zz", turnos: 9, tocou: true };
  const k0 = casosDaPauta().find((k) => k.estado && k.estado.espinha && Array.isArray(k.estado.espinha.atos) && k.estado.espinha.atos.some((a) => (a.marcos || []).length) && k.frase);
  const com = (nivel) => { const c = copia(k0); c.estado.abertura = AB; c.estado.personagem = { ...c.estado.personagem, nivel }; if (c.render) c.render.personagem = { ...(c.render.personagem || {}), nivel }; return c; };
  const vetos = (nivel) => { const r = correrAPeca(aPautaDoTurno, com(nivel), D, pad); const txt = r.p ? textoDaPauta(r.p, { turno: 1 }) : ""; return txt.split(MURAL.veto).length - 1; };
  t("há um caso da pauta com espinha", !!k0);
  t("nível 1 (a MM13 já abriu): o veto continua, uma vez só", vetos(1) === 1);
  t("nível 3: o veto sai", vetos(3) === 0);
}

console.log(`\nportao-das-secundarias: ${ok} passaram, ${mal} falharam`);
if (mal) process.exit(1);
