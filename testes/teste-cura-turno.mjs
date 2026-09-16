/* teste-cura-turno.mjs (v9.275 · H3) — a cura tem relógio

   O ESPELHO DE `danoTurno`. O catálogo de condições cobra dano a cada turno
   desde sempre — veneno 2, sangue 3, fogo 4 — e do outro lado não havia nada:
   `tickEfeitos` só descontava prazo e dissipava. H3 põe o outro lado, e esta
   suíte cobra os DOIS SENTIDOS, que é o pedido da etapa: que o dano continue
   a doer, que a cura devolva, e que nenhum dos dois tenha virado o outro.

   A PERGUNTA QUE ESTA SUÍTE GUARDA NÃO É "QUANTO", É "QUANDO E ONDE".
   O quanto é uma régua de tabela e uma divisão. O que faz de uma etapa
   aditiva uma regressão silenciosa é a ORDEM — curar antes da fila do dano
   apagaria o golpe que devia matar — e a GUARDA: um relógio que cura quem
   caiu transforma a porta da queda em decoração e deixa a Ressurreição Menor
   sem razão de existir. As duas leis estão escritas no cabeçalho de
   `pousarCura` e são provadas aqui, cada uma com o seu contrafactual: não
   basta mostrar que a ordem de hoje dá certo, é preciso mostrar que a outra
   dava errado.

   NENHUM NÚMERO DE TABELA APARECE AQUI COMO LITERAL. `porPM`, `minimo`,
   `teto` e o prazo saem de `REGENERACAO_DO_BUFF` e `BUFF_DA_HABILIDADE`, e os
   três degraus que o cabeçalho de `efeitos.js` escreve em prosa são
   EXTRAÍDOS do próprio comentário e cobrados contra a tabela: mudar `porPM`
   e esquecer a prosa fica vermelho aqui. Os literais que sobram são PV a
   atravessar um turno, e esses são o que a suíte existe para fixar.

   DETERMINISMO: a única sorte desta suíte é a da arena, e ela entra por
   semente escrita (`simularQueda` corre dentro de `comSorteTravada`). Duas
   rodadas dão a mesma saída, em qualquer máquina. */

import { readFileSync } from "node:fs";
import {
  REGENERACAO_DO_BUFF, BUFF_DA_HABILIDADE, ABSORCAO_DO_BUFF, AMORTECIMENTO_DO_BUFF,
  regeneracaoDaHabilidade, efeitoDeBuff,
} from "../src/efeitos.js";
import { aplicacaoDoBuff, textoDaHabilidade } from "../src/combos.js";
import { tickEfeitos, pousarCura } from "../src/regras-jogo.js";
import { CONDICOES, listaCondicoes, criarCondicao, tickCondicoes, mecanicaDe } from "../src/condicoes.js";
import { CLASSES } from "../src/classes.js";
import { SUBCLASSES } from "../src/subclasses.js";
import { ESPECIALIZACOES } from "../src/especializacoes.js";
import { MAGIAS } from "../src/grimorio.js";
import { PRONTOS, montarPronto } from "../src/prontos.js";
import { simularQueda } from "../src/arena.js";

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

const T = REGENERACAO_DO_BUFF;

/* a régua da tabela, refeita aqui pela MESMA fórmula que `forcaDaRegeneracao`
   usa — ela é privada de propósito (efeitos.js) e a suíte não pode importá-la.
   O que garante que as duas não divergiram é a seção 2: esta régua é cobrada
   contra o que `efeitoDeBuff` de facto devolve, habilidade por habilidade. */
const regua = (pm, turnos = BUFF_DA_HABILIDADE.turnosPadrao) =>
  Math.min(T.teto, Math.max(T.minimo, Math.round((pm * T.porPM) / turnos)));

/* ---------------- O ACERVO, do mesmo jeito de `teste-amortece` ----------------
   Uma família não se prova com objetos inventados: quem tem de casar com a
   tabela são as habilidades que o jogador compra. */
const acervo = [];
const guardar = (h, fonte) => { if (h && h.nome) acervo.push({ hab: h, fonte }); };
for (const c of CLASSES) for (const h of c.habilidades) guardar(h, `classe:${c.nome}`);
for (const [s, hs] of Object.entries(SUBCLASSES)) for (const h of hs) guardar(h, `subclasse:${s}`);
for (const [e, hs] of Object.entries(ESPECIALIZACOES)) for (const h of hs) guardar(h, `especializacao:${e}`);
for (const m of MAGIAS) guardar(m, "grimorio");

