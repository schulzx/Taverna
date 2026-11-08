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
   §8 o null, o lixo, a imutabilidade e o determinismo;
   §9 o acervo, lote 2 (BQ8) — as seis quests novas por cada ramo, e a
      cobertura contada da ficha: todo ramo, opção, reviravolta, falha e
      desfecho alcançado por um guião; o pior do tipo 2 só pela escolha que
      o veredito avisa;
   §10 o acervo, lote 3 (BQ8) — as oito quests novas pela mesma régua, e o
      género de quem ocupa o papel pelo marcador;
   §11 o acervo, lote 4 (BQ8) — as dez quests de src/acervo/quests-lote-4.js,
      com a fera que se vê e não se fala, pela mesma régua. */
import {
  BIBLIOTECA_DE_QUESTS, TIPOS_DE_QUEST, QUANDO_DA_QUEST, ESTADOS_DA_QUEST, PAPEIS_DA_QUEST, MAOS_DO_VILAO,
  LIMITES_DA_QUEST, EFEITOS_DA_QUEST, EFEITOS_DA_REVIRAVOLTA, ATOS_DO_HEROI,
  questPorId, validarQuest, abrirQuest, avancarQuest, escolherNaQuest, vereditoDaEscolha, estadoDaQuest, NATUREZAS_DO_FIO,
} from "../src/biblioteca-de-quests.js";
import { QUESTS_LOTE_4 } from "../src/acervo/quests-lote-4.js";
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
  /* movida na BQ8: o catálogo era só as três da planta; o acervo cresce por
     lotes de seis, e a intenção — as três da planta à cabeça, pela ordem, e
     cada lote inteiro e sem repetidos — fica */
  const ids = BIBLIOTECA_DE_QUESTS.map((q) => q.id);
  /* movida no lote 3 (BQ8): o lote 2 era o fim do catálogo (slice(3));
     agora vem o lote 3 a seguir, e cada lote confere-se no seu troço */
  /* movida no lote 4 (BQ8, 09/11): o lote 3 era o fim do catálogo
     (slice(9)); agora o lote 4 vem a seguir, e vem de outro ficheiro
     (src/acervo/quests-lote-4.js). A intenção — cada lote inteiro, no seu
     troço, pela ordem, sem repetidos — fica; o troço do lote 4 lê-se do
     próprio ficheiro, que é a fonte, e não de uma lista copiada aqui */
  t("o catálogo tem as três quests da planta à cabeça, o lote 2 do acervo a seguir, o lote 3 depois, e o lote 4 (do seu ficheiro) a seguir",
    J(ids.slice(0, 3)) === J(["o_salvo_conduto", "as_cinzas_de_ontem", "a_carta_que_nao_se_abre"])
    && J(ids.slice(3, 9)) === J(["a_mao_que_mudou_de_lado", "o_celeiro_de_inverno", "o_convite_sem_selo", "o_cimo_da_escada", "os_dias_que_faltam", "a_lamina_enterrada"])
    && J(ids.slice(9, 17)) === J(["o_que_desce_ao_anoitecer", "as_botas_na_estrada", "os_bracos_que_faltam", "o_ultimo_a_sair", "o_velorio_pago", "a_hora_marcada", "o_sangue_do_outro_lado", "as_cartas_de_outra_casa"])
    && J(ids.slice(17, 27)) === J(QUESTS_LOTE_4.map((q) => q.id)) && QUESTS_LOTE_4.length === 10
    && new Set(ids).size === ids.length);
  const invalidas = BIBLIOTECA_DE_QUESTS.map((q) => [q.id, validarQuest(q)]).filter(([, v]) => !v.ok);
  t("cada quest passa a validação inteira", invalidas.length === 0, J(invalidas));
  /* movida na BQ8: eram «dois do tipo 1 e um do tipo 2» (as três da
     planta); o lote 2 traz quatro do tipo 1 e dois do tipo 2 */
  /* movida no lote 4: o lote 3 deixou de ser a cauda (slice(9) → slice(9, 17)) */
  t("as da planta: dois do tipo 1 e um do tipo 2; o lote 2: quatro e dois; o lote 3: seis e dois; o lote 4: sete e três; os tipos são os da tabela",
    J(BIBLIOTECA_DE_QUESTS.slice(0, 3).map((q) => q.tipo)) === J([1, 1, 2]) && J(BIBLIOTECA_DE_QUESTS.slice(3, 9).map((q) => q.tipo)) === J([1, 1, 1, 1, 2, 2])
    && J(BIBLIOTECA_DE_QUESTS.slice(9, 17).map((q) => q.tipo)) === J([1, 1, 1, 1, 1, 1, 2, 2])
    && J(BIBLIOTECA_DE_QUESTS.slice(17, 27).map((q) => q.tipo)) === J([1, 1, 1, 1, 1, 1, 1, 2, 2, 2]) && BIBLIOTECA_DE_QUESTS.every((q) => TIPOS_DE_QUEST[q.tipo]));
  /* o lote 2 contesta os passos que as três da planta não contestavam, com
     as mãos que faltavam ao esqueleto: a pista, o recurso, o rosto e o
     confronto, e o «quando» de cedo a fim */
  /* movida no lote 3 (BQ8): o lote 2 contestava só o 4, o 5 e o 6. O
     Celeiro de Inverno passou a contestar também o 2 — só com o 4, a pista
     ganhava-lhe sempre, e o esqueleto mediu-o em 0 de 1000 campanhas. As
     mãos do lote 2 continuam as quatro que faltavam ao esqueleto */
  const lote2 = BIBLIOTECA_DE_QUESTS.slice(3, 9).filter((q) => q.tipo === 1);
  t("o lote 2 contesta os passos 4, 5 e 6 (e o Celeiro também o 2), com a pista, o recurso, o rosto e o confronto",
    J([...new Set(lote2.flatMap((q) => q.mao.contra))].sort()) === J([2, 4, 5, 6]) && J(lote2.map((q) => q.mao.tipo).sort()) === J(["confronto", "pista", "recurso", "rosto"]));
  /* o lote 3 foi escrito para o que o esqueleto mediu: o 1 e o 2 com mais de
     uma quest, o 3 e o 4 por uma quest do meio, um segundo rosto e um
     segundo confronto */
  /* movida no lote 4: o lote 3 é o troço 9–17 (era a cauda) */
  const lote3 = BIBLIOTECA_DE_QUESTS.slice(9, 17).filter((q) => q.tipo === 1);
  t("o lote 3: duas ou mais contestam o passo 2, uma do meio contesta o 3 e o 4, e há um segundo rosto e um segundo confronto",
    lote3.filter((q) => q.mao.contra.includes(2)).length >= 2
    && lote3.some((q) => q.quando.includes("meio") && [3, 4].every((p) => q.mao.contra.includes(p)))
    && lote3.some((q) => q.mao.tipo === "rosto") && lote3.some((q) => q.mao.tipo === "confronto"));
  t("e o «quando» do lote 3 vai de cedo a fim", ["cedo", "meio", "fim"].every((w) => lote3.some((q) => q.quando.includes(w))));
  /* O LOTE 4 (09/11) foi escrito para o que o esqueleto mediu no lote 3:
     o vilão que é bicho (549 de 1000) sentava-se à mesa do Convite e do
     Velório; 18,8% dos mundos não tinham um servo que fosse gente; e o
     passo 4 das espinhas de quatro atos ficava por contestar em 216 de 500 */
  const lote4 = QUESTS_LOTE_4.filter((q) => q.tipo === 1);
  const vilaoDe = (q) => Object.values(q.papeis).find((p) => p.de === "fio" && p.papel === "vilao") || null;
  const aceitaFera = (p) => !!p && (p.aceita || PAPEIS_DA_QUEST.fio.aceitaOVilao).includes("fera");
  const rostoFera = lote4.filter((q) => q.mao.tipo === "rosto" && J(vilaoDe(q) && vilaoDe(q).aceita) === J(["fera"]));
  t("o lote 4 tem um rosto só de fera, e é uma demonstração: o encontro fecha por ver, nunca por falar, e uma das respostas é recuar",
    rostoFera.length >= 1 && rostoFera.every((q) => {
      const enc = q.etapas.find((e) => J(e.conclui).includes('"conheceu","papel:vilao"'));
      const ops = Object.values(q.escolhas).flatMap((e) => Object.keys(e.opcoes));
      return enc && !J(enc.conclui).includes('"conversou","papel:vilao"') && ops.includes("recuar");
    }));
  t("e um confronto que serve a fera, com as sentenças que DESFECHOS_DO_VILAO lê",
    lote4.some((q) => q.mao.tipo === "confronto" && aceitaFera(vilaoDe(q)) && ["cumprir", "poupar", "acabar", "selar"].every((o) => Object.values(q.escolhas).some((e) => e.opcoes[o]))));
  t("as cenas de mesa (o Convite e o Velório) só aceitam um vilão que seja gente; sem dizer nada, o vilão é das duas naturezas",
    ["o_convite_sem_selo", "o_velorio_pago"].every((id) => J(vilaoDe(questPorId(id)).aceita) === J(["gente"]))
    && J(PAPEIS_DA_QUEST.fio.aceitaOVilao) === J(["gente", "fera"]) && Object.keys(NATUREZAS_DO_FIO).every((n) => PAPEIS_DA_QUEST.fio.aceitaOVilao.includes(n)));
  const servoFera = (q) => Object.values(q.papeis).some((p) => p.de === "fio" && p.papel !== "vilao" && (p.aceita || []).includes("fera"));
  t("um servo que pode ser bicho no passo 3, e outro numa quest do meio que contesta o 3 e o 4",
    lote4.some((q) => servoFera(q) && J(q.mao.contra) === J([3]))
    && lote4.some((q) => servoFera(q) && q.quando.includes("meio") && [3, 4].every((p) => q.mao.contra.includes(p))));
  t("e o «quando» do lote 4 vai de cedo a fim, com o tipo 2 em três temas novos", ["cedo", "meio", "fim"].every((w) => lote4.some((q) => q.quando.includes(w)))
    && QUESTS_LOTE_4.filter((q) => q.tipo === 2).length === 3);
  /* um servo do fio diz o que aceita (NATUREZAS_DO_FIO); por omissão, gente */
  const papeisDoFio = BIBLIOTECA_DE_QUESTS.flatMap((q) => Object.values(q.papeis).filter((p) => p.de === "fio" && p.papel !== "vilao"));
  t("o que um servo aceita é das NATUREZAS_DO_FIO, e só gente quando a ficha não diz",
    J(PAPEIS_DA_QUEST.fio.aceita) === J(["gente"]) && papeisDoFio.every((p) => (p.aceita || PAPEIS_DA_QUEST.fio.aceita).every((x) => NATUREZAS_DO_FIO[x]))
    && papeisDoFio.some((p) => J(p.aceita) === J(["fera"])));
  /* os papéis de coisa que não são da fraqueza têm nome (o esqueleto lê `nome` ou `nomes`) */
  const coisas = BIBLIOTECA_DE_QUESTS.flatMap((q) => Object.entries(q.papeis).filter(([, p]) => p.de === "item" && !p.fraqueza).map(([k, p]) => [q.id, k, p]));
  t("todo papel de coisa fora da fraqueza tem nome, para não chegar à tela com o nome do papel",
    coisas.length >= 3 && coisas.every(([, , p]) => (typeof p.nome === "string" && p.nome.trim()) || (Array.isArray(p.nomes) && p.nomes.length && p.nomes.every((x) => typeof x === "string" && x.trim()))),
    coisas.filter(([, , p]) => !p.nome && !p.nomes).map(([q, k]) => q + "." + k).join(", "));
  t("e o «quando» do lote 2 vai de cedo a fim", ["cedo", "meio", "fim"].every((w) => lote2.some((q) => q.quando.includes(w))));
  t("o rosto tem a opção «aceitar» e o confronto «cumprir», «poupar» e «selar» (o que DESFECHOS_DO_VILAO lê)",
    (() => { const op = (q) => Object.values(q.escolhas).flatMap((e) => Object.keys(e.opcoes)); const r = lote2.find((q) => q.mao.tipo === "rosto"), c = lote2.find((q) => q.mao.tipo === "confronto");
      return op(r).includes("aceitar") && ["cumprir", "poupar", "selar"].every((o) => op(c).includes(o)); })());
  t("o tipo 2 do lote 2 toca o vilão pela ponte, e não pela mão", BIBLIOTECA_DE_QUESTS.slice(3).filter((q) => q.tipo === 2).every((q) => q.mao === null && q.ponte.length > 20));
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
  recusa("o «aceita» fora das naturezas: recusado", sc, (c) => { c.papeis.tenente.aceita = ["dragao"]; }, "aceita");
  recusa("o «aceita» num papel que não é servo do fio: recusado", sc, (c) => { c.papeis.guarda.aceita = ["fera"]; }, "aceita");
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
  /* movida na BQ8: as três da planta, com os papéis delas (o lote 2 tem
     papéis com os mesmos nomes e outra gente, e prova-se no §9) */
  const planta = BIBLIOTECA_DE_QUESTS.slice(0, 3);
  const todas = planta.map((q) => abrirQuest(q, { estado: comIago(80), papeis: { ...PSC, ...PCI, ...PCA } }));
  t("num mundo vazio, as três abrem, abertas e sem nenhuma etapa feita", todas.every((r) => r && r.estado === "aberta" && Object.keys(r.feitas).length === 0));
  t("e nenhuma fecha uma etapa no turno em que abre", planta.every((q, i) => Object.keys(avancarQuest(q, todas[i], { estado: comIago(80) }).feitas).length === 0));
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

sec("§9 o acervo, lote 2 (BQ8) — cada quest por cada ramo, e a cobertura contada");
/* As seis quests do lote 2, jogadas pelas mesmas portas das três da
   planta. Cada caso é um guião; no fim, a COBERTURA é contada da ficha e
   não da lista de casos: todo ramo de toda etapa (as que uma reviravolta
   abre incluídas), toda opção de toda escolha, toda reviravolta, toda
   falha, o abandono e todo desfecho têm de ter sido alcançados por um
   guião. Uma ficha nova que acrescente um ramo sem guião fica vermelha. */
const NOVOS = {
  Otília: N("Otília"), Bento: N("Bento"), Cardo: N("Cardo"),
  Isaura: N("Isaura"), Joana: N("Joana"), Gaspar: N("Gaspar"),
  Quelvar: N("Quelvar"), Leonor: N("Leonor"), Tomé: N("Tomé"), Sancha: N("Sancha"), Teodora: N("Teodora"),
  Ermelinda: N("Ermelinda"), Rufino: N("Rufino", FOZ), Anselmo: N("Anselmo", FOZ),
};
const mundo2 = (membros = []) => ({ ...vazio(), npcs: { ...NPCS, ...NOVOS }, personagem: { ...vazio().personagem, grupo: membros } });
const ficha = (e, nome, campos) => ({ ...e, npcs: { ...e.npcs, [nome]: { ...e.npcs[nome], ...campos } } });
const levar = (e, ...coisas) => ({ ...e, personagem: { ...e.personagem, inventario: [...e.personagem.inventario, ...coisas.map((nome) => ({ nome }))] } });
const em = (e, lugar) => ({ ...e, jornada: null, lugar, cidadeAtual: lugar.cidade });
const juntar = (e, ...membros) => grupo(e, ...e.personagem.grupo, ...membros);

const ADEGA = { nome: "Adega Velha", cidade: CIDADE }, CARTORIO = { nome: "Cartório", cidade: CIDADE }, CAIS = { nome: "Cais", cidade: FOZ };
const CELEIRO = { nome: "Celeiro do Monte", cidade: CIDADE }, SALAO = { nome: "Salão das Velas", cidade: CIDADE }, PRACA = { nome: "Praça", cidade: CIDADE };
const TORRE = { nome: "Torre Negra", cidade: CIDADE }, ALFANDEGA = { nome: "Alfândega", cidade: CIDADE };
const HORTO = { nome: "Horto das Freiras", cidade: FOZ }, ERMIDA = { nome: "Ermida da Pedra", cidade: FOZ };
const PAPEIS2 = {
  a_mao_que_mudou_de_lado: { desertor: { nome: "Otília" }, esconderijo: ADEGA, refugio: { cidade: FOZ }, arquivo: CARTORIO, prova: { nome: "o selo de lacre" }, cacador: { nome: "Cardo" }, vitima: { nome: "Bento" } },
  o_celeiro_de_inverno: { celeiro: CELEIRO, dono: { nome: "Isaura" }, faminta: { nome: "Joana" }, comprador: { nome: "Gaspar" } },
  o_convite_sem_selo: { vilao: { nome: "Quelvar" }, anfitriao: { nome: "Leonor" }, salao: SALAO, refem: { nome: "Tomé" } },
  o_cimo_da_escada: { vilao: { nome: "Quelvar" }, covil: TORRE, braco: { nome: "Sancha" }, refem: { nome: "Tomé" } },
  os_dias_que_faltam: { quem: { nome: "Iago" }, curandeira: { nome: "Ermelinda" }, horto: HORTO },
  a_lamina_enterrada: { quem: { nome: "Iago" }, vingador: { nome: "Rufino" }, templo: ERMIDA, sacerdote: { nome: "Anselmo" } },
};
const LOTE2 = Object.keys(PAPEIS2);

