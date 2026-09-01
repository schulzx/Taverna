/* A ESPINHA (v9.129) — fase 1 do plano

   O mundo já nascia inteiro da semente; a história, não. Ela era o que o
   Narrador improvisava, e por isso era a única coisa da mesa que ninguém
   conseguia conferir — onde não há decisão tomada antes, quem decide é quem
   está falando na hora.

   O que esta suíte defende é o que faz a espinha valer alguma coisa:

   · que ela seja a MESMA para a mesma semente, senão "a história estava ali
     antes de você perguntar" é conversa;
   · que todo marco aponte para coisa que EXISTE no mundo — um marco que
     mande matar um bicho que não vive naquela região é a caçada dos três
     lobos em escala de campanha;
   · que nenhum marco se cumpra por PRESENÇA. Esta base acabou de consertar
     um resgate que fechava quando o herói chegava ao lugar; estender uma
     espinha inteira com o mesmo defeito seria repeti-lo trinta vezes.
   · e que o desfecho seja o último, com quem o mundo já prometeu. */

const S = "../src/";
const { readFileSync } = await import("node:fs");
const semCom = (x) => x.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
const APP = semCom(readFileSync("../src/App.jsx", "utf8"));

const { gerarGeografia } = await import(S + "geografia.js");
const { chefesDoMundo, locaisDaCidade, genteDoLocal, criaturasDaRegiao } = await import(S + "mundo-base.js");
const { estenderEspinha, garantirEspinha, conferirEspinha, marcosDoAto, marcoAtual, feitioDe, FEITIOS, linhaDoMarco, envelopeDaEspinha, progressoDoAto } = await import(S + "saga.js");
const { estruturaPorId, custoDaEtapa, pesoDe } = await import(S + "historia.js");
const { ETAPAS, etapaDef } = await import(S + "missoes.js");

let bons = 0, maus = 0;
const t = (nome, cond) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

const SEM = "O Decimo Portao";
const mapa = gerarGeografia(SEM, null, null);
const espinha = estenderEspinha({ semente: SEM, mapa, estrutura: "jornada", cidadeInicial: (mapa.cidades[0] || {}).nome });
const est = estruturaPorId("jornada");
const todos = espinha.atos.flatMap((a) => a.marcos);

sec("1. A MESMA SEMENTE, A MESMA HISTÓRIA");
{
  const b = estenderEspinha({ semente: SEM, mapa, estrutura: "jornada", cidadeInicial: (mapa.cidades[0] || {}).nome });
  t("estender duas vezes dá exatamente a mesma espinha", JSON.stringify(espinha) === JSON.stringify(b));
  const outra = estenderEspinha({ semente: "outro mundo", mapa: gerarGeografia("outro mundo", null, null), estrutura: "jornada" });
  t("e sementes diferentes dão espinhas diferentes", JSON.stringify(outra) !== JSON.stringify(espinha));
  /* a estrutura escolhida decide quantos atos: a espinha não tem forma própria,
     ela enche a forma que `historia.js` já tinha */
  t("um ato por momento da estrutura", espinha.atos.length === est.etapas.length);
  const mist = estenderEspinha({ semente: SEM, mapa, estrutura: "misterio" });
  t("outra estrutura, outro número de atos", mist.atos.length === estruturaPorId("misterio").etapas.length);
  t("a espinha nasce com marcos", todos.length > 10);
}

sec("2. NENHUM MARCO SE CUMPRE POR PRESENÇA");
{
  /* `ir_a` é a única etapa que se cumpre só de andar até lá. É por isso que
     ela não aparece em condição nenhuma daqui. */
  t("nenhuma condição é `ir_a`", todos.every((m) => m.condicao && m.condicao.tipo !== "ir_a"));
  t("toda condição usa um tipo que o motor confere", todos.every((m) => !!ETAPAS[m.condicao.tipo]));
  t("e todo tipo usado tem `ver`", todos.every((m) => typeof etapaDef(m.condicao.tipo).ver === "function"));
  /* a prova de que o `ver` de cada condição roda sem estourar num mundo vazio */
  const vazio = { cidadeAtual: "", lugarAtual: null, npcs: {}, derrotados: [], inventario: [], equipamento: [], revelados: [], dia: 1, relogios: [] };
  t("nenhuma condição quebra contra um mundo vazio", todos.every((m) => { try { etapaDef(m.condicao.tipo).ver(m.condicao, vazio); return true; } catch { return false; } }));
  t("e nenhuma se dá por cumprida nele", todos.every((m) => !etapaDef(m.condicao.tipo).ver(m.condicao, vazio)));
}

