/* A IA LEITORA (25/11/2026) — src/a-leitora.js, a porta única que a ouve e a fiação no App.jsx

   A pessoa: «Pode ligar a IA». A medida (testes/medida-da-leitora/) mostrou um
   modelo pequeno melhor que o ouvido em «esta frase pede troca?» nas inéditas,
   e pior na condicional e no tomar. Esta suíte prova o desenho aprovado:

   §1 a tabela: o teto, as respostas fechadas, as classes do ouvido;
   §2 a validação: só a lista vale, o resto é «sem resposta»;
   §3 o pedido: a frase e a ficção da cena, à parte do Narrador;
   §4 o desempate nas quatro combinações (ouvido × leitora);
   §5 onde o ouvido manda (condicional, tomar, preço) e onde nem se chama (sem posse);
   §6 o recuo: atraso, erro, recusa, resposta inválida → null, sem rejeitar;
   §7 a porta única com a resposta: não é troca, relê como troca, o furto fica com o ouvido,
      o cartão leva a resposta ao clique, a frase de duas ações;
   §8 a fiação no App: só com a chave, em try/catch, uma chamada por frase. */
import { readFileSync } from "node:fs";
import { A_LEITORA, oPedidoDaLeitora, aRespostaDaLeitora, oDesempate, aLeitoraDecide, perguntarALeitora } from "../src/a-leitora.js";
import { aPortaUnica } from "../src/motor/uma-porta-so.js";
import { oOuvido } from "../src/o-ouvido.js";

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = JSON.stringify;
const ler = (rel) => readFileSync(new URL(rel, import.meta.url), "utf8");

/* o mercado da bancada da troca, em retrato (o formato do App) */
const RETRATO = Object.freeze({
  lugar: { nome: "A Balança", tipo: "mercado" },
  pessoas: [{ nome: "Cornelius", papel: "comerciante" }, { nome: "Prudence", papel: "comerciante" }, { nome: "Lavinia Sallow", papel: "monja", ehCompanheiro: true }],
  grupo: [{ nome: "Lavinia Sallow", inventario: [] }],
  bancas: [{ id: "b1", nome: "Cornelius", estoque: [{ nome: "Tocha", preco: 1, uso: "tochas" }, { nome: "Ração", preco: 7, uso: "racoes" }] }],
  ausentes: [], chao: [], anteriores: { jogador: "bom dia, Cornelius" },
  ficha: { moedas: 63, inventario: [{ nome: "Símbolo sagrado riscado" }, { nome: "Corda de cânhamo" }], equipamento: [], equipados: {}, suprimentos: { racoes: 10, agua: 10, tochas: 5 } },
});
const porta = (frase, leitora, extra) => aPortaUnica(frase, RETRATO, { pendente: null, aPosse: {}, turno: 1, ...(leitora === undefined ? {} : { leitora }), ...(extra || {}) });

/* ---------------------------------------------------------------- */
sec("§1 a tabela");
t("o teto de espera é número de tabela, acima do p95 medido (2151 ms) e abaixo do pior (3913 ms)", A_LEITORA.tetoMs > 2151 && A_LEITORA.tetoMs < 3913, A_LEITORA.tetoMs);
t("as respostas válidas são três, fechadas", J(Object.keys(A_LEITORA.respostas)) === J(["pede_troca", "fala", "outra_acao"]));
t("só «pede_troca» é troca; as outras dão a família da leitura", A_LEITORA.respostas.pede_troca.troca && !A_LEITORA.respostas.fala.troca && A_LEITORA.respostas.fala.familia === "falar" && A_LEITORA.respostas.outra_acao.familia === "agir");
t("o pedido é o medido: tarefa «leve», texto, e o system lista as três palavras", A_LEITORA.pedido.tarefa === "leve" && A_LEITORA.pedido.formato === "texto" && Object.keys(A_LEITORA.respostas).every((r) => A_LEITORA.pedido.system.includes(r)));
t("as classes em que o ouvido manda: a condicional, o gesto de tomar e o preço do sistema", A_LEITORA.ouvidoManda.condicional === true && A_LEITORA.ouvidoManda.classesDoGesto.includes("tomar") && A_LEITORA.ouvidoManda.precoDoSistema.coisaTipo === "dele");