const porNome = (n) => (acervo.find(({ hab }) => hab.nome === n) || {}).hab || null;
const CHUVA = porNome("Chamado da Chuva");     /* 3 PM — a Druida que rega devagar */
const CIRCULO = porNome("Círculo Sagrado");    /* 5 PM — a metade de H3 do Clérigo */
const RENOVACAO = porNome("Renovação");        /* 5 PM — "por 3 turnos seguidos" */
const BALADA = porNome("Balada do Herói");     /* o CONTROLE: cura de uma vez, prazo da vantagem */
const ESCUDO = porNome("Escudo Arcano");       /* a irmã `absorve` */
const POSTURA = porNome("Postura Defensiva");  /* a irmã `amortece` */

const HEROI_REGUA = { nome: "Régua", classe: "Druida", nivel: 5, efeitos: [] };
const efeitoDe = (hab, turnos) => efeitoDeBuff(hab, HEROI_REGUA, turnos).efeito;
const corpo = (extra = {}) => ({ nome: "Orin", vida: 9, vidaMax: 20, condicoes: [], efeitos: [], ...extra });

const EFEITOS_SRC = readFileSync(new URL("../src/efeitos.js", import.meta.url), "utf8");
const REGRAS_SRC = readFileSync(new URL("../src/regras-jogo.js", import.meta.url), "utf8");
const ARENA_SRC = readFileSync(new URL("../src/arena.js", import.meta.url), "utf8");

/* ============================================================
   1. A TABELA — a régua, e a prosa que a explica

   A prosa do cabeçalho é lida de volta e cobrada. Um comentário que
   descreve outra tabela é pior que comentário nenhum: ele ensina o
   número errado a quem vier pagar a próxima dívida.
   ============================================================ */
sec("1. a tabela e a prosa que a explica");
{
  t("a régua tem os quatro campos que a conta usa",
    [T.porPM, T.custoPadrao, T.minimo, T.teto].every((n) => Number.isFinite(n) && n > 0));
  t("o piso é 1 — cura que devolve zero é turno perdido com aparência de milagre", T.minimo === 1);

  /* O TETO É O `danoTurno` DE `queimando`, E A IGUALDADE É COBRADA, NÃO
     REPETIDA. O número está escrito uma vez só (na tabela); aqui ele é
     conferido contra o catálogo das condições. A lei: o relógio da cura
     nunca corre mais depressa que o relógio do dano — no teto, empata. */
  const piorDano = Math.max(...listaCondicoes().map((c) => Number(c.danoTurno) || 0));
  t(`o teto por turno (${T.teto}) é exatamente o pior \`danoTurno\` do catálogo (${piorDano})`, T.teto === piorDano);
  t("…e quem arde é quem o define — `queimando`", CONDICOES.queimando.danoTurno === piorDano);

  /* E NO PRAZO PADRÃO O TETO DO TOTAL É O DA IRMÃ `absorve`: nenhuma
     defensiva da casa compra mais que 12, e agora nenhuma cura também. */
  t(`o teto do total no prazo padrão (${T.teto * BUFF_DA_HABILIDADE.turnosPadrao}) bate com o teto de ABSORCAO_DO_BUFF (${ABSORCAO_DO_BUFF.teto})`,
    T.teto * BUFF_DA_HABILIDADE.turnosPadrao === ABSORCAO_DO_BUFF.teto);

  /* A PARIDADE COM AS DUAS IRMÃS, em PV por PM no TOTAL do prazo. `absorve`
     come `porPM` pontos de uma vez; `amortece` abafa `porPM`% de cada golpe
     sobre ~`turnosPadrao` golpes de mediana 13. Os três compram a mesma
     coisa pelo mesmo preço — é a lei que F1 escreveu, e esta é a terceira. */
  const MEDIANA_DO_GOLPE = 13; /* medido em F1, e é dado de arena, não régua desta tabela */
  const porPMdoAbafo = (AMORTECIMENTO_DO_BUFF.porPM / 100) * MEDIANA_DO_GOLPE * BUFF_DA_HABILIDADE.turnosPadrao;
  t(`os 2 PV por PM desta tabela ficam na faixa das irmãs (absorve ${ABSORCAO_DO_BUFF.porPM}/PM, amortece ~${porPMdoAbafo.toFixed(1)}/PM)`,
    T.porPM >= Math.min(ABSORCAO_DO_BUFF.porPM, porPMdoAbafo) * 0.8
    && T.porPM <= Math.max(ABSORCAO_DO_BUFF.porPM, porPMdoAbafo) * 1.2);

  /* ---- os três degraus, extraídos do próprio comentário ---- */
  const RX = /·\s+(.+?)\s+\((\d+) PM, (\d+) turnos\) → (\d+) por turno →\s+(\d+) no total/g;
  const degraus = [...EFEITOS_SRC.matchAll(RX)].map((m) => ({
    nome: m[1].trim(), pm: Number(m[2]), turnos: Number(m[3]), porTurno: Number(m[4]), total: Number(m[5]),
  }));
  t("o cabeçalho escreve os três degraus da tabela", degraus.length === 3, `achei ${degraus.length}`);
  for (const d of degraus) {
    t(`[prosa] ${d.nome}: ${d.pm} PM em ${d.turnos} turnos dá ${d.porTurno} por turno`,
      regua(d.pm, d.turnos) === d.porTurno, `a régua dá ${regua(d.pm, d.turnos)}`);
    t(`  …e ${d.porTurno} × ${d.turnos} é o total escrito (${d.total})`, d.porTurno * d.turnos === d.total);
    const hab = porNome(d.nome);
    t(`  …e "${d.nome}" custa mesmo ${d.pm} PM no acervo`, !!hab && Number(hab.custo) === d.pm,
      hab ? `custa ${hab.custo}` : "não está no acervo");
  }

  /* O TOTAL É A MOEDA, E O PRAZO SÓ O REPARTE — varrido, não alegado. Fora
     das bordas (onde piso e teto mordem, e é para isso que existem), o que o
     PM compra não muda com a duração. */
  let desviosGrandes = 0, varridos = 0;
  for (let pm = 1; pm <= 12; pm++) {
    for (let turnos = 1; turnos <= 8; turnos++) {
      const porTurno = regua(pm, turnos);
      const total = porTurno * turnos;
      const alvo = pm * T.porPM;
      varridos++;
      /* só conta desvio quando nem o piso nem o teto estão a morder */
      const livre = porTurno > T.minimo && porTurno < T.teto;
      if (livre && Math.abs(total - alvo) > turnos / 2) desviosGrandes++;
    }
  }
  t(`o total é o mesmo em qualquer prazo, fora das bordas (${varridos} combinações varridas)`, desviosGrandes === 0,
    `${desviosGrandes} com desvio maior que o arredondamento`);
}

