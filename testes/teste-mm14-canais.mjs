/* teste-mm14-canais.mjs (Fase MM · MM14, os canais) — a lista antiga vira missões

   Dois canais do App fechavam trabalho só pelo TÍTULO, sem conferir nada:
   o Narrador (`quest_atualizar`) e o Cronista (`missoes.concluidas`). Eram a
   única via de fechar o que vive na lista antiga (`quests`): os fios de
   história do descanso longo e os contratos do mural de antes da v9.27. A
   decisão (opção a): primeiro converter os dois em missões do sistema, que se
   conferem; só depois tirar os canais. As seções 1-6 provam a primeira
   metade (o motor puro); a seção 7 prova a segunda — que o App.jsx está
   ligado e que os dois canais já não fecham nada.

     1. as tabelas;
     2. O PAGAMENTO É O MESMO — contrato a contrato, numa varredura com o
        gerador do mural antigo (a fórmula de contratos.js até à v9.36):
        moedas, XP, fé, heroísmo e `contratosConcluidos`, antes e depois;
     3. um save antigo feito à mão, com fios e contratos ativos, migra e fecha
        pelas etapas — e não pela menção;
     4. a migração é idempotente e não muda o formato de campo nenhum;
     5. NENHUMA TAREFA FICA SEM FORMA DE FECHAR — os fios que o descanso
        sorteia, com e sem o `quem`/`ondes` novos, em 24 mundos;
     6. lixo, null e a imutabilidade;
     7. a fiação — App.jsx: o import, a migração no load, o fio do descanso
        nascendo missão, a paga no fecho, e os dois canais idos de vez.

   O `Math.random` dos ganchos (geradores.js) é trocado por um gerador
   semeado durante a varredura 5, e devolvido no fim: nenhuma asserção
   depende da sorte. */
import fs from "node:fs";
import * as TA from "../src/tarefas-antigas.js";
import { conferir, garantirMissoes, etapaDef, moradaDe } from "../src/missoes.js";
import { gerarQuestDeArco, ctxMundo } from "../src/geradores.js";
import { gerarGeografia, rngDe } from "../src/geografia.js";
import { MOLDES } from "../src/moldes.js";
import { generosDisponiveis } from "../src/nomes.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/* os mundos da MM13 */
const MUNDOS = [];
for (const g of generosDisponiveis()) for (const Mo of MOLDES) {
  const semente = `Sonda MM13|${g}|${Mo.id}`;
  const mapa = gerarGeografia(semente, Mo);
  MUNDOS.push({ semente, genero: g, molde: Mo, mapa, cidadeAtual: mapa.cidades[0].nome, nivel: 3, dia: 5 });
}
const W = MUNDOS[0];
const [C1, C2] = W.mapa.cidades.map((c) => c.nome);

/* O herói FAZ a etapa: o estado do mundo que a cumpre, por tipo. É o mesmo
   critério das etapas (estar no lugar, estar com a pessoa, a coisa
   acontecer) — nenhum atalho. */
const mundoQueCumpre = (e, w) => {
  const md = moradaDe(e.onde || e.alvo || "");
  const cidadeDaChave = String(e.chave || "").includes("|") ? String(e.chave).split("|")[0] : "";
  const base = { npcs: {}, revelados: [], derrotados: [], inventario: [], equipamento: [], relogios: [], dia: w.dia, cidadeAtual: w.cidadeAtual, lugarAtual: null };
  if (e.tipo === "ir_a") return e.lugar ? { ...base, lugarAtual: { nome: e.alvo } } : { ...base, cidadeAtual: e.alvo };
  if (e.tipo === "falar_com") {
    const cid = w.mapa.cidades.some((c) => c.nome === md.lugar) ? md.lugar : (md.cidade || w.cidadeAtual);
    return { ...base, cidadeAtual: cid, lugarAtual: cid === md.lugar ? null : { nome: md.lugar, cidade: cid }, npcs: { x: { nome: e.alvo, conhecidoEm: 1 } } };
  }
  if (e.tipo === "resgatar") return { ...base, lugarAtual: { nome: e.onde, cidade: w.cidadeAtual }, npcs: { x: { nome: e.alvo, conhecidoEm: 1 } } };
  if (e.tipo === "revelar") return { ...base, cidadeAtual: cidadeDaChave || w.cidadeAtual, lugarAtual: { nome: e.alvo, cidade: cidadeDaChave || w.cidadeAtual }, revelados: [e.chave] };
  if (e.tipo === "derrotar") return { ...base, derrotados: Array(e.quantos || 1).fill(e.alvo) };
  if (e.tipo === "aguentar") return { ...base, dia: 999 };
  return base;
};
const jogar = (m, w, voltas = 6) => {
  let ms = [m];
  for (let i = 0; i < voltas && ms[0].status === "ativa"; i++) {
    const e = ms[0].etapas.find((x) => !x.feito);
    if (!e) break;
    ms = conferir(ms, mundoQueCumpre(e, w)).missoes;
  }
  return ms[0];
};
/* o mundo da MENÇÃO: todo nome no registo, todo lugar revelado, e o herói
   na cidade de partida, no meio da rua */
