/* OS ESPÓLIOS DA QUEST (09/11/2026, Fase TE · TE6) — src/espolios.js

   O que esta suíte prova, e porquê. A planta (mente/plano-temperatura-e-
   espolios.md, §2) pôs a quest a pagar por código — XP pela temperatura,
   moedas pela base de missão, a peça pela família do caminho, os achados
   pelo sítio, as peças com nome pelas decisões da pessoa de 09/11. Cada uma
   dessas frases é uma tabela, e cada tabela é lida de volta aqui:

     1. as tabelas — a curva sobe, o teto é o do DMG, as famílias cobrem os
        ramos que existem, os achados apontam para o catálogo que existe;
     2. o determinismo — a mesma semente, a mesma paga, em qualquer ordem;
     3. a curva por temperatura e nível, e «perto de um nível» por campanha;
     4. as famílias — cada caminho paga o que diz;
     5. os tetos por campanha, em 1000 campanhas: ⌈atos/2⌉ raras, dois
        artefactos, duas lembranças, uma relíquia e só no confronto;
     6. o achado que espera (decisão da pessoa) e o registo que o guarda;
     7. o artefacto que cresce; o momento e a pauta;
     8. o null, o lixo e a imutabilidade.
   A força das peças contra a luta é da OUTRA suíte, a régua do poder
   (teste-regua-do-poder.mjs, TE7): esta prova a conta, aquela o efeito. */
import {
  PAGA_DA_QUEST, PAGA_DO_CORACAO, BASE_DAS_MOEDAS, FAMILIA_DO_RAMO, RECOMPENSA_DA_FAMILIA,
  TETO_DE_RARIDADE_DO_NIVEL, ORCAMENTO_DO_ESPOLIO, SITIO_DO_PAPEL, ACHADO_DO_SITIO,
  DESPERTAR_DO_ARTEFACTO, ARTEFACTOS_COM_NOME, RELIQUIA_DO_CONFRONTO, LINHA_DO_ESPOLIO,
  familiaDoRamo, tetoDeRaridade, grauDoDesfecho, pagaDaQuest, achadosDaEtapa, achadoEscondido,
  despertarArtefacto, revelacaoDoEspolio, espolioNaPauta,
} from "../src/espolios.js";
import { BIBLIOTECA_DE_QUESTS, TEMPERATURAS, questPorId, avancarQuest } from "../src/biblioteca-de-quests.js";
import { vaoDoNivel, pressaDoNivel, tetoDoPresente } from "../src/juiz.js";
import { RARIDADES, BASES, gerarLoot } from "../src/loot.js";
import { TIER, PODERES } from "../src/afixos.js";
import { consumivelPorId } from "../src/pocoes.js";
import { RELIQUIAS } from "../src/relicas.js";
import { TIPOS_MASMORRA } from "../src/mundo-base.js";
import { garantirFactos, anotarTurno } from "../src/livro-de-factos.js";
import { dadoDo } from "../src/semente.js";

