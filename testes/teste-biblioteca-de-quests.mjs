/* A BIBLIOTECA DE QUESTS — a ficha, o catálogo e o estado (08/11/2026, Fase BQ · BQ4)

   src/biblioteca-de-quests.js: a ficha de uma quest em dado, as três
   quests da planta (§10), e o juiz delas (abrirQuest, avancarQuest,
   escolherNaQuest, vereditoDaEscolha, estadoDaQuest). Tudo jogado: o livro
   de factos é escrito pelas portas de verdade (o efeito do Cronista, os
   caídos da luta, o lugar do fim do turno), a base do mundo pelas dela
   (matar, porSituacao), e nenhuma linha de código se lê como texto.
   §1 a ficha e as tabelas — cada quest valida; todo predicado usado é do
      vocabulário e ativo; toda entrada das tabelas de efeitos é usada; a
      validação recusa o que as leis da pessoa proíbem;
   §2 O Salvo-Conduto, por cada ramo — poupou, matou, a portagem, o
      desvio; as duas reviravoltas (o guarda vendido, o protegido que
      mente: entregar e levar); a falha e o abandono;
   §3 As Cinzas de Ontem, por cada ramo — ouviu e bateu, à guarda, na praça
      e pela própria mão; o recado que exige o mandante antes da escolha;
      a falha que só vale até ao nome; o abandono;
   §4 A Carta Que Não Se Abre — escondida até acender; a âncora no tipo 1;
      o fogo que a acende já; cada desfecho alcançado, do melhor ao pior; e
      o pior nunca sem causa (todas as combinações de escolhas e afeição);
   §5 a quest nunca nasce feita;
   §6 a menção não fecha;
   §7 `escolheu` e `etapa` — leem só o registo, e quem os escreve é daqui;
      a escolha fechada, a irreversível, a que a bolsa não paga; a alcunha
      do vilão até o herói o ver;
   §8 o null, o lixo, a imutabilidade e o determinismo. */
import {
  BIBLIOTECA_DE_QUESTS, TIPOS_DE_QUEST, QUANDO_DA_QUEST, ESTADOS_DA_QUEST, PAPEIS_DA_QUEST, MAOS_DO_VILAO,
  LIMITES_DA_QUEST, EFEITOS_DA_QUEST, EFEITOS_DA_REVIRAVOLTA, ATOS_DO_HEROI,
  questPorId, validarQuest, abrirQuest, avancarQuest, escolherNaQuest, vereditoDaEscolha, estadoDaQuest,
} from "../src/biblioteca-de-quests.js";
import { CONDICOES, avaliarCondicao, julgarEtapa } from "../src/condicoes-da-quest.js";
import { garantirFactos } from "../src/livro-de-factos.js";
import { anotarOLivro } from "../src/motor/livro-do-turno.js";
import { caidosParaOLivro } from "../src/motor/luta-do-turno.js";
import { matar, porSituacao, SITUACOES } from "../src/mundo-base.js";
import { registrarConsulta } from "../src/npcs.js";

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);
const copia = (x) => JSON.parse(J(x));
const congelar = (o) => { if (o && typeof o === "object" && !Object.isFrozen(o)) { Object.freeze(o); Object.values(o).forEach(congelar); } return o; };

/* ---------------- o mundo ---------------- */
const CIDADE = "Alto do Sal", FOZ = "Foz do Meio";
const N = (nome, local = CIDADE) => ({ nome, conhecidoEm: 1, local, relacao: "neutro", status: "vivo", consultas: 0 });
const NPCS = {
  Lia: N("Lia"), Brás: N("Brás"), Teodoro: N("Teodoro"),
  Ana: N("Ana"), Rui: N("Rui"), Mira: N("Mira"),
  Delfina: N("Delfina", FOZ),
};
const vazio = () => ({
  npcs: NPCS, cidadeAtual: CIDADE, lugar: { nome: "Praça", cidade: CIDADE },
  personagem: { nome: "Vera", grupo: [], inventario: [], moedas: 100 },
  dia: 1, npcTurno: 0, factos: garantirFactos(null), baseMundo: null,
});
let turno = 1;
/* cada chamada é uma conversa nova (mais de LIVRO_DE_FACTOS.vezNova.turnos entre elas) */
const falar = (e, ...nomes) => ({ ...e, factos: anotarOLivro(e, { tipo: "factos", dia: e.dia, turno: (turno += 10), falouCom: nomes }).factos });
const nomear = (e, ...nomes) => ({ ...e, factos: anotarOLivro(e, { tipo: "factos", dia: e.dia, turno: (turno += 10), nomeados: nomes }).factos });
const lutar = (e, ...caidos) => ({ ...e, factos: anotarOLivro(e, { tipo: "factos", dia: e.dia, turno: (turno += 10), derrotados: caidosParaOLivro(caidos) }).factos });
const ir = (e, lugar) => { const e2 = { ...e, lugar, jornada: null, cidadeAtual: lugar.cidade }; return { ...e2, factos: anotarOLivro(e2, { lugar, dia: e2.dia, turno: (turno += 10) }).factos }; };
const segredo = (e, lugar) => ({ ...e, factos: anotarOLivro(e, { tipo: "factos", dia: e.dia, turno: (turno += 10), segredos: [lugar] }).factos });
const grupo = (e, ...membros) => ({ ...e, personagem: { ...e.personagem, grupo: membros } });
const dias = (e, n) => ({ ...e, dia: e.dia + n });
const morre = (e, nome) => ({ ...e, baseMundo: matar(e.baseMundo, nome) });
const consulta = (e, nome) => ({ ...e, npcs: registrarConsulta(e.npcs, nome) });
const naEstrada = (e) => ({ ...e, jornada: { para: FOZ }, lugar: null });

/* ---------------- o motor de prova: um turno é escrever o livro e avançar ---------------- */
function jogo(id, papeis, e0, extra) {
  const F = questPorId(id);
  const j = { F, e: e0, R: abrirQuest(F, { estado: e0, papeis, ...(extra || {}) }), extra: extra || {} };
  j.ctx = () => ({ estado: j.e, ...j.extra });
  j.turno = (f) => { if (f) j.e = f(j.e); j.R = avancarQuest(F, j.R, j.ctx()); return j; };
  j.escolher = (k, op) => { j.R = escolherNaQuest(F, j.R, k, op, j.ctx()); return j; };
  j.ver = () => estadoDaQuest(F, j.R, j.ctx());
  return j;
}

