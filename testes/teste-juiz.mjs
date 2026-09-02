/* O JUIZ (v9.154) — quem paga o feito

   Quatro números ainda eram da IA, e o maior deles estava quebrado de um
   jeito que ninguém tinha medido: o XP tinha os DOIS lados de valor fixo
   (a IA mandava 10–60; o código dava 15–160 por bicho) pendurados numa
   curva EXPONENCIAL.

     nível  1 →  2 ....... 2 lutas
     nível  5 →  6 ...... 50 lutas
     nível 10 → 11 ..... 140 lutas
     nível 15 → 16 ..... 200 lutas

   A progressão morria por volta do sexto nível — num jogo de vinte
   níveis, com cento e cinquenta habilidades e a ascensão no quinze.

   O QUE ESTA SUÍTE PROTEGE não é o número: é a INVARIANTE. Todo XP aqui
   é uma fração do VÃO do nível, e por isso a mesma quantidade de aventura
   sobe um degrau em qualquer ponto da escada. No dia em que alguém puser
   um valor absoluto de volta, é aqui que trava. */

const S = "../src/";
const { readFileSync } = await import("node:fs");
const J = await import(S + "juiz.js");
const { XP_ACUMULADO } = await import(S + "regras.js");
const RJ = readFileSync("../src/regras-jogo.js", "utf8");
const CB = readFileSync("../src/combate.js", "utf8");
const BE = readFileSync("../src/bestiario.js", "utf8");
const PR = readFileSync("../src/prompt.js", "utf8");

let bons = 0, maus = 0;
const t = (n, c) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n); } };
const sec = (s) => console.log("\n" + s);

const LUTA = [{ ameaca: "elite" }, { ameaca: "comum" }, { ameaca: "comum" }];
const lutasPara = (n) => Math.ceil(J.vaoDoNivel(n) / J.xpDeCombate(LUTA, n));
const feitosPara = (grau, n) => Math.ceil(J.vaoDoNivel(n) / J.xpDoFeito(grau, n));

sec("1. A INVARIANTE — a mesma aventura sobe um degrau em qualquer nível");
{
  /* É a regra inteira. Antes: 2 lutas no nível 1 e 200 no nível 15. */
  const altos = [4, 6, 8, 10, 12, 15, 18].map(lutasPara);
  t(`do 4º ao 18º, o passo é o mesmo (${[...new Set(altos)].join(", ")} lutas)`, new Set(altos).size === 1);
  t("e cabe numa sessão de mesa", altos[0] >= 8 && altos[0] <= 16);
  const marcos = [4, 8, 12, 18].map((n) => feitosPara("marco", n));
  t(`marcos para subir: constante (${[...new Set(marcos)].join(", ")})`, Math.max(...marcos) - Math.min(...marcos) <= 1);
  /* o que estava quebrado, na forma de asserção: se alguém devolver um
     valor absoluto, o alto nível dispara na hora */
  t("nível 15 não custa 200 lutas", lutasPara(15) < 20);
  t("nem o 18", lutasPara(18) < 20);
}

sec("2. OS PRIMEIROS DEGRAUS VOAM — e é decisão, não descuido");
{
  /* Doze lutas para o nível 2 seria lento no pior lugar possível: quem
     acabou de criar um personagem precisa ver a ficha crescer cedo. */
  t("o 1º nível sai em poucas lutas", lutasPara(1) <= 4);
  t("o 2º um pouco mais", lutasPara(2) > lutasPara(1) && lutasPara(2) <= 6);
  t("o 3º mais ainda", lutasPara(3) > lutasPara(2));
  t("e do 4º em diante estabiliza", lutasPara(4) === lutasPara(10));
  t("a pressa é só dos três primeiros", J.pressaDoNivel(4) === 1 && J.pressaDoNivel(1) > 1);
}

