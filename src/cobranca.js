/* ============================================================
   A COBRANÇA (v9.70) — o que a narração prometeu, o sistema entrega

   "Se a IA disse 'você acha 100 moedas e uma poção de vida', então o
   mestre credita ao player 100 moedas e uma poção de vida."

   O problema é antigo e silencioso. O Mestre de IA tem um canal para
   declarar o que mudou — `mudancas`, com `moedas` e `adicionar_itens` —
   e o sistema o aplica direitinho. Mas ele é um narrador: às vezes
   escreve a cena inteira, com o brilho das moedas na palma da mão, e
   esquece de preencher o campo. Aí o jogador LÊ que ganhou cem moedas,
   olha a bolsa e continua com as mesmas de antes.

   Não é um bug de código: é a distância entre a ficção e a ficha, e ela
   sempre aparece do lado que ninguém confere. O jogador não sabe se
   deve confiar no texto ou no número, e essa dúvida come o jogo por
   dentro — a partir dela, todo prêmio precisa ser verificado à mão.

   ESTE ARQUIVO LÊ A NARRATIVA e devolve o que ela AFIRMA que o herói
   ganhou. Quem compara com o que o Mestre declarou, e credita a
   diferença, é o App.

   ------------------------------------------------------------
   AS TRÊS TRAVAS, e elas importam mais que a detecção:

   1. SÓ O QUE ACONTECEU COM O HERÓI. "no bolso dele havia cem moedas"
      não é ganho: é descrição. Precisa de verbo de aquisição com o
      herói como sujeito — acha, pega, embolsa, recolhe, ganha, recebe.

   2. NEGAÇÃO MATA A FRASE. "você não encontra nada de valor" tem
      "encontra" e um número pode estar por perto. Uma negação em
      qualquer ponto da frase descarta a frase inteira: o lado seguro de
      errar aqui é não creditar.

   3. TETO POR TURNO. Uma narração que promete dez mil moedas ou é
      delírio ou é um tesouro que deveria ter vindo por `mudancas`, com
      o Mestre sabendo o que fazia. O sistema credita até o teto e
      registra que aparou — creditar o absurdo em silêncio seria trocar
      um buraco por outro maior.
   ============================================================ */

import { CONSUMIVEIS } from "./pocoes.js";

const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/* O herói ganhou alguma coisa NESTA frase? O sujeito tem de ser ele. */
const RX_GANHO = /\b(voc[eê]|eu)\s+(\w+\s+){0,3}(acha|achou|encontra|encontrou|pega|pegou|embolsa|embolsou|recolhe|recolheu|guarda|guardou|leva|levou|ganha|ganhou|recebe|recebeu|surrupia|surrupiou|arranca|arrancou|toma|tomou|fica com|saca do bolso)\b|\b(acha|encontra|pega|embolsa|recolhe|leva|ganha|recebe)\s+(voc[eê])\b/;

/* Qualquer negação na frase e ela inteira é descartada. */
const RX_NEGA = /\b(n[aã]o|nada|nenhum|nenhuma|vazio|vazia|sem nada|nem uma|nem um|deixa|deixou|larga|largou|devolve|devolveu|recusa|recusou|perde|perdeu)\b/;

/* Moedas: o número vem antes da palavra, como se escreve em português. */
const RX_MOEDAS = /(\d{1,5})\s*(?:pe[cç]as?\s+de\s+)?(moedas?|pratas?|ouros?|de\s+ouro|de\s+prata)\b/g;

/* Teto por turno. Acima disto o sistema apara e diz que aparou. */
export const TETO_DE_MOEDAS = 2000;

/* Frases, e não o texto inteiro: a trava da negação só vale se o escopo
   dela for pequeno. Num texto inteiro, um "não" em qualquer canto
   apagaria um achado legítimo três parágrafos adiante. */