/* ============================================================
   2. O NASCIMENTO — a chave só nasce quando existe
   ============================================================ */
sec("2. o nascimento da chave `curaTurno`");
{
  for (const hab of [CHUVA, CIRCULO, RENOVACAO]) {
    const e = efeitoDe(hab);
    t(`[${hab.nome}] nasce com \`curaTurno\` = ${regua(Number(hab.custo))}`, e.curaTurno === regua(Number(hab.custo)));
    t(`  …com o prazo da tabela do buff (${BUFF_DA_HABILIDADE.turnosPadrao})`, e.turnos === BUFF_DA_HABILIDADE.turnosPadrao);
    t("  …sem somar bônus de rolagem nenhum", e.bonus === 0);
    t(`  …e a frase diz o que ele comprou, na voz do mundo`,
      efeitoDeBuff(hab, HEROI_REGUA).extraEscopo.includes(String(e.curaTurno))
      && efeitoDeBuff(hab, HEROI_REGUA).extraEscopo.includes(T.conceito));
  }

  /* A CHAVE NÃO NASCE EM QUEM NÃO REGENERA — nem como `0`, nem como `false`.
     É a régua de `absorve` e `amortece`, e é o que deixa a etapa ser aditiva:
     quem não casa sai daqui exactamente como saía. */
  const intrusas = acervo.filter(({ hab }) => {
    const e = efeitoDeBuff(hab, HEROI_REGUA).efeito;
    return Object.prototype.hasOwnProperty.call(e, "curaTurno") && !regeneracaoDaHabilidade(hab);
  }).map(({ hab }) => hab.nome);
  t(`nenhuma habilidade fora da família leva a chave (${acervo.length} varridas)`, intrusas.length === 0, intrusas.join(", "));
  t("e a chave é ausente, nunca `0` nem `false`",
    !Object.prototype.hasOwnProperty.call(efeitoDe(ESCUDO), "curaTurno")
    && !Object.prototype.hasOwnProperty.call(efeitoDe(POSTURA), "curaTurno")
    && !Object.prototype.hasOwnProperty.call(efeitoDe(BALADA), "curaTurno"));

  /* AS DUAS IRMÃS CONTINUAM A COMPRAR O QUE COMPRAVAM — regressão zero. */
  t("`absorve` continua a nascer com o número dela", efeitoDe(ESCUDO).absorve > 0);
  t("`amortece` continua a nascer com o número dela", efeitoDe(POSTURA).amortece > 0);

  /* O PRAZO PEDIDO REPARTE O MESMO TOTAL, e é o que impede um prazo longo
     de pagar a mais: quem dura o dobro devolve metade por turno. */
  const curto = efeitoDe(RENOVACAO, 2), longo = efeitoDe(RENOVACAO, 6);
  t("prazo maior dá parcela menor (o total é que é a moeda)", longo.curaTurno < curto.curaTurno);
  t("…e o prazo pedido é o prazo do efeito", curto.turnos === 2 && longo.turnos === 6);
}