const PSC = { protegido: { nome: "Lia" }, origem: { cidade: CIDADE }, destino: { cidade: FOZ }, passo: { nome: "Vau Negro", cidade: CIDADE }, desvio: { nome: "Trilho do Vau", cidade: CIDADE }, tenente: { nome: "Brás" }, guarda: { nome: "Teodoro" } };
const PCI = { lugar: { nome: "Armazém do Sal", cidade: CIDADE }, testemunha: { nome: "Ana" }, suspeito: { nome: "Rui" }, prova: { nome: "o ferrolho queimado" }, mandante: { nome: "Mira" } };
const PCA = { quem: { nome: "Iago" }, ferido: { nome: "Delfina" }, carta: { nome: "a carta lacrada" } };

/* todas as condições de uma ficha, com onde estão */
function condicoesDe(F) {
  const out = [];
  const etapas = [...F.etapas, ...F.reviravoltas.flatMap((r) => r.efeitos).filter((e) => e.tipo === "abre_etapa").map((e) => e.etapa)];
  for (const e of etapas) { out.push(e.conclui); if (e.acende) out.push(e.acende); }
  for (const r of F.reviravoltas) { out.push(r.gatilho); for (const ef of r.efeitos) if (ef.tipo === "exige") out.push(ef.condicao); }
  for (const f of F.falha || []) out.push(f.quando);
  for (const d of F.desfechos || []) if (d.quando) out.push(d.quando);
  for (const porRamo of Object.values(F.solucoes || {})) for (const vs of Object.values(porRamo)) for (const v of vs) if (v.quando) out.push(v.quando);
  return out;
}
const predicadosDe = (c, out = []) => {
  if (!Array.isArray(c)) return out;
  if (["todos", "algum", "nenhum"].includes(c[0])) c.slice(1).forEach((x) => predicadosDe(x, out));
  else if (c[0] === "pelo_menos") c.slice(2).forEach((x) => predicadosDe(x, out));
  else out.push(c[0]);
  return out;
};
const todosOsEfeitos = (F) => [
  ...Object.values(F.escolhas || {}).flatMap((e) => Object.values(e.opcoes).flatMap((o) => o.efeitos || [])),
  ...Object.values(F.solucoes || {}).flatMap((p) => Object.values(p).flatMap((vs) => vs.flatMap((v) => v.efeitos || []))),
  ...F.reviravoltas.flatMap((r) => r.efeitos),
  ...(F.falha || []).flatMap((f) => f.efeitos || []),
  ...((F.abandono || {}).efeitos || []), ...((F.fecho || {}).efeitos || []),
  ...(F.desfechos || []).flatMap((d) => d.efeitos || []),
];

