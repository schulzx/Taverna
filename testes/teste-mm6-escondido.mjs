/* teste-mm6-escondido.mjs (Fase MM · MM6) — escondido é um estado

   A prova de `src/escondido.js` e da regra do Ataque Furtivo em
   `src/combate.js`. As perguntas de mesa que esta etapa responde:
     "o anão está me vendo?"                              → §6, §7, §8
     "tenho vantagem porque ele não me viu chegar?"        → §5
     "o furtivo soma porque tenho um aliado ao lado dele?" → §9
     "caído, ainda escondido, dá para atacar por trás?"    → §9 (#153)
   e a medida do Ladino antes e depois da regra, fixada como catraca (§11).

   Tudo por semente ou por sorte injetada: nenhum `Math.random` decide uma
   asserção. */
import {
  ESCONDIDO, PERCEPCAO_PASSIVA, QUEM_ACHA, ATOS_QUE_REVELAM,
  juntarNomes, estadoEscondido, percepcaoPassiva, ondeSeEsconder, nascerEscondido,
  quemMeVe, oculto, revisarEscondido, revelarPorAto, custoDeEsconder, pautaDoEscondido,
} from "../src/escondido.js";
import { ATAQUE_FURTIVO, dadosDoFurtivo, vereditoDoFurtivo, danoDaClasse, resolverAtaque, turnoDosInimigos, ladosDoDado } from "../src/combate.js";
import { montarGrade, resumoGridPrompt, temCobertura, linhaDeVisao, ROTULOS_DO_TABULEIRO } from "../src/grid.js";
import { tickCondicoes, mecanicaDe, limparPorDescanso, resumoCondicoesPrompt, criarCondicao, condicaoPorId } from "../src/condicoes.js";
import { romperPorGatilho } from "../src/gatilhos.js";
import { porNaPauta, textoDaPauta, TETO_DA_PAUTA } from "../src/pauta.js";
import { sondarFurtivo, lutaDoLadino, RETRATO_DO_FURTIVO, MODOS_DA_SONDA } from "./sonda-do-furtivo.mjs";
import { readFileSync } from "node:fs";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);

const heroiBase = () => ({ nome: "Vera", classe: "Ladino", nivel: 5, atributos: { destreza: 3, percepcao: 2 }, condicoes: [{ id: "abencoado", nome: "Abençoado", turnos: 2 }] });
const campo = montarGrade({ local: "campo aberto", bioma: "planicie" });  // a vala (5,0) cobre; a estrada (9,5) não
const masm = montarGrade({ emMasmorra: true });                           // (0,0) sem cobertura e fora da vista de (2,9)

/* ============================================================ */
sec("0. as tabelas");
{
  t("o estado é a condição `escondido` do catálogo", ESCONDIDO.id === "escondido" && !!condicaoPorId("escondido"));
  const c = condicaoPorId("escondido");
  t("sem relógio: dura até agir ou ser achado", c.turnos === null);
  t("sem vantagem de catálogo — ela vale só contra quem não o viu", !c.vantagem && !c.desvantagem);
  t("o descanso limpa, pelos dois canais", (c.saiCom || []).includes("curto") && (c.saiCom || []).includes("longo"));
  t("nasce só da furtividade", ESCONDIDO.alvosQueEscondem.length === 1 && ESCONDIDO.alvosQueEscondem[0] === "furtividade");
  t("cai ao atacar e ao conjurar (os gatilhos de gatilhos.js)", ESCONDIDO.quebraCom.join(",") === "atacar,conjurar");
  /* 06/10 (a luz e a sombra): a quinta porta é `no_escuro` — quem enxerga
     no escuro acha quem se escondeu só na sombra. A contagem sobe de 4 para
     5 com a porta nomeada; as quatro de antes continuam lá, uma a uma. */
  t("quem acha: cinco portas, cada uma com a sua frase", QUEM_ACHA.length === 5 && QUEM_ACHA.every((q) => q.id && q.diz)
    && ["ja_achou", "passiva", "a_descoberto", "procurou", "no_escuro"].every((id) => QUEM_ACHA.some((q) => q.id === id)));
  t("os atos que revelam têm id, frase e regex", ATOS_QUE_REVELAM.length >= 4 && ATOS_QUE_REVELAM.every((a) => a.id && a.conta && a.rx instanceof RegExp));
  t("a passiva é 10 + mod", PERCEPCAO_PASSIVA.base === 10);
  t("o aliado do furtivo é o de 1,5 m (5 pés)", ATAQUE_FURTIVO.alcanceDoAliadoM === 1.5);
  t("juntarNomes: A · A e B · A, B e C", juntarNomes(["A"]) === "A" && juntarNomes(["A", "B"]) === "A e B" && juntarNomes(["A", "B", "C"]) === "A, B e C" && juntarNomes(null) === "");
}

