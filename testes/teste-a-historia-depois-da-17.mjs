/* teste-a-historia-depois-da-17.mjs — a história depois da décima sétima
   sessão do Mestre vivo (mente/lancamento/mestre-vivo-sessao-17.md)

   A quest fechou e rendeu XP, mas o jogador ficou 36 turnos sem saber o que
   fazer. A régua: o Narrador nunca sabe menos do que a tela mostra, e a tela
   nunca manda o jogador a um lugar ou pessoa a que ele não pode chegar.

     1. o passo cujo alvo está escondido aponta o caminho alcançável;
     2. o destino lê a trava da partida (e a varredura por molde);
     3. o teste de troca não vira carta de consulta;
     4. quem do elenco está noutro sítio desta cidade;
     5. o ofício no gênero da pessoa, e o papel da quest.

   Cada caso falha antes do conserto e passa depois. As funções são chamadas;
   nenhum texto de src/motor/ é lido. */
import { osPassosDasQuests } from "../src/a-quest-manda.js";
import { oRumoDaBusca, PROPOSTAS_DA_ABERTURA } from "../src/propostas-da-abertura.js";
import { aPonteDoPasso, A_PONTE_DO_PASSO } from "../src/motor/a-ponte-do-passo.js";
import { aMesaDasQuests } from "../src/motor/quests-do-turno.js";
import { oCaminhoAlcancavel, O_CAMINHO_ALCANCAVEL } from "../src/o-caminho-alcancavel.js";
import { travaDaPartida, proximaPerna } from "../src/lei-da-forma.js";
import { oTurnoDasQuests } from "../src/motor/quests-do-turno.js";
import { esqueletoDaCampanha, comOEsqueleto } from "../src/esqueleto.js";
import { garantirHistoria, ESTRUTURAS } from "../src/historia.js";
import { gerarGeografia } from "../src/geografia.js";
import { estenderEspinha } from "../src/saga.js";
import { nucleoDaCampanha } from "../src/nucleo.js";
import { chefesDoMundo } from "../src/mundo-base.js";
import { garantirFactos } from "../src/livro-de-factos.js";
import { MOLDES } from "../src/moldes.js";

import { osQuadrosDoEstado, aCartaDoTeste, CARTA_DO_TESTE } from "../src/quadro-da-quest.js";
import { quemEstaAqui, quemEstaNoutroSitio, quemAgeAqui, pessoasDasCartas } from "../src/quem-esta-aqui.js";
import { osAusentes, podarOAusente } from "../src/motor/poda-do-ausente.js";
import { pautaDosAusentesDaHistoria, A_GENTE_DA_HISTORIA_LONGE } from "../src/a-ficha-da-cena.js";

const J = (x) => JSON.stringify(x);
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

let ok = 0, mal = 0;
const t = (nome, cond, extra) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

/* ---------------- o estado da sessão 17 (só o que a quest lê) ----------------
   «As Chaves da Guarda», no passo 3 («Tirar quem paga a guarda por baixo da
   mesa de dentro de Balcão»): os passos 1 e 2 feitos, o servo (Godfrey) do
   vilão e nunca visto. `quartelNaCidade`: o papel do quartel caiu na própria
   cidade, como na sessão («de dentro de Balcão»). */
