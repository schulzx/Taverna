/* AS CONDIÇÕES DA QUEST — o vocabulário fechado (08/11/2026, Fase BQ · BQ3)

   src/condicoes-da-quest.js: os predicados em dado, os papéis que passam a
   id uma vez, a avaliação dos compostos e o «o que falta» em dados. Tudo
   jogado: o livro é escrito pelas portas de verdade (anotarTurno com o
   efeito do Cronista, os caídos da luta, a presença do fim da resposta),
   e nenhuma linha de código se lê como texto.
   §1 a catraca — todo predicado ativo tem quem escreva o facto que lê (a
      porta importa-se e é função); o facto do livro com `porta: null`
      (recebeu, prometeu) só é lido por predicado RESERVADO, e o reservado
      nunca fecha nem passa a validação;
   §2 cada predicado ativo fecha com o mundo que o produz, e não fecha com
      o estado vazio;
   §3 do papel ao id — pela régua do livro, uma vez, idempotente; o lugar
      sem cidade fica pendente; o herói nunca é um papel;
   §4 as falhas da planta, com os saves que temos — «Encontrar Corrado»
      (13.ª), a Delfina só nomeada (MM14), o Marl de Osso (v9.195), as duas
      Nyla, os dois Anselmo da 13.ª, o nome do lugar contra o id (MM13);
   §5 julga o resultado, não o método — a mesma condição fecha por
      qualquer porta que produza o facto;
   §6 os compostos e o «o que falta» — todos, algum, nenhum, pelo_menos;
      o veto impossível; o Salvo-Conduto da planta (§2), etapa a etapa;
   §7 validarCondicao;
   §8 o lixo, o null, a imutabilidade e o determinismo — e a invariante:
      feita quando, e só quando, a falta está vazia;
   §9 os três pressupostos da Fase TE (TE2) — a camada do vilão, o nome do
      herói na boca dele e a convivência, cada um pelo tracker que o jogo já
      escreve, e a leitura crua do registo igual à de plano-do-vilao.js. */
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import {
  CONDICOES, COMBINADORES, PAPEIS_DA_CONDICAO, FONTES_DA_CONDICAO, LIMITES_DA_CONDICAO,
  resolverPapeis, validarCondicao, avaliarCondicao, julgarEtapa,
} from "../src/condicoes-da-quest.js";
import { TIPOS_DE_FACTO, garantirFactos, anotarTurno } from "../src/livro-de-factos.js";
import { FACTOS_DO_CRONISTA } from "../src/motor/cronista-do-turno.js";
import { caidosParaOLivro } from "../src/motor/luta-do-turno.js";
import { oQueACenaDaAoLivro, anotarOLivro } from "../src/motor/livro-do-turno.js";
import { matar, porSituacao, concluirLugar, SITUACOES } from "../src/mundo-base.js";
import { firmarLaco, registrarConsulta, mesclarNPC } from "../src/npcs.js";
import { garantirRegistroDoVilao, sabeONome } from "../src/plano-do-vilao.js";
import { ARQUETIPOS, FASES } from "../src/vilao.js";
import { chegouAteEle } from "../src/antagonista.js";
import { registrarVisto, vistosDaNarrativa, garantirElencoDoSave, VISTOS } from "../src/elenco.js";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, "..");
let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);
const congelar = (o) => { if (o && typeof o === "object" && !Object.isFrozen(o)) { Object.freeze(o); Object.values(o).forEach(congelar); } return o; };

/* o save real da 13.ª sessão (o Corrado, Porto das Pedras) */
const S13 = JSON.parse(fs.readFileSync(path.join(AQUI, "sessao-s13-fecho.json"), "utf8"));
const HEROI = "Ilse Varga";
const E13 = (extra) => ({ npcs: S13.npcs, cidadeAtual: S13.cidadeAtual, personagem: { nome: HEROI, grupo: [] }, dia: 1, npcTurno: 2, factos: garantirFactos(null), ...extra });
/* o efeito do Cronista é a própria entrada do anotarTurno (FACTOS_DO_CRONISTA) */
const doCronista = (estado, listas, dia = 1, turno = 2) => anotarOLivro(estado, { tipo: "factos", dia, turno, ...listas }).factos;
const ativos = Object.keys(CONDICOES).filter((k) => !CONDICOES[k].reservado);
const reservados = Object.keys(CONDICOES).filter((k) => CONDICOES[k].reservado);

sec("§1 a catraca — quem escreve o que cada predicado lê");
{
  t("o vocabulário tem predicados ativos e reservados", ativos.length >= 15 && reservados.length >= 2, `${ativos.length} ativos, ${reservados.length} reservados`);
  const semPorta = [];
  for (const k of ativos) if (!Array.isArray(CONDICOES[k].portas) || !CONDICOES[k].portas.length) semPorta.push(k);
  t("todo predicado ativo declara ao menos uma porta", semPorta.length === 0, semPorta.join(", "));
  const tortas = [];
  for (const k of ativos) {
    for (const p of CONDICOES[k].portas) {
      let ok = false;
      try {
        const m = await import(pathToFileURL(path.join(RAIZ, p.modulo)).href);
        ok = typeof m[p.funcao] === "function" && typeof p.oque === "string" && p.oque.length > 0;
      } catch { ok = false; }
      if (!ok) tortas.push(`${k} → ${p.modulo}#${p.funcao}`);
    }
  }
  /* que a função exportada tem leitor, a teste-ligacao já garante: aqui
     prova-se que a porta EXISTE e é uma função de verdade */
  t("cada porta é uma função exportada pelo módulo que diz", tortas.length === 0, tortas.join("; "));
  const fontesTortas = Object.keys(CONDICOES).filter((k) => CONDICOES[k].le.some((f) => !FONTES_DA_CONDICAO[f]));
  t("toda fonte lida está na tabela das fontes", fontesTortas.length === 0, fontesTortas.join(", "));
  const factosTortos = Object.keys(CONDICOES).filter((k) => CONDICOES[k].facto && !TIPOS_DE_FACTO[CONDICOES[k].facto]);
  t("todo facto lido existe no livro (TIPOS_DE_FACTO)", factosTortos.length === 0, factosTortos.join(", "));
  const lemLivroSemFacto = ativos.filter((k) => CONDICOES[k].le.includes("livro") && !CONDICOES[k].facto);
  t("quem lê o livro diz que facto lê", lemLivroSemFacto.length === 0, lemLivroSemFacto.join(", "));
  /* A REGRA DA BQ3: o facto que ninguém escreve não pode ser predicado ativo */
  const semEscritor = Object.keys(TIPOS_DE_FACTO).filter((f) => TIPOS_DE_FACTO[f].porta === null);
  t("o livro tem hoje dois factos sem porta: recebeu e prometeu", J(semEscritor.sort()) === J(["prometeu", "recebeu"]), J(semEscritor));
  const ativosSemEscritor = ativos.filter((k) => semEscritor.includes(CONDICOES[k].facto));
  t("nenhum predicado ATIVO lê um facto com porta null", ativosSemEscritor.length === 0, ativosSemEscritor.join(", "));
  t("entregou (recebeu) e prometeu (prometeu) existem, e estão reservados",
    CONDICOES.entregou.facto === "recebeu" && !!CONDICOES.entregou.reservado && CONDICOES.prometeu.facto === "prometeu" && !!CONDICOES.prometeu.reservado);
  t("todo reservado diz porquê e não declara porta", reservados.every((k) => typeof CONDICOES[k].reservado === "string" && CONDICOES[k].reservado.length > 20 && !CONDICOES[k].portas.length));
  /* o reservado nunca fecha — nem com o facto escrito à mão no livro */
  const livroComEntrega = garantirFactos({ pessoas: { "npc|Corrado": { nome: "Corrado", recebeu: ["carta selada"], prometeu: [{ o: "voltar", dia: 1 }] } } });
  const papeis = { dono: { tipo: "pessoa", nome: "Corrado" }, carta: { tipo: "item", nome: "a carta selada" } };
  const ctx = { estado: E13({ factos: livroComEntrega }), papeis };
  t("o livro escrito à mão tem a entrega (o leitor do livro a vê)", livroComEntrega.pessoas["npc|Corrado"].recebeu.length === 1);
  const je = julgarEtapa({ conclui: ["entregou", "item:carta", "papel:dono"] }, ctx);
  t("e mesmo assim `entregou` não fecha: reservado", !je.feita && je.falta.length === 1 && je.falta[0].reservado === true, J(je));
  t("`prometeu` também não", !avaliarCondicao(["prometeu", "papel:dono"], ctx) && julgarEtapa({ conclui: ["prometeu", "papel:dono"] }, ctx).falta[0].reservado === true);
  t("e a validação recusa todos os reservados", reservados.every((k) => !validarCondicao([k, "papel:dono"], null).ok && validarCondicao([k, "papel:dono"], null).erros.some((e) => e.includes("reservado"))));
  t("o reservado dentro de um `algum` não o deixa fechar por ele",
    !avaliarCondicao(["algum", ["entregou", "item:carta", "papel:dono"], ["prometeu", "papel:dono"]], ctx));
  t("o relógio está reservado (o cheio sai da lista e não diz se encheu ou foi vencido)", !!CONDICOES.relogio.reservado);
  t("todo predicado tem a frase de mundo e a do veto", Object.values(CONDICOES).every((d) => typeof d.texto === "string" && d.texto && typeof d.nao === "string" && d.nao));
  t("os papéis do vocabulário são pessoa, lugar e coisa", J(Object.values(PAPEIS_DA_CONDICAO).map((p) => p.tipo)) === J(["pessoa", "lugar", "item"]));
  t("os combinadores são todos, algum, nenhum e pelo_menos", J(Object.keys(COMBINADORES)) === J(["todos", "algum", "nenhum", "pelo_menos"]));
}

