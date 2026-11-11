/* A QUEST MANDA (11/11/2026, Fase MC · MC5) — src/a-quest-manda.js

   A 18.ª sessão: o passo mandava «descobrir o que o Largo esconde» e a
   busca no Largo dizia «aqui não há nada»; o passo mandava «seguir o rasto»
   e o oráculo do próprio sistema dizia «não há rastro». A prova da planta
   (mente/plano-o-mestre-chama-o-dado.md, §5, MC5):
   §1 a tabela: o passo no oráculo fala de perguntas que existem; a pista
      tem frase para cada alvo e cabe no teto;
   §2 TODAS as quests do catálogo com etapa `descobriu` ou de rasto: no
      lugar do passo, a busca acha; o oráculo não diz NÃO ao que o passo
      pede; e a condição fica ✓ sem o Cronista;
   §3 uma campanha nova de ponta a ponta (o esqueleto, o fim do turno, o
      passo que muda), e a antiga sem nada;
   §4 o oráculo: a resposta do passo vence um NÃO de antes, pela mesma
      chave do facto;
   §5 onde o herói está (o cómodo, a cidade, a outra cidade);
   §6 o livro: imutável, e só o achado do passo escreve;
   §7 o lixo não lança. */
import {
  O_PASSO_NO_ORACULO, PISTA_DO_PASSO,
  oPassoDaQuest, osPassosDasQuests, noLugarDoPasso, achadoDoPasso, pistaDoPassoAqui, oPassoNoOraculo, oLivroDoAchado,
} from "../src/a-quest-manda.js";
import { BIBLIOTECA_DE_QUESTS, abrirQuest, PAPEIS_DA_QUEST, questPorId, estadoDaQuest } from "../src/biblioteca-de-quests.js";
import { avaliarCondicao, julgarEtapa, CONDICOES } from "../src/condicoes-da-quest.js";
import { garantirFactos } from "../src/livro-de-factos.js";
import { perguntarPeloSistema, perguntaDoSistemaPorId, registrarFato } from "../src/oraculo.js";
import { garantirQuestsDaEspinha, oTurnoDasQuests } from "../src/motor/quests-do-turno.js";
import { esqueletoDaCampanha, comOEsqueleto } from "../src/esqueleto.js";
import { garantirHistoria } from "../src/historia.js";
import { gerarGeografia } from "../src/geografia.js";
import { estenderEspinha } from "../src/saga.js";
import { nucleoDaCampanha } from "../src/nucleo.js";
import { chefesDoMundo } from "../src/mundo-base.js";
import { anotarOLivro } from "../src/motor/livro-do-turno.js";

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);
const congelar = (o) => { if (o && typeof o === "object" && !Object.isFrozen(o)) { Object.freeze(o); Object.values(o).forEach(congelar); } return o; };
const tem = (c, p) => Array.isArray(c) && (c[0] === p || c.some((x) => tem(x, p)));

sec("§1 a tabela");
{
  const fora = Object.keys(O_PASSO_NO_ORACULO).filter((id) => !perguntaDoSistemaPorId(id));
  t("o passo no oráculo só fala de perguntas do sistema que existem", fora.length === 0, fora.join(", "));
  t("o rasto e a escuta, cada um com a sua régua e um SIM", O_PASSO_NO_ORACULO.haRastro.grau === "sim" && O_PASSO_NO_ORACULO.haOQueOuvir.grau === "sim");
  const faltam = ["rasto", "segredo"].flatMap((e) => [...PISTA_DO_PASSO.prioridade, "nada"].filter((k) => typeof PISTA_DO_PASSO[e][k] !== "string").map((k) => `${e}.${k}`));
  t("a pista tem frase para cada alvo e para o nada, nas duas espécies", faltam.length === 0, faltam.join(", "));
  const preds = Object.values(PISTA_DO_PASSO.alvos).flat().filter((p) => !CONDICOES[p]);
  t("os alvos da pista são predicados do vocabulário", preds.length === 0, preds.join(", "));
  t("a pista cabe no envelope do facto (≤ 200)", PISTA_DO_PASSO.teto > 0 && PISTA_DO_PASSO.teto <= 200);
  t("a porta do sistema está declarada na condição «descobriu»", CONDICOES.descobriu.portas.some((p) => p.modulo === "src/a-quest-manda.js" && p.funcao === "oLivroDoAchado"));
}

/* ---------------- o catálogo inteiro ----------------
   Cada quest com etapa `descobriu` (ou de rasto, com lugar): os papéis com
   nomes de prova, as etapas antes dela feitas, ela acesa — e o passo. */
