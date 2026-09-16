/* check-protecao.mjs (v9.231) — a ficha promete abrigo, o sistema entrega golpe?

   A DOENÇA. Até a v9.230 `BUFF_DA_HABILIDADE.aplica` era "dano" para
   TUDO. "Escudo Arcano — barreira que absorve o próximo dano" virava,
   na linha que o jogador lê, "+1 de dano mágico": a ficha prometia uma
   coisa e o sistema entregava a oposta. P1 pôs uma TABELA no meio
   (`APLICACAO_DO_BUFF`, combos.js) que classifica pelo TEXTO.

   POR QUE UM VARREDOR E NÃO SÓ UMA SUÍTE. A mentira sobreviveu a toda a
   suíte porque nenhuma prova a media: `teste-efeitos` conferia o rótulo
   do buff com habilidades OFENSIVAS ("X", "Golpe Poderoso", "Rajada de
   Fogo", "Fúria"), e a sonda da arena usava uma defensiva INVENTADA
   ("Postura de Ferro") que não promete proteção nenhuma. Um exemplo bom
   não prova acervo: o que faltava era medir o jogo INTEIRO, e é isso
   que este arquivo faz — as 12 classes, as subclasses, as
   especializações e o grimório, num passe só.

   O DENTE ANDA NOS DOIS SENTIDOS, e o segundo é o que impede o
   exagero. Um regex generoso demais calaria metade do acervo: bastaria
   "escudo" pegar "Tiro Perfurante" ("atravessa armadura e escudo") para
   um ataque nascer mudo, sem número e sem frase. Por isso aqui se prova
   também que NENHUMA habilidade de `tipo: "ataque"` virou proteção, e
   que tudo o que não promete abrigo continua saindo com o MESMO número
   e a MESMA frase de antes.

   Nada aqui sorteia: o acervo é o catálogo em código e `efeitoDeBuff`
   é pura. Duas rodadas dão a mesma saída, em qualquer máquina. */

import { CLASSES, fichaDaHabilidade } from "../src/classes.js";
import { SUBCLASSES } from "../src/subclasses.js";
import { ESPECIALIZACOES } from "../src/especializacoes.js";
import { MAGIAS } from "../src/grimorio.js";
import { APLICACAO_DO_BUFF, APLICA_FORA_DO_GOLPE, aplicacaoDoBuff, efeitoNoGolpe } from "../src/combos.js";
import { BUFF_DA_HABILIDADE, ABSORCAO_DO_BUFF, AMORTECIMENTO_DO_BUFF, REGENERACAO_DO_BUFF, regeneracaoDaHabilidade, efeitoDeBuff } from "../src/efeitos.js";

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

/* ---------------- A RÉGUA, em tabela ---------------- */
const MEDIDA_DO_ACERVO = {
  /* O PISO DO ALCANCE. As 12 classes (148) + as subclasses (144) + as
     especializações (216) somam 508 — o número que a etapa mediu. O
     grimório entra por cima, porque magia também passa por
     `efeitoDeBuff`. O piso é 508 e não 593 de propósito: ele guarda o
     ALCANCE da varredura (uma importação que quebre e devolva lista
     vazia fica vermelha aqui em vez de passar verde medindo nada), não
     o tamanho do acervo, que cresce quando alguém escreve habilidade
     nova. */
  pisoDoAcervo: 508,
  /* O PISO DA AMOSTRA DEFENSIVA. Medidas hoje 64 no acervo inteiro. Se
     alguém quebrar a tabela e ela parar de casar com qualquer coisa, a
     varredura passaria verde sem ter nada para medir — este piso é o
     que impede a prova vazia. Conservador: guarda a ordem de grandeza. */
  pisoDeDefensivas: 40,
  /* O TETO QUE A ETAPA PEDIU CRAVADO: nenhuma habilidade catalogada
     como ATAQUE pode ter virado proteção. Hoje são 0, e 0 é a lei — um
     ataque que nasça mudo é o regex tendo pegado longe demais. */
  tetoDeAtaquesVirados: 0,
  /* v9.233 (P3) · O PISO DA FAMÍLIA QUE GANHOU NÚMERO. Medidas hoje 25 das
     64 defensivas — a maior das cinco linhas, e a única com `absorve`. Piso
     conservador pelo mesmo motivo dos outros: se a tabela parar de casar, a
     varredura passaria verde medindo lista vazia. */
  pisoDeAbrigos: 15,
  /* v9.274 (F1) · O PISO DA SEGUNDA FAMÍLIA A COMPRAR ALGUMA COISA. Medidas
     hoje 8 das 64 — a família `amortece` inteira. O piso é 5 pelo mesmo
     motivo do de cima e pelo mesmo cuidado: ele guarda o ALCANCE da
     medição, não o tamanho da família, que cresce quando alguém escreve
     uma defensiva nova. */
  pisoDeAbafos: 5,
  /* v9.275 (H3) · A FAMÍLIA QUE DEVOLVE PV, e é a primeira que tem TETO
     além de piso. Medidas hoje 3 no acervo inteiro — Círculo Sagrado,
     Chamado da Chuva e Renovação. O piso é 3 (a família inteira, não uma
     fração dela) porque aqui a lista pequena é o desenho, não uma amostra:
     se ela esvaziar, o regex parou de casar e a etapa morreu em silêncio.
     E o TETO existe pelo motivo oposto, que é o perigo próprio desta
     família: o classificador lê PALAVRA de cura, e um regex frouxo
     transformaria meio acervo em regeneração. 6 é o dobro do medido —
     cabe uma habilidade nova em cada uma das três classes que já têm
     alguma, e não cabe um acidente de regex. */
  pisoDeRegeneracoes: 3,
  tetoDeRegeneracoes: 6,
};