/* ---------------- um mundo onde tudo é verdade ---------------- */
const CIDADE = "Alto do Sal";
const NPCS = {
  Brás: { nome: "Brás", conhecidoEm: 1, local: CIDADE, relacao: "inimigo", status: "vivo", consultas: 0 },
  Lia: { nome: "Lia", conhecidoEm: 1, local: CIDADE, relacao: "neutro", status: "vivo", consultas: 0 },
  Teodoro: { nome: "Teodoro", conhecidoEm: 1, local: CIDADE, relacao: "neutro", status: "vivo", consultas: 0 },
  Delfina: { nome: "Delfina", conhecidoEm: 1, local: "Foz do Meio", relacao: "desconhecido", status: "vivo", consultas: 0 },
};
const PAPEIS = {
  tenente: { tipo: "pessoa", nome: "Brás" },
  protegido: { tipo: "pessoa", nome: "Lia" },
  informante: { tipo: "pessoa", nome: "Teodoro" },
  sumida: { tipo: "pessoa", nome: "Delfina" },
  origem: { tipo: "lugar", cidade: CIDADE },
  desvio: { tipo: "lugar", nome: "Trilho do Vau", cidade: CIDADE },
  covil: { tipo: "lugar", nome: "Covil de Espinhos", cidade: CIDADE },
  carta: { tipo: "item", nome: "a carta selada" },
};
const vazio = () => ({ npcs: NPCS, cidadeAtual: CIDADE, personagem: { nome: "Vera", grupo: [], inventario: [] }, dia: 0, npcTurno: 0, factos: garantirFactos(null), baseMundo: null });
function cheio() {
  let e = vazio();
  /* a presença e o lugar pelo fim da resposta (a porta da cena) */
  e = { ...e, lugar: { nome: "Trilho do Vau", cidade: CIDADE }, personagem: { ...e.personagem, grupo: [{ nome: "Lia", vinculo: 80 }] } };
  const cena = oQueACenaDaAoLivro(e, { narrativa: "" });
  e = { ...e, factos: anotarOLivro(e, { ...cena, dia: 2, turno: 3 }).factos };
  /* a conversa e o segredo pelo efeito do Cronista */
  e = { ...e, factos: doCronista(e, { falouCom: ["Teodoro", "Lia"], segredos: [{ nome: "Covil de Espinhos", cidade: CIDADE }] }, 2, 4) };
  /* os caídos pelo fim da luta: Brás rendido, Delfina morta */
  e = { ...e, factos: anotarOLivro(e, { tipo: "factos", dia: 3, turno: 6, derrotados: caidosParaOLivro([{ nome: "Brás", rendido: true }, { nome: "Delfina" }]) }).factos };
  /* a base: a masmorra concluída, o Teodoro ferido; a ficha: o laço e a consulta */
  let base = concluirLugar(null, "Covil de Espinhos");
  base = porSituacao(base, "Teodoro", SITUACOES.ferida);
  let npcs = registrarConsulta(e.npcs, "Teodoro");
  npcs = { ...npcs, Teodoro: firmarLaco(npcs.Teodoro, "amizade", 3), Lia: mesclarNPC(npcs.Lia, { relacao: "aliado" }) };
  /* 09/11: o favor pela porta do livro que o motor das quests chama (o
     efeito «favor»), com o id que o papel resolveu — a mesma régua */
  const desvio = resolverPapeis({ desvio: PAPEIS.desvio }, e).papeis.desvio;
  e = { ...e, factos: anotarTurno(e.factos, { dia: 3, favores: [{ lugar: desvio, de: "o_salvo_conduto" }] }).factos };
  /* TE2 (09/11): o vilão na camada da mão, que já aprendeu o nome do herói
     (o registo, como reagirAoHeroi o guarda), e a Lia vista desde o dia 2
     pela porta da narração (vistosDaNarrativa) */
  const espinha = { fio: { vilao: { arquetipo: ARQUETIPOS[0].id, camada: "mao", nomeDoHeroi: { dia: 3, fonte: "viu" } } } };
  const elenco = vistosDaNarrativa(null, npcs, "A Lia acorda antes de toda a gente.", 2);
  return { ...e, baseMundo: base, npcs, dia: 7, espinha, elenco, personagem: { ...e.personagem, inventario: [{ nome: "Carta selada de Brás" }] } };
}
const VERDADE = {
  conheceu: ["conheceu", "papel:informante"],
  conversou: ["conversou", "papel:informante"],
  afeicao: ["afeicao", "papel:protegido", 3],
  derrotou: ["derrotou", "papel:tenente"],
  poupou: ["poupou", "papel:tenente"],
  morto: ["morto", "papel:sumida"],
  situacao: ["situacao", "papel:informante", "ferida"],
  relacao: ["relacao", "papel:protegido", "aliado"],
  consultou: ["consultou", "papel:informante"],
  acompanha: ["acompanha", "papel:protegido"],
  esteve: ["esteve", "lugar:desvio"],
  esta_em: ["esta_em", "lugar:desvio"],
  descobriu: ["descobriu", "lugar:covil"],
  concluiu: ["concluiu", "lugar:covil"],
  deve_favor: ["deve_favor", "lugar:desvio"],
  tem: ["tem", "item:carta"],
  dia: ["dia", 7],
  /* BQ4 (08/11): `escolheu` e `etapa` deixaram de estar reservados — leem
     o registo da quest (biblioteca-de-quests.js), que entra em
     contexto.quest. O caso de verdade deles é o registo cheio abaixo. */
  escolheu: ["escolheu", "passo", "portagem"],
  etapa: ["etapa", "aceitar"],
  /* TE2 (09/11): os três pressupostos */
  camada: ["camada", "mao"],
  sabe_nome: ["sabe_nome"],
  convivencia: ["convivencia", "papel:protegido", 3],
};
const QUEST_CHEIA = { feitas: { aceitar: true }, escolhas: { passo: "portagem" }, rotulos: {} };