const C = "Alto do Sal";
const e0 = congelar({ npcs: {}, cidadeAtual: C, lugar: { nome: "Praça", cidade: C }, personagem: { nome: "Vera", grupo: [], inventario: [] }, dia: 1, npcTurno: 0, factos: garantirFactos(null), baseMundo: null });
const casos = [];
for (const F of BIBLIOTECA_DE_QUESTS) {
  const alvos = F.etapas.filter((e) => tem(e.conclui, "descobriu") || O_PASSO_NO_ORACULO.haRastro.rx.test(`${e.id} ${e.texto}`.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")));
  if (!alvos.length) continue;
  const papeis = {};
  for (const [k, d] of Object.entries(F.papeis)) {
    const tipo = (PAPEIS_DA_QUEST[d.de] || {}).tipo;
    papeis[k] = tipo === "lugar" ? { nome: `Casa ${k}`, cidade: C } : tipo === "item" ? { nome: `a coisa ${k}` } : { nome: `Pessoa ${k}` };
  }
  const R = abrirQuest(F, { estado: e0, papeis });
  for (const alvo of alvos) {
    const idx = F.etapas.indexOf(alvo);
    const R2 = R ? { ...R, feitas: Object.fromEntries(F.etapas.slice(0, idx).map((e) => [e.id, { dia: 1 }])), acesas: { ...R.acesas, [alvo.id]: 1 } } : null;
    casos.push({ F, alvo, R: R2, passo: R2 ? oPassoDaQuest(F, R2, { estado: e0 }) : null });
  }
}

sec(`§2 o catálogo: ${new Set(casos.map((c) => c.F.id)).size} quests, ${casos.length} etapas com «descobriu» ou de rasto`);
{
  t("todas abrem com os papéis de prova", casos.every((c) => c.R), casos.filter((c) => !c.R).map((c) => c.F.id).join(", "));
  t("todas têm passo quando a etapa está acesa", casos.every((c) => c.passo && c.passo.etapa === c.alvo.id), casos.filter((c) => !c.passo || c.passo.etapa !== c.alvo.id).map((c) => `${c.F.id}:${c.alvo.id}`).join(", "));
  const comDesc = casos.filter((c) => tem(c.alvo.conclui, "descobriu"));
  /* o passo só planta o que a etapa PEDE agora: uma reviravolta que pôs um
     «exige» à frente (a mão que mudou de lado: primeiro encontrar quem fareja)
     cala o segredo até o «exige» se cumprir */
  const plantam = comDesc.filter((c) => c.passo && c.passo.descobrir.length);
  const calados = comDesc.filter((c) => c.passo && !c.passo.descobrir.length);
  const pedeSegredo = (f) => (Array.isArray(f) ? f : []).some((x) => x && (x.predicado === "descobriu" || pedeSegredo(x.opcoes) || (Array.isArray(x.opcoes) && x.opcoes.some(pedeSegredo))));
  const calaBem = calados.every((c) => { const v = estadoDaQuest(c.F, c.R, { estado: e0 }); return v && !pedeSegredo(v.falta) && v.falta.length > 0; });
  t("toda etapa com «descobriu» planta o segredo — e a que não planta é porque o «o que falta» de agora não o pede (um «exige» à frente)", calaBem && plantam.length + calados.length === comDesc.length, `${plantam.length} plantam · ${calados.length} esperam`);
  console.log(`       ${plantam.length} plantam o segredo; à espera de um «exige»: ${calados.map((c) => `${c.F.id}:${c.alvo.id}`).join(", ") || "nenhuma"}`);
  let acha = 0, escreve = 0, fecha = 0, teto = 0, doFio = 0, sujo = 0;
  const falhas = [];
  for (const c of plantam) {
    let factos = e0.factos;
    for (const l of c.passo.descobrir) {
      const a = achadoDoPasso([c.passo], { lugar: l.nome, cidade: l.cidade });
      if (!a || a.especie !== "passo") { falhas.push(`${c.F.id}:${l.nome} não acha`); continue; }
      acha++;
      if (a.o.length <= PISTA_DO_PASSO.teto) teto++;
      const fio = Object.entries(c.F.papeis).filter(([, d]) => d.de === "fio").map(([k]) => c.R.papeis[k] && c.R.papeis[k].nome).filter(Boolean);
      if (fio.some((n) => a.o.includes(n))) doFio++;
      if (/sistema|or[aá]culo|\bteste\b|undefined|null|\{/.test(a.o)) sujo++;
      factos = oLivroDoAchado(factos, a, { dia: 2, turno: 50 });
      const papel = Object.keys(c.R.papeis).find((k) => c.R.papeis[k].id && c.R.papeis[k].id === a.lugar.id);
      if (papel && avaliarCondicao(["descobriu", `lugar:${papel}`], { estado: { ...e0, factos }, papeis: c.R.papeis })) escreve++;
      else falhas.push(`${c.F.id}:${l.nome} não escreve`);
    }
    /* o passo fica ✓ quando os caminhos dele que são lugares chegam sozinhos
       (o «algum» com o segredo, o «todos» do lugar e do segredo, o «pelo
       menos 2» com dois segredos); nos outros, o segredo conta o seu */
    if (julgarEtapa(c.alvo, { estado: { ...e0, factos }, papeis: c.R.papeis }).feita) fecha++;
  }
  const n = plantam.reduce((s, c) => s + c.passo.descobrir.length, 0);
  t(`no lugar do passo, a busca acha o segredo dele (${acha}/${n})`, acha === n, falhas.slice(0, 3).join("; "));
  t(`e a busca que acha escreve «descobriu» pela porta do sistema — a condição fica ✓ sem o Cronista (${escreve}/${n})`, escreve === n, falhas.slice(0, 3).join("; "));
  console.log(`       a etapa inteira fecha só com o segredo em ${fecha} de ${plantam.length} (as outras pedem também gente, coisa ou outro lugar)`);
  t("a pista cabe no teto", teto === acha);
  t("a pista nunca diz o nome de quem é do vilão (o herói ainda não o sabe)", doFio === 0);
  t("a pista é texto de mundo (sem molde por encher, sem sistema)", sujo === 0);
  const longe = plantam.filter((c) => achadoDoPasso([c.passo], { lugar: "A Ponte dos Enforcados", cidade: C }));
  t("fora do lugar do passo, a busca não acha o segredo dele", longe.length === 0, longe.map((c) => c.F.id).join(", "));

  const rastos = casos.filter((c) => c.passo && c.passo.especie === "rasto" && c.passo.lugares.length);
  t("há passos de rasto com lugar no catálogo", rastos.length >= 3, `${rastos.length}`);
  let sims = 0, tot = 0;
  for (const c of rastos) for (const l of c.passo.lugares) {
    tot++;
    const r = oPassoNoOraculo("haRastro", { passos: [c.passo], onde: { lugar: l.nome, cidade: C }, contexto: { onde: `em ${l.nome}`, lugar: l.nome, emCidade: true } });
    if (r && /^sim/.test(r.grau.id)) sims++;
  }
  t(`no lugar do passo de rasto, o oráculo não diz NÃO — há rasto (${sims}/${tot})`, sims === tot && tot > 0);
  const segredos = casos.filter((c) => c.passo && c.passo.especie === "segredo" && c.passo.lugares.length);
  t("o passo que não é de rasto não inventa rasto", segredos.every((c) => oPassoNoOraculo("haRastro", { passos: [c.passo], onde: { lugar: c.passo.lugares[0].nome, cidade: C }, contexto: {} }) === null));
  const r0 = rastos[0];
  t("fora dos lugares do passo, o oráculo pergunta-se como sempre (null)", oPassoNoOraculo("haRastro", { passos: [r0.passo], onde: { lugar: "A Ponte dos Enforcados", cidade: C }, contexto: {} }) === null);
  const naToca = r0.passo.lugares.find((l) => !r0.passo.descobrir.some((d) => d.id === l.id));
  if (naToca) {
    const p = pistaDoPassoAqui([r0.passo], { lugar: naToca.nome, cidade: C });
    t("no lugar do rasto que não é de descobrir, há pista — e não escreve «descobriu»", p && p.semDescobrir === true && oLivroDoAchado(e0.factos, p, { dia: 2 }) === e0.factos, J(p));
  }
  const escuta = { quest: "q", etapa: "porta", texto: "Escutar à porta de Casa x", especie: "segredo", escuta: true, descobrir: [], lugares: [{ id: "x", nome: "Casa x", cidade: C }], candidatos: { lugar: [], pessoa: [], item: [] } };
  t("a escuta tem a mesma régua (um passo de prova: o catálogo ainda não tem)", (oPassoNoOraculo("haOQueOuvir", { passos: [escuta], onde: { lugar: "Casa x", cidade: C }, contexto: {} }) || {}).sim === true);
}

sec("§3 uma campanha nova de ponta a ponta");
{
  const cat = BIBLIOTECA_DE_QUESTS.filter((q) => ["o_que_desce_ao_anoitecer", "o_ultimo_a_sair"].includes(q.id));
  const semente = "MC5|0";
  const mundo = { semente };
  const mapa = gerarGeografia(semente, null, null);
  const espinha0 = estenderEspinha({ semente, mapa, estrutura: "jornada", cidadeInicial: mapa.cidades[0].nome, antecedente: "soldado", dia: 1 });
  const nucleo = nucleoDaCampanha(semente, mapa, { espinha: espinha0, antecedente: "soldado", grupo: [] });
  const esq = esqueletoDaCampanha({ semente, mapa, espinha: espinha0, antecedente: "soldado", nucleo, chefes: chefesDoMundo(semente, mapa), catalogo: cat });
  let E = { espinha: comOEsqueleto(espinha0, esq), historia: garantirHistoria({ estrutura: "jornada", etapa: 0 }), mapa, cidadeAtual: mapa.cidades[0].nome, lugar: null, jornada: null, personagem: { nome: "Vera", grupo: [], inventario: [], moedas: 100 }, npcs: {}, canone: {}, factos: garantirFactos(null), saber: [], dia: 1, npcTurno: 0 };
  const turno = () => { const r = oTurnoDasQuests(E, { mundo }); if (r) E = { ...E, ...r.estado }; };
  turno();
  t("o mundo de prova abre a caçada no ato 1", esq.atos[0].quest === "o_que_desce_ao_anoitecer" && garantirQuestsDaEspinha(E.espinha.quests).registos.some((r) => r.id === "o_que_desce_ao_anoitecer"));
  const p0 = osPassosDasQuests(E, { mundo });
  t("o primeiro passo («ver o que ficou») não planta segredo nenhum", p0.length === 1 && p0[0].etapa === "ver" && p0[0].descobrir.length === 0, J(p0.map((p) => p.etapa)));
  const R = garantirQuestsDaEspinha(E.espinha.quests).registos.find((r) => r.id === "o_que_desce_ao_anoitecer");
  const curral = R.papeis.curral, toca = R.papeis.toca;
  E = { ...E, cidadeAtual: curral.cidade, lugar: { nome: curral.nome, cidade: curral.cidade } };
  E = { ...E, factos: anotarOLivro(E, { lugar: E.lugar, dia: 1, turno: 20 }, { mundo }).factos };
  turno();
  const p1 = osPassosDasQuests(E, { mundo });
  t("estive no curral: o passo é o rasto, e planta o segredo do curral", p1.length === 1 && p1[0].etapa === "rasto" && p1[0].especie === "rasto" && p1[0].descobrir.some((l) => l.id === curral.id), J(p1.map((p) => [p.etapa, p.descobrir.map((l) => l.nome)])));
  const onde = { lugar: curral.nome, cidade: curral.cidade, foraDosMuros: false };
  const a = achadoDoPasso(p1, onde);
  t("a busca no curral acha o rasto, e ele leva à toca (o resto do passo)", a && a.especie === "passo" && a.o.includes(toca.nome.replace(/^(O|A|Os|As)\s+/, "")), a && a.o);
  const or = oPassoNoOraculo("haRastro", { passos: p1, onde, contexto: { onde: `em ${curral.nome}`, lugar: curral.nome, emCidade: true } });
  t("no curral, na cidade (−25 de sempre), há rasto", or && or.sim === true && or.reusado === true);
  E = { ...E, factos: oLivroDoAchado(E.factos, a, { dia: 1, turno: 30 }) };
  t("a condição «descobriu o curral» fica ✓, sem o Cronista", avaliarCondicao(["descobriu", "lugar:curral"], { estado: E, papeis: R.papeis, mundo }));
  E = { ...E, cidadeAtual: toca.cidade, lugar: { nome: toca.nome, cidade: toca.cidade } };
  E = { ...E, factos: anotarOLivro(E, { lugar: E.lugar, dia: 1, turno: 40 }, { mundo }).factos };
  turno();
  const p2 = osPassosDasQuests(E, { mundo });
  t("com o segredo e a toca (2 de 3), o passo do rasto fecha e a história anda", p2.length === 1 && p2[0].etapa === "fera", J(p2.map((p) => p.etapa)));
  const antiga = { ...E, espinha: { ...E.espinha, esqueleto: null } };
  t("a campanha antiga (sem esqueleto): nenhum passo, nada muda", J(osPassosDasQuests(antiga, { mundo })) === "[]");
}

sec("§4 a resposta do passo vence um NÃO de antes");
{
  const c = casos.find((x) => x.passo && x.passo.especie === "rasto" && x.passo.lugares.length);
  const l = c.passo.lugares[0];
  const ctxO = { onde: `em ${l.nome}`, lugar: l.nome, emCidade: true, chuva: true, noite: true, dia: 1, cena: 1 };
  const nao = perguntarPeloSistema("haRastro", ctxO, { sorte: () => 0.99, fatos: {} });
  t("sem o passo, na cidade, de noite e à chuva: o mundo diz NÃO", nao && !nao.sim);
  let fatos = registrarFato({}, nao.chave, nao, { dia: 1, cena: 1 });
  const sim = oPassoNoOraculo("haRastro", { passos: [c.passo], onde: { lugar: l.nome, cidade: C }, contexto: ctxO });
  t("com o passo: SIM, pela mesma chave do facto", sim && sim.sim && sim.chave === nao.chave, J(sim && sim.chave));
  t("e na forma de sempre (o envelope do App lê-a sem mudar): «já tinha respondido», sem número", sim.reusado === true && sim.grau && sim.seSim && sim.pergunta === nao.pergunta);
  fatos = registrarFato(fatos, sim.chave, sim, { dia: 1, cena: 1 });
  const depois = perguntarPeloSistema("haRastro", ctxO, { sorte: () => 0.99, fatos });
  t("registada, a resposta do passo é o facto: o oráculo devolve SIM daí em diante", depois.reusado && depois.sim);
}

sec("§5 onde o herói está");
{
  const l = { id: "A|taverna", nome: "O Grifo da Colina", cidade: "Alto" };
  t("no sítio, pelo nome (sem artigo nem acento)", noLugarDoPasso(l, { lugar: "grifo da colina", cidade: "Alto" }));
  t("no cómodo do prédio (o quarto de cima é da taverna)", noLugarDoPasso(l, { lugar: "o quarto de cima", dentroDe: "O Grifo da Colina", cidade: "Alto" }));
  t("noutra cidade com um prédio do mesmo nome, não", !noLugarDoPasso(l, { lugar: "O Grifo da Colina", cidade: "Baixo" }));
  t("na rua, não", !noLugarDoPasso(l, { lugar: "", cidade: "Alto" }));
  const cid = { id: "cidade|alto", nome: "Alto", cidade: "" };
  t("o lugar que é a cidade: em qualquer sítio dela, dentro dos muros", noLugarDoPasso(cid, { lugar: "a praça", cidade: "Alto" }) && !noLugarDoPasso(cid, { lugar: "a estrada", cidade: "Alto", foraDosMuros: true }));
}

sec("§6 o livro");
{
  const c = casos.find((x) => x.passo && x.passo.descobrir.length);
  const l = c.passo.descobrir[0];
  const a = achadoDoPasso([c.passo], { lugar: l.nome, cidade: l.cidade });
  const livro = congelar(garantirFactos(null));
  const novo = oLivroDoAchado(livro, a, { dia: 3, turno: 9 });
  t("devolve livro novo, e não muda o que recebeu", novo !== livro && J(livro) === J(garantirFactos(null)));
  t("o lugar fica com o dia em que caiu o segredo", novo.lugares[l.id] && novo.lugares[l.id].descobriu && novo.lugares[l.id].descobriu.dia === 3, J(novo.lugares));
  t("o baú da base não escreve (não é o passo)", oLivroDoAchado(livro, { especie: "segredo", o: "um baú", lugar: { id: "x|y", nome: "y" } }, { dia: 1 }) === livro);
  t("escrever duas vezes é escrever uma (o primeiro dia fica)", oLivroDoAchado(novo, a, { dia: 9 }).lugares[l.id].descobriu.dia === 3);
}

sec("§7 o lixo não lança");
{
  let ok = true;
  try {
    for (const x of [null, undefined, {}, 7, "x", []]) {
      osPassosDasQuests(x, x); oPassoDaQuest(x, x, x); achadoDoPasso(x, x); pistaDoPassoAqui(x, x);
      oPassoNoOraculo(x, x); oLivroDoAchado(x, x, x); noLugarDoPasso(x, x);
    }
  } catch { ok = false; }
  t("null, {}, número, texto, lista: nada lança", ok);
  t("passos tortos: nenhum achado", achadoDoPasso([null, 1, { descobrir: "x" }, { descobrir: [null] }], { lugar: "x" }) === null);
  t("pergunta que não existe: null", oPassoNoOraculo("haDragao", { passos: [], onde: {} }) === null);
  t("a ficha que não é do catálogo: sem passo", oPassoDaQuest("nao_existe", {}, {}) === null && !!questPorId("o_que_desce_ao_anoitecer"));
}

console.log(`\na quest manda: ${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