/* ---------------- O ACERVO ---------------- */
const acervo = [];
const guardar = (h, fonte) => { if (h && h.nome) acervo.push({ hab: h, fonte }); };
for (const c of CLASSES) for (const h of c.habilidades) guardar(h, `classe:${c.nome}`);
for (const [s, hs] of Object.entries(SUBCLASSES)) for (const h of hs) guardar(h, `subclasse:${s}`);
for (const [e, hs] of Object.entries(ESPECIALIZACOES)) for (const h of hs) guardar(h, `especializacao:${e}`);
for (const m of MAGIAS) guardar(m, "grimorio");

/* o herói é fixo e mínimo: `efeitoDeBuff` só o consulta para o ESCOPO
   (físico ou mágico), e o escopo não é o que esta varredura mede. */
const HEROI = { nome: "Régua", classe: "Guerreiro", nivel: 5, efeitos: [] };
const RX_NUMERO_DE_DANO = /\+\d+ de dano/;

sec("1. o alcance — a varredura chegou ao acervo inteiro");
console.log(`  ··  ${acervo.length} habilidades varridas: ${CLASSES.reduce((a, c) => a + c.habilidades.length, 0)} de classe, ${Object.values(SUBCLASSES).flat().length} de subclasse, ${Object.values(ESPECIALIZACOES).flat().length} de especialização e ${MAGIAS.length} do grimório`);
t(`a varredura alcança pelo menos ${MEDIDA_DO_ACERVO.pisoDoAcervo} habilidades`,
  acervo.length >= MEDIDA_DO_ACERVO.pisoDoAcervo, `varreu ${acervo.length}`);

/* ---------------- A CLASSIFICAÇÃO, uma passada só ---------------- */
const defensivas = [], ofensivas = [];
const mentemNoRotulo = [], mentemNaFrase = [], mentemNoNumero = [];
const ataquesVirados = [], nasceramMudas = [];
const porLinha = Object.fromEntries(APLICACAO_DO_BUFF.map((a) => [a.id, 0]));
/* v9.233 (P3): a segunda metade da família defensiva. Recolhida no MESMO
   passe — o acervo já está aberto e `efeitoDeBuff` já foi chamado; uma
   segunda varredura só criaria a chance de as duas discordarem. */
const abrigos = [], abrigosForaDaFaixa = [], absorveForaDaFamilia = [], abrigosSemNumero = [];
/* v9.274 (F1): a terceira metade, e ela entra no MESMO passe pelo argumento
   escrito acima — o acervo já está aberto e `efeitoDeBuff` já foi chamado. */
const abafos = [], abafosForaDaFaixa = [], amorteceForaDaFamilia = [], abafosSemNumero = [];
/* v9.275 (H3): a QUARTA metade, e ela entra no mesmo passe pelo argumento de
   F1 — o acervo já está aberto e `efeitoDeBuff` já foi chamado. É a primeira
   família que não é defensiva: ela não impede o dano, devolve o PV. */