export function frasesDe(texto) {
  return String(texto || "")
    .split(/(?<=[.!?…])\s+|\n+/)
    .map((f) => f.trim())
    .filter((f) => f.length > 3);
}

/* Os consumíveis que a frase nomeia, pelo nome do catálogo. Só o
   catálogo: um "anel élfico" inventado pela narração não vira item,
   porque o sistema não sabe o que ele faz e um item sem regra na bolsa
   é uma promessa que ninguém vai cumprir. */
const familiaDe = (c) => norm(c.nome).replace(/ (pequena|media|grande)$/, "");

export function consumiveisNaFrase(frase) {
  const f = norm(frase);
  /* DUAS PASSADAS, e a ordem importa. Numa passada só, "Poção de Cura
     Média" creditava DUAS poções: a Média pelo nome cheio e a Pequena
     pelo palpite, porque a Pequena vem antes no catálogo e naquele
     momento nenhum nome cheio tinha casado ainda. O jogador ganhava um
     item a mais por escrever o nome certo. */
  const exatos = CONSUMIVEIS.filter((c) => f.includes(norm(c.nome)));
  const jaTem = new Set(exatos.map(familiaDe));
  const vagos = [];
  for (const c of CONSUMIVEIS) {
    const fam = familiaDe(c);
    if (fam === norm(c.nome)) continue;                 // este não tem tamanho no nome
    if (jaTem.has(fam) || !f.includes(fam)) continue;    // já entrou, ou nem foi citado
    /* "poção de cura" sem o tamanho: entra a MENOR, que é o palpite
       conservador — creditar a Grande por uma frase vaga seria o sistema
       sendo generoso com o que não sabe. */
    if (!/pequena$/.test(norm(c.nome))) continue;
    jaTem.add(fam);
    vagos.push(c);
  }
  return [...exatos, ...vagos];
}

/* ============================================================
   O QUE O HERÓI PAGOU (30/09, da prova jogada de MM13)

   A outra metade, que faltava desde a v9.70. O pão, a pedra de amolar
   e o quarto foram narrados como pagos — "você deixa três moedas no
   balcão" — e a bolsa ficou nas 183: o Narrador não declarou o gasto em
   `mudancas.moedas`, e o sistema, que lia a narração atrás do que o
   herói GANHOU, nunca a leu atrás do que ele DEU. A ficha só obedecia à
   ficção num sentido, e o sentido era o que enche a bolsa.

   Pior: a frase do gasto podia virar ganho. "Você recebe o pão e paga
   3 moedas" tinha verbo de aquisição com o herói de sujeito e um
   número de moedas — e a cobrança creditava as três. Agora o trecho do
   pagamento sai da frase antes de se contarem os ganhos.

   As travas são as do ganho, espelhadas: o herói é quem paga (sujeito
   antes do verbo, ou o verbo na primeira pessoa); o verbo é de dar
   dinheiro e está PERTO da quantia; negação, hipótese e troco matam a
   frase — o lado seguro aqui é não debitar.
   ============================================================ */

/* A quantia por extenso: o Narrador escreve "três moedas" tanto quanto
   "3 moedas", e preço de pão escreve-se quase sempre por extenso. */
export const NUMERO_POR_EXTENSO = {
  um: 1, uma: 1, dois: 2, duas: 2, tres: 3, quatro: 4, cinco: 5, seis: 6, sete: 7, oito: 8, nove: 9,
  dez: 10, onze: 11, doze: 12, treze: 13, quatorze: 14, catorze: 14, quinze: 15, dezesseis: 16,
  dezessete: 17, dezoito: 18, dezenove: 19, vinte: 20, trinta: 30, quarenta: 40, cinquenta: 50,
  sessenta: 60, setenta: 70, oitenta: 80, noventa: 90, cem: 100, cento: 100,
};
const EXTENSO = Object.keys(NUMERO_POR_EXTENSO).sort((a, b) => b.length - a.length).join("|");
/* "◉ 6" já diz a moeda; "6" e "seis" precisam dela escrita a seguir */
const QUANTIA_E_MOEDA = `(?:◉\\s*(\\d{1,5})|(\\d{1,5}|(?:${EXTENSO})(?:\\s+e\\s+(?:${EXTENSO}))?)(?:\\s+(?:pe[cç]as?|moedas?)\\s+de)?\\s*(?:moedas?|pratas?|ouros?|de\\s+ouro|de\\s+prata|cobres?|de\\s+cobre)\\b)`;
/* até três palavras entre o verbo e a quantia, e nenhuma delas abre outra
   oração: "joga os dados e ganha 5 moedas" não é pagar cinco */