/* ---------------------------------------------------------------- */
sec("§2 a validação — fora da lista é sem resposta");
t("a palavra exata", aRespostaDaLeitora("pede_troca") === "pede_troca");
t("com espaço, maiúscula e pontuação nas pontas", aRespostaDaLeitora("  Fala.\n") === "fala" && aRespostaDaLeitora("«outra_acao»") === "outra_acao");
t("palavra fora da lista → null", aRespostaDaLeitora("trocar") === null && aRespostaDaLeitora("talvez") === null);
t("frase em vez da palavra → null", aRespostaDaLeitora("pede_troca, porque ele quer pagar") === null);
t("vazio, número, objeto, null → null", [" ", "", 3, {}, null, undefined].every((x) => aRespostaDaLeitora(x) === null));

/* ---------------------------------------------------------------- */
sec("§3 o pedido — a frase e a ficção da cena");
{
  const p = oPedidoDaLeitora("compro uma tocha", RETRATO);
  const u = p.messages[0].content;
  t("um pedido à parte: system da leitora, uma mensagem, tarefa leve", p.system === A_LEITORA.pedido.system && p.messages.length === 1 && p.tarefa === "leve" && p.maxTokens === A_LEITORA.pedido.maxTokens);
  t("leva a frase entre aspas angulares, no fim", /Frase do jogador: «compro uma tocha»\nResposta:$/.test(u), u.slice(-80));
  t("leva o lugar, quem está, o que o herói tem e o que se vende", /Lugar: A Balança \(mercado\)\./.test(u) && /Cornelius \(comerciante\)/.test(u) && /tem 63 moedas/.test(u) && /Símbolo sagrado riscado/.test(u) && /Cornelius vende Tocha \(1\)/.test(u), u);
  t("leva a frase anterior do jogador (a medida a usou)", /Antes, o jogador disse: «bom dia, Cornelius»/.test(u));
  t("não leva o nome do herói nem nada do save que não seja a cena", !/Barnabas|personagem|nome do herói/i.test(u));
  t("a cena do ouvido serve tanto quanto o retrato", oPedidoDaLeitora("compro uma tocha", { lugar: "Praça", pessoas: [], heroi: { moeda: 2, carrega: [] }, bancas: [] }).messages[0].content.includes("Lugar: Praça."));
  t("frase vazia não pede nada", oPedidoDaLeitora("  ", RETRATO) === null);
  t("retrato torto não estoura", oPedidoDaLeitora("dou uma moeda", null) !== null);
}

/* ---------------------------------------------------------------- */
sec("§4 o desempate — as quatro combinações");
{
  const trocaDoOuvido = Object.freeze({ familia: "trocar", subtipo: null, coisaTipo: "dele", coisa: "Corda", quantia: null, confianca: 0.35 });
  const naoDoOuvido = Object.freeze({ familia: "falar", subtipo: null, coisaTipo: "minha", coisa: "Símbolo", quantia: null });
  const a = oDesempate(trocaDoOuvido, "pede_troca");
  t("ouvido troca × leitora troca → concorda, é troca", a.acao === "concorda" && a.troca === true, J(a));
  const b = oDesempate(trocaDoOuvido, "fala");
  t("ouvido troca × leitora fala → não é troca, e a família é a dela", b.acao === "naoETroca" && b.troca === false && b.familia === "falar", J(b));
  const b2 = oDesempate(trocaDoOuvido, "outra_acao");
  t("ouvido troca × leitora outra_acao → não é troca (agir)", b2.acao === "naoETroca" && b2.familia === "agir");
  const c = oDesempate(naoDoOuvido, "pede_troca");
  t("ouvido não × leitora troca → o ouvido relê como troca", c.acao === "releComoTroca" && c.troca === true, J(c));
  const d = oDesempate(naoDoOuvido, "fala");
  t("ouvido não × leitora não → concorda, não é troca", d.acao === "concorda" && d.troca === false);
  const e = oDesempate(naoDoOuvido, "qualquer coisa");
  t("sem resposta válida → vale o ouvido", e.acao === "ouvido" && e.motivo === "semResposta" && e.troca === false);
  t("a resposta crua passa pela mesma validação", oDesempate(trocaDoOuvido, " Fala. ").acao === "naoETroca");
  t("leitura torta → vale o ouvido, sem estourar", oDesempate(null, "pede_troca").acao === "ouvido" && oDesempate("x", "fala").acao === "ouvido");
}