const regeneracoes = [], regenForaDaFaixa = [], curaForaDaFamilia = [], regenSemNumero = [];

for (const { hab, fonte } of acervo) {
  const linha = aplicacaoDoBuff(hab);
  const regen = regeneracaoDaHabilidade(hab);
  const { efeito, extraEscopo } = efeitoDeBuff(hab, HEROI, undefined);
  const onde = `${hab.nome} (${fonte})`;
  /* O CAMPO `curaTurno` É EXCLUSIVO DA FAMÍLIA, pelo mesmo dente de
     `absorve` e `amortece`: ninguém fora dela pode carregá-lo. */
  if (!regen && efeito.curaTurno !== undefined) {
    curaForaDaFamilia.push(`${onde} → curaTurno ${efeito.curaTurno} (não casa com a régua da regeneração)`);
  }
  if (regen) {
    const n = efeito.curaTurno;
    regeneracoes.push({ onde, n, custo: Number(hab.custo) });
    if (!(Number.isInteger(n) && n > 0)) regenSemNumero.push(`${onde} → ${n}`);
    else if (n < REGENERACAO_DO_BUFF.minimo || n > REGENERACAO_DO_BUFF.teto) regenForaDaFaixa.push(`${onde} → ${n}`);
    /* a mesma metade de gameplay da lei iv: o mecanismo fica calado, o
       número que o jogador comprou com PM, não */
    if (Number.isInteger(n) && !extraEscopo.includes(String(n))) {
      regenSemNumero.push(`${onde} → frase muda: "${extraEscopo.trim()}"`);
    }
  }
  /* O CAMPO `absorve` É EXCLUSIVO DA FAMÍLIA. Fora dela ninguém pode tê-lo:
     nem ofensiva, nem as outras quatro promessas defensivas — cada uma
     delas é a sua própria etapa, e o dia em que uma ganhar número é o dia
     em que esta linha fica vermelha e alguém tem de escrever o porquê. */
  if ((!linha || linha.id !== ABSORCAO_DO_BUFF.familia) && efeito.absorve !== undefined) {
    absorveForaDaFamilia.push(`${onde} → absorve ${efeito.absorve} (família "${linha ? linha.id : "nenhuma"}")`);
  }
  /* v9.274 (F1): e o mesmo dente para o campo da família nova. Foi por esta
     linha que a etapa F1 fez este varredor ficar vermelho antes de o
     consertar — era exatamente o que ela existia para fazer. */
  if ((!linha || linha.id !== AMORTECIMENTO_DO_BUFF.familia) && efeito.amortece !== undefined) {
    amorteceForaDaFamilia.push(`${onde} → amortece ${efeito.amortece} (família "${linha ? linha.id : "nenhuma"}")`);
  }
  if (linha) {
    defensivas.push(onde);
    porLinha[linha.id] = (porLinha[linha.id] || 0) + 1;
    if (linha.id === ABSORCAO_DO_BUFF.familia) {
      const n = efeito.absorve;
      abrigos.push({ onde, n, custo: Number(hab.custo) });
      if (!(Number.isInteger(n) && n > 0)) abrigosSemNumero.push(`${onde} → ${n}`);
      else if (n < ABSORCAO_DO_BUFF.minimo || n > ABSORCAO_DO_BUFF.teto) abrigosForaDaFaixa.push(`${onde} → ${n}`);
      /* a frase tem de anunciar o número comprado: o jogador pagou PM por
         ele. É a metade de gameplay da lei iv — o mecanismo fica calado, o
         efeito que o jogador sente, não. */
      if (Number.isInteger(n) && !extraEscopo.includes(String(n))) {
        abrigosSemNumero.push(`${onde} → frase muda: "${extraEscopo.trim()}"`);
      }
    }
    if (linha.id === AMORTECIMENTO_DO_BUFF.familia) {
      const n = efeito.amortece;
      abafos.push({ onde, n, custo: Number(hab.custo) });
      if (!(Number.isInteger(n) && n > 0)) abafosSemNumero.push(`${onde} → ${n}`);
      else if (n < AMORTECIMENTO_DO_BUFF.minimo || n > AMORTECIMENTO_DO_BUFF.teto) abafosForaDaFaixa.push(`${onde} → ${n}`);
      /* a mesma metade de gameplay da lei iv: o mecanismo fica calado, o
         número que o jogador comprou com PM, não */
      if (Number.isInteger(n) && !extraEscopo.includes(String(n))) {
        abafosSemNumero.push(`${onde} → frase muda: "${extraEscopo.trim()}"`);
      }
    }
    if (hab.tipo === "ataque") ataquesVirados.push(`${onde} → ${linha.id}`);
    /* O RÓTULO: quem soma no golpe é quem passa por `efeitoNoGolpe`. */
    if (efeitoNoGolpe(efeito)) mentemNoRotulo.push(`${onde} aplica "${efeito.aplica}"`);
    /* O NÚMERO: uma defensiva não carrega força que ninguém lê. */
    if (Number(efeito.bonus) !== 0) mentemNoNumero.push(`${onde} nasce com bônus ${efeito.bonus}`);
    /* A FRASE: nada de "+N de dano" na linha de quem prometeu abrigo. */
    if (RX_NUMERO_DE_DANO.test(extraEscopo) || / de dano /.test(extraEscopo)) mentemNaFrase.push(`${onde} diz "${extraEscopo.trim()}"`);
  } else if (regen) {
    /* v9.275 (H3): quem regenera não é defensiva NEM ofensiva — é a
       terceira resposta, e ela não existia quando este laço foi escrito.
       Sem este ramo as duas Druidas caíam no `else` e eram acusadas de
       "nascer mudas", que é o avesso do que lhes aconteceu: elas passaram
       a comprar uma coisa que ninguém lhes dava. A prova delas é a seção
       8, com a régua da família própria. */
  } else {
    ofensivas.push(onde);
    /* O INVERSO: o padrão não pode ter mudado para quem não prometeu
       nada. Mesmo rótulo, mesma força mínima, mesma frase com número. */
    const intacta = efeito.aplica === BUFF_DA_HABILIDADE.aplica
      && efeitoNoGolpe(efeito)
      && Number(efeito.bonus) >= BUFF_DA_HABILIDADE.forcaMinima
      && RX_NUMERO_DE_DANO.test(extraEscopo);
    if (!intacta) nasceramMudas.push(`${onde} → aplica "${efeito.aplica}", bônus ${efeito.bonus}, frase "${extraEscopo.trim()}"`);
  }
}