/* ============================================================ */
sec("1. nascer");
{
  t("passiva: a Percepção da ficha", percepcaoPassiva({ atributos: { percepcao: 2 } }) === 12);
  t("passiva: a ameaça, para quem não tem ficha", percepcaoPassiva({ ameaca: "elite" }) === 13 && percepcaoPassiva({ ameaca: "lendario" }) === 15 && percepcaoPassiva({ ameaca: "fraco" }) === 10);
  t("passiva: sem nada, o comum; null não estoura", percepcaoPassiva({}) === 11 && percepcaoPassiva(null) === 11);

  const p0 = heroiBase();
  const r = nascerEscondido(p0, { total: 15 });
  const e = estadoEscondido(r.pers);
  t("fora da luta, sem ninguém nomeado: nasce", r.ok && !!e && r.motivo === "fora_da_luta");
  t("guarda o total — é a CD de quem procura", e.total === 15 && Array.isArray(e.achadoPor) && e.achadoPor.length === 0);
  t("com a forma de condição e o contrato dos gatilhos", e.nome === "Escondido" && e.turnos === null && e.quebraCom.includes("atacar") && e.quebraCom.includes("conjurar"));
  t("as outras condições ficam", r.pers.condicoes.some((c) => c.id === "abencoado"));
  t("não muta a ficha recebida", p0.condicoes.length === 1 && !estadoEscondido(p0));
  t("a linha para o jogador diz o número", /escondido \(furtividade 15\)/.test(r.linhas[0]));
  const r2 = nascerEscondido(r.pers, { total: 9 });
  t("esconder-se de novo troca o estado, não o duplica", r2.pers.condicoes.filter((c) => c.id === "escondido").length === 1 && estadoEscondido(r2.pers).total === 9);
  t("sem total não nasce; ficha nula não estoura", !nascerEscondido(p0, {}).ok && nascerEscondido(null, { total: 12 }).ok);

  const presentes = [{ nome: "Aldo", ameaca: "elite" }, { nome: "Mira", ameaca: "comum" }];
  const r3 = nascerEscondido(p0, { total: 12, presentes });
  t("fora da luta: quem tem passiva ACIMA do total vê (Aldo 13 > 12); quem não, não (Mira 11)",
    r3.ok && estadoEscondido(r3.pers).achadoPor.join() === "Aldo");
  t("o empate é de quem rola: total 13 contra passiva 13 continua escondido", nascerEscondido(p0, { total: 13, presentes }).ok && estadoEscondido(nascerEscondido(p0, { total: 13, presentes }).pers).achadoPor.length === 0);
  const r4 = nascerEscondido(p0, { total: 10, presentes });
  t("se todos veem, não nasce — e diz quem", !r4.ok && r4.motivo === "todos_veem" && /Aldo e Mira/.test(r4.linhas[0]));

  /* NA LUTA */
  const orc = { nome: "Orc", ameaca: "comum", x: 9, y: 1, vida: 15 };
  const naEstrada = { nome: "Vera", x: 9, y: 5 };
  t("fixture: a vala cobre e a estrada não", temCobertura(campo, 5, 0) && !temCobertura(campo, 9, 5));
  const r5 = nascerEscondido(p0, { total: 20, grade: campo, heroi: naEstrada, inimigos: [orc] });
  t("na luta, a descoberto e à vista: não nasce, e diz quem vê", !r5.ok && r5.motivo === "a_descoberto" && /Orc/.test(r5.linhas[0]));
  const naVala = { nome: "Vera", x: 5, y: 0 };
  const r6 = nascerEscondido(p0, { total: 14, grade: campo, heroi: naVala, inimigos: [orc] });
  t("na luta, com cobertura: nasce (mesmo com o Orc a ver o sítio)", r6.ok && r6.motivo === "cobertura" && estadoEscondido(r6.pers).achadoPor.length === 0);
  t("fixture: (0,0) da masmorra sem cobertura e fora da vista de (2,9)", !temCobertura(masm, 0, 0) && !linhaDeVisao(masm, { x: 2, y: 9 }, { x: 0, y: 0 }));
  const r7 = nascerEscondido(p0, { total: 14, grade: masm, heroi: { nome: "Vera", x: 0, y: 0 }, inimigos: [{ nome: "Orc", ameaca: "comum", x: 2, y: 9, vida: 9 }] });
  t("na luta, sem cobertura mas sem linha de visão de ninguém: nasce", r7.ok && r7.motivo === "fora_de_vista");
  t("inimigo caído não conta como quem vê", ondeSeEsconder({ grade: campo, heroi: naEstrada, inimigos: [{ ...orc, vida: 0 }] }).pode);
}

/* ============================================================ */
sec("2. durar");
{
  let p = nascerEscondido(heroiBase(), { total: 16 }).pers;
  let conds = p.condicoes;
  for (let i = 0; i < 10; i++) conds = tickCondicoes(conds).condicoes;
  t("dez turnos de relógio e continua lá", conds.some((c) => c.id === "escondido" && c.total === 16));
  t("não empresta vantagem genérica às rolagens", mecanicaDe([criarCondicao("escondido")]).vantagem === false);
  t("a parada de uma hora o limpa", !limparPorDescanso(p.condicoes, "curto").condicoes.some((c) => c.id === "escondido"));
  t("o Narrador já o lê no rodapé de condições", /Escondido/.test(resumoCondicoesPrompt(p, [])));
}

/* ============================================================ */
sec("3. revelar-se por ato");
{
  const p = nascerEscondido(heroiBase(), { total: 16 }).pers;
  const ra = romperPorGatilho(p, "atacar");
  t("atacar derruba — pelo molde da invisibilidade, sem linha nova no App", !estadoEscondido(ra.pers) && ra.rompidos.includes("Escondido"));
  t("conjurar derruba", !estadoEscondido(romperPorGatilho(p, "conjurar").pers));
  t("apanhar não derruba (quem bate já te achou, e isso é de `revisarEscondido`)", !!estadoEscondido(romperPorGatilho(p, "dano").pers));
  const casos = [
    ["Grito por ajuda", "voz"], ["Chamo o guarda pelo nome", "voz"], ["digo em voz alta que me rendo", "voz"],
    ["Saio das sombras e caminho até ele", "sair"], ["Me revelo ao mercador", "sair"],
    ["corro para o meio do salão", "aberto"], ["Acendo a tocha", "luz"],
  ];
  for (const [frase, id] of casos) {
    const r = revelarPorAto(p, frase);
    t(`"${frase}" revela (${id})`, r.revelado && r.ato === id && !estadoEscondido(r.pers) && /Escondido cai/.test(r.linhas[0]) && /ENCERRADO/.test(r.nota));
  }
  for (const frase of ["Posso gritar?", "Não grito, fico quieto", "Observo o guarda em silêncio", "espero ele virar as costas"]) {
    t(`"${frase}" não revela`, !revelarPorAto(p, frase).revelado);
  }
  t("quem não está escondido não tem o que revelar", !revelarPorAto(heroiBase(), "Grito").revelado);
  t("não muta a ficha recebida", !!estadoEscondido(p));
  t("lixo não estoura", !revelarPorAto(null, null).revelado && !revelarPorAto(p, undefined).revelado);
}