/* um guião: cada passo é uma função do estado (um turno) ou ["escolher", chave, opção] */
const casos = [];
function guiao(id, nome, passos, { papeis = {}, e0 = mundo2(), quests = UM_TIPO_1_CONCLUIDO, falha = null } = {}) {
  const j = jogo(id, { ...PAPEIS2[id], ...papeis }, e0, { quests });
  for (const p of passos) {
    if (Array.isArray(p)) {
      const ver = vereditoDaEscolha(j.F, j.R, p[1], j.ctx());
      if (!ver) { casos.push({ id, nome, j, falha, erro: `a escolha «${p[1]}» não estava aberta` }); return j; }
      j.vereditos = [...(j.vereditos || []), ver];
      j.escolher(p[1], p[2]);
    } else j.turno(p);
  }
  casos.push({ id, nome, j, falha });
  return j;
}

/* ---- A Mão Que Mudou de Lado ---- */
const acharOtilia = (e) => consulta(falar(ir(e, ADEGA), "Otília"), "Otília");
const MAO = "a_mao_que_mudou_de_lado";
const m1 = guiao(MAO, "amnistia · a verdade · poupar o caçador", [acharOtilia, ["escolher", "preco", "amnistia"], (e) => segredo(e, CARTORIO), (e) => lutar(e, { nome: "Cardo", rendido: true })]);
t("a Mão: amnistia, o cartório descoberto, o caçador poupado — concluída", m1.R.estado === "concluida" && m1.R.feitas.prova.ramo === "verdade" && m1.R.feitas.salvo.variante === "poupou", J(m1.R.feitas));
t("e o perdão custa a confiança de quem enterrou um irmão", m1.R.consequencias.some((c) => c.de === "escolha:preco:amnistia" && c.efeitos.some((x) => x.tipo === "afeicao" && x.papel === "vitima" && x.n === -1)));
const m2 = guiao(MAO, "amnistia · a coisa · a fuga para o refúgio", [acharOtilia, ["escolher", "preco", "amnistia"], (e) => levar(e, "Selo de lacre negro"), (e) => em(juntar(e, { nome: "Otília", vinculo: 30 }), CAIS)]);
t("a Mão: o selo na bolsa, e Otília levada até Foz — concluída pela fuga", m2.R.estado === "concluida" && m2.R.feitas.prova.ramo === "coisa" && m2.R.feitas.salvo.ramo === "fuga", J(m2.R.feitas));
const m3 = guiao(MAO, "justiça · a outra metade · matar o caçador", [acharOtilia, ["escolher", "preco", "justica"], (e) => consulta(falar(e, "Bento"), "Otília"), (e) => segredo(e, CARTORIO), (e) => lutar(e, { nome: "Cardo" })]);
t("a Mão: a justiça abre a outra metade, que se arranca com duas de três", m3.R.reviravoltas.some((r) => r.id === "a_outra_metade") && !!m3.R.feitas.metade && m3.R.estado === "concluida" && m3.R.feitas.salvo.variante === "matou", J(m3.R));
const m4 = guiao(MAO, "a janela aberta", [(e) => falar(ir(e, ADEGA), "Otília"), ["escolher", "preco", "amnistia"], (e) => segredo(e, CARTORIO)]);
t("a Mão: quem não pergunta como Otília fugiu dispara a janela aberta, e o cartório já não chega", m4.R.reviravoltas.some((r) => r.id === "a_janela_aberta") && !m4.R.feitas.prova, J(m4.R.reviravoltas));
m4.turno((e) => falar(e, "Cardo"));
t("até olhar o caçador nos olhos: aí a prova fecha", !!m4.R.feitas.prova);
const m5 = guiao(MAO, "a falha", [acharOtilia, (e) => morre(e, "Otília")], { falha: 0 });
t("a Mão: Otília morta antes da prova — falhada", m5.R.estado === "falhada" && m5.R.motivo === "falha" && /boca cosida/.test(m5.R.fecho.texto));
const m6 = guiao(MAO, "o abandono", [(e) => dias(e, 5)]);
t("a Mão: cinco dias sem avançar — abandonada, e Otília cativa", m6.R.motivo === "abandono" && m6.R.consequencias.some((c) => c.de === "abandono" && c.efeitos.some((x) => x.situacao === "cativa")));

/* ---- O Celeiro de Inverno ---- */
const CEL = "o_celeiro_de_inverno";
const ateAoDono = [(e) => falar(e, "Joana"), (e) => ir(e, CELEIRO)];
const c1 = guiao(CEL, "palavra · abrir", [...ateAoDono, (e) => falar(e, "Isaura"), ["escolher", "trigo", "abrir"]]);
t("o Celeiro: ouvir, ver, falar com a dona, abrir as portas — concluída", c1.R.estado === "concluida" && c1.R.feitas.dono.ramo === "palavra" && c1.R.feitas.trigo.ramo === "abrir");
const c2 = guiao(CEL, "lâmina poupando · queimar", [...ateAoDono, (e) => lutar(e, { nome: "Gaspar", rendido: true }), ["escolher", "trigo", "queimar"]]);
t("o Celeiro: o comprador poupado deixa a bolsa, e queimar o trigo tira-lhe a alavanca", c2.R.feitas.dono.variante === "poupou" && c2.R.consequencias.some((c) => c.de === "escolha:trigo:queimar" && c.efeitos.some((x) => x.tipo === "relogio_do_fio" && x.n === -1)) && c2.R.estado === "concluida");
const c3 = guiao(CEL, "lâmina matando · guardar", [...ateAoDono, (e) => lutar(e, { nome: "Gaspar" }), ["escolher", "trigo", "guardar"]]);
t("o Celeiro: guardar o trigo deixa o cerco para as quests seguintes", c3.R.feitas.dono.variante === "matou" && c3.R.consequencias.some((c) => c.efeitos.some((x) => x.premissa === "cerco:celeiro")));
const c4 = guiao(CEL, "o trigo já vendido", [(e) => falar(e, "Joana"), (e) => segredo(ir(e, CELEIRO), CELEIRO), (e) => falar(e, "Isaura")]);
const c4v = c4.ver();
t("o Celeiro: quem revolve as sacas descobre o trigo já vendido, e a escolha espera o comprador", c4.R.reviravoltas.some((r) => r.id === "o_trigo_ja_vendido") && c4v.etapa === "trigo" && c4v.escolhas.length === 0 && /compra o trigo a dobrar/.test(c4v.faltaTexto.join(" ")), J(c4v));
c4.turno((e) => falar(e, "Gaspar")).escolher("trigo", "guardar");
t("e com o comprador visto, a escolha abre e a quest conclui", c4.R.estado === "concluida");
const c5 = guiao(CEL, "a falha", [(e) => falar(e, "Joana"), (e) => morre(e, "Joana")], { falha: 0 });
t("o Celeiro: a voz da fome morta antes da escolha — falhada", c5.R.motivo === "falha" && /rixa/.test(c5.R.fecho.texto));
const c6 = guiao(CEL, "o abandono", [(e) => dias(e, 6)]);
t("o Celeiro: seis dias — o trigo sai de noite", c6.R.motivo === "abandono");

/* ---- O Convite Sem Selo ---- */
const CON = "o_convite_sem_selo";
const sentar = [(e) => falar(e, "Leonor"), (e) => falar(em(e, SALAO), "Quelvar")];
const sair = (e) => em(e, PRACA);
const v1 = guiao(CON, "aceitar", [...sentar, ["escolher", "rosto", "aceitar"], sair]);
t("o Convite: a lei da casa, a mesa, aceitar, sair — concluída", v1.R.estado === "concluida" && v1.R.feitas.oferta.ramo === "aceitar");
t("aceitar solta o refém e faz do vilão um aliado na ficha (é o que o confronto lê para o pacto)", v1.R.consequencias.some((c) => c.de === "escolha:rosto:aceitar" && c.efeitos.some((x) => x.tipo === "aliado" && x.papel === "vilao") && c.efeitos.some((x) => x.situacao === "livre")));
const v2 = guiao(CON, "recusar", [...sentar, ["escolher", "rosto", "recusar"], sair]);
t("o Convite: recusar — concluída, e o relógio dele anda", v2.R.estado === "concluida" && v2.R.consequencias.some((c) => c.efeitos.some((x) => x.tipo === "relogio_do_fio")));
const v3 = guiao(CON, "levar o refém", [...sentar, ["escolher", "rosto", "levar"]]);
t("o Convite: levar o refém abre a escada comprida", v3.R.reviravoltas.some((r) => r.id === "a_escada_comprida") && v3.ver().etapa === "fuga");
v3.turno((e) => sair(juntar(e, { nome: "Tomé", vinculo: 30 })));
t("e só com o refém ao lado, fora do salão, se sai", v3.R.estado === "concluida" && !!v3.R.feitas.fuga);
const v4 = guiao(CON, "o refém sem correntes", [(e) => falar(falar(e, "Leonor"), "Leonor")]);
t("o Convite: duas conversas com a anfitriã revelam as correntes abertas", v4.R.reviravoltas.some((r) => r.id === "o_refem_sem_correntes") && /correntes/.test(v4.ver().reviravolta.texto));
t("e antes de o ver, o vilão é «quem manda o convite»", /quem manda o convite/.test(v4.ver().faltaTexto.join(" ")) && !/Quelvar/.test(v4.ver().faltaTexto.join(" ")), J(v4.ver().faltaTexto));
const v5 = guiao(CON, "a mesa virada", [...sentar, (e) => lutar(e, { nome: "Leonor" })], { falha: 0 });
t("o Convite: sangue na toalha da anfitriã — falhada", v5.R.motivo === "falha" && /toalha/.test(v5.R.fecho.texto));
const v6 = guiao(CON, "o refém morto antes da oferta", [(e) => falar(e, "Leonor"), (e) => morre(e, "Tomé")], { falha: 1 });
t("o Convite: o refém morto antes de se sentar — falhada", v6.R.motivo === "falha" && /cadeira vazia/.test(v6.R.fecho.texto));
const v7 = guiao(CON, "o abandono", [(e) => dias(e, 4)]);
t("o Convite: a noite passa sem o herói", v7.R.motivo === "abandono");

/* ---- O Cimo da Escada ---- */
const CIM = "o_cimo_da_escada";
const entrar = (e) => ir(e, TORRE);
const d1 = guiao(CIM, "luta · luta poupando · poupar", [entrar, (e) => lutar(e, { nome: "Sancha", rendido: true }), (e) => lutar(juntar(e, { nome: "Tomé", vinculo: 30 }), { nome: "Quelvar", rendido: true }), ["escolher", "sentenca", "poupar"]]);
t("o Cimo: a escada, o braço poupado, a lâmina no pescoço do refém, o vilão de joelhos, poupar — concluída",
  d1.R.estado === "concluida" && d1.R.reviravoltas.some((r) => r.id === "a_lamina_no_pescoco") && d1.R.feitas.braco.variante === "poupou" && d1.R.feitas.frente.variante === "poupou" && d1.R.feitas.sentenca.ramo === "poupar", J(d1.R.feitas));
const d1b = guiao(CIM, "sem o refém ao lado, nada cai", [entrar, (e) => lutar(e, { nome: "Sancha" }), (e) => lutar(e, { nome: "Quelvar", rendido: true })]);
t("o Cimo: com a lâmina no pescoço do refém, vencer o vilão não fecha a frente", !d1b.R.feitas.frente && d1b.ver().etapa === "frente");
const d2 = guiao(CIM, "palavra · luta matando", [(e) => juntar(entrar(e), { nome: "Tomé", vinculo: 30 }), (e) => ficha(e, "Sancha", { laco: { forca: 2 } }), (e) => lutar(e, { nome: "Quelvar" })]);
t("o Cimo: o braço virado pela confiança, e o vilão morto — concluída ali, sem sentença", d2.R.feitas.braco.ramo === "palavra" && d2.R.feitas.frente.variante === "matou" && d2.R.estado === "concluida" && !d2.R.feitas.sentenca, J(d2.R));
const comTomé = (e) => juntar(e, { nome: "Tomé", vinculo: 30 });
const d3 = guiao(CIM, "a prova: uma pessoa · acabar", [(e) => juntar(entrar(e), { nome: "Teodora", vinculo: 30 }), (e) => comTomé(lutar(e, { nome: "Sancha" })), ["escolher", "prova", "expor"], ["escolher", "sentenca", "acabar"]], { papeis: { fraqueza_quem: { nome: "Teodora" } } });
t("o Cimo: com a fraqueza (uma pessoa) ao lado, a prova abre-se, e expor derruba sem luta", d3.R.reviravoltas.some((r) => r.id === "a_prova_na_mao") && d3.R.feitas.frente.ramo === "prova" && d3.R.feitas.frente.variante === "pessoa" && d3.R.feitas.sentenca.ramo === "acabar" && d3.R.estado === "concluida", J(d3.R.feitas));
const d4 = guiao(CIM, "a prova: uma coisa, guardada · selar", [(e) => levar(entrar(e), "O livro-mestre das dívidas"), (e) => comTomé(lutar(e, { nome: "Sancha" })), ["escolher", "prova", "guardar"], (e) => lutar(e, { nome: "Quelvar", rendido: true }), ["escolher", "sentenca", "selar"]], { papeis: { fraqueza_coisa: { nome: "o livro-mestre" } } });
t("o Cimo: guardar a prova obriga à luta, e selar é a terceira sentença", d4.R.feitas.prova.ramo === "guardar" && d4.R.feitas.frente.ramo === "luta" && d4.R.feitas.sentenca.ramo === "selar", J(d4.R.feitas));
const d5 = guiao(CIM, "a prova: uma verdade · expor", [(e) => segredo(entrar(e), ALFANDEGA), (e) => comTomé(lutar(e, { nome: "Sancha" })), ["escolher", "prova", "expor"], ["escolher", "sentenca", "poupar"]], { papeis: { fraqueza_verdade: ALFANDEGA } });
t("o Cimo: a verdade descoberta também abre a prova, e o texto é o da praça", d5.R.feitas.frente.ramo === "prova" && d5.R.feitas.frente.variante === null && d5.R.estado === "concluida", J(d5.R.feitas));
t("sem fraqueza nenhuma, a prova nunca se abre (os três papéis por ligar são falsos, não lançam)", !d1.R.reviravoltas.some((r) => r.id === "a_prova_na_mao") && !d1.R.feitas.prova);
const comPacto = ficha(mundo2(), "Quelvar", { relacao: "aliado" });
const d6 = guiao(CIM, "o pacto cumprido", [entrar, ["escolher", "pacto", "cumprir"]], { e0: comPacto });
t("o Cimo: quem aceitou a oferta no rosto encontra a dívida à entrada, e cumpri-la fecha a quest (o pacto)", d6.R.reviravoltas.some((r) => r.id === "a_divida_cobrada") && d6.R.feitas.divida.ramo === "cumprir" && d6.R.estado === "concluida" && d6.R.escolhas.pacto.opcao === "cumprir", J(d6.R));
const d7 = guiao(CIM, "o pacto rasgado", [entrar, ["escolher", "pacto", "romper"], (e) => comTomé(lutar(e, { nome: "Sancha" })), (e) => lutar(e, { nome: "Quelvar" })], { e0: comPacto });
t("o Cimo: rasgar o pacto fere o refém, e a escada continua até ao fim", d7.R.feitas.divida.ramo === "romper" && d7.R.consequencias.some((c) => c.efeitos.some((x) => x.situacao === "ferida")) && d7.R.estado === "concluida");
const d8 = guiao(CIM, "o refém morto", [entrar, (e) => morre(e, "Tomé")], { falha: 0 });
t("o Cimo: o refém morto antes da frente — falhada", d8.R.motivo === "falha" && /escada/.test(d8.R.fecho.texto));
const d9 = guiao(CIM, "outra mão primeiro", [entrar, (e) => morre(e, "Quelvar")], { falha: 1 });
t("o Cimo: o vilão morto por outra mão — falhada (o que começou já tem quem lhe pegue)", d9.R.motivo === "falha" && /Outra mão/.test(d9.R.fecho.texto));
const d10 = guiao(CIM, "o abandono", [(e) => dias(e, 8)]);
t("o Cimo: oito dias — o covil amanhece vazio", d10.R.motivo === "abandono");

