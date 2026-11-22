/* O OUVIDO (22/11/2026) — src/o-ouvido.js e src/a-regra-do-improviso.js

   A régua da dona do jogo: o Mestre «precisa reconhecer o que acontece».
   Esta suíte prova o leitor único da frase livre e mede-o contra a régua fixa
   das intenções (testes/treino-das-intencoes.json, aberto; testes/exame-das-
   intencoes.json, SELADO), ao lado do leitor de hoje (o veredito da troca e a
   bolsa da frase), com os mesmos itens:

   §1 as tabelas: as listas fechadas são as do exame; tudo congelado;
   §2 ligar a frase à cena: as marcas, a quantia, a pessoa (nome, ofício,
      pronome, dois com o nome, ausente, morto);
   §3 as regras de estrutura: a direção das preposições, a fala entre aspas,
      a pergunta de preço, a condicional, a negação, o verbo que ninguém
      previu, a menção que não é presença;
   §4 a regra do improviso: as cinco respostas, as perguntas com opções
      fechadas e texto de jogo, NUNCA o silêncio;
   §5 a régua: o leitor de hoje × o ouvido, no treino, no corpus próprio e no
      selado — e os pisos (catraca: o medido menos três pontos).

   O SELADO só passa por aqui e só sai em AGREGADO (por família, subtipo,
   campo, veredito e armadilha): nenhuma frase, nenhum id. Para afinar sem o
   abrir: OUVIDO_SEM_SELADO=1 node testes/teste-o-ouvido.mjs */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { oOuvido, ligarACena, O_OUVIDO, VERBOS_DO_OUVIDO } from "../src/o-ouvido.js";
import { aRespostaDoMestre, A_REGRA_DO_IMPROVISO } from "../src/a-regra-do-improviso.js";
import { aIntencaoDaTroca, oVereditoDaTroca, aPortaFinalDaTroca } from "../src/o-veredito-da-troca.js";
import { compraNaFrase, dadivaNaFrase } from "../src/bolsa-da-frase.js";

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const aqui = dirname(fileURLToPath(import.meta.url));
const abre = (nome) => { try { return JSON.parse(readFileSync(join(aqui, nome), "utf8")); } catch (e) { return { erro: String(e), itens: [] }; } };

/* ---------------- a cena dos casos escritos ---------------- */
const CENA = Object.freeze({
  lugar: "Taberna do Teste", tipo: "taverna",
  pessoas: [
    { nome: "Dorva", oficio: "mendiga", vende: null },
    { nome: "Ivo Prado", oficio: "taverneiro", vende: [{ item: "cerveja", preco: 2 }, { item: "quarto", preco: 10 }] },
    { nome: "Ana Lis", oficio: "bardo", vende: null },
    { nome: "Ana Cruz", oficio: "ferreira", vende: [{ item: "espada", preco: 30 }] },
  ],
  ausentes: ["Ivarr Tolmen"], mortos: ["Edrik Sorn"], coisas: ["balcão", "barril"],
  heroi: { moeda: 12, carrega: ["gazua", "corda", "mapa rasgado"], companheiro: "Rhogar" },
});
const ERMO = Object.freeze({ lugar: "Charneca", tipo: "ermo", pessoas: [], ausentes: ["Mira Dantas"], mortos: [], coisas: ["pedra"], heroi: { moeda: 3, carrega: ["corda", "faca"], companheiro: "Lyra" } });
const UM = Object.freeze({ lugar: "Guarita", tipo: "portao", pessoas: [{ nome: "Rurik", oficio: "guarda", vende: null }], ausentes: [], mortos: [], coisas: ["portão"], heroi: { moeda: 5, carrega: ["tocha"], companheiro: null } });
const le = (f, c = CENA) => oOuvido(f, c);
const responde = (f, c = CENA) => aRespostaDoMestre(oOuvido(f, c), c);