const mundoDaMencao = (m, w) => ({
  cidadeAtual: w.cidadeAtual, lugarAtual: { nome: "um beco qualquer", cidade: w.cidadeAtual },
  npcs: Object.fromEntries(m.etapas.map((e, i) => [`n${i}`, { nome: e.alvo, conhecidoEm: 1, local: "longe daqui" }])),
  revelados: m.etapas.map((e) => e.chave).filter(Boolean), derrotados: [], inventario: [], equipamento: [], relogios: [], dia: w.dia,
});

/* ============================================================ */
sec("1. as tabelas");
{
  const P = TA.PAGA_DA_LISTA_ANTIGA;
  /* os números que a lista antiga pagava, lidos de App.jsx em v9.336:
     `ganharFe(x.tipo === "principal" ? 150 : 40, 2, …)` e
     `ganharHeroismo(p, "missao")`. A tabela é o espelho; se o App mudar
     antes de os canais saírem, é aqui que se nota. */
  t("a fé da lista antiga: 150 a principal, 40 as outras, 2 de PF", P.feDaPrincipal === 150 && P.feDasOutras === 40 && P.pfDaFe === 2);
  t("e um ponto de heroísmo de missão", P.heroismo === "missao");
  t("a marca da migração é um valor de status que ninguém lê como ativo", TA.MARCA_DA_MIGRACAO !== "ativa" && typeof TA.MARCA_DA_MIGRACAO === "string");
  t("os seis contratos do mural antigo têm forma", TA.CONTRATOS_ANTIGOS.length === 6 && TA.CONTRATOS_ANTIGOS.every((c) => c.rx instanceof RegExp && c.etapa));
  t("toda etapa que a conversão escreve é do vocabulário que o motor confere",
    TA.CONTRATOS_ANTIGOS.every((c) => typeof etapaDef(c.etapa).ver === "function" && etapaDef(c.etapa).id === c.etapa));
}

/* ============================================================
   2. O PAGAMENTO — o gerador do mural antigo, semeado
   (contratos.js até à v9.36: moedas = 15 + nível×5 + d15, xp = 20 + nível×4 + d10,
   e os ajustes de cada tipo)
   ============================================================ */
