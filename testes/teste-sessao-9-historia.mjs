/* teste-sessao-9-historia.mjs — os consertos de motor da 9.ª sessão de prova,
   a frente da HISTÓRIA (12/10)

   `mente/mm11-sessao-9.md` ("A revelação: por que não houve", "O núcleo",
   "A coerência", os defeitos 4, 5 e 6), cada conserto preso ao que a sessão
   deu de verdade — o save final, a sequência dos turnos (a cidade, quem o
   Mestre tinha nomeado, a frase do jogador) e a pauta do M12 —, recortado
   do registo em `registo-s9-historia.json`. Falha na árvore de antes
   (v9.432) e passa na de depois:

     1. o elo que não vem: Oren Trançado esteve na lista da cidade em todas
        as pautas e em nenhuma fala; o jogador procurou-o pelo papel que o
        sistema escreveu ("mestre de recados") e o Mestre inventou um velho
        que tinha partido. (a) a procura pelo papel acha-o; (b) a porta do
        elo trá-lo a cena no ato dele, sem esperar o acaso;
     2. o tique que contagia: "criança" saiu da voz da Brina Pedra para a
        boca de 14 de 48 respostas — a voz diz agora que é só dela, e com o
        nome que é só dela;
     3. o registo de gente: o sobrenome do herói virou NPC, a Brina
        serviçal acordou dentro do nome da Brina Pedra, e a taverneira Kira
        do Vale chegou à pauta como "taverneiro(a)". */
import fs from "node:fs";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (typeof cond === "function") { try { cond = cond(); } catch (e) { extra = String(e && e.message); cond = false; } } if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? "  → " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const S = "../src/";

const NU = await import(S + "nucleo.js");
const ST = await import(S + "subtramas.js");
const PR = await import(S + "procura.js");
const NP = await import(S + "npcs.js");
const MB = await import(S + "mundo-base.js");
const { moldePorId } = await import(S + "moldes.js");
const R9 = JSON.parse(fs.readFileSync("./registo-s9-historia.json", "utf8"));
/* o que esta etapa trouxe, lido com rede: na árvore de antes falta, e a
   suíte tem de FALHAR asserção a asserção — não estourar na primeira */
const papelProcurado = PR.papelProcurado || (() => null);
const PORTA = ST.PORTA_DO_ELO || { turnoMin: 0, volta: 0, chega: "\u0000", quem: "\u0000" };

const C = R9.campanha;
const semente = `${C.nomeCampanha}|${C.genero}`;
const molde = moldePorId(C.molde);
const ctxN = { genero: C.genero, molde, lex: C.lexico, espinha: R9.espinha, guildas: R9.guildas, base: R9.baseMundo, estado: R9.elencoMem, npcs: R9.npcs };
const nucleo = NU.nucleoDaCampanha(semente, R9.mapa, { ...ctxN, grupo: R9.personagem.grupo, antecedente: R9.personagem.antecedente, reviravolta: null });
const quem = (papel) => nucleo.pessoas.find((p) => p.papel === papel);
const oren = quem("elo"), brina = quem("voz");
const subs = ST.subtramasDoNucleo(nucleo, { semente, espinha: R9.espinha });

/* a sequência real, turno a turno: o que o App passa ao coração. `comCidade`
   diz se o App já passa a cidade do herói (a fiação desta etapa). */
function repetir({ comCidade = true } = {}) {
  let cor = null;
  const ultimas = {};
  const linhas = [];
  for (const x of R9.turnos) {
    const r = ST.avancarCoracao(cor, nucleo, { semente, espinha: R9.espinha, dia: x.dia, ato: 0, turno: x.turno, emCena: x.emCena, ultimas, subtramas: subs, frase: x.frase, ...(comCidade ? { cidade: x.cidade } : {}) });
    if (r.linha) { linhas.push({ turno: x.turno, cidade: x.cidade, quem: r.quem, tipo: r.batida.tipo, porta: !!r.batida.pelaPorta, linha: r.linha }); ultimas[r.quem] = x.turno; cor = r.coracao; }
  }
  return linhas;
}

