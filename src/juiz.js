/* ============================================================
   O JUIZ (v9.154) — quem paga o feito — Taverna

   Último conselheiro da mesa, e o que faltava para a régua da casa valer
   inteira: "se é número, é tabela". Quatro números ainda eram da IA, e o
   maior deles estava quebrado de um jeito que ninguém tinha medido.

   ---------------- O QUE A MEDIÇÃO ACHOU ----------------

   O XP tem dois lados, e os DOIS eram de valor fixo:

     · a IA: o prompt mandava "10-30 pequeno; 40-60 marco"
     · o código: XP_AMEACA dava 15 a 160 por bicho derrubado

   E a curva de nível é a do 5e, que é EXPONENCIAL. Cruzando as duas
   coisas, medido:

     nível  1 →  2 ....... 2 lutas
     nível  5 →  6 ...... 50 lutas
     nível 10 → 11 ..... 140 lutas
     nível 15 → 16 ..... 200 lutas

   A progressão morria por volta do nível 6. O jogo tem vinte níveis,
   cento e cinquenta habilidades, subclasses, especializações e a
   ascensão no quinze — e um jogador de verdade nunca via nada disso.

   Isso não é "a IA escolhendo mal": é uma economia de valor fixo pendurada
   numa curva exponencial. Só aparece em campanha longa, que é por isso
   que cento e cinquenta versões de prova não pegaram.

   ---------------- A REGRA QUE CONSERTA ----------------

   Nada aqui é valor absoluto. Todo XP é uma FRAÇÃO DO VÃO do nível em
   que o herói está — então um marco é um marco no nível 2 e no nível 18,
   e a mesma quantidade de aventura sobe um nível em qualquer ponto da
   escada. É a única forma de a curva do 5e conviver com um jogo que não
   tem tabela de encontro por página.
   ============================================================ */

import { xpParaNivel } from "./regras.js";

/* Quanto falta, do começo deste nível ao começo do próximo. É o
   denominador de tudo neste arquivo. */
export function vaoDoNivel(nivel) {
  const n = Math.max(1, Math.min(19, Math.floor(Number(nivel) || 1)));
  return Math.max(1, xpParaNivel(n + 1) - xpParaNivel(n));
}

/* ---------------- OS PRIMEIROS DEGRAUS VOAM ----------------
   Com a fração pura, subir do 1 para o 2 custava as mesmas doze lutas
   que subir do 17 para o 18 — e doze lutas é lento no pior lugar
   possível, que é a abertura. Quem acabou de criar um personagem precisa
   sentir a ficha crescer cedo, senão nunca chega ao ponto em que ela
   cresce sozinha.

   É a mesma decisão do 5e, onde o primeiro e o segundo nível duram uma
   sessão cada de propósito: eles são o tutorial, e tutorial não se
   arrasta. Do quarto em diante, o passo é o mesmo para sempre. */
export const PRESSA = { 1: 4, 2: 2.5, 3: 1.6 };
export const pressaDoNivel = (n) => PRESSA[Math.max(1, Math.floor(Number(n) || 1))] || 1;

/* ============================================================
   1. O FEITO — o que a IA nomeia, e a tabela paga

   Mesmo desenho da fé, que funciona há dezenas de versões e ninguém
   questiona: a IA manda um SINAL curto dizendo o TAMANHO da coisa, e o
   sistema converte. Ela é ótima em julgar tamanho ("isto foi um marco")
   e péssima em julgar número ("isto vale 47 XP") — porque o número
   depende de uma curva que ela não vê.

   As frações saem de quantas vezes cada grau deveria caber num nível:
   sete marcos, vinte feitos, ou setenta miudezas. Um herói que só faz
   coisa pequena sobe devagar; quem muda a história sobe rápido. Que é o
   que uma mesa faz.
   ============================================================ */
export const GRAUS = {
  pequeno: { fracao: 1 / 70, diz: "uma miudez que ainda assim contou" },
  feito: { fracao: 1 / 20, diz: "um feito de verdade" },
  marco: { fracao: 1 / 7, diz: "um marco — a história mudou de lugar" },
};
export const grauValido = (g) => Object.prototype.hasOwnProperty.call(GRAUS, String(g || ""));

export function xpDoFeito(grau, nivel) {
  const g = GRAUS[String(grau || "")];
  if (!g) return 0;
  return Math.max(1, Math.round(vaoDoNivel(nivel) * g.fracao * pressaDoNivel(nivel)));
}

/* ============================================================
   2. O COMBATE — a outra metade, e a que sangrava mais

   `XP_AMEACA` dava 90 por um elite, viesse ele no nível 2 ou no 18. No
   2, isso era metade de um nível; no 18, era um centésimo.

   Aqui o valor de cada bicho é uma fração do vão, e a fração vem da
   AMEAÇA dele — quanto ele pesa numa luta. Uma luta equilibrada (algo
   como um elite com dois capangas) vale perto de um sétimo do nível: sete
   lutas dessas sobem um degrau, que é a conta de mesa de sempre.

   O TETO EXISTE por um motivo que já mordeu este jogo em outro lugar:
   sem ele, chamar trinta ratos numa sala vira uma máquina de nível. */
export const PESO_AMEACA = { fraco: 0.006, comum: 0.014, competente: 0.026, elite: 0.06, lendario: 0.11 };
export const TETO_POR_LUTA = 1 / 4;