sec("3. A ESPINHA SÓ APONTA PARA O QUE EXISTE");
{
  const chefes = chefesDoMundo(SEM, mapa, "Fantasia medieval", null);
  const nomesCidade = new Set(mapa.cidades.map((c) => c.nome));
  const gente = new Set(), locais = new Set(), bichos = new Set();
  for (const c of mapa.cidades) {
    for (const l of locaisDaCidade(SEM, c, "Fantasia medieval", null, null)) {
      locais.add(l.nome);
      for (const p of genteDoLocal(SEM, l, "Fantasia medieval", null, null)) gente.add(p.nome);
    }
  }
  for (const r of mapa.regioes) for (const b of criaturasDaRegiao(SEM, r, "Fantasia medieval", null)) bichos.add(b.nome);
  const nomesChefe = new Set(chefes.flatMap((c) => [c.nome, c.nomeCurto]));

  const procurar = todos.filter((m) => m.feitio === "procurar");
  t(`as ${procurar.length} pessoas procuradas existem na base`, procurar.every((m) => gente.has(m.quem)));
  const descobrir = todos.filter((m) => m.feitio === "descobrir");
  t(`os ${descobrir.length} lugares a descobrir existem`, descobrir.every((m) => locais.has(m.onde)));
  const enfrentar = todos.filter((m) => m.feitio === "enfrentar");
  t(`os ${enfrentar.length} alvos de briga existem`, enfrentar.every((m) => bichos.has(m.alvo) || nomesChefe.has(m.alvo)));
  t("todo marco acontece num lugar nomeado", todos.every((m) => m.onde && (nomesCidade.has(m.onde) || locais.has(m.onde) || nomesChefe.has(m.alvo))));
  t("nenhum marco fica sem título", todos.every((m) => m.titulo && m.titulo.length > 2));
}

sec("4. O DESFECHO É O ÚLTIMO, E COM QUEM O MUNDO PROMETEU");
{
  const chefes = chefesDoMundo(SEM, mapa, "Fantasia medieval", null);
  const principal = chefes.find((c) => c.linha === "principal") || chefes[0];
  const ultimoAto = espinha.atos[espinha.atos.length - 1];
  const ultimo = ultimoAto.marcos[ultimoAto.marcos.length - 1];
  t("o último marco do último ato é o confronto", ultimo.feitio === "confronto");
  t("e ele é com o chefe principal do mundo", ultimo.alvo === principal.nome);
  t("a condição casa pelo nome curto, que é como o motor registra quem caiu", ultimo.condicao.alvo === (principal.nomeCurto || principal.nome));
  t("não há confronto em nenhum outro ato", espinha.atos.slice(0, -1).every((a) => a.marcos.every((m) => m.feitio !== "confronto")));
  /* a v9.129 nasceu com o confronto em PRIMEIRO lugar do ato, e o resto do
     ato acontecia depois do clímax */
  t("e nada acontece depois dele", ultimoAto.marcos.filter((m) => m.feitio === "confronto").length === 1);
}

sec("5. O ATO É DIMENSIONADO PELA CONTA DO PRÓPRIO ARCO");
{
  /* `custoDaEtapa` já dizia quanto peso cada momento precisa para virar. A
     espinha põe marcos até somar isso — é o que faz o arco virar quando os
     marcos do ato acabam, em vez de virar por acúmulo de acaso. */
  const pesos = espinha.atos.map((a) => a.marcos.reduce((s, m) => s + pesoDe(feitioDe(m.feitio).peso), 0));
  t("todo ato soma pelo menos o custo do seu momento", pesos.every((p, i) => p >= custoDaEtapa(est, i)));
  t("e nenhum ato passa muito do necessário", pesos.every((p, i) => p <= custoDaEtapa(est, i) + 4));
  t("os atos crescem em peso ao longo da campanha", pesos[pesos.length - 1] > pesos[0]);
}

sec("6. NADA DE FILA DA MESMA COISA");
{
  /* a primeira sonda abriu a campanha com três "encontrar fulano" em fila —
     três vezes a mesma cena não é um começo, é uma lista de chamada */
  let seguidos = 0;
  for (const a of espinha.atos) for (let i = 1; i < a.marcos.length; i++) if (a.marcos[i].feitio === a.marcos[i - 1].feitio) seguidos += 1;
  t("nenhum ato tem dois marcos iguais em sequência", seguidos === 0);
  const alvos = todos.map((m) => m.quem || m.alvo || m.onde);
  t("e ninguém carrega dois marcos", new Set(alvos).size === alvos.length);
}