const CID = "Balcão do Degrau";
function papeisS17(quartelNaCidade) {
  return {
    quartel: quartelNaCidade
      ? { nome: CID, cidade: CID, tipo: "lugar", id: "cidade|balcao do degrau" }
      : { nome: "O Quartel do Degrau", cidade: CID, tipo: "lugar", id: "Balcão do Degrau|quartel" },
    capitao: { nome: "Brannoc Filho da Névoa", cidade: CID, ...(quartelNaCidade ? {} : { local: "O Quartel do Degrau" }), tipo: "pessoa", id: "npc|Brannoc Filho da Névoa" },
    sargento: { nome: "Hilda Passo-de-Gato", cidade: CID, tipo: "pessoa", id: "npc|Hilda Passo-de-Gato" },
    servo: { nome: "Godfrey Punho-de-Pedra", tipo: "pessoa", id: "" },
  };
}
function estadoS17(quartelNaCidade, mais) {
  const papeis = papeisS17(quartelNaCidade);
  return {
    espinha: {
      estrutura: "jornada", semente: "s17",
      esqueleto: { v: 1, estrutura: "jornada", semente: "s17", atos: [{ ato: 0, passo: 1, posicao: "cedo", maos: ["tenente"], cidade: CID, quest: "as_chaves_da_guarda", mao: "tenente", contra: [1, 2], papeis, fraqueza: false }], coracao: [], fraqueza: null, ordem: [{ id: "as_chaves_da_guarda", tipo: 1, ato: 0 }], semQuest: [], semContestacao: [] },
      quests: { v: 1, atos: [0], registos: [{ v: 1, id: "as_chaves_da_guarda", tipo: 1, inicio: 1, ultimoAvanco: 1, papeis, feitas: { chaves: { dia: 1, ramo: null, variante: null }, ronda: { dia: 1, ramo: null, variante: null } }, escolhas: {}, acesas: { chaves: 1, ronda: 1, servo: 1 }, reviravoltas: [], consequencias: [], estado: "aberta", motivo: null, desfecho: null, fecho: null, fechouEm: null }], fora: [], aplicadas: { as_chaves_da_guarda: 0 }, pesadas: [], passos: [], premissas: [], desfecho: null, fim: null },
    },
    historia: { estrutura: "jornada", etapa: 0, marcos: 0, feitos: [], capitulo: 1, capitulos: [] },
    dia: 1, cidadeAtual: CID, factos: { v: 1, pessoas: {}, lugares: {} }, npcs: {}, quadro: { v: 1, cartas: {} },
    personagem: { nome: "Osric", grupo: [{ nome: "Loras" }] },
    mundo: { genero: "Fantasia medieval", molde: "torre" },
    ...(mais || {}),
  };
}
const ESCONDIDO = /godfrey|punho/i;

/* ============================================================ */
sec("1 · o passo cujo alvo está escondido aponta o caminho alcançável");
{
  for (const naCidade of [true, false]) {
    const S = estadoS17(naCidade);
    const passos = osPassosDasQuests(S, { mundo: S.mundo });
    const p = passos[0];
    const rot = naCidade ? "(o quartel é a cidade)" : "(o quartel é um sítio)";
    t(`o passo 3 traz o caminho: perguntar ao capitão e vasculhar o quartel ${rot}`,
      !!(p && p.caminho && /perguntar a Brannoc/.test(p.caminho.texto) && /vasculhar/.test(p.caminho.texto)), p && JSON.stringify(p.caminho));
    t(`o caminho não diz quem é o escondido ${rot}`, !!(p && p.caminho) && !ESCONDIDO.test(JSON.stringify(p.caminho)));
    const mesa = aMesaDasQuests(S, { mundo: S.mundo });
    t(`a linha «O PASSO» da pauta diz o caminho ${rot}`, !!(mesa && /falta perguntar a Brannoc/.test(mesa.passo || "")), mesa && mesa.passo);
    t(`…e não diz o nome do escondido ${rot}`, !!(mesa && !ESCONDIDO.test(mesa.passo || "")));
    for (const aqui of ["", "A Feira"]) {
      for (const pres of [[], ["Brannoc Filho da Névoa"]]) {
        const e = { passos, aqui, cidade: CID, grupo: ["Loras"], presentes: pres };
        const r = oRumoDaBusca(e);
        const ponte = aPonteDoPasso(e);
        const rotulo = `${rot}, herói ${aqui || "sem sítio"}, Brannoc ${pres.length ? "em cena" : "longe"}`;
        t(`há botão ${rotulo}`, !!(r && r.verbo), JSON.stringify(r));
        if (pres.length) t(`com Brannoc em cena, o botão é falar com ele ${rotulo}`, !!(r && r.acao === "falar" && /Brannoc/.test(r.nome)));
        else if (naCidade) t(`com o quartel nesta cidade, o botão é vasculhar onde se está ${rotulo}`, !!(r && r.acao === "vasculhar" && r.frase === PROPOSTAS_DA_ABERTURA.vasculhar.frase));
        else t(`com o quartel noutro sítio, o botão leva ao quartel ${rotulo}`, !!(r && r.acao === "ir" && /Quartel/.test(r.nome)));
        t(`a ponte diz o caminho ${rotulo}`, ponte.includes("o caminho: perguntar a Brannoc"), ponte);
        t(`a ponte cabe no teto e não nomeia o escondido ${rotulo}`, ponte.length <= A_PONTE_DO_PASSO.teto && !ESCONDIDO.test(ponte));
      }
    }
  }
  /* depois de visto, o alvo direto deixa de estar escondido: o passo é o de sempre */
  const S = estadoS17(true, { factos: { v: 1, pessoas: { "npc|Godfrey": { nome: "Godfrey Punho-de-Pedra", visto: { de: 1, ate: 1, vezes: 1 } } }, lugares: {} } });
  const visto = osPassosDasQuests(S, { mundo: S.mundo })[0];
  t("o servo visto: sem caminho de desvio (ou o escondido já não manda)", !!visto && (visto.caminho == null || !visto.caminho.passos.some((x) => x.papel === "servo")));
  /* a regra vale para todo passo com alternativa: uma falta de mentira */
  const pes = (papel, nome, predicado) => ({ predicado, args: [{ papel, tipo: "pessoa", nome }], texto: "" });
  const lug = (papel, nome, predicado) => ({ predicado, args: [{ papel, tipo: "lugar", nome }], texto: "" });
  const falta = [{ predicado: "algum", opcoes: [[pes("vilao", "X", "derrotou")], [pes("velha", "Ama Velha", "conversou"), lug("poco", "O Poço", "esteve")]] }];
  const c = oCaminhoAlcancavel(falta, { escondido: (a) => a.args[0].papel === "vilao" });
  t("qualquer passo com alternativa: o ramo sem o escondido vira caminho", !!c && c.texto === "falar com Ama Velha e ir até O Poço", c && c.texto);
  t("sem escondido, não há desvio (o passo é o de sempre)", oCaminhoAlcancavel(falta, { escondido: () => false }) === null);
  t("todo verbo do caminho tem {nome}", Object.values(O_CAMINHO_ALCANCAVEL.verbos).every((v) => v.includes("{nome}")));
}