/* ============================================================ */
sec("4. ser achado");
{
  const orc = { nome: "Orc", ameaca: "comum", x: 2, y: 12, vida: 15 };
  const ogro = { nome: "Ogro", ameaca: "elite", x: 2, y: 9, vida: 40 };
  const lugar = { nome: "Vera", x: 0, y: 0 };
  const p = nascerEscondido(heroiBase(), { total: 12, grade: masm, heroi: lugar, inimigos: [orc] }).pers;
  t("fixture: escondido do Orc", !!estadoEscondido(p) && estadoEscondido(p).achadoPor.length === 0);
  const r1 = revisarEscondido(p, { grade: masm, heroi: lugar, inimigos: [orc, ogro] });
  t("pela passiva: o Ogro (13) passa o total 12 e acha", r1.achadoAgora.join() === "Ogro" && !r1.caiu && estadoEscondido(r1.pers).achadoPor.includes("Ogro"));
  t("…e o Orc, que não passa, continua sem ver", oculto(r1.pers, orc) && !oculto(r1.pers, ogro));
  t("…a nota diz o porquê ao Narrador", /ACHADO/.test(r1.nota) && /Ogro a atenção dele passa/.test(r1.nota));
  /* o Orc ganha linha de visão e o herói está sem cobertura */
  const orcPerto = { ...orc, x: 0, y: 3 };
  t("fixture: agora o Orc vê a casa do herói", linhaDeVisao(masm, orcPerto, lugar) && !temCobertura(masm, 0, 0));
  const r2 = revisarEscondido(r1.pers, { grade: masm, heroi: lugar, inimigos: [orcPerto, ogro] });
  t("pela linha de visão: quem o tem à vista sem nada no meio acha", r2.achadoAgora.join() === "Orc");
  t("todos acharam: o estado cai", r2.caiu && !estadoEscondido(r2.pers) && /não está mais escondido/.test(r2.linhas[0]));
  t("não muta a ficha recebida", !!estadoEscondido(r1.pers));

  const q = nascerEscondido(heroiBase(), { total: 15 }).pers;
  const guarda = [{ nome: "Guarda", ameaca: "comum" }];  // passiva 11, não acha sozinho
  t("sem procurar, o guarda não acha", revisarEscondido(q, { presentes: guarda }).achadoAgora.length === 0);
  t("procurando com 20 no dado (20 + 1 ≥ 15): acha", revisarEscondido(q, { presentes: guarda, procuram: ["Guarda"], sorte: () => 0.999 }).achadoAgora.join() === "Guarda");
  t("procurando com 1 no dado (1 + 1 < 15): não acha", revisarEscondido(q, { presentes: guarda, procuram: ["Guarda"], sorte: () => 0 }).achadoAgora.length === 0);
  t("o empate da procura é de quem rola: 14 + 1 = 15 acha", revisarEscondido(q, { presentes: guarda, procuram: ["Guarda"], sorte: () => 13.5 / 20 }).achadoAgora.join() === "Guarda");
  t("sem estado, nada a revisar; lixo não estoura", revisarEscondido(heroiBase(), { presentes: guarda }).achadoAgora.length === 0 && revisarEscondido(null, null).achadoAgora.length === 0);
}

/* ============================================================ */
sec("5. a vantagem no primeiro golpe, e a sua queda");
{
  const orc = { nome: "Orc", ameaca: "comum", vida: 30, defesa: 12 };
  const ogro = { nome: "Ogro", ameaca: "elite", vida: 60, defesa: 12 };
  /* sem a bênção da ficha-base: ela dá vantagem em tudo e esconderia a prova */
  const p = nascerEscondido({ ...heroiBase(), condicoes: [] }, { total: 12, presentes: [orc, ogro] }).pers;   // o Ogro (13) viu
  t("oculto do Orc, não do Ogro", oculto(p, orc) && !oculto(p, ogro));
  const dado = [0.1, 0.9];
  const rolar = () => dado.shift() ?? 0.5;
  const r = resolverAtaque({ atacante: "Vera", alvo: orc, ehAtacanteInimigo: false, bonusAtaque: 5, danoBase: 6, vantagem: oculto(p, orc), condAtacante: p.condicoes, rolar });
  t("o golpe contra quem não o viu rola com vantagem (fica o maior dos dois)", r.modo === "vantagem" && r.d20 === 19);
  const r2 = resolverAtaque({ atacante: "Vera", alvo: ogro, ehAtacanteInimigo: false, bonusAtaque: 5, danoBase: 6, vantagem: oculto(p, ogro), condAtacante: p.condicoes, rolar: () => 0.5 });
  t("contra quem o viu, dado reto", r2.modo === null);
  const depois = romperPorGatilho(p, "atacar").pers;
  t("depois do golpe, a vantagem acabou — o primeiro golpe o revela", !oculto(depois, orc));
  /* a outra metade: quem não o achou bate às cegas */
  const inim = { nome: "Orc", ameaca: "comum", nivel: 3, vida: 30 };
  const jog = { ...p, vida: 30, vidaMax: 30 };
  const ac = turnoDosInimigos({ inimigos: [inim], jogador: jog, grupo: [] });
  t("o inimigo que não o achou ataca com desvantagem", ac.length === 1 && ac[0].r.modo === "desvantagem");
  const achado = { ...jog, condicoes: jog.condicoes.map((c) => (c.id === "escondido" ? { ...c, achadoPor: ["Orc"] } : c)) };
  t("o que o achou ataca normal", turnoDosInimigos({ inimigos: [inim], jogador: achado, grupo: [] })[0].r.modo === null);
  t("e sem estado nenhum, nada muda", turnoDosInimigos({ inimigos: [inim], jogador: { ...heroiBase(), vida: 30 }, grupo: [] })[0].r.modo === null);
}

