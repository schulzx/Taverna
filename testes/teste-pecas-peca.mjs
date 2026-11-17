/* AS PEÇAS · A PEÇA DE UMA ETAPA (17/11/2026, Fase A da prova) — src/pecas/peca.js

   A prova, no mundo da quest de abertura («O Que Desce ao Anoitecer»):
   §1 os factos que faltam: o conclui e o que o clímax exige, só os falsos;
   §2 a junção: a mesma solução para o mesmo alvo vinda de dois factos é
      uma, e escreve os dois; a falha que escreve ganha;
   §3 as exceções da prova (tira, põe, pistas, eventos) e o «sem exceções»;
   §4 a cena fechada: quem o sistema põe aqui, a pessoa do papel no sítio
      dela, a besta só no covil; o «à vista» de cada solução;
   §5 as pistas: uma por solução, com fonte (quadro, tabela, exceção);
   §6 determinismo e lixo;
   §7 a peça-molde e «fecha só com os moldes»;
   §8 a cobertura das 214 etapas (a medida da fase A, em catraca). */
import { aPecaDaEtapa, aPecaDoMolde, faltamNaEtapa, aCenaDaPeca, excecoesDaEtapa, fechaComMoldes, DO_PROPRIO_SISTEMA, PISTA_DA_ACAO } from "../src/pecas/peca.js";
import { EXCECOES_DA_PROVA } from "../src/pecas/excecoes-da-prova.js";
import { mundoDaProva, aCoberturaDosMoldes, MINIMO_DE_SOLUCOES, A_PROVA, asPecasDaProva, conhecidosDoCorpus } from "../src/pecas/a-prova.js";
import { questPorId } from "../src/biblioteca-de-quests.js";
import { CAMINHOS_DA_CARTA } from "../src/quadro-da-quest.js";

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);

const W = mundoDaProva();
const { E, R, F, mundo } = W;
const naToca = { ...E, lugar: { nome: R.papeis.toca.nome, cidade: R.papeis.toca.cidade } };
const ids = (p) => p.solucoes.map((s) => s.id);
const sol = (p, id) => p.solucoes.find((s) => s.id === id);

sec("§1 os factos que faltam");
t("o mundo da prova abre a quest de abertura, com as pessoas no registo", R.id === A_PROVA.quest && !!R.papeis.pastora.id && !!R.papeis.tratador.id && !!R.papeis.fera.id);
const ver = aPecaDaEtapa(R, null, E, { mundo });
t("sem etapa, a peça é a da etapa atual (ver)", ver && ver.etapa === "ver" && J(ver.faltam) === J([["esteve", "lugar:curral"]]));
const rasto = aPecaDaEtapa(R, "rasto", E, { mundo });
t("o rasto pede o covil (o clímax) e os três do «pelo menos 2»", J(rasto.faltam.map((a) => a[0])) === J(["esta_em", "descobriu", "conversou", "esteve"]));
t("faltamNaEtapa diz o mesmo", J(faltamNaEtapa(R, F.etapas[1], E, mundo)) === J(rasto.faltam));
const fera = aPecaDaEtapa(R, "fera", naToca, { mundo });
t("a fera: a presença do clímax (derrotou | encontrou) e o caminho do assobio", ["derrotou", "encontrou", "consultou"].every((k) => fera.faltam.some((a) => a[0] === k)));
t("o que já é verdade não falta: na toca, o esta_em sai do rasto", !aPecaDaEtapa(R, "rasto", naToca, { mundo }).faltam.some((a) => a[0] === "esta_em"));

sec("§2 a junção");
const rr = sol(rasto, "rastrear@toca");
t("rastrear até à toca é UMA solução, e escreve o esteve e o esta_em", rr && J(rr.fatos.map((a) => a[0]).sort()) === J(["esta_em", "esteve"]));
const lf = sol(fera, "lutar@fera");
t("lutar com a besta escreve derrotou e encontrou", lf && J(lf.fatos.map((a) => a[0])) === J(["derrotou", "encontrou"]));
t("e, perdida, escreve só o encontro, com preço", lf.falha.escreve === true && J(lf.fatosNaFalha.map((a) => a[0])) === J(["encontrou"]));
t("as setas apontam para soluções da peça", [rasto, fera].every((p) => p.solucoes.every((s) => [s.sucesso, s.falha].every((l) => !l || !l.para || ids(p).includes(l.para)))));

