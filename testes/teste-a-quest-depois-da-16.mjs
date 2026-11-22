/* teste-a-quest-depois-da-16.mjs (22/11/2026) — a quest depois da décima sexta
   sessão do Mestre vivo (mente/lancamento/mestre-vivo-sessao-16.md)

   A QC1 fez a quest mandar na cena, e a 16.ª confirmou: «O Livro dos Nomes»
   fechou na frase 34. O que ela mostrou que falta, por impacto, e o que esta
   suíte prova (um caso por item; cada um falhava antes do conserto):
     §1 a segunda quest «sem a pessoa»: «Ouvir Constance Mordaunt» mandava
        «Partir para Ponto valente» — ela mora lá, na torre da quest —, a ponte
        dizia só a cidade, e a prosa deu-lhe corpo em Rio do Martelo por 26
        frases. A varredura: em todo o acervo, com várias sementes, toda pessoa
        e todo lugar dos passos existe no sistema quando a quest nasce; e a
        ponte diz quem mora no destino, «lá, e não aqui»;
     §2 o passo sem caminho: «Tirar o livro das mãos de Thaddeus Crane», com ele
        em cena e nenhum botão por 6 turnos — a ponte e a tela dizem que ele
        está aqui;
     §3 o desfecho que não tira: «devolver o livro a Mercy» e o livro na bolsa
        por 20 frases;
     §4 a falha que cumpre o passo: o preço «cobra» do mistério (◉ 30) zerou uma
        bolsa de ◉ 18, e o Narrador só sabia da falha;
     §5 o que vaza: o ◉ 19 dado duas vezes;
     §6 o XP entre os passos: 60 turnos num dia só, nem 50 sem ponto, nem chuva. */
import { BIBLIOTECA_DE_QUESTS, questPorId } from "../src/biblioteca-de-quests.js";
import { esqueletoDaCampanha, comOEsqueleto } from "../src/esqueleto.js";
import { gerarGeografia } from "../src/geografia.js";
import { estenderEspinha } from "../src/saga.js";
import { nucleoDaCampanha } from "../src/nucleo.js";
import { garantirHistoria, ESTRUTURAS } from "../src/historia.js";
import { garantirFactos } from "../src/livro-de-factos.js";
import { anotarOLivro } from "../src/motor/livro-do-turno.js";
import { chefesDoMundo, oQueExisteAqui } from "../src/mundo-base.js";
import { MOLDES } from "../src/moldes.js";
import { oTurnoDasQuests, escolherNaQuestDoEstado, QUESTS_DO_TURNO } from "../src/motor/quests-do-turno.js";
import { osPassosDasQuests } from "../src/a-quest-manda.js";
import { aPonteDoPasso, A_PONTE_DO_PASSO } from "../src/motor/a-ponte-do-passo.js";
import { oRumoDaBusca } from "../src/propostas-da-abertura.js";
import { aPessoaDoPasso } from "../src/motor/a-pessoa-do-passo.js";
import { aplicarPrecoDoQuadro, oQuadroNaPauta, PRECO_DA_FALHA, TETO_DO_PRECO } from "../src/quadro-da-quest.js";
import { achadosDaEtapa } from "../src/espolios.js";
import { FEITO_DO_SISTEMA, osFactosDoTurno, oFeitoDoTurno, lembrarOsFeitos } from "../src/feito-do-sistema.js";
import { readFileSync } from "node:fs";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

/* o mundo da 16.ª: a mesma semente da campanha das sessões 15 e 16 */
const G = "Horror cósmico", SEMENTE = "A lenda de Barnabas|Horror cósmico", CASA = "Rio do Martelo";
const MUNDO = { semente: SEMENTE, genero: G };
function oMundoDa16(etapa) {
  const mapa = gerarGeografia(SEMENTE, null, null);
  const espinha0 = estenderEspinha({ semente: SEMENTE, mapa, genero: G, estrutura: "misterio", cidadeInicial: CASA, antecedente: "acolito", dia: 1 });
  const nucleo = nucleoDaCampanha(SEMENTE, mapa, { espinha: espinha0, antecedente: "acolito", grupo: [] });
  const esq = esqueletoDaCampanha({ semente: SEMENTE, mapa, espinha: espinha0, genero: G, antecedente: "acolito", nucleo, cidadeInicial: CASA });
  const E = { nomeCampanha: "A lenda de Barnabas", mundo: { genero: G }, espinha: comOEsqueleto(espinha0, esq), historia: garantirHistoria({ estrutura: "misterio", etapa }),
    mapa, cidadeAtual: CASA, lugar: { nome: "A Lâmpada dos Sonhos", cidade: CASA }, jornada: null,
    personagem: { nome: "Barnabas", grupo: [{ nome: "Lavinia Sallow" }], inventario: [], moedas: 18 }, npcs: {}, dia: 1, minuto: 600, npcTurno: 0, factos: garantirFactos(null) };
  return { esq, E };
}
const turno = (E) => { const r = oTurnoDasQuests(E, { mundo: MUNDO }); return r ? { ...E, ...r.estado } : E; };

