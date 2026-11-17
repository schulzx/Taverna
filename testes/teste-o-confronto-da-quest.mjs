/* O CLÍMAX DA QUEST (S7, 17/11/2026) — src/o-confronto-da-quest.js e
   O_CLIMAX_DA_QUEST (src/biblioteca-de-quests.js)

   A sessão jogada de 15/11: «O Que Desce ao Anoitecer» fechou sem a besta
   aparecer — o rastro fechou numa praça, e a etapa da fera fechou com
   informação. A regra: a etapa cujo objeto é alguém do vilão só fecha com
   ele EM CENA (vencido, ou encontrado pelo cartão do encontro), e a etapa
   de rastro fecha no covil.
   §1 as tabelas e o molde;
   §2 a auditoria das 52 quests (as que têm confronto, e as que fechavam
      sem encontro);
   §3 a sessão de 15/11, refeita: o que fechou então já não fecha;
   §4 o cartão no covil: o veredito, o risco, o livro;
   §5 A CATRACA: mil mundos por semente — 100 % das quests com confronto
      têm um encontro com risco antes da encruzilhada final, e nenhum rastro
      fecha fora do covil;
   §6 o null, o determinismo e a imutabilidade. */
import { BIBLIOTECA_DE_QUESTS, O_CLIMAX_DA_QUEST, oClimaxDaQuest, validarQuest, questPorId, abrirQuest, avancarQuest, estadoDaQuest } from "../src/biblioteca-de-quests.js";
import { oConfrontoAqui, oLivroDoEncontro, aChaveDoConfronto, O_CONFRONTO_DA_QUEST } from "../src/o-confronto-da-quest.js";
import { ESCOLHAS_DO_CONFRONTO, escolhasDoEncontro, resolverEscolha, pautaDoEncontro } from "../src/encontro-na-estrada.js";
import { garantirFactos, encontrou, poupou, conheceu } from "../src/livro-de-factos.js";
import { anotarOLivro } from "../src/motor/livro-do-turno.js";
import { registrarConsulta } from "../src/npcs.js";
import { esqueletoDaCampanha } from "../src/esqueleto.js";
import { ESTRUTURAS } from "../src/historia.js";
import { gerarGeografia } from "../src/geografia.js";
import { estenderEspinha } from "../src/saga.js";
import { nucleoDaCampanha } from "../src/nucleo.js";
import { chefesDoMundo } from "../src/mundo-base.js";

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);
const pct = (a, b) => (b ? Math.round((1000 * a) / b) / 10 : 0);

sec("§1 as tabelas e o molde");
t("O_CLIMAX_DA_QUEST: a marca, a presença (vencer ou encontrar), o rastro e a cena própria do rosto",
  J(O_CLIMAX_DA_QUEST.marca) === J(["derrotou", "poupou", "conheceu"]) && J(O_CLIMAX_DA_QUEST.presenca) === J(["derrotou", "encontrou"])
  && O_CLIMAX_DA_QUEST.rasto.test("seguir o rastro") && O_CLIMAX_DA_QUEST.rasto.test("rasto") && J(O_CLIMAX_DA_QUEST.semConfronto) === J(["rosto"]));
const DES = questPorId("o_que_desce_ao_anoitecer");
const cD = oClimaxDaQuest(DES);
t("o Que Desce: o rastro fecha no covil (estar na toca), a fera só com ela em cena",
  cD.rasto && cD.rasto.covil === "toca" && J(cD.rasto.exige) === J([["esta_em", "lugar:toca"]])
  && cD.fera && cD.fera.hostil === "fera" && cD.fera.covil === "toca" && J(cD.fera.exige) === J([["algum", ["derrotou", "papel:fera"], ["encontrou", "papel:fera"]]]), J(cD));
