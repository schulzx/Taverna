/* AS QUESTS E O VILÃO TURNO A TURNO (08/11/2026, Fase BQ · BQ7, o lado dos
   motores) — src/motor/quests-do-turno.js

   O esqueleto (BQ6) escolhe as quests e o vilão de um mundo novo; esta peça
   fá-los andar no fim de cada turno, no App, no replay e no servidor pelo
   mesmo caminho — e diz ao Narrador o passo de agora e a mão dele, pela
   pauta, no lugar da batida e da marca do relógio.
   §1 as tabelas: o que o motor aplica, os tetos das linhas novas, o peso
      da quest no arco;
   §2 A CAMPANHA ANTIGA, BYTE A BYTE: sem esqueleto nada muda — a peça, a
      pauta, a espinha, o progresso do ato, o conferente, o replay;
   §3 UMA CAMPANHA NOVA DE PONTA A PONTA: o ato 1 abre a quest, os factos
      fecham as etapas, o vilão reage (aprende o nome, a camada sobe), a
      quest concluída fecha o ato, e o ato sem quest vive dos marcos;
   §4 as escolhas: o veredito antes do clique, o preço que sai, a recusa;
   §5 o Diário: a projeção, a etapa `quest`, a porta do Mestre fechada;
   §6 o replay igual ao turno;
   §7 o teto: a pauta de um mundo novo cabe nos 1400, e as linhas novas
      cabem nas antigas (220 e 160), em duzentos mundos;
   §8 nenhuma camada que vaza: nem o nome antes do rosto, nem o plano antes
      da guerra, nem o nome do servo antes de o herói o ver;
   §9 o lixo, a imutabilidade e o determinismo;
   §10 os oito pedidos do desenho (mente/formas.md «## BQ · as quests na
      tela», §BQ 9): a gravidade de cada carta, o «como foi», os caminhos de
      um «ou», o cartaz da sombra sem camada que vaze, a gente que o herói
      conheceu, a reviravolta lida, o género do {quem}, a frase que é carta. */
import fs from "node:fs";
import { QUESTS_DO_TURNO, garantirQuestsDaEspinha, oTurnoDasQuests, aMesaDasQuests, missoesDasQuests, escolhasDasQuests, escolherNaQuestDoEstado, oVilaoDasQuests, verAsReviravoltas, aEscolhaDaFrase, PORTAO_DA_ABERTURA } from "../src/motor/quests-do-turno.js";
import { esqueletoDaCampanha, comOEsqueleto, questsDoAto, ESQUELETO } from "../src/esqueleto.js";
import { EFEITOS_DA_QUEST, MISSAO_DA_QUEST, missaoDaQuest, questPorId, abrirQuest, avancarQuest, estadoDaQuest, vereditoDaEscolha, validarQuest, GRAVIDADE_DA_ESCOLHA, BIBLIOTECA_DE_QUESTS, PRESSUPOSTOS } from "../src/biblioteca-de-quests.js";
import { LINHA_DO_VILAO, CAMPOS_DA_CAMADA, fichaDoVilao, PLANOS_DO_ARQUETIPO, DIARIO_DO_VILAO, oVilaoNoDiario } from "../src/plano-do-vilao.js";
import { PESO_DA_QUEST, marcoDaQuest, garantirHistoria, temAntagonista, ESTRUTURAS, estruturaPorId, custoDaEtapa } from "../src/historia.js";
import { gerarGeografia, rngDe } from "../src/geografia.js";
import { estenderEspinha, garantirEspinha, progressoDoAto, conferirEspinha } from "../src/saga.js";
import { nucleoDaCampanha } from "../src/nucleo.js";
import { chefesDoMundo } from "../src/mundo-base.js";
import { garantirFactos } from "../src/livro-de-factos.js";
import { caidosParaOLivro } from "../src/motor/luta-do-turno.js";
import { anotarOLivro } from "../src/motor/livro-do-turno.js";
import { PASSOS_DO_REPLAY, correrOTurno, DONO_DO_CAMPO } from "../src/sessao.js";
import { aPautaDoTurno } from "../src/motor/pauta-do-turno.js";
import { textoDaPauta, TETO_DA_PAUTA } from "../src/pauta.js";
import { ETAPAS, etapaDef, tipoDaEtapa, garantirMissoes, rumoDaEtapa, textoDaEtapa } from "../src/missoes.js";
import { FASES } from "../src/vilao.js";

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);
const congelar = (x) => { if (x && typeof x === "object" && !Object.isFrozen(x)) { Object.freeze(x); Object.values(x).forEach(congelar); } return x; };
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

/* ---------------- um mundo novo, como a criação o faz ---------------- */
/* O CATÁLOGO DA PONTA A PONTA (lote 3 do acervo, 08/11). O §3 conta uma
   campanha inteira de um mundo só («BQ7|0»): o Salvo-Conduto no 1.º ato, o
   2.º sem quest (a degradação), as Cinzas no 3.º. Com o acervo a crescer,
   o 2.º ato passou a ter quest (o lote 3 trouxe duas para o passo 2) e o
   coração mudou — e a prova da PEÇA ficava refém do ACERVO. Esse mundo
   corre agora com as três quests da planta (como a degradação em
   teste-esqueleto.mjs); os mundos de cem e duzentos (§7, §8, o Diário)
   continuam com o catálogo vivo. */
const DA_PLANTA = BIBLIOTECA_DE_QUESTS.filter((q) => ["o_salvo_conduto", "as_cinzas_de_ontem", "a_carta_que_nao_se_abre"].includes(q.id));
function mundoNovo(semente, estrutura = "jornada", antecedente = "soldado", catalogo) {
  const mapa = gerarGeografia(semente, null, null);
  const espinha0 = estenderEspinha({ semente, mapa, estrutura, cidadeInicial: mapa.cidades[0].nome, antecedente, dia: 1 });
  const nucleo = nucleoDaCampanha(semente, mapa, { espinha: espinha0, antecedente, grupo: [] });
  const esq = esqueletoDaCampanha({ semente, mapa, espinha: espinha0, antecedente, nucleo, chefes: chefesDoMundo(semente, mapa), ...(catalogo ? { catalogo } : {}) });
  const espinha = comOEsqueleto(espinha0, esq);
  return {
    semente, mapa, espinha0, espinha, esq,
    estado: {
      espinha, historia: garantirHistoria({ estrutura, etapa: 0 }), mapa,
      cidadeAtual: mapa.cidades[0].nome, lugar: null, jornada: null,
      personagem: { nome: "Vera", grupo: [], inventario: [], moedas: 100 },
      npcs: {}, canone: {}, factos: garantirFactos(null), saber: [], dia: 1, npcTurno: 0,
    },
    mundo: { semente },
  };
}
/* um turno: o mundo muda (f), e o fim do turno corre a peça */
let nTurno = 1;
const turno = (W, E, f) => {
  const E1 = f ? f(E) : E;
  const r = oTurnoDasQuests(E1, { mundo: W.mundo });
  return { E: r ? { ...E1, ...r.estado } : E1, r };
};
const N = (nome, local) => ({ nome, conhecidoEm: 1, local, relacao: "neutro", status: "vivo", consultas: 0 });
const registar = (E, ...pessoas) => ({ ...E, npcs: { ...E.npcs, ...Object.fromEntries(pessoas.map((p) => [p.nome, N(p.nome, p.cidade || E.cidadeAtual)])) } });
const falar = (E, ...nomes) => ({ ...E, factos: anotarOLivro(E, { tipo: "factos", dia: E.dia, turno: (nTurno += 10), falouCom: nomes }).factos });
const lutar = (E, ...caidos) => ({ ...E, factos: anotarOLivro(E, { tipo: "factos", dia: E.dia, turno: (nTurno += 10), derrotados: caidosParaOLivro(caidos) }).factos });
const ir = (E, cidade, lugar) => { const E2 = { ...E, cidadeAtual: cidade, jornada: null, lugar: lugar || null }; return { ...E2, factos: anotarOLivro(E2, { lugar: lugar || null, dia: E2.dia, turno: (nTurno += 10) }).factos }; };
const comGrupo = (E, ...nomes) => ({ ...E, personagem: { ...E.personagem, grupo: nomes.map((nome) => ({ nome, vinculo: 30 })) } });
const naEstrada = (E, para) => ({ ...E, jornada: { para }, lugar: null });
const registoDe = (E, id) => garantirQuestsDaEspinha(E.espinha.quests).registos.find((r) => r.id === id) || null;