sec("§1 a ficha e as tabelas");
{
  t("o catálogo tem as três quests da planta", J(BIBLIOTECA_DE_QUESTS.map((q) => q.id)) === J(["o_salvo_conduto", "as_cinzas_de_ontem", "a_carta_que_nao_se_abre"]));
  const invalidas = BIBLIOTECA_DE_QUESTS.map((q) => [q.id, validarQuest(q)]).filter(([, v]) => !v.ok);
  t("cada quest passa a validação inteira", invalidas.length === 0, J(invalidas));
  t("dois do tipo 1 e um do tipo 2, e os tipos são os da tabela", J(BIBLIOTECA_DE_QUESTS.map((q) => q.tipo)) === J([1, 1, 2]) && BIBLIOTECA_DE_QUESTS.every((q) => TIPOS_DE_QUEST[q.tipo]));
  t("o «quando» de cada uma está em QUANDO_DA_QUEST", BIBLIOTECA_DE_QUESTS.every((q) => q.quando.every((x) => QUANDO_DA_QUEST.includes(x))));
  t("cada papel diz de onde vem (PAPEIS_DA_QUEST)", BIBLIOTECA_DE_QUESTS.every((q) => Object.values(q.papeis).every((p) => PAPEIS_DA_QUEST[p.de])));
  t("o catálogo é imutável", Object.isFrozen(BIBLIOTECA_DE_QUESTS) && Object.isFrozen(BIBLIOTECA_DE_QUESTS[0].etapas[2].conclui));
  t("questPorId acha e não inventa", questPorId("o_salvo_conduto") === BIBLIOTECA_DE_QUESTS[0] && questPorId("nao_existe") === null && questPorId(null) === null);

  /* TODO PREDICADO DO VOCABULÁRIO É VÁLIDO: o que o catálogo usa existe, é
     ativo e tem quem escreva o facto que lê */
  const usados = new Set(BIBLIOTECA_DE_QUESTS.flatMap((q) => condicoesDe(q).flatMap((c) => predicadosDe(c))));
  const fora = [...usados].filter((p) => !CONDICOES[p] || CONDICOES[p].reservado || !CONDICOES[p].portas.length);
  t("todo predicado que as quests usam é do vocabulário, ativo e com porta", fora.length === 0 && usados.size >= 12, `${[...usados].join(", ")} · fora: ${fora.join(", ")}`);
  t("e as quests usam os dois que a BQ4 acordou: escolheu e etapa", usados.has("escolheu") && usados.has("etapa"));

  /* a mão do vilão: o ponto de encontro com a BQ5 */
  const t1 = BIBLIOTECA_DE_QUESTS.filter((q) => q.tipo === 1);
  t("todo tipo 1 tem a mão: tipo da tabela e passos de 1 a passosDoPlano",
    t1.every((q) => MAOS_DO_VILAO[q.mao.tipo] && q.mao.contra.length && q.mao.contra.every((p) => p >= 1 && p <= LIMITES_DA_QUEST.passosDoPlano)));
  t("o Salvo-Conduto é a mão `tenente` contra os passos 1 e 2; as Cinzas, a `consequencia` (e pista) contra o 3",
    J(questPorId("o_salvo_conduto").mao) === J({ tipo: "tenente", contra: [1, 2], papel: "tenente" }) && J(questPorId("as_cinzas_de_ontem").mao) === J({ tipo: "consequencia", contra: [3], papel: "mandante", tambem: ["pista"] }));
  t("a mão é sempre gente do fio", t1.every((q) => q.papeis[q.mao.papel].de === "fio"));
  t("o tipo 2 não é sobre o vilão (mao null) e toca-o pela ponte", questPorId("a_carta_que_nao_se_abre").mao === null && questPorId("a_carta_que_nao_se_abre").ponte.length > 20);

  /* as tabelas de efeitos não têm entradas mortas */
  const tipos = new Set(BIBLIOTECA_DE_QUESTS.flatMap((q) => todosOsEfeitos(q).map((e) => e.tipo)));
  const semUso = [...Object.keys(EFEITOS_DA_QUEST), ...Object.keys(EFEITOS_DA_REVIRAVOLTA)].filter((k) => !tipos.has(k));
  t("toda entrada de EFEITOS_DA_QUEST e de EFEITOS_DA_REVIRAVOLTA é usada pelo catálogo", semUso.length === 0, semUso.join(", "));
  t("os estados do registo são os quatro da planta", J(Object.keys(ESTADOS_DA_QUEST)) === J(["aberta", "concluida", "falhada", "terminada"]));
  t("os actos do herói são predicados do vocabulário", ATOS_DO_HEROI.every((p) => CONDICOES[p] && !CONDICOES[p].reservado));

  /* a validação recusa o que as leis proíbem */
  const sc = questPorId("o_salvo_conduto"), ca = questPorId("a_carta_que_nao_se_abre");
  const com = (q, f) => { const c = copia(q); f(c); return validarQuest(c); };
  const recusa = (n, q, f, frag) => { const v = com(q, f); t(n, !v.ok && v.erros.some((e) => e.includes(frag)), J(v.erros)); };
  recusa("a morte como passo: recusada", sc, (c) => { c.etapas[3].conclui = ["morto", "papel:tenente"]; }, "não pode ser passo");
  recusa("e escondida num «algum»: recusada", sc, (c) => { c.etapas[2].conclui[1] = ["morto", "papel:tenente"]; }, "não pode ser passo");
  t("mas o veto «sem que morra» (dentro de um nenhum) é permitido", com(sc, (c) => { c.etapas[3].conclui = ["todos", c.etapas[3].conclui, ["nenhum", ["morto", "papel:protegido"]]]; }).ok);
  recusa("a morte numa escolha: recusada (só num desfecho)", sc, (c) => { c.escolhas.passo.opcoes.portagem.efeitos.push({ tipo: "morte", papel: "protegido" }); }, "só pode estar num desfecho");
  recusa("o desfecho sem causa nenhuma: recusado", ca, (c) => { c.desfechos[1].quando = ["nenhum", ["morto", "papel:ferido"]]; }, "sem nenhum facto");
  recusa("o pior sem a morte: recusado", ca, (c) => { c.desfechos[6].efeitos = []; }, "o pior");
  recusa("o pior sem um acto do herói: recusado", ca, (c) => { c.desfechos[6].quando = ["nenhum", ["afeicao", "papel:quem", 2]]; }, "tem causa");
  recusa("a morte de quem não é do grupo: recusada", ca, (c) => { c.desfechos[6].efeitos = [{ tipo: "morte", papel: "ferido" }]; }, "alguém do grupo");
  recusa("o melhor com perda: recusado", ca, (c) => { c.desfechos[0].efeitos.push({ tipo: "vinculo", papel: "quem", n: -5 }); }, "o melhor");
  recusa("dois padrões: recusado", ca, (c) => { delete c.desfechos[1].quando; c.desfechos[1].padrao = true; }, "padrão");
  recusa("o tipo 2 com falha: recusado", ca, (c) => { c.falha = [{ quando: ["morto", "papel:quem"], texto: "x" }]; }, "não falha");
  recusa("o tipo 1 sem mão: recusado", sc, (c) => { c.mao = null; }, "mão do vilão");
  recusa("a mão contra o passo 7: recusada", sc, (c) => { c.mao.contra = [7]; }, "passos de 1 a");
  recusa("a mão que não é do fio: recusada", sc, (c) => { c.mao.papel = "guarda"; }, "papel do fio");
  recusa("a opção sem o lado do custo: recusada (o veredito diz os dois lados)", sc, (c) => { delete c.escolhas.passo.opcoes.portagem.custa; }, "custa");
  recusa("o escolheu de uma escolha que não existe: recusado", sc, (c) => { c.etapas[2].conclui[2] = ["escolheu", "passo", "suborno"]; }, "não está na ficha");
  recusa("a etapa que não existe: recusada", sc, (c) => { c.reviravoltas[0].gatilho = ["etapa", "voo"]; }, "não existe");
  recusa("o texto que cita um papel que não há: recusado", sc, (c) => { c.gancho = "{rei} manda"; }, "não é papel");
  recusa("o efeito fora da tabela: recusado", sc, (c) => { c.fecho.efeitos.push({ tipo: "teleporte" }); }, "EFEITOS_DA_QUEST");
  recusa("o laço que não existe: recusado", sc, (c) => { c.fecho.efeitos[0].laco = "compadrio"; }, "TIPOS_DE_LACO");
  recusa("o predicado reservado (entregou): recusado", sc, (c) => { c.etapas[3].conclui = ["entregou", "item:carta", "papel:protegido"]; }, "reservado");
  recusa("o papel não declarado na condição: recusado", sc, (c) => { c.etapas[0].conclui = ["conversou", "papel:rei"]; }, "não está declarado");
  recusa("ramos que não batem com o «algum»: recusados", sc, (c) => { c.etapas[2].ramos = ["violenta", "social"]; }, "ramos");
  t("a ficha nula ou de lixo não valida e não lança", [null, undefined, 3, "x", [], {}].every((x) => validarQuest(x).ok === false));
}