/* ============================================================ */
sec("0. o núcleo da 9.ª, refeito do save");
{
  t("o elo é Oren Trançado, de Buraco Norte, o mestre de recados da guilda", !!oren && oren.nome === "Oren Trançado" && oren.cidade === "Buraco Norte" && oren.eraDoHeroi === "o mestre de recados da guilda");
  t("a voz é a Brina Pedra, e o antecedente é o do Filho da Guilda", !!brina && brina.nome === "Brina Pedra" && nucleo.antecedente === "ladrao");
  t("a sequência tem os 42 turnos de jogador, de Buraco Norte a Rio do Rio e de volta", R9.turnos.length === 42 && R9.turnos.some((x) => x.cidade === "Rio do Rio") && R9.turnos.some((x) => x.cidade === ""));
}

/* ============================================================ */
sec("1a. o elo pelo papel que o herói sabe (M47)");
{
  const m47 = R9.turnos.find((x) => x.m === 47);
  t("a frase do M47 é uma procura", PR.ehProcura(m47.frase), m47.frase);
  const pp = papelProcurado(m47.frase, nucleo);
  t("«procuro meu antigo mestre de recados» é o Oren", !!pp && pp.nome === "Oren Trançado" && pp.papel === oren.eraDoHeroi && pp.cidade === "Buraco Norte", JSON.stringify(pp));
  /* as quatro vezes que o jogador perguntou pelo papel, e nenhuma outra */
  const pelos = R9.turnos.filter((x) => papelProcurado(x.frase, nucleo)).map((x) => x.m);
  t(`na sessão inteira, só as quatro perguntas pelo papel acham o elo (M${pelos.join(", M")})`, pelos.join() === "16,19,21,47");
  t("«recados» sozinho não procura ninguém (deixar um recado ao Tomas)", !papelProcurado("Procuro o Tomas para lhe deixar um recado.", nucleo) && !papelProcurado("Pergunto se posso deixar recados aqui.", nucleo));
  t("todo antecedente tem como o nomear, e cada alternativa diz alguma coisa", Object.keys(NU.ELO_DO_ANTECEDENTE).every((k) => Array.isArray((NU.PROCURA_DO_ELO || {})[k]) && NU.PROCURA_DO_ELO[k].length > 0 && NU.PROCURA_DO_ELO[k].every((a) => Array.isArray(a) && a.length && a.every((r) => typeof r === "string" && r.length >= 4 && r === r.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()))));
  t("o lixo não estoura e não acha ninguém", [null, undefined, "", 7].every((f) => papelProcurado(f, nucleo) === null) && [null, {}, { pessoas: null }, { pessoas: [{ nome: "X", papel: "voz" }] }].every((n) => papelProcurado(m47.frase, n) === null));

  /* a resposta do mundo: está aqui (a base da cidade tem-no) */
  const genteBN = MB.oQueExisteAqui(semente, R9.mapa, "Buraco Norte", R9.baseMundo, C.genero, molde, C.lexico).gente;
  const r = PR.procurarPessoa(pp ? pp.nome : "", { npcs: R9.npcs, grupo: R9.personagem.grupo, genteDaqui: genteBN, espinha: R9.espinha, base: R9.baseMundo, cidadeAtual: "Buraco Norte", mapa: R9.mapa, porPapel: pp });
  t("em Buraco Norte: ESTÁ AQUI, e a resposta sabe que foi procurado pelo papel", !!r && r.desfecho === "aqui" && r.nome === "Oren Trançado" && r.porPapel === oren.eraDoHeroi, JSON.stringify(r));
  const env = PR.envelopeDaProcura(r);
  t("o envelope diz o nome, como fato, ao lado do papel", env.includes("chama-se Oren Trançado") && env.includes("o mestre de recados da guilda") && env.includes("ESTÁ AQUI"), env);
  t("e a linha que o jogador lê liga os dois", PR.linhaDaProcura(r).includes("Oren Trançado (o mestre de recados da guilda)"), PR.linhaDaProcura(r));
  /* de Rio do Rio: noutro lugar, com o rumo — o núcleo sabe onde ele vive */
  const genteRR = MB.oQueExisteAqui(semente, R9.mapa, "Rio do Rio", R9.baseMundo, C.genero, molde, C.lexico).gente;
  const r2 = PR.procurarPessoa(pp ? pp.nome : "", { npcs: R9.npcs, grupo: R9.personagem.grupo, genteDaqui: genteRR, espinha: R9.espinha, base: R9.baseMundo, cidadeAtual: "Rio do Rio", mapa: R9.mapa, porPapel: pp });
  t("em Rio do Rio: noutro lugar, em Buraco Norte, com o rumo (antes: «ninguém passou por aqui»)", !!r2 && r2.desfecho === "noutro_lugar" && r2.onde === "Buraco Norte" && !!r2.rumo && r2.porPapel === oren.eraDoHeroi, JSON.stringify(r2));
  t("sem papel, a procura é a de sempre", JSON.stringify(PR.procurarPessoa("Oren Trançado", { genteDaqui: genteBN, cidadeAtual: "Buraco Norte" })) === JSON.stringify(PR.procurarPessoa("Oren Trançado", { genteDaqui: genteBN, cidadeAtual: "Buraco Norte", porPapel: null })) && !("porPapel" in (PR.procurarPessoa("Oren Trançado", { genteDaqui: genteBN, cidadeAtual: "Buraco Norte" }) || {})));
}