/* ---------------- uma campanha antiga: a espinha sem esqueleto ---------------- */
const VELHO = mundoNovo("BQ7|velho");
const ANTIGA = { ...VELHO.estado, espinha: VELHO.espinha0 };

sec("§1 as tabelas");
{
  const T = QUESTS_DO_TURNO;
  t("o que o motor aplica é tudo de EFEITOS_DA_QUEST", T.aplica.every((k) => EFEITOS_DA_QUEST[k]));
  t("e a morte NÃO está entre eles: é da tela, com o veredito", !T.aplica.includes("morte"));
  t("«O PASSO» tem o teto da planta (≤ 220, §7)", T.passo.teto <= 220);
  t("«A MÃO DELE AQUI» tem o teto da planta (≤ 160, §11.6)", LINHA_DO_VILAO.teto <= 160);
  t("vão ao Narrador no máximo três notas por turno, com teto", T.notas.max + T.notas.doVilao <= 3 && T.notas.teto > 0);
  t("a quest fecha o ato concluída ou falhada", J(PESO_DA_QUEST.fecham) === J(["concluida", "falhada"]) && PESO_DA_QUEST.minimo >= 1);
  const h = garantirHistoria({ estrutura: "jornada", etapa: 0 });
  const m = marcoDaQuest(h, "x");
  t("marcoDaQuest enche o ato até ao custo dele", m.historia.marcos === custoDaEtapa(estruturaPorId("jornada"), 0) && m.ganhou === m.historia.marcos);
  const m2 = marcoDaQuest({ ...h, marcos: 99 }, "x");
  t("e pesa o mínimo quando o ato já vinha cheio", m2.ganhou === PESO_DA_QUEST.minimo);
  t("o vilão do plano conta como antagonista para o arco; sem ele, a conta de sempre", temAntagonista({ vilao: true }) && !temAntagonista({}) && temAntagonista({ nemesis: "X" }));
}

sec("§2 a campanha antiga, byte a byte");
{
  const antes = J(ANTIGA);
  t("sem esqueleto, oTurnoDasQuests dá null", oTurnoDasQuests(ANTIGA, { mundo: VELHO.mundo }) === null);
  t("e a mesa das quests também", aMesaDasQuests(ANTIGA, { mundo: VELHO.mundo }) === null);
  t("e o Diário e as escolhas ficam vazios", J(missoesDasQuests(ANTIGA)) === "[]" && J(escolhasDasQuests(ANTIGA)) === "[]");
  t("e escolher não faz nada", escolherNaQuestDoEstado(ANTIGA, "o_salvo_conduto", "passo", "portagem") === null);
  t("e o estado antigo não foi tocado", J(ANTIGA) === antes);
  t("a espinha antiga sai de garantirEspinha sem `quests`", !("quests" in garantirEspinha(VELHO.espinha0)) && J(garantirEspinha(VELHO.espinha0)) === J(garantirEspinha(JSON.parse(J(VELHO.espinha0)))));
  const pa = progressoDoAto(VELHO.espinha0, 0);
  const ms = VELHO.espinha0.atos[0].marcos;
  t("o progresso do ato antigo é o dos marcos", pa.total === ms.length && pa.feitos === ms.filter((m) => m.feito).length);
  const ce = conferirEspinha(VELHO.espinha0, { dia: 1 }, () => true, { ato: 0 });
  t("o conferente antigo fecha os marcos de sempre", ce.cumpridos.length === ms.filter((m) => m.condicao).length && ce.cumpridos.length > 0);
  const passo = PASSOS_DO_REPLAY.find((p) => p.passo === "as quests");
  t("o passo do replay devolve o MESMO estado, sem esqueleto", !!passo && passo.faz(ANTIGA, {}, { mundo: null }, {}) === ANTIGA);
  t("e o replay diz quem escreve a espinha", typeof DONO_DO_CAMPO.espinha === "string" && /quests-do-turno/.test(DONO_DO_CAMPO.espinha));
  /* a pauta: a da campanha antiga não tem nenhuma das linhas novas (a
     igualdade byte a byte com o App está em teste-motor-pauta-do-turno) */
  const pt = textoDaPauta(aPautaDoTurno({ ...ANTIGA, render: { personagem: ANTIGA.personagem } }, { frase: "olho em volta", sorte: rngDe("p") }, {}).pauta);
  t("a pauta antiga não diz «O PASSO» nem «A MÃO DELE AQUI»", !/O PASSO:|A MÃO DELE AQUI/.test(pt));
}