export function xpDeCombate(inimigos, nivel) {
  const vao = vaoDoNivel(nivel);
  const soma = (Array.isArray(inimigos) ? inimigos : [])
    .reduce((s, e) => s + (PESO_AMEACA[String((e && e.ameaca) || "comum")] ?? PESO_AMEACA.comum), 0);
  return Math.max(1, Math.round(vao * Math.min(TETO_POR_LUTA, soma) * pressaDoNivel(nivel)));
}

/* ============================================================
   3. O PRESENTE — a moeda que não veio de venda nem de espólio

   A venda já é aferida (metade da tabela) e a compra fica presa na faixa
   justa desde a v7.4.3. O buraco era o presente: um `moedas: +500` sem
   nada vendido junto passava inteiro.

   O teto é o que uma missão daquele nível pagaria, vezes três. Três
   porque o jogo tem recompensa grande de verdade — a herança, o resgate
   pago pelo nobre — e cortá-las seria trocar um exagero por outro. O que
   ele barra é a ordem de grandeza errada, não a generosidade. */
export function tetoDoPresente(nivel) {
  const n = Math.max(1, Math.floor(Number(nivel) || 1));
  return Math.round((25 + n * 12) * 3);
}

export function aferirPresente(moedas, nivel) {
  const m = Math.round(Number(moedas) || 0);
  if (m <= 0) return null;                       /* tirar moeda nunca precisou de teto */
  const teto = tetoDoPresente(nivel);
  if (m <= teto) return null;
  return { pedido: m, justo: teto, diz: `◉ ${m} viraria dinheiro do nada neste patamar` };
}

/* ============================================================
   4. O PV DO INIMIGO — sugestão, e não decreto

   `completarInimigo` já preenche pela tabela quando a IA manda só nome e
   ameaça. Mas quando ela mandava `vidaMax`, valia o que ela mandou — e
   um número inventado ali decide se a luta dura duas rodadas ou doze.

   A janela é generosa de propósito: metade a uma vez e meia do esperado.
   O chefe da ficção pode ser mais duro que o da tabela; o que ele não
   pode é ser outra criatura. */
export const JANELA_PV = [0.5, 1.5];

export function pvNaJanela(pedido, esperado) {
  const p = Math.round(Number(pedido) || 0);
  const e = Math.max(1, Math.round(Number(esperado) || 1));
  if (!p) return { pv: e, aferido: false };
  const min = Math.max(1, Math.round(e * JANELA_PV[0]));
  const max = Math.max(min + 1, Math.round(e * JANELA_PV[1]));
  if (p >= min && p <= max) return { pv: p, aferido: false };
  return { pv: Math.min(max, Math.max(min, p)), aferido: true, pedido: p, faixa: [min, max] };
}

/* ============================================================
   OS ENVELOPES — o sistema conta o que decidiu

   Curtos de propósito: o Narrador não precisa entender a curva, precisa
   saber que o número não é dele e não deve ser repetido na ficção.
   ============================================================ */
export function falaDoFeito(grau, xp) {
  const g = GRAUS[String(grau || "")];
  return g ? `✧ +${xp} XP — ${g.diz}.` : "";
}

export function envelopeDoPresente(a) {
  if (!a) return "";
  return `[MOEDAS — AFERIDAS PELO SISTEMA] A ficção falou em ◉ ${a.pedido}, e o sistema pagou ◉ ${a.justo}: ${a.diz}.
REGRA DESTE ENVELOPE (obrigatória): narre a recompensa sem citar número — "uma bolsa pesada", "o suficiente para um mês" —, porque o valor é do sistema e já está na ficha. NÃO repita o número que você escreveu.`;
}

export function envelopeDoPV(a, nome) {
  if (!a || !a.aferido) return "";
  return `[FICHA DE ${String(nome || "INIMIGO").toUpperCase()} — AFERIDA PELO SISTEMA] Você deu ${a.pedido} PV; o sistema pôs ${a.pv} (a faixa desta criatura é ${a.faixa[0]}–${a.faixa[1]}).
REGRA DESTE ENVELOPE (obrigatória): a ficção pode fazer dele o que quiser — mais cruel, mais assustador, mais antigo. O que ela não decide é quanto ele aguenta. Não cite PV na narrativa.`;
}

/* A habilidade do HERÓI é escolhida por ele numa árvore fixa, e o prompt
   diz isso desde sempre — só que o código aplicava assim mesmo. Uma
   proibição que o sistema não confere é um adjetivo. */
export function envelopeDaHabilidadeRecusada(nomes) {
  const lista = (Array.isArray(nomes) ? nomes : []).filter(Boolean);
  if (!lista.length) return "";
  return `[HABILIDADE — RECUSADA PELO SISTEMA] Você tentou dar ao herói: ${lista.join(", ")}. Ele NÃO aprendeu — habilidade de herói sai da árvore da classe, escolhida por ele ao subir de nível.
REGRA DESTE ENVELOPE (obrigatória): siga a cena com o que ele JÁ tem. Se a ficção precisa daquele poder, mostre o caminho — um mestre que ensina, um livro, uma promessa — e deixe que ele escolha quando evoluir. Não comente esta correção na narrativa. (Companheiros e inimigos seguem livres: para eles você pode dar o que quiser.)`;
}