sec("§3 as exceções");
t("ver: as do caminho saem, as do curral entram", J(ids(ver).sort()) === J(["ler@curral", "pegadas@curral", "revistar@curral", "vizinhos@curral"]));
t("fera: a besta não fala — sai o «falar», entra o «acalmar»", !ids(fera).includes("falar@fera") && ids(fera).includes("acalmar@fera"));
t("a exceção vem da tabela da prova, por quest e etapa", excecoesDaEtapa(F.id, F.etapas[0]) === EXCECOES_DA_PROVA[F.id].ver && excecoesDaEtapa("outra", F.etapas[0]) === null);
t("o campo opcional `pecas` da etapa ganha à tabela", J(excecoesDaEtapa(F.id, { id: "ver", pecas: { relogio: { cheio: 3 } } })) === J({ relogio: { cheio: 3 } }));
const verNu = aPecaDaEtapa(R, "ver", E, { mundo, semExcecoes: true });
t("sem exceções, ver é o molde do esteve", ids(verNu).includes("rastrear@curral") && !ids(verNu).includes("ler@curral"));
t("o evento do relógio da exceção viaja na peça", ver.evento && typeof ver.evento.esteve === "string");

sec("§4 a cena fechada");
t("no curral está a pastora (o sítio dela)", ver.cena.quem.some((q) => q.nome === R.papeis.pastora.nome) && ver.cena.onde.nome === R.papeis.curral.nome);
t("e não o tratador, nem a besta", !ver.cena.quem.some((q) => q.nome === R.papeis.tratador.nome || q.nome === R.papeis.fera.nome));
t("na toca estão o tratador e a besta (o covil do clímax)", [R.papeis.tratador.nome, R.papeis.fera.nome].every((n) => fera.cena.quem.some((q) => q.nome === n)));
const feraLonge = aPecaDaEtapa(R, "fera", E, { mundo });
t("longe do covil, a luta não está à vista; o caminho até lá está", !sol(feraLonge, "lutar@fera").aVista && sol(feraLonge, "rastrear@toca").aVista);
t("no covil, está", sol(fera, "lutar@fera").aVista);
t("aCenaDaPeca diz o mesmo que a peça", J(aCenaDaPeca(F, R, F.etapas[0], E).quem) === J(ver.cena.quem));
t("os lugares que a peça conhece entram no «o que há»", rasto.cena.oQue.some((x) => x.nome === R.papeis.toca.nome));

sec("§5 as pistas");
t("uma pista por solução", [ver, rasto, fera].every((p) => p.pistas.length === p.solucoes.length && p.pistas.every((x, i) => x.solucao === p.solucoes[i].id && x.diz.length > 0)));
t("toda pista tem fonte: o quadro, a tabela ou a exceção", [ver, rasto, fera].every((p) => p.pistas.every((x) => /^(quadro:|tabela:|excecao)/.test(x.de))));
t("a pista do quadro é o caminho do quadro, com o nome", rasto.pistas.find((x) => x.solucao === "revistar@curral").diz === CAMINHOS_DA_CARTA.lugar[0].diz.replace("{nome}", R.papeis.curral.nome));
t("a ação sem caminho no quadro fala pela tabela", fera.pistas.find((x) => x.solucao === "capturar@fera").diz === PISTA_DA_ACAO.capturar.replace("{nome}", sol(fera, "capturar@fera").alvo.nome));
t("a exceção escreve a da etapa especial", ver.pistas.find((x) => x.solucao === "ler@curral").de === "excecao");
t("quem é do vilão e o herói não viu entra pela alcunha", sol(fera, "lutar@fera").alvo.nome === F.papeis.fera.alcunha);