sec("3. A IA DIZ O TAMANHO; A TABELA DIZ O NÚMERO");
{
  t("três graus, e só", Object.keys(J.GRAUS).sort().join(",") === "feito,marco,pequeno");
  t("um marco vale mais que um feito", J.xpDoFeito("marco", 8) > J.xpDoFeito("feito", 8));
  t("e um feito mais que uma miudez", J.xpDoFeito("feito", 8) > J.xpDoFeito("pequeno", 8));
  /* grau inventado não paga nada: o canal é fechado */
  t("grau desconhecido não paga", J.xpDoFeito("épico", 8) === 0);
  t("nem vazio", J.xpDoFeito("", 8) === 0 && J.xpDoFeito(null, 8) === 0);
  t("e o validador concorda", J.grauValido("marco") && !J.grauValido("épico"));
  /* cada grau se explica: a linha na tela ensina a diferença, senão o
     número vira ruído */
  t("todo grau tem uma frase", Object.values(J.GRAUS).every((g) => g.diz && g.diz.length > 10));
  t("e a fala usa a frase", /marco/.test(J.falaDoFeito("marco", 100)) || /história/.test(J.falaDoFeito("marco", 100)));
}

sec("4. O CANAL VELHO FECHOU");
{
  /* Aceitar `xp` E `feito` manteria as duas economias vivas — e duas
     economias para a mesma coisa é como a divergência nasce. */
  t("`m.xp` não é mais lido", !/Math\.max\(0, m\.xp \|\| 0\)/.test(RJ));
  t("quem manda é o grau", /grauValido\(m\.feito\)/.test(RJ));
  t("o companheiro herda do mesmo número", /xpComp = Math\.floor\(xpGanho \* 0\.6\)/.test(RJ));
  /* e o prompt tem de ensinar o canal novo, senão o jogo emudece */
  t("o prompt pede o grau", /"feito": "pequeno" \| "feito" \| "marco"/.test(PR));
  t("e proíbe o número", /NÃO envie "xp"/.test(PR));
  t("o exemplo de JSON foi junto", /"feito": "marco"/.test(PR));
  t("e não sobrou `xp` no exemplo", !/"xp": \d/.test(PR));
  /* combate não paga duas vezes: o espólio já é o pagamento da luta */
  t("o prompt separa combate de feito", /nada de "feito" em turno de combate/.test(PR));
}

sec("5. O ESPÓLIO ESCALA, E TEM TETO");
{
  t("o espólio recebe o nível", /export function gerarEspolios\(inimigosDerrotados, nivelHeroi = 1\)/.test(CB));
  t("e usa o Juiz", /xp = xpDeCombate\(lista, nivelHeroi\)/.test(CB));
  /* SEM TETO, chamar trinta ratos numa sala vira máquina de nível — é a
     mesma classe de brecha que já mordeu este jogo em outro lugar */
  const horda = Array.from({ length: 40 }, () => ({ ameaca: "fraco" }));
  t("quarenta ratos não sobem um nível", J.xpDeCombate(horda, 10) <= J.vaoDoNivel(10) * J.TETO_POR_LUTA);
  t("o teto é um quarto do vão", J.TETO_POR_LUTA === 1 / 4);
  /* e o peso segue a ameaça */
  t("lendário vale mais que fraco", J.PESO_AMEACA.lendario > J.PESO_AMEACA.fraco * 10);
  t("ameaça desconhecida cai no comum", J.xpDeCombate([{ ameaca: "coisa" }], 5) === J.xpDeCombate([{ ameaca: "comum" }], 5));
  t("lista vazia não paga", J.xpDeCombate([], 5) <= 1 && J.xpDeCombate(null, 5) <= 1);
}

sec("6. O PRESENTE TEM TETO — e só o presente");
{
  t("um presente absurdo é cortado", !!J.aferirPresente(5000, 3));
  t("e o corte diz o justo", J.aferirPresente(5000, 3).justo === J.tetoDoPresente(3));
  t("um presente plausível passa", J.aferirPresente(50, 3) === null);
  /* TIRAR moeda nunca precisou de teto: o preço já é aferido desde a
     v7.4.3, e travar a saída seria impedir o jogador de pagar */
  t("gasto não é aferido", J.aferirPresente(-900, 3) === null);
  t("nem zero", J.aferirPresente(0, 3) === null);
  t("o teto cresce com o nível", J.tetoDoPresente(10) > J.tetoDoPresente(1));
  t("o App só afere o que não veio de venda", /m\.moedas > 0 && !moedasAferidas/.test(RJ));
  t("e o Narrador é avisado", /notas\.push\(envelopeDoPresente\(af\)\)/.test(RJ));
}