/* ---------------------------------------------------------------- */
sec("§5 onde o ouvido manda, e onde a leitora nem é chamada");
{
  const cond = oOuvido("se eu pagar uma rodada, você me conta o que sabe, Prudence?", { lugar: "Taverna", pessoas: [{ nome: "Prudence" }], heroi: { moeda: 5, carrega: [] } });
  t("a medida: a frase condicional é lida como condicional pelo ouvido", cond.condicional === true, J(cond));
  t("condicional: a resposta dela não decide", aLeitoraDecide(cond) === false && oDesempate(cond, "pede_troca").acao === "ouvido" && oDesempate(cond, "pede_troca").motivo === "condicional");
  const furto = { familia: "trocar", subtipo: "furtar", coisaTipo: "dele", coisa: "Bolsa", quantia: null };
  const pegar = { familia: "trocar", subtipo: "pegar", coisaTipo: "dele", coisa: "Tocha", quantia: null };
  t("furtar: o ouvido manda, e o «fala» dela não desfaz o furto", aLeitoraDecide(furto) === false && oDesempate(furto, "fala").acao === "ouvido" && oDesempate(furto, "fala").troca === true);
  t("pegar (o mesmo gesto de tomar): o ouvido manda", oDesempate(pegar, "outra_acao").motivo === "tomar");
  t("a forma da troca que diz «tomar» também é do ouvido", oDesempate({ familia: "trocar", subtipo: null, coisaTipo: "dele", forma: { gesto: "tomar" } }, "fala").motivo === "tomar");
  const preco = { familia: "falar", subtipo: null, coisaTipo: "dele", coisa: "Tocha", preco: 1, quantia: null };
  t("a pergunta do preço que o sistema sabe: o ouvido manda", aLeitoraDecide(preco) === false && oDesempate(preco, "pede_troca").motivo === "preco");
  const nada = { familia: "olhar", subtipo: null, coisaTipo: null, coisa: null, quantia: null };
  t("sem posse nenhuma à vista (nem troca, nem coisa, nem moeda, nem quantia): nem se chama", aLeitoraDecide(nada) === false && oDesempate(nada, "pede_troca").motivo === "semPosse");
  t("a quantia sozinha já é posse à vista", aLeitoraDecide({ familia: "lutar", coisaTipo: null, quantia: 30 }) === true);
  t("a coisa minha numa fala é posse à vista: a leitora decide", aLeitoraDecide({ familia: "falar", coisaTipo: "minha", quantia: null }) === true);
  t("leitura torta: não decide", aLeitoraDecide(null) === false && aLeitoraDecide(7) === false);
}

/* ---------------------------------------------------------------- */
sec("§6 o recuo — atraso, erro, recusa, inválida: vale o ouvido, calado");
{
  const P = oPedidoDaLeitora("dou uma moeda pra Prudence", RETRATO);
  const dorme = (ms, v) => new Promise((ok) => setTimeout(() => ok(v), ms));
  const r1 = await perguntarALeitora(async () => "pede_troca", P);
  t("a resposta boa volta validada", r1 === "pede_troca");
  const r2 = await perguntarALeitora(() => dorme(200, "pede_troca"), P, { tetoMs: 50 });
  t("acima do teto → null (vale o ouvido)", r2 === null);
  const r3 = await perguntarALeitora(async () => { throw new Error("HTTP 429 (limite do dia)"); }, P);
  t("erro da rota (o 429 do portão) → null, sem rejeitar", r3 === null);
  const r4 = await perguntarALeitora(async () => { throw new Error("HTTP 402"); }, P);
  t("o 402 (crédito acabou) → null", r4 === null);
  const r5 = await perguntarALeitora(async () => "Acho que é uma troca.", P);
  t("resposta fora da lista → null", r5 === null);
  const r6 = await perguntarALeitora(() => { throw new Error("síncrono"); }, P);
  t("quem chama estourar antes de prometer → null", r6 === null);
  const r7 = await perguntarALeitora(null, P);
  t("sem quem chame, ou sem pedido → null", r7 === null && (await perguntarALeitora(async () => "fala", null)) === null);
  const r8 = await perguntarALeitora(() => dorme(10, "fala"), P, { tetoMs: 500 });
  t("abaixo do teto, a resposta conta", r8 === "fala");
}

