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
      com a fera que se vê e não se fala, pela mesma régua;
   §12 o acervo, lote 5 (BQ8) — as doze quests de src/acervo/quests-lote-5.js:
      os tenentes do cedo, as pistas do 3 e do 4, a pista do vilão que é
      bicho (lida no chão, nunca vista), e quatro do coração.
   §13 o acervo, lote 6 (BQ8) — as treze quests de src/acervo/quests-lote-6.js
      (o meio e o fim: dois rostos, dois confrontos, e quatro do coração). */
import {
  BIBLIOTECA_DE_QUESTS, TIPOS_DE_QUEST, QUANDO_DA_QUEST, ESTADOS_DA_QUEST, PAPEIS_DA_QUEST, MAOS_DO_VILAO,
  LIMITES_DA_QUEST, EFEITOS_DA_QUEST, EFEITOS_DA_REVIRAVOLTA, ATOS_DO_HEROI,
  questPorId, validarQuest, abrirQuest, avancarQuest, escolherNaQuest, vereditoDaEscolha, estadoDaQuest, NATUREZAS_DO_FIO,
} from "../src/biblioteca-de-quests.js";
import { QUESTS_LOTE_4 } from "../src/acervo/quests-lote-4.js";
import { QUESTS_LOTE_6 } from "../src/acervo/quests-lote-6.js";
import { QUESTS_LOTE_5 } from "../src/acervo/quests-lote-5.js";
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

