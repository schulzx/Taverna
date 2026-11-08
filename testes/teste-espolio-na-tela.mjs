/* teste-espolio-na-tela.mjs (TE10, 09/11/2026) — a conta da cerimónia do
   espólio (src/espolio-na-tela.js), formas.md §TE.

   O que se prova, e é tudo puro (sem React):
   1. as tabelas de §TE 8 com a forma que a secção dá;
   2. a ordem: as cartas na ordem de revelacaoDoEspolio (a menos rara
      primeiro, a peça com nome e a relíquia por último), e a última
      viragem é a da mais rara;
   3. o teto de 4 s, com qualquer número de cartas; nenhum `de` negativo;
   4. a antecipação só na última, e só se for rara ou melhor;
   5. o reduce: um passo só, o quadro final, de 160;
   6. a relíquia: sempre a última, o véu dela é VEU.semRetorno, e soma a
      sua sequência por cima do teto;
   7. o chip contra a cerimónia (formaDoEspolio);
   8. a fila das cerimónias: espólio → nível → despertar, nunca com a luta;
   9. o veredito com os dois lados, o nome da carta, o resumo, o chip, o
      despertar e a barra — e nenhuma palavra da máquina no que a tela diz. */
import {
  T, VEU, ALVOS, CERIMONIA_DO_NIVEL, MOVIMENTO_DO_DADO, ENCAIXE, COR_DA_RARIDADE, FIM_DA_LUTA,
  REVELACAO_DO_ESPOLIO, LUZ_DA_RARIDADE, CARTA_DO_ESPOLIO, VEREDITO_DO_ESPOLIO, FIO_DO_DESPERTAR, FAIXA_DO_GANHO,
  FAIXA_DO_FECHO, CHIP_DO_ACHADO, DESPERTAR_DA_TELA, RELIQUIA_DA_TELA, FILA_DAS_CERIMONIAS, PALAVRAS_DO_ESPOLIO,
} from "../src/estilo.js";
import {
  frase, cartasDoEspolio, ganhoDoEspolio, formaDoEspolio, ehRara, duracaoDoCronograma, cronogramaDoEspolio,
  entrarNaFila, proximaCerimonia, fioDoArtefacto, vereditoDoEspolio, nomeDaCarta, resumoDoEspolio, barraDoGanho,
  chipDoAchado, despertarNaTela,
} from "../src/espolio-na-tela.js";
import { pagaDaQuest, revelacaoDoEspolio, despertarArtefacto, promessaDoArtefacto, DESPERTAR_DO_ARTEFACTO } from "../src/espolios.js";
import { questPorId } from "../src/biblioteca-de-quests.js";
import { itemConsumivel } from "../src/pocoes.js";
import { gerarLoot } from "../src/loot.js";
import { RELIQUIAS, itemDaReliquia } from "../src/relicas.js";
import { RARIDADES, compararItem } from "../src/comparar-item.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? "\n      " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);

/* A MESA DE PROVA: um guerreiro de nível 7 com espada e anel no corpo; a
   quest do Cimo da Escada concluída (paga o artefacto com nome); um anel
   raro sorteado; as ataduras. A paga é a do sistema, com o XP, as moedas e
   o favor da §TE 6 por cima. */
const HEROI = { nome: "Vera", classe: "Guerreiro", nivel: 7, atributos: { forca: 3 }, inventario: [], equipamento: [],
  equipados: { arma: { nome: "Espada Longa", tipo: "arma", base: "Espada Longa", raridade: "comum" }, anel: { nome: "Anel de Cobre", tipo: "anel", raridade: "comum" } } };