t("o texto das etapas tocadas em PT-BR («rastro», sem «tua mão»)", DES.etapas[1].texto === "Seguir o rastro até onde a besta dorme" && DES.etapas[2].texto === "Encarar {fera} na toca");
t("a etapa de decisão (só escolha) não é confronto: o destino fica de fora", !cD.destino && !cD.ver);
t("o rosto (a oferta à mesa) não é confronto", Object.keys(oClimaxDaQuest(questPorId("o_convite_sem_selo"))).length === 0);
t("o «covil» da ficha vence a derivação (a Mão Que Mudou de Lado: o esconderijo, não o refúgio)", oClimaxDaQuest(questPorId("a_mao_que_mudou_de_lado")).salvo.covil === "esconderijo");
{
  const torta = JSON.parse(J(questPorId("o_velorio_pago")));
  torta.covil = "enlutada";
  t("validarQuest: o «covil» tem de ser um papel de lugar", !validarQuest(torta).ok && validarQuest(torta).erros.some((e) => /covil/.test(e)));
}

sec("§2 a auditoria das 52 quests");
const refs = (c, out = []) => { if (Array.isArray(c)) c.forEach((x) => refs(x, out)); else if (typeof c === "string") out.push(c); return out; };
let comConfronto = 0, fechavaSem = 0, invalidas = 0, semCovil = 0, comRasto = 0;
for (const q of BIBLIOTECA_DE_QUESTS) {
  if (!validarQuest(q).ok) invalidas++;
  const c = oClimaxDaQuest(q);
  const conf = Object.entries(c).filter(([, x]) => x.hostil);
  if (Object.values(c).some((x) => x.rasto)) comRasto++;
  if (!conf.length) continue;
  comConfronto++;
  if (conf.some(([, x]) => !x.covil)) semCovil++;
  /* fechava sem encontro: um caminho da etapa que não passa por vencer o hostil */
  const sem = conf.some(([id, x]) => {
    const e = q.etapas.find((y) => y.id === id);
    const caminhos = e.conclui[0] === "algum" ? e.conclui.slice(1) : [e.conclui];
    return caminhos.some((p) => !refs(p).some((s, i, a) => s === "papel:" + x.hostil && ["derrotou", "poupou"].includes(a[i - 1])));
  });
  if (sem) fechavaSem++;
}
console.log(`      · ${BIBLIOTECA_DE_QUESTS.length} quests: ${comConfronto} com etapa de confronto, ${fechavaSem} delas fechavam sem encontro; ${comRasto} com rastro antes do confronto`);
t("as 52 quests validam com a regra nova", BIBLIOTECA_DE_QUESTS.length === 52 && invalidas === 0);
t("28 têm etapa de confronto, e todas sabem onde (o covil)", comConfronto === 28 && semCovil === 0, `${comConfronto} / ${semCovil}`);
t("e as 28 fechavam sem a besta em cena por algum caminho (o defeito da sessão, em todas)", fechavaSem === 28, String(fechavaSem));
t("as do coração (tipo 2) não têm confronto: o vilão não é delas", BIBLIOTECA_DE_QUESTS.filter((q) => q.tipo === 2).every((q) => !Object.values(oClimaxDaQuest(q)).some((x) => x.hostil)));