/* ---------------------------------------------------------------- */
sec("§7 a porta única com a resposta dela");
{
  const sem = porta("ontem eu paguei caro por uma corda dessas");
  t("sem a resposta: a porta é a de sempre (o ouvido lê troca e pergunta)", sem.troca === true && sem.caminho === "pergunta" && sem.pelaLeitora === null, J([sem.troca, sem.caminho]));
  t("a porta diz que a leitora decidiria aqui", sem.leitoraDecide === true);
  const nao = porta("ontem eu paguei caro por uma corda dessas", "fala");
  t("ouvido troca × leitora fala → não é troca: nenhum caminho de troca, nenhuma pergunta", nao.troca === false && nao.caminho === null && !nao.pergunta && nao.pelaLeitora === "nao" && nao.leitura.familia === "falar", J([nao.troca, nao.caminho, nao.leitura && nao.leitura.familia]));
  const igual = porta("ontem eu paguei caro por uma corda dessas", "pede_troca");
  t("ouvido troca × leitora troca → a porta de sempre", igual.troca === sem.troca && igual.caminho === sem.caminho && igual.pelaLeitora === null);

  const fNao = "— Prudence, empurro esse símbolo riscado pra vc. Aceita? — digo";
  const s2 = porta(fNao);
  t("a fala entre travessões: sem a resposta, o ouvido lê conversa", s2.troca === false, J([s2.troca, s2.leitura && s2.leitura.familia]));
  const re = porta(fNao, "pede_troca");
  t("ouvido não × leitora troca → o ouvido relê como troca e extrai quem e o quê (entregar o símbolo à Prudence)", re.troca === true && re.pelaLeitora === "troca" && re.leitura.subtipo === "dar" && re.leitura.quem === "Prudence" && /símbolo/i.test(re.leitura.coisa || ""), J(re.leitura && [re.leitura.subtipo, re.leitura.quem, re.leitura.coisa]));
  /* 26/11: a releitura não entrega sozinha — quem pergunta o preço espera algo de volta */
  {
    const { aRelidaSoPerde } = await import("../src/a-leitora.js");
    const so = [{ de: "heroi", para: "npc|x", oQue: { coisa: "corda" }, contra: null }];
    const P = { pergunta: true }, fp = "empurro isto pra você, quanto dá?";
    t("pergunta de preço + aplicar direto + o herói só perde → a releitura não vale", aRelidaSoPerde(P, { caminho: "aplicado", transacoes: so }, fp) === true);
    t("PAR: a mesma entrega com cartão, dado ou pergunta ao jogador continua valendo", ["cartao", "dado", "pergunta"].every((c) => aRelidaSoPerde(P, { caminho: c, transacoes: so }, fp) === false));
    t("PAR: se algo volta para o herói (contrapartida ou transação de volta), vale", aRelidaSoPerde(P, { caminho: "aplicado", transacoes: [{ ...so[0], contra: { moedas: 3 } }] }, fp) === false && aRelidaSoPerde(P, { caminho: "aplicado", transacoes: [...so, { de: "npc|x", para: "heroi", oQue: { moedas: 3 } }] }, fp) === false);
    t("PAR: a oferta que não pergunta preço («Aceita?») continua sendo entrega", aRelidaSoPerde(P, { caminho: "aplicado", transacoes: so }, "empurro isto pra você. Aceita?") === false);
    t("PAR: sem pergunta, ou com null, nada muda", aRelidaSoPerde({ pergunta: false }, { caminho: "aplicado", transacoes: so }, fp) === false && aRelidaSoPerde(null, null, null) === false);
    const naPorta = porta("Prudence, empurro esse símbolo riscado pra você, quanto dá?", "pede_troca");
    t("na porta: a pergunta de preço relida não aplica uma entrega de graça", naPorta.caminho !== "aplicado", J([naPorta.troca, naPorta.caminho, naPorta.pelaLeitora]));
  }
  const re2 = porta("Prudence, vê se me paga as oito moedas que me deve", "pede_troca");
  t("a cobrança dita ao outro («vê se me paga») relida: cobrar, de Prudence, moeda", re2.troca === true && re2.leitura.subtipo === "cobrar" && re2.leitura.quem === "Prudence" && re2.leitura.coisaTipo === "moeda", J(re2.leitura && [re2.leitura.subtipo, re2.leitura.quem, re2.leitura.coisaTipo]));
  t("ouvido não × leitora não → a porta de sempre", porta(fNao, "fala").troca === false && porta(fNao, "fala").pelaLeitora === null);

  /* o que o ouvido relê e não sabe o tipo vira a pergunta de sempre, nunca um palpite */
  const lido = oOuvido("Cornelius, fecha comigo três tochas, td bem?", { lugar: "A Balança", pessoas: [{ nome: "Cornelius", vende: [{ item: "Tocha", preco: 1 }] }], heroi: { moeda: 63, carrega: ["Tocha"] } }, { pedeTroca: true });
  t("a releitura é sempre troca; o tipo é o do verbo ou da forma, ou nenhum", lido.familia === "trocar", J([lido.familia, lido.subtipo]));
  const semOp = oOuvido("Cornelius, fecha comigo três tochas, td bem?", { lugar: "A Balança", pessoas: [{ nome: "Cornelius", vende: [{ item: "Tocha", preco: 1 }] }], heroi: { moeda: 63, carrega: ["Tocha"] } });
  const semOp2 = oOuvido("Cornelius, fecha comigo três tochas, td bem?", { lugar: "A Balança", pessoas: [{ nome: "Cornelius", vende: [{ item: "Tocha", preco: 1 }] }], heroi: { moeda: 63, carrega: ["Tocha"] } }, { pedeTroca: false });
  t("sem a opção, a leitura do ouvido é a de sempre, byte a byte", J(semOp) === J(semOp2));

  const furto = porta("pego uma tocha da banca e enfio na mochila", "fala");
  t("o tomar fica com o ouvido: o «fala» dela não muda a porta", furto.troca === true && furto.pelaLeitora === null && furto.leitoraDecide === false && furto.caminho === porta("pego uma tocha da banca e enfio na mochila").caminho);
  const cond = porta("se eu pagar uma rodada, você me conta o que sabe, Prudence?", "pede_troca");
  t("a condicional fica com o ouvido: o «pede_troca» dela não a vira troca", cond.troca === false && cond.leitoraDecide === false);
  const preco = porta("quanto custa uma tocha?", "pede_troca");
  t("a pergunta do preço fica com o ouvido (o preço do sistema vai ao Narrador)", preco.caminho === "falar" && preco.leitoraDecide === false);
  t("sem posse à vista, a porta nem pede a leitora", porta("olho em volta").leitoraDecide === false);
  t("resposta inválida na porta = a porta de sempre", porta(fNao, "sim").troca === s2.troca && porta(fNao, "sim").pelaLeitora === null);

  /* a resposta à pergunta pendente não se desempata */
  const pq = porta("ontem eu paguei caro por uma corda dessas");
  const resp = aPortaUnica("1", RETRATO, { pendente: pq.pergunta, aPosse: {}, turno: 1, leitora: "fala" });
  t("a resposta à pergunta pendente não passa pela leitora", resp.leitoraDecide === false && resp.pelaLeitora === null);

  /* o cartão que nasceu da resposta dela a leva ao clique (a cena da suíte da troca por transação: a banca com id e a posse) */
  {
    const BANCAS = [{ id: "geral|sino", nome: "O Sino Rachado", tipo: "geral", estoque: [{ nome: "Corda de cânhamo", preco: 2, tipo: "util" }] }];
    const fichaC = { moedas: 40, inventario: [{ nome: "Símbolo sagrado riscado", tipo: "amuleto" }], equipamento: [], equipados: {}, suprimentos: { racoes: 2, agua: 1, tochas: 5 }, grupo: [] };
    const retC = { lugar: { nome: "A Balança", tipo: "mercado" }, pessoas: [{ id: "Rio|gente|Prudence", nome: "Prudence", papel: "lavadeira" }], grupo: [], bancas: BANCAS, ausentes: [], conhecidos: [], chao: [], ficha: fichaC, anteriores: {} };
    const POSSE = { posses: null, semente: "s1", dia: 3, cidade: { nome: "Rio", porte: "cidade" }, mercado: { comprados: {}, gastos: {} }, chao: null, nucleo: [], mortos: [], pessoas: { "Rio|gente|Prudence": { nome: "Prudence", papel: "lavadeira" } } };
    const frase = "a corda de cânhamo, vou levar ela?";
    const p = (ctx) => aPortaUnica(frase, retC, { aPosse: POSSE, turno: 7, ...ctx });
    t("sem a resposta, a pergunta ao mundo não é troca", p({}).troca === false);
    const compra = p({ leitora: "pede_troca" });
    t("relida como troca, a compra da banca é o cartão (o preço é do sistema)", compra.caminho === "cartao" && compra.cartao.tipo === "compra" && compra.cartao.total === 2, J([compra.caminho, compra.cartao && compra.cartao.tipo]));
    t("o cartão nascido da releitura leva a resposta dela", compra.cartao && compra.cartao.leitora === "pede_troca");
    const clique = p({ confirmado: compra.cartao });
    t("o clique relê com a mesma resposta, e a troca aplica", clique.troca === true && clique.caminho === "aplicado", J([clique.troca, clique.caminho]));
    const { leitora: _sem, ...cartaoSemResposta } = compra.cartao || {};
    t("(prova do contrário: sem a resposta no cartão, o clique perderia a troca)", p({ confirmado: cartaoSemResposta }).troca === false);
    const daBanca = aPortaUnica("compro a corda de cânhamo", retC, { aPosse: POSSE, turno: 7, leitora: "pede_troca" });
    t("o cartão que o ouvido já dava sozinho não carrega resposta nenhuma", daBanca.caminho === "cartao" && daBanca.cartao.leitora === undefined);
  }

  /* a frase de duas ações: «não é troca» vale para a frase inteira; os pedaços se leem sem ela */
  const duas = "dou uma moeda pra Prudence e compro uma tocha do Cornelius";
  const d0 = porta(duas);
  const dNao = porta(duas, "fala");
  t("duas ações, ouvido troca × leitora fala → a frase inteira não é troca", d0.troca === true && dNao.troca === false && !dNao.seguinte, J([d0.troca, dNao.troca]));
  const dSim = porta(duas, "pede_troca");
  t("duas ações, ouvido troca × leitora troca → as duas de sempre", dSim.troca === d0.troca && dSim.caminho === d0.caminho && !!dSim.seguinte === !!d0.seguinte);
}

