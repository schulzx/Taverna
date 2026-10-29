/* teste-quem-disse.mjs (Fase 4, trilha B · 29/10/2026) — quem contou o boato, e onde fica o que se disse

   O boato que se confirma (src/boatos.js, 5db133a) só julga o que tem
   sítio, e só cobra quem contou se sabe quem foi. O Cronista escrevia quase
   sempre «dito por alguém em cena» e quase nunca o `local` — e o órgão
   dormia. Agora o juízo do Cronista (src/motor/cronista.js#julgarOCronista)
   lê na própria fala o que o sistema conhece: QUEM a disse (a gente do
   registo, do grupo e da cena nomeada junto dela — `quemDisse`) e ONDE fica
   o que ela diz (o sítio conhecido nomeado na mesma frase, ou o «aqui» da
   fala — `ondeDaFala`). Sem pedir nada a mais ao Cronista (0 caracteres no
   pedido dele) e sem nada no prompt do Narrador.

   E o replay (src/sessao.js) passa a correr o passo do boato sobre a pauta
   gravada, para uma revelação numa sessão gravada não sair como diferença
   «do App».

   Falha antes: no HEAD de antes (5db133a), `quemDisse` e `ondeDaFala` não
   existem, a pessoa citada numa fala sai «dito por alguém em cena» e sem
   `local`, e PASSOS_DO_REPLAY não tem «o boato». */
import fs from "node:fs";
import { julgarOCronista, quemDisse, ondeDaFala, O_QUE_O_CRONISTA_PODE } from "../src/motor/cronista.js";
import { oBoatoDaChegada, oBoatoQueChegou } from "../src/boatos.js";
import { criarNPC } from "../src/npcs.js";
import { correrOTurno, reproduzirASessao, abrirASessao, gravarOTurno, PASSOS_DO_REPLAY, estadoNoTurno } from "../src/sessao.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra) => {
  const v = typeof cond === "function" ? (() => { try { return !!cond(); } catch { return false; } })() : !!cond;
  if (v) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const Js = JSON.stringify;
const ler = (f) => JSON.parse(fs.readFileSync(new URL("./" + f, import.meta.url), "utf8"));
const F = O_QUE_O_CRONISTA_PODE.fatos;

/* ---------------- o mundo montado ---------------- */
const MAPA = { cidades: [{ nome: "Vau Seco", x: 30, y: 30 }, { nome: "Pedra Rasa", x: 40, y: 30 }, { nome: "Monte Alto", x: 70, y: 70 }] };
const BROM = { nome: "Brom" };
const CENA = [{ nome: "Aela", heroi: true }, BROM, { nome: "Sari" }];

sec("1. a tabela");
{
  t("quem disse e o paradeiro moram na linha dos fatos (uma tabela só)", !!F.quemDisse && !!F.paradeiro && typeof F.quemDisse.letras === "number" && F.quemDisse.verbo instanceof RegExp && F.paradeiro.preposicao instanceof RegExp);
  t("e a linha dos fatos não ganhou um «onde» (o «onde» das linhas é o arquivo:função de quem valida)", !("onde" in F));
  t("a marca com quem contou é a mesma marca, com o nome", F.marca("Brom") === "dito por Brom, não fato" && F.marca("") === "dito por alguém em cena, não fato");
}