sec("2. quem promete abrigo NÃO entrega golpe");
console.log(`  ··  ${defensivas.length} habilidades do acervo prometem absorver ou proteger`);
console.log(`  ··  por linha da tabela: ${Object.entries(porLinha).map(([id, n]) => `${id} ${n}`).join(" · ")}`);
t(`a amostra defensiva não é vazia (pelo menos ${MEDIDA_DO_ACERVO.pisoDeDefensivas})`,
  defensivas.length >= MEDIDA_DO_ACERVO.pisoDeDefensivas, `achou ${defensivas.length}`);
t("nenhuma delas sai de efeitoDeBuff com rótulo que soma no golpe",
  mentemNoRotulo.length === 0, mentemNoRotulo.slice(0, 6).join(" | "));
t("nenhuma delas nasce com força que ninguém lê",
  mentemNoNumero.length === 0, mentemNoNumero.slice(0, 6).join(" | "));
t("e nenhuma delas promete dano na frase que o jogador lê",
  mentemNaFrase.length === 0, mentemNaFrase.slice(0, 6).join(" | "));
t("toda linha da tabela pega alguma coisa no acervo (regra sem caso é regra morta)",
  Object.values(porLinha).every((n) => n > 0), JSON.stringify(porLinha));
t("e todo rótulo que a tabela declara está fora do golpe",
  APLICACAO_DO_BUFF.every((a) => APLICA_FORA_DO_GOLPE.includes(a.aplica)),
  APLICACAO_DO_BUFF.map((a) => a.aplica).join(","));

sec("3. o dente inverso — o regex não pode ter pegado longe demais");
console.log(`  ··  ${ofensivas.length} habilidades não prometem abrigo nenhum e continuam somando no golpe`);
t(`nenhuma habilidade de tipo "ataque" virou proteção (teto ${MEDIDA_DO_ACERVO.tetoDeAtaquesVirados})`,
  ataquesVirados.length <= MEDIDA_DO_ACERVO.tetoDeAtaquesVirados, ataquesVirados.slice(0, 8).join(" | "));