sec("§12 o acervo, lote 5 (BQ8) — cada quest por cada ramo, e a cobertura contada");
/* As doze quests do lote 5 (src/acervo/quests-lote-5.js), pelas mesmas
   portas e pela mesma régua dos lotes 2 a 4: um guião por caminho, e a
   cobertura contada da ficha. O lote foi escrito para o que o esqueleto
   mediu com 27 quests: o ato 0 de todas as campanhas com quatro tenentes
   do cedo, o passo 3 e o 4 com poucas pistas, e o vilão que é bicho sem
   nenhuma quest do meio que o servisse. Tudo num bloco, para os nomes
   deste guião não pisarem os de outro lote. */
{
  const NOVOS5 = {
    Ludovina: N("Ludovina"), Tito: N("Tito"), "Javali Negro": N("Javali Negro"),
    Ascenso: N("Ascenso"), Belmiro: N("Belmiro"), Zulmira: N("Zulmira"),
    Valdemar: N("Valdemar"), Isolina: N("Isolina"), Crispim: N("Crispim"),
    Gervásio: N("Gervásio"), Felismina: N("Felismina"), Albano: N("Albano"),
    Etelvina: N("Etelvina"), Silvano: N("Silvano"), "Mastim Pardo": N("Mastim Pardo"),
    Genoveva: N("Genoveva"),
    Brígida: N("Brígida"), Anacleto: N("Anacleto"), Celina: N("Celina"),
    Eusébio: N("Eusébio"), Florêncio: N("Florêncio"),
    Sebastião: N("Sebastião", FOZ), Domingas: N("Domingas", FOZ),
    Teotónio: N("Teotónio", FOZ), Raquel: N("Raquel", FOZ),
    Bartolomeu: N("Bartolomeu", FOZ), Leopoldo: N("Leopoldo", FOZ),
    Cipriano: N("Cipriano", FOZ), Perpétua: N("Perpétua", FOZ),
  };
  const mundo5 = (membros = []) => { const m = mundo4(membros); return { ...m, npcs: { ...m.npcs, ...NOVOS5 } }; };
  const COVA5 = { nome: "Cemitério Velho", cidade: CIDADE }, CAIS5 = { nome: "Cais da Travessia", cidade: CIDADE }, QUARTEL5 = { nome: "Quartel da Ronda", cidade: CIDADE };
  const TORRE5 = { nome: "Torre do Sino", cidade: CIDADE }, RUA5 = { nome: "Rua dos Tanoeiros", cidade: CIDADE };
  const BARRO5 = { nome: "Largo do Barro", cidade: CIDADE }, REGISTO5 = { nome: "Arquivo da Sé", cidade: CIDADE };
  const EST5 = { nome: "Estalagem do Monte", cidade: CIDADE }, CEL5 = { nome: "Armazém do Trigo", cidade: CIDADE }, HOSP5 = { nome: "Hospício de Santa Clara", cidade: CIDADE };
  const POSTO5 = { nome: "Posto da Fronteira", cidade: FOZ }, SALA5 = { nome: "Sala de Armas", cidade: FOZ };
  const CAD5 = { nome: "Praça da Forca", cidade: FOZ }, CADEIA5 = { nome: "Cadeia do Castelo", cidade: FOZ };
  Object.assign(PAPEIS2, {
    o_pao_que_sai_de_noite: { mae: { nome: "Ludovina" }, crianca: { nome: "Tito" }, covil: COVA5, fera: { nome: "Javali Negro" } },
    a_barca_a_meio_do_rio: { cais: CAIS5, servo: { nome: "Ascenso" }, procurado: { nome: "Belmiro" }, parente: { nome: "Zulmira" } },
    as_chaves_da_guarda: { quartel: QUARTEL5, capitao: { nome: "Valdemar" }, sargento: { nome: "Isolina" }, servo: { nome: "Crispim" } },
    a_torre_do_sino: { torre: TORRE5, servo: { nome: "Gervásio" }, sineira: { nome: "Felismina" }, voluntario: { nome: "Albano" } },
    a_rua_que_nao_acorda: { rua: RUA5, curandeira: { nome: "Etelvina" }, acordado: { nome: "Silvano" }, servo: { nome: "Mastim Pardo" } },
    as_pegadas_no_barro: { vilao: { nome: "Quimera Rubra" }, cacadora: { nome: "Genoveva" }, barro: BARRO5, registo: REGISTO5 },
    a_estalagem_do_temporal: { estalagem: EST5, estalajadeira: { nome: "Brígida" }, servo: { nome: "Anacleto" }, orfa: { nome: "Celina" } },
    as_duas_fogueiras: { informante: { nome: "Eusébio" }, servo: { nome: "Florêncio" }, celeiro: CEL5, hospicio: HOSP5 },
    a_vigia_trocada: { quem: { nome: "Iago" }, jovem: { nome: "Sebastião" }, viuva: { nome: "Domingas" }, posto: POSTO5 },
    a_ultima_licao: { quem: { nome: "Iago" }, mestre: { nome: "Teotónio" }, aprendiz: { nome: "Raquel" }, sala: SALA5 },
    o_sangue_do_carrasco: { quem: { nome: "Iago" }, carrasco: { nome: "Bartolomeu" }, primo: { nome: "Leopoldo" }, cadafalso: CAD5 },
    quarenta_invernos: { quem: { nome: "Iago" }, um: { nome: "Cipriano" }, outro: { nome: "Perpétua" }, cadeia: CADEIA5 },
  });
  const LOTE5 = QUESTS_LOTE_5.map((q) => q.id);
  const g5 = (id, nome, passos, o = {}) => guiao(id, nome, passos, { e0: mundo5(), ...o });
  const nada = (e) => e;

  /* ---- o lote, contado da ficha ---- */
  const ids = BIBLIOTECA_DE_QUESTS.map((q) => q.id);
  const i5 = ids.indexOf(LOTE5[0]);
  const t15 = QUESTS_LOTE_5.filter((q) => q.tipo === 1);
  t("o lote 5 está no catálogo inteiro, pela ordem, logo depois do lote 4 (do seu ficheiro)",
    i5 === ids.indexOf(QUESTS_LOTE_4[QUESTS_LOTE_4.length - 1].id) + 1 && J(ids.slice(i5, i5 + LOTE5.length)) === J(LOTE5) && new Set(ids).size === ids.length);
  t("oito do tipo 1 e quatro do tipo 2, e o tipo 1 só do «cedo» e do «meio» (o «fim» é do lote 6)",
    t15.length === 8 && QUESTS_LOTE_5.length === 12 && t15.every((q) => q.quando.every((w) => ["cedo", "meio"].includes(w)))
    && ["cedo", "meio"].every((w) => t15.some((q) => q.quando.includes(w))));
  t("três tenentes do cedo contestam o passo 1 (o ato 0 de todas as campanhas), e um aceita o servo que é bicho",
    t15.filter((q) => q.quando.includes("cedo") && q.mao.tipo === "tenente" && q.mao.contra.includes(1)).length >= 3
    && t15.some((q) => q.mao.contra.includes(1) && J(q.papeis[q.mao.papel].aceita) === J(["fera"])));
  t("duas pistas do meio contestam o 3 e o 4 (o 4 das espinhas de quatro atos)",
    t15.filter((q) => q.quando.includes("meio") && [q.mao.tipo, ...(q.mao.tambem || [])].includes("pista") && [3, 4].every((p) => q.mao.contra.includes(p))).length >= 2);
  const pegadas = questPorId("as_pegadas_no_barro");
  const vilaoP = Object.values(pegadas.papeis).find((p) => p.de === "fio" && p.papel === "vilao");
  t("a pista do vilão que é bicho: o papel aceita só a fera, e nenhuma etapa pede que o herói o veja (o rosto é do rosto)",
    pegadas.mao.tipo === "pista" && pegadas.mao.papel === "vilao" && J(vilaoP.aceita) === J(["fera"]) && !!vilaoP.alcunha
    && !J([...pegadas.etapas, ...pegadas.reviravoltas.flatMap((r) => r.efeitos).filter((x) => x.tipo === "abre_etapa").map((x) => x.etapa)]).includes('"conheceu","papel:vilao"'));
  t("o tipo 2 do lote 5 toca o vilão pela ponte, e o pior de cada um avisa no veredito",
    QUESTS_LOTE_5.filter((q) => q.tipo === 2).every((q) => q.mao === null && q.ponte.length > 20 && Object.values(q.escolhas).some((e) => Object.values(e.opcoes).some((o) => /Sem a confiança inteira/.test(o.custa)))));
  t("os enredos do tipo 1 são da Grande Lista e nenhum se repete dentro do lote", t15.every((q) => Number.isInteger(q.enredo) && q.enredo >= 1 && q.enredo <= 34) && new Set(t15.map((q) => q.enredo)).size === t15.length);

  /* ---- O Pão Que Sai de Noite ---- */
  const PAO = "o_pao_que_sai_de_noite";
  const ouvirMae = (e) => falar(e, "Ludovina");
  const seguir = (e) => avista(ir(e, COVA5), "Javali Negro");
  const voltarAMae = (e) => falar(em(e, PRACA), "Ludovina");
  const a51 = g5(PAO, "lâmina poupando", [ouvirMae, seguir, (e) => lutar(e, { nome: "Javali Negro", rendido: true }), voltarAMae]);
  t("o Pão: ouvir quem conta os pães, seguir até ao bicho (visto, sem lhe falar), vencê-lo e poupá-lo, voltar — concluída",
    a51.R.estado === "concluida" && a51.R.feitas.decisao?.ramo === "lamina" && a51.R.feitas.decisao?.variante === "poupou", J(a51.R.feitas));
  const a52 = g5(PAO, "o apito na palha · afastar", [ouvirMae, seguir, (e) => segredo(e, COVA5), ["escolher", "pao", "afastar"], voltarAMae]);
  t("o Pão: o apito na palha (o bicho deixado à fome de propósito), e levar a criança para longe — o bicho vem procurá-la",
    a52.R.reviravoltas.some((r) => r.id === "o_apito_na_palha") && a52.R.feitas.decisao?.ramo === "afastar" && a52.R.estado === "concluida"
    && a52.R.consequencias.some((c) => c.efeitos.some((x) => x.tipo === "relogio_regional" && x.n === 1)), J(a52.R));
  const a53 = g5(PAO, "a promessa · isca", [ouvirMae, (e) => consulta(falar(e, "Tito"), "Tito"), seguir, ["escolher", "pao", "isca"], voltarAMae]);
  t("o Pão: a promessa da criança, e a rede — o bicho fica preso, e a criança viu",
    a53.R.reviravoltas.some((r) => r.id === "a_promessa_da_crianca") && a53.R.feitas.decisao?.ramo === "isca"
    && a53.R.consequencias.some((c) => c.efeitos.some((x) => x.tipo === "situacao" && x.papel === "fera" && x.situacao === "cativa")), J(a53.R));
  const a54 = g5(PAO, "lâmina matando", [ouvirMae, seguir, (e) => lutar(e, { nome: "Javali Negro" }), voltarAMae]);
  t("o Pão: o bicho morto, e a criança a acabar de lhe dar o pão", a54.R.feitas.decisao?.variante === "matou" && a54.R.estado === "concluida");
  const a55 = g5(PAO, "a falha", [ouvirMae, (e) => morre(e, "Tito")], { falha: 0 });
  t("o Pão: a criança morta antes da decisão — falhada (a corrente)", a55.R.motivo === "falha" && /corrente/.test(a55.R.fecho.texto));
  const a56 = g5(PAO, "o abandono", [(e) => dias(e, 4)]);
  t("o Pão: quatro dias — a porta arrombada por dentro", a56.R.motivo === "abandono");
  const aAl = g5(PAO, "a alcunha", [ouvirMae]).ver().etapaTexto;
  t("e o bicho, antes de visto, é «o que come da mão de uma criança»", !/Javali/.test(aAl) && /Seguir/.test(aAl), aAl);

  /* ---- A Barca a Meio do Rio ---- */
  const BAR = "a_barca_a_meio_do_rio";
  const noCais = (e) => falar(ir(e, CAIS5), "Zulmira");
  const acharBelmiro = (e) => falar(e, "Belmiro");
  const aTerra = (e) => falar(ir(e, CAIS5), "Zulmira");
  const b51 = g5(BAR, "lâmina poupando", [noCais, acharBelmiro, (e) => lutar(e, { nome: "Ascenso", rendido: true }), aTerra]);
  t("a Barca: o cais, quem eles querem, a nado até à barca e o servo poupado, a terra — concluída",
    b51.R.estado === "concluida" && b51.R.feitas.troca?.ramo === "lamina" && b51.R.feitas.troca?.variante === "poupou", J(b51.R.feitas));
  const b52 = g5(BAR, "os caixotes · entregar", [noCais, (e) => consulta(acharBelmiro(e), "Belmiro"), nada, ["escolher", "barca", "entregar"], aTerra]);
  t("a Barca: o que viu nos caixotes, e entregá-lo — os seis voltam, e quem eles queriam fica cativo",
    b52.R.reviravoltas.some((r) => r.id === "o_que_viu_nos_caixotes") && b52.R.feitas.troca?.ramo === "entregar"
    && b52.R.consequencias.some((c) => c.efeitos.some((x) => x.tipo === "situacao" && x.papel === "procurado" && x.situacao === "cativa")) && b52.R.estado === "concluida", J(b52.R));
  const b53 = g5(BAR, "os barcos acorrentados · trocar", [noCais, (e) => segredo(e, CAIS5), acharBelmiro, ["escolher", "barca", "trocar"], aTerra]);
  t("a Barca: os barcos acorrentados, e ires tu no lugar dele — dois dias rio abaixo, e ele fica a saber a tua cara",
    b53.R.reviravoltas.some((r) => r.id === "os_barcos_acorrentados") && b53.R.feitas.troca?.ramo === "trocar"
    && b53.R.consequencias.some((c) => c.efeitos.some((x) => x.tipo === "avisa_vilao")) && b53.R.consequencias.some((c) => c.efeitos.some((x) => x.tipo === "dia" && x.n === 2)), J(b53.R));
  const b54 = g5(BAR, "lâmina matando", [noCais, acharBelmiro, (e) => lutar(e, { nome: "Ascenso" }), aTerra]);
  t("a Barca: o servo levado pelo rio", b54.R.feitas.troca?.variante === "matou" && b54.R.estado === "concluida");
  const b55 = g5(BAR, "a falha", [noCais, (e) => morre(e, "Belmiro")], { falha: 0 });
  t("a Barca: quem eles queriam morto antes do meio-dia — falhada", b55.R.motivo === "falha" && /de bruços/.test(b55.R.fecho.texto));
  const b56 = g5(BAR, "o abandono", [(e) => dias(e, 2)]);
  t("a Barca: dois dias — a barca chega à outra margem com menos gente", b56.R.motivo === "abandono");

  /* ---- As Chaves da Guarda ---- */
  const CHA = "as_chaves_da_guarda";
  const ouvirCapitao = (e) => falar(e, "Valdemar");
  const c51 = g5(CHA, "a rua do mercado · lâmina poupando · expulsar", [ouvirCapitao, (e) => consulta(falar(e, "Isolina"), "Isolina"), (e) => lutar(e, { nome: "Crispim", rendido: true }), ["escolher", "guarda", "expulsar"]]);
  t("as Chaves: quem fugiu, quem ainda faz a ronda (a rua do mercado), o servo vencido no pátio, expulsar — concluída",
    c51.R.estado === "concluida" && c51.R.reviravoltas.some((r) => r.id === "a_rua_do_mercado") && c51.R.feitas.servo?.variante === "poupou" && c51.R.feitas.guarda?.ramo === "expulsar", J(c51.R));
  const c52 = g5(CHA, "a carroça · o livro do soldo · manter", [ouvirCapitao, (e) => consulta(e, "Valdemar"), nada, (e) => segredo(falar(e, "Isolina"), QUARTEL5), nada, ["escolher", "guarda", "manter"]]);
  t("as Chaves: o capitão foge de medo (a carroça carregada), o livro do soldo tira o servo sem luta, e manter os comprados",
    c52.R.reviravoltas.some((r) => r.id === "a_carroca_carregada") && c52.R.feitas.servo?.ramo === "livro" && c52.R.feitas.guarda?.ramo === "manter" && c52.R.estado === "concluida", J(c52.R));
  const c53 = g5(CHA, "lâmina matando · devolver", [ouvirCapitao, (e) => falar(falar(e, "Isolina"), "Crispim"), (e) => lutar(e, { nome: "Crispim" }), ["escolher", "guarda", "devolver"]]);
  t("as Chaves: o servo morto no pátio, e as chaves devolvidas com os nomes", c53.R.feitas.servo?.variante === "matou" && c53.R.feitas.guarda?.ramo === "devolver" && c53.R.estado === "concluida", J(c53.R.feitas));
  const c54 = g5(CHA, "a falha", [ouvirCapitao, (e) => morre(e, "Isolina")], { falha: 0 });
  t("as Chaves: quem fazia a ronda morto na rua do mercado — falhada", c54.R.motivo === "falha" && /lança/.test(c54.R.fecho.texto));
  const c55 = g5(CHA, "o abandono", [(e) => dias(e, 5)]);
  t("as Chaves: cinco dias — a guarda já recebe ordens de outro", c55.R.motivo === "abandono");

  /* ---- A Torre do Sino ---- */
  const TOR = "a_torre_do_sino";
  const ouvirSineira = (e) => falar(e, "Felismina");
  const oCerco = (e) => falar(ir(e, TORRE5), "Albano");
  const oSino = (e) => falar(ir(e, TORRE5), "Felismina");
  const t51 = g5(TOR, "lâmina poupando", [ouvirSineira, oCerco, (e) => lutar(e, { nome: "Gervásio", rendido: true }), oSino]);
  t("a Torre: quem tocava o sino, o cerco, o servo rendido no alto da escada, o sino outra vez — concluída",
    t51.R.estado === "concluida" && t51.R.feitas.assalto?.ramo === "lamina" && t51.R.feitas.assalto?.variante === "poupou", J(t51.R.feitas));
  const t52 = g5(TOR, "a corda · de noite", [ouvirSineira, (e) => consulta(e, "Felismina"), oCerco, ["escolher", "torre", "noite"], oSino]);
  t("a Torre: a corda cortada com cuidado, e subir de noite com os vizinhos — quem foi primeiro desce ferido",
    t52.R.reviravoltas.some((r) => r.id === "a_corda_cortada_com_cuidado") && t52.R.feitas.assalto?.ramo === "noite"
    && t52.R.consequencias.some((c) => c.efeitos.some((x) => x.tipo === "situacao" && x.papel === "voluntario" && x.situacao === "ferida")) && t52.R.estado === "concluida", J(t52.R));
  const t53 = g5(TOR, "os de dentro · a fome", [ouvirSineira, oCerco, (e) => segredo(e, TORRE5), ["escolher", "torre", "fome"], oSino]);
  t("a Torre: os rapazes do vale nas ameias, e o cerco até à fome — quatro dias sem sino",
    t53.R.reviravoltas.some((r) => r.id === "os_de_dentro") && t53.R.feitas.assalto?.ramo === "fome" && t53.R.consequencias.some((c) => c.efeitos.some((x) => x.tipo === "dia" && x.n === 4)), J(t53.R));
  const t54 = g5(TOR, "a saída", [ouvirSineira, oCerco, ["escolher", "torre", "saida"], oSino]);
  t("a Torre: deixá-los sair armados — a torre sem golpe, e o primeiro a vir não perdoa", t54.R.feitas.assalto?.ramo === "saida" && t54.R.estado === "concluida");
  const t55 = g5(TOR, "lâmina matando", [ouvirSineira, oCerco, (e) => lutar(e, { nome: "Gervásio" }), oSino]);
  t("a Torre: o servo cai pela escada", t55.R.feitas.assalto?.variante === "matou");
  const t56 = g5(TOR, "a falha", [ouvirSineira, (e) => morre(e, "Albano")], { falha: 0 });
  t("a Torre: quem foi primeiro morto na torre — falhada", t56.R.motivo === "falha" && /porta arrancada/.test(t56.R.fecho.texto));
  const t57 = g5(TOR, "o abandono", [(e) => dias(e, 4)]);
  t("a Torre: quatro dias — o sino toca para outros", t57.R.motivo === "abandono");

  /* ---- A Rua Que Não Acorda ---- */
  const RUA = "a_rua_que_nao_acorda";
  const ouvirVela = (e) => falar(e, "Etelvina");
  const r51 = g5(RUA, "o poço · crianças · lâmina poupando", [ouvirVela, (e) => consulta(segredo(ir(e, RUA5), RUA5), "Etelvina"), ["escolher", "despertar", "criancas"], (e) => lutar(e, { nome: "Mastim Pardo", rendido: true })]);
  t("a Rua: o poço da rua, as crianças primeiro, e o que entra nas casas (um bicho) vencido e poupado — concluída",
    r51.R.reviravoltas.some((r) => r.id === "o_poco_da_rua") && r51.R.feitas.despertar?.ramo === "criancas" && r51.R.feitas.noite?.variante === "poupou" && r51.R.estado === "concluida", J(r51.R));
  const r52 = g5(RUA, "a cama que cheiram · testemunhas · vigia", [ouvirVela, (e) => consulta(consulta(falar(e, "Silvano"), "Silvano"), "Etelvina"), nada, ["escolher", "despertar", "testemunhas"], (e) => avista(e, "Mastim Pardo")]);
  t("a Rua: o único acordado é quem procuram, as testemunhas primeiro, e ver do escuro o que entra — concluída",
    r52.R.reviravoltas.some((r) => r.id === "a_cama_que_cheiram") && r52.R.feitas.despertar?.ramo === "testemunhas" && r52.R.feitas.noite?.ramo === "vigia" && r52.R.estado === "concluida", J(r52.R));
  const r53 = g5(RUA, "esperar · lâmina matando", [ouvirVela, (e) => consulta(segredo(e, RUA5), "Etelvina"), ["escolher", "despertar", "esperar"], (e) => lutar(e, { nome: "Mastim Pardo" })]);
  t("a Rua: esperar no escuro mais uma noite (uma casa a menos), e o que entra morto entre as camas",
    r53.R.feitas.despertar?.ramo === "esperar" && r53.R.feitas.noite?.variante === "matou" && r53.R.consequencias.some((c) => c.efeitos.some((x) => x.tipo === "afeicao" && x.papel === "acordado" && x.n === -1)), J(r53.R));
  const r54 = g5(RUA, "a falha", [ouvirVela, (e) => morre(e, "Silvano")], { falha: 0 });
  t("a Rua: o único acordado morto no palheiro — falhada", r54.R.motivo === "falha" && /palheiro/.test(r54.R.fecho.texto));
  const r55 = g5(RUA, "o abandono", [(e) => dias(e, 4)]);
  t("a Rua: quatro dias — a rua acorda com uma casa a menos", r55.R.motivo === "abandono");

  /* ---- As Pegadas no Barro ---- */
  const PEG = "as_pegadas_no_barro";
  const ouvirGenoveva = (e) => falar(e, "Genoveva");
  const lerOChao = (e) => segredo(ir(e, BARRO5), BARRO5);
  const p51 = g5(PEG, "a corrente · o registo · seguir", [ouvirGenoveva, lerOChao, nada, (e) => segredo(e, REGISTO5), ["escolher", "rasto", "seguir"]]);
  t("as Pegadas: quem lê o chão, o barro lido (a corrente arrastada), o livro velho do registo, seguir até onde dorme — concluída",
    p51.R.reviravoltas.some((r) => r.id === "a_corrente_arrastada") && p51.R.feitas.origem?.ramo === "registo" && p51.R.feitas.rasto?.ramo === "seguir" && p51.R.estado === "concluida"
    && p51.R.consequencias.some((c) => c.efeitos.some((x) => x.tipo === "avisa_vilao")), J(p51.R));
  const p52 = g5(PEG, "o filho · pela caçadora · cortar", [ouvirGenoveva, (e) => consulta(consulta(e, "Genoveva"), "Genoveva"), lerOChao, nada, ["escolher", "rasto", "cortar"]]);
  t("as Pegadas: o filho que só devolveu a lança, a origem pela mão de quem lê, e o vale queimado",
    p52.R.reviravoltas.some((r) => r.id === "o_filho_da_cacadora") && p52.R.feitas.origem?.ramo === "cacadora" && p52.R.feitas.rasto?.ramo === "cortar" && p52.R.estado === "concluida", J(p52.R));
  const p53 = g5(PEG, "vender", [ouvirGenoveva, lerOChao, (e) => consulta(consulta(e, "Genoveva"), "Genoveva"), nada, ["escolher", "rasto", "vender"]]);
  t("as Pegadas: vender o que se sabe — quarenta moedas, e os caçadores que não leram",
    p53.R.feitas.rasto?.ramo === "vender" && p53.R.consequencias.some((c) => c.efeitos.some((x) => x.tipo === "moedas" && x.n === 40)), J(p53.R));
  const p54 = g5(PEG, "a falha", [ouvirGenoveva, (e) => morre(e, "Genoveva")], { falha: 0 });
  t("as Pegadas: quem lia o chão morta ao pé da cova — falhada", p54.R.motivo === "falha" && /lança do filho/.test(p54.R.fecho.texto));
  const p55 = g5(PEG, "o abandono", [(e) => dias(e, 5)]);
  t("as Pegadas: cinco dias — a vila foi atrás sem saber ler", p55.R.motivo === "abandono");
  const pAl = g5(PEG, "a alcunha", [ouvirGenoveva, lerOChao, nada]).ver();
  const pTxt = [pAl.etapaTexto, ...pAl.faltaTexto].join(" ");
  t("e o vilão que é bicho é sempre «o que deixa pegadas do tamanho de uma porta»: o nome nunca, porque nunca o viu", /pegadas do tamanho de uma porta/.test(pTxt) && !/Quimera/.test(pTxt), pTxt);

  /* ---- A Estalagem do Temporal ---- */
  const EST = "a_estalagem_do_temporal";
  const aPorta = (e) => falar(ir(e, EST5), "Brígida");
  const aManha = (e) => falar(em(e, PRACA), "Brígida");
  const s51 = g5(EST, "o melhor quarto · lâmina poupando", [aPorta, (e) => consulta(consulta(e, "Celina"), "Brígida"), (e) => lutar(e, { nome: "Anacleto", rendido: true }), aManha]);
  t("a Estalagem: a porta trancada, quem deu o caminho (o melhor quarto), o servo vencido à lareira e poupado — concluída",
    s51.R.reviravoltas.some((r) => r.id === "o_melhor_quarto") && s51.R.feitas.noite?.variante === "poupou" && s51.R.estado === "concluida", J(s51.R));
  const pistaDasMaos = (e) => segredo(consulta(e, "Celina"), EST5);
  const s52 = g5(EST, "as mãos embrulhadas · denunciar", [aPorta, pistaDasMaos, ["escolher", "noite", "denunciar"], aManha]);
  t("a Estalagem: as mãos queimadas do lado errado, e dizê-lo à sala inteira", s52.R.reviravoltas.some((r) => r.id === "as_maos_embrulhadas") && s52.R.feitas.noite?.ramo === "denunciar" && s52.R.estado === "concluida", J(s52.R));
  const s53 = g5(EST, "esperar", [aPorta, pistaDasMaos, ["escolher", "noite", "esperar"], aManha]);
  t("a Estalagem: calar até à justiça — quem pegou o fogo chega vivo e cativo", s53.R.feitas.noite?.ramo === "esperar" && s53.R.consequencias.some((c) => c.efeitos.some((x) => x.tipo === "situacao" && x.papel === "servo" && x.situacao === "cativa")));
  const s54 = g5(EST, "trocar", [aPorta, pistaDasMaos, ["escolher", "noite", "trocar"], aManha]);
  t("a Estalagem: o nome de quem pagou, a troco da porta aberta — e quem perdeu tudo passa a inimigo", s54.R.feitas.noite?.ramo === "trocar" && s54.R.consequencias.some((c) => c.efeitos.some((x) => x.tipo === "inimigo" && x.papel === "orfa")));
  const s55 = g5(EST, "lâmina matando", [aPorta, pistaDasMaos, (e) => lutar(e, { nome: "Anacleto" }), aManha]);
  t("a Estalagem: quem pegou o fogo morto junto à lareira", s55.R.feitas.noite?.variante === "matou");
  const s56 = g5(EST, "a falha", [aPorta, (e) => morre(e, "Celina")], { falha: 0 });
  t("a Estalagem: quem via as caras morta ao fundo da escada — falhada", s56.R.motivo === "falha" && /escada/.test(s56.R.fecho.texto));
  const s57 = g5(EST, "o abandono", [(e) => dias(e, 2)]);
  t("a Estalagem: dois dias — sai entre os que fugiam dele", s57.R.motivo === "abandono");

  /* ---- As Duas Fogueiras ---- */
  const FOG = "as_duas_fogueiras";
  const oAviso = (e) => falar(e, "Eusébio");
  const aCinza = (e) => falar(ir(e, HOSP5), "Eusébio");
  const f51 = g5(FOG, "o recado mandado · o trigo · a terceira porta", [oAviso, (e) => consulta(e, "Eusébio"), nada, (e) => segredo(e, CEL5), ["escolher", "fogo", "celeiro"], nada, aCinza]);
  t("as Fogueiras: o aviso era mandado, o trigo salvo, e a cela vazia enquanto a cidade corria — concluída",
    ["o_recado_mandado", "a_terceira_porta"].every((id) => f51.R.reviravoltas.some((r) => r.id === id)) && f51.R.feitas.noite?.ramo === "celeiro" && f51.R.estado === "concluida", J(f51.R));
  const f52 = g5(FOG, "o hospício", [oAviso, (e) => segredo(segredo(e, CEL5), HOSP5), ["escolher", "fogo", "hospicio"], nada, aCinza]);
  t("as Fogueiras: os trinta tirados do fumo, e o trigo do inverno em cinza", f52.R.feitas.noite?.ramo === "hospicio" && f52.R.estado === "concluida"
    && f52.R.consequencias.some((c) => c.de === "escolha:fogo:hospicio" && c.efeitos.some((x) => x.tipo === "relogio_regional" && x.n === 1)), J(f52.R));
  const f53 = g5(FOG, "lâmina poupando", [oAviso, (e) => segredo(falar(e, "Florêncio"), CEL5), (e) => lutar(e, { nome: "Florêncio", rendido: true }), aCinza]);
  t("as Fogueiras: quem as acende apanhado antes do anoitecer — nada arde, e a cela não se abre",
    f53.R.feitas.noite?.ramo === "lamina" && f53.R.feitas.noite?.variante === "poupou" && !f53.R.reviravoltas.some((r) => r.id === "a_terceira_porta") && f53.R.estado === "concluida", J(f53.R));
  const f54 = g5(FOG, "lâmina matando", [oAviso, (e) => segredo(falar(e, "Florêncio"), CEL5), (e) => lutar(e, { nome: "Florêncio" }), aCinza]);
  t("as Fogueiras: quem as acende morto, e a pederneira com ele", f54.R.feitas.noite?.variante === "matou");
  const f55 = g5(FOG, "a falha", [oAviso, (e) => morre(e, "Eusébio")], { falha: 0 });
  t("as Fogueiras: quem trouxe o aviso morto num beco — falhada", f55.R.motivo === "falha" && /cinza/.test(f55.R.fecho.texto));
  const f56 = g5(FOG, "o abandono", [(e) => dias(e, 2)]);
  t("as Fogueiras: dois dias — ardem as duas", f56.R.motivo === "abandono");

  /* ---- A Vigia Trocada ---- */
  const VIG = "a_vigia_trocada";
  const vigia5 = (vinculo, c1, c2, { antes = [], depois = [], baixa = null } = {}) => g5(VIG, `${c1} · ${c2} · ${vinculo}${baixa ? "→" + baixa : ""}`, [
    (e) => dias(e, 2), (e) => falar(falar(e, "Iago"), "Iago"), ...antes, ["escolher", "conselho", c1], ...(baixa ? [(e) => grupo(e, IAGO(baixa))] : []),
    (e) => falar(ir(e, POSTO5), "Sebastião"), ...depois, ["escolher", "vigia", c2]], { e0: mundo5([IAGO(vinculo)]) });
  const v51 = vigia5(80, "viver", "contar", { antes: [(e) => falar(e, "Iago")], depois: [(e) => consulta(falar(e, "Domingas"), "Domingas")] });
  t("a Vigia: a febre contada, a caixa de lata por gastar, viver e contar com confiança inteira — a vigia a dois (o melhor)",
    v51.R.desfecho === "a_vigia_a_dois" && v51.ver().ordem === 1 && ["a_febre", "a_caixa_de_lata"].every((id) => v51.R.reviravoltas.some((r) => r.id === id)), J(v51.R));
  t("a Vigia: contar sem confiança inteira — o aceno", vigia5(55, "pagar", "contar").R.desfecho === "o_aceno");
  t("a Vigia: velar de longe — o estranho que madrugou", vigia5(55, "viver", "calar").R.desfecho === "o_estranho_que_madrugou");
  t("a Vigia: trocar a vigia com confiança inteira — a vigia paga", vigia5(80, "pagar", "trocar").R.desfecho === "a_vigia_paga");
  const v55 = vigia5(80, "viver", "trocar", { baixa: 55 });
  t("a Vigia: trocar a vigia sem a confiança inteira — a mesma noite (o pior)", v55.R.desfecho === "a_mesma_noite" && v55.R.consequencias.some((c) => c.efeitos.some((x) => x.tipo === "morte" && x.papel === "quem")));
  t("e o veredito de trocar avisava, antes do clique, que ninguém vinha render", v55.vereditos.some((v) => v.chave === "vigia" && /render/.test(v.opcoes.find((o) => o.id === "trocar").custa)));
  t("a Vigia: a história ignorada acaba no padrão", g5(VIG, "as moedas (abandono)", [(e) => dias(e, 2), (e) => dias(e, 15)], { e0: mundo5([IAGO(55)]) }).R.desfecho === "as_moedas_sem_bilhete");
  t("a Vigia: o filho morto antes da vigia", g5(VIG, "sem jovem", [(e) => dias(e, 2), (e) => morre(e, "Sebastião")], { e0: mundo5([IAGO(55)]) }).R.desfecho === "sem_jovem");
  t("a Vigia: quem anda contigo morto pela estrada", g5(VIG, "a vigia sem dono", [(e) => grupo(morre(e, "Iago"))], { e0: mundo5([IAGO(55)]) }).R.desfecho === "a_vigia_sem_dono");
  const combosV5 = [];
  for (const v of [30, 55, 80]) for (const c1 of ["pagar", "viver"]) for (const c2 of ["contar", "calar", "trocar"]) {
    const r = vigia5(80, c1, c2, { baixa: v }).R;
    combosV5.push({ v, c1, c2, d: r.desfecho, estado: r.estado });
  }
  t("a Vigia: as 18 combinações acabam todas num desfecho", combosV5.every((x) => x.estado === "terminada"), J(combosV5.filter((x) => x.estado !== "terminada")));
  t("a Vigia: a morte só chega a quem trocou a vigia sem a confiança inteira", combosV5.filter((x) => x.d === "a_mesma_noite").every((x) => x.c2 === "trocar" && x.v < 80) && combosV5.some((x) => x.d === "a_mesma_noite"));

  /* ---- A Última Lição ---- */
  const LIC = "a_ultima_licao";
  const licao5 = (vinculo, c1, c2, { antes = [], depois = [], baixa = null } = {}) => g5(LIC, `${c1} · ${c2} · ${vinculo}${baixa ? "→" + baixa : ""}`, [
    (e) => dias(e, 2), (e) => falar(falar(e, "Iago"), "Iago"), ...antes, (e) => avista(ir(e, SALA5), "Teotónio"), ...depois,
    ["escolher", "conselho", c1], ...(baixa ? [(e) => grupo(e, IAGO(baixa))] : []), ["escolher", "prova", c2]], { e0: mundo5([IAGO(vinculo)]) });
  const l51 = licao5(80, "cobrar", "denunciar", { antes: [(e) => falar(e, "Iago")], depois: [(e) => segredo(e, SALA5)] });
  t("a Lição: o golpe por baixo da guarda, as cinco cruzes, cobrar e acusar com confiança inteira — a lâmina partida (o melhor)",
    l51.R.desfecho === "a_lamina_partida" && l51.ver().ordem === 1 && ["o_golpe_por_baixo", "as_cinco_cruzes"].every((id) => l51.R.reviravoltas.some((r) => r.id === id)), J(l51.R));
  t("a Lição: avisar o aprendiz — a guarda baixa", licao5(55, "perdoar", "avisar").R.desfecho === "a_guarda_baixa");
  t("a Lição: acusar sem as cruzes — a palavra contra o mestre", licao5(55, "perdoar", "denunciar").R.desfecho === "a_palavra_contra_o_mestre");
  t("a Lição: desafiar com confiança inteira — o desafio ganho", licao5(80, "perdoar", "desafiar").R.desfecho === "o_desafio_ganho");
  const l55 = licao5(80, "cobrar", "desafiar", { baixa: 55 });
  t("a Lição: desafiar sem a confiança inteira — o golpe guardado (o pior)", l55.R.desfecho === "o_golpe_guardado" && l55.R.consequencias.some((c) => c.efeitos.some((x) => x.tipo === "morte" && x.papel === "quem")));
  t("e o veredito de desafiar avisava, antes do clique, que ninguém gritava de que lado", l55.vereditos.some((v) => v.chave === "prova" && /de que lado vem/.test(v.opcoes.find((o) => o.id === "desafiar").custa)));
  t("a Lição: a história ignorada acaba no padrão", g5(LIC, "a cicatriz calada (abandono)", [(e) => dias(e, 2), (e) => dias(e, 15)], { e0: mundo5([IAGO(55)]) }).R.desfecho === "a_cicatriz_calada");
  t("a Lição: o mestre morto antes da prova", g5(LIC, "sem mestre", [(e) => dias(e, 2), (e) => morre(e, "Teotónio")], { e0: mundo5([IAGO(55)]) }).R.desfecho === "sem_mestre");
  t("a Lição: quem anda contigo morto pela estrada", g5(LIC, "a lição por dar", [(e) => grupo(morre(e, "Iago"))], { e0: mundo5([IAGO(55)]) }).R.desfecho === "a_licao_por_dar");
  const combosL5 = [];
  for (const v of [30, 55, 80]) for (const c1 of ["perdoar", "cobrar"]) for (const c2 of ["avisar", "denunciar", "desafiar"]) {
    const r = licao5(80, c1, c2, { baixa: v }).R;
    combosL5.push({ v, c1, c2, d: r.desfecho, estado: r.estado });
  }
  t("a Lição: as 18 combinações acabam todas num desfecho", combosL5.every((x) => x.estado === "terminada"), J(combosL5.filter((x) => x.estado !== "terminada")));
  t("a Lição: a morte só chega a quem desafiou o mestre sem a confiança inteira", combosL5.filter((x) => x.d === "o_golpe_guardado").every((x) => x.c2 === "desafiar" && x.v < 80) && combosL5.some((x) => x.d === "o_golpe_guardado"));

  /* ---- O Sangue do Carrasco ---- */
  const CAR = "o_sangue_do_carrasco";
  const car5 = (vinculo, c1, c2, { antes = [], depois = [], baixa = null } = {}) => g5(CAR, `${c1} · ${c2} · ${vinculo}${baixa ? "→" + baixa : ""}`, [
    (e) => dias(e, 2), (e) => falar(falar(e, "Iago"), "Iago"), ...antes, (e) => falar(ir(e, CAD5), "Bartolomeu"), ...depois,
    ["escolher", "nome", c1], ...(baixa ? [(e) => grupo(e, IAGO(baixa))] : []), ["escolher", "sangue", c2]], { e0: mundo5([IAGO(vinculo)]) });
  const k51 = car5(80, "largar", "assumir", { antes: [(e) => falar(e, "Iago")], depois: [(e) => consulta(e, "Bartolomeu"), (e) => falar(e, "Leopoldo")] });
  t("o Carrasco: a criança vendida, a carta da compra, largar o nome e assumir com confiança inteira — as mãos iguais (o melhor)",
    k51.R.desfecho === "as_maos_iguais" && k51.ver().ordem === 1 && ["a_crianca_vendida", "a_carta_da_compra"].every((id) => k51.R.reviravoltas.some((r) => r.id === id)), J(k51.R));
  t("o Carrasco: assumir sem confiança inteira — o nome devolvido", car5(55, "guardar", "assumir").R.desfecho === "o_nome_devolvido");
  t("o Carrasco: ceder a herança pelo silêncio — o silêncio comprado", car5(55, "guardar", "ceder").R.desfecho === "o_silencio_comprado");
  t("o Carrasco: reclamar com confiança inteira — sangue não é casa (o vinho provado a tempo)", car5(80, "guardar", "reclamar").R.desfecho === "sangue_nao_e_casa");
  const k55 = car5(80, "largar", "reclamar", { baixa: 55 });
  t("o Carrasco: reclamar sem a confiança inteira — o vinho da herança (o pior)", k55.R.desfecho === "o_vinho_da_heranca" && k55.R.consequencias.some((c) => c.efeitos.some((x) => x.tipo === "morte" && x.papel === "quem")));
  t("e o veredito de reclamar avisava, antes do clique, que ninguém provava o vinho", k55.vereditos.some((v) => v.chave === "sangue" && /provar o vinho/.test(v.opcoes.find((o) => o.id === "reclamar").custa)));
  t("o Carrasco: a história ignorada acaba no padrão", g5(CAR, "as luvas (abandono)", [(e) => dias(e, 2), (e) => dias(e, 15)], { e0: mundo5([IAGO(55)]) }).R.desfecho === "as_luvas_no_verao");
  t("o Carrasco: quem enforca morto antes da praça", g5(CAR, "sem carrasco", [(e) => dias(e, 2), (e) => morre(e, "Bartolomeu")], { e0: mundo5([IAGO(55)]) }).R.desfecho === "sem_carrasco");
  t("o Carrasco: quem anda contigo morto pela estrada", g5(CAR, "o segredo sem dono", [(e) => grupo(morre(e, "Iago"))], { e0: mundo5([IAGO(55)]) }).R.desfecho === "o_segredo_sem_dono");
  const combosK5 = [];
  for (const v of [30, 55, 80]) for (const c1 of ["guardar", "largar"]) for (const c2 of ["assumir", "ceder", "reclamar"]) {
    const r = car5(80, c1, c2, { baixa: v }).R;
    combosK5.push({ v, c1, c2, d: r.desfecho, estado: r.estado });
  }
  t("o Carrasco: as 18 combinações acabam todas num desfecho", combosK5.every((x) => x.estado === "terminada"), J(combosK5.filter((x) => x.estado !== "terminada")));
  t("o Carrasco: a morte só chega a quem reclamou a herança sem a confiança inteira", combosK5.filter((x) => x.d === "o_vinho_da_heranca").every((x) => x.c2 === "reclamar" && x.v < 80) && combosK5.some((x) => x.d === "o_vinho_da_heranca"));

  /* ---- Quarenta Invernos ---- */
  const QUA = "quarenta_invernos";
  const qua5 = (vinculo, c1, c2, { antes = [], depois = [], baixa = null } = {}) => g5(QUA, `${c1} · ${c2} · ${vinculo}${baixa ? "→" + baixa : ""}`, [
    (e) => dias(e, 2), (e) => falar(falar(e, "Iago"), "Iago"), ...antes, (e) => falar(ir(e, CADEIA5), "Cipriano", "Perpétua"), ...depois,
    ["escolher", "conselho", c1], ...(baixa ? [(e) => grupo(e, IAGO(baixa))] : []), ["escolher", "juizo", c2]], { e0: mundo5([IAGO(vinculo)]) });
  const q51 = qua5(80, "verdade", "eu", { depois: [(e) => segredo(e, CADEIA5), (e) => consulta(e, "Cipriano")] });
  t("os Quarenta Invernos: a acusação de véspera, a venda rasgada, a verdade e a cela trocada com confiança inteira — os três à mesa (o melhor)",
    q51.R.desfecho === "os_tres_a_mesa" && q51.ver().ordem === 1 && ["a_acusacao_de_vespera", "a_venda_rasgada"].every((id) => q51.R.reviravoltas.some((r) => r.id === id)), J(q51.R));
  t("os Quarenta Invernos: escolher o primeiro — a figueira", qua5(55, "salvar", "um").R.desfecho === "a_figueira");
  t("os Quarenta Invernos: escolher o segundo — o prato a mais", qua5(55, "verdade", "outro").R.desfecho === "o_prato_a_mais");
  t("os Quarenta Invernos: confessar no lugar dos dois, com confiança inteira e sem a prova — um inverno na cela", qua5(80, "salvar", "eu").R.desfecho === "um_inverno_na_cela");
  const q55 = qua5(80, "verdade", "eu", { baixa: 55 });
  t("os Quarenta Invernos: confessar no lugar dos dois sem a confiança inteira — as galés do rio (o pior)", q55.R.desfecho === "as_gales_do_rio" && q55.R.consequencias.some((c) => c.efeitos.some((x) => x.tipo === "morte" && x.papel === "quem")));
  t("e o veredito de confessar avisava, antes do clique, que ninguém procurava quem pagou", q55.vereditos.some((v) => v.chave === "juizo" && /procurar quem pagou/.test(v.opcoes.find((o) => o.id === "eu").custa)));
  t("os Quarenta Invernos: a história ignorada acaba no padrão", g5(QUA, "os dois na cela (abandono)", [(e) => dias(e, 2), (e) => dias(e, 15)], { e0: mundo5([IAGO(55)]) }).R.desfecho === "os_dois_na_cela");
  t("os Quarenta Invernos: um dos dois morto na cela", g5(QUA, "a casa grande demais", [(e) => dias(e, 2), (e) => morre(e, "Cipriano")], { e0: mundo5([IAGO(55)]) }).R.desfecho === "a_casa_grande_demais");
  t("os Quarenta Invernos: quem anda contigo morto pela estrada", g5(QUA, "a escolha sem quem", [(e) => grupo(morre(e, "Iago"))], { e0: mundo5([IAGO(55)]) }).R.desfecho === "a_escolha_sem_quem");
  const combosQ5 = [];
  for (const v of [30, 55, 80]) for (const c1 of ["verdade", "salvar"]) for (const c2 of ["um", "outro", "eu"]) {
    const r = qua5(80, c1, c2, { baixa: v }).R;
    combosQ5.push({ v, c1, c2, d: r.desfecho, estado: r.estado });
  }
  t("os Quarenta Invernos: as 18 combinações acabam todas num desfecho", combosQ5.every((x) => x.estado === "terminada"), J(combosQ5.filter((x) => x.estado !== "terminada")));
  t("os Quarenta Invernos: a morte só chega a quem confessou por eles sem a confiança inteira", combosQ5.filter((x) => x.d === "as_gales_do_rio").every((x) => x.c2 === "eu" && x.v < 80) && combosQ5.some((x) => x.d === "as_gales_do_rio"));

  /* ---- A COBERTURA, contada da ficha ---- */
  t("nenhum guião do lote 5 tentou uma escolha fechada", casos.filter((c) => LOTE5.includes(c.id)).every((c) => !c.erro), casos.filter((c) => LOTE5.includes(c.id) && c.erro).map((c) => `${c.id}/${c.nome}: ${c.erro}`).join("; "));
  for (const id of LOTE5) {
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
       também palavras da língua — «mae», «fera», «servo», «rua», «um»…) */
    const txt = meus.flatMap((c) => [c.j.ver().gancho, c.j.ver().etapaTexto, ...c.j.ver().faltaTexto, ...c.j.R.consequencias.map((x) => x.texto), c.j.R.fecho && c.j.R.fecho.texto,
      ...(c.j.vereditos || []).flatMap((v) => v.opcoes.flatMap((o) => [o.texto, o.ganha, o.custa]))]).filter(Boolean).join(" ");
    t(`${F.titulo}: o texto à vista não tem chavetas nem nomes de papel`, !/[{}]|papel:|lugar:|item:|undefined|\b(crianca|capitao|voluntario|cacadora|estalajadeira|orfa|hospicio|vilao|sineira)\b/.test(txt));
    t(`${F.titulo}: todo veredito diz os dois lados`, meus.every((c) => (c.j.vereditos || []).every((v) => v.opcoes.every((o) => o.ganha.length > 20 && o.custa.length > 20))));
  }
  const abertas = LOTE5.map((id) => abrirQuest(id, { estado: mundo5([IAGO(55)]), papeis: PAPEIS2[id] }));
  t("o lote 5 abre num mundo vazio, aberto e sem nenhuma etapa feita", abertas.every((r) => r && r.estado === "aberta" && Object.keys(r.feitas).length === 0));
  t("o Pão com quem conta os pães já ouvido não abre (a primeira etapa já está cumprida)", abrirQuest(PAO, { estado: falar(mundo5(), "Ludovina"), papeis: PAPEIS2[PAO] }) === null);
  t("a Barca com quem eles querem já morto não abre (a falha já aconteceu)", abrirQuest(BAR, { estado: morre(mundo5(), "Belmiro"), papeis: PAPEIS2[BAR] }) === null);
  const jn5 = jogo(RUA, PAPEIS2[RUA], mundo5(), { quests: [] });
  jn5.turno(ouvirVela).turno((e) => consulta(falar(e, "Silvano"), "Etelvina")).turno(nada);
  jn5.R = escolherNaQuest(questPorId(RUA), jn5.R, "despertar", "criancas", jn5.ctx());
  jn5.turno((e) => nomear(e, "Mastim Pardo"));
  t("nomear o que entra nas casas não é vê-lo entrar", jn5.R.feitas.despertar && !jn5.R.feitas.noite, J(jn5.R.feitas));
  /* o género: a mesma ficha diz «caído» de um e «caída» de uma */
  const caiu = (genero) => { const e = mundo5(); const e2 = { ...e, npcs: { ...e.npcs, Isolina: { ...e.npcs.Isolina, genero } } }; const j = jogo(CHA, PAPEIS2[CHA], e2, { quests: [] }); j.turno(ouvirCapitao).turno((x) => morre(x, "Isolina")); return j.R.fecho ? j.R.fecho.texto : ""; };
  t("o marcador de género: «caído» de um homem, «caída» de uma mulher", /caído na rua/.test(caiu("m")) && /caída na rua/.test(caiu("f")), caiu("m") + " | " + caiu("f"));
  const gq = () => { turno = 9000; return J(qua5(80, "verdade", "eu", { baixa: 55 }).R); };
  t("determinístico: o mesmo guião do lote 5 dá o mesmo registo", gq() === gq());
}

