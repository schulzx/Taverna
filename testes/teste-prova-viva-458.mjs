/* teste-prova-viva-458.mjs — os três defeitos de motor que a prova viva da
   v9.458 achou (13/10; mente/diario.md, bloco v9.458, "o que a prova viva
   achou"). Falha na árvore de antes (v9.459) e passa na de depois:

     1. QUEM A HISTÓRIA PÕE NOUTRA CIDADE. O Neirin, que a espinha põe em
        Ponto da Fonte e o registo ainda não tinha, entrou no EM CENA e nas
        fichas de Nova do Norte quando a prosa o nomeou («Neirin está em O
        Pregão das Três Luas…»), e a pauta trouxe `QUEM CARREGA Neirin (é
        fato: entra nesta resposta…)` com ele a 8 h. A lista de longe só lia
        o registo (nucleo.js#longeDaHistoria; em-cena.js, subtramas.js);
     2. A SERPENTE QUE VIAJOU. Uma ficha «Serpente · sozinha» — a Serpente
        Rouca, a estalagem do Cedric — acompanhou o herói de Nova do Norte a
        Ponto da Fonte: o nome de um sítio lido como bicho, e as falas da
        cidade de antes a fazê-lo nascer de novo, carimbado no sítio novo
        (em-cena.js#BICHO_DO_SITIO);
     3. O DESARMAR QUE NUNCA ROLA. A sala de armadilha disparava (e ficava
        resolvida) no instante em que se entrava, e o teste de desarmar
        (que pede a armadilha em cena e por disparar) não tinha instante em
        que existir (masmorras.js#notarArmadilha e companhia). */
import fs from "node:fs";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (typeof cond === "function") { try { cond = cond(); } catch (e) { extra = String(e && e.message); cond = false; } } if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? "  → " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const S = "../src/";
const J = JSON.stringify;

const NU = await import(S + "nucleo.js");
const ST = await import(S + "subtramas.js");
const EC = await import(S + "em-cena.js");
const CE = await import(S + "cena.js");
const FI = await import(S + "fichas.js");
const MM = await import(S + "masmorras.js");
const D = await import(S + "desafios.js");
const { moldePorId } = await import(S + "moldes.js");
/* o que esta etapa trouxe, lido com rede: na árvore de antes falta, e a
   suíte tem de FALHAR asserção a asserção — não estourar na primeira */
const longeDaHistoria = NU.longeDaHistoria || (() => []);
const notarArmadilha = MM.notarArmadilha || (() => null);
const opcoesDaArmadilha = MM.opcoesDaArmadilha || (() => []);
const fecharArmadilha = MM.fecharArmadilha || (() => null);
const armadilhaNoCaminho = MM.armadilhaNoCaminho || (() => false);
const cdDaArmadilha = MM.cdDaArmadilha || (() => NaN);
const ARM = MM.ARMADILHA_DA_SALA || { notar: {}, contornar: {}, ficou: {}, opcoes: {} };
const SEM_PARADEIRO = (CE.QUEM_ESTA_AQUI || {}).semParadeiro || "paradeiro não registrado";

const pessoas = (l) => l.filter((x) => x.tipo === "pessoa").map((x) => x.nome);
const bichos = (l) => l.filter((x) => x.tipo === "criatura").map((x) => x.nome);

/* ============================================================
   1. QUEM A HISTÓRIA PÕE NOUTRA CIDADE
   ============================================================ */