t("e nenhuma delas nasceu muda — mesmo rótulo, mesma força, mesma frase de antes",
  nasceramMudas.length === 0, nasceramMudas.slice(0, 6).join(" | "));

/* ============================================================
   4. A CHAMADA — nomes lidos à mão do catálogo, fora da tabela

   Os dentes acima comparam o módulo com ele mesmo: quem decide "isto
   promete abrigo" é `aplicacaoDoBuff`, e é ela que está sob suspeita.
   Um regex que parasse de casar com tudo deixaria as três provas
   verdes, com a amostra caindo para zero — e só o piso as seguraria.

   Esta chamada é a leitura INDEPENDENTE: nomes tirados do catálogo à
   mão, com o veredito escrito aqui, não perguntado ao módulo. Se um dia
   "Escudo Arcano" voltar a dar +1 de dano mágico, é esta lista que
   morde primeiro.

   A segunda metade da chamada é a que guarda o VETO
   (`RX_NAO_E_PROTECAO`): "Tiro Perfurante" atravessa escudo, "Punho de
   Pedra" racha escudo e "Marcha Sem Recuo" dá dano extra com um brinde
   de imunidade. As três dizem palavra de proteção e as três estão
   ATACANDO. Sem o veto, as três emudeceriam.
   ============================================================ */
sec("4. a chamada — o veredito escrito à mão, não perguntado ao módulo");
const CHAMADA_DEFENSIVA = [
  "Escudo Arcano", "Postura Defensiva", "Muralha de Gelo", "Escudo da Fé",
  "Pele de Pedra", "Couro Selvagem", "Globo de Invulnerabilidade",
  "Proteção contra Energia", "Corpo de Ferro", "Indomável", "Muralha",
  "Esquiva Ágil", "Cerca Viva",
];
const CHAMADA_OFENSIVA = [
  "Golpe Poderoso", "Bola de Fogo", "Fúria de Batalha", "Investida",
  "Rajada de Fogo", "Projétil Arcano", "Toque Gélido",
  /* os três do veto — palavra de escudo, intenção de golpe */
  "Tiro Perfurante", "Punho de Pedra", "Marcha Sem Recuo",
];
for (const nome of CHAMADA_DEFENSIVA) {
  const f = fichaDaHabilidade(nome);
  if (!f) { t(`"${nome}" existe no catálogo`, false, "ficha não encontrada"); continue; }
  const { efeito, extraEscopo } = efeitoDeBuff(f, HEROI, undefined);
  t(`"${nome}" promete abrigo e não soma no golpe`,
    !efeitoNoGolpe(efeito) && Number(efeito.bonus) === 0 && !RX_NUMERO_DE_DANO.test(extraEscopo),
    `aplica "${efeito.aplica}", bônus ${efeito.bonus}, frase "${extraEscopo.trim()}"`);
}
for (const nome of CHAMADA_OFENSIVA) {
  const f = fichaDaHabilidade(nome);
  if (!f) { t(`"${nome}" existe no catálogo`, false, "ficha não encontrada"); continue; }
  const { efeito, extraEscopo } = efeitoDeBuff(f, HEROI, undefined);
  t(`"${nome}" não promete abrigo e continua levantando o golpe`,
    efeitoNoGolpe(efeito) && efeito.aplica === BUFF_DA_HABILIDADE.aplica
    && Number(efeito.bonus) >= BUFF_DA_HABILIDADE.forcaMinima && RX_NUMERO_DE_DANO.test(extraEscopo),
    `aplica "${efeito.aplica}", bônus ${efeito.bonus}, frase "${extraEscopo.trim()}"`);
}

sec("5. o lixo não custa o turno");
t("aplicacaoDoBuff(null) é null (o caminho do padrão, não um erro)", aplicacaoDoBuff(null) === null);
t("aplicacaoDoBuff({}) é null", aplicacaoDoBuff({}) === null);
t("aplicacaoDoBuff de string solta também classifica", aplicacaoDoBuff("Barreira que absorve o próximo dano") !== null);
t("efeitoNoGolpe(null) não estoura e deixa passar", efeitoNoGolpe(null) === true);
t("efeitoNoGolpe de efeito sem `aplica` deixa passar (save antigo)", efeitoNoGolpe({ nome: "A", bonus: 2 }) === true);
t("e a caixa do rótulo não engana a peneira", efeitoNoGolpe({ aplica: "PROTECAO" }) === false);

