/* Taverna v7.1 — ECONOMIA: âncoras de preço para o Mestre não se perder.
   Bloco de texto injetado no prompt do sistema (zero tokens de raciocínio —
   é só referência). Valores em moedas de ouro (◉), calibrados ao que o app
   realmente entrega (mural, decretos, espólios, renda). */
export const ECONOMIA_PROMPT = `ECONOMIA DO MUNDO (a escala das coisas — o preço dito na cena é o que o sistema mandou; sem número dele, quem fala diz sem número):
ESCALA DE RIQUEZA: ◉ 10 sustenta um pobre por uma semana · ◉ 50 é um mês de vida simples · ◉ 200 compra equipamento de aventureiro respeitável · ◉ 1.000 é uma pequena fortuna (casa modesta, navio velho) · ◉ 10.000 é riqueza de nobre. Um camponês ganha ◉ 2–5 por dia de trabalho; um artesão, ◉ 5–10; um guarda, ◉ 8–15; um cavaleiro a serviço, ◉ 20–40.
PREÇOS COMUNS: refeição simples ◉ 1–2 · refeição boa com bebida ◉ 3–5 · noite em estalagem simples ◉ 3–6 (quarto bom ◉ 8–15, luxo ◉ 25+) · caneca de cerveja ◉ 1 · garrafa de vinho bom ◉ 5–12 · ferradura/reparo simples ◉ 2–5 · poção de cura comum ◉ 25–50.
EQUIPAMENTO: arma simples ◉ 10–25 · arma de qualidade ◉ 40–100 · armadura leve ◉ 15–40 · armadura pesada ◉ 60–150 · escudo ◉ 10–20 · item mágico menor ◉ 150–400 (raros e poderosos NÃO se vendem em loja comum).
TRANSPORTE: cavalo de sela ◉ 75–150 · cavalo de guerra ◉ 300–600 · carroça ◉ 40–80 · passagem de navio por pessoa ◉ 5–20 por trecho (cabine boa ◉ 30–60) · fretar navio pequeno ◉ 150–400 por viagem.
SERVIÇOS E PESSOAS: mercenário por dia ◉ 5–15 · guia por dia ◉ 3–8 · mensageiro ◉ 5–15 · suborno comum ◉ 10–50 · resgate de refém comum ◉ 100–500.
CIDADES: em vilas tudo é mais barato (−30% a −50%); em capitais e portos ricos, mais caro (+30% a +100%). Escassez de guerra/cerco pode dobrar preços de comida.
RECOMPENSAS: as recompensas de contratos e decretos são definidas PELO SISTEMA (mural/decretos) — na ficção, trate esses valores como justos e proporcionais ao perigo; não invente recompensas maiores por conta própria.
COMPRA E VENDA: o preço final é AFERIDO PELO SISTEMA (venda = metade do valor; compra dentro da faixa justa). Você negocia e narra à vontade — descontos e ágios de roleplay são bem-vindos na ficção — mas o número que entra/sai do bolso é o do sistema.`;

/* VALOR DE MERCADO POR CÓDIGO (v7.4.3): o sistema precifica o que troca de
   mãos — o Mestre não inventa mais número de compra/venda. Equipamentos
   valem pela raridade; miudezas de inventário valem uma taxa simbólica. */
const VALOR_RARIDADE = { comum: 15, incomum: 60, raro: 220, epico: 900, lendario: 3500 };
export function valorDeItem(item) {
  if (!item) return 5;
  if (typeof item === "string") return 5;
  if (item.raridade && VALOR_RARIDADE[item.raridade]) return VALOR_RARIDADE[item.raridade];
  return 10;
}
export const PRECO_VENDA = 0.5;        // revender rende METADE do valor
export const FAIXA_COMPRA = [0.5, 2];  // compra justa: entre metade e o dobro da estimativa

/* ============================================================
   OS PREÇOS COMUNS (o Narrador só narra · E1, 12/10)

   A medição (`mente/narrador-so-narra.md` §3) contou dez preços que o
   Narrador disse na 6.ª e na 7.ª sessões, e em oito o sistema não tinha o
   número: a refeição quente ("duas fichas"), a maçã ("uma ficha"), as duas
   canecas ("dois cobres"), o que o barqueiro pede por uma informação
   ("cinco cobres"), o peixe seco da tenda ("três cobre"). As faixas
   existiam — mas só em PROSA, no `ECONOMIA_PROMPT` acima, com a licença
   "qualquer preço… DEVE respeitar estas faixas", que é dizer ao Narrador
   que o número é dele. Quando o dado chega em frase fechada ele obedece
   (preços 3 de 4); quando não chega, inventa dentro da faixa.

   Aqui as faixas viram TABELA, com a base no meio de cada uma (o molde de
   `PRECOS_DO_POUSO`, cidade-por-dentro.js). `faixa` é a do texto acima,
   quando o texto a dá, e a suíte lê-a de volta no texto — o número não sai
   da regra que o prompt já ensinava. O que o texto não dá (a comida de rua,
   a informação, o pedágio) tem `faixa: null` e base de bolso: a comida de
   rua é a refeição simples mais pequena; a informação de quem a vende fica
   entre o guia e o mensageiro; o pedágio é o de uma porta, não o de uma
   ponte de senhor. O porte da cidade move tudo pelo MESMO fator do pouso
   (`fichaDaCidade(…).pouso.fator`) — a aldeia mais barata, o porto mais
   caro — para a caneca e o quarto não discordarem sobre a mesma terra.

   `rx` lê a frase já sem acento (e com "maçã" já trocada por "fruta" —
   `O_ACENTO_SEPARA`, abaixo). `rua: true` são as três que a cena de cidade
   mostra sem ninguém perguntar (`PRECOS_DA_RUA`); `porPalavra`, a linha
   perguntada diz a palavra do jogador ("fruta ◉ 1", não a lista inteira);
   `curto`, o nome na linha da rua, que cabe em ~70 caracteres.
   ============================================================ */