/* ============================================================
   3. O REGEX É ANCORADO — três casam, e o quase-igual não

   Um `/cura/` solto transformaria metade do acervo em regeneração. O
   controle vivo é a "Balada do Herói": ela fala de cura E de prazo, e o
   prazo é da vantagem, não da cura.
   ============================================================ */
sec("3. o regex ancorado, medido no acervo inteiro");
{
  const casam = acervo.filter(({ hab }) => regeneracaoDaHabilidade(hab)).map(({ hab }) => hab.nome);
  console.log(`  ··  ${casam.length} de ${acervo.length} entradas do acervo casam: ${casam.join(", ")}`);
  t("casam exactamente as três da etapa", casam.length === 3
    && ["Chamado da Chuva", "Círculo Sagrado", "Renovação"].every((n) => casam.includes(n)), casam.join(", "));
  t("a Balada do Herói NÃO casa — lá o prazo é da vantagem e a cura é de uma vez",
    !regeneracaoDaHabilidade(BALADA) && /cura/i.test(BALADA.descricao) && /3 turnos/.test(BALADA.descricao));
  t("nem lixo nenhum casa", !regeneracaoDaHabilidade(null) && !regeneracaoDaHabilidade({}) && !regeneracaoDaHabilidade(""));
  t("e o leitor devolve a própria tabela, não uma cópia", regeneracaoDaHabilidade(CHUVA) === T);

  /* O CRUZAMENTO COM AS FAMÍLIAS QUE JÁ COMPRAM — o dente da ORDEM.
     `efeitoDeBuff` pergunta à cura ANTES da proteção; isso só é seguro
     enquanto nenhuma habilidade casar com as duas coisas que têm número.
     No dia em que uma casar, esta linha fica vermelha ANTES de um abrigo
     virar curativo em silêncio. */
  const COM_NUMERO = ["absorve", "amortece"];
  const cruzadas = acervo.filter(({ hab }) => {
    const l = aplicacaoDoBuff(hab);
    return !!l && COM_NUMERO.includes(l.id) && !!regeneracaoDaHabilidade(hab);
  }).map(({ hab }) => hab.nome);
  t("nenhuma regeneração é também `absorve` ou `amortece`", cruzadas.length === 0, cruzadas.join(", "));

  /* E O CRUZAMENTO QUE EXISTE ESTÁ DECLARADO: o Círculo Sagrado diz "área
     PROTEGIDA onde aliados curam por turno" e casa com `protege` — a família
     de força zero que P2 mediu. A cura ganha, e é por isso que a ordem é a
     que é: perguntar primeiro à que não paga devolveria um efeito vazio. */
  const familiaDoCirculo = aplicacaoDoBuff(CIRCULO);
  t("o Círculo Sagrado casa com `protege`, a família sem número", !!familiaDoCirculo && familiaDoCirculo.id === "protege");
  t("…e sai de `efeitoDeBuff` com a cura, não com o rótulo vazio",
    efeitoDe(CIRCULO).curaTurno > 0 && efeitoDe(CIRCULO).aplica === T.aplica);

  /* os dois classificadores leem a habilidade com a MESMA régua de texto */
  t("a cura e a proteção perguntam ao mesmo texto normalizado",
    /textoDaHabilidade/.test(EFEITOS_SRC) && textoDaHabilidade(CHUVA).includes("continua"));
}

/* ============================================================
   4. O RELÓGIO — `tickEfeitos` devolve o número, e não pousa nada
   ============================================================ */
