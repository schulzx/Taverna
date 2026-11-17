/* AS PEÇAS · O ENCAIXE (17/11/2026, Fase A da prova) — src/pecas/encaixe.js

   Decisão da pessoa: só dois estados — a frase aciona UMA solução, ou é
   aquecimento (e nunca «A ou B?»). As saídas universais (ir, descansar,
   comprar, abrir painel, falar com o Mestre) seguem o jogo de hoje.
   §1 a solução: a ação lida está na peça e o alvo na cena;
   §2 o aquecimento: o alvo fora da cena, a frase que cabe em duas, a
      conversa, o olhar, o nome de quem não está, a solução já queimada;
   §3 as saídas livres;
   §4 a família quando a ação exata não está;
   §5 o corpus da mesa (439 frases reais) contra as três peças da prova e
      contra a peça-molde de cada facto — a medida da fase A, em catraca;
   §6 lixo e determinismo. */
import fs from "node:fs";
import { encaixar, aLeitura, aSaidaLivre, SAIDAS_LIVRES, VERBOS_DA_PECA, PALAVRAS_DO_CALOR, partirEmOracoes, aDescricao, PESO_DO_ENCAIXE, ORACAO, NAO_E_ACAO, SAIDA_DA_CENA, CONVERSA_DIRETA, ALVO_POR_DESCRICAO, FAMILIAS_QUE_AQUECEM, FAMILIAS_QUE_PEDEM_A_PALAVRA, CENA_SEM_CATALOGO, PAPEIS_DO_ELENCO, LEITURAS_QUE_NAO_SAO } from "../src/pecas/encaixe.js";
import { aPecaDoMolde } from "../src/pecas/peca.js";
import { comMemoria, CALOR_DAS_PECAS } from "../src/pecas/calor.js";
import { MOLDE_DO_FATO, FAMILIA_DA_ACAO, ACOES_QUE_SE_TROCAM, acoesQueTrocamCom } from "../src/pecas/moldes.js";
import { asPecasDaProva, medirOEncaixe, conhecidosDoCorpus } from "../src/pecas/a-prova.js";

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);

const [ver, rasto, fera] = asPecasDaProva();
const pastora = rasto.peca.cena.quem[0].nome;
const curral = ver.peca.cena.onde.nome;
const besta = fera.peca.solucoes.find((s) => s.id === "lutar@fera").alvo.nome;
const enc = (f, p) => encaixar(f, p.peca, p.estado);

sec("§1 a solução");
const r1 = enc("Examino com cuidado a porta, à procura de vestígios.", ver);
t("investigar no curral aciona o «ler» do curral, com o dado do catálogo", r1.tipo === "solucao" && r1.solucao === "ler@curral" && r1.dado.dc === 15 && r1.dado.pericia === "investigacao", J(r1));
const r2 = enc(`Tento convencer ${pastora} a me contar o que viu.`, rasto);
t("convencer quem está na cena aciona a solução dela", r2.tipo === "solucao" && r2.solucao === "convencer@pastora", J(r2));
const r3 = enc(`Ataco ${besta} com a espada.`, fera);
t("atacar a besta no covil é a luta", r3.tipo === "solucao" && r3.solucao === "lutar@fera" && r3.dado.luta === true, J(r3));
const toca = rasto.peca.solucoes.find((s) => s.id === "rastrear@toca").alvo.nome;
const r4 = enc(`Sigo as pegadas na lama até ${toca}.`, rasto);
t("o rasto até à toca não precisa de estar lá (é o caminho)", r4.tipo === "solucao" && r4.solucao === "rastrear@toca", J(r4));
t("a solução traz a pista dela", typeof r1.pista === "string" && r1.pista.length > 0);