sec("§2 O Salvo-Conduto, por cada ramo");
/* até ao passo: ouvir a Lia (e falar com o guarda, para o guarda não se vender) e fazer-se à estrada */
function salvoAteAoPasso(comGuarda = true) {
  const j = jogo("o_salvo_conduto", PSC, vazio());
  j.turno((e) => (comGuarda ? falar(e, "Lia", "Teodoro") : falar(e, "Lia")));
  j.turno((e) => naEstrada(grupo(e, { nome: "Lia", vinculo: 30 })));
  return j;
}
const chegar = (e) => ({ ...e, jornada: null, cidadeAtual: FOZ, lugar: { nome: "Cais", cidade: FOZ }, dia: e.dia + 2 });
{
  const j0 = jogo("o_salvo_conduto", PSC, vazio());
  const v0 = j0.ver();
  t("abre: aberta, na etapa «aceitar», a falta diz «falar com Lia»", v0.estado === "aberta" && v0.etapa === "aceitar" && J(v0.faltaTexto) === J(["falar com Lia"]), J(v0));
  t("o gancho chega com nomes, sem chavetas, e com a alcunha do tenente", /Lia/.test(v0.gancho) && /Foz do Meio/.test(v0.gancho) && !/[{}]/.test(v0.gancho) && /a mão que guarda Vau Negro/.test(v0.gancho) && !/Brás/.test(v0.gancho), v0.gancho);
  t("o tenente passa a id uma vez, quando a quest abre", j0.R.papeis.tenente.id === "npc|Brás" && j0.R.papeis.passo.id === "alto do sal|sitio|vau negro");

  const j = salvoAteAoPasso();
  const vp = j.ver();
  t("na estrada com a Lia: o passo, com as três saídas no «o que falta»", vp.etapa === "passo" && vp.falta.length === 1 && vp.falta[0].predicado === "algum" && vp.falta[0].opcoes.length === 3, J(vp.falta));
  t("e a escolha da portagem está aberta", J(vp.escolhas) === J(["passo"]));

  /* violenta, poupando */
  const jp = salvoAteAoPasso();
  jp.turno((e) => lutar(e, { nome: "Brás", rendido: true }));
  const fp = jp.R.feitas.passo;
  t("violenta, poupando Brás: ramo «violenta», variante «poupou»", fp && fp.ramo === "violenta" && fp.variante === "poupou", J(fp));
  t("e a dívida com quem se poupou fica nas consequências", jp.R.consequencias.some((c) => c.de === "passo:violenta" && c.efeitos.some((x) => x.tipo === "laco" && x.laco === "divida")));
  jp.turno(chegar);
  t("e em Foz com a Lia: concluída pelas etapas", jp.R.estado === "concluida" && jp.R.motivo === "etapas" && jp.ver().concluida === true);
  t("o fecho deixa o laço e o aliado", jp.R.consequencias.some((c) => c.de === "fecho" && c.efeitos.some((x) => x.tipo === "aliado")));

  /* violenta, matando */
  const jm = salvoAteAoPasso();
  jm.turno((e) => lutar(e, { nome: "Brás" }));
  t("violenta, matando Brás: variante «matou»", jm.R.feitas.passo.ramo === "violenta" && jm.R.feitas.passo.variante === "matou");
  t("concluível por este ramo", jm.turno(chegar).R.estado === "concluida");

  /* social: a portagem, com o veredito antes do clique */
  const js = salvoAteAoPasso();
  const ver = vereditoDaEscolha(js.F, js.R, "passo", js.ctx());
  t("o veredito da portagem: os dois lados, em mundo, e o preço", ver && ver.opcoes.length === 1 && ver.opcoes[0].custo === 40 && ver.opcoes[0].podeEscolher && /Vau Negro/.test(ver.opcoes[0].ganha) && ver.opcoes[0].custa.length > 30, J(ver));
  js.escolher("passo", "portagem");
  t("social: a portagem fecha o passo pelo ramo «social»", js.R.feitas.passo && js.R.feitas.passo.ramo === "social");
  t("e o preço, o aviso ao vilão e a premissa entram nas consequências", js.R.consequencias.some((c) => c.de === "escolha:passo:portagem" && J(c.efeitos.map((x) => x.tipo)) === J(["moedas", "avisa_vilao", "deixa"])));
  t("concluível por este ramo", js.turno(chegar).R.estado === "concluida");

  /* furtiva: o desvio, com a Lia ao lado */
  const jf = salvoAteAoPasso();
  jf.turno((e) => ({ ...e, lugar: { nome: "Trilho do Vau", cidade: CIDADE } }));
  t("furtiva: no desvio com a Lia, o passo fecha sem luta", jf.R.feitas.passo && jf.R.feitas.passo.ramo === "furtiva");
  t("e custa um dia e o relógio da região", jf.R.consequencias.some((c) => c.de === "passo:furtiva" && J(c.efeitos.map((x) => x.tipo)) === J(["dia", "relogio_regional"])));
  t("concluível por este ramo", jf.turno(chegar).R.estado === "concluida");
  const jf2 = salvoAteAoPasso();
  jf2.turno((e) => grupo({ ...e, lugar: { nome: "Trilho do Vau", cidade: CIDADE } }));
  t("no desvio SEM a Lia, o passo não fecha", !jf2.R.feitas.passo);

  /* a reviravolta: o guarda vendido (nunca se falou com ele) */
  const jg = salvoAteAoPasso(false);
  const vg = jg.ver();
  t("sem uma palavra ao guarda, a reviravolta dispara ao sair de Alto do Sal", vg.reviravolta && vg.reviravolta.id === "o_guarda_vendido" && /Teodoro/.test(vg.reviravolta.texto), J(vg.reviravolta));
  t("e o guarda passa a ocupar o papel do tenente (e a mão do vilão é ele)", jg.R.papeis.tenente.id === "npc|Teodoro" && vg.mao.id === "npc|Teodoro");
  jg.turno((e) => lutar(e, { nome: "Brás" }));
  t("vencer Brás já não passa o passo", !jg.R.feitas.passo);
  jg.turno((e) => lutar(e, { nome: "Teodoro" }));
  t("vencer o guarda, sim", jg.R.feitas.passo && jg.R.feitas.passo.ramo === "violenta");
  t("falar com o guarda evita a reviravolta", salvoAteAoPasso(true).R.reviravoltas.length === 0);

  /* a reviravolta: o protegido mente — três conversas e duas perguntas */
  const dobre = () => {
    const jd = salvoAteAoPasso();
    jd.turno((e) => consulta(consulta(falar(falar(e, "Lia"), "Lia"), "Lia"), "Lia"));
    return jd;
  };
  const jd = dobre();
  const vd = jd.ver();
  t("quem pergunta muito ouve a mentira: o protegido mente", vd.reviravolta && vd.reviravolta.id === "o_protegido_mente" && /roubou/.test(vd.reviravolta.texto));
  jd.turno((e) => lutar(e, { nome: "Brás" }));
  t("a etapa nova entra antes de chegar: depois do passo, decidir", jd.ver().etapa === "verdade" && J(jd.ver().escolhas) === J(["verdade"]), J(jd.ver()));
  const vv = vereditoDaEscolha(jd.F, jd.R, "verdade", jd.ctx());
  t("o veredito de entregar e de levar, os dois com os dois lados", vv && J(vv.opcoes.map((o) => o.id)) === J(["entregar", "levar"]) && vv.opcoes.every((o) => o.ganha && o.custa));
  const je = dobre(); je.turno((e) => lutar(e, { nome: "Brás" })).escolher("verdade", "entregar");
  t("entregar fecha a quest ali: falhada pela escolha (o vilão ficou com quem queria)", je.R.estado === "falhada" && je.R.motivo === "escolha" && /olhar/.test(je.R.fecho.texto), J(je.R));
  t("e quem se entregou fica cativo", je.R.consequencias.some((c) => c.de === "escolha:verdade:entregar" && c.efeitos.some((x) => x.tipo === "situacao" && x.situacao === "cativa")));
  const jl = dobre(); jl.turno((e) => lutar(e, { nome: "Brás" })).escolher("verdade", "levar");
  t("levar continua: a etapa de chegar volta a ser a atual", jl.R.estado === "aberta" && jl.ver().etapa === "chegar");
  t("e concluível por este ramo", jl.turno(chegar).R.estado === "concluida");

  /* a falha e o abandono */
  const jx = salvoAteAoPasso();
  jx.turno((e) => grupo(morre(e, "Lia")));
  t("a falha: a Lia morta, a quest falha", jx.R.estado === "falhada" && jx.R.motivo === "falha" && /Lia/.test(jx.R.fecho.texto));
  const ja = jogo("o_salvo_conduto", PSC, vazio());
  ja.turno((e) => dias(e, 5));
  t("cinco dias sem avançar: ainda aberta", ja.R.estado === "aberta");
  ja.turno((e) => dias(e, 1));
  t("seis: abandonada, com a frase e a Lia escondida", ja.R.estado === "falhada" && ja.R.motivo === "abandono" && ja.R.consequencias.some((c) => c.de === "abandono" && c.efeitos.some((x) => x.situacao === "escondida")));
  const jaa = jogo("o_salvo_conduto", PSC, vazio());
  jaa.turno((e) => dias(e, 5)).turno((e) => falar(e, "Lia")).turno((e) => dias(e, 5));
  t("uma etapa nova reinicia a contagem do abandono", jaa.R.estado === "aberta");
  t("a quest fechada não muda mais", J(avancarQuest(jx.F, jx.R, { estado: vazio() })) === J(jx.R));
}