const F = questPorId("o_cimo_da_escada");
const feitas = Object.fromEntries(F.etapas.map((e) => [e.id, { dia: 1, ramo: Array.isArray(e.ramos) ? e.ramos[0] : null }]));
const REG = { id: F.id, tipo: F.tipo, papeis: {}, feitas, escolhas: {}, estado: "concluida", desfecho: null };
const paga = pagaDaQuest(F, REG, { semente: "te10", nivel: 7, heroi: HEROI });
const ART = paga.itens.find((i) => i.artefacto);
const ANEL = gerarLoot("raro", { tipo: "anel", nivel: 7, rnd: () => 0.3 });
const ATADURAS = itemConsumivel("ataduras");
const PAGA = { ...paga, moedas: 98, xp: 269, efeitos: [{ tipo: "favor", papel: "capela" }], achados: [], itens: [ART, ANEL, ATADURAS] };
const ENT = revelacaoDoEspolio(PAGA, HEROI, {});
const RELIQUIA = itemDaReliquia(RELIQUIAS[0]);
const ENT_REL = revelacaoDoEspolio({ ...PAGA, itens: [ART, RELIQUIA, ANEL] }, HEROI, {});
const passosDe = (c, nome) => c.filter((p) => p.passo === nome);

/* ============================================================ */
sec("1. as tabelas de §TE 8");
{
  const R = REVELACAO_DO_ESPOLIO;
  t("o véu é o da subida, de propósito; o reduzido também", R.veu === CERIMONIA_DO_NIVEL.veu && R.reduzido === CERIMONIA_DO_NIVEL.reduzido && DESPERTAR_DA_TELA.veu === CERIMONIA_DO_NIVEL.veu);
  t("os tempos de §TE 2: rótulo 120+320 (o coração 640), XP 360+700, moedas 560+500, favor 1060",
    R.rotulo.de === 120 && R.rotulo.dura === 320 && R.rotulo.coracao === 640 && R.xp.de === 360 && R.xp.dura === 700 && R.moedas.de === 560 && R.moedas.dura === 500 && R.favor.de === 1060);
  t("as cartas chegam a 1200, uma a cada 90, 220 cada, de 16 acima, na curva do dado",
    R.chegam.de === 1200 && R.chegam.entre === 90 && R.chegam.dura === 220 && R.chegam.sobe === 16 && R.chegam.curva === MOVIMENTO_DO_DADO.curva);
  t("a viragem: 160 + 160, assenta 240, 120 entre; a antecipação 360, ±2° duas vezes, do raro para cima",
    R.vira.meia === 160 && R.vira.abre === 160 && R.vira.assenta === 240 && R.vira.entre === 120 && R.antecipacao.dura === 360 && R.antecipacao.graus === 2 && R.antecipacao.vezes === 2 && R.antecipacao.desde === "raro");
  t("o teto é de 4 s", R.teto === 4000);
  t("a luz: comum e incomum só o fio; raro passa uma vez (400); épico 0,30; lendário o lume do encaixe; único, a relíquia",
    LUZ_DA_RARIDADE.comum === null && LUZ_DA_RARIDADE.incomum === null && LUZ_DA_RARIDADE.raro.brilho === 400 && LUZ_DA_RARIDADE.epico.halo === 0.3
    && LUZ_DA_RARIDADE.lendario.halo === ENCAIXE.brilho.fixo && LUZ_DA_RARIDADE.lendario.lume === ENCAIXE.brilho && LUZ_DA_RARIDADE.unico === "reliquia");
  const C = CARTA_DO_ESPOLIO;
  t("a carta: 120 × 168, ×0,8 no telefone (96 × 134) e ×1,27 na mesa (152 × 212)",
    C.lado === 120 && C.alto === 168 && Math.round(C.lado * C.escala.telefone) === 96 && Math.round(C.alto * C.escala.telefone) === 134 && Math.round(C.lado * C.escala.mesa) === 152 && Math.abs(C.alto * C.escala.mesa - 212) < 1.5); /* 168 × 1,27 = 213,4: o Figma arredonda para 212 */
  t("as costas: o couro, o filete a 8, o selo de 40 com a estrela de 20; escolhida = anel âmbar de 3",
    C.costas.chao === T.couro && C.costas.filete === 8 && C.costas.selo === 40 && C.costas.estrela === 20 && C.escolhida.anel === 3 && C.escolhida.cor === T.amber);
  t("as marcas são as do encaixe", C.marcas === ENCAIXE.marcas);
  t("o veredito: 343 no telefone, 360 na mesa; o botão tem o piso de toque; a coluna de 880 de 1024 para cima",
    VEREDITO_DO_ESPOLIO.largura.telefone === 343 && VEREDITO_DO_ESPOLIO.largura.mesa === 360 && VEREDITO_DO_ESPOLIO.botao === ALVOS.piso && VEREDITO_DO_ESPOLIO.coluna === 880 && VEREDITO_DO_ESPOLIO.mesaDesde === 1024);
  t("o fio: casas de 14, 6 entre, runa de 8 no ouro da moldura", FIO_DO_DESPERTAR.casa === 14 && FIO_DO_DESPERTAR.entre === 6 && FIO_DO_DESPERTAR.runa === 8);
  t("a faixa do ganho: barra de 8, o que havia a 0,55; a do fecho 32 com a mini-barra 40 × 6 e a entrada do fim da luta",
    FAIXA_DO_GANHO.barra === 8 && FAIXA_DO_GANHO.alfaDoQueHavia === 0.55 && FAIXA_DO_FECHO.alto === 32 && FAIXA_DO_FECHO.barra.largura === 40 && FAIXA_DO_FECHO.barra.alto === 6 && FAIXA_DO_FECHO.entra === FIM_DA_LUTA.entra);
  t("o chip: 32 de alto, alvo de 48, a peça com fio de 1,5; pousa 8 em 180, brilho 400",
    CHIP_DO_ACHADO.alto === 32 && CHIP_DO_ACHADO.alvo === ALVOS.piso && CHIP_DO_ACHADO.fioDaPeca === 1.5 && CHIP_DO_ACHADO.pousa.cai === 8 && CHIP_DO_ACHADO.pousa.dura === 180 && CHIP_DO_ACHADO.pousa.brilho === 400);
  t("o despertar soma 2,1 s e os ganhos são os da subida", DESPERTAR_DA_TELA.total === 2100 && DESPERTAR_DA_TELA.ganhos === CERIMONIA_DO_NIVEL.ganhos && DESPERTAR_DA_TELA.runa.faiscas === 10);
  t("a relíquia: véu sem retorno, as outras a 0,4, lume turquesa a 0,10", RELIQUIA_DA_TELA.veu === VEU.semRetorno && RELIQUIA_DA_TELA.outras === 0.4 && RELIQUIA_DA_TELA.lume.cor === COR_DA_RARIDADE.unico.cor && RELIQUIA_DA_TELA.lume.alfa === 0.1);
  t("a fila: espólio → nível → despertar, e espera a luta", J(FILA_DAS_CERIMONIAS.ordem) === J(["espolio", "nivel", "despertar"]) && FILA_DAS_CERIMONIAS.esperaALuta === true);
  t("toda raridade tem palavra (o único é «relíquia», como a placa)", RARIDADES.every((r) => PALAVRAS_DO_ESPOLIO.raridade[r]) && PALAVRAS_DO_ESPOLIO.raridade.unico === "relíquia");
}