/* ============================================================ */
sec("6. quem te vê");
{
  t("não escondido: null (é esse null que guarda a linha da luta)", quemMeVe(heroiBase(), { presentes: [{ nome: "A" }] }) === null && quemMeVe(null) === null);
  const orc = { nome: "Orc", ameaca: "comum", x: 2, y: 12, vida: 15 };
  const goblin = { nome: "Goblin", ameaca: "fraco", x: 2, y: 9, vida: 7 };
  const ogro = { nome: "Ogro", ameaca: "elite", x: 0, y: 3, vida: 40 };
  const lugar = { nome: "Vera", x: 0, y: 0 };
  const p = nascerEscondido(heroiBase(), { total: 14, grade: masm, heroi: lugar, inimigos: [orc, goblin] }).pers;
  const q = quemMeVe(p, { grade: masm, heroi: lugar, inimigos: [orc, goblin, ogro, { nome: "Morto", vida: 0, x: 1, y: 1 }] });
  t("Orc e Goblin não me veem; o Ogro, com linha de visão, sim; o morto não conta",
    q.naoVeem.join() === "Orc,Goblin" && q.veem.length === 1 && q.veem[0].nome === "Ogro" && q.veem[0].porque === "a_descoberto");
  t("é pura: o estado não mudou", estadoEscondido(p).achadoPor.length === 0);
}

/* ============================================================ */
sec("7. a linha da luta");
{
  const oc = {
    heroi: { nome: "Vera", x: 9, y: 5 }, grupo: [],
    inimigos: [{ nome: "Ogro", x: 5, y: 0, vida: 50 }, { nome: "Goblin", x: 12, y: 5, vida: 7 }],
    ordem: [{ nome: "Goblin", lado: "inimigo" }, { nome: "Vera", lado: "heroi" }, { nome: "Ogro", lado: "inimigo" }],
  };
  /* REGRESSÃO LETRA POR LETRA: a linha abaixo foi tirada do `grid.js` de
     ANTES de MM6 (HEAD em 29/09, v9.309), com este mesmo fixture. Sem
     escondido, a linha de hoje tem de ser ela. */
  const ANTES = "TERRENO DA LUTA (do sistema — obedeça): na estrada: você, Goblin | na vala: Ogro (grande) | na encosta: —. Distâncias até mim: Ogro a 6 m (atrás de cobertura), Goblin a 5 m. Ordem da rodada: Goblin, Vera, Ogro.\nEstas posições são FATO. Você não move ninguém, não faz um inimigo \"cruzar o salão\" para alcançar quem está longe e não põe alguém a golpe de espada de quem está a dez metros. Quem se move, se move pelo sistema, e você recebe o movimento pronto para narrar. Use os NOMES dos lugares na prosa — \"ele recua para o pé da escada\" —, nunca coordenada, nunca a palavra quadrado e nunca a palavra grid.";
  t("sem escondido, a linha da luta é a de antes, letra por letra", resumoGridPrompt(campo, oc) === ANTES);
  t("quemMeVe null ou ausente dá o mesmo", resumoGridPrompt(campo, { ...oc, quemMeVe: null }) === ANTES && resumoGridPrompt(campo, { ...oc, quemMeVe: undefined }) === ANTES);
  const com = resumoGridPrompt(campo, { ...oc, quemMeVe: { naoVeem: ["Orc", "Goblin"], veem: [{ nome: "Ogro", porque: "passiva" }] } });
  const frase = " Estou escondido: Orc e Goblin não me veem; Ogro me vê.";
  t("com escondido: \"Estou escondido: Orc e Goblin não me veem; Ogro me vê.\"", com.includes(frase));
  t("…na mesma linha, entre as distâncias e a ordem, e nada mais muda", com.replace(frase, "") === ANTES && com.indexOf(frase) < com.indexOf(ROTULOS_DO_TABULEIRO.ordemDaRodada));
  t("um só que não vê: singular", resumoGridPrompt(campo, { ...oc, quemMeVe: { naoVeem: ["Orc"], veem: [] } }).includes(" Estou escondido: Orc não me vê."));
  t("todos os que veem: plural", resumoGridPrompt(campo, { ...oc, quemMeVe: { naoVeem: [], veem: [{ nome: "Orc" }, { nome: "Ogro" }] } }).includes(" Estou escondido: Orc e Ogro me veem."));
  t("sem inimigo nenhum à volta", resumoGridPrompt(campo, { ...oc, quemMeVe: { naoVeem: [], veem: [] } }).includes(" Estou escondido: ninguém à volta me vê."));
  /* a ponta a ponta: o que o App vai passar é o que `quemMeVe` devolve */
  const lugar = { nome: "Vera", x: 5, y: 0 };
  const inim = [{ nome: "Orc", ameaca: "comum", x: 9, y: 1, vida: 15 }, { nome: "Ogro", ameaca: "elite", x: 12, y: 5, vida: 40 }];
  const p = nascerEscondido(heroiBase(), { total: 12, grade: campo, heroi: lugar, inimigos: inim }).pers;
  const ponta = resumoGridPrompt(campo, { heroi: lugar, grupo: [], inimigos: inim, quemMeVe: quemMeVe(p, { grade: campo, heroi: lugar, inimigos: inim }) });
  t("ponta a ponta: nascer → quemMeVe → linha da luta", ponta.includes(" Estou escondido: Orc não me vê; Ogro me vê."));
}