const contratoAntigo = (tipo, nivel, rnd, w) => {
  const d = (n) => Math.floor(rnd() * n);
  const moedas = 15 + nivel * 5 + d(15), xp = 20 + nivel * 4 + d(10);
  const destino = w.mapa.cidades[1 + d(Math.max(1, w.mapa.cidades.length - 1))] || w.mapa.cidades[0];
  const bicho = ["Lobo Cinzento", "Aranha das Cavernas", "Carniçal", "Javali Raivoso"][d(4)];
  const quem = ["Ilda Moura", "Bento", "Sabela do Rio"][d(3)];
  const forma = {
    caca: { titulo: `Caça: ${bicho}`, descricao: `Um(a) ${bicho} tem atacado na floresta próxima. Elimine a ameaça.`, recompensa: { moedas, xp } },
    limpeza: { titulo: "Limpeza nas colinas ao norte", descricao: `Um bando de ${bicho} infestou o lugar. Varra a infestação.`, recompensa: { moedas: moedas + 10, xp: xp + 10 } },
    escolta: { titulo: `Escolta de ${quem}`, descricao: `${quem} precisa chegar a salvo a ${destino.nome}. Proteja a viagem.`, recompensa: { moedas, xp } },
    entrega: { titulo: `Entrega para ${destino.nome}`, descricao: `Leve um pacote lacrado até ${destino.nome}. Sem abrir, sem perguntas.`, recompensa: { moedas: moedas - 5, xp } },
    resgate: { titulo: `Resgate de ${quem}`, descricao: `${quem} desapareceu nas ruínas vizinhas. Traga de volta — de preferência vivo(a).`, recompensa: { moedas: moedas + 15, xp: xp + 10 } },
    coleta: { titulo: "Coleta rara", descricao: "Encontre e traga uma erva rara de flor azul.", recompensa: { moedas, xp } },
  }[tipo];
  /* a forma exata com que o App de então a guardava na lista antiga */
  return { titulo: forma.titulo, descricao: forma.descricao, tipo: "secundaria", status: "ativa", nota: "", contrato: forma.recompensa };
};
sec("2. o pagamento, contrato a contrato");
{
  let n = 0, diferentes = 0, presas = 0, porMencao = 0;
  const ex = [], exPresa = [], exMencao = [];
  for (const w of MUNDOS) {
    const rnd = rngDe(`${w.semente}|contratos`);
    for (const tipo of ["caca", "limpeza", "escolta", "entrega", "resgate", "coleta"]) {
      for (const nivel of [1, 4, 9, 15]) {
        const q = contratoAntigo(tipo, nivel, rnd, w);
        const m = TA.tarefaParaMissao(q, w);
        for (const despertar of [false, true]) {
          n++;
          const antes = TA.pagaDaTarefaAntiga(q, { despertar });
          const depois = TA.pagaDoFecho(m, { despertar });
          if (!igual(antes, depois)) { diferentes++; if (ex.length < 3) ex.push(`${q.titulo}: ${JSON.stringify(antes)} ≠ ${JSON.stringify(depois)}`); }
        }
        /* e a missão paga pelo caminho do App (`conferirAsMissoes` lê
           `m.recompensa`): as moedas e o XP do papel, e nenhum item */
        if (!(m.recompensa.moedas === q.contrato.moedas && m.recompensa.xp === q.contrato.xp && !m.recompensa.item)) { diferentes++; if (ex.length < 3) ex.push(`${q.titulo}: recompensa ${JSON.stringify(m.recompensa)}`); }
        const jogada = jogar(m, w);
        if (jogada.status !== "concluida") { presas++; if (exPresa.length < 3) exPresa.push(`${q.titulo}: ${JSON.stringify(m.etapas)}`); }
        if (conferir([m], mundoDaMencao(m, w)).concluidas.length) { porMencao++; if (exMencao.length < 3) exMencao.push(q.titulo); }
      }
    }
  }
  console.log(`       ${n} pagamentos comparados · ${diferentes} diferentes · contratos que não fecham jogados: ${presas} · que fecham por menção: ${porMencao}`);
  t(`o contrato paga exatamente o que pagava — moedas, XP, fé, heroísmo e a conta (${n - diferentes}/${n})`, diferentes === 0, ex.join(" | "));
  t("todo contrato fecha quando se faz o que ele pede", presas === 0, exPresa.join(" | "));
  t("e nenhum fecha por menção", porMencao === 0, exMencao.join(" | "));
  /* e o fio: a lista antiga não lhe pagava moeda nem XP; a fé e o
     heroísmo continuam iguais, e a conta de contratos passa a somar-lhe,
     como a toda missão (dito, não escondido) */
  const fio = { titulo: `O pedido de Mira`, descricao: "x", objetivo: `Encontrar Mira em ${C2} e ouvir o pedido completo`, tipo: "secundaria", status: "ativa", nota: "" };
  const a = TA.pagaDaTarefaAntiga(fio, { despertar: true }), b = TA.pagaDoFecho(TA.tarefaParaMissao(fio, W), { despertar: true });
  t("o fio paga a mesma fé e o mesmo heroísmo", igual(a.fe, b.fe) && a.heroismo === b.heroismo);
  t("a principal antiga paga a fé de principal", TA.pagaDoFecho(TA.tarefaParaMissao({ ...fio, tipo: "principal" }, W), { despertar: true }).fe.fieis === 150);
  t("uma missão que não veio da lista antiga não paga fé nem heroísmo a mais", (() => { const p = TA.pagaDoFecho({ recompensa: { moedas: 5, xp: 7 } }, { despertar: true }); return p.fe === null && p.heroismo === null; })());
}