/* ============================================================ */
sec("2. a ordem é do sistema: a menos rara primeiro, a com nome e a relíquia por último");
{
  const cartas = cartasDoEspolio(ENT);
  t("três cartas, na ordem de revelacaoDoEspolio", cartas.length === 3 && J(cartas.map((e) => e.item.nome)) === J(ENT.filter((e) => e.tipo === "item").map((e) => e.item.nome)));
  t("a peça com nome é a última", cartas[2].item.nome === ART.nome);
  const c = cronogramaDoEspolio(ENT);
  const viras = passosDe(c, "vira");
  t("cada carta vira uma vez, pela ordem das cartas", viras.length === 3 && viras.every((v, i) => v.carta === i) && viras.every((v, i) => i === 0 || v.de > viras[i - 1].de));
  t("a última viragem é a da peça mais rara (ou com nome)", viras[viras.length - 1].carta === cartas.length - 1);
  const comuns = revelacaoDoEspolio({ ...PAGA, itens: [ANEL, ATADURAS] }, HEROI, {});
  const cs = cartasDoEspolio(comuns);
  t("sem peça com nome, a mais rara vem no fim (comum antes de raro)", cs[0].item.raridade === "comum" && cs[1].item.raridade === "raro");
  t("a carta nunca chega depois de virar, e nenhum `de` é negativo", c.every((p) => p.de >= 0) && cartas.every((_, i) => passosDe(c, "chega")[i].de < viras[i].de));
}