sec("§13 o acervo, lote 6 (BQ8) — cada quest por cada ramo, e a cobertura contada");
/* As treze quests do lote 6 (src/acervo/quests-lote-6.js), pela régua dos
   lotes 2 a 4: um guião por caminho, e a cobertura contada da ficha. Tudo
   o que é deste lote leva o sufixo 6 (o lote 5 escreve a sua secção ao
   mesmo tempo, no mesmo ficheiro). O mundo é o do lote 4 com a gente nova;
   o vilão de gente é o Quelvar, o bicho é a Quimera Rubra. */
const NOVOS6 = {
  Fulgêncio: N("Fulgêncio"), Celestina: N("Celestina"), Brízida: N("Brízida"), Tadeu: N("Tadeu"),
  Eulália: N("Eulália"), Romualdo: N("Romualdo"), "Lobo Pardo": N("Lobo Pardo"),
  Zacarias: N("Zacarias"), Ludovico: N("Ludovico"), Valdemar: N("Valdemar"),
  Graciete: N("Graciete"), Belmiro: N("Belmiro"), Anacleto: N("Anacleto"),
  Henriqueta: N("Henriqueta"), Florêncio: N("Florêncio"), Gervásio: N("Gervásio"),
  Clotilde: N("Clotilde"), Rosinda: N("Rosinda"), Feliciano: N("Feliciano"),
  Aníbal: N("Aníbal"), Filomena: N("Filomena"), Saturnino: N("Saturnino"),
  Genoveva: N("Genoveva"), Hermínia: N("Hermínia"), Leopoldo: N("Leopoldo"),
  Leocádio: N("Leocádio", FOZ), Ezequiel: N("Ezequiel", FOZ),
  Albertina: N("Albertina", FOZ), Cipriano: N("Cipriano", FOZ),
  Venâncio: N("Venâncio", FOZ), Quitéria: N("Quitéria", FOZ),
  Silvério: N("Silvério", FOZ), Policarpo: N("Policarpo", FOZ), Benjamim: N("Benjamim", FOZ),
};
const mundo6 = (membros = []) => ({ ...mundo4(membros), npcs: { ...mundo4(membros).npcs, ...NOVOS6 } });
const RODA6 = { nome: "Taberna da Roda", cidade: CIDADE }, MONTE6 = { nome: "Estalagem do Monte", cidade: CIDADE };
const MURALHA6 = { nome: "Muralha Velha", cidade: CIDADE }, CAMPO6 = { nome: "Campo das Forcas", cidade: CIDADE };
const DOCA6 = { nome: "Doca Funda", cidade: CIDADE }, QUEIMADO6 = { nome: "Mercado Queimado", cidade: CIDADE };
const QUARTEL6 = { nome: "Quartel da Porta", cidade: CIDADE }, ARSENAL6 = { nome: "Arsenal Velho", cidade: CIDADE };
const TEMPLO6 = { nome: "Templo da Praça", cidade: CIDADE }, ARQUIVO6 = { nome: "Arquivo do Conselho", cidade: CIDADE };
const HOSPICIO6 = { nome: "Hospício das Irmãs", cidade: CIDADE };
const ARENA6 = { nome: "Arena da Foz", cidade: FOZ }, QUINTA6 = { nome: "Quinta do Ribeiro", cidade: FOZ };
const FORJA6 = { nome: "Forja do Largo", cidade: FOZ }, ALDEIA6 = { nome: "Largo da Aldeia", cidade: FOZ };
Object.assign(PAPEIS2, {
  os_dados_dele: { vilao: { nome: "Quelvar" }, taberna: RODA6, perdedor: { nome: "Fulgêncio" }, aposta: { nome: "Celestina" } },
  a_mesma_tempestade: { vilao: { nome: "Quelvar" }, abrigo: MONTE6, estalajadeira: { nome: "Brízida" }, menino: { nome: "Tadeu" } },
  a_nona_noite: { vilao: { nome: "Quimera Rubra" }, muralha: MURALHA6, campo: CAMPO6, ronda: { nome: "Lobo Pardo" }, oferenda: { nome: "Eulália" }, alcaide: { nome: "Romualdo" } },
  o_ultimo_barco: { vilao: { nome: "Quelvar" }, cais: DOCA6, capanga: { nome: "Zacarias" }, timoneiro: { nome: "Ludovico" }, levado: { nome: "Valdemar" } },
  o_teu_nome_na_parede: { queimada: QUEIMADO6, sobrevivente: { nome: "Graciete" }, meirinho: { nome: "Belmiro" }, servo: { nome: "Anacleto" }, capa: { nome: "a capa com as tuas cores" } },
  o_posto_do_capitao_morto: { quartel: QUARTEL6, viuva: { nome: "Henriqueta" }, recruta: { nome: "Florêncio" }, servo: { nome: "Gervásio" } },
  as_armas_do_poco: { arsenal: ARSENAL6, ferreira: { nome: "Clotilde" }, vizinha: { nome: "Rosinda" }, servo: { nome: "Feliciano" }, armas: { nome: "as armas do arsenal velho" } },
  o_recado_verdadeiro: { mensageiro: { nome: "Aníbal" }, alvo: TEMPLO6, outro: ARQUIVO6, guardia: { nome: "Filomena" }, servo: { nome: "Saturnino" } },
  o_que_a_ama_esqueceu: { ama: { nome: "Genoveva" }, asilo: HOSPICIO6, neta: { nome: "Hermínia" }, servo: { nome: "Leopoldo" }, cha: { nome: "o chá de papoila" } },
  a_cabeca_que_nao_se_baixa: { quem: { nome: "Iago" }, rival: { nome: "Leocádio" }, mestre: { nome: "Ezequiel" }, arena: ARENA6 },
  o_que_o_tio_deixou: { quem: { nome: "Iago" }, caseira: { nome: "Albertina" }, primo: { nome: "Cipriano" }, herdade: QUINTA6, testamento: { nome: "o testamento selado" } },
  o_juramento_a_cabeceira: { quem: { nome: "Iago" }, alvo: { nome: "Venâncio" }, neta: { nome: "Quitéria" }, casa: FORJA6 },
  o_morto_que_voltou_a_casa: { quem: { nome: "Iago" }, esposo: { nome: "Silvério" }, novo: { nome: "Policarpo" }, filho: { nome: "Benjamim" }, aldeia: ALDEIA6 },
});
const LOTE6 = QUESTS_LOTE_6.map((q) => q.id);
const g6 = (id, nome, passos, o = {}) => guiao(id, nome, passos, { e0: mundo6(), ...o });
{
  const ids = BIBLIOTECA_DE_QUESTS.map((q) => q.id);
  const i6 = ids.indexOf(LOTE6[0]);
  t("o lote 6 está no catálogo inteiro, pela ordem do seu ficheiro, depois do lote 4: nove do tipo 1 e quatro do tipo 2",
    i6 > ids.indexOf(QUESTS_LOTE_4[QUESTS_LOTE_4.length - 1].id) && J(ids.slice(i6, i6 + LOTE6.length)) === J(LOTE6)
    && QUESTS_LOTE_6.filter((q) => q.tipo === 1).length === 9 && QUESTS_LOTE_6.filter((q) => q.tipo === 2).length === 4);
  const t1 = QUESTS_LOTE_6.filter((q) => q.tipo === 1);
  const vilaoDe = (q) => Object.values(q.papeis).find((p) => p.de === "fio" && p.papel === "vilao") || null;
  const ops = (q) => Object.values(q.escolhas).flatMap((e) => Object.keys(e.opcoes));
  t("o lote 6 é do meio e do fim, e nenhuma do tipo 1 é do cedo", t1.every((q) => q.quando.every((w) => ["meio", "fim"].includes(w))) && ["meio", "fim"].every((w) => t1.some((q) => q.quando.includes(w))));
  t("dois rostos e dois confrontos; um confronto só de fera, um rosto de mesa só de gente com «aceitar», e um rosto que serve as duas naturezas",
    t1.filter((q) => q.mao.tipo === "rosto").length === 2 && t1.filter((q) => q.mao.tipo === "confronto").length === 2
    && t1.some((q) => q.mao.tipo === "confronto" && J(vilaoDe(q).aceita) === J(["fera"]))
    && t1.some((q) => q.mao.tipo === "rosto" && J(vilaoDe(q).aceita) === J(["gente"]) && ops(q).includes("aceitar"))
    && t1.some((q) => q.mao.tipo === "rosto" && J(vilaoDe(q).aceita) === J(["gente", "fera"])));
  t("os dois confrontos têm as sentenças que DESFECHOS_DO_VILAO lê (cumprir, poupar, acabar, selar) e a fraqueza nas três famílias",
    t1.filter((q) => q.mao.tipo === "confronto").every((q) => ["cumprir", "poupar", "acabar", "selar"].every((o) => ops(q).includes(o))
      && ["pessoa", "coisa", "verdade"].every((f) => Object.values(q.papeis).some((p) => p.fraqueza === f))));
  t("o passo 4 é contestado por uma do meio que contesta também o 3, e por um rosto que é também pista",
    t1.some((q) => q.quando.includes("meio") && [3, 4].every((p) => q.mao.contra.includes(p)))
    && t1.some((q) => q.mao.tipo === "rosto" && q.mao.contra.includes(4) && (q.mao.tambem || []).includes("pista")));
  t("uma pista do lote traz os papéis da fraqueza (o esqueleto entrega-a por ela)", t1.some((q) => q.mao.tipo === "pista" && Object.values(q.papeis).some((p) => p.fraqueza)));
}