/* ============================================================
   6. A PROTEÇÃO PROTEGE — o acervo inteiro, não um exemplo bom (v9.233 · P3)

   P1 pôs o rótulo e a frase honesta; a defensiva nascia com força ZERO. P2
   mediu o preço disso: ligar o piloto a uma família inerte derrubava a
   catraca de equilíbrio — turno pago, nada comprado. P3 deu número à maior
   das cinco linhas, e é o acervo que tem de provar que o número chegou.

   O MOTIVO DE ESTAR AQUI e não só na suíte: é a mesma lição que fez este
   varredor nascer. `teste-efeitos` prova a RÉGUA com custos escolhidos à
   mão; um exemplo bom não prova acervo. Se alguém escrever amanhã uma
   defensiva de 40 PM, é esta passada — e não a suíte — que percebe.
   ============================================================ */
sec("6. a proteção protege — a família que ganhou número, no acervo inteiro");
{
  const ns = abrigos.map((a) => a.n);
  console.log(`  ··  ${abrigos.length} habilidades da família "${ABSORCAO_DO_BUFF.familia}" nascem com abrigo`);
  console.log(`  ··  faixa medida: ${Math.min(...ns)}–${Math.max(...ns)} (tabela: ${ABSORCAO_DO_BUFF.minimo}–${ABSORCAO_DO_BUFF.teto}) · ${ns.filter((n) => n === ABSORCAO_DO_BUFF.teto).length} no teto · ${ns.filter((n) => n === ABSORCAO_DO_BUFF.minimo).length} no piso`);

  t(`a amostra da família não é vazia (pelo menos ${MEDIDA_DO_ACERVO.pisoDeAbrigos})`,
    abrigos.length >= MEDIDA_DO_ACERVO.pisoDeAbrigos, `achou ${abrigos.length}`);
  /* O DENTE CENTRAL DA ETAPA: quem promete absorver, absorve. Um abrigo de
     zero é a doença de P1 de volta — a ficha promete e o sistema não paga. */
  t("toda habilidade da família nasce com abrigo de verdade (nenhuma com zero)",
    abrigosSemNumero.length === 0, abrigosSemNumero.slice(0, 6).join(" | "));
  t("e nenhuma escapa da faixa da tabela — o teto morde o acervo inteiro",
    abrigosForaDaFaixa.length === 0, abrigosForaDaFaixa.slice(0, 6).join(" | "));
  /* O DENTE INVERSO, o que impede o exagero: o campo `absorve` é de UMA
     linha só. As outras quatro — a irmã `amortece` inclusive, que desde F1
     tem número PRÓPRIO e uma chave própria — não podem carregá-lo, nem a
     ofensiva. Duas famílias com número é uma razão a mais para este dente,
     não uma a menos: é aqui que se veria uma vazar para a chave da outra. */
  t("e ninguém fora da família carrega o campo (nem ofensiva, nem as outras quatro)",
    absorveForaDaFamilia.length === 0, absorveForaDaFamilia.slice(0, 6).join(" | "));

  /* O TETO PEGA QUEM ELE FOI ESCRITO PARA PEGAR. Sem ele, a defensiva mais
     cara do acervo comeria mais que um golpe mediano e apagaria a batida —
     é o caso que a tabela cita pelo nome (Globo de Invulnerabilidade, 11 PM,
     22 sem teto). A prova não cita o nome: pergunta ao acervo quem é o mais
     caro da família e confere que ele está preso no teto. */
  const maisCaro = abrigos.reduce((a, b) => ((b.custo || 0) > (a.custo || 0) ? b : a), abrigos[0]);
  const semTeto = Math.round((maisCaro.custo || ABSORCAO_DO_BUFF.custoPadrao) * ABSORCAO_DO_BUFF.porPM);
  console.log(`  ··  a mais cara da família é ${maisCaro.onde}, ${maisCaro.custo} PM — comeria ${semTeto} sem teto, come ${maisCaro.n}`);
  t("a defensiva mais cara do acervo estoura a régua e é presa pelo teto",
    semTeto > ABSORCAO_DO_BUFF.teto && maisCaro.n === ABSORCAO_DO_BUFF.teto,
    `sem teto ${semTeto}, com teto ${maisCaro.n}`);
  t("e mesmo presa ela não apaga um golpe mediano da arena", maisCaro.n < 13);
  /* e o teto não é decorativo do outro lado: alguém tem de ficar ABAIXO
     dele, senão a régua toda virou uma constante disfarçada */
  t("mas o teto não achatou a família inteira — a régua ainda separa barato de caro",
    new Set(ns).size > 1, `todos iguais a ${ns[0]}`);
}