/* ---- Os Dias Que Faltam ---- */
const DIA = "os_dias_que_faltam";
const dias2 = (vinculo, segredoOp, curaOp, extra = []) => guiao(DIA, `${segredoOp} · ${curaOp} · ${vinculo}`, [
  (e) => dias(e, 2), (e) => falar(falar(e, "Ermelinda"), "Ermelinda"), ["escolher", "segredo", segredoOp], ...extra, (e) => ir(e, HORTO), ["escolher", "cura", curaOp]], { e0: mundo2([IAGO(vinculo)]) });
const e1 = dias2(55, "contar", "pagar");
t("os Dias: contar e pagar, com confiança — a febre cede (o melhor)", e1.R.desfecho === "a_febre_cede" && e1.ver().ordem === 1, J(e1.R));
t("os Dias: escondida até acender (dois dias com quem tosse ao lado)", jogo(DIA, PAPEIS2[DIA], mundo2([IAGO(55)]), { quests: UM_TIPO_1_CONCLUIDO }).ver().visivel === false);
const e2 = dias2(80, "contar", "esperar");
t("os Dias: contar e esperar, com confiança inteira — o tempo emprestado", e2.R.desfecho === "o_tempo_emprestado");
const e3 = dias2(55, "calar", "roubar");
t("os Dias: calar e roubar — curado às escuras, e quem tosse lê o saco (a reviravolta)", e3.R.desfecho === "curado_as_escuras" && e3.R.reviravoltas.some((r) => r.id === "a_tosse_que_ouve"));
const e4 = dias2(80, "calar", "esperar");
t("os Dias: calar e esperar — a última febre (o pior): quem esperou sem saber morre", e4.R.desfecho === "a_ultima_febre" && e4.R.consequencias.some((c) => c.de === "desfecho:a_ultima_febre" && c.efeitos.some((x) => x.tipo === "morte" && x.papel === "quem")));
t("e o veredito de esperar avisava, antes do clique, que a febre não espera", e4.vereditos.some((v) => v.chave === "cura" && /não espera/.test(v.opcoes.find((o) => o.id === "esperar").custa)));
const e5 = dias2(55, "contar", "esperar");
t("os Dias: contar e esperar sem confiança inteira — também a última febre", e5.R.desfecho === "a_ultima_febre");
const e6 = dias2(55, "contar", "pagar", [(e) => segredo(ir(e, HORTO), HORTO)]);
t("os Dias: quem revolve o horto descobre que a mesma mão vende a cura e semeia a febre", e6.R.reviravoltas.some((r) => r.id === "a_mesma_mao") && e6.R.consequencias.some((c) => c.efeitos.some((x) => x.premissa === "febre:horto")));
const e7 = guiao(DIA, "a febre fica (abandono)", [(e) => dias(e, 2), (e) => dias(e, 15)], { e0: mundo2([IAGO(55)]) });
t("os Dias: a história ignorada acaba no padrão", e7.R.desfecho === "a_febre_fica" && e7.R.motivo === "abandono");
const e8 = guiao(DIA, "sem quem cure", [(e) => dias(e, 2), (e) => morre(e, "Ermelinda")], { e0: mundo2([IAGO(55)]) });
t("os Dias: a curandeira morta antes do horto — sem quem cure", e8.R.desfecho === "sem_quem_cure");
const e9 = guiao(DIA, "antes da febre", [(e) => grupo(morre(e, "Iago"))], { e0: mundo2([IAGO(55)]) });
t("os Dias: quem tossia morto pela estrada — antes da febre", e9.R.desfecho === "antes_da_febre");
const combosD = [];
for (const v of [30, 55, 80]) for (const s of ["contar", "calar"]) for (const c of ["pagar", "roubar", "esperar"]) {
  const r = guiao(DIA, `combo ${s}·${c}·${v}`, [(e) => dias(e, 2), (e) => falar(falar(e, "Ermelinda"), "Ermelinda"), ["escolher", "segredo", s], (e) => juntar(grupo(ir(e, HORTO)), IAGO(v)), ["escolher", "cura", c]], { e0: mundo2([IAGO(80)]) }).R;
  combosD.push({ v, s, c, d: r.desfecho, estado: r.estado });
}
t("os Dias: as 18 combinações acabam todas num desfecho", combosD.every((x) => x.estado === "terminada"), J(combosD.filter((x) => x.estado !== "terminada")));
t("os Dias: a morte só chega a quem escolheu esperar (o veredito que a avisa)", combosD.filter((x) => x.d === "a_ultima_febre").every((x) => x.c === "esperar") && combosD.some((x) => x.d === "a_ultima_febre"));
t("os Dias: pagar ou roubar a erva nunca mata ninguém", combosD.filter((x) => x.c !== "esperar").every((x) => x.d !== "a_ultima_febre"));

/* ---- A Lâmina Enterrada ---- */
const LAM = "a_lamina_enterrada";
const lamina = (vinculo, votoOp, fim, extra = []) => guiao(LAM, `${votoOp} · ${fim} · ${vinculo}`, [
  (e) => dias(e, 2), (e) => falar(falar(e, "Iago"), "Iago"), ["escolher", "voto", votoOp], ...extra, (e) => falar(e, "Rufino"),
  fim === "luta" ? (e) => lutar(e, { nome: "Rufino", rendido: true }) : ["escolher", "conta", fim]], { e0: mundo2([IAGO(vinculo)]) });
const f1 = lamina(80, "honrar", "ouvir");
t("a Lâmina: honrar o voto e pôr o vingador a ouvir, com confiança inteira — a mão limpa (o melhor)", f1.R.desfecho === "a_mao_limpa" && f1.ver().ordem === 1, J(f1.R));
const f2 = lamina(55, "honrar", "luta");
t("a Lâmina: honrar e lutar no seu lugar — o voto guardado", f2.R.desfecho === "o_voto_guardado" && f2.R.feitas.conta.ramo === "luta");
const f3 = lamina(80, "quebrar", "ouvir");
t("a Lâmina: quebrar o voto e ouvir — a paz a meias (a mão limpa pede o voto inteiro)", f3.R.desfecho === "a_paz_a_meias");
const f4 = lamina(55, "quebrar", "afastar");
t("a Lâmina: quebrar e fugir — a lâmina desenterrada: vive, e deixa de rezar", f4.R.desfecho === "a_lamina_desenterrada");
const f5 = lamina(55, "absolver", "luta", [(e) => consulta(falar(ir(e, ERMIDA), "Anselmo"), "Anselmo")]);
t("a Lâmina: absolver abre o altar, e perguntar a mais mostra o perdão a peso", f5.R.reviravoltas.some((r) => r.id === "o_altar_primeiro") && f5.R.reviravoltas.some((r) => r.id === "o_perdao_a_peso") && !!f5.R.feitas.altar, J(f5.R.reviravoltas));
t("e o fim é o falso perdão", f5.R.desfecho === "o_falso_perdao");
const f6 = lamina(80, "honrar", "afastar");
t("a Lâmina: honrar o voto e fugir — o mártir (o pior): quem não ergue a lâmina morre na estrada", f6.R.desfecho === "o_martir" && f6.R.consequencias.some((c) => c.efeitos.some((x) => x.tipo === "morte" && x.papel === "quem")));
t("e o veredito de fugir avisava, antes do clique, o que isso queria dizer", f6.vereditos.some((v) => v.chave === "conta" && /não ergue a lâmina/.test(v.opcoes.find((o) => o.id === "afastar").custa)));
const f7 = guiao(LAM, "o voto pesa (abandono)", [(e) => dias(e, 2), (e) => dias(e, 15)], { e0: mundo2([IAGO(55)]) });
t("a Lâmina: a história ignorada acaba no padrão", f7.R.desfecho === "o_voto_pesa");
const f8 = guiao(LAM, "o voto até ao fim", [(e) => grupo(morre(e, "Iago"))], { e0: mundo2([IAGO(55)]) });
t("a Lâmina: morto por outra mão — o voto até ao fim", f8.R.desfecho === "o_voto_ate_ao_fim");
const semAncora = guiao(LAM, "sem âncora", [(e) => dias(e, 2), (e) => falar(falar(e, "Iago"), "Iago"), ["escolher", "voto", "honrar"], (e) => falar(e, "Rufino")], { e0: mundo2([IAGO(55)]), quests: [] });
t("a Lâmina: sem nenhuma quest do tipo 1 concluída, o vingador não acende (a âncora)", semAncora.ver().etapa === "vingador" && semAncora.ver().acesa === false);
const combosL = [];
for (const v of [55, 80]) for (const o of ["honrar", "quebrar", "absolver"]) for (const fim of ["luta", "ouvir", "afastar"]) {
  const extra = o === "absolver" ? [(e) => falar(ir(e, ERMIDA), "Anselmo")] : [];
  const r = lamina(v, o, fim, extra).R;
  combosL.push({ v, o, fim, d: r.desfecho, estado: r.estado });
}
t("a Lâmina: as 18 combinações acabam todas num desfecho", combosL.every((x) => x.estado === "terminada"), J(combosL.filter((x) => x.estado !== "terminada")));
t("a Lâmina: a morte só chega a quem fugiu sem quebrar o voto (o veredito que a avisa)", combosL.filter((x) => x.d === "o_martir").every((x) => x.fim === "afastar" && x.o !== "quebrar") && combosL.some((x) => x.d === "o_martir"));
t("a Lâmina: lutar ou ouvir nunca mata ninguém", combosL.filter((x) => x.fim !== "afastar").every((x) => x.d !== "o_martir"));

/* ---- A COBERTURA, contada da ficha ---- */
t("nenhum guião tentou uma escolha fechada", casos.every((c) => !c.erro), casos.filter((c) => c.erro).map((c) => `${c.id}/${c.nome}: ${c.erro}`).join("; "));
for (const id of LOTE2) {
  const F = questPorId(id);
  const meus = casos.filter((c) => c.id === id);
  const etapas = [...F.etapas, ...F.reviravoltas.flatMap((r) => r.efeitos).filter((x) => x.tipo === "abre_etapa").map((x) => x.etapa)];
  const ramos = etapas.flatMap((e) => (e.ramos || []).map((r) => `${e.id}:${r}`));
  const vistos = new Set(meus.flatMap((c) => Object.entries(c.j.R.feitas).map(([k, v]) => `${k}:${v.ramo}`)));
  const opcoes = Object.entries(F.escolhas).flatMap(([k, e]) => Object.keys(e.opcoes).map((o) => `${k}:${o}`));
  const escolhidas = new Set(meus.flatMap((c) => Object.entries(c.j.R.escolhas).map(([k, v]) => `${k}:${v.opcao}`)));
  const revs = F.reviravoltas.map((r) => r.id);
  const disparadas = new Set(meus.flatMap((c) => c.j.R.reviravoltas.map((r) => r.id)));
  const faltam = [...ramos.filter((r) => !vistos.has(r)), ...opcoes.filter((o) => !escolhidas.has(o)), ...revs.filter((r) => !disparadas.has(r))];
  t(`${F.titulo}: todo ramo, toda opção e toda reviravolta alcançados por um guião`, faltam.length === 0, faltam.join(", "));
  if (F.tipo === 1) {
    const falhas = new Set(meus.filter((c) => c.falha != null && c.j.R.motivo === "falha").map((c) => c.falha));
    t(`${F.titulo}: concluível, cada falha alcançada, e o abandono`, meus.some((c) => c.j.R.estado === "concluida") && F.falha.every((_, i) => falhas.has(i)) && meus.some((c) => c.j.R.motivo === "abandono"), J([...falhas]));
  } else {
    const alcancados = new Set(meus.map((c) => c.j.R.desfecho).filter(Boolean));
    t(`${F.titulo}: cada desfecho alcançado pelo que o herói fez, do melhor ao pior`, F.desfechos.every((d) => alcancados.has(d.id)), F.desfechos.filter((d) => !alcancados.has(d.id)).map((d) => d.id).join(", "));
  }
  /* o que chega à tela: sem chaveta, sem nome de papel, sem «undefined» */
  const txt = meus.flatMap((c) => [c.j.ver().gancho, c.j.ver().etapaTexto, ...c.j.ver().faltaTexto, ...c.j.R.consequencias.map((x) => x.texto), c.j.R.fecho && c.j.R.fecho.texto,
    ...(c.j.vereditos || []).flatMap((v) => v.opcoes.flatMap((o) => [o.texto, o.ganha, o.custa]))]).filter(Boolean).join(" ");
  t(`${F.titulo}: o texto à vista não tem chavetas nem nomes de papel`, !/[{}]|papel:|lugar:|item:|undefined|\b(desertor|cacador|vitima|faminta|comprador|anfitriao|refem|braco|fraqueza_\w+|curandeira|vingador|sacerdote)\b/.test(txt));
  t(`${F.titulo}: todo veredito diz os dois lados`, meus.every((c) => (c.vereditos || c.j.vereditos || []).every((v) => v.opcoes.every((o) => o.ganha.length > 20 && o.custa.length > 20))));
}
{
  /* nunca nasce feita, e a menção não fecha: o primeiro passo de cada uma */
  const abertas = LOTE2.map((id) => abrirQuest(id, { estado: mundo2([IAGO(55)]), papeis: PAPEIS2[id] }));
  t("o lote 2 abre num mundo vazio, aberto e sem nenhuma etapa feita", abertas.every((r) => r && r.estado === "aberta" && Object.keys(r.feitas).length === 0));
  t("o Celeiro com a fome já ouvida não abre (a primeira etapa já está cumprida)", abrirQuest(CEL, { estado: falar(mundo2(), "Joana"), papeis: PAPEIS2[CEL] }) === null);
  t("o Convite com o refém já morto não abre (a falha já aconteceu)", abrirQuest(CON, { estado: morre(mundo2(), "Tomé"), papeis: PAPEIS2[CON] }) === null);
  const jn = jogo(CEL, PAPEIS2[CEL], mundo2(), { quests: [] });
  jn.turno((e) => nomear(e, "Joana", "Isaura", "Gaspar"));
  t("nomear a voz da fome não é ouvi-la", !jn.R.feitas.ouvir);
  const jv = jogo(CON, PAPEIS2[CON], mundo2(), { quests: [] });
  jv.turno((e) => falar(e, "Leonor")).turno((e) => nomear(em(e, SALAO), "Quelvar"));
  t("nomear o vilão à mesa não é falar com ele", !jv.R.feitas.mesa);
  const g = () => { turno = 3000; return J(lamina(55, "absolver", "luta", [(e) => consulta(falar(ir(e, ERMIDA), "Anselmo"), "Anselmo")]).R); };
  t("determinístico: o mesmo guião do lote 2 dá o mesmo registo", g() === g());
}

sec("§10 o acervo, lote 3 (BQ8) — cada quest por cada ramo, e a cobertura contada");
/* As oito quests do lote 3, pelas mesmas portas e pela mesma régua do
   lote 2: um guião por caminho, e a cobertura contada da ficha (todo ramo,
   toda opção, toda reviravolta, toda falha, o abandono e todo desfecho). */