/* ---- Os Dados Dele ---- */
const DAD6 = "os_dados_dele";
const ouvirFulgencio = (e) => falar(e, "Fulgêncio");
const aMesa6 = (e) => falar(ir(e, RODA6), "Quelvar");
const deManha6 = (e) => falar(em(e, PRACA), "Fulgêncio");
const d61 = g6(DAD6, "aceitar", [ouvirFulgencio, aMesa6, ["escolher", "partida", "aceitar"], deManha6]);
t("os Dados: quem perdeu tudo, a mesa, aceitar a aposta dele, a manhã — concluída, e o vilão aliado (o pacto que o confronto cobra)",
  d61.R.estado === "concluida" && d61.R.feitas.partida.ramo === "aceitar" && d61.R.consequencias.some((c) => c.de === "escolha:partida:aceitar" && c.efeitos.some((x) => x.tipo === "aliado" && x.papel === "vilao")), J(d61.R.feitas));
const d62 = g6(DAD6, "o que foi a jogo · jogar · o que disse a mesa", [ouvirFulgencio, (e) => consulta(e, "Fulgêncio"), aMesa6]);
t("os Dados: o que foi a jogo — a partida espera que quem foi posto em jogo o saiba", d62.R.reviravoltas.some((r) => r.id === "o_que_foi_a_jogo") && d62.ver().etapa === "partida" && d62.ver().escolhas.length === 0, J(d62.ver()));
d62.turno((e) => falar(e, "Celestina"));
d62.vereditos = [vereditoDaEscolha(d62.F, d62.R, "partida", d62.ctx())];
d62.escolher("partida", "jogar").turno(deManha6);
t("e com quem foi a jogo avisado, jogar a sério deixa-o falar do que vem a seguir (a camada da pista)",
  d62.R.feitas.partida.ramo === "jogar" && d62.R.reviravoltas.some((r) => r.id === "o_que_disse_a_mesa") && d62.R.estado === "concluida", J(d62.R.reviravoltas));