sec("§1 a quest nasce com a gente e os lugares dos passos, e a ponte diz quem mora no destino");
{
  /* A VARREDURA: todas as quests postas pelo esqueleto (os atos e o coração),
     em todos os moldes e numa campanha de horror, com várias sementes. Cada
     pessoa do elenco existe na base da cidade dela (ou no núcleo, o «querido do
     herói»), e a casa dela é um sítio da cidade; cada lugar é um sítio da base;
     e quem um passo pede é sempre do elenco, do fio, do grupo ou da fraqueza —
     nunca um nome sem dono. */
  const ESP = ESTRUTURAS.filter((e) => e.espinha).map((e) => e.id);
  const ANTS = ["", "orfao", "soldado", "erudito", "acolito", "ladrao", "naufrago"];
  const casos = [...MOLDES.map((m) => ({ molde: m, genero: undefined })), { molde: null, genero: G }];
  let mundos = 0, quests = 0, pessoas = 0, lugares = 0;
  const vistas = new Set(), faltas = [];
  for (const { molde, genero } of casos) {
    for (let i = 0; i < 12; i++) {
      const semente = `Dezasseis|${molde ? molde.id : genero}|${i}`;
      const mapa = gerarGeografia(semente, molde, null);
      const antecedente = ANTS[i % ANTS.length];
      let esq = null, nucleo = null;
      try {
        const espinha = estenderEspinha({ semente, mapa, genero, estrutura: ESP[i % ESP.length], cidadeInicial: mapa.cidades[0].nome, antecedente, dia: 1 });
        nucleo = nucleoDaCampanha(semente, mapa, { espinha, antecedente, grupo: [] });
        esq = esqueletoDaCampanha({ semente, mapa, espinha, genero, antecedente, nucleo, chefes: chefesDoMundo(semente, mapa, genero), molde, cidadeInicial: mapa.cidades[0].nome });
      } catch { esq = null; }
      if (!esq) continue;
      mundos++;
      const doNucleo = new Set((nucleo && nucleo.pessoas || []).map((p) => norm(p.nome)));
      const postas = [...esq.atos.filter((a) => a.quest).map((a) => ({ id: a.quest, papeis: a.papeis })), ...esq.coracao.map((c) => ({ id: c.quest, papeis: c.papeis }))];
      for (const q of postas) {
        const F = questPorId(q.id);
        if (!F) continue;
        quests++; vistas.add(q.id);
        for (const [k, d] of Object.entries(F.papeis)) {
          const p = q.papeis[k];
          if (!p) continue;
          const base = p.cidade ? oQueExisteAqui(semente, mapa, p.cidade, null, genero, molde, null) : null;
          if (d.de === "elenco") {
            pessoas++;
            const naBase = !!base && base.gente.some((g) => g.nome === p.nome);
            const casaOk = !p.local || (!!base && base.locais.some((l) => l.nome === p.local));
            if (!(naBase || doNucleo.has(norm(p.nome))) || !casaOk) faltas.push(`${semente} ${q.id}.${k} ${J(p)}`);
          }
          if (d.de === "lugar") {
            lugares++;
            if (!base || !base.locais.some((l) => l.nome === p.nome)) faltas.push(`${semente} ${q.id}.${k} (lugar) ${J(p)}`);
          }
        }
      }
    }
  }
  console.log(`      ${mundos} mundos, ${quests} quests postas (${vistas.size} fichas distintas de ${BIBLIOTECA_DE_QUESTS.length}), ${pessoas} pessoas e ${lugares} lugares conferidos`);
  t("a varredura cobre os moldes e o horror, e a maior parte do acervo", mundos >= casos.length * 10 && vistas.size >= BIBLIOTECA_DE_QUESTS.length * 0.6, `${mundos} mundos, ${vistas.size} fichas`);
  t("toda pessoa e todo lugar dos passos existe no sistema quando a quest nasce", faltas.length === 0, `${faltas.length}: ${faltas.slice(0, 4).join(" | ")}`);

  /* a 16.ª: com a primeira fechada, «A Torre do Sino» abre no ato 1, e a
     pessoa do primeiro passo mora em Ponto valente, na torre */
  const { esq, E: E0 } = oMundoDa16(1);
  const ato1 = esq.atos.find((a) => a.ato === 1);
  t("no mundo da 16.ª, o ato 1 é «A Torre do Sino», noutra cidade", ato1 && ato1.quest === "a_torre_do_sino" && ato1.cidade !== CASA, J(ato1 && [ato1.quest, ato1.cidade]));
  const E = turno(E0);
  const ps = osPassosDasQuests(E, { mundo: MUNDO });
  const sineira = ato1.papeis.sineira;
  const p0 = ps.find((p) => p.quest === "a_torre_do_sino");
  t("o passo pede a sineira, com a casa e a cidade dela", !!p0 && p0.candidatos.pessoa.some((c) => c.nome === sineira.nome && c.cidade === sineira.cidade && c.onde === sineira.local), J(p0 && p0.candidatos.pessoa));
  const rumo = oRumoDaBusca({ passos: ps, aqui: E.lugar.nome, cidade: E.cidadeAtual });
  t("a tela manda partir para a cidade dela", !!rumo && rumo.acao === "partir" && rumo.nome === sineira.cidade, J(rumo));
  const ponte = aPonteDoPasso({ passos: ps, aqui: E.lugar.nome, cidade: E.cidadeAtual, presentes: ["Charity Mordaunt"] });
  console.log(`      a ponte: «${ponte}»`);
  t("A PONTE DIZ QUEM MORA NO DESTINO: a sineira está lá, e não aqui", ponte.includes(sineira.nome) && ponte.includes("não aqui") && ponte.includes(sineira.cidade), ponte);
  t("…e cabe no teto da ponte", ponte.length <= A_PONTE_DO_PASSO.teto);
  /* e quando o herói chega à casa dela, ela está em cena */
  const la = aPessoaDoPasso({ ...E, cidadeAtual: sineira.cidade, lugar: { nome: sineira.local, cidade: sineira.cidade } });
  t("com o herói na casa dela, em Ponto valente, a sineira está em cena", la.some((x) => x.nome === sineira.nome && x.aqui), J(la.map((x) => [x.nome, x.aqui])));
  t("…e em Rio do Martelo, não", !aPessoaDoPasso({ ...E, lugar: { nome: "A Capela do Afogado", cidade: CASA } }).some((x) => x.nome === sineira.nome));
}