sec("§1 as tabelas");
{
  const FAM = ["falar", "convencer", "olhar", "mover", "trocar", "usar", "agir", "lutar", "esperar", "perguntar_ao_mestre"];
  const SUB = ["comprar", "vender", "pagar", "dar", "pedir", "pegar", "furtar", "emprestar", "devolver", "subornar", "escambo", "cobrar"];
  t("as famílias são as do exame", JSON.stringify(O_OUVIDO.familias) === JSON.stringify(FAM));
  t("os subtipos são os do exame", JSON.stringify(O_OUVIDO.subtipos) === JSON.stringify(SUB));
  t("os vereditos são os cinco do exame", JSON.stringify(A_REGRA_DO_IMPROVISO.vereditos) === JSON.stringify(["sim", "sim_com_preco", "dado", "pergunta", "nao"]));
  t("os motivos são os do exame", JSON.stringify(A_REGRA_DO_IMPROVISO.motivos) === JSON.stringify(["ausente", "morto", "sem_moeda", "nao_tem", "nao_vende", "falta_quem", "falta_o_que", "dois_com_o_nome", "ninguem_aqui"]));
  t("todo verbo da tabela tem família e subtipo das listas", Object.values(VERBOS_DO_OUVIDO).every((v) => FAM.includes(v.fam) && (v.sub === null || SUB.includes(v.sub))));
  t("todo subtipo tem padrão de resposta", SUB.every((s) => A_REGRA_DO_IMPROVISO.vereditos.includes(A_REGRA_DO_IMPROVISO.padrao[s])));
  t("as tabelas estão congeladas", Object.isFrozen(O_OUVIDO) && Object.isFrozen(VERBOS_DO_OUVIDO) && Object.isFrozen(A_REGRA_DO_IMPROVISO) && Object.isFrozen(O_OUVIDO.confianca));
}

sec("§2 ligar a frase à cena");
{
  t("a frase marcada: «passo 3 pratas pro Ivo»", ligarACena("passo 3 pratas pro Ivo", CENA).marcada === "passo <N> <MOEDA> pro <PESSOA>", ligarACena("passo 3 pratas pro Ivo", CENA).marcada);
  t("o mesmo esqueleto com outro verbo e a quantia por extenso", ligarACena("deslizo duas moedas pra Dorva", CENA).marcada === "deslizo <N> <MOEDA> pra <PESSOA>");
  t("a coisa minha, a dele e a solta", ligarACena("troco a corda pela cerveja no balcão", CENA).marcada === "troco a <COISA_MINHA> pela <COISA_DELE> no <COISA_SOLTA>", ligarACena("troco a corda pela cerveja no balcão", CENA).marcada);
  t("«vinte e cinco» é 25", le("dou vinte e cinco moedas pra Dorva").quantia === 25);
  t("«uma moeda» conta 1", le("dou uma moeda pra Dorva").quantia === 1);
  t("«uma cerveja» não conta", le("compro uma cerveja").quantia === null);
  t("o primeiro nome acha o nome inteiro", le("dou a corda pro Ivo").quem === "Ivo Prado");
  t("o ofício acha quem está («pra mendiga»)", le("jogo uma moeda pra mendiga").quem === "Dorva");
  t("dois que estão com o nome: ninguém escolhido, os dois nas opções", (() => { const l = le("dou a corda pra Ana"); return l.quem === null && l.quemEstado === "qual" && l.opcoesDeQuem.length === 2; })());
  t("o nome inteiro desfaz o homônimo", le("dou a corda pra Ana Cruz").quem === "Ana Cruz");
  t("o ausente é reconhecido como ausente", le("dou a corda pro Ivarr").quemEstado === "longe");
  t("o morto é reconhecido como morto", le("dou a corda pro Edrik").quemEstado === "morto");
  t("o pronome retoma o único que está", le("intimido ele", UM).quem === "Rurik");
  t("o pronome retoma quem a frase já nomeou", le("suborno a Dorva com duas moedas pra ela sumir").quem === "Dorva");
  t("a frase sem acento e minúscula também liga", le("compro a espada da ana cruz").quem === "Ana Cruz");
}