sec("§2 cada predicado ativo fecha com o mundo que o produz — e só com ele");
{
  const C = cheio();
  t("há um caso de verdade para cada predicado ativo", J(Object.keys(VERDADE).sort()) === J([...ativos].sort()), J(ativos.filter((k) => !VERDADE[k])));
  const naoFecham = Object.keys(VERDADE).filter((k) => !julgarEtapa({ conclui: VERDADE[k] }, { estado: C, papeis: PAPEIS, quest: QUEST_CHEIA }).feita);
  t("no mundo cheio, todos fecham", naoFecham.length === 0, naoFecham.join(", "));
  const fechamNoVazio = Object.keys(VERDADE).filter((k) => avaliarCondicao(VERDADE[k], { estado: vazio(), papeis: PAPEIS }));
  t("no mundo vazio, nenhum fecha", fechamNoVazio.length === 0, fechamNoVazio.join(", "));
  t("e cada caso passa a validação", Object.values(VERDADE).every((c) => validarCondicao(c, PAPEIS).ok));
  t("escolheu e etapa leem só o registo da quest: o mundo cheio sem registo não os fecha",
    !avaliarCondicao(VERDADE.escolheu, { estado: C, papeis: PAPEIS }) && !avaliarCondicao(VERDADE.etapa, { estado: C, papeis: PAPEIS }));
  t("o argumento deles é um id da ficha: o nome, o número e o vazio não validam",
    !validarCondicao(["escolheu", "Passo Largo", "x"], PAPEIS).ok && !validarCondicao(["etapa", 3], PAPEIS).ok && !validarCondicao(["etapa", ""], PAPEIS).ok);
  const C2 = cheio();
  t("o poupado não está morto, e a morta não foi poupada",
    !avaliarCondicao(["morto", "papel:tenente"], { estado: C2, papeis: PAPEIS }) && !avaliarCondicao(["poupou", "papel:sumida"], { estado: C2, papeis: PAPEIS }) && avaliarCondicao(["derrotou", "papel:sumida"], { estado: C2, papeis: PAPEIS }));
  t("a morta não está livre: situação morta", avaliarCondicao(["situacao", "papel:sumida", "morta"], { estado: C2, papeis: PAPEIS }) && !avaliarCondicao(["situacao", "papel:sumida", "livre"], { estado: C2, papeis: PAPEIS }));
  t("quem não tem situação escrita está livre", avaliarCondicao(["situacao", "papel:protegido", "livre"], { estado: C2, papeis: PAPEIS }));
  /* os que contam */
  const conta = julgarEtapa({ conclui: ["conversou", "papel:informante", 3] }, { estado: C2, papeis: PAPEIS });
  t("conversou 3 vezes com uma conversa: falta, com tem 1 e precisa 3", !conta.feita && conta.falta[0].tem === 1 && conta.falta[0].precisa === 3 && conta.falta[0].texto === "falar com Teodoro (1 de 3)", J(conta.falta));
  const af = julgarEtapa({ conclui: ["afeicao", "papel:protegido", 4] }, { estado: C2, papeis: PAPEIS });
  t("a afeição 80 é o grau 3 (os marcos do vínculo): o 4 falta", !af.feita && af.falta[0].tem === 3 && af.falta[0].precisa === 4);
  t("o laço com quem não anda no grupo também conta (firmarLaco)", avaliarCondicao(["afeicao", "papel:informante", 1], { estado: C2, papeis: PAPEIS }));
  const d = julgarEtapa({ conclui: ["dia", 9] }, { estado: C2, papeis: PAPEIS });
  t("o dia 9 no dia 7: falta, 7 de 9", !d.feita && d.falta[0].tem === 7 && d.falta[0].precisa === 9);
  t("esta_em: a cidade conta, e na estrada não", avaliarCondicao(["esta_em", "lugar:origem"], { estado: C2, papeis: PAPEIS }) && !avaliarCondicao(["esta_em", "lugar:origem"], { estado: { ...C2, jornada: { para: "Foz do Meio" } }, papeis: PAPEIS }));
  t("tem: a coisa pelas palavras inteiras — «a carta selada» na «Carta selada de Brás», e não na «Cartaz»",
    avaliarCondicao(["tem", "item:carta"], { estado: C2, papeis: PAPEIS }) && !avaliarCondicao(["tem", "item:carta"], { estado: { ...C2, personagem: { ...C2.personagem, inventario: ["Cartaz selado"] } }, papeis: PAPEIS }));
  t("tem: o equipado também conta", avaliarCondicao(["tem", "item:carta"], { estado: { ...C2, personagem: { ...C2.personagem, inventario: [], equipados: { mao: { nome: "carta selada" } } } }, papeis: PAPEIS }));
  t("acompanha: a invocação não é companhia", !avaliarCondicao(["acompanha", "papel:protegido"], { estado: { ...C2, personagem: { ...C2.personagem, grupo: [{ nome: "Lia", invocada: true }] } }, papeis: PAPEIS }));
}

