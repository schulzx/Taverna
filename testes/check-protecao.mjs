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
import { BUFF_DA_HABILIDADE, efeitoDeBuff } from "../src/efeitos.js";

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

for (const { hab, fonte } of acervo) {
  const linha = aplicacaoDoBuff(hab);
  const { efeito, extraEscopo } = efeitoDeBuff(hab, HEROI, undefined);
  const onde = `${hab.nome} (${fonte})`;
  if (linha) {
    defensivas.push(onde);
    porLinha[linha.id] = (porLinha[linha.id] || 0) + 1;
    if (hab.tipo === "ataque") ataquesVirados.push(`${onde} → ${linha.id}`);
    /* O RÓTULO: quem soma no golpe é quem passa por `efeitoNoGolpe`. */
    if (efeitoNoGolpe(efeito)) mentemNoRotulo.push(`${onde} aplica "${efeito.aplica}"`);
    /* O NÚMERO: uma defensiva não carrega força que ninguém lê. */
    if (Number(efeito.bonus) !== 0) mentemNoNumero.push(`${onde} nasce com bônus ${efeito.bonus}`);
    /* A FRASE: nada de "+N de dano" na linha de quem prometeu abrigo. */
    if (RX_NUMERO_DE_DANO.test(extraEscopo) || / de dano /.test(extraEscopo)) mentemNaFrase.push(`${onde} diz "${extraEscopo.trim()}"`);
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

console.log(`\n${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