const NOVOS3 = {
  Benta: N("Benta"), Vasco: N("Vasco"), "Lobo Cinzento": N("Lobo Cinzento"),
  Graça: N("Graça"), Duarte: N("Duarte"), Fausto: N("Fausto"),
  Elias: N("Elias"), Rosa: N("Rosa"), Morais: N("Morais"),
  Inês: N("Inês"), Abel: N("Abel"), Nuno: N("Nuno"),
  Celeste: N("Celeste"), Tomás: N("Tomás"),
  Clarice: N("Clarice", FOZ), Gonçalo: N("Gonçalo", FOZ),
};
const mundo3 = (membros = []) => ({ ...mundo2(membros), npcs: { ...NPCS, ...NOVOS, ...NOVOS3 } });
const CURRAL = { nome: "Curral da Ladeira", cidade: CIDADE }, TOCA = { nome: "Lapa do Monte", cidade: CIDADE };
const ESTRADA = { nome: "Estrada Velha", cidade: CIDADE }, PEDREIRA = { nome: "Pedreira do Corvo", cidade: CIDADE };
const FORJA = { nome: "Forja Velha", cidade: CIDADE }, MOINHO = { nome: "Moinho de Baixo", cidade: CIDADE }, MOEDA = { nome: "Casa da Moeda", cidade: CIDADE };
const CAPELA = { nome: "Capela de São Brás", cidade: CIDADE }, LARGO = { nome: "Largo do Relógio", cidade: CIDADE };
const FERRADOR = { nome: "Casa do Ferrador", cidade: FOZ }, SOLAR = { nome: "Solar dos Sá", cidade: FOZ }, PORTELA = { nome: "Portela", cidade: FOZ };
Object.assign(PAPEIS2, {
  o_que_desce_ao_anoitecer: { curral: CURRAL, toca: TOCA, fera: { nome: "Lobo Cinzento" }, pastora: { nome: "Benta" }, tratador: { nome: "Vasco" } },
  as_botas_na_estrada: { estrada: ESTRADA, mae: { nome: "Graça" }, rapaz: { nome: "Duarte" }, chefe: { nome: "Fausto" } },
  os_bracos_que_faltam: { pedreira: PEDREIRA, devedor: { nome: "Elias" }, pedinte: { nome: "Rosa" }, feitor: { nome: "Morais" } },
  o_ultimo_a_sair: { ruina: FORJA, esconderijo: MOINHO, alvo: MOEDA, sobrevivente: { nome: "Inês" }, guardiao: { nome: "Abel" }, pagina: { nome: "o recibo meio queimado" }, limpador: { nome: "Nuno" } },
  o_velorio_pago: { vilao: { nome: "Quelvar" }, enlutada: { nome: "Celeste" }, capela: CAPELA },
  a_hora_marcada: { vilao: { nome: "Quelvar" }, palco: LARGO, guardiao: { nome: "Sancha" }, executor: { nome: "Tomás" } },
  o_sangue_do_outro_lado: { quem: { nome: "Iago" }, irmao: { nome: "Rufino" }, casa: FERRADOR },
  as_cartas_de_outra_casa: { quem: { nome: "Iago" }, amado: { nome: "Clarice" }, prometido: { nome: "Gonçalo" }, casa: SOLAR, passagem: PORTELA },
});
const LOTE3 = ["o_que_desce_ao_anoitecer", "as_botas_na_estrada", "os_bracos_que_faltam", "o_ultimo_a_sair", "o_velorio_pago", "a_hora_marcada", "o_sangue_do_outro_lado", "as_cartas_de_outra_casa"];
const g3 = (id, nome, passos, o = {}) => guiao(id, nome, passos, { e0: mundo3(), ...o });
const confia = (nome, forca = 2) => (e) => ficha(e, nome, { laco: { forca } });

/* ---- O Que Desce ao Anoitecer ---- */
const DES = "o_que_desce_ao_anoitecer";
const ateToca = [(e) => ir(e, CURRAL), (e) => falar(e, "Benta"), (e) => ir(e, TOCA)];
const n1 = g3(DES, "lâmina poupando · à aldeia", [...ateToca, (e) => lutar(e, { nome: "Lobo Cinzento", rendido: true }), ["escolher", "destino", "aldeia"]]);
t("o Que Desce: o curral, o rasto, a besta rendida, entregue à aldeia — concluída", n1.R.estado === "concluida" && n1.R.feitas.fera.variante === "poupou" && n1.R.feitas.destino.ramo === "aldeia", J(n1.R.feitas));
const n2 = g3(DES, "as portas · o assobio · a coleira", [(e) => segredo(ir(e, CURRAL), CURRAL), (e) => falar(e, "Benta"), (e) => ir(e, TOCA), (e) => consulta(falar(e, "Vasco"), "Vasco"), ["escolher", "destino", "coleira"]]);
t("o Que Desce: as portas que não pagaram, o assobio arrancado ao tratador, a besta de coleira na praça", n2.R.reviravoltas.some((r) => r.id === "as_portas_que_nao_pagaram") && n2.R.feitas.fera.ramo === "assobio" && n2.R.feitas.destino.ramo === "coleira" && n2.R.estado === "concluida", J(n2.R));
t("e a coleira faz recuar o relógio dele (a prova de quem a soltava)", n2.R.consequencias.some((c) => c.de === "escolha:destino:coleira" && c.efeitos.some((x) => x.tipo === "relogio_do_fio" && x.n === -1)));
const n3 = g3(DES, "as crias · o monte", [(e) => ir(e, CURRAL), (e) => falar(e, "Benta"), (e) => falar(ir(e, TOCA), "Vasco"), (e) => consulta(e, "Vasco"), ["escolher", "destino", "monte"]]);
t("o Que Desce: as crias na toca, e a besta solta no alto do monte", n3.R.reviravoltas.some((r) => r.id === "as_crias") && n3.R.feitas.destino.ramo === "monte", J(n3.R.reviravoltas));
const n4 = g3(DES, "matar fecha ali", [...ateToca, (e) => lutar(e, { nome: "Lobo Cinzento" })]);
t("o Que Desce: matar a besta fecha a quest ali, e a coleira arde com ela", n4.R.estado === "concluida" && n4.R.feitas.fera.variante === "matou" && !n4.R.feitas.destino && /coleira arde/.test(n4.R.fecho.texto));
const n5 = g3(DES, "a falha", [(e) => ir(e, CURRAL), (e) => morre(e, "Benta")], { falha: 0 });
t("o Que Desce: a pastora morta à porta — falhada", n5.R.motivo === "falha" && /forquilha/.test(n5.R.fecho.texto));
const n6 = g3(DES, "o abandono", [(e) => dias(e, 5)]);
t("o Que Desce: cinco dias — a aldeia paga a proteção", n6.R.motivo === "abandono");

/* ---- As Botas na Estrada ---- */
const BOT = "as_botas_na_estrada";
const ateDuarte = [(e) => falar(e, "Graça"), (e) => falar(ir(e, ESTRADA), "Duarte")];
const b1 = g3(BOT, "a forca · lâmina poupando", [...ateDuarte, ["escolher", "rapaz", "forca"], (e) => lutar(e, { nome: "Fausto", rendido: true })]);
t("as Botas: a mãe, a espera na estrada, a forca, quem paga o vinho poupado — concluída", b1.R.estado === "concluida" && b1.R.feitas.sentenca.ramo === "forca" && b1.R.feitas.chefe.variante === "poupou", J(b1.R.feitas));
t("e a forca rompe o laço com a mãe (o veredito avisava)", b1.R.consequencias.some((c) => c.de === "escolha:rapaz:forca" && c.efeitos.some((x) => x.tipo === "rompe_laco" && x.papel === "mae")) && b1.vereditos.some((v) => /primeira fila/.test(v.opcoes.find((o) => o.id === "forca").custa)));
const b2 = g3(BOT, "o nome · lâmina matando", [...ateDuarte, ["escolher", "rapaz", "nome"], (e) => lutar(e, { nome: "Fausto" })]);
t("as Botas: o rapaz solto por um nome, e quem paga o vinho morto", b2.R.feitas.sentenca.ramo === "nome" && b2.R.feitas.chefe.variante === "matou" && b2.R.estado === "concluida");
const b3 = g3(BOT, "comprar · palavra", [...ateDuarte, ["escolher", "rapaz", "comprar"], confia("Fausto")]);
t("as Botas: a dívida paga, e quem pagava o vinho muda de estrada pela palavra", b3.R.feitas.sentenca.ramo === "comprar" && b3.R.feitas.chefe.ramo === "palavra" && b3.R.consequencias.some((c) => c.efeitos.some((x) => x.tipo === "moedas" && x.n === -60)));
const b4 = g3(BOT, "o almocreve", [...ateDuarte, (e) => consulta(e, "Duarte")]);
t("as Botas: perguntar ao rapaz mostra quem abriu a garganta ao almocreve", b4.R.reviravoltas.some((r) => r.id === "o_almocreve"));
const b5 = g3(BOT, "quem levou o rapaz", [...ateDuarte, (e) => consulta(e, "Graça")]);
t("as Botas: perguntar à mãe mostra quem levou o rapaz à estrada", b5.R.reviravoltas.some((r) => r.id === "quem_levou_o_rapaz"));
const b6 = g3(BOT, "a falha", [(e) => falar(e, "Graça"), (e) => morre(e, "Duarte")], { falha: 0 });
t("as Botas: o rapaz na valeta antes da sentença — falhada", b6.R.motivo === "falha" && /moeda na boca/.test(b6.R.fecho.texto));
const b7 = g3(BOT, "o abandono", [(e) => dias(e, 6)]);
t("as Botas: seis dias — o rapaz deixa de voltar a casa", b7.R.motivo === "abandono");

/* ---- Os Braços Que Faltam ---- */
const BRA = "os_bracos_que_faltam";
const ateElias = [(e) => falar(e, "Rosa"), (e) => falar(ir(e, PEDREIRA), "Elias")];
const c31 = g3(BRA, "lâmina poupando · abrir", [...ateElias, (e) => lutar(e, { nome: "Morais", rendido: true }), ["escolher", "pedreira", "abrir"]]);
t("os Braços: o pedido, a pedreira, o feitor poupado, as correntes de todos — concluída", c31.R.estado === "concluida" && c31.R.feitas.corrente.variante === "poupou" && c31.R.feitas.porta.ramo === "abrir", J(c31.R.feitas));
const c32 = g3(BRA, "compra · a lei", [...ateElias, ["escolher", "divida", "comprar"], ["escolher", "pedreira", "lei"]]);
t("os Braços: a dívida comprada, e as contas levadas à guarda", c32.R.feitas.corrente.ramo === "compra" && c32.R.feitas.porta.ramo === "lei" && c32.R.estado === "concluida");
const c33 = g3(BRA, "fuga · sair", [...ateElias, (e) => em(juntar(e, { nome: "Elias", vinculo: 30 }), PRACA), ["escolher", "pedreira", "sair"]]);
t("os Braços: a fuga pela encosta, e sair só com quem se veio buscar", c33.R.feitas.corrente.ramo === "fuga" && c33.R.feitas.porta.ramo === "sair" && c33.R.estado === "concluida");
const c34 = g3(BRA, "a mesma letra · um não sai sozinho · matar", [...ateElias, (e) => segredo(e, PEDREIRA), (e) => consulta(e, "Elias")]);
const c34v = c34.ver();
t("os Braços: as dívidas fabricadas, e quem não sai sozinho — a compra espera", c34.R.reviravoltas.some((r) => r.id === "a_mesma_letra") && c34.R.reviravoltas.some((r) => r.id === "um_nao_sai_sozinho") && c34v.etapa === "corrente" && c34v.escolhas.length === 0, J(c34v));
c34.turno((e) => lutar(e, { nome: "Morais" })).escolher("pedreira", "abrir");
t("e com quem conta os braços caído, as correntes caem", c34.R.feitas.corrente.variante === "matou" && c34.R.estado === "concluida");
const c35 = g3(BRA, "a falha", [(e) => falar(e, "Rosa"), (e) => morre(e, "Elias")], { falha: 0 });
t("os Braços: o devedor morto de corrente ao pé — falhada, e a dívida passa a quem pedia", c35.R.motivo === "falha" && /corrente ao pé/.test(c35.R.fecho.texto));
const c36 = g3(BRA, "o abandono", [(e) => dias(e, 6)]);
t("os Braços: seis dias — vendido para outra obra, e cativo", c36.R.motivo === "abandono" && c36.R.consequencias.some((c) => c.efeitos.some((x) => x.situacao === "cativa")));

/* ---- O Último a Sair ---- */
const ULT = "o_ultimo_a_sair";
const ateAbel = [(e) => segredo(ir(e, FORJA), FORJA), (e) => falar(e, "Abel")];
const u1 = g3(ULT, "achou · a praça", [...ateAbel, (e) => falar(ir(e, MOINHO), "Inês"), ["escolher", "voz", "praca"]]);
t("o Último: a ruína, o rasto, quem saiu com vida achada, e a praça — concluída", u1.R.estado === "concluida" && u1.R.feitas.sobrevivente.ramo === "achou" && u1.R.feitas.voz.ramo === "praca", J(u1.R.feitas));
const u2 = g3(ULT, "lâmina poupando · longe", [...ateAbel, (e) => lutar(e, { nome: "Nuno", rendido: true }), ["escolher", "voz", "longe"]]);
t("o Último: quem acaba o serviço vencido e poupado, e a testemunha levada para longe", u2.R.feitas.sobrevivente.variante === "poupou" && u2.R.feitas.voz.ramo === "longe" && u2.R.estado === "concluida");
const u3 = g3(ULT, "o barulho · guardar", [...ateAbel, (e) => falar(ir(e, MOINHO), "Inês"), (e) => consulta(e, "Inês"), (e) => segredo(ir(e, MOEDA), MOEDA), ["escolher", "voz", "guardar"]]);
t("o Último: o desastre era o barulho — abre-se o que levaram do outro lado da rua", u3.R.reviravoltas.some((r) => r.id === "o_barulho") && !!u3.R.feitas.alvo && u3.R.feitas.voz.ramo === "guardar" && u3.R.estado === "concluida", J(u3.R));
const u4 = g3(ULT, "a marca na porta", [(e) => segredo(ir(e, FORJA), FORJA), (e) => levar(e, "O recibo meio queimado"), (e) => falar(ir(e, MOINHO), "Inês")]);
t("o Último: quem não pergunta a quem esconde encontra a marca na porta, e a testemunha espera por quem a caça", u4.R.reviravoltas.some((r) => r.id === "a_marca_na_porta") && !u4.R.feitas.sobrevivente, J(u4.R));
u4.turno((e) => falar(e, "Nuno")).escolher("voz", "praca");
t("até olhar quem acaba o serviço nos olhos: aí chega à testemunha", !!u4.R.feitas.sobrevivente && u4.R.estado === "concluida");
const u5 = g3(ULT, "a falha", [(e) => segredo(ir(e, FORJA), FORJA), (e) => morre(e, "Inês")], { falha: 0 });
t("o Último: a testemunha morta antes da voz — falhada", u5.R.motivo === "falha" && /espera visita/.test(u5.R.fecho.texto));
const u6 = g3(ULT, "o abandono", [(e) => dias(e, 5)]);
t("o Último: cinco dias — a testemunha some", u6.R.motivo === "abandono");

/* ---- O Velório Pago ---- */
const VEL = "o_velorio_pago";
const velar = [(e) => falar(ir(e, CAPELA), "Celeste"), (e) => falar(e, "Quelvar")];
const enterrar = (e) => falar(em(e, PRACA), "Celeste");
const w1 = g3(VEL, "aceitar", [...velar, ["escolher", "rosto", "aceitar"], enterrar]);
t("o Velório: velar, o vilão junto ao caixão, aceitar, o enterro — concluída", w1.R.estado === "concluida" && w1.R.feitas.oferta.ramo === "aceitar");
t("aceitar faz dele um aliado na ficha (o pacto que o confronto lê)", w1.R.consequencias.some((c) => c.de === "escolha:rosto:aceitar" && c.efeitos.some((x) => x.tipo === "aliado" && x.papel === "vilao")));
const w2 = g3(VEL, "recusar", [...velar, ["escolher", "rosto", "recusar"], enterrar]);
t("o Velório: recusar — concluída, e o relógio dele anda", w2.R.estado === "concluida" && w2.R.consequencias.some((c) => c.efeitos.some((x) => x.tipo === "relogio_do_fio" && x.n === 1)));
const w3 = g3(VEL, "acusar · o luto quebrado", [...velar, ["escolher", "rosto", "acusar"], enterrar]);
t("o Velório: acusar quebra o luto — o enterro espera a confiança de quem chora", w3.R.reviravoltas.some((r) => r.id === "o_luto_quebrado") && !w3.R.feitas.enterro && w3.R.estado === "aberta");
w3.turno(confia("Celeste"));
t("e com ela reconquistada, o morto vai à terra", w3.R.estado === "concluida");
const w4 = g3(VEL, "o caixão leve", [(e) => falar(ir(e, CAPELA), "Celeste"), (e) => consulta(consulta(e, "Celeste"), "Celeste")]);
t("o Velório: perguntar duas vezes a quem vela mostra o caixão vazio", w4.R.reviravoltas.some((r) => r.id === "o_caixao_leve") && /quem paga o enterro/.test(w4.ver().faltaTexto.join(" ")) && !/Quelvar/.test(w4.ver().faltaTexto.join(" ")), J(w4.ver().faltaTexto));
const w5 = g3(VEL, "a mão levantada", [...velar, (e) => lutar(e, { nome: "Celeste" })], { falha: 0 });
t("o Velório: levantar a mão a quem vela — falhada", w5.R.motivo === "falha" && /caixão/.test(w5.R.fecho.texto));
const w6 = g3(VEL, "quem vela morre", [(e) => falar(ir(e, CAPELA), "Celeste"), (e) => morre(e, "Celeste")], { falha: 1 });
t("o Velório: quem velava morta antes da oferta — falhada", w6.R.motivo === "falha" && /vela apagada/.test(w6.R.fecho.texto));
const w7 = g3(VEL, "o abandono", [(e) => dias(e, 3)]);
t("o Velório: três dias — o enterro faz-se sem o herói", w7.R.motivo === "abandono");