/* ============================================================
   7. O ABAFO ABAFA — a segunda família, no acervo inteiro (v9.274 · F1)

   O molde é o da seção 6, e é de propósito: a etapa F1 prometeu
   ESTABELECER O MOLDE das três famílias que ainda faltam, e um molde que
   não se repete não é molde. Quem der número a `nao_cai`, a `intocado` ou
   a `protege` copia esta seção e troca a tabela.

   O QUE MUDA DA IRMÃ, e é a única coisa: a moeda. `absorve` compra pontos
   e o teto é medido contra um golpe mediano; `amortece` compra PORCENTAGEM
   e o teto é medido contra a DURAÇÃO — por isso o dente do teto aqui não
   pergunta "apagaria uma batida?" e sim "a proporção cabe na faixa que a
   tabela declara?".
   ============================================================ */
sec("7. o abafo abafa — a família que ganhou número em F1, no acervo inteiro");
{
  const ns = abafos.map((a) => a.n);
  console.log(`  ··  ${abafos.length} habilidades da família "${AMORTECIMENTO_DO_BUFF.familia}" nascem com abafo`);
  console.log(`  ··  faixa medida: ${Math.min(...ns)}%–${Math.max(...ns)}% (tabela: ${AMORTECIMENTO_DO_BUFF.minimo}%–${AMORTECIMENTO_DO_BUFF.teto}%) · ${ns.filter((n) => n === AMORTECIMENTO_DO_BUFF.teto).length} no teto · ${ns.filter((n) => n === AMORTECIMENTO_DO_BUFF.minimo).length} no piso`);

  t(`a amostra da família não é vazia (pelo menos ${MEDIDA_DO_ACERVO.pisoDeAbafos})`,
    abafos.length >= MEDIDA_DO_ACERVO.pisoDeAbafos, `achou ${abafos.length}`);
  t("toda habilidade da família nasce com abafo de verdade (nenhuma com zero)",
    abafosSemNumero.length === 0, abafosSemNumero.slice(0, 6).join(" | "));
  t("e nenhuma escapa da faixa da tabela — o teto morde o acervo inteiro",
    abafosForaDaFaixa.length === 0, abafosForaDaFaixa.slice(0, 6).join(" | "));
  t("e ninguém fora da família carrega o campo (nem ofensiva, nem as outras quatro)",
    amorteceForaDaFamilia.length === 0, amorteceForaDaFamilia.slice(0, 6).join(" | "));

  /* O TETO É O DENTE CENTRAL DESTA FAMÍLIA, porque aqui ele é o que separa
     a promessa da ficha ("reduz todo dano pela metade") do que o sistema
     paga. Uma proporção que durasse turnos com 50% seria a Pele de Pedra —
     um gasto de uma vez por luta — ligada a todo golpe da cena. */
  const maisCara = abafos.reduce((a, b) => ((b.custo || 0) > (a.custo || 0) ? b : a), abafos[0]);
  const semTeto = Math.round((maisCara.custo || AMORTECIMENTO_DO_BUFF.custoPadrao) * AMORTECIMENTO_DO_BUFF.porPM);
  console.log(`  ··  a mais cara da família é ${maisCara.onde}, ${maisCara.custo} PM — ${semTeto}% sem teto, ${maisCara.n}% com teto`);
  t("nenhuma delas chega à metade que a ficção promete — o teto é o que paga a duração",
    ns.every((n) => n < 50), `a maior é ${Math.max(...ns)}%`);
  /* e a régua não pode ter virado constante disfarçada: alguém abaixo do teto */
  t("e o teto não achatou a família inteira — a régua ainda separa barato de caro",
    new Set(ns).size > 1, `todos iguais a ${ns[0]}`);
}