sec("§3 a sessão de 15/11, refeita");
const CID = "Alto do Sal";
const CURRAL = { nome: "Curral da Ladeira", cidade: CID }, TOCA = { nome: "Lapa do Monte", cidade: CID }, PRACA = { nome: "Praça do Poço", cidade: CID };
const N = (nome) => ({ nome, conhecidoEm: 1, local: CID, relacao: "neutro", status: "vivo", consultas: 0 });
const e0 = () => ({ npcs: { Benta: N("Benta"), Vasco: N("Vasco"), "Lobo Cinzento": N("Lobo Cinzento") }, cidadeAtual: CID, lugar: PRACA, personagem: { nome: "Vera", grupo: [], inventario: [], moedas: 50 }, dia: 1, npcTurno: 0, factos: garantirFactos(null), baseMundo: null });
let turno = 1;
const falar = (e, ...n) => ({ ...e, factos: anotarOLivro(e, { tipo: "factos", dia: e.dia, turno: (turno += 10), falouCom: n }).factos });
const ir = (e, lugar) => { const e2 = { ...e, lugar, cidadeAtual: lugar.cidade, jornada: null }; return { ...e2, factos: anotarOLivro(e2, { lugar, dia: e2.dia, turno: (turno += 10) }).factos }; };
const segredo = (e, lugar) => ({ ...e, factos: anotarOLivro(e, { tipo: "factos", dia: e.dia, turno: (turno += 10), segredos: [lugar] }).factos });
const consulta = (e, nome) => ({ ...e, npcs: registrarConsulta(e.npcs, nome) });
const PAP = { curral: CURRAL, toca: TOCA, fera: { nome: "Lobo Cinzento" }, pastora: { nome: "Benta" }, tratador: { nome: "Vasco" } };
const ESC = { quests: [{ id: "x", tipo: 1, estado: "concluida" }] };
{
  let e = e0();
  let R = abrirQuest(DES, { estado: e, papeis: PAP, ...ESC });
  const av = () => { R = avancarQuest(DES, R, { estado: e, ...ESC }); };
  e = ir(e, CURRAL); av();
  e = segredo(e, CURRAL); e = falar(e, "Benta"); e = ir(e, PRACA); av();
  t("[T5] duas pistas de três e o herói na praça: o rastro NÃO fecha (antes fechava aqui)", !!R.feitas.ver && !R.feitas.rasto, J(R.feitas));
  const v = estadoDaQuest(DES, R, { estado: e, ...ESC });
  t("e o que falta diz o covil: estar na toca", v.etapa === "rasto" && v.faltaTexto.some((x) => /Lapa do Monte/.test(x)), J(v.faltaTexto));
  e = ir(e, TOCA); av();
  t("na toca, o rastro fecha", !!R.feitas.rasto);
  e = consulta(falar(e, "Vasco"), "Vasco"); av();
  t("[T14] o tratador consultado e a toca visitada: a etapa da fera NÃO fecha sem a besta em cena", !R.feitas.fera, J(R.feitas));
  const v2 = estadoDaQuest(DES, R, { estado: e, ...ESC });
  t("e a escolha do destino não abre antes do encontro (o veredito vem depois de a ver)", v2.etapa === "fera" && !v2.escolhas.length && v2.faltaTexto.some((x) => /dar de cara/.test(x)), J(v2.faltaTexto));
  /* o encontro de verdade, pelo cartão: espreitar com sucesso */
  const id = R.papeis.fera.id;
  const est = { tabela: "confronto", fase: "resolvido", escolha: "espreitar", desfecho: { id: "espreitou", luta: false }, quest: { quest: DES.id, etapa: "fera", papel: "fera", alvo: id, nome: "Lobo Cinzento" } };
  e = { ...e, factos: oLivroDoEncontro(e.factos, est, { dia: e.dia, turno: (turno += 10) }) };
  av();
  t("depois do encontro (espreitar), a fera fecha pelo assobio — a besta esteve em cena", R.feitas.fera && R.feitas.fera.ramo === "assobio", J(R.feitas));
}

sec("§4 o cartão no covil");
const PASSO = { quest: DES.id, etapa: "fera", confronto: { papel: "fera", id: "npc|Lobo Cinzento", nome: "Lobo Cinzento", quem: "o que desce ao anoitecer", covil: { nome: "Lapa do Monte", cidade: CID } } };
const ONDE = { lugar: "Lapa do Monte", dentroDe: "", cidade: CID };
const c0 = oConfrontoAqui([PASSO], ONDE, {});
t("no covil, o cartão nasce: a tabela do confronto, o herói viu primeiro, o rótulo (não o nome) à frente",
  c0 && c0.tabela === "confronto" && c0.fase === "escolha" && c0.quemViu === "heroi" && c0.criatura === "o que desce ao anoitecer" && c0.inimigos[0].nome === "Lobo Cinzento", J(c0));