sec("§3 as regras de estrutura");
{
  const a = le("passo 3 pratas pro Ivo"), b = le("deslizo duas moedas pra Dorva");
  t("«a/para/pro X» entrega: passar moeda é dar", a.familia === "trocar" && a.subtipo === "dar" && a.coisa === "moeda" && a.quantia === 3);
  t("o verbo novo com o mesmo esqueleto é o mesmo gesto", b.subtipo === "dar" && b.quem === "Dorva" && b.quantia === 2);
  t("«de/do X» tira: furtar a espada da Ana Cruz", (() => { const l = le("furto a espada da Ana Cruz"); return l.subtipo === "furtar" && l.quem === "Ana Cruz" && l.coisa === "espada"; })());
  t("«pra + infinitivo» com moeda é suborno", le("dou duas moedas ao Ivo pra ele esquecer").subtipo === "subornar");
  t("moeda «pela» coisa é compra da coisa", (() => { const l = le("dou cinco moedas pela espada da Ana Cruz"); return l.subtipo === "comprar" && l.coisa === "espada"; })());
  t("«troco X por Y» é escambo, e a coisa é a minha", (() => { const l = le("troco a corda pela cerveja do Ivo"); return l.subtipo === "escambo" && l.coisa === "corda" && l.quem === "Ivo Prado"; })());
  t("menção não é presença: «pergunto à Dorva pela espada» é falar", le("pergunto à Dorva pela espada").familia === "falar");
  t("a pergunta de preço é falar", (() => { const l = le("quanto é a cerveja?"); return l.familia === "falar" && l.coisa === "cerveja"; })());
  t("a condicional não é troca", le("se eu pagar, o Ivo me dá o quarto?").familia !== "trocar");
  t("a condicional que pergunta o resultado é ao Mestre", le("se eu furtar a espada, dava certo?").familia === "perguntar_ao_mestre");
  t("a negação não é troca: «não vou pagar nada, Ivo»", (() => { const l = le("não vou pagar nada, Ivo"); return l.familia === "falar" && l.negada; })());
  t("a negação com outra oração lê a outra", le("não gasto nada, sigo pela estrada").familia === "mover");
  t("a fala com travessão é falar", le("— Ivo, me vê uma cerveja").familia === "falar");
  t("a fala entre aspas é falar", le("\"Dorva, toma uma moeda\"").familia === "falar");
  t("o pedido ao balcão: «me vê uma cerveja, Ivo» é compra", le("me vê uma cerveja, Ivo").subtipo === "comprar");
  t("o pedido emprestado é emprestar na direção de quem recebe", (() => { const l = le("me empresta a espada, Ana Cruz"); return l.subtipo === "emprestar" && l.direcao === "recebe"; })());
  t("duas ações: vale a primeira", le("compro uma cerveja e sento no balcão").subtipo === "comprar");
  t("o verbo que ninguém previu, coisa minha indo a alguém: entrega", (() => { const l = le("xumbrego a gazua pro Ivo"); return l.subtipo === "dar" && l.confianca === O_OUVIDO.confianca.estrutura; })());
  t("pergunta ao mundo sem ninguém: ao Mestre", le("quem está aqui?").familia === "perguntar_ao_mestre");
  t("o gesto com instrumento meu é usar", (() => { const l = le("abro o barril com a gazua"); return l.familia === "usar" && l.coisa === "gazua"; })());
  t("saquear o morto é pegar", (() => { const l = le("pego o anel do Edrik"); return l.subtipo === "pegar" && l.quemEstado === "morto"; })());
}