/* o mundo da 16.ª no passo 3 de «O Livro dos Nomes»: Mercy ouvida, a Capela
   pisada, o servo conhecido (o registo e a conversa) */
function noPassoDoLivro() {
  const { esq, E: E0 } = oMundoDa16(0);
  const P = esq.atos[0].papeis;
  let E = { ...E0, lugar: { nome: P.casa.nome, cidade: CASA },
    npcs: { [P.escrivao.nome]: { nome: P.escrivao.nome, local: `${P.escrivao.local}, em ${CASA}`, conhecidoEm: 1 }, [P.servo.nome]: { nome: P.servo.nome, local: `${P.casa.nome}, em ${CASA}`, conhecidoEm: 1 } } };
  E = turno(E);
  E = turno({ ...E, factos: anotarOLivro(E, { falouCom: [P.escrivao.nome], lugar: E.lugar, dia: 1, turno: 3 }, { mundo: MUNDO }).factos });
  E = turno({ ...E, factos: anotarOLivro(E, { falouCom: [P.servo.nome], dia: 1, turno: 13 }, { mundo: MUNDO }).factos });
  return { P, E };
}

sec("§2 o passo cuja pessoa está aqui tem caminho, na ponte e na tela");
{
  const { P, E } = noPassoDoLivro();
  const ps = osPassosDasQuests(E, { mundo: MUNDO });
  const p = ps.find((x) => x.quest === "o_livro_dos_nomes");
  t("o passo é «Tirar o livro das mãos de» o servo", !!p && p.etapa === "livro", J(p && [p.etapa, p.texto]));
  t("o passo diz de quem depende — o servo, já visto pelo herói", !!p && (p.quem || []).some((q) => q.nome === P.servo.nome), J(p && p.quem));
  const presentes = [P.servo.nome, "Mordecai", "Eudora Ottoline"];
  const rumo = oRumoDaBusca({ passos: ps, aqui: E.lugar.nome, cidade: E.cidadeAtual, presentes });
  t("A TELA OFERECE O CAMINHO: «Falar com» o servo, que está em cena", !!rumo && rumo.acao === "falar" && rumo.nome === P.servo.nome && rumo.verbo.includes(P.servo.nome), J(rumo));
  const ponte = aPonteDoPasso({ passos: ps, aqui: E.lugar.nome, cidade: E.cidadeAtual, presentes });
  console.log(`      a ponte: «${ponte}»`);
  t("A PONTE DIZ AO NARRADOR que o servo está aqui, em cena", ponte.includes(P.servo.nome) && ponte.includes("está aqui"), ponte);
  t("sem ele em cena, nem porta nem ponte inventadas", oRumoDaBusca({ passos: ps, aqui: E.lugar.nome, cidade: E.cidadeAtual, presentes: ["Mordecai"] }) === null);
  /* e o vilão que o herói ainda não viu não entra pelo nome */
  const { esq, E: E1 } = oMundoDa16(0);
  const P1 = esq.atos[0].papeis;
  let F = { ...E1, lugar: { nome: P1.casa.nome, cidade: CASA }, npcs: { [P1.escrivao.nome]: { nome: P1.escrivao.nome, local: `${P1.escrivao.local}, em ${CASA}`, conhecidoEm: 1 } } };
  F = turno(turno({ ...turno(F), factos: anotarOLivro(turno(F), { falouCom: [P1.escrivao.nome], lugar: F.lugar, dia: 1, turno: 3 }, { mundo: MUNDO }).factos }));
  const p1 = osPassosDasQuests(F, { mundo: MUNDO }).find((x) => x.quest === "o_livro_dos_nomes");
  t("…o servo que o herói nunca viu não vai no `quem` (o nome dele só depois de visto)", !!p1 && !(p1.quem || []).some((q) => q.nome === P1.servo.nome), J(p1 && p1.quem));
  /* a abertura: o passo 1 manda à casa de Mercy, a mesma do botão */
  const { E: A0 } = oMundoDa16(0);
  const A = turno({ ...A0, lugar: null });
  const pa = osPassosDasQuests(A, { mundo: MUNDO });
  const ra = oRumoDaBusca({ passos: pa, aqui: "", cidade: CASA });
  const pta = aPonteDoPasso({ passos: pa, aqui: "", cidade: CASA });
  t("na abertura, a ponte e o botão dizem o mesmo destino (a casa de quem guardava o livro)", !!ra && pta.startsWith(ra.nome), `${J(ra && ra.nome)} · «${pta}»`);
}

