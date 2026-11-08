/* ============================================================
   AS QUATRO CONSEQUÊNCIAS CALADAS (09/11/2026, Fase BQ) —
   testes/teste-consequencias-caladas.mjs

   A pessoa, 09/11: terminar as quatro consequências que o motor das quests
   devolvia e o jogo não sabia guardar (o diário de 08/11, «v9.625 ·
   BQ7b»). Cada uma prova-se pelos três lados da lei da casa: ALGUÉM
   ESCREVE, ALGUÉM LÊ, e O REPLAY É IGUAL.

     §1 as tabelas: quem aplica cada uma, e o que ainda cala (com motivo);
     §2 o favor — o motor escreve-o no livro, a condição «deve_favor» e a
        pauta (ONDE) leem-no quando o herói está no lugar;
     §3 o QUEM É — a linha durável no livro, que o Cronista não reescreve,
        com teto; a pauta junta-a à ficha de quem está em cena;
     §4 o relógio da região — os relógios do mundo a agir, e o tiquear de
        sempre (relogios.js) aplica a ordem;
     §5 o plano do vilão — o passo traz a obra ao Narrador, cada coisa que
        muda tem órgão ou motivo, e a postura vira para a Sombra;
     §6 o replay igual, o lixo, a imutabilidade e o determinismo.
   ============================================================ */
import { QUESTS_DO_TURNO, garantirQuestsDaEspinha, oTurnoDasQuests, aMesaDasQuests } from "../src/motor/quests-do-turno.js";
import { EFEITOS_NA_TELA, RELOGIOS_DA_REGIAO, MUDA_DO_PLANO, POSTURA_DO_PLANO, oQueOEfeitoPede, leiturasDoPlano } from "../src/motor/efeitos-da-quest.js";
import { esqueletoDaCampanha, comOEsqueleto } from "../src/esqueleto.js";
import { BIBLIOTECA_DE_QUESTS, EFEITOS_DA_QUEST } from "../src/biblioteca-de-quests.js";
import { EFEITOS_DO_PLANO, fichaDoVilao } from "../src/plano-do-vilao.js";
import { garantirHistoria } from "../src/historia.js";
import { gerarGeografia } from "../src/geografia.js";
import { estenderEspinha } from "../src/saga.js";
import { nucleoDaCampanha, quemEParaPauta, QUEM_E } from "../src/nucleo.js";
import { chefesDoMundo } from "../src/mundo-base.js";
import { LIVRO_DE_FACTOS, garantirFactos, anotarTurno, deveFavor, favoresDoLivro, linhasDoQuemE } from "../src/livro-de-factos.js";
import { anotarOLivro } from "../src/motor/livro-do-turno.js";
import { CONDICOES, avaliarCondicao } from "../src/condicoes-da-quest.js";
import { PASSOS_DO_REPLAY } from "../src/sessao.js";
import { TIPOS, avancar } from "../src/relogios.js";
import { osVinculos } from "../src/motor/combate-do-turno.js";
import { posturaCrua } from "../src/posturas.js";
import { aPautaDoTurno } from "../src/motor/pauta-do-turno.js";
import { textoDaPauta } from "../src/pauta.js";
import { rngDe } from "../src/geografia.js";

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);
const congelar = (x) => { if (x && typeof x === "object" && !Object.isFrozen(x)) { Object.freeze(x); Object.values(x).forEach(congelar); } return x; };

