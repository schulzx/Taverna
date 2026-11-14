/* teste-passo-alcancavel.mjs (13/11/2026, a 20.ª sessão de prova, defeito 3)
   — nenhuma quest nasce com um passo que o herói não pode dar

   A 20.ª sessão (mente/sessao-20.md §4.2): 0 passos de quest em 47
   respostas. A quest de abertura (As Botas na Estrada) pedia «Ouvir Brigid»
   — conversou(papel:mae) —, e a Brigid nasceu { nome, cidade } numa capital
   de 54 mil almas: sem casa, ninguém a punha em cena (a-pessoa-do-passo.js
   só conhecia o `falar_com` das missões, e a quest projeta-se no Diário com
   etapas do tipo `quest`). O jogador foi «até a casa de Brigid» — DESTINO
   NÃO RECONHECIDO —, falou duas vezes, e ela nunca entrou em EM CENA. Na
   19.ª era o Cronista que fechava isto pela prosa; no modo «boca» essa
   porta está fechada, e nada a substituíra.

   O conserto, e a prova dele:
     §1 as tabelas: os predicados que pedem a pessoa frente a frente
        (A_PESSOA_DO_PASSO.daQuest) e os que dizem a casa no Diário
        (MISSAO_DA_QUEST.casa) são do vocabulário das condições;
     §2 a 20.ª de ponta a ponta: a pessoa do passo nasce com casa
        (esqueleto.js), entra em cena quando o herói lá está (ou a cena diz
        quando volta), o Diário diz onde mora, e a conversa — pela porta de
        sempre, o livro com `falou` — fecha o passo; num save de antes da
        casa, a gente da base da cidade põe-na no sítio dela;
     §3 quem o passo manda ENCONTRAR num lugar aparece nesse lugar (o rapaz
        das botas na estrada da espera), não em casa;
     §4 A CATRACA: em mundos de todos os moldes e muitas sementes, com o
        catálogo inteiro, toda pessoa do elenco que um passo pede frente a
        frente nasce com casa, e a casa é um sítio da cidade dela. */
import { BIBLIOTECA_DE_QUESTS, MISSAO_DA_QUEST, missaoDaQuest, questPorId } from "../src/biblioteca-de-quests.js";
import { CONDICOES } from "../src/condicoes-da-quest.js";
import { osPassosDasQuests } from "../src/a-quest-manda.js";
import { garantirQuestsDaEspinha, oTurnoDasQuests } from "../src/motor/quests-do-turno.js";
import { esqueletoDaCampanha, comOEsqueleto } from "../src/esqueleto.js";
import { garantirHistoria, ESTRUTURAS } from "../src/historia.js";
import { gerarGeografia } from "../src/geografia.js";
import { estenderEspinha } from "../src/saga.js";
import { nucleoDaCampanha } from "../src/nucleo.js";
import { chefesDoMundo, locaisDaCidade } from "../src/mundo-base.js";
import { aPessoaDoPasso, A_PESSOA_DO_PASSO } from "../src/motor/a-pessoa-do-passo.js";
import { garantirFactos } from "../src/livro-de-factos.js";
import { anotarOLivro } from "../src/motor/livro-do-turno.js";
import { MOLDES } from "../src/moldes.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

sec("§1 as tabelas");
{
  t("os predicados da pessoa frente a frente existem e pedem uma pessoa", A_PESSOA_DO_PASSO.daQuest.length > 0 && A_PESSOA_DO_PASSO.daQuest.every((p) => CONDICOES[p] && CONDICOES[p].args[0] && CONDICOES[p].args[0].tipo === "pessoa"));
  t("o Diário diz a casa só de quem se ouve, e esses são da pessoa frente a frente", MISSAO_DA_QUEST.casa.predicados.every((p) => A_PESSOA_DO_PASSO.daQuest.includes(p)) && MISSAO_DA_QUEST.casa.molde.includes("{falta}") && MISSAO_DA_QUEST.casa.molde.includes("{em}"));
}

/* um mundo da 20.ª: o catálogo só com As Botas na Estrada, no ato 1 */
const BOTAS = "as_botas_na_estrada";
function mundoDasBotas(i) {
  const semente = `aventura|${i}`;
  const mapa = gerarGeografia(semente, null, null);
  const espinha0 = estenderEspinha({ semente, mapa, estrutura: "jornada", cidadeInicial: mapa.cidades[0].nome, antecedente: "acolito", dia: 1 });
  const nucleo = nucleoDaCampanha(semente, mapa, { espinha: espinha0, antecedente: "acolito", grupo: [] });
  const esq = esqueletoDaCampanha({ semente, mapa, espinha: espinha0, antecedente: "acolito", nucleo, chefes: chefesDoMundo(semente, mapa), catalogo: BIBLIOTECA_DE_QUESTS.filter((q) => q.id === BOTAS) });
  if (!esq || esq.atos[0].quest !== BOTAS) return null;
  /* o estado como o pedido o vê: a campanha «aventura», o género da semente */
  return { semente, mapa, E: { nomeCampanha: "aventura", mundo: { genero: String(i) }, espinha: comOEsqueleto(espinha0, esq), historia: garantirHistoria({ estrutura: "jornada", etapa: 0 }), mapa, cidadeAtual: mapa.cidades[0].nome, lugar: null, jornada: null, personagem: { nome: "Wulf", grupo: [], inventario: [] }, npcs: {}, dia: 1, minuto: 600, npcTurno: 0, factos: garantirFactos(null) } };
}
const turno = (W) => { const r = oTurnoDasQuests(W.E, { mundo: { semente: W.semente } }); if (r) W.E = { ...W.E, ...r.estado }; };
const registo = (E) => garantirQuestsDaEspinha(E.espinha.quests).registos.find((x) => x.id === BOTAS);