/* ============================================================ */
sec("1b. a porta do elo: ele vem ter com o herói, no ato dele");
{
  const antes = repetir({ comCidade: false });
  t("sem a cidade (o App de antes), o Oren não entra em nenhum dos 42 turnos — o defeito", !antes.some((l) => l.quem === "Oren Trançado"), antes.map((l) => l.quem).join(","));
  const depois = repetir();
  const doOren = depois.filter((l) => l.quem === "Oren Trançado");
  const est = doOren[0];
  const primeiroEmBN = R9.turnos.find((x) => x.cidade === "Buraco Norte" && x.turno >= PORTA.turnoMin);
  t(`com a cidade, ele estreia no turno ${est ? est.turno : "—"}: o primeiro em Buraco Norte a partir do ${PORTA.turnoMin}.º`, !!est && !!primeiroEmBN && est.turno === primeiroEmBN.turno && est.tipo === "pedido" && est.porta);
  t("a estreia diz quem ele é para o herói, que vem ter com ele, e o pedido dele", !!est && est.linha.startsWith("Oren Trançado (o mestre de recados da guilda, do passado do herói; é fato: vem ter com o herói e entra nesta resposta, dito por ele): PEDE ao herói:") && est.linha.length <= ST.LINHA_DO_CORACAO.max, est && est.linha);
  t("as duas pistas vêm depois, pela mesma porta, de volta em volta", doOren.length >= 3 && doOren[1].tipo === "pistaA" && doOren[2].tipo === "pistaB" && doOren.slice(1).every((l, i) => l.turno - doOren[i].turno >= PORTA.volta), doOren.map((l) => `${l.turno}:${l.tipo}`).join(" "));
  t("e nunca fora da cidade dele (nem na estrada, nem em Rio do Rio)", depois.filter((l) => l.porta).every((l) => l.cidade === "Buraco Norte"));
  t("toda linha da porta cabe e diz que ele chega", depois.filter((l) => l.porta).every((l) => l.linha.length <= ST.LINHA_DO_CORACAO.max && l.linha.includes("vem ter com o herói")));
  t("as outras batidas do núcleo continuam todas lá (a Brina pede no mesmo turno do M12)", antes.every((a) => depois.some((d) => d.quem === a.quem && d.tipo === a.tipo)) && depois.some((d) => d.quem === "Brina Pedra" && d.tipo === "pedido" && d.turno === antes.find((a) => a.quem === "Brina Pedra").turno));
  /* as portas fechadas */
  const um = (extra) => ST.avancarCoracao(null, nucleo, { semente, espinha: R9.espinha, dia: 1, ato: 0, turno: 9, emCena: [], ultimas: {}, subtramas: subs, cidade: "Buraco Norte", ...extra });
  t("antes do turno mínimo, não", !um({ turno: PORTA.turnoMin - 1 }).linha);
  t("na luta, não (o pedido não é de luta)", !um({ luta: true }).linha);
  t("noutra cidade, ou sem cidade (em viagem, na masmorra), não", !um({ cidade: "Rio do Rio" }).linha && !um({ cidade: "" }).linha && !um({ cidade: null }).linha);
  t("dentro da volta desde a última linha dele, não", !um({ ultimas: { "Oren Trançado": 9 - PORTA.volta + 1 } }).linha && !!um({ ultimas: { "Oren Trançado": 9 - PORTA.volta } }).linha);
  t("depois da verdade dita, a porta fecha", !ST.avancarCoracao({ v: 1, arcos: { "Oren Trançado": { pedido: 1, pistas: [1, 1], crise: 1, ato: 0 } } }, nucleo, { semente, espinha: R9.espinha, dia: 1, ato: 0, turno: 30, emCena: [], ultimas: {}, subtramas: subs, cidade: "Buraco Norte" }).linha);
  t("morto, a porta não o traz (o corpo é outra batida)", (um({ mortos: ["Oren Trançado"] }).batida || {}).pelaPorta !== true);
  const ctxCong = Object.freeze({ semente, espinha: R9.espinha, dia: 1, ato: 0, turno: 9, emCena: Object.freeze([]), ultimas: Object.freeze({}), subtramas: subs, cidade: "Buraco Norte" });
  t("não muta o que recebe", (() => { ST.avancarCoracao(null, nucleo, ctxCong); return true; })());
  t("determinístico", JSON.stringify(repetir()) === JSON.stringify(depois));
}