sec("§3 uma campanha nova de ponta a ponta");
const W = mundoNovo("BQ7|0", "jornada", "soldado", DA_PLANTA);
let SC = null;
{
  t("o mundo de prova tem esqueleto, e o ato 1 tem o Salvo-Conduto", !!W.esq && W.esq.atos[0].quest === "o_salvo_conduto", J(W.esq && W.esq.atos.map((a) => a.quest)));
  t("e o número de atos é o da estrutura (o arco e a espinha andam juntos)", W.esq.atos.length === estruturaPorId("jornada").etapas.length);
  let { E, r } = turno(W, W.estado);
  const ids0 = questsDoAto(W.esq, 0).map((q) => q.id);
  const Q0 = garantirQuestsDaEspinha(E.espinha.quests);
  t("no primeiro fim de turno, o ato 1 abre as suas quests (e só as dele)", J(Q0.registos.map((x) => x.id)) === J(ids0) && J(Q0.atos) === "[0]");
  t("e só a espinha mudou", J(Object.keys(r.estado)) === J(["espinha"]));
  SC = registoDe(E, "o_salvo_conduto");
  const P = SC.papeis;
  const tenente = P.tenente.nome, protegido = P.protegido.nome, guarda = P.guarda.nome;
  const destino = P.destino.cidade, origem = P.origem.cidade;
  const mesa0 = aMesaDasQuests(E, { mundo: W.mundo, cena: { presentes: [] } });
  t("a mesa: o ato tem quest, e «O PASSO» diz a etapa e o que falta", mesa0.comQuest && mesa0.passo.startsWith(QUESTS_DO_TURNO.passo.cabeca) && mesa0.passo.includes(protegido), mesa0.passo);
  t("«A MÃO DELE AQUI» chega, na cidade da quest, sem o nome dele", mesa0.mao.startsWith(LINHA_DO_VILAO.cabeca) && !mesa0.mao.includes(fichaDoVilao(E.espinha).nome), mesa0.mao);
  t("o nome do servo dele não chega antes de o herói o ver (a alcunha)", !J(mesa0).includes(tenente) && !J(missoesDasQuests(E, { mundo: W.mundo })).includes(tenente));
  t("e o veto do nome do herói está em NÃO PODE", mesa0.naoPode.some((v) => /meu nome/.test(v)));

  /* T1: ouvir quem pede (e o guarda, para o guarda não se vender) */
  ({ E, r } = turno(W, E, (e) => falar(registar(e, { nome: protegido, cidade: origem }, { nome: guarda, cidade: origem }), protegido, guarda)));
  t("ouvir quem pede fecha a 1.ª etapa, e o relato diz qual", !!registoDe(E, "o_salvo_conduto").feitas.aceitar && r.linhas.some((l) => l.startsWith("✓") && l.includes(protegido)), J(r.linhas));
  /* T2: à estrada, com quem se protege */
  ({ E, r } = turno(W, E, (e) => naEstrada(comGrupo(e, protegido), destino)));
  t("na estrada com quem se protege: a 2.ª", !!registoDe(E, "o_salvo_conduto").feitas.estrada);
  const camadas = [garantirQuestsDaEspinha(E.espinha.quests) && E.espinha.fio.vilao.camada];
  /* T3: o servo aparece, cai e é poupado */
  ({ E, r } = turno(W, E, (e) => lutar(registar(e, { nome: tenente }), { nome: tenente, rendido: true })));
  const sc3 = registoDe(E, "o_salvo_conduto");
  t("poupar o servo fecha o passo pelo ramo violento, variante «poupou»", sc3.feitas.passo && sc3.feitas.passo.ramo === "violenta" && sc3.feitas.passo.variante === "poupou", J(sc3.feitas));
  t("o laço de dívida nasce no registo da gente (o motor aplica-o)", E.npcs[tenente].laco && E.npcs[tenente].laco.tipo === "divida");
  /* MOVIDA na TE2 (09/11): o efeito «deixa» saiu (escrevia uma premissa que
     nenhuma peça lia); o que o servo poupado deve ao herói vive no laço, acima */
  t("nenhuma premissa nova entra na espinha (o efeito «deixa» saiu na TE2)", garantirQuestsDaEspinha(E.espinha.quests).premissas.length === 0);
  t("o vilão reage: o servo poupado volta a dever, e ele aprende o nome do herói", !!E.espinha.fio.vilao.nomeDoHeroi && E.espinha.fio.vilao.balancas.length === 1 && E.saber.some((l) => l.sobre === "nome"));
  t("e o que ele fez longe vai ao Narrador como facto", r.notas.some((n) => n.startsWith(QUESTS_DO_TURNO.notas.longe)), J(r.notas));
  t("a variante da solução vai ao Narrador como o que aconteceu", r.notas.some((n) => n.startsWith(QUESTS_DO_TURNO.notas.aconteceu)));
  camadas.push(E.espinha.fio.vilao.camada);
  const mesa3 = aMesaDasQuests(E, { mundo: W.mundo, cena: { presentes: [] } });
  t("ele já sabe o nome: o veto do nome sai", !mesa3.naoPode.some((v) => /meu nome/.test(v)), J(mesa3.naoPode));
  /* T4: em Foz, com quem se protege → concluída, e o ato vira */
  const h0 = E.historia;
  ({ E, r } = turno(W, E, (e) => ({ ...ir(e, destino, null), dia: e.dia + 2 })));
  camadas.push(E.espinha.fio.vilao.camada);
  const sc4 = registoDe(E, "o_salvo_conduto");
  t("em destino com quem se protege: concluída", sc4.estado === "concluida", sc4.estado);
  t("o fecho: quem se protegeu fica aliado e a dever (o motor aplica)", E.npcs[protegido].relacao === "aliado" && E.npcs[protegido].laco && E.npcs[protegido].laco.tipo === "divida");
  t("A QUEST CONCLUÍDA FECHA O ATO: o arco vira do 1.º para o 2.º", h0.etapa === 0 && E.historia.etapa === 1, J(E.historia));
  t("com o envelope da virada ao Narrador, e o pedido de remontar o prompt", r.notas.some((n) => /A HISTÓRIA VIROU/.test(n)) && r.efeitos.some((x) => x.tipo === "remontarPrompt"));
  t("e o relato diz que foi cumprida", r.linhas.some((l) => l.startsWith("★") && l.includes("O Salvo-Conduto")));
  t("as notas do turno da virada cabem no número e no teto delas", r.notas.length <= QUESTS_DO_TURNO.notas.max + QUESTS_DO_TURNO.notas.doVilao && r.notas.filter((n) => !/A HISTÓRIA VIROU/.test(n)).every((n) => n.length <= QUESTS_DO_TURNO.notas.teto + 120), J(r.notas.map((n) => n.length)));
  t("a camada dele sobe pelo facto, uma por turno (rumor → marca → mão)", J(camadas) === J(["rumor", "marca", "mao"]), J(camadas));
  t("o progresso do ato com quest é a quest: 1 de 1", J(progressoDoAto(E.espinha, 0)) === J({ feitos: 1, total: 1 }));
  t("e os marcos antigos do ato com quest não fecham nem pesam", conferirEspinha(E.espinha, { dia: 9 }, () => true, { ato: 5 }).cumpridos.every((m) => !E.espinha.atos[0].marcos.includes(m)) && conferirEspinha(E.espinha, { dia: 9 }, () => true, {}).cumpridos.length > 0);
  const ato2 = W.esq.atos[1];
  t("o 2.º ato não tem quest no catálogo de hoje: vive dos marcos (a degradação)", ato2.quest === null && progressoDoAto(E.espinha, 1).total === E.espinha.atos[1].marcos.length && aMesaDasQuests(E, { mundo: W.mundo }).comQuest === false);
  t("e a quest de um ato antigo não volta a abrir", J(garantirQuestsDaEspinha(E.espinha.quests).atos) === "[0,1]" && garantirQuestsDaEspinha(E.espinha.quests).registos.filter((x) => x.id === "o_salvo_conduto").length === 1);
  /* chamar duas vezes não aplica nada duas vezes */
  const de = oTurnoDasQuests(E, { mundo: W.mundo });
  t("o mesmo estado outra vez: nada muda, nada se repete", J(de.estado) === "{}" && de.efeitos.length === 0 && de.linhas.length === 0 && de.notas.length === 0, J(de));
  /* o 3.º ato (as Cinzas): o arco chega lá e a quest abre */
  const E3 = { ...E, historia: { ...E.historia, etapa: 2, marcos: 0 } };
  const r3 = oTurnoDasQuests(E3, { mundo: W.mundo });
  t("quando o arco chega ao 3.º ato, a quest dele abre", garantirQuestsDaEspinha(r3.estado.espinha.quests).registos.some((x) => x.id === W.esq.atos[2].quest));
}

sec("§4 as escolhas: o veredito antes do clique");
{
  let { E } = turno(W, W.estado);
  const P = registoDe(E, "o_salvo_conduto").papeis;
  ({ E } = turno(W, E, (e) => falar(registar(e, { nome: P.protegido.nome, cidade: P.origem.cidade }, { nome: P.guarda.nome, cidade: P.origem.cidade }), P.protegido.nome, P.guarda.nome)));
  ({ E } = turno(W, E, (e) => naEstrada(comGrupo(e, P.protegido.nome), P.destino.cidade)));
  const ab = escolhasDasQuests(E, { mundo: W.mundo });
  const portagem = ab.find((x) => x.quest === "o_salvo_conduto" && x.chave === "passo");
  t("no passo, a escolha da portagem está aberta, com os dois lados e o preço", !!portagem && portagem.opcoes[0].custo === 40 && portagem.opcoes[0].podeEscolher && portagem.opcoes[0].ganha.length > 10 && portagem.opcoes[0].custa.length > 10, J(ab));
  t("e o veredito não diz o nome do servo que o herói não viu", !J(ab).includes(P.tenente.nome));
  const antes = J(E);
  const r = escolherNaQuestDoEstado(E, "o_salvo_conduto", "passo", "portagem", { mundo: W.mundo });
  t("escolher: o preço sai da bolsa já no clique", r && r.estado.personagem && r.estado.personagem.moedas === 60, J(r && r.estado.personagem));
  t("o vilão fica a saber por onde o herói anda (o livro dele)", r.estado.saber && r.estado.saber.some((l) => l.sobre === "onde" && l.fonte === "marca"));
  t("e a quest avança pelo ramo social", registoDe({ espinha: r.estado.espinha }, "o_salvo_conduto").feitas.passo.ramo === "social");
  t("o estado recebido não foi tocado", J(E) === antes);
  const E2 = { ...E, ...r.estado };
  t("a escolha feita não se refaz", escolherNaQuestDoEstado(E2, "o_salvo_conduto", "passo", "portagem", { mundo: W.mundo }) === null);
  const pobre = { ...E, personagem: { ...E.personagem, moedas: 10 } };
  t("sem dinheiro para o preço, o veredito diz que não, e o clique é recusado", escolhasDasQuests(pobre, { mundo: W.mundo }).find((x) => x.chave === "passo").opcoes[0].podeEscolher === false && escolherNaQuestDoEstado(pobre, "o_salvo_conduto", "passo", "portagem", { mundo: W.mundo }) === null);
  t("a opção que não existe é recusada", escolherNaQuestDoEstado(E, "o_salvo_conduto", "passo", "fugir", { mundo: W.mundo }) === null);
}

