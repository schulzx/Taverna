/* ============================================================
   A DIFICULDADE (v9.116) — quatro patamares, medidos em PODER

   "o que dirá se um desafio é fácil ou impossível é o nível de poder do
   player e do grupo."

   ---------------- O QUE MUDOU DA v9.115, E POR QUÊ ----------------

   A primeira versão media por DELTA DE NÍVEL, com três temperos somados
   ao nível — atributo, equipamento, grupo — cada um valendo ±2. Passava
   nos testes e tinha um defeito estrutural: nível é uma COORDENADA, não
   uma medida. Duas fichas de nível 12 podem ser a mesma coisa ou uma
   pode valer três da outra, e ±2 sobre um número que domina não tinha
   como dizer isso. Equipamento entrava como enfeite numa conta cujo
   resultado o nível já tinha decidido.

   Agora quem responde é `poder.js`, e a conta deixa de ser subtração e
   vira DIVISÃO — que é a operação certa quando os dois lados são
   medidas da mesma grandeza. "Quantas vezes o meu grupo é maior que
   isto" é uma pergunta com resposta; "quantos níveis acima" nunca foi,
   porque a distância entre 3 e 6 não é a mesma coisa que entre 13 e 16.

   O que NÃO mudou: os quatro patamares, o que cada um manda o Narrador
   fazer, e o fato de serem RELATIVOS. A mesma cripta continua sendo
   Fácil para quem passou dela e Impossível para quem chegou ontem —
   porque o jogador precisa de informação sobre a DECISÃO dele, não
   sobre o lugar.

   ---------------- OS CORTES SÃO OS MESMOS DE ANTES ----------------

   E isso é deliberado. Os limiares foram escolhidos para reproduzir, em
   razão de poder, exatamente onde a v9.115 cortava em níveis: três
   acima vira Fácil, um abaixo ainda é Médio, seis abaixo ainda é
   Difícil, sete abaixo é Impossível. Trocar a régua E os cortes ao mesmo
   tempo tornaria impossível saber qual dos dois mexeu no jogo.
   ============================================================ */

import { poderDe, poderDoGrupo, poderDoConteudo, formatarPoder } from "./poder.js";

/* ---------------- OS PATAMARES ----------------
   `de` é o piso da RAZÃO (poder do grupo ÷ poder do conteúdo). Lê-se de
   cima para baixo: o primeiro cujo piso a razão alcança.

   Os cortes não são simétricos, de propósito. Para CIMA, duas vezes e
   pouco já tira o medo. Para BAIXO a folga é MUITO maior, e o número
   parece generoso até se lembrar do que ele traduz: 0,12 é o que dá seis
   níveis abaixo, que é exatamente onde a v9.115 punha a fronteira de
   Difícil. Um grupo com um sexto do poder da coisa ainda tem plano; com
   um oitavo, não tem mais.

   `cor` é uma CHAVE do tema, não um valor: a paleta mora em
   constantes.js e um "#D86A5B" escrito aqui seria a segunda cópia dela. */
export const PATAMARES = [
  {
    id: "facil", de: 2.3, icone: "○", rotulo: "Fácil", cor: "ok",
    nota: "você passou desta faixa — vai custar tempo, não sangue",
    aoMestre: "o herói está ACIMA disto: a oposição não o assusta e ele sabe disso. Narre a competência, não o perigo — o risco aqui é o tédio e o descuido, nunca a morte",
  },
  {
    id: "medio", de: 0.70, icone: "◐", rotulo: "Médio", cor: "amberSoft",
    nota: "é do seu tamanho: dá para ganhar, e vai doer",
    aoMestre: "isto é do TAMANHO do herói: a oposição é páreo. Narre o custo real — recurso gasto, ferimento, escolha difícil — e deixe a vitória parecer conquistada, nunca dada",
  },
  {
    id: "dificil", de: 0.12, icone: "●", rotulo: "Difícil", cor: "amber",
    nota: "acima de você: sem plano, terreno ou ajuda, é onde se morre",
    aoMestre: "o herói está ABAIXO disto e a diferença aparece: a oposição é melhor, mais numerosa ou mais bem posicionada. Narre isso com honestidade — o golpe que ele não consegue aparar, o que ele não entende. Não amoleça a cena por pena, e não feche a porta: um plano esperto ainda vence",
  },
  {
    id: "impossivel", de: 0, icone: "☠", rotulo: "Impossível", cor: "danger",
    nota: "não é difícil, é impossível — nada do que você tem alcança isto",
    aoMestre: "isto está FORA DO ALCANCE do herói e o mundo sabe: quem entende do assunto tenta demovê-lo, e quem não entende tem medo dele. Não invente uma janela de sorte, não enfraqueça a ameaça e não permita vitória por narrativa — se ele insistir, a cena mostra a distância. A saída daqui é ficar mais forte ou trazer gente, nunca coragem",
  },
];

export function patamarDaRazao(razao) {
  const r = Number.isFinite(razao) ? razao : 0;
  return PATAMARES.find((p) => r >= p.de) || PATAMARES[PATAMARES.length - 1];
}

/* ---------------- A AVALIAÇÃO ----------------
   Devolve o patamar E os dois números que o produziram. Os dois, sempre:
   um rótulo sem a conta é um número mágico, e o jogador não saberia se
   falta nível, gente ou espada. */