const d63 = g6(DAD6, "os dados viciados · virar", [ouvirFulgencio, aMesa6, (e) => segredo(e, RODA6), ["escolher", "partida", "virar"], deManha6]);
t("os Dados: os dados viciados, e virar a mesa — o relógio dele anda", d63.R.reviravoltas.some((r) => r.id === "os_dados_viciados") && d63.R.feitas.partida.ramo === "virar"
  && d63.R.consequencias.some((c) => c.efeitos.some((x) => x.tipo === "relogio_do_fio" && x.n === 1)) && d63.R.estado === "concluida");
const d6a = g6(DAD6, "a alcunha", [ouvirFulgencio]).ver().etapaTexto;
t("e antes de se sentar à mesa, o vilão é «quem ganha todas as noites», nunca o nome", /ganha todas as noites/.test(d6a) && !/Quelvar/.test(d6a), d6a);
const d64 = g6(DAD6, "a falha", [ouvirFulgencio, (e) => morre(e, "Fulgêncio")], { falha: 0 });
t("os Dados: quem perdeu tudo morre antes da partida — falhada", d64.R.motivo === "falha" && /rio/.test(d64.R.fecho.texto));
const d65 = g6(DAD6, "o abandono", [(e) => dias(e, 3)]);
t("os Dados: três dias — vêm buscar quem foi a jogo", d65.R.motivo === "abandono" && d65.R.consequencias.some((c) => c.efeitos.some((x) => x.situacao === "cativa")));

/* ---- A Mesma Tempestade ---- */
const TEM6 = "a_mesma_tempestade";
const aoLume6 = (nome) => (e) => avista(ir(e, MONTE6), nome);
const passou6 = (e) => falar(falar(em(e, PRACA), "Brízida"), "Brízida");
const e61 = g6(TEM6, "guardar", [aoLume6("Quelvar"), ["escolher", "noite", "guardar"], passou6]);
t("a Tempestade: o abrigo, o lume partilhado (visto, sem lhe falar), guardar a trégua, a manhã — concluída", e61.R.estado === "concluida" && e61.R.feitas.noite.ramo === "guardar", J(e61.R.feitas));
const e62 = g6(TEM6, "a lei do telhado · vigiar · o que ronda", [(e) => ir(e, MONTE6), (e) => consulta(e, "Brízida"), (e) => avista(e, "Quelvar"), ["escolher", "noite", "vigiar"], passou6]);
t("a Tempestade: a lei velha do abrigo, vigiar a noite inteira, e o que ronda lá fora (até ele se esconde de alguma coisa)",
  ["a_lei_do_telhado", "o_que_ronda_la_fora"].every((id) => e62.R.reviravoltas.some((r) => r.id === id)) && e62.R.feitas.noite.ramo === "vigiar" && e62.R.estado === "concluida", J(e62.R.reviravoltas));
const e63 = g6(TEM6, "fera · a ferida aberta · sair", [aoLume6("Quimera Rubra"), (e) => segredo(e, MONTE6), ["escolher", "noite", "sair"], passou6], { papeis: { vilao: { nome: "Quimera Rubra" } } });
t("a Tempestade com uma fera: a ferida aberta à luz do lume, e sair para a chuva com a criança — o mesmo texto serve as duas naturezas",
  e63.R.reviravoltas.some((r) => r.id === "a_ferida_aberta") && e63.R.feitas.noite.ramo === "sair" && e63.R.estado === "concluida", J(e63.R));
const e64 = g6(TEM6, "a falha", [(e) => ir(e, MONTE6), (e) => morre(e, "Tadeu")], { falha: 0 });
t("a Tempestade: a febre leva a criança antes da noite — falhada", e64.R.motivo === "falha" && /febre/.test(e64.R.fecho.texto));
const e65 = g6(TEM6, "o abandono", [(e) => dias(e, 3)]);
t("a Tempestade: três dias — a tempestade passa sem ti", e65.R.motivo === "abandono");

/* ---- A Nona Noite ---- */
const NON6 = "a_nona_noite";
const asPortas6 = (e) => ir(e, MURALHA6);
const aOferenda6 = (e) => falar(e, "Eulália");
const n61 = g6(NON6, "luta poupando · luta poupando · poupar", [asPortas6, aOferenda6, (e) => lutar(e, { nome: "Lobo Pardo", rendido: true }), (e) => lutar(e, { nome: "Quimera Rubra", rendido: true }), ["escolher", "sentenca", "poupar"]]);
t("a Nona Noite: as portas, quem ia para fora, a ronda poupada, a fera de cabeça no chão, poupar — concluída",
  n61.R.estado === "concluida" && n61.R.feitas.ronda.variante === "poupou" && n61.R.feitas.frente.variante === "poupou" && n61.R.feitas.sentenca.ramo === "poupar", J(n61.R.feitas));
const n62 = g6(NON6, "a cria na adega · a poterna · matar", [asPortas6, aOferenda6, (e) => consulta(e, "Eulália"), (e) => segredo(consulta(e, "Romualdo"), MURALHA6), (e) => lutar(e, { nome: "Quimera Rubra" })]);
t("a Nona Noite: a cria na adega (o cerco é de uma jaula), a poterna velha, e a fera morta — concluída ali, sem sentença",
  n62.R.reviravoltas.some((r) => r.id === "a_cria_na_adega") && n62.R.feitas.ronda.ramo === "poterna" && n62.R.feitas.frente.variante === "matou" && n62.R.estado === "concluida" && !n62.R.feitas.sentenca, J(n62.R));
const n63 = g6(NON6, "a sorte viciada · a prova: uma pessoa · acabar", [(e) => juntar(asPortas6(e), { nome: "Teodora", vinculo: 30 }), (e) => consulta(e, "Romualdo"), aOferenda6, (e) => lutar(e, { nome: "Lobo Pardo" }), ["escolher", "prova", "expor"], ["escolher", "sentenca", "acabar"]], { papeis: { fraqueza_quem: { nome: "Teodora" } } });
t("a Nona Noite: a sorte viciada, a voz a que obedece ao lado abre a prova, expor deita-a sem luta; acabar",
  ["a_prova_na_mao", "a_sorte_viciada"].every((id) => n63.R.reviravoltas.some((r) => r.id === id)) && n63.R.feitas.frente.ramo === "prova" && n63.R.feitas.frente.variante === "pessoa" && n63.R.feitas.sentenca.ramo === "acabar" && n63.R.estado === "concluida", J(n63.R));