sec("§5 o Diário: a projeção");
{
  const { E } = turno(W, W.estado);
  const ms = missoesDasQuests(E, { mundo: W.mundo });
  const m = ms.find((x) => x.id === MISSAO_DA_QUEST.prefixo + "o_salvo_conduto");
  t("a quest do tipo 1 aparece como a principal, ativa", !!m && m.tipo === "principal" && m.status === "ativa");
  t("o tipo 2 escondido não aparece (a história do coração aparece quando começa)", !ms.some((x) => x.id.endsWith(W.esq.coracao[0].quest)) || missaoDaQuest(W.esq.coracao[0].quest, registoDe(E, W.esq.coracao[0].quest), { estado: E }) !== null);
  t("as etapas são do tipo `quest`, com a frase e a chave", m.etapas.length === 4 && m.etapas.every((e) => e.tipo === "quest" && e.alvo && e.chave.startsWith("o_salvo_conduto:")));
  t("a de agora leva o «o que falta», e é o próximo passo", m.etapas[0].rotulo && rumoDaEtapa(m.etapas[0]).toLowerCase() === m.etapas[0].rotulo.toLowerCase());
  const g = garantirMissoes(ms);
  t("e atravessa a catraca do Diário (garantirMissoes) com a forma inteira", g[0].etapas.every((e) => e.tipo === "quest" && e.alvo && e.chave) && textoDaEtapa(g[0].etapas[0]) === m.etapas[0].alvo);
  t("a etapa `quest` lê o registo pela chave", etapaDef("quest").ver({ chave: "o_salvo_conduto:aceitar" }, { espinha: { quests: { registos: [{ id: "o_salvo_conduto", feitas: { aceitar: { dia: 1 } } }] } } }) === true && etapaDef("quest").ver({ chave: "o_salvo_conduto:aceitar" }, { espinha: E.espinha }) === false && etapaDef("quest").ver({ chave: "lixo" }, {}) === false);
  t("a porta do Mestre não dá a etapa `quest` (o estrito)", tipoDaEtapa({ tipo: "quest" }, { estrito: true }) === "" && tipoDaEtapa({ tipo: "quest" }) === "quest");
  t("ETAPAS.quest é só da quest", ETAPAS.quest.soDaQuest === true);
}

sec("§6 o replay igual ao turno");
{
  const E = W.estado;
  const passo = PASSOS_DO_REPLAY.find((p) => p.passo === "as quests");
  t("o passo «as quests» é o último do replay (depois do Cronista)", PASSOS_DO_REPLAY[PASSOS_DO_REPLAY.length - 1] === passo && /quests-do-turno/.test(passo.de));
  const nota = { tela: { linhas: [] } };
  const pelo = passo.faz(E, {}, { mundo: W.mundo }, nota);
  const r = oTurnoDasQuests(E, { mundo: W.mundo });
  t("o replay escreve o mesmo estado que o turno", J({ ...E, ...r.estado }) === J(pelo));
  t("e o relato e os efeitos da tela ficam na nota, não no save", J(nota.tela.linhas) === J(r.linhas) && (r.efeitos.length ? J(nota.efeitosDasQuests) === J(r.efeitos) : !nota.efeitosDasQuests));
  /* o turno inteiro do replay, sobre um mundo novo: a peça corre no fim */
  const linha = { n: 1, entrada: { frase: "olho em volta" }, sorte: { ponto: "1|480|0" }, pedido: { pauta: "" }, narrador: { narrativa: "A praça está calma.", mudancas: {} }, cronista: null, juiz: null, estado: {} };
  const c = correrOTurno(E, linha, { semente: W.semente, mundo: W.mundo });
  t("correrOTurno num mundo novo: a peça corre sem calar e abre as quests do ato", !c.calou.some((x) => x.passo === "as quests") && garantirQuestsDaEspinha(c.estado.espinha.quests).registos.length >= 1, J(c.calou));
  const c2 = correrOTurno(E, linha, { semente: W.semente, mundo: W.mundo });
  t("e o mesmo turno corrido duas vezes dá o mesmo estado", J(c.estado) === J(c2.estado));
}

sec("§7 o teto: a pauta e as linhas novas");
{
  const ESP = ESTRUTURAS.filter((e) => e.espinha).map((e) => e.id);
  let maxPasso = 0, maxMao = 0, maxPauta = 0, mundos = 0, comPasso = 0, comMao = 0, maxNota = 0;
  let passoNaPauta = 0, maoNaPauta = 0, momentoNovo = 0, momentoVelho = 0, pautas = 0, antigasAoLado = 0;
  for (let i = 0; i < 200; i++) {
    const w = mundoNovo(`BQ7|teto|${i}`, ESP[i % ESP.length], ["", "soldado", "orfao", "erudito"][i % 4]);
    if (!w.esq) continue;
    mundos++;
    const { E, r } = turno(w, w.estado);
    for (const n of r.notas) maxNota = Math.max(maxNota, n.length);
    /* o pior caso da linha: o herói na cidade da quest, com todos os servos dele à vista */
    const presentes = fichaDoVilao(E.espinha).tenentes.map((x) => x.nome);
    for (const camada of FASES.map((f) => f.id)) {
      const Ec = { ...E, espinha: { ...E.espinha, fio: { ...E.espinha.fio, vilao: { ...E.espinha.fio.vilao, camada } } } };
      const m = aMesaDasQuests(Ec, { mundo: w.mundo, cena: { presentes } });
      if (!m) continue;
      if (m.passo) { comPasso++; maxPasso = Math.max(maxPasso, m.passo.length); }
      if (m.mao) { comMao++; maxMao = Math.max(maxMao, m.mao.length); }
    }
    if (i < 40) {
      const p = aPautaDoTurno({ ...E, render: { personagem: E.personagem } }, { frase: "pergunto pelo caminho", sorte: rngDe(`p${i}`) }, {}).pauta;
      const pt = textoDaPauta(p);
      maxPauta = Math.max(maxPauta, pt.length);
      if (/O PASSO:/.test(pt)) passoNaPauta++;
      if (/A MÃO DELE AQUI/.test(pt)) maoNaPauta++;
      /* o momento novo contra o antigo, no MESMO mundo: a espinha sem o esqueleto */
      const pv = aPautaDoTurno({ ...E, espinha: w.espinha0, render: { personagem: E.personagem } }, { frase: "pergunto pelo caminho", sorte: rngDe(`p${i}`) }, {}).pauta;
      const tam = (x) => (x.momento || []).join(" ").length;
      momentoNovo = Math.max(momentoNovo, tam(p));
      momentoVelho = Math.max(momentoVelho, tam(pv));
      antigasAoLado += (p.momento || []).filter((l) => (pv.momento || []).includes(l)).length;
      pautas++;
    }
  }
  console.log(`      ${mundos} mundos · «O PASSO» em ${comPasso} (máx. ${maxPasso}) · «A MÃO» em ${comMao} (máx. ${maxMao}) · pauta máx. ${maxPauta} · nota máx. ${maxNota}`);
  console.log(`      em ${pautas} pautas: «O PASSO» chega ao texto em ${passoNaPauta}, «A MÃO» em ${maoNaPauta}; o MOMENTO mais longo: ${momentoNovo} (novo) contra ${momentoVelho} (a batida e a marca, no mesmo mundo)`);
  t("as linhas novas chegam ao texto da pauta (a prioridade da frente do MOMENTO)", passoNaPauta === pautas && maoNaPauta > 0);
  t("e o MOMENTO de um mundo novo nunca é maior do que o da batida que substitui", momentoNovo <= momentoVelho);
  t("«O PASSO» nunca passa dos 220", comPasso > 0 && maxPasso <= QUESTS_DO_TURNO.passo.teto && maxPasso <= 220);
  t("«A MÃO DELE AQUI» nunca passa dos 160", comMao > 0 && maxMao <= LINHA_DO_VILAO.teto && maxMao <= 160);
  t("a pauta de um mundo novo cabe no teto de sempre (1400)", maxPauta > 0 && maxPauta <= TETO_DA_PAUTA && TETO_DA_PAUTA === 1400);
  t("cada nota ao Narrador tem teto (a cabeça mais o texto cortado)", maxNota <= QUESTS_DO_TURNO.notas.teto + 120);
  /* nenhum bloco estático: a peça não entra no prompt fixo */
  const prompt = fs.readFileSync("../src/prompt.js", "utf8");
  t("o prompt fixo (prompt.js) não importa nada das quests: o teto de ~82k não se mexe", !/quests-do-turno|biblioteca-de-quests|plano-do-vilao|esqueleto\.js/.test(prompt));
  /* NO LUGAR, nunca ao lado — provado pela chamada ao motor, não pelo texto dele (teste-assercoes-de-texto):
     nenhuma linha do MOMENTO antigo (a batida da espinha e a marca do relógio do fio) sobrevive no novo */
  t("as linhas novas entram pela pauta NO LUGAR da batida e da marca (nenhuma linha antiga fica ao lado)", pautas > 0 && antigasAoLado === 0, String(antigasAoLado));
}