sec("4. o relógio cobra a cura como o irmão cobra o dano");
{
  const p = corpo({ efeitos: [efeitoDe(RENOVACAO)] });
  const tk = tickEfeitos(p);
  t("devolve `cura` e `fontes`, no molde de `tickCondicoes`",
    tk.cura === efeitoDe(RENOVACAO).curaTurno && tk.fontes.length === 1 && tk.fontes[0] === "Renovação");
  t("…e continua a devolver `efeitos` e `msgs` como sempre", Array.isArray(tk.efeitos) && Array.isArray(tk.msgs));
  t("o relógio NÃO pousa PV — quem pousa é `pousarCura`", p.vida === 9 && tk.vida === undefined);
  t("e não mexe na ficha que recebeu (imutabilidade)", p.efeitos[0].turnos === BUFF_DA_HABILIDADE.turnosPadrao);

  /* SEM REGENERAÇÃO, ZERO — e a forma da resposta é a mesma. É o que deixa
     o leitor escrever `tk.cura` sem `|| 0`, como já faz com `t.dano`. */
  const vazio = tickEfeitos(corpo({ efeitos: [efeitoDe(ESCUDO)] }));
  t("quem não regenera devolve cura 0 e fontes vazias", vazio.cura === 0 && vazio.fontes.length === 0);
  t("lixo não derruba o relógio",
    tickEfeitos(null).cura === 0 && tickEfeitos({}).cura === 0 && tickEfeitos({ efeitos: null }).cura === 0);

  /* DUAS FONTES SOMAM, como dois venenos somam no irmão. */
  const duas = tickEfeitos(corpo({ efeitos: [efeitoDe(CHUVA), efeitoDe(CIRCULO)] }));
  t("duas regenerações somam no mesmo turno", duas.cura === efeitoDe(CHUVA).curaTurno + efeitoDe(CIRCULO).curaTurno);
  t("…e as duas se nomeiam", duas.fontes.length === 2);

  /* A ORDEM DENTRO DO RELÓGIO: a cura é cobrada ANTES do decremento, e o
     ÚLTIMO turno de prazo ainda cura — a ordem do irmão, onde o último
     turno de veneno ainda dói. O CONTRAFACTUAL: se fosse depois, um efeito
     de 1 turno morreria sem devolver nada, e a ficha teria prometido 3
     parcelas e pago 2. */
  const ultimo = tickEfeitos(corpo({ efeitos: [{ ...efeitoDe(RENOVACAO), turnos: 1 }] }));
  t("o último turno de prazo ainda cura", ultimo.cura > 0 && ultimo.efeitos.length === 0);
  const venenoUltimo = tickCondicoes([{ ...criarCondicao("envenenado"), turnos: 1 }]);
  t("…exactamente como o último turno de veneno ainda dói", venenoUltimo.dano === CONDICOES.envenenado.danoTurno);

  /* O PRAZO INTEIRO PAGA O QUE A TABELA PROMETE: três parcelas, nem duas
     nem quatro — o buff não é eterno e não morre cedo. */
  let vivo = corpo({ efeitos: [efeitoDe(RENOVACAO)] }), parcelas = 0, somaTotal = 0, n = 0;
  while (vivo.efeitos.length && n < 50) {
    const r = tickEfeitos(vivo);
    if (r.cura > 0) { parcelas++; somaTotal += r.cura; }
    vivo = { ...vivo, efeitos: r.efeitos }; n++;
  }
  t(`o prazo paga ${BUFF_DA_HABILIDADE.turnosPadrao} parcelas e cala-se`, parcelas === BUFF_DA_HABILIDADE.turnosPadrao, `pagou ${parcelas}`);
  t(`…e o total é o que o PM comprou (${somaTotal} para ${Number(RENOVACAO.custo)} PM)`,
    somaTotal === regua(Number(RENOVACAO.custo)) * BUFF_DA_HABILIDADE.turnosPadrao);
}

/* ============================================================
   5. O POUSO — o teto, a guarda dos mortos, a imutabilidade
   ============================================================ */
