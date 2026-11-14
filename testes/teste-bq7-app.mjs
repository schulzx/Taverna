/* ============================================================
   BQ7 · A FIAÇÃO NO App.jsx (08/11/2026) — testes/teste-bq7-app.mjs

   O motor das quests (motor/quests-do-turno.js) e as peças (a encruzilhada,
   o Diário) provam-se nas suítes deles (teste-bq7-motor, teste-bq-tela,
   teste-esqueleto). Esta suíte é de TEXTO e é curta: prova que o App as
   liga onde a planta manda — e só nos mundos novos.

     1. o esqueleto nasce só na criação de uma campanha nova (if (!cap));
     2. as quests andam no fim do turno DEPOIS do Cronista e ANTES da linha
        da sessão, e também quando o Cronista não corre;
     3. a encruzilhada está ligada (a soleira, a peça, o motor, a frase);
     4. o Diário recebe as quests, o cartaz e lê as reviravoltas;
     5. tudo em calou, e tudo atrás de «espinha.esqueleto» — a campanha
        que já existe não passa por nada disto.
   ============================================================ */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
/* BQ7b (08/11): a conta dos efeitos da tela mora num módulo puro, e prova-se
   aqui em Node — e a morte pelo caminho real do jogo (aMorteDoAlvo, matar) */
import { EFEITOS_NA_TELA, oQueOEfeitoPede } from "../src/motor/efeitos-da-quest.js";
import { QUESTS_DO_TURNO } from "../src/motor/quests-do-turno.js";
import { EFEITOS_DA_QUEST, BIBLIOTECA_DE_QUESTS, abrirQuest, avancarQuest, escolherNaQuest, questPorId, validarQuest } from "../src/biblioteca-de-quests.js";
import { RELOGIO_DO_DIA } from "../src/motor/tempo-do-turno.js";
import { aMorteDoAlvo } from "../src/motor/combate-do-turno.js";
import { garantirBase, matar, estaMorto, porSituacao, situacaoDe } from "../src/mundo-base.js";
import { garantirFactos, afeicaoAlcancada } from "../src/livro-de-factos.js";
import { anotarOLivro } from "../src/motor/livro-do-turno.js";
import { criarNPC } from "../src/npcs.js";
import { avaliarCondicao } from "../src/condicoes-da-quest.js";
import { osVinculos } from "../src/motor/combate-do-turno.js";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const app = fs.readFileSync(path.join(AQUI, "..", "src", "App.jsx"), "utf8");

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  FALHA  " + nome + (extra ? " — " + extra : "")); }
};
const conta = (agulha) => app.split(agulha).length - 1;
/* o corpo de uma função do App: de «const nome = » até à próxima
   declaração no mesmo recuo (duas casas) */
const corpo = (nome) => {
  const i = app.indexOf("\n  const " + nome + " = ");
  if (i < 0) return "";
  const j = app.indexOf("\n  const ", i + 10);
  return app.slice(i, j < 0 ? undefined : j);
};