/* ============================================================ */
sec("2 · o destino lê a trava: a próxima perna que a lei deixa");
{
  /* a Torre da sessão: herói no Andar 1, «Ver o que resta de Passagem do Sino» no Andar 21 */
  const andares = Array.from({ length: 22 }, (_, i) => ({ nome: i === 0 ? "Andar 1 — do Sal" : i === 20 ? "Andar 21 — das Cinzas" : `Andar ${i + 1}`, z: i + 1 }));
  const mapa = { cidades: andares, rotas: [] };
  const passos = [{ quest: "o_ultimo_a_sair", etapa: "ver", texto: "Ver o que resta de Passagem do Sino", lugares: [{ nome: "Passagem do Sino", cidade: "Andar 21 — das Cinzas" }], candidatos: { pessoa: [], lugar: [], item: [] }, quem: [] }];
  const base = { passos, aqui: "", cidade: "Andar 1 — do Sal", grupo: [], presentes: [] };
  const antes = oRumoDaBusca(base);
  t("sem a trava (o de antes), o botão manda ao Andar 21 — e a lei não deixa", !!antes && antes.acao === "partir" && !!travaDaPartida({ molde: "torre", semente: "s", mapa, forma: { vencidos: { "Andar 1 — do Sal": true } }, de: base.cidade, para: antes.nome }));
  const aberto = { molde: "torre", semente: "s", mapa, forma: { vencidos: { "Andar 1 — do Sal": true } }, genero: "", dia: 3 };
  const r1 = oRumoDaBusca({ ...base, partida: aberto });
  t("com o portal daqui aberto, o botão é subir ao andar seguinte", !!r1 && r1.acao === "partir" && r1.nome === "Andar 2" && r1.rumo === "Andar 21 — das Cinzas", JSON.stringify(r1));
  t("…e esse botão a lei deixa", !travaDaPartida({ ...aberto, de: base.cidade, para: r1.nome }));
  const p1 = aPonteDoPasso({ ...base, partida: aberto });
  t("a ponte diz a perna e para onde ela leva", p1.includes("Andar 2") && p1.includes("Andar 21") && p1.length <= A_PONTE_DO_PASSO.teto, p1);
  const fechado = { ...aberto, forma: null };
  const r2 = oRumoDaBusca({ ...base, partida: fechado });
  t("com o guardião vivo, o botão é enfrentá-lo (é ele o caminho)", !!r2 && r2.acao === "guardiao" && r2.frase.includes(r2.nome), JSON.stringify(r2));
  const p2 = aPonteDoPasso({ ...base, partida: fechado });
  t("…e o Narrador sabe que o caminho para cima passa por ele", p2.includes("guarda a passagem") && p2.includes("Andar 21"), p2);
  t("descer é livre: o andar de baixo é o próprio destino", proximaPerna({ ...fechado, de: "Andar 21 — das Cinzas", para: "Andar 2" }).livre === true);
  /* a rota de salto: o primeiro salto do caminho mais curto */
  const est = { cidades: [{ nome: "A" }, { nome: "B" }, { nome: "C" }, { nome: "D" }], rotas: [{ de: "A", para: "B" }, { de: "B", para: "C" }, { de: "C", para: "D" }] };
  const pe = proximaPerna({ molde: "estelar", semente: "s", mapa: est, de: "A", para: "D" });
  t("no Braço Estelar, o primeiro salto do caminho até o destino", !!pe && pe.perna === "B" && pe.destino === "D", JSON.stringify(pe));
  const ilha = { cidades: [{ nome: "A" }, { nome: "B" }, { nome: "Z" }], rotas: [{ de: "A", para: "B" }] };
  t("sem caminho nenhum, nenhum botão (um botão que não leva a lugar nenhum não aparece)", oRumoDaBusca({ passos: [{ lugares: [{ nome: "Doca", cidade: "Z" }] }], cidade: "A", partida: { molde: "estelar", semente: "s", mapa: ilha } }) === null);
}