sec("§4 a regra do improviso");
{
  const R = A_REGRA_DO_IMPROVISO;
  t("dar o que tem a quem está: sim com preço", responde("dou a corda pro Ivo").veredito === "sim_com_preco");
  t("emprestar: sim", responde("empresto minha gazua a Dorva").veredito === "sim");
  t("jogar uma moeda à mendiga: sim com preço", responde("jogo uma moeda pra mendiga").veredito === "sim_com_preco");
  t("furto: dado", responde("furto a espada da Ana Cruz").veredito === "dado");
  t("suborno: dado", responde("dou duas moedas ao Ivo pra ele esquecer").veredito === "dado");
  t("oferecer menos que o preço: dado", responde("dou cinco moedas pela espada da Ana Cruz").veredito === "dado");
  t("ao ausente: não, ausente", JSON.stringify(responde("dou a corda pro Ivarr")) === JSON.stringify({ veredito: "nao", motivo: "ausente", pergunta: null }));
  t("ao morto: não, morto", responde("dou a corda pro Edrik").motivo === "morto");
  t("do morto: pegar é sim", responde("pego o anel do Edrik").veredito === "sim");
  t("o que não tem: não, não tem", responde("dou a espada pra Dorva").motivo === "nao_tem");
  t("sem moeda: não", responde("compro duas espadas").motivo === "sem_moeda");
  t("sem ninguém na cena: não, ninguém aqui (o companheiro não é o outro lado)", responde("vendo a corda", ERMO).motivo === "ninguem_aqui");
  t("usar o que não tem: não; o que tem: sim", responde("uso o martelo").motivo === "nao_tem" && responde("uso a corda").veredito === "sim");
  {
    const r = responde("dou a corda pra Ana");
    t("dois com o nome: pergunta com as duas pessoas", r.veredito === "pergunta" && r.motivo === "dois_com_o_nome" && JSON.stringify(r.pergunta.opcoes) === JSON.stringify(["Ana Lis", "Ana Cruz"]), JSON.stringify(r));
    t("…e o texto é o da tabela", r.pergunta.texto === R.textos.dois.replace("{primeiro}", "Ana").replace("{lista}", "Ana Lis ou Ana Cruz"), r.pergunta.texto);
  }
  {
    const r = responde("dou a corda");
    t("falta a quem: pergunta, com quem está (o companheiro incluído)", r.veredito === "pergunta" && r.motivo === "falta_quem" && r.pergunta.opcoes.includes("Dorva") && r.pergunta.opcoes.includes("Rhogar"), JSON.stringify(r));
    t("…«A quem você entrega a corda?»", r.pergunta.texto === "A quem você entrega a corda?", r.pergunta.texto);
  }
  {
    const r = responde("dou isso pro Ivo");
    t("falta o quê: pergunta, com as coisas da ficha", r.veredito === "pergunta" && r.motivo === "falta_o_que" && JSON.stringify(r.pergunta.opcoes) === JSON.stringify(CENA.heroi.carrega), JSON.stringify(r));
  }
  {
    const r = responde("xumbrego a espada da Ana Cruz");
    t("coisa dele + pessoa + verbo desconhecido: pergunta o que faz, com as ações", r.veredito === "pergunta" && JSON.stringify(r.pergunta.opcoes) === JSON.stringify(R.acoesDaCoisaDele), JSON.stringify(r));
  }
  t("a pergunta é texto de jogo: não fala do mecanismo", ["dou a corda pra Ana", "dou a corda", "dou isso pro Ivo", "xumbrego a espada da Ana Cruz"].every((f) => !/veredito|ouvido|subtipo|motivo|fam[ií]lia|leitura/i.test(responde(f).pergunta.texto)));
  t("o que não é troca nem uso não recebe veredito", responde("olho o barril").veredito === null);
  t("a leitura pode vir como frase", aRespostaDoMestre("dou a corda pro Ivo", CENA).veredito === "sim_com_preco");
}

sec("§4b defesa e determinismo");
{
  let ok = true;
  try {
    const l0 = oOuvido(null, null), l1 = oOuvido("dou a corda pro Ivo", null), l2 = oOuvido("dou a corda", { pessoas: null, heroi: null });
    ok = typeof l0.familia === "string" && typeof l1.familia === "string" && typeof l2.familia === "string";
    const r0 = aRespostaDoMestre(null, null), r1 = aRespostaDoMestre(l1, null);
    ok = ok && r0.veredito === null && (r1.veredito === null || A_REGRA_DO_IMPROVISO.vereditos.includes(r1.veredito));
  } catch { ok = false; }
  t("null na frase, na cena e nos campos da cena não derruba", ok);
  t("mesma frase, mesma cena, mesma leitura (determinístico)", JSON.stringify(le("deslizo duas moedas pra Dorva")) === JSON.stringify(le("deslizo duas moedas pra Dorva")));
  t("a leitura é imutável", Object.isFrozen(le("dou a corda pro Ivo")) && Object.isFrozen(responde("dou a corda pra Ana").pergunta));
}