sec("§8 nenhuma camada que vaza");
{
  const ORD = Object.fromEntries(FASES.map((f) => [f.id, f.ordem]));
  let vazou = [], vistos = 0, nomeAntes = 0;
  for (let i = 0; i < 60; i++) {
    const w = mundoNovo(`BQ7|camada|${i}`, ["jornada", "misterio", "reinado", "arquipelago"][i % 4]);
    if (!w.esq) continue;
    const { E } = turno(w, w.estado);
    const f = fichaDoVilao(E.espinha);
    const presentes = f.tenentes.map((x) => x.nome);
    for (const camada of FASES.map((x) => x.id)) {
      const Ec = { ...E, espinha: { ...E.espinha, fio: { ...E.espinha.fio, vilao: { ...E.espinha.fio.vilao, camada } } } };
      const m = aMesaDasQuests(Ec, { mundo: w.mundo, cena: { presentes } });
      if (!m || !m.mao) continue;
      vistos++;
      const pode = (campo) => ORD[CAMPOS_DA_CAMADA[campo]] <= ORD[camada];
      if (!pode("nome") && f.nome && m.mao.includes(f.nome)) vazou.push(`${i}/${camada}: o nome`);
      if (!pode("plano") && f.plano.some((p) => m.mao.includes(p.diz))) vazou.push(`${i}/${camada}: o plano`);
      if (!pode("quer") && m.mao.includes(f.quer)) vazou.push(`${i}/${camada}: o que quer`);
    }
    /* o servo que o herói não viu: nem na pauta, nem no Diário */
    const sc = garantirQuestsDaEspinha(E.espinha.quests).registos.find((r) => r.tipo === 1);
    const F = sc && questPorId(sc.id);
    if (F && F.mao && F.mao.papel && sc.papeis[F.mao.papel] && sc.papeis[F.mao.papel].nome) {
      const nome = sc.papeis[F.mao.papel].nome;
      const passo = (aMesaDasQuests(E, { mundo: w.mundo }) || {}).passo || "";
      if (passo.includes(nome) || J(missoesDasQuests(E, { mundo: w.mundo })).includes(nome)) nomeAntes++;
    }
  }
  t(`em ${vistos} linhas, nenhuma camada vaza a seguinte (o nome, o plano, o que quer)`, vistos > 0 && vazou.length === 0, vazou.slice(0, 5).join(" · "));
  t("o nome do servo da mão nunca chega antes de o herói o ver (pauta e Diário)", nomeAntes === 0, String(nomeAntes));
}

sec("§9 o lixo, a imutabilidade e o determinismo");
{
  const lixos = [null, undefined, 3, "x", [], {}, { espinha: null }, { espinha: { esqueleto: 7 } }, { espinha: { esqueleto: { atos: "x" } } }];
  t("lixo não lança e dá o vazio", lixos.every((x) => { try { return oTurnoDasQuests(x) === null && aMesaDasQuests(x) === null && J(missoesDasQuests(x)) === "[]" && J(escolhasDasQuests(x)) === "[]" && escolherNaQuestDoEstado(x, "a", "b", "c") === null; } catch { return false; } }));
  t("a catraca do campo novo: lixo dá a forma vazia", J(garantirQuestsDaEspinha(null)) === J(garantirQuestsDaEspinha({ registos: [{ id: "nao_existe" }, 3, null], atos: ["x", -1], fora: [1] })) && garantirQuestsDaEspinha(7).registos.length === 0);
  const torto = { ...W.estado, espinha: { ...W.espinha, quests: { registos: "x", aplicadas: 9, atos: { a: 1 } } }, factos: 7, npcs: null, personagem: "x", dia: "hoje", historia: null };
  t("um estado de lixo num mundo novo não lança", (() => { try { const r = oTurnoDasQuests(torto, { mundo: W.mundo }); aMesaDasQuests(torto, { mundo: W.mundo }); missoesDasQuests(torto); return r === null || typeof r === "object"; } catch { return false; } })());
  const gelado = congelar(JSON.parse(J(W.estado)));
  t("o estado congelado não é mutado (e a peça corre sobre ele)", (() => { try { const r = oTurnoDasQuests(gelado, { mundo: W.mundo }); aMesaDasQuests(gelado, { mundo: W.mundo }); missoesDasQuests(gelado, { mundo: W.mundo }); escolhasDasQuests(gelado, { mundo: W.mundo }); return !!r && !!r.estado.espinha; } catch (e) { return false; } })());
  const a = oTurnoDasQuests(W.estado, { mundo: W.mundo }), b = oTurnoDasQuests(JSON.parse(J(W.estado)), { mundo: W.mundo });
  t("determinístico: o mesmo estado dá o mesmo turno", J(a) === J(b));
  t("e a mesma pauta", J(aMesaDasQuests(W.estado, { mundo: W.mundo })) === J(aMesaDasQuests(JSON.parse(J(W.estado)), { mundo: W.mundo })));
}