sec("§2 a 20.ª de ponta a ponta: «Ouvir Brigid»");
{
  const mundos = [0, 1, 2, 4, 5].map(mundoDasBotas).filter(Boolean);
  t("os mundos de prova abrem As Botas na Estrada no primeiro ato", mundos.length >= 4, String(mundos.length));
  let comCasa = 0, emCena = 0, longe = 0, noDiario = 0;
  for (const W of mundos) {
    turno(W);
    const mae = registo(W.E).papeis.mae;
    if (mae.local && locaisDaCidade(W.semente, W.mapa.cidades.find((c) => c.nome === mae.cidade)).some((l) => l.nome === mae.local)) comCasa++;
    const la = aPessoaDoPasso({ ...W.E, cidadeAtual: mae.cidade, lugar: { nome: mae.local, cidade: mae.cidade } });
    const ela = la.find((x) => x.nome === mae.nome);
    /* à hora dela está em cena; fora dela, a cena diz onde anda e quando volta */
    if (ela && (ela.aqui || ela.ausente)) emCena++;
    if (!aPessoaDoPasso({ ...W.E, cidadeAtual: mae.cidade, lugar: { nome: "Um Sítio Qualquer", cidade: mae.cidade } }).some((x) => x.nome === mae.nome)) longe++;
    const m = missaoDaQuest(BOTAS, registo(W.E), { estado: W.E, mundo: { semente: W.semente } });
    if (m.etapas[0].rotulo.includes(mae.nome) && m.etapas[0].rotulo.includes(mae.local.replace(/^(O|A|Os|As)\s+/, ""))) noDiario++;
  }
  t("a mãe das botas nasce com casa, e a casa é um sítio da cidade dela", comCasa === mundos.length, `${comCasa}/${mundos.length}`);
  t("com o herói lá, ela está na cena (ou a cena diz quando volta)", emCena === mundos.length, `${emCena}/${mundos.length}`);
  t("noutro sítio da mesma cidade, não", longe === mundos.length, `${longe}/${mundos.length}`);
  t("o Diário diz com quem falar e onde ela mora", noDiario === mundos.length, `${noDiario}/${mundos.length}`);

  /* a conversa fecha o passo: a ficha põe-na em cena, o registo da cena
     grava-a (com o sítio) e o livro anota a conversa (registo-da-cena.js) */
  const W = mundoDasBotas(1);
  turno(W);
  const mae = registo(W.E).papeis.mae;
  W.E = { ...W.E, cidadeAtual: mae.cidade, lugar: { nome: mae.local, cidade: mae.cidade } };
  const antes = osPassosDasQuests(W.E, { mundo: { semente: W.semente } }).map((p) => p.etapa);
  W.E = { ...W.E, npcs: { [mae.nome]: { nome: mae.nome, local: `${mae.local}, em ${mae.cidade}`, conhecidoEm: 1 } } };
  W.E = { ...W.E, factos: anotarOLivro(W.E, { falouCom: [mae.nome], dia: 1, turno: 5 }, { mundo: { semente: W.semente } }).factos };
  turno(W);
  const depois = osPassosDasQuests(W.E, { mundo: { semente: W.semente } }).map((p) => p.etapa);
  t("falar com ela fecha «Ouvir», e a quest anda para a espera", J(antes) === J(["ouvir"]) && J(depois) === J(["espera"]), `${J(antes)} → ${J(depois)}`);

  /* o save de antes da casa (a 20.ª gravada): o papel sem `local` */
  const V = mundoDasBotas(1);
  turno(V);
  const R = registo(V.E), m0 = R.papeis.mae;
  const qs = garantirQuestsDaEspinha(V.E.espinha.quests);
  const semCasa = { ...R, papeis: { ...R.papeis, mae: Object.fromEntries(Object.entries(m0).filter(([k]) => k !== "local")) } };
  const Ev = { ...V.E, cidadeAtual: m0.cidade, lugar: { nome: m0.local, cidade: m0.cidade }, espinha: { ...V.E.espinha, quests: { ...V.E.espinha.quests, registos: qs.registos.map((x) => (x.id === BOTAS ? semCasa : x)) } } };
  t("num save de antes da casa, a gente da base põe-na no sítio dela", aPessoaDoPasso(Ev).some((x) => x.nome === m0.nome && norm(x.onde).includes(norm(m0.local))), J(aPessoaDoPasso(Ev).map((x) => [x.nome, x.onde])));
  t("…e noutra cidade, sem casa dita, não a procura (não mora noutra terra)", !aPessoaDoPasso({ ...Ev, cidadeAtual: "Outra Terra", lugar: { nome: m0.local, cidade: "Outra Terra" } }).some((x) => x.nome === m0.nome));
}