/* ============================================================ */
sec("2. a voz é só de quem a tem (o «criança» do M12)");
{
  const velha = R9.m12.linha;
  t("a pauta do M12 dizia «(voz da Brina:» — o primeiro nome, e sem dono só", velha.includes("(voz da Brina: trata toda a gente por \"criança\""));
  const genteBN = MB.oQueExisteAqui(semente, R9.mapa, "Buraco Norte", R9.baseMundo, C.genero, molde, C.lexico).gente.map((p) => p.nome);
  t("…e Buraco Norte tem OUTRA Brina, a serviçal: o primeiro nome não era dela só", genteBN.includes("Brina") && genteBN.includes("Brina Pedra"));
  const linhas = repetir();
  const m12 = linhas.find((l) => l.quem === "Brina Pedra" && l.tipo === "pedido");
  t("a mesma batida, hoje: «(voz só da Brina Pedra: …)»", !!m12 && m12.linha.includes("(voz só da Brina Pedra: trata toda a gente por \"criança\", até velhos)") && m12.linha.length <= ST.LINHA_DO_CORACAO.max, m12 && m12.linha);
  t("o nome inteiro só onde o primeiro é de mais alguém: a Sari continua «Sari»", !quem("companheiro").vozNome && NU.vozPresa(quem("companheiro")).startsWith("(voz só da Sari: ") && brina.vozNome === "Brina Pedra");
  /* em pautas reais: as linhas do coração e da QUEM É da sequência inteira */
  const quemE = [];
  const ult = {}, cenas = {};
  for (const x of R9.turnos) {
    const r = NU.quemEParaPauta(nucleo, { emCena: x.emCena, ato: 0, ultimoAto: R9.espinha.atos.length - 1, turno: x.turno, ultimas: ult, cenas, fio: R9.espinha.fio });
    if (r.quem) { quemE.push(r.quemE[0]); ult[r.quem] = x.turno; cenas[r.quem] = (cenas[r.quem] || 0) + 1; }
  }
  const todas = [...linhas.map((l) => l.linha), ...quemE];
  const soltos = [];
  for (const l of todas) {
    for (const p of nucleo.pessoas) {
      const tq = p.ficha && p.ficha.fala && p.ficha.fala.o;
      if (!tq || !l.includes(tq)) continue;
      const presa = NU.VOZ_PRESA.marcador[NU.generoDaPessoa(p)] + (p.vozNome || p.nome.split(/[\s,]+/)[0]) + ": " + tq;
      if (l.split(tq).length !== l.split(presa).length || !l.startsWith(p.nome.split(",")[0])) soltos.push(l);
    }
  }
  t(`nas ${todas.length} linhas da sessão com voz, o tique só aparece preso ao dono, e na linha do dono`, todas.length >= 4 && soltos.length === 0, soltos[0]);
  t("o marcador diz a posse em todos os géneros", Object.values(NU.VOZ_PRESA.marcador).every((m) => m.startsWith("(voz só d")));
}