sec("§3 do papel ao id");
{
  const E = E13();
  const r = resolverPapeis({ organizador: { tipo: "pessoa", nome: "Corrado" }, apostador: { tipo: "pessoa", nome: "Anselmo" }, liça: { tipo: "lugar", nome: "Largo da Liça", cidade: S13.cidadeAtual } }, E);
  t("a pessoa do registo passa ao id do livro (npc|Corrado)", r.papeis.organizador.id === "npc|Corrado" && r.papeis.organizador.nome === "Corrado");
  t("«Anselmo» é o Anselmo, não o Anselmo Machado Torto (o nível exato primeiro)", r.papeis.apostador.id === "npc|Anselmo");
  t("o lugar com cidade passa ao id que o livro escreve", r.papeis["liça"].id === "porto das pedras|sitio|largo da lica");
  const livro = anotarTurno(null, { npcs: S13.npcs, cidade: S13.cidadeAtual, heroi: HEROI, dia: 1, turno: 2, lugar: { nome: "Largo da Liça", cidade: S13.cidadeAtual } }).factos;
  t("e é o MESMO id que a escrita do lugar dá", !!livro.lugares[r.papeis["liça"].id]);
  const r2 = resolverPapeis(r.papeis, E);
  t("idempotente: resolver o resolvido dá o mesmo", J(r2) === J(r));
  const r3 = resolverPapeis({ x: { tipo: "pessoa", nome: "Outro Nome", id: "npc|Corrado" } }, E);
  t("o id que já veio fica (o papel passa a id UMA vez)", r3.papeis.x.id === "npc|Corrado");
  const r4 = resolverPapeis({ ninguem: { tipo: "pessoa", nome: "Ninguém Daqui" }, heroi: { tipo: "pessoa", nome: HEROI }, sem: { tipo: "lugar", nome: "Largo da Liça" }, torto: { tipo: "dragao", nome: "x" }, lixo: 7 }, E);
  t("quem ninguém conhece, o herói, o lugar sem cidade e o lixo ficam pendentes",
    J(r4.pendentes) === J(["ninguem", "heroi", "sem", "torto", "lixo"]) && r4.papeis.ninguem.id === "" && r4.papeis.heroi.id === "", J(r4));
  t("a cidade é um lugar: { tipo: lugar, cidade }", resolverPapeis({ c: { tipo: "lugar", cidade: "Alto do Sal" } }, E).papeis.c.id === "cidade|alto do sal");
  t("a chave da base vale como id", resolverPapeis({ b: { tipo: "lugar", nome: "Beco dos Cambistas", chave: "Val das Pedras|mercado" } }, E).papeis.b.id === "Val das Pedras|mercado");
  t("a coisa sai sem o artigo", resolverPapeis({ c: { tipo: "item", nome: "A Carta Selada" } }, E).papeis.c.id === "carta selada");
  /* quem o registo ainda não tem, o livro pode ter (a porta da BQ2) */
  const soNoLivro = garantirFactos({ pessoas: { "npc|Margarida do Forno Velho": { nome: "Margarida do Forno Velho", falou: { de: 2, ate: 2, vezes: 1, turno: 9 } } } });
  const r5 = resolverPapeis({ m: { tipo: "pessoa", nome: "Margarida do Forno Velho" } }, E13({ npcs: {}, factos: soNoLivro }));
  t("quem já está no livro e não no registo resolve-se pelo livro", r5.papeis.m.id === "npc|Margarida do Forno Velho");
  t("null e lixo: nada, sem lançar", J(resolverPapeis(null, null)) === J({ papeis: {}, pendentes: [] }) && J(resolverPapeis([], "x")) === J({ papeis: {}, pendentes: [] }));
}

sec("§4 as falhas da planta, com os saves que temos");
{
  /* «Encontrar Corrado» (13.ª): a conversa do T2 ao T5 que nenhum turno guardou */
  const E = E13();
  const papeis = { organizador: { tipo: "pessoa", nome: "Corrado" } };
  const etapa = { id: "encontrar", conclui: ["conversou", "papel:organizador"] };
  const antes = julgarEtapa(etapa, { estado: E, papeis });
  t("13.ª, antes da conversa: falta «falar com Corrado», em dados", !antes.feita && antes.falta.length === 1 && antes.falta[0].predicado === "conversou" && antes.falta[0].args[0].id === "npc|Corrado" && antes.falta[0].texto === "falar com Corrado", J(antes));
  const t2 = doCronista(E, { falouCom: ["Corrado, o empresário"] });
  const t6 = { ...E, factos: t2, dia: 1, npcTurno: 6, lugar: { nome: "A Taverna da Âncora", cidade: S13.cidadeAtual } };
  t("13.ª, T6, noutro sítio e sem conversa: a do T2 fecha a etapa", julgarEtapa(etapa, { estado: t6, papeis }).feita);
  const soVisto = anotarOLivro(E, { emCena: [{ tipo: "pessoa", nome: "Corrado", aqui: true, deOnde: "registo" }], dia: 1, turno: 2 }).factos;
  t("13.ª, o Corrado só à vista: conheceu sim, conversou não", avaliarCondicao(["conheceu", "papel:organizador"], { estado: { ...E, factos: soVisto }, papeis }) && !julgarEtapa(etapa, { estado: { ...E, factos: soVisto }, papeis }).feita);
  /* os dois Anselmo da 13.ª */
  const comAnselmo = doCronista(E, { falouCom: ["Anselmo"] });
  t("13.ª, a conversa com o Anselmo não fecha a do Anselmo Machado Torto",
    !avaliarCondicao(["conversou", "papel:x"], { estado: { ...E, factos: comAnselmo }, papeis: { x: { tipo: "pessoa", nome: "Anselmo Machado Torto" } } })
    && avaliarCondicao(["conversou", "papel:x"], { estado: { ...E, factos: comAnselmo }, papeis: { x: { tipo: "pessoa", nome: "Anselmo" } } }));
  /* a Delfina (MM14): o Teodoro disse onde ela vivia, e a principal fechou */
  const EM = { ...vazio() };
  const nomeada = doCronista(EM, { nomeados: ["Delfina"] }, 1, 5);
  t("MM14, a Delfina só nomeada: o livro ouviu o nome", !!nomeada.pessoas["npc|Delfina"] && !!nomeada.pessoas["npc|Delfina"].nomeado);
  t("e conheceu(Delfina) não fecha — ser nomeado não é conhecer", !avaliarCondicao(["conheceu", "papel:sumida"], { estado: { ...EM, factos: nomeada }, papeis: PAPEIS }));
  /* o Marl de Osso (v9.195): o mural dizia «Marl de Osso», o registo guardou «Marl» */
  const EMarl = { ...vazio(), npcs: { Marl: { nome: "Marl", conhecidoEm: 1, local: CIDADE } } };
  const marl = { alvo: { tipo: "pessoa", nome: "Marl de Osso" } };
  t("v9.195, o papel «Marl de Osso» passa ao id do «Marl» do registo", resolverPapeis(marl, EMarl).papeis.alvo.id === "npc|Marl");
  t("e a conversa com o Marl fecha a etapa", julgarEtapa({ conclui: ["conversou", "papel:alvo"] }, { estado: { ...EMarl, factos: doCronista(EMarl, { falouCom: ["Marl"] }) }, papeis: marl }).feita);
  /* as duas Nyla (10.ª sessão): o primeiro nome não basta */
  const ENyla = { ...vazio(), npcs: { "Nyla Pé-Leve": { nome: "Nyla Pé-Leve", conhecidoEm: 1, local: CIDADE }, "Nyla Punho-de-Pedra": { nome: "Nyla Punho-de-Pedra", conhecidoEm: 1, local: CIDADE } } };
  const nyla = { a: { tipo: "pessoa", nome: "Nyla Pé-Leve" } };
  const falouComAOutra = doCronista(ENyla, { falouCom: ["Nyla Punho-de-Pedra"] });
  t("10.ª, falar com a Nyla Punho-de-Pedra não fecha a da Nyla Pé-Leve", !avaliarCondicao(["conversou", "papel:a"], { estado: { ...ENyla, factos: falouComAOutra }, papeis: nyla }));
  t("e o papel «Nyla» sozinho, entre as duas, fica pendente (não se adivinha)", resolverPapeis({ a: { tipo: "pessoa", nome: "Nyla" } }, ENyla).pendentes.includes("a"));
  /* MM13: o nome do lugar contra o id da base (Cidade|tipo) — o Beco dos Cambistas da 13.ª */
  const marco = S13.espinha.atos[0].marcos[1].condicao;
  t("13.ª, o marco do Beco dos Cambistas traz a chave da base", marco.chave === "Val das Pedras|mercado");
  const beco = { beco: { tipo: "lugar", nome: marco.alvo, chave: marco.chave } };
  const ponte = (n) => (n === marco.alvo ? marco.chave : "");
  const segredo = anotarTurno(E.factos, { dia: 2, turno: 3, cidade: "Val das Pedras", chaveDoLugar: ponte, segredos: [marco.alvo] }).factos;
  t("MM13, o segredo escrito pelo NOME, pela ponte, fecha o papel guardado pela CHAVE", julgarEtapa({ conclui: ["descobriu", "lugar:beco"] }, { estado: { ...E, factos: segredo }, papeis: beco }).feita);
  /* o Campo das Mães (MM14): o lugar dito de longe */
  const campo = { campo: { tipo: "lugar", nome: "O Campo das Mães", cidade: CIDADE } };
  const deLonge = doCronista(vazio(), { nomeados: ["Teodoro"] });
  t("MM14, o Campo das Mães só dito: nem esteve, nem descobriu",
    !avaliarCondicao(["esteve", "lugar:campo"], { estado: { ...vazio(), factos: deLonge }, papeis: campo }) && !avaliarCondicao(["descobriu", "lugar:campo"], { estado: { ...vazio(), factos: deLonge }, papeis: campo }));
}