sec("§2 o aquecimento");
const a1 = enc(`Ataco ${besta} com a espada.`, { ...fera, estado: rasto.estado, peca: rasto.peca });
t("a luta sem a besta na cena (o rasto) não aciona nada", a1.tipo !== "solucao");
const longe = asPecasDaProva()[2];
const naoEsta = encaixar("Tento convencer o taverneiro a falar.", ver.peca, ver.estado);
t("a ação plausível com o alvo descrito e fora da cena é aquecimento", naoEsta.tipo === "aquecimento", J(naoEsta));
/* MOVIDA (A2, furo 4 fechado): era «(furo registado) o tratador não é
   descrição que o catálogo leia» e esperava SOLUÇÃO no curral — a frase caía
   em quem estava. Agora o papel da quest descreve: sem tratador na cena, é
   aquecimento; na toca, onde ele está, é a solução dele. */
t("«o tratador» onde ele não está: aquecimento (o alvo está fora)", encaixar("Tento convencer o tratador a falar.", ver.peca, ver.estado).tipo === "aquecimento");
t("«o tratador» na toca: a solução dele", encaixar("Tento convencer o tratador a falar.", fera.peca, fera.estado).solucao === "convencer@tratador");
/* duas pessoas na cena, a mesma ação, sem nome: aquece as duas */
const duas = aPecaDoMolde("conversou", { tipo: "pessoa", nome: "Edric", papel: "edric" }, { quem: [{ nome: "Edric" }, { nome: "Lysa" }], onde: { nome: "a praça" } });
const duasLysa = { ...duas, solucoes: [...duas.solucoes, ...aPecaDoMolde("conversou", { tipo: "pessoa", nome: "Lysa", papel: "lysa" }, { quem: [{ nome: "Edric" }, { nome: "Lysa" }], onde: { nome: "a praça" } }).solucoes], pistas: duas.pistas };
const d1 = encaixar("Tento convencer a pessoa à minha frente a falar.", duasLysa, {});
t("a frase que cabe em duas aquece as duas — sem perguntar", d1.tipo === "aquecimento" && d1.esquenta.includes("convencer@edric") && d1.esquenta.includes("convencer@lysa") && d1.porque === "duas", J(d1));
const d2 = encaixar("Tento convencer Lysa a falar.", duasLysa, {});
t("com o nome, é dela", d2.tipo === "solucao" && d2.solucao === "convencer@lysa", J(d2));
/* MOVIDA (A2): era «Cumprimento X e pergunto como vai o inverno» — com a
   conversa direta, a pergunta a quem a etapa pede já é a solução (§7). O
   aquecimento pela conversa fica para a fala sem pergunta nem pedido. */
const c1 = enc(`Cumprimento ${pastora} e digo que a noite promete ser fria.`, rasto);
t("a conversa aquece as vias da conversa de quem ela nomeia", c1.tipo === "aquecimento" && c1.esquenta.length > 0 && c1.esquenta.every((id) => id.endsWith("@pastora")) && c1.nomeadas.length > 0, J(c1));
const c2 = encaixar("Respondo ao Teodoro que não sei.", rasto.peca, rasto.estado, { conhecidos: ["Teodoro"] });
t("quem fala com alguém que existe e não está aqui não aquece quem está", c2.tipo === "aquecimento" && c2.esquenta.length === 0 && c2.porque === "nomeiaQuemNaoEsta", J(c2));
const c3 = enc("Cresci na guilda dos dedos.", rasto);
t("a frase que não aponta para nada é aquecimento frio, com pista", c3.tipo === "aquecimento" && c3.esquenta.length === 0 && c3.pista.length > 0, J(c3));
const queimado = comMemoria(ver.estado, ver.peca, { queimadas: ["revistar@curral"] });
const q1 = encaixar("Vasculho o armazém de cima a baixo.", ver.peca, queimado);
t("a solução que já falhou não rola outra vez: a frase cai na da seta dela (a mesma família)", q1.tipo === "solucao" && q1.solucao === "ler@curral", J(q1));
const tudoQueimado = comMemoria(ver.estado, ver.peca, { queimadas: ["revistar@curral", "ler@curral", "pegadas@curral"] });
const q2 = encaixar("Vasculho o armazém de cima a baixo.", ver.peca, tudoQueimado);
t("sem nada vivo na família, é aquecimento", q2.tipo === "aquecimento", J(q2));

