/* v9.36 — o preço da cena, a duplicata e a etapa que nasce cumprida */
import {
  recompensaDe, precoNoTexto, pareceMesmaMissao, mesmaPessoa, assuntoDe,
  aceitarProposta, criarMissao, textoDaPaga, etapaAtual, textoDaEtapa,
  envelopeDeAceite, envelopeDeRecusa, envelopeDeConclusao,
  responderOferta, conferir,
} from "../src/missoes.js";

let ok = 0, fail = 0;
const t = (nome, cond) => { if (cond) { ok++; } else { fail++; console.log("  ✗ " + nome); } };

/* ---------- preço na cena ---------- */
t("acha o preço do mural", precoNoTexto("Paga-se 15 moedas pelo bicho que andou atacando.") === 15);
t("aceita 'peças de ouro'", precoNoTexto("Ofereço 200 peças de ouro.") === 200);
t("dois preços = ruído", precoNoTexto("15 moedas agora e 30 moedas depois") === null);
t("cabeças de gado não é preço", precoNoTexto("Sumiram 15 cabeças de gado") === null);
t("sem preço", precoNoTexto("Ajude-me, por favor.") === null);
t("texto vazio", precoNoTexto("") === null && precoNoTexto(null) === null);

/* ---------- recompensa ---------- */
const arbitrada = recompensaDe({ tipo: "contrato", nivel: 3, etapas: 3 });
t("arbitrada não é combinada", arbitrada.combinada === false && arbitrada.moedas > 0);
const combinada = recompensaDe({ tipo: "contrato", nivel: 3, etapas: 3, moedasPrometidas: 15 });
t("o preço da cena vence", combinada.moedas === 15 && combinada.combinada === true);
t("xp não depende do preço", combinada.xp === arbitrada.xp);
const semMoeda = recompensaDe({ tipo: "favor", nivel: 5, etapas: 2, moedasPrometidas: 0 });
t("favor por informação não paga moeda", semMoeda.moedas === 0 && semMoeda.combinada === true);
t("mas ainda dá XP", semMoeda.xp > 0);
t("negativo é ignorado", recompensaDe({ tipo: "favor", nivel: 1, etapas: 1, moedasPrometidas: -5 }).combinada === false);

/* ---------- mesma pessoa ---------- */
t("Braam n'A Cabra = Braam o taverneiro", mesmaPessoa("Braam (n'A Cabra Dançante)", "Braam, o taverneiro"));
t("Braam ≠ Ubba", !mesmaPessoa("Braam", "Ubba"));
t("vazio não casa", !mesmaPessoa("", "Braam") && !mesmaPessoa("Braam", ""));
t("nome curto não casa por acaso", !mesmaPessoa("Al", "Al"));

/* ---------- o caso do gado ---------- */
const gadoA = {
  titulo: "O gado de Jessa", dador: "Braam (n'A Cabra Dançante)",
  descricao: "Investigar o ataque ao celeiro de Jessa e encontrar o gado desaparecido.",
  etapas: [{ tipo: "falar_com", alvo: "Braam" }, { tipo: "ir_a", alvo: "Estrada Velha" }, { tipo: "derrotar", alvo: "besta" }],
};
const gadoB = {
  titulo: "O gado desaparecido de Jessa", dador: "Braam, o taverneiro",
  descricao: "Investigar o desaparecimento do gado de Jessa, seguindo o rastro e o cheiro deixados.",
  etapas: [{ tipo: "ir_a", alvo: "Rua da Fornalha" }, { tipo: "derrotar", alvo: "besta" }],
};
t("o mural e o taverneiro são a MESMA missão", pareceMesmaMissao(gadoA, gadoB));
const ratos = {
  titulo: "Ratos na dispensa", dador: "Braam, o taverneiro",
  descricao: "Caçar os ratos da dispensa no cais antes que estraguem a salmoura.",
  etapas: [{ tipo: "derrotar", alvo: "rato", quantos: 6 }],
};
t("mesmo dador, outro serviço, missões distintas", !pareceMesmaMissao(gadoA, ratos));
t("título idêntico basta", pareceMesmaMissao({ titulo: "X", etapas: [] }, { titulo: "x", etapas: [] }));
t("assunto ignora palavras vazias", !assuntoDe(gadoA).has("de") && assuntoDe(gadoA).has("gado"));