sec("§5 julga o resultado, não o método");
{
  const papeis = { x: { tipo: "pessoa", nome: "Teodoro" } };
  const cond = ["conheceu", "papel:x"];
  const E = vazio();
  const pelaCena = anotarOLivro(E, { emCena: [{ tipo: "pessoa", nome: "Teodoro", aqui: true, deOnde: "registo" }], dia: 1, turno: 1 }).factos;
  const peloCronista = doCronista(E, { falouCom: ["Teodoro"] });
  const pelaLuta = anotarOLivro(E, { tipo: "factos", dia: 1, turno: 1, derrotados: caidosParaOLivro([{ nome: "Teodoro", desacordado: true }]) }).factos;
  t("conheceu fecha pela cena, pela conversa e pela luta — três portas, um facto",
    [pelaCena, peloCronista, pelaLuta].every((f) => julgarEtapa({ conclui: cond }, { estado: { ...E, factos: f }, papeis }).feita));
  t("o efeito do Cronista é o que a tabela dele diz (falouCom é uma chave dele)", Object.keys(FACTOS_DO_CRONISTA).includes("falouCom"));
  const mortoPelaBase = { ...E, baseMundo: matar(null, "Teodoro") };
  const mortoPelaLuta = { ...E, factos: anotarOLivro(E, { tipo: "factos", dia: 1, turno: 1, derrotados: caidosParaOLivro([{ nome: "Teodoro" }]) }).factos };
  const mortoNaFicha = { ...E, npcs: { ...E.npcs, Teodoro: { ...E.npcs.Teodoro, status: "morto" } } };
  t("morto fecha pela base, pela luta e pela ficha", [mortoPelaBase, mortoPelaLuta, mortoNaFicha].every((e) => avaliarCondicao(["morto", "papel:x"], { estado: e, papeis })));
  /* o passo do Salvo-Conduto: violento ou furtivo, o mesmo passo */
  const passo = { conclui: ["algum", ["derrotou", "papel:tenente"], ["esteve", "lugar:desvio"]] };
  const violento = anotarOLivro(E, { tipo: "factos", dia: 1, turno: 1, derrotados: caidosParaOLivro([{ nome: "Brás" }]) }).factos;
  const furtivo = anotarOLivro({ ...E, lugar: { nome: "Trilho do Vau", cidade: CIDADE } }, { lugar: { nome: "Trilho do Vau", cidade: CIDADE }, dia: 1, turno: 1 }).factos;
  t("o passo fecha vencendo o Brás", julgarEtapa(passo, { estado: { ...E, factos: violento }, papeis: PAPEIS }).feita);
  t("e fecha pelo desvio, sem luta", julgarEtapa(passo, { estado: { ...E, factos: furtivo }, papeis: PAPEIS }).feita);
}