sec("§3 As Cinzas de Ontem, por cada ramo");
const ARMAZEM = { nome: "Armazém do Sal", cidade: CIDADE };
function cinzasAteAoNome() {
  const j = jogo("as_cinzas_de_ontem", PCI, vazio());
  j.turno((e) => ir(e, ARMAZEM));
  j.turno((e) => segredo(falar(e, "Ana"), ARMAZEM));
  return j;
}
{
  const j0 = jogo("as_cinzas_de_ontem", PCI, vazio());
  t("abre na etapa «ver», e o gancho diz o lugar e o suspeito", j0.ver().etapa === "ver" && /Armazém do Sal/.test(j0.ver().gancho) && /Rui/.test(j0.ver().gancho));
  j0.turno((e) => ir(e, ARMAZEM));
  const vm = j0.ver();
  t("as marcas: duas de três, com o progresso «2 de»", vm.etapa === "marcas" && vm.falta[0].predicado === "pelo_menos" && vm.falta[0].precisa === 2 && vm.falta[0].tem === 0, J(vm.falta));
  j0.turno((e) => falar(e, "Ana"));
  t("uma pista não chega", j0.ver().etapa === "marcas" && j0.ver().falta[0].tem === 1);
  j0.turno((e) => ({ ...e, personagem: { ...e.personagem, inventario: [{ nome: "Ferrolho queimado do armazém" }] } }));
  t("duas chegam (a conversa e a prova na bolsa)", !!j0.R.feitas.marcas);

  const j = cinzasAteAoNome();
  const v = j.ver();
  t("o recado: as marcas lidas disparam a reviravolta", v.reviravolta && v.reviravolta.id === "o_recado" && /Rui/.test(v.reviravolta.texto));
  t("e o relógio do fio anda", j.R.consequencias.some((c) => c.de === "reviravolta:o_recado" && c.efeitos.some((x) => x.tipo === "relogio_do_fio" && x.n === 1)));
  t("a etapa atual é chegar ao suspeito", v.etapa === "nome");

  const fim = (ramoNome, justica) => {
    const jj = cinzasAteAoNome();
    jj.turno((e) => (ramoNome === "ouviu" ? falar(e, "Rui") : lutar(e, { nome: "Rui", rendido: true })));
    const antes = jj.ver();
    const semEscolha = antes.etapa === "justica" && antes.escolhas.length === 0 && /quem pagou o fogo/.test(antes.faltaTexto.join(" "));
    jj.turno((e) => falar(e, "Mira"));
    const aberta = J(jj.ver().escolhas) === J(["justica"]);
    jj.escolher("justica", justica);
    return { jj, semEscolha, aberta };
  };
  for (const ramoNome of ["ouviu", "bateu"]) {
    for (const justica of ["guarda", "praca", "cobrar"]) {
      const { jj, semEscolha, aberta } = fim(ramoNome, justica);
      t(`${ramoNome} · ${justica}: a escolha só abre depois de ver o mandante, e a quest conclui`,
        semEscolha && aberta && jj.R.estado === "concluida" && jj.R.feitas.nome.ramo === ramoNome && jj.R.feitas.justica.ramo === justica, J({ semEscolha, aberta, e: jj.R.estado, f: jj.R.feitas }));
    }
  }
  const { jj: jb } = fim("bateu", "guarda");
  t("bater no inocente rompe o laço com a testemunha", jb.R.consequencias.some((c) => c.de === "nome:bateu" && c.efeitos.some((x) => x.tipo === "rompe_laco" && x.papel === "testemunha")));
  const { jj: jo } = fim("ouviu", "praca");
  t("ouvi-lo não rompe nada, e a praça sobe a confiança da testemunha", !jo.R.consequencias.some((c) => c.efeitos.some((x) => x.tipo === "rompe_laco")) && jo.R.consequencias.some((c) => c.de === "escolha:justica:praca" && c.efeitos.some((x) => x.tipo === "afeicao" && x.n === 1)));
  t("o mandante sem nome até o herói o ver (alcunha), e com nome depois", /quem pagou o fogo/.test(cinzasAteAoNome().turno((e) => falar(e, "Rui")).ver().faltaTexto.join(" ")) && jo.ver().mao.quem === "Mira");

  /* a falha: o suspeito enforcado antes de ser ouvido — e só até ao nome */
  const jx = cinzasAteAoNome();
  jx.turno((e) => morre(e, "Rui"));
  t("enforcado antes de o ouvirem: falhada", jx.R.estado === "falhada" && jx.R.motivo === "falha" && /Rui/.test(jx.R.fecho.texto));
  const jy = cinzasAteAoNome();
  jy.turno((e) => falar(e, "Rui")).turno((e) => morre(e, "Rui"));
  t("morto depois de ouvido: a quest segue (a falha vale até ao nome)", jy.R.estado === "aberta" && jy.ver().etapa === "justica");
  const jz = cinzasAteAoNome();
  jz.turno((e) => lutar(e, { nome: "Rui" }));
  t("morto às mãos do herói: fecha o nome (bateu), não falha", jz.R.estado === "aberta" && jz.R.feitas.nome.ramo === "bateu");
  const ja = cinzasAteAoNome();
  ja.turno((e) => dias(e, 6));
  t("seis dias sem avançar: o rasto esfria, e o suspeito some", ja.R.estado === "falhada" && ja.R.motivo === "abandono" && ja.R.consequencias.some((c) => c.de === "abandono" && c.efeitos.some((x) => x.papel === "suspeito" && x.situacao === "escondida")));
}

sec("§4 A Carta Que Não Se Abre — do melhor ao pior");
const IAGO = (vinculo) => ({ nome: "Iago", vinculo });
const comIago = (vinculo) => grupo(vazio(), IAGO(vinculo));
const UM_TIPO_1_CONCLUIDO = [{ id: "o_salvo_conduto", tipo: 1, estado: "concluida" }];
/* joga a carta até ao fim, com as escolhas e o vínculo dados */
/* `depois`: o vínculo no frente a frente (a confiança pode cair depois de
   a ferida vir à mesa — sem confiança, ela nem vem) */