sec("2. quem disse");
{
  t("a etiqueta depois da fala («— diz Brom»)", quemDisse("Clarissa", "— A Clarissa? Vive em Vau Seco — diz Brom, sem levantar os olhos.", CENA) === "Brom");
  t("a etiqueta com aspas («\"…\", responde Brom»)", quemDisse("Clarissa", "\"A Clarissa cura febres\", responde Brom.", CENA) === "Brom");
  t("o sujeito da frase antes da fala («Brom limpa o copo. \"…\"»)", quemDisse("Clarissa", "Brom limpa o copo devagar. \"A Clarissa cura febres em Vau Seco.\"", CENA) === "Brom");
  t("quem vem nomeado DEPOIS da fala, sem etiqueta, é a batida seguinte e não o dono", quemDisse("Clarissa", "Um velho cospe no chão. \"A Clarissa cura febres.\" Sari ajeita o cajado.", CENA) === "");
  t("o herói que fala («você fala: '…'») tapa quem estava antes", quemDisse("Santuário Cego", "Brom está perto da porta. Sem cerimônia, você fala: 'Vou ao Santuário Cego, a nordeste.'", CENA) === "");
  t("o herói como dono não é fonte («Aela diz: \"…\"»)", quemDisse("Clarissa", "Aela sorri. \"A Clarissa sabe o caminho.\"", CENA) === "");
  t("a PRIMEIRA fala conta: quem repete depois não contou", quemDisse("Ordem Velha", "O guarda ri. \"Isso é na Ordem Velha.\"\n\nBrom cruza os braços. \"E a tal Ordem Velha, onde fica?\"", CENA) === "");
  t("só o nome conhecido, e só escrito com maiúscula (o «homem da carroça» do registo não é «um homem»)", quemDisse("Clarissa", "Um homem cospe. \"A Clarissa sabe.\"", [{ nome: "Homem da carroça" }]) === "");
  t("o primeiro nome basta («Tomas» por «Tomas Ferreiro»)", quemDisse("Brina", "Tomas assente devagar. 'Brina? Ela vive lá.'", [{ nome: "Tomas Ferreiro" }]) === "Tomas Ferreiro");
  t("fora do parágrafo, não", quemDisse("Clarissa", "Brom limpa o copo.\n\n\"A Clarissa sabe.\"", CENA) === "");
  t("o nome que não está em fala nenhuma: ninguém", quemDisse("Clarissa", "Brom fala da Clarissa.", CENA) === "");
  t("lixo não estoura", [null, undefined, {}, 3].every((x) => quemDisse(x, x, x) === "" && quemDisse("Clarissa", "\"Clarissa\"", x) === ""));
  /* casos de verdade: as sessões de prova */
  const s8 = ler("sessao-s8.json"), s9 = ler("sessao-s9.json");
  const narr = (A, n) => A.turnos[n - 1].narrador.narrativa;
  const cenaDe = (A, n) => { const E = estadoNoTurno(A, n - 1); return [{ nome: E.personagem.nome, heroi: true }, ...Object.values(E.npcs || {}), ...(E.personagem.grupo || [])].filter((x) => x && x.nome); };
  t("s9/8: o livro de contas, dito por Tomas («Tomas assente devagar… 'Escondido mesmo, aqui…'»)", quemDisse("Livro de contas da guilda dos dedos", narr(s9, 8), cenaDe(s9, 8)) === "Tomas");
  t("s9/9: o livro-caixa, por Tomas — e não por Sari, que vem nomeada antes, numa batida que não fala", quemDisse("Livro-caixa da guilda dos dedos", narr(s9, 9), cenaDe(s9, 9)) === "Tomas");
  t("s8/50: o Cerco de Pedra Rasa, por Freya («Freya fica em silêncio… \"Eu dei a ordem.\"»)", quemDisse("Cerco de Pedra Rasa", narr(s8, 50), cenaDe(s8, 50)) === "Freya");
  t("s8/5: a Ordem dos Esquecidos é do guarda sem nome — Freya só pergunta por ela depois", quemDisse("Ordem dos Esquecidos", narr(s8, 5), cenaDe(s8, 5)) === "");
  t("s9/31: o Santuário Cego de Pedra Torta foi o herói que o disse, e não Tomas", quemDisse("Santuário Cego de Pedra Torta", narr(s9, 31), cenaDe(s9, 31)) === "");
}