sec("§3 as saídas livres");
for (const [f, qual] of [["Vou até o cemitério.", "ir"], ["Sigo viagem para Ponte Brumoso.", "ir"], ["Abro o mapa.", "painel"], ["Quanto custa uma corda?", "comercio"], ["Mestre, quantas horas faltam para anoitecer?", "mestre"], ["(posso ver a ficha?)", "mestre"]]) {
  const r = enc(f, rasto);
  t(`«${f}» é livre (${qual})`, r.tipo === "livre" && r.qual === qual, J(r));
}
t("descansar é livre", enc("Deito-me e durmo até de manhã.", rasto).tipo === "livre");
t("«vou falar com» não é ir", aSaidaLivre(`Vou falar com ${pastora}.`, {}) === null);
t("a solução à vista ganha à saída (vou e procuro já aqui)", enc("Vou até ao fundo do armazém e vasculho a palha.", ver).tipo === "solucao");
t("as tabelas dizem porquê", Object.values(SAIDAS_LIVRES).every((s) => typeof s.porque === "string" && s.rx instanceof RegExp));

sec("§4 a leitura e a família");
t("a agressão vem primeiro", aLeitura(`Ataco ${besta}.`, fera.peca.cena, fera.estado).acao === "lutar");
t("capturar e pagar são verbos da peça", VERBOS_DA_PECA.capturar.test("atiro a rede") && aLeitura("Atiro o laço ao pescoço da besta.", fera.peca.cena, {}).acao === "capturar"
  && aLeitura(`Pago a ${pastora} umas moedas para falar.`, rasto.peca.cena, {}).acao === "pagar");
t("pagar a conta não é suborno", aLeitura("Deixo uma moeda na mesa pela cerveja.", rasto.peca.cena, {}).acao !== "pagar");
const fam = enc(`Insisto com ${pastora} até me dizer o que viu.`, rasto);
t("fazer falar e convencer são a mesma conversa: a família encaixa", fam.tipo === "solucao" && FAMILIA_DA_ACAO[fam.dado.acao] === "social", J(fam));
t("toda família do calor é uma família de ação", Object.keys(PALAVRAS_DO_CALOR).every((f) => Object.values(FAMILIA_DA_ACAO).includes(f)));

sec("§5 o corpus da mesa");
const CORPUS = JSON.parse(fs.readFileSync(new URL("./corpus-da-mesa.json", import.meta.url), "utf8"));
const frases = CORPUS.frases.map((f) => f.frase);
const pecas = asPecasDaProva();
const m = medirOEncaixe(frases, pecas);
const estrito = medirOEncaixe(frases, pecas, { conhecidos: conhecidosDoCorpus(CORPUS) });
const fmt = (x) => `n ${x.n} · solução ${x.solucao} · cena ${x.cena} · aquecimento ${x.aquecimento} (aquece ${x.esquenta}, frio ${x.frio}) · livre ${x.livre}`;
console.log("     as três peças da prova:", fmt(m.total));
for (const [k, v] of Object.entries(m.porPeca)) console.log(`       ${k}: ${fmt(v)}`);
console.log("     estrito (o nome de quem não está não aquece):", fmt(estrito.total));
const moldes = [];
for (const k of Object.keys(MOLDE_DO_FATO).filter((x) => x !== "pelo_menos" && x !== "escolheu")) {
  const tipo = MOLDE_DO_FATO[k].alvo;
  const alvo = tipo === "pessoa" ? { tipo, nome: "Edric" } : tipo === "lugar" ? { tipo, nome: "o Moinho Velho" } : { tipo, nome: "a chave de ferro" };
  const cena = { quem: [{ nome: "Edric" }], oQue: [], onde: { nome: tipo === "lugar" ? "o Moinho Velho" : "a praça" } };
  moldes.push({ nome: k, peca: aPecaDoMolde(k, alvo, cena), estado: {} });
}
const mm = medirOEncaixe(frases, moldes);
console.log("     controlo, a peça-molde de cada facto:", fmt(mm.total));
for (const [k, v] of Object.entries(mm.porPeca)) console.log(`       ${k}: ${fmt(v)}`);
/* CATRACA (17/11/2026, a medida da fase A — mente/lancamento/pecas-fase-a.md):
   nas três peças da prova, 1317 encaixes. «Sem nada» (nulo) é zero — toda
   frase é solução, aquecimento ou livre (o alvo da pessoa, as-pecas.md §5).
   O furo é o aquecimento FRIO: piso das soluções e teto dos frios, que só
   andam para melhor. */