const ENTRE = "(?:(?!(?:e|mas|ou|ganha|ganhou|recebe|recebeu|acha|achou|pega|pegou|embolsa|embolsou)\\s)[a-z]+\\s+)";

/* Os verbos de dar dinheiro, nas formas em que o HERÓI é quem dá. Fora de
   propósito: "conta" (contar as moedas do morto não é pagar), "separa",
   o infinitivo ("você vê o mercador pagar") e o subjuntivo ("se você
   pagar") — a trava da hipótese é a própria forma do verbo. */
export const VERBOS_DE_PAGAR = [
  "paga", "pagou", "pagas", "pago", "paguei", "desembolsa", "desembolsou", "desembolso", "desembolsei",
  "gasta", "gastou", "gastei", "entrega", "entregou", "entrego", "entreguei", "deixa", "deixou", "deixo", "deixei",
  "larga", "largou", "atira", "atirou", "joga", "jogou", "poe", "pos", "pus",
];
const PAGAR = VERBOS_DE_PAGAR.join("|");
const PRIMEIRA_PESSOA = /^(pago|paguei|desembolso|desembolsei|gastei|entrego|entreguei|deixo|deixei|pus)$/;

/* o verbo, até três palavras, a quantia e a moeda — "paga as 3 moedas",
   "deixa ◉ 6 no balcão" não (a moeda tem de vir), "entrega duas moedas de
   cobre" sim */
const RX_TRECHO_DE_PAGAR = new RegExp(`\\b(${PAGAR})\\s+${ENTRE}{0,3}?${QUANTIA_E_MOEDA}`, "g");
/* e o "custou-te", em que o herói paga sem ser sujeito */
const RX_TE_CUSTOU = new RegExp(`(?:\\b(?:te|lhe)\\s+cust(?:a|ou)|\\bcust(?:a|ou)-(?:te|lhe))\\s+${ENTRE}{0,2}?${QUANTIA_E_MOEDA}`, "g");

/* Negação, hipótese e troco: a frase inteira sai. O troco sai porque
   "paga dez e recebe quatro de volta" é uma conta que o leitor de prosa
   erraria para um lado ou para o outro, e o lado seguro é não mexer. A
   oferta e o pedido ainda não são pagamento; a moeda ao ar não sai da mão. */
const RX_NAO_PAGOU = /\b(nao|nunca|nem|nada|nenhum|nenhuma|recusa|recusou|devolve|devolveu|troco|de volta|se\s+(voce|eu)|caso|quando\s+(voce|eu)|oferece|ofereceu|propoe|pede|pediu|cara ou coroa|para o alto)\b/;

const valorDe = (txt) => {
  const s = String(txt || "").trim();
  if (/^\d+$/.test(s)) return parseInt(s, 10);
  return s.split(/\s+e\s+/).reduce((acc, w) => acc + (NUMERO_POR_EXTENSO[w] || 0), 0);
};

/* Quem paga é o herói? O sujeito antes do verbo, a três palavras no
   máximo, ou o verbo já na primeira pessoa. "O mercador paga você" e
   "você vê o homem que paga" ficam de fora. */