sec("7. O PV DO INIMIGO É SUGESTÃO");
{
  const dentro = J.pvNaJanela(60, 50);
  t("dentro da janela, vale o pedido", dentro.pv === 60 && !dentro.aferido);
  const acima = J.pvNaJanela(400, 50);
  t("muito acima é cortado", acima.aferido && acima.pv === 75);
  const abaixo = J.pvNaJanela(2, 50);
  t("muito abaixo é levantado", abaixo.aferido && abaixo.pv === 25);
  t("sem pedido, vale a tabela", J.pvNaJanela(0, 50).pv === 50);
  /* A JANELA É GENEROSA DE PROPÓSITO: o chefe da ficção pode ser mais
     duro que o da tabela; o que ele não pode é ser outra criatura. */
  t("a janela é metade a uma vez e meia", J.JANELA_PV[0] === 0.5 && J.JANELA_PV[1] === 1.5);
  t("o bestiário usa a janela", /const janela = pvNaJanela\(e\.vidaMax \|\| e\.vida \|\| 0, esperado\)/.test(BE));
  t("e marca quando aferiu", /pvAferido: janela/.test(BE));
  t("o Narrador recebe o envelope", /notas\.push\(envelopeDoPV\(comp\.pvAferido, comp\.nome\)\)/.test(RJ));
}

sec("8. A HABILIDADE DO HERÓI É DELE — a contradição de 145 versões");
{
  /* O prompt dizia NUNCA desde sempre e o código aplicava assim mesmo.
     Proibição que o sistema não confere é adjetivo. */
  t("o herói não recebe mais", /const habsRecusadas = \(m\.adicionar_habilidades \|\| \[\]\)/.test(RJ));
  t("e o Narrador é avisado", /envelopeDaHabilidadeRecusada\(habsRecusadas\)/.test(RJ));
  t("a tela também diz", /habilidade de herói sai da árvore da classe/.test(RJ));
  /* COMPANHEIROS E INIMIGOS SEGUEM LIVRES: para eles a regra sempre foi
     outra, e cortar os três de uma vez seria consertar demais */
  t("o companheiro continua aprendendo", /\(ga\.adicionar_habilidades \|\| \[\]\)\.forEach/.test(RJ));
  const env = J.envelopeDaHabilidadeRecusada(["Bola de Fogo"]);
  t("o envelope recusa com jeito", /RECUSADA PELO SISTEMA/.test(env));
  t("manda seguir com o que ele tem", /siga a cena com o que ele JÁ tem/.test(env));
  t("oferece o caminho em vez do poder", /um mestre que ensina, um livro/.test(env));
  t("e libera companheiro e inimigo", /Companheiros e inimigos seguem livres/.test(env));
  t("sem nomes, sem envelope", J.envelopeDaHabilidadeRecusada([]) === "");
}

sec("9. O CANAL DE ENVELOPES EXISTE DE VERDADE");
{
  /* Sem ele, o Juiz recusa em silêncio e o Narrador segue narrando o que
     o sistema acabou de negar — as duas verdades na mesma tela. */
  t("aplicarMudancas tem canal de notas", /export function aplicarMudancas\(pers, m, msgs, notas = \[\]\)/.test(RJ));
  t("processarCombate também", /export function processarCombate\(combateAtual, m, msgs, notas = \[\]\)/.test(RJ));
  const APP = readFileSync("../src/App.jsx", "utf8");
  t("o App lê as notas das mudanças", /const notasDoJuiz = \[\]/.test(APP));
  t("e as do combate", /const notasDoCombate = \[\]/.test(APP));
  t("e manda as duas ao Narrador", (APP.match(/for \(const nt of notas/g) || []).length === 2);
}

console.log(`\njuiz v9.154: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