t("fora do covil, nada (a praça não é a toca)", oConfrontoAqui([PASSO], { lugar: "Praça do Poço", cidade: CID }, {}) === null);
t("o recuo guardado não reabre o mesmo cartão", oConfrontoAqui([PASSO], ONDE, { recusados: [aChaveDoConfronto(c0)] }) === null && aChaveDoConfronto(c0) === "o_que_desce_ao_anoitecer|fera|fera");
const vs = escolhasDoEncontro(c0, { bonus: {}, moedas: 0 });
t("as cinco escolhas, pela ordem da tabela, cada uma com o veredito", J(vs.map((v) => v.id)) === J(ESCOLHAS_DO_CONFRONTO.ordem));
const comRisco = (v) => v.id === "recuar" || !v.disponivel || (v.id === "lutar" ? v.seConseguir.luta : (!!v.pericia && v.seFalhar && v.seFalhar.luta));
t("todo dado falhado é luta, e lutar é luta: não há clímax sem risco (só recuar não arrisca, e não escreve nada)", vs.every(comRisco), J(vs.map((v) => [v.id, v.pericia, v.seFalhar && v.seFalhar.luta])));
t("a fera não ouve propostas (o lobo não fala); gente fala", !vs.find((v) => v.id === "negociar").disponivel
  && escolhasDoEncontro(oConfrontoAqui([{ ...PASSO, confronto: { ...PASSO.confronto, nome: "Brás, o Cobrador", quem: "quem cobra a portagem" } }], ONDE, {}), {}).find((v) => v.id === "negociar").disponivel);
t("a pauta do confronto diz «aqui, à minha frente», não «na estrada»", /aqui, à minha frente/.test(pautaDoEncontro(c0).acabou[0]) && !/estrada/.test(pautaDoEncontro(c0).acabou[0]));
{
  const r = resolverEscolha(c0, "capturar", { d20: 20, bonus: { atletismo: 5 } });
  const L = oLivroDoEncontro(garantirFactos(null), r, { dia: 3, turno: 1 });
  t("capturar com sucesso: o encontro e a queda sem sangue (rendido: o «poupou» da ficha)", r.desfecho.id === "capturou" && encontrou(L, "npc|Lobo Cinzento") && poupou(L, "npc|Lobo Cinzento"));
  const rf = resolverEscolha(c0, "capturar", { d20: 1, bonus: {} });
  t("capturar falhado: a corda falha e a luta abre com a besta a atacar", rf.desfecho.luta && rf.desfecho.iniciativa === "inimigos");
  const rr = resolverEscolha(c0, "recuar", {});
  t("recuar não escreve nada: quem recuou não esteve frente a frente", oLivroDoEncontro(garantirFactos(null), rr, { dia: 3 }) && !encontrou(oLivroDoEncontro(garantirFactos(null), rr, { dia: 3 }), "npc|Lobo Cinzento"));
  const rl = resolverEscolha(c0, "lutar", {});
  const Ll = oLivroDoEncontro(garantirFactos(null), rl, { dia: 3 });
  t("lutar escreve o encontro (e a luta escreve a queda depois)", rl.desfecho.luta && encontrou(Ll, "npc|Lobo Cinzento") && conheceu(Ll, "npc|Lobo Cinzento"));
}
t("O_CONFRONTO_DA_QUEST: recuar não escreve; capturar rende", J(O_CONFRONTO_DA_QUEST.naoEscreve) === J(["recuou"]) && J(O_CONFRONTO_DA_QUEST.rendido) === J(["capturou"]));