function heroiPaga(f, idx, verbo) {
  if (PRIMEIRA_PESSOA.test(verbo)) return true;
  const antes = f.slice(0, idx).trim().split(/\s+/).slice(-5).map((w) => w.replace(/[^a-z]/g, ""));
  return antes.some((w) => w === "voce" || w === "eu");
}

export function lerGastos(narrativa) {
  const out = { moedas: 0, frases: [] };
  for (const frase of frasesDe(narrativa)) {
    const f = norm(frase);
    if (RX_NAO_PAGOU.test(f)) continue;
    let contou = false;
    RX_TRECHO_DE_PAGAR.lastIndex = 0;
    let m;
    while ((m = RX_TRECHO_DE_PAGAR.exec(f))) {
      if (!heroiPaga(f, m.index, m[1])) continue;
      const n = valorDe(m[2] || m[3]);
      if (n > 0) { out.moedas += n; contou = true; }
    }
    RX_TE_CUSTOU.lastIndex = 0;
    while ((m = RX_TE_CUSTOU.exec(f))) {
      const n = valorDe(m[1] || m[2]);
      if (n > 0) { out.moedas += n; contou = true; }
    }
    if (contou) out.frases.push(frase.slice(0, 120));
  }
  return out;
}

/* O trecho do pagamento, apagado — para a frase do gasto não ser lida
   como ganho. Troca por espaços do mesmo tamanho e nada mais. */
const semOsPagamentos = (f) => f.replace(RX_TRECHO_DE_PAGAR, (s) => " ".repeat(s.length)).replace(RX_TE_CUSTOU, (s) => " ".repeat(s.length));

/* ============================================================
   O QUE A NARRAÇÃO PROMETEU
   ============================================================ */
export function lerGanhos(narrativa) {
  const out = { moedas: 0, consumiveis: [], frases: [], aparado: false };
  for (const frase of frasesDe(narrativa)) {
    if (!RX_GANHO.test(norm(frase))) continue;
    if (RX_NEGA.test(norm(frase))) continue;
    let contou = false;
    /* 30/09: sem o trecho em que o herói paga — ver `lerGastos` */
    const f = semOsPagamentos(norm(frase));
    RX_MOEDAS.lastIndex = 0;
    let m;
    while ((m = RX_MOEDAS.exec(f))) {
      const n = parseInt(m[1], 10);
      if (Number.isFinite(n) && n > 0) { out.moedas += n; contou = true; }
    }
    const cons = consumiveisNaFrase(frase);
    for (const c of cons) { out.consumiveis.push(c); contou = true; }
    if (contou) out.frases.push(frase.slice(0, 120));
  }
  if (out.moedas > TETO_DE_MOEDAS) { out.moedas = TETO_DE_MOEDAS; out.aparado = true; }
  return out;
}

/* ============================================================
   A DIFERENÇA

   O que a narração prometeu MENOS o que o Mestre declarou. É esta
   subtração que impede o crédito dobrado: quando ele preenche o campo
   direito — que é o caso comum — não sobra nada para cobrar, e o
   arquivo inteiro não faz nada, que é o comportamento certo.
   ============================================================ */
export function oQueFaltaCreditar(narrativa, mudancas) {
  const prometido = lerGanhos(narrativa);
  const m = mudancas && typeof mudancas === "object" ? mudancas : {};
  const declaradas = Math.max(0, Number(m.moedas) || 0);
  const itensDeclarados = (m.adicionar_itens || []).map((x) => norm(typeof x === "string" ? x : (x && x.nome) || ""));

  const moedas = Math.max(0, prometido.moedas - declaradas);
  const consumiveis = prometido.consumiveis.filter((c) => !itensDeclarados.some((n) => n.includes(norm(c.nome)) || norm(c.nome).includes(n)));

  return {
    moedas, consumiveis,
    aparado: prometido.aparado,
    frases: prometido.frases,
    temAlgo: moedas > 0 || consumiveis.length > 0,
  };
}