t("toda frase do corpus dá um dos três (nenhuma fica sem nada)", m.total.nulo === 0 && mm.total.nulo === 0);
/* MOVIDA (A2, 17/11 — mente/lancamento/pecas-fase-a2.md): o piso era 131
   soluções e o teto 114 frios. A fase A contava soluções que eram falsas
   (a família larga: «sorrio para ele» virava «perguntar aos vizinhos»; a
   conversa sem ninguém virava a da etapa); a A2 tirou essas e somou as
   certas (a conversa direta, o alvo pelo papel), e as falsas pesavam mais:
   «procuro a Lourdes» era revistar, «de que fugi» era fugir. O piso desce para 100 e
   o teto dos frios para 100; o teste de cena (o 4.º destino) ganha piso, e
   o livre teto — os quatro só andam para melhor. */
/* FASE B (17/11): o piso desce de 100 para 90, e de propósito. Saíram as
   soluções falsas que a leitura das 60 achou (a pergunta de rumo ou preço, a
   pessoa olhada lida como revistar, o acampamento, a saída sem nome, o
   estranho, o ataque a quem a cena não tem, o esconder-se lido como ir às
   escondidas) e entrou o «sondar» da toca (a exceção da quest da prova). Um
   encaixe errado abre um dado e queima uma solução: perder um falso vale
   mais do que ganhar um número. */
t("piso das soluções nas peças da prova (90; era 100)", m.total.solucao >= 90, String(m.total.solucao));
t("teto dos frios nas peças da prova (100)", m.total.frio <= 100, String(m.total.frio));
t("piso dos testes de cena (70)", m.total.cena >= 70, String(m.total.cena));
/* FASE B (17/11): o teto sobe de 360 para 430, e de propósito. A pergunta de
   rumo, preço ou hora («onde fica a estalagem», «quanto custa») passou a ser
   livre (era a conversa da etapa: 3 dos 10 falsos encaixes da A2), «vou pela
   rua até» e «continuamos a caminhar até» passaram a ser ir (furo 1 da A2), e
   o acampamento é o descanso. As soluções não caíram (101) e o frio desceu
   (96 → 68): o livre que cresceu é o que a fase A2 contava como falso. */
t("teto do livre (430; era 360, e 586 na fase A)", m.total.livre <= 430, String(m.total.livre));
t("os números somam", m.total.solucao + m.total.cena + m.total.aquecimento + m.total.livre === m.total.n && m.total.esquenta + m.total.frio === m.total.aquecimento);