const n64 = g6(NON6, "a coisa guardada · selar", [(e) => levar(asPortas6(e), "O guizo de ferro"), aOferenda6, (e) => lutar(e, { nome: "Lobo Pardo" }), ["escolher", "prova", "guardar"], (e) => lutar(e, { nome: "Quimera Rubra", rendido: true }), ["escolher", "sentenca", "selar"]], { papeis: { fraqueza_coisa: { nome: "o guizo de ferro" } } });
t("a Nona Noite: guardar a coisa obriga à luta no campo, e selar fecha a garganta da serra", n64.R.feitas.prova.ramo === "guardar" && n64.R.feitas.frente.ramo === "luta" && n64.R.feitas.sentenca.ramo === "selar" && n64.R.estado === "concluida", J(n64.R.feitas));
const n65 = g6(NON6, "a verdade · expor · poupar", [(e) => segredo(asPortas6(e), ALFANDEGA), aOferenda6, (e) => lutar(e, { nome: "Lobo Pardo" }), ["escolher", "prova", "expor"], ["escolher", "sentenca", "poupar"]], { papeis: { fraqueza_verdade: ALFANDEGA } });
t("a Nona Noite: a verdade descoberta também abre a prova", n65.R.feitas.frente.ramo === "prova" && n65.R.feitas.frente.variante === null && n65.R.estado === "concluida", J(n65.R.feitas));
const aliada6 = ficha(mundo6(), "Quimera Rubra", { relacao: "aliado" });
const n66 = g6(NON6, "o tributo cumprido", [asPortas6, aOferenda6, ["escolher", "tributo", "cumprir"]], { e0: aliada6 });
t("a Nona Noite: a quem lhe deu o que veio buscar, o gado de todos os invernos — cumprir fecha a quest (o pacto)",
  n66.R.reviravoltas.some((r) => r.id === "o_tributo") && n66.R.feitas.tributo.ramo === "cumprir" && n66.R.estado === "concluida" && n66.R.escolhas.tributo.opcao === "cumprir", J(n66.R));
const n67 = g6(NON6, "o tributo rompido", [asPortas6, aOferenda6, ["escolher", "tributo", "romper"], (e) => lutar(e, { nome: "Lobo Pardo" }), (e) => lutar(e, { nome: "Quimera Rubra" })], { e0: aliada6 });
t("a Nona Noite: romper o tributo fere quem estava encostado à porta, e a saída continua até ao fim",
  n67.R.feitas.tributo.ramo === "romper" && n67.R.consequencias.some((c) => c.efeitos.some((x) => x.situacao === "ferida" && x.papel === "oferenda")) && n67.R.estado === "concluida");
const n68 = g6(NON6, "quem ia para fora morre", [asPortas6, (e) => morre(e, "Eulália")], { falha: 0 });
t("a Nona Noite: a porta pequena abriu-se antes de lá chegares — falhada", n68.R.motivo === "falha" && /porta pequena/.test(n68.R.fecho.texto));
const n69 = g6(NON6, "outra mão primeiro", [asPortas6, aOferenda6, (e) => lutar(e, { nome: "Lobo Pardo" }), (e) => morre(e, "Quimera Rubra")], { falha: 1 });
t("a Nona Noite: a fera morta por outra mão — falhada (a cria chora, e a serra ouve)", n69.R.motivo === "falha" && /cria/.test(n69.R.fecho.texto));
const n60 = g6(NON6, "o abandono", [(e) => dias(e, 6)]);
t("a Nona Noite: seis dias — a vila abre a porta pequena", n60.R.motivo === "abandono");

/* ---- O Último Barco ---- */
const BAR6 = "o_ultimo_barco";
const aDoca6 = (e) => ir(e, DOCA6);
const comValdemar6 = (e) => juntar(e, { nome: "Valdemar", vinculo: 30 });
const b61 = g6(BAR6, "luta poupando · luta poupando · poupar", [aDoca6, (e) => lutar(e, { nome: "Zacarias", rendido: true }), comValdemar6, (e) => lutar(e, { nome: "Quelvar", rendido: true }), ["escolher", "sentenca", "poupar"]]);
t("o Último Barco: o cais, o portaló, o porão, o vilão de joelhos, o bote — concluída",
  b61.R.estado === "concluida" && b61.R.feitas.bordo.variante === "poupou" && b61.R.feitas.frente.variante === "poupou" && b61.R.feitas.sentenca.ramo === "poupar", J(b61.R.feitas));
const b62 = g6(BAR6, "o porão cheio · a amarra · matar", [aDoca6, (e) => consulta(e, "Ludovico"), (e) => segredo(e, DOCA6), comValdemar6, (e) => lutar(e, { nome: "Quelvar" })]);
t("o Último Barco: o porão cheio de gente da terra, a amarra de popa, e o vilão morto no convés — concluída ali",
  b62.R.reviravoltas.some((r) => r.id === "o_porao_cheio") && b62.R.feitas.bordo.ramo === "amarra" && b62.R.feitas.frente.variante === "matou" && b62.R.estado === "concluida" && !b62.R.feitas.sentenca, J(b62.R));
const b63 = g6(BAR6, "a prova: uma pessoa · acabar", [(e) => juntar(aDoca6(e), { nome: "Teodora", vinculo: 30 }), (e) => lutar(e, { nome: "Zacarias" }), comValdemar6, ["escolher", "prova", "expor"], ["escolher", "sentenca", "acabar"]], { papeis: { fraqueza_quem: { nome: "Teodora" } } });
t("o Último Barco: a voz que ainda ouve, no convés, e acabar", b63.R.feitas.frente.ramo === "prova" && b63.R.feitas.frente.variante === "pessoa" && b63.R.feitas.sentenca.ramo === "acabar" && b63.R.estado === "concluida", J(b63.R.feitas));
const b64 = g6(BAR6, "a coisa guardada · selar", [(e) => levar(aDoca6(e), "O sinete de ferro"), (e) => lutar(e, { nome: "Zacarias" }), comValdemar6, ["escolher", "prova", "guardar"], (e) => lutar(e, { nome: "Quelvar", rendido: true }), ["escolher", "sentenca", "selar"]], { papeis: { fraqueza_coisa: { nome: "o sinete de ferro" } } });
t("o Último Barco: guardar a coisa obriga à luta, e selar afunda o barco", b64.R.feitas.prova.ramo === "guardar" && b64.R.feitas.sentenca.ramo === "selar" && b64.R.estado === "concluida", J(b64.R.feitas));
const b65 = g6(BAR6, "a verdade · expor · poupar", [(e) => segredo(aDoca6(e), ALFANDEGA), (e) => lutar(e, { nome: "Zacarias" }), comValdemar6, ["escolher", "prova", "expor"], ["escolher", "sentenca", "poupar"]], { papeis: { fraqueza_verdade: ALFANDEGA } });
t("o Último Barco: a verdade dita no convés também o verga", b65.R.feitas.frente.ramo === "prova" && b65.R.feitas.frente.variante === null && b65.R.estado === "concluida");
const socio6 = ficha(mundo6(), "Quelvar", { relacao: "aliado" });
const b66 = g6(BAR6, "o frete cumprido", [aDoca6, ["escolher", "frete", "cumprir"]], { e0: socio6 });
t("o Último Barco: ao sócio, o barco sai e a gente desce no primeiro porto — cumprir fecha a quest (o pacto)",
  b66.R.reviravoltas.some((r) => r.id === "o_frete") && b66.R.feitas.frete.ramo === "cumprir" && b66.R.estado === "concluida", J(b66.R));
const b67 = g6(BAR6, "o frete rasgado", [aDoca6, ["escolher", "frete", "romper"], (e) => lutar(e, { nome: "Zacarias" }), comValdemar6, (e) => lutar(e, { nome: "Quelvar" })], { e0: socio6 });
t("o Último Barco: rasgar o negócio fere quem vai no porão, e a abordagem continua", b67.R.feitas.frete.ramo === "romper" && b67.R.consequencias.some((c) => c.efeitos.some((x) => x.situacao === "ferida" && x.papel === "levado")) && b67.R.estado === "concluida");
const b68 = g6(BAR6, "quem vai no porão morre", [aDoca6, (e) => morre(e, "Valdemar")], { falha: 0 });
t("o Último Barco: as correntes abertas e vazias — falhada", b68.R.motivo === "falha" && /correntes/.test(b68.R.fecho.texto));
const b69 = g6(BAR6, "outra mão primeiro", [aDoca6, (e) => lutar(e, { nome: "Zacarias" }), comValdemar6, (e) => morre(e, "Quelvar")], { falha: 1 });
t("o Último Barco: o vilão morto por outra mão — falhada (o barco sai sem dono)", b69.R.motivo === "falha" && /sem dono/.test(b69.R.fecho.texto));
const b60 = g6(BAR6, "o abandono", [(e) => dias(e, 2)]);
t("o Último Barco: dois dias — a maré vira sem ti", b60.R.motivo === "abandono" && b60.R.consequencias.some((c) => c.efeitos.some((x) => x.situacao === "cativa")));

/* ---- O Teu Nome na Parede ---- */
const NOM6 = "o_teu_nome_na_parede";
const ouvirGraciete = (e) => falar(e, "Graciete");
const u61 = g6(NOM6, "as tuas cores · a capa · limpar", [ouvirGraciete, (e) => segredo(ir(e, QUEIMADO6), QUEIMADO6), (e) => levar(e, "A capa com as tuas cores"), ["escolher", "nome", "limpar"]]);
t("o Teu Nome: a testemunha, a cinza (as tuas cores num pano que não vestiste), a capa copiada, limpar o nome — concluída, e quem mentiu vai presa",
  u61.R.estado === "concluida" && u61.R.reviravoltas.some((r) => r.id === "as_tuas_cores") && u61.R.feitas.outro.ramo === "capa" && u61.R.feitas.nome.ramo === "limpar"
  && u61.R.consequencias.some((c) => c.efeitos.some((x) => x.situacao === "cativa" && x.papel === "sobrevivente")), J(u61.R));
const u62 = g6(NOM6, "o preço da testemunha · lâmina poupando · carregar", [ouvirGraciete, (e) => consulta(e, "Graciete"), (e) => consulta(ir(e, QUEIMADO6), "Belmiro"), (e) => lutar(e, { nome: "Anacleto", rendido: true }), ["escolher", "nome", "carregar"]]);
t("o Teu Nome: a testemunha paga, quem usou a tua cara vencido e poupado, e carregar o nome para a salvar",
  u62.R.reviravoltas.some((r) => r.id === "o_preco_da_testemunha") && u62.R.feitas.outro.variante === "poupou" && u62.R.feitas.nome.ramo === "carregar" && u62.R.estado === "concluida", J(u62.R));
const u63 = g6(NOM6, "lâmina matando · comprar", [ouvirGraciete, (e) => consulta(ir(e, QUEIMADO6), "Belmiro"), (e) => lutar(e, { nome: "Anacleto" }), ["escolher", "nome", "comprar"]]);
t("o Teu Nome: comprar o meirinho por cinquenta moedas, e o veredito diz o preço antes do clique",
  u63.R.feitas.nome.ramo === "comprar" && u63.vereditos.some((v) => v.chave === "nome" && v.opcoes.find((o) => o.id === "comprar").custo === 50) && u63.R.estado === "concluida");
const u64 = g6(NOM6, "a falha", [ouvirGraciete, (e) => morre(e, "Graciete")], { falha: 0 });
t("o Teu Nome: a testemunha no poço antes da decisão — falhada", u64.R.motivo === "falha" && /poço/.test(u64.R.fecho.texto));
const u65 = g6(NOM6, "o abandono", [(e) => dias(e, 4)]);
t("o Teu Nome: quatro dias — a tua cara em três cidades", u65.R.motivo === "abandono");

/* ---- O Posto do Capitão Morto ---- */
const POS6 = "o_posto_do_capitao_morto";
const asChaves6 = (e) => falar(ir(e, QUARTEL6), "Henriqueta");
const aNoite6 = (e) => falar(e, "Florêncio");
const p61 = g6(POS6, "lâmina poupando", [asChaves6, (e) => falar(segredo(e, QUARTEL6), "Florêncio"), (e) => lutar(e, { nome: "Gervásio", rendido: true }), aNoite6]);
t("o Posto: as chaves, quem manda de facto, o sargento vencido e poupado, a noite à porta — concluída",
  p61.R.estado === "concluida" && p61.R.feitas.sargento.ramo === "lamina" && p61.R.feitas.sargento.variante === "poupou", J(p61.R.feitas));
const p62 = g6(POS6, "a queda · o que o recruta viu · virar · a lista", [asChaves6, (e) => consulta(e, "Henriqueta"), (e) => falar(e, "Florêncio"), (e) => consulta(e, "Florêncio"), ["escolher", "sargento", "virar"], aNoite6]);
t("o Posto: a queda que não foi do vento, o que o mais novo viu da torre, virar o sargento (e a lista da guarda comprada)",
  ["a_queda_do_capitao", "o_que_o_recruta_viu", "a_lista_da_guarda"].every((id) => p62.R.reviravoltas.some((r) => r.id === id)) && p62.R.feitas.sargento.ramo === "virar" && p62.R.estado === "concluida", J(p62.R.reviravoltas));
const p63 = g6(POS6, "expor", [asChaves6, (e) => falar(segredo(e, QUARTEL6), "Florêncio"), ["escolher", "sargento", "expor"], aNoite6]);
t("o Posto: acusar o sargento na formatura avisa quem manda nele", p63.R.feitas.sargento.ramo === "expor" && p63.R.consequencias.some((c) => c.de === "escolha:sargento:expor" && c.efeitos.some((x) => x.tipo === "avisa_vilao")) && p63.R.estado === "concluida");
const p64 = g6(POS6, "a falha", [asChaves6, (e) => morre(e, "Florêncio")], { falha: 0 });
t("o Posto: o mais novo ao pé da muralha antes da noite — falhada", p64.R.motivo === "falha" && /muralha/.test(p64.R.fecho.texto));
const p65 = g6(POS6, "o abandono", [(e) => dias(e, 4)]);
t("o Posto: quatro dias — a porta abre-se por dentro", p65.R.motivo === "abandono");