sec("7. O MARCO CAI PELO FATO, E SÓ UMA VEZ");
{
  const ver = (cond, m) => etapaDef(cond.tipo).ver(cond, m);
  const primeiro = marcoAtual(espinha, 0);
  t("há um marco atual no primeiro ato", !!primeiro);
  const mundo = { cidadeAtual: "", lugarAtual: null, npcs: {}, derrotados: [], inventario: [], equipamento: [], revelados: [], dia: 1, relogios: [] };
  /* cumprir o primeiro marco de verdade, pelo estado do mundo */
  if (primeiro.condicao.tipo === "falar_com") mundo.npcs = { x: { nome: primeiro.condicao.alvo, conhecidoEm: 3 } };
  else if (primeiro.condicao.tipo === "revelar") mundo.revelados = [`cidade|local|${primeiro.condicao.alvo}`];
  else if (primeiro.condicao.tipo === "derrotar") mundo.derrotados = Array(primeiro.condicao.quantos || 1).fill(primeiro.condicao.alvo);

  const r1 = conferirEspinha(espinha, mundo, ver);
  t("o marco cai quando o mundo diz que caiu", r1.cumpridos.some((m) => m.id === primeiro.id));
  t("e a espinha devolvida o marca como feito", marcosDoAto(r1.espinha, 0).find((m) => m.id === primeiro.id).feito === true);
  const r2 = conferirEspinha(r1.espinha, mundo, ver);
  t("conferir de novo não o cumpre duas vezes", !r2.cumpridos.some((m) => m.id === primeiro.id));
  t("o marco atual do ato anda para o seguinte", (marcoAtual(r1.espinha, 0) || {}).id !== primeiro.id);
  t("e o progresso do ato conta certo", progressoDoAto(r1.espinha, 0).feitos === 1);
  /* uma condição que estoura não pode derrubar o turno */
  const r3 = conferirEspinha(espinha, mundo, () => { throw new Error("x"); });
  t("uma condição que estoura não cumpre nem quebra", r3.cumpridos.length === 0);
}

sec("8. A CATRACA E O QUE VAI À PAUTA");
{
  const vazia = garantirEspinha(null);
  t("espinha de save antigo não quebra", Array.isArray(vazia.atos) && vazia.atos.length === 0);
  t("e não tem marco atual", marcoAtual(vazia, 0) === null);
  t("nem envelope", envelopeDaEspinha(vazia, 0, est) === "");
  const env = envelopeDaEspinha(espinha, 0, est);
  t("o envelope diz onde estamos", env.includes("marco 1 de"));
  t("e traz o marco de verdade", env.includes(marcoAtual(espinha, 0).titulo));
  /* o Narrador não pode contar que existe estrutura — é o que transformaria
     "vivi isso" em "cumpri a etapa 3 de 6" */
  t("e manda não contar ao jogador", /NUNCA diga ao jogador que existe uma estrutura/.test(env));
  t("o marco vira uma linha legível", linhaDoMarco(marcoAtual(espinha, 0)).length > 6);
  t("todo feitio tem peso do vocabulário do arco", Object.values(FEITIOS).every((f) => pesoDe(f.peso) > 0));
}

sec("9. LIGADA AO JOGO");
{
  t("a espinha é estendida na criação do mundo", /espinhaRef\.current = estenderEspinha\(\{/.test(APP));
  t("com a cidade de partida, porque ela caminha para fora", /cidadeInicial: cidadeAtualRef\.current/.test(APP));
  t("save antigo não ganha espinha inventada", /espinhaRef\.current = garantirEspinha\(sv\.espinha \|\| null\)/.test(APP));
  t("ela viaja no save", /espinha: espinhaRef\.current/.test(APP));
  /* a seção `momento` existia declarada em pauta.js desde a v9.104 e nunca
     era preenchida — a espinha é o leitor que faltava */
  t("e enche a seção `momento` da Pauta", /porNaPauta\(p, "momento", envelopeDaEspinha\(/.test(APP));
  t("o marco confere pela MESMA porta das missões", /conferirEspinha\(espinhaRef\.current, mundoAgora, \(cond, m\) => etapaDef\(cond\.tipo\)\.ver\(cond, m\)\)/.test(APP));
  t("e empurra o arco pelo peso do próprio feitio", /registrarMarco\(historiaRef\.current, feitioDe\(m\.feitio\)\.peso, m\.titulo\)/.test(APP));
  t("`revelados` chega ao conferidor", /revelados: \(baseMundoRef\.current \|\| \{\}\)\.revelados \|\| \[\]/.test(APP));
}

console.log(`\nespinha v9.129: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