/* ============================================================ */
sec("3. um save antigo, feito à mão");
{
  const save = {
    quests: [
      { titulo: "O pedido de Mira", descricao: "Mira, humana mulher, tecelã (desconfiada), procura ajuda: um parente sumiu na estrada.", objetivo: `Encontrar Mira em ${C2} e ouvir o pedido completo`, tipo: "secundaria", status: "ativa", nota: "", sorteada: true },
      { titulo: "Boato de taverna", descricao: `Em ${C1}, todos comentam: um poço secou do dia para a noite.`, objetivo: `Investigar o boato em ${C1} e descobrir o que há de verdade nele`, tipo: "secundaria", status: "ativa", nota: "", sorteada: true },
      { titulo: `Entre ${C1} e ${C2}`, descricao: "Algo azedou a relação entre os dois lugares.", objetivo: `Viajar entre ${C1} e ${C2}, apurar a verdade e impedir (ou escolher) um lado`, tipo: "secundaria", status: "ativa", nota: "", sorteada: true },
      { titulo: "Caça: Lobo Cinzento", descricao: "Um(a) Lobo Cinzento tem atacado na floresta próxima. Elimine a ameaça.", tipo: "secundaria", status: "ativa", nota: "", contrato: { moedas: 31, xp: 38 } },
      { titulo: "Resgate de Bento", descricao: "Bento desapareceu nas ruínas vizinhas.", tipo: "secundaria", status: "ativa", nota: "", contrato: { moedas: 51, xp: 48 } },
      { titulo: "A que já acabou", descricao: "x", tipo: "secundaria", status: "concluida", nota: "" },
      { titulo: "A que falhou", descricao: "y", tipo: "secundaria", status: "falhada", nota: "", contrato: { moedas: 9, xp: 9 } },
    ],
    missoes: [{ id: "mis_principal", titulo: "O rasto de alguém", tipo: "principal", status: "ativa", etapas: [{ tipo: "ir_a", alvo: C2 }] }],
  };
  const antesQuests = JSON.stringify(save.quests), antesMissoes = JSON.stringify(save.missoes);
  const r = TA.migrarTarefasAntigas(save.quests, save.missoes, W);
  t("as cinco ativas migram", r.migradas.length === 5 && r.novas.length === 5);
  t("a concluída e a falhada ficam como estão", igual(r.quests[5], save.quests[5]) && igual(r.quests[6], save.quests[6]));
  t("as ativas ficam marcadas — e só o status muda", r.quests.slice(0, 5).every((q, i) => q.status === TA.MARCA_DA_MIGRACAO && igual({ ...q, status: "ativa" }, save.quests[i])));
  t("a missão que já existia fica igual, à frente", igual(r.missoes[0], garantirMissoes(save.missoes)[0]));
  t("nenhuma ativa sobra na lista antiga (os canais não têm o que fechar)", !r.quests.some((q) => q.status === "ativa"));
  t("o save recebido não foi mutado", JSON.stringify(save.quests) === antesQuests && JSON.stringify(save.missoes) === antesMissoes);
  const porMencao = r.novas.filter((m) => conferir([m], mundoDaMencao(m, W)).concluidas.length);
  t("nenhuma fecha por menção", porMencao.length === 0, porMencao.map((m) => m.titulo).join(", "));
  const naoFecham = r.novas.filter((m) => jogar(m, W).status !== "concluida");
  t("e todas fecham pelas etapas, jogadas", naoFecham.length === 0, naoFecham.map((m) => `${m.titulo}: ${JSON.stringify(m.etapas)}`).join(" | "));
  const mira = r.novas.find((m) => m.titulo === "O pedido de Mira");
  /* num lugar da cidade dela, com a cidade dita: a cidade só fechava no
     primeiro turno em que o Narrador a nomeasse (secção 5 mede-o) */
  t("o fio com pessoa pede encontrá-la num lugar da cidade dela", mira.etapas.some((e) => e.tipo === "falar_com" && e.alvo === "Mira" && moradaDe(e.onde).cidade === C2 && !!moradaDe(e.onde).lugar));
  const entre = r.novas.find((m) => m.titulo.startsWith("Entre "));
  t("o fio de duas cidades passa pela primeira", entre.etapas[0].tipo === "ir_a" && entre.etapas[0].alvo === C1);
  const boato = r.novas.find((m) => m.titulo === "Boato de taverna");
  t("o fio sem alvo ganha um lugar do mundo, com a chave da base", boato.etapas[0].tipo === "revelar" && /\|/.test(boato.etapas[0].chave || ""));
  const lobo = r.novas.find((m) => m.titulo.startsWith("Caça"));
  t("a caça tem endereço (um ermo), para a presa aparecer", lobo.etapas[0].tipo === "derrotar" && !!lobo.etapas[0].onde);
  t("todas vêm marcadas como da lista antiga", r.novas.every((m) => m.veiculo === TA.VEICULO_DA_TAREFA_ANTIGA));
}