/* ---- As Armas do Poço ---- */
const ARM6 = "as_armas_do_poco";
const ouvirClotilde = (e) => falar(e, "Clotilde");
const a61 = g6(ARM6, "lâmina poupando · armar", [ouvirClotilde, (e) => ir(e, ARSENAL6), (e) => lutar(e, { nome: "Feliciano", rendido: true }), ["escolher", "armas", "armar"]]);
t("as Armas: as chaves, o arsenal, as carroças paradas à lâmina, armar a rua — concluída", a61.R.estado === "concluida" && a61.R.feitas.carrocas.variante === "poupou" && a61.R.feitas.destino.ramo === "armar", J(a61.R.feitas));
const a62 = g6(ARM6, "a última guerra · as marcas de giz · a rua · o poço", [ouvirClotilde, (e) => consulta(e, "Clotilde"), (e) => segredo(ir(e, ARSENAL6), ARSENAL6), (e) => falar(falar(e, "Rosinda"), "Rosinda"), ["escolher", "armas", "poco"]]);
t("as Armas: a rua que já se matou com elas, as marcas de quem tem chave, a rua à porta sem armas, e o poço",
  ["a_ultima_guerra", "as_marcas_de_giz"].every((id) => a62.R.reviravoltas.some((r) => r.id === id)) && a62.R.feitas.carrocas.ramo === "rua" && a62.R.feitas.destino.ramo === "poco" && a62.R.estado === "concluida", J(a62.R));
const a63 = g6(ARM6, "lâmina matando · vender", [ouvirClotilde, (e) => ir(e, ARSENAL6), (e) => lutar(e, { nome: "Feliciano" }), ["escolher", "armas", "vender"]]);
t("as Armas: vender ao mercador dá oitenta moedas (e não custa nada à bolsa)", a63.R.feitas.destino.ramo === "vender" && a63.R.consequencias.some((c) => c.efeitos.some((x) => x.tipo === "moedas" && x.n === 80))
  && a63.vereditos.some((v) => v.chave === "armas" && v.opcoes.find((o) => o.id === "vender").custo === 0));
const a64 = g6(ARM6, "a falha", [ouvirClotilde, (e) => morre(e, "Clotilde")], { falha: 0 });
t("as Armas: quem guardava as chaves morto antes da decisão — falhada", a64.R.motivo === "falha" && /chaves/.test(a64.R.fecho.texto));
const a65 = g6(ARM6, "o abandono", [(e) => dias(e, 3)]);
t("as Armas: três dias — as carroças levam tudo", a65.R.motivo === "abandono");

/* ---- O Recado Verdadeiro ---- */
const REC6 = "o_recado_verdadeiro";
const ouvirAnibal = (e) => falar(e, "Aníbal");
const r61 = g6(REC6, "o recado decorado · o que guarda o outro · ficar · lâmina poupando", [ouvirAnibal, (e) => consulta(e, "Aníbal"), (e) => falar(e, "Filomena"), ["escolher", "noite", "alvo"], (e) => lutar(e, { nome: "Saturnino", rendido: true })]);
t("o Recado: decorado palavra por palavra, o que guarda o sítio de que ninguém fala, ficar onde o recado manda, e quem o mandou vencido",
  ["o_recado_decorado", "o_que_guarda_outro"].every((id) => r61.R.reviravoltas.some((r) => r.id === id)) && r61.R.feitas.noite.ramo === "alvo" && r61.R.feitas.golpe.variante === "poupou" && r61.R.estado === "concluida", J(r61.R));
const r62 = g6(REC6, "ir para o outro · a cara na noite · o rasto", [ouvirAnibal, (e) => falar(segredo(e, TEMPLO6), "Filomena"), ["escolher", "noite", "outro"], (e) => segredo(ir(e, ARQUIVO6), ARQUIVO6)]);
t("o Recado: ir contra todos para o outro sítio mostra a cara de quem manda o recado, e o rasto fecha",
  r62.R.reviravoltas.some((r) => r.id === "a_cara_na_noite") && r62.R.feitas.noite.ramo === "outro" && r62.R.feitas.golpe.ramo === "rasto" && r62.R.estado === "concluida", J(r62.R));
const r63 = g6(REC6, "dividir · lâmina matando", [ouvirAnibal, (e) => falar(consulta(e, "Aníbal"), "Filomena"), ["escolher", "noite", "dividir"], (e) => lutar(e, { nome: "Saturnino" })]);
t("o Recado: dividir a gente avisa quem o mandou", r63.R.feitas.noite.ramo === "dividir" && r63.R.consequencias.some((c) => c.de === "escolha:noite:dividir" && c.efeitos.some((x) => x.tipo === "avisa_vilao")) && r63.R.estado === "concluida");
const r64 = g6(REC6, "a falha", [ouvirAnibal, (e) => morre(e, "Filomena")], { falha: 0 });
t("o Recado: quem guardava o outro sítio morta antes da noite — falhada", r64.R.motivo === "falha" && /enganou no sítio/.test(r64.R.fecho.texto));
const r65 = g6(REC6, "o abandono", [(e) => dias(e, 3)]);
t("o Recado: três noites — guardou-se a porta errada", r65.R.motivo === "abandono");

/* ---- O Que a Ama Esqueceu ---- */
const AMA6 = "o_que_a_ama_esqueceu";
const ouvirHerminia = (e) => falar(e, "Hermínia");
const m61 = g6(AMA6, "a canção · o chá na mão · a porta · devolver · a coisa", [ouvirHerminia, (e) => consulta(e, "Hermínia"), (e) => levar(e, "O chá de papoila"), (e) => falar(ir(e, HOSPICIO6), "Hermínia"), ["escolher", "memoria", "devolver"], (e) => levar(e, "O guizo de prata")], { papeis: { fraqueza_coisa: { nome: "o guizo de prata" } } });
t("a Ama: a canção com o nome, o chá na mão, a porta fechada por quem cuida, devolver a memória — e a coisa da fraqueza, achada (concluída)",
  m61.R.reviravoltas.some((r) => r.id === "a_cancao") && m61.R.feitas.cabeceira.ramo === "porta" && m61.R.feitas.memoria.ramo === "devolver" && m61.R.feitas.achar.ramo === "coisa" && m61.R.estado === "concluida", J(m61.R));
const m62 = g6(AMA6, "a dose · lâmina poupando · dormir · a verdade", [ouvirHerminia, (e) => segredo(ir(e, HOSPICIO6), HOSPICIO6), (e) => lutar(e, { nome: "Leopoldo", rendido: true }), ["escolher", "memoria", "dormir"], (e) => segredo(e, ALFANDEGA)], { papeis: { fraqueza_verdade: ALFANDEGA } });
t("a Ama: a dose que cresce todas as noites, quem a traz vencido, deixá-la dormir — e o sítio da fraqueza, descoberto",
  m62.R.reviravoltas.some((r) => r.id === "a_dose") && m62.R.feitas.cabeceira.ramo === "lamina" && m62.R.feitas.memoria.ramo === "dormir" && m62.R.feitas.achar.ramo === "verdade" && m62.R.estado === "concluida", J(m62.R));
const m63 = g6(AMA6, "lâmina matando · perguntar · a palavra", [ouvirHerminia, (e) => levar(e, "O chá de papoila"), (e) => lutar(e, { nome: "Leopoldo" }), ["escolher", "memoria", "perguntar"], (e) => falar(falar(e, "Genoveva"), "Genoveva")]);
t("a Ama: perguntar-lhe no meio do sono custa a neta; sem coisa nem sítio, fecha pela palavra dela",
  m63.R.feitas.memoria.ramo === "perguntar" && m63.R.feitas.achar.ramo === "palavra" && m63.R.consequencias.some((c) => c.efeitos.some((x) => x.tipo === "afeicao" && x.papel === "neta" && x.n === -2)) && m63.R.estado === "concluida", J(m63.R));
const m64 = g6(AMA6, "a falha", [ouvirHerminia, (e) => morre(e, "Genoveva")], { falha: 0 });
t("a Ama: não acordou — falhada", m64.R.motivo === "falha" && /chávena/.test(m64.R.fecho.texto));
const m65 = g6(AMA6, "o abandono", [(e) => dias(e, 4)]);
t("a Ama: quatro dias — o chá continua a chegar", m65.R.motivo === "abandono");

/* ---- A Cabeça Que Não Se Baixa ---- */
const CAB6 = "a_cabeca_que_nao_se_baixa";
const cabeca6 = (vinculo, c1, c2, { antes = [], depois = [], baixa = null } = {}) => g6(CAB6, `${c1} · ${c2} · ${vinculo}${baixa ? "→" + baixa : ""}`, [
  (e) => dias(e, 2), (e) => falar(falar(e, "Iago"), "Iago"), ...antes, (e) => falar(ir(e, ARENA6), "Leocádio"), ...depois,
  ["escolher", "conselho", c1], ...(baixa ? [(e) => grupo(e, IAGO(baixa))] : []), ["escolher", "areia", c2]], { e0: mundo6([IAGO(vinculo)]) });
const c61 = cabeca6(80, "paz", "ceder", { antes: [(e) => falar(e, "Iago")], depois: [(e) => consulta(e, "Ezequiel"), (e) => segredo(e, ARENA6)] });
t("a Cabeça: o cartaz contado, a tarde de verão (perdeu limpo e cuspiu), a aposta da casa, e ceder com confiança inteira — a mão dada (o melhor)",
  c61.R.desfecho === "a_mao_dada" && c61.ver().ordem === 1 && ["o_cartaz", "a_tarde_de_verao", "a_aposta_da_casa"].every((id) => c61.R.reviravoltas.some((r) => r.id === id)), J(c61.R));
const c62 = cabeca6(80, "honra", "ate_ao_fim");
t("a Cabeça: lutar até ao fim com confiança inteira — o chão da arena (baixa a lâmina a tempo)", c62.R.desfecho === "o_chao_da_arena");
const c63 = cabeca6(55, "honra", "ceder");
t("a Cabeça: ceder sem confiança inteira — a vénia engolida", c63.R.desfecho === "a_venia_engolida");
const c64 = cabeca6(80, "paz", "trocar");
t("a Cabeça: entrar tu na areia — o lugar tomado", c64.R.desfecho === "o_lugar_tomado");
const c65 = cabeca6(80, "honra", "ate_ao_fim", { baixa: 55 });
t("a Cabeça: lutar até ao fim sem a confiança inteira — a ferida velha (o pior)", c65.R.desfecho === "a_ferida_velha" && c65.R.consequencias.some((c) => c.efeitos.some((x) => x.tipo === "morte" && x.papel === "quem")));
t("e o veredito de lutar até ao fim avisava, antes do clique, que ninguém o faria ceder", c65.vereditos.some((v) => v.chave === "areia" && /baixar a lâmina quando a ferida abrir/.test(v.opcoes.find((o) => o.id === "ate_ao_fim").custa)));
const c66 = g6(CAB6, "o cartaz dobrado (abandono)", [(e) => dias(e, 2), (e) => dias(e, 15)], { e0: mundo6([IAGO(55)]) });
t("a Cabeça: a história ignorada acaba no padrão", c66.R.desfecho === "o_cartaz_dobrado" && c66.R.motivo === "abandono");
const c67 = g6(CAB6, "sem rival", [(e) => dias(e, 2), (e) => morre(e, "Leocádio")], { e0: mundo6([IAGO(55)]) });
t("a Cabeça: quem lhe ficou com o lugar morto antes da revanche", c67.R.desfecho === "sem_rival");
const c68 = g6(CAB6, "o orgulho sem dono", [(e) => grupo(morre(e, "Iago"))], { e0: mundo6([IAGO(55)]) });
t("a Cabeça: quem anda contigo morto pela estrada", c68.R.desfecho === "o_orgulho_sem_dono");
const combosC6 = [];
for (const v of [30, 55, 80]) for (const c1 of ["honra", "paz"]) for (const c2 of ["ceder", "ate_ao_fim", "trocar"]) {
  const r = cabeca6(80, c1, c2, { baixa: v }).R;
  combosC6.push({ v, c1, c2, d: r.desfecho, estado: r.estado });
}
t("a Cabeça: as 18 combinações acabam todas num desfecho", combosC6.every((x) => x.estado === "terminada"), J(combosC6.filter((x) => x.estado !== "terminada")));
t("a Cabeça: a morte só chega a quem deixou lutar até ao fim sem a confiança inteira", combosC6.filter((x) => x.d === "a_ferida_velha").every((x) => x.c2 === "ate_ao_fim" && x.v < 80) && combosC6.some((x) => x.d === "a_ferida_velha"));

/* ---- O Que o Tio Deixou ---- */
const TIO6 = "o_que_o_tio_deixou";
const tio6 = (vinculo, c1, c2, { antes = [], depois = [], baixa = null } = {}) => g6(TIO6, `${c1} · ${c2} · ${vinculo}${baixa ? "→" + baixa : ""}`, [
  (e) => dias(e, 2), (e) => falar(falar(e, "Iago"), "Iago"), ...antes, (e) => falar(ir(e, QUINTA6), "Albertina"), ...depois,
  ["escolher", "conselho", c1], ...(baixa ? [(e) => grupo(e, IAGO(baixa))] : []), ["escolher", "assinar", c2]], { e0: mundo6([IAGO(vinculo)]) });
const falarAoPrimo6 = (e) => falar(e, "Cipriano");
const o61 = tio6(80, "devolver", "devolver", { antes: [(e) => falar(e, "Iago")], depois: [(e) => consulta(e, "Albertina"), (e) => avista(e, "Cipriano")] });
t("o Tio: a segunda folha, as flores na campa, o brinde, e devolver com confiança inteira — a terra devolvida (o melhor)",
  o61.R.desfecho === "a_terra_devolvida" && o61.ver().ordem === 1 && ["a_segunda_folha", "as_flores_na_campa", "o_brinde"].every((id) => o61.R.reviravoltas.some((r) => r.id === id)), J(o61.R));