/* ---- A Hora Marcada ---- */
const HOR = "a_hora_marcada";
const noLargo = (e) => ir(e, LARGO);
const h1 = g3(HOR, "luta poupando · palavra · luta poupando · poupar", [noLargo, (e) => lutar(e, { nome: "Sancha", rendido: true }), confia("Tomás"), (e) => lutar(e, { nome: "Quelvar", rendido: true }), ["escolher", "sentenca", "poupar"]]);
t("a Hora: a porta, a mão tirada pela palavra, o vilão de joelhos, poupar — concluída", h1.R.estado === "concluida" && h1.R.feitas.porta.variante === "poupou" && h1.R.feitas.executor.ramo === "palavra" && h1.R.feitas.frente.variante === "poupou" && h1.R.feitas.sentenca.ramo === "poupar", J(h1.R.feitas));
const h2 = g3(HOR, "a porta de dentro · matar", [noLargo, confia("Tomás"), (e) => lutar(e, { nome: "Quelvar" })]);
t("a Hora: quem tem a mão abre a porta lateral, e o vilão morto fecha ali, sem sentença", h2.R.feitas.porta.ramo === "dentro" && h2.R.feitas.frente.variante === "matou" && h2.R.estado === "concluida" && !h2.R.feitas.sentenca, J(h2.R));
const h3 = g3(HOR, "a força · a prova (uma pessoa) · acabar", [(e) => juntar(noLargo(e), { nome: "Teodora", vinculo: 30 }), (e) => lutar(e, { nome: "Sancha" }), (e) => lutar(e, { nome: "Tomás", rendido: true }), ["escolher", "prova", "expor"], ["escolher", "sentenca", "acabar"]], { papeis: { fraqueza_quem: { nome: "Teodora" } } });
t("a Hora: a fraqueza ao lado abre a prova; a mão tirada à força; expor derruba sem luta; acabar", h3.R.reviravoltas.some((r) => r.id === "a_prova_na_mao") && h3.R.feitas.executor.variante === "poupou" && h3.R.feitas.frente.ramo === "prova" && h3.R.feitas.frente.variante === "pessoa" && h3.R.feitas.sentenca.ramo === "acabar", J(h3.R.feitas));
const h4 = g3(HOR, "a coisa guardada · matar quem tinha a mão · selar", [(e) => levar(noLargo(e), "O apito de osso"), (e) => lutar(e, { nome: "Sancha" }), (e) => lutar(e, { nome: "Tomás" }), ["escolher", "prova", "guardar"], (e) => lutar(e, { nome: "Quelvar", rendido: true }), ["escolher", "sentenca", "selar"]], { papeis: { fraqueza_coisa: { nome: "o apito de osso" } } });
t("a Hora: matar quem foi obrigado custa à região; guardar a prova obriga à luta; selar na cave", h4.R.feitas.executor.variante === "matou" && h4.R.feitas.prova.ramo === "guardar" && h4.R.feitas.frente.ramo === "luta" && h4.R.feitas.sentenca.ramo === "selar", J(h4.R.feitas));
const h5 = g3(HOR, "a verdade · expor", [(e) => segredo(noLargo(e), ALFANDEGA), (e) => lutar(e, { nome: "Sancha" }), confia("Tomás"), ["escolher", "prova", "expor"], ["escolher", "sentenca", "poupar"]], { papeis: { fraqueza_verdade: ALFANDEGA } });
t("a Hora: a verdade descoberta também abre a prova", h5.R.feitas.frente.ramo === "prova" && h5.R.feitas.frente.variante === null && h5.R.estado === "concluida", J(h5.R.feitas));
const pacto3 = ficha(mundo3(), "Quelvar", { relacao: "aliado" });
const h6 = g3(HOR, "o pacto cumprido", [noLargo, ["escolher", "pacto", "cumprir"]], { e0: pacto3 });
t("a Hora: quem é aliado dele encontra um lugar posto, e cumprir a palavra fecha a quest (o pacto)", h6.R.reviravoltas.some((r) => r.id === "a_divida_cobrada") && h6.R.feitas.divida.ramo === "cumprir" && h6.R.estado === "concluida");
const h7 = g3(HOR, "o pacto rasgado", [noLargo, ["escolher", "pacto", "romper"], (e) => lutar(e, { nome: "Sancha" }), confia("Tomás"), (e) => lutar(e, { nome: "Quelvar" })], { e0: pacto3 });
t("a Hora: rasgar o pacto fere quem tem a mão, e a hora continua até ao fim", h7.R.feitas.divida.ramo === "romper" && h7.R.consequencias.some((c) => c.efeitos.some((x) => x.situacao === "ferida" && x.papel === "executor")) && h7.R.estado === "concluida");
const h8 = g3(HOR, "a cave", [noLargo, (e) => consulta(falar(e, "Tomás"), "Tomás"), confia("Tomás")]);
t("a Hora: perguntar a quem tem a mão mostra a cave — a palavra não chega enquanto a chave não mudar de dono", h8.R.reviravoltas.some((r) => r.id === "a_cave") && h8.R.feitas.porta && !h8.R.feitas.executor, J(h8.R.feitas));
h8.turno((e) => lutar(e, { nome: "Sancha" }));
t("e com o guarda da chave caído, a mão sai", !!h8.R.feitas.executor);
const h9 = g3(HOR, "quem tinha a mão morre", [noLargo, (e) => morre(e, "Tomás")], { falha: 0 });
t("a Hora: quem tinha a mão morto por outra — falhada, a hora cumpre-se", h9.R.motivo === "falha" && /outra mão/.test(h9.R.fecho.texto));
const h10 = g3(HOR, "outra mão primeiro", [noLargo, confia("Tomás"), (e) => morre(e, "Quelvar")], { falha: 1 });
t("a Hora: o vilão morto por outra mão — falhada", h10.R.motivo === "falha" && /Outra mão/.test(h10.R.fecho.texto));
const h11 = g3(HOR, "o abandono", [(e) => dias(e, 8)]);
t("a Hora: oito dias — a hora chega sem o herói", h11.R.motivo === "abandono");

/* ---- O Sangue do Outro Lado ---- */
const SAN = "o_sangue_do_outro_lado";
const sangue = (vinculo, s1, s2, { antes = [], depois = [], baixa = null } = {}) => g3(SAN, `${s1} · ${s2} · ${vinculo}${baixa ? "→" + baixa : ""}`, [
  (e) => dias(e, 2), (e) => falar(falar(e, "Iago"), "Iago"), ["escolher", "sangue", s1], ...(baixa ? [(e) => grupo(e, IAGO(baixa))] : []), ...antes,
  (e) => falar(ir(e, FERRADOR), "Rufino"), ...depois, ["escolher", "segredo", s2], (e) => falar(e, "Rufino")], { e0: mundo3([IAGO(vinculo)]) });
const s31 = sangue(80, "esperanca", "trocar", { depois: [confia("Rufino")] });
t("o Sangue: esperança, a fita cortada, e os dois dizem tudo — o sangue volta (o melhor)", s31.R.desfecho === "o_sangue_volta" && s31.ver().ordem === 1 && s31.R.reviravoltas.some((r) => r.id === "a_fita_cortada"), J(s31.R));
const s32 = sangue(55, "verdade", "contar");
t("o Sangue: contar com confiança — a verdade inteira", s32.R.desfecho === "a_verdade_inteira");
const s33 = sangue(80, "verdade", "contar", { baixa: 30, depois: [(e) => consulta(e, "Rufino")] });
t("o Sangue: quem perguntou ao irmão sabe porque a porta se abriu — a verdade inteira, mesmo sem confiança", s33.R.reviravoltas.some((r) => r.id === "a_noite_da_porta") && s33.R.desfecho === "a_verdade_inteira", J(s33.R));
const s34 = sangue(80, "verdade", "contar", { baixa: 30 });
t("o Sangue: contar metade a quem não confia — sangue contra sangue (o pior)", s34.R.desfecho === "sangue_contra_sangue" && s34.R.consequencias.some((c) => c.efeitos.some((x) => x.tipo === "morte" && x.papel === "quem")));
t("e o veredito de contar avisava, antes do clique, que metade da verdade mata", s34.vereditos.some((v) => v.chave === "segredo" && /aprendeu a matar/.test(v.opcoes.find((o) => o.id === "contar").custa)));
const s35 = sangue(55, "esperanca", "trocar");
t("o Sangue: pedir-lhe que o diga, sem confiança inteira — a meia verdade", s35.R.desfecho === "a_meia_verdade");
const s36 = sangue(55, "verdade", "calar");
t("o Sangue: calar em troca do que ele sabe — a mentira que salva", s36.R.desfecho === "a_mentira_que_salva" && s36.R.consequencias.some((c) => c.efeitos.some((x) => x.tipo === "relogio_do_fio" && x.n === -1)));
const s37 = g3(SAN, "o sangue calado (abandono)", [(e) => dias(e, 2), (e) => dias(e, 15)], { e0: mundo3([IAGO(55)]) });
t("o Sangue: a história ignorada acaba no padrão", s37.R.desfecho === "o_sangue_calado" && s37.R.motivo === "abandono");
const s38 = g3(SAN, "sem irmão", [(e) => dias(e, 2), (e) => morre(e, "Rufino")], { e0: mundo3([IAGO(55)]) });
t("o Sangue: o irmão morto antes de se verem", s38.R.desfecho === "sem_irmao");
const s39 = g3(SAN, "a porta por explicar", [(e) => grupo(morre(e, "Iago"))], { e0: mundo3([IAGO(55)]) });
t("o Sangue: quem anda contigo morto pela estrada", s39.R.desfecho === "a_porta_por_explicar");
const combosS = [];
for (const v of [30, 55, 80]) for (const s1 of ["esperanca", "verdade"]) for (const s2 of ["calar", "contar", "trocar"]) for (const pergunta of [false, true]) {
  const r = sangue(80, s1, s2, { baixa: v, depois: pergunta ? [(e) => consulta(e, "Rufino")] : [] }).R;
  combosS.push({ v, s1, s2, pergunta, d: r.desfecho, estado: r.estado });
}
t("o Sangue: as 36 combinações acabam todas num desfecho", combosS.every((x) => x.estado === "terminada"), J(combosS.filter((x) => x.estado !== "terminada")));
t("o Sangue: a morte só chega a quem contou metade a quem não confiava", combosS.filter((x) => x.d === "sangue_contra_sangue").every((x) => x.s2 === "contar" && !x.pergunta && x.v < 55) && combosS.some((x) => x.d === "sangue_contra_sangue"));

/* ---- As Cartas de Outra Casa ---- */
const CAR = "as_cartas_de_outra_casa";
const cartas = (vinculo, bil, lua, { portela = true, extra = [] } = {}) => g3(CAR, `${bil} · ${lua} · ${vinculo}${portela ? "" : " · sem ver a estrada"}`, [
  (e) => dias(e, 2), (e) => falar(falar(e, "Iago"), "Iago"), ["escolher", "bilhete", bil], (e) => falar(ir(e, SOLAR), "Clarice"), ...extra,
  ...(portela ? [(e) => ir(e, PORTELA)] : []), ["escolher", "lua", lua]], { e0: mundo3([IAGO(vinculo)]) });
const k1 = cartas(80, "levar", "fugir", { extra: [(e) => consulta(e, "Clarice"), (e) => segredo(e, SOLAR)] });
t("as Cartas: levar, a porta e o amor, a dívida da casa, a estrada vista, fugir — do outro lado da serra (o melhor)", k1.R.desfecho === "do_outro_lado_da_serra" && k1.ver().ordem === 1 && ["a_porta_e_o_amor", "a_divida_da_casa"].every((id) => k1.R.reviravoltas.some((r) => r.id === id)), J(k1.R));
const k2 = cartas(55, "levar", "pedir");
t("as Cartas: pagar a dívida e pedir a mão — a mão pedida, comprada", k2.R.desfecho === "a_mao_pedida" && k2.R.consequencias.some((c) => c.efeitos.some((x) => x.tipo === "moedas" && x.n === -100)));
const k3 = cartas(55, "recusar", "fugir");
t("as Cartas: fugir com a estrada vista, sem confiança inteira — a carta que não se manda", k3.R.desfecho === "a_carta_que_nao_se_manda");
const k4 = cartas(55, "levar", "renunciar");
t("as Cartas: deixar ir — a despedida", k4.R.desfecho === "a_despedida");
const k5 = cartas(80, "levar", "fugir", { portela: false });
t("as Cartas: fugir sem ninguém ter ido ver a estrada — a estrada vigiada (o pior)", k5.R.desfecho === "a_estrada_vigiada" && k5.R.consequencias.some((c) => c.efeitos.some((x) => x.tipo === "morte" && x.papel === "quem")));
t("e o veredito de fugir avisava, antes do clique, que a estrada se vê antes", k5.vereditos.some((v) => v.chave === "lua" && /ninguém for ver antes/.test(v.opcoes.find((o) => o.id === "fugir").custa)));
const k6 = cartas(80, "contar", "fugir");
t("as Cartas: quem contou as cartas ao prometido entregou-lhe a estrada — a estrada vigiada, mesmo vista", k6.R.desfecho === "a_estrada_vigiada");
const k7 = g3(CAR, "as cartas guardadas (abandono)", [(e) => dias(e, 2), (e) => dias(e, 15)], { e0: mundo3([IAGO(55)]) });
t("as Cartas: a história ignorada acaba no padrão", k7.R.desfecho === "as_cartas_guardadas");
const k8 = g3(CAR, "antes da lua", [(e) => dias(e, 2), (e) => morre(e, "Clarice")], { e0: mundo3([IAGO(55)]) });
t("as Cartas: quem era amado morto antes da lua cheia", k8.R.desfecho === "antes_da_lua");
const k9 = g3(CAR, "as cartas sem dono", [(e) => grupo(morre(e, "Iago"))], { e0: mundo3([IAGO(55)]) });
t("as Cartas: quem anda contigo morto pela estrada", k9.R.desfecho === "as_cartas_sem_dono");
const combosK = [];
for (const v of [55, 80]) for (const b of ["levar", "recusar", "contar"]) for (const l of ["fugir", "pedir", "renunciar"]) for (const portela of [false, true]) {
  const r = cartas(v, b, l, { portela }).R;
  combosK.push({ v, b, l, portela, d: r.desfecho, estado: r.estado });
}
t("as Cartas: as 36 combinações acabam todas num desfecho", combosK.every((x) => x.estado === "terminada"), J(combosK.filter((x) => x.estado !== "terminada")));
t("as Cartas: a morte só chega a quem fugiu sem ver a estrada, ou depois de a contar", combosK.filter((x) => x.d === "a_estrada_vigiada").every((x) => x.l === "fugir" && (!x.portela || x.b === "contar")) && combosK.some((x) => x.d === "a_estrada_vigiada"));
t("as Cartas: pedir ou deixar ir nunca mata ninguém", combosK.filter((x) => x.l !== "fugir").every((x) => x.d !== "a_estrada_vigiada"));