/* ============================================================ */
sec("8. a linha da pauta (fora da luta)");
{
  t("não escondido: nada", pautaDoEscondido(heroiBase(), { presentes: [{ nome: "Aldo" }] }) === null && pautaDoEscondido(null) === null);
  const p = nascerEscondido(heroiBase(), { total: 12, presentes: [{ nome: "Aldo", ameaca: "elite" }, { nome: "Mira" }, { nome: "Bram" }] }).pers;
  const l = pautaDoEscondido(p, { presentes: [{ nome: "Aldo", ameaca: "elite" }, { nome: "Mira" }, { nome: "Bram" }] });
  t("NÃO PODE: quem não me viu reagir a mim — com quem me vê entre parênteses",
    l && l.naoPode === "Mira e Bram reagirem a mim: estou escondido e não me viram (Aldo me vê).", l && l.naoPode);
  const s = pautaDoEscondido(nascerEscondido(heroiBase(), { total: 12 }).pers, {});
  t("sem ninguém nomeado: o veto genérico", s && /alguém aqui me notar por conta própria/.test(s.naoPode));
  const um = pautaDoEscondido(nascerEscondido(heroiBase(), { total: 12, presentes: [{ nome: "Mira" }] }).pers, { presentes: [{ nome: "Mira" }] });
  t("singular", um.naoPode === "Mira reagir a mim: estou escondido e não me viu.");
  const pauta = porNaPauta({}, "naoPode", l.naoPode);
  const txt = textoDaPauta(pauta);
  t("entra na seção NÃO PODE e cabe no teto da pauta", /NÃO PODE/.test(txt) && txt.includes("Mira e Bram") && txt.length <= TETO_DA_PAUTA);
  t("é curta: menos de 120 caracteres", l.naoPode.length < 120);
}

/* ============================================================ */
sec("9. o Ataque Furtivo é a regra do 5e");
{
  t("os dados do furtivo: os que o Ladino tem a mais que a base", dadosDoFurtivo("Ladino", 5) === 2 && dadosDoFurtivo("Ladino", 20) === 10);
  t("no nível 1 são zero — a regra não muda nada ali", dadosDoFurtivo("Ladino", 1) === 0);
  t("as outras classes não têm furtivo", dadosDoFurtivo("Guerreiro", 20) === 0 && dadosDoFurtivo("Mago", 11) === 0);
  const alvo = { nome: "Orc", x: 5, y: 5, vida: 20 };
  const colado = { nome: "Bram", x: 6, y: 5, vida: 20 };
  const longe = { nome: "Bram", x: 7, y: 5, vida: 20 };
  const L = { classe: "Ladino", nivel: 5, alvo };
  const v1 = vereditoDoFurtivo({ ...L, vantagem: true });
  t("com vantagem: soma", v1.aplica && v1.soma && v1.porque === "vantagem" && v1.dados === 2);
  const v2 = vereditoDoFurtivo({ ...L, aliados: [colado] });
  t("com um aliado colado no alvo: soma, e diz quem", v2.soma && v2.porque === "aliado" && v2.quem === "Bram" && /Bram está colado/.test(v2.linha));
  t("aliado a 3 m não é colado: não soma", !vereditoDoFurtivo({ ...L, aliados: [longe] }).soma);
  t("sem nenhum dos dois: não soma", vereditoDoFurtivo({ ...L }).porque === "sozinho" && !vereditoDoFurtivo(L).soma);
  t("aliado caído não flanqueia", !vereditoDoFurtivo({ ...L, aliados: [{ ...colado, vida: 0 }] }).soma);
  t("aliado atordoado não flanqueia", !vereditoDoFurtivo({ ...L, aliados: [{ ...colado, condicoes: [{ id: "atordoado", nome: "Atordoado" }] }] }).soma);
  const v3 = vereditoDoFurtivo({ ...L, aliados: [colado], desvantagem: true });
  t("com desvantagem, nem o aliado salva", !v3.soma && v3.porque === "desvantagem");
  /* #153: caído (desvantagem nas próprias rolagens) e escondido (vantagem) */
  const caido = [criarCondicao("caido")];
  const v4 = vereditoDoFurtivo({ ...L, vantagem: true, condAtacante: caido, aliados: [colado] });
  t("#153 · caído e escondido: as duas se anulam no dado e o furtivo NÃO soma", !v4.soma && v4.porque === "anulada");
  t("…e o dado dele sai reto, pela mesma porta", ladosDoDado({ alvo, vantagem: true, condAtacante: caido }).vantagem === false && ladosDoDado({ alvo, vantagem: true, condAtacante: caido }).desvantagem === false);
  t("o alvo cego dá a vantagem (e o furtivo)", vereditoDoFurtivo({ ...L, condAlvo: [{ nome: "Cego" }] }).porque === "vantagem");
  t("o Guerreiro não tem veredito de furtivo", vereditoDoFurtivo({ ...L, classe: "Guerreiro", vantagem: true }).aplica === false);
  t("sem tabuleiro, só a vantagem conta", !vereditoDoFurtivo({ classe: "Ladino", nivel: 5, alvo: { nome: "Orc" }, aliados: [{ nome: "Bram" }] }).soma);
  t("lixo não estoura", vereditoDoFurtivo().aplica === false && vereditoDoFurtivo({ classe: "Ladino", nivel: 5, aliados: null, condAtacante: null, condAlvo: null }).porque === "sozinho");
  /* o dano: com o dado cravado no 6, 3d6 contra 1d6 */
  const orig = Math.random;
  Math.random = () => 0.999;
  try {
    t("danoDaClasse sem opções soma o furtivo, como sempre somou", danoDaClasse("Ladino", 5, 0) === 18 && danoDaClasse("Ladino", 5, 0, null) === 18);
    t("com { furtivo: false } tira só os dados do furtivo", danoDaClasse("Ladino", 5, 0, { furtivo: false }) === 6 && danoDaClasse("Ladino", 5, 2, { furtivo: false }) === 8);
    t("o Guerreiro não sente a opção", danoDaClasse("Guerreiro", 5, 0, { furtivo: false }) === danoDaClasse("Guerreiro", 5, 0));
  } finally { Math.random = orig; }
}