sec("§3 o que a carta de desfecho entrega sai da ficha");
{
  const { E: E0 } = noPassoDoLivro();
  /* o passo 3 feito (como a carta o virou na frase 33), o livro na bolsa */
  const Q = E0.espinha.quests, R0 = Q.registos.find((r) => r.id === "o_livro_dos_nomes");
  let E = { ...E0, personagem: { ...E0.personagem, inventario: [{ nome: "o livro dos nomes", qtd: 1 }, { nome: "Tocha", qtd: 5 }] },
    espinha: { ...E0.espinha, quests: { ...Q, registos: Q.registos.map((r) => (r.id === R0.id ? { ...R0, feitas: { ...R0.feitas, livro: { dia: 1, ramo: "furto" } } } : r)) } } };
  E = turno(E);
  const r = escolherNaQuestDoEstado(E, "o_livro_dos_nomes", "livro", "devolver", { mundo: MUNDO });
  t("a escolha «devolver o livro» fecha a quest", !!r && (r.linhas || []).some((l) => l.includes("cumprida")), J(r && r.linhas));
  const inv = r ? (r.estado.personagem || E.personagem).inventario : [];
  t("O LIVRO SAI DA BOLSA ao devolvê-lo — e o resto fica", !inv.some((i) => norm(i.nome).includes("livro dos nomes")) && inv.some((i) => i.nome === "Tocha"), J(inv));
  t("o efeito é da biblioteca e o motor o aplica", QUESTS_DO_TURNO.aplica.includes("sai_da_bolsa"));
  /* a catraca do acervo: toda carta que entrega, devolve, queima ou leva uma
     coisa da quest tira-a da bolsa */
  const verbo = /^(devolver|entregar|queimar|levar|destruir|dar)\b/;
  const faltas = [];
  for (const F of BIBLIOTECA_DE_QUESTS) {
    const itens = Object.entries(F.papeis).filter(([, d]) => d.de === "item").map(([k, d]) => [k, norm(d.nome || "").split(" ").pop()]);
    for (const [ch, e] of Object.entries(F.escolhas || {})) for (const [op, o] of Object.entries(e.opcoes || {})) {
      const tx = norm(o.texto);
      const fala = itens.filter(([k, w]) => o.texto.includes(`{${k}}`) || (w && w.length > 3 && tx.includes(w)));
      if (!verbo.test(tx) || !fala.length) continue;
      if (!fala.every(([k]) => (o.efeitos || []).some((x) => x.tipo === "sai_da_bolsa" && x.papel === k))) faltas.push(`${F.id}.${ch}.${op}`);
    }
  }
  t("toda carta que entrega ou destrói a coisa da quest a tira da bolsa", faltas.length === 0, faltas.join(", "));
}