/* ---------- a porta de entrada ---------- */
const mundoVazio = { cidadeAtual: "Vale Fundo", npcs: {}, inventario: [], equipamento: [], derrotados: [], dia: 3, relogios: [] };
const r1 = aceitarProposta([], gadoA, { nivel: 2, dia: 3, mundo: mundoVazio, moedasNaCena: 15 });
t("a oferta entra", r1.ok);
t("paga o que o cartaz prometeu", r1.missao.recompensa.moedas === 15);
t("a etapa de procurar quem ofereceu some", !r1.missao.etapas.some((e) => e.tipo === "falar_com"));
t("as outras duas ficam", r1.missao.etapas.length === 2);

const r2 = aceitarProposta(r1.missoes, gadoB, { nivel: 2, dia: 3, mundo: mundoVazio });
t("a segunda oferta do mesmo gado é recusada", !r2.ok && /já está no diário/.test(r2.motivo));

const r3 = aceitarProposta(r1.missoes, ratos, { nivel: 2, dia: 3, mundo: mundoVazio });
t("outro serviço do mesmo dono passa", r3.ok);

/* concluída também bloqueia reoferta */
const concluida = [{ ...r1.missao, status: "concluida" }];
t("trabalho já concluído não volta ao mural", !aceitarProposta(concluida, gadoB, { nivel: 2, dia: 3, mundo: mundoVazio }).ok);

/* ---------- o caso do Ubba ---------- */
const ubba = {
  titulo: "Informação por um favor", tipo: "favor", dador: "Ubba",
  descricao: "Ubba troca o que sabe por um recado entregue.", paga: 0,
  etapas: [{ tipo: "falar_com", alvo: "Ubba" }, { tipo: "ir_a", alvo: "Fonte Velha" }],
};
const rU = aceitarProposta([], ubba, { nivel: 4, dia: 5, mundo: mundoVazio });
t("Ubba não manda procurar Ubba", rU.ok && rU.missao.etapas.length === 1 && rU.missao.etapas[0].tipo === "ir_a");
t("favor por informação: zero moedas", rU.missao.recompensa.moedas === 0);
t("a tela diz que o pagamento é outro", /sem moedas/.test(textoDaPaga(rU.missao)));
/* v9.119: `envelopeDeOferta` saiu da fonte. Ninguém mais faz uma proposta
   ao herói na cena: quem quer um serviço feito prega um cartaz, e o
   envelope que corresponde a isso é `envelopeDoRecado`, provado em
   teste-ofertas. O que se media aqui — o preço cravado, a proibição de
   prometer dinheiro — continua provado lá, sobre o envelope que existe. */

/* etapa que o mundo já satisfaz não nasce */
const mundoComUbba = { ...mundoVazio, npcs: { Ubba: { nome: "Ubba", conhecidoEm: 4 } }, cidadeAtual: "Fonte Velha" };
const rV = aceitarProposta([], { ...ubba, dador: "Zorg" }, { nivel: 4, dia: 5, mundo: mundoComUbba });
t("nenhuma etapa nasce cumprida", !rV.ok && /nenhuma etapa/.test(rV.motivo));