export const PRECOS_COMUNS = [
  { id: "caneca", nome: "caneca de cerveja", curto: "caneca", base: 1, faixa: [1, 1], rua: true, rx: /\b(canecas?|cervejas?|hidromel|aguardentes?|tragos?|copos? de (cerveja|aguardente|hidromel))\b/ },
  { id: "refeicao", nome: "refeição quente", curto: "prato quente", base: 2, faixa: [1, 2], rua: true, rx: /\b(refeic(ao|oes)|pratos? (quente|do dia|de comida)|caldos?|sopas?|ensopados?|comida quente|jantar|almoco|ceia|algo de comer|de comer)\b/ },
  { id: "refeicaoBoa", nome: "refeição boa com bebida", base: 4, faixa: [3, 5], rx: /\b(refeic(ao|oes) boas?|banquete|mesa farta|assados?)\b/ },
  { id: "vinho", nome: "garrafa de vinho bom", base: 8, faixa: [5, 12], rx: /\b(garrafas? de vinho|jarras? de vinho|vinho bom|vinhos?)\b/ },
  { id: "rua", nome: "comida de rua (pão, fruta, peixe seco)", curto: "pão, fruta ou peixe seco", base: 1, faixa: null, rua: true, porPalavra: true, rx: /\b(paes|pao|fruta|frutas|peixes? secos?|peixes?|queijos?|bolos?|espetinhos?|castanhas?|figos?|uvas?|peras?|laranjas?)\b/ },
  { id: "reparo", nome: "reparo simples", base: 3, faixa: [2, 5], rx: /\b(conserto|consertar|reparo|reparar|remendo|remendar|ferraduras?)\b/ },
  { id: "guia", nome: "guia, por dia", base: 5, faixa: [3, 8], rx: /\b(guias?|quem me leve|quem nos leve)\b/ },
  { id: "mensageiro", nome: "mensageiro", base: 10, faixa: [5, 15], rx: /\b(mensageiros?|levar (uma|a|esta) (carta|mensagem|recado))\b/ },
  { id: "passagem", nome: "passagem de barco, por pessoa", base: 10, faixa: [5, 20], rx: /\b(passage(m|ns) (de|num|no|em) (barco|navio)|barqueiros?|travessia)\b/ },
  { id: "informacao", nome: "uma informação, de quem a vende", base: 3, faixa: null, rx: /\b(quanto (voce |tu |o senhor |a senhora )?(quer|queres|cobra|cobras|pede|pedes|leva|levas) (por|pra|para) (saber|dizer|contar|falar|mostrar|guiar|abrir a boca|isso)|(preco|quanto) (da|de uma|pela|por uma) informac(ao|oes))/ },
  { id: "pedagio", nome: "pedágio da porta, por cabeça", base: 1, faixa: null, rx: /\b(pedagios?|portagem|taxa de entrada|imposto da porta)\b/ },
];
/* A GRAFIA (E2, 12/10). `rx` lê a frase sem acento, e a linha perguntada
   (`porPalavra`) dizia a palavra assim: "2× paes ◉ 2" — e o Mestre copiou,
   "Dois paes? Quatro coroas." (a prova viva da E1, T9). A palavra que a
   linha diz sai daqui, com o acento que a língua lhe dá, escreva o jogador
   com ou sem til. Só as que levam acento; as outras seguem tal qual. */
export const GRAFIA_DA_RUA = Object.freeze({ pao: "pão", paes: "pães" });
/* a ordem da linha de rua: o que se bebe, o que se come à mesa, o que se come de pé */
export const PRECOS_DA_RUA = PRECOS_COMUNS.filter((p) => p.rua).map((p) => p.id);
/* o fator do porte nunca leva o preço para fora de metade ou do dobro (a
   mesma régua de `PRECOS_DO_POUSO`), e nada custa menos de ◉ 1 */