/* ============================================================ */
sec("3. o teto de 4 s (sem relíquia), com qualquer número de cartas");
{
  const R = REVELACAO_DO_ESPOLIO;
  const tres = duracaoDoCronograma(cronogramaDoEspolio(ENT));
  t(`três cartas (comum, raro, com nome) levam ~3,5 s até ao fim do veredito (${tres} ms)`, tres >= 3400 && tres <= 3700, String(tres));
  for (const n of [1, 2, 3, 4, 6, 8, 12]) {
    const itens = Array.from({ length: n }, (_, i) => gerarLoot(i === n - 1 ? "epico" : "comum", { tipo: "anel", nivel: 7, rnd: () => (i + 1) / (n + 2) }));
    const ent = revelacaoDoEspolio({ ...PAGA, itens }, HEROI, {});
    const c = cronogramaDoEspolio(ent);
    const fim = duracaoDoCronograma(c);
    t(`${n} carta(s): o fim (${fim} ms) não passa do teto, e nenhum de é negativo`, fim <= R.teto && c.every((p) => p.de >= 0), String(fim));
  }
  const muitas = revelacaoDoEspolio({ ...PAGA, itens: Array.from({ length: 6 }, (_, i) => gerarLoot("comum", { tipo: "anel", nivel: 3, rnd: () => i / 9 })) }, HEROI, {});
  const vs = passosDe(cronogramaDoEspolio(muitas), "vira");
  t("com mais cartas o intervalo entre viragens encolhe (as durações não mudam: vivem no CSS)",
    vs.length === 6 && vs[1].de - vs[0].de < R.vira.meia + R.vira.abre + R.vira.entre && vs.every((v) => v.dura === R.vira.meia + R.vira.abre));
}

/* ============================================================ */
sec("4. a antecipação: só a última, só se for rara ou melhor");
{
  const c = cronogramaDoEspolio(ENT);
  const ant = passosDe(c, "antecipacao");
  t("uma antecipação, na última carta, antes da viragem dela", ant.length === 1 && ant[0].carta === 2 && passosDe(c, "vira")[2].de === ant[0].de + REVELACAO_DO_ESPOLIO.antecipacao.dura);
  const semRara = revelacaoDoEspolio({ ...PAGA, itens: [ATADURAS, gerarLoot("incomum", { tipo: "anel", nivel: 3, rnd: () => 0.5 })] }, HEROI, {});
  t("se a última é incomum, não há antecipação", passosDe(cronogramaDoEspolio(semRara), "antecipacao").length === 0);
  t("ehRara: do raro para cima", !ehRara({ raridade: "incomum" }) && ehRara({ raridade: "raro" }) && ehRara({ raridade: "epico" }) && ehRara({ raridade: "unico" }) && !ehRara(null));
}

/* ============================================================ */
sec("5. o reduce: só o quadro final");
{
  const c = cronogramaDoEspolio(ENT, { reduzido: true });
  t("um passo, o final, de 0 e dura 160 (CERIMONIA_DO_NIVEL.reduzido)", c.length === 1 && c[0].passo === "final" && c[0].de === 0 && c[0].dura === CERIMONIA_DO_NIVEL.reduzido.dura);
  t("o coração entra devagar: o rótulo dura o dobro", passosDe(cronogramaDoEspolio(ENT, { coracao: true }), "rotulo")[0].dura === REVELACAO_DO_ESPOLIO.rotulo.coracao);
}