/* ============================================================ */
sec("3. o registo de gente");
{
  const heroi = R9.personagem.nome;
  t("o herói é Rufo Tamanqueiro", heroi === "Rufo Tamanqueiro");
  t("o registo da sessão ganhou «Tamanqueiro — taverneiro do Machado e a Rosa» (o defeito)", !!R9.npcs.Tamanqueiro && R9.narrativas[47].includes("Tamanqueiro?"));
  const v = NP.nomeComDono("Tamanqueiro", R9.npcsAntes, { heroi, papel: "taverneiro do Machado e a Rosa" });
  t("o sobrenome do herói, dito sozinho, é o herói", v.decisao === "recusada" && v.motivo === "heroi", JSON.stringify(v));
  t("…também com tratamento («o Tamanqueiro», «Senhor Tamanqueiro»)", ["o Tamanqueiro", "Senhor Tamanqueiro"].every((n) => NP.nomeComDono(n, {}, { heroi }).motivo === "heroi"));
  t("o primeiro nome continua a ser o herói, e o nome inteiro também", NP.nomeComDono("Rufo", {}, { heroi }).motivo === "heroi" && NP.nomeComDono("Rufo Tamanqueiro", {}, { heroi }).motivo === "heroi");
  t("a partícula do herói não é nome («Íris da Vantel»: «Vantel» é ela, «da» não conta)", NP.nomeComDono("Vantel", {}, { heroi: "Íris da Vantel" }).motivo === "heroi" && NP.nomeComDono("Tomas", {}, { heroi: "Íris da Vantel" }).decisao !== "recusada");
  t("outra gente passa como passava", NP.nomeComDono("Tomas", R9.npcsAntes, { heroi }).decisao === "mesma" && NP.nomeComDono("Halden Caldeira", {}, { heroi }).decisao === "nova");

  /* a Brina serviçal dentro do nome da Brina Pedra */
  const acorda = (narr, base) => MB.mencionadosNaCena(semente, R9.mapa, "Buraco Norte", base, C.genero, narr, molde, C.lexico, { grupo: R9.personagem.grupo }).gente.map((p) => p.nome);
  const n16 = R9.narrativas[16];
  t("a prosa do M16 nomeia a Brina Pedra, e nenhuma outra Brina", n16.includes("Brina Pedra") && !n16.replace(/Brina Pedra/g, "").includes("Brina"));
  t("…e acorda a Brina Pedra, não a serviçal (antes: as duas)", (() => { const a = acorda(n16, R9.baseAntes); return a.includes("Brina Pedra") && !a.includes("Brina"); })(), acorda(n16, R9.baseAntes).join(", "));
  const comPedra = { ...R9.baseAntes, revelados: [...R9.baseAntes.revelados, "Buraco Norte|gente|Brina Pedra"] };
  t("com a Brina Pedra já em cena, «Brina» solta é ela — a serviçal não acorda", !acorda("Brina sorri e guarda as moedas.", comPedra).includes("Brina"));
  t("sem a Brina Pedra em cena, a serviçal acorda pelo nome dela, como antes", acorda("Brina sorri e guarda as moedas.", R9.baseAntes).includes("Brina"));
  t("e quem não divide nome acorda como sempre", acorda("Dara conta as moedas.", R9.baseAntes).includes("Dara"));

  /* a taverneira que o sistema nomeou */
  const resumoRR = MB.resumoDaqui(semente, R9.mapa, "Rio do Rio", R9.baseMundo, C.genero, molde, C.lexico);
  const kira = MB.oQueExisteAqui(semente, R9.mapa, "Rio do Rio", R9.baseMundo, C.genero, molde, C.lexico).gente.find((p) => p.nome === "Kira do Vale");
  t("Kira do Vale é a taverneira do Cão Prateado, e é mulher", !!kira && kira.papel === "taverneiro(a)" && kira.local === "O Cão Prateado" && kira.genero_pessoa === "mulher", JSON.stringify(kira && { papel: kira.papel, local: kira.local, g: kira.genero_pessoa }));
  t("a lista da gente diz «Kira do Vale — …, taverneira» (antes: «taverneiro(a)», e o Mestre pôs um homem magro ao balcão)", /Kira do Vale — [^,]+, taverneira,/.test(resumoRR), (resumoRR.match(/Kira do Vale[^|]+/) || [""])[0]);
  const resumoBN = MB.resumoDaqui(semente, R9.mapa, "Buraco Norte", R9.baseMundo, C.genero, molde, C.lexico);
  const gente = (r) => (r.split("\n").find((l) => l.startsWith("- Gente")) || "");
  t("nenhum ofício com «(a)» na lista de gente das duas cidades", !/\((a|ã|isa)\)/.test(gente(resumoRR)) && !/\((a|ã|isa)\)/.test(gente(resumoBN)));
  t("e a lista não cresceu (o bloco estático é sagrado)", gente(resumoRR).length <= gente(resumoRR).replace(/taverneira/g, "taverneiro(a)").length);
}