sec("§10 os pedidos do desenho (formas.md «## BQ · as quests na tela», §BQ 9)");
{
  /* um mundo pequeno, à mão (a régua de teste-biblioteca-de-quests) */
  const CID = "Alto do Sal", FOZ = "Foz do Meio";
  const NP = (nome, genero = "") => ({ nome, conhecidoEm: 1, local: CID, relacao: "neutro", status: "vivo", consultas: 0, ...(genero ? { genero } : {}) });
  const base = (extra) => ({ npcs: { Lia: NP("Lia", "mulher"), Brás: NP("Brás", "homem"), Teodoro: NP("Teodoro", "homem"), Delfina: NP("Delfina", "mulher") }, cidadeAtual: CID, lugar: { nome: "Praça", cidade: CID },
    personagem: { nome: "Vera", grupo: [], inventario: [], moedas: 100 }, dia: 1, npcTurno: 0, factos: garantirFactos(null), baseMundo: null, ...(extra || {}) });
  const PSC = { protegido: { nome: "Lia" }, origem: { cidade: CID }, destino: { cidade: FOZ }, passo: { nome: "Vau Negro", cidade: CID }, desvio: { nome: "Trilho do Vau", cidade: CID }, tenente: { nome: "Brás" }, guarda: { nome: "Teodoro" } };

  /* 1. o veredito por opção */
  const E0 = base();
  const R0 = abrirQuest("o_salvo_conduto", { estado: E0, papeis: PSC });
  const noPasso = { ...R0, feitas: { aceitar: { dia: 1 }, estrada: { dia: 1 } } };
  const vp = vereditoDaEscolha("o_salvo_conduto", noPasso, "passo", { estado: E0 });
  t("1 · a portagem: gravidade «preco», não fecha, sem risco, e o contexto é a etapa", vp && vp.opcoes[0].gravidade === "preco" && vp.opcoes[0].fecha === null && vp.opcoes[0].risco === null && vp.contexto === "Passar Vau Negro", J(vp && { c: vp.contexto, o: vp.opcoes[0] }));
  const comVerdade = { ...noPasso, feitas: { ...noPasso.feitas, passo: { dia: 1, ramo: "social", variante: null } }, reviravoltas: [{ id: "o_protegido_mente", dia: 1 }] };
  const vv = vereditoDaEscolha("o_salvo_conduto", comVerdade, "verdade", { estado: E0 });
  const ent = vv && vv.opcoes.find((o) => o.id === "entregar"), lev = vv && vv.opcoes.find((o) => o.id === "levar");
  t("1 · entregar quem se protege FECHA a quest (falhada): gravidade «fecha»; levar é «leve»", ent && ent.gravidade === "fecha" && ent.fecha === "falhada" && lev.gravidade === "leve" && lev.fecha === null, J(vv && vv.opcoes.map((o) => [o.id, o.gravidade, o.fecha])));
  t("1 · e o contexto é a primeira frase da reviravolta que abriu a escolha", vv && /^Na terceira noite, Lia fala a dormir/.test(vv.contexto) && vv.contexto.length <= GRAVIDADE_DA_ESCOLHA.contexto + 1, vv && vv.contexto);
  const PCA = { quem: { nome: "Brash" }, ferido: { nome: "Delfina" }, carta: { nome: "a carta lacrada" } };
  const comBrash = (genero) => base({ personagem: { nome: "Vera", grupo: [{ nome: "Brash", vinculo: 40, ...(genero ? { genero_pessoa: genero } : {}) }], inventario: [], moedas: 100 }, npcs: { ...base().npcs, Brash: NP("Brash", genero) } });
  const Ec = comBrash("homem");
  const Rc = abrirQuest("a_carta_que_nao_se_abre", { estado: Ec, papeis: PCA });
  const naFrente = { ...Rc, acesas: { sinal: 1 }, feitas: { sinal: { dia: 1 }, carta: { dia: 1, ramo: "queimar", variante: null }, nome: { dia: 1 } }, escolhas: { carta: { opcao: "queimar", dia: 1 } } };
  const vf = vereditoDaEscolha("a_carta_que_nao_se_abre", naFrente, "frente", { estado: Ec });
  const deixar = vf && vf.opcoes.find((o) => o.id === "deixar"), pagar = vf && vf.opcoes.find((o) => o.id === "pagar");
  t("1 · deixá-los acertar contas: gravidade «vida», o risco diz quem (e com a carta queimada, é certo)", deixar && deixar.gravidade === "vida" && deixar.risco && deixar.risco.papel === "quem" && deixar.risco.quem === "Brash" && deixar.risco.certo === true, J(deixar));
  t("1 · pagar a dívida é «preco» (a vida pesa mais do que a bolsa, e só onde está)", pagar && pagar.gravidade === "preco" && pagar.risco === null);
  t("1 · a ordem da gravidade é a do desenho", J(GRAVIDADE_DA_ESCOLHA.ordem) === J(["vida", "fecha", "preco", "leve"]));

  /* 2 e 3: o «como foi» e os caminhos de um «ou» */
  const vPasso = estadoDaQuest("o_salvo_conduto", noPasso, { estado: E0 });
  const ou = vPasso.falta.find((f) => f.predicado === "algum");
  t("3 · o «o que falta» de um «ou» traz os caminhos, e diz qual é carta", ou && ou.caminhos.length === 3 && ou.caminhos.filter((c) => c.carta).length === 1 && ou.caminhos.every((c) => c.texto && Array.isArray(c.predicados)), J(ou && ou.caminhos));
  const Ef = { ...E0, lugar: { nome: "Trilho do Vau", cidade: CID }, personagem: { ...E0.personagem, grupo: [{ nome: "Lia" }] }, jornada: null };
  const pelo = estadoDaQuest("o_salvo_conduto", noPasso, { estado: { ...Ef, factos: anotarOLivro(Ef, { lugar: Ef.lugar, dia: 1, turno: 900 }).factos } });
  const fp = pelo.feitas.find((f) => f.id === "passo");
  t("2 · a etapa fechada por um ramo diz como foi, na primeira frase da solução", fp && fp.ramo === "furtiva" && fp.como === "O desvio custou um dia de lama e de silêncio, e Lia não largou o teu braço uma única vez.", fp && fp.como);
  t("2 · e a etapa sem ramos não inventa um «como»", pelo.feitas.find((f) => f.id === "aceitar").como === "");

  /* 5. a gente desta história */
  const Eg = { ...E0, factos: anotarOLivro(E0, { tipo: "factos", dia: 1, turno: 950, falouCom: ["Lia", "Teodoro"] }).factos };
  const vg = estadoDaQuest("o_salvo_conduto", R0, { estado: Eg });
  t("5 · a gente: só quem o herói conheceu, com o rótulo em frase de mundo (e o género)", J(vg.gente.map((g) => [g.papel, g.nome, g.rotulo, g.traiu])) === J([["protegido", "Lia", "A protegida", false], ["guarda", "Teodoro", "Quem anda mais perto de Lia", false]]), J(vg.gente));
  t("5 · o servo que o herói não viu não está lá", !vg.gente.some((g) => g.papel === "tenente"));
  const vendido = { ...R0, feitas: { aceitar: { dia: 1 }, estrada: { dia: 1 } }, reviravoltas: [{ id: "o_guarda_vendido", dia: 1 }], papeis: { ...R0.papeis, tenente: { ...R0.papeis.guarda } } };
  const vt = estadoDaQuest("o_salvo_conduto", vendido, { estado: Eg });
  t("5 · a troca de papel: quem se vendeu aparece uma vez, com «traiu»", vt.gente.filter((g) => g.nome === "Teodoro").length === 1 && vt.gente.find((g) => g.nome === "Teodoro").traiu === true, J(vt.gente));
  t("5 · o rótulo é campo opcional, e a ficha valida-o (todas as do catálogo têm-no em quem é gente)", BIBLIOTECA_DE_QUESTS.every((q) => validarQuest(q).ok) && BIBLIOTECA_DE_QUESTS.every((q) => Object.values(q.papeis).every((p) => !["elenco", "fio", "grupo"].includes(p.de) || typeof p.rotulo === "string")));

  /* 6. a reviravolta lida */
  const W6 = mundoNovo("BQ7|0", "jornada", "soldado", DA_PLANTA);
  let { E: E6 } = turno(W6, W6.estado);
  const Q6 = garantirQuestsDaEspinha(E6.espinha.quests);
  const comRv = Q6.registos.map((r) => (r.id === "o_salvo_conduto" ? { ...r, reviravoltas: [{ id: "o_guarda_vendido", dia: 1 }] } : r));
  E6 = { ...E6, espinha: { ...E6.espinha, quests: { ...Q6, registos: comRv } } };
  const lida = (E) => estadoDaQuest("o_salvo_conduto", garantirQuestsDaEspinha(E.espinha.quests).registos.find((r) => r.id === "o_salvo_conduto"), { estado: E }).reviravolta.lida;
  t("6 · a reviravolta nova está por ler", lida(E6) === false);
  const vr = verAsReviravoltas(E6);
  const E6b = { ...E6, ...vr };
  t("6 · abrir o Diário marca-a lida (vistaEm, campo aditivo no registo)", !!vr && lida(E6b) === true && J(garantirQuestsDaEspinha(E6b.espinha.quests).registos.find((r) => r.id === "o_salvo_conduto").vistaEm) === J({ dia: 1, n: 1 }));
  t("6 · e o campo atravessa o turno (avancarQuest guarda-o); sem nada por ler, nada muda", verAsReviravoltas(E6b) === null && !!garantirQuestsDaEspinha(oTurnoDasQuests(E6b, { mundo: W6.mundo }).estado.espinha ? oTurnoDasQuests(E6b, { mundo: W6.mundo }).estado.espinha.quests : E6b.espinha.quests).registos.find((r) => r.id === "o_salvo_conduto").vistaEm);
  t("6 · a versão antiga do registo (sem vistaEm) não o ganha por avançar", !("vistaEm" in avancarQuest("o_salvo_conduto", R0, { estado: E0 })));

  /* 7. a concordância */
  const vh = vereditoDaEscolha("a_carta_que_nao_se_abre", { ...Rc, acesas: { sinal: 1 }, feitas: { sinal: { dia: 1 } } }, "carta", { estado: Ec });
  const Em = comBrash("mulher");
  const Rm = abrirQuest("a_carta_que_nao_se_abre", { estado: Em, papeis: PCA });
  const vm = vereditoDaEscolha("a_carta_que_nao_se_abre", { ...Rm, acesas: { sinal: 1 }, feitas: { sinal: { dia: 1 } } }, "carta", { estado: Em });
  const Esem = comBrash("");
  const vs = vereditoDaEscolha("a_carta_que_nao_se_abre", { ...abrirQuest("a_carta_que_nao_se_abre", { estado: Esem, papeis: PCA }), acesas: { sinal: 1 }, feitas: { sinal: { dia: 1 } } }, "carta", { estado: Esem });
  const guardar = (v) => v && v.opcoes.find((o) => o.id === "guardar").custa;
  t("7 · «no bolso dele» com um companheiro, «dela» com uma companheira", /no bolso dele,/.test(guardar(vh)) && /no bolso dela,/.test(guardar(vm)), `${guardar(vh)} · ${guardar(vm)}`);
  t("7 · sem género sabido, a forma em que o acervo foi escrito, e nenhuma chaveta sobra", /no bolso dele,/.test(guardar(vs)) && !/[{}|]/.test(guardar(vs)));
  const torta = (txt) => validarQuest({ ...JSON.parse(J(questPorId("o_salvo_conduto"))), id: "torta", gancho: txt }).ok;
  t("7 · o validador aceita o género de gente e recusa o de um lugar ou de um papel que não existe", torta("{protegido} vai {protegido:sozinho|sozinha}.") && !torta("{origem:o|a} cidade.") && !torta("{ninguem:ele|ela}."));
  const acervo = J(BIBLIOTECA_DE_QUESTS);
  t("7 · os textos do acervo que diziam «dele» de alguém do papel passaram ao marcador", (acervo.match(/\{[a-z_]+:[^|{}]*\|[^{}]*\}/g) || []).length >= 7 && !/no bolso dele|o teu dinheiro e não o dele|da boca dele\./.test(acervo));

  /* 4. o vilão no Diário — e nenhuma camada vaza */
  const ORD = Object.fromEntries(FASES.map((f) => [f.id, f.ordem]));
  let vazou = [], vistas = 0, guerraComPlano = 0;
  for (let i = 0; i < 40; i++) {
    const w = mundoNovo(`BQ7|diario|${i}`, ["jornada", "misterio", "reinado", "arquipelago"][i % 4]);
    if (!w.esq) continue;
    const { E } = turno(w, w.estado);
    const f = fichaDoVilao(E.espinha);
    for (const camada of FASES.map((x) => x.id)) {
      const Ec2 = { ...E, espinha: { ...E.espinha, fio: { ...E.espinha.fio, vilao: { ...E.espinha.fio.vilao, camada } } } };
      const d = oVilaoDasQuests(Ec2, { mundo: w.mundo });
      if (!d) { vazou.push(`${i}/${camada}: null`); continue; }
      vistas++;
      const txt = J(d);
      const pode = (campo) => ORD[CAMPOS_DA_CAMADA[campo]] <= ORD[camada];
      if (!pode("nome") && (d.nome !== null || (f.nome && txt.includes(f.nome)))) vazou.push(`${i}/${camada}: o nome`);
      /* o título dele pode ser também o de um servo (chefesDoMundo dá títulos que se repetem: «Ogro o Colecionador» serve «o Colecionador») — aí o título vem no nome do servo, que a camada da mão já deixa dizer */
      const semServos = f.tenentes.reduce((acc, x) => acc.split(x.nome).join(""), txt);
      if (!pode("titulo") && f.titulo && semServos.includes(f.titulo)) vazou.push(`${i}/${camada}: o título`);
      if (!pode("quer") && txt.includes(f.quer)) vazou.push(`${i}/${camada}: o que quer`);
      if (!pode("plano") && (d.plano !== null || f.plano.some((p) => txt.includes(p.diz)))) vazou.push(`${i}/${camada}: o plano`);
      if (!pode("fraqueza") && f.fraqueza && txt.includes(f.fraqueza.o)) vazou.push(`${i}/${camada}: a fraqueza`);
      if (!pode("assinatura") && f.assinatura && txt.includes(f.assinatura)) vazou.push(`${i}/${camada}: a assinatura`);
      if (!d.linhas.length || !d.linhas[0].nova || d.linhas.filter((l) => l.nova).length !== 1) vazou.push(`${i}/${camada}: a linha nova`);
      if (pode("plano") && Array.isArray(d.plano) && d.plano.length === f.plano.length) guerraComPlano++;
    }
  }
  t(`4 · o cartaz da sombra: em ${vistas} cartazes, nenhuma camada vaza a seguinte (nome, título, o que quer, plano, fraqueza, assinatura)`, vistas > 0 && vazou.length === 0, vazou.slice(0, 6).join(" · "));
  t("4 · na guerra, o plano chega com um estado por passo", guerraComPlano > 0 && Object.values(DIARIO_DO_VILAO.plano).every((x) => typeof x === "string"));
  t("4 · numa campanha antiga não há cartaz", oVilaoDasQuests(ANTIGA) === null && oVilaoNoDiario(null) === null);

  /* 8. a frase que é uma carta */
  const ab = [{ quest: "o_salvo_conduto", chave: "passo", opcoes: vp.opcoes }];
  t("8 · «pago a portagem» é a carta da portagem", J(aEscolhaDaFrase("pago a portagem", ab)) === J({ quest: "o_salvo_conduto", chave: "passo", opcao: "portagem" }));
  t("8 · «olho em volta» não é carta nenhuma", aEscolhaDaFrase("olho em volta", ab) === null && aEscolhaDaFrase("", ab) === null && aEscolhaDaFrase("pago", null) === null);
  const ab2 = [{ quest: "o_salvo_conduto", chave: "verdade", opcoes: vv.opcoes }];
  t("8 · entre duas cartas com o mesmo nome dentro, decide o verbo", aEscolhaDaFrase("entrego a Lia a quem a procura", ab2).opcao === "entregar" && aEscolhaDaFrase("levo a Lia até ao fim", ab2).opcao === "levar");
  t("8 · e o empate não escolhe por ninguém", aEscolhaDaFrase("falo com a Lia", ab2) === null);
}