/* ---- A COBERTURA, contada da ficha ---- */
t("nenhum guião do lote 3 tentou uma escolha fechada", casos.filter((c) => LOTE3.includes(c.id)).every((c) => !c.erro), casos.filter((c) => LOTE3.includes(c.id) && c.erro).map((c) => `${c.id}/${c.nome}: ${c.erro}`).join("; "));
for (const id of LOTE3) {
  const F = questPorId(id);
  const meus = casos.filter((c) => c.id === id);
  const etapas = [...F.etapas, ...F.reviravoltas.flatMap((r) => r.efeitos).filter((x) => x.tipo === "abre_etapa").map((x) => x.etapa)];
  const ramos = etapas.flatMap((e) => (e.ramos || []).map((r) => `${e.id}:${r}`));
  const vistos = new Set(meus.flatMap((c) => Object.entries(c.j.R.feitas).map(([k, v]) => `${k}:${v.ramo}`)));
  const opcoes = Object.entries(F.escolhas).flatMap(([k, e]) => Object.keys(e.opcoes).map((o) => `${k}:${o}`));
  const escolhidas = new Set(meus.flatMap((c) => Object.entries(c.j.R.escolhas).map(([k, v]) => `${k}:${v.opcao}`)));
  const revs = F.reviravoltas.map((r) => r.id);
  const disparadas = new Set(meus.flatMap((c) => c.j.R.reviravoltas.map((r) => r.id)));
  const faltam = [...ramos.filter((r) => !vistos.has(r)), ...opcoes.filter((o) => !escolhidas.has(o)), ...revs.filter((r) => !disparadas.has(r))];
  t(`${F.titulo}: todo ramo, toda opção e toda reviravolta alcançados por um guião`, faltam.length === 0, faltam.join(", "));
  if (F.tipo === 1) {
    const falhas = new Set(meus.filter((c) => c.falha != null && c.j.R.motivo === "falha").map((c) => c.falha));
    t(`${F.titulo}: concluível, cada falha alcançada, e o abandono`, meus.some((c) => c.j.R.estado === "concluida") && F.falha.every((_, i) => falhas.has(i)) && meus.some((c) => c.j.R.motivo === "abandono"), J([...falhas]));
  } else {
    const alcancados = new Set(meus.map((c) => c.j.R.desfecho).filter(Boolean));
    t(`${F.titulo}: cada desfecho alcançado pelo que o herói fez, do melhor ao pior`, F.desfechos.every((d) => alcancados.has(d.id)), F.desfechos.filter((d) => !alcancados.has(d.id)).map((d) => d.id).join(", "));
  }
  const txt = meus.flatMap((c) => [c.j.ver().gancho, c.j.ver().etapaTexto, ...c.j.ver().faltaTexto, ...c.j.R.consequencias.map((x) => x.texto), c.j.R.fecho && c.j.R.fecho.texto,
    ...(c.j.vereditos || []).flatMap((v) => v.opcoes.flatMap((o) => [o.texto, o.ganha, o.custa]))]).filter(Boolean).join(" ");
  t(`${F.titulo}: o texto à vista não tem chavetas nem nomes de papel`, !/[{}]|papel:|lugar:|item:|undefined|\b(pastora|tratador|pedinte|feitor|sobrevivente|guardiao|pagina|limpador|enlutada|executor|irmao|amado|prometido|devedor|ruina|esconderijo|fraqueza_\w+)\b/.test(txt));
  t(`${F.titulo}: todo veredito diz os dois lados`, meus.every((c) => (c.j.vereditos || []).every((v) => v.opcoes.every((o) => o.ganha.length > 20 && o.custa.length > 20))));
}
{
  const abertas = LOTE3.map((id) => abrirQuest(id, { estado: mundo3([IAGO(55)]), papeis: PAPEIS2[id] }));
  t("o lote 3 abre num mundo vazio, aberto e sem nenhuma etapa feita", abertas.every((r) => r && r.estado === "aberta" && Object.keys(r.feitas).length === 0));
  t("as Botas com a mãe já ouvida não abrem (a primeira etapa já está cumprida)", abrirQuest(BOT, { estado: falar(mundo3(), "Graça"), papeis: PAPEIS2[BOT] }) === null);
  t("o Velório com quem vela já morto não abre (a falha já aconteceu)", abrirQuest(VEL, { estado: morre(mundo3(), "Celeste"), papeis: PAPEIS2[VEL] }) === null);
  const jn = jogo(BRA, PAPEIS2[BRA], mundo3(), { quests: [] });
  jn.turno((e) => nomear(e, "Rosa", "Elias", "Morais"));
  t("nomear quem pede não é ouvi-lo", !jn.R.feitas.pedido);
  /* o género de quem ocupa o papel: a mesma ficha diz «sozinho» de um e «sozinha» de uma */
  const so = (genero) => { const e = mundo3([{ nome: "Iago", vinculo: 55, genero }]); const j = jogo(CAR, PAPEIS2[CAR], e, { quests: UM_TIPO_1_CONCLUIDO }); j.turno((x) => dias(x, 2)).turno((x) => falar(falar(x, "Iago"), "Iago")); return vereditoDaEscolha(j.F, j.R, "bilhete", j.ctx()).opcoes.find((o) => o.id === "recusar").custa; };
  t("o marcador de género: «sozinho» de um homem, «sozinha» de uma mulher", /sozinho,/.test(so("m")) && /sozinha,/.test(so("f")), so("m") + " | " + so("f"));
  const g = () => { turno = 5000; return J(sangue(80, "verdade", "contar", { baixa: 30, depois: [(e) => consulta(e, "Rufino")] }).R); };
  t("determinístico: o mesmo guião do lote 3 dá o mesmo registo", g() === g());
}


sec("§11 o acervo, lote 4 (BQ8) — cada quest por cada ramo, e a cobertura contada");
/* As dez quests do lote 4 (src/acervo/quests-lote-4.js), pelas mesmas
   portas e pela mesma régua dos lotes 2 e 3: um guião por caminho, e a
   cobertura contada da ficha. Duas portas novas no guião: `avista` (quem
   está à vista sem se lhe falar — o «conheceu» de uma fera, que não
   conversa) e o vilão que é bicho, posto no registo como qualquer nome. */
const NOVOS4 = {
  "Quimera Rubra": N("Quimera Rubra"), Ildo: N("Ildo"), Lino: N("Lino"),
  Gil: N("Gil"), Leandro: N("Leandro"), Olavo: N("Olavo"),
  Joaquina: N("Joaquina"), Severo: N("Severo"), "Ogro Cinzento": N("Ogro Cinzento"),
  Firmino: N("Firmino"), Aurélio: N("Aurélio"), Dâmaso: N("Dâmaso"),
  Matilde: N("Matilde"), Rogério: N("Rogério"), Hilário: N("Hilário"),
  Benedita: N("Benedita"), Custódio: N("Custódio"), Leonilde: N("Leonilde"),
  Rosália: N("Rosália"),
  Adelaide: N("Adelaide", FOZ), Baltasar: N("Baltasar", FOZ),
  Amândio: N("Amândio", FOZ), Caetano: N("Caetano", FOZ),
  Rafael: N("Rafael", FOZ), Custódia: N("Custódia", FOZ),
};
const mundo4 = (membros = []) => ({ ...mundo3(membros), npcs: { ...NPCS, ...NOVOS, ...NOVOS3, ...NOVOS4 } });
const avista = (e, ...nomes) => ({ ...e, factos: anotarOLivro(e, { tipo: "factos", dia: e.dia, turno: (turno += 10), emCena: nomes.map((nome) => ({ nome, aqui: true, deOnde: "registo", tipo: "pessoa" })) }).factos });
const FEIRA = { nome: "Feira do Gado", cidade: CIDADE }, COVA = { nome: "Cova do Fundo", cidade: CIDADE }, FUNDA = { nome: "Pedreira Funda", cidade: CIDADE };
const CADEIA = { nome: "Cadeia Velha", cidade: CIDADE }, OLARIA = { nome: "Casa do Oleiro", cidade: CIDADE }, PACO = { nome: "Biblioteca do Paço", cidade: CIDADE };
const BANHOS = { nome: "Casa de Banhos", cidade: CIDADE }, CAIS_RIO = { nome: "Cais do Rio", cidade: CIDADE };
const TABERNA = { nome: "Taberna do Largo", cidade: FOZ }, SE = { nome: "Tribunal da Sé", cidade: FOZ }, MOINHO4 = { nome: "Moinho Novo", cidade: FOZ };
Object.assign(PAPEIS2, {
  a_luz_do_dia: { vilao: { nome: "Quimera Rubra" }, campo: FEIRA, vigia: { nome: "Ildo" }, pequeno: { nome: "Lino" } },
  o_fundo_da_toca: { vilao: { nome: "Quimera Rubra" }, toca: COVA, guarda: { nome: "Gil" }, levado: { nome: "Leandro" }, guia: { nome: "Olavo" } },
  o_fundo_da_pedreira: { pedreira: FUNDA, cavadora: { nome: "Joaquina" }, capataz: { nome: "Severo" }, guarda: { nome: "Ogro Cinzento" } },
  o_enforcado_de_amanha: { acusado: { nome: "Firmino" }, cela: CADEIA, juiz: { nome: "Aurélio" }, ruina: OLARIA, servo: { nome: "Dâmaso" }, recibo: { nome: "o recibo meio queimado" } },
  o_livro_dos_nomes: { escrivao: { nome: "Matilde" }, casa: PACO, servo: { nome: "Rogério" }, copista: { nome: "Hilário" }, livro: { nome: "o livro dos nomes" } },
  as_maos_que_curam: { curadora: { nome: "Benedita" }, servo: { nome: "Custódio" }, arquivo: BANHOS, viuva: { nome: "Leonilde" } },
  do_outro_lado_do_vau: { vilao: { nome: "Quelvar" }, margem: CAIS_RIO, barqueira: { nome: "Rosália" }, aldeia: { cidade: FOZ } },
  a_palavra_dada_a_um_enforcado: { quem: { nome: "Iago" }, mae: { nome: "Adelaide" }, irmao: { nome: "Baltasar" }, casa: TABERNA },
  a_vida_que_se_deve: { quem: { nome: "Iago" }, salvador: { nome: "Amândio" }, filho: { nome: "Caetano" }, tribunal: SE },
  a_farda_debaixo_do_colchao: { quem: { nome: "Iago" }, filho: { nome: "Rafael" }, avo: { nome: "Custódia" }, moinho: MOINHO4 },
});
const LOTE4 = QUESTS_LOTE_4.map((q) => q.id);
const g4 = (id, nome, passos, o = {}) => guiao(id, nome, passos, { e0: mundo4(), ...o });

/* ---- À Luz do Dia ---- */
const LUZ = "a_luz_do_dia";
const aoAlcance = [(e) => falar(e, "Ildo"), (e) => avista(ir(e, FEIRA), "Quimera Rubra")];
const depoisDaFeira = (e) => falar(em(e, PRACA), "Ildo");
const z1 = g4(LUZ, "recuar", [...aoAlcance, ["escolher", "rosto", "recuar"], depoisDaFeira]);
t("à Luz do Dia: a torre, ao alcance da fera (vista, sem lhe falar), recuar, contar à torre — concluída", z1.R.estado === "concluida" && z1.R.feitas.gesto.ramo === "recuar", J(z1.R.feitas));
const z2 = g4(LUZ, "ficar · o ferrete", [...aoAlcance, ["escolher", "rosto", "ficar"], depoisDaFeira]);
t("à Luz do Dia: ficar deixa ver o ferrete antigo (a pista de quem já a prendeu)", z2.R.reviravoltas.some((r) => r.id === "o_ferrete") && z2.R.estado === "concluida" && z2.R.consequencias.some((c) => c.efeitos.some((x) => x.premissa === "ferrete:vilao")));
const z3 = g4(LUZ, "a lição · dar", [(e) => falar(e, "Ildo"), (e) => consulta(e, "Ildo"), (e) => avista(ir(e, FEIRA), "Quimera Rubra"), ["escolher", "rosto", "dar"], depoisDaFeira]);
t("à Luz do Dia: perguntar à torre mostra a lição; dar o gado faz da fera aliada (o pacto que O Fundo da Toca lê)", z3.R.reviravoltas.some((r) => r.id === "a_licao") && z3.R.feitas.gesto.ramo === "dar"
  && z3.R.consequencias.some((c) => c.de === "escolha:rosto:dar" && c.efeitos.some((x) => x.tipo === "aliado" && x.papel === "vilao")) && z3.R.estado === "concluida", J(z3.R.reviravoltas));
const z4 = g4(LUZ, "o do lado de lá", [...aoAlcance, (e) => avista(e, "Lino")]);
const z4v = z4.ver();
t("à Luz do Dia: quem ficou do lado de lá, à vista — a resposta espera que o herói lá chegue", z4.R.reviravoltas.some((r) => r.id === "o_do_lado_de_la") && z4v.etapa === "gesto" && z4v.escolhas.length === 0, J(z4v));
z4.turno((e) => falar(e, "Lino")).escolher("rosto", "recuar");
t("e com quem estava do lado de lá alcançado, a resposta abre", !!z4.R.feitas.gesto);
const zAl = g4(LUZ, "a alcunha", [(e) => falar(e, "Ildo")]).ver().etapaTexto;
t("e antes de a ver de perto, a fera é «o que veio à luz do dia», nunca o nome", /o que veio à luz do dia/.test(zAl) && !/Quimera/.test(zAl), zAl);
const z5 = g4(LUZ, "a falha", [(e) => falar(e, "Ildo"), (e) => morre(e, "Lino")], { falha: 0 });
t("à Luz do Dia: quem ficou do lado de lá morre antes da resposta — falhada", z5.R.motivo === "falha" && /portão/.test(z5.R.fecho.texto));
const z6 = g4(LUZ, "o abandono", [(e) => dias(e, 3)]);
t("à Luz do Dia: três dias — a vila paga", z6.R.motivo === "abandono");

/* ---- O Fundo da Toca ---- */
const FUN = "o_fundo_da_toca";
const naBoca = (e) => ir(e, COVA);
const comLeandro = (e) => juntar(e, { nome: "Leandro", vinculo: 30 });
const y1 = g4(FUN, "luta poupando · luta poupando · poupar", [naBoca, (e) => lutar(e, { nome: "Gil", rendido: true }), comLeandro, (e) => lutar(e, { nome: "Quimera Rubra", rendido: true }), ["escolher", "sentenca", "poupar"]]);
t("o Fundo da Toca: a boca, o guarda poupado, quem foi levado, a fera de cabeça no chão, poupar — concluída",
  y1.R.estado === "concluida" && y1.R.feitas.passagem.variante === "poupou" && y1.R.feitas.frente.variante === "poupou" && y1.R.feitas.sentenca.ramo === "poupar", J(y1.R.feitas));
const y2 = g4(FUN, "a fenda · o ninho · matar", [naBoca, (e) => segredo(consulta(e, "Olavo"), COVA), comLeandro, (e) => lutar(e, { nome: "Quimera Rubra" })]);
t("o Fundo da Toca: a fenda de quem conhece o caminho, o ninho, e a fera morta — concluída ali, sem sentença",
  y2.R.feitas.passagem.ramo === "fenda" && y2.R.reviravoltas.some((r) => r.id === "o_ninho") && y2.R.feitas.frente.variante === "matou" && y2.R.estado === "concluida" && !y2.R.feitas.sentenca, J(y2.R));
const y3 = g4(FUN, "a prova: uma pessoa · acabar", [(e) => juntar(naBoca(e), { nome: "Teodora", vinculo: 30 }), (e) => lutar(e, { nome: "Gil" }), comLeandro, ["escolher", "prova", "expor"], ["escolher", "sentenca", "acabar"]], { papeis: { fraqueza_quem: { nome: "Teodora" } } });
t("o Fundo da Toca: a voz a que obedece ao lado abre a prova, e expor baixa-lhe a cabeça sem luta; acabar",
  y3.R.reviravoltas.some((r) => r.id === "a_prova_na_mao") && y3.R.feitas.frente.ramo === "prova" && y3.R.feitas.frente.variante === "pessoa" && y3.R.feitas.sentenca.ramo === "acabar" && y3.R.estado === "concluida", J(y3.R.feitas));
const y4 = g4(FUN, "a coisa guardada · selar", [(e) => levar(naBoca(e), "O osso do altar"), (e) => lutar(e, { nome: "Gil" }), comLeandro, ["escolher", "prova", "guardar"], (e) => lutar(e, { nome: "Quimera Rubra", rendido: true }), ["escolher", "sentenca", "selar"]], { papeis: { fraqueza_coisa: { nome: "o osso do altar" } } });
t("o Fundo da Toca: guardar a coisa obriga à luta, e selar fecha a boca da toca", y4.R.feitas.prova.ramo === "guardar" && y4.R.feitas.frente.ramo === "luta" && y4.R.feitas.sentenca.ramo === "selar", J(y4.R.feitas));
const y5 = g4(FUN, "a verdade · expor · poupar", [(e) => segredo(naBoca(e), ALFANDEGA), (e) => lutar(e, { nome: "Gil" }), comLeandro, ["escolher", "prova", "expor"], ["escolher", "sentenca", "poupar"]], { papeis: { fraqueza_verdade: ALFANDEGA } });
t("o Fundo da Toca: a verdade descoberta também abre a prova", y5.R.feitas.frente.ramo === "prova" && y5.R.feitas.frente.variante === null && y5.R.estado === "concluida", J(y5.R.feitas));
t("sem fraqueza nenhuma, a prova nunca se abre", !y1.R.reviravoltas.some((r) => r.id === "a_prova_na_mao") && !y1.R.feitas.prova);
const pacto4 = ficha(mundo4(), "Quimera Rubra", { relacao: "aliado" });
const y6 = g4(FUN, "o pacto cumprido", [naBoca, ["escolher", "pacto", "cumprir"]], { e0: pacto4 });
t("o Fundo da Toca: a quem lhe deu o que veio buscar, o vale por quem foi levado — cumprir fecha a quest (o pacto)",
  y6.R.reviravoltas.some((r) => r.id === "a_divida_cobrada") && y6.R.feitas.divida.ramo === "cumprir" && y6.R.estado === "concluida" && y6.R.escolhas.pacto.opcao === "cumprir", J(y6.R));