sec("3. o paradeiro");
{
  const E = { mapa: MAPA, cidadeAtual: "Pedra Rasa" };
  t("o sítio do mapa depois da preposição, na mesma frase («Vive em Vau Seco»)", ondeDaFala("Clarissa", "Brom limpa o copo. \"A Clarissa vive em Vau Seco.\"", E) === "Vau Seco");
  t("a pergunta que ecoa o nome é respondida na frase seguinte («A Clarissa? Vive em Vau Seco»)", ondeDaFala("Clarissa", "— A Clarissa? Vive em Vau Seco — diz Brom.", E) === "Vau Seco");
  t("«foi pra», com artigo e sem acento no texto", ondeDaFala("Tamanqueiro", "'O Tamanqueiro? Dizem que foi pra Monte Alto antes da ponte cair.'", E) === "Monte Alto");
  t("a cidade do herói nunca é o paradeiro do que só se ouviu (o PROCURA/ESTÁ AQUI da 11.ª)", ondeDaFala("Clarissa", "\"A Clarissa vive em Pedra Rasa.\"", E) === "");
  t("a negação não diz onde ninguém está", ondeDaFala("Clarissa", "\"A Clarissa não vive em Vau Seco.\"", E) === "");
  t("a pergunta também não («A Clarissa está em Vau Seco?»)", ondeDaFala("Clarissa", "\"A Clarissa está em Vau Seco?\"", E) === "");
  t("o sítio noutra frase, sem eco, não conta", ondeDaFala("Clarissa", "\"A Clarissa sabe o caminho. Eu vou para Vau Seco amanhã.\"", E) === "");
  t("o sítio sem preposição não conta («Vau Seco e a Clarissa»)", ondeDaFala("Clarissa", "\"Vau Seco e a Clarissa são velhos conhecidos.\"", E) === "");
  t("o sítio que o sistema não conhece não se inventa", ondeDaFala("Brina", "'Brina? Tenta no Mercado das Sombras.'", E) === "");
  t("os lugares do cânone e os marcos da espinha também são sítios", ondeDaFala("Brina", "'A Brina mora no Posto Velho.'", { ...E, canone: { "Posto Velho": { tipo: "lugar" } } }) === "Posto Velho" && ondeDaFala("Brina", "'A Brina mora no moinho velho.'", { ...E, espinha: { atos: [{ marcos: [{ onde: "o moinho velho" }] }] } }) === "o moinho velho");
  t("o «aqui» da fala dá o sítio em que o herói está", ondeDaFala("Brina", "'Brina Pedra costuma fuçar aqui depois que eu saio.'", { ...E, lugar: { nome: "a forja de Tomas" } }) === "a forja de Tomas");
  t("…e a masmorra aberta, antes do lugar", ondeDaFala("Brina", "'A Brina dorme aqui.'", { ...E, lugar: { nome: "a forja" }, masmorra: { nome: "a cripta", encerrada: false } }) === "a cripta");
  t("…mas nunca a cidade, nem o «aqui» negado («ele não pisa aqui»)", ondeDaFala("Brina", "'A Brina dorme aqui.'", E) === "" && ondeDaFala("Brina", "'A Brina não pisa aqui faz três noites.'", { ...E, lugar: { nome: "a forja" } }) === "");
  t("lixo não estoura", [null, undefined, {}, 3, []].every((x) => ondeDaFala(x, x, x) === "" && ondeDaFala("Brina", "'A Brina dorme aqui.'", x) === ""));
  /* casos de verdade: os excertos rotulados da 6.ª, 7.ª e 11.ª (o estado: os lugares que a pauta sabia) */
  const X = ler("juiz-rotulado.json").excertos;
  const exc = (id) => X.find((e) => e.id === id);
  const Ex = (e) => ({ mapa: { cidades: (e.estado.lugares || []).map((nome) => ({ nome })) } });
  t("s6-M19: o Fogão da Meia-Noite fica «em Fogão Queimada»", ondeDaFala("Fogão da Meia-Noite", exc("s6-M19-meio-dia").prosa, Ex(exc("s6-M19-meio-dia"))) === "Fogão Queimada");
  t("s7-M7: «O Peixe Cego, em Sul Molhado»", ondeDaFala("Peixe Cego", exc("s7-M7-ambrosio").prosa, Ex(exc("s7-M7-ambrosio"))) === "Sul Molhado");
  t("s11-M3: «O Escudo Rachado? Não é aqui na praça… lá no Alto das Pedras»", ondeDaFala("Escudo Rachado", exc("s11-M3-pousada").prosa, { ...Ex(exc("s11-M3-pousada")), cidadeAtual: "Bela do Rio" }) === "Alto das Pedras");
}