sec("5. `pousarCura` — onde a cura vira PV");
{
  const p = corpo();
  const r = pousarCura(p, 3);
  t("soma no PV e devolve ficha nova", r.pers.vida === 12 && r.curou === 3 && p.vida === 9);
  t("…e a linha é voz de mundo, com os dois números", /\+3/.test(r.linha) && /12\/20/.test(r.linha));
  t("o nome do mecanismo não aparece na linha",
    !/efeito|curaTurno|tick|rel[óo]gio|buff/i.test(r.linha));

  /* O TETO É `vidaMax`, LIDO DA FICHA — nunca um literal. */
  const quase = pousarCura(corpo({ vida: 19 }), 8);
  t("o teto é `vidaMax` e a sobra não existe", quase.pers.vida === 20 && quase.curou === 1);
  t("quem está inteiro não é curado", pousarCura(corpo({ vida: 20 }), 5).curou === 0);

  /* A GUARDA DOS MORTOS, e o CONTRAFACTUAL: sem ela, um efeito de 2 PM
     levantaria sozinho, todo turno, quem a porta da queda derrubou. */
  const caido = pousarCura(corpo({ vida: 0 }), 5);
  t("o relógio NÃO levanta quem caiu", caido.curou === 0 && caido.pers.vida === 0);
  t("…e nem devolve linha nenhuma sobre isso", caido.linha === "");
  t("negativo também fica onde está", pousarCura(corpo({ vida: -3 }), 5).pers.vida === -3);

  /* LIXO NÃO CUSTA O TURNO — `= {}` não cobre `null`, lei da casa. */
  t("null, cura torta e ficha sem corpo não estouram",
    pousarCura(null, 3).curou === 0 && pousarCura(corpo(), NaN).curou === 0
    && pousarCura(corpo(), "três").curou === 0 && pousarCura({ efeitos: [] }, 3).curou === 0);
  t("cura negativa não tira PV", pousarCura(corpo(), -5).pers.vida === 9);
  t("sem `vidaMax` o teto é a própria vida — não se inventa número", pousarCura({ vida: 7 }, 5).curou === 0);

  /* A CURA NÃO LIMPA CONDIÇÃO — a lei de T2, agora na porta nova. */
  const comVeneno = pousarCura(corpo({ condicoes: [criarCondicao("envenenado")] }), 3);
  t("a cura do relógio devolve PV e só — a condição fica", comVeneno.pers.condicoes.length === 1
    && comVeneno.pers.condicoes[0].id === "envenenado");
}

/* ============================================================
   6. OS DOIS SENTIDOS — e um não virou o outro

   O pedido literal da etapa. O mesmo corpo, com veneno e com
   regeneração, atravessando os mesmos turnos.
   ============================================================ */
sec("6. o dano dói, a cura devolve, e nenhum virou o outro");
{
  /* o dano continua exactamente onde estava */
  const comVeneno = tickCondicoes([criarCondicao("envenenado")]);
  t("o veneno continua a cobrar `danoTurno`", comVeneno.dano === CONDICOES.envenenado.danoTurno);
  t("…e o relógio das condições não ganhou cura nenhuma", comVeneno.cura === undefined);
  t("`mecanicaDe` continua a somar só o dano do turno — o espelho não mora na condição",
    mecanicaDe([criarCondicao("envenenado")]).danoTurno === CONDICOES.envenenado.danoTurno
    && mecanicaDe([criarCondicao("envenenado")]).curaTurno === undefined);

  /* e a cura não sabe fazer o avesso: nenhum `curaTurno` negativo entra */
  const negativo = tickEfeitos({ efeitos: [{ nome: "Praga", turnos: 3, curaTurno: -4 }] });
  t("um `curaTurno` negativo não vira dano por turno pela porta dos fundos", negativo.cura === 0);

  /* UM TURNO INTEIRO, COM OS DOIS: 20 de teto, 9 de vida, veneno de 2 e
     regeneração de 3. O golpe do turno já correu a fila inteira do dano
     antes de qualquer destes dois relógios — é o exemplo escrito no
     cabeçalho de `pousarCura`. */
  let pers = corpo({ vida: 9, condicoes: [criarCondicao("envenenado")], efeitos: [efeitoDe(RENOVACAO)] });
  const golpe = 6;
  pers = { ...pers, vida: Math.max(0, pers.vida - golpe) };            /* a fila do dano, no meio do turno */
  t("o golpe morde a vida que existia antes do relógio", pers.vida === 3);
  const tc = tickCondicoes(pers.condicoes);
  pers = { ...pers, vida: Math.max(0, pers.vida - tc.dano), condicoes: tc.condicoes };
  t("o veneno cobra depois do golpe", pers.vida === 1);
  const te = tickEfeitos(pers);
  const pc = pousarCura(pers, te.cura);
  pers = { ...pc.pers, efeitos: te.efeitos };
  t("e a cura do relógio fecha o turno por cima do que sobrou", pers.vida === 4);
  t("…o que é diferente de ter curado antes do golpe (12 − 6 − 2 = 4 é coincidência de números, e a ordem não é)",
    pers.vida === 4 && (9 + te.cura - golpe - tc.dano) === 4);

  /* O CONTRAFACTUAL QUE IMPORTA, e é o que a ordem compra: com 3 de vida e
     um golpe de 4, curar ANTES apagaria a queda. */
  const aBeira = corpo({ vida: 3, efeitos: [efeitoDe(RENOVACAO)] });
  const golpeFatal = 4;
  const depoisDoGolpe = { ...aBeira, vida: Math.max(0, aBeira.vida - golpeFatal) };
  const tkFatal = tickEfeitos(depoisDoGolpe);
  t("quem caiu no golpe não é reerguido pelo relógio do mesmo turno",
    depoisDoGolpe.vida === 0 && tkFatal.cura > 0 && pousarCura(depoisDoGolpe, tkFatal.cura).pers.vida === 0);
  t("…e se a cura tivesse corrido antes, o mesmo golpe não teria derrubado",
    pousarCura(aBeira, tkFatal.cura).pers.vida - golpeFatal > 0);
}