sec("§6 os compostos e o «o que falta»");
{
  const E = vazio();
  const ctx = { estado: E, papeis: PAPEIS };
  const algum = julgarEtapa({ conclui: ["algum", ["derrotou", "papel:tenente"], ["esteve", "lugar:desvio"]] }, ctx);
  t("algum: uma entrada só, com as opções e a frase com «ou»",
    !algum.feita && algum.falta.length === 1 && algum.falta[0].predicado === "algum" && algum.falta[0].opcoes.length === 2 && algum.falta[0].texto === "vencer Brás ou ir a Trilho do Vau", J(algum));
  const todos = julgarEtapa({ conclui: ["todos", ["conversou", "papel:informante"], ["esteve", "lugar:desvio"]] }, ctx);
  t("todos: a falta são as faltas dos ramos, juntas", !todos.feita && J(todos.falta.map((f) => f.predicado)) === J(["conversou", "esteve"]));
  const meio = { ...E, factos: doCronista(E, { falouCom: ["Teodoro"] }) };
  t("todos com um ramo feito: só o que falta", J(julgarEtapa({ conclui: ["todos", ["conversou", "papel:informante"], ["esteve", "lugar:desvio"]] }, { estado: meio, papeis: PAPEIS }).falta.map((f) => f.predicado)) === J(["esteve"]));
  const pm = julgarEtapa({ conclui: ["pelo_menos", 2, ["conversou", "papel:informante"], ["esteve", "lugar:desvio"], ["dia", 5]] }, { estado: meio, papeis: PAPEIS });
  t("pelo_menos 2 de 3, com um feito: tem 1, precisa 2, e as opções são as que faltam",
    !pm.feita && pm.falta[0].predicado === "pelo_menos" && pm.falta[0].tem === 1 && pm.falta[0].precisa === 2 && pm.falta[0].opcoes.length === 2, J(pm));
  t("pelo_menos 1 de 3, com um feito: feita", julgarEtapa({ conclui: ["pelo_menos", 1, ["conversou", "papel:informante"], ["esteve", "lugar:desvio"]] }, { estado: meio, papeis: PAPEIS }).feita);
  /* o veto: sair de, sem que morra */
  const naOrigem = { ...E, lugar: { nome: "Praça", cidade: CIDADE } };
  const nen = julgarEtapa({ conclui: ["nenhum", ["esta_em", "lugar:origem"]] }, { estado: naOrigem, papeis: PAPEIS });
  t("nenhum: na origem, falta «sair de Alto do Sal», e dá para voltar atrás",
    !nen.feita && nen.falta[0].predicado === "nenhum" && nen.falta[0].texto === "sair de Alto do Sal" && nen.falta[0].impossivel === false, J(nen));
  t("nenhum: fora da origem, feita", julgarEtapa({ conclui: ["nenhum", ["esta_em", "lugar:origem"]] }, { estado: { ...naOrigem, jornada: { para: "Foz do Meio" }, lugar: null }, papeis: PAPEIS }).feita);
  const morta = { ...E, baseMundo: matar(null, "Lia") };
  const veto = julgarEtapa({ conclui: ["nenhum", ["morto", "papel:protegido"]] }, { estado: morta, papeis: PAPEIS });
  t("nenhum sobre a morte que já aconteceu: impossível (o sinal da falha)", !veto.feita && veto.falta[0].impossivel === true && veto.falta[0].evitar[0].impossivel === true && veto.falta[0].texto === "manter Lia com vida", J(veto));
  t("o papel sem quem o ocupe: «alguém», nunca o nome do papel",
    J(julgarEtapa({ conclui: ["conversou", "papel:fantasma"] }, ctx).falta) === J([{ predicado: "conversou", args: [{ papel: "fantasma", tipo: "pessoa", id: "", nome: "" }, 1], semId: true, texto: "falar com alguém" }]));
  const frases = [];
  const juntar = (fs) => fs.forEach((f) => { frases.push(f.texto); (f.opcoes || []).forEach(juntar); juntar(f.evitar || []); });
  for (const c of Object.values(VERDADE)) juntar(julgarEtapa({ conclui: c }, ctx).falta);
  const vazam = frases.filter((s) => /[{}]|papel|lugar:|item:|tenente|protegido|informante|sumida|desvio|covil\b/.test(s));
  t("nenhuma frase do «o que falta» diz um papel, um prefixo ou um modelo por preencher", vazam.length === 0 && frases.length >= 16, vazam.join(" | "));

  /* O Salvo-Conduto da planta (§2), no vocabulário de hoje. O passo social
     («escolheu») é da BQ4: aqui fica de fora. Até à BQ4 a validação
     recusava-o (reservado); desde a BQ4 aceita-o, e a quest inteira, com o
     passo social, joga-se em teste-biblioteca-de-quests.mjs. */
  sec("§6.1 o Salvo-Conduto, etapa a etapa");
  const SC = {
    aceitar: ["conversou", "papel:protegido"],
    estrada: ["todos", ["acompanha", "papel:protegido"], ["nenhum", ["esta_em", "lugar:origem"]]],
    passo: ["algum", ["derrotou", "papel:tenente"], ["esteve", "lugar:desvio"]],
    chegar: ["todos", ["acompanha", "papel:protegido"], ["esta_em", "lugar:destino"]],
  };
  const PSC = { ...PAPEIS, destino: { tipo: "lugar", cidade: "Foz do Meio" } };
  t("as quatro etapas validam contra os papéis declarados", Object.values(SC).every((c) => validarCondicao(c, PSC).ok));
  /* MOVIDA na BQ4 (08/11): esta asserção dizia «não valida ainda (reservado
     até à BQ4)». A BQ4 deu ao `escolheu` quem escreva o que ele lê
     (escolherNaQuest, no registo da quest), e a intenção — nenhum predicado
     sem escritor passa a validação — continua provada em §1 para os que
     ficaram reservados (entregou, prometeu, relogio). */
  t("o passo da planta, com o «escolheu», valida desde a BQ4 (o registo da quest escreve a escolha)",
    validarCondicao(["algum", ["derrotou", "papel:tenente"], ["escolheu", "passo", "portagem"], ["esteve", "lugar:desvio"]], PSC).ok);
  let e = { ...vazio(), lugar: { nome: "Praça", cidade: CIDADE } };
  const j = (k) => julgarEtapa({ id: k, conclui: SC[k] }, { estado: e, papeis: PSC });
  t("nenhuma etapa nasce feita", Object.keys(SC).every((k) => !j(k).feita));
  e = { ...e, factos: doCronista(e, { falouCom: ["Lia"] }) };
  t("ouvir a Lia: aceitar", j("aceitar").feita && !j("estrada").feita);
  e = { ...e, personagem: { ...e.personagem, grupo: [{ nome: "Lia" }] } };
  t("com a Lia no grupo, ainda em Alto do Sal: falta só sair", J(j("estrada").falta.map((f) => f.texto)) === J(["sair de Alto do Sal"]));
  e = { ...e, jornada: { para: "Foz do Meio" }, lugar: null };
  t("na estrada com ela: a estrada fecha", j("estrada").feita);
  e = { ...e, lugar: { nome: "Trilho do Vau", cidade: CIDADE } };
  e = { ...e, factos: anotarOLivro(e, { lugar: e.lugar, dia: 2, turno: 9 }).factos };
  t("pelo desvio: o passo fecha sem luta", j("passo").feita);
  e = { ...e, jornada: null, cidadeAtual: "Foz do Meio", lugar: { nome: "Cais", cidade: "Foz do Meio" } };
  t("em Foz do Meio, com a Lia: chegar fecha", j("chegar").feita);
  t("e sem ela no grupo, chegar não fecha (falta tê-la ao lado)", J(julgarEtapa({ conclui: SC.chegar }, { estado: { ...e, personagem: { ...e.personagem, grupo: [] } }, papeis: PSC }).falta.map((f) => f.texto)) === J(["ter Lia ao seu lado"]));
  t("a falha da planta («morto, protegido») é uma condição como as outras", !avaliarCondicao(["morto", "papel:protegido"], { estado: e, papeis: PSC }) && avaliarCondicao(["morto", "papel:protegido"], { estado: { ...e, baseMundo: matar(null, "Lia") }, papeis: PSC }));
}

sec("§7 validarCondicao");
{
  const ok = (c) => validarCondicao(c, PAPEIS).ok;
  t("o predicado que não existe", !ok(["voou", "papel:tenente"]));
  t("o papel do tipo errado (um lugar onde se pede pessoa)", !ok(["conversou", "lugar:covil"]));
  t("o papel não declarado", !ok(["conversou", "papel:rei"]));
  t("o papel de outro tipo do que o declarado", !validarCondicao(["conversou", "papel:origem"], { origem: { tipo: "lugar" } }).ok);
  t("o nome no lugar do papel (nunca por nome)", !ok(["conversou", "Brás"]) && !ok(["conversou", "papel:Brás"]));
  t("a afeição fora da régua (5)", !ok(["afeicao", "papel:protegido", 5]) && ok(["afeicao", "papel:protegido", 4]));
  t("o número torto", !ok(["conversou", "papel:informante", 0]) && !ok(["conversou", "papel:informante", 1.5]) && !ok(["dia", "7"]));
  t("a opção que não existe", !ok(["situacao", "papel:informante", "zangada"]) && !ok(["relacao", "papel:informante", "chefe"]));
  t("argumentos a mais", !ok(["conheceu", "papel:informante", "papel:tenente"]));
  t("pelo_menos com o número fora dos ramos", !ok(["pelo_menos", 3, ["dia", 1], ["dia", 2]]) && !ok(["pelo_menos", 0, ["dia", 1]]) && ok(["pelo_menos", 2, ["dia", 1], ["dia", 2]]));
  t("o combinador sem ramos", !ok(["todos"]) && !ok(["nenhum"]));
  const largo = ["algum", ...Array.from({ length: LIMITES_DA_CONDICAO.filhos + 1 }, (_, i) => ["dia", i + 1])];
  t("ramos demais", !ok(largo) && ok(largo.slice(0, LIMITES_DA_CONDICAO.filhos + 1)));
  let fundo = ["dia", 1];
  for (let i = 0; i <= LIMITES_DA_CONDICAO.profundidade; i++) fundo = ["todos", fundo];
  t("funda demais", !ok(fundo));
  t("sem papéis declarados, confere só a forma", validarCondicao(["conversou", "papel:qualquer"], null).ok);
  t("o lixo não lança", [null, undefined, 3, "x", {}, [], [7]].every((c) => validarCondicao(c, PAPEIS).ok === false));
}