sec("4. o juízo do Cronista");
{
  const NARR = "Brom limpa o copo devagar.\n— A Clarissa? Vive em Vau Seco, cura febres — diz Brom, sem levantar os olhos. — E o Livro Rubro está em Monte Alto.";
  const E = { personagem: { nome: "Aela", grupo: [{ nome: "Sari" }] }, npcs: { Brom: criarNPC("Brom", { papel: "taberneiro" }) }, canone: {}, mapa: MAPA, cidadeAtual: "Pedra Rasa" };
  const P = { pessoas: [{ nome: "Clarissa", papel: "curandeira", genero: "ela" }], canone: { "Livro Rubro": { tipo: "artefato", descricao: "um livro" } } };
  const j = julgarOCronista(E, P, { narrativa: NARR });
  const cla = (j.aceito.pessoas || [])[0] || {}, liv = (j.aceito.canone || {})["Livro Rubro"] || {};
  /* FALHA NO HEAD DE ANTES: «dito por alguém em cena», local "" */
  t("a pessoa só da fala sai com quem a contou e onde a procurar", cla.dito === "dito por Brom, não fato" && cla.local === "Vau Seco", Js(cla));
  t("a coisa só da fala também (o `local` do cânone, e a marca)", liv.dito === "dito por Brom, não fato" && liv.local === "Monte Alto", Js(liv));
  t("e o ditoPor diz quem", j.ditoPor.length === 2 && j.ditoPor.every((d) => d.quem === "Brom"), Js(j.ditoPor));
  const j2 = julgarOCronista(E, { pessoas: [{ nome: "Clarissa", local: "Monte Alto" }], canone: { "Livro Rubro": { tipo: "artefato", local: "a cripta" } } }, { narrativa: NARR });
  t("o `local` que o Cronista deu fica (o sistema só preenche o vazio)", j2.aceito.pessoas[0].local === "Monte Alto" && j2.aceito.canone["Livro Rubro"].local === "a cripta");
  const nada = "Um velho cospe. \"A Clarissa sabe o caminho, e o Livro Rubro também.\"";
  const j3 = julgarOCronista(E, P, { narrativa: nada });
  t("sem nada na fala, sai como saía: «alguém em cena», o `local` vazio na gente e SEM a chave no cânone", j3.aceito.pessoas[0].dito === F.marca("") && j3.aceito.pessoas[0].local === "" && !("local" in j3.aceito.canone["Livro Rubro"]) && j3.ditoPor.every((d) => d.quem === ""), Js(j3.aceito));
  const aqui = "'A Clarissa dorme aqui, no quarto de cima.'";
  const Eaqui = { ...E, lugar: { nome: "a Estalagem Torta" } };
  t("o «aqui» com o herói no sítio: o sítio", julgarOCronista(Eaqui, { pessoas: [{ nome: "Clarissa" }] }, { narrativa: aqui }).aceito.pessoas[0].local === "a Estalagem Torta");
  t("…e com o Cronista a repetir o sítio (com ou sem artigo), também", julgarOCronista(Eaqui, { lugar: "Estalagem Torta", pessoas: [{ nome: "Clarissa" }] }, { narrativa: aqui }).aceito.pessoas[0].local === "a Estalagem Torta");
  t("…mas não se o Cronista diz que o herói saiu de lá neste turno (outro sítio, ou «cidade»)", ["o cais", "cidade"].every((l) => julgarOCronista(Eaqui, { lugar: l, pessoas: [{ nome: "Clarissa" }] }, { narrativa: aqui }).aceito.pessoas[0].local === ""));
  t("quem se apresenta («Sou Wystan») continua a não ser dito, e a gente em cena não ganha marca", (() => { const r = julgarOCronista(E, { pessoas: [{ nome: "Wystan" }, { nome: "Brom" }] }, { narrativa: "O velho ergue o queixo. \"Sou Wystan.\" Brom sorri." }); return r.aceito.pessoas.every((p) => !p.dito); })());
  t("a gente nova DESTE turno, posta em cena pela prosa, também conta como quem contou", (() => { const r = julgarOCronista({ ...E, npcs: {} }, { pessoas: [{ nome: "Dara" }, { nome: "Brina" }] }, { narrativa: "Dara ri atrás da balança. 'A Brina vive em Vau Seco.'" }); const b = r.aceito.pessoas.find((p) => p.nome === "Brina"); return b && b.dito === "dito por Dara, não fato" && b.local === "Vau Seco"; })());
  t("determinista e não muta o recebido", (() => { const e0 = Js(E), p0 = Js(P); const a = Js(julgarOCronista(E, P, { narrativa: NARR })), b = Js(julgarOCronista(E, P, { narrativa: NARR })); return a === b && Js(E) === e0 && Js(P) === p0; })());
  t("lixo continua a dar a forma de sempre", [null, undefined, "x", []].every((x) => { const r = julgarOCronista(x, x, x); return r && typeof r.aceito === "object" && Array.isArray(r.ditoPor); }));
}