sec("2b · A CATRACA: em campanhas de todos os moldes, nenhum botão morto");
{
  const ESP = ESTRUTURAS.filter((e) => e.espinha).map((e) => e.id);
  const POR_MOLDE = 24;
  const ligadas = (mapa, de, para) => {
    const vistos = new Set([norm(de)]), fila = [de];
    const viz = (n) => (mapa.rotas || []).flatMap((r) => (norm(r.de) === norm(n) ? [r.para] : norm(r.para) === norm(n) ? [r.de] : []));
    for (let i = 0; i < fila.length; i++) for (const v of viz(fila[i])) if (!vistos.has(norm(v))) { vistos.add(norm(v)); fila.push(v); }
    return vistos.has(norm(para));
  };
  const linhas = [];
  let mortosAntes = 0, mortosDepois = 0, semBotao = 0, total = 0, isoladas = 0;
  for (const molde of MOLDES) {
    let q = 0, ma = 0, md = 0;
    for (let i = 0; i < POR_MOLDE; i++) {
      const semente = `Perna|${molde.id}|${i}`;
      const mapa = gerarGeografia(semente, molde, null);
      let espinha, esq;
      try {
        espinha = estenderEspinha({ semente, mapa, estrutura: ESP[i % ESP.length], cidadeInicial: mapa.cidades[0].nome, antecedente: "", dia: 1 });
        const nucleo = nucleoDaCampanha(semente, mapa, { espinha, antecedente: "", grupo: [] });
        esq = esqueletoDaCampanha({ semente, mapa, espinha, antecedente: "", nucleo, chefes: chefesDoMundo(semente, mapa), molde });
      } catch { esq = null; }
      if (!esq) continue;
      for (const a of esq.atos) {
        if (!a.quest || a.ato < 1) continue;
        /* o herói ainda na cidade do ato de antes, quando a quest nova abre */
        const de = (esq.atos.find((x) => x.ato === a.ato - 1) || {}).cidade || mapa.cidades[0].nome;
        let E = { nomeCampanha: "p", mundo: { genero: "", molde: molde.id }, espinha: comOEsqueleto(espinha, esq), historia: garantirHistoria({ estrutura: esq.estrutura, etapa: a.ato }), mapa, cidadeAtual: de, lugar: null, jornada: null, personagem: { nome: "W", grupo: [], inventario: [] }, npcs: {}, dia: 1, minuto: 600, npcTurno: 0, factos: garantirFactos(null) };
        const r = oTurnoDasQuests(E, { mundo: { semente } });
        if (r) E = { ...E, ...r.estado };
        const passos = osPassosDasQuests(E, { mundo: { semente } });
        if (!passos.length) continue;
        for (const venc of [false, true]) {
          const partida = { molde: molde.id, semente, mapa, forma: venc ? { vencidos: { [de]: true } } : null, genero: "", dia: 1 + i };
          const morto = (x) => !!x && x.acao === "partir" && !!travaDaPartida({ ...partida, de, para: x.nome });
          const e = { passos, aqui: "", cidade: de, grupo: [], presentes: [] };
          total++; q++;
          if (morto(oRumoDaBusca(e))) { mortosAntes++; ma++; }
          const d = oRumoDaBusca({ ...e, partida });
          if (morto(d)) { mortosDepois++; md++; }
          if (!d) {
            /* sem botão: só vale quando o mapa da semente não liga as duas cidades */
            const destino = (passos[0].lugares[0] || {}).cidade || (passos[0].candidatos.pessoa[0] || {}).cidade || "";
            if (molde.lei && molde.lei.id !== "guardiao" && destino && !ligadas(mapa, de, destino)) isoladas++;
            else { semBotao++; if (semBotao <= 4) console.log(`      sem botão: ${semente} ${de} → ${destino} ${JSON.stringify(proximaPerna({ ...partida, de, para: destino }))}`); }
          }
        }
      }
    }
    linhas.push(`${molde.id}: ${q} (mortos ${ma} → ${md})`);
  }
  console.log("      " + linhas.join(" · ") + ` · isoladas pelo mapa: ${isoladas}`);
  t(`${total} quests abertas de ato ≥ 1 (${MOLDES.length} moldes × ${POR_MOLDE} campanhas × 2 estados do portal)`, total >= MOLDES.length * POR_MOLDE);
  t("antes: havia botões que a lei não deixava seguir (a prova de que a catraca morde)", mortosAntes > 0, String(mortosAntes));
  t("depois: nenhum botão morto", mortosDepois === 0, String(mortosDepois));
  t("toda quest cujo destino o mapa alcança tem um botão", semBotao === 0, String(semBotao));
}