sec("1a. longeDaHistoria: o registo, o núcleo e a espinha, cada um com a sua autoridade");
{
  const nucleo = { pessoas: [
    { nome: "Neirin", cidade: "Ponto da Fonte", papel: "elo", fonte: "doArco" },
    { nome: "Saoirse Vento-Frio", cidade: "Ponto da Fonte", papel: "companheiro", fonte: "grupo" },
    { nome: "Brannoc", cidade: "Nova do Norte", papel: "voz", fonte: "recorrente" },
    { nome: "Dolmen", cidade: "Ponto da Fonte", papel: "balanca", fonte: "recorrente", morto: true },
  ] };
  const espinha = { atos: [{ marcos: [{ quem: "Tomé Cardo", cidade: "Monte Rasa", onde: "a forja" }, { quem: "Brannoc", cidade: "Nova do Norte" }] }] };
  const L = longeDaHistoria({ cidade: "Nova do Norte", nucleo, espinha, longe: [{ nome: "Cedric", onde: "Nova Clara" }] });
  const nomes = L.map((x) => x.nome);
  t("o Neirin, que o núcleo põe em Ponto da Fonte, está longe de Nova do Norte", nomes.includes("Neirin") && (L.find((x) => x.nome === "Neirin") || {}).deOnde === "nucleo", J(L));
  t("quem só a espinha conhece (um marco noutra cidade) está longe", nomes.includes("Tomé Cardo") && (L.find((x) => x.nome === "Tomé Cardo") || {}).onde === "Monte Rasa");
  t("o registo de longe vai inteiro", nomes.includes("Cedric") && (L.find((x) => x.nome === "Cedric") || {}).deOnde === "registo");
  t("quem vive aqui não (o Brannoc, núcleo e espinha em Nova do Norte)", !nomes.includes("Brannoc"));
  t("o companheiro nasce do grupo: nunca está longe pelo núcleo", !nomes.includes("Saoirse Vento-Frio"));
  t("os mortos não contam", !nomes.includes("Dolmen"));
  t("quem anda com o herói nunca está longe, diga o registo o que disser", !longeDaHistoria({ cidade: "Nova do Norte", nucleo, longe: [{ nome: "Neirin" }], grupo: [{ nome: "Neirin" }] }).some((x) => x.nome === "Neirin"));
  t("o registo que SABE que a pessoa está aqui manda", !longeDaHistoria({ cidade: "Nova do Norte", nucleo, presentes: [{ nome: "Neirin", motivo: "vive em Nova do Norte" }] }).some((x) => x.nome === "Neirin"));
  t("o registo sem paradeiro não sabe nada: a história decide", longeDaHistoria({ cidade: "Nova do Norte", nucleo, presentes: [{ nome: "Neirin", motivo: SEM_PARADEIRO }] }).some((x) => x.nome === "Neirin"));
  t("o motivo do registo sem paradeiro é uma tabela só (cena.js), byte a byte o de antes", !!CE.QUEM_ESTA_AQUI && CE.elencoDaCena({ a: { nome: "Velha" } }, "Rio do Rio", null).aqui[0].motivo === CE.QUEM_ESTA_AQUI.semParadeiro && SEM_PARADEIRO === "paradeiro não registrado");
  t("se uma voz da história o põe AQUI, fica aqui (na dúvida, a regra de antes)", !longeDaHistoria({ cidade: "Nova do Norte", nucleo, espinha: { atos: [{ marcos: [{ quem: "Neirin", cidade: "Nova do Norte" }] }] } }).some((x) => x.nome === "Neirin"));
  t("na cidade dele, ninguém o põe longe", !longeDaHistoria({ cidade: "Ponto da Fonte", nucleo, espinha }).some((x) => x.nome === "Neirin"));
  t("sem cidade (na estrada, na masmorra aberta) só o registo fala", J(longeDaHistoria({ cidade: "", nucleo, espinha, longe: [{ nome: "Cedric" }] }).map((x) => x.nome)) === J(["Cedric"]));
  t("a tabela diz o porquê", !!NU.LONGE_DA_HISTORIA && !!NU.LONGE_DA_HISTORIA.porque && NU.LONGE_DA_HISTORIA.fontesQueAndam.includes("grupo"));
  t("o lixo não estoura", [null, undefined, 7, "x", {}, { nucleo: null, espinha: "x", longe: {}, presentes: null, cidade: 3 }].every((x) => Array.isArray(NU.longeDaHistoria ? NU.longeDaHistoria(x) : null)));
  const cong = Object.freeze({ cidade: "Nova do Norte", nucleo: Object.freeze(nucleo), espinha: Object.freeze(espinha), longe: Object.freeze([]) });
  t("não muta o que recebe, e é determinístico", J(longeDaHistoria(cong)) === J(longeDaHistoria(cong)));
}