sec("§8 o lixo, o null, a imutabilidade e o determinismo");
{
  const torta = { predicado: null, invalida: true, texto: "" };
  t("etapa null, {}, sem conclui ou com lixo: não feita, falta inválida",
    [null, undefined, {}, { conclui: "x" }, { conclui: [] }, { conclui: [7] }].every((e) => J(julgarEtapa(e, { estado: vazio(), papeis: PAPEIS })) === J({ feita: false, falta: [torta] })));
  t("contexto null, estado null, papeis null: nada fecha, nada lança",
    [null, {}, { estado: null }, { estado: "x", papeis: 3 }].every((c) => julgarEtapa({ conclui: ["conheceu", "papel:x"] }, c).feita === false && avaliarCondicao(["dia", 1], c) === false));
  t("o predicado desconhecido: não fecha, e diz-se desconhecido", julgarEtapa({ conclui: ["voou"] }, { estado: vazio() }).falta[0].desconhecido === true);
  t("o argumento torto não toma a omissão: falta inválida, sem frase", J(julgarEtapa({ conclui: ["dia", "muito"] }, { estado: cheio() }).falta) === J([{ predicado: "dia", args: ["muito"], invalida: true, texto: "" }]));
  t("argumentos de lixo não lançam, e não fecham", [["conversou", 7, "x"], ["afeicao", null, null], ["tem", {}], ["dia", "muito"], ["pelo_menos", "dois", ["dia", 1]]].every((c) => avaliarCondicao(c, { estado: cheio(), papeis: PAPEIS }) === false));
  t("o livro de lixo não lança", avaliarCondicao(["conheceu", "papel:informante"], { estado: { ...vazio(), factos: { pessoas: 7, lugares: null } }, papeis: PAPEIS }) === false);
  /* imutável: o estado e os papéis congelados passam, e saem iguais */
  const C = congelar(cheio());
  const P = congelar(JSON.parse(J(PAPEIS)));
  const fotoC = J(C), fotoP = J(P);
  let lancou = false;
  try { for (const c of Object.values(VERDADE)) julgarEtapa({ conclui: c }, { estado: C, papeis: P }); resolverPapeis(P, C); } catch { lancou = true; }
  t("estado e papéis congelados: nada lança, e nada muda", !lancou && J(C) === fotoC && J(P) === fotoP);
  /* determinismo e a invariante, sobre árvores geradas por semente */
  let s = 20261108;
  const sorte = () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; };
  const um = (xs) => xs[Math.floor(sorte() * xs.length)];
  const folhas = [...Object.values(VERDADE), ["conversou", "papel:informante", 3], ["afeicao", "papel:protegido", 4], ["dia", 99], ["morto", "papel:protegido"], ["conversou", "papel:fantasma"], ["entregou", "item:carta", "papel:protegido"]];
  const arvore = (prof) => {
    if (prof > 3 || sorte() < 0.4) return um(folhas);
    const comb = um(Object.keys(COMBINADORES));
    const n = 1 + Math.floor(sorte() * 3);
    const ramos = Array.from({ length: n }, () => arvore(prof + 1));
    return comb === "pelo_menos" ? [comb, 1 + Math.floor(sorte() * n), ...ramos] : [comb, ...ramos];
  };
  const estados = [vazio(), cheio(), { ...cheio(), baseMundo: matar(null, "Lia") }, { ...vazio(), factos: doCronista(vazio(), { falouCom: ["Teodoro"] }) }];
  let quebras = 0, mudou = 0, casos = 0;
  for (let i = 0; i < 400; i++) {
    const c = arvore(0);
    const e = estados[i % estados.length];
    const a = julgarEtapa({ conclui: c }, { estado: e, papeis: PAPEIS });
    const b = julgarEtapa({ conclui: c }, { estado: JSON.parse(J(e)), papeis: JSON.parse(J(PAPEIS)) });
    casos++;
    if (a.feita !== (a.falta.length === 0) || a.feita !== avaliarCondicao(c, { estado: e, papeis: PAPEIS })) quebras++;
    if (J(a) !== J(b)) mudou++;
  }
  t(`a invariante em ${casos} árvores geradas: feita ⇔ falta vazia ⇔ avaliarCondicao`, quebras === 0, `${quebras} quebras`);
  t("determinístico: a mesma condição e o mesmo estado (copiado) dão o mesmo julgamento", mudou === 0, `${mudou} diferentes`);
}