/* ============================================================ */
sec("4. idempotência e o formato do save");
{
  const quests = [
    { titulo: "O pedido de Mira", descricao: "x", objetivo: `Encontrar Mira em ${C2}`, tipo: "secundaria", status: "ativa", nota: "" },
    { titulo: "Caça: Lobo Cinzento", descricao: "y", tipo: "secundaria", status: "ativa", nota: "", contrato: { moedas: 31, xp: 38 } },
  ];
  const r1 = TA.migrarTarefasAntigas(quests, [], W);
  /* carregar → gravar (JSON) → carregar */
  const gravado = JSON.parse(JSON.stringify({ quests: r1.quests, missoes: r1.missoes }));
  const r2 = TA.migrarTarefasAntigas(gravado.quests, gravado.missoes, W);
  const r3 = TA.migrarTarefasAntigas(r2.quests, r2.missoes, W);
  t("carregar duas vezes não migra de novo", r2.migradas.length === 0 && r3.migradas.length === 0);
  t("nem duplica missão", r3.missoes.length === r1.missoes.length && new Set(r3.missoes.map((m) => m.id)).size === r3.missoes.length);
  t("e a lista antiga fica igual", igual(r3.quests, r1.quests));
  /* uma tarefa "ativa" de novo (um save antigo que regressou) com a missão já
     lá: marca-se, mas não se duplica */
  const regressou = TA.migrarTarefasAntigas(quests, r1.missoes, W);
  t("se a missão já existe, a tarefa só é marcada", regressou.novas.length === 0 && regressou.migradas.length === 2 && regressou.missoes.length === r1.missoes.length);
  t("o mesmo título dá sempre o mesmo id", TA.idDaTarefa(quests[0]) === TA.idDaTarefa({ ...quests[0], descricao: "outra" }));
  /* O GÉMEO DA v9.27: o load de um save sem `missoes` copiou cada tarefa
     ativa para uma missão de legado que nunca se cumpre (aguentar até ao
     dia 999999), e deixou a tarefa ativa também. Réplica dessa missão: */
  const gemeo = { id: "m_abc123", titulo: "Caça: Lobo Cinzento", tipo: "favor", status: "ativa", legado: true, criadaEm: 2,
    etapas: [{ tipo: "aguentar", dia: 999999, rotulo: "Caça: Lobo Cinzento", feito: false }], recompensa: { moedas: 40, xp: 60, item: null, fama: 3 } };
  const rg = TA.migrarTarefasAntigas(quests, [gemeo], W);
  const trocado = rg.missoes.find((m) => m.id === "m_abc123");
  t("o gémeo de legado da v9.27 é trocado pela missão que se confere, com o mesmo id", !!trocado && !trocado.legado && trocado.etapas[0].tipo === "derrotar" && trocado.criadaEm === 2);
  t("e paga o que o contrato dizia, não o palpite de então", trocado.recompensa.moedas === 31 && trocado.recompensa.xp === 38);
  t("e não se duplica", rg.missoes.filter((m) => m.titulo === "Caça: Lobo Cinzento").length === 1);
  const real = { ...gemeo, legado: false, etapas: [{ tipo: "derrotar", alvo: "Lobo Cinzento", quantos: 1 }] };
  const rr = TA.migrarTarefasAntigas(quests, [real], W);
  t("uma missão de verdade com o mesmo título fica como está (a tarefa só se marca)", igual(rr.missoes.find((m) => m.id === "m_abc123"), garantirMissoes([real])[0]) && rr.quests[1].status === TA.MARCA_DA_MIGRACAO);
  t("a mesma migração em duas máquinas é igual (semente)", igual(TA.migrarTarefasAntigas(quests, [], W), TA.migrarTarefasAntigas(quests, [], W)));
  t("as missões migradas estão no formato do campo `missoes` (a catraca não as muda)", igual(garantirMissoes(r1.missoes), r1.missoes));
  t("a tarefa antiga mantém as mesmas chaves", r1.quests.every((q, i) => igual(Object.keys(q).sort(), Object.keys(quests[i]).sort())));
}