sec("1b. o EM CENA e as fichas: o Neirin citado em Nova do Norte não está à frente");
{
  const nucleo = { pessoas: [{ nome: "Neirin", cidade: "Ponto da Fonte", papel: "elo", eraDoHeroi: "o vendedor de ervas" }] };
  const fala = "Neirin está em O Pregão das Três Luas, em Ponto da Fonte, a quase dez quilómetros ao norte. Neirin ergue a caneca, contam os que o viram partir.";
  const ctx = { semente: "s458", turno: 9, cidade: "Nova do Norte", mostrado: [fala], emCena: ["Neirin"], nucleo, presentes: [] };
  const l = EC.montarEmCena(ctx);
  t("em Nova do Norte, o Neirin não entra na lista (era: à vista, com ficha)", !pessoas(l).includes("Neirin"), J(pessoas(l)));
  const fichas = FI.fichasDaCena(l, { mostrado: [fala] });
  t("…nem nas fichas", !fichas.some((f) => /Neirin/.test(J(f))));
  const linha = (EC.pautaComEmCena({ onde: ["em Nova do Norte"] }, l, {}).emCena || [])[0] || "";
  t("…nem na linha EM CENA da pauta", !/Neirin/.test(linha), linha);
  /* só a espinha o conhece, e o registo guardou-o sem paradeiro (o que a
     prosa «Neirin está em…» fazia o Cronista escrever) */
  const soEspinha = EC.montarEmCena({ ...ctx, nucleo: null, emCena: [], espinha: { atos: [{ marcos: [{ quem: "Neirin", cidade: "Ponto da Fonte" }] }] }, presentes: [{ nome: "Neirin", motivo: SEM_PARADEIRO }] });
  t("o registo sem paradeiro e a espinha noutra cidade: longe", !pessoas(soEspinha).includes("Neirin"), J(pessoas(soEspinha)));
  const la = EC.montarEmCena({ ...ctx, cidade: "Ponto da Fonte" });
  t("em Ponto da Fonte, o mesmo Neirin citado está à frente", la.some((x) => x.tipo === "pessoa" && x.nome === "Neirin" && x.aqui), J(pessoas(la)));
  t("o registo que o põe aqui ganha à espinha (memória mais nova)", EC.montarEmCena({ ...ctx, nucleo: null, emCena: [], espinha: { atos: [{ marcos: [{ quem: "Neirin", cidade: "Ponto da Fonte" }] }] }, presentes: [{ nome: "Neirin", motivo: "vive em Nova do Norte" }] }).some((x) => x.nome === "Neirin"));
}