const y7 = g4(FUN, "o pacto rasgado", [naBoca, ["escolher", "pacto", "romper"], (e) => lutar(e, { nome: "Gil" }), comLeandro, (e) => lutar(e, { nome: "Quimera Rubra" })], { e0: pacto4 });
t("o Fundo da Toca: rasgar o pacto fere quem foi levado, e a descida continua até ao fim",
  y7.R.feitas.divida.ramo === "romper" && y7.R.consequencias.some((c) => c.efeitos.some((x) => x.situacao === "ferida" && x.papel === "levado")) && y7.R.estado === "concluida");
const y8 = g4(FUN, "quem foi levado morre", [naBoca, (e) => morre(e, "Leandro")], { falha: 0 });
t("o Fundo da Toca: quem foi levado morto antes de lá chegares — falhada", y8.R.motivo === "falha" && /osso/.test(y8.R.fecho.texto));
const y9 = g4(FUN, "outra mão primeiro", [naBoca, (e) => lutar(e, { nome: "Gil" }), comLeandro, (e) => morre(e, "Quimera Rubra")], { falha: 1 });
t("o Fundo da Toca: a fera morta por outra mão — falhada (o ninho fica)", y9.R.motivo === "falha" && /ninho/.test(y9.R.fecho.texto));
const y10 = g4(FUN, "o abandono", [(e) => dias(e, 8)]);
t("o Fundo da Toca: oito dias — a boca alarga, e quem foi levado fica cativo", y10.R.motivo === "abandono" && y10.R.consequencias.some((c) => c.efeitos.some((x) => x.situacao === "cativa")));

/* ---- O Fundo da Pedreira ---- */
const PED = "o_fundo_da_pedreira";
const aBoca = (e) => falar(ir(e, FUNDA), "Joaquina");
const subir = (e) => falar(e, "Joaquina");
const p41 = g4(PED, "lâmina poupando · cavar", [aBoca, (e) => lutar(e, { nome: "Ogro Cinzento", rendido: true }), ["escolher", "pedra", "cavar"], subir]);
t("o Fundo da Pedreira: a boca, o guarda (que pode ser bicho) poupado, cavar, ver quem sobe — concluída",
  p41.R.estado === "concluida" && p41.R.feitas.guarda.variante === "poupou" && p41.R.feitas.fundo.ramo === "cavar" && p41.R.consequencias.some((c) => c.efeitos.some((x) => x.tipo === "dia" && x.n === 3)), J(p41.R.feitas));
const p42 = g4(PED, "a boca fechada · o respiro · as batidas · pólvora", [aBoca, (e) => consulta(falar(e, "Severo"), "Severo"), (e) => segredo(e, FUNDA), ["escolher", "pedra", "polvora"], subir]);
t("o Fundo da Pedreira: quem tirou os esteios confessa, o respiro velho, as batidas contadas, a pólvora",
  ["a_boca_fechada_por_dentro", "as_batidas"].every((id) => p42.R.reviravoltas.some((r) => r.id === id)) && p42.R.feitas.guarda.ramo === "respiro" && p42.R.feitas.fundo.ramo === "polvora" && p42.R.estado === "concluida", J(p42.R));
const p43 = g4(PED, "lâmina matando · o capataz à frente", [aBoca, (e) => lutar(e, { nome: "Ogro Cinzento" }), ["escolher", "pedra", "capataz"], subir]);
t("o Fundo da Pedreira: obrigar quem fechou a descer primeiro faz dele inimigo", p43.R.feitas.fundo.ramo === "capataz" && p43.R.consequencias.some((c) => c.efeitos.some((x) => x.tipo === "inimigo" && x.papel === "capataz")) && p43.R.estado === "concluida");
const p44 = g4(PED, "a falha", [aBoca, (e) => morre(e, "Joaquina")], { falha: 0 });
t("o Fundo da Pedreira: quem cavava morre na corda — falhada", p44.R.motivo === "falha" && /corda/.test(p44.R.fecho.texto));
const p45 = g4(PED, "o abandono", [(e) => dias(e, 4)]);
t("o Fundo da Pedreira: quatro dias — as batidas param", p45.R.motivo === "abandono");

/* ---- O Enforcado de Amanhã ---- */
const ENF = "o_enforcado_de_amanha";
const aGrade = (e) => falar(ir(e, CADEIA), "Firmino");
const naRuina = (e) => segredo(ir(e, OLARIA), OLARIA);
const x1 = g4(ENF, "o papel · mostrar", [aGrade, naRuina, (e) => levar(e, "O recibo meio queimado"), ["escolher", "forca", "mostrar"]]);
t("o Enforcado: a grade, a ruína vista, o recibo na mão, a prova na praça — concluída", x1.R.estado === "concluida" && x1.R.feitas.autor.ramo === "papel" && x1.R.feitas.forca.ramo === "mostrar", J(x1.R.feitas));
t("e mostrar faz de quem assinou um inimigo, e avisa quem fez aquilo", x1.R.consequencias.some((c) => c.de === "escolha:forca:mostrar" && c.efeitos.some((x) => x.tipo === "inimigo" && x.papel === "juiz") && c.efeitos.some((x) => x.tipo === "avisa_vilao")));
const x2 = g4(ENF, "a sentença com pressa · lâmina poupando · soltar", [aGrade, (e) => ir(e, OLARIA), (e) => consulta(falar(e, "Aurélio"), "Aurélio"), (e) => e, (e) => lutar(e, { nome: "Dâmaso", rendido: true }), ["escolher", "forca", "soltar"]]);
t("o Enforcado: quem assinou com pressa (a sentença comprada), o servo vencido e poupado, a fuga de noite",
  x2.R.reviravoltas.some((r) => r.id === "a_sentenca_com_pressa") && x2.R.feitas.autor.variante === "poupou" && x2.R.feitas.forca.ramo === "soltar" && x2.R.estado === "concluida", J(x2.R));
const x3 = g4(ENF, "a porta aberta · lâmina matando · guardar", [aGrade, (e) => consulta(consulta(e, "Firmino"), "Firmino"), naRuina, (e) => lutar(e, { nome: "Dâmaso" }), ["escolher", "forca", "guardar"]]);
t("o Enforcado: à segunda pergunta, quem vai à forca abriu uma porta por moedas; guardar a prova faz recuar o relógio dele",
  x3.R.reviravoltas.some((r) => r.id === "a_porta_aberta") && x3.R.feitas.autor.variante === "matou" && x3.R.feitas.forca.ramo === "guardar"
  && x3.R.consequencias.some((c) => c.efeitos.some((x) => x.tipo === "relogio_do_fio" && x.n === -2)), J(x3.R));
const x4 = g4(ENF, "a falha", [aGrade, (e) => morre(e, "Firmino")], { falha: 0 });
t("o Enforcado: morto na cela antes da hora — falhada", x4.R.motivo === "falha" && /confissão/.test(x4.R.fecho.texto));
const x5 = g4(ENF, "o abandono", [(e) => dias(e, 2)]);
t("o Enforcado: dois dias — a hora do mercado chega sem o herói", x5.R.motivo === "abandono");

/* ---- O Livro dos Nomes ---- */
const LIV = "o_livro_dos_nomes";
const ouvirMatilde = (e) => falar(e, "Matilde");
const v41 = g4(LIV, "o furto · a última página · devolver", [ouvirMatilde, (e) => ir(e, PACO), (e) => levar(e, "O livro dos nomes"), (e) => e, ["escolher", "livro", "devolver"]]);
t("o Livro: quem o guardava, onde está, o furto, a última página com o herói lá dentro, devolver — concluída",
  v41.R.estado === "concluida" && v41.R.feitas.livro.ramo === "furto" && v41.R.reviravoltas.some((r) => r.id === "a_ultima_pagina") && v41.R.feitas.destino.ramo === "devolver", J(v41.R));
const v42 = g4(LIV, "lâmina poupando · queimar", [ouvirMatilde, (e) => segredo(e, PACO), (e) => lutar(e, { nome: "Rogério", rendido: true }), ["escolher", "livro", "queimar"]]);
t("o Livro: o servo vencido e poupado, e o livro queimado (a terra perde a memória)", v42.R.feitas.livro.variante === "poupou" && v42.R.feitas.destino.ramo === "queimar" && v42.R.estado === "concluida");
const v43 = g4(LIV, "a letra vendida · lâmina matando · trocar", [ouvirMatilde, (e) => falar(e, "Hilário"), (e) => ir(e, PACO), (e) => lutar(e, { nome: "Rogério" }), ["escolher", "livro", "trocar"]]);
t("o Livro: quem imita letras já vendeu uma, e a cópia que mente faz recuar o relógio dele",
  v43.R.reviravoltas.some((r) => r.id === "a_letra_vendida") && v43.R.feitas.destino.ramo === "trocar" && v43.R.consequencias.some((c) => c.efeitos.some((x) => x.premissa === "falsario:copista")), J(v43.R));
const v44 = g4(LIV, "a falha", [ouvirMatilde, (e) => morre(e, "Matilde")], { falha: 0 });
t("o Livro: quem o guardava morto antes do destino — falhada", v44.R.motivo === "falha" && /página em branco/.test(v44.R.fecho.texto));
const v45 = g4(LIV, "o abandono", [(e) => dias(e, 5)]);
t("o Livro: cinco dias — cada casa recebe uma visita", v45.R.motivo === "abandono");

/* ---- As Mãos Que Curam ---- */
const MAO4 = "as_maos_que_curam";
const ouvirBenedita = (e) => falar(e, "Benedita");
const m41 = g4(MAO4, "a última febre · lâmina poupando · queimar", [ouvirBenedita, (e) => falar(consulta(e, "Benedita"), "Custódio"), (e) => lutar(e, { nome: "Custódio", rendido: true }), ["escolher", "segredo", "queimar"]]);
t("as Mãos: o que as cartas dizem (a última febre), quem as guarda vencido e poupado, queimar — concluída",
  m41.R.reviravoltas.some((r) => r.id === "a_ultima_febre") && m41.R.feitas.tirar.ramo === "lamina" && m41.R.feitas.segredo.ramo === "queimar" && m41.R.estado === "concluida", J(m41.R));
/* o preço só se paga a quem não foi revistar o arquivo: quem descobre onde
   estão as cartas, e lá está, já as tem (o furto fecha primeiro) */
const m42 = g4(MAO4, "o preço · contar", [ouvirBenedita, (e) => falar(consulta(e, "Benedita"), "Custódio"), ["escolher", "preco", "pagar"], ["escolher", "segredo", "contar"]]);
t("as Mãos: as cartas compradas por sessenta moedas a quem as guarda, e levadas a quem enterrou",
  m42.R.feitas.tirar.ramo === "preco" && m42.R.feitas.segredo.ramo === "contar"
  && m42.R.consequencias.some((c) => c.efeitos.some((x) => x.tipo === "moedas" && x.n === -60)) && m42.R.estado === "concluida", J(m42.R));
const m43 = g4(MAO4, "o furto · guardar", [ouvirBenedita, (e) => segredo(consulta(e, "Benedita"), BANHOS), (e) => ir(e, BANHOS), ["escolher", "segredo", "guardar"]]);
t("as Mãos: a lista das portas no arquivo, as cartas tiradas de onde se sabia que estavam, e guardadas (quem cura fica a dever)",
  m43.R.reviravoltas.some((r) => r.id === "as_portas_marcadas") && m43.R.feitas.tirar.ramo === "furto" && m43.R.feitas.segredo.ramo === "guardar" && m43.R.consequencias.some((c) => c.efeitos.some((x) => x.premissa === "devedor:curadora")));
t("e o veredito de pagar diz o preço antes do clique", m42.vereditos.some((v) => v.chave === "preco" && v.opcoes[0].custo === 60));
const m44 = g4(MAO4, "a falha", [ouvirBenedita, (e) => morre(e, "Benedita")], { falha: 0 });
t("as Mãos: quem cura morta antes da decisão — falhada", m44.R.motivo === "falha" && /giz/.test(m44.R.fecho.texto));
const m45 = g4(MAO4, "o abandono", [(e) => dias(e, 5)]);
t("as Mãos: cinco dias — as portas continuam a ser marcadas", m45.R.motivo === "abandono");

/* ---- Do Outro Lado do Vau ---- */
const VAU = "do_outro_lado_do_vau";
const naMargem = (e) => avista(ir(e, CAIS_RIO), "Quelvar");
const baixaAAgua = (e) => falar(falar(em(e, PRACA), "Rosália"), "Rosália");
const r41 = g4(VAU, "atravessar", [naMargem, (e) => consulta(e, "Rosália"), ["escolher", "rosto", "atravessar"], baixaAAgua]);
t("do Outro Lado do Vau: a margem, quem espera à vista, onde o vau dá pé, atravessar, a água a baixar — concluída", r41.R.estado === "concluida" && r41.R.feitas.resposta.ramo === "atravessar", J(r41.R.feitas));
const r42 = g4(VAU, "os pilares serrados · chamar", [naMargem, (e) => segredo(e, CAIS_RIO), (e) => consulta(e, "Rosália"), ["escolher", "rosto", "chamar"], baixaAAgua]);
t("do Outro Lado do Vau: os pilares serrados de véspera, e chamar por cima da água", r42.R.reviravoltas.some((r) => r.id === "os_pilares_serrados") && r42.R.feitas.resposta.ramo === "chamar" && r42.R.estado === "concluida");
const r43 = g4(VAU, "o vau mostrado · assistir", [naMargem, (e) => consulta(e, "Rosália"), (e) => consulta(e, "Rosália"), ["escolher", "rosto", "assistir"], baixaAAgua]);
t("do Outro Lado do Vau: o vau foi mostrado por quem espera do outro lado; assistir até ao fim", r43.R.reviravoltas.some((r) => r.id === "o_vau_mostrado") && r43.R.feitas.resposta.ramo === "assistir" && r43.R.estado === "concluida");
const r44 = g4(VAU, "a falha", [naMargem, (e) => morre(e, "Rosália")], { falha: 0 });
t("do Outro Lado do Vau: quem conhecia o fundo do rio morre antes da resposta — falhada", r44.R.motivo === "falha" && /pés na água/.test(r44.R.fecho.texto));
const r45 = g4(VAU, "o abandono", [(e) => dias(e, 3)]);
t("do Outro Lado do Vau: três dias — a água baixa sobre um silêncio", r45.R.motivo === "abandono");

/* ---- A Palavra Dada a Um Enforcado ---- */
const PAL = "a_palavra_dada_a_um_enforcado";
const palavra = (vinculo, p1, p2, { antes = [], depois = [], baixa = null } = {}) => g4(PAL, `${p1} · ${p2} · ${vinculo}${baixa ? "→" + baixa : ""}`, [
  (e) => dias(e, 2), (e) => falar(falar(e, "Iago"), "Iago"), ["escolher", "palavra", p1], ...(baixa ? [(e) => grupo(e, IAGO(baixa))] : []), ...antes,
  (e) => falar(ir(e, TABERNA), "Adelaide"), ...depois, ["escolher", "porta", p2]], { e0: mundo4([IAGO(vinculo)]) });
const q41 = palavra(80, "quebrar", "confessar", { antes: [(e) => falar(e, "Iago")], depois: [(e) => avista(e, "Baltasar")] });
t("a Palavra: a corda contada, o irmão que ficou, quebrar a promessa e confessar com confiança inteira — a camisa do filho (o melhor)",
  q41.R.desfecho === "a_camisa_do_filho" && q41.ver().ordem === 1 && ["a_corda", "o_irmao_que_ficou"].every((id) => q41.R.reviravoltas.some((r) => r.id === id)), J(q41.R));