/* ============================================================ */
sec("5. nenhuma tarefa fica sem forma de fechar — os fios do descanso");
{
  const aleatorio = Math.random;
  let n = 0, presas = 0, porMencao = 0, semAlvo = 0, comQuem = 0;
  const exPresa = [], exMencao = [];
  try {
    MUNDOS.forEach((w, wi) => {
      Math.random = rngDe(`${w.semente}|fios`);
      const ctx = ctxMundo({ mundo: { genero: w.genero }, mapa: w.mapa, dia: w.dia });
      for (const fase of ["abertura", "meio", "climax"]) {
        for (let k = 0; k < 8; k++) {
          const q0 = gerarQuestDeArco(ctx, fase);
          /* o fio como nasce agora (com quem/ondes) e como está nos saves
             antigos (só texto) — os dois têm de fechar */
          for (const q of [q0, { titulo: q0.titulo, descricao: q0.descricao, objetivo: q0.objetivo }]) {
            const m = TA.tarefaParaMissao({ ...q, tipo: "secundaria", status: "ativa", nota: "", sorteada: true }, w);
            n++;
            if (!m || !m.etapas.length || m.etapas.some((e) => e.tipo !== "aguentar" && !e.alvo)) { semAlvo++; continue; }
            if (m.etapas.some((e) => e.tipo === "falar_com")) comQuem++;
            if (jogar(m, w).status !== "concluida") { presas++; if (exPresa.length < 3) exPresa.push(`${wi}/${q.titulo}: ${JSON.stringify(m.etapas)}`); }
            if (conferir([m], mundoDaMencao(m, w)).concluidas.length) { porMencao++; if (exMencao.length < 3) exMencao.push(q.titulo); }
          }
        }
      }
    });
  } finally { Math.random = aleatorio; }
  console.log(`       ${n} fios convertidos · ${comQuem} pedem uma pessoa · sem alvo ${semAlvo} · que não fecham jogados ${presas} · que fecham por menção ${porMencao}`);
  t(`todo fio ganha um alvo concreto (${n - semAlvo}/${n})`, semAlvo === 0);
  t(`todo fio fecha quando se faz o que ele pede (${n - presas}/${n})`, presas === 0, exPresa.join(" | "));
  t(`e nenhum fecha por menção (${porMencao})`, porMencao === 0, exMencao.join(" | "));
  t("os fios com pessoa são a maioria dos que a nomeiam", comQuem > 0);
  t("o fio nasce com quem e onde", (() => { const a = Math.random; Math.random = rngDe("x"); try { const q = gerarQuestDeArco(ctxMundo({ mundo: {}, mapa: W.mapa, dia: 1 }), "abertura"); return "quem" in q && Array.isArray(q.ondes); } finally { Math.random = a; } })());
}