export const FATOR_DO_PRECO = { piso: 0.5, teto: 2, minimo: 1 };

export function precoComum(id, fator = 1) {
  const p = PRECOS_COMUNS.find((x) => x.id === id);
  if (!p) return null;
  const f = Number.isFinite(Number(fator)) && Number(fator) > 0 ? Math.max(FATOR_DO_PRECO.piso, Math.min(FATOR_DO_PRECO.teto, Number(fator))) : 1;
  return Math.max(FATOR_DO_PRECO.minimo, Math.round(p.base * f));
}

/* ---------------- O ACENTO QUE SEPARA (MM-C · C0, 11/10) ----------------
   "Compro uma maçã de uma vendedora ambulante" (a 6.ª sessão, J12) deu
   "🛒 maca compra-se nas bancas": sem acento, a maçã é a MAÇA das armas.
   Antes de tirar o acento, o que só o acento distingue troca-se por uma
   palavra que nenhuma tabela de compra conhece — a fruta não é do balcão
   nem da banca, e o falso negativo é o comportamento de antes.

   E1 (12/10): MUDOU-SE de bolsa-da-frase.js para aqui. O J13 da mesma
   sessão ("pergunto à vendedora de maçãs se vende outra… o preço das
   frutas") levou à pauta "não há macas à venda; armas à venda: Alabarda
   ◉ 88" — o `mercadoParaPauta` (mercado.js) não lia a tabela, porque
   bolsa-da-frase.js importa mercado.js e a volta fazia o círculo. Num
   módulo sem importações, os dois leem a mesma tabela. E a "fruta" que
   ela devolve é a palavra que `PRECOS_COMUNS.rua` conhece. */
export const O_ACENTO_SEPARA = [
  { rx: /\bmaçãs?(?![\p{L}])/giu, vira: "fruta" },
];
export const semConfusao = (frase) => O_ACENTO_SEPARA.reduce((s, x) => s.replace(x.rx, x.vira), String(frase == null ? "" : frase));

/* ---------------- A COISA DA BANCA, NOMEADA (12/10, MM11 · 9.ª sessão, M43–M44) ----------------
   "Pergunto quanto custa o anel com nome gravado por dentro, e também as
   ataduras de linho." — o ambulante tinha os dois no estoque (◉ 100 e
   ◉ 29), e a pauta não levou número nenhum: a régua do preço perguntado só
   conhecia GÉNEROS de mercadoria (adaga, espada, poção…), e nem "anel" nem
   "ataduras" eram um. O Mestre disse "cem marcos" e "cinco". No turno
   seguinte, "compro as ataduras e pago as cinco moedas que ele pediu"
   entrou de graça.

   A coisa à venda nomeia-se pelo NOME DELA, que o jogador lê no painel e na
   prosa: a cabeça do nome, as palavras antes do primeiro conector ("Anel |
   com nome gravado", "Ataduras | de Linho", "Elixir | de Destreza"), duas
   no máximo, quatro letras ou mais, e nenhuma das que só qualificam. O
   singular e o plural casam ("a atadura", "as ataduras"). Mora aqui, num
   módulo sem importações, porque mercado.js (a pauta) e bolsa-da-frase.js
   (a compra) leem a mesma régua — e bolsa-da-frase.js importa mercado.js. */
export const NOME_DA_COISA = {
  conectores: ["de", "do", "da", "dos", "das", "com", "sem", "em", "para", "por", "que"],
  palavras: 2,
  minimo: 4,
  soQualificam: ["grande", "pequeno", "pequena", "medio", "media", "velho", "velha", "novo", "nova", "bom", "boa", "simples", "comum", "raro", "rara", "antigo", "antiga", "demais", "muito", "pouco"],
};
const semAcentoE = (s) => String(s == null ? "" : s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const raizE = (p) => p.replace(/(oes|aes|ais|eis)$/, (x) => ({ oes: "ao", aes: "ao", ais: "al", eis: "el" })[x]).replace(/s$/, "");
/* as palavras que nomeiam a coisa (sem acento, na raiz) */
export function cabecaDaCoisa(nome) {
  const ps = semAcentoE(nome).split(/[^a-z]+/).filter(Boolean);
  const out = [];
  for (const p of ps) {
    if (NOME_DA_COISA.conectores.includes(p) || out.length >= NOME_DA_COISA.palavras) break;
    if (p.length >= NOME_DA_COISA.minimo && !NOME_DA_COISA.soQualificam.includes(p)) out.push(raizE(p));
  }
  return out;
}
/* a frase nomeia esta coisa? (`texto` cru ou já sem acento) */
export function nomeiaACoisa(texto, nome) {
  const cab = cabecaDaCoisa(nome);
  if (!cab.length) return false;
  const ws = new Set(semAcentoE(texto).split(/[^a-z]+/).filter(Boolean).map(raizE));
  return cab.some((c) => ws.has(c));
}