sec("§6 determinismo e lixo");
t("o mesmo estado dá a mesma peça", J(aPecaDaEtapa(R, "rasto", E, { mundo })) === J(rasto));
t("outro mundo da mesma semente dá a mesma peça", J(aPecaDaEtapa(mundoDaProva().R, "rasto", mundoDaProva().E, { mundo })) === J(rasto));
t("a peça é congelada", Object.isFrozen(rasto) && Object.isFrozen(rasto.solucoes) && Object.isFrozen(rasto.solucoes[0]));
t("o registo e o estado não mudam", (() => { const a = J(R), b = J(E); aPecaDaEtapa(R, "fera", E, { mundo }); return J(R) === a && J(E) === b; })());
t("lixo dá null, sem lançar", [null, undefined, 3, "x", {}, { id: "nao_existe" }].every((x) => aPecaDaEtapa(x, null, E) === null) && aPecaDaEtapa(R, "nao_ha", E) === null);
t("estado nulo não lança", aPecaDaEtapa(R, "ver", null) !== undefined);

sec("§6b as peças da medida");
const tres = asPecasDaProva();
t("as peças da medida são as três etapas com dado, cada uma com o herói no sítio dela", J(tres.map((x) => x.nome)) === J(["ver", "rasto", "fera"]) && tres.every((x) => x.peca && !x.peca.carta && x.peca.cena.onde.nome === x.estado.lugar.nome));
t("os nomes conhecidos do corpus: só textos, e lixo dá []", J(conhecidosDoCorpus({ conhecidos: ["Edric", 3, null] })) === J(["Edric"]) && J(conhecidosDoCorpus(null)) === "[]");

sec("§7 a peça-molde e o «fecha só com os moldes»");
const pm = aPecaDoMolde("conversou", { tipo: "pessoa", nome: "Edric" }, { quem: [{ nome: "Edric" }], oQue: [], onde: { nome: "a praça" } });
t("a peça-molde do conversou tem as seis vias, Edric à vista", pm && pm.solucoes.length === 6 && pm.solucoes.every((s) => s.aVista));
t("a peça-molde da escolha é carta", aPecaDoMolde("escolheu", { tipo: "escolha" }, {}).carta === true);
t("molde que não existe: null", aPecaDoMolde("morto", { tipo: "pessoa" }, {}) === null);
const falta = [];
t("o «nenhum» é veto e não pede nada", fechaComMoldes(["nenhum", ["morto", "papel:x"]]));
t("o «pelo menos 2» fecha com dois de três cobertos", fechaComMoldes(["pelo_menos", 2, ["morto", "papel:x"], ["conversou", "papel:y"], ["esteve", "lugar:z"]]));
t("e não com um", !fechaComMoldes(["pelo_menos", 2, ["morto", "papel:x"], ["situacao", "papel:y", "viva"], ["esteve", "lugar:z"]], falta) && falta.includes("morto"));
t("a outra etapa e o dia fecham-se pelo próprio sistema", DO_PROPRIO_SISTEMA.every((k) => fechaComMoldes([k, "x"])));

sec("§8 a cobertura das 214 etapas (só os moldes, sem exceção)");
const cob = aCoberturaDosMoldes();
console.log(`     etapas ${cob.etapas} · válidas ${cob.validas} · cartas ${cob.cartas} · menos de ${MINIMO_DE_SOLUCOES} soluções ${cob.poucas.length} · não fecham ${cob.naoFecham.length} ${J(cob.naoFecham)}`);
/* CATRACA (17/11/2026): 214 etapas, 213 com peça válida só dos moldes; a
   que não fecha é o_convite_sem_selo/saida (ver o relato da fase A).
   Piso das válidas, teto das que não fecham — só andam para melhor. */
t("as 214 etapas da biblioteca são lidas", cob.etapas === 214);
t("≥ 213 recebem uma peça válida só dos moldes (piso)", cob.validas >= 213, String(cob.validas));
t("≤ 1 não fecha (teto)", cob.naoFecham.length <= 1, J(cob.naoFecham));
t("nenhuma peça com dado fica com menos de três soluções que fecham", cob.poucas.length === 0, J(cob.poucas.slice(0, 5)));
t("as cartas de escolha são contadas à parte", cob.cartas > 0);

console.log(`\n${bons} ok, ${maus} falha(s)`);
process.exit(maus ? 1 : 0);