export function avaliar({ nivel = 1, tamanho = 0, rotulo = "" } = {}, pers) {
  const grupo = poderDoGrupo(pers);
  const conteudo = poderDoConteudo({ nivel, tamanho });
  const razao = conteudo > 0 ? grupo.total / conteudo : 0;
  return {
    patamar: patamarDaRazao(razao), rotulo,
    razao: Math.round(razao * 100) / 100,
    poderDoGrupo: grupo.total,
    poderDoConteudo: conteudo,
    grupo,
    porque: porqueAssim(grupo, conteudo, razao),
  };
}

export function porqueAssim(grupo, conteudo, razao) {
  const seu = grupo.quantos
    ? `${formatarPoder(grupo.total)} de poder (você ${formatarPoder(grupo.heroi)} + ${grupo.quantos} no grupo${grupo.aparado ? ", aparado pelo teto" : ""})`
    : `${formatarPoder(grupo.total)} de poder`;
  /* PERTO DE UM NÃO SE DIZ EM VEZES. "1,1× menos do que isto pede" é a
     frase de um empate, escrita como se fosse uma diferença — e foi o que
     apareceu na tela na primeira vez que isto rodou. Entre 0,8 e 1,25 a
     conta não tem o que dizer além de "é do seu tamanho", que é
     exatamente o que o patamar Médio já significa. */
  const quanto = razao >= 0.8 && razao <= 1.25
    ? "praticamente do mesmo tamanho"
    : razao > 1.25
      ? `${razao.toFixed(razao >= 10 ? 0 : 1)}× o que isto pede`
      : `${(1 / Math.max(0.01, razao)).toFixed(razao >= 0.1 ? 1 : 0)}× menos do que isto pede`;
  return `${seu} contra ${formatarPoder(conteudo)} — ${quanto}`;
}

/* ---------------- OS DOIS CHAMADORES ----------------
   Sem o nível declarado, NÃO se opina: `null`, e a interface não mostra
   nada. Chutar 1 faria o diário inteiro dizer "Fácil", e um rótulo que
   nunca varia ensina o jogador a não olhar — é pior que rótulo nenhum. */
export function dificuldadeDaMissao(missao, pers) {
  if (!missao || !Number.isFinite(Number(missao.nivel)) || Number(missao.nivel) <= 0) return null;
  return avaliar({ nivel: Number(missao.nivel), tamanho: (missao.etapas || []).length, rotulo: missao.titulo || "" }, pers);
}

export function dificuldadeDaMasmorra(mm, pers) {
  if (!mm || !Number.isFinite(Number(mm.nivel)) || Number(mm.nivel) <= 0) return null;
  return avaliar({ nivel: Number(mm.nivel), tamanho: (mm.salas || []).length, rotulo: mm.nome || "" }, pers);
}

/* ---------------- O QUE VAI PARA A TELA ---------------- */
export function linhaDaDificuldade(d) {
  if (!d) return "";
  return `${d.patamar.icone} ${d.patamar.rotulo}`;
}

/* ---------------- SE ESTE COMPANHEIRO ENTRAR ----------------
   "pra ele saber … se o personagem é fraco ou forte pra entrar no grupo."

   Não basta mostrar o poder de quem se convida: o que decide é o quanto
   ele MUDA o grupo. Alguém com metade do meu poder ainda soma; alguém
   com um décimo é escolta, e o número diz isso sem que ninguém precise
   escrever a frase. */
export function pesarCompanheiro(candidato, pers) {
  const dele = poderDe(candidato).total;
  const antes = poderDoGrupo(pers);
  const depois = poderDoGrupo({ ...(pers || {}), grupo: [...((pers && pers.grupo) || []), candidato] });
  const ganho = depois.total - antes.total;
  const meu = Math.max(1, poderDe(pers).total);
  return {
    poder: dele, ganho,
    fracao: Math.round((dele / meu) * 100) / 100,
    /* o veredito em uma palavra, que é o que o jogador lê primeiro */
    veredito: dele >= meu * 0.8 ? "à sua altura" : dele >= meu * 0.4 ? "abaixo de você, mas soma" : "muito abaixo — vai precisar de proteção",
  };
}

/* ---------------- O QUE VAI PARA O NARRADOR ----------------
   Só o `aoMestre`, e nunca o número. O rótulo é do painel; a IA recebe a
   INSTRUÇÃO DE CENA que aquele patamar implica, que é a única coisa que
   ela pode fazer com esta informação. Mandar "razão 0,24" para um
   narrador é mandar rótulo de sistema para a boca de alguém, e esta casa
   já pagou por isso duas vezes na mesma partida.

   E NÃO HÁ BLOCO FIXO no prompt. A primeira versão tinha um parágrafo
   permanente explicando o sistema, e ele estourou o teto da pior cena
   real em 21 caracteres — o teste pegou antes do jogador. O conserto não
   foi encolher o parágrafo: foi ver que ele era redundante com o
   envelope, e que assim a regra custa caractere só nos turnos em que
   existe uma dificuldade para governar. */
export function envelopeDaDificuldade(d, oQue = "isto") {
  if (!d) return "";
  return `[DIFICULDADE — MEDIDA PELO SISTEMA] O sistema comparou a força real do herói e do grupo com o tamanho de ${oQue}, e o veredito governa o TOM desta cena: ${d.patamar.aoMestre}. Nunca diga esse veredito em voz alta e nunca cite número nenhum: ele aparece no que a oposição parece e no que a gente do lugar acha da ideia.`;
}