/* ============================================================
   O QUE FALTA DEBITAR (30/09)

   O espelho de `oQueFaltaCreditar`: o que a narração diz que o herói
   pagou MENOS o que o Mestre declarou como gasto (`moedas` negativo).
   Declarou certo, sobra zero, e nada acontece.

   DUAS PORTAS FECHADAS antes de ler:
     · o que o SISTEMA já cobrou neste turno — a compra no painel, o
       mapa, a venda — chega ao Narrador num envelope que diz "as moedas
       já saíram", e ele narra a troca: "você paga 12 moedas ao
       armeiro". Debitar essa frase seria cobrar duas vezes. Os
       envelopes que querem dizer isto estão na tabela abaixo, e quem
       chama passa o texto que foi ao Narrador;
     · o herói sem dinheiro. Narrar que ele pagou 20 com 6 na bolsa não
       é uma compra — é o Narrador a esquecer a bolsa. Nada é debitado,
       e o bilhete diz porquê: a compra não aconteceu.
   ============================================================ */
export const JA_PAGO_PELO_SISTEMA = [
  /\[COMPRA — JÁ REGISTRADA PELO SISTEMA\]/,
  /\[MAPA COMPRADO — JÁ APLICADO PELO SISTEMA\]/,
  /\[VENDA — JÁ REGISTRADA PELO SISTEMA\]/,
];

export function oQueFaltaDebitar(narrativa, mudancas, opcoes = {}) {
  const o = opcoes && typeof opcoes === "object" ? opcoes : {};
  const vazio = { moedas: 0, frases: [], temAlgo: false, semFundos: false, narrado: 0 };
  const envelopes = String(o.envelopes || "");
  if (JA_PAGO_PELO_SISTEMA.some((rx) => rx.test(envelopes))) return vazio;
  const narrado = lerGastos(narrativa);
  const m = mudancas && typeof mudancas === "object" ? mudancas : {};
  const declarado = Math.max(0, -(Number(m.moedas) || 0));
  const moedas = Math.max(0, narrado.moedas - declarado);
  if (!moedas) return { ...vazio, narrado: narrado.moedas };
  const bolsa = Number.isFinite(Number(o.bolsa)) && o.bolsa !== null ? Math.max(0, Number(o.bolsa)) : null;
  if (bolsa != null && moedas > bolsa) {
    return { moedas: 0, frases: narrado.frases, temAlgo: true, semFundos: true, narrado: narrado.moedas, faltou: moedas, bolsa };
  }
  return { moedas, frases: narrado.frases, temAlgo: true, semFundos: false, narrado: narrado.moedas };
}

/* A linha do jogador: o que saiu da bolsa, na mesma forma do débito
   declarado (`regras-jogo.js`). De onde veio a conta não é assunto dele. */
export function falaDoDebito(d) {
  if (!d || !d.temAlgo || d.semFundos || !(d.moedas > 0)) return "";
  return `◉ −${d.moedas} moedas`;
}

export function envelopeDoDebito(d) {
  if (!d || !d.temAlgo) return "";
  if (d.semFundos) {
    return `[COMPRA SEM FUNDOS — DECISÃO DO SISTEMA] Você narrou que eu paguei ${d.faltou} moedas, e eu só tenho ${d.bolsa}. Esse pagamento NÃO aconteceu, e o que ele comprava não é meu.
REGRA DESTE ENVELOPE (obrigatória): na próxima fala, não finja que eu paguei nem que tenho o que ele comprava; siga daqui — quem vendia espera o dinheiro, ou regateia, ou recusa. O que está na minha bolsa é o que eu posso gastar.`;
  }
  return `[DÉBITO — APLICADO PELO SISTEMA] Você narrou que eu paguei ${d.moedas} moedas e não registrou isso em "mudancas". O sistema leu a sua cena e JÁ TIROU da minha bolsa, para que o texto e a bolsa não se contradigam.
REGRA DESTE ENVELOPE (obrigatória): não cobre de novo e não repita o pagamento na próxima cena. Da próxima vez que eu pagar alguma coisa, DECLARE em "mudancas" com "moedas" negativo — o campo existe para isso.`;
}