sec("§9 os três pressupostos (Fase TE · TE2)");
{
  const comVilao = (v, extra) => ({ ...vazio(), espinha: { fio: { vilao: v } }, ...extra });
  const V = (camada, extra) => ({ arquetipo: ARQUETIPOS[0].id, camada, ...extra });
  const camadas = FASES.map((f) => f.id);
  const ok = (c) => validarCondicao(c, PAPEIS).ok;
  /* a camada: a ordem das FASES, e nada sem registo */
  t("camada: sem espinha, sem vilão, com arquétipo que não existe — nada fecha",
    !avaliarCondicao(["camada", "marca"], { estado: vazio() }) && !avaliarCondicao(["camada", "marca"], { estado: { ...vazio(), espinha: { fio: {} } } })
    && !avaliarCondicao(["camada", "marca"], { estado: comVilao({ arquetipo: "nao_existe", camada: "queda" }) }));
  t("camada: o rosto já passou a marca e a mão, e ainda não chegou à guerra",
    ["marca", "mao", "rosto"].every((c) => avaliarCondicao(["camada", c], { estado: comVilao(V("rosto")) })) && !avaliarCondicao(["camada", "guerra"], { estado: comVilao(V("rosto")) }));
  t("camada: o veto — «antes do rosto» vale na mão e cai no rosto",
    avaliarCondicao(["nenhum", ["camada", "rosto"]], { estado: comVilao(V("mao")) }) && !avaliarCondicao(["nenhum", ["camada", "rosto"]], { estado: comVilao(V("rosto")) }));
  /* a leitura crua bate com a do plano (o registo garantido), camada a camada */
  const registos = [V("rumor"), V("marca"), V("guerra"), V("queda"), V("torta"), { arquetipo: "nao_existe", camada: "rosto" }, null, 7];
  let difere = 0;
  for (const r of registos) {
    const g = garantirRegistroDoVilao(r);
    for (const c of camadas.slice(1)) {
      const doPlano = !!g && camadas.indexOf(g.camada) >= camadas.indexOf(c);
      if (doPlano !== avaliarCondicao(["camada", c], { estado: comVilao(r) })) difere++;
    }
  }
  t("a leitura crua da camada é a de garantirRegistroDoVilao, em todos os registos e camadas (a torta é o rumor)", difere === 0, `${difere} diferenças`);
  t("camada: o rumor não se pede (é sempre verdade), e a camada que não existe também não",
    !ok(["camada", "rumor"]) && !ok(["camada", "trono"]) && ok(["camada", "queda"]) && !ok(["camada"]));
  const fc = julgarEtapa({ conclui: ["camada", "rosto"] }, { estado: comVilao(V("mao")) });
  t("camada: o «o que falta» diz o mundo, nunca o nome da camada", !fc.feita && fc.falta[0].texto === "ver-lhe a cara" && !/rosto|camada/.test(fc.falta[0].texto), J(fc));
  t("e a frase do veto também", julgarEtapa({ conclui: ["nenhum", ["camada", "mao"]] }, { estado: comVilao(V("rosto")) }).falta[0].texto === "antes de dar de caras com a gente dele");
  t("camada: toda camada que se pede tem a sua frase de mundo", CONDICOES.camada.args[0].de.every((c) => typeof CONDICOES.camada.args[0].diz[c] === "string"));
  t("camada: uma vez lá, não volta (volta: false) — o veto já cumprido é impossível",
    julgarEtapa({ conclui: ["nenhum", ["camada", "marca"]] }, { estado: comVilao(V("mao")) }).falta[0].impossivel === true);
  /* o nome: a conta de sabeONome, nos dois sítios onde mora */
  const saberNome = chegouAteEle([], { o: "o nome do herói, da boca de quem ele poupou", fonte: "viu", dia: 3, sobre: "nome" });
  const saberOnde = chegouAteEle([], { o: "o forasteiro passou por Alto do Sal", fonte: "marca", dia: 3, sobre: "onde" });
  const casos = [
    [V("mao", { nomeDoHeroi: { dia: 2, fonte: "viu" } }), []],
    [V("mao"), saberNome],
    [V("mao"), saberOnde],
    [V("mao"), []],
    [null, saberNome],
    [{ arquetipo: "nao_existe", nomeDoHeroi: { dia: 1 } }, []],
  ];
  const esperado = casos.map(([r, sb]) => sabeONome(garantirRegistroDoVilao(r), sb));
  const lido = casos.map(([r, sb]) => avaliarCondicao(["sabe_nome"], { estado: comVilao(r, { saber: sb }) }));
  t("sabe_nome é sabeONome: o registo que o guardou, ou a linha «nome» no livro dele (e a «onde» não ensina o nome)", J(lido) === J(esperado) && J(esperado) === J([true, true, false, false, true, false]), J({ lido, esperado }));
  t("sabe_nome não leva argumentos", ok(["sabe_nome"]) && !ok(["sabe_nome", "papel:tenente"]));
  t("sabe_nome: o «o que falta» é de mundo", julgarEtapa({ conclui: ["sabe_nome"] }, { estado: vazio() }).falta[0].texto === "que ele saiba o teu nome");
  /* a convivência: os vistos do elenco, e quem vem de antes passa logo */
  const NPCS2 = { ...NPCS, Lia: { ...NPCS.Lia, conhecidoEm: 0 } };
  const vistaEm = (d) => ({ ...vazio(), npcs: NPCS2, elenco: registrarVisto(null, "Lia", d) });
  t("convivência: vista no dia 5, no dia 6 faz um dia — três ainda faltam, e a falta conta (1 de 3)",
    !avaliarCondicao(["convivencia", "papel:protegido", 3], { estado: { ...vistaEm(5), dia: 6 }, papeis: PAPEIS })
    && julgarEtapa({ conclui: ["convivencia", "papel:protegido", 3] }, { estado: { ...vistaEm(5), dia: 6 }, papeis: PAPEIS }).falta[0].texto === "fazer estrada com Lia (1 de 3)");
  t("no dia 8 já são três", avaliarCondicao(["convivencia", "papel:protegido", 3], { estado: { ...vistaEm(5), dia: 8 }, papeis: PAPEIS }));
  t("o primeiro dia visto conta, não o último (vista nos dias 5, 6 e 7: no 8 são três)",
    avaliarCondicao(["convivencia", "papel:protegido", 3], { estado: { ...vazio(), npcs: NPCS2, dia: 8, elenco: registrarVisto(registrarVisto(registrarVisto(null, "Lia", 7), "Lia", 6), "Lia", 5) }, papeis: PAPEIS }));
  t("o «conhecidoEm: 0» que o registo dá a quem cria às pressas não é um passado partilhado",
    !avaliarCondicao(["convivencia", "papel:protegido", 1], { estado: { ...vazio(), npcs: NPCS2, dia: 30 }, papeis: PAPEIS }));
  t("o conhecidoEm de um dia de verdade conta (o registo, quando a narração ainda não a nomeou)",
    avaliarCondicao(["convivencia", "papel:protegido", 3], { estado: { ...vazio(), dia: 4 }, papeis: PAPEIS }));
  const deAntes = { ...NPCS2, Lia: { ...NPCS2.Lia, laco: { tipo: "amizade", forca: 3, desde: -400 } } };
  t("quem o herói conhece de antes da campanha (lacoDeAntes) passa logo, no dia 1, sem vistos",
    avaliarCondicao(["convivencia", "papel:protegido", 9], { estado: { ...vazio(), npcs: deAntes, dia: 1 }, papeis: PAPEIS }));
  t("convivência: o teto é um dia a menos que os vistos que o elenco guarda (a conta nunca mente)",
    CONDICOES.convivencia.args[1].max === VISTOS.porPessoa - 1 && ok(["convivencia", "papel:protegido", VISTOS.porPessoa - 1]) && !ok(["convivencia", "papel:protegido", VISTOS.porPessoa]));
  t("convivência: sem o número, três dias (a omissão da tabela)", CONDICOES.convivencia.args[1].omissao === 3
    && !avaliarCondicao(["convivencia", "papel:protegido"], { estado: { ...vistaEm(5), dia: 7 }, papeis: PAPEIS }) && avaliarCondicao(["convivencia", "papel:protegido"], { estado: { ...vistaEm(5), dia: 8 }, papeis: PAPEIS }));
  t("convivência: o papel é gente — o lugar não serve", !ok(["convivencia", "lugar:covil", 3]));
  t("os três, no estado de lixo, não fecham nem lançam",
    [{ espinha: 7 }, { espinha: { fio: { vilao: "x" } } }, { elenco: 3, saber: "x" }, { npcs: null }].every((e) => ["camada", "sabe_nome", "convivencia"].every((k) => avaliarCondicao(VERDADE[k], { estado: e, papeis: PAPEIS }) === false)));
  const congelado = congelar(cheio());
  const foto = J(congelado);
  t("e não mudam o estado (congelado, sai igual)", ["camada", "sabe_nome", "convivencia"].every((k) => avaliarCondicao(VERDADE[k], { estado: congelado, papeis: PAPEIS })) && J(congelado) === foto);
  t("o elenco que a narração escreveu é o do save (garantirElencoDoSave lê-o igual)", J(garantirElencoDoSave(cheio().elenco).vistos.Lia) === J([2]));
}

console.log(`\nBQ3 · as condições da quest: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