/* a fiação (frontend, v9.435): o motor só vale se o App lhe passa o que ele lê */
{
  const app = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
  t("fiação · o App importa papelProcurado da procura", /import \{[^}]*\bpapelProcurado\b[^}]*\} from "\.\/procura\.js"/.test(app));
  /* 13/10 (v9.461, o oficial): a conta da cidade saiu do literal dentro de
     contextoDoCoracao para `cidadeDoCoracao()`, porque a chamada de
     quemEParaPauta passou a precisar da MESMA cidade (longeDaHistoria) e duas
     cópias da expressão divergem. A intenção é a mesma: o coração leva a
     cidade, vazia em viagem e na masmorra aberta — e agora o QUEM É também. */
  t("fiação · contextoDoCoracao leva a cidade, vazia em viagem e na masmorra aberta",
    app.includes('const cidadeDoCoracao = () => (jornadaRef.current || (masmorraRef.current && !masmorraRef.current.encerrada)) ? "" : (cidadeAtualRef.current || "");')
    && app.includes("      cidade: cidadeDoCoracao(),"));
  const i = app.indexOf("const procurarAlguem = (acao) => {");
  const corpo = app.slice(i, app.indexOf("enviar(acao, fichaViva() || personagem);", i));
  t("fiação · procurarAlguem pergunta pelo papel ANTES do nome, num calou, e passa porPapel",
    i > 0 && corpo.indexOf("papelProcurado(acao, nucleoAgora())") > 0
    && corpo.indexOf("papelProcurado(acao, nucleoAgora())") < corpo.indexOf("nomeProcurado(acao,")
    && corpo.includes("const nome = (pp && pp.nome) || nomeProcurado(") && corpo.includes("porPapel: pp,")
    && corpo.includes('calou("quem se procura pelo papel"'));
}

console.log(`\nsessão 9 (história): ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