function carta({ vinculo = 80, carta: c = "abrir", frente = "interpor", ancora = true, depois = null } = {}) {
  const j = jogo("a_carta_que_nao_se_abre", PCA, comIago(vinculo), { quests: ancora ? UM_TIPO_1_CONCLUIDO : [] });
  j.turno((e) => dias(e, 3));
  j.turno((e) => falar(falar(falar(e, "Iago"), "Iago"), "Iago"));
  if (c) j.escolher("carta", c);
  j.turno((e) => falar({ ...e, cidadeAtual: FOZ, lugar: { nome: "Largo", cidade: FOZ } }, "Delfina"));
  j.turno((e) => falar(depois == null ? e : grupo(e, IAGO(depois)), "Delfina"));
  if (frente) j.escolher("frente", frente);
  return j;
}
{
  const j0 = jogo("a_carta_que_nao_se_abre", PCA, comIago(80), { quests: UM_TIPO_1_CONCLUIDO });
  const v0 = j0.ver();
  t("escondida ao abrir: sem gancho, sem etapa à vista, sem falta", v0.visivel === false && v0.gancho === "" && v0.etapaTexto === "" && v0.falta.length === 0 && v0.acesa === false, J(v0));
  j0.turno((e) => dias(e, 2));
  t("dois dias depois, ainda escondida (espera três)", j0.ver().visivel === false);
  j0.turno((e) => dias(e, 1));
  const v1 = j0.ver();
  t("ao terceiro dia, com o Iago ao lado e confiança, acende: o gancho aparece", v1.visivel && v1.acesa && /Iago/.test(v1.gancho) && /Delfina/.test(v1.gancho) && v1.etapa === "sinal", J(v1));
  const jsem = jogo("a_carta_que_nao_se_abre", PCA, comIago(10), { quests: UM_TIPO_1_CONCLUIDO });
  jsem.turno((e) => dias(e, 5));
  t("sem confiança nenhuma, não acende", jsem.ver().visivel === false);

  /* a âncora: o nome só acende depois de um tipo 1 concluído */
  const jan = carta({ ancora: false, frente: null });
  t("sem nenhuma quest do tipo 1 concluída, encontrar Delfina não acende", jan.ver().etapa === "nome" && jan.ver().acesa === false && jan.ver().falta.length === 0, J(jan.ver()));
  jan.extra = { quests: UM_TIPO_1_CONCLUIDO };
  jan.turno((e) => falar(e, "Delfina"));
  t("com uma concluída, acende e anda", jan.R.feitas.nome && jan.ver().etapa === "frente");
  /* o fogo primeiro: a casa dela ardeu, e o nome acende já */
  const jfo = jogo("a_carta_que_nao_se_abre", PCA, comIago(80), { quests: [] });
  jfo.turno((e) => dias(e, 3)).turno((e) => falar(falar(falar(e, "Iago"), "Iago"), "Iago")).escolher("carta", "abrir");
  jfo.turno((e) => ({ ...e, baseMundo: porSituacao(e.baseMundo, "Delfina", SITUACOES.ferida) }));
  t("a casa de Delfina ardeu: a reviravolta acende o nome sem esperar pela estrada", jfo.ver().reviravolta && jfo.ver().reviravolta.id === "o_fogo_primeiro" && jfo.ver().acesa === true && jfo.ver().etapa === "nome", J(jfo.ver()));

  /* o veredito do «deixar» avisa a morte antes do clique */
  const jv = carta({ frente: null });
  const vv = vereditoDaEscolha(jv.F, jv.R, "frente", jv.ctx());
  t("o veredito de deixá-los acertar contas diz, antes do clique, que o Iago pode não voltar", vv && /não volta/.test(vv.opcoes.find((o) => o.id === "deixar").custa) && /Iago/.test(vv.opcoes.find((o) => o.id === "deixar").custa));
  t("e pagar a dívida mostra o preço", vv.opcoes.find((o) => o.id === "pagar").custo === 60);

  /* cada desfecho, alcançado pelo que o herói fez */
  const d = (o) => carta(o).R;
  const perdao = d({ vinculo: 80, carta: "abrir", frente: "interpor" });
  t("perdão (o melhor): a carta aberta, confiança 3, o herói no meio", perdao.estado === "terminada" && perdao.desfecho === "perdao" && perdao.consequencias.some((c) => c.de === "desfecho:perdao" && c.efeitos.some((x) => x.tipo === "marco")), J(perdao));
  t("perdão também pagando a dívida", d({ vinculo: 80, carta: "abrir", frente: "pagar" }).desfecho === "perdao");
  t("a dívida paga: interpor sem a carta aberta", d({ vinculo: 80, carta: "guardar", frente: "interpor" }).desfecho === "a_divida_paga");
  t("a dívida paga: com pouca confiança, o mesmo gesto não chega ao perdão", d({ vinculo: 55, carta: "abrir", frente: "pagar" }).desfecho === "a_divida_paga");
  t("a cicatriz: deixá-los, com a carta guardada e confiança 2", d({ vinculo: 55, carta: "guardar", frente: "deixar" }).desfecho === "a_cicatriz");
  const pior1 = d({ vinculo: 80, carta: "queimar", frente: "deixar" });
  t("o preço inteiro (o pior): a carta queimada e deixá-los acertar — o Iago morre", pior1.desfecho === "o_preco_inteiro" && pior1.consequencias.some((c) => c.de === "desfecho:o_preco_inteiro" && c.efeitos.some((x) => x.tipo === "morte" && x.papel === "quem")));
  /* o pior com pouca confiança: o vínculo tem de descer depois de a batida acender */
  const jp2 = carta({ vinculo: 55, carta: "abrir", frente: null });
  jp2.e = grupo(jp2.e, IAGO(30));
  jp2.escolher("frente", "deixar");
  t("o preço inteiro também quando o Iago já não tem por que viver (confiança abaixo de 2)", jp2.R.desfecho === "o_preco_inteiro", J(jp2.R));
  const jab = carta({ frente: null });
  jab.turno((e) => dias(e, 15));
  t("a ferida fica (o padrão): a história ignorada acaba mal, mas acaba", jab.R.estado === "terminada" && jab.R.desfecho === "a_ferida_fica" && jab.R.motivo === "abandono");
  const jtd = carta({ frente: null });
  jtd.turno((e) => morre(e, "Delfina"));
  t("tarde demais: Delfina morta antes do frente a frente", jtd.R.desfecho === "tarde_demais" && jtd.R.motivo === "cedo");
  const jcf = carta({ carta: null, frente: null });
  jcf.turno((e) => grupo(morre(e, "Iago")));
  t("a carta fechada: o Iago morto por outra mão, antes do fim", jcf.R.desfecho === "a_carta_fechada");
  const alcancados = new Set([perdao, d({ vinculo: 80, carta: "guardar", frente: "interpor" }), d({ vinculo: 55, carta: "guardar", frente: "deixar" }), pior1, jab.R, jtd.R, jcf.R].map((r) => r.desfecho));
  const F2 = questPorId("a_carta_que_nao_se_abre");
  t("todos os desfechos da ficha foram alcançados", F2.desfechos.every((x) => alcancados.has(x.id)), [...alcancados].join(", "));
  t("a ordem: o perdão é o 1, o preço inteiro o último", carta({ vinculo: 80 }).ver().ordem === 1 && carta({ vinculo: 80, carta: "queimar", frente: "deixar" }).ver().ordem === F2.desfechos.length);

  t("sem confiança 2, a ferida nem vem à mesa: a quest fica no sinal", carta({ vinculo: 30 }).ver().etapa === "sinal");
  /* O PIOR NUNCA SEM CAUSA: todas as combinações de escolhas e da
     confiança no frente a frente */
  const combos = [];
  for (const vinculo of [30, 55, 80]) for (const c of ["abrir", "guardar", "queimar"]) for (const frente of ["interpor", "pagar", "deixar"]) {
    const r = carta({ vinculo: 80, depois: vinculo, carta: c, frente }).R;
    combos.push({ vinculo, c, frente, desfecho: r.desfecho, estado: r.estado });
  }
  t("as 27 combinações acabam todas num desfecho", combos.every((x) => x.estado === "terminada" && x.desfecho), J(combos.filter((x) => x.estado !== "terminada")));
  t("o pior só chega a quem escolheu deixá-los acertar contas", combos.filter((x) => x.desfecho === "o_preco_inteiro").every((x) => x.frente === "deixar") && combos.some((x) => x.desfecho === "o_preco_inteiro"));
  t("pôr-se no meio ou pagar nunca mata ninguém", combos.filter((x) => x.frente !== "deixar").every((x) => !["o_preco_inteiro", "a_carta_fechada"].includes(x.desfecho)));
  t("a carta guardada e confiança: deixar não mata (a cicatriz)", combos.filter((x) => x.frente === "deixar" && x.c !== "queimar" && x.vinculo >= 55).every((x) => x.desfecho === "a_cicatriz"));
  t("e o abandono nunca dá o pior", jab.R.desfecho !== "o_preco_inteiro");
  t("nenhuma etapa da carta pede a morte de ninguém", !F2.etapas.some((e) => predicadosDe(e.conclui).includes("morto")));
}