/* ============================================================ */
sec("6. lixo, null e a imutabilidade");
{
  t("tarefaParaMissao de lixo é null", TA.tarefaParaMissao(null) === null && TA.tarefaParaMissao({}) === null && TA.tarefaParaMissao({ titulo: "  " }) === null);
  t("sem mundo nenhum, ainda fecha (a rede: um dia de espera)", (() => { const m = TA.tarefaParaMissao({ titulo: "Boato de taverna", objetivo: "Investigar" }, null); return !!m && m.etapas.length === 1 && jogar(m, { mapa: { cidades: [] }, dia: 1, cidadeAtual: "" }).status === "concluida"; })());
  t("migrar lixo não quebra", (() => { const r = TA.migrarTarefasAntigas(null, null, null); return Array.isArray(r.quests) && Array.isArray(r.missoes) && r.migradas.length === 0; })());
  t("migrar uma lista com buracos passa os buracos adiante", (() => { const r = TA.migrarTarefasAntigas([null, 3, { status: "ativa" }], [], W); return r.migradas.length === 0 && r.quests.length === 3; })());
  t("as pagas de lixo não quebram", igual(TA.pagaDaTarefaAntiga(null).moedas, 0) && TA.pagaDoFecho(undefined).moedas === 0);
  const q = { titulo: "Caça: Lobo Cinzento", descricao: "y", tipo: "secundaria", status: "ativa", nota: "", contrato: { moedas: 31, xp: 38 } };
  const antes = JSON.stringify(q);
  TA.tarefaParaMissao(q, W); TA.migrarTarefasAntigas([q], [], W);
  t("nada muta a tarefa que recebe", JSON.stringify(q) === antes);
}

/* ============================================================
   7. a fiação — App.jsx: o import, a migração no load, o fio do descanso
   nascendo missão, a paga no fecho, e os dois canais idos de vez.
   ============================================================ */