console.log("\n1. o esqueleto nasce só na criação de uma campanha nova");
{
  const ini = app.indexOf("    if (!cap) {\n      guildasRef.current = guildasDoMundo(");
  const fim = app.indexOf("    jornadaRef.current = null; setJornada(null);", ini);
  const bloco = ini >= 0 && fim > ini ? app.slice(ini, fim) : "";
  t("o bloco da espinha da campanha nova existe", !!bloco);
  t("esqueletoDaCampanha é chamado uma vez só no App", conta("esqueletoDaCampanha(") === 1);
  /* MOVIDAS em 08/11 (BQ7b): o esqueleto passou a nascer por uma porta só,
     comporOEsqueleto (definida em iniciar, logo antes do bloco), porque é
     chamada duas vezes — aqui, e quando o companheiro de antes entra. A
     intenção fica: nasce dentro do if (!cap), depois da espinha na região,
     junta-se à espinha por comOEsqueleto, e o núcleo entra nele. */
  const porta = app.slice(app.indexOf("    const comporOEsqueleto = (base, heroi) => {"), app.indexOf("    if (!cap) {\n      guildasRef.current = guildasDoMundo("));
  t("e é dentro do if (!cap), depois da espinha na região", bloco.includes("comporOEsqueleto(espinhaSemEsqueleto, pers)") && bloco.indexOf("espinhaNaRegiao(") < bloco.indexOf("comporOEsqueleto(espinhaSemEsqueleto, pers)") && porta.includes("esqueletoDaCampanha("));
  t("comOEsqueleto junta-o à espinha ali mesmo", conta("comOEsqueleto(") === 1 && porta.includes("if (esq) espinhaRef.current = comOEsqueleto(espinhaRef.current, esq);"));
  t("o núcleo da campanha entra no esqueleto", /esqueletoDaCampanha\(\{[\s\S]{0,400}nucleo: nucleoAgora\(\)/.test(porta));
  t("a principal do marco antigo só nasce sem quest do tipo 1 no ato 0", /if \(!questNoAto0\) \{\s*missoesRef\.current = \[\.\.\.\(missoesRef\.current \|\| \[\]\)\.filter\(\(m\) => m\.id !== ab\.missao\.id\), ab\.missao\];/.test(app));
  /* MOVIDA em 08/11 (BQ7b): as quests do ato 0 correm agora DEPOIS do
     companheiro de antes (o esqueleto recomposto já o vê) e ANTES do pedido
     da abertura (que passa a apontar para a quest). A intenção fica: abrem
     antes do primeiro turno, e a principal do marco decide-se por elas. */
  const iQ0 = app.indexOf('correrAsQuests("a criação do mundo")');
  t("as quests do ato 0 abrem depois do companheiro e antes do pedido da abertura", iQ0 > app.indexOf("companheiroInicial({") && iQ0 < app.indexOf("enviar(pedidoDaAbertura(ab.abertura,") && app.indexOf("ab = abrirAbertura({") < iQ0);
}

console.log("\n2. o turno das quests: depois do Cronista, antes da linha da sessão");
{
  const iCr = app.indexOf(".then(() => Promise.resolve(doCronista).catch(() => null))");
  /* AJUSTADA em 09/11 (TE9), E O MOTIVO: o fim do turno passa a levar o
     feito que o aplicar desse turno já pagou (feitoDeste, tirado do ref no
     momento em que enfileira), para a paga da quest o descontar. A ordem que
     a asserção protege — o Cronista, as quests, a linha — é a mesma. */
  const iQ = app.indexOf('.then(() => { if (comQuests) correrAsQuests("o fim do turno", feitoDeste); })');
  const iS = app.indexOf(".then(() => { if (juntado) { try { gravarOTurnoDaSessao(juntado);");
  t("a fila espera o Cronista", iCr > 0);
  t("as quests correm depois dele", iQ > iCr);
  t("e a linha da sessão grava depois delas", iS > iQ);
  t("o Cronista que não corre não as cala", app.includes('correrAsQuests("o fim do turno, sem o Cronista", feitoDeste)'));
  t("sem esqueleto a fila é a de sempre (só a sessão a abre)", app.includes("if (turnoDaSessao || comQuests) {") && app.includes("const comQuests = comEsqueleto();"));
  t("o turno é o do motor, sobre o estado do livro", /oTurnoDasQuests\(estadoDasQuests\(\), \{ mundo: mundoDoLivro\(\), feitoDoTurno \}\)/.test(corpo("correrAsQuests"))); /* AJUSTADA em 09/11 (TE9): e o feito do turno, que só o fim do turno diz */
}

console.log("\n3. a encruzilhada está ligada");
{
  t("a escolha aberta vira o momento «escolha» da soleira", /momentoDaEscolha\(esc, \{[^}]*aoAbrir: \(\) => abrirAEscolha\(esc\), aoDepois: \(\) => adiarAEscolha\(esc\)/.test(app) && app.includes("if (m && m.qual) momentos[m.qual] = m.momento;"));
  t("a proposta da frase não é tapada pela escolha", app.includes("if (!propostaDaFrase && !escolhaAberta) {"));
  t("a peça monta-se ao lado do momento por cima do campo", app.includes("{!emBatalha ? encruzilhadaDaQuest() : null}"));
  t("<Encruzilhada> confirma pelo App e adia pelo «Depois»", /<Encruzilhada aberta veredito=\{esc\}[\s\S]{0,300}aoConfirmar=\{confirmarAEscolha\} aoDepois=\{\(\) => adiarAEscolha\(esc\)\}/.test(app));
  t("confirmar passa pelo motor (escolherNaQuestDoEstado)", corpo("confirmarAEscolha").includes("escolherNaQuestDoEstado(estadoDasQuests(), ab.quest, ab.chave, opcaoId, { mundo: mundoDoLivro() })"));
  t("as cartas vêm do motor (escolhasDasQuests), com o veredito", corpo("escolhasAgora").includes("escolhasDasQuests(E, { mundo: mundoDoLivro() })"));
  const lancar = corpo("lancarODado");
  t("a frase que é uma carta abre a encruzilhada antes da proposta da frase", lancar.indexOf("aEscolhaDaFrase(entrada, lista)") > 0 && lancar.indexOf("aEscolhaDaFrase(entrada, lista)") < lancar.indexOf("if (proporAFrase(entrada)) return;"));
  t("e abre-a com a carta escolhida e a frase", lancar.includes("abrirAEscolha(esc, { preEscolhida: c.opcao, frase: entrada.trim() })"));
  t("na sala a dois não há escolha de quest (o protocolo não muda)", corpo("escolhasAgora").includes("if (!comEsqueleto() || salaRef.current) return [];"));
}

console.log("\n4. o Diário com as quests");
{
  t("as duas portas do Diário recebem as quests da biblioteca", conta("questsDaBiblioteca={(bq && bq.quests) || []}") === 2);
  t("e o cartaz da sombra", conta("vilaoNoDiario={(bq && bq.vilao) || null}") === 2);
  /* Movida a 14/11 (as cartas no Diário, 2e9fb91): o bq passou a levar também os quadros e a porta
     para a gaveta, num invólucro em calou; a intenção — calcular só com o Diário aberto — continua. */
  t("o App só as calcula com o Diário aberto", app.includes('bq={aba === "diario" ? (() => { try { const b = oDiarioDasQuests();'));
  const d = corpo("oDiarioDasQuests");
  t("a projeção é a do motor (missoesDasQuests) e a vista a da quest (estadoDaQuest)", d.includes("missoesDasQuests(E, { mundo })") && d.includes("estadoDaQuest(R.id, R, ctx)"));
  t("o cartaz é oVilaoDasQuests", d.includes("oVilaoDasQuests(E, { mundo })"));
  t("abrir o Diário lê as reviravoltas", /useEffect\(\(\) => \{\s*if \(aba !== "diario"\) return;[\s\S]{0,200}verAsReviravoltas\(estadoDasQuests\(\)\)/.test(app));
}

console.log("\n5. tudo em calou, e só nos mundos novos");
{
  for (const nome of ["aplicarAsQuests", "correrAsQuests", "escolhasAgora", "oDiarioDasQuests", "abrirAEscolha", "adiarAEscolha", "confirmarAEscolha", "encruzilhadaDaQuest"]) {
    const c = corpo(nome);
    t(nome + " existe e cala o que estoura", !!c && /calou\("BQ7/.test(c));
  }
  t("o esqueleto do mundo novo nasce em calou", app.includes('} catch (e) { calou("BQ7 · o esqueleto do mundo novo", e); }'));
  t("as quests da criação correm em calou", app.includes('} catch (e) { calou("BQ7 · as quests da criação", e); questNoAto0 = false; }'));
  /* MOVIDA em 08/11 (BQ7b): o efeito sem órgão passou a sair da tabela
     (EFEITOS_NA_TELA.calado, com o motivo), e é a ordem «calado» que cala;
     a intenção fica: nunca se inventa a regra dele */
  t("o efeito sem órgão no App cala-se (nunca se inventa a regra dele)", corpo("aplicarEfeitoDaQuest").includes('calou("BQ7 · efeito sem órgão no App: " + o.tipo, new Error(o.motivo'));
  for (const nome of ["correrAsQuests", "escolhasAgora", "oDiarioDasQuests"]) {
    t(nome + " não corre sem «espinha.esqueleto»", /if \(!comEsqueleto\(\)/.test(corpo(nome)));
  }
  t("comEsqueleto lê a espinha, e só ela", app.includes("const comEsqueleto = () => !!(espinhaRef.current && espinhaRef.current.esqueleto);"));
}

/* ============================================================
   BQ7b (08/11/2026) — as consequências das quests chegam ao jogo. Os doze
   efeitos que caíam em calou: cada um ou tem órgão (e prova-se aqui, a
   conta em Node e a fiação por texto), ou cala com o motivo escrito.
   ============================================================ */
const J = (x) => JSON.stringify(x);
console.log("\n6. BQ7b · cada efeito da tela, e o órgão que o aplica");
{
  const T = EFEITOS_NA_TELA;
  const daTela = [...Object.keys(EFEITOS_DA_QUEST).filter((k) => !QUESTS_DO_TURNO.aplica.includes(k)), "passo_do_plano", "fim_do_plano", "desfecho_do_vilao", "reacao_do_vilao"];
  const lugares = (k) => [!!T.orgao[k], !!T.calado[k], T.soNarrador.includes(k)].filter(Boolean).length;
  t("todo efeito que o motor manda à tela tem um órgão, um motivo para calar, ou vai só ao Narrador — e num sítio só", daTela.every((k) => lugares(k) === 1), daTela.filter((k) => lugares(k) !== 1).join(","));
  const E0 = { personagem: { nome: "Vera", grupo: [{ nome: "Brash", vinculo: 30 }], moedas: 100 }, npcs: {}, factos: garantirFactos(null), dia: 4 };
  const p = (ef, E = E0) => oQueOEfeitoPede(ef, E);
  /* vínculo e marco: aplicarVinculo (osVinculos) */
  t("vínculo: a ordem leva o nome do grupo e os pontos", J(p({ tipo: "vinculo", quest: "q", alvo: { nome: "brash" }, n: 5 })) === J([{ ordem: "vinculo", nome: "Brash", pontos: 5 }]));
  t("vínculo de quem não anda no grupo: nada", p({ tipo: "vinculo", alvo: { nome: "Ninguém" }, n: 5 }).length === 0);
  const om = p({ tipo: "marco", alvo: { nome: "Brash" } });
  t("marco: o vínculo sobe até ao próximo marco (30 → 50)", J(om) === J([{ ordem: "vinculo", nome: "Brash", pontos: 20 }]));
  const vm = osVinculos(E0.personagem.grupo, om[0].nome, om[0].pontos);
  t("e pelo órgão de sempre o marco bate (a linha e a nota do momento íntimo)", vm.grupo[0].vinculo === 50 && vm.marcos.length === 1);
  t("marco no Vínculo Profundo: nada a subir", p({ tipo: "marco", alvo: { nome: "Brash" } }, { ...E0, personagem: { grupo: [{ nome: "Brash", vinculo: 100 }] } }).length === 0);
  /* afeição: no grupo, o vínculo até ao marco; fora, o livro e o laço */
  t("afeição de quem anda no grupo: o vínculo até ao marco de cima (30 → 50)", J(p({ tipo: "afeicao", alvo: { nome: "Brash" }, n: 1 })) === J([{ ordem: "vinculo", nome: "Brash", pontos: 20 }]));
  t("e a descer, um ponto abaixo do marco que perde (30 → 24)", J(p({ tipo: "afeicao", alvo: { nome: "Brash" }, n: -1 })) === J([{ ordem: "vinculo", nome: "Brash", pontos: -6 }]));
  const E1 = { ...E0, npcs: { Marta: criarNPC("Marta", { conhecidoEm: 1 }) } };
  const a1 = p({ tipo: "afeicao", alvo: { nome: "Marta", id: "m" }, n: 1 }, E1);
  t("afeição de quem não anda no grupo, sem laço: o grau vai ao livro, e nenhum laço nasce (o tipo seria regra nova)", J(a1) === J([{ ordem: "livro", afeicoes: [{ quem: "Marta", grau: 1 }] }]));
  const livro = anotarOLivro({ ...E1, cidadeAtual: "", mapa: { cidades: [] } }, a1[0]);
  const idM = livro && Object.keys(livro.factos.pessoas).find((k) => livro.factos.pessoas[k].nome === "Marta");
  t("e pelo livro de factos (anotarTurno) o grau fica alcançado — é o que a condição «afeicao» lê", !!idM && afeicaoAlcancada(livro.factos, idM) === 1);
  const E2 = { ...E0, npcs: { Marta: criarNPC("Marta", { laco: { tipo: "divida", forca: 1, desde: 1 } }) } };
  const a2 = p({ tipo: "afeicao", alvo: { nome: "Marta", id: "m" }, n: 1 }, E2);
  t("com laço, o grau vai ao livro e o laço aperta um passo (firmarLaco)", a2.length === 2 && a2[0].afeicoes[0].grau === 2 && a2[1].ordem === "npcs" && a2[1].npcs.Marta.laco.forca === 2);
  t("sem mexer no registo de entrada (imutabilidade)", E2.npcs.Marta.laco.forca === 1);
  const a3 = p({ tipo: "afeicao", alvo: { nome: "Marta" }, n: -1 }, { ...E0, npcs: { Marta: criarNPC("Marta", { laco: { tipo: "divida", forca: 3, desde: 1 } }) } });
  t("descer: o laço afrouxa (afrouxarLaco), e o livro fica — o grau alcançado alcançou-se", a3.length === 1 && a3[0].ordem === "npcs" && a3[0].npcs.Marta.laco.forca === 2);
  const a4 = p({ tipo: "afeicao", alvo: { nome: "Marta", id: "m" }, n: 1 }, { ...E0, npcs: { Marta: criarNPC("Marta", { laco: { tipo: "divida", forca: 2, desde: 1, rompido: true } }) } });
  t("um laço rompido não se reata por confiança (só o livro)", a4.length === 1 && a4[0].ordem === "livro");
  /* situação: porSituacao, e a condição «situacao» lê-a */
  const os = p({ tipo: "situacao", alvo: { nome: "Delfina" }, situacao: "cativa" });
  t("situação: porSituacao, com a situação da quest", J(os) === J([{ ordem: "situacao", nome: "Delfina", situacao: "cativa" }]));
  t("e pela base do mundo a situação fica escrita", situacaoDe(porSituacao(garantirBase(null), os[0].nome, os[0].situacao), "Delfina") === "cativa");
  t("a morta não entra pela situação (a morte tem uma porta só)", p({ tipo: "situacao", alvo: { nome: "Delfina" }, situacao: "morta" }).length === 0);
  /* dia: o relógio */
  t("dia: o relógio anda n dias inteiros (RELOGIO_DO_DIA)", J(p({ tipo: "dia", n: 2 })) === J([{ ordem: "minutos", n: 2 * RELOGIO_DO_DIA.minutosDoDia }]));
  t("dia sem número, ou negativo: nada", p({ tipo: "dia" }).length === 0 && p({ tipo: "dia", n: -1 }).length === 0);
  /* os calados e os do Narrador */
  t("os sem órgão calam com o motivo da tabela", Object.keys(T.calado).every((k) => { const r = p({ tipo: k, n: 1 }); return r.length === 1 && r[0].ordem === "calado" && r[0].motivo === T.calado[k]; }));
  /* MUDADA em 09/11 (as consequências caladas): os cinco que calavam ganharam
     órgão — o favor e o QUEM É vão ao livro de factos pelo motor
     (QUESTS_DO_TURNO.aplica), o relógio da região e o plano do vilão por
     esta peça (EFEITOS_NA_TELA.orgao). A intenção fica: nenhum dos cinco
     cai calado inteiro; o que ainda cala do plano cala por coisa, com o
     motivo (MUDA_DO_PLANO) — provado em teste-consequencias-caladas.mjs */
  t("o relógio regional e os dois do plano do vilão têm órgão; o favor e o QUEM É aplica-os o motor", ["relogio_regional", "passo_do_plano", "fim_do_plano"].every((k) => T.orgao[k] && !T.calado[k]) && ["favor", "quem_e"].every((k) => QUESTS_DO_TURNO.aplica.includes(k) && !T.calado[k]));
  t("os que só vão ao Narrador não pedem nada à tela (o motor já os pôs nas notas)", T.soNarrador.every((k) => p({ tipo: k, id: "x" }).length === 0));
  t("um tipo desconhecido cala, sem órgão", p({ tipo: "inventado" })[0].motivo === T.semOrgao);
  t("lixo nunca lança", [null, undefined, 3, "x", {}, { tipo: 4 }].every((x) => { try { return Array.isArray(oQueOEfeitoPede(x, null)); } catch { return false; } }));
}

console.log("\n7. BQ7b · a morte: só por um desfecho escolhido, e pelo caminho de sempre");
{
  const comMorte = BIBLIOTECA_DE_QUESTS.flatMap((q) => (q.desfechos || []).filter((d) => (d.efeitos || []).some((e) => e && e.tipo === "morte")).map((d) => ({ q, d })));
  t("há desfechos com a morte no acervo, e todas as quests passam no validador (a morte só num desfecho)", comMorte.length >= 3 && EFEITOS_DA_QUEST.morte.so === "desfecho" && BIBLIOTECA_DE_QUESTS.every((q) => validarQuest(q).ok));
  t("cada desfecho com morte exige uma escolha do herói, afirmada no «todos» de cima — nunca o padrão, nunca o do abandono",
    comMorte.every(({ q, d }) => Array.isArray(d.quando) && d.quando[0] === "todos" && d.quando.slice(1).some((c) => Array.isArray(c) && c[0] === "escolheu") && !d.padrao && !(q.abandono && q.abandono.desfecho === d.id)),
    comMorte.filter(({ d }) => !(Array.isArray(d.quando) && d.quando[0] === "todos")).map(({ q, d }) => q.id + ":" + d.id).join(","));
  /* o caminho real: a carta queimada e «deixá-los acertar contas» */
  const PCA = { quem: { nome: "Brash" }, ferido: { nome: "Delfina" }, carta: { nome: "a carta lacrada" } };
  /* o frente a frente fecha com duas conversas com Delfina (conversou(ferido, 2)),
     escritas no livro de factos pela mesma peça do turno */
  let E = { personagem: { nome: "Vera", grupo: [{ nome: "Brash", vinculo: 40 }], moedas: 100 }, npcs: { Brash: criarNPC("Brash", { conhecidoEm: 0, genero: "homem" }), Delfina: criarNPC("Delfina", { conhecidoEm: 1, genero: "mulher" }) }, factos: garantirFactos(null), dia: 5, baseMundo: garantirBase(null), cidadeAtual: "", mapa: { cidades: [] } };
  const R0 = abrirQuest("a_carta_que_nao_se_abre", { estado: E, papeis: PCA });
  for (const turno of [10, 20]) E = { ...E, factos: anotarOLivro(E, { dia: 5, turno, falouCom: ["Delfina"] }).factos };
  const naFrente = { ...R0, acesas: { sinal: 1, carta: 1, nome: 1, frente: 1 }, feitas: { sinal: { dia: 1 }, carta: { dia: 1, ramo: "queimar", variante: null }, nome: { dia: 1 } }, escolhas: { carta: { opcao: "queimar", dia: 1 } } };
  const R1 = avancarQuest("a_carta_que_nao_se_abre", escolherNaQuest("a_carta_que_nao_se_abre", naFrente, "frente", "deixar", { estado: E }), { estado: E });
  t("a carta queimada e «deixá-los acertar contas»: o preço inteiro, terminada", !!R1 && R1.estado === "terminada" && R1.desfecho === "o_preco_inteiro", J(R1 && { e: R1.estado, d: R1.desfecho }));
  const ef = { tipo: "morte", quest: R1.id, alvo: { nome: "Brash", id: (R1.papeis.quem || {}).id || "" } };
  const Ecom = { ...E, espinha: { quests: { registos: [R1] } } };
  const ord = oQueOEfeitoPede(ef, Ecom);
  t("o efeito vira a ordem da morte, com a linha e a causa da tabela", ord.length === 1 && ord[0].ordem === "morte" && ord[0].nome === "Brash" && ord[0].linha === "Brash morreu." && ord[0].causa.includes(questPorId(R1.id).titulo), J(ord));
  t("sem o registo terminado (a escolha ainda por fazer), ninguém morre", oQueOEfeitoPede(ef, { ...E, espinha: { quests: { registos: [naFrente] } } }).length === 0);
  t("terminada noutro desfecho (sem morte), ninguém morre", oQueOEfeitoPede(ef, { ...E, espinha: { quests: { registos: [{ ...R1, desfecho: "a_divida_paga" }] } } }).length === 0);
  t("sem o registo no estado, ninguém morre", oQueOEfeitoPede(ef, E).length === 0);
  t("quem já não anda no grupo não morre outra vez", oQueOEfeitoPede(ef, { ...Ecom, personagem: { grupo: [] } }).length === 0);
  /* os órgãos de sempre */
  const m = aMorteDoAlvo({ npcs: Ecom.npcs, dia: 5, lei: null, nemesis: null }, "Brash", ord[0].causa);
  const npcs2 = (m.efeitos.find((x) => x.tipo === "npcs") || {}).npcs;
  const base2 = matar(Ecom.baseMundo, "Brash");
  const grupo2 = Ecom.personagem.grupo.filter((g) => !(g && g.nome === "Brash"));
  t("o registo marca-o morto, com o dia e a causa (aMorteDoAlvo, a morte por decisão do sistema)", !!npcs2 && npcs2.Brash.status === "morto" && /Morreu no dia 5/.test(npcs2.Brash.notas));
  t("o nome fica riscado na base (matar) e sai do grupo", estaMorto(base2, "Brash") && grupo2.length === 0);
  t("e as quests veem-no morto: «morto(quem)» passa a valer", avaliarCondicao(["morto", "papel:quem"], { estado: { ...Ecom, npcs: npcs2, baseMundo: base2, personagem: { grupo: grupo2 } }, papeis: R1.papeis }) === true);
  const mq = corpo("morrerNaQuest");
  t("no App, os três órgãos de sempre: sai do grupo, registrarMorteDeAlvo e registrarMorte — cada um em calou",
    mq.includes("p0.grupo.filter((g) => !(g && g.nome === o.nome))") && mq.includes('try { registrarMorteDeAlvo(o.nome, o.causa); } catch (e) { calou("BQ7b') && mq.includes('try { registrarMorte(o.nome); } catch (e) { calou("BQ7b'));
  t("e nenhum caminho novo de morte: o App não escreve «morto» à mão", !/status: "morto"|morto: true/.test(mq));
}

console.log("\n8. BQ7b · a fiação no App: os efeitos, os rostos, o foco, o núcleo e a abertura");
{
  const ap = corpo("aplicarEfeitoDaQuest");
  t("a conta é a do módulo puro (oQueOEfeitoPede), sobre o estado das quests", ap.includes("const ordens = oQueOEfeitoPede(ef, estadoDasQuests());"));
  t("cada ordem pelo seu órgão: aplicarVinculo, o relógio, o livro, o registo, porSituacao, a morte",
    ap.includes("aplicarVinculo(p0.grupo, o.nome, o.pontos)") && ap.includes("const tx = avancarMinutos(o.n);") && ap.includes('anotarNoLivro("BQ7b · a afeição da quest", { afeicoes: o.afeicoes });')
    && ap.includes("npcsRef.current = o.npcs; setNpcs(o.npcs);") && ap.includes("porSituacao(baseMundoRef.current, o.nome, o.situacao); setBaseMundo(baseMundoRef.current);") && ap.includes("morrerNaQuest(o);"));
  t("o que o relógio diz do dia (o reino, a festa) vai ao Narrador", ap.includes("notaRef.current = notaComOTurno(notaRef.current, [tx.trim()]);"));
  t("cada ordem em calou", ap.includes('} catch (e) { calou("BQ7b · " + ef.tipo + " · " + o.ordem, e); }'));
  /* MOVIDA outra vez em 09/11 (TE5): o estado leva também o elenco, para a convivência contar igual no App e no replay. */
  /* MOVIDA em 09/11 (as consequências caladas): o estado das quests passou a
     levar também os relógios (`relogios: relogiosRef.current`), para o
     `relogio_regional` escolher quais andam; a intenção fica — leva a base */
  t("o estado das quests leva a base do mundo (as condições «situacao» e «morto» leem-na), e a memória das escolhas também a olha",
    /* AJUSTADA em 09/11 (TE9), E O MOTIVO: o estado das quests passou a
       levar também o chão e a luta (a paga cai no chão; a revelação compara
       com a regra do corpo); a intenção fica — leva a base */
    app.includes("saber: saberRef.current, baseMundo: baseMundoRef.current, relogios: relogiosRef.current, elenco: elencoSaveRef.current, chao: chaoRef.current, combate: combateRef.current });") && corpo("escolhasAgora").includes("c.base === E.baseMundo"));
  /* os rostos */
  t("o rosto é um componente de fora do render (RostoDaQuest), antes de Taverna()", /\nfunction RostoDaQuest\(\{ semente, ente = null, lado = 44 \}\) \{/.test(app) && app.indexOf("function RostoDaQuest(") < app.indexOf("export default function Taverna()"));
  t("e enche o aro que a peça der (viewBox, 100%), sem a carta por trás", /function RostoDaQuest[\s\S]{0,200}<svg width="100%" height="100%" viewBox="0 0 64 64"[\s\S]{0,200}<Rosto semente=\{semente\} ente=\{ente\} lado=\{lado\} \/>/.test(app));
  const rg = corpo("rostoDaGente");
  t("o rosto lê o grupo, depois o registo, e só então o nome", rg.indexOf("(p.grupo || []).find(") > 0 && rg.indexOf("(p.grupo || []).find(") < rg.indexOf("Object.values(npcsRef.current || {})") && rg.includes("return <RostoDaQuest semente={nome} lado={lado} />;") && /calou\("BQ7b/.test(rg));
  t("a encruzilhada recebe o rosto do risco (32, a faixa da vida) e o foco que volta à soleira", app.includes("rostoDe={(risco) => rostoDaGente(risco, 32)} devolverFocoA={focoDaSoleira} />"));
  t("o Diário recebe o rosto da gente nas duas portas", conta("rostoDe={(bq && bq.rostoDe) || null}") === 2 && corpo("oDiarioDasQuests").includes("rostoDe: (g) => rostoDaGente(g, 44)"));
  t("a soleira tem o ref, e o foco volta ao primeiro botão dela, ou ao campo — nunca ao <body>",
    app.includes('<div className="pt-2" ref={soleiraRef}>') && app.includes('soleiraRef.current.querySelector("button:not([disabled])")') && app.includes("if (b) b.focus(); else if (campoRef.current) campoRef.current.focus();"));
  /* o núcleo e a abertura */
  const ini = app.slice(app.indexOf("  const iniciar = (pers) => {"), app.indexOf("  const abrirACampanha = (pers) => {"));
  t("o esqueleto recompõe-se UMA vez, quando o companheiro de antes entra, sobre a espinha de antes dele, em calou",
    conta("comporOEsqueleto(") === 2 && ini.includes("if (companheiroAb && comEsqueleto() && espinhaSemEsqueleto) {") && ini.includes('try { comporOEsqueleto(espinhaSemEsqueleto, persAb); } catch (e) { calou("BQ7b · o esqueleto com o companheiro", e); }'));
  t("e antes de qualquer quest abrir", ini.indexOf("comporOEsqueleto(espinhaSemEsqueleto, persAb)") > 0 && ini.indexOf("comporOEsqueleto(espinhaSemEsqueleto, persAb)") < ini.indexOf('correrAsQuests("a criação do mundo")'));
  t("o load nunca recompõe (só iniciar passa por comporOEsqueleto)", ini.split("comporOEsqueleto(").length - 1 === 2);
  t("a pista da abertura é a quest: o gancho e a etapa da vista (estadoDaQuest), e o pedido leva-os",
    ini.includes('if (v0 && v0.gancho) questDaAbertura = { gancho: v0.gancho, passo: v0.etapaTexto || "" };') && ini.includes("quest: questDaAbertura }), persAb, []);") && ini.includes('calou("BQ7b · a pista da abertura", e)'));
}

console.log("\n9. BQ7c: a base do mundo novo antes do esqueleto, e o sino que cala na quest");
{
  const ini = app.slice(app.indexOf("  const iniciar = (pers) => {"), app.indexOf("  const abrirACampanha = (pers) => {"));
  const RESET = "if (!cap) { baseMundoRef.current = garantirBase(null); setBaseMundo(baseMundoRef.current); }";
  /* o defeito: sem companheiro de antes, o esqueleto era composto ANTES de
     a base ser reposta, e o núcleo dele (contextoDoElenco → base) lia os
     mortos e as situações da campanha anterior. A recomposição com o
     companheiro já corria depois — por isso o defeito só mordia sem ele. */
  t("a base do mundo é reposta uma vez só em iniciar", ini.split(RESET).length - 1 === 1);
  t("e antes da primeira composição do esqueleto (e do núcleo que ele lê)",
    ini.indexOf(RESET) > 0 && ini.indexOf(RESET) < ini.indexOf("comporOEsqueleto(espinhaSemEsqueleto, pers)") && ini.indexOf(RESET) < ini.indexOf("const comporOEsqueleto = (base, heroi) => {"));
  t("junto do registo e do elenco que o núcleo também lê", ini.indexOf(RESET) > ini.indexOf("elencoSaveRef.current = garantirElencoDoSave(null);") && ini.indexOf(RESET) < ini.indexOf("nucleoCacheRef.current = null;"));
  t("e antes da abertura e do companheiro de antes (que leem a mesma base)", ini.indexOf(RESET) < ini.indexOf("ab = abrirAbertura({") && ini.indexOf(RESET) < ini.indexOf("companheiroInicial({"));

  /* A ORDEM IMPORTA, em Node: a base viva de uma campanha (os seus mortos,
     por nome) muda o núcleo e o esqueleto da campanha seguinte em parte dos
     mundos — os papéis da segunda dependeriam da primeira, e a mesma semente
     daria outro mundo conforme o que se jogou antes na mesma sessão. Com a
     base reposta, o mundo é o da semente (determinismo). Se um dia esta
     contagem cair a zero, o núcleo deixou de ler a base (hoje: 1 de 60, com
     todos os nomes importantes da primeira mortos — o efeito é raro, e por
     isso a prova principal é a de texto, a da ordem): a prova de texto
     acima perde o motivo, e deve ser revista — não apagada às cegas.
     (Pedido original: «a segunda não herda nenhum id da primeira». Não se
     pode escrever assim: os nomes saem de um banco partilhado, e dois mundos
     limpos já partilham algum nome — 27 de 60 nestas sementes. O que se
     prova é a dependência, que é o defeito.) */
  const { esqueletoDaCampanha } = await import("../src/esqueleto.js");
  const { gerarGeografia } = await import("../src/geografia.js");
  const { estenderEspinha } = await import("../src/saga.js");
  const { nucleoDaCampanha } = await import("../src/nucleo.js");
  const { chefesDoMundo } = await import("../src/mundo-base.js");
  const mundo = (semente, base) => {
    const mapa = gerarGeografia(semente, null, null);
    const espinha = estenderEspinha({ semente, mapa, estrutura: "jornada", cidadeInicial: mapa.cidades[0].nome, antecedente: "soldado", dia: 1 });
    const nucleo = nucleoDaCampanha(semente, mapa, { espinha, antecedente: "soldado", grupo: [], base });
    return { nucleo, esq: esqueletoDaCampanha({ semente, mapa, espinha, antecedente: "soldado", nucleo, chefes: chefesDoMundo(semente, mapa) }) };
  };
  const nomesDe = (esq) => {
    const s = new Set();
    for (const g of [...((esq && esq.atos) || []), ...((esq && esq.coracao) || [])]) for (const p of Object.values(g.papeis || {})) if (p && p.nome) s.add(p.nome);
    return s;
  };
  let mudou = 0, iguais = 0;
  const N = 60;
  for (let i = 0; i < N; i++) {
    const A = mundo("BQ7c|A|" + i, garantirBase(null));
    let viva = garantirBase(null);
    for (const n of [...A.nucleo.pessoas.map((p) => p.nome), ...nomesDe(A.esq)]) viva = matar(viva, n);
    const comAViva = mundo("BQ7c|B|" + i, viva);
    const reposta = mundo("BQ7c|B|" + i, garantirBase(null));
    const limpa = mundo("BQ7c|B|" + i, garantirBase(null));
    if (JSON.stringify(comAViva.esq) !== JSON.stringify(reposta.esq) || JSON.stringify(comAViva.nucleo) !== JSON.stringify(reposta.nucleo)) mudou++;
    if (JSON.stringify(reposta) === JSON.stringify(limpa)) iguais++;
  }
  console.log(`      a base da campanha anterior mudou a seguinte em ${mudou} de ${N} mundos`);
  t("a base da campanha anterior muda o esqueleto ou o núcleo da seguinte em parte dos mundos (é por isso que a ordem importa)", mudou > 0, `${mudou}/${N}`);
  t("com a base reposta, a segunda campanha é a da semente — igual à de uma sessão limpa", iguais === N, `${iguais}/${N}`);

  /* OS MOTORES DA CAMPANHA NOVA. Uma campanha nova na mesma sessão herdava
     da anterior a reviravolta (o prelúdio só elege outra quando não há
     nenhuma: «if (menor && !$ref.reviravolta)»), o Livro de Promessas e a
     escada — refs que o load repõe do save e a criação não tocava. Agora
     nascem com os vazios do useRef (o mesmo que uma sessão limpa), e só na
     campanha nova: o capítulo (cap) continua a campanha e guarda-os, e Uma
     Noite já os limpou e semeou antes de chamar iniciar. */
  const MOT = 'if (!cap && modoRef.current !== "rapida") {';
  const iM = ini.indexOf(MOT);
  const mot = iM > 0 ? ini.slice(iM, ini.indexOf('calou("BQ7c · os motores da campanha nova", e); }', iM) + 60) : "";
  t("os motores repõem-se uma vez, só em campanha nova (não no capítulo, não na Noite)", iM > 0 && ini.split(MOT).length - 1 === 1);
  const VAZIOS = [
    "promessasRef.current = garantirLivro(null);", "reviravoltaRef.current = null;", "reviravoltaMaiorRef.current = null;",
    "escadaRef.current = garantirEscada(null);", "escutaRef.current = garantirEscuta(null);", "adiadosEscutaRef.current = [];",
    "gestosRef.current = [];", "fatosDoPesoRef.current = {};", "episodioRef.current = null;", "posturaRef.current = garantirPosturaAtiva(null);",
    "noiteRef.current = null; torneioRef.current = null; vereditoRef.current = null;",
  ];
  const faltam = VAZIOS.filter((v) => !mot.includes(v));
  t("a reviravolta, as promessas, a escada, a escuta, o episódio, os gestos, a postura e a noite, com os vazios de sempre", !faltam.length, faltam.join(" | "));
  t("os vazios são os do useRef (uma campanha nova = uma sessão limpa)",
    app.includes("const promessasRef = useRef(garantirLivro(null));") && app.includes("const escadaRef = useRef(garantirEscada(null));") && app.includes("const posturaRef = useRef(garantirPosturaAtiva(null));") && app.includes("const reviravoltaRef = useRef(null);"));
  t("em calou, e antes da espinha e do esqueleto (que a campanha nova escreve a seguir)",
    mot.includes('} catch (e) { calou("BQ7c · os motores da campanha nova", e); }') && iM < ini.indexOf("espinhaRef.current = estenderEspinha({"));
  /* o capítulo: é capituloNovoRef que o distingue, lido uma vez no começo */
  t("o capítulo distingue-se por capituloNovoRef, lido e limpo antes da reposição",
    ini.indexOf("const cap = capituloNovoRef.current;") > 0 && ini.indexOf("const cap = capituloNovoRef.current;") < iM);
  /* a Noite semeia o Livro ANTES de chamar iniciar — repô-lo ali apagava as sementes */
  const noite = corpo("iniciarNoite");
  t("Uma Noite semeia as promessas e só depois chama iniciar (por isso fica de fora da reposição)",
    noite.indexOf("promessasRef.current = L;") > 0 && noite.indexOf("promessasRef.current = L;") < noite.indexOf("iniciar(pers);") && noite.includes('modoRef.current = "rapida";'));

  /* O SINO (abertura.js, andarOSino): traz a pressão do alvo do marco
     antigo. Num mundo novo esse alvo não é a história — calar-se é a saída
     que não inventa regra (apontá-lo à quest pediria traduzir a etapa da
     quest no feitio do sino, que é tabela do sistema). */
  const ms = corpo("marcarTurnoDoMundo");
  const sc = corpo("oSinoCala");
  t("marcarTurnoDoMundo pergunta à porta antes de andar o sino, dentro do mesmo try (o calou de sempre)",
    ms.indexOf("if (oSinoCala()) return;") > ms.indexOf("try {") && ms.indexOf("if (oSinoCala()) return;") < ms.indexOf("const s = oSinoDoTurno({"));
  t("a porta é de mundo novo: sem esqueleto nunca cala", sc.indexOf("if (!comEsqueleto()) return false;") > 0 && sc.indexOf("if (!comEsqueleto()) return false;") < sc.indexOf("principalId"));
  t("cala quando a principal da abertura nunca nasceu (a quest do ato 0 tomou-lhe o lugar)",
    sc.includes("if (a.principalId && !(missoesRef.current || []).some((m) => m && m.id === a.principalId)) return true;"));
  t("cala num ato com a quest do tipo 1 aberta (o ato é o da história, a quest a do esqueleto)",
    sc.includes("questsDoAto(espinhaRef.current.esqueleto, ato).find((q) => q && q.tipo === 1)") && sc.includes('garantirQuestsDaEspinha(espinhaRef.current.quests).registos.some((r) => r && r.id === q1.id && r.estado === "aberta")') && sc.includes("const ato = Number.isInteger(h.etapa) ? h.etapa : 0;"));
  t("e em calou, a responder «não cala» se estourar (o mundo antigo nunca perde o sino)", sc.includes('} catch (e) { calou("BQ7c · o sino na quest", e); return false; }'));
  /* calar é não andar: a abertura fica como está, e nada que dependa dela
     fica preso — sem a principal, o mural e a trama já a dão por cumprida */
  const { muralLiberado, tramaTemEspaco } = await import("../src/abertura.js");
  const abQ = { v: 1, principalId: "mis_x", cidade: "Vau", titulo: "t", pista: { nome: "P" }, alvo: { feitio: "procurar", quem: "Noé" }, turnos: 0, semAvanco: 0 };
  t("sem a principal entre as missões, o mural abre e a trama tem espaço com a abertura parada no turno 0",
    muralLiberado({ abertura: abQ, missoes: [] }) === true && tramaTemEspaco({ abertura: abQ, missoes: [], dia: 1 }) === true);
}

console.log(`\nbq7-app: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