/* §11 O PORTÃO DA ABERTURA (TE5, 09/11). Uma quest do coração que pressupõe
   o que só o jogo garante (a convivência, a afeição) ESPERA: sem registo —
   logo fora do Diário, das escolhas e da pauta — até isso valer, e abre
   nesse dia; ao fim da espera máxima dá lugar à reserva que o esqueleto
   lhe guardou (reservaDoCoracao). Medido com o esqueleto da TE4: 360 de
   1000 campanhas abriam uma destas no turno 0. O replay faz o mesmo. */
sec("§11 o portão da abertura (TE5)");
{
  const P = PORTAO_DA_ABERTURA;
  t("o portão julga os pressupostos que só o jogo garante, e a espera tem fim", P.garante === "abertura" && Object.values(PRESSUPOSTOS).some((x) => x.garante === P.garante) && Number.isInteger(P.esperaMaxima) && P.esperaMaxima > 0 && P.teto >= ESQUELETO.coracao);
  const convMax = Math.max(...BIBLIOTECA_DE_QUESTS.flatMap((q) => (q.pressupoe || []).filter((c) => c[0] === "convivencia").map((c) => (Number.isInteger(c[2]) ? c[2] : 3))));
  t(`a espera máxima (${P.esperaMaxima} dias) passa do dobro da convivência mais longa que o acervo pede (${convMax})`, P.esperaMaxima > 2 * convMax);

  /* o mundo de prova: o primeiro cujo coração do turno 0 espera a convivência e tem reserva */
  let TW = null;
  for (let i = 0; i < 80 && !TW; i++) {
    const w = mundoNovo(`TE5|${i}`, "jornada", "soldado");
    const c = w.esq && w.esq.coracao.find((x) => x.atos[0] === 0);
    if (c && c.reserva && (questPorId(c.quest).pressupoe || []).some((x) => x[0] === "convivencia")) TW = { w, c };
  }
  t("há um mundo de prova cujo coração do turno 0 espera a convivência, com reserva", !!TW);
  const W5 = TW.w, c0 = TW.c;
  const quem = c0.papeis.quem.nome;
  const titulo = questPorId(c0.quest).titulo;
  const espera = (E) => garantirQuestsDaEspinha(E.espinha.quests).espera;
  const fora = (E) => garantirQuestsDaEspinha(E.espinha.quests).fora;

  /* o turno 0: espera */
  let { E, r } = turno(W5, W5.estado);
  t("no turno 0, a quest do coração com gancho de convivência espera: na espera, sem registo", espera(E).some((e) => e.id === c0.quest && e.ato === 0 && e.desde === 1) && !registoDe(E, c0.quest), J(espera(E)));
  t("e o tipo 1 do ato não espera: abriu", !W5.esq.atos[0].quest || !!registoDe(E, W5.esq.atos[0].quest));
  const mesa = aMesaDasQuests(E, { mundo: W5.mundo, cena: { presentes: [] } });
  t("enquanto espera, não aparece no Diário, nas escolhas, na pauta nem no relato", !missoesDasQuests(E, { mundo: W5.mundo }).some((m) => m.id.endsWith(c0.quest)) && !escolhasDasQuests(E, { mundo: W5.mundo }).some((x) => x.quest === c0.quest) && !J(mesa).includes(titulo) && !r.linhas.some((l) => l.includes(titulo)));
  t("a espera atravessa o save (garantirQuestsDaEspinha, depois do JSON)", J(garantirQuestsDaEspinha(JSON.parse(J(E.espinha.quests)))) === J(garantirQuestsDaEspinha(E.espinha.quests)));

  /* o caminho que abre: quem é do grupo (a afeição) e foi visto no dia 1 (a convivência) */
  let E2 = E;
  ({ E: E2 } = turno(W5, { ...E2, dia: 2 }, (e) => comGrupo({ ...e, elenco: { vistos: { [quem]: [1] } } }, quem)));
  t("ao fim de um dia de estrada, ainda espera (a convivência pede três)", espera(E2).some((e) => e.id === c0.quest) && !registoDe(E2, c0.quest));
  ({ E: E2 } = turno(W5, { ...E2, dia: 4 }));
  const R2 = registoDe(E2, c0.quest);
  t("ao terceiro dia de estrada com quem confia no herói, o portão abre: a quest nasce, com o dia de hoje", !!R2 && R2.inicio === 4 && !espera(E2).length, J(espera(E2)));
  t("e a reserva não abre (só uma das duas corre)", !registoDe(E2, c0.reserva.quest) && !fora(E2).some((f) => f.id === c0.quest));
  /* os dois pressupostos contam: três dias de estrada sem confiança não abrem */
  let E4 = E;
  ({ E: E4 } = turno(W5, { ...E4, dia: 4 }, (e) => ({ ...e, elenco: { vistos: { [quem]: [1] } } })));
  t("três dias de estrada sem a confiança de quem é (a afeição) não abrem: continua à espera", espera(E4).some((e) => e.id === c0.quest) && !registoDe(E4, c0.quest));

  /* o caminho que nunca chega: ninguém com quem fazer estrada */
  let E3 = E;
  for (let d = 2; d <= P.esperaMaxima; d++) ({ E: E3 } = turno(W5, { ...E3, dia: d }));
  t(`sem a convivência, espera até ao fim da espera máxima (dia ${P.esperaMaxima}: ainda espera)`, espera(E3).some((e) => e.id === c0.quest) && !registoDe(E3, c0.reserva.quest));
  ({ E: E3 } = turno(W5, { ...E3, dia: 1 + P.esperaMaxima }));
  const R3 = registoDe(E3, c0.reserva.quest);
  t("e então dá lugar à reserva: a quest sai para fora, a reserva abre, ninguém fica preso", fora(E3).some((f) => f.id === c0.quest) && !!R3 && R3.inicio === 1 + P.esperaMaxima && !espera(E3).length && !registoDe(E3, c0.quest), J({ espera: espera(E3), fora: fora(E3) }));
  t("a reserva abre com os papéis que o esqueleto lhe guardou", !!R3 && Object.entries(c0.reserva.papeis).every(([k, p]) => R3.papeis[k] && R3.papeis[k].nome === p.nome));

  /* o replay: o passo «as quests», dia a dia, da espera à reserva */
  const passo = PASSOS_DO_REPLAY.find((p) => p.passo === "as quests");
  let A = W5.estado, B = W5.estado, iguais = true;
  for (let d = 1; d <= 1 + P.esperaMaxima; d++) {
    A = { ...A, dia: d }; B = { ...B, dia: d };
    const ra = oTurnoDasQuests(A, { mundo: W5.mundo });
    A = ra ? { ...A, ...ra.estado } : A;
    B = passo.faz(B, {}, { mundo: W5.mundo }, { tela: { linhas: [] } });
    if (J(A) !== J(B)) iguais = false;
  }
  t("o replay é igual ao turno, dia a dia, da espera à reserva", iguais && !!registoDe(A, c0.reserva.quest));
  let C2 = { ...W5.estado }, D2 = { ...W5.estado }, iguais2 = true;
  for (const [d, f] of [[1, null], [2, (e) => comGrupo({ ...e, elenco: { vistos: { [quem]: [1] } } }, quem)], [4, null]]) {
    C2 = { ...(f ? f(C2) : C2), dia: d }; D2 = { ...(f ? f(D2) : D2), dia: d };
    const rc = oTurnoDasQuests(C2, { mundo: W5.mundo });
    C2 = rc ? { ...C2, ...rc.estado } : C2;
    D2 = passo.faz(D2, {}, { mundo: W5.mundo }, { tela: { linhas: [] } });
    if (J(C2) !== J(D2)) iguais2 = false;
  }
  t("e é igual no caminho que abre", iguais2 && !!registoDe(C2, c0.quest));

  /* a campanha em curso: a quest que já abriu segue, o portão não a toca */
  const Rja = abrirQuest(c0.quest, { estado: W5.estado, papeis: c0.papeis });
  const EmCurso = { ...W5.estado, espinha: { ...W5.estado.espinha, quests: { ...garantirQuestsDaEspinha(null), atos: [0], registos: [Rja] } } };
  const rc = Rja ? oTurnoDasQuests(EmCurso, { mundo: W5.mundo }) : null;
  const Ec = rc ? { ...EmCurso, ...rc.estado } : EmCurso;
  t("numa campanha em curso, a do coração que já abriu segue: o portão só toca as que ainda não abriram", !!Rja && !!registoDe(Ec, c0.quest) && !espera(Ec).length);
  /* o save que nunca esperou fica com a forma de antes: sem o campo */
  const { E: Ep } = turno(W, W.estado);
  t("sem ninguém à espera, a espinha não ganha o campo (o save fica com a forma de antes)", !("espera" in Ep.espinha.quests));
  /* o lixo */
  const g = garantirQuestsDaEspinha({ registos: [Rja], espera: [{ id: "nao_existe" }, 3, null, { id: c0.quest, ato: 0, desde: 1 }, { id: c0.reserva.quest, ato: -4, desde: "x" }, { id: c0.reserva.quest, ato: 1, desde: 2 }] });
  t("a espera torta cai: o id que não é do catálogo, a que já abriu, a repetida; o número torto vai a zero", J(g.espera) === J([{ id: c0.reserva.quest, ato: 0, desde: 0 }]), J(g.espera));
}

console.log(`\nBQ7 · as quests e o vilão no motor: ${bons} passaram, ${maus} falharam`);
if (maus) process.exit(1);