sec("§5 a quest nunca nasce feita");
{
  const jaFalou = falar(vazio(), "Lia");
  t("o Salvo-Conduto com a Lia já ouvida não abre (a primeira etapa já está cumprida)", abrirQuest("o_salvo_conduto", { estado: jaFalou, papeis: PSC }) === null);
  t("com a Lia morta, também não (a falha já aconteceu)", abrirQuest("o_salvo_conduto", { estado: morre(vazio(), "Lia"), papeis: PSC }) === null);
  t("as Cinzas com o herói já no armazém não abrem", abrirQuest("as_cinzas_de_ontem", { estado: ir(vazio(), ARMAZEM), papeis: PCI }) === null);
  t("a Carta com a Delfina já morta não abre (o desfecho já se deu)", abrirQuest("a_carta_que_nao_se_abre", { estado: morre(comIago(80), "Delfina"), papeis: PCA }) === null);
  const todas = BIBLIOTECA_DE_QUESTS.map((q) => abrirQuest(q, { estado: comIago(80), papeis: { ...PSC, ...PCI, ...PCA } }));
  t("num mundo vazio, as três abrem, abertas e sem nenhuma etapa feita", todas.every((r) => r && r.estado === "aberta" && Object.keys(r.feitas).length === 0));
  t("e nenhuma fecha uma etapa no turno em que abre", BIBLIOTECA_DE_QUESTS.every((q, i) => Object.keys(avancarQuest(q, todas[i], { estado: comIago(80) }).feitas).length === 0));
}

sec("§6 a menção não fecha");
{
  const j = jogo("o_salvo_conduto", PSC, vazio());
  j.turno((e) => nomear(e, "Lia", "Brás", "Teodoro"));
  t("a Lia só nomeada: ouvir a Lia não fecha", !j.R.feitas.aceitar && J(j.ver().faltaTexto) === J(["falar com Lia"]));
  const jp = salvoAteAoPasso();
  jp.turno((e) => nomear(e, "Brás"));
  t("Brás nomeado não é Brás vencido", !jp.R.feitas.passo);
  const jc = jogo("as_cinzas_de_ontem", PCI, vazio());
  jc.turno((e) => ir(e, ARMAZEM)).turno((e) => nomear(e, "Ana", "Rui"));
  t("a testemunha e o suspeito nomeados não contam como pistas", jc.ver().etapa === "marcas" && jc.ver().falta[0].tem === 0);
  const jm = cinzasAteAoNome();
  jm.turno((e) => falar(nomear(e, "Mira"), "Rui"));
  t("o mandante nomeado não abre a escolha (é preciso vê-lo)", jm.ver().escolhas.length === 0);
  const jk = carta({ frente: null });
  jk.turno((e) => nomear(e, "Delfina"));
  t("e na Carta, nomear não substitui a conversa", jk.ver().etapa === "frente" && !jk.R.desfecho);
}