sec("§4 a falha com preço: o preço tem teto, e o Narrador sabe que veio e custou");
{
  const cobra = { id: "cobra", linha: PRECO_DA_FALHA.cobra.linha, efeitos: PRECO_DA_FALHA.cobra.efeitos.map((e) => ({ ...e, n: e.n * 2 })) };
  const r = aplicarPrecoDoQuadro({ personagem: { nome: "Barnabas", moedas: 18 } }, cobra, {});
  const sobra = r && r.estado.personagem ? r.estado.personagem.moedas : 18;
  console.log(`      o preço «cobra» do mistério (◉ ${-cobra.efeitos[0].n}) numa bolsa de ◉ 18: sobram ◉ ${sobra}`);
  t("A FALHA NÃO ZERA O HERÓI: o preço tira no máximo a fração da bolsa da tabela", sobra === 18 - Math.floor(18 * TETO_DO_PRECO.fracaoDaBolsa) && sobra > 0, String(sobra));
  t("…numa bolsa larga, o preço cobra inteiro", (aplicarPrecoDoQuadro({ personagem: { moedas: 200 } }, cobra, {}).estado.personagem || {}).moedas === 170);
  t("…e o custo do caminho, dito antes do clique, não entra no teto", (aplicarPrecoDoQuadro({ personagem: { moedas: 18 } }, null, { custo: { moedas: 10 } }).estado.personagem || {}).moedas === 8);
  const quadro = { quest: "o_livro_dos_nomes", titulo: "O Livro dos Nomes", cartas: [
    { id: "c1", estado: "preco", preco: "cobra", face: "o que Thaddeus Crane sabe", linha: PRECO_DA_FALHA.cobra.linha, costas: "uma pessoa" },
    { id: "c2", estado: "costas", costas: "um lugar" }] };
  const qp = oQuadroNaPauta([quadro]);
  console.log(`      o quadro na pauta: «${qp.linha}»`);
  t("O NARRADOR SABE QUE A CARTA VEIO NA FALHA, e o que custou", qp.linha.includes("mesmo com a falha") && qp.linha.includes("custou"), qp.linha);
}

sec("§5 o que vaza: o achado dado duas vezes");
{
  /* «a música de canto» (o ofício «músico» no feminino) fica por fazer: mexer em
     OFICIO_NO_GENERO muda os dourados do pedido (pedido-dourado.json), que se
     regeneram contra o App — e o App está com outra mão */
  /* duas etapas da mesma quest no mesmo sítio não dão o mesmo achado */
  const F = questPorId("o_livro_dos_nomes");
  const R = { id: F.id, estado: "aberta", papeis: { casa: { nome: "A Capela do Afogado", sitio: "templo" } }, feitas: { livro: { dia: 1, ramo: "furto" }, destino: { dia: 1, ramo: "devolver" } } };
  const op = { semente: SEMENTE, nivel: 1, tipoDoLugar: () => "templo" };
  const sozinho = achadosDaEtapa(F, R, "destino", op)[0];
  const doLivro = sozinho ? `${F.id}:livro:${sozinho.id.split(":")[2]}` : "";
  const depois = achadosDaEtapa(F, { ...R, espolio: { achados: [doLivro], pago: false } }, "destino", op)[0];
  t("o que o fim do passo 3 deu, o desfecho não dá de novo", !!sozinho && (!depois || depois.id.split(":")[2] !== sozinho.id.split(":")[2]), J([sozinho && sozinho.id, depois && depois.id]));
}