sec("§5 A CATRACA — mil mundos por semente");
{
  const ESPINHAS = ESTRUTURAS.filter((e) => e.espinha).map((e) => e.id);
  const MIL = 1000;
  let mundos = 0, quests = 0, comEncontro = 0, antesDaEncruzilhada = 0, rastos = 0, rastoNoCovil = 0, comRastoSemCovil = 0, primeiro = "";
  for (let i = 0; i < MIL; i++) {
    const semente = `Climax|${i}`;
    const mapa = gerarGeografia(semente, null, null);
    const espinha = estenderEspinha({ semente, mapa, estrutura: ESPINHAS[i % ESPINHAS.length], cidadeInicial: mapa.cidades[0].nome, antecedente: "", dia: 1 });
    const nucleo = nucleoDaCampanha(semente, mapa, { espinha, antecedente: "", grupo: [] });
    const k = esqueletoDaCampanha({ semente, mapa, espinha, antecedente: "", nucleo, chefes: chefesDoMundo(semente, mapa) });
    if (!k) continue;
    mundos++;
    for (const a of k.atos.filter((x) => x.quest)) {
      const F = questPorId(a.quest);
      const c = oClimaxDaQuest(F);
      for (const [etapa, x] of Object.entries(c)) {
        if (x.rasto) { rastos++; const cv = a.papeis[x.covil]; if (cv && cv.nome && J(x.exige[0]) === J(["esta_em", "lugar:" + x.covil])) rastoNoCovil++; else comRastoSemCovil++; }
        if (!x.hostil) continue;
        quests++;
        const h = a.papeis[x.hostil] || {}, cv = a.papeis[x.covil] || {};
        const passo = { quest: F.id, etapa, confronto: { papel: x.hostil, id: "", nome: h.nome || "", quem: h.nome || "alguém", covil: { nome: cv.nome || "", cidade: cv.cidade || "" } } };
        const est = cv.nome ? oConfrontoAqui([passo], { lugar: cv.nome, cidade: cv.cidade || "" }, { mundo: { semente, mapa } }) : null;
        const vs2 = est ? escolhasDoEncontro(est, { bonus: {}, moedas: 0 }) : [];
        const exigeOk = x.exige.some((ex) => J(ex) === J(["algum", ["derrotou", "papel:" + x.hostil], ["encontrou", "papel:" + x.hostil]]));
        if (est && vs2.length && vs2.every(comRisco) && vs2.some((v) => v.id !== "recuar" && v.disponivel) && exigeOk) comEncontro++;
        else if (!primeiro) primeiro = `${semente} ${F.id}/${etapa}: covil «${cv.nome || ""}», hostil «${h.nome || ""}»`;
        /* a quest não acaba sem o encontro: nenhuma solução de uma etapa
           ANTES do confronto fecha a quest (o `fecha` que saltaria a besta),
           e as etapas correm por ordem — a encruzilhada final, esteja antes
           ou depois, só acaba a quest com o confronto feito */
        const iC = F.etapas.findIndex((e) => e.id === etapa);
        const saltaria = F.etapas.slice(0, iC).some((e) => Object.values((F.solucoes || {})[e.id] || {}).some((vs) => (vs || []).some((v) => v && v.fecha)));
        if (iC >= 0 && !saltaria) antesDaEncruzilhada++;
      }
    }
  }
  console.log(`      · ${mundos} mundos; ${quests} etapas de confronto escolhidas; ${rastos} rastros antes de um confronto`);
  t(`os ${MIL} mundos dão esqueleto`, mundos === MIL, String(mundos));
  t("há confrontos escolhidos (a catraca mede alguma coisa)", quests > 500, String(quests));
  t("100 % das etapas de confronto: um encontro com risco no covil, exigido antes de fechar", comEncontro === quests, `${comEncontro}/${quests} — ${primeiro}`);
  t("100 %: a quest não acaba sem o encontro (nada antes do confronto a fecha, e a encruzilhada final só acaba com ele feito)", antesDaEncruzilhada === quests, `${antesDaEncruzilhada}/${quests}`);
  t("nenhum rastro fecha fora do covil: todo rastro exige estar no covil, e o covil tem nome no mundo", rastos > 0 && rastoNoCovil === rastos && comRastoSemCovil === 0, `${rastoNoCovil}/${rastos}`);
}

sec("§6 o null, o determinismo e a imutabilidade");
t("o lixo não lança: oConfrontoAqui(null), oLivroDoEncontro com lixo devolve o livro", oConfrontoAqui(null, null, null) === null && oConfrontoAqui([{}], {}, {}) === null && oLivroDoEncontro("x", null, null) === "x" && J(oClimaxDaQuest(null)) === "{}");
{
  const p = JSON.parse(J([PASSO]));
  const a = J(oConfrontoAqui(p, ONDE, {})), b = J(oConfrontoAqui(p, ONDE, {}));
  t("determinístico, e não toca no que recebe", a === b && J(p) === J([PASSO]));
}

console.log(`\nS7 · o clímax da quest: ${bons} passaram, ${maus} falharam`);
if (maus) process.exit(1);