/* ---------------- §5 a régua ---------------- */
const treino = abre("treino-das-intencoes.json");
const corpus = abre("corpus-do-ouvido.json");
const cenaDe = Object.fromEntries((treino.itens || []).map((i) => [i.id, i.cena]));
const itensDoCorpus = (corpus.itens || []).map((i) => ({ ...i, cena: i.cena || cenaDe[i.cena_de], armadilha: i.armadilha || null }));

/* o leitor de hoje, com a cena do exame posta no formato que ele pede */
const MAPA_DO_LEITOR_DE_HOJE = Object.freeze({ pegar: "pegar", furto: "furtar", tomar: "furtar", suborno: "subornar", deGraca: "pedir", dar: "dar", pagamento: "pagar", vendaDeUso: "vender", fiado: "comprar", troca: "escambo", compra: "comprar", dadiva: "dar" });
function leitorDeHoje(frase, cena) {
  const c = cena || {}, h = c.heroi || {};
  const grupo = h.companheiro ? [{ nome: h.companheiro }] : [];
  const ficha = { moedas: h.moeda || 0, inventario: (h.carrega || []).map((n) => ({ nome: n })), equipamento: [], equipados: {}, suprimentos: {}, grupo };
  const presentes = (c.pessoas || []).map((p) => p.nome);
  const bancas = (c.pessoas || []).filter((p) => p.vende && p.vende.length).map((p) => ({ nome: p.nome, estoque: p.vende.map((v) => ({ nome: v.item, preco: v.preco })) }));
  const tenta = (f) => { try { return f(); } catch { return null; } };
  const it = tenta(() => aIntencaoDaTroca(frase, { grupo }));
  const ver = tenta(() => oVereditoDaTroca(frase, { ficha, presentes, chao: c.coisas || [], bancas, semente: "regua", lugar: c.lugar, dia: 1 }));
  const porta = tenta(() => aPortaFinalDaTroca(frase, { ficha, presentes }));
  const compra = tenta(() => compraNaFrase(frase, { balcao: [], bolsa: h.moeda || 0, bancas }));
  const dad = tenta(() => dadivaNaFrase(frase, { pessoas: [...presentes.map((n) => ({ nome: n })), ...grupo.map((g) => ({ ...g, companheiro: true }))], suprimentos: {} }));
  const ehTroca = !!(it || ver || porta || compra || dad);
  const tipo = (it && it.tipo) || (porta && ((porta.intencao && porta.intencao.tipo) || porta.tipo)) || (compra ? "compra" : null) || (dad ? "dadiva" : null) || (ver && ver.tipo) || null;
  return { ehTroca, subtipo: ehTroca ? MAPA_DO_LEITOR_DE_HOJE[tipo] || null : null };
}