/* ============================================================
   7. A ARENA PAGA DE VERDADE — a etapa não entrega motor inerte
   ============================================================ */
sec("7. a cura pousa em PV num sítio vivo (a arena)");
{
  const SEMENTES = ["h3|a", "h3|b", "h3|c", "h3|d", "h3|e", "h3|f"];
  const base = montarPronto("remendo");
  const comChuva = { ...base, nome: "O Regenerado", habilidades: [CHUVA, ...(base.habilidades || [])] };
  const sem = { ...base, nome: "O Regenerado" };
  const rival = montarPronto("sombra");

  const conta = (ficha) => {
    let firmadas = 0, pousos = 0, pv = 0;
    for (const s of SEMENTES) {
      for (const l of simularQueda(ficha, rival, { semente: s }).linhas) {
        if (/firma Chamado da Chuva/.test(l)) firmadas++;
        const m = l.match(/a carne fecha sozinha \(\+(\d+)\)/);
        if (m) { pousos++; pv += Number(m[1]); }
      }
    }
    return { firmadas, pousos, pv };
  };
  const com = conta(comChuva), sms = conta(sem);
  console.log(`  ··  com a habilidade: ${com.firmadas} firmadas, ${com.pousos} pousos, ${com.pv} PV devolvidos em ${SEMENTES.length} quedas`);
  console.log(`  ··  sem a habilidade: ${sms.firmadas} firmadas, ${sms.pousos} pousos, ${sms.pv} PV devolvidos`);

  t("a habilidade deixa prazo na arena", com.firmadas > 0);
  t("…e o prazo vira PV de verdade", com.pousos > 0 && com.pv > 0);
  t("quem não a carrega não recebe nada — a cura não caiu do céu", sms.firmadas === 0 && sms.pousos === 0 && sms.pv === 0);
  t("cada pouso devolve no máximo o que a tabela vendeu",
    com.pv <= com.pousos * regua(Number(CHUVA.custo)), `${com.pv} PV em ${com.pousos} pousos`);

  /* DETERMINISMO: a mesma semente, o mesmo duelo. */
  const a1 = simularQueda(comChuva, rival, { semente: "h3|a" });
  const a2 = simularQueda(comChuva, rival, { semente: "h3|a" });
  t("mesma semente, mesmas linhas", a1.linhas.join("|") === a2.linhas.join("|") && a1.vidaA === a2.vidaA);

  /* A CATRACA DO EQUILÍBRIO NÃO PODE MEXER-SE ÀS ESCONDIDAS: nenhum dos
     oito prontos carrega uma das três, e é medição, não promessa. A única
     disponível no nível deles é o Chamado da Chuva, de Druida, e não há
     Druida entre os oito. Se o roster mudar, esta linha avisa ANTES de a
     catraca acusar um desequilíbrio que ninguém saberia de onde veio. */
  const carregam = PRONTOS.map((p) => montarPronto(p.id))
    .filter((f) => (f.habilidades || []).some((h) => regeneracaoDaHabilidade(h)))
    .map((f) => f.nome);
  t("nenhum dos oito prontos regenera — a catraca do equilíbrio não se mexe com H3", carregam.length === 0, carregam.join(", "));
}

/* ============================================================
   8. A FIAÇÃO, LIDA NO CÓDIGO — um relógio só, uma porta só
   ============================================================ */