/* ============================================================ */
sec("3 · o teste de troca não vira carta de consulta");
{
  /* o passo 2 («Saber quem da guarda come da mão de…») com só o passo 1 feito */
  const S = estadoS17(true);
  const R0 = S.espinha.quests.registos[0];
  const S2 = { ...S, espinha: { ...S.espinha, quests: { ...S.espinha.quests, registos: [{ ...R0, feitas: { chaves: R0.feitas.chaves }, acesas: { chaves: 1, ronda: 1 } }] } } };
  const quadros = osQuadrosDoEstado(S2, { mundo: S2.mundo });
  const HILDA = "Hilda Passo-de-Gato";
  const temCarta = quadros.some((q) => (q.cartas || []).some((c) => c.forma === "pessoa" && c.juiz && c.juiz.nome === HILDA && c.viravel));
  t("o passo 2 tem a carta de consultar a sargento, virável", temCarta);
  const onde = { cidade: CID, emCena: [HILDA] };
  const teste = (frase, passou = false) => aCartaDoTeste(quadros, { id: "convencer", passou, total: 13, dc: 16, quem: HILDA, frase }, onde);
  t("pedir um mapa emprestado à sargento (Persuasão, falhou) não vira a carta", teste("Peço emprestado o mapa à Hilda, por favor.") === null);
  t("pedir de graça uma coisa também não", teste("Peço a corda de graça à Hilda.", true) === null);
  t("comprar uma coisa dela também não", teste("Compro o mapa da Hilda.", true) === null);
  t("tomar uma coisa da mão dela também não", aCartaDoTeste(quadros, { id: "forcar", passou: true, total: 18, dc: 12, quem: HILDA, frase: "Tomo a lanterna da mão da Hilda." }, onde) === null);
  const certo = teste("Convenço a Hilda a me contar quem da guarda recebe por fora.", true);
  t("convencê-la a falar do caso continua a virar a carta", !!certo && certo.caminho === "falar", JSON.stringify(certo));
  t("as âncoras abertas continuam a pedir o assunto (a tabela de antes)", J(CARTA_DO_TESTE.assunto) === J(["cidade", "nenhuma"]) && CARTA_DO_TESTE.trocaQueNaoConsulta.includes("deGraca"));
}