sec("1c. QUEM CARREGA e QUEM É: a batida é de quem está à frente (o núcleo da 9.ª sessão)");
{
  const R9 = JSON.parse(fs.readFileSync("./registo-s9-historia.json", "utf8"));
  const C = R9.campanha;
  const semente = `${C.nomeCampanha}|${C.genero}`;
  const ctxN = { genero: C.genero, molde: moldePorId(C.molde), lex: C.lexico, espinha: R9.espinha, guildas: R9.guildas, base: R9.baseMundo, estado: R9.elencoMem, npcs: R9.npcs };
  const nucleo = NU.nucleoDaCampanha(semente, R9.mapa, { ...ctxN, grupo: R9.personagem.grupo, antecedente: R9.personagem.antecedente, reviravolta: null });
  const oren = nucleo.pessoas.find((p) => p.papel === "elo");
  const subs = ST.subtramasDoNucleo(nucleo, { semente, espinha: R9.espinha });
  const um = (extra) => ST.avancarCoracao(null, nucleo, { semente, espinha: R9.espinha, dia: 1, ato: 0, turno: 9, emCena: [oren.nome], ultimas: {}, subtramas: subs, ...extra });
  t("o elo é o Oren Trançado, de Buraco Norte", !!oren && oren.cidade === "Buraco Norte");
  const aqui = um({ cidade: "Buraco Norte" });
  t("em Buraco Norte, citado pela prosa, ele PEDE (está à frente)", aqui.quem === oren.nome && (aqui.batida || {}).tipo === "pedido", J(aqui.batida));
  const longe = um({ cidade: "Rio do Rio" });
  t("em Rio do Rio, citado pela prosa, nenhuma linha dele «entra nesta resposta» (era: QUEM CARREGA com ele a dias)", longe.quem !== oren.nome && !String(longe.linha).includes(oren.nome), longe.linha);
  t("…e o arco dele não anda (o pedido fica por fazer)", !((longe.coracao.arcos || {})[oren.nome] || {}).pedido);
  t("o registo que o põe longe basta, mesmo sem cidade (na estrada)", um({ cidade: "", longe: [{ nome: oren.nome, onde: "Buraco Norte" }] }).quem !== oren.nome);
  t("sem cidade e sem registo, a regra de antes (o citado está à frente)", um({ cidade: "" }).quem === oren.nome);
  t("a porta do elo continua aberta na cidade dele: a linha diz que ele VEM ter com o herói", (() => { const r = um({ cidade: "Buraco Norte", emCena: [] }); return r.quem === oren.nome && !!(r.batida || {}).pelaPorta && r.linha.includes("vem ter com o herói"); })());
  t("a porta nunca abre longe dele", !um({ cidade: "Rio do Rio", emCena: [] }).linha.includes(oren.nome));
  /* QUEM É */
  const qe = (extra) => NU.quemEParaPauta(nucleo, { emCena: [oren.nome], ato: 0, ultimoAto: 2, turno: 9, ultimas: {}, cenas: {}, ...extra });
  t("QUEM É: em Buraco Norte, a ficha dele vai", qe({ cidade: "Buraco Norte" }).quem === oren.nome);
  t("QUEM É: em Rio do Rio, não (era: a ficha de quem está a dias)", qe({ cidade: "Rio do Rio" }).quem !== oren.nome, J(qe({ cidade: "Rio do Rio" })));
  t("QUEM É: sem cidade nem registo, byte a byte a de antes", J(qe({})) === J(NU.quemEParaPauta(nucleo, { emCena: [oren.nome], ato: 0, ultimoAto: 2, turno: 9, ultimas: {}, cenas: {} })) && qe({}).quem === oren.nome);
  const ctxCong = Object.freeze({ semente, espinha: R9.espinha, dia: 1, ato: 0, turno: 9, emCena: Object.freeze([oren.nome]), ultimas: Object.freeze({}), subtramas: subs, cidade: "Rio do Rio", longe: Object.freeze([]) });
  t("o coração não muta o que recebe, e é determinístico", J(ST.avancarCoracao(null, nucleo, ctxCong)) === J(ST.avancarCoracao(null, nucleo, ctxCong)));
}

/* ============================================================
   2. A SERPENTE QUE VIAJOU
   ============================================================ */
sec("2a. o nome de um sítio não é um bicho");
{
  const base = { semente: "s458", turno: 4, cidade: "Nova do Norte", presentes: [] };
  t("«na Serpente Rouca» é a estalagem, não uma serpente", !bichos(EC.montarEmCena({ ...base, mostrado: ["Cedric costuma beber na Serpente Rouca, ao fundo da rua dos curtidores."] })).length);
  t("«no Javali Cambaleante» também", !bichos(EC.montarEmCena({ ...base, mostrado: ["Você janta no Javali Cambaleante e ouve as notícias."] })).length);
  t("o sítio que o registo conhece sai do texto mesmo sem locativo (o local do Cedric)", !bichos(EC.montarEmCena({ ...base, presentes: [{ nome: "Cedric", local: "A Serpente Rouca" }], mostrado: ["A Serpente Rouca está cheia esta noite."] })).length);
  t("…e os sítios que o App passa (ctx.lugares)", !bichos(EC.montarEmCena({ ...base, lugares: ["Corvo Torto"], mostrado: ["O Corvo Torto fecha cedo."] })).length);
  t("uma serpente de verdade continua a ser vista", J(bichos(EC.montarEmCena({ ...base, mostrado: ["Uma serpente desliza entre as pedras do muro."] }))) === J(["Serpente"]));
  t("…mesmo ao lado da estalagem", J(bichos(EC.montarEmCena({ ...base, mostrado: ["Uma serpente desliza para dentro da Serpente Rouca."] }))) === J(["Serpente"]));
  t("o rato gigante da 9.ª (com artigo, minúscula) não muda", J(bichos(EC.montarEmCena({ ...base, mostrado: ["Dois ratos gigantes farejam o chão da adega."] }))).includes("Rato"));
  t("a tabela diz os locativos e o porquê", !!EC.BICHO_DO_SITIO && EC.BICHO_DO_SITIO.locativos.includes("na") && !!EC.BICHO_DO_SITIO.porque);
}