/* ============================================================ */
sec("6. a relíquia: a última, a vela apaga-se");
{
  const cartas = cartasDoEspolio(ENT_REL);
  t("a relíquia é a última carta (peso 99, e a paga põe-na no fim)", cartas[cartas.length - 1].item.raridade === "unico", J(cartas.map((e) => e.item.raridade)));
  const c = cronogramaDoEspolio(ENT_REL);
  const apaga = passosDe(c, "apaga")[0];
  t("o véu dela é VEU.semRetorno, e é a última carta que o leva", apaga && apaga.veu === VEU.semRetorno && apaga.carta === cartas.length - 1);
  t("sobe, antecipa (600), vira (200 + 200), o anel e a estrela, e a frase", ["sobe", "antecipacao", "vira", "anel", "estrela", "frase"].every((p) => c.some((x) => x.passo === p && x.carta === cartas.length - 1))
    && passosDe(c, "antecipacao").find((x) => x.carta === cartas.length - 1).dura === RELIQUIA_DA_TELA.antecipacao.dura);
  const sem = duracaoDoCronograma(cronogramaDoEspolio(ENT)), com = duracaoDoCronograma(c);
  t(`soma cerca de 2,4 s por cima da cerimónia de três cartas (${sem} → ${com})`, com - sem >= 1200 && com - sem <= 2400 && com <= REVELACAO_DO_ESPOLIO.teto + 2400, `${com - sem}`);
  t("o veredito vem depois da frase", passosDe(c, "veredito")[0].de >= passosDe(c, "frase")[0].de + RELIQUIA_DA_TELA.frase.dura);
}

/* ============================================================ */
sec("7. o chip contra a cerimónia (o espólio aparece na proporção do que vale)");
{
  t("com peça, a cerimónia", formaDoEspolio(ENT) === "cerimonia");
  const brasa = revelacaoDoEspolio({ ...PAGA, itens: [] }, HEROI, {});
  t("sem peça e com ganho, a faixa do fecho (o chip no recibo)", formaDoEspolio(brasa) === "fecho");
  t("sem nada, nada", formaDoEspolio([]) === null && formaDoEspolio(null) === null && formaDoEspolio(revelacaoDoEspolio({ moedas: 0, xp: 0, itens: [] }, HEROI)) === null);
  const g = ganhoDoEspolio(ENT);
  t("o ganho: 269 XP, 98 moedas, o favor da capela (o papel, cru — a tela dá-lhe o nome)", g.xp === 269 && g.moedas === 98 && J(g.favores) === J(["capela"]));
}

/* ============================================================ */
sec("8. a fila das cerimónias: uma de cada vez, nunca com a luta aberta");
{
  let fila = [];
  fila = entrarNaFila(fila, { tipo: "despertar", id: "d" });
  fila = entrarNaFila(fila, { tipo: "nivel", id: "n" });
  fila = entrarNaFila(fila, { tipo: "espolio", id: "e" });
  t("espólio → nível → despertar, seja qual for a ordem de chegada", J(fila.map((c) => c.tipo)) === J(["espolio", "nivel", "despertar"]));
  const antes = fila;
  const depois = entrarNaFila(fila, { tipo: "nivel", id: "n2" });
  t("imutável, e estável entre iguais", antes.length === 3 && J(depois.map((c) => c.id)) === J(["e", "n", "n2", "d"]));
  t("com a luta aberta, nenhuma abre", proximaCerimonia(fila, { lutaAberta: true }) === null);
  t("sem luta, a primeira é o espólio", proximaCerimonia(fila).id === "e" && proximaCerimonia(fila.slice(1)).tipo === "nivel");
  t("o lixo não entra", entrarNaFila(null, { tipo: "outra" }).length === 0 && entrarNaFila([], null).length === 0 && proximaCerimonia(null) === null);
}