sec("§7 escolheu e etapa — o registo, e quem o escreve");
{
  t("os dois deixaram de estar reservados, e leem só a quest", !CONDICOES.escolheu.reservado && !CONDICOES.etapa.reservado && J(CONDICOES.escolheu.le) === J(["quest"]) && J(CONDICOES.etapa.le) === J(["quest"]));
  t("quem os escreve é deste módulo: escolherNaQuest e avancarQuest",
    CONDICOES.escolheu.portas[0].modulo === "src/biblioteca-de-quests.js" && CONDICOES.escolheu.portas[0].funcao === "escolherNaQuest" && typeof escolherNaQuest === "function"
    && CONDICOES.etapa.portas[0].funcao === "avancarQuest" && typeof avancarQuest === "function");
  const ctxQ = (quest) => ({ estado: vazio(), papeis: {}, quest });
  t("escolheu: verdade só com a escolha no registo", avaliarCondicao(["escolheu", "passo", "portagem"], ctxQ({ escolhas: { passo: "portagem" } })) && !avaliarCondicao(["escolheu", "passo", "portagem"], ctxQ({ escolhas: { passo: "outra" } })) && !avaliarCondicao(["escolheu", "passo", "portagem"], ctxQ(null)));
  t("etapa: verdade só com a etapa feita no registo", avaliarCondicao(["etapa", "aceitar"], ctxQ({ feitas: { aceitar: true } })) && !avaliarCondicao(["etapa", "aceitar"], ctxQ({ feitas: {} })));
  t("o livro não as escreve: com o livro cheio e sem registo, nada", !avaliarCondicao(["etapa", "aceitar"], { estado: falar(vazio(), "Lia"), papeis: PSC }));
  t("a frase do «o que falta» vem do registo (a escolha em mundo)", julgarEtapa({ conclui: ["escolheu", "passo", "portagem"] }, ctxQ({ rotulos: { "passo:portagem": "pagar a portagem em Vau Negro" } })).falta[0].texto === "pagar a portagem em Vau Negro");

  const j = salvoAteAoPasso();
  t("a escolha fora da etapa dela é recusada (o MESMO registo)", (() => { const jj = jogo("o_salvo_conduto", PSC, vazio()); const r0 = jj.R; return escolherNaQuest(jj.F, r0, "passo", "portagem", jj.ctx()) === r0; })());
  t("a opção que não existe é recusada", escolherNaQuest(j.F, j.R, "passo", "suborno", j.ctx()) === j.R);
  t("a escolha que não existe é recusada", escolherNaQuest(j.F, j.R, "voo", "alto", j.ctx()) === j.R);
  const pobre = { ...j.ctx(), estado: { ...j.e, personagem: { ...j.e.personagem, moedas: 10 } } };
  const vpobre = vereditoDaEscolha(j.F, j.R, "passo", pobre);
  t("sem moedas para a portagem: o veredito diz que não dá, e a escolha é recusada", vpobre.opcoes[0].podeEscolher === false && escolherNaQuest(j.F, j.R, "passo", "portagem", pobre) === j.R);
  const jx = salvoAteAoPasso(); jx.escolher("passo", "portagem");
  t("a escolha é irreversível: escolher outra vez é recusado", escolherNaQuest(jx.F, jx.R, "passo", "portagem", jx.ctx()) === jx.R && jx.R.escolhas.passo.opcao === "portagem");
  t("vereditoDaEscolha da escolha fechada: null", vereditoDaEscolha(jx.F, jx.R, "passo", jx.ctx()) === null);

  /* a alcunha: o nome do tenente só depois de o herói o ver */
  t("antes de ver Brás, o «o que falta» chama-lhe a alcunha", /a mão que guarda Vau Negro/.test(j.ver().faltaTexto.join(" ")) && !/Brás/.test(j.ver().faltaTexto.join(" ")));
  const jv = salvoAteAoPasso(); jv.turno((e) => falar(e, "Brás"));
  t("depois de falar com ele frente a frente, o nome", /vencer Brás/.test(jv.ver().faltaTexto.join(" ")) && jv.ver().mao.quem === "Brás", J(jv.ver().faltaTexto));
  t("a vista nunca deixa chaveta nem nome de papel no texto", (() => {
    const vs = [j.ver(), jv.ver(), carta().ver(), cinzasAteAoNome().ver()];
    const txt = vs.map((v) => [v.gancho, v.etapaTexto, ...v.faltaTexto, v.reviravolta && v.reviravolta.texto, v.fecho && v.fecho.texto].join(" ")).join(" ");
    return !/[{}]|papel:|lugar:|item:|\b(protegido|tenente|mandante|suspeito|testemunha)\b/.test(txt);
  })());
}

sec("§8 o null, o lixo, a imutabilidade e o determinismo");
{
  const F = questPorId("o_salvo_conduto");
  t("abrir com lixo: null, sem lançar", [null, undefined, "nao_existe", 3, {}].every((f) => abrirQuest(f, { estado: vazio(), papeis: PSC }) === null));
  t("abrir com contexto null ou estado null: abre, com os papéis por preencher", (() => { const r = abrirQuest(F, null); return r && r.estado === "aberta" && Object.values(r.papeis).every((p) => p.id === "" || p.id === undefined || typeof p.id === "string"); })());
  t("avançar, ver e vereditar com registo null ou de outra quest: null", avancarQuest(F, null, {}) === null && estadoDaQuest(F, null, {}) === null && vereditoDaEscolha(F, null, "passo", {}) === null && avancarQuest(F, { id: "outra" }, {}) === null);
  t("escolher com registo null devolve o que recebeu", escolherNaQuest(F, null, "passo", "portagem", {}) === null);
  t("o registo de lixo (campos tortos) não lança e fica aberto", (() => { const r = avancarQuest(F, { id: F.id, feitas: 7, escolhas: null, reviravoltas: "x", estado: "voando" }, { estado: vazio() }); return r && r.estado === "aberta"; })());
  t("o estado de lixo não lança", (() => { try { const j = jogo("o_salvo_conduto", PSC, vazio()); return !!avancarQuest(F, j.R, { estado: { factos: 7, npcs: null, personagem: "x", dia: "hoje" } }); } catch { return false; } })());
  /* imutável: o registo e o estado congelados passam, e saem iguais */
  const j = salvoAteAoPasso();
  const R = congelar(copia(j.R)), E = congelar(copia(lutar(j.e, { nome: "Brás" })));
  const fR = J(R), fE = J(E);
  let lancou = false, R2 = null;
  try { R2 = avancarQuest(F, R, { estado: E }); estadoDaQuest(F, R, { estado: E }); vereditoDaEscolha(F, R, "passo", { estado: E }); escolherNaQuest(F, R, "passo", "portagem", { estado: E }); } catch { lancou = true; }
  t("registo e estado congelados: nada lança, nada muda, e sai um registo novo", !lancou && J(R) === fR && J(E) === fE && R2 !== R && R2.feitas.passo);
  /* o save: o registo vai e volta por JSON e dá o mesmo */
  const jj = carta({ frente: null });
  const ida = copia(jj.R);
  t("o registo atravessa o save (JSON) e dá a mesma vista", J(estadoDaQuest(jj.F, ida, jj.ctx())) === J(jj.ver()));
  /* determinismo: o mesmo guião, duas vezes, dá o mesmo registo byte a byte */
  const guiao = () => { turno = 1000; const k = carta({ vinculo: 55, carta: "guardar", frente: "deixar" }); return J(k.R) + J(k.ver()); };
  t("determinístico: o mesmo guião dá o mesmo registo e a mesma vista", guiao() === guiao());
  const guiaoSC = () => { turno = 2000; const k = salvoAteAoPasso(false); k.turno((e) => lutar(e, { nome: "Teodoro", rendido: true })).turno(chegar); return J(k.R); };
  t("e o Salvo-Conduto com a reviravolta também", guiaoSC() === guiaoSC());
  t("o módulo não sorteia: nenhuma função recebe sorte", [abrirQuest, avancarQuest, escolherNaQuest, vereditoDaEscolha, estadoDaQuest].every((f) => !/sorte|Math\.random/.test(String(f))));
}

console.log(`\nBQ4 · a biblioteca de quests: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