/* ---------- aceitar não narra ---------- */
const oferta = criarMissao({ titulo: "Escolta", tipo: "contrato", dador: "Mira", etapas: [{ tipo: "ir_a", alvo: "Porto" }], nivel: 3, dia: 1, moedasPrometidas: 40 });
t("oferta nasce esperando resposta", oferta.status === "oferecida");
const ac = responderOferta([oferta], oferta.id, true);
t("aceitar ativa", ac.ok && ac.missoes[0].status === "ativa");
t("o aceite manda esperar a fala do jogador", /NÃO narre o acordo/.test(envelopeDeAceite(oferta)));
t("o aceite repete o valor combinado", /40 moedas/.test(envelopeDeAceite(oferta)));
t("a recusa também espera", /NÃO narre a recusa/.test(envelopeDeRecusa(oferta)));
t("conclusão sem moeda não fala em pagar", /creditou/.test(envelopeDeConclusao(rU.missao, rU.missao.recompensa)));
t("conclusão com moeda fala em pagar", /pagou ◉ 40/.test(envelopeDeConclusao(oferta, oferta.recompensa)));

/* ---------- o conferente segue vivo ---------- */
const ativa = { ...oferta, status: "ativa" };
const c = conferir([ativa], { ...mundoVazio, cidadeAtual: "Porto" });
t("chegar ao Porto fecha a missão", c.concluidas.length === 1 && c.avancos.length === 1);
t("etapa restante tem texto", textoDaEtapa({ tipo: "ir_a", alvo: "Porto" }) === "Chegar a Porto");
t("sem etapa atual quando acaba", etapaAtual(c.missoes[0]) === null);


/* ---------------- A PAGA INTEIRA (v9.193) ----------------
   `aba-diario-v2` foi redesenhada a partir do que o diário faz — o arco com
   a etapa em curso, os pontos das etapas de cada missão, a etapa atual por
   extenso, o patamar de dificuldade, a paga e o prazo. E aí apareceu o mesmo
   defeito que o mural tinha: a linha da paga SUB-RELATAVA a recompensa.

   A FAMA nunca aparecia — e fama é sistema de verdade aqui, ela muda como o
   mundo trata o herói. E no ramo "sem moedas" o ITEM também sumia,
   justamente onde ele mais importa: um favor que não paga moeda nenhuma e
   entrega uma peça rara lia como "o pagamento é outro" e ponto. */
console.log("\n[a paga inteira]");
{
  const comTudo = { recompensa: { moedas: 180, xp: 320, fama: 9, item: "raro", combinada: false } };
  const linha = textoDaPaga(comTudo);
  t("a paga diz as moedas", /◉ 180/.test(linha));
  t("o XP", /320 XP/.test(linha));
  t("a fama, que nunca aparecia", /\+9 fama/.test(linha));
  t("e o item", /item raro/.test(linha));

  /* o combinado continua marcado: preço dito na cena é preço da cena */
  t("o preço combinado se identifica", /\(o combinado\)/.test(textoDaPaga({ recompensa: { moedas: 60, xp: 100, combinada: true } })));

  /* SEM MOEDAS: o ramo em que o item mais importa, e onde ele sumia */
  const favor = { recompensa: { moedas: 0, xp: 240, fama: 7, item: "incomum", combinada: true } };
  const lf = textoDaPaga(favor);
  t("sem moedas continua dizendo que o pagamento é outro", /sem moedas/.test(lf));
  t("mas agora diz o XP", /240 XP/.test(lf));
  t("a fama", /\+7 fama/.test(lf));
  t("e o item, que antes sumia justamente aqui", /item incomum/.test(lf));

  /* NADA SABIDO É NADA MOSTRADO: o que não existe some, em vez de virar zero */
  t("sem fama, não escreve fama", !/fama/.test(textoDaPaga({ recompensa: { moedas: 10, xp: 20 } })));
  t("sem item, não escreve item", !/item/.test(textoDaPaga({ recompensa: { moedas: 10, xp: 20 } })));
  t("sem recompensa nenhuma, linha vazia", textoDaPaga({}) === "" && textoDaPaga(null) === "");
  t("e recompensa vazia também não vira ruído", textoDaPaga({ recompensa: { moedas: 0, xp: 0 } }) === "");
}
console.log(`\nmissões v9.36: ${ok} passaram, ${fail} falharam`);
process.exit(fail ? 1 : 0);