/* ============================================================ */
sec("9. o que cada peça diz");
{
  const cartas = cartasDoEspolio(ENT);
  const [eAtad, eAnel, eArt] = cartas;
  const vAnel = vereditoDoEspolio(eAnel, { nivel: 7 });
  t("o veredito leva os DOIS lados: o que sai do corpo e para onde vai, e o tempo da troca",
    vAnel.sai === frase(PALAVRAS_DO_ESPOLIO.sai, { nome: "Anel de Cobre" }) && vAnel.troca === eAnel.troca && vAnel.troca.length > 0, J(vAnel));
  t("o botão diz o preço com o verbo da cerimónia («Equipar já …»), e a gaveta o seu", vAnel.botao && vAnel.botao.rotulo.startsWith(PALAVRAS_DO_ESPOLIO.equipar) && vAnel.botao.pode === eAnel.podeEquipar);
  const vAt = vereditoDoEspolio(eAtad);
  t("o consumível já está na mochila e não tem botão", vAt.naMochila === PALAVRAS_DO_ESPOLIO.naMochila && vAt.botao === null && vAt.meta.startsWith(PALAVRAS_DO_ESPOLIO.consumivel));
  const vArt = vereditoDoEspolio(eArt, { nivel: 7 });
  const pr = promessaDoArtefacto(eArt.item, 7);
  t("o artefacto: a história, o fio adormecido (uma runa), e o estado com o nível que a promessa dá",
    vArt.historia === ART.descricao && J(vArt.fio) === J({ estado: "adormecido", runas: [true, false], estrela: false })
    && vArt.estado === `Adormecida · ${frase(PALAVRAS_DO_ESPOLIO.acorda, { n: pr.nivelQueAcorda })}`, J(vArt.estado));
  t("os poderes por acordar, com o losango da promessa (o segundo poder e o gesto)",
    vArt.porAcordar.length === pr.poderes.filter((p) => !p.aceso).length + (pr.gesto && !pr.gesto.aceso ? 1 : 0) && vArt.porAcordar.some((x) => x.endsWith(PALAVRAS_DO_ESPOLIO.gesto)));
  t("a meta diz o encaixe, a raridade e «tem nome»", vArt.meta.split(" · ").length === 3 && vArt.meta.endsWith(PALAVRAS_DO_ESPOLIO.temNome));
  const eRel = cartasDoEspolio(ENT_REL).pop();
  const vRel = vereditoDoEspolio(eRel);
  t("a relíquia: «há N no mundo» com o N de RELIQUIAS, e o gesto uma vez por dia",
    vRel.meta.includes(String(RELIQUIAS.length)) && vRel.gesto.startsWith(`${RELIQUIA.ativo.nome}, ${PALAVRAS_DO_ESPOLIO.porDia}`) && vRel.historia === RELIQUIA.descricao);
  t("lixo dá null", vereditoDoEspolio(null) === null && vereditoDoEspolio({ tipo: "item" }) === null);

  t("o nome da carta: o nome, a raridade, o encaixe e «tem nome»", nomeDaCarta(eArt) === `${ART.nome}, ${PALAVRAS_DO_ESPOLIO.raridade[ART.raridade]}, arma, ${PALAVRAS_DO_ESPOLIO.temNome}.`, nomeDaCarta(eArt));
  const linhaOk = { id: "iniciativa", rotulo: "Iniciativa", curto: "Iniciativa", antes: "+1", depois: "+4", delta: 3, sinal: "ok" };
  t("e as linhas ditas: «Iniciativa sobe 3»", nomeDaCarta({ ...eArt, linhas: [linhaOk] }).endsWith("Iniciativa sobe 3."));

  const r = resumoDoEspolio(ENT, { nomeDoFavor: () => "a capela" });
  t("o resumo da §TE 6: o ganho, o favor com o lugar, e as três peças", r.startsWith("Ganhaste 269 de experiência e 98 moedas. A capela fica a dever-te. Três peças: ") && r.endsWith(`${PALAVRAS_DO_ESPOLIO.temNome}.`), r);
  t("sem o nome do lugar, o favor cala-se (o papel cru é palavra do motor)", !resumoDoEspolio(ENT).includes("capela"));
  t("a peça melhor diz-se melhor", resumoDoEspolio([{ ...eAnel, linhas: [linhaOk] }]).includes(PALAVRAS_DO_ESPOLIO.leitor.melhor));

  const moedas = chipDoAchado({ diz: "uma dívida escrita, assinada por quem ainda está vivo", moedas: 65 });
  t("o chip das moedas: a coisa até à vírgula e o número", moedas.tipo === "moedas" && moedas.texto === "Uma dívida escrita · 65 moedas" && moedas.rotulo.startsWith(PALAVRAS_DO_ESPOLIO.achaste + ":"));
  const vazio = { ...HEROI, equipados: {} };
  const cmp = compararItem(vazio, ANEL, "anel");
  const chipAnel = chipDoAchado({ item: ANEL }, vazio);
  t("o chip da peça: melhor só quando a comparação tem uma linha que sobe", chipAnel.tipo === (cmp.linhas.some((l) => l.sinal === "ok") ? "pecaMelhor" : "peca") && chipAnel.raridade === "raro" && chipAnel.texto.endsWith("· raro"));
  /* o anel comum não pede sintonia: o +1 de defesa vale logo (a CA sobe 1) */
  const forte = { nome: "Anel do astrónomo", tipo: "anel", raridade: "comum", atributos: { defesa: 1 } };
  const chipForte = chipDoAchado({ item: forte }, vazio);
  t("…e então leva «▲» com o número e o leitor ouve «melhor que o teu»", chipForte.tipo === "pecaMelhor" && chipForte.melhor.length > 0 && chipForte.rotulo.includes(PALAVRAS_DO_ESPOLIO.leitor.melhor), J(chipForte));
  t("o chip do consumível: o nome, sem raridade", chipDoAchado({ item: itemConsumivel("cura_m") }).tipo === "consumivel");
  t("lixo dá null", chipDoAchado(null) === null && chipDoAchado({ diz: "nada" }) === null);

  const desperta = despertarArtefacto(ART, { nivel: promessaDoArtefacto(ART, 7).nivelQueAcorda });
  const d = despertarNaTela(ART, desperta, 10);
  t("o despertar: o estado novo, um ganho, e o gesto que ainda dorme com quando acorda",
    d && d.estado === "desperto" && d.ganhos.length === 1 && !d.ganhos[0].gesto && d.dormem.length === 1 && d.dormem[0].includes(PALAVRAS_DO_ESPOLIO.exaltaQuando.split(",")[0]), J(d));
  t("o leitor: «… desperta. Ganha …: ….» (sem ponto dobrado)", d.leitor.startsWith(`${ART.nome} desperta. Ganha ${d.ganhos[0].nome}: `) && !d.leitor.includes(".."), d.leitor);
  const exalta = despertarArtefacto(desperta, { nivel: 20 });
  const e = despertarNaTela(desperta, exalta, 20);
  t("exaltar acende o gesto (a estrela), e nada mais dorme", e.estado === "exaltado" && e.ganhos.some((g) => g.gesto) && e.dormem.length === 0 && fioDoArtefacto(exalta).estrela === true);
  t("nada mudou, nada abre; o que não é artefacto também não", despertarNaTela(ART, ART, 7) === null && despertarNaTela(ANEL, ANEL, 7) === null);
  t("o fio segue DESPERTAR_DO_ARTEFACTO (desperto: duas runas)", J(fioDoArtefacto(desperta).runas) === J([true, true]) && DESPERTAR_DO_ARTEFACTO.desperto.passivos === 2 && fioDoArtefacto(ANEL) === null);

  const b = barraDoGanho(300, 900, 269);
  t("a barra: o que havia e o que entra, em frações", Math.abs(b.havia - 1 / 3) < 1e-9 && Math.abs(b.entra - 269 / 900) < 1e-9 && b.subiu === false);
  const s = barraDoGanho(800, 900, 269);
  t("se passa o nível, enche e diz que subiu", s.subiu === true && Math.abs(s.havia + s.entra - 1) < 1e-9);
  t("sem régua, sem barra", barraDoGanho(10, 0, 5) === null && barraDoGanho(10, null, 5) === null);
  t("frase: a chave que falta fica vazia, nunca «{nome}»", frase("Sai {nome}.", {}) === "Sai .");
}

/* ============================================================ */
sec("10. o sistema não fala de si mesmo (o que a tela diz)");
{
  const textos = [];
  const colher = (x) => { if (typeof x === "string") textos.push(x); else if (x && typeof x === "object") Object.values(x).forEach(colher); };
  colher(PALAVRAS_DO_ESPOLIO);
  const RX = /\b(sistema|IA|Narrador|Cronista|tokens|tabela)\b|aferid/;
  const maus = textos.filter((s) => RX.test(s));
  t(`nenhuma das ${textos.length} palavras do espólio nomeia a máquina`, maus.length === 0, maus.join(" | "));
}

console.log(`\n${ok} ok, ${mal} mal`);
if (mal) process.exit(1);