let bons = 0, maus = 0;
const t = (nome, cond, extra = "") => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? "  — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);
const semAc = (x) => String(x || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim().replace(/\s+/g, "_");

const TEMPS = Object.keys(TEMPERATURAS);
const TIPO1 = BIBLIOTECA_DE_QUESTS.filter((q) => q.tipo === 1);
const TIPO2 = BIBLIOTECA_DE_QUESTS.filter((q) => q.tipo === 2);
const HEROI = { nome: "Vera", classe: "Guerreiro", nivel: 5, atributos: { forca: 3, destreza: 2, vigor: 3, intelecto: 0, presenca: 1, percepcao: 1 }, equipados: {} };

/* Um registo fechado de uma ficha: todas as etapas feitas, e as que têm
   ramos fechadas pelo ramo pedido (ou o primeiro). */
function fechada(F, { ramo = null, estado = "concluida", desfecho = null, papeis = {} } = {}) {
  const feitas = {};
  for (const e of F.etapas) feitas[e.id] = { dia: 1, ramo: Array.isArray(e.ramos) ? (ramo && e.ramos.includes(ramo) ? ramo : ramo || e.ramos[0]) : null, variante: null };
  return { id: F.id, tipo: F.tipo, inicio: 0, ultimoAvanco: 1, papeis, feitas, escolhas: {}, acesas: {}, reviravoltas: [], consequencias: [], estado, motivo: "etapas", desfecho, fecho: null, fechouEm: 1 };
}
const fracaoDe = (xp, nivel) => xp / (vaoDoNivel(nivel) * pressaDoNivel(nivel));

/* ============================================================ */
sec("1. AS TABELAS — se é número, é tabela, e a suíte lê-a de volta");
{
  t("a curva tem uma entrada por grau de temperatura da biblioteca, e a falha aponta para uma delas",
    TEMPS.every((k) => PAGA_DA_QUEST[k]) && TEMPS.includes(PAGA_DA_QUEST.falha));
  const ordem = [...TEMPS].sort((a, b) => TEMPERATURAS[a].ordem - TEMPERATURAS[b].ordem);
  t("o XP sobe de grau em grau, de 1/12 na brasa a 1/4 no incêndio (a régua do pedido)",
    ordem.every((k, i) => i === 0 || PAGA_DA_QUEST[k].xp > PAGA_DA_QUEST[ordem[i - 1]].xp)
    && PAGA_DA_QUEST.brasa.xp === 1 / 12 && PAGA_DA_QUEST.incendio.xp === 1 / 4);
  t("as moedas sobem de grau em grau", ordem.every((k, i) => i === 0 || PAGA_DA_QUEST[k].moedas > PAGA_DA_QUEST[ordem[i - 1]].moedas));
  t("a peça: a brasa não dá, as outras dão um degrau que existe e sobe",
    PAGA_DA_QUEST.brasa.item === null && ordem.slice(1).every((k, i) => RARIDADES.includes(PAGA_DA_QUEST[k].item) && (i === 0 || TIER[PAGA_DA_QUEST[k].item] > TIER[PAGA_DA_QUEST[ordem[i]].item])));
  const graus = ["melhor", "bom", "meio", "pior"];
  t("o coração: quatro graus, o XP desce do melhor ao pior, e só a metade boa leva lembrança",
    graus.every((g, i) => PAGA_DO_CORACAO[g] && (i === 0 || PAGA_DO_CORACAO[g].xp < PAGA_DO_CORACAO[graus[i - 1]].xp))
    && PAGA_DO_CORACAO.melhor.lembranca && PAGA_DO_CORACAO.bom.lembranca && !PAGA_DO_CORACAO.meio.lembranca && !PAGA_DO_CORACAO.pior.lembranca);
  t("a base das moedas é a das missões: três vezes ela é o teto do presente do Juiz, em todo nível",
    Array.from({ length: 20 }, (_, i) => i + 1).every((n) => 3 * (BASE_DAS_MOEDAS.fixo + BASE_DAS_MOEDAS.porNivel * n) === tetoDoPresente(n)));

  const fams = ["ferro", "palavra", "sombra"];
  const todos = fams.flatMap((f) => FAMILIA_DO_RAMO[f]);
  t("as três famílias listadas não partilham ramo", new Set(todos).size === todos.length);
  t("toda família tem a sua paga, e só as de peça têm encaixes", [...fams, "saber"].every((f) => RECOMPENSA_DA_FAMILIA[f])
    && RECOMPENSA_DA_FAMILIA.ferro.slots.every((s) => BASES[s]) && RECOMPENSA_DA_FAMILIA.sombra.slots.every((s) => BASES[s])
    && RECOMPENSA_DA_FAMILIA.palavra.slots === null && RECOMPENSA_DA_FAMILIA.saber.slots === null);
  t("o ferro dá peça de combate; a sombra, um acessório", ["arma", "armadura"].every((s) => RECOMPENSA_DA_FAMILIA.ferro.slots.includes(s)) && RECOMPENSA_DA_FAMILIA.sombra.slots.includes("anel"));
  t("o consumível do saber existe no catálogo para cada grau", TEMPS.every((k) => consumivelPorId(RECOMPENSA_DA_FAMILIA.saber.consumivel[k])));
  const ramos = new Set();
  for (const q of BIBLIOTECA_DE_QUESTS) {
    for (const e of q.etapas) for (const r of e.ramos || []) ramos.add(r);
    for (const rv of q.reviravoltas || []) for (const ef of rv.efeitos || []) if (ef.etapa && ef.etapa.ramos) for (const r of ef.etapa.ramos) ramos.add(r);
  }
  t(`todo ramo das ${BIBLIOTECA_DE_QUESTS.length} fichas cai numa família (${ramos.size} ramos)`, [...ramos].every((r) => ["ferro", "palavra", "sombra", "saber"].includes(familiaDoRamo(r))));
  const listadosQueExistem = todos.filter((r) => ramos.has(r)).length;
  t("e as listas falam a língua das fichas: a maior parte dos ramos listados existe nelas", listadosQueExistem >= todos.length * 0.75, `${listadosQueExistem}/${todos.length}`);

  t("o teto é o do DMG de 2014: incomum até 4, raro até 10, épico até 16, lendário daí em diante",
    J(TETO_DE_RARIDADE_DO_NIVEL.map((f) => [f.ate, f.teto])) === J([[4, "incomum"], [10, "raro"], [16, "epico"], [20, "lendario"]]));
  t("e o típico é sempre um degrau abaixo do teto", TETO_DE_RARIDADE_DO_NIVEL.every((f) => TIER[f.tipico] === TIER[f.teto] - 1));
  /* a coluna da quest é da régua do poder (teste-regua-do-poder.mjs): nunca
     passa o teto do DMG nem desce do típico, e do 11 em diante fica um degrau
     abaixo do teto — o porquê, com os números, está na própria tabela */
  t("a peça de quest nunca passa o teto nem desce do típico", TETO_DE_RARIDADE_DO_NIVEL.every((f) => TIER[f.daQuest] <= TIER[f.teto] && TIER[f.daQuest] >= TIER[f.tipico]));
  t("até ao 10 a quest dá o teto; do 11 em diante, um degrau abaixo (a régua mediu +14 a +25 no teto)",
    TETO_DE_RARIDADE_DO_NIVEL.filter((f) => f.ate <= 10).every((f) => f.daQuest === f.teto) && TETO_DE_RARIDADE_DO_NIVEL.filter((f) => f.ate > 10).every((f) => TIER[f.daQuest] === TIER[f.teto] - 1));
  t("tetoDeRaridade lê a tabela nos limites", tetoDeRaridade(4).teto === "incomum" && tetoDeRaridade(5).teto === "raro" && tetoDeRaridade(16).teto === "epico" && tetoDeRaridade(17).teto === "lendario" && tetoDeRaridade(99).teto === "lendario");
  t("o orçamento são as decisões da pessoa: dois artefactos, duas lembranças, uma relíquia",
    ORCAMENTO_DO_ESPOLIO.artefactos === 2 && ORCAMENTO_DO_ESPOLIO.lembrancas === 2 && ORCAMENTO_DO_ESPOLIO.reliquias === 1 && RELIQUIA_DO_CONFRONTO.porCampanha === ORCAMENTO_DO_ESPOLIO.reliquias);
  t("a relíquia é rara: a chance é positiva e menor que metade", RELIQUIA_DO_CONFRONTO.chance > 0 && RELIQUIA_DO_CONFRONTO.chance < 0.5);
  t("o confronto é uma mão que existe nas fichas", TIPO1.some((q) => q.mao && q.mao.tipo === RELIQUIA_DO_CONFRONTO.mao));

  const sitios = Object.keys(ACHADO_DO_SITIO);
  t("todo sítio tem dois achados de caminho e um escondido", sitios.every((s) => ACHADO_DO_SITIO[s].caminho.length >= 2 && ACHADO_DO_SITIO[s].escondido));
  const achados = sitios.flatMap((s) => [...ACHADO_DO_SITIO[s].caminho, ACHADO_DO_SITIO[s].escondido]);
  t("todo achado dá moedas, um consumível do catálogo ou um encaixe que existe",
    achados.every((a) => Number.isFinite(a.moedas) || consumivelPorId(a.consumivel) || BASES[a.equipamento]));
  t("o caminho nunca dá peça — a peça do caminho é só a escondida", sitios.every((s) => ACHADO_DO_SITIO[s].caminho.every((a) => !a.equipamento)));
  t("os ids dos achados são únicos dentro do sítio", sitios.every((s) => { const ids = [...ACHADO_DO_SITIO[s].caminho, ACHADO_DO_SITIO[s].escondido].map((a) => a.id); return new Set(ids).size === ids.length; }));
  t("SITIO_DO_PAPEL aponta só para sítios com achados", Object.values(SITIO_DO_PAPEL).every((s) => ACHADO_DO_SITIO[s]));
  t("as masmorras do mundo têm achados com o nome delas", TIPOS_MASMORRA.every((m) => ACHADO_DO_SITIO[semAc(m.tipo)]));
  t("e há o ermo, para o que ninguém diz onde é", !!ACHADO_DO_SITIO.ermo);

  t("o artefacto cresce em três estados, e nenhum passa o teto (a régua mediu o degrau a mais)",
    J(DESPERTAR_DO_ARTEFACTO.ordem) === J(["adormecido", "desperto", "exaltado"]) && DESPERTAR_DO_ARTEFACTO.ordem.every((e) => DESPERTAR_DO_ARTEFACTO[e].degrausAcimaDoTeto === 0)
    && DESPERTAR_DO_ARTEFACTO.adormecido.passivos === 1 && DESPERTAR_DO_ARTEFACTO.desperto.passivos === 2 && DESPERTAR_DO_ARTEFACTO.exaltado.gesto && !DESPERTAR_DO_ARTEFACTO.desperto.gesto);
  const defs = Object.entries(ARTEFACTOS_COM_NOME);
  t("as peças com nome apontam para quests que existem", defs.every(([id]) => questPorId(id)));
  t("o artefacto é do enredo quente (tipo 1, fogueira ou incêndio); a lembrança, do coração",
    defs.every(([id, d]) => { const q = questPorId(id); return d.genero === "artefacto" ? q.tipo === 1 && ["fogueira", "incendio"].includes(q.temperatura) : d.genero === "lembranca" && q.tipo === 2; }));
  t("os passivos são do vocabulário que tem leitor (afixos.js), e servem no encaixe da peça",
    defs.every(([, d]) => d.passivos.length >= 1 && d.passivos.every((p) => { const x = PODERES.find((y) => y.id === p); return x && x.slots.includes(d.tipo); })));
  t("o nome e a história só usam papéis da ficha", defs.every(([id, d]) => {
    const q = questPorId(id);
    return [...`${d.nome} ${d.historia}`.matchAll(/\{([a-z0-9_]+)\}/g)].every((m) => q.papeis[m[1]]);
  }));
  t("a base fixa, quando há, existe no encaixe", defs.every(([, d]) => d.base === null || BASES[d.tipo].some((b) => b.nome === d.base)));
  t("o gesto, quando há, fala a língua do ativo das relíquias (nome, diz, efeito)", defs.every(([, d]) => d.gesto === null || (d.gesto.nome && d.gesto.diz && d.gesto.efeito)));
  t("a linha da pauta cabe na secção momento", LINHA_DO_ESPOLIO.teto === 140 && LINHA_DO_ESPOLIO.abre.length < 40 && LINHA_DO_ESPOLIO.naoPode.length > 0);
}

/* ============================================================ */
sec("2. O DETERMINISMO — a mesma semente, a mesma paga");
{
  const F = questPorId("o_convite_sem_selo");
  const R = fechada(F, { ramo: "recusar" });
  const a = pagaDaQuest(F, R, { semente: "mundo-7", nivel: 6, heroi: HEROI });
  const b = pagaDaQuest(F, R, { semente: "mundo-7", nivel: 6, heroi: HEROI });
  t("duas chamadas, a mesma paga, byte a byte", J(a) === J(b));
  /* rolar dados da casa no meio não muda nada: toda a sorte é da semente */
  gerarLoot("raro", {}); gerarLoot("epico", {});
  t("e a sorte da casa no meio não a toca", J(pagaDaQuest(F, R, { semente: "mundo-7", nivel: 6, heroi: HEROI })) === J(a));
  const S = questPorId("o_salvo_conduto");
  const pecas = new Set();
  for (let i = 0; i < 40; i++) pecas.add(J(pagaDaQuest(S, fechada(S, { ramo: "violenta" }), { semente: "m" + i, nivel: 6, heroi: HEROI }).itens));
  t("sementes diferentes dão peças diferentes (não é um prémio fixo)", pecas.size > 20, `${pecas.size}/40`);
  const ach = achadosDaEtapa(S, fechada(S, { ramo: "violenta" }), "passo", { semente: "z", nivel: 4 });
  t("o achado da etapa também é da semente", J(ach) === J(achadosDaEtapa(S, fechada(S, { ramo: "violenta" }), "passo", { semente: "z", nivel: 4 })));
  t("o escondido também", J(achadoEscondido(S, fechada(S, { estado: "aberta" }), { semente: "z", nivel: 4 })) === J(achadoEscondido(S, fechada(S, { estado: "aberta" }), { semente: "z", nivel: 4 })));
  t("a chave da paga é a da quest — é ela que vai para `aplicadas`", a.chave === "espolio:o_convite_sem_selo");
}

/* ============================================================ */
sec("3. A CURVA — pela temperatura e pelo nível");
{
  const umaDe = (temp) => TIPO1.find((q) => q.temperatura === temp && !ARTEFACTOS_COM_NOME[q.id]);
  let curvaCerta = true, sobe = true, noTetoDoPresente = true, noTetoDeRaridade = true, brasaSemPeca = true;
  for (let n = 1; n <= 20; n++) {
    let antes = -1;
    for (const temp of ["brasa", "chama", "fogueira", "incendio"]) {
      const F = umaDe(temp);
      const p = pagaDaQuest(F, fechada(F, { ramo: "luta" }), { semente: "c", nivel: n, heroi: { ...HEROI, nivel: n } });
      const ferro = p.familia === "ferro";
      const esperado = Math.max(1, Math.round(vaoDoNivel(n) * PAGA_DA_QUEST[temp].xp * pressaDoNivel(n) * RECOMPENSA_DA_FAMILIA[p.familia].xp));
      if (p.xp !== esperado) curvaCerta = false;
      if (ferro && p.xp <= antes) sobe = false;
      antes = p.xp;
      if (p.moedas > tetoDoPresente(n)) noTetoDoPresente = false;
      for (const i of p.itens) if (i.raridade !== "unico" && !i.artefacto && i.tipo !== "consumivel" && TIER[i.raridade] > TIER[tetoDeRaridade(n).daQuest]) noTetoDeRaridade = false;
      if (temp === "brasa" && p.itens.some((i) => i.tipo !== "consumivel")) brasaSemPeca = false;
    }
  }
  t("o XP é a fração do vão do Juiz (vão × fração × pressa × família), em todos os níveis", curvaCerta);
  t("e sobe da brasa ao incêndio em todos os níveis", sobe);
  t("as moedas nunca passam o teto do presente do Juiz", noTetoDoPresente);
  t("a peça nunca passa o degrau da quest do nível (nem, portanto, o teto)", noTetoDeRaridade);
  t("a brasa não dá peça", brasaSemPeca);
  /* a campanha de cinco atos da planta: brasa, chama, fogueira, fogueira, incêndio + dois corações */
  const n = 6;
  const atos = ["brasa", "chama", "fogueira", "fogueira", "incendio"].map((temp) => { const F = umaDe(temp); return fracaoDe(pagaDaQuest(F, fechada(F, { ramo: "luta" }), { semente: "k", nivel: n }).xp, n); });
  const cor = TIPO2.slice(0, 2).map((F) => fracaoDe(pagaDaQuest(F, fechada(F, { estado: "terminada", desfecho: F.desfechos[0].id }), { semente: "k", nivel: n }).xp, n));
  const soma = [...atos, ...cor].reduce((s, x) => s + x, 0);
  t(`uma campanha dá perto de um nível pela história (${soma.toFixed(2)}: ${atos.reduce((s, x) => s + x, 0).toFixed(2)} dos atos + ${cor.reduce((s, x) => s + x, 0).toFixed(2)} do coração)`, soma >= 0.8 && soma <= 1.2);
  const F = umaDe("fogueira");
  const falhou = pagaDaQuest(F, fechada(F, { estado: "falhada" }), { semente: "k", nivel: n, heroi: HEROI });
  t("a quest falhada paga o XP da falha (o de brasa) e mais nada",
    falhou.xp === Math.max(1, Math.round(vaoDoNivel(n) * PAGA_DA_QUEST.brasa.xp * pressaDoNivel(n))) && falhou.moedas === 0 && falhou.itens.length === 0 && falhou.achados.length === 0);
  t("a quest aberta não paga nada ainda", pagaDaQuest(F, fechada(F, { estado: "aberta" }), { nivel: n }) === null);
  /* o coração, pelo grau */
  const Q = questPorId("a_carta_que_nao_se_abre");
  const graus = Object.fromEntries(Q.desfechos.map((d) => [d.id, grauDoDesfecho(Q, d.id)]));
  t("o grau sai da estrutura: o marco é o melhor, a morte e o cedo são o pior, o padrão é o meio",
    graus.perdao === "melhor" && graus.o_preco_inteiro === "pior" && graus.tarde_demais === "pior" && graus.a_ferida_fica === "meio" && graus.a_divida_paga === "bom", J(graus));
  t("todos os desfechos das fichas do coração têm grau", TIPO2.every((q) => q.desfechos.every((d) => ["melhor", "bom", "meio", "pior"].includes(grauDoDesfecho(q, d.id)))));
  const xpDe = (d) => pagaDaQuest(Q, fechada(Q, { estado: "terminada", desfecho: d }), { semente: "k", nivel: n }).xp;
  t("o coração paga mais no melhor do que no pior, e nunca moedas", xpDe("perdao") > xpDe("a_ferida_fica") && xpDe("a_ferida_fica") > xpDe("o_preco_inteiro")
    && pagaDaQuest(Q, fechada(Q, { estado: "terminada", desfecho: "perdao" }), { nivel: n }).moedas === 0);
}

/* ============================================================ */
sec("4. AS FAMÍLIAS — cada caminho paga o que diz");
{
  t("familiaDoRamo: violenta é ferro, social é palavra, furtiva é sombra, descobrir é saber",
    familiaDoRamo("violenta") === "ferro" && familiaDoRamo("social") === "palavra" && familiaDoRamo("furtiva") === "sombra" && familiaDoRamo("descobrir") === "saber" && familiaDoRamo(null) === null);
  const S = questPorId("o_salvo_conduto"); /* chama; o passo tem violenta, social e furtiva */
  const op = { semente: "f", nivel: 6, heroi: HEROI };
  const ferro = pagaDaQuest(S, fechada(S, { ramo: "violenta" }), op);
  const palavra = pagaDaQuest(S, fechada(S, { ramo: "social" }), op);
  const sombra = pagaDaQuest(S, fechada(S, { ramo: "furtiva" }), op);
  t("o ramo da etapa da mão decide a família", ferro.familia === "ferro" && palavra.familia === "palavra" && sombra.familia === "sombra");
  t("o ferro dá uma peça de combate, do degrau da temperatura (chama: incomum)", ferro.itens.length === 1 && ["arma", "armadura", "escudo"].includes(ferro.itens[0].tipo) && ferro.itens[0].raridade === "incomum" && ferro.itens[0].deQuest === S.id);
  t("a peça do ferro tem a forma da que o herói usa (a base da classe)", ferro.itens[0].base === "Espada Longa" || ferro.itens[0].base === "Cota de Malha");
  t("a palavra não dá peça: dá +50% de moedas e um favor de um lugar da quest",
    palavra.itens.length === 0 && palavra.moedas === Math.min(tetoDoPresente(6), Math.round((BASE_DAS_MOEDAS.fixo + BASE_DAS_MOEDAS.porNivel * 6) * PAGA_DA_QUEST.chama.moedas * 1.5)) && palavra.moedas > ferro.moedas && palavra.efeitos.length === 1 && palavra.efeitos[0].tipo === "favor" && S.papeis[palavra.efeitos[0].papel].de === "lugar");
  t("a sombra dá um acessório e um achado a mais", sombra.itens.length === 1 && RECOMPENSA_DA_FAMILIA.sombra.slots.includes(sombra.itens[0].tipo) && sombra.achados.length === 1);
  const L = TIPO1.find((q) => q.etapas.some((e) => (e.ramos || []).some((r) => familiaDoRamo(r) === "saber")) && q.temperatura !== "brasa" && !ARTEFACTOS_COM_NOME[q.id]);
  const ramoSaber = L.etapas.flatMap((e) => e.ramos || []).find((r) => familiaDoRamo(r) === "saber");
  const RL = fechada(L);
  for (const e of L.etapas) if ((e.ramos || []).length) RL.feitas[e.id].ramo = e.ramos.find((r) => familiaDoRamo(r) === "saber") || e.ramos[0];
  const L2 = { ...L, mao: null };
  const saber = pagaDaQuest(L2, RL, op);
  t(`o saber dá +25% de XP e o consumível do grau (${L.id}, ramo ${ramoSaber})`,
    saber.familia === "saber" && saber.itens.length === 1 && saber.itens[0].tipo === "consumivel" && saber.xp === Math.max(1, Math.round(vaoDoNivel(6) * PAGA_DA_QUEST[L.temperatura].xp * pressaDoNivel(6) * 1.25)));
}

/* ============================================================ */
sec("5. OS TETOS POR CAMPANHA — 1000 campanhas simuladas");
{
  const porTemp = (temp) => TIPO1.filter((q) => q.temperatura === temp);
  let estourou = 0, raras = 0, arts = 0, lemb = 0, rels = 0, relFora = 0, maxRaras = 0;
  for (let c = 0; c < 1000; c++) {
    const r = dadoDo("campanha-te6", c);
    const pick = (l) => l[Math.floor(r() * l.length)];
    const nivel = 1 + Math.floor(r() * 18);
    const atos = ["brasa", "chama", "fogueira", "fogueira", "incendio"].map((temp) => pick(porTemp(temp)));
    /* a campanha que os artefactos de exemplo mais apertam: as duas fichas com nome dentro, e o confronto */
    if (r() < 0.5) atos[3] = questPorId("o_convite_sem_selo");
    if (r() < 0.7) atos[4] = questPorId("o_cimo_da_escada");
    const coracao = [questPorId("a_ultima_licao"), pick(TIPO2), questPorId("a_ultima_licao")];
    const pagas = [];
    for (const F of [...atos, ...coracao]) {
      const R = F.tipo === 1 ? fechada(F, { ramo: pick(["luta", "violenta", "lamina", "furtiva", "palavra"]) }) : fechada(F, { estado: "terminada", desfecho: F.desfechos[0].id });
      const p = pagaDaQuest(F, R, { semente: "camp" + c, nivel, heroi: { ...HEROI, nivel }, campanha: { atos: 5, pagas } });
      for (const i of p.itens) if (i.raridade === "unico" && !(F.mao && F.mao.tipo === RELIQUIA_DO_CONFRONTO.mao)) relFora++;
      pagas.push(p);
    }
    const itens = pagas.flatMap((p) => p.itens);
    const nR = itens.filter((i) => TIER[i.raridade] >= TIER.raro && i.raridade !== "unico" && !i.artefacto).length;
    const nA = itens.filter((i) => i.artefacto && i.artefacto.genero === "artefacto").length;
    const nL = itens.filter((i) => i.artefacto && i.artefacto.genero === "lembranca").length;
    const nU = itens.filter((i) => i.raridade === "unico").length;
    maxRaras = Math.max(maxRaras, nR);
    if (nR > Math.ceil(5 * ORCAMENTO_DO_ESPOLIO.rarosPorAto) || nA > ORCAMENTO_DO_ESPOLIO.artefactos || nL > ORCAMENTO_DO_ESPOLIO.lembrancas || nU > ORCAMENTO_DO_ESPOLIO.reliquias) estourou++;
    raras += nR; arts += nA; lemb += nL; rels += nU;
  }
  t("nenhuma das 1000 campanhas passa do orçamento (⌈atos/2⌉ raras, 2 artefactos, 2 lembranças, 1 relíquia)", estourou === 0, `${estourou} estouraram`);
  t(`e o orçamento morde: alguma campanha chegou às ${Math.ceil(5 * ORCAMENTO_DO_ESPOLIO.rarosPorAto)} raras`, maxRaras === Math.ceil(5 * ORCAMENTO_DO_ESPOLIO.rarosPorAto));
  t("a mesma peça com nome nunca cai duas vezes (a ficha da lembrança veio duas vezes em cada campanha)", lemb > 0 && lemb <= 1000, `${lemb}`);
  t("a relíquia só cai no confronto final", relFora === 0);
  t(`e cai rara: ${rels} em 1000 campanhas (≈ ${(RELIQUIA_DO_CONFRONTO.chance * 100).toFixed(0)}% do confronto)`, rels > 50 && rels < 250);
  console.log(`  ··  média por campanha: ${(raras / 1000).toFixed(2)} raras · ${(arts / 1000).toFixed(2)} artefactos · ${(lemb / 1000).toFixed(2)} lembranças · ${(rels / 1000).toFixed(3)} relíquias  (medido, não travado)`);

  /* o teto à mão: dois artefactos já levados, o terceiro vira peça comum */
  const C = questPorId("o_cimo_da_escada");
  const dois = [{ quest: "x", itens: [{ nome: "A", raridade: "raro", artefacto: { genero: "artefacto" } }, { nome: "B", raridade: "raro", artefacto: { genero: "artefacto" } }] }];
  const p = pagaDaQuest(C, fechada(C, { ramo: "luta" }), { semente: "a", nivel: 8, heroi: HEROI, campanha: { pagas: dois } });
  t("com dois artefactos já levados, o confronto dá a peça da família, não um terceiro", p.itens.every((i) => !i.artefacto) && p.itens.some((i) => i.tipo === "arma" || i.tipo === "armadura"));
  const comRel = [{ quest: "y", itens: [{ nome: RELIQUIAS[0].nome, raridade: "unico" }] }];
  let segunda = 0;
  for (let i = 0; i < 300; i++) if (pagaDaQuest(C, fechada(C, { ramo: "luta" }), { semente: "r" + i, nivel: 8, campanha: { pagas: comRel } }).itens.some((x) => x.raridade === "unico")) segunda++;
  t("com uma relíquia já na campanha, o confronto nunca dá a segunda", segunda === 0);
  let conf = 0;
  for (let i = 0; i < 1000; i++) if (pagaDaQuest(C, fechada(C, { ramo: "luta" }), { semente: "q" + i, nivel: 8 }).itens.some((x) => x.raridade === "unico")) conf++;
  t(`o confronto dá relíquia perto da chance da tabela (${(conf / 10).toFixed(1)}% em 1000)`, Math.abs(conf / 1000 - RELIQUIA_DO_CONFRONTO.chance) < 0.04);
}

/* ============================================================ */
sec("6. OS ACHADOS — o da etapa, e o escondido que espera a quest fechar");
{
  const S = questPorId("o_salvo_conduto");
  const R = fechada(S, { ramo: "violenta" });
  const a = achadosDaEtapa(S, R, "passo", { semente: "s", nivel: 4 });
  t("a etapa que fechou por um ramo deixa um achado, e só um", a.length === 1 && a[0].quest === S.id && a[0].etapa === "passo");
  t("o achado do caminho é moeda ou consumível, nunca peça", a.every((x) => Number.isFinite(x.moedas) || (x.item && x.item.tipo === "consumivel")));
  t("a etapa sem ramo não deixa nada (escolher bem é uma das duas portas)", achadosDaEtapa(S, R, "aceitar", { semente: "s" }).length === 0);
  t("a etapa por fazer não deixa nada", achadosDaEtapa(S, { ...R, feitas: {} }, "passo", { semente: "s" }).length === 0);
  t("o sítio sai do contexto quando ele o diz", achadosDaEtapa(S, R, "passo", { semente: "s", tipoDoLugar: { passo: "Cemitério" } })[0].sitio === "cemiterio");
  t("e de SITIO_DO_PAPEL quando não diz", achadosDaEtapa(questPorId("a_lamina_enterrada"), fechada(questPorId("a_lamina_enterrada"), { estado: "terminada" }), questPorId("a_lamina_enterrada").etapas.find((e) => e.ramos).id, { semente: "s" }).every((x) => ACHADO_DO_SITIO[x.sitio]));

  /* o escondido: o desvio do Salvo-Conduto, achado por lá estar */
  const CID = "Vau Negro";
  const papeis = { desvio: { tipo: "lugar", nome: "Trilho do Vau", cidade: CID } };
  const aberto = { ...fechada(S, { estado: "aberta" }), feitas: {}, papeis };
  const semIr = { factos: garantirFactos(null), dia: 2 };
  const foi = { factos: anotarTurno(garantirFactos(null), { dia: 2, turno: 3, lugar: { nome: "Trilho do Vau", cidade: CID }, cidade: CID }).factos, dia: 2 };
  const e0 = achadoEscondido(S, aberto, { semente: "s", nivel: 4, estado: semIr });
  const e1 = achadoEscondido(S, aberto, { semente: "s", nivel: 4, estado: foi });
  t("o escondido mora no sítio opcional da ficha (o desvio), e acha-se por lá estar", e0.onde === "desvio" && e0.como === "esteve");
  t("sem lá ir, não se acha — e ninguém diz que existe", e0.aberto && !e0.achou);
  t("indo lá com a quest aberta, acha-se", e1.aberto && e1.achou && !e1.levado);
  const fechouDepois = achadoEscondido(S, { ...aberto, estado: "concluida" }, { semente: "s", nivel: 4, estado: foi });
  t("decisão da pessoa: fechada a quest, o escondido perdeu-se (mesmo que lá se tenha estado)", !fechouDepois.aberto && !fechouDepois.achou);
  const levado = achadoEscondido(S, { ...aberto, espolio: { achados: [e1.achado.id], pago: false } }, { semente: "s", nivel: 4, estado: foi });
  t("o que já está em `espolio.achados` volta marcado como levado (não cai duas vezes)", levado.levado === true);
  const semOpcional = questPorId("o_convite_sem_selo");
  const e2 = achadoEscondido(semOpcional, fechada(semOpcional, { estado: "aberta" }), { semente: "s", nivel: 6 });
  t("sem sítio opcional, o escondido é o segredo do sítio da quest: acha-se por DESCOBRIR", e2.onde === "salao" && e2.como === "descobriu");
  t("o escondido pode ser peça, no degrau abaixo da temperatura e no teto do nível", (() => {
    for (const q of TIPO1) {
      const x = achadoEscondido(q, fechada(q, { estado: "aberta" }), { semente: "p", nivel: 3 });
      if (x && x.achado.item && x.achado.item.tipo !== "consumivel" && TIER[x.achado.item.raridade] > TIER.incomum) return false;
    }
    return true;
  })());
  t("o registo guarda o espólio: avancarQuest preserva `espolio` (campo novo e aditivo)", (() => {
    const F = questPorId("o_salvo_conduto");
    const reg = { id: F.id, tipo: 1, inicio: 0, ultimoAvanco: 0, papeis: {}, feitas: {}, escolhas: {}, acesas: {}, reviravoltas: [], consequencias: [], estado: "aberta", espolio: { achados: ["x:escondido:y", 7], pago: false } };
    const R2 = avancarQuest(F, reg, { estado: { dia: 0, factos: garantirFactos(null) } });
    return R2 && J(R2.espolio) === J({ achados: ["x:escondido:y"], pago: false });
  })());
  t("e o registo sem espólio continua sem ele (a versão antiga não vê nada)", (() => {
    const F = questPorId("o_salvo_conduto");
    const R2 = avancarQuest(F, { id: F.id, tipo: 1, inicio: 0, estado: "aberta" }, { estado: { dia: 0, factos: garantirFactos(null) } });
    return R2 && !("espolio" in R2);
  })());
}

/* ============================================================ */
sec("7. O ARTEFACTO QUE CRESCE, o momento e a pauta");
{
  const C = questPorId("o_cimo_da_escada");
  const RC = fechada(C, { ramo: "luta", papeis: { vilao: { tipo: "pessoa", nome: "Morvan" }, covil: { tipo: "lugar", nome: "Torre Rota" } } });
  const p = pagaDaQuest(C, RC, { semente: "a", nivel: 8, heroi: HEROI });
  const art = p.itens.find((i) => i.artefacto);
  t("o confronto com ficha dá o artefacto, adormecido, com um passivo", art && art.artefacto.estado === "adormecido" && art.poderes.length === 1 && art.poderes[0].id === "bote");
  t("no teto do nível, e com a forma da arma do herói", art.raridade === tetoDeRaridade(8).daQuest && art.base === "Espada Longa");
  t("o nome e a história levam os papéis da campanha", art.nome === "A Que Subiu a Escada" && art.descricao.includes("Morvan") && art.descricao.includes("Torre Rota"));
  t("pede sintonia, guarda a semente do crescimento, e ainda não tem gesto", art.sintoniza === true && art.artefacto.passivos.length === 2 && !art.ativo && art.artefacto.gesto);
  const mesmo = despertarArtefacto(art, { nivel: 8, quests: [] });
  t("sem nada que o acorde, é o MESMO item", mesmo === art);
  const desp = despertarArtefacto(art, { nivel: 8, quests: [{ temperatura: "fogueira", estado: "concluida" }] });
  t("uma fogueira concluída depois acorda-o: desperto, dois passivos, sem gesto", desp.artefacto.estado === "desperto" && J(desp.poderes.map((x) => x.id)) === J(["bote", "empunhadura"]) && !desp.ativo);
  t("a quest fria não acorda nada", despertarArtefacto(art, { nivel: 8, quests: [{ temperatura: "chama", estado: "concluida" }] }) === art);
  const exal = despertarArtefacto(desp, { nivel: 8, confronto: true });
  t("o confronto exalta-o: o gesto abre, na forma do ativo das relíquias", exal.artefacto.estado === "exaltado" && exal.ativo && exal.ativo.nome === "O Último Degrau");
  t("seis níveis também o exaltam", despertarArtefacto(art, { nivel: 14 }).artefacto.estado === "exaltado");
  t("nunca desce de estado", despertarArtefacto(exal, { nivel: 1, quests: [] }) === exal);
  t("os atributos acompanham os passivos (a dobra de loot.js): o desperto não perde o dano da peça", desp.atributos.dano === art.atributos.dano);
  t("despertarArtefacto recusa o que não é artefacto", despertarArtefacto({ nome: "x" }, {}) === null && despertarArtefacto(null) === null);

  const rv = revelacaoDoEspolio(p, HEROI, {});
  const tipos = rv.map((x) => x.tipo);
  t("a revelação: moedas, XP, e as peças por último", tipos[0] === "moedas" && tipos[1] === "xp" && tipos[tipos.length - 1] === "item");
  const it = rv.find((x) => x.tipo === "item");
  t("cada peça vem com a comparação, o encaixe e o rótulo do botão", it.slot === "arma" && Array.isArray(it.linhas) && it.rotulo.startsWith("Equipar") && it.podeEquipar === true);
  t("em luta, a armadura não se troca (o veredito antes do clique)", (() => {
    const pa = { itens: [{ nome: "Cota", tipo: "armadura", raridade: "incomum", atributos: { defesa: 3 } }] };
    const x = revelacaoDoEspolio(pa, HEROI, { emCombate: true }).find((y) => y.tipo === "item");
    return x.podeEquipar === false && x.motivo.length > 0;
  })());
  t("a peça com nome é a última, mesmo entre outras", (() => {
    const pa = { itens: [art, { nome: "Anel", tipo: "anel", raridade: "comum", atributos: {} }] };
    const l = revelacaoDoEspolio(pa, HEROI).filter((x) => x.tipo === "item");
    return l[l.length - 1].item === art;
  })());

  const linha = espolioNaPauta(p);
  t("a pauta: uma linha, com a peça com nome e meia linha da história", linha && linha.linha.startsWith(LINHA_DO_ESPOLIO.abre) && linha.linha.includes("A Que Subiu a Escada — ") && linha.linha.length <= LINHA_DO_ESPOLIO.teto);
  t("e o veto para naoPode", linha.naoPode === LINHA_DO_ESPOLIO.naoPode);
  const longa = espolioNaPauta({ moedas: 10, itens: Array.from({ length: 12 }, (_, i) => ({ nome: "Uma peça de nome comprido número " + i })) });
  t("nunca passa o teto da secção", longa.linha.length <= LINHA_DO_ESPOLIO.teto && longa.linha.endsWith("…"));
  const S = questPorId("o_salvo_conduto");
  const ach = achadosDaEtapa(S, fechada(S, { ramo: "violenta" }), "passo", { semente: "s", nivel: 4 });
  const la = espolioNaPauta(ach);
  t("o achado também tem a sua linha", la && la.linha.startsWith(LINHA_DO_ESPOLIO.achou) && la.linha.length <= LINHA_DO_ESPOLIO.teto);
  t("nada para dizer, nada na pauta", espolioNaPauta({ xp: 10, moedas: 0, itens: [] }) === null && espolioNaPauta([]) === null);

  /* a lembrança: a metade boa do desfecho, com os papéis da campanha */
  const Q = questPorId("a_ultima_licao");
  const melhor = Q.desfechos.find((d) => grauDoDesfecho(Q, d.id) === "melhor").id;
  const pior = Q.desfechos.find((d) => grauDoDesfecho(Q, d.id) === "pior").id;
  const pl = pagaDaQuest(Q, fechada(Q, { estado: "terminada", desfecho: melhor, papeis: { mestre: { tipo: "pessoa", nome: "Odália" }, quem: { tipo: "pessoa", nome: "Dunstan" } } }), { semente: "l", nivel: 5 });
  const lem = pl.itens[0];
  t("o melhor desfecho deixa a lembrança, incomum, com os nomes de quem a viveu", lem && lem.artefacto.genero === "lembranca" && lem.raridade === "incomum" && lem.nome === "A Faixa de Odália" && lem.descricao.startsWith("Dunstan"));
  t("o pior não deixa nada", pagaDaQuest(Q, fechada(Q, { estado: "terminada", desfecho: pior }), { semente: "l", nivel: 5 }).itens.length === 0);
}

/* ============================================================ */
sec("8. O NULL, O LIXO E A IMUTABILIDADE");
{
  const F = questPorId("o_salvo_conduto");
  const R = fechada(F, { ramo: "violenta" });
  let tudoNulo = true;
  for (const lixo of [null, undefined, {}, [], 7, "x"]) {
    try {
      if (pagaDaQuest(lixo, R, {}) !== null) tudoNulo = false;
      if (pagaDaQuest(F, lixo, {}) !== null) tudoNulo = false;
      if (achadosDaEtapa(lixo, R, "passo", {}).length) tudoNulo = false;
      if (achadosDaEtapa(F, lixo, "passo", {}).length) tudoNulo = false;
      if (achadoEscondido(lixo, R, {}) !== null || achadoEscondido(F, lixo, {}) !== null) tudoNulo = false;
      if (despertarArtefacto(lixo, {}) !== null) tudoNulo = false;
      if (J(revelacaoDoEspolio(lixo)) !== "[]") tudoNulo = false;
      if (lixo !== null && Array.isArray(lixo) ? false : espolioNaPauta(lixo) !== null) tudoNulo = false;
      if (grauDoDesfecho(lixo, "x") !== null) tudoNulo = false;
    } catch (e) { tudoNulo = false; console.log("     estourou com", J(lixo), e.message); }
  }
  t("lixo em qualquer argumento: null ou vazio, nunca estoura", tudoNulo);
  t("as opções podem ser null (o `= {}` não cobre null)", (() => { try { return !!pagaDaQuest(F, R, null) && Array.isArray(achadosDaEtapa(F, R, "passo", null)) && !!achadoEscondido(F, R, null); } catch { return false; } })());
  t("o registo de outra quest não paga", pagaDaQuest(F, { ...R, id: "outra" }, {}) === null);
  t("o nível lixo vale o nível 1", J(pagaDaQuest(F, R, { semente: "n", nivel: "abc" })) === J(pagaDaQuest(F, R, { semente: "n", nivel: 1 })));
  const antesF = J(F), antesR = J(R), antesH = J(HEROI);
  const camp = { atos: 5, pagas: [{ quest: "z", itens: [{ nome: "q", raridade: "raro" }] }] };
  const antesC = J(camp);
  pagaDaQuest(F, R, { semente: "i", nivel: 6, heroi: HEROI, campanha: camp });
  achadosDaEtapa(F, R, "passo", { semente: "i" });
  achadoEscondido(F, R, { semente: "i" });
  const C = questPorId("o_cimo_da_escada");
  const art = pagaDaQuest(C, fechada(C, { ramo: "luta" }), { semente: "a", nivel: 8, heroi: HEROI }).itens.find((i) => i.artefacto);
  const antesA = J(art);
  despertarArtefacto(art, { nivel: 20, confronto: true });
  revelacaoDoEspolio({ moedas: 3, itens: [art] }, HEROI);
  t("nada do que entra é mutado: a ficha, o registo, o herói, a campanha, o artefacto", J(F) === antesF && J(R) === antesR && J(HEROI) === antesH && J(camp) === antesC && J(art) === antesA);

  /* a porta nova de loot.js: a base forçada, e o sorteio antigo intacto */
  const r1 = dadoDo("loot-base", 1), r2 = dadoDo("loot-base", 1);
  t("gerarLoot sem `base` rola exatamente o que rolava (a mesma corrente, o mesmo item)", J(gerarLoot("raro", { tipo: "arma", nivel: 5, rnd: r1 })) === J(gerarLoot("raro", { tipo: "arma", nivel: 5, rnd: r2, base: null })));
  t("com `base`, a peça tem essa base", gerarLoot("raro", { tipo: "arma", nivel: 5, base: "Rapieira", rnd: dadoDo("lb", 2) }).base === "Rapieira");
  t("uma base que não é do encaixe é ignorada", gerarLoot("raro", { tipo: "arma", nivel: 5, base: "Escudo Torre", rnd: dadoDo("lb", 3) }).base !== "Escudo Torre");
}

console.log(`\n${bons} ok, ${maus} falha(s)`);
if (maus) process.exit(1);