/* ---------------- um mundo novo, como a criação o faz (o de teste-bq7-motor) ---------------- */
const DA_PLANTA = BIBLIOTECA_DE_QUESTS.filter((q) => ["o_salvo_conduto", "as_cinzas_de_ontem", "a_carta_que_nao_se_abre"].includes(q.id));
function mundoNovo(semente) {
  const estrutura = "jornada", antecedente = "soldado";
  const mapa = gerarGeografia(semente, null, null);
  const espinha0 = estenderEspinha({ semente, mapa, estrutura, cidadeInicial: mapa.cidades[0].nome, antecedente, dia: 1 });
  const nucleo = nucleoDaCampanha(semente, mapa, { espinha: espinha0, antecedente, grupo: [] });
  const esq = esqueletoDaCampanha({ semente, mapa, espinha: espinha0, antecedente, nucleo, chefes: chefesDoMundo(semente, mapa), catalogo: DA_PLANTA });
  const espinha = comOEsqueleto(espinha0, esq);
  return {
    semente, mundo: { semente },
    estado: {
      espinha, historia: garantirHistoria({ estrutura, etapa: 0 }), mapa,
      cidadeAtual: mapa.cidades[0].nome, lugar: null, jornada: null,
      personagem: { nome: "Vera", grupo: [], inventario: [], moedas: 100 },
      npcs: {}, canone: {}, factos: garantirFactos(null), saber: [], dia: 1, npcTurno: 0,
    },
  };
}
const W = mundoNovo("BQ7|0");
const turno = (E) => { const r = oTurnoDasQuests(E, { mundo: W.mundo }); return { E: r ? { ...E, ...r.estado } : E, r }; };
const { E: E1 } = turno(W.estado);
const Q1 = garantirQuestsDaEspinha(E1.espinha.quests);
const SC = Q1.registos.find((r) => r.id === "o_salvo_conduto");
/* uma consequência que traz o favor e o QUEM É, posta no registo como o
   avançar da quest a poria (a lista do registo só cresce) */
const comConsequencia = (E, efeitos) => {
  const Q = garantirQuestsDaEspinha(E.espinha.quests);
  const registos = Q.registos.map((r) => (r.id === "o_salvo_conduto" ? { ...r, consequencias: [...(r.consequencias || []), { de: "fecho", efeitos }] } : r));
  return { ...E, espinha: { ...E.espinha, quests: { ...Q, registos } } };
};
const guarda = SC && SC.papeis.guarda;
const lugarDoFavor = SC && SC.papeis.passo;
const N = (nome, local) => ({ nome, conhecidoEm: 1, local, relacao: "neutro", status: "vivo", consultas: 0 });