/* ============================================================ */
sec("10. o preço de esconder-se na luta");
{
  t("o Ladino de nível 2 esconde-se com a ação bônus (Ação Ardilosa)", custoDeEsconder({ classe: "Ladino", nivel: 2 }) === "bonus");
  t("no nível 1 ainda gasta a ação", custoDeEsconder({ classe: "Ladino", nivel: 1 }) === "acao");
  t("as outras classes gastam a ação; null não estoura", custoDeEsconder({ classe: "Guerreiro", nivel: 20 }) === "acao" && custoDeEsconder(null) === "acao");
}

/* ============================================================ */
sec("11. o Ladino antes e depois — a catraca da medida");
{
  /* A amostra da suíte é menor que a do retrato (40 contra 140) para caber
     no `npm test`; os limiares abaixo são os que o retrato cumpre com folga
     e que a amostra menor também cumpre. Mudar um deles é mudar o que a
     fase prometeu — "joga diferente, não pior" — e o motivo vai escrito. */
  const a = JSON.stringify(lutaDoLadino("sozinho", "mm6|7", "ardilosa"));
  const b = JSON.stringify(lutaDoLadino("sozinho", "mm6|7", "ardilosa"));
  t("determinismo: a mesma semente dá a mesma luta", a === b);
  const m = sondarFurtivo({ n: 40 });
  const pct = (x) => `${(x * 100).toFixed(1)}%`;
  for (const [c, porModo] of Object.entries(m)) {
    console.log(`      ${c.padEnd(7)} ` + MODOS_DA_SONDA.map((k) => `${k}: dano ${porModo[k].danoPorLuta.toFixed(1)} · furtivo ${pct(porModo[k].comFurtivo)} · queda ${pct(porModo[k].queda)} · vitória ${pct(porModo[k].vitoria)}`).join(" | "));
  }
  t("ANTES: o furtivo somava em 100% dos golpes, em toda luta", MODOS_DA_SONDA.length === 3 && Object.values(m).every((x) => x.antes.comFurtivo === 1));
  t("COM GRUPO, a regra quase não morde: o furtivo segue acima de 85% e o dano cai menos de 8%",
    ["justo", "brando"].every((c) => m[c].regra.comFurtivo > 0.85 && m[c].regra.queda < 0.08));
  t("SOZINHO, sem se esconder, ela morde inteira: 0% de furtivo e mais de 15% de dano perdido",
    m.sozinho.regra.comFurtivo === 0 && m.sozinho.regra.queda > 0.15 && m.sozinho.antes.vitoria - m.sozinho.regra.vitoria > 0.15);
  t("COM A AÇÃO ARDILOSA, o Ladino sozinho esconde-se mais de uma vez por luta e o furtivo volta a somar em mais de 25% dos golpes",
    m.sozinho.ardilosa.escondeuPorLuta > 1 && m.sozinho.ardilosa.comFurtivo > 0.25);
  t("…e em nenhuma luta joga pior do que 12% abaixo do antes (a fase aceitava 20%)",
    Object.values(m).every((x) => x.ardilosa.queda < 0.12));
  t("…nem melhor do que 20% acima — compensar não é dar de presente",
    Object.values(m).every((x) => x.ardilosa.queda > -0.20));
  t("o retrato de 140 lutas conta a mesma história",
    RETRATO_DO_FURTIVO.n === 140 && RETRATO_DO_FURTIVO.sozinho.regra.queda > 0.2 && RETRATO_DO_FURTIVO.sozinho.ardilosa.queda < 0.12
    && RETRATO_DO_FURTIVO.justo.regra.furtivo > 0.85 && RETRATO_DO_FURTIVO.brando.regra.furtivo > 0.85);
}

/* ============================================================
   12. A FIAÇÃO NO App.jsx (frontend, MM6) — prova por texto

   O motor acima roda em Node, sem React; esta seção prova que o `App.jsx`
   de fato o CHAMA, nos oito pontos da especificação (1, 2, 3, 5, 6, 7, 8 —
   o 4 não precisa de linha nova, `romperPorGatilho` já cai pelos dois
   gatilhos existentes; o 9 é save/load de graça, `pers.condicoes` já
   viaja inteiro). Lê o arquivo como TEXTO — a mesma limitação honesta de
   `check-acoes-do-jogador.mjs` — e ancora em CONTEÚDO que só existe se a
   fiação de fato ligou o módulo, nunca em número de linha (esse é o
   ofício de `check-acoes-do-jogador.mjs`, que re-deriva o próprio
   endereço a cada corrida). */