/* ============================================================ */
sec("4 · quem do elenco está noutro sítio desta cidade (com o Mestre vivo)");
{
  const QUARTEL = "O Quartel do Degrau", FEIRA = "A Feira";
  const npcs = { "Brannoc Filho da Névoa": { nome: "Brannoc Filho da Névoa", papel: "catador de espólios", local: `${QUARTEL}, em ${CID}`, conhecidoEm: 1, status: "vivo", relacao: "neutro" } };
  const gente = [{ nome: "Brannoc Filho da Névoa", papel: "catador de espólios", local: QUARTEL }, { nome: "Jora Vento-Cinza", papel: "vendedora", local: FEIRA }];
  const lugares = [{ nome: QUARTEL }, { nome: FEIRA }];
  const mapa = { cidades: [{ nome: CID, x: 0, y: 0 }], rotas: [] };
  const base = { npcs, cidadeAtual: CID, mapa, personagem: { nome: "Osric", grupo: [{ nome: "Loras" }] }, lugares, gente };
  /* as frases 1 a 4: o herói sem sítio */
  const qRua = quemEstaAqui({ ...base, lugar: null });
  t("sem sítio, quemEstaAqui deixa Brannoc «aqui» (a tela segue igual)", qRua.aqui.some((n) => /Brannoc/.test(n.nome)));
  const noutro = quemEstaNoutroSitio(qRua, { gente, lugares });
  t("…mas ele tem posto no quartel: está noutro sítio daqui", noutro.length === 1 && /Brannoc/.test(noutro[0].nome) && noutro[0].onde === QUARTEL, J(noutro));
  const semChave = osAusentes(qRua, { gente, npcs, heroi: { nome: "Osric" } });
  t("sem a chave do Mestre vivo, a poda é a de sempre (Brannoc não é ausente)", !semChave.some((a) => /Brannoc/.test(a.nome)));
  const comChave = osAusentes(qRua, { gente, npcs, heroi: { nome: "Osric" }, lugares, tambemSemSitio: true });
  const b = comChave.find((a) => /Brannoc/.test(a.nome));
  t("com a chave, sem sítio, Brannoc é ausente, com o posto", !!b && b.sitio === true && b.onde === QUARTEL, J(comChave));
  const prosa = "A rua cheira a sal e a corda molhada, e as lonas das bancas estalam ao vento que sobe do vão. Brannoc se aproxima e diz que a carroça parte ao anoitecer. Um cão magro atravessa a praça atrás de restos, e ninguém olha duas vezes para o Tiefling de capa escura.";
  const pod = podarOAusente(prosa, comChave, { frase: "Olho em volta." });
  t("a poda tira a frase em que ele age, com o herói sem sítio", pod.podadas.some((p) => /Brannoc/.test(p.nome)) && !/Brannoc/.test(pod.narrativa), J(pod));
  const linha = pautaDosAusentesDaHistoria(comChave, [], []);
  t("o Narrador recebe onde ele está, e não aqui", !!linha && /Brannoc aparecer ou falar aqui: está no Quartel do Degrau/.test(linha.naoPode[0]), linha && linha.naoPode[0]);
  /* o herói num sítio (a Feira): o longe de dias 0 já existia; a linha diz o posto */
  const qFeira = quemEstaAqui({ ...base, lugar: { nome: FEIRA, cidade: CID } });
  const comChaveF = osAusentes(qFeira, { gente, npcs, heroi: { nome: "Osric" }, lugares, tambemSemSitio: true });
  const lf = pautaDosAusentesDaHistoria(comChaveF, [], []);
  t("na Feira, a linha diz que Brannoc está no quartel", !!lf && /no Quartel do Degrau/.test(lf.naoPode[0]), lf && lf.naoPode[0]);
  const semChaveF = osAusentes(qFeira, { gente, npcs, heroi: { nome: "Osric" } });
  t("sem a chave, a linha é a de sempre (só a gente da história, «noutro lugar»)", pautaDosAusentesDaHistoria(semChaveF, [], []) === null
    && /noutro lugar/.test(pautaDosAusentesDaHistoria(semChaveF, ["Brannoc"], []).naoPode[0]));
  /* o pior caso: a linha com o sítio nunca passa do pior caso da de sempre */
  const G = A_GENTE_DA_HISTORIA_LONGE;
  const doze = "Abcdefghijkl", doze2 = "Mnopqrstuvwx";
  const piorDeSempre = G.naoPodeVarios.replace("{lista}", `${doze} e ${doze2}`).length;
  t(`o teto da linha com o sítio (${G.letras}) não passa do pior caso da de sempre (${piorDeSempre})`, G.letras <= piorDeSempre);
  const longos = [{ nome: `${doze} X`, onde: "A Grande Casa de Contagem do Porto Velho", sitio: true }, { nome: `${doze2} Y`, onde: "O Pátio das Trocas de Pedra Antiga", sitio: true }];
  const lpior = pautaDosAusentesDaHistoria(longos, [], []).naoPode[0];
  t("com sítios de nome comprido, a linha volta à de sempre (não cresce)", lpior.length <= piorDeSempre && /noutro lugar/.test(lpior), lpior);
}

/* ============================================================ */
console.log(`\na história depois da 17: ${ok} passaram, ${mal} falharam`);
if (mal) process.exit(1);