const q42 = palavra(55, "cumprir", "mentir");
t("a Palavra: cumprir a promessa e mentir à porta — a mentira cumprida", q42.R.desfecho === "a_mentira_cumprida");
const q43 = palavra(55, "cumprir", "confessar");
t("a Palavra: confessar sem confiança inteira — a porta fechada sem bater", q43.R.desfecho === "a_porta_sem_bater");
const q44 = palavra(80, "cumprir", "denunciar");
t("a Palavra: dizer por ele, com confiança inteira — a verdade por outra boca, sem sangue", q44.R.desfecho === "a_verdade_por_outra_boca");
const q45 = palavra(80, "quebrar", "denunciar", { baixa: 55 });
t("a Palavra: dizer por ele, sem a confiança inteira — a espada do irmão (o pior)", q45.R.desfecho === "a_espada_do_irmao" && q45.R.consequencias.some((c) => c.efeitos.some((x) => x.tipo === "morte" && x.papel === "quem")));
t("e o veredito de dizer por ele avisava, antes do clique, que ninguém segurava a espada", q45.vereditos.some((v) => v.chave === "porta" && /segura a espada/.test(v.opcoes.find((o) => o.id === "denunciar").custa)));
const q46 = g4(PAL, "a fita enrolada (abandono)", [(e) => dias(e, 2), (e) => dias(e, 15)], { e0: mundo4([IAGO(55)]) });
t("a Palavra: a história ignorada acaba no padrão", q46.R.desfecho === "a_fita_enrolada");
const q47 = g4(PAL, "sem mãe", [(e) => dias(e, 2), (e) => morre(e, "Adelaide")], { e0: mundo4([IAGO(55)]) });
t("a Palavra: quem esperava o filho morta antes da porta", q47.R.desfecho === "sem_mae");
const q48 = g4(PAL, "a palavra sem dono", [(e) => grupo(morre(e, "Iago"))], { e0: mundo4([IAGO(55)]) });
t("a Palavra: quem anda contigo morto pela estrada", q48.R.desfecho === "a_palavra_sem_dono");
const combosP = [];
for (const v of [30, 55, 80]) for (const p1 of ["cumprir", "quebrar"]) for (const p2 of ["mentir", "confessar", "denunciar"]) {
  const r = palavra(80, p1, p2, { baixa: v }).R;
  combosP.push({ v, p1, p2, d: r.desfecho, estado: r.estado });
}
t("a Palavra: as 18 combinações acabam todas num desfecho", combosP.every((x) => x.estado === "terminada"), J(combosP.filter((x) => x.estado !== "terminada")));
t("a Palavra: a morte só chega a quem disse por ele, sem a confiança inteira (o veredito que a avisa)", combosP.filter((x) => x.d === "a_espada_do_irmao").every((x) => x.p2 === "denunciar" && x.v < 80) && combosP.some((x) => x.d === "a_espada_do_irmao"));
t("a Palavra: mentir ou confessar nunca mata ninguém", combosP.filter((x) => x.p2 !== "denunciar").every((x) => x.d !== "a_espada_do_irmao"));

/* ---- A Vida Que Se Deve ---- */
const VID = "a_vida_que_se_deve";
const vida = (vinculo, c1, c2, { antes = [], depois = [], baixa = null } = {}) => g4(VID, `${c1} · ${c2} · ${vinculo}${baixa ? "→" + baixa : ""}`, [
  (e) => dias(e, 2), (e) => falar(falar(e, "Iago"), "Iago"), ...antes, (e) => falar(ir(e, SE), "Amândio"), ["escolher", "conselho", c1],
  ...(baixa ? [(e) => grupo(e, IAGO(baixa))] : []), ...depois, ["escolher", "jura", c2]], { e0: mundo4([IAGO(vinculo)]) });
const perguntarAoFilho = (e) => consulta(falar(e, "Caetano"), "Caetano");
const w41 = vida(80, "recusar", "acusar", { antes: [(e) => falar(e, "Iago")], depois: [perguntarAoFilho] });
t("a Vida: o rio contado, a cama vazia, e a verdade inteira com confiança inteira — a verdade que salva (o melhor)",
  w41.R.desfecho === "a_verdade_que_salva" && w41.ver().ordem === 1 && ["o_rio", "a_cama_vazia"].every((id) => w41.R.reviravoltas.some((r) => r.id === id)), J(w41.R));
const w42 = vida(55, "pagar", "jurar");
t("a Vida: pagar a dívida com um juramento falso — a dívida paga", w42.R.desfecho === "a_divida_paga");
const w43 = vida(55, "pagar", "acusar");
t("a Vida: acusar com alguma confiança — a verdade que custa (a corda do rio devolvida)", w43.R.desfecho === "a_verdade_que_custa");
const w44 = vida(55, "recusar", "calar");
t("a Vida: calar diante da lei — o silêncio", w44.R.desfecho === "o_silencio_diante_da_lei");
const w45 = vida(80, "recusar", "acusar", { baixa: 30 });
t("a Vida: acusar sem saber porquê, e sem confiança — a porta do tribunal (o pior)", w45.R.desfecho === "a_porta_do_tribunal" && w45.R.consequencias.some((c) => c.efeitos.some((x) => x.tipo === "morte" && x.papel === "quem")));
t("e o veredito de acusar avisava, antes do clique, a porta por onde se sai", w45.vereditos.some((v) => v.chave === "jura" && /mesma porta/.test(v.opcoes.find((o) => o.id === "acusar").custa)));
const w46 = g4(VID, "a carta guardada (abandono)", [(e) => dias(e, 2), (e) => dias(e, 15)], { e0: mundo4([IAGO(55)]) });
t("a Vida: a história ignorada acaba no padrão", w46.R.desfecho === "a_carta_guardada");
const w47 = g4(VID, "sem quem salvou", [(e) => dias(e, 2), (e) => morre(e, "Amândio")], { e0: mundo4([IAGO(55)]) });
t("a Vida: quem tirou do rio morto antes da hora de jurar", w47.R.desfecho === "sem_salvador");
const w48 = g4(VID, "a dívida sem devedor", [(e) => grupo(morre(e, "Iago"))], { e0: mundo4([IAGO(55)]) });
t("a Vida: quem anda contigo morto pela estrada", w48.R.desfecho === "a_divida_sem_devedor");
const combosV = [];
for (const v of [30, 55, 80]) for (const c1 of ["pagar", "recusar"]) for (const c2 of ["jurar", "calar", "acusar"]) for (const pergunta of [false, true]) {
  const r = vida(80, c1, c2, { baixa: v, depois: pergunta ? [perguntarAoFilho] : [] }).R;
  combosV.push({ v, c1, c2, pergunta, d: r.desfecho, estado: r.estado });
}
t("a Vida: as 36 combinações acabam todas num desfecho", combosV.every((x) => x.estado === "terminada"), J(combosV.filter((x) => x.estado !== "terminada")));
t("a Vida: a morte só chega a quem acusou sem perguntar porquê e sem confiança", combosV.filter((x) => x.d === "a_porta_do_tribunal").every((x) => x.c2 === "acusar" && !x.pergunta && x.v < 55) && combosV.some((x) => x.d === "a_porta_do_tribunal"));

/* ---- A Farda Debaixo do Colchão ---- */
const FAR = "a_farda_debaixo_do_colchao";
const farda = (vinculo, s, { depois = [], baixa = null, segredo: comSegredo = false } = {}) => g4(FAR, `${s} · ${vinculo}${baixa ? "→" + baixa : ""}${comSegredo ? " · a farda vista" : ""}`, [
  (e) => dias(e, 2), (e) => falar(falar(e, "Iago"), "Iago"), (e) => falar(ir(e, MOINHO4), "Custódia"), ["escolher", "sangue", s],
  ...(baixa ? [(e) => grupo(e, IAGO(baixa))] : []), ...depois,
  comSegredo ? (e) => segredo(e, MOINHO4) : (e) => dias(e, 4), (e) => avista(em(e, MOINHO4), "Rafael")], { e0: mundo4([IAGO(vinculo)]) });
const falarAoRapaz = (e) => falar(falar(e, "Rafael"), "Rafael");
const f41 = farda(80, "contar", { depois: [(e) => consulta(e, "Custódia"), falarAoRapaz], segredo: true });
t("a Farda: a mentira de quinze anos, a farda debaixo do colchão (que acende a noite), contar com confiança — o nome dito (o melhor)",
  f41.R.desfecho === "o_nome_dito" && f41.ver().ordem === 1 && ["a_mentira_de_quinze_anos", "a_farda"].every((id) => f41.R.reviravoltas.some((r) => r.id === id)), J(f41.R));
const f42 = farda(55, "contar");
t("a Farda: contar sem confiança inteira — a porta que fica (ainda não lhe fala)", f42.R.desfecho === "a_porta_que_fica");
const f43 = farda(55, "calar", { depois: [falarAoRapaz] });
t("a Farda: ficar perto sem dizer, e falar-lhe — o estranho que ficou", f43.R.desfecho === "o_estranho_que_ficou");
const f44 = farda(55, "calar");
t("a Farda: ficar perto sem dizer, e sem lhe falar — a farda vestida (o padrão também)", f44.R.desfecho === "a_farda_vestida");
const f45 = farda(80, "levar");
t("a Farda: levar à força, com confiança inteira — a estrada à força, vivo e sem farda", f45.R.desfecho === "a_estrada_a_forca");
const f46 = farda(80, "levar", { baixa: 55 });
t("a Farda: levar à força sem confiança — a noite dos recrutas (o pior)", f46.R.desfecho === "a_noite_dos_recrutas" && f46.R.consequencias.some((c) => c.efeitos.some((x) => x.tipo === "morte" && x.papel === "quem")));
t("e o veredito de levar avisava, antes do clique, quem se punha à frente", f46.vereditos.some((v) => v.chave === "sangue" && /põe à frente/.test(v.opcoes.find((o) => o.id === "levar").custa)));
const f47 = g4(FAR, "a farda vestida (abandono)", [(e) => dias(e, 2), (e) => dias(e, 15)], { e0: mundo4([IAGO(55)]) });
t("a Farda: a história ignorada acaba no padrão", f47.R.desfecho === "a_farda_vestida" && f47.R.motivo === "abandono");
const f48 = g4(FAR, "sem filho", [(e) => dias(e, 2), (e) => morre(e, "Rafael")], { e0: mundo4([IAGO(55)]) });
t("a Farda: quem não sabia morto antes da noite", f48.R.desfecho === "sem_filho");
const f49 = g4(FAR, "o segredo que fica", [(e) => grupo(morre(e, "Iago"))], { e0: mundo4([IAGO(55)]) });
t("a Farda: quem anda contigo morto pela estrada", f49.R.desfecho === "o_segredo_que_fica");
const f50 = g4(FAR, "a noite espera", [(e) => dias(e, 2), (e) => falar(falar(e, "Iago"), "Iago"), (e) => falar(ir(e, MOINHO4), "Custódia"), ["escolher", "sangue", "calar"], (e) => avista(em(e, MOINHO4), "Rafael")], { e0: mundo4([IAGO(55)]) });
t("a Farda: sem a farda vista, a noite dos recrutas espera os seus dias", f50.ver().etapa === "recrutas" && f50.ver().acesa === false, J(f50.ver()));
const combosF = [];
for (const v of [30, 55, 80]) for (const s of ["contar", "calar", "levar"]) for (const fala of [false, true]) {
  const r = farda(80, s, { baixa: v, depois: fala ? [falarAoRapaz] : [] }).R;
  combosF.push({ v, s, fala, d: r.desfecho, estado: r.estado });
}
t("a Farda: as 18 combinações acabam todas num desfecho", combosF.every((x) => x.estado === "terminada"), J(combosF.filter((x) => x.estado !== "terminada")));
t("a Farda: a morte só chega a quem levou à força sem a confiança inteira", combosF.filter((x) => x.d === "a_noite_dos_recrutas").every((x) => x.s === "levar" && x.v < 80) && combosF.some((x) => x.d === "a_noite_dos_recrutas"));

/* ---- A COBERTURA, contada da ficha ---- */
t("nenhum guião do lote 4 tentou uma escolha fechada", casos.filter((c) => LOTE4.includes(c.id)).every((c) => !c.erro), casos.filter((c) => LOTE4.includes(c.id) && c.erro).map((c) => `${c.id}/${c.nome}: ${c.erro}`).join("; "));
for (const id of LOTE4) {
  const F = questPorId(id);
  const meus = casos.filter((c) => c.id === id);
  const etapas = [...F.etapas, ...F.reviravoltas.flatMap((r) => r.efeitos).filter((x) => x.tipo === "abre_etapa").map((x) => x.etapa)];
  const ramos = etapas.flatMap((e) => (e.ramos || []).map((r) => `${e.id}:${r}`));
  const vistos = new Set(meus.flatMap((c) => Object.entries(c.j.R.feitas).map(([k, v]) => `${k}:${v.ramo}`)));
  const opcoes = Object.entries(F.escolhas).flatMap(([k, e]) => Object.keys(e.opcoes).map((o) => `${k}:${o}`));
  const escolhidas = new Set(meus.flatMap((c) => Object.entries(c.j.R.escolhas).map(([k, v]) => `${k}:${v.opcao}`)));
  const revs = F.reviravoltas.map((r) => r.id);
  const disparadas = new Set(meus.flatMap((c) => c.j.R.reviravoltas.map((r) => r.id)));
  const faltam = [...ramos.filter((r) => !vistos.has(r)), ...opcoes.filter((o) => !escolhidas.has(o)), ...revs.filter((r) => !disparadas.has(r))];
  t(`${F.titulo}: todo ramo, toda opção e toda reviravolta alcançados por um guião`, faltam.length === 0, faltam.join(", "));
  if (F.tipo === 1) {
    const falhas = new Set(meus.filter((c) => c.falha != null && c.j.R.motivo === "falha").map((c) => c.falha));
    t(`${F.titulo}: concluível, cada falha alcançada, e o abandono`, meus.some((c) => c.j.R.estado === "concluida") && F.falha.every((_, i) => falhas.has(i)) && meus.some((c) => c.j.R.motivo === "abandono"), J([...falhas]));
  } else {
    const alcancados = new Set(meus.map((c) => c.j.R.desfecho).filter(Boolean));
    t(`${F.titulo}: cada desfecho alcançado pelo que o herói fez, do melhor ao pior`, F.desfechos.every((d) => alcancados.has(d.id)), F.desfechos.filter((d) => !alcancados.has(d.id)).map((d) => d.id).join(", "));
  }
  /* o que chega à tela: sem chaveta, sem nome de papel (os que não são
     também palavras da língua — «filho», «juiz», «recibo», «vigia», «moinho»…) */
  const txt = meus.flatMap((c) => [c.j.ver().gancho, c.j.ver().etapaTexto, ...c.j.ver().faltaTexto, ...c.j.R.consequencias.map((x) => x.texto), c.j.R.fecho && c.j.R.fecho.texto,
    ...(c.j.vereditos || []).flatMap((v) => v.opcoes.flatMap((o) => [o.texto, o.ganha, o.custa]))]).filter(Boolean).join(" ");
  t(`${F.titulo}: o texto à vista não tem chavetas nem nomes de papel`, !/[{}]|papel:|lugar:|item:|undefined|\b(pequeno|cavadora|capataz|acusado|escrivao|copista|curadora|viuva|barqueira|irmao|salvador|avo|fraqueza_\w+)\b/.test(txt));
  t(`${F.titulo}: todo veredito diz os dois lados`, meus.every((c) => (c.j.vereditos || []).every((v) => v.opcoes.every((o) => o.ganha.length > 20 && o.custa.length > 20))));
}
{
  const abertas = LOTE4.map((id) => abrirQuest(id, { estado: mundo4([IAGO(55)]), papeis: PAPEIS2[id] }));
  t("o lote 4 abre num mundo vazio, aberto e sem nenhuma etapa feita", abertas.every((r) => r && r.estado === "aberta" && Object.keys(r.feitas).length === 0));
  t("o Livro com quem o guardava já ouvido não abre (a primeira etapa já está cumprida)", abrirQuest(LIV, { estado: falar(mundo4(), "Matilde"), papeis: PAPEIS2[LIV] }) === null);
  t("à Luz do Dia com quem ficou do lado de lá já morto não abre (a falha já aconteceu)", abrirQuest(LUZ, { estado: morre(mundo4(), "Lino"), papeis: PAPEIS2[LUZ] }) === null);
  const jn = jogo(LUZ, PAPEIS2[LUZ], mundo4(), { quests: [] });
  jn.turno((e) => falar(e, "Ildo")).turno((e) => nomear(ir(e, FEIRA), "Quimera Rubra"));
  t("nomear a fera em plena feira não é tê-la diante dos olhos", !jn.R.feitas.alcance);
  /* o género: a mesma ficha diz «sentado» de um e «sentada» de uma */
  const sent = (genero) => { const e = mundo4(); const e2 = { ...e, npcs: { ...e.npcs, Matilde: { ...e.npcs.Matilde, genero } } }; const j = jogo(LIV, PAPEIS2[LIV], e2, { quests: [] }); j.turno(ouvirMatilde).turno((x) => morre(x, "Matilde")); return j.R.fecho ? j.R.fecho.texto : ""; };
  t("o marcador de género: «sentado» de um homem, «sentada» de uma mulher", /sentado à mesa/.test(sent("m")) && /sentada à mesa/.test(sent("f")), sent("m") + " | " + sent("f"));
  const g = () => { turno = 7000; return J(vida(80, "recusar", "acusar", { baixa: 30 }).R); };
  t("determinístico: o mesmo guião do lote 4 dá o mesmo registo", g() === g());
}

console.log(`\nBQ4 · a biblioteca de quests: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