sec("5. ponta a ponta: o boato acorda");
{
  /* a Clarissa que o Brom citou em Pedra Rasa, e o herói que chega a Vau Seco noutro dia */
  const NARR = "Brom limpa o copo devagar.\n— A Clarissa? Vive em Vau Seco, cura febres — diz Brom, sem levantar os olhos.";
  const E = { personagem: { nome: "Aela", grupo: [] }, npcs: { Brom: criarNPC("Brom", { papel: "taberneiro", local: "Pedra Rasa", relacao: "rival" }) }, canone: {}, mapa: MAPA, cidadeAtual: "Pedra Rasa", dia: 2 };
  const j = julgarOCronista(E, { pessoas: [{ nome: "Clarissa", papel: "curandeira" }] }, { narrativa: NARR });
  const ficha = criarNPC("Clarissa", { ...j.aceito.pessoas[0], conhecidoEm: 2 });
  const chega = (npcs) => oBoatoDaChegada({ npcs, canone: {}, cidadeAtual: "Vau Seco", lugar: null, mapa: MAPA, dia: 5, mensagens: [], heroi: "Aela" }, null, "semente-1");
  const r = chega({ ...E.npcs, Clarissa: ficha });
  t("o herói chega a Vau Seco e o boato da Clarissa tem veredito", !!r.linhaDaPauta && r.nota.nome === "Clarissa" && r.nota.onde === "Vau Seco", Js(r.nota));
  t("e quem o contou sai da marca, sem procurar nas mensagens (que aqui vão vazias)", r.nota.contou === "Brom" && r.linhaDaPauta.includes("contou-o Brom"), r.linhaDaPauta);
  /* FALHA NO HEAD DE ANTES: a ficha nascia sem `local` e com «alguém em cena» — o boato dormia */
  const antes = chega({ ...E.npcs, Clarissa: criarNPC("Clarissa", { papel: "curandeira", local: "", dito: F.marca(""), conhecidoEm: 2 }) });
  t("com a ficha de antes (sem sítio, «alguém em cena»), o mesmo herói no mesmo sítio não ouvia nada", !antes.linhaDaPauta);
  /* a mentira de um rival deixa rasto nele */
  let mentira = null;
  for (let i = 0; i < 300 && !mentira; i++) { const x = oBoatoDaChegada({ npcs: { ...E.npcs, Clarissa: ficha }, canone: {}, cidadeAtual: "Vau Seco", mapa: MAPA, dia: 5, heroi: "Aela" }, null, "s" + i); if (x.nota && x.nota.veredito === "mentira") mentira = x; }
  t("se era mentira, as notas do Brom guardam-no (e ele terá de responder)", !!mentira && /sobre Clarissa/.test(mentira.estado.npcs.Brom.notas) && mentira.linhaDaPauta.includes("Brom terá de responder"), mentira && mentira.linhaDaPauta);
}