/* ---------------------------------------------------------------- */
sec("§8 a fiação no App — só com a chave, nunca custa o turno");
{
  const app = ler("../src/App.jsx");
  const i = app.indexOf("/* A IA LEITORA (25/11, a-leitora.js)");
  const bloco = i >= 0 ? app.slice(i, app.indexOf("/* a frase que ia agir vira proposta", i)) : "";
  t("o bloco do envio existe, e é um só", i >= 0 && app.split("/* A IA LEITORA (25/11, a-leitora.js)").length === 2);
  t("só com o Mestre vivo (sem a chave, nada é chamado)", /if \(mestreVivoLigado\(\) && e0/.test(bloco));
  t("em try/catch com calou", /^\s*\/\*[\s\S]*?\*\/\s*try \{/.test(bloco) && /catch \(e\) \{ calou\("a IA leitora · o envio", e\); \}/.test(bloco));
  t("só quando a porta diz que ela decide (r0.leitoraDecide)", /r0 && r0\.leitoraDecide \? oPedidoDaLeitora\(/.test(bloco));
  t("uma chamada por frase: a frase já julgada não chama de novo, e a em voo espera", /if \(lr && lr\.frase === e0 && lr\.emVoo\) return;/.test(bloco) && /if \(!\(lr && lr\.frase === e0\)\)/.test(bloco));
  t("a chamada passa pelo recuo da tabela (perguntarALeitora) e pela rota de sempre", /perguntarALeitora\(\(p\) => chamarModelo\(p\.system, p\.messages, p\.maxTokens, p\.formato, p\.tarefa\), pedido\)/.test(bloco));
  t("a resposta que chega tarde de uma frase velha não pisa na nova", /if \(!\(agora && agora\.frase === e0 && agora\.emVoo\)\) return;/.test(bloco));
  t("a porta única lê a resposta só quando é desta frase e já chegou", /leitora: \(\(\) => \{ try \{ const lr = leitoraRef\.current; return lr && lr\.frase === frase && !lr\.emVoo \? lr\.resposta : null;/.test(app));
  /* a bancada (T51, «lembro de quando paguei três moedas…»): desfeita a troca, a cobrança do pedido da frase debitava ◉ 3 —
     a frase que o ouvido lia como troca ficava fora dela, e continua fora quando a leitora diz que não é */
  t("a frase que a leitora desfez continua fora da cobrança do pedido", /ovC\.lido && \(ovC\.troca \|\| ovC\.pelaLeitora === "nao"\)\) pedidoDaCobranca = "";/.test(app));
  t("nenhum outro lugar do App monta pedido da leitora", app.split("oPedidoDaLeitora(").length === 2);
  t("o prompt do Narrador não ganhou bloco: o system da leitora não está no App", !app.includes("pede_troca"));
}

console.log(`\n${bons} ok · ${maus} falhas`);
if (maus) process.exit(1);