sec("§1 as tabelas: quem aplica cada uma, e o que ainda cala");
{
  const T = QUESTS_DO_TURNO;
  t("o favor e o QUEM É aplica-os o motor (vão ao livro de factos, o replay reprodu-los)", T.aplica.includes("favor") && T.aplica.includes("quem_e"));
  t("o relógio da região e os dois do plano têm órgão na tela", ["relogio_regional", "passo_do_plano", "fim_do_plano"].every((k) => typeof EFEITOS_NA_TELA.orgao[k] === "string"));
  t("e nada mais cala inteiro (a tabela dos calados está vazia)", Object.keys(EFEITOS_NA_TELA.calado).length === 0);
  const ks = Object.keys(EFEITOS_DO_PLANO);
  t("cada coisa que um passo muda tem órgão ou motivo para calar — e só um dos dois", J(Object.keys(MUDA_DO_PLANO).sort()) === J([...ks].sort()) && ks.every((k) => !!MUDA_DO_PLANO[k].orgao !== !!MUDA_DO_PLANO[k].calado));
  t("todo motivo diz porquê (não é um «sem órgão» seco)", ks.filter((k) => MUDA_DO_PLANO[k].calado).every((k) => MUDA_DO_PLANO[k].calado.length > 40));
  t("ligados: o relógio, a relação (pelo «amado») e a postura; calados: base, porta, estrada, perigo, cativeiro",
    J(ks.filter((k) => MUDA_DO_PLANO[k].orgao).sort()) === J(["postura", "relacao", "relogio"]) && J(ks.filter((k) => MUDA_DO_PLANO[k].calado).sort()) === J(["base", "cativeiro", "estrada", "perigo", "porta"]));
  t("os relógios da região são de tipos que existem, e só os que enchem com o tempo", RELOGIOS_DA_REGIAO.tipos.every((k) => TIPOS[k]) && !RELOGIOS_DA_REGIAO.tipos.includes("oportunidade") && !RELOGIOS_DA_REGIAO.tipos.includes("obra"));
  t("o prazo de uma missão, o bando de uma fuga e o rebate ficam fora", J(RELOGIOS_DA_REGIAO.fora) === J(["missao:", "fuga:", "sino"]));
  const linhas = BIBLIOTECA_DE_QUESTS.flatMap((q) => JSON.stringify(q).match(/"tipo":"quem_e","papel":"[a-z0-9_]+","linha":"[^"]*"/g) || []).map((s) => s.replace(/^.*"linha":"/, "").replace(/"$/, ""));
  t("o teto da linha do QUEM É no livro cabe a mais longa do acervo", linhas.length > 10 && linhas.every((l) => l.length <= LIVRO_DE_FACTOS.quemE.linha), String(Math.max(...linhas.map((l) => l.length))));
  t("o livro guarda poucas por pessoa e tem um teto no todo", LIVRO_DE_FACTOS.quemE.porPessoa >= 1 && LIVRO_DE_FACTOS.quemE.total >= LIVRO_DE_FACTOS.quemE.porPessoa);
  t("a condição «deve_favor» é ativa, lê o livro e diz quem o escreve", !CONDICOES.deve_favor.reservado && CONDICOES.deve_favor.facto === "favor" && CONDICOES.deve_favor.portas.length === 1);
  t("o efeito «favor» das quests é sempre de um lugar", EFEITOS_DA_QUEST.favor.campos.papel === "lugar");
  t("a postura do plano: a Sombra é a fase da mão (posturas.js: «faseVilao ≥ 2»)", POSTURA_DO_PLANO.faseMinima === 2 && POSTURA_DO_PLANO.muda === "postura");
}

sec("§2 o favor: o motor escreve, a condição e a pauta leem");
{
  t("o mundo de prova tem o Salvo-Conduto aberto, com um lugar e uma pessoa por papel", !!SC && !!lugarDoFavor && !!lugarDoFavor.id && !!guarda && !!guarda.nome);
  const E = comConsequencia(E1, [{ tipo: "favor", papel: "passo" }]);
  const { E: E2, r } = turno(E);
  t("o turno escreve o favor no livro de factos (o estado devolve os factos)", !!r.estado.factos && deveFavor(E2.factos, lugarDoFavor.id));
  t("com o dia e a quest que o deixou", J(favoresDoLivro(E2.factos).map((f) => [f.id, f.de])) === J([[lugarDoFavor.id, "o_salvo_conduto"]]));
  t("e não vai à tela nenhum efeito «favor» (já não cala)", !r.efeitos.some((x) => x.tipo === "favor"));
  const de2 = turno(E2);
  t("chamar outra vez não escreve duas vezes", !de2.r.estado.factos && J(de2.E.factos) === J(E2.factos));
  const ctx = (E) => ({ estado: E, papeis: { l: { tipo: "lugar", ...lugarDoFavor } }, mundo: W.mundo });
  t("a condição «deve_favor» fecha com ele, e não sem ele", avaliarCondicao(["deve_favor", "lugar:l"], ctx(E2)) && !avaliarCondicao(["deve_favor", "lugar:l"], ctx(E1)));
  const longe = aMesaDasQuests(E2, { mundo: W.mundo });
  t("a mesa das quests cala o favor com o herói longe do lugar", !!longe && longe.favor === "");
  const ali = { ...E2, cidadeAtual: lugarDoFavor.cidade, lugar: { nome: lugarDoFavor.nome, cidade: lugarDoFavor.cidade, id: lugarDoFavor.id } };
  const m = aMesaDasQuests(ali, { mundo: W.mundo });
  t("e di-lo com o herói lá, com o nome do lugar e a quest", !!m && m.favor.includes(lugarDoFavor.nome) && m.favor.includes("O Salvo-Conduto") && m.favor.length <= QUESTS_DO_TURNO.favor.teto, m && m.favor);
  const pt = textoDaPauta(aPautaDoTurno({ ...ali, render: { personagem: ali.personagem }, mensagens: [] }, { frase: "olho em volta", sorte: rngDe("p") }, {}).pauta);
  t("a pauta do turno leva-o, em O QUE VOLTA (o que se plantou antes, de volta)", pt.includes(m.favor) && /O QUE VOLTA +[^\n]*deve um favor ao herói/.test(pt), pt);
  const ptLonge = textoDaPauta(aPautaDoTurno({ ...E2, render: { personagem: E2.personagem }, mensagens: [] }, { frase: "olho em volta", sorte: rngDe("p") }, {}).pauta);
  t("e não o leva com o herói longe", !ptLonge.includes("deve um favor ao herói"));
  t("o favor sem livro não nasce (um estado sem livro continua sem ele)", !turno({ ...E, factos: undefined }).r.estado.factos);
}

sec("§3 o QUEM É: a linha durável, com teto, que o Cronista não reescreve");
{
  const linha = "guarda a porta de {origem}, e conta quem passa";
  const E = comConsequencia({ ...E1, npcs: { [guarda.nome]: N(guarda.nome, guarda.cidade) } }, [{ tipo: "quem_e", papel: "guarda", linha }]);
  const { E: E2, r } = turno(E);
  const id = `npc|${guarda.nome}`;
  const esperada = linha.replace("{origem}", SC.papeis.origem.nome);
  t("a pessoa sem id quando a quest abriu ganha-o agora, pela mesma régua (o registo já a conhece)", !guarda.id && !!E2.factos.pessoas[id]);
  t("o turno escreve a linha, com os papéis preenchidos", J((E2.factos.pessoas[id] || {}).quemE) === J([{ o: esperada, dia: E.dia, de: "o_salvo_conduto" }]), J(E2.factos.pessoas[id]));
  t("e nenhum efeito «quem_e» vai à tela", !r.efeitos.some((x) => x.tipo === "quem_e"));
  t("linhasDoQuemE dá-a com o nome", J(linhasDoQuemE(E2.factos)) === J([{ id, nome: guarda.nome, linhas: [esperada] }]));
  const semRegisto = turno(comConsequencia(E1, [{ tipo: "quem_e", papel: "guarda", linha }]));
  t("quem ninguém conhece não se escreve (o livro guarda ids, e não se adivinha)", !semRegisto.r.estado.factos);
  /* o Cronista escreve no livro pela porta de sempre: a linha fica */
  const depois = anotarOLivro(E2, { tipo: "factos", dia: 3, turno: 40, falouCom: [guarda.nome], nomeados: [guarda.nome] }).factos;
  t("o Cronista escreve depois (a conversa) e a linha fica", J(depois.pessoas[id].quemE) === J(E2.factos.pessoas[id].quemE) && !!depois.pessoas[id].falou);
  /* a pauta: a gente de fora do núcleo, em cena, leva a linha sozinha */
  const q = quemEParaPauta({ pessoas: [] }, { emCena: [guarda.nome], turno: 20, duraveis: linhasDoQuemE(E2.factos) });
  t("a QUEM É de quem está em cena leva a linha durável", J(q.quemE) === J([`${guarda.nome} ${esperada}.`]) && q.quem === guarda.nome, J(q));
  const qN = quemEParaPauta({ pessoas: [{ nome: guarda.nome, papel: "elo", ficha: { quer: { o: "ver a irmã outra vez" } } }] }, { emCena: [guarda.nome], turno: 20, duraveis: linhasDoQuemE(E2.factos) });
  t("a de quem é do núcleo vem logo a seguir à ficha, numa linha sua", qN.quemE.length === 2 && qN.quemE[1] === `${guarda.nome} ${esperada}.`, J(qN));
  t("e respeita o intervalo da ficha (QUEM_E.intervalo)", quemEParaPauta({ pessoas: [] }, { emCena: [guarda.nome], turno: 20, ultimas: { [guarda.nome]: 18 }, duraveis: linhasDoQuemE(E2.factos) }).quemE.length === 0);
  t("nunca diz uma palavra de bastidor", quemEParaPauta({ pessoas: [] }, { emCena: ["Ana"], turno: 20, duraveis: [{ nome: "Ana", linhas: ["fala da pista que ninguém viu"] }] }).quemE.length === 0);
  const pautaEm = (cidade) => textoDaPauta(aPautaDoTurno({ ...E2, cidadeAtual: cidade, render: { personagem: E2.personagem }, mensagens: [{ autor: "mestre", texto: `${guarda.nome} olha-te da porta.` }] }, { frase: "olho em volta", sorte: rngDe("p") }, {}).pauta);
  t("a pauta do turno leva-a quando a pessoa está em cena (citada pelo Mestre, na cidade dela)", pautaEm(guarda.cidade).includes(`${guarda.nome} ${esperada}.`), pautaEm(guarda.cidade));
  t("e não a leva com a pessoa a dias de estrada, por mais que a prosa a cite (LONGE_DA_HISTORIA)", !pautaEm(E2.mapa.cidades.find((c) => c.nome !== guarda.cidade).nome).includes(esperada));
  /* o teto: por pessoa as mais recentes; no livro, o total */
  let L = garantirFactos(null);
  for (let i = 0; i < 4; i++) L = anotarTurno(L, { dia: i, quemE: [{ quem: "npc|Ana", o: `linha ${i}`, de: "q" }] }).factos;
  t(`por pessoa ficam as ${LIVRO_DE_FACTOS.quemE.porPessoa} mais recentes`, J(L.pessoas["npc|Ana"].quemE.map((x) => x.o)) === J(["linha 2", "linha 3"]));
  L = anotarTurno(L, { dia: 9, quemE: [{ quem: "npc|Ana", o: "linha 3", de: "q" }] }).factos;
  t("a mesma linha não entra duas vezes", L.pessoas["npc|Ana"].quemE.length === 2);
  let G = garantirFactos(null);
  for (let i = 0; i < 30; i++) G = anotarTurno(G, { dia: i, quemE: [{ quem: `npc|P${String(i).padStart(2, "0")}`, o: `linha de P${i}`, de: "q" }] }).factos;
  const total = Object.values(G.pessoas).reduce((n, p) => n + (p.quemE || []).length, 0);
  t(`no livro inteiro nunca mais de ${LIVRO_DE_FACTOS.quemE.total} (sai a mais velha)`, total === LIVRO_DE_FACTOS.quemE.total && !G.pessoas["npc|P00"] && !!G.pessoas["npc|P29"]);
  t("a linha longa corta-se no teto", anotarTurno(null, { quemE: [{ quem: "npc|Ana", o: "x".repeat(300) }] }).factos.pessoas["npc|Ana"].quemE[0].o.length === LIVRO_DE_FACTOS.quemE.linha);
  t("o save volta igual (garantirFactos guarda o favor e o QUEM É)", J(garantirFactos(JSON.parse(J(E2.factos)))) === J(garantirFactos(E2.factos)) && !!garantirFactos(JSON.parse(J(E2.factos))).pessoas[id].quemE);
}

sec("§4 o relógio da região: os do mundo a agir, pelo tiquear de sempre");
{
  const R = (id, tipo, segmentos, cheios, fonte) => ({ id, nome: "R " + id, tipo, segmentos, cheios, gatilho: "noite", fonte });
  const rel = [R("a", "ameaca", 6, 2, "mestre:a"), R("b", "ameaca", 4, 1, "missao:m1"), R("c", "obra", 6, 1, "x"), R("d", "cacada", 4, 3, "nemesis"), R("e", "cacada", 4, 1, "fuga:perseguicao"), R("f", "oportunidade", 6, 0, "x"), R("g", "ameaca", 4, 2, "sino"), { nome: "sem id", tipo: "ameaca", segmentos: 6, cheios: 0 }];
  const E = { relogios: rel };
  const o = oQueOEfeitoPede({ tipo: "relogio_regional", quest: "q", n: 1, cidade: "X" }, E);
  t("anda o que é do mundo a agir (a ameaça e a caçada), e nada mais", J(o) === J([{ ordem: "relogios", ids: ["a", "d"], quanto: 1, porque: RELOGIOS_DA_REGIAO.porque.quest }]), J(o));
  const av = avancar(rel, null, { quanto: o[0].quanto, porque: o[0].porque, apenasIds: o[0].ids });
  t("e o tiquear de sempre aplica a ordem: o que anda, a causa visível, o que encheu", J(av.avancados.map((x) => [x.relogio.id, x.para])) === J([["a", 3], ["d", 4]]) && av.cheios.length === 1 && av.cheios[0].id === "d" && av.avancados.every((x) => x.porque === RELOGIOS_DA_REGIAO.porque.quest));
  t("n de dois anda dois", oQueOEfeitoPede({ tipo: "relogio_regional", n: 2 }, E)[0].quanto === 2);
  t("n nenhum, zero ou negativo: nada", [undefined, 0, -1].every((n) => oQueOEfeitoPede({ tipo: "relogio_regional", n }, E).length === 0));
  t("sem relógios em jogo: nada (nenhum nasce)", oQueOEfeitoPede({ tipo: "relogio_regional", n: 1 }, {}).length === 0 && oQueOEfeitoPede({ tipo: "relogio_regional", n: 1 }, { relogios: "x" }).length === 0);
  t("o acervo pede-o (há quests que o trazem)", BIBLIOTECA_DE_QUESTS.some((q) => JSON.stringify(q).includes('"tipo":"relogio_regional"')));
}

sec("§5 o plano do vilão: o passo sente-se, cada coisa pelo seu órgão");
{
  const { r } = turno({ ...E1, dia: 60 });
  const passos = r.efeitos.filter((x) => x.tipo === "passo_do_plano");
  const fimEf = r.efeitos.find((x) => x.tipo === "fim_do_plano");
  const f = fichaDoVilao(E1.espinha);
  t("os passos cumpridos chegam como efeito, com o lugar do passo e a obra", passos.length === 6 && passos.every((p) => p.obra === f.plano[p.n - 1].obra && p.lugar && p.lugar.nome));
  t("e a obra mais recente vai ao Narrador como facto longe (o fim à frente de tudo)", r.notas.some((n) => n.startsWith(QUESTS_DO_TURNO.notas.longe) && n.includes(f.fim.frase.slice(0, 30))));
  const soPasso = turno({ ...E1, dia: f.inicio + 8 }).r;
  const p1 = soPasso.efeitos.filter((x) => x.tipo === "passo_do_plano");
  t("sem o fim, a nota do vilão é a obra do último passo cumprido", p1.length >= 1 && soPasso.notas.some((n) => n === QUESTS_DO_TURNO.notas.longe + p1[p1.length - 1].obra.slice(0, QUESTS_DO_TURNO.notas.teto) || n.startsWith(QUESTS_DO_TURNO.notas.longe + p1[p1.length - 1].obra.slice(0, 40))), J(soPasso.notas));
  t("o fim traz a frase", !!fimEf && fimEf.frase === f.fim.frase);
  /* cada coisa que muda */
  const rel = [{ id: "a", nome: "A cheia", tipo: "ameaca", segmentos: 6, cheios: 2, gatilho: "noite", fonte: "mestre:a" }, { id: "b", nome: "O cerco", tipo: "cacada", segmentos: 4, cheios: 3, gatilho: "noite", fonte: "nemesis" }];
  const E = { relogios: rel, personagem: { grupo: [{ nome: "Brash", vinculo: 60 }] } };
  const todos = Object.keys(EFEITOS_DO_PLANO);
  const o = oQueOEfeitoPede({ tipo: "passo_do_plano", n: 2, muda: todos, obra: "a guarda nova chegou", alvo: { campo: "pessoas", nome: "brash", comoDoi: "x" } }, E);
  const calados = o.filter((x) => x.ordem === "calado");
  t("o que não tem órgão cala, um por um, com o motivo da tabela", J(calados.map((x) => x.tipo.split("·")[1]).sort()) === J(["base", "cativeiro", "estrada", "perigo", "porta"]) && calados.every((x) => x.motivo === MUDA_DO_PLANO[x.tipo.split("·")[1]].calado));
  const rr = o.find((x) => x.ordem === "relogios");
  t("o relógio: os da região andam um ponto, com a obra do passo por causa (o jogador vê-a)", !!rr && J(rr.ids) === J(["a", "b"]) && rr.quanto === RELOGIOS_DA_REGIAO.passo && rr.porque === "a guarda nova chegou");
  const vv = o.find((x) => x.ordem === "vinculo");
  t("a relação: o «amado» do grupo perde um grau (60 → 49, abaixo do marco de 50)", !!vv && vv.nome === "Brash" && vv.pontos === -11);
  t("e pelo órgão de sempre (osVinculos) o vínculo desce", osVinculos(E.personagem.grupo, vv.nome, vv.pontos).grupo[0].vinculo === 49);
  t("a postura não pede nada à tela (deriva-se)", !o.some((x) => x.tipo && x.tipo.endsWith("·postura")));
  const semAlvo = oQueOEfeitoPede({ tipo: "passo_do_plano", n: 2, muda: ["relacao"] }, E);
  t("a relação sem alvo de gente cala, com o motivo", semAlvo.length === 1 && semAlvo[0].ordem === "calado" && semAlvo[0].motivo === MUDA_DO_PLANO.relacao.semAlvo);
  t("o alvo que é um lugar não é gente: cala", oQueOEfeitoPede({ tipo: "passo_do_plano", muda: ["relacao"], alvo: { campo: "lugares", nome: "Brash" } }, E)[0].ordem === "calado");
  const fo = oQueOEfeitoPede({ tipo: "fim_do_plano", efeitos: ["relogio", "relacao"], frase: "a região paga" }, E);
  t("o fim: um relógio enche — o mais perto de encher — com a frase do fim", J(fo[0]) === J({ ordem: "relogios", ids: ["b"], quanto: 1, porque: "a região paga" }) && fo[1].ordem === "calado");
  /* a postura */
  const comPassos = (ns, camada, extra) => ({ ...E1.espinha, quests: { ...garantirQuestsDaEspinha(E1.espinha.quests), passos: ns, ...(extra || {}) }, fio: { ...E1.espinha.fio, vilao: { ...E1.espinha.fio.vilao, camada } } });
  const nPostura = f.plano.findIndex((p) => p.muda.includes("postura")) + 1;
  const nSem = f.plano.findIndex((p) => !p.muda.includes("postura")) + 1;
  t("o vilão de prova tem um passo que vira a postura e um que não", nPostura > 0 && nSem > 0);
  t("sem passo cumprido que a traga, o plano não toca na postura", leiturasDoPlano(comPassos([nSem], "rumor")) === null && leiturasDoPlano(comPassos([], "rumor")) === null);
  const l = leiturasDoPlano(comPassos([nPostura], "rumor"));
  t("com ele, a postura do mundo vira para a Sombra", J(l) === J({ faseVilao: 2, rostoCaiu: false, heroiAlvoDoVilao: false }) && posturaCrua(l).id === "sombra");
  const lr = leiturasDoPlano(comPassos([nPostura], "rosto"));
  t("com o rosto caído, a Sombra acaba (a régua da nemesis)", lr.rostoCaiu && posturaCrua(lr).id !== "sombra");
  const ln = leiturasDoPlano({ ...comPassos([nPostura], "marca"), fio: { ...E1.espinha.fio, vilao: { ...E1.espinha.fio.vilao, camada: "marca", nomeDoHeroi: { dia: 3, fonte: "viu" } } } });
  t("e ele a saber o nome do herói, é a Caçada", ln.heroiAlvoDoVilao && posturaCrua(ln).id === "cacada");
  const comFim = f.fim.efeitos.includes("postura");
  t("o fim com a postura vira-a também", !comFim || !!leiturasDoPlano(comPassos([], "rumor", { fim: 9 })));
  t("a campanha antiga (sem esqueleto) não tem leitura", leiturasDoPlano({ ...E1.espinha, esqueleto: null }) === null);
}

sec("§6 o replay igual, o lixo, a imutabilidade e o determinismo");
{
  const passo = PASSOS_DO_REPLAY.find((p) => p.passo === "as quests");
  const E = comConsequencia({ ...E1, npcs: { [guarda.nome]: N(guarda.nome, guarda.cidade) } }, [{ tipo: "favor", papel: "passo" }, { tipo: "quem_e", papel: "guarda", linha: "conta quem passa" }]);
  const nota = { tela: { linhas: [] } };
  const pelo = passo.faz(E, {}, { mundo: W.mundo }, nota);
  const r = oTurnoDasQuests(E, { mundo: W.mundo });
  t("o replay escreve o mesmo estado que o turno — com o favor e o QUEM É no livro", J({ ...E, ...r.estado }) === J(pelo) && deveFavor(pelo.factos, lugarDoFavor.id) && !!pelo.factos.pessoas[`npc|${guarda.nome}`].quemE);
  const r2 = oTurnoDasQuests(JSON.parse(J(E)), { mundo: W.mundo });
  t("a mesma semente dá o mesmo turno", J(r) === J(r2));
  const Ec = congelar(JSON.parse(J(E)));
  let lancou = false;
  try { oTurnoDasQuests(Ec, { mundo: W.mundo }); oQueOEfeitoPede({ tipo: "passo_do_plano", muda: ["relogio", "relacao"], alvo: { campo: "pessoas", nome: "x" } }, congelar({ relogios: [], personagem: { grupo: [] } })); } catch { lancou = true; }
  t("o estado congelado não lança (nada se muta)", !lancou);
  const lixo = [null, undefined, 3, "x", {}, [], { tipo: 4 }, { tipo: "passo_do_plano", muda: "x" }, { tipo: "fim_do_plano", efeitos: [null, 7, "inventado"] }, { tipo: "relogio_regional", n: "um" }];
  t("o lixo nunca lança, e devolve lista", lixo.every((x) => { try { return Array.isArray(oQueOEfeitoPede(x, null)) && Array.isArray(oQueOEfeitoPede(x, { relogios: null, personagem: null })); } catch { return false; } }));
  t("o efeito inventado no plano cala sem órgão", oQueOEfeitoPede({ tipo: "fim_do_plano", efeitos: ["inventado"] }, {})[0].motivo === EFEITOS_NA_TELA.semOrgao);
  t("leiturasDoPlano com lixo dá null", [null, 3, "x", {}, { esqueleto: 1 }].every((x) => leiturasDoPlano(x) === null));
  t("os leitores do livro com lixo dão o vazio", [null, 3, {}, { pessoas: "x", lugares: 1 }].every((x) => J(favoresDoLivro(x)) === "[]" && J(linhasDoQuemE(x)) === "[]" && deveFavor(x, "a") === false));
  t("anotarTurno com favores e QUEM É tortos não lança nem escreve", (() => { const f = anotarTurno(null, { favores: [null, 3, { lugar: null }, { lugar: {} }], quemE: [null, { quem: "" }, { quem: "npc|A", o: "" }] }).factos; return !Object.keys(f.pessoas).length && !Object.keys(f.lugares).length; })());
}

console.log(`\nas consequências caladas: ${bons} passaram, ${maus} falharam`);
if (maus) process.exit(1);