sec("8. a fiação: um relógio, uma porta, nenhum motor novo");
{
  t("a arena importa o pouso e o classificador dos módulos puros",
    /import \{ tickEfeitos, pousarCura, atributoEfetivo \} from "\.\/regras-jogo\.js"/.test(ARENA_SRC)
    && /regeneracaoDaHabilidade[^}]*\} from "\.\/efeitos\.js"/.test(ARENA_SRC));
  t("e escreve a vida de volta na cópia — sem esta linha o módulo curaria no vazio",
    /quem\.vida = pc\.pers\.vida;/.test(ARENA_SRC));

  /* A POSIÇÃO: o pouso corre DEPOIS das duas meias-rodadas, dentro do
     mesmo bloco onde o prazo já corria. É a ordem que o cabeçalho de
     `pousarCura` declara, e ler o arquivo é a única forma de a provar sem
     o App. */
  const iMeias = ARENA_SRC.indexOf("linhas.push(...meiaRodada(quem, outro, rodada))");
  const iTick = ARENA_SRC.indexOf("const tk = tickEfeitos(quem)");
  const iPouso = ARENA_SRC.indexOf("const pc = pousarCura(quem, tk.cura)");
  t("o pouso vem depois das meias-rodadas e depois do relógio", iMeias > 0 && iTick > iMeias && iPouso > iTick);
  t("…e dentro da guarda que só corre com os dois de pé",
    ARENA_SRC.slice(ARENA_SRC.indexOf("if (A.vida > 0 && B.vida > 0) {"), iPouso).length > 0
    && ARENA_SRC.indexOf("if (A.vida > 0 && B.vida > 0) {") < iPouso);

  /* UMA PORTA SÓ PARA FIRMAR: o buff e a regeneração entram pelo mesmo
     `firmarNaArena`, senão uma delas acabaria sem o teto da concentração. */
  t("a arena firma por uma porta só", (ARENA_SRC.match(/firmarNaArena\(/g) || []).length === 3);
  t("e `efeitoDeBuff` é chamado uma vez só na arena", (ARENA_SRC.match(/efeitoDeBuff\(/g) || []).length === 1);

  /* NENHUM SEGUNDO MOTOR: `curaTurno` nasce em efeitos.js e é lido pelo
     relógio, e mais ninguém em `src/` o toca. Um segundo leitor seria a
     mesma regra em duas cabeças — que é como `gastarRecurso` morreu. */
  /* O ARQUIVO É LIDO SEM COMENTÁRIOS, pelo motivo que `teste-arena` já
     escreveu: os comentários desta casa CITAM de propósito o nome do campo
     para dizer onde ele mora (`condicoes.js` tem o ponteiro que manda o
     leitor a esta régua, e `arena.js` explica por que escreve a vida de
     volta). Um teste de ausência sobre o arquivo cru acusaria a
     EXPLICAÇÃO em vez de um segundo motor, e ensinaria quem viesse depois
     a apagar o comentário para calar a prova. */
  const soCodigo = (s) => s.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^[ \t]*\/\/.*$/gm, " ");
  /* `poder-de-classe.js` fica FORA da lista, e não por conveniência: o
     campo aparece lá dentro de STRINGS — os `motivo` de `AGUARDAM`, que
     registam por escrito qual metade da dívida H3 pagou. É registo de
     dívida, não motor, e strings não se apagam com o filtro de
     comentários. Se um dia aquele arquivo passar a LER `curaTurno`, é a
     suíte dele que tem de o provar. */
  const arqs = ["combate.js", "companheiros.js", "arena.js", "condicoes.js", "habilidades.js", "tracos.js"];
  const outros = arqs.filter((f) => /curaTurno/.test(soCodigo(readFileSync(new URL("../src/" + f, import.meta.url), "utf8"))));
  t("só `efeitos.js` (nascimento) e `regras-jogo.js` (relógio) tocam em `curaTurno`", outros.length === 0, outros.join(", "));
  t("o relógio lê a chave do efeito, não a tabela", /e\.curaTurno/.test(REGRAS_SRC) && !/REGENERACAO_DO_BUFF/.test(REGRAS_SRC));
  t("e a conta da régua mora num sítio só (privada em efeitos.js)",
    /function forcaDaRegeneracao/.test(EFEITOS_SRC) && !/export function forcaDaRegeneracao/.test(EFEITOS_SRC));

  /* O QUE FICA DECLARADO PARA A PRÓXIMA ETAPA — medição, não asserção: o
     App tem o relógio dos efeitos em três sítios e ainda não pousa cura
     nenhuma, porque o bastão dele esteve com a outra mente o ciclo
     inteiro. É uma linha de fiação em cada um, e está escrita no diário. */
  const APP = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
  console.log(`  ··  App.jsx: ${(APP.match(/tickEfeitos\(/g) || []).length} chamadas ao relógio dos efeitos, ${(APP.match(/pousarCura\(/g) || []).length} pousos de cura (a fiação do App é etapa própria)`);
}

console.log(`\n${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