sec("2b. o bicho fica na cidade onde foi visto");
{
  const fala = "Uma serpente desliza entre as pedras do muro.";
  const a = EC.montarEmCena({ semente: "s458", turno: 3, cidade: "Nova do Norte", mostrado: ["Bom dia.", fala], presentes: [] });
  t("em Nova do Norte, a serpente da prosa está em cena", J(bichos(a)) === J(["Serpente"]));
  const b = EC.montarEmCena({ semente: "s458", turno: 4, cidade: "Ponto da Fonte", mostrado: ["Bom dia.", fala], presentes: [], antes: a });
  t("à chegada a Ponto da Fonte, as falas de Nova do Norte não a trazem (era: a serpente, carimbada no sítio novo)", !bichos(b).length, J(bichos(b)));
  t("as fichas da chegada também não", !FI.fichasDaCena(b, { mostrado: ["Bom dia.", fala] }).some((f) => /Serpente/.test(J(f))));
  const f = EC.montarEmCena({ semente: "s458", turno: 5, cidade: "Ponto da Fonte", mostrado: [fala, "A praça ferve de gente."], presentes: [], antes: b });
  t("enquanto a fala de lá está na janela, nem as fichas do turno seguinte", !bichos(f).length, J(bichos(f)));
  const c = EC.montarEmCena({ semente: "s458", turno: 6, cidade: "Ponto da Fonte", mostrado: ["A praça ferve de gente.", "Um lobo uiva perto da fonte."], presentes: [], antes: f });
  t("o que a prosa NOVA mostra, nasce — e a serpente não volta pela memória", J(bichos(c)) === J(["Lobo"]), J(bichos(c)));
  t("a lista não perde a forma: nenhuma coisa ganhou campo", J(Object.keys(a[0] || {}).sort()) === J(Object.keys(EC.montarEmCena({ semente: "s458", turno: 3, cidade: "Nova do Norte", mostrado: ["Bom dia.", fala], presentes: [] })[0] || {}).sort()) && !("naCidade" in (a[0] || {})));
  t("o carimbo é da lista, e sabe a cidade", a.naCidade === "nova do norte" && Array.isArray(b.falasDeFora) && b.falasDeFora.length === 2);
  t("sem lista de antes (o save, o primeiro turno), a regra de antes", J(bichos(EC.montarEmCena({ semente: "s458", turno: 4, cidade: "Ponto da Fonte", mostrado: ["Bom dia.", fala], presentes: [] }))) === J(["Serpente"]));
  t("na mesma cidade, a mesma fala continua a valer de um turno ao outro", J(bichos(EC.montarEmCena({ semente: "s458", turno: 4, cidade: "Nova do Norte", mostrado: [fala, "Ele cospe no chão."], presentes: [], antes: a }))) === J(["Serpente"]));
  t("o encontro da estrada (o App guarda o trecho) continua a entrar", J(bichos(EC.montarEmCena({ semente: "s458", turno: 4, cidade: "Ponto da Fonte", mostrado: [], encontro: { criatura: "Lobo Cinzento", quantos: 2 }, antes: a }))) === J(["Lobo Cinzento"]));
  const congA = Object.freeze([...a]);
  t("o lixo no carimbo não estoura", Array.isArray(EC.montarEmCena({ semente: "s458", cidade: "x", mostrado: [fala], antes: Object.assign([null, 3], { naCidade: 7, falasDeFora: "x" }) })) && Array.isArray(EC.montarEmCena({ cidade: "x", antes: congA })));
  t("determinístico", J(EC.montarEmCena({ semente: "s458", turno: 4, cidade: "Ponto da Fonte", mostrado: ["Bom dia.", fala], antes: a })) === J(b));
}

/* ============================================================
   3. O DESARMAR QUE NUNCA ROLAVA
   ============================================================ */