const o62 = tio6(55, "guardar", "ficar", { depois: [falarAoPrimo6] });
t("o Tio: ficar, depois de falar com o primo — o dono justo", o62.R.desfecho === "o_dono_justo");
const o63 = tio6(55, "guardar", "vender");
t("o Tio: vender — a terra vendida (e quem lá trabalhava na rua)", o63.R.desfecho === "a_terra_vendida");
const o64 = tio6(55, "devolver", "devolver");
t("o Tio: devolver sem confiança inteira — a devolução amarga", o64.R.desfecho === "a_devolucao_amarga");
const o65 = tio6(80, "guardar", "ficar");
t("o Tio: ficar sem nunca ter falado com o primo — o vinho do brinde (o pior)", o65.R.desfecho === "o_vinho_do_brinde" && o65.R.consequencias.some((c) => c.efeitos.some((x) => x.tipo === "morte" && x.papel === "quem")));
t("e o veredito de ficar avisava, antes do clique, quem servia o vinho", o65.vereditos.some((v) => v.chave === "assinar" && /vinho do brinde/.test(v.opcoes.find((o) => o.id === "ficar").custa)));
const o66 = g6(TIO6, "o testamento selado (abandono)", [(e) => dias(e, 2), (e) => dias(e, 15)], { e0: mundo6([IAGO(55)]) });
t("o Tio: a história ignorada acaba no padrão", o66.R.desfecho === "o_testamento_selado");
const o67 = g6(TIO6, "sem caseira", [(e) => dias(e, 2), (e) => morre(e, "Albertina")], { e0: mundo6([IAGO(55)]) });
t("o Tio: quem trabalhava a terra morta antes da assinatura", o67.R.desfecho === "sem_caseira");
const o68 = g6(TIO6, "a herança sem herdeiro", [(e) => grupo(morre(e, "Iago"))], { e0: mundo6([IAGO(55)]) });
t("o Tio: quem anda contigo morto pela estrada", o68.R.desfecho === "a_heranca_sem_herdeiro");
const combosO6 = [];
for (const v of [30, 55, 80]) for (const c1 of ["guardar", "devolver"]) for (const c2 of ["ficar", "devolver", "vender"]) for (const primo of [false, true]) {
  const r = tio6(80, c1, c2, { baixa: v, depois: primo ? [falarAoPrimo6] : [] }).R;
  combosO6.push({ v, c1, c2, primo, d: r.desfecho, estado: r.estado });
}
t("o Tio: as 36 combinações acabam todas num desfecho", combosO6.every((x) => x.estado === "terminada"), J(combosO6.filter((x) => x.estado !== "terminada")));
t("o Tio: a morte só chega a quem ficou sem nunca falar com o primo", combosO6.filter((x) => x.d === "o_vinho_do_brinde").every((x) => x.c2 === "ficar" && !x.primo) && combosO6.some((x) => x.d === "o_vinho_do_brinde"));

/* ---- O Juramento à Cabeceira ---- */
const JUR6 = "o_juramento_a_cabeceira";
const jur6 = (vinculo, c1, c2, { antes = [], depois = [], baixa = null } = {}) => g6(JUR6, `${c1} · ${c2} · ${vinculo}${baixa ? "→" + baixa : ""}`, [
  (e) => dias(e, 2), (e) => falar(falar(e, "Iago"), "Iago"), ...antes, (e) => avista(ir(e, FORJA6), "Venâncio"), ...depois,
  ["escolher", "juramento", c1], ...(baixa ? [(e) => grupo(e, IAGO(baixa))] : []), ["escolher", "noite", c2]], { e0: mundo6([IAGO(vinculo)]) });
const perguntarAoVelho6 = (e) => consulta(e, "Venâncio");
const j61 = jur6(80, "quebrar", "perguntar", { antes: [(e) => falar(e, "Iago")], depois: [perguntarAoVelho6, (e) => avista(e, "Quitéria")] });
t("o Juramento: a frase de todas as noites, o que o pai vendia, a criança que guia, e perguntar com confiança inteira — o nome de quem comprava (o melhor)",
  j61.R.desfecho === "o_nome_de_quem_comprava" && j61.ver().ordem === 1 && ["a_frase", "o_que_o_pai_vendia", "a_crianca_que_guia"].every((id) => j61.R.reviravoltas.some((r) => r.id === id)), J(j61.R));
const j62 = jur6(55, "cumprir", "deixar");
t("o Juramento: deixar cumprir — o juramento cumprido", j62.R.desfecho === "o_juramento_cumprido");
const j63 = jur6(80, "cumprir", "perguntar");
t("o Juramento: perguntar sem antes saber o que o pai fazia — a resposta sem paz", j63.R.desfecho === "a_resposta_sem_paz");
const j64 = jur6(80, "quebrar", "avisar");
t("o Juramento: avisar com confiança inteira — a casa vazia", j64.R.desfecho === "a_casa_vazia");
const j65 = jur6(80, "quebrar", "avisar", { baixa: 55 });
t("o Juramento: avisar pelas costas sem a confiança inteira — a casa avisada (o pior)", j65.R.desfecho === "a_casa_avisada" && j65.R.consequencias.some((c) => c.efeitos.some((x) => x.tipo === "morte" && x.papel === "quem")));
t("e o veredito de avisar dizia, antes do clique, que a casa avisada esperava armada", j65.vereditos.some((v) => v.chave === "noite" && /espere armado/.test(v.opcoes.find((o) => o.id === "avisar").custa)));
const j66 = g6(JUR6, "a frase (abandono)", [(e) => dias(e, 2), (e) => dias(e, 15)], { e0: mundo6([IAGO(55)]) });
t("o Juramento: a história ignorada acaba no padrão", j66.R.desfecho === "a_frase_de_todas_as_noites");
const j67 = g6(JUR6, "sem alvo", [(e) => dias(e, 2), (e) => morre(e, "Venâncio")], { e0: mundo6([IAGO(55)]) });
t("o Juramento: o nome da frase morreu antes", j67.R.desfecho === "sem_alvo");
const j68 = g6(JUR6, "o juramento sem dono", [(e) => grupo(morre(e, "Iago"))], { e0: mundo6([IAGO(55)]) });
t("o Juramento: quem anda contigo morto pela estrada", j68.R.desfecho === "o_juramento_sem_dono");
const combosJ6 = [];
for (const v of [30, 55, 80]) for (const c1 of ["cumprir", "quebrar"]) for (const c2 of ["deixar", "perguntar", "avisar"]) for (const pergunta of [false, true]) {
  const r = jur6(80, c1, c2, { baixa: v, depois: pergunta ? [perguntarAoVelho6] : [] }).R;
  combosJ6.push({ v, c1, c2, pergunta, d: r.desfecho, estado: r.estado });
}
t("o Juramento: as 36 combinações acabam todas num desfecho", combosJ6.every((x) => x.estado === "terminada"), J(combosJ6.filter((x) => x.estado !== "terminada")));
t("o Juramento: a morte só chega a quem avisou pelas costas sem a confiança inteira", combosJ6.filter((x) => x.d === "a_casa_avisada").every((x) => x.c2 === "avisar" && x.v < 80) && combosJ6.some((x) => x.d === "a_casa_avisada"));

/* ---- O Morto Que Voltou a Casa ---- */
const MOR6 = "o_morto_que_voltou_a_casa";
const mor6 = (vinculo, c1, c2, { antes = [], depois = [], baixa = null } = {}) => g6(MOR6, `${c1} · ${c2} · ${vinculo}${baixa ? "→" + baixa : ""}`, [
  (e) => dias(e, 2), (e) => falar(falar(e, "Iago"), "Iago"), ...antes, (e) => avista(ir(e, ALDEIA6), "Silvério"), ...depois,
  ["escolher", "regresso", c1], ...(baixa ? [(e) => grupo(e, IAGO(baixa))] : []), ["escolher", "casa", c2]], { e0: mundo6([IAGO(vinculo)]) });
const falarAoNovo6 = (e) => falar(e, "Policarpo");
const k61 = mor6(80, "voltar", "mostrar", { antes: [(e) => falar(e, "Iago")], depois: [(e) => avista(e, "Policarpo"), (e) => consulta(e, "Silvério"), falarAoNovo6] });
t("o Morto: as galés, a outra pessoa, a pedra limpa todos os meses, e mostrar-se com confiança inteira — os dois lugares (o melhor)",
  k61.R.desfecho === "os_dois_lugares" && k61.ver().ordem === 1 && ["as_gales", "a_outra_pessoa", "a_pedra_limpa"].every((id) => k61.R.reviravoltas.some((r) => r.id === id)), J(k61.R));
const k62 = mor6(55, "voltar", "mostrar");
t("o Morto: mostrar-se sem falar a quem lhe ocupa o lugar — a pedra partida", k62.R.desfecho === "a_pedra_partida");
const k63 = mor6(80, "voltar", "reclamar");
t("o Morto: reclamar a casa com confiança inteira — o lugar reclamado", k63.R.desfecho === "o_lugar_reclamado");
const k64 = mor6(55, "ficar_morto", "partir");
t("o Morto: partir sem que ninguém saiba — morto por vontade", k64.R.desfecho === "morto_por_vontade");
const k65 = mor6(80, "voltar", "reclamar", { baixa: 55 });
t("o Morto: reclamar sem a confiança inteira — a noite na aldeia (o pior)", k65.R.desfecho === "a_noite_na_aldeia" && k65.R.consequencias.some((c) => c.efeitos.some((x) => x.tipo === "morte" && x.papel === "quem")));
t("e o veredito de reclamar avisava, antes do clique, que iria de noite e sozinho", k65.vereditos.some((v) => v.chave === "casa" && /vai de noite, sozinho/.test(v.opcoes.find((o) => o.id === "reclamar").custa)));
const k66 = g6(MOR6, "a estrada ao lado (abandono)", [(e) => dias(e, 2), (e) => dias(e, 15)], { e0: mundo6([IAGO(55)]) });
t("o Morto: a história ignorada acaba no padrão", k66.R.desfecho === "a_estrada_ao_lado");
const k67 = g6(MOR6, "sem esposo", [(e) => dias(e, 2), (e) => morre(e, "Silvério")], { e0: mundo6([IAGO(55)]) });
t("o Morto: quem o chorou morreu antes de saber", k67.R.desfecho === "sem_esposo");
const k68 = g6(MOR6, "morto duas vezes", [(e) => grupo(morre(e, "Iago"))], { e0: mundo6([IAGO(55)]) });
t("o Morto: quem anda contigo morto pela estrada, desta vez de verdade", k68.R.desfecho === "morto_duas_vezes");
const combosK6 = [];
for (const v of [30, 55, 80]) for (const c1 of ["voltar", "ficar_morto"]) for (const c2 of ["reclamar", "mostrar", "partir"]) for (const fala of [false, true]) {
  const r = mor6(80, c1, c2, { baixa: v, depois: fala ? [falarAoNovo6] : [] }).R;
  combosK6.push({ v, c1, c2, fala, d: r.desfecho, estado: r.estado });
}
t("o Morto: as 36 combinações acabam todas num desfecho", combosK6.every((x) => x.estado === "terminada"), J(combosK6.filter((x) => x.estado !== "terminada")));
t("o Morto: a morte só chega a quem reclamou a casa sem a confiança inteira", combosK6.filter((x) => x.d === "a_noite_na_aldeia").every((x) => x.c2 === "reclamar" && x.v < 80) && combosK6.some((x) => x.d === "a_noite_na_aldeia"));

/* ---- A COBERTURA do lote 6, contada da ficha ---- */
t("nenhum guião do lote 6 tentou uma escolha fechada", casos.filter((c) => LOTE6.includes(c.id)).every((c) => !c.erro), casos.filter((c) => LOTE6.includes(c.id) && c.erro).map((c) => `${c.id}/${c.nome}: ${c.erro}`).join("; "));
for (const id of LOTE6) {
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
     também palavras da língua) */
  const txt = meus.flatMap((c) => [c.j.ver().gancho, c.j.ver().etapaTexto, ...c.j.ver().faltaTexto, ...c.j.R.consequencias.map((x) => x.texto), c.j.R.fecho && c.j.R.fecho.texto,
    ...(c.j.vereditos || []).flatMap((v) => v.opcoes.flatMap((o) => [o.texto, o.ganha, o.custa]))]).filter(Boolean).join(" ");
  t(`${F.titulo}: o texto à vista não tem chavetas nem nomes de papel`, !/[{}]|papel:|lugar:|item:|undefined|\b(guardia|viuva|ate_ao_fim|ficar_morto|fraqueza_\w+)\b/.test(txt));
  t(`${F.titulo}: todo veredito diz os dois lados`, meus.every((c) => (c.j.vereditos || []).every((v) => v.opcoes.every((o) => o.ganha.length > 20 && o.custa.length > 20))));
}
{
  const abertas = LOTE6.map((id) => abrirQuest(id, { estado: mundo6([IAGO(55)]), papeis: PAPEIS2[id] }));
  t("o lote 6 abre num mundo vazio, aberto e sem nenhuma etapa feita", abertas.every((r) => r && r.estado === "aberta" && Object.keys(r.feitas).length === 0));
  t("os Dados com quem perdeu tudo já ouvido não abrem (a primeira etapa já está cumprida)", abrirQuest(DAD6, { estado: ouvirFulgencio(mundo6()), papeis: PAPEIS2[DAD6] }) === null);
  t("a Nona Noite com quem ia para fora já morto não abre (a falha já aconteceu)", abrirQuest(NON6, { estado: morre(mundo6(), "Eulália"), papeis: PAPEIS2[NON6] }) === null);
  const jn = jogo(TEM6, PAPEIS2[TEM6], mundo6(), { quests: [] });
  jn.turno((e) => nomear(ir(e, MONTE6), "Quelvar"));
  t("nomear quem entrou com a tempestade não é partilhar-lhe o lume", jn.R.feitas.abrigo && !jn.R.feitas.lume);
  /* o género: a mesma ficha diz «a vida é dele» de um e «a vida é dela» de uma (o veredito do conselho) */
  const gen6 = (genero) => {
    const j = jogo(JUR6, PAPEIS2[JUR6], mundo6([{ ...IAGO(80), genero }]), { quests: UM_TIPO_1_CONCLUIDO });
    j.turno((e) => dias(e, 2)).turno((e) => falar(falar(e, "Iago"), "Iago")).turno((e) => avista(ir(e, FORJA6), "Venâncio"));
    const v = vereditoDaEscolha(j.F, j.R, "juramento", j.ctx());
    return v ? v.opcoes.find((o) => o.id === "quebrar").ganha : "";
  };
  t("o marcador de género: «a vida é dele» de um homem, «a vida é dela» de uma mulher", /vida é dele./.test(gen6("m")) && /vida é dela./.test(gen6("f")), gen6("m") + " | " + gen6("f"));
  const g = () => { turno = 9000; return J(mor6(80, "voltar", "reclamar", { baixa: 55 }).R); };
  t("determinístico: o mesmo guião do lote 6 dá o mesmo registo", g() === g());
}

console.log(`\nBQ4 · a biblioteca de quests: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