sec("6. o replay corre o boato");
{
  const passo = PASSOS_DO_REPLAY.find((p) => p.passo === "o boato");
  t("o passo existe, entre o passo antes do Mestre e o turno do Mestre, e diz de onde vem", !!passo && /boatos\.js/.test(passo.de) && PASSOS_DO_REPLAY.indexOf(passo) === PASSOS_DO_REPLAY.findIndex((p) => p.passo === "o turno do Mestre") - 1);
  const SEM = "semente-do-mundo";
  const inicio = {
    versao: 2, personagem: { nome: "Aela", nivel: 1, grupo: [] }, mapa: MAPA, cidadeAtual: "Vau Seco", lugar: null, dia: 5, canone: {},
    npcs: { Brom: criarNPC("Brom", { papel: "taberneiro", local: "Pedra Rasa" }), Clarissa: criarNPC("Clarissa", { papel: "curandeira", local: "Vau Seco", dito: F.marca("Brom"), conhecidoEm: 2 }) },
  };
  const rev = oBoatoDaChegada({ ...inicio, heroi: "Aela", mensagens: [] }, null, SEM);
  t("(o caso: o herói em Vau Seco, a Clarissa dita por Brom)", !!rev.linhaDaPauta);
  const linha = (pauta) => ({ n: 1, entrada: { frase: "olho em volta" }, sorte: { ponto: "5|600|3" }, pedido: { pauta }, narrador: { narrativa: "O vento sopra.", mudancas: {} }, cronista: null, juiz: null, estado: {} });
  const com = correrOTurno(inicio, linha("[PAUTA]\nO BOATO    " + rev.linhaDaPauta), { semente: SEM });
  const sem = correrOTurno(inicio, linha("[PAUTA]\nONDE      em Vau Seco"), { semente: SEM });
  const depois = correrOTurno(inicio, linha("[PAUTA]\nO BOATO    " + rev.linhaDaPauta), { semente: SEM, so: "depois" });
  t("com a linha na pauta gravada, o registo muda como mudou no App", Js(com.estado.npcs.Clarissa) === Js(rev.estado.npcs.Clarissa) && !("dito" in com.estado.npcs.Clarissa) === !("dito" in rev.estado.npcs.Clarissa), Js(com.estado.npcs.Clarissa));
  t("sem a linha (o teto cortou-a), fica como estava", Js(sem.estado.npcs.Clarissa) === Js(inicio.npcs.Clarissa));
  t("e o servidor (`so: \"depois\"`) não o corre: o boato dele foi no pedido", Js(depois.estado.npcs.Clarissa) === Js(inicio.npcs.Clarissa));
  /* a sessão gravada pelo App, com a revelação: o replay reproduz o registo e o cânone */
  const A = gravarOTurno(abrirASessao({ semente: SEM, estado: inicio }), { ...linha("[PAUTA]\nO BOATO    " + rev.linhaDaPauta), estado: com.estado });
  const rep = reproduzirASessao(A);
  const t1 = rep.turnos[0] || {};
  const doBoato = (ds) => (ds || []).filter((d) => /^(npcs|canone)\b/.test(d.caminho));
  t("a revelação gravada não aparece como diferença no registo nem no cânone", rep.valido && doBoato(t1.diferencas).length === 0 && !(t1.divida || []).some((d) => doBoato(d.caminhos.map((caminho) => ({ caminho }))).length), Js(t1).slice(0, 400));
  /* a mordida: o mesmo arquivo com a pauta sem a linha — o App mudou o registo, e o replay não sabe porquê */
  const B = gravarOTurno(abrirASessao({ semente: SEM, estado: inicio }), { ...linha("[PAUTA]\nONDE      em Vau Seco"), estado: com.estado });
  const rb = reproduzirASessao(B).turnos[0] || {};
  t("a prova morde: sem a linha na pauta gravada, o mesmo registo diverge", doBoato(rb.diferencas).length > 0, Js(rb.diferencas));
}

sec("7. a medida nas sessões de prova");
{
  /* as 13 entradas `dito` que o Cronista daquele jogo registou nas 194 leituras das sessões 8–10 (o juízo
     gravado É o de hoje: teste-sessao prova-o turno a turno, e gravar-sessoes-de-prova regerou-o) */
  const linhas = [];
  for (const s of ["sessao-s8", "sessao-s9", "sessao-s10"]) {
    for (const L of ler(s + ".json").turnos) {
      const j = (L.cronista || {}).juizo;
      if (!j) continue;
      for (const d of j.ditoPor || []) {
        if (d.secao === "promessas") continue;
        const f = d.secao === "gente" ? (j.aceito.pessoas || []).find((p) => p.nome === d.o) : (j.aceito.canone || {})[d.o];
        linhas.push({ caso: `${s}/${L.n} ${d.o}`, quem: d.quem, local: (f || {}).local || "" });
      }
    }
  }
  const comQuem = linhas.filter((x) => x.quem), comSitio = linhas.filter((x) => x.local);
  console.log(`  ..  ${linhas.length} entradas dito; com quem contou ${comQuem.length} (${comQuem.map((x) => `${x.caso} ← ${x.quem}`).join("; ")}); com sítio ${comSitio.length} (${comSitio.map((x) => `${x.caso} → ${x.local}`).join("; ")})`);
  /* MEDIDA (29/10): 13 entradas; antes 0 com quem contou, agora 3, as três conferidas à mão contra a prosa;
     o sítio fica em 1 (o do próprio Cronista): nestas sessões as falas nomeiam sítios que o mapa não tem
     (Buraco Norte, Pedra Rasa, Vau de Pedra) — o sistema não os conhece, e não os inventa. É catraca. */
  t(`13 entradas, 3 com quem contou (Freya, Tomas, Tomas) e 1 com sítio`, linhas.length === 13 && Js(comQuem.map((x) => x.quem)) === Js(["Freya", "Tomas", "Tomas"]) && comSitio.length === 1, Js(linhas));
}

console.log(`\n${ok} ok, ${mal} falha(s)`);
process.exit(mal ? 1 : 0);