const sem = (s) => String(s == null ? "" : s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const igual = (a, b) => (a == null && b == null) || (a != null && b != null && sem(a) === sem(b));
function medir(itens) {
  const n = { itens: 0 };
  const c = {};
  const conta = (k, ok) => { c[k] = c[k] || [0, 0]; c[k][1]++; if (ok) c[k][0]++; };
  const tp = { o: [0, 0, 0], h: [0, 0, 0] }; /* verdadeiro positivo, falso positivo, falso negativo */
  for (const it of itens) {
    const g = it.resposta, cena = it.cena;
    const l = oOuvido(it.frase, cena), r = aRespostaDoMestre(l, cena), h = leitorDeHoje(it.frase, cena);
    const gt = g.familia === "trocar";
    const ot = l.familia === "trocar";
    tp.o[0] += gt && ot; tp.o[1] += !gt && ot; tp.o[2] += gt && !ot;
    tp.h[0] += gt && h.ehTroca; tp.h[1] += !gt && h.ehTroca; tp.h[2] += gt && !h.ehTroca;
    const fam = l.familia === g.familia;
    conta("familia", fam); conta("familia:" + g.familia, fam);
    if (gt) { conta("subtipo", l.subtipo === g.subtipo); conta("subtipo:" + g.subtipo, l.subtipo === g.subtipo); conta("hoje:subtipo", h.subtipo === g.subtipo); }
    conta("quem", igual(l.quem, g.quem)); conta("coisa", igual(l.coisa, g.coisa)); conta("quantia", (l.quantia == null ? null : l.quantia) === g.quantia);
    if (gt || g.familia === "usar") {
      const v = r.veredito === g.veredito;
      conta("veredito", v); conta("veredito:" + g.veredito, v); conta("motivo", v && (r.motivo || null) === g.motivo);
      if (g.motivo) conta("motivo:" + g.motivo, v && r.motivo === g.motivo);
    }
    const tudo = fam && (!gt || l.subtipo === g.subtipo) && igual(l.quem, g.quem) && igual(l.coisa, g.coisa) && (!(gt || g.familia === "usar") || r.veredito === g.veredito);
    const a = it.armadilha || "sem_armadilha";
    conta("arm:" + a + ":familia", fam); conta("arm:" + a + ":tudo", tudo);
    if (gt || g.familia === "usar") conta("arm:" + a + ":veredito", r.veredito === g.veredito);
    n.itens++;
  }
  const pc = (k) => (c[k] ? (100 * c[k][0]) / c[k][1] : null);
  const pr = (x) => ({ prec: x[0] + x[1] ? (100 * x[0]) / (x[0] + x[1]) : 0, rev: x[0] + x[2] ? (100 * x[0]) / (x[0] + x[2]) : 0 });
  return { n: n.itens, c, pc, o: pr(tp.o), h: pr(tp.h) };
}
const f1 = (x) => (x == null ? "  —  " : x.toFixed(1).padStart(5));
function imprimir(nome, m) {
  console.log("\n  " + nome + " (" + m.n + " itens)                hoje   ouvido");
  console.log("    é troca — precisão           " + f1(m.h.prec) + "  " + f1(m.o.prec));
  console.log("    é troca — revocação          " + f1(m.h.rev) + "  " + f1(m.o.rev));
  console.log("    subtipo (das trocas)         " + f1(m.pc("hoje:subtipo")) + "  " + f1(m.pc("subtipo")));
  for (const k of ["familia", "quem", "coisa", "quantia", "veredito", "motivo"]) console.log("    " + (k === "motivo" ? "veredito + motivo" : k).padEnd(29) + "   —   " + f1(m.pc(k)));
  const grupo = (pre) => Object.keys(m.c).filter((k) => k.startsWith(pre)).sort();
  console.log("    por família:   " + grupo("familia:").map((k) => k.slice(8) + " " + m.pc(k).toFixed(0) + "% (" + m.c[k][1] + ")").join(" · "));
  console.log("    por subtipo:   " + grupo("subtipo:").map((k) => k.slice(8) + " " + m.pc(k).toFixed(0) + "% (" + m.c[k][1] + ")").join(" · "));
  console.log("    por veredito:  " + grupo("veredito:").map((k) => k.slice(9) + " " + m.pc(k).toFixed(0) + "% (" + m.c[k][1] + ")").join(" · "));
  console.log("    por motivo:    " + grupo("motivo:").map((k) => k.slice(7) + " " + m.pc(k).toFixed(0) + "% (" + m.c[k][1] + ")").join(" · "));
  console.log("    por armadilha (família / veredito / tudo certo):");
  const arms = [...new Set(grupo("arm:").map((k) => k.split(":")[1]))];
  for (const a of arms) console.log("      " + a.padEnd(22) + f1(m.pc("arm:" + a + ":familia")) + "  " + f1(m.pc("arm:" + a + ":veredito")) + "  " + f1(m.pc("arm:" + a + ":tudo")) + "   (" + m.c["arm:" + a + ":familia"][1] + ")");
}

/* OS PISOS (a catraca): o medido menos três pontos, por régua e por campo.
   Subir o número é livre; descer abaixo do piso quebra a suíte.
   O treino e o corpus são abertos (o leitor foi afinado com eles: o número
   alto ali é viés, não mérito); o selado é a medida honesta. Os pisos do
   selado saem da 2.ª corrida de 22/11 (família 90,3 · é troca 98,2/95,4 ·
   subtipo 92,6 · quem 96,9 · coisa 89,4 · quantia 100 · veredito 83,8). */
const PISOS_DO_OUVIDO = Object.freeze({
  treino: Object.freeze({ familia: 97, trocaPrecisao: 97, trocaRevocacao: 97, subtipo: 97, quem: 97, coisa: 96, quantia: 97, veredito: 97 }),
  corpus: Object.freeze({ familia: 96, trocaPrecisao: 96, trocaRevocacao: 96, subtipo: 96, quem: 96, coisa: 96, quantia: 97, veredito: 95 }),
  selado: Object.freeze({ familia: 87, trocaPrecisao: 95, trocaRevocacao: 92, subtipo: 89, quem: 93, coisa: 86, quantia: 97, veredito: 80 }),
});
const travar = (nome, m) => {
  const P = PISOS_DO_OUVIDO[nome];
  const v = { familia: m.pc("familia"), trocaPrecisao: m.o.prec, trocaRevocacao: m.o.rev, subtipo: m.pc("subtipo"), quem: m.pc("quem"), coisa: m.pc("coisa"), quantia: m.pc("quantia"), veredito: m.pc("veredito") };
  for (const k of Object.keys(P)) t(nome + ": " + k + " ≥ " + P[k] + "%", v[k] >= P[k], v[k] == null ? "sem medida" : v[k].toFixed(1) + "%");
};

sec("§5 a régua — o leitor de hoje × o ouvido");
{
  t("o treino abre (150)", (treino.itens || []).length === 150, treino.erro);
  t("o corpus próprio abre e toda cena aponta para o treino", itensDoCorpus.length >= 300 && itensDoCorpus.every((i) => i.cena), String(itensDoCorpus.length));
  const mT = medir(treino.itens || []);
  imprimir("TREINO (aberto)", mT);
  travar("treino", mT);
  const mC = medir(itensDoCorpus);
  imprimir("CORPUS PRÓPRIO (aberto)", mC);
  travar("corpus", mC);
  if (process.env.OUVIDO_SEM_SELADO === "1") {
    console.log("\n  SELADO: pulado (OUVIDO_SEM_SELADO=1)");
  } else {
    const ex = abre("exame-das-intencoes.json");
    t("o selado abre (350) e está selado", (ex.itens || []).length === 350 && ex.selado === true, ex.erro ? "não abre" : String((ex.itens || []).length));
    const mE = medir(ex.itens || []);
    imprimir("SELADO (só agregados)", mE);
    travar("selado", mE);
  }
  /* nunca o silêncio: toda leitura de trocar/usar das réguas abertas tem uma das cinco respostas,
     e toda pergunta tem texto e opções */
  const abertos = [...(treino.itens || []), ...itensDoCorpus];
  const silencios = abertos.filter((it) => { const l = oOuvido(it.frase, it.cena); if (!["trocar", "usar"].includes(l.familia)) return false; const r = aRespostaDoMestre(l, it.cena); return !A_REGRA_DO_IMPROVISO.vereditos.includes(r.veredito) || (r.veredito === "pergunta" && !(r.pergunta && r.pergunta.texto && r.pergunta.opcoes.length)) || (["nao", "pergunta"].includes(r.veredito) && !A_REGRA_DO_IMPROVISO.motivos.includes(r.motivo)); });
  t("nunca o silêncio: toda troca e todo uso lidos recebem resposta (" + abertos.length + " frases)", silencios.length === 0, silencios.length + " sem resposta");
}

console.log("\n" + bons + " ok, " + maus + " XX");
process.exit(maus ? 1 : 0);