/* ============================================================
   O DADO MANDA MAIS QUE A NARRAÇÃO (v9.70)

   Achado na própria prova desta versão, e é grave: o teste de
   furtividade FALHOU, o Mestre narrou o roubo dando certo assim mesmo,
   e o sistema creditou as cem moedas. A cobrança, criada para fazer a
   ficha obedecer à ficção, tinha acabado de fazer a ficção passar por
   cima do dado.

   É a inversão exata do projeto. O envelope do teste já proíbe o Mestre
   de entregar qualquer coisa na falha — "NÃO revela nada, NÃO entrega
   meia-informação, NÃO oferece pista de consolo" —, mas uma regra que
   depende de o outro lado obedecer não é uma regra, é um pedido.

   Então a cobrança pergunta antes de creditar: o último dado deste
   turno passou? Se falhou, nada entra na bolsa por narração — e o
   Mestre é lembrado, porque o erro dele não pode ficar barato.
   ============================================================ */
export function envelopeDaCobrancaNegada(d) {
  if (!d || !d.temAlgo) return "";
  const lista = [d.moedas > 0 ? `${d.moedas} moedas` : "", ...d.consumiveis.map((c) => c.nome)].filter(Boolean).join(" e ");
  return `[COBRANÇA RECUSADA — DECISÃO DO SISTEMA] Você narrou que eu ganhei ${lista}, mas o teste deste turno FALHOU. Nada disso entrou na minha ficha e nada disso aconteceu.
REGRA DESTE ENVELOPE (obrigatória): na próxima fala, NÃO corrija a cena com um desmentido nem finja que eu já tinha o item — apenas siga daqui, e daqui em diante o que estava em jogo continua fora do meu alcance. O dado decide o desfecho; a narração mostra COMO ele foi. Quando eu falho, o prêmio não existe em versão nenhuma da cena.`;
}

/* A linha do jogador. Ela é gameplay — o que entrou na bolsa é o
   resultado do turno dele — e por isso aparece; o fato de ter vindo da
   narração em vez do campo não é assunto dele. */
export function falaDaCobranca(d) {
  if (!d || !d.temAlgo) return "";
  const partes = [];
  if (d.moedas > 0) partes.push(`◉ ${d.moedas} moedas`);
  for (const c of d.consumiveis) partes.push(`${c.icone} ${c.nome}`);
  return `⚡ ${partes.join(" · ")} ${partes.length > 1 ? "foram" : "foi"} para a bolsa.`;
}

/* E o bilhete ao Mestre. Não é bronca: é o combinado sendo lembrado, e
   ele precisa saber que já está feito para não entregar de novo. */
export function envelopeDaCobranca(d) {
  if (!d || !d.temAlgo) return "";
  const lista = [d.moedas > 0 ? `${d.moedas} moedas` : "", ...d.consumiveis.map((c) => c.nome)].filter(Boolean).join(" e ");
  return `[COBRANÇA — APLICADA PELO SISTEMA] Você narrou que eu ganhei ${lista} e não registrou isso em "mudancas". O sistema leu a sua cena e JÁ CREDITOU na minha ficha, para que o texto e a bolsa não se contradigam.
REGRA DESTE ENVELOPE (obrigatória): não entregue de novo, não repita o achado na próxima cena e não invente que houve engano. Da próxima vez que der algo ao herói, DECLARE em "mudancas" — o campo existe para isso, e o que passa por ele é conferido pelo sistema (preço, peso, raridade) antes de entrar na bolsa.${d.aparado ? " E cuidado com a quantia: o valor narrado passava do teto de um turno e foi aparado." : ""}`;
}