sec("§3 quem se ENCONTRA aparece onde o passo o põe");
{
  const W = mundoDasBotas(2);
  turno(W);
  const R = registo(W.E);
  const { mae, rapaz, estrada } = R.papeis;
  W.E = { ...W.E, npcs: { [mae.nome]: { nome: mae.nome, local: `${mae.local}, em ${mae.cidade}`, conhecidoEm: 1 } } };
  W.E = { ...W.E, factos: anotarOLivro(W.E, { falouCom: [mae.nome], dia: 1, turno: 5 }, { mundo: { semente: W.semente } }).factos };
  turno(W);
  const naEstrada = aPessoaDoPasso({ ...W.E, cidadeAtual: estrada.cidade, lugar: { nome: estrada.nome, cidade: estrada.cidade } });
  const ele = naEstrada.find((x) => x.nome === rapaz.nome);
  t("na espera, o rapaz das botas aparece na estrada (o lugar do passo), e não em casa", !!ele && norm(ele.onde).includes(norm(estrada.nome)), J(naEstrada.map((x) => [x.nome, x.onde])));
  const m = missaoDaQuest(BOTAS, registo(W.E), { estado: W.E, mundo: { semente: W.semente } });
  const agora = m.etapas.find((e) => typeof e.rotulo === "string");
  t("…e o Diário não lhe diz a casa: estragaria a espera", agora && !agora.rotulo.includes(String(rapaz.local || "").replace(/^(O|A|Os|As)\s+/, "") || "\u0000"), agora && agora.rotulo);
}

sec("§4 A CATRACA: nenhum passo frente a frente nasce sem casa");
{
  const ESP = ESTRUTURAS.filter((e) => e.espinha).map((e) => e.id);
  const ANTS = ["", "orfao", "soldado", "erudito", "acolito", "ladrao", "naufrago"];
  const POR_MOLDE = 120;
  const papeisDe = (c, out = []) => { if (Array.isArray(c)) { if (A_PESSOA_DO_PASSO.daQuest.includes(c[0]) && typeof c[1] === "string" && c[1].startsWith("papel:")) out.push(c[1].slice(6)); c.forEach((x) => papeisDe(x, out)); } return out; };
  let mundos = 0, conferidos = 0, semCasa = 0;
  const faltas = [];
  for (const molde of MOLDES) {
    for (let i = 0; i < POR_MOLDE; i++) {
      const semente = `Alcance|${molde.id}|${i}`;
      const mapa = gerarGeografia(semente, molde, null);
      const antecedente = ANTS[i % ANTS.length];
      let espinha, esq;
      try {
        espinha = estenderEspinha({ semente, mapa, estrutura: ESP[i % ESP.length], cidadeInicial: mapa.cidades[0].nome, antecedente, dia: 1 });
        const nucleo = nucleoDaCampanha(semente, mapa, { espinha, antecedente, grupo: [] });
        esq = esqueletoDaCampanha({ semente, mapa, espinha, antecedente, nucleo, chefes: chefesDoMundo(semente, mapa), molde });
      } catch { esq = null; }
      if (!esq) continue;
      mundos++;
      const postas = [...esq.atos.filter((a) => a.quest).map((a) => ({ id: a.quest, papeis: a.papeis })), ...esq.coracao.map((c) => ({ id: c.quest, papeis: c.papeis }))];
      for (const q of postas) {
        const F = questPorId(q.id);
        if (!F) continue;
        const pedidos = new Set(F.etapas.flatMap((e) => papeisDe(e.conclui)));
        for (const papel of pedidos) {
          if (!F.papeis[papel] || F.papeis[papel].de !== "elenco") continue;
          conferidos++;
          const p = q.papeis[papel] || {};
          const c = mapa.cidades.find((x) => x.nome === p.cidade);
          const casa = c && p.local && locaisDaCidade(semente, c, undefined, molde, null).some((l) => l.nome === p.local);
          if (!casa) { semCasa++; if (faltas.length < 6) faltas.push(`${semente} ${q.id}.${papel} ${J(p)}`); }
        }
      }
    }
  }
  t(`${mundos} mundos (${MOLDES.length} moldes × ${POR_MOLDE}), ${conferidos} pessoas de passo conferidas`, mundos >= MOLDES.length * POR_MOLDE * 0.8 && conferidos > mundos);
  t("toda pessoa do elenco que um passo pede frente a frente nasce com casa na cidade dela", semCasa === 0, `${semCasa} sem casa: ${faltas.join(" | ")}`);
}

console.log(`\no passo alcançável (a 20.ª, defeito 3): ${ok} passaram, ${mal} falharam`);
if (mal) process.exit(1);