sec("12. a fiação no App.jsx");
{
  /* O fim de linha é normalizado: com core.autocrlf, uma cópia fresca do
     repositório (git archive, o so-o-meu.sh, outra máquina) traz o App.jsx
     em CRLF, e as âncoras de várias linhas desta seção só casavam em LF —
     a suíte ficava vermelha no HEAD puro sem nada estar errado. */
  const APP = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");

  t("importa as portas de escondido.js", /from "\.\/escondido\.js"/.test(APP)
    && /\bESCONDIDO\b.*\bnascerEscondido\b.*\bquemMeVe\b.*\boculto\b.*\brevisarEscondido\b.*\brevelarPorAto\b.*\bcustoDeEsconder\b.*\bpautaDoEscondido\b/.test(APP));
  t("importa vereditoDoFurtivo de combate.js", /vereditoDoFurtivo/.test(APP) && /from "\.\/combate\.js"/.test(APP));

  /* 1. NASCER — dentro de concluirRolagem, depois do fechamento do desafio,
     e ANTES do `let persT` que monta o envelope para o Narrador. */
  {
    const iFecha = APP.indexOf('if (des) { fecharTentativa(des, passou); cobrarTempoDoDesafio(des); }');
    /* MM6, jogado: `des` (o veredito de `desafios.js#lerAcao`) não tem campo
       `alvo` — o catálogo o expõe como `alvoDoCusto` (d.alvoDoCusto ??
       d.alvo), a mesma leitura que `custoPorAlvo` já usa. Descoberto na
       prova jogada: com `des.alvo`, o estado nunca nascia (undefined não
       bate com nada em ESCONDIDO.alvosQueEscondem). */
    const iNasce = APP.indexOf("ESCONDIDO.alvosQueEscondem.includes(des.alvoDoCusto)");
    const iCusto = APP.indexOf("custoDeEsconder(baseEsc)");
    const iPersT = APP.indexOf("let persT = personagemRef.current || personagem;");
    t("1. nascer: o teste de furtividade passado chama nascerEscondido",
      iFecha > 0 && iNasce > iFecha && /nascerEscondido\(baseEsc,/.test(APP));
    t("1. …cobra o recurso (ação/bônus) antes de nascer, dentro do calou",
      iCusto > iFecha && iCusto < iNasce + 400 && /calou\("nascerEscondido"/.test(APP));
    t("1. …e tudo isso corre ANTES do envelope ir ao Narrador (`let persT`)",
      iPersT > 0 && iNasce < iPersT);
  }

  /* 2. VANTAGEM E FURTIVO — dentro do laço de resolverAtaqueJogador, antes
     do resolverAtaque, só no primeiro golpe da sequência. */
  {
    const iAliados = APP.indexOf("const aliadosFurtivo = (comb.aliados || [])");
    const iVant = APP.indexOf("vantEsc = i === 0 && oculto(pers, alvo, { grade: gradeDaLuta, heroi: meuLugar })");
    const iVeredito = APP.indexOf("vf = vereditoDoFurtivo({");
    const iVantagemNoGolpe = APP.indexOf("vantagem: estaInvisivel(pers) || vantEsc,");
    const iRFurtivo = APP.indexOf("if (vf && vf.aplica) r.furtivo = vf;");
    t("2. os aliados do furtivo saem de comb.aliados, com vida/condicoes de pers.grupo", iAliados > 0);
    t("2. só o PRIMEIRO golpe (i === 0) pode contar com o esconderijo", iVant > 0);
    t("2. o veredito roda antes do resolverAtaque, dentro do calou", iVeredito > iVant && /calou\("vereditoDoFurtivo"/.test(APP));
    t("2. a vantagem do golpe soma estar oculto (vantEsc), sem tirar a invisibilidade", iVantagemNoGolpe > iVeredito);
    t("2. o veredito marca o resultado (r.furtivo) para a linha do golpe usar depois", iRFurtivo > iVantagemNoGolpe);
  }

  /* 3. A LINHA DO FURTIVO — em continuarGolpeDoJogador, colada na mesma
     linha do golpe, nunca quando o corpo era imune. */
  t('3. a linha do furtivo cola em partesMeu, e nunca no golpe imune',
    /if \(r\.furtivo\?\.linha && !r\.escopoImune\) partesMeu\[partesMeu\.length - 1\] \+= " — " \+ r\.furtivo\.linha;/.test(APP));

  /* 5. CAI POR ATO — em agirInterno, antes do despachante. */
  {
    const iRevA = APP.indexOf("const rvA = revelarPorAto(fichaViva() || personagem, acao);");
    const iUltimo = APP.lastIndexOf("ultimoDesfechoRef.current = null;");
    t("5. agirInterno chama revelarPorAto antes do despachante (dentro do calou)",
      iRevA > 0 && /calou\("revelarPorAto"/.test(APP));
    t("5. …e isso acontece ANTES da linha `ultimoDesfechoRef.current = null;` que abre o despachante",
      iUltimo > iRevA);
  }

  /* 6. SER ACHADO — em resolverRevide, antes de turnoDosInimigos. */
  {
    /* 06/10 (a luz e a sombra): a chamada ganhou o mapa de luz no fim
       (`luz: luzDaLutaAgora(...)`), para quem nasceu na sombra ser achado
       pela luz de AGORA. A âncora vai até ao campo de antes e exige o novo,
       em vez de casar a linha inteira — o resto da asserção não mudou. */
    const iRevE = APP.indexOf("const rvE = revisarEscondido(persBase, { grade: gradeAtual, heroi: lugarHeroi, inimigos: combPos.inimigos, luz: luzDaLutaAgora(");
    const iTurno = APP.indexOf("const acoes = turnoDosInimigos({");
    t("6. resolverRevide chama revisarEscondido (dentro do calou)", iRevE > 0 && /calou\("revisarEscondido"/.test(APP));
    t("6. …ANTES de o mundo agir (turnoDosInimigos)", iTurno > iRevE);
    t("6. …e reatribui persBase, para o turno dos inimigos já ver a ficha revisada", /persBase = rvE\.pers;/.test(APP));
  }

  /* 7. A LINHA DA LUTA — em enviar, dentro da chamada de resumoGridPrompt. */
  {
    /* 06/10 (a luz e a sombra): a linha da luta passou a perguntar com o
       mapa de luz (`luz: luzDaLutaAgora()`) — quem me vê na sala às escuras
       depende dele. A âncora acompanha a chamada; o que se prova é o mesmo. */
    const iQmv = APP.indexOf('qmvLuta = combateRef.current ? quemMeVe(p, { grade: combateRef.current.grade, heroi: combateRef.current.heroi, inimigos: combateRef.current.inimigos || [], luz: luzDaLutaAgora() }) : null;');
    const iGrid = APP.indexOf("const zon = combateRef.current ? resumoGridPrompt(combateRef.current.grade, {");
    const iCampo = APP.indexOf("quemMeVe: qmvLuta,");
    t("7. quemMeVe é calculado dentro do calou (null se estourar)", iQmv > 0 && /calou\("quemMeVe-na-luta"/.test(APP));
    t("7. …e entra como campo de resumoGridPrompt, junto de heroi/inimigos/grupo/ordem",
      iCampo > 0 && iCampo > iGrid && iCampo < APP.indexOf("}) : \"\";", iGrid));
  }

  /* 8. A PAUTA FORA DA LUTA — em pautaDoTurno, antes do fim. */
  {
    const iAqui = APP.indexOf('const { longe, aqui } = elencoDaCena(');
    const iPe = APP.indexOf("const peEsc = pautaDoEscondido(personagemRef.current || personagem, { presentes: aqui });");
    const iRet = APP.lastIndexOf("golpeFinalEnvelopeRef.current = null;");
    t("8. pautaDoTurno agora lê `aqui` do elencoDaCena do topo (mesma chamada, sem repetir)", iAqui > 0);
    t("8. …e chama pautaDoEscondido só fora de combate, dentro do calou",
      iPe > iAqui && /if \(!combateRef\.current\) \{\s*\n\s*const peEsc = pautaDoEscondido/.test(APP));
    t("8. …e isso acontece antes do fim de pautaDoTurno (return p)", iRet > 0 && iPe > iRet && APP.indexOf("return p;\n  };", iRet) > iPe);
  }

  /* 10. COERÊNCIA — o golpe de oportunidade e o contra-ataque da reação
     também passam pelo veredito do furtivo, não só o golpe comum. */
  t("10. o contra-ataque da reação passa pelo veredito do furtivo (com posição)",
    /vfRev = vereditoDoFurtivo\(\{/.test(APP) && /calou\("vereditoDoFurtivo-revide"/.test(APP)
    && /danoDaClasse\(pers\.classe, nv, Math\.round\(danoDe\(pers, false\) \/ 2\), vfRev \? \{ furtivo: vfRev\.soma \} : null\) \* 0\.6/.test(APP));
  t("10. o golpe de oportunidade também passa pelo veredito do furtivo",
    /vfOp = vereditoDoFurtivo\(\{/.test(APP) && /calou\("vereditoDoFurtivo-oportunidade"/.test(APP)
    && /danoDaClasse\(persBase\.classe, persBase\.nivel \|\| 1, Math\.round\(danoDe\(persBase, false\) \/ 2\), vfOp \? \{ furtivo: vfOp\.soma \} : null\)/.test(APP));

  /* 9. SAVE/LOAD — de graça: `pers.condicoes` viaja com o personagem
     inteiro, e é isso que se confirma aqui (nenhuma chave nova de save). */
  t("9. o personagem inteiro (condicoes incluso) é o que o save grava",
    /salvar\(\{ personagem: /.test(APP));

  /* A REVELAÇÃO SE PERDIA NA MESMA FRASE (achado jogando, MM6). A queda por
     ato (ponto 5) chamava mudarFicha no TOPO de agirInterno, mas o ramo
     final — a declaração livre, sem golpe nem fuga nem comando: é onde
     "Grito por ajuda!" cai — abria `persG` do `personagem` de React (o
     valor do RENDER, e portanto o de ANTES da queda), não de `fichaViva()`.
     `fecharMeuTurno(persG, ...)` então devolvia ao Narrador — e ao save — a
     ficha de antes da queda, com "escondido" de volta. Jogando: o sistema
     dizia "✧ Escondido cai", e a próxima leitura do save mostrava a
     condição viva do mesmo jeito. Não é о nascer nem o revelar que erram —
     os dois têm prova unitária acima —, é a INTEGRAÇÃO: o elo entre "a
     ficha mudou no meio do turno" e "o resto do turno lê a ficha nova",
     que só a prova jogada expõe. */
  t("a declaração livre lê fichaViva() (não o personagem stale do render) ao montar persG",
    /let persG = fichaViva\(\) \|\| personagem, notaOp = "";/.test(APP));
}

console.log(`\nmm6 escondido: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