sec("§6 o XP entre os passos: uma sessão de 60 turnos num dia só");
{
  /* o roteiro da 16.ª, esquematizado: dois sítios novos e duas conversas nos
     primeiros turnos; depois 18 buscas de quarto em quarto (moer o olho), e 8
     riscos que passam espalhados pela sessão (subir, espreitar, mentir,
     convencer, intimidar, saltar, forçar, nadar) — com algo em jogo, como o
     Espreitar da frase 12 e a subida da frase 42 */
  const RISCOS = { 12: "furtar_se", 19: "escalar", 26: "mentir", 33: "convencer", 40: "intimidar", 46: "saltar", 52: "forcar", 58: "nadar" };
  let mem = lembrarOsFeitos(null, [], null, { dia: 1 });
  let livro = { lugares: {}, pessoas: {} };
  const pagos = [];
  for (let n = 1; n <= 60; n++) {
    if (n === 3 || n === 7) livro = { ...livro, pessoas: { ...livro.pessoas, [`npc|p${n}`]: { falou: { dia: 1, turno: n } } } };
    if (n === 4 || n === 6) livro = { ...livro, lugares: { ...livro.lugares, [`rio|sitio|s${n}`]: { esteve: { dia: 1, turno: n } } } };
    let teste = null, lugar = "a capela";
    if (RISCOS[n]) teste = { desafio: RISCOS[n], sucesso: true };
    else if (n > 8 && n % 3 === 0) { teste = { desafio: "buscar", sucesso: true }; lugar = `quarto ${n}`; }
    const fs = osFactosDoTurno({ teste, factos: livro, cidade: "Rio do Martelo", lugar });
    const f = oFeitoDoTurno(fs, mem, { dia: 1 });
    if (f) pagos.push(n);
    mem = lembrarOsFeitos(mem, fs, f, { dia: 1 });
  }
  const marcos = [0, ...pagos, 61];
  const maiorVazio = Math.max(...marcos.slice(1).map((x, i) => x - marcos[i] - 1));
  const tetoDoDia = FEITO_DO_SISTEMA.pequenosPorDia + FEITO_DO_SISTEMA.riscosPorDia;
  console.log(`      turnos com ponto: ${pagos.join(", ")} · ${pagos.length} miudezas · o maior vazio: ${maiorVazio} turnos`);
  t("a sessão não fica 50 turnos sem ponto", maiorVazio < 50, String(maiorVazio));
  t("o risco vencido rende depois de as miudezas do dia acabarem", pagos.some((n) => n > 8 && RISCOS[n]), J(pagos));
  t("nem vira chuva: no máximo os dois tetos do dia (miudezas + riscos)", pagos.length <= tetoDoDia, `${pagos.length} > ${tetoDoDia}`);
  t("moer Percepção de quarto em quarto continua no teto das miudezas", !pagos.some((n) => n > 8 && !RISCOS[n]), J(pagos));
  t("os números são de tabela", Number.isInteger(FEITO_DO_SISTEMA.riscosPorDia) && FEITO_DO_SISTEMA.riscosPorDia > 0 && FEITO_DO_SISTEMA.olhar.includes("buscar"));
  /* a memória nova é aditiva: a forma antiga continua a ser lida */
  t("a memória de antes (sem `riscos`) ainda é lida", oFeitoDoTurno(osFactosDoTurno({ teste: { desafio: "escalar", sucesso: true }, lugar: "x" }), { v: 1, dia: 1, pequenos: 4, vistos: [], testes: [] }, { dia: 1 }) !== null);
}

/* o módulo da ponte e o da tela continuam puros (sem React) */
const ponteSrc = readFileSync(new URL("../src/motor/a-ponte-do-passo.js", import.meta.url), "utf8");
t("a ponte continua pura (sem React)", !/from\s+["']react["']/.test(ponteSrc));

console.log(`\na quest depois da 16.ª: ${ok} passaram, ${mal} falharam`);
if (mal) process.exit(1);