sec("3. a armadilha que se vê antes de morder");
{
  const mm = { nome: "Cripta do Sino Rachado", atual: 2, tochas: 3, ritmo: "normal", chave: false, salas: [
    { id: 1, tipo: "entrada", camada: 0, resolvida: true, visitada: true, saidas: [2], pista: "" },
    { id: 2, tipo: "armadilha", camada: 2, nomeArmadilha: "dardos disparados das paredes", dano: 7, saidas: [3], visitada: true, pista: "buracos regulares nas paredes" },
    { id: 3, tipo: "tesouro", camada: 3, saidas: [], pista: "um brilho fraco reflete lá no fundo" } ] };
  /* o objetoEmCena do App (v9.458, ~19658): a sala atual é de armadilha, não resolvida, não disparada */
  const emCena = (m) => (o) => { const s = (m.salas || []).find((x) => x.id === m.atual); return o === "armadilha" && !!s && s.tipo === "armadilha" && s.resolvida !== true && !s.disparou; };
  const ctxD = (m) => ({ personagem: { nivel: 1 }, semente: "s458", lugar: "a cripta", tentativas: {}, dia: 2, objetoEmCena: emCena(m) });
  const desarma = (m) => { const v = D.lerAcao("Desarmo a armadilha.", ctxD(m)); return !!v && v.id === "desarmar"; };

  /* o caminho de hoje no App: entrar = marcarResolvida e disparar */
  t("o defeito, medido: entrar e resolver no mesmo passo deixa o desarmar sem instante", !desarma(MM.marcarResolvida(mm, 2)));

  const T = ARM.notar || {};
  t("a dificuldade sai da tabela, e sobe com a camada (camada 2 → 14)", cdDaArmadilha(mm.salas[1]) === T.base + 2 * T.porCamada && cdDaArmadilha({ tipo: "armadilha", camada: 40 }) === T.max);
  t("a armadilha oculta da sala manda na dificuldade", cdDaArmadilha({ ...mm.salas[1], segredo: { tipo: "armadilha_oculta", cd: 16 } }) === 16 && cdDaArmadilha({ ...mm.salas[1], segredo: { tipo: "esconderijo", cd: 9 } }) === 14);

  const naoViu = notarArmadilha(mm, { passiva: 13 });
  t("passiva abaixo da dificuldade: não nota, e o mm é o mesmo (dispara como hoje)", !!naoViu && naoViu.notou === false && naoViu.mm === mm && naoViu.cd === 14);
  const viu = notarArmadilha(mm, { passiva: 14 });
  t("passiva que a alcança: nota, e a sala fica ARMADA, por resolver", !!viu && viu.notou === true && viu.mm.salas[1].armada === true && viu.mm.salas[1].resolvida !== true);
  t("a linha diz o número e a armadilha", !!viu && viu.linha.includes("14 vs 14") && viu.linha.includes("dardos disparados das paredes"), viu && viu.linha);
  t("não muta o mm recebido", mm.salas[1].armada === undefined && mm.salas[1].resolvida === undefined);
  t("o desarmar passa a ter o seu instante: diante dela, «desarmo a armadilha» rola", !!viu && desarma(viu.mm));

  const ops = opcoesDaArmadilha(viu && viu.mm, {});
  t("as três saídas, cada uma com o preço antes do clique", J(ops.map((o) => o.id)) === J(["desarmar", "contornar", "correr"]) && ops.every((o) => o.rotulo && o.preco));
  t("o preço de passar diz o dano da sala; o de contornar, o tempo e a tocha da tabela", () => ops[2].preco.includes("7") && ops[1].preco.includes(String(ARM.contornar.minutos)));
  t("sem tocha para gastar, contornar não se oferece", J(opcoesDaArmadilha(viu && viu.mm, { tochas: 0 }).map((o) => o.id)) === J(["desarmar", "correr"]));
  t("o botão de desarmar é a frase que o teste lê", !!(ops[0] && D.lerAcao(ops[0].frase, ctxD(viu.mm)) && D.lerAcao(ops[0].frase, ctxD(viu.mm)).id === "desarmar"));

  t("seguir em frente com ela armada passa por cima dela; voltar não", armadilhaNoCaminho(viu && viu.mm, 3) === true && armadilhaNoCaminho(viu && viu.mm, 1) === false && armadilhaNoCaminho(mm, 3) === false);
  const pauta = MM.masmorraParaPauta(viu && viu.mm);
  t("a pauta diz que ela está à vista e armada", pauta.some((l) => l.includes("à vista e armada") && l.includes("dardos")), J(pauta));

  const des = fecharArmadilha(viu && viu.mm, "desarmada");
  t("desarmada: a sala resolve-se sem disparar, e o desarmar volta a não ter objeto", !!des && des.mm.salas[1].resolvida === true && des.mm.salas[1].desarmada === true && !des.mm.salas[1].disparou && !desarma(des.mm));
  t("…e a volta e a pauta dizem que foi desarmada (não «já disparou»)", () => MM.voltarASalaLimpa(des.mm.salas[1], { pos: "x" }).envelope.includes("desarmada") && MM.masmorraParaPauta(des.mm).some((l) => l.includes("desarmada")));
  const con = fecharArmadilha(viu && viu.mm, "contornada");
  t("contornada: o tempo e a tocha da tabela, nenhuma pele", !!con && con.minutos === ARM.contornar.minutos && con.mm.tochas === 3 - ARM.contornar.tochas && con.mm.salas[1].resolvida === true);
  const dis = fecharArmadilha(viu && viu.mm, "disparou");
  t("disparou (o teste falhou, ou passou assim mesmo): resolvida e disparada", !!dis && dis.mm.salas[1].disparou === true && dis.mm.salas[1].resolvida === true);
  t("o save de antes (resolvida, sem dizer como) continua «já disparou»", MM.voltarASalaLimpa({ ...mm.salas[1], resolvida: true }, {}).linha === MM.SALA_LIMPA.armadilha.linha);
  t("quem a viu salta com vantagem (tabela)", !!ARM.correr && ARM.correr.vantagem === true);

  /* a busca de quem anda com cautela */
  const caut = { ...mm, ritmo: "cauteloso" };
  const r1 = notarArmadilha(caut, { passiva: 10, mod: 3, ritmo: "cauteloso", sorte: () => 0.9 });
  t("o cauteloso procura: rola d20 + Percepção e fica com o melhor (19 + 3 = 22)", !!r1 && r1.notou && !!r1.rolou && r1.rolou.total === 22 && r1.linha.includes("22 vs 14"), r1 && r1.linha);
  const r2 = notarArmadilha(caut, { passiva: 10, mod: 3, ritmo: "cauteloso", sorte: () => 0 });
  t("…e o dado baixo não a acha (1 + 3 = 4)", !!r2 && r2.notou === false);
  t("o passo normal não rola nada (sorte nunca chamada)", (() => { let n = 0; notarArmadilha(mm, { passiva: 10, ritmo: "normal", sorte: () => { n++; return 0.99; } }); return n === 0; })());
  t("mesma sorte, mesmo desfecho", J(notarArmadilha(caut, { passiva: 10, mod: 3, ritmo: "cauteloso", sorte: () => 0.5 })) === J(notarArmadilha(caut, { passiva: 10, mod: 3, ritmo: "cauteloso", sorte: () => 0.5 })));
  t("a armadilha oculta já vista pela passiva (checarPassiva) conta como notada", (() => { const m = { ...mm, salas: mm.salas.map((s) => (s.id === 2 ? { ...s, segredo: { tipo: "armadilha_oculta", cd: 18, revelado: true } } : s)) }; const r = notarArmadilha(m, { passiva: 5 }); return !!r && r.notou; })());
  t("nada a notar: outra sala, sala resolvida, armadilha já à vista, lixo", notarArmadilha({ ...mm, atual: 3 }, { passiva: 30 }) === null && notarArmadilha(MM.marcarResolvida(mm, 2), { passiva: 30 }) === null && notarArmadilha(viu && viu.mm, { passiva: 30 }) === null && [null, undefined, {}, { salas: null }].every((x) => notarArmadilha(x, null) === null));
  t("o lixo nos outros também não estoura", fecharArmadilha(null, "desarmada") === null && fecharArmadilha(viu && viu.mm, "explodiu") === null && J(opcoesDaArmadilha(null, null)) === "[]" && armadilhaNoCaminho(null, 3) === false);
}

console.log(`\n${ok} ok · ${mal} falha(s)`);
if (mal) process.exit(1);