sec("7. a fiação — App.jsx");
{
  const app = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");

  /* ---- a) o import ---- */
  t("App.jsx importa as quatro peças de tarefas-antigas.js",
    app.includes('import { migrarTarefasAntigas, tarefaParaMissao, pagaDoFecho, VEICULO_DA_TAREFA_ANTIGA } from "./tarefas-antigas.js";'));

  /* ---- b) o mundo da conversão ---- */
  t("mundoDasTarefas existe, ao lado de mundoDasMissoes",
    app.includes('const mundoDasTarefas = () => ({ semente: sementeMundo(), mapa: mapaRef.current, cidadeAtual: cidadeAtualRef.current, genero: generoMundo(), molde: moldeMundo(), lex: (mundoAtual() || {}).lexico, nivel: ((personagemRef.current || personagem || {}).nivel) || 1, dia: diaRef.current });'));

  /* ---- c) a migração no load, ANTES de a tela fixar quests/missoes ---- */
  const iMigra = app.indexOf("const mg = migrarTarefasAntigas(questsRef.current, missoesRef.current, {");
  t("o load chama a migração", iMigra >= 0);
  t("lê a semente e o mundo do save que acabou de entrar (sv), não do estado antigo",
    app.includes('semente: `${nomeDaCampanha(sv) || "aventura"}|${mw.genero || ""}`,') && app.includes("cidadeAtual: sv.cidadeAtual || \"\","));
  t("os migrados substituem quests e missoes só se algo migrou",
    app.includes("if (mg.migradas.length) {") && app.includes("questsRef.current = mg.quests;") && app.includes("missoesRef.current = mg.missoes;"));
  t("a migração nunca custa o load", app.includes('catch (e) { calou("a migração das tarefas antigas", e); }'));
  const iFixaTela = app.indexOf("setMissoes(missoesRef.current);\n      setQuests([...questsRef.current]);\n      bancoNomesRef.current = gerarBancoNomes(sv.mundo);");
  t("e isso acontece ANTES de a tela fixar quests/missoes", iFixaTela >= 0 && iMigra >= 0 && iMigra < iFixaTela);

  /* ---- d) o descanso longo: o fio nasce missão, e o teto olha as missões ---- */
  t("a conta de secundárias ativas passou a olhar `missoes` (o fio não entra mais em `quests`)",
    app.includes('const secundarias = (missoesRef.current || []).filter((m) => m && m.status === "ativa" && m.veiculo === VEICULO_DA_TAREFA_ANTIGA && m.intencao !== "principal").length;'));
  t("o fio do descanso vira missão com tarefaParaMissao",
    app.includes('const mFio = tarefaParaMissao({ ...r.questNova, tipo: "secundaria", status: "ativa", nota: "", sorteada: true }, mundoDasTarefas());')
    && app.includes("missoesRef.current = [...(missoesRef.current || []), mFio];"));
  t("sem duplicar (confere o id antes de empurrar)", app.includes("!(missoesRef.current || []).some((x) => x.id === mFio.id)"));
  t("nunca custa o descanso", app.includes('catch (e) { calou("o fio do descanso", e); }'));
  t("e o fio NÃO entra mais na lista antiga (o push direto em questsRef sumiu)",
    !app.includes('questsRef.current = [...questsRef.current, { titulo: r.questNova.titulo, descricao: r.questNova.descricao'));
  t("o envelope para o Narrador e a linha do diário continuam de pé",
    app.includes('[QUEST GERADA PELO SISTEMA — fase "${ctx.fase}" do arco]') && app.includes("📜 Fio de história: ${r.questNova.titulo}"));

  /* ---- e) o fecho paga a fé e o heroísmo da lista antiga, sem repetir moeda/XP ---- */
  const iLinhas = app.indexOf("const linhas = [`${tipoMissao(m.tipo).icone} MISSÃO CONCLUÍDA:");
  const iPf = app.indexOf('const pf = pagaDoFecho(m, { despertar: !!(divindadeRef.current && divindadeRef.current.despertar) });');
  t("conferirAsMissoes chama pagaDoFecho logo depois de calcular a recompensa normal",
    iLinhas >= 0 && iPf >= 0 && iPf > iLinhas && iPf - iLinhas < 600);
  t("a fé do fecho usa ganharFe com o que pagaDoFecho devolveu",
    app.includes('if (pf.fe) linhas.push(...ganharFe(pf.fe.fieis, pf.fe.pf, "seu feito corre de boca em boca"));'));
  t("o heroísmo do fecho usa ganharHeroismo, e pers segue mutável no laço",
    app.includes('if (pf.heroismo) { const rh = ganharHeroismo(pers, pf.heroismo); pers = rh.pers; if (rh.msg) linhas.push(rh.msg); }'));
  t("nunca custa o fecho", app.includes('catch (e) { calou("a paga da tarefa antiga", e); }'));

  /* ---- f) os dois canais — idos de vez ---- */
  t("o Narrador não tem mais `quest_atualizar` fechando nada (o nome só sobrevive em comentário)",
    !app.includes("md2.quest_atualizar") && !app.includes("[].concat(md2.quest_atualizar"));
  t("e o pagamento de contrato por CÓDIGO do Narrador (recompensaContrato) sumiu",
    !app.includes("recompensaContrato"));
  t("evento_global_encerrar do Narrador continua de pé", app.includes("if (md2.evento_global_encerrar && eventosRef.current.global) {"));
  t("o Cronista não tem mais `casar` por título, nem `rm.concluidas`/`rm.falhadas`/`rm.progresso` fechando nada",
    !app.includes("const casar = (t) => {") && !app.includes("rm.concluidas") && !app.includes("rm.falhadas") && !app.includes("rm.progresso"));
  t("global_encerrado do Cronista continua de pé", app.includes("if (rm.global_encerrado === true && eventosRef.current && eventosRef.current.global) {"));
  t("o prompt do Cronista não promete mais concluidas/falhadas/progresso — só global_encerrado",
    app.includes(JSON.stringify('"missoes":{"global_encerrado":false}').slice(1, -1))
    && !app.includes(JSON.stringify('"missoes":{"concluidas"').slice(1, -1)));
  t("e não carrega mais a lista de MISSÕES ATIVAS no prompt do Cronista (ninguém casa por título)",
    !app.includes("MISSÕES ATIVAS:"));
}

console.log(`\nmm14-canais: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