/* ============================================================
   8. A CURA TEM RELÓGIO — a família que devolve, no acervo inteiro
   (v9.275 · H3)

   A quarta passada, pelo mesmo motivo das três de cima: `teste-cura-turno`
   prova a régua com custos escolhidos à mão, e um exemplo bom não prova
   acervo. O que só se vê aqui é o dia em que alguém escrever uma
   habilidade nova cuja descrição diga "cura por turno" — ela nasce nesta
   família sem ninguém decidir isso, e é esta passada que a mede.

   E A FAMÍLIA É PEQUENA DE PROPÓSITO: três. O piso é 3 e não 8 como o do
   abafo porque o regex é ANCORADO — um `/cura/` solto transformaria
   metade do acervo em regeneração, e esta seção guarda os dois lados:
   que a família não esvaziou (o regex parou de casar) e que não inchou.
   ============================================================ */
sec("8. a cura tem relógio — a família que devolve PV por turno (H3)");
{
  const ns = regeneracoes.map((r) => r.n);
  console.log(`  ··  ${regeneracoes.length} habilidades regeneram: ${regeneracoes.map((r) => r.onde).join(", ")}`);
  console.log(`  ··  faixa medida: ${Math.min(...ns)}–${Math.max(...ns)} por turno (tabela: ${REGENERACAO_DO_BUFF.minimo}–${REGENERACAO_DO_BUFF.teto})`);

  t(`a amostra da família não é vazia (pelo menos ${MEDIDA_DO_ACERVO.pisoDeRegeneracoes})`,
    regeneracoes.length >= MEDIDA_DO_ACERVO.pisoDeRegeneracoes, `achou ${regeneracoes.length}`);
  t(`e ela não inchou (no máximo ${MEDIDA_DO_ACERVO.tetoDeRegeneracoes} — o regex é ancorado)`,
    regeneracoes.length <= MEDIDA_DO_ACERVO.tetoDeRegeneracoes,
    `${regeneracoes.length}: ${regeneracoes.map((r) => r.onde).join(", ")}`);
  t("toda habilidade da família nasce com cura de verdade (nenhuma com zero)",
    regenSemNumero.length === 0, regenSemNumero.slice(0, 6).join(" | "));
  t("e nenhuma escapa da faixa da tabela — o teto morde o acervo inteiro",
    regenForaDaFaixa.length === 0, regenForaDaFaixa.slice(0, 6).join(" | "));
  t("e ninguém fora da família carrega o campo `curaTurno`",
    curaForaDaFamilia.length === 0, curaForaDaFamilia.slice(0, 6).join(" | "));

  /* O TETO É O DENTE CENTRAL DESTA FAMÍLIA, e o número dele mora no
     catálogo das condições: o relógio da cura nunca corre mais depressa
     que o relógio do dano. Aqui ele é cobrado contra o acervo, não contra
     um exemplo — se alguém escrever uma cura de 12 PM, o teto tem de a
     morder na passada, não na suíte. */
  const maisCara = regeneracoes.reduce((a, b) => ((b.custo || 0) > (a.custo || 0) ? b : a), regeneracoes[0]);
  const semTeto = Math.round(((maisCara.custo || REGENERACAO_DO_BUFF.custoPadrao) * REGENERACAO_DO_BUFF.porPM) / BUFF_DA_HABILIDADE.turnosPadrao);
  console.log(`  ··  a mais cara da família é ${maisCara.onde}, ${maisCara.custo} PM — ${semTeto} por turno sem teto, ${maisCara.n} com teto`);
  t(`nenhuma delas corre mais depressa que o pior dano por turno do catálogo (${REGENERACAO_DO_BUFF.teto})`,
    ns.every((n) => n <= REGENERACAO_DO_BUFF.teto), `a maior é ${Math.max(...ns)}`);
  /* e o rótulo delas está fora do golpe, como o das defensivas: o efeito
     que devolve PV não pode somar ao dano que sai */
  t("e o rótulo da família está declarado fora do golpe",
    APLICA_FORA_DO_GOLPE.includes(REGENERACAO_DO_BUFF.aplica)
    && !efeitoNoGolpe({ aplica: REGENERACAO_DO_BUFF.aplica, bonus: 0 }));
}

console.log(`\n${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