sec("§7 os cinco furos da fase A, em catraca (A2)");
const tipo = (f, p) => { const r = enc(f, p); return r ? r.tipo : null; };
/* furo 1: a ação legítima fora da etapa é TESTE DE CENA — não aquece, não gasta o relógio */
for (const [f, p, acao] of [["Pressiono o ferimento de Elowen com um pano.", ver, "estancar"], ["Faço um torniquete na perna de Elowen.", rasto, "estancar"], ["Arrebento as amarras.", ver, "arrebentar"], ["Rezo a Cura Leve sobre Elowen.", fera, "magia"]]) {
  const r = enc(f, p);
  t(`furo 1: «${f}» é teste de cena (${acao})`, r.tipo === "cena" && r.acao === acao && !!r.dado, J(r));
}
t("o teste de cena traz o dado do catálogo", (() => { const r = enc("Arrebento as amarras.", ver); return r.dado.pericia === "atletismo" && r.dado.dc === 13; })());
t("a ação da peça não é cena (investigar no curral é solução)", tipo("Examino com cuidado a porta, à procura de vestígios.", ver) === "solucao");
/* furo 2: a frase composta, por oração; a negação não é ação */
t("partirEmOracoes: e, vírgula, ponto, depois", J(partirEmOracoes("Pego a tocha, desço e escuto. Depois volto.")) === J(["Pego a tocha", "desço", "escuto", "volto"]), J(partirEmOracoes("Pego a tocha, desço e escuto. Depois volto.")));
t("partirEmOracoes: nunca dentro de aspas, nem entre dois nomes", partirEmOracoes("Digo: «vem, e já» e saio").length === 2 && partirEmOracoes("Vou a Sal e Pedra").length === 1);
const comp = enc(`Vou até ${pastora} e pergunto o que viu.`, rasto);
t("furo 2: «vou até X e pergunto Y» é a pergunta (a solução), e o ir segue em saidas", comp.tipo === "solucao" && comp.solucao === "fazer_falar@pastora" && !!comp.saidas && comp.saidas[0].qual === "ir", J(comp));
const nao = enc("Não vou ao homem ainda. Sento na margem.", ver);
t("furo 2: «Não vou ao homem ainda» não é ir", nao.tipo !== "livre", J(nao));
t("furo 2: «penso em ir até a ponte» não é ir", tipo("Penso em ir até a ponte.", ver) !== "livre");
const sai = enc("Vou à toca e procuro rastos.", rasto);
t("quem sai da cena age na chegada: é ir, e a busca fica para lá", sai.tipo === "livre" && sai.qual === "ir" && J(sai.naChegada) === J(["procuro rastos"]), J(sai));
t("a solução à vista ainda ganha ao ir que fica na cena", tipo("Vou até ao fundo do armazém e vasculho a palha.", ver) === "solucao");
/* furo 3: a conversa certa é solução na hora */
const dir = enc(`Pergunto a ${pastora} se ouviu o sino.`, rasto);
t("furo 3: perguntar a quem a etapa pede é a solução, com dado", dir.tipo === "solucao" && dir.solucao === "fazer_falar@pastora" && dir.dado.dc != null, J(dir));
t("furo 3: pedir é convencer", (enc(`Peço a ${pastora} que me conte tudo.`, rasto) || {}).solucao === "convencer@pastora", J(enc(`Peço a ${pastora} que me conte tudo.`, rasto)));
t("furo 3: a pergunta com preço é do balcão, não da etapa", tipo(`Pergunto a ${pastora} quanto custa um pão.`, rasto) === "livre");
t("furo 3: com quem a frase chama por um nome de fora, a conversa não cai em quem está", tipo("Hakon, de onde nos conhecemos? Pergunto isso a ele.", rasto) !== "solucao");
t("a tabela desliga numa linha", CONVERSA_DIRETA.ligada === true && typeof CONVERSA_DIRETA.porque === "string");
/* furo 4: o alvo por descrição */
const pela = (f) => [...aDescricao(f, fera.peca.cena).ids];
t("furo 4: «o tratador» acha Corwin pela cena", pela("Falo com o tratador.").length === 1);
t("furo 4: «a fera», «a besta», «o bicho» acham quem veio do covil", ["Ataco a fera.", "Olho a besta.", "Assusto o bicho."].every((f) => pela(f).length === 1 && pela(f)[0] !== pela("Falo com o tratador.")[0]));
t("furo 4: «ele» com um só candidato (no curral)", aDescricao("Pergunto a ele o que viu.", ver.peca.cena).ids.size === 1);
t("furo 4: o ofício de fora («o boticário») é alguém que não está", aDescricao("Pergunto ao boticário.", ver.peca.cena).fora === true);
/* furo 5: as famílias */
const sei = enc("O que sei de Alto Negro, da Agulha, de bichos assim?", fera);
t("furo 5: «O que sei de…» na toca não é ler o tratador (é teste de cena: lembrar)", sei.tipo === "cena" && sei.acao === "lembrar", J(sei));
t("furo 5: a intuição tem família própria", FAMILIA_DA_ACAO.mentira === "intuicao" && FAMILIA_DA_ACAO.lembrar === "saber");
t("furo 5: só trocam as ações que a tabela declara", J(acoesQueTrocamCom("convencer")) === J(["convencer", "fazer_falar"]) && J(acoesQueTrocamCom("impressionar")) === J(["impressionar"]) && Object.values(ACOES_QUE_SE_TROCAM).every((g) => typeof g.porque === "string"));
t("furo 5: sorrir para alguém não é perguntar aos vizinhos", tipo("Cruzo os braços e sorrio para o Teodoro.", ver) !== "solucao");
/* os falsos encaixes que a leitura das 60 soluções da A2 achou */
t("procurar ALGUÉM pelo nome não é revistar o sítio", tipo("Procuro a Lourdes ao balcão.", ver) !== "solucao" && tipo("Procuro o que o armazém esconde.", ver) === "solucao");
t("a fuga contada no passado não é fugir", tipo("Conto a verdade: fui escriba de um culto e fugi da ordem.", fera) !== "solucao" && LEITURAS_QUE_NAO_SAO.fugaPassada.test("de que fugi"));
t("prender a lâmina à cintura não é capturar", tipo("Pago a lâmina e prendo-a à cintura.", fera) !== "solucao");
t("o pronome depois de alguém de fora é dele («pergunto ao taverneiro como ele se chama»)", tipo("Peço uma caneca ao taverneiro e pergunto como ele se chama.", ver) !== "solucao");
t("as tabelas dos ajustes dizem porquê", [ORACAO, NAO_E_ACAO, SAIDA_DA_CENA, ALVO_POR_DESCRICAO, CENA_SEM_CATALOGO.magia].every((x) => typeof x.porque === "string") && PESO_DO_ENCAIXE.solucao > PESO_DO_ENCAIXE.cena && PESO_DO_ENCAIXE.cena > PESO_DO_ENCAIXE.aquece && PESO_DO_ENCAIXE.livre > PESO_DO_ENCAIXE.frio);
t("as famílias que aquecem e as que pedem a palavra são famílias de ação", [...Object.keys(FAMILIAS_QUE_AQUECEM), ...FAMILIAS_QUE_PEDEM_A_PALAVRA].every((f) => Object.values(FAMILIA_DA_ACAO).includes(f)) && PAPEIS_DO_ELENCO.includes("tratador"));
/* a solução que o calor já abriu rola pela frase que aponta para ela */
const aberto = comMemoria(rasto.estado, rasto.peca, { abertas: { "impressionar@pastora": 0 }, calor: { "impressionar@pastora": 3 }, queimadas: ["convencer@pastora", "fazer_falar@pastora"] });
const ab = encaixar(`Digo a ${pastora} que admiro a coragem dela.`, rasto.peca, aberto);
t("a solução aberta pelo calor aciona-se pela frase que aponta para ela", !!ab && ab.tipo === "solucao" && ab.solucao === "impressionar@pastora" && CALOR_DAS_PECAS.abertaAcionaPelaFrase === true, J(ab));

sec("§6 lixo e determinismo");
t("lixo dá null", [null, "", "   "].every((f) => encaixar(f, rasto.peca, {}) === null) && encaixar("ataco", null, {}) === null);
t("a mesma frase dá o mesmo encaixe", J(enc(`Sigo as pegadas na lama até ${toca}.`, rasto)) === J(r4));
t("sem o nome do sítio, o rasto cabe em dois (a toca e o curral): aquece os dois", (() => { const x = enc("Sigo as pegadas na lama.", rasto); return x.tipo === "aquecimento" && x.porque === "duas"; })());
t("o estado não muda", (() => { const a = J(rasto.estado); enc("Vasculho tudo.", rasto); return J(rasto.estado) === a; })());

console.log(`\n${bons} ok, ${maus} falha(s)`);
process.exit(maus ? 1 : 0);
